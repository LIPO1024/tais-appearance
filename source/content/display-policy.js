/* TAIS display policy. No native imports, document content, preference writes, or timers outside watch(). */
var TGDisplayPolicy = (() => {
  const queries = Object.freeze({
    forcedColors: '(forced-colors: active)',
    reducedTransparency: '(prefers-reduced-transparency: reduce)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    increasedContrast: '(prefers-contrast: more)'
  });
  function decide(input = {}) {
    const platform = input.platform || 'unknown';
    let reason = null;
    if (platform !== 'windows') reason = 'unsupported-platform';
    else if (input.nativeAvailable !== true) reason = 'native-unavailable';
    else if (input.enabled !== true) reason = 'disabled';
    else if (input.safeMode === true) reason = 'safe-mode';
    else if (input.mediaReadable !== true) reason = 'media-unavailable';
    else if (input.forcedColors === true) reason = 'forced-colors';
    else if (input.reducedTransparency === true) reason = 'reduced-transparency';
    return Object.freeze({ platform, nativeMaterial: reason === null,
      fallback: reason ? 'native-opaque' : null, reason,
      // Increased contrast alone is not forced colors; retain the user's palette.
      reducedMotion: input.reducedMotion === true,
      increasedContrast: input.increasedContrast === true });
  }
  function snapshot(win) {
    const result = { dpr: 1, mediaReadable: true };
    try { const n = Number(win.devicePixelRatio); if (Number.isFinite(n) && n > 0) result.dpr = n; } catch {}
    for (const [key, query] of Object.entries(queries)) {
      try {
        const mq = win.matchMedia(query);
        if (!mq || typeof mq.matches !== 'boolean') throw new Error('Invalid MediaQueryList');
        result[key] = mq.matches;
      } catch { result[key] = false; result.mediaReadable = false; }
    }
    return Object.freeze(result);
  }
  function watch(win, notify, options = {}) {
    if (!win || typeof notify !== 'function') throw new TypeError('Window and callback required');
    const delay = Number.isFinite(options.delay) ? Math.max(0, Math.min(500, options.delay)) : 100;
    let state = snapshot(win), disposed = false, timer = null, resolutionOff = () => {};
    const off = [];
    function listen(target, event, fn) {
      if (typeof target?.addEventListener === 'function') {
        target.addEventListener(event, fn);
        return () => target.removeEventListener(event, fn);
      }
      if (event === 'change' && typeof target?.addListener === 'function') {
        target.addListener(fn); return () => target.removeListener(fn);
      }
      return () => {};
    }
    function armResolution() {
      resolutionOff(); resolutionOff = () => {};
      try { resolutionOff = listen(win.matchMedia('(resolution: ' + state.dpr + 'dppx)'), 'change', schedule); } catch {}
    }
    function flush() {
      if (timer !== null) { win.clearTimeout(timer); timer = null; }
      if (disposed) return;
      if (win.closed) { dispose(); return; }
      const next = snapshot(win), previous = state;
      const changed = Object.keys(next).some(key => next[key] !== previous[key]);
      state = next;
      if (next.dpr !== previous.dpr) armResolution();
      if (changed) notify(Object.freeze({ previous, current: next,
        dprChanged: next.dpr !== previous.dpr,
        policyChanged: Object.keys(queries).some(k => next[k] !== previous[k]) || next.mediaReadable !== previous.mediaReadable }));
    }
    function schedule() {
      // Coalesce bursts, but do not postpone forever while the window is dragged.
      if (!disposed && timer === null) timer = win.setTimeout(flush, delay);
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      if (timer !== null) win.clearTimeout(timer);
      timer = null; resolutionOff();
      for (const remove of off.splice(0)) { try { remove(); } catch {} }
    }
    for (const query of Object.values(queries)) {
      try { off.push(listen(win.matchMedia(query), 'change', schedule)); } catch {}
    }
    // resize is only a wake-up hint. A plain resize does not cause native reapplication.
    for (const event of ['resize', 'focus', 'pageshow']) off.push(listen(win, event, schedule));
    off.push(listen(win, 'unload', dispose));
    armResolution();
    return { flush, dispose, snapshot: () => state, isDisposed: () => disposed };
  }
  return Object.freeze({ decide, snapshot, watch, queries });
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TGDisplayPolicy;
