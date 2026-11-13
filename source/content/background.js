/* Managed local backgrounds only. Serialized mutations and atomic replacement. */
var TGBackground = {
 url:null,meta:null,ready:false,busy:false,error:null,_serial:0,_disposed:false,
 file(){const f=Services.dirsvc.get('ProfD',Ci.nsIFile);f.append('tais-glass');if(!f.exists())f.create(Ci.nsIFile.DIRECTORY_TYPE,448);f.append('reading-background.json');return f;},
 _io(){const io=Zotero.getMainWindow()?.IOUtils;if(!io?.writeUTF8)throw new Error('本机文件接口尚未就绪；没有修改背景。');return io;},
 _validate(v){
  if(!v||v.schema!=='tais-glass-background/1'||typeof v.data!=='string'||v.data.length>6500000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v.data))throw new Error('背景文件格式无效。');
  if(!Number.isInteger(v.width)||!Number.isInteger(v.height)||v.width<1||v.height<1||v.width>2048||v.height>2048)throw new Error('背景图片尺寸无效。');
  return {schema:v.schema,name:String(v.name||'本地背景').replace(/[\u0000-\u001f]/g,'').slice(0,100),width:v.width,height:v.height,bytes:Math.ceil(v.data.slice(v.data.indexOf(',')+1).length*3/4),data:v.data};
 },
 _set(v){this.url=v?.data||null;this.meta=v?{name:v.name,width:v.width,height:v.height,bytes:v.bytes}:null;this.ready=true;this.error=null;},
 _refresh(){try{if(typeof TGReading!=='undefined')TGReading.refresh();if(typeof TGSettings!=='undefined')TGSettings.notify();}catch(e){micalog('Background refresh',String(e));}},
 async load(){
  if(this.busy)return;const serial=++this._serial;this.busy=true;
  try{const f=this.file();let v=null;if(f.exists()){if(f.fileSize>7000000)throw new Error('背景记录过大。');v=this._validate(JSON.parse(await Zotero.File.getContentsAsync(f.path)));}if(!this._disposed&&serial===this._serial)this._set(v);}
  catch(e){this.url=null;this.meta=null;this.error='本地背景无法读取；原文件保留。';micalog('Background load failed',String(e));}
  finally{this.ready=true;this.busy=false;}
 },
 async _exclusive(fn){
  if(this._disposed)throw new Error('插件已关闭。');if(this.busy)throw new Error('正在处理背景图片，请勿重复操作。');
  this.busy=true;const serial=++this._serial;this._refresh();
  try{return await fn(serial);}finally{this.busy=false;if(!this._disposed)this._refresh();}
 },
 async importFile(win,file,isCurrent=()=>true){
  return this._exclusive(async serial=>{
   if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('只支持 JPG、PNG、WebP，不读取网络地址。');
   if(!Number.isFinite(file.size)||file.size<=0||file.size>12*1024*1024)throw new Error('图片不能为空，且不能超过 12 MB。');
   if(!isCurrent())throw new Error('背景操作已取消，原图片未修改。');
   const clock=Zotero.getMainWindow()||win,objectURL=win.URL.createObjectURL(file);let image;
   try{image=await new Promise((resolve,reject)=>{const img=new win.Image();let settled=false;const timer=clock.setTimeout(()=>done(new Error('图片解码超时，请更换较小图片。')),15000);function done(error){if(settled)return;settled=true;clock.clearTimeout(timer);img.onload=null;img.onerror=null;error?reject(error):resolve(img);}img.onload=()=>done();img.onerror=()=>done(new Error('图片无法解码，旧背景未更改。'));img.src=objectURL;});}finally{win.URL.revokeObjectURL(objectURL);}
   if(this._disposed||serial!==this._serial||!isCurrent())throw new Error('背景操作已取消。');
   if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth>8192||image.naturalHeight>8192||image.naturalWidth*image.naturalHeight>32000000)throw new Error('图片尺寸过大；最长边不超过 8192 像素。');
   const scale=Math.min(1,2048/Math.max(image.naturalWidth,image.naturalHeight)),canvas=win.document.createElementNS('http://www.w3.org/1999/xhtml','canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
   // Preserve PNG/WebP transparency instead of flattening transparent pixels to black.
   canvas.getContext('2d',{alpha:true}).drawImage(image,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/webp',.88);
   const v=this._validate({schema:'tais-glass-background/1',name:file.name,width:canvas.width,height:canvas.height,data}),f=this.file(),io=this._io(),tmp=f.path+'.tmp-'+Date.now()+'-'+serial;
   if(!isCurrent())throw new Error('设置窗口已关闭或选择已变化，未覆盖旧背景。');
   try{await io.writeUTF8(f.path,JSON.stringify(v),{tmpPath:tmp,flush:true});}catch(e){try{await io.remove(tmp,{ignoreAbsent:true});}catch{}throw new Error('背景保存失败，旧背景保持不变。');}
   if(this._disposed)return null;this._set(v);return this.meta;
  });
 },
 async clear(){return this._exclusive(async()=>{const f=this.file();await this._io().remove(f.path,{ignoreAbsent:true});if(!this._disposed)this._set(null);});},
 dispose(){this._disposed=true;this._serial++;}
};
