# Website Application

This repository is also a Docusaurus website. The Markdown files and images in their existing folders remain the source of truth; the application reads them directly rather than copying them into a separate content system.

## Requirements

- Node.js 20 or newer
- npm

## Run Locally

```bash
npm install
npm run start
```

Open [http://localhost:3000](http://localhost:3000).

## Validate a Production Build

```bash
npm run typecheck
npm run build
npm run serve
```

The static production site is generated in `build/`.

## Run with Docker

The Docker image builds the Docusaurus site, then serves only the generated static files through a small read-only Node.js server.

```bash
docker build -t trading-notes .
docker run --rm -p 3000:3000 -e PORT=3000 trading-notes
```

The container exposes:

- Website: [http://localhost:3000](http://localhost:3000)
- Health check: [http://localhost:3000/health](http://localhost:3000/health)

## Deploy on Railway

Railway can host this as a static site without Docker, but the included `Dockerfile` gives the deployment a consistent production server and health check.

1. Push this repository to GitHub.
2. In Railway, select **New Project → Deploy from GitHub repo**.
3. Choose this repository. Railway automatically detects the root `Dockerfile`.
4. In the service settings, set the health-check path to `/health`.
5. Under **Networking**, select **Generate Domain**.
6. Set `DOCUSAURUS_SITE_URL` to the generated public URL, including `https://`, then redeploy. Keep `DOCUSAURUS_BASE_URL` as `/` unless the site is hosted below a URL subpath.

Each push to the connected branch triggers a new Railway deployment. A custom domain can be added under **Settings → Networking**.

> **Privacy:** This site has no authentication. A Railway public domain or GitHub Pages deployment makes the rendered collection accessible to anyone who has the URL. Keep the service private or place it behind an access-control proxy if the collection should remain private.

## Deploy on GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the site when `main` is pushed. In the repository settings, choose **Pages → Source → GitHub Actions**. The expected project URL is `https://steffanlynch.github.io/trading/`.
