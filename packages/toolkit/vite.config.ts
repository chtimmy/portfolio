/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';

/**
 * Library build for external distribution (npm / the shadcn-style registry in Phase 3).
 *
 * Internally, the apps consume the toolkit straight from `src` via the `exports` map + Next's
 * `transpilePackages`, which is what gives cross-workspace hot reload. This build is for shipping.
 */
export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ include: ['src'] })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Don't bundle React/Motion into the library; consumers provide them.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'motion', 'motion/react'],
    },
  },
  test: {
    environment: 'node',
  },
});
