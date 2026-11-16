export type Chain = 'solana' | 'base' | 'bsc' | 'ethereum';
export type AgentStatus = 'approved' | 'rejected' | 'needs-input' | 'research';
export type AgentName = 'SMART$' | 'TRENDS' | 'DEBATE' | 'ROUTER' | 'EXEC';

export interface AgentSignal {
  agent: AgentName;
  status: AgentStatus;
  confidence: number;
  summary: string;
  signal: 'bullish' | 'bearish' | 'neutral' | 'risk-off';
  riskFlags: string[];
  metadata?: Record<string, unknown>;
}

export interface TradePlan {
  tokenAddress: string;
  symbol: string;
  chain: Chain;
  entryReason: string;
  positionSizeRecommendation: string;
  stopLossPercent: number;
  stopLossPrice: string;
  takeProfitLevels: string[];
  riskFlags: string[];
  status: 'research' | 'approved' | 'rejected';
  decision: 'buy' | 'hold' | 'reject';
  confidence: number;
  agents: AgentSignal[];
  liveMode: boolean;
}

export interface OpportunityRequest {
  tokenAddress: string;
  symbol: string;
  chain?: Chain;
  amountUsd?: number;
  inputMint?: string;
  outputMint?: string;
}
