import type {ReactNode} from 'react';
import PipsMoneyConverter from '../../components/calculators/PipsMoneyConverter';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="pips-to-money-converter"
      lead="Turn pips into money, or money into pips. Type in either box and the other updates as you go."
      meaning={
        <>
          <p>
            Traders describe distance in pips but experience it in money. If you know what one pip is worth for your position, converting between the two is simple multiplication or division, and it answers questions like{' '}
            <em>“how many pips can I afford to lose?”</em> or <em>“what is 35 pips worth to me?”</em>.
          </p>
          <p>
            The converter needs your pip value. If you do not know it, the Pip Value calculator works it out from your pair, size and account currency.
          </p>
        </>
      }
      formula={['Money = Pips × Pip value', 'Pips = Money ÷ Pip value']}
      example={
        <p>
          With a pip value of $10 (one standard lot of EUR/USD), 50 pips is 50 × $10 = <strong>$500</strong>. Going the other way, a $250 loss at $10 per pip is 250 ÷ 10 = <strong>25 pips</strong>. If your pip value is only $2, the
          same $250 covers 125 pips.
        </p>
      }
      faqs={[
        {q: 'How do I convert pips to money?', a: 'Multiply the number of pips by the value of one pip for your position size. With a $10 pip value, 30 pips is $300.'},
        {q: 'How do I convert money to pips?', a: 'Divide the amount of money by your pip value. $150 at $5 per pip is 30 pips.'},
        {q: 'Can I enter a negative number?', a: 'Yes. Use a minus sign for a loss and the converter will show the equivalent pips or money as a negative.'},
      ]}
      learn={[
        {label: 'Pips explained', to: '/library/fundamentals/risk-management#pips'},
        {label: 'Risk management', to: '/library/fundamentals/risk-management'},
      ]}>
      <PipsMoneyConverter />
    </ToolPage>
  );
}
