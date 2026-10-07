import type {Partner} from '../data/partners';
import type {Sponsor} from '../data/sponsors';

/** rel values: affiliate and sponsored links say so to search engines; every external link drops the opener. */
export const AFFILIATE_REL = 'sponsored noopener noreferrer';
export const PLAIN_EXTERNAL_REL = 'noopener noreferrer';

/** Only absolute https URLs are ever used as outbound links. */
export function isSafeHttpsUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export interface ResolvedLink {
  href: string;
  /** True when following the link can earn a commission, so it must be labelled. */
  affiliate: boolean;
  rel: string;
}

/** The link to use for a partner: its tracking link when there is a valid one, otherwise its own site, unlabelled. */
export function resolvePartnerLink(partner: Pick<Partner, 'website' | 'affiliateUrl'>): ResolvedLink {
  if (isSafeHttpsUrl(partner.affiliateUrl)) return {href: partner.affiliateUrl, affiliate: true, rel: AFFILIATE_REL};
  return {href: partner.website, affiliate: false, rel: PLAIN_EXTERNAL_REL};
}

/**
 * Whether a partner may be shown at all. Brokers need a tracking link, a recorded promotion approval and the exact
 * risk warning, because promoting regulated products is a financial promotion. Everyone else is always shown.
 */
export function isPartnerLive(partner: Pick<Partner, 'kind' | 'affiliateUrl' | 'promotionApproval' | 'riskWarning'>): boolean {
  if (partner.kind !== 'broker') return true;
  return (
    isSafeHttpsUrl(partner.affiliateUrl) &&
    !!partner.promotionApproval?.approvedBy.trim() &&
    !!partner.promotionApproval?.date.trim() &&
    !!partner.riskWarning?.trim()
  );
}

/** An Amazon.co.uk search link for a title, tagged as an affiliate link only when a store ID is configured. */
export function amazonSearchLink(query: string, tag: string | null): ResolvedLink {
  const url = new URL('https://www.amazon.co.uk/s');
  url.searchParams.set('k', query);
  if (tag?.trim()) {
    url.searchParams.set('tag', tag.trim());
    return {href: url.toString(), affiliate: true, rel: AFFILIATE_REL};
  }
  return {href: url.toString(), affiliate: false, rel: PLAIN_EXTERNAL_REL};
}

/** ASINs are 10 letters and digits (ISBN-10 books use the ISBN, which can end in X). */
export function isAsin(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^[A-Z0-9]{10}$/.test(value);
}

/** A direct Amazon.co.uk product link for an ASIN, tagged as an affiliate link only when a store ID is configured. */
export function amazonProductLink(asin: string, tag: string | null): ResolvedLink {
  const url = new URL(`https://www.amazon.co.uk/dp/${asin}`);
  if (tag?.trim()) {
    url.searchParams.set('tag', tag.trim());
    return {href: url.toString(), affiliate: true, rel: AFFILIATE_REL};
  }
  return {href: url.toString(), affiliate: false, rel: PLAIN_EXTERNAL_REL};
}

/** The best link for a book: the exact product when it has a valid ASIN, otherwise a search for it. */
export function amazonBookLink(book: {title: string; author: string; asin?: string}, tag: string | null): ResolvedLink {
  return isAsin(book.asin) ? amazonProductLink(book.asin, tag) : amazonSearchLink(`${book.title} ${book.author}`, tag);
}

/** A YouTube search link: always valid, used when a creator's official channel link is not published on their own site. */
export function youtubeSearchLink(query: string): string {
  const url = new URL('https://www.youtube.com/results');
  url.searchParams.set('search_query', query);
  return url.toString();
}

/** Sponsors running at a placement on a date. Dates are inclusive, and an unsafe URL disqualifies a sponsor. */
export function activeSponsors(list: readonly Sponsor[], placements: readonly string[], now: Date = new Date()): Sponsor[] {
  const day = now.toISOString().slice(0, 10);
  return list.filter(
    (sponsor) => isSafeHttpsUrl(sponsor.url) && sponsor.starts <= day && day <= sponsor.ends && sponsor.placements.some((placement) => placements.includes(placement)),
  );
}

/** The 11-character YouTube ID check, so a typo in the data file fails a test instead of showing a broken player. */
export function isYouTubeId(value: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(value);
}

/** AdSense publisher IDs look like ca-pub- followed by 16 digits. */
export function isAdsenseClientId(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^ca-pub-\d{16}$/.test(value);
}

/** AdSense ad-unit IDs are numeric. */
export function isAdsenseSlotId(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d{6,15}$/.test(value);
}
