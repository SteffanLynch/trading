import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import CookieSettingsButton from '../components/consent/CookieSettingsButton';
import LegalPage, {legalStyles, type LegalSection} from '../components/legal/LegalPage';
import {ADSENSE_CLIENT} from '../data/monetisation';
import {LEGAL_CONTACT_EMAIL, LEGAL_ENTITY_NAME, LEGAL_REGISTERED_OFFICE, SITE_NAME} from '../data/legal';

const contact: ReactNode = LEGAL_CONTACT_EMAIL ? (
  <>
    by email to <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> or by post to {LEGAL_ENTITY_NAME}, {LEGAL_REGISTERED_OFFICE}
  </>
) : (
  <>by post to {LEGAL_ENTITY_NAME}, {LEGAL_REGISTERED_OFFICE}</>
);

const adsActive = !!ADSENSE_CLIENT;

const sections: LegalSection[] = [
  {
    id: 'controller',
    title: 'Who is responsible for personal data',
    body: (
      <>
        <p>
          {SITE_NAME} is a trading name of <strong>{LEGAL_ENTITY_NAME}</strong>, which decides how and why personal data is used on this website and is therefore the “controller” under the UK GDPR and the Data Protection Act 2018. Its registered office is {LEGAL_REGISTERED_OFFICE}.
        </p>
        <p>
          Questions about this policy, and requests to exercise the rights in section 8, can be sent {contact}.
        </p>
        <p>
          In this policy “we”, “us” and “our” mean {LEGAL_ENTITY_NAME}, and “visitor” means anyone using the website.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What is collected, why, and on what legal basis',
    body: (
      <>
        <p>
          There are no accounts, no sign-up and no payments on this website, so it does not ask for a name, email address, phone number or card details, and it never will. What is collected is limited to the following.
        </p>
        <div className={legalStyles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>What</th>
                <th>Why</th>
                <th>Legal basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Server logs.</strong> IP address, browser and device type, the page requested, the time, and the referring page. Created by the hosting provider whenever a page is loaded.
                </td>
                <td>Delivering the website, keeping it secure, finding faults and blocking abuse.</td>
                <td>Legitimate interests (running a secure website).</td>
              </tr>
              <tr>
                <td>
                  <strong>The cookie choice itself</strong> and, if one is picked, the light or dark theme.
                </td>
                <td>Remembering the choice so that the banner does not return on every page.</td>
                <td>Strictly necessary / requested by the visitor. No consent is needed.</td>
              </tr>
              <tr>
                <td>
                  <strong>Remembered calculator settings</strong> such as account currency, risk percentage and balance, kept in the visitor's own browser.
                </td>
                <td>Starting the calculators where they were left. Never sent to us.</td>
                <td>Consent (the “Remember calculator settings” choice).</td>
              </tr>
              <tr>
                <td>
                  <strong>Usage analytics</strong>, if switched on and allowed: pages viewed, approximate location (country or region from the IP address), device type, referrer, and the values typed into a calculator together with its result. No name or email address.
                </td>
                <td>Understanding which lessons and tools are used, and which are confusing, so that they can be improved.</td>
                <td>Consent (the “Anonymous usage analytics” choice).</td>
              </tr>
              <tr>
                <td>
                  <strong>Advertising data</strong>, if ads are switched on and allowed: collected by the advertising networks themselves, such as an IP address, cookie or device identifier, and the pages viewed.
                </td>
                <td>Showing, limiting and measuring advertisements, and paying for the website through them.</td>
                <td>Consent (the “Advertising” choice).</td>
              </tr>
              <tr>
                <td>
                  <strong>Correspondence.</strong> What a visitor chooses to send in a message or letter, and the contact details they send it from.
                </td>
                <td>Replying, and keeping a record of the exchange.</td>
                <td>Legitimate interests (dealing with enquiries) or, for requests about personal data, legal obligation.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Calculator values.</strong> The numbers typed into a calculator are processed in the browser to give the result. They are sent to the analytics provider only if analytics has been allowed. Anyone who does not want a figure recorded should reject analytics, or avoid entering real balances. A calculator link that is copied and shared contains the values in its address, so it should be shared with that in mind.
        </p>
        <p>No automated decision-making or profiling that has legal or similarly significant effects on anyone is carried out.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and similar storage',
    body: (
      <>
        <p>
          A cookie is a small file stored by the browser. Similar technologies, such as the browser's local storage, work the same way for this purpose and are treated in the same way here. Under the Privacy and Electronic Communications Regulations, anything that is not strictly necessary is only used after the visitor allows it. <strong>Nothing optional is switched on until a choice is made.</strong> “Reject all” and “Accept all” are equally easy to press.
        </p>
        <div className={legalStyles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Name or source</th>
                <th>Category</th>
                <th>What it does</th>
                <th>How long</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>tn-consent-v1</code> (local storage)
                </td>
                <td>Strictly necessary</td>
                <td>Records the cookie choice and the date it was made.</td>
                <td>Up to 12 months, then the banner returns.</td>
              </tr>
              <tr>
                <td>
                  <code>theme</code> (local storage, set by the site framework)
                </td>
                <td>Strictly necessary</td>
                <td>Remembers a light or dark theme if the visitor picks one.</td>
                <td>Until cleared.</td>
              </tr>
              <tr>
                <td>
                  <code>tn-tools-prefs-v1</code> (local storage)
                </td>
                <td>Preferences (optional)</td>
                <td>Remembers calculator settings. Removed straight away if the choice is withdrawn.</td>
                <td>Until cleared or withdrawn.</td>
              </tr>
              <tr>
                <td>Analytics provider cookies or storage</td>
                <td>Analytics (optional)</td>
                <td>Counts visits and events so that usage can be understood. Only used if analytics is switched on and allowed.</td>
                <td>Set by the provider, typically up to 12 months.</td>
              </tr>
              <tr>
                <td>Advertising networks (for example Google AdSense)</td>
                <td>Advertising (optional)</td>
                <td>Lets ads be shown and measured. {adsActive ? 'Ads are currently switched on and load only after consent.' : 'Advertising is not currently switched on; no ad network is loaded.'}</td>
                <td>Set by the network. See its own policy.</td>
              </tr>
              <tr>
                <td>YouTube (youtube-nocookie.com)</td>
                <td>Loaded only when a video is played</td>
                <td>Nothing is requested from YouTube or Google until the visitor presses play on a video. Playing it may set cookies.</td>
                <td>Set by YouTube.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The choice can be changed or withdrawn at any time, as easily as it was given, with the button below or the “Cookie settings” link at the foot of every page. Withdrawing advertising consent stops ads from loading on later pages; cookies that an advertising network has already set can be removed in the browser's settings, and Google's own controls are at <a href="https://adssettings.google.com/" rel="noopener noreferrer">adssettings.google.com</a>.
        </p>
        <p>
          <CookieSettingsButton />
        </p>
      </>
    ),
  },
  {
    id: 'affiliates-ads',
    title: 'Affiliate links, advertising and other websites',
    body: (
      <>
        <p>
          Some links on this website are <strong>affiliate links</strong>, and they are labelled as such. When a visitor follows one, the partner (and the affiliate network it uses, if any) sets its own cookies on its own website to record that the visitor arrived from here. That is how a commission is credited. Those cookies belong to the partner, are covered by the partner's own privacy and cookie policies, and are outside our control. The website itself does not load them. The list of partners and how the arrangements work is on the <Link to="/partners">partners and disclosures</Link> page.
        </p>
        <p>
          Reports received from partners show activity such as clicks, sign-ups and commissions. They are not used to identify individual visitors.
        </p>
        <p>
          The website links to many other websites, including broker and platform sites, video channels and regulators. Once a visitor leaves, that site's policy applies. Clicking an outbound link is the visitor's own choice, and nothing is passed to the other site beyond what the browser normally sends.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who personal data is shared with',
    body: (
      <>
        <p>Personal data is not sold, and visitor lists are not shared with anyone for their own marketing. It reaches only the following, and only as far as needed:</p>
        <ul>
          <li>
            <strong>The hosting provider</strong>, which runs the servers that deliver the website and creates the server logs.
          </li>
          <li>
            <strong>An analytics provider</strong>, only if analytics is switched on and allowed.
          </li>
          <li>
            <strong>Advertising networks</strong>, only if ads are switched on and allowed. These networks decide for themselves how they use the data they collect and are separate controllers.
          </li>
          <li>
            <strong>Professional advisers, insurers, the authorities and courts</strong>, where the law requires it or where it is needed to establish, exercise or defend legal claims.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'Transfers outside the United Kingdom',
    body: (
      <p>
        Some providers, including hosting, analytics and advertising providers, process data on servers outside the United Kingdom. Where that happens, it is done only where the destination is covered by UK adequacy regulations or the provider has put an approved safeguard in place, such as the UK International Data Transfer Agreement or the UK Addendum to the EU standard contractual clauses.
      </p>
    ),
  },
  {
    id: 'retention',
    title: 'How long data is kept',
    body: (
      <>
        <p>
          Personal data is kept no longer than is needed for the purposes in section 2. In practice: server logs are kept by the hosting provider for a limited period for security and fault-finding; analytics data is kept only for as long as it is useful for improving the website; correspondence is kept for as long as it takes to deal with the enquiry and for a reasonable period afterwards in case of follow-up or a dispute; and the browser storage described above stays on the visitor's own device until it is cleared or withdrawn.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Rights',
    body: (
      <>
        <p>Under the UK GDPR a person has the right to:</p>
        <ul>
          <li>be told what personal data is held about them and to receive a copy;</li>
          <li>have inaccurate data corrected, and in some cases deleted;</li>
          <li>restrict or object to some uses of their data, including anything done on the basis of legitimate interests;</li>
          <li>receive data they provided in a portable format, where the processing is based on consent and carried out by automated means;</li>
          <li>withdraw consent at any time, without affecting anything done lawfully before it was withdrawn.</li>
        </ul>
        <p>
          To use a right, write {contact}. Because the website holds no accounts, it may be necessary to ask for details that help find the data, such as the approximate dates and the IP address, and to confirm that the request really comes from the person concerned. A reply is normally sent within one month.
        </p>
        <p>
          Anyone who is unhappy with how their data has been handled can complain to the Information Commissioner's Office (<a href="https://ico.org.uk/make-a-complaint/" rel="noopener noreferrer">ico.org.uk/make-a-complaint</a>, 0303 123 1113). It is welcome, though not required, to raise the matter here first.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        The website is about trading, which is for adults, and is not aimed at anyone under 18. Personal data is not knowingly collected from children, and advertising is not intended to be directed at them.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <p>
        The website is served over an encrypted (HTTPS) connection and collects as little personal data as it can. No method of transmission or storage is completely secure, so absolute security cannot be promised. A visitor should never enter passwords, account numbers or other sensitive identifiers into any calculator or other part of the website.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        This policy is updated when the way personal data is handled changes, for example when analytics or advertising is switched on or a new type of cookie is added. The date at the top shows the latest version. If the cookie categories change, the banner is shown again so that the choice can be made afresh.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        {LEGAL_ENTITY_NAME}, {LEGAL_REGISTERED_OFFICE}.{' '}
        {LEGAL_CONTACT_EMAIL && (
          <>
            Email: <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.{' '}
          </>
        )}
        See also the <Link to="/disclaimer">disclaimer</Link> and <Link to="/how-this-site-is-funded">how this site is funded</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage(): ReactNode {
  return (
    <LegalPage
      path="/privacy"
      metaTitle="Privacy & Cookie Policy — How Trading Notes Handles Data"
      metaDescription="What Trading Notes collects, why, and how to control it. No accounts or sign-up, optional cookies only with consent, and a plain-English cookie table."
      kicker="Legal"
      title="Privacy & cookies"
      lede={
        <>
          {SITE_NAME} has no accounts, no sign-up and no payments, so there is very little personal data to handle. This page explains exactly what there is, which cookies are used, and how to say no to the optional ones.
        </>
      }
      keyPoints={[
        <>No name, email address or payment details are ever asked for, so none are collected.</>,
        <>
          <strong>Optional cookies are off until a choice is made.</strong> Reject all and accept all are equally easy, and the choice can be changed from “Cookie settings” in the footer at any time.
        </>,
        <>The numbers typed into a calculator reach an analytics provider only if analytics has been allowed.</>,
        <>
          Affiliate links are labelled. Following one means the partner sets its own cookies on its own site: see <Link to="/partners">partners and disclosures</Link>.
        </>,
        <>Data protection rights, and how to complain to the ICO, are set out in section 8.</>,
      ]}
      sections={sections}
    />
  );
}
