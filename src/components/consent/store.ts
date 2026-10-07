import {useSyncExternalStore} from 'react';
import {CONSENT_STORAGE_KEY, allows, createRecord, parseConsent, serialiseConsent, type ConsentCategory, type ConsentChoices, type ConsentRecord} from '../../utils/consent';

/**
 * Browser-side consent store. The saved choice lives in localStorage (first-party, needed to remember the choice),
 * is read lazily, and every change is broadcast so ad slots, analytics and the banner react straight away.
 *
 * Safe to import anywhere: on the server and in tests every read returns "no consent".
 */

/** Keys written by optional features. Removed when the matching category is switched off. */
const KEYS_BY_CATEGORY: Partial<Record<ConsentCategory, string[]>> = {
  preferences: ['tn-tools-prefs-v1'],
};

export const OPEN_SETTINGS_EVENT = 'tn:open-cookie-settings';

const listeners = new Set<() => void>();
let cache: {raw: string | null; record: ConsentRecord | null} | null = null;
/** Used only when browser storage is blocked, so a choice still holds until the page is closed. */
let memory: ConsentRecord | null = null;

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** The saved choice, or null when the visitor has not chosen (or the choice expired). */
export function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  const store = storage();
  let raw: string | null = null;
  try {
    raw = store ? store.getItem(CONSENT_STORAGE_KEY) : null;
  } catch {
    raw = null;
  }
  if (raw === null) return memory;
  if (cache && cache.raw === raw) return cache.record;
  cache = {raw, record: parseConsent(raw)};
  return cache.record;
}

/** True only when the visitor has actively allowed this category. */
export function consentAllows(category: ConsentCategory): boolean {
  return allows(readConsent(), category);
}

export function saveConsent(choices: ConsentChoices): ConsentRecord {
  const previous = readConsent();
  const record = createRecord(choices);
  const store = storage();
  memory = record;
  try {
    store?.setItem(CONSENT_STORAGE_KEY, serialiseConsent(record));
  } catch {
    // Blocked storage: the choice still applies until the page is closed, through `memory`.
  }

  // Switching a category off also clears what it stored.
  for (const category of Object.keys(KEYS_BY_CATEGORY) as ConsentCategory[]) {
    if (!record[category] && (previous?.[category] || !previous)) {
      for (const key of KEYS_BY_CATEGORY[category] ?? []) {
        try {
          store?.removeItem(key);
        } catch {
          // Nothing to clear.
        }
      }
    }
  }
  listeners.forEach((listener) => listener());
  return record;
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) listener();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

/** Asks the banner to open its settings panel (used by the footer link and the privacy page). */
export function openCookieSettings(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));
}

/** React hook: the current saved choice (null while undecided). Returns null during server rendering. */
export function useConsentRecord(): ConsentRecord | null {
  return useSyncExternalStore(subscribeConsent, readConsent, () => null);
}

/** React hook: whether one category is currently allowed. */
export function useConsent(category: ConsentCategory): boolean {
  return allows(useConsentRecord(), category);
}
