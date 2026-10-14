import {describe, expect, it} from 'vitest';
import {books} from '../data/books';
import {partners, type Partner} from '../data/partners';
import {lessonPlacements, normalisePath, placementForLesson, placementForTool, toolPlacements} from '../data/placements';
import {resources, resourceTopics, videos} from '../data/resources';
import {sponsors, type Sponsor} from '../data/sponsors';
import {tools} from '../data/tools';
import {AFFILIATE_REL, PLAIN_EXTERNAL_REL, activeSponsors, amazonBookLink, amazonProductLink, amazonSearchLink, isAsin, isAdsenseClientId, isAdsenseSlotId, isPartnerLive, isSafeHttpsUrl, isYouTubeId, resolvePartnerLink, youtubeSearchLink} from './monetisation';

const broker: Partner = {...partners.pepperstone};

describe('partner links', () => {
  it('links to the partner’s own site, unlabelled, until an affiliate link exists', () => {
    const link = resolvePartnerLink({website: 'https://example.com/', affiliateUrl: null});
    expect(link).toEqual({href: 'https://example.com/', affiliate: false, rel: PLAIN_EXTERNAL_REL});
  });

  it('labels and marks as sponsored any link that can earn a commission', () => {
    const link = resolvePartnerLink({website: 'https://example.com/', affiliateUrl: 'https://go.example.com/?ref=tn'});
    expect(link.affiliate).toBe(true);
    expect(link.href).toBe('https://go.example.com/?ref=tn');
    expect(link.rel).toBe(AFFILIATE_REL);
    expect(link.rel).toContain('sponsored');
    expect(link.rel).toContain('noopener');
  });

  it('ignores an affiliate link that is not https', () => {
    expect(resolvePartnerLink({website: 'https://example.com/', affiliateUrl: 'http://go.example.com/'}).affiliate).toBe(false);
    expect(resolvePartnerLink({website: 'https://example.com/', affiliateUrl: 'javascript:alert(1)'}).affiliate).toBe(false);
    expect(isSafeHttpsUrl('not a url')).toBe(false);
    expect(isSafeHttpsUrl('https://ok.example/')).toBe(true);
  });

  it('only shows a broker once the link, the approval and the risk warning all exist', () => {
    const approved = {approvedBy: 'Compliance', date: '2026-11-01'};
    const ready = {...broker, affiliateUrl: 'https://go.example.com/', promotionApproval: approved, riskWarning: 'CFDs are complex…'};
    expect(isPartnerLive(ready)).toBe(true);
    expect(isPartnerLive({...ready, affiliateUrl: null})).toBe(false);
    expect(isPartnerLive({...ready, promotionApproval: null})).toBe(false);
    expect(isPartnerLive({...ready, promotionApproval: {approvedBy: ' ', date: '2026-11-01'}})).toBe(false);
    expect(isPartnerLive({...ready, riskWarning: null})).toBe(false);
    expect(isPartnerLive({...ready, riskWarning: '  '})).toBe(false);
  });

  it('ships with no broker live and everything else shown', () => {
    expect(isPartnerLive(partners.pepperstone)).toBe(false);
    expect(isPartnerLive(partners.vantage)).toBe(false);
    expect(isPartnerLive(partners.tradingview)).toBe(true);
    expect(isPartnerLive(partners.amazon)).toBe(true);
  });

  it('ships with no affiliate or tracking links switched on', () => {
    for (const partner of Object.values(partners)) expect(partner.affiliateUrl).toBeNull();
    expect(sponsors).toEqual([]);
  });
});

describe('amazon links', () => {
  it('searches amazon.co.uk and encodes the title', () => {
    const link = amazonSearchLink('Trading in the Zone Mark Douglas', null);
    const url = new URL(link.href);
    expect(url.origin).toBe('https://www.amazon.co.uk');
    expect(url.searchParams.get('k')).toBe('Trading in the Zone Mark Douglas');
    expect(link.affiliate).toBe(false);
    expect(url.searchParams.has('tag')).toBe(false);
  });

  it('adds the associate tag and the affiliate label together', () => {
    const link = amazonSearchLink('Market Wizards', 'tradingspelledout-21');
    expect(new URL(link.href).searchParams.get('tag')).toBe('tradingspelledout-21');
    expect(link.affiliate).toBe(true);
    expect(link.rel).toBe(AFFILIATE_REL);
    expect(amazonSearchLink('x', '  ').affiliate).toBe(false);
  });

  it('can not be broken by odd characters in a title', () => {
    const link = amazonSearchLink('A&B=C #1 "x"', 't-21');
    const url = new URL(link.href);
    expect(url.searchParams.get('k')).toBe('A&B=C #1 "x"');
    expect(url.searchParams.get('tag')).toBe('t-21');
  });
});

describe('amazon product links', () => {
  it('recognises well-formed ASINs only', () => {
    expect(isAsin('B0123456789'.slice(0, 10))).toBe(true);
    expect(isAsin('080133773X')).toBe(true);
    expect(isAsin('b012345678')).toBe(false);
    expect(isAsin('B01234567')).toBe(false);
    expect(isAsin('B01234567890')).toBe(false);
    expect(isAsin('../evil/..')).toBe(false);
    expect(isAsin(undefined)).toBe(false);
  });

  it('builds the product link with the store tag and labels it', () => {
    const link = amazonProductLink('080133773X', 'misppelled-21');
    expect(link.href).toBe('https://www.amazon.co.uk/dp/080133773X?tag=misppelled-21');
    expect(link.affiliate).toBe(true);
    expect(link.rel).toBe(AFFILIATE_REL);
    expect(amazonProductLink('080133773X', null)).toMatchObject({href: 'https://www.amazon.co.uk/dp/080133773X', affiliate: false});
  });

  it('prefers the exact product and falls back to search', () => {
    const book = {title: 'Market Wizards', author: 'Jack D. Schwager'};
    expect(amazonBookLink({...book, asin: '080133773X'}, 't-21').href).toContain('/dp/080133773X');
    expect(amazonBookLink(book, 't-21').href).toContain('/s?k=');
    expect(amazonBookLink({...book, asin: 'not-an-asin'}, 't-21').href).toContain('/s?k=');
  });
});

