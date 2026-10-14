import type {CSSProperties, ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import {library} from '../data/library';
import {LEGAL_COMPANY_NUMBER, LEGAL_CONTACT_EMAIL, LEGAL_ENTITY_NAME, LEGAL_REGISTERED_OFFICE, SITE_NAME} from '../data/legal';
import {AUDIENCE_STATS, MEDIA_KIT_UPDATED, NOT_ACCEPTED, PROCESS, SPONSOR_FORMATS, STANDARDS} from '../data/mediaKit';
import {SPONSORSHIP_CONTACT_EMAIL} from '../data/monetisation';
import {tools} from '../data/tools';
import f from './funded.module.css';
import s from './info.module.css';

const vars = (accent: string) => ({'--c': `var(--${accent})`, '--ct': `var(--${accent}-t)`}) as CSSProperties;

export default function MediaKitPage(): ReactNode {
  const url = useBaseUrl('/media-kit', {absolute: true});
  const logo = useBaseUrl('/img/logo.svg');
  const contactEmail = SPONSORSHIP_CONTACT_EMAIL ?? LEGAL_CONTACT_EMAIL;
  const lessons = library.filter((item) => item.section === 'Fundamentals' || item.section === 'Strategy').length;
  const interactive = tools.filter((tool) => tool.interactive).length;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Trading Spelled Out media kit',
    url,
    isPartOf: {'@type': 'WebSite', name: SITE_NAME},
    publisher: {'@type': 'Organization', name: LEGAL_ENTITY_NAME},
  };

  return (
    <Layout
      title="Media Kit — Sponsor or Advertise Here"
      description="Sponsorship and advertising: formats, standards, how it works and who to contact. Everything paid is labelled, and the site stays free for everyone.">
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className={`${f.page} tone-amber`}>
        <section className={f.hero}>
          <div className={f.heroBg} aria-hidden="true" />
          <div className={f.wrap}>
            <p className={f.kicker}>Media kit · updated {MEDIA_KIT_UPDATED}</p>
            <h1>
              <span className={f.outline}>Sponsor</span> <span className={f.mark}>the tools.</span> Not the truth.
            </h1>
            <p className={f.lede}>
              {SITE_NAME} is a free library of trading lessons and {tools.length} calculators, simulators and visualisers. <strong>Sponsors and advertisers can be seen next to the work, clearly labelled, without ever changing it.</strong>
            </p>
            <div className={`${s.kitBar} ${s.noPrint}`}>
              <button type="button" className={s.kitButton} onClick={() => window.print()}>
                Print or save as PDF
              </button>
              <a className={`${s.kitButton} ${s.kitGhost}`} href={logo} download>
                Download the logo (SVG)
              </a>
            </div>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>At a glance</p>
            <h2 className={f.h2}>What there is to sponsor.</h2>
            <ul className={s.stats}>
              <li>
                <strong>{tools.length}</strong>
                <span>free calculators, simulators and visualisers, {interactive} of them interactive</span>
              </li>
              <li>
                <strong>{lessons}</strong>
                <span>lessons and strategy notes, plus a glossary and a manifesto</span>
              </li>
              <li>
                <strong>£0</strong>
                <span>to the visitor, always: no email, payment or sign-up for any feature</span>
              </li>
              {AUDIENCE_STATS.map((stat) => (
                <li key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>
                    {stat.label} ({stat.source})
                  </span>
                </li>
              ))}
            </ul>
            {AUDIENCE_STATS.length === 0 && <p className={s.fineprint}>Traffic and audience figures are shared directly with enquirers, with the analytics behind them, so that they are always current rather than a number printed here.</p>}
          </div>
        </section>

        <section className={f.section}>
          <div className={`${f.wrap} ${f.steady}`}>
            <p className={f.eyebrow}>Who it is for</p>
            <h2 className={f.h2}>People learning to trade properly.</h2>
            <ul>
              <li>The content is written for newer and developing retail traders, in plain English, with a UK outlook.</li>
              <li>Visitors arrive to size a trade, check a pip value, test an idea or read about risk, which is a moment when tools, charting and education are directly relevant.</li>
              <li>The tone is careful about risk. Brands that are comfortable with that fit best.</li>
            </ul>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>Formats</p>
            <h2 className={f.h2}>Six ways to be here.</h2>
            <div className={s.cards}>
              {SPONSOR_FORMATS.map((format) => (
                <article className={s.card} style={vars(format.accent)} key={format.id}>
                  <p className={s.cardKind}>{format.id.replace(/-/g, ' ')}</p>
                  <h3>{format.name}</h3>
                  <p>
                    <strong>Where:</strong> {format.where}
                  </p>
                  <p>{format.what}</p>
                  <p>
                    <strong>Suits:</strong> {format.suits}
                  </p>
                </article>
              ))}
            </div>
            <p className={s.fineprint}>Rates are agreed per enquiry and depend on placement, period and exclusivity. There is no public price list.</p>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>The standards</p>
            <h2 className={f.h2}>What every sponsor gets, and does not.</h2>
            <ul className={f.promises}>
              {STANDARDS.map((item, index) => (
                <li key={item.title} style={vars(['lime', 'violet', 'cyan', 'amber', 'coral'][index % 5])}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <h3 className={s.subhead}>Not accepted</h3>
            <ul className={`${s.notList} ${s.narrow}`}>
              {NOT_ACCEPTED.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>How it works</p>
            <h2 className={f.h2}>Five steps.</h2>
            <ol className={`${s.checklist} ${s.narrow}`}>
              {PROCESS.map((step) => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>

            <div className={`${s.contactBox} ${s.narrow}`}>
              <h3>Get in touch</h3>
              <p>
                {contactEmail ? (
                  <>
                    Sponsorship and advertising enquiries: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
                  </>
                ) : (
                  <>Sponsorship and advertising enquiries can be sent by post to {LEGAL_ENTITY_NAME}, {LEGAL_REGISTERED_OFFICE}.</>
                )}{' '}
                Please say what is being promoted, to whom, and the dates of interest.
              </p>
            </div>

            <p className={s.fineprint}>
              {SITE_NAME} is a trading name of {LEGAL_ENTITY_NAME}, registered in England and Wales, company number {LEGAL_COMPANY_NUMBER}, registered office {LEGAL_REGISTERED_OFFICE}. This page describes what can be arranged and is not an offer; placements are subject to written agreement and approval. How the site is paid for is explained on <Link to="/how-this-site-is-funded">how this site is funded</Link>, current partners are listed on <Link to="/partners">partners and disclosures</Link>, and cookies are covered in the <Link to="/privacy">privacy policy</Link>.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
