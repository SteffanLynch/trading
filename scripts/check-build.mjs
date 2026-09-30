#!/usr/bin/env node
/**
 * Post-build check for the free-tools pages. Run after `npm run build`:
 *
 *   npm run check:build
 *
 * Fails (exit 1) if any tool page is missing from the build or lacks the SEO basics: a sensible <title> and
 * meta description, a canonical URL, exactly one <h1>, valid JSON-LD, and an entry in the sitemap.
 */
import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const build = resolve(root, 'build');
const registry = readFileSync(resolve(root, 'src/data/tools.ts'), 'utf8');
const slugs = [...registry.matchAll(/^\s*tool\('([a-z0-9-]+)'/gm)].map((match) => match[1]);

const problems = [];
const fail = (page, message) => problems.push(`${page}: ${message}`);

if (slugs.length === 0) fail('src/data/tools.ts', 'no tools found in the registry');

const sitemap = existsSync(resolve(build, 'sitemap.xml')) ? readFileSync(resolve(build, 'sitemap.xml'), 'utf8') : '';
if (!sitemap) fail('sitemap.xml', 'missing');

const pages = [
  {name: 'tools', file: 'tools.html', path: '/tools', tool: false},
  {name: 'disclaimer', file: 'disclaimer.html', path: '/disclaimer', tool: false, mustMention: ['Misppelled Ltd', 'not financial advice']},
  {name: 'how-this-site-is-funded', file: 'how-this-site-is-funded.html', path: '/how-this-site-is-funded', tool: false, mustMention: ['Misppelled Ltd', 'affiliate']},
  ...slugs.map((slug) => ({name: slug, file: `tools/${slug}.html`, path: `/tools/${slug}`, tool: true})),
];

for (const page of pages) {
  const file = resolve(build, page.file);
  if (!existsSync(file)) {
    fail(page.name, `${page.file} was not built`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const title = /<title[^>]*>([^<]*)<\/title>/.exec(html)?.[1]?.replace(/&amp;/g, '&').trim();
  const description = /<meta[^>]*name="description"[^>]*content="([^"]*)"/.exec(html)?.[1]?.replace(/&amp;/g, '&').trim();

  if (!title) fail(page.name, 'missing <title>');
  else if (title.length > 75) fail(page.name, `title is ${title.length} characters (max 75): "${title}"`);
  if (!description) fail(page.name, 'missing meta description');
  else if (description.length < 80 || description.length > 165) fail(page.name, `meta description is ${description.length} characters (want 80-165)`);
  if (!/<link[^>]*rel="canonical"/.test(html)) fail(page.name, 'missing canonical link');
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail(page.name, `expected exactly one <h1>, found ${h1s}`);
  if (!sitemap.includes(`${page.path}<`) && !sitemap.includes(`${page.path}</loc>`)) fail(page.name, 'not listed in sitemap.xml');

  const ld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/g)].map((match) => match[1]);
  if (ld.length === 0) fail(page.name, 'missing JSON-LD');
  // Every page carries the site-wide Organization/WebSite blocks, so the per-tool types only need to appear in *some* block.
  let allLd = '';
  for (const block of ld) {
    try {
      allLd += JSON.stringify(JSON.parse(block.replace(/&quot;/g, '"').replace(/&amp;/g, '&')));
    } catch {
      fail(page.name, 'JSON-LD is not valid JSON');
    }
  }
  if (!allLd.includes('"Organization"')) fail(page.name, 'JSON-LD has no Organization (site-wide block)');
  if (page.tool && !allLd.includes('WebApplication')) fail(page.name, 'JSON-LD has no WebApplication');
  if (page.tool && !allLd.includes('BreadcrumbList')) fail(page.name, 'JSON-LD has no BreadcrumbList');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  for (const phrase of page.mustMention ?? []) if (!text.toLowerCase().includes(phrase.toLowerCase())) fail(page.name, `page does not mention "${phrase}"`);
  if (page.tool && !/How was this calculated|What does this mean/.test(html)) fail(page.name, 'teaching content is missing from the prerendered HTML');
}

if (problems.length) {
  console.error(`\n✖ ${problems.length} problem${problems.length === 1 ? '' : 's'} in the built tools pages:\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`✔ ${pages.length} pages verified (${slugs.length} tools, hub, disclaimer, funding page): titles, descriptions, canonicals, H1, JSON-LD, sitemap.`);
