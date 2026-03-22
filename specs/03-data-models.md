# 03 - Data Models

## 1. Subscription Model

The primary way to add proxy nodes in MVP is via subscription URL.

### 1.1 Subscription

```typescript
// Subscription.ets
interface Subscription {
  id: string;                      // UUID, auto-generated
  name: string;                    // Display name (from subscription or user-defined)
  url: string;                     // Subscription URL
  nodes: ProxyNode[];              // Parsed proxy nodes from this subscription
  lastUpdated?: number;            // Unix timestamp of last successful fetch
  expiresAt?: number;              // Subscription expiry (from response header or YAML)
  trafficUsed?: number;            // Bytes used (from response header, if provided)
  trafficTotal?: number;           // Total bytes allowed (from response header, if provided)
  error?: string;                  // Last fetch error message
}
```

### 1.2 Subscription Response Parsing

Subscription URLs return Clash-format YAML. Common providers also include
metadata in HTTP response headers:

| Header | Maps to | Example |
|--------|---------|---------|
| `subscription-userinfo` | trafficUsed, trafficTotal, expiresAt | `upload=1234; download=5678; total=10737418240; expire=1735689600` |
| `content-disposition` | name (fallback) | `attachment; filename="my-nodes.yaml"` |
| `profile-update-interval` | (post-MVP: auto-update) | `24` (hours) |

### 1.3 Subscription Fetch Flow

```
User enters subscription URL
  │
  ▼
HTTP GET url (with User-Agent header)
  │
  ├── Parse response headers → extract subscription metadata
  │
  ├── Parse response body as Clash YAML
  │   ├── Extract "proxies" array → ProxyNode[]
  │   └── Ignore proxy-groups / rules (MVP: global proxy only)
  │
  ├── Save parsed YAML to local file for engine consumption
  │
  └── Update Subscription model in persistence
```

## 2. Configuration Model (Clash-Compatible YAML)

The app reads Clash-format YAML configuration files from subscriptions or local import.
In MVP, only the `proxies` section is used — the engine runs in global proxy mode.

### 2.1 Root Config (Subset for MVP)

```typescript
// ProxyConfig.ets
// Note: Clash YAML uses kebab-case keys. The native parser maps them to camelCase.
// MVP only extracts proxies. proxy-groups and rules are passed through to the
// engine but not surfaced in UI.
interface ProxyConfig {
  proxies: ProxyNode[];            // YAML: "proxies" — all available proxy nodes
  // Passed to engine as-is, not used by MVP UI:
  dns?: DnsConfig;                 // YAML: "dns"
  proxyGroups?: ProxyGroup[];      // YAML: "proxy-groups" (post-MVP UI)
  rules?: Rule[];                  // YAML: "rules" (post-MVP UI)
}
```

### 2.2 Proxy Node

```typescript
// ProxyNode.ets
// The ProxyNode interface covers common fields. Protocol-specific fields
// are opaque to the ArkTS layer — the full YAML proxy definition is passed
// to the Mihomo engine which handles all protocol details.
interface ProxyNode {
  name: string;                    // Display name
  type: string;                    // Protocol type (ss, vmess, trojan, socks5, http, etc.)
  server: string;                  // Server address
  port: number;                    // Server port
  // All other protocol-specific fields are handled by the engine.
  // ArkTS only needs name/type/server/port for display purposes.
}
```

> **Design note**: MVP does not filter by proxy type. Since we use Mihomo as the
> engine, all protocols it supports (SS, VMess, VLESS, Trojan, Hysteria, TUIC,
> SOCKS5, HTTP, etc.) work out of the box. The ArkTS layer only reads display fields.

### 2.3 Proxy Group / Routing Rule (Post-MVP)

Proxy groups and routing rules are present in Clash YAML but not surfaced in
MVP UI. The full YAML is passed to the engine. These interfaces are defined
here for forward compatibility:

