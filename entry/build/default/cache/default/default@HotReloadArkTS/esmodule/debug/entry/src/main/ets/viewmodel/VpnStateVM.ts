import { VpnStatus } from "@bundle:com.skywalker.proxy/entry/ets/model/VpnState";
import type { TrafficStats } from '../model/TrafficStats';
@Observed
export class VpnStateVM {
    status: VpnStatus = VpnStatus.DISCONNECTED;
    connectedSince: number = 0;
    currentNode: string = '';
    error: string = '';
    uploadTotal: number = 0;
    downloadTotal: number = 0;
    uploadSpeed: number = 0;
    downloadSpeed: number = 0;
    get isConnected(): boolean {
        return this.status === VpnStatus.CONNECTED;
    }
    get isTransitioning(): boolean {
        return this.status === VpnStatus.CONNECTING || this.status === VpnStatus.DISCONNECTING;
    }
    get statusLabel(): string {
        switch (this.status) {
            case VpnStatus.DISCONNECTED:
                return 'Tap to Connect';
            case VpnStatus.CONNECTING:
                return 'Connecting...';
            case VpnStatus.CONNECTED:
                return `Connected`;
            case VpnStatus.DISCONNECTING:
                return 'Disconnecting...';
            case VpnStatus.ERROR:
                return this.error || 'Error';
            default:
                return '';
        }
    }
    get durationText(): string {
        if (!this.connectedSince || this.status !== VpnStatus.CONNECTED) {
            return '';
        }
        const elapsed = Math.floor((Date.now() - this.connectedSince) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    updateStatus(status: VpnStatus, error?: string): void {
        this.status = status;
        if (status === VpnStatus.CONNECTED) {
            this.connectedSince = Date.now();
        }
        else if (status === VpnStatus.DISCONNECTED) {
            this.connectedSince = 0;
            this.uploadTotal = 0;
            this.downloadTotal = 0;
            this.uploadSpeed = 0;
            this.downloadSpeed = 0;
        }
        if (error) {
            this.error = error;
        }
    }
    updateTraffic(stats: TrafficStats): void {
        this.uploadTotal = stats.uploadTotal;
        this.downloadTotal = stats.downloadTotal;
        this.uploadSpeed = stats.uploadSpeed;
        this.downloadSpeed = stats.downloadSpeed;
    }
}
