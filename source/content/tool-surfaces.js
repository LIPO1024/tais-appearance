/* TAIS Glass tool windows. Privileged UI allowlist; never themes external pages or document content. */
var TGTools = (()=>{
 const windows=new Map(),documents=new Map(),frames=new Map();let started=false,observer=null,booting=false;
 const attr='data-tg-tool-surface';
 function system(doc){try{return doc.nodePrincipal.isSystemPrincipal===true;}catch{return false;}}
 function classify(doc){
  if(!doc?.documentElement)return null;const u=String(doc.documentURI||'').split(/[?#]/)[0];
  if(u==='chrome://mozapps/content/extensions/aboutaddons.html'||u==='about:addons')return 'addons';
  if(u==='about:blank'&&system(doc)&&doc.title==='Addon Preference Manager'&&doc.getElementById('top')&&doc.getElementById('left')&&doc.getElementById('right'))return 'preference-manager';
  if(u.startsWith('chrome://zotero/content/')){
   if(/\/(?:ace|tinymce|note-editor)\//.test(u)||/\/(?:zoteroPane|reader)\.xhtml$/.test(u)||u.includes('/preferences/'))return null;
   if(/\.(?:xhtml|html|xul)$/.test(u)&&system(doc))return 'native-tool';
  }
  // Explicit local plugin chrome windows only. The blank generic document is never blanket-selected.
  if(system(doc)&&/^chrome:\/\/(?:zoterostyle|zoteroattanger|zoteroaddons|tara|ai4paper)\/content\//.test(u)&&doc.defaultView?.top===doc.defaultView)return 'plugin-tool';
  return null;
 }
 function allowed(){return addon.data.alive&&getPref('enabled')===true&&getPref('safe-mode')!==true&&getPref('apply-dialogs')===true;}
 function tag(doc,kind){
  if(!kind)return;if(!documents.has(doc)){const root=doc.documentElement;documents.set(doc,{old:root.getAttribute(attr),oldGlass:root.getAttribute('tais-zotero-glass'),kind});}
  const root=doc.documentElement;if(root.getAttribute(attr)!==kind)root.setAttribute(attr,kind);
  if(root.getAttribute('tais-zotero-glass')!==String(getPref('material')||'acrylic'))root.setAttribute('tais-zotero-glass',String(getPref('material')||'acrylic'));
  applyGlassVars(root);
 }
 function visit(doc,depth=0){
  if(!doc?.documentElement||depth>5)return;const kind=classify(doc);if(kind)tag(doc,kind);
  for(const frame of doc.querySelectorAll('browser,iframe'))try{const child=frame.contentDocument;if(classify(child)){if(frame.localName==='browser'){if(!frames.has(frame))frames.set(frame,frame.getAttribute('transparent'));if(frame.getAttribute('transparent')!=='true')frame.setAttribute('transparent','true');}visit(child,depth+1);}}catch{}
 }
 function scan(win){
  if(!allowed()||!win||win.closed)return;const kind=classify(win.document);let hasChild=false;
  try{hasChild=[...win.document.querySelectorAll('browser,iframe')].some(f=>classify(f.contentDocument));}catch{}
  if(kind||hasChild){addon.mica.applyMaterial(win);visit(win.document);addon.focus?.attach(win);}
 }
 function observeWindow(win){
  if(!win?.document||windows.has(win))return;const row={timers:new Set(),change:null,mo:null};
  row.change=()=>{if(!allowed())return;scan(win);};
  row.load=e=>{if(e.target?.nodeType===9||e.target?.localName==='browser'||e.target?.localName==='iframe')row.change();};
  row.close=()=>forget(win);win.addEventListener('load',row.load,true);win.addEventListener('unload',row.close,{once:true});windows.set(win,row);
  // Covers plugins that populate a system about:blank after its load event.
  for(const delay of [0,100,400,1200,3000]){const t=win.setTimeout(()=>{row.timers.delete(t);row.change();},delay);row.timers.add(t);}
 }
 function forget(win){for(const [frame]of frames)if(frame.ownerDocument?.defaultView===win)frames.delete(frame);const row=windows.get(win);if(!row)return;for(const t of row.timers)win.clearTimeout(t);win.removeEventListener('load',row.load,true);win.removeEventListener('unload',row.close);windows.delete(win);for(const [doc]of documents)if(doc.defaultView===win)documents.delete(doc);}
 function restoreDocs(){for(const [frame,old]of frames){try{if(old===null)frame.removeAttribute('transparent');else frame.setAttribute('transparent',old);}catch{}}frames.clear();for(const [doc,s]of documents){try{const root=doc.documentElement;if(s.old===null)root.removeAttribute(attr);else root.setAttribute(attr,s.old);if(s.oldGlass===null)clearGlassVars(root);else root.setAttribute('tais-zotero-glass',s.oldGlass);}catch{}}documents.clear();}
 function refresh(){if(!started)return;if(!allowed()){restoreDocs();for(const win of [...addon.mica.enabledWindows]){if(!Zotero.getMainWindows().includes(win))try{addon.focus?.detach(win);addon.mica.restoreMaterial(win);}catch{}}return;}for(const win of Services.wm.getEnumerator(null)){observeWindow(win);scan(win);}}
 function start(){if(started)return;started=true;observer={observe(subject,topic){if(topic==='domwindowopened')try{observeWindow(subject.QueryInterface(Ci.nsIDOMWindow));}catch{}}};Services.ww.registerNotification(observer);refresh();}
 function dispose(){if(!started)return;started=false;if(observer)try{Services.ww.unregisterNotification(observer);}catch{}observer=null;restoreDocs();for(const win of [...windows.keys()])forget(win);}
 function report(){const rows=[];for(const [doc,state]of documents){try{if(doc.defaultView.closed)continue;const win=doc.defaultView,root=doc.documentElement,st=win.getComputedStyle(root),card=doc.querySelector('.card.addon,#left,.dialog-content');rows.push({kind:state.kind,uri:doc.documentURI,rootBackground:st.backgroundColor,bodyBackground:doc.body?win.getComputedStyle(doc.body).backgroundColor:null,foreground:st.color,cardBackground:card?win.getComputedStyle(card).backgroundColor:null,nativeTop:root.getAttribute('data-tg-top')==='yes'});}catch{}}return rows;}
 return {classify,start,refresh,dispose,report,visit};
})();
(function integrateTools(){
 const m=addon.mica,oldApplicable=m.isApplyable;
 m.isApplyable=function(win){if(oldApplicable.call(this,win))return true;return !!getPref('apply-dialogs')&&!!TGTools.classify(win?.document)&&win?.top===win;};
 const apply=m.applyMaterial;m.applyMaterial=function(win){const result=apply.call(this,win);if(getPref('enabled')&&getPref('apply-dialogs'))TGTools.visit(win.document);return result;};
 const restore=m.restoreMaterial;m.restoreMaterial=function(win){try{win.document.documentElement.removeAttribute('data-tg-tool-surface');}catch{}return restore.call(this,win);};
 const sheets=[rootURI+'content/tool-surfaces.css'];for(const s of sheets)if(!SHEETS.includes(s))SHEETS.push(s);
 addon.tools=TGTools;
})();
