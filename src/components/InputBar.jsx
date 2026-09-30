import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Image as ImageIcon,
  FileText,
  Mic,
  MicOff,
  X,
  Globe,
} from 'lucide-react';
import { processFile } from '../utils/fileProcessor';
import { speech } from '../utils/speech';
import { sound } from '../utils/soundEffects';

export default function InputBar({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  disabled,
  webSearchMode = 'auto',
  onToggleWebSearch,
  placeholder = 'Tanyakan materi belajar, rumus matematika, fisika, atau unggah dokumen...',
}) {
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      if (inputText) {
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
      } else {
        el.style.height = '22px';
      }
    }
  }, [inputText]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isGenerating) return;
    if (!inputText.trim() && attachedFiles.length === 0) return;

    sound.playSend();
    onSendMessage({
      text: inputText.trim(),
      files: [...attachedFiles],
    });

    setInputText('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = '22px';
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingFile(true);
    sound.playClick();
    try {
      const processedList = await Promise.all(files.map((file) => processFile(file)));
      setAttachedFiles((prev) => [...prev, ...processedList]);
    } catch (err) {
      alert(`Gagal memproses file: ${err.message}`);
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const removeFile = (id) => {
    sound.playClick();
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleToggleVoice = () => {
    if (isListening) {
      speech.stopListening();
      setIsListening(false);
    } else {
      sound.playClick();
      setIsListening(true);
      speech.startListening({
        onResult: (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            setIsListening(false);
          }
        },
        onEnd: () => setIsListening(false),
        onError: (err) => {
          setIsListening(false);
          alert(`Perekaman suara: ${err}`);
        },
      });
    }
  };

  return (
    <div className="input-bar-container">
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="attachments-preview-row custom-scroll">
          {attachedFiles.map((file) => (
            <div key={file.id} className="attachment-chip">
              {file.type === 'image' ? (
                <div className="chip-thumb-wrap">
                  <img src={file.dataUrl} alt={file.name} className="chip-img-thumb" />
                </div>
              ) : (
                <FileText size={15} className="text-blue" />
              )}
              <div className="chip-info">
                <span className="chip-name">{file.name}</span>
                <span className="chip-size">{file.size}</span>
              </div>
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => removeFile(file.id)}
                title="Hapus Lampiran"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {isProcessingFile && (
            <div className="attachment-chip">
              <span>Membaca dokumen...</span>
            </div>
          )}
        </div>
      )}

      {/* Input Box */}
      <div className="input-glass-box">
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.txt,.md,.py,.js,.java,.cpp,.json,.csv,.html"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        <div className="input-actions-left">
          <button
            type="button"
            className="input-btn"
            onClick={() => imageInputRef.current?.click()}
            title="Unggah Foto / Diagram"
          >
            <ImageIcon size={17} />
          </button>
          <button
            type="button"
            className="input-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Unggah Dokumen PDF / Teks"
          >
            <FileText size={17} />
          </button>
          {/* Web Search Mode Toggle Button */}
          <button
            type="button"
            className={`input-btn websearch-btn ${
              webSearchMode === 'always'
                ? 'websearch-active'
                : webSearchMode === 'auto'
                ? 'websearch-auto'
                : 'websearch-off'
            }`}
            onClick={() => {
              sound.playClick();
              if (onToggleWebSearch) onToggleWebSearch();
            }}
            title={
              webSearchMode === 'always'
                ? 'Pencarian Web: Selalu Aktif (Klik untuk ubah)'
                : webSearchMode === 'auto'
                ? 'Pencarian Web: Otomatis jika perlu fakta (Klik untuk ubah)'
                : 'Pencarian Web: Nonaktif (Klik untuk aktifkan)'
            }
          >
            <Globe size={15} />
            <span className="websearch-tag">
              {webSearchMode === 'always' ? 'ON' : webSearchMode === 'auto' ? 'Auto' : 'OFF'}
            </span>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          wrap="soft"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={(e) => {
            if (e.target.scrollLeft !== 0) {
              e.target.scrollLeft = 0;
            }
          }}
          placeholder={isListening ? 'Mendengarkan suara...' : placeholder}
          className="chat-textarea"
          disabled={disabled}
        />

        <div className="input-actions-right">
          <button
            type="button"
            className={`input-btn voice-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleToggleVoice}
            title={isListening ? 'Hentikan Rekam' : 'Input Suara'}
          >
            {isListening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          {isGenerating ? (
            <button
              type="button"
              className="send-btn btn-stop"
              onClick={onStopGeneration}
              title="Hentikan Respon"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              className={`send-btn ${inputText.trim() || attachedFiles.length > 0 ? 'active' : 'disabled'}`}
              onClick={handleSend}
              disabled={!inputText.trim() && attachedFiles.length === 0}
              title="Kirim (Enter)"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="input-footer-caption">
        <span>Tekan <strong>Enter</strong> untuk kirim, <strong>Shift + Enter</strong> untuk baris baru. Terhubung ke Ollama lokal & Web Global.</span>
      </div>
    </div>
  );
}
