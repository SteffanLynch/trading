/**
 * Switches for everything that earns money. Every value ships empty, so a fresh checkout shows no ads, no
 * affiliate tracking links and no sponsor. Fill a value in and the matching feature turns itself on, always behind
 * the visitor's cookie choice and always labelled.
 */

/**
 * Google AdSense publisher ID, for example 'ca-pub-1234567890123456'. While null, no ad script is ever loaded.
 * Also publish /ads.txt (static/ads.txt) with the line AdSense gives you when this is set.
 */
export const ADSENSE_CLIENT: string | null = null;

export type AdSlotName = 'lesson' | 'tool';

/** AdSense ad-unit IDs (the numeric "data-ad-slot"), one per placement. A null slot never renders. */
export const AD_SLOT_IDS: Record<AdSlotName, string | null> = {
  lesson: null,
  tool: null,
};

/**
 * Amazon Associates store ID for amazon.co.uk, for example 'tradingspelledout-21'. While null, book links go to Amazon
 * search results with no tag and are not labelled as affiliate links (because they are not).
 */
export const AMAZON_ASSOCIATE_TAG: string | null = 'misppelled-21';

/** Where sponsorship and advertising enquiries go (media kit). Set to null to fall back to the legal contact address. */
export const SPONSORSHIP_CONTACT_EMAIL: string | null = 'hello@misppelled.com';

/**
 * Wording Amazon requires near associate links (UK programme). Confirm against the current Associates Operating
 * Agreement before turning the tag on.
 */
export const AMAZON_ASSOCIATES_STATEMENT =
  'Misppelled Ltd is a participant in the Amazon EU Associates Programme, an affiliate advertising programme designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.co.uk.';
