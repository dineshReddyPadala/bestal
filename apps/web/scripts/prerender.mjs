import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const distDir = path.join(webRoot, 'dist');
const SITE_ORIGIN = 'https://www.bestal.co';
const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;

const STATIC_ROUTES = [
  '/',
  '/how-it-works',
  '/sample-talent',
  '/talent',
  '/evaluation-standard',
  '/trust',
  '/rates',
  '/try-for-a-week',
  '/for-engineers',
  '/jobs',
  '/communities',
  '/enterprise',
  '/about',
  '/faq',
  '/privacy-policy',
  '/terms-of-service',
  '/free-trial-terms',
  '/cookie-policy',
  '/contact',
  '/reach-out',
];

const JOB_SLUGS = [
  'senior-full-stack-engineer-react-node',
  'staff-devops-engineer',
  'principal-data-engineer',
  'senior-machine-learning-engineer',
  'lead-mobile-engineer',
  'security-architect',
];

const routes = [...STATIC_ROUTES, ...JOB_SLUGS.map((slug) => `/jobs/${slug}`)];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function resolveDistFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const normalized = decoded.replace(/\/+$/, '') || '/';

  if (normalized === '/') {
    return path.join(distDir, 'index.html');
  }

  const directPath = path.join(distDir, normalized);
  if (await fileExists(directPath)) return directPath;

  const indexPath = path.join(directPath, 'index.html');
  if (await fileExists(indexPath)) return indexPath;

  return path.join(distDir, 'index.html');
}

function startStaticServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const filePath = await resolveDistFile(req.url ?? '/');
      const ext = path.extname(filePath).toLowerCase();
      const content = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' });
      res.end(content);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function routeToOutputFile(route) {
  if (route === '/') return path.join(distDir, 'index.html');
  const segments = route.replace(/^\//, '').replace(/\/$/, '');
  return path.join(distDir, segments, 'index.html');
}

async function writeSitemap() {
  const urls = routes.map((route) => {
    const loc = route === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`;
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
}

async function launchBrowser() {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };

  try {
    return await puppeteer.launch({ ...launchOptions, channel: 'chrome' });
  } catch {
    const candidates = [
      process.env.CHROME_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ].filter(Boolean);

    for (const executablePath of candidates) {
      try {
        return await puppeteer.launch({ ...launchOptions, executablePath });
      } catch {
        continue;
      }
    }

    return puppeteer.launch(launchOptions);
  }
}

async function prerender() {
  const distStat = await fs.stat(distDir).catch(() => null);
  if (!distStat?.isDirectory()) {
    throw new Error('dist/ not found — run vite build before prerender');
  }

  const server = await startStaticServer();

  try {
    const browser = await launchBrowser();

    for (const route of routes) {
      process.stdout.write(`Prerendering ${route}\n`);
      const page = await browser.newPage();
      await page.goto(`${baseUrl}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 60_000,
      });

      await page
        .waitForSelector('[data-prerender-ready]', { timeout: 15_000 })
        .catch(() => process.stderr.write(`Warning: ${route} missing data-prerender-ready\n`));

      const html = await page.content();
      const outputFile = routeToOutputFile(route);
      await fs.mkdir(path.dirname(outputFile), { recursive: true });
      await fs.writeFile(outputFile, html, 'utf8');
      await page.close();
    }

    await browser.close();
    await writeSitemap();
    process.stdout.write(`Prerendered ${routes.length} marketing routes.\n`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

prerender().catch((error) => {
  console.error(error);
  process.exit(1);
});
