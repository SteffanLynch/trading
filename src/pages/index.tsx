import {useState, type CSSProperties, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HeroChart from '../components/home/HeroChart';
import HeroTicket from '../components/home/HeroTicket';
import {library} from '../data/library';
import {groupTone, tools, type Tone} from '../data/tools';
import styles from './home.module.css';

const style = (vars: Record<string, string>) => vars as CSSProperties;

/** Fill colour, text-safe colour and the text colour that sits on the fill, per tone. */
const TONES: Record<Tone, {fill: string; text: string; on: string}> = {
  violet: {fill: 'var(--violet)', text: 'var(--violet-t)', on: 'var(--on-violet)'},
  amber: {fill: 'var(--amber)', text: 'var(--amber-t)', on: '#0a0d14'},
  coral: {fill: 'var(--coral)', text: 'var(--coral-t)', on: '#0a0d14'},
  cyan: {fill: 'var(--cyan)', text: 'var(--cyan-t)', on: '#0a0d14'},
  lime: {fill: 'var(--lime)', text: 'var(--lime-t)', on: '#0a0d14'},
};
const toneVars = (tone: Tone) => style({'--c': TONES[tone].fill, '--ct': TONES[tone].text, '--on': TONES[tone].on});

const BAND_A = ['Risk 1%', 'Stop set, not moved', 'R:R 1 : 2', 'Process over outcome', 'Break-even 33.3%', 'Size the trade', 'The next 20 trades', 'If there is no setup, there is no trade'];
const BAND_B = ['Enough is better than everything', '0.20 lots', 'The market owes nothing to anyone', 'Execute, don’t predict', '+2R', '−1R', 'Keep it simple', 'Free for everyone · no email · no payment'];

function Band({items, className}: {items: string[]; className: string}) {
  const track = (hidden: boolean) => (
    <div className={styles.track} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item}>
          {item} <i aria-hidden="true">✦</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`${styles.band} ${className}`}>
      {track(false)}
      {track(true)}
    </div>
  );
}

/** A small illustration of the Trade Planner's ladder with lines that drift, as if being dragged. */
function LadderIllustration() {
  return (
    <svg className={styles.ladder} viewBox="0 0 360 320" role="img" aria-label="An illustration of the Trade Planner: a target line, an entry line and a stop line with the money each is worth">
      <rect x="40" y="46" width="300" height="118" rx="14" fill="rgba(98,230,144,0.3)" />
      <rect x="40" y="164" width="300" height="86" rx="14" fill="rgba(255,98,115,0.26)" />
      <g className={styles.driftTarget}>
        <line x1="40" x2="340" y1="46" y2="46" stroke="#c8ff4d" strokeWidth="3" />
        <circle cx="26" cy="46" r="11" fill="#c8ff4d" />
        <text x="44" y="36" className={styles.ladderLabel} fill="#c8ff4d">TARGET</text>
        <text x="336" y="36" textAnchor="end" className={styles.ladderMoney} fill="#c8ff4d">+$200.00</text>
      </g>
      <line x1="40" x2="340" y1="164" y2="164" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="6 6" />
      <text x="44" y="184" className={styles.ladderLabel} fill="#fff">ENTRY</text>
      <g className={styles.driftStop}>
        <line x1="40" x2="340" y1="250" y2="250" stroke="#ff7482" strokeWidth="3" />
        <circle cx="26" cy="250" r="11" fill="#ff7482" />
        <text x="44" y="272" className={styles.ladderLabel} fill="#ff7482">STOP</text>
        <text x="336" y="272" textAnchor="end" className={styles.ladderMoney} fill="#ff7482">−$100.00</text>
      </g>
      <text x="190" y="112" textAnchor="middle" className={styles.ladderPips}>100 pips</text>
      <text x="190" y="212" textAnchor="middle" className={styles.ladderPips}>50 pips</text>
    </svg>
  );
}

const MANTRAS: {text: string; tone: Tone; size: 's' | 'm' | 'l'}[] = [
  {text: 'The market owes nothing to anyone.', tone: 'lime', size: 'l'},
  {text: 'The stop loss is set. It is not moved.', tone: 'coral', size: 'm'},
  {text: 'The goal is to be profitable over many trades.', tone: 'cyan', size: 'm'},
  {text: 'If there is no clear setup, there is no trade.', tone: 'amber', size: 'l'},
  {text: 'Trust the system that was built.', tone: 'violet', size: 's'},
  {text: 'The job is not to predict. The job is to execute.', tone: 'lime', size: 'm'},
  {text: 'Enough is better than everything.', tone: 'coral', size: 's'},
];

const PATH_TONES: Tone[] = ['violet', 'cyan', 'lime', 'amber', 'coral'];

