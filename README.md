# Panduan Instalasi & Upload Aplikasi JastipPro (PWA + Auto-Update GitHub + Firebase Terpusat)

Paket aplikasi ini sudah siap di-upload langsung ke **GitHub Pages** dan terhubung dengan **Firebase Authentication** serta **Cloud Firestore** Anda (`aplikasijastip-30609`). Dilengkapi juga dengan sistem **PWA Auto-Update (Network-First)** sehingga setiap kali Anda mengubah coding di GitHub, semua HP user yang sudah menginstal aplikasi akan langsung mendapatkan fitur terbaru secara otomatis.

## Daftar File di Dalam ZIP
1. `index.html` — File utama aplikasi web (murni aplikasi tanpa menyisipkan kode `sw.js`, `manifest.json`, atau rules di tampilan layar).
2. `manifest.json` — Konfigurasi Progressive Web App (PWA) agar aplikasi bisa diinstal di HP Android/iOS/Desktop.
3. `sw.js` — Service Worker pintar dengan strategi **Network-First (`cache: 'no-store'`)** untuk fitur instalasi PWA dan sinkronisasi update coding otomatis dari GitHub Pages.
4. `icon-192.png`, `icon-512.png`, `icon.png` — Gambar ikon aplikasi resolusi tinggi untuk homescreen HP & splash screen.
5. `firestore.rules` — Kode Security Rules untuk dimasukkan ke tab **Rules** di Cloud Firestore Anda.
6. `README.md` — File panduan tutorial ini.

---

