/**
 * Forex trading sessions.
 *
 * Sessions are defined by local business hours in each financial centre, then converted with the
 * IANA time-zone database via `Intl`. That means daylight-saving changes (which happen on different
 * dates in the US, Europe and Australia) are handled correctly without hard-coded UTC offsets.
 *
 * Every session boundary falls on a whole UTC hour, which lets the "next change" search step hourly.
 */

export interface SessionDef {
  id: 'sydney' | 'tokyo' | 'london' | 'newyork';
  name: string;
  city: string;
  timeZone: string;
  /** Local opening hour (0-23). */
  open: number;
  /** Local closing hour (1-24). */
  close: number;
}

export const SESSIONS: SessionDef[] = [
  {id: 'sydney', name: 'Sydney', city: 'Sydney', timeZone: 'Australia/Sydney', open: 8, close: 17},
  {id: 'tokyo', name: 'Tokyo', city: 'Tokyo', timeZone: 'Asia/Tokyo', open: 9, close: 18},
  {id: 'london', name: 'London', city: 'London', timeZone: 'Europe/London', open: 8, close: 17},
  {id: 'newyork', name: 'New York', city: 'New York', timeZone: 'America/New_York', open: 8, close: 17},
];

const MARKET_ZONE = 'America/New_York';
const HOUR = 3_600_000;
const MINUTE = 60_000;
const SAMPLE_MINUTES = 15;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let cached = formatters.get(timeZone);
  if (!cached) {
    cached = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    });
    formatters.set(timeZone, cached);
  }
  return cached;
}

export interface LocalClock {
  year: number;
  month: number;
  day: number;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  hour: number;
  minute: number;
  second: number;
  minutesIntoDay: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The wall-clock date and time an instant has in `timeZone`. */
export function localClock(date: Date, timeZone: string): LocalClock {
  const parts = formatter(timeZone).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
  const hour = Number(read('hour')) % 24;
  const minute = Number(read('minute'));
  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    weekday: WEEKDAYS.indexOf(read('weekday')),
    hour,
    minute,
    second: Number(read('second')),
    minutesIntoDay: hour * 60 + minute,
  };
}

/** Milliseconds `timeZone` is ahead of UTC at a given instant (negative when behind). */
function zoneOffset(instant: number, timeZone: string): number {
  const c = localClock(new Date(instant), timeZone);
  const wallClockAsUtc = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second);
  return wallClockAsUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * The retail forex market trades continuously from Sunday 17:00 to Friday 17:00 New York time.
 * Outside that window every session is treated as closed.
 */
export function isMarketOpen(date: Date): boolean {
  const {weekday, minutesIntoDay} = localClock(date, MARKET_ZONE);
  const closeAt = 17 * 60;
  if (weekday === 6) return false;
  if (weekday === 5) return minutesIntoDay < closeAt;
  if (weekday === 0) return minutesIntoDay >= closeAt;
  return true;
}

export function isSessionOpen(session: SessionDef, date: Date): boolean {
  if (!isMarketOpen(date)) return false;
  const {minutesIntoDay} = localClock(date, session.timeZone);
  return minutesIntoDay >= session.open * 60 && minutesIntoDay < session.close * 60;
}

export interface SessionStatus {
  session: SessionDef;
  open: boolean;
  /** Minutes until this session next opens (if closed) or closes (if open). */
  minutesToChange: number;
}

/** Minutes until the open/closed state of a session next flips. */
function minutesUntilChange(session: SessionDef, date: Date): number {
  const current = isSessionOpen(session, date);
  const nextHour = Math.ceil(date.getTime() / HOUR) * HOUR;
  // Search up to nine days ahead (covers a weekend plus the following session).
  for (let step = 0; step < 24 * 9; step += 1) {
    const probe = new Date(nextHour + step * HOUR);
    if (isSessionOpen(session, probe) !== current) return Math.max(1, Math.round((probe.getTime() - date.getTime()) / MINUTE));
  }
  return 0;
}

export function sessionStatuses(date: Date): SessionStatus[] {
  return SESSIONS.map((session) => ({
    session,
    open: isSessionOpen(session, date),
    minutesToChange: minutesUntilChange(session, date),
  }));
}

/** Names of the sessions currently open, in session order. */
export function openSessionIds(date: Date): SessionDef['id'][] {
  return SESSIONS.filter((session) => isSessionOpen(session, date)).map((session) => session.id);
}

/** Start of the calendar day containing `date` in `timeZone`, as an instant. */
export function startOfDay(date: Date, timeZone: string): Date {
  const {year, month, day} = localClock(date, timeZone);
  // Midnight of that calendar date if it were UTC, then shift by the zone's offset. The offset is
  // re-read at the result because it can differ from the one at the guess on a daylight-saving day.
  const utcMidnight = Date.UTC(year, month - 1, day);
  let result = utcMidnight - zoneOffset(utcMidnight, timeZone);
  const corrected = utcMidnight - zoneOffset(result, timeZone);
  if (corrected !== result) result = corrected;
  return new Date(result);
}

