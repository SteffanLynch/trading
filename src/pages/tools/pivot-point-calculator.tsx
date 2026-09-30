import type {ReactNode} from 'react';
import PivotPointCalculator from '../../components/calculators/PivotPointCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="pivot-point-calculator"
      lead="Enter the previous period's high, low and close and get a pivot point with support and resistance levels, drawn as a ladder."
      meaning={
        <>
          <p>
            Pivot points are reference levels built from the previous period's price range. The central <strong>pivot</strong> is an average of the high, low and close. <strong>Resistance</strong> levels (R1, R2, R3) sit above it and <strong>support</strong> levels (S1, S2, S3) below it.
          </p>
          <p>
            They are calculated from past prices and are watched by many traders, so they can act as levels where price pauses. They are references, not predictions, and price is free to ignore every one of them.
          </p>
        </>
      }
      formula={['Pivot (P) = (High + Low + Close) ÷ 3', 'R1 = 2 × P − Low      S1 = 2 × P − High', 'R2 = P + (High − Low)      S2 = P − (High − Low)', 'R3 = High + 2 × (P − Low)      S3 = Low − 2 × (High − P)']}
      example={
        <p>
          Yesterday's high 1.1100, low 1.0900, close 1.1050. The pivot is (1.1100 + 1.0900 + 1.1050) ÷ 3 = <strong>1.1017</strong>. R1 = 2 × 1.1017 − 1.0900 = <strong>1.1133</strong> and S1 = 2 × 1.1017 − 1.1100 = <strong>1.0933</strong>.
        </p>
      }
      faqs={[
        {q: 'How are pivot points calculated?', a: 'The pivot is the average of the previous high, low and close. The support and resistance levels are then calculated from the pivot and the previous range, using the chosen method.'},
        {q: 'What do R1 and S1 mean?', a: 'R1 is the first resistance level above the pivot and S1 the first support level below it. Higher numbers (R2, R3, S2, S3) sit further away.'},
        {q: 'Which pivot method is best?', a: 'There is no best method. Classic is the most common; Woodie gives the close more weight; Fibonacci and Camarilla use different spacing. The method worth using is the one most other traders watch for the market in question.'},
        {q: 'Which period should the previous range come from?', a: 'The period before the one being traded. Daily pivots use yesterday\'s range; weekly pivots use last week\'s. The same formula applies to any period.'},
      ]}
      learn={[
        {label: 'Support and resistance', to: '/library/fundamentals/support-and-resistance'},
        {label: 'Fibonacci levels', to: '/tools/fibonacci-calculator'},
        {label: 'Timeframes', to: '/library/fundamentals/timeframes'},
      ]}>
      <PivotPointCalculator />
    </ToolPage>
  );
}
