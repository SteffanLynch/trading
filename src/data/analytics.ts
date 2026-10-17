/**
 * Switches for analytics. Both tools run only for visitors who allowed "analytics" in the cookie banner, and only on
 * the production hostnames below, so staging, previews and local development never reach the real reports.
 *
 * Google Analytics 4 receives page views and a short list of safe events (no calculator values, no search words).
 * PostHog receives the full product events, including the numbers typed into a calculator and its result. Both lists
 * are defined in src/utils/analytics/events.ts. Setup steps: docs/analytics.md.
 */

/** GA4 web data stream ID. Set to null to switch Google Analytics off. */
export const GA_MEASUREMENT_ID: string | null = 'G-HEMWFRWN96';

/**
 * PostHog project token (starts with "phc_"; it is public by design, the same way the GA ID is). While null,
 * PostHog is never loaded. Find it in PostHog under Project settings.
 */
export const POSTHOG_PROJECT_TOKEN: string | null = 'phc_z6Jte4mYgA6MqpcYGuYwUuB9aS9zSqbxGxW92CVrYWBz';

/**
 * Where the browser sends PostHog events. "/ingest" is this site's own relay (server/relay.mjs), which forwards to
 * PostHog EU Cloud: first-party, so ad blockers do not silently drop it. Use an https:// URL instead to talk to
 * PostHog (or your own proxy) directly.
 */
export const POSTHOG_API_HOST = '/ingest';

/** PostHog's app address, used for the toolbar and links back to the dashboard. EU Cloud. */
export const POSTHOG_UI_HOST = 'https://eu.posthog.com';

/** Hostnames that count as the live site. Events from any other host (staging, localhost) are never sent. */
export const ANALYTICS_HOSTS: readonly string[] = ['tradingspelledout.com', 'www.tradingspelledout.com'];
