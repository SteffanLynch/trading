import {useCallback, useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {ACCEPT_ALL, CONSENT_CATEGORIES, REJECT_ALL, type ConsentChoices} from '../../utils/consent';
import {OPEN_SETTINGS_EVENT, readConsent, saveConsent} from './store';
import styles from './consent.module.css';

type View = 'closed' | 'banner' | 'settings';

/**
 * Cookie and storage consent. Shown until a choice is made, and reopened from the footer or the privacy page.
 * "Accept all" and "Reject all" are equally prominent, nothing optional is on by default, and nothing optional runs
 * until a choice is saved.
 */
export default function ConsentBanner() {
  const [view, setView] = useState<View>('closed');
  const [draft, setDraft] = useState<ConsentChoices>(REJECT_ALL);
  const panelRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Decided on the client only, so the server-rendered page never contains the banner.
  useEffect(() => {
    if (!readConsent()) setView('banner');
  }, []);

  useEffect(() => {
    const open = () => {
      const current = readConsent();
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDraft(current ? {preferences: current.preferences, analytics: current.analytics, advertising: current.advertising} : REJECT_ALL);
      setView('settings');
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  // Move keyboard focus into the panel when it opens from a link, so it is not missed.
  useEffect(() => {
    if (view === 'settings') panelRef.current?.focus();
  }, [view]);

  const close = useCallback(() => {
    setView('closed');
    returnFocus.current?.focus();
    returnFocus.current = null;
  }, []);

  const choose = (choices: ConsentChoices) => {
    saveConsent(choices);
    close();
  };

  useEffect(() => {
    if (view !== 'settings' || !readConsent()) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [view, close]);

  if (view === 'closed') return null;

  const settings = view === 'settings';

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={styles.consent}
      role="region"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      data-consent-banner
      data-open={settings ? 'settings' : 'banner'}>
      <h2 id="consent-title" className={styles.title}>
        {settings ? 'Cookie and storage settings' : 'Cookies and similar storage'}
      </h2>
      <p id="consent-desc" className={styles.text}>
        Trading Spelled Out works without any optional cookies. With permission it can also remember calculator settings, measure which lessons and tools are used (with Google Analytics and PostHog), and show advertising. <strong>Nothing optional switches on until a choice is made.</strong> See{' '}
        <Link to="/privacy#cookies">how cookies and storage are used</Link>.
      </p>

      {settings && (
        <ul className={styles.options}>
          <li className={styles.option}>
            <div>
              <strong>Strictly necessary</strong>
              <span>Remembers this choice and the light or dark theme if one is picked. The site cannot work without these, so they are always on.</span>
            </div>
            <span className={styles.always}>Always on</span>
          </li>
          {CONSENT_CATEGORIES.map((category) => (
            <li className={styles.option} key={category.id}>
              <div>
                <strong id={`consent-${category.id}`}>{category.label}</strong>
                <span>{category.description}</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  role="switch"
                  aria-labelledby={`consent-${category.id}`}
                  checked={draft[category.id]}
                  onChange={(event) => setDraft((current) => ({...current, [category.id]: event.target.checked}))}
                />
                <span aria-hidden="true" />
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => choose(REJECT_ALL)}>
          Reject all
        </button>
        <button type="button" className={styles.button} onClick={() => choose(ACCEPT_ALL)}>
          Accept all
        </button>
        {settings ? (
          <button type="button" className={`${styles.button} ${styles.save}`} onClick={() => choose(draft)}>
            Save choices
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.button} ${styles.ghost}`}
            onClick={() => {
              setDraft(REJECT_ALL);
              setView('settings');
            }}>
            Choose
          </button>
        )}
      </div>
    </section>
  );
}
