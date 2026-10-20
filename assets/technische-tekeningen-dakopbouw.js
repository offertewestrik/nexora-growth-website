(function (global) {
  'use strict';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); };
  var mm = function (m) { return Math.round(m * 1000); };
  /* A3 landscape is 420 mm wide. The SVG viewBox is 1120 units wide, so a
     metre at 1:n is 1120/420 * 1000/n SVG-units. Main drawings use this
     fixed factor instead of "fit to page", so the stated scale is real when
     the sheet is printed at 100% on A3. */
  var scaleM = function (n) { return (1120 / 420) * (1000 / n); };
  function schaalbalk(x,y,n){var u=scaleM(n);return '<line x1="'+x+'" y1="'+y+'" x2="'+(x+2*u)+'" y2="'+y+'" stroke="#111" stroke-width="4"/><line x1="'+x+'" y1="'+(y-7)+'" x2="'+x+'" y2="'+(y+7)+'" class="thin"/><line x1="'+(x+u)+'" y1="'+(y-7)+'" x2="'+(x+u)+'" y2="'+(y+7)+'" class="thin"/><line x1="'+(x+2*u)+'" y1="'+(y-7)+'" x2="'+(x+2*u)+'" y2="'+(y+7)+'" class="thin"/><text x="'+x+'" y="'+(y+22)+'" class="micro">0</text><text x="'+(x+u)+'" y="'+(y+22)+'" text-anchor="middle" class="micro">1 m</text><text x="'+(x+2*u)+'" y="'+(y+22)+'" text-anchor="end" class="micro">2 m</text>';}

  /* Wiens naam staat er in het naamhoekje?
   *
   * Die van het bedrijf dat de tekening levert, en dat is niet altijd het onze.
   * Draait deze configurator onder de naam van een ander bedrijf, dan is een
   * blad met ONZE naam in het naamhoekje precies het verkeerde bewijs: de
   * uitvoerder kijkt daar als eerste, en daar hoort te staan van wie de
   * tekening is. Zonder bedrijf staat NGMerk.naam op 'Next Growth' en verandert
   * er dus niets. */
  function merknaam() {
    try {
      var m = global.NGMerk && global.NGMerk.merk && global.NGMerk.merk();
      if (m && m.naam) return String(m.naam).toUpperCase();
    } catch (e) { /* de merkmodule staat er niet: dan onze eigen naam */ }
    return 'NEXT GROWTH';
  }

  function kader(m, blad, titel, schaal) {
    return '<rect x="20" y="20" width="1080" height="730" fill="#fff" stroke="#111" stroke-width="2"/>'+
      '<line x1="20" y1="680" x2="1100" y2="680" stroke="#111" stroke-width="1"/>'+
      '<line x1="650" y1="680" x2="650" y2="750" stroke="#111"/>'+
      '<line x1="790" y1="680" x2="790" y2="750" stroke="#111"/>'+
      '<line x1="900" y1="680" x2="900" y2="750" stroke="#111"/>'+
      '<line x1="1000" y1="680" x2="1000" y2="750" stroke="#111"/>'+
      '<text x="38" y="704" class="brand">'+esc(merknaam())+' · TECHNISCHE DAKOPBOUW</text>'+
      '<text x="38" y="728" class="tiny">'+esc(m.project)+' · '+esc(titel)+'</text>'+
      '<text x="665" y="702" class="micro">DATUM</text><text x="665" y="727" class="tiny bold">'+esc(m.datum)+'</text>'+
      '<text x="805" y="702" class="micro">TEKENING</text><text x="805" y="727" class="small bold">'+esc(blad)+'</text>'+
      '<text x="915" y="702" class="micro">SCHAAL</text><text x="915" y="727" class="tiny bold">'+esc(schaal)+'</text>'+
      '<text x="1015" y="702" class="micro">REVISIE</text><text x="1015" y="727" class="tiny bold">'+esc(m.revisie||'P01')+'</text>'+ 
      '<text x="1080" y="744" text-anchor="end" class="stamp">VOORONTWERP</text>';
  }

  function styles() {
    return '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.micro{font-size:9px;letter-spacing:.45px}.tiny{font-size:11px}.small{font-size:14px}.label{font-size:16px}.title{font-size:25px;font-weight:700;letter-spacing:.4px}.brand{font-size:15px;font-weight:800}.bold{font-weight:700}.stamp{font-size:10px;font-weight:800;fill:#a32323}.dimtxt{font-size:13px;fill:#333}.note{font-size:12px;fill:#333}.cut{stroke:#111;stroke-width:3;fill:none}.heavy{stroke:#111;stroke-width:6;fill:none}.medium{stroke:#222;stroke-width:2.2;fill:none}.thin{stroke:#555;stroke-width:.9;fill:none}.dash{stroke:#777;stroke-width:1;stroke-dasharray:8 5;fill:none}.dim{stroke:#555;stroke-width:1;fill:none;marker-start:url(#arr);marker-end:url(#arr)}.hatch{fill:url(#wood);stroke:#333}.ins{fill:url(#ins);stroke:#555}.existing{fill:url(#existingHatch);stroke:#666}.new{fill:#fff;stroke:#111}.accent{fill:#dbc078;stroke:#111}.glass{fill:#e8f5fa;stroke:#222}.leader{stroke:#555;stroke-width:1;fill:none}.sheetbg{fill:white}.room{fill:#fff;stroke:#777;stroke-width:1}.tag{fill:#fff;stroke:#111;stroke-width:1.4}.section{stroke:#a32323;stroke-width:1.6;stroke-dasharray:10 6}.level{stroke:#176c7c;stroke-width:1.4}</style>';
  }
  function defs(){return '<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M8,4 L0,0 L0,8 z" fill="#555"/></marker><pattern id="wood" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f0dfb8"/><path d="M0 8L8 0" stroke="#b99a65" stroke-width=".7"/></pattern><pattern id="ins" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fbf6d7"/><path d="M0 6Q3 0 6 6T12 6" stroke="#b6a94d" fill="none"/></pattern><pattern id="existingHatch" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#eee"/><path d="M0 10L10 0" stroke="#bbb" stroke-width=".7"/></pattern></defs>';}
  function sheetStart(){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 770" role="img">'+defs()+styles()+'<rect width="1120" height="770" class="sheetbg"/>';}

  function maatH(x1,x2,y,objY,label){
    return '<line x1="'+x1+'" y1="'+objY+'" x2="'+x1+'" y2="'+(y+8)+'" class="thin"/><line x1="'+x2+'" y1="'+objY+'" x2="'+x2+'" y2="'+(y+8)+'" class="thin"/><line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" class="dim"/><text x="'+((x1+x2)/2)+'" y="'+(y-7)+'" text-anchor="middle" class="dimtxt">'+esc(label)+'</text>';
  }
  function maatV(x,y1,y2,objX,label){
    var cy=(y1+y2)/2;return '<line x1="'+objX+'" y1="'+y1+'" x2="'+(x-8)+'" y2="'+y1+'" class="thin"/><line x1="'+objX+'" y1="'+y2+'" x2="'+(x-8)+'" y2="'+y2+'" class="thin"/><line x1="'+x+'" y1="'+y1+'" x2="'+x+'" y2="'+y2+'" class="dim"/><text x="'+(x-8)+'" y="'+cy+'" transform="rotate(-90 '+(x-8)+' '+cy+')" text-anchor="middle" class="dimtxt">'+esc(label)+'</text>';
  }

  function asMark(x,y,label){return '<line x1="'+x+'" y1="'+(y-18)+'" x2="'+x+'" y2="'+(y+18)+'" class="thin"/><circle cx="'+x+'" cy="'+y+'" r="14" class="tag"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" class="tiny bold">'+esc(label)+'</text>';}
  function snedeMark(x1,y1,x2,y2,label){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" class="section"/><circle cx="'+x1+'" cy="'+y1+'" r="13" fill="#fff" stroke="#a32323"/><circle cx="'+x2+'" cy="'+y2+'" r="13" fill="#fff" stroke="#a32323"/><text x="'+x1+'" y="'+(y1+4)+'" text-anchor="middle" class="tiny bold">'+esc(label)+'</text><text x="'+x2+'" y="'+(y2+4)+'" text-anchor="middle" class="tiny bold">'+esc(label)+'</text>';}
  function noordpijl(x,y){return '<text x="'+x+'" y="'+(y-31)+'" text-anchor="middle" class="tiny bold">N</text><path d="M'+x+' '+(y-22)+' L'+(x-10)+' '+(y+15)+' L'+x+' '+(y+8)+' L'+(x+10)+' '+(y+15)+' Z" fill="#111"/>'}
  function roomStamp(x,y,naam,opp){return '<rect x="'+(x-54)+'" y="'+(y-20)+'" width="108" height="40" rx="2" class="room"/><text x="'+x+'" y="'+(y-3)+'" text-anchor="middle" class="micro bold">'+esc(naam)+'</text><text x="'+x+'" y="'+(y+12)+'" text-anchor="middle" class="micro">'+esc(opp)+' m²</text>';}
  function binnendeur(x,y,richting,draai,s){
    var opening=Math.min(47,.88*s),half=opening/2;
    if(richting==='v'){
      var sy=draai==='rechts'?1:-1;
      return '<line x1="'+x+'" y1="'+(y-half-3)+'" x2="'+x+'" y2="'+(y+half+3)+'" stroke="#fff" stroke-width="9"/><line x1="'+x+'" y1="'+(y-half)+'" x2="'+(x+sy*opening)+'" y2="'+(y-half)+'" class="medium"/><path d="M'+x+' '+(y+half)+' A'+opening+' '+opening+' 0 0 '+(sy>0?0:1)+' '+(x+sy*opening)+' '+(y-half)+'" class="thin"/>';
    }
    var sx=draai==='rechts'?1:-1;
    return '<line x1="'+(x-half-3)+'" y1="'+y+'" x2="'+(x+half+3)+'" y2="'+y+'" stroke="#fff" stroke-width="9"/><line x1="'+(x-half)+'" y1="'+y+'" x2="'+(x-half)+'" y2="'+(y-sx*opening)+'" class="medium"/><path d="M'+(x+half)+' '+y+' A'+opening+' '+opening+' 0 0 '+(sx>0?0:1)+' '+(x-half)+' '+(y-sx*opening)+'" class="thin"/>';
  }

  function kozijnAanzicht(m,x,y,w,h){
    var k=String(m.kozijn||'');
    if(k.indexOf('indeling-02')>=0 || k.indexOf('openslaande')>=0){
      var ww=w*.34,g=w*.08;return '<rect x="'+(x+w*.12)+'" y="'+y+'" width="'+ww+'" height="'+h+'" class="glass" stroke-width="4"/><rect x="'+(x+w*.12+ww+g)+'" y="'+y+'" width="'+ww+'" height="'+h+'" class="glass" stroke-width="4"/>';
    }
    if(k.indexOf('indeling-04')>=0 || k.indexOf('groot-raam')>=0){
      return '<rect x="'+(x+w*.20)+'" y="'+y+'" width="'+(w*.60)+'" height="'+h+'" class="glass" stroke-width="4"/>';
    }
    if(k.indexOf('model-03')>=0){
      return '<rect x="'+(x+w*.08)+'" y="'+y+'" width="'+(w*.30)+'" height="'+h+'" class="glass" stroke-width="4"/><line x1="'+(x+w*.23)+'" y1="'+y+'" x2="'+(x+w*.23)+'" y2="'+(y+h)+'" stroke="#222" stroke-width="3"/><rect x="'+(x+w*.48)+'" y="'+y+'" width="'+(w*.44)+'" height="'+h+'" class="glass" stroke-width="4"/><line x1="'+(x+w*.626)+'" y1="'+y+'" x2="'+(x+w*.626)+'" y2="'+(y+h)+'" stroke="#222" stroke-width="3"/><line x1="'+(x+w*.773)+'" y1="'+y+'" x2="'+(x+w*.773)+'" y2="'+(y+h)+'" stroke="#222" stroke-width="3"/>';
    }
    if(k.indexOf('model-04')>=0){
      return '<rect x="'+(x+w*.12)+'" y="'+(y+h*.35)+'" width="'+(w*.16)+'" height="'+(h*.65)+'" class="glass" stroke-width="4"/><rect x="'+(x+w*.43)+'" y="'+y+'" width="'+(w*.45)+'" height="'+h+'" class="glass" stroke-width="4"/><line x1="'+(x+w*.655)+'" y1="'+y+'" x2="'+(x+w*.655)+'" y2="'+(y+h)+'" stroke="#222" stroke-width="3"/>';
    }
    var rx=x+w*.24,rw=w*.52;return '<rect x="'+rx+'" y="'+y+'" width="'+rw+'" height="'+h+'" class="glass" stroke-width="4"/><line x1="'+(rx+rw/3)+'" y1="'+y+'" x2="'+(rx+rw/3)+'" y2="'+(y+h)+'" stroke="#222" stroke-width="4"/><line x1="'+(rx+2*rw/3)+'" y1="'+y+'" x2="'+(rx+2*rw/3)+'" y2="'+(y+h)+'" stroke="#222" stroke-width="4"/>';
  }

  function plattegrond(m){
    var x=180,y=175,s=scaleM(50),W=m.breedte*s,H=m.diepte*s;
    var out=sheetStart()+kader(m,'A-02','PLATTEGROND DAKOPBOUW','1:50');
    out+='<text x="55" y="70" class="title">NIEUWE SITUATIE · PLATTEGROND</text>';
    out+='<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" class="new" stroke-width="8"/>';
    out+=asMark(x,y-35,'1')+asMark(x+W,y-35,'2')+asMark(x-35,y,'A')+asMark(x-35,y+H,'B');
    for(var bx=x+s*.6;bx<x+W;bx+=s*.6) out+='<line x1="'+bx+'" y1="'+(y+8)+'" x2="'+bx+'" y2="'+(y+H-8)+'" stroke="#c7b47c" stroke-width="2" stroke-dasharray="7 5"/>';
    var doorW=Math.min(W*.46,s*3),dx=x+(W-doorW)/2;
    out+='<rect x="'+dx+'" y="'+(y-7)+'" width="'+doorW+'" height="14" class="glass"/>';
    var tgW=Math.min(2.6*s,W*.4),tgH=Math.min(.9*s,H*.35),tgX=x+W*.12,tgY=y+H*.32;
    out+='<rect x="'+tgX+'" y="'+tgY+'" width="'+tgW+'" height="'+tgH+'" fill="#fff" stroke="#222" stroke-width="3"/><text x="'+(tgX+tgW/2)+'" y="'+(tgY+tgH/2+4)+'" text-anchor="middle" class="micro bold">TG-01 · TRAPGAT</text>';
    var kp=m.kamerplan||{wanden:[],deuren:[],ruimten:[{naam:'OPEN RUIMTE',x:.5,y:.36,opp:m.opp}]};
    kp.wanden.forEach(function(wd){out+='<line x1="'+(x+W*wd.x1)+'" y1="'+(y+H*wd.y1)+'" x2="'+(x+W*wd.x2)+'" y2="'+(y+H*wd.y2)+'" stroke="#111" stroke-width="5"/>';});
    out+=snedeMark(x+W*.10,y+H*.16,x+W*.90,y+H*.16,'A')+snedeMark(x+W*.58,y+H*.08,x+W*.58,y+H*.90,'B');
    kp.deuren.forEach(function(d){out+=binnendeur(x+W*d.x,y+H*d.y,d.richting,d.draai,s);out+='<text x="'+(x+W*d.x+7)+'" y="'+(y+H*d.y-9)+'" class="micro bold">'+esc(d.code)+'</text>';});
    kp.ruimten.forEach(function(r){out+=roomStamp(x+W*r.x,y+H*r.y,r.naam,Number(r.opp).toFixed(1));});
    out+=maatH(x,x+W,y+H+60,y+H,mm(m.breedte)+' mm');
    out+=maatV(x-55,y,y+H,x,mm(m.diepte)+' mm');
    var grenzen=[0,1];kp.wanden.forEach(function(wd){if(wd.x1===wd.x2&&wd.y1===0)grenzen.push(wd.x1);});grenzen=grenzen.filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return a-b;});
    if(grenzen.length>2){for(var mi=0;mi<grenzen.length-1;mi++){var g1=grenzen[mi],g2=grenzen[mi+1];out+=maatH(x+W*g1,x+W*g2,y+H+30,y+H,Math.round(mm(m.breedte)*(g2-g1))+' mm');}}
    out+='<text x="850" y="132" class="label bold">TEKENLEGENDA</text><line x1="850" y1="152" x2="900" y2="152" class="heavy"/><text x="915" y="157" class="tiny">nieuwe HSB wand</text><line x1="850" y1="176" x2="900" y2="176" class="section"/><text x="915" y="181" class="tiny">doorsnedelijn</text>';
    out+='<text x="850" y="215" class="label bold">CONSTRUCTIE / DEUREN</text>';
    out+='<text x="850" y="245" class="small">Vloerbalk:</text><text x="850" y="265" class="small bold">'+esc(m.vloer.materiaalLabel)+'</text><text x="850" y="285" class="small">'+esc(m.vloer.profiel)+' · h.o.h. '+Math.round(m.vloer.spacing*1000)+'</text>';
    out+='<text x="850" y="320" class="small">Vrije overspanning</text><text x="850" y="341" class="small bold">'+mm(m.span)+' mm</text>';
    out+='<text x="850" y="380" class="small">Wandtype</text><text x="850" y="401" class="small bold">'+esc(m.wand.code)+'</text><text x="850" y="421" class="tiny">'+esc(m.wand.naam)+'</text><text x="850" y="452" class="tiny bold">Binnendeuren: '+kp.deuren.length+' st · 880 mm</text><text x="850" y="470" class="micro">draairichting volgens plattegrond</text>'+noordpijl(1020,570);
    out+=schaalbalk(850,545,50)+'<text x="55" y="642" class="note">Maatvoering in millimeters. A3 afdrukken op 100% / werkelijke grootte. Maten bestaande woning ter plaatse inmeten vóór productie.</text>';
    return out+'</svg>';
  }

  function voorblad(m){
    var out=sheetStart()+kader(m,'A-00','TEKENINGENLIJST','n.v.t.');
    out+='<text x="55" y="78" class="title">BOUWKUNDIG VOORONTWERP · DAKOPBOUW</text>';
    out+='<text x="55" y="112" class="label bold">'+esc(m.project)+'</text>';
    out+='<rect x="55" y="145" width="500" height="215" fill="#f6f2e7" stroke="#222"/>'+ 
      '<text x="78" y="180" class="label bold">PROJECTGEGEVENS</text>'+
      '<text x="78" y="212" class="small">Type: '+esc(m.type)+'</text>'+
      '<text x="78" y="238" class="small">Dakopbouw: '+mm(m.breedte)+' × '+mm(m.diepte)+' × '+mm(m.hoogte)+' mm</text>'+
      '<text x="78" y="264" class="small">Oppervlak: '+m.opp+' m²</text>'+
      '<text x="78" y="290" class="small">Gevel: '+esc(m.wand.naam)+' · '+esc(m.facadeColor)+'</text>'+
      '<text x="78" y="316" class="small">Kozijnkleur: '+esc(m.frameColor)+'</text>';
    if(m.adres) out+='<text x="78" y="342" class="tiny bold">LOCATIE: '+esc(m.adres)+'</text>';
    out+='<text x="610" y="160" class="label bold">TEKENINGENLIJST</text>';
    var lijst=[
      ['A-01','Bestaande situatie / dakvlak'],['A-02','Nieuwe plattegrond'],['A-03','Dakplan / HWA'],
      ['A-04','Voor- en achtergevel'],['A-05','Linker- en rechterzijgevel'],['A-06','Doorsnede A–A'],['A-07','Doorsnede B–B'],['A-08','Kozijn- en sparingenstaat'],
      ['C-01','Constructie vloer'],['C-02','Constructie dak'],['C-03','Constructieve uitgangspunten'],
      ['B-01','Wandopbouw '+m.wand.code],['B-02','Dakrand + HWA'],['B-03','Kozijn kop / neg / dorpel'],['B-04','Vloer + trapgat + bestaande bouw'],
      ['M-01','Materiaal- en opbouwstaat'],['M-02','Algemene uitgangspunten / legenda'],['A-09','Deur- en ruimtestaat'],['E-01','Bouwfysica / installaties']
    ];
    lijst.forEach(function(r,i){var yy=185+i*24;out+='<text x="610" y="'+yy+'" class="small bold">'+r[0]+'</text><text x="665" y="'+yy+'" class="small">'+esc(r[1])+'</text>';});
    out+='<rect x="55" y="385" width="500" height="185" fill="#fff8e6" stroke="#9b7b2f"/>'+
      '<text x="78" y="418" class="label bold">STATUS</text><text x="78" y="448" class="small">Parametrisch bouwkundig voorontwerp.</text>'+
      '<text x="78" y="474" class="small">Maatvoering volgt uit de configurator.</text><text x="78" y="500" class="small">Bestaande bouw moet vóór productie worden ingemeten.</text>'+
      '<text x="78" y="526" class="small">Constructieve vrijgave en verbindingen projectspecifiek.</text>';
    return out+'</svg>';
  }

  function bestaandeSituatie(m){
    var x=185,y=165,s=scaleM(50),W=m.breedte*s,H=m.diepte*s;
    var out=sheetStart()+kader(m,'A-01','SITUATIE / BESTAAND DAKVLAK','1:500 / 1:50');
    out+='<text x="55" y="70" class="title">SITUATIE · BESTAANDE TOESTAND / NIEUWE DAKOPBOUW</text>';
    out+='<rect x="'+(x-35)+'" y="'+(y-35)+'" width="'+(W+70)+'" height="'+(H+70)+'" class="existing" stroke-width="3"/>';
    out+='<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" fill="none" stroke="#a32323" stroke-width="3" stroke-dasharray="12 8"/>';
    out+='<text x="'+(x+W/2)+'" y="'+(y+H/2)+'" text-anchor="middle" class="label bold" fill="#a32323">POSITIE NIEUWE DAKOPBOUW</text>';
    out+='<circle cx="'+(x+W*.18)+'" cy="'+(y+H*.62)+'" r="18" fill="#fff" stroke="#111"/><text x="'+(x+W*.18)+'" y="'+(y+H*.62+5)+'" text-anchor="middle" class="tiny">TG</text>';
    out+=noordpijl(770,145);
    out+=maatH(x,x+W,y+H+70,y+H,mm(m.breedte)+' mm');
    out+=maatV(x-55,y,y+H,x,mm(m.diepte)+' mm');
    out+='<text x="880" y="160" class="label bold">OPNAME BESTAANDE BOUW</text>'+
      '<text x="880" y="192" class="note">□ dak-/vloeropbouw vaststellen</text><text x="880" y="216" class="note">□ balkrichting en opleggingen</text>'+
      '<text x="880" y="240" class="note">□ dragende wanden</text><text x="880" y="264" class="note">□ fundering / draaglijn</text>'+
      '<text x="880" y="288" class="note">□ trapgat en leidingdoorvoeren</text><text x="880" y="312" class="note">□ werkelijk peil + hoogtes</text>'+
      '<text x="880" y="360" class="small bold">TG = bestaand / nieuw trapgat</text>';
    out+=schaalbalk(870,520,50)+'<rect x="55" y="610" width="790" height="44" fill="#fff8e6" stroke="#9b7b2f"/><text x="70" y="628" class="tiny bold">VERGUNNINGSINVOER</text><text x="70" y="646" class="tiny">Perceelcontour, straat, belendingen en exacte bestaande contour koppelen via adres/BAG-PDOK of inmeting vóór indiening.</text>';
    return out+'</svg>';
  }

  function dakplan(m){
    var x=180,y=175,s=scaleM(50),W=m.breedte*s,H=m.diepte*s;
    var out=sheetStart()+kader(m,'A-03','DAKPLAN','1:50');
    out+='<text x="55" y="70" class="title">DAKPLAN · AFSCHOT / HWA / LICHTSTRAAT</text>';
    out+='<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" fill="#f3f3f3" stroke="#111" stroke-width="4"/>';
    out+='<line x1="'+(x+W*.15)+'" y1="'+(y+H*.2)+'" x2="'+(x+W*.84)+'" y2="'+(y+H*.78)+'" stroke="#3a6b88" stroke-width="3" marker-end="url(#arr)"/><text x="'+(x+W*.47)+'" y="'+(y+H*.47)+'" class="small bold">afschot ≥ 1:80</text>';
    out+='<circle cx="'+(x+W-28)+'" cy="'+(y+H-28)+'" r="12" fill="#3a6b88"/><text x="'+(x+W-48)+'" y="'+(y+H-45)+'" class="tiny">HWA-01</text>';
    if(m.skylight && m.skylight!=='none') out+='<rect x="'+(x+W*.36)+'" y="'+(y+H*.27)+'" width="'+(W*.28)+'" height="'+(H*.28)+'" class="glass" stroke-width="3"/><text x="'+(x+W*.5)+'" y="'+(y+H*.43)+'" text-anchor="middle" class="tiny">LICHTSTRAAT</text>';
    out+=maatH(x,x+W,y+H+58,y+H,mm(m.breedte)+' mm');
    out+=maatV(x-55,y,y+H,x,mm(m.diepte)+' mm');
    out+='<text x="880" y="155" class="label bold">DAKOPBOUW D-01</text><text x="880" y="185" class="small">'+esc(m.roofing)+'</text><text x="880" y="215" class="small">PIR afschotisolatie</text><text x="880" y="245" class="small">'+esc(m.dak.materiaalLabel)+'</text><text x="880" y="265" class="small bold">'+esc(m.dak.profiel)+' h.o.h. '+Math.round(m.dak.spacing*1000)+' mm</text>'+schaalbalk(880,545,50);
    return out+'</svg>';
  }

  function gevel(m){
    var x=150,y=235,s=scaleM(50),w=m.breedte*s,h=m.hoogte*s;
    var out=sheetStart()+kader(m,'A-04','GEVELAANZICHTEN','1:50');
    out+='<text x="55" y="70" class="title">VOOR- EN ACHTERGEVEL · DAKOPBOUW</text>';
    out+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" class="new" stroke-width="3"/>';
    out+='<rect x="'+(x-10)+'" y="'+(y-18)+'" width="'+(w+20)+'" height="18" fill="#333"/>';
    var kw=w*.48,kx=x+(w-kw)/2;
    out+=kozijnAanzicht(m,x,y+h*.23,w,h*.67);
    out+=maatH(x,x+w,y+h+55,y+h,mm(m.breedte)+' mm');
    out+=maatV(x-48,y,y+h,x,mm(m.hoogte)+' mm');
    out+='<line x1="'+(x-15)+'" y1="'+(y+h)+'" x2="'+(x+w+25)+'" y2="'+(y+h)+'" class="level"/><text x="'+(x+w+35)+'" y="'+(y+h+4)+'" class="tiny bold">±0,000 B.K. AFGEWERKTE VLOER</text>';
    out+='<line x1="'+(x-15)+'" y1="'+y+'" x2="'+(x+w+25)+'" y2="'+y+'" class="level"/><text x="'+(x+w+35)+'" y="'+(y+4)+'" class="tiny bold">+'+m.hoogte.toFixed(3)+' DAKRAND</text>';
    out+='<text x="900" y="180" class="label bold">GEVELAFWERKING</text><text x="900" y="208" class="small">'+esc(m.wand.buiten)+'</text><text x="900" y="250" class="small">Kleur gevel:</text><text x="900" y="271" class="small bold">'+esc(m.facadeColor)+'</text><text x="900" y="305" class="small">Kozijnen:</text><text x="900" y="326" class="small bold">'+esc(m.frameColor)+'</text>';
    out+='<line x1="'+x+'" y1="535" x2="'+(x+w)+'" y2="535" stroke="#777"/><text x="'+x+'" y="558" class="small bold">ACHTERGEVEL · zelfde hoofdmaat, sparingen volgens kozijnmodel</text>';
    out+='<text x="95" y="600" class="small bold">PEIL +'+m.hoogte.toFixed(3)+' m · dakrand</text><text x="95" y="623" class="small">PEIL ±0,000 · afgewerkte vloer dakopbouw</text>'+schaalbalk(850,570,50);
    return out+'</svg>';
  }

  function zijgevels(m){
    var out=sheetStart()+kader(m,'A-05','ZIJGEVELS','1:50');
    out+='<text x="55" y="70" class="title">LINKER- EN RECHTERZIJGEVEL</text>';
    function one(x,y,label){var s=scaleM(50),w=m.diepte*s,h=m.hoogte*s;return '<text x="'+x+'" y="'+(y-20)+'" class="label bold">'+label+'</text><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" class="new" stroke-width="3"/><rect x="'+(x-8)+'" y="'+(y-14)+'" width="'+(w+16)+'" height="14" fill="#333"/>'+maatH(x,x+w,y+h+42,y+h,mm(m.diepte)+' mm')+maatV(x-30,y,y+h,x,mm(m.hoogte)+' mm')+'<line x1="'+(x-5)+'" y1="'+(y+h)+'" x2="'+(x+w+5)+'" y2="'+(y+h)+'" class="level"/>';}
    out+=one(85,175,'LINKERZIJGEVEL');out+=one(590,175,'RECHTERZIJGEVEL');
    out+='<text x="85" y="520" class="small">Gevelsysteem: '+esc(m.wand.code)+' · '+esc(m.wand.naam)+'</text><text x="85" y="545" class="small">Dakrand rondom doorlopend; HWA positie volgens A-03.</text>';
    return out+'</svg>';
  }

  function doorsnede(m){
    var out=sheetStart()+kader(m,'A-06','DOORSNEDE A-A','1:20');
    out+='<text x="55" y="70" class="title">DOORSNEDE A–A · WAND / DAK / VLOER</text>';
    out+='<rect x="120" y="520" width="610" height="85" class="existing"/><text x="150" y="570" class="small bold">BESTAANDE WONING / DRAAGCONSTRUCTIE</text>';
    out+='<rect x="170" y="210" width="58" height="310" class="hatch"/><text x="245" y="360" class="small bold">'+esc(m.wand.code)+'</text><text x="245" y="380" class="small">HSB buitenwand</text>';
    out+='<rect x="170" y="178" width="490" height="32" class="hatch"/><rect x="170" y="158" width="490" height="20" class="ins"/><rect x="170" y="151" width="490" height="7" fill="#333"/>';
    out+='<rect x="170" y="490" width="490" height="30" class="hatch"/>';
    out+='<line x1="148" y1="210" x2="148" y2="520" class="dim"/><text x="138" y="370" transform="rotate(-90 138 370)" text-anchor="middle" class="dimtxt">'+mm(m.hoogte)+' mm vrije constructiehoogte</text>';
    out+='<line x1="115" y1="520" x2="740" y2="520" class="level"/><text x="750" y="524" class="tiny bold">±0,000</text><line x1="115" y1="151" x2="680" y2="151" class="level"/><text x="690" y="155" class="tiny bold">+'+m.hoogte.toFixed(3)+' DAKRAND</text>';
    out+='<path d="M655 170 L765 120" class="leader"/><text x="775" y="116" class="small bold">D-01 WARM PLAT DAK</text><text x="775" y="137" class="small">'+esc(m.dak.materiaalLabel)+' '+esc(m.dak.profiel)+'</text>';
    out+='<path d="M205 325 L765 300" class="leader"/><text x="775" y="296" class="small bold">'+esc(m.wand.code)+' BUITENWAND</text><text x="775" y="317" class="small">'+esc(m.wand.naam)+'</text>';
    out+='<path d="M500 505 L765 455" class="leader"/><text x="775" y="451" class="small bold">V-01 VLOERAANSLUITING</text><text x="775" y="472" class="small">'+esc(m.vloer.materiaalLabel)+' '+esc(m.vloer.profiel)+'</text>';
    out+='<text x="775" y="520" class="small bold">KRITISCH</text><text x="775" y="541" class="note">Oplegging op bestaande bouw</text><text x="775" y="559" class="note">na inmeting + constructieve toets.</text>';
    return out+'</svg>';
  }

  function doorsnedeBB(m){
    var out=sheetStart()+kader(m,'A-07','DOORSNEDE B-B','1:20');
    out+='<text x="55" y="70" class="title">DOORSNEDE B–B · KOZIJN / TRAPGAT / DAK</text>';
    out+='<rect x="120" y="510" width="650" height="95" class="existing"/><rect x="165" y="205" width="55" height="305" class="hatch"/><rect x="680" y="205" width="55" height="305" class="hatch"/>';
    out+='<rect x="165" y="170" width="570" height="35" class="hatch"/><rect x="165" y="150" width="570" height="20" class="ins"/><rect x="165" y="143" width="570" height="7" fill="#333"/>';
    out+='<rect x="335" y="285" width="245" height="225" class="glass" stroke-width="5"/><line x1="457" y1="285" x2="457" y2="510" stroke="#222" stroke-width="4"/>';
    out+='<rect x="145" y="510" width="230" height="18" fill="#fff" stroke="#a32323" stroke-width="3" stroke-dasharray="8 5"/><text x="150" y="552" class="small bold">TRAPGAT / RAVELING</text>';
    out+='<line x1="100" y1="510" x2="785" y2="510" class="level"/><text x="790" y="514" class="tiny bold">±0,000</text><line x1="145" y1="143" x2="755" y2="143" class="level"/><text x="765" y="147" class="tiny bold">+'+m.hoogte.toFixed(3)+' DAKRAND</text>';
    out+='<path d="M575 300 L820 245" class="leader"/><text x="830" y="240" class="small bold">K-01 KOZIJNAANSLUITING</text><text x="830" y="262" class="note">kop / neg / dorpel zie B-03</text>';
    out+='<path d="M255 516 L820 420" class="leader"/><text x="830" y="414" class="small bold">V-02 TRAPGATRAVELING</text><text x="830" y="436" class="note">dubbele LVL/C24 randbalken</text>';
    out+='<text x="120" y="640" class="note">Exacte trapgeometrie en sparing controleren op bestaande trap, verdiepingshoogte en vrije doorloophoogte.</text>';
    return out+'</svg>';
  }

  function detailWand(m){
    var out=sheetStart()+kader(m,'B-01','WANDOPBOUW '+m.wand.code,'1:5');
    out+='<text x="55" y="70" class="title">DETAIL '+esc(m.wand.code)+' · '+esc(m.wand.naam).toUpperCase()+'</text>';
    var x=120,y=135,total=m.wand.lagen.reduce(function(a,l){return a+l[1];},0),scale=1.15,xx=x;
    m.wand.lagen.forEach(function(l,i){
      var ww=Math.max(4,l[1]*scale); var cls=/isol|minerale|EPS|PIR/i.test(l[0])?'ins':(/vuren|OSB|beplating/i.test(l[0])?'hatch':'new');
      out+='<rect x="'+xx+'" y="'+y+'" width="'+ww+'" height="330" class="'+cls+'"/>';
      xx+=ww;
    });
    out+='<text x="120" y="492" class="small bold">BUITEN</text><text x="'+(xx-5)+'" y="492" text-anchor="end" class="small bold">BINNEN</text>';
    out+='<text x="650" y="125" class="label bold">LAAGOPBOUW BUITEN → BINNEN</text>';
    var ty=155;
    m.wand.lagen.forEach(function(l,i){ out+='<text x="650" y="'+ty+'" class="small"><tspan class="bold">'+(i+1)+'. '+esc(l[1])+' mm</tspan>  '+esc(l[0])+'</text>';ty+=30;});
    out+='<text x="120" y="545" class="small bold">Totale nominale wanddikte: '+rond1(total)+' mm</text>';
    out+='<text x="120" y="585" font-size="12" font-weight="700" fill="#333">Technische notitie:</text>';
    out+='<text x="120" y="605" font-size="11" fill="#333">'+esc(m.wand.noot)+'</text>';
    return out+'</svg>';
  }
  function rond1(v){return Math.round(v*10)/10;}

  function constructie(m){
    var out=sheetStart()+kader(m,'C-03','CONSTRUCTIEVE UITGANGSPUNTEN','n.v.t.');
    out+='<text x="55" y="70" class="title">CONSTRUCTIEVE UITGANGSPUNTEN · VUREN C24 / LVL</text>';
    out+='<text x="70" y="115" class="label bold">VOORDIMENSIONERING VLOER</text><text x="70" y="144" class="small">Materiaal: '+esc(m.vloer.materiaalLabel)+'</text><text x="70" y="168" class="small">Profiel: <tspan class="bold">'+esc(m.vloer.profiel)+'</tspan> · h.o.h. '+Math.round(m.vloer.spacing*1000)+' mm · span '+mm(m.vloer.span)+' mm</text>';
    if(m.vloer.check) out+='<text x="70" y="192" class="small">Buiging '+m.vloer.check.sigma+' / '+m.vloer.check.fmd+' N/mm² · afschuiving '+m.vloer.check.tau+' / '+m.vloer.check.fvd+' N/mm² · doorbuiging '+m.vloer.check.defl+' / '+m.vloer.check.deflMax+' mm</text>';
    out+='<text x="70" y="245" class="label bold">VOORDIMENSIONERING DAK</text><text x="70" y="274" class="small">Materiaal: '+esc(m.dak.materiaalLabel)+'</text><text x="70" y="298" class="small">Profiel: <tspan class="bold">'+esc(m.dak.profiel)+'</tspan> · h.o.h. '+Math.round(m.dak.spacing*1000)+' mm · span '+mm(m.dak.span)+' mm</text>';
    if(m.dak.check) out+='<text x="70" y="322" class="small">Buiging '+m.dak.check.sigma+' / '+m.dak.check.fmd+' N/mm² · afschuiving '+m.dak.check.tau+' / '+m.dak.check.fvd+' N/mm² · doorbuiging '+m.dak.check.defl+' / '+m.dak.check.deflMax+' mm</text>';
    out+='<text x="70" y="365" class="label bold">VOORSELECTIETABEL 4–7 M · h.o.h. 600</text>';
    out+='<text x="70" y="392" class="tiny bold">SPAN</text><text x="145" y="392" class="tiny bold">VLOER</text><text x="435" y="392" class="tiny bold">DAK</text>';
    [4,5,6,7].forEach(function(sp,i){var vv=global.NGBouwkundig.voordimensioneer('vloer',sp),dd=global.NGBouwkundig.voordimensioneer('dak',sp),yy=418+i*24;out+='<text x="70" y="'+yy+'" class="small">'+sp+' m</text><text x="145" y="'+yy+'" class="small">'+esc(vv.materiaal)+' '+esc(vv.profiel)+'</text><text x="435" y="'+yy+'" class="small">'+esc(dd.materiaal)+' '+esc(dd.profiel)+'</text>';});
    out+='<rect x="65" y="530" width="960" height="105" fill="#fff8e6" stroke="#9b7b2f"/>';
    out+='<text x="85" y="558" class="small bold">VRIJGAVE</text><text x="85" y="582" class="note">Voorselectie controleert buiging, afschuiving, doorbuiging en slankheid. Bestaande bouw, oplegdruk, stabiliteit, trillingen, verbindingen, wind/sneeuw en brand projectspecifiek bevestigen.</text>';
    out+='<text x="85" y="612" class="small bold">Voor uitvoering: constructeur paraaf / revisie: __________________________</text>';
    return out+'</svg>';
  }

  function constructiePlan(m,kind){
    var isV=kind==='vloer', r=isV?m.vloer:m.dak, blad=isV?'C-01':'C-02', titel=isV?'CONSTRUCTIE VLOER':'CONSTRUCTIE DAK';
    var x=150,y=175,s=scaleM(50),W=m.breedte*s,H=m.diepte*s;
    var out=sheetStart()+kader(m,blad,titel,'1:50');
    out+='<text x="55" y="70" class="title">'+titel+' · BALKENPLAN</text><rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" fill="#fff" stroke="#111" stroke-width="5"/>';
    var vert=m.diepte<=m.breedte, aantal=Math.ceil(m.langs/r.spacing)+1;
    for(var i=0;i<aantal;i++){var p=i/(aantal-1);if(vert){var xx=x+p*W;out+='<line x1="'+xx+'" y1="'+(y+5)+'" x2="'+xx+'" y2="'+(y+H-5)+'" stroke="#a77b27" stroke-width="3"/>';}else{var yy=y+p*H;out+='<line x1="'+(x+5)+'" y1="'+yy+'" x2="'+(x+W-5)+'" y2="'+yy+'" stroke="#a77b27" stroke-width="3"/>';}}
    if(isV){
      var tx=x+W*.12,ty=y+H*.25,tw=Math.min(W*.38,s*2.6),th=Math.min(H*.3,s*.9);
      out+='<rect x="'+tx+'" y="'+ty+'" width="'+tw+'" height="'+th+'" fill="#fff" stroke="#a32323" stroke-width="4"/><text x="'+(tx+tw/2)+'" y="'+(ty+th/2)+'" text-anchor="middle" class="tiny">TRAPGAT · DUBBELE RAVELING</text>';
    } else if(m.skylight&&m.skylight!=='none'){
      out+='<rect x="'+(x+W*.35)+'" y="'+(y+H*.3)+'" width="'+(W*.30)+'" height="'+(H*.26)+'" class="glass" stroke-width="4"/><text x="'+(x+W*.5)+'" y="'+(y+H*.45)+'" text-anchor="middle" class="tiny">RAVELING LICHTSTRAAT</text>';
    }
    out+='<text x="850" y="150" class="label bold">BALKMERK '+(isV?'V1':'D1')+'</text><text x="850" y="182" class="small bold">'+esc(r.materiaalLabel)+'</text><text x="850" y="206" class="small bold">'+esc(r.profiel)+'</text><text x="850" y="230" class="small">h.o.h. '+Math.round(r.spacing*1000)+' mm</text><text x="850" y="254" class="small">vrije span '+mm(r.span)+' mm</text>';
    if(r.check) out+='<text x="850" y="300" class="small bold">VOORCHECK</text><text x="850" y="325" class="note">σm '+r.check.sigma+' / '+r.check.fmd+' N/mm²</text><text x="850" y="348" class="note">τ '+r.check.tau+' / '+r.check.fvd+' N/mm²</text><text x="850" y="371" class="note">w '+r.check.defl+' / '+r.check.deflMax+' mm</text>';
    out+=maatH(x,x+W,y+H+45,y+H,mm(m.breedte)+' mm')+maatV(x-38,y,y+H,x,mm(m.diepte)+' mm');
    out+='<text x="850" y="425" class="small bold">OPLEGGINGEN</text><text x="850" y="449" class="note">Min. opleglengte en</text><text x="850" y="469" class="note">bevestiging berekenen.</text><text x="850" y="505" class="note">Geen sparingen/boringen</text><text x="850" y="525" class="note">zonder detailvrijgave.</text>'+schaalbalk(850,575,50);
    return out+'</svg>';
  }

  function detailDakrand(m){
    var out=sheetStart()+kader(m,'B-02','DAKRAND + HWA','1:5');
    out+='<text x="55" y="70" class="title">DETAIL D-02 · DAKRAND / AFSCHOT / HWA</text>';
    out+='<rect x="130" y="230" width="500" height="45" class="hatch"/><rect x="130" y="195" width="500" height="35" class="ins"/><path d="M130 188 L630 172" stroke="#222" stroke-width="7"/>';
    out+='<rect x="120" y="160" width="28" height="230" class="hatch"/><rect x="95" y="150" width="35" height="250" fill="#444"/><rect x="130" y="275" width="55" height="240" class="hatch"/>';
    out+='<path d="M620 180 L620 330 Q620 350 645 350 L680 350" stroke="#3a6b88" stroke-width="10" fill="none"/><path d="M680 350 L680 525" stroke="#3a6b88" stroke-width="18"/>';
    var notes=[['EPDM/bitumen doorgezet over opstand',700,160],['PIR afschotisolatie ≥ 1:80',700,205],['OSB/3 dakbeschot 18 mm',700,250],['LVL/C24 dakbalk '+m.dak.profiel,700,295],['Geïsoleerde dakrand / boeiboord',700,340],['Noodoverstort waar vereist',700,385],['HWA Ø80/100 projectspecifiek',700,430],['Luchtdichte aansluiting wand-dak',700,475]];
    notes.forEach(function(n){out+='<text x="'+n[1]+'" y="'+n[2]+'" class="small">• '+esc(n[0])+'</text>';});
    out+='<text x="130" y="570" class="note">Dakrandhoogte, noodoverstort en afvoercapaciteit afstemmen op dakoppervlak en projectspecifieke hemelwaterberekening.</text>';
    return out+'</svg>';
  }

  function detailKozijn(m){
    var out=sheetStart()+kader(m,'B-03','KOZIJNAANSLUITINGEN','1:5');
    out+='<text x="55" y="70" class="title">KOZIJNDETAILS · KOP / NEG / ONDERDORPEL</text>';
    function frame(x,y,label,onder){
      var s='<text x="'+x+'" y="'+(y-25)+'" class="label bold">'+label+'</text><rect x="'+x+'" y="'+y+'" width="150" height="250" class="hatch"/><rect x="'+(x+150)+'" y="'+(y+70)+'" width="95" height="105" class="glass" stroke-width="5"/><rect x="'+(x-24)+'" y="'+y+'" width="24" height="250" class="new"/>';
      if(onder)s+='<path d="M'+(x+140)+' '+(y+180)+' L'+(x+265)+' '+(y+190)+' L'+(x+280)+' '+(y+215)+'" fill="none" stroke="#3a6b88" stroke-width="5"/>';
      return s;
    }
    out+=frame(85,190,'K-01 KOPDETAIL',false)+frame(420,190,'K-02 NEGDETAIL',false)+frame(755,190,'K-03 ONDERDORPEL',true);
    out+='<text x="85" y="500" class="small bold">ALGEMEEN</text><text x="85" y="526" class="note">• Stelkozijn en bevestiging op HSB stijl/latei</text><text x="85" y="548" class="note">• binnenzijde luchtdicht / dampremmend aansluiten</text><text x="85" y="570" class="note">• buitenzijde slagregendicht en dampopen</text><text x="85" y="592" class="note">• waterslag/dorpel met afschot en lekdorpel</text><text x="85" y="614" class="note">• steenstrip/Keralit/stuc/composiet beëindigen met systeemprofiel</text>';
    return out+'</svg>';
  }

  function detailVloerTrap(m){
    var out=sheetStart()+kader(m,'B-04','VLOER + TRAPGAT','1:10');
    out+='<text x="55" y="70" class="title">VLOERAANSLUITING · BESTAANDE BOUW / TRAPGAT</text>';
    out+='<rect x="80" y="430" width="720" height="130" class="existing"/><text x="110" y="520" class="small bold">BESTAANDE DAK-/VLOERCONSTRUCTIE · INMETEN</text>';
    out+='<rect x="120" y="365" width="620" height="65" class="hatch"/><text x="135" y="398" class="small bold">V1 '+esc(m.vloer.materiaalLabel)+' '+esc(m.vloer.profiel)+'</text>';
    out+='<rect x="175" y="365" width="245" height="65" fill="#fff" stroke="#a32323" stroke-width="4"/><text x="298" y="402" text-anchor="middle" class="tiny">TRAPGAT 2600 × 900 · positie project</text>';
    out+='<rect x="165" y="345" width="265" height="20" class="hatch"/><rect x="430" y="345" width="38" height="85" class="hatch"/>';
    out+='<path d="M465 380 L850 210" class="leader"/><text x="860" y="205" class="small bold">DUBBELE RAVELBALK</text><text x="860" y="228" class="note">LVL/C24 conform berekening</text>';
    out+='<path d="M650 425 L850 330" class="leader"/><text x="860" y="325" class="small bold">OPLEGLIJN</text><text x="860" y="348" class="note">druk / bevestiging / stabiliteit</text>';
    out+='<text x="80" y="610" class="note">Niet bouwen op uitsluitend bestaand dakbeschot. Lasten terugbrengen naar aantoonbaar dragende wanden/liggers/fundering.</text>';
    return out+'</svg>';
  }

  function materiaalBlad(m){
    var out=sheetStart()+kader(m,'M-01','MATERIAAL- EN OPBOUWSTAAT','n.v.t.');
    out+='<text x="55" y="70" class="title">MATERIAAL- EN OPBOUWSTAAT</text>';
    out+='<text x="55" y="112" class="label bold">'+esc(m.wand.code)+' · '+esc(m.wand.naam)+'</text>';
    var y=142;
    m.wand.lagen.forEach(function(l,i){out+='<text x="65" y="'+y+'" class="small bold">'+(i+1)+'. '+esc(l[1])+' mm</text><text x="180" y="'+y+'" class="small">'+esc(l[0])+'</text>';y+=25;});
    out+='<text x="575" y="112" class="label bold">D-01 · DAKOPBOUW</text>';y=142;
    m.dakopbouw.forEach(function(l,i){out+='<text x="585" y="'+y+'" class="small bold">'+esc(l[1])+' mm</text><text x="665" y="'+y+'" class="small">'+esc(l[0])+'</text>';y+=25;});
    out+='<text x="575" y="360" class="label bold">V-01 · VLOEROPBOUW</text>';y=390;
    m.vloeropbouw.forEach(function(l,i){out+='<text x="585" y="'+y+'" class="small bold">'+esc(l[1])+' mm</text><text x="665" y="'+y+'" class="small">'+esc(l[0])+'</text>';y+=25;});
    out+='<text x="55" y="430" class="label bold">PROJECTUITGANGSPUNTEN</text><text x="55" y="460" class="small">Gevelkleur: '+esc(m.facadeColor)+' · kozijnkleur: '+esc(m.frameColor)+' · dak: '+esc(m.roofing)+'</text><text x="55" y="486" class="small">Oppervlak '+m.opp+' m² · hoofdmaat '+mm(m.breedte)+' × '+mm(m.diepte)+' mm</text>';
    out+='<rect x="55" y="525" width="980" height="95" fill="#fff8e6" stroke="#9b7b2f"/><text x="75" y="555" class="small bold">DOCUMENTSTATUS</text><text x="75" y="580" class="note">Voorontwerp. Fabrikantspecifieke systeemdetails, constructieve verbindingen, bestaande bouw en brand-/bouwfysische prestaties vóór uitvoering verifiëren.</text>';
    return out+'</svg>';
  }

  function kozijnStaat(m){
    var out=sheetStart()+kader(m,'A-08','KOZIJN- EN SPARINGENSTAAT','1:25');
    out+='<text x="55" y="70" class="title">KOZIJN- EN SPARINGENSTAAT</text>';
    out+='<rect x="55" y="110" width="1010" height="42" fill="#eee" stroke="#222"/><text x="70" y="136" class="tiny bold">MERK</text><text x="150" y="136" class="tiny bold">AANZICHT</text><text x="520" y="136" class="tiny bold">POSITIE</text><text x="675" y="136" class="tiny bold">MATERIAAL / KLEUR</text><text x="930" y="136" class="tiny bold">OPMERKING</text>';
    out+='<rect x="55" y="152" width="1010" height="330" fill="#fff" stroke="#222"/><line x1="130" y1="152" x2="130" y2="482" class="thin"/><line x1="500" y1="152" x2="500" y2="482" class="thin"/><line x1="655" y1="152" x2="655" y2="482" class="thin"/><line x1="910" y1="152" x2="910" y2="482" class="thin"/>';
    out+='<text x="75" y="185" class="small bold">K01</text>'+kozijnAanzicht(m,165,195,290,185)+'<text x="520" y="185" class="small">hoofdgevel</text><text x="675" y="185" class="small">aluminium / kunststof</text><text x="675" y="207" class="small bold">'+esc(m.frameColor)+'</text><text x="930" y="185" class="tiny">maatvoering</text><text x="930" y="203" class="tiny">projectspecifiek</text>';
    out+='<text x="150" y="410" class="tiny">KOZIJNMODEL: '+esc(m.kozijn && m.kozijn!=='none' ? m.kozijn : 'geen kozijn gekozen')+'</text><text x="150" y="430" class="tiny">Exacte dagmaat en stelruimte na keuze fabricaat.</text>';
    out+='<text x="55" y="525" class="label bold">AANSLUITPRINCIPE</text><text x="55" y="552" class="note">Binnenzijde luchtdicht/dampremmend · midden geïsoleerd · buitenzijde slagregendicht en dampopen.</text><text x="55" y="574" class="note">Kop/neg/onderdorpel volgens B-03. Waterslag met afschot en lekdorpel; systeemprofiel passend bij '+esc(m.wand.code)+'.</text>';
    out+='<rect x="55" y="605" width="1010" height="48" fill="#f7f7f7" stroke="#aaa"/><text x="70" y="625" class="tiny bold">PRODUCTIEMATEN</text><text x="70" y="643" class="tiny">Nooit uit schaal meten. Alle kozijn-, sparing- en stelkozijnmaten vóór bestelling controleren op definitieve maatstaat.</text>';
    return out+'</svg>';
  }

  function algemeenBlad(m){
    var out=sheetStart()+kader(m,'M-02','ALGEMENE UITGANGSPUNTEN / LEGENDA','n.v.t.');
    out+='<text x="55" y="70" class="title">ALGEMENE UITGANGSPUNTEN · LEGENDA · VERGUNNINGSCHECK</text>';
    out+='<text x="55" y="112" class="label bold">TEKENAFSPRAKEN</text><line x1="55" y1="140" x2="115" y2="140" class="heavy"/><text x="130" y="145" class="small">nieuw / snede</text><line x1="55" y1="170" x2="115" y2="170" class="thin"/><text x="130" y="175" class="small">aanzicht / secundair</text><rect x="55" y="193" width="60" height="24" class="existing"/><text x="130" y="210" class="small">bestaande bouw</text><line x1="55" y1="240" x2="115" y2="240" class="section"/><text x="130" y="245" class="small">doorsnedelijn</text>';
    out+='<text x="380" y="112" class="label bold">MAATVOERING & PEILEN</text><text x="380" y="142" class="note">• alle maten in mm, tenzij anders vermeld</text><text x="380" y="166" class="note">• hoogten in m t.o.v. projectpeil ±0,000</text><text x="380" y="190" class="note">• niet uit tekening meten; maatcijfers zijn leidend</text><text x="380" y="214" class="note">• bestaande maatvoering altijd ter plaatse controleren</text><text x="380" y="238" class="note">• plattegrond: horizontale snede ca. 1.200 mm + vloer</text>';
    out+='<text x="730" y="112" class="label bold">SCHAALSTRUCTUUR</text><text x="730" y="142" class="note">Situatie 1:500 / 1:1000</text><text x="730" y="166" class="note">Plattegrond / gevel 1:50</text><text x="730" y="190" class="note">Doorsneden 1:20</text><text x="730" y="214" class="note">Details 1:5 / 1:10</text>';
    out+='<rect x="55" y="300" width="1010" height="255" fill="#fbfbfb" stroke="#777"/><text x="75" y="332" class="label bold">VERGUNNINGSCHECK · AUTOMATISCHE SET</text>';
    var checks=['situatie + noordpijl','plattegrond met materialen / ruimten / peil','gevelaanzichten loodrechte projectie','doorsneden + hoogtelijnen','maatvoering + schaalaanduiding','constructieprincipe vloer en dak','principedetails HSB / dak / kozijn','materiaal- en opbouwstaat'];
    checks.forEach(function(t,i){var col=i<4?75:545,row=i%4;out+='<text x="'+col+'" y="'+(366+row*34)+'" class="small">✓ '+esc(t)+'</text>';});
    out+='<text x="75" y="520" class="tiny bold">PROJECTSPECIFIEK NOG TE KOPPELEN:</text><text x="305" y="520" class="tiny">adres/perceel + bestaande inmeting · lokale omgevingsplancheck · definitieve constructieberekening · brand/bouwfysica waar van toepassing</text>';
    out+='<rect x="55" y="585" width="1010" height="58" fill="#fff8e6" stroke="#9b7b2f"/><text x="70" y="607" class="tiny bold">STATUS '+esc(m.project)+'</text><text x="70" y="628" class="tiny">Parametrische vergunnings-/voorontwerpset. Na koppeling van projectgegevens en vereiste projectspecifieke berekeningen gereedmaken voor formele indiening.</text>';
    return out+'</svg>';
  }

  function deurRuimteStaat(m){
    var kp=m.kamerplan||{deuren:[],ruimten:[]}, out=sheetStart()+kader(m,'A-09','DEUR- EN RUIMTESTAAT','n.v.t.');
    out+='<text x="55" y="70" class="title">DEUR- EN RUIMTESTAAT · DAKOPBOUW</text>';
    out+='<rect x="55" y="105" width="510" height="40" fill="#eee" stroke="#222"/><text x="70" y="130" class="tiny bold">RUIMTE</text><text x="325" y="130" class="tiny bold">OPPERVLAK</text><text x="430" y="130" class="tiny bold">GEBRUIK</text>';
    var ry=172;(kp.ruimten||[]).forEach(function(r,i){out+='<text x="70" y="'+ry+'" class="small bold">R'+String(i+1).padStart(2,'0')+' · '+esc(r.naam)+'</text><text x="325" y="'+ry+'" class="small">'+Number(r.opp||0).toFixed(1)+' m²</text><text x="430" y="'+ry+'" class="small">'+(/badkamer/i.test(r.naam)?'badruimte':'verblijfs-/nevenruimte*')+'</text>';ry+=34;});
    out+='<text x="70" y="440" class="small bold">TG-01 · TRAPGAT / TOEGANG VANUIT BESTAANDE VERDIEPING</text>';
    out+='<rect x="600" y="105" width="465" height="40" fill="#eee" stroke="#222"/><text x="615" y="130" class="tiny bold">MERK</text><text x="690" y="130" class="tiny bold">TYPE</text><text x="850" y="130" class="tiny bold">VRIJE DOORGANG</text><text x="990" y="130" class="tiny bold">DRAAI</text>';
    var dy=172;(kp.deuren||[]).forEach(function(d,i){out+='<text x="615" y="'+dy+'" class="small bold">'+esc(d.code||('D-'+(i+1)))+'</text><text x="690" y="'+dy+'" class="small">binnendeur</text><text x="850" y="'+dy+'" class="small">880 mm</text><text x="990" y="'+dy+'" class="small">'+esc(d.draai||'vlgs. plan')+'</text>';dy+=34;});
    out+='<rect x="55" y="475" width="1010" height="150" fill="#fff8e6" stroke="#9b7b2f"/><text x="75" y="505" class="label bold">CONTROLEPUNTEN</text><text x="75" y="535" class="note">• deurmaten zijn vrije doorgang; definitieve sparing volgens gekozen kozijnfabricaat</text><text x="75" y="559" class="note">• trapgeometrie, vrije hoogte, balustrade en overloop na inmeting definitief uitwerken</text><text x="75" y="583" class="note">• badkamervloer, afschot, waterdichting en leidingtracé projectspecifiek detailleren</text><text x="75" y="607" class="note">• * gebruiksfunctie en verblijfsgebied bevestigen in definitief bouwbesluitdossier</text>';
    return out+'</svg>';
  }

  function prestaties(m){
    var out=sheetStart()+kader(m,'E-01','BOUWFYSICA / INSTALLATIES','n.v.t.');
    out+='<text x="55" y="70" class="title">BOUWFYSICA · DAGLICHT · VENTILATIE · BRAND</text>';
    out+='<text x="55" y="118" class="label bold">THERMISCHE SCHIL</text><text x="55" y="150" class="note">Wand '+esc(m.wand.code)+' · doorlopende isolatie en luchtdichte laag volgens B-01.</text><text x="55" y="176" class="note">Warm plat dak D-01 · PIR afschotisolatie · koudebrugvrije dakrand volgens B-02.</text><text x="55" y="202" class="note">Vloeraansluiting op bestaande woning luchtdicht en thermisch controleren.</text>';
    out+='<text x="55" y="255" class="label bold">DAGLICHT / SPUI</text><text x="55" y="287" class="note">Per slaapkamer/verblijfsruimte daglicht en spuicapaciteit berekenen na kozijnmaat.</text><text x="55" y="313" class="note">Doorvalveiligheid en bediening te openen delen afstemmen op borstweringshoogte.</text>';
    out+='<text x="575" y="118" class="label bold">VENTILATIE / SANITAIR</text><text x="575" y="150" class="note">Toevoer in slaapkamers; overstroom via deuren; mechanische afvoer badkamer.</text><text x="575" y="176" class="note">Ventilatiebalans aansluiten op bestaand systeem of separate WTW ontwerpen.</text><text x="575" y="202" class="note">Standleiding, water en elektra via gecontroleerde schachten/doorvoeren.</text>';
    out+='<text x="575" y="255" class="label bold">BRAND / VLUCHTEN</text><text x="575" y="287" class="note">Rookmelders, vluchtroute via trap en brandwerendheid constructie toetsen.</text><text x="575" y="313" class="note">Afstand tot perceelgrens en gevelopeningen betrekken bij brandoverslagtoets.</text>';
    out+='<rect x="55" y="380" width="1010" height="225" fill="#fbfbfb" stroke="#777"/><text x="75" y="414" class="label bold">DEFINITIEF DOSSIER · NOG PROJECTSPECIFIEK INVULLEN</text>';
    ['Rc-/U-waardeberekening','BENG/energie indien van toepassing','ventilatiebalans','daglichtberekening','brandveiligheids-/vluchttoets','luchtdichtheidsconcept','geluidwering indien vereist','installatie- en doorvoerplan'].forEach(function(t,i){var x=i<4?75:565,y=450+(i%4)*34;out+='<text x="'+x+'" y="'+y+'" class="small">□ '+esc(t)+'</text>';});
    return out+'</svg>';
  }

  function sheets(m){
    return [
      voorblad(m), bestaandeSituatie(m), plattegrond(m), dakplan(m), gevel(m), zijgevels(m),
      doorsnede(m), doorsnedeBB(m), kozijnStaat(m), constructiePlan(m,'vloer'), constructiePlan(m,'dak'),
      constructie(m), detailWand(m), detailDakrand(m), detailKozijn(m), detailVloerTrap(m), materiaalBlad(m)
      ,algemeenBlad(m), deurRuimteStaat(m), prestaties(m)
    ];
  }

  function pakketHtml(m){
    var bladen=sheets(m);
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Technisch tekeningenpakket '+esc(m.project)+'</title><style>body{margin:0;background:#333;font-family:Arial}header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center}header b{font-size:14px}button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}.sheet{width:min(96vw,1120px);margin:22px auto;box-shadow:0 8px 28px #0008;background:#fff}.sheet svg{display:block;width:100%;height:auto}@media print{header{display:none}body{background:#fff}.sheet{width:100%;margin:0;box-shadow:none;page-break-after:always}.sheet:last-child{page-break-after:auto}}@page{size:A3 landscape;margin:0}</style></head><body><header><b>'+esc(m.project)+' · compleet technisch tekeningenpakket · '+bladen.length+' bladen</b><button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>'+bladen.map(function(s){return '<div class="sheet">'+s+'</div>';}).join('')+'</body></html>';
  }

  function openPakket(){
    if(!global.NGBouwkundig) return alert('Bouwkundige module is nog niet geladen.');
    var cfg = typeof global.NGKeuze === 'function' ? (global.NGKeuze() || {}) : {};
    var m = global.NGBouwkundig.model(cfg), pd=leesProject(); Object.keys(pd).forEach(function(k){if(pd[k])m[k]=pd[k];});
    NGAfdruk.toon(pakketHtml(m), 'ng-tekeningen', 'Technische tekeningen dakopbouw');
  }

  function leesProject(){try{return JSON.parse(global.localStorage.getItem('ng-dakopbouw-project')||'{}');}catch(e){return {};}}
  function projectDialoog(){var p=leesProject(),v=global.prompt('Projectgegevens dakopbouw (project | adres | datum | revisie)',[p.project||'Dakopbouw op bestaande woning',p.adres||'',p.datum||new Date().toLocaleDateString('nl-NL'),p.revisie||'P01'].join(' | '));if(v===null)return;var a=v.split('|').map(function(x){return x.trim();});p={project:a[0]||'Dakopbouw op bestaande woning',adres:a[1]||'',datum:a[2]||new Date().toLocaleDateString('nl-NL'),revisie:a[3]||'P01'};global.localStorage.setItem('ng-dakopbouw-project',JSON.stringify(p));alert('Projectgegevens opgeslagen voor de dakopbouwtekeningen.');}
  function init(){ var b=document.getElementById('tekeningenBtn'); if(b){b.addEventListener('click',openPakket);var p=document.createElement('button');p.type='button';p.className='btn btn--ghost';p.textContent='Projectgegevens';p.title='Adres, datum en revisie voor het dakopbouwdossier';p.addEventListener('click',projectDialoog);b.parentNode.insertBefore(p,b);} }
  if(typeof document!=='undefined'){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init(); }

  global.NGTekeningen={pakketHtml:pakketHtml,sheets:sheets,open:openPakket};
})(typeof window !== 'undefined' ? window : globalThis);
