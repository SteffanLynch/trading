import type {ReactNode} from 'react';
import {firstHighAbove, firstLowBelow, walk, type Bar} from '../../utils/diagrams';
import {CandleChart, type Annotation} from './CandleChart';

type Point = [number, number];
const at = (walkResult: {turns: number[]}, leg: number) => walkResult.turns[leg];
const connect = (start: Point, w: {turns: number[]}, prices: number[]): Point[] => [start, ...prices.map((price, i) => [w.turns[i], price] as Point)];

/* ============================================================ market structure */

export function UptrendDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([100, 118, 108, 130, 119, 146, 135, 160], [5, 3, 5, 3, 6, 3, 5], 11);
  const t = w.turns;
  const a: Annotation[] = [
    {type: 'path', points: connect([0, 100], w, [118, 108, 130, 119, 146, 135, 160]), tone: 'muted'},
    {type: 'label', at: t[0], price: 118, text: 'High', tone: 'muted'},
    {type: 'label', at: t[1], price: 108, text: 'HL', tone: 'cyan', dy: 24},
    {type: 'label', at: t[2], price: 130, text: 'HH', tone: 'up'},
    {type: 'label', at: t[3], price: 119, text: 'HL', tone: 'cyan', dy: 24},
    {type: 'label', at: t[4], price: 146, text: 'HH', tone: 'up'},
    {type: 'label', at: t[5], price: 135, text: 'HL', tone: 'cyan', dy: 24},
    {type: 'label', at: t[6], price: 160, text: 'HH', tone: 'up'},
    {type: 'label', at: 2, price: 110, text: 'Impulse', tone: 'accent', dx: -36, dy: 8},
    {type: 'label', at: t[0] + 1, price: 108, text: 'Pullback', tone: 'warn', dx: -8, dy: 50},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="An uptrend: each swing high (HH) and swing low (HL) is higher than the one before" caption={caption ?? 'Higher highs (HH) and higher lows (HL). Each pullback stops above the previous low.'} />;
}

export function DowntrendDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([160, 142, 152, 128, 138, 112, 122, 96], [5, 3, 5, 3, 6, 3, 5], 23);
  const t = w.turns;
  const a: Annotation[] = [
    {type: 'path', points: connect([0, 160], w, [142, 152, 128, 138, 112, 122, 96]), tone: 'muted'},
    {type: 'label', at: t[0], price: 142, text: 'Low', tone: 'muted', dy: 24},
    {type: 'label', at: t[1], price: 152, text: 'LH', tone: 'cyan'},
    {type: 'label', at: t[2], price: 128, text: 'LL', tone: 'down', dy: 24},
    {type: 'label', at: t[3], price: 138, text: 'LH', tone: 'cyan'},
    {type: 'label', at: t[4], price: 112, text: 'LL', tone: 'down', dy: 24},
    {type: 'label', at: t[5], price: 122, text: 'LH', tone: 'cyan'},
    {type: 'label', at: t[6], price: 96, text: 'LL', tone: 'down', dy: 24},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="A downtrend: each swing high (LH) and swing low (LL) is lower than the one before" caption={caption ?? 'Lower highs (LH) and lower lows (LL). Each rally stops below the previous high.'} />;
}

export function RangeDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([100, 120, 101, 119, 102, 121, 101, 118, 103, 119, 102, 142], [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 7], 5, 0.8);
  const end = w.bars.length - 1;
  const a: Annotation[] = [
    {type: 'zone', from: 0, to: end - 6, top: 123, bottom: 117.5, tone: 'down', label: 'RESISTANCE'},
    {type: 'zone', from: 0, to: end - 6, top: 104, bottom: 98.5, tone: 'up', label: 'SUPPORT'},
    {type: 'label', at: Math.round((end - 6) / 2), price: 111, text: 'Consolidation', tone: 'muted', dy: 0},
    {type: 'label', at: end - 2, price: 130, text: 'Breakout', tone: 'accent', dx: -34, dy: -8},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="Price bouncing between a floor and a ceiling, then breaking out upward" caption={caption ?? 'Consolidation: price bounces between support and resistance until a breakout.'} />;
}

