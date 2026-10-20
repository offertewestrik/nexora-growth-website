
/* De dakrenovatieconfigurator.
 *
 * EEN ANDERE PRODUCTLIJN DAN DE DAKOPBOUW
 * Een dakopbouw zet een verdieping op een dak; deze pagina vervangt het dak
 * dat er ligt. De koper is ook een ander mens: die heeft een lekkage, mos
 * tussen de pannen of een dak van veertig jaar oud. Daarom staat dit los,
 * met eigen beelden (tools/dakrenovatie-renderlijst.py, 92 stuks over twee
 * vaste woningen) en een eigen prijsmodel.
 *
 * DE BEELDEN
 * Elke keuze wijst naar een rijnummer uit de renderlijst; het adres en de
 * aanwezigheid komen uit assets/dakrenovatie-beelden.js. Wijst een keuze naar
 * een beeld dat er nog niet ligt, dan blijft het vorige beeld gedimd staan
 * met "Render volgt" erop - nooit het beeld van een andere keuze, want wie op
 * rode pannen klikt en antraciet ziet, denkt dat hij antraciet krijgt.
 */
(function(){
  'use strict';
  var $=function(s){return document.querySelector(s)};
  var BTW=0.21;

  /* ---------- de keuzelijsten ---------- */
  /* v is het rijnummer uit de renderlijst waar dat kan: dan is de koppeling
     tussen keuze en beeld niet nog een tabel die uit de pas kan lopen. */
  var AANPAK=[
    {v:'reinigen',  l:'Reinigen',              d:'Mos en aanslag eraf',              pm2:12.5},
    {v:'coaten',    l:'Reinigen + coaten',     d:'Schoon en in een nieuwe kleur',    pm2:27.5},
    {v:'vervangen', l:'Volledige renovatie',   d:'Nieuwe folie, panlatten en pannen'},
    {v:'repareren', l:'Reparatie',             d:'Storm- of lekkageschade hersteld', p:495}];
  /* Een plat dak kent andere werkzaamheden. Coaten valt weg - dat is een
     pannendakbehandeling; op bitumen is het geen gangbare oplossing en er is
     ook geen beeld van, en een keuzetegel zonder eerlijk beeld hoort er niet
     te staan. De omschrijvingen gaan over bitumen in plaats van over pannen. */
  var AANPAK_PLAT=[
    {v:'reinigen',  l:'Reinigen',            d:'Mos, blad en aanslag eraf',        pm2:12.5},
    {v:'vervangen', l:'Volledige renovatie', d:'Oude bedekking eraf, nieuwe opbouw erop'},
    {v:'overlagen', l:'Bitumen overlagen', d:'Bestaande opbouw eerst beoordelen; prijs na inspectie'},
    {v:'repareren', l:'Reparatie',           d:'Lekkage of open naden hersteld',   p:495}];
  function aanpakLijst(){ return isPlat()?AANPAK_PLAT:AANPAK; }
  var COAT=[
    {v:'antraciet', l:'Antraciet',      nr:3, sw:'#3a3d42'},
    {v:'rood',      l:'Terracottarood', nr:4, sw:'#9a4a33'}];
  var BEDEKKING=[
    {v:13,l:'Bitumen zwart',        d:'APP, twee lagen', pm2:72},
    {v:14,l:'Bitumen wit',          d:'Reflecterend, koeler', pm2:82},
    {v:15,l:'EPDM rubber',          d:'Eén naadloos vel', pm2:88},
    {v:16,l:'PVC lichtgrijs',       d:'Mechanisch bevestigd', pm2:79},
    {v:17,l:'Grindballast',         d:'Op bitumen, minder uv', pm2:94},
    {v:18,l:'Sedum groendak',       d:'Op EPDM, incl. substraat', pm2:148}];
  var DAGLICHT=[
    {v:26,l:'Geen',            p:0},
    {v:27,l:'Lichtkoepel',     d:'100 × 100 cm', p:1180},
    {v:28,l:'Platdakraam',     d:'Vlak glas',    p:1690},
    {v:29,l:'Lichtstraat',     d:'1 × 3 m',      p:3450}];
  /* Een plat dak heeft GEEN hanggoot. Het water gaat via afschot naar een
     hemelwaterafvoer door het dak of naar een spuwer in de dakrand; langs de
     rand zit een aluminium daktrim met daaronder het boeideel. Hier stond
     eerst wel een gootgroep - dat verkocht werk dat er niet is, en een
     dakdekker die zo'n tekening ziet weet meteen dat de rest ook niet klopt.
     Wat blijft: de daktrim, het boeideel en de afvoer. */
  var BOEI_PLAT=[
    {v:60,l:'Bestaande boeidelen',   pm:0},
    {v:61,l:'Nieuw, wit',            pm:72},
    {v:62,l:'Nieuw, antraciet',      pm:78}];
  var BOEI_PLAT_NIEUW={60:64, 61:65, 62:66};
  var AFVOER=[
    {v:'bestaand', l:'Bestaande afvoer houden', d:'Als hij nog goed doorloopt', p:0},
    {v:'nieuw',    l:'Nieuwe hemelwaterafvoer', d:'Met bladvanger, door het dak', p:340},
    {v:'spuwer', l:'Alleen extra noodoverloop', d:'Bestaande hoofdafvoer blijft', p:210},
    {v:'nieuw-spuwer', l:'Nieuwe afvoer én noodoverloop', d:'Beide onderdelen vernieuwen', p:550}];
  var DAKRAND=[
    {v:30,l:'Bestaande daktrim houden', pm:0},
    {v:31,l:'Nieuwe daktrim antraciet', pm:46},
    {v:32,l:'Nieuwe daktrim lichtgrijs',pm:46}];
  var TERRAS=[
    {v:35,l:'Geen dakterras',   p:0},
    {v:36,l:'Tegels op dragers',d:'60 × 60 op tegeldragers', pm2:95},
    {v:37,l:'Hardhouten vlonder',d:'Op onderregels',         pm2:165}];
  var ZON_PLAT=[
    {v:21,l:'Geen',       p:0},
    {v:22,l:'4 panelen',  p:2300},
    {v:23,l:'6 panelen',  p:3350},
    {v:24,l:'8 panelen',  p:4300}];
  var PROBLEEM_PLAT=[
    {v:39,l:'Blaasvorming'},
    {v:40,l:'Open naden'},
    {v:41,l:'Plasvorming'},
    {v:42,l:'Lekkage bij de opstand'}];
  /* De pannenprijs is kaal: pannen leggen en vastzetten. Het onderdak (folie,
     tengels, panlatten: 22 per m²) staat als eigen keuze in de opbouw. De tegel
     en de offerteregel noemen daardoor hetzelfde bedrag; eerst stond op de tegel
     78 en in de offerte 56, en dat verschil verklaart niemand aan de deur. */
  var PAN=window.NGDakProducten;
  var ZON=[
    {v:21,l:'Geen',       p:0},
    {v:22,l:'4 panelen',  p:2100},
    {v:23,l:'6 panelen',  p:3050},
    {v:24,l:'8 panelen',  p:3900},
    {v:25,l:'10 panelen', p:4750}];
  var RAAM=[
    {v:26,l:'Geen dakraam',        p:0},
    {v:27,l:'1 klein (78×98)',  p:1450},
    {v:28,l:'1 groot (114×140)',p:1950},
    {v:29,l:'2 naast elkaar',      p:2850}];
  var GOOT=[
    {v:30,l:'Bestaande goot houden', pm:0},
    {v:31,l:'Nieuwe zinken goot',    pm:95},
    {v:32,l:'Antraciete bakgoot',    pm:85}];
  var BOEI=[
    {v:0, l:'Bestaande boeidelen',   pm:0, nr:30},
    {v:33,l:'Nieuw, wit',            pm:72},
    {v:34,l:'Nieuw, antraciet',      pm:78}];
  var PROBLEEM=[
    {v:39,l:'Gebroken pannen'},
    {v:40,l:'Verschoven pannen'},
    {v:41,l:'Mos en algen'},
    {v:42,l:'Lekkage bij aansluiting'}];
  var FASEN=[
    {nr:6, l:'Pannen eraf'},{nr:7,l:'Latten eraf'},{nr:8,l:'Dakbeschot'},
    {nr:9, l:'Isolatie'},{nr:10,l:'Folie + latten'},{nr:11,l:'Pannen erop'},
    {nr:12,l:'Klaar'}];
  var FASEN_PLAT=[
    {nr:6, l:'Bitumen eraf'},{nr:7,l:'Dakbeschot'},{nr:9,l:'Isolatie'},
    {nr:10,l:'Onderlaag'},{nr:11,l:'Toplaag'},{nr:12,l:'Klaar'}];
  function fasenLijst(){ return isPlat()?FASEN_PLAT:FASEN; }
  var WONING={
    w01:{l:'Tussenwoning',        titel:'Dakrenovatie tussenwoning',        sub:'Zadeldak · twee dakvlakken',  m2:55,  gootm:12, nok:675,  plat:false},
    w02:{l:'Vrijstaande woning',  titel:'Dakrenovatie vrijstaande woning',  sub:'Schilddak · vier dakvlakken', m2:130, gootm:30, nok:1250, plat:false},
    w03:{l:'Plat dak',            titel:'Renovatie plat dak',               sub:'Uitbouw · bitumen',           m2:24,  gootm:20, nok:0,    plat:true}};
  function isPlat(){ return !!WONING[st.woning].plat; }

  /* De opbouw van een hellende dakrenovatie, als losse keuzes.
   *
   * Dit was eerst één blok: "volledige renovatie" met isolatie als enige
   * aanvinker. Maar een dakrenovatie is geen alles-of-niets. De een laat de
   * pannen vervangen op bestaande latten, de ander wil er folie en tengels bij,
   * en pas als het dakbeschot slecht is gaat dat er ook uit. Wie dat niet kan
   * kiezen, ziet een prijs die niet bij zijn plan hoort - en klikt weg.
   *
   * Elke stap heeft zijn eigen beeld uit de renderlijst, zodat de koper ziet
   * wat hij aanzet. `nr` is het beeld als de stap AAN staat. */
  var OPBOUW=[
    {v:'folie',    l:'Nieuwe folie, tengels en panlatten', d:'Onderdak vernieuwen', pm2:22, nr:10, vast:false},
    {v:'beschot',  l:'Dakbeschot vernieuwen',              d:'Bij rot of doorgezakt beschot', pm2:38, nr:8,  vast:false},
    {v:'isolatie', l:'Isolatiedakplaten buitenzijde',      d:'Warme zolder, geen ruimteverlies', pm2:68, nr:9,  vast:false}];
  var OPBOUW_PLAT=[
    {v:'strippen', l:'Oude bitumen verwijderen',           d:'Tot op het houtbeschot', pm2:16, nr:6,  vast:true},
    {v:'beschot',  l:'Dakbeschot vernieuwen',              d:'Bij rot of doorgezakt beschot', pm2:44, nr:7,  vast:false},
    {v:'isolatie', l:'Isolatie PIR op het dakbeschot',     d:'Dikte en isolatiewaarde na opname bepalen', pm2:58, nr:9,  vast:false},
    {v:'dampremmer',l:'Dampremmende laag',           d:'Onder de isolatie; bedekkingslagen zitten bij dakbedekking', pm2:19, nr:10, vast:true}];
  function opbouwLijst(){ return isPlat()?OPBOUW_PLAT:OPBOUW; }

  /* Een dakkapel hoort niet in deze configurator thuis als product - daar is
     een eigen configurator voor - maar wél als keuze. Wie zijn dak laat
     vernieuwen denkt op dat moment na over een dakkapel: de steiger staat er en
     het dak is open. Achteraf plaatsen betekent het nieuwe dak weer openbreken. */
  /* Dezelfde bedragen als de dakkapelconfigurator (prefab, casco, excl. btw):
     drie glasvakken 6.600, vijf glasvakken 9.300. Hier stond eerst 8.900 en
     13.400 - duurder dan los besteld, terwijl de tekst zegt dat meenemen scheelt. */
  var DAKKAPEL=[
    {v:0, l:'Geen dakkapel',        nr:12},
    {v:55,l:'Dakkapel 2,5 m',       d:'Drie glasvakken, prefab casco', p:6600},
    {v:56,l:'Dakkapel 4,5 m',       d:'Vijf glasvakken, prefab casco', p:9300}];
  /* Steiger, afdekken en afvoer. Bij een reparatie zit dat in de vanafprijs. */
  var VAST={reinigen:350,coaten:750,vervangen:1250,repareren:0,overlagen:0};
  var ISOLATIE_PM2=68, LOOD=850;

  /* Een voorinstelling is een startpunt, geen laag bovenop wat er al stond:
     hij begint bij de standaardkeuzes van de woning en zet daar het zijne op.
     `isolatie` gaat naar de opbouw (daar zit de isolatie sinds die losse
     keuzes werd); de oude vlag st.isolatie deed niets en de voorinstelling
     "met isolatie" rekende dus zonder. Een plat dak coat je niet; daar wordt
     de derde knop 'Reinigen'. */
  var PRESETS=[
    {l:'Complete renovatie', d:'Nieuwe pannen + isolatie', nr:12, s:{aanpak:'vervangen',isolatie:true},
     plat:{l:'Complete renovatie', d:'Nieuwe bedekking + isolatie', nr:12, s:{aanpak:'vervangen',isolatie:true}}},
    {l:'Renovatie + zon',    d:'8 panelen op het nieuwe dak', nr:24, s:{aanpak:'vervangen',zon:24}},
    {l:'Reinigen & coaten',  d:'In antraciet',             nr:3,  s:{aanpak:'coaten',coat:'antraciet'},
     plat:{l:'Reinigen', d:'Mos, blad en aanslag eraf', nr:2, s:{aanpak:'reinigen'}}},
    {l:'Reparatie',          d:'Lekkage of stormschade',   nr:43, s:{aanpak:'repareren',probleem:42}}];
  function presetVoor(i){ var p=PRESETS[i]; return (isPlat()&&p.plat)?p.plat:p; }

  function defaults(w){
    var plat = !!WONING[w].plat;
    return {type:'dakrenovatie', woning:w, aanpak:'vervangen', coat:'antraciet',
            pan:13, bedekking:13, dakkapel:0,
            /* De opbouw staat standaard op wat een eerlijke renovatie is:
               onderdak vernieuwen hoort erbij, dakbeschot alleen als het slecht
               is, isolatie is een keuze. Bij een plat dak zijn strippen en de
               dampremmer geen keuze maar de klus zelf. */
            opbouw: plat ? {strippen:true, beschot:false, isolatie:true, dampremmer:true}
                         : {folie:true, beschot:false, isolatie:false},
            zon:21, raam:26, goot:30, boei:plat?60:0, daglicht:26, dakrand:30, terras:35,
            afvoer:'bestaand', terrasm2:Math.min(15,WONING[w].m2),
            nok:false, lood:false, probleem:plat?42:42,
            m2:WONING[w].m2, gootm:WONING[w].gootm,
            focus:'aanpak', fase:12, aanzicht:'keuze', btw:'incl'};
  }
  function opbouwAan(v){ return !!(st.opbouw && st.opbouw[v]); }
  var st;

  /* De rekenhulp bij het dakvlak: breedte maal diepte over de grond, maal de
     hellingsfactor (1 gedeeld door de cosinus van de dakhelling). Wat de
     bezoeker intypt blijft staan als de keuzes opnieuw getekend worden. */
  var HELLING=[{l:'25°',f:1.10},{l:'30°',f:1.15},{l:'35°',f:1.22},{l:'40°',f:1.31},{l:'45°',f:1.41}];
  var rh={b:'',d:'',s:1.15,open:false};
  function rhM2(){
    var b=parseFloat(String(rh.b).replace(',','.')), d=parseFloat(String(rh.d).replace(',','.'));
    if(!(b>0)||!(d>0)) return 0;
    var f=isPlat()?1:(parseFloat(rh.s)||1.15);
    return Math.max(0, Math.round(b*d*f*10)/10);
  }
  function rhUitkomst(){ var m=rhM2(); return m?m+' m²':'… m²'; }

  /* ---------- de prijs ---------- */
  function euro(n){ return '€ '+Math.round(n).toLocaleString('nl-NL'); }
  function vind(lijst,v){ var u=null; lijst.forEach(function(o){ if(o.v===v) u=o; }); return u; }
  /* De prijs is een lijst regels, geen los getal.
   *
   * De prijsbalk toont de som en de offerte toont de regels, en juist daarom
   * mogen het niet twee berekeningen zijn: dan kan het blad van het scherm
   * afwijken, en is het blad fout zonder dat iemand het merkt. Alles wat een
   * bedrag heeft komt hier vandaan - het scherm telt op, de offerte somt op. */
  function prijs(){
    var a=st.aanpak, R=[];
    function reg(wat,aantal,eh,tarief){
      if(!aantal||!tarief) return;
      R.push({wat:wat, aantal:Math.round(aantal*10)/10, eh:eh, tarief:tarief,
              bedrag:Math.round(aantal*tarief*100)/100});
    }
    if(a==='reinigen'){
      reg('Dakreiniging incl. anti-mosbehandeling',st.m2,'m²',12.5);
    } else if(a==='coaten'){
      reg('Dakreiniging incl. anti-mosbehandeling',st.m2,'m²',12.5);
      reg('Coating tweelaags, '+(st.coat==='rood'?'terracottarood':'antraciet'),st.m2,'m²',15);
    } else if(a==='vervangen'){
      if(isPlat()){
        var bd=vind(BEDEKKING,st.bedekking)||BEDEKKING[0];
        reg('Nieuwe dakbedekking: '+bd.l.toLowerCase(),st.m2,'m²',bd.pm2);
      } else {
        var pan=vind(PAN,st.pan)||{l:'Dakpannen',pm2:56};
        /* Kaal tarief; het onderdak staat als eigen regel in de opbouw. Anders
           zou wie de folie uitzet nog steeds voor folie betalen. */
        reg('Nieuwe dakbedekking: '+pan.l.toLowerCase()+', leggen en vastzetten',st.m2,'m²',pan.pm2);
        reg('Nokvorsten droog bevestigd en loodwerk schoorsteen',1,'post',WONING[st.woning].nok);
      }
      /* De opbouw regel voor regel, precies zoals de koper hem heeft aangezet. */
      opbouwLijst().forEach(function(o){
        if(opbouwAan(o.v)) reg(o.l,st.m2,'m²',o.pm2);
      });
    } else if(a==='repareren') {
      reg('Reparatie storm- of lekkageschade (vanafprijs)',1,'post',495);
    }
    if(isPlat()){
      var zp=vind(ZON_PLAT,st.zon); if(zp&&zp.p) reg('Zonnepanelen op ballastframes: '+zp.l.toLowerCase(),1,'set',zp.p);
      var dl=vind(DAGLICHT,st.daglicht); if(dl&&dl.p) reg('Daglicht: '+dl.l.toLowerCase()+' incl. opstand en aansluiting',1,'set',dl.p);
      var dr=vind(DAKRAND,st.dakrand); if(dr&&dr.pm) reg(dr.l,st.gootm,'m',dr.pm);
      var bp=vind(BOEI_PLAT,st.boei); if(bp&&bp.pm) reg('Boeidelen vervangen, '+(st.boei===61?'wit':'antraciet'),st.gootm,'m',bp.pm);
      var af=vind(AFVOER,st.afvoer); if(af&&af.p) reg(af.l,1,'st',af.p);
      var tr=vind(TERRAS,st.terras); if(tr&&tr.pm2) reg('Dakterras: '+tr.l.toLowerCase(),st.terrasm2,'m²',tr.pm2);
    } else {
      var z=vind(ZON,st.zon); if(z&&z.p) reg('Zonnepanelen full black incl. montage en omvormer: '+z.l.toLowerCase(),1,'set',z.p);
      var rm=vind(RAAM,st.raam); if(rm&&rm.p) reg('Dakraam incl. gootstuk en aansluiting: '+rm.l.toLowerCase(),1,'set',rm.p);
      var dk=vind(DAKKAPEL,st.dakkapel); if(dk&&dk.p) reg('Dakkapel plaatsen: '+dk.l.toLowerCase()+', casco met kozijn',1,'st',dk.p);
      var g=vind(GOOT,st.goot); if(g&&g.pm) reg(g.l.toLowerCase().replace(/^n/,'N'),st.gootm,'m',g.pm);
      var b=vind(BOEI,st.boei); if(b&&b.pm) reg('Boeidelen vervangen, '+(st.boei===33?'wit':'antraciet'),st.gootm,'m',b.pm);
    }
    /* Nok en lood zitten al in de volledige renovatie; los aangevinkt zijn het
       eigen klussen met een eigen regel. Dubbel rekenen mag niet. */
    if(st.nok&&a!=='vervangen') reg('Nokvorsten vernieuwen, droog systeem',1,'post',WONING[st.woning].nok);
    if(st.lood&&a!=='vervangen') reg('Loodwerk vernieuwen rond schoorsteen',1,'post',LOOD);
    reg('Steiger, afdekking en afvoer',1,'post',VAST[a]);
    var excl=R.reduce(function(s,r){return s+r.bedrag;},0);
    excl=Math.round(excl*100)/100;
    return {regels:R, excl:excl, incl:Math.round(excl*(1+BTW)*100)/100, opAanvraag:st.aanpak==='overlagen'};
  }

  /* ---------- het beeld ---------- */
  function beeld(nr){ return window.NGDakrenovatieBeelden ? NGDakrenovatieBeelden.beeld(st.woning,nr) : null; }
  /* Voor tegels en miniaturen: dezelfde opname op 512 px. */
  function kleinBeeld(nr){ return window.NGDakrenovatieBeelden ? NGDakrenovatieBeelden.klein(st.woning,nr) : null; }
  function heeftOpties(){
    if(isPlat()) return st.zon!==21||st.daglicht!==26||st.terras!==35||
                        st.dakrand!==30||st.boei!==60||st.afvoer!=='bestaand';
    return st.zon!==21||st.raam!==26||st.goot!==30||!!st.boei||
           st.dakkapel!==0||st.nok||st.lood;
  }
  function aanpakNr(){
    if(st.aanpak==='reinigen') return 2;
    if(isPlat()&&st.aanpak==='coaten') return 2;   /* een plat dak coat je niet */
    if(st.aanpak==='coaten') return st.coat==='rood'?4:3;
    if(st.aanpak==='repareren') return st.probleem;
    if(st.aanpak==='overlagen') return 1;
    return 12;
  }
  /* Goot en boeidelen bestaan in twee uitvoeringen: op het bestaande dak (uit
     de brief, want het zijn losse klussen) en op het nieuwe dak (rij 50-54,
     er later bij gemaakt). Welke er getoond wordt hangt af van wat de koper
     aan het samenstellen is - wie een volledige renovatie kiest en dan op een
     goot klikt, hoort niet zijn oude mossige dak terug te krijgen. */
  var GOOT_NIEUW = {30:50, 31:51, 32:52};
  var BOEI_NIEUW = {0:50, 33:53, 34:54};
  function gootNr(){ return st.aanpak==='vervangen' ? GOOT_NIEUW[st.goot] : st.goot; }
  function boeiNr(){
    if(isPlat()) return st.aanpak==='vervangen' ? BOEI_PLAT_NIEUW[st.boei] : st.boei;
    return st.aanpak==='vervangen' ? BOEI_NIEUW[st.boei] : (st.boei||30);
  }

  function beeldNr(){
    if(st.aanzicht==='voor')return 44;
    // Main material remains visible as extra options are selected. The gallery
    // shows the selected extras explicitly as separate detail examples.
    var basis=st.aanpak==='vervangen'?(isPlat()?st.bedekking:st.pan):aanpakNr();
    if(st.aanzicht==='na')return basis;
    if(st.focus==='fase')return st.fase;
    if(st.focus==='opbouw'&&opbouwAan(st.opbouwFocus))return st.opbouwNr;
    if(st.focus==='hersteld')return 43;
    return basis;
  }
  var COMBINATIES={
    w01:{bestand:'w01-sneldek-antraciet-zon4-raamklein',label:'Sneldek antraciet + 4 zonnepanelen + klein dakraam',keuzes:{pan:13,zon:22,raam:27,dakkapel:0,goot:30,boei:0,nok:false,lood:false}},
    w02:{bestand:'w02-actua-leikleur-zon6-raamgroot',label:'Actua leikleur + 6 zonnepanelen + groot dakraam',keuzes:{pan:15,zon:23,raam:28,dakkapel:0,goot:30,boei:0,nok:false,lood:false}},
    w03:{bestand:'w03-bitumen-zwart-zon4-platdakraam',label:'Bitumen zwart + 4 zonnepanelen + platdakraam',keuzes:{bedekking:13,zon:22,daglicht:28,dakrand:30,boei:60,terras:35,afvoer:'bestaand'}}
  };
  function combinatie(){
    var c=COMBINATIES[st.woning];
    if(st.aanpak!=='vervangen'||st.aanzicht==='voor'||(st.aanzicht!=='na'&&['fase','opbouw','hersteld'].indexOf(st.focus)>=0))return null;
    return Object.keys(c.keuzes).every(function(k){return st[k]===c.keuzes[k];})?c:null;
  }
  function voorbeeldKnop(){
    var c=COMBINATIES[st.woning];
    return '<div class="roof-example"><b>Bekijk een complete combinatie</b><p>'+esc(c.label)+'</p><button type="button" class="btn" id="combinatieKiezen">Deze combinatie instellen</button><small>Past materiaal en zichtbare extra’s aan. Jouw maten blijven behouden.</small></div>';
  }
  function updateHero(){
    var nr=beeldNr(), c=combinatie(), p=c?'./assets/media/dakrenovatie/combinaties/'+c.bestand+'.webp':beeld(nr), wrap=$('#confHeroWrap');
    if(p){
      $('#confHero').src=p;
      $('#confHero').alt=c?'Gecombineerde dakimpressie: '+c.label:beeldOmschrijving(nr);
      $('#confHeroBg').style.backgroundImage='url('+p+')';
      wrap.classList.remove('is-missing');
    } else {
      wrap.classList.add('is-missing');
    }
    $('#confDim').innerHTML='<b>'+st.m2+' m&sup2;</b>&nbsp;dakvlak';
    document.querySelectorAll('#confAanzicht button').forEach(function(b){
      var on=b.getAttribute('data-aanzicht')===st.aanzicht;
      b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',on?'true':'false');
    });
    $('#beeldUitleg').textContent=(st.aanzicht==='voor'?'Bestaande situatie':beeldOmschrijving(nr))+'. Indicatieve dakimpressie; geen exacte product- of maatweergave. Gekozen extra’s staan afzonderlijk hieronder.';
    if(c)$('#beeldUitleg').textContent='Gecombineerde impressie: '+c.label+'. Niet op schaal; plaatsing en technische haalbaarheid na opname. Vergelijk het panmodel met de officiële productfoto.';
    tekenKeuzeBeelden();
  }

  /* ---------- de tegels ---------- */
  function tile(name,o,checked,multi,nr){
    var input='<input type="'+(multi?'checkbox':'radio')+'" name="g_'+name+'" value="'+o.v+'"'+(checked?' checked':'')+(o.vast?' disabled':'')+'>';
    var b=name==='pan'?o.image:kleinBeeld(nr!==undefined?nr:o.v), inner='';
    if(b) inner='<span class="tile__img'+(name==='pan'?' tile__img--product':'')+'" style="background-image:url('+b+')"></span>';
    else if(o.sw) inner='<span class="tile__sw" style="background:'+o.sw+'"></span>';
    var sub=[];
    if(o.d) sub.push(o.d);
    if(name==='pan')sub.push('Art. '+o.article);
    var factor=st.btw==='incl'?1+BTW:1, tax=st.btw==='incl'?' incl. btw':' excl. btw';
    if(o.pm2) sub.push((name==='pan'?'Indicatie: ':'')+euroCent(o.pm2*factor)+' per m²'+tax);
    else if(o.pm) sub.push(euroCent(o.pm*factor)+' per m'+tax);
    else if(o.p) sub.push('+ '+euro(o.p*factor)+tax);
    if(o.vast) sub.push('Vast onderdeel');
    var subH=sub.length?'<span class="sub">'+sub.join(' · ')+'</span>':'';
    return '<label class="tile">'+input+'<span class="tile__c">'+inner+'<span class="lab">'+o.l+'</span>'+subH+'</span></label>';
  }
  function grp(nr,titel,inhoud,gid){
    return '<div class="grp" data-g="'+gid+'"><div class="grp__h"><b>'+nr+'.</b>'+titel+'</div>'+inhoud+'</div>';
  }
  function schuif(id,label,min,max,stap,waarde,eenheid){
    return '<div class="dim__row"><label for="'+id+'">'+label+'</label><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+stap+'" value="'+waarde+'"><output>'+waarde+' '+eenheid+'</output><label class="sr-only" for="'+id+'Exact">'+label+' exact</label><input class="dim-exact" type="number" id="'+id+'Exact" min="'+min+'" max="'+max+'" step="'+stap+'" value="'+waarde+'" inputmode="decimal" aria-label="'+label+' exact"></div>';
  }

  function productDetails(){
    if(isPlat()||st.aanpak!=='vervangen')return '';
    var p=vind(PAN,st.pan);
    return '<aside class="roof-product"><img src="'+p.image+'" alt="Officiële productfoto '+esc(p.l)+'"><div><small>Gekozen dakpan · fabrikantreferentie</small><h3>'+esc(p.l)+'</h3><p>'+esc(p.d)+' · artikel '+p.article+'</p><p>Verbruik volgens fabrikant: '+p.range+' st/m². Exacte aantallen en latafstand na inmeting.</p><a href="'+p.source+'" target="_blank" rel="noopener noreferrer">Bekijk product en technische gegevens ↗</a><p class="roof-product__note">Controleer kleur met een monsterpan. Dakbeelden zijn sfeerimpressies; de productfoto bepaalt model en afwerking. Beschikbaarheid en prijs worden bevestigd bij de offerte.</p></div></aside>';
  }
  function render(){
    normaliseer();
    var W=WONING[st.woning];
    $('#confTitle').textContent=W.titel+' samenstellen';
    $('#confSub').textContent=W.sub+' · vaste voorbeeldwoning';
    $('#confBadge').innerHTML='<span>Richtprijs<br>Definitief na dakinspectie</span>';
    var n=0, html='';
    n++; html+=grp(n,'Wat moet er gebeuren',
      '<div class="tiles">'+aanpakLijst().map(function(o){
        var nr=o.v==='reinigen'?2:o.v==='coaten'?3:o.v==='vervangen'?12:(isPlat()?42:43);
        return tile('aanpak',o,st.aanpak===o.v,false,nr);
      }).join('')+'</div>','aanpak');
    if(st.aanpak==='coaten'&&!isPlat()){
      n++; html+=grp(n,'Coatingkleur',
        '<div class="tiles sm">'+COAT.map(function(o){return tile('coat',o,st.coat===o.v,false,o.nr)}).join('')+'</div>'
        +'<p class="grp__noot">De coating volgt het reliëf van de bestaande pan; de kleur is egaal en uv-vast.</p>','coat');
    }
    if(st.aanpak==='vervangen'){
      n++; html+=grp(n, isPlat()?'Dakbedekking':'Dakpan en kleur',
        '<div class="tiles">'+(isPlat()
          ? BEDEKKING.map(function(o){return tile('bedekking',o,st.bedekking===o.v,false)}).join('')
          : PAN.map(function(o){return tile('pan',o,st.pan===o.v,false)}).join(''))+'</div>'
        +(isPlat()?'':'<p class="grp__noot">Officiële productfoto’s: BMI Monier en Wienerberger Koramic. Bedragen zijn voorlopige Next Growth richtprijzen voor levering en montage; de leverancier moet de gekozen uitvoering nog offreren. Het onderdak kies je hieronder.</p>'),
        isPlat()?'bedekking':'pan');
      /* De opbouw als losse keuzes. Elke stap heeft zijn eigen beeld en zijn
         eigen prijs per m², zodat de koper zelf bepaalt hoe diep hij gaat -
         en ziet wat hij aan- of uitzet. */
      n++; html+=grp(n,'Wat wordt er vernieuwd',
        '<div class="tiles">'+opbouwLijst().map(function(o){
          var aan=opbouwAan(o.v);
          return tile('opbouw:'+o.v,{v:o.v,l:o.l,d:o.d,pm2:o.pm2,vast:o.vast},aan,true,aan?o.nr:12);
        }).join('')+'</div>'
        +'<p class="grp__noot">'+(isPlat()
          ? 'De basisopbouw bevat verwijderen en een dampremmende laag. Welke isolatie nodig is hangt af van de bestaande opbouw en de werkzaamheden; dit beoordelen we bij de inspectie.'
          : 'Als de pannen er toch af zijn is dit hét moment: de steiger staat er en de arbeid zit grotendeels al in de renovatie. De prijs volgt je keuzes. De bouwfasen laten de afzonderlijke werkzaamheden zien.')
        +'</p>','opbouw');
    }
    if(st.aanpak==='repareren'){
      n++; html+=grp(n,'Wat is er aan de hand',
        '<div class="tiles">'+(isPlat()?PROBLEEM_PLAT:PROBLEEM).map(function(o){return tile('probleem',o,st.probleem===o.v,false)}).join('')+'</div>'
        +'<p class="grp__noot"><button type="button" class="btn btn--ghost btn--sm" id="toonHerstel">Zo ziet het hersteld uit</button>&nbsp; Vanafprijs € 495, definitief na inspectie.</p>','probleem');
    }
    n++; html+=grp(n,'Afmetingen',
      '<div class="dimgrp">'
      +schuif('dimM2','Dakvlak',isPlat()?4:10,300,0.1,st.m2,'m²')
      +schuif('dimGoot',isPlat()?'Dakrandlengte':'Gootlengte',1,120,0.1,st.gootm,'m')
      +'<div class="dim__m2">Weet je de maten niet? De inspectie meet ze exact in; de richtprijs rekent met wat hier staat.</div>'
      +'<details class="rekenhulp" id="rekenhulp"'+(rh.open?' open':'')+'><summary>Reken het dakvlak uit</summary>'
      +'<div class="rekenhulp__rij">'
      +'<label>Breedte woning (m)<input type="number" id="rhB" min="1" max="60" step="0.5" inputmode="decimal" value="'+esc(rh.b)+'"></label>'
      +'<span class="op">&times;</span>'
      +'<label>Diepte woning (m)<input type="number" id="rhD" min="1" max="60" step="0.5" inputmode="decimal" value="'+esc(rh.d)+'"></label>'
      +(isPlat()?'':'<span class="op">&times;</span><label>Dakhelling<select id="rhS">'
        +HELLING.map(function(h){return '<option value="'+h.f+'"'+(String(rh.s)===String(h.f)?' selected':'')+'>'+h.l+'</option>';}).join('')
        +'</select></label>')
      +'<span class="op">=</span><output id="rhUit">'+rhUitkomst()+'</output>'
      +'<button type="button" class="btn btn--ghost btn--sm" id="rhOk">Gebruik dit</button>'
      +'</div>'
      +'<span class="hint">'+(isPlat()
        ?'Buitenmaten van het platte dak, over de dakrand gemeten.'
        :'Buitenmaten van de woning over de grond; de helling rekent het schuine vlak erbij. Geldt voor een zadeldak en een schilddak. Een tussenwoning is zo\'n 6 bij 9 m.')+'</span>'
      +'</details>'
      +'</div>','afmetingen');
    if(isPlat()){
      n++; html+=grp(n,'Zonnepanelen',
        '<div class="tiles sm">'+ZON_PLAT.map(function(o){return tile('zon',o,st.zon===o.v,false)}).join('')+'</div>'
        +'<p class="grp__noot">Op ballastframes onder een flauwe hoek, zonder doorboring van de nieuwe bedekking.</p>','zon');
      n++; html+=grp(n,'Daglicht',
        '<div class="tiles sm">'+DAGLICHT.map(function(o){return tile('daglicht',o,st.daglicht===o.v,false)}).join('')+'</div>','daglicht');
      n++; html+=grp(n,'Dakrand',
        '<div class="tiles">'+DAKRAND.map(function(o){return tile('dakrand',o,st.dakrand===o.v,false)}).join('')+'</div>','dakrand');
      n++; html+=grp(n,'Dakterras',
        '<div class="tiles">'+TERRAS.map(function(o){return tile('terras',o,st.terras===o.v,false)}).join('')+'</div>'
        +(st.terras!==35?schuif('dimTerras','Oppervlakte terras',1,st.m2,0.1,st.terrasm2,'m²'):'')
        +'<p class="grp__noot">Draagkracht, indeling, toegang en balustrade worden apart beoordeeld. Balustrade en constructieve aanpassingen zijn nog niet begroot.</p>','terras');
      var nieuwplat = st.aanpak==='vervangen';
      n++; html+=grp(n,'Boeidelen',
        '<div class="tiles">'+BOEI_PLAT.map(function(o){
          return tile('boei',o,st.boei===o.v,false,nieuwplat?BOEI_PLAT_NIEUW[o.v]:o.v);
        }).join('')+'</div>'
        +(nieuwplat?'<p class="grp__noot">Getoond op het nieuwe dak. Het boeideel gaat niet vanzelf mee met een renovatie: hier kies je of het vervangen wordt.</p>':''),'boei');
      n++; html+=grp(n,'Hemelwaterafvoer',
        '<div class="tiles">'+AFVOER.map(function(o){return tile('afvoer',o,st.afvoer===o.v,false,-1)}).join('')+'</div>'
        +'<p class="grp__noot">Een plat dak heeft geen hanggoot: het water loopt via afschot naar een afvoer door het dak. Een noodoverloop in de dakrand voert af als de hoofdafvoer verstopt raakt. Dat is wat een dak behoedt voor instorten bij een hoosbui.</p>','afvoer');
    } else {
      n++; html+=grp(n,'Dakkapel',
        '<div class="tiles">'+DAKKAPEL.map(function(o){return tile('dakkapel',o,st.dakkapel===o.v,false,o.nr||o.v)}).join('')+'</div>'
        +'<p class="grp__noot">Nu meenemen scheelt: de steiger staat er en het dak is open. Achteraf plaatsen betekent het nieuwe dak weer openbreken. De uitvoering (bekleding, kozijnkleur, indeling) kies je in de <a href="./dakkapel-configurator.html" style="color:var(--acc)">dakkapelconfigurator</a>.</p>','dakkapel');
      n++; html+=grp(n,'Zonnepanelen',
        '<div class="tiles sm">'+ZON.map(function(o){return tile('zon',o,st.zon===o.v,false)}).join('')+'</div>'
        +'<p class="grp__noot">Gecombineerd met dakwerk: de steiger staat er al en de haken gaan zonder breekwerk onder de pannen.</p>','zon');
      n++; html+=grp(n,'Dakramen',
        '<div class="tiles sm">'+RAAM.map(function(o){return tile('raam',o,st.raam===o.v,false)}).join('')+'</div>','raam');
    }
    if(!isPlat()){
    var nieuwdak = st.aanpak==='vervangen';
    n++; html+=grp(n,'Dakgoot',
      '<div class="tiles">'+GOOT.map(function(o){
        return tile('goot',o,st.goot===o.v,false,nieuwdak?GOOT_NIEUW[o.v]:o.v);
      }).join('')+'</div>'
      +(nieuwdak?'<p class="grp__noot">Getoond op het nieuwe dak. De goot gaat niet vanzelf mee met een renovatie: hier kies je of hij vervangen wordt.</p>':''),'goot');
    n++; html+=grp(n,'Boeidelen',
      '<div class="tiles">'+BOEI.map(function(o){
        return tile('boei',o,st.boei===o.v,false,nieuwdak?BOEI_NIEUW[o.v]:o.nr);
      }).join('')+'</div>','boei');
    /* Bij een volledige renovatie horen nok en loodwerk erbij: een nieuw dak
       met een oude nokvorst bestaat niet, en ze zitten dan ook in de basisprijs.
       Ze als aanvinkbare meerprijs tonen zou een bedrag beloven dat niet
       meetelt - de tegel zei plus 675 euro terwijl er niets veranderde. */
    n++; html+=grp(n,'Nok en loodwerk', nieuwdak
      ? '<div class="tiles">'
        +tile('nokvast',{v:'nokvast',l:'Nieuwe nokvorsten',d:'Inbegrepen bij een volledige renovatie',vast:true},true,false,12)
        +tile('loodvast',{v:'loodvast',l:'Nieuw loodwerk',d:'Inbegrepen bij een volledige renovatie',vast:true},true,false,12)
        +'</div><p class="grp__noot">Een nieuw dak met een oude nokvorst bestaat niet: beide zitten in de prijs van de renovatie.</p>'
      : '<div class="tiles">'
        +tile('nok',{v:'nok',l:'Nieuwe nokvorsten',d:'Mechanisch bevestigd, geen mortel',p:WONING[st.woning].nok},st.nok,true,st.nok?36:35)
        +tile('lood',{v:'lood',l:'Nieuw loodwerk',d:'Rond schoorsteen en aansluitingen',p:LOOD},st.lood,true,st.lood?38:37)
        +'</div>','noklood');
    }
    $('#groups').innerHTML=html;
    tekenStappen();
    var th=$('#toonHerstel');
    if(th) th.addEventListener('click',function(){ st.focus='hersteld'; st.aanzicht='keuze'; updateHero(); });
    /* De knop 'Bouwfasen' in de prijsbalk had geen handler: hij deed niets.
       Hij zet de aanpak op volledige renovatie (alleen dan zijn er fasen),
       springt naar de eerste fase en brengt het voorbeeld in beeld. Eén keer
       binden; de knop staat buiten #groups en overleeft een render(). */
    var fb=$('#fasenBtn');
    if(fb && !fb.dataset.klaar){
      fb.dataset.klaar='1';
      fb.addEventListener('click',function(){
        if(st.aanpak!=='vervangen'){ st.aanpak='vervangen'; render(); }
        /* Vanuit de keuzes begint de strip bij de eerste fase (pannen eraf);
           wie al in de strip zit houdt zijn fase. */
        if(st.focus!=='fase') st.fase=fasenLijst()[0].nr;
        if(fasenLijst().every(function(f){return f.nr!==st.fase;})) st.fase=fasenLijst()[0].nr;
        st.focus='fase'; st.aanzicht='keuze'; fasen(); updateHero();
        var hero=$('#confHeroWrap')||$('.conf__hero'); if(hero&&hero.scrollIntoView) hero.scrollIntoView({behavior:'smooth',block:'center'});
      });
    }
    fasen();
    update();
  }

  /* De bouwfasenstrip: de zeven werkfasen van een volledige renovatie, als
     miniaturen onder het voorbeeld. Verkoopt beter dan welke tekst ook: je
     ziet je eigen dak open liggen en weer dichtgaan. */
  function fasen(){
    var el=$('#confThumbs');
    if(st.aanpak!=='vervangen'){ el.classList.remove('is-on'); el.innerHTML=''; return; }
    el.classList.add('is-on');
    el.innerHTML=fasenLijst().map(function(f){
      var b=kleinBeeld(f.nr);
      return '<button type="button" data-fase="'+f.nr+'" title="'+f.l+'"'
        +(b?' style="background-image:url('+b+')"':'')
        +(st.focus==='fase'&&st.fase===f.nr?' class="is-on"':'')+'></button>';
    }).join('');
    el.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        st.fase=parseInt(b.getAttribute('data-fase'),10);
        st.focus='fase'; st.aanzicht='keuze'; fasen(); updateHero();
      });
    });
  }

  function update(){
    normaliseer();
    var p=prijs();
    $('#prijs').textContent=p.opAanvraag?'Na inspectie':euro(st.btw==='incl'?p.incl:p.excl);
    updateOverzicht(p);
    updateHero();
    if(window.NGBewaren) NGBewaren.bewaar(st);
  }

  /* De prijsopbouw is ook van buitenaf leesbaar, zodat een toets kan
     controleren dat het blad en het scherm hetzelfde bedrag noemen. */
  window.NGDakrenovatiePrijs = prijs;

  /* ---------- samenvatting voor de offerte ---------- */
  function summaryText(){
    var W=WONING[st.woning], p=prijs(), r=[];
    r.push('Woningtype: '+W.l+' ('+W.sub+')');
    r.push('Aanpak: '+vind(aanpakLijst(),st.aanpak).l);
    if(st.aanpak==='coaten'&&!isPlat()) r.push('Coatingkleur: '+vind(COAT,st.coat).l);
    if(st.aanpak==='vervangen'){
      r.push(isPlat() ? 'Dakbedekking: '+vind(BEDEKKING,st.bedekking).l
                      : 'Dakpan: '+vind(PAN,st.pan).l);
      r.push('Vernieuwd: '+(opbouwLijst().filter(function(o){return opbouwAan(o.v);})
             .map(function(o){return o.l;}).join(', ')||'alleen de dakbedekking'));
    }
    if(st.aanpak==='repareren') r.push('Probleem: '+vind(isPlat()?PROBLEEM_PLAT:PROBLEEM,st.probleem).l);
    r.push('Dakvlak: '+st.m2+' m2 / '+(isPlat()?'dakrandlengte':'gootlengte')+': '+st.gootm+' m');
    if(isPlat()){
      r.push('Zonnepanelen: '+vind(ZON_PLAT,st.zon).l);
      r.push('Daglicht: '+vind(DAGLICHT,st.daglicht).l);
      r.push('Dakrand: '+vind(DAKRAND,st.dakrand).l);
      r.push('Dakterras: '+vind(TERRAS,st.terras).l+(st.terras!==35?', '+st.terrasm2+' m²':''));
      r.push('Boeidelen: '+vind(BOEI_PLAT,st.boei).l);
      r.push('Hemelwaterafvoer: '+vind(AFVOER,st.afvoer).l);
    } else {
      r.push('Dakkapel: '+vind(DAKKAPEL,st.dakkapel).l);
      r.push('Zonnepanelen: '+vind(ZON,st.zon).l);
      r.push('Dakramen: '+vind(RAAM,st.raam).l);
      r.push('Dakgoot: '+vind(GOOT,st.goot).l);
      r.push('Boeidelen: '+vind(BOEI,st.boei).l);
      r.push('Nokvorsten nieuw: '+(st.nok||st.aanpak==='vervangen'?'ja':'nee')+' / loodwerk nieuw: '+(st.lood||st.aanpak==='vervangen'?'ja':'nee'));
    }
    r.push(p.opAanvraag?'Overlagen: prijs na inspectie. Bekende extra posten: '+euro(p.incl)+' incl. btw.':'Richtprijs: '+euro(p.incl)+' incl. btw ('+euro(p.excl)+' excl.)');
    r.push('Nog te beoordelen: '+controlePunten().join(' | '));
    if(window.NGDakDossier)r.push(NGDakDossier.tekst());
    r.push('Samenstelling: '+deelLink());
    return r.join('\n');
  }

  /* ---------- de twee bladen: offerte en materiaalstaat ----------
   *
   * Beide komen uit dezelfde staat als het scherm. De offerte somt de regels
   * van prijs() op - dezelfde regels die de prijsbalk optelt - en de
   * materiaalstaat komt uit NGDakrenovatieStaat. Wijkt een blad af van het
   * scherm, dan is het blad fout; door ze uit één bron te voeden kán dat niet.
   */
  function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function datum(d){ return d.toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}); }
  function nl(n){ return n.toLocaleString('nl-NL'); }

  var BLADCSS='<style>'
    +'*{box-sizing:border-box}body{font:13px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#14130f;margin:0;background:#f4f2ee}'
    +'.vel{background:#fff;max-width:820px;margin:0 auto;padding:26mm 20mm}'
    +'header.kop{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #14130f;padding-bottom:12px;margin-bottom:22px}'
    +'.merk{font-size:19px;font-weight:800;letter-spacing:-.02em}.merk span{color:#a8823c}'
    +'.merk small{display:block;font-weight:400;font-size:11px;color:#666;letter-spacing:0;margin-top:3px}'
    +'.meta{text-align:right;font-size:11px;color:#555;line-height:1.7}'
    +'h1{font-size:17px;margin:0 0 4px}h2{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:#a8823c;margin:22px 0 8px}'
    +'table{width:100%;border-collapse:collapse;font-size:12px}'
    +'th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e6e2da;vertical-align:top}'
    +'th{font-weight:600;color:#555;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em}'
    +'td.n,th.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}'
    +'tr.tot td{border-top:2px solid #14130f;border-bottom:none;font-weight:700;font-size:14px;padding-top:10px}'
    +'tr.sub td{font-weight:600}'
    +'.noot{font-size:10.5px;color:#666;line-height:1.6;margin-top:6px}'
    +'ul{margin:6px 0 0;padding-left:18px;font-size:11px;color:#444;line-height:1.7}'
    +'.let li{color:#8a4b28}'
    +'.knop{position:fixed;top:12px;right:12px;background:#14130f;color:#fff;border:none;border-radius:8px;padding:9px 15px;font:inherit;font-size:12px;cursor:pointer}'
    +'@media print{.knop{display:none}body{background:#fff}.vel{padding:0;max-width:none}'
    +'h2{break-after:avoid}tr{break-inside:avoid}@page{size:A4 portrait;margin:16mm}}'
    +'</style>';

  function bladKop(titel, extra){
    var d=new Date(), geldig=new Date(d.getTime()+30*864e5);
    return '<header class="kop"><div class="merk">NEXT <span>GROWTH</span>'
      +'<small>Dakrenovatie &middot; info@nextgrowthdigital.nl &middot; 06 83 90 21 92</small></div>'
      +'<div class="meta">'+esc(titel)+'<br>'+datum(d)
      +(extra?'<br>Geldig tot '+datum(geldig):'')
      +'<br>KVK 96002913 &middot; BTW NL004420281B57</div></header>';
  }

  function keuzeRijen(){
    var W=WONING[st.woning], r=[['Woningtype',W.l+' · '+W.sub],
      ['Aanpak',vind(aanpakLijst(),st.aanpak).l]];
    if(st.aanpak==='coaten'&&!isPlat()) r.push(['Coatingkleur',vind(COAT,st.coat).l]);
    if(st.aanpak==='vervangen'){
      r.push([isPlat()?'Dakbedekking':'Dakpan',
              isPlat()?vind(BEDEKKING,st.bedekking).l:vind(PAN,st.pan).l]);
      r.push(['Wat wordt vernieuwd', opbouwLijst().filter(function(o){return opbouwAan(o.v);})
              .map(function(o){return o.l;}).join(' · ')||'Alleen de dakbedekking']);
    }
    if(st.aanpak==='repareren') r.push(['Opgegeven schade',vind(isPlat()?PROBLEEM_PLAT:PROBLEEM,st.probleem).l]);
    r.push(['Dakvlak',st.m2+' m²']);
    r.push([isPlat()?'Dakrandlengte':'Gootlengte',st.gootm+' m']);
    if(isPlat()){
      r.push(['Zonnepanelen',vind(ZON_PLAT,st.zon).l]);
      r.push(['Daglicht',vind(DAGLICHT,st.daglicht).l]);
      r.push(['Dakrand',vind(DAKRAND,st.dakrand).l]);
      r.push(['Dakterras',vind(TERRAS,st.terras).l+(st.terras!==35?', '+st.terrasm2+' m²':'')]);
      r.push(['Boeidelen',vind(BOEI_PLAT,st.boei).l]);
      r.push(['Hemelwaterafvoer',vind(AFVOER,st.afvoer).l]);
    } else {
      r.push(['Dakkapel',vind(DAKKAPEL,st.dakkapel).l]);
      r.push(['Zonnepanelen',vind(ZON,st.zon).l]);
      r.push(['Dakramen',vind(RAAM,st.raam).l]);
      r.push(['Dakgoot',vind(GOOT,st.goot).l]);
      r.push(['Boeidelen',vind(BOEI,st.boei).l]);
    }
    return r.map(function(x){ return '<tr><th>'+esc(x[0])+'</th><td>'+esc(x[1])+'</td></tr>'; }).join('');
  }

  function offerteHtml(){
    var p=prijs(), btw=Math.round((p.incl-p.excl)*100)/100;
    var rijen=p.regels.map(function(r){
      return '<tr><td>'+esc(r.wat)+'</td><td class="n">'+nl(r.aantal)+' '+esc(r.eh)
        +'</td><td class="n">'+euroCent(r.tarief)+'</td><td class="n">'+euroCent(r.bedrag)+'</td></tr>';
    }).join('');
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Offerte dakrenovatie</title>'
      +BLADCSS+'</head><body><button class="knop" data-ng-print>Afdrukken / opslaan als PDF</button><div class="vel">'
      +bladKop('Offerte dakrenovatie', true)
      +'<h1>Offerte dakrenovatie</h1>'
      +'<p class="noot">Samengesteld met de dakrenovatieconfigurator op nextgrowthdigital.nl. Dit is een richtofferte op basis van de maten die je hebt ingevuld; na de dakinspectie volgt de definitieve offerte met de ingemeten hoeveelheden.</p>'
      +'<h2>Jouw samenstelling</h2><table>'+keuzeRijen()+'</table>'
      +(window.NGDakDossier?NGDakDossier.html():'')
      +(p.opAanvraag?'<p><b>Overlagen: prijs na inspectie. De onderstaande bedragen zijn uitsluitend de al begrote extra opties, geen totaalprijs.</b></p>':'')
      +'<h2>Specificatie</h2><table><tr><th>Omschrijving</th><th class="n">Hoeveelheid</th><th class="n">Tarief</th><th class="n">Bedrag</th></tr>'
      +rijen
      +'<tr class="sub"><td colspan="3">Subtotaal excl. btw</td><td class="n">'+euroCent(p.excl)+'</td></tr>'
      +'<tr class="sub"><td colspan="3">Btw 21 %</td><td class="n">'+euroCent(btw)+'</td></tr>'
      +'<tr class="tot"><td colspan="3">'+(p.opAanvraag?'Bekende opties incl. btw':'Richtprijs incl. btw')+'</td><td class="n">'+euroCent(p.incl)+'</td></tr></table>'
      +'<h2>Nog te beoordelen</h2><ul>'+controlePunten().map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul>'
      +'<h2>Uitgangspunten</h2><ul>'
      +'<li>Steiger, afdekking en afvoer uitsluitend zoals opgenomen in de prijsregels; bereikbaarheid wordt bij de opname gecontroleerd.</li>'
      +'<li>Afvoer en verwerking van het materiaal voor de gekozen werkzaamheden; onverwacht afval wordt apart begroot.</li>'
      +'<li>Materiaal, arbeid, klein montagemateriaal en oplevering met een schone werkplek.</li>'
      +'<li>Garantievoorwaarden worden door de uitvoerende dakdekker in de definitieve offerte vastgelegd.</li></ul>'
      +'<h2>Voorbehouden</h2><ul class="let">'
      +'<li>De hoeveelheden volgen uit de maten die je hebt opgegeven en zijn nog niet ingemeten.</li>'
      /* Wat er onder de oude laag vandaan komt heet anders per daktype: bij een
         pannendak liggen er pannen op, bij een plat dak bitumen. Eén tekst voor
         allebei liet een platdakofferte spreken over pannen die eraf moeten -
         en een dakdekker die dat leest, gelooft de rest van het blad ook niet. */
      +'<li>Gebreken die pas zichtbaar worden als '+(isPlat()?'de oude bedekking eraf is':'de pannen eraf zijn')+' (rot dakbeschot, aangetaste '+(isPlat()?'balklaag':'sporen')+', ontbrekende isolatie) zitten niet in dit bedrag.</li>'
      +'<li>Asbesthoudend materiaal is uitgesloten; sanering gebeurt door een gecertificeerd bedrijf en wordt apart begroot.</li>'
      +'<li>Deze richtofferte is dertig dagen geldig.</li></ul>'
      +'<p class="noot" style="margin-top:20px">Akkoord? Antwoord op de bevestigingsmail of bel 06 83 90 21 92, dan plannen we de inspectie in.</p>'
      +'</div></body></html>';
  }

  /* De staatmodule krijgt de configuratie mee plus of het een plat dak is -
     dat volgt uit het woningtype en staat niet in de configuratie zelf. */
  function staatInvoer(){
    var kopie={}; Object.keys(st).forEach(function(k){ kopie[k]=st[k]; });
    kopie.plat=isPlat(); return kopie;
  }
  function staatHtml(){
    if(!window.NGDakrenovatieStaat) return '';
    var S=NGDakrenovatieStaat.staat(staatInvoer()), groep=null, rijen='';
    S.regels.forEach(function(x){
      if(x.groep!==groep){ groep=x.groep;
        rijen+='<tr><td colspan="3" style="padding-top:14px;font-weight:700;color:#a8823c;border-bottom:none">'+esc(groep)+'</td></tr>'; }
      rijen+='<tr><td class="n" style="width:80px">'+nl(x.aantal)+'</td><td class="n" style="width:44px">'+esc(x.eh)
        +'</td><td>'+esc(x.wat)+(x.noot?' <span style="color:#888">('+esc(x.noot)+')</span>':'')+'</td></tr>';
    });
    var uren=S.uren.map(function(u){
      return '<tr><td class="n" style="width:80px">'+nl(u.uren)+'</td><td class="n" style="width:44px">uur</td><td>'+esc(u.wat)+'</td></tr>';
    }).join('');
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Materiaalstaat dakrenovatie</title>'
      +BLADCSS+'</head><body><button class="knop" data-ng-print>Afdrukken / opslaan als PDF</button><div class="vel">'
      +bladKop('Materiaalstaat · werkvoorbereiding', false)
      +'<h1>Materiaalstaat dakrenovatie</h1>'
      +'<p class="noot">Voorlopige hoeveelheden en arbeidsraming voor werkvoorbereiding. Controleer de inmeting en fabrikantgegevens voordat je bestelt. Dit is geen constructieberekening en geen bestek: snijverlies en overlap zitten in de hoeveelheden, de aannames staan onderaan.</p>'
      +'<h2>Jouw samenstelling</h2><table>'+keuzeRijen()+'</table>'
      +'<h2>Materiaal</h2><table>'+rijen+'</table>'
      +'<h2>Arbeid</h2><table>'+uren
      +'<tr class="tot"><td class="n">'+nl(S.totaalUren)+'</td><td class="n">uur</td><td>Totaal, ca. '
      +nl(S.dagen)+' werkdagen met twee man</td></tr></table>'
      +'<h2>Aannames</h2><ul>'+S.aannames.map(function(a){return '<li>'+esc(a)+'</li>';}).join('')+'</ul>'
      +(S.controle.length?'<h2>Na te meten op het dak</h2><ul class="let">'
        +S.controle.map(function(c){return '<li>'+esc(c)+'</li>';}).join('')+'</ul>':'')
      +'</div></body></html>';
  }

  function staatTekst(){
    return window.NGDakrenovatieStaat
      ? NGDakrenovatieStaat.tekst(NGDakrenovatieStaat.staat(staatInvoer())) : '';
  }
  function blad(html,naam,titel){
    if(window.NGAfdruk){ NGAfdruk.toon(html,naam,titel); return; }
    var w=window.open('',naam); if(!w){ alert('Sta pop-ups toe om dit blad te openen.'); return; }
    w.document.open(); w.document.write(html); w.document.close(); (function(k){ if(k) k.addEventListener('click', function(){ w.print(); }); })(w.document.querySelector('[data-ng-print]'));
  }
  /* De twee bladen ook van buitenaf bereikbaar. Niet voor de pagina zelf maar
     voor de presentatiefilm: die zet het blad in de pagina in plaats van in een
     pop-up, want een pop-up is niet te filmen. Dezelfde reden waarom de
     dakopbouw NGMateriaalHtml naar buiten zet. */
  window.NGDakrenovatieBladen = { offerte: offerteHtml, staat: staatHtml };
  window.NGDakWerk = {prijs:prijs, materiaal:function(){return NGDakrenovatieStaat.staat(staatInvoer());}, context:function(){return WONING[st.woning].l+' · '+st.m2+' m² · '+vind(aanpakLijst(),st.aanpak).l;}, blad:blad};

  $('#offerteBladBtn').addEventListener('click',function(){ blad(offerteHtml(),'ng-dakofferte','Offerte dakrenovatie'); });
  $('#staatBtn').addEventListener('click',function(){ blad(staatHtml(),'ng-dakstaat','Materiaalstaat dakrenovatie'); });

  /* ---------- gebeurtenissen ---------- */
  $('#groups').addEventListener('change',function(e){
    var t=e.target; if(!t.name) return;
    var g=t.name.replace(/^g_/,'');
    if(g==='aanpak'){ st.aanpak=t.value; st.focus='aanpak'; st.aanzicht='keuze'; render(); return; }
    if(g.indexOf('opbouw:')===0){
      var stap=g.slice(7);
      st.opbouw[stap]=t.checked;
      /* Het beeld springt naar de stap die net is aangeraakt, aan of uit. */
      st.opbouwFocus=stap; st.focus='opbouw'; st.aanzicht='keuze';
      opbouwLijst().forEach(function(o){ if(o.v===stap) st.opbouwNr=o.nr; });
      render(); return;
    }
    if(g==='coat') st.coat=t.value;
    else if(g==='pan') st.pan=parseInt(t.value,10);
    else if(g==='isolatie') st.isolatie=t.checked;
    else if(g==='probleem') st.probleem=parseInt(t.value,10);
    else if(g==='zon') st.zon=parseInt(t.value,10);
    else if(g==='raam') st.raam=parseInt(t.value,10);
    else if(g==='bedekking') st.bedekking=parseInt(t.value,10);
    else if(g==='dakkapel') st.dakkapel=parseInt(t.value,10);
    else if(g==='daglicht') st.daglicht=parseInt(t.value,10);
    else if(g==='dakrand') st.dakrand=parseInt(t.value,10);
    else if(g==='terras') st.terras=parseInt(t.value,10);
    else if(g==='goot') st.goot=parseInt(t.value,10);
    else if(g==='afvoer') st.afvoer=t.value;
    else if(g==='boei') st.boei=parseInt(t.value,10);
    else if(g==='nok'){ st.nok=t.checked; }
    else if(g==='lood'){ st.lood=t.checked; }
    st.focus=(g==='coat'||g==='probleem')?(g==='coat'?'coat':'probleem'):g;
    st.aanzicht='keuze';
    /* De aangevinkte nok/lood-tegel wisselt van beeld (bestaand/nieuw), dus
       de tegels zelf even opnieuw; de rest van de groepen blijft staan. */
    if(g==='nok'||g==='lood'||g==='terras'){ render(); return; }
    update();
  });
  $('#groups').addEventListener('click',function(e){
    if(e.target.id==='rhOk'){
      var m=rhM2();
      if(!m){ $('#rhUit').textContent='vul breedte en diepte in'; return; }
      st.m2=Math.max(isPlat()?4:10,Math.min(300,m)); rh.open=true; render();
      return;
    }
    if(e.target.closest&&e.target.closest('#rekenhulp summary')) rh.open=!$('#rekenhulp').open;
  });
  $('#groups').addEventListener('change',function(e){
    if(e.target.id==='rhS'){ rh.s=e.target.value; $('#rhUit').textContent=rhUitkomst(); }
  });
  $('#groups').addEventListener('input',function(e){
    var t=e.target;
    if(t.id==='rhB'||t.id==='rhD'||t.id==='rhS'){
      rh[t.id==='rhB'?'b':t.id==='rhD'?'d':'s']=t.value; $('#rhUit').textContent=rhUitkomst(); return;
    }
    if(t.id==='dimM2'){ st.m2=parseFloat(t.value); t.nextElementSibling.textContent=st.m2+' m²'; }
    else if(t.id==='dimGoot'){ st.gootm=parseFloat(t.value); t.nextElementSibling.textContent=st.gootm+' m'; }
    else if(t.id==='dimTerras'){st.terrasm2=parseFloat(t.value);t.nextElementSibling.textContent=st.terrasm2+' m²';}
    else return;
    normaliseer();
    var exact=$('#'+t.id+'Exact');if(exact)exact.value=t.value;
    update();
  });
  document.querySelectorAll('.matswitch button[data-w]').forEach(function(b){
    b.addEventListener('click',function(){
      var w=b.getAttribute('data-w'); if(w===st.woning) return;
      var oud=st; st=defaults(w);
      /* De keuzes reizen mee naar de andere woning; alleen de maten niet,
         want die horen bij het huis. */
      /* Alleen wat in beide daktypes bestaat reist mee. Een dakpan heeft op
         een plat dak geen betekenis, en een lichtkoepel niet op een pannendak. */
      ['aanpak','coat','btw'].forEach(function(k){ st[k]=oud[k]; });
      /* Coaten bestaat niet bij een plat dak; wie daarmee overstapt zou anders
         op een keuze staan die er niet is. */
      if((WONING[w].plat && st.aanpak==='coaten')||(!WONING[w].plat && st.aanpak==='overlagen')) st.aanpak='vervangen';
      if(!!WONING[w].plat === !!WONING[oud.woning].plat){
        ['pan','bedekking','dakkapel','opbouw','zon','raam','goot','boei','daglicht','dakrand','terras','afvoer','nok','lood','probleem'].forEach(function(k){ st[k]=oud[k]; });
      }
      document.querySelectorAll('.matswitch button[data-w]').forEach(function(x){
        var on=x===b; x.classList.toggle('is-on',on); x.setAttribute('aria-pressed',on?'true':'false');
      });
      tekenPresets();
      render();
    });
  });
  document.querySelectorAll('#confAanzicht button').forEach(function(b){
    b.addEventListener('click',function(){ st.aanzicht=b.getAttribute('data-aanzicht'); updateHero(); });
  });
  $('#btwIncl').addEventListener('click',function(){ st.btw='incl'; btwKnop(); render(); });
  $('#btwExcl').addEventListener('click',function(){ st.btw='excl'; btwKnop(); render(); });
  function btwKnop(){
    var i=st.btw==='incl';
    $('#btwIncl').classList.toggle('is-on',i); $('#btwIncl').setAttribute('aria-pressed',i?'true':'false');
    $('#btwExcl').classList.toggle('is-on',!i); $('#btwExcl').setAttribute('aria-pressed',!i?'true':'false');
  }
  $('#naarOfferte').addEventListener('click',function(){ stap=5;tekenStappen();$('#offerte').scrollIntoView({behavior:'smooth'}); });
  /* Een deelbare link: de samenstelling in de URL, zodat een verkoper of een
     bezoeker precies deze keuzes kan doorsturen. */
  var DEELVELDEN=['woning','aanpak','coat','pan','bedekking','dakkapel','opbouw','zon','raam','goot','boei','daglicht','dakrand','terras','afvoer','nok','lood','probleem','m2','gootm','terrasm2','btw'];
  function deelLink(){
    var k={}; DEELVELDEN.forEach(function(v){ k[v]=st[v]; });
    return location.origin+location.pathname+'?k='+encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(k)))));
  }
  function leesDeelLink(){
    var k=new URLSearchParams(location.search).get('k'); if(!k) return false;
    try{
      var d=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(k)))));
      if(!WONING[d.woning]) return false;
      st=defaults(d.woning);
      DEELVELDEN.forEach(function(v){ if(v!=='woning'&&d[v]!==undefined&&d[v]!==null) st[v]=d[v]; });
      if(typeof st.opbouw!=='object'||!st.opbouw) st.opbouw=defaults(d.woning).opbouw;
      if(isPlat()&&st.aanpak==='coaten') st.aanpak='vervangen';
      st.m2=Math.max(isPlat()?4:10,Math.min(300,parseFloat(st.m2)||WONING[d.woning].m2));
      st.gootm=Math.max(1,Math.min(120,parseFloat(st.gootm)||WONING[d.woning].gootm));
      st.btw=st.btw==='excl'?'excl':'incl';
      return true;
    }catch(e){ return false; }
  }
  $('#deelBtn').addEventListener('click',function(){
    var knop=$('#deelBtn'), link=deelLink();
    var klaar=function(){ knop.textContent='Link gekopieerd'; setTimeout(function(){ knop.textContent='Deel'; },2200); };
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(link).then(klaar,function(){ window.prompt('Kopieer deze link',link); }); }
    else window.prompt('Kopieer deze link',link);
  });
  /* De knop Bouwfasen wordt in render() gebonden (één keer); hier stond een
     tweede afhandelaar die dezelfde klik nog eens verwerkte. */

  /* ---------- de voorinstellingen ---------- */
  function zetPreset(s){
    Object.keys(s).forEach(function(k){
      if(k==='isolatie') st.opbouw.isolatie=!!s[k];
      else st[k]=s[k];
    });
  }
  function pasPresetToe(p){
    var oud=st; st=defaults(oud.woning);
    ['m2','gootm','terrasm2','btw'].forEach(function(k){ st[k]=oud[k]; });
    zetPreset(p.s);
    st.focus='aanpak'; st.aanzicht='keuze'; render();
  }
  /* De miniaturen komen van de woning die aan staat: een plat dak met een
     pannendakje ernaast als startpunt klopt niet. */
  function tekenPresets(){
    $('#presetRow').innerHTML=PRESETS.map(function(p0,i){
      var p=presetVoor(i), b=kleinBeeld(p.nr);
      return '<button type="button" class="preset" data-p="'+i+'">'
        +'<span class="preset__th"'+(b?' style="background-image:url('+b+')"':'')+'></span>'
        +'<span class="preset__t"><b>'+p.l+'</b><span>'+p.d+'</span></span></button>';
    }).join('');
    document.querySelectorAll('.preset').forEach(function(b){
      b.addEventListener('click',function(){ pasPresetToe(presetVoor(parseInt(b.getAttribute('data-p'),10))); });
    });
  }

  /* ---------- de aanvraag: twee routes naast elkaar, zoals overal ---------- */
  function msg(t,type){ var m=$('#leadMsg'); m.hidden=false; m.textContent=t; m.className='lead__msg '+(type||''); }
  function mailtoFallback(f){
    var body='Aanvraag dakrenovatie via configurator\n======================================\n\n'+f.elements.namedItem('configuratie').value+'\n\n'+staatTekst()+'\n\nNaam: '+f.elements.namedItem('naam').value+'\nPlaats: '+f.elements.namedItem('plaats').value+'\nE-mail: '+f.elements.namedItem('email').value+'\nTelefoon: '+f.elements.namedItem('telefoon').value+'\nBericht: '+f.elements.namedItem('bericht').value;
    location.href='mailto:info@nextgrowthdigital.nl?subject='+encodeURIComponent('Offerteaanvraag dakrenovatie: '+(f.elements.namedItem('naam').value||''))+'&body='+encodeURIComponent(body);
  }
  var verzendBezig=false, fotoUrl=null;
  function fotoGeldig(){
    var input=$('#f_foto'),file=input.files[0];
    input.setCustomValidity(file && (!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)?'Kies een JPG, PNG of WebP van maximaal 8 MB.':'');
    return input.checkValidity();
  }
  $('#f_foto').addEventListener('change',function(){
    if(fotoUrl)URL.revokeObjectURL(fotoUrl);fotoUrl=null;
    var file=this.files[0];$('#fotoPreview').hidden=true;$('#fotoWissen').hidden=!file;
    if(!fotoGeldig()){this.reportValidity();return;}
    if(file){fotoUrl=URL.createObjectURL(file);$('#fotoPreview').src=fotoUrl;$('#fotoPreview').hidden=false;}
  });
  $('#fotoWissen').addEventListener('click',function(){
    $('#f_foto').value='';$('#f_foto').setCustomValidity('');$('#fotoPreview').hidden=true;this.hidden=true;
    if(fotoUrl)URL.revokeObjectURL(fotoUrl);fotoUrl=null;
  });
  async function verstuurAanvraag(payload){
    var data=new FormData();Object.keys(payload).forEach(function(k){data.append(k,payload[k]);});
    var foto=$('#f_foto').files[0];if(foto)data.append('attachment',foto,foto.name);
    var ctrl=new AbortController(),timer=setTimeout(function(){ctrl.abort();},20000);
    try {
      var response=await fetch('https://formsubmit.co/ajax/info@nextgrowthdigital.nl',{method:'POST',headers:{Accept:'application/json'},body:data,signal:ctrl.signal});
      var result=await response.json();
      if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('Niet bevestigd');
      return result;
    } finally {clearTimeout(timer);}
  }
  $('#leadForm').addEventListener('submit',function(e){
    e.preventDefault(); var f=e.target;if(verzendBezig||f.elements.namedItem('website').value)return;if(!fotoGeldig()){f.elements.namedItem('attachment').reportValidity();return;}
    if(f.reportValidity&&!f.reportValidity()) return;
    f.elements.namedItem('configuratie').value=summaryText();
    var btn=$('#leadBtn'), oud=btn.textContent; verzendBezig=true;btn.disabled=true; btn.textContent='Versturen…';
    verstuurAanvraag({_subject:'Offerteaanvraag dakrenovatie: '+(f.elements.namedItem('naam').value||''),_template:'table',_captcha:'false',_replyto:f.elements.namedItem('email').value,Product:'Dakrenovatie configurator',Naam:f.elements.namedItem('naam').value,Plaats:f.elements.namedItem('plaats').value,Email:f.elements.namedItem('email').value,Telefoon:f.elements.namedItem('telefoon').value,Bericht:f.elements.namedItem('bericht').value,Uitvoering:f.elements.namedItem('periode').value,Configuratie:f.elements.namedItem('configuratie').value,Materiaalstaat:staatTekst()})
      .then(function(){ msg('Dank! Je aanvraag is verstuurd. We nemen binnen één werkdag contact op.','ok'); f.reset();$('#fotoWissen').click(); })
      .catch(function(){ msg('We konden de ontvangst niet bevestigen. Je gegevens en foto blijven staan. Bel 06 83 90 21 92 om te controleren of je aanvraag is aangekomen, of probeer het later opnieuw.','err'); })
      .finally(function(){ verzendBezig=false;btn.disabled=false; btn.textContent=oud; });
  });

  /* Stappen en één gevalideerde configuratie voor beeld, prijs en documenten. */
  var stap=1;
  function euroCent(n){return '€ '+n.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function normaliseer(){
    if(!WONING[st.woning])st.woning='w01';
    var d=defaults(st.woning);
    function keuze(k,l){if(!vind(l,st[k]))st[k]=d[k];}
    keuze('aanpak',aanpakLijst());keuze('coat',COAT);keuze('pan',PAN);keuze('bedekking',BEDEKKING);
    keuze('zon',isPlat()?ZON_PLAT:ZON);keuze('raam',RAAM);keuze('daglicht',DAGLICHT);
    keuze('goot',GOOT);keuze('boei',isPlat()?BOEI_PLAT:BOEI);keuze('dakrand',DAKRAND);
    keuze('terras',TERRAS);keuze('dakkapel',DAKKAPEL);keuze('afvoer',AFVOER);
    keuze('probleem',isPlat()?PROBLEEM_PLAT:PROBLEEM);
    st.m2=maat(st.m2,isPlat()?4:10,300,d.m2);st.gootm=maat(st.gootm,1,120,d.gootm);
    st.terrasm2=maat(st.terrasm2,1,st.m2,Math.min(15,st.m2));
    var op={};opbouwLijst().forEach(function(o){op[o.v]=o.vast||!!(st.opbouw&&st.opbouw[o.v]===true);});st.opbouw=op;
    st.nok=st.nok===true;st.lood=st.lood===true;
    st.btw=st.btw==='excl'?'excl':'incl';
  }
  function maat(v,min,max,fallback){v=Number(v);return Number.isFinite(v)?Math.round(Math.max(min,Math.min(max,v))*10)/10:fallback;}
  function controlePunten(){
    var r=['Dakmaten, staat van de ondergrond en bereikbaarheid worden bij de opname gecontroleerd.'];
    if(!isPlat()&&st.aanpak==='vervangen')r.push('Dakpan: '+vind(PAN,st.pan).l+'. Fabrikantmodel, kleurmonster, leverbaarheid, latafstand en leveranciersprijs vóór bestellen bevestigen.');
    if(st.aanpak==='overlagen')r.push('Overlagen: hechting, vocht, afschot, bestaande lagen en aansluitingen beoordelen; de bedekking is nog niet begroot.');
    if(st.aanpak==='vervangen'&&opbouwAan('isolatie'))r.push('Isolatiedikte, aansluitdetails en isolatiewaarde vaststellen op basis van de bestaande dakopbouw.');
    if(st.aanpak==='vervangen'&&!isPlat()&&!opbouwAan('folie'))r.push('Bestaande panlatten en folie alleen hergebruiken als staat, latafstand en gekozen pan dit toelaten.');
    if(isPlat()){
      if(st.terras!==35)r.push('Dakterras: draagkracht, toegang en indeling beoordelen. Balustrade en constructieve aanpassingen zijn niet in de richtprijs opgenomen.');
      if(st.zon!==21||[17,18].indexOf(st.bedekking)>=0)r.push('Gewicht, windbelasting en bevestiging van zonnepanelen, grind of groendak vooraf beoordelen.');
      if((st.zon!==21?1:0)+(st.daglicht!==26?1:0)+(st.terras!==35?1:0)>1)r.push('Combinatie van zonnepanelen, daglicht en/of terras: aparte plaatsingstekening nodig om vrije ruimte en looproutes te bepalen.');
      if(st.afvoer==='bestaand'||st.afvoer==='spuwer')r.push('Bestaande hoofdafvoer controleren; vervanging daarvan is niet meegerekend.');
    }else if((st.zon!==21?1:0)+(st.raam!==26?1:0)+(st.dakkapel?1:0)>1){r.push('Dakramen, zonnepanelen en/of dakkapel: verdeling over de dakvlakken en onderlinge afstanden moeten op tekening worden gecontroleerd.');}
    return r;
  }
  function beeldOmschrijving(nr){
    var lijst=isPlat()?BEDEKKING:PAN;
    if(nr>=13&&nr<=20&&vind(lijst,nr))return vind(lijst,nr).l;
    var naam=window.NGDakrenovatieBeelden&&NGDakrenovatieBeelden.NAAM[st.woning][nr];
    return naam?naam.replace(/_/g,' '):'Voorbeeld van het dak';
  }
  function gekozenBeelden(){
    var a=[];
    function voeg(nr,label){if(beeld(nr))a.push({nr:nr,label:label});}
    if(st.aanpak==='vervangen')voeg(isPlat()?st.bedekking:st.pan,vind(isPlat()?BEDEKKING:PAN,isPlat()?st.bedekking:st.pan).l);
    else voeg(aanpakNr(),vind(aanpakLijst(),st.aanpak).l);
    if(st.zon!==21)voeg(st.zon,vind(isPlat()?ZON_PLAT:ZON,st.zon).l);
    if(isPlat()){
      if(st.daglicht!==26)voeg(st.daglicht,vind(DAGLICHT,st.daglicht).l);
      if(st.dakrand!==30)voeg(st.dakrand,vind(DAKRAND,st.dakrand).l);
      if(st.terras!==35)voeg(st.terras,vind(TERRAS,st.terras).l+' · '+st.terrasm2+' m²');
      if(st.boei!==60)voeg(boeiNr(),vind(BOEI_PLAT,st.boei).l+' boeidelen');
    }else{
      if(st.raam!==26)voeg(st.raam,vind(RAAM,st.raam).l);
      if(st.dakkapel)voeg(st.dakkapel,vind(DAKKAPEL,st.dakkapel).l);
      if(st.goot!==30)voeg(gootNr(),vind(GOOT,st.goot).l);
      if(st.boei)voeg(boeiNr(),vind(BOEI,st.boei).l+' boeidelen');
    }
    return a;
  }
  function tekenKeuzeBeelden(){
    if(gekozenBeelden().length>1)$('.roof-gallery').open=true;
    $('#keuzeBeelden').innerHTML=gekozenBeelden().map(function(o){return '<button type="button" data-detail="'+o.nr+'" aria-label="Bekijk '+esc(o.label)+'"><img src="'+kleinBeeld(o.nr)+'" alt="" loading="lazy"><span>'+esc(o.label)+'</span></button>';}).join('');
  }
  function updateOverzicht(p){
    var factor=st.btw==='incl'?1+BTW:1;
    $('#prijsRegels').innerHTML=p.regels.map(function(r){return '<div><span>'+esc(r.wat)+'<small>'+r.aantal+' '+r.eh+'</small></span><b>'+euro(r.bedrag*factor)+'</b></div>';}).join('');
    $('#prijsTax').textContent=st.btw==='incl'?'Alle bedragen inclusief 21% btw.':'Alle bedragen exclusief btw.';
    $('#controleLijst').innerHTML=controlePunten().map(function(t){return '<li>'+esc(t)+'</li>';}).join('');
    $('#dakProduct').innerHTML=productDetails();
    $('#dakCombinatie').innerHTML=voorbeeldKnop();
    $('#dakProduct').hidden=isPlat()||st.aanpak!=='vervangen'||stap!==3;
    $('#samenvatting').innerHTML='<h3>Jouw dakrenovatie</h3><table>'+keuzeRijen()+'</table>';
    $('#prijsOpmerking').textContent=p.opAanvraag?'Overlagen wordt na inspectie begroot. De specificatie bevat alleen bekende extra posten.':'Richtprijs op basis van je keuzes. Definitieve offerte na opname.';
    $('#miniKeuze').textContent=WONING[st.woning].l+' · '+st.m2+' m² · '+vind(aanpakLijst(),st.aanpak).l;
    $('#mobielPrijs').textContent=p.opAanvraag?'Na inspectie':euro(st.btw==='incl'?p.incl:p.excl);
  }
  function tekenStappen(){
    var map={aanpak:2,probleem:2,afmetingen:2,coat:3,pan:3,bedekking:3,opbouw:3};
    document.querySelectorAll('#groups .grp').forEach(function(el){el.hidden=(map[el.dataset.g]||4)!==stap;});
    $('#dakProduct').hidden=isPlat()||st.aanpak!=='vervangen'||stap!==3;
    $('#dakCombinatie').hidden=stap!==4;
    $('#dakDossier').hidden=stap!==5;
    $('#presetDetails').hidden=stap!==2;$('#dakStart').hidden=stap!==1;$('#offerte').hidden=stap!==5;$('#samenvatting').hidden=stap!==5;
    $('#materiaalLeeg').hidden=stap!==3||['vervangen','coaten'].indexOf(st.aanpak)>=0;
    $('#materiaalLeeg').textContent=st.aanpak==='overlagen'?'Voor overlagen beoordelen we eerst de bestaande bedekking. De passende nieuwe laag en de prijs volgen na inspectie.':'Bij deze werkzaamheden blijft de bestaande dakbedekking behouden. Je kunt verder naar extra’s.';
    $('#overlagenUitleg').hidden=stap!==2||st.aanpak!=='overlagen';
    $('#vorigeStap').disabled=stap===1;$('#volgendeStap').hidden=stap===5;
    $('#stapTeller').textContent='Stap '+stap+' van 5';
    document.querySelectorAll('[data-stap]').forEach(function(b){b.setAttribute('aria-current',+b.dataset.stap===stap?'step':'false');});
    document.querySelectorAll('[data-route]').forEach(function(b){b.setAttribute('aria-pressed',(b.dataset.route==='plat')===isPlat()?'true':'false');});
    $('#pannenModellen').hidden=isPlat();
    document.querySelectorAll('.matswitch [data-w]').forEach(function(b){var on=b.dataset.w===st.woning;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',on?'true':'false');});
  }
  function gaStap(n){stap=Math.max(1,Math.min(5,n));tekenStappen();$('#stappen').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  function bindStudio(){
    var comb=document.createElement('div');comb.id='dakCombinatie';$('#groups').after(comb);
    comb.addEventListener('click',function(e){if(e.target.id!=='combinatieKiezen')return;Object.assign(st,COMBINATIES[st.woning].keuzes);st.aanpak='vervangen';st.focus='aanpak';st.aanzicht='na';render();});
    var product=document.createElement('div');product.id='dakProduct';$('#groups').after(product);
    $('.conf__options').appendChild($('#offerte'));
    $('#offerte').style.marginTop='24px';
    document.querySelectorAll('[data-stap]').forEach(function(b){b.addEventListener('click',function(){gaStap(+b.dataset.stap);});});
    $('#vorigeStap').addEventListener('click',function(){gaStap(stap-1);});
    $('#volgendeStap').addEventListener('click',function(){gaStap(stap+1);});
    $('#mobielVerder').addEventListener('click',function(){gaStap(stap<5?stap+1:5);});
    document.querySelectorAll('[data-route]').forEach(function(b){b.addEventListener('click',function(){document.querySelector('.matswitch [data-w="'+(b.dataset.route==='plat'?'w03':(isPlat()?'w01':st.woning))+'"]').click();tekenStappen();});});
    $('#keuzeBeelden').addEventListener('click',function(e){var b=e.target.closest('[data-detail]');if(!b)return;st.aanzicht='keuze';st.focus='fase';st.fase=+b.dataset.detail;updateHero();});
    $('#groups').addEventListener('change',function(e){var t=e.target;if(!/Exact$/.test(t.id))return;if(!t.checkValidity()){t.reportValidity();return;}var id=t.id.replace(/Exact$/,'');if(id==='dimM2')st.m2=+t.value;else if(id==='dimGoot')st.gootm=+t.value;else if(id==='dimTerras')st.terrasm2=+t.value;render();});
    $('#confHero').addEventListener('error',function(){$('#confHeroWrap').classList.add('is-missing');});
  }

  /* ---------- init ---------- */
  var qs=new URLSearchParams(location.search);
  var w0=qs.get('woning');
  st=defaults(WONING[w0]?w0:'w01');
  if(WONING[w0]&&w0!=='w01'){
    document.querySelectorAll('.matswitch button[data-w]').forEach(function(x){
      var on=x.getAttribute('data-w')===w0; x.classList.toggle('is-on',on); x.setAttribute('aria-pressed',on?'true':'false');
    });
  }
  var s0=parseInt(qs.get('start'),10);
  if(!isNaN(s0)&&PRESETS[s0]) zetPreset(presetVoor(s0).s);
  var gedeeld=leesDeelLink();
  if(gedeeld){
    document.querySelectorAll('.matswitch button[data-w]').forEach(function(x){
      var on=x.getAttribute('data-w')===st.woning; x.classList.toggle('is-on',on); x.setAttribute('aria-pressed',on?'true':'false');
    });
  }
  if(window.NGBewaren){
    var herstelde=gedeeld?null:NGBewaren.laad(st,{negeer:!isNaN(s0)||!!w0});
    if(herstelde) NGBewaren.melden(st,function(){ st=defaults('w01'); render(); });
  }
  bindStudio();
  normaliseer();
  btwKnop();
  tekenPresets();
  render();
})();
