export class Constants {
  // CommonEvent names
  static readonly EVENT_VPN_STATUS_CHANGED: string = 'proxy.vpn.STATUS_CHANGED';
  static readonly EVENT_VPN_TRAFFIC_UPDATE: string = 'proxy.vpn.TRAFFIC_UPDATE';

  // Want action strings
  static readonly ACTION_VPN_START: string = 'proxy.vpn.START';
  static readonly ACTION_VPN_STOP: string = 'proxy.vpn.STOP';

  // Preference keys
  static readonly PREF_STORE_NAME: string = 'harmony_proxy_prefs';
  static readonly PREF_SUBSCRIPTIONS: string = 'subscriptions';
  static readonly PREF_ACTIVE_SUBSCRIPTION_ID: string = 'active_subscription_id';
  static readonly PREF_SELECTED_NODE_NAME: string = 'selected_node_name';
  static readonly PREF_AUTO_CONNECT: string = 'auto_connect';
  static readonly PREF_THEME: string = 'theme';

  // Default DNS servers
  static readonly DEFAULT_DNS_NAMESERVERS: string[] = [
    'https://dns.alidns.com/dns-query',
    'https://dns.google/dns-query'
  ];
  static readonly DEFAULT_DNS_BOOTSTRAP: string[] = [
    '223.5.5.5',
    '8.8.8.8'
  ];

  // VPN TUN config
  static readonly TUN_ADDRESS: string = '10.0.0.2';
  static readonly TUN_GATEWAY: string = '10.0.0.1';
  static readonly TUN_PREFIX_LENGTH: number = 24;
  static readonly TUN_MTU: number = 1500;
  static readonly TUN_DNS_ADDRESSES: string[] = ['8.8.8.8', '8.8.4.4'];

  // Engine config
  static readonly ACTIVE_CONFIG_FILENAME: string = 'active_config.yaml';
  static readonly SUBSCRIPTIONS_DIR: string = 'subscriptions';

  // Network
  static readonly HTTP_USER_AGENT: string = 'clash-verge/v2.0.0';
  static readonly LATENCY_TEST_URL: string = 'https://www.gstatic.com/generate_204';
  static readonly LATENCY_TEST_TIMEOUT: number = 5000;

  // Traffic update interval (ms)
  static readonly TRAFFIC_UPDATE_INTERVAL: number = 1000;
}
