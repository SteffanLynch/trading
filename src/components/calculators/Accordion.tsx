import type {ReactNode} from 'react';
import styles from './ToolPage.module.css';

interface Props {
  title: string;
  children: ReactNode;
  /** "faq" renders a smaller question-style heading (h3). */
  variant?: 'section' | 'faq';
  /** Collapsed by default. Content stays in the page HTML either way, so it is still readable by search engines. */
  defaultOpen?: boolean;
}

/** A native <details> accordion: keyboard accessible, works without JavaScript, collapsed until opened. */
export default function Accordion({title, children, variant = 'section', defaultOpen = false}: Props) {
  const Heading = variant === 'faq' ? 'h3' : 'h2';
  return (
    <details className={variant === 'faq' ? `${styles.acc} ${styles.accFaq}` : styles.acc} open={defaultOpen || undefined}>
      <summary>
        <Heading>{title}</Heading>
        <span className={styles.accIcon} aria-hidden="true" />
      </summary>
      <div className={styles.accBody}>{children}</div>
    </details>
  );
}
