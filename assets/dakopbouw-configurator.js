
(function(){
  'use strict';
  var $=function(q){return document.querySelector(q)};
  /* Een sleutel wordt een pad; een pad blijft een pad. Sinds de echte
     dakopbouwbeelden er zijn, dragen sommige keuzes een compleet pad in
     plaats van een korte sleutel. */
  function IM(id){ return /^[.\/]/.test(id) ? id : './assets/media/pf-'+id+'.jpg'; }

  /* ---------- markt ----------
     ?markt=be zet de configurator in Belgische modus. De beelden, opties en
     prijzen blijven identiek — alleen de btw-berekening en een handvol
     vaktermen verschillen. Zonder parameter verandert er niets aan de
     Nederlandse versie. */
  var MARKT=(function(){
    var m=(location.search.match(/[?&]markt=([a-z]{2})/i)||[])[1];
    return (m||'nl').toLowerCase()==='be' ? 'be' : 'nl';
  })();
  var BE=MARKT==='be';

  function euro(n){ return '€ '+Math.round(n).toLocaleString(BE?'nl-BE':'nl-NL'); }

  /* Vlaamse vaktermen. Alleen op zichtbare tekst toegepast, nooit op de
     waarden waarmee de configurator rekent — die blijven overal gelijk,
     zodat een ontwerp tussen beide markten uitwisselbaar blijft. */
  var VL=[
    [/\bstucwerk\b/g,'pleisterwerk'], [/\bStucwerk\b/g,'Pleisterwerk'],
    [/\bgestuukt\b/g,'gepleisterd'], [/\bGestuukt\b/g,'Gepleisterd'],
    [/\bstuc\b/g,'pleister'], [/\bStuc\b/g,'Pleister'],
    [/\bkozijnen\b/g,'schrijnwerk'], [/\bKozijnen\b/g,'Schrijnwerk'],
    [/\bkozijn\b/g,'schrijnwerk'], [/\bKozijn\b/g,'Schrijnwerk'],
    [/\bmantelzorgwoning\b/g,'zorgwoning'], [/\bMantelzorgwoning\b/g,'Zorgwoning'],
    [/\bachterom\b/g,'zijtoegang'], [/\bAchterom\b/g,'Zijtoegang'],
    [/\bACHTEROM\b/g,'ZIJTOEGANG']
  ];
  function tt(s){
    if(!BE||!s) return s;
    var out=String(s);
    for(var i=0;i<VL.length;i++) out=out.replace(VL[i][0],VL[i][1]);
    return out;
  }

  /* ---------- opties (1-op-1 uit de PrefabSelect-configurator) ---------- */
  /* De vier kozijnkleuren uit de briefing, met hun RAL erbij: dat is wat er
     op de offerte moet komen te staan. */
  var FRAME=[{v:'wit',l:'Wit',sw:'#F2F2EF',d:'RAL 9016'},
             {v:'creme',l:'Crème',sw:'#E9E2CE',d:'RAL 9001'},
             {v:'antraciet',l:'Antraciet',sw:'#383E42',d:'RAL 7016'},
             {v:'zwart',l:'Zwart',sw:'#111113',d:'RAL 9005'}];
  /* De vier gevelmaterialen uit de 384-mastermatrix. Elke slug is de
     sleutel in de beeldbank (assets/dakopbouw-beelden.js), zodat er geen
     tweede lijst is die uit de pas kan gaan lopen. "Metselwerk / steenstrips"
     is met opzet zo genoemd: technisch is het steenstrips, maar dat woord
     zegt een klant niets. */
  var MATERIALEN=[
    {v:'keralit',l:'Keralit',p:0,
     d:'Onderhoudsarm kunststof, strak vlak. Gaat 30+ jaar mee zonder schilderwerk.'},
    {v:'metselwerk',l:'Metselwerk / steenstrips',p:1800,
     d:'Sluit aan op de bestaande woning. Onderhoudsvrij, de zwaarste optie.'},
    {v:'stucwerk',l:'Stucwerk',p:900,
     d:'Strak en modern. Vraagt om de tien à vijftien jaar een controlebeurt.'},
    {v:'houtcomposiet',l:'Hout / composiet',p:1400,
     d:'Warme uitstraling zonder het onderhoud van echt hout.'}
  ];
  /* Kleurnamen en staaltjes voor het keuzeblokje. Wélke kleuren er per
     materiaal bestaan komt uit de beeldbank (24 gevelafwerkingen, zes per
     materiaal); dit is alleen het label en het staaltje erbij. */
  var GEVELKLEUR={
    wit:{l:'Wit',sw:'#F2F0EA'}, creme:{l:'Crème',sw:'#E8DFCB'},
    lichtgrijs:{l:'Lichtgrijs',sw:'#C3C4C2'}, grijs:{l:'Grijs',sw:'#9A9C99'},
    taupe:{l:'Taupe',sw:'#8F8171'}, antraciet:{l:'Antraciet',sw:'#383E42'},
    zwart:{l:'Zwart',sw:'#141416'}, grafiet:{l:'Grafiet',sw:'#3A3A3C'},
    rood:{l:'Rood',sw:'#8B3A2E'}, roodbruin:{l:'Roodbruin',sw:'#7A4436'},
    zand:{l:'Zand',sw:'#C8A870'}, donkerbruin:{l:'Donkerbruin',sw:'#4A3527'},
    'licht-eiken':{l:'Licht eiken',sw:'#B79063'}, 'warme-ceder':{l:'Warme ceder',sw:'#96603A'},
    'donker-walnoot':{l:'Donker walnoot',sw:'#4B3524'}, 'vergrijsd-hout':{l:'Vergrijsd hout',sw:'#8C8579'},
    'antraciet-composiet':{l:'Antraciet composiet',sw:'#383E42'}, 'zwart-composiet':{l:'Zwart composiet',sw:'#161616'}
  };
  /* Kozijnmodel: vier vaste opties, elk met exact dezelfde vier kozijnkleuren
     beschikbaar. Rechtstreeks hier neergezet in plaats van uit de beeldbank
     gelezen: dakopbouw-beelden.js laadt met defer, dus staat er nog niet als
     dit script (niet-deferred, hoog in de pagina) draait.
     De naam kozijnindeling/INDELINGEN blijft intern staan (minder plekken om
     te veranderen); voor de klant heet dit gewoon "Kozijnmodel". */
  var INDELINGEN=[
    {v:'model01',l:'Schuifpui',p:0,d:'Brede driedelige glazen schuifpui op de korte voorgevel.'},
    {v:'model02',l:'Openslaande deuren',p:0,d:'Dubbele openslaande glazen buitendeuren op de korte voorgevel.'},
    {v:'model03',l:'2-vaks + 3-vaks',p:0,d:'Combinatie van één 2-vaks en één 3-vaks kozijn op de korte voorgevel.'},
    {v:'model04',l:'Klein + 2-vaks',p:0,d:'Klein kozijn naast één groter 2-vaks kozijn op de korte voorgevel.'}
  ];
  /* De achtergevel heeft (nog) geen eigen renders: de foto toont de
     voorgevel. Daarom hier lijntekeningen, en een dichte gevel als keuze. */
  var ACHTER=[
    {v:'dicht',src:'./assets/media/dakopbouw/opties/achter-dicht.webp',l:'Dichte gevel',p:0,d:'Geen kozijn in de achtergevel.',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="6" width="20" height="12" rx="1"/></svg>'},
    {v:'raam',src:'./assets/media/dakopbouw/opties/achter-raam.webp',l:'Eén raam',p:0,d:'Eén draai-kiepraam in de achtergevel.',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="8" y="8" width="8" height="8" rx="1"/></svg>'},
    {v:'twee',src:'./assets/media/dakopbouw/opties/achter-twee.webp',l:'Twee ramen',p:0,d:'Twee ramen naast elkaar in de achtergevel.',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="8" width="7" height="8" rx="1"/><rect x="14" y="8" width="7" height="8" rx="1"/></svg>'},
    {v:'model01',src:'./assets/media/dakopbouw/opties/achter-schuifpui.webp',l:'Schuifpui',p:0,d:'Brede glazen schuifpui, ook aan de achterkant.',svg:''},
    {v:'model02',src:'./assets/media/dakopbouw/opties/achter-deuren.webp',l:'Openslaande deuren',p:0,d:'Dubbele openslaande deuren in de achtergevel.',svg:''}
  ];
  /* Balustrade langs de dakrand of een dakterras: een eigen stap, want
     het bepaalt hoe de opbouw er van buiten uitziet. */
  var BALUSTRADE=[
    {v:'geen',l:'Geen balustrade',p:0,d:'Alleen een dakrand, geen hekwerk.',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><line x1="2" y1="17" x2="22" y2="17"/></svg>'},
    {v:'glas',src:'./assets/media/dakopbouw/opties/balustrade-glas.webp',l:'Glazen balustrade',p:0,d:'Helder glas, vrij uitzicht.',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><line x1="2" y1="17" x2="22" y2="17"/><rect x="3" y="8" width="18" height="9" rx="1" stroke-dasharray="2 2"/></svg>'},
    {v:'spijlen',src:'./assets/media/dakopbouw/opties/balustrade-spijlen.webp',l:'Stalen spijlen',p:0,d:'Strak spijlenhek in de kleur van de kozijnen.',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><line x1="2" y1="17" x2="22" y2="17"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="6" y1="8" x2="6" y2="17"/><line x1="10" y1="8" x2="10" y2="17"/><line x1="14" y1="8" x2="14" y2="17"/><line x1="18" y1="8" x2="18" y2="17"/></svg>'},
    {v:'dicht',src:'./assets/media/dakopbouw/opties/balustrade-dicht.webp',l:'Dichte borstwering',p:0,d:'Gesloten rand in het gevelmateriaal.',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="9" width="20" height="8" rx="1"/></svg>'}
  ];
  /* Schematische iconen voor de kozijnmodel-tegels: de terugval zolang de
     exacte foto er nog niet is. Vier lijntekeningen, geen foto's. */
  var MODEL_SVG={
    model01:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="9" y1="6" x2="9" y2="18"/><line x1="16" y1="6" x2="16" y2="18"/></svg>',
    model02:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="3" y="6" width="8" height="12" rx="1"/><rect x="13" y="6" width="8" height="12" rx="1"/><path d="M11 7c-3 1-3 9 0 10M13 7c3 1 3 9 0 10" stroke-width="1"/></svg>',
    model03:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="7" width="8" height="10" rx="1"/><line x1="6" y1="7" x2="6" y2="17"/><rect x="12" y="7" width="10" height="10" rx="1"/><line x1="15.33" y1="7" x2="15.33" y2="17"/><line x1="18.66" y1="7" x2="18.66" y2="17"/></svg>',
    model04:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="9" width="6" height="8" rx="1"/><rect x="10" y="6" width="12" height="11" rx="1"/><line x1="16" y1="6" x2="16" y2="17"/></svg>'
  };
  var DAK=[
    {v:'epdm',l:'EPDM (standaard)',p:0,d:'Waterdicht en onderhoudsvrij.',src:'./assets/media/dakopbouw/dak/dak-epdm-01.jpg'},
    {v:'bitumen',l:'Bitumen luxe',p:850,d:'Meerlaags gebrand, extra stevig.',src:'./assets/media/dakopbouw/dak/dak-bitumen-luxe-01.jpg'},
    {v:'white-roofing',l:'Witte bitumen',p:1200,d:'Reflecteert zonlicht: koeler in de zomer.',src:'./assets/media/dakopbouw/dak/dak-witte-bitumen-01.jpg'},
    {v:'green',l:'Groen sedumdak',p:2200,d:'Isolerend en een prachtig natuurlijk aanzicht.',src:'./assets/media/dakopbouw/dak/dak-sedum-01.jpg'}
  ];
  var LICHT=[
    {v:'none',l:'Geen lichtstraat',p:0,src:'./assets/media/dakopbouw/opties/licht-geen-2.webp'},
    {v:'glasplaat-200',l:'Glasplaat 1×2 m HR+++',p:2500,im:'agcib9T'},
    {v:'glasplaat-300',l:'Glasplaat 1×3 m HR+++',p:3800,im:'VZ5aS7a'},
    {v:'glasplaat-400',l:'Glasplaat 1×4 m HR+++',p:5100,im:'Pijbfx2'},
    {v:'vakverdeling-200',l:'Vakverdeling 1×2 m HR++',p:2100,im:'HCQHKA4'},
    {v:'vakverdeling-300',l:'Vakverdeling 1×3 m HR++',p:2900,im:'v6mDbJp'},
    {v:'vakverdeling-400',l:'Vakverdeling 1×4 m HR++',p:3700,im:'kejwlg2'}
  ];
  /* Wat er nu op de woning ligt. Geen prijsverschil in de richtprijs: de
     sloop van een kap is maatwerk en wordt in de offerte beoordeeld — dat
     eerlijk benoemen is beter dan een bedrag verzinnen. */
  /* Ook een doorsnede en geen foto: het verschil zit in wat er nú op de woning
     ligt, en dat is precies de lijn erboven. De opbouw staat er gestippeld op,
     want die komt er nog. */
  var DAK_SVG={
    plat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-8h16v8"/><path d="M2 13h20"/><path d="M7 13V7h10v6" stroke-dasharray="2 2"/></svg>',
    hellend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-8h16v8"/><path d="M2 13l10-7 10 7"/></svg>'
  };
  var BESTAAND_DAK=[
    {v:'plat',l:'Plat dak',p:0,d:'Uitgangspunt van de richtprijs: de opbouw komt op het bestaande platte dak.',svg:DAK_SVG.plat},
    {v:'hellend',l:'Hellend dak (kap eraf)',p:0,d:'De bestaande kap wordt gesloopt en afgevoerd. Dat is maatwerk: wij beoordelen en prijzen het in de offerte.',svg:DAK_SVG.hellend}
  ];

  /* De KOZIJN-lijst is hier weggehaald, en dat was een reparatie en geen
     opruiming.

     Hij werd nergens getekend - de tegels stonden alleen in de isPool()-tak en
     die draait op deze pagina nooit - maar hij télde wel mee in de prijs, en
     een voorinstelling zette er een van aan. Een koper die "Slaapkamer +
     dakterras" koos betaalde dus 3.500 euro voor een schuifpui die hij nergens
     kon zien, kiezen of uitzetten.

     Erger nog: diezelfde schuifpui staat al in groep 6 (Kozijnmodel), voor
     nul euro, met een render uit de 384-gevelmatrix die materiaal, gevelkleur
     en kozijnkleur werkelijk volgt. Twee wegen naar hetzelfde product, waarvan
     de ene onzichtbaar was en geld kostte. De zichtbare is gebleven. */
  var KLIMAAT=[
    {v:'none',l:'Standaard ventilatie',p:0,im:'RVYRjxW'},
    {v:'airco-single',l:'Airco (single split)',p:2450,im:'xYqsdAL',d:'Voorbeeld met één binnenunit. Uitvoering en vermogen worden op maat bepaald.'},
    {v:'airco-multi',l:'Multi-split airco',p:4800,im:'xYqsdAL',d:'Voorbeeld met twee binnenunits en één buitenunit. Definitief aantal en vermogen op maat.'}
  ];
  var ELEKTRA=[
    {v:'spotjes',l:'Spotjes',p:450,im:'yAif8kE',qty:1},
    {v:'stopcontacten-binnen',l:'Stopcontacten binnen',p:150,im:'qcqm3gD',qty:1},
    {v:'lamp-punten-binnen',l:'Lamppunten binnen',p:150,im:'qcqm3gD',qty:1,d:'Aansluitpunt, exclusief armatuur.'},
    {v:'radiator',l:'Radiator (op cv)',p:850,im:'So91bOz'},
    {v:'stopcontact-buiten',l:'Stopcontact buiten',p:225,im:'zOAatli',qty:1},
    {v:'lamp-punten-buiten',l:'Lamppunten buiten',p:250,im:'qTIctyr',qty:1,d:'Aansluitpunt, exclusief armatuur.'},
    {v:'meterkast',l:'Meterkast uitbreiden',p:1250,im:'jwH4Zfm'},
    /* Omgekeerd geformuleerd, en met opzet. Het verleggen van de leidingen zit
       in de basisprijs omdat het bij een dakopbouw altijd gebeurt; de ketel
       gaat in de regel mee omhoog. Wie hem beneden wil houden vinkt dit aan —
       dan vervalt het werk, en met de prijs ook de posten in de staat. */
    {v:'cv-blijft',l:'CV-ketel blijft waar hij hangt',p:-950,
     d:'Standaard verhuist de ketel mee naar de opbouw.'}
  ];
  /* Een dakopbouw heeft geen fundering en geen doorbraak. Wat hij wél nodig
     heeft is toegang en, bijna altijd, een verzwaring van wat er al staat.
     Dezelfde sleutelnaam (st.fundering) blijft in gebruik zodat de rest van de
     configurator ongewijzigd werkt; alleen de inhoud is een andere. */
  /* Verleggen van de leidingen die door het oude dak liepen: mechanische
     ventilatie, rookgasafvoer en de ontspanningsleiding van de riolering,
     inclusief drie nieuwe dakdoorvoeren en het meeverhuizen van de ketel. */
  var LEIDINGWERK=3250;
  /* Toegang en verzwaring spelen zich af in de bestaande woning eronder —
     onzichtbaar vanaf de straat. Geen eigen exterieurfoto dus: dat zou een
     andere, willekeurige dakopbouw suggereren. */
  var ZONWERING=['screens','rolluiken'], ELDERS=['screens','rolluiken','overstek-spotjes'];
  /* Wat er nu op het platte dak ligt en weg moet. Prijs per m² footprint staat
     in de calculatie van het bedrijf (sloopPerM2); de klant ziet geen bedrag. */
  var SLOOP=[
    {v:'geen',l:'Geen',p:0,d:'Geen sloop nodig, of we bekijken het later samen.'},
    {v:'dakbedekking',l:'Alleen dakbedekking verwijderen',p:0,d:'Bitumen of EPDM, geen grind.'},
    {v:'grind',l:'Grind + dakbedekking verwijderen',p:0,d:'Losse steentjes op bitumen/EPDM.'}
  ];
  var DOORGANG=[
    {v:'hout',l:'Houten vloer',p:0,d:'Lichter werk, sneller klaar.'},
    {v:'beton',l:'Betonnen vloer',p:0,d:'Doorbraak + raveelijzer.'},
    {v:'geen',l:'Geen doorgang nodig',p:0,d:'Er is al een opening, of we bekijken het samen.'}
  ];
  var VERGUNNING=[
    {v:'vergunning',l:'Vergunningsaanvraag + constructieberekening',p:0,d:'Aanbevolen. Bouwtekeningen, constructieberekening, indiening bij de gemeente en begeleiding. Exclusief legeskosten.'},
    {v:'haalbaarheid',l:'Haalbaarheidscheck vooraf',p:0,d:'We toetsen vooraf of een dakopbouw past binnen het bestemmingsplan en de welstandseisen.'}
  ];
  var FUND_UIT=[
    {v:'trap-nieuw',l:'Nieuwe vaste trap',p:3800,
     d:'Onze standaard: een rechte trap op maat van de nieuwe verdiepingshoogte. Render als voorbeeld; materiaal en afwerking volgens offerte.'},
    {v:'trap-bestaand',l:'Bestaande trap doortrekken',p:2200,
     d:'Maatwerk als de bestaande trap het toelaat. Render als voorbeeld; vorm en afwerking volgen uit de woningopname.'},
    {v:'verzwaring-balklaag',l:'Verzwaring bestaande balklaag (vuren/LVL)',p:4500},
    {v:'lvl-portaal',l:'LVL portaal / overdrachtsconstructie',p:6500,d:'Profiel en verbindingen volgen uit de projectspecifieke constructieberekening.'}
  ];
  var AFWERK_UIT=[
    {v:'casco',l:'Casco',pm2:1900,d:'Jij doet de binnenafwerking zelf.'},
    {v:'stuc',l:'Inclusief stucwerk',pm2:2050,d:'Wanden en plafond glad gestuukt.'},
    {v:'luxe',l:'Compleet ontzorgd',pm2:2250,d:'Stuc, schilderwerk en vloerafwerking.'}
  ];
  /* Bij compleet ontzorgd kiest de bezoeker ook de vloer. Geen meerprijs
     hier: het legpatroon bespreken en prijzen wij in de offerte. */
  var VLOER_AFW=[
    {v:'visgraat',src:'./assets/media/dakopbouw/opties/vloer-visgraat.webp',l:'Visgraat',p:0,d:'Klassiek visgraatpatroon, PVC of hout.'},
    {v:'hongaars',src:'./assets/media/dakopbouw/opties/vloer-hongaars.webp',l:'Hongaarse punt',p:0,d:'Visgraat met schuine kopse kanten.'},
    {v:'stroken',src:'./assets/media/dakopbouw/opties/vloer-stroken.webp',l:'Rechte stroken',p:0,d:'Lange planken in de lengte van de kamer.'},
    {v:'tegels',src:'./assets/media/dakopbouw/opties/vloer-tegels.webp',l:'Tegels',p:0,d:'Grote keramische vloertegels.'},
    {v:'gietvloer',src:'./assets/media/dakopbouw/opties/vloer-gietvloer.webp',l:'Gietvloer',p:0,d:'Naadloos en strak.'}
  ];
  var EXTRA_UIT=[
    {v:'overstek-spotjes',l:'Overstek met spotjes',p:4200,im:'qUl4rWG'},
    {v:'dakterras',l:'Dakterras met hekwerk',p:450,unit:'m2',src:'./assets/media/dakopbouw/dak/dakterras-01.jpg'},
    {v:'dakraam',l:'Dakraam',p:1900,unit:'st'},
    {v:'vloerverwarming',l:'Vloerverwarming',p:85,unit:'m2',im:'dRZdSzG'},
    {v:'screens',l:'Screens',p:1500,unit:'st',im:'u2nSm7j'},
    {v:'rolluiken',l:'Rolluiken',p:1500,unit:'st',im:'EzJM7vZ'},
  ];
  /* Een dakopbouw is geen studio: er komen slaapkamers in, en bijna altijd een
     badkamer. De indeling bepaalt hoeveel binnenwanden en deuren er nodig zijn,
     de badkamer bepaalt waar het water en de afvoer naartoe moeten — allebei
     staan ze dus ook in de materiaalstaat. */
  var INDELING=[
    {v:'open',l:'Open ruimte',p:0,src:'./assets/media/dakopbouw/basis-lange-antracieten-dakuitbouw.jpg',d:'Eén ruimte, geen binnenwanden.'},
    {v:'1-slaapkamer',l:'1 slaapkamer',p:2200,src:'./assets/media/dakopbouw/interieur/indeling-1-slaapkamer-01.webp',d:'Eén kamer plus overloop.'},
    {v:'2-slaapkamers',l:'2 slaapkamers',p:4200,src:'./assets/media/dakopbouw/basis-rooftop-uitbouw-met-dubbele-antracietramen.jpg',d:'De meest gevraagde indeling.'},
    {v:'3-slaapkamers',l:'3 slaapkamers',p:6200,src:'./assets/media/dakopbouw/basis-dakopbouw-met-drie-antraciete-glaspanelen.jpg',d:'Vraagt breedte: vanaf ongeveer 7 m.'}
  ];
  /* Interieurbeelden per indeling — los van de exterieurfoto's hierboven.
     Alle vier zijn er nu. Nooit een andere indeling tonen als vervanging —
     ontbreekt de indeling hier, dan valt de aanzicht-tab terug op de
     "nog geen interieurbeeld"-melding. */
  var INDELING_INTERIEUR={
    /* De laatste van de vier. Hij laat met opzet één deur zien: dat is het hele
       verschil met de indeling ernaast, waar er twee in de gang staan. */
    '1-slaapkamer':[
      './assets/media/dakopbouw/interieur/indeling-1-slaapkamer-01.webp'
    ],
    'open':[
      './assets/media/dakopbouw/interieur/indeling-open-woonruimte-01.jpg',
      './assets/media/dakopbouw/interieur/indeling-open-woonruimte-02.jpg'
    ],
    '2-slaapkamers':[
      './assets/media/dakopbouw/interieur/indeling-2-slaapkamers-gang-01.jpg'
    ],
    '3-slaapkamers':[
      './assets/media/dakopbouw/interieur/indeling-3-slaapkamers-gang-01.jpg',
      './assets/media/dakopbouw/interieur/indeling-3-slaapkamers-gang-03.jpg'
    ]
  };
  /* De badkamer is geen indeling maar een voorziening — verschijnt daarom
     los, alleen in Interieur-weergave, en alleen als er ook echt een
     badkamer is gekozen bij Voorzieningen. Nooit gekoppeld aan het
     exterieurbeeld: zie de uitsluiting van 'voorz' in updateHero(). */
  var BADKAMER_INTERIEUR='./assets/media/dakopbouw/opties/voorziening-badkamer-compleet.webp';
  /* Afwerking, indeling en gekozen voorzieningen zijn afzonderlijke voorbeelden.
     Nooit een ingerichte ruimte presenteren als casco of een airco laten staan
     nadat die optie is uitgezet. */
  function interieurItems(){
    var items=[];
    function add(src,label,kind){
      if(src && !items.some(function(x){return x.src===src;})) items.push({src:src,label:label,kind:kind});
    }
    function option(list,value,group,kind){ add(optImg(list,value,group),lbl(list,value),kind||'optie'); }
    option(AFWERK_UIT,st.finish,'finish','afwerking');
    if(st.finish==='luxe') option(VLOER_AFW,st.vloerAfw||'visgraat',null,'vloer');
    (INDELING_INTERIEUR[st.indeling]||[]).forEach(function(src,i){
      add(src,'Indeling: '+lbl(INDELING,st.indeling)+(i?' · aanzicht '+(i+1):''),'indeling');
    });
    if(!KORT||KORT.indexOf('fundering')>=0) ['trap-nieuw','trap-bestaand'].forEach(function(v){ if(st.fundering[v]) option(FUND_UIT,v,'fundering'); });
    if(st.airco!=='none') option(KLIMAAT,st.airco,'airco');
    if(st.skylight!=='none') option(LICHT,st.skylight,'skylight');
    VOORZ.forEach(function(o){ if(st.voorzieningen[o.v]) option(VOORZ,o.v,'voorz'); });
    /* Spotjes, stopcontacten en lamppunten zet de plattegrond zelf neer
       (automatische indeling): dat zijn geen keuzes met een eigen foto. */
    var planElektra=!!window.NGPlattegrond&&document.documentElement.hasAttribute('data-stapsgewijs');
    (planElektra?['radiator','meterkast']:['spotjes','stopcontacten-binnen','lamp-punten-binnen','radiator','meterkast']).forEach(function(v){
      if(st.elektra[v]) option(ELEKTRA,v,'elektra');
    });
    ['dakraam','vloerverwarming'].forEach(function(v){ if(st.extras[v]) option(EXTRA_UIT,v,'extras'); });
    return items;
  }
  function interieurBeelden(){ return interieurItems().map(function(x){return x.src;}); }
  function normaliseerBadkamer(){
    if(st.voorzieningen['badkamer-compleet']) delete st.voorzieningen['badkamer-basis'];
    if(st.fundering['trap-bestaand']) delete st.fundering['trap-nieuw'];
  }
  var VOORZ=[
    {v:'badkamer-basis',l:'Badkamer, basis',p:8500,
     d:'Douche, wastafel en toilet. Ongeveer 5 m².'},
    {v:'badkamer-compleet',l:'Badkamer, compleet',p:12500,src:BADKAMER_INTERIEUR,
     d:'Inloopdouche, wastafelmeubel en een apart toilet. Ongeveer 7 m².'},
    {v:'apart-toilet',l:'Extra apart toilet',p:2800,d:'Een extra toiletruimte; bij badkamer compleet is al één apart toilet inbegrepen.'},
    {v:'inbouwkasten',l:'Inbouwkasten op maat',p:3400,d:'Langs de wand of de knieschotten.'}
  ];
  var ISOLATIE=[
    {v:'standaard-plus',l:'Standaard plus',p:0,d:'Hoge isolatie volgens bouwbesluit.'},
    {v:'gasloos-warmtepomp',l:'Volledig gasloos (warmtepomp)',p:4500,src:'./assets/media/dakopbouw/installaties/dakopbouw-warmtepomp-01.jpg'},
    {v:'zonnepanelen-8',l:'8 zonnepanelen',p:3200,src:'./assets/media/dakopbouw/installaties/dakopbouw-zonnepanelen-01.jpg'}
  ];

  /* ---------- tuinstudio / poolhouse (uit de PrefabSelect-configurator) ---------- */

  /* Drie plekken waar een dakopbouw op kan staan. Het verschil is niet
     cosmetisch: op een aanbouw of garage komen er drie nieuwe wanden bij en
     is de vierde zijde de bestaande gevel; bij een optopping staat de opbouw
     vrij op het dak en zijn het er vier. Dat verschil bepaalt de helft van de
     materiaalstaat, dus staat het hier als `vrij` en gaat het mee. */
  /* De plattegrondvorm. Een dakopbouw hoeft de bestaande verdieping niet
     helemaal te vullen: om een schoorsteen, een dakkapel of de erfgrens heen
     wordt het een L. De bouwmethode staat er met opzet niet bij — op een
     bestaand dak is gemetseld bouwen te zwaar, dus is het altijd
     houtskeletbouw. */
  /* De vier plattegronden stonden zonder beeld, en een render zou hier ook niet
     helpen: een hap uit de plattegrond is van buiten nauwelijks te zien, en van
     boven is het geen foto maar een tekening. Vandaar dezelfde schematische
     lijn als bij de kozijnmodellen — de vorm zelf, van boven, in één oogopslag
     te vergelijken. */
  var VORM_SVG={
    rechthoek:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 5h18v14H3z"/></svg>',
    'l-links':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M9 5h12v14H3v-8h6z"/></svg>',
    'l-rechts':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 5h12v6h6v8H3z"/></svg>',
    'u-vorm':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 5h6v5h6V5h6v14H3z"/></svg>'
  };
  var VORM=[
    {v:'rechthoek',l:'Rechthoek',p:0,d:'De hele breedte over de hele diepte.',svg:VORM_SVG.rechthoek},
    {v:'l-links',l:'L-vorm, hap links',p:0,d:'Links smaller, om een schoorsteen of de erfgrens heen.',svg:VORM_SVG['l-links']},
    {v:'l-rechts',l:'L-vorm, hap rechts',p:0,d:'Rechts smaller.',svg:VORM_SVG['l-rechts']},
    {v:'u-vorm',l:'U-vorm',p:0,d:'Een uitsparing midden in de voorzijde.',svg:VORM_SVG['u-vorm']}
  ];

  var TYPES={
    'op-aanbouw':{titel:'Dakopbouw op de aanbouw',sub:'Extra kamer boven je uitbouw of garage',woning:false,maxW:8,vrij:false},
    'op-woning':{titel:'Dakopbouw op de woning',sub:'Een verdieping erbij op het platte dak',woning:false,maxW:10,vrij:false},
    optopping:{titel:'Optopping',sub:'Volledige extra verdieping op de woning',woning:false,maxW:12,vrij:true}
  };

  var PRESETS={
    'op-aanbouw':[
      {n:'Extra slaapkamer',d:'4×3 · casco · keralit',th:'./assets/media/dakopbouw/keralit-witte-keralit-dakopbouw-met-zwarte-kozijnen.jpg',set:{w:4,dp:3,material:'keralit',finish:'casco',indeling:'1-slaapkamer'}},
      {n:'Slaapkamer + dakterras',d:'5×3 · schuifpui · terras',th:'./assets/media/dakopbouw/keralit-antraciet-keralit-met-zwarte-kozijnen.jpg',set:{w:5,dp:3,material:'keralit',indeling:'1-slaapkamer',frameColor:'antraciet',finish:'stuc',kozijnindeling:'model01',extras:{dakterras:{q:6}}}},
      {n:'Compleet ontzorgd',d:'5×4 · stuc · luxe',th:'./assets/media/dakopbouw/stucwerk-dakopbouw-met-antraciet-stucwerk-en-cremekozijnen.jpg',set:{w:5,dp:4,material:'stucwerk',facadeColor:'wit',finish:'luxe'}}
    ],
    'op-woning':[
      {n:'Ruime slaapkamer',d:'6×4 · casco',th:'./assets/media/dakopbouw/metselwerk-rood-bakstenen-dakopbouw-met-zwarte-kozijnen.jpg',set:{w:6,dp:4,material:'keralit',finish:'casco',indeling:'1-slaapkamer'}},
      {n:'Slaapkamer + badkamer',d:'7×4 · stuc',th:'./assets/media/dakopbouw/keralit-lichtgrijze-keralit-dakuitbouw-met-zwarte-kozijnen.jpg',set:{w:7,dp:4,material:'stucwerk',facadeColor:'wit',finish:'stuc',indeling:'1-slaapkamer',voorzieningen:['badkamer-compleet']}},
      {n:'Compleet ontzorgd',d:'8×4 · luxe',th:'./assets/media/dakopbouw/houtlook-dakopbouw-met-cederlook-en-antraciet-kozijnen.jpg',set:{w:8,dp:4,material:'houtcomposiet',facadeColor:'licht-eiken',finish:'luxe'}}
    ],
    optopping:[
      {n:'Hele verdieping casco',d:'8×5 · casco',th:'./assets/media/dakopbouw/metselwerk-roodbruine-bakstenen-dakuitbouw-met-zwarte-kozijnen.jpg',set:{w:8,dp:5,material:'keralit',finish:'casco'}},
      {n:'Verdieping met pui',d:'9×5 · schuifpui',th:'./assets/media/dakopbouw/keralit-taupe-keralit-met-zwarte-kozijnen.jpg',set:{w:9,dp:5,material:'stucwerk',facadeColor:'wit',finish:'stuc'}},
      {n:'Sleutelklaar',d:'10×5 · luxe',th:'./assets/media/dakopbouw/houtlook-dakopbouw-in-donker-walnotenhout.jpg',set:{w:10,dp:5,material:'houtcomposiet',facadeColor:'licht-eiken',finish:'luxe'}}
    ]
  };


  /* ---------- state ---------- */
  var st;
  function defaults(type){
    var wn=TYPES[type].woning, pl=!!TYPES[type].pool;
    return {
      type:type, w:pl?6:(wn?8:4), dp:pl?4:(wn?4:3), h:2.8,
      material:'keralit', facadeColor:'antraciet', kozijnindeling:'model01', kozijnAchter:'raam', balustrade:'geen', vloerAfw:'visgraat',
      roofing:'epdm', skylight:'none', accent:'none', frameColor:'antraciet',
      /* Een nieuwe vaste trap staat aan: zonder trap kom je niet in de opbouw
         en dat is wat wij standaard bouwen. Uitzetten kan, maar dan is het een
         bewuste keuze van de bezoeker en geen vergeten vinkje. */
      airco:'none', elektra:{}, fundering:{'trap-nieuw':1}, achterom:'ja', sloop:'geen', doorgang:'hout', vergunning:{vergunning:1},
      finish: wn?'casco':'casco',
      vorm:'rechthoek', hoekB:null, hoekD:null, bouwmethode:'hsb',
      extras:{}, indeling:'open', voorzieningen:{}, isolatie:{'standaard-plus':1},
      zonw:'none', vloer:'casco', bad:'none', keuken:'none', extraR:{},
      // Belgische renovatievoorwaarden; in Nederlandse modus ongebruikt
      woningOud:'ja', bestaandM2:120, bestaandDak:'plat',
      lastGroup:null, aanzicht:'ext', thumbIdx:0
    };

  }
  var btwIncl=true;

  /* ---------- btw ----------
     Nederland: altijd 21%.
     België: 6% renovatietarief in plaats van 21%, maar alleen als aan alle
     voorwaarden is voldaan. Twee daarvan hangen aan het ontwerp en kan de
     configurator zelf nagaan:
       - de aanbouw mag niet zelfstandig kunnen functioneren, dus geldt het
         niet voor een vrijstaande zorgwoning, vakantiewoning of tuinstudio;
       - de bestaande woning moet ná de werken meer dan de helft van de
         totale oppervlakte beslaan — dat is precies hetzelfde als: de
         bestaande woning is groter dan de uitbreiding.
     De derde, de ouderdom van de woning, vragen we aan de bezoeker. De
     overige voorwaarden (privégebruik, geregistreerde aannemer, factuur op
     naam van de eindgebruiker) liggen bij de aannemer, niet bij het ontwerp;
     die staan als voorbehoud onder de prijs. */
  function btwTarief(){
    if(!BE) return 0.21;
    if(st.woningOud!=='ja') return 0.21;
    if(!(st.bestaandM2 > oppervlak())) return 0.21;
    return 0.06;
  }

  /* Het oppervlak volgt uit de vorm en niet uit breedte maal diepte. */
  function oppervlak(){
    if(window.NGBouwvormen) return window.NGBouwvormen.lees(st).opp;
    return st.w*st.dp;
  }
  /* Op deze pagina wordt altijd een verdieping gebouwd waar mensen slapen,
     dus indeling, sanitair en isolatie horen er altijd bij. In de
     aanbouwconfigurator hing dat aan isWn(); hier is het geen keuze. */
  function heeftIndeling(){ return true; }
  /* De zes gevelkleuren per materiaal komen uit de beeldbank (de vaste
     24-afwerkingenlijst van de 384-matrix) en worden altijd allemaal
     getoond — een kleur is een echt product, ongeacht of de foto er al is.
     Of de gekozen combinatie een render heeft, bepaalt pas facadeImg(). */
  /* Grote materiaalstaal: zo ziet de bekleding er van dichtbij uit. */
  var STAAL_VOORDELEN={
    keralit:['Vrijwel geen onderhoud','Kleurvast en strak'],
    metselwerk:['Sluit aan op de bestaande woning','Onderhoudsvrij'],
    stucwerk:['Strak en modern','Naadloos gevelvlak'],
    houtcomposiet:['Warme houtlook','Geen schilderwerk nodig']
  };
  /* Binnenaanzicht van het achtergevelkozijn in de gekozen kozijnkleur. */
  var KOZ_BINNEN={raam:'achterraam',twee:'twee-achterramen',model01:'schuifpui-3-delig',model02:'openslaande-deuren'};
  var KOZ_RAL={wit:'RAL9016',creme:'RAL9001',antraciet:'RAL7016',zwart:'RAL9005'};
  function kozijnBinnen(model,kleur){
    var m=KOZ_BINNEN[model], r=KOZ_RAL[kleur||st.frameColor||'antraciet'];
    return m&&r?'./assets/media/dakopbouw/kozijnen/kozijn-'+m+'-'+(kleur||st.frameColor||'antraciet')+'-'+r+'.webp':null;
  }
  function staalUrl(){
    if(!window.NGGevelstaal) return null;
    var k=(facadeSet()[st.material]||[]).filter(function(x){return x.v===st.facadeColor;})[0];
    return NGGevelstaal.url(st.material,k?k.sw:'#888',st.facadeColor);
  }
  /* Dezelfde staal klein in de hoek van de grote render, zolang de klant de
     gevel kiest: render en materiaal in één beeld. */
  var GEVELSTAPPEN=['material','facadeColor'];
  function heroStaal(){
    var el=document.getElementById('heroStaal'); if(!el) return;
    var stap=st.stapNu, toon=(stap?GEVELSTAPPEN.indexOf(stap)>=0:!document.documentElement.hasAttribute('data-stapsgewijs'))&&st.aanzicht!=='int'&&!!staalUrl();
    if(!document.documentElement.hasAttribute('data-stapsgewijs')) toon=toon&&GEVELSTAPPEN.indexOf(st.lastGroup||'material')>=0;
    el.hidden=!toon; if(!toon) return;
    var k=(facadeSet()[st.material]||[]).filter(function(x){return x.v===st.facadeColor;})[0];
    el.querySelector('img').src=staalUrl(); el.classList.toggle('is-foto',!!(NGGevelstaal.foto&&NGGevelstaal.foto(st.material,st.facadeColor))); el.querySelector('small').textContent=lbl(MATERIALEN,st.material); el.querySelector('b').textContent=k?k.l:'';
  }
  function staalHtml(){
    var u=staalUrl(); if(!u) return '';
    var k=(facadeSet()[st.material]||[]).filter(function(x){return x.v===st.facadeColor;})[0];
    return '<figure class="staal"><button type="button" class="staal__beeld'+(NGGevelstaal.foto&&NGGevelstaal.foto(st.material,st.facadeColor)?' is-foto':'')+'" data-staal="1" aria-label="Materiaalstaal groot bekijken"><img src="'+u+'" alt="Materiaalstaal '+lbl(MATERIALEN,st.material)+(k?' '+k.l:'')+'">'
      +'<span class="staal__label"><small>'+lbl(MATERIALEN,st.material)+'</small><b>'+(k?k.l:'')+'</b></span></button>'
      +'<figcaption class="staal__noot">Materiaalstaal, werkelijke kleur kan licht afwijken. Tik om groot te bekijken.</figcaption>'
      +'<ul>'+(STAAL_VOORDELEN[st.material]||[]).map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul></figure>';
  }
  function facadeSet(){
    var uit={};
    if(!window.NGDakopbouwBeelden) return uit;
    MATERIALEN.forEach(function(m){
      uit[m.v]=NGDakopbouwBeelden.gevelkleuren(m.v).map(function(k){
        var n=GEVELKLEUR[k.v]||{l:k.l,sw:'#999'};
        return {v:k.v,l:n.l||k.l,sw:n.sw};
      });
    });
    return uit;
  }
  function matLijst(){ return zicht('material',MATERIALEN); }
  function dakLijst(){ return zicht('roofing',DAK); }
  function lichtLijst(){ return zicht('skylight',LICHT); }
  /* Eén plek waar het hoofdbeeld vandaan komt. kies() zoekt de EXACTE
     combinatie van materiaal, gevelkleur, kozijnmodel en kozijnkleur op —
     niets minder. Ontbreekt de render, dan is src null en toont updateHero()
     de "render volgt"-melding. Nooit een andere combinatie als vervanging:
     een klant die zwarte kozijnen kiest en witte ziet, denkt dat hij witte
     krijgt. */
  var laatsteBeeld=null;
  function facadeImg(){
    if(!window.NGDakopbouwBeelden) return null;
    var r=NGDakopbouwBeelden.kies({materiaal:st.material, gevelkleur:st.facadeColor,
                                   model:st.kozijnindeling, kozijnkleur:st.frameColor});
    laatsteBeeld=r;
    return r.src;
  }

  var BRICK_ACC={
    'schuifpui-300':{wit:'KmR2pPk',zwart:'I19u7HD',antraciet:'mWUQjph'},
    'schuifpui-400':{wit:'nvayyxw',zwart:'JSuzbPk',antraciet:'9JSGiWm'},
    'openslaande':{wit:'4Nwjz1l',zwart:'Bh7FNpO',antraciet:'A5wLxmR'},
    'dubbele-schuifpui':{wit:'Fym7Jsb',zwart:'Rs4TL5J',antraciet:'ONKQu32'},
    'harmonica-600':{wit:'ifGUx3G',zwart:'Ynu4W7F',antraciet:'wnWrJzS'},
    'harmonica':{wit:'2g8yPD2',zwart:'Ntr0BpA',antraciet:'gXuAcdO'}
  };
  function accentImg(){
    if(st.accent==='none') return null;
    var isEiken=(st.material==='composite'||st.material==='modern-wood')&&/eiken|licht/.test(st.facadeColor);
    if(isEiken) return IM('pvglFLE');
    var key=st.accent;
    var map=BRICK_ACC[key];
    if(!map){
      if(key.indexOf('openslaande')===0) map=BRICK_ACC['openslaande'];
      else if(key.indexOf('dubbele-schuifpui')===0) map=BRICK_ACC['dubbele-schuifpui'];
      else if(key.indexOf('harmonica')===0&&key!=='harmonica-600') map=BRICK_ACC['harmonica'];
    }
    if(map) return IM(map[st.frameColor]||map.zwart);
    return null;
  }
  /* `groep` is er later bijgekomen: zonder die naam kan het eigen beeld niet
     opgezocht worden, want dezelfde waarde kan in twee groepen voorkomen. Wie
     hem niet meegeeft krijgt gewoon het oude gedrag. */
  function optImg(lijst,v,groep){
    if(groep && window.NGDakopbouwOptiebeelden){
      var e=NGDakopbouwOptiebeelden.beeld(groep,v); if(e) return e;
    }
    var im=null; lijst.forEach(function(o){ if(o.v===v){ if(o.src) im=o.src; else if(o.im) im=IM(o.im); } }); return im;
  }
  function visualFor(group){
    switch(group){
      case 'skylight': return optImg(lichtLijst(),st.skylight,'skylight')||facadeImg();
      case 'roofing': return optImg(dakLijst(),st.roofing)||facadeImg();
      case 'kozijnAchter': return kozijnBinnen(st.kozijnAchter||'raam')||optImg(ACHTER,st.kozijnAchter||'raam')||facadeImg();
      case 'balustrade': return optImg(BALUSTRADE,st.balustrade)||facadeImg();
      case 'kozijnindeling': return kozijnBinnen(st.kozijnindeling)||facadeImg();
      case 'accent': case 'frameColor': return facadeImg();
      case 'klimaat': return optImg(KLIMAAT,st.airco,'airco')||facadeImg();
      case 'elektra': { var ks=Object.keys(st.elektra); var last=ks[ks.length-1]; return optImg(ELEKTRA,last,'elektra')||facadeImg(); }
      case 'fundering': { var kf=Object.keys(st.fundering); var lf=kf[kf.length-1]; return optImg(FUND_UIT,lf,'fundering')||facadeImg(); }
      case 'extras': { var ke=Object.keys(st.extras); var le=ke[ke.length-1]; return optImg(EXTRA_UIT,le,'extras')||facadeImg(); }
      /* De kamerindeling is een keuze binnenin de dakopbouw — de buitenkant
         verandert er niet door. Exterieur blijft dus altijd de gekozen
         gevel/kozijncombinatie, voor élke indeling hetzelfde. */
      case 'indeling': return facadeImg();
      case 'voorz': { var kv=Object.keys(st.voorzieningen); var lv=kv[kv.length-1]; return optImg(VOORZ,lv,'voorz')||facadeImg(); }
      case 'isolatie': { var ki=Object.keys(st.isolatie).filter(function(x){return x!=='standaard-plus'}); var li=ki[ki.length-1]; return optImg(ISOLATIE,li)||facadeImg(); }
      default: return facadeImg();
    }
  }

  /* ---------- het bedrijf dat hem draait ----------

     Eén configurator, veel dakopbouwbedrijven. Per bedrijf staat er alléén een
     klein bestand in tenants/ met de verschillen; er komt geen kopie van deze
     pagina per klant. Zonder ?bedrijf= draait alles precies als hiervoor: de
     drie functies hieronder geven dan hun invoer onveranderd terug.

     Zie assets/merk.js en tenants/LEESMIJ.md. */

  /* Het bedrag van één optie. Eerst een eigen bedrag van het bedrijf, anders
     ons richtbedrag maal zijn opslagfactor. Met één opslagfactor heeft een
     bedrijf meteen een prijslijst die klopt met zijn eigen marge; wat daarna
     niet klopt zet hij per optie recht. */
  function mp(groep,optie,basis){
    return window.NGMerk ? window.NGMerk.prijs(groep,optie,basis) : basis;
  }
  /* Wat een bedrijf niet levert, hoort er niet te staan. Een keuze die later
     "die voeren wij niet" oplevert is erger dan een keuze die er nooit was. */
  function zicht(groep,lijst){
    if(!window.NGMerk) return lijst;
    var uit=lijst.filter(function(o){ return window.NGMerk.toont(groep,o.v); });
    /* Alles uit een groep weghalen is bijna altijd een vergissing in het
       bedrijfsbestand. Een lege keuzegroep — of erger: een afwerking die
       nergens meer uit te kiezen valt terwijl de prijs eraan hangt — is
       schadelijker dan een groep die één keer te veel toont. Dan liever de
       hele lijst terug. */
    return uit.length ? uit : lijst;
  }
  /* Een optie kan verborgen zijn terwijl hij aanstaat — bij binnenkomst, of
     doordat een voorinstelling hem zet. Dan valt de keuze terug op de eerste
     die het bedrijf wél levert, en niet op een prijs voor iets wat hij niet
     verkoopt. */
  function eersteZichtbaar(groep,lijst,huidig){
    var l=zicht(groep,lijst);
    if(!l.length) return huidig;
    for(var i=0;i<l.length;i++) if(l[i].v===huidig) return huidig;
    return l[0].v;
  }
  var MEERKEUZE={ voorzieningen:['voorz',VOORZ], isolatie:['isolatie',ISOLATIE],
                  elektra:['elektra',ELEKTRA], fundering:['fundering',FUND_UIT],
                  extras:['extras',EXTRA_UIT] };
  function normaliseerMerk(){
    if(!window.NGMerk||window.NGMerk.merk().demo) return;
    st.material      = eersteZichtbaar('material',MATERIALEN,st.material);
    st.kozijnindeling= eersteZichtbaar('kozijnindeling',INDELINGEN,st.kozijnindeling);
    st.frameColor    = eersteZichtbaar('frameColor',FRAME,st.frameColor);
    st.roofing       = eersteZichtbaar('roofing',DAK,st.roofing);
    st.skylight      = eersteZichtbaar('skylight',LICHT,st.skylight);
    st.airco         = eersteZichtbaar('airco',KLIMAAT,st.airco);
    st.finish        = eersteZichtbaar('finish',AFWERK_UIT,st.finish);
    st.indeling      = eersteZichtbaar('indeling',INDELING,st.indeling);
    st.vorm          = eersteZichtbaar('vorm',VORM,st.vorm);
    Object.keys(MEERKEUZE).forEach(function(sleutel){
      var groep=MEERKEUZE[sleutel][0], gekozen=st[sleutel]||{};
      Object.keys(gekozen).forEach(function(v){
        if(!window.NGMerk.toont(groep,v)) delete gekozen[v];
      });
    });
  }
  /* Waar de aanvraag heen gaat. Zonder bedrijf is dat ons eigen adres — dat is
     ook de stand tijdens een demonstratie. */
  function aanvraagDoel(){
    var a=window.NGMerk&&window.NGMerk.aanvraag();
    return { email:(a&&a.email)||'info@nextgrowthdigital.nl', endpoint:(a&&a.endpoint)||null };
  }

  /* ---------- prijs ---------- */
  function afwerkLijst(){ return zicht('finish',AFWERK_UIT); }
  function extraLijst(){ return zicht('extras',EXTRA_UIT); }
  function elektraLijst(){ return zicht('elektra',ELEKTRA); }
  function fundLijst(){ return zicht('fundering',FUND_UIT); }
  /* Is er een dakterras gekozen? Bepaalt of er buiten iets te bedienen valt. */
  function heeftDakterras(){ var d=st.extras&&st.extras.dakterras; return !!(d&&(d.q===undefined||d.q>0)); }
  function prijs(){
    var m2=oppervlak();
    var fin=null; afwerkLijst().forEach(function(o){ if(o.v===st.finish) fin=o; });
    var base=m2*mp('finish',st.finish,(fin?fin.pm2:2500));
    /* Het oude dak neemt de doorvoeren van de ventilatie, de rookgasafvoer en
       de riolering mee. Die drie komen er hoe dan ook opnieuw in, dus staan ze
       in de basis en niet tussen de opties — een dakopbouw zonder dit werk
       bestaat niet. */
    base+=mp('basis','leidingwerk',LEIDINGWERK);
    var extra=0;
    /* `groep` is nodig om het bedrag bij het bedrijf op te kunnen zoeken:
       dezelfde waarde kan in twee groepen voorkomen. */
    function optP(lijst,v,groep){ var p=0; lijst.forEach(function(o){ if(o.v===v) p=o.p||0; }); return mp(groep,v,p); }
    extra+=optP(MATERIALEN,st.material,'material');
    extra+=optP(INDELINGEN,st.kozijnindeling,'kozijnindeling');
    extra+=optP(DAK,st.roofing,'roofing');
    extra+=optP(LICHT,st.skylight,'skylight');
    extra+=optP(KLIMAAT,st.airco,'airco');
    elektraLijst().forEach(function(o){ if(st.elektra[o.v]) extra+=mp('elektra',o.v,o.p)*(o.qty?st.elektra[o.v]:1); });
    fundLijst().forEach(function(o){ if(st.fundering[o.v]) extra+=mp('fundering',o.v,o.p); });
    if(st.achterom==='nee') extra+=mp('achterom','nee',2500);
    if(heeftIndeling()){
      extra+=optP(INDELING,st.indeling,'indeling');
      zicht('voorz',VOORZ).forEach(function(o){ if(st.voorzieningen[o.v]) extra+=mp('voorz',o.v,o.p); });
      zicht('isolatie',ISOLATIE).forEach(function(o){ if(st.isolatie[o.v]) extra+=mp('isolatie',o.v,o.p); });
    }
    extraLijst().forEach(function(o){
      var v=st.extras[o.v]; if(!v) return;
      var pe=mp('extras',o.v,o.p);
      if(o.unit==='dims'){ extra+=pe*((v.l||3)*(v.b||2)); }
      else if(o.unit==='m2'||o.unit==='st'){ extra+=pe*(v.q||1); }
      else extra+=pe;
    });
    /* Meer- of minderwerk aan de kozijnen. De basisprijs bevat het
       standaardvoorstel — een kozijn per verblijfsruimte — dus telt alleen wat
       de bezoeker er zelf bij zet of weghaalt. De telling en het tarief staan
       in bouwaanzichten.js, bij de kozijnlijst zelf: zo kan de prijs hier niet
       uit de pas lopen met wat er op de tekening staat. Is die module nog niet
       binnen (defer), dan is het bedrag nul en verandert er niets. */
    var kozijnMeer = 0;
    if(window.NGBouwAanzichten && window.NGBouwkundig){
      try { kozijnMeer = NGBouwAanzichten.kozijnstaat(st, NGBouwkundig.model(st)).meerprijs || 0; }
      catch(e){ kozijnMeer = 0; }
    }
    extra += kozijnMeer;
    var transport=mp('transport','plaatsing',1250);
    var sub=base+extra+transport;
    return { m2:m2, base:base, extra:extra, transport:transport, excl:sub, incl:sub*(1+btwTarief()) };
  }

  /* ---------- render ---------- */
  function tile(name,o,checked,multi,inner2){
    var input='<input type="'+(multi?'checkbox':'radio')+'" name="g_'+name+'" value="'+o.v+'"'+(checked?' checked':'')+'>';
    var inner;
    /* Eerst ons eigen beeld, dan pas het geleende.

       De optietegels leenden hun beeld van de uitbouwconfigurator: een
       grondgebonden aanbouw met een tuin eromheen, terwijl dit een verdieping
       op een dak is. Waar er inmiddels een eigen render ligt, wint die; waar
       nog niet, blijft het oude beeld staan. Terugvallen op een leeg vlak zou
       het erger maken dan het is. */
    var eigen = (name!=='frameColor' && window.NGDakopbouwOptiebeelden)
      ? NGDakopbouwOptiebeelden.beeld(name, o.v) : null;
    if(eigen) inner='<span class="tile__img" style="background-image:url('+eigen+')"></span>';
    else if(o.src) inner='<span class="tile__img" style="background-image:url('+o.src+')"></span>';
    else if(o.im) inner='<span class="tile__img" style="background-image:url('+IM(o.im)+')"></span>';
    else if(o.svg) inner='<span class="tile__img tile__img--svg">'+o.svg+'</span>';
    else if(o.sw) inner='<span class="tile__sw" style="background:'+o.sw+'"></span>';
    else inner='';
    var sub=[];
    if(o.d) sub.push(tt(GEEN_PRIJS?o.d.replace(/^Uitgangspunt van de richtprijs:\s*/,''):o.d));
    /* Het bedrag op de tegel is hetzelfde bedrag als in de totaalprijs. Zonder
       deze omweg staat er ons richtbedrag terwijl er dat van het bedrijf wordt
       gerekend, en dat is precies het verschil dat een klant natelt. */
    var pm2=o.pm2?mp(name,o.v,o.pm2):0;
    var pst=o.p?mp(name,o.v,o.p):0;
    if(GEEN_PRIJS){ /* geen bedrag op de tegel */ }
    else if(pm2) sub.push('€ '+Math.round(pm2).toLocaleString(BE?'nl-BE':'nl-NL')+' per m²');
    else if(pst) sub.push('+ € '+Math.round(pst).toLocaleString(BE?'nl-BE':'nl-NL')+(o.unit==='m2'?' per m²':o.unit==='st'?' per stuk':o.unit==='dims'?' per m²':''));
    var subH=sub.length?'<span class="sub">'+sub.join(' · ')+'</span>':'';
    /* Een bedrijf mag een optie de naam van zijn eigen serie geven. De waarde
       eronder blijft dezelfde, dus prijzen, beelden en tekenwerk vallen niet om
       van een andere naam. */
    var lab=window.NGMerk?window.NGMerk.naamVan(name+':'+o.v,o.l):o.l;
    return '<label class="tile">'+input+'<span class="tile__c">'+inner+'<span class="lab">'+tt(lab)+'</span>'+subH+(inner2||'')+'</span></label>';
  }
  /* Kort formulier: een bedrijf dat adverteert wil een bezoeker in een paar
     stappen naar een prijs en het formulier brengen, niet door achttien
     groepen. KORT is zijn lijst met groepen die open staan; de rest krijgt
     grp--uit en een + in plaats van een nummer, en komt pas na "meer opties"
     tevoorschijn. De prijs rekent intussen gewoon met de standaardkeuze. */
  var KORT=null, kortN=0;
  /* Geen prijzen: sommige bedrijven geven hun prijs pas na het
     adviesgesprek. Dan geen bedrag op tegels, balk, dok of in de mail; de
     prijs wordt intussen gewoon berekend, maar nergens getoond. */
  var GEEN_PRIJS=false;
  function grp(nr,titel,inhoud,gid){
    var uit=!!KORT&&KORT.indexOf(gid)===-1;
    if(KORT&&!uit){ kortN++; nr=kortN; }
    return '<div class="grp'+(uit?' grp--uit':'')+'" data-g="'+gid+'"><div class="grp__h"><b>'+(uit?'+':nr+'.')+'</b>'+tt(titel).toUpperCase()+'</div>'+inhoud+'</div>';
  }
  function qtyH(gid,v,q,unit){
    return '<span class="qty" data-qty="'+gid+':'+v+'"><button type="button" data-d="-1" aria-label="minder">−</button><b>'+q+'</b><button type="button" data-d="1" aria-label="meer">+</button><span class="u">'+(unit==='m2'?'m²':'stuks')+'</span></span>';
  }
  /* De hap van een L- of U-vorm. De grenzen komen uit de vormmodule, zodat
     een schuif niet verder kan dan wat er overblijft. */
  function vormSchuiven(){
    if(!window.NGBouwvormen) return '';
    var h=window.NGBouwvormen.hap(st.vorm,st.w,st.dp,st.hoekB,st.hoekD);
    var maxB=h.maxB||Math.max(0.5,st.w-1.5), maxD=h.maxD||Math.max(0.5,st.dp-1.5);
    return '<div class="dimgrp" style="margin-top:.7rem">'
      +'<div class="dim__row"><label for="hoekB">Breedte hap</label><input type="range" id="hoekB" min="0.5" max="'+maxB.toFixed(1)+'" step="0.1" value="'+h.b.toFixed(1)+'"><output>'+h.b.toFixed(1).replace('.',',')+' m</output></div>'
      +'<div class="dim__row"><label for="hoekD">Diepte hap</label><input type="range" id="hoekD" min="0.5" max="'+maxD.toFixed(1)+'" step="0.1" value="'+h.d.toFixed(1)+'"><output>'+h.d.toFixed(1).replace('.',',')+' m</output></div>'
      +'<div class="dim__m2">Eruit gehaald: <b>'+(st.w*st.dp-oppervlak()).toFixed(1).replace('.',',')+' m²</b></div>'
      +'</div>';
  }

  function dimsH(v,l,b){
    return '<span class="dims" data-dims="'+v+'"><input type="number" step="0.5" min="1" max="12" value="'+l+'" data-k="l" aria-label="lengte"><span>×</span><input type="number" step="0.5" min="1" max="8" value="'+b+'" data-k="b" aria-label="breedte"><span>m</span></span>';
  }

  /* Een bedrijf kan grotere maten toestaan dan onze standaard
     (maten.breedte / diepte / hoogte in het bedrijfsbestand). */
  /* Standaard kozijnmaten van het bedrijf (merk.kozijnMaten), als tekst. */
  function kozijnMaat(kant,model){
    var m=window.NGMerk&&NGMerk.merk&&NGMerk.merk(), km=m&&!m.demo&&m.kozijnMaten&&m.kozijnMaten[kant];
    var l=km&&km[model]; if(!l||!l.length) return '';
    var g=[]; l.forEach(function(d){ var t=d.l+' '+d.b+' × '+d.h+' cm', x=g.filter(function(q){return q.t===t;})[0]; if(x) x.n++; else g.push({t:t,n:1}); });
    return g.map(function(q){return (q.n>1?q.n+'× ':'')+q.t;}).join(' + ');
  }
  window.NGKozijnMaat=kozijnMaat;
  function maat(k,standaard){
    var m=window.NGMerk&&NGMerk.merk&&NGMerk.merk(), v=m&&m.maten&&m.maten[k];
    return typeof v==='number'&&v>0?v:standaard;
  }
  /* Schuif plus een vak om de maat precies in te typen. */
  function dimRij(id,lbl,min,max,v){
    return '<div class="dim__row"><label for="'+id+'">'+lbl+'</label><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="0.1" value="'+v+'"><output hidden>'+v.toFixed(1).replace('.',',')+' m</output>'
      +'<span class="dim__num"><input type="text" inputmode="decimal" autocomplete="off" data-voor="'+id+'" min="'+min+'" max="'+max+'" step="0.1" value="'+v.toFixed(1).replace('.',',')+'" aria-label="'+lbl+' in meters"><i>m</i></span></div>';
  }
  function render(){
    normaliseerBadkamer();
    var T=TYPES[st.type];
    $('#confTitle').textContent=T.titel+' samenstellen';
    $('#confSub').textContent=T.sub+' · prefab geplaatst';
    $('#confBadge').innerHTML='<span>⌂</span><span>Incl. transport & plaatsing</span>';
    var n=0, html=''; kortN=0;
    n++; html+=grp(n,'Afmetingen',
      '<div class="dimgrp">'
      +dimRij('dimW','Breedte',2,maat('breedte',T.maxW),st.w)
      +dimRij('dimD','Diepte',1,maat('diepte',6),st.dp)
      +dimRij('dimH','Hoogte',2.4,maat('hoogte',3.5),st.h)
      +'<div class="dim__m2">Oppervlakte: <b>'+oppervlak().toFixed(1).replace('.',',')+' m²</b>'+(st.vorm!=='rechthoek'?' <span style="color:var(--text-3)">(omhullend '+(st.w*st.dp).toFixed(1).replace('.',',')+' m²)</span>':'')+'</div>'
      +'</div>','afmetingen');
    n++; html+=grp(n,'Vorm van de plattegrond',
      '<div class="tiles">'+zicht('vorm',VORM).map(function(o){return tile('vorm',o,st.vorm===o.v,false)}).join('')+'</div>'
      +(st.vorm==='rechthoek'?'':vormSchuiven()),'vorm');
    if(heeftIndeling()){
      /* De exterieurfoto's die hier ooit per indeling stonden waren willekeurige
         stockfoto's die niets met de gekozen indeling te maken hadden — een
         dakopbouw ziet er vanbuiten hetzelfde uit, ongeacht de kamerindeling.
         De tegel toont daarom het eerste échte interieurbeeld van die indeling
         (waar dat al is aangeleverd); is dat er nog niet, dan geen plaatje in
         plaats van een misleidend exterieurbeeld. */
      n++; html+=grp(n,'Indeling',
        '<div class="tiles">'+zicht('indeling',INDELING).map(function(o){
          var oo=Object.assign({},o); delete oo.src;
          var imgs=INDELING_INTERIEUR[o.v];
          if(imgs&&imgs.length) oo.src=imgs[0];
          return tile('indeling',oo,st.indeling===o.v,false);
        }).join('')+'</div>'
        +(st.indeling&&st.indeling!=='open'?'<div class="grp__h" style="margin-top:1.1rem"><b>&nbsp;</b>BADKAMER OP DE VERDIEPING</div>'
          +'<div class="tiles">'+[{v:'ja',l:'Met badkamer',d:'Badkamer naast de slaapkamers.',src:BADKAMER_INTERIEUR},{v:'nee',l:'Zonder badkamer',d:'Alleen slaapkamers en overloop.',src:(INDELING_INTERIEUR[st.indeling]||[])[0]}]
            .map(function(o){return tile('metBad',o,(st.metBad||'ja')===o.v,false);}).join('')+'</div>':''),'indeling');
    }
    if(KORT&&KORT.indexOf('doorgang')>=0){
      n++; html+=grp(n,'Doorgang naar de dakopbouw',
        '<p class="grp__noot">Voor de trap naar boven maken we een trapgatsparing. Wat voor vloer heeft de bestaande verdieping? Bij beton is een doorbraak en een zwaardere constructie nodig. Niet zeker? Klop op de vloer: een doffe, harde klank wijst op beton, een holle klank op hout. Of kijk in de meterkast naar de bouwtekening.</p>'
        +'<div class="tiles">'+DOORGANG.map(function(o){return tile('doorgang',o,(st.doorgang||'hout')===o.v,false)}).join('')+'</div>','doorgang');
    }
    if(KORT&&KORT.indexOf('vergunning')>=0){
      n++; html+=grp(n,'Vergunning en haalbaarheid',
        '<p class="grp__noot"><b>Verplicht bij een dakopbouw.</b> Voor een dakopbouw is altijd een omgevingsvergunning en een constructieberekening nodig. Wij regelen het volledige traject: bouwtekeningen, constructieberekening, indiening bij de gemeente en begeleiding tot de vergunning rond is.</p>'
        +'<div class="tiles">'+VERGUNNING.map(function(o){return tile('vergunning',o,!!(st.vergunning||{})[o.v],true)}).join('')+'</div>','vergunning');
    }
    if(KORT&&KORT.indexOf('sloop')>=0){
      n++; html+=grp(n,'Wat ligt er nu op je platte dak?',
        '<p class="grp__noot">Wij verwijderen het bestaande dak en voeren het puin af. Kijk even naar buiten of op een foto: bij grind zie je losse steentjes (mét dakbedekking eronder); bij alleen dakbedekking zie je een glad zwart of grijs vlak (bitumen of EPDM).</p>'
        +'<div class="tiles">'+SLOOP.map(function(o){return tile('sloop',o,(st.sloop||'geen')===o.v,false)}).join('')+'</div>'
        +'<p class="grp__noot">Liggen er zonnepanelen op je dak? Die moeten tijdelijk verplaatst worden door een installateur. Dat kunnen we regelen, maar het zit niet in de prijs en hangt af van de situatie.</p>','sloop');
    }
    n++; html+=grp(n,'Gevelmateriaal',
      '<div class="tiles">'+matLijst().map(function(o){
        var ks=facadeSet()[o.v]||[]; var oo=Object.assign({},o); if(ks.length) oo.sw=ks[0].sw;
        return tile('material',oo,st.material===o.v,false);
      }).join('')+'</div>','material');
    var kleuren=facadeSet()[st.material]||[];
    if(kleuren.length){
      n++; html+=grp(n,'Gevelkleur',
        staalHtml()+'<div class="tiles sm">'+zicht('facadeColor',kleuren).map(function(o){return tile('facadeColor',o,st.facadeColor===o.v,false)}).join('')+'</div>','facadeColor');
    }
    n++; html+=grp(n,'Kozijnmodel voorgevel',
      '<div class="tiles">'+zicht('kozijnindeling',INDELINGEN).map(function(o){
        /* De thumbnail is het beeld van dít model in de huidige gevelkleur en
           kozijnkleur: dan zie je het verschil vóór je klikt. Is die exacte
           combinatie nog niet gerenderd, dan valt de tegel terug op een
           schematisch icoon — nooit op een andere combinatie. */
        var oo=Object.assign({},o);
        if(window.NGDakopbouwBeelden){
          var r=NGDakopbouwBeelden.kies({materiaal:st.material,gevelkleur:st.facadeColor,
                                         model:o.v,kozijnkleur:st.frameColor});
          if(r.src) oo.src=r.src; else oo.svg=MODEL_SVG[o.v];
        } else oo.svg=MODEL_SVG[o.v];
        var kbv=kozijnBinnen(o.v); if(kbv){ oo.src=kbv; delete oo.svg; }
        var km=kozijnMaat('voor',o.v); if(km) oo.d=(o.d?o.d+' ':'')+'Standaardmaat: '+km+'.';
        return tile('kozijnindeling',oo,st.kozijnindeling===o.v,false);
      }).join('')+'</div>','kozijnindeling');
    n++; html+=grp(n,'Kozijnmodel achtergevel',
      '<div class="tiles">'+zicht('kozijnAchter',ACHTER).map(function(o){
        var oo=Object.assign({},o); if(o.src) delete oo.svg; else oo.svg=o.svg||MODEL_SVG[o.v];
        var kb=kozijnBinnen(o.v); if(kb){ oo.src=kb; delete oo.svg; }
        /* Schuifpui en openslaande deuren zijn hetzelfde kozijn als voor:
           toon dan de render in de gekozen kleuren, net als bij de voorgevel. */
        if(!o.src&&!o.svg&&window.NGDakopbouwBeelden){
          var r=NGDakopbouwBeelden.kies({materiaal:st.material,gevelkleur:st.facadeColor,
                                         model:o.v,kozijnkleur:st.frameColor});
          if(r.src){ oo.src=r.src; delete oo.svg; }
        }
        var kma=kozijnMaat('achter',o.v); if(kma) oo.d=(o.d?o.d+' ':'')+'Standaardmaat: '+kma+'.';
        return tile('kozijnAchter',oo,st.kozijnAchter===o.v,false);
      }).join('')+'</div>','kozijnAchter');
    /* Een schuifpui of openslaande deuren op de verdieping is een deur naar
       buiten: daar hoort altijd een balustrade voor. Dan valt "geen" weg. */
    var deur=['model01','model02'], moetBal=deur.indexOf(st.kozijnindeling)>=0||deur.indexOf(st.kozijnAchter)>=0;
    var balLijst=zicht('balustrade',BALUSTRADE).filter(function(o){ return !(moetBal&&o.v==='geen'); });
    if(!balLijst.some(function(o){return o.v===st.balustrade;})) st.balustrade=balLijst[0].v;
    n++; html+=grp(n,'Balustrade',
      '<p class="grp__noot"><b>Verplicht bij een schuifpui of openslaande deuren.</b>'+(moetBal?' Je koos er een, dus "geen balustrade" valt hier weg.':' Bij een raam of dichte gevel mag je ook zonder.')+'</p>'
      +'<div class="tiles">'+balLijst.map(function(o){
        var ob=Object.assign({},o); if(o.src) delete ob.svg; return tile('balustrade',ob,st.balustrade===o.v,false);
      }).join('')+'</div>','balustrade');
    n++; html+=grp(n,'Kozijnkleur',
      '<div class="tiles sm">'+zicht('frameColor',FRAME).map(function(o){
        var oo=Object.assign({},o); delete oo.im;
        if(window.NGDakopbouwBeelden){
          var r=NGDakopbouwBeelden.kies({materiaal:st.material,gevelkleur:st.facadeColor,model:st.kozijnindeling,kozijnkleur:o.v});
          if(r.src) oo.src=r.src;
        }
        return tile('frameColor',oo,st.frameColor===o.v,false);
      }).join('')+'</div>'
      /* Screens en rolluiken horen bij de ramen: hier, niet bij de extra's. */
      +(function(){
        var zw=extraLijst().filter(function(o){return ZONWERING.indexOf(o.v)>=0;});
        if(!zw.length) return '';
        return '<div class="grp__h" style="margin-top:1.1rem"><b>&nbsp;</b>ZONWERING</div><div class="tiles">'+zw.map(function(o){
          var v=st.extras[o.v], sel=!!v, extra=sel?qtyH('extras',o.v,v.q||1,o.unit):'';
          return tile('extras',o,sel,true,extra);
        }).join('')+'</div>';
      })(),'frameColor');
    n++; html+=grp(n,'Dakbedekking',
      '<div class="tiles">'+dakLijst().map(function(o){return tile('roofing',o,st.roofing===o.v,false)}).join('')+'</div>','roofing');
    /* De lichtstraat hoort bij het platte dak en stond hier niet.

       Hij bestond wel - lijst, prijzen, beeldkeuze en de prijsregel - maar de
       tegels werden alleen in de poolhousetak getekend, en die draait op deze
       pagina nooit. Een dakopbouw heeft per definitie een plat dak, en dat is
       nu juist waar zo'n lichtstraat thuishoort: hij haalt daglicht naar
       binnen op de plek waar geen gevel zit. */
    n++; html+=grp(n,'Lichtstraat',
      '<div class="tiles">'+lichtLijst().map(function(o){return tile('skylight',o,st.skylight===o.v,false)}).join('')+'</div>'
      +'<p class="grp__noot">Een lichtstraat zit in het platte dak van de opbouw. Voor een enkel dakraam is er een losse optie onderaan.</p>',
      'skylight');
    if(st.type==='op-woning'||st.type==='optopping'){
      n++; html+=grp(n,'Bestaand dak',
        '<div class="tiles">'+zicht('bestaandDak',BESTAAND_DAK).map(function(o){return tile('bestaandDak',o,st.bestaandDak===o.v,false)}).join('')+'</div>'
        +(st.bestaandDak==='hellend'?'<p class="grp__noot">'+(GEEN_PRIJS?'Sloop en afvoer van de kap beoordelen en prijzen wij in de offerte.':'Sloop en afvoer van de kap zitten niet in de richtprijs; dat beoordelen en prijzen wij in de offerte.')+'</p>':''),
        'bestaandDak');
    }
    if(heeftIndeling()){
      n++; html+=grp(n,'Voorzieningen',
        '<div class="tiles">'+zicht('voorz',VOORZ).map(function(o){return tile('voorz',o,!!st.voorzieningen[o.v],true)}).join('')+'</div>','voorz');
      n++; html+=grp(n,'Isolatie & energie',
        '<div class="tiles">'+zicht('isolatie',ISOLATIE).map(function(o){return tile('isolatie',o,!!st.isolatie[o.v],true)}).join('')+'</div>','isolatie');
    }
    /* Een bedrijf zonder losse klimaatstap (stappen zonder "klimaat") krijgt
       de airco bij elektra: daar zet de klant hem ook in de plattegrond. */
    var mk=window.NGMerk&&NGMerk.merk&&NGMerk.merk(), aircoBijElektra=!!(mk&&mk.stappen&&mk.stappen.indexOf('klimaat')<0&&mk.stappen.indexOf('elektra')>=0);
    var aircoTegels='<div class="tiles">'+zicht('airco',KLIMAAT).map(function(o){return tile('airco',o,st.airco===o.v,false)}).join('')+'</div>';
    if(!aircoBijElektra){ n++; html+=grp(n,'Klimaatbeheersing',aircoTegels,'klimaat'); }
    /* Buitenstopcontacten en buitenlampen alleen als er een dakterras is.

       Op een dakopbouw zonder terras zit er geen buiten waar je kunt staan:
       een stopcontact op de gevel is dan een stopcontact vier meter boven de
       straat. Ze verdwijnen dus uit de lijst tot er een terras gekozen is - en
       wie ze had aangevinkt en het terras weer weghaalt, raakt ze ook uit zijn
       prijs kwijt, anders betaalt hij voor iets wat hij niet meer kan zien. */
    var buitenElektra = ['stopcontact-buiten', 'lamp-punten-buiten'];
    if(!heeftDakterras()){ buitenElektra.forEach(function(v){ delete st.elektra[v]; }); }
    n++; html+=grp(n,'Elektra & installatie',
      '<div class="tiles">'+elektraLijst().filter(function(o){
        return heeftDakterras() || buitenElektra.indexOf(o.v) < 0;
      }).map(function(o){
        var sel=!!st.elektra[o.v];
        var extra=(sel&&o.qty)?qtyH('elektra',o.v,st.elektra[o.v],'st'):'';
        return tile('elektra',o,sel,true,extra);
      }).join('')
      /* Overstek met spotjes is verlichting: bij de overige installatie. */
      +extraLijst().filter(function(o){return o.v==='overstek-spotjes';}).map(function(o){return tile('extras',o,!!st.extras[o.v],true);}).join('')
      +'</div>'
      +(heeftDakterras()?'':'<p class="grp__noot">Stopcontact en lamppunten buiten verschijnen zodra je een dakterras kiest.</p>')
      +(aircoBijElektra?'<div class="grp__h" style="margin-top:.9rem"><b>&nbsp;</b>AIRCO</div>'+aircoTegels:''),
      'elektra');
    n++; html+=grp(n,fundLijst().some(function(o){return o.v.indexOf('trap')<0;})?'Trap & verzwaring':'Trap',
      '<div class="tiles">'+fundLijst().map(function(o){return tile('fundering',o,!!st.fundering[o.v],true)}).join('')+'</div>'
      +((window.NGMerk&&NGMerk.merk&&NGMerk.merk().achterom===false)?'':'<div class="grp__h" style="margin-top:.9rem"><b>&nbsp;</b>BEREIKBAARHEID ACHTEROM</div>'
      +'<div class="tiles sm">'
      +tile('achterom',{v:'ja',l:'Wel een achterom',d:'Goed bereikbaar'},st.achterom==='ja',false)
      +tile('achterom',{v:'nee',l:'Geen achterom',p:2500,d:'Beperkte bereikbaarheid'},st.achterom==='nee',false)
      +'</div>'),'fundering');
    if(BE){
      n++; html+=grp(n,'Btw-tarief',
        '<div class="grp__h" style="margin-top:.2rem"><b>&nbsp;</b>IS DE WONING MINSTENS 10 JAAR IN GEBRUIK?</div>'
        +'<div class="tiles sm">'
        +tile('woningOud',{v:'ja',l:'Ja, 10 jaar of ouder',d:'Renovatietarief van 6% mogelijk'},st.woningOud==='ja',false)
        +tile('woningOud',{v:'nee',l:'Nee, jonger dan 10 jaar',d:'Dan geldt 21%'},st.woningOud==='nee',false)
        +'</div>'
        // buiten .tile: daar maakt de opmaak elke input onzichtbaar, want de
        // tegels gebruiken een verborgen radio onder een eigen vormgeving
        +'<div class="grp__h" style="margin-top:.9rem"><b>&nbsp;</b>BEWOONBARE OPPERVLAKTE VAN DE WONING NU</div>'
        +'<div class="btwm2">'
        +'<div class="btwm2__top"><span id="bestaandM2Lab">'+st.bestaandM2+' m²</span>'
        +'<span class="btwm2__sub">de woning moet groter blijven dan de uitbreiding</span></div>'
        +'<input type="range" id="bestaandM2" min="40" max="400" step="5" value="'+st.bestaandM2+'" '
        +'aria-label="Bewoonbare oppervlakte van de woning nu">'
        +'</div>'
        +'<p class="mono" id="btwNoot" style="margin-top:.7rem;font-size:.66rem;color:var(--text-3);line-height:1.5"></p>','btwbe');
    }
    n++; html+=grp(n,'Afwerking',
      '<div class="tiles">'+afwerkLijst().map(function(o){return tile('finish',o,st.finish===o.v,false)}).join('')+'</div>'
      +(st.finish==='luxe'?'<div class="grp__h" style="margin-top:1.1rem"><b>&nbsp;</b>VLOER</div>'
        +'<div class="tiles">'+zicht('vloerAfw',VLOER_AFW).map(function(o){return tile('vloerAfw',o,st.vloerAfw===o.v,false)}).join('')+'</div>':''),'finish');
    n++; html+=grp(n,'Extra opties',
      '<div class="tiles">'+extraLijst().filter(function(o){return ELDERS.indexOf(o.v)<0;}).map(function(o){
        var v=st.extras[o.v]; var sel=!!v; var extra='';
        if(sel&&(o.unit==='m2'||o.unit==='st')) extra=qtyH('extras',o.v,v.q||1,o.unit);
        if(sel&&o.unit==='dims') extra=dimsH(o.v,(v.l||3),(v.b||2));
        return tile('extras',o,sel,true,extra);
      }).join('')+'</div>','extras');
    $('#groups').innerHTML=html;
    bind();
    updatePrijs(); updateDim(); updateHero(st.lastGroup?null:'material');
  }

  function updateBtwNoot(){
    var el=document.getElementById('btwNoot'); if(!el) return;
    el.textContent=(btwTarief()===0.06
      ? 'Deze samenstelling voldoet aan de ontwerpvoorwaarden voor 6% btw. '
      : 'Voor deze samenstelling rekenen we 21% btw. ')
      +'Het verlaagde tarief geldt daarnaast alleen bij privégebruik, uitvoering door een '
      +'geregistreerde aannemer en een factuur op naam van de eindgebruiker. Je aannemer '
      +'bevestigt dat op de factuur.';
  }
  function esc(t){ return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function updatePrijs(){
    var ko=document.getElementById('keuzeOverzicht');
    if(ko){
      ko.innerHTML='<b class="kz__kop">Jouw keuzes</b><dl>'+summaryText(true).split('\n').filter(function(l){return l&&l.indexOf(': ')>0&&l.indexOf('Vergunning')!==0&&l.indexOf('Richtprijs')!==0;}).map(function(l){
        var i=l.indexOf(': '); return '<dt>'+esc(l.slice(0,i))+'</dt><dd>'+esc(l.slice(i+2))+'</dd>';
      }).join('')+'</dl>';
    }
    var p=prijs();
    $('#prijs').textContent=euro(btwIncl?p.incl:p.excl);
    // het btw-knopje benoemt in Belgische modus het tarief dat echt geldt
    var bi=document.getElementById('btwIncl');
    if(bi&&BE) bi.textContent='incl. '+Math.round(btwTarief()*100)+'% btw';
    updateBtwNoot();
    // Het tekenprogramma leest dezelfde staat; updatePrijs() draait na elke
    // keuze en na elke maatschuif, dus is dit de enige plek waar het hoeft.
    /* De hele samenstelling wegschrijven, ook de zelfgemaakte indeling. Dit
       draait bij elke muisbeweging op een maatschuif; het schrijven zelf wordt
       aan de andere kant afgeremd. */
    if(window.NGBewaren) NGBewaren.bewaar(st);
    if(window.NGTekenprogramma) window.NGTekenprogramma.ververs();
  }
  function updateDim(){
    $('#confDim').innerHTML='<b>'+st.w.toFixed(1).replace('.',',')+' × '+st.dp.toFixed(1).replace('.',',')+' m · '+oppervlak().toFixed(1).replace('.',',')+' m²</b>';
    updateVisualCaption();
  }
  var heroTimer=null;
  var heroVersion=0;
  function setHeroSrc(src){
    var wrap=$('#confHeroWrap'), img=$('#confHero');
    clearTimeout(heroTimer);
    var version=++heroVersion;
    if(!img) return;
    img.onload=null; img.onerror=null;
    if(!src){
      if(wrap) wrap.classList.add('is-missing');
      img.style.opacity='0';
      img.removeAttribute('src');
      var emptyBg=$('#confHeroBg'); if(emptyBg) emptyBg.style.backgroundImage='none';
      return;
    }
    if(wrap) wrap.classList.remove('is-missing');
    if(img.getAttribute('src')===src && img.complete && img.naturalWidth){ img.style.opacity='1'; return; }
    img.style.opacity='0';
    heroTimer=setTimeout(function(){
      img.onload=function(){ if(version===heroVersion) img.style.opacity='1'; };
      img.onerror=function(){ if(version===heroVersion && wrap) wrap.classList.add('is-missing'); };
      img.src=src;
      var bg=$('#confHeroBg'); if(bg) bg.style.backgroundImage='url('+src+')';
    },120);
  }
  function setMissingTekst(titel,tekst){
    var el=$('#confMissing'); if(!el) return;
    el.innerHTML='<b>'+titel+'</b><span>'+tekst+'</span>';
  }
  function renderThumbs(){
    var wrap=$('#confThumbs'); if(!wrap) return;
    var items=interieurItems();
    if(st.aanzicht!=='int'||items.length<2){ wrap.classList.remove('is-on'); wrap.innerHTML=''; return; }
    wrap.classList.add('is-on');
    wrap.innerHTML=items.map(function(item,i){
      return '<button type="button" data-i="'+i+'" class="'+(i===st.thumbIdx?'is-on':'')+'" aria-pressed="'+(i===st.thumbIdx)+'" aria-label="'+item.label+'">'
        +'<img src="'+item.src+'" alt="" loading="lazy"><span>'+item.label+'</span></button>';
    }).join('');
  }
  /* Een gevelrender volgt alleen materiaal, gevelkleur, kozijnmodel en
     kozijnkleur. Optiefoto's zijn detailvoorbeelden en vervangen hem nooit. */
  function updateVisualCaption(){
    var el=$('#confVisualCaption'), img=$('#confHero');
    if(!el || !st) return;
    var interior=st.aanzicht==='int' ? interieurItems()[st.thumbIdx] : null;
    var title=st.aanzicht==='int'?(interior?interior.label:'Interieurvoorbeeld'):
      lbl(MATERIALEN,st.material)+' · '+lbl(facadeSet()[st.material]||[],st.facadeColor)
      +' · '+lbl(INDELINGEN,st.kozijnindeling)+' · kozijnen '+lbl(FRAME,st.frameColor);
    var note=st.aanzicht==='int'
      ? (interior&&interior.kind==='indeling'
          ? 'Indelingsvoorbeeld. Gekozen afwerking: '+lbl(AFWERK_UIT,st.finish)+'. De inrichting in dit beeld is ter illustratie.'
          : 'Voorbeeld van deze keuze. Overige inrichting en installaties in het beeld zijn niet automatisch inbegrepen.')+' Maten, aantallen en uitvoering volgen je offerte en tekeningen.'
      : 'Gevel- en kozijnvoorbeeld. De voorbeeldwoning, afmetingen, plattegrondvorm en extra opties zijn niet op maat afgebeeld.'+(KORT?' Je offerte komt met tekeningen op maat.':' Bekijk de tekeningen voor je ontwerp.');
    el.textContent=title+'. '+note;
    if(img) img.alt=title;
    var badge=$('#confHeroWrap .live');
    if(badge){ var bfo=st.aanzicht!=='int'&&basisFoto(); badge.textContent=st.aanzicht==='int'?'Interieurvoorbeeld':(bfo?(bfo.label||'Gerealiseerd project'):(st.lastGroup==='kozijnAchter'&&kozijnBinnen(st.kozijnAchter||'raam')?'Achtergevel van binnen':(st.lastGroup==='kozijnindeling'&&kozijnBinnen(st.kozijnindeling)?'Voorgevel van binnen':'Gevelvoorbeeld'))); }
    var dims=$('#confDim'); if(dims) dims.hidden=st.aanzicht==='int';
    $('#confAanzicht').querySelectorAll('button[data-aanzicht]').forEach(function(button){
      var on=button.getAttribute('data-aanzicht')===st.aanzicht;
      button.classList.toggle('is-on',on); button.setAttribute('aria-selected',on?'true':'false');
    });
  }
  function optionDetail(group){
    var lists={roofing:DAK,skylight:LICHT,klimaat:KLIMAAT,elektra:ELEKTRA,
      extras:EXTRA_UIT,voorz:VOORZ,isolatie:ISOLATIE,finish:AFWERK_UIT,fundering:FUND_UIT,kozijnAchter:ACHTER,balustrade:BALUSTRADE,kozijnindeling:INDELINGEN};
    var values={roofing:st.roofing,skylight:st.skylight,klimaat:st.airco,finish:st.finish,kozijnAchter:st.kozijnAchter||'raam',balustrade:st.balustrade,kozijnindeling:st.kozijnindeling};
    var sets={elektra:st.elektra,extras:st.extras,voorz:st.voorzieningen,isolatie:st.isolatie,fundering:st.fundering};
    if(sets[group]){ var keys=Object.keys(sets[group]); values[group]=keys[keys.length-1]; }
    var value=values[group], list=lists[group];
    if(!list || !value || (value==='none' && group!=='klimaat' && group!=='skylight') || value==='standaard-plus') return null;
    var src=((group==='kozijnAchter'||group==='kozijnindeling')&&kozijnBinnen(value))||optImg(list,value,group==='klimaat'?'airco':group);
    return src?{src:src,label:lbl(list,value)}:null;
  }
  function renderOptionDetail(group){
    var wrap=$('#confOptionDetail'), img=$('#confOptionImage');
    if(!wrap || !img) return;
    var detail=optionDetail(group);
    if(!detail){ wrap.hidden=true; img.removeAttribute('src'); return; }
    $('#confOptionLabel').textContent=detail.label;
    img.alt='Detailvoorbeeld: '+detail.label;
    img.onerror=function(){ wrap.hidden=true; };
    img.src=detail.src; wrap.hidden=false;
  }
  function updateHero(group){
    if(group) st.lastGroup=optionDetail(group)?group:null;
    heroStaal();
    if(st.aanzicht==='int'){
      var items=interieurItems(), detail=group?optionDetail(group):null;
      var focus=group==='indeling' ? items.find(function(x){return x.kind==='indeling';}) :
        (detail ? items.find(function(x){return x.src===detail.src;}) : null);
      var index=items.findIndex(function(x){return x.src===(focus?focus.src:st.interiorSrc);});
      st.thumbIdx=index>=0?index:0;
      var item=items[st.thumbIdx]; st.interiorSrc=item?item.src:null;
      updateVisualCaption();
      /* Hetzelfde detail niet tegelijk nogmaals onder het grote beeld tonen. */
      var activeDetail=optionDetail(st.lastGroup);
      renderOptionDetail(activeDetail&&!items.some(function(x){return x.src===activeDetail.src;})?st.lastGroup:null);
      if(!item) setMissingTekst('Interieurbeeld niet beschikbaar','Bekijk het exterieur of je indeling in de tekeningen.');
      setHeroSrc(item?item.src:null); renderThumbs(); return;
    }
    /* Dak en lichtstraat zie je pas echt in hun eigen foto: die komt dan
       groot in beeld in plaats van de gevel. */
    var dakBeeld=(['roofing','skylight','fundering','kozijnAchter','balustrade'].indexOf(st.lastGroup)>=0||(st.lastGroup==='kozijnindeling'&&kozijnBinnen(st.kozijnindeling)))?visualFor(st.lastGroup):null;
    updateVisualCaption(); renderOptionDetail(dakBeeld?null:st.lastGroup);
    setMissingTekst('Gevelbeeld niet beschikbaar','Voor deze combinatie is het beeld niet beschikbaar. Je keuzes blijven behouden.');
    /* Bij de basisstappen een echte projectfoto van het bedrijf in plaats van
       een render (merk.basisFoto = {src, label, stappen}). */
    var bf=basisFoto(), opBasis=!!bf;
    renderThumbs(); setHeroSrc(opBasis?bf.src:(dakBeeld||facadeImg())); heroStaal();
  }

  /* De stappenkaart meldt welke stap open staat: bij de dakstap toont het
     grote beeld meteen het gekozen dak. */
  /* Echte projectfoto bij de basisstappen (merk.basisFoto), of null. */
  function basisFoto(){
    var m=window.NGMerk&&NGMerk.merk&&NGMerk.merk(), bf=m&&!m.demo&&m.basisFoto;
    if(!bf||!document.documentElement.hasAttribute('data-stapsgewijs')) return null;
    return (bf.stappen||['afmetingen']).indexOf(st.stapNu||'afmetingen')>=0?bf:null;
  }
  window.NGStapBeeld=function(id){
    var vorig=st.stapNu; st.stapNu=id; heroStaal();
    var mkb2=window.NGMerk&&NGMerk.merk&&NGMerk.merk(), bst=mkb2&&mkb2.basisFoto&&(mkb2.basisFoto.stappen||['afmetingen']);
    if(bst&&(bst.indexOf(id)>=0)!==(bst.indexOf(vorig||'afmetingen')>=0)&&st.aanzicht!=='int') updateHero(null);
    var eigen=['roofing','skylight','fundering','kozijnAchter','balustrade','kozijnindeling'], g=eigen.indexOf(id)>=0?id:null;
    if(g!==st.lastGroup&&(g||eigen.indexOf(st.lastGroup)>=0)){ st.lastGroup=g; if(st.aanzicht!=='int') updateHero(g); }
  };
  function bind(){
    var sb=document.querySelector('#groups [data-staal]');
    if(sb) sb.addEventListener('click',function(){ var u=staalUrl(); if(u){ setHeroSrc(u); var h=document.querySelector('.conf__visual'); if(h&&h.scrollIntoView&&window.innerWidth<900) h.scrollIntoView({behavior:'smooth',block:'start'}); } });
    // de schuif ververst alleen wat er verandert: opnieuw tekenen zou hem
    // midden in een sleepbeweging uit de DOM halen
    var bm=document.getElementById('bestaandM2');
    if(bm) bm.addEventListener('input',function(){
      st.bestaandM2=parseInt(bm.value,10);
      var lab=document.getElementById('bestaandM2Lab');
      if(lab) lab.textContent=st.bestaandM2+' m²';
      updatePrijs(); updateBtwNoot();
    });
    ['hoekB','hoekD'].forEach(function(id){
      var el=document.getElementById(id); if(!el) return;
      el.addEventListener('input',function(){
        var v=parseFloat(el.value);
        st[id]=v;
        el.parentElement.querySelector('output').textContent=v.toFixed(1).replace('.',',')+' m';
        var num=el.parentElement.querySelector('[data-voor]'); if(num&&document.activeElement!==num) num.value=v.toFixed(1).replace('.',',');
        var af=el.closest('.dimgrp').querySelector('.dim__m2 b');
        if(af) af.textContent=(st.w*st.dp-oppervlak()).toFixed(1).replace('.',',')+' m²';
        updatePrijs(); updateDim();
      });
    });
    document.querySelectorAll('#groups [data-voor]').forEach(function(num){
      num.addEventListener('change',function(){
        var sl=document.getElementById(num.getAttribute('data-voor')); if(!sl) return;
        var v=parseFloat(String(num.value).replace(',','.')); if(isNaN(v)) v=parseFloat(sl.value);
        v=Math.round(Math.min(parseFloat(sl.max),Math.max(parseFloat(sl.min),v))*10)/10;
        num.value=v.toFixed(1).replace('.',','); sl.value=v; sl.dispatchEvent(new Event('input'));
      });
    });
    ['dimW','dimD','dimH'].forEach(function(id){
      var el=document.getElementById(id); if(!el) return;
      el.addEventListener('input',function(){
        var v=parseFloat(el.value);
        if(id==='dimW') st.w=v; if(id==='dimD') st.dp=v; if(id==='dimH') st.h=v;
        el.parentElement.querySelector('output').textContent=v.toFixed(1).replace('.',',')+' m';
        var num=el.parentElement.querySelector('[data-voor]'); if(num&&document.activeElement!==num) num.value=v.toFixed(1).replace('.',',');
        var m2el=el.closest('.dimgrp').querySelector('.dim__m2 b');
        if(m2el) m2el.textContent=oppervlak().toFixed(1).replace('.',',')+' m²';
        updatePrijs(); updateDim();
      });
    });
    $('#groups').querySelectorAll('input[type=radio],input[type=checkbox]').forEach(function(inp){
      inp.addEventListener('change',function(){
        var g=inp.name.slice(2), v=inp.value;
        if(g==='vorm'){ st.vorm=v; st.hoekB=null; st.hoekD=null; render(); updateHero('material'); return; }
        if(g==='material'){ st.material=v; var ks=facadeSet()[v]||[]; if(ks.length&&!ks.some(function(c){return c.v===st.facadeColor})) st.facadeColor=ks[0].v; render(); updateHero('material'); updatePrijs(); return; }
        if(g==='facadeColor'){ st.facadeColor=v; render(); updateHero('material'); updatePrijs(); return; }
        if(g==='balustrade'){ st.balustrade=v; render(); updateHero('balustrade'); return; }
        if(g==='kozijnAchter'){ st.kozijnAchter=v; render(); updateHero('kozijnAchter'); return; }
        if(g==='kozijnindeling'){ st.kozijnindeling=v; render(); updateHero('kozijnindeling'); updatePrijs(); return; }
        if(g==='metBad'){ st.metBad=v; render(); return; }
        if(g==='sloop'){ st.sloop=v; updatePrijs(); return; }
        if(g==='doorgang'){ st.doorgang=v; updatePrijs(); return; }
        if(g==='vergunning'){ st.vergunning=st.vergunning||{}; if(inp.checked) st.vergunning[v]=1; else delete st.vergunning[v]; updatePrijs(); return; }
        if(g==='indeling'){ st.indeling=v; st.thumbIdx=0; render(); delete st.kamerplanOverride; updateHero('indeling'); updatePrijs(); return; }
        if(g==='roofing'){ st.roofing=v; updateHero('roofing'); updatePrijs(); return; }
        if(g==='bestaandDak'){ st.bestaandDak=v; render(); updateHero('bestaandDak'); return; }
        if(g==='skylight'){ st.skylight=v; updateHero('skylight'); updatePrijs(); return; }
        if(g==='zonw'){ st.zonw=v; updateHero('zonw'); updatePrijs(); return; }
        if(g==='vloer'){ st.vloer=v; updateHero('vloer'); updatePrijs(); return; }
        if(g==='bad'){ st.bad=v; updateHero('bad'); updatePrijs(); return; }
        if(g==='keuken'){ st.keuken=v; updateHero('keuken'); updatePrijs(); return; }
        if(g==='extraR'){ if(inp.checked) st.extraR[v]=1; else delete st.extraR[v]; updateHero('extraR'); updatePrijs(); return; }
        if(g==='accent'){ st.accent=v; render(); updateHero('accent'); return; }
        if(g==='frameColor'){ st.frameColor=v; render(); updateHero('frameColor'); return; }
        if(g==='airco'){ st.airco=v; updateHero('klimaat'); updatePrijs(); return; }
        if(g==='achterom'){ st.achterom=v; updatePrijs(); return; }
        if(g==='woningOud'){ st.woningOud=v; render(); return; }
        if(g==='finish'){ st.finish=v; render(); updateHero('finish'); updatePrijs(); return; }
        if(g==='vloerAfw'){ st.vloerAfw=v; render(); var vs=optImg(VLOER_AFW,v); if(vs) setHeroSrc(vs); return; }
        if(g==='elektra'){ if(inp.checked){ var o=null; elektraLijst().forEach(function(x){if(x.v===v)o=x}); st.elektra[v]=o&&o.qty?1:true; } else delete st.elektra[v]; render(); updateHero('elektra'); return; }
        if(g==='fundering'){
          if(inp.checked){
            if(v==='trap-nieuw') delete st.fundering['trap-bestaand'];
            if(v==='trap-bestaand') delete st.fundering['trap-nieuw'];
            st.fundering[v]=1;
          } else delete st.fundering[v];
          render(); updateHero('fundering'); return;
        }
        if(g==='voorz'){
          if(inp.checked){
            if(v==='badkamer-basis') delete st.voorzieningen['badkamer-compleet'];
            if(v==='badkamer-compleet') delete st.voorzieningen['badkamer-basis'];
            st.voorzieningen[v]=1;
          } else delete st.voorzieningen[v];
          render(); updateHero('voorz'); return;
        }
        if(g==='isolatie'){ if(inp.checked) st.isolatie[v]=1; else delete st.isolatie[v]; updateHero('isolatie'); updatePrijs(); return; }
        if(g==='extras'){
          if(inp.checked){ var oo=null; extraLijst().forEach(function(x){if(x.v===v)oo=x});
            st.extras[v]=(oo&&oo.unit==='dims')?{l:3,b:2}:((oo&&(oo.unit==='m2'||oo.unit==='st'))?{q:1}:true); }
          else delete st.extras[v];
          render(); updateHero('extras'); return;
        }
      });
    });
    $('#groups').querySelectorAll('[data-qty]').forEach(function(el){
      el.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click',function(e){
          e.preventDefault(); e.stopPropagation();
          var parts=el.getAttribute('data-qty').split(':'), g=parts[0], v=parts[1], d=parseInt(b.getAttribute('data-d'),10);
          if(g==='elektra'){ st.elektra[v]=Math.max(1,(st.elektra[v]||1)+d); }
          else { var cur=st.extras[v]||{q:1}; cur.q=Math.max(1,(cur.q||1)+d); st.extras[v]=cur; }
          el.querySelector('b').textContent=(g==='elektra'?st.elektra[v]:st.extras[v].q);
          updatePrijs();
        });
      });
    });
    $('#groups').querySelectorAll('[data-dims]').forEach(function(el){
      var v=el.getAttribute('data-dims');
      el.querySelectorAll('input').forEach(function(inp){
        ['click'].forEach(function(ev){ inp.addEventListener(ev,function(e){ e.preventDefault(); e.stopPropagation(); }); });
        inp.addEventListener('input',function(){
          var cur=st.extras[v]||{l:3,b:2};
          cur[inp.getAttribute('data-k')]=parseFloat(inp.value)||1;
          st.extras[v]=cur; updatePrijs();
        });
      });
    });
  }

  /* ---------- presets ---------- */
  /* Een startpunt toepassen. Apart van de klikafhandeling, zodat een
     landingspagina er via ?start= ook meteen mee kan binnenkomen. */
  function pasPresetToe(p){
    st=defaults(st.type);
    Object.keys(p.set).forEach(function(k){
      if(k==='voorzieningen'||k==='isolatie'){ var o={}; p.set[k].forEach(function(x){o[x]=1}); st[k]=o; }
      else st[k]=p.set[k];
    });
    /* Een voorinstelling is van ons en kent het assortiment van het bedrijf
       niet: zet hij een gevel of een optie die dit bedrijf niet levert, dan
       valt die hier terug op wat hij wél levert. */
    normaliseerMerk();
  }

  function renderPresets(){
    var lijst=PRESETS[st.type]||[];
    $('#presetRow').innerHTML=lijst.map(function(p,i){
      var choice=Object.assign({},defaults(st.type),p.set);
      var r=window.NGDakopbouwBeelden&&NGDakopbouwBeelden.kies({materiaal:choice.material,gevelkleur:choice.facadeColor,model:choice.kozijnindeling,kozijnkleur:choice.frameColor});
      return '<button type="button" class="preset" data-i="'+i+'"><span class="preset__th"'+(r&&r.src?' style="background-image:url('+r.src+')"':'')+'></span><span class="preset__t"><b>'+p.n+'</b><span>'+p.d+'</span></span></button>';
    }).join('');
    $('#presetRow').querySelectorAll('.preset').forEach(function(b){
      b.addEventListener('click',function(){
        pasPresetToe(lijst[parseInt(b.getAttribute('data-i'),10)]);
        render(); updateHero('material');
        document.querySelector('.conf').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  }

  /* ---------- type switch ---------- */
  document.querySelectorAll('.matswitch button[data-t]').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.matswitch button[data-t]').forEach(function(x){ x.classList.remove('is-on'); x.setAttribute('aria-pressed','false'); });
      b.classList.add('is-on'); b.setAttribute('aria-pressed','true');
      st=defaults(b.getAttribute('data-t'));
      renderPresets(); render(); updateHero('material');
      try{ history.replaceState(null,'','?type='+st.type); }catch(e){}
    });
  });

  /* ---------- btw & offerte ---------- */
  function setBtw(on){
    btwIncl=on;
    $('#btwIncl').classList.toggle('is-on',on); $('#btwIncl').setAttribute('aria-pressed',on?'true':'false');
    $('#btwExcl').classList.toggle('is-on',!on); $('#btwExcl').setAttribute('aria-pressed',!on?'true':'false');
    updatePrijs();
  }
  $('#btwIncl').addEventListener('click',function(){ setBtw(true); });
  $('#btwExcl').addEventListener('click',function(){ setBtw(false); });
  $('#naarOfferte').addEventListener('click',function(){ $('#offerte').scrollIntoView({behavior:'smooth',block:'start'}); });

  var confAanzicht=$('#confAanzicht');
  if(confAanzicht){
    confAanzicht.querySelectorAll('button[data-aanzicht]').forEach(function(b){
      b.addEventListener('click',function(){
        var v=b.getAttribute('data-aanzicht');
        if(st.aanzicht===v) return;
        st.aanzicht=v; st.thumbIdx=0;
        confAanzicht.querySelectorAll('button').forEach(function(x){
          var on=x===b; x.classList.toggle('is-on',on); x.setAttribute('aria-selected',on?'true':'false');
        });
        updateHero(v==='int'?st.lastGroup:null);
      });
    });
  }
  var confThumbs=$('#confThumbs');
  if(confThumbs){
    confThumbs.addEventListener('click',function(e){
      var b=e.target.closest('button[data-i]'); if(!b) return;
      st.thumbIdx=parseInt(b.getAttribute('data-i'),10)||0;
      var item=interieurItems()[st.thumbIdx]; st.interiorSrc=item?item.src:null;
      updateHero(null);
    });
  }

  function lbl(lijst,v){ var l=v; lijst.forEach(function(o){ if(o.v===v) l=o.l; }); return l; }
  /* De brochure: één link met alle keuzes, het voorbeeldbeeld en de
     plattegrond, op te bouwen en te printen via plattegrond.html. */
  function brochureLink(){
    if(!window.NGPlattegrond||!NGPlattegrond.brochureLink) return '';
    var regels=summaryText(true).split('\n').filter(function(l){return l&&l.indexOf('Vergunning')!==0&&l.indexOf('Richtprijs')!==0;});
    var abs=function(u){try{return u?new URL(u,location.href).href:'';}catch(e){return '';}};
    var binnen=''; try{ binnen=optImg(AFWERK_UIT,st.finish,'finish')||''; }catch(e){}
    return NGPlattegrond.brochureLink({s:regels,i:abs(facadeImg()),ii:abs(binnen)});
  }
  window.NGBrochure=brochureLink;
  function summaryText(zonderPlat){
    var p=prijs(); var T=TYPES[st.type]; var r=[];
    r.push('Type: '+T.titel);
    r.push(('Afmetingen: '+st.w.toFixed(1)+' × '+st.dp.toFixed(1)+' × '+st.h.toFixed(1)+' m ('+p.m2.toFixed(1)+' m²)').replace(/(\d)\.(\d)/g,'$1,$2'));
    if(heeftIndeling()) r.push('Indeling: '+lbl(INDELING,st.indeling)+(st.indeling&&st.indeling!=='open'?((st.metBad||'ja')==='ja'?' + badkamer':' (zonder badkamer)'):''));
    if(KORT&&KORT.indexOf('sloop')>=0) r.push('Bestaand dak verwijderen: '+lbl(SLOOP,st.sloop||'geen'));
    if(KORT&&KORT.indexOf('doorgang')>=0) r.push('Doorgang (trapgatsparing): '+lbl(DOORGANG,st.doorgang||'hout'));
    if(KORT&&KORT.indexOf('vergunning')>=0){ var vg=Object.keys(st.vergunning||{}).map(function(v){return lbl(VERGUNNING,v)}); r.push('Vergunning: '+(vg.length?vg.join(', '):'zelf regelen')); }
    r.push('Kozijnmodel voorgevel: '+lbl(INDELINGEN,st.kozijnindeling)+(kozijnMaat('voor',st.kozijnindeling)?' ('+kozijnMaat('voor',st.kozijnindeling)+')':''));
    r.push('Kozijnmodel achtergevel: '+lbl(ACHTER,st.kozijnAchter||'raam')+(kozijnMaat('achter',st.kozijnAchter||'raam')?' ('+kozijnMaat('achter',st.kozijnAchter||'raam')+')':''));
    r.push('Balustrade: '+lbl(BALUSTRADE,st.balustrade||'geen'));
    r.push('Kozijnkleur: '+lbl(FRAME,st.frameColor));
    r.push('Gevel: '+lbl(MATERIALEN,st.material)+', '+lbl(facadeSet()[st.material]||[],st.facadeColor));
    if(st.type==='op-woning'||st.type==='optopping'){
      r.push('Bestaand dak: '+(st.bestaandDak==='hellend'?'hellend, sloop kap beoordelen wij in de offerte':'plat'));
    }
    r.push('Vergunning: vrijwel altijd nodig bij een dakopbouw. De tekeningen voor de aanvraag komen uit dit dossier.');
    r.push('Dak: '+lbl(DAK,st.roofing));
    r.push('Lichtstraat: '+(st.skylight&&st.skylight!=='none'?lbl(LICHT,st.skylight):'geen'));
    if(heeftIndeling()){
      var vz=Object.keys(st.voorzieningen).map(function(v){return lbl(VOORZ,v)});
      r.push('Voorzieningen: '+(vz.length?vz.join(', '):'geen'));
      var iso=Object.keys(st.isolatie).map(function(v){return lbl(ISOLATIE,v)});
      r.push('Isolatie & energie: '+iso.join(', '));
    }
    r.push('Klimaat: '+lbl(KLIMAAT,st.airco));
    var el=Object.keys(st.elektra).map(function(v){ var q=st.elektra[v]; return lbl(elektraLijst(),v)+(q>1?' ×'+q:''); });
    r.push('Elektra: '+(el.length?el.join(', '):'geen'));
    var fu=Object.keys(st.fundering).map(function(v){return lbl(fundLijst(),v)});
    if(!KORT||KORT.indexOf('fundering')>=0) r.push('Fundering/doorbraak: '+(fu.length?fu.join(', '):'standaard')+' · achterom: '+st.achterom);
    r.push('Afwerking: '+lbl(afwerkLijst(),st.finish));
    if(st.finish==='luxe') r.push('Vloer: '+lbl(VLOER_AFW,st.vloerAfw||'visgraat'));
    if(!zonderPlat&&window.NGPlattegrond&&NGPlattegrond.actief()) r.push(NGPlattegrond.samenvatting());
    var adv=Object.keys(st.advies||{}).filter(function(k){return st.advies[k];});
    if(adv.length){
      var nm={roofing:'dakbedekking',skylight:'lichtstraat',isolatie:'isolatie',extras:'extra opties',klimaat:'klimaat / airco',finish:'afwerking',elektra:'elektra'};
      r.push('Advies gevraagd (overgeslagen): '+adv.map(function(k){return nm[k]||k;}).join(', '));
    }
    var ex=Object.keys(st.extras).map(function(v){
      var o=null; extraLijst().forEach(function(x){if(x.v===v)o=x});
      var d=st.extras[v], t=lbl(extraLijst(),v);
      if(o&&o.unit==='dims') t+=' ('+(d.l||3)+'×'+(d.b||2)+' m)';
      else if(o&&(o.unit==='m2'||o.unit==='st')) t+=' ×'+(d.q||1);
      return t;
    });
    r.push('Extra opties: '+(ex.length?ex.join(', '):'geen'));
    if(!zonderPlat){ var bl=brochureLink(); if(bl) r.push('Volledige brochure met keuzes en plattegrond (printbaar als pdf): '+bl); }
    if(!GEEN_PRIJS){
      r.push('');
      r.push('Richtprijs excl. btw: '+euro(p.excl));
      r.push('Richtprijs incl. '+Math.round(btwTarief()*100)+'% btw: '+euro(p.incl));
    }
    return r.join('\n');
  }

  $('#downloadBtn').addEventListener('click',function(){
    var blob=new Blob(['Dakopbouw configuratie, Next Growth\n\n'+summaryText()+'\n\n'+materiaalTekst()+'\n\nnextgrowthdigital.nl · <a href="tel:+31683902192">06 83 90 21 92</a>'],{type:'text/plain'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='dakopbouw-configuratie.txt'; a.click(); URL.revokeObjectURL(a.href);
  });

  /* De materiaalstaat gaat altijd mee met de aanvraag (in dezelfde mail als
     de werkvoorbereider krijgt, zodat er niet eerst een tekening heen en
     weer hoeft voor er gecalculeerd kan worden) én is los opvraagbaar via de
     knop "Materiaalstaat" hieronder — een bezoeker die het wil zien (of naar
     zijn aannemer wil doorsturen) hoeft er niet voor door de offerteflow.

     Een vrijstaand type (tuinstudio, mantelzorg- of vakantiewoning) heeft vier
     wanden en geen doorbraak; dat verschil moet mee, anders klopt de helft van
     de staat niet. */
  /* Interne calculatie volgens de prijslijst van het bedrijf (merk.calculatie).
     Alleen voor het bedrijf zelf: gaat mee in de aanvraag, nooit in beeld. */
  function calculatieTekst(){
    var mk=window.NGMerk&&NGMerk.merk&&NGMerk.merk(), C=mk&&!mk.demo&&mk.calculatie;
    if(!C) return '';
    var r=[], tot=[0,0]; CALC_RIJEN=[];
    function eu(n){ return '€ '+Math.round(n).toLocaleString('nl-NL'); }
    function bedr(b){ return Array.isArray(b)?b:[b,b]; }
    /* qp = [aantal, eenheid, prijs per eenheid] voor de offerteregel */
    /* of = [onderdeel, omschrijving zoals in de offerte van het bedrijf] */
    function regel(t,b,uitleg,qp,of){
      CALC_RIJEN.push({t:t,b:b==null?null:bedr(b),u:uitleg||'',q:qp||null,g:of&&of[0]||'',o:of&&of[1]||''});
      if(b==null) { r.push('- '+t+': prijs nader te bepalen'+(uitleg?' ('+uitleg+')':'')); return; }
      b=bedr(b); tot[0]+=b[0]; tot[1]+=b[1];
      r.push('- '+t+': '+(b[0]===b[1]?eu(b[0]):eu(b[0])+' – '+eu(b[1]))+(uitleg?' ('+uitleg+')':''));
    }
    function keer(b,n){ b=bedr(b); return [b[0]*n,b[1]*n]; }
    var m2=st.w*st.dp, nl1=function(v){return (Math.round(v*10)/10).toFixed(1).replace('.',',');};
    var kort=function(v){ return String(Math.round(v*100)/100).replace('.',','); };
    var maat=kort(st.w)+' x '+kort(st.dp)+'m', kleur=lbl(FRAME,st.frameColor||'antraciet').toLowerCase();
    var KM=(mk.kozijnMaten||{});
    function kozTekst(lijst,v,naam){ var ms=(KM[lijst]||{})[v]||[];
      return ms.length?ms.map(function(k){return k.l+' (kunststof) '+(k.b*10)+' x '+(k.h*10)+' mm';}).join(' + ')+' · kleur '+kleur+' · incl. montage & afwerking':naam+' · kleur '+kleur+' · incl. montage & afwerking'; }
    if(C.basis){ regel('Basis dakopbouw '+C.basis.m2+' m²',C.basis.prijs,C.basis.omschrijving,null,['Dakopbouw','Prefab dakopbouw 3 x 3m (9 m²) wind- en waterdicht gereed (incl. constructie, steenstrips gevel, trapgat, 2x standaard raamkozijn voorgevel, bitumen dakbedekking, 1 schakelaar + 1 lichtpunt, vrije hoogte 2,60m)']);
      var extraM2=Math.max(0,Math.round((m2-C.basis.m2)*10)/10);
      if(extraM2>0) regel('Extra oppervlak '+nl1(extraM2)+' m²',C.basis.perExtraM2?C.basis.perExtraM2*extraM2:null,C.basis.perExtraM2?eu(C.basis.perExtraM2)+'/m² boven '+C.basis.m2+' m² (gekozen '+nl1(st.w)+' × '+nl1(st.dp)+' m = '+nl1(m2)+' m²)':'',C.basis.perExtraM2?[extraM2,'m²',C.basis.perExtraM2]:null,['','Dakopbouw uitbreiden naar '+maat+' ('+nl1(m2)+' m²) · extra vloeroppervlak '+nl1(extraM2)+' m² incl. constructie, gevel en dak']); }
    if(KORT&&KORT.indexOf('doorgang')>=0&&st.doorgang&&st.doorgang!=='geen') regel('Doorgang / trapgatsparing: '+lbl(DOORGANG,st.doorgang),C.doorgang&&C.doorgang[st.doorgang],'',null,['Doorgang','Trapgatsparing maken in bestaande '+(st.doorgang==='beton'?'betonvloer (zagen, raveelwerk & constructief herstel)':'houten vloer (raveelwerk & afwerking)')+' incl. afvoeren']);
    if(KORT&&KORT.indexOf('vergunning')>=0) Object.keys(st.vergunning||{}).forEach(function(v){ regel(lbl(VERGUNNING,v),C.vergunning&&C.vergunning[v],v==='vergunning'?'excl. legeskosten gemeente':'',null,['Vergunning',v==='vergunning'?'Omgevingsvergunning aanvragen incl. bouwtekeningen & constructieberekening (excl. leges gemeente)':v==='haalbaarheid'?'Haalbaarheidsonderzoek bestemmingsplan & welstand':lbl(VERGUNNING,v)]); });
    if(st.sloop&&st.sloop!=='geen'){ var sp=C.sloopPerM2&&C.sloopPerM2[st.sloop]; regel('Sloop bestaand dak: '+lbl(SLOOP,st.sloop),sp!=null?sp*m2:null,sp!=null?eu(sp)+'/m² × '+nl1(m2)+' m², incl. afvoer puin':'',sp!=null?[m2,'m²',sp]:null,['Sloop','Bestaande '+(st.sloop==='grind'?'grindlaag + dakbedekking':'dakbedekking')+' verwijderen & afvoeren '+nl1(m2)+' m² ('+maat+')']); }
    var kv=C.kozijnVoor&&C.kozijnVoor[st.kozijnindeling]; regel('Kozijn voorgevel: '+lbl(INDELINGEN,st.kozijnindeling),kv===0?0:kv, kv===0?'standaard raamkozijnen inbegrepen':'',null,['Voorgevel',kv===0?'2x standaard raamkozijn (kunststof) · kleur '+kleur+' (inbegrepen in basis)':kozTekst('voor',st.kozijnindeling,lbl(INDELINGEN,st.kozijnindeling))]);
    var ka=C.kozijnAchter&&C.kozijnAchter[st.kozijnAchter||'raam']; regel('Kozijn achtergevel: '+lbl(ACHTER,st.kozijnAchter||'raam'),ka,'',null,['Achtergevel',(st.kozijnAchter||'raam')==='dicht'?'Dichte achtergevel, geen kozijn':kozTekst('achter',st.kozijnAchter||'raam',lbl(ACHTER,st.kozijnAchter||'raam'))]);
    if(st.balustrade&&st.balustrade!=='geen'){ var bm=C.balustradePerM&&C.balustradePerM[st.balustrade];
      regel('Balustrade: '+lbl(BALUSTRADE,st.balustrade),bm!=null?bm*st.w:null,bm!=null?eu(bm)+'/m × '+nl1(st.w)+' m (breedte, indicatie; inmeten)':'',bm!=null?[st.w,'m¹',bm]:null,['Voorgevel',lbl(BALUSTRADE,st.balustrade)+' leveren en monteren '+nl1(st.w)+' m¹ (definitief na inmeten)']); }
    if(!KORT||KORT.indexOf('fundering')>=0) Object.keys(st.fundering||{}).forEach(function(v){ if(v.indexOf('trap')===0) regel('Trap: '+lbl(FUND_UIT,v)+' (rechte steektrap T01)',C.trap&&C.trap[v]); });
    ['screens','rolluiken'].forEach(function(v){ var e=st.extras[v]; if(e){ var q=e.q||1; regel(lbl(EXTRA_UIT,v)+' ×'+q,C.zonweringPerStuk&&C.zonweringPerStuk[v]?keer(C.zonweringPerStuk[v],q):null,'per raam',[q,'st',bedr(C.zonweringPerStuk[v]||0)[0]],['Zonwering',lbl(EXTRA_UIT,v)+' per raam leveren en monteren incl. bediening']); } });
    var dk=C.dakPerM2&&C.dakPerM2[st.roofing]; regel('Dakbedekking: '+lbl(DAK,st.roofing),dk==null?null:keer(dk,m2),dk===0?'inbegrepen':nl1(m2)+' m²',dk?[m2,'m²',bedr(dk)[0]]:null,['Dak',lbl(DAK,st.roofing)+' dakbedekking '+nl1(m2)+' m² ('+maat+') incl. dakrandafwerking'+(dk===0?' (inbegrepen)':'')]);
    if(st.skylight&&st.skylight!=='none') regel('Lichtstraat: '+lbl(LICHT,st.skylight),C.lichtstraat&&C.lichtstraat[st.skylight],'',null,['Dak','Lichtstraat '+lbl(LICHT,st.skylight)+' leveren en monteren incl. opstand & waterdichte aansluiting']);
    var gm=C.gevelPerM2&&C.gevelPerM2[st.material], gevelM2=(2*st.dp+st.w)*st.h;
    regel('Gevel: '+lbl(MATERIALEN,st.material),gm==null?null:keer(gm-(C.gevelInbegrepenPerM2||0),gevelM2),gm==null?'niet in prijslijst':'meer-/minderprijs t.o.v. steenstrips (inbegrepen), ≈ '+nl1(gevelM2)+' m² gevel',gm==null||gm===(C.gevelInbegrepenPerM2||0)?null:[gevelM2,'m²',gm-(C.gevelInbegrepenPerM2||0)],['Gevel',(st.material==='metselwerk'?'Steenstrips':lbl(MATERIALEN,st.material)+' gevelbekleding')+' leveren en monteren ≈ '+nl1(gevelM2)+' m²'+(gm===(C.gevelInbegrepenPerM2||0)?' (inbegrepen in basis)':' · '+(gm>(C.gevelInbegrepenPerM2||0)?'meerprijs':'minderprijs')+' t.o.v. steenstrips')]);
    if(st.extras['overstek-spotjes']) regel('Overstek met spotjes (hout, vanaf)',C.overstek,'',null,['Voorgevel','Houten overstek met inbouwspots leveren en monteren incl. bedrading']);
    var bad=!!(st.voorzieningen['badkamer-basis']||st.voorzieningen['badkamer-compleet']||(st.indeling&&st.indeling!=='open'&&(st.metBad||'ja')==='ja'));
    if(bad) regel('Badkamer compleet (excl. badmeubel)',C.badkamer,'',null,['Badkamer','Badkamer waterdicht gereed excl. sanitair/meubels (incl. leidingwerk, afvoeren, inbouwreservoirs, kimbanden, afdichtingen en cementgebonden afwerking)']);
    if(st.voorzieningen['apart-toilet']) regel('Toilet compleet (excl. toiletmeubel)',C.toilet,'',null,['Toilet','Toilet waterdicht gereed excl. sanitair/meubels']);
    var P=window.NGPlattegrond&&NGPlattegrond.data&&NGPlattegrond.data(), wl;
    if(P&&P.kamers){
      var seg={}, R=0.1;
      function zij(x1,y1,x2,y2){ if((x1===x2&&(Math.abs(x1)<.01||Math.abs(x1-P.w)<.01))||(y1===y2&&(Math.abs(y1)<.01||Math.abs(y1-P.d)<.01))) return;
        var n=Math.round((Math.abs(x2-x1)+Math.abs(y2-y1))/R); for(var i=0;i<n;i++){ var x=x1===x2?x1:Math.min(x1,x2)+i*R, y=y1===y2?y1:Math.min(y1,y2)+i*R; seg[(x1===x2?'v':'h')+Math.round(x*10)+','+Math.round(y*10)]=1; } }
      var deuren=0;
      P.kamers.forEach(function(k){ if(k.t==='trapgat') return; if(k.deur) deuren++;
        zij(k.x,k.y,k.x+k.b,k.y); zij(k.x,k.y+k.d,k.x+k.b,k.y+k.d); zij(k.x,k.y,k.x,k.y+k.d); zij(k.x+k.b,k.y,k.x+k.b,k.y+k.d); });
      (P.wanden||[]).forEach(function(w){ zij(Math.min(w.x1,w.x2),Math.min(w.y1,w.y2),Math.max(w.x1,w.x2),Math.max(w.y1,w.y2)); if(w.deur!=null) deuren++; });
      wl=Object.keys(seg).length*R;
      if(wl>0&&C.wandPerM2) regel('Scheidingswanden geïsoleerd',C.wandPerM2*wl*st.h,nl1(wl)+' m × '+nl1(st.h)+' m = '+nl1(wl*st.h)+' m² wand',[wl*st.h,'m²',C.wandPerM2],['Binnenwanden','Montage van het metal-stud wand en gipsplaten incl. isolatiemateriaal (glaswol) · '+nl1(wl)+' m¹ x '+kort(st.h)+'m']);
      if(deuren&&C.binnendeur) regel('Binnenkozijn + deur',C.binnendeur*deuren,'',[deuren,'st',C.binnendeur],['','Binnenkozijn met opdekdeur incl. montage & afwerking']);
      var tel={}; (P.punten||[]).forEach(function(p){ tel[p.t]=(tel[p.t]||0)+1; });
      var inb=C.elektraInbegrepen||{};
      [['spot','Spotjes'],['lamp','Lichtpunt + schakelaar'],['wcd','Stopcontacten']].forEach(function(e){
        var n=Math.max(0,(tel[e[0]]||0)-(inb[e[0]]||0)); if(n&&C.elektra&&C.elektra[e[0]]) regel(e[1],C.elektra[e[0]]*n,'vanaf '+eu(C.elektra[e[0]])+'/st'+(inb[e[0]]?', '+inb[e[0]]+' inbegrepen':''),[n,'st',C.elektra[e[0]]],['Elektra',{spot:'Inbouwspot',lamp:'Lichtpunt + schakelaar',wcd:'Dubbele wandcontactdoos'}[e[0]]+' incl. bedrading en aansluiten']);
      });
    }
    var los=[]; if(st.airco&&st.airco!=='none') los.push(lbl(KLIMAAT,st.airco)); if(st.extras.vloerverwarming) los.push('vloerverwarming');
    if((st.finish==='stuc'||st.finish==='luxe')&&C.stucBinnenPerM2){
      var stucM2=2*(st.w+st.dp)*st.h+m2+(typeof wl==='number'?2*wl*st.h:0);
      regel('Stucwerk binnen (wanden + plafond)',C.stucBinnenPerM2*stucM2,eu(C.stucBinnenPerM2)+'/m² × ≈ '+nl1(stucM2)+' m²'+(typeof wl==='number'&&wl>0?', incl. beide zijden binnenwanden':''),[stucM2,'m²',C.stucBinnenPerM2],['Stucwerk','Stucwerk wanden en plafond, behangklaar']);
      if(st.finish==='luxe') los.push('schilderwerk en vloerafwerking ('+lbl(VLOER_AFW,st.vloerAfw||'visgraat')+')');
    } else if(st.finish&&st.finish!=='casco') los.push('afwerking: '+lbl(afwerkLijst(),st.finish));
    Object.keys(st.isolatie||{}).forEach(function(v){ if(v!=='standaard-plus') los.push(lbl(ISOLATIE,v)); });
    CALC_LOS=los;
    if(los.length) r.push('- Niet in prijslijst, apart calculeren: '+los.join(', '));
    r.push(''); r.push('Indicatie totaal excl. btw: '+(tot[0]===tot[1]?eu(tot[0]):eu(tot[0])+' – '+eu(tot[1])));
    r.push('Indicatie totaal incl. 21% btw: '+(tot[0]===tot[1]?eu(tot[0]*1.21):eu(tot[0]*1.21)+' – '+eu(tot[1]*1.21)));
    return 'INTERNE CALCULATIE '+(mk.naam||'').toUpperCase()+' (prijslijst 2026, voorlopig, excl. btw, niet getoond aan de klant)\n'+r.join('\n');
  }
  window.NGCalculatie=calculatieTekst;
  var CALC_RIJEN=[], CALC_LOS=[];
  window.NGOfferte=function(f){ return offerteLink(f); };
  /* De regels voor de conceptofferte in het CRM: omschrijving zoals in hun
     offerte, aantal, prijs per eenheid (excl. btw). Een bandbreedte gaat
     met de laagste prijs mee; zonder prijs: 0 en 'prijs nader te bepalen'. */
  function offerteRegels(){
    if(!calculatieTekst()) return [];
    var eu=function(n){return '€ '+Math.round(n).toLocaleString('nl-NL');};
    var rg=CALC_RIJEN.map(function(c){
      var t=(c.g?'**'+c.g+'** ':'')+(c.o||c.t), n=1, p=c.b?c.b[0]:0;
      if(c.q&&c.q[0]>0&&c.q[2]){ n=Math.round(c.q[0]*10)/10; p=c.q[2]; }
      if(!c.b) t+='\n_prijs nader te bepalen_';
      else if(c.b[0]!==c.b[1]) t+='\n_vanafprijs, bandbreedte '+eu(c.b[0])+' – '+eu(c.b[1])+'_';
      return {d:t,n:n,p:Math.round(p*100)/100};
    });
    if(CALC_LOS.length) rg.push({d:'**Nog apart te calculeren** '+CALC_LOS.join(', ')+'\n_prijs nader te bepalen_',n:1,p:0});
    return rg;
  }
  /* De offerte in de huisstijl van het bedrijf (offerte-dakopbouw.html):
     klantgegevens + de regels uit de interne calculatie, in één link die met
     de aanvraag meegaat naar het bedrijf. Afdrukken geeft de PDF. */
  function offerteLink(f){
    var mk=window.NGMerk&&NGMerk.merk&&NGMerk.merk();
    if(!mk||mk.demo||!mk.calculatie||!calculatieTekst()) return '';
    var nu=new Date(), z=function(n){return (n<10?'0':'')+n;};
    var nr=String(nu.getFullYear()).slice(2)+z(nu.getMonth()+1)+z(nu.getDate())+z(nu.getHours())+z(nu.getMinutes());
    var o={b:mk.slug,n:nr,d:nu.toISOString().slice(0,10),
      k:{n:f.naam.value,a:f.adres.value,p:(f.postcode.value+' '+f.plaats.value).trim(),t:f.telefoon.value,e:f.email.value},
      x:('Dakopbouw '+st.w.toFixed(1)+' × '+st.dp.toFixed(1)+' m ('+(st.w*st.dp).toFixed(1)+' m²)').replace(/(\d)\.(\d)/g,'$1,$2'),
      r:CALC_RIJEN.map(function(c){ return [c.o||c.t,c.b,c.o?'':c.u,c.q?[Math.round(c.q[0]*10)/10,c.q[1],c.q[2]]:null,c.g]; }),
      p:(function(){ try{ return window.NGPlattegrond&&NGPlattegrond.actief()?(NGPlattegrond.link().split('#p=')[1]||''):''; }catch(e){ return ''; } })(),
      l:CALC_LOS, s:summaryText(true).split('\n').filter(function(l){return l&&l.indexOf('Richtprijs')!==0&&l.indexOf('Volledige brochure')!==0;})};
    try{
      var j=JSON.stringify(o), b=btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      return new URL('offerte-dakopbouw.html',location.href).href.split('?')[0]+'#o='+b;
    }catch(e){ return ''; }
  }
  function materiaalTekst(){
    if(!window.NGMateriaal) return '';
    try{
      var vrij = !!(TYPES[st.type] && TYPES[st.type].vrij);
      var s = NGMateriaal.staat({
        soort:'dakopbouw',
        w:st.w, dp:st.dp, h:st.h, vrijstaand:vrij,
        material:st.material, roofing:st.roofing, accent:st.accent,
        frameColor:st.frameColor, skylight:st.skylight, finish:st.finish,
        fundering:st.fundering, elektra:st.elektra, extras:st.extras,
        indeling:st.indeling, voorzieningen:st.voorzieningen
      });
      return NGMateriaal.tekst(s);
    }catch(e){ return ''; }   // een aanvraag mag hier nooit op stuklopen
  }
  /* De materiaalstaat als net document: per groep een eigen tabel — vloer,
     wanden, gevel, dak, leidingwerk, afwerking — met de aannames en de punten
     voor de constructeur achteraan. Afdrukken/opslaan als PDF geeft een A4 die
     zo naar de werkvoorbereider of de leverancier kan. */
  function materiaalstaatHtml(){
    var project='DOP-'+Math.round(st.w*10)+'X'+Math.round(st.dp*10);
    var datum=new Date().toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'});
    var e=function(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;');};
    var nl=function(x){return String(x).replace('.',',');};

    var staat=null;
    try{
      var vrij=!!(TYPES[st.type]&&TYPES[st.type].vrij);
      staat=window.NGMateriaal&&NGMateriaal.staat({
        soort:'dakopbouw', w:st.w, dp:st.dp, h:st.h, vrijstaand:vrij,
        material:st.material, roofing:st.roofing, accent:st.accent,
        frameColor:st.frameColor, skylight:st.skylight, finish:st.finish,
        fundering:st.fundering, elektra:st.elektra, extras:st.extras,
        indeling:st.indeling, voorzieningen:st.voorzieningen
      });
    }catch(err){ /* zonder staat volgt de nette foutregel hieronder */ }

    var binnen='';
    if(staat&&staat.posten&&staat.posten.length){
      /* groepen in de volgorde waarin ze in de staat verschijnen */
      var volgorde=[],perGroep={};
      staat.posten.forEach(function(po){
        if(!perGroep[po.groep]){perGroep[po.groep]=[];volgorde.push(po.groep);}
        perGroep[po.groep].push(po);
      });
      binnen+='<div class="meta"><div><b>'+e(project)+'</b><span>Dakopbouw '
        +nl(st.w)+' × '+nl(st.dp)+' m · hoogte '+nl(st.h)+' m</span></div>'
        +'<div class="meta-r"><span>'+e(datum)+'</span><span>Indicatief · werkvoorbereiding</span></div></div>';
      volgorde.forEach(function(g){
        binnen+='<section class="groep"><h2>'+e(g)+'</h2><table>'
          +'<thead><tr><th class="n">Aantal</th><th class="eh">Eenheid</th><th>Omschrijving</th></tr></thead><tbody>';
        perGroep[g].forEach(function(po){
          binnen+='<tr><td class="n">'+nl(po.hoeveelheid)+'</td><td class="eh">'+e(po.eenheid)+'</td>'
            +'<td>'+e(po.omschrijving)
            +(po.opmerking?'<small>'+e(po.opmerking)+'</small>':'')+'</td></tr>';
        });
        binnen+='</tbody></table></section>';
      });
      if(staat.aannames.length){
        binnen+='<section class="noot"><h2>Aannames</h2><ul>'
          +staat.aannames.map(function(a){return '<li>'+e(a)+'</li>';}).join('')+'</ul></section>';
      }
      if(staat.controle.length){
        binnen+='<section class="noot let"><h2>Te bevestigen door de constructeur</h2><ul>'
          +staat.controle.map(function(c){return '<li>'+e(c)+'</li>';}).join('')+'</ul></section>';
      }
    }else{
      binnen='<p class="leeg">Materiaalstaat kon niet worden opgebouwd voor deze combinatie.</p>';
    }

    return '<!doctype html><html lang="nl"><head><meta charset="utf-8">'
      +'<title>Materiaalstaat '+e(project)+'</title><style>'
      +'*{box-sizing:border-box}body{margin:0;background:#26221c;font-family:Arial,Helvetica,sans-serif;color:#171717}'
      +'header{position:sticky;top:0;z-index:2;background:#111;color:#fff;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;gap:16px}'
      +'header b{font-size:14px}header span{font-size:11px;color:#bbb}'
      +'button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}'
      +'.sheet{width:min(860px,94vw);margin:22px auto 40px;background:#fff;border-radius:10px;box-shadow:0 8px 28px #0008;padding:34px 40px}'
      +'.meta{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #171717;padding-bottom:12px;margin-bottom:6px}'
      +'.meta b{font-size:19px;letter-spacing:.02em;display:block}'
      +'.meta span{display:block;font-size:12px;color:#555;margin-top:3px}'
      +'.meta-r{text-align:right}'
      +'.groep h2,.noot h2{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#B38900;margin:22px 0 6px}'
      +'table{width:100%;border-collapse:collapse;font-size:12.5px;line-height:1.5}'
      +'th{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#777;text-align:left;font-weight:600;padding:0 8px 4px 0;border-bottom:1px solid #ddd}'
      +'td{padding:5px 8px 5px 0;border-bottom:1px solid #eee;vertical-align:top}'
      +'td.n,th.n{width:56px;text-align:right;padding-right:14px;font-variant-numeric:tabular-nums}'
      +'td.eh,th.eh{width:64px;color:#555}'
      +'td small{display:block;color:#777;font-size:11px;margin-top:1px}'
      +'.noot ul{margin:4px 0 0;padding-left:18px;font-size:12px;line-height:1.6;color:#333}'
      +'.noot.let ul{color:#7a4a12}'
      +'.leeg{padding:30px 0;color:#555}'
      +'@media print{header{display:none}body{background:#fff}.sheet{width:100%;margin:0;box-shadow:none;border-radius:0;padding:0}'
      +'.groep{break-inside:avoid}}'
      +'@page{size:A4 portrait;margin:16mm}'
      +'</style></head><body>'
      +'<header><b>Materiaalstaat · '+e(project)+'</b><span>Indicatief, werkvoorbereiding, geen productiestuklijst</span>'
      +'<button data-ng-print>Afdrukken / opslaan als PDF</button></header>'
      +'<div class="sheet">'+binnen+'</div></body></html>';
  }
  /* Ook voor wie de staat elders wil tonen (bijv. de presentatiefilm). */
  window.NGMateriaalHtml=materiaalstaatHtml;
  $('#materiaalstaatBtn').addEventListener('click',function(){
    var win=window.open('','ng-materiaalstaat');
    if(!win){ alert('Sta pop-ups toe om de materiaalstaat te openen.'); return; }
    win.document.open(); win.document.write(materiaalstaatHtml()); win.document.close(); (function(k){ if(k) k.addEventListener('click', function(){ win.print(); }); })(win.document.querySelector('[data-ng-print]'));
  });

  function msg(t,type){ var m=$('#leadMsg'); m.hidden=false; m.textContent=t; m.className='lead__msg '+(type||''); }
  function mailtoFallback(f){
    var body='Aanvraag dakopbouw via configurator\n=====================================\n\n'+f.configuratie.value+'\n\n'+calculatieTekst()+(offerteLink(f)?'\n\nOfferte (printbaar als PDF): '+offerteLink(f):'')+'\n\nNaam: '+f.naam.value+'\nAdres: '+f.adres.value+', '+f.postcode.value+' '+f.plaats.value+'\nPlaats: '+f.plaats.value+'\nE-mail: '+f.email.value+'\nTelefoon: '+f.telefoon.value+'\nStart: '+((f.start&&f.start.value)||'-')+'\nBellen op: '+belMoment(f)+'\nBericht: '+f.bericht.value;
    location.href='mailto:'+aanvraagDoel().email+'?subject='+encodeURIComponent('Offerteaanvraag dakopbouw: '+(f.naam.value||''))+'&body='+encodeURIComponent(body);
  }
    /* Twee routes naast elkaar: FormSubmit levert vandaag af, Web3Forms vangt
       op als die dienst hapert. Geeft een antwoord terug in de vorm die de
       afhandeling hieronder al verwacht ({ok, json()}). */
    var WEB3FORMS_KEY = '695172ae-1f2d-40b7-bb31-b8a4a882ad62';
  function belMoment(f){
      var d=f.beldatum&&f.beldatum.value, t=f.beltijd&&f.beltijd.value;
      if(!d) return 'Geen voorkeur'+(t&&t!=='Maakt niet uit'?' · '+t:'');
      var p=d.split('-'); return p[2]+'-'+p[1]+'-'+p[0]+(t?' · '+t:'');
    }
    function ngDubbelResp(payload){
      /* Heeft het bedrijf een Reuzenpanda-CRM gekoppeld (token in Vercel), dan
         komt de aanvraag daar ook als lead binnen. Zonder koppeling: 204, niets. */
      try{
        var _rm=window.NGMerk&&NGMerk.merk&&NGMerk.merk(), _crm=payload._crm, _rg=payload._regels;
        delete payload._crm; delete payload._regels;
        /* alleen echte aanvragen (niet 'ontwerp bewaard'); de regels worden
           daar een conceptofferte in hun eigen offertesjabloon */
        if(_crm&&_rm&&!_rm.demo&&_rm.slug) fetch('/api/reuzenpanda',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
          body:JSON.stringify({bedrijf:_rm.slug,aanvraag:payload,regels:_rg||[]})}).catch(function(){});
      }catch(e){}
      var doel=aanvraagDoel();
      /* Heeft het bedrijf een eigen koppeling, dan is dát de hoofdweg: de
         aanvraag hoort in zijn CRM te vallen, niet in een mailbox. De twee
         formulierdiensten blijven ernaast staan als vangnet — een lead die
         langs een omweg binnenkomt is beter dan een lead die weg is. */
      var c=doel.endpoint?fetch(doel.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
        .then(function(r){return r.ok;}).catch(function(){return false;}):Promise.resolve(false);
      var a=fetch('https://formsubmit.co/ajax/'+doel.email,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
        .then(function(r){return r.ok?r.json():null;}).then(function(d){return !!(d&&(d.success===true||d.success==='true'));}).catch(function(){return false;});
      var b=WEB3FORMS_KEY?fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(Object.assign({access_key:WEB3FORMS_KEY,from_name:'nextgrowthdigital.nl',subject:payload._subject},payload))})
        .then(function(r){return r.ok;}).catch(function(){return false;}):Promise.resolve(false);
      return Promise.all([a,b,c]).then(function(u){var ok=u[0]||u[1]||u[2];return {ok:ok,json:function(){return Promise.resolve({success:ok});}};});
    }

  /* Tussentijds bewaren: wie halverwege zijn e-mail achterlaat, is een
     lead, ook als hij het formulier aan het eind nooit haalt. Het bedrijf
     krijgt de samenstelling tot nu toe; de bezoeker een bevestiging. */
  window.NGTussentijds=function(email){
    var _mk=window.NGMerk&&window.NGMerk.merk(), naam=_mk&&!_mk.demo?_mk.naam:'Next Growth';
    var fe=document.getElementById('f_email'); if(fe&&!fe.value) fe.value=email;
    window.NGMetingStil=true;
    var verzoek=ngDubbelResp({_subject:'Ontwerp bewaard (nog geen aanvraag), dakopbouw: '+email,_template:'table',_captcha:'false',_replyto:email,
      _autoresponse:'Bedankt! Je dakopbouw-ontwerp is bewaard. '+naam+' neemt contact met je op om het door te nemen. Je kunt de configurator op elk moment afmaken.',
      email:email,Product:'Dakopbouw configurator, tussentijds bewaard',Bedrijf:naam,Email:email,
      Status:'Bezoeker is nog bezig; dit is nog geen volledige offerteaanvraag.',
      Plattegrond:(window.NGPlattegrond&&NGPlattegrond.link())||'-',Configuratie:summaryText()});
    window.NGMetingStil=false;
    return verzoek.then(function(r){return r.ok;}).catch(function(){return false;});
  };
  (function(){ var bd=document.getElementById('f_beldatum'); if(!bd) return; var d=new Date(); d.setDate(d.getDate()+1);
    bd.min=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
  $('#leadForm').addEventListener('submit',function(e){
    e.preventDefault(); var f=e.target;
    if(f.reportValidity&&!f.reportValidity()) return;
    f.configuratie.value=summaryText();
    var btn=$('#leadBtn'), oud=btn.textContent; btn.disabled=true; btn.textContent='Versturen…';
    var _mk=window.NGMerk&&window.NGMerk.merk();
    if(window.NGMeting) NGMeting.gebeurtenis('configurator_aanvraag',{product:'dakopbouw'});
    try{ if(parent!==window) parent.postMessage({bron:'ng-configurator',gebeurtenis:'aanvraag'},'*'); }catch(x){}
    ngDubbelResp({_subject:'Offerteaanvraag dakopbouw: '+(f.naam.value||''),email:f.email.value,_autoresponse:'Bedankt voor je aanvraag! We nemen binnen 1 werkdag contact met je op. Je ontwerp met plattegrond: '+(brochureLink()||'-'),_template:'table',_captcha:'false',_replyto:f.email.value,Product:'Dakopbouw configurator',Brochure:brochureLink()||'-',Bedrijf:(_mk&&!_mk.demo?_mk.naam:'Next Growth'),Naam:f.naam.value,Adres:f.adres.value,Postcode:f.postcode.value,Plaats:f.plaats.value,Email:f.email.value,Telefoon:f.telefoon.value,Start:(f.start&&f.start.value)||'-',Bellen:belMoment(f),Bericht:f.bericht.value,Configuratie:f.configuratie.value,Calculatie:calculatieTekst()||'-',Offerte:offerteLink(f)||'-',_crm:true,_regels:offerteRegels()})
      .then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(){ msg('Dank! Je aanvraag is verstuurd. We nemen binnen één werkdag contact op.','ok'); f.reset(); })
      .catch(function(){ msg('Versturen via de site lukte niet. We openen je e-mailprogramma als alternatief.',''); mailtoFallback(f); })
      .finally(function(){ btn.disabled=false; btn.textContent=oud; });
  });

  /* ---------- init ---------- */
  var qs=new URLSearchParams(location.search); var t0=qs.get('type');
  st=defaults(TYPES[t0]?t0:'op-aanbouw');
  if(TYPES[t0]&&t0!=='op-aanbouw'){
    document.querySelectorAll('.matswitch button[data-t]').forEach(function(x){ var on=x.getAttribute('data-t')===t0; x.classList.toggle('is-on',on); x.setAttribute('aria-pressed',on?'true':'false'); });
  }
  /* ?start=<nummer> opent de configurator met een startpunt al toegepast,
     zodat iemand die op een landingspagina een samenstelling aanklikt niet
     op een leeg scherm binnenkomt. */
  var s0=parseInt(qs.get('start'),10);
  var startLijst=PRESETS[st.type]||[];
  if(!isNaN(s0)&&startLijst[s0]) pasPresetToe(startLijst[s0]);

  /* De samenstelling van de vorige keer terugzetten. Zonder dit is een druk op
     F5 -- of een klik naar de prijzenpagina en terug -- genoeg om een kwartier
     schuiven, kiezen en indelen weg te gooien, en dat is precies het moment
     waarop iemand afhaakt. Komt hij binnen met een startpunt in de link, dan
     wint dat: dan wil hij díe samenstelling zien. */
  if(window.NGBewaren){
    var herstelde = NGBewaren.laad(st, { negeer: !isNaN(s0) });
    if(herstelde) NGBewaren.melden(st, function(){
      st = defaults(st.type); renderPresets(); render(); updateHero('material');
    });
  }

  var heroImg=$('#confHero'); if(heroImg) heroImg.style.transition='opacity .18s ease';
  /* De beeldbank komt met defer binnen en bepaalt wélke gevelkleuren er zijn.
     Tekenen voordat hij er is levert een lege kleurgroep op die daarna nooit
     meer terugkomt — er is immers geen reden om opnieuw te tekenen. */
  function start(pogingen){
    if(!window.NGDakopbouwBeelden && pogingen>0){ return setTimeout(function(){ start(pogingen-1); },50); }
    renderPresets(); render(); updateHero('material');
  }
  start(60);

  /* Het bedrijfsbestand komt met een fetch binnen en is er dus bijna altijd
     later dan de eerste tekening. Zodra het er is: onze navigatie eraf, zijn
     naam en kleur erop, de keuzes langs zijn assortiment, en opnieuw tekenen.
     Zonder bedrijf gebeurt er niets — dan is dit de demonstratiepagina van
     Next Growth en hoort onze eigen navigatie er juist wél omheen. */
  if(window.NGMerk) NGMerk.klaar(function(m){
    if(m.demo) return;
    ['klantkop','klantvoet'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.hidden=false;
    });
    // De regel "demonstratie" hoort niet op de site van een bedrijf dat
    // ermee werkt; die staat er alleen zolang het een opzet is.
    var lint=document.getElementById('klantlint'); if(lint) lint.hidden=!!m.live;
    KORT=Array.isArray(m.stappen)&&m.stappen.length?m.stappen:null;
    GEEN_PRIJS=m.prijzen===false;
    if(GEEN_PRIJS){
      document.documentElement.setAttribute('data-geen-prijs','');
      var h1=document.querySelector('.cfg-hero .h1'), lede=document.querySelector('.cfg-hero .lede');
      if(h1) h1.innerHTML='Stel je dakopbouw samen <span class="grad-text">en vraag direct een offerte aan.</span>';
      if(lede) lede.textContent='Kies de afmetingen, de gevel, de kozijnen en de afwerking. Je ziet je dakopbouw meteen in beeld en ontvangt een offerte op maat.';
      if(m.vanafPrijs&&lede&&!document.getElementById('vanafPrijs')){
        var vp=document.createElement('p'); vp.id='vanafPrijs'; vp.className='vanaf'; vp.textContent=m.vanafPrijs; lede.parentNode.insertBefore(vp,lede.nextSibling);
      }
    }
    if(m.stapsgewijs) document.documentElement.setAttribute('data-stapsgewijs','');
    if(KORT){
      document.documentElement.setAttribute('data-kort','');
      var meer=document.getElementById('meerOpties');
      if(meer){
        meer.hidden=false;
        meer.addEventListener('click',function(){
          var alles=$('#groups').classList.toggle('is-alles');
          meer.textContent=alles?'Minder opties tonen':'Meer opties tonen';
          meer.setAttribute('aria-expanded',alles?'true':'false');
        });
      }
      // Voor een advertentiebezoeker is het telefoonnummer de kortste weg
      // naar een afspraak; dat vragen we dan ook echt.
      var tel=document.getElementById('f_tel'); if(tel) tel.required=true;
    }
    normaliseerMerk();
    start(60);
  });

  /* De keuzes bereikbaar maken voor de AI-foto onderaan de pagina. De
     configurator draait in zijn eigen scope; zonder deze regel ziet de
     fotomodule geen enkele keuze en stuurt hij een lege beschrijving mee. */
  window.NGKeuze = function () { return typeof st === 'undefined' ? null : st; };
  window.NGHertekenen = function () { if (typeof render === 'function') render(); };
  /* Gevel- en kozijnstaaltjes voor het tekenprogramma. Het leest ze hier op
     in plaats van ze over te schrijven, zodat er één tabel is die bepaalt
     welke kleur "antraciet" is. */
  window.NGPaletBron = function () {
    var uit = {};
    Object.keys(GEVELKLEUR).forEach(function (k) { if (GEVELKLEUR[k].sw) uit[k] = GEVELKLEUR[k].sw; });
    FRAME.forEach(function (k) { if (k.sw && !uit[k.v]) uit[k.v] = k.sw; });
    return uit;
  };
  window.NGVertaal = tt;

})();

  
