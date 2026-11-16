import dotenv from 'dotenv';

dotenv.config();

export type Chain = 'solana' | 'base' | 'bsc' | 'ethereum';
export type AppMode = 'research' | 'live';

export interface ApplicationConfig {
  nodeEnv: string;
  appMode: AppMode;
  liveTradingEnabled: boolean;
  safeByDefault: boolean;
  rpcUrl: string;
  solanaPrivateKey?: string;
  walletAddress?: string;
  gmgnApiKey?: string;
  gmgnBaseUrl: string;
  jupiterApiUrl: string;
  trendsApiBaseUrl?: string;
  maxPositionUsd: number;
  mandatoryStopLossPercent: number;
  slippageBps: number;
  minConfidence: number;
  supportedChains: Chain[];
}

export const config: ApplicationConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appMode: (process.env.APP_MODE as AppMode) ?? 'research',
  liveTradingEnabled: String(process.env.LIVE_TRADING_ENABLED ?? 'false').toLowerCase() === 'true',
  safeByDefault: String(process.env.SAFE_BY_DEFAULT ?? 'true').toLowerCase() === 'true',
  rpcUrl: process.env.RPC_URL ?? 'https://api.mainnet-beta.solana.com',
  solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY || undefined,
  walletAddress: process.env.WALLET_ADDRESS || undefined,
  gmgnApiKey: process.env.GMGN_API_KEY || undefined,
  gmgnBaseUrl: process.env.GMGN_BASE_URL ?? 'https://api.gmgn.ai',
  jupiterApiUrl: process.env.JUPITER_API_URL ?? 'https://quote-api.jup.ag',
  trendsApiBaseUrl: process.env.TRENDS_API_BASE_URL || undefined,
  maxPositionUsd: Number(process.env.MAX_POSITION_USD ?? 250),
  mandatoryStopLossPercent: Number(process.env.MANDATORY_STOP_LOSS_PERCENT ?? -8),
  slippageBps: Number(process.env.SLIPPAGE_BPS ?? 50),
  minConfidence: Number(process.env.MIN_CONFIDENCE ?? 0.6),
  supportedChains: (process.env.SUPPORTED_CHAINS ?? 'solana,base,bsc,ethereum')
    .split(',')
    .map((chain) => chain.trim())
    .filter(Boolean) as Chain[],
};

export function validateConfig(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!config.rpcUrl) {
    issues.push('RPC_URL is required.');
  }

  if (config.liveTradingEnabled) {
    if (!config.solanaPrivateKey) {
      issues.push('SOLANA_PRIVATE_KEY is required in live mode.');
    }

    if (!config.walletAddress) {
      issues.push('WALLET_ADDRESS is required in live mode.');
    }
  }

  if (!Number.isFinite(config.maxPositionUsd) || config.maxPositionUsd <= 0) {
    issues.push('MAX_POSITION_USD must be a positive number.');
  }

  if (!Number.isFinite(config.mandatoryStopLossPercent) || config.mandatoryStopLossPercent >= 0) {
    issues.push('MANDATORY_STOP_LOSS_PERCENT must be negative (for example -8).');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
