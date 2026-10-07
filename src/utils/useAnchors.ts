import useBrokenLinks from '@docusaurus/useBrokenLinks';

/**
 * Tells Docusaurus' broken-anchor check about ids that are written by hand rather than through a heading, so other
 * pages can link to them (for example /privacy#cookies) without a false "broken anchor" warning.
 */
export default function useAnchors(ids: readonly string[]): void {
  const brokenLinks = useBrokenLinks();
  for (const id of ids) brokenLinks.collectAnchor(id);
}