export function BosDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([100, 120, 108, 128, 116, 144], [5, 4, 5, 4, 7], 31);
  const t = w.turns;
  const brk = firstHighAbove(w.bars, t[3], 128);
  const a: Annotation[] = [
    {type: 'path', points: connect([0, 100], w, [120, 108, 128, 116, 144]), tone: 'muted'},
    {type: 'hline', from: t[2], to: w.bars.length - 1, price: 128, tone: 'warn'},
    {type: 'label', at: t[2] + 2, price: 128, text: 'Previous high', tone: 'warn', dy: -16},
    {type: 'dot', at: brk, price: 128, tone: 'up'},
    {type: 'label', at: brk, price: 128, text: 'BOS', tone: 'up', dy: -22},
    {type: 'label', at: t[3], price: 116, text: 'HL', tone: 'cyan', dy: 24},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="A break of structure: price breaks above the previous swing high, confirming the uptrend continues" caption={caption ?? 'A break of structure (BOS): price breaks beyond the previous swing high, so the trend continues.'} />;
}

export function ChochDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([100, 120, 108, 130, 118, 142, 128, 103], [5, 4, 5, 4, 6, 4, 7], 41);
  const t = w.turns;
  const brk = firstLowBelow(w.bars, t[5] + 1, 128);
  const a: Annotation[] = [
    {type: 'path', points: connect([0, 100], w, [120, 108, 130, 118, 142, 128, 103]), tone: 'muted'},
    {type: 'hline', from: t[5], to: w.bars.length - 1, price: 128, tone: 'warn'},
    {type: 'label', at: t[5], price: 128, text: 'Last higher low', tone: 'warn', dx: -66, dy: 26},
    {type: 'label', at: t[2], price: 130, text: 'HH', tone: 'up'},
    {type: 'label', at: t[4], price: 142, text: 'HH', tone: 'up'},
    {type: 'dot', at: brk, price: 128, tone: 'down'},
    {type: 'label', at: brk, price: 128, text: 'ChoCh', tone: 'down', dx: 26, dy: 24},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="A change of character: price breaks below the last higher low of an uptrend, the first warning the trend may be ending" caption={caption ?? 'A change of character (ChoCh): price breaks the last higher low. A warning, not a confirmation.'} />;
}

export function NestedTrendDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([100, 140, 110, 185, 145, 235], [9, 7, 9, 7, 11], 17);
  const t = w.turns;
  const a: Annotation[] = [
    {type: 'path', points: [[0, 98], [t[4], 240]], tone: 'accent', width: 3},
    {type: 'label', at: 3, price: 170, text: 'Higher timeframe: uptrend', tone: 'accent', dx: 62},
    {type: 'label', at: t[0] + 4, price: 126, text: 'Lower timeframe: a downtrend', tone: 'warn', dx: 96, dy: 40},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="A pullback that looks like a downtrend on a smaller timeframe but is part of a larger uptrend" caption={caption ?? 'Smaller trends sit inside larger ones: the same pullback is a downtrend up close and a pause inside an uptrend from further out.'} />;
}

/* ===================================================== support and resistance */

export function SupportResistanceDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([108, 122, 106, 121, 105, 122, 107, 120, 106, 121], 4, 13, 0.7);
  const t = w.turns;
  const a: Annotation[] = [
    {type: 'zone', from: 0, to: w.bars.length - 1, top: 124.5, bottom: 119, tone: 'down', label: 'RESISTANCE ZONE'},
    {type: 'zone', from: 0, to: w.bars.length - 1, top: 108.5, bottom: 102.5, tone: 'up', label: 'SUPPORT ZONE'},
    ...[0, 2, 4, 6, 8].map((i): Annotation => ({type: 'dot', at: t[i], price: [122, 121, 122, 120, 121][i / 2], tone: 'down'})),
    ...[1, 3, 5, 7].map((i): Annotation => ({type: 'dot', at: t[i], price: [106, 105, 107, 106][(i - 1) / 2], tone: 'up'})),
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="Price turning back from a resistance zone above and a support zone below, several times" caption={caption ?? 'Levels are zones, not single lines. Price turns back from the same area again and again.'} />;
}

