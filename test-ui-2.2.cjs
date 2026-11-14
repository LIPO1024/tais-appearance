const fs=require('fs'),assert=require('assert'),vm=require('vm');const base=__dirname+'/source/',ui=fs.readFileSync(base+'content/settings-ui.js','utf8'),css=fs.readFileSync(base+'content/preferences.css','utf8'),boot=fs.readFileSync(base+'bootstrap.js','utf8'),checks=[];
function test(name,fn){fn();checks.push({name,passed:true});}
test('stable identity and full version',()=>{const m=JSON.parse(fs.readFileSync(base+'manifest.json'));assert.equal(m.version,'2.5.0beta1');assert.equal(m.applications.zotero.id,'tais-zotero-glass@tais.local');});
test('header layout separates identity from actions',()=>{assert(ui.includes('header.append(brand,master)'));assert(ui.includes('toolbar.append(historyActions)'));assert(css.includes('grid-template-columns:minmax(0,1fr) auto'));assert(css.includes('@container tais-settings'));});
test('every settings design token has a definition',()=>{const names=[...css.matchAll(/var\((--g-[a-z-]+)/g)].map(x=>x[1]);for(const n of new Set(names))assert(css.includes(n+':'),'Undefined '+n);});
test('all custom fields retain original data-setting controls',()=>{for(const k of ['interface-text-size','annotation-text-size','native-paper-opacity','reader-background','settings-density'])assert(ui.includes(k));});
test('command palette exposes combobox ownership and active descendant',()=>{for(const s of ["role:'combobox'","role:'listbox'","role:'option'","aria-activedescendant","isComposing","closeCommand","locate(r)"])assert(ui.includes(s));});
test('shortcuts are workbench-scoped, not preference-window global',()=>{assert(ui.includes("host.addEventListener('keydown',globalKeys)"));assert(!ui.includes("ownerDocument.addEventListener('keydown',globalKeys)"));});
test('every refresh reapplies the current preview lock',()=>{assert(ui.includes('restorePreviewControls();host.dataset.locale=TGLocale.current();host.dataset.theme'));assert(ui.includes('lockPreviewControls();'));assert(ui.includes('TGSettings.preview'));});
test('scope import detects changed settings before commit',()=>{assert(ui.includes('previewData.scope!==importScope'));assert(ui.includes('JSON.stringify(current.changes)!==JSON.stringify(previewData.changes)'));});
test('profile duplicate and preview actions are present',()=>{assert(ui.includes('TGSettings.duplicateProfile'));assert(ui.includes("button('预览应用'"));assert(ui.includes("button('预览场景'"));});
test('modal cleanup and hidden advanced control reveal are implemented',()=>{assert(ui.includes('pendingConfirmations'));assert(ui.includes("d.localName==='details')d.open=true"));assert(ui.includes('preserveExternal:true'));});
test('UI CSS cannot target PDF glyphs',()=>{assert(!/\.textLayer|\.canvasWrapper|\bcanvas\s*[,{]/.test(css));});
test('local inspection does not collect text values or media',()=>{const source=fs.readFileSync(base+'content/inspector.js','utf8');for(const t of ['textContent','getImageData','toDataURL','.value','fetch('])assert(!source.includes(t));assert(boot.includes('"inspector.js"'));});
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(base+'content/inspector.js','utf8'),c);
test('contrast math recognizes opaque extremes and unknown interval',()=>{const I=c.TGInspector;assert.equal(I.ratio([255,255,255],[0,0,0]),21);assert.equal(I.ratio([20,20,20],[20,20,20]),1);assert.equal(I.lowerBound([100,100,100],[0,0,0],[255,255,255]),1);assert.equal(I.parse('rgba(30, 40, 50, 0.5)').a,.5);});
fs.writeFileSync(__dirname+'/ui-results.json',JSON.stringify({passed:checks.length,checks},null,2));console.log('2.2 UI/static/inspection groups:',checks.length);

