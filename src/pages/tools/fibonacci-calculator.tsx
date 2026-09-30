import type {ReactNode} from 'react';
import FibonacciCalculator from '../../components/calculators/FibonacciCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="fibonacci-calculator"
      lead="Enter a swing high and a swing low and get the Fibonacci retracement and extension levels, drawn on a chart."
      meaning={
        <>
          <p>
            Fibonacci levels divide a price move into ratios. <strong>Retracement</strong> levels (23.6%, 38.2%, 50%, 61.8%, 78.6%) measure how far price could pull back inside the move. <strong>Extension</strong> levels (127.2%, 161.8%, 200%, 261.8%) project the move beyond its end.
          </p>
          <p>
            Some traders watch these prices as places where a pullback might pause or turn. They are reference levels, not predictions: the tool calculates them, and does not imply that price will react to any of them.
          </p>
        </>
      }
      formula={['Range = Swing high − Swing low', 'Retracement (after a rise) = High − Range × ratio', 'Retracement (after a fall) = Low + Range × ratio', 'Extension (after a rise) = Low + Range × ratio']}
      example={
        <p>
          A rise from 1.1000 to 1.1200 is a range of 0.0200. The 61.8% retracement is 1.1200 − 0.0200 × 0.618 = <strong>1.1076</strong> and the 38.2% level is 1.1124. The 161.8% extension projects to 1.1000 + 0.0200 × 1.618 = <strong>1.1324</strong>.
        </p>
      }
      faqs={[
        {q: 'What are Fibonacci retracement levels?', a: 'Horizontal levels drawn between a swing high and swing low at set ratios of the move. They are used as reference points for where a pullback might stop.'},
        {q: 'Do Fibonacci levels work?', a: 'They are widely watched, which is the only reason price might react to them, and their usefulness is debated. They are a tool for choosing levels to watch, not a guarantee that price will respect them.'},
        {q: 'How is a swing measured?', a: 'From one clear swing point to the next: a swing low to the following swing high for a rise, or a swing high to the following swing low for a fall.'},
        {q: 'What is the difference between retracement and extension?', a: 'Retracements lie inside the original move and measure pullbacks. Extensions lie beyond it and are used to project where a continuing move might reach.'},
      ]}
      learn={[
        {label: 'Support and resistance', to: '/library/fundamentals/support-and-resistance'},
        {label: 'Market structure', to: '/library/fundamentals/market-structure'},
        {label: 'Pivot points', to: '/tools/pivot-point-calculator'},
      ]}>
      <FibonacciCalculator />
    </ToolPage>
  );
}
