# 04 - VPN Service Layer

## 1. Overview

The VPN service layer manages the system-level VPN lifecycle using HarmonyOS NEXT's `VpnExtensionAbility` API. It creates a TUN interface, passes the file descriptor to the native proxy engine, and manages the connection state.

## 2. VpnExtensionAbility Lifecycle

### 2.1 Module Declaration (`vpnservice/module.json5`)

```json
{
  "module": {
    "name": "vpnservice",
    "type": "feature",
    "extensionAbilities": [
      {
        "name": "ProxyVpnExtAbility",
        "srcEntry": "./ets/vpnability/ProxyVpnExtAbility.ets",
        "type": "vpn"
      }
    ]
  }
}
```

### 2.2 Ability Lifecycle

```
┌──────────┐   startAbility(want)   ┌──────────────────────┐
│   UI     │ ─────────────────────► │  onCreate(want)      │
│  Module  │                        │  - parse want params │
└──────────┘                        │  - get configPath    │
                                    └──────────┬───────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │ createVpnConnection() │
                                    │ - VpnConnection       │
                                    │ - .create(cfg)→tunFd  │
                                    │ - register protect cb │
                                    └──────────┬───────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │ startEngine()         │
                                    │ (NAPI → native)       │
                                    │ - pass tunFd          │
                                    │ - pass configPath     │
                                    └──────────┬───────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │ Publish CONNECTED     │
                                    │ via CommonEvent       │
                                    └──────────────────────┘

  UI sends stop Want or system calls onDestroy():
  ─────────────────────────────────────────────────
                                    stopEngine() (NAPI)
                                        │
                                        ▼
                                    vpnConnection.destroy()
                                        │
                                        ▼
                                    Publish DISCONNECTED
                                        │
                                        ▼
                                    onDestroy()
```

> **Note**: The exact VpnExtensionAbility lifecycle callbacks may vary by API level.
> Consult the [official API reference](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-net-vpnextension)
> for the target API version. The flow above represents the logical sequence.

## 3. VPN Connection Configuration

### 3.1 TUN Interface Parameters

```typescript
const VPN_CONFIG: VpnConfig = {
  addresses: [{
    address: { address: '10.0.0.2' },  // Virtual IP for TUN
    prefixLength: 24
  }],
  routes: [{
    // Note: interface name is assigned by system, not hardcoded
    destination: { address: '0.0.0.0' },  // Route all traffic
    prefixLength: 0,
    gateway: { address: '10.0.0.1' }
  }],
  dnsAddresses: ['8.8.8.8', '8.8.4.4'],  // DNS via VPN
  mtu: 1500
};
```

### 3.2 Socket Protection

The proxy engine's outbound sockets must be protected from being routed back through the TUN:

```typescript
// Called by native engine via NAPI callback
vpnConnection.protect(socketFd): Promise<void>
```

## 4. VpnManager (ArkTS Service)

### 4.1 Interface

```typescript
// VpnManager.ets
class VpnManager {
  /**
   * Start VPN service with given config file path.
   * Sends a Want to start ProxyVpnExtAbility.
   */
  async start(configPath: string): Promise<void>;

  /**
   * Stop VPN service.
   * Sends a Want to stop ProxyVpnExtAbility.
   */
  async stop(): Promise<void>;

  /**
   * Get current VPN connection status.
   */
  getStatus(): VpnStatus;

  /**
   * Register callback for status changes.
   */
  onStatusChange(callback: (status: VpnStatus) => void): void;

  /**
   * Unregister status change callback.
   */
  offStatusChange(): void;
}
```

### 4.2 IPC Protocol (Want extras)

| Action | Want Parameter | Value |
|--------|---------------|-------|
| Start  | `action` | `"proxy.vpn.START"` |
|        | `configPath` | Absolute path to active config YAML |
| Stop   | `action` | `"proxy.vpn.STOP"` |

### 4.3 Status Events (CommonEvent)

| Event | Data |
|-------|------|
| `proxy.vpn.STATUS_CHANGED` | `{ status: VpnStatus, error?: string }` |
| `proxy.vpn.TRAFFIC_UPDATE` | `{ upload: number, download: number, upSpeed: number, downSpeed: number }` |

Traffic updates are published every 1 second while connected.

## 5. Error Handling

| Error Scenario | Handling |
|----------------|----------|
| VPN permission denied | Show permission request dialog, guide to settings |
| TUN creation fails | Retry once, then show error with details |
| Engine crash | Catch in onDisconnect, publish ERROR status, offer restart |
| Config parse error | Publish ERROR with parse error message before destroying |
| Network unavailable | Engine handles reconnection; UI shows "Waiting for network" |

## 6. Foreground Notification

While VPN is active, show a persistent notification:
- **Title**: "HarmonyProxy"
- **Content**: "Connected via [node-name] · ↑ X MB ↓ Y MB"
- **Action**: Tap to open app

This also helps prevent the system from killing the VPN service.