export interface Segment {
  /** Minutes from the start of the displayed day. */
  start: number;
  end: number;
}

export interface OverlapSegment extends Segment {
  ids: SessionDef['id'][];
}

export interface Timeline {
  sessions: {session: SessionDef; segments: Segment[]}[];
  overlaps: OverlapSegment[];
  /** Minutes from the start of the displayed day to now. */
  nowMinute: number;
  /** Length of the displayed day in minutes (1380/1440/1500 around daylight-saving changes). */
  dayMinutes: number;
}

/** The 24 hours of the day containing `now` in `timeZone`, with when each session is open. */
export function buildTimeline(now: Date, timeZone: string): Timeline {
  const dayStart = startOfDay(now, timeZone);
  const nextDayStart = startOfDay(new Date(dayStart.getTime() + 36 * HOUR), timeZone);
  const dayMinutes = Math.round((nextDayStart.getTime() - dayStart.getTime()) / MINUTE);
  const samples = Math.ceil(dayMinutes / SAMPLE_MINUTES);

  const perSession = SESSIONS.map((session) => ({session, segments: [] as Segment[], openSince: null as number | null}));
  const overlaps: OverlapSegment[] = [];
  let overlapStart: number | null = null;
  let overlapIds: SessionDef['id'][] = [];

  const closeOverlap = (end: number) => {
    if (overlapStart !== null && overlapIds.length >= 2) overlaps.push({start: overlapStart, end, ids: overlapIds});
    overlapStart = null;
    overlapIds = [];
  };

  for (let index = 0; index <= samples; index += 1) {
    const minute = Math.min(index * SAMPLE_MINUTES, dayMinutes);
    const at = new Date(dayStart.getTime() + minute * MINUTE);
    const openIds: SessionDef['id'][] = [];

    for (const entry of perSession) {
      const open = index < samples && isSessionOpen(entry.session, at);
      if (open) openIds.push(entry.session.id);
      if (open && entry.openSince === null) entry.openSince = minute;
      if (!open && entry.openSince !== null) {
        entry.segments.push({start: entry.openSince, end: minute});
        entry.openSince = null;
      }
    }

    const signature = openIds.join('+');
    if (openIds.length < 2 || signature !== overlapIds.join('+')) {
      closeOverlap(minute);
      if (openIds.length >= 2) {
        overlapStart = minute;
        overlapIds = openIds;
      }
    }
  }
  closeOverlap(dayMinutes);

  return {
    sessions: perSession.map(({session, segments}) => ({session, segments})),
    overlaps,
    nowMinute: Math.min(dayMinutes, Math.max(0, (now.getTime() - dayStart.getTime()) / MINUTE)),
    dayMinutes,
  };
}

/** "08:00" style time of an instant in a zone. */
export function formatClock(date: Date, timeZone: string, withSeconds = false): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hourCycle: 'h23',
  }).format(date);
}

/** "Mon" style weekday of an instant in a zone. */
export function formatWeekday(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {timeZone, weekday: 'long'}).format(date);
}

/** Minute of the day (in `timeZone`) that an instant falls on, as "HH:MM". */
export function minutesToClock(minutes: number): string {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** A session's opening/closing hours in UTC on a given date (used for the static reference table). */
export function sessionUtcHours(session: SessionDef, isoDate: string): {open: string; close: string} {
  const base = new Date(`${isoDate}T00:00:00Z`).getTime();
  let open = '';
  let close = '';
  for (let hour = 0; hour < 24; hour += 1) {
    const at = new Date(base + hour * HOUR);
    const {hour: localHour} = localClock(at, session.timeZone);
    if (localHour === session.open % 24) open = `${String(hour).padStart(2, '0')}:00`;
    if (localHour === session.close % 24) close = `${String(hour).padStart(2, '0')}:00`;
  }
  return {open, close};
}

/** Common time zones offered in the picker, alongside the visitor's own. */
export const TIME_ZONE_OPTIONS: {value: string; label: string}[] = [
  {value: 'UTC', label: 'UTC'},
  {value: 'Europe/London', label: 'London'},
  {value: 'Europe/Paris', label: 'Paris / Berlin'},
  {value: 'Europe/Athens', label: 'Athens / Helsinki'},
  {value: 'Europe/Moscow', label: 'Moscow'},
  {value: 'Asia/Dubai', label: 'Dubai'},
  {value: 'Asia/Kolkata', label: 'India'},
  {value: 'Asia/Singapore', label: 'Singapore / Hong Kong'},
  {value: 'Asia/Tokyo', label: 'Tokyo'},
  {value: 'Australia/Sydney', label: 'Sydney'},
  {value: 'Pacific/Auckland', label: 'Auckland'},
  {value: 'America/Sao_Paulo', label: 'São Paulo'},
  {value: 'America/New_York', label: 'New York'},
  {value: 'America/Chicago', label: 'Chicago'},
  {value: 'America/Denver', label: 'Denver'},
  {value: 'America/Los_Angeles', label: 'Los Angeles'},
];

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', {timeZone});
    return true;
  } catch {
    return false;
  }
}
