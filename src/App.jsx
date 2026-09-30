import React, { useState, useEffect, useRef, useCallback } from 'react';
import SpaceBackground from './components/SpaceBackground';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputBar from './components/InputBar';
import SettingsModal from './components/SettingsModal';
import PromptTemplatesModal from './components/PromptTemplatesModal';
import ImageLightbox from './components/ImageLightbox';
import {
  loadSessions,
  saveSessions,
  loadSettings,
  saveSettings,
  createNewSession,
  PERSONA_PROMPTS,
} from './utils/storage';
import {
  checkOllamaConnection,
  streamChatWithOllama,
  simulateCuriosityResponse,
} from './services/ollama';
import { sound } from './utils/soundEffects';
import { processFile } from './utils/fileProcessor';
import { dispatchOptimalRocket } from './utils/promptRouter';
import { shouldTriggerWebSearch, performDeepWebSearch } from './services/webSearch';
import { UploadCloud } from 'lucide-react';

export default function App() {
  // Application State
  const [sessions, setSessions] = useState(() => {
    const saved = loadSessions();
    if (saved.length > 0) return saved;
    const initial = createNewSession('Percakapan Baru');
    saveSessions([initial]);
    return [initial];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = loadSessions();
    return saved.length > 0 ? saved[0].id : null;
  });

  const [settings, setSettings] = useState(() => loadSettings());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, latency: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [rocketSwitchNotice, setRocketSwitchNotice] = useState(null);

  const abortControllerRef = useRef(null);

  // Sync settings sound engine state
  useEffect(() => {
    sound.toggleSound(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Periodic Ollama Status Check
  const checkStatus = useCallback(async () => {
    const status = await checkOllamaConnection(settings.endpoint);
    setOllamaStatus(status);
  }, [settings.endpoint]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Active Session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create New Chat Session
  const handleNewChat = () => {
    const newSession = createNewSession(`Percakapan ${sessions.length + 1}`);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete Session
  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const fresh = createNewSession('Percakapan Baru');
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
      return updated;
    });
  };

  // Rename Session
  const handleRenameSession = (id, newTitle) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
    );
  };

  // Toggle Pin Session
  const handleTogglePinSession = (id) => {
    sound.playClick();
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  // Save Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    checkStatus();
  };

  // Clear History
  const handleClearHistory = () => {
    const fresh = createNewSession('Percakapan Baru');
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    saveSessions([fresh]);
  };

  // Export Data
  const handleExportSessions = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `curiosity_chat_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sound.playReceive();
  };

  // Import Data
  const handleImportSessions = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setSessions(imported);
          if (imported.length > 0) setActiveSessionId(imported[0].id);
          sound.playReceive();
          alert('Berhasil mengimpor riwayat percakapan!');
        }
      } catch (err) {
        alert(`Gagal membaca file JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Send Message Flow
  const handleSendMessage = async ({ text, files = [] }) => {
    if (isGenerating) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId || !sessions.some((s) => s.id === targetSessionId)) {
      const fresh = createNewSession();
      setSessions((prev) => [fresh, ...prev]);
      targetSessionId = fresh.id;
      setActiveSessionId(fresh.id);
    }

    // Process files separation (images vs documents)
    const images = files.filter((f) => f.type === 'image');
    const documents = files.filter((f) => f.type === 'pdf' || f.type === 'text');

    // Build context with document content if attached
    let promptWithDocs = text;
    if (documents.length > 0) {
      const docContext = documents
        .map((doc) => `[Lampiran Dokumen: "${doc.name}" (${doc.pages ? doc.pages + ' Halaman' : doc.size})]:\n${doc.text || doc.snippet}`)
        .join('\n\n');
      promptWithDocs = `${docContext}\n\n[Pertanyaan Pengguna]:\n${text}`;
    }

    const userMessage = {
      id: 'msg_' + Date.now() + '_u',
      role: 'user',
      content: text || (images.length > 0 ? 'Tolong analisis gambar/soal ini!' : 'Analisis dokumen'),
      promptForLLM: promptWithDocs,
      images: images,
      documents: documents,
      timestamp: new Date().toISOString(),
    };

    // Auto-update session title if it's the first message
    const currentSession = sessions.find((s) => s.id === targetSessionId);
    let updatedTitle = currentSession?.title;
    if (currentSession && currentSession.messages.length === 0) {
      const rawTitle = text.trim() || (images.length > 0 ? 'Analisis Gambar PR' : 'Analisis Dokumen');
      updatedTitle = rawTitle.slice(0, 36) + (rawTitle.length > 36 ? '...' : '');
    }

    // Auto-dispatch optimal rocket based on prompt weight, domain & attachments
    const routeResult = dispatchOptimalRocket({
      prompt: text,
      files: files,
      installedModels: ollamaStatus.models || [],
      currentModel: settings.model,
      autoRouting: settings.autoRouting !== false,
      theme: settings.theme || 'space',
    });

    const activeModelForThisMessage = routeResult.selectedModel;

    if (routeResult.isAutoRouted && (routeResult.hasSwitched || routeResult.switchReason === 'heavy_stem' || routeResult.switchReason === 'vision')) {
      setRocketSwitchNotice({
        text: routeResult.switchToast,
        reason: routeResult.switchReason,
        rocketName: routeResult.rocket.rocketName,
        timestamp: Date.now(),
      });
      setSettings((prev) => ({ ...prev, model: activeModelForThisMessage }));
    }

    const assistantPlaceholderId = 'msg_' + (Date.now() + 1) + '_a';
    const assistantMessage = {
      id: assistantPlaceholderId,
      role: 'curiosity',
      content: '',
      model: activeModelForThisMessage,
      timestamp: new Date().toISOString(),
    };

    // Append to session messages
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, userMessage, assistantMessage],
          };
        }
        return s;
      })
    );

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    // Check & Perform Deep Web Search for live up-to-date facts
    const needWebSearch = shouldTriggerWebSearch(text, settings.webSearchMode || 'auto');
    let webSources = [];
    let searchContext = '';

    if (needWebSearch) {
      // Mark message as active web searching
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            const updatedMsgs = s.messages.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, isWebSearching: true, searchStatus: 'Menghubungkan satelit & mencari data terkini di web global...' }
                : m
            );
            return { ...s, messages: updatedMsgs };
          }
          return s;
        })
      );

      try {
        const searchResult = await performDeepWebSearch(text, (prog) => {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === targetSessionId) {
                const updatedMsgs = s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? { ...m, isWebSearching: true, searchStatus: prog.message }
                    : m
                );
                return { ...s, messages: updatedMsgs };
              }
              return s;
            })
          );
        });

        webSources = searchResult.sources || [];
        searchContext = searchResult.searchContextText || '';

        // Save sources into message
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              const updatedMsgs = s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, sources: webSources, isWebSearching: false, searchStatus: '' }
                  : m
              );
              return { ...s, messages: updatedMsgs };
            }
            return s;
          })
        );
      } catch (searchErr) {
        console.warn('Web search error:', searchErr);
      }
    }

    // Prepare system prompt based on persona enriched with live web search facts
    let systemPrompt =
      settings.customSystemPrompt ||
      PERSONA_PROMPTS[settings.systemPersona] ||
      PERSONA_PROMPTS.explorer;

    if (searchContext) {
      systemPrompt = `${systemPrompt}\n\n${searchContext}`;
    }

    // Get current conversation messages
    const promptToSend = searchContext
      ? `${promptWithDocs}\n\n[HASIL PENCARIAN WEB FAKTUAL TERKINI]:\n${searchContext}`
      : promptWithDocs;

    const existingMessages = (currentSession ? currentSession.messages : []).map((m) => ({
      role: m.role,
      content: m.promptForLLM || m.content,
      images: m.images,
    }));
    existingMessages.push({
      role: 'user',
      content: promptToSend,
      images: images,
    });

    try {
      // Check if Ollama is connected
      const status = await checkOllamaConnection(settings.endpoint);
      setOllamaStatus(status);

      if (status.online) {
        // Real Ollama Stream
        await streamChatWithOllama({
          endpoint: settings.endpoint,
          model: activeModelForThisMessage,
          messages: existingMessages,
          systemPrompt: systemPrompt,
          temperature: settings.temperature,
          signal: abortControllerRef.current.signal,
          onChunk: ({ text: accumulatedText }) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id === targetSessionId) {
                  const updatedMsgs = s.messages.map((m) =>
                    m.id === assistantPlaceholderId ? { ...m, content: accumulatedText, sources: webSources } : m
                  );
                  return { ...s, messages: updatedMsgs };
                }
                return s;
              })
            );
          },
        });
      } else {
        // Smart Simulated Fallback Response
        await simulateCuriosityResponse({
          prompt: text,
          files: files,
          persona: settings.systemPersona,
          signal: abortControllerRef.current.signal,
          onChunk: ({ text: accumulatedText }) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id === targetSessionId) {
                  const updatedMsgs = s.messages.map((m) =>
                    m.id === assistantPlaceholderId ? { ...m, content: accumulatedText, sources: webSources } : m
                  );
                  return { ...s, messages: updatedMsgs };
                }
                return s;
              })
            );
          },
        });
      }
      sound.playReceive();
    } catch (err) {
      if (err.name === 'AbortError') {
        // User stopped generation manually
      } else {
        console.error('Chat error:', err);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              const updatedMsgs = s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content: `**Kendala Koneksi**:\n\n${err.message}\n\n*Tips:* Pastikan Ollama sudah berjalan dengan \`ollama serve\` atau gunakan pilihan model yang sudah terpasang.`,
                    }
                  : m
              );
              return { ...s, messages: updatedMsgs };
            }
            return s;
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length < 2 || isGenerating) return;
    const msgs = activeSession.messages;
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'curiosity') return;

    // Find the previous user message
    const prevUserMsg = msgs[msgs.length - 2];
    if (prevUserMsg && prevUserMsg.role === 'user') {
      // Remove last assistant message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: s.messages.slice(0, -1),
            };
          }
          return s;
        })
      );
      // Re-trigger sending
      handleSendMessage({
        text: prevUserMsg.content,
        files: [...(prevUserMsg.images || []), ...(prevUserMsg.documents || [])],
      });
    }
  };

  // Drag and Drop files anywhere on the app
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDraggingFile(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      try {
        const processed = await Promise.all(files.map(processFile));
        handleSendMessage({ text: 'Tolong bedah dan jelaskan file yang saya unggah ini:', files: processed });
      } catch (err) {
        alert(`Gagal memproses file yang di-drop: ${err.message}`);
      }
    }
  };

  // Keyboard Shortcuts (Ctrl/Cmd + K for New Chat)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessions]);

  return (
    <div
      className="app-root"
      data-theme={settings.theme || 'space'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Dynamic Interactive Background (Space, Network, Science) */}
      <SpaceBackground
        intensity={settings.backgroundIntensity}
        theme={settings.theme || 'space'}
      />

      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-card">
            <UploadCloud size={38} className="text-blue" style={{ marginBottom: 10 }} />
            <h3>Lepaskan Dokumen atau Gambar di Sini</h3>
            <p>Curiosity akan menganalisis konten file yang dilampirkan</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        settings={settings}
        onSelectTheme={(newTheme) => {
          handleSaveSettings({ ...settings, theme: newTheme });
        }}
        onToggleSound={() => {
          const newState = !settings.soundEnabled;
          handleSaveSettings({ ...settings, soundEnabled: newState });
        }}
        ollamaStatus={ollamaStatus}
        rocketSwitchNotice={rocketSwitchNotice}
      />

      {/* Main Workspace Body */}
      <div className="app-main-layout">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessions={sessions}
          activeSessionId={activeSession?.id}
          onSelectSession={(id) => setActiveSessionId(id)}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onTogglePinSession={handleTogglePinSession}
          onExportSessions={handleExportSessions}
          onImportSessions={handleImportSessions}
        />

        {/* Chat Content Center */}
        <main className="chat-container">
          <ChatArea
            messages={activeSession?.messages || []}
            isGenerating={isGenerating}
            theme={settings.theme || 'space'}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            onImageClick={(img) => setActiveLightboxImg(img)}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
          />

          <InputBar
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isGenerating={isGenerating}
            webSearchMode={settings.webSearchMode || 'auto'}
            onToggleWebSearch={() => {
              const modes = ['auto', 'always', 'off'];
              const currentMode = settings.webSearchMode || 'auto';
              const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
              const nextMode = modes[nextIndex];
              handleSaveSettings({ ...settings, webSearchMode: nextMode });
            }}
          />
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearHistory={handleClearHistory}
      />

      <PromptTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(promptText) => {
          handleSendMessage({ text: promptText, files: [] });
        }}
      />

      <ImageLightbox
        image={activeLightboxImg}
        onClose={() => setActiveLightboxImg(null)}
      />
    </div>
  );
}
