# 02 - System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ArkUI Layer                       │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Home    │  │ Proxy Groups │  │   Settings    │  │
│  │  Screen  │  │   Screen     │  │    Screen     │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘  │
│       │               │                  │           │
│  ┌────┴───────────────┴──────────────────┴────────┐  │
│  │              ViewModel Layer                    │  │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────────┐  │  │
│  │  │ VpnState   │ │NodeList  │ │Subscription  │  │  │
│  │  │ ViewModel  │ │ViewModel │ │  ViewModel   │  │  │
│  │  └─────┬──────┘ └────┬─────┘ └──────┬───────┘  │  │
│  └────────┼──────────────┼──────────────┼──────────┘  │
│           │              │              │             │
│  ┌────────┴──────────────┴──────────────┴──────────┐  │
│  │              Service Layer (ArkTS)               │  │
│  │  ┌──────────────┐  ┌────────────────────────┐   │  │
│  │  │ VpnManager   │  │ SubscriptionMgr│ ConfigMgr│  │  │
│  │  │ (Want/IPC)   │  │ (fetch/parse)  │(generate)│  │  │
│  │  └──────┬───────┘  └────────────────────────┘   │  │
│  └─────────┼───────────────────────────────────────┘  │
│            │                                          │
│  ┌─────────┴───────────────────────────────────────┐  │
│  │          NAPI Bridge Layer                       │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │  napi_proxy_engine.cpp                   │   │  │
│  │  │  - startEngine(configPath, tunFd): bool   │   │  │
│  │  │  - stopEngine(): void                    │   │  │
│  │  │  - getTrafficStats(): TrafficStats       │   │  │
│  │  │  - switchProxy(group, name): boolean     │   │  │
│  │  │  - getProxyGroups(): ProxyGroupInfo[]    │   │  │
│  │  └──────────────┬───────────────────────────┘   │  │
│  └─────────────────┼───────────────────────────────┘  │
│                    │                                  │
└────────────────────┼──────────────────────────────────┘
                     │
┌────────────────────┼──────────────────────────────────┐
│    Native Layer    │  (C/C++ .so library)              │
│  ┌─────────────────┴──────────────────────────────┐   │
│  │  Proxy Engine (Mihomo/sing-box core)            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │   │
│  │  │ Protocol │ │  Rule    │ │   DNS          │  │   │
│  │  │ Handlers │ │  Engine  │ │   Resolver     │  │   │
│  │  └──────────┘ └──────────┘ └────────────────┘  │   │
│  └────────────────────────────────────────────────┘   │
│                         │                              │
│                    ┌────┴────┐                         │
│                    │ TUN fd  │                         │
│                    └────┬────┘                         │
└─────────────────────────┼─────────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │  OS Network Stack  │
                │  (HarmonyOS NEXT)  │
                └────────────────────┘
```

## 2. Module Breakdown

### 2.1 Entry Module (`entry`)

The main application module containing:
- `EntryAbility`: Main UI ability (Stage model)
- Page router configuration
- Resource files (i18n, media, theme)

### 2.2 VPN Extension Module (`vpnservice`)

A separate module for the VPN background service:
- `ProxyVpnExtAbility extends VpnExtensionAbility`: VPN lifecycle management
- Declared in `module.json5` as `"type": "vpn"`
- Communicates with entry module via IPC (Want/CommonEvent)

### 2.3 Native Module (`libproxy_engine`)

C/C++ shared library compiled via NDK:
- Wraps the proxy engine core
- Exposes NAPI functions for ArkTS consumption
- Reads TUN fd from VpnConnection
- Handles all proxy protocol logic

## 3. Module Communication

```
┌──────────────┐     Want/IPC      ┌──────────────────┐
│  EntryAbility│ ◄───────────────► │ ProxyVpnExtAbility│
│  (UI)        │  CommonEvent      │ (VPN Service)     │
└──────────────┘                   └────────┬──────────┘
                                            │
                                            │  NAPI calls + TUN fd
                                            │
                                            ▼
                                   ┌──────────────────────────┐
                                   │   libproxy_engine.so      │
                                   │   (proxy engine core)     │
                                   └──────────────────────────┘
