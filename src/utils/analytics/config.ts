/**
 * Which analytics tools may run, decided from the configured IDs and the hostname. Pure, so it can be unit tested.
 */
const GA_ID = /^G-[A-Z0-9]{6,14}$/;
const POSTHOG_TOKEN = /^phc_[A-Za-z0-9]{20,}$/;

export function isGaMeasurementId(value: unknown): value is string {
  return typeof value === 'string' && GA_ID.test(value);
}

export function isPosthogToken(value: unknown): value is string {
  return typeof value === 'string' && POSTHOG_TOKEN.test(value);
}

/**
 * The PostHog API host: either a same-site path such as "/ingest" (the relay) or an https:// origin.
 * Anything else (protocol-relative, http, odd characters) is rejected.
 */
export function normalisePosthogHost(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const host = value.trim().replace(/\/+$/, '');
  if (/^\/[a-z0-9_-]+$/i.test(host)) return host;
  try {
    const url = new URL(host);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && (url.pathname === '/' || url.pathname === '') ? url.origin : null;
  } catch {
    return null;
  }
}

/** Exact, case-insensitive hostname match. Ports are ignored. */
export function analyticsAllowedOnHost(hostname: string, allowed: readonly string[]): boolean {
  const host = hostname.trim().toLowerCase();
  return host !== '' && allowed.some((entry) => entry.trim().toLowerCase() === host);
}

export interface AnalyticsInput {
  hostname: string;
  allowedHosts: readonly string[];
  gaMeasurementId: string | null;
  posthogToken: string | null;
  posthogApiHost: string;
  posthogUiHost: string;
}

export interface AnalyticsConfig {
  ga: {measurementId: string} | null;
  posthog: {token: string; apiHost: string; uiHost: string} | null;
}

/** Everything that may run on this page. Both parts are null on a host that is not the live site, or when a value is missing or malformed. */
export function resolveAnalyticsConfig(input: AnalyticsInput): AnalyticsConfig {
  if (!analyticsAllowedOnHost(input.hostname, input.allowedHosts)) return {ga: null, posthog: null};
  const apiHost = normalisePosthogHost(input.posthogApiHost);
  const uiHost = normalisePosthogHost(input.posthogUiHost);
  return {
    ga: isGaMeasurementId(input.gaMeasurementId) ? {measurementId: input.gaMeasurementId} : null,
    posthog: isPosthogToken(input.posthogToken) && apiHost && uiHost?.startsWith('https://') ? {token: input.posthogToken, apiHost, uiHost} : null,
  };
}
