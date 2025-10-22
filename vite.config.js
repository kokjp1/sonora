// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    // host: '127.0.0.1',   // bind explicit op 127.0.0.1 (ipv ::1 of localhost)
    // port: 5173,          // zelfde poort als je redirect
    strictPort: true     // fail als 5173 bezet is (zodat je het merkt)
  }
});
