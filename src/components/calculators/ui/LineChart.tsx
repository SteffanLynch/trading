import {useId} from 'react';
import {niceTicks} from '../../../utils/calculators/chart';
import {useElementWidth} from '../hooks/useElementWidth';
import styles from './ui.module.css';

export interface Series {
  name: string;
  points: [number, number][];
  color: string;
  dashed?: boolean;
  /** Fill the area under the line. */
  area?: boolean;
}

interface Marker {
  x: number;
  y: number;
  label: string;
}

interface LineChartProps {
  series: Series[];
  ariaLabel: string;
  xLabel: string;
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  marker?: Marker;
  height?: number;
  /** Force the y axis to include zero (default true). */
  includeZero?: boolean;
}

const MARGIN = {top: 14, right: 16, bottom: 34, left: 58};

/** Small, dependency-free line chart drawn at the container's true pixel width. */
export function LineChart({series, ariaLabel, xLabel, formatX = String, formatY = String, marker, height = 260, includeZero = true}: LineChartProps) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();

  const all = series.flatMap((entry) => entry.points);
  const xs = all.map(([x]) => x);
  const ys = all.map(([, y]) => y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (includeZero) yMin = Math.min(0, yMin);
  if (yMax === yMin) yMax = yMin + 1;

  const yTicks = niceTicks(yMin, yMax, 4);
  const yTop = Math.max(yMax, yTicks[yTicks.length - 1] ?? yMax);
  const xTicks = niceTicks(xMin, xMax, Math.max(2, Math.min(6, Math.floor(width / 90))));

  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;
  const px = (x: number) => MARGIN.left + (xMax === xMin ? 0 : ((x - xMin) / (xMax - xMin)) * plotWidth);
  const py = (y: number) => MARGIN.top + plotHeight - ((y - yMin) / (yTop - yMin)) * plotHeight;

  const path = (points: [number, number][]) => points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(' ');
  const areaPath = (points: [number, number][]) => `${path(points)} L${px(points[points.length - 1][0]).toFixed(1)},${py(yMin).toFixed(1)} L${px(points[0][0]).toFixed(1)},${py(yMin).toFixed(1)} Z`;

  return (
    <div className={styles.chart} ref={ref}>
      <svg width={width} height={height} role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{ariaLabel}</title>
        {yTicks.map((tick) => (
          <g key={`y${tick}`}>
            <line x1={MARGIN.left} x2={width - MARGIN.right} y1={py(tick)} y2={py(tick)} stroke="var(--line)" />
            <text x={MARGIN.left - 8} y={py(tick)} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="var(--muted)">
              {formatY(tick)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={`x${tick}`} x={px(tick)} y={height - 14} textAnchor="middle" fontSize="10.5" fill="var(--muted)">
            {formatX(tick)}
          </text>
        ))}
        <text x={MARGIN.left + plotWidth / 2} y={height - 1} textAnchor="middle" fontSize="10" fill="var(--muted)">
          {xLabel}
        </text>
        {series.map((entry) => (
          <g key={entry.name}>
            {entry.area && entry.points.length > 1 && <path d={areaPath(entry.points)} fill={entry.color} opacity="0.12" />}
            <path d={path(entry.points)} fill="none" stroke={entry.color} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={entry.dashed ? '5 4' : undefined} />
          </g>
        ))}
        {marker && (
          <g>
            <line x1={px(marker.x)} x2={px(marker.x)} y1={py(marker.y)} y2={py(yMin)} stroke="var(--accent)" strokeDasharray="3 3" />
            <circle cx={px(marker.x)} cy={py(marker.y)} r="5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
            <text
              x={Math.min(Math.max(px(marker.x), MARGIN.left + 40), width - MARGIN.right - 40)}
              y={Math.max(py(marker.y) - 12, 10)}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill="var(--ink)">
              {marker.label}
            </text>
          </g>
        )}
      </svg>
      {series.length > 1 && (
        <ul className={styles.chartLegend}>
          {series.map((entry) => (
            <li key={entry.name}>
              <i style={{background: entry.color}} />
              {entry.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
