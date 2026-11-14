
var timer;
function install(){} function uninstall(){} function onMainWindowLoad(){} function onMainWindowUnload(){} function shutdown(){}
function startup(){const T=ChromeUtils.importESModule('resource://gre/modules/Timer.sys.mjs');timer=T.setTimeout(()=>run().catch(async error=>{await Zotero.File.putContentsAsync(OUT,JSON.stringify({passed:false,error:String(error),stack:String(error.stack)},null,2));}),4000);}
const EXPECTED=EXPECTED_DATA,OUT=OUTPUT_PATH,FIXTURE=FIXTURE_PATH;
async function run(){
 const T=ChromeUtils.importESModule('resource://gre/modules/Timer.sys.mjs'),sleep=ms=>new Promise(r=>T.setTimeout(r,ms));
 await Zotero.initializationPromise;
 if(String(Zotero.DataDirectory.dir).toLowerCase()!==EXPECTED.toLowerCase())throw Error('Data directory isolation check failed; no test actions performed');
 const result={schema:'tais-isolated-host/1',profileIsolated:true,os:'windows',zoteroVersion:Zotero.version,candidateVersion:null,tests:[],limitations:['No physical printing','No OS accessibility preference toggles','No eight-hour soak','No macOS host','No system DPI-setting changes'],passed:false};
 async function write(){await Zotero.File.putContentsAsync(OUT,JSON.stringify(result,null,2));}
 try{
  for(let i=0;i<60&&!Zotero.TAISZoteroGlass?.display;i++)await sleep(250);
  const a=Zotero.TAISZoteroGlass,win=Zotero.getMainWindow();
  if(!a?.display||!win)throw Error('Candidate display module did not start');
  result.candidateVersion=a.version;if(a.version!=='2.5.0beta1')throw Error('Wrong candidate');
  const prefs=JSON.stringify(a.workbench.snapshot());
  result.tests.push({name:'isolated candidate startup',passed:true,display:a.display.report()});await write();
  const item=await Zotero.Attachments.importFromFile({file:FIXTURE,libraryID:Zotero.Libraries.userLibraryID});
  await Zotero.Reader.open(item.id);
  function findPDF(doc,seen=new Set()){if(!doc||seen.has(doc))return null;seen.add(doc);if(String(doc.documentURI).startsWith('resource://zotero/reader/pdf/web/viewer.html'))return doc;for(const f of doc.querySelectorAll('browser,iframe')){try{const d=findPDF(f.contentDocument,seen);if(d)return d;}catch{}}return null;}
  let doc=null,raw=null,page=null;
  for(let i=0;i<100;i++){doc=findPDF(win.document);raw=doc?.defaultView?.wrappedJSObject;if(raw?.PDFViewerApplication?.pdfViewer?._pages?.[0]?.renderingState===3){page=raw.PDFViewerApplication.pdfViewer._pages[0];break;}await sleep(200);}
  if(!page?.canvas)throw Error('Original PDF did not finish rendering');
  function probe(){const v=raw.PDFViewerApplication.pdfViewer,p=v._pages[0],layer=doc.querySelector('.textLayer');return {dpr:win.devicePixelRatio,readerDpr:doc.defaultView.devicePixelRatio,scale:v.currentScale,canvasWidth:p.canvas?.width,canvasHeight:p.canvas?.height,pdfSourceMarker:result.pdfTextMarker===true,rendered:p.renderingState===3,singleCanvas:p.div.querySelectorAll('.canvasWrapper>canvas').length===1,opacity:doc.defaultView.getComputedStyle(p.canvas).opacity,filter:doc.defaultView.getComputedStyle(p.canvas).filter,overlays:doc.querySelectorAll('canvas.tg-paper-composite').length,display:a.display.report()};}
  result.pageDiagnostics={mode:raw.PDFViewerApplication.pdfViewer.textLayerMode,hasLayer:!!page.textLayer,html:page.div.outerHTML.slice(0,15000)};try{const pdfPage=Cu.waiveXrays(await raw.PDFViewerApplication.pdfDocument.getPage(1));const textData=Cu.waiveXrays(await pdfPage.getTextContent());result.pdfTextMarker=Array.from(textData.items,i=>Cu.waiveXrays(i).str).join(' ').includes('TAIS-DPI-ORIGINAL-20261114');}catch(e){result.extractionDiagnostic=String(e);}
  const first=probe();result.pdfjsVersion=raw.pdfjsLib?.version;result.tests.push({name:'original PDF native canvas rendered',passed:first.pdfSourceMarker&&first.rendered&&first.singleCanvas&&first.opacity==='1'&&first.filter==='none'&&first.overlays===0,state:first});await write();
  for(const scale of ['0.75','1','1.5','2']){raw.PDFViewerApplication.pdfViewer.currentScaleValue=scale;await sleep(1200);const state=probe();result.tests.push({name:'PDF.js native zoom '+scale,passed:state.pdfSourceMarker&&state.rendered&&state.singleCanvas&&state.opacity==='1'&&state.filter==='none'&&state.overlays===0&&Math.abs(state.scale-Number(scale))<.01,state});}
  result.tests.push({name:'native Zotero selection and clipboard',passed:null,status:'not-run',reason:'This Zotero host uses customAnnotationLayer and has no standard PDF.js textLayer; extraction is not selection.'});
  result.limitations.push('Native selection, clipboard and annotation editing need a Zotero-specific interaction probe');
  for(const [x,y] of MOVE_POINTS){win.resizeTo(900,700);win.moveTo(x,y);await sleep(1200);const state=probe();result.tests.push({name:'isolated window move',passed:state.pdfSourceMarker&&state.rendered&&state.singleCanvas&&state.opacity==='1'&&state.filter==='none'&&state.overlays===0,requested:{x,y},actual:{x:win.screenX,y:win.screenY},state});}
  // Safe Mode only changes this fresh test profile, never the user's profile.
  Zotero.Prefs.set('extensions.taisZoteroGlass.safe-mode',true,true);a.mica.applyToAllWindows();await sleep(500);
  result.tests.push({name:'Safe Mode suppresses display policy',passed:a.display.report().every(r=>r.policy.nativeMaterial===false),display:a.display.report()});
  Zotero.Prefs.set('extensions.taisZoteroGlass.safe-mode',false,true);a.mica.applyToAllWindows();await sleep(500);
  result.tests.push({name:'appearance preferences unchanged after test',passed:prefs===JSON.stringify(a.workbench.snapshot())});
  result.completedChecksPassed=result.tests.filter(t=>t.passed!==null).every(t=>t.passed);result.acceptanceComplete=false;result.passed=result.tests.every(t=>t.passed===true);await write();
 }catch(error){result.error=String(error);result.stack=String(error.stack);await write();}
 // Quit this isolated process only, after the guard confirmed its unique data directory.
 await sleep(300);Services.startup.quit(Ci.nsIAppStartup.eForceQuit);
}
