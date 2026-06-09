import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Base path for the GitHub Pages project site
// (https://<user>.github.io/nexora-growth-website/).
// Falls back to '/' for local dev and other static hosts.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/nexora-growth-website/' : '/',
  plugins: [react(), tailwindcss()],
});
