# Panduan Deploy ke GitHub Pages

## ✅ Masalah Build Sudah Diperbaiki
- Error import Card/Badge component sudah diselesaikan
- Build sekarang menggunakan HTML biasa tanpa komponen UI yang bermasalah
- Deployment workflow sudah dioptimalkan untuk GitHub Pages

## File yang Perlu Diupload ke GitHub

Upload folder dan file berikut ke repository GitHub Anda:

### Folder Utama
```
├── client/                 # Frontend React app
├── server/                # Backend Express server  
├── shared/                # Shared TypeScript schemas
└── [File konfigurasi]     # File di bawah ini
```

### File Konfigurasi Wajib
```
package.json              # Dependencies dan scripts
package-lock.json         # Lock file dependencies
tsconfig.json            # TypeScript configuration
vite.config.ts           # Vite build configuration
tailwind.config.ts       # Tailwind CSS configuration
postcss.config.js        # PostCSS configuration
drizzle.config.ts        # Database configuration
README.md                # Dokumentasi project
DEPLOYMENT_GUIDE.md      # Panduan ini
replit.md                # Dokumentasi teknis
```

### File yang TIDAK Perlu Diupload
```
node_modules/            # Dependencies (akan diinstall otomatis)
dist/                    # Build output (akan dibuat otomatis)
.env*                    # Environment variables
replit.nix              # Replit specific
.replit                 # Replit specific
.breakpoints            # Replit specific
generated-icon.png       # Generated files
attached_assets/         # User uploads
```

## Langkah-langkah Deployment

### 1. Siapkan Repository GitHub
1. Buat repository baru di GitHub
2. Clone repository ke komputer lokal
3. Copy semua file dan folder yang diperlukan (lihat daftar di atas)

### 2. Upload ke GitHub
```bash
git add .
git commit -m "Initial commit: Gaugaria Solar System"
git push origin main
```

### 3. Aktifkan GitHub Pages
1. Masuk ke repository GitHub Anda
2. Klik tab "Settings"
3. Scroll ke bagian "Pages"
4. Source: pilih "GitHub Actions"
5. Save

### 4. Konfigurasi Build Script
File `package.json` sudah dikonfigurasi dengan build script yang tepat:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

### 5. Deploy Otomatis
- GitHub Actions akan otomatis mendeteksi push ke branch `main`
- Build process akan berjalan otomatis
- Website akan ter-deploy ke `https://username.github.io/repository-name`

## Struktur Project untuk GitHub

```
gaugaria-solar-system/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── main.tsx
│   ├── index.html
│   └── public/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Build Error
Jika ada error saat build:
1. Pastikan semua dependencies terinstall
2. Cek file `package.json` untuk script yang benar
3. Lihat error log di GitHub Actions tab

### Pages Not Loading
1. Pastikan GitHub Pages aktif
2. Cek bahwa Source diset ke "GitHub Actions"
3. Tunggu beberapa menit untuk propagasi

### 3D Models Not Loading
Pastikan file `vite.config.ts` sudah dikonfigurasi dengan benar untuk static assets.

## URL Website
Setelah deploy berhasil, website Anda akan tersedia di:
```
https://[username].github.io/[repository-name]
```

Ganti `[username]` dengan username GitHub Anda dan `[repository-name]` dengan nama repository.