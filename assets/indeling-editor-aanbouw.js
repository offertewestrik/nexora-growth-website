(function (global) {
  'use strict';

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function num(v,d){ v=Number(v); return isFinite(v)?v:d; }

  var state={open:false,plan:null,base:null,model:null,cfg:null,drag:null};
  var functies=['NIEUWE LEEFRUIMTE','WOONRUIMTE','KEUKEN','EETKAMER','BIJKEUKEN','KANTOOR','SPEELKAMER','BERGING','TECHNISCHE RUIMTE','OPEN RUIMTE'];

  function css(){
    if(document.getElementById('ngIndelingCss')) return;
    var s=document.createElement('style'); s.id='ngIndelingCss';
    s.textContent='.ng-layout-modal{position:fixed;inset:0;z-index:99999;background:#090909d9;display:grid;place-items:center;padding:24px}.ng-layout-card{width:min(1180px,96vw);max-height:94vh;overflow:auto;background:#f7f5ef;color:#171717;border-radius:18px;box-shadow:0 28px 100px #000b}.ng-layout-head{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:20px 24px;border-bottom:1px solid #d8d3c8}.ng-layout-head h2{margin:0;font-size:22px}.ng-layout-head p{margin:5px 0 0;color:#69645c;font-size:13px}.ng-layout-close{border:0;background:#e5e0d5;width:38px;height:38px;border-radius:50%;font-size:22px;cursor:pointer}.ng-layout-grid{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:0}.ng-layout-stage{padding:24px;background:#fff}.ng-layout-svg{width:100%;height:auto;border:1px solid #ddd;background:#fbfbf9;touch-action:none}.ng-layout-side{padding:22px;border-left:1px solid #ddd8cd}.ng-layout-side h3{margin:0 0 12px;font-size:15px}.ng-room-row{display:grid;grid-template-columns:1fr 64px;gap:8px;align-items:center;margin:9px 0}.ng-room-row select,.ng-door-row select{width:100%;padding:9px;border:1px solid #c9c3b7;border-radius:8px;background:#fff}.ng-room-area{font-size:12px;color:#777;text-align:right}.ng-door-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.ng-layout-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.ng-layout-actions button{border:1px solid #bbb3a6;border-radius:9px;background:#fff;padding:10px 13px;font-weight:700;cursor:pointer}.ng-layout-actions .save{background:#171717;color:#fff;border-color:#171717}.ng-editor-note{font-size:11px;line-height:1.45;color:#777;margin-top:14px}@media(max-width:850px){.ng-layout-grid{grid-template-columns:1fr}.ng-layout-side{border-left:0;border-top:1px solid #ddd8cd}.ng-layout-modal{padding:8px}}';
    document.head.appendChild(s);
  }

  function boundsForRoom(r,plan){
    var L=0,R=1,T=0,B=1,eps=.002;
    plan.wanden.forEach(function(w){
      var vertical=Math.abs(w.x1-w.x2)<eps, horizontal=Math.abs(w.y1-w.y2)<eps;
      if(vertical && r.y>=Math.min(w.y1,w.y2)-eps && r.y<=Math.max(w.y1,w.y2)+eps){ if(w.x1<r.x&&w.x1>L)L=w.x1; if(w.x1>r.x&&w.x1<R)R=w.x1; }
      if(horizontal && r.x>=Math.min(w.x1,w.x2)-eps && r.x<=Math.max(w.x1,w.x2)+eps){ if(w.y1<r.y&&w.y1>T)T=w.y1; if(w.y1>r.y&&w.y1<B)B=w.y1; }
    });
    return {L:L,R:R,T:T,B:B,area:(R-L)*(B-T)};
  }

  function herbereken(){
    if(!state.plan||!state.model)return;
    var meta=state.plan.ruimten.map(function(r){return {r:r,b:boundsForRoom(r,state.plan)};});
    meta.forEach(function(a){
      var area=a.b.area;
      meta.forEach(function(c){
        if(a===c)return;
        var inside=c.b.L>=a.b.L-.001&&c.b.R<=a.b.R+.001&&c.b.T>=a.b.T-.001&&c.b.B<=a.b.B+.001;
        var smaller=c.b.area<a.b.area-.001;
        if(inside&&smaller) area-=c.b.area;
      });
      a.r.opp=Math.max(0,Math.round(area*state.model.opp*10)/10);
    });
  }

  function deurSvg(d,i,W,H){
    var x=80+d.x*W,y=55+d.y*H,sz=24;
    if(d.richting==='v') return '<g data-door="'+i+'" class="ng-draggable"><circle cx="'+x+'" cy="'+y+'" r="13" fill="#fff" stroke="#b12626" stroke-width="2"/><line x1="'+x+'" y1="'+(y-sz)+'" x2="'+x+'" y2="'+(y+sz)+'" stroke="#fff" stroke-width="8"/><path d="M'+x+' '+(y-sz)+' L'+(x+(d.draai==='rechts'?sz:-sz))+' '+(y-sz)+' A'+sz+' '+sz+' 0 0 1 '+x+' '+(y+sz)+'" fill="none" stroke="#b12626" stroke-width="2"/><text x="'+(x+17)+'" y="'+(y-10)+'" font-size="10" font-weight="700">'+esc(d.code)+'</text></g>';
    return '<g data-door="'+i+'" class="ng-draggable"><circle cx="'+x+'" cy="'+y+'" r="13" fill="#fff" stroke="#b12626" stroke-width="2"/><line x1="'+(x-sz)+'" y1="'+y+'" x2="'+(x+sz)+'" y2="'+y+'" stroke="#fff" stroke-width="8"/><path d="M'+(x-sz)+' '+y+' L'+(x-sz)+' '+(y+(d.draai==='rechts'?-sz:sz))+' A'+sz+' '+sz+' 0 0 1 '+(x+sz)+' '+y+'" fill="none" stroke="#b12626" stroke-width="2"/><text x="'+(x+15)+'" y="'+(y-10)+'" font-size="10" font-weight="700">'+esc(d.code)+'</text></g>';
  }

  function render(){
    var host=document.getElementById('ngLayoutModal'); if(!host||!state.plan)return;
    herbereken();
    var W=760,H=430,m=state.model,svg='<svg class="ng-layout-svg" id="ngLayoutSvg" viewBox="0 0 920 540">';
    svg+='<rect x="80" y="55" width="'+W+'" height="'+H+'" fill="#fff" stroke="#111" stroke-width="8"/>';
    var stepX=.5/m.breedte,stepY=.5/m.diepte;
    for(var gx=stepX;gx<1;gx+=stepX)svg+='<line x1="'+(80+gx*W)+'" y1="55" x2="'+(80+gx*W)+'" y2="'+(55+H)+'" stroke="#ddd5c4" stroke-dasharray="3 5"/>';
    for(var gy=stepY;gy<1;gy+=stepY)svg+='<line x1="80" y1="'+(55+gy*H)+'" x2="840" y2="'+(55+gy*H)+'" stroke="#ddd5c4" stroke-dasharray="3 5"/>';
    state.plan.wanden.forEach(function(w,i){svg+='<line data-wall="'+i+'" x1="'+(80+w.x1*W)+'" y1="'+(55+w.y1*H)+'" x2="'+(80+w.x2*W)+'" y2="'+(55+w.y2*H)+'" stroke="#171717" stroke-width="8" stroke-linecap="round" style="cursor:move"/>';});
    state.plan.deuren.forEach(function(d,i){svg+=deurSvg(d,i,W,H);});
    state.plan.ruimten.forEach(function(r){svg+='<g pointer-events="none"><rect x="'+(80+r.x*W-65)+'" y="'+(55+r.y*H-22)+'" width="130" height="44" rx="4" fill="#fff" stroke="#aaa"/><text x="'+(80+r.x*W)+'" y="'+(55+r.y*H-3)+'" text-anchor="middle" font-size="12" font-weight="700">'+esc(r.naam)+'</text><text x="'+(80+r.x*W)+'" y="'+(55+r.y*H+14)+'" text-anchor="middle" font-size="11">'+Number(r.opp||0).toFixed(1)+' m²</text></g>';});
    svg+='<text x="80" y="520" font-size="12" fill="#666">'+Math.round(m.breedte*1000)+' × '+Math.round(m.diepte*1000)+' mm · raster 500 mm · sleep zwarte wanden en rode deuren</text></svg>';
    var rooms=state.plan.ruimten.map(function(r,i){var current=functies.find(function(f){return r.naam.indexOf(f)===0;})||r.naam;return '<div class="ng-room-row"><select data-room="'+i+'">'+functies.map(function(f){return '<option value="'+f+'"'+(f===current?' selected':'')+'>'+f+'</option>';}).join('')+'</select><span class="ng-room-area">'+Number(r.opp||0).toFixed(1)+' m²</span></div>';}).join('');
    var doors=state.plan.deuren.map(function(d,i){return '<div class="ng-door-row"><span><b>'+esc(d.code)+'</b><br><small>'+Math.round(num(d.breedte,.88)*1000)+' mm</small></span><select data-door-turn="'+i+'"><option value="links"'+(d.draai==='links'?' selected':'')+'>draai links</option><option value="rechts"'+(d.draai==='rechts'?' selected':'')+'>draai rechts</option></select></div>';}).join('');
    host.querySelector('.ng-layout-stage').innerHTML=svg;
    host.querySelector('.ng-rooms').innerHTML=rooms;
    host.querySelector('.ng-doors').innerHTML=doors;
    bindStage();bindSide();
  }

  function pos(ev,svg){var r=svg.getBoundingClientRect();return {x:clamp((ev.clientX-r.left)/r.width*920,80,840),y:clamp((ev.clientY-r.top)/r.height*540,55,485)};}
  function bindStage(){
    var svg=document.getElementById('ngLayoutSvg'); if(!svg)return;
    svg.onpointerdown=function(e){var w=e.target.closest('[data-wall]'),d=e.target.closest('[data-door]');if(!w&&!d)return;e.preventDefault();svg.setPointerCapture(e.pointerId);state.drag=w?{type:'wall',i:+w.dataset.wall}:{type:'door',i:+d.dataset.door};};
    svg.onpointermove=function(e){if(!state.drag)return;var p=pos(e,svg),nx=(p.x-80)/760,ny=(p.y-55)/430;
      if(state.drag.type==='wall'){var w=state.plan.wanden[state.drag.i],vert=Math.abs(w.x1-w.x2)<.002;if(vert){var old=w.x1,n=clamp(nx,.04,.96);w.x1=w.x2=n;state.plan.deuren.forEach(function(d){if(d.richting==='v'&&Math.abs(d.x-old)<.035)d.x=n;});}else{var oldY=w.y1,nY=clamp(ny,.04,.96);w.y1=w.y2=nY;state.plan.deuren.forEach(function(d){if(d.richting==='h'&&Math.abs(d.y-oldY)<.035)d.y=nY;});}}
      else{var d=state.plan.deuren[state.drag.i],best=null,dist=99;state.plan.wanden.forEach(function(w){var vert=Math.abs(w.x1-w.x2)<.002,dd=vert?Math.abs(nx-w.x1):Math.abs(ny-w.y1);if(dd<dist){dist=dd;best={w:w,vert:vert};}});if(best){if(best.vert){d.richting='v';d.x=best.w.x1;d.y=clamp(ny,Math.min(best.w.y1,best.w.y2)+.04,Math.max(best.w.y1,best.w.y2)-.04);}else{d.richting='h';d.y=best.w.y1;d.x=clamp(nx,Math.min(best.w.x1,best.w.x2)+.04,Math.max(best.w.x1,best.w.x2)-.04);}}}
      render();
    };
    svg.onpointerup=svg.onpointercancel=function(){state.drag=null;};
  }

  function bindSide(){
    document.querySelectorAll('[data-room]').forEach(function(el){el.onchange=function(){state.plan.ruimten[+el.dataset.room].naam=el.value;render();};});
    document.querySelectorAll('[data-door-turn]').forEach(function(el){el.onchange=function(){state.plan.deuren[+el.dataset.doorTurn].draai=el.value;render();};});
  }

  function close(){var h=document.getElementById('ngLayoutModal');if(h)h.remove();state.open=false;state.drag=null;}
  function reset(){state.plan=clone(state.base);render();}
  function splitUitbouw(){
    if(!state.model||state.model.type!=='uitbouw'||state.plan.wanden.length)return;
    state.plan.wanden.push({x1:.58,y1:0,x2:.58,y2:1});
    state.plan.deuren.push({code:'D-01',x:.58,y:.58,richting:'v',draai:'links',breedte:.88});
    state.plan.ruimten=[
      {code:'R-U01',naam:'WOONRUIMTE',x:.29,y:.46,opp:0},
      {code:'R-U02',naam:'KEUKEN',x:.79,y:.46,opp:0}
    ];
    render();
  }
  function save(){herbereken();state.cfg.kamerplanOverride=clone(state.plan);close();if(global.NGHertekenen)global.NGHertekenen();}

  function open(){
    if(!global.NGBouwkundig||typeof global.NGKeuze!=='function')return alert('De bouwkundige module is nog niet geladen.');
    css();state.cfg=global.NGKeuze();state.model=global.NGBouwkundig.model(state.cfg);state.base=clone(global.NGBouwkundig.kamerplan(state.cfg.indeling||'open',state.cfg.voorzieningen||{},state.model.opp));state.plan=clone(state.cfg.kamerplanOverride||state.model.kamerplan);state.open=true;
    var h=document.createElement('div');h.id='ngLayoutModal';h.className='ng-layout-modal';h.innerHTML='<div class="ng-layout-card"><div class="ng-layout-head"><div><h2>Indeling aanpassen</h2><p>Versleep binnenwanden en deuren. Wijzig daarna per ruimte de functie en draairichting.</p></div><button class="ng-layout-close" type="button" aria-label="Sluiten">×</button></div><div class="ng-layout-grid"><div class="ng-layout-stage"></div><aside class="ng-layout-side"><h3>Ruimtes</h3><div class="ng-rooms"></div><h3 style="margin-top:22px">Deuren</h3><div class="ng-doors"></div><div class="ng-layout-actions">'+(state.model.type==='uitbouw'&&!state.plan.wanden.length?'<button type="button" class="split">Scheidingswand + deur</button>':'')+'<button type="button" class="reset">Standaard herstellen</button><button type="button" class="save">Indeling opslaan</button></div><p class="ng-editor-note">Raster 500 mm. De technische tekening neemt de opgeslagen wand- en deurposities over. Definitieve maten blijven onderdeel van de projectinmeting.</p></aside></div></div>';document.body.appendChild(h);
    h.querySelector('.ng-layout-close').onclick=close;h.querySelector('.reset').onclick=reset;h.querySelector('.save').onclick=save;var split=h.querySelector('.split');if(split)split.onclick=splitUitbouw;h.onclick=function(e){if(e.target===h)close();};render();
  }

  function init(){var b=document.getElementById('indelingBtn');if(b)b.addEventListener('click',open);}
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
  global.NGIndelingEditor={open:open,close:close};
})(typeof window!=='undefined'?window:globalThis);
