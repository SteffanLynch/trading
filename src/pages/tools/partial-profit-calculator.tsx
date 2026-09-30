import type {ReactNode} from 'react';
import PartialProfitCalculator from '../../components/calculators/PartialProfitCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="partial-profit-calculator"
      lead="Close a trade in stages and see what it really returned. Half off at 1R, a quarter at 2R and a quarter at 4R adds up to a single blended result."
      meaning={
        <>
          <p>
            Taking partial profits means closing part of a position at one target and leaving the rest to run toward another. It is often described in <strong>R multiples</strong>, where 1R is the amount risked: a winner that makes twice the risk is +2R.
          </p>
          <p>
            Each stage contributes its share of the position multiplied by its result. Adding the stages gives the return of the whole trade, which is often not what the headline numbers suggest.
          </p>
        </>
      }
      formula={['Stage result = Share of position × R at that target', 'Trade result = Sum of the stage results', 'Example: 50% × 1R + 25% × 2R + 25% × 4R = 0.5R + 0.5R + 1R = +2R']}
      example={
        <p>
          A trade risks $100 (1R). Half the position closes at 1R (+$50 of the total), a quarter at 2R (+$50) and the final quarter at 4R (+$100). The trade returned <strong>+2R, or +$200</strong>: more than the +1R of closing everything at the first target, and less than the +4R of a full runner.
        </p>
      }
      faqs={[
        {q: 'What does taking partial profits mean?', a: 'It means closing only part of a position at a profit target and keeping the rest open, either to reach a further target or with the stop moved to protect the gain.'},
        {q: 'What is an R multiple?', a: 'R is the amount risked on a trade, the distance from entry to stop. A result of +2R means the trade made twice what was risked; −1R means the full risk was lost.'},
        {q: 'Does scaling out improve results?', a: 'Not automatically. It reduces the result of a trade that runs all the way, and it can reduce the damage when a trade reverses after the first target. Whether it helps depends on how price behaves after each target, which is best judged from many trades.'},
        {q: 'What happens to the part of the position not allocated?', a: 'The calculator assumes it ends at a result you choose: break-even by default, or a full stop-out at −1R. This lets the effect of a stage that never gets closed be tested.'},
      ]}
      learn={[
        {label: 'Risk to reward', to: '/library/fundamentals/risk-management#risk-to-reward-r'},
        {label: 'Take profit', to: '/library/fundamentals/risk-management#take-profit'},
        {label: 'Positive expectancy', to: '/library/fundamentals/what-is-trading#positive-expectancy'},
      ]}>
      <PartialProfitCalculator />
    </ToolPage>
  );
}
