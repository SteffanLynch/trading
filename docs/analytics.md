# Analytics: Google Analytics 4 and PostHog

Both tools are **consent-gated, production-only and fail-open**. Nothing loads, no cookie is set and no request is made
until a visitor allows "Anonymous usage analytics" in the cookie banner, and nothing runs on any hostname other than the
live site, so staging, previews and `localhost` never reach the real reports.

| | Google Analytics 4 | PostHog (EU Cloud) |
| --- | --- | --- |
| Job | Traffic, acquisition, engagement, key events | Product analytics: funnels, tool usage, search, what people calculate |
| Gets | Page views and a short list of safe events (below) | The full event catalogue |
| Never gets | Calculator values, search words, query strings | Query strings, hashes, anything outside the allowlist |
| Loads from | `googletagmanager.com`, after consent | The npm package, from this site's own bundle, after consent |
| Sends to | Google | `/ingest` on this site, which relays to `eu.i.posthog.com` |
| Stored in the browser | `_ga`, `_ga_<ID>` cookies | `ph_<token>_posthog` in local storage (no cookie) |

## Where everything lives

| What | Where |
| --- | --- |
| IDs and the live hostnames | `src/data/analytics.ts` |
| Event catalogue, the privacy allowlist, the Google event list | `src/utils/analytics/events.ts` (tested) |
| Page classification, path and campaign handling | `src/utils/analytics/routes.ts` (tested) |
| Which tools may run on this host | `src/utils/analytics/config.ts` (tested) |
| `track()`, consent wiring, page views | `src/analytics/index.ts` |
| Google / PostHog adapters | `src/analytics/ga4.ts`, `src/analytics/posthog.ts` |
| Site-wide click tracking, lesson scroll depth, search hook | `src/analytics/listeners.ts`, `lessonProgress.ts`, `useTrackSearch.ts` |
| Registered with Docusaurus | `clientModules` in `docusaurus.config.ts` → `src/analytics/clientModule.ts` |
| 404 reporting | `src/theme/NotFound/Content/index.tsx` |
| PostHog relay | `server/relay.mjs`, mounted at `/ingest` by `server.mjs` |
| PostHog dashboards and event definitions | `scripts/posthog-manifest.json`, `npm run posthog:provision` |

## Switches

All in `src/data/analytics.ts`:

- `GA_MEASUREMENT_ID` is `G-HEMWFRWN96`. Set it to `null` to switch Google Analytics off.
- `POSTHOG_PROJECT_TOKEN` is `null` until a PostHog project exists. Paste the project token (starts with `phc_`; public by design, like the GA ID) to switch PostHog on. A personal API key (`phx_…`) must never go here; `npm run check:build` rejects it.
- `POSTHOG_API_HOST` is `/ingest` (the relay). An `https://` URL talks to PostHog or your own proxy directly.
- `ANALYTICS_HOSTS` lists the hostnames that count as the live site. To try it on staging, add the staging host temporarily: events are then labelled `deployment_environment: test`, which every PostHog dashboard filters out. Google Analytics has no such filter, so use a separate GA4 property (or DebugView) for that test, never the production one.

A malformed ID switches that tool off silently, so `npm run check:build` fails the build if either is malformed.

## What is sent

**Page views** (both tools): the path only, never a query string or hash. Calculator links carry the visitor's inputs
(`?balance=25000&risk=0.5`), so the page address is rebuilt from the path every time, in the page view, in PostHog's own
events (through its `before_send` hook) and in `$pageleave`. For Google, the five standard `utm_*` campaign tags are
kept (plain short values only) so campaign reports still work. The referrer is reduced to its domain.

**Every PostHog event** also carries `page_type`, `route_name`, `content_section`/`content_slug` (lessons),
`tool_slug`/`tool_group` (tools), `color_mode`, `deployment_environment` and `schema_version`.

**Events** (✓ = Google Analytics also gets it; its parameters are a fixed list):

