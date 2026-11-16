# GrokCore Trading Desk

GrokCore Trading Desk is a TypeScript/Node.js project with a **read-only research dashboard** for viewing live market data from the public DexScreener API. The dashboard does not place trades, connect to a wallet, or expose private keys.

## Research dashboard

The dashboard shows real-time token pair information returned by DexScreener: observed price, liquidity, 24-hour volume and price change, plus the provider's chart link. It refreshes on request and does not invent missing market data. It does not produce buy/sell recommendations or present the current prototype agents' output as verified signals.

### Run locally

Requirements: Node.js 18+ and npm.

```bash
cd grokcore-trading-desk
npm install
cp .env.example .env
npm run dashboard
```

Open <http://127.0.0.1:3000>. Enter a token address and select its chain, then choose **Refresh data**. The server binds to loopback by default. Optional `DASHBOARD_HOST` and `DASHBOARD_PORT` variables can change the bind address and port; do not expose this service publicly without adding authentication, TLS, and operational protections.

The dashboard fetches market data server-side from `https://api.dexscreener.com/latest/dex/tokens/{address}`. No GMGN key, wallet address, or private key is needed. DexScreener availability, token coverage, update cadence, and API limits are controlled by that provider. A missing pair is shown as unavailable rather than replaced with fake values.

### Production build

```bash
npm run build
npm run dashboard:start
```

## Existing CLI

The CLI is separate from the dashboard. For example:

```bash
npm run research -- --token-address <TOKEN_ADDRESS> --symbol <SYMBOL> --chain solana
```

**Do not use the CLI's live mode for real-money trading.** The current agent/execution implementation has not been validated as production trading software and includes placeholder values; the dashboard intentionally does not call it. Live trading should remain disabled.

## Project structure

```text
grokcore-trading-desk/
├── src/
│   ├── dashboard/
│   │   ├── server.ts
│   │   └── public/
│   │       ├── index.html
│   │       ├── app.js
│   │       └── styles.css
│   └── ...
└── docs/
    └── ARCHITECTURE.md
```

See `docs/ARCHITECTURE.md` for system boundaries. Keep `.env` and all credentials private; never commit them.
