# 08 - Testing Strategy

## 1. Overview

Testing a VPN/proxy application on HarmonyOS NEXT presents unique challenges due to platform restrictions and the native/ArkTS split. This document outlines the testing approach for MVP.

## 2. Test Layers

```
┌─────────────────────────────────┐
│   E2E Tests (Manual / Device)   │  ← Real device, real network
├─────────────────────────────────┤
│   Integration Tests             │  ← NAPI bridge, VPN lifecycle
├─────────────────────────────────┤
│   Unit Tests (ArkTS)            │  ← ViewModels, ConfigManager
├─────────────────────────────────┤
│   Unit Tests (Native/C++)       │  ← Engine wrapper, NAPI layer
└─────────────────────────────────┘
```

## 3. Unit Tests (ArkTS)

Framework: HarmonyOS built-in test framework (`@ohos/hypium` — the official unit test framework for ArkTS).

### 3.1 SubscriptionManager Tests

| Test Case | Input | Expected |
|-----------|-------|----------|
| Add valid subscription | URL returning valid Clash YAML | Subscription created with nodes |
| Add subscription with metadata | URL with `subscription-userinfo` header | trafficUsed/trafficTotal/expiresAt parsed |
| Add invalid URL | Unreachable URL | Throws fetch error |
| Add URL with no proxies | YAML without `proxies` field | Throws validation error |
| Refresh subscription | Existing subscription ID | Nodes updated, lastUpdated changed |
| Remove subscription | Valid subscription ID | Subscription and cached file removed |

### 3.2 ConfigManager Tests

| Test Case | Input | Expected |
|-----------|-------|----------|
| Import local YAML | Valid Clash config file | Pseudo-subscription created |
| Generate engine config | Subscription + selected node name | Valid `active_config.yaml` with global mode |
| Generate config with all proxy types | Nodes with ss/vmess/trojan/hy2 | All proxies copied verbatim |

### 3.3 ViewModel Tests

| Test Case | Description |
|-----------|-------------|
| VpnStateVM initial state | Status is DISCONNECTED, no node selected |
| VpnStateVM on connect event | Status transitions to CONNECTED |
| VpnStateVM on error event | Status is ERROR, error message set |
| SubscriptionVM add subscription | Subscription appears in list, auto-activated |
| NodeListVM load nodes | Nodes populated from active subscription |
| NodeListVM select node | Selected node updated, persisted |

## 4. Unit Tests (Native C++)

Framework: GoogleTest (compiled for OHOS target).

### 4.1 NAPI Bridge Tests

| Test Case | Description |
|-----------|-------------|
| StartEngine with valid config | Returns true, state → RUNNING |
| StartEngine with invalid config | Returns false, error reported |
| StopEngine while running | State → IDLE, resources cleaned |
| GetTrafficStats | Returns valid numbers |
| SwitchProxy valid group/name | Returns true |
| SwitchProxy invalid group | Returns false |

## 5. Integration Tests

Run on real device or emulator.

### 5.1 VPN Lifecycle

| Test Case | Steps | Expected |
|-----------|-------|----------|
| Full connect cycle | Import config → Start VPN → Verify → Stop | VPN activates and deactivates cleanly |
| Config switch while connected | Connect → Change config → Confirm | Engine restarts with new config |
| App backgrounding | Connect → Home button → Wait 5min → Resume | VPN still connected |
| Multiple start/stop | Start → Stop → Start → Stop (5 cycles) | No resource leaks, clean state |

### 5.2 Subscription Lifecycle

| Test Case | Steps | Expected |
|-----------|-------|----------|
| Add and connect | Add subscription URL → Select node → Connect | VPN routes traffic through selected node |
| Refresh while connected | Connect → Refresh subscription → Verify | Node list updated, connection maintained if selected node still exists |
| Switch node while connected | Connect → Select different node | VPN restarts with new node seamlessly |

### 5.3 Network Verification

| Test Case | Steps | Expected |
|-----------|-------|----------|
| Traffic through proxy | Connect → visit ipinfo.io | IP matches proxy server |
| All traffic routed | Connect → visit any site | All traffic goes through proxy (global mode) |

## 6. Manual Test Checklist (Pre-Release)

- [ ] Fresh install on device
- [ ] Add subscription URL, verify nodes fetched
- [ ] Import local config file as alternative
- [ ] Select a proxy node
- [ ] Connect to VPN successfully (global proxy)
- [ ] Verify all traffic routes through proxy
- [ ] Switch proxy node while connected
- [ ] Refresh subscription, verify nodes update
- [ ] View traffic statistics updating
- [ ] Background app for 10+ minutes, verify still connected
- [ ] Lock screen, verify still connected
- [ ] Disconnect cleanly
- [ ] Delete config file
- [ ] Dark mode appearance
- [ ] Rotate device (if applicable)

## 7. Performance Benchmarks (MVP Targets)

| Metric | Target |
|--------|--------|
| App launch to interactive | < 2s |
| VPN connect time | < 3s |
| Throughput (proxy) | > 50 Mbps |
| Memory usage (connected) | < 100 MB |
| Battery impact (1hr connected, idle) | < 3% |

## 8. Known Testing Limitations

- No HarmonyOS NEXT emulator with VPN support — real device required
- VPN permission grant is manual (cannot be automated in tests)
- Network condition testing requires physical network changes or a test proxy server
- DevEco Studio test runner may have limitations with extension abilities
