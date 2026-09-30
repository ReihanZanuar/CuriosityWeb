const SESSIONS_KEY = 'curiosity_chat_sessions_v2';
const SETTINGS_KEY = 'curiosity_app_settings_v2';

export const ENDPOINT_PRESETS = [
  {
    id: 'server',
    name: 'Server LLM (10.99.98.47)',
    endpoint: '/ollama',
    rawHost: 'http://10.99.98.47:11434',
    badge: '10.99.98.47:11434',
    desc: 'Terhubung ke server Ollama 10.99.98.47:11434',
  },
  {
    id: 'localhost',
    name: 'Localhost (Deploy / Standalone)',
    endpoint: 'http://localhost:11434',
    rawHost: 'http://localhost:11434',
    badge: 'localhost:11434',
    desc: 'Server lokal di mesin yang sama',
  },
];

export const THEMES = [
  {
    id: 'space',
    name: 'Antariksa',
    fullName: 'Antariksa & Astronomi',
    desc: 'Konstelasi bintang, wahana antariksa, dan kosmos galaksi',
    modelsPreview: 'Apollo Saturn V • James Webb • Falcon Heavy • Starship',
    icon: 'Rocket',
    color: '#4a7bb0',
  },
  {
    id: 'network',
    name: 'Networking',
    fullName: 'Jaringan & Infrastruktur',
    desc: 'Topologi simpul data, paket sinyal, dan switch router',
    modelsPreview: 'Gigabit Edge Router • Fiber Backbone • Neural Routing • Mainframe',
    icon: 'Network',
    color: '#387f63',
  },
  {
    id: 'science',
    name: 'Sains (Fisika & Kimia)',
    fullName: 'Sains, Fisika & Kimia',
    desc: 'Orbital atom elektron, ikatan molekul, dan reaksi kuantum',
    modelsPreview: 'Newtonian Kinematics • Bohr Orbital • Einstein • Feynman Quantum',
    icon: 'Atom',
    color: '#75628c',
  },
];

export const DEFAULT_SETTINGS = {
  endpoint: '/ollama',
  model: 'llama3.1:8b',
  theme: 'space',
  autoRouting: true,
  webSearchMode: 'auto',
  temperature: 0.7,
  systemPersona: 'explorer',
  customSystemPrompt: '',
  backgroundIntensity: 'high',
  soundEnabled: true,
  streamEnabled: true,
};

export const PERSONA_PROMPTS = {
  explorer: `Kamu adalah Curiosity, asisten kecerdasan buatan berbasis LLM yang berfokus mendampingi siswa dan pembelajar dalam memahami sains, matematika, fisika, kimia, biologi, informatika, dan kurikulum akademik.
Gunakan bahasa Indonesia yang jelas, bernalar, terstruktur, dan mudah dipahami tanpa gaya berlebihan.
Jika terdapat persamaan atau formula matematika dan sains, gunakan format LaTeX yang presisi (seperti $E = mc^2$ atau $$\\int_a^b f(x)dx$$).
Jelaskan konsep langkah demi langkah untuk membangun pemahaman yang kuat.`,

  teacher: `Kamu adalah asisten pengajar akademik terstruktur.
Pecah setiap masalah ke dalam 3 bagian:
1. Konsep dan Teorema Dasar
2. Langkah Pengerjaan Detail
3. Contoh Soal Latihan dan Verifikasi
Gunakan notasi LaTeX untuk seluruh ekspresi matematika.`,

  scientist: `Kamu adalah asisten riset dan komputasi sains.
Jawab dengan ketepatan terminologi ilmiah tinggi, formulasi matematis ketat (LaTeX), metodologi analitis, dan pembuktian logis.`,

  casual: `Kamu adalah teman diskusi belajar.
Gunakan penjelasan yang ringkas, praktis, dan langsung ke inti permasalahan tanpa istilah yang membingungkan.`,
};

export function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (err) {
    console.error('Error loading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function loadSessions() {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading sessions:', err);
    return [];
  }
}

export function saveSessions(sessions) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Error saving sessions:', err);
  }
}

export function createNewSession(title = 'Percakapan Baru') {
  return {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
    subject: 'general',
    messages: [],
  };
}
