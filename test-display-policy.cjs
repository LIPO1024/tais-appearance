'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const Policy = require('./source/content/display-policy.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS '+name); }
function windowMock() {
  const listeners = new Map(), mqs = [], timers = new Map(), attrs = new Map(); let next = 1;
  const flags = { forcedColors: false, reducedTransparency: false, reducedMotion: false, increasedContrast: false };
  const root = { getAttribute:k=>attrs.has(k)?attrs.get(k):null, setAttribute:(k,v)=>attrs.set(k,v), removeAttribute:k=>attrs.delete(k) };
  const win = { devicePixelRatio: 1, closed: false, document: { documentElement: root, querySelectorAll:()=>[] },
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type,new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    setTimeout(fn) { const id=next++;timers.set(id,fn);return id; }, clearTimeout(id) {timers.delete(id);},
    matchMedia(query) {
      const events = new Set();
      const mq = { media:query, get matches() {
        const key=Object.keys(Policy.queries).find(k=>Policy.queries[k]===query);
        if(key)return flags[key];
        return query==='(resolution: '+win.devicePixelRatio+'dppx)';
      }, addEventListener:(t,fn)=>events.add(fn), removeEventListener:(t,fn)=>events.delete(fn), events };
      mqs.push(mq); return mq;
    }
  };
  win.document.defaultView=win;
  return {win,flags,timers,mqs,attrs,
    emit(type){for(const fn of [...(listeners.get(type)||[])])fn();},
    media(){for(const mq of [...mqs])for(const fn of [...mq.events])fn();},
    drain(){const fns=[...timers.values()];timers.clear();for(const fn of fns)fn();},
    count(){return [...listeners.values()].reduce((n,s)=>n+s.size,0)+mqs.reduce((n,m)=>n+m.events.size,0);}
  };
}
const base={platform:'windows',nativeAvailable:true,enabled:true,mediaReadable:true};
test('policy allows only a verified Windows native capability',()=>{assert.equal(Policy.decide(base).nativeMaterial,true);for(const platform of ['macos','linux','unknown'])assert.equal(Policy.decide({...base,platform}).reason,'unsupported-platform');});
test('all gating conditions fail closed',()=>{for(const [extra,reason] of [[{nativeAvailable:false},'native-unavailable'],[{enabled:false},'disabled'],[{safeMode:true},'safe-mode'],[{mediaReadable:false},'media-unavailable'],[{forcedColors:true},'forced-colors'],[{reducedTransparency:true},'reduced-transparency']])assert.equal(Policy.decide({...base,...extra}).reason,reason);});
test('contrast and reduced motion are not confused with forced colors',()=>{const p=Policy.decide({...base,increasedContrast:true,reducedMotion:true});assert(p.nativeMaterial);assert(p.increasedContrast);assert(p.reducedMotion);});
test('invalid DPR and unavailable media queries have safe defaults',()=>{const x=windowMock();x.win.devicePixelRatio=NaN;assert.equal(Policy.snapshot(x.win).dpr,1);x.win.matchMedia=()=>{throw Error('unavailable');};assert.equal(Policy.snapshot(x.win).mediaReadable,false);});
test('100/125/150/200 percent transitions re-arm the resolution listener',()=>{const x=windowMock(),changes=[],w=Policy.watch(x.win,c=>changes.push(c));for(const dpr of [1.25,1.5,2,1]){x.win.devicePixelRatio=dpr;x.media();x.drain();assert.equal(w.snapshot().dpr,dpr);assert.equal(x.mqs.filter(m=>m.events.size&&m.media.startsWith('(resolution:')).length,1);}assert.equal(changes.length,4);w.dispose();assert.equal(x.count(),0);});
test('resize and focus bursts coalesce without rendering when DPR is unchanged',()=>{const x=windowMock();let calls=0;const w=Policy.watch(x.win,()=>calls++);for(let i=0;i<1000;i++)x.emit('resize');assert.equal(x.timers.size,1);x.drain();assert.equal(calls,0);x.win.devicePixelRatio=2;for(let i=0;i<1000;i++)x.emit('focus');x.drain();assert.equal(calls,1);w.dispose();});
test('two windows retain independent DPI and preference states',()=>{const a=windowMock(),b=windowMock();let ac=0,bc=0;const wa=Policy.watch(a.win,()=>ac++),wb=Policy.watch(b.win,()=>bc++);a.win.devicePixelRatio=1.5;a.media();a.drain();assert.equal(ac,1);assert.equal(bc,0);assert.equal(wb.snapshot().dpr,1);wa.dispose();wb.dispose();});
test('accessibility changes are delivered in both directions',()=>{const x=windowMock(),changes=[],w=Policy.watch(x.win,c=>changes.push(c));for(const key of Object.keys(x.flags)){x.flags[key]=true;x.media();x.drain();x.flags[key]=false;x.media();x.drain();}assert.equal(changes.length,8);assert(changes.every(c=>c.policyChanged));w.dispose();});
test('dispose cancels pending work and is idempotent',()=>{const x=windowMock();let calls=0;const w=Policy.watch(x.win,()=>calls++);x.win.devicePixelRatio=2;x.emit('resize');w.dispose();w.dispose();x.drain();assert.equal(calls,0);assert.equal(x.count(),0);assert.equal(x.timers.size,0);});
test('unload releases all listeners and timers',()=>{const x=windowMock(),w=Policy.watch(x.win,()=>{});x.emit('resize');x.emit('unload');assert(w.isDisposed());assert.equal(x.count(),0);assert.equal(x.timers.size,0);});
test('1000 attach/change/detach cycles leave no listener accumulation',()=>{const x=windowMock();for(let i=0;i<1000;i++){const w=Policy.watch(x.win,()=>{});x.win.devicePixelRatio=i%2?1.25:2;x.media();x.drain();w.dispose();}assert.equal(x.count(),0);assert.equal(x.timers.size,0);});
function runtimeFixture(platform='windows') {
  const x=windowMock(),calls={apply:0,native:0,restore:0,readerDetach:0,prefWrites:0,probe:0};
  const prefs={enabled:true,'safe-mode':false};
  const manager={enabledWindows:new Set(),isApplyable:w=>!!w?.document,isFullSupport:()=>{calls.probe++;return true;},
    restoreMaterial(w){calls.restore++;this.enabledWindows.delete(w);},disable(){this.enabledWindows.clear();}};
  const context={TGDisplayPolicy:Policy,SHEETS:[],rootURI:'file:///development/',
    Zotero:{isWin:platform==='windows',isMac:platform==='macos',isLinux:platform==='linux'},
    addon:{mica:manager,data:{alive:true},hooks:{onShutdown:async()=>{}}},getPref:k=>prefs[k],
    TGFocus:{detach(){}},TGReading:{detach(){calls.readerDetach++;}},configureNativeGlass(){calls.native++;return {ok:true};}};
  manager.applyMaterial=function(w){calls.apply++;this.enabledWindows.add(w);return context.configureNativeGlass(w,{},'acrylic','light');};
  const original={apply:manager.applyMaterial,native:context.configureNativeGlass,disable:manager.disable};
  vm.createContext(context);vm.runInContext(fs.readFileSync('source/content/display-runtime.js','utf8'),context);
  return {...x,context,manager,prefs,calls,original};
}
test('forced colors prevents native apply even on the first call',()=>{const x=runtimeFixture();x.flags.forcedColors=true;x.manager.applyMaterial(x.win);assert.equal(x.calls.apply,0);assert.equal(x.calls.native,0);assert.equal(x.attrs.get('data-tg-display-fallback'),'forced-colors');});
test('Safe Mode never briefly applies native material',()=>{const x=runtimeFixture();x.prefs['safe-mode']=true;x.manager.applyMaterial(x.win);assert.equal(x.calls.apply,0);assert.equal(x.calls.native,0);});
test('live accessibility fallback restores ownership and resumes without preference writes',()=>{const x=runtimeFixture();x.manager.applyMaterial(x.win);assert.equal(x.calls.native,1);x.flags.reducedTransparency=true;x.media();x.drain();assert.equal(x.calls.restore,1);assert.equal(x.calls.native,1);assert(x.calls.readerDetach>0);x.flags.reducedTransparency=false;x.media();x.drain();assert.equal(x.calls.native,2);assert.equal(x.attrs.has('data-tg-display-fallback'),false);assert.equal(x.calls.prefWrites,0);});
test('DPI transition requests one native refresh, no pixel operations',()=>{const x=runtimeFixture();x.manager.applyMaterial(x.win);x.win.devicePixelRatio=1.5;for(let i=0;i<50;i++)x.emit('resize');x.drain();assert.equal(x.calls.native,2);x.emit('resize');x.drain();assert.equal(x.calls.native,2);});
test('reduced motion alone does not reapply the native backdrop',()=>{const x=runtimeFixture();x.manager.applyMaterial(x.win);x.flags.reducedMotion=true;x.media();x.drain();assert.equal(x.calls.native,1);});
test('non-Windows execution never probes DWM or imports native libraries',()=>{for(const platform of ['macos','linux']){const x=runtimeFixture(platform);x.manager.applyMaterial(x.win);x.context.configureNativeGlass(x.win,{},'acrylic','light');assert.equal(x.calls.native,0);assert.equal(x.calls.probe,0);}});
test('disabling cancels pending native refreshes and removes all watchers',()=>{const x=runtimeFixture();x.manager.applyMaterial(x.win);x.win.devicePixelRatio=2;x.emit('resize');x.prefs.enabled=false;x.manager.disable();x.drain();assert.equal(x.calls.native,1);assert.equal(x.count(),0);assert.equal(x.context.addon.display.report().length,0);});
test('diagnostic payload contains no titles, paths, document URIs or text',()=>{const x=runtimeFixture();x.manager.applyMaterial(x.win);const data=JSON.stringify(x.context.addon.display.report());for(const value of ['documentURI','file:///','title','textContent','screenX','screenY'])assert(!data.includes(value));});
test('native rendering implementation remains at the reviewed baseline',()=>{const crypto=require('node:crypto'),baseline=JSON.parse(fs.readFileSync('brand/protected-hashes.json','utf8'));for(const f of ['reading.js','paper-core.js','focus.js','scripts/taisglass.js','glass.css']){const current=fs.readFileSync('source/content/'+f,'utf8').replace(/\r\n/g,'\n');assert.equal(crypto.createHash('sha256').update(current).digest('hex'),baseline['content/'+f]);}});
fs.writeFileSync('display-policy-results.json',JSON.stringify({passed,testType:'simulated window/media lifecycle and source invariants; not physical DPI or native host acceptance'},null,2));
console.log('Display policy: '+passed+' groups passed');
