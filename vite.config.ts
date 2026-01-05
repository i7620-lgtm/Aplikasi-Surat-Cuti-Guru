
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Memuat variabel lingkungan dari .env atau Vercel
  // fix: Cast process to any to resolve TS error 'Property cwd does not exist on type Process'
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Mendefinisikan process.env secara global agar bisa dibaca di file .tsx
    define: {
      'process.env.API_KEY': JSON.stringify(env.APP_KEY || env.API_KEY || ''),
      'process.env.CLIENT_ID': JSON.stringify(env.VITE_CLIENT_ID || env.CLIENT_ID || env.GOOGLE_CLIENT_ID || ''),
      // Mengutamakan VITE_ prefix, namun tetap membaca variabel tanpa prefix sebagai fallback
      'process.env.VITE_GAS_WEB_APP_URL': JSON.stringify(env.VITE_GAS_WEB_APP_URL || env.GAS_WEB_APP_URL || ''),
      'process.env.VITE_SECURITY_TOKEN': JSON.stringify(env.VITE_SECURITY_TOKEN || env.SECURITY_TOKEN || '')
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
