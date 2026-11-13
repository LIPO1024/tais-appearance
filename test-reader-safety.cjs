const fs=require('fs'),assert=require('assert');
const root=__dirname+'/source/content/';
const reading=fs.readFileSync(root+'reading.js','utf8');
const css=fs.readFileSync(root+'typography.css','utf8')+'\n'+fs.readFileSync(root+'surface-130.css','utf8');
const tests=[];
function test(name,fn){fn();tests.push({name,passed:true});}
test('PDF.js native adapter is pinned to the validated engine version',()=>{assert(reading.includes("pdfjsLib?.version!=='5.7.0'"));});
test('No PDF raster pixel readback or pixel rewrite path exists',()=>{assert(!/getImageData|putImageData|drawImage\s*\(\s*[^,]*canvas/i.test(reading));});
test('No opacity/filter is applied to PDF canvas, text layer, or selection',()=>{assert(!/\.textLayer\s*\{|\.canvasWrapper\s*\{|canvas\s*\{[^}]*opacity\s*:/s.test(css));assert(!/textLayer[^}]*filter\s*:/s.test(css));});
test('Reader surface is limited to page surround and page paper background',()=>{assert(reading.includes('#viewerContainer'));assert(reading.includes('.pdfViewer .page{background-color:var(--tg-native-sheet)'));assert(!/\.textLayer|canvas\.tg-paper-composite|data-tg-paper-source/.test(css));});
test('Print restores white paper and white reader surround',()=>{assert(/@media print[\s\S]*?background:white!important/.test(reading));});
test('Forced colors and reduced transparency bypass the transparent surround',()=>{assert(reading.includes('(forced-colors:active)'));assert(reading.includes('(prefers-reduced-transparency:reduce)'));});
test('Safe Mode and disabled plugin block reader material',()=>{assert(reading.includes("get('safe-mode',false)!==true"));assert(reading.includes("get('enabled',true)"));});
test('Reader detach restores prior inline surface styles and removes listeners',()=>{assert(reading.includes('restoreViewport(s)'));assert(reading.includes("s.bus.off||s.bus._off"));assert(reading.includes("s.win.removeEventListener('pagehide',s.unload)"));});
test('Native rendering hooks are installed only for PDF.js 5.7.0 and removed on teardown',()=>{assert(reading.includes('s.native={proto,original,create,ownGet,ownCreate,contextHook,createHook}'));assert(reading.includes('removeNative(s)'));});
fs.writeFileSync(__dirname+'/reader-safety-results.json',JSON.stringify({passed:tests.length,tests},null,2));
console.log('Reader safety invariants: '+tests.length+' groups passed');
