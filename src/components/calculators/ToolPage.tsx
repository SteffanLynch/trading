import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {getTool} from '../../data/tools';
import styles from './ToolPage.module.css';

interface Faq {
  q: string;
  a: string;
}

interface Props {
  slug: string;
  lead: ReactNode;
  /** The calculator. */
  children: ReactNode;
  /** "What does this mean?" */
  meaning: ReactNode;
  /** Plain-text formula lines (no LaTeX: it only renders in MDX). */
  formula: string[];
  example: ReactNode;
  faqs: Faq[];
  learn: {label: string; to: string}[];
  /** Extra sections after the example, e.g. a reference table. */
  extra?: ReactNode;
}

/** The disclaimer every tool carries. */
const DISCLAIMER =
  'This tool is for education and general information only and is not financial advice. Results are estimates that exclude spreads, commissions, swaps and slippage. Trading carries a risk of loss. Preferences you choose, such as your account currency, are remembered only in your own browser.';

/**
 * Shared layout for every tool page: calculator first, then the teaching content that makes the page useful
 * (and findable): what the result means, the formula, a worked example, FAQs and where to learn more.
 */
export default function ToolPage({slug, lead, children, meaning, formula, example, faqs, learn, extra}: Props) {
  const tool = getTool(slug);
  const url = useBaseUrl(tool.path, {absolute: true});
  const toolsUrl = useBaseUrl('/tools', {absolute: true});
  const homeUrl = useBaseUrl('/', {absolute: true});

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.heading,
        url,
        description: tool.description,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Home', item: homeUrl},
          {'@type': 'ListItem', position: 2, name: 'Tools', item: toolsUrl},
          {'@type': 'ListItem', position: 3, name: tool.name, item: url},
        ],
      },
      ...(faqs.length
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({'@type': 'Question', name: faq.q, acceptedAnswer: {'@type': 'Answer', text: faq.a}})),
            },
          ]
        : []),
    ],
  };

  const related = tool.related.map(getTool);

  return (
    <Layout title={tool.metaTitle} description={tool.description}>
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className={styles.page}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link to="/tools">Tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{tool.name}</span>
        </nav>
        <header className={styles.header}>
          <h1>{tool.heading}</h1>
          <p className={styles.lead}>{lead}</p>
        </header>

        {children}

        <div className={styles.article}>
          <h2>What does this mean?</h2>
          {meaning}

          <h2>The formula</h2>
          <div className={styles.formula}>
            {formula.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <h2>Worked example</h2>
          <div className={styles.example}>{example}</div>

          {extra}

          {faqs.length > 0 && (
            <>
              <h2>Frequently asked questions</h2>
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </>
          )}

          {learn.length > 0 && (
            <>
              <h2>Learn more</h2>
              <ul className={styles.learn}>
                {learn.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label} →</Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className={styles.disclaimer}>{DISCLAIMER}</p>
        </div>

        <section className={styles.related} aria-labelledby="related-tools">
          <h2 id="related-tools">More free tools</h2>
          <div className={styles.relatedGrid}>
            {related.map((entry) => (
              <Link className={styles.relatedCard} to={entry.path} key={entry.slug}>
                <strong>{entry.name}</strong>
                <span>{entry.summary}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

export {styles as toolPageStyles};
