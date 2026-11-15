import { defineConfig, devices } from '@playwright/test';

// Sem BASE_URL, a suíte compila o site e sobe um servidor local de produção.
// Com BASE_URL, testa um endereço já publicado (preview ou produção da Vercel).
const PORT = 3100;
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/responsive',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // As imagens de referência dependem do sistema que as gerou (fontes e antialiasing).
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}-{platform}/{arg}{ext}',
  use: {
    baseURL,
    locale: 'pt-BR',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
    // Animações de entrada desligadas: o layout final é o que interessa e as imagens ficam estáveis.
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    // PW_CHANNEL=chrome usa o Google Chrome já instalado em vez do Chromium baixado pelo Playwright.
    { name: 'chrome', use: { browserName: 'chromium', channel: process.env.PW_CHANNEL, userAgent: devices['Pixel 7'].userAgent } },
    { name: 'safari', use: { browserName: 'webkit', userAgent: devices['iPhone 15'].userAgent } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});
