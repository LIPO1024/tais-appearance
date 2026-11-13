/* TAIS Appearance 2.0 settings UI. Scoped DOM, shared transactions, no PDF render mutations. */
var TGSettingsUI = (() => {
 const mounted=new Map();
 const GROUPS=[['appearance','外观'],['reading','阅读'],['background','背景'],['compatibility','兼容'],['profiles','方案']];
 const HELP={
  "interface-text-size": "设置与元数据文字；列表字号由 Zotero 控制。",
  "annotation-text-size": "批注与评论文字，不改变 PDF 字体。",
  "annotation-leading": "140% 为字号的 1.4 倍。",
  "window-opacity": "浅色窗口底色，越低越通透。",
  "dark-window-opacity": "深色窗口底色，保留可读性保护。",
  "sidebar-opacity": "分类栏与详情栏底色。",
  "panel-opacity": "文献列表与详情区底色。",
  "toolbar-opacity": "标题栏与工具栏底色。",
  "card-opacity": "普通卡片；批注卡片在“阅读”中调整。",
  "input-opacity": "普通输入框；元数据输入框单独设置。",
  "popup-opacity": "弹出菜单底色，建议保留足够遮挡。",
  "dialog-opacity": "独立设置窗口底色。",
  "native-paper-opacity": "纸底越低越透；实际值受对比保护约束。",
  "pdf-surround-opacity": "书页四周的底色。",
  "reader-card-opacity": "批注卡片底色，语义颜色保留。",
  "metadata-opacity": "元数据未编辑时的底色。",
  "metadata-focus-opacity": "输入时的底色与焦点边界。",
  "reader-background-opacity": "附加背景强度，不改变文字透明度。",
  "reader-background-blur": "仅模糊自选背景图片。",
  "reader-background-brightness": "100% 为原图亮度。",
  "ai4paper-opacity": "仅用于已识别的插件面板。",
  "popup-blur": "网页式浮层的模糊，不是系统材质半径。",
  "focus-width": "键盘焦点边框。",
  "corner-radius": "界面控件圆角。",
  "selection-opacity": "选中项底色。",
  "hover-opacity": "鼠标悬停底色。",
  "border-opacity": "分隔线与卡片边界。"
};
 function mount(win){
  const doc=win.document,host=doc.getElementById('tg-workbench');if(!host||mounted.has(win))return;
  let link=doc.getElementById('tg-workbench-style');if(!link){link=doc.createElementNS('http://www.w3.org/1999/xhtml','link');link.id='tg-workbench-style';link.rel='stylesheet';link.href=rootURI+'content/preferences.css';doc.documentElement.append(link);}
  doc.getElementById('tg-studio-style')?.remove();host.replaceChildren();host.dataset.ui='220';host.dataset.bound='yes';host.dataset.studio='yes';
  const initial=TGSettings.snapshot(),rows=[],blocks=[],controls=new Map(),timers=new Set(),cleanups=[],panels=new Map(),tabs=new Map(),templateButtons=[];
  let templateMode='all',importScope='all',activeThemePreview=null;const busyButtons=new Set(),pendingConfirmations=new Set();let commandRunning=false;
  let dead=false,activeTab=GROUPS.some(g=>g[0]===TGSettings.lastTab)?TGSettings.lastTab:'appearance',modifiedOnly=false,preserveReading=true,filter='',serial=0,profileSignature=null,previewData=null,bgBusy=false;
  const E=(tag,attrs={},text)=>{const localized={...attrs};for(const k of ['aria-label','aria-description','title','placeholder','alt'])if(typeof localized[k]==='string')localized[k]=TGLocale.t(localized[k]);return tgEl(doc,tag,localized,typeof text==='string'?TGLocale.t(text):text);};
  const later=(fn,ms)=>{const id=win.setTimeout(()=>{timers.delete(id);if(!dead)fn();},ms);timers.add(id);return id;};
  const cancel=id=>{if(id){win.clearTimeout(id);timers.delete(id);}};
  const notify=(text,error=false)=>{if(dead)return;message.textContent=TGLocale.t(text);message.dataset.error=String(error);footer.hidden=false;summary.hidden=true;};
  function button(label,handler,attrs={}){
   const b=E('button',{type:'button',...attrs},label);b.addEventListener('click',async()=>{
    if(dead||b.disabled||busyButtons.has(b))return;
    try{const result=handler();if(result&&typeof result.then==='function'){busyButtons.add(b);b.disabled=true;b.setAttribute('aria-busy','true');await result;}}
    catch(e){notify(e.message||String(e),true);}
    finally{if(busyButtons.delete(b)){b.disabled=false;b.removeAttribute('aria-busy');if(!dead)refresh();}}
   });return b;
  }
  function icon(name){const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','g-icon');const p=doc.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',({search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',undo:'M9 4 4 9l5 5M4 9h9a6 6 0 0 1 0 12',redo:'m15 4 5 5-5 5M20 9h-9a6 6 0 0 0 0 12',reset:'M3 11a9 9 0 1 1 3 8M3 4v7h7'})[name]||'');svg.append(p);return svg;}
  function confirmAction(title,description,yes='确认'){
   return new Promise(resolve=>{if(dead||pendingConfirmations.size){resolve(false);return;}
    const id='tg-confirm-'+(++serial),dialog=E('dialog',{class:'g-dialog','aria-labelledby':id,'aria-describedby':id+'-desc'}),h=E('h3',{id},title),text=E('p',{id:id+'-desc'},description),actions=E('div',{class:'g-actions'}),invoker=doc.activeElement;let done=false;
    const finish=value=>{if(done)return;done=true;pendingConfirmations.delete(finish);if(dialog.open)dialog.close();dialog.remove();if(!dead&&invoker?.isConnected)invoker.focus();resolve(value);};pendingConfirmations.add(finish);
    const no=button('取消',()=>finish(false)),ok=button(yes,()=>finish(true),{class:'g-primary'});actions.append(no,ok);dialog.append(h,text,actions);host.append(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});dialog.showModal();no.focus();
   });
  }
  function apply(values,label,group){const result=TGSettings.apply(values,{label,group});notify(result.changes?'已保存 · '+label:'数值未改变');return result;}
  const header=E('header',{class:'g-header'}),brand=E('div',{class:'g-brand'}),brandText=E('div',{class:'g-brand-text'});
  brand.append(E('img',{src:rootURI+'content/icons/tais-96.png',alt:'',width:28,height:28}),brandText);brandText.append(E('h2',{},'TAIS Appearance'));brand.title='Theatre AI Studio';
  const enabled=E('input',{type:'checkbox',role:'switch','data-setting':'enabled','aria-label':'启用 TAIS 外观'}),master=E('label',{class:'g-master'});master.append(E('span',{},'启用'),enabled);
  enabled.addEventListener('change',()=>{try{apply({enabled:enabled.checked},enabled.checked?'启用外观':'暂停外观');}catch(e){notify(e.message,true);refresh();}});
  header.append(brand,master);host.append(header);
  const toolbar=E('div',{class:'g-workbench-toolbar'}),quick=E('div',{class:'g-quick-controls',role:'group','aria-label':'界面明暗'}),quickLight=button('浅色',()=>apply({'glass-theme':'light'},'切换浅色'),{class:'g-quick'}),quickDark=button('深色',()=>apply({'glass-theme':'dark'},'切换深色'),{class:'g-quick'}),quickAuto=button('跟随系统',()=>apply({'glass-theme':'auto'},'跟随系统'),{class:'g-quick'}),commandOpen=button('命令面板',()=>openCommandPalette(),{class:'g-command-open','aria-haspopup':'dialog','aria-keyshortcuts':'Control+K',title:'命令面板 · Ctrl+K'});
  quick.append(quickLight,quickDark,quickAuto);toolbar.append(quick,commandOpen);host.append(toolbar);
  const summary=E('div',{class:'g-summary',id:'tg-summary'});host.append(summary);
  const searchBox=E('div',{class:'g-searchbar'}),searchWrap=E('div',{class:'g-search-wrap'}),search=E('input',{type:'search',id:'tg-search',placeholder:'搜索设置、功能或模板','aria-label':'搜索 TAIS Appearance 设置',autocomplete:'off'});
  const clearSearch=button('清除',()=>{search.value='';filter='';applyFilter();search.focus();},{class:'g-clear',hidden:true});searchWrap.append(icon('search'),search,clearSearch);const modified=button('本次修改',()=>{modifiedOnly=!modifiedOnly;modified.setAttribute('aria-pressed',String(modifiedOnly));applyFilter();},{'aria-pressed':'false',class:'g-filter'});searchBox.append(searchWrap,modified);host.append(searchBox);
  search.addEventListener('input',()=>{filter=search.value.trim().toLocaleLowerCase();applyFilter();});search.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();search.value='';filter='';applyFilter();}});
  const nav=E('nav',{class:'g-tabs',role:'tablist','aria-label':'外观设置分区','aria-orientation':'horizontal'}),body=E('div',{class:'g-panels'}),resultCount=E('p',{class:'g-results',role:'status','aria-live':'polite',hidden:true}),empty=E('p',{class:'g-empty',hidden:true},'没有匹配的设置。试试“纸底”“输入框”或“背景图片”。');host.append(nav,resultCount,body,empty);
  for(const [id,label]of GROUPS){const tab=button(label,()=>showTab(id),{id:'tg-tab-'+id,role:'tab','data-tab':id,'aria-controls':'tg-panel-'+id});const panel=E('section',{id:'tg-panel-'+id,class:'g-panel',role:'tabpanel','aria-labelledby':tab.id});const heading=E('h3',{class:'g-result-heading'},label);panel.append(heading);tabs.set(id,tab);panels.set(id,panel);nav.append(tab);body.append(panel);}
  nav.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const ids=GROUPS.map(x=>x[0]),i=ids.findIndex(id=>tabs.get(id)===doc.activeElement);if(i<0)return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?ids.length-1:(i+(e.key==='ArrowLeft'?-1:1)+ids.length)%ids.length;showTab(ids[j]);tabs.get(ids[j]).focus();});
  function showTab(id){activeTab=id;TGSettings.lastTab=id;search.value='';filter='';modifiedOnly=false;modified.setAttribute('aria-pressed','false');applyFilter();if(id==='compatibility')refreshAdapters();if(id==='reading'||id==='profiles')refreshRuntime();refresh();}
  function group(panel,title,description,advanced=false){const g=E(advanced?'details':'section',{class:'g-group'});if(title)g.append(E(advanced?'summary':'h3',{class:'g-group-title'},title));if(description)g.append(E('p',{class:'g-help'},description));panels.get(panel).append(g);return g;}
  function block(node,searchable,panel){node.classList.add('g-search-block');blocks.push({node,text:searchable.toLocaleLowerCase(),panel});return node;}
  function addRow(parent,key,label,help=''){
   const row=E('div',{class:'g-row',id:'tg-row-'+key,'data-key':key}),description=E('div',{class:'g-label'}),id='tg-field-'+key,lab=E('label',{for:id},label),small=E('small',{id:id+'-help'},help),error=E('span',{id:id+'-error',class:'g-field-error',role:'alert',hidden:true}),area=E('div',{class:'g-widget'});
   description.append(lab);small.hidden=!help;description.append(small,error);row.append(description,area);parent.append(row);const obj={row,key,label,help,id,area,error,inputs:[],panel:parent.closest('.g-panel')?.id?.replace('tg-panel-','')};rows.push(obj);controls.set(key,obj);return obj;
  }
  function rowError(r,text=''){r.error.textContent=TGLocale.t(text);r.error.hidden=!text;for(const e of r.inputs)e.setAttribute('aria-invalid',String(!!text));}
  function resetFor(r){const reset=button('复位',()=>{rowError(r);for(const e of r.inputs){e.dataset.editing='no';e.dataset.dirty='no';}apply({[r.key]:TGSettings.defaults()[r.key]},'复位 '+r.label);},{class:'g-reset','aria-label':r.label+'：恢复推荐值',title:'恢复推荐值'});r.area.append(reset);r.reset=reset;}
  function select(parent,key,label,options,help=''){
   const r=addRow(parent,key,label,help),input=E('select',{id:r.id,'data-setting':key,'aria-describedby':r.id+'-help'});for(const [value,text]of options)input.append(E('option',{value},text));input.addEventListener('change',()=>{try{apply({[key]:input.value},label);rowError(r);}catch(e){rowError(r,e.message);refresh();}});r.area.append(input);r.inputs=[input];return r;
  }
  function toggle(parent,key,label,help=''){
   const r=addRow(parent,key,label,help),input=E('input',{id:r.id,type:'checkbox',role:'switch','data-setting':key,'aria-describedby':r.id+'-help'});input.addEventListener('change',()=>{try{apply({[key]:input.checked},label);rowError(r);}catch(e){rowError(r,e.message);refresh();}});r.area.append(input);r.inputs=[input];return r;
  }
  function range(parent,key){
   const s=TG_NUM[key],label=s.label.replace(' · 越低越通透',''),r=addRow(parent,key,label,HELP[key]||''),wrap=E('div',{class:'g-range-controls'}),slider=E('input',{type:'range',id:r.id,min:s.min,max:s.max,step:1,'data-setting':key,'aria-label':label,'aria-describedby':r.id+'-help'}),number=E('input',{type:'number',id:'tg-num-'+key,min:s.min,max:s.max,step:1,'data-setting':key,'aria-label':label+'数值','aria-describedby':r.id+'-help',inputmode:'numeric'}),unit=E('span',{class:'g-unit'},s.unit);
   let pending=null,groupID=null;const begin=()=>{groupID=key+'-'+(++serial);};const commitRange=()=>{cancel(pending);pending=null;try{apply({[key]:Number(slider.value)},label,groupID);rowError(r);}catch(e){rowError(r,e.message);}slider.dataset.editing='no';};
   slider.addEventListener('pointerdown',begin);slider.addEventListener('focus',begin);
   slider.addEventListener('input',()=>{slider.dataset.editing='yes';number.value=slider.value;rowError(r);cancel(pending);pending=later(commitRange,75);});slider.addEventListener('change',()=>{commitRange();groupID=null;});slider.addEventListener('blur',()=>{if(pending)commitRange();groupID=null;});
   number.addEventListener('focus',()=>{number.dataset.editing='yes';});number.addEventListener('input',()=>{number.dataset.dirty='yes';rowError(r);});
   const commitNumber=()=>{if(number.dataset.dirty!=='yes'){number.dataset.editing='no';return;}try{if(number.value.trim()==='')throw new Error('请输入 '+s.min+'–'+s.max+' 之间的整数。');const value=Number(number.value);TGSettings.clean({[key]:value});number.dataset.editing='no';number.dataset.dirty='no';apply({[key]:value},label);rowError(r);}catch(e){rowError(r,e.message);number.dataset.editing='yes';}};
   number.addEventListener('change',commitNumber);number.addEventListener('blur',commitNumber);number.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commitNumber();}if(e.key==='Escape'){e.preventDefault();number.value=String(tgGet(key));number.dataset.dirty='no';number.dataset.editing='no';rowError(r);}});
   wrap.append(slider,number,unit);r.area.append(wrap);r.inputs=[slider,number];resetFor(r);return r;
  }
  const appearance=group('appearance','','');
  appearance.remove(); // Header mode buttons are the single control for this setting.
  const typeGroup=group('appearance','文字与可读性','界面与批注分别设置，PDF 字形保持原样。');
  toggle(typeGroup,'readable-ui','启用清晰排版','调整设置、元数据与批注的排版。');
  select(typeGroup,'interface-type-mode','界面排版方式',[['custom','自定义'],['native','跟随 Zotero 原生']],'原生模式跟随 Zotero。');
  range(typeGroup,'interface-text-size');
  select(typeGroup,'annotation-type-mode','批注排版方式',[['custom','自定义'],['native','跟随 Zotero 原生']],'原生模式保留字号、行距和折叠规则。');
  range(typeGroup,'annotation-text-size');range(typeGroup,'annotation-leading');
  const typeActions=E('div',{class:'g-actions'});typeActions.append(button('原生排版',()=>apply({'readable-ui':true,'interface-type-mode':'native','annotation-type-mode':'native'},'恢复原生排版')),button('舒适阅读',()=>apply({'readable-ui':true,'interface-type-mode':'custom','annotation-type-mode':'custom','interface-text-size':15,'annotation-text-size':16,'annotation-leading':160,'ui-bold-text':false},'舒适阅读排版')));typeGroup.append(typeActions);block(typeActions,'原生 排版 舒适 字体 native','appearance');
  toggle(typeGroup,'ui-bold-text','文字稍加粗','用于小字或低对比屏幕。不添加文字描边、阴影或锐化滤镜。');
  const contrastCheck=group('appearance','可读性检查','只读检查当前可见的设置文字和 Zotero 界面文字。玻璃底色无法等同真实桌面像素；结果给出保守范围，不替代人工阅读。',true),contrastOutput=E('div',{class:'g-contrast-results',role:'status','aria-live':'polite'});
  function renderContrast(){contrastOutput.replaceChildren(E('p',{class:'g-help'},'展开后点击检查。不会读取文献正文或改动任何设置。'));}
  function runContrast(){const result=TGInspector.inspect([doc,Zotero.getMainWindow().document]);contrastOutput.replaceChildren();for(const row of result.rows){const el=E('div',{class:'g-contrast-row'});el.append(E('strong',{},row.region),E('span',{},row.fontSize+' · '+(row.lowerBound===null?'未计算':row.lowerBound.toFixed(2)+':1 下限')),E('span',{class:row.lowerBound>=4.5?'g-contrast-pass':'g-contrast-warn'},row.note));contrastOutput.append(el);}if(!result.rows.length)contrastOutput.append(E('p',{class:'g-help'},'当前没有可见的受检界面文字。'));notify('只读检查完成；未检查 PDF 正文。');}
  contrastCheck.append(contrastOutput,button('检查当前界面',runContrast));renderContrast();block(contrastCheck,'对比度 可读性 检查 contrast WCAG','appearance');
  const typeSample=E('div',{class:'g-type-sample'});typeSample.append(E('strong',{},'清晰阅读 · Read with clarity'),E('p',{},'原文、解释与判断，各有层次。正文保持完整字形；辅助信息仍然清楚。'));typeGroup.append(typeSample);block(typeSample,'字体 排版 行距 可读性 font typography','appearance');
  const gallery=group('appearance','12 套 Glass 模板','6 浅色 · 6 深色 · 字号与阅读偏好独立。');
  const retain=E('input',{type:'checkbox',checked:true,id:'tg-preserve-reading'}),retainLabel=E('label',{class:'g-retain',for:retain.id});retainLabel.append(retain,E('span',{},'切换模板时保留阅读与背景设置'));gallery.append(retainLabel);retain.addEventListener('change',()=>{preserveReading=retain.checked;refresh();});
  const templateFilters=E('div',{class:'g-actions g-template-filters',role:'group','aria-label':'筛选外观模板'});
  for(const [value,label]of [['all','全部 12'],['light','浅色 6'],['dark','深色 6']]){const f=button(label,()=>{templateMode=value;for(const x of templateFilters.children)x.setAttribute('aria-pressed',String(x.dataset.mode===value));applyFilter();},{'data-mode':value,'aria-pressed':String(value==='all')});templateFilters.append(f);}gallery.append(templateFilters);
  const previewTray=E('section',{class:'g-preview-tray',hidden:true,'aria-label':'外观预览'}),previewLabel=E('p',{class:'g-preview-label',role:'status'}),previewActions=E('div',{class:'g-actions'}),previewDiff=E('details',{class:'g-preview-diff'}),previewDiffTitle=E('summary',{},'查看更改'),previewDiffRows=E('div');let previewInvoker=null;
  const previewCompare=button('查看调整前',()=>{if(!activeThemePreview)return;TGSettings.comparePreview(activeThemePreview.id,!TGSettings.preview.showOriginal);refresh();},{class:'g-preview-compare'});
  const previewCancel=button('取消预览',()=>finishPreview(false),{class:'g-preview-cancel'}),previewCommit=button('确认应用',()=>finishPreview(true),{class:'g-primary g-preview-commit'});
  previewActions.append(previewCompare,previewCancel,previewCommit);previewDiff.append(previewDiffTitle,previewDiffRows);previewTray.append(previewLabel,previewActions,previewDiff);host.insertBefore(previewTray,body);
  const locked=new Map();
  function restorePreviewControls(){for(const [el,old]of locked)if(el.isConnected)el.disabled=old;locked.clear();delete host.dataset.previewing;}
  function lockPreviewControls(){
   const session=TGSettings.preview,owner=!!activeThemePreview&&activeThemePreview.id===session?.id;
   previewTray.hidden=!session;previewActions.hidden=!owner;previewDiff.hidden=!owner;
   if(session){host.dataset.previewing='true';previewLabel.textContent=TGLocale.t((owner?(session.showOriginal?'正在查看调整前 · ':'正在预览 · '):'另一设置窗口正在预览 · ')+session.label);previewCompare.textContent=TGLocale.t(session.showOriginal?'返回预览':'查看调整前');}
   for(const el of host.querySelectorAll('button,input,select,textarea')){
    const previewBlocked=!!session&&!previewTray.contains(el)&&!nav.contains(el);
    if(previewBlocked||busyButtons.has(el)){locked.set(el,el.disabled);el.disabled=true;}
   }
  }
  function finishPreview(commit){
   if(!activeThemePreview)return;const name=activeThemePreview.name,id=activeThemePreview.id;
   if(commit)TGSettings.commitPreview(id);else TGSettings.cancelPreview(id);
   activeThemePreview=null;restorePreviewControls();refresh();if(previewInvoker?.isConnected)previewInvoker.focus();notify(commit?'已应用 '+name+' · 可撤销':'已取消预览，恢复原外观。');
  }
  function startPreview(values,name){
   if(TGBackground.busy)throw new Error('背景图片正在处理，完成后再预览。');
   if(commandDialog?.open)closeCommand(false);const checked=TGSettings.clean(values).values,before=TGSettings.snapshot(),result=TGSettings.beginPreview(checked,name);
   if(!result.id){notify('当前设置已与「'+name+'」一致。');return;}
   activeThemePreview={id:result.id,name};previewInvoker=doc.activeElement;previewDiffRows.replaceChildren();let n=0;
   for(const [k,v]of Object.entries(checked))if(before[k]!==v){n++;const row=E('div',{class:'g-diff'});row.append(E('span',{},controls.get(k)?.label||TG_NUM[k]?.label||k),E('code',{},String(before[k])+' → '+String(v)));previewDiffRows.append(row);}
   previewDiffTitle.textContent=TGLocale.t('查看 '+n+' 项更改');refresh();previewTray.scrollIntoView({block:'nearest'});previewCancel.focus();notify('预览期间其他修改暂停。确认应用或取消恢复。');
  }
  function startTemplatePreview(t){startPreview(TGSettings.preset(t.id,preserveReading),'主题「'+t.name+'」');}
  const templateGrid=E('div',{class:'g-template-grid'});gallery.append(templateGrid);
  for(const t of TG_TEMPLATES){const b=button('',()=>startTemplatePreview(t),{class:'g-template','data-template-id':t.id,'aria-pressed':'false','aria-label':t.name+'：'+t.description});b.style.setProperty('--swatch',t.tone);b.dataset.tone=t.theme;const preview=tgPreset(t.id),isDark=t.theme==='dark',tint=preview[isDark?'dark-tint':'light-tint'];b.style.setProperty('--tpl-rgb',tgRGB(tint));b.style.setProperty('--tpl-window',(preview[isDark?'dark-window-opacity':'window-opacity']/100));b.style.setProperty('--tpl-side',preview['sidebar-opacity']/100);b.style.setProperty('--tpl-card',preview['card-opacity']/100);b.style.setProperty('--tpl-radius',preview['corner-radius']+'px');b.style.setProperty('--tpl-accent',preview['accent-color']);
   const mini=E('span',{class:'g-template-mini','aria-hidden':'true'});mini.append(E('i',{class:'g-mini-sidebar'}),E('i',{class:'g-mini-paper'}),E('i',{class:'g-mini-note'}),E('span',{class:'g-mini-type'},'Aa · 文'),E('span',{class:'g-mini-mode'},isDark?'深色':'浅色'));b.append(mini,E('strong',{},t.name),E('span',{class:'g-template-description'},t.description),E('span',{class:'g-template-metrics'},'窗底 '+preview[isDark?'dark-window-opacity':'window-opacity']+'% · 卡片 '+preview['card-opacity']+'%'),E('span',{class:'g-template-check','aria-hidden':'true'},'✓'));templateGrid.append(b);templateButtons.push({button:b,template:t});block(b,t.name+' '+t.description+' 模板 glass preset acrylic theme','appearance');}
  const compare=group('appearance','主题对比','比较参数，不应用主题。',true);
  const compareLine=E('div',{class:'g-theme-compare-controls'}),compareA=E('select',{'aria-label':'第一套对比主题'}),compareB=E('select',{'aria-label':'第二套对比主题'}),compareOut=E('div',{class:'g-theme-compare','aria-live':'polite'});
  for(const t of TG_TEMPLATES){compareA.append(E('option',{value:t.id},t.name));compareB.append(E('option',{value:t.id},t.name));}
  compareA.value='balanced';compareB.value='graphite';compareLine.append(compareA,compareB);compare.append(compareLine,compareOut);
  function renderThemeCompare(){const a=TG_TEMPLATES.find(t=>t.id===compareA.value),b=TG_TEMPLATES.find(t=>t.id===compareB.value);if(!a||!b)return;const av=tgPreset(a.id),bv=tgPreset(b.id),keys=['window-opacity','dark-window-opacity','sidebar-opacity','panel-opacity','toolbar-opacity','card-opacity','input-opacity','popup-opacity','border-opacity','corner-radius'];compareOut.replaceChildren();const headings=E('div',{class:'g-theme-compare-row g-compare-head'});headings.append(E('strong',{},'设置'),E('strong',{},a.name),E('strong',{},b.name),E('span',{},'差异'));compareOut.append(headings);for(const k of keys){const x=av[k],y=bv[k];if(x===undefined&&y===undefined)continue;const row=E('div',{class:'g-theme-compare-row'});row.append(E('span',{},TG_NUM[k]?.label||k),E('code',{},String(x??'—')),E('code',{},String(y??'—')),E('span',{class:x===y?'g-diff-equal':'g-diff-change'},x===y?'相同':'不同'));compareOut.append(row);}compareOut.append(E('p',{class:'g-help'},a.theme===b.theme?'同一明暗体系。':'跨浅深色比较；文字排版和个人阅读背景不会因模板对比而改变。'));}
  compareA.addEventListener('change',renderThemeCompare);compareB.addEventListener('change',renderThemeCompare);renderThemeCompare();block(compare,'主题 对比 比较 差异 template compare','appearance');
  const scenes=group('appearance','工作场景','只调整外观，可预览、可撤销。');
  const sceneGrid=E('div',{class:'g-scene-grid'}),sceneDefs=[
   {name:'学术精读',desc:'更稳定的阅读外围与批注卡片',values:{'reader-card-opacity':58,'pdf-surround-opacity':10,'metadata-opacity':28,'metadata-focus-opacity':56,'hover-opacity':7,'reduce-motion':true}},
   {name:'研究工作',desc:'列表、元数据与交互层次均衡',values:{'reader-card-opacity':54,'pdf-surround-opacity':8,'metadata-opacity':30,'metadata-focus-opacity':58,'hover-opacity':9}},
   {name:'写作整理',desc:'收敛辅助视觉，突出文本和选中状态',values:{'reader-card-opacity':52,'pdf-surround-opacity':6,'metadata-opacity':26,'metadata-focus-opacity':54,'hover-opacity':6,'reduce-motion':true}}
  ];
  for(const scene of sceneDefs){const card=E('div',{class:'g-scene-card'});card.append(E('strong',{},scene.name),E('p',{class:'g-help'},scene.desc),button('预览场景',()=>startPreview(scene.values,'场景「'+scene.name+'」')));sceneGrid.append(card);}scenes.append(sceneGrid);block(sceneGrid,'场景 学术精读 研究 写作 阅读工作环境','appearance');
  const surfaces=group('appearance','分区底色','数值越低越通透，文字保持清楚。',true);
  for(const key of ['window-opacity','dark-window-opacity','sidebar-opacity','panel-opacity','toolbar-opacity','card-opacity','input-opacity','popup-opacity','dialog-opacity'])range(surfaces,key);
  const details=group('appearance','颜色与交互细节','调整强调色、边界与操作状态。',true);
  select(details,'settings-density','设置密度',[['comfortable','舒适'],['compact','紧凑']],'仅调整此设置面板的间距，不改变阅读字号。');
  for(const [key,label]of [['light-tint','浅色着色'],['dark-tint','深色着色'],['accent-color','交互强调色']]){const r=addRow(details,key,label,'只改变控件与界面色调，不改变 PDF 原文。'),input=E('input',{type:'color',id:r.id,'data-setting':key,'aria-label':label});input.addEventListener('change',()=>{try{apply({[key]:input.value},label);rowError(r);}catch(e){rowError(r,e.message);refresh();}});r.area.append(input);r.inputs=[input];resetFor(r);}
  for(const key of ['border-opacity','selection-opacity','hover-opacity','corner-radius','popup-blur','focus-width'])range(details,key);
  for(const [key,label,help]of [['strong-text','辅助文字保持清晰','不靠降低整组文字透明度制造层级。'],['subtle-stripes','轻微隔行区分','保留选中、悬停与焦点的区别。'],['thin-scrollbars','细滚动条','仍保留可见的滚动滑块。'],['reduce-motion','减少界面动画','同时尊重系统的减少动态效果设置。']])toggle(details,key,label,help);
  const reading=group('reading','纸面与正文','调整纸底，不叠加文字或替代画布。');
  select(reading,'paper-mode','纸面模式',[['native-glass','透明纸底 · 原生文字'],['background-only','原纸底 · 只透外围']],'扫描图片、PDF 自带实色块或不支持的引擎版本会保留原底。');
  select(reading,'reader-dark-mode','深色阅读配色',[['native','跟随 Glass · Zotero 原生深色'],['preserve','保留原阅读配色']],'深色时用原生浅字深底，不加反色滤镜；浅色恢复原方案。原生主题可能调节图片亮度。');
  toggle(reading,'paper-follow-surround','纸底接近外围','目标为外围不透明度加 12 个百分点。对比保护可能提高实际底色；文字和图片不淡化。');
  range(reading,'native-paper-opacity');
  const readerStatus=E('div',{id:'tg-reader-status',class:'g-runtime',role:'status'});reading.append(readerStatus);
  block(readerStatus,'阅读 pdf 纸底 原生 正文 状态 对比度','reading');
  const demo=E('figure',{class:'g-preview','aria-label':'透明层示意，不是实际 PDF 截图'}),demoPaper=E('div',{class:'g-preview-paper'},'Reading\n文字保持原生清晰'),demoSide=E('div',{class:'g-preview-note'},'界面底色'),caption=E('figcaption',{},'透明层示意 · 不替代实际阅读效果');demo.append(demoPaper,demoSide,caption);reading.append(demo);block(demo,'阅读 纸面 预览 preview','reading');
  const readControls=group('reading','阅读界面与元数据');for(const key of ['pdf-surround-opacity','reader-card-opacity','metadata-opacity','metadata-focus-opacity'])range(readControls,key);
  const background=group('background','阅读背景','本地处理，不上传。');
  select(background,'reader-background','背景来源',[['glass','桌面 Glass'],['builtin','舞台雾光 · 随明暗切换'],['gradient','柔和渐变'],['image','自选图片']],'桌面 Glass 不需要额外图片。');
  const builtIn=E('div',{class:'g-default-background'}),builtPreview=E('div',{class:'g-default-preview','aria-label':'雾光默认背景预览'});builtIn.append(builtPreview,E('strong',{},'舞台雾光 · Stage Mist'),E('p',{class:'g-help'},'舞台侧光，安静中央；随明暗切换。'),button('使用推荐背景',()=>apply({'reader-background':'builtin','reader-background-opacity':28},'使用内置雾光')));background.append(builtIn);block(builtIn,'默认 背景 雾光 mistlight 内置','background');
  select(background,'reader-gradient','渐变方案',[['mist','雾蓝'],['forest','林间'],['sand','暖沙'],['night','夜色'],['violet','雾紫']],'仅用于柔和渐变。');
  select(background,'reader-background-fit','图片铺放',[['cover','铺满 · 等比裁切'],['contain','完整显示'],['tile','平铺']],'仅用于本地图片。');
  for(const key of ['reader-background-opacity','reader-background-blur','reader-background-brightness'])range(background,key);
  const bgBox=E('div',{class:'g-background-box'}),thumbnail=E('div',{class:'g-background-thumb','aria-label':'本地背景预览'}),bgName=E('p',{class:'g-help',id:'tg-bg-name'}),picker=E('input',{type:'file',id:'tg-background-file',accept:'image/png,image/jpeg,image/webp','aria-label':'选择本地背景图片'}),bgActions=E('div',{class:'g-actions'});
  const removeBackground=button('移除图片',async()=>{if(bgBusy)return;if(!await confirmAction('移除阅读背景？','只移除插件保存的副本，原始图片不受影响。图片文件操作不属于外观参数撤销。','移除'))return;await backgroundOperation(async()=>{await TGBackground.clear();if(dead)return;apply({'reader-background':'glass'},'移除背景并使用桌面 Glass');});});
  bgActions.append(removeBackground);bgBox.append(thumbnail,E('strong',{},'选择或拖入图片'),E('p',{class:'g-help'},'JPG / PNG / WebP · 最大 12 MB · 自动缩至最长边 2048 像素'),picker,bgName,bgActions);background.append(bgBox);block(bgBox,'本地 图片 导入 移除 上传 背景 file png jpg webp','background');
  async function backgroundOperation(fn){if(dead||TGSettings.preview||TGSettings.safeMode()){notify('预览或安全模式下不替换背景文件。',true);return;}if(bgBusy||TGBackground.busy){notify('正在处理上一张图片，请勿重复提交。');return;}bgBusy=true;refresh();try{await fn();notify('背景已保存。原图和 PDF 不变。');}catch(e){notify('背景操作未完成：'+e.message,true);}finally{bgBusy=false;if(!dead){picker.value='';refresh();}}}
  const importImage=file=>backgroundOperation(async()=>{const source=tgGet('reader-background');await TGBackground.importFile(win,file,()=>!dead&&!TGSettings.preview&&!TGSettings.safeMode()&&source===tgGet('reader-background'));if(dead)return;apply({'reader-background':'image'},'使用本地背景');});picker.addEventListener('change',()=>{if(picker.files?.[0])importImage(picker.files[0]);});
  bgBox.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files')){e.preventDefault();bgBox.dataset.drag='true';}});bgBox.addEventListener('dragleave',()=>delete bgBox.dataset.drag);bgBox.addEventListener('drop',e=>{e.preventDefault();delete bgBox.dataset.drag;if(e.dataTransfer?.files?.length!==1){notify('每次请选择一张图片。',true);return;}importImage(e.dataTransfer.files[0]);});
  const compatibility=group('compatibility','窗口与插件','启用状态不等于已完成兼容验收。');
  const safeRow=E('div',{class:'g-safe-mode-row'}),safeStatus=E('span',{class:'g-safe-mode-status',role:'status'}),safeEnter=button('进入安全模式',()=>{TGSettings.setSafeMode(true);refresh();notify('安全模式已启用：恢复原生界面，不应用外观材质。');},{class:'g-safe-enter'}),safeExit=button('退出安全模式',()=>{TGSettings.setSafeMode(false);refresh();notify('安全模式已退出；请检查外观后再启用。');},{class:'g-safe-exit'});safeRow.append(E('strong',{},'安全模式'),safeStatus,safeEnter,safeExit);compatibility.append(safeRow);block(safeRow,'安全模式 原生恢复 safe mode recovery','compatibility');
  toggle(compatibility,'apply-dialogs','独立窗口使用 Glass','仅处理已识别的 Zotero 窗口，不修改系统全局透明度。');
  toggle(compatibility,'keep-inactive','失焦时保留材质','不抢键盘焦点。高对比度、省电和系统透明设置仍优先。');
  toggle(compatibility,'compat-other','启用已识别插件的适配','遇到第三方插件显示问题，可单独关闭它的适配。');range(compatibility,'ai4paper-opacity');
  const adapterGroup=group('compatibility','插件适配开关');const adapterRows=[];
  for(const [key,name,id,help]of TG_ADAPTERS){const r=toggle(adapterGroup,key,name,help),state=E('small',{class:'g-adapter-state'},'状态未读取');r.row.querySelector('.g-label').append(state);adapterRows.push({row:r,id,state,installed:null});}
  let adapterBusy=false;async function refreshAdapters(){if(adapterBusy)return;adapterBusy=true;try{const am=ChromeUtils.importESModule('resource://gre/modules/AddonManager.sys.mjs').AddonManager;await Promise.all(adapterRows.map(async x=>{try{const a=await am.getAddonByID(x.id);if(dead)return;x.installed=!!a;x.state.textContent=TGLocale.t(a?(a.isActive?'已启用':'已停用')+' · '+a.version+' · 未逐界面验收':'未安装');}catch{x.state.textContent=TGLocale.t('状态读取失败，可重试');}}));}finally{adapterBusy=false;if(!dead)refresh();}}
  adapterGroup.append(button('刷新插件状态',refreshAdapters));
  const engine=group('compatibility','高级材质兼容','12 套模板均为 Acrylic；以下其他材质只保留给兼容排查。',true);select(engine,'material','渲染材质',[['acrylic','Acrylic · Glass'],['mica','Mica · 兼容选项'],['mica-alt','Mica Alt · 兼容选项']],'选择 Mica 后不再是同一种 Glass 透明效果。');
  const profileGroup=group('profiles','我的方案','最多 12 个方案，不包含背景图片文件。'),saveLine=E('div',{class:'g-save-line'}),profileName=E('input',{type:'text',id:'tg-profile-name',maxlength:32,placeholder:'方案名称','aria-label':'方案名称'}),profileList=E('div',{class:'g-profile-list'});
  const save=button('保存当前方案',async()=>{const name=profileName.value.trim();const exists=TGSettings.profiles().some(p=>p.name===name);if(exists&&!await confirmAction('替换同名方案？','将更新「'+name+'」保存的外观参数，之后仍可撤销。','替换'))return;TGSettings.saveProfile(name,exists);profileName.value='';notify('方案已保存。');});saveLine.append(profileName,save);profileGroup.append(saveLine,profileList);block(profileGroup,'方案 保存 重命名 删除 profile','profiles');
  function refreshProfiles(){const raw=getPref('saved-profiles')||'[]';if(profileSignature===raw)return;profileSignature=raw;profileList.replaceChildren();try{const entries=TGSettings.profiles();if(!entries.length){profileList.append(E('p',{class:'g-help'},'尚无个人方案。调整满意后可保存，之后一键恢复。'));return;}for(const p of entries){const row=E('div',{class:'g-profile-row'}),name=E('strong',{},p.name),actions=E('div',{class:'g-actions'});actions.append(button('预览应用',()=>startPreview(p.settings,'方案「'+p.name+'」')),button('复制',()=>{const candidate=(p.name+' 副本').slice(0,32);const input=E('input',{type:'text',maxlength:32,'aria-label':'复制方案名称',value:candidate}),ok=button('保存副本',()=>{TGSettings.duplicateProfile(p.name,input.value);notify('已保存独立副本，可撤销。');}),cancelCopy=button('取消',()=>{profileSignature=null;refreshProfiles();});row.replaceChildren(input,ok,cancelCopy);input.focus();input.select();}),button('改名',()=>{const input=E('input',{type:'text',maxlength:32,'aria-label':'新的方案名称',value:p.name}),rename=button('确定',()=>{TGSettings.renameProfile(p.name,input.value);notify('方案已重命名。');}),cancelRename=button('取消',()=>{profileSignature=null;refreshProfiles();});row.replaceChildren(input,rename,cancelRename);input.focus();input.select();}),button('删除',async()=>{if(await confirmAction('删除方案？','删除「'+p.name+'」；不会修改当前外观，可通过“撤销”恢复。','删除')){TGSettings.deleteProfile(p.name);notify('方案已删除，可撤销。');}}));row.append(name,actions);profileList.append(row);}}catch(e){profileList.append(E('p',{class:'g-field-error'},e.message));}}
  const transfer=group('profiles','导入与备份','验证差异后应用。',true),transferActions=E('div',{class:'g-actions'}),importText=E('textarea',{id:'tg-config',rows:5,maxlength:50000,placeholder:'粘贴 TAIS Appearance JSON 配置','aria-label':'导入配置 JSON'}),importPreview=E('div',{id:'tg-import-preview',class:'g-import-preview'}),importApply=button('应用已验证配置',()=>{if(!previewData||previewData.text!==importText.value||previewData.scope!==importScope)throw new Error('配置已变动，请重新验证。');const current=TGSettings.previewImport(importText.value,importScope);if(JSON.stringify(current.changes)!==JSON.stringify(previewData.changes))throw new Error('外观在验证后已改变；请重新查看差异。');apply(current.values,'导入配置');previewData=null;importApply.disabled=true;notify('配置已导入，可撤销。');},{class:'g-primary',disabled:true});
  const validate=button('验证并查看差异',()=>{previewData=null;importApply.disabled=true;importPreview.replaceChildren();const checked=TGSettings.previewImport(importText.value,importScope);previewData={text:importText.value,scope:importScope,...checked};importPreview.append(E('p',{class:'g-help'},checked.changes.length?'将更改 '+checked.changes.length+' 项。请确认下方差异。':'配置与当前设置一致。'));if(checked.ignored.length)importPreview.append(E('p',{class:'g-help'},'已忽略 '+checked.ignored.length+' 项停用的旧版纸面参数。'));for(const change of checked.changes){const line=E('div',{class:'g-diff'});line.append(E('span',{},change.label),E('code',{},String(change.before)+' → '+String(change.after)));importPreview.append(line);}importApply.disabled=!checked.changes.length;notify('验证完成；尚未修改设置。');});
  const scopeLabel=E('label',{class:'g-scope-select'},'导入／导出范围 '),scopeInput=E('select',{'aria-label':'配置范围',id:'tg-transfer-scope'});for(const [value,label]of [['all','全部外观设置'],['appearance','主题与界面'],['type','文字排版'],['reading','阅读与纸面'],['background','背景参数']])scopeInput.append(E('option',{value},label));scopeLabel.append(scopeInput);transfer.append(scopeLabel);scopeInput.addEventListener('change',()=>{importScope=scopeInput.value;previewData=null;importApply.disabled=true;importPreview.replaceChildren();});
  transferActions.append(button('复制当前配置',()=>{tgCopy(TGSettings.exportConfig(importScope));notify('已复制所选范围的外观配置，不含文献或图片文件。');}),validate,importApply);transfer.append(importText,transferActions,importPreview);block(transfer,'导入 导出 备份 配置 json import export','profiles');importText.addEventListener('input',()=>{previewData=null;importApply.disabled=true;importPreview.replaceChildren();});
  const recovery=group('profiles','恢复与诊断','最近 40 步可撤销；背景图片文件除外。'),recoveryActions=E('div',{class:'g-actions'}),diagnostic=E('pre',{id:'tg-diagnostic',class:'g-diagnostic',hidden:true});
  recoveryActions.append(button('恢复 Zotero 原生外观',async()=>{if(TGSettings.safeMode()){notify('当前已处于安全模式，Zotero 原生外观已恢复。');return;}if(await confirmAction('暂停 TAIS Appearance？','将关闭本插件的材质和界面样式，恢复 Zotero 原生外观。个人方案、字号、自选背景文件均保留。','恢复原生'))apply({enabled:false},'恢复 Zotero 原生外观');}),button('恢复打开前的参数',async()=>{if(await confirmAction('恢复本次打开前？','将恢复打开此设置窗口前的外观参数，不删除方案或背景图片。','恢复'))apply(initial,'恢复打开前的参数');}),button('重新应用外观',()=>{addon.mica.reapply();refresh();notify('已重新应用；不代表所有视觉状态均已验收。');}),button('查看诊断',()=>{diagnostic.hidden=false;diagnostic.textContent=JSON.stringify(TGSettings.diagnostics(),null,2);notify('诊断仅含外观状态与错误标记，不含文献正文。');}),button('复制诊断',()=>{tgCopy(JSON.stringify(TGSettings.diagnostics(),null,2));notify('已复制脱敏运行诊断。');}));recovery.append(recoveryActions,diagnostic);block(recovery,'恢复 诊断 状态 修复 排查 reset report','profiles');
  const about=group('profiles','关于','',true);about.append(E('p',{class:'g-help'},'TAIS · Theatre AI Studio'),E('p',{class:'g-help'},'TAIS Appearance '+TG_VERSION),E('p',{class:'g-help'},'显示与阅读环境，不修改文献、笔记或批注数据。'));
  const languageRow=E('div',{class:'g-row g-language-row'}),languageLabel=E('label',{for:'tg-language'},'语言'),languageSelect=E('select',{id:'tg-language','aria-label':'语言'});for(const code of ['auto',...TGLocale.languages])languageSelect.append(E('option',{value:code},TGLocale.names[code]));languageSelect.value=TGLocale.get();languageRow.append(languageLabel,languageSelect);about.append(languageRow);languageSelect.addEventListener('change',()=>{try{TGLocale.set(languageSelect.value);const state=mounted.get(win);state?.dispose();mount(win);}catch(e){notify(e.message,true);}});

  const footer=E('footer',{class:'g-footer'}),message=E('span',{id:'tg-message',role:'status','aria-live':'polite'},'更改已保存。'),historyActions=E('div',{class:'g-history'}),undo=button('撤销',()=>{if(TGSettings.undo())notify('已撤销上一步。');},{'aria-label':'撤销上一步外观操作'}),redo=button('重做',()=>{if(TGSettings.redo())notify('已重做。');},{'aria-label':'重做外观操作'});undo.prepend(icon('undo'));redo.prepend(icon('redo'));historyActions.append(undo,redo);footer.append(message);footer.hidden=true;toolbar.append(historyActions);host.insertBefore(footer,searchBox);
  const commandDialog=E('dialog',{class:'g-command-dialog','aria-labelledby':'tg-command-title','aria-describedby':'tg-command-help'}),commandHead=E('div',{class:'g-command-head'}),commandTitle=E('h3',{id:'tg-command-title'},'命令面板'),commandHint=E('p',{id:'tg-command-help',class:'g-help'},'方向键选择 · Enter 执行 · Esc 关闭'),commandSearch=E('input',{type:'search',id:'tg-command-search',placeholder:'搜索设置、主题或场景',role:'combobox','aria-label':'搜索命令','aria-controls':'tg-command-list','aria-expanded':'false','aria-autocomplete':'list',autocomplete:'off'}),commandList=E('div',{id:'tg-command-list',class:'g-command-list',role:'listbox','aria-label':'操作结果'}),commandCount=E('p',{class:'g-help',role:'status'}),commandClose=button('关闭',()=>closeCommand(),{class:'g-command-close'});
  commandHead.append(commandTitle,commandClose);commandDialog.append(commandHead,commandHint,commandSearch,commandCount,commandList);host.append(commandDialog);let commandEntries=[],commandIndex=-1,commandInvoker=null;
  function locate(r){showTab(r.panel||'appearance');for(let d=r.row.parentElement;d&&d!==host;d=d.parentElement)if(d.localName==='details')d.open=true;r.row.scrollIntoView({block:'center',behavior:'auto'});const target=r.inputs.find(x=>!x.disabled);if(target)target.focus();else{r.row.tabIndex=-1;r.row.focus();}r.row.classList.add('g-located');later(()=>r.row.classList.remove('g-located'),1200);}
  function buildCommandEntries(){
   const entries=[];for(const [id,label]of GROUPS)entries.push({label:'打开分区 · '+label,detail:'查看设置',run:()=>showTab(id)});
   for(const r of rows)entries.push({label:'定位设置 · '+r.label,detail:r.help||r.key,keywords:r.key,run:()=>locate(r)});
   for(const t of TG_TEMPLATES)entries.push({label:'预览主题 · '+t.name,detail:t.description,run:()=>{showTab('appearance');startTemplatePreview(t);}});
   for(const scene of sceneDefs)entries.push({label:'预览场景 · '+scene.name,detail:scene.desc,run:()=>{showTab('appearance');startPreview(scene.values,'场景「'+scene.name+'」');}});
   entries.push({label:'切换浅色模式',detail:'可撤销',run:()=>apply({'glass-theme':'light'},'切换浅色')},{label:'切换深色模式',detail:'可撤销',run:()=>apply({'glass-theme':'dark'},'切换深色')},{label:'跟随系统外观',detail:'保留其他参数',run:()=>apply({'glass-theme':'auto'},'跟随系统')},{label:'打开安全模式',detail:'查看兼容与恢复，不自动停用',run:()=>showTab('compatibility')},{label:'打开恢复与诊断',detail:'查看恢复选项',run:()=>{showTab('profiles');recovery.scrollIntoView({block:'start'});}});return entries;
  }
  function activeCommand(index){commandIndex=index;for(const [i,node]of [...commandList.children].entries())node.setAttribute('aria-selected',String(i===index));const node=commandList.children[index];if(node){commandSearch.setAttribute('aria-activedescendant',node.id);node.scrollIntoView({block:'nearest'});}else commandSearch.removeAttribute('aria-activedescendant');}
  function renderCommands(){const q=commandSearch.value.trim().toLocaleLowerCase();commandEntries=buildCommandEntries().filter(x=>(x.label+' '+x.detail+' '+(x.keywords||'')).toLocaleLowerCase().includes(q));commandList.replaceChildren();commandCount.textContent=TGLocale.t(commandEntries.length?'共 '+commandEntries.length+' 项操作':'没有匹配的操作');commandEntries.forEach((entry,i)=>{const row=E('div',{id:'tg-command-option-'+i,class:'g-command-item',role:'option','aria-selected':'false'});row.append(E('strong',{},entry.label),E('small',{},entry.detail));row.addEventListener('mousedown',e=>e.preventDefault());row.addEventListener('click',()=>runCommand(i));commandList.append(row);});activeCommand(commandEntries.length?0:-1);}
  function closeCommand(restore=true){if(!commandDialog.open)return;commandDialog.close();commandSearch.setAttribute('aria-expanded','false');commandSearch.removeAttribute('aria-activedescendant');if(restore&&commandInvoker?.isConnected&&!commandInvoker.disabled)commandInvoker.focus();}
  async function runCommand(index){if(commandRunning)return;const entry=commandEntries[index];if(!entry)return;commandRunning=true;closeCommand(false);try{await entry.run();}catch(e){notify(e.message||String(e),true);}finally{commandRunning=false;}}
  function openCommandPalette(){if(dead||host.getBoundingClientRect().width===0||commandDialog.open||pendingConfirmations.size)return;if(TGSettings.preview){notify('请先确认或取消外观预览。',true);return;}commandInvoker=doc.activeElement;commandSearch.value='';renderCommands();commandDialog.showModal();commandSearch.setAttribute('aria-expanded','true');commandSearch.focus();}
  commandSearch.addEventListener('input',e=>{if(!e.isComposing)renderCommands();});commandSearch.addEventListener('compositionend',renderCommands);
  commandSearch.addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229)return;if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){if(!commandEntries.length)return;e.preventDefault();activeCommand(e.key==='Home'?0:e.key==='End'?commandEntries.length-1:(commandIndex+(e.key==='ArrowDown'?1:-1)+commandEntries.length)%commandEntries.length);}else if(e.key==='Enter'){e.preventDefault();runCommand(commandIndex);}else if(e.key==='Escape'){e.preventDefault();closeCommand();}});
  commandDialog.addEventListener('cancel',e=>{e.preventDefault();closeCommand();});commandDialog.addEventListener('click',e=>{const r=commandDialog.getBoundingClientRect();if(e.target===commandDialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))closeCommand();});
  const globalKeys=e=>{if(e.defaultPrevented||e.isComposing||e.keyCode===229||host.getBoundingClientRect().width===0)return;const target=e.composedPath?.()[0]||e.target,editable=target?.closest?.('input,textarea,select,[contenteditable="true"]');if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==='k'){e.preventDefault();openCommandPalette();return;}if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='/'&&!editable){e.preventDefault();openCommandPalette();}if(e.key==='Escape'&&activeThemePreview&&!editable&&!commandDialog.open){e.preventDefault();finishPreview(false);}};
  host.addEventListener('keydown',globalKeys);cleanups.push(()=>host.removeEventListener('keydown',globalKeys));
  const changesView=E('section',{class:'g-session-changes',hidden:true,'aria-label':'本次修改明细'});host.insertBefore(changesView,body);
  function sessionChanges(){const names={'glass-theme':'界面明暗','enabled':'启用外观','material':'材质','light-tint':'浅色着色','dark-tint':'深色着色','accent-color':'强调色'};return Object.entries(TGSettings.snapshot()).filter(([k,v])=>v!==initial[k]&&!TG_NUM[k]?.hidden).map(([key,after])=>({key,after,before:initial[key],label:controls.get(key)?.label||TG_NUM[key]?.label||names[key]||key}));}
  function refreshChanges(){changesView.hidden=!modifiedOnly;changesView.replaceChildren();if(!modifiedOnly)return 0;const entries=sessionChanges().filter(x=>!filter||(x.key+' '+x.label).toLocaleLowerCase().includes(filter));for(const x of entries){const row=E('div',{class:'g-session-change'});row.append(E('strong',{},x.label),E('code',{},String(x.before)+' → '+String(x.after)),button('恢复之前',()=>apply({[x.key]:x.before},'恢复 '+x.label),{'aria-label':'恢复 '+x.label+' 的打开前值'}));changesView.append(row);}return entries.length;}
  const searchOpenState=new Map();
  const sectionTools=E('div',{class:'g-section-tools'}),changesSummary=E('span',{class:'g-help'}),resetSection=button('预览本页推荐值',()=>{const defaults=TGSettings.defaults(),values={};for(const r of rows)if(r.panel===activeTab&&Object.prototype.hasOwnProperty.call(defaults,r.key))values[r.key]=defaults[r.key];startPreview(values,'恢复'+GROUPS.find(g=>g[0]===activeTab)[1]+'推荐值');});sectionTools.append(changesSummary,resetSection);host.insertBefore(sectionTools,body);
  function applyFilter(){
   const changedEntries=refreshChanges();const filtering=!!filter||modifiedOnly;if(filtering&&!searchOpenState.size)for(const d of body.querySelectorAll('details'))searchOpenState.set(d,d.open);if(!filtering&&searchOpenState.size){for(const [d,open]of searchOpenState)d.open=open;searchOpenState.clear();}host.dataset.searching=String(filtering);nav.hidden=filtering;clearSearch.hidden=!filter;resultCount.hidden=!filtering;let count=0;
   for(const r of rows){const match=(!filter||(r.label+' '+r.help+' '+r.key).toLocaleLowerCase().includes(filter))&&(!modifiedOnly||tgGet(r.key)!==initial[r.key]);r.row.hidden=filtering&&!match;if(filtering&&match){count++;const exp=r.row.closest('details');if(exp)exp.open=true;}}
   for(const b of blocks)b.node.hidden=filtering&&(modifiedOnly||!b.text.includes(filter));
   if(!filtering)for(const {button:b,template:t}of templateButtons)b.hidden=templateMode!=='all'&&t.theme!==templateMode;
   for(const [id,panel]of panels){const has=rows.some(r=>r.panel===id&&!r.row.hidden)||blocks.some(b=>b.panel===id&&!b.node.hidden);panel.hidden=filtering?!has:id!==activeTab;for(const g of panel.querySelectorAll('.g-group')){if(blocks.some(b=>b.node===g))continue;g.hidden=filtering&&!g.querySelector('.g-row:not([hidden]),.g-template:not([hidden]),.g-runtime:not([hidden]),.g-preview:not([hidden]),.g-background-box:not([hidden]),.g-search-block:not([hidden])');}}
   for(const [id,tab]of tabs){tab.setAttribute('aria-selected',String(id===activeTab));tab.tabIndex=id===activeTab?0:-1;}
   const templates=templateButtons.filter(x=>!x.button.hidden).length;if(filtering&&!modifiedOnly)count+=templates+blocks.filter(b=>!b.node.hidden&&!b.node.matches('.g-template')).length;resultCount.textContent=TGLocale.t(count?'找到 '+count+' 个匹配项':'未找到匹配项');empty.hidden=!filtering||changedEntries>0||[...panels.values()].some(p=>!p.hidden);if(modifiedOnly)resultCount.textContent=TGLocale.t(changedEntries?'本次修改 '+changedEntries+' 项':'没有匹配的已修改参数');
  }
  function disable(key,reason=''){const r=controls.get(key);if(!r)return;r.disabledReason=reason;r.row.dataset.disabled=String(!!reason);for(const i of r.inputs){i.disabled=!!reason;i.title=reason;i.setAttribute('aria-disabled',String(!!reason));}if(r.reset)r.reset.disabled=!!reason;}
  function refreshRuntime(){if(dead)return;try{const reports=addon.reading.report(),current=reports.find(r=>r.active)||reports[0],native=addon.mica.lastNative;summary.textContent=TGLocale.t((tgGet('enabled')?'外观已启用':'外观已关闭')+' · '+(resolveGlassTheme()==='dark'?'深色':'浅色')+' · '+(tgGet('material')==='acrylic'?'Acrylic Glass':tgGet('material'))+(native?.ok?'':' · 材质状态待核验'));
   if(!current){readerStatus.textContent=TGLocale.t('尚未打开 PDF；打开后可查看实际纸底状态。');}else if(current.mode==='native-glass'){readerStatus.textContent=TGLocale.t('纸底目标 '+Math.round(current.requestedSheetOpacity*100)+'% / 实际 '+Math.round(current.sheetOpacity*100)+'% 不透明 · '+(current.paperContrastGuard?'对比度保护已提高遮挡 · ':'')+'原生文字画布'+(current.nativeThemeForeground?' · 前景 '+current.nativeThemeForeground:''));}else readerStatus.textContent=TGLocale.t('当前保留原纸底 · '+(current.reason||'已选择仅外围透明'));
   demoPaper.style.backgroundColor='rgba(249,245,233,'+(tgGet('paper-mode')==='native-glass'?tgGet('native-paper-opacity')/100:1)+')';
  }catch{readerStatus.textContent=TGLocale.t('阅读状态暂未读取；可重新打开 PDF 后检查。');}}
  function refresh(){
   if(dead)return;if(activeThemePreview&&!TGSettings.preview){activeThemePreview=null;notify('预览已结束，当前参数已同步。');}restorePreviewControls();host.dataset.locale=TGLocale.current();host.dataset.theme=resolveGlassTheme();quickLight.setAttribute('aria-pressed',String(tgGet('glass-theme')==='light'));quickDark.setAttribute('aria-pressed',String(tgGet('glass-theme')==='dark'));quickAuto.setAttribute('aria-pressed',String(tgGet('glass-theme')==='auto'));host.dataset.density=tgGet('settings-density');host.dataset.safeMode=String(TGSettings.safeMode());enabled.checked=!!tgGet('enabled');enabled.disabled=TGSettings.safeMode();safeStatus.textContent=TGLocale.t(TGSettings.safeMode()?'已启用 · 原生外观保护':'未启用');safeEnter.hidden=TGSettings.safeMode();safeExit.hidden=!TGSettings.safeMode();safeExit.disabled=TGSettings.diagnostics().recoveryPending;
   for(const r of rows){const v=tgGet(r.key);for(const i of r.inputs){if(i.dataset.editing==='yes')continue;if(i.type==='checkbox')i.checked=!!v;else i.value=String(v);}r.row.dataset.modified=String(v!==initial[r.key]);if(r.reset)r.reset.title='推荐值 '+TGSettings.defaults()[r.key]+(TG_NUM[r.key]?.unit||'');}
   for(const k of ['interface-type-mode','annotation-type-mode','ui-bold-text'])disable(k,tgGet('readable-ui')?'':'开启清晰排版后可调。');
   disable('interface-text-size',!tgGet('readable-ui')?'开启清晰排版后可调。':tgGet('interface-type-mode')==='native'?'已跟随原生；自定义值保留但不应用。':'');
   for(const k of ['annotation-text-size','annotation-leading'])disable(k,!tgGet('readable-ui')?'开启清晰排版后可调。':tgGet('annotation-type-mode')==='native'?'已跟随原生批注排版；自定义值保留。':'');
   builtPreview.style.backgroundImage=TGDefaultBackground.css(resolveGlassTheme(),1);
   for(const {button:b,template:t}of templateButtons){const preset=TGSettings.preset(t.id,preserveReading),same=Object.entries(preset).every(([k,v])=>TG_NUM[k]?.hidden||tgGet(k)===v);b.setAttribute('aria-pressed',String(same));}
   const source=tgGet('reader-background'),native=tgGet('paper-mode')==='native-glass';disable('native-paper-opacity',!native?'已选择原纸底；切换为透明纸底后可调。':tgGet('paper-follow-surround')?'正在按外围计算纸底；关闭“纸底接近外围”后可手动调整。':'');disable('reader-gradient',source==='gradient'?'':'仅用于柔和渐变。');disable('reader-background-fit',source==='image'?'':'仅用于本地图片。');disable('reader-background-opacity',source!=='glass'?'':'桌面 Glass 不使用附加背景强度。');disable('reader-background-blur',source==='image'?'':'只处理本地图片，不模糊正文。');disable('reader-background-brightness',source==='image'?'':'仅用于本地图片。');
   for(const x of adapterRows)disable(x.row.key,x.installed===false?'尚未安装对应插件。':!tgGet('compat-other')?'请先启用插件适配总开关。':'');
   const h=TGSettings.history();undo.disabled=!h.undo;redo.disabled=!h.redo;undo.title=h.undoLabel?'撤销：'+h.undoLabel:'没有可撤销操作';redo.title=h.redoLabel?'重做：'+h.redoLabel:'没有可重做操作';
   picker.disabled=bgBusy||!!TGBackground.busy;removeBackground.disabled=picker.disabled||!TGBackground.url;bgBox.setAttribute('aria-busy',String(picker.disabled));thumbnail.style.backgroundImage=TGBackground.url?'url('+JSON.stringify(TGBackground.url)+')':'none';thumbnail.dataset.empty=String(!TGBackground.url);bgName.textContent=TGLocale.t(picker.disabled?'正在处理背景图片…':TGBackground.error?'背景加载失败；原文件保留。可选择其他图片。':TGBackground.meta?TGBackground.meta.name+' · '+TGBackground.meta.width+' × '+TGBackground.meta.height:'尚未选择本地图片。');
   refreshProfiles();refreshRuntime();applyFilter();const count=rows.filter(r=>r.panel===activeTab&&tgGet(r.key)!==initial[r.key]).length;changesSummary.textContent=TGLocale.t(count?'本页 '+count+' 项已修改':'即时保存 · 主题先预览');resetSection.disabled=!rows.some(r=>r.panel===activeTab)||TGSettings.safeMode();lockPreviewControls();
  }
  const unsubscribe=TGSettings.subscribe(refresh);cleanups.push(unsubscribe);let refreshTimer=null;
  const observer={observe(){cancel(refreshTimer);refreshTimer=later(refresh,120);}};Services.prefs.addObserver('extensions.taisZoteroGlass.',observer);cleanups.push(()=>Services.prefs.removeObserver('extensions.taisZoteroGlass.',observer));
  const keyHandler=e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.target.closest('input,textarea,select,[contenteditable]'))return;const k=e.key.toLowerCase();if(k!=='z'&&k!=='y')return;e.preventDefault();try{if(k==='y'||e.shiftKey)TGSettings.redo();else TGSettings.undo();notify('已更新外观操作历史。');}catch(error){notify(error.message,true);}};host.addEventListener('keydown',keyHandler);cleanups.push(()=>host.removeEventListener('keydown',keyHandler));
  const dispose=()=>{if(dead)return;for(const finish of [...pendingConfirmations])finish(false);if(commandDialog.open)closeCommand(false);if(activeThemePreview){try{TGSettings.cancelPreview(activeThemePreview.id,{preserveExternal:true});}catch(e){try{TGSettings.setSafeMode(true);}catch{}micalog('TAIS theme preview close recovery deferred',String(e));}activeThemePreview=null;}dead=true;for(const id of timers)win.clearTimeout(id);timers.clear();for(const fn of cleanups)try{fn();}catch{}mounted.delete(win);host._tgRefresh=null;host._tgStudioRefresh=null;host._tgOpenCommandPalette=null;host._tgShowTab=null;host._tgControls=null;};win.addEventListener('unload',dispose,{once:true});cleanups.push(()=>win.removeEventListener('unload',dispose));mounted.set(win,{dispose,refresh});
  host._tgRefresh=refresh;host._tgStudioRefresh=refresh;host._tgShowTab=showTab;host._tgInitial=initial;host._tgControls=controls;host._tgOpenCommandPalette=openCommandPalette;refresh();
 }
 return {mount,dispose(){for(const s of [...mounted.values()])s.dispose();},count:()=>mounted.size};
})();
mountGlassWorkbench=TGSettingsUI.mount;
Object.assign(TGWorkbench,{mount:mountGlassWorkbench,commands:TGSettings,uiCount:TGSettingsUI.count});
addon.workbench=TGWorkbench;

