# 05 - Proxy Engine (Native Layer)

## 1. Overview

The proxy engine is the core component that handles actual network traffic. It runs as a native C/C++ shared library (`.so`), compiled via HarmonyOS NDK, and is accessed from ArkTS through NAPI bindings.

For MVP, we wrap an existing proxy engine (Mihomo or sing-box) rather than building from scratch.

## 2. Engine Selection

### 2.1 Candidates

| Engine | Language | License | Size | Notes |
|--------|----------|---------|------|-------|
| Mihomo (ClashMeta) | Go | GPL-3.0 | ~15MB | Most Clash-compatible, proven on HarmonyOS |
| sing-box | Go | GPL-3.0 (with additional terms) | ~12MB | Modern, good performance |
| clash-rs | Rust | Apache-2.0 | ~8MB | Rust rewrite, experimental |

> **License note**: Using GPL-3.0 Mihomo means HarmonyProxy must also be GPL-3.0
> compatible if distributed. Evaluate licensing implications before release.

### 2.2 Decision

**Mihomo** — proven to work on HarmonyOS NEXT (used by ClashNEXT project). Cross-compiled from Go to ARM64 `.so` using `gomobile` or direct `cgo` with NDK toolchain.

## 3. NAPI Interface

### 3.1 Exported Functions

```cpp
// napi_proxy_engine.cpp

/**
 * Initialize and start the proxy engine.
 * @param configPath string - Path to Clash YAML config file
 * @param tunFd number - TUN device file descriptor
 * @returns boolean - true if started successfully
 */
napi_value StartEngine(napi_env env, napi_callback_info info);

/**
 * Stop the proxy engine and clean up resources.
 */
napi_value StopEngine(napi_env env, napi_callback_info info);

/**
 * Get current traffic statistics.
 * @returns { uploadTotal, downloadTotal, uploadSpeed, downloadSpeed }
 */
napi_value GetTrafficStats(napi_env env, napi_callback_info info);

/**
 * Switch the selected proxy in a group.
 * @param groupName string
 * @param proxyName string
 * @returns boolean - true if switch succeeded
 */
napi_value SwitchProxy(napi_env env, napi_callback_info info);

/**
 * Get all proxy groups with their current selections and latencies.
 * @returns ProxyGroupInfo[]
 */
napi_value GetProxyGroups(napi_env env, napi_callback_info info);

/**
 * Trigger latency test for a specific proxy node.
 * @param proxyName string
 * @param testUrl string
 * @param timeout number (ms)
 * @returns number - latency in ms, or -1 if failed
 */
napi_value TestProxyLatency(napi_env env, napi_callback_info info);

/**
 * Register a callback for engine state changes.
 * Called when engine state changes (started, stopped, error).
 * @param callback function(state: string, error?: string)
 */
napi_value RegisterStateCallback(napi_env env, napi_callback_info info);

/**
 * Request the engine to protect a socket fd from VPN routing.
 * The engine calls this via a registered callback that invokes
 * VpnConnection.protect() on the ArkTS side.
 * @param callback function(fd: number): Promise<void>
 */
napi_value RegisterProtectCallback(napi_env env, napi_callback_info info);
```

### 3.2 ArkTS Wrapper

```typescript
// NativeEngine.ets
import engine from 'libproxy_engine.so';

export class NativeEngine {
  // Async operations (engine lifecycle, network I/O)
  static async startEngine(configPath: string, tunFd: number): Promise<boolean> {
    return engine.StartEngine(configPath, tunFd);
  }

  static async stopEngine(): Promise<void> {
    engine.StopEngine();
  }

  static async testLatency(proxyName: string, url: string, timeout: number): Promise<number> {
    return engine.TestProxyLatency(proxyName, url, timeout);
  }

  // Sync operations (fast getters, no I/O)
  static getTrafficStats(): TrafficStats {
    return engine.GetTrafficStats();
  }

  static switchProxy(groupName: string, proxyName: string): boolean {
    return engine.SwitchProxy(groupName, proxyName);
  }

  static getProxyGroups(): ProxyGroupInfo[] {
    return engine.GetProxyGroups();
  }

  static onStateChange(callback: (state: string, error?: string) => void): void {
    engine.RegisterStateCallback(callback);
  }

  static onProtectRequest(callback: (fd: number) => Promise<void>): void {
    engine.RegisterProtectCallback(callback);
  }
}
```

## 4. Cross-Compilation

### 4.1 Build Toolchain

```
Go source (Mihomo)
  → cgo with HarmonyOS NDK sysroot
  → ARM64 .so (OHOS ABI)
  → Packaged in native/ directory
  → CMakeLists.txt links .so + NAPI glue
```

### 4.2 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.16)
project(proxy_engine)

set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})

add_library(proxy_engine SHARED
    src/napi_proxy_engine.cpp
    src/engine_wrapper.cpp
)

target_link_libraries(proxy_engine PUBLIC
    libace_napi.z.so
    libhilog_ndk.z.so
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/mihomo/libmihomo.so
)

target_include_directories(proxy_engine PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/mihomo/include
)
```

### 4.3 Go Cross-Compile Command (Reference)

```bash
# HarmonyOS NEXT is NOT Linux. Go does not have native GOOS=ohos support.
# A patched Go toolchain or build wrapper is required.
# The ClashNEXT project uses a custom build approach — refer to their scripts:
# https://github.com/aspect-aspect/aspect-aspect-aspect-aspect-aspect/aspect

# Typical approach (simplified, actual flags depend on Go fork/patch):
CGO_ENABLED=1 \
CC="${NDK_PATH}/llvm/bin/aarch64-unknown-linux-ohos-clang" \
GOOS=android \
GOARCH=arm64 \
go build -buildmode=c-shared \
  -tags=ohos \
  -o libmihomo.so \
  ./cmd/mihomo
```

> **Important**: Standard Go toolchain does not support OHOS as a target.
> Options include: (1) using `GOOS=android` with OHOS-compatible syscalls,
> (2) a patched Go fork with OHOS support, or (3) the ClashNEXT project's
> build approach. Validate cross-compilation early in development.

## 5. Threading Model

```
Main Thread (ArkTS)
  │
  ├── NAPI call → Engine Thread (native)
  │                 │
  │                 ├── TUN Read Thread
  │                 │    └── Reads packets from TUN fd
  │                 │
  │                 ├── Protocol Handler Threads
  │                 │    └── SOCKS5/HTTP proxy connections
  │                 │
  │                 └── DNS Resolver Thread
  │                      └── Handles DNS queries
  │
  └── UI renders on main thread
```

NAPI calls from ArkTS are synchronous for simple getters (stats, groups) and asynchronous for long operations (start, stop, latency test).

## 6. Engine State Machine

```
         ┌───────────┐
         │   IDLE    │
         └─────┬─────┘
               │ StartEngine()
               ▼
         ┌───────────┐
         │ STARTING  │
         └─────┬─────┘
               │ engine initialized
               ▼
         ┌───────────┐
    ┌──► │  RUNNING  │ ◄─── SwitchProxy() / config updates
    │    └─────┬─────┘
    │          │ StopEngine() or error
    │          ▼
    │    ┌───────────┐
    │    │ STOPPING  │
    │    └─────┬─────┘
    │          │ cleanup done
    │          ▼
    │    ┌───────────┐
    └────│   IDLE    │
         └───────────┘

    Error at any state → ERROR → StopEngine() → IDLE
```
