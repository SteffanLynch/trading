import type {ReactNode} from 'react';
import SpreadVisualiser from '../../components/calculators/SpreadVisualiser';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="spread-visualiser"
      lead="Why does a trade open already losing money? Widen and narrow the spread and watch the bid, the ask and the cost move."
      meaning={
        <>
          <p>
            Every market has two prices at any moment: the <strong>bid</strong>, which is what buyers will pay and what a seller receives, and the <strong>ask</strong>, which is what a buyer has to pay. The ask is always a little higher. The gap between them is the <strong>spread</strong>.
          </p>
          <p>
            A buy opens at the ask, but the position is valued at the bid, the price it could be sold at. So it opens a spread behind, and price has to move at least that far in its favour just to break even. The spread is how many brokers are paid.
          </p>
        </>
      }
      formula={['Ask = Bid + Spread', 'Spread cost = Spread in pips × Value per pip (at the position size)', 'Break-even move = Spread (plus commission, if any)']}
      example={
        <p>
          EUR/USD with a bid of 1.1000 and an ask of 1.1002 is a <strong>2-pip spread</strong>. On one standard lot, where a pip is worth $10, buying at the ask opens the trade <strong>$20</strong> behind. If the spread narrows to 0.5 pips, the same trade costs only $5.
        </p>
      }
      faqs={[
        {q: 'What is the bid-ask spread?', a: 'The difference between the highest price buyers are offering (bid) and the lowest price sellers are asking (ask). It is the basic cost of trading a market.'},
        {q: 'Why does a trade start in negative territory?', a: 'A position is valued at the price it could be closed at. A buy is closed at the bid, which is lower than the ask it was opened at, so it starts behind by the spread.'},
        {q: 'Do tighter spreads always mean cheaper trading?', a: 'Not always. Some accounts offer very tight spreads but charge a commission, so the total cost has to be compared, which is why a commission field is included.'},
        {q: 'Why do spreads change?', a: 'Spreads widen when fewer participants are trading, such as outside busy sessions, and around major news releases. They are usually tightest on the most heavily traded pairs during busy hours.'},
      ]}
      learn={[
        {label: 'What are orders?', to: '/library/fundamentals/market-fundamentals'},
        {label: 'Pip value', to: '/tools/pip-value-calculator'},
        {label: 'Glossary', to: '/library/glossary'},
      ]}>
      <SpreadVisualiser />
    </ToolPage>
  );
}
