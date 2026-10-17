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
docker build -t trading-spelled-out .
docker run --rm -p 3000:3000 -e PORT=3000 trading-spelled-out
```

The container exposes:

- Website: [http://localhost:3000](http://localhost:3000)
- Health check: [http://localhost:3000/health](http://localhost:3000/health)
- PostHog relay: `/ingest/*` (POST allowed here only), forwarded to PostHog EU Cloud by `server/relay.mjs`. See [docs/analytics.md](docs/analytics.md).

## Deploy on Google Cloud Run

`.github/workflows/deploy.yml` deploys on every push, using the root `Dockerfile` (Docusaurus build, served by `server.mjs`):

| Branch | Cloud Run service | `DOCUSAURUS_SITE_URL` |
| --- | --- | --- |
| `main` | `trading-web` | `https://tradingspelledout.com` (custom domain, via the shared load balancer) |
| `staging` | `trading-web-staging` | `https://trading-web-staging-699962388958.europe-west2.run.app` |

`DOCUSAURUS_BASE_URL` is `/` for both. The workflow runs typecheck, tests, build and `check:build` first, then builds and pushes the image to Artifact Registry and deploys it. Production's `PROD_SITE_URL` is the custom domain; if staging ever gets one too, change `STAGING_SITE_URL` the same way so canonical URLs, the sitemap and JSON-LD use it.

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

Google Analytics 4 (`G-HEMWFRWN96`) and PostHog are both built in, behind the cookie banner, and run only on the live hostnames in `src/data/analytics.ts`. Everything is in [docs/analytics.md](docs/analytics.md): what is sent, the one-time GA4 and PostHog setup, how to check it, and how to add an event. In short:

- `track(event, props)` from `src/analytics` sends a typed event to PostHog and, for a short list, to Google Analytics. It does nothing unless the visitor has allowed analytics.
- Calculators send a debounced `calculator_calculated` event **only after the visitor has changed an input and the result is valid**, via `useTrackCalculation`. PostHog gets every input and every computed output (plus `calculator_name` and `placement`: `page` or `embedded`); Google gets only the calculator's name. A `calculator_link_copied` event is sent when a link is copied.
- Page addresses are rebuilt from the path, so the numbers in a shared calculator link never reach either tool as part of a URL.
- PostHog stays off until a project token is pasted into `POSTHOG_PROJECT_TOKEN`.

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
- **Needs an owner's decision before relying on it:** `LEGAL_CONTACT_EMAIL` in `src/data/legal.ts` is `legal@misppelled.com` (set it to `null` to show the postal address instead), and have the legal text, including the privacy policy and cookie wording, reviewed by a solicitor before installing analytics, advertising or affiliate tracking.


## Monetisation, consent and disclosure

Everything that earns money ships **switched off**. A fresh checkout shows no ads, no affiliate links and no sponsor. Each feature turns on when a value is filled in, always behind the visitor's cookie choice and always labelled.

| What | Switch | Where it appears |
| --- | --- | --- |
| Display ads (AdSense) | `ADSENSE_CLIENT` and `AD_SLOT_IDS` in `src/data/monetisation.ts` | A fixed-height, labelled slot under every lesson and tool page |
| Amazon book links | `AMAZON_ASSOCIATE_TAG` in `src/data/monetisation.ts` | Book shelves on lessons, tools and `/resources`. Untagged links go to Amazon search and are unlabelled |
| TradingView, Pepperstone, Vantage | `affiliateUrl` per partner in `src/data/partners.ts` | `/partners` and short callouts beside relevant lessons and tools |
| Direct sponsor | An entry in `src/data/sponsors.ts` | A "Sponsored / Presented by" line on the chosen tool, lesson or group, between its dates |
| Enquiry address | `SPONSORSHIP_CONTACT_EMAIL` (falls back to `LEGAL_CONTACT_EMAIL`) | The media kit. Both null means the postal address is shown instead |

### Consent

`src/components/consent/` holds the banner and store; the rules are in `src/utils/consent.ts` (tested). Three optional categories, all off until chosen: **preferences** (remembered calculator values), **analytics** and **advertising**. "Reject all" and "Accept all" are equally prominent, the choice lasts 12 months, and it can be changed from the footer "Cookie settings" button or the privacy page. The gates:

- `track()` and the Google Analytics and PostHog loaders (`src/analytics`) do nothing unless analytics is allowed, and withdrawing the choice stops them and removes the `_ga*` cookies and PostHog's local storage.
- `loadPrefs`/`savePref` (remembered calculator values) do nothing unless preferences is allowed, and withdrawing the choice deletes what was stored.
- `AdSlot` renders nothing, and the ad script is never requested, unless an AdSense ID is set **and** advertising is allowed.
- YouTube videos are click-to-load (`youtube-nocookie.com`), so nothing is requested from YouTube until play is pressed.

When a new cookie, tracker or provider is added: add it to the cookie table and the "what is collected" table in `src/pages/privacy.tsx`, and add or reuse a consent category. Changing the categories means bumping `CONSENT_VERSION` so everyone is asked again.

### Labelling is automatic

- Every outbound partner link goes through `AffiliateLink`. If it can earn a commission (a valid https `affiliateUrl`, or a tagged Amazon link) it gets `rel="sponsored noopener noreferrer"` and a visible "Affiliate link" tag; otherwise it is a plain link.
- Blocks containing an affiliate link show the disclosure sentence; Amazon blocks add Amazon's required Associates statement (`AMAZON_ASSOCIATES_STATEMENT`; confirm the wording against your current Associates agreement).
- Ads carry an "Ad" tag and "Advertisement" heading; sponsors carry "Sponsored".
- `npm run check:build` fails if a page has a `rel="sponsored"` link without a visible label, if any page loads an ad network while `ADSENSE_CLIENT` is null, or if a lesson loses its further-learning block.

### Turning things on

1. **Ads:** apply to AdSense, set `ADSENSE_CLIENT` and the slot IDs, and publish `static/ads.txt` with the line AdSense gives you. Ads then appear only for visitors who allow advertising.
2. **Amazon:** join Amazon Associates (UK), set `AMAZON_ASSOCIATE_TAG`. Do not show prices or shorten the links.
3. **TradingView:** join its affiliate programme and paste the tracking link into `affiliateUrl`.
4. **Brokers (Pepperstone, Vantage):** a broker is **hidden until all three exist**: `affiliateUrl`, `promotionApproval` (who approved it and when) and `riskWarning` (the broker's exact, current wording including the percentage of retail accounts that lose money). Promoting forex and CFDs is an FCA financial promotion, so get the broker's compliance team to approve the placements first. `src/utils/monetisation.ts` enforces this and has tests for it.
5. **Sponsor:** add an entry to `src/data/sponsors.ts`. Dates are inclusive and the placement strings are listed in that file.

### Amazon book links

Books are links built from `src/data/books.ts`; no URLs are stored. Each book links to an Amazon.co.uk **search** for its title and author. To send a book to one exact edition instead, add its `asin` (the 10-character code after `/dp/` on the product page, found under "Product information"); the code then links to `amazon.co.uk/dp/<ASIN>` with the store ID added. Always take the ASIN from the edition you mean, and never paste a tagged URL into the data. The tag only earns when the link is tracked and the purchase qualifies under Amazon's Associates rules.

### Recommended resources

`/resources` is driven by `src/data/resources.ts` (channels, podcasts, free courses, regulators) and `src/data/books.ts`. Add a resource with its own official URL and the date it was checked; creators who also sell products must carry a note (a test enforces it). To add a video, put its 11-character YouTube ID in `videos`; the "Watch" section appears once there is one. Which blocks appear under which lesson or tool is set in `src/data/placements.ts` (lessons are matched by URL path, so no lesson file needs editing).

### Media kit

`/media-kit` is driven by `src/data/mediaKit.ts`. It contains no invented numbers: add real analytics figures to `AUDIENCE_STATS` when they exist and they appear automatically. Visitors can print or save the page as a PDF (navigation and the cookie banner are hidden when printing).

## Brand assets

The logo, favicon, Apple icon and social card are in `static/img/`; how they are made and how to regenerate them is in `scripts/brand/README.md`.
