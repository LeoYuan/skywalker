import { ProxyNode } from './ProxyNode';

export interface Subscription {
  id: string;
  name: string;
  url: string;
  nodes: ProxyNode[];
  lastUpdated?: number;
  expiresAt?: number;
  trafficUsed?: number;
  trafficTotal?: number;
  error?: string;
}

export interface SubscriptionUserInfo {
  upload: number;
  download: number;
  total: number;
  expire: number;
}

export function parseSubscriptionUserInfo(header: string): SubscriptionUserInfo {
  const pairs: string[][] = header.split(';').map((s: string): string[] => s.trim().split('='));
  return {
    upload: Number(pairs.find((p: string[]): boolean => p[0] === 'upload')?.[1] ?? 0),
    download: Number(pairs.find((p: string[]): boolean => p[0] === 'download')?.[1] ?? 0),
    total: Number(pairs.find((p: string[]): boolean => p[0] === 'total')?.[1] ?? 0),
    expire: Number(pairs.find((p: string[]): boolean => p[0] === 'expire')?.[1] ?? 0),
  };
}
