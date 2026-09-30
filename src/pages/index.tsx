import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {library} from '../data/library';
import {tools} from '../data/tools';

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Icon({d}: {d: string}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-13.5-2 5.5-5.5 2 2-5.5 5.5-2Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Zm-3 8.5 2 2 4-4.5',
  quote: 'M7 8c-1.8 0-3 1.4-3 3.5S5.2 15 7 15c.6 0 1-.4 1-.9 0-1.6-1.4-2.3-2-2.4.2-1.2 1.1-2 2-2.2V8Zm9 0c-1.8 0-3 1.4-3 3.5S14.2 15 16 15c.6 0 1-.4 1-.9 0-1.6-1.4-2.3-2-2.4.2-1.2 1.1-2 2-2.2V8Z',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 1 6.5 18H20',
  chart: 'M4 20V10m6 10V4m6 16v-7m6 7V8',
  bookmark: 'M6 3h12v18l-6-4-6 4V3Z',
  calculator: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 5h10M8.5 12.5h.01M12 12.5h.01M15.5 12.5h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01',
};

const quickLinks = [
  {icon: ICONS.compass, title: 'Fundamentals', copy: 'The basics I keep coming back to.', href: '/library/fundamentals/what-is-trading'},
  {icon: ICONS.target, title: 'Strategy', copy: 'How I actually find and take a trade.', href: '/library/strategy/what-is-a-trading-plan'},
  {icon: ICONS.shield, title: 'Rules', copy: 'The checks I’m not allowed to skip.', href: '/library/strategy/rules'},
  {icon: ICONS.quote, title: 'Manifesto', copy: 'The mindset behind all of it.', href: '/library/manifesto'},
  {icon: ICONS.calculator, title: 'Free tools', copy: 'Calculators that do the maths for me.', href: '/tools'},
];

const sections: {label: string; accent: string; icon: string; items: typeof library}[] = [
  {label: 'Fundamentals', accent: 'a', icon: ICONS.book, items: library.filter((item) => item.section === 'Fundamentals')},
  {label: 'Strategy', accent: 'b', icon: ICONS.chart, items: library.filter((item) => item.section === 'Strategy')},
  {label: 'Reference', accent: 'c', icon: ICONS.bookmark, items: library.filter((item) => item.section === 'Reference')},
];

export default function Home(): ReactNode {
  return (
    <Layout title="Trading Notes" description="My personal trading notes, rules and chart studies.">
      <main className="home">
        <section className="hub-intro">
          <div className="hub-intro-grid" aria-hidden="true" />
          <p className="kicker"><span /> Trading Notes</p>
          <h1>Everything I know about trading, in one place.</h1>
          <p className="hub-copy">My own rules, reasoning and chart studies — kept here so I stay consistent and can check back on my thinking.</p>
          <div className="hub-quicklinks">
            {quickLinks.map((link) => (
              <Link className="quick-tile" to={link.href} key={link.title}>
                <span className="quick-icon"><Icon d={link.icon} /></span>
                <h2>{link.title}</h2>
                <p>{link.copy}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="hub-section accent-b">
          <div className="hub-section-head">
            <span className="hub-section-icon"><Icon d={ICONS.calculator} /></span>
            <h2>Free tools</h2>
          </div>
          <div className="hub-grid">
            {tools.slice(0, 4).map((tool, index) => (
              <Link to={tool.path} className="hub-card" key={tool.slug}>
                <span className="hub-card-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{tool.name}</h3>
                <p>{tool.summary}</p>
                <span className="hub-card-arrow"><Arrow /></span>
              </Link>
            ))}
          </div>
          <p style={{marginTop: '1.4rem'}}><Link className="text-link" to="/tools">All {tools.length} tools <span>→</span></Link></p>
        </section>

        {sections.map((section) => (
          <section className={`hub-section accent-${section.accent}`} key={section.label}>
            <div className="hub-section-head">
              <span className="hub-section-icon"><Icon d={section.icon} /></span>
              <h2>{section.label}</h2>
            </div>
            <div className="hub-grid">
              {section.items.map((item, index) => (
                <Link to={item.href} className="hub-card" key={item.href}>
                  <span className="hub-card-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="hub-card-arrow"><Arrow /></span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
}