export default function Home(): ReactNode {
  const [active, setActive] = useState<string | null>(null);
  const fundamentals = library.filter((item) => item.section === 'Fundamentals');
  const strategy = ['What is a Trading Plan?', 'Trading Rules', 'Supply and Demand Strategy', 'Break and Retest Strategy']
    .map((title) => library.find((item) => item.title === title))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const activeTool = tools.find((tool) => tool.slug === active);
  const sizes = ['xl', 'm', 'l', 's', 'm', 'xl', 's', 'l', 'm', 's', 'l', 'm', 'l', 's', 'm', 'xl', 's', 'm', 'l', 's', 'm', 'l'];

  return (
    <Layout title="Trading Notes" description={`A free trading field guide: plain-English lessons, strict rules and ${tools.length} calculators and simulators that do the maths. No email, no payment, no paywalls.`}>
      <main className={styles.home}>
        {/* ---------------------------------------------------------------- hero */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.chip}>
                <i aria-hidden="true" /> Everything free · no email · no payment
              </p>
              <h1 className={styles.title}>
                <span className={styles.line}>Learn the market.</span>
                <span className={styles.line}>
                  <span className={styles.mark}>Size the trade.</span>
                </span>
                <span className={`${styles.line} ${styles.outline}`}>Keep the discipline.</span>
              </h1>
              <p className={styles.lede}>
                A plain-English trading field guide: clear lessons, strict rules, and {tools.length} calculators and simulators that do the maths so the thinking can stay on the trade. Not a course. Not advice. <strong>Free for everyone, always.</strong>
              </p>
              <div className={styles.actions}>
                <Link className="button button--primary" to="/tools/trade-planner">
                  Open the Trade Planner <span aria-hidden="true">↗</span>
                </Link>
                <Link className="button button--outline" to="/library/">
                  Read the library
                </Link>
              </div>
              <dl className={styles.stats}>
                <div>
                  <dt>Free tools</dt>
                  <dd style={style({'--c': 'var(--lime-t)'})}>{tools.length}</dd>
                </div>
                <div>
                  <dt>Core lessons</dt>
                  <dd style={style({'--c': 'var(--violet-t)'})}>9</dd>
                </div>
                <div>
                  <dt>Emails asked for</dt>
                  <dd style={style({'--c': 'var(--coral-t)'})}>0</dd>
                </div>
              </dl>
            </div>

            <div className={styles.stage}>
              <div className={styles.chartCard}>
                <HeroChart />
              </div>
              <span className={`${styles.sticker} ${styles.stickerWin}`} aria-hidden="true">+2R</span>
              <span className={`${styles.sticker} ${styles.stickerLose}`} aria-hidden="true">−1R</span>
              <div className={styles.ticketSlot}>
                <HeroTicket />
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- bands */}
        <div className={styles.bands} aria-hidden="true">
          <Band items={BAND_A} className={styles.bandA} />
          <Band items={BAND_B} className={styles.bandB} />
        </div>

        {/* -------------------------------------------------------------- tools */}
        <section className={styles.section} id="tools">
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>The toolbox</p>
            <h2 className={styles.h2}>
              {tools.length} tools. <span className={styles.strike}>Zero</span> sign-ups.
            </h2>
            <p className={styles.sectionLede}>Never do a calculation the website could do for you. Every result updates as you type and shows its working. Tools marked ✦ are interactive: move things and watch what happens.</p>

            <div className={styles.spot}>
              <div className={styles.spotBlob} aria-hidden="true" />
              <div className={styles.spotCopy}>
                <p className={styles.spotTag}>Flagship</p>
                <h3>Trade Planner</h3>
                <p>
                  Enter one trade and see the position size, the money at risk, the potential profit and the risk-to-reward — then drag the stop and target on the chart and watch every number move.
                </p>
                <ul>
                  <li>Lots, units and exact money at risk</li>
                  <li>Draggable stop and target</li>
                  <li>Share the plan as a link</li>
                </ul>
                <Link className="button button--primary" to="/tools/trade-planner">
                  Plan a trade <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className={styles.spotArt}>
                <LadderIllustration />
              </div>
            </div>

            <div className={styles.cloud} onMouseLeave={() => setActive(null)}>
              {tools.map((tool, index) => (
                <Link
                  key={tool.slug}
                  to={tool.path}
                  className={styles.pill}
                  data-size={sizes[index % sizes.length]}
                  style={toneVars(groupTone[tool.group])}
                  onMouseEnter={() => setActive(tool.slug)}
                  onFocus={() => setActive(tool.slug)}
                  onBlur={() => setActive(null)}>
                  {tool.name}
                  {tool.interactive && <em className={styles.spark} title="Interactive" aria-label="interactive">✦</em>}
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
            <p className={styles.caption} aria-live="polite">
              {activeTool ? (
                <>
                  <b style={toneVars(groupTone[activeTool.group])}>{activeTool.group}</b> {activeTool.summary}
                </>
              ) : (
                <span className={styles.captionIdle}>Hover a tool to see what it does →</span>
              )}
            </p>
            <p className={styles.seeAll}>
              <Link className="text-link" to="/tools">
                See all the tools <span>→</span>
              </Link>
            </p>
          </div>
        </section>

        {/* --------------------------------------------------------------- free */}
        <section className={styles.free}>
          <div className={styles.freeInner}>
            <div className={styles.freeTag} aria-hidden="true">
              <span>£0</span>
              <small>forever</small>
            </div>
            <div className={styles.freeCopy}>
              <p className={styles.eyebrowDark}>The deal</p>
              <h2>
                Free. <span>Really.</span>
              </h2>
              <p className={styles.freeLede}>
                Every lesson and every tool on this site is free, for everyone. There is no account, no paywall and no catch. <strong>Trading Notes will never ask for an email address or a payment for any feature.</strong>
              </p>
              <ul className={styles.nevers}>
                <li><s>Email address</s></li>
                <li><s>Payment</s></li>
                <li><s>Paywall</s></li>
                <li><s>Sign-up</s></li>
                <li><s>Free trial</s></li>
                <li><s>Premium tier</s></li>
              </ul>
              <p className={styles.freeHow}>
                How is that possible? The site is funded by <strong>affiliate commissions</strong> and <strong>advertising</strong>, nothing else. Both are labelled, and neither changes a calculation or a lesson.
              </p>
              <Link className={styles.freeButton} to="/how-this-site-is-funded">
                See exactly how it is funded <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- manifesto */}
        <section className={styles.manifesto}>
          <div className={styles.manifestoInner}>
            <p className={styles.eyebrowLight}>The manifesto · read before every session</p>
            <blockquote className={styles.quote}>
              <span aria-hidden="true">“</span>
              It’s not about the next trade. It’s about the <em>next 20 trades.</em>
            </blockquote>
            <div className={styles.mantras}>
              {MANTRAS.map((mantra, index) => (
                <span key={mantra.text} className={styles.mantra} data-size={mantra.size} data-i={index % 4} style={toneVars(mantra.tone)}>
                  {mantra.text}
                </span>
              ))}
            </div>
            <Link className="button button--primary" to="/library/manifesto">
              Read the manifesto <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        {/* --------------------------------------------------------------- path */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>The library</p>
            <h2 className={styles.h2}>
              Nine lessons. <span className={styles.wave}>One path.</span>
            </h2>
            <p className={styles.sectionLede}>Start at the top. Each lesson builds on the last, and none of them needs a chart to make sense.</p>

            <ol className={styles.path}>
              {fundamentals.map((item, index) => {
                const tone = PATH_TONES[index % PATH_TONES.length];
                return (
                  <li key={item.href} className={styles.step} style={toneVars(tone)}>
                    <Link to={item.href}>
                      <span className={styles.stepNum} aria-hidden="true">
                        {item.number ?? String(index + 1).padStart(2, '0')}
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------- strategy + reference */}
        <section className={`${styles.section} ${styles.duoSection}`}>
          <div className={styles.wrap}>
            <div className={styles.duo}>
              <div className={styles.panelStrategy}>
                <p className={styles.panelTag}>Strategy</p>
                <h2>The strategy, written down</h2>
                <p className={styles.panelLede}>The plan, the rules and the two setups. Written down so nothing has to be argued in the middle of a trade.</p>
                <ul>
                  {strategy.map((item) => (
                    <li key={item.href}>
                      <Link to={item.href}>
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                        <i aria-hidden="true">↗</i>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.panelReference}>
                <p className={styles.panelTag}>Reference</p>
                <h2>Words, defined.</h2>
                <p className={styles.panelLede}>Pips, lots, leverage, liquidity: the vocabulary in plain English.</p>
                <Link className={styles.bigLink} to="/library/glossary">
                  Open the glossary <span aria-hidden="true">↗</span>
                </Link>
                <Link className={styles.bigLinkAlt} to="/search">
                  Search everything <span aria-hidden="true">⌕</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------- cta */}
        <section className={styles.cta}>
          <div className={styles.ctaBlobA} aria-hidden="true" />
          <div className={styles.ctaBlobB} aria-hidden="true" />
          <div className={styles.ctaInner}>
            <h2>Stop guessing your size.</h2>
            <p>Put in your account, your stop and your risk. Get the exact position in a second.</p>
            <div className={styles.actions}>
              <Link className="button button--primary" to="/tools/position-size-calculator">
                Calculate position size <span aria-hidden="true">↗</span>
              </Link>
              <Link className={`button ${styles.ghostOnDark}`} to="/tools">
                Browse all tools
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
