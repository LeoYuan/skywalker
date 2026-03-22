export enum VpnStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error'
}

export class VpnConstants {
  static readonly EVENT_VPN_STATUS_CHANGED: string = 'proxy.vpn.STATUS_CHANGED';
  static readonly EVENT_VPN_TRAFFIC_UPDATE: string = 'proxy.vpn.TRAFFIC_UPDATE';
  static readonly ACTION_VPN_START: string = 'proxy.vpn.START';
  static readonly ACTION_VPN_STOP: string = 'proxy.vpn.STOP';
  static readonly TUN_ADDRESS: string = '10.0.0.2';
  static readonly TUN_GATEWAY: string = '10.0.0.1';
  static readonly TUN_PREFIX_LENGTH: number = 24;
  static readonly TUN_MTU: number = 1500;
  static readonly TUN_DNS_ADDRESSES: string[] = ['8.8.8.8', '8.8.4.4'];
  static readonly TRAFFIC_UPDATE_INTERVAL: number = 1000;
}