```

> **Note**: The native engine runs in the VPN service process only. The UI module
> communicates with the VPN service via IPC (Want/CommonEvent), and the VPN service
> calls the native engine via NAPI. The UI does NOT call NAPI directly.

### Communication Patterns

| From → To | Mechanism | Purpose |
|-----------|-----------|---------|
| UI → VPN Service | `context.startAbility(want)` | Start/stop VPN, switch proxy, change mode |
| VPN Service → UI | `CommonEventManager` | Status updates, traffic stats, errors |
| VPN Service → Native Engine | NAPI function calls | Init tunnel, switch proxy, get stats |
| Native Engine → VPN Service | NAPI callbacks | Engine state changes, protect socket requests |

## 4. Data Flow: Connection Lifecycle

```
1. User taps "Connect"
   │
2. UI sends Want to start ProxyVpnExtAbility
   │
3. ProxyVpnExtAbility.onCreate()
   ├── Creates VpnConnection
   ├── Calls vpnConnection.create(config) → tunFd
   ├── Calls vpnConnection.protect(tunnelSocket)
   └── Passes tunFd + configPath to native engine via NAPI
       │
4. Native engine starts
   ├── Parses config YAML
   ├── Initializes protocol handlers
   ├── Reads packets from TUN fd
   ├── Applies routing rules
   └── Forwards traffic to proxy server
       │
5. VPN Service publishes "CONNECTED" event
   │
6. UI receives event, updates state to connected
```

## 5. File Structure

```
harmony-proxy/
├── AppScope/
│   ├── app.json5                    # App-level config
│   └── resources/
├── entry/                           # Main UI module
│   ├── src/main/
│   │   ├── ets/
│   │   │   ├── entryability/
│   │   │   │   └── EntryAbility.ets
│   │   │   ├── pages/
│   │   │   │   ├── Index.ets        # Home (connect button)
│   │   │   │   ├── Nodes.ets        # Node list & selection
│   │   │   │   └── Settings.ets     # Subscriptions & prefs
│   │   │   ├── viewmodel/
│   │   │   │   ├── VpnStateVM.ets
│   │   │   │   ├── SubscriptionVM.ets
│   │   │   │   └── NodeListVM.ets
│   │   │   ├── model/
│   │   │   │   ├── Subscription.ets
│   │   │   │   ├── ProxyNode.ets
│   │   │   │   └── TrafficStats.ets
│   │   │   ├── services/
│   │   │   │   ├── VpnManager.ets
│   │   │   │   ├── SubscriptionManager.ets
│   │   │   │   └── ConfigManager.ets
│   │   │   └── common/
│   │   │       ├── Constants.ets
│   │   │       └── Logger.ets
│   │   ├── resources/
│   │   └── module.json5
│   └── build-profile.json5
├── vpnservice/                      # VPN Extension module
│   ├── src/main/
│   │   ├── ets/
│   │   │   └── vpnability/
│   │   │       ├── ProxyVpnExtAbility.ets
│   │   │       └── NativeEngine.ets # NAPI wrapper
│   │   ├── cpp/                     # C/C++ proxy engine (native code)
│   │   │   ├── CMakeLists.txt
│   │   │   ├── napi_proxy_engine.cpp    # NAPI bridge
│   │   │   ├── engine_wrapper.cpp       # Engine lifecycle
│   │   │   ├── engine_wrapper.h
│   │   │   └── third_party/
│   │   │       └── mihomo/              # or sing-box core
│   │   └── module.json5             # type: "vpn"
│   └── build-profile.json5
├── specs/                           # SDD documents
├── build-profile.json5
└── README.md
```

## 6. Security Considerations

- **TUN fd access**: Only the VPN service process should hold the TUN fd
- **Config storage**: Proxy credentials stored in app sandbox, not shared preferences
- **Network isolation**: Use `vpnConnection.protect()` to prevent routing loops
- **Certificate pinning**: Consider for subscription URL fetches (post-MVP)
