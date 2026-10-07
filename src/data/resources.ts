/**
 * Recommended learning resources outside this site: creators, channels, podcasts, free courses and the official
 * bodies worth knowing. Curated by hand, never paid for: no creator or publisher pays to be listed, and listing is not
 * an endorsement of any strategy or product they sell.
 *
 * Every link goes to the creator's own site (or an official YouTube channel they publish). To add a video, put its
 * 11-character YouTube ID in `videos`; it is embedded click-to-load through youtube-nocookie.com, so nothing from
 * YouTube loads until the visitor presses play.
 */
export type ResourceTopic = 'start' | 'charts' | 'risk' | 'psychology' | 'forex' | 'systems' | 'safety';

export interface ResourceTopicInfo {
  id: ResourceTopic;
  label: string;
  blurb: string;
}

export const resourceTopics: ResourceTopicInfo[] = [
  {id: 'start', label: 'Start here', blurb: 'Plain-English introductions and general market education.'},
  {id: 'charts', label: 'Charts & price action', blurb: 'Reading structure, support and resistance and candlesticks on real charts.'},
  {id: 'risk', label: 'Risk & money management', blurb: 'Sizing positions and surviving losing runs.'},
  {id: 'psychology', label: 'Psychology & discipline', blurb: 'Handling fear, greed, losses and the urge to break the rules.'},
  {id: 'forex', label: 'Forex', blurb: 'Currency-market basics: pairs, pips, sessions and costs.'},
  {id: 'systems', label: 'Systems & evidence', blurb: 'Testing ideas, rules-based approaches and how professionals think about edge.'},
  {id: 'safety', label: 'Safety & regulation', blurb: 'Checking who is authorised, spotting scams and finding impartial guidance.'},
];

export type ResourceType = 'Channel' | 'Podcast' | 'Free course' | 'Website' | 'Regulator';
export type ResourceLevel = 'Beginner' | 'Intermediate' | 'All levels';

export interface Resource {
  id: string;
  name: string;
  /** Who makes it. */
  by: string;
  type: ResourceType;
  /** The creator's own site, or an official page. https only. */
  url: string;
  topics: ResourceTopic[];
  summary: string;
  level: ResourceLevel;
  /** Be upfront when a creator also sells products. */
  cost: 'Free' | 'Free content, paid products also sold';
  /** Anything a reader should know before relying on it. */
  note?: string;
  /** Adds a "Find on YouTube" search link, for creators whose official channel link is not published on their own site. */
  youtubeSearch?: string;
  /** ISO date the link and description were last checked. */
  checked: string;
}

