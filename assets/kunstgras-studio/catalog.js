import {legacyCandidates} from './visuals.js';
    function S(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'; }
    var IC = {
      ruler:S('<path d="M3 8h18v8H3z"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>'),
      plank:S('<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M3 14h18"/>'),
      visgraat:S('<path d="M4 20l6-8M10 12l-6-4M20 20l-6-8M14 12l6-4M12 21V9"/>'),
      tegel:S('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M12 3v18M3 12h18"/>'),
      klik:S('<path d="M3 12h7l2-3 2 6 2-3h5"/>'),
      lijm:S('<path d="M4 16c3-6 13-6 16 0"/><path d="M4 16v3h16v-3"/>'),
      spc:S('<rect x="3" y="7" width="18" height="10" rx="1"/><path d="M3 12h18"/>'),
      sofa:S('<path d="M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3"/><path d="M2 12a2 2 0 012 2v3h16v-3a2 2 0 012-2"/><path d="M6 17v2M18 17v2"/>'),
      keuken:S('<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="12" width="18" height="9" rx="1"/><path d="M8 3v7M7 15h4"/>'),
      bed:S('<path d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6"/><path d="M3 14h18M7 10V8h4v2"/>'),
      geen:S('<circle cx="12" cy="12" r="8"/><path d="M6 6l12 12"/>'),
      sound:S('<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15 9a4 4 0 010 6"/>'),
      plint:S('<path d="M3 17h18v3H3z"/><path d="M5 17V7h14v10"/>'),
      level:S('<rect x="3" y="9" width="18" height="6" rx="1"/><circle cx="12" cy="12" r="1.3"/>'),
      profiel:S('<path d="M3 15h6l3-6 3 6h6"/>'),
      tuin:S('<path d="M3 20h18"/><path d="M6 20c0-5 2-8 2-8M10 20c0-6 1-9 1-9M15 20c0-5 1-8 1-8M19 20c0-6-1-9-1-9"/>'),
      balkon:S('<path d="M4 10h16v10H4z"/><path d="M4 14h16M8 10v10M12 10v10M16 10v10M4 6h16"/>'),
      speel:S('<path d="M4 20l4-9 4 9M8 11V6"/><circle cx="8" cy="4" r="1.5"/><path d="M14 20v-6h6v6"/>'),
      hond:S('<path d="M10 5l2 2 2-2v4l2 2v7H6v-7l2-2z"/><circle cx="10" cy="12" r=".6"/><circle cx="14" cy="12" r=".6"/>'),
      sport:S('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18M3 12h18"/>'),
      led:S('<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z"/>'),
      onderhoud:S('<path d="M14 7l3 3-7 7-3 1 1-3z"/><path d="M5 20h14"/>'),
      water:S('<path d="M12 3s6 6 6 10a6 6 0 01-12 0c0-4 6-10 6-10z"/>'),
      oog:S('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
      boven:S('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
      zon:S('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>'),
      trap:S('<path d="M3 20h4v-4h4v-4h4v-4h4V4"/>')
    };
    var CFG = {
  kop:'Kunstgras', file:'kunstgras', accent:'#5B8C3E', soft:'rgba(91,140,62,.18)',
  titel:'<span>Kunstgras</span> op maat', sub:'Kies je toepassing: tuin, een complete padelbaan of een voetbalveld. De prijs incl. leggen rekent live mee.',
  badge:{ic:IC.tuin,t:'Mastergrass · incl. leggen & afwerking'}, hero:'/assets/media/kunstgras-v2/tuin-medium-natuurlijk.webp',
  basisM2:39, oppGroup:'opp',
  groepen:[
    {id:'opp',t:'Oppervlakte',style:'text',isOpp:1,when:function(s){return s.toepassing==='tuin';},kz:[
      {v:'10',l:'10 m²',m2:10},{v:'25',l:'25 m²',m2:25,def:1},{v:'50',l:'50 m²',m2:50},{v:'75',l:'75 m²',m2:75},{v:'100',l:'100 m²',m2:100},{v:'mw',l:'Maatwerk',ic:IC.ruler,m2:40}
    ]},
    {id:'banen',t:'Aantal banen',style:'text',isOpp:1,when:function(s){return s.toepassing==='padel';},kz:[
      {v:'1',l:'1 baan',m2:200,def:1},{v:'2',l:'2 banen',m2:400},{v:'3',l:'3 banen',m2:600},{v:'4',l:'4 banen',m2:800}
    ]},
    {id:'veld',t:'Veldtype',style:'text',isOpp:1,when:function(s){return s.toepassing==='voetbal';},kz:[
      {v:'panna',l:'Pannakooi',sub:'±150 m²',m2:150,def:1},{v:'cruyff',l:'Cruyff Court',sub:'±1.150 m²',m2:1150},{v:'half',l:'Half veld',sub:'±3.400 m²',m2:3400},{v:'heel',l:'Heel veld · 11v11',sub:'±7.140 m²',m2:7140}
    ]},
    {id:'toepassing',t:'Toepassing',style:'swatch',hero:1,kz:[
      {v:'tuin',l:'Tuin',img:'/assets/media/gras-tuin.jpg',def:1},
      {v:'padel',l:'Padel / sport',img:'/assets/media/gras-padel-blauw.jpg',pM2:6},
      {v:'voetbal',l:'Voetbalveld',img:'/assets/media/gras-voetbal-cruyff.jpg',pM2:5}
    ]},
    {id:'tuintype',t:'Tuintype',style:'icon',when:function(s){return s.toepassing==='tuin';},kz:[
      {v:'standaard',l:'Standaard tuin',ic:IC.tuin,def:1},{v:'luxe',l:'Grote luxe tuin',ic:IC.balkon,pM2:3}
    ]},
    {row:1, when:function(s){return s.toepassing==='tuin';}, groepen:[
      {id:'kwaliteit',t:'Kwaliteit',style:'icon',kz:[
        {v:'java',l:'Java · 30mm',img:'/assets/media/gras-swatch-java.jpg',pM2:-8},{v:'dubai',l:'Dubai · 40mm',img:'/assets/media/gras-swatch-dubai.jpg',pM2:2},{v:'ibiza',l:'Ibiza · 45mm',img:'/assets/media/gras-swatch-ibiza.jpg',def:1},{v:'bali',l:'Bali · 50mm',img:'/assets/media/gras-swatch-bali.jpg',pM2:12},{v:'dubaixl',l:'Dubai XL · 50mm',img:'/assets/media/gras-swatch-dubaixl.jpg',pM2:16}
      ]},
      {id:'kleur',t:'Kleur',style:'icon',kz:[
        {v:'natuurlijk',l:'Natuurlijk groen',sw:'#4a7a3a',def:1},{v:'lentegroen',l:'Lentegroen',sw:'#6fae4e'},{v:'olijf',l:'Olijf / tweekleurig',sw:'#6b7a44'}
      ]}
    ]},
    {row:1, when:function(s){return s.toepassing==='padel';}, groepen:[
      {id:'locatie',t:'Opstelling',style:'icon',kz:[
        {v:'buiten',l:'Buitenbaan',ic:IC.tuin,def:1},{v:'binnen',l:'Binnen (hal)',ic:IC.balkon,pM2:4}
      ]},
      {id:'uitvoering',t:'Uitvoering',style:'icon',kz:[
        {v:'standaard',l:'Standaard kooi',ic:IC.tegel,def:1},{v:'panorama',l:'Panorama (glas)',ic:IC.balkon,p:950}
      ]},
      {id:'baankleur',t:'Baankleur',style:'icon',kz:[
        {v:'blauw',l:'Blauw',sw:'#1f5fae',def:1},{v:'groen',l:'Groen',sw:'#2f7d3e'},{v:'terracotta',l:'Terracotta',sw:'#b0563a'},{v:'zwart',l:'Zwart',sw:'#1b1b1e'}
      ]}
    ]},
    {row:1, when:function(s){return s.toepassing==='padel';}, groepen:[
      {id:'framekleur',t:'Kooikleur (RAL)',style:'icon',kz:[
        {v:'antraciet',l:'Antraciet',sw:'#33383B',def:1},{v:'zwart',l:'Zwart',sw:'#141416'},{v:'groen',l:'Groen',sw:'#2f5d3a'},{v:'wit',l:'Wit',sw:'#EDEDE7'}
      ]},
      {id:'verlichting',t:'Verlichting',style:'icon',kz:[
        {v:'geen',l:'Geen',ic:IC.geen,def:1},{v:'led4',l:'4 LED-masten',ic:IC.led,p:2400},{v:'led8',l:'8 LED-masten',ic:IC.led,p:4200}
      ]},
      {id:'net',t:'Net & palen',style:'icon',kz:[
        {v:'standaard',l:'Standaard',ic:IC.tuin,def:1},{v:'wedstrijd',l:'Wedstrijd',ic:IC.sport,p:340}
      ]}
    ]},
    {id:'fundering',t:'Fundering',style:'icon',when:function(s){return s.toepassing==='padel';},kz:[
      {v:'beton',l:'Betonplaat',ic:IC.tegel,def:1},{v:'asfalt',l:'Asfalt',ic:IC.plank,pM2:-4},{v:'bestaand',l:'Bestaande ondergrond',ic:IC.geen,pM2:-10}
    ]},
    {id:'kleurstelling',t:'Kleurstelling boarding',style:'icon',when:function(s){return s.toepassing==='voetbal';},kz:[
      {v:'klassiek',l:'Blauw / geel',sub:'klassiek',sw:'#1f5fae',def:1},{v:'rood',l:'Rood',sw:'#c1352c'},{v:'groen',l:'Groen',sw:'#2f7d3e'},{v:'zwart',l:'Zwart',sw:'#1b1b1e'}
    ]},
    {row:1, when:function(s){return s.toepassing==='voetbal';}, groepen:[
      {id:'vezel',t:'Grastype (vezel)',style:'icon',kz:[
        {v:'mono',l:'Monofilament + krullaag',sub:'standaard voetbalturf',ic:IC.tuin,def:1},{v:'combi',l:'Combi-vezel',sub:'extra dicht',ic:IC.tuin,pM2:5},{v:'noninfill',l:'Non-infill (5G)',sub:'op shockpad',ic:IC.sport,pM2:12}
      ]},
      {id:'vhoogte',t:'Poolhoogte',style:'icon',kz:[
        {v:'40',l:'40 mm',ic:IC.sport,def:1},{v:'50',l:'50 mm',ic:IC.sport,pM2:4},{v:'60',l:'60 mm',sub:'meest gebruikt',ic:IC.sport,pM2:8}
      ]},
      {id:'belijning',t:'Belijning (kleur)',style:'icon',kz:[
        {v:'wit',l:'Wit',sw:'#F2F2EC',def:1},{v:'geel',l:'Geel',sw:'#E7C93A'},{v:'blauw',l:'Blauw',sw:'#2f6fd0'}
      ]}
    ]},
    {row:1, when:function(s){return s.toepassing==='voetbal';}, groepen:[
      {id:'omheining',t:'Omheining',style:'icon',kz:[
        {v:'hek',l:'Standaard hekwerk',ic:IC.tegel,def:1},{v:'ballenvanger',l:'Hoog ballenvangnet',ic:IC.tuin,pM2:6},{v:'boarding',l:'Met reclameborden',sub:'Cruyff-look',ic:IC.plank,pM2:11}
      ]},
      {id:'verlichting',t:'Verlichting',style:'icon',kz:[
        {v:'geen',l:'Geen',ic:IC.geen,def:1},{v:'led4',l:'4 LED-masten',ic:IC.led,p:3200},{v:'led8',l:'8 LED-masten',ic:IC.led,p:5600}
      ]},
      {id:'doeltype',t:'Doelen',style:'icon',kz:[
        {v:'panna',l:'Pannadoeltjes',ic:IC.sport,def:1},{v:'jeugd',l:'Jeugddoelen',ic:IC.sport,p:450},{v:'pro',l:'Wedstrijddoelen',ic:IC.sport,p:1200}
      ]}
    ]},
    {row:1, when:function(s){return s.toepassing==='voetbal';}, groepen:[
      {id:'invulling',t:'Invulling',style:'icon',when:function(s){return s.vezel!=='noninfill';},kz:[
        {v:'kurk',l:'Kurk (organic)',sub:'toekomstbestendig',ic:IC.tuin,def:1},{v:'sbr',l:'SBR-rubber',sub:'synthetische invulling',ic:IC.tegel,pM2:-4},{v:'epdm',l:'EPDM (kleur)',ic:IC.tegel,pM2:5},{v:'kokos',l:'Kokos/organic mix',ic:IC.tuin,pM2:2}
      ]},
      {id:'vfundering',t:'Onderbouw',style:'icon',kz:[
        {v:'lava',l:'Sporttechn. laag',sub:'lavasplit',ic:IC.tegel,def:1},{v:'shockpad',l:'+ Shockpad (e-layer)',ic:IC.level,pM2:12},{v:'bestaand',l:'Bestaande ondergrond',ic:IC.geen,pM2:-8}
      ]}
    ]}
  ],
  reflow:['toepassing','vezel'],
  extra:[
    {v:'onderlaag',l:'Stabilisatie-onderlaag',ic:IC.level,pM2:8,def:1,when:function(s){return s.toepassing==='tuin';}},
    {v:'kantopsluiting',l:'Kantopsluiting',ic:IC.profiel,p:160,when:function(s){return s.toepassing==='tuin';}},
    {v:'zand',l:'Instrooizand',ic:IC.onderhoud,pM2:2,when:function(s){return s.toepassing==='tuin';}},
    {v:'afvoer',l:'Afvoer oude situatie',ic:IC.geen,p:220,when:function(s){return s.toepassing==='tuin';}},
    {v:'scorebord',l:'Scorebord',ic:IC.tegel,p:450,when:function(s){return s.toepassing==='padel';}},
    {v:'bankjes',l:'Spelersbankjes',ic:IC.sofa,p:380,when:function(s){return s.toepassing==='padel';}},
    {v:'ballenmand',l:'Ballenmand & net-set',ic:IC.geen,p:120,when:function(s){return s.toepassing==='padel';}},
    {v:'reclame',l:'Reclamedoeken',ic:IC.plank,p:600,when:function(s){return s.toepassing==='padel';}},
    {v:'logomidden',l:'Clublogo op middenstip',ic:IC.tegel,p:650,when:function(s){return s.toepassing==='voetbal';}},
    {v:'scorebord',l:'Scorebord',ic:IC.tegel,p:650,when:function(s){return s.toepassing==='voetbal';}},
    {v:'dugout',l:'Dug-outs / spelersbanken',ic:IC.sofa,p:480,when:function(s){return s.toepassing==='voetbal';}},
    {v:'ballenmand',l:'Ballenmand & onderhoudsset',ic:IC.geen,p:150,when:function(s){return s.toepassing==='voetbal';}}
  ],
  dim:function(sel){
    if(sel.toepassing==='padel'){ var n=sel.banen||'1'; return n+(n==='1'?' baan':' banen'); }
    if(sel.toepassing==='voetbal'){ var vm={panna:'150 m²',cruyff:'1.150 m²',half:'3.400 m²',heel:'7.140 m²'}; return vm[sel.veld]||'Voetbalveld'; }
    return sel.opp==='mw'?'Maatwerk':(sel.opp+' m²');
  },
  heroCands:legacyCandidates,
  presets:[
    {n:'Strakke tuin',d:'Ibiza 45mm, natuurlijk',th:'gras-tuin',sel:{opp:'50',toepassing:'tuin',kwaliteit:'ibiza',kleur:'natuurlijk'},extras:{onderlaag:true,kantopsluiting:true,zand:false,afvoer:false}},
    {n:'Luxe villatuin',d:'Grote tuin · Dubai XL 50mm',th:'gras-luxe',sel:{opp:'100',toepassing:'tuin',tuintype:'luxe',kwaliteit:'dubaixl',kleur:'natuurlijk'},extras:{onderlaag:true}},
    {n:'Padel buiten',d:'Blauw, LED, betonplaat',th:'gras-padel-blauw',sel:{banen:'1',toepassing:'padel',locatie:'buiten',uitvoering:'standaard',baankleur:'blauw',framekleur:'antraciet',verlichting:'led4',net:'standaard',fundering:'beton'},extras:{}},
    {n:'Padel indoor',d:'Zwart panorama, hal',th:'gras-padel-zwart-binnen-panorama',sel:{banen:'2',toepassing:'padel',locatie:'binnen',uitvoering:'panorama',baankleur:'zwart',framekleur:'zwart',verlichting:'led8',net:'wedstrijd',fundering:'beton'},extras:{scorebord:true}},
    {n:'Pannakooi',d:'150 m² · kurk · hekwerk',th:'gras-voetbal-panna',sel:{veld:'panna',toepassing:'voetbal',kleurstelling:'klassiek',vezel:'mono',vhoogte:'40',belijning:'wit',omheining:'hek',verlichting:'geen',doeltype:'panna',invulling:'kurk',vfundering:'lava'},extras:{}},
    {n:'Cruyff Court (rood)',d:'1.150 m² · boarding · LED',th:'gras-voetbal-cruyff-rood',sel:{veld:'cruyff',toepassing:'voetbal',kleurstelling:'rood',vezel:'mono',vhoogte:'40',belijning:'wit',omheining:'boarding',verlichting:'led4',doeltype:'jeugd',invulling:'kurk',vfundering:'shockpad'},extras:{logomidden:true}},
    {n:'Trainingsveld',d:'3.400 m² · 50mm · 8 LED',th:'gras-voetbal-half',sel:{veld:'half',toepassing:'voetbal',kleurstelling:'klassiek',vezel:'mono',vhoogte:'50',belijning:'wit',omheining:'ballenvanger',verlichting:'led8',doeltype:'pro',invulling:'kurk',vfundering:'shockpad'},extras:{dugout:true}}
  ]
};

export {CFG};
export const ASSETS = new Set(["gras-luxe", "gras-luxe-lang", "gras-luxe-lang-lentegroen", "gras-luxe-lang-olijf", "gras-luxe-lentegroen", "gras-luxe-olijf", "gras-padel", "gras-padel-blauw", "gras-padel-blauw-binnen", "gras-padel-blauw-binnen-panorama", "gras-padel-blauw-panorama", "gras-padel-groen", "gras-padel-groen-binnen", "gras-padel-groen-binnen-panorama", "gras-padel-groen-panorama", "gras-padel-terracotta", "gras-padel-terracotta-binnen", "gras-padel-terracotta-binnen-panorama", "gras-padel-terracotta-panorama", "gras-padel-zwart", "gras-padel-zwart-binnen", "gras-padel-zwart-binnen-panorama", "gras-padel-zwart-panorama", "gras-swatch-bali", "gras-swatch-dubai", "gras-swatch-dubaixl", "gras-swatch-ibiza", "gras-swatch-java", "gras-tuin", "gras-tuin-kort", "gras-tuin-kort-lentegroen", "gras-tuin-kort-olijf", "gras-tuin-lang", "gras-tuin-lang-lentegroen", "gras-tuin-lang-olijf", "gras-tuin-lentegroen", "gras-tuin-olijf", "gras-voetbal", "gras-voetbal-cruyff", "gras-voetbal-cruyff-avond", "gras-voetbal-cruyff-ballenvanger", "gras-voetbal-cruyff-boarding", "gras-voetbal-cruyff-doelpro", "gras-voetbal-cruyff-groen", "gras-voetbal-cruyff-groen-avond", "gras-voetbal-cruyff-groen-boarding", "gras-voetbal-cruyff-groen-lijnblauw", "gras-voetbal-cruyff-groen-lijngeel", "gras-voetbal-cruyff-lijnblauw", "gras-voetbal-cruyff-lijngeel", "gras-voetbal-cruyff-rood", "gras-voetbal-cruyff-rood-avond", "gras-voetbal-cruyff-rood-boarding", "gras-voetbal-cruyff-rood-lijnblauw", "gras-voetbal-cruyff-rood-lijngeel", "gras-voetbal-cruyff-zwart", "gras-voetbal-cruyff-zwart-avond", "gras-voetbal-cruyff-zwart-boarding", "gras-voetbal-cruyff-zwart-lijnblauw", "gras-voetbal-cruyff-zwart-lijngeel", "gras-voetbal-half", "gras-voetbal-half-avond", "gras-voetbal-half-groen", "gras-voetbal-half-groen-avond", "gras-voetbal-half-rood", "gras-voetbal-half-rood-avond", "gras-voetbal-half-zwart", "gras-voetbal-half-zwart-avond", "gras-voetbal-heel", "gras-voetbal-heel-avond", "gras-voetbal-heel-groen", "gras-voetbal-heel-groen-avond", "gras-voetbal-heel-rood", "gras-voetbal-heel-rood-avond", "gras-voetbal-heel-zwart", "gras-voetbal-heel-zwart-avond", "gras-voetbal-panna", "gras-voetbal-panna-avond", "gras-voetbal-panna-groen", "gras-voetbal-panna-rood", "gras-voetbal-panna-zwart"]);

