# FrameVault — UTS Konstruksi dan Evolusi Perangkat Lunak

Internal photography studio inventory management. Your gear. Your archive.

- `backend/`: existing Laravel 13 + Sanctum API.
- `frontend/`: Vue 3 + TypeScript staff workspace.

See [frontend setup, architecture, demo inventory, and verification](frontend/README.md).

## Tugas 7 · Pemantauan FrameVault

Jalankan Docker Desktop dalam mode Linux containers. Jika belum punya `.env`,
salin `.env.example` dan isi `APP_KEY` serta `DB_PASSWORD`. Isi
`GRAFANA_ADMIN_PASSWORD` dengan password unik sebelum menjalankan Compose:

```powershell
docker compose up -d --build
docker compose exec backend php artisan migrate --force
docker compose up -d --wait
```

Grafana memakai password dari `.env` saat membuat akun `admin` pertama kali.
Jika volume Grafana sudah pernah diinisialisasi, ubah password melalui profil
Grafana agar data volume tetap tersimpan. Password bawaan `admin/admin` mudah
ditebak dan memberi akses untuk mengubah dashboard serta konfigurasi Grafana.
Simpan password di `.env` lokal dan sembunyikan saat mengambil screenshot.

### Bukti untuk laporan

1. Buka [Prometheus Targets](http://localhost:9090/targets). Tunggu sampai
   sembilan target terlihat **UP**. Tiga target dengan job `framevault-health`
   adalah scrape hasil probe. Periksa juga bahwa nilai
   `probe_success{job="framevault-health"}` bernilai `1` untuk ketiga layanan
   di halaman query Prometheus.
2. Buka [FrameVault](http://localhost:8080) dan gunakan aplikasinya, atau
   buat permintaan ke frontend dan backend lewat PowerShell:

   ```powershell
   1..30 | ForEach-Object {
     Invoke-WebRequest -UseBasicParsing http://localhost:8080/ | Out-Null
     Invoke-WebRequest -UseBasicParsing http://localhost:8080/health | Out-Null
     Start-Sleep -Seconds 1
   }
   ```

   Masuk ke [dashboard Grafana](http://localhost:3000/d/framevault) sebagai
   `admin`. Tunggu hingga grafik HTTP merespons dan semua panel memiliki data.
   Ambil satu screenshot yang memuat keempat panel. Gunakan mode kiosk bila
   perlu agar panel muat dalam satu layar.
3. Hentikan backend, lalu buka [Prometheus Alerts](http://localhost:9090/alerts):

   ```powershell
   docker compose stop backend
   ```

   Tunggu sekitar 30–60 detik sampai `FrameVaultServiceDown` menampilkan
   **FIRING** untuk `service="backend"`. Buka rincian alarm agar label layanan
   dan anotasi tindakan pertama terlihat. Setelah screenshot tersimpan, pulihkan
   backend:

   ```powershell
   docker compose start backend
   ```

   Dalam beberapa interval scrape, alarm kembali **INACTIVE** dan probe backend
   kembali `1`.

Simpan ketiga screenshot beserta keterangan dalam `P11_NIM_Nama.pdf`.
Konfigurasi scrape dan alarm ada di [monitoring](monitoring/) dan JSON
dashboard ada di [framevault.json](monitoring/grafana/dashboards/framevault.json).
