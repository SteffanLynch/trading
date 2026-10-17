import {analyticsPagePath, analyticsPageUrl, campaignParams} from './routes';

/**
 * The analytics event catalogue and the privacy boundary around it. Pure, so it can be unit tested.
 *
 *  - `EventMap` is the typed list of events the site can send, and what each one carries.
 *  - `sanitizeCapture` is the only way properties reach PostHog: anything not declared here is dropped, free text is
 *    limited to the shapes allowed below, and the page URL is always rebuilt from the path (never the raw address,
 *    which can contain the numbers typed into a calculator).
 *  - `gaEventFor` decides which events Google Analytics gets and with which parameters. It gets a short, safe list:
 *    never a calculator value or a search word.
 */

export type Value = string | number | boolean;
export type PlainProps = Record<string, Value>;

export type SearchSurface = 'palette' | 'page';
export type LinkArea = 'lesson' | 'tool' | 'resources' | 'partners' | 'media_kit' | 'legal' | 'navbar' | 'footer' | 'home' | 'other';

interface PageviewProps {
  $current_url: string;
  $pathname: string;
  $referring_domain?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

type NoProps = Record<never, never>;

export interface EventMap {
  $pageview: PageviewProps;
  $pageleave: NoProps;

  // Reading
  lesson_scroll_depth: {depth_percent: 25 | 50 | 75 | 100; engaged_seconds: number};
  lesson_nav_clicked: {direction: 'previous' | 'next'; destination_path?: string};
  image_expanded: NoProps;

  // Tools
  /** Every input and every computed output goes to PostHog as flat snake_case properties, on top of the two below. */
  calculator_calculated: {calculator_name: string; placement: 'page' | 'embedded'} & Record<string, unknown>;
  calculator_link_copied: {calculator_name: string};
  calculator_reset: {calculator_name: string};
  tool_section_opened: {section_title: string; section_variant: 'section' | 'faq'};

  // Search
  search_opened: {surface: SearchSurface; method: 'shortcut' | 'button' | 'page_load'};
  search_performed: {surface: SearchSurface; search_term: string; result_count: number};
  search_result_clicked: {surface: SearchSurface; position: number; destination_path: string};

  // Money and outbound
  partner_link_clicked: {partner: string; placement: string; affiliate: boolean};
  sponsor_link_clicked: {sponsor: string};
  resource_link_clicked: {resource_id: string; placement: string};
  video_played: {video_id: string; placement: string};
  outbound_link_clicked: {destination_domain: string; link_area: LinkArea};
  contact_email_clicked: {contact_purpose: 'sponsorship' | 'legal' | 'general'};

  // Navigation
  nav_link_clicked: {nav_area: 'navbar' | 'footer'; destination_path: string};
  cta_clicked: {cta_id: string; destination_path?: string};
  page_not_found: {requested_path: string};
}

export type EventName = keyof EventMap;

/** What `track()` adds to every event so any report can be cut by page type, section or tool. */
export interface ContextProps {
  page_type?: string;
  route_name?: string;
  content_section?: string;
  content_slug?: string;
  tool_slug?: string;
  tool_group?: string;
  color_mode?: string;
  deployment_environment?: string;
  schema_version?: number;
}

export type Validator = (value: unknown) => Value | undefined;

const oneOf =
  (...allowed: Value[]): Validator =>
  (value) =>
    allowed.includes(value as Value) ? (value as Value) : undefined;

const bool: Validator = (value) => (typeof value === 'boolean' ? value : undefined);

const integer =
  (min: number, max: number): Validator =>
  (value) =>
    typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : undefined;

const seconds: Validator = (value) => (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 86_400 ? Math.round(value) : undefined);

/** A short lower-case identifier: letters, digits and `_ . : / + -` (placements such as "lesson:/library/x" fit). */
const identifier: Validator = (value) => (typeof value === 'string' && /^[a-z0-9][a-z0-9_.:/+-]{0,95}$/.test(value) && !value.includes('//') ? value : undefined);

const DOMAIN = /^(?:[a-z0-9-]+\.)+[a-z]{2,63}$/;
const domain: Validator = (value) => (typeof value === 'string' && DOMAIN.test(value) ? value : undefined);

const path: Validator = (value) => (typeof value === 'string' && value.startsWith('/') && analyticsPagePath(value) === value ? value : undefined);

/** Fixed text written in this codebase (an accordion title). Never a URL, never markup. */
const staticText: Validator = (value) => {
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  // eslint-disable-next-line no-control-regex
  return text.length >= 1 && text.length <= 120 && !/[<>\u0000-\u001f]/.test(text) && !/^(?:https?:)?\/\//i.test(text) ? text : undefined;
};

/** A YouTube video ID, the only free-looking value that identifies a video. */
const youtubeId: Validator = (value) => (typeof value === 'string' && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : undefined);

/**
 * What someone typed into the site search. Lower-cased and tidied; dropped when it could be personal (an email
 * address, a link, a long number) or is too long to be a search.
 */
export function cleanSearchTerm(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const term = value.toLowerCase().replace(/\s+/g, ' ').trim();
  if (term.length < 2 || term.length > 60) return undefined;
  if (/[@<>]/.test(term) || /\d{5,}/.test(term) || /(?:https?:|www\.|\.com\b)/.test(term)) return undefined;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f]/.test(term)) return undefined;
  return term;
}
const searchTerm: Validator = cleanSearchTerm;

