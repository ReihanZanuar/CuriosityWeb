import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Network,
  Languages,
  Compass,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { TOPIC_CATEGORIES, TOPIC_BANK } from '../data/topicBank';

const CATEGORY_ICONS = {
  all: Sparkles,
  math: Calculator,
  physics: Atom,
  chem: FlaskConical,
  cs: Network,
  lang: Languages,
};

const ITEMS_PER_PAGE = 40;

export default function PromptTemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    let result = TOPIC_BANK;

    // 1. Category filter
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.cat === activeCategory);
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.prompt.toLowerCase().includes(q) ||
          (t.subcat && t.subcat.toLowerCase().includes(q)) ||
          (t.level && t.level.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  // Reset pagination when category or search changes
  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const currentVisible = filteredTopics.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTopics.length;

  const handleSelect = (prompt) => {
    sound.playClick();
    onSelectTemplate(prompt);
    onClose();
  };

  const handleLoadMore = () => {
    sound.playClick();
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-large topic-bank-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Compass size={18} />
            </div>
            <div>
              <div className="modal-title-row">
                <h2 className="modal-title">Bank Topik & Soal Belajar</h2>
                <span className="topic-total-badge">1.100+ Topik</span>
              </div>
              <p className="modal-subtitle">
                Eksplorasi ribuan materi sains, matematika, informatika, dan kurikulum lengkap
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup Modal">
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="topic-bank-search-bar">
          <div className="topic-search-box">
            <Search size={15} className="topic-search-icon" />
            <input
              type="text"
              placeholder="Cari topik, rumus, materi sekolah, atau konsep (misal: Kalkulus, Redoks, BGP, Newton)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="topic-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="topic-search-clear"
                onClick={() => setSearchQuery('')}
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="template-categories-bar custom-scroll">
          {TOPIC_CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat.id] || Sparkles;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`cat-pill ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat.id);
                }}
              >
                <IconComp size={13} style={{ marginRight: 4 }} />
                <span>{cat.label}</span>
                {cat.count && <span className="cat-pill-count">{cat.count}</span>}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="topic-bank-stats-row">
          <span className="topic-count-info">
            Menampilkan <strong>{currentVisible.length}</strong> dari <strong>{filteredTopics.length}</strong> topik
          </span>
          {searchQuery && (
            <span className="topic-filter-tag">
              Kata kunci: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Templates Grid */}
        <div className="modal-body custom-scroll">
          {filteredTopics.length === 0 ? (
            <div className="topic-empty-state">
              <BookOpen size={32} className="text-muted" />
              <p className="empty-title">Tidak ada topik yang cocok</p>
              <span className="empty-desc">
                Coba gunakan kata kunci pencarian lain atau pilih kategori bidang yang berbeda.
              </span>
            </div>
          ) : (
            <>
              <div className="templates-grid">
                {currentVisible.map((item) => {
                  const IconComp = CATEGORY_ICONS[item.cat] || Sparkles;
                  return (
                    <div
                      key={item.id}
                      className="template-card"
                      onClick={() => handleSelect(item.prompt)}
                    >
                      <div className="template-card-top">
                        <div className={`template-icon-wrap cat-icon-${item.cat}`}>
                          <IconComp size={14} />
                        </div>
                        <div className="template-card-badges">
                          {item.subcat && <span className="template-badge-subcat">{item.subcat}</span>}
                          {item.level && <span className="template-badge-level">{item.level}</span>}
                        </div>
                      </div>
                      <h4 className="template-card-title">{item.title}</h4>
                      <p className="template-card-preview">{item.prompt}</p>
                      <div className="template-card-footer">
                        <span>Gunakan Topik &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="load-more-topics-wrap">
                  <button
                    type="button"
                    className="btn-load-more-topics"
                    onClick={handleLoadMore}
                  >
                    Muat Lebih Banyak ({filteredTopics.length - visibleCount} Topik Tersisa) &darr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
