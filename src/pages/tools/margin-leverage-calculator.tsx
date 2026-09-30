import type {ReactNode} from 'react';
import MarginLeverageCalculator from '../../components/calculators/MarginLeverageCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="margin-leverage-calculator"
      lead="How much of your money does a position lock up, and how hard does a market move hit your account? Enter a position value and your leverage."
      meaning={
        <>
          <p>
            <strong>Margin</strong> is the deposit your broker holds while a trade is open. It is not a cost and you get it back when the trade closes. It is set by the position’s value and the leverage your broker allows: at 20:1 you
            need one twentieth of the position value as margin.
          </p>
          <p>
            <strong>Effective leverage</strong> is a different thing: your position value divided by your account equity. It tells you how sensitive your account really is. Ten times leverage means a 1% market move changes your
            account by about 10%.
          </p>
        </>
      }
      formula={['Margin required = Position value ÷ Leverage', 'Effective leverage = Position value ÷ Account equity', 'Free margin = Equity − Margin required', 'Largest position = Equity × Leverage']}
      example={
        <p>
          A position worth $100,000 at 20:1 leverage needs 100,000 ÷ 20 = <strong>$5,000</strong> of margin. On a $10,000 account that is 10× effective leverage: a 1% move against you loses $1,000, which is 10% of the account, and
          $5,000 of free margin remains.
        </p>
      }
      faqs={[
        {q: 'How is margin calculated?', a: 'Divide the full value of the position by your leverage. A $50,000 position at 30:1 needs about $1,667 of margin.'},
        {q: 'Does higher leverage mean more risk?', a: 'Leverage on its own only changes how much margin you must post. Your risk comes from position size and stop distance. But high leverage makes it easy to open a position that is large relative to your account, and effective leverage is what determines how much a price move hurts.'},
        {q: 'What leverage is available?', a: 'It depends on your broker and jurisdiction. Retail traders in the UK and EU are typically limited to 30:1 on major currency pairs, with lower limits on other instruments. Check your broker’s terms.'},
        {q: 'What is a margin call?', a: 'A warning from your broker when your equity falls too close to the margin your positions require, often followed by automatic closing of positions (a stop-out). The exact levels are set by the broker and are not modelled here.'},
      ]}
      learn={[
        {label: 'Leverage', to: '/library/fundamentals/risk-management#leverage'},
        {label: 'Margin', to: '/library/fundamentals/risk-management#margin'},
        {label: 'Glossary', to: '/library/glossary'},
      ]}>
      <MarginLeverageCalculator />
    </ToolPage>
  );
}
