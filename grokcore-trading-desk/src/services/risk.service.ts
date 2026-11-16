export interface SafetyAssessment {
  approved: boolean;
  riskFlags: string[];
  safetyScore: number;
}

export class RiskService {
  static mandatoryStopLossPercent = -8;

  static evaluateSafety(input: {
    honeypotRisk?: number;
    buyTax?: number;
    sellTax?: number;
    rugPullRisk?: number;
    topHolderConcentration?: number;
    liquidityUsd?: number;
    reputationScore?: number;
  }): SafetyAssessment {
    const riskFlags: string[] = [];

    const honeypotRisk = Number(input.honeypotRisk ?? 0);
    const buyTax = Number(input.buyTax ?? 0);
    const sellTax = Number(input.sellTax ?? 0);
    const rugPullRisk = Number(input.rugPullRisk ?? 0);
    const topHolderConcentration = Number(input.topHolderConcentration ?? 0);
    const liquidityUsd = Number(input.liquidityUsd ?? 0);
    const reputationScore = Number(input.reputationScore ?? 100);

    if (honeypotRisk > 0.4) {
      riskFlags.push('honeypot-risk');
    }

    if (buyTax > 5 || sellTax > 10) {
      riskFlags.push('tax-risk');
    }

    if (rugPullRisk > 0.45) {
      riskFlags.push('rug-ratio-risk');
    }

    if (topHolderConcentration > 0.4) {
      riskFlags.push('top-holder-concentration');
    }

    if (liquidityUsd < 25000) {
      riskFlags.push('low-liquidity');
    }

    if (reputationScore < 55) {
      riskFlags.push('low-reputation');
    }

    const safetyScore = Math.max(0, 100 - riskFlags.length * 18);
    const approved = riskFlags.length === 0 && safetyScore >= 70;

    return { approved, riskFlags, safetyScore };
  }

  static buildTakeProfitLevels(entryPrice: number): number[] {
    return [entryPrice * 1.08, entryPrice * 1.16, entryPrice * 1.25];
  }

  static createStopLossPrice(entryPrice: number): number {
    return entryPrice * (1 + this.mandatoryStopLossPercent / 100);
  }

  static stopLossViolation(currentPrice: number, entryPrice: number): boolean {
    return currentPrice <= this.createStopLossPrice(entryPrice);
  }
}
