import { defineConfig } from 'vite';
import pkg from '@motion-canvas/vite-plugin';

// @ts-ignore
const motionCanvas = pkg.default || pkg;

export default defineConfig({
  plugins: [
    motionCanvas({
      project: ['./src/project.ts'],
    }),
  ],
});
