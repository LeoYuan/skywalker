import VpnExtensionAbility from '@ohos.app.ability.VpnExtensionAbility';
import { vpnExtension } from '@kit.NetworkKit';
import { connection } from '@kit.NetworkKit';
import { commonEventManager } from '@kit.BasicServicesKit';
import { Want } from '@kit.AbilityKit';
import { NativeEngine } from './NativeEngine';
import { VpnStatus, VpnConstants } from '../common/VpnConstants';

const TAG = 'ProxyVpnExtAbility';

export default class ProxyVpnExtAbility extends VpnExtensionAbility {
  private vpnConnection: vpnExtension.VpnConnection | null = null;
  private trafficTimer: number = -1;

  onCreate(want: Want): void {
    console.info(TAG, 'onCreate');

    const action = want.parameters?.['action'] as string;
    const configPath = want.parameters?.['configPath'] as string;

    if (action === VpnConstants.ACTION_VPN_START && configPath) {
      this.startVpn(configPath);
    } else if (action === VpnConstants.ACTION_VPN_STOP) {
      this.stopVpn();
    }
  }

  onDestroy(): void {
    console.info(TAG, 'onDestroy');
    this.stopVpn();
  }

  private async startVpn(configPath: string): Promise<void> {
    try {
      this.publishStatus(VpnStatus.CONNECTING);

      this.vpnConnection = vpnExtension.createVpnConnection(this.context);

      const tunAddress: connection.NetAddress = { address: VpnConstants.TUN_ADDRESS };
      const tunLink: connection.LinkAddress = {
        address: tunAddress,
        prefixLength: VpnConstants.TUN_PREFIX_LENGTH
      };

      const destAddress: connection.NetAddress = { address: '0.0.0.0' };
      const destLink: connection.LinkAddress = {
        address: destAddress,
        prefixLength: 0
      };
      const gatewayAddress: connection.NetAddress = { address: VpnConstants.TUN_GATEWAY };
      const route: connection.RouteInfo = {
        interface: 'tun0',
        destination: destLink,
        gateway: gatewayAddress,
        hasGateway: true,
        isDefaultRoute: true
      };

      const vpnConfig: vpnExtension.VpnConfig = {
        addresses: [tunLink],
        routes: [route],
        dnsAddresses: VpnConstants.TUN_DNS_ADDRESSES,
        mtu: VpnConstants.TUN_MTU
      };

      const tunFd = await this.vpnConnection.create(vpnConfig);

      NativeEngine.onProtectRequest(async (fd: number): Promise<void> => {
        if (this.vpnConnection) {
          await this.vpnConnection.protect(fd);
        }
      });

      NativeEngine.onStateChange((state: string, error?: string): void => {
        console.info(TAG, `Engine state: ${state}, error: ${error ?? 'none'}`);
        if (state === 'error' && error) {
          this.publishStatus(VpnStatus.ERROR, error);
        }
      });

      const started = await NativeEngine.startEngine(configPath, tunFd);
      if (!started) {
        throw new Error('Engine failed to start');
      }

      this.publishStatus(VpnStatus.CONNECTED);
      this.startTrafficPolling();

    } catch (e) {
      console.error(TAG, `startVpn failed: ${(e as Error).message}`);
      this.publishStatus(VpnStatus.ERROR, (e as Error).message);
      this.cleanup();
    }
  }

  private async stopVpn(): Promise<void> {
    try {
      this.publishStatus(VpnStatus.DISCONNECTING);
      this.stopTrafficPolling();
      await NativeEngine.stopEngine();
      this.cleanup();
      this.publishStatus(VpnStatus.DISCONNECTED);
    } catch (e) {
      console.error(TAG, `stopVpn failed: ${(e as Error).message}`);
      this.publishStatus(VpnStatus.ERROR, (e as Error).message);
    }
  }

  private cleanup(): void {
    if (this.vpnConnection) {
      try {
        this.vpnConnection.destroy();
      } catch (e) {
        console.warn(TAG, 'vpnConnection.destroy failed');
      }
      this.vpnConnection = null;
    }
  }

  private startTrafficPolling(): void {
    this.trafficTimer = setInterval(() => {
      try {
        const stats = NativeEngine.getTrafficStats();
        this.publishTraffic(stats.uploadTotal, stats.downloadTotal, stats.uploadSpeed, stats.downloadSpeed);
      } catch (e) {
        // Ignore stats errors
      }
    }, VpnConstants.TRAFFIC_UPDATE_INTERVAL);
  }

  private stopTrafficPolling(): void {
    if (this.trafficTimer >= 0) {
      clearInterval(this.trafficTimer);
      this.trafficTimer = -1;
    }
  }

  private publishStatus(status: VpnStatus, error?: string): void {
    const options: commonEventManager.CommonEventPublishData = {
      parameters: {
        status: status as string,
        error: error ?? ''
      }
    };
    commonEventManager.publish(VpnConstants.EVENT_VPN_STATUS_CHANGED, options, (err) => {
      if (err) {
        console.error(TAG, `Failed to publish status: ${err.message}`);
      }
    });
  }

  private publishTraffic(upload: number, download: number, upSpeed: number, downSpeed: number): void {
    const options: commonEventManager.CommonEventPublishData = {
      parameters: {
        upload,
        download,
        upSpeed,
        downSpeed
      }
    };
    commonEventManager.publish(VpnConstants.EVENT_VPN_TRAFFIC_UPDATE, options, (err) => {
      if (err) {
        console.error(TAG, `Failed to publish traffic: ${err.message}`);
      }
    });
  }
}
