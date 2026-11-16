import axios, { AxiosInstance } from 'axios';
import { safeNumber } from '../utils/helpers';

export interface GMGNTokenSecurity {
  tokenAddress: string;
  chain: string;
  reputationScore: number;
  honeypotRisk: number;
  topHolderConcentration: number;
  liquidityUsd: number;
  buyTax: number;
  sellTax: number;
  rugPullRisk: number;
  holderCount: number;
  riskFlags: string[];
}

export class GMGNService {
  private client: AxiosInstance;

  constructor(baseUrl?: string, apiKey?: string) {
    this.client = axios.create({
      baseURL: baseUrl ?? 'https://api.gmgn.ai',
      timeout: 15000,
      headers: {
        Accept: 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
    });
  }

  async getSmartMoneyWallets(chain: string = 'solana', limit = 10): Promise<unknown[]> {
    try {
      const response = await this.client.get(`/v1/${chain}/smart-money`, {
        params: { limit },
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[GMGN] Smart money endpoint unavailable: ${message}`);
      return [];
    }
  }

  async getTokenSecurity(tokenAddress: string, chain: string = 'solana'): Promise<GMGNTokenSecurity | null> {
    try {
      const response = await this.client.get(`/v1/${chain}/token-security`, {
        params: { tokenAddress },
      });

      const payload = response.data?.data ?? response.data;
      if (!payload) {
        return null;
      }

      return {
        tokenAddress,
        chain,
        reputationScore: safeNumber(payload.reputationScore ?? payload.rugScore ?? payload.reputation, 0),
        honeypotRisk: safeNumber(payload.honeypotRisk ?? payload.honeypot ?? payload.honeypotScore, 0),
        topHolderConcentration: safeNumber(payload.topHolderConcentration ?? payload.topHolders, 0),
        liquidityUsd: safeNumber(payload.liquidityUsd ?? payload.liquidity, 0),
        buyTax: safeNumber(payload.buyTax ?? payload.buyTaxPercent, 0),
        sellTax: safeNumber(payload.sellTax ?? payload.sellTaxPercent, 0),
        rugPullRisk: safeNumber(payload.rugPullRisk ?? payload.rugRatio ?? payload.rugScore, 0),
        holderCount: safeNumber(payload.holderCount ?? payload.holders, 0),
        riskFlags: Array.isArray(payload.riskFlags) ? payload.riskFlags : [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[GMGN] Token security unavailable for ${tokenAddress}: ${message}`);
      return null;
    }
  }

  async getTokenMetrics(tokenAddress: string, chain: string = 'solana'): Promise<Record<string, unknown>> {
    try {
      const response = await this.client.get(`/v1/${chain}/token-metrics`, {
        params: { tokenAddress },
      });
      return response.data?.data ?? response.data ?? {};
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[GMGN] Token metrics unavailable for ${tokenAddress}: ${message}`);
      return {};
    }
  }
}
