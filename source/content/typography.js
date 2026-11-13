/* 1.5: role-based UI typography. Native platform fonts; no font files, PDF glyph changes or CSS scaling. */
(function installTypography(){
 const apply=applyGlassVars,clear=clearGlassVars;
 applyGlassVars=function(root){
  apply(root);if(!root)return;
  const ui=Math.max(10,Math.min(24,Number(tgGet('interface-text-size'))||15)),body=Math.max(10,Math.min(24,Number(tgGet('annotation-text-size'))||16)),leading=Math.max(1.4,Math.min(1.9,(Number(tgGet('annotation-leading'))||160)/100));
  root.style.setProperty('--tg-ui-font',ui+'px');root.style.setProperty('--tg-ui-small',Math.max(10,ui-2)+'px');root.style.setProperty('--tg-ui-title',Math.max(19,ui+4)+'px');
  root.style.setProperty('--tg-annotation-font',body+'px');root.style.setProperty('--tg-annotation-leading',String(leading));root.style.setProperty('--tg-ui-weight',tgGet('ui-bold-text')?'500':'400');root.style.setProperty('--tg-label-weight',tgGet('ui-bold-text')?'600':'500');
  root.setAttribute('data-tg-readable-ui',tgGet('readable-ui')?'yes':'no');
  root.setAttribute('data-tg-type-ui',tgGet('readable-ui')&&tgGet('interface-type-mode')!=='native'?'custom':'native');
  root.setAttribute('data-tg-type-annotation',tgGet('readable-ui')&&tgGet('annotation-type-mode')!=='native'?'custom':'native');
 };
 clearGlassVars=function(root){clear(root);if(!root)return;for(const k of ['--tg-ui-font','--tg-ui-small','--tg-ui-title','--tg-annotation-font','--tg-annotation-leading','--tg-ui-weight','--tg-label-weight'])root.style.removeProperty(k);root.removeAttribute('data-tg-readable-ui');root.removeAttribute('data-tg-type-ui');root.removeAttribute('data-tg-type-annotation');};
 const sheet=rootURI+'content/typography.css';if(!SHEETS.includes(sheet))SHEETS.push(sheet);
 addon.typography={report(){return {enabled:tgGet('readable-ui'),interfaceMode:tgGet('interface-type-mode'),annotationMode:tgGet('annotation-type-mode'),interfaceSize:tgGet('interface-text-size'),annotationSize:tgGet('annotation-text-size'),annotationLeading:tgGet('annotation-leading'),bold:tgGet('ui-bold-text'),pdfGlyphsModified:false,platformFont:true};}};
})();
