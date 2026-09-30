import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';
import {
  LEGAL_COMPANY_NUMBER,
  LEGAL_CONTACT_EMAIL,
  LEGAL_ENTITY_NAME,
  LEGAL_REGISTERED_OFFICE_ADDRESS,
  SITE_NAME,
  legalDisclosureLine,
} from './src/data/legal';

const SITE_URL = process.env.DOCUSAURUS_SITE_URL ?? 'http://localhost:3000';
const BASE_URL = process.env.DOCUSAURUS_BASE_URL ?? '/';
const ORIGIN = `${SITE_URL.replace(/\/$/, '')}${BASE_URL.replace(/\/$/, '')}`;

// Site-wide structured data. `name` stays the trading name people search for; `legalName` carries the company.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${ORIGIN}/#organization`,
  name: SITE_NAME,
  legalName: LEGAL_ENTITY_NAME,
  alternateName: LEGAL_ENTITY_NAME,
  identifier: LEGAL_COMPANY_NUMBER,
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/img/logo.svg`,
  ...(LEGAL_CONTACT_EMAIL ? {email: LEGAL_CONTACT_EMAIL} : {}),
  address: {'@type': 'PostalAddress', ...LEGAL_REGISTERED_OFFICE_ADDRESS},
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${ORIGIN}/#website`,
  name: SITE_NAME,
  url: `${ORIGIN}/`,
  inLanguage: 'en-GB',
  publisher: {'@id': `${ORIGIN}/#organization`},
};

const config: Config = {
  title: 'Trading Notes',
  tagline: 'A free field guide to trading with clarity and discipline.',
  favicon: 'img/favicon.svg',
  url: SITE_URL,
  baseUrl: BASE_URL,
  headTags: [
    {tagName: 'script', attributes: {type: 'application/ld+json'}, innerHTML: JSON.stringify(organizationSchema)},
    {tagName: 'script', attributes: {type: 'application/ld+json'}, innerHTML: JSON.stringify(websiteSchema)},
  ],
  organizationName: 'SteffanLynch',
  projectName: 'trading',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          path: '.',
          routeBasePath: 'library',
          sidebarPath: './sidebars.ts',
          include: [
            'README.md',
            'manifesto.md',
            'glossary.md',
            'fundamentals/**/*.{md,mdx}',
            'strategy/**/*.{md,mdx}',
          ],
          exclude: [
            '**/node_modules/**',
            '**/build/**',
            '**/.docusaurus/**',
          ],
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
        },
        blog: false,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Options,
    ],
  ],
  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Trading Notes',
      logo: {alt: 'Trading Notes logo', src: 'img/logo.svg', width: 32, height: 32},
      hideOnScroll: false,
      items: [
        {to: '/', label: 'Overview', position: 'left', exact: true},
        {to: '/library/', label: 'Library', position: 'left'},
        {to: '/library/strategy/rules', label: 'Rules', position: 'left'},
        {to: '/library/manifesto', label: 'Manifesto', position: 'left'},
        {to: '/tools', label: 'Free tools', position: 'left', activeBaseRegex: '^/tools', className: 'navbar-tools-link'},
        {
          type: 'html',
          position: 'right',
          value:
            '<button class="search-trigger" type="button" aria-label="Search the library"><span>Search</span><kbd>⌘ K</kbd></button>',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Study',
          items: [
            {label: 'Start here', to: '/library/'},
            {label: 'Fundamentals', to: '/library/fundamentals/what-is-trading'},
            {label: 'Strategy', to: '/library/strategy/what-is-a-trading-plan'},
          ],
        },
        {
          title: 'Tools',
          items: [
            {label: 'Trade planner', to: '/tools/trade-planner'},
            {label: 'Position size', to: '/tools/position-size-calculator'},
            {label: 'Pip value', to: '/tools/pip-value-calculator'},
            {label: 'Risk : reward', to: '/tools/risk-reward-calculator'},
            {label: 'All tools', to: '/tools'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'Trading rules', to: '/library/strategy/rules'},
            {label: 'Glossary', to: '/library/glossary'},
            {label: 'Manifesto', to: '/library/manifesto'},
          ],
        },
        {
          title: 'Legal & trust',
          items: [
            {label: 'Disclaimer', to: '/disclaimer'},
            {label: 'How this site is funded', to: '/how-this-site-is-funded'},
          ],
        },
      ],
      copyright: `<div class="footer-mark" aria-hidden="true">Trading Notes</div><div class="footer-legal"><p class="footer-company">${SITE_NAME} is a product of <strong>${LEGAL_ENTITY_NAME}</strong>.</p><p>${legalDisclosureLine()}</p><p>Free for everyone: no email or payment is ever required. Funded by affiliate commissions and advertising. Educational content only, not financial advice. Trading carries a high risk of loss.</p></div><div class="footer-fine">© ${new Date().getFullYear()} ${LEGAL_ENTITY_NAME}. All rights reserved.</div>`,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies ThemeConfig,
};

export default config;
