import type {CSSProperties, ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {getTool, groupTone, type Tone} from '../../data/tools';
import Accordion from './Accordion';
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
  /** Extra collapsible sections after the example, e.g. a reference table. */
  extra?: {title: string; content: ReactNode}[];
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
  const tone = groupTone[tool.group];
  const relatedVars = (entryTone: Tone) =>
    ({'--c': `var(--${entryTone})`, '--ct': `var(--${entryTone}-t)`}) as CSSProperties;

  return (
    <Layout title={tool.metaTitle} description={tool.description}>
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className={`${styles.shell} tone-${tone}`}>
        <div className={styles.glowA} aria-hidden="true" />
        <div className={styles.glowB} aria-hidden="true" />
        <div className={styles.page}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to="/tools">Tools</Link>
            <span aria-hidden="true">/</span>
            <span className={styles.groupChip} aria-current="page">
              <i aria-hidden="true" />
              {tool.group}
            </span>
          </nav>
          <header className={styles.header}>
            <h1>{tool.heading}</h1>
            <p className={styles.lead}>{lead}</p>
          </header>

          {children}

          <div className={styles.article}>
            <Accordion title="What does this mean?">{meaning}</Accordion>
            <Accordion title="The formula">
              <div className={styles.formula}>
                {formula.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </Accordion>
            <Accordion title="Worked example">
              <div className={styles.example}>{example}</div>
            </Accordion>
            {extra?.map((section) => (
              <Accordion key={section.title} title={section.title}>
                {section.content}
              </Accordion>
            ))}

            {faqs.length > 0 && (
              <>
                <p className={styles.faqHeading}>Frequently asked questions</p>
                <div className={styles.faqList}>
                  {faqs.map((faq) => (
                    <Accordion key={faq.q} title={faq.q} variant="faq">
                      <p>{faq.a}</p>
                    </Accordion>
                  ))}
                </div>
              </>
            )}

            {learn.length > 0 && (
              <>
                <p className={styles.learnHeading}>Learn more</p>
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
            <h2 id="related-tools">Keep going</h2>
            <div className={styles.relatedList}>
              {related.map((entry) => (
                <Link className={styles.relatedItem} to={entry.path} key={entry.slug} style={relatedVars(groupTone[entry.group])}>
                  <strong>{entry.name}</strong>
                  <span>{entry.summary}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export {styles as toolPageStyles};
