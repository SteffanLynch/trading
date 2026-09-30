import type {ReactNode} from 'react';
import RiskRewardCalculator from '../../components/calculators/RiskRewardCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="risk-reward-calculator"
      lead="Enter your entry, stop loss and target to see your risk-to-reward ratio — and how often you would need to win for the trade to pay."
      meaning={
        <>
          <p>
            Risk-to-reward compares what you stand to lose with what you stand to make. Risking 50 pips to make 100 is a ratio of <strong>1 : 2</strong>: for every 1 you risk, you aim to make 2.
          </p>
          <p>
            It matters because it sets the win rate you need. The bigger your winners are compared with your losers, the less often you have to be right. That is why win rate on its own says very little about a strategy.
          </p>
        </>
      }
      formula={['Risk = |Entry − Stop|', 'Reward = |Target − Entry|', 'Risk : reward = Reward ÷ Risk', 'Break-even win rate = 1 ÷ (1 + Risk : reward)']}
      example={
        <p>
          Buy at 1.1650, stop at 1.1600, target at 1.1750. Risk = 50 pips and reward = 100 pips, so the ratio is <strong>1 : 2</strong>. You would need to win more than one trade in three (33.3%) to break even before costs, and
          anything above that is profit.
        </p>
      }
      faqs={[
        {q: 'What is a good risk-to-reward ratio?', a: 'There is no single answer, because it works together with your win rate. Many traders look for at least 1 : 1.5 or 1 : 2 so that they can be wrong more often than they are right and still come out ahead. A higher ratio usually means a lower win rate.'},
        {q: 'How do I calculate risk-to-reward for a short trade?', a: 'The same way, using absolute distances: risk is the distance from entry up to your stop, and reward is the distance from entry down to your target. The calculator detects the direction from where your stop and target sit.'},
        {q: 'Does risk-to-reward include the spread?', a: 'No. It uses the prices you enter. Spreads and commissions make your real risk slightly larger and your real reward slightly smaller, so leave a margin.'},
      ]}
      learn={[
        {label: 'Risk to reward (R:R)', to: '/library/fundamentals/risk-management#risk-to-reward-r'},
        {label: 'Positive expectancy', to: '/library/fundamentals/what-is-trading#positive-expectancy'},
        {label: 'Trading rules', to: '/library/strategy/rules'},
      ]}>
      <RiskRewardCalculator />
    </ToolPage>
  );
}
