import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'Trading Notes',
  tagline: 'A personal field guide to trading with clarity and discipline.',
  favicon: 'img/favicon.svg',
  url: process.env.DOCUSAURUS_SITE_URL ?? 'http://localhost:3000',
  baseUrl: process.env.DOCUSAURUS_BASE_URL ?? '/',
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
      ],
      copyright: `<div class="footer-mark" aria-hidden="true">Trading Notes</div><div class="footer-fine">Personal notes · ${new Date().getFullYear()} · Not financial advice · Enough is better than everything.</div>`,
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
