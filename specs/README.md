# HarmonyProxy

A network proxy application for HarmonyOS NEXT (5.0+), similar to Clash.

Built using **Specification-Driven Development (SDD)** — specs first, code second.

## Development Approach

1. **Phase 1**: Write specifications (`/specs`)
2. **Phase 2**: Implement based on specs
3. **Phase 3**: Validate implementation against specs

## Project Structure

```
harmony-proxy/
├── specs/                    # SDD Specification Documents
│   ├── 01-overview.md        # Project overview & goals
│   ├── 02-architecture.md    # System architecture
│   ├── 03-data-models.md     # Data structures & models
│   ├── 04-vpn-service.md     # VPN service layer spec
│   ├── 05-proxy-engine.md    # Proxy engine (native) spec
│   ├── 06-config-manager.md  # Configuration management spec
│   ├── 07-ui-screens.md      # UI screens & navigation spec
│   └── 08-testing.md         # Testing strategy
├── src/                      # Source code (Phase 2)
└── README.md
```

## Tech Stack

- **Language**: ArkTS (frontend) + C/C++ via NAPI (proxy engine)
- **UI**: ArkUI (declarative, Stage model)
- **IDE**: DevEco Studio 5.0+
- **VPN API**: `@ohos.net.vpnExtension` (VpnExtensionAbility)
- **Target**: HarmonyOS NEXT 5.0+ (API 12+)
