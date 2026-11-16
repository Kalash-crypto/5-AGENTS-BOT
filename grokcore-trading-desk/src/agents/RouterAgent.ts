import { AgentSignal } from '../core/types';
import { JupiterService } from '../services/jupiter.service';

export interface RouteDecision {
  routeApproved: boolean;
  quoteAmount: string;
  priceImpact: number;
  provider: string;
  summary: string;
  route: Record<string, unknown> | null;
}

export class RouterAgent {
  constructor(private jupiterService: JupiterService) {}

  async buildRoute(
    inputMint: string,
    outputMint: string,
    amount: number,
    walletAddress: string,
    slippageBps = 50,
  ): Promise<RouteDecision> {
    const quote = await this.jupiterService.getQuote(inputMint, outputMint, amount, slippageBps);

    if (!quote) {
      return {
        routeApproved: false,
        quoteAmount: '0',
        priceImpact: Number.MAX_SAFE_INTEGER,
        provider: 'jupiter',
        summary: 'Unable to get a Jupiter route for this trade.',
        route: null,
      };
    }

    const priceImpactPct = Number(quote.priceImpactPct ?? 0);
    const routeApproved = priceImpactPct < 4 && Number(quote.outAmount ?? 0) > 0;

    return {
      routeApproved,
      quoteAmount: quote.outAmount ?? '0',
      priceImpact: priceImpactPct,
      provider: 'jupiter',
      summary: routeApproved
        ? 'Jupiter route found with acceptable impact.'
        : 'Jupiter route exceeded acceptable impact or generated no output.',
      route: quote,
    };
  }

  async createAgentSignal(routeDecision: RouteDecision): Promise<AgentSignal> {
    return {
      agent: 'ROUTER',
      status: routeDecision.routeApproved ? 'approved' : 'rejected',
      confidence: routeDecision.routeApproved ? 0.82 : 0.45,
      signal: routeDecision.routeApproved ? 'bullish' : 'bearish',
      summary: routeDecision.summary,
      riskFlags: routeDecision.routeApproved ? [] : ['route-invalid'],
      metadata: {
        provider: routeDecision.provider,
        quoteAmount: routeDecision.quoteAmount,
        priceImpact: routeDecision.priceImpact,
      },
    };
  }
}