| Event | When | Properties | GA |
| --- | --- | --- | --- |
| `$pageview` / `$pageleave` | Each page; leaving it (time on page, scroll depth) | `$pathname`, `$current_url` (no query), `$referring_domain`, `utm_*` | ✓ `page_view` |
| `lesson_scroll_depth` | A lesson's text reaches 25 / 50 / 75 / 100 % | `depth_percent`, `engaged_seconds` | ✓ |
| `lesson_nav_clicked` | Previous / next lesson link | `direction`, `destination_path` | ✓ |
| `image_expanded` | Lesson image opened full size | none | |
| `calculator_calculated` | A valid result after an input changed (debounced 1 s) | `calculator_name`, `placement`, **every input and output** | ✓ name and placement only |
| `calculator_link_copied` | Copy link | `calculator_name` | ✓ as `share` |
| `calculator_reset` | Reset | `calculator_name` | |
| `tool_section_opened` | A tool page accordion opened | `section_title`, `section_variant` | |
| `search_opened` | Palette or search page opened | `surface`, `method` | |
| `search_performed` | Typing settles (0.9 s), tidy term, ≥ 2 characters | `surface`, `search_term`, `result_count` | ✓ as `site_search`, **no term** |
| `search_result_clicked` | A result followed | `surface`, `position`, `destination_path` | |
| `partner_link_clicked` | TradingView, brokers, Amazon books | `partner`, `placement`, `affiliate` | ✓ |
| `sponsor_link_clicked` | Direct sponsor | `sponsor` | ✓ |
| `resource_link_clicked` | Recommended resource | `resource_id`, `placement` | ✓ |
| `video_played` | Resources-page video | `video_id`, `placement` | ✓ |
| `outbound_link_clicked` | Any other link to another site | `destination_domain`, `link_area` | ✓ |
| `contact_email_clicked` | Any `mailto:` link | `contact_purpose` (never the address) | ✓ sponsorship enquiries as `generate_lead` |
| `nav_link_clicked` | Navbar / footer link | `nav_area`, `destination_path` | |
| `cta_clicked` | A link marked `data-cta="<id>"` | `cta_id`, `destination_path` | ✓ |
| `page_not_found` | The 404 page | `requested_path` | ✓ |

**Never sent**: email addresses, names, the address of a link or mailto, query strings or hashes, the raw user agent,
the full referrer URL, person properties (`person_profiles: 'never'`; no one is ever identified), session replay,
heat maps, autocapture, exceptions, web vitals, feature flags or surveys. A search term is dropped if it looks like an
email address, a link or a long number.

Calculator values are sent to PostHog on purpose (the cookie banner and privacy page say so). Numbers, flags and short
plain labels are kept; objects, arrays, links and long text are dropped. If a calculator should stop reporting a field,
remove it from its `useTrackCalculation` payload.

## One-time setup: Google Analytics 4

In the GA4 admin for the property that owns `G-HEMWFRWN96`:

1. **Enhanced measurement → Page views → advanced settings: turn off "Page changes based on browser history events".**
   The site sends its own page views (with the query string removed). If this stays on, GA also sends one on every
   navigation with the full address, duplicating every page view and leaking calculator values. This is the one step
   that matters.
2. **Data retention → Event data retention: 14 months** (the privacy page says so).
3. **Google signals data collection: leave off** (the code also sets `allow_google_signals: false`).
4. **Key events** (Admin → Events): mark `partner_link_clicked`, `generate_lead`, `sponsor_link_clicked`,
   `calculator_calculated` and `share`.
5. **Custom definitions → Create custom dimension** (scope: Event), one per parameter you want in reports:
   `page_type`, `content_section`, `content_slug`, `tool_slug`, `tool_group`, `calculator_name`, `placement`,
   `partner`, `affiliate`, `sponsor`, `resource_id`, `video_id`, `destination_domain`, `link_area`, `cta_id`,
   `direction`, `surface`, `contact_purpose`, `lead_type`, `requested_path`. Make `depth_percent`,
   `engaged_seconds` and `result_count` custom metrics. Dimensions only collect from the day they are created.