export function RoleFlipDiagram({caption, retest = false}: {caption?: ReactNode; retest?: boolean}) {
  const w = walk([100, 119, 106, 120, 108, 134, 121, 150], [4, 3, 4, 3, 5, 4, 7], 19, 0.8);
  const t = w.turns;
  const a: Annotation[] = [
    {type: 'zone', from: 0, to: w.bars.length - 1, top: 122, bottom: 118, tone: 'warn'},
    {type: 'label', at: 2, price: 120, text: retest ? 'Level' : 'Resistance', tone: 'warn', dy: -22},
    {type: 'label', at: t[3] + 3, price: 126, text: retest ? 'Break' : 'Breaks above', tone: 'accent', dx: -34, dy: -6},
    {type: 'dot', at: t[5], price: 121, tone: 'up'},
    {type: 'label', at: t[5], price: 121, text: retest ? 'Retest' : 'Now support', tone: 'up', dy: 26},
    {type: 'label', at: w.bars.length - 4, price: 146, text: retest ? 'Continuation' : 'Bounces', tone: 'up', dx: -10, dy: -14},
  ];
  return (
    <CandleChart
      bars={w.bars}
      annotations={a}
      ariaLabel={retest ? 'Price breaks a level, returns to retest it, then continues' : 'A resistance level broken by price becomes support when price returns to it'}
      caption={caption ?? (retest ? 'Break and retest: price leaves a level, returns to test it, then continues.' : 'The role flip: broken resistance becomes support when price comes back to it.')}
    />
  );
}

/* ================================================================ market nature */

export function CycleDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([100, 105, 100.5, 104.5, 101, 104, 140, 136, 141, 137, 141, 138, 184], [3, 3, 3, 3, 3, 8, 3, 3, 3, 3, 3, 9], 29, 0.8);
  const a: Annotation[] = [
    {type: 'zone', from: 0, to: 14, top: 190, bottom: 94, tone: 'muted', label: 'CONTRACTION'},
    {type: 'zone', from: 15, to: 22, top: 190, bottom: 94, tone: 'accent', label: 'EXPANSION'},
    {type: 'zone', from: 23, to: 37, top: 190, bottom: 94, tone: 'muted', label: 'CONTRACTION'},
    {type: 'zone', from: 38, to: 46, top: 190, bottom: 94, tone: 'accent', label: 'EXPANSION'},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="Price alternating between tight contraction and sharp expansion" caption={caption ?? 'The market cycles: quiet contraction builds, then price expands sharply, then contracts again.'} />;
}

/* ===================================================================== candles */

/** Bar builders for the named candles, in the same schematic units as the walks. */
const bar = (o: number, h: number, l: number, c: number): Bar => ({o, h, l, c});

export function HammerDiagram({caption}: {caption?: ReactNode}) {
  const down = walk([140, 128, 134, 112], [4, 3, 5], 3);
  const hammer = bar(112.6, 115.8, 102, 115.2);
  const up = walk([114, 122, 118, 134], [3, 2, 4], 9);
  const bars = [...down.bars, hammer, ...up.bars];
  const i = down.bars.length;
  const a: Annotation[] = [
    {type: 'hline', from: i - 3, to: i + 3, price: 112, tone: 'cyan'},
    {type: 'label', at: i, price: 114, text: 'Hammer', tone: 'up', dy: -20},
    {type: 'label', at: i, price: 102, text: 'Long lower wick: sellers rejected', tone: 'cyan', dx: 94, dy: 24},
  ];
  return <CandleChart bars={bars} annotations={a} ariaLabel="A hammer candle at the end of a fall: a small body with a long lower wick, followed by a rise" caption={caption ?? 'A hammer: sellers pushed price down hard, but buyers rejected it and pushed it back up.'} />;
}

export function ShootingStarDiagram({caption}: {caption?: ReactNode}) {
  const up = walk([100, 118, 110, 134], [4, 3, 5], 4);
  const star = bar(131.4, 146, 130.6, 134);
  const down = walk([132, 124, 128, 108], [3, 2, 4], 8);
  const bars = [...up.bars, star, ...down.bars];
  const i = up.bars.length;
  const a: Annotation[] = [
    {type: 'label', at: i, price: 146, text: 'Shooting star', tone: 'down', dy: -18},
    {type: 'label', at: i, price: 140, text: 'Long upper wick: buyers rejected', tone: 'cyan', dx: -112, dy: -6},
  ];
  return <CandleChart bars={bars} annotations={a} ariaLabel="A shooting star candle at the end of a rise: a small body with a long upper wick, followed by a fall" caption={caption ?? 'A shooting star: buyers pushed price up hard, but sellers rejected it and pushed it back down.'} />;
}

export function DojiDiagram({caption}: {caption?: ReactNode}) {
  const up = walk([100, 140], 9, 6, 0.8);
  const doji = bar(140.5, 147, 134, 140.4);
  const after = walk([140, 131], 3, 10);
  const bars = [...up.bars, doji, ...after.bars];
  const i = up.bars.length;
  const a: Annotation[] = [
    {type: 'label', at: i, price: 147, text: 'Doji', tone: 'warn', dy: -18},
    {type: 'label', at: i, price: 134, text: 'Indecision after a strong move', tone: 'muted', dx: -96, dy: 26},
  ];
  return <CandleChart bars={bars} annotations={a} ariaLabel="A doji candle after a strong rise: open and close almost equal, with wicks on both sides" caption={caption ?? 'A doji: open and close are nearly equal. Neither side won. After a strong move it is a warning, not a signal.'} />;
}

