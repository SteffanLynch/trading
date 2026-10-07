import type {ReactNode} from 'react';
import {openCookieSettings} from './store';
import styles from './consent.module.css';

/** Opens the cookie settings panel. Used on the privacy page; the footer uses a plain data attribute instead. */
export default function CookieSettingsButton({children = 'Change cookie settings'}: {children?: ReactNode}) {
  return (
    <button type="button" className={`${styles.button} ${styles.inline}`} onClick={openCookieSettings}>
      {children}
    </button>
  );
}
