import type {ReactNode} from 'react';
import BreakEvenWinRateCalculator from '../../components/calculators/BreakEvenWinRateCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="break-even-win-rate-calculator"
      lead="How often do you need to win to break even? It depends entirely on your risk-to-reward. Choose a ratio to find the win rate, or a win rate to find the ratio."
      meaning={
        <>
          <p>
            Win rate alone tells you almost nothing. A strategy that wins 70% of the time can lose money if its losers are much bigger than its winners, and one that wins only 35% can be profitable if its winners are large enough.
          </p>
          <p>
            The break-even win rate is the point where wins and losses exactly cancel out. Above it you are making money on average; below it you are losing. This figure ignores costs, which move the line against you.
          </p>
        </>
      }
      formula={['Break-even win rate = 1 ÷ (1 + R)', 'Required R = (1 − Win rate) ÷ Win rate', 'At 1 : 1  →  50%   ·   1 : 2  →  33.3%   ·   1 : 3  →  25%']}
      example={
        <p>
          With a 1 : 2 risk-to-reward, win rate needed = 1 ÷ (1 + 2) = <strong>33.3%</strong>. Take 100 trades: 34 winners at +2 and 66 losers at −1 is +68 − 66 = +2 units, so just above break-even. In reverse, a 40% win rate needs
          (1 − 0.4) ÷ 0.4 = <strong>1.5</strong>, a ratio of 1 : 1.5.
        </p>
      }
      faqs={[
        {q: 'What win rate is needed to be profitable?', a: 'It depends on your risk-to-reward. At 1 : 1 you need to win more than 50% of trades. At 1 : 2 you need more than 33.3%, and at 1 : 3 more than 25%. Costs raise each of these figures.'},
        {q: 'Is a high win rate always better?', a: 'No. Win rate and reward-to-risk trade off against each other. Judging a strategy on win rate alone can hide a losing system, which is why expectancy looks at both together.'},
        {q: 'Does this include commissions and spreads?', a: 'No. It is the pure break-even point. In practice your break-even win rate is a little higher once costs are included.'},
      ]}
      learn={[
        {label: 'Positive expectancy', to: '/library/fundamentals/what-is-trading#positive-expectancy'},
        {label: 'Risk to reward (R:R)', to: '/library/fundamentals/risk-management#risk-to-reward-r'},
        {label: 'Trading psychology', to: '/library/fundamentals/trading-psychology'},
      ]}>
      <BreakEvenWinRateCalculator />
    </ToolPage>
  );
}
