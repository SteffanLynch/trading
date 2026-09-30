import type {ReactNode} from 'react';
import PositionSizeCalculator from '../../components/calculators/PositionSizeCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="position-size-calculator"
      lead="How big should your trade be if you only want to risk a set amount? Enter your account, your risk and your stop, and get the exact lot size — no calculator button, no sign-up."
      meaning={
        <>
          <p>
            Position sizing is how you decide <strong>how much</strong> to trade. Instead of picking a lot size by feel, you start from the amount of money you are willing to lose if you are wrong, then work backwards from the
            distance to your stop loss.
          </p>
          <p>
            That keeps your loss on every trade roughly the same, whether your stop is 10 pips away or 100. A wider stop simply means a smaller position; a tighter stop allows a larger one. Your risk stays fixed and only the size
            changes.
          </p>
          <p>
            Forex sizes are measured in lots: <strong>1 standard lot = 100,000 units</strong>, 1 mini lot = 10,000 units and 1 micro lot = 1,000 units. A result of 0.18 lots is therefore 18,000 units.
          </p>
        </>
      }
      formula={[
        'Risk amount = Account balance × Risk %',
        'Loss per unit = Stop distance × Conversion rate',
        'Units = Risk amount ÷ Loss per unit',
        'Lots = Units ÷ 100,000   (rounded down to the smallest lot step)',
      ]}
      example={
        <>
          <p>
            A $10,000 account risking 1% on EUR/USD, buying at 1.1650 with a stop at 1.1600.
          </p>
          <p>
            Risk amount = $10,000 × 1% = <strong>$100</strong>. Stop distance = 0.0050, which is 50 pips. Units = $100 ÷ 0.0050 = 20,000, so the position is <strong>0.20 lots</strong>. If the stop is hit you lose $100. If price
            moves 100 pips in your favour you make $200.
          </p>
        </>
      }
      faqs={[
        {
          q: 'How do I calculate position size in forex?',
          a: 'Multiply your account balance by the percentage you are willing to risk to get the money at risk, divide that by the stop-loss distance measured in money per unit, and you have the number of units. Divide by 100,000 for standard lots. This calculator does all three steps and shows the working.',
        },
        {
          q: 'What percentage of my account should I risk per trade?',
          a: 'Many traders risk between 0.5% and 2% of their account on a single trade so that a losing streak does not do lasting damage. There is no universally correct number: it depends on your strategy, your experience and how much drawdown you can tolerate.',
        },
        {
          q: 'Why is my lot size rounded down?',
          a: 'Brokers only accept lot sizes in fixed steps, usually 0.01. Rounding down guarantees the position never risks more than the amount you chose. The calculator shows the exact figure and the money you actually risk at the rounded size.',
        },
        {
          q: 'What if my account currency is different from the pair’s quote currency?',
          a: 'Profit and loss are earned in the quote currency, so the calculator needs an exchange rate to express them in your account currency. It works this out automatically when your account currency is one of the two currencies in the pair, and asks you for the rate otherwise. No live prices are used.',
        },
      ]}
      learn={[
        {label: 'Risk management', to: '/library/fundamentals/risk-management'},
        {label: 'Trading rules', to: '/library/strategy/rules'},
        {label: 'Glossary', to: '/library/glossary'},
      ]}>
      <PositionSizeCalculator />
    </ToolPage>
  );
}
