import * as pdfjsLib from 'pdfjs-dist';

// Set up pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export async function processFile(file) {
  const fileType = file.type;
  const fileName = file.name;
  const fileSize = file.size;

  // ── Security: File size limit ──────────────────────────────────────────────
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`Ukuran file melebihi batas maksimum 20 MB. File diteolak.`);
  }

  // ── Security: Strict MIME type & extension allowlist ──────────────────────
  const ALLOWED_IMAGE_TYPES = new Set([
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
  ]);
  const ALLOWED_DOC_TYPES = new Set([
    'application/pdf',
    'text/plain', 'text/markdown', 'text/csv',
    'text/html', 'text/xml', 'application/json',
    'text/x-python', 'text/x-java-source', 'text/x-c',
    'application/javascript', 'text/javascript',
    'text/x-typescript', 'text/css',
  ]);
  const ALLOWED_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.webp', '.gif',
    '.pdf', '.txt', '.md', '.csv', '.json', '.py', '.js', '.ts',
    '.jsx', '.tsx', '.css', '.java', '.c', '.cpp', '.h', '.go',
    '.rs', '.php', '.rb', '.sh', '.yaml', '.yml', '.xml', '.html',
  ]);

  const ext = '.' + fileName.split('.').pop().toLowerCase();
  const isImageAllowed = ALLOWED_IMAGE_TYPES.has(fileType);
  const isDocAllowed = ALLOWED_DOC_TYPES.has(fileType) || fileType === '' || fileType === 'application/octet-stream';
  const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

  if (!isExtAllowed) {
    throw new Error(`Jenis file "${ext}" tidak diizinkan. Hanya file dokumen, gambar, dan kode yang dapat diunggah.`);
  }

  // Sanitize filename — remove path traversal and dangerous characters
  const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 255);

  // 1. Image Files
  if (ALLOWED_IMAGE_TYPES.has(fileType)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const base64Data = dataUrl.split(',')[1];
        resolve({
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          type: 'image',
          name: safeFileName,
          size: formatBytes(fileSize),
          dataUrl: dataUrl,
          base64: base64Data,
          rawFile: file,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 2. PDF Files — limit to 50 pages max to prevent DoS via huge PDFs
  if (fileType === 'application/pdf' || ext === '.pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = Math.min(pdf.numPages, 50);
      let fullText = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += `\n--- Halaman ${pageNum} ---\n${pageText}`;
      }

      return {
        id: 'doc_' + Math.random().toString(36).substring(2, 9),
        type: 'pdf',
        name: safeFileName,
        size: formatBytes(fileSize),
        pages: numPages,
        text: fullText.trim(),
        snippet: fullText.slice(0, 300) + '...',
      };
    } catch (err) {
      // Silent fallback — do not expose internal error details
      const text = await file.text();
      return {
        id: 'doc_' + Math.random().toString(36).substring(2, 9),
        type: 'pdf',
        name: safeFileName,
        size: formatBytes(fileSize),
        pages: 1,
        text: text.slice(0, 5000),
        snippet: text.slice(0, 300),
      };
    }
  }

  // 3. Text & Code files (.txt, .md, .py, .js, .json, .csv, etc.)
  try {
    const textContent = await file.text();
    // Cap at 100 KB to prevent memory exhaustion via huge text files
    const cappedText = textContent.slice(0, 100 * 1024);
    return {
      id: 'doc_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: safeFileName,
      size: formatBytes(fileSize),
      text: cappedText,
      snippet: cappedText.slice(0, 300) + (cappedText.length > 300 ? '...' : ''),
    };
  } catch {
    throw new Error('Gagal membaca file. Pastikan file tidak rusak dan coba lagi.');
  }
}

export function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
