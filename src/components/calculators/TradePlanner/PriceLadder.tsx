import {useId, useRef, useState, type KeyboardEvent, type PointerEvent} from 'react';
import type {Instrument} from '../../../utils/calculators/instruments';
import type {Direction} from '../../../utils/calculators/sizing';
import {formatPrice} from '../../../utils/calculators/format';
import {useElementWidth} from '../hooks/useElementWidth';

interface LineLabel {
  money: string;
  distance: string;
}

interface Props {
  instrument: Instrument;
  direction: Direction;
  entry: number;
  stop: number;
  target: number | null;
  decimals: number;
  stopLabel: LineLabel;
  targetLabel: LineLabel | null;
  onStopChange: (price: number) => void;
  onTargetChange: (price: number) => void;
  /** When provided the entry line can be dragged too. */
  onEntryChange?: (price: number) => void;
}

type Which = 'stop' | 'target' | 'entry';

const HEIGHT = 300;
const PAD_Y = 34;
const HANDLE_X = 22;
const LINE_X = 44;
const RIGHT_PAD = 14;
const PLOT_H = HEIGHT - PAD_Y * 2;

interface Scale {
  lo: number;
  hi: number;
}

/**
 * A vertical price ladder. Stop and target are draggable (mouse, touch) and keyboard adjustable;
 * the parent turns every change back into the calculator's input fields, so everything stays in sync.
 */
