/* Install after integration.js/typography.js. Windows-only policy and lifecycle bridge.
 * Does not rescale fonts, touch PDF canvases, alter monitors, or persist preferences. */
var TGDisplayRuntime = (() => {
  const sheet = rootURI + "content/display-policy.css";
  if (!SHEETS.includes(sheet)) SHEETS.push(sheet);
  const manager = addon.mica, records = new Map();
  const original = { apply: manager.applyMaterial, disable: manager.disable,
    shutdown: addon.hooks.onShutdown, native: configureNativeGlass };
  const attribute = 'data-tg-display-fallback';
  let disposed = false;
  function platform() { return Zotero.isWin ? 'windows' : Zotero.isMac ? 'macos' : Zotero.isLinux ? 'linux' : 'unknown'; }
  function decision(win) {
    const input = { ...TGDisplayPolicy.snapshot(win), platform: platform(),
      enabled: getPref('enabled') === true, safeMode: getPref('safe-mode') === true, nativeAvailable: false };
    // Never probe a Windows API on another OS.
    if (input.platform === 'windows') { try { input.nativeAvailable = manager.isFullSupport() === true; } catch {} }
    return TGDisplayPolicy.decide(input);
  }
  function detachReaders(doc, depth = 0, seen = new Set()) {
    if (!doc || depth > 6 || seen.has(doc)) return;
    seen.add(doc);
    try { TGReading.detach(doc); } catch {}
    for (const frame of doc.querySelectorAll?.('browser,iframe') || []) {
      try { detachReaders(frame.contentDocument, depth + 1, seen); } catch {}
    }
  }
  function clearMark(win, record) {
    const root = win.document?.documentElement;
    if (!root || root.getAttribute(attribute) !== record.mark) return;
    if (record.saved === null) root.removeAttribute(attribute);
    else root.setAttribute(attribute, record.saved);
    record.mark = null;
  }
  function unwatch(win) {
    const record = records.get(win); if (!record) return;
    record.watch.dispose();
    try { win.removeEventListener('unload', record.unload); clearMark(win, record); } catch {}
    records.delete(win);
  }
  function watch(win) {
    if (records.has(win)) return records.get(win);
    const record = { saved: win.document.documentElement.getAttribute(attribute), mark: null,
      policy: decision(win), events: 0, lastError: null, watch: null, unload: null };
    record.watch = TGDisplayPolicy.watch(win, change => {
      if (disposed || win.closed || !addon.data.alive) { unwatch(win); return; }
      if (getPref('enabled') !== true) { unwatch(win); return; }
      const previous = record.policy, next = decision(win);
      record.events++; record.policy = next;
      // A monitor transition may require native backdrop reapplication, but PDF.js
      // remains responsible for page zoom, text selection and canvas resolution.
      if (change.dprChanged || previous.nativeMaterial !== next.nativeMaterial || previous.reason !== next.reason) {
        try { manager.applyMaterial(win); record.lastError = null; }
        catch { record.lastError = 'display-refresh-failed'; }
      }
    });
    record.unload = () => unwatch(win);
    win.addEventListener('unload', record.unload);
    records.set(win, record); return record;
  }
  function apply(win) {
    if (disposed || !win?.document?.documentElement || win.closed) return false;
    if (!manager.isApplyable(win)) return false;
    const policy = decision(win);
    if (policy.platform !== 'windows') return false;
    const record = getPref('enabled') === true ? watch(win) : records.get(win);
    if (record) record.policy = policy;
    if (!policy.nativeMaterial) {
      // Do not call oldApply first: it would briefly enable Acrylic in Safe Mode.
      if (record) { record.mark = policy.reason; win.document.documentElement.setAttribute(attribute, record.mark); }
      try { TGFocus.detach(win); } catch {}
      detachReaders(win.document);
      if (manager.enabledWindows.has(win)) manager.restoreMaterial(win);
      if (getPref('enabled') !== true) unwatch(win);
      return false;
    }
    if (record) clearMark(win, record);
    return original.apply.call(manager, win);
  }
  function nativeGuard(win, hwnd, material, theme) {
    const policy = decision(win);
    if (!policy.nativeMaterial) return { ok: false, reason: policy.reason, requested: material, skipped: true };
    return original.native(win, hwnd, material, theme);
  }
  function stopWatching() { for (const win of [...records.keys()]) unwatch(win); }
  function disable() { stopWatching(); return original.disable.call(manager); }
  async function shutdown() {
    disposed = true; stopWatching();
    // Restore only wrappers still owned by this module.
    if (manager.applyMaterial === apply) manager.applyMaterial = original.apply;
    if (manager.disable === disable) manager.disable = original.disable;
    if (configureNativeGlass === nativeGuard) configureNativeGlass = original.native;
    if (addon.display === api) delete addon.display;
    return original.shutdown.call(this);
  }
  const api = { decision, unwatch, report: () => [...records.values()].map(record => ({
    ...record.watch.snapshot(), policy: record.policy, events: record.events, lastError: record.lastError
  })) };
  manager.applyMaterial = apply; manager.disable = disable;
  configureNativeGlass = nativeGuard; addon.hooks.onShutdown = shutdown; addon.display = api;
  return api;
})();
