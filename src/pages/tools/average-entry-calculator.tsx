import type {ReactNode} from 'react';
import AverageEntryCalculator from '../../components/calculators/AverageEntryCalculator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="average-entry-calculator"
      lead="Bought in several parts? Add each entry with its price and quantity and get the true weighted average price and the total position."
      meaning={
        <>
          <p>
            When a position is built in stages, the average entry is not the simple mean of the prices. A larger purchase has a larger pull on the average, so each price has to be weighted by the quantity bought at it.
          </p>
          <p>
            Knowing the true average matters because it is the break-even point of the whole position: price has to get back to it before the trade is profitable.
          </p>
        </>
      }
      formula={['Total cost = Σ (price × quantity)', 'Total quantity = Σ quantity', 'Average entry = Total cost ÷ Total quantity']}
      example={
        <p>
          100 shares bought at £10, then 200 shares at £12. Total cost = £1,000 + £2,400 = £3,400 for 300 shares. The average entry is £3,400 ÷ 300 = <strong>£11.33</strong>, not £11, because twice as many shares were bought at the higher price.
        </p>
      }
      faqs={[
        {q: 'How is average entry price calculated?', a: 'Multiply each price by its quantity, add the results to get the total cost, then divide by the total quantity. This is a weighted average.'},
        {q: 'Why is the average not just the mean of the prices?', a: 'Because the quantities differ. Buying more at one price moves the average toward that price. A plain mean treats every purchase as if it were the same size.'},
        {q: 'What is averaging down?', a: 'Buying more of a position as its price falls, which lowers the average entry. It also increases the size of the position and the total amount at risk, so it is not the same as reducing risk.'},
        {q: 'Does this work for short positions?', a: 'Yes. The average entry is calculated the same way. Adding a current price and choosing Short shows the open profit or loss with the direction reversed.'},
      ]}
      learn={[
        {label: 'Position sizes', to: '/library/fundamentals/risk-management#position-sizes'},
        {label: 'Risk management', to: '/library/fundamentals/risk-management'},
        {label: 'Glossary', to: '/library/glossary'},
      ]}>
      <AverageEntryCalculator />
    </ToolPage>
  );
}
