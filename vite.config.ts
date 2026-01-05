
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Memuat variabel lingkungan dari .env atau Vercel
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Mendefinisikan process.env.API_KEY secara global untuk SDK Gemini
    // Menggunakan env.APP_KEY (dari user) atau fallback ke env.API_KEY
    define: {
      'process.env.API_KEY': JSON.stringify(env.APP_KEY || env.API_KEY || '')
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
 
