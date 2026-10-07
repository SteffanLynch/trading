/**
 * Content for the media kit (/media-kit). Only facts that can be checked appear here: no invented traffic numbers,
 * demographics or prices. Add real analytics figures to AUDIENCE_STATS when they exist and they appear automatically.
 */
export const MEDIA_KIT_UPDATED = '7 October 2026';

export interface AudienceStat {
  label: string;
  /** Already formatted, for example '48,000'. */
  value: string;
  /** Where it comes from and the period, for example 'PostHog, September 2026'. */
  source: string;
}

/** Real figures from analytics, once there are some. Empty on purpose until then. */
export const AUDIENCE_STATS: AudienceStat[] = [];

export interface SponsorFormat {
  id: string;
  name: string;
  accent: 'violet' | 'lime' | 'cyan' | 'amber' | 'coral';
  where: string;
  what: string;
  suits: string;
}

export const SPONSOR_FORMATS: SponsorFormat[] = [
  {
    id: 'tool-presenter',
    name: 'Tool presenter',
    accent: 'violet',
    where: 'One calculator page, for example the Position Size Calculator.',
    what: 'A “Sponsored” line near the top of the tool reading “Presented by …”, with a link and a one-line description. The calculator is unchanged.',
    suits: 'Charting platforms, journals, risk tools, data providers and, subject to approval, regulated brokers.',
  },
  {
    id: 'category-sponsor',
    name: 'Category sponsor',
    accent: 'lime',
    where: 'Every tool in a group, such as “Plan a trade” or “Markets & charts”, or all tools.',
    what: 'The same labelled “Presented by” line across a whole group of tools, for a fixed period.',
    suits: 'Brands that want steady presence next to the work of planning and sizing trades.',
  },
  {
    id: 'lesson-sponsor',
    name: 'Lesson sponsor',
    accent: 'cyan',
    where: 'One lesson, such as Candlesticks or Trading Psychology, or the whole library.',
    what: 'A labelled sponsor line at the head of the lesson and a clearly marked slot beneath it. The lesson text is never edited by a sponsor.',
    suits: 'Educators, book publishers, software and tools that fit the lesson’s topic.',
  },
  {
    id: 'partner-listing',
    name: 'Partner listing',
    accent: 'amber',
    where: 'The partners page and short, relevant mentions beside the tools and lessons it fits.',
    what: 'A full description, a link, and contextual mentions. Affiliate links are labelled “Affiliate link”; fixed-fee placements are labelled “Sponsored”.',
    suits: 'Products that earn on commission, such as software subscriptions, and regulated firms that can supply approved wording.',
  },
  {
    id: 'display',
    name: 'Display advertising',
    accent: 'coral',
    where: 'Labelled ad slots at the end of lessons and tool pages.',
    what: 'Fixed-size slots with an “Advertisement” label, which never move the text. Shown through an ad network or sold directly, only to visitors who have allowed advertising.',
    suits: 'Brands that want a standard, clearly separate ad unit.',
  },
  {
    id: 'embed-licence',
    name: 'Calculator embed licence',
    accent: 'violet',
    where: 'The licensee’s own website.',
    what: 'The calculators and simulators embedded on another site, with attribution and a link back, under a written licence.',
    suits: 'Educators, brokers and media sites that want the tools without building them.',
  },
];

export const STANDARDS: {title: string; text: string}[] = [
  {title: 'Everything paid is labelled', text: 'Sponsored placements say “Sponsored”, ads say “Ad” or “Advertisement”, and links that can earn a commission say “Affiliate link”.'},
  {title: 'No editorial influence', text: 'A sponsor never changes how a calculator works or what a lesson says, and gets no preview or approval of the content.'},
  {title: 'Free for every visitor', text: 'No feature is gated, and no sponsor can add an email or payment step. Visitors are never asked for either.'},
  {title: 'Regulated products need approved wording', text: 'Brokers and other regulated advertisers must supply wording that has been approved under the FCA financial-promotions rules, including the current risk warning, before anything runs.'},
  {title: 'Consent first', text: 'Advertising and analytics run only for visitors who have allowed them in the cookie banner.'},
];

export const NOT_ACCEPTED: string[] = [
  'Anything promising or implying guaranteed, risk-free or “easy” returns',
  'Trading signals, copy-trading and “funded account” offers that lead with profit claims',
  'Unauthorised or offshore brokers that are not authorised for the visitor’s country',
  'Binary options, and bonus or deposit-incentive offers on leveraged products',
  'Anything aimed at under-18s, or that exploits financial vulnerability',
];

export const PROCESS: {title: string; text: string}[] = [
  {title: 'Enquire', text: 'Say what is being promoted, to whom, and what dates and placements are of interest.'},
  {title: 'Suitability check', text: 'The product and wording are checked against the standards above, and for regulated products against the FCA rules.'},
  {title: 'Agree terms', text: 'Placements, dates and fee are agreed in writing, along with any approved wording.'},
  {title: 'Goes live, labelled', text: 'The placement runs for the agreed dates with its label, then comes down automatically.'},
  {title: 'Report', text: 'After the run, a summary of what was shown and any clicks recorded is shared, using analytics where visitors allowed it.'},
];
