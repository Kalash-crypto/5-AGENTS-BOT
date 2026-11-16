import { AgentSignal } from '../core/types';

export class DebateAgent {
  async runDebate(symbol: string, smartMoney: AgentSignal, trends: AgentSignal): Promise<AgentSignal> {
    const bullPoints = [
      `Smart money conditions are ${smartMoney.status === 'approved' ? 'constructive' : 'uncertain'} for ${symbol}.`,
      `Trend analysis indicates ${trends.signal}.`,
      `Risk discipline remains intact when stop-loss and exposure are controlled.`,
    ];

    const bearPoints = [
      `External market conditions may still undermine the trade if momentum weakens.`,
      `The system must reject trades that do not show a meaningful safety buffer.`,
      `Low-confidence or blocked agent signals should prevent high-conviction entry.`,
    ];

    const bullishScore =
      (smartMoney.status === 'approved' ? 38 : smartMoney.status === 'needs-input' ? 18 : 5) +
      (trends.status === 'approved' ? 28 : trends.status === 'needs-input' ? 12 : 4) +
      (smartMoney.confidence + trends.confidence) * 25;

    const bearishScore =
      (smartMoney.status === 'rejected' ? 35 : 12) +
      (trends.status === 'rejected' ? 30 : 10) +
      15;

    const totalScore = bullishScore - bearishScore;
    const approved = totalScore >= 28;

    return {
      agent: 'DEBATE',
      status: approved ? 'approved' : 'rejected',
      confidence: Math.min(0.94, Math.max(0.42, totalScore / 100)),
      signal: approved ? 'bullish' : 'bearish',
      summary: approved
        ? `Bull argument wins: ${bullPoints.join(' ')}`
        : `Bear argument wins: ${bearPoints.join(' ')}`,
      riskFlags: approved ? [] : ['debate-failed-consensus'],
      metadata: {
        bullPoints,
        bearPoints,
        bullishScore,
        bearishScore,
      },
    };
  }
}
