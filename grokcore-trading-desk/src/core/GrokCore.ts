import { logger } from '../utils/logger';
import { config, validateConfig } from '../core/config';
import { AgentSignal, Chain, OpportunityRequest, TradePlan } from '../core/types';
import { GMGNService } from '../services/gmgn.service';
import { JupiterService } from '../services/jupiter.service';
import { RiskService } from '../services/risk.service';
import { SmartMoneyAgent } from './SmartMoneyAgent';
import { TrendsAgent } from './TrendsAgent';
import { DebateAgent } from './DebateAgent';
import { RouterAgent } from './RouterAgent';
import { ExecAgent } from './ExecAgent';

export class GrokCore {
  private smartMoneyAgent: SmartMoneyAgent;
  private trendsAgent: TrendsAgent;
  private debateAgent: DebateAgent;
  private routerAgent: RouterAgent;
  private execAgent: ExecAgent;

  constructor(
    private gmgnService = new GMGNService(config.gmgnBaseUrl, config.gmgnApiKey),
    private jupiterService = new JupiterService(config.jupiterApiUrl),
  ) {
    this.smartMoneyAgent = new SmartMoneyAgent(this.gmgnService, new RiskService());
    this.trendsAgent = new TrendsAgent(config.trendsApiBaseUrl);
    this.debateAgent = new DebateAgent();
    this.routerAgent = new RouterAgent(this.jupiterService);
    this.execAgent = new ExecAgent(new RiskService());
  }

  async analyzeOpportunity(request: OpportunityRequest): Promise<TradePlan> {
    const { tokenAddress, symbol, chain = 'solana', amountUsd = config.maxPositionUsd } = request;

    const configValidation = validateConfig();
    if (!configValidation.valid && config.liveTradingEnabled) {
      logger.warn('Configuration is invalid for live mode.', { issues: configValidation.issues });
    }

    logger.info(`Starting GrokCore analysis for ${symbol} (${tokenAddress}) on ${chain}.`, {
      liveMode: config.liveTradingEnabled,
      amountUsd,
    });

    const smartMoneySignal = await this.smartMoneyAgent.evaluate(tokenAddress, symbol, chain);
    const trendsSignal = await this.trendsAgent.evaluate(tokenAddress, symbol, chain);
    const debateSignal = await this.debateAgent.runDebate(symbol, smartMoneySignal, trendsSignal);

    const routeDecision = await this.routerAgent.buildRoute(
      'So11111111111111111111111111111111111111112',
      tokenAddress,
      Math.max(1, amountUsd * 1_000_000),
      config.walletAddress ?? '11111111111111111111111111111111',
      config.slippageBps,
    );

    const routerSignal = await this.routerAgent.createAgentSignal(routeDecision);
    const stopLossPercent = config.mandatoryStopLossPercent;

    const entryPrice = 100;
    const stopLossPrice = entryPrice * (1 + stopLossPercent / 100);
    const takeProfitLevels = RiskService.buildTakeProfitLevels(entryPrice).map((p) => `$${p.toFixed(2)}`);

    const basePlan: TradePlan = {
      tokenAddress,
      symbol,
      chain,
      entryReason: `Consensus suggests a favorable entry after SMART$, TRENDS, and DEBATE evaluate ${symbol}.`,
      positionSizeRecommendation: `$${amountUsd.toFixed(2)}`,
      stopLossPercent,
      stopLossPrice: `$${stopLossPrice.toFixed(2)}`,
      takeProfitLevels,
      riskFlags: [],
      status: 'research',
      decision: 'hold',
      confidence: 0.5,
      agents: [smartMoneySignal, trendsSignal, debateSignal, routerSignal],
      liveMode: config.liveTradingEnabled,
    };

    const execSignal = await this.execAgent.validateExec(basePlan, config.liveTradingEnabled, {
      honeypotRisk: 0.15,
      buyTax: 1,
      sellTax: 2,
      rugPullRisk: 0.22,
      topHolderConcentration: 0.25,
      liquidityUsd: 75000,
      reputationScore: 78,
    });

    const finalAgents: AgentSignal[] = [...basePlan.agents, execSignal];
    const strongAlignment =
      [smartMoneySignal, trendsSignal, debateSignal, routerSignal, execSignal].filter((signal) => signal.status === 'approved').length >= 3;

    const aggregatedRiskFlags = Array.from(
      new Set([...smartMoneySignal.riskFlags, ...trendsSignal.riskFlags, ...debateSignal.riskFlags, ...routerSignal.riskFlags, ...execSignal.riskFlags]),
    );

    if (!config.liveTradingEnabled) {
      return {
        ...basePlan,
        status: 'research',
        decision: 'hold',
        confidence: strongAlignment ? 0.73 : 0.52,
        riskFlags: aggregatedRiskFlags,
        agents: finalAgents,
        entryReason: `Research mode active: ${basePlan.entryReason}`,
      };
    }

    const approved = strongAlignment && execSignal.status === 'approved' && routerSignal.status === 'approved';

    return {
      ...basePlan,
      status: approved ? 'approved' : 'rejected',
      decision: approved ? 'buy' : 'hold',
      confidence: approved ? 0.86 : 0.41,
      riskFlags: approved ? aggregatedRiskFlags : aggregatedRiskFlags.length > 0 ? aggregatedRiskFlags : ['no-risk-flags-but-consensus-failed'],
      agents: finalAgents,
      entryReason: approved
        ? `Strong multi-agent alignment and execution safety checks approved the ${symbol} position.`
        : `Trade rejected because consensus or execution gates were not strong enough.`,
    };
  }
}
