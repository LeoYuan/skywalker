if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Nodes_Params {
    nodeListVM?: NodeListVM;
    subscriptionVM?: SubscriptionVM;
    vpnState?: VpnStateVM;
}
import type { NodeListVM, NodeWithLatency } from '../viewmodel/NodeListVM';
import type { SubscriptionVM } from '../viewmodel/SubscriptionVM';
import type { VpnStateVM } from '../viewmodel/VpnStateVM';
import { ServiceLocator } from "@bundle:com.skywalker.proxy/entry/ets/common/ServiceLocator";
import { Logger } from "@bundle:com.skywalker.proxy/entry/ets/common/Logger";
export class Nodes extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__nodeListVM = new SynchedPropertyObjectTwoWayPU(params.nodeListVM, this, "nodeListVM");
        this.__subscriptionVM = new SynchedPropertyObjectTwoWayPU(params.subscriptionVM, this, "subscriptionVM");
        this.__vpnState = new SynchedPropertyObjectTwoWayPU(params.vpnState, this, "vpnState");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Nodes_Params) {
    }
    updateStateVars(params: Nodes_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__nodeListVM.purgeDependencyOnElmtId(rmElmtId);
        this.__subscriptionVM.purgeDependencyOnElmtId(rmElmtId);
        this.__vpnState.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__nodeListVM.aboutToBeDeleted();
        this.__subscriptionVM.aboutToBeDeleted();
        this.__vpnState.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __nodeListVM: SynchedPropertySimpleOneWayPU<NodeListVM>;
    get nodeListVM() {
        return this.__nodeListVM.get();
    }
    set nodeListVM(newValue: NodeListVM) {
        this.__nodeListVM.set(newValue);
    }
    private __subscriptionVM: SynchedPropertySimpleOneWayPU<SubscriptionVM>;
    get subscriptionVM() {
        return this.__subscriptionVM.get();
    }
    set subscriptionVM(newValue: SubscriptionVM) {
        this.__subscriptionVM.set(newValue);
    }
    private __vpnState: SynchedPropertySimpleOneWayPU<VpnStateVM>;
    get vpnState() {
        return this.__vpnState.get();
    }
    set vpnState(newValue: VpnStateVM) {
        this.__vpnState.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Header
            Row.create();
            // Header
            Row.width('100%');
            // Header
            Row.padding({ left: 20, right: 20, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Nodes');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Medium);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Refresh');
            Button.fontSize(13);
            Button.type(ButtonType.Normal);
            Button.height(32);
            Button.backgroundColor('#2563EB');
            Button.borderRadius(8);
            Button.onClick(() => {
                this.handleRefresh();
            });
        }, Button);
        Button.pop();
        // Header
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Subscription info
            if (this.subscriptionVM.activeSubscription) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding({ left: 20, right: 20, bottom: 12 });
                        Column.alignItems(HorizontalAlign.Start);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.subscriptionVM.activeSubscription!.name);
                        Text.fontSize(15);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#1C1C1E');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.subscriptionVM.activeSubscription!.lastUpdated) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`Updated: ${new Date(this.subscriptionVM.activeSubscription!.lastUpdated!).toLocaleString()}`);
                                    Text.fontSize(13);
                                    Text.fontColor('#8E8E93');
                                    Text.margin({ top: 2 });
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    Column.pop();
                });
            }
            // Node list
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Node list
            if (this.nodeListVM.nodes.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.divider({ strokeWidth: 0.5, color: '#E5E5EA', startMargin: 56, endMargin: 20 });
                        List.layoutWeight(1);
                        List.borderRadius(12);
                        List.margin({ left: 20, right: 20 });
                        List.clip(true);
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                        Row.padding({ left: 20, right: 20, top: 12, bottom: 12 });
                                        Row.backgroundColor(Color.White);
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // Selection indicator
                                        Radio.create({ value: item.node.name, group: 'nodes' });
                                        // Selection indicator
                                        Radio.checked(item.node.name === this.nodeListVM.selectedNodeName);
                                        // Selection indicator
                                        Radio.onChange((isChecked: boolean) => {
                                            if (isChecked) {
                                                this.nodeListVM.selectNode(item.node.name);
                                                // TODO: If connected, trigger node switch via VpnManager
                                            }
                                        });
                                        // Selection indicator
                                        Radio.margin({ right: 12 });
                                    }, Radio);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // Node info
                                        Column.create();
                                        // Node info
                                        Column.layoutWeight(1);
                                        // Node info
                                        Column.alignItems(HorizontalAlign.Start);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.node.name);
                                        Text.fontSize(15);
                                        Text.fontColor('#1C1C1E');
                                    }, Text);
                                    Text.pop();
                                    // Node info
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // Type badge
                                        Text.create(item.node.type);
                                        // Type badge
                                        Text.fontSize(12);
                                        // Type badge
                                        Text.fontColor('#8E8E93');
                                        // Type badge
                                        Text.backgroundColor('#F2F2F7');
                                        // Type badge
                                        Text.padding({ left: 8, right: 8, top: 2, bottom: 2 });
                                        // Type badge
                                        Text.borderRadius(4);
                                        // Type badge
                                        Text.margin({ right: 12 });
                                    }, Text);
                                    // Type badge
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // Latency
                                        Text.create(this.nodeListVM.formatLatency(item.latency));
                                        // Latency
                                        Text.fontSize(13);
                                        // Latency
                                        Text.fontColor(this.nodeListVM.latencyColor(item.latency));
                                        // Latency
                                        Text.width(60);
                                        // Latency
                                        Text.textAlign(TextAlign.End);
                                    }, Text);
                                    // Latency
                                    Text.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.nodeListVM.nodes, forEachItemGenFunction, (item: NodeWithLatency) => item.node.name, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Test All button
                        Button.createWithLabel('Test All Latency');
                        // Test All button
                        Button.width('90%');
                        // Test All button
                        Button.height(44);
                        // Test All button
                        Button.margin({ top: 16, bottom: 20 });
                        // Test All button
                        Button.backgroundColor('#2563EB');
                        // Test All button
                        Button.borderRadius(10);
                        // Test All button
                        Button.enabled(!this.nodeListVM.isTesting);
                        // Test All button
                        Button.onClick(() => {
                            this.handleTestAll();
                        });
                    }, Button);
                    // Test All button
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // Empty state
                        Column.create();
                        // Empty state
                        Column.width('100%');
                        // Empty state
                        Column.layoutWeight(1);
                        // Empty state
                        Column.justifyContent(FlexAlign.Center);
                        // Empty state
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('No nodes available');
                        Text.fontSize(17);
                        Text.fontColor('#8E8E93');
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Go to Settings to add a subscription.');
                        Text.fontSize(15);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    // Empty state
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    private handleRefresh(): void {
        const activeId = this.subscriptionVM.activeSubscriptionId;
        if (!activeId)
            return;
        const subManager = ServiceLocator.getSubscriptionManager();
        if (!subManager)
            return;
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
    rerender() {
        this.updateDirtyElements();
    }
}
