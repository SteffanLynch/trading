import {describe, expect, it} from 'vitest';
import {analyticsAllowedOnHost, isGaMeasurementId, isPosthogToken, normalisePosthogHost, resolveAnalyticsConfig} from './config';

const TOKEN = 'phc_abcdefghijklmnopqrstuvwxyz0123456789ABCD';
const base = {
  hostname: 'tradingspelledout.com',
  allowedHosts: ['tradingspelledout.com', 'www.tradingspelledout.com'],
  gaMeasurementId: 'G-HEMWFRWN96',
  posthogToken: TOKEN,
  posthogApiHost: '/ingest',
  posthogUiHost: 'https://eu.posthog.com',
};

describe('analytics config', () => {
  it('accepts well-formed IDs only', () => {
    expect(isGaMeasurementId('G-HEMWFRWN96')).toBe(true);
    for (const bad of [null, '', 'UA-12345-1', 'G-', 'g-hemwfrwn96', 'G-HEMWFRWN96"></script>']) expect(isGaMeasurementId(bad)).toBe(false);
    expect(isPosthogToken(TOKEN)).toBe(true);
    for (const bad of [null, '', 'phx_secretpersonalkey0123456789', 'phc_short']) expect(isPosthogToken(bad)).toBe(false);
  });

  it('only allows a same-site path or an https origin as the PostHog host', () => {
    expect(normalisePosthogHost('/ingest')).toBe('/ingest');
    expect(normalisePosthogHost('/ingest/')).toBe('/ingest');
    expect(normalisePosthogHost('https://eu.i.posthog.com/')).toBe('https://eu.i.posthog.com');
    for (const bad of ['//evil.example', 'http://eu.i.posthog.com', 'https://user:pw@eu.i.posthog.com', 'https://x.example/path', 'javascript:alert(1)', '', null]) {
      expect(normalisePosthogHost(bad)).toBeNull();
    }
  });

  it('runs only on the live hostnames', () => {
    expect(analyticsAllowedOnHost('tradingspelledout.com', base.allowedHosts)).toBe(true);
    expect(analyticsAllowedOnHost('WWW.TradingSpelledOut.com', base.allowedHosts)).toBe(true);
    expect(analyticsAllowedOnHost('localhost', base.allowedHosts)).toBe(false);
    expect(analyticsAllowedOnHost('trading-web-staging-699962388958.europe-west2.run.app', base.allowedHosts)).toBe(false);
    expect(analyticsAllowedOnHost('tradingspelledout.com.evil.example', base.allowedHosts)).toBe(false);
    expect(analyticsAllowedOnHost('', base.allowedHosts)).toBe(false);
  });

  it('resolves both tools on the live site', () => {
    expect(resolveAnalyticsConfig(base)).toEqual({
      ga: {measurementId: 'G-HEMWFRWN96'},
      posthog: {token: TOKEN, apiHost: '/ingest', uiHost: 'https://eu.posthog.com'},
    });
  });

  it('turns everything off elsewhere, and each tool off when its value is missing', () => {
    expect(resolveAnalyticsConfig({...base, hostname: 'localhost'})).toEqual({ga: null, posthog: null});
    expect(resolveAnalyticsConfig({...base, posthogToken: null}).posthog).toBeNull();
    expect(resolveAnalyticsConfig({...base, posthogToken: null}).ga).not.toBeNull();
    expect(resolveAnalyticsConfig({...base, gaMeasurementId: null}).ga).toBeNull();
    expect(resolveAnalyticsConfig({...base, posthogApiHost: 'http://insecure.example'}).posthog).toBeNull();
    expect(resolveAnalyticsConfig({...base, posthogUiHost: '/relative'}).posthog).toBeNull();
  });
});
