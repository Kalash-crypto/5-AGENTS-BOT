import { Command } from 'commander';
import { GrokCore } from './core/GrokCore';
import { config, validateConfig } from './core/config';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('grokcore')
  .description('GrokCore Trading Desk CLI')
  .version('1.0.0');

program
  .option('--token-address <address>', 'Token contract address to review')
  .option('--symbol <symbol>', 'Token symbol (for example SOL, JUP, BONK)')
  .option('--chain <chain>', 'Chain to evaluate (solana, base, bsc, ethereum)', 'solana')
  .option('--amount-usd <amount>', 'Base position size in USD', '250')
  .option('--live', 'Enable live-mode checks; does not execute unless explicitly enabled in env and mission-specific logic is approved')
  .option('--mode <mode>', 'Execution mode: research or live', config.appMode);

program.parse(process.argv);

const options = program.opts();
const tokenAddress = options.tokenAddress ?? 'So11111111111111111111111111111111111111112';
const symbol = options.symbol ?? 'SOL';
const chain = options.chain ?? 'solana';
const amountUsd = Number(options.amountUsd ?? config.maxPositionUsd);
const mode = (options.mode ?? config.appMode) as 'research' | 'live';

if (mode === 'live') {
  config.appMode = 'live';
  config.liveTradingEnabled = true;
}

const validation = validateConfig();
if (!validation.valid && config.liveTradingEnabled) {
  logger.warn('Live config validation failed. The system will still analyze in safe mode if possible.', {
    issues: validation.issues,
  });
}

(async () => {
  const desk = new GrokCore();
  const result = await desk.analyzeOpportunity({
    tokenAddress,
    symbol,
    chain,
    amountUsd,
  });

  console.log(JSON.stringify(result, null, 2));
})().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown CLI error';
  logger.error('GrokCore CLI failed.', { error: message });
  process.exitCode = 1;
});
