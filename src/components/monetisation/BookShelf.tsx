import {AMAZON_ASSOCIATES_STATEMENT, AMAZON_ASSOCIATE_TAG} from '../../data/monetisation';
import {books as allBooks, type BookTopic} from '../../data/books';
import {amazonSearchLink} from '../../utils/monetisation';
import AffiliateLink from './AffiliateLink';
import {AffiliateDisclosure} from './Disclosure';
import {accentVars} from './PartnerCallout';
import styles from './monetisation.module.css';

interface Props {
  /** Show only books for these topics. Omit for the whole shelf. */
  topics?: BookTopic[];
  limit?: number;
  /** With `topics`, list each book once, under the topic it belongs to first. Used where several shelves sit on one page. */
  primaryOnly?: boolean;
  placement: string;
  /** Heading. Omit when the surrounding page already has one. */
  title?: string;
}

/** Book recommendations with links to Amazon.co.uk. Affiliate labelling follows AMAZON_ASSOCIATE_TAG automatically. */
export default function BookShelf({topics, limit, primaryOnly = false, placement, title = 'Further reading'}: Props) {
  const matches = allBooks.filter((book) => !topics || (primaryOnly ? topics.includes(book.topics[0]) : book.topics.some((topic) => topics.includes(topic))));
  const shown = typeof limit === 'number' ? matches.slice(0, limit) : matches;
  if (shown.length === 0) return null;
  const tagged = !!AMAZON_ASSOCIATE_TAG?.trim();

  return (
    <aside className={styles.block} style={accentVars('amber')} aria-label={title}>
      <p className={styles.eyebrow}>{title}</p>
      <ul className={styles.bookList}>
        {shown.map((book) => (
          <li key={book.title}>
            <div>
              <strong>{book.title}</strong>
              <span className={styles.by}>{book.author}</span>
              <span className={styles.why}>{book.why}</span>
            </div>
            <AffiliateLink link={amazonSearchLink(`${book.title} ${book.author}`, AMAZON_ASSOCIATE_TAG)} name="amazon-book" placement={placement} className={styles.textLink}>
              Find on Amazon
            </AffiliateLink>
          </li>
        ))}
      </ul>
      {tagged ? <AffiliateDisclosure>{`${AMAZON_ASSOCIATES_STATEMENT} `}</AffiliateDisclosure> : <p className={styles.fine}>Links go to Amazon.co.uk search results.</p>}
    </aside>
  );
}
