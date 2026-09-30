import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Sliders,
  Volume2,
  VolumeX,
  Trash2,
  Compass,
  GraduationCap,
  Microscope,
  BookOpen,
  Palette,
  Rocket,
  Network,
  Atom,
  Check,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { THEMES } from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearHistory,
}) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    sound.playClick();
    onClose();
  };

  const activeTheme = localSettings.theme || 'space';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="modal-title">Pengaturan Asisten</h2>
              <p className="modal-subtitle">Kustomisasi tema visual, persona belajar, dan preferensi antarmuka</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body custom-scroll">
          {/* Section 1: Visual Theme Selector */}
          <div className="settings-section">
            <div className="section-label">
              <Palette size={15} />
              <span>Tema Visual Antarmuka (3 Tema)</span>
            </div>

            <div className="theme-select-grid">
              {THEMES.map((th) => {
                const isSelected = activeTheme === th.id;
                return (
                  <div
                    key={th.id}
                    className={`theme-option-card theme-card-${th.id} ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      sound.playClick();
                      handleChange('theme', th.id);
                    }}
                  >
                    <div className="theme-card-top">
                      <div className="theme-icon-box">
                        {th.id === 'space' && <Rocket size={18} className="text-blue" />}
                        {th.id === 'network' && <Network size={18} className="text-emerald" />}
                        {th.id === 'science' && <Atom size={18} className="text-purple" />}
                      </div>
                      {isSelected && <span className="theme-check-badge"><Check size={12} /> Aktif</span>}
                    </div>
                    <span className="theme-card-title">{th.fullName}</span>
                    <span className="theme-card-desc">{th.desc}</span>
                    {th.modelsPreview && (
                      <div className="theme-card-models-preview">
                        <span className="theme-models-preview-label">Codename LLM:</span>
                        <span className="theme-models-preview-text">{th.modelsPreview}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: AI Persona */}
          <div className="settings-section">
            <div className="section-label">
              <Compass size={15} />
              <span>Persona & Pendekatan Belajar</span>
            </div>

            <div className="persona-grid">
              <div
                className={`persona-card ${localSettings.systemPersona === 'explorer' ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  handleChange('systemPersona', 'explorer');
                }}
              >
                <div className="persona-card-header">
                  <Compass size={15} className="persona-card-icon" />
                  <span className="persona-title">Eksplorasi Sains</span>
                </div>
                <span className="persona-desc">Penjelasan konsep dengan logika mendalam dan analogi nyata.</span>
              </div>

              <div
                className={`persona-card ${localSettings.systemPersona === 'teacher' ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  handleChange('systemPersona', 'teacher');
                }}
              >
                <div className="persona-card-header">
                  <GraduationCap size={15} className="persona-card-icon" />
                  <span className="persona-title">Bimbel Terstruktur</span>
                </div>
                <span className="persona-desc">Metode langkah demi langkah, tips rumus, dan contoh latihan.</span>
              </div>

              <div
                className={`persona-card ${localSettings.systemPersona === 'scientist' ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  handleChange('systemPersona', 'scientist');
                }}
              >
                <div className="persona-card-header">
                  <Microscope size={15} className="persona-card-icon" />
                  <span className="persona-title">Akademik & Riset</span>
                </div>
                <span className="persona-desc">Presisi ilmiah tinggi, rumus LaTeX mendalam, dan data teknis.</span>
              </div>

              <div
                className={`persona-card ${localSettings.systemPersona === 'casual' ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  handleChange('systemPersona', 'casual');
                }}
              >
                <div className="persona-card-header">
                  <BookOpen size={15} className="persona-card-icon" />
                  <span className="persona-title">Ringkas & Lugas</span>
                </div>
                <span className="persona-desc">Penjelasan langsung ke inti persoalan tanpa berbelit-belit.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Parameters & Preferences */}
          <div className="settings-section">
            <div className="section-label">
              <Sliders size={15} />
              <span>Preferensi & Eksplorasi</span>
            </div>

            <div className="input-group">
              <div className="slider-label-row">
                <span className="input-label">Tingkat Eksplorasi (Temperature): {localSettings.temperature}</span>
                <span className="slider-subtext">
                  {localSettings.temperature < 0.4
                    ? 'Deterministik / Presisi'
                    : localSettings.temperature > 0.8
                    ? 'Kreatif / Eksploratif'
                    : 'Seimbang'}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.1"
                className="range-slider"
                value={localSettings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
            </div>

            {/* Sound Toggle */}
            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-title">Efek Suara Antarmuka</span>
                <span className="toggle-sub">Audio umpan balik tombol dan respon interaktif</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${localSettings.soundEnabled ? 'on' : ''}`}
                onClick={() => {
                  const newState = !localSettings.soundEnabled;
                  handleChange('soundEnabled', newState);
                  sound.toggleSound(newState);
                  if (newState) sound.playClick();
                }}
              >
                {localSettings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>
          </div>

          {/* Section 4: History Management */}
          <div className="settings-section">
            <div className="danger-row">
              <div>
                <span className="danger-title">Hapus Riwayat Percakapan</span>
                <p className="danger-desc">Menghapus seluruh riwayat chat yang tersimpan di perangkat ini.</p>
              </div>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  if (window.confirm('Hapus seluruh riwayat percakapan?')) {
                    onClearHistory();
                    onClose();
                  }
                }}
              >
                <Trash2 size={14} style={{ marginRight: 6 }} />
                <span>Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
