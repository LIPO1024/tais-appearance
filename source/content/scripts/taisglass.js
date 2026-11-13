// package.json
var config = {
  addonName: "TAIS Appearance",
  addonID: "tais-zotero-glass@tais.local",
  addonRef: "taisglass",
  addonInstance: "TAISZoteroGlass",
  prefsPrefix: "extensions.taisZoteroGlass"
};

// src/utils/locale.ts
var localeFilesForJS = ["addon.ftl", "preferences.ftl"];
function getLocaleFileFullNames(files) {
  return files.map((file) => `${addon.data.config.addonRef}-${file}`);
}
function initLocale() {
  const l10n = new Localization(
    getLocaleFileFullNames(localeFilesForJS),
    true
  );
  addon.data.locale = {
    current: l10n
  };
}
function getString(...inputs) {
  const { id, options } = normalizeOptions(inputs);
  return _getString(id, options);
}
function normalizeOptions(inputs) {
  if (inputs.length === 1) {
    return { id: inputs[0], options: {} };
  }
  const [id, second] = inputs;
  if (typeof second === "string") {
    return { id, options: { branch: second } };
  }
  return { id, options: second ?? {} };
}
function _getString(id, options) {
  const localeID = `${addon.data.config.addonRef}-${id}`;
  const { branch, args } = options;
  const msgs = addon.data.locale?.current.formatMessagesSync([{ id: localeID, args }]);
  const pattern = msgs?.[0];
  if (!pattern) {
    return localeID;
  }
  if (branch) {
    const attr2 = pattern.attributes?.find((a) => a.name === branch);
    return attr2?.value ?? localeID;
  }
  if (pattern.value) {
    return pattern.value;
  }
  const attr = pattern.attributes?.find((a) => a.name === "label");
  return attr?.value ?? localeID;
}

// src/utils/prefs.ts
var PREFS_PREFIX = config.prefsPrefix;
function getPref(key) {
  return Zotero.Prefs.get(`${PREFS_PREFIX}.${key}`, true);
}
function setPref(key, value) {
  return Zotero.Prefs.set(`${PREFS_PREFIX}.${key}`, value, true);
}

