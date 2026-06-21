import {defineConfig} from 'vite';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({presets: [reactCompilerPreset()]})],
  server: {
    allowedHosts: ['sgvmcloud'],
    proxy: {
      '/register': {
        target: 'https://sgvmcloud:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['prop-types'],
  },
});
