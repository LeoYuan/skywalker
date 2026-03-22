import { http } from '@kit.NetworkKit';
import { preferences } from '@kit.ArkData';
import { fileIo } from '@kit.CoreFileKit';
import { util } from '@kit.ArkTS';
import { Subscription, SubscriptionUserInfo, parseSubscriptionUserInfo } from '../model/Subscription';
import { ProxyNode } from '../model/ProxyNode';
import { Constants } from '../common/Constants';
import { Logger } from '../common/Logger';

interface FetchResult {
  body: string;
  userInfo: SubscriptionUserInfo | null;
  fileName: string | null;
}

interface SubscriptionMetadata {
  id: string;
  name: string;
  url: string;
  lastUpdated: number | undefined;
  expiresAt: number | undefined;
  trafficUsed: number | undefined;
  trafficTotal: number | undefined;
  error: string | undefined;
}

export class SubscriptionManager {
  private context: Context;
  private subscriptions: Subscription[] = [];
  private prefStore: preferences.Preferences | null = null;

  constructor(context: Context) {
    this.context = context;
  }

  async init(): Promise<void> {
    this.prefStore = await preferences.getPreferences(this.context, Constants.PREF_STORE_NAME);
    const raw = await this.prefStore.get(Constants.PREF_SUBSCRIPTIONS, '[]') as string;
    const metadataList: Subscription[] = JSON.parse(raw) as Subscription[];
    // Reload nodes from cached YAML files
    for (const sub of metadataList) {
      try {
        const yamlPath = `${this.context.filesDir}/${Constants.SUBSCRIPTIONS_DIR}/${sub.id}.yaml`;
        const content = fileIo.readTextSync(yamlPath);
        sub.nodes = this.parseProxiesFromYaml(content);
      } catch (e) {
        Logger.warn(`Failed to load nodes for subscription ${sub.id}`);
        sub.nodes = [];
      }
    }
    this.subscriptions = metadataList;
  }

  async addSubscription(url: string, name?: string): Promise<Subscription> {
    const result = await this.fetchSubscription(url);

    const proxies = this.parseProxiesFromYaml(result.body);
    if (proxies.length === 0) {
      throw new Error('No proxies found in subscription');
    }

    const id = util.generateRandomUUID(false);
    const subscription: Subscription = {
      id: id,
      name: name || result.fileName || url,
      url: url,
      nodes: proxies,
      lastUpdated: Date.now(),
      expiresAt: result.userInfo ? result.userInfo.expire * 1000 : undefined,
      trafficUsed: result.userInfo ? result.userInfo.upload + result.userInfo.download : undefined,
      trafficTotal: result.userInfo ? result.userInfo.total : undefined,
    };

    // Save raw YAML to file
    await this.saveYamlFile(id, result.body);

    this.subscriptions.push(subscription);
    await this.persist();

    return subscription;
  }

  async refreshSubscription(subscriptionId: string): Promise<Subscription> {
    const index = this.subscriptions.findIndex((s: Subscription): boolean => s.id === subscriptionId);
    if (index < 0) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const sub = this.subscriptions[index];
    const result = await this.fetchSubscription(sub.url);
    const proxies = this.parseProxiesFromYaml(result.body);
    if (proxies.length === 0) {
      throw new Error('No proxies found in refreshed subscription YAML');
    }

    sub.nodes = proxies;
    sub.lastUpdated = Date.now();
    sub.error = undefined;
    if (result.userInfo) {
      sub.expiresAt = result.userInfo.expire * 1000;
      sub.trafficUsed = result.userInfo.upload + result.userInfo.download;
      sub.trafficTotal = result.userInfo.total;
    }

    await this.saveYamlFile(sub.id, result.body);
    await this.persist();

    return sub;
  }

  async removeSubscription(subscriptionId: string): Promise<void> {
    this.subscriptions = this.subscriptions.filter((s: Subscription): boolean => s.id !== subscriptionId);
    // Remove cached YAML file
    try {
      const yamlPath = `${this.context.filesDir}/${Constants.SUBSCRIPTIONS_DIR}/${subscriptionId}.yaml`;
      fileIo.unlinkSync(yamlPath);
    } catch (e) {
      Logger.warn(`Failed to remove YAML file for ${subscriptionId}`);
    }
    await this.persist();
  }

