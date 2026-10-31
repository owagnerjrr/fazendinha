import { defineConfig } from 'vite';

export default defineConfig({
  server: { allowedHosts: ['terminal.local'] },
  build: { rollupOptions: { input: {game:'index.html',admin:'admin/index.html'}, output: { manualChunks: { phaser: ['phaser'] } } } },
});
