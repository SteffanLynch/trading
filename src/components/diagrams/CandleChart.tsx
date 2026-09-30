import {useId, type ReactNode} from 'react';
import type {Bar} from '../../utils/diagrams';
import {useElementWidth} from '../calculators/hooks/useElementWidth';
import styles from './diagrams.module.css';

export type DiagramTone = 'up' | 'down' | 'accent' | 'warn' | 'cyan' | 'muted';

const LINE: Record<DiagramTone, string> = {up: 'var(--pos)', down: 'var(--neg)', accent: 'var(--violet-t)', warn: 'var(--amber-t)', cyan: 'var(--cyan-t)', muted: 'var(--muted)'};
const FILL: Record<DiagramTone, string> = {up: 'var(--lime)', down: 'var(--coral)', accent: 'var(--violet)', warn: 'var(--amber)', cyan: 'var(--cyan)', muted: 'var(--surface-2)'};
const ON: Record<DiagramTone, string> = {up: '#0a0d14', down: '#0a0d14', accent: 'var(--on-violet)', warn: '#0a0d14', cyan: '#0a0d14', muted: 'var(--ink)'};

export type Annotation =
  | {type: 'label'; at: number; price: number; text: string; tone?: DiagramTone; dx?: number; dy?: number}
  | {type: 'dot'; at: number; price: number; tone?: DiagramTone}
  | {type: 'hline'; from: number; to: number; price: number; tone?: DiagramTone; dashed?: boolean}
  | {type: 'zone'; from: number; to: number; top: number; bottom: number; tone?: DiagramTone; label?: string}
  | {type: 'path'; points: [number, number][]; tone?: DiagramTone; dashed?: boolean; width?: number}
  | {type: 'arrow'; from: [number, number]; to: [number, number]; tone?: DiagramTone};

interface Props {
  bars: Bar[];
  annotations?: Annotation[];
  ariaLabel: string;
  /** A sentence under the chart saying what to notice. */
  caption?: ReactNode;
  height?: number;
  /** Widest a candle body may be, in pixels. */
  maxBody?: number;
}

const PAD = {top: 36, right: 30, bottom: 30, left: 30};

/** An annotated candlestick diagram. The prices are schematic: there is no price axis. */
export function CandleChart({bars, annotations = [], ariaLabel, caption, height = 300, maxBody = 13}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>(640);

  const prices = [
    ...bars.flatMap((bar) => [bar.h, bar.l]),
    ...annotations.flatMap((a) => {
      if (a.type === 'hline') return [a.price];
      if (a.type === 'zone') return [a.top, a.bottom];
      if (a.type === 'path') return a.points.map(([, price]) => price);
      if (a.type === 'arrow') return [a.from[1], a.to[1]];
      return [a.price];
    }),
  ];
  const hi = Math.max(...prices);
  const lo = Math.min(...prices);
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const step = plotW / bars.length;
  const body = Math.min(maxBody, step * 0.62);
  const x = (index: number) => PAD.left + (index + 0.5) * step;
  const y = (price: number) => PAD.top + ((hi - price) / (hi - lo || 1)) * plotH;
  const edge = (index: number) => PAD.left + index * step;

  const ofType = <T extends Annotation['type']>(type: T) => annotations.filter((a): a is Extract<Annotation, {type: T}> => a.type === type);

  return (
    <figure className={styles.figure}>
      <div className={styles.chart} ref={ref}>
        <svg width={width} height={height} role="img" aria-labelledby={`${id}-title`}>
          <title id={`${id}-title`}>{ariaLabel}</title>

          {ofType('zone').map((zone, index) => (
            <g key={`z${index}`}>
              <rect x={edge(zone.from)} y={y(zone.top)} width={edge(zone.to + 1) - edge(zone.from)} height={y(zone.bottom) - y(zone.top)} rx="6" fill={LINE[zone.tone ?? 'accent']} opacity="0.13" />
              {zone.label && (
                <text x={edge(zone.from) + 8} y={y(zone.top) + 15} fontSize="11" fontWeight="800" fill={LINE[zone.tone ?? 'accent']} fontFamily="'DM Mono', monospace" letterSpacing="0.06em">
                  {zone.label}
                </text>
              )}
            </g>
          ))}

          {ofType('hline').map((line, index) => (
            <line key={`h${index}`} x1={edge(line.from)} x2={edge(line.to + 1)} y1={y(line.price)} y2={y(line.price)} stroke={LINE[line.tone ?? 'warn']} strokeWidth="2" strokeDasharray={line.dashed === false ? undefined : '6 5'} />
          ))}

          {bars.map((bar, index) => {
            const up = bar.c >= bar.o;
            const color = up ? 'var(--pos)' : 'var(--neg)';
            const top = y(Math.max(bar.o, bar.c));
            const bottom = y(Math.min(bar.o, bar.c));
            return (
              <g key={index}>
                <line x1={x(index)} x2={x(index)} y1={y(bar.h)} y2={y(bar.l)} stroke={color} strokeWidth="1.8" strokeLinecap="round" />
                <rect x={x(index) - body / 2} y={top} width={body} height={Math.max(1.6, bottom - top)} rx="1.8" fill={color} />
              </g>
            );
          })}

          {ofType('path').map((path, index) => (
            <polyline key={`p${index}`} points={path.points.map(([at, price]) => `${x(at).toFixed(1)},${y(price).toFixed(1)}`).join(' ')} fill="none" stroke={LINE[path.tone ?? 'muted']} strokeWidth={path.width ?? 2} strokeDasharray={path.dashed === false ? undefined : '2 6'} strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          ))}

          {ofType('arrow').map((arrow, index) => {
            const [x1, y1] = [x(arrow.from[0]), y(arrow.from[1])];
            const [x2, y2] = [x(arrow.to[0]), y(arrow.to[1])];
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const head = 9;
            const color = LINE[arrow.tone ?? 'accent'];
            const p1 = [x2 - head * Math.cos(angle - 0.45), y2 - head * Math.sin(angle - 0.45)];
            const p2 = [x2 - head * Math.cos(angle + 0.45), y2 - head * Math.sin(angle + 0.45)];
            return (
              <g key={`a${index}`} stroke={color} strokeWidth="2" strokeLinecap="round">
                <line x1={x1} y1={y1} x2={x2} y2={y2} />
                <polyline points={`${p1[0]},${p1[1]} ${x2},${y2} ${p2[0]},${p2[1]}`} fill="none" />
              </g>
            );
          })}

          {ofType('dot').map((dot, index) => (
            <circle key={`d${index}`} cx={x(dot.at)} cy={y(dot.price)} r="5" fill={LINE[dot.tone ?? 'accent']} stroke="var(--surface)" strokeWidth="2" />
          ))}

          {ofType('label').map((label, index) => {
            const tone = label.tone ?? 'accent';
            const w = label.text.length * 6.6 + 18;
            const cx = x(label.at) + (label.dx ?? 0);
            const cy = y(label.price) + (label.dy ?? -16);
            return (
              <g key={`l${index}`} transform={`translate(${cx}, ${cy})`}>
                <rect x={-w / 2} y={-10} width={w} height={20} rx={10} fill={FILL[tone]} stroke={tone === 'muted' ? 'var(--line)' : 'none'} />
                <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill={ON[tone]} fontFamily="'DM Mono', monospace" letterSpacing="0.03em">
                  {label.text}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className={styles.caption}>
        {caption && <>{caption} </>}
        <span className={styles.tag}>Illustrative chart · not real market data</span>
      </figcaption>
    </figure>
  );
}
