import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Kita set ke false agar PWA aktif baik di mode development maupun production.
  // Catatan: Ini akan membuat browser menyimpan cache. Jika Anda melakukan perubahan kode 
  // dan tidak muncul, silakan tekan Ctrl+F5 atau hapus service worker di DevTools.
  disable: false, 
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    useCache: true
  },
  // Plugin PWA saat ini membutuhkan Webpack. 
  // Jika menggunakan Next.js 15+, pastikan menjalankan build dengan flag --webpack
  // atau biarkan config ini memicu fallback ke Webpack.
  turbopack: {}, 
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' }
      ]
    }
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withPWA(nextConfig);
