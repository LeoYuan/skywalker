# 01 - Project Overview

## 1. Product Vision

**HarmonyProxy** is a native HarmonyOS NEXT network proxy application that provides rule-based traffic routing, similar to Clash/Mihomo. It allows users to configure proxy servers, define routing rules, and manage network traffic through a clean, native ArkUI interface.

## 2. Target Platform

| Attribute       | Value                                    |
|-----------------|------------------------------------------|
| OS              | HarmonyOS NEXT 5.0+                      |
| Min API Level   | API 12                                   |
| App Model       | Stage Model                              |
| Languages       | ArkTS (UI/logic) + C/C++ (proxy engine)  |
| Device Types    | Phone (MVP), Tablet (post-MVP)           |

## 3. MVP Scope

### In Scope (MVP)

- **VPN Service**: System-level VPN via `VpnExtensionAbility` with TUN device
- **Proxy Mode**: Global proxy only (all traffic routed through proxy)
- **Proxy Protocols**: All protocols supported by Mihomo engine (SS/VMess/Trojan/SOCKS5/HTTP etc.)
- **Subscription Support**: Import proxy nodes via subscription URL (Clash YAML format)
  - Fetch & parse subscription URL → extract proxy nodes
  - Manual refresh to update nodes
- **Configuration**: Subscription URL or local YAML file import
- **UI Screens**:
  - Home: One-tap connect/disconnect, current status, traffic stats
  - Nodes: View proxy nodes from subscription, select active node
  - Settings: Add/manage subscription URLs, import local config

### Out of Scope (Post-MVP)

- Rule-based routing (DIRECT/PROXY/REJECT per domain/IP)
- Proxy groups with strategies (url-test, fallback, load-balance)
- Subscription auto-update on interval
- Advanced rule types (IP-CIDR, GEOIP, PROCESS-NAME)
- Dashboard with real-time connection logs
- Split tunneling (per-app proxy)
- Multi-language / i18n
- Tablet / foldable adaptive layouts

## 4. Key Technical Decisions

### 4.1 Architecture Pattern

**MVVM** with clean separation:
- **View**: ArkUI declarative components
- **ViewModel**: ArkTS state management (`@State`, `@Prop`, `@Link`, `@Observed`+`@ObjectLink`)
- **Model**: Data models + native proxy engine bridge

### 4.2 Proxy Engine Strategy

Two options evaluated:

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A. Wrap existing engine | Compile Mihomo/sing-box as `.so` via NDK | Battle-tested, full protocol support | Large binary, Go/Rust cross-compile complexity |
| B. Custom lightweight engine | Write minimal SOCKS5/HTTP proxy in C | Small footprint, full control | More work, less protocol coverage |

**Decision: Option A (wrap Mihomo/sing-box)** for MVP. The existing engines handle the hard protocol and routing logic. We bridge via NAPI.

### 4.3 Configuration Format

Use **Clash-compatible YAML** as the config format. This maximizes compatibility with existing proxy providers and user familiarity.

### 4.4 Background Persistence

HarmonyOS NEXT aggressively manages background processes. Strategy:
- `VpnExtensionAbility` itself has system-level persistence while active
- Use foreground notification to indicate VPN is running
- Investigate PiP (Picture-in-Picture) workaround if needed (as used by ClashNEXT)

## 5. Success Criteria (MVP)

- [ ] User can add a subscription URL and fetch proxy nodes
- [ ] User can import a local Clash YAML config file as alternative
- [ ] User can select a proxy node from the fetched list
- [ ] User can one-tap connect/disconnect VPN (global proxy)
- [ ] All traffic is routed through the selected proxy node
- [ ] App survives backgrounding for at least 30 minutes
- [ ] Clean, responsive UI on phone form factor

## 6. References

- [HarmonyOS VpnExtension API](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-net-vpnextension)
- [Clash-for-Harmony-NEXT](https://github.com/WangLH0106/Clash-for-Harmony-NEXT)
- [Clash Config Specification](https://dreamacro.github.io/clash/)
- [HarmonyOS NAPI Guide](https://developer.huawei.com/consumer/en/doc/harmonyos-guides/napi-introduction)
