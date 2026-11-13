/* TAIS 1.3.11: one transparent surface chain + native PDF.js paper alpha.
 * No raster copies, pixel keying, font substitution, canvas opacity or text-layer filters.
 * Native hooks are version-gated, document-local, reversible and never used for printing.
 */
var TGReading = (() => {
 const states=new Map(),Cu=Components.utils;
 const get=(k,f)=>{try{return getPref(k)??f;}catch{return f;}};
 const num=(k,f,lo,hi)=>{const n=Number(get(k,f));return Math.max(lo,Math.min(hi,Number.isFinite(n)?n:f));};
 const CSS=`
 :root[data-tg-reader-surface="yes"],
 :root[data-tg-reader-surface="yes"] body,
 :root[data-tg-reader-surface="yes"] :is(#outerContainer,#mainContainer,#viewer){background:transparent!important;}
 :root[data-tg-reader-surface="yes"] #viewerContainer{
  background-color:var(--tg-surround)!important;background-image:var(--tg-background-image,none)!important;
  background-size:var(--tg-background-fit,cover)!important;background-repeat:var(--tg-background-repeat,no-repeat)!important;
  background-position:center!important;
 }
 :root[data-tg-native-paper="yes"] .pdfViewer .page{background-color:var(--tg-native-sheet)!important;}
 @media print{:root[data-tg-reader-surface="yes"] #viewerContainer{background:white!important;}
 :root[data-tg-native-paper="yes"] .pdfViewer .page{background-color:white!important;}}
 @media(forced-colors:active),(prefers-reduced-transparency:reduce){
 :root[data-tg-reader-surface="yes"] body,:root[data-tg-reader-surface="yes"] #viewerContainer{background:Canvas!important;}}
 `;
 const palettes={mist:[190,211,226],forest:[145,176,160],sand:[207,183,151],night:[56,80,113],violet:[164,150,190]};
 function settings(){return {mode:get('paper-mode','native-glass'),sheet:num('native-paper-opacity',72,12,98)/100,follow:get('paper-follow-surround',false)===true,
  background:get('reader-background','glass'),gradient:get('reader-gradient','mist'),strength:num('reader-background-opacity',28,0,65)/100,
  blur:num('reader-background-blur',20,0,40),brightness:num('reader-background-brightness',100,60,140)/100,
  fit:get('reader-background-fit','cover'),surround:Math.max(0,Math.min(40,Number(get('pdf-surround-opacity',8))))/100};}
 function allowed(s){return !!get('enabled',true)&&get('safe-mode',false)!==true&&!s.win.matchMedia('(forced-colors:active)').matches&&!s.win.matchMedia('(prefers-reduced-transparency:reduce)').matches;}
 function rgba(c,a){return 'rgba('+c.join(',')+','+a+')';}
 function rgb(color){const m=String(color||'').match(/^#([0-9a-f]{6})$/i);return m?[0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)):null;}
 function raw(s){return s.win.wrappedJSObject||s.win;}
 function viewer(s){const v=raw(s).PDFViewerApplication?.pdfViewer;return v?Cu.waiveXrays(v):null;}
 function visible(s,p){const r=p.div?.getBoundingClientRect();return r&&r.width>0&&r.height>0&&r.bottom>0&&r.top<s.win.innerHeight;}
 function setVar(s,k,v){if(s.doc.documentElement.style.getPropertyValue(k)!==v)s.doc.documentElement.style.setProperty(k,v);}
 function manageViewport(s){
  const c=s.doc.getElementById('viewerContainer');if(!c)return;
  if(s.viewport!==c){restoreViewport(s);s.viewport=c;s.viewportSaved=new Map();
   for(const k of ['background-color','background-image','background-size','background-repeat','background-position'])s.viewportSaved.set(k,[c.style.getPropertyValue(k),c.style.getPropertyPriority(k)]);
  }
  // Take reversible ownership of background paint only. Old plugin releases left
  // literal inline !important values; variables here keep every cached tab in sync.
  const normal=allowed(s);const values={'background-color':normal?'var(--tg-surround)':'Canvas','background-image':normal?'var(--tg-background-image,none)':'none','background-size':'var(--tg-background-fit,cover)','background-repeat':'var(--tg-background-repeat,no-repeat)','background-position':'center'};
  for(const [k,v]of Object.entries(values))if(c.style.getPropertyValue(k)!==v||c.style.getPropertyPriority(k)!=='important')c.style.setProperty(k,v,'important');
 }
 function restoreViewport(s){
  if(!s.viewport||!s.viewportSaved)return;
  for(const [k,[v,p]]of s.viewportSaved){if(v)s.viewport.style.setProperty(k,v,p);else s.viewport.style.removeProperty(k);}
  s.viewport=null;s.viewportSaved=null;
 }
 // Paper tint and glyph pixels are separate. The guard changes only paper alpha.
 function paperLuminance(c){const v=c.map(x=>{x=x/255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
 function paperContrast(fg,bg,alpha,bounds={lo:[0,0,0],hi:[255,255,255]}){
  const f=paperLuminance(fg),lo=paperLuminance(bg.map((v,i)=>v*alpha+bounds.lo[i]*(1-alpha))),hi=paperLuminance(bg.map((v,i)=>v*alpha+bounds.hi[i]*(1-alpha)));
  if(f>=lo&&f<=hi)return 1;
  const ratio=x=>(Math.max(f,x)+.05)/(Math.min(f,x)+.05);return Math.min(ratio(lo),ratio(hi));
 }
 function paperAppearance(background,foreground,requested,bounds,minimum=4.5){
  const bg=rgb(background)||[255,255,255],fg=rgb(foreground),desired=Math.max(.12,Math.min(.98,requested));
  let alpha=desired,contrast=null;
  if(fg){for(let percent=Math.ceil(desired*100-1e-6);percent<=100;percent++){alpha=percent/100;contrast=paperContrast(fg,bg,alpha,bounds);if(contrast>=minimum)break;}}
  else alpha=Math.max(desired,.90);
  return {color:bg,requested:desired,applied:alpha,guardRaised:alpha>desired+.0001,themeContrastBound:contrast};
 }
 function ancestry(element){const result=[];for(let e=element;e;e=e.parentElement)result.unshift(e);return result;}
 function embedding(target){
  const seen=new Set();function walk(doc,path,depth){if(!doc||depth>6||seen.has(doc))return null;seen.add(doc);if(doc===target)return path;
   for(const frame of doc.querySelectorAll('browser,iframe'))try{const found=walk(frame.contentDocument,path.concat(frame),depth+1);if(found)return found;}catch{}return null;}
  for(const win of Services.wm.getEnumerator(null))try{const p=walk(win.document,[],0);if(p)return p;}catch{}return null;
 }
 function backdropBounds(s){
  if(!s.embedPath||s.embedPath.some(f=>!f.isConnected))s.embedPath=embedding(s.doc);
  let lo=[0,0,0],hi=[255,255,255],painted=0,unknown=false;const nodes=[];
  for(const f of s.embedPath||[])nodes.push(...ancestry(f));nodes.push(...ancestry(s.doc.getElementById('viewerContainer')));
  for(const element of nodes){const style=element.ownerDocument.defaultView.getComputedStyle(element);
   if(style.opacity!=='1'||(style.filter&&style.filter!=='none')){lo=[0,0,0];hi=[255,255,255];unknown=true;continue;}
   const m=style.backgroundColor.match(/^rgba?\(([^)]+)\)$/);if(m){const parts=m[1].split(',').map(Number),alpha=parts.length===4?parts[3]:1;if(parts.length>=3&&parts.every(Number.isFinite)){lo=lo.map((v,i)=>v*(1-alpha)+parts[i]*alpha);hi=hi.map((v,i)=>v*(1-alpha)+parts[i]*alpha);if(alpha>0)painted++;}}
   // Images/gradients can carry arbitrary luminance. Do not inspect desktop pixels
   // or weaken protection based on a guessed wallpaper. Subsequent solid tints still count.
   if(style.backgroundImage&&style.backgroundImage!=='none'){lo=[0,0,0];hi=[255,255,255];unknown=true;}
  }
  return {lo,hi,painted,model:unknown?'conservative-image':'composed-css'};
 }
 function paperColor(s){
  const nativeTheme=raw(s).theme,theme=nativeTheme||{},foreground=theme.foreground||(!nativeTheme?'#000000':null),bounds=backdropBounds(s);
  const requested=s.cfg.follow?Math.max(.12,Math.min(.98,s.cfg.surround+.12)):s.cfg.sheet;
  const preserveInDark=s.theme==='dark'&&(!nativeTheme||paperLuminance(rgb(foreground)||[0,0,0])<paperLuminance(rgb(theme.background)||[255,255,255]));
  const minimum=preserveInDark?7:4.5;
  const key=JSON.stringify([theme.background,foreground,requested,bounds,minimum]);
  if(key!==s.paperAppearanceKey){s.paperAppearance=paperAppearance(theme.background,foreground,requested,bounds,minimum);s.paperAppearanceKey=key;s.backdropModel=bounds.model;}
  setVar(s,'--tg-native-sheet',rgba(s.paperAppearance.color,s.paperAppearance.applied));
 }
 function redraw(s){
  const v=viewer(s);if(!v||!s.active)return;
  for(const item of v._pages||[]){const p=Cu.waiveXrays(item);if(!p.canvas)continue;if((p.renderingState===1||p.renderingState===2)&&p.renderTask){s.pendingPages.add(p.id);continue;}
   const o=new (raw(s).Object)();o.scale=p.scale;o.rotation=p.rotation;p.update(o);
  }
  v.update();
 }
 function installNative(s){
  if(s.native)return true;
  const pw=raw(s),v=viewer(s),found=v?._pages?.find(p=>p.pdfPage),p=found?Cu.waiveXrays(found):null;
  if(!p)return false;
  if(pw.pdfjsLib?.version!=='5.7.0'){s.reason='unsupported-pdfjs-'+pw.pdfjsLib?.version;return false;}
  const proto=Object.getPrototypeOf(p),original=proto._getRenderingContext,create=proto._createCanvas;
  if(typeof original!=='function'||typeof create!=='function'){s.reason='native-hook-unavailable';return false;}
  const ownGet=Object.getOwnPropertyDescriptor(proto,'_getRenderingContext'),ownCreate=Object.getOwnPropertyDescriptor(proto,'_createCanvas');
  const contextHook=Cu.exportFunction(function(){
   const self=Cu.waiveXrays(this),args=Array.from(arguments,x=>x&&typeof x==='object'?Cu.waiveXrays(x):x);
   const result=Cu.waiveXrays(original.call(self,args[0],args[1],args[2],args[3]));
   if(!s.paperEnabled||!result.canvas)return result;
   const c=Cu.waiveXrays(result.canvas),contextOptions=new pw.Object();contextOptions.alpha=true;const ctx=Cu.waiveXrays(c.getContext('2d',contextOptions));
   if(ctx.getContextAttributes?.().alpha!==true){s.reason='opaque-canvas-fallback';return result;}
   result.canvasContext=ctx;result.background='rgba(255,255,255,0)';s.nativeRenderCalls++;
   return result;
  },pw,{allowCrossOriginArguments:true});
  const createHook=Cu.exportFunction(function(onShow,hideUntilComplete){
   // PDF.js itself keeps the old canvas until the new one is complete. This avoids
   // its progressive opaque clone path without making any TAIS overlay canvas.
   return create.call(Cu.waiveXrays(this),Cu.waiveXrays(onShow),s.paperEnabled?true:hideUntilComplete);
  },pw,{allowCrossOriginArguments:true});
  proto._getRenderingContext=contextHook;proto._createCanvas=createHook;
  s.native={proto,original,create,ownGet,ownCreate,contextHook,createHook};s.reason=null;return true;
 }
 function removeNative(s){
  const n=s.native;if(!n)return;
  if(Cu.waiveXrays(n.proto._getRenderingContext)===Cu.waiveXrays(n.contextHook)){if(n.ownGet)Object.defineProperty(n.proto,'_getRenderingContext',n.ownGet);else delete n.proto._getRenderingContext;}
  if(Cu.waiveXrays(n.proto._createCanvas)===Cu.waiveXrays(n.createHook)){if(n.ownCreate)Object.defineProperty(n.proto,'_createCanvas',n.ownCreate);else delete n.proto._createCanvas;}
  s.native=null;
 }
 async function prepareImage(s,url,generation){
  const key=[url,s.cfg.blur,s.cfg.brightness].join('|');if(s.imageKey===key)return s.imageURL;
  const image=new s.win.Image();image.src=url;await image.decode();if(s.dead||generation!==s.bgGeneration)return null;
  const canvas=s.doc.createElementNS('http://www.w3.org/1999/xhtml','canvas');
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const ctx=canvas.getContext('2d'),pad=Math.ceil(s.cfg.blur*2);
  ctx.filter='blur('+s.cfg.blur+'px) brightness('+s.cfg.brightness+')';
  ctx.drawImage(image,-pad,-pad,canvas.width+pad*2,canvas.height+pad*2);
  s.imageWidth=canvas.width;s.imageHeight=canvas.height;s.imageURL=canvas.toDataURL('image/webp',.88);s.imageKey=key;return s.imageURL;
 }
 async function background(s){
  const cfg=s.cfg,dark=s.theme==='dark';
  const tint=rgb(get(dark?'dark-tint':'light-tint',dark?'#202936':'#f3f6fa'))||(dark?[32,41,54]:[243,246,250]);
  const signature=JSON.stringify([cfg,typeof TGBackground!=='undefined'?TGBackground.url:null,s.theme,tint]);
  if(signature===s.bgSignature)return;s.bgSignature=signature;const generation=++s.bgGeneration;
  setVar(s,'--tg-surround',rgba(tint,cfg.surround));
  let image='none';
  if(cfg.background==='builtin'){image=TGDefaultBackground.css(s.theme,Math.min(.65,cfg.strength));}
  else if(cfg.background==='gradient'){
   const c=palettes[cfg.gradient]||palettes.mist,a=Math.min(.30,cfg.strength*.65);
   image='radial-gradient(ellipse at 18% 15%,'+rgba(c,a)+',transparent 65%),linear-gradient(135deg,'+rgba(c,a*.35)+','+rgba(tint,a*.35)+')';
  }else if(cfg.background==='image'&&TGBackground.url){
   try{const url=await prepareImage(s,TGBackground.url,generation);if(s.dead||generation!==s.bgGeneration)return;
    // cross-fade opacity is represented by an SVG image's alpha, not viewer opacity.
    const alpha=Math.min(.65,cfg.strength);
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+s.imageWidth+'" height="'+s.imageHeight+'"><image href="'+url+'" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" opacity="'+alpha+'"/></svg>';
    image='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
   }catch(e){s.error=String(e);image='none';}
  }
  setVar(s,'--tg-background-image',image);setVar(s,'--tg-background-fit',cfg.fit==='tile'?'auto':cfg.fit);
  setVar(s,'--tg-background-repeat',cfg.fit==='tile'?'repeat':'no-repeat');paperColor(s);
 }
 function attach(doc,options={}){
  if(get('enabled',true)!==true){detach(doc);return;}
  if(!doc?.documentElement||String(doc.documentURI).split(/[?#]/)[0]!=='resource://zotero/reader/pdf/web/viewer.html')return;
  let s=states.get(doc);
  if(!s){
   const root=doc.documentElement;const saved=new Map();for(const k of ['--tg-surround','--tg-background-image','--tg-background-fit','--tg-background-repeat','--tg-native-sheet'])saved.set(k,[root.style.getPropertyValue(k),root.style.getPropertyPriority(k)]);
   s={doc,win:doc.defaultView,active:options.active!==false,cfg:settings(),saved,dead:false,paperEnabled:false,native:null,nativeRenderCalls:0,bgGeneration:0,error:null,pendingPages:new Set(),renderTimer:null,retryTimer:null,retryCount:0};states.set(doc,s);
   const el=doc.createElementNS('http://www.w3.org/1999/xhtml','style');el.id='tg-reader-surface-1311';el.textContent=CSS;(doc.head||root).append(el);s.sheet=el;
   s.unload=()=>detach(doc,false);s.win.addEventListener('pagehide',s.unload,{once:true});
   s.policy=()=>attach(doc,{active:s.active});s.media=['(forced-colors:active)','(prefers-reduced-transparency:reduce)'].map(q=>{const m=s.win.matchMedia(q);m.addEventListener('change',s.policy);return m;});
  }
  const wasActive=s.active;s.active=options.active!==false;s.cfg=settings();
  s.theme=Zotero.getMainWindow()?.document.documentElement.getAttribute('data-tais-glass-theme')||'light';
  doc.documentElement.setAttribute('data-tg-reader-surface','yes');manageViewport(s);
  if(!s.bus){const bus=viewer(s)?.eventBus;if(bus){s.bus=bus;s.rendered=event=>{
 const e=event?Cu.waiveXrays(event):{};paperColor(s);if(!s.native&&!s.failed&&s.cfg.mode==='native-glass')attach(doc,{active:s.active});
 if(e.error&&s.paperEnabled){s.error=String(e.error);s.reason='native-render-fallback';s.paperEnabled=false;s.failed=true;removeNative(s);doc.documentElement.setAttribute('data-tg-native-paper','no');s.pendingPages.clear();}
 if((e.error||s.pendingPages.delete(e.pageNumber))&&!s.renderTimer){s.renderTimer=s.win.setTimeout(()=>{s.renderTimer=null;if(!s.dead)redraw(s);},0);}
 };(bus.on||bus._on).call(bus,'pagerendered',s.rendered);}}
  background(s).catch(e=>s.error=String(e));
  const enabled=!s.failed&&allowed(s)&&s.cfg.mode==='native-glass'&&installNative(s),changed=s.paperEnabled!==enabled;
  s.paperEnabled=enabled;doc.documentElement.setAttribute('data-tg-native-paper',enabled?'yes':'no');paperColor(s);
  if(changed)s.needsRedraw=true;
  if(s.active&&s.needsRedraw){s.needsRedraw=false;redraw(s);}
  if(s.active&&!s.native&&!s.reason&&!s.failed&&s.cfg.mode==='native-glass'&&!s.retryTimer&&s.retryCount<12){s.retryCount++;s.retryTimer=s.win.setTimeout(()=>{s.retryTimer=null;if(!s.dead)attach(doc,{active:s.active});},700);}
 }
 function detach(doc,restore=true){
  const s=states.get(doc);if(!s)return;s.dead=true;s.paperEnabled=false;removeNative(s);
  try{if(s.bus)(s.bus.off||s.bus._off).call(s.bus,'pagerendered',s.rendered);s.win.removeEventListener('pagehide',s.unload);for(const m of s.media)m.removeEventListener('change',s.policy);}catch{}
  if(s.renderTimer)s.win.clearTimeout(s.renderTimer);if(s.retryTimer)s.win.clearTimeout(s.retryTimer);s.pendingPages.clear();
  restoreViewport(s);s.sheet?.remove();doc.documentElement.removeAttribute('data-tg-reader-surface');doc.documentElement.removeAttribute('data-tg-native-paper');
  for(const [k,[v,p]]of s.saved){if(v)doc.documentElement.style.setProperty(k,v,p);else doc.documentElement.style.removeProperty(k);}
  states.delete(doc);if(restore&&!s.win.closed)try{redraw(s);}catch{}
 }
 function refresh(){for(const [d,s]of states)attach(d,{active:s.active});}
 function dispose(){for(const d of [...states.keys()])detach(d);}
 function report(){return [...states.values()].map(s=>{
  const d=s.doc,win=s.win,v=viewer(s),pages=[];for(const item of v?._pages||[]){const p=Cu.waiveXrays(item);if(!p.canvas||!p.canvas.isConnected||p.renderingState!==3||!visible(s,p))continue;const c=p.canvas,st=win.getComputedStyle(c);pages.push({page:p.id,nativeCanvasAlpha:c.getContext('2d').getContextAttributes?.().alpha,canvases:p.div.querySelectorAll('.canvasWrapper>canvas').length,width:c.width,height:c.height,opacity:st.opacity,filter:st.filter,transform:st.transform});}
  return {uri:d.documentURI,active:s.active,nativeThemeForeground:raw(s).theme?.foreground||null,nativeThemeBackground:raw(s).theme?.background||null,mode:s.paperEnabled?'native-glass':'background-only',reason:s.reason||null,version:raw(s).pdfjsLib?.version,bodyBackground:win.getComputedStyle(d.body).backgroundColor,viewportBackground:win.getComputedStyle(d.getElementById('viewerContainer')).backgroundColor,sheetOpacity:s.paperAppearance?.applied??s.cfg.sheet,requestedSheetOpacity:s.paperAppearance?.requested??s.cfg.sheet,paperFollowSurround:s.cfg.follow,backdropModel:s.backdropModel,paperContrastGuard:s.paperAppearance?.guardRaised??false,themeContrastBound:s.paperAppearance?.themeContrastBound??null,theme:s.theme,surround:d.documentElement.style.getPropertyValue('--tg-surround'),backgroundSource:s.cfg.background,backgroundReady:s.cfg.background!=='image'||!!s.imageURL,nativeRenderCalls:s.nativeRenderCalls,overlays:d.querySelectorAll('canvas.tg-paper-composite').length,hiddenLegacySources:d.querySelectorAll('canvas[data-tg-paper-source]').length,pages,error:s.error};
 });}
 return {attach,detach,refresh,dispose,report};
})();
