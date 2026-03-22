if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    currentTab?: number;
    vpnState?: VpnStateVM;
    subscriptionVM?: SubscriptionVM;
    nodeListVM?: NodeListVM;
    subscriptionManager?: SubscriptionManager | undefined;
    configManager?: ConfigManager | undefined;
    vpnManager?: VpnManager | undefined;
}
import { VpnStateVM } from "@bundle:com.skywalker.proxy/entry/ets/viewmodel/VpnStateVM";
import { SubscriptionVM } from "@bundle:com.skywalker.proxy/entry/ets/viewmodel/SubscriptionVM";
import { NodeListVM } from "@bundle:com.skywalker.proxy/entry/ets/viewmodel/NodeListVM";
import { VpnStatus } from "@bundle:com.skywalker.proxy/entry/ets/model/VpnState";
import { Nodes } from "@bundle:com.skywalker.proxy/entry/ets/pages/Nodes";
import { Settings } from "@bundle:com.skywalker.proxy/entry/ets/pages/Settings";
import type { SubscriptionManager } from '../services/SubscriptionManager';
import type { ConfigManager } from '../services/ConfigManager';
import type { VpnManager } from '../services/VpnManager';
import { ServiceLocator } from "@bundle:com.skywalker.proxy/entry/ets/common/ServiceLocator";
import { Logger } from "@bundle:com.skywalker.proxy/entry/ets/common/Logger";
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentTab = new ObservedPropertySimplePU(0, this, "currentTab");
        this.__vpnState = new ObservedPropertyObjectPU(new VpnStateVM(), this, "vpnState");
        this.__subscriptionVM = new ObservedPropertyObjectPU(new SubscriptionVM(), this, "subscriptionVM");
        this.__nodeListVM = new ObservedPropertyObjectPU(new NodeListVM(), this, "nodeListVM");
        this.subscriptionManager = undefined;
        this.configManager = undefined;
        this.vpnManager = undefined;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.vpnState !== undefined) {
            this.vpnState = params.vpnState;
        }
        if (params.subscriptionVM !== undefined) {
            this.subscriptionVM = params.subscriptionVM;
        }
        if (params.nodeListVM !== undefined) {
            this.nodeListVM = params.nodeListVM;
        }
        if (params.subscriptionManager !== undefined) {
            this.subscriptionManager = params.subscriptionManager;
        }
        if (params.configManager !== undefined) {
            this.configManager = params.configManager;
        }
        if (params.vpnManager !== undefined) {
            this.vpnManager = params.vpnManager;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__vpnState.purgeDependencyOnElmtId(rmElmtId);
        this.__subscriptionVM.purgeDependencyOnElmtId(rmElmtId);
        this.__nodeListVM.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentTab.aboutToBeDeleted();
        this.__vpnState.aboutToBeDeleted();
        this.__subscriptionVM.aboutToBeDeleted();
        this.__nodeListVM.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __currentTab: ObservedPropertySimplePU<number>;
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    private __vpnState: ObservedPropertyObjectPU<VpnStateVM>;
    get vpnState() {
        return this.__vpnState.get();
    }
    set vpnState(newValue: VpnStateVM) {
        this.__vpnState.set(newValue);
    }
    private __subscriptionVM: ObservedPropertyObjectPU<SubscriptionVM>;
    get subscriptionVM() {
        return this.__subscriptionVM.get();
    }
    set subscriptionVM(newValue: SubscriptionVM) {
        this.__subscriptionVM.set(newValue);
    }
    private __nodeListVM: ObservedPropertyObjectPU<NodeListVM>;
    get nodeListVM() {
        return this.__nodeListVM.get();
    }
    set nodeListVM(newValue: NodeListVM) {
        this.__nodeListVM.set(newValue);
    }
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create({ barPosition: BarPosition.End, index: this.currentTab });
            Tabs.onChange((index: number) => {
                this.currentTab = index;
            });
            Tabs.barMode(BarMode.Fixed);
            Tabs.backgroundColor('#F2F2F7');
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.HomeContent.bind(this)();
            });
            TabContent.tabBar({ builder: () => {
                    this.TabBarItem.call(this, 'Home', 0);
                } });
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new Nodes(this, {
                                nodeListVM: this.__nodeListVM,
                                subscriptionVM: this.__subscriptionVM,
                                vpnState: this.__vpnState
                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 59, col: 9 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    nodeListVM: this.nodeListVM,
                                    subscriptionVM: this.subscriptionVM,
                                    vpnState: this.vpnState
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "Nodes" });
                }
            });
            TabContent.tabBar({ builder: () => {
                    this.TabBarItem.call(this, 'Nodes', 1);
                } });
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new Settings(this, {
                                subscriptionVM: this.__subscriptionVM,
                                nodeListVM: this.__nodeListVM
                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 68, col: 9 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    subscriptionVM: this.subscriptionVM,
                                    nodeListVM: this.nodeListVM
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "Settings" });
                }
            });
            TabContent.tabBar({ builder: () => {
                    this.TabBarItem.call(this, 'Settings', 2);
                } });
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
    }
    TabBarItem(title: string, index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height(50);
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(13);
            Text.fontColor(this.currentTab === index ? '#2563EB' : '#8E8E93');
            Text.fontWeight(this.currentTab === index ? FontWeight.Medium : FontWeight.Regular);
        }, Text);
        Text.pop();
        Column.pop();
    }
    HomeContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Title
            Text.create('SkyWalker');
            // Title
            Text.fontSize(20);
            // Title
            Text.fontWeight(FontWeight.Medium);
            // Title
            Text.width('100%');
            // Title
            Text.textAlign(TextAlign.Start);
            // Title
            Text.padding({ left: 20, top: 16, bottom: 8 });
        }, Text);
        // Title
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Connect Button
            Column.create();
            // Connect Button
            Column.width('100%');
            // Connect Button
            Column.alignItems(HorizontalAlign.Center);
            // Connect Button
            Column.padding({ top: 40, bottom: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Circle });
            Button.width(120);
            Button.height(120);
            Button.backgroundColor(this.connectButtonColor());
            Button.enabled(!this.vpnState.isTransitioning && this.subscriptionVM.hasSubscriptions);
            Button.onClick(() => {
                this.handleConnectTap();
            });
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.vpnState.isConnected ? 'ON' : 'OFF');
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.vpnState.statusLabel);
            Text.fontSize(17);
            Text.fontColor('#1C1C1E');
            Text.margin({ top: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.vpnState.isConnected && this.vpnState.durationText) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.vpnState.durationText);
                        Text.fontSize(15);
                        Text.fontColor('#8E8E93');
                        Text.margin({ top: 4 });
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
        // Connect Button
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Selected Node Card
            if (this.nodeListVM.selectedNode) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding(16);
                        Row.margin({ left: 20, right: 20 });
                        Row.backgroundColor(Color.White);
                        Row.borderRadius(12);
                        Row.onClick(() => {
                            this.currentTab = 1; // Navigate to Nodes tab
                        });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.alignItems(HorizontalAlign.Start);
                        Column.layoutWeight(1);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.nodeListVM.selectedNodeName} (${this.nodeListVM.selectedNode!.type})`);
                        Text.fontSize(15);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#1C1C1E');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.nodeListVM.selectedNode!.server}:${this.nodeListVM.selectedNode!.port}`);
                        Text.fontSize(13);
                        Text.fontColor('#8E8E93');
                        Text.margin({ top: 4 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('>');
                        Text.fontSize(17);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else if (!this.subscriptionVM.hasSubscriptions) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Add a subscription to get started');
                        Text.fontSize(15);
                        Text.fontColor('#8E8E93');
                        Text.width('100%');
                        Text.textAlign(TextAlign.Center);
                        Text.padding(20);
                    }, Text);
                    Text.pop();
                });
            }
            // Traffic Stats (shown when connected)
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Traffic Stats (shown when connected)
            if (this.vpnState.isConnected) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding(16);
                        Row.margin({ left: 20, right: 20, top: 16 });
                        Row.backgroundColor(Color.White);
                        Row.borderRadius(12);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Upload');
                        Text.fontSize(13);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.formatSpeed(this.vpnState.uploadSpeed));
                        Text.fontSize(17);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#1C1C1E');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.formatBytes(this.vpnState.uploadTotal));
                        Text.fontSize(13);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Divider.create();
                        Divider.vertical(true);
                        Divider.height(50);
                        Divider.color('#E5E5EA');
                    }, Divider);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('Download');
                        Text.fontSize(13);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.formatSpeed(this.vpnState.downloadSpeed));
                        Text.fontSize(17);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#1C1C1E');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.formatBytes(this.vpnState.downloadTotal));
                        Text.fontSize(13);
                        Text.fontColor('#8E8E93');
                    }, Text);
                    Text.pop();
                    Column.pop();
                    Row.pop();
                });
            }
            // Subscription Info
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Subscription Info
            if (this.subscriptionVM.activeSubscription) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.margin({ left: 20, right: 20, top: 16 });
                        Column.backgroundColor(Color.White);
                        Column.borderRadius(12);
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
                        if (this.subscriptionVM.formatTrafficUsage(this.subscriptionVM.activeSubscription!)) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.subscriptionVM.formatTrafficUsage(this.subscriptionVM.activeSubscription!));
                                    Text.fontSize(13);
                                    Text.fontColor('#8E8E93');
                                    Text.margin({ top: 4 });
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.subscriptionVM.formatExpiry(this.subscriptionVM.activeSubscription!)) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.subscriptionVM.formatExpiry(this.subscriptionVM.activeSubscription!));
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
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
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
        if (bytesPerSec < 1024)
            return `${bytesPerSec} B/s`;
        if (bytesPerSec < 1024 * 1024)
            return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
        return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    }
    private formatBytes(bytes: number): string {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024)
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.skywalker.proxy", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
