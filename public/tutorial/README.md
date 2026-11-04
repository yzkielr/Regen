# Foto halaman Tutorial

URL: https://www.regenlongevitylab.com/Tutorial (huruf T besar).

Enam foto katalog/tutorial ditampilkan sesuai urutan nama file:

1. `01.png` — foto paling atas
2. `02.png`
3. `03.png`
4. `04.png`
5. `05.png`
6. `06.png` — foto paling bawah

Gunakan gambar PNG dengan nama `01.png` sampai `06.png`, termasuk angka nol di
depan. Mengganti ekstensi file saja tidak mengubah format gambar.

Foto ditampilkan utuh, satu kolom, sesuai urutan nama file. Tingginya menyesuaikan
proporsi foto tanpa dipotong. Ukuran yang disarankan: lebar 1200–1800 piksel,
dengan tulisan tetap terbaca. Foto bisa diperbesar dengan pinch-to-zoom di ponsel.

Setelah mengganti foto, sesuaikan `width`, `height`, dan `version` (12 karakter
awal SHA-256 file) pada daftar `pages` di `app/Tutorial/page.tsx`. Ini menjaga
proporsi saat gambar dimuat dan membuat browser mengambil foto terbaru.
Lalu commit/push dan deploy ulang website agar gambar baru muncul di domain
aktif. Mengganti file lokal saja tidak memperbarui website live.

Halaman tidak ditautkan dari menu/footer utama dan tidak masuk sitemap.
Halaman dan gambar mengirim instruksi noindex agar tidak masuk hasil pencarian.
Siapa pun yang memiliki tautannya dapat membukanya; halaman ini tidak memakai login.
