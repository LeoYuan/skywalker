import { ProxyNode } from './ProxyNode';

export interface DnsConfig {
  enable: boolean;
  listen: string;
  nameserver: string[];
  fallback?: string[];
}

export interface ProxyGroup {
  name: string;
  type: string;
  proxies: string[];
}

export interface Rule {
  type: string;
  matcher: string;
  target: string;
}

export interface ProxyConfig {
  proxies: ProxyNode[];
  dns?: DnsConfig;
  proxyGroups?: ProxyGroup[];
  rules?: Rule[];
}
