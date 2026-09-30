import {useCallback, useRef, useState, type PointerEvent, type RefObject} from 'react';

export interface DragScale {
  /** Price at the top and bottom of the plot. */
  hi: number;
  lo: number;
  /** Pixel offset of the plot from the top of the SVG, and its height. */
  top: number;
  height: number;
}

interface Options {
  svgRef: RefObject<SVGSVGElement | null>;
  /** The current (live) scale. The hook freezes it while a handle is being dragged so the axis does not jump. */
  scale: () => DragScale;
  /** Price increment to snap to (one pip, for forex). */
  snap: number;
  onDrag: (id: string, price: number) => void;
}

/** Shared pointer handling for draggable horizontal price lines in an SVG chart (mouse, touch and pen). */
export function useVerticalDrag({svgRef, scale, snap, onDrag}: Options) {
  const frozen = useRef<DragScale | null>(null);
  const active = useRef<string | null>(null);
  const [, redraw] = useState(0);

  const currentScale = useCallback(() => frozen.current ?? scale(), [scale]);

  const bind = (id: string) => ({
    style: {cursor: 'ns-resize', touchAction: 'none'} as const,
    onPointerDown(event: PointerEvent<SVGElement>) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      frozen.current = scale();
      active.current = id;
      redraw((count) => count + 1);
    },
    onPointerMove(event: PointerEvent<SVGElement>) {
      const frozenScale = frozen.current;
      if (active.current !== id || !frozenScale || !svgRef.current) return;
      const top = svgRef.current.getBoundingClientRect().top;
      const price = frozenScale.hi - ((event.clientY - top - frozenScale.top) / frozenScale.height) * (frozenScale.hi - frozenScale.lo);
      onDrag(id, Math.round(price / snap) * snap);
    },
    onPointerUp: end,
    onPointerCancel: end,
  });

  function end() {
    if (!active.current) return;
    active.current = null;
    frozen.current = null;
    redraw((count) => count + 1);
  }

  return {bind, scale: currentScale, activeId: active.current};
}
