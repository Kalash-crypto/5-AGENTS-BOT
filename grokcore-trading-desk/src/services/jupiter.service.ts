import axios, { AxiosInstance } from 'axios';

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  amount: string;
  outAmount: string;
  otherAmountThreshold: string;
  slippageBps: number;
  priceImpactPct: number;
  routePlan: unknown[];
}

export interface JupiterSwapRequest {
  inputMint: string;
  outputMint: string;
  amount: number;
  walletAddress: string;
  slippageBps?: number;
}

export class JupiterService {
  private client: AxiosInstance;

  constructor(baseUrl?: string) {
    this.client = axios.create({
      baseURL: baseUrl ?? 'https://quote-api.jup.ag',
      timeout: 20000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async getQuote(inputMint: string, outputMint: string, amount: number, slippageBps = 50): Promise<JupiterQuote | null> {
    try {
      const response = await this.client.get('/v6/quote', {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        },
      });

      const quote = response.data as JupiterQuote;
      if (!quote) {
        return null;
      }

      return quote;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[JUPITER] Quote unavailable: ${message}`);
      return null;
    }
  }

  async buildSwapTransaction(payload: JupiterSwapRequest): Promise<Record<string, unknown> | null> {
    const quote = await this.getQuote(payload.inputMint, payload.outputMint, payload.amount, payload.slippageBps ?? 50);
    if (!quote) {
      return null;
    }

    try {
      const response = await this.client.post('/v6/swap-instructions', {
        quoteResponse: quote,
        userPublicKey: payload.walletAddress,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      });

      return response.data ?? {};
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[JUPITER] Swap instruction generation failed: ${message}`);
      return null;
    }
  }
}
