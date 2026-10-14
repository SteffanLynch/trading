import type {CSSProperties, ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import AffiliateLink from '../components/monetisation/AffiliateLink';
import BookShelf from '../components/monetisation/BookShelf';
import {AffiliateDisclosure} from '../components/monetisation/Disclosure';
import {AMAZON_ASSOCIATE_TAG} from '../data/monetisation';
import {LEGAL_ENTITY_NAME, SITE_NAME} from '../data/legal';
import {BROKER_CHECKLIST, partners, type Partner} from '../data/partners';
import {isPartnerLive, resolvePartnerLink} from '../utils/monetisation';
import useAnchors from '../utils/useAnchors';
import f from './funded.module.css';
import s from './info.module.css';

const vars = (accent: string) => ({'--c': `var(--${accent})`, '--ct': `var(--${accent}-t)`}) as CSSProperties;

function PartnerCard({partner}: {partner: Partner}) {
  const link = resolvePartnerLink(partner);
  const kind = partner.kind === 'broker' ? 'Broker' : partner.kind === 'charting' ? 'Charting' : 'Books';
  return (
    <article className={s.card} style={vars(partner.accent)}>
      <p className={s.cardKind}>{kind}</p>
      <h3>{partner.name}</h3>
      <p className={s.tagline}>{partner.tagline}</p>
      <p>{partner.summary}</p>
      <ul>
        {partner.goodFor.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {partner.kind === 'broker' && partner.riskWarning && <p className={s.risk}>{partner.riskWarning}</p>}
      <div className={s.cardActions}>
        <AffiliateLink link={link} name={partner.id} placement="partners-page">
          {partner.kind === 'books' ? 'Browse Amazon' : `Visit ${partner.name}`}
        </AffiliateLink>
      </div>
    </article>
  );
}

export default function PartnersPage(): ReactNode {
  const url = useBaseUrl('/partners', {absolute: true});
  useAnchors(['charting', 'brokers', 'books']);
  const live = Object.values(partners).filter(isPartnerLive);
  const liveBrokers = live.filter((partner) => partner.kind === 'broker');
  const anyAffiliate = live.some((partner) => resolvePartnerLink(partner).affiliate) || !!AMAZON_ASSOCIATE_TAG?.trim();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Partners and disclosures',
    url,
    isPartOf: {'@type': 'WebSite', name: SITE_NAME},
    publisher: {'@type': 'Organization', name: LEGAL_ENTITY_NAME},
  };

  return (
    <Layout
      title="Partners & Disclosures — How the Site Earns"
      description="Every commercial partner behind this site, how links are labelled, and what the money never changes. Charting, brokers and books, fully disclosed.">
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className={`${f.page} tone-violet`}>
        <section className={f.hero}>
          <div className={f.heroBg} aria-hidden="true" />
          <div className={f.wrap}>
            <p className={f.kicker}>Partners &amp; disclosures</p>
            <h1>
              <span className={f.outline}>Partners,</span> <span className={f.mark}>plainly.</span>
            </h1>
            <p className={f.lede}>
              {SITE_NAME} is free because some partners pay a commission when a visitor chooses to use their product. <strong>This page lists every partner, shows how each link is labelled, and says what the money never changes.</strong>
            </p>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>The ground rules</p>
            <h2 className={f.h2}>What a partner does not get.</h2>
            <ul className={f.promises}>
              <li style={vars('lime')}>
                <strong>No say in the lessons</strong>
                <span>A partner cannot change what a lesson says or how a calculator works. The calculators contain no partner data.</span>
              </li>
              <li style={vars('violet')}>
                <strong>Always labelled</strong>
                <span>A link that can earn a commission is marked “Affiliate link”. A paid placement is marked “Sponsored” or “Ad”.</span>
              </li>
              <li style={vars('cyan')}>
                <strong>No extra cost</strong>
                <span>Following a partner link never adds to what a visitor pays. The partner pays the commission from its own revenue.</span>
              </li>
              <li style={vars('amber')}>
                <strong>Not advice</strong>
                <span>A partner appearing here is not a recommendation, and not financial advice. Every product should be researched independently.</span>
              </li>
            </ul>
            <div className={f.careful}>
              <p>
                <strong>An incentive exists.</strong> A commission gives {SITE_NAME} a reason to feature a product, which is why it is disclosed here and why the partners are limited to the ones below. Read the <Link to="/disclaimer">disclaimer</Link> and <Link to="/how-this-site-is-funded">how this site is funded</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className={f.section} id="charting">
          <div className={f.wrap}>
            <p className={f.eyebrow}>Charting</p>
            <h2 className={f.h2}>Charts to practise on.</h2>
            <p className={`${f.lede} ${s.narrow}`}>The charts in the lessons are illustrative. Practising the same ideas on real charts is the point, and that needs a charting platform.</p>
            <div className={s.cards}>
              <PartnerCard partner={partners.tradingview} />
            </div>
          </div>
        </section>

        <section className={f.section} id="brokers">
          <div className={f.wrap}>
            <p className={f.eyebrow}>Brokers</p>
            <h2 className={f.h2}>Choosing a broker.</h2>
            <p className={`${f.lede} ${s.narrow}`}>
              A broker is the company through which trades are placed. Leveraged products such as forex and CFDs are high risk, and promoting them is regulated in the UK, so broker partners appear here only once the broker has approved how it is presented and supplied its current risk warning.
            </p>
            {liveBrokers.length > 0 ? (
              <div className={s.cards}>
                {liveBrokers.map((broker) => (
                  <PartnerCard key={broker.id} partner={broker} />
                ))}
              </div>
            ) : (
              <div className={s.empty}>
                <p>
                  <strong>No broker partnerships are live at the moment.</strong> No broker link on this website earns a commission today.
                </p>
                <p>The checklist below applies to any broker, partner or not.</p>
              </div>
            )}
            <h3 className={s.subhead}>Seven things to check about any broker</h3>
            <ol className={`${s.checklist} ${s.narrow}`}>
              {BROKER_CHECKLIST.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ol>
            <p className={s.fineprint}>
              Check any firm on the <a href="https://register.fca.org.uk/" rel="noopener noreferrer" target="_blank">FCA Register</a> and read the FCA's <a href="https://www.fca.org.uk/scamsmart" rel="noopener noreferrer" target="_blank">ScamSmart</a> guidance. Trading leveraged products carries a high risk of losing money rapidly.
            </p>
          </div>
        </section>

        <section className={f.section} id="books">
          <div className={f.wrap}>
            <p className={f.eyebrow}>Books</p>
            <h2 className={f.h2}>Books worth reading.</h2>
            <p className={`${f.lede} ${s.narrow}`}>
              Book links go to Amazon.co.uk. {AMAZON_ASSOCIATE_TAG?.trim() ? 'They are affiliate links and are labelled as such.' : 'Today they carry no tracking tag and earn nothing.'} The whole shelf is on the <Link to="/resources#books">resources page</Link>; here is a start.
            </p>
            <div className={s.narrow} style={{marginTop: '2rem'}}>
              <BookShelf topics={['psychology', 'risk']} limit={4} placement="partners-page" title="A good first four" />
            </div>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>At a glance</p>
            <h2 className={f.h2}>Every partner, how it is linked.</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>What it is</th>
                    <th>How it is linked</th>
                  </tr>
                </thead>
                <tbody>
                  {live.map((partner) => {
                    const affiliate = partner.kind === 'books' ? !!AMAZON_ASSOCIATE_TAG?.trim() : resolvePartnerLink(partner).affiliate;
                    return (
                      <tr key={partner.id}>
                        <td>
                          <strong>{partner.name}</strong>
                        </td>
                        <td>{partner.tagline}</td>
                        <td>{affiliate ? 'Affiliate link: a commission may be earned' : 'Plain link: no commission earned today'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {anyAffiliate && <AffiliateDisclosure />}
            <p className={s.fineprint}>
              Advertising and direct sponsorship are separate from affiliate links and are labelled “Ad” or “Sponsored”. Businesses interested in either can read the <Link to="/media-kit">media kit</Link>. Cookies used by partners and advertisers are explained in the <Link to="/privacy#cookies">privacy policy</Link>.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
