# SKYWALKER

鸿蒙 HarmonyOS VPN 代理应用，基于鸿蒙原生 VPN 扩展能力开发。

## 功能特性

- **原生 VPN 支持**：基于 HarmonyOS VpnExtensionAbility 实现系统级 VPN 代理
- **TUN 设备支持**：创建虚拟 TUN 网络接口进行流量转发
- **DNS 代理**：自定义 DNS 服务器配置
- **流量统计**：实时监控上下行流量和速率
- **状态管理**：完整的 VPN 连接状态管理（连接中、已连接、断开中、已断开、错误）
- **跨进程通信**：通过 CommonEvent 向 UI 层上报状态和流量信息

## 项目结构

```
├── AppScope/                 # 应用级配置
│   └── resources/            # 应用级资源
├── entry/                    # 主模块（UI 层）
│   └── src/main/ets/         # ArkTS 源码
│       ├── entryability/     # 入口 Ability
│       ├── pages/            # 页面
│       └── viewmodel/        # 视图模型
├── vpnservice/               # VPN 服务模块
│   └── src/main/ets/
│       ├── vpnability/       # VPN Extension Ability
│       │   ├── ProxyVpnExtAbility.ets   # VPN 核心实现
│       │   └── NativeEngine.ets         # 原生引擎桥接
│       └── common/           # 公共常量
└── specs/                    # 规格文件
```

## 技术架构

### VPN 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   UI 层 (Entry) │────▶│ VPN Ext Ability  │────▶│ Native 引擎  │
│                 │◄────│                  │◄────│              │
└─────────────────┘     └──────────────────┘     └──────────────┘
         ▲                        │
         │                        ▼
         │               ┌──────────────────┐
         └───────────────│    TUN 设备      │
                         │  (vpnConnection) │
                         └──────────────────┘
```

### 核心组件

- **ProxyVpnExtAbility**：VPN 扩展 Ability，处理 VPN 生命周期和配置
- **VpnConnection**：鸿蒙系统 VPN 连接管理，创建 TUN 虚拟网卡
- **NativeEngine**：C++ 原生引擎桥接，处理底层代理逻辑
- **CommonEvent**：跨进程事件通信，向 UI 层广播状态和数据

## 配置说明

### TUN 设备配置

```typescript
// 虚拟网卡地址配置
TUN_ADDRESS = '10.10.10.1'      // TUN 设备 IP
TUN_PREFIX_LENGTH = 32           // 子网前缀
TUN_GATEWAY = '0.0.0.0'          // 网关
TUN_MTU = 1500                   // 最大传输单元
TUN_DNS_ADDRESSES = ['8.8.8.8']  // DNS 服务器
```

### 应用信息

- **包名**：`com.skywalker.proxy`
- **版本**：1.0.0
- **API 级别**：12 (minAPIVersion & targetAPIVersion)
- **应用标签**：SKYWALKER

## 开发环境

- **IDE**：DevEco Studio
- **SDK**：HarmonyOS API 12
- **语言**：ArkTS / C++
- **构建工具**：hvigor

## 构建运行

1. 使用 DevEco Studio 打开项目
2. 配置签名证书
3. 连接 HarmonyOS 设备或启动模拟器
4. 点击运行按钮或使用命令行：

```bash
hvigorw assembleHap
```

## 权限要求

应用需要以下系统权限：

- `ohos.permission.INTERNET` - 网络访问
- `ohos.permission.GET_NETWORK_INFO` - 获取网络信息
- `ohos.permission.SET_NETWORK_INFO` - 设置网络信息
- VPN 扩展能力权限

## 状态流转

```
DISCONNECTED ──▶ CONNECTING ──▶ CONNECTED
    ▲              │              │
    │              ▼              │
    └────────── DISCONNECTING ◄───┘
                   │
                   ▼
                ERROR
```

## 事件通信

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `skywalker.vpn.status_changed` | VPN 状态变更 | `status`, `error` |
| `skywalker.vpn.traffic_update` | 流量更新 | `upload`, `download`, `upSpeed`, `downSpeed` |

## 许可证

[LICENSE](./LICENSE)
