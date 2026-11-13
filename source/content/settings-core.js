/* TAIS Glass 1.4 — validated appearance transactions. No library/document writes. */
var TGSettings = (() => {
 'use strict';
 const prefix='extensions.taisZoteroGlass.',journalKey=prefix+'recovery-journal',listeners=new Set(),past=[],future=[],limit=40;
 let previewSession=null;
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 let applying=false,revision=0,lastTab='appearance';
 function clean(values){
  if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('配置必须是设置对象。');
  const result=Object.create(null),ignored=[];
  for(const [k,original]of Object.entries(values)){
   if(!own(TG_NUM,k)&&!own(TG_BOOLS,k)&&!own(TG_ENUM,k)&&!own(TG_TEXT,k))throw new Error('不支持的设置：'+k);
   if(TG_NUM[k]?.hidden){ignored.push(k);continue;}
   let v=original;if(k==='paper-mode')v=v==='mist'?'native-glass':v==='original'?'background-only':v;
   if(own(TG_NUM,k)){
    const s=TG_NUM[k];if(typeof v!=='number'||!Number.isFinite(v)||!Number.isInteger(v))throw new Error(s.label+'：请输入整数。');
    if(v<s.min||v>s.max)throw new Error(s.label+'：范围为 '+s.min+'–'+s.max+s.unit+'。');
   }else if(own(TG_BOOLS,k)){if(typeof v!=='boolean')throw new Error('开关必须为 true / false：'+k);}
   else if(own(TG_ENUM,k)){if(!TG_ENUM[k].includes(v))throw new Error('不支持的选项：'+k);}
   else if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))throw new Error('颜色必须为 #RRGGBB：'+k);
   result[k]=v;
  }
  return {values:result,ignored};
 }
 function snapshot(){return tgSnapshot();}
 function emit(){revision++;for(const fn of listeners)try{fn();}catch(e){micalog('Settings observer',String(e));}}
 function profileRaw(){return getPref('saved-profiles')||'[]';}
 function rawPref(key){return Services.prefs.getStringPref(key,'');}
 function flushPrefs(){if(typeof Services.prefs.savePrefFile==='function')Services.prefs.savePrefFile(null);}
 function setJournal(value){if(value===null)Services.prefs.clearUserPref(journalKey);else Services.prefs.setStringPref(journalKey,JSON.stringify(value));flushPrefs();}
 function journalSnapshot(values,profiles){
  const before=Object.create(null),flags=Object.create(null);for(const k of Object.keys(values)){before[k]=tgGet(k);flags[k]=Services.prefs.prefHasUserValue(prefix+k);}
  return {schema:'tais-appearance-transaction/1',state:'pending',createdAt:new Date().toISOString(),before,flags,profilesBefore:profileRaw(),profileFlag:Services.prefs.prefHasUserValue(prefix+'saved-profiles')};
 }
 function clearJournal(){try{if(Services.prefs.prefHasUserValue(journalKey))Services.prefs.clearUserPref(journalKey);flushPrefs();}catch(e){micalog('TAIS journal cleanup failed',String(e));throw new Error('设置已应用，但恢复日志无法清除；为防止下次启动回滚，请勿关闭 Zotero，先检查诊断。');}}
 function write(values,profiles,options={}){
  if(applying)throw new Error('上一次设置尚未完成。');
  if(!options.skipJournal&&rawPref(journalKey))throw new Error('存在未完成的预览或恢复事务；未覆盖恢复日志。');
  const before=Object.create(null),flags=Object.create(null);for(const k of Object.keys(values)){before[k]=tgGet(k);flags[k]=Services.prefs.prefHasUserValue(prefix+k);}
  const oldProfiles=profileRaw(),profileFlag=Services.prefs.prefHasUserValue(prefix+'saved-profiles');
  let ownsJournal=false;
  if(!options.skipJournal&&!options.keepExistingJournal){setJournal(journalSnapshot(values,profiles));ownsJournal=true;}
  applying=true;let rollbackErrors=[];
  try{
   for(const [k,v]of Object.entries(values))if(tgGet(k)!==v)setPref(k,v);
   if(profiles!==undefined&&profiles!==oldProfiles)setPref('saved-profiles',profiles);
   if(Object.keys(values).length||profiles!==undefined){if(addon.mica.prefsDebounce){clearTimeout(addon.mica.prefsDebounce);addon.mica.prefsDebounce=null;}addon.mica.reapply();}
   for(const [k,v]of Object.entries(values))if(tgGet(k)!==v)throw new Error('设置写入校验失败：'+k);
   if(profiles!==undefined&&profileRaw()!==profiles)throw new Error('方案写入校验失败。');
   if(ownsJournal&&!options.keepJournal)clearJournal();else if(options.keepJournal)flushPrefs();
  }catch(error){
   for(const [k,v]of Object.entries(before))try{if(flags[k])setPref(k,v);else Services.prefs.clearUserPref(prefix+k);if(tgGet(k)!==v)throw new Error('read-back mismatch: '+k);}catch(e){rollbackErrors.push(String(e));}
   if(profiles!==undefined)try{if(profileFlag)setPref('saved-profiles',oldProfiles);else Services.prefs.clearUserPref(prefix+'saved-profiles');if(profileRaw()!==oldProfiles)throw new Error('profile read-back mismatch');}catch(e){rollbackErrors.push(String(e));}
   try{addon.mica.reapply();}catch(e){rollbackErrors.push('renderer: '+String(e));}
   if(ownsJournal&&!rollbackErrors.length)try{clearJournal();}catch(e){rollbackErrors.push(String(e));}
   if(rollbackErrors.length){setPref('safe-mode',true);setPref('enabled',false);micalog('TAIS transaction rollback incomplete; Safe Mode enabled',rollbackErrors.join('; '));throw new Error('设置失败且自动回滚未完全验证；已进入安全模式。原恢复日志已保留。原因：'+String(error));}
   throw error;
  }finally{applying=false;}
 }
 function recoverPending(){
  const raw=rawPref(journalKey);if(!raw)return true;let j;
  try{j=JSON.parse(raw);if(!j||j.schema!=='tais-appearance-transaction/1'||!['pending','committed'].includes(j.state)||!j.before||!j.flags||typeof j.before!=='object'||typeof j.flags!=='object')throw new Error('恢复日志结构无效');
   if(j.state==='committed'){clearJournal();return true;}
   if(raw.length>300000)throw new Error('恢复日志超限');
   const checked=clean(j.before);if(Object.keys(checked.values).some(k=>!own(j.flags,k)||typeof j.flags[k]!=='boolean'))throw new Error('恢复日志字段不完整');
   if(j.profilesBefore!==undefined&&(typeof j.profilesBefore!=='string'||typeof j.profileFlag!=='boolean'))throw new Error('个人方案恢复日志无效');
   for(const [k,v]of Object.entries(checked.values)){if(j.flags[k]===true)setPref(k,v);else if(j.flags[k]===false)Services.prefs.clearUserPref(prefix+k);else throw new Error('恢复标志无效：'+k);if(tgGet(k)!==v)throw new Error('恢复校验失败：'+k);}
   if(typeof j.profilesBefore==='string'){if(j.profileFlag===true)setPref('saved-profiles',j.profilesBefore);else if(j.profileFlag===false)Services.prefs.clearUserPref(prefix+'saved-profiles');else throw new Error('个人方案恢复标志无效');if(profileRaw()!==j.profilesBefore)throw new Error('个人方案恢复校验失败');}
   clearJournal();micalog('TAIS recovered interrupted appearance transaction',j.createdAt||'unknown');return true;
  }catch(e){try{setPref('safe-mode',true);setPref('enabled',false);setPref('recovery-error',String(e).slice(0,500));}catch{}micalog('TAIS recovery journal requires manual review',String(e));return false;}
 }
 function safeMode(){return getPref('safe-mode')===true;}
 function setSafeMode(value){
  if(typeof value!=='boolean')throw new Error('安全模式状态无效。');
  if(!value&&rawPref(journalKey))throw new Error('仍有未完成的恢复日志；请先恢复设置，不可直接退出安全模式。');
  if(value){
   setPref('safe-mode',true);setPref('enabled',false);
   const errors=[];for(const fn of [()=>addon.reading?.dispose(),()=>addon.darkPolicy?.dispose(),()=>addon.tools?.dispose(),()=>addon.focus?.dispose(),()=>addon.mica.restoreToAllWindows()])try{fn();}catch(e){errors.push(String(e));}
   if(errors.length){micalog('TAIS Safe Mode cleanup incomplete',errors.join('; '));throw new Error('安全模式已开启，但部分窗口清理失败；请重启 Zotero。'+errors.join('; '));}
  }else{
   setPref('safe-mode',false);try{Services.prefs.clearUserPref(prefix+'recovery-error');}catch{}
   try{addon.tools?.start();addon.mica.applyToAllWindows();}catch(e){setPref('safe-mode',true);setPref('enabled',false);try{addon.reading?.dispose();addon.darkPolicy?.dispose();addon.tools?.dispose();addon.focus?.dispose();addon.mica.restoreToAllWindows();}catch{}throw new Error('恢复外观失败，已重新进入安全模式：'+e);}
  }
  emit();return !safeMode();
 }
 function mutable(){
  if(safeMode())throw new Error('安全模式下不能修改外观或个人方案。');
  if(previewSession)throw new Error('请先确认或取消正在进行的预览。');
  if(rawPref(journalKey))throw new Error('恢复事务尚未完成；未覆盖原始日志。');
 }
 function beginPreview(values,label='外观预览'){
  mutable();const checked=clean(values),before=Object.create(null),after=Object.create(null),flags=Object.create(null);
  for(const [k,v]of Object.entries(checked.values))if(tgGet(k)!==v){before[k]=tgGet(k);after[k]=v;flags[k]=Services.prefs.prefHasUserValue(prefix+k);}
  if(!Object.keys(after).length)return {id:null,changes:0};
  write(after,undefined,{keepJournal:true});previewSession={id:String(Date.now())+'-'+(++revision),before,after,flags,showOriginal:false,label,startedAt:new Date().toISOString()};emit();
  return {id:previewSession.id,changes:Object.keys(after).length,label};
 }
 function previewCheck(id){const s=previewSession;if(!s||s.id!==id)throw new Error('预览会话已失效。');return s;}
 function comparePreview(id,original){
  const s=previewCheck(id);if(typeof original!=='boolean')throw new Error('无效对比状态。');
  const expected=s.showOriginal?s.before:s.after;if(Object.entries(expected).some(([k,v])=>tgGet(k)!==v))throw new Error('外观已由其他窗口更改；未覆盖。');
  if(s.showOriginal===original)return;write(original?s.before:s.after,undefined,{skipJournal:true});s.showOriginal=original;emit();
 }
 function commitPreview(id){
  const s=previewCheck(id),expected=s.showOriginal?s.before:s.after;
  if(Object.entries(expected).some(([k,v])=>tgGet(k)!==v))throw new Error('预览期间外观已变化；未覆盖其他修改。');
  if(s.showOriginal){write(s.after,undefined,{skipJournal:true});s.showOriginal=false;}
  const raw=rawPref(journalKey);if(!raw)throw new Error('预览恢复日志缺失。');
  const journal=JSON.parse(raw);if(journal.schema!=='tais-appearance-transaction/1'||!['pending','committed'].includes(journal.state))throw new Error('预览恢复日志无效。');
  journal.state='committed';setJournal(journal);clearJournal();remember({before:s.before,after:s.after,label:'应用 '+s.label});previewSession=null;emit();return true;
 }
 function cancelPreview(id,options={}){
  if(!previewSession)return false;const s=previewCheck(id||previewSession.id),expected=s.showOriginal?s.before:s.after,conflicts=Object.keys(expected).filter(k=>tgGet(k)!==expected[k]&&tgGet(k)!==s.before[k]);
  if(conflicts.length&&!options.preserveExternal)throw new Error('预览期间有外部修改；请检查或关闭设置窗口以保留外部修改。');
  const restore=Object.fromEntries(Object.entries(s.before).filter(([k])=>!conflicts.includes(k)));
  write(restore,undefined,{skipJournal:true});
  // Restore preference ownership as well as visible values, preserving inherited defaults.
  for(const k of Object.keys(restore))if(!s.flags[k]){Services.prefs.clearUserPref(prefix+k);if(tgGet(k)!==s.before[k])setPref(k,s.before[k]);}
  clearJournal();previewSession=null;emit();return true;
 }

 function remember(entry){
  const prev=past[past.length-1];
  if(entry.group&&prev?.group===entry.group&&entry.profilesAfter===undefined){
   for(const [k,v]of Object.entries(entry.before))if(!own(prev.before,k))prev.before[k]=v;
   Object.assign(prev.after,entry.after);prev.label=entry.label;
   for(const k of Object.keys(prev.after))if(prev.before[k]===prev.after[k]){delete prev.before[k];delete prev.after[k];}
   if(!Object.keys(prev.after).length)past.pop();
  }else{past.push(entry);if(past.length>limit)past.shift();}
  future.length=0;
 }
 function apply(values,options={}){
  if(safeMode())throw new Error('TAIS Appearance 正处于安全模式；请先检查恢复状态并退出安全模式。');
  if(previewSession)throw new Error('主题预览进行中；请先确认或取消，再修改其他设置。');
  const checked=clean(values),before=Object.create(null),after=Object.create(null);
  for(const [k,v]of Object.entries(checked.values))if(tgGet(k)!==v){before[k]=tgGet(k);after[k]=v;}
  if(!Object.keys(after).length)return {changes:0,ignored:checked.ignored};
  write(after);if(options.record!==false)remember({before,after,label:options.label||'调整外观',group:options.group||null});emit();
  return {changes:Object.keys(after).length,ignored:checked.ignored};
 }
 function traverse(from,to,reverse){
  mutable();
  const entry=from[from.length-1];if(!entry)return false;
  const expected=reverse?entry.after:entry.before,target=reverse?entry.before:entry.after;
  const expectedProfiles=reverse?entry.profilesAfter:entry.profilesBefore,targetProfiles=reverse?entry.profilesBefore:entry.profilesAfter;
  if(Object.entries(expected).some(([k,v])=>tgGet(k)!==v)||(expectedProfiles!==undefined&&profileRaw()!==expectedProfiles))throw new Error('这些设置已被其他窗口修改；为避免覆盖，未执行此操作。');
  if(previewSession)throw new Error('主题预览进行中；请先确认或取消。');
  write(target,targetProfiles);from.pop();to.push(entry);emit();return true;
 }
 function profiles(){
  let rows;try{rows=JSON.parse(profileRaw());}catch{throw new Error('已保存方案数据损坏；原数据已保留，未覆盖。');}
  if(!Array.isArray(rows)||rows.length>12)throw new Error('已保存方案格式不正确；原数据已保留。');
  return rows.map(p=>{if(!p||typeof p.name!=='string'||!p.name.trim()||p.name.length>32)throw new Error('方案名称无效；原数据已保留。');return {name:p.name,settings:clean(p.settings).values};});
 }
 function changeProfiles(rows,label){
  mutable();
  if(rows.length>12)throw new Error('最多保存 12 个个人方案。');
  const after=JSON.stringify(rows),before=profileRaw();if(after===before)return;
  write({},after);remember({before:{},after:{},profilesBefore:before,profilesAfter:after,label});emit();
 }
 function saveProfile(name,replace=false){
  name=String(name).trim();if(!name||name.length>32)throw new Error('方案名称应为 1–32 个字符。');
  const rows=profiles(),i=rows.findIndex(p=>p.name===name),p={name,settings:clean(snapshot()).values};
  if(i>=0&&!replace)throw new Error('同名方案已存在；请确认替换。');if(i>=0)rows[i]=p;else rows.push(p);changeProfiles(rows,'保存方案「'+name+'」');
 }
 function deleteProfile(name){const rows=profiles(),i=rows.findIndex(p=>p.name===name);if(i<0)throw new Error('方案已不存在。');rows.splice(i,1);changeProfiles(rows,'删除方案「'+name+'」');}
 function renameProfile(oldName,newName){
  newName=String(newName).trim();if(!newName||newName.length>32)throw new Error('方案名称应为 1–32 个字符。');const rows=profiles(),i=rows.findIndex(p=>p.name===oldName);if(i<0)throw new Error('方案已不存在。');
  if(rows.some((p,j)=>j!==i&&p.name===newName))throw new Error('已有同名方案。');rows[i].name=newName;changeProfiles(rows,'重命名方案');
 }
 function duplicateProfile(name,newName){
  mutable();newName=String(newName||'').trim();if(!newName||newName.length>32)throw new Error('新方案名称应为 1–32 个字符。');
  const rows=profiles(),p=rows.find(x=>x.name===name);if(!p)throw new Error('原方案已不存在。');if(rows.some(x=>x.name===newName))throw new Error('同名方案已存在。');
  rows.push({name:newName,settings:{...p.settings}});changeProfiles(rows,'复制方案「'+newName+'」');
 }
 function previewImport(text,scope='all'){
  if(typeof text!=='string'||text.length>50000)throw new Error('配置最多为 50,000 个字符。');let data;
  try{data=JSON.parse(text);}catch{throw new Error('JSON 格式不正确；没有修改任何设置。');}
  if(!data||!['tais-glass/1','tais-appearance/1'].includes(data.schema))throw new Error('这不是 TAIS Appearance / Glass 导出的配置。');
  const checked=clean(data.settings),changes=[];checked.values=scopeValues(checked.values,scope);
  for(const [k,v]of Object.entries(checked.values))if(tgGet(k)!==v)changes.push({key:k,label:TG_NUM[k]?.label||k,before:tgGet(k),after:v});
  return {values:checked.values,ignored:checked.ignored,changes};
 }
 function preset(name,preserveReading=true){const values={...tgPreset(name)};for(const k of ['interface-type-mode','annotation-type-mode','interface-text-size','annotation-text-size','annotation-leading'])delete values[k];if(preserveReading)for(const k of ['paper-mode','reader-dark-mode','paper-follow-surround','native-paper-opacity','pdf-surround-opacity','reader-background','reader-gradient','reader-background-fit','reader-background-opacity','reader-background-blur','reader-background-brightness'])delete values[k];return values;}
 function scopeValues(values,scope='all'){
  if(!['all','appearance','type','reading','background'].includes(scope))throw new Error('不支持的配置范围。');
  const kind=k=>k.startsWith('reader-background')||k==='reader-gradient'?'background':TG_NUM[k]?.section==='type'||['readable-ui','ui-bold-text','interface-type-mode','annotation-type-mode'].includes(k)?'type':['paper-mode','reader-dark-mode','paper-follow-surround','native-paper-opacity','pdf-surround-opacity','reader-card-opacity'].includes(k)?'reading':TG_NUM[k]?.section==='surface'||TG_NUM[k]?.section==='detail'||k in TG_TEXT||['glass-theme','material','render-engine','settings-density','strong-text','subtle-stripes','thin-scrollbars','reduce-motion'].includes(k)?'appearance':'other';
  return Object.fromEntries(Object.entries(values).filter(([k])=>scope==='all'||kind(k)===scope));
 }
 function defaults(){const values=tgPreset('balanced');values['window-opacity']=10;return values;}
 function diagnostics(){
  const main=Zotero.getMainWindow(),reading=addon.reading?.report?.()||[];
  return {schema:'tais-appearance-diagnostic/2',version:TG_VERSION,zotero:Zotero.version,time:new Date().toISOString(),settings:snapshot(),safeMode:safeMode(),recoveryPending:!!rawPref(journalKey),recoveryError:!!getPref('recovery-error'),previewActive:!!previewSession,lifecycle:{settingsSubscribers:listeners.size,settingsWindows:addon.workbench?.uiCount?.()??null,undo:past.length,redo:future.length},darkReading:addon.darkPolicy?.report?.(),toolWindows:(addon.tools?.report?.()||[]).map(r=>({kind:r.kind,nativeTop:r.nativeTop,rootBackground:r.rootBackground,cardBackground:r.cardBackground})),system:{forcedColors:main.matchMedia('(forced-colors:active)').matches,reducedTransparency:main.matchMedia('(prefers-reduced-transparency:reduce)').matches,reducedMotion:main.matchMedia('(prefers-reduced-motion:reduce)').matches},reading:reading.map(r=>({active:r.active,mode:r.mode,reason:r.reason,sheetOpacity:r.sheetOpacity,requestedSheetOpacity:r.requestedSheetOpacity,contrastGuard:r.paperContrastGuard,nativeEngine:r.version,overlays:r.overlays,hiddenSources:r.hiddenLegacySources,renderError:!!r.error,visibleCanvasCount:r.pages?.length||0})),background:{present:!!TGBackground.url,ready:TGBackground.ready,width:TGBackground.meta?.width||0,height:TGBackground.meta?.height||0,error:!!TGBackground.error}};
 }
 return {clean,snapshot,apply,preset,defaults,scopeValues,profiles,saveProfile,deleteProfile,renameProfile,duplicateProfile,previewImport,diagnostics,recoverPending,safeMode,setSafeMode,beginPreview,comparePreview,commitPreview,cancelPreview,get preview(){return previewSession?{id:previewSession.id,label:previewSession.label,startedAt:previewSession.startedAt,showOriginal:previewSession.showOriginal,changes:Object.keys(previewSession.after).length}:null;},
  exportConfig:(scope='all')=>JSON.stringify({schema:'tais-appearance/1',product:'TAIS Appearance',version:TG_VERSION,scope,settings:scopeValues(clean(snapshot()).values,scope)},null,2),
  undo:()=>traverse(past,future,true),redo:()=>traverse(future,past,false),
  history:()=>({undo:past.length,redo:future.length,undoLabel:past.at(-1)?.label||'',redoLabel:future.at(-1)?.label||''}),
  clearHistory(){past.length=0;future.length=0;emit();},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},notify:emit,
  get applying(){return applying;},get revision(){return revision;},
  get lastTab(){return lastTab;},set lastTab(v){lastTab=v;}
 };
})();
tgApplyConfig=function(values){return TGSettings.apply(values,{record:false});};
Object.assign(TGWorkbench,{apply:tgApplyConfig,commands:TGSettings});
addon.workbench=TGWorkbench;
