/**
 * Pure helpers behind the calculators' shareable links and remembered preferences.
 * Kept free of React and the DOM so they can be unit tested.
 */

export interface FieldSpec {
  /** Value the field starts with. */
  default: string;
  /** Allowed values for a select/segmented field. Anything else in a URL is ignored. */
  options?: readonly string[];
  /** Remember this field between visits and across calculators (browser localStorage only). */
  pref?: boolean;
  /** Longest value accepted from a link. Defaults to 24, enough for a number; list fields need more. */
  maxLength?: number;
  /** Keep commas as separators (list fields such as "10:100,12:200") instead of treating them as thousands separators. */
  list?: boolean;
}

export type FieldSpecs<K extends string> = Record<K, FieldSpec>;
export type FieldValues<K extends string> = Record<K, string>;

const SAFE_VALUE = /^[\w.,+\-%: ]*$/;
const DEFAULT_MAX_LENGTH = 24;

/** Returns the value if it is acceptable for the field, otherwise `null`. */
export function sanitizeValue(spec: FieldSpec, raw: string): string | null {
  if (spec.options) return spec.options.includes(raw) ? raw : null;
  return raw.length <= (spec.maxLength ?? DEFAULT_MAX_LENGTH) && SAFE_VALUE.test(raw) ? raw : null;
}

function normalise(spec: FieldSpec, value: string): string {
  // Thousands separators are only ever formatting, so links stay clean (balance=10000, not 10,000).
  if (spec.options) return value;
  return spec.list ? value.trim() : value.replace(/,/g, '').trim();
}

export function defaultValues<K extends string>(specs: FieldSpecs<K>): FieldValues<K> {
  const values = {} as FieldValues<K>;
  for (const key of Object.keys(specs) as K[]) values[key] = specs[key].default;
  return values;
}

/** Reads known, valid fields out of a query string. Unknown keys and unsafe values are dropped. */
export function readParams<K extends string>(specs: FieldSpecs<K>, search: string): Partial<FieldValues<K>> {
  const params = new URLSearchParams(search);
  const found: Partial<FieldValues<K>> = {};
  for (const key of Object.keys(specs) as K[]) {
    const raw = params.get(key);
    if (raw === null) continue;
    const clean = sanitizeValue(specs[key], raw);
    if (clean !== null) found[key] = clean;
  }
  return found;
}

/** A query string containing only the fields that differ from their defaults. */
export function buildQuery<K extends string>(specs: FieldSpecs<K>, values: FieldValues<K>): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(specs) as K[]) {
    const spec = specs[key];
    const value = normalise(spec, values[key]);
    if (value !== normalise(spec, spec.default)) params.set(key, value);
  }
  return params.toString();
}

const PREFS_KEY = 'tn-tools-prefs-v1';

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** Preferences saved on this device. Returns an empty object when storage is unavailable. */
export function loadPrefs(): Record<string, string> {
  try {
    const raw = storage()?.getItem(PREFS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const prefs: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) if (typeof value === 'string') prefs[key] = value;
    return prefs;
  } catch {
    return {};
  }
}

export function savePref(key: string, value: string): void {
  try {
    const store = storage();
    if (!store) return;
    store.setItem(PREFS_KEY, JSON.stringify({...loadPrefs(), [key]: value}));
  } catch {
    // Private windows and blocked storage simply mean nothing is remembered.
  }
}

/** Overlays saved preferences, then the URL, onto the defaults. Later sources win. */
export function resolveInitialValues<K extends string>(
  specs: FieldSpecs<K>,
  prefs: Record<string, string>,
  fromUrl: Partial<FieldValues<K>>,
): {values: FieldValues<K>; urlKeys: K[]} {
  const values = defaultValues(specs);
  for (const key of Object.keys(specs) as K[]) {
    const spec = specs[key];
    if (!spec.pref || prefs[key] === undefined) continue;
    const clean = sanitizeValue(spec, prefs[key]);
    if (clean !== null && clean !== '') values[key] = clean;
  }
  const urlKeys = Object.keys(fromUrl) as K[];
  for (const key of urlKeys) values[key] = fromUrl[key] as string;
  return {values, urlKeys};
}

/** Identity helper that lets TypeScript infer the field names from the object literal. */
export function defineSpecs<K extends string>(specs: FieldSpecs<K>): FieldSpecs<K> {
  return specs;
}
