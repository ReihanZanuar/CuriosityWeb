/**
 * CURIOSITY AI — DYNAMIC MULTI-THEME AUTO-ROUTER
 * Automatically detects prompt complexity, domain (math/STEM/code/general),
 * and attachments (images/PDFs) to launch the optimal model with theme-tailored codenames.
 */

import { getModelThemeCodename } from './spaceMissions';

const MATH_STEM_KEYWORDS = [
  'turunan', 'integral', 'kalkulus', 'matematika', 'aljabar', 'diferensial',
  'trigonometri', 'matriks', 'vektor', 'persamaan', 'fungsi', 'limit',
  'fisika', 'mekanika', 'hukum newton', 'gravitasi', 'momentum', 'impuls',
  'termodinamika', 'gelombang', 'optik', 'kinematika', 'relativitas', 'kuantum',
  'kimia', 'redoks', 'stoikiometri', 'asam basa', 'larutan', 'senyawa', 'reaksi',
  'informatika', 'algoritma', 'koding', 'python', 'javascript', 'struktur data',
  'kompleksitas', 'rekursif', 'loop', 'jaringan', 'router', 'subnetting', 'ip address',
  'mengapa', 'kenapa', 'jelaskan detail', 'bagaimana cara', 'buktikan', 'analisis',
  'langkah-langkah', 'step by step', 'penurunan rumus', 'rumus',
];

const CASUAL_GREETING_KEYWORDS = [
  'halo', 'hai', 'hello', 'hey', 'hei', 'p', 'tes', 'test', 'siapa kamu',
  'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
  'apa kabar', 'terima kasih', 'makasih', 'thanks', 'thank you', 'ok', 'oke', 'sip',
];

/**
 * Dispatches the best model based on prompt weight, attachments, and active theme
 */
