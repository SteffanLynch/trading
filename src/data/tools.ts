export type ToolGroup = 'Plan a trade' | 'Pips & money' | 'Leverage & growth' | 'Edge & statistics' | 'Markets & charts';

export interface ToolMeta {
  slug: string;
  path: string;
  /** Short name used in cards, related links and the calculator header. */
  name: string;
  /** Page H1. */
  heading: string;
  /** <title> text (the site name is appended automatically). */
  metaTitle: string;
  /** Meta description, ~155 characters. */
  description: string;
  /** One line for cards and search. */
  summary: string;
  group: ToolGroup;
  keywords: string;
  /** Hands-on teaching tools (simulators, builders, visualisers) as opposed to plain calculators. */
  interactive?: boolean;
  /** Slugs of related tools, in order. */
  related: string[];
}

const tool = (slug: string, rest: Omit<ToolMeta, 'slug' | 'path'>): ToolMeta => ({slug, path: `/tools/${slug}`, ...rest});

export const tools: ToolMeta[] = [
  tool('trade-planner', {
    name: 'Trade Planner',
    heading: 'Trade Planner',
    metaTitle: 'Trade Planner — Size, Risk & Reward in One Tool',
    description:
      'Plan a trade in one place: enter your account, entry, stop and target to see position size, money at risk, potential profit and risk-to-reward. Free, no sign-up.',
    summary: 'Enter one trade and see size, risk, reward and R:R together. Drag the stop and target on the chart.',
    group: 'Plan a trade',
    keywords: 'trade planner trade plan risk reward position size entry stop target long short',
    related: ['position-size-calculator', 'stop-target-visualiser', 'risk-reward-calculator', 'partial-profit-calculator'],
  }),
  tool('position-size-calculator', {
    name: 'Position Size',
    heading: 'Position Size & Lot Size Calculator',
    metaTitle: 'Free Position Size & Forex Lot Size Calculator',
    description:
      'Work out exactly how many lots or units to trade so a stop-loss costs only what you choose to risk. Free position size and forex lot size calculator with no sign-up.',
    summary: 'How big should your trade be if you only want to risk a set amount? Lots, units and money at risk.',
    group: 'Plan a trade',
    keywords: 'position size lot size calculator forex risk percent stop loss units lots',
    related: ['trade-planner', 'pip-value-calculator', 'risk-reward-calculator', 'margin-leverage-calculator'],
  }),
  tool('pip-value-calculator', {
    name: 'Pip Value',
    heading: 'Pip Value Calculator',
    metaTitle: 'Pip Value Calculator — What Is One Pip Worth?',
    description:
      'Find the value of one pip for any currency pair, position size and account currency. Free forex pip value calculator covering standard, mini and micro lots.',
    summary: 'How much money does one pip move for your position? Any pair, any account currency.',
    group: 'Pips & money',
    keywords: 'pip value calculator forex pip worth lot standard mini micro',
    related: ['pips-to-money-converter', 'spread-visualiser', 'position-size-calculator', 'profit-loss-calculator'],
  }),
  tool('pips-to-money-converter', {
    name: 'Pips ↔ Money',
    heading: 'Pips to Money Converter',
    metaTitle: 'Pips to Money Converter — Free Forex Calculator',
    description:
      'Convert pips into money, or money into pips, using your pip value. Change either box and the other updates instantly. Free forex pips converter.',
    summary: 'Turn pips into money, or money into pips. Change either box and the other follows.',
    group: 'Pips & money',
    keywords: 'pips to money converter pips profit calculator money to pips forex',
    related: ['pip-value-calculator', 'profit-loss-calculator', 'position-size-calculator'],
  }),
  tool('risk-reward-calculator', {
    name: 'Risk : Reward',
    heading: 'Risk-to-Reward Ratio Calculator',
    metaTitle: 'Risk-to-Reward Ratio Calculator — Free R:R Tool',
    description:
      'Calculate the risk-to-reward ratio of a trade from your entry, stop loss and target, and see the win rate you need to break even. Free R:R calculator.',
    summary: 'Entry, stop, target → your risk-to-reward ratio and the win rate it demands.',
    group: 'Plan a trade',
    keywords: 'risk reward ratio calculator r:r rr entry stop target',
    related: ['stop-target-visualiser', 'break-even-win-rate-calculator', 'trade-planner', 'expectancy-calculator'],
  }),
  tool('profit-loss-calculator', {
    name: 'Profit / Loss',
    heading: 'Trading Profit and Loss Calculator',
    metaTitle: 'Profit & Loss Calculator for Forex, Stocks & Crypto',
    description:
      'Calculate profit or loss from entry, exit, size and costs, and see it as a percentage of your account. Free P&L calculator for forex, stocks and crypto.',
    summary: 'Entry, exit, size and costs → net profit or loss, in money and as a % of your account.',
    group: 'Pips & money',
    keywords: 'profit loss calculator pnl trade forex stocks crypto net commission',
    related: ['pips-to-money-converter', 'pip-value-calculator', 'risk-reward-calculator'],
  }),
  tool('margin-leverage-calculator', {
    name: 'Margin & Leverage',
    heading: 'Margin and Leverage Calculator',
    metaTitle: 'Margin & Leverage Calculator — Required Margin',
    description:
      'Calculate the margin a position needs, your free margin and your effective leverage, and see how market moves hit your account. Free margin calculator.',
    summary: 'How much margin does a position lock up, and how hard does a market move hit your account?',
    group: 'Leverage & growth',
    keywords: 'margin calculator leverage calculator required margin free margin effective leverage',
    related: ['leverage-sandbox', 'position-size-calculator', 'drawdown-recovery-calculator', 'trade-planner'],
  }),
  tool('compound-growth-calculator', {
    name: 'Compound Growth',
    heading: 'Compound Growth Calculator',
    metaTitle: 'Compound Growth Calculator for Trading Accounts',
    description:
      'See how an account grows with compounding over months, years or trades, with optional deposits. A free calculator: an illustration, not a prediction.',
    summary: 'See how compounding turns a steady return into a growing balance. An illustration, not a forecast.',
    group: 'Leverage & growth',
    keywords: 'compound growth calculator compounding account growth interest trading returns',
    related: ['drawdown-recovery-calculator', 'expectancy-calculator', 'position-size-calculator'],
  }),
  tool('drawdown-recovery-calculator', {
    name: 'Drawdown Recovery',
    heading: 'Drawdown Recovery Calculator',
    metaTitle: 'Drawdown Recovery Calculator — Gain to Recover',
    description:
      'Find the gain you need to recover from a drawdown. A 50% loss needs a 100% gain. See why protecting capital matters, with a free interactive recovery curve.',
    summary: 'A 50% loss needs a 100% gain to recover. Slide the loss and watch the maths climb.',
    group: 'Leverage & growth',
    keywords: 'drawdown recovery calculator loss recover percentage gain required capital protection',
    related: ['position-size-calculator', 'compound-growth-calculator', 'expectancy-calculator'],
  }),
  tool('break-even-win-rate-calculator', {
    name: 'Break-Even Win Rate',
    heading: 'Break-Even Win Rate Calculator',
    metaTitle: 'Break-Even Win Rate Calculator — Win Rate Needed',
    description:
      'Find the win rate you need to break even at any risk-to-reward ratio, or the ratio your win rate demands. Free calculator, no sign-up.',
    summary: 'At a given risk-to-reward, how often must you win to break even? And the reverse.',
    group: 'Edge & statistics',
    keywords: 'break even win rate calculator required risk reward win percentage expectancy',
    related: ['expectancy-calculator', 'risk-reward-calculator', 'drawdown-recovery-calculator'],
  }),
  tool('trading-session-clock', {
    name: 'Session Clock',
    heading: 'Forex Market Hours & Trading Session Clock',
    metaTitle: 'Forex Market Hours — Live Trading Session Clock',
    description:
      'See which forex sessions are open right now in your time zone, when they overlap and when they close. A live clock that handles daylight saving for you.',
    summary: 'Which forex sessions are open right now, in your time zone, and when do they overlap?',
    group: 'Markets & charts',
    keywords: 'forex market hours trading session clock sydney tokyo london new york overlap time zone',
    related: ['trade-planner', 'position-size-calculator'],
  }),
  tool('expectancy-calculator', {
    name: 'Expectancy',
    heading: 'Trade Expectancy Calculator',
    metaTitle: 'Trade Expectancy Calculator — Average Result Per Trade',
    description:
      'Calculate trading expectancy from your win rate, average win and average loss, in R or money. Free calculator with profit factor and break-even win rate.',
    summary: 'Win rate, average win and average loss → what a typical trade has been worth.',
    group: 'Edge & statistics',
    keywords: 'expectancy calculator trading expected value win rate average win loss profit factor r multiple',
    related: ['strategy-statistics-calculator', 'break-even-win-rate-calculator', 'risk-reward-calculator', 'compound-growth-calculator'],
  }),

  tool('stop-target-visualiser', {
    name: 'Stop / Target Visualiser',
    heading: 'Stop Loss & Take Profit Visualiser',
    metaTitle: 'Stop Loss & Take Profit Visualiser — Drag to See R:R',
    description: 'Drag the entry, stop loss and take profit on an interactive chart and watch the risk, reward and risk-to-reward ratio update live. Free, no sign-up.',
    summary: 'Grab the entry, stop and target lines and drag them. Risk, reward and R:R follow your hand.',
    group: 'Plan a trade',
    interactive: true,
    keywords: 'stop loss take profit visualiser drag entry target risk reward pips interactive diagram',
    related: ['trade-planner', 'risk-reward-calculator', 'partial-profit-calculator', 'spread-visualiser'],
  }),
  tool('partial-profit-calculator', {
    name: 'Partial Profit',
    heading: 'Partial Take Profit Calculator',
    metaTitle: 'Partial Take Profit Calculator — Scale Out in R',
    description: 'Calculate the final result of scaling out of a winning trade in stages, such as 50% at 1R, 25% at 2R and 25% at 4R. Free partial profit calculator.',
    summary: 'Close a trade in stages and see what it really returned: 50% at 1R, 25% at 2R, 25% at 4R is +2R.',
    group: 'Plan a trade',
    keywords: 'partial take profit calculator scale out r multiple multiple targets trade management',
    related: ['stop-target-visualiser', 'risk-reward-calculator', 'average-entry-calculator', 'expectancy-calculator'],
  }),
  tool('average-entry-calculator', {
    name: 'Average Entry',
    heading: 'Average Entry Price Calculator',
    metaTitle: 'Average Entry Price Calculator — Weighted Average',
    description: 'Work out your true average entry price and total position when scaling into a trade in several parts. Add as many entries as you need. Free, no sign-up.',
    summary: 'Bought in several parts? Get the true weighted average price and the total position.',
    group: 'Plan a trade',
    keywords: 'average entry price calculator weighted average scaling in position cost basis average down',
    related: ['partial-profit-calculator', 'profit-loss-calculator', 'position-size-calculator'],
  }),
  tool('spread-visualiser', {
    name: 'Spread Visualiser',
    heading: 'Spread Visualiser',
    metaTitle: 'Spread Visualiser — See Why Trades Start Negative',
    description: 'See the bid, ask and spread on a live diagram, and what the spread costs in money at your position size. Free forex spread visualiser and cost calculator.',
    summary: 'Why does a trade open already losing money? Widen and narrow the spread and watch the cost.',
    group: 'Pips & money',
    interactive: true,
    keywords: 'spread visualiser bid ask spread cost forex pips trading costs why trade starts negative',
    related: ['pip-value-calculator', 'stop-target-visualiser', 'profit-loss-calculator', 'order-type-simulator'],
  }),
  tool('leverage-sandbox', {
    name: 'Leverage Sandbox',
    heading: 'Leverage Sandbox',
    metaTitle: 'Leverage Sandbox — See What Leverage Does to an Account',
    description: 'Try leverage safely: change leverage and market movement on a practice account and see how it magnifies profit and loss. Free interactive leverage simulator.',
    summary: 'A practice account where leverage goes from 1× to 30×. Move the market and watch the balance.',
    group: 'Leverage & growth',
    interactive: true,
    keywords: 'leverage sandbox leverage simulator leverage calculator margin risk practice account magnify loss',
    related: ['margin-leverage-calculator', 'drawdown-recovery-calculator', 'position-size-calculator', 'trade-planner'],
  }),
  tool('strategy-statistics-calculator', {
    name: 'Strategy Statistics',
    heading: 'Trading Strategy Statistics Calculator',
    metaTitle: 'Strategy Statistics Calculator — Win Rate & Expectancy',
    description: 'Enter winners, losers and averages to see win rate, expectancy, profit factor and break-even win rate. A free trading strategy statistics calculator.',
    summary: 'Is a strategy actually working? Win rate, expectancy, profit factor and more from a few numbers.',
    group: 'Edge & statistics',
    keywords: 'trading strategy statistics calculator win rate expectancy profit factor performance metrics trade results',
    related: ['expectancy-calculator', 'break-even-win-rate-calculator', 'risk-reward-calculator', 'compound-growth-calculator'],
  }),
  tool('order-type-simulator', {
    name: 'Order Type Simulator',
    heading: 'Order Type Simulator',
    metaTitle: 'Order Type Simulator — Market, Limit, Stop & Stop-Limit',
    description: 'Practise placing market, limit, stop and stop-limit orders on a fake market and watch exactly when each one fills. Free interactive trading order simulator.',
    summary: 'Place market, limit, stop and stop-limit orders on a practice market and watch what fills, and when.',
    group: 'Markets & charts',
    interactive: true,
    keywords: 'order type simulator market order limit order stop order stop limit buy limit sell stop how orders fill practice',
    related: ['spread-visualiser', 'candlestick-builder', 'stop-target-visualiser', 'trade-planner'],
  }),
  tool('candlestick-builder', {
    name: 'Candlestick Builder',
    heading: 'Candlestick Builder',
    metaTitle: 'Candlestick Builder — Learn How Candles Are Made',
    description: 'Change the open, high, low and close and watch the candlestick change. Learn bodies, wicks, dojis, hammers and engulfing patterns. Free interactive tool.',
    summary: 'A candle is just four prices drawn as a shape. Change them and watch it redraw.',
    group: 'Markets & charts',
    interactive: true,
    keywords: 'candlestick builder candlestick anatomy open high low close body wick doji hammer engulfing pinbar interactive',
    related: ['order-type-simulator', 'pivot-point-calculator', 'fibonacci-calculator', 'trading-session-clock'],
  }),
  tool('fibonacci-calculator', {
    name: 'Fibonacci Levels',
    heading: 'Fibonacci Retracement & Extension Calculator',
    metaTitle: 'Fibonacci Retracement & Extension Calculator',
    description: 'Enter a swing high and low to get Fibonacci retracement and extension levels instantly, drawn on a chart. Free calculator for traders.',
    summary: 'Enter a swing high and low and get the retracement and extension levels, drawn for you.',
    group: 'Markets & charts',
    keywords: 'fibonacci calculator fibonacci retracement fibonacci extension levels 61.8 38.2 swing high low',
    related: ['pivot-point-calculator', 'candlestick-builder', 'stop-target-visualiser', 'risk-reward-calculator'],
  }),
  tool('pivot-point-calculator', {
    name: 'Pivot Points',
    heading: 'Pivot Point Calculator',
    metaTitle: 'Pivot Point Calculator — Support & Resistance Levels',
    description: 'Enter the previous high, low and close to get pivot points with support and resistance levels, in classic, Woodie, Fibonacci and Camarilla methods. Free.',
    summary: 'Previous high, low and close in; pivot, support and resistance levels out, drawn as a ladder.',
    group: 'Markets & charts',
    keywords: 'pivot point calculator pivot points support resistance classic woodie camarilla fibonacci pivots daily levels',
    related: ['fibonacci-calculator', 'candlestick-builder', 'trading-session-clock', 'stop-target-visualiser'],
  }),
];

const bySlug = new Map(tools.map((entry) => [entry.slug, entry]));

export function getTool(slug: string): ToolMeta {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`Unknown tool: ${slug}`);
  return found;
}

export const toolGroups: ToolGroup[] = ['Plan a trade', 'Pips & money', 'Leverage & growth', 'Edge & statistics', 'Markets & charts'];

export type Tone = 'violet' | 'amber' | 'coral' | 'cyan' | 'lime';

/** Each group has its own colour; the page, hub and homepage all use it so a tool always "feels" like its group. */
export const groupTone: Record<ToolGroup, Tone> = {
  'Plan a trade': 'violet',
  'Pips & money': 'amber',
  'Leverage & growth': 'coral',
  'Edge & statistics': 'cyan',
  'Markets & charts': 'lime',
};

export const groupBlurb: Record<ToolGroup, string> = {
  'Plan a trade': 'Size it, set the stop, check the reward. Before any money is at risk.',
  'Pips & money': 'Turn distance into money and money back into distance.',
  'Leverage & growth': 'What margin locks up, what losses cost, and what compounding really does.',
  'Edge & statistics': 'How often you need to win, and what a typical trade is worth.',
  'Markets & charts': 'Watch orders fill, build candles, draw levels and see which sessions are open.',
};

