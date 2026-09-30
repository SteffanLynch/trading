import {useId, useRef, type KeyboardEvent} from 'react';
import type {Candle} from '../../../utils/calculators/candles';
import {formatPrice} from '../../../utils/calculators/format';
import {useElementWidth} from '../hooks/useElementWidth';
import {useVerticalDrag} from '../hooks/useVerticalDrag';

export const AXIS_HI = 1.117;
export const AXIS_LO = 1.093;
const PIP = 0.0001;
const HEIGHT = 380;
const PAD = 26;
const PLOT = HEIGHT - PAD * 2;

type Field = 'o' | 'h' | 'l' | 'c';

interface Props {
  candle: Candle;
  previous: Candle | null;
  onEdit: (field: Field, price: number) => void;
}

const y = (price: number) => PAD + ((AXIS_HI - price) / (AXIS_HI - AXIS_LO)) * PLOT;
const fmt = (price: number) => formatPrice(price, 4);

/** A big candle with four draggable handles. The wick and body are labelled where they sit. */
export function CandleCanvas({candle, previous, onEdit}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const scale = () => ({hi: AXIS_HI, lo: AXIS_LO, top: PAD, height: PLOT});
  const drag = useVerticalDrag({svgRef, scale, snap: PIP, onDrag: (field, price) => onEdit(field as Field, price)});

  const bullish = candle.close > candle.open;
  const flat = Math.abs(candle.close - candle.open) < PIP / 2;
  const color = flat ? 'var(--muted)' : bullish ? 'var(--pos)' : 'var(--neg)';
  const bodyW = Math.min(76, width * 0.17);
  const cx = previous ? width * 0.55 : width * 0.44;
  const px = width * 0.22;
  const top = Math.max(candle.open, candle.close);
  const bottom = Math.min(candle.open, candle.close);
  const showBraces = width >= 440;
  const braceX = cx + bodyW / 2 + 130;

  function key(field: Field, current: number, event: KeyboardEvent<SVGGElement>) {
    const step = PIP * (event.shiftKey ? 10 : 1);
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') onEdit(field, current + step);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') onEdit(field, current - step);
    else return;
    event.preventDefault();
  }

  const handle = (field: Field, name: string, price: number, x: number, labelSide: 'left' | 'right' | 'above' | 'below', showLine: boolean) => {
    const vertical = labelSide === 'above' || labelSide === 'below';
    const textX = vertical ? x : x + (labelSide === 'left' ? -16 : 16);
    const textY = labelSide === 'above' ? y(price) - 16 : labelSide === 'below' ? y(price) + 26 : y(price) + 4;
    return (
      <g
        key={field}
        {...drag.bind(field)}
        role="slider"
        tabIndex={0}
        aria-label={`${name} price`}
        aria-orientation="vertical"
        aria-valuemin={AXIS_LO}
        aria-valuemax={AXIS_HI}
        aria-valuenow={price}
        aria-valuetext={fmt(price)}
        style={{...drag.bind(field).style, outline: 'none'}}
        onKeyDown={(event) => key(field, price, event)}>
        <rect x={x - 26} y={y(price) - 16} width={52} height={32} fill="transparent" />
        {showLine && <line x1={x} x2={field === 'o' ? cx - bodyW / 2 : cx + bodyW / 2} y1={y(price)} y2={y(price)} stroke={color} strokeWidth="3" />}
        <circle cx={x} cy={y(price)} r="9" fill={color} stroke="var(--surface)" strokeWidth="2.5" />
        <text x={textX} y={textY} textAnchor={vertical ? 'middle' : labelSide === 'left' ? 'end' : 'start'} fontSize="11.5" fontWeight="800" fill="var(--ink)" fontFamily="'DM Mono', monospace">
          {name} {fmt(price)}
        </text>
      </g>
    );
  };

  const ticks: number[] = [];
  for (let price = Math.ceil(AXIS_LO / 0.005 - 1e-9) * 0.005; price <= AXIS_HI + 1e-9; price += 0.005) ticks.push(Number(price.toFixed(4)));

  const draw = (c: Candle, x: number, w: number, opacity: number) => {
    const up = c.close > c.open;
    const col = Math.abs(c.close - c.open) < PIP / 2 ? 'var(--muted)' : up ? 'var(--pos)' : 'var(--neg)';
    const t = Math.max(c.open, c.close);
    const b = Math.min(c.open, c.close);
    return (
      <g opacity={opacity}>
        <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke={col} strokeWidth="3" strokeLinecap="round" />
        <rect x={x - w / 2} y={y(t)} width={w} height={Math.max(3, y(b) - y(t))} rx="4" fill={col} />
      </g>
    );
  };

  const brace = (from: number, to: number, label: string) => {
    if (Math.abs(y(from) - y(to)) < 16) return null;
    const y1 = y(Math.max(from, to));
    const y2 = y(Math.min(from, to));
    return (
      <g>
        <path d={`M${braceX},${y1} h6 v${y2 - y1} h-6`} fill="none" stroke="var(--muted)" strokeWidth="1.5" />
        <text x={braceX + 14} y={(y1 + y2) / 2 + 4} fontSize="11.5" fontWeight="700" fill="var(--muted)">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div ref={ref} style={{width: '100%'}}>
      <svg ref={svgRef} width={width} height={HEIGHT} role="group" aria-labelledby={`${id}-title`} style={{display: 'block', overflow: 'visible', userSelect: 'none'}}>
        <title id={`${id}-title`}>Candlestick with draggable open, high, low and close handles. Drag a handle, or focus it and use the arrow keys.</title>
        {ticks.map((price) => (
          <g key={price}>
            <line x1={46} x2={width} y1={y(price)} y2={y(price)} stroke="var(--line)" strokeDasharray="2 6" />
            <text x={40} y={y(price) + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="'DM Mono', monospace">
              {fmt(price)}
            </text>
          </g>
        ))}

        {previous && (
          <g>
            {draw(previous, px, bodyW * 0.72, 0.45)}
            <text x={px} y={HEIGHT - 4} textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="'DM Mono', monospace">
              PREVIOUS
            </text>
          </g>
        )}

        <g>
          <line x1={cx} x2={cx} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          <rect x={cx - bodyW / 2} y={y(top)} width={bodyW} height={Math.max(4, y(bottom) - y(top))} rx="6" fill={color} opacity="0.92" />
        </g>
        <text x={cx} y={HEIGHT - 4} textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="'DM Mono', monospace">
          {previous ? 'CURRENT' : 'CANDLE'}
        </text>

        {showBraces && (
          <g>
            {brace(candle.high, top, 'Upper wick')}
            {brace(top, bottom, 'Body')}
            {brace(bottom, candle.low, 'Lower wick')}
          </g>
        )}

        {handle('h', 'High', candle.high, cx, 'above', false)}
        {handle('l', 'Low', candle.low, cx, 'below', false)}
        {handle('o', 'Open', candle.open, cx - bodyW / 2 - 22, 'left', true)}
        {handle('c', 'Close', candle.close, cx + bodyW / 2 + 22, 'right', true)}
      </svg>
    </div>
  );
}
