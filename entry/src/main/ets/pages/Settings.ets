import { SubscriptionVM } from '../viewmodel/SubscriptionVM';
import { NodeListVM } from '../viewmodel/NodeListVM';
import { Subscription } from '../model/Subscription';
import { SubscriptionManager } from '../services/SubscriptionManager';
import { ServiceLocator } from '../common/ServiceLocator';
import { Logger } from '../common/Logger';
import { promptAction } from '@kit.ArkUI';

@Component
export struct Settings {
  @Link subscriptionVM: SubscriptionVM;
  @Link nodeListVM: NodeListVM;
  @State showAddDialog: boolean = false;
  @State newSubName: string = '';
  @State newSubUrl: string = '';
  @State addError: string = '';
  @State isAdding: boolean = false;

  build() {
    Column() {
      Text('Settings')
        .fontSize(20)
        .fontWeight(FontWeight.Medium)
        .width('100%')
        .textAlign(TextAlign.Start)
        .padding({ left: 20, top: 16, bottom: 16 })

      Scroll() {
        Column() {
          // Subscriptions Section
          this.SectionHeader('Subscriptions')

          Column() {
            // Add button
            Row() {
              Text('+ Add Subscription')
                .fontSize(15)
                .fontColor('#2563EB')
                .fontWeight(FontWeight.Medium)
            }
            .width('100%')
            .padding(16)
            .onClick(() => {
              this.showAddDialog = true;
            })

            // Subscription list
            ForEach(this.subscriptionVM.subscriptions, (sub: Subscription) => {
              Row() {
                Radio({ value: sub.id, group: 'subscriptions' })
                  .checked(sub.id === this.subscriptionVM.activeSubscriptionId)
                  .onChange((isChecked: boolean) => {
                    if (isChecked) {
                      this.subscriptionVM.setActive(sub.id);
                      this.nodeListVM.setNodes(sub.nodes);
                      if (sub.nodes.length > 0) {
                        this.nodeListVM.selectNode(sub.nodes[0].name);
                      }
                    }
                  })
                  .margin({ right: 12 })

                Column() {
                  Text(sub.name)
                    .fontSize(15)
                    .fontColor('#1C1C1E')
                  if (this.subscriptionVM.formatTrafficUsage(sub)) {
                    Text(this.subscriptionVM.formatTrafficUsage(sub))
                      .fontSize(13)
                      .fontColor('#8E8E93')
                      .margin({ top: 2 })
                  }
                  if (this.subscriptionVM.formatExpiry(sub)) {
                    Text(this.subscriptionVM.formatExpiry(sub))
                      .fontSize(13)
                      .fontColor('#8E8E93')
                      .margin({ top: 2 })
                  }
                }
                .layoutWeight(1)
                .alignItems(HorizontalAlign.Start)

                Button('X')
                  .type(ButtonType.Normal)
                  .fontSize(13)
                  .width(32)
                  .height(32)
                  .backgroundColor('#FF3B30')
                  .borderRadius(6)
                  .fontColor(Color.White)
                  .onClick(() => {
                    this.handleRemoveSubscription(sub.id);
                  })
              }
              .width('100%')
              .padding(16)
            }, (sub: Subscription) => sub.id)
          }
          .backgroundColor(Color.White)
          .borderRadius(12)
          .margin({ left: 20, right: 20, bottom: 16 })

          // Import Section
          this.SectionHeader('Import')
          Column() {
            Row() {
              Text('Import Local Config')
                .fontSize(15)
                .fontColor('#1C1C1E')
                .layoutWeight(1)
              Text('Browse')
                .fontSize(13)
                .fontColor('#2563EB')
            }
            .width('100%')
            .padding(16)
            .onClick(() => {
              this.handleImportLocal();
            })
          }
          .backgroundColor(Color.White)
          .borderRadius(12)
          .margin({ left: 20, right: 20, bottom: 16 })

          // General Section
          this.SectionHeader('General')
          Column() {
            Row() {
              Text('Auto Connect')
                .fontSize(15)
                .fontColor('#1C1C1E')
                .layoutWeight(1)
              Toggle({ type: ToggleType.Switch })
                .onChange((isOn: boolean) => {
                  // TODO: Save to preferences
                })
            }
            .width('100%')
            .padding(16)

            Divider().color('#E5E5EA').margin({ left: 16 })

            Row() {
              Text('Theme')
                .fontSize(15)
                .fontColor('#1C1C1E')
                .layoutWeight(1)
              Text('System')
                .fontSize(15)
                .fontColor('#8E8E93')
            }
            .width('100%')
            .padding(16)
          }
          .backgroundColor(Color.White)
          .borderRadius(12)
          .margin({ left: 20, right: 20, bottom: 16 })

          // About Section
          this.SectionHeader('About')
          Column() {
            Row() {
              Text('Version')
                .fontSize(15)
                .fontColor('#1C1C1E')
                .layoutWeight(1)
              Text('1.0.0')
                .fontSize(15)
                .fontColor('#8E8E93')
            }
            .width('100%')
            .padding(16)

            Divider().color('#E5E5EA').margin({ left: 16 })

            Row() {
              Text('Engine')
                .fontSize(15)
                .fontColor('#1C1C1E')
                .layoutWeight(1)
              Text('Mihomo')
                .fontSize(15)
                .fontColor('#8E8E93')
            }
            .width('100%')
            .padding(16)
          }
          .backgroundColor(Color.White)
          .borderRadius(12)
          .margin({ left: 20, right: 20, bottom: 20 })
        }
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .bindSheet($$this.showAddDialog, this.AddSubscriptionSheet(), {
      height: 360,
      dragBar: true
    })
  }

  @Builder
  SectionHeader(title: string) {
    Text(title.toUpperCase())
      .fontSize(13)
      .fontColor('#8E8E93')
      .fontWeight(FontWeight.Medium)
      .padding({ left: 32, bottom: 6, top: 4 })
  }

  @Builder
  AddSubscriptionSheet() {
    Column() {
      Text('Add Subscription')
        .fontSize(20)
        .fontWeight(FontWeight.Medium)
        .margin({ bottom: 20 })

      Text('Name (optional)')
        .fontSize(13)
        .fontColor('#8E8E93')
        .width('100%')
        .margin({ bottom: 4 })
      TextInput({ placeholder: 'My Subscription', text: $$this.newSubName })
        .width('100%')
        .height(44)
        .margin({ bottom: 16 })

      Text('Subscription URL')
        .fontSize(13)
        .fontColor('#8E8E93')
        .width('100%')
        .margin({ bottom: 4 })
      TextInput({ placeholder: 'https://example.com/sub', text: $$this.newSubUrl })
        .width('100%')
        .height(44)
        .margin({ bottom: 16 })

      if (this.addError) {
        Text(this.addError)
          .fontSize(13)
          .fontColor('#FF3B30')
          .width('100%')
          .margin({ bottom: 12 })
      }

      Row() {
        Button('Cancel')
          .type(ButtonType.Normal)
          .backgroundColor('#F2F2F7')
          .fontColor('#1C1C1E')
          .layoutWeight(1)
          .height(44)
          .borderRadius(10)
          .margin({ right: 8 })
          .onClick(() => {
            this.resetAddDialog();
          })

        Button(this.isAdding ? 'Adding...' : 'Add')
          .type(ButtonType.Normal)
          .backgroundColor('#2563EB')
          .fontColor(Color.White)
          .layoutWeight(1)
          .height(44)
          .borderRadius(10)
          .margin({ left: 8 })
          .enabled(!this.isAdding && this.newSubUrl.length > 0)
          .onClick(() => {
            this.handleAddSubscription();
          })
      }
      .width('100%')
    }
    .padding(24)
    .width('100%')
  }

  private handleAddSubscription(): void {
    const subManager = ServiceLocator.getSubscriptionManager();
    if (!subManager) {
      this.addError = 'Service not initialized';
      return;
    }

    this.isAdding = true;
    this.addError = '';

    const nameVal = this.newSubName.trim() || undefined;
    const urlVal = this.newSubUrl.trim();
    subManager.addSubscription(urlVal, nameVal).then((sub: Subscription) => {
      promptAction.showToast({ message: sub.nodes.length + ' nodes loaded' });
      this.subscriptionVM.addSubscription(sub);
      this.subscriptionVM.setActive(sub.id);
      this.nodeListVM.setNodes(sub.nodes);
      if (sub.nodes.length > 0) {
        this.nodeListVM.selectNode(sub.nodes[0].name);
      }
      this.resetAddDialog();
    }).catch((e: Error) => {
      this.addError = e.message || 'Failed to add subscription';
      this.isAdding = false;
    });
  }

  private handleRemoveSubscription(id: string): void {
    const subManager = ServiceLocator.getSubscriptionManager();
    if (subManager) {
      subManager.removeSubscription(id).catch((e: Error) => {
        Logger.error(`Failed to remove subscription: ${e.message}`);
      });
    }
    this.subscriptionVM.removeSubscription(id);
    // If active subscription was removed, update nodes
    const activeSub = this.subscriptionVM.activeSubscription;
    if (activeSub) {
      this.nodeListVM.setNodes(activeSub.nodes);
      if (activeSub.nodes.length > 0) {
        this.nodeListVM.selectNode(activeSub.nodes[0].name);
      }
    } else {
      this.nodeListVM.setNodes([]);
    }
  }

  private handleImportLocal(): void {
    // TODO: Wire up file picker + ConfigManager.importLocalConfig
  }

  private resetAddDialog(): void {
    this.showAddDialog = false;
    this.newSubName = '';
    this.newSubUrl = '';
    this.addError = '';
    this.isAdding = false;
  }
}
