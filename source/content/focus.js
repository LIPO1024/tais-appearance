/* Keep native Acrylic appearance without changing real input focus.
 * Uses documented WM_NCACTIVATE; no DLL patching, injection, or SWCA mode switch.
 */
var TGFocus = (()=>{
 const windows=new Map();let api=null;
 function native(){if(api)return api;const c=ctypes(),lib=c.open('user32.dll');_libs.push(lib);api={post:lib.declare('PostMessageW',c.winapi_abi,c.int32_t,c.voidptr_t,c.uint32_t,c.uintptr_t,c.intptr_t),foreground:lib.declare('GetForegroundWindow',c.winapi_abi,c.voidptr_t)};return api;}
 function allowed(win){return addon.data.alive&&getPref('enabled')&&getPref('safe-mode')!==true&&getPref('keep-inactive')===true&&!win.closed&&!win.matchMedia('(forced-colors: active)').matches&&!win.matchMedia('(prefers-reduced-transparency: reduce)').matches;}
 function repaint(win,force){try{const hwnd=toCtypesHwnd(getHwnd(win));if(!hwnd)return false;const n=native(),actuallyActive=n.foreground().toString()===hwnd.toString();if(force&&actuallyActive)return true;const active=force?1:(actuallyActive?1:0);return Number(n.post(hwnd,0x0086,active,0))!==0;}catch(e){micalog('TAIS focus appearance skipped',String(e));return false;}}
 function schedule(win){const r=windows.get(win);if(!r)return;for(const t of r.timers)clearTimeout(t);r.timers.clear();for(const delay of [80,350]){const t=setTimeout(()=>{r.timers.delete(t);if(allowed(win)&&!win.document.hasFocus()){r.last=repaint(win,true);r.changedAt=new Date().toISOString();}},delay);r.timers.add(t);}}
 function attach(win){if(!win?.document||!addon.mica.isApplyable(win))return;if(!windows.has(win)){const r={timers:new Set(),last:null,changedAt:null};r.deactivate=()=>schedule(win);r.unload=()=>detach(win,false);win.addEventListener('deactivate',r.deactivate);win.addEventListener('blur',r.deactivate);win.addEventListener('unload',r.unload,{once:true});windows.set(win,r);}if(allowed(win))schedule(win);else repaint(win,false);}
 function detach(win,restore=true){const r=windows.get(win);if(!r)return;for(const t of r.timers)clearTimeout(t);try{win.removeEventListener('deactivate',r.deactivate);win.removeEventListener('blur',r.deactivate);win.removeEventListener('unload',r.unload);if(restore&&!win.closed)repaint(win,false);}catch{}windows.delete(win);}
 function dispose(){for(const w of [...windows.keys()])detach(w);api=null;}
 function report(){return [...windows].map(([win,r])=>({uri:win.document?.documentURI,enabled:allowed(win),focused:win.document?.hasFocus(),lastAppearanceRequest:r.last,updated:r.changedAt}));}
 return {attach,detach,dispose,report};
})();
