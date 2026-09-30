import {useId} from 'react';
import type {AverageEntryValue} from '../../../utils/calculators/averageEntry';
import {formatNumber} from '../../../utils/calculators/format';
import {useElementWidth} from '../hooks/useElementWidth';
import styles from '../ui/ui.module.css';

interface Props {
  value: AverageEntryValue;
  symbol: string;
}

/** Each entry is a circle at its price, sized by quantity. The average is pulled towards the biggest circles. */
export function EntryDots({value, symbol}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();
  const height = 170;
  const lo = Math.min(value.lowestPrice, value.averagePrice);
  const hi = Math.max(value.highestPrice, value.averagePrice);
  const span = hi - lo || Math.abs(hi) * 0.1 || 1;
  const padX = 52;
  const x = (price: number) => padX + ((price - lo + span * 0.1) / (span * 1.2)) * (width - padX * 2);
  const maxQty = Math.max(...value.entries.map((entry) => entry.quantity));
  const radius = (quantity: number) => 7 + Math.sqrt(quantity / maxQty) * 20;
  const axisY = 118;

  return (
    <div className={styles.chart} ref={ref}>
      <svg width={width} height={height} role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{`Entries drawn at their prices, sized by quantity. The weighted average entry is ${symbol}${formatNumber(value.averagePrice, 4)}.`}</title>
        <line x1={padX - 20} x2={width - padX + 20} y1={axisY} y2={axisY} stroke="var(--line)" strokeWidth="2" />
        {value.entries.map((entry, index) => (
          <g key={index}>
            <circle cx={x(entry.price)} cy={axisY - radius(entry.quantity) - 2} r={radius(entry.quantity)} fill="var(--accent)" opacity="0.28" stroke="var(--accent)" strokeWidth="2" />
            <text x={x(entry.price)} y={axisY - radius(entry.quantity) + 2} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--ink)">
              {formatNumber(entry.quantity, 2)}
            </text>
            <text x={x(entry.price)} y={axisY + 18} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="'DM Mono', monospace">
              {symbol}{formatNumber(entry.price, 4)}
            </text>
          </g>
        ))}
        <line x1={x(value.simpleAverage)} x2={x(value.simpleAverage)} y1={20} y2={axisY} stroke="var(--muted)" strokeDasharray="3 4" />
        <text x={x(value.simpleAverage)} y={12} textAnchor="middle" fontSize="10" fill="var(--muted)">
          simple mean
        </text>
        <line x1={x(value.averagePrice)} x2={x(value.averagePrice)} y1={28} y2={axisY + 4} stroke="var(--pos)" strokeWidth="3" />
        <rect x={x(value.averagePrice) - 52} y={axisY + 26} width="104" height="24" rx="12" fill="var(--pos)" />
        <text x={x(value.averagePrice)} y={axisY + 42} textAnchor="middle" fontSize="12" fontWeight="800" fill="#0a0d14">
          avg {symbol}{formatNumber(value.averagePrice, 4)}
        </text>
      </svg>
    </div>
  );
}
