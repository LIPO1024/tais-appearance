/* TAIS 1.3.2 lifecycle integration: only the selected, visible Reader is composited. */
(function installTAIS132(){
 if(addon.__tgLifecycleIntegrated===true)return;
 addon.__tgLifecycleIntegrated=true;
 Zotero.__TAIS130Integrated='2.4.1';
 addon.version='2.4.1';addon.reading=TGReading;addon.focus=TGFocus;addon.background=TGBackground;
 const sheet=rootURI+'content/surface-130.css';
 if(!SHEETS.includes(sheet))SHEETS.push(sheet);
 // Same stylesheet origin as the generic glass sheet; scoped settings controls override only themselves.
 const settingsSheet=rootURI+'content/preferences.css';if(!SHEETS.includes(settingsSheet))SHEETS.push(settingsSheet);
 const observers=new WeakMap(),mediaListeners=new WeakMap(),frameListeners=new Map();
 const PDF_URL=PDF_FRAME_URL;
 function watchFrame(frame){
  if(frameListeners.has(frame))return;
  const handler=()=>{
   if(!addon.data.alive||!getPref('enabled'))return;
   try{
    // Zotero embeds reader.html in a chrome browser element; Gecko does not guarantee
    // that this content window exposes frameElement. Rescan authoritative top-level
    // Zotero documents instead of trying to climb an unreliable frame chain.
    for(const main of Zotero.getMainWindows()){
     if(main&&!main.closed&&main.document)scan(main.document);
    }
   }catch(e){micalog('TAIS frame-load rescan skipped',String(e));}
  };
  frame.addEventListener('load',handler,true);frameListeners.set(frame,handler);
 }
 function scan(doc,depth=0,readerActive=false,seen=new Set()){
  if(!addon.data.alive)return;
  if(!doc?.documentElement||depth>6||seen.has(doc))return;
  seen.add(doc);
  const url=String(doc.documentURI||'').split(/[?#]/)[0];
  if(url===PDF_URL){
   if(getPref('safe-mode')===true){try{TGReading.detach(doc);}catch{}return;}
   TGDarkPolicy.sync();
   try{TGReading.attach(doc,{active:readerActive});}catch(e){micalog('TAIS reader attach/detach skipped',String(e));}
   return;
  }
  if(getPref('safe-mode')===true){for(const frame of doc.querySelectorAll('browser,iframe'))try{scan(frame.contentDocument,depth+1,false,seen);}catch{}return;}
  for(const frame of doc.querySelectorAll('browser,iframe')){
   watchFrame(frame);
   let next=readerActive;
   if(frame.localName==='browser'&&frame.classList?.contains('reader')){
    const tab=frame.closest('tab-content'),rect=frame.getBoundingClientRect();
    next=!!tab?.classList.contains('deck-selected')&&rect.width>100&&rect.height>100;
   }
   try{scan(frame.contentDocument,depth+1,next,seen);}catch{}
  }
 }
 function scanRelevant(records){
  return records.some(r=>{
   if(r.type==='attributes')return r.target.localName==='tab-content'&&r.attributeName==='class';
   return [...(r.addedNodes||[]),...(r.removedNodes||[])].some(n=>n.nodeType===1&&(n.matches?.('tab-content,browser.reader')||n.querySelector?.('browser.reader')));
  });
 }
 function watchMain(win){
  if(observers.has(win))return;
  const observer=new win.MutationObserver(records=>{if(scanRelevant(records))scan(win.document);});
  observer.observe(win.document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  observers.set(win,observer);
  if(!mediaListeners.has(win)){
   try{const mq=win.matchMedia('(prefers-color-scheme: dark)');const listener=()=>{if(addon.data.alive&&getPref('enabled')&&getPref('glass-theme')==='auto')addon.mica.applyToAllWindows();};mq.addEventListener?.('change',listener);mediaListeners.set(win,{mq,listener});}catch{}
  }
 }
 function unwatchMain(win){
  const o=observers.get(win);if(o){o.disconnect();observers.delete(win);}
  const m=mediaListeners.get(win);if(m){try{m.mq.removeEventListener?.('change',m.listener);}catch{}mediaListeners.delete(win);}
 }
 const oldSync=addon.mica.syncKnownSubdocuments;
 addon.mica.syncKnownSubdocuments=function(doc,depth){
  const result=oldSync.call(this,doc,depth);
  // syncKnownSubdocuments is also called with nested PDF/plugin documents at depth 0
  // by their own mutation observers. Only a registered Zotero chrome window is a
  // valid root for readerActive calculation; scanning a PDF viewer as a root would
  // falsely detach it because readerActive defaults to false.
  if(depth===0&&Zotero.getMainWindows().some(win=>win?.document===doc)){
   scan(doc);if(typeof TGReading!=='undefined')TGReading.refresh();
  }
  return result;
 };
 const oldApply=addon.mica.applyMaterial;
 addon.mica.applyMaterial=function(win){
  if(getPref('safe-mode')===true){try{TGFocus.detach(win);TGTools.refresh();oldApply.call(this,win);this.restoreMaterial(win);}catch{}return false;}
  const result=oldApply.call(this,win);
  try{watchMain(win);TGFocus.attach(win);scan(win.document);}catch(e){micalog('TAIS 2.0.0 focus/reader attach skipped',String(e));}
  return result;
 };
 const oldRefresh=addon.mica.refreshGlassOnly;
 addon.mica.refreshGlassOnly=function(){
  const result=oldRefresh.call(this);
  if(getPref('safe-mode')===true)TGDarkPolicy.dispose();else TGDarkPolicy.sync();
  for(const win of this.enabledWindows)try{watchMain(win);TGFocus.attach(win);scan(win.document);}catch{}
  try{TGReading.refresh();TGTools.refresh();}catch{}
  return result;
 };
 const oldLoad=addon.hooks.onMainWindowLoad;
 addon.hooks.onMainWindowLoad=async function(win){
  const result=await oldLoad.call(this,win);
  try{watchMain(win);TGFocus.attach(win);scan(win.document);}catch{}
  return result;
 };
 const oldUnload=addon.hooks.onMainWindowUnload;
 addon.hooks.onMainWindowUnload=async function(win){
  try{unwatchMain(win);TGFocus.detach(win,false);}catch{}
  return oldUnload.call(this,win);
 };
 const oldStartup=addon.hooks.onStartup;
 addon.hooks.onStartup=async function(){
  const recovered=TGSettings.recoverPending();
  if(!recovered){setPref('safe-mode',true);setPref('enabled',false);micalog('TAIS 2.0.0: pending settings transaction could not be recovered; entered Safe Mode');}
  await TGBackground.load();
  tgMigrate130();
  if(getPref('migration-132')!==true){
   const migrate=(key,oldValue,newValue)=>{if(Number(getPref(key))===oldValue)setPref(key,newValue);};
   migrate('paper-opacity',92,86);
   migrate('input-opacity',64,56);
   migrate('popup-opacity',82,72);
   migrate('ai4paper-opacity',34,50);
   migrate('dialog-opacity',82,72);
   setPref('migration-132',true);
   micalog('TAIS 1.3.3: adjusted glass surface defaults; existing custom values preserved unless equal to prior release defaults');
  }
  if(getPref('migration-133')!==true){
   if(Number(getPref('ai4paper-opacity'))===40)setPref('ai4paper-opacity',50);
   setPref('migration-133',true);
   micalog('TAIS 1.3.3: raised the legacy AI4Paper surface default from 40% to 50%; custom values preserved');
  }
  if(getPref('migration-137')!==true){
   setPref('paper-mode','background-only');
   setPref('migration-137',true);
   micalog('TAIS 2.0.0: retired legacy PDF canvas transparency; page pixels are now strictly untouched');
  }
  if(getPref('migration-1311')!==true){setPref('paper-mode','native-glass');setPref('native-paper-opacity',90);setPref('migration-1311',true);}
  const result=await oldStartup.call(this);
  if(getPref('safe-mode')!==true)TGTools.start();
  for(const win of Zotero.getMainWindows())try{watchMain(win);TGFocus.attach(win);scan(win.document);}catch{}
  try{TGReading.refresh();}catch{}
  micalog('TAIS 2.0.0 ready: selected-reader-only background-only PDF viewport, local background store, native inactive-glass handler and surface styles');
  for(const win of Zotero.getMainWindows())scan(win.document);
  return result;
 };
 const oldShutdown=addon.hooks.onShutdown;
 addon.hooks.onShutdown=async function(){
  try{TGDarkPolicy.dispose();TGTools.dispose();TGSettingsUI.dispose();TGBackground.dispose();}catch{}
  for(const [frame,handler]of frameListeners){try{frame.removeEventListener('load',handler,true);}catch{}}frameListeners.clear();
  addon.__tgLifecycleIntegrated=false;
  if(Zotero.TAISZoteroGlass===addon)delete Zotero.__TAIS130Integrated;
  for(const win of Zotero.getMainWindows())unwatchMain(win);
  try{TGFocus.dispose();TGReading.dispose();}catch{}
  return oldShutdown.call(this);
 };
 const originalApplyToAll=addon.mica.applyToAllWindows;
 addon.mica.applyToAllWindows=function(){
  const result=originalApplyToAll.call(this);
  if(getPref('safe-mode')===true)TGDarkPolicy.dispose();else TGDarkPolicy.sync();
  for(const win of Zotero.getMainWindows()){
   try{watchMain(win);TGFocus.attach(win);scan(win.document);}catch{}
  }
  try{TGReading.refresh();TGTools.refresh();}catch{}
  return result;
 };
})();

