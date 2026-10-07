import {describe, expect, it} from 'vitest';
import {ACCEPT_ALL, CONSENT_MAX_AGE_DAYS, CONSENT_VERSION, REJECT_ALL, allows, createRecord, parseConsent, serialiseConsent} from './consent';

const NOW = new Date('2026-10-07T12:00:00Z');

describe('consent', () => {
  it('starts with everything off', () => {
    expect(REJECT_ALL).toEqual({preferences: false, analytics: false, advertising: false});
    expect(allows(null, 'analytics')).toBe(false);
    expect(allows(null, 'advertising')).toBe(false);
    expect(allows(null, 'preferences')).toBe(false);
  });

  it('round-trips a saved choice', () => {
    const record = createRecord({preferences: true, analytics: false, advertising: true}, NOW);
    expect(parseConsent(serialiseConsent(record), NOW)).toEqual(record);
    expect(allows(record, 'preferences')).toBe(true);
    expect(allows(record, 'analytics')).toBe(false);
    expect(allows(record, 'advertising')).toBe(true);
  });

  it('accept all and reject all set every category together', () => {
    expect(createRecord(ACCEPT_ALL, NOW)).toMatchObject({preferences: true, analytics: true, advertising: true});
    expect(createRecord(REJECT_ALL, NOW)).toMatchObject({preferences: false, analytics: false, advertising: false});
  });

  it('asks again when nothing is stored or the value is malformed', () => {
    expect(parseConsent(null, NOW)).toBeNull();
    expect(parseConsent('', NOW)).toBeNull();
    expect(parseConsent('not json', NOW)).toBeNull();
    expect(parseConsent('[]', NOW)).toBeNull();
    expect(parseConsent('{"version":1}', NOW)).toBeNull();
    expect(parseConsent(JSON.stringify({version: CONSENT_VERSION, preferences: 'yes', analytics: true, advertising: true, savedAt: NOW.toISOString()}), NOW)).toBeNull();
    expect(parseConsent(JSON.stringify({version: CONSENT_VERSION, preferences: true, analytics: true, advertising: true, savedAt: 'yesterday'}), NOW)).toBeNull();
  });

  it('asks again after the categories change', () => {
    const old = {...createRecord(ACCEPT_ALL, NOW), version: CONSENT_VERSION - 1};
    expect(parseConsent(JSON.stringify(old), NOW)).toBeNull();
  });

  it('asks again after a year, but not before', () => {
    const record = createRecord(ACCEPT_ALL, NOW);
    const justInside = new Date(NOW.getTime() + (CONSENT_MAX_AGE_DAYS - 1) * 86_400_000);
    const justOutside = new Date(NOW.getTime() + (CONSENT_MAX_AGE_DAYS + 1) * 86_400_000);
    expect(parseConsent(serialiseConsent(record), justInside)).not.toBeNull();
    expect(parseConsent(serialiseConsent(record), justOutside)).toBeNull();
  });

  it('does not trust a choice dated in the future', () => {
    const future = createRecord(ACCEPT_ALL, new Date(NOW.getTime() + 5 * 86_400_000));
    expect(parseConsent(serialiseConsent(future), NOW)).toBeNull();
  });
});
