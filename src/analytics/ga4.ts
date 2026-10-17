import type {PlainProps} from '../utils/analytics/events';
import {cookieNames, expireCookie} from './cookies';

/**
 * Google Analytics 4 (gtag.js), loaded only after the visitor allows analytics.
 *
 * Page views are sent by hand with a query-free address (calculator links carry the visitor's inputs), so automatic
 * page views are off. In the GA4 admin, turn off the enhanced-measurement option "Page changes based on browser
 * history events", otherwise GA sends its own page view with the full address on every navigation (docs/analytics.md).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SCRIPT_ID = 'tn-gtag';
const GA_COOKIES = /^(?:_ga|_gid|_gat|_gcl_|_gac_)/;

let loadedId: string | null = null;
let enabled = false;

function disableFlag(measurementId: string, off: boolean): void {
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = off;
}

export function enableGoogleAnalytics(measurementId: string): void {
  if (typeof window === 'undefined') return;
  disableFlag(measurementId, false);
  enabled = true;

  if (loadedId === measurementId) {
    window.gtag?.('consent', 'update', {analytics_storage: 'granted'});
    return;
  }
  loadedId = measurementId;
  window.dataLayer = window.dataLayer || [];
  // gtag.js only treats a pushed `arguments` object as a command; an array is ignored.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  // Analytics storage is on because the visitor allowed it; everything advertising-related stays off.
  window.gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    transport_type: 'beacon',
    cookie_expires: 31_536_000,
    cookie_flags: window.location.protocol === 'https:' ? 'SameSite=Lax;Secure' : 'SameSite=Lax',
  });

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }
}

/** Stops sending and removes the cookies Google set. The script stays loaded but is told not to collect. */
export function disableGoogleAnalytics(measurementId: string): void {
  if (typeof window === 'undefined') return;
  enabled = false;
  disableFlag(measurementId, true);
  window.gtag?.('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
  for (const name of cookieNames(GA_COOKIES)) expireCookie(name);
}

export function sendGoogleEvent(name: string, params: PlainProps): void {
  if (!enabled || typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
}

export function sendGooglePageView(params: PlainProps): void {
  sendGoogleEvent('page_view', params);
}
