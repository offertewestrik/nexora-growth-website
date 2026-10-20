/* Official material projection into the fixed Next Growth living room.
 * Images may be cross-origin: no pixel readback or data-URL export is used.
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
  if(!product||!/^https:\/\//.test(product.image))throw Error('Missing official material');
  const basePath=options.basePath||'./assets/media/floor-projection/';
  const [base,mask,light,material]=await Promise.all([load(options.room||'./assets/media/floor-v3/pvc-luxe-naturel.webp'),load(basePath+'floor-mask.png'),load(basePath+'floor-light.webp'),load(options.materialUrl||product.image)]);
  const tw=Math.min(450,material.naturalWidth||material.width),th=Math.round(tw*(material.naturalHeight||material.height)/(material.naturalWidth||material.width));
  const columns=product.pattern==='supplier'?6:8,rows=2;
  const texture=surface(tw*columns,th*rows),tc=texture.getContext('2d');for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)tc.drawImage(material,x*tw,y*th,tw,th);
  const floor=surface(W,H),fc=floor.getContext('2d'),m=homography([[0,0],[texture.width,0],[texture.width,texture.height],[0,texture.height]],[[-300,300],[1600,300],[2850,1024],[-1300,1024]]);
  // Horizontal near/far edges let us rasterize exact perspective in scanlines.
  // Integer destination rows avoid the cracks of antialiased triangle meshes.
  const inv=homography([[-300,300],[1600,300],[2850,1024],[-1300,1024]],[[0,0],[texture.width,0],[texture.width,texture.height],[0,texture.height]]);
  for(let y=300;y<H;y++){const v0=Math.max(0,project(inv,0,y)[1]),v1=Math.min(texture.height,project(inv,0,y+1)[1]),v=(v0+v1)/2,left=project(m,0,v)[0],right=project(m,texture.width,v)[0];if(v1>v0)fc.drawImage(texture,0,v0,texture.width,v1-v0,left,y,right-left,1);}
  fc.globalCompositeOperation='multiply';fc.drawImage(light,0,0,W,H);fc.globalCompositeOperation='destination-in';fc.drawImage(mask,0,0,W,H);
  // Render offscreen first; caller can discard stale selections without a flash.
  const out=surface(W,H),oc=out.getContext('2d');oc.drawImage(base,0,0,W,H);oc.drawImage(floor,0,0);
  if(options.isCurrent&&!options.isCurrent())return false;
  canvas.width=W;canvas.height=H;canvas.getContext('2d').drawImage(out,0,0);canvas.dataset.product=product.id;return true;
 }
 root.FloorProjection={render,homography,project};
})(typeof window==='undefined'?globalThis:window);
