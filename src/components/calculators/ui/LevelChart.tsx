import {useId} from 'react';
import {useElementWidth} from '../hooks/useElementWidth';
import styles from './ui.module.css';

export type LevelTone = 'pos' | 'neg' | 'accent' | 'muted' | 'warn';

export interface ChartLevel {
  price: number;
  /** Short label on the left, e.g. "61.8%" or "R1". */
  label: string;
  /** Optional second line under the label. */
  hint?: string;
  tone: LevelTone;
  dashed?: boolean;
}

interface Zone {
  from: number;
  to: number;
  tone: LevelTone;
}

interface Props {
  levels: ChartLevel[];
  ariaLabel: string;
  formatPrice: (price: number) => string;
  zones?: Zone[];
  /** Draws the price move the levels were measured from (a swing), as a line from `from` to `to`. */
  swing?: {from: number; to: number};
  /** A price to mark with a dot and label, e.g. the previous close. */
  marker?: {price: number; label: string};
  height?: number;
}

const COLORS: Record<LevelTone, string> = {pos: 'var(--pos)', neg: 'var(--neg)', accent: 'var(--accent)', muted: 'var(--muted)', warn: 'var(--warn)'};
const PAD_TOP = 18;
const PAD_BOTTOM = 18;

/** Horizontal price levels on a vertical axis: used for Fibonacci levels and pivot points. */
export function LevelChart({levels, ariaLabel, formatPrice, zones = [], swing, marker, height = 340}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();
  const prices = [...levels.map((level) => level.price), ...(swing ? [swing.from, swing.to] : []), ...(marker ? [marker.price] : [])];
  const hi = Math.max(...prices);
  const lo = Math.min(...prices);
  const span = hi - lo || 1;
  const plotHeight = height - PAD_TOP - PAD_BOTTOM;
  const y = (price: number) => PAD_TOP + ((hi - price) / span) * plotHeight;

  const labelW = 64;
  const priceW = 92;
  const plotLeft = labelW;
  const plotRight = width - priceW;
  const swingX1 = plotLeft + (plotRight - plotLeft) * 0.14;
  const swingX2 = plotLeft + (plotRight - plotLeft) * 0.3;

  // Keep neighbouring labels from colliding: nudge each one down if it would overlap the one above.
  const ordered = [...levels].sort((a, b) => b.price - a.price);
  const labelY: Record<number, number> = {};
  let last = -Infinity;
  ordered.forEach((level, index) => {
    const wanted = y(level.price);
    const placed = Math.max(wanted, last + 15);
    labelY[index] = placed;
    last = placed;
  });

  return (
    <div className={styles.chart} ref={ref}>
      <svg width={width} height={height + 10} role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{ariaLabel}</title>
        {zones.map((zone) => (
          <rect key={`${zone.from}-${zone.to}`} x={plotLeft} y={y(Math.max(zone.from, zone.to))} width={plotRight - plotLeft} height={Math.abs(y(zone.from) - y(zone.to))} fill={COLORS[zone.tone]} opacity="0.1" />
        ))}
        {swing && <line x1={swingX1} y1={y(swing.from)} x2={swingX2} y2={y(swing.to)} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" opacity="0.75" />}
        {ordered.map((level, index) => (
          <g key={`${level.label}-${level.price}`}>
            <line x1={plotLeft} x2={plotRight} y1={y(level.price)} y2={y(level.price)} stroke={COLORS[level.tone]} strokeWidth={level.dashed ? 1.5 : 2.25} strokeDasharray={level.dashed ? '5 5' : undefined} />
            <text x={plotLeft - 8} y={labelY[index]} textAnchor="end" dominantBaseline="middle" fontSize="12" fontWeight="800" fill={COLORS[level.tone]} fontFamily="'DM Mono', monospace">
              {level.label}
            </text>
            <text x={plotRight + 8} y={labelY[index]} dominantBaseline="middle" fontSize="12" fontWeight="600" fill="var(--ink)" fontFamily="'DM Mono', monospace">
              {formatPrice(level.price)}
            </text>
            {level.hint && (
              <text x={plotRight - 6} y={y(level.price) - 7} textAnchor="end" fontSize="10.5" fill="var(--muted)">
                {level.hint}
              </text>
            )}
          </g>
        ))}
        {marker && (
          <g>
            <circle cx={swingX2 + 18} cy={y(marker.price)} r="5" fill="var(--ink)" />
            <text x={swingX2 + 28} y={y(marker.price) + 4} fontSize="11" fontWeight="700" fill="var(--ink)">
              {marker.label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
