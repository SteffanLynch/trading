import {useState} from 'react';
import {isYouTubeId} from '../../utils/monetisation';
import {track} from '../../analytics';
import styles from '../monetisation/monetisation.module.css';

/**
 * A YouTube video that loads only when played. Until then there is no request to YouTube or Google at all (not even
 * a thumbnail), so embedding videos does not need a cookie choice. Uses youtube-nocookie.com once playing.
 */
export default function VideoEmbed({id, title, by}: {id: string; title: string; by: string}) {
  const [playing, setPlaying] = useState(false);
  if (!isYouTubeId(id)) return null;
  return (
    <figure className={styles.video}>
      <div className={styles.videoFrame}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className={styles.videoPlay} onClick={() => {
              setPlaying(true);
              track('video_played', {video_id: id, placement: 'resources-page'});
            }} aria-label={`Play video: ${title}`}>
            <span aria-hidden="true" className={styles.videoIcon}>
              ▶
            </span>
            <strong>{title}</strong>
            <span>{by}</span>
          </button>
        )}
      </div>
      <figcaption>
        {playing ? 'Playing from YouTube (Google), which may set cookies.' : 'Pressing play loads the video from YouTube (Google), which may set cookies.'}
      </figcaption>
    </figure>
  );
}
