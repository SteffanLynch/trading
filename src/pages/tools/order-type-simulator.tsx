import type {ReactNode} from 'react';
import OrderTypeSimulator from '../../components/calculators/OrderTypeSimulator';
import ToolPage from '../../components/calculators/ToolPage';

export default function Page(): ReactNode {
  return (
    <ToolPage
      slug="order-type-simulator"
      lead="Place market, limit, stop and stop-limit orders on a practice market, move the price and watch exactly when each one fills."
      meaning={
        <>
          <p>
            An order is an instruction to the market. <strong>Market</strong> orders fill immediately at the best price available. <strong>Limit</strong> orders wait for a better price than the current one. <strong>Stop</strong> orders wait for a worse price, then fire as a market order. <strong>Stop-limit</strong> orders combine the two.
          </p>
          <p>
            The placement rules are easy to forget and easy to see here: a buy limit sits below the current price, a buy stop above it. Watching price travel to each line makes the differences obvious, including why a stop can fill at a worse price in a fast market and why a limit order can stay unfilled.
          </p>
        </>
      }
      formula={['Buy limit: fills when price falls to the order price or lower', 'Sell limit: fills when price rises to the order price or higher', 'Buy stop: becomes a market buy when price rises to the order price', 'Sell stop: becomes a market sell when price falls to the order price']}
      example={
        <p>
          With the market at 1.1050, a <strong>buy limit at 1.1000</strong> waits. As price falls 1.1030, 1.1010, 1.1000, the order fills at 1.1000. A <strong>buy stop at 1.1100</strong> does the opposite: it waits above, then buys as price breaks upward, and in a sudden jump it fills at whatever price is reached, which can be worse.
        </p>
      }
      faqs={[
        {q: 'What is the difference between a limit order and a stop order?', a: 'A limit order sets the best price to accept and waits for the market to come to it. A stop order waits for the market to reach a level and then trades at the next available price. Limits protect the price; stops protect the entry or exit.'},
        {q: 'Why can a limit order remain unfilled?', a: 'Price may never reach the level, or it may touch it without enough trading volume to fill the order. A limit order gives price control in exchange for no guarantee of execution.'},
        {q: 'What is slippage?', a: 'The difference between the price an order was expected to fill at and the price it actually filled at. It is most common with stop and market orders in fast-moving markets.'},
        {q: 'What is a stop-limit order?', a: 'An order with two prices. When the stop price is touched, it becomes a limit order at the limit price. It avoids bad fills but can be triggered and still never fill.'},
      ]}
      learn={[
        {label: 'Types of orders', to: '/library/fundamentals/market-fundamentals#types-of-orders'},
        {label: 'Market fundamentals', to: '/library/fundamentals/market-fundamentals'},
        {label: 'Stop loss', to: '/library/fundamentals/risk-management#stop-loss'},
      ]}>
      <OrderTypeSimulator />
    </ToolPage>
  );
}