export function MomentumDiagram({caption}: {caption?: ReactNode}) {
  const calm = walk([100, 103, 100.5, 102.5, 101], [3, 3, 3, 3], 14, 0.8);
  const big = bar(101.4, 112.6, 101.2, 112.4);
  const after = walk([112.5, 115, 113, 118], [3, 2, 3], 21);
  const bars = [...calm.bars, big, ...after.bars];
  const i = calm.bars.length;
  const a: Annotation[] = [
    {type: 'label', at: i, price: 112.6, text: 'Momentum candle', tone: 'up', dy: -18},
    {type: 'label', at: i, price: 106, text: 'Tiny wicks: little opposition', tone: 'muted', dx: 112, dy: 6},
  ];
  return <CandleChart bars={bars} annotations={a} ariaLabel="A large momentum candle with tiny wicks breaking out of a quiet period" caption={caption ?? 'A momentum candle: a large body with almost no wicks. One side dominated from open to close.'} />;
}

export function EngulfingDiagram({bearish = false, caption}: {bearish?: boolean; caption?: ReactNode}) {
  const lead = bearish ? walk([100, 118, 112, 134], [4, 3, 5], 12) : walk([135, 122, 127, 112], [4, 3, 5], 12);
  const prev = bearish ? bar(134.5, 136, 133.6, 135.4) : bar(113, 113.8, 108.5, 109.5);
  const engulf = bearish ? bar(136.2, 136.6, 125, 126) : bar(108.4, 119, 108, 117.5);
  const tail = bearish ? walk([126, 118, 122, 106], [3, 2, 4], 16) : walk([118, 126, 121, 136], [3, 2, 4], 16);
  const bars = [...lead.bars, prev, engulf, ...tail.bars];
  const i = lead.bars.length;
  const a: Annotation[] = bearish
    ? [
        {type: 'label', at: i, price: 136, text: 'Small green candle', tone: 'muted', dx: -62, dy: -20},
        {type: 'label', at: i + 1, price: 136.6, text: 'Bearish engulfing', tone: 'down', dx: 34, dy: -20},
        {type: 'hline', from: i - 3, to: i + 3, price: 136.6, tone: 'warn'},
      ]
    : [
        {type: 'label', at: i, price: 108.5, text: 'Small red candle', tone: 'muted', dx: -62, dy: 24},
        {type: 'label', at: i + 1, price: 119, text: 'Bullish engulfing', tone: 'up', dx: 34, dy: -20},
        {type: 'hline', from: i - 3, to: i + 3, price: 108, tone: 'cyan'},
      ];
  return (
    <CandleChart
      bars={bars}
      annotations={a}
      ariaLabel={bearish ? 'A bearish engulfing candle: a large red candle whose body covers the previous green candle, at resistance' : 'A bullish engulfing candle: a large green candle whose body covers the previous red candle, at support'}
      caption={caption ?? (bearish ? 'Bearish engulfing at resistance: the red body completely covers the green one before it.' : 'Bullish engulfing at support: the green body completely covers the red one before it.')}
    />
  );
}

export function ThreeBarReversalDiagram({caption}: {caption?: ReactNode}) {
  const lead = walk([100, 128], 7, 18, 0.8);
  const one = bar(128.5, 135, 128, 134.5);
  const two = bar(134.6, 136.5, 133.5, 134.9);
  const three = bar(134.2, 134.6, 124, 125);
  const tail = walk([125, 112], 4, 22);
  const bars = [...lead.bars, one, two, three, ...tail.bars];
  const i = lead.bars.length;
  const a: Annotation[] = [
    {type: 'label', at: i, price: 135, text: '1 continues', tone: 'up', dx: -36, dy: -18},
    {type: 'label', at: i + 1, price: 136.5, text: '2 pauses', tone: 'warn', dy: -28},
    {type: 'label', at: i + 2, price: 134.6, text: '3 reverses', tone: 'down', dx: 40, dy: -18},
  ];
  return <CandleChart bars={bars} annotations={a} ariaLabel="A three-bar reversal: a candle continuing the trend, a small pause candle, then a strong candle in the opposite direction" caption={caption ?? 'Three-bar reversal: the trend continues, pauses, then a strong candle goes the other way.'} />;
}

