import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { config } from '../core/config';

export class WalletService {
  private rpcUrl: string;
  private connection: Connection;

  constructor(rpcUrl = config.rpcUrl) {
    this.rpcUrl = rpcUrl;
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }

  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balanceLamports = await this.connection.getBalance(publicKey);
      return balanceLamports / 1_000_000_000;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[WALLET] Balance lookup failed: ${message}`);
      return 0;
    }
  }

  getKeypairFromPrivateKey(privateKey: string): Keypair | null {
    try {
      const cleaned = privateKey.trim();
      if (!cleaned) {
        return null;
      }

      const bytes = cleaned.includes(',')
        ? cleaned.split(',').map((v) => Number(v.trim()))
        : Array.from(Buffer.from(cleaned, 'hex'));

      return Keypair.fromSecretKey(Uint8Array.from(bytes));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[WALLET] Private key parsing failed: ${message}`);
      return null;
    }
  }

  async validateWalletSetup(): Promise<{ valid: boolean; walletAddress?: string; balanceSol?: number }> {
    if (!config.walletAddress) {
      return { valid: false };
    }

    const balance = await this.getWalletBalance(config.walletAddress);
    return {
      valid: true,
      walletAddress: config.walletAddress,
      balanceSol: balance,
    };
  }
}
