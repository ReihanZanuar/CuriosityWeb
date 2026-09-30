import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import hljs from 'highlight.js';
import { sound } from '../utils/soundEffects';

// Custom Marked Renderer for Syntax Highlighting and Code Block Actions
const renderer = new marked.Renderer();

renderer.code = function (token) {
  const codeText = typeof token === 'object' ? token.text : arguments[0];
  const lang = typeof token === 'object' ? token.lang : arguments[1];

  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  let highlightedCode = '';
  try {
    highlightedCode = hljs.highlight(codeText || '', { language: language }).value;
  } catch {
    highlightedCode = codeText || '';
  }

  return `
    <div class="code-block-container">
      <div class="code-block-header">
        <span class="code-lang-tag">${language.toUpperCase()}</span>
        <button class="copy-code-btn" type="button" aria-label="Salin Kode">
          <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span class="copy-text">Salin</span>
        </button>
      </div>
      <pre><code class="hljs ${language}">${highlightedCode}</code></pre>
    </div>
  `;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
});

export default function MarkdownRenderer({ content = '' }) {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    let text = content;

    // Step 1: Protect Fenced Code Blocks & Inline Code from math regex ($ signs in code)
    const codeTokens = [];
    text = text.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
      const id = `XCODEPROTECT${codeTokens.length}X`;
      codeTokens.push({ id, raw: match });
      return id;
    });

    // Step 2: Extract Display Math ($$ ... $$) with alphanumeric IDs (no underscores)
    const mathPlaceholders = [];
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      const id = `XKATEXBLOCK${mathPlaceholders.length}X`;
      let rendered = '';
      try {
        rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        rendered = `<span class="katex-error">${formula}</span>`;
      }
      mathPlaceholders.push({ id, html: `<div class="katex-display-wrapper">${rendered}</div>` });
      return id;
    });

    // Step 3: Extract Inline Math ($ ... $) with alphanumeric IDs
    text = text.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (match, formula) => {
      // Avoid matching currency like $100 or empty $
      if (/^\s*$/.test(formula) || /^\d+(\.\d+)?$/.test(formula.trim())) return match;
      const id = `XKATEXINLINE${mathPlaceholders.length}X`;
      let rendered = '';
      try {
        rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch (err) {
        rendered = `<span class="katex-error">${formula}</span>`;
      }
      mathPlaceholders.push({ id, html: `<span class="katex-inline-wrapper">${rendered}</span>` });
      return id;
    });

    // Step 4: Restore Code Tokens before markdown parsing so marked can format them
    for (const item of codeTokens) {
      text = text.replaceAll(item.id, item.raw);
    }

    // Step 5: Parse Markdown with Marked
    let rawHtml = marked.parse(text);

    // Step 6: Restore KaTeX placeholders
    for (const item of mathPlaceholders) {
      rawHtml = rawHtml.replaceAll(item.id, item.html);
    }

    // Step 7: Sanitize HTML with DOMPurify
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: [
        'span', 'div', 'button', 'svg', 'path', 'rect', 'line', 'polygon', 'circle',
        'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac',
        'mover', 'munder', 'msqrt', 'mroot', 'mtable', 'mtr', 'mtd', 'annotation', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ADD_ATTR: [
        'aria-hidden', 'aria-label', 'class', 'style', 'viewBox', 'width', 'height',
        'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd',
        'x', 'y', 'rx', 'ry', 'points', 'cx', 'cy', 'r', 'xmlns', 'colspan', 'rowspan'
      ],
    });

    return cleanHtml;
  }, [content]);

  // Handle Copy Button Click Delegation directly from <code> textContent
  const handleClick = (e) => {
    const copyBtn = e.target.closest('.copy-code-btn');
    if (!copyBtn) return;

    const container = copyBtn.closest('.code-block-container');
    if (!container) return;

    const codeEl = container.querySelector('code');
    if (codeEl) {
      const code = codeEl.innerText || codeEl.textContent || '';
      navigator.clipboard.writeText(code);
      sound.playClick();

      const textSpan = copyBtn.querySelector('.copy-text');
      if (textSpan) {
        textSpan.textContent = 'Tersalin!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          textSpan.textContent = 'Salin';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    }
  };

  return (
    <div
      className="markdown-body-custom"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      onClick={handleClick}
    />
  );
}
