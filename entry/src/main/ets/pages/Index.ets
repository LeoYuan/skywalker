import { VpnStateVM } from '../viewmodel/VpnStateVM';
import { SubscriptionVM } from '../viewmodel/SubscriptionVM';
import { NodeListVM } from '../viewmodel/NodeListVM';
import { VpnStatus } from '../model/VpnState';
import { Nodes } from './Nodes';
import { Settings } from './Settings';
import { SubscriptionManager } from '../services/SubscriptionManager';
import { ConfigManager } from '../services/ConfigManager';
import { VpnManager } from '../services/VpnManager';
import { ServiceLocator } from '../common/ServiceLocator';
import { Logger } from '../common/Logger';

@Entry
@Component
struct Index {
  @State currentTab: number = 0;
  @State vpnState: VpnStateVM = new VpnStateVM();
  @State subscriptionVM: SubscriptionVM = new SubscriptionVM();
  @State nodeListVM: NodeListVM = new NodeListVM();
  private subscriptionManager: SubscriptionManager | undefined;
  private configManager: ConfigManager | undefined;
  private vpnManager: VpnManager | undefined;

  aboutToAppear(): void {
    this.subscriptionManager = ServiceLocator.getSubscriptionManager() ?? undefined;
    this.configManager = ServiceLocator.getConfigManager() ?? undefined;
    this.vpnManager = ServiceLocator.getVpnManager() ?? undefined;

    if (this.subscriptionManager) {
      const subs = this.subscriptionManager.getSubscriptions();
      this.subscriptionVM.setSubscriptions(subs);
      if (subs.length > 0) {
        this.subscriptionVM.setActive(subs[0].id);
        this.nodeListVM.setNodes(subs[0].nodes);
        if (subs[0].nodes.length > 0) {
          this.nodeListVM.selectNode(subs[0].nodes[0].name);
        }
      }
    }

    if (this.vpnManager) {
      this.vpnManager.onStatusChange((status: VpnStatus, error?: string) => {
        this.vpnState.updateStatus(status, error);
      });
      this.vpnManager.onTrafficUpdate((stats) => {
        this.vpnState.updateTraffic(stats);
      });
    }
  }

  build() {
    Tabs({ barPosition: BarPosition.End, index: this.currentTab }) {
      TabContent() {
        this.HomeContent()
      }
      .tabBar(this.TabBarItem('Home', 0))

      TabContent() {
        Nodes({
          nodeListVM: this.nodeListVM,
          subscriptionVM: this.subscriptionVM,
          vpnState: this.vpnState
        })
      }
      .tabBar(this.TabBarItem('Nodes', 1))

      TabContent() {
        Settings({
          subscriptionVM: this.subscriptionVM,
          nodeListVM: this.nodeListVM
        })
      }
      .tabBar(this.TabBarItem('Settings', 2))
    }
    .onChange((index: number) => {
      this.currentTab = index;
    })
    .barMode(BarMode.Fixed)
    .backgroundColor('#F2F2F7')
  }

