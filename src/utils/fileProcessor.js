import * as pdfjsLib from 'pdfjs-dist';

// Set up pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export async function processFile(file) {
  const fileType = file.type;
  const fileName = file.name;
  const fileSize = file.size;

  // 1. Image Files
  if (fileType.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        // Base64 without the prefix "data:image/xyz;base64,"
        const base64Data = dataUrl.split(',')[1];
        resolve({
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          type: 'image',
          name: fileName,
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

  // 2. PDF Files
  if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
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
        name: fileName,
        size: formatBytes(fileSize),
        pages: numPages,
        text: fullText.trim(),
        snippet: fullText.slice(0, 300) + '...',
      };
    } catch (err) {
      console.warn('PDF.js parsing error, attempting text fallback:', err);
      // Fallback text extraction
      const text = await file.text();
      return {
        id: 'doc_' + Math.random().toString(36).substring(2, 9),
        type: 'pdf',
        name: fileName,
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
    return {
      id: 'doc_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: fileName,
      size: formatBytes(fileSize),
      text: textContent,
      snippet: textContent.slice(0, 300) + (textContent.length > 300 ? '...' : ''),
    };
  } catch (err) {
    throw new Error(`Gagal membaca file: ${err.message}`);
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
