import axios from 'axios';
import { AgentSignal, Chain } from '../core/types';

export class TrendsAgent {
  constructor(private baseUrl = process.env.TRENDS_API_BASE_URL ?? 'https://api.dexscreener.com') {}

  async evaluate(tokenAddress: string, symbol: string, chain: Chain = 'solana'): Promise<AgentSignal> {
    if (!this.baseUrl || this.baseUrl === 'https://api.dexscreener.com') {
      return {
        agent: 'TRENDS',
        status: 'needs-input',
        confidence: 0.5,
        signal: 'neutral',
        summary: `Trend feed is not configured. Research only for ${symbol}.`,
        riskFlags: ['trend-feed-not-configured'],
        metadata: {
          tokenAddress,
          chain,
          provider: 'external-market-data',
        },
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/latest/dex/tokens`, {
        params: { token: tokenAddress, chain },
        timeout: 15000,
      });

      const records = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      const first = records[0] ?? {};
      const bullishMomentum = Number(first.volume ?? 0) > 0 && Number(first.liquidity ?? 0) > 0;

      return {
        agent: 'TRENDS',
        status: bullishMomentum ? 'approved' : 'rejected',
        confidence: bullishMomentum ? 0.78 : 0.42,
        signal: bullishMomentum ? 'bullish' : 'bearish',
        summary: bullishMomentum
          ? `Momentum and trend data supports ${symbol} on ${chain}.`
          : `Trend signal is weak or not active for ${symbol}.`,
        riskFlags: bullishMomentum ? [] : ['weak-trend'],
        metadata: {
          tokenAddress,
          chain,
          firstRecord: first,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        agent: 'TRENDS',
        status: 'needs-input',
        confidence: 0.4,
        signal: 'neutral',
        summary: `Trend provider returned an error for ${symbol}: ${message}`,
        riskFlags: ['trend-provider-error'],
        metadata: {
          tokenAddress,
          chain,
          error: message,
        },
      };
    }
  }
}
