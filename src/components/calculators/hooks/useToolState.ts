import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  buildQuery,
  defaultValues,
  loadPrefs,
  readParams,
  resolveInitialValues,
  savePref,
  type FieldSpecs,
  type FieldValues,
} from '../../../utils/calculators/toolState';

interface Options<K extends string> {
  /** Reflect the inputs in the address bar so the link can be shared. Off for widgets embedded in articles. */
  syncUrl: boolean;
  /**
   * Start from the visitor's saved preferences (currency, risk, balance…). Defaults to `syncUrl`: full pages
   * remember people, but a widget inside an article always opens on the article's own worked example so the
   * surrounding text still matches. Preferences are still saved from embedded widgets.
   */
  restorePrefs?: boolean;
  /**
   * Runs once after saved preferences and URL parameters are applied. Use it to fill in values that depend
   * on others (e.g. example prices for a market that arrived without them).
   */
  finalize?: (values: FieldValues<K>, urlKeys: K[]) => FieldValues<K>;
}

export interface ToolState<K extends string> {
  values: FieldValues<K>;
  set: (key: K, value: string) => void;
  setMany: (patch: Partial<FieldValues<K>>) => void;
  /** True once the visitor has changed something (not just loaded a shared link). */
  dirty: boolean;
  reset: () => void;
  /** Absolute link that recreates the current inputs. */
  shareUrl: () => string;
}

/**
 * Holds a calculator's inputs as strings (so an empty box stays empty rather than becoming 0).
 *
 * Server render and first client render both use the defaults, so hydration always matches. After mount the
 * hook layers on remembered preferences and any shared-link parameters.
 */
export function useToolState<K extends string>(specs: FieldSpecs<K>, options: Options<K>): ToolState<K> {
  const {syncUrl, finalize} = options;
  const restorePrefs = options.restorePrefs ?? syncUrl;
  const keys = useMemo(() => Object.keys(specs) as K[], [specs]);
  const [values, setValues] = useState<FieldValues<K>>(() => defaultValues(specs));
  const [dirty, setDirty] = useState(false);
  const finalizeRef = useRef(finalize);
  finalizeRef.current = finalize;

  useEffect(() => {
    const fromUrl = syncUrl ? readParams(specs, window.location.search) : {};
    const {values: initial, urlKeys} = resolveInitialValues(specs, restorePrefs ? loadPrefs() : {}, fromUrl);
    const finished = finalizeRef.current ? finalizeRef.current(initial, urlKeys) : initial;
    if (keys.some((key) => finished[key] !== specs[key].default)) setValues(finished);
    // Runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remember = useCallback(
    (key: K, value: string) => {
      if (specs[key].pref && value.trim() !== '') savePref(key, value);
    },
    [specs],
  );

  const set = useCallback(
    (key: K, value: string) => {
      setValues((current) => ({...current, [key]: value}));
      setDirty(true);
      remember(key, value);
    },
    [remember],
  );

  const setMany = useCallback(
    (patch: Partial<FieldValues<K>>) => {
      setValues((current) => ({...current, ...patch}));
      setDirty(true);
      for (const key of Object.keys(patch) as K[]) remember(key, patch[key] as string);
    },
    [remember],
  );

  useEffect(() => {
    if (!syncUrl || !dirty) return undefined;
    const timer = window.setTimeout(() => {
      const query = buildQuery(specs, values);
      const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
      // Keep the router's own history state; only the visible URL changes.
      window.history.replaceState(window.history.state, '', url);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [syncUrl, dirty, values, specs]);

  const reset = useCallback(() => {
    setValues(defaultValues(specs));
    setDirty(false);
    if (syncUrl) window.history.replaceState(window.history.state, '', window.location.pathname + window.location.hash);
  }, [specs, syncUrl]);

  const shareUrl = useCallback(() => {
    const query = buildQuery(specs, values);
    return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
  }, [specs, values]);

  return {values, set, setMany, dirty, reset, shareUrl};
}
