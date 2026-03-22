import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import type window from "@ohos:window";
import { Logger } from "@bundle:com.skywalker.proxy/entry/ets/common/Logger";
import { SubscriptionManager } from "@bundle:com.skywalker.proxy/entry/ets/services/SubscriptionManager";
import { ConfigManager } from "@bundle:com.skywalker.proxy/entry/ets/services/ConfigManager";
import { VpnManager } from "@bundle:com.skywalker.proxy/entry/ets/services/VpnManager";
import { ServiceLocator } from "@bundle:com.skywalker.proxy/entry/ets/common/ServiceLocator";
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        Logger.info('EntryAbility onCreate');
        const subscriptionManager = new SubscriptionManager(this.context);
        const configManager = new ConfigManager(this.context);
        const vpnManager = new VpnManager(this.context);
        ServiceLocator.setSubscriptionManager(subscriptionManager);
        ServiceLocator.setConfigManager(configManager);
        ServiceLocator.setVpnManager(vpnManager);
        subscriptionManager.init().then(() => {
            Logger.info(`Loaded ${subscriptionManager.getSubscriptions().length} subscriptions`);
        }).catch((e: Error) => {
            Logger.error(`Failed to init SubscriptionManager: ${e.message}`);
        });
        vpnManager.init().catch((e: Error) => {
            Logger.error(`Failed to init VpnManager: ${e.message}`);
        });
    }
    onDestroy(): void {
        Logger.info('EntryAbility onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        Logger.info('EntryAbility onWindowStageCreate');
        windowStage.loadContent('pages/Index', (err) => {
            if (err && err.code) {
                Logger.error(`Failed to load content: ${err.code}`);
                return;
            }
            Logger.info('Content loaded successfully');
        });
    }
    onWindowStageDestroy(): void {
        Logger.info('EntryAbility onWindowStageDestroy');
    }
    onForeground(): void {
        Logger.info('EntryAbility onForeground');
    }
    onBackground(): void {
        Logger.info('EntryAbility onBackground');
    }
}
