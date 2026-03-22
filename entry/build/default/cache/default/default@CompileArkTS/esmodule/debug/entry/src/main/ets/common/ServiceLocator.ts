import type { SubscriptionManager } from '../services/SubscriptionManager';
import type { ConfigManager } from '../services/ConfigManager';
import type { VpnManager } from '../services/VpnManager';
export class ServiceLocator {
    private static subscriptionManager: SubscriptionManager | null = null;
    private static configManager: ConfigManager | null = null;
    private static vpnManager: VpnManager | null = null;
    static setSubscriptionManager(mgr: SubscriptionManager): void {
        ServiceLocator.subscriptionManager = mgr;
    }
    static getSubscriptionManager(): SubscriptionManager | null {
        return ServiceLocator.subscriptionManager;
    }
    static setConfigManager(mgr: ConfigManager): void {
        ServiceLocator.configManager = mgr;
    }
    static getConfigManager(): ConfigManager | null {
        return ServiceLocator.configManager;
    }
    static setVpnManager(mgr: VpnManager): void {
        ServiceLocator.vpnManager = mgr;
    }
    static getVpnManager(): VpnManager | null {
        return ServiceLocator.vpnManager;
    }
}
