import {choices} from './engine.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,value)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="12" fill="#203e34">'+esc(value)+'</text>';
const rect=(x,y,w,h,fill,stroke='none',extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'" '+extra+'/>';
export function optionPlan(state){
  const s=state.sel,e=state.extras,garden=s.toepassing==='tuin',padel=s.toepassing==='padel';
  const count=padel?Math.max(1,Math.min(4,Number(s.banen)||1)):1;
  const turf=garden?({natuurlijk:'#577c42',lentegroen:'#7da555',olijf:'#788250'}[s.kleur]||'#577c42'):padel?({blauw:'#3578ad',groen:'#3c8058',terracotta:'#ad654b',zwart:'#343c3b'}[s.baankleur]||'#3578ad'):'#527b46';
  const frame=padel?({antraciet:'#394043',zwart:'#151b1b',groen:'#315d41',wit:'#ecece4'}[s.framekleur]||'#394043'):({klassiek:'#236b9d',rood:'#b44538',groen:'#315d41',zwart:'#252d2b'}[s.kleurstelling]||'#236b9d');
  const line={wit:'#fffef3',geel:'#f4d849',blauw:'#62a5ff'}[s.belijning]||'#fffef3';
  let drawing=rect(0,0,600,350,'#edf1e9');
  for(let i=0;i<count;i++){
    const w=count===1?380:210,h=count>2?105:205,x=count===1?110:65+(i%2)*260,y=count>2?30+Math.floor(i/2)*150:55;
    drawing+='<g data-court="'+(i+1)+'">'+rect(x-7,y-7,w+14,h+14,'none',garden?(e.kantopsluiting?'#8b8c7f':'#bcc8b6'):frame,'stroke-width="'+(garden?4:8)+'"');
    drawing+=rect(x,y,w,h,turf);
    if(garden){
      if(e.zand)for(let q=0;q<48;q++)drawing+='<circle cx="'+(x+10+(q*37)%(w-20))+'" cy="'+(y+10+(q*23)%(h-20))+'" r="1.5" fill="#d7c49b"/>';
    }else if(padel){
      drawing+=rect(x+10,y+10,w-20,h-20,'none','#fffef3','stroke-width="2"');
      drawing+='<path d="M'+(x+w/2)+' '+y+'v'+h+' M'+(x+w*.25)+' '+(y+10)+'v'+(h-20)+' M'+(x+w*.75)+' '+(y+10)+'v'+(h-20)+' M'+(x+w*.25)+' '+(y+h/2)+'h'+(w*.5)+'" stroke="#fffef3" stroke-width="2" fill="none"/>';
      drawing+='<path data-net="'+esc(s.net)+'" d="M'+(x+w/2)+' '+y+'v'+h+'" stroke="#152e34" stroke-width="'+(s.net==='wedstrijd'?5:3)+'" stroke-dasharray="3 2"/>';
      if(s.uitvoering!=='panorama')for(const side of [x-7,x+w+7])drawing+=rect(side-4,y+h/2-4,8,8,frame,'#6d7771');
    }else{
      drawing+=rect(x+15,y+12,w-30,h-24,'none',line,'stroke-width="2"');
      drawing+='<path d="M'+(x+w/2)+' '+(y+12)+'v'+(h-24)+'" stroke="'+line+'" stroke-width="2"/><circle cx="'+(x+w/2)+'" cy="'+(y+h/2)+'" r="'+(h*.17)+'" fill="none" stroke="'+line+'" stroke-width="2"/>';
      const goal={panna:22,jeugd:40,pro:58}[s.doeltype]||22;
      drawing+=rect(x-16,y+(h-goal)/2,16,goal,'#edf1e9','#fdfef6','stroke-width="3" data-goal="'+esc(s.doeltype)+'"')+rect(x+w,y+(h-goal)/2,16,goal,'#edf1e9','#fdfef6','stroke-width="3" data-goal="'+esc(s.doeltype)+'"');
      if(s.omheining==='boarding')for(let k=0;k<5;k++)drawing+=rect(x+12+k*w/5,y+h+3,w/5-16,8,s.kleurstelling==='klassiek'&&k%2?'#dfca4e':frame);
      if(s.omheining==='ballenvanger')drawing+=rect(x-14,y-14,w+28,h+28,'none','#456657','stroke-width="2" stroke-dasharray="3 4"');
      if(e.logomidden)drawing+='<circle cx="'+(x+w/2)+'" cy="'+(y+h/2)+'" r="12" fill="#f8f6e7"/>'+text(x+w/2,y+h/2+4,'Logo');
    }
    drawing+=text(x+w/2,y+h+30,padel?'Baan '+(i+1):garden?'Tuin':({panna:'Pannaveld',cruyff:'Compact veld',half:'Half veld',heel:'Heel veld'}[s.veld]||'Speelveld'));
    drawing+='</g>';
  }
  // The catalog prices lighting per project: draw exactly the selected total.
  const lights=garden?0:({led4:4,led8:8}[s.verlichting]||0);
  for(let i=0;i<lights;i++){
    const side=i%2,x=40+Math.floor(i/2)*(520/(lights/2-1)),y=side?318:15;
    drawing+='<g data-light="true"><circle cx="'+x+'" cy="'+y+'" r="10" fill="#fff0b0" stroke="#aa8643"/><path d="M'+(x-4)+' '+y+'h8 M'+x+' '+(y-4)+'v8" stroke="#80652e"/></g>';
  }
  const accessories=[['scorebord','Scorebord'],['bankjes','Bankjes'],['ballenmand',padel?'Ballenmand / net-set':'Onderhoudsset'],['reclame','Reclamedoeken'],['dugout','Dug-outs']].filter(([key])=>e[key]&&(padel?['scorebord','bankjes','ballenmand','reclame']:garden?[]:['scorebord','dugout','ballenmand']).includes(key));
  const rows=choices(state);
  return '<h3>Jouw optieplan</h3><p class="fine">Schematische weergave, geen plaatsings- of bouwtekening. Symbolen geven keuzes aan; afmetingen en posities worden bij inmeten bepaald.</p><svg class="option-plan" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" role="img" aria-label="'+esc((garden?'Tuin':padel?count+' padelbanen':'Voetbalveld')+', '+lights+' lichtmasten. Gekozen opties staan hieronder.')+'">'+drawing+'</svg>'+
    (accessories.length?'<div class="accessory-list">'+accessories.map(([key,label])=>'<span data-accessory="'+key+'">'+label+'</span>').join('')+'</div>':'')+
    '<dl class="option-register">'+rows.map(row=>'<div><dt>'+esc(row.label)+'</dt><dd>'+esc(row.value)+'</dd></div>').join('')+'</dl>';
}
