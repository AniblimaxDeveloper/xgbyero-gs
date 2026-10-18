# XGBYERO GS — Local Security Simulation Panel

Aplikasi panel bertema gelap/horror dengan dashboard, Device Lab, Bug Simulator (simulasi visual lokal), Activity Logs, dan Settings. Data panel disimpan di `localStorage` pada perangkat yang menjalankan aplikasi.

## Batasan keselamatan

Proyek ini **tidak** terhubung ke WhatsApp, tidak mengirim pesan atau payload, tidak menargetkan nomor telepon, dan tidak menyebabkan aplikasi/perangkat lain crash. Simulator hanya menampilkan skenario contoh di terminal lokal. Gunakan Device Lab hanya untuk perangkat milik sendiri atau yang sudah mendapatkan izin.

## Pratinjau cepat di Termux

1. Pasang kebutuhan dasar:
   ```sh
   pkg update && pkg upgrade
   pkg install git nodejs-lts python
   ```
2. Masuk ke folder proyek, lalu jalankan server statis:
   ```sh
   cd XGBYERO-GS
   python -m http.server 8080 -d www
   ```
3. Buka `http://127.0.0.1:8080` di browser Android. Hentikan server dengan `Ctrl+C`.

## Unggah ke GitHub dari Termux

Buat repositori kosong bernama `xgbyero-gs` di GitHub. Lalu jalankan dari dalam folder proyek:

```sh
git init
git add .
git commit -m "Initial XGBYERO GS local simulation panel"
git branch -M main
git remote add origin https://github.com/USERNAME/xgbyero-gs.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub milikmu. Jika GitHub meminta autentikasi, gunakan metode resmi GitHub (browser/token); jangan tempel token ke file proyek.

## Membuat APK lewat GitHub Actions

1. Pastikan file `.github/workflows/build-android.yml` sudah terunggah.
2. Buka repositori GitHub → tab **Actions** → workflow **Build XGBYERO GS APK**.
3. Workflow berjalan otomatis setelah push ke branch `main`; bisa juga dimulai lewat **Run workflow**.
4. Setelah status hijau, buka hasil run → bagian **Artifacts** → unduh `XGBYERO-GS-debug-apk`.
5. Ekstrak ZIP artifact; di dalamnya ada `app-debug.apk`. Android mungkin meminta izin instalasi untuk file dari sumber yang kamu pilih.

APK yang dihasilkan adalah **debug APK** untuk pengujian, bukan rilis Play Store. Build dilakukan oleh GitHub Actions; proyek sumber ini belum menyertakan APK yang sudah dibangun.

## Isi utama

- `www/index.html` — struktur UI panel.
- `www/styles.css` — tema hitam-merah dan responsif.
- `www/app.js` — navigasi, data lokal, simulator, log, dan pengaturan.
- `www/logo.svg` — emblem XGBYERO buatan proyek.
- `capacitor.config.json` dan `package.json` — wrapper Android berbasis Capacitor.
- `.github/workflows/build-android.yml` — proses build APK melalui GitHub Actions.
