/* Read-only UI contrast inspection. No document text, screenshots, paths or arbitrary selectors. */
var TGInspector=(()=>{
 function parse(text){const m=String(text).match(/^rgba?\(([^)]+)\)$/);if(!m)return null;const p=m[1].replace(/\//g,' ').split(/[,\s]+/).filter(Boolean).map(Number);return p.length>=3&&p.every(Number.isFinite)?{rgb:p.slice(0,3),a:p[3]??1}:null;}
 function lum(rgb){const c=rgb.map(x=>{x=x/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
 function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function lowerBound(fg,lo,hi){if(lum(fg)>=lum(lo)&&lum(fg)<=lum(hi))return 1;return Math.min(ratio(fg,lo),ratio(fg,hi));}
 function sample(e,region){
  const win=e.ownerDocument.defaultView,ancestors=[];for(let n=e;n;n=n.parentElement)ancestors.unshift(n);let lo=[0,0,0],hi=[255,255,255],unknown=true,complex=false;
  for(const node of ancestors){const c=win.getComputedStyle(node),bg=parse(c.backgroundColor);if(bg){lo=lo.map((x,i)=>x*(1-bg.a)+bg.rgb[i]*bg.a);hi=hi.map((x,i)=>x*(1-bg.a)+bg.rgb[i]*bg.a);if(bg.a===1)unknown=false;}
   if(c.backgroundImage!=='none'){lo=[0,0,0];hi=[255,255,255];unknown=true;}
   if(Number(c.opacity)<1||c.filter!=='none'||(c.mixBlendMode&&c.mixBlendMode!=='normal'))complex=true;
  }
  const c=win.getComputedStyle(e),fg=parse(c.color);const value=fg&&fg.a===1&&!complex?lowerBound(fg.rgb,lo,hi):null;
  return{region,fontSize:c.fontSize,foreground:c.color,lowerBound:value,unknownBackdrop:unknown,complexComposition:complex,note:value===null?'存在透明文字或滤镜，需人工核对':unknown?'玻璃背景：保守范围估计':value>=4.5?'已知实色背景：模型参考通过':'低于普通文字参考值'};
 }
 function inspect(documents){
  const targets=[['设置正文','#tg-workbench .g-label>label'],['设置辅助文字','#tg-workbench .g-help'],['设置标题','#tg-workbench h2'],['元数据正文','#zotero-context-pane editable-text .input, #zotero-item-pane editable-text .input'],['文献列表','#zotero-items-tree .row .cell'],['分类栏','#zotero-collections-tree .row .cell']];const rows=[];
  for(const doc of new Set(documents)){
   if(!doc?.documentElement)continue;
   for(const [name,selector]of targets){const el=[...doc.querySelectorAll(selector)].find(e=>{const r=e.getBoundingClientRect(),c=doc.defaultView.getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&r.bottom>0&&r.top<doc.defaultView.innerHeight;});if(el)try{rows.push(sample(el,name));}catch{rows.push({region:name,fontSize:'未知',lowerBound:null,note:'无法读取此界面样式'});}}
  }
  return{schema:'tais-ui-inspection/1',time:new Date().toISOString(),source:'computed-styles',readsDocumentContent:false,rows};
 }
 return{inspect,parse,lum,ratio,lowerBound};
})();
