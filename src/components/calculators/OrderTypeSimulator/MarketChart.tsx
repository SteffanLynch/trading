import {useId, useRef} from 'react';
import {formatPrice} from '../../../utils/calculators/format';
import type {OrderKind, OrderSpec, Side} from '../../../utils/calculators/orders';
import {positionPips} from '../../../utils/calculators/orders';
import type {SimState} from '../../../utils/calculators/orderSim';
import {useElementWidth} from '../hooks/useElementWidth';
import {useVerticalDrag} from '../hooks/useVerticalDrag';

interface Draft {
  kind: OrderKind;
  side: Side;
  price: number | null;
  limit: number | null;
}

interface Props {
  sim: SimState;
  draft: Draft;
  /** True until an order has been placed: the draft lines can be dragged. */
  editable: boolean;
  onDraftDrag: (id: 'price' | 'limit', price: number) => void;
}

const HEIGHT = 340;
const PAD = 20;
const PLOT = HEIGHT - PAD * 2;

interface Line {
  id: 'price' | 'limit';
  price: number;
  label: string;
  color: string;
  dashed?: boolean;
  dim?: boolean;
}

/** The practice market: a price line that moves, plus the order lines you place on it. */
export function MarketChart({sim, draft, editable, onDraftDrag}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const {floor, ceiling, pipSize, decimals} = sim.config;
  const y = (price: number) => PAD + ((ceiling - price) / (ceiling - floor)) * PLOT;
  const scale = () => ({hi: ceiling, lo: floor, top: PAD, height: PLOT});
  const drag = useVerticalDrag({
    svgRef,
    scale,
    snap: pipSize,
    onDrag: (lineId, price) => onDraftDrag(lineId as 'price' | 'limit', Math.min(ceiling - pipSize * 5, Math.max(floor + pipSize * 5, price))),
  });
  const fmt = (price: number) => formatPrice(price, decimals);

  const left = 58;
  const xNow = width - 100;
  const step = Math.min(3.2, (xNow - left) / 159);
  const points = sim.history.map((price, index) => `${(xNow - (sim.history.length - 1 - index) * step).toFixed(1)},${y(price).toFixed(1)}`).join(' ');

  const placed: OrderSpec | null = sim.order;
  const spec = placed ?? (draft.kind === 'market' ? null : {kind: draft.kind, side: draft.side, price: draft.price, limitPrice: draft.limit});
  const name = spec ? `${spec.side.toUpperCase()} ${spec.kind === 'stop-limit' ? 'STOP-LIMIT' : spec.kind.toUpperCase()}` : '';
  const lines: Line[] = [];
  if (spec && spec.price !== null && sim.orderState.status !== 'filled') {
    if (spec.kind === 'limit') lines.push({id: 'price', price: spec.price, label: `${name} ${fmt(spec.price)}`, color: 'var(--cyan)'});
    if (spec.kind === 'stop') lines.push({id: 'price', price: spec.price, label: `${name} ${fmt(spec.price)}`, color: 'var(--coral)'});
    if (spec.kind === 'stop-limit') {
      const triggered = sim.orderState.status === 'triggered';
      lines.push({id: 'price', price: spec.price, label: `STOP ${fmt(spec.price)}${triggered ? ' ✓ triggered' : ''}`, color: 'var(--coral)', dim: triggered});
      if (spec.limitPrice !== null && spec.limitPrice !== undefined) lines.push({id: 'limit', price: spec.limitPrice, label: `LIMIT ${fmt(spec.limitPrice)}`, color: 'var(--cyan)', dashed: !triggered});
    }
  }

  const ticks: number[] = [];
  for (let p = floor; p <= ceiling + 1e-9; p += 0.002) ticks.push(Number(p.toFixed(4)));

  const filled = sim.position;
  const pips = filled ? positionPips(filled.side, filled.fill, sim.price, pipSize) : 0;

  return (
    <div ref={ref} style={{width: '100%'}}>
      <svg ref={svgRef} width={width} height={HEIGHT} role="group" aria-labelledby={`${id}-title`} style={{display: 'block', overflow: 'visible', userSelect: 'none'}}>
        <title id={`${id}-title`}>{`Practice market at ${fmt(sim.price)}. ${filled ? `A ${filled.side} position is open from ${fmt(filled.fill)}.` : lines.length ? 'An order is shown on the chart.' : 'No order yet.'}`}</title>

        {ticks.map((price) => (
          <g key={price}>
            <line x1={left} x2={width} y1={y(price)} y2={y(price)} stroke="var(--line)" strokeDasharray="2 6" />
            <text x={left - 8} y={y(price) + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="'DM Mono', monospace">
              {fmt(price)}
            </text>
          </g>
        ))}

        {filled && Math.abs(sim.price - filled.fill) > 1e-9 && (
          <rect x={left} y={Math.min(y(filled.fill), y(sim.price))} width={xNow - left} height={Math.abs(y(filled.fill) - y(sim.price))} fill={pips >= 0 ? 'var(--pos)' : 'var(--neg)'} opacity="0.13" />
        )}

        <polyline points={points} fill="none" stroke="var(--ink)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />

        <line x1={left} x2={width - 4} y1={y(sim.price)} y2={y(sim.price)} stroke="var(--ink)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <circle cx={xNow} cy={y(sim.price)} r="5" fill="var(--ink)" />
        <g transform={`translate(${width - 92}, ${y(sim.price) - 11})`}>
          <rect width="88" height="22" rx="11" fill="var(--ink)" />
          <text x="44" y="15" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="var(--paper)" fontFamily="'DM Mono', monospace">
            {fmt(sim.price)}
          </text>
        </g>

        {filled && (
          <g>
            <line x1={left} x2={xNow} y1={y(filled.fill)} y2={y(filled.fill)} stroke="var(--accent)" strokeWidth="2.5" />
            <text x={left + 8} y={y(filled.fill) - 7} fontSize="11.5" fontWeight="800" fill="var(--accent)" fontFamily="'DM Mono', monospace">
              {filled.side === 'buy' ? 'BOUGHT' : 'SOLD'} @ {fmt(filled.fill)} · {pips >= 0 ? '+' : '−'}{Math.abs(pips).toFixed(1)} pips
            </text>
          </g>
        )}

        {lines.map((line) => {
          const canDrag = editable && !placed;
          const props = canDrag ? drag.bind(line.id) : {};
          return (
            <g
              key={line.id}
              {...props}
              role={canDrag ? 'slider' : undefined}
              tabIndex={canDrag ? 0 : undefined}
              aria-label={canDrag ? `${line.id === 'limit' ? 'Limit' : 'Order'} price` : undefined}
              aria-orientation={canDrag ? 'vertical' : undefined}
              aria-valuemin={canDrag ? floor : undefined}
              aria-valuemax={canDrag ? ceiling : undefined}
              aria-valuenow={canDrag ? line.price : undefined}
              aria-valuetext={canDrag ? fmt(line.price) : undefined}
              onKeyDown={
                canDrag
                  ? (event) => {
                      const stepSize = pipSize * (event.shiftKey ? 10 : 1);
                      if (event.key === 'ArrowUp') onDraftDrag(line.id, line.price + stepSize);
                      else if (event.key === 'ArrowDown') onDraftDrag(line.id, line.price - stepSize);
                      else return;
                      event.preventDefault();
                    }
                  : undefined
              }
              style={{...(canDrag ? (props as {style?: object}).style : {}), outline: 'none', opacity: line.dim ? 0.55 : 1}}>
              <rect x={left} y={y(line.price) - 14} width={width - left} height={28} fill="transparent" />
              <line x1={left} x2={width - 4} y1={y(line.price)} y2={y(line.price)} stroke={line.color} strokeWidth="3" strokeDasharray={line.dashed ? '7 5' : undefined} />
              {canDrag && <circle cx={left + 14} cy={y(line.price)} r="9" fill={line.color} stroke="var(--surface)" strokeWidth="2.5" />}
              <text x={left + (canDrag ? 30 : 10)} y={y(line.price) - 8} fontSize="11.5" fontWeight="800" fill={line.color} fontFamily="'DM Mono', monospace">
                {line.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
