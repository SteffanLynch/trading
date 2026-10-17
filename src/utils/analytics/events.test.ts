import {describe, expect, it} from 'vitest';
import {EVENT_NAMES, cleanSearchTerm, gaEventFor, sanitizeCapture, sendsToGoogleAnalytics, type EventName} from './events';

const here = {origin: 'https://tradingspelledout.com', hostname: 'tradingspelledout.com', pathname: '/tools/position-size-calculator'};

describe('what PostHog may receive', () => {
  it('drops events that are not in the catalogue', () => {
    for (const event of ['$identify', '$autocapture', '$exception', '$snapshot', '$web_vitals', '$feature_flag_called', 'made_up_event']) {
      expect(sanitizeCapture(event, {}, here)).toBeNull();
    }
    expect(EVENT_NAMES.has('$pageview')).toBe(true);
    expect(EVENT_NAMES.has('calculator_calculated')).toBe(true);
  });

  it('rebuilds the page URL from the path, whatever the library supplies', () => {
    const clean = sanitizeCapture(
      '$pageview',
      {$current_url: 'https://tradingspelledout.com/tools/position-size-calculator?balance=25000&risk=0.5', $pathname: '/tools/position-size-calculator?balance=25000', $host: 'evil.example', $referring_domain: 'www.google.com'},
      here,
    );
    expect(clean).toMatchObject({
      $current_url: 'https://tradingspelledout.com/tools/position-size-calculator',
      $pathname: '/tools/position-size-calculator',
      $host: 'tradingspelledout.com',
      $referring_domain: 'www.google.com',
    });
    expect(JSON.stringify(clean)).not.toContain('25000');
  });

  it('keeps the page an event was raised on, even if the visitor has moved on since', () => {
    const clean = sanitizeCapture('cta_clicked', {cta_id: 'home-hero-library', $pathname: '/tools', $current_url: 'https://tradingspelledout.com/tools?x=1'}, here);
    expect(clean).toMatchObject({$pathname: '/tools', $current_url: 'https://tradingspelledout.com/tools'});
    expect(sanitizeCapture('cta_clicked', {$pathname: '/tools?balance=25000'}, here)).toMatchObject({$pathname: '/tools'});
    expect(sanitizeCapture('cta_clicked', {$pathname: '/<script>'}, here)).toMatchObject({$pathname: '/[other]'});
    expect(sanitizeCapture('cta_clicked', {}, here)).toMatchObject({$pathname: '/tools/position-size-calculator'});
  });

  it('never creates a person profile', () => {
    expect(sanitizeCapture('cta_clicked', {$process_person_profile: true}, here)).toMatchObject({$process_person_profile: false});
  });

  it('drops what PostHog adds that is not on the list', () => {
    const clean = sanitizeCapture(
      '$pageview',
      {
        $raw_user_agent: 'Mozilla/5.0 (secret)',
        $referrer: 'https://www.google.com/search?q=private',
        $initial_referrer: 'x',
        $set: {email: 'a@b.c'},
        $browser: 'Chrome',
        $session_id: 'abc',
        $prev_pageview_pathname: '/library/glossary',
        $prev_pageview_max_scroll_percentage: 0.6,
        utm_source: 'newsletter',
        gclid: 'abc',
        email: 'a@b.c',
        constructor: 'x',
      },
      here,
    );
    expect(clean).toMatchObject({$browser: 'Chrome', $session_id: 'abc', $prev_pageview_pathname: '/library/glossary', $prev_pageview_max_scroll_percentage: 0.6, utm_source: 'newsletter'});
    for (const key of ['$raw_user_agent', '$referrer', '$initial_referrer', '$set', 'gclid', 'email', 'constructor']) expect(clean).not.toHaveProperty(key);
  });

  it('rejects a previous-page value that holds a query string', () => {
    expect(sanitizeCapture('$pageview', {$prev_pageview_pathname: '/tools/x?balance=1'}, here)).not.toHaveProperty('$prev_pageview_pathname');
  });

  it('keeps calculator inputs and outputs, as flat plain values', () => {
    const clean = sanitizeCapture(
      'calculator_calculated',
      {
        calculator_name: 'position_size',
        placement: 'page',
        account_balance: 10000,
        account_currency: 'USD',
        risk_percentage: 1,
        position_size_lots: 0.2000000000001,
        amount_at_risk: null,
        nested: {a: 1},
        list: [1, 2],
        link: 'https://example.com/x',
        'bad key': 1,
        page_type: 'tool',
      },
      here,
    );
    expect(clean).toMatchObject({calculator_name: 'position_size', placement: 'page', account_balance: 10000, account_currency: 'USD', risk_percentage: 1, position_size_lots: 0.2, page_type: 'tool'});
    for (const key of ['amount_at_risk', 'nested', 'list', 'link', 'bad key']) expect(clean).not.toHaveProperty(key);
  });

  it('limits how many calculator properties get through', () => {
    const many = Object.fromEntries(Array.from({length: 80}, (_, index) => [`value_${index}`, index]));
    const clean = sanitizeCapture('calculator_calculated', {calculator_name: 'x', placement: 'page', ...many}, here)!;
    expect(Object.keys(clean).filter((key) => key.startsWith('value_')).length).toBeLessThanOrEqual(40);
  });

  it('only accepts declared properties on other events', () => {
    expect(sanitizeCapture('partner_link_clicked', {partner: 'tradingview', placement: 'lesson:/library/fundamentals/candlesticks', affiliate: false, href: 'https://x.example', note: 'hi'}, here)).toMatchObject({
      partner: 'tradingview',
      placement: 'lesson:/library/fundamentals/candlesticks',
      affiliate: false,
    });
    const clean = sanitizeCapture('partner_link_clicked', {partner: 'TradingView Pro!', placement: 'https://evil.example', affiliate: 'yes'}, here)!;
    expect(clean).not.toHaveProperty('partner');
    expect(clean).not.toHaveProperty('placement');
    expect(clean).not.toHaveProperty('affiliate');
  });

  it('rejects free text smuggled through identifier properties', () => {
    const clean = sanitizeCapture('outbound_link_clicked', {destination_domain: 'example.com/private?token=1', link_area: 'my secret page'}, here)!;
    expect(clean).not.toHaveProperty('destination_domain');
    expect(clean).not.toHaveProperty('link_area');
    expect(sanitizeCapture('outbound_link_clicked', {destination_domain: 'tradingview.com', link_area: 'lesson'}, here)).toMatchObject({destination_domain: 'tradingview.com', link_area: 'lesson'});
  });

  it('only accepts in-site paths with no query on link events', () => {
    expect(sanitizeCapture('nav_link_clicked', {nav_area: 'navbar', destination_path: '/tools'}, here)).toMatchObject({destination_path: '/tools'});
    expect(sanitizeCapture('nav_link_clicked', {nav_area: 'navbar', destination_path: '/tools?x=1'}, here)).not.toHaveProperty('destination_path');
    expect(sanitizeCapture('nav_link_clicked', {nav_area: 'navbar', destination_path: 'https://evil.example/'}, here)).not.toHaveProperty('destination_path');
  });

  it('accepts only an 11-character video ID', () => {
    expect(sanitizeCapture('video_played', {video_id: 'dQw4w9WgXcQ', placement: 'resources'}, here)).toMatchObject({video_id: 'dQw4w9WgXcQ'});
    expect(sanitizeCapture('video_played', {video_id: 'https://youtu.be/x', placement: 'resources'}, here)).not.toHaveProperty('video_id');
  });

  it('accepts fixed context properties and rejects odd ones', () => {
    const clean = sanitizeCapture('image_expanded', {page_type: 'lesson', route_name: '/library/fundamentals/[lesson]', content_section: 'fundamentals', deployment_environment: 'production', color_mode: 'purple', tool_slug: 'Bad Slug'}, here)!;
    expect(clean).toMatchObject({page_type: 'lesson', route_name: '/library/fundamentals/[lesson]', content_section: 'fundamentals', deployment_environment: 'production'});
    expect(clean).not.toHaveProperty('color_mode');
    expect(clean).not.toHaveProperty('tool_slug');
  });
});

