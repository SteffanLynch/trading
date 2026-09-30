/**
 * The legal operator of Trading Notes.
 *
 * Trading Notes is a trading name, not a legal person. Misppelled Ltd is the company that owns and operates the
 * website, so every disclosure, footer line and legal page resolves to these constants rather than to the site name.
 * The same details are used by the sister website Sermon Registry (also operated by Misppelled Ltd).
 *
 * UK trading-disclosure rules (Companies Act 2006, Part 41, and the Companies (Trading Disclosures) Regulations)
 * require the registered name, company number and place of registration to be available on the website.
 */
export const SITE_NAME = 'Trading Notes';
export const LEGAL_ENTITY_NAME = 'Misppelled Ltd';
export const LEGAL_COMPANY_NUMBER = '17447906';
export const LEGAL_JURISDICTION = 'England and Wales';

/** Registered office exactly as filed at Companies House. */
export const LEGAL_REGISTERED_OFFICE = '106 Hither Farm Rd, London, England, SE3 9QU';

/** The same address as schema.org fields. */
export const LEGAL_REGISTERED_OFFICE_ADDRESS = {
  streetAddress: '106 Hither Farm Rd',
  addressLocality: 'London',
  postalCode: 'SE3 9QU',
  addressCountry: 'GB',
} as const;

/**
 * A public contact address for legal and compliance enquiries. Left empty on purpose: set it to a monitored mailbox
 * and it appears automatically on the disclaimer page and in structured data.
 */
export const LEGAL_CONTACT_EMAIL: string | null = null;

/** When the legal pages were last revised. Update whenever their wording changes. */
export const LEGAL_LAST_UPDATED = '30 September 2026';

/** Single-sentence trading disclosure used by the footer and the legal pages. */
export function legalDisclosureLine(): string {
  return `${SITE_NAME} is a trading name of ${LEGAL_ENTITY_NAME}, a company registered in ${LEGAL_JURISDICTION}. Company No. ${LEGAL_COMPANY_NUMBER}.`;
}

/** The same disclosure with the registered office, for the legal pages. */
export function legalDisclosureBlock(): string {
  return `${legalDisclosureLine()} Registered office: ${LEGAL_REGISTERED_OFFICE}.`;
}
