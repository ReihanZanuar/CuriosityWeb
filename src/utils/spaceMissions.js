/**
 * CURIOSITY AI — DYNAMIC MULTI-THEME MODEL CODENAME MAPPER
 * Maps LLM parameter scales to appropriate thematic codenames for:
 * 1. Antariksa (Space Rockets & Missions)
 * 2. Networking (Routers, Switches, Backbone Nodes & Mainframes)
 * 3. Sains (Physicists, Chemists, Quantum Colliders & Reactors)
 */

export const THEME_MODEL_CATALOG = {
  // 1. SPACE MISSIONS & ROCKETS
  space: {
    'gemma4:31b': { name: 'Starship Super Heavy', type: 'Flagship Deep Space', era: 'Generasi Baru', badge: '31.3B' },
    'glm-4.7-flash:latest': { name: 'Artemis SLS', type: 'Lunar Heavy Exploration', era: 'Modern 2024+', badge: '29.9B' },
    'glm-4.7-flash': { name: 'Artemis SLS', type: 'Lunar Heavy Exploration', era: 'Modern 2024+', badge: '29.9B' },
    'deepseek-r1:14b': { name: 'Falcon Heavy R-1', type: 'Deep Reasoning Booster', era: 'Modern Flagship', badge: '14.8B' },
    'qwen2.5:14b': { name: 'James Webb (JWST)', type: 'Deep Space Observatory', era: 'Modern 2022+', badge: '14.8B' },
    'mistral-nemo:latest': { name: 'Atlantis Shuttle', type: 'Orbital Space Laboratory', era: 'Space Shuttle', badge: '12.2B' },
    'mistral-nemo': { name: 'Atlantis Shuttle', type: 'Orbital Space Laboratory', era: 'Space Shuttle', badge: '12.2B' },
    'gemma4:e4b': { name: 'Perseverance Rover', type: 'Mars Vision & Exploration', era: 'Modern Mars', badge: '8.0B Vision' },
    'llama3.1:8b': { name: 'Apollo Saturn V', type: 'Lunar Landing Legend', era: 'Apollo Program', badge: '8.0B' },
    'llama3.1': { name: 'Apollo Saturn V', type: 'Lunar Landing Legend', era: 'Apollo Program', badge: '8.0B' },
    'llama3.2:3b': { name: 'Mercury-Atlas', type: 'Orbital Pioneer', era: 'Early Spaceflight', badge: '3.2B' },
    'llama3.2:1b': { name: 'Vostok 1', type: 'First Human in Orbit', era: 'Pioneer 1961', badge: '1.2B' },
    'deepseek-r1:8b': { name: 'Voyager 1', type: 'Interstellar Probe', era: 'Deep Space', badge: '8.0B' },
    'qwen2.5:7b': { name: 'Mariner 10', type: 'Planetary Exploration', era: 'Solar Mission', badge: '7.6B' },
    'phi3:mini': { name: 'Gemini Titan', type: 'Orbital Maneuver', era: 'Gemini Program', badge: '3.8B' },
  },

  // 2. NETWORKING & INFRASTRUCTURE
  network: {
    'gemma4:31b': { name: 'Supercomputing Mainframe', type: 'Cluster Server Datacenter', era: 'Enterprise High-Load', badge: '31.3B' },
    'glm-4.7-flash:latest': { name: 'Quantum Packet Switch', type: 'Terabit Core Routing', era: 'Ultra High-Speed', badge: '29.9B' },
    'glm-4.7-flash': { name: 'Quantum Packet Switch', type: 'Terabit Core Routing', era: 'Ultra High-Speed', badge: '29.9B' },
    'deepseek-r1:14b': { name: 'Neural Routing Core R-1', type: 'Algorithmic Subnetting Engine', era: 'Deep Layer-3', badge: '14.8B' },
    'qwen2.5:14b': { name: 'Fiber Backbone Tier-1', type: 'Global Interconnect Gateway', era: 'Data Pipeline', badge: '14.8B' },
    'mistral-nemo:latest': { name: 'Core Distribution Node', type: 'Enterprise Distribution Node', era: 'Multi-Protocol', badge: '12.2B' },
    'mistral-nemo': { name: 'Core Distribution Node', type: 'Enterprise Distribution Node', era: 'Multi-Protocol', badge: '12.2B' },
    'gemma4:e4b': { name: 'Optical Vision Switch', type: 'Multimodal Fiber Processor', era: 'Optical Packet', badge: '8.0B Vision' },
    'llama3.1:8b': { name: 'Gigabit Edge Router', type: 'High-Throughput Gateway', era: 'Gigabit LAN/WAN', badge: '8.0B' },
    'llama3.1': { name: 'Gigabit Edge Router', type: 'High-Throughput Gateway', era: 'Gigabit LAN/WAN', badge: '8.0B' },
    'llama3.2:3b': { name: 'Fast Ethernet Bridge', type: 'Local Bridge Switch', era: 'Bridging Subnet', badge: '3.2B' },
    'llama3.2:1b': { name: 'Access Point Lite', type: 'Wireless Edge Gateway', era: 'Edge Node', badge: '1.2B' },
    'deepseek-r1:8b': { name: 'BGP Route Optimizer', type: 'Autonomous System Router', era: 'BGP Protocol', badge: '8.0B' },
    'qwen2.5:7b': { name: 'Layer-3 Switch Engine', type: 'VLAN & Packet Filtering', era: 'Layer-3 Fast', badge: '7.6B' },
    'phi3:mini': { name: 'Micro Gateway Hub', type: 'Compact Embedded Router', era: 'Micro Node', badge: '3.8B' },
  },

  // 3. SCIENCE, PHYSICS & CHEMISTRY
  science: {
    'gemma4:31b': { name: 'Feynman Quantum Engine', type: 'Quantum Field Theory', era: 'Komprehensif', badge: '31.3B' },
    'glm-4.7-flash:latest': { name: 'Hadron Collider (LHC)', type: 'Akselerator Logika & Partikel', era: 'High Energy', badge: '29.9B' },
    'glm-4.7-flash': { name: 'Hadron Collider (LHC)', type: 'Akselerator Logika & Partikel', era: 'High Energy', badge: '29.9B' },
    'deepseek-r1:14b': { name: 'Einstein Relativistic R-1', type: 'Relativitas & Kalkulus Berat', era: 'Fisika Teoretis', badge: '14.8B' },
    'qwen2.5:14b': { name: 'Bohr Quantum Orbital', type: 'Struktur Atom & Komputasi Kimia', era: 'Mekanika Kuantum', badge: '14.8B' },
    'mistral-nemo:latest': { name: 'Mendeleev Reactor', type: 'Tabel Periodik & Termodinamika', era: 'Reaksi Universal', badge: '12.2B' },
    'mistral-nemo': { name: 'Mendeleev Reactor', type: 'Tabel Periodik & Termodinamika', era: 'Reaksi Universal', badge: '12.2B' },
    'gemma4:e4b': { name: 'Curie Spectrometer', type: 'Spektroskopi & Visual Molekuler', era: 'Analisis Spektrum', badge: '8.0B Vision' },
    'llama3.1:8b': { name: 'Newtonian Kinematics', type: 'Hukum Gerak & Gravitasi Klasik', era: 'Mekanika Klasik', badge: '8.0B' },
    'llama3.1': { name: 'Newtonian Kinematics', type: 'Hukum Gerak & Gravitasi Klasik', era: 'Mekanika Klasik', badge: '8.0B' },
    'llama3.2:3b': { name: 'Galileo Gravitasi', type: 'Dinamika Benda Jatuh', era: 'Eksperimen Klasik', badge: '3.2B' },
    'llama3.2:1b': { name: 'Archimedes Flotasi', type: 'Hukum Hidrostatika', era: 'Fluida Dasar', badge: '1.2B' },
    'deepseek-r1:8b': { name: 'Schrödinger Wave Engine', type: 'Persamaan Gelombang Kuantum', era: 'Probabilitas', badge: '8.0B' },
    'qwen2.5:7b': { name: 'Maxwell Electrodynamics', type: 'Persamaan Medan Elektromagnetik', era: 'Elektrodinamika', badge: '7.6B' },
    'phi3:mini': { name: 'Planck Constant Core', type: 'Kuantisasi Energi Foton', era: 'Kuantum Awal', badge: '3.8B' },
  },
};

