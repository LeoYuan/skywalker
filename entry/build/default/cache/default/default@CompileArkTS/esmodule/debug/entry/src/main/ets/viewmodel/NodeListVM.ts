import type { ProxyNode } from '../model/ProxyNode';
interface NodeWithLatency {
    node: ProxyNode;
    latency: number; // -1 = untested, 0 = testing, >0 = ms, -2 = timeout/failed
}
@Observed
export class NodeListVM {
    nodes: NodeWithLatency[] = [];
    selectedNodeName: string = '';
    isTesting: boolean = false;
    setNodes(proxyNodes: ProxyNode[]): void {
        this.nodes = proxyNodes.map((node: ProxyNode): NodeWithLatency => ({
            node,
            latency: -1
        }));
    }
    selectNode(name: string): void {
        this.selectedNodeName = name;
    }
    get selectedNode(): ProxyNode | undefined {
        const found = this.nodes.find((n: NodeWithLatency): boolean => n.node.name === this.selectedNodeName);
        return found?.node;
    }
    setLatency(nodeName: string, latency: number): void {
        const entry = this.nodes.find((n: NodeWithLatency): boolean => n.node.name === nodeName);
        if (entry) {
            entry.latency = latency;
            // Trigger reactivity by replacing array
            this.nodes = [...this.nodes];
        }
    }
    setAllTesting(): void {
        this.isTesting = true;
        this.nodes = this.nodes.map((n: NodeWithLatency): NodeWithLatency => ({
            node: n.node,
            latency: 0
        }));
    }
    formatLatency(latency: number): string {
        if (latency === -1)
            return '\u2014'; // em dash for untested
        if (latency === 0)
            return '...';
        if (latency === -2)
            return 'timeout';
        return `${latency}ms`;
    }
    latencyColor(latency: number): string {
        if (latency <= 0)
            return '#8E8E93';
        if (latency <= 100)
            return '#34C759';
        if (latency <= 300)
            return '#FF9500';
        return '#FF3B30';
    }
}
export type { NodeWithLatency };
