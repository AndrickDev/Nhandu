import { SITE, productionRedirects } from './lib/site.mjs';

export default {
  async redirects() {
    return productionRedirects({ vercelEnv: process.env.VERCEL_ENV, site: SITE });
  },
};