// src/modules/glass-settings.ts
var PREFIX = "extensions.taisZoteroGlass";
var GLASS_NUMBERS = {
  "window-opacity": 10,
  "sidebar-opacity": 12,
  "panel-opacity": 6,
  "toolbar-opacity": 10,
  "card-opacity": 36,
  "popup-opacity": 94,
  "pdf-surround-opacity": 4,
  "ai4paper-opacity": 34,
  "input-opacity": 88,
  "border-opacity": 18,
  "selection-opacity": 30
};
var GLASS_FLAGS = {
  "compat-ai4paper": true,
  "compat-other": true,
  "compat-awesome-gpt": true,
  "compat-ethereal-reference": true,
  "compat-ethereal-style": true,
  "compat-addon-market": true,
  "compat-attanger": true,
  "compat-linter": true,
  "strong-text": true,
  "inactive-acrylic": false
};
function readNumber(key) {
  let value;
  try {
    value = Zotero.Prefs.get(`${PREFIX}.${key}`, true);
  } catch {
    value = void 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, Math.round(parsed))) : GLASS_NUMBERS[key];
}
function readFlag(key) {
  try {
    const value = Zotero.Prefs.get(`${PREFIX}.${key}`, true);
    if (typeof value === "boolean") {
      return value;
    }
  } catch {
  }
  return GLASS_FLAGS[key];
}
function writeSetting(key, value) {
  Zotero.Prefs.set(`${PREFIX}.${key}`, value, true);
}
var VARS = {
  "window-opacity": "--tais-window-alpha",
  "sidebar-opacity": "--tais-sidebar-alpha",
  "panel-opacity": "--tais-panel-alpha",
  "toolbar-opacity": "--tais-toolbar-alpha",
  "card-opacity": "--tais-card-alpha",
  "popup-opacity": "--tais-popup-alpha",
  "pdf-surround-opacity": "--tais-pdf-surround-alpha",
  "ai4paper-opacity": "--tais-ai4paper-alpha",
  "input-opacity": "--tais-input-alpha",
  "border-opacity": "--tais-border-alpha",
  "selection-opacity": "--tais-selection-alpha"
};
function resolveGlassTheme() {
  const request = String(getPref("glass-theme") || "auto");
  if (request === "light" || request === "dark") return request;
  try {
    const win = Zotero.getMainWindow();
    return win?.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch { return "light"; }
}
function applyGlassVars(root) {
  if (!root) return;
  for (const key of Object.keys(GLASS_NUMBERS)) root.style.setProperty(VARS[key], String(readNumber(key)) + "%");
  root.setAttribute("data-tais-contrast", readFlag("strong-text") ? "strong" : "normal");
  root.setAttribute("data-tais-other-adapters", readFlag("compat-other") ? "on" : "off");
  root.setAttribute("data-tais-requested-theme", String(getPref("glass-theme") || "auto"));
  root.setAttribute("data-tais-glass-theme", resolveGlassTheme());
}
function clearGlassVars(root) {
  if (!root) return;
  const style = root.style;
  for (const key of Object.keys(VARS)) style.removeProperty(VARS[key]);
  style.removeProperty("--mica-intensity");
  const attrs = [
    "data-tais-contrast", "data-tais-other-adapters", "data-tais-glass-plugin",
    "data-tais-glass-pdf", "data-tais-glass-theme", "data-tais-requested-theme", "tais-zotero-glass",
    "data-tais-adapter-awesome-gpt", "data-tais-adapter-ethereal-reference",
    "data-tais-adapter-ethereal-style", "data-tais-adapter-addon-market",
    "data-tais-adapter-attanger", "data-tais-adapter-linter",
    "data-tais-plugin-frame", "data-tais-plugin-added-glass"
  ];
  for (const attr of attrs) root.removeAttribute(attr);
}
var AI4PAPER_PREFIX = "chrome://ai4paper/content/";
function isAI4PaperFrame(url) {
  return String(url || "").split(/[?#]/)[0].startsWith(AI4PAPER_PREFIX);
}
function clearAI4PaperSubdocuments(doc, depth = 0) {
  if (!doc || depth > 5) return;
  for (const frame of Array.from(doc.querySelectorAll("iframe, browser"))) {
    try {
      const child = frame.contentDocument;
      if (!child?.documentElement) continue;
      const root = child.documentElement;
      if (root.getAttribute("data-tais-glass-plugin") === "ai4paper") {
        clearGlassVars(root);
      }
      clearAI4PaperSubdocuments(child, depth + 1);
    } catch {}
  }
}
function applyAI4PaperFrame(doc) {
  const root = doc?.documentElement;
  if (!root) return;
  if (!readFlag("compat-ai4paper")) {
    clearGlassVars(root);
    clearAI4PaperSubdocuments(doc);
    return;
  }
  root.setAttribute("tais-zotero-glass", String(getPref("material") || "acrylic"));
  root.setAttribute("data-tais-glass-plugin", "ai4paper");
  applyGlassVars(root);
}
var PLUGIN_ADAPTERS = [
  { key: "awesome-gpt", pref: "compat-awesome-gpt", selectors: [
    "#ai-prompt-editor", "#ai-prompt-toolbar", "#ai-prompt-text",
    ".citation-popover-inner", ".cm-header", ".cm-sidebar", ".cm-content",
    "[data-ai-settings-dialog]"
  ]},
  { key: "ethereal-reference", pref: "compat-ethereal-reference", selectors: [
    "#connected-papers-layout", "#connected-papers-side", ".graph-workspace",
    ".workspace-panel", "#zoteroreference-side-container"
  ]},
  { key: "ethereal-style", pref: "compat-ethereal-style", selectors: [
    ".margin-annotation-card", ".margin-annotation-menu", ".jev-window",
    ".annotation-manager", ".note-manager", "#tab-manager", "#zoterostyle-prompt"
  ]},
  { key: "addon-market", pref: "compat-addon-market", selectors: [
    ".virtualized-table .row.is-recommended", ".virtualized-table .cell.menu-tags", ".addon-market", "#addons-market"
  ]},
  { key: "attanger", pref: "compat-attanger", selectors: [
    "#attanger-unused-pdf-preview", "#unused-pdf-list"
  ]},
  { key: "linter", pref: "compat-linter", selectors: [
    ".linter-shortcut-input", "[data-linter-root]"
  ]}
];
function applyPluginAdapterFrame(doc) {
  const root = doc?.documentElement;
  if (!root) return false;
  let applied = false;
  for (const adapter of PLUGIN_ADAPTERS) {
    let matched = false;
    if (readFlag("compat-other") && readFlag(adapter.pref)) {
      for (const selector of adapter.selectors) {
        try {
          if (doc.querySelector(selector)) { matched = true; break; }
        } catch {}
      }
    }
    const attr = "data-tais-adapter-" + adapter.key;
    if (matched) {
      if (!root.hasAttribute("tais-zotero-glass")) {
        root.setAttribute("tais-zotero-glass", String(getPref("material") || "acrylic"));
        root.setAttribute("data-tais-plugin-added-glass", "yes");
      }
      root.setAttribute("data-tais-plugin-frame", "yes");
      root.setAttribute(attr, "on");
      applied = true;
    } else {
      root.removeAttribute(attr);
    }
  }
  if (applied) {
    applyGlassVars(root);
  } else if (root.getAttribute("data-tais-plugin-frame") === "yes") {
    root.removeAttribute("data-tais-plugin-frame");
    if (root.getAttribute("data-tais-plugin-added-glass") === "yes") {
      root.removeAttribute("data-tais-plugin-added-glass");
      root.removeAttribute("tais-zotero-glass");
      clearGlassVars(root);
    }
  }
  return applied;
}
function isExtensionChromeDocument(url) {
  const value = String(url || "");
  const core = [
    "chrome://zotero/", "chrome://mozapps/", "chrome://global/",
    "chrome://browser/", "chrome://toolkit/", "chrome://devtools/",
    "chrome://communicator/", "resource://zotero/", "resource://gre/"
  ];
  if (value.startsWith("moz-extension://")) return true;
  if (!value.startsWith("chrome://") && !value.startsWith("resource://")) return false;
  return !core.some(prefix => value.startsWith(prefix));
}
var PDF_FRAME_URL = "resource://zotero/reader/pdf/web/viewer.html";
function isPDFFrame(url) {
  return url.split(/[?#]/)[0] === PDF_FRAME_URL;
}
function applyPDFFrame(doc) {
  const root = doc?.documentElement;
  if (!root) return;
  root.setAttribute("data-tais-glass-pdf", "yes");
  applyGlassVars(root);
}

// src/modules/preference.ts
function registerPrefs() {
  Zotero.PreferencePanes.register({
    pluginID: addon.data.config.addonID,
    src: `${rootURI}content/preferences.xhtml`,
    label: "TAIS 外观",
    image: rootURI + "content/icons/tais-32.png",
    stylesheets: [`${rootURI}content/preferences.css`],
    helpURL: addon.data.config.homepage
  });
}
function registerPrefsScripts(window) {
  addon.data.prefs = { window };
}
var PRESETS = {
  balanced: {
    "window-opacity": 14, "sidebar-opacity": 20, "panel-opacity": 14,
    "toolbar-opacity": 12, "card-opacity": 58, "popup-opacity": 94,
    "pdf-surround-opacity": 8, "ai4paper-opacity": 80, "input-opacity": 94,
    "border-opacity": 16, "selection-opacity": 28
  },
  clear: {
    "window-opacity": 7, "sidebar-opacity": 12, "panel-opacity": 9,
    "toolbar-opacity": 7, "card-opacity": 50, "popup-opacity": 90,
    "pdf-surround-opacity": 4, "ai4paper-opacity": 74, "input-opacity": 92,
    "border-opacity": 12, "selection-opacity": 24
  },
  reading: {
    "window-opacity": 20, "sidebar-opacity": 28, "panel-opacity": 18,
    "toolbar-opacity": 15, "card-opacity": 70, "popup-opacity": 97,
    "pdf-surround-opacity": 6, "ai4paper-opacity": 88, "input-opacity": 98,
    "border-opacity": 22, "selection-opacity": 34
  },
  reset: GLASS_NUMBERS
};
function updatePrefsUI(window) { mountGlassWorkbench(window); }

// src/modules/style.ts
var SHEETS = [rootURI + "content/glass.css"];
function sss() {
  return Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
}
function stylesheetUri(url) {
  return Services.io.newURI(url);
}
function registerStyleSheet() {
  for (const url of SHEETS) {
    try {
      const uri = stylesheetUri(url);
      if (!sss().sheetRegistered(uri, Ci.nsIStyleSheetService.AGENT_SHEET)) {
        sss().loadAndRegisterSheet(uri, Ci.nsIStyleSheetService.AGENT_SHEET);
        micalog("TAIS: registered independent agent stylesheet", url);
      } else {
        micalog("TAIS: independent agent stylesheet already registered", url);
      }
    } catch (e) {
      Zotero.debug(`tais-glass: stylesheet registration failed: ${url} ${e}`);
    }
  }
}
function unregisterStyleSheet() {
  for (const url of [...SHEETS].reverse()) {
    try {
      const uri = stylesheetUri(url);
      if (sss().sheetRegistered(uri, Ci.nsIStyleSheetService.AGENT_SHEET)) {
        sss().unregisterSheet(uri, Ci.nsIStyleSheetService.AGENT_SHEET);
      }
    } catch (e) {
      Zotero.debug(`tais-glass: stylesheet removal failed: ${url} ${e}`);
    }
  }
}

// src/hooks.ts
var micaAddonListener = null;
var micaAddonManager = null;
function registerMicaAddonListener() {
  try {
    micaAddonManager = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs").AddonManager;
    if (!micaAddonManager?.addAddonListener) throw new Error("AddonManager.addAddonListener unavailable");
    if (micaAddonListener) return;
    micaAddonListener = {
      onDisabled(otherAddon) {
        if (otherAddon?.id !== "zotero-mica@northword.cn") return;
        micalog("TAIS: Mica disabled; reclaiming DWM material ownership after its shutdown cleanup");
        setTimeout(() => {
          try {
            if (!addon.data.alive || !getPref("enabled")) return;
            addon.mica.applyToAllWindows();
            micalog("TAIS: DWM material reapplied after Mica shutdown");
          } catch (e) {
            micalog("TAIS: failed to reclaim DWM after Mica shutdown", e);
          }
        }, 700);
      },
      onEnabled(otherAddon) {
        if (otherAddon?.id !== "zotero-mica@northword.cn") return;
        micalog("TAIS: Mica re-enabled; two material controllers are active; TAIS will reassert its selected material");
        setTimeout(() => {
          try {
            if (!addon.data.alive || !getPref("enabled")) return;
            micalog("TAIS: another material add-on is active; keep only one enabled for predictable rendering");
          } catch (e) {
            micalog("TAIS: material reassertion after Mica re-enable failed", e);
          }
        }, 1000);
      }
    };
    micaAddonManager.addAddonListener(micaAddonListener);
    micalog("TAIS: native material ownership listener registered; Mica can be disabled without losing TAIS backdrop");
  } catch (e) {
    micalog("TAIS: AddonManager listener unavailable; restart Zotero after disabling Mica", e);
  }
}
function unregisterMicaAddonListener() {
  try {
    if (micaAddonListener && micaAddonManager?.removeAddonListener) {
      micaAddonManager.removeAddonListener(micaAddonListener);
    }
  } catch {}
  micaAddonListener = null;
  micaAddonManager = null;
}
async function onStartup() {
  if (!Zotero.isWin) {
    return;
  }
  registerStyleSheet();
  await Promise.all([Zotero.initializationPromise, Zotero.unlockPromise, Zotero.uiReadyPromise]);
  initLocale();
  registerPrefs();
  if (!getPref("migration-110")) {
    const snapshot={};
    for(const key of [...Object.keys(GLASS_NUMBERS),...Object.keys(GLASS_FLAGS),"glass-theme","material","tint-opacity"]) {try{snapshot[key]=getPref(key);}catch{}}
    setPref("backup-before-110",JSON.stringify(snapshot));
    const baseline={"window-opacity":10,"sidebar-opacity":12,"panel-opacity":6,"toolbar-opacity":10,"card-opacity":36,"popup-opacity":94,"pdf-surround-opacity":4,"ai4paper-opacity":34,"input-opacity":88,"border-opacity":18,"selection-opacity":30};
    for(const [key,value] of Object.entries(baseline)) setPref(key,value);
    setPref("inactive-acrylic",false);setPref("fallback-win10",false);setPref("migration-110",true);
  }
  await addon.mica.enable();
  addon.runtimeReport = glassRuntimeReport;
  addon.workbench = TGWorkbench;
  addon.setTheme = (mode) => { if(!["light","dark","auto"].includes(mode)) throw new Error("Unsupported theme");setPref("glass-theme",mode);addon.mica.reapply(); };
  registerMicaAddonListener();
}
async function onMainWindowLoad(win) {
  if (Zotero.isWin && getPref("enabled")) {
    addon.mica.applyMaterial(win);
  }
}
async function onMainWindowUnload(win) {
  try {
    addon.mica.enabledWindows.delete(win);
    addon.mica.clearInnerDocTimer(win?.document?.documentElement);
    addon.mica.unobservePluginSurfaces(win?.document);
  } catch {}
}
async function onShutdown() {
  for(const win of Services.wm.getEnumerator(null)){try{win.document.getElementById("tg-workbench-style")?.remove();}catch{}}
  addon.data.alive = false;
  unregisterMicaAddonListener();
  try { clearInterval(flushTimer); flush(); } catch {}
  await addon.mica.shutdown();
  delete Zotero[addon.data.config.addonInstance];
}
function onPrefsEvent(type, data) {
  if (type === "load") {
    addon.data.prefs = { window: data.window };
    registerPrefsScripts(data.window);
    updatePrefsUI(data.window);
  }
}
var hooks_default = {
  onStartup,
  onMainWindowLoad,
  onMainWindowUnload,
  onShutdown,
  onPrefsEvent
};

// src/utils/log.ts
var _lines = [];
var _flushing = false;
function flush() {
  if (_flushing || _lines.length === 0) {
    return;
  }
  _flushing = true;
  try {
    const f = Services.dirsvc.get("ProfD", Ci.nsIFile);
    f.append("tais-zotero-glass.log");
    const stream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    stream.init(f, 2 | 8 | 32, 420, 0);
    const text = `${_lines.join("\n")}
`;
    const bytes = stream.write(text, text.length);
    stream.close();
    if (bytes > 0) {
      _lines.length = 0;
    }
  } catch {
  }
  _flushing = false;
}
var flushTimer = setInterval(flush, 5e3);
function micalog(...args) {
  const msg = args.map((a) => typeof a === "string" ? a : String(a)).join(" ");
  _lines.push(msg);
  try {
    Zotero.debug(msg);
  } catch {
  }
  try {
    console.log("[tais-zotero-glass]", msg);
  } catch {
  }
  try {
    const dumpFn = globalThis.dump;
    if (typeof dumpFn === "function") {
      dumpFn(`[tais-zotero-glass] ${msg}
`);
    }
  } catch {
  }
}

// src/modules/dwm.ts
var Backdrop = {
  AUTO: 0,
  MAINWINDOW: 2,
  // Mica
  TRANSIENTWINDOW: 3,
  // Acrylic
  TABBEDWINDOW: 4
  // Mica Alt
};
var DWMWA_SYSTEMBACKDROP_TYPE = 38;
var S_OK = 0;
var WCA_ACCENT_POLICY = 19;
var ACCENT_ENABLE_ACRYLICBLURBEHIND = 4;
var ACCENT_DISABLED = 0;
var _ctypes = null;
var _libs = [];
var _dwmSetBackdrop = null;
var _setAccent = null;
var _clearAccent = null;
var _buildNumber = null;
function ctypes() {
  if (!_ctypes) {
    try {
      _ctypes = globalThis.ctypes;
    } catch {
    }
    if (!_ctypes) {
      _ctypes = ChromeUtils.importESModule("resource://gre/modules/ctypes.sys.mjs").ctypes;
    }
  }
  if (!_ctypes) {
    throw new Error("ctypes unavailable");
  }
  return _ctypes;
}
function ensureDwm() {
  if (_dwmSetBackdrop) {
    return _dwmSetBackdrop;
  }
  try {
    const c = ctypes();
    const dwmapi = c.open("dwmapi.dll");
    _libs.push(dwmapi);
    const fn = dwmapi.declare(
      "DwmSetWindowAttribute",
      c.winapi_abi,
      c.int32_t,
      // HRESULT
      c.voidptr_t,
      // HWND
      c.uint32_t,
      // DWORD dwAttribute
      c.voidptr_t,
      // LPCVOID pvAttribute
      c.uint32_t
      // DWORD cbAttribute
    );
    const UInt32 = c.uint32_t;
    _dwmSetBackdrop = (hwnd, type) => {
      const value = new UInt32(type);
      const hres = Number(fn(hwnd, DWMWA_SYSTEMBACKDROP_TYPE, value.address(), 4));
      return hres === S_OK;
    };
    return _dwmSetBackdrop;
  } catch {
    _dwmSetBackdrop = () => false;
    return _dwmSetBackdrop;
  }
}
function ensureAccent() {
  if (_setAccent && _clearAccent) {
    return { set: _setAccent, clear: _clearAccent };
  }
  try {
    const c = ctypes();
    const user32 = c.open("user32.dll");
    _libs.push(user32);
    const ACCENT_POLICY = new c.StructType("ACCENT_POLICY", [
      { AccentState: c.int32_t },
      { AccentFlags: c.int32_t },
      { GradientColor: c.uint32_t },
      { AnimationId: c.int32_t }
    ]);
    const WINCOMPATTRDATA = new c.StructType("WINCOMPATTRDATA", [
      { Attribute: c.int32_t },
      { pData: c.voidptr_t },
      { dataSize: c.uintptr_t }
    ]);
    const fn = user32.declare(
      "SetWindowCompositionAttribute",
      c.winapi_abi,
      c.int32_t,
      // BOOL
      c.voidptr_t,
      // HWND
      c.voidptr_t
      // WINCOMPATTRDATA*
    );
    const apply = (hwnd, accentState, abgr) => {
      const accent = new ACCENT_POLICY();
      accent.AccentState = accentState;
      accent.AccentFlags = 2;
      accent.GradientColor = abgr >>> 0;
      accent.AnimationId = 0;
      const data = new WINCOMPATTRDATA();
      data.Attribute = WCA_ACCENT_POLICY;
      data.pData = accent.address();
      data.dataSize = ACCENT_POLICY.size;
      return Number(fn(hwnd, data.address())) !== 0;
    };
    _setAccent = (hwnd, abgr) => {
      try {
        return apply(hwnd, ACCENT_ENABLE_ACRYLICBLURBEHIND, abgr);
      } catch {
        return false;
      }
    };
    _clearAccent = (hwnd) => {
      try {
        apply(hwnd, ACCENT_DISABLED, 0);
      } catch {
      }
    };
  } catch {
    _setAccent = () => false;
    _clearAccent = () => {
    };
  }
  return { set: _setAccent, clear: _clearAccent };
}
function getOsBuild() {
  if (_buildNumber != null) {
    return _buildNumber;
  }
  try {
    const c = ctypes();
    const ntdll = c.open("ntdll.dll");
    _libs.push(ntdll);
    const RTL_OSVERSIONINFOW = new c.StructType("RTL_OSVERSIONINFOW", [
      { dwOSVersionInfoSize: c.uint32_t },
      { dwMajorVersion: c.uint32_t },
      { dwMinorVersion: c.uint32_t },
      { dwBuildNumber: c.uint32_t },
      { dwPlatformId: c.uint32_t },
      { szCSDVersion: c.ArrayType(c.char16_t, 128) }
    ]);
    const RtlGetVersion = ntdll.declare(
      "RtlGetVersion",
      c.winapi_abi,
      c.int32_t,
      c.voidptr_t
    );
    const info = new RTL_OSVERSIONINFOW();
    info.dwOSVersionInfoSize = RTL_OSVERSIONINFOW.size;
    RtlGetVersion(info.address());
    _buildNumber = Number(info.dwBuildNumber);
  } catch {
    _buildNumber = 0;
  }
  return _buildNumber;
}
function isWin1122H2OrLater() {
  return getOsBuild() >= 22621;
}
function toCtypesHwnd(handle) {
  const c = ctypes();
  const asUInt = c.UInt64(handle);
  return c.voidptr_t(asUInt);
}
function getHwnd(win) {
  try {
    const baseWindow = win?.docShell?.treeOwner?.QueryInterface(Ci.nsIBaseWindow);
    const h = baseWindow?.nativeHandle;
    return typeof h === "string" && h ? h : null;
  } catch {
    return null;
  }
}
function setBackdrop(hwnd, type) {
  return ensureDwm()(hwnd, type);
}
function clearBackdrop(hwnd) {
  ensureDwm()(hwnd, Backdrop.AUTO);
}
function setAcrylicFallback(hwnd, abgrTint) {
  return ensureAccent().set(hwnd, abgrTint);
}
function clearAcrylicFallback(hwnd) {
  ensureAccent().clear(hwnd);
}
function closeLibraries() {
  for (const lib of _libs) {
    try {
      lib.close();
    } catch {
    }
  }
  _libs = [];
  _ctypes = null;
  _dwmSetBackdrop = null;
  _nativeGlassAPI = null;
  _setAccent = null;
  _clearAccent = null;
  _buildNumber = null;
}

var _nativeGlassAPI = null;
function nativeGlassAPI() {
  if (_nativeGlassAPI) return _nativeGlassAPI;
  const c = ctypes(), lib = c.open("dwmapi.dll");_libs.push(lib);
  const set = lib.declare("DwmSetWindowAttribute",c.winapi_abi,c.int32_t,c.voidptr_t,c.uint32_t,c.voidptr_t,c.uint32_t);
  const get = lib.declare("DwmGetWindowAttribute",c.winapi_abi,c.int32_t,c.voidptr_t,c.uint32_t,c.voidptr_t,c.uint32_t);
  const Margins = new c.StructType("TAIS_MARGINS",[{left:c.int32_t},{right:c.int32_t},{top:c.int32_t},{bottom:c.int32_t}]);
  const extend = lib.declare("DwmExtendFrameIntoClientArea",c.winapi_abi,c.int32_t,c.voidptr_t,c.voidptr_t);
  _nativeGlassAPI={
    set(hwnd,attr,value){const v=new c.int32_t(value);return Number(set(hwnd,attr,v.address(),4));},
    get(hwnd,attr){const v=new c.int32_t(0);const hr=Number(get(hwnd,attr,v.address(),4));return {hr,value:Number(v.value)};},
    extend(hwnd){const m=new Margins(-1,-1,-1,-1);return Number(extend(hwnd,m.address()));}
  };
  return _nativeGlassAPI;
}
function configureNativeGlass(win,hwnd,material,theme) {
  const api=nativeGlassAPI();
  const type=BackdropForMaterial[material] || 3;
  if (!isWin1122H2OrLater()) return {ok:false,reason:"Native DWM system backdrop needs Windows 11 22621+"};
  const frameResult=api.extend(hwnd);
  const darkResult=api.set(hwnd,20,theme === "dark" ? 1 : 0);
  const setResult=api.set(hwnd,38,type);
  const actual=api.get(hwnd,38), dark=api.get(hwnd,20);
  return {ok:setResult===0 && actual.hr===0 && actual.value===type,requested:type,actual:actual.value,theme,dark:dark.value,frameResult,darkResult,setResult};
}
function glassRuntimeReport() {
  const result={version:addon.version||"1.4.2",time:new Date().toISOString(),effectiveTheme:resolveGlassTheme(),lastNative:addon.mica.lastNative,documents:[],styles:[]};
  for (const url of SHEETS) {try {result.styles.push({uri:url,registered:sss().sheetRegistered(stylesheetUri(url),sss().AGENT_SHEET)});}catch(e){result.styles.push({uri:url,error:String(e)});}}
  const seen=new Set();
  function scan(doc,depth=0){
    if (!doc?.documentElement || seen.has(doc) || depth>5 || seen.size>80)return;seen.add(doc);
    const r=doc.documentElement,w=doc.defaultView;
    const record={uri:doc.documentURI,root:r.localName,theme:r.getAttribute("data-tais-glass-theme"),targets:[]};
    for(const selector of [":root","body","#zotero-pane","#zotero-items-pane","#zotero-items-tree","#zotero-collections-pane","#zotero-context-pane","#reader-ui","#sidebarContainer","#annotationsView .annotation","#viewerContainer","#source-text","textarea"]){
      const el=doc.querySelector(selector);if(!el)continue;const st=w.getComputedStyle(el);
      record.targets.push({selector,background:st.backgroundColor,color:st.color,opacity:st.opacity,colorScheme:st.colorScheme,fill:st.getPropertyValue("--fill-primary")});
    }
    result.documents.push(record);
    for(const f of doc.querySelectorAll("iframe,browser")){try{scan(f.contentDocument,depth+1);}catch{}}
  }
  for(const w of Zotero.getMainWindows()){scan(w.document);try{const h=toCtypesHwnd(getHwnd(w));result.nativeReadback=nativeGlassAPI().get(h,38);}catch(e){result.nativeError=String(e);}}
  return result;
}

// src/modules/mica.ts
var BackdropForMaterial = {
  "mica": Backdrop.MAINWINDOW,
  "mica-alt": Backdrop.TABBEDWINDOW,
  "acrylic": Backdrop.TRANSIENTWINDOW
};
var MicaManager = class {
  wwObserver = null;
  prefsObserver = null;
  prefsDebounce = null;
  refreshGlassOnly() {
    for (const win of this.enabledWindows) {
      try {
        const root = win?.document?.documentElement;
        applyGlassVars(root);
        applyPluginAdapterFrame(win?.document);
        this.syncKnownSubdocuments(win?.document ?? null, 0);
      } catch (e) {
        micalog(`tais-zotero-glass: visual refresh skipped ${e}`);
      }
    }
  }
  docObserver = null;
  enabledWindows = /* @__PURE__ */ new Set();
  /* ---------------------------------------------------------------- */
  /* Public API                                                       */
  /* ---------------------------------------------------------------- */
  async enable() {
    try {
      registerStyleSheet();
      this.registerWwObserver();
      this.registerDocObserver();
      this.registerPrefsObserver();
      this.applyToAllWindows();
    } catch (e) {
      micalog(`tais-zotero-glass: enable failed - ${e}`);
    }
  }
  disable() {
    unregisterStyleSheet();
    this.unregisterWwObserver();
    this.unregisterDocObserver();
    this.restoreToAllWindows();
  }
  reapply() {
    if (getPref("enabled")) {
      registerStyleSheet();
      this.registerWwObserver();
      this.registerDocObserver();
      this.applyToAllWindows();
    } else {
      this.disable();
    }
  }
  async shutdown() {
    this.disable();
    this.unregisterPrefsObserver();
    closeLibraries();
  }
  /** True when DWM system backdrop is available (Win11 22H2+). */
  isFullSupport() {
    return isWin1122H2OrLater();
  }
  /* ---------------------------------------------------------------- */
  /* Per-window application                                          */
  /* ---------------------------------------------------------------- */
  isApplyable(win) {
    if (!win || win.closed || !win.document?.documentElement) return false;
    const url = String(win.document.documentURI || "");
    if (Zotero.getMainWindows().includes(win)) return true;
    if (!getPref("apply-dialogs")) return false;
    return url.startsWith("chrome://zotero/content/reader.xhtml")
      || url.startsWith("chrome://zotero/content/preferences/")
      || url.startsWith("chrome://zotero/content/standalone/basicViewer.xhtml")
      || url.startsWith("chrome://ai4paper/content/");
  }

  computeAcrylicTint(win, intensity) {
    const dark = win?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const alpha = Math.round(255 * (intensity * 0.8 + 0.1));
    const rgb = dark ? [30, 30, 30] : [249, 249, 249];
    return (alpha << 24 | rgb[2] << 16 | rgb[1] << 8 | rgb[0]) >>> 0;
  }
  /** Apply the material to a single window (idempotent). */
  applyMaterial(win) {
    const docEl = win?.document?.documentElement;
    if (!this.isApplyable(win) || !docEl) {
      micalog(
        `tais-zotero-glass: skipped ${win?.location?.href ?? "window"} (docEl=${!!docEl} windowtype=${docEl?.getAttribute("windowtype")})`
      );
      return;
    }
    if (!getPref("enabled")) {
      this.restoreMaterial(win);
      return;
    }
    const material = getPref("material");
    const intensity = Math.round(getPref("tint-opacity")) / 100;
    docEl.setAttribute("tais-zotero-glass", material);
    docEl.style.setProperty("--mica-intensity", String(intensity));
    applyGlassVars(docEl);
    applyPluginAdapterFrame(win.document);
    this.observePluginSurfaces(win.document);
    this.enabledWindows.add(win);
    this.applyInnerDocuments(docEl, material, intensity, false);
    this.syncKnownSubdocuments(docEl.ownerDocument, 0);
    let handle = null;
    let hwnd = null;
    try {
      handle = getHwnd(win);
      if (handle) {
        hwnd = toCtypesHwnd(handle);
      }
    } catch (e) {
      micalog(
        `tais-zotero-glass: HWND/ctypes failure for ${win.location?.href ?? "window"} - ${e}`
      );
    }
    if (!handle || !hwnd) {
      micalog(
        `tais-zotero-glass: no HWND for ${win.location?.href ?? "window"}`
      );
      return;
    }
    try {
      this.lastNative = configureNativeGlass(win, hwnd, material, resolveGlassTheme());
      micalog("TAIS 1.3.6 native material", JSON.stringify(this.lastNative));
    } catch (e) {
      this.lastNative = { ok:false, error:String(e) };
      micalog("TAIS 1.3.6 native material failed", e);
    }
  }

  /** Push visual-only settings into nested browser / iframe documents.
   * Never mutate their content, layout, PDF canvases or user annotations. */
  syncKnownSubdocuments(doc, depth) {
    if (!doc || depth > 4) return;
    const frames = Array.from(doc.querySelectorAll("iframe, browser"));
    for (const frame of frames) {
      try {
        const child = frame.contentDocument;
        if (!child?.documentElement) continue;
        const url = child.documentURI || "";
        const parentIsAI4Paper = doc.documentElement?.getAttribute("data-tais-glass-plugin") === "ai4paper";
        if (isAI4PaperFrame(url) || (parentIsAI4Paper && (url === "about:srcdoc" || url === "about:blank"))) {
          applyAI4PaperFrame(child);
          this.observePluginSurfaces(child);
        } else if (isPDFFrame(url)) applyPDFFrame(child);
        else if (url.endsWith("/reader/reader.html")) this.applyReaderDocument(child);
        else if (applyPluginAdapterFrame(child) || isExtensionChromeDocument(url)) this.observePluginSurfaces(child);
        this.syncKnownSubdocuments(child, depth + 1);
      } catch {
      }
    }
  }
  pluginObservers = /* @__PURE__ */ new WeakMap();
  observePluginSurfaces(doc) {
    if (!doc?.documentElement || this.pluginObservers.has(doc)) return;
    const Observer = doc.defaultView?.MutationObserver;
    if (!Observer) return;
    const record = { observer: null, timer: null };
    record.observer = new Observer(() => {
      if (record.timer) return;
      record.timer = setTimeout(() => {
        record.timer = null;
        if (!addon.data.alive || !getPref("enabled")) return;
        try {
          if (isAI4PaperFrame(doc.documentURI) || doc.documentElement?.getAttribute("data-tais-glass-plugin") === "ai4paper") {
            applyAI4PaperFrame(doc);
          } else {
            applyPluginAdapterFrame(doc);
          }
          this.syncKnownSubdocuments(doc, 0);
        } catch {}
      }, 180);
    });
    record.observer.observe(doc.documentElement, { childList: true, subtree: true });
    this.pluginObservers.set(doc, record);
  }
  unobservePluginSurfaces(doc) {
    const record = doc && this.pluginObservers.get(doc);
    if (!record) return;
    try { record.observer.disconnect(); } catch {}
    if (record.timer) clearTimeout(record.timer);
    this.pluginObservers.delete(doc);
  }
  restoreMaterial(win) {
    const clearChildren=(doc,depth=0)=>{if(!doc || depth>5)return;for(const f of doc.querySelectorAll("iframe,browser")){try{const child=f.contentDocument;if(!child?.documentElement)continue;clearChildren(child,depth+1);this.unobservePluginSurfaces(child);if(child.documentElement.hasAttribute("tais-zotero-glass")||child.documentElement.hasAttribute("data-tais-glass-pdf"))clearGlassVars(child.documentElement);}catch{}}};
    try{clearChildren(win?.document);}catch{}
    this.unobservePluginSurfaces(win?.document);
    const docEl = win?.document?.documentElement;
    if (docEl) {
      this.applyInnerDocuments(docEl, null, 0, true);
      docEl.removeAttribute("tais-zotero-glass");
      docEl.style.removeProperty("--mica-intensity");
      clearGlassVars(docEl);
    }
    const handle = getHwnd(win);
    if (handle) {
      try {
        const hwnd = toCtypesHwnd(handle);
        clearBackdrop(hwnd);
        clearAcrylicFallback(hwnd);
      } catch (e) {
        micalog(
          `tais-zotero-glass: restore failed for ${win.location?.href ?? "window"} - ${e}`
        );
      }
    }
    this.enabledWindows.delete(win);
  }
  /**
   * Propagate the attribute to inner documents so viewers that host content
   * pages (e.g. the basicViewer window's <browser> with about:addons) get the
   * material too. The agent sheet already applies to those documents; they
   * just don't carry the `zotero-mica` attribute by themselves.
   *
   * The viewer starts loading its URI synchronously from its own window-load
   * handler, so the content is usually NOT ready when we first look. Instead
   * of a fragile one-shot load listener (which an earlier about:blank load
   * can consume), we poll briefly until the target document appears.
   */
  applyInnerDocuments(docEl, material, intensity, remove) {
    if (remove) {
      this.clearInnerDocTimer(docEl);
      this.paintInnerDocs(docEl, material, intensity, true);
      return;
    }
    if (this.paintInnerDocs(docEl, material, intensity, false)) {
      this.scheduleInnerDocRetry(docEl, material, intensity);
    }
  }
  innerDocTimers = /* @__PURE__ */ new WeakMap();
  lastInnerUrls = /* @__PURE__ */ new WeakMap();
  /**
   * Apply/remove the attribute on inner documents. Returns true when a retry
   * could still help (a frame is still showing about:blank / loading — it will
   * be replaced by the real document later) and nothing has been applied yet.
   */
  paintInnerDocs(docEl, material, intensity, remove) {
    let handled = false;
    let pending = false;
    const frames = Array.from(
      docEl.querySelectorAll("browser, iframe")
    );

    for (const frame of frames) {
      try {
        const contentDoc = frame.contentDocument;
        const innerURL = contentDoc?.location?.href ?? "";
        const innerRoot = contentDoc?.documentElement;
        if (innerURL !== this.lastInnerUrls.get(frame)) {
          this.lastInnerUrls.set(frame, innerURL);
          micalog(
            `tais-zotero-glass: frame ${frame.localName} url=${innerURL || "(none)"} ready=${contentDoc?.readyState ?? "?"}`
          );
        }
        if (innerURL === "about:blank" || contentDoc?.readyState !== "complete") {
          if (!remove) {
            pending = true;
          }
          continue;
        }
        if (this.isReaderFrame(frame, innerURL)) {
          if (this.applyReaderFrame(frame, material, intensity, remove)) {
            pending = true;
          } else {
            handled = true;
          }
          continue;
        }
        if (isPDFFrame(innerURL)) {
          if (remove) clearGlassVars(innerRoot);
          else applyPDFFrame(contentDoc);
          handled = true;
          continue;
        }
        if (isAI4PaperFrame(innerURL)) {
          if (remove) {
            clearGlassVars(innerRoot);
            this.unobservePluginSurfaces(contentDoc);
            clearAI4PaperSubdocuments(contentDoc);
          } else {
            applyAI4PaperFrame(contentDoc);
            this.observePluginSurfaces(contentDoc);
            this.syncKnownSubdocuments(contentDoc, 0);
          }
          handled = true;
          continue;
        }
        if (remove && innerRoot && innerRoot.hasAttribute("tais-zotero-glass")) {
          clearGlassVars(innerRoot);
          this.unobservePluginSurfaces(contentDoc);
          handled = true;
          continue;
        }
        if (applyPluginAdapterFrame(contentDoc)) {
          this.observePluginSurfaces(contentDoc);
          handled = true;
          continue;
        }
        if (isExtensionChromeDocument(innerURL)) {
          this.observePluginSurfaces(contentDoc);
          continue;
        }
        if (!innerRoot || !innerURL.startsWith("chrome://mozapps")) {
          continue;
        }
        if (remove) {
          innerRoot.removeAttribute("tais-zotero-glass");
          innerRoot.style.removeProperty("--mica-intensity");
          micalog(`tais-zotero-glass: cleared inner doc ${innerURL}`);
        } else {
          innerRoot.setAttribute("tais-zotero-glass", material ?? "mica");
          innerRoot.style.setProperty("--mica-intensity", String(intensity));
          this.ensureInnerStyle(innerRoot, intensity);
          micalog(`tais-zotero-glass: applied to inner doc ${innerURL}`);
        }
        handled = true;
      } catch (e) {
        micalog(`tais-zotero-glass: inner frame skipped - ${e}`);
      }
    }
    return !handled && pending;
  }
  /* ---------------------------------------------------------------- */
  /* Reader support (reader.html)                                  */
  /* ---------------------------------------------------------------- */
  /* The reader is served from this resource URL, regardless of whether it
   * is shown in its own window or as a tab in the main window. Match on the
   * path suffix so build variations don't break detection. */
  isReaderFrame(frame, innerURL) {
    return innerURL.endsWith("/reader/reader.html") || innerURL === "resource://zotero/reader/reader.html" || frame?.id === "reader" || frame?.classList?.contains?.("reader");
  }
  /**
   * Apply the material to a reader frame: the reader.html document (reader
   * chrome surfaces). Returns true when a retry could still help (the
   * reader doc is still loading).
   *
   * A single `zotero-mica` attribute on the reader's <html> turns the
   * toolbar / annotation & outline sidebar / split-view background
   * translucent via the agent sheet's `--color-*` overrides (same process,
   * so the agent sheet reaches these documents).
   */
  applyReaderDocument(doc) {
    const root = doc?.documentElement;
    if (!root) return;
    root.setAttribute("tais-zotero-glass", String(getPref("material") || "acrylic"));
    root.style.setProperty("--mica-intensity", String(Math.round(getPref("tint-opacity") || 0) / 100));
    applyGlassVars(root);
    applyPluginAdapterFrame(doc);
    this.observePluginSurfaces(doc);
  }
  applyReaderFrame(frame, material, intensity, remove) {
    let pending = false;
    try {
      const doc = frame.contentDocument;
      const root = doc?.documentElement;
      if (!doc || !root) {
        if (!remove) {
          pending = true;
        }
        return pending;
      }
      if (remove) {
        root.removeAttribute("tais-zotero-glass");
        root.style.removeProperty("--mica-intensity");
        clearGlassVars(root);
      } else {
        root.setAttribute("tais-zotero-glass", material ?? "mica");
        root.style.setProperty("--mica-intensity", String(intensity));
        applyGlassVars(root);
        applyPluginAdapterFrame(doc);
        this.observePluginSurfaces(doc);
        micalog("tais-zotero-glass: applied to reader doc");
      }
    } catch (e) {
      micalog(`tais-zotero-glass: reader frame skipped - ${e}`);
    }
    return pending;
  }
  scheduleInnerDocRetry(docEl, material, intensity, attempt = 0) {
    if (!docEl || !docEl.isConnected || !addon.data.alive || !getPref("enabled") || attempt >= 8 || this.innerDocTimers.has(docEl)) return;
    const timerId = setTimeout(() => {
      this.innerDocTimers.delete(docEl);
      if (!docEl.isConnected || !addon.data.alive || !getPref("enabled")) return;
      if (this.paintInnerDocs(docEl, material, intensity, false)) this.scheduleInnerDocRetry(docEl, material, intensity, attempt + 1);
    }, 300);
    this.innerDocTimers.set(docEl, timerId);
  }

  /**
   * Insert an explicit inline stylesheet into the inner document. Author-origin
   * `!important` rules win over everything except engine-internal UA rules, so
   * this forces the page background translucent even if the global agent sheet
   * does not reach this document.
   */
  ensureInnerStyle(innerRoot, intensity) {
    applyGlassVars(innerRoot);
    try {
      const doc = innerRoot.ownerDocument;
      let style = doc.querySelector("style[data-tais-manager]");
      if (!style) {
        style = doc.createElement("style");style.setAttribute("data-tais-manager", "");
        style.textContent = ':root[tais-zotero-glass]{--in-content-page-background:var(--tg-panel)!important;--background-color-canvas:var(--tg-panel)!important;--in-content-page-color:var(--tg-text)!important;background:transparent!important;color:var(--tg-text)!important} :root[tais-zotero-glass] body{background:var(--tg-panel)!important;color:var(--tg-text)!important}';
        (doc.head || innerRoot).appendChild(style);
      }
    } catch(e) { micalog("TAIS manager stylesheet", e); }
  }

  clearInnerDocTimer(docEl) {
    const timerId = this.innerDocTimers.get(docEl);
    if (timerId !== void 0) {
      clearTimeout(timerId);
      this.innerDocTimers.delete(docEl);
    }
  }
  applyToAllWindows() {
    for (const win of Services.wm.getEnumerator(null)) {
      this.applyMaterial(win);
    }
  }
  restoreToAllWindows() {
    for (const win of this.enabledWindows) {
      this.restoreMaterial(win);
    }
    this.enabledWindows.clear();
  }
  /* ---------------------------------------------------------------- */
  /* Observers                                                        */
  /* ---------------------------------------------------------------- */
  /**
   * Apply the material to a (possibly still-loading) top-level window.
   * `toplevel-window-ready` fires BEFORE the new document has started loading
   * (see nsWindowWatcher), so the window's initial about:blank document must
   * NOT be mistaken for the real one (it can already report readyState
   * "complete"). Only apply immediately when the document is genuinely the
   * loaded chrome document; otherwise wait for the window's `load` event.
   */
  micaWindowWhenReady(win) {
    try {
      const doc = win.document;
      const docURL = doc?.location?.href ?? "";
      const isRealDoc = docURL.startsWith("chrome://") && doc?.readyState === "complete" && doc?.documentElement;
      if (isRealDoc) {
        this.applyMaterial(win);
        return;
      }
      win.addEventListener("load", () => this.applyMaterial(win), {
        once: true
      });
    } catch (e) {
      micalog(`tais-zotero-glass: window-ready apply failed - ${e}`);
    }
  }
  registerWwObserver() {
    if (this.wwObserver) {
      return;
    }
    this.wwObserver = {
      observe: (subject, topic) => {
        if (topic !== "toplevel-window-ready") {
          return;
        }
        const win = subject?.QueryInterface?.(Ci.nsIDOMWindow) || subject;
        if (!win) {
          return;
        }
        const doc = win.document;
        micalog(
          `tais-zotero-glass: window-ready ${win.location?.href ?? ""} docURL=${doc?.location?.href ?? ""} readyState=${doc?.readyState}`
        );
        this.micaWindowWhenReady(win);
      }
    };
    Services.obs.addObserver(this.wwObserver, "toplevel-window-ready");
  }
  unregisterWwObserver() {
    if (!this.wwObserver) {
      return;
    }
    try {
      Services.obs.removeObserver(this.wwObserver, "toplevel-window-ready");
    } catch {
    }
    this.wwObserver = null;
  }
  /* ---------------------------------------------------------------- */
  /* Reader document observer                                        */
  /* ---------------------------------------------------------------- */
  /**
   * React to reader documents as soon as they are created. The reader can
   * run in its own window (reader.xhtml) or as a tab in the main window; in
   * the latter case the `<browser class="reader">` is appended to the main
   * window's tab container AFTER the main window has already been processed,
   * so nothing re-scans it until a preference change. Observing
   * `document-element-inserted` lets us re-apply the material the instant a
   * reader.html document appears, in either mode.
   *
   * The subject is the new Document and `data` is its URL; we locate the
   * embedding chrome window through the browser's docShell and re-run
   * applyMaterial() on it (idempotent) so the whole reader chain — window
   * DWM backdrop and reader surfaces — is applied without waiting for a
   * later preference change.
   */
  registerDocObserver() {
    if (this.docObserver) {
      return;
    }
    this.docObserver = {
      observe: (subject, topic, data) => {
        if (topic !== "document-element-inserted" || !getPref("enabled")) {
          return;
        }
        const url = data || (subject?.documentURI ?? "");
        if (typeof url !== "string") {
          return;
        }
        if (isAI4PaperFrame(url) || isPDFFrame(url)) {
          try {
            const doc = subject;
            if (isPDFFrame(url)) applyPDFFrame(doc);
            else applyAI4PaperFrame(doc);
          } catch (e) {
            micalog(`tais-zotero-glass: known iframe skipped - ${e}`);
          }
          return;
        }
        if (!url.endsWith("reader.html")) {
          if (isExtensionChromeDocument(url)) {
            const doc = subject;
            const scan = () => {
              try {
                applyPluginAdapterFrame(doc);
                addon.mica.observePluginSurfaces(doc);
              } catch {}
            };
            if (doc?.readyState === "complete") scan();
            else doc?.addEventListener?.("DOMContentLoaded", scan, { once: true });
          }
          return;
        }
        try {
          const win = subject?.defaultView;
          const chromeWin = win?.docShell?.chromeEventHandler?.ownerGlobal;
          if (chromeWin) {
            micalog(`tais-zotero-glass: reader doc inserted ${url} -> ${chromeWin.location?.href ?? "?"}`);
            this.applyMaterial(chromeWin);
          }
        } catch (e) {
          micalog(`tais-zotero-glass: reader doc observer failed - ${e}`);
        }
      }
    };
    Services.obs.addObserver(this.docObserver, "document-element-inserted");
  }
  unregisterDocObserver() {
    if (!this.docObserver) {
      return;
    }
    try {
      Services.obs.removeObserver(this.docObserver, "document-element-inserted");
    } catch {
    }
    this.docObserver = null;
  }
  registerPrefsObserver() {
    if (this.prefsObserver) {
      return;
    }
    this.prefsObserver = {
      observe: (_subject, topic, data) => {
        if (topic !== "nsPref:changed") return;
        const key = String(data || "").split(".").pop() || "";
        const visualKeys = new Set([...Object.keys(TG_NUM), ...Object.keys(TG_BOOLS).filter(k => !["enabled", "apply-dialogs"].includes(k)), ...Object.keys(TG_TEXT), "settings-density"]);
        if (this.prefsDebounce) clearTimeout(this.prefsDebounce);
        this.prefsDebounce = setTimeout(() => {
          this.prefsDebounce = null;
          if (visualKeys.has(key) && getPref("enabled")) {
            this.refreshGlassOnly();
          } else {
            this.reapply();
          }
        }, 65);
      }
    };
    Services.prefs.addObserver(
      addon.data.config.prefsPrefix,
      this.prefsObserver
    );
  }
  unregisterPrefsObserver() {
    if (this.prefsDebounce) {
      clearTimeout(this.prefsDebounce);
      this.prefsDebounce = null;
    }
    if (!this.prefsObserver) {
      return;
    }
    try {
      Services.prefs.removeObserver(
        addon.data.config.prefsPrefix,
        this.prefsObserver
      );
    } catch {
    }
    this.prefsObserver = null;
  }
};

// src/addon.ts
var Addon = class {
  data;
  hooks = hooks_default;
  mica = new MicaManager();
  constructor() {
    this.data = {
      alive: true,
      config,
      env: "production",
      prefs: void 0,
      locale: void 0
    };
  }
};
var addon_default = Addon;

// src/index.ts
if (!Zotero[config.addonInstance]) {
  _globalThis.addon = new addon_default();
  Zotero[config.addonInstance] = addon;
}