export function PriceLadder({instrument, direction, entry, stop, target, decimals, stopLabel, targetLabel, onStopChange, onTargetChange, onEntryChange}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const frozen = useRef<Scale | null>(null);
  const dragging = useRef<Which | null>(null);
  const [, redraw] = useState(0);

  const snap = instrument.kind === 'forex' ? instrument.pipSize : 0.01;
  const long = direction === 'long';

  const prices = [entry, stop, ...(target !== null ? [target] : [])];
  const span = Math.max(...prices) - Math.min(...prices);
  const pad = Math.max(span * 0.22, snap * 6);
  const live: Scale = {lo: Math.min(...prices) - pad, hi: Math.max(...prices) + pad};
  const scale = frozen.current ?? live;

  const y = (price: number) => PAD_Y + ((scale.hi - price) / (scale.hi - scale.lo)) * PLOT_H;
  const fmt = (price: number) => formatPrice(price, decimals);
  const right = width - RIGHT_PAD;

  function clamp(which: Which, price: number): number {
    let bounded: number;
    if (which === 'entry') {
      // The entry stays strictly between the stop and the target.
      const lowerBound = long ? stop + snap : target !== null ? target + snap : -Infinity;
      const upperBound = long ? (target !== null ? target - snap : Infinity) : stop - snap;
      bounded = Math.min(Math.max(price, lowerBound), upperBound);
    } else {
      const lower = which === 'stop' ? !long : long; // stop sits below entry for longs; target sits below for shorts
      bounded = lower ? Math.max(price, entry + snap) : Math.min(price, entry - snap);
    }
    return Number(Math.max(snap, bounded).toFixed(decimals));
  }

  function emit(which: Which, price: number) {
    const next = clamp(which, price);
    (which === 'stop' ? onStopChange : which === 'target' ? onTargetChange : onEntryChange)?.(next);
  }

  function startDrag(which: Which, event: PointerEvent<SVGGElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    frozen.current = live; // keep the axis still while a line is being dragged
    dragging.current = which;
  }

  function moveDrag(event: PointerEvent<SVGGElement>) {
    if (!dragging.current || !frozen.current || !svgRef.current) return;
    const top = svgRef.current.getBoundingClientRect().top;
    const {lo, hi} = frozen.current;
    const raw = hi - ((event.clientY - top - PAD_Y) / PLOT_H) * (hi - lo);
    emit(dragging.current, Math.round(raw / snap) * snap);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = null;
    frozen.current = null;
    redraw((count) => count + 1);
  }

  function onKey(which: Which, current: number, event: KeyboardEvent<SVGGElement>) {
    const big = event.shiftKey || event.key === 'PageUp' || event.key === 'PageDown';
    const step = snap * (big ? 10 : 1);
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight' || event.key === 'PageUp') emit(which, current + step);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'PageDown') emit(which, current - step);
    else return;
    event.preventDefault();
  }

  const zoneLeft = LINE_X;
  const zoneWidth = Math.max(0, right - LINE_X);

  const handle = (which: Which, price: number, color: string, label: LineLabel, name: string) => {
    const lineY = y(price);
    const below = which === 'entry' ? long : price < entry;
    const textY = below ? lineY + 17 : lineY - 8;
    return (
      <g
        key={which}
        role="slider"
        tabIndex={0}
        aria-label={`${name} price`}
        aria-orientation="vertical"
        aria-valuemin={Number((entry - 1000 * snap).toFixed(decimals))}
        aria-valuemax={Number((entry + 1000 * snap).toFixed(decimals))}
        aria-valuenow={price}
        aria-valuetext={[fmt(price), label.distance, label.money].filter(Boolean).join(', ')}
        style={{cursor: 'ns-resize', touchAction: 'none', outline: 'none'}}
        onPointerDown={(event) => startDrag(which, event)}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => onKey(which, price, event)}>
        <rect x={LINE_X - 30} y={lineY - 14} width={zoneWidth + 30} height={28} fill="transparent" />
        <line x1={LINE_X} x2={right} y1={lineY} y2={lineY} stroke={color} strokeWidth="2" />
        <circle cx={HANDLE_X} cy={lineY} r="9" fill={color} stroke="var(--surface)" strokeWidth="2.5" />
        <path d={`M${HANDLE_X - 3.5},${lineY - 1.6} h7 M${HANDLE_X - 3.5},${lineY + 1.6} h7`} stroke="var(--surface)" strokeWidth="1.3" strokeLinecap="round" />
        <text x={LINE_X} y={textY} fontSize="11" fontWeight="700" fill={color} fontFamily="'DM Mono', monospace" letterSpacing="0.06em">
          {name.toUpperCase()} {fmt(price)}
        </text>
        {label.money && (
          <text x={right} y={textY} fontSize="12" fontWeight="700" fill={color} textAnchor="end">
            {label.money}
          </text>
        )}
      </g>
    );
  };

  const entryY = y(entry);
  const stopY = y(stop);
  const targetY = target !== null ? y(target) : null;

  return (
    <div ref={ref} style={{width: '100%'}}>
      <svg ref={svgRef} width={width} height={HEIGHT} role="group" aria-labelledby={`${id}-title`} style={{display: 'block', overflow: 'visible', userSelect: 'none'}}>
        <title id={`${id}-title`}>Price ladder. Drag the stop and target lines, or focus one and use the arrow keys to move it.</title>

        <rect x={zoneLeft} y={Math.min(entryY, stopY)} width={zoneWidth} height={Math.abs(stopY - entryY)} fill="var(--neg)" opacity="0.11" />
        {targetY !== null && <rect x={zoneLeft} y={Math.min(entryY, targetY)} width={zoneWidth} height={Math.abs(targetY - entryY)} fill="var(--pos)" opacity="0.11" />}

        <text x={LINE_X + zoneWidth / 2} y={(entryY + stopY) / 2 + 4} textAnchor="middle" fontSize="11.5" fill="var(--neg)" opacity="0.9">
          {stopLabel.distance}
        </text>
        {targetY !== null && targetLabel && (
          <text x={LINE_X + zoneWidth / 2} y={(entryY + targetY) / 2 + 4} textAnchor="middle" fontSize="11.5" fill="var(--pos)" opacity="0.9">
            {targetLabel.distance}
          </text>
        )}

        {onEntryChange ? (
          handle('entry', entry, 'var(--ink)', {money: '', distance: ''}, 'Entry')
        ) : (
          <>
            <line x1={LINE_X} x2={right} y1={entryY} y2={entryY} stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.75" />
            <circle cx={HANDLE_X} cy={entryY} r="5" fill="var(--ink)" opacity="0.75" />
            <text x={LINE_X} y={entryY + (long ? 15 : -7)} fontSize="11" fontWeight="700" fill="var(--ink)" fontFamily="'DM Mono', monospace" letterSpacing="0.06em">
              ENTRY {fmt(entry)}
            </text>
          </>
        )}

        {target !== null && targetLabel && handle('target', target, 'var(--pos)', targetLabel, 'Target')}
        {handle('stop', stop, 'var(--neg)', stopLabel, 'Stop')}
      </svg>
    </div>
  );
}