describe('sponsors', () => {
  const sponsor: Sponsor = {id: 's', name: 'Acme', url: 'https://acme.example/', tagline: 'x', placements: ['tool:position-size-calculator', 'all-lessons'], starts: '2026-11-01', ends: '2026-11-30'};

  it('shows a sponsor only inside its dates, inclusive', () => {
    const at = (date: string) => activeSponsors([sponsor], ['tool:position-size-calculator'], new Date(`${date}T12:00:00Z`));
    expect(at('2026-10-31')).toHaveLength(0);
    expect(at('2026-11-01')).toHaveLength(1);
    expect(at('2026-11-30')).toHaveLength(1);
    expect(at('2026-12-01')).toHaveLength(0);
  });

  it('matches by placement', () => {
    const now = new Date('2026-11-15T12:00:00Z');
    expect(activeSponsors([sponsor], ['tool:pip-value-calculator'], now)).toHaveLength(0);
    expect(activeSponsors([sponsor], ['tool:pip-value-calculator', 'all-lessons'], now)).toHaveLength(1);
  });

  it('refuses a sponsor with an unsafe link', () => {
    expect(activeSponsors([{...sponsor, url: 'http://acme.example/'}], ['all-lessons'], new Date('2026-11-15T12:00:00Z'))).toHaveLength(0);
  });
});

describe('placements and data', () => {
  it('only references tools that exist', () => {
    const slugs = new Set(tools.map((tool) => tool.slug));
    for (const slug of Object.keys(toolPlacements)) expect(slugs.has(slug), slug).toBe(true);
  });

  it('only references partners that exist', () => {
    for (const placement of [...Object.values(lessonPlacements), ...Object.values(toolPlacements)]) for (const id of placement.partners ?? []) expect(partners[id], id).toBeDefined();
  });

  it('matches lessons with or without a trailing slash and gives sub-pages their parent’s placement', () => {
    expect(normalisePath('/library/strategy/rules/')).toBe('/library/strategy/rules');
    expect(normalisePath('/library/strategy/rules#top')).toBe('/library/strategy/rules');
    expect(placementForLesson('/library/fundamentals/candlesticks/').partners).toEqual(['tradingview']);
    expect(placementForLesson('/library/strategy/break-and-retest/examples/break-of-structure-example').partners).toEqual(['tradingview']);
    expect(placementForLesson('/library/glossary')).toEqual({});
    expect(placementForTool('nope')).toEqual({});
  });

  it('keeps every resource link https, topics known, and dates real', () => {
    const topics = new Set(resourceTopics.map((topic) => topic.id));
    const ids = new Set<string>();
    for (const resource of resources) {
      expect(isSafeHttpsUrl(resource.url), resource.id).toBe(true);
      expect(ids.has(resource.id), `duplicate ${resource.id}`).toBe(false);
      ids.add(resource.id);
      expect(resource.topics.length, resource.id).toBeGreaterThan(0);
      for (const topic of resource.topics) expect(topics.has(topic), `${resource.id}:${topic}`).toBe(true);
      expect(Number.isNaN(Date.parse(resource.checked)), resource.id).toBe(false);
    }
    // Every topic page has something on it.
    for (const topic of topics) expect(resources.some((resource) => resource.topics.includes(topic)), topic).toBe(true);
  });

  it('is honest about creators who sell products', () => {
    for (const resource of resources.filter((r) => r.cost !== 'Free')) expect(resource.note, resource.id).toBeTruthy();
  });

  it('only lists valid video ids', () => {
    for (const video of videos) expect(isYouTubeId(video.id), video.title).toBe(true);
    expect(isYouTubeId('dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeId('short')).toBe(false);
  });

  it('builds a safe YouTube search link', () => {
    const url = new URL(youtubeSearchLink('Rayner Teo & co'));
    expect(url.origin).toBe('https://www.youtube.com');
    expect(url.searchParams.get('search_query')).toBe('Rayner Teo & co');
  });

  it('only lists valid ASINs, once each', () => {
    const seen = new Set<string>();
    for (const book of books.filter((b) => b.asin)) {
      expect(isAsin(book.asin), book.title).toBe(true);
      expect(seen.has(book.asin as string), `duplicate ${book.asin}`).toBe(false);
      seen.add(book.asin as string);
    }
  });

  it('has a clear reason for every book', () => {
    const titles = new Set<string>();
    for (const book of books) {
      expect(titles.has(book.title), book.title).toBe(false);
      titles.add(book.title);
      expect(book.author.length).toBeGreaterThan(2);
      expect(book.why.length).toBeGreaterThan(30);
      expect(book.topics.length).toBeGreaterThan(0);
    }
  });
});

describe('ad identifiers', () => {
  it('accepts only well-formed AdSense ids', () => {
    expect(isAdsenseClientId('ca-pub-1234567890123456')).toBe(true);
    expect(isAdsenseClientId('ca-pub-123')).toBe(false);
    expect(isAdsenseClientId('<script>')).toBe(false);
    expect(isAdsenseClientId(null)).toBe(false);
    expect(isAdsenseSlotId('1234567890')).toBe(true);
    expect(isAdsenseSlotId('12ab')).toBe(false);
    expect(isAdsenseSlotId(null)).toBe(false);
  });
});