  @Builder
  TabBarItem(title: string, index: number) {
    Column() {
      Text(title)
        .fontSize(13)
        .fontColor(this.currentTab === index ? '#2563EB' : '#8E8E93')
        .fontWeight(this.currentTab === index ? FontWeight.Medium : FontWeight.Regular)
    }
    .width('100%')
    .height(50)
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  HomeContent() {
    Column() {
      // Title
      Text('SkyWalker')
        .fontSize(20)
        .fontWeight(FontWeight.Medium)
        .width('100%')
        .textAlign(TextAlign.Start)
        .padding({ left: 20, top: 16, bottom: 8 })

      // Connect Button
      Column() {
        Button({ type: ButtonType.Circle }) {
          Text(this.vpnState.isConnected ? 'ON' : 'OFF')
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
        }
        .width(120)
        .height(120)
        .backgroundColor(this.connectButtonColor())
        .enabled(!this.vpnState.isTransitioning && this.subscriptionVM.hasSubscriptions)
        .onClick(() => {
          this.handleConnectTap();
        })

        Text(this.vpnState.statusLabel)
          .fontSize(17)
          .fontColor('#1C1C1E')
          .margin({ top: 12 })

        if (this.vpnState.isConnected && this.vpnState.durationText) {
          Text(this.vpnState.durationText)
            .fontSize(15)
            .fontColor('#8E8E93')
            .margin({ top: 4 })
        }
      }
      .width('100%')
      .alignItems(HorizontalAlign.Center)
      .padding({ top: 40, bottom: 24 })

      // Selected Node Card
      if (this.nodeListVM.selectedNode) {
        Row() {
          Column() {
            Text(`${this.nodeListVM.selectedNodeName} (${this.nodeListVM.selectedNode!.type})`)
              .fontSize(15)
              .fontWeight(FontWeight.Medium)
              .fontColor('#1C1C1E')
            Text(`${this.nodeListVM.selectedNode!.server}:${this.nodeListVM.selectedNode!.port}`)
              .fontSize(13)
              .fontColor('#8E8E93')
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)

          Text('>')
            .fontSize(17)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .padding(16)
        .margin({ left: 20, right: 20 })
        .backgroundColor(Color.White)
        .borderRadius(12)
        .onClick(() => {
          this.currentTab = 1; // Navigate to Nodes tab
        })
      } else if (!this.subscriptionVM.hasSubscriptions) {
        Text('Add a subscription to get started')
          .fontSize(15)
          .fontColor('#8E8E93')
          .width('100%')
          .textAlign(TextAlign.Center)
          .padding(20)
      }

      // Traffic Stats (shown when connected)
      if (this.vpnState.isConnected) {
        Row() {
          Column() {
            Text('Upload')
              .fontSize(13)
              .fontColor('#8E8E93')
            Text(this.formatSpeed(this.vpnState.uploadSpeed))
              .fontSize(17)
              .fontWeight(FontWeight.Medium)
              .fontColor('#1C1C1E')
            Text(this.formatBytes(this.vpnState.uploadTotal))
              .fontSize(13)
              .fontColor('#8E8E93')
          }
          .layoutWeight(1)
          .alignItems(HorizontalAlign.Center)

          Divider()
            .vertical(true)
            .height(50)
            .color('#E5E5EA')

          Column() {
            Text('Download')
              .fontSize(13)
              .fontColor('#8E8E93')
            Text(this.formatSpeed(this.vpnState.downloadSpeed))
              .fontSize(17)
              .fontWeight(FontWeight.Medium)
              .fontColor('#1C1C1E')
            Text(this.formatBytes(this.vpnState.downloadTotal))
              .fontSize(13)
              .fontColor('#8E8E93')
          }
          .layoutWeight(1)
          .alignItems(HorizontalAlign.Center)
        }
        .width('100%')
        .padding(16)
        .margin({ left: 20, right: 20, top: 16 })
        .backgroundColor(Color.White)
        .borderRadius(12)
      }

      // Subscription Info
      if (this.subscriptionVM.activeSubscription) {
        Column() {
          Text(this.subscriptionVM.activeSubscription!.name)
            .fontSize(15)
            .fontWeight(FontWeight.Medium)
            .fontColor('#1C1C1E')

          if (this.subscriptionVM.formatTrafficUsage(this.subscriptionVM.activeSubscription!)) {
            Text(this.subscriptionVM.formatTrafficUsage(this.subscriptionVM.activeSubscription!))
              .fontSize(13)
              .fontColor('#8E8E93')
              .margin({ top: 4 })
          }

          if (this.subscriptionVM.formatExpiry(this.subscriptionVM.activeSubscription!)) {
            Text(this.subscriptionVM.formatExpiry(this.subscriptionVM.activeSubscription!))
              .fontSize(13)
              .fontColor('#8E8E93')
              .margin({ top: 2 })
          }
        }
        .width('100%')
        .padding(16)
        .margin({ left: 20, right: 20, top: 16 })
        .backgroundColor(Color.White)
        .borderRadius(12)
        .alignItems(HorizontalAlign.Start)
      }
    }
    .width('100%')
    .height('100%')
  }

  private connectButtonColor(): ResourceColor {
    switch (this.vpnState.status) {
      case VpnStatus.CONNECTED:
        return '#34C759';
      case VpnStatus.ERROR:
        return '#FF3B30';
      case VpnStatus.CONNECTING:
      case VpnStatus.DISCONNECTING:
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  }

  private handleConnectTap(): void {
    if (!this.subscriptionVM.hasSubscriptions) {
      this.currentTab = 2; // Navigate to Settings
      return;
    }

    if (this.vpnState.isConnected) {
      this.vpnManager?.stop();
      return;
    }

    const activeSub = this.subscriptionVM.activeSubscription;
    const selectedNode = this.nodeListVM.selectedNode;
    if (!activeSub || !selectedNode || !this.configManager) {
      return;
    }

    this.configManager.generateEngineConfig(activeSub, selectedNode.name).then((configPath: string) => {
      this.vpnManager?.start(configPath);
    }).catch((e: Error) => {
      Logger.error(`Failed to generate config: ${e.message}`);
      this.vpnState.updateStatus(VpnStatus.ERROR, e.message);
    });
  }

  private formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec < 1024) return `${bytesPerSec} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}
