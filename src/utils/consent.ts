/**
 * Cookie and storage consent: the pure rules, with no browser access so they can be unit tested.
 *
 * Three optional categories, all off until a visitor chooses otherwise. Anything strictly necessary (remembering the
 * choice itself, the light/dark theme the visitor picks) is not a category because it does not need consent.
 */
export const CONSENT_STORAGE_KEY = 'tn-consent-v1';

/**
 * Bump when the categories change so everyone is asked again. Version 2: "analytics" now means Google Analytics and
 * PostHog by name (it was an unnamed provider that had never been installed), so earlier choices are not carried over.
 */
export const CONSENT_VERSION = 2;

/** A saved choice expires after a year and the banner returns. */
export const CONSENT_MAX_AGE_DAYS = 365;

export type ConsentCategory = 'preferences' | 'analytics' | 'advertising';

export type ConsentChoices = Record<ConsentCategory, boolean>;

export interface ConsentRecord extends ConsentChoices {
  version: number;
  savedAt: string;
}

export const REJECT_ALL: ConsentChoices = {preferences: false, analytics: false, advertising: false};
export const ACCEPT_ALL: ConsentChoices = {preferences: true, analytics: true, advertising: true};

export interface ConsentCategoryInfo {
  id: ConsentCategory;
  label: string;
  description: string;
}

export const CONSENT_CATEGORIES: ConsentCategoryInfo[] = [
  {
    id: 'preferences',
    label: 'Remember calculator settings',
    description: 'Keeps account currency, risk and balance in this browser so the calculators start where they were left. Stays on the device; nothing is sent anywhere.',
  },
  {
    id: 'analytics',
    label: 'Anonymous usage analytics',
    description: 'Helps work out which lessons and tools are used and which are confusing, using Google Analytics and PostHog. PostHog can also receive the numbers typed into a calculator and the result. Never a name or email address.',
  },
  {
    id: 'advertising',
    label: 'Advertising',
    description: 'Allows advertising networks to show ads on the site and to set cookies for that purpose. Without this, no ad network is loaded.',
  },
];

export function createRecord(choices: ConsentChoices, now: Date = new Date()): ConsentRecord {
  return {
    preferences: choices.preferences,
    analytics: choices.analytics,
    advertising: choices.advertising,
    version: CONSENT_VERSION,
    savedAt: now.toISOString(),
  };
}

export function serialiseConsent(record: ConsentRecord): string {
  return JSON.stringify(record);
}

/**
 * Reads a stored choice. Returns null (meaning "ask again") when nothing is stored, the value is malformed, it was
 * saved under an older version of the categories, or it is more than a year old.
 */
export function parseConsent(raw: string | null | undefined, now: Date = new Date()): ConsentRecord | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const value = data as Record<string, unknown>;
  if (value.version !== CONSENT_VERSION) return null;
  if (typeof value.preferences !== 'boolean' || typeof value.analytics !== 'boolean' || typeof value.advertising !== 'boolean') return null;
  if (typeof value.savedAt !== 'string') return null;
  const saved = Date.parse(value.savedAt);
  if (!Number.isFinite(saved)) return null;
  const ageDays = (now.getTime() - saved) / 86_400_000;
  if (ageDays < 0 || ageDays > CONSENT_MAX_AGE_DAYS) return null;
  return {version: CONSENT_VERSION, savedAt: value.savedAt, preferences: value.preferences, analytics: value.analytics, advertising: value.advertising};
}

/** True only when the visitor has actively allowed the category. No record means no. */
export function allows(record: ConsentRecord | null, category: ConsentCategory): boolean {
  return record?.[category] === true;
}
