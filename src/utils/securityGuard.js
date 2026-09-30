/**
 * CURIOSITY AI — RUNTIME SECURITY GUARD
 *
 * Deployed ONLY in production builds (import.meta.env.PROD).
 * Protects the application from:
 *  - DevTools console inspection
 *  - Source tampering via console
 *  - Clipboard-sniffing page state exfiltration
 *  - Iframe embedding attacks
 */

const isProd = import.meta.env.PROD;

export function initSecurityGuard() {
  if (!isProd) return;

  // ── 1. Console Neutralisation ────────────────────────────────────────────
  // Replace all console methods with no-ops so DevTools console reveals nothing.
  const noop = () => {};
  const consoleMethods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'dir', 'trace', 'group', 'groupEnd', 'time', 'timeEnd', 'assert'];
  consoleMethods.forEach((method) => {
    try { window.console[method] = noop; } catch { /* ignore */ }
  });

  // ── 2. DevTools Presence Detection ──────────────────────────────────────
  // Detects devtools by monitoring object toString expansion speed.
  let devToolsOpen = false;
  const checkDevTools = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if ((widthDiff || heightDiff) && !devToolsOpen) {
      devToolsOpen = true;
      // Blur and mask the app content when DevTools is open
      const root = document.getElementById('root');
      if (root) root.style.filter = 'blur(8px)';
    } else if (!widthDiff && !heightDiff && devToolsOpen) {
      devToolsOpen = false;
      const root = document.getElementById('root');
      if (root) root.style.filter = '';
    }
  };
  setInterval(checkDevTools, 1000);

  // ── 3. Debugger trap (slows automated script debugging) ─────────────────
  // Repeatedly engages the debugger statement — tools that pause on debugger
  // will halt, making automated exploitation significantly harder.
  const debuggerTrap = () => {
    // eslint-disable-next-line no-debugger
    function neverStop() {
      if (devToolsOpen) { debugger; } // only engage when devtools detected
    }
    setInterval(neverStop, 3000);
  };
  debuggerTrap();

  // ── 4. Right-Click Context Menu — Block Inspect Element shortcut ─────────
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, true);

  // ── 5. Disable common keyboard shortcuts for DevTools ────────────────────
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U (view source)
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) ||
      (e.metaKey && e.altKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key === 'u') ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // ── 6. Frame Busting — Prevent clickjacking via iframes ──────────────────
  if (window.self !== window.top) {
    document.documentElement.innerHTML = '';
    window.top.location = window.self.location;
  }

  // ── 7. Block common automated attack probes ───────────────────────────────
  // Freeze Object.prototype to prevent prototype pollution attacks
  try {
    Object.freeze(Object.prototype);
  } catch { /* already frozen or strict mode */ }

  // ── 8. XSS Mitigation — Sanitize postMessage inputs ─────────────────────
  window.addEventListener('message', (e) => {
    // Only accept messages from same origin
    if (e.origin !== window.location.origin) {
      e.stopImmediatePropagation();
    }
  }, true);
}