export function dispatchOptimalRocket({
  prompt = '',
  files = [],
  installedModels = [],
  currentModel = 'llama3.1:8b',
  autoRouting = true,
  theme = 'space',
}) {
  if (!autoRouting) {
    const codename = getModelThemeCodename(currentModel, theme);
    return {
      selectedModel: currentModel,
      rocket: codename,
      isAutoRouted: false,
      switchReason: 'manual',
      switchToast: null,
    };
  }

  const cleanPrompt = prompt.trim().toLowerCase();
  const hasImages = files && files.some((f) => f.type === 'image');
  const hasDocuments = files && files.some((f) => f.type === 'pdf' || f.type === 'text');

  // Available model IDs (normalize from objects or strings)
  const modelIds = (installedModels || [])
    .map((m) => {
      if (!m) return '';
      if (typeof m === 'string') return m;
      return m.id || m.name || m.model || '';
    })
    .filter(Boolean);

  // Helper to find first available model among candidates
  const findBestAvailable = (candidates, fallback) => {
    for (const cand of candidates) {
      const match = modelIds.find(
        (id) => typeof id === 'string' && id.toLowerCase().includes(cand.toLowerCase())
      );
      if (match) return match;
    }
    return modelIds.length > 0 ? modelIds[0] : fallback;
  };

  let targetModel = currentModel;
  let reason = 'general';

  // CASE 1: MULTIMODAL / IMAGES ATTACHED
  if (hasImages) {
    targetModel = findBestAvailable(
      ['gemma4:e4b', 'gemma4:31b', 'llama3.2-vision', 'llava', 'gemma4'],
      'gemma4:e4b'
    );
    reason = 'vision';
  }
  // CASE 2: DOCUMENTS / PDF ATTACHED
  else if (hasDocuments) {
    targetModel = findBestAvailable(
      ['glm-4.7-flash', 'gemma4:31b', 'qwen2.5:14b', 'mistral-nemo', 'deepseek-r1:14b'],
      'glm-4.7-flash:latest'
    );
    reason = 'document';
  }
  // CASE 3: CASUAL GREETING & SHORT QUERIES
  else if (
    cleanPrompt.length < 35 &&
    CASUAL_GREETING_KEYWORDS.some((kw) => cleanPrompt.includes(kw)) &&
    !MATH_STEM_KEYWORDS.some((kw) => cleanPrompt.includes(kw))
  ) {
    targetModel = findBestAvailable(
      ['llama3.1:8b', 'llama3.1', 'llama3.2:3b', 'mistral-nemo'],
      'llama3.1:8b'
    );
    reason = 'casual';
  }
  // CASE 4: HEAVY REASONING / MATHEMATICS / STEM / DEEP CURIOSITY
  else {
    const isMathOrCoding = MATH_STEM_KEYWORDS.some((kw) => cleanPrompt.includes(kw));
    const isLongComplex = cleanPrompt.length > 90 || cleanPrompt.includes('?') || cleanPrompt.includes('\n');

    if (isMathOrCoding || isLongComplex) {
      if (cleanPrompt.includes('koding') || cleanPrompt.includes('python') || cleanPrompt.includes('algoritma') || cleanPrompt.includes('jaringan')) {
        targetModel = findBestAvailable(
          ['qwen2.5:14b', 'glm-4.7-flash', 'deepseek-r1:14b', 'gemma4:31b'],
          'qwen2.5:14b'
        );
      } else if (cleanPrompt.includes('turunan') || cleanPrompt.includes('integral') || cleanPrompt.includes('hitung') || cleanPrompt.includes('matematika') || cleanPrompt.includes('rumus')) {
        targetModel = findBestAvailable(
          ['deepseek-r1:14b', 'glm-4.7-flash', 'gemma4:31b', 'qwen2.5:14b'],
          'deepseek-r1:14b'
        );
      } else {
        targetModel = findBestAvailable(
          ['glm-4.7-flash', 'gemma4:31b', 'deepseek-r1:14b', 'mistral-nemo'],
          'glm-4.7-flash:latest'
        );
      }
      reason = 'heavy_stem';
    } else {
      targetModel = findBestAvailable(
        ['llama3.1:8b', 'mistral-nemo', 'glm-4.7-flash'],
        'llama3.1:8b'
      );
      reason = 'moderate';
    }
  }

  const modelInfo = getModelThemeCodename(targetModel, theme);
  const displayName = modelInfo.rocketName || modelInfo.name;
  let toastMessage = null;

  // Build Theme-Tailored Notification Messages (Clean without emojis, paired with Lucide SVGs)
  if (theme === 'network') {
    if (reason === 'vision') {
      toastMessage = `Paket visual terdeteksi. Menyiapkan simpul: ${displayName}`;
    } else if (reason === 'document') {
      toastMessage = `Aliran dokumen terdeteksi. Mengaktifkan gateway: ${displayName}...`;
    } else if (reason === 'casual') {
      toastMessage = `Paket data terdeteksi. Menggunakan gateway: ${displayName}...`;
    } else if (reason === 'heavy_stem') {
      toastMessage = `Beban komputasi tinggi. Mengalihkan ke simpul: ${displayName}!`;
    } else {
      toastMessage = `Menyiapkan simpul routing: ${displayName}...`;
    }
  } else if (theme === 'science') {
    if (reason === 'vision') {
      toastMessage = `Spektroskopi visual terdeteksi. Mengaktifkan instrumen: ${displayName}`;
    } else if (reason === 'document') {
      toastMessage = `Dokumen materi terdeteksi. Mengaktifkan reaktor: ${displayName}...`;
    } else if (reason === 'casual') {
      toastMessage = `Pertanyaan terdeteksi. Menggunakan modul dasar: ${displayName}...`;
    } else if (reason === 'heavy_stem') {
      toastMessage = `Penalaran mendalam terdeteksi. Mengaktifkan akselerator logika: ${displayName}!`;
    } else {
      toastMessage = `Menyiapkan modul sains: ${displayName}...`;
    }
  } else {
    // Default Space Theme
    if (reason === 'vision') {
      toastMessage = `Lampiran visual terdeteksi. Menyiapkan wahana ${displayName} untuk analisis gambar.`;
    } else if (reason === 'document') {
      toastMessage = `Dokumen materi terdeteksi. Mengaktifkan wahana ${displayName}...`;
    } else if (reason === 'casual') {
      toastMessage = `Pertanyaan terdeteksi. Menggunakan wahana ${displayName}...`;
    } else if (reason === 'heavy_stem') {
      toastMessage = `Penalaran analitis terdeteksi. Mengalihkan ke wahana: ${displayName}!`;
    } else {
      toastMessage = `Menyiapkan wahana riset ${displayName}...`;
    }
  }

  const hasSwitched = targetModel !== currentModel;

  return {
    selectedModel: targetModel,
    rocket: modelInfo,
    isAutoRouted: true,
    hasSwitched,
    switchReason: reason,
    switchToast: toastMessage,
  };
}
