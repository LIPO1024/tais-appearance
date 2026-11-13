/**
 * Bootstrap template from the Zotero 7 plugin docs[1] and the official
 * Make It Red example[2].
 * [1] https://www.zotero.org/support/dev/zotero_7_for_developers
 * [2] https://github.com/zotero/make-it-red
 */

/* eslint-disable unused-imports/no-unused-vars, no-unused-vars */

function install(data, reason) {}

function registerEarlyTransparencySheet(rootURI) {
  try {
    const baseURI = rootURI.endsWith("/") ? rootURI : rootURI + "/";
    const sheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
      .getService(Components.interfaces.nsIStyleSheetService);
    const sheetType = Components.interfaces.nsIStyleSheetService.AGENT_SHEET;
    for (const file of ["glass.css", "surface-130.css", "tool-surfaces.css"]) {
      const uri = Services.io.newURI(baseURI + "content/" + file);
      if (!sheetService.sheetRegistered(uri, sheetType)) sheetService.loadAndRegisterSheet(uri, sheetType);
    }
  } catch (error) {
    try { console.error("[TAIS_Zotero_Glass] early transparency sheet registration failed", error); } catch {}
  }
}

async function startup({ id, version, resourceURI, rootURI }, reason) {
  // This native Windows edition must not style unsupported platforms.
  if(!Zotero.isWin)return;
  // Register the XUL root alpha BEFORE Zotero constructs the main window.
  // Gecko decides per-pixel window transparency during initial frame creation;
  // a later stylesheet cannot reliably switch an opaque native window to glass.
  registerEarlyTransparencySheet(rootURI);
  await Zotero.initializationPromise;
  /**
   * Global variables for plugin code.
   * The `_globalThis` is the global root variable of the plugin sandbox
   * environment and all child variables assigned to it is globally accessible.
   * See `src/index.ts` for details.
   */
  const baseURI = rootURI.endsWith("/") ? rootURI : rootURI + "/";
  const ctx = {
    rootURI: baseURI,
    Zotero,
    Services,
    Components,
    ChromeUtils,
    Cc: Components.classes,
    Ci: Components.interfaces,
  };
  ctx._globalThis = ctx;

  Services.scriptloader.loadSubScript(baseURI + "content/scripts/taisglass.js", ctx);
  Services.scriptloader.loadSubScript(baseURI + "content/workbench.js", ctx);
  for (const file of ["paper-core.js", "background.js", "builtin-background.js", "reading.js", "focus.js", "studio.js", "settings-core.js", "inspector.js", "localization.js", "settings-ui.js", "dark-policy.js", "tool-surfaces.js", "integration.js", "typography.js"]) {
    Services.scriptloader.loadSubScript(baseURI + "content/" + file, ctx);
  }
  await Zotero.TAISZoteroGlass.hooks.onStartup();
}

async function onMainWindowLoad({ window }, reason) {
  Zotero.TAISZoteroGlass?.hooks.onMainWindowLoad(window);
}

async function onMainWindowUnload({ window }, reason) {
  Zotero.TAISZoteroGlass?.hooks.onMainWindowUnload(window);
}

function shutdown({ id, version, resourceURI, rootURI }, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  Zotero.TAISZoteroGlass?.hooks.onShutdown();
}

function uninstall(data, reason) {}
