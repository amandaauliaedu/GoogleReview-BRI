# Report Pengisian Google Review Uker RO 12 Surabaya

    npm install
    npm run dev      # http://localhost:5173
    npm run build

- Sumber data: Google Sheets (tab "Data Master"), live tiap 30 detik.
- Sheet wajib di-share "Anyone with the link - Viewer".
- Ganti sheet/tab lewat .env (lihat .env.example): VITE_GOOGLE_SHEET_ID, VITE_MASTER_TAB.
- Target: 5 input = 100%. Kolom sheet 10-28 tidak ditampilkan/diproses.

- Daftar lengkap BO/uker ada di `src/data/ukerList.js` (25 BO, 359 uker). Ubah di sana bila ada uker baru.
- Tema: glassmorphism, tombol matahari/bulan untuk dark/light.
