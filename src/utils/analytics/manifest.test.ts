import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {EVENT_NAMES} from './events';

const manifest = JSON.parse(readFileSync(new URL('../../../scripts/posthog-manifest.json', import.meta.url), 'utf8')) as {
  events: [string, string][];
  dashboards: {name: string; insights: [string, 'trend' | 'funnel', string[], {breakdown?: string}?][]}[];
};

describe('PostHog manifest', () => {
  it('lists exactly the events the site can send', () => {
    expect(manifest.events.map(([name]) => name).sort()).toEqual([...EVENT_NAMES].sort());
  });

  it('describes every event', () => {
    for (const [name, description] of manifest.events) expect(description.length, name).toBeGreaterThan(20);
  });

  it('only charts events that exist', () => {
    for (const dashboard of manifest.dashboards) {
      for (const [name, kind, events] of dashboard.insights) {
        expect(['trend', 'funnel'], name).toContain(kind);
        for (const event of events) expect(EVENT_NAMES.has(event), `${dashboard.name} / ${name}: ${event}`).toBe(true);
      }
    }
  });

  it('gives every insight a unique name', () => {
    const names = manifest.dashboards.flatMap((dashboard) => dashboard.insights.map(([name]) => name));
    expect(new Set(names).size).toBe(names.length);
  });
});
