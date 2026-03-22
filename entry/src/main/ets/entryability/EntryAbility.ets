import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { Logger } from '../common/Logger';
import { SubscriptionManager } from '../services/SubscriptionManager';
import { ConfigManager } from '../services/ConfigManager';
import { VpnManager } from '../services/VpnManager';
import { ServiceLocator } from '../common/ServiceLocator';

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
