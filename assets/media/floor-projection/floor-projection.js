/* Official material projection into the fixed Next Growth living room.
 * Article textures load through the same-origin, catalog-only material endpoint.
 * Visible pattern comes from the supplier image; scale is an impression.
 */
(function(root){
 'use strict';
 const W=1536,H=1024, cache=new Map();
 function solve(A,b){A=A.map((r,i)=>[...r,b[i]]);for(let i=0;i<b.length;i++){let k=i;for(let j=i+1;j<b.length;j++)if(Math.abs(A[j][i])>Math.abs(A[k][i]))k=j;[A[i],A[k]]=[A[k],A[i]];const q=A[i][i];if(Math.abs(q)<1e-10)throw Error('Invalid projection');for(let j=i;j<=b.length;j++)A[i][j]/=q;for(let k=0;k<b.length;k++)if(k!==i){const m=A[k][i];for(let j=i;j<=b.length;j++)A[k][j]-=m*A[i][j];}}return A.map(r=>r[b.length]);}
 function homography(src,dst){const a=[],b=[];src.forEach(([x,y],i)=>{const[u,v]=dst[i];a.push([x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]);b.push(u,v);});return solve(a,b);}
 function project(m,x,y){const d=m[6]*x+m[7]*y+1;return[(m[0]*x+m[1]*y+m[2])/d,(m[3]*x+m[4]*y+m[5])/d];}
 function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 function load(url){if(cache.has(url))return cache.get(url);const p=new Promise((resolve,reject)=>{const im=new Image();im.referrerPolicy='no-referrer';const timer=setTimeout(()=>{im.onload=im.onerror=null;reject(Error('Material image timeout'));},25000);im.onload=()=>{clearTimeout(timer);resolve(im);};im.onerror=()=>{clearTimeout(timer);reject(Error('Material image unavailable'));};im.src=url;});cache.set(url,p);p.catch(()=>cache.delete(url));if(cache.size>16)cache.delete(cache.keys().next().value);return p;}
 async function render(canvas,product,options={}){
  if(product?.renderUnavailable)throw Error('Article material not verified');
  if(!product||!/^https:\/\//.test(product.image))throw Error('Missing official material');
  const basePath=options.basePath||'./assets/media/floor-projection/';
  const [base,mask,light,material]=await Promise.all([load(options.room||'./assets/media/floor-v3/pvc-luxe-naturel.webp'),load(basePath+'floor-mask.png'),load(basePath+'floor-light.webp'),load(options.materialUrl||'./api/floor-material?id='+encodeURIComponent(product.id)+'&v=20260929')]);
  const tw=Math.min(900,material.naturalWidth||material.width),th=Math.round(tw*(material.naturalHeight||material.height)/(material.naturalWidth||material.width));
  const texture=surface(tw,th),tc=texture.getContext('2d');tc.drawImage(material,0,0,tw,th);
  const source=tc.getImageData(0,0,tw,th).data;
  const floor=surface(W,H),fc=floor.getContext('2d'),pixels=fc.createImageData(W,H);
  const inv=homography([[-300,300],[1600,300],[2850,1024],[-1300,1024]],[[0,0],[tw*4,0],[tw*4,th],[0,th]]);
  // Sample the exact article texture with bilinear interpolation. A bounded pixel
  // buffer avoids retaining hundreds of full-size canvas copies per render.
  for(let y=300;y<H;y++){
   const start=project(inv,.5,y+.5),end=project(inv,W+.5,y+.5),step=(end[0]-start[0])/W;
   const sy=Math.max(0,Math.min(th-1,start[1])),y0=Math.floor(sy),y1=Math.min(th-1,y0+1),fy=sy-y0;
   for(let x=0;x<W;x++){
    const sx=((start[0]+x*step)%tw+tw)%tw,x0=Math.floor(sx),x1=(x0+1)%tw,fx=sx-x0;
    const a=(y0*tw+x0)*4,b=(y0*tw+x1)*4,c=(y1*tw+x0)*4,d=(y1*tw+x1)*4,k=(y*W+x)*4;
    for(let channel=0;channel<3;channel++)pixels.data[k+channel]=(source[a+channel]*(1-fx)+source[b+channel]*fx)*(1-fy)+(source[c+channel]*(1-fx)+source[d+channel]*fx)*fy;
    pixels.data[k+3]=255;
   }
  }
  fc.putImageData(pixels,0,0);
  fc.globalCompositeOperation='multiply';fc.drawImage(light,0,0,W,H);fc.globalCompositeOperation='destination-in';fc.drawImage(mask,0,0,W,H);
  // Render offscreen first; caller can discard stale selections without a flash.
  const out=surface(W,H),oc=out.getContext('2d');oc.drawImage(base,0,0,W,H);oc.drawImage(floor,0,0);
  if(options.isCurrent&&!options.isCurrent())return false;
  canvas.width=W;canvas.height=H;canvas.getContext('2d').drawImage(out,0,0);canvas.dataset.product=product.id;return true;
 }
 root.FloorProjection={render,homography,project};
})(typeof window==='undefined'?globalThis:window);
