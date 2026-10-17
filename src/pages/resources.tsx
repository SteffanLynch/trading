import type {CSSProperties, ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import BookShelf from '../components/monetisation/BookShelf';
import {ResourceItem} from '../components/resources/FurtherLearning';
import VideoEmbed from '../components/resources/VideoEmbed';
import {bookTopics, books} from '../data/books';
import {LEGAL_ENTITY_NAME, SITE_NAME} from '../data/legal';
import {resourceTopics, resources, videos} from '../data/resources';
import useAnchors from '../utils/useAnchors';
import f from './funded.module.css';
import m from '../components/monetisation/monetisation.module.css';
import s from './info.module.css';

const vars = (accent: string) => ({'--c': `var(--${accent})`, '--ct': `var(--${accent}-t)`}) as CSSProperties;
const ACCENTS = ['lime', 'violet', 'cyan', 'amber', 'coral'];

const CRITERIA: {title: string; text: string; accent: string}[] = [
  {title: 'Process over predictions', text: 'It teaches how to think, size and manage a trade. It does not sell signals or promise a result.', accent: 'lime'},
  {title: 'Honest about risk', text: 'It talks openly about losing trades and drawdowns, and does not wave away the risk of loss.', accent: 'violet'},
  {title: 'Free part stands alone', text: 'The free content is useful on its own. Where a creator also sells products, that is stated.', accent: 'cyan'},
  {title: 'Not paid to be here', text: 'No creator, publisher or platform pays to be listed or has any say in the list.', accent: 'amber'},
];

export default function ResourcesPage(): ReactNode {
  const url = useBaseUrl('/resources', {absolute: true});
  useAnchors([...resourceTopics.map((topic) => topic.id), 'books', ...(videos.length > 0 ? ['watch'] : [])]);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Recommended trading education resources',
    url,
    isPartOf: {'@type': 'WebSite', name: SITE_NAME},
    publisher: {'@type': 'Organization', name: LEGAL_ENTITY_NAME},
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: resources.map((resource, index) => ({'@type': 'ListItem', position: index + 1, name: `${resource.name} (${resource.by})`, url: resource.url})),
    },
  };

  return (
    <Layout
      title="Recommended Trading Resources — Channels & Books"
      description="Hand-picked, independent trading education beyond this site: free courses, creators, podcasts, books and the regulators worth knowing. None paid to be listed.">
      <Head>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>
      <main className={`${f.page} tone-lime`}>
        <section className={f.hero}>
          <div className={f.heroBg} aria-hidden="true" />
          <div className={f.wrap}>
            <p className={f.kicker}>Recommended resources</p>
            <h1>
              <span className={f.outline}>Learn from</span> <span className={f.mark}>the best</span> of the rest.
            </h1>
            <p className={f.lede}>
              Free courses, creators, podcasts, books and the official bodies worth knowing, picked by hand and grouped by topic. <strong>No one pays to be on this page.</strong> Where a creator also sells products, it says so.
            </p>
            <ul className={s.topicNav} aria-label="Jump to a topic">
              {resourceTopics.map((topic) => (
                <li key={topic.id}>
                  <a href={`#${topic.id}`}>{topic.label}</a>
                </li>
              ))}
              {videos.length > 0 && (
                <li>
                  <a href="#watch">Watch</a>
                </li>
              )}
              <li>
                <a href="#books">Books</a>
              </li>
            </ul>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>How these are chosen</p>
            <h2 className={f.h2}>A short list, on purpose.</h2>
            <ul className={f.promises}>
              {CRITERIA.map((item) => (
                <li key={item.title} style={vars(item.accent)}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <div className={f.careful}>
              <p>
                <strong>Other people's content.</strong> The views in these resources are the creators' own. Listing one is not an endorsement of any strategy, product or claim, and nothing here is financial advice. Trading carries a high risk of loss. Read the <Link to="/disclaimer">disclaimer</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className={f.section}>
          <div className={f.wrap}>
            <p className={f.eyebrow}>By topic</p>
            <h2 className={f.h2}>Find what to learn next.</h2>
            {resourceTopics.map((topic, index) => {
              const items = resources.filter((resource) => resource.topics.includes(topic.id));
              return (
                <div className={s.topic} id={topic.id} key={topic.id}>
                  <h3>{topic.label}</h3>
                  <p className={s.topicBlurb}>{topic.blurb}</p>
                  <div className={m.block} style={vars(ACCENTS[index % ACCENTS.length])}>
                    <ul className={m.resList}>
                      {items.map((resource) => (
                        <ResourceItem key={resource.id} resource={resource} placement="resources-page" />
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {videos.length > 0 && (
          <section className={f.section} id="watch">
            <div className={f.wrap}>
              <p className={f.eyebrow}>Watch</p>
              <h2 className={f.h2}>Videos worth the time.</h2>
              <div className={s.videoGrid}>
                {videos.map((video) => (
                  <div key={video.id}>
                    <VideoEmbed id={video.id} title={video.title} by={video.by} />
                    <p className={s.videoMeta}>{video.why}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={f.section} id="books">
          <div className={f.wrap}>
            <p className={f.eyebrow}>Books</p>
            <h2 className={f.h2}>The shelf.</h2>
            <p className={`${f.lede} ${s.narrow}`}>
              {books.length} books, grouped by what they help with. Links go to Amazon.co.uk, and any that can earn a commission are labelled. See <Link to="/partners#books">partners and disclosures</Link>.
            </p>
            <div className={s.narrow} style={{display: 'grid', gap: '1.4rem', marginTop: '2rem'}}>
              {bookTopics.map((topic) => (
                <BookShelf key={topic.id} topics={[topic.id]} primaryOnly placement="resources-page" title={topic.label} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
