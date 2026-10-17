import { readFile } from "node:fs/promises";

// Creates or updates the event definitions and dashboards in scripts/posthog-manifest.json inside the PostHog project.
// Safe to run again: it matches by name. Run it from your own terminal with a personal API key (never commit one):
//
//   POSTHOG_PERSONAL_API_KEY=phx_... POSTHOG_PROJECT_ID=12345 npm run posthog:provision
//
// The key needs the "event_definition:write", "dashboard:write" and "insight:write" scopes. Set POSTHOG_APP_HOST to
// https://us.posthog.com if the project is on US Cloud.

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
const apiOrigin = process.env.POSTHOG_APP_HOST?.trim().replace(/\/+$/, "") || "https://eu.posthog.com";

if (!apiKey?.startsWith("phx_") || !/^\d+$/.test(projectId ?? "")) {
  console.error("Set POSTHOG_PERSONAL_API_KEY (phx_...) and numeric POSTHOG_PROJECT_ID in your terminal.");
  process.exit(1);
}

const manifest = JSON.parse(await readFile(new URL("./posthog-manifest.json", import.meta.url), "utf8"));
const base = `${apiOrigin}/api/projects/${projectId}`;

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`${options.method ?? "GET"} ${path} failed (${response.status}): ${await response.text()}`);
  if (response.status === 204) return null;
  return response.json();
}

async function list(path) {
  const all = [];
  let next = `${path}${path.includes("?") ? "&" : "?"}limit=200`;
  while (next) {
    const page = await request(next.replace(base, "").replace(apiOrigin, ""));
    all.push(...(page.results ?? []));
    next = page.next ? new URL(page.next).pathname + new URL(page.next).search : "";
    if (next.startsWith(`/api/projects/${projectId}`)) next = next.slice(`/api/projects/${projectId}`.length);
  }
  return all;
}

async function upsertEventDefinitions() {
  const existing = await list("/event_definitions/");
  for (const [name, description] of manifest.events) {
    const found = existing.find((item) => item.name === name);
    const body = JSON.stringify({ name, description, tags: [manifest.tag] });
    if (found) await request(`/event_definitions/${found.id}/`, { method: "PATCH", body });
    else await request("/event_definitions/", { method: "POST", body });
  }
}

// Event-property definitions are created by PostHog from the events it receives; the property list in the manifest is
// documentation (see docs/analytics.md), not something this script pushes.

const productionFilter = [{ key: "deployment_environment", value: ["production"], operator: "exact", type: "event" }];

function insightQuery(kind, events, options = {}) {
  const series = events.map((event) => ({ kind: "EventsNode", event, name: event, math: "total" }));
  const properties = [...productionFilter, ...(options.filters ?? [])];
  if (kind === "funnel") {
    return { kind: "InsightVizNode", source: { kind: "FunnelsQuery", series, dateRange: { date_from: "-30d" }, properties, filterTestAccounts: true } };
  }
  return { kind: "InsightVizNode", source: {
    kind: "TrendsQuery", series, interval: options.interval ?? "day", dateRange: { date_from: "-30d" }, properties,
    filterTestAccounts: true,
    ...(options.breakdown ? { breakdownFilter: { breakdowns: [{ property: options.breakdown, type: "event" }] } } : {}),
    trendsFilter: { display: options.display ?? "ActionsLineGraph" },
  } };
}

async function upsertDashboardsAndInsights() {
  const dashboards = await list("/dashboards/");
  const insights = await list("/insights/?saved=true");
  for (const definition of manifest.dashboards) {
    let dashboard = dashboards.find((item) => item.name === definition.name);
    const dashboardBody = JSON.stringify({ name: definition.name, description: definition.description, tags: [manifest.tag] });
    if (dashboard) dashboard = await request(`/dashboards/${dashboard.id}/`, { method: "PATCH", body: dashboardBody });
    else dashboard = await request("/dashboards/", { method: "POST", body: dashboardBody });

    for (const [name, kind, events, options = {}] of definition.insights) {
      const found = insights.find((item) => item.name === name);
      const body = JSON.stringify({
        name,
        description: `${definition.description} Managed from scripts/posthog-manifest.json.`,
        dashboards: [dashboard.id],
        query: insightQuery(kind, events, options),
        tags: [manifest.tag],
      });
      if (found) await request(`/insights/${found.id}/`, { method: "PATCH", body });
      else await request("/insights/", { method: "POST", body });
    }
  }
}

await upsertEventDefinitions();
await upsertDashboardsAndInsights();
console.info(`PostHog project ${projectId} now has the event catalogue and dashboards from analytics manifest version ${manifest.version}.`);
