import {useEffect, useRef} from 'react';
import {useLocation} from '@docusaurus/router';
import {AD_SLOT_IDS, ADSENSE_CLIENT, type AdSlotName} from '../../data/monetisation';
import {isAdsenseClientId, isAdsenseSlotId} from '../../utils/monetisation';
import {useConsent} from '../consent/store';
import {loadAdsense, requestAd} from './adsense';
import {DisclosureTag} from './Disclosure';
import styles from './monetisation.module.css';

/**
 * A labelled advertising slot that never moves the page.
 *
 * It renders nothing unless ads are configured (AdSense ID and a slot ID) AND the visitor has allowed advertising.
 * When it does render, the box has a fixed height and clips its contents, so an ad that loads late or comes back
 * taller than expected cannot push the text around. Slots are only placed at the end of a block of content, so the
 * moment one appears is below what is being read.
 */
export default function AdSlot({slot, className}: {slot: AdSlotName; className?: string}) {
  const allowed = useConsent('advertising');
  const {pathname} = useLocation();
  const requested = useRef(false);
  const unit = AD_SLOT_IDS[slot];
  const ready = allowed && isAdsenseClientId(ADSENSE_CLIENT) && isAdsenseSlotId(unit);

  useEffect(() => {
    if (!ready || requested.current || !ADSENSE_CLIENT) return;
    requested.current = true;
    loadAdsense(ADSENSE_CLIENT);
    requestAd();
  }, [ready]);

  if (!ready || !ADSENSE_CLIENT || !unit) return null;

  return (
    <aside className={`${styles.ad} ${className ?? ''}`} aria-label="Advertisement" key={pathname}>
      <p className={styles.adLabel}>
        <DisclosureTag kind="ad" /> Advertisement
      </p>
      <div className={styles.adBox}>
        <ins className="adsbygoogle" style={{display: 'block', width: '100%', height: '100%'}} data-ad-client={ADSENSE_CLIENT} data-ad-slot={unit} data-ad-format="auto" data-full-width-responsive="true" />
      </div>
    </aside>
  );
}
