# 07 - UI Screens & Navigation

## 1. Navigation Structure

```
┌─────────────────────────────────────────┐
│              Tab Navigation             │
│  ┌──────────┬──────────┬──────────────┐ │
│  │   Home   │  Nodes   │  Settings    │ │
│  │          │          │              │ │
│  └──────────┴──────────┴──────────────┘ │
└─────────────────────────────────────────┘
```

Three main tabs using ArkUI `Tabs` component.

## 2. Home Screen

### 2.1 Layout

```
┌──────────────────────────────────┐
│  HarmonyProxy                    │
├──────────────────────────────────┤
│                                  │
│         ┌──────────────┐         │
│         │              │         │
│         │     ⬤ / ○    │         │  ← Large connect button
│         │              │         │     (green when connected)
│         │              │         │
│         └──────────────┘         │
│                                  │
│          Tap to Connect          │  ← Status label
│                                  │
│  ┌────────────────────────────┐  │
│  │  ▶ Tokyo-01 (ss)          │  │  ← Selected node (tap to switch)
│  │    example.com:443         │  │     shows name, type, server
│  └────────────────────────────┘  │
│                                  │
├──────────────────────────────────┤  (shown when connected)
│     Connected · 01:23:45         │  ← Duration
├──────────────────────────────────┤
│  ↑ Upload      │  ↓ Download     │
│  1.2 MB/s      │  3.4 MB/s       │  ← Live speed
│  45.6 MB       │  123.4 MB       │  ← Total traffic
├──────────────────────────────────┤
│  📡 My Subscription              │  ← Active subscription name
│  Expires: 2025-12-31 │ 45% used  │  ← Subscription metadata
└──────────────────────────────────┘
```

### 2.2 Component Breakdown

| Component | ArkUI Widget | State Source |
|-----------|-------------|--------------|
| Connect button | Custom `Button` + animation | `VpnStateVM.status` |
| Status label | `Text` | `VpnStateVM.status` |
| Selected node card | `Row` in card | `VpnStateVM.selectedNode` |
| Duration | `Text` | `VpnStateVM.connectedSince` (computed) |
| Speed display | `Text` + `Row` | `VpnStateVM.trafficStats` (1s refresh) |
| Subscription info | `Text` | `SubscriptionVM.active` |

### 2.3 States

```
┌─────────────────────────┐
│  No Subscription        │  Button disabled, "Add a subscription to get started"
├─────────────────────────┤
│  Disconnected           │  Button shows ○, "Tap to Connect"
├─────────────────────────┤
│  Connecting             │  Button pulses, "Connecting..."
├─────────────────────────┤
│  Connected              │  Button shows ⬤ (green), "Connected · 00:01:23"
│                         │  Traffic stats visible
├─────────────────────────┤
│  Disconnecting          │  Button fading, "Disconnecting..."
├─────────────────────────┤
│  Error                  │  Button shows ⬤ (red), error message below
└─────────────────────────┘
```

### 2.4 Interactions

| Action | Behavior |
|--------|----------|
| Tap connect (disconnected) | Generate config → Start VPN → Show connecting animation |
| Tap connect (connected) | Stop VPN → Show disconnecting animation |
| Tap connect (no subscription) | Navigate to Settings tab |
| Tap selected node card | Navigate to Nodes tab |

## 3. Nodes Screen

### 3.1 Layout

```
┌──────────────────────────────────┐
│  Nodes                  [↻]     │  ← Refresh button (re-fetch subscription)
├──────────────────────────────────┤
│  📡 My Subscription              │  ← Subscription name
│  Updated: 2025-06-01 14:30       │  ← Last updated time
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │ ● Tokyo-01       ss  45ms │  │  ← Selected (radio style)
│  ├────────────────────────────┤  │
│  │ ○ Tokyo-02       ss  62ms │  │
│  ├────────────────────────────┤  │
│  │ ○ Singapore      vmess —  │  │  ← Untested latency
│  ├────────────────────────────┤  │
│  │ ○ HongKong       trojan — │  │
│  ├────────────────────────────┤  │
│  │ ○ US-West        ss  180ms│  │
│  ├────────────────────────────┤  │
│  │ ○ US-East        hy2  —   │  │
│  └────────────────────────────┘  │
│                                  │
│         [Test All Latency]       │  ← Test latency for all nodes
│                                  │
│  No subscription?                │
│  Go to Settings to add one.      │  ← Empty state
└──────────────────────────────────┘
```

### 3.2 Node List Item

Each row displays:
- Radio indicator (selected / not selected)
- Node name
- Protocol type badge (ss, vmess, trojan, hy2, socks5, http, etc.)
- Latency (if tested)

### 3.3 Interactions

