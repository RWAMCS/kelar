# KELAR - Financial Tracker (PWA)

Aplikasi pencatat keuangan mutakhir dengan pendekatan AI (Gemini 2.5 & 3.0), PWA Mobile-First, serta kemampuan Sinkronisasi Offline untuk menjaga kenyamanan pencatatan di mana saja.

## 🚀 Fitur Utama
- **Generative AI Parsing**: Parsing catatan utang, tagihan split, tabungan, maupun jurnal kas masuk/keluar otomatis secara pintar.
- **PWA Ready**: Dukungan manifest, Web Share API, dan offline-first IndexedDB (Dexie).
- **Zustand & TanStack Query**: Pengelolaan State modern dengan turbopack.
- **UI Animasi**: Kelembutan interaksi via motion/react dan lucide icons.

## 🛠 Deployment Checklist
Sebelum Anda me-deploy aplikasi ini ke Production (misal: Vercel), periksa daftar wajib berikut:

- [ ] **ENV variables terisi semua** (`GEMINI_API_KEY`, Supabase, dll).
- [ ] **SQL schema dijalankan di Supabase** (Cek `src/lib/db/schema.sql`).
- [ ] **RLS aktif semua tabel** di Supabase untuk melindungi baris data per masing-masing `<auth.uid()>`.
- [ ] **Google OAuth callback**: diatur dengan benar ke `https://[project].supabase.co/auth/v1/callback` di Google Cloud Console, lalu arahkan dari Supabase ke `https://<domain-kamu.com>/api/auth/callback`.
- [ ] **Lighthouse PWA score 100**: Tes performa aksesibilitas, SEO, dan manifest PWA via Chrome Lighthouse.
- [ ] **Test offline**: Matikan network, tambah transaksi melalui UI Chat, nyalakan lagi, lalu cek apakah sinkronisasi tertembak ke server *(sync)* secara optimis.

## Konfigurasi Redis
Penggunaan Upstash sangat krusial untuk:
1. Perlindungan *Rate Limiting* serangan API AI.
2. Penyimpanan *Cache AI Insights* bulanan.

Demikian panduan deployment. KELAR siap digunakan!
