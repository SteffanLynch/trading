/**
 * Commercial partners. An entry holds the facts shown to visitors and, once the partnership exists, the tracking link.
 *
 * Rules the site applies automatically (see src/utils/monetisation.ts):
 *  - With no `affiliateUrl`, the partner links to its own website, unlabelled, because nothing is being earned.
 *  - With an `affiliateUrl`, every link is labelled "Affiliate link" and carries rel="sponsored".
 *  - A broker is shown ONLY when it has an `affiliateUrl`, a `promotionApproval` and a `riskWarning`. Promoting an
 *    FCA-regulated product (CFDs, forex, crypto) is a financial promotion, so the broker's compliance team must
 *    approve how it appears and supply the exact risk warning and loss percentage that applies today.
 *
 * The descriptions below are deliberately limited to widely published facts. Re-check them against each partner's
 * own website before going live.
 */
export type PartnerId = 'tradingview' | 'pepperstone' | 'vantage' | 'amazon';
export type PartnerKind = 'charting' | 'broker' | 'books';
export type PartnerAccent = 'violet' | 'lime' | 'cyan' | 'amber' | 'coral';

export interface PromotionApproval {
  /** Who approved the promotion, for example the broker's compliance team. */
  approvedBy: string;
  /** ISO date of the approval. */
  date: string;
  /** Their reference, if they gave one. */
  reference?: string;
}

export interface Partner {
  id: PartnerId;
  name: string;
  kind: PartnerKind;
  accent: PartnerAccent;
  /** The partner's own website. Used whenever there is no affiliate link. */
  website: string;
  /** The tracking link from the partner's affiliate programme. https only. */
  affiliateUrl: string | null;
  tagline: string;
  summary: string;
  goodFor: string[];
  /** Short line used where the partner is mentioned inside a lesson or tool. */
  inContext: string;
  /** Brokers only. Exact approved wording, including the percentage of retail accounts that lose money. */
  riskWarning?: string | null;
  /** Brokers only. */
  promotionApproval?: PromotionApproval | null;
}

export const partners: Record<PartnerId, Partner> = {
  tradingview: {
    id: 'tradingview',
    name: 'TradingView',
    kind: 'charting',
    accent: 'cyan',
    website: 'https://www.tradingview.com/',
    affiliateUrl: null,
    tagline: 'Charts, drawing tools and alerts in the browser.',
    summary:
      'TradingView is a web-based charting platform and trading community. It has a free plan, with paid plans that add more indicators per chart, more saved layouts and more alerts.',
    goodFor: [
      'Practising the lessons on real charts: marking swing highs and lows, support and resistance, and candlestick patterns.',
      'Drawing tools such as horizontal lines, trend lines, Fibonacci retracements and pivot indicators.',
      'Bar Replay, which steps back through past price action one candle at a time.',
      'Price alerts, so a level can be watched without staring at the screen.',
    ],
    inContext: 'The charts in this lesson are illustrative. To practise the same ideas on real markets, use a proper charting platform such as TradingView.',
  },
  pepperstone: {
    id: 'pepperstone',
    name: 'Pepperstone',
    kind: 'broker',
    accent: 'violet',
    website: 'https://pepperstone.com/',
    affiliateUrl: null,
    tagline: 'Forex and CFD broker offering several trading platforms.',
    summary: 'Pepperstone is a forex and CFD broker founded in Melbourne, Australia, in 2010. It offers platforms including MetaTrader 4, MetaTrader 5 and cTrader.',
    goodFor: ['Traders who want a choice of widely used platforms: MetaTrader 4, MetaTrader 5 and cTrader.', 'Anyone comparing brokers who wants one more to put through the checklist on this page.'],
    inContext: 'Sizing a trade is only half of it: a broker has to let it be placed. Compare brokers on regulation, costs and client-money protection first.',
    riskWarning: null,
    promotionApproval: null,
  },
  vantage: {
    id: 'vantage',
    name: 'Vantage Markets (UK)',
    kind: 'broker',
    accent: 'amber',
    website: 'https://www.vantagemarkets.com/',
    affiliateUrl: null,
    tagline: 'Forex and CFD broker with MetaTrader platforms.',
    summary: 'Vantage Markets is a forex and CFD broker that began in Sydney, Australia, in 2009. It offers MetaTrader 4 and MetaTrader 5.',
    goodFor: ['Traders who want the familiar MetaTrader 4 or MetaTrader 5 platforms.', 'Anyone comparing brokers who wants one more to put through the checklist on this page.'],
    inContext: 'Sizing a trade is only half of it: a broker has to let it be placed. Compare brokers on regulation, costs and client-money protection first.',
    riskWarning: null,
    promotionApproval: null,
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    kind: 'books',
    accent: 'amber',
    website: 'https://www.amazon.co.uk/',
    affiliateUrl: null,
    tagline: 'Where the recommended books can be bought.',
    summary: 'Book links go to Amazon.co.uk search results for the title, so the right edition (paperback, hardback, Kindle or audiobook) can be chosen there.',
    goodFor: ['Finding any recommended book in the format that suits.'],
    inContext: 'Books worth reading alongside this lesson.',
  },
};

/** What to check about any broker, whichever one is chosen. Shown on the partners page, with or without a live broker. */
export const BROKER_CHECKLIST: {title: string; detail: string}[] = [
  {title: 'Is it authorised?', detail: 'Search the exact legal entity on the FCA Register. A firm using a similar name, or an offshore entity, is not the same thing.'},
  {title: 'Which entity holds the account?', detail: 'Large brokers operate several entities in different countries. The one that signs the client agreement decides which protections apply.'},
  {title: 'Is client money protected?', detail: 'Ask whether client money is held in segregated accounts and which compensation scheme, if any, covers the account.'},
  {title: 'What does it really cost?', detail: 'Compare spreads, commission, overnight financing, currency conversion, inactivity and withdrawal fees, not just the headline spread.'},
  {title: 'What are the leverage limits?', detail: 'Retail clients in the UK face leverage limits and negative balance protection. Higher leverage elsewhere usually means weaker protection, not a better deal.'},
  {title: 'Can the platform be tried first?', detail: 'A demo account shows how orders, stops and fills behave before real money is involved.'},
  {title: 'Is the promotion honest?', detail: 'Be wary of bonuses, guaranteed returns, pressure to deposit, or anyone who contacts you first about trading.'},
];
