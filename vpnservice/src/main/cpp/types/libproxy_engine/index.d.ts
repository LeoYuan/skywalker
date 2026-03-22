export interface TrafficStats {
  uploadTotal: number;
  downloadTotal: number;
  uploadSpeed: number;
  downloadSpeed: number;
}

export interface ProxyGroupInfo {
  name: string;
  type: string;
  now: string;
  proxies: string[];
}

export function StartEngine(configPath: string, tunFd: number): boolean;
export function StopEngine(): void;
export function GetTrafficStats(): TrafficStats;
export function SwitchProxy(groupName: string, proxyName: string): boolean;
export function GetProxyGroups(): ProxyGroupInfo[];
export function TestProxyLatency(proxyName: string, testUrl: string, timeout: number): number;
export function RegisterStateCallback(callback: (state: string, error?: string) => void): void;
export function RegisterProtectCallback(callback: (fd: number) => Promise<void>): void;
