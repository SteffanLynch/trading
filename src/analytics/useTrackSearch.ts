import {useEffect, useRef} from 'react';
import {cleanSearchTerm, type SearchSurface} from '../utils/analytics/events';
import {track} from './index';

/**
 * Reports a site search once the visitor stops typing: the (tidied) words and how many notes matched. Searches that
 * could be personal (an email address, a link, a long number) are not reported at all. Each distinct search is
 * reported once while `active`; closing the search and reopening it starts afresh.
 */
export function useTrackSearch(surface: SearchSurface, query: string, resultCount: number, active = true): void {
  const reported = useRef('');

  useEffect(() => {
    if (!active) reported.current = '';
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    const term = cleanSearchTerm(query);
    if (!term || term === reported.current) return undefined;
    const timer = window.setTimeout(() => {
      reported.current = term;
      track('search_performed', {surface, search_term: term, result_count: resultCount});
    }, 900);
    return () => window.clearTimeout(timer);
  }, [active, surface, query, resultCount]);
}
