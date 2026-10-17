/**
 * Turns a URL into the safe, low-cardinality description of a page that analytics is allowed to see.
 *
 * Calculator pages put the visitor's inputs in the address (`?balance=25000&risk=0.5`), so a raw URL must never reach
 * an analytics tool. Everything here works from the path alone; the query string and hash are dropped, and only a
 * fixed list of campaign tags (`utm_*`) can be carried across. Pure, so it can be unit tested.
 */

export type PageType = 'home' | 'lesson' | 'library_index' | 'tool' | 'tools_hub' | 'search' | 'legal' | 'partners' | 'resources' | 'media_kit' | 'funding' | 'not_found' | 'other';
export type ContentSection = 'fundamentals' | 'strategy' | 'reference';

export interface PageContext {
  page_type: PageType;
  /** The route as a pattern, e.g. "/library/fundamentals/[lesson]" or "/tools/[tool]". */
  route_name: string;
  /** Lessons only. */
  content_section?: ContentSection;
  content_slug?: string;
  /** Tool pages only. */
  tool_slug?: string;
}

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

const STATIC_PAGES: Record<string, PageType> = {
  '/': 'home',
  '/library': 'library_index',
  '/search': 'search',
  '/tools': 'tools_hub',
  '/disclaimer': 'legal',
  '/privacy': 'legal',
  '/how-this-site-is-funded': 'funding',
  '/partners': 'partners',
  '/resources': 'resources',
  '/media-kit': 'media_kit',
};

const SLUG = '[a-z0-9][a-z0-9-]{0,79}';
const LESSON = new RegExp(`^/library/(fundamentals|strategy)/(${SLUG})$`);
const REFERENCE = new RegExp(`^/library/(glossary|manifesto)$`);
const TOOL = new RegExp(`^/tools/(${SLUG})$`);

/** Only these characters may appear in a reported path. Anything else is reported as "/[other]". */
const SAFE_PATH = /^\/[a-z0-9\-_/.]{0,149}$/;

/**
 * The path with the site's base URL, query string, hash and trailing slash removed, in lower case.
 * Returns "/" for the home page.
 */
export function normalisePathname(pathname: string, baseUrl = '/'): string {
  let path = (pathname ?? '').split(/[?#]/, 1)[0].toLowerCase();
  const base = baseUrl.replace(/\/+$/, '').toLowerCase();
  if (base && (path === base || path.startsWith(`${base}/`))) path = path.slice(base.length);
  path = `/${path.split('/').filter(Boolean).join('/')}`;
  return path;
}

/** The path to report: normalised, and "/[other]" if it holds anything unexpected. */
export function analyticsPagePath(pathname: string, baseUrl = '/'): string {
  const path = normalisePathname(pathname, baseUrl);
  return SAFE_PATH.test(path) ? path : '/[other]';
}

export function classifyPage(pathname: string, baseUrl = '/'): PageContext {
  const path = normalisePathname(pathname, baseUrl);
  const staticType = STATIC_PAGES[path];
  if (staticType) return {page_type: staticType, route_name: path};

  const lesson = LESSON.exec(path);
  if (lesson) return {page_type: 'lesson', route_name: `/library/${lesson[1]}/[lesson]`, content_section: lesson[1] as ContentSection, content_slug: lesson[2]};

  const reference = REFERENCE.exec(path);
  if (reference) return {page_type: 'lesson', route_name: path, content_section: 'reference', content_slug: reference[1]};

  const tool = TOOL.exec(path);
  if (tool) return {page_type: 'tool', route_name: '/tools/[tool]', tool_slug: tool[1]};

  return {page_type: 'other', route_name: '/[other]'};
}

/** The same page as a full URL with no query string or hash. `origin` is `window.location.origin`. */
export function analyticsPageUrl(origin: string, pathname: string, baseUrl = '/'): string {
  const path = analyticsPagePath(pathname, baseUrl);
  return `${origin.replace(/\/+$/, '')}${baseUrl.replace(/\/+$/, '')}${path}`;
}

/**
 * Campaign tags worth keeping from a landing URL. Only the five standard UTM keys, only short plain values; anything
 * that looks like a link, an address or a token is dropped.
 */
export function campaignParams(search: string): Partial<Record<UtmKey, string>> {
  const found: Partial<Record<UtmKey, string>> = {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return found;
  }
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value && value.length <= 100 && /^[A-Za-z0-9 _.,:+~/-]+$/.test(value) && !value.includes('://')) found[key] = value;
  }
  return found;
}

/** Page URL for Google Analytics: the safe URL plus any campaign tags, so campaign reports still work. */
export function analyticsPageUrlWithCampaign(origin: string, pathname: string, search: string, baseUrl = '/'): string {
  const base = analyticsPageUrl(origin, pathname, baseUrl);
  const campaign = campaignParams(search);
  const query = new URLSearchParams(campaign as Record<string, string>).toString();
  return query ? `${base}?${query}` : base;
}

const DOMAIN = /^(?:[a-z0-9-]+\.)+[a-z]{2,63}$/;

/** The registrable-looking host of a URL ("www." removed), or undefined if it is not a valid public domain. */
export function domainOf(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return DOMAIN.test(host) ? host : undefined;
  } catch {
    return undefined;
  }
}

/** The site a visitor came from, without the path. Undefined for direct visits and for the site itself. */
export function referringDomain(referrer: string, ownHostname: string): string | undefined {
  if (!referrer) return undefined;
  const domain = domainOf(referrer);
  const own = ownHostname.toLowerCase().replace(/^www\./, '');
  return domain && domain !== own ? domain : undefined;
}

/** The path of a same-site link, or undefined for anything else. */
export function internalPath(href: string, origin: string, baseUrl = '/'): string | undefined {
  try {
    const url = new URL(href, origin);
    if (url.origin !== origin) return undefined;
    return analyticsPagePath(url.pathname, baseUrl);
  } catch {
    return undefined;
  }
}
