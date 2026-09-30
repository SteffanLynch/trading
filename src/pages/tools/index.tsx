import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {toolGroups, tools, type ToolGroup} from '../../data/tools';

const ACCENTS: Record<ToolGroup, string> = {
  'Plan a trade': 'a',
  'Pips & money': 'b',
  'Leverage & growth': 'c',
  'Edge & statistics': 'a',
  Markets: 'b',
};

export default function ToolsHub(): ReactNode {
  const base = useBaseUrl('/', {absolute: true}).replace(/\/$/, '');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Trading Calculators and Tools',
    description: 'Free position size, pip value, risk-to-reward, margin, expectancy and other trading calculators. No sign-up.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: tools.map((tool, index) => ({'@type': 'ListItem', position: index + 1, name: tool.heading, url: `${base}${tool.path}`})),
    },
  };

  return (
    <Layout
      title="Free Trading Calculators & Tools"
      description="Free trading calculators that do the maths for you: position size, pip value, risk-to-reward, margin, drawdown, expectancy and a live session clock. No sign-up.">
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className="home">
        <section className="hub-intro">
          <div className="hub-intro-grid" aria-hidden="true" />
          <p className="kicker">
            <span /> Free tools
          </p>
          <h1>Never do a calculation the website could do for you.</h1>
          <p className="hub-copy">
            Twelve calculators for planning, sizing and checking a trade. Every result updates as you type and shows its working. No accounts and no email walls, ever.
          </p>
          <Link className="button button--primary" to="/tools/trade-planner">
            Start with the Trade Planner <span aria-hidden="true">↗</span>
          </Link>
        </section>

        {toolGroups.map((group) => {
          const items = tools.filter((tool) => tool.group === group);
          return (
            <section className={`hub-section accent-${ACCENTS[group]}`} key={group}>
              <div className="hub-section-head">
                <h2>{group}</h2>
              </div>
              <div className="hub-grid">
                {items.map((tool) => (
                  <Link to={tool.path} className="hub-card" key={tool.slug}>
                    <span className="hub-card-index">{String(tools.indexOf(tool) + 1).padStart(2, '0')}</span>
                    <h3>{tool.name}</h3>
                    <p>{tool.summary}</p>
                    <span className="hub-card-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </Layout>
  );
}
