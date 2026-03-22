import engine from 'libproxy_engine.so';

interface TrafficStats {
  uploadTotal: number;
  downloadTotal: number;
  uploadSpeed: number;
  downloadSpeed: number;
}

interface ProxyGroupInfo {
  name: string;
  type: string;
  now: string;
  proxies: string[];
}

export class NativeEngine {
  static async startEngine(configPath: string, tunFd: number): Promise<boolean> {
    return engine.StartEngine(configPath, tunFd);
  }

  static async stopEngine(): Promise<void> {
    engine.StopEngine();
  }

  static async testLatency(proxyName: string, url: string, timeout: number): Promise<number> {
    return engine.TestProxyLatency(proxyName, url, timeout);
  }

  static getTrafficStats(): TrafficStats {
    return engine.GetTrafficStats();
  }

  static switchProxy(groupName: string, proxyName: string): boolean {
    return engine.SwitchProxy(groupName, proxyName);
  }

  static getProxyGroups(): ProxyGroupInfo[] {
    return engine.GetProxyGroups();
  }

  static onStateChange(callback: (state: string, error?: string) => void): void {
    engine.RegisterStateCallback(callback);
  }

  static onProtectRequest(callback: (fd: number) => Promise<void>): void {
    engine.RegisterProtectCallback(callback);
  }
}

export { TrafficStats, ProxyGroupInfo };
