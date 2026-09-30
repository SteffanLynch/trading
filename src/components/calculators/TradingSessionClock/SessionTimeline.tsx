import {useId} from 'react';
import {minutesToClock, type Timeline} from '../../../utils/calculators/sessions';
import {useElementWidth} from '../hooks/useElementWidth';

const COLORS: Record<string, string> = {
  sydney: 'var(--accent-c)',
  tokyo: 'var(--warn)',
  london: 'var(--accent-b)',
  newyork: 'var(--accent)',
};

const ROW_H = 30;
const TOP = 26;
const LABEL_W = 78;
const RIGHT = 10;

interface Props {
  timeline: Timeline;
  openIds: string[];
}

/** A 24-hour bar chart of when each session is open, with "now" marked and overlaps shaded. */
export function SessionTimeline({timeline, openIds}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();
  const rows = timeline.sessions.length;
  const height = TOP + rows * ROW_H + 8;
  const plotWidth = Math.max(60, width - LABEL_W - RIGHT);
  const x = (minute: number) => LABEL_W + (minute / timeline.dayMinutes) * plotWidth;
  const hourStep = width < 420 ? 6 : 3;
  const ticks: number[] = [];
  for (let hour = 0; hour <= 24; hour += hourStep) ticks.push(hour * 60);

  const summary = timeline.sessions
    .map(({session, segments}) => `${session.name}: ${segments.length ? segments.map((s) => `${minutesToClock(s.start)} to ${minutesToClock(s.end)}`).join(' and ') : 'closed all day'}`)
    .join('. ');

  return (
    <div ref={ref} style={{width: '100%'}}>
      <svg width={width} height={height} role="img" aria-labelledby={`${id}-title`} style={{display: 'block', overflow: 'visible'}}>
        <title id={`${id}-title`}>{`Sessions across today in your chosen time zone. ${summary}`}</title>

        {timeline.overlaps.map((overlap) => (
          <rect key={`${overlap.start}-${overlap.ids.join('')}`} x={x(overlap.start)} y={TOP - 4} width={x(overlap.end) - x(overlap.start)} height={rows * ROW_H + 4} fill="var(--accent)" opacity="0.1" />
        ))}

        {ticks.map((minute) => (
          <g key={minute}>
            <line x1={x(minute)} x2={x(minute)} y1={TOP - 4} y2={TOP + rows * ROW_H} stroke="var(--line)" />
            <text x={x(minute)} y={14} textAnchor="middle" fontSize="10.5" fill="var(--muted)">
              {minutesToClock(minute)}
            </text>
          </g>
        ))}

        {timeline.sessions.map(({session, segments}, index) => {
          const y = TOP + index * ROW_H;
          const open = openIds.includes(session.id);
          return (
            <g key={session.id}>
              <text x={0} y={y + ROW_H / 2 + 1} dominantBaseline="middle" fontSize="12" fontWeight={open ? 700 : 500} fill={open ? 'var(--ink)' : 'var(--muted)'}>
                {session.name}
              </text>
              <rect x={LABEL_W} y={y + 5} width={plotWidth} height={ROW_H - 12} rx="5" fill="var(--line)" opacity="0.5" />
              {segments.map((segment) => (
                <rect key={segment.start} x={x(segment.start)} y={y + 5} width={Math.max(2, x(segment.end) - x(segment.start))} height={ROW_H - 12} rx="5" fill={COLORS[session.id]} opacity={open ? 1 : 0.7} />
              ))}
            </g>
          );
        })}

        <line x1={x(timeline.nowMinute)} x2={x(timeline.nowMinute)} y1={TOP - 8} y2={TOP + rows * ROW_H + 2} stroke="var(--ink)" strokeWidth="2" />
        <circle cx={x(timeline.nowMinute)} cy={TOP - 8} r="4" fill="var(--ink)" />
      </svg>
    </div>
  );
}
