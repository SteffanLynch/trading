import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {library} from '../data/library';

const phases = [
  {
    index: 'I',
    eyebrow: 'The why',
    title: 'The Game',
    copy: 'Understand probability, the machinery beneath price, and the nature of the environment.',
    href: '/library/fundamentals/what-is-trading',
    range: '01—03',
  },
  {
    index: 'II',
    eyebrow: 'The where',
    title: 'The Map',
    copy: 'Read structure, choose the right timeframe, and locate the levels that matter.',
    href: '/library/fundamentals/market-structure',
    range: '04—06',
  },
  {
    index: 'III',
    eyebrow: 'The how',
    title: 'The Execution',
    copy: 'Confirm the story, define the risk, then execute without letting emotion take over.',
    href: '/library/fundamentals/candlesticks',
    range: '07—09',
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home(): ReactNode {
  const studies = library.filter((item) => item.title.includes('Example'));

  return (
    <Layout title="A personal trading field guide" description="Trading knowledge, rules, strategy and chart studies—organised for deliberate practice.">
      <main className="home">
        <section className="hero-shell">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-inner">
            <p className="kicker"><span /> Personal trading field guide</p>
            <h1>Clarity over<br /><em>certainty.</em></h1>
            <p className="hero-copy">A living collection of trading knowledge, rules and chart studies—organised to turn information into a repeatable process.</p>
            <div className="hero-actions">
              <Link className="button button--primary" to="/library/">Enter the library <Arrow /></Link>
              <Link className="text-link" to="/library/strategy/rules">Review trading rules <span>→</span></Link>
            </div>
            <div className="hero-metrics" aria-label="Library summary">
              <div><strong>19</strong><span>Notes</span></div>
              <div><strong>09</strong><span>Fundamentals</span></div>
              <div><strong>03</strong><span>Chart studies</span></div>
              <div><strong>01</strong><span>Clear process</span></div>
            </div>
          </div>
          <aside className="hero-quote">
            <span className="quote-mark">“</span>
            <blockquote>My strategy is an edge,<br />not a prediction.</blockquote>
            <Link to="/library/manifesto">From the manifesto <Arrow /></Link>
          </aside>
        </section>

        <section className="section curriculum">
          <div className="section-heading">
            <div><p className="kicker"><span /> The curriculum</p><h2>Learn the game<br />in the right order.</h2></div>
            <p>Three phases. Each one changes the question you ask when you look at a chart.</p>
          </div>
          <div className="phase-grid">
            {phases.map((phase) => (
              <Link className="phase-card" to={phase.href} key={phase.index}>
                <div className="phase-top"><span>{phase.index}</span><span>{phase.range}</span></div>
                <p>{phase.eyebrow}</p>
                <h3>{phase.title}</h3>
                <div className="phase-rule" />
                <p className="phase-copy">{phase.copy}</p>
                <span className="phase-link">Begin this phase <Arrow /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section strategy-feature">
          <div className="strategy-copy">
            <p className="kicker"><span /> The playbook</p>
            <h2>Push. Pause.<br /><em>Continue.</em></h2>
            <p>My supply and demand approach looks for indecision within context: a clean pause after momentum, then a retest before continuation.</p>
            <Link className="button button--outline" to="/library/strategy/supply-and-demand/">Open the strategy <Arrow /></Link>
          </div>
          <div className="pattern-card" aria-label="Push, pause and continuation pattern">
            <div className="chart-grid" />
            <div className="candle candle-1" /><div className="candle candle-2" /><div className="candle candle-3" /><div className="candle candle-4" /><div className="candle candle-5" />
            <div className="zone"><span>Indecision zone</span></div>
            <div className="pattern-label pattern-label-a">01 <span>Push</span></div>
            <div className="pattern-label pattern-label-b">02 <span>Pause</span></div>
            <div className="pattern-label pattern-label-c">03 <span>Continuation</span></div>
          </div>
        </section>

        <section className="section studies">
          <div className="section-heading compact">
            <div><p className="kicker"><span /> Applied learning</p><h2>Chart studies.</h2></div>
            <Link className="text-link" to="/library/strategy/supply-and-demand/examples/simple-sell-example">View all examples <span>→</span></Link>
          </div>
          <div className="study-list">
            {studies.map((study, index) => (
              <Link to={study.href} className="study-row" key={study.href}>
                <span className="study-index">0{index + 1}</span>
                <div><h3>{study.title}</h3><p>{study.description}</p></div>
                <span className="study-tag">Chart study</span><Arrow />
              </Link>
            ))}
          </div>
        </section>

        <section className="manifesto-strip">
          <p className="kicker"><span /> Keep this close</p>
          <h2>“I am not here to be right.<br />I am here to be profitable<br />over many trades.”</h2>
          <Link to="/library/manifesto">Read the full manifesto <Arrow /></Link>
        </section>
      </main>
    </Layout>
  );
}
