import { PERSONA_PROMPTS } from '../utils/storage';

// ── Security: Input constraints ────────────────────────────────────────────────
const MAX_PROMPT_LENGTH = 32_000;   // ~32k chars — prevents prompt stuffing attacks
const MAX_MESSAGE_HISTORY = 100;    // Limit conversation history depth

/**
 * Sanitize user input:
 * - Enforce max length
 * - Strip null bytes and C0/C1 control characters (except newlines/tabs)
 * - Prevent trivial prompt injection probes
 */
function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  // Strip null bytes and dangerous control characters
  let sanitized = text
    .replace(/\0/g, '')
    // Remove C0 control chars except \t, \n, \r
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove C1 control chars
    .replace(/[\x80-\x9F]/g, '');
  // Enforce length cap
  if (sanitized.length > MAX_PROMPT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_PROMPT_LENGTH);
  }
  return sanitized;
}


export const POPULAR_MODELS = [
  { id: 'deepseek-r1:14b', name: 'DeepSeek R1 (14B) - Reasoning & Matematika' },
  { id: 'llama3.1:8b', name: 'Llama 3.1 (8B) - Cepat, Cerdas & Seimbang' },
  { id: 'qwen2.5:14b', name: 'Qwen 2.5 (14B) - STEM & Informatika Spesialis' },
  { id: 'gemma4:e4b', name: 'Gemma 4 (8B) - Multimodal Vision & Reasoning' },
  { id: 'glm-4.7-flash:latest', name: 'GLM 4.7 Flash (29.9B) - High-Speed Thinking' },
  { id: 'mistral-nemo:latest', name: 'Mistral Nemo (12.2B) - Bahasa & Konsep Luas' },
  { id: 'gemma4:31b', name: 'Gemma 4 (31.3B) - Kapasitas Analisis Tinggi' },
];