  getSubscriptions(): Subscription[] {
    return this.subscriptions;
  }

  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.find((s: Subscription): boolean => s.id === subscriptionId);
  }

  getYamlPath(subscriptionId: string): string {
    return `${this.context.filesDir}/${Constants.SUBSCRIPTIONS_DIR}/${subscriptionId}.yaml`;
  }

  private async fetchSubscription(url: string): Promise<FetchResult> {
    const httpRequest = http.createHttp();
    try {
      const response = await httpRequest.request(url, {
        method: http.RequestMethod.GET,
        header: {
          'User-Agent': Constants.HTTP_USER_AGENT,
          'Accept': 'text/yaml, application/x-yaml, */*'
        }
      });

      if (response.responseCode !== 200) {
        throw new Error(`HTTP ${response.responseCode}`);
      }

      let body = response.result as string;

      // If the response doesn't look like YAML, try Base64 decoding
      if (!body.includes('proxies:') && !body.includes('proxy-groups:')) {
        try {
          const base64Helper = new util.Base64Helper();
          const rawBytes = base64Helper.decodeSync(body.trim());
          const decoder = new util.TextDecoder('utf-8');
          const decoded = decoder.decodeToString(new Uint8Array(rawBytes));
          if (decoded.includes('proxies:')) {
            body = decoded;
          }
        } catch (e) {
          // Not Base64, use original body
        }
      }

      let userInfo: SubscriptionUserInfo | null = null;
      const userInfoHeader = response.header?.['subscription-userinfo'] as string | undefined;
      if (userInfoHeader) {
        userInfo = parseSubscriptionUserInfo(userInfoHeader);
      }

      let fileName: string | null = null;
      const disposition = response.header?.['content-disposition'] as string | undefined;
      if (disposition) {
        const match = disposition.match(/filename="?([^";\s]+)"?/);
        if (match) {
          fileName = match[1].replace(/\.(yaml|yml)$/, '');
        }
      }

      const fetchResult: FetchResult = { body: body, userInfo: userInfo, fileName: fileName };
      return fetchResult;
    } finally {
      httpRequest.destroy();
    }
  }

  private parseProxiesFromYaml(yamlContent: string): ProxyNode[] {
    const nodes: ProxyNode[] = [];
    const lines = yamlContent.split('\n');
    let inProxies = false;
    let currentNode: Partial<ProxyNode> = {};

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect start of proxies section
      if (/^proxies\s*:/.test(trimmed)) {
        inProxies = true;
        continue;
      }

      // Detect end of proxies section (next top-level key)
      if (inProxies && /^[a-zA-Z]/.test(line) && !line.startsWith(' ') && !line.startsWith('-')) {
        inProxies = false;
        if (currentNode.name && currentNode.type && currentNode.server && currentNode.port) {
          nodes.push(currentNode as ProxyNode);
        }
        break;
      }

      if (!inProxies) continue;

      // Inline object format: - {name: xxx, server: xxx, port: 1028, type: ss, ...}
      if (trimmed.startsWith('- {') || trimmed.startsWith('-{')) {
        // Push previous node if valid
        if (currentNode.name && currentNode.type && currentNode.server && currentNode.port) {
          nodes.push(currentNode as ProxyNode);
        }
        currentNode = {};
        // Strip "- {" and trailing "}"
        let inner = trimmed.substring(trimmed.indexOf('{') + 1);
        if (inner.endsWith('}')) {
          inner = inner.substring(0, inner.length - 1);
        }
        this.parseInlineFields(currentNode, inner);
        continue;
      }

      // Multi-line list item
      if (trimmed.startsWith('- ')) {
        if (currentNode.name && currentNode.type && currentNode.server && currentNode.port) {
          nodes.push(currentNode as ProxyNode);
        }
        currentNode = {};
        const inlineMatch = trimmed.substring(2).match(/^(\w+)\s*:\s*(.+)/);
        if (inlineMatch) {
          this.setNodeField(currentNode, inlineMatch[1], inlineMatch[2]);
        }
        continue;
      }

      // Continuation of current node
      if (trimmed.includes(':')) {
        const kvMatch = trimmed.match(/^(\w[\w-]*)\s*:\s*(.+)/);
        if (kvMatch) {
          this.setNodeField(currentNode, kvMatch[1], kvMatch[2]);
        }
      }
    }

    // Push last node
    if (inProxies && currentNode.name && currentNode.type && currentNode.server && currentNode.port) {
      nodes.push(currentNode as ProxyNode);
    }

    return nodes;
  }

  private parseInlineFields(node: Partial<ProxyNode>, inner: string): void {
    // Parse comma-separated key: value pairs from inline YAML object
    // Handles values that may contain commas (e.g. cipher names won't, but names might)
    const parts = inner.split(',');
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx < 0) continue;
      const key = part.substring(0, colonIdx).trim();
      const value = part.substring(colonIdx + 1).trim();
      this.setNodeField(node, key, value);
    }
  }

  private setNodeField(node: Partial<ProxyNode>, key: string, value: string): void {
    const cleaned = value.replace(/^["']|["']$/g, '').trim();
    switch (key) {
      case 'name':
        node.name = cleaned;
        break;
      case 'type':
        node.type = cleaned;
        break;
      case 'server':
        node.server = cleaned;
        break;
      case 'port':
        node.port = Number(cleaned);
        break;
      default:
        break;
    }
  }

  private async saveYamlFile(id: string, content: string): Promise<void> {
    const dir = `${this.context.filesDir}/${Constants.SUBSCRIPTIONS_DIR}`;
    try {
      fileIo.mkdirSync(dir);
    } catch (e) {
      // Directory may already exist
    }
    const filePath = `${dir}/${id}.yaml`;
    const file = fileIo.openSync(filePath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
    fileIo.writeSync(file.fd, content);
    fileIo.closeSync(file.fd);
  }

  private async persist(): Promise<void> {
    if (!this.prefStore) return;
    // Store metadata without nodes (nodes are loaded from YAML files)
    const metadata = this.subscriptions.map((s: Subscription): SubscriptionMetadata => {
      const m: SubscriptionMetadata = {
        id: s.id,
        name: s.name,
        url: s.url,
        lastUpdated: s.lastUpdated,
        expiresAt: s.expiresAt,
        trafficUsed: s.trafficUsed,
        trafficTotal: s.trafficTotal,
        error: s.error,
      };
      return m;
    });
    await this.prefStore.put(Constants.PREF_SUBSCRIPTIONS, JSON.stringify(metadata));
    await this.prefStore.flush();
  }
}
