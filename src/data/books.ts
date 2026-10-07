/**
 * Books recommended for further reading. Links go to Amazon.co.uk search results (see AMAZON_ASSOCIATE_TAG), so no
 * catalogue numbers or prices are stored and nothing here goes stale.
 */
export type BookTopic = 'start' | 'psychology' | 'risk' | 'charts' | 'systems' | 'history';

export interface BookTopicInfo {
  id: BookTopic;
  label: string;
}

export const bookTopics: BookTopicInfo[] = [
  {id: 'psychology', label: 'Psychology & discipline'},
  {id: 'risk', label: 'Risk & position sizing'},
  {id: 'charts', label: 'Charts & price action'},
  {id: 'systems', label: 'Systems & evidence'},
  {id: 'history', label: 'Market stories'},
  {id: 'start', label: 'Thinking clearly'},
];

export interface Book {
  title: string;
  author: string;
  /**
   * Optional Amazon.co.uk ASIN (the 10-character code after /dp/ on the product page) for the exact edition to link
   * to. Copy it from the product page's "Product information" section and check it is the intended edition. Leave it
   * out and the book links to an Amazon search instead. The store ID is added automatically, so never paste a tagged URL.
   */
  asin?: string;
  topics: BookTopic[];
  /** Why it earns a place on the shelf, in one or two sentences. */
  why: string;
}

export const books: Book[] = [
  {
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    topics: ['psychology'],
    why: 'A classic on thinking in probabilities and accepting that any single trade can lose, which is the idea behind most of the psychology lesson.',
  },
  {
    title: 'The Disciplined Trader',
    author: 'Mark Douglas',
    topics: ['psychology'],
    why: 'The earlier Douglas book, on the beliefs and habits that sit behind undisciplined trading.',
  },
  {
    title: 'Best Loser Wins',
    author: 'Tom Hougaard',
    topics: ['psychology'],
    why: 'A professional trader on handling losses, fear and the need to be right.',
  },
  {
    title: 'Trade Your Way to Financial Freedom',
    author: 'Van K. Tharp',
    topics: ['risk', 'systems'],
    why: 'Expectancy, R-multiples and position sizing explained at book length.',
  },
  {
    title: 'Technical Analysis of the Financial Markets',
    author: 'John J. Murphy',
    topics: ['charts'],
    why: 'A broad reference for trends, support and resistance, chart patterns and indicators.',
  },
  {
    title: 'Japanese Candlestick Charting Techniques',
    author: 'Steve Nison',
    topics: ['charts'],
    why: 'The book that brought candlestick charting to the West and the standard reference for candle patterns.',
  },
  {
    title: 'Technical Analysis Using Multiple Timeframes',
    author: 'Brian Shannon',
    topics: ['charts'],
    why: 'A practical look at using higher timeframes for context, in line with the timeframes lesson.',
  },
  {
    title: 'Evidence-Based Technical Analysis',
    author: 'David Aronson',
    topics: ['systems'],
    why: 'A sceptical, statistical approach to testing whether a chart-based rule has any edge at all.',
  },
  {
    title: 'Following the Trend',
    author: 'Andreas Clenow',
    topics: ['systems'],
    why: 'A clear account of rules-based trend following, including how position sizing and risk are handled.',
  },
  {
    title: 'Trading for a Living',
    author: 'Alexander Elder',
    topics: ['psychology', 'risk', 'systems'],
    why: 'Psychology, method and money management in one book, often recommended to newer traders.',
  },
  {
    title: 'Market Wizards',
    author: 'Jack D. Schwager',
    topics: ['history'],
    why: 'Interviews with successful traders. Useful for how different their methods are and how much they share about risk.',
  },
  {
    title: 'Reminiscences of a Stock Operator',
    author: 'Edwin Lefèvre',
    topics: ['history'],
    why: 'A fictionalised account of a speculator in the early 1900s whose lessons about human nature still read as current.',
  },
  {
    title: 'Fooled by Randomness',
    author: 'Nassim Nicholas Taleb',
    topics: ['start', 'risk'],
    why: 'On luck, skill and mistaking one for the other, which is a useful warning before judging any run of trades.',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    topics: ['start', 'psychology'],
    why: 'The research behind many of the biases that cause trading mistakes.',
  },
];
