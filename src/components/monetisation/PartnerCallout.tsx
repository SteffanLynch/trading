import type {CSSProperties} from 'react';
import Link from '@docusaurus/Link';
import {partners, type Partner, type PartnerAccent, type PartnerId} from '../../data/partners';
import {isPartnerLive, resolvePartnerLink} from '../../utils/monetisation';
import AffiliateLink from './AffiliateLink';
import {AffiliateDisclosure} from './Disclosure';
import styles from './monetisation.module.css';

export const accentVars = (accent: PartnerAccent) => ({'--c': `var(--${accent})`, '--ct': `var(--${accent}-t)`}) as CSSProperties;

/** A compact, labelled mention of the partners that are relevant to the page. Renders nothing if none are live. */
export default function PartnerCallout({ids, placement}: {ids: PartnerId[]; placement: string}) {
  const live = ids.map((id) => partners[id]).filter(isPartnerLive);
  const charting = live.filter((partner) => partner.kind === 'charting');
  const brokers = live.filter((partner) => partner.kind === 'broker');
  if (charting.length === 0 && brokers.length === 0) return null;

  return (
    <>
      {charting.map((partner) => (
        <ChartingCallout key={partner.id} partner={partner} placement={placement} />
      ))}
      {brokers.length > 0 && <BrokerCallout brokers={brokers} placement={placement} />}
    </>
  );
}

function ChartingCallout({partner, placement}: {partner: Partner; placement: string}) {
  const link = resolvePartnerLink(partner);
  return (
    <aside className={styles.block} style={accentVars(partner.accent)} aria-label={`${partner.name}: partner`}>
      <p className={styles.eyebrow}>Practise on real charts</p>
      <p className={styles.lead}>{partner.inContext}</p>
      <div className={styles.actions}>
        <AffiliateLink link={link} name={partner.id} placement={placement}>
          Open {partner.name}
        </AffiliateLink>
      </div>
      <p className={styles.fine}>
        {partner.name} is a third-party service with its own sign-up and terms. Nothing here is a recommendation to buy or trade anything.
      </p>
      {link.affiliate && <AffiliateDisclosure />}
    </aside>
  );
}

function BrokerCallout({brokers, placement}: {brokers: Partner[]; placement: string}) {
  const anyAffiliate = brokers.some((broker) => resolvePartnerLink(broker).affiliate);
  return (
    <aside className={styles.block} style={accentVars('violet')} aria-label="Brokers: partners">
      <p className={styles.eyebrow}>Choosing a broker</p>
      <p className={styles.lead}>{brokers[0].inContext}</p>
      <ul className={styles.partnerList}>
        {brokers.map((broker) => (
          <li key={broker.id}>
            <div>
              <strong>{broker.name}</strong>
              <span>{broker.tagline}</span>
            </div>
            <AffiliateLink link={resolvePartnerLink(broker)} name={broker.id} placement={placement}>
              Visit {broker.name}
            </AffiliateLink>
            <p className={styles.risk}>{broker.riskWarning}</p>
          </li>
        ))}
      </ul>
      <p className={styles.fine}>
        Not a recommendation or financial advice. Check any broker on the FCA Register first, and read the <Link to="/partners#brokers">broker checklist</Link>.
      </p>
      {anyAffiliate && <AffiliateDisclosure />}
    </aside>
  );
}
