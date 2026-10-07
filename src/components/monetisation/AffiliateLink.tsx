import type {ReactNode} from 'react';
import {trackEvent} from '../calculators/hooks/useTrackCalculation';
import {DisclosureTag} from './Disclosure';
import styles from './monetisation.module.css';
import type {ResolvedLink} from '../../utils/monetisation';

interface Props {
  link: ResolvedLink;
  /** What the link is called in analytics, for example 'tradingview'. */
  name: string;
  /** Where on the site it sits, for example 'lesson-callout'. */
  placement: string;
  className?: string;
  children: ReactNode;
}

/**
 * Every outbound partner link goes through here. If the link can earn a commission it is marked rel="sponsored" and
 * gets a visible "Affiliate link" label automatically, so a labelled link cannot be forgotten. Opens in a new tab.
 */
export default function AffiliateLink({link, name, placement, className, children}: Props) {
  return (
    <a
      href={link.href}
      rel={link.rel}
      target="_blank"
      className={className ?? styles.button}
      onClick={() => trackEvent('partner_link_clicked', {partner: name, placement, affiliate: link.affiliate})}>
      <span>
        {children}
        <span className={styles.sr}> (opens in a new tab)</span>
      </span>
      <span aria-hidden="true" className={styles.arrow}>
        ↗
      </span>
      {link.affiliate && <DisclosureTag kind="affiliate" />}
    </a>
  );
}
