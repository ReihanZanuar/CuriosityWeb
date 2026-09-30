# CURIOSITY AI — Sahabat Belajar & Eksplorasi Sains

**Curiosity** adalah aplikasi web chatbot cerdas seperti ChatGPT / Gemini / Claude yang terhubung langsung dengan **Ollama Lokal** di komputer kamu. Didesain khusus dengan nuansa interaktif yang seru, fun, dan hidup untuk membantu siswa memecahkan berbagai kendala belajar sekolah, rumus matematika LaTeX, konsep fisika, kimia, pemrograman, hingga analisis foto PR dan dokumen PDF!

![Curiosity Logo](/curiosity%20-%20Edited.png)

---

## Fitur Utama

### 1. Antarmuka Sains & Vektor Bersih (Clean Technical SVG)
* **Desain Minimalis Modern**: Menggunakan palet *deep space slate* yang tenang, kontras tajam, dan elegan tanpa warna neon yang menyilaukan.
* **Elemen Vektor SVG Skematis**: Ilustrasi teknis berupa wahana antariksa, teleskop optik, lensa riset reticle, terminal komputasi, router jaringan dengan gelombang sinyal transmisi, serta satelit pengamat bumi.
* **Tanpa AI-Slop & Emoji**: Seluruh elemen antarmuka, avatar, dan kategori menggunakan ikon vektor presisi (Lucide SVG).

### 2. Integrasi Penuh LLM Lokal (Ollama)
* **Koneksi Cerdas**: Terhubung ke endpoint `/ollama` dengan proxy otomatis tanpa kendala CORS.
* **Deteksi Model Otomatis**: Mendeteksi model yang terpasang di komputermu (`llama3.2`, `llama3.2-vision`, `deepseek-r1:8b`, `qwen2.5:7b`, `llava`, `gemma2:9b`, dll.).
* **Streaming Responses**: Aliran teks jawaban tampil secara *real-time* dengan kontrol penghentian respon.
* **Mode Simulasi Pintar**: Jika Ollama belum dijalankan, Curiosity otomatis beralih ke mode simulasi cerdas untuk pengujian antarmuka.

### 📸 3. Multimodal & Analisis Dokumen (Vision & PDF)
* **Unggah Foto / Gambar PR**: Mendukung format `.png`, `.jpg`, `.jpeg`, `.webp` untuk dibaca oleh model vision seperti `llama3.2-vision` atau `llava`.
* **Ekstraksi Teks PDF Client-Side**: Unggah file PDF modul/buku paket sekolah; teks akan diekstrak secara otomatis per halaman dan dijadikan konteks analisis bagi AI.
* **Dukungan File Teks & Koding**: Unggah file catatan `.txt`, `.md`, maupun kode pemrograman (`.py`, `.js`, `.cpp`, `.java`, dll.).
* **Pratinjau Lightbox HD**: Perbesar gambar lampiran dalam resolusi tinggi.

### 📐 4. Format Akademik & LaTeX Matematika
* **Rendering Rumus Matematika & Sains (KaTeX)**: Menampilkan persamaan display `$$ ... $$` dan inline `$ ... $` dengan presisi tinggi ($E = mc^2$, $\sum$, turunan, integral, matriks).
* **Syntax Highlighting & Salin Kode**: Kotak kode interaktif dengan indikator bahasa dan tombol *1-Click Copy*.

### 🎙️ 5. Suara & Interaksi Audio
* **Voice Input (STT)**: Bicara langsung melalui mikrofon untuk mendiktekan pertanyaan tanpa perlu mengetik.
* **Text-to-Speech (TTS)**: Dengarkan penjelasan materi dari Curiosity melalui sintesis suara berbahasa Indonesia.

### 🧭 6. Bank Soal & Persona Belajar
* **4 Persona Belajar**:
  - 🚀 *Sahabat Penjelajah*: Penuh analogi seru & rasa ingin tahu.
  - 👨‍🏫 *Guru Bimbel Sabar*: Langkah demi langkah terstruktur & tips ujian.
  - 🔬 *Profesor Riset*: Presisi ilmiah mendalam & rumus matematis.
  - 🎮 *Sobat Santai*: Bahasa gaul edukatif yang asyik.
* **Bank Soal / Prompt Templates**: Akses cepat ke template topik Matematika, Fisika, Kimia, Jaringan Komputer, dan Bahasa.

---

## 🛠️ Cara Menjalankan

### 1. Menjalankan Website Curiosity
Pastikan Node.js sudah terpasang di komputermu:
```bash
# Masuk ke direktori
cd /Users/ReihanZanu/Documents/Curiosity

# Instalasi dependencies (jika belum)
npm install

# Jalankan server lokal
npm run dev
```
Buka browser di: **`http://localhost:5173`**

### 2. Menjalankan Ollama Lokal
Untuk performa AI penuh secara offline tanpa kuota:
1. Unduh dan pasang Ollama dari [ollama.com](https://ollama.com).
2. Buka Terminal / Command Prompt lalu jalankan model pilihanmu:
```bash
# Model Cepat & Ringan (Rekomendasi untuk PR & Belajar Harian):
ollama run llama3.2

# Model Vision (Bisa membaca foto PR & gambar diagram):
ollama run llama3.2-vision

# Model Penalaran & Matematika Super (DeepSeek R1):
ollama run deepseek-r1:8b
```

---

## ⌨️ Pintasan Keyboard
* `Enter` : Kirim pesan
* `Shift + Enter` : Baris baru di kotak pesan
* `Cmd / Ctrl + K` : Buka sesi percakapan baru
* `Esc` : Menutup modal / pratinjau gambar
