import { NodeListVM, NodeWithLatency } from '../viewmodel/NodeListVM';
import { SubscriptionVM } from '../viewmodel/SubscriptionVM';
import { VpnStateVM } from '../viewmodel/VpnStateVM';
import { SubscriptionManager } from '../services/SubscriptionManager';
import { ServiceLocator } from '../common/ServiceLocator';
import { Logger } from '../common/Logger';

@Component
export struct Nodes {
  @Link nodeListVM: NodeListVM;
  @Link subscriptionVM: SubscriptionVM;
  @Link vpnState: VpnStateVM;

  build() {
    Column() {
      // Header
      Row() {
        Text('Nodes')
          .fontSize(20)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)

        Button('Refresh')
          .fontSize(13)
          .type(ButtonType.Normal)
          .height(32)
          .backgroundColor('#2563EB')
          .borderRadius(8)
          .onClick(() => {
            this.handleRefresh();
          })
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 16, bottom: 8 })

      // Subscription info
      if (this.subscriptionVM.activeSubscription) {
        Column() {
          Text(this.subscriptionVM.activeSubscription!.name)
            .fontSize(15)
            .fontWeight(FontWeight.Medium)
            .fontColor('#1C1C1E')
          if (this.subscriptionVM.activeSubscription!.lastUpdated) {
            Text(`Updated: ${new Date(this.subscriptionVM.activeSubscription!.lastUpdated!).toLocaleString()}`)
              .fontSize(13)
              .fontColor('#8E8E93')
              .margin({ top: 2 })
          }
        }
        .width('100%')
        .padding({ left: 20, right: 20, bottom: 12 })
        .alignItems(HorizontalAlign.Start)
      }

      // Node list
      if (this.nodeListVM.nodes.length > 0) {
        List() {
          ForEach(this.nodeListVM.nodes, (item: NodeWithLatency) => {
            ListItem() {
              Row() {
                // Selection indicator
                Radio({ value: item.node.name, group: 'nodes' })
                  .checked(item.node.name === this.nodeListVM.selectedNodeName)
                  .onChange((isChecked: boolean) => {
                    if (isChecked) {
                      this.nodeListVM.selectNode(item.node.name);
                      // TODO: If connected, trigger node switch via VpnManager
                    }
                  })
                  .margin({ right: 12 })

                // Node info
                Column() {
                  Text(item.node.name)
                    .fontSize(15)
                    .fontColor('#1C1C1E')
                }
                .layoutWeight(1)
                .alignItems(HorizontalAlign.Start)

                // Type badge
                Text(item.node.type)
                  .fontSize(12)
                  .fontColor('#8E8E93')
                  .backgroundColor('#F2F2F7')
                  .padding({ left: 8, right: 8, top: 2, bottom: 2 })
                  .borderRadius(4)
                  .margin({ right: 12 })

                // Latency
                Text(this.nodeListVM.formatLatency(item.latency))
                  .fontSize(13)
                  .fontColor(this.nodeListVM.latencyColor(item.latency))
                  .width(60)
                  .textAlign(TextAlign.End)
              }
              .width('100%')
              .padding({ left: 20, right: 20, top: 12, bottom: 12 })
              .backgroundColor(Color.White)
            }
          }, (item: NodeWithLatency) => item.node.name)
        }
        .divider({ strokeWidth: 0.5, color: '#E5E5EA', startMargin: 56, endMargin: 20 })
        .layoutWeight(1)
        .borderRadius(12)
        .margin({ left: 20, right: 20 })
        .clip(true)

        // Test All button
        Button('Test All Latency')
          .width('90%')
          .height(44)
          .margin({ top: 16, bottom: 20 })
          .backgroundColor('#2563EB')
          .borderRadius(10)
          .enabled(!this.nodeListVM.isTesting)
          .onClick(() => {
            this.handleTestAll();
          })
      } else {
        // Empty state
        Column() {
          Text('No nodes available')
            .fontSize(17)
            .fontColor('#8E8E93')
            .margin({ bottom: 8 })
          Text('Go to Settings to add a subscription.')
            .fontSize(15)
            .fontColor('#8E8E93')
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      }
    }
    .width('100%')
    .height('100%')
  }

  private handleRefresh(): void {
    const activeId = this.subscriptionVM.activeSubscriptionId;
    if (!activeId) return;

    const subManager = ServiceLocator.getSubscriptionManager();
    if (!subManager) return;

    subManager.refreshSubscription(activeId).then((updated) => {
      this.subscriptionVM.updateSubscription(updated);
      this.nodeListVM.setNodes(updated.nodes);
      if (updated.nodes.length > 0 && !this.nodeListVM.selectedNode) {
        this.nodeListVM.selectNode(updated.nodes[0].name);
      }
    }).catch((e: Error) => {
      Logger.error(`Failed to refresh subscription: ${e.message}`);
    });
  }

  private handleTestAll(): void {
    // TODO: Wire up NativeEngine.testLatency for each node
    this.nodeListVM.setAllTesting();
  }
}
