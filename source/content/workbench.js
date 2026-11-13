/* TAIS Glass workbench 1.2.0. Appearance settings only; no library/annotation writes. */
var TG_VERSION='2.4.0';
var TG_NUM={
 'window-opacity':{label:'浅色 · 窗口底色',section:'surface',value:8,min:0,max:100,unit:'%',css:'--tais-window-alpha'},
 'sidebar-opacity':{label:'分类与左右侧栏',section:'surface',value:12,min:0,max:100,unit:'%',css:'--tais-sidebar-alpha'},
 'panel-opacity':{label:'文献列表与详情',section:'surface',value:6,min:0,max:100,unit:'%',css:'--tais-panel-alpha'},
 'toolbar-opacity':{label:'标题栏与工具栏',section:'surface',value:14,min:0,max:100,unit:'%',css:'--tais-toolbar-alpha'},
 'card-opacity':{label:'卡片背景',section:'surface',value:42,min:10,max:100,unit:'%',css:'--tais-card-alpha'},
 'input-opacity':{label:'输入框与编辑控件',section:'surface',value:88,min:65,max:100,unit:'%',css:'--tais-input-alpha'},
 'popup-opacity':{label:'菜单与弹窗',section:'surface',value:94,min:75,max:100,unit:'%',css:'--tais-popup-alpha'},
 'dialog-opacity':{label:'独立对话窗口',section:'surface',value:82,min:40,max:100,unit:'%',css:'--tg-dialog-alpha'},
 'pdf-surround-opacity':{label:'PDF 页面外围',section:'reader',value:4,min:0,max:100,unit:'%',css:'--tais-pdf-surround-alpha'},
 'reader-card-opacity':{label:'左侧批注卡片',section:'reader',value:46,min:15,max:100,unit:'%',css:'--tg-reader-card-alpha'},
 'ai4paper-opacity':{label:'AI4Paper 与独立插件面板',section:'reader',value:40,min:15,max:100,unit:'%',css:'--tais-ai4paper-alpha'},
 'border-opacity':{label:'边框强度',section:'detail',value:18,min:0,max:60,unit:'%',css:'--tais-border-alpha'},
 'selection-opacity':{label:'选中状态',section:'detail',value:30,min:15,max:65,unit:'%',css:'--tais-selection-alpha'},
 'hover-opacity':{label:'悬停状态',section:'detail',value:9,min:3,max:25,unit:'%',css:'--tg-hover-alpha'},
 'corner-radius':{label:'卡片圆角',section:'detail',value:7,min:0,max:18,unit:'px',css:'--tg-radius'},
 'popup-blur':{label:'网页式浮层模糊',section:'detail',value:8,min:0,max:24,unit:'px',css:'--tg-popup-blur'},
 'focus-width':{label:'键盘焦点描边',section:'detail',value:2,min:1,max:4,unit:'px',css:'--tg-focus-width'}
};
var TG_BOOLS={'enabled':true,'apply-dialogs':true,'compat-ai4paper':true,'compat-other':true,'compat-awesome-gpt':true,'compat-ethereal-reference':true,'compat-ethereal-style':true,'compat-addon-market':true,'compat-attanger':true,'compat-linter':true,'strong-text':true,'subtle-stripes':false,'thin-scrollbars':true,'reduce-motion':false};
var TG_ENUM={'glass-theme':['auto','light','dark'],'render-engine':['native'],'material':['acrylic','mica','mica-alt'],'settings-density':['comfortable','compact']};
var TG_TEXT={'accent-color':'#527eb7','light-tint':'#f3f6fa','dark-tint':'#202936'};
var TG_ADAPTERS=[
 ['compat-ai4paper','AI4Paper','ai4paper-v2@cpc.dev','翻译、对话、概览及同源嵌入页面'],
 ['compat-awesome-gpt','Awesome GPT','zoterogpt@polygon.org','提示词、对话列表与引用浮层'],
 ['compat-ethereal-reference','Ethereal Reference','zoteroreference@polygon.org','文献关系与检索面板'],
 ['compat-ethereal-style','Ethereal Style','zoterostyle@polygon.org','页边批注与笔记卡片'],
 ['compat-addon-market','Add-on Market','zoteroAddons@ytshen.com','插件列表的背景与选择状态'],
 ['compat-attanger','Attanger','zoteroattanger@polygon.org','附件管理控件'],
 ['compat-linter','Linter','zotero-format-metadata@northword.cn','设置与表单控件']
];
for(const [k,v] of Object.entries(TG_NUM)){GLASS_NUMBERS[k]=v.value;VARS[k]=v.css;}
for(const [k,v] of Object.entries(TG_BOOLS))GLASS_FLAGS[k]=v;
var tgScopeWindows=new WeakSet();
function tgGet(k){const v=getPref(k);if(v!==undefined&&v!==null)return v;if(TG_NUM[k])return TG_NUM[k].value;if(k in TG_BOOLS)return TG_BOOLS[k];if(k in TG_TEXT)return TG_TEXT[k];return {'glass-theme':'auto','render-engine':'native','material':'acrylic','settings-density':'comfortable','reader-dark-mode':'native','interface-type-mode':'custom','annotation-type-mode':'custom'}[k];}
function tgValidate(k,v){if(TG_NUM[k]){v=Number(v);if(!Number.isFinite(v))throw new Error('无效数值：'+k);const s=TG_NUM[k];return Math.max(s.min,Math.min(s.max,Math.round(v)));}if(k in TG_BOOLS){if(typeof v!=='boolean')throw new Error('需要布尔值：'+k);return v;}if(TG_ENUM[k]){if(!TG_ENUM[k].includes(v))throw new Error('不支持的选项：'+k);return v;}if(k in TG_TEXT){if(!/^#[0-9a-f]{6}$/i.test(v))throw new Error('颜色必须为 #RRGGBB');return v;}throw new Error('不支持的设置：'+k);}
function tgSet(k,v){setPref(k,tgValidate(k,v));}
function tgSnapshot(){const d={};for(const k of [...Object.keys(TG_NUM),...Object.keys(TG_BOOLS),...Object.keys(TG_ENUM),...Object.keys(TG_TEXT)])d[k]=tgGet(k);return d;}
function tgApplyConfig(values){if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('配置不是对象');const clean={};for(const [k,v] of Object.entries(values))clean[k]=tgValidate(k,v);for(const [k,v] of Object.entries(clean))setPref(k,v);addon.mica.reapply();}
function tgRGB(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(' ');}
var tgOldApplyVars=applyGlassVars;
applyGlassVars=function(root){if(!root)return;tgOldApplyVars(root);for(const [k,s] of Object.entries(TG_NUM))root.style.setProperty(s.css,String(tgValidate(k,tgGet(k)))+s.unit);root.style.setProperty('--tg-light-custom',tgRGB(tgGet('light-tint')));root.style.setProperty('--tg-dark-custom',tgRGB(tgGet('dark-tint')));root.style.setProperty('--tg-accent-custom',tgGet('accent-color'));root.setAttribute('data-tg-stripes',tgGet('subtle-stripes')?'yes':'no');root.setAttribute('data-tg-thin-scroll',tgGet('thin-scrollbars')?'yes':'no');root.setAttribute('data-tg-reduce-motion',tgGet('reduce-motion')?'yes':'no');};
var tgOldClear=clearGlassVars;
clearGlassVars=function(root){tgOldClear(root);if(!root)return;for(const p of ['--tg-light-custom','--tg-dark-custom','--tg-accent-custom'])root.style.removeProperty(p);for(const a of ['data-tg-top','data-tg-dialog','data-tg-stripes','data-tg-thin-scroll','data-tg-reduce-motion'])root.removeAttribute(a);};
var tgNativeOriginal=configureNativeGlass;
configureNativeGlass=function(win,hwnd,material,theme){win.document.documentElement.setAttribute('data-tg-top','yes');win.document.documentElement.setAttribute('data-tg-dialog',Zotero.getMainWindows().includes(win)?'no':'yes');const result=tgNativeOriginal(win,hwnd,material,theme);result.engine='native';return result;};
// Presets are defined once in studio.js.
function tgEl(doc,tag,attrs={},text){const e=doc.createElementNS('http://www.w3.org/1999/xhtml',tag);for(const [k,v] of Object.entries(attrs)){if(v===undefined||v===null)continue;if(['hidden','disabled','checked','selected','multiple','readonly','required'].includes(k)){if(v)e.setAttribute(k,'');}else e.setAttribute(k,String(v));}if(text!==undefined)e.textContent=text;return e;}
function tgCopy(text){Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(text);}
async function tgExportReport(){const r=glassRuntimeReport();r.version=TG_VERSION;r.engine='native';r.settings=tgSnapshot();r.system={reduced:Zotero.getMainWindow().matchMedia('(prefers-reduced-transparency: reduce)').matches,forcedColors:Zotero.getMainWindow().matchMedia('(forced-colors: active)').matches};const dir=Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);dir.initWithPath(Zotero.DataDirectory.dir);for(const part of ['TAIS_Zotero_Glass','reports']){dir.append(part);if(!dir.exists())dir.create(Ci.nsIFile.DIRECTORY_TYPE,448);}dir.append('glass-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');await Zotero.File.putContentsAsync(dir.path,JSON.stringify(r,null,2));return {path:dir.path,report:r};}
var tgPreset;
function mountGlassWorkbench(win){return TGSettingsUI.mount(win);}
var TGWorkbench={mount:mountGlassWorkbench,snapshot:tgSnapshot,apply:tgApplyConfig,preset:tgPreset,exportReport:tgExportReport};
addon.workbench=TGWorkbench;
