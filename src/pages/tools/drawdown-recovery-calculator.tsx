import type {ReactNode} from 'react';
import DrawdownRecoveryCalculator from '../../components/calculators/DrawdownRecoveryCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="drawdown-recovery-calculator"
      lead="Losses are harder to recover than they look. Slide the size of a loss and see the gain you need just to get back to where you started."
      meaning={
        <>
          <p>
            After a loss you are trading with a smaller balance, so getting back to the old level takes a bigger percentage gain than the percentage you lost. Lose 10% and you need 11.1%. Lose 50% and you need 100%.
          </p>
          <p>
            The relationship is not a straight line: it climbs steeply as the loss grows. That is the mathematical case for protecting your capital first and chasing profit second.
          </p>
        </>
      }
      formula={['Gain needed = 1 ÷ (1 − Loss) − 1', 'Loss of 20%:  1 ÷ 0.80 − 1 = 25%', 'Loss of 50%:  1 ÷ 0.50 − 1 = 100%']}
      example={
        <p>
          A $10,000 account falls 20% to $8,000. To get back to $10,000 you must make $2,000 on an $8,000 balance, which is <strong>25%</strong>, not 20%. If it had fallen 50% to $5,000, you would need to <em>double</em> it (a 100%
          gain) just to break even.
        </p>
      }
      extra={[
        {
          title: 'Why this matters for risk per trade',
          content: (
            <p>
              Risking 1% per trade, ten losses in a row leave you about 9.6% down and needing about a 10.6% gain to recover. Risking 10% per trade, the same ten losses leave you about 65% down and needing roughly a 187% gain. Small
              risk keeps recovery realistic.
            </p>
          ),
        },
      ]}
      faqs={[
        {q: 'How do I calculate the gain needed to recover from a loss?', a: 'Divide 1 by the fraction of your balance you have left, then subtract 1. If you have 80% left, 1 ÷ 0.8 − 1 = 25%.'},
        {q: 'Why is recovery bigger than the loss?', a: 'Because the percentage gain is applied to a smaller balance. A 50% loss leaves half your money, so you need to double what is left.'},
        {q: 'Is a 100% loss recoverable?', a: 'No. If the balance reaches zero there is nothing left to grow, which is why the calculator stops at 90%.'},
      ]}
      learn={[
        {label: 'Risk per trade', to: '/library/fundamentals/risk-management#risk-per-trade'},
        {label: 'Trading psychology', to: '/library/fundamentals/trading-psychology'},
        {label: 'Trading rules', to: '/library/strategy/rules'},
      ]}>
      <DrawdownRecoveryCalculator />
    </ToolPage>
  );
}
