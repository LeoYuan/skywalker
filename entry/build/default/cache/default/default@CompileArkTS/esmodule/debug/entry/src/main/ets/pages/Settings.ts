if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Settings_Params {
    subscriptionVM?: SubscriptionVM;
    nodeListVM?: NodeListVM;
    showAddDialog?: boolean;
    newSubName?: string;
    newSubUrl?: string;
    addError?: string;
    isAdding?: boolean;
}
import type { SubscriptionVM } from '../viewmodel/SubscriptionVM';
import type { NodeListVM } from '../viewmodel/NodeListVM';
import type { Subscription } from '../model/Subscription';
import { ServiceLocator } from "@bundle:com.skywalker.proxy/entry/ets/common/ServiceLocator";
import { Logger } from "@bundle:com.skywalker.proxy/entry/ets/common/Logger";
import promptAction from "@ohos:promptAction";
export class Settings extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__subscriptionVM = new SynchedPropertyObjectTwoWayPU(params.subscriptionVM, this, "subscriptionVM");
        this.__nodeListVM = new SynchedPropertyObjectTwoWayPU(params.nodeListVM, this, "nodeListVM");
        this.__showAddDialog = new ObservedPropertySimplePU(false, this, "showAddDialog");
        this.__newSubName = new ObservedPropertySimplePU('', this, "newSubName");
        this.__newSubUrl = new ObservedPropertySimplePU('', this, "newSubUrl");
        this.__addError = new ObservedPropertySimplePU('', this, "addError");
        this.__isAdding = new ObservedPropertySimplePU(false, this, "isAdding");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Settings_Params) {
        if (params.showAddDialog !== undefined) {
            this.showAddDialog = params.showAddDialog;
        }
        if (params.newSubName !== undefined) {
            this.newSubName = params.newSubName;
        }
        if (params.newSubUrl !== undefined) {
            this.newSubUrl = params.newSubUrl;
        }
        if (params.addError !== undefined) {
            this.addError = params.addError;
        }
        if (params.isAdding !== undefined) {
            this.isAdding = params.isAdding;
        }
    }
    updateStateVars(params: Settings_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__subscriptionVM.purgeDependencyOnElmtId(rmElmtId);
        this.__nodeListVM.purgeDependencyOnElmtId(rmElmtId);
        this.__showAddDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__newSubName.purgeDependencyOnElmtId(rmElmtId);
        this.__newSubUrl.purgeDependencyOnElmtId(rmElmtId);
        this.__addError.purgeDependencyOnElmtId(rmElmtId);
        this.__isAdding.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__subscriptionVM.aboutToBeDeleted();
        this.__nodeListVM.aboutToBeDeleted();
        this.__showAddDialog.aboutToBeDeleted();
        this.__newSubName.aboutToBeDeleted();
        this.__newSubUrl.aboutToBeDeleted();
        this.__addError.aboutToBeDeleted();
        this.__isAdding.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __subscriptionVM: SynchedPropertySimpleOneWayPU<SubscriptionVM>;
    get subscriptionVM() {
        return this.__subscriptionVM.get();
    }
    set subscriptionVM(newValue: SubscriptionVM) {
        this.__subscriptionVM.set(newValue);
    }
    private __nodeListVM: SynchedPropertySimpleOneWayPU<NodeListVM>;
    get nodeListVM() {
        return this.__nodeListVM.get();
    }
    set nodeListVM(newValue: NodeListVM) {
        this.__nodeListVM.set(newValue);
    }
    private __showAddDialog: ObservedPropertySimplePU<boolean>;
    get showAddDialog() {
        return this.__showAddDialog.get();
    }
    set showAddDialog(newValue: boolean) {
        this.__showAddDialog.set(newValue);
    }
    private __newSubName: ObservedPropertySimplePU<string>;
    get newSubName() {
        return this.__newSubName.get();
    }
    set newSubName(newValue: string) {
        this.__newSubName.set(newValue);
    }
    private __newSubUrl: ObservedPropertySimplePU<string>;
    get newSubUrl() {
        return this.__newSubUrl.get();
    }
    set newSubUrl(newValue: string) {
        this.__newSubUrl.set(newValue);
    }
    private __addError: ObservedPropertySimplePU<string>;
    get addError() {
        return this.__addError.get();
    }
    set addError(newValue: string) {
        this.__addError.set(newValue);
    }
    private __isAdding: ObservedPropertySimplePU<boolean>;
    get isAdding() {
        return this.__isAdding.get();
    }
    set isAdding(newValue: boolean) {
        this.__isAdding.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.bindSheet({ value: this.showAddDialog, changeEvent: newValue => { this.showAddDialog = newValue; } }, { builder: () => {
                    this.AddSubscriptionSheet.call(this);
                } }, {
                height: 360,
                dragBar: true
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Settings');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Medium);
            Text.width('100%');
            Text.textAlign(TextAlign.Start);
            Text.padding({ left: 20, top: 16, bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        // Subscriptions Section
        this.SectionHeader.bind(this)('Subscriptions');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.borderRadius(12);
            Column.margin({ left: 20, right: 20, bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Add button
            Row.create();
            // Add button
            Row.width('100%');
            // Add button
            Row.padding(16);
            // Add button
            Row.onClick(() => {
                this.showAddDialog = true;
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('+ Add Subscription');
            Text.fontSize(15);
            Text.fontColor('#2563EB');
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        // Add button
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Subscription list
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const sub = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                    Row.padding(16);
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Radio.create({ value: sub.id, group: 'subscriptions' });
                    Radio.checked(sub.id === this.subscriptionVM.activeSubscriptionId);
                    Radio.onChange((isChecked: boolean) => {
                        if (isChecked) {
                            this.subscriptionVM.setActive(sub.id);
                            this.nodeListVM.setNodes(sub.nodes);
                            if (sub.nodes.length > 0) {
                                this.nodeListVM.selectNode(sub.nodes[0].name);
                            }
                        }
                    });
                    Radio.margin({ right: 12 });
                }, Radio);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.layoutWeight(1);
                    Column.alignItems(HorizontalAlign.Start);
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(sub.name);
                    Text.fontSize(15);
                    Text.fontColor('#1C1C1E');
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    if (this.subscriptionVM.formatTrafficUsage(sub)) {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(this.subscriptionVM.formatTrafficUsage(sub));
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
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    if (this.subscriptionVM.formatExpiry(sub)) {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(this.subscriptionVM.formatExpiry(sub));
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
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel('X');
                    Button.type(ButtonType.Normal);
                    Button.fontSize(13);
                    Button.width(32);
                    Button.height(32);
                    Button.backgroundColor('#FF3B30');
                    Button.borderRadius(6);
                    Button.fontColor(Color.White);
                    Button.onClick(() => {
                        this.handleRemoveSubscription(sub.id);
                    });
                }, Button);
                Button.pop();
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, this.subscriptionVM.subscriptions, forEachItemGenFunction, (sub: Subscription) => sub.id, false, false);
        }, ForEach);
        // Subscription list
        ForEach.pop();
        Column.pop();
        // Import Section
        this.SectionHeader.bind(this)('Import');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.borderRadius(12);
            Column.margin({ left: 20, right: 20, bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(16);
            Row.onClick(() => {
                this.handleImportLocal();
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Import Local Config');
            Text.fontSize(15);
            Text.fontColor('#1C1C1E');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Browse');
            Text.fontSize(13);
            Text.fontColor('#2563EB');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        // General Section
        this.SectionHeader.bind(this)('General');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.borderRadius(12);
            Column.margin({ left: 20, right: 20, bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Auto Connect');
            Text.fontSize(15);
            Text.fontColor('#1C1C1E');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Toggle.create({ type: ToggleType.Switch });
            Toggle.onChange((isOn: boolean) => {
                // TODO: Save to preferences
            });
        }, Toggle);
        Toggle.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('#E5E5EA');
            Divider.margin({ left: 16 });
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Theme');
            Text.fontSize(15);
            Text.fontColor('#1C1C1E');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('System');
            Text.fontSize(15);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        // About Section
        this.SectionHeader.bind(this)('About');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.borderRadius(12);
            Column.margin({ left: 20, right: 20, bottom: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Version');
            Text.fontSize(15);
            Text.fontColor('#1C1C1E');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('1.0.0');
            Text.fontSize(15);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('#E5E5EA');
            Divider.margin({ left: 16 });
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Engine');
            Text.fontSize(15);
            Text.fontColor('#1C1C1E');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Mihomo');
            Text.fontSize(15);
            Text.fontColor('#8E8E93');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    SectionHeader(title: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title.toUpperCase());
            Text.fontSize(13);
            Text.fontColor('#8E8E93');
            Text.fontWeight(FontWeight.Medium);
            Text.padding({ left: 32, bottom: 6, top: 4 });
        }, Text);
        Text.pop();
    }
    AddSubscriptionSheet(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.padding(24);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Add Subscription');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Medium);
            Text.margin({ bottom: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Name (optional)');
            Text.fontSize(13);
            Text.fontColor('#8E8E93');
            Text.width('100%');
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: 'My Subscription', text: { value: this.newSubName, changeEvent: newValue => { this.newSubName = newValue; } } });
            TextInput.width('100%');
            TextInput.height(44);
            TextInput.margin({ bottom: 16 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Subscription URL');
            Text.fontSize(13);
            Text.fontColor('#8E8E93');
            Text.width('100%');
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: 'https://example.com/sub', text: { value: this.newSubUrl, changeEvent: newValue => { this.newSubUrl = newValue; } } });
            TextInput.width('100%');
            TextInput.height(44);
            TextInput.margin({ bottom: 16 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.addError) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.addError);
                        Text.fontSize(13);
                        Text.fontColor('#FF3B30');
                        Text.width('100%');
                        Text.margin({ bottom: 12 });
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
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Cancel');
            Button.type(ButtonType.Normal);
            Button.backgroundColor('#F2F2F7');
            Button.fontColor('#1C1C1E');
            Button.layoutWeight(1);
            Button.height(44);
            Button.borderRadius(10);
            Button.margin({ right: 8 });
            Button.onClick(() => {
                this.resetAddDialog();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isAdding ? 'Adding...' : 'Add');
            Button.type(ButtonType.Normal);
            Button.backgroundColor('#2563EB');
            Button.fontColor(Color.White);
            Button.layoutWeight(1);
            Button.height(44);
            Button.borderRadius(10);
            Button.margin({ left: 8 });
            Button.enabled(!this.isAdding && this.newSubUrl.length > 0);
            Button.onClick(() => {
                this.handleAddSubscription();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
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
        }
        else {
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
    rerender() {
        this.updateDirtyElements();
    }
}
