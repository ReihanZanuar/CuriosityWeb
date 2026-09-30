import React, { useEffect, useRef, useState } from 'react';
import MessageItem from './MessageItem';
import {
  Calculator,
  Atom,
  FlaskConical,
  Code2,
  BookOpen,
  ArrowDown,
  Compass,
  Sparkles,
  Network,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

const QUICK_STARTERS = [
  {
    icon: Calculator,
    category: 'Matematika & Kalkulus',
    prompt: 'Bantu aku menyelesaikan soal turunan trigonometri f(x) = sin(2x) * cos(3x) dengan langkah-langkah jelas!',
  },
  {
    icon: Atom,
    category: 'Fisika & Mekanika',
    prompt: 'Jelaskan bagaimana roket antariksa bermanuver di ruang hampa berdasarkan Hukum Newton III dan prinsip impuls momentum.',
  },
  {
    icon: Network,
    category: 'Informatika & Jaringan',
    prompt: 'Bagaimana cara kerja router membagi sinyal WiFi dan membedakan IP Publik dengan IP Lokal (NAT)?',
  },
  {
    icon: FlaskConical,
    category: 'Kimia & Reaksi',
    prompt: 'Bagaimana cara menyetarakan persamaan reaksi redoks dalam suasana asam dengan metode setengah reaksi?',
  },
];

export default function ChatArea({
  messages = [],
  isGenerating,
  onSendMessage,
  onRegenerate,
  onImageClick,
  onOpenTemplates,
  theme = 'space',
}) {
  const scrollContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAutoScrollRef = useRef(true);

  // Auto scroll to bottom
  useEffect(() => {
    if (isAutoScrollRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isGenerating]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isAutoScrollRef.current = isAtBottom;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      isAutoScrollRef.current = true;
      setShowScrollBottom(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    sound.playClick();
    onSendMessage({
      text: promptText,
      files: [],
    });
  };

  return (
    <div className="chat-area-wrapper">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="chat-scroll-area custom-scroll"
      >
        {messages.length === 0 ? (
          /* Clean Welcome Screen */
          <div className="welcome-screen">
            <div className="welcome-logo-badge">
              <img src="/curiosity - Edited.png" alt="Curiosity Logo" className="welcome-logo-img" />
            </div>

            <div className="welcome-tag">
              <Sparkles size={13} />
              <span>Curiosity AI Workspace</span>
            </div>

            <h2 className="welcome-headline">
              Ada materi atau soal yang ingin dipelajari hari ini?
            </h2>
            <p className="welcome-subline">
              Tanyakan konsep belajar, rumus matematika, fisika, informatika, atau unggah foto soal dan dokumen materi sekolah.
            </p>

            {/* Quick Starters Grid */}
            <div className="quick-starters-grid">
              {QUICK_STARTERS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="starter-card"
                    onClick={() => handleQuickPrompt(item.prompt)}
                  >
                    <div className="starter-header">
                      <div className="starter-icon-badge">
                        <IconComp size={16} />
                      </div>
                      <span className="starter-cat">{item.category}</span>
                    </div>
                    <p className="starter-text">{item.prompt}</p>
                    <div className="starter-action">Tanyakan &rarr;</div>
                  </div>
                );
              })}
            </div>

            {/* Explore Topics Button */}
            <div className="welcome-more-row">
              <button className="btn-explore-topics" onClick={onOpenTemplates}>
                <BookOpen size={15} />
                <span>Lihat Bank Topik & Soal Lengkap</span>
              </button>
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="messages-stream">
            {messages.map((msg, index) => (
              <MessageItem
                key={msg.id || index}
                message={msg}
                theme={theme}
                isLast={index === messages.length - 1}
                isGenerating={isGenerating}
                onRegenerate={onRegenerate}
                onImageClick={onImageClick}
                onQuickFollowUp={(followUpText) => {
                  onSendMessage({ text: followUpText, files: [] });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll to Bottom */}
      {showScrollBottom && (
        <button
          className="scroll-bottom-btn"
          onClick={scrollToBottom}
          title="Gulir ke Bawah"
        >
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
}
