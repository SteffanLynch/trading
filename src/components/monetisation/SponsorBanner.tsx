import {sponsors} from '../../data/sponsors';
import {PLAIN_EXTERNAL_REL, activeSponsors} from '../../utils/monetisation';
import {trackEvent} from '../calculators/hooks/useTrackCalculation';
import {DisclosureTag} from './Disclosure';
import styles from './monetisation.module.css';

/**
 * "Presented by" line for a directly sold sponsorship. Renders nothing until a sponsor in data/sponsors.ts is live at
 * one of the given placements. Always carries the "Sponsored" label and rel="sponsored".
 */
export default function SponsorBanner({placements}: {placements: string[]}) {
  const [sponsor] = activeSponsors(sponsors, placements);
  if (!sponsor) return null;
  return (
    <aside className={styles.sponsor} aria-label="Sponsor">
      <DisclosureTag kind="sponsored" />
      <p>
        Presented by{' '}
        <a href={sponsor.url} rel={`sponsored ${PLAIN_EXTERNAL_REL}`} target="_blank" onClick={() => trackEvent('sponsor_link_clicked', {sponsor: sponsor.id})}>
          {sponsor.name}
        </a>
        . {sponsor.tagline}
      </p>
      <p className={styles.sponsorNote}>Sponsors do not influence how a calculator works or what a lesson says.</p>
    </aside>
  );
}
