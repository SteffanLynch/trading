export type LibraryItem = {
  title: string;
  description: string;
  href: string;
  section: 'Orientation' | 'Fundamentals' | 'Strategy' | 'Reference';
  number?: string;
  keywords: string;
};

export const library: LibraryItem[] = [
  {title: 'Trading Notes', description: 'Philosophy, curriculum and how to use this library.', href: '/library/', section: 'Orientation', keywords: 'start curriculum philosophy probability'},
  {title: 'My Trading Manifesto', description: 'The principles to read before every trading session.', href: '/library/manifesto', section: 'Orientation', keywords: 'discipline process emotions risk commitment'},
  {title: 'What is Trading?', description: 'Probability, expectancy and the real nature of the game.', href: '/library/fundamentals/what-is-trading', section: 'Fundamentals', number: '01', keywords: 'probability edge expectancy prediction'},
  {title: 'Market Fundamentals', description: 'How orders, liquidity and the matching engine move price.', href: '/library/fundamentals/market-fundamentals', section: 'Fundamentals', number: '02', keywords: 'order book market limit liquidity'},
  {title: 'Market Nature', description: 'Expansion, contraction, cycles and fractal behaviour.', href: '/library/fundamentals/market-nature', section: 'Fundamentals', number: '03', keywords: 'cycle fractal expansion contraction'},
  {title: 'Market Structure', description: 'Read trends, breaks of structure and changes of character.', href: '/library/fundamentals/market-structure', section: 'Fundamentals', number: '04', keywords: 'BOS ChoCh trend highs lows'},
  {title: 'Timeframes', description: 'Use higher timeframes for context and lower ones for detail.', href: '/library/fundamentals/timeframes', section: 'Fundamentals', number: '05', keywords: 'timeframe multi time frame ocean'},
  {title: 'Support and Resistance', description: 'Find the floors and ceilings that frame price.', href: '/library/fundamentals/support-and-resistance', section: 'Fundamentals', number: '06', keywords: 'support resistance levels zones'},
  {title: 'Candlesticks', description: 'Read agreement, rejection and confirmation in each candle.', href: '/library/fundamentals/candlesticks', section: 'Fundamentals', number: '07', keywords: 'candle doji pinbar engulfing wick'},
  {title: 'Risk Management', description: 'Position sizing, stop losses and protecting capital.', href: '/library/fundamentals/risk-management', section: 'Fundamentals', number: '08', keywords: 'risk lot size pips leverage stop loss'},
  {title: 'Trading Psychology', description: 'Manage emotion and judge the process, not the outcome.', href: '/library/fundamentals/trading-psychology', section: 'Fundamentals', number: '09', keywords: 'psychology fear greed hope frustration discipline'},
  {title: 'What is a Trading Plan?', description: 'Turn an approach into a repeatable decision system.', href: '/library/strategy/what-is-a-trading-plan', section: 'Strategy', keywords: 'plan system setup checklist'},
  {title: 'Trading Rules', description: 'The non-negotiable checks for risk, entry and review.', href: '/library/strategy/rules', section: 'Strategy', keywords: 'rules checklist correlated trades journal'},
  {title: 'My Supply and Demand Strategy', description: 'The complete push, pause, continuation playbook.', href: '/library/strategy/supply-and-demand/', section: 'Strategy', keywords: 'supply demand indecision zone pause continuation'},
  {title: 'Behind the Candles', description: 'The auction story underneath the visible price action.', href: '/library/strategy/supply-and-demand/behind-the-candles', section: 'Strategy', keywords: 'candles buyers sellers orders auction'},
  {title: 'Simple Sell Example', description: 'A clean supply-zone sell, annotated from context to result.', href: '/library/strategy/supply-and-demand/examples/simple-sell-example', section: 'Strategy', keywords: 'sell example supply chart'},
  {title: 'Back to Back Opposite Trades', description: 'Two valid opposing trades inside a ranging market.', href: '/library/strategy/supply-and-demand/examples/back-to-back-opposite-example', section: 'Strategy', keywords: 'buy sell range example chart'},
  {title: 'Triple Top Sell Example', description: 'A high-confluence reversal from repeated resistance.', href: '/library/strategy/supply-and-demand/examples/triple-top-sell-example', section: 'Strategy', keywords: 'triple top sell resistance chart'},
  {title: 'Glossary', description: 'A quick reference for the language of trading.', href: '/library/glossary', section: 'Reference', keywords: 'definitions terms reference pips liquidity leverage'},
];