/* ===================================================================== patterns */

export function HeadAndShouldersDiagram({caption}: {caption?: ReactNode}) {
  const w = walk([100, 118, 108, 136, 109, 120, 94], [6, 4, 6, 6, 4, 8], 27, 0.8);
  const t = w.turns;
  const neck = 108.5;
  const brk = firstLowBelow(w.bars, t[4] + 1, neck);
  const a: Annotation[] = [
    {type: 'hline', from: t[1] - 2, to: w.bars.length - 1, price: neck, tone: 'warn'},
    {type: 'label', at: t[0], price: 118, text: 'Left shoulder', tone: 'muted'},
    {type: 'label', at: t[2], price: 136, text: 'Head', tone: 'accent'},
    {type: 'label', at: t[4], price: 120, text: 'Right shoulder', tone: 'muted'},
    {type: 'label', at: t[1] - 1, price: neck, text: 'Neckline', tone: 'warn', dx: -30, dy: 20},
    {type: 'dot', at: brk, price: neck, tone: 'down'},
    {type: 'label', at: brk, price: neck, text: 'Neckline break', tone: 'down', dx: 28, dy: 26},
  ];
  return <CandleChart bars={w.bars} annotations={a} ariaLabel="A head and shoulders top: three peaks with the middle one highest, completed when price breaks the neckline" caption={caption ?? 'Head and shoulders (top): the pattern completes when price breaks the neckline, not before.'} />;
}

export function DoubleTopDiagram({bottom = false, caption}: {bottom?: boolean; caption?: ReactNode}) {
  const w = bottom ? walk([150, 122, 138, 122.5, 152], [7, 5, 5, 7], 33, 0.8) : walk([100, 128, 112, 127.5, 98], [7, 5, 5, 7], 33, 0.8);
  const t = w.turns;
  const extreme = bottom ? 122 : 128;
  const middle = bottom ? 138 : 112;
  const brk = bottom ? firstHighAbove(w.bars, t[2] + 1, middle) : firstLowBelow(w.bars, t[2] + 1, middle);
  const a: Annotation[] = [
    {type: 'hline', from: t[0] - 4, to: t[2] + 2, price: extreme, tone: bottom ? 'up' : 'down'},
    {type: 'hline', from: t[0], to: w.bars.length - 1, price: middle, tone: 'warn'},
    {type: 'label', at: t[0], price: extreme, text: bottom ? 'Bottom 1' : 'Top 1', tone: 'muted', dy: bottom ? 24 : -16},
    {type: 'label', at: t[2], price: extreme, text: bottom ? 'Bottom 2' : 'Top 2', tone: 'muted', dy: bottom ? 24 : -16},
    {type: 'label', at: t[1], price: middle, text: 'Neckline', tone: 'warn', dy: bottom ? -16 : 22},
    {type: 'dot', at: brk, price: middle, tone: bottom ? 'up' : 'down'},
    {type: 'label', at: brk, price: middle, text: 'Break', tone: bottom ? 'up' : 'down', dx: 22, dy: bottom ? -22 : 24},
  ];
  return (
    <CandleChart
      bars={w.bars}
      annotations={a}
      ariaLabel={bottom ? 'A double bottom: price fails to fall below the same level twice, then breaks up through the neckline' : 'A double top: price fails to rise above the same level twice, then breaks down through the neckline'}
      caption={caption ?? (bottom ? 'Double bottom: two failed attempts to go lower, confirmed when price breaks the neckline upward.' : 'Double top: two failed attempts to go higher, confirmed when price breaks the neckline downward.')}
    />
  );
}

/* =============================================================== candle anatomy */

