import { defineConfig } from '@playwright/test';

// Suíte de SEO: compila o site e sobe um servidor de produção local na porta 3200.
const PORT = 3200;

export default defineConfig({
  testDir: 'tests/seo',
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, locale: 'pt-BR' },
  projects: [
    // PW_CHANNEL=chrome usa o Google Chrome já instalado em vez do Chromium baixado pelo Playwright.
    { name: 'chrome', use: { browserName: 'chromium', channel: process.env.PW_CHANNEL } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 240_000,
    env: { VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://nhandu.tech' },
  },
});
