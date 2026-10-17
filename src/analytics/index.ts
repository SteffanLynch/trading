import {ANALYTICS_HOSTS, GA_MEASUREMENT_ID, POSTHOG_API_HOST, POSTHOG_PROJECT_TOKEN, POSTHOG_UI_HOST} from '../data/analytics';
import {resolveAnalyticsConfig, type AnalyticsConfig} from '../utils/analytics/config';
import {gaEventFor, sanitizeCapture, type EventMap, type EventName, type PlainProps} from '../utils/analytics/events';
import {analyticsPageUrl, analyticsPageUrlWithCampaign, campaignParams, internalPath, normalisePathname, referringDomain} from '../utils/analytics/routes';
import {consentAllows, subscribeConsent} from '../components/consent/store';
import {BASE_URL, pageContext} from './context';
import {disableGoogleAnalytics, enableGoogleAnalytics, sendGoogleEvent, sendGooglePageView} from './ga4';
import {watchLessonProgress} from './lessonProgress';
import {capturePostHog, configurePostHog, disablePostHog, enablePostHog} from './posthog';

/**
 * Analytics for the whole site. One call, `track(event, props)`, sends an event to PostHog and, for the short list in
 * src/utils/analytics/events.ts, to Google Analytics too.
 *
 * Nothing runs unless all three are true: the page is on a live hostname (src/data/analytics.ts), the tool has an ID
 * set, and the visitor has allowed "analytics" in the cookie banner. Withdrawing consent stops everything straight away
 * and removes what the tools stored. Every function here is safe to call on the server and in tests; it does nothing.
 */

let config: AnalyticsConfig | null = null;
let started = false;
let active = false;
let currentPathname: string | null = null;
let lastPageKey: string | null = null;
let lastPageUrl: string | null = null;
let stopLessonWatch: (() => void) | null = null;

function resolved(): AnalyticsConfig {
  config ??= resolveAnalyticsConfig({
    hostname: window.location.hostname,
    allowedHosts: ANALYTICS_HOSTS,
    gaMeasurementId: GA_MEASUREMENT_ID,
    posthogToken: POSTHOG_PROJECT_TOKEN,
    posthogApiHost: POSTHOG_API_HOST,
    posthogUiHost: POSTHOG_UI_HOST,
  });
  return config;
}

function locationInfo() {
  return {origin: window.location.origin, hostname: window.location.hostname, pathname: window.location.pathname, baseUrl: BASE_URL};
}

/** Turns the tools on or off to match the visitor's current choice. Runs at start-up and on every consent change. */
function sync(): void {
  const {ga, posthog} = resolved();
  const shouldRun = (ga !== null || posthog !== null) && consentAllows('analytics');

  if (shouldRun && !active) {
    active = true;
    if (ga) enableGoogleAnalytics(ga.measurementId);
    if (posthog) {
      configurePostHog({...posthog, baseUrl: BASE_URL});
      void enablePostHog();
    }
    sendPageView();
  } else if (!shouldRun && active) {
    active = false;
    stopLessonWatch?.();
    stopLessonWatch = null;
    lastPageKey = null;
    lastPageUrl = null;
    if (ga) disableGoogleAnalytics(ga.measurementId);
    if (posthog) void disablePostHog();
  }
}

/** Starts listening for consent changes. Call once, in the browser. */
export function initAnalytics(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  subscribeConsent(sync);
  sync();
}

/** Tells analytics which page the router is now showing. Sends a page view once per path, as soon as it may. */
export function onRouteChange(pathname: string): void {
  if (typeof window === 'undefined') return;
  currentPathname = pathname;
  if (!active) return;
  // The router updates the document title (and a 404 page marks itself) a moment after the route changes, on the next
  // frame, so wait for that. A tab in the background does not run frames, so it is sent after a short delay instead.
  window.requestAnimationFrame(() => window.setTimeout(sendPageView, 0));
  window.setTimeout(sendPageView, 400);
}

function sendPageView(): void {
  // Wait until the router has reported its first route, so a missing page is already known to be one.
  if (!active || currentPathname === null) return;
  const pathname = window.location.pathname;
  const key = normalisePathname(pathname, BASE_URL);
  if (key === lastPageKey) return;
  lastPageKey = key;

  const {ga, posthog} = resolved();
  const context = pageContext(pathname);
  const origin = window.location.origin;
  const referrerDomain = referringDomain(document.referrer, window.location.hostname);
  // The first page view of a visit has the outside referrer; later ones have the page the visitor came from.
  const referrer = lastPageUrl ?? (referrerDomain ? `https://${referrerDomain}/` : undefined);
  lastPageUrl = analyticsPageUrl(origin, pathname, BASE_URL);

  if (ga) {
    sendGooglePageView({
      page_location: analyticsPageUrlWithCampaign(origin, pathname, window.location.search, BASE_URL),
      page_title: document.title,
      ...(referrer ? {page_referrer: referrer} : {}),
      content_group: context.page_type ?? 'other',
      ...pickDefined({page_type: context.page_type, content_section: context.content_section, content_slug: context.content_slug, tool_slug: context.tool_slug, tool_group: context.tool_group}),
    });
  }
  if (posthog) {
    const properties = sanitizeCapture('$pageview', {...context, ...campaignParams(window.location.search), ...(referrerDomain ? {$referring_domain: referrerDomain} : {})}, locationInfo());
    if (properties) void capturePostHog('$pageview', properties);
  }

  restartLessonWatch(context.page_type === 'lesson');
}

function pickDefined(values: Record<string, string | undefined>): PlainProps {
  return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => entry[1] !== undefined));
}

function restartLessonWatch(isLesson: boolean): void {
  stopLessonWatch?.();
  stopLessonWatch = null;
  if (!isLesson) return;
  stopLessonWatch = watchLessonProgress((depth, engagedSeconds) => track('lesson_scroll_depth', {depth_percent: depth, engaged_seconds: engagedSeconds}));
}

/** Sends one event, if the visitor has allowed analytics. Never throws, never blocks. */
export function track<K extends EventName>(event: K, properties: EventMap[K]): void {
  if (!active || typeof window === 'undefined') return;
  try {
    const clean = sanitizeCapture(event, {...pageContext(), ...(properties as Record<string, unknown>)}, locationInfo());
    if (!clean) return;
    const {ga, posthog} = resolved();
    if (posthog) void capturePostHog(event, clean);
    if (ga) {
      const googleEvent = gaEventFor(event, clean);
      if (googleEvent) sendGoogleEvent(googleEvent.name, googleEvent.params);
    }
  } catch {
    // Analytics must never affect the page.
  }
}

/** The reportable path of a same-site link (no query, hash or trailing slash), or undefined for anything else. */
export function pathOf(href: string): string | undefined {
  return typeof window === 'undefined' ? undefined : internalPath(href, window.location.origin, BASE_URL);
}

/** Called by the 404 page. */
export function reportNotFound(requestedPath: string): void {
  track('page_not_found', {requested_path: requestedPath});
}

export {pageContext} from './context';