| Action | Behavior |
|--------|----------|
| Tap a node | Select it; if connected, restart VPN with new node |
| Tap [↻] refresh | Re-fetch subscription URL, update node list |
| Tap "Test All Latency" | Test each node's latency sequentially, show results |
| Long press node | Show details sheet (server, port, full type info) |

### 3.4 Latency Display Rules

| Latency | Color | Display |
|---------|-------|---------|
| 0-100ms | Green | `45ms` |
| 100-300ms | Orange | `180ms` |
| 300ms+ | Red | `450ms` |
| Failed | Red | `timeout` |
| Untested | Gray | `—` |
| Testing | Gray | spinner |

## 4. Settings Screen

### 4.1 Layout

```
┌──────────────────────────────────┐
│  Settings                        │
├──────────────────────────────────┤
│                                  │
│  Subscriptions                   │
│  ┌────────────────────────────┐  │
│  │ + Add Subscription         │  │  ← Opens input dialog
│  ├────────────────────────────┤  │
│  │ ● My Subscription     [✕] │  │  ← Active (radio)
│  │   45% traffic used         │  │
│  ├────────────────────────────┤  │
│  │ ○ Work Proxy          [✕] │  │  ← Inactive
│  │   Expires: 2025-12-31     │  │
│  └────────────────────────────┘  │
│                                  │
│  Import                          │
│  ┌────────────────────────────┐  │
│  │ Import Local Config   [📁] │  │  ← File picker
│  └────────────────────────────┘  │
│                                  │
│  General                         │
│  ┌────────────────────────────┐  │
│  │ Auto Connect     [toggle]  │  │
│  ├────────────────────────────┤  │
│  │ Theme           [system ▼] │  │
│  └────────────────────────────┘  │
│                                  │
│  About                           │
│  ┌────────────────────────────┐  │
│  │ Version             1.0.0  │  │
│  │ Engine          Mihomo 1.x │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### 4.2 Add Subscription Dialog

```
┌──────────────────────────────────┐
│  Add Subscription                │
│                                  │
│  Name (optional)                 │
│  ┌────────────────────────────┐  │
│  │ My Subscription            │  │
│  └────────────────────────────┘  │
│                                  │
│  Subscription URL                │
│  ┌────────────────────────────┐  │
│  │ https://example.com/sub    │  │
│  └────────────────────────────┘  │
│                                  │
│  [Cancel]              [Add ▶]   │
│                                  │
│  ── or paste from clipboard ──   │
│                                  │
└──────────────────────────────────┘
```

On "Add":
1. Show loading spinner
2. Fetch URL → parse YAML → validate
3. On success: close dialog, show subscription in list, auto-activate
4. On error: show error message in dialog, keep dialog open

### 4.3 Interactions

| Action | Behavior |
|--------|----------|
| Tap "Add Subscription" | Show input dialog |
| Tap subscription radio | Set as active subscription, reload nodes |
| Tap [✕] on subscription | Confirm delete → remove subscription and cached YAML |
| Tap "Import Local Config" | Open file picker → validate → add as pseudo-subscription |
| Toggle Auto Connect | Save to preferences |
| Change Theme | Apply immediately, save to preferences |

## 5. Theme & Styling

### 5.1 Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `primary` | `#2563EB` | `#60A5FA` | Buttons, active states |
| `surface` | `#FFFFFF` | `#1C1C1E` | Card backgrounds |
| `background` | `#F2F2F7` | `#000000` | Page background |
| `textPrimary` | `#1C1C1E` | `#FFFFFF` | Main text |
| `textSecondary` | `#8E8E93` | `#8E8E93` | Subtitle text |
| `connected` | `#34C759` | `#30D158` | Connected state |
| `disconnected` | `#8E8E93` | `#636366` | Disconnected state |
| `error` | `#FF3B30` | `#FF453A` | Error state |

### 5.2 Typography

Follow HarmonyOS default font scales:
- **Title**: 20fp, Medium weight
- **Subtitle**: 17fp, Regular
- **Body**: 15fp, Regular
- **Caption**: 13fp, Regular

### 5.3 Connect Button Animation

- **Disconnected → Connecting**: Pulse animation (scale 1.0 → 1.05, 0.8s ease-in-out, repeat)
- **Connecting → Connected**: Quick scale pop (1.0 → 1.1 → 1.0, 0.3s)
- **Connected → Disconnecting**: Fade opacity (1.0 → 0.7, 0.5s)

## 6. Responsive Considerations (MVP)

MVP targets phone only. Minimum width: 360vp.
All layouts use `Column` / `Row` with percentage or `vp` units for proper scaling.
Font sizes use `fp` units (font pixels, scales with system font size settings).
