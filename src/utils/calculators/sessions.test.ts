import {describe, expect, it} from 'vitest';
import {
  SESSIONS,
  buildTimeline,
  isMarketOpen,
  isSessionOpen,
  minutesToClock,
  openSessionIds,
  sessionStatuses,
  sessionUtcHours,
  startOfDay,
} from './sessions';

const session = (id: string) => SESSIONS.find((entry) => entry.id === id)!;
const at = (iso: string) => new Date(iso);

describe('sessions', () => {
  it('reports the open sessions in winter (London GMT, New York EST)', () => {
    // Wed 14 Jan 2026 14:00 UTC = 14:00 London, 09:00 New York, 23:00 Tokyo, 01:00 Sydney
    expect(openSessionIds(at('2026-01-14T14:00:00Z'))).toEqual(['london', 'newyork']);
  });

  it('follows daylight saving in summer (London BST, New York EDT)', () => {
    // Wed 15 Jul 2026 07:30 UTC = 08:30 London, 03:30 New York, 16:30 Tokyo, 17:30 Sydney
    expect(openSessionIds(at('2026-07-15T07:30:00Z'))).toEqual(['tokyo', 'london']);
  });

  it('handles the weeks when the US has changed clocks but the UK has not', () => {
    // US DST began 8 Mar 2026; UK DST begins 29 Mar. New York therefore opens at 12:00 UTC, not 13:00.
    expect(isSessionOpen(session('newyork'), at('2026-03-10T11:59:00Z'))).toBe(false);
    expect(isSessionOpen(session('newyork'), at('2026-03-10T12:00:00Z'))).toBe(true);
    // In January the same session opens at 13:00 UTC
    expect(isSessionOpen(session('newyork'), at('2026-01-14T12:00:00Z'))).toBe(false);
    expect(isSessionOpen(session('newyork'), at('2026-01-14T13:00:00Z'))).toBe(true);
    // London still opens at 08:00 UTC that March week
    expect(isSessionOpen(session('london'), at('2026-03-10T08:00:00Z'))).toBe(true);
    expect(isSessionOpen(session('london'), at('2026-03-10T07:59:00Z'))).toBe(false);
  });

  it('closes for the weekend from Friday 17:00 to Sunday 17:00 New York time', () => {
    expect(isMarketOpen(at('2026-01-16T21:59:00Z'))).toBe(true); // Fri 16:59 EST
    expect(isMarketOpen(at('2026-01-16T22:00:00Z'))).toBe(false); // Fri 17:00 EST
    expect(isMarketOpen(at('2026-01-17T12:00:00Z'))).toBe(false); // Saturday
    expect(isMarketOpen(at('2026-01-18T21:59:00Z'))).toBe(false); // Sun 16:59 EST
    expect(isMarketOpen(at('2026-01-18T22:00:00Z'))).toBe(true); // Sun 17:00 EST
    expect(openSessionIds(at('2026-01-17T12:00:00Z'))).toEqual([]);
  });

  it('counts down to the next open or close', () => {
    const statuses = sessionStatuses(at('2026-01-14T14:00:00Z'));
    const london = statuses.find((entry) => entry.session.id === 'london')!;
    const newyork = statuses.find((entry) => entry.session.id === 'newyork')!;
    const tokyo = statuses.find((entry) => entry.session.id === 'tokyo')!;
    expect(london.open).toBe(true);
    expect(london.minutesToChange).toBe(180); // closes 17:00 UTC
    expect(newyork.minutesToChange).toBe(480); // closes 22:00 UTC
    expect(tokyo.open).toBe(false);
    expect(tokyo.minutesToChange).toBe(600); // Tokyo opens 00:00 UTC the next day
  });

  it('counts down across the weekend', () => {
    // Saturday noon UTC: the next thing to open is Sydney, Sunday 22:00 UTC (17:00 New York)
    const sydney = sessionStatuses(at('2026-01-17T12:00:00Z')).find((entry) => entry.session.id === 'sydney')!;
    expect(sydney.open).toBe(false);
    expect(sydney.minutesToChange).toBe(34 * 60);
  });

  it('gives each session its UTC hours in winter and summer', () => {
    expect(sessionUtcHours(session('london'), '2026-01-15')).toEqual({open: '08:00', close: '17:00'});
    expect(sessionUtcHours(session('london'), '2026-07-15')).toEqual({open: '07:00', close: '16:00'});
    expect(sessionUtcHours(session('newyork'), '2026-01-15')).toEqual({open: '13:00', close: '22:00'});
    expect(sessionUtcHours(session('newyork'), '2026-07-15')).toEqual({open: '12:00', close: '21:00'});
    expect(sessionUtcHours(session('tokyo'), '2026-07-15')).toEqual({open: '00:00', close: '09:00'});
  });
});

describe('startOfDay and timeline', () => {
  it('finds local midnight, including on a daylight-saving day', () => {
    expect(startOfDay(at('2026-01-14T14:37:12Z'), 'UTC').toISOString()).toBe('2026-01-14T00:00:00.000Z');
    expect(startOfDay(at('2026-01-14T14:37:12Z'), 'America/New_York').toISOString()).toBe('2026-01-14T05:00:00.000Z');
    // 8 Mar 2026 (US spring-forward): midnight is still 05:00 UTC, even though the clocks jump at 02:00
    expect(startOfDay(at('2026-03-08T18:00:00Z'), 'America/New_York').toISOString()).toBe('2026-03-08T05:00:00.000Z');
  });

  it('lays out the day in the viewer’s time zone', () => {
    const timeline = buildTimeline(at('2026-01-14T12:00:00Z'), 'UTC');
    const segments = (id: string) => timeline.sessions.find((entry) => entry.session.id === id)!.segments;
    expect(timeline.dayMinutes).toBe(1440);
    expect(timeline.nowMinute).toBe(720);
    expect(segments('london')).toEqual([{start: 480, end: 1020}]);
    expect(segments('newyork')).toEqual([{start: 780, end: 1320}]);
    expect(segments('tokyo')).toEqual([{start: 0, end: 540}]);
    // Sydney (AEDT, UTC+11) is open 21:00-06:00 UTC, so it wraps around midnight
    expect(segments('sydney')).toEqual([
      {start: 0, end: 360},
      {start: 1260, end: 1440},
    ]);
    expect(timeline.overlaps).toContainEqual({start: 780, end: 1020, ids: ['london', 'newyork']});
  });

  it('shows the same moments shifted in another time zone', () => {
    // In New York (UTC-5) the London/New York overlap is 08:00-12:00 local
    const timeline = buildTimeline(at('2026-01-14T15:00:00Z'), 'America/New_York');
    expect(timeline.overlaps).toContainEqual({start: 480, end: 720, ids: ['london', 'newyork']});
  });

  it('has a 23-hour day when the clocks go forward', () => {
    const timeline = buildTimeline(at('2026-03-08T18:00:00Z'), 'America/New_York');
    expect(timeline.dayMinutes).toBe(1380);
  });

  it('formats minutes as a clock', () => {
    expect(minutesToClock(0)).toBe('00:00');
    expect(minutesToClock(1020)).toBe('17:00');
    expect(minutesToClock(1440)).toBe('00:00');
  });
});
