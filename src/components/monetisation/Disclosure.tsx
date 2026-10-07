import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './monetisation.module.css';

export type DisclosureKind = 'affiliate' | 'sponsored' | 'ad';

const LABELS: Record<DisclosureKind, string> = {
  affiliate: 'Affiliate link',
  sponsored: 'Sponsored',
  ad: 'Ad',
};

/** The small label that sits next to any link or placement that earns money. Plain text, so screen readers read it. */
export function DisclosureTag({kind}: {kind: DisclosureKind}) {
  return <span className={`${styles.tag} ${styles[`tag_${kind}`]}`}>{LABELS[kind]}</span>;
}

/** The sentence shown with any block that contains an affiliate link. */
export function AffiliateDisclosure({children}: {children?: ReactNode}) {
  return (
    <p className={styles.disclosure}>
      {children ?? 'Links marked “Affiliate link” are affiliate links: Trading Notes may earn a commission if something is bought or an account is opened through them, at no extra cost. '}
      <Link to="/how-this-site-is-funded">How this site is funded</Link>.
    </p>
  );
}