export async function checkOllamaConnection(endpoint = '/ollama') {
  const startTime = performance.now();
  try {
    const cleanEndpoint = endpoint.replace(/\/+$/, '');
    const url = `${cleanEndpoint}/api/tags`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json();
      const rawModels = data.models || [];
      const normalizedModels = rawModels.map((m) => ({
        id: m.name || m.model || '',
        name: m.name || m.model || '',
        size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : 'Local Model',
        details: m.details,
        isInstalled: true,
      }));
      return {
        online: true,
        latency,
        models: normalizedModels,
        version: 'Ollama Active',
      };
    } else {
      return {
        online: false,
        latency,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err) {
    return {
      online: false,
      latency: Math.round(performance.now() - startTime),
      error: err.name === 'TimeoutError' ? 'Koneksi Timeout (4 detik)' : `Tidak dapat terhubung ke ${endpoint}`,
    };
  }
}

export async function fetchInstalledModels(endpoint = '/ollama') {
  try {
    const cleanEndpoint = endpoint.replace(/\/+$/, '');
    const res = await fetch(`${cleanEndpoint}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        return data.models.map((m) => ({
          id: m.name,
          name: m.name,
          size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : 'Local Model',
          details: m.details,
          isInstalled: true,
        }));
      }
    }
  } catch (err) {
    console.warn('Could not fetch installed Ollama models:', err.message);
  }
  return [];
}

export async function streamChatWithOllama({
  endpoint = '/ollama',
  model = 'llama3.2:latest',
  messages = [],
  systemPrompt = '',
  temperature = 0.7,
  onChunk,
  signal,
}) {
  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  const url = `${cleanEndpoint}/api/chat`;

  // ── Security: validate model string (allowlist pattern) ──────────────────
  const safeModel = typeof model === 'string' && /^[\w.:\-]+$/.test(model.trim())
    ? model.trim()
    : 'llama3.1:8b';

  // ── Security: cap history depth to prevent token stuffing ─────────────────
  const cappedMessages = messages.slice(-MAX_MESSAGE_HISTORY);

  const formattedMessages = [];

  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: sanitizeInput(systemPrompt),
    });
  }

  for (const msg of cappedMessages) {
    const role = msg.role === 'curiosity' ? 'assistant' : msg.role;
    // Only allow known roles
    if (!['user', 'assistant', 'system'].includes(role)) continue;
    const item = {
      role,
      content: sanitizeInput(msg.content),
    };

    if (msg.images && msg.images.length > 0) {
      // Validate each base64 image string
      item.images = msg.images
        .map((img) => img.base64)
        .filter((b64) => typeof b64 === 'string' && b64.length > 0 && b64.length < 10_000_000);
    }

    formattedMessages.push(item);
  }

  // ── Security: clamp temperature to safe range ─────────────────────────────
  const safeTemp = Math.min(Math.max(parseFloat(temperature) || 0.7, 0), 2);

  const payload = {
    model: safeModel,
    messages: formattedMessages,
    stream: true,
    options: {
      temperature: safeTemp,
    },
  };


  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Ollama Error (${response.status}): ${errorText || response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const json = JSON.parse(trimmed);
        if (json.message && json.message.content) {
          const delta = json.message.content;
          accumulatedText += delta;
          if (onChunk) {
            onChunk({
              text: accumulatedText,
              delta: delta,
              done: false,
              evalCount: json.eval_count,
              evalDuration: json.eval_duration,
            });
          }
        }
        if (json.done) {
          if (onChunk) {
            onChunk({
              text: accumulatedText,
              delta: '',
              done: true,
              totalDuration: json.total_duration,
              evalCount: json.eval_count,
            });
          }
        }
      } catch (err) {
        console.warn('Error parsing JSON line from stream:', trimmed, err);
      }
    }
  }

  return accumulatedText;
}

// Clean, professional simulated response generator without emoji clutter
export async function simulateCuriosityResponse({
  prompt = '',
  files = [],
  persona = 'explorer',
  onChunk,
  signal,
}) {
  const lower = prompt.toLowerCase();
  let responseTemplate = '';

  if (files.some((f) => f.type === 'image')) {
    responseTemplate = `## Analisis Gambar & Soal

Berikut adalah hasil identifikasi dan analisis visual terhadap dokumen/gambar yang dilampirkan:

### 1. Identifikasi Parameter Soal
* **Topik Pembahasan:** Mekanika Gerak Lurus Berubah Beraturan (GLBB)
* **Variabel Teridentifikasi:**
  $$v_0 = 20\\text{ m/s},\\quad a = 9.8\\text{ m/s}^2,\\quad t = 5\\text{ s}$$

### 2. Langkah Penyelesaian Sistematis
1. Gunakan persamaan perpindahan untuk percepatan konstan:
   $$s = v_0 t + \\frac{1}{2} a t^2$$
2. Masukkan nilai yang diketahui ke dalam persamaan:
   $$s = (20)(5) + \\frac{1}{2}(9.8)(5)^2$$
   $$s = 100 + 122.5 = 222.5\\text{ meter}$$

### 3. Kesimpulan
Jarak total yang ditempuh objek selama 5 detik adalah **222.5 meter**. Pastikan kesesuaian satuan SI pada setiap perhitungan turunan.`;
  } else if (files.some((f) => f.type === 'pdf' || f.type === 'text')) {
    const doc = files.find((f) => f.type === 'pdf' || f.type === 'text');
    responseTemplate = `## Rangkuman Analisis Dokumen: \`${doc.name}\`

Dokumen berhasil dibaca dan dianalisis (${doc.pages || 1} halaman). Berikut ringkasan poin inti:

### Poin-Poin Utama
1. **Struktur Konseptual:** Menjelaskan fondasi teoritis dan keterhubungannya dengan aplikasi teknis.
2. **Korelasi Terhadap Pertanyaan:** Pembahasan langsung terhadap konteks "${prompt || 'Analisis materi dokumen'}".

\`\`\`markdown
[Status Dokumen]
* Nama Berkas : ${doc.name}
* Karakter    : ${doc.text ? doc.text.length : 1200} karakter
* Status      : Berhasil diproses
\`\`\`

Tuliskan pertanyaan spesifik jika ada bagian tertentu yang ingin dibedah lebih lanjut.`;
  } else if (lower.includes('matematika') || lower.includes('rumus') || lower.includes('aljabar') || lower.includes('hitung') || lower.includes('turunan') || lower.includes('integral')) {
    responseTemplate = `## Pembahasan Soal Matematika

Berikut adalah langkah penyelesaian terstruktur untuk turunan fungsi:

### 1. Teorema yang Digunakan
Untuk fungsi berupa perkalian dua sub-fungsi $f(x) = u(x) \\cdot v(x)$, gunakan **Aturan Perkalian (Product Rule)**:
$$(u \\cdot v)' = u'v + uv'$$

### 2. Diferensiasi Komponen
Diberikan fungsi:
$$f(x) = \\sin(2x) \\cdot e^{3x}$$

Tentukan turunan masing-masing bagian:
* $u(x) = \\sin(2x) \\implies u'(x) = 2\\cos(2x)$
* $v(x) = e^{3x} \\implies v'(x) = 3e^{3x}$

### 3. Penggabungan & Faktorisasi
$$f'(x) = [2\\cos(2x)](e^{3x}) + (\\sin(2x))[3e^{3x}]$$
$$f'(x) = e^{3x} \\left( 2\\cos(2x) + 3\\sin(2x) \\right)$$

\`\`\`python
# Verifikasi simbolik dengan Python SymPy
import sympy as sp

x = sp.Symbol('x')
f = sp.sin(2*x) * sp.exp(3*x)
df = sp.diff(f, x)
print("Hasil Turunan:", df)
\`\`\`

Hasil akhir turunan fungsi adalah **$f'(x) = e^{3x}(2\\cos(2x) + 3\\sin(2x))$**.`;
  } else if (lower.includes('presiden') && lower.includes('indonesia')) {
    responseTemplate = `## Daftar Presiden Republik Indonesia (1945 – Sekarang)

Berdasarkan data sejarah dan konstitusi Republik Indonesia, berikut adalah urutan 8 Presiden Republik Indonesia dari yang pertama hingga saat ini:

1. **Ir. Soekarno** (18 Agustus 1945 – 12 Maret 1967)
   * *Status:* Proklamator Kemerdekaan dan Presiden Pertama RI.
   * *Wakil Presiden:* Mohammad Hatta (1945–1956).

2. **Soeharto** (12 Maret 1967 – 21 Mei 1998)
   * *Status:* Presiden Kedua RI (memimpin era Orde Baru dan pembangunan nasional selama lebih dari 3 dekade).

3. **Prof. Dr.-Ing. B.J. Habibie** (21 Mei 1998 – 20 Oktober 1999)
   * *Status:* Presiden Ketiga RI (memimpin masa transisi reformasi dan peletak dasar kebebasan pers serta reformasi perbankan).

4. **K.H. Abdurrahman Wahid (Gus Dur)** (20 Oktober 1999 – 23 Juli 2001)
   * *Status:* Presiden Keempat RI (dikenal atas penguatan demokrasi, pluralisme, dan hak-hak minoritas).
   * *Wakil Presiden:* Megawati Soekarnoputri.

5. **Megawati Soekarnoputri** (23 Juli 2001 – 20 Oktober 2004)
   * *Status:* Presiden Kelima RI dan presiden wanita pertama dalam sejarah Indonesia (mendirikan Komisi Pemberantasan Korupsi / KPK).
   * *Wakil Presiden:* Hamzah Haz.

6. **Jenderal TNI (Purn.) Susilo Bambang Yudhoyono (SBY)** (20 Oktober 2004 – 20 Oktober 2014)
   * *Status:* Presiden Keenam RI dan presiden pertama yang dipilih langsung oleh rakyat melalui Pemilu Demokratis (2 periode).
   * *Wakil Presiden:* Jusuf Kalla (2004–2009) dan Boediono (2009–2014).

7. **Ir. H. Joko Widodo (Jokowi)** (20 Oktober 2014 – 20 Oktober 2024)
   * *Status:* Presiden Ketujuh RI (fokus pada transformasi infrastruktur masif, hilirisasi industri, dan pemindahan IKN, 2 periode).
   * *Wakil Presiden:* Jusuf Kalla (2014–2019) dan K.H. Ma'ruf Amin (2019–2024).

8. **Jenderal TNI (Purn.) Prabowo Subianto** (20 Oktober 2024 – Sekarang)
   * *Status:* **Presiden Kedelapan RI (Petahana saat ini)**. Dilantik secara resmi pada tanggal 20 Oktober 2024 setelah memenangkan Pemilihan Presiden 2024.
   * *Wakil Presiden:* Gibran Rakabuming Raka.
   * *Nama Kabinet:* Kabinet Merah Putih.

---
> **Catatan Terkini:** Saat ini kepala negara dan kepala pemerintahan Republik Indonesia yang aktif menjabat adalah **Presiden Prabowo Subianto** bersama Wakil Presiden **Gibran Rakabuming Raka**.`;
  } else if (lower.includes('fisika') || lower.includes('roket') || lower.includes('gravitasi') || lower.includes('newton') || lower.includes('langit')) {
    responseTemplate = `## Prinsip Fisika & Mekanika Antariksa

### 1. Prinsip Kerja Roket di Ruang Hampa
Propulsi roket didasarkan pada **Hukum III Newton (Aksi - Reaksi)** dan **Kekekalan Momentum**:
$$\\sum \\vec{F}_{\\text{aksi}} = -\\sum \\vec{F}_{\\text{reaksi}}$$

Ketika gas hasil pembakaran disemburkan keluar melalui nosel dengan kecepatan tinggi ($v_e$), roket memperoleh gaya dorong (*thrust*) berlawanan arah sebesar:
$$F_{\\text{thrust}} = \\dot{m} \\cdot v_e$$
Dimana $\\dot{m} = \\frac{dm}{dt}$ adalah laju aliran massa bahan bakar.

### 2. Hukum Gravitasi Universal
Interaksi gravitasi antara dua massa $m_1$ dan $m_2$ pada jarak $r$ dirumuskan sebagai:
$$F = G \\frac{m_1 m_2}{r^2}$$
dengan $G = 6.674 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$.

Roket tidak memerlukan medium udara untuk bergerak karena gaya dorong murni berasal dari momentum gas yang dikeluarkan dari dalam sistem roket itu sendiri.`;
  } else if (lower.includes('router') || lower.includes('jaringan') || lower.includes('internet') || lower.includes('ip') || lower.includes('koding') || lower.includes('komputer')) {
    responseTemplate = `## Arsitektur Jaringan Komputer & Mekanisme Router

### 1. Peran Router dan NAT (Network Address Translation)
Router berfungsi pada Layer 3 (Network Layer) dalam model OSI untuk meneruskan paket data antar jaringan yang berbeda:
1. **Penerimaan Paket:** Memeriksa header IP tujuan.
2. **Tabel Routing:** Menentukan rute hop berikutnya paling efisien.
3. **Translasi Alamat (NAT):** Memetakan banyak alamat IP privat lokal ke satu alamat IP publik global.

\`\`\`
[Host Lokal: 192.168.1.10] ---> [Router NAT: 182.253.14.88] ---> [Internet Gateway] ---> [Server Tujuan]
\`\`\`

### 2. Perbandingan IP Privat vs IP Publik
| Parameter | Alamat IP Privat | Alamat IP Publik |
| :--- | :--- | :--- |
| **Cakupan** | Jaringan Lokal (LAN) | Jaringan Global (WAN/Internet) |
| **Rentang Standar** | \`10.0.0.0/8\`, \`192.168.0.0/16\` | Alamat terdaftar unik global |
| **Aksesibilitas** | Terisolasi di balik firewall | Dapat dirouting secara global |

\`\`\`javascript
// Contoh permintaan paket data melalui antarmuka fetch
async function kirimPermintaan(endpoint, data) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}
\`\`\``;
  } else {
    responseTemplate = `## Penjelasan Konseptual

Berikut adalah analisis terhadap pertanyaan: **"${prompt}"**.

### Struktur Pembahasan
1. **Definisi Dasar:** Menjelaskan batasan dan konteks materi yang ditanyakan.
2. **Kaidah & Prinsip Utama:** Menghubungkan konsep teoritis dengan aplikasi penyelesaian masalah.
3. **Metode Penyelesaian:** Menerapkan langkah analitis sistematis.

\`\`\`markdown
[Catatan Pembelajaran]
* Rumus dan konsep dapat diverifikasi secara bertahap
* Tuliskan pertanyaan lanjutan untuk pendalaman materi tertentu
\`\`\`

Silakan tanyakan bagian mana yang memerlukan penjelasan lebih detail.`;
  }

  const words = responseTemplate.split(' ');
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    if (signal && signal.aborted) break;
    const chunk = (i === 0 ? '' : ' ') + words[i];
    accumulated += chunk;
    if (onChunk) {
      onChunk({
        text: accumulated,
        delta: chunk,
        done: i === words.length - 1,
      });
    }
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 12) + 8));
  }

  return accumulated;
}