const utm: Validator = (value) => {
  if (typeof value !== 'string') return undefined;
  const found = campaignParams(`utm_source=${encodeURIComponent(value)}`).utm_source;
  return found;
};

/** A number, flag or short plain label typed into or computed by a calculator. */
const calculatorValue: Validator = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) <= 1e15 ? Number(value.toFixed(6)) : undefined;
  if (typeof value === 'string') return /^[A-Za-z0-9 _.:/+-]{1,40}$/.test(value) && !/^(?:https?:)?\/\//i.test(value) ? value : undefined;
  return undefined;
};
const CALCULATOR_KEY = /^[a-z][a-z0-9_]{0,47}$/;
const MAX_CALCULATOR_PROPERTIES = 40;

/** Events whose properties beyond the declared ones are free-form (within the limits above): the calculators' inputs and outputs. */
const FREE_FORM_EVENTS: ReadonlySet<string> = new Set(['calculator_calculated']);

type Schema = Record<string, Validator>;

const SEARCH_SURFACE = oneOf('palette', 'page');

const SCHEMA: Record<EventName, Schema> = {
  $pageview: {utm_source: utm, utm_medium: utm, utm_campaign: utm, utm_term: utm, utm_content: utm},
  $pageleave: {},
  lesson_scroll_depth: {depth_percent: oneOf(25, 50, 75, 100), engaged_seconds: seconds},
  lesson_nav_clicked: {direction: oneOf('previous', 'next'), destination_path: path},
  image_expanded: {},
  calculator_calculated: {calculator_name: identifier, placement: oneOf('page', 'embedded')},
  calculator_link_copied: {calculator_name: identifier},
  calculator_reset: {calculator_name: identifier},
  tool_section_opened: {section_title: staticText, section_variant: oneOf('section', 'faq')},
  search_opened: {surface: SEARCH_SURFACE, method: oneOf('shortcut', 'button', 'page_load')},
  search_performed: {surface: SEARCH_SURFACE, search_term: searchTerm, result_count: integer(0, 10_000)},
  search_result_clicked: {surface: SEARCH_SURFACE, position: integer(1, 200), destination_path: path},
  partner_link_clicked: {partner: identifier, placement: identifier, affiliate: bool},
  sponsor_link_clicked: {sponsor: identifier},
  resource_link_clicked: {resource_id: identifier, placement: identifier},
  video_played: {video_id: youtubeId, placement: identifier},
  outbound_link_clicked: {destination_domain: domain, link_area: oneOf('lesson', 'tool', 'resources', 'partners', 'media_kit', 'legal', 'navbar', 'footer', 'home', 'other')},
  contact_email_clicked: {contact_purpose: oneOf('sponsorship', 'legal', 'general')},
  nav_link_clicked: {nav_area: oneOf('navbar', 'footer'), destination_path: path},
  cta_clicked: {cta_id: identifier, destination_path: path},
  page_not_found: {requested_path: path},
};