/**
 * Parses parameter count from model string or details (e.g. "14B", "8b", "29.9B")
 */
export function parseModelParameterSize(modelId = '', rawDetails = {}) {
  if (rawDetails?.parameter_size) {
    const num = parseFloat(rawDetails.parameter_size);
    if (!isNaN(num)) return num;
  }

  const match = modelId.match(/(\d+(?:\.\d+)?)\s*b(?:\b|:|_)/i);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num)) return num;
  }

  return null;
}

/**
 * Returns the theme-adapted codename for any LLM model
 * Theme can be: 'space' | 'network' | 'science'
 */
export function getModelThemeCodename(modelId = '', theme = 'space', rawDetails = {}) {
  const currentTheme = THEME_MODEL_CATALOG[theme] ? theme : 'space';
  const catalog = THEME_MODEL_CATALOG[currentTheme];

  if (!modelId) {
    if (currentTheme === 'network') {
      return { rocketName: 'Core Gateway Node', name: 'Core Gateway Node', displayName: 'Core Gateway Node', badge: 'Local', icon: 'network' };
    }
    if (currentTheme === 'science') {
      return { rocketName: 'Curiosity Laboratorium', name: 'Curiosity Laboratorium', displayName: 'Curiosity Laboratorium', badge: 'Local', icon: 'atom' };
    }
    return { rocketName: 'Curiosity Core', name: 'Curiosity Core', displayName: 'Curiosity Core', badge: 'Local', icon: 'rocket' };
  }

  const cleanId = modelId.trim();
  const baseName = cleanId.split(':')[0];

  // 1. Exact catalog match
  if (catalog[cleanId]) {
    const found = catalog[cleanId];
    return {
      ...found,
      rocketName: found.name,
      displayName: found.name,
      fullName: `${found.name} (${baseName})`,
    };
  }

  if (catalog[baseName]) {
    const found = catalog[baseName];
    return {
      ...found,
      rocketName: found.name,
      displayName: found.name,
      fullName: `${found.name} (${baseName})`,
    };
  }

  // 2. Dynamic classification based on parameter size
  const paramSize = parseModelParameterSize(cleanId, rawDetails);

  if (paramSize !== null) {
    if (currentTheme === 'network') {
      if (paramSize >= 28) {
        return { rocketName: 'Supercomputing Mainframe', name: 'Supercomputing Mainframe', displayName: 'Supercomputing Mainframe', badge: `${paramSize}B`, type: 'Cluster Server', era: 'Enterprise High-Load' };
      }
      if (paramSize >= 20) {
        return { rocketName: 'Quantum Packet Switch', name: 'Quantum Packet Switch', displayName: 'Quantum Packet Switch', badge: `${paramSize}B`, type: 'Terabit Routing', era: 'Ultra High-Speed' };
      }
      if (paramSize >= 13) {
        return { rocketName: 'Neural Routing Core R-1', name: 'Neural Routing Core R-1', displayName: 'Neural Routing Core R-1', badge: `${paramSize}B`, type: 'Subnetting Engine', era: 'Layer-3 Flagship' };
      }
      if (paramSize >= 10) {
        return { rocketName: 'Core Distribution Node', name: 'Core Distribution Node', displayName: 'Core Distribution Node', badge: `${paramSize}B`, type: 'Distribution Switch', era: 'Enterprise' };
      }
      if (paramSize >= 6) {
        return { rocketName: 'Gigabit Edge Router', name: 'Gigabit Edge Router', displayName: 'Gigabit Edge Router', badge: `${paramSize}B`, type: 'Edge Gateway', era: 'Gigabit WAN' };
      }
      return { rocketName: 'Fast Ethernet Bridge', name: 'Fast Ethernet Bridge', displayName: 'Fast Ethernet Bridge', badge: `${paramSize}B`, type: 'Local Bridge', era: 'Subnet Node' };
    }

    if (currentTheme === 'science') {
      if (paramSize >= 28) {
        return { rocketName: 'Feynman Quantum Engine', name: 'Feynman Quantum Engine', displayName: 'Feynman Quantum Engine', badge: `${paramSize}B`, type: 'Kuantum Teoretis', era: 'Komprehensif' };
      }
      if (paramSize >= 20) {
        return { rocketName: 'Hadron Collider (LHC)', name: 'Hadron Collider (LHC)', displayName: 'Hadron Collider (LHC)', badge: `${paramSize}B`, type: 'Akselerator Logika', era: 'Partikel Energi Tinggi' };
      }
      if (paramSize >= 13) {
        return { rocketName: 'Einstein Relativistic R-1', name: 'Einstein Relativistic R-1', displayName: 'Einstein Relativistic R-1', badge: `${paramSize}B`, type: 'Relativitas Khusus & Umum', era: 'Fisika Teoretis' };
      }
      if (paramSize >= 10) {
        return { rocketName: 'Mendeleev Reactor', name: 'Mendeleev Reactor', displayName: 'Mendeleev Reactor', badge: `${paramSize}B`, type: 'Termodinamika Reaksi', era: 'Universal' };
      }
      if (paramSize >= 6) {
        return { rocketName: 'Newtonian Kinematics', name: 'Newtonian Kinematics', displayName: 'Newtonian Kinematics', badge: `${paramSize}B`, type: 'Mekanika & Kalkulus', era: 'Klasik' };
      }
      return { rocketName: 'Galileo Gravitasi', name: 'Galileo Gravitasi', displayName: 'Galileo Gravitasi', badge: `${paramSize}B`, type: 'Dinamika Fluida', era: 'Fisika Eksperimental' };
    }

    // Space Theme fallback
    if (paramSize >= 28) {
      return { rocketName: 'Starship Super Heavy', name: 'Starship Super Heavy', displayName: 'Starship Super Heavy', badge: `${paramSize}B`, type: 'Heavy Planetary Mission', era: 'Next-Gen Heavy' };
    }
    if (paramSize >= 20) {
      return { rocketName: 'Artemis SLS', name: 'Artemis SLS', displayName: 'Artemis SLS', badge: `${paramSize}B`, type: 'Lunar Heavy Exploration', era: 'Modern Lunar Program' };
    }
    if (paramSize >= 13) {
      return { rocketName: 'Falcon Heavy R-1', name: 'Falcon Heavy R-1', displayName: 'Falcon Heavy R-1', badge: `${paramSize}B`, type: 'Deep Space Booster', era: 'Modern Flagship' };
    }
    if (paramSize >= 10) {
      return { rocketName: 'Atlantis Shuttle', name: 'Atlantis Shuttle', displayName: 'Atlantis Shuttle', badge: `${paramSize}B`, type: 'Orbital Space Laboratory', era: 'Shuttle Program' };
    }
    if (paramSize >= 6) {
      return { rocketName: 'Apollo Saturn V', name: 'Apollo Saturn V', displayName: 'Apollo Saturn V', badge: `${paramSize}B`, type: 'Lunar Landing Legend', era: 'Apollo Program' };
    }
    return { rocketName: 'Mercury-Atlas', name: 'Mercury-Atlas', displayName: 'Mercury-Atlas', badge: `${paramSize}B`, type: 'Pioneer Orbit', era: 'Early Spaceflight' };
  }

  // 3. Fallback generic name
  const formatted = baseName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  if (currentTheme === 'network') {
    return { rocketName: `Node ${formatted}`, name: `Node ${formatted}`, displayName: `Node ${formatted}`, badge: 'Ollama', type: 'Custom Routing' };
  }
  if (currentTheme === 'science') {
    return { rocketName: `Lab ${formatted}`, name: `Lab ${formatted}`, displayName: `Lab ${formatted}`, badge: 'Ollama', type: 'Custom Research' };
  }
  return { rocketName: `Explorer ${formatted}`, name: `Explorer ${formatted}`, displayName: `Explorer ${formatted}`, badge: 'Ollama', type: 'Custom Mission' };
}

// Backward-compatibility alias
export const getModelSpaceCodename = (modelId, rawDetails = {}) =>
  getModelThemeCodename(modelId, 'space', rawDetails);
