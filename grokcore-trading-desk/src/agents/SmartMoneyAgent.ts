import { AgentSignal, AgentStatus, AgentName, Chain } from '../core/types';
import { GMGNService } from './gmgn.service';
import { RiskService } from './risk.service';

export class SmartMoneyAgent {
  constructor(
    private gmgnService: GMGNService,
    private riskService: RiskService,
  ) {}

  async evaluate(tokenAddress: string, symbol: string, chain: Chain = 'solana'): Promise<AgentSignal> {
    const security = await this.gmgnService.getTokenSecurity(tokenAddress, chain);
    const wallets = await this.gmgnService.getSmartMoneyWallets(chain, 5);

    const riskAssessment = this.riskService.evaluateSafety({
      honeypotRisk: security?.honeypotRisk ?? 0,
      buyTax: security?.buyTax ?? 0,
      sellTax: security?.sellTax ?? 0,
      rugPullRisk: security?.rugPullRisk ?? 0,
      topHolderConcentration: security?.topHolderConcentration ?? 0,
      liquidityUsd: security?.liquidityUsd ?? 0,
      reputationScore: security?.reputationScore ?? 100,
    });

    const approved = riskAssessment.approved && wallets.length > 0;

    return {
      agent: 'SMART$',
      status: approved ? 'approved' : riskAssessment.riskFlags.length > 0 ? 'rejected' : 'needs-input',
      confidence: approved ? 0.82 : 0.48,
      signal: approved ? 'bullish' : 'risk-off',
      summary: approved
        ? `Smart money and security checks align for ${symbol} on ${chain}.` 
        : `SMART$ flagged abnormal wallet or security metrics for ${symbol}.`,
      riskFlags: riskAssessment.riskFlags,
      metadata: {
        tokenAddress,
        chain,
        smartMoneyWallets: wallets.length,
        security,
      },
    };
  }
}
