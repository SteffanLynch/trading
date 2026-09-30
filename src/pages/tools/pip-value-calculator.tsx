import type {ReactNode} from 'react';
import PipValueCalculator from '../../components/calculators/PipValueCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="pip-value-calculator"
      lead="How much is one pip worth for your trade? Pick a pair, a position size and your account currency and get the answer straight away, for standard, mini and micro lots."
      meaning={
        <>
          <p>
            A pip is the standard unit for measuring price movement in forex, usually the fourth decimal place (0.0001), or the second decimal (0.01) for pairs quoted in Japanese yen. The <strong>pip value</strong> is how much
            money you gain or lose every time price moves one pip.
          </p>
          <p>
            It depends on three things: the size of your position, the pip size of the pair, and the currency your account is held in. Once you know it, you can turn any distance in pips straight into money.
          </p>
        </>
      }
      formula={[
        'Pip value (quote currency) = Position size in units × Pip size',
        'Pip value (account currency) = Pip value (quote currency) × Conversion rate',
        'EUR/USD, 100,000 units: 100,000 × 0.0001 = $10 per pip',
      ]}
      example={
        <>
          <p>
            A full 1.00-lot position in EUR/USD on a USD account is 100,000 units. Each pip is 0.0001, so one pip is worth 100,000 × 0.0001 = <strong>$10</strong>. A 0.10-lot position is worth $1 per pip and a 0.01-lot position
            10 cents.
          </p>
          <p>
            On USD/JPY the pip is 0.01 yen, so 100,000 units earn 1,000 yen per pip. At a price of 150 that is 1,000 ÷ 150 ≈ <strong>$6.67</strong>.
          </p>
        </>
      }
      faqs={[
        {q: 'How do I calculate pip value?', a: 'Multiply your position size in units by the pip size of the pair (0.0001 for most pairs, 0.01 for JPY pairs). That gives the pip value in the pair’s quote currency. Convert it to your account currency if the two differ.'},
        {q: 'How much is one pip worth on a standard lot?', a: 'For any pair whose quote currency is your account currency, a standard lot of 100,000 units is worth 10 units of that currency per pip: $10 on a USD account trading EUR/USD. Mini lots are worth a tenth of that and micro lots a hundredth.'},
        {q: 'Why does pip value change on some pairs?', a: 'When the quote currency is not your account currency, pip value is converted at the current exchange rate, so it drifts as that rate moves. That is why USD/JPY on a USD account is worth about $6–7 per pip per lot rather than exactly $10.'},
        {q: 'Does my broker use the same pip value?', a: 'Usually, but not always. Some brokers use a different contract size for certain instruments. Check your platform’s contract specification and use the Contract size option here if it differs.'},
      ]}
      learn={[
        {label: 'Pips explained', to: '/library/fundamentals/risk-management#pips'},
        {label: 'Lots and contract sizes', to: '/library/fundamentals/risk-management#lots'},
        {label: 'Glossary', to: '/library/glossary'},
      ]}>
      <PipValueCalculator />
    </ToolPage>
  );
}
