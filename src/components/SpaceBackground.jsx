import React, { useEffect, useRef, useState } from 'react';

export default function SpaceBackground({ intensity = 'high', theme = 'space' }) {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 16,
        y: (e.clientY / innerHeight - 0.5) * 16,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 1. SPACE THEME SETUP (Stars & Meteors)
    // ==========================================
    const starCount = intensity === 'low' ? 50 : intensity === 'medium' ? 100 : 150;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      color: ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'][Math.floor(Math.random() * 5)],
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    const shootingStars = [];
    const spawnShootingStar = () => {
      if (intensity === 'low') return;
      if (Math.random() < 0.008 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.35,
          len: Math.random() * 80 + 50,
          speed: Math.random() * 6 + 8,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          opacity: 0.6,
        });
      }
    };

    // ==========================================
    // 2. NETWORK THEME SETUP (Nodes & Packets)
    // ==========================================
    const nodeCount = intensity === 'low' ? 18 : intensity === 'medium' ? 30 : 42;
    const networkNodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.8,
      isServer: Math.random() < 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    const dataPackets = [];
    const spawnDataPacket = () => {
      if (networkNodes.length < 2 || dataPackets.length > 12) return;
      if (Math.random() < 0.05) {
        const fromIdx = Math.floor(Math.random() * networkNodes.length);
        let toIdx = Math.floor(Math.random() * networkNodes.length);
        if (fromIdx === toIdx) return;
        const n1 = networkNodes[fromIdx];
        const n2 = networkNodes[toIdx];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        if (dist < 160) {
          dataPackets.push({
            x: n1.x,
            y: n1.y,
            tx: n2.x,
            ty: n2.y,
            progress: 0,
            speed: 0.018 + Math.random() * 0.012,
          });
        }
      }
    };

    // ==========================================
    // 3. SCIENCE THEME SETUP (Atoms & Molecules)
    // ==========================================
    const atomCount = intensity === 'low' ? 3 : intensity === 'medium' ? 4 : 6;
    const atoms = Array.from({ length: atomCount }, (_, i) => ({
      x: (width / (atomCount + 1)) * (i + 1) + (Math.random() - 0.5) * 60,
      y: (height / 2) + ((i % 2 === 0 ? 1 : -1) * (Math.random() * 120 + 30)),
      nucleusRadius: 4.5 + Math.random() * 2,
      orbitalRadius: 32 + Math.random() * 22,
      angle1: Math.random() * Math.PI * 2,
      angle2: Math.random() * Math.PI * 2,
      speed1: (Math.random() * 0.016 + 0.01) * (Math.random() < 0.5 ? 1 : -1),
      speed2: (Math.random() * 0.016 + 0.01) * (Math.random() < 0.5 ? 1 : -1),
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    const floatingMolecules = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vy: -0.15 - Math.random() * 0.25,
      vx: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 10 + 6,
      type: Math.random() < 0.5 ? 'h2o' : 'covalent',
      opacity: Math.random() * 0.25 + 0.15,
    }));

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // RENDER: THEME 1 - ANTARIKSA (SPACE)
      // ==========================================
      if (theme === 'space') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#090c14');
        grad.addColorStop(0.5, '#0e1322');
        grad.addColorStop(1, '#0a0d18');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Render Stars (Matte subtle whites & silvers)
        for (let s of stars) {
          s.y -= s.speed * 4;
          if (s.y < 0) s.y = height;

          const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(tick * s.twinkleSpeed + s.twinkleOffset));
          ctx.save();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(0.8, currentAlpha));
          ctx.fill();
          ctx.restore();
        }

        // Render Shooting Stars
        spawnShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];
          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.opacity -= 0.012;

          if (ss.opacity <= 0 || ss.x > width || ss.y > height) {
            shootingStars.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = `rgba(180, 195, 215, ${ss.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(
            ss.x - Math.cos(ss.angle) * ss.len,
            ss.y - Math.sin(ss.angle) * ss.len
          );
          ctx.stroke();
          ctx.restore();
        }
      }

      // ==========================================
      // RENDER: THEME 2 - NETWORKING & JARINGAN
      // ==========================================
      else if (theme === 'network') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#080e0c');
        grad.addColorStop(0.5, '#0c1613');
        grad.addColorStop(1, '#09100e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle Graphite Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 1;
        const gridSize = 64;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Update & Draw Network Nodes
        for (let n of networkNodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.pulse += 0.025;
        }

        // Draw Network Edges (Subtle Sage Slate Lines)
        for (let i = 0; i < networkNodes.length; i++) {
          for (let j = i + 1; j < networkNodes.length; j++) {
            const n1 = networkNodes[i];
            const n2 = networkNodes[j];
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist < 140) {
              const alpha = (1 - dist / 140) * 0.22;
              ctx.save();
              ctx.strokeStyle = `rgba(56, 127, 99, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }

        // Spawn & Draw Moving Data Packets (Matte Soft Sage)
        spawnDataPacket();
        for (let i = dataPackets.length - 1; i >= 0; i--) {
          const p = dataPackets[i];
          p.progress += p.speed;
          if (p.progress >= 1) {
            dataPackets.splice(i, 1);
            continue;
          }
          const currX = p.x + (p.tx - p.x) * p.progress;
          const currY = p.y + (p.ty - p.y) * p.progress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(currX, currY, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#6fa68f';
          ctx.fill();
          ctx.restore();
        }

        // Draw Nodes (Matte Forest & Slate)
        for (let n of networkNodes) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = n.isServer ? '#4a7bb0' : '#387f63';
          ctx.fill();

          // Server Node Ring Pulse (Clean Fine Line)
          if (n.isServer) {
            const ringR = n.radius + Math.sin(n.pulse) * 3 + 3;
            ctx.beginPath();
            ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(74, 123, 176, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ==========================================
      // RENDER: THEME 3 - SAINS (FISIKA & KIMIA)
      // ==========================================
      else if (theme === 'science') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0c0a13');
        grad.addColorStop(0.5, '#130f1e');
        grad.addColorStop(1, '#0e0c16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Floating Molecular Bonds (Matte Heather & Slate)
        for (let m of floatingMolecules) {
          m.y += m.vy;
          m.x += m.vx;
          if (m.y < -20) m.y = height + 20;
          if (m.x < 0 || m.x > width) m.vx *= -1;

          ctx.save();
          ctx.globalAlpha = m.opacity;
          ctx.strokeStyle = '#75628c';
          ctx.fillStyle = '#5e4e73';
          ctx.lineWidth = 1.2;

          // Water Molecule (H2O) or Covalent Bond
          if (m.type === 'h2o') {
            // Central Oxygen (Muted Terracotta / Slate)
            ctx.beginPath();
            ctx.arc(m.x, m.y, 3.8, 0, Math.PI * 2);
            ctx.fillStyle = '#a85868';
            ctx.fill();
            // Hydrogen 1
            ctx.beginPath();
            ctx.arc(m.x - m.size, m.y - m.size * 0.6, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#94a3b8';
            ctx.fill();
            // Hydrogen 2
            ctx.beginPath();
            ctx.arc(m.x + m.size, m.y - m.size * 0.6, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#94a3b8';
            ctx.fill();
            // Bonds
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.size, m.y - m.size * 0.6);
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x + m.size, m.y - m.size * 0.6);
            ctx.stroke();
          } else {
            // Covalent Diatomic
            ctx.beginPath();
            ctx.arc(m.x - m.size * 0.7, m.y, 3, 0, Math.PI * 2);
            ctx.arc(m.x + m.size * 0.7, m.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(m.x - m.size * 0.7, m.y);
            ctx.lineTo(m.x + m.size * 0.7, m.y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw Interactive Quantum Bohr Atoms (Matte Amber & Slate)
        for (let atom of atoms) {
          atom.x += atom.vx;
          atom.y += atom.vy;
          if (atom.x < 50 || atom.x > width - 50) atom.vx *= -1;
          if (atom.y < 50 || atom.y > height - 50) atom.vy *= -1;

          atom.angle1 += atom.speed1;
          atom.angle2 += atom.speed2;

          ctx.save();
          // Nucleus (Protons & Neutrons - Warm Muted Bronze)
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, atom.nucleusRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#a16207';
          ctx.fill();

          // Orbital Path 1 (Tilted +35 deg)
          ctx.save();
          ctx.translate(atom.x, atom.y);
          ctx.rotate(Math.PI / 5);
          ctx.beginPath();
          ctx.ellipse(0, 0, atom.orbitalRadius, atom.orbitalRadius * 0.45, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(117, 98, 140, 0.28)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Electron 1 (Muted Slate Titanium)
          const e1X = Math.cos(atom.angle1) * atom.orbitalRadius;
          const e1Y = Math.sin(atom.angle1) * (atom.orbitalRadius * 0.45);
          ctx.beginPath();
          ctx.arc(e1X, e1Y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fill();
          ctx.restore();

          // Orbital Path 2 (Tilted -35 deg)
          ctx.save();
          ctx.translate(atom.x, atom.y);
          ctx.rotate(-Math.PI / 5);
          ctx.beginPath();
          ctx.ellipse(0, 0, atom.orbitalRadius * 1.1, atom.orbitalRadius * 0.48, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Electron 2 (Warm Muted Gold)
          const e2X = Math.cos(atom.angle2) * (atom.orbitalRadius * 1.1);
          const e2Y = Math.sin(atom.angle2) * (atom.orbitalRadius * 0.48);
          ctx.beginPath();
          ctx.arc(e2X, e2Y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#c28b38';
          ctx.fill();
          ctx.restore();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, theme]);

  return (
    <div className="space-background-container" aria-hidden="true">
      {/* 2D Canvas for dynamic starfield / network topology / atomic orbits */}
      <canvas ref={canvasRef} className="space-canvas" />

      {/* Floating Scientific Vector Props (Subtle Technical Monochrome SVG) */}
      <div
        className="floating-props-layer"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        }}
      >
        {/* ========================================================= */}
        {/* PROPS FOR TEMA 1: ANTARIKSA (SPACE)                       */}
        {/* ========================================================= */}
        {theme === 'space' && (
          <>
            {/* 1. Spaceship / Rocket (Top Left) */}
            <div className="prop-item prop-rocket" title="Wahana Antariksa">
              <svg viewBox="0 0 100 100" width="76" height="76" fill="none">
                <g transform="rotate(30 50 50)">
                  <path d="M50 12 C60 26, 68 48, 66 72 L34 72 C32 48, 40 26, 50 12 Z" fill="#141926" stroke="#4a7bb0" strokeWidth="1.5" />
                  <circle cx="50" cy="36" r="7" fill="#1a2234" stroke="#64748b" strokeWidth="1.5" />
                  <circle cx="50" cy="36" r="3.5" fill="#4a7bb0" />
                  <path d="M34 56 L18 72 L35 70 Z" fill="#1a2234" stroke="#4a7bb0" strokeWidth="1.2" />
                  <path d="M66 56 L82 72 L65 70 Z" fill="#1a2234" stroke="#4a7bb0" strokeWidth="1.2" />
                  <path d="M44 72 Q50 84 56 72 Z" fill="#c28b38" fillOpacity="0.6" stroke="#a16207" strokeWidth="1" />
                </g>
              </svg>
            </div>

            {/* 2. Astronomical Telescope (Top Right) */}
            <div className="prop-item prop-telescope" title="Teleskop Astronomi">
              <svg viewBox="0 0 100 100" width="78" height="78" fill="none">
                <g transform="rotate(-25 50 50)">
                  <polygon points="50,15 25,-5 75,-5" fill="#4a7bb0" fillOpacity="0.08" />
                  <rect x="42" y="16" width="16" height="46" rx="3" fill="#141926" stroke="#4a7bb0" strokeWidth="1.5" />
                  <ellipse cx="50" cy="16" rx="10" ry="4" fill="#1a2234" stroke="#64748b" strokeWidth="1.5" />
                  <rect x="45" y="62" width="10" height="12" rx="2" fill="#0d111a" stroke="#475569" strokeWidth="1.2" />
                  <path d="M50 54 L30 92 M50 54 L50 94 M50 54 L70 92" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="50" cy="54" r="4" fill="#4a7bb0" />
                </g>
              </svg>
            </div>

            {/* 3. Magnifying Research Lens (Mid Left) */}
            <div className="prop-item prop-magnifier" title="Lensa Observasi">
              <svg viewBox="0 0 100 100" width="72" height="72" fill="none">
                <g transform="rotate(15 50 50)">
                  <circle cx="42" cy="42" r="28" fill="#141926" fillOpacity="0.6" stroke="#4a7bb0" strokeWidth="2" />
                  <circle cx="42" cy="42" r="18" stroke="#64748b" strokeWidth="1.2" strokeDasharray="4 3" />
                  <line x1="42" y1="18" x2="42" y2="26" stroke="#4a7bb0" strokeWidth="1.5" />
                  <line x1="42" y1="58" x2="42" y2="66" stroke="#4a7bb0" strokeWidth="1.5" />
                  <line x1="18" y1="42" x2="26" y2="42" stroke="#4a7bb0" strokeWidth="1.5" />
                  <line x1="58" y1="42" x2="66" y2="42" stroke="#4a7bb0" strokeWidth="1.5" />
                  <rect x="60" y="60" width="12" height="28" rx="3" transform="rotate(-45 60 60)" fill="#1a2234" stroke="#475569" strokeWidth="1.5" />
                  <circle cx="42" cy="42" r="3" fill="#387f63" />
                </g>
              </svg>
            </div>

            {/* 4. Orbital Research Satellite (Top Center) */}
            <div className="prop-item prop-satellite" title="Satelit Antariksa">
              <svg viewBox="0 0 100 100" width="68" height="68" fill="none">
                <g transform="rotate(25 50 50)">
                  <rect x="40" y="34" width="20" height="32" rx="3" fill="#141926" stroke="#4a7bb0" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="4" fill="#4a7bb0" stroke="#64748b" strokeWidth="1.2" />
                  <rect x="12" y="38" width="26" height="24" rx="2" fill="#1a2234" stroke="#4a7bb0" strokeWidth="1.2" />
                  <line x1="21" y1="38" x2="21" y2="62" stroke="#4a7bb0" strokeWidth="1" />
                  <line x1="30" y1="38" x2="30" y2="62" stroke="#4a7bb0" strokeWidth="1" />
                  <rect x="62" y="38" width="26" height="24" rx="2" fill="#1a2234" stroke="#4a7bb0" strokeWidth="1.2" />
                  <line x1="71" y1="38" x2="71" y2="62" stroke="#4a7bb0" strokeWidth="1" />
                  <line x1="80" y1="38" x2="80" y2="62" stroke="#4a7bb0" strokeWidth="1" />
                </g>
              </svg>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PROPS FOR TEMA 2: NETWORKING & JARINGAN                   */}
        {/* ========================================================= */}
        {theme === 'network' && (
          <>
            {/* 1. Dual-Band Router (Bottom Left) */}
            <div className="prop-item prop-router" title="Router & Gateway">
              <svg viewBox="0 0 100 100" width="76" height="76" fill="none">
                <path d="M34 38 C43 30, 57 30, 66 38" stroke="#387f63" strokeWidth="2" strokeLinecap="round" />
                <path d="M40 46 C46 40, 54 40, 60 46" stroke="#528f75" strokeWidth="2" strokeLinecap="round" />
                <path d="M46 54 C48 51, 52 51, 54 54" stroke="#6fa68f" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="32" y1="68" x2="22" y2="42" stroke="#387f63" strokeWidth="2" strokeLinecap="round" />
                <line x1="68" y1="68" x2="78" y2="42" stroke="#387f63" strokeWidth="2" strokeLinecap="round" />
                <rect x="18" y="66" width="64" height="22" rx="4" fill="#101915" stroke="#387f63" strokeWidth="1.5" />
                <circle cx="28" cy="77" r="2" fill="#6fa68f" />
                <circle cx="36" cy="77" r="2" fill="#4a7bb0" />
                <circle cx="44" cy="77" r="2" fill="#c28b38" />
                <circle cx="52" cy="77" r="2" fill="#387f63" />
              </svg>
            </div>

            {/* 2. Server Stack & Cloud Cluster (Top Right) */}
            <div className="prop-item prop-server" title="Server Rack Jaringan">
              <svg viewBox="0 0 100 100" width="76" height="76" fill="none">
                {/* Server 1 */}
                <rect x="20" y="20" width="60" height="16" rx="3" fill="#101915" stroke="#387f63" strokeWidth="1.5" />
                <circle cx="28" cy="28" r="2" fill="#387f63" />
                <circle cx="36" cy="28" r="2" fill="#4a7bb0" />
                <line x1="48" y1="28" x2="70" y2="28" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
                {/* Server 2 */}
                <rect x="20" y="42" width="60" height="16" rx="3" fill="#101915" stroke="#387f63" strokeWidth="1.5" />
                <circle cx="28" cy="50" r="2" fill="#387f63" />
                <circle cx="36" cy="50" r="2" fill="#c28b38" />
                <line x1="48" y1="50" x2="70" y2="50" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
                {/* Server 3 */}
                <rect x="20" y="64" width="60" height="16" rx="3" fill="#101915" stroke="#387f63" strokeWidth="1.5" />
                <circle cx="28" cy="72" r="2" fill="#387f63" />
                <circle cx="36" cy="72" r="2" fill="#387f63" />
                <line x1="48" y1="72" x2="70" y2="72" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            </div>

            {/* 3. Terminal & Packet Console (Bottom Right) */}
            <div className="prop-item prop-computer" title="Konsol Routing">
              <svg viewBox="0 0 100 100" width="76" height="76" fill="none">
                <rect x="15" y="18" width="70" height="48" rx="4" fill="#101915" stroke="#387f63" strokeWidth="1.5" />
                <rect x="20" y="23" width="60" height="38" rx="2" fill="#0a100d" stroke="#1f3d30" strokeWidth="1" />
                <line x1="26" y1="32" x2="52" y2="32" stroke="#6fa68f" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="26" y1="39" x2="72" y2="39" stroke="#4a7bb0" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="26" y1="46" x2="46" y2="46" stroke="#c28b38" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="26" y1="53" x2="68" y2="53" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M42 66 L36 84 L64 84 L58 66" fill="#101915" stroke="#1f3d30" strokeWidth="1.2" />
                <rect x="22" y="84" width="56" height="5" rx="2" fill="#1f3d30" />
              </svg>
            </div>

            {/* 4. Switch Port & RJ45 Hub (Top Left) */}
            <div className="prop-item prop-switch" title="Switch Hub 8-Port">
              <svg viewBox="0 0 100 100" width="70" height="70" fill="none">
                <g transform="rotate(-15 50 50)">
                  <rect x="16" y="36" width="68" height="28" rx="3" fill="#101915" stroke="#387f63" strokeWidth="1.5" />
                  <rect x="22" y="44" width="10" height="12" rx="1.5" fill="#0a100d" stroke="#387f63" strokeWidth="1" />
                  <rect x="36" y="44" width="10" height="12" rx="1.5" fill="#0a100d" stroke="#387f63" strokeWidth="1" />
                  <rect x="50" y="44" width="10" height="12" rx="1.5" fill="#0a100d" stroke="#4a7bb0" strokeWidth="1" />
                  <rect x="64" y="44" width="10" height="12" rx="1.5" fill="#0a100d" stroke="#387f63" strokeWidth="1" />
                  <circle cx="27" cy="40" r="1.2" fill="#387f63" />
                  <circle cx="41" cy="40" r="1.2" fill="#387f63" />
                  <circle cx="55" cy="40" r="1.2" fill="#4a7bb0" />
                  <circle cx="69" cy="40" r="1.2" fill="#387f63" />
                </g>
              </svg>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PROPS FOR TEMA 3: SAINS (FISIKA & KIMIA)                   */}
        {/* ========================================================= */}
        {theme === 'science' && (
          <>
            {/* 1. Erlenmeyer Chemistry Flask (Bottom Left) */}
            <div className="prop-item prop-flask" title="Tabung Reaksi Kimia">
              <svg viewBox="0 0 100 100" width="76" height="76" fill="none">
                <path d="M42 20 L58 20 M46 20 L46 40 L24 78 C22 82, 26 86, 30 86 L70 86 C74 86, 78 82, 76 78 L54 40 L54 20" stroke="#75628c" strokeWidth="2" fill="#161220" />
                {/* Chemical Liquid - Muted Dusty Rose */}
                <path d="M30 76 L70 76 C72 80, 70 84, 68 84 L32 84 C30 84, 28 80, 30 76 Z" fill="#a85868" fillOpacity="0.5" />
                <circle cx="45" cy="70" r="2" fill="#94a3b8" />
                <circle cx="55" cy="62" r="1.5" fill="#75628c" />
                <circle cx="48" cy="52" r="1.2" fill="#94a3b8" />
                {/* Measurement Markings */}
                <line x1="38" y1="65" x2="44" y2="65" stroke="#75628c" strokeWidth="1.2" />
                <line x1="42" y1="55" x2="48" y2="55" stroke="#75628c" strokeWidth="1.2" />
              </svg>
            </div>

            {/* 2. Quantum Bohr Atom Model (Top Right) */}
            <div className="prop-item prop-atom" title="Orbital Atom & Fisika Kuantum">
              <svg viewBox="0 0 100 100" width="78" height="78" fill="none">
                {/* Central Nucleus */}
                <circle cx="50" cy="50" r="7" fill="#a16207" stroke="#ca8a04" strokeWidth="1.2" />
                <circle cx="48" cy="48" r="2.5" fill="#a85868" />
                <circle cx="53" cy="52" r="2.5" fill="#4a7bb0" />
                {/* Orbit 1 */}
                <ellipse cx="50" cy="50" rx="34" ry="13" stroke="#75628c" strokeWidth="1.5" transform="rotate(30 50 50)" />
                <circle cx="76" cy="65" r="2.5" fill="#94a3b8" />
                {/* Orbit 2 */}
                <ellipse cx="50" cy="50" rx="34" ry="13" stroke="#64748b" strokeWidth="1.5" transform="rotate(-30 50 50)" />
                <circle cx="24" cy="65" r="2.5" fill="#a85868" />
                {/* Orbit 3 */}
                <ellipse cx="50" cy="50" rx="34" ry="13" stroke="#5e4e73" strokeWidth="1.5" transform="rotate(90 50 50)" />
                <circle cx="50" cy="16" r="2.5" fill="#c28b38" />
              </svg>
            </div>

            {/* 3. Laboratory Research Microscope (Top Left) */}
            <div className="prop-item prop-microscope" title="Mikroskop Penelitian">
              <svg viewBox="0 0 100 100" width="76" height="76" fill="none">
                <g transform="rotate(10 50 50)">
                  {/* Eyepiece & Tube */}
                  <rect x="42" y="16" width="16" height="34" rx="2" fill="#161220" stroke="#75628c" strokeWidth="1.5" transform="rotate(-20 50 33)" />
                  <ellipse cx="56" cy="14" rx="8" ry="3" fill="#201a2e" stroke="#9e8db5" strokeWidth="1.2" transform="rotate(-20 56 14)" />
                  {/* Objective Lens */}
                  <rect x="36" y="48" width="8" height="12" rx="1.5" fill="#a85868" stroke="#75628c" strokeWidth="1" />
                  {/* Stage */}
                  <line x1="22" y1="64" x2="56" y2="64" stroke="#75628c" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Arm & Base */}
                  <path d="M52 38 C68 38, 72 68, 64 80 L30 80" stroke="#75628c" strokeWidth="2" fill="none" />
                  <rect x="22" y="80" width="56" height="6" rx="2" fill="#201a2e" stroke="#75628c" strokeWidth="1.2" />
                </g>
              </svg>
            </div>

            {/* 4. Benzene Molecular Ring (Mid Right) */}
            <div className="prop-item prop-benzene" title="Struktur Molekul Kimia">
              <svg viewBox="0 0 100 100" width="72" height="72" fill="none">
                <g transform="rotate(20 50 50)">
                  {/* Hexagon Ring */}
                  <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" stroke="#75628c" strokeWidth="2" fill="#161220" />
                  {/* Inner Aromatic Circle */}
                  <circle cx="50" cy="50" r="17" stroke="#a85868" strokeWidth="1.5" strokeDasharray="5 3" />
                  {/* Nodes */}
                  <circle cx="50" cy="18" r="3" fill="#c28b38" />
                  <circle cx="78" cy="34" r="3" fill="#94a3b8" />
                  <circle cx="78" cy="66" r="3" fill="#c28b38" />
                  <circle cx="50" cy="82" r="3" fill="#94a3b8" />
                  <circle cx="22" cy="66" r="3" fill="#c28b38" />
                  <circle cx="22" cy="34" r="3" fill="#94a3b8" />
                </g>
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
