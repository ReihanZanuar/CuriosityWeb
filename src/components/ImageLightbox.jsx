import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

export default function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-toolbar">
          <span className="lightbox-title">{image.name || 'Pratinjau Gambar'}</span>
          <div className="lightbox-actions">
            <a
              href={image.dataUrl}
              download={image.name || 'curiosity_image.jpg'}
              className="lightbox-btn"
              title="Unduh Gambar"
            >
              <Download size={18} />
            </a>
            <button className="lightbox-btn" onClick={onClose} title="Tutup">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="lightbox-img-wrapper">
          <img src={image.dataUrl} alt={image.name || 'Tampilan Gambar'} className="lightbox-img" />
        </div>
      </div>
    </div>
  );
}