export const resources: Resource[] = [
  {
    id: 'babypips',
    name: 'School of Pipsology',
    by: 'BabyPips',
    type: 'Free course',
    url: 'https://www.babypips.com/learn/forex',
    topics: ['start', 'forex'],
    summary: 'A long-running free forex course in plain English with quizzes, covering pairs, pips, charts, risk and psychology.',
    level: 'Beginner',
    cost: 'Free',
    checked: '2026-10-07',
  },
  {
    id: 'investopedia',
    name: 'Investopedia',
    by: 'Investopedia',
    type: 'Website',
    url: 'https://www.investopedia.com/',
    topics: ['start'],
    summary: 'A free reference for looking up a term, an order type or an instrument, with a large library of explainers.',
    level: 'All levels',
    cost: 'Free',
    note: 'Supported by advertising and affiliate links of its own.',
    checked: '2026-10-07',
  },
  {
    id: 'rayner-teo',
    name: 'TradingwithRayner',
    by: 'Rayner Teo',
    type: 'Channel',
    url: 'https://www.tradingwithrayner.com/',
    topics: ['charts', 'risk'],
    summary: 'Free video and written lessons on price action, candlestick patterns and risk management from an independent trader.',
    level: 'Beginner',
    cost: 'Free content, paid products also sold',
    note: 'Also sells paid courses. The free lessons are the part recommended here.',
    youtubeSearch: 'Rayner Teo',
    checked: '2026-10-07',
  },
  {
    id: 'adam-grimes',
    name: 'Adam H Grimes',
    by: 'Adam H Grimes',
    type: 'Website',
    url: 'https://www.adamhgrimes.com/',
    topics: ['charts', 'systems', 'psychology'],
    summary: 'A blog and podcast from a trader and author known for a sceptical, evidence-minded approach to technical analysis.',
    level: 'Intermediate',
    cost: 'Free content, paid products also sold',
    note: 'Also sells books and a paid service. The blog and podcast are free.',
    checked: '2026-10-07',
  },
  {
    id: 'tom-hougaard',
    name: 'Trader Tom',
    by: 'Tom Hougaard',
    type: 'Channel',
    url: 'https://www.youtube.com/channel/UC4C43bjs7bwwasNPecJm8bw',
    topics: ['psychology', 'charts'],
    summary: 'Videos on price action and, above all, the psychology of taking losses, from the author of Best Loser Wins.',
    level: 'Intermediate',
    cost: 'Free content, paid products also sold',
    note: 'The channel and his website also feature live trades. Treat those as worked examples of someone else’s process, not as signals to copy.',
    checked: '2026-10-07',
  },
  {
    id: 'chat-with-traders',
    name: 'Chat With Traders',
    by: 'Ian Cox and Tessa Dao',
    type: 'Podcast',
    url: 'https://chatwithtraders.com/',
    topics: ['psychology', 'systems', 'start'],
    summary: 'Long interviews with traders across stocks, futures, options, forex and crypto, on how they actually work and what they got wrong.',
    level: 'All levels',
    cost: 'Free',
    checked: '2026-10-07',
  },
  {
    id: 'top-traders-unplugged',
    name: 'Top Traders Unplugged',
    by: 'Niels Kaastrup-Larsen',
    type: 'Podcast',
    url: 'https://www.youtube.com/c/Toptradersunplugged',
    topics: ['systems', 'risk'],
    summary: 'Conversations with systematic traders, hedge-fund managers and authors on trend following, portfolio construction and risk.',
    level: 'Intermediate',
    cost: 'Free',
    note: 'Aimed at professional and serious investors. Useful for how institutions think about risk.',
    checked: '2026-10-07',
  },
  {
    id: 'fca-scamsmart',
    name: 'ScamSmart',
    by: 'Financial Conduct Authority',
    type: 'Regulator',
    url: 'https://www.fca.org.uk/scamsmart',
    topics: ['safety'],
    summary: 'The UK regulator’s guide to spotting investment scams, including the warning list of unauthorised firms.',
    level: 'All levels',
    cost: 'Free',
    checked: '2026-10-07',
  },
  {
    id: 'fca-register',
    name: 'The FCA Register',
    by: 'Financial Conduct Authority',
    type: 'Regulator',
    url: 'https://register.fca.org.uk/',
    topics: ['safety'],
    summary: 'Search any broker or firm by name to see whether it is authorised and which permissions it holds, before opening an account.',
    level: 'All levels',
    cost: 'Free',
    checked: '2026-10-07',
  },
  {
    id: 'moneyhelper',
    name: 'MoneyHelper',
    by: 'Money and Pensions Service',
    type: 'Regulator',
    url: 'https://www.moneyhelper.org.uk/',
    topics: ['safety', 'start'],
    summary: 'Free, impartial UK government-backed money guidance, useful before putting any savings at risk.',
    level: 'Beginner',
    cost: 'Free',
    checked: '2026-10-07',
  },
];

export interface Video {
  /** YouTube video ID (the 11 characters after v=). */
  id: string;
  title: string;
  by: string;
  topics: ResourceTopic[];
  why: string;
}

/** Hand-picked videos. Add only ones that have been watched in full. Empty videos hide the "Watch" section. */
export const videos: Video[] = [];
