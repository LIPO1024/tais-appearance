/* Independent background policy. No PDF pixel processing, font replacement, or global theme preference writes. */
var TGDarkPolicy = (()=>{
 const readers=new Map();let syncing=false;
 const secondary=[240,244,249];
 function luminance(c){const v=c.map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
 function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function parse(value){return /^#[0-9a-f]{6}$/i.test(value||'')?[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)):[32,41,54];}
 function compute(tint,request){
  let rgb=parse(tint),fallback=false;const target=4.5;
  if(ratio(secondary,rgb)<target){rgb=[32,41,54];fallback=true;}
  let total=1;for(let n=0;n<=100;n++){const alpha=n/100,bg=rgb.map(v=>v*alpha+255*(1-alpha));if(ratio(secondary,bg)>=target){total=alpha;break;}}
  const root=Math.max(.40,Math.min(.62,Number.isFinite(request)?request/100:.44)),local=Math.max(.34,Math.min(.56,(total-root)/(1-root)));
  return {root,local,panel:local,sidebar:Math.min(.62,local+.04),toolbar:Math.max(.36,local-.02),card:Math.min(.64,local+.05),input:Math.min(.72,local+.12),popup:Math.max(.82,local+.34),total,tint:rgb,fallback,target,foreground:secondary};
 }
 function id(theme){return theme?.id||null;}
 function isDark(theme){const fg=parse(theme?.foreground),bg=parse(theme?.background);return !!theme&&luminance(fg)>luminance(bg);}
 function restore(reader,row){
  try{const state=reader._state;if(state.colorScheme===row.appliedScheme)reader.setColorScheme(row.scheme);
   if(row.overrodeTheme&&state.darkTheme===row.appliedTheme)reader.setDarkTheme(row.themeID);
  }catch(e){micalog('TAIS reader-theme restore',String(e));}
  readers.delete(reader);
 }
 function sync(){
  if(syncing)return;syncing=true;
  try{
   let forced=false;try{forced=Zotero.getMainWindow().matchMedia('(forced-colors: active)').matches;}catch{}
   const enabled=!forced&&Zotero.isWin&&addon.data.alive&&tgGet('enabled')&&tgGet('reader-dark-mode')==='native'&&resolveGlassTheme()==='dark';
   if(!enabled){for(const [r,s]of [...readers])restore(r,s);return;}
   const alive=new Set();
   for(const instance of Zotero.Reader?._readers||[]){
    if(instance.type&&instance.type!=='pdf')continue;
    const target=instance._internalReader;if(!target)continue;
    const r=Components.utils.waiveXrays(target);if(!r._state||typeof r.setColorScheme!=='function'||typeof r.setDarkTheme!=='function')continue;
    alive.add(r);let row=readers.get(r);
    if(!row){row={scheme:r._state.colorScheme,themeID:id(r._state.darkTheme),appliedScheme:'dark',overrodeTheme:false,appliedTheme:null,userChoice:false};readers.set(r,row);
     // Preserve existing genuinely dark custom themes; use the native Dark theme only
     // when the existing setting is Original/light. This state is not written to prefs.
     if(!isDark(r._state.darkTheme)){r.setDarkTheme('dark');row.appliedTheme=r._state.darkTheme;row.overrodeTheme=true;}
     r.setColorScheme('dark');
    }else{
     // A theme selected by the user while the bridge is active wins over the bridge.
     if(row.overrodeTheme&&r._state.darkTheme!==row.appliedTheme){row.overrodeTheme=false;row.userChoice=true;}
     if(r._state.colorScheme!==row.appliedScheme){row.scheme=r._state.colorScheme;r.setColorScheme('dark');}
    }
   }
   for(const [r,row]of [...readers])if(!alive.has(r))readers.delete(r);
  }catch(e){micalog('TAIS native theme bridge unavailable; original reader preserved',String(e));}
  finally{syncing=false;}
 }
 function dispose(){for(const [r,row]of [...readers])restore(r,row);}
 function report(){return {mode:tgGet('reader-dark-mode'),supported:!!Zotero.isWin,managedReaders:readers.size,policy:compute(tgGet('dark-tint'),Number(tgGet('dark-window-opacity'))),readers:[...readers].map(([r,s])=>({theme:id(r._state?.darkTheme),scheme:r._state?.colorScheme,temporaryTheme:s.overrodeTheme,userChoice:s.userChoice}))};}
 return {compute,sync,dispose,report};
})();
(function installDarkPolicy(){
 const apply=applyGlassVars;
 applyGlassVars=function(root){apply(root);if(!root)return;const p=TGDarkPolicy.compute(tgGet('dark-tint'),Number(tgGet('dark-window-opacity')));
  root.style.setProperty('--tg-dark-window-alpha',p.root*100+'%');root.style.setProperty('--tg-dark-surface-min',Math.ceil(p.local*100)+'%');root.style.setProperty('--tg-dark-panel-min',Math.ceil(p.panel*100)+'%');root.style.setProperty('--tg-dark-sidebar-min',Math.ceil(p.sidebar*100)+'%');root.style.setProperty('--tg-dark-toolbar-min',Math.ceil(p.toolbar*100)+'%');root.style.setProperty('--tg-dark-card-min',Math.ceil(p.card*100)+'%');root.style.setProperty('--tg-dark-input-min',Math.ceil(p.input*100)+'%');root.style.setProperty('--tg-dark-popup-min',Math.ceil(p.popup*100)+'%');root.style.setProperty('--tg-dark-safe-rgb',p.tint.join(' '));root.setAttribute('data-tg-dark-tint-fallback',p.fallback?'yes':'no');};
 const clear=clearGlassVars;clearGlassVars=function(root){clear(root);if(!root)return;for(const key of ['--tg-dark-window-alpha','--tg-dark-surface-min','--tg-dark-panel-min','--tg-dark-sidebar-min','--tg-dark-toolbar-min','--tg-dark-card-min','--tg-dark-input-min','--tg-dark-popup-min','--tg-dark-safe-rgb'])root.style.removeProperty(key);root.removeAttribute('data-tg-dark-tint-fallback');};
 const disable=addon.mica.disable;addon.mica.disable=function(){TGDarkPolicy.dispose();return disable.call(this);};
 const sheet=rootURI+'content/dark-refinement.css';if(!SHEETS.includes(sheet))SHEETS.push(sheet);addon.darkPolicy=TGDarkPolicy;
})();
