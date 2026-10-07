import type {BookTopic} from './books';
import type {PartnerId} from './partners';
import type {ResourceTopic} from './resources';

/**
 * Which commercial and learning blocks appear on which page. Lessons are matched by their URL path, tools by slug.
 * A page with no entry shows only the ad slot (which itself stays hidden until ads are switched on).
 */
export interface Placement {
  partners?: PartnerId[];
  books?: BookTopic[];
  resources?: ResourceTopic[];
}

const LESSON = '/library/';

export const lessonPlacements: Record<string, Placement> = {
  [`${LESSON}fundamentals/what-is-trading`]: {resources: ['start', 'safety'], books: ['start']},
  [`${LESSON}fundamentals/market-fundamentals`]: {resources: ['start']},
  [`${LESSON}fundamentals/market-nature`]: {resources: ['charts'], books: ['history']},
  [`${LESSON}fundamentals/market-structure`]: {partners: ['tradingview'], resources: ['charts'], books: ['charts']},
  [`${LESSON}fundamentals/timeframes`]: {partners: ['tradingview'], resources: ['charts'], books: ['charts']},
  [`${LESSON}fundamentals/support-and-resistance`]: {partners: ['tradingview'], resources: ['charts'], books: ['charts']},
  [`${LESSON}fundamentals/candlesticks`]: {partners: ['tradingview'], resources: ['charts'], books: ['charts']},
  [`${LESSON}fundamentals/risk-management`]: {resources: ['risk', 'safety'], books: ['risk']},
  [`${LESSON}fundamentals/trading-psychology`]: {resources: ['psychology'], books: ['psychology']},
  [`${LESSON}strategy/what-is-a-trading-plan`]: {resources: ['systems'], books: ['systems']},
  [`${LESSON}strategy/rules`]: {resources: ['risk', 'psychology'], books: ['risk']},
  [`${LESSON}strategy/supply-and-demand`]: {partners: ['tradingview'], resources: ['charts']},
  [`${LESSON}strategy/break-and-retest`]: {partners: ['tradingview'], resources: ['charts']},
};

export const toolPlacements: Record<string, Placement> = {
  'trade-planner': {partners: ['tradingview', 'pepperstone', 'vantage']},
  'position-size-calculator': {partners: ['pepperstone', 'vantage'], books: ['risk']},
  'pip-value-calculator': {partners: ['pepperstone', 'vantage']},
  'pips-to-money-converter': {partners: ['pepperstone', 'vantage']},
  'margin-leverage-calculator': {partners: ['pepperstone', 'vantage'], books: ['risk']},
  'leverage-sandbox': {partners: ['pepperstone', 'vantage']},
  'spread-visualiser': {partners: ['pepperstone', 'vantage']},
  'order-type-simulator': {partners: ['pepperstone', 'vantage']},
  'stop-target-visualiser': {partners: ['tradingview']},
  'candlestick-builder': {partners: ['tradingview'], books: ['charts']},
  'fibonacci-calculator': {partners: ['tradingview']},
  'pivot-point-calculator': {partners: ['tradingview']},
  'strategy-statistics-calculator': {books: ['systems']},
  'expectancy-calculator': {books: ['systems']},
  'risk-reward-calculator': {books: ['risk']},
  'drawdown-recovery-calculator': {books: ['risk']},
};

/** A lesson's path without its trailing slash or any sub-page, so '/library/strategy/rules/' and '/library/strategy/rules' match. */
export function normalisePath(path: string): string {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
}

export function placementForLesson(permalink: string): Placement {
  const path = normalisePath(permalink);
  if (lessonPlacements[path]) return lessonPlacements[path];
  // Sub-pages (examples) inherit their strategy's placement.
  const parent = Object.keys(lessonPlacements).find((key) => path.startsWith(`${key}/`));
  return parent ? lessonPlacements[parent] : {};
}

export function placementForTool(slug: string): Placement {
  return toolPlacements[slug] ?? {};
}