export const EVENT_NAMES: ReadonlySet<string> = new Set(Object.keys(SCHEMA));

/** Properties the site adds to every event. */
const CONTEXT: Record<keyof ContextProps, Validator> = {
  page_type: oneOf('home', 'lesson', 'library_index', 'tool', 'tools_hub', 'search', 'legal', 'partners', 'resources', 'media_kit', 'funding', 'not_found', 'other'),
  route_name: (value) => (typeof value === 'string' && /^\/[a-z0-9\-_/[\]]{0,100}$/.test(value) ? value : undefined),
  content_section: oneOf('fundamentals', 'strategy', 'reference'),
  content_slug: (value) => (typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value) ? value : undefined),
  tool_slug: (value) => (typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value) ? value : undefined),
  tool_group: staticText,
  color_mode: oneOf('dark', 'light'),
  deployment_environment: oneOf('production', 'test'),
  schema_version: integer(1, 99),
};

const text160: Validator = (value) => (typeof value === 'string' && value.length <= 160 && !/[?#\u0000-\u001f]/.test(value) ? value : undefined);
const number: Validator = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);
const prevPath: Validator = (value) => (typeof value === 'string' && value.startsWith('/') && analyticsPagePath(value) === value ? value : undefined);

/**
 * The properties PostHog's own library adds that are safe and useful. Everything else it adds (the raw user agent,
 * the full referrer URL, person-property initials, feature-flag state, debug fields) is dropped.
 * `$current_url`, `$pathname` and `$host` are rebuilt from the location below; the values PostHog supplies are ignored.
 */
const POSTHOG_STANDARD: Record<string, Validator> = {
  $os: text160,
  $os_version: text160,
  $browser: text160,
  $browser_version: number,
  $browser_language: text160,
  $device_type: text160,
  $timezone: text160,
  $screen_height: number,
  $screen_width: number,
  $viewport_height: number,
  $viewport_width: number,
  $lib: text160,
  $lib_version: text160,
  $insert_id: text160,
  $time: number,
  $device_id: text160,
  $session_id: text160,
  $window_id: text160,
  $pageview_id: text160,
  $prev_pageview_id: text160,
  $is_identified: bool,
  $process_person_profile: bool,
  $referring_domain: (value) => (value === '$direct' ? value : domain(value)),
  $prev_pageview_pathname: prevPath,
  $prev_pageview_duration: number,
  $prev_pageview_last_scroll: number,
  $prev_pageview_last_scroll_percentage: number,
  $prev_pageview_max_scroll: number,
  $prev_pageview_max_scroll_percentage: number,
  $prev_pageview_last_content: number,
  $prev_pageview_last_content_percentage: number,
  $prev_pageview_max_content: number,
  $prev_pageview_max_content_percentage: number,
  distinct_id: text160,
  $anon_distinct_id: text160,
  token: text160,
  uuid: text160,
};

export interface Location {
  /** `window.location.origin`. */
  origin: string;
  hostname: string;
  pathname: string;
  baseUrl?: string;
}

/**
 * The properties that may be sent to PostHog for one event, or null if the event is not in the catalogue and must
 * be dropped. Used both for our own events and, from PostHog's `before_send` hook, for the ones its library creates.
 */
export function sanitizeCapture(event: string, properties: Record<string, unknown>, location: Location): PlainProps | null {
  if (!EVENT_NAMES.has(event)) return null;
  const schema = SCHEMA[event as EventName];
  const freeForm = FREE_FORM_EVENTS.has(event);
  const clean: PlainProps = {};
  let freeCount = 0;

  for (const [key, raw] of Object.entries(properties)) {
    if (key === '$current_url' || key === '$pathname' || key === '$host') continue;
    const validator = own(POSTHOG_STANDARD, key) ?? own(CONTEXT, key) ?? own(schema, key);
    let value: Value | undefined;
    if (validator) value = validator(raw);
    else if (freeForm && CALCULATOR_KEY.test(key) && freeCount < MAX_CALCULATOR_PROPERTIES) {
      value = calculatorValue(raw);
      if (value !== undefined) freeCount += 1;
    }
    if (value !== undefined) clean[key] = value;
  }

  const baseUrl = location.baseUrl ?? '/';
  // The page an event belongs to is the one it was raised on, which PostHog records as `$pathname`. By the time its
  // library hands the event over, the visitor may already have moved on (a link was followed), so prefer that over the
  // current location. Either way only the path is kept: the URL is rebuilt from it, never taken from PostHog.
  const pathname = typeof properties.$pathname === 'string' ? properties.$pathname : location.pathname;
  // There are no accounts, so an event never creates or updates a person profile.
  clean.$process_person_profile = false;
  clean.$pathname = analyticsPagePath(pathname, baseUrl);
  clean.$current_url = analyticsPageUrl(location.origin, pathname, baseUrl);
  clean.$host = location.hostname.toLowerCase();
  return clean;
}

/** Own properties only, so a key such as "constructor" can never pick up something inherited. */
function own(record: Record<string, Validator>, key: string): Validator | undefined {
  return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;
}

// ---- Google Analytics ----

export interface GaEvent {
  name: string;
  params: PlainProps;
}

const GA_CONTEXT_PARAMS = ['page_type', 'content_section', 'content_slug', 'tool_slug', 'tool_group'] as const;

function pick(source: PlainProps, keys: readonly string[]): PlainProps {
  const picked: PlainProps = {};
  for (const key of keys) if (key in source) picked[key] = source[key];
  return picked;
}

type GaMapper = (props: PlainProps) => GaEvent | null;
const same =
  (name: string, keys: readonly string[]): GaMapper =>
  (props) => ({name, params: pick(props, keys)});

/**
 * Events Google Analytics also receives, by their PostHog name. Everything not listed stays in PostHog only. The
 * parameters are a fixed list, so a calculator value or a search word cannot be sent by accident. Names follow
 * Google's recommended events where one fits (`share`, `generate_lead`).
 */
const GA_EVENTS: Partial<Record<EventName, GaMapper>> = {
  lesson_scroll_depth: same('lesson_scroll_depth', ['depth_percent', 'engaged_seconds']),
  lesson_nav_clicked: same('lesson_nav_clicked', ['direction']),
  calculator_calculated: same('calculator_calculated', ['calculator_name', 'placement']),
  calculator_link_copied: (props) => ({name: 'share', params: {method: 'copy_link', content_type: 'calculator', item_id: String(props.calculator_name ?? '')}}),
  search_performed: same('site_search', ['surface', 'result_count']),
  partner_link_clicked: same('partner_link_clicked', ['partner', 'placement', 'affiliate']),
  sponsor_link_clicked: same('sponsor_link_clicked', ['sponsor']),
  resource_link_clicked: same('resource_link_clicked', ['resource_id', 'placement']),
  video_played: same('video_played', ['video_id', 'placement']),
  outbound_link_clicked: same('outbound_link_clicked', ['destination_domain', 'link_area']),
  contact_email_clicked: (props) =>
    props.contact_purpose === 'sponsorship' ? {name: 'generate_lead', params: {lead_type: 'sponsorship_enquiry'}} : {name: 'contact_email_clicked', params: pick(props, ['contact_purpose'])},
  cta_clicked: same('cta_clicked', ['cta_id']),
  page_not_found: same('page_not_found', ['requested_path']),
};

/** The Google Analytics event for an already sanitised PostHog event, or null if Google does not get it. */
export function gaEventFor(event: EventName, clean: PlainProps): GaEvent | null {
  const mapped = GA_EVENTS[event]?.(clean);
  if (!mapped) return null;
  return {name: mapped.name, params: {...pick(clean, GA_CONTEXT_PARAMS), ...mapped.params}};
}

/** Whether Google Analytics receives this event. */
export function sendsToGoogleAnalytics(event: EventName): boolean {
  return event in GA_EVENTS;
}
