# 🍳 Pawon Corner – Landing Page & Direct Order System

Website landing page interaktif untuk usaha kuliner lokal **Pawon Corner** (Glogor Carik, Bali). Didesain untuk memberikan pengalaman pemesanan makanan online yang responsif, cepat, dan intuitif tanpa komisi platform.

---

## 🌟 Fitur Utama

- **Catalog Menu Dinamis:** Mengambil data produk secara asynchronous dari file `menu.json`.
- **Modal Pilih Varian:** Opsi tingkat kepedasan sebelum produk masuk ke keranjang belanja.
- **Keranjang Belanja Persistent:** Sistem keranjang berbasis `localStorage` sehingga data pesanan tidak hilang saat *refresh*.
- **Opsi Delivery / Takeaway:** Pengguna bisa memilih layanan *Delivery* (dengan form alamat) atau *Takeaway*.
- **Multi-Payment Checkout:**
  - **Direct WhatsApp API:** Format pesan otomatis dikirim langsung ke WhatsApp penjual.
  - **Simulasi QRIS / Payment Gateway:** Pilihan pembayaran instan dengan tampilan kode QR.
- **Mobile-First UX:** Dilengkapi *slide-down navigation*, *bottom navbar*, dan *floating cart bar* khusus layar HP.

---

## 🛠️ Teknologi yang Digunakan

- **HTML5** – Struktur halaman semantis.
- **Tailwind CSS (CDN)** – Utility-first CSS framework untuk styling responsif & modern.
- **JavaScript (Vanilla ES6)** – DOM manipulation, state management, Async/Await, dan LocalStorage.
- **Font Awesome 6** – Ikon visual interaktif.

---

## 📁 Struktur Folder

```text
├── index.html        # Halaman utama aplikasi
├── app.js            # Logika keranjang, modal, UI update, dan checkout
├── menu.json         # Data produk & harga
└── README.md         # Dokumentasi proyek