// blob.js - uBlock runner that fetches & injects a single URL on Ctrl+Shift+~
// Default: runs the Blooket-Cheats gui.min.js URL you specified.
(() => {
  if (window._ublobebm_hotkey_installed) return;
  window._ublobebm_hotkey_installed = true;

  const TARGET_URL = 'https://cdn.jsdelivr.net/gh/Blooket-Council/Blooket-Cheats@refs/heads/main/cheats/gui.min.js';
  const ATTR = 'data-ublobebm-url';

  async function fetchAndInject(url) {
    try {
      if (!url) throw new Error('no url');
      const resp = await fetch(url, { credentials: 'omit' });
      if (!resp.ok) throw new Error('fetch failed: ' + resp.status);
      const code = await resp.text();

      // create script element containing the fetched code (inline)
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.setAttribute(ATTR, url);
      s.textContent = code + '\n//# sourceURL=' + url;

      // append to <head> if present otherwise documentElement
      const container = document.head || document.documentElement;
      container.appendChild(s);

      // mark last run time
      window._ublobebm_last_run = { url, time: Date.now() };
      console.info('uBlobeBM: injected', url);
    } catch (err) {
      console.error('uBlobeBM error:', err);
      try { alert('uBlobeBM: failed to run script: ' + err.message); } catch (_) {}
    }
  }

  // Hotkey handler: Ctrl + Shift + ~ (tilde / backquote key)
  function onKey(e) {
    const isTilde = e.key === '~' || e.code === 'Backquote';
    if (e.ctrlKey && e.shiftKey && isTilde) {
      e.preventDefault();
      // run the target URL
      fetchAndInject(TARGET_URL);
    }
  }

  // Add listener (capture to be early)
  window.addEventListener('keydown', onKey, true);

  // Expose a manual global helper if you want to run from console:
  window.uBlobeBM_run_default = () => fetchAndInject(TARGET_URL);
  window.uBlobeBM_run = (url) => fetchAndInject(url || TARGET_URL);

  console.info('uBlobeBM hotkey ready — press Ctrl+Shift+~ to run the script.');
})();
