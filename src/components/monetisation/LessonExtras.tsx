import {placementForLesson} from '../../data/placements';
import FurtherLearning from '../resources/FurtherLearning';
import AdSlot from './AdSlot';
import BookShelf from './BookShelf';
import PartnerCallout from './PartnerCallout';
import SponsorBanner from './SponsorBanner';
import styles from './monetisation.module.css';

/**
 * Everything that appears under a lesson: independent further learning first, then books, then any partner, then the
 * ad slot. Driven by data/placements.ts, so lessons need no per-file markup.
 */
export default function LessonExtras({permalink}: {permalink: string}) {
  const placement = placementForLesson(permalink);
  const where = `lesson:${permalink.replace(/\/+$/, '')}`;
  return (
    <div className={styles.extras}>
      <SponsorBanner placements={[where, 'all-lessons']} />
      {placement.resources && <FurtherLearning topics={placement.resources} placement={where} />}
      {placement.books && <BookShelf topics={placement.books} limit={3} placement={where} />}
      {placement.partners && <PartnerCallout ids={placement.partners} placement={where} />}
      <AdSlot slot="lesson" />
    </div>
  );
}
