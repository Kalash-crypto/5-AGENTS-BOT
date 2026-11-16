import { AgentSignal, TradePlan } from '../core/types';
import { RiskService } from '../services/risk.service';

export class ExecAgent {
  constructor(private riskService: RiskService) {}

  async validateExec(
    plan: TradePlan,
    liveTradingEnabled: boolean,
    safetyInput?: {
      honeypotRisk?: number;
      buyTax?: number;
      sellTax?: number;
      rugPullRisk?: number;
      topHolderConcentration?: number;
      liquidityUsd?: number;
      reputationScore?: number;
    },
  ): Promise<AgentSignal> {
    if (!liveTradingEnabled) {
      return {
        agent: 'EXEC',
        status: 'rejected',
        confidence: 0.3,
        signal: 'risk-off',
        summary: 'Live execution is disabled while the system is in research mode.',
        riskFlags: ['live-trading-disabled'],
      };
    }

    const riskAssessment = this.riskService.evaluateSafety(safetyInput ?? {});
    const hasMandatoryStopLoss = plan.stopLossPercent === -8;

    if (!hasMandatoryStopLoss) {
      riskAssessment.riskFlags.push('mandatory-stop-loss-missing');
      riskAssessment.approved = false;
    }

    const approved = riskAssessment.approved && hasMandatoryStopLoss;

    return {
      agent: 'EXEC',
      status: approved ? 'approved' : 'rejected',
      confidence: approved ? 0.9 : 0.4,
      signal: approved ? 'bullish' : 'risk-off',
      summary: approved
        ? 'Safety gates passed and the execution layer is ready.'
        : 'Execution blocked by one or more hard safety gates.',
      riskFlags: riskAssessment.riskFlags,
      metadata: {
        mandatoryStopLossPercent: plan.stopLossPercent,
        safetyScore: riskAssessment.safetyScore,
      },
    };
  }
}
