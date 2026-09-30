import type {CSSProperties, ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Accordion from '../components/calculators/Accordion';
import {tools} from '../data/tools';
import {LEGAL_ENTITY_NAME, SITE_NAME} from '../data/legal';
import styles from './funded.module.css';

const vars = (fill: string, text: string) => ({'--c': fill, '--ct': text}) as CSSProperties;

const FAQS: {q: string; a: string}[] = [
  {q: 'Is anything on Trading Notes behind a paywall?', a: 'No. Every lesson, calculator, simulator and tool is free, and no feature is held back for paying visitors. There is no premium tier, no free trial and no upgrade.'},
  {q: 'Will an email address ever be required?', a: 'No. Trading Notes will never ask for an email address for any feature. There is no sign-up, no account and no “enter your email to see the result”.'},
  {q: 'If it is all free, how does the site pay for itself?', a: 'Through affiliate commissions and advertising. Hosting, design, development and the time spent building and checking the tools and lessons all cost money, and those two income streams cover it without charging visitors.'},
  {q: 'Do affiliate links cost more?', a: 'No. Following an affiliate link does not add anything to the price a visitor pays. The partner pays the commission from its own revenue if the visitor signs up or buys.'},
  {q: 'Does the money change what the lessons and calculators say?', a: 'No. The calculators work only from the numbers entered into them and contain no broker or advertiser data. The lessons are written to explain trading, not to sell products. Commercial relationships are labelled so they can be told apart from the content.'},
  {q: 'Is an affiliate link or an ad a recommendation?', a: 'No. A commission or an advertisement creates an incentive to feature a product, which is exactly why nothing on this site is a recommendation or financial advice. Any broker or product should be researched independently and its regulatory status checked. See the disclaimer.'},
  {q: 'How are ads and affiliate links labelled?', a: 'Paid placements and affiliate links are labelled, for example as “Ad”, “Sponsored” or “Affiliate link”, so they can be recognised.'},
  {q: 'How can someone support the site?', a: 'By using it, telling others about it, or, if a partner product is wanted anyway, by following the partner link. Support is never required, and access never depends on it.'},
];

export default function HowFundedPage(): ReactNode {
  const url = useBaseUrl('/how-this-site-is-funded', {absolute: true});
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {'@type': 'WebPage', name: 'Free for everyone: how Trading Notes is funded', url, isPartOf: {'@type': 'WebSite', name: SITE_NAME}, publisher: {'@type': 'Organization', name: LEGAL_ENTITY_NAME}},
      {'@type': 'FAQPage', mainEntity: FAQS.map((faq) => ({'@type': 'Question', name: faq.q, acceptedAnswer: {'@type': 'Answer', text: faq.a}}))},
    ],
  };

  return (
    <Layout
      title="Free for Everyone — How Trading Notes Is Funded"
      description="Everything on Trading Notes is free. No email, no payment, no paywalls, ever. The site is funded by affiliate commissions and advertising: here is exactly how.">
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className={`${styles.page} tone-lime`}>
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={styles.wrap}>
            <p className={styles.kicker}>How this site is funded</p>
            <h1>
              <span className={styles.outline}>Free.</span> <span className={styles.mark}>For everyone.</span> Always.
            </h1>
            <p className={styles.lede}>
              Every lesson, every calculator and every tool on {SITE_NAME} is free. <strong>No email address. No payment. No account. No paywall.</strong> Here is how the site pays for itself instead.
            </p>
            <div className={styles.chips}>
              <span className={styles.chip} style={vars('var(--lime)', 'var(--lime-t)')}><i>✓</i> No email</span>
              <span className={styles.chip} style={vars('var(--violet)', 'var(--violet-t)')}><i>✓</i> No payment</span>
              <span className={styles.chip} style={vars('var(--cyan)', 'var(--cyan-t)')}><i>✓</i> No paywalls</span>
              <span className={styles.chip} style={vars('var(--amber)', 'var(--amber-t)')}><i>✓</i> No sign-up</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>What “free” means here</p>
            <h2 className={styles.h2}>Everything is open. To everyone.</h2>
            <ul className={styles.promises}>
              <li style={vars('var(--lime)', 'var(--lime-t)')}>
                <strong>Every lesson</strong>
                <span>The whole library, from the first fundamentals to the strategy notes and the glossary. Nothing is hidden behind a login.</span>
              </li>
              <li style={vars('var(--violet)', 'var(--violet-t)')}>
                <strong>Every tool</strong>
                <span>All {tools.length} calculators, simulators and visualisers, in full. No “pro” version, no usage limits.</span>
              </li>
              <li style={vars('var(--cyan)', 'var(--cyan-t)')}>
                <strong>No email, ever</strong>
                <span>No feature asks for an email address, and there is no newsletter gate or “unlock the result” step.</span>
              </li>
              <li style={vars('var(--amber)', 'var(--amber-t)')}>
                <strong>No payment, ever</strong>
                <span>No feature asks for a payment, a card or a subscription. There is no premium tier and no free trial.</span>
              </li>
            </ul>
            <div className={styles.pledge}>
              <p>
                {SITE_NAME} will <em>never</em> ask for an email address or a payment for any feature on this site. Everything is accessible to everyone.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>So who pays?</p>
            <h2 className={styles.h2}>Commissions and advertising.</h2>
            <div className={styles.duo}>
              <div className={`${styles.panel} ${styles.panelA}`}>
                <span className={styles.tag}>Income 01</span>
                <h3>Affiliate commissions</h3>
                <p>Some links on the site lead to products and services from partners, such as brokers, trading platforms, data tools, books or courses. If a visitor follows one of those links and then signs up or buys, {SITE_NAME} may earn a commission.</p>
                <p>Following the link costs the visitor nothing extra. The commission comes from the partner, not from the visitor.</p>
              </div>
              <div className={`${styles.panel} ${styles.panelB}`}>
                <span className={styles.tag}>Income 02</span>
                <h3>Advertising</h3>
                <p>The site may show advertisements from third-party networks and advertisers. {SITE_NAME} is paid when advertisements are shown or clicked.</p>
                <p>Advertisements are separate from the content: they never change a calculation or the reasoning of a lesson, and paid placements are labelled as such.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`${styles.wrap} ${styles.steady}`}>
            <p className={styles.eyebrow}>What stays the same</p>
            <h2 className={styles.h2}>The money does not touch the maths.</h2>
            <ul>
              <li>The calculators work only from the numbers entered into them. They contain no broker, partner or advertiser data.</li>
              <li>The lessons explain how trading works. They are not written to sell a product.</li>
              <li>Affiliate links and advertisements are labelled, so they can be told apart from the content.</li>
              <li>Every visitor gets exactly the same tools and lessons, whether or not a partner link is ever followed.</li>
            </ul>
            <div className={styles.careful}>
              <p>
                <strong>Read commercial links with care.</strong> A commission or an advertisement creates an incentive to feature a product. That is why nothing on this site is a recommendation or financial advice, why any broker or product should be researched independently, and why its regulatory status should be checked. Trading carries a high risk of loss. Read the full <Link to="/disclaimer">disclaimer</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`${styles.wrap} ${styles.faq}`}>
            <p className={styles.eyebrow}>Questions</p>
            <h2 className={styles.h2}>The short answers.</h2>
            <div>
              {FAQS.map((faq) => (
                <Accordion key={faq.q} title={faq.q} variant="faq">
                  <p>{faq.a}</p>
                </Accordion>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Go and use it. It is free.</h2>
          <p>Open a calculator, read a lesson, try a simulator. There is nothing to sign up for.</p>
          <div className={styles.ctaActions}>
            <Link className="button button--primary" to="/tools">
              Browse the free tools <span aria-hidden="true">↗</span>
            </Link>
            <Link className={`button ${styles.ghost}`} to="/library/">
              Read the library
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
