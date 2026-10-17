import siteConfig from '@generated/docusaurus.config';
import type {ContextProps} from '../utils/analytics/events';
import {classifyPage} from '../utils/analytics/routes';
import {tools} from '../data/tools';
import {ANALYTICS_HOSTS} from '../data/analytics';

export const BASE_URL = siteConfig.baseUrl;
export const SCHEMA_VERSION = 1;

/** The 404 page renders an invisible element with this attribute (src/theme/NotFound/Content), so a missing page is recognisable. */
const NOT_FOUND_MARKER = '[data-analytics-not-found]';

/** What kind of page the visitor is on, for any event. Reads the current location, so call it when the event happens. */
export function pageContext(pathname: string = window.location.pathname): ContextProps {
  const page = classifyPage(pathname, BASE_URL);
  const missing = document.querySelector(NOT_FOUND_MARKER) !== null;
  const tool = page.tool_slug ? tools.find((entry) => entry.slug === page.tool_slug) : undefined;
  // A /tools/<slug> path that is not a real tool is a missing page, not a tool.
  const pageType = missing || (page.page_type === 'tool' && !tool) ? 'not_found' : page.page_type;

  return {
    page_type: pageType,
    route_name: pageType === 'not_found' ? '/[not-found]' : page.route_name,
    ...(pageType !== 'not_found' && page.content_section ? {content_section: page.content_section, content_slug: page.content_slug} : {}),
    ...(tool ? {tool_slug: tool.slug, tool_group: tool.group} : {}),
    color_mode: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
    deployment_environment: ANALYTICS_HOSTS.includes(window.location.hostname.toLowerCase()) ? 'production' : 'test',
    schema_version: SCHEMA_VERSION,
  };
}
