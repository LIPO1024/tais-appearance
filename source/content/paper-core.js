/* TAIS 1.3 display-only paper keying. Pure, testable; never writes source canvas/PDF. */
var TGPaperCore = (() => {
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function rgb(color) {
    if (typeof color!=="string") return null;
    let m=color.trim().match(/^#([a-f0-9]{6})$/i);
    if(m)return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16));
    m=color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    return m?m.slice(1,4).map(Number):null;
  }
  function distance(data,i,p) {return Math.max(Math.abs(data[i]-p[0]),Math.abs(data[i+1]-p[1]),Math.abs(data[i+2]-p[2]));}
  function analyze(data,width,height,preferred,tolerance=12) {
    if(!data||data.length!==width*height*4)throw new Error('Invalid RGBA buffer');
    const corners=[[.025,.025],[.975,.025],[.025,.975],[.975,.975],[.5,.015],[.5,.985]];
    const sample=corners.map(([x,y])=>{const i=(Math.min(height-1,Math.floor(y*height))*width+Math.min(width-1,Math.floor(x*width)))*4;return Array.from(data.slice(i,i+3));});
    const median=[0,1,2].map(k=>sample.map(p=>p[k]).sort((a,b)=>a-b)[3]);
    const preferredRGB=Array.isArray(preferred)?preferred:rgb(preferred);
    let reference=preferredRGB&&preferredRGB.reduce((a,b)=>a+b,0)/3>205?preferredRGB:median;
    const stride=Math.max(1,Math.floor(width*height/12000));
    function stats(p) {let n=0,bg=0,dark=0,mid=0,color=0;for(let px=0;px<width*height;px+=stride){const i=px*4;if(data[i+3]<200)continue;n++;const r=data[i],g=data[i+1],b=data[i+2],y=(r+g+b)/3;if(distance(data,i,p)<=tolerance)bg++;if(y<160)dark++;if(y>60&&y<200)mid++;if(Math.max(r,g,b)-Math.min(r,g,b)>65)color++;}return {samples:n,paperRatio:bg/(n||1),darkRatio:dark/(n||1),midRatio:mid/(n||1),colorRatio:color/(n||1)};}
    let summary=stats(reference);
    if(summary.paperRatio<.15&&median.reduce((a,b)=>a+b,0)/3>205){const alternative=stats(median);if(alternative.paperRatio>summary.paperRatio){reference=median;summary=alternative;}}
    let reason='ready';
    if(reference.reduce((a,b)=>a+b,0)/3<205)reason='dark-paper';
    else if(summary.paperRatio<.15)reason='no-uniform-paper';
    else if(summary.colorRatio>.075||summary.midRatio>.28)reason='illustration-protected';
    return {eligible:reason==='ready',reason,reference,...summary};
  }
  // Only alpha of near-paper pixels changes. All RGB and dark glyph alpha remain exact.
  function transformChunk(source,destination,startPixel,endPixel,reference,opacity,tolerance,width,height) {
    const a=clamp(Number(opacity),.80,1),t=clamp(Number(tolerance),2,24);let changed=0;
    for(let px=startPixel;px<endPixel;px++){
      const i=px*4;if(source[i+3]===0||Math.min(source[i],source[i+1],source[i+2])<155)continue;
      const d=distance(source,i,reference);if(d>t)continue;
      // Preserve fine texture, pale illustrations and antialiased glyph edges.
      if(width>2&&height>2){const x=px%width,y=(px/width)|0;let lo=255,hi=0;
        for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){if(!ox&&!oy)continue;const nx=x+ox,ny=y+oy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const j=(ny*width+nx)*4;const lum=(source[j]*3+source[j+1]*6+source[j+2])/10;lo=Math.min(lo,lum);hi=Math.max(hi,lum);}
        const lum=(source[i]*3+source[i+1]*6+source[i+2])/10;if(hi-lo>22||Math.abs(lum-(reference[0]*3+reference[1]*6+reference[2])/10)>t)continue;
      }
      const weight=Math.pow(1-d/t,2);const alpha=Math.round(source[i+3]*(1-(1-a)*weight));if(alpha!==source[i+3]){destination[i+3]=alpha;changed++;}
    }
    return changed;
  }
  return {rgb,analyze,transformChunk};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=TGPaperCore;
