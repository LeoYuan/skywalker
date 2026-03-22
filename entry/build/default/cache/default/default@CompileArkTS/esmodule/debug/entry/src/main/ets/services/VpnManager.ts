import type Want from "@ohos:app.ability.Want";
import type common from "@ohos:app.ability.common";
import commonEventManager from "@ohos:commonEventManager";
import vpnExtension from "@ohos:net.vpnExtension";
import { VpnStatus } from "@bundle:com.skywalker.proxy/entry/ets/model/VpnState";
import type { TrafficStats } from '../model/TrafficStats';
import { Constants } from "@bundle:com.skywalker.proxy/entry/ets/common/Constants";
import { Logger } from "@bundle:com.skywalker.proxy/entry/ets/common/Logger";
export class VpnManager {
    private context: common.UIAbilityContext;
    private status: VpnStatus = VpnStatus.DISCONNECTED;
    private statusCallback: ((status: VpnStatus, error?: string) => void) | null = null;
    private trafficCallback: ((stats: TrafficStats) => void) | null = null;
    private statusSubscriber: commonEventManager.CommonEventSubscriber | null = null;
    private trafficSubscriber: commonEventManager.CommonEventSubscriber | null = null;
    constructor(context: common.UIAbilityContext) {
        this.context = context;
    }
    async init(): Promise<void> {
        await this.subscribeToEvents();
    }
    async start(configPath: string): Promise<void> {
        if (this.status === VpnStatus.CONNECTED || this.status === VpnStatus.CONNECTING) {
            Logger.warn('VPN already connected or connecting');
            return;
        }
        this.status = VpnStatus.CONNECTING;
        this.notifyStatus(VpnStatus.CONNECTING);
        const want: Want = {
            bundleName: 'com.skywalker.proxy',
            abilityName: 'ProxyVpnExtAbility',
            moduleName: 'vpnservice',
            parameters: {
                action: Constants.ACTION_VPN_START,
                configPath: configPath
            }
        };
        try {
            await vpnExtension.startVpnExtensionAbility(want);
        }
        catch (e) {
            Logger.error('Failed to start VPN ability');
            this.status = VpnStatus.ERROR;
            this.notifyStatus(VpnStatus.ERROR, `Failed to start VPN: ${(e as Error).message}`);
        }
    }
    async stop(): Promise<void> {
        if (this.status === VpnStatus.DISCONNECTED || this.status === VpnStatus.DISCONNECTING) {
            return;
        }
        this.status = VpnStatus.DISCONNECTING;
        this.notifyStatus(VpnStatus.DISCONNECTING);
        const want: Want = {
            bundleName: 'com.skywalker.proxy',
            abilityName: 'ProxyVpnExtAbility',
            moduleName: 'vpnservice',
            parameters: {
                action: Constants.ACTION_VPN_STOP
            }
        };
        try {
            await vpnExtension.startVpnExtensionAbility(want);
        }
        catch (e) {
            Logger.error('Failed to stop VPN ability');
            this.status = VpnStatus.ERROR;
            this.notifyStatus(VpnStatus.ERROR, `Failed to stop VPN: ${(e as Error).message}`);
        }
    }
    getStatus(): VpnStatus {
        return this.status;
    }
    onStatusChange(callback: (status: VpnStatus, error?: string) => void): void {
        this.statusCallback = callback;
    }
    offStatusChange(): void {
        this.statusCallback = null;
    }
    onTrafficUpdate(callback: (stats: TrafficStats) => void): void {
        this.trafficCallback = callback;
    }
    offTrafficUpdate(): void {
        this.trafficCallback = null;
    }
    async destroy(): Promise<void> {
        if (this.statusSubscriber) {
            commonEventManager.unsubscribe(this.statusSubscriber);
            this.statusSubscriber = null;
        }
        if (this.trafficSubscriber) {
            commonEventManager.unsubscribe(this.trafficSubscriber);
            this.trafficSubscriber = null;
        }
    }
    private async subscribeToEvents(): Promise<void> {
        // Subscribe to VPN status changes
        const statusSubscribeInfo: commonEventManager.CommonEventSubscribeInfo = {
            events: [Constants.EVENT_VPN_STATUS_CHANGED]
        };
        this.statusSubscriber = await commonEventManager.createSubscriber(statusSubscribeInfo);
        commonEventManager.subscribe(this.statusSubscriber, (err, data) => {
            if (err) {
                Logger.error(`Status event error: ${err.message}`);
                return;
            }
            const status = data.parameters?.['status'] as VpnStatus;
            const error = data.parameters?.['error'] as string | undefined;
            if (status) {
                this.status = status;
                this.notifyStatus(status, error);
            }
        });
        // Subscribe to traffic updates
        const trafficSubscribeInfo: commonEventManager.CommonEventSubscribeInfo = {
            events: [Constants.EVENT_VPN_TRAFFIC_UPDATE]
        };
        this.trafficSubscriber = await commonEventManager.createSubscriber(trafficSubscribeInfo);
        commonEventManager.subscribe(this.trafficSubscriber, (err, data) => {
            if (err) {
                Logger.error(`Traffic event error: ${err.message}`);
                return;
            }
            if (this.trafficCallback && data.parameters) {
                const stats: TrafficStats = {
                    uploadTotal: data.parameters['upload'] as number,
                    downloadTotal: data.parameters['download'] as number,
                    uploadSpeed: data.parameters['upSpeed'] as number,
                    downloadSpeed: data.parameters['downSpeed'] as number,
                };
                this.trafficCallback(stats);
            }
        });
    }
    private notifyStatus(status: VpnStatus, error?: string): void {
        if (this.statusCallback) {
            this.statusCallback(status, error);
        }
    }
}
