# Website Application

This repository is also a Docusaurus website. The Markdown files and images in their existing folders remain the source of truth; the application reads them directly rather than copying them into a separate content system.

## Requirements

- Node.js 20 or newer
- npm

## Run Locally

```bash
npm install
npm run start
```

Open [http://localhost:3000](http://localhost:3000).

## Validate a Production Build

```bash
npm run test
npm run typecheck
npm run build
npm run serve
```

`npm run test` runs the Vitest unit tests for the calculator maths in `src/utils/calculators/`. After a build, `npm run check:build` verifies every tools page has a title, meta description, canonical URL, one `<h1>`, valid JSON-LD and a sitemap entry. CI (`.github/workflows/ci.yml`, and the deploy workflow) runs typecheck → tests → build → check.

The static production site is generated in `build/`.

## Run with Docker

The Docker image builds the Docusaurus site, then serves only the generated static files through a small read-only Node.js server.

```bash
docker build -t trading-notes .
docker run --rm -p 3000:3000 -e PORT=3000 trading-notes
```

The container exposes:

- Website: [http://localhost:3000](http://localhost:3000)
- Health check: [http://localhost:3000/health](http://localhost:3000/health)

## Deploy on Google Cloud Run

`.github/workflows/deploy.yml` deploys on every push, using the root `Dockerfile` (Docusaurus build, served by `server.mjs`):

| Branch | Cloud Run service | `DOCUSAURUS_SITE_URL` |
| --- | --- | --- |
| `main` | `trading-web` | `https://trading-web-699962388958.europe-west2.run.app` |
| `staging` | `trading-web-staging` | `https://trading-web-staging-699962388958.europe-west2.run.app` |

`DOCUSAURUS_BASE_URL` is `/` for both. The workflow runs typecheck, tests, build and `check:build` first, then builds and pushes the image to Artifact Registry and deploys it. When a custom domain is mapped to a service, change `PROD_SITE_URL` / `STAGING_SITE_URL` in the workflow so canonical URLs, the sitemap and JSON-LD use it.

It authenticates to the `misppelled` GCP project through Workload Identity Federation (no GitHub secrets). That provider only trusts the repositories named in its attribute condition, so `SteffanLynch/trading` must be allowed there before the workflow can deploy.

> **Privacy:** This site has no authentication. A public Cloud Run URL makes the site accessible to anyone who has it.

## Free tools

Twenty-two free calculators, simulators and visualisers live under `/tools` (hub at `/tools`): the twelve calculators from the first release plus ten interactive tools (Order Type Simulator, Candlestick Builder, Leverage Sandbox, Stop/Target Visualiser, Spread Visualiser, Partial-Profit, Average-Entry, Strategy Statistics, Fibonacci and Pivot Point calculators). Interactive tools carry `interactive: true` in the registry and an "Interactive" tag on the hub. The site's principle: never make a visitor calculate something the website could calculate for them, and never put a sign-up in the way.

### How it is organised

| Layer | Where | Rule |
| --- | --- | --- |
| Calculation engine | `src/utils/calculators/` | Pure TypeScript, no React, fully unit tested. Every function returns a `Calc` (`incomplete` / `invalid` / `needs-rate` / `ok`). |
| State hooks | `src/components/calculators/hooks/` | `useToolState` (inputs as strings so an empty box is never `0`; shareable URL; remembered preferences), `useTrackCalculation` (analytics). |
| Design system | `src/components/calculators/ui/` | Shared fields, results, charts (`LevelChart`), repeatable rows (`RowList`) and the card. Uses the site's own colour tokens. Embedded cards get `tone-violet`. |
| Calculators | `src/components/calculators/<Name>/` | One component per tool. Each accepts `embedded`. |
| Pages | `src/pages/tools/*.tsx` | A thin wrapper around `ToolPage` (teaching content, FAQs, JSON-LD). |
| Registry | `src/data/tools.ts` | One entry per tool: drives the hub, navigation, search, related links and SEO metadata. |

### Adding a tool

1. Put the maths in `src/utils/calculators/` with a test next to it.
2. Build the component in `src/components/calculators/<Name>/index.tsx` from the shared `ui` kit.
3. Add an entry to `src/data/tools.ts` (keep the meta title under about 70 characters and the description under 165; `check:build` enforces this).
4. Add `src/pages/tools/<slug>.tsx` using `ToolPage`.
5. Run `npm run test && npm run typecheck && npm run build && npm run check:build`.

### Rules these tools follow

- **No LaTeX in `.tsx`.** The math renderer only runs on `.mdx`, so formulas are plain-text blocks.
- **Empty fields pause, never error.** Errors appear only when every field is filled in and the combination is impossible.
- **Currency is handled, not assumed.** Profit and loss are converted into the account currency. When the base or quote currency is the account currency the site works it out itself; otherwise it asks for an exchange rate. The site uses no live market data.
- **Code splitting.** Calculators are not registered in `src/theme/MDXComponents.js`; import them explicitly where needed so each page only ships what it uses.

### Embedding a calculator in an article

Rename the article to `.mdx` (the docs plugin includes `.md` and `.mdx` under `fundamentals/` and `strategy/`), then import the calculator explicitly:

```mdx
import PositionSizeCalculator from '@site/src/components/calculators/PositionSizeCalculator';

<PositionSizeCalculator embedded />
```

Embedded widgets are compact, start from the article's worked example (not a visitor's saved preferences) and don't touch the address bar. When renaming an article, update any Markdown links that point at its old `.md` file name.

### Shareable links and saved preferences

Every full-page calculator writes its inputs to the address bar (only values that differ from the defaults), and **Copy link** shares them, for example `/tools/position-size-calculator?balance=25000&risk=0.5&pair=USDJPY&currency=GBP`. Unknown or unsafe parameters are ignored. Account currency, risk and balance are remembered in the visitor's own browser (`localStorage`); nothing is sent to a server for this.

### Analytics

Calculators send a debounced `calculator_calculated` event to `window.posthog` **only after the visitor has changed an input and the result is valid**, containing every input and every computed output (plus `calculator_name` and `placement`: `page` or `embedded`). A `calculator_link_copied` event is sent when a link is copied. If PostHog is not installed the calls do nothing. PostHog itself is not installed by this repository: add its snippet (and a consent banner if your audience needs one), and note that the event payload includes the account balance a visitor typed.

### Interactive tools

The simulators and visualisers reuse the same engine pattern and add a few pieces:

- **Draggable charts** use `hooks/useVerticalDrag.ts` (pointer capture, a frozen price scale while dragging, arrow-key support for keyboard users). Used by the Stop/Target Visualiser, the Candlestick Builder and the Trade Planner ladder.
- **Order Type Simulator** is a pure reducer (`orderSim.ts`) over `advanceOrder` in `orders.ts`; the chart component only renders state and dispatches moves. Prices are snapped to one decimal place beyond the pair's precision so float drift cannot cause a missed fill.
- **Lists of rows** (Average-Entry and Partial-Profit) are stored in the URL with `encodeRows`/`decodeRows` (`rows.ts`, at most 20 rows).
- **Diagrams in lessons** are generated, not photographed. `src/utils/diagrams.ts` builds seeded candlestick series whose swing highs and lows land exactly on the wick tips, and `src/components/diagrams/` renders them with labels, zones and arrows. Every chart carries an "illustrative chart, not real market data" tag. To use a real screenshot instead, drop the image into `static/img/` and reference it from the lesson.

## Legal, company details and funding pages

- **Operator:** the site is a trading name of **Misppelled Ltd** (England and Wales, company number 17447906). All company details live in one place, `src/data/legal.ts`, and feed the footer, the disclaimer, the funding page and the Organization JSON-LD in `docusaurus.config.ts`.
- **Disclaimer:** `/disclaimer` (`src/pages/disclaimer.tsx`, layout in `src/components/legal/`). Covers not-financial-advice, risk warning, hypothetical/illustrative material, calculator accuracy, limitation of liability, affiliate links and advertising, regulatory status, data and cookies, and governing law (England and Wales).
- **How this site is funded:** `/how-this-site-is-funded` (`src/pages/how-this-site-is-funded.tsx`). States that everything is free, that no feature ever asks for an email address or payment, and that affiliate commissions and advertising pay for the site. Linked from the footer and from the homepage "Free. Really." section.
- **Voice:** lessons, tools and pages speak impersonally. The first person ("I", "my") is not used; "we/us" appears only as the company voice on the legal and funding pages.
- **Needs an owner's decision before relying on it:** set `LEGAL_CONTACT_EMAIL` in `src/data/legal.ts` (it is `null` on purpose so no address is invented), have the legal text reviewed by a solicitor, and add a privacy policy and cookie consent before installing analytics, advertising or affiliate tracking.

