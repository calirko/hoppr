export type ClientType = 'ANYDESK' | 'RUSTDESK' | 'RDP';

export interface VpnConfig {
  fileName: string;
  fileContent: string;
  username: string | null;
  password: string | null;
  encryptionKey: string | null;
}

export interface Connection {
  id: string;
  userId: string;
  type: ClientType;
  label: string;
  host: string;
  port: number | null;
  username: string | null;
  password: string | null;
  domain: string | null;
  notes: string | null;
  isVpnRequired: boolean;
  vpn: VpnConfig | null;
  lastLaunchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}
