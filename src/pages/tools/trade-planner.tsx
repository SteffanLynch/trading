import type {ReactNode} from 'react';
import ToolPage from '../../components/calculators/ToolPage';
import TradePlanner from '../../components/calculators/TradePlanner';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="trade-planner"
      lead="Plan one trade in one place. Enter your account, entry, stop and target and see the position size, the money you risk, the money you could make and the risk-to-reward — then drag the stop and target to adjust."
      meaning={
        <>
          <p>
            A trade plan turns an idea into numbers before any money is at risk. The planner answers the questions every trade should answer first: <strong>how much am I risking, how big should the position be, what do I stand to
            make, and is the reward worth the risk?</strong>
          </p>
          <p>
            Instead of opening several separate calculators, everything is calculated together from a single set of inputs, so changing your stop immediately changes the position size, the profit at target and the risk-to-reward.
          </p>
        </>
      }
      formula={[
        'Risk amount = Account balance × Risk %',
        'Position size = Risk amount ÷ (Stop distance × Conversion rate)',
        'Potential profit = Position size × Target distance × Conversion rate',
        'Risk : reward = Target distance ÷ Stop distance',
        'Break-even win rate = 1 ÷ (1 + Risk : reward)',
      ]}
      example={
        <>
          <p>
            A $10,000 account, 1% risk, buying EUR/USD at 1.1650 with a stop at 1.1600 and a target at 1.1750.
          </p>
          <p>
            Risk = <strong>$100</strong>. The stop is 50 pips away, so the position is <strong>0.20 lots</strong>. The target is 100 pips away, worth <strong>$200</strong>: a <strong>1 : 2</strong> risk-to-reward. You lose 1% if
            stopped and gain 2% if the target is hit, and you would need to win just over one trade in three to break even before costs.
          </p>
        </>
      }
      faqs={[
        {
          q: 'What should a trade plan include?',
          a: 'At minimum: the direction, the entry, where you are wrong (the stop), where you will take profit (the target), and how much you are risking. The planner covers all of these and adds the position size and the risk-to-reward that follow from them.',
        },
        {
          q: 'Can I drag the stop and target on the chart?',
          a: 'Yes. Drag either line with a mouse or finger, or focus it and use the arrow keys (hold Shift to move ten pips at a time). The input boxes update as you move, and everything recalculates.',
        },
        {
          q: 'Does it work for shorts?',
          a: 'Yes. Choose Short and the stop must sit above your entry and the target below it. Switching direction mirrors your stop and target around the entry so the trade stays valid.',
        },
        {
          q: 'Can I share a plan?',
          a: 'Use Copy link. The link recreates your exact inputs, so you can send a trade idea to a friend, a mentor or a forum.',
        },
      ]}
      learn={[
        {label: 'What is a trading plan?', to: '/library/strategy/what-is-a-trading-plan'},
        {label: 'Risk management', to: '/library/fundamentals/risk-management'},
        {label: 'Trading rules', to: '/library/strategy/rules'},
      ]}>
      <TradePlanner />
    </ToolPage>
  );
}
