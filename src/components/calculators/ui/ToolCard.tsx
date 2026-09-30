import {useEffect, useRef, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {trackEvent} from '../hooks/useTrackCalculation';
import styles from './ui.module.css';

interface ToolCardProps {
  /** Header label. Shown on every calculator; the page's own H1 carries the full title. */
  title: string;
  name: string;
  inputs: ReactNode;
  results: ReactNode;
  embedded?: boolean;
  /** Where the full version lives, linked from embedded widgets. */
  href?: string;
  dirty?: boolean;
  onReset?: () => void;
  shareUrl?: () => string;
  /** Single-column layout (used by tools whose results are the whole story). */
  stacked?: boolean;
}

export function ToolCard({title, name, inputs, results, embedded = false, href, dirty = false, onReset, shareUrl, stacked = false}: ToolCardProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copyLink() {
    if (!shareUrl) return;
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link', url);
    }
    trackEvent('calculator_link_copied', {calculator_name: name});
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <p className={styles.cardTitle}>{embedded ? `Try it · ${title}` : title}</p>
        <div className={styles.cardActions}>
          {!embedded && dirty && onReset && (
            <button type="button" className={styles.ghostButton} onClick={onReset}>
              Reset
            </button>
          )}
          {!embedded && shareUrl && (
            <button type="button" className={styles.ghostButton} onClick={copyLink} aria-live="polite">
              {copied ? 'Link copied ✓' : 'Copy link'}
            </button>
          )}
          {embedded && href && (
            <Link className={styles.ghostButton} to={href}>
              Full calculator →
            </Link>
          )}
        </div>
      </div>
      <div className={stacked ? styles.body : `${styles.body} ${styles.split}`}>
        <div className={styles.inputs}>{inputs}</div>
        <div className={styles.outputs}>{results}</div>
      </div>
    </div>
  );
}
