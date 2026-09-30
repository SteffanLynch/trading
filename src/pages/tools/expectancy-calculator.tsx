import type {ReactNode} from 'react';
import ExpectancyCalculator from '../../components/calculators/ExpectancyCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="expectancy-calculator"
      lead="Turn your win rate and the size of your average win and loss into one number: what a typical trade has been worth to you."
      meaning={
        <>
          <p>
            Expectancy is the average result per trade over a large sample. Positive expectancy means the strategy has made money on average; negative means it has lost. It combines <strong>how often</strong> you win with{' '}
            <strong>how much</strong> you win and lose, which is why it is more useful than win rate alone.
          </p>
          <p>
            Measuring in <strong>R</strong> (multiples of the amount you risk per trade) lets you compare strategies regardless of account size. An expectancy of +0.35R means the average trade returned 0.35 times your normal risk.
          </p>
          <p>
            It describes the past. It does not promise future results, and it needs a decent sample to mean much: a handful of trades can look great or awful by chance.
          </p>
        </>
      }
      formula={['Expectancy = (Win rate × Average win) − (Loss rate × Average loss)', 'Loss rate = 1 − Win rate', 'Profit factor = (Win rate × Average win) ÷ (Loss rate × Average loss)']}
      example={
        <>
          <p>
            45% winners averaging <strong>2R</strong> and 55% losers averaging <strong>1R</strong>: expectancy = 0.45 × 2 − 0.55 × 1 = <strong>+0.35R per trade</strong>.
          </p>
          <p>
            In money, a 40% win rate with a $300 average win and a $100 average loss gives 0.4 × 300 − 0.6 × 100 = <strong>+$60 per trade</strong>, a profitable system despite losing more often than it wins.
          </p>
        </>
      }
      faqs={[
        {q: 'What is trading expectancy?', a: 'The average amount you expect to make or lose per trade, calculated from your win rate and the average size of your winners and losers. It can be expressed in money or in R multiples.'},
        {q: 'What is a good expectancy?', a: 'Any positive number means the sample made money on average, but how good it is depends on sample size, costs and consistency. Larger samples give more reliable numbers.'},
        {q: 'Should the average loss be entered as a negative number?', a: 'No. Enter it as a positive number: the calculator subtracts it for you.'},
        {q: 'What is the difference between expectancy and profit factor?', a: 'Expectancy is the average result per trade. Profit factor is total winnings divided by total losses. A profit factor above 1 means the winners outweigh the losers.'},
      ]}
      learn={[
        {label: 'Positive expectancy', to: '/library/fundamentals/what-is-trading#positive-expectancy'},
        {label: 'What is a trading plan?', to: '/library/strategy/what-is-a-trading-plan'},
        {label: 'Trading psychology', to: '/library/fundamentals/trading-psychology'},
      ]}>
      <ExpectancyCalculator />
    </ToolPage>
  );
}
