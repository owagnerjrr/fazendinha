import { defineConfig } from 'vite';

export default defineConfig({
  server: { allowedHosts: ['terminal.local'] },
  build: { rollupOptions: { input: {app:'index.html',qa:'tests/interiors-qa.html'}, output: { manualChunks: { phaser: ['phaser'] } } } },
});
