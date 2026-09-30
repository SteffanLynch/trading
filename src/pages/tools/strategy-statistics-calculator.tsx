import type {ReactNode} from 'react';
import StrategyStatisticsCalculator from '../../components/calculators/StrategyStatisticsCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="strategy-statistics-calculator"
      lead="Is a strategy actually working? Enter the number of winners and losers and the average win and loss to see win rate, expectancy, profit factor and more."
      meaning={
        <>
          <p>
            A strategy is judged by what a large set of trades added up to, not by any single trade. The key numbers are the <strong>win rate</strong>, the <strong>average win and loss</strong>, and the <strong>expectancy</strong>: what the average trade was worth.
          </p>
          <p>
            A strategy does not need a high win rate to be profitable. A 40% win rate can work well if the winners are much larger than the losers, and a 70% win rate can lose money if the losers are bigger. The break-even win rate shows where the line sits for the payoff ratio in use.
          </p>
        </>
      }
      formula={['Win rate = Winners ÷ Trades', 'Expectancy = (Net profit) ÷ Trades = Win rate × Average win − Loss rate × Average loss', 'Profit factor = Gross profit ÷ Gross loss']}
      example={
        <p>
          100 trades: 45 winners averaging $200 and 55 losers averaging $100. Gross profit is $9,000, gross loss is $5,500, so net profit is $3,500. Expectancy = <strong>+$35 per trade</strong>, the profit factor is <strong>1.64</strong>, and the win rate of 45% sits comfortably above the 33.3% needed at a 2 : 1 payoff.
        </p>
      }
      faqs={[
        {q: 'What is a good win rate in trading?', a: 'There is no single good figure. What matters is the win rate together with the average win and loss. The break-even win rate shows the minimum for a given payoff ratio.'},
        {q: 'What is expectancy?', a: 'The average result per trade over a sample, found by dividing the total profit by the number of trades. A positive figure means the sample made money on average.'},
        {q: 'What is profit factor?', a: 'Gross profit divided by gross loss. A value above 1 means the winners outweighed the losers; below 1 means the opposite.'},
        {q: 'How many trades are needed for the numbers to mean anything?', a: 'The more the better. Small samples are easily distorted by luck, so figures from a few dozen trades should be treated with caution and confirmed over a larger sample.'},
      ]}
      learn={[
        {label: 'Positive expectancy', to: '/library/fundamentals/what-is-trading#positive-expectancy'},
        {label: 'Expectancy calculator', to: '/tools/expectancy-calculator'},
        {label: 'Trading plan', to: '/library/strategy/what-is-a-trading-plan'},
      ]}>
      <StrategyStatisticsCalculator />
    </ToolPage>
  );
}
