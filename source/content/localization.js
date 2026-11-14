/* TAIS Appearance localization runtime. */
var TGLocale = (() => {
 const LANGS=['zh-CN','en-US','ja-JP','ko-KR','fr-FR'];
 const NAMES={'auto':'Automatic (Zotero)','zh-CN':'简体中文','en-US':'English','ja-JP':'日本語','ko-KR':'한국어','fr-FR':'Français'};
 let messages={};try{const uri=Services.io.newURI(rootURI+'content/locales/messages.json');const req=new XMLHttpRequest();req.open('GET',uri.spec,false);req.send(null);if(req.status===0||req.status===200)messages=JSON.parse(req.responseText);}catch(e){try{Zotero.debug('[TAIS] locale resource unavailable: '+e);}catch{}}
 const getPref=()=>{try{const value=Zotero.Prefs.get('extensions.taisZoteroGlass.locale',true)||'auto';return ['auto',...LANGS].includes(value)?value:'auto';}catch{return 'auto';}};
 const setPref=value=>{if(!['auto',...LANGS].includes(value))throw new Error('Unsupported language');Zotero.Prefs.set('extensions.taisZoteroGlass.locale',value,true);};
 const normalize=raw=>{raw=String(raw||'').replace('_','-').toLowerCase();if(raw.startsWith('zh'))return 'zh-CN';if(raw.startsWith('ja'))return 'ja-JP';if(raw.startsWith('ko'))return 'ko-KR';if(raw.startsWith('fr'))return 'fr-FR';return 'en-US';};
 const current=()=>{const pref=getPref();if(pref!=='auto')return pref;return normalize(Zotero.locale||Services.locale?.appLocaleAsBCP47||'en-US');};
 const t=source=>{if(typeof source!=='string'||!source)return source;const lang=current(),dict=messages[lang]||messages['en-US']||{};if(dict[source]!==undefined)return dict[source];let out=source;const keys=Object.keys(dict).filter(k=>/[\u3400-\u9fff]/.test(k)&&k.length>1&&out.includes(k)).sort((a,b)=>b.length-a.length);for(const key of keys)out=out.split(key).join(dict[key]);return out;};
 const api={languages:LANGS,names:NAMES,get:getPref,current,set:setPref,t,coverage:lang=>Object.keys(messages[lang]||{}).length};try{addon.localization=api;}catch{}return api;
})();
