import styles from './hero.module.css';

// A hand-shaped trend with a pullback: the classic "break and retest" the notes describe.
const CLOSES = [40, 42, 41, 45, 48, 47, 51, 54, 53, 57, 60, 58, 56, 53, 55, 52, 50, 53, 56, 59, 62, 61, 65, 68, 66, 70, 73, 71, 75, 78];
const WICKS = [2.5, 3.5, 1.5, 3, 2, 3.8, 1.8, 2.6, 3.2, 1.4, 2.2, 3.6, 2.8, 1.6, 3.4, 2.4, 3, 1.8, 2.7, 3.3, 1.5, 2.9, 2.1, 3.1, 1.7, 3.5, 2.3, 3.7, 1.9, 2.6];

const W = 640;
const H = 440;
const TOP = 30;
const BOTTOM = 400;
const MIN = 30;
const MAX = 110;
const y = (price: number) => BOTTOM - ((price - MIN) / (MAX - MIN)) * (BOTTOM - TOP);

const ENTRY = 78;
const STOP = 66;
const TARGET = 102;
const ZONE_X = 492;

/** Decorative, self-drawing candlestick chart with the entry / stop / target ladder the Trade Planner uses. */
export default function HeroChart() {
  const candles = CLOSES.map((close, index) => {
    const open = index === 0 ? 38 : CLOSES[index - 1];
    const high = Math.max(open, close) + WICKS[index];
    const low = Math.min(open, close) - WICKS[(index + 7) % WICKS.length];
    return {open, close, high, low, up: close >= open, x: 24 + index * 15.2};
  });

  return (
    <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="An animated candlestick chart with an entry, stop and target marked for a trade" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hero-reward" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--lime)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--lime)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="hero-risk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--coral)" stopOpacity="0.06" />
          <stop offset="1" stopColor="var(--coral)" stopOpacity="0.32" />
        </linearGradient>
      </defs>

      {[40, 60, 80, 100].map((price) => (
        <line key={price} x1="0" x2={W} y1={y(price)} y2={y(price)} stroke="var(--line)" strokeDasharray="2 6" />
      ))}

      {candles.map((candle, index) => {
        const color = candle.up ? 'var(--lime-t)' : 'var(--coral-t)';
        const top = y(Math.max(candle.open, candle.close));
        const bottom = y(Math.min(candle.open, candle.close));
        return (
          <g key={index} className={styles.candle} style={{animationDelay: `${index * 55}ms`}}>
            <line x1={candle.x} x2={candle.x} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="2" strokeLinecap="round" />
            <rect x={candle.x - 4.5} y={top} width="9" height={Math.max(3, bottom - top)} rx="2.5" fill={color} />
          </g>
        );
      })}

      <g className={styles.zones}>
        <rect x={ZONE_X} y={y(TARGET)} width={W - ZONE_X - 6} height={y(ENTRY) - y(TARGET)} rx="10" fill="url(#hero-reward)" />
        <rect x={ZONE_X} y={y(ENTRY)} width={W - ZONE_X - 6} height={y(STOP) - y(ENTRY)} rx="10" fill="url(#hero-risk)" />
        <line x1="24" x2={W - 6} y1={y(ENTRY)} y2={y(ENTRY)} stroke="var(--ink)" strokeOpacity="0.55" strokeDasharray="5 5" />
        <line x1={ZONE_X} x2={W - 6} y1={y(TARGET)} y2={y(TARGET)} stroke="var(--lime-t)" strokeWidth="2.5" />
        <line x1={ZONE_X} x2={W - 6} y1={y(STOP)} y2={y(STOP)} stroke="var(--coral-t)" strokeWidth="2.5" />
        <text x={ZONE_X + 10} y={y(TARGET) + 20} className={styles.zoneLabel} fill="var(--lime-t)">TARGET · +2R</text>
        <text x={ZONE_X + 10} y={y(ENTRY) - 8} className={styles.zoneLabel} fill="var(--ink)">ENTRY</text>
        <text x={ZONE_X + 10} y={y(STOP) - 8} className={styles.zoneLabel} fill="var(--coral-t)">STOP · −1R</text>
      </g>
    </svg>
  );
}
