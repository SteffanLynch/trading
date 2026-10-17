const MILESTONES = [25, 50, 75, 100] as const;
export type Milestone = (typeof MILESTONES)[number];

/** The article's own bottom edge counts as the end, so footers, ads and related links below it are not "read". */
const END_TOLERANCE = 0.03;

/**
 * Watches how far down a lesson's text the visitor has scrolled and how long the page has been in view, and reports
 * each of 25 / 50 / 75 / 100 % once. Nothing is reported until the visitor actually scrolls, so a short page that
 * fits on screen is not counted as "read" the moment it loads.
 *
 * It only starts counting once the page has been at the top. Following "Next lesson" from the bottom of one lesson
 * leaves the scroll position far down for a moment (the router scrolls to the top a beat later, and the browser may
 * clamp it first), which would otherwise look like the new lesson had been read to the end. Returns a function that
 * stops watching.
 */
export function watchLessonProgress(onMilestone: (depth: Milestone, engagedSeconds: number) => void): () => void {
  let engaged = 0;
  let frame = 0;
  let reached = 0;
  let armed = window.scrollY < window.innerHeight;

  const timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') engaged += 1;
  }, 1000);

  const article = (): HTMLElement | null => document.querySelector<HTMLElement>('.theme-doc-markdown') ?? document.querySelector<HTMLElement>('article');

  const measure = () => {
    frame = 0;
    if (!armed) armed = window.scrollY < window.innerHeight;
    if (!armed) return;
    const element = article();
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.height <= 0) return;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / rect.height));
    for (const milestone of MILESTONES) {
      const needed = milestone === 100 ? 1 - END_TOLERANCE : milestone / 100;
      if (milestone > reached && progress >= needed) {
        reached = milestone;
        onMilestone(milestone, engaged);
      }
    }
  };

  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(measure);
  };

  window.addEventListener('scroll', onScroll, {passive: true});
  return () => {
    window.clearInterval(timer);
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
  };
}
