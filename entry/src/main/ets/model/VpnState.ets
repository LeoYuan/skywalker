export enum VpnStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error'
}

export interface VpnState {
  status: VpnStatus;
  connectedSince?: Date;
  currentNode?: string;
  error?: string;
}
