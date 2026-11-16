# GrokCore Trading Desk

GrokCore Trading Desk is a production-oriented multi-agent cryptocurrency trading research and execution engine built in TypeScript and Node.js. It is designed to operate in safe research mode by default and only move to live execution when explicitly enabled.

This project orchestrates five specialized agent modules inspired by real trading stack patterns:

- SMART$ Agent: smart money flow, whale wallet tracking, holder analysis, token security checks
- TRENDS Agent: momentum and trend research using real market intelligence APIs
- DEBATE Agent: structured bull vs bear risk analysis
- ROUTER Agent: real Jupiter routing / quote logic for Solana swaps
- EXEC Agent: hard execution gates and mandatory safety checks

## Key principles

- Safe by default: research mode is enabled unless `LIVE_TRADING_ENABLED=true`
- Mandatory stop-loss: every position is protected by a -8% stop-loss
- No mock data: all integrations are designed around external APIs and live wallet data
- Real integrations only: GMGN, Jupiter, Solana RPC, and configurable third-party providers
- Strong multi-agent consensus: the system will not execute trades unless the system is sufficiently aligned

## Project structure

```text
grokcore-trading-desk/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── src/
│   ├── index.ts
│   ├── core/
│   │   ├── GrokCore.ts
│   │   ├── types.ts
│   │   └── config.ts
│   ├── agents/
│   │   ├── SmartMoneyAgent.ts
│   │   ├── TrendsAgent.ts
│   │   ├── DebateAgent.ts
│   │   ├── RouterAgent.ts
│   │   └── ExecAgent.ts
│   ├── services/
│   │   ├── gmgn.service.ts
│   │   ├── jupiter.service.ts
│   │   ├── risk.service.ts
│   │   └── wallet.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── cli.ts
└── docs/
    └── ARCHITECTURE.md
```

## Requirements

- Node.js 18+
- npm 9+
- Solana RPC access
- Optional API keys for GMGN and advanced third-party market feeds
- A wallet private key only for live execution; never commit it to Git

## Installation

```bash
cd grokcore-trading-desk
npm install
cp .env.example .env
```

Then fill in your environment variables in `.env`.

## Research mode

```bash
npm run research -- --token-address <TOKEN_ADDRESS> --symbol <SYMBOL> --chain solana --amount-usd 250
```

This mode performs analysis without executing on-chain trades.

## Live mode

WARNING: live trading is dangerous and should only be enabled when you understand the risks.

```bash
npm run trade -- --token-address <TOKEN_ADDRESS> --symbol <SYMBOL> --chain solana --amount-usd 250 --live
```

Set the following in `.env` before enabling live mode:

- `LIVE_TRADING_ENABLED=true`
- `RPC_URL` with a valid Solana RPC
- `SOLANA_PRIVATE_KEY` with the private key of the wallet to trade from
- `WALLET_ADDRESS` matching that wallet
- `GMGN_API_KEY` if you are using the GMGN endpoints

## Environment variables

All configuration is controlled through `.env`.

### Required for safe default operation

- `APP_MODE`
- `LIVE_TRADING_ENABLED`
- `RPC_URL`

### Optional but recommended

- `GMGN_API_KEY`
- `GMGN_BASE_URL`
- `JUPITER_API_URL`
- `TRENDS_API_BASE_URL`
- `MAX_POSITION_USD`
- `MANDATORY_STOP_LOSS_PERCENT`

## Execution rules

- Every position uses a mandatory -8% stop-loss
- Trade execution requires agreement from multiple agents
- All safety gates must pass before approval
- Live mode requires explicit user opt-in

## Build

```bash
npm run build
```

## Notes

This is a real integration-ready trading desk. Some APIs require account setup, whitelisting, or credentials. The system is intentionally prepared for research and live execution only when configured and enabled.

## License

MIT