## Langkah 1: Aktifkan Login Email di Firebase Console
Agar setiap anggota tim/admin bisa login atau mendaftar menggunakan email masing-masing:
1. Buka [Firebase Console](https://console.firebase.google.com/) dan pilih project **`aplikasijastip-30609`**.
2. Di menu sebelah kiri, klik **Build** > **Authentication**.
3. Klik tombol **Get started** (jika belum diaktifkan), lalu buka tab **Sign-in method**.
4. Pilih **Email/Password**, aktifkan toggle **Enable** (yang paling atas), lalu klik **Save**.

---

## Langkah 2: Pasang Coding Rules di Cloud Firestore
Agar database terpusat bisa diakses secara real-time oleh setiap user yang login:
1. Masih di Firebase Console project **`aplikasijastip-30609`**, buka menu **Build** > **Firestore Database**.
2. Jika database belum dibuat, klik **Create database**, pilih lokasi server (misal: `asia-southeast2 (Jakarta)` atau `asia-southeast1 (Singapore)`), lalu klik **Next** dan **Create**.
3. Setelah masuk ke halaman Firestore Database, klik tab **Rules** di bagian atas.
4. Buka file `firestore.rules` yang ada di dalam ZIP ini, salin seluruh isinya, lalu tempelkan (paste) menggantikan isi yang ada di editor Rules Firebase:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /stock_barang/{docId} {
         allow read, write: if request.auth != null;
       }
       match /barang_terjual/{docId} {
         allow read, write: if request.auth != null;
       }
       match /biaya_ongkir/{docId} {
         allow read, write: if request.auth != null;
       }
       match /biaya_tambahan/{docId} {
         allow read, write: if request.auth != null;
       }
       match /riwayat_aktivitas/{docId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. Klik tombol **Publish**.

---

## Langkah 3: Upload ke GitHub & Aktifkan GitHub Pages
1. Login ke akun [GitHub](https://github.com/) Anda dan buat repository baru (klik **New repository**), misalnya beri nama `aplikasi-jastip`, pilih **Public**, lalu klik **Create repository**.
2. Klik **uploading an existing file** (atau **Add file** > **Upload files**).
3. Ekstrak file ZIP ini di komputer/HP Anda, lalu **upload file-file berikut ke halaman utama (root) repository GitHub Anda**:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
   - `icon.png`
4. Klik **Commit changes**.
5. Buka menu **Settings** di repository GitHub Anda > pilih menu **Pages** di sebelah kiri.
6. Pada bagian **Build and deployment** > **Branch**, ubah dari `None` menjadi `main` (atau `master`), biarkan folder `/ (root)`, lalu klik **Save**.
7. Tunggu sekitar 1–2 menit, lalu refresh halaman tersebut. Akan muncul link aplikasi Anda (contoh: `https://username-anda.github.io/aplikasi-jastip/`).

---

## Langkah 4: Cara Kerja Auto-Update PWA Saat Coding di GitHub Diubah
Anda **tidak perlu meminta user meng-uninstall atau menginstal ulang aplikasi** ketika Anda meng-update coding:
1. **Otomatis Setiap Buka Aplikasi (Network-First `no-store`)**:
   - File `sw.js` menggunakan strategi **Network-First** dengan opsi `fetch(request, { cache: 'no-store' })`. Artinya setiap kali user membuka aplikasi PWA di HP (selama ada koneksi internet), aplikasi langsung mengambil file `index.html` paling baru dari server GitHub Pages dan memperbarui cache lokal secara otomatis.
2. **Deteksi Perubahan Coding di Latar Belakang (Background Polling & Visibility Check)**:
   - Aplikasi secara otomatis memeriksa signature/versi file `index.html` di GitHub setiap kali aplikasi dibuka kembali dari background (`visibilitychange`) maupun secara berkala. Jika mendeteksi ada perubahan coding di GitHub, akan muncul banner **"Update versi terbaru tersedia!"** atau langsung memuat ulang ke versi terbaru.
3. **Tombol "Update App" di Header Aplikasi**:
   - Di bagian atas aplikasi terdapat tombol **Update App** yang bisa diklik kapan saja oleh user untuk membersihkan cache lama dan menarik paksa versi terbaru langsung dari GitHub Pages.

---

## Penjelasan 6 Menu Utama & Rumus Perhitungan
1. **Dashboard**: Menampilkan ringkasan finansial terpusat secara otomatis:
   - **Total Harga Modal Keseluruhan** = Total Harga Modal dari Stok Barang + Total Harga Modal dari Barang Terjual.
   - **Total Harga Jual** = Akumulasi harga jual dari seluruh Barang Terjual.
   - **Total Biaya Ongkir** = Akumulasi biaya ongkir dari seluruh pengiriman.
   - **Total Biaya Tambahan** = Akumulasi seluruh pengeluaran tambahan operasional/lainnya.
   - **Keuntungan Bersih (Laba Bersih)**:
     - **Keuntungan Bersih Penjualan** = `Total Harga Jual - Total Harga Modal Barang Terjual - Total Biaya Ongkir - Total Biaya Tambahan`
     - **Keuntungan Bersih Total Modal** = `Total Harga Jual - Total Harga Modal Keseluruhan (Stok + Terjual) - Total Biaya Ongkir - Total Biaya Tambahan`
2. **Stock Barang**: Input `Nama Barang` dan `Harga Modal`. Dilengkapi tombol cepat **"Jual"** untuk memindahkan stok barang ke daftar Barang Terjual, edit, dan hapus.
3. **Barang Terjual**: Input `Nama Barang`, `Harga Modal`, dan `Harga Jual`. Otomatis menghitung margin keuntungan per barang.
4. **Biaya Ongkir**: Input `Tanggal`, `Nama Barang`, dan `Biaya Ongkir`.
5. **Biaya Tambahan**: Input `Tanggal`, `Keterangan Pengeluaran`, dan `Jumlah Biaya`. Otomatis mengurangi Keuntungan Bersih di Dashboard.
6. **Riwayat**: Mencatat otomatis setiap aktivitas penambahan, perubahan, pemindahan stok, atau penghapusan data lengkap dengan **Tanggal & Jam** serta **Email Pengguna** yang melakukannya.
