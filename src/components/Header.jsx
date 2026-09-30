import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Plus,
  Settings,
  Volume2,
  VolumeX,
  BookOpen,
  Compass,
  Rocket,
  Network,
  Atom,
  Palette,
  ChevronDown,
  Check,
  Zap,
  Eye,
  FileText,
  Cpu,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { getModelThemeCodename } from '../utils/spaceMissions';
import { THEMES } from '../utils/storage';

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  onOpenTemplates,
  settings,
  onToggleSound,
  onSelectTheme,
  ollamaStatus,
  rocketSwitchNotice,
}) {
  const currentTheme = settings.theme || 'space';
  const rocketInfo = getModelThemeCodename(settings.model, currentTheme);
  const [activeNotice, setActiveNotice] = useState(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef(null);

  const themeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  useEffect(() => {
    if (rocketSwitchNotice) {
      setActiveNotice(rocketSwitchNotice);
      const timer = setTimeout(() => {
        setActiveNotice(null);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [rocketSwitchNotice]);

  // Click outside to close theme dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme-specific icon component
  const ThemeIconComponent = ({ size = 13, className = '' }) => {
    if (currentTheme === 'network') return <Network size={size} className={`text-emerald ${className}`} />;
    if (currentTheme === 'science') return <Atom size={size} className={`text-purple ${className}`} />;
    return <Rocket size={size} className={`text-blue ${className}`} />;
  };

  // Context-aware SVG icon for transition notice
  const NoticeIcon = ({ notice, size = 13, className = '' }) => {
    if (!notice) return <ThemeIconComponent size={size} className={className} />;
    if (notice.reason === 'vision') return <Eye size={size} className={`text-blue ${className}`} />;
    if (notice.reason === 'document') return <FileText size={size} className={`text-amber ${className}`} />;
    if (notice.reason === 'heavy_stem') return <Cpu size={size} className={`text-purple ${className}`} />;
    if (notice.reason === 'casual') return <Zap size={size} className={`text-emerald ${className}`} />;
    return <ThemeIconComponent size={size} className={className} />;
  };

  const activeThemeLabel = currentTheme === 'network' ? 'Simpul Jaringan' : currentTheme === 'science' ? 'Modul Sains' : 'Wahana Antariksa';

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="header-icon-btn sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          title="Buka/Tutup Riwayat Percakapan"
        >
          <Menu size={18} />
        </button>

        {/* Clean Brand Emblem & Title */}
        <div className="brand-wrap" onClick={onNewChat} role="button" tabIndex={0}>
          <div className="brand-logo-icon">
            <img src="/curiosity - Edited.png" alt="Curiosity Logo" className="brand-logo-img" />
          </div>
          <div className="brand-text-block">
            <h1 className="brand-title">Curiosity</h1>
            <span className="brand-subtitle">Asisten Belajar & Sains</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        {/* Connection Status Pill with Dynamic Theme Switching Animation */}
        <div
          className={`connection-pill ${ollamaStatus?.online ? 'conn-active' : 'conn-demo'} ${
            activeNotice ? 'conn-switching-anim' : ''
          }`}
          onClick={onOpenSettings}
          title={
            ollamaStatus?.online
              ? `${activeThemeLabel} Aktif: ${rocketInfo.rocketName} (${settings.model}) • Klik untuk Pengaturan`
              : 'Ollama Offline • Klik untuk Pengaturan'
          }
        >
          <span className={`conn-dot ${activeNotice ? 'conn-dot-pulsing' : ''}`} />
          <span className="conn-label">
            {activeNotice ? (
              <span className="rocket-switch-marquee">
                <NoticeIcon notice={activeNotice} size={13} className="rocket-launch-icon" />
                <span className="rocket-switch-text-span">{activeNotice.text}</span>
              </span>
            ) : ollamaStatus?.online ? (
              <>
                <ThemeIconComponent size={13} style={{ marginRight: 2 }} />
                <span>{rocketInfo.rocketName}</span>
                {settings.autoRouting && (
                  <span className="auto-route-badge" title="Auto Dispatcher Aktif">
                    <Zap size={10} /> Auto
                  </span>
                )}
              </>
            ) : (
              <>
                <span>Mode Simulasi</span>
                <span className="conn-sublabel">• Ollama Offline</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Quick Theme Switcher Pill Dropdown */}
        <div className="theme-switcher-container" ref={themeMenuRef}>
          <button
            type="button"
            className="theme-switcher-btn"
            onClick={() => {
              sound.playClick();
              setShowThemeMenu((prev) => !prev);
            }}
            title="Ganti Tema Tampilan (Antariksa, Networking, Sains)"
          >
            {currentTheme === 'space' && <Rocket size={14} className="text-blue" />}
            {currentTheme === 'network' && <Network size={14} className="text-emerald" />}
            {currentTheme === 'science' && <Atom size={14} className="text-purple" />}
            <span className="theme-btn-label">{themeObj.name}</span>
            <ChevronDown size={12} className={`theme-chevron ${showThemeMenu ? 'open' : ''}`} />
          </button>

          {showThemeMenu && (
            <div className="theme-dropdown-menu">
              <div className="theme-dropdown-header">
                <Palette size={13} />
                <span>Pilih Tema Tampilan</span>
              </div>
              {THEMES.map((th) => {
                const isSelected = currentTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    className={`theme-menu-item ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      sound.playClick();
                      onSelectTheme(th.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    <div className="theme-item-icon">
                      {th.id === 'space' && <Rocket size={15} className="text-blue" />}
                      {th.id === 'network' && <Network size={15} className="text-emerald" />}
                      {th.id === 'science' && <Atom size={15} className="text-purple" />}
                    </div>
                    <div className="theme-item-info">
                      <span className="theme-item-name">{th.fullName}</span>
                      <span className="theme-item-desc">{th.desc}</span>
                    </div>
                    {isSelected && <Check size={14} className="theme-item-check" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <button
          className="btn-new-chat"
          onClick={() => {
            sound.playClick();
            onNewChat();
          }}
          title="Mulai Sesi Baru"
        >
          <Plus size={15} />
          <span className="new-chat-text">Sesi Baru</span>
        </button>

        {/* Templates */}
        <button
          className="header-icon-btn"
          onClick={() => {
            sound.playClick();
            onOpenTemplates();
          }}
          title="Bank Topik & Soal"
        >
          <BookOpen size={17} />
        </button>

        {/* Sound Toggle */}
        <button
          className="header-icon-btn"
          onClick={onToggleSound}
          title={settings.soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
        >
          {settings.soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>

        {/* Settings */}
        <button
          className="header-icon-btn"
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          title="Pengaturan"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
