import type {ReactNode} from 'react';
import CompoundGrowthCalculator from '../../components/calculators/CompoundGrowthCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="compound-growth-calculator"
      lead="See how a steady return compounds into a growing balance over months, years or trades. It is an illustration of the arithmetic, not a prediction of what markets will do."
      meaning={
        <>
          <p>
            Compounding means each period’s return is earned on the balance <em>including</em> earlier returns. Growth starts slowly and accelerates, which is why the compounded line curves away from the straight “no compounding”
            line on the chart.
          </p>
          <p>
            The maths cuts both ways: a run of losses compounds too. And real trading returns are never a smooth percentage every period, so treat this as a way to understand the shape of growth, not a forecast.
          </p>
        </>
      }
      formula={['Final balance = Start × (1 + r)^n', 'With deposits: Balance(n) = Balance(n − 1) × (1 + r) + Deposit', 'Time to double = ln(2) ÷ ln(1 + r)']}
      example={
        <p>
          $10,000 growing at 2% a month for 24 months becomes 10,000 × 1.02<sup>24</sup> ≈ <strong>$16,084</strong>, a gain of about $6,084. Without compounding, the same 2% a month would only add $200 a month, ending at $14,800. The
          difference is the interest earned on interest.
        </p>
      }
      faqs={[
        {q: 'How do I calculate compound growth?', a: 'Multiply your starting balance by (1 + the return per period) raised to the number of periods. This calculator does that and also plots each period so you can see the curve.'},
        {q: 'Is this a prediction of my trading returns?', a: 'No. It shows what a constant return would produce mathematically. Actual results vary from period to period, can be negative, and are never guaranteed.'},
        {q: 'What does “per trade” mean?', a: 'If you risk a fixed percentage and average a certain return per trade, you can treat each trade as a period. Be conservative: a small average return per trade compounds over many trades, but so does a small average loss.'},
      ]}
      learn={[
        {label: 'Drawdown recovery', to: '/tools/drawdown-recovery-calculator'},
        {label: 'Risk management', to: '/library/fundamentals/risk-management'},
        {label: 'Trading psychology', to: '/library/fundamentals/trading-psychology'},
      ]}>
      <CompoundGrowthCalculator />
    </ToolPage>
  );
}
