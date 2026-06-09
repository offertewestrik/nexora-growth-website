import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `process` is provided by Node when Vite evaluates this config; declare it
// so `tsc --noEmit` (npm run lint) passes without pulling in @types/node.
declare const process: { env: Record<string, string | undefined> };

// Base path for the GitHub Pages project site
// (https://<user>.github.io/nexora-growth-website/).
// Falls back to '/' for local dev and other static hosts.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/nexora-growth-website/' : '/',
  plugins: [react(), tailwindcss()],
});