```typescript
// Post-MVP — included in config pass-through to engine
interface ProxyGroup {
  name: string;
  type: string;                    // select, url-test, fallback, etc.
  proxies: string[];
}

interface Rule {
  type: string;                    // DOMAIN, DOMAIN-SUFFIX, IP-CIDR, MATCH, etc.
  matcher: string;
  target: string;                  // Proxy group name, DIRECT, or REJECT
}
```

### 2.4 DNS Config

```typescript
// DnsConfig.ets
interface DnsConfig {
  enable: boolean;
  listen: string;                  // e.g., "0.0.0.0:53"
  nameserver: string[];            // DNS servers
  fallback?: string[];             // Fallback DNS servers
}
```

## 2. Runtime Models

### 2.1 VPN State

```typescript
// VpnState.ets
interface VpnState {
  status: VpnStatus;
  connectedSince?: Date;           // Connection start time
  currentNode?: string;            // Active proxy node name
  error?: string;                  // Last error message
}

enum VpnStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error'
}
```

### 2.2 Traffic Statistics

```typescript
// TrafficStats.ets
interface TrafficStats {
  uploadTotal: number;             // Total bytes uploaded
  downloadTotal: number;           // Total bytes downloaded
  uploadSpeed: number;             // Current upload speed (bytes/sec)
  downloadSpeed: number;           // Current download speed (bytes/sec)
}
```

### 2.3 Connection Entry (for future dashboard)

```typescript
// Connection.ets (post-MVP, defined here for NAPI interface stability)
interface ConnectionEntry {
  id: string;
  sourceIP: string;
  sourcePort: number;
  destinationIP: string;
  destinationPort: number;
  host: string;                    // SNI or HTTP Host
  network: 'tcp' | 'udp';
  matchedRule: string;
  proxyChain: string[];
  startTime: number;               // Unix timestamp
  uploadBytes: number;
  downloadBytes: number;
}
```

## 3. Persistence Models

### 3.1 App Preferences

```typescript
// AppPreferences.ets
interface AppPreferences {
  activeSubscriptionId?: string;   // Currently active subscription ID
  selectedNodeName?: string;       // Currently selected proxy node name
  autoConnect: boolean;            // Connect on app launch
  theme: 'light' | 'dark' | 'system';
}
```

Storage: HarmonyOS `@ohos.data.preferences` (key-value store).

### 3.2 Subscription Persistence

```typescript
// Subscriptions stored as JSON array in preferences
// Key: "subscriptions" → JSON string of Subscription[]
```

### 3.3 Config File Storage

```
{context.filesDir}/
├── subscriptions/
│   ├── {subscription-id}.yaml    # Raw YAML from subscription URL
│   └── ...
├── configs/
│   ├── local-import.yaml         # Locally imported YAML files
│   └── ...
└── active_config.yaml            # Generated config for engine consumption
```

The `active_config.yaml` is generated at connect time by combining:
- The selected proxy node
- Engine defaults (mode: global, dns settings)
- The full proxy list from the active subscription

## 4. YAML Parsing

### 4.1 Subscription YAML Parsing (ArkTS side)

The ArkTS layer needs to parse subscription YAML to extract `proxies` for display.
This is a lightweight parse — only reading the `proxies` array for name/type/server/port.

Options:
- **js-yaml** or compatible YAML parser for ArkTS
- **Native-side parsing** via yaml-cpp, returning structured data via NAPI

Decision: Parse the `proxies` list on the **ArkTS side** for UI display (lightweight).
The **full YAML** is saved to disk and passed to the engine as-is — the engine
handles its own complete parsing.

### 4.2 Engine Config Generation

At connect time, generate `active_config.yaml` with:

```yaml
# Auto-generated — do not edit
mode: global                      # MVP: always global
allow-lan: false
log-level: warning

dns:
  enable: true
  listen: 0.0.0.0:53
  nameserver:
    - 8.8.8.8
    - 1.1.1.1

proxies:
  # ... all proxies from subscription YAML

# MVP: single catch-all rule
rules:
  - MATCH,{selected-node-name}
```
