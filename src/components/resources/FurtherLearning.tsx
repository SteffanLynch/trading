import Link from '@docusaurus/Link';
import {resources, type Resource, type ResourceTopic} from '../../data/resources';
import {youtubeSearchLink} from '../../utils/monetisation';
import {track} from '../../analytics';
import {accentVars} from '../monetisation/PartnerCallout';
import styles from '../monetisation/monetisation.module.css';

/** One recommended resource. Plain outbound links: these are editorial picks, not paid placements. */
export function ResourceItem({resource, placement}: {resource: Resource; placement: string}) {
  return (
    <li className={styles.resItem}>
      <div>
        <p className={styles.resHead}>
          <a href={resource.url} rel="noopener noreferrer" target="_blank" data-tracked onClick={() => track('resource_link_clicked', {resource_id: resource.id, placement})}>
            {resource.name}
            <span className={styles.sr}> (opens in a new tab)</span>
          </a>
          <span className={styles.resType}>{resource.type}</span>
        </p>
        <p className={styles.by}>
          {resource.by} · {resource.level} · {resource.cost === 'Free' ? 'Free' : 'Free content; also sells paid products'}
        </p>
        <p className={styles.why}>{resource.summary}</p>
        {resource.note && <p className={styles.resNote}>{resource.note}</p>}
        {resource.youtubeSearch && (
          <p className={styles.fine}>
            <a href={youtubeSearchLink(resource.youtubeSearch)} rel="noopener noreferrer" target="_blank">
              Find on YouTube
              <span className={styles.sr}> (opens in a new tab)</span>
            </a>
          </p>
        )}
      </div>
    </li>
  );
}

/** A short list of recommended resources for the topics a lesson touches. Renders nothing if there are none. */
export default function FurtherLearning({topics, limit = 3, placement = 'further-learning'}: {topics: ResourceTopic[]; limit?: number; placement?: string}) {
  const matches = resources.filter((resource) => resource.topics.some((topic) => topics.includes(topic))).slice(0, limit);
  if (matches.length === 0) return null;
  return (
    <aside className={styles.block} style={accentVars('lime')} aria-label="Keep learning elsewhere">
      <p className={styles.eyebrow}>Keep learning elsewhere</p>
      <ul className={styles.resList}>
        {matches.map((resource) => (
          <ResourceItem key={resource.id} resource={resource} placement={placement} />
        ))}
      </ul>
      <p className={styles.fine}>
        Independent picks: no creator or publisher pays to be listed. <Link to="/resources">See every recommended resource →</Link>
      </p>
    </aside>
  );
}
