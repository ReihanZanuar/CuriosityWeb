import React, { useState } from 'react';
import {
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle,
  FileText,
  Eye,
  Compass,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Rocket,
  Network,
  Atom,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import ThinkingIndicator from './ThinkingIndicator';
import { speech } from '../utils/speech';
import { sound } from '../utils/soundEffects';
import { getModelThemeCodename } from '../utils/spaceMissions';

export default function MessageItem({
  message,
  isLast,
  isGenerating,
  onRegenerate,
  onImageClick,
  onQuickFollowUp,
  theme = 'space',
}) {
  const isCuriosity = message.role === 'curiosity' || message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSources, setShowSources] = useState(true);

  const modelInfo = isCuriosity && message.model ? getModelThemeCodename(message.model, theme) : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speech.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speech.speak(message.content, {
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <div className={`message-item-row ${isCuriosity ? 'msg-curiosity' : 'msg-user'}`}>
      {/* Clean Vector SVG Avatar */}
      <div className="message-avatar-wrap">
        {isCuriosity ? (
          <div className="avatar-curiosity" title="Curiosity AI">
            <img src="/curiosity - Edited.png" alt="Curiosity AI" className="avatar-curiosity-img" />
          </div>
        ) : (
          <div className="avatar-user" title="Pengguna">
            <User size={17} />
          </div>
        )}
      </div>

      {/* Message Content Body */}
      <div className="message-body">
        {/* Header with Sender Name & Meta */}
        <div className="message-meta-header">
          <span className="sender-name">
            {isCuriosity ? 'Curiosity' : 'Pengguna'}
          </span>
          {isCuriosity && modelInfo && (
            <span
              className="msg-model-badge"
              title={`Model LLM: ${message.model} (${modelInfo.type || ''})`}
            >
              {theme === 'network' && <Network size={10} style={{ marginRight: 4, display: 'inline' }} />}
              {theme === 'science' && <Atom size={10} style={{ marginRight: 4, display: 'inline' }} />}
              {theme === 'space' && <Rocket size={10} style={{ marginRight: 4, display: 'inline' }} />}
              {modelInfo.rocketName || modelInfo.name}
            </span>
          )}
          {isCuriosity && message.sources && message.sources.length > 0 && (
            <span className="msg-websearch-badge" title="Data diperkaya dengan pencarian web global live">
              <Globe size={11} /> Web Search
            </span>
          )}
          <span className="msg-time">
            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Attached Files & Images */}
        {message.images && message.images.length > 0 && (
          <div className="msg-attachments-grid">
            {message.images.map((img, idx) => (
              <div
                key={idx}
                className="msg-img-card"
                onClick={() => onImageClick && onImageClick(img)}
                title="Klik untuk memperbesar gambar"
              >
                <img src={img.dataUrl} alt={img.name || 'Lampiran'} className="msg-attached-img" />
                <div className="msg-img-overlay">
                  <Eye size={14} />
                  <span>Perbesar</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {message.documents && message.documents.length > 0 && (
          <div className="msg-documents-grid">
            {message.documents.map((doc, idx) => (
              <div key={idx} className="msg-doc-pill">
                <FileText size={16} className="text-blue" />
                <div className="doc-pill-info">
                  <span className="doc-pill-name">{doc.name}</span>
                  <span className="doc-pill-meta">
                    {doc.pages ? `${doc.pages} Halaman • ` : ''}
                    {doc.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verified Web Sources Card (Above answer or inside) */}
        {isCuriosity && message.sources && message.sources.length > 0 && (
          <div className="sources-card-box">
            <div
              className="sources-card-header"
              onClick={() => {
                sound.playClick();
                setShowSources((prev) => !prev);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="sources-header-left">
                <Globe size={13} className="text-blue" />
                <span className="sources-title-text">
                  Data Terverifikasi dari {message.sources.length} Sumber Web
                </span>
              </div>
              <div className="sources-header-right">
                {showSources ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </div>
            </div>

            {showSources && (
              <div className="sources-grid custom-scroll">
                {message.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-chip-item"
                    title={src.title}
                  >
                    <div className="source-item-top">
                      <span className="source-index-num">[{idx + 1}]</span>
                      <span className="source-item-title">{src.title}</span>
                      <ExternalLink size={11} className="source-item-icon" />
                    </div>
                    {src.snippet && <p className="source-item-snippet">{src.snippet}</p>}
                    <span className="source-item-domain">{src.sourceName || 'Web Source'}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Text Content */}
        <div className="message-bubble">
          {isCuriosity ? (
            message.content ? (
              <MarkdownRenderer content={message.content} />
            ) : isGenerating && isLast ? (
              <ThinkingIndicator
                model={message.model}
                theme={theme}
                isWebSearching={message.isWebSearching}
                searchStatus={message.searchStatus}
              />
            ) : (
              <span className="text-muted">Tidak ada respon</span>
            )
          ) : (
            <div className="user-message-text">{message.content}</div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        {isCuriosity && !isGenerating && (
          <div className="message-actions-bar">
            <button
              className="msg-tool-btn"
              onClick={handleCopy}
              title="Salin Jawaban"
            >
              {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              className={`msg-tool-btn ${isSpeaking ? 'active-speak' : ''}`}
              onClick={handleToggleSpeak}
              title={isSpeaking ? 'Hentikan Suara' : 'Dengarkan Jawaban'}
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{isSpeaking ? 'Hening' : 'Suara'}</span>
            </button>

            {isLast && onRegenerate && (
              <button
                className="msg-tool-btn"
                onClick={onRegenerate}
                title="Buat ulang respon"
              >
                <RotateCcw size={13} />
                <span>Ulangi</span>
              </button>
            )}

            {isLast && onQuickFollowUp && (
              <div className="quick-followups-bar">
                <button
                  className="quick-chip"
                  onClick={() => onQuickFollowUp('Berikan contoh soal latihan serupa beserta langkah penyelesaiannya.')}
                >
                  Contoh Soal Latihan
                </button>
                <button
                  className="quick-chip"
                  onClick={() => onQuickFollowUp('Jelaskan konsep ini dengan analogi sederhana.')}
                >
                  Analogi Sederhana
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
