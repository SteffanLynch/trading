import type {CSSProperties, ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {groupBlurb, groupTone, toolGroups, tools, type Tone} from '../../data/tools';
import styles from './hub.module.css';

const ON: Record<Tone, string> = {violet: 'var(--on-violet)', amber: '#0a0d14', coral: '#0a0d14', cyan: '#0a0d14', lime: '#0a0d14'};
const vars = (tone: Tone) => ({'--c': `var(--${tone})`, '--ct': `var(--${tone}-t)`, '--on': ON[tone]}) as CSSProperties;
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

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
      <main className={styles.hub}>
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true" />
          <p className={styles.chip}>
            <i aria-hidden="true" /> {tools.length} free tools · no sign-up · no email walls
          </p>
          <h1>
            Never do a calculation <span className={styles.mark}>the website</span> could do for you.
          </h1>
          <p className={styles.lede}>Every result updates as you type and shows its working. Pick a tool, or jump to a group.</p>
          <nav className={styles.jump} aria-label="Tool groups">
            {toolGroups.map((group) => (
              <a key={group} href={`#${slugify(group)}`} style={vars(groupTone[group])}>
                {group}
              </a>
            ))}
          </nav>
        </section>

        {toolGroups.map((group, groupIndex) => {
          const items = tools.filter((tool) => tool.group === group);
          const tone = groupTone[group];
          return (
            <section id={slugify(group)} className={styles.group} data-flip={groupIndex % 2} style={vars(tone)} key={group}>
              <div className={styles.groupHead}>
                <span className={styles.groupNum} aria-hidden="true">
                  {String(groupIndex + 1).padStart(2, '0')}
                </span>
                <h2>{group}</h2>
                <p>{groupBlurb[group]}</p>
              </div>
              <ul className={styles.list}>
                {items.map((tool) => (
                  <li key={tool.slug}>
                    <Link to={tool.path} className={styles.row}>
                      <span className={styles.rowNum}>{String(tools.indexOf(tool) + 1).padStart(2, '0')}</span>
                      <span className={styles.rowBody}>
                        <strong>
                          {tool.name}
                          {tool.interactive && <b className={styles.tag}>Interactive</b>}
                        </strong>
                        <em>{tool.summary}</em>
                      </span>
                      <i aria-hidden="true">↗</i>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </Layout>
  );
}
