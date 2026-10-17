import type {PostHog} from 'posthog-js';
import {sanitizeCapture, type PlainProps} from '../utils/analytics/events';
import {cookieNames, expireCookie, storageKeys} from './cookies';

/**
 * PostHog, loaded only after the visitor allows analytics.
 *
 * Everything automatic is switched off (autocapture, session replay, surveys, heat maps, exception and performance
 * capture, feature flags), the library never fetches extra scripts, and `before_send` passes every event through
 * `sanitizeCapture`: an event outside the catalogue is dropped and a property outside the allowlist is stripped.
 */
export interface PostHogSettings {
  token: string;
  apiHost: string;
  uiHost: string;
  baseUrl: string;
}

const PH_STORAGE = /^(?:ph_|__ph_)|posthog/i;
let settings: PostHogSettings | null = null;
let loading: Promise<PostHog | null> | null = null;

function load(): Promise<PostHog | null> {
  if (!settings) return Promise.resolve(null);
  const config = settings;
  loading ??= import('posthog-js')
    .then(({default: posthog}) => {
      if (!posthog.__loaded) {
        posthog.init(config.token, {
          api_host: config.apiHost,
          ui_host: config.uiHost,
          defaults: '2026-05-30',
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: true,
          rageclick: false,
          capture_dead_clicks: false,
          capture_heatmaps: false,
          capture_exceptions: false,
          capture_performance: false,
          disable_session_recording: true,
          disable_surveys: true,
          disable_conversations: true,
          disable_product_tours: true,
          disable_web_experiments: true,
          disable_external_dependency_loading: true,
          advanced_disable_flags: true,
          // Nobody is ever identified on this site, so no person profile is ever created.
          person_profiles: 'never',
          opt_out_capturing_by_default: true,
          opt_out_capturing_persistence_type: 'localStorage',
          // Local storage only: no PostHog cookie is ever set, so nothing it stores travels with a request to this site.
          persistence: 'localStorage',
          cross_subdomain_cookie: false,
          before_send: (capture) => {
            const properties = sanitizeCapture(capture.event, capture.properties, {
              origin: window.location.origin,
              hostname: window.location.hostname,
              pathname: window.location.pathname,
              baseUrl: config.baseUrl,
            });
            if (!properties) return null;
            // No person profiles exist on this site, so nothing is ever set on one.
            const {$set, $set_once, $unset, ...rest} = capture;
            void $set;
            void $set_once;
            void $unset;
            return {...rest, properties};
          },
        });
      }
      return posthog;
    })
    .catch(() => null);
  return loading;
}

export function configurePostHog(next: PostHogSettings): void {
  settings = next;
}

/** Starts (or resumes) capturing. Loads the library on first use. */
export async function enablePostHog(): Promise<void> {
  try {
    (await load())?.opt_in_capturing({captureEventName: false});
  } catch {
    // Analytics must never affect the page.
  }
}

/**
 * Stops capturing and forgets the visitor: resets the anonymous ID, opts out, and removes PostHog's storage. A visitor
 * who has never allowed analytics never loads the library at all.
 */
export async function disablePostHog(): Promise<void> {
  try {
    if (loading) {
      const posthog = await loading;
      if (posthog) {
        // Reset first, then opt out: reset() clears the opt-out state.
        posthog.reset(true);
        posthog.opt_out_capturing();
        // The library saves its state a moment after a change, which would bring back the key just removed.
        await new Promise((done) => window.setTimeout(done, 400));
      }
    }
    // The opt-out flag goes too: with no flag the library defaults to opted out, and it is only opted back in on consent.
    for (const {storage, key} of storageKeys(PH_STORAGE)) storage.removeItem(key);
    for (const name of cookieNames(PH_STORAGE)) expireCookie(name);
  } catch {
    // Analytics must never affect the page.
  }
}

export async function capturePostHog(event: string, properties: PlainProps): Promise<void> {
  try {
    const posthog = await load();
    if (!posthog || posthog.has_opted_out_capturing()) return;
    posthog.capture(event, properties);
  } catch {
    // Analytics must never affect the page.
  }
}
