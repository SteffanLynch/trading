import {describe, expect, it} from 'vitest';
import {analyticsPagePath, analyticsPageUrl, analyticsPageUrlWithCampaign, campaignParams, classifyPage, domainOf, internalPath, normalisePathname, referringDomain} from './routes';

describe('page classification', () => {
  it('describes the fixed pages', () => {
    expect(classifyPage('/')).toEqual({page_type: 'home', route_name: '/'});
    expect(classifyPage('/tools/')).toEqual({page_type: 'tools_hub', route_name: '/tools'});
    expect(classifyPage('/library/')).toEqual({page_type: 'library_index', route_name: '/library'});
    expect(classifyPage('/privacy').page_type).toBe('legal');
    expect(classifyPage('/disclaimer').page_type).toBe('legal');
    expect(classifyPage('/how-this-site-is-funded').page_type).toBe('funding');
    expect(classifyPage('/partners').page_type).toBe('partners');
    expect(classifyPage('/resources').page_type).toBe('resources');
    expect(classifyPage('/media-kit').page_type).toBe('media_kit');
    expect(classifyPage('/search').page_type).toBe('search');
  });

  it('describes lessons by section and slug', () => {
    expect(classifyPage('/library/fundamentals/risk-management')).toEqual({
      page_type: 'lesson',
      route_name: '/library/fundamentals/[lesson]',
      content_section: 'fundamentals',
      content_slug: 'risk-management',
    });
    expect(classifyPage('/library/strategy/rules/')).toMatchObject({content_section: 'strategy', content_slug: 'rules'});
    expect(classifyPage('/library/glossary')).toEqual({page_type: 'lesson', route_name: '/library/glossary', content_section: 'reference', content_slug: 'glossary'});
    expect(classifyPage('/library/manifesto')).toMatchObject({content_section: 'reference', content_slug: 'manifesto'});
  });

  it('describes tools by slug', () => {
    expect(classifyPage('/tools/position-size-calculator')).toEqual({page_type: 'tool', route_name: '/tools/[tool]', tool_slug: 'position-size-calculator'});
  });

  it('files everything else as other', () => {
    expect(classifyPage('/nope/at/all')).toEqual({page_type: 'other', route_name: '/[other]'});
    expect(classifyPage('/tools/a/b')).toEqual({page_type: 'other', route_name: '/[other]'});
    expect(classifyPage('/library/fundamentals/Bad_Slug').page_type).toBe('other');
    expect(classifyPage('/Library/Fundamentals/Risk-Management')).toMatchObject({page_type: 'lesson', content_slug: 'risk-management'}); // lower-cased first
  });

  it('ignores the query string, hash and base URL', () => {
    expect(classifyPage('/tools/position-size-calculator?balance=25000#result').tool_slug).toBe('position-size-calculator');
    expect(classifyPage('/trading/tools/pip-value-calculator', '/trading/').tool_slug).toBe('pip-value-calculator');
    expect(normalisePathname('/trading', '/trading/')).toBe('/');
  });
});

describe('reported paths and URLs', () => {
  it('never carries the query string or hash', () => {
    expect(analyticsPagePath('/tools/position-size-calculator?balance=25000&risk=0.5')).toBe('/tools/position-size-calculator');
    expect(analyticsPageUrl('https://tradingspelledout.com', '/tools/position-size-calculator/?balance=25000#x')).toBe('https://tradingspelledout.com/tools/position-size-calculator');
    expect(analyticsPageUrl('https://tradingspelledout.com', '/')).toBe('https://tradingspelledout.com/');
  });

  it('replaces paths with unexpected characters', () => {
    expect(analyticsPagePath('/a b')).toBe('/[other]');
    expect(analyticsPagePath('/<script>')).toBe('/[other]');
    expect(analyticsPagePath(`/${'a'.repeat(200)}`)).toBe('/[other]');
  });

  it('keeps only plain campaign tags', () => {
    expect(campaignParams('?utm_source=newsletter&utm_medium=email&utm_campaign=spring-2026&balance=25000')).toEqual({
      utm_source: 'newsletter',
      utm_medium: 'email',
      utm_campaign: 'spring-2026',
    });
    expect(campaignParams('?utm_source=https://evil.example/x')).toEqual({});
    expect(campaignParams('?utm_source=person@example.com')).toEqual({});
    expect(campaignParams(`?utm_source=${'a'.repeat(101)}`)).toEqual({});
    expect(campaignParams('?gclid=abc&fbclid=def')).toEqual({});
    expect(analyticsPageUrlWithCampaign('https://tradingspelledout.com', '/tools/pip-value-calculator', '?pair=EURUSD&utm_source=x', '/')).toBe(
      'https://tradingspelledout.com/tools/pip-value-calculator?utm_source=x',
    );
  });
});

describe('domains and links', () => {
  it('reduces a URL to its domain', () => {
    expect(domainOf('https://www.tradingview.com/chart/abc?x=1')).toBe('tradingview.com');
    expect(domainOf('not a url')).toBeUndefined();
    expect(domainOf('http://localhost:3000/x')).toBeUndefined();
  });

  it('ignores direct visits and the site itself as a referrer', () => {
    expect(referringDomain('', 'tradingspelledout.com')).toBeUndefined();
    expect(referringDomain('https://www.tradingspelledout.com/library/', 'tradingspelledout.com')).toBeUndefined();
    expect(referringDomain('https://www.google.com/search?q=position+size', 'tradingspelledout.com')).toBe('google.com');
  });

  it('gives the path of same-site links only', () => {
    const origin = 'https://tradingspelledout.com';
    expect(internalPath('/tools/pip-value-calculator?pair=EURUSD', origin)).toBe('/tools/pip-value-calculator');
    expect(internalPath('https://tradingspelledout.com/library/glossary#pip', origin)).toBe('/library/glossary');
    expect(internalPath('https://www.tradingview.com/', origin)).toBeUndefined();
    expect(internalPath('mailto:hello@example.com', origin)).toBeUndefined();
  });
});
