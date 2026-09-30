import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  Upload,
  Sparkles,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Atom,
  Code2,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

export default function Sidebar({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onExportSessions,
  onImportSessions,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const msgMatch = s.messages.some((m) => m.content && m.content.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  // Sort: Pinned first, then by updatedAt descending
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  // Grouping by date
  const groups = {
    pinned: [],
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  sortedSessions.forEach((s) => {
    if (s.pinned) {
      groups.pinned.push(s);
      return;
    }
    const itemDate = new Date(s.updatedAt || s.createdAt);
    if (itemDate >= startOfToday) {
      groups.today.push(s);
    } else if (itemDate >= startOfYesterday) {
      groups.yesterday.push(s);
    } else if (itemDate >= startOfWeek) {
      groups.thisWeek.push(s);
    } else {
      groups.older.push(s);
    }
  });

  const renderSessionItem = (session) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        className={`session-item ${isActive ? 'active' : ''} ${session.pinned ? 'is-pinned' : ''}`}
        onClick={() => {
          if (!isEditing) {
            sound.playClick();
            onSelectSession(session.id);
            if (window.innerWidth < 768) onClose();
          }
        }}
      >
        <div className="session-item-icon">
          {session.pinned ? (
            <Pin size={15} className="pin-icon active-pin" />
          ) : (
            <MessageSquare size={15} className="chat-icon" />
          )}
        </div>

        {isEditing ? (
          <div className="session-edit-wrap" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="session-edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(session.id, e);
                if (e.key === 'Escape') handleCancelRename(e);
              }}
            />
            <button className="edit-btn-save" onClick={(e) => handleSaveRename(session.id, e)}>
              <Check size={13} />
            </button>
            <button className="edit-btn-cancel" onClick={handleCancelRename}>
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <span className="session-item-title" title={session.title}>
              {session.title}
            </span>

            <div className="session-item-actions">
              <button
                className="session-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePinSession(session.id);
                }}
                title={session.pinned ? 'Lepas Pin' : 'Sematkan ke Atas'}
              >
                <Pin size={13} className={session.pinned ? 'text-cyan' : ''} />
              </button>
              <button
                className="session-action-btn"
                onClick={(e) => handleStartRename(session, e)}
                title="Ganti Judul"
              >
                <Edit2 size={13} />
              </button>
              <button
                className="session-action-btn action-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Hapus percakapan "${session.title}"?`)) {
                    onDeleteSession(session.id);
                  }
                }}
                title="Hapus"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-top">
          {/* New Chat Action */}
          <button
            className="sidebar-new-chat-btn"
            onClick={() => {
              sound.playClick();
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
          >
            <Plus size={18} />
            <span>Eksplorasi Baru</span>
          </button>

          {/* Search Box */}
          <div className="sidebar-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Cari percakapan & materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="sidebar-sessions-list custom-scroll">
          {sortedSessions.length === 0 ? (
            <div className="sidebar-empty">
              <Sparkles size={24} className="text-muted" />
              <p>Belum ada riwayat percakapan</p>
              <span>Mulai tanya materi pelajaranmu sekarang!</span>
            </div>
          ) : (
            <>
              {groups.pinned.length > 0 && (
                <div className="session-group">
                  <div className="session-group-header">
                    <Pin size={12} />
                    <span>Disematkan</span>
                  </div>
                  {groups.pinned.map(renderSessionItem)}
                </div>
              )}

              {groups.today.length > 0 && (
                <div className="session-group">
                  <div className="session-group-header">Hari Ini</div>
                  {groups.today.map(renderSessionItem)}
                </div>
              )}

              {groups.yesterday.length > 0 && (
                <div className="session-group">
                  <div className="session-group-header">Kemarin</div>
                  {groups.yesterday.map(renderSessionItem)}
                </div>
              )}

              {groups.thisWeek.length > 0 && (
                <div className="session-group">
                  <div className="session-group-header">7 Hari Terakhir</div>
                  {groups.thisWeek.map(renderSessionItem)}
                </div>
              )}

              {groups.older.length > 0 && (
                <div className="session-group">
                  <div className="session-group-header">Bulan Ini & Terdahulu</div>
                  {groups.older.map(renderSessionItem)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-footer-btn"
            onClick={onExportSessions}
            title="Cadangkan Riwayat Belajar (Export JSON)"
          >
            <Download size={15} />
            <span>Ekspor Data</span>
          </button>
          <label className="sidebar-footer-btn" title="Pulihkan Riwayat Belajar (Import JSON)">
            <Upload size={15} />
            <span>Impor Data</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={onImportSessions}
            />
          </label>
        </div>
      </aside>
    </>
  );
}
