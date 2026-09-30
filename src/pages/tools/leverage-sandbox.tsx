import type {ReactNode} from 'react';
import LeverageSandbox from '../../components/calculators/LeverageSandbox';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="leverage-sandbox"
      lead="A practice account where leverage runs from 1× to 30×. Move the market and watch what leverage does to the balance."
      meaning={
        <>
          <p>
            Leverage lets an account control a position far larger than its own balance. At 10×, £1,000 controls £10,000. The market then moves the whole £10,000, not just the £1,000, so every percentage move is magnified by the leverage, for profit <strong>and</strong> for loss.
          </p>
          <p>
            That is why the same 1% fall costs 1% of the account at 1× and 10% at 10×. It also means there is a market move that erases the account entirely: 100% divided by the leverage. At 30× that is only a 3.3% move.
          </p>
        </>
      }
      formula={['Exposure = Account × Leverage', 'Profit or loss = Exposure × Market move', 'Move that erases the account = 100% ÷ Leverage']}
      example={
        <p>
          A £1,000 account at 10× controls £10,000. The market falls 1%: the loss is £10,000 × 1% = <strong>£100</strong>, taking the account to £900, a <strong>10% loss</strong>. At 2× the same move costs £20, a 2% loss. At 30× it costs £300, or 30% of the account.
        </p>
      }
      faqs={[
        {q: 'What is leverage in trading?', a: 'Leverage is the ratio between the size of a position and the account money backing it. It lets a trader control a larger position than the balance alone would allow.'},
        {q: 'Does leverage increase profits and losses equally?', a: 'Yes. It magnifies the percentage effect of a market move on the account in both directions. A move that would add 10% at 10× would cost 10% in the opposite direction.'},
        {q: 'Does leverage by itself increase risk?', a: 'Leverage makes it possible to open a position that is very large relative to the account, and the size of the position is what sets the risk. Risk is better controlled by position size and stop distance than by the leverage number.'},
        {q: 'What is a stop-out?', a: 'When losses eat most of an account, brokers automatically close positions to stop the balance going negative. The sandbox ignores this to show the raw effect, but in practice the loss would still be severe.'},
      ]}
      learn={[
        {label: 'Leverage', to: '/library/fundamentals/risk-management#leverage'},
        {label: 'Margin', to: '/library/fundamentals/risk-management#margin'},
        {label: 'Margin & leverage calculator', to: '/tools/margin-leverage-calculator'},
      ]}>
      <LeverageSandbox />
    </ToolPage>
  );
}
