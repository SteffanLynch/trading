import type {ReactNode} from 'react';
import CandlestickBuilder from '../../components/calculators/CandlestickBuilder';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="candlestick-builder"
      lead="A candle is just four prices drawn as a shape. Change the open, high, low and close, or drag them, and watch it redraw."
      meaning={
        <>
          <p>
            A candlestick summarises one period of trading with four prices: where it <strong>opened</strong>, the <strong>highest</strong> and <strong>lowest</strong> prices reached, and where it <strong>closed</strong>. The thick <strong>body</strong> spans open to close; the thin <strong>wicks</strong> reach up to the high and down to the low.
          </p>
          <p>
            A candle that closes above its open is bullish; below, bearish. The proportions carry the story: a long wick shows price was pushed somewhere and rejected, and a long body shows one side stayed in control. Named patterns such as the hammer or the engulfing candle are just particular arrangements of those four prices.
          </p>
        </>
      }
      formula={['Body = |Close − Open|', 'Upper wick = High − the higher of open and close', 'Lower wick = the lower of open and close − Low']}
      example={
        <p>
          Open 1.1000, high 1.1100, low 1.0950, close 1.1070. The close is above the open, so the candle is <strong>bullish</strong>. The body is 70 pips, the upper wick 30 pips and the lower wick 50 pips. Drag the close down to 1.0980 and it flips to bearish without changing anything else.
        </p>
      }
      faqs={[
        {q: 'What does a candlestick show?', a: 'The open, high, low and close of a single period, such as one hour or one day, in a single shape. It shows where price started, where it went and where it ended.'},
        {q: 'What is the difference between a bullish and a bearish candle?', a: 'A bullish candle closes above its open, so buyers won the period. A bearish candle closes below its open, so sellers won it.'},
        {q: 'What are candle wicks?', a: 'The thin lines above and below the body. They mark the highest and lowest prices reached. Long wicks show prices that were reached but rejected before the period ended.'},
        {q: 'Is a hammer or engulfing candle a buy signal?', a: 'No. They are clues about buying or selling pressure at a moment in time, and they matter most at meaningful levels and in context. No candle pattern guarantees what price will do next.'},
      ]}
      learn={[
        {label: 'Candlesticks', to: '/library/fundamentals/candlesticks'},
        {label: 'Market structure', to: '/library/fundamentals/market-structure'},
        {label: 'Support and resistance', to: '/library/fundamentals/support-and-resistance'},
      ]}>
      <CandlestickBuilder />
    </ToolPage>
  );
}
