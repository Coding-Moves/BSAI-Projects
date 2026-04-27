
export interface UserAccount {
  email: string;
  username: string;
  passwordHash: string; // Simulated hashed password
  publicKey: string; // Base64 exported SPKI
  privateKeyEncrypted?: string; // In a real app, private key is encrypted with user password
  fullKeys?: UserKeys; // Kept in memory for the demo session
}

export interface EncryptedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  encryptedBlob: Blob;
  encryptedKey: string; // Base64 encoded RSA-encrypted AES key (for the current recipient)
  iv: string; // Initialization vector for AES-GCM
  ownerEmail: string; // Owner identification
  recipientEmail: string; // Recipient identification
  sharedBy?: string; // Email of the user who shared it
}

export interface UserKeys {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  exportedPublicKey: string;
  exportedPrivateKey: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserAccount | null;
  token: string | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'UPLOAD' | 'DOWNLOAD' | 'LOGIN' | 'KEY_GEN' | 'SHARE' | 'REGISTER';
  details: string;
}
