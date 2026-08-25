# Trading Notes

My personal trading library and documentation.

This is not a course. This is not professional advice. This is just my own journey - notes I've taken as I learn, develop, and grow as a trader.

## Philosophy

Trading can be complicated and overwhelming. There's endless information out there, and trying to learn everything will confuse you more than it helps.

My focus is on being **good enough**, not knowing everything.

Sometimes less is more. Enough is better than everything.

I'm not a professional or master trader. I'm just documenting what I learn along the way. This is for my own reference, and for anyone else who might find it useful.

I'll be updating this as I grow.

---

## The Curriculum

### Phase 1: The Game (The "Why")

Before touching a chart, you must understand the nature of the environment.

| # | File | Core Lesson |
|---|------|-------------|
| 1 | [What is Trading?](fundamentals/01-what-is-trading.md) | Trading is a game of probability and positive expectancy, not prediction. |
| 2 | [Market Fundamentals](fundamentals/02-market-fundamentals.md) | Price moves because of the matching engine, order book priority, and the interaction between Market and Limit orders. |
| 3 | [Market Nature](fundamentals/03-market-nature.md) | Markets are fractal and cyclical; they move between expansion and contraction while hunting for liquidity. |

**Goal:** Stop treating the market like a "Wizard" and start treating it like a system.

---

### Phase 2: The Map (The "Where")

This is the "Reading the Game" phase where you learn to identify context.

| # | File | Core Lesson |
|---|------|-------------|
| 4 | [Market Structure](fundamentals/04-market-structure.md) | Identifying the trend through Higher Highs/Lows and recognizing the difference between a Break of Structure (BOS) and a Change of Character (ChoCh). |
| 5 | [Timeframes](fundamentals/05-timeframes.md) | The "Ocean Analogy" - understanding that higher timeframes provide clarity while lower timeframes provide noise. |
| 6 | [Support and Resistance](fundamentals/06-support-and-resistance.md) | Identifying "floors" and "ceilings" where previous imbalances occurred, prioritizing higher timeframe levels. |

**Goal:** Stop looking for "signals" and start looking for "locations."

---

### Phase 3: The Execution (The "How")

The final technical layer and the rules for survival.

| # | File | Core Lesson |
|---|------|-------------|
| 7 | [Candlesticks](fundamentals/07-candlesticks.md) | Anatomy of agreement vs. rejection. Using Pinbars, Dojis, and Engulfing patterns to confirm a story already told by structure and levels. |
| 8 | [Risk Management](fundamentals/08-risk-management.md) | The 1-2% risk rule, position sizing, and the non-negotiable nature of stop losses. |
| 9 | [Trading Psychology](fundamentals/09-trading-psychology.md) | Managing the "Big Four" emotions (Fear, Greed, Hope, Frustration) and prioritizing process over outcome. |

**Goal:** Execute with precision, protect the capital, and master the mind.

---

## Strategy

How I approach trading.

- [What is a Trading Plan?](strategy/what-is-a-trading-plan.md) - Why you need one and what it should include
- [My Rules](strategy/rules.md) - Non-negotiable rules I follow
- [Supply and Demand Strategy](strategy/supply-and-demand/supply-and-demand.md) - My personal trading strategy

---

## Reference

- [Glossary](glossary.md) - Trading terms and definitions

---

## How to Use This

**Follow the phases in order. Don't skip ahead.**

Each file builds on the previous one. The "Bridge Logic" at the end of each file will guide you to the next.

Don't try to memorise everything. Understand the concepts, then come back and reference as needed.

---

## Disclaimer

This is personal documentation, not financial advice. I'm learning just like you. Trade at your own risk.

---

## Website Application

This repository is also a Docusaurus website. The Markdown files and images in their existing folders remain the source of truth; the application reads them directly rather than copying them into a separate content system.

### Requirements

- Node.js 20 or newer
- npm

### Run Locally

```bash
npm install
npm run start
```

Open [http://localhost:3000](http://localhost:3000).

### Validate a Production Build

```bash
npm run typecheck
npm run build
npm run serve
```

The static production site is generated in `build/`.

### Run with Docker

The Docker image builds the Docusaurus site, then serves only the generated static files through a small read-only Node.js server.

```bash
docker build -t trading-notes .
docker run --rm -p 3000:3000 -e PORT=3000 trading-notes
```

The container exposes:

- Website: [http://localhost:3000](http://localhost:3000)
- Health check: [http://localhost:3000/health](http://localhost:3000/health)

### Deploy on Railway

Railway can host this as a static site without Docker, but the included `Dockerfile` gives the deployment a consistent production server and health check.

1. Push this repository to GitHub.
2. In Railway, select **New Project → Deploy from GitHub repo**.
3. Choose this repository. Railway automatically detects the root `Dockerfile`.
4. In the service settings, set the health-check path to `/health`.
5. Under **Networking**, select **Generate Domain**.
6. Set `DOCUSAURUS_SITE_URL` to the generated public URL, including `https://`, then redeploy. Keep `DOCUSAURUS_BASE_URL` as `/` unless the site is hosted below a URL subpath.

Each push to the connected branch triggers a new Railway deployment. A custom domain can be added under **Settings → Networking**.

> **Privacy:** This site has no authentication. A Railway public domain or GitHub Pages deployment makes the rendered collection accessible to anyone who has the URL. Keep the service private or place it behind an access-control proxy if the collection should remain private.

### Deploy on GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the site when `main` is pushed. In the repository settings, choose **Pages → Source → GitHub Actions**. The expected project URL is `https://steffanlynch.github.io/trading/`.
