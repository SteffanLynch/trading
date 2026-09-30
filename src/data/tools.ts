export type ToolGroup = 'Plan a trade' | 'Pips & money' | 'Leverage & growth' | 'Edge & statistics' | 'Markets';

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
    related: ['position-size-calculator', 'risk-reward-calculator', 'profit-loss-calculator', 'break-even-win-rate-calculator'],
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
    related: ['pips-to-money-converter', 'position-size-calculator', 'profit-loss-calculator'],
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
    related: ['break-even-win-rate-calculator', 'trade-planner', 'expectancy-calculator'],
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
    related: ['position-size-calculator', 'drawdown-recovery-calculator', 'trade-planner'],
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
    group: 'Markets',
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
    related: ['break-even-win-rate-calculator', 'risk-reward-calculator', 'compound-growth-calculator'],
  }),
];

const bySlug = new Map(tools.map((entry) => [entry.slug, entry]));

export function getTool(slug: string): ToolMeta {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`Unknown tool: ${slug}`);
  return found;
}

export const toolGroups: ToolGroup[] = ['Plan a trade', 'Pips & money', 'Leverage & growth', 'Edge & statistics', 'Markets'];

export type Tone = 'violet' | 'amber' | 'coral' | 'cyan' | 'lime';

/** Each group has its own colour; the page, hub and homepage all use it so a tool always "feels" like its group. */
export const groupTone: Record<ToolGroup, Tone> = {
  'Plan a trade': 'violet',
  'Pips & money': 'amber',
  'Leverage & growth': 'coral',
  'Edge & statistics': 'cyan',
  Markets: 'lime',
};

export const groupBlurb: Record<ToolGroup, string> = {
  'Plan a trade': 'Size it, set the stop, check the reward. Before any money is at risk.',
  'Pips & money': 'Turn distance into money and money back into distance.',
  'Leverage & growth': 'What margin locks up, what losses cost, and what compounding really does.',
  'Edge & statistics': 'How often you need to win, and what a typical trade is worth.',
  Markets: 'Which sessions are open right now, wherever you are.',
};

