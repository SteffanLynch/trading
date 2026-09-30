import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {LEGAL_ENTITY_NAME, LEGAL_LAST_UPDATED, SITE_NAME} from '../../data/legal';
import CompanyDetails from './CompanyDetails';
import styles from './legal.module.css';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface Props {
  path: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lede: ReactNode;
  /** The short version, shown in a highlighted box before the detail. */
  keyPoints: ReactNode[];
  sections: LegalSection[];
}

/** Shared layout for long-form legal pages: short version first, a contents list, numbered sections and the company details. */
export default function LegalPage({path, metaTitle, metaDescription, kicker, title, lede, keyPoints, sections}: Props) {
  const url = useBaseUrl(path, {absolute: true});
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url,
    description: metaDescription,
    isPartOf: {'@type': 'WebSite', name: SITE_NAME},
    publisher: {'@type': 'Organization', name: LEGAL_ENTITY_NAME},
    dateModified: new Date(LEGAL_LAST_UPDATED).toISOString().slice(0, 10),
  };

  return (
    <Layout title={metaTitle} description={metaDescription}>
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className={styles.page}>
        <div className={styles.glow} aria-hidden="true" />
        <header className={styles.header}>
          <p className={styles.kicker}>{kicker}</p>
          <h1>{title}</h1>
          <p className={styles.lede}>{lede}</p>
          <p className={styles.updated}>Last updated {LEGAL_LAST_UPDATED}</p>
        </header>

        <aside className={styles.keyPoints} aria-label="The short version">
          <h2>The short version</h2>
          <ul>
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </aside>

        <div className={styles.layout}>
          <nav className={styles.toc} aria-label="On this page">
            <p>On this page</p>
            <ol>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className={styles.article}>
            {sections.map((section, index) => (
              <section id={section.id} key={section.id} className={styles.section}>
                <h2>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </h2>
                <div className={styles.body}>{section.body}</div>
              </section>
            ))}
            <section className={styles.companyBox} aria-labelledby="company-details">
              <h2 id="company-details">The company behind {SITE_NAME}</h2>
              <CompanyDetails />
              <p>
                See also <Link to="/how-this-site-is-funded">how this site is funded</Link>.
              </p>
            </section>
          </article>
        </div>
      </main>
    </Layout>
  );
}
