import {useEffect, useMemo, useState} from 'react';
import {getTool} from '../../../data/tools';
import {formatDuration} from '../../../utils/calculators/format';
import {
  TIME_ZONE_OPTIONS,
  browserTimeZone,
  buildTimeline,
  formatClock,
  formatWeekday,
  isMarketOpen,
  minutesToClock,
  sessionStatuses,
} from '../../../utils/calculators/sessions';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {Callout, Note, ResultHero, SelectField, ToolCard} from '../ui';
import styles from '../ui/ui.module.css';
import {SessionTimeline} from './SessionTimeline';

const SPECS = defineSpecs({
  tz: {default: 'local', options: ['local', ...TIME_ZONE_OPTIONS.map((zone) => zone.value)] as readonly string[], pref: true},
});

const UPDATE_MS = 15_000;

const joinNames = (names: string[]) => (names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} + ${names[names.length - 1]}`);

export default function TradingSessionClock({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  // The live clock only exists in the browser. On the server (and the first client render) `now` is null,
  // so the prerendered HTML and the hydrated page always match.
  const [now, setNow] = useState<Date | null>(null);
  const [localZone, setLocalZone] = useState('UTC');

  useEffect(() => {
    setLocalZone(browserTimeZone());
    setNow(new Date());
    const tick = () => setNow(new Date());
    const timer = window.setInterval(tick, UPDATE_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const zone = values.tz === 'local' ? localZone : values.tz;
  const live = useMemo(() => {
    if (!now) return null;
    return {statuses: sessionStatuses(now), timeline: buildTimeline(now, zone), marketOpen: isMarketOpen(now)};
  }, [now, zone]);

  const inputs = (
    <SelectField
      label="Show times in"
      value={values.tz}
      onChange={(v) => set('tz', v)}
      options={[{value: 'local', label: `Your local time (${localZone.replace(/_/g, ' ')})`}, ...TIME_ZONE_OPTIONS.map((option) => ({value: option.value, label: `${option.label} (${option.value === 'UTC' ? 'UTC' : option.value.replace(/_/g, ' ')})`}))]}
      hint="Session hours follow each city's own clock, so daylight-saving changes are handled for you."
    />
  );

  let results;
  if (!now || !live) {
    results = (
      <div style={{minHeight: 420}}>
        <Note>Loading the live session clock…</Note>
      </div>
    );
  } else {
    const open = live.statuses.filter((status) => status.open);
    const openNames = open.map((status) => status.session.name);
    const overlapping = open.length >= 2;
    const nextOpen = live.statuses.filter((status) => !status.open).sort((a, b) => a.minutesToChange - b.minutesToChange)[0];
    const clock = formatClock(now, zone);

    results = (
      <>
        <ResultHero
          label={`${formatWeekday(now, zone)} · ${clock} · ${zone.replace(/_/g, ' ')}`}
          value={live.marketOpen ? (open.length ? joinNames(openNames) : 'Between sessions') : 'Market closed'}
          unit={live.marketOpen && open.length ? 'open now' : undefined}
          tone={live.marketOpen && open.length ? 'positive' : 'neutral'}
          live={false}
          sentence={
            !live.marketOpen ? (
              <>The forex market is closed for the weekend. It reopens on Sunday at 17:00 New York time{nextOpen ? <>, when {nextOpen.session.name} is next to open in about {formatDuration(nextOpen.minutesToChange)}</> : null}.</>
            ) : overlapping ? (
              <>
                <strong>{joinNames(openNames)} overlap.</strong> Overlaps are usually the busiest, most liquid parts of the day, though they can also be the most volatile.
              </>
            ) : open.length === 1 ? (
              <>Only {openNames[0]} is open. Liquidity is often thinner outside session overlaps.</>
            ) : nextOpen ? (
              <>No major session is open. {nextOpen.session.name} opens in {formatDuration(nextOpen.minutesToChange)}.</>
            ) : null
          }
        />
        <p className={styles.srOnly} aria-live="polite">
          {live.marketOpen ? `Open now: ${openNames.join(', ') || 'no major session'}` : 'The forex market is closed for the weekend'}
        </p>
        <SessionTimeline timeline={live.timeline} openIds={open.map((status) => status.session.id)} />
        <div className={styles.tableWrap}>
          <table className={styles.miniTable}>
            <caption className={styles.srOnly}>Status and hours of each forex session</caption>
            <thead>
              <tr>
                <th scope="col">Session</th>
                <th scope="col">Status</th>
                <th scope="col">Hours (your chosen zone)</th>
              </tr>
            </thead>
            <tbody>
              {live.statuses.map((status) => {
                const segments = live.timeline.sessions.find((entry) => entry.session.id === status.session.id)?.segments ?? [];
                const hours = segments.length ? segments.map((segment) => `${minutesToClock(segment.start)}–${minutesToClock(segment.end)}`).join(' & ') : '—';
                const state = !live.marketOpen ? 'Closed' : status.open ? `Open · closes in ${formatDuration(status.minutesToChange)}` : `Closed · opens in ${formatDuration(status.minutesToChange)}`;
                return (
                  <tr key={status.session.id} className={status.open && live.marketOpen ? styles.highlight : undefined}>
                    <td>{status.session.name}</td>
                    <td>{state}</td>
                    <td>{hours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {embedded ? null : <Callout tone="info">Sessions are conventions, not exchanges: each is treated as open roughly 08:00–17:00 in its home city (09:00–18:00 in Tokyo). The retail forex market itself trades continuously from Sunday 17:00 to Friday 17:00 New York time.</Callout>}
      </>
    );
  }

  return <ToolCard title={getTool('trading-session-clock').name} name="session_clock" embedded={embedded} href={getTool('trading-session-clock').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} stacked />;
}
