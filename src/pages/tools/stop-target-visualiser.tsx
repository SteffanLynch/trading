import type {ReactNode} from 'react';
import StopTargetVisualiser from '../../components/calculators/StopTargetVisualiser';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="stop-target-visualiser"
      lead="Grab the entry, the stop loss and the take profit on the chart and drag them. The distance, the money at risk, the potential reward and the risk-to-reward ratio follow every movement."
      meaning={
        <>
          <p>
            Every trade is three prices: where to get in (entry), where to get out if wrong (stop loss) and where to take profit (target). The gaps between them decide how much can be lost, how much can be won and how often the trade must succeed to be worth taking.
          </p>
          <p>
            Dragging the lines makes that relationship physical. Move the stop further away and the risk grows. Move the target further away and the reward grows, but it becomes less likely to be reached. The ratio between the two is the <strong>risk-to-reward</strong>.
          </p>
        </>
      }
      formula={['Risk = |Entry − Stop| × Position size', 'Reward = |Target − Entry| × Position size', 'Risk : reward = Reward ÷ Risk']}
      example={
        <p>
          A 0.20-lot buy of EUR/USD at 1.1650 with a stop at 1.1600 and a target at 1.1750. The stop is 50 pips away: 50 × $2 per pip = <strong>$100 at risk</strong>. The target is 100 pips away: <strong>$200 of potential reward</strong>. The ratio is <strong>1 : 2</strong>. Drag the target up to 1.1800 and the reward becomes $300, a ratio of 1 : 3.
        </p>
      }
      faqs={[
        {q: 'What is the difference between a stop loss and a take profit?', a: 'A stop loss closes a trade at a loss to limit damage when price moves against it. A take profit closes a trade at a profit when price reaches a chosen level. Together with the entry they define the whole trade plan.'},
        {q: 'Where should a stop loss be placed?', a: 'Traders commonly place it beyond a level that would show the trade idea was wrong, such as beyond a swing low for a long trade, rather than at a random distance. The position size is then set so that being stopped out costs only the intended amount.'},
        {q: 'Does a bigger risk-to-reward ratio always make a trade better?', a: 'No. A more distant target is reached less often. The ratio only matters together with how often the trade wins, which is why the break-even win rate is shown alongside it.'},
        {q: 'Why does the position size stay fixed in this tool?', a: 'Holding the size constant isolates the effect of the lines: only the distances change. To work out the size that matches a chosen risk, the Trade Planner and Position Size calculator do the reverse.'},
      ]}
      learn={[
        {label: 'Stop loss', to: '/library/fundamentals/risk-management#stop-loss'},
        {label: 'Risk management', to: '/library/fundamentals/risk-management'},
        {label: 'Trading rules', to: '/library/strategy/rules'},
      ]}>
      <StopTargetVisualiser />
    </ToolPage>
  );
}
