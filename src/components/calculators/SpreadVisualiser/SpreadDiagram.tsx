import {useId} from 'react';
import {formatPrice} from '../../../utils/calculators/format';
import {useElementWidth} from '../hooks/useElementWidth';
import styles from '../ui/ui.module.css';

interface Props {
  bid: number;
  spreadPips: number;
  pipSize: number;
  decimals: number;
  side: 'buy' | 'sell';
  cost: string;
  breakEvenPips: number;
}

const HEIGHT = 300;
const WINDOW_PIPS = 8; // the axis always shows 8 pips either side of the mid price, so widening the spread visibly pulls the lines apart

/** Bid and ask drawn as two lines with the spread between them, and where a trade starts out on that picture. */
export function SpreadDiagram({bid, spreadPips, pipSize, decimals, side, cost, breakEvenPips}: Props) {
  const id = useId();
  const {ref, width} = useElementWidth<HTMLDivElement>();
  const mid = bid + (spreadPips * pipSize) / 2;
  const top = mid + WINDOW_PIPS * pipSize;
  const bottom = mid - WINDOW_PIPS * pipSize;
  const plotTop = 26;
  const plotHeight = HEIGHT - plotTop - 24;
  const y = (price: number) => plotTop + ((top - price) / (top - bottom)) * plotHeight;
  const ask = bid + spreadPips * pipSize;
  const yAsk = y(ask);
  const yBid = y(bid);
  const left = 18;
  const right = width - 18;
  const entryY = side === 'buy' ? yAsk : yBid;
  const markY = side === 'buy' ? yBid : yAsk;
  const centerX = left + (right - left) * 0.3;

  return (
    <div className={styles.chart} ref={ref}>
      <svg width={width} height={HEIGHT} role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{`Bid ${formatPrice(bid, decimals)} and ask ${formatPrice(ask, decimals)} with a spread of ${spreadPips} pips between them. A ${side} trade opens at the ${side === 'buy' ? 'ask' : 'bid'} but is valued at the ${side === 'buy' ? 'bid' : 'ask'}, so it starts ${cost} behind.`}</title>

        <rect className={styles.spreadBand} x={left} y={yAsk} width={right - left} height={Math.max(2, yBid - yAsk)} fill="var(--amber)" opacity="0.22" />

        <g className={styles.spreadLine} style={{transform: `translateY(${yAsk}px)`}}>
          <line x1={left} x2={right} y1={0} y2={0} stroke="var(--coral)" strokeWidth="2.5" />
          <text x={right - 4} y={-8} textAnchor="end" fontSize="11.5" fontWeight="800" fill="var(--coral)" fontFamily="'DM Mono', monospace">
            ASK {formatPrice(ask, decimals)}
          </text>
          <text x={right - 4} y={-22} textAnchor="end" fontSize="10.5" fill="var(--muted)">buyers pay this</text>
        </g>
        <g className={styles.spreadLine} style={{transform: `translateY(${yBid}px)`}}>
          <line x1={left} x2={right} y1={0} y2={0} stroke="var(--pos)" strokeWidth="2.5" />
          <text x={right - 4} y={18} textAnchor="end" fontSize="11.5" fontWeight="800" fill="var(--pos)" fontFamily="'DM Mono', monospace">
            BID {formatPrice(bid, decimals)}
          </text>
          <text x={right - 4} y={32} textAnchor="end" fontSize="10.5" fill="var(--muted)">sellers receive this</text>
        </g>

        <g className={styles.spreadLine} style={{transform: `translateY(${(yAsk + yBid) / 2}px)`}}>
          <text x={centerX + 70} y={4} fontSize="12" fontWeight="800" fill="var(--amber)" fontFamily="'DM Mono', monospace">
            SPREAD {spreadPips.toFixed(1)} pips
          </text>
        </g>

        <g>
          <circle className={styles.spreadDot} cx={centerX} cy={entryY} r="7" fill="var(--ink)" />
          <text x={centerX - 14} y={entryY + (side === 'buy' ? -10 : 18)} textAnchor="start" fontSize="11" fontWeight="700" fill="var(--ink)">
            {side === 'buy' ? 'You buy here (ask)' : 'You sell here (bid)'}
          </text>
          <line x1={centerX} x2={centerX} y1={entryY} y2={markY} stroke="var(--neg)" strokeWidth="3" strokeDasharray="4 4" style={{transition: 'all .3s ease'}} />
          <circle cx={centerX} cy={markY} r="5" fill="var(--neg)" />
          <text x={centerX + 12} y={(entryY + markY) / 2 + 4} fontSize="12" fontWeight="800" fill="var(--neg)">
            {cost} on opening
          </text>
        </g>

        <text x={left} y={HEIGHT - 6} fontSize="10.5" fill="var(--muted)">
          {side === 'buy' ? 'Price must rise' : 'Price must fall'} {breakEvenPips.toFixed(1)} pips to break even.
        </text>
      </svg>
    </div>
  );
}
