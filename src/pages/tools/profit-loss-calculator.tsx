import type {ReactNode} from 'react';
import ProfitLossCalculator from '../../components/calculators/ProfitLossCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="profit-loss-calculator"
      lead="Enter your entry, exit, size and costs and see your net profit or loss — in money, in pips and as a percentage of your account."
      meaning={
        <>
          <p>
            Profit and loss is the price difference between where you got in and where you got out, multiplied by the size of the position. For a buy, price rising is profit; for a sell, price falling is profit.
          </p>
          <p>
            Costs matter more than they look. Commission, spread and fees come straight off the result, so a small win can end up a loss once they are included. Enter them and the calculator shows the net figure.
          </p>
        </>
      }
      formula={['Long: P&L = (Exit − Entry) × Units × Conversion rate', 'Short: P&L = (Entry − Exit) × Units × Conversion rate', 'Net P&L = Gross P&L − Costs', 'Return on account = Net P&L ÷ Account balance']}
      example={
        <>
          <p>
            Buy 0.2 lots (20,000 units) of EUR/USD at 1.1650 and sell at 1.1750 on a $10,000 USD account. The price rose 0.0100 (100 pips), so gross P&L = 0.0100 × 20,000 = <strong>$200</strong>.
          </p>
          <p>With $8 of commission the net result is $192, which is a 1.92% return on the account.</p>
        </>
      }
      faqs={[
        {q: 'How do I calculate profit and loss on a forex trade?', a: 'Take the difference between exit and entry (reversed for a short), multiply by the position size in units, and convert the result to your account currency if it differs from the pair’s quote currency. Then subtract costs.'},
        {q: 'Does this work for stocks and crypto?', a: 'Yes. Choose “Stocks, crypto & other”, enter the number of shares or coins as units, and the maths is the same. For futures, set the contract multiplier under Advanced options.'},
        {q: 'What are units and lots?', a: 'A unit is one unit of the base currency. A standard forex lot is 100,000 units, so 0.5 lots is 50,000 units.'},
      ]}
      learn={[
        {label: 'Lots and contracts', to: '/library/fundamentals/risk-management#lots'},
        {label: 'Notional value', to: '/library/fundamentals/risk-management#notional-value'},
        {label: 'Glossary', to: '/library/glossary'},
      ]}>
      <ProfitLossCalculator />
    </ToolPage>
  );
}
