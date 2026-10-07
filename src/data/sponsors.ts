/**
 * Direct sponsorships ("calculator presented by X"). Empty until a sponsor signs; nothing renders while it is.
 *
 * Placements:
 *  - 'tool:<slug>'          one calculator, for example 'tool:position-size-calculator'
 *  - 'lesson:<permalink>'   one lesson, for example 'lesson:/library/fundamentals/candlesticks'
 *  - 'all-tools'            every tool page
 *  - 'all-lessons'          every lesson
 *
 * A sponsor never changes a calculation or the wording of a lesson. Regulated advertisers (brokers, crypto firms)
 * must also have their wording approved under the FCA financial-promotions rules before they are added here.
 */
export interface Sponsor {
  id: string;
  name: string;
  /** Where the sponsor link goes. https only. */
  url: string;
  tagline: string;
  placements: string[];
  /** ISO dates, inclusive. */
  starts: string;
  ends: string;
}

export const sponsors: Sponsor[] = [];