6. Optional: turn off enhanced measurement "Outbound clicks" if you would rather count outbound links only through
   `outbound_link_clicked`.

## One-time setup: PostHog

1. Create a PostHog **EU Cloud** project and review its DPA. Copy the **project token** into `POSTHOG_PROJECT_TOKEN`.
2. Project settings: confirm autocapture, session replay, heat maps, surveys, exception capture and web vitals are off
   (the code already disables them), and that event retention is 12 months (the privacy page says so).
3. Keep GeoIP on: the privacy page says approximate location (country or region) is collected.
4. Optional, to load the event definitions and four dashboards (traffic and content, tools, search and navigation,
   monetisation) from `scripts/posthog-manifest.json`. Run it from your own terminal with a personal API key; never put
   the key in the repo, a build argument or Cloud Run:

   ```bash
   POSTHOG_PERSONAL_API_KEY=phx_... POSTHOG_PROJECT_ID=12345 npm run posthog:provision
   ```

   It matches by name, so running it again updates rather than duplicates.
5. The relay needs nothing else on Cloud Run. On US Cloud, set `POSTHOG_API_HOST=https://us.i.posthog.com` and
   `POSTHOG_ASSETS_HOST=https://us-assets.i.posthog.com` on the service, and `POSTHOG_APP_HOST=https://us.posthog.com`
   when running the provisioning script, and change `POSTHOG_UI_HOST`.

## The relay

`/ingest/*` on the site forwards to PostHog's fixed hosts (never a host taken from the request), passes only the
request headers PostHog needs plus the visitor's IP (so the country can be worked out), never passes cookies in either
direction, caps bodies at 1 MiB and times out after 10 s. If PostHog is unreachable the relay answers 502 and the
browser quietly drops the event. It is tested in `server/relay.test.mjs`.

## Check it works (after a deploy)

1. In a clean browser, load a lesson and a calculator link with a query string. Before any choice, the network tab shows
   **no** request to Google, `/ingest` or PostHog, and the page has no `_ga*` cookie or `ph_*` storage.
2. Choose **Reject all**. Still nothing.
3. In another clean session choose **Accept all**. You should see one `page_view` to Google and one `$pageview` to
   `/ingest/e/`, both with the path and without `?balance=…`. GA4 **DebugView** and PostHog **Live events** should show
   them within a minute.
4. Change a calculator input, wait a second: `calculator_calculated` in PostHog with the inputs; in Google only the
   calculator's name. Open the search (⌘K), type a term, click a result. Click a partner link and an outbound link.
5. Footer **Cookie settings** → switch analytics off → Save. The `_ga*` cookies and `ph_*` storage disappear and further
   navigation produces no requests.
6. Open a made-up URL: `page_not_found` appears in both.

## Adding or changing an event

1. Add it to `EventMap` and `SCHEMA` in `src/utils/analytics/events.ts` (every property needs a validator; anything
   without one is dropped). If Google should have it, add a mapper to `GA_EVENTS` with a fixed parameter list.
2. Call `track('event_name', {...})` from `src/analytics`. For a link, put `data-tracked` on it if it tracks itself, or
   `data-cta="<id>"` to let the site-wide handler report it.
3. Add it to `scripts/posthog-manifest.json` (a test fails if the manifest and the catalogue disagree) and re-run
   `npm run posthog:provision`.
4. Update the cookie/data tables in `src/pages/privacy.tsx` if what is collected changes, and bump `CONSENT_VERSION` in
   `src/utils/consent.ts` if the consent categories change.
5. If Google gets it, create custom dimensions for any new parameters (see above).

## Testing locally

Analytics is off on `localhost` by design. To exercise it, build a throwaway copy with your own test values (a dummy GA
ID such as `G-TEST123456`, any `phc_…` token, and `'localhost'` added to `ANALYTICS_HOSTS`), run `node server.mjs` with
`POSTHOG_API_HOST` pointing at a small local server that prints what it receives, and use the browser's network tab
and `window.dataLayer`. Never do this with the production IDs.
