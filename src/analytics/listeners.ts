import type {LinkArea} from '../utils/analytics/events';
import {domainOf, internalPath} from '../utils/analytics/routes';
import {BASE_URL, pageContext} from './context';
import {track} from './index';

/**
 * Site-wide click tracking, done once at the document instead of in every component:
 *
 *  - `mailto:` links, outbound links, pagination ("previous / next lesson"), navbar and footer links,
 *    and anything marked `data-cta="<id>"`;
 *  - opening a tool-page accordion (`<details data-accordion>`).
 *
 * A link that reports itself (partner, sponsor, resource) carries `data-tracked` and is skipped here, so nothing is
 * counted twice. Addresses are never sent: an email link reports only why it was clicked, an outbound link only the
 * destination's domain, an internal link only its path.
 */

const LINK_AREAS: Record<string, LinkArea> = {
  lesson: 'lesson',
  library_index: 'lesson',
  tool: 'tool',
  tools_hub: 'tool',
  resources: 'resources',
  partners: 'partners',
  media_kit: 'media_kit',
  legal: 'legal',
  funding: 'legal',
  home: 'home',
};

function linkArea(anchor: Element): LinkArea {
  if (anchor.closest('.navbar')) return 'navbar';
  if (anchor.closest('footer')) return 'footer';
  return LINK_AREAS[pageContext().page_type ?? ''] ?? 'other';
}

function contactPurpose(): 'sponsorship' | 'legal' | 'general' {
  const type = pageContext().page_type;
  if (type === 'media_kit' || type === 'partners') return 'sponsorship';
  if (type === 'legal' || type === 'funding') return 'legal';
  return 'general';
}

function handleAnchor(anchor: HTMLAnchorElement, middleClick: boolean): void {
  if (anchor.hasAttribute('data-tracked')) return;
  const href = anchor.getAttribute('href');
  if (!href) return;

  if (/^mailto:/i.test(href)) {
    track('contact_email_clicked', {contact_purpose: contactPurpose()});
    return;
  }
  if (middleClick && !/^https?:/i.test(href)) return;

  const origin = window.location.origin;
  const destination = internalPath(anchor.href, origin, BASE_URL);

  const cta = anchor.closest<HTMLElement>('[data-cta]')?.dataset.cta;
  if (cta && !middleClick) {
    track('cta_clicked', {cta_id: cta, ...(destination ? {destination_path: destination} : {})});
    return;
  }
  if (anchor.classList.contains('pagination-nav__link') && !middleClick) {
    track('lesson_nav_clicked', {direction: anchor.classList.contains('pagination-nav__link--next') ? 'next' : 'previous', ...(destination ? {destination_path: destination} : {})});
    return;
  }
  if (destination !== undefined) {
    if (middleClick) return;
    const area = anchor.closest('.navbar') ? 'navbar' : anchor.closest('footer') ? 'footer' : null;
    if (area) track('nav_link_clicked', {nav_area: area, destination_path: destination});
    return;
  }
  const domain = /^https?:/i.test(anchor.href) ? domainOf(anchor.href) : undefined;
  if (domain) track('outbound_link_clicked', {destination_domain: domain, link_area: linkArea(anchor)});
}

function onClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const middleClick = event.type === 'auxclick';
  if (middleClick && event.button !== 1) return;

  // The click arrives before the browser toggles the accordion, so `open` still holds the old state.
  const summary = target.closest('summary');
  const details = summary?.parentElement;
  if (!middleClick && summary && details instanceof HTMLDetailsElement && details.hasAttribute('data-accordion') && !details.open) {
    const title = summary.textContent?.trim() ?? '';
    track('tool_section_opened', {section_title: title, section_variant: details.getAttribute('data-accordion') === 'faq' ? 'faq' : 'section'});
    return;
  }

  const anchor = target.closest('a[href]');
  if (anchor instanceof HTMLAnchorElement) handleAnchor(anchor, middleClick);
}

let installed = false;

export function installListeners(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  // Capture phase: the router changes the page as soon as a link is clicked, and the event should describe the page the click was on.
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);
}
