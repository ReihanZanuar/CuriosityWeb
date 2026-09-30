import React, { useState, useEffect } from 'react';
import { getModelThemeCodename } from '../utils/spaceMissions';

export default function ThinkingIndicator({
  model = '',
  theme = 'space',
  isWebSearching = false,
  searchStatus = '',
}) {
  const [index, setIndex] = useState(0);
  const modelInfo = getModelThemeCodename(model, theme);
  const displayName = modelInfo.rocketName || modelInfo.name;

  let THOUGHTS = [];

  if (isWebSearching) {
    THOUGHTS = [
      {
        icon: 'globe',
        text: searchStatus || 'Menghubungkan transmisi data & mencari fakta di web global...',
      },
      {
        icon: 'satellite',
        text: 'Memindai ensiklopedia dan repositori web untuk data terverifikasi...',
      },
      {
        icon: 'computer',
        text: 'Mengintegrasikan fakta terbaru 2024-2026 agar jawaban akurat tanpa halusinasi...',
      },
    ];
  } else if (theme === 'network') {
    THOUGHTS = [
      {
        icon: 'network',
        text: `Mengalokasikan bandwidth dan throughput pada ${displayName}...`,
      },
      {
        icon: 'computer',
        text: 'Memproses paket data pada routing table dan memverifikasi subnet...',
      },
      {
        icon: 'network',
        text: 'Menganalisis arsitektur layer OSI dan mendistribusikan aliran data...',
      },
      {
        icon: 'computer',
        text: 'Mentransmisikan data terenkripsi melalui kanal berkecepatan tinggi...',
      },
    ];
  } else if (theme === 'science') {
    THOUGHTS = [
      {
        icon: 'atom',
        text: `Menghitung orbital kuantum dan energi aktivasi pada ${displayName}...`,
      },
      {
        icon: 'math',
        text: 'Mengkalkulasi diferensiasi persamaan fisika dan hukum termodinamika...',
      },
      {
        icon: 'atom',
        text: 'Menganalisis konfigurasi elektron, ikatan kovalen, dan kesetimbangan reaksi...',
      },
      {
        icon: 'telescope',
        text: 'Mengukur parameter spektroskopi dan verifikasi konstanta fisika...',
      },
    ];
  } else {
    // Default Space Theme
    THOUGHTS = [
      {
        icon: 'rocket',
        text: `Menyelaraskan propulsi ${displayName} dengan trajektori orbit...`,
      },
      {
        icon: 'math',
        text: 'Wahh rasa ingin tahu kamu tinggi ya! Formula dan penalaran mendalam sedang dikalkulasi...',
      },
      {
        icon: 'ship',
        text: 'Mengapa kapal berbahan besi baja bisa terapung di lautan luas? Prinsip Hukum Archimedes sedang dihitung...',
      },
      {
        icon: 'computer',
        text: 'Memproses instruksi komputasi sains dan mentransmisikan paket data...',
      },
      {
        icon: 'telescope',
        text: 'Menyesuaikan fokus lensa teleskopik terhadap konstelasi data...',
      },
      {
        icon: 'atom',
        text: 'Menganalisis konfigurasi elektron dan kesetimbangan reaksi...',
      },
    ];
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % THOUGHTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isWebSearching, theme]);

  const current = THOUGHTS[index % THOUGHTS.length];

  return (
    <div className="thinking-indicator-wrap" aria-live="polite">
      <div className="thinking-icon-box">
        {current.icon === 'globe' && (
          <svg className="thinking-svg-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        )}
        {current.icon === 'satellite' && (
          <svg className="thinking-svg-bob" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 7 9 3 5 7l4 4" />
            <path d="m17 11 4 4-4 4-4-4" />
            <path d="m8 12 4 4 6-6-4-4Z" />
            <path d="m16 8 3-3" />
            <path d="M9 21a6 6 0 0 0-6-6" />
          </svg>
        )}
        {current.icon === 'rocket' && (
          <svg className="thinking-svg-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        )}
        {current.icon === 'network' && (
          <svg className="thinking-svg-pulse" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="16" y="16" width="6" height="6" rx="1" />
            <rect x="2" y="16" width="6" height="6" rx="1" />
            <rect x="9" y="2" width="6" height="6" rx="1" />
            <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
            <path d="M12 12V8" />
          </svg>
        )}
        {current.icon === 'ship' && (
          <svg className="thinking-svg-bob" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 20a6 6 0 0 0 6-2 6 6 0 0 1 6 2 6 6 0 0 0 6-2 6 6 0 0 1 4 2" />
            <path d="M4 17l2-7h12l2 7" />
            <line x1="12" y1="10" x2="12" y2="4" />
            <polygon points="12 4 17 6 12 8 12 4" fill="currentColor" fillOpacity="0.3" />
          </svg>
        )}
        {current.icon === 'computer' && (
          <svg className="thinking-svg-pulse" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="12" x="3" y="4" rx="2" />
            <line x1="2" y1="20" x2="22" y2="20" />
            <line x1="12" y1="16" x2="12" y2="20" />
            <line x1="7" y1="9" x2="10" y2="9" strokeWidth="2.5" />
          </svg>
        )}
        {current.icon === 'math' && (
          <svg className="thinking-svg-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
          </svg>
        )}
        {current.icon === 'telescope' && (
          <svg className="thinking-svg-bob" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
            <path d="m13.56 11.747 4.332-.924" />
            <path d="m16 21-3.105-6.21" />
            <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a2 2 0 0 1 2.425 1.455l1.365 5.46a2 2 0 0 1-1.455 2.425l-1.09.272a2 2 0 0 1-2.425-1.455z" />
            <path d="m6 21 6-11 6 11" />
          </svg>
        )}
        {current.icon === 'atom' && (
          <svg className="thinking-svg-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
          </svg>
        )}
      </div>

      <span key={index} className="thinking-text-fade">
        {current.text}
      </span>
    </div>
  );
}