describe('search terms', () => {
  it('keeps short plain searches, tidied', () => {
    expect(cleanSearchTerm('  Risk   Management ')).toBe('risk management');
    expect(cleanSearchTerm('pip value')).toBe('pip value');
  });

  it('drops anything that could be personal or is not a search', () => {
    for (const bad of ['me@example.com', 'https://example.com', 'www.example.org', 'call 07700900123', 'a', '', 'x'.repeat(61), '<script>', null, 4]) {
      expect(cleanSearchTerm(bad)).toBeUndefined();
    }
  });

  it('is applied to search events', () => {
    expect(sanitizeCapture('search_performed', {surface: 'palette', search_term: 'Break Even', result_count: 3}, here)).toMatchObject({search_term: 'break even', result_count: 3, surface: 'palette'});
    expect(sanitizeCapture('search_performed', {surface: 'palette', search_term: 'me@example.com', result_count: 0}, here)).not.toHaveProperty('search_term');
  });
});

describe('what Google Analytics may receive', () => {
  const clean = (event: EventName, props: Record<string, unknown>) => sanitizeCapture(event, props, here)!;

  it('gets calculator use without a single value', () => {
    const event = gaEventFor(
      'calculator_calculated',
      clean('calculator_calculated', {calculator_name: 'position_size', placement: 'page', account_balance: 25000, risk_percentage: 1, page_type: 'tool', tool_slug: 'position-size-calculator', tool_group: 'Plan a trade'}),
    );
    expect(event).toEqual({
      name: 'calculator_calculated',
      params: {page_type: 'tool', tool_slug: 'position-size-calculator', tool_group: 'Plan a trade', calculator_name: 'position_size', placement: 'page'},
    });
    expect(JSON.stringify(event)).not.toContain('25000');
  });

  it('gets the search without the words', () => {
    const event = gaEventFor('search_performed', clean('search_performed', {surface: 'palette', search_term: 'break even', result_count: 2}));
    expect(event).toEqual({name: 'site_search', params: {surface: 'palette', result_count: 2}});
  });

  it('uses Google recommended names where one fits', () => {
    expect(gaEventFor('calculator_link_copied', clean('calculator_link_copied', {calculator_name: 'position_size'}))).toMatchObject({name: 'share', params: {method: 'copy_link', content_type: 'calculator', item_id: 'position_size'}});
    expect(gaEventFor('contact_email_clicked', clean('contact_email_clicked', {contact_purpose: 'sponsorship'}))).toMatchObject({name: 'generate_lead', params: {lead_type: 'sponsorship_enquiry'}});
    expect(gaEventFor('contact_email_clicked', clean('contact_email_clicked', {contact_purpose: 'legal'}))).toMatchObject({name: 'contact_email_clicked', params: {contact_purpose: 'legal'}});
  });

  it('leaves PostHog-only events out', () => {
    for (const event of ['image_expanded', 'search_opened', 'search_result_clicked', 'tool_section_opened', 'nav_link_clicked', 'calculator_reset'] as EventName[]) {
      expect(sendsToGoogleAnalytics(event)).toBe(false);
      expect(gaEventFor(event, {})).toBeNull();
    }
  });

  it('every event Google receives is a catalogue event', () => {
    for (const name of EVENT_NAMES) if (sendsToGoogleAnalytics(name as EventName)) expect(EVENT_NAMES.has(name)).toBe(true);
  });
});
