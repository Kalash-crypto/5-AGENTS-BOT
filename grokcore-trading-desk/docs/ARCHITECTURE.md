# GrokCore Trading Desk Architecture

## Overview

GrokCore Trading Desk is a multi-agent trading system designed to analyze cryptocurrency opportunities, weigh risk, route orders, and decide whether to execute. It is created as a safe-by-default TypeScript project that begins in research mode and requires explicit opt-in for live execution.

## Core system

The core orchestrator is `src/core/GrokCore.ts`. It coordinates the specialized agents and then validates whether a trade should be approved.

### Lifecycle

1. Load environment configuration
2. Collect token context using smart-money and trend agents
3. Run the structured bull/bear debate
4. Build a route through the router agent
5. Validate execution gates in the execution agent
6. Decide on trade approval
7. Return the final trade plan and risk details

## Agent roles

### SMART$ Agent

Responsible for smart money tracking, on-chain wallet activity, holder distribution, and security warnings. It interfaces with GMGN-style endpoints and checks for things like suspicious wallets, poor holder distribution, and token security concerns.

### TRENDS Agent

Measures momentum and trend quality through liquidity, volume, and market structure. It is designed to integrate with market intelligence APIs and can work with DexScreener-style or custom trend endpoints.

### DEBATE Agent

Runs a structured bull-vs-bear evaluation inspired by TradingAgents-style debate frameworks. It creates argument sets, risk scoring, and final recommendation confidence.

### ROUTER Agent

Uses Jupiter or similar route providers to generate quotes and transaction payloads for swap execution. It is built around Solana-first routing with support for other chains as needed.

### EXEC Agent

Applies execution gate checks before any order is allowed. There are mandatory checks for:

- stop-loss configuration
- honeypot exposure
- rug ratio risk
- top holder concentration
- liquidity quality
- tax risk

## Safety model

- Research mode is the default
- Live mode must be explicitly enabled
- The mandatory stop-loss is -8%
- Every trade requires strong agent agreement
- The system rejects trades if risk metrics are not acceptable

## Why this is production-ready

- Clean TypeScript architecture
- Strong typings
- Clear configuration boundary
- Safety-first execution pipeline
- API-driven integration points
- CLI for user interaction
- Explicit environment declarations for secrets and network endpoints