/** The four prices and the parts of a candle, on one bullish and one bearish candle side by side. */
export function CandleAnatomyDiagram() {
  const W = 560;
  const H = 320;
  const y = (p: number) => 30 + ((100 - p) / 100) * 250;
  const candle = (cx: number, o: number, h: number, l: number, c: number, color: string, names: [string, string]) => {
    const top = y(Math.max(o, c));
    const bottom = y(Math.min(o, c));
    return (
      <g>
        <line x1={cx} x2={cx} y1={y(h)} y2={y(l)} stroke={color} strokeWidth="4" strokeLinecap="round" />
        <rect x={cx - 34} y={top} width="68" height={bottom - top} rx="7" fill={color} />
        {[[h, 'High'], [names[0] === 'Open' ? o : c, names[0]], [names[1] === 'Close' ? c : o, names[1]], [l, 'Low']].map(([price, label]) => (
          <g key={String(label)}>
            <line x1={cx + 40} x2={cx + 76} y1={y(price as number)} y2={y(price as number)} stroke="var(--muted)" strokeDasharray="3 3" />
            <text x={cx + 82} y={y(price as number) + 4} fontSize="12.5" fontWeight="800" fill="var(--ink)" fontFamily="'DM Mono', monospace">
              {label as string}
            </text>
          </g>
        ))}
        <text x={cx - 44} y={(y(h) + top) / 2 + 4} textAnchor="end" fontSize="11.5" fill="var(--muted)">upper wick</text>
        <text x={cx - 44} y={(top + bottom) / 2 + 4} textAnchor="end" fontSize="11.5" fontWeight="700" fill="var(--ink)">body</text>
        <text x={cx - 44} y={(bottom + y(l)) / 2 + 4} textAnchor="end" fontSize="11.5" fill="var(--muted)">lower wick</text>
      </g>
    );
  };
  return (
    <figure className="diagram-anatomy" style={{margin: '2rem 0', padding: '1.1rem 1rem 0.85rem', border: '1.5px solid var(--line)', borderRadius: '1.4rem', background: 'var(--surface)', boxShadow: 'var(--shadow)'}}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Anatomy of a candle: a bullish candle opens low and closes high; a bearish candle opens high and closes low. Each shows the high, low, upper wick, body and lower wick." style={{width: '100%', height: 'auto', display: 'block', maxWidth: 640, margin: '0 auto'}}>
        <text x="110" y="18" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--pos)" fontFamily="'DM Mono', monospace" letterSpacing="0.08em">BULLISH</text>
        <text x="410" y="18" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--neg)" fontFamily="'DM Mono', monospace" letterSpacing="0.08em">BEARISH</text>
        {candle(110, 30, 88, 14, 72, 'var(--pos)', ['Open', 'Close'])}
        {candle(410, 72, 88, 14, 30, 'var(--neg)', ['Open', 'Close'])}
      </svg>
      <figcaption style={{margin: '0.7rem 0 0', color: 'var(--muted)', font: "500 0.72rem/1.5 'Manrope', sans-serif"}}>
        A bullish candle closes above its open; a bearish candle closes below it. The wicks reach the highest and lowest prices of the period.
      </figcaption>
    </figure>
  );
}

/* ===================================================================== timeframes */

/** The same market twice: from far away it is an uptrend, zoomed into one pullback it looks like a downtrend. */
export function TimeframesDiagram() {
  const high = walk([100, 140, 110, 185, 145, 235], [9, 7, 9, 7, 11], 17);
  const t = high.turns;
  const zoom: Annotation[] = [
    {type: 'zone', from: t[0] + 1, to: t[1], top: 146, bottom: 106, tone: 'warn', label: 'ZOOM IN'},
    {type: 'path', points: [[0, 98], [t[4], 240]], tone: 'accent', width: 3},
  ];
  const low = walk([135, 128, 132, 122, 126, 118], [4, 3, 4, 3, 5], 8);
  const lt = low.turns;
  const lowNotes: Annotation[] = [
    {type: 'path', points: [[0, 135], [lt[0], 128], [lt[1], 132], [lt[2], 122], [lt[3], 126], [lt[4], 118]], tone: 'muted'},
    {type: 'label', at: lt[1], price: 132, text: 'LH', tone: 'cyan'},
    {type: 'label', at: lt[2], price: 122, text: 'LL', tone: 'down', dy: 24},
    {type: 'label', at: lt[3], price: 126, text: 'LH', tone: 'cyan'},
    {type: 'label', at: lt[4], price: 118, text: 'LL', tone: 'down', dy: 24},
  ];
  return (
    <>
      <CandleChart bars={high.bars} annotations={zoom} height={260} ariaLabel="A higher timeframe chart showing an uptrend with one pullback highlighted" caption={<><strong>Higher timeframe</strong> (for example the daily chart): a clear uptrend. The highlighted pullback is just a pause.</>} />
      <CandleChart bars={low.bars} annotations={lowNotes} height={260} maxBody={20} ariaLabel="The highlighted pullback seen on a lower timeframe: a downtrend of lower highs and lower lows" caption={<><strong>Lower timeframe</strong> (for example the 15-minute chart), zoomed into that pullback: it looks like a downtrend. The bigger picture decides which one matters.</>} />
    </>
  );
}
