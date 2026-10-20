/* Het tekenprogramma achter de bouwconfigurators: alle aanzichten getekend
 * uit de maten, niet gekozen uit een mapje met PDF's.
 *
 * WAAROM DIT ER IS
 * De jachtconfigurator tekent zijn schip. Elke combinatie van lengte,
 * breedte, dektype en aantal hutten levert daar meteen een kloppend
 * zij-, boven- en vooraanzicht op, omdat de tekening uit de maten volgt en
 * niet uit een renderopdracht. Bij de uitbouw stond daar tot nu toe een
 * foto van een andere uitbouw: mooi, maar het is niet de uitbouw die de
 * bezoeker zojuist heeft samengesteld. Vier meter breed of zes maakt op
 * die foto geen verschil, en dat is precies het verschil waar de koper
 * over twijfelt.
 *
 * Deze module doet voor de bouwproducten wat jachtaanzichten.js voor de
 * schepen doet: uit `NGKeuze()` en `NGBouwkundig.model()` rolt een set
 * getekende aanzichten die bij elke schuif van een maatregelaar meebeweegt.
 *
 * WAT HET WEL EN NIET IS
 * Dit is een VOORONTWERP-tekening op verkoopniveau: maatvast, met echte
 * maatlijnen en echte opbouwdiktes uit de bouwkundige kern, maar geen
 * uitvoeringstekening. Alles wat de module niet zeker weet, zegt hij ook
 * niet: is er geen pui gekozen, dan staat de gevel dicht met die mededeling
 * eronder in plaats van een verzonnen raam. Staat er een maatwerk-lichtstraat
 * in de configuratie, dan komt er geen maat op de tekening te staan.
 * De uitvoeringsbladen blijven bij NGTekeningen (technische-tekeningen-*.js);
 * die dragen het stempel VOORONTWERP en horen dat te blijven dragen.
 *
 * DRIE SOORTEN, ÉÉN TEKENING
 *   aangebouwd   uitbouw en aanbouw: drie nieuwe wanden, de vierde zijde is
 *                de bestaande gevel met de doorbraak erin.
 *   vrijstaand   mantelzorgwoning, vakantiewoning, tuinstudio: vier wanden,
 *                geen doorbraak, eigen fundering.
 *   dakopbouw    staat op de bestaande woning: geen grondwerk, wel een
 *                trapgat en een bestaande verdieping eronder.
 * De soort bepaalt wát er getekend wordt, niet hoe. Alle drie lopen door
 * dezelfde acht aanzichten.
 *
 * MAATCONVENTIE
 * `h` uit de configurator is de dakrandhoogte boven de afgewerkte vloer
 * (peil +-0,000) — dezelfde afspraak als in technische-tekeningen-aanbouw.js,
 * waar +h DAKRAND op het gevelaanzicht staat. De vrije binnenhoogte volgt
 * daaruit door de dakopbouw eraf te halen; die staat als afgeleide maat op
 * de doorsnede en nergens als "gegeven".
 */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- taal --- */

  /* De pagina's kennen een Vlaamse modus waarin stucwerk pleisterwerk heet en
     een kozijn schrijnwerk. Die vertaaltabel staat in de configurator zelf.
     Zet de pagina hem hier neer, dan gaat elke tekst op de tekening er langs;
     doet ze dat niet, dan verandert er niets. */
  var vertaler = null;
  function T(s) {
    /* De configurator zet haar vertaalfunctie als `NGVertaal` neer. Dat gaat
       via een globale en niet via een aanroep, omdat het inline script van de
       pagina eerder draait dan deze module met defer geladen wordt — een
       aanroep zou dan op een module mikken die er nog niet is. */
    var fn = vertaler || (typeof global.NGVertaal === 'function' ? global.NGVertaal : null);
    return fn ? fn(s) : s;
  }

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  /* Een maat in meters met de Nederlandse komma. Twee decimalen: bouwmaten
     worden in centimeters besproken en 3,5 m leest als "ergens rond 3,5". */
  function m2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ','); }
  function m1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
  function mm(x) { return String(Math.round(x * 1000)); }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }

  /* ------------------------------------------------------------- palet ----- */

  /* Kleurnamen komen uit de configurators; de staaltjes staan daar bij de
     keuzelijsten. Deze tabel is de terugval zodat de module ook los te
     testen is. Zet de pagina `NGBouwAanzichten.palet({...})` neer met haar
     eigen staaltjes, dan gaan die voor — dan kan er geen tweede waarheid
     ontstaan over wat "antraciet" is. */
  var PALET = {
    wit: '#F2F0EA', 'wit-zwart': '#D9D9D9', creme: '#E8DFCB', lichtgrijs: '#C3C4C2',
    grijs: '#9A9C99', taupe: '#8F8171', antraciet: '#383E42', zwart: '#141416',
    grafiet: '#3A3A3C', rood: '#8B3A2E', roodbruin: '#7A4436', geel: '#D4AF37',
    zand: '#C8A870', donkerbruin: '#4A3527', donkergroen: '#2D4C3B',
    eiken: '#B08D57', licht: '#DEB887', donker: '#4B3621',
    'licht-eiken': '#B79063', 'warme-ceder': '#96603A', 'donker-walnoot': '#4B3524',
    'vergrijsd-hout': '#8C8579', 'antraciet-composiet': '#383E42', 'zwart-composiet': '#161616'
  };
  var PALET_EXTRA = {};
  /* Zet de pagina `NGPaletBron` neer — een functie die haar eigen staaltjes
     teruggeeft — dan is dát de waarheid over kleurnamen en is de tabel
     hierboven alleen nog terugval. Eén keer uitgelezen: de keuzelijsten van
     een configurator veranderen niet tijdens het bezoek. */
  var bronFn = null, bronMap = null;
  function bron() {
    if (typeof global.NGPaletBron !== 'function') return null;
    if (global.NGPaletBron !== bronFn) { bronFn = global.NGPaletBron; bronMap = global.NGPaletBron() || {}; }
    return bronMap;
  }
  function kleur(naam, terugval) {
    var B = bron();
    if (naam && B && Object.prototype.hasOwnProperty.call(B, naam)) return B[naam];
    if (naam && Object.prototype.hasOwnProperty.call(PALET_EXTRA, naam)) return PALET_EXTRA[naam];
    if (naam && Object.prototype.hasOwnProperty.call(PALET, naam)) return PALET[naam];
    return terugval || '#B9B4AA';
  }

  /* Welke gevel welke tekening krijgt. De naam ernaast is wat er in de
     legenda komt te staan — de configurators noemen hetzelfde materiaal niet
     overal hetzelfde ("classic-brick" tegenover "metselwerk"), de tekening
     wel. */
  var GEVELS = {
    'classic-brick': { tex: 'baksteen', naam: 'Metselwerk (keramische steenstrips)' },
    metselwerk:      { tex: 'baksteen', naam: 'Metselwerk (keramische steenstrips)' },
    'stuc-modern':   { tex: 'stuc',     naam: 'Gevelpleister op buitenisolatie' },
    stucwerk:        { tex: 'stuc',     naam: 'Gevelpleister op buitenisolatie' },
    'modern-wood':   { tex: 'hout',     naam: 'Houten gevelbekleding, verticaal' },
    hout:            { tex: 'hout',     naam: 'Houten gevelbekleding' },
    keralit:         { tex: 'paneel',   naam: 'Keralit sponningdeel' },
    composite:       { tex: 'paneel',   naam: 'Composiet gevelbekleding' },
    houtcomposiet:   { tex: 'paneel',   naam: 'Hout-/composietbekleding' },
    natuursteen:     { tex: 'steen',    naam: 'Natuursteen' }
  };

  var DAKEN = {
    epdm:                { naam: 'EPDM dakbedekking', kleur: '#3A3D3F' },
    bitumen:             { naam: 'Bitumen, tweelaags gebrand', kleur: '#2E2E30' },
    'white-roofing':     { naam: 'Witte bitumen (reflecterend)', kleur: '#E7E5DE' },
    green:               { naam: 'Sedum begroeid dak', kleur: '#5F7A4A' },
    'plat-dak-overstek': { naam: 'Plat dak met overstek', kleur: '#3A3D3F', overstek: 0.5 }
  };

  /* ------------------------------------------------------- configuratie ---- */

  /* Kozijnwaarden dragen hun maat in de naam: schuifpui-400 is vier meter.
     Dat is geen toeval maar de afspraak in beide configurators, en het is de
     enige plek waar de breedte van de pui vandaan komt. Staat er geen getal
     achter (volledig-glas, maatwerk), dan is de maat niet uit de keuze af te
     leiden en zegt de tekening dat. */
  function puiUitWaarde(v, w) {
    if (!v || v === 'none') return null;
    var soortNaam = {
      'schuifpui': 'Schuifpui', 'dubbele-schuifpui': 'Dubbele schuifpui',
      'openslaande': 'Openslaande deuren', 'harmonica': 'Harmonicakozijn',
      'volledig-glas': 'Glazen wand', 'model01': 'Schuifpui',
      'model02': 'Openslaande deuren', 'model03': '2-vaks + 3-vaks kozijn',
      'model04': 'Klein + 2-vaks kozijn'
    };
    var cm = /-(\d{3})$/.exec(v);
    var stam = cm ? v.slice(0, v.length - 4) : v;
    var naam = soortNaam[stam] || stam;
    /* De glazen wand loopt over de volle gevel op de stijlen na; de vier
       dakopbouw-modellen zijn vaste indelingen zonder maat in de naam. Voor
       die gevallen volgt de breedte uit de gevel zelf. */
    var vast = {
      'volledig-glas': Math.max(2, w - 0.6),
      model01: Math.min(3.6, Math.max(2.4, w - 1.2)),
      model02: Math.min(2.4, Math.max(1.6, w - 1.4)),
      model03: Math.min(4.2, Math.max(2.4, w - 1.0)),
      model04: Math.min(3.6, Math.max(2.2, w - 1.2))
    };
    var breedte = cm ? Number(cm[1]) / 100 : (vast[stam] || null);
    return {
      soort: stam, naam: naam, breedte: breedte,
      /* Breedte uit de keuze zelf, of afgeleid uit de gevel. Het verschil
         hoort op de tekening te staan: een maatlijn onder een afgeleide maat
         is een maatlijn die liegt. */
      gegeven: !!cm,
      /* Deuren en schuifpuien lopen tot de vloer, kozijnen niet. */
      totVloer: stam !== 'model03' && stam !== 'model04',
      vakken: stam === 'model03' ? 5 : (stam === 'model04' ? 3 :
              (stam === 'dubbele-schuifpui' ? 4 : (stam === 'harmonica' ? 5 :
              (stam === 'openslaande' || stam === 'model02' ? 2 : 3))))
    };
  }

  /* Lichtstraten dragen hun maat op twee manieren in de naam: glasplaat-300
     is 1 x 3 m, skylight-1x3 net zo. Maatwerk heeft geen maat en krijgt er
     geen. */
  function lichtUitWaarde(v) {
    if (!v || v === 'none') return null;
    var a = /^skylight-(\d)x(\d)$/.exec(v);
    if (a) return { breedte: Number(a[2]), diepte: Number(a[1]), naam: 'Lichtstraat', gegeven: true };
    var b = /-(\d{3})$/.exec(v);
    if (b) return {
      breedte: Number(b[1]) / 100, diepte: 1,
      naam: v.indexOf('vakverdeling') === 0 ? 'Lichtstraat met vakverdeling' : 'Lichtstraat, glasplaat',
      gegeven: true
    };
    return { breedte: null, diepte: null, naam: 'Lichtstraat op maat', gegeven: false };
  }

  function soortVan(cfg) {
    var t = cfg.type || 'uitbouw';
    if (t === 'op-aanbouw' || t === 'op-woning' || t === 'optopping') return 'dakopbouw';
    if (t === 'mantelzorgwoning' || t === 'vakantiewoning' || t === 'tuinstudio') return 'vrijstaand';
    return 'aangebouwd';
  }

  var SOORTNAAM = {
    uitbouw: 'Uitbouw', aanbouw: 'Aanbouw', mantelzorgwoning: 'Mantelzorgwoning',
    vakantiewoning: 'Vakantiewoning', tuinstudio: 'Tuinstudio',
    'op-aanbouw': 'Dakopbouw op de aanbouw', 'op-woning': 'Dakopbouw op de woning',
    optopping: 'Optopping'
  };

  function dikte(lagen) {
    var s = 0;
    (lagen || []).forEach(function (l) { s += num(l[1], 0); });
    return s / 1000;
  }

  /* De configuratie en het bouwkundige model samengevoegd tot precies wat een
     tekening nodig heeft — één plek waar keuzes maten worden, zodat acht
     aanzichten niet acht keer hun eigen interpretatie verzinnen. */
  function lees(cfg, m) {
    cfg = cfg || {};
    m = m || {};
    var soort = soortVan(cfg);
    var w = Math.max(1, num(cfg.w, num(m.breedte, 4)));
    var dp = Math.max(1, num(cfg.dp, num(m.diepte, 3)));
    var h = Math.max(2.1, num(cfg.h, num(m.hoogte, 2.8)));
    var gsleutel = cfg.material || m.material || 'keralit';
    var gevel = GEVELS[gsleutel] || GEVELS.keralit;
    var dsleutel = cfg.roofing || m.roofing || 'epdm';
    var dak = DAKEN[dsleutel] || DAKEN.epdm;
    /* De uitbouw kent twee kozijngroepen naast elkaar: `accent` in de
       aanbouwconfigurator en `kozijnindeling` in de dakopbouw. Ze sluiten
       elkaar uit, dus de eerste die gevuld is wint. */
    var pui = puiUitWaarde(cfg.kozijnindeling || cfg.accent, w);
    /* De plattegrondvorm. Zonder de vormmodule blijft het een rechthoek, en
       dan verandert er niets aan wat er eerder stond. */
    var V = global.NGBouwvormen;
    var vorm = V ? V.lees({ vorm: cfg.vorm, w: w, dp: dp, hoekB: cfg.hoekB, hoekD: cfg.hoekD })
                 : { vorm: 'rechthoek', w: w, dp: dp, hap: { b: 0, d: 0 },
                     punten: [[0, 0], [w, 0], [w, dp], [0, dp]], opp: w * dp, omtrek: 2 * (w + dp),
                     afgesneden: 0, hoeken: 4 };
    var wandD = dikte(m.wand && m.wand.lagen);
    var dakD = dikte(m.daklagen || m.dakopbouw);
    var vloerD = dikte(m.vloeropbouw);
    /* Past de gekozen pui eigenlijk wel in deze gevel? De keuzelijst kent de
       breedte van de uitbouw niet, dus een schuifpui van vier meter is daar
       gewoon aan te vinken in een gevel van vier meter buitenwerks — en die
       is binnenwerks twee wanddiktes smaller. De tekening is de eerste plek
       waar dat opvalt, dus is het ook de plek die het zegt: de pui wordt
       teruggebracht tot wat er past en de mededeling gaat mee naar de noot.
       Zwijgen en hem toch op maat tekenen zou een gevel opleveren die niet
       te bouwen is. */
    var wandTek = wandD || 0.30;
    if (pui && pui.breedte) {
      pui.maxBreedte = Math.round((w - 2 * wandTek - 0.10) * 100) / 100;
      pui.past = pui.breedte <= pui.maxBreedte;
      pui.tekenBreedte = pui.past ? pui.breedte : Math.max(0.9, pui.maxBreedte);
    }
    return {
      soort: soort,
      type: cfg.type || 'uitbouw',
      typeNaam: SOORTNAAM[cfg.type] || 'Aanbouw',
      w: w, dp: dp, h: h,
      /* Het oppervlak komt uit de vorm en niet uit breedte maal diepte: bij
         een L-vorm scheelt dat zomaar drie vierkante meter, en dat is precies
         het getal waar de prijs en de vergunningvrije grens aan hangen. */
      opp: Math.round(vorm.opp * 10) / 10,
      vorm: vorm,
      bouwmethode: m.bouwmethode || (cfg.bouwmethode === 'traditioneel' ? 'traditioneel' : 'hsb'),
      rc: m.rc || null,
      gevel: {
        sleutel: gsleutel, tex: gevel.tex, naam: gevel.naam,
        kleur: kleur(cfg.facadeColor, '#C3C4C2'), kleurnaam: cfg.facadeColor || 'onbepaald'
      },
      kozijnkleur: kleur(cfg.frameColor, '#383E42'),
      kozijnkleurnaam: cfg.frameColor || 'antraciet',
      pui: pui,
      licht: lichtUitWaarde(cfg.skylight),
      dak: { sleutel: dsleutel, naam: dak.naam, kleur: dak.kleur, overstek: dak.overstek || 0 },
      /* De doorbraak volgt dezelfde regel als de balkberekening in
         staalligger.js: 58% van de breedte, hoogstens vier meter. Twee
         verschillende breedtes voor dezelfde doorbraak in één dossier is
         erger dan een doorbraak die aan de veilige kant is aangenomen. */
      doorbraak: soort === 'aangebouwd' ? Math.min(w * 0.58, 4.0) : 0,
      trapgat: soort === 'dakopbouw' && !!(cfg.fundering && cfg.fundering['trap-nieuw']),
      fundering: m.funderingType || ((cfg.fundering && cfg.fundering['fundering-heipalen']) ? 'palen'
                : ((cfg.fundering && cfg.fundering['fundering-poeren']) ? 'poeren' : 'stroken')),
      wandDikte: wandD, dakDikte: dakD, vloerDikte: vloerD,
      /* Vrije binnenhoogte is een afgeleide maat, geen gegeven: h is de
         dakrand, de dakopbouw zit daar tussen. Is de opbouw niet bekend
         (geen bouwkundig model geladen) dan blijft hij leeg en zegt de
         doorsnede dat. */
      binnenhoogte: dakD ? Math.round((h - dakD) * 100) / 100 : null,
      kamerplan: m.kamerplan || null,
      /* Wat de bezoeker zelf heeft neergezet. Leeg betekent "nog niets
         aangeraakt" en dan tekent het programma zijn eigen voorstel; een lege
         lijst betekent "alles weggehaald" en dat blijft dus ook leeg. */
      eigenKozijnen: Array.isArray(cfg.kozijnen) ? cfg.kozijnen : null,
      eigenInrichting: Array.isArray(cfg.inrichting) ? cfg.inrichting : null,
      wand: m.wand || null,
      daklagen: m.daklagen || m.dakopbouw || null,
      vloeropbouw: m.vloeropbouw || null,
      project: m.project || '', datum: m.datum || ''
    };
  }


  /* ------------------------------------------------- tekengereedschap ----- */

  /* Elk aanzicht is 1200 x 660. Dat is dezelfde verhouding als het doek van
     de jachtconfigurator, zodat een tekening en een foto in hetzelfde vlak
     passen zonder dat de pagina opspringt als er straks renders bij komen. */
  var VB_W = 1200, VB_H = 660;
  var teller = 0;

  function blad(inhoud, extraDefs) {
    var u = 'ng' + (++teller);
    return { u: u, inhoud: inhoud, defs: extraDefs || '' };
  }

  /* De maatlijn. Twee schuine streepjes in plaats van pijlpunten: dat is de
     bouwkundige conventie en het leest bij kleine maten beter dan een pijl
     die zichzelf overdekt. Staat de maat niet vast, dan gaat het cijfer
     tussen haakjes en komt er "ca." voor — een maatlijn zonder voorbehoud is
     een belofte. */
  function maatH(x1, x2, y, tekst, klasse) {
    if (x2 < x1) { var t = x1; x1 = x2; x2 = t; }
    var mid = (x1 + x2) / 2;
    return '<g class="' + (klasse || 'maat') + '">' +
      '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/>' +
      '<line x1="' + (x1 - 5) + '" y1="' + (y + 5) + '" x2="' + (x1 + 5) + '" y2="' + (y - 5) + '"/>' +
      '<line x1="' + (x2 - 5) + '" y1="' + (y + 5) + '" x2="' + (x2 + 5) + '" y2="' + (y - 5) + '"/>' +
      '<line x1="' + x1 + '" y1="' + (y - 9) + '" x2="' + x1 + '" y2="' + (y + 9) + '"/>' +
      '<line x1="' + x2 + '" y1="' + (y - 9) + '" x2="' + x2 + '" y2="' + (y + 9) + '"/>' +
      '<text x="' + mid + '" y="' + (y - 9) + '" text-anchor="middle" class="maatcijfer">' + esc(tekst) + '</text>' +
      '</g>';
  }
  function maatV(x, y1, y2, tekst, klasse) {
    if (y2 < y1) { var t = y1; y1 = y2; y2 = t; }
    var mid = (y1 + y2) / 2;
    return '<g class="' + (klasse || 'maat') + '">' +
      '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '"/>' +
      '<line x1="' + (x - 5) + '" y1="' + (y1 + 5) + '" x2="' + (x + 5) + '" y2="' + (y1 - 5) + '"/>' +
      '<line x1="' + (x - 5) + '" y1="' + (y2 + 5) + '" x2="' + (x + 5) + '" y2="' + (y2 - 5) + '"/>' +
      '<line x1="' + (x - 9) + '" y1="' + y1 + '" x2="' + (x + 9) + '" y2="' + y1 + '"/>' +
      '<line x1="' + (x - 9) + '" y1="' + y2 + '" x2="' + (x + 9) + '" y2="' + y2 + '"/>' +
      '<text x="' + (x - 10) + '" y="' + mid + '" text-anchor="middle" transform="rotate(-90 ' + (x - 10) + ' ' + mid + ')" class="maatcijfer">' + esc(tekst) + '</text>' +
      '</g>';
  }
  /* Peilmerk: het driehoekje met de hoogte ernaast, zoals op een gevelaanzicht.
     De hoogtes zijn ten opzichte van de afgewerkte vloer van het nieuwe deel. */
  function peil(x1, x2, y, tekst) {
    /* Past het opschrift rechts van het pijltje nog op het blad? Bij een brede
       gevel liep "±0,000 afgewerkte vloer" het blad af en stond er op de
       afdruk "±0,000 afgewerkt". Past het niet, dan gaat hij erboven staan en
       rechts uitgelijnd. */
    var breed = String(tekst).length * 5.8;
    var past = x2 + 12 + breed < VB_W - 12;
    return '<g class="peil"><line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/>' +
      '<path d="M' + (x2 - 7) + ' ' + (y - 8) + ' L' + (x2 + 7) + ' ' + (y - 8) + ' L' + x2 + ' ' + y + ' Z"/>' +
      (past
        ? '<text x="' + (x2 + 12) + '" y="' + (y - 6) + '" class="peiltekst">' + esc(tekst) + '</text>'
        : '<text x="' + (x2 + 6) + '" y="' + (y - 14) + '" text-anchor="end" class="peiltekst">' + esc(tekst) + '</text>') +
      '</g>';
  }
  function titel(t, onder) {
    return '<text x="40" y="46" class="bladtitel">' + esc(T(t)) + '</text>' +
      (onder ? '<text x="40" y="70" class="bladsub">' + esc(T(onder)) + '</text>' : '');
  }
  /* Schaalbalk van twee meter. Hij hoort erbij zodra er op het scherm
     ingezoomd kan worden: dan zegt "1:50" niets meer en twee getekende meters
     wel. */
  function schaalbalk(x, y, s) {
    var e = 1 * s;
    return '<g class="schaalbalk">' +
      '<rect x="' + x + '" y="' + y + '" width="' + e + '" height="7"/>' +
      '<rect x="' + (x + e) + '" y="' + y + '" width="' + e + '" height="7" class="leeg"/>' +
      '<text x="' + x + '" y="' + (y + 22) + '" class="micro">0</text>' +
      '<text x="' + (x + e) + '" y="' + (y + 22) + '" text-anchor="middle" class="micro">1 m</text>' +
      '<text x="' + (x + 2 * e) + '" y="' + (y + 22) + '" text-anchor="end" class="micro">2 m</text></g>';
  }
  function noordpijl(x, y) {
    return '<g class="noord"><circle cx="' + x + '" cy="' + y + '" r="22"/>' +
      '<path d="M' + x + ' ' + (y - 17) + ' L' + (x + 8) + ' ' + (y + 12) + ' L' + x + ' ' + (y + 5) +
      ' L' + (x - 8) + ' ' + (y + 12) + ' Z"/>' +
      '<text x="' + x + '" y="' + (y - 26) + '" text-anchor="middle" class="micro">N</text></g>';
  }

  /* De gevelpatronen. Ze worden per tekening opnieuw gedefinieerd met een
     eigen id, want er kunnen twee aanzichten tegelijk in beeld staan en een
     dubbel id laat de tweede het patroon van de eerste erven. */
  function gevelDefs(u, D) {
    var k = D.gevel.kleur;
    var don = schaduw(k, -0.16), lic = schaduw(k, 0.10);
    var p = '';
    if (D.gevel.tex === 'baksteen') {
      /* Waalformaat: 210 x 50 mm met 10 mm voeg. Op schaal getekend, dus de
         steen wordt kleiner als de gevel breder wordt — precies zoals het op
         een echte tekening hoort. */
      p = '<pattern id="gev' + u + '" width="24" height="12" patternUnits="userSpaceOnUse">' +
          '<rect width="24" height="12" fill="' + k + '"/>' +
          '<line x1="0" y1="6" x2="24" y2="6" stroke="' + lic + '" stroke-width="1.1"/>' +
          '<line x1="0" y1="0" x2="24" y2="0" stroke="' + lic + '" stroke-width="1.1"/>' +
          '<line x1="6" y1="0" x2="6" y2="6" stroke="' + lic + '" stroke-width="1.1"/>' +
          '<line x1="18" y1="6" x2="18" y2="12" stroke="' + lic + '" stroke-width="1.1"/></pattern>';
    } else if (D.gevel.tex === 'hout') {
      p = '<pattern id="gev' + u + '" width="16" height="16" patternUnits="userSpaceOnUse">' +
          '<rect width="16" height="16" fill="' + k + '"/>' +
          '<line x1="0" y1="0" x2="0" y2="16" stroke="' + don + '" stroke-width="2"/>' +
          '<line x1="8" y1="0" x2="8" y2="16" stroke="' + lic + '" stroke-width="1"/></pattern>';
    } else if (D.gevel.tex === 'paneel') {
      p = '<pattern id="gev' + u + '" width="20" height="18" patternUnits="userSpaceOnUse">' +
          '<rect width="20" height="18" fill="' + k + '"/>' +
          '<line x1="0" y1="17.4" x2="20" y2="17.4" stroke="' + don + '" stroke-width="1.4"/></pattern>';
    } else if (D.gevel.tex === 'steen') {
      p = '<pattern id="gev' + u + '" width="34" height="18" patternUnits="userSpaceOnUse">' +
          '<rect width="34" height="18" fill="' + k + '"/>' +
          '<path d="M0 9h34M0 0h34M11 0v9M25 9v9" stroke="' + lic + '" stroke-width="1.1" fill="none"/></pattern>';
    } else {
      /* Stucwerk is vlak. Een korrel erin tekenen zou het patroon zijn dat op
         de tekening juist niet hoort te staan. */
      p = '<pattern id="gev' + u + '" width="10" height="10" patternUnits="userSpaceOnUse">' +
          '<rect width="10" height="10" fill="' + k + '"/></pattern>';
    }
    /* Bestaande bouw wordt gearceerd getekend, nieuw werk niet: de conventie
       waarmee een aannemer in één oogopslag ziet wat er bij komt. */
    p += '<pattern id="best' + u + '" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
         '<rect width="9" height="9" fill="#EFEDE7"/>' +
         '<line x1="0" y1="0" x2="0" y2="9" stroke="#B6B1A6" stroke-width="1.1"/></pattern>';
    p += '<pattern id="grond' + u + '" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">' +
         '<rect width="12" height="12" fill="#E6E2D8"/>' +
         '<line x1="0" y1="0" x2="0" y2="12" stroke="#C0BAAC" stroke-width="1"/></pattern>';
    p += '<pattern id="iso' + u + '" width="8" height="8" patternUnits="userSpaceOnUse">' +
         '<rect width="8" height="8" fill="#F6E8B8"/>' +
         '<circle cx="4" cy="4" r="1.5" fill="#DDC377"/></pattern>';
    return p;
  }

  /* Een kleur lichter of donkerder maken zonder een kleurenbibliotheek: de
     voegen en de schaduwzijde van het volume moeten zich naar de gekozen
     gevelkleur voegen, anders staat er een grijze voeg in een zwarte gevel. */
  function schaduw(hex, f) {
    var h = String(hex || '#999').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    function mix(c) {
      var v = f < 0 ? c * (1 + f) : c + (255 - c) * f;
      return Math.max(0, Math.min(255, Math.round(v)));
    }
    function hh(c) { var s = mix(c).toString(16); return s.length < 2 ? '0' + s : s; }
    return '#' + hh(r) + hh(g) + hh(b);
  }

  function stijlen() {
    return '<style>' +
      /* Opschriften zijn aantekeningen en geen doelen. Zonder deze regel
         onderschept de ruimtenaam met zijn witte plaatje de klik op het meubel
         eronder, en dan pakt de bezoeker in de bewerker de tekst in plaats van
         zijn bank. */
      'text,.ruimtenaam,.ruimteopp,.micro,.maatcijfer,.kozijnmaat,.kozijnletter,' +
      '.peiltekst,.waarschuwing,.legenda,.maat{pointer-events:none}' +
      'text{font-family:"Inter",Arial,Helvetica,sans-serif;fill:#1B1B1B}' +
      '.bladtitel{font-size:23px;font-weight:800;letter-spacing:.2px}' +
      '.bladsub{font-size:13px;fill:#6B6A65}' +
      '.micro{font-size:10px;fill:#6B6A65;letter-spacing:.4px}' +
      '.maatcijfer{font-size:13px;font-weight:700;fill:#2A2A2A}' +
      '.peiltekst{font-size:11px;font-weight:700;fill:#176C7C}' +
      '.ruimte{font-size:13px;font-weight:800;fill:#26251F}' +
      '.ruimteopp{font-size:11px;fill:#6B6A65}' +
      '.legenda{font-size:12px;fill:#31302B}.legendakop{font-size:11px;font-weight:800;letter-spacing:.8px;fill:#8A857A}' +
      '.laagtekst{font-size:11px;fill:#31302B}.laagmm{font-size:11px;font-weight:700;fill:#1B1B1B}' +
      '.maat line{stroke:#7A756A;stroke-width:1.1;fill:none}' +
      '.maat--ca line{stroke-dasharray:6 4}' +
      '.peil line{stroke:#176C7C;stroke-width:1.2;stroke-dasharray:9 5}.peil path{fill:#176C7C}' +
      /* Deze klassen zetten met opzet géén fill: een fill in een klasse wint
         van het fill-attribuut op de vorm zelf, en dan staat elke gevel leeg
         terwijl er in de code een baksteenpatroon aan hangt. Vormen die niet
         gevuld mogen worden krijgen fill="none" op de vorm. */
      '.nieuw{stroke:#1B1B1B;stroke-width:2.4}' +
      '.dik{stroke:#1B1B1B;stroke-width:4}' +
      '.bestaand{stroke:#8E897E;stroke-width:1.6}' +
      '.dun{stroke:#8E897E;stroke-width:1}' +
      '.stippel{stroke:#8E897E;stroke-width:1.2;stroke-dasharray:8 5}' +
      '.snede{stroke:#A32323;stroke-width:1.8;stroke-dasharray:12 6}' +
      '.glas{fill:#DCEEF4;fill-opacity:.85}' +
      '.schaalbalk rect{fill:#1B1B1B;stroke:#1B1B1B;stroke-width:1}.schaalbalk .leeg{fill:#fff}' +
      '.noord circle{fill:#fff;stroke:#8E897E;stroke-width:1.2}.noord path{fill:#1B1B1B}' +
      '.waarschuwing{font-size:12px;font-weight:700;fill:#A32323}' +
      '.kozijnmaat{font-size:9px;font-weight:600;fill:#4A4740;letter-spacing:.2px}' +
      '.kozijnletter{font-size:10px;font-weight:800;fill:#2A2A2A}' +
      '</style>';
  }

  /* Elk aanzicht komt als compleet SVG-document terug, zodat hetzelfde
     resultaat op het scherm, in de afdruk en in een los bestand past. */
  /* tf is de omrekening van meters naar tekenpunten: x = x0 + m * s. Hij gaat
     als attribuut mee de tekening in, zodat de bewerker een muispositie kan
     terugrekenen naar meters zonder de opzet van het blad te hoeven kennen. */
  function svgDoc(u, D, inhoud, extraDefs, tf) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" ' +
      (tf ? 'data-tf="' + tf.x0 + ',' + tf.y0 + ',' + tf.s + '" ' : '') +
      'role="img" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto">' +
      '<defs>' + gevelDefs(u, D) + (extraDefs || '') + '</defs>' + stijlen() +
      '<rect width="' + VB_W + '" height="' + VB_H + '" fill="#FBFAF7"/>' + inhoud + '</svg>';
  }

  /* Het tekenvlak passend maken. Alle aanzichten rekenen met meters en laten
     deze functie bepalen hoeveel punten dat op het scherm zijn, zodat de
     schaal van de tekening één plek heeft en de schaalbalk er altijd bij
     klopt. */
  function pas(breedteM, hoogteM, opt) {
    opt = opt || {};
    var L = num(opt.links, 150), R = num(opt.rechts, 150);
    var TOP = num(opt.boven, 150), BOT = num(opt.onder, 150);
    var bb = VB_W - L - R, bh = VB_H - TOP - BOT;
    var s = Math.min(bb / breedteM, bh / hoogteM);
    var w = breedteM * s, h = hoogteM * s;
    var x0 = L + (bb - w) / 2;
    var y1 = TOP + (bh - h) / 2 + h;
    return { s: s, x0: x0, x1: x0 + w, y0: y1 - h, y1: y1, w: w, h: h };
  }

  /* De breukstreep. Een dakopbouw staat op twee bouwlagen die niet worden
     verkocht; die volledig meetekenen kost tweederde van het blad en laat het
     product als een postzegel achter. De bouwkundige oplossing is de gevel
     afbreken met een breukstreep: iedereen leest dat als "dit loopt door".
     De zigzag loopt door de gevel heen, dus hij wordt eróver getekend. */
  function breukstreep(x1, x2, y) {
    var d = [], stap = 26, hoog = 9, aan = true;
    d.push('M' + x1 + ' ' + y);
    for (var x = x1; x < x2; x += stap) {
      var xe = Math.min(x + stap, x2);
      d.push('L' + ((x + xe) / 2) + ' ' + (y + (aan ? -hoog : hoog)));
      d.push('L' + xe + ' ' + y);
      aan = !aan;
    }
    /* Wit eronder, zodat de arcering van de bestaande bouw er niet doorheen
       loopt en de streep als een echte afbreking leest. */
    return '<rect x="' + x1 + '" y="' + (y + 1) + '" width="' + (x2 - x1) + '" height="14" fill="#FBFAF7"/>' +
           '<path d="' + d.join(' ') + '" fill="none" stroke="#3A3833" stroke-width="1.6"/>';
  }

  /* Een tekening met role="img" en verder niets heet bij een schermlezer
     "afbeelding". Dat is precies zo nuttig als het klinkt. Titel en noot gaan
     er als <title> en <desc> in, en de svg verwijst ernaar — dan hoort iemand
     "Uitbouw — plattegrond" en de zin eronder in plaats van niets. Het helpt
     ook het losse SVG-bestand: dat draagt zijn eigen omschrijving mee. */
  function benoem(svg, titel, noot) {
    if (!svg) return svg;
    var id = 't' + (++teller);
    var kop = '<title id="' + id + '">' + esc(titel || 'Bouwtekening') + '</title>' +
              (noot ? '<desc id="d' + id + '">' + esc(noot) + '</desc>' : '');
    return svg.replace('role="img"', 'role="img" aria-labelledby="' + id + (noot ? ' d' + id : '') + '"')
              .replace(/(<svg[^>]*>)/, '$1' + kop);
  }

  function grondlijn(y, x1, x2) {
    return '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" class="dik"/>' +
      '<rect x="' + x1 + '" y="' + y + '" width="' + (x2 - x1) + '" height="16" fill="#EDEAE1"/>';
  }

  /* ------------------------------------------------------ de gevelvakken --- */

  /* Waar de pui in de gevel staat. Deuren en schuifpuien lopen tot de vloer,
     kozijnen krijgen een borstwering van 900 mm — de maat waarop je er nog
     langs kunt kijken maar er niet uit valt. */
  /* F is het tekenvlak van de gevel (x0, w, y1, s); de pui komt uit D. Die
     twee stonden hier eerder door elkaar, waardoor elke pui op de helft van
     de gevelbreedte werd getekend in plaats van op zijn eigen maat. */
  function puiVak(D, F, breedteM) {
    var P = D.pui || {};
    var boven = Math.max(0.40, D.dakDikte + 0.12);
    var topM = D.h - boven;
    var onderM = P.totVloer ? 0 : 0.90;
    var bM = num(breedteM, 0) || P.tekenBreedte || P.breedte || Math.max(1.2, D.w * 0.5);
    return {
      x: F.x0 + (F.w - bM * F.s) / 2, w: bM * F.s,
      y: F.y1 - topM * F.s, h: (topM - onderM) * F.s,
      breedteM: bM, topM: topM, onderM: onderM
    };
  }

  function tekenPui(u, D, v, vakken) {
    var out = '<rect x="' + v.x + '" y="' + v.y + '" width="' + v.w + '" height="' + v.h + '" class="glas"/>';
    out += '<rect x="' + v.x + '" y="' + v.y + '" width="' + v.w + '" height="' + v.h + '" fill="none" stroke="' +
           D.kozijnkleur + '" stroke-width="6"/>';
    for (var i = 1; i < vakken; i++) {
      var x = v.x + (v.w / vakken) * i;
      out += '<line x1="' + x + '" y1="' + v.y + '" x2="' + x + '" y2="' + (v.y + v.h) +
             '" stroke="' + D.kozijnkleur + '" stroke-width="3.4"/>';
    }
    /* De glansstreep: één schuine lijn per vak. Zonder die streep leest een
       glasvlak op een zwart-wit afdruk als een gat in de gevel. */
    for (var j = 0; j < vakken; j++) {
      var vx = v.x + (v.w / vakken) * j, vw = v.w / vakken;
      out += '<line x1="' + (vx + vw * 0.18) + '" y1="' + (v.y + v.h - 8) + '" x2="' + (vx + vw * 0.72) + '" y2="' + (v.y + 10) +
             '" stroke="#FFFFFF" stroke-width="2.4" stroke-opacity=".7"/>';
    }
    return out;
  }

  /* ------------------------------------------------------- vooraanzicht --- */

  /* De gevelbanden van een vorm met een hap: per stuk breedte de wand die het
     dichtst bij de kijker staat. Bij een rechthoek is dat er één en verandert
     er niets; bij een L-vorm zijn het er twee, en dan hoort het
     gevelaanzicht die stap ook te laten zien in plaats van één gladde muur te
     tekenen die er niet is. */
  function gevelBanden(D, richting) {
    var V = global.NGBouwvormen;
    var lengte = richting === 'y' ? D.w : D.dp;
    if (!V || !D.vorm) return [{ van: 0, tot: lengte, diepte: richting === 'y' ? D.dp : D.w, voorste: true }];
    var b = V.banden(D.vorm.punten, richting);
    if (!b.length) return [{ van: 0, tot: lengte, diepte: richting === 'y' ? D.dp : D.w, voorste: true }];
    var diepste = b[b.length - 1].diepte;
    return b.map(function (r) {
      return { van: r.van, tot: r.tot, diepte: r.diepte, voorste: Math.abs(r.diepte - diepste) < 1e-6,
               terug: Math.round((diepste - r.diepte) * 100) / 100 };
    });
  }

  /* Eén band tekenen: gevelvlak, dakrand erboven, en bij een terugliggende
     band een sluier eroverheen zodat de diepte zichtbaar wordt zonder dat er
     een schaduw wordt verzonnen die er niet is. */
  function tekenBand(u, D, x1, x2, gy, gb, s) {
    var out = '<rect x="' + x1 + '" y="' + gy + '" width="' + (x2 - x1) + '" height="' + (gb - gy) +
              '" fill="url(#gev' + u + ')" class="nieuw"/>';
    var boei = Math.max(12, 0.22 * s);
    out += '<rect x="' + (x1 - 2) + '" y="' + (gy - boei) + '" width="' + (x2 - x1 + 4) + '" height="' + boei +
           '" fill="' + D.dak.kleur + '" class="nieuw"/>';
    return out;
  }
  function sluier(x1, x2, y1, y2) {
    return '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) +
           '" fill="#FBFAF7" fill-opacity=".45"/>';
  }

  /* De kozijnen die in dít aanzicht te zien zijn. Een gevelaanzicht toont één
     kant van het gebouw, dus alleen de kozijnen waarvan de rand die kant op
     wijst horen erop. Zonder deze stap stond een raam dat op de plattegrond
     in de zijgevel zit óók in het vooraanzicht, en dan telt de bezoeker er
     dubbel zoveel als hij heeft.

     `pos` is de plek langs de breedte van het blad, in meters vanaf de
     linkerkant van dat blad. Voor het achteraanzicht wordt hij gespiegeld:
     dat is de andere kant van hetzelfde gebouw, dus wat op de plattegrond
     rechts zit, staat daar links. */
  function gevelKozijnen(D, kant) {
    var INR = inrichting(D);
    var uit = [];
    (INR.kozijnen || []).forEach(function (K) {
      /* De pui heeft zijn eigen tekening in het vooraanzicht, met de
         bandlogica van een L-vorm erin. Twee keer tekenen zou hem verdubbelen. */
      if (K.soort === 'pui') return;
      var r = randNr(INR.randen, K.edge);
      if (!r) return;
      if (kant === 'voor' && !(r.ny > 0.5)) return;
      if (kant === 'achter' && !(r.ny < -0.5)) return;
      if (kant === 'zij' && !(r.nx > 0.5)) return;
      var p = opRand(r, K.t, false);
      var pos = kant === 'zij' ? p[1] : (kant === 'achter' ? D.w - p[0] : p[0]);
      uit.push({ k: K, pos: pos, rand: r });
    });
    uit.sort(function (a, c) { return a.pos - c.pos; });
    return uit;
  }

  /* Eén kozijn in een gevelaanzicht. `F` is het tekenvlak: x0 links, s de
     schaal, vloerY het peil ±0,000. De borstwering komt uit het kozijn zelf,
     dus een deur staat op de vloer en een badkamerraampje hoog in de gevel —
     precies zoals de plattegrond hem heeft opgeslagen. */
  function tekenGevelKozijn(D, F, g) {
    var K = g.k;
    var bw = K.b * F.s, bh = K.h * F.s;
    var x = F.x0 + g.pos * F.s - bw / 2;
    var y = F.vloerY - (num(K.sill, 0) + K.h) * F.s;
    var uit = '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" class="glas"/>';
    uit += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh +
           '" fill="none" stroke="' + D.kozijnkleur + '" stroke-width="' + (K.soort === 'deur' ? 5 : 4) + '"/>';
    /* Een deur krijgt zijn deurnaad en een kruk; anders is hij op een
       gevelaanzicht niet van een laag raam te onderscheiden. */
    if (K.soort === 'deur') {
      uit += '<circle cx="' + (x + bw - 12) + '" cy="' + (y + bh * 0.55) + '" r="3.2" fill="' + D.kozijnkleur + '"/>';
    }
    /* De glansstreep: zonder leest een glasvlak op een zwart-witafdruk als een
       gat in de gevel. */
    uit += '<line x1="' + (x + bw * 0.18) + '" y1="' + (y + bh - 7) + '" x2="' + (x + bw * 0.72) + '" y2="' + (y + 8) +
           '" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity=".7"/>';
    /* Een wit plaatje onder het opschrift. Zonder stond het lichtgrijze
       cijfer op rood metselwerk en was het onleesbaar — een maat die niet te
       lezen is, is geen maat. */
    var tekst = K.code + ' ' + Math.round(K.b * 100) + ' × ' + Math.round(K.h * 100);
    var tb = tekst.length * 5.4 + 12;
    uit += '<rect x="' + (x + bw / 2 - tb / 2) + '" y="' + (y - 18) + '" width="' + tb +
           '" height="14" rx="3" fill="#FBFAF7" fill-opacity=".9" pointer-events="none"/>';
    uit += '<text x="' + (x + bw / 2) + '" y="' + (y - 7) + '" text-anchor="middle" class="micro">' +
           esc(tekst) + '</text>';
    /* Past hij niet onder het dak, dan staat dat er — in het rood, op de
       tekening zelf, en niet alleen in een noot die niemand leest. */
    if (K.past === false) {
      uit += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh +
             '" fill="none" stroke="#9A3412" stroke-width="2.5" stroke-dasharray="6 4"/>';
    }
    return uit;
  }

  /* De kozijnen van dit aanzicht in één keer, plus de zin eronder. Die zin is
     niet cosmetisch: de bezoeker moet weten of hij naar zijn eigen indeling
     kijkt of naar een voorstel. */
  function gevelKozijnenTekenen(D, F, kant, noot) {
    var lijst = gevelKozijnen(D, kant);
    var uit = '';
    lijst.forEach(function (g) { uit += tekenGevelKozijn(D, F, g); });
    var teHoog = lijst.filter(function (g) { return g.k.past === false; }).length;
    if (teHoog && noot) {
      noot.push((teHoog === 1 ? 'Eén kozijn is ' : teHoog + ' kozijnen zijn ') +
        'te hoog voor deze gevel: boven de bovendorpel moet nog de latei en de dakopbouw passen, en dat is ' +
        'hier tot ' + m2(bovenGrens(D)) + ' m boven de vloer. ' +
        (teHoog === 1 ? 'Hij staat ' : 'Ze staan ') + 'rood omlijnd. Kies een lager kozijn of een hogere dakrand.');
    }
    if (lijst.length && noot) {
      noot.push((lijst.length === 1 ? 'Het kozijn in deze gevel staat ' : 'De ' + lijst.length + ' kozijnen in deze gevel staan ') +
        (inrichting(D).eigenGevel
          ? 'op de plek die je zelf op de plattegrond hebt gekozen; breedte en hoogte staan erbij in centimeters.'
          : 'op een voorgestelde plek met standaardmaten: elke verblijfsruimte heeft daglicht nodig. ' +
            'Op de plattegrond kun je ze zelf verschuiven.'));
    }
    return uit;
  }

  function voor(D) {
    var b = blad(), u = b.u;
    /* Drie plaatsingen, één tekening:
         vrijstaand   het volume staat op het maaiveld en verder niets;
         aangebouwd   de bestaande woning staat er gestippeld áchter — hoger
                      en breder, want de uitbouw dekt hem niet af;
         dakopbouw    de bestaande woning staat er gearceerd ónder, want daar
                      staat de opbouw op. Dat is geen decoratie: een koper die
                      zijn dakopbouw op maaiveldniveau getekend ziet, ziet de
                      verkeerde tekening.
       De aangenomen maten van de bestaande bouw staan er met "indicatief" bij
       en worden nergens in een berekening gebruikt. */
    /* Een strook van de woning eronder, afgebroken met een breukstreep — niet
       de volle 5,60 m. Die volle hoogte drukte de dakopbouw terug tot een
       derde van het blad, en de dakopbouw is nu juist wat er verkocht wordt. */
    var ONDER = D.soort === 'dakopbouw' ? 1.4 : 0;
    var ACHTER = D.soort === 'aangebouwd' ? D.h + 2.4 : 0;
    var breed = D.soort === 'vrijstaand' ? D.w : D.w + 1.8;
    var P = pas(breed, Math.max(D.h + ONDER, ACHTER), { onder: 165, boven: 150 });
    var s = P.s;
    var vloerY = P.y1 - ONDER * s;                                // peil ±0,000 van het nieuwe deel
    var gw = D.w * s, gh = D.h * s;
    var gx = P.x0 + (P.w - gw) / 2, gy = vloerY - gh;
    var banden = gevelBanden(D, 'y');
    var out = titel(D.typeNaam + ' · vooraanzicht',
      'Gevel aan de tuinzijde · ' + m2(D.w) + ' × ' + m2(D.h) + ' m · ' + m1(D.opp) + ' m² vloeroppervlak' +
      (banden.length > 1 ? ' · ' + vormNaam(D.vorm.vorm).toLowerCase() : ''));

    if (ONDER) {
      out += '<rect x="' + P.x0 + '" y="' + vloerY + '" width="' + P.w + '" height="' + (ONDER * s) +
             '" fill="url(#best' + u + ')" class="bestaand"/>';
      out += breukstreep(P.x0, P.x1, P.y1);
      /* Het opschrift ín de band en niet eronder: onder de breukstreep begint
         de maatvoering van de pui, en twee teksten over elkaar helpen niemand. */
      out += '<text x="' + (P.x0 + 12) + '" y="' + (vloerY + 22) + '" class="micro">' +
             esc(T('BESTAANDE WONING: AFGEBROKEN GETEKEND, TWEE BOUWLAGEN ERONDER')) + '</text>';
    } else if (ACHTER) {
      out += '<rect x="' + P.x0 + '" y="' + (P.y1 - ACHTER * s) + '" width="' + P.w + '" height="' + (ACHTER * s) +
             '" fill="url(#best' + u + ')" class="stippel"/>' +
             '<text x="' + (P.x0 + 12) + '" y="' + (P.y1 - ACHTER * s + 22) + '" class="micro">' +
             esc(T('BESTAANDE WONING: INDICATIEF, TER PLAATSE INMETEN')) + '</text>';
    }

    /* Achterste banden eerst, dan de voorste eroverheen. */
    banden.forEach(function (bd) {
      var x1 = gx + bd.van * s, x2 = gx + bd.tot * s;
      out += tekenBand(u, D, x1, x2, gy, vloerY, s);
      if (!bd.voorste) {
        out += sluier(x1, x2, gy - Math.max(12, 0.22 * s), vloerY);
        out += '<text x="' + ((x1 + x2) / 2) + '" y="' + (gy + 26) + '" text-anchor="middle" class="micro">' +
               esc(T('TERUGLIGGEND') + ' ' + m2(bd.terug) + ' m') + '</text>';
        out += '<line x1="' + x1 + '" y1="' + (gy - 14) + '" x2="' + x1 + '" y2="' + vloerY + '" fill="none" class="stippel"/>' +
               '<line x1="' + x2 + '" y1="' + (gy - 14) + '" x2="' + x2 + '" y2="' + vloerY + '" fill="none" class="stippel"/>';
      }
    });
    if (D.dak.overstek) {
      var ov = D.dak.overstek * s, boei0 = Math.max(12, 0.22 * s);
      out += '<rect x="' + (gx - ov) + '" y="' + (gy - boei0 - 8) + '" width="' + (gw + 2 * ov) + '" height="8" fill="' +
             D.dak.kleur + '" class="nieuw"/>';
    }

    var noot = [];
    /* De pui staat in de voorste band, want dat is de gevel die naar de tuin
       kijkt. Bij een L-vorm is die smaller dan de hele breedte, en dan hoort
       de pui daar ook op te passen. */
    var voorste = banden.filter(function (x) { return x.voorste; })[0] || { van: 0, tot: D.w };
    if (D.pui && D.pui.breedte) {
      var bandB = voorste.tot - voorste.van;
      var pbM = Math.min(D.pui.tekenBreedte || D.pui.breedte, Math.max(0.9, bandB - 2 * (D.wandDikte || 0.3) - 0.1));
      var vk = puiVak(D, { x0: gx + voorste.van * s, w: bandB * s, y1: vloerY, s: s }, pbM);
      out += tekenPui(u, D, vk, D.pui.vakken);
      out += maatH(vk.x, vk.x + vk.w, P.y1 + 52,
        T(D.pui.naam) + ' ' + (D.pui.gegeven && pbM === D.pui.breedte ? '' : 'ca. ') + m2(vk.breedteM) + ' m',
        (D.pui.gegeven && pbM === D.pui.breedte) ? 'maat' : 'maat maat--ca');
      if (pbM < D.pui.breedte - 0.005) {
        out += '<text x="300" y="' + (VB_H - 30) + '" class="waarschuwing">' +
               esc('De gekozen ' + T(D.pui.naam).toLowerCase() + ' van ' + m2(D.pui.breedte) +
                   ' m past niet in deze gevel.') + '</text>';
        noot.push('De ' + T(D.pui.naam).toLowerCase() + ' is hier getekend op ' + m2(pbM) +
                  ' m: dat is wat er tussen de wanden van de tuingevel overblijft. Wil je de volle ' +
                  m2(D.pui.breedte) + ' m, kies dan een breder ontwerp of een andere vorm.');
      } else if (!D.pui.gegeven) {
        noot.push('De breedte van dit kozijnmodel staat niet in de keuze zelf; hij volgt hier uit de gevelbreedte ' +
                  'en staat daarom als "ca." op de maatlijn.');
      }
    } else if (!gevelKozijnen(D, 'voor').length) {
      /* Alleen "dicht" als hij ook echt dicht is. Deze mededeling stond
         eerder dwars over een gevel met drie ramen erin, omdat hij alleen naar
         de pui keek — en een tekening die zichzelf tegenspreekt maakt ook de
         rest van het blad ongeloofwaardig. */
      out += '<text x="' + (gx + gw / 2) + '" y="' + (gy + gh / 2) + '" text-anchor="middle" class="micro">' +
             esc(T('GEEN PUI GEKOZEN, GEVEL DICHT GETEKEND')) + '</text>';
      noot.push('Er is nog geen ' + T('kozijn') + ' of pui gekozen, dus staat de gevel hier dicht. ' +
                'Kies er een en hij komt op maat in de tekening te staan.');
    } else {
      noot.push('Er is nog geen pui gekozen; wat je hier ziet zijn de ramen en deuren uit de plattegrond. ' +
                'Kies je alsnog een pui, dan komt die er op maat bij.');
    }

    /* De ramen van de plattegrond horen ook hier te staan. Stonden ze er niet,
       dan zag een bezoeker die er net drie had geplaatst een blinde muur — en
       dan gelooft hij de rest van het blad ook niet meer. */
    out += gevelKozijnenTekenen(D, { x0: gx, s: s, vloerY: vloerY }, 'voor', noot);

    out += maatH(gx, gx + gw, P.y1 + 96, m2(D.w) + ' m');
    if (banden.length > 1) {
      banden.forEach(function (bd) {
        out += maatH(gx + bd.van * s, gx + bd.tot * s, P.y1 + 138, m2(bd.tot - bd.van) + ' m');
      });
      noot.push('De gevel bestaat uit twee vlakken op verschillende diepte; het terugliggende deel staat lichter.');
    }
    out += maatV(gx - 46, gy, vloerY, m2(D.h) + ' m');
    out += peil(gx - 20, gx + gw + 30, vloerY, '±0,000 ' + T(ONDER ? 'vloer dakopbouw' : 'afgewerkte vloer'));
    out += peil(gx - 20, gx + gw + 30, gy, '+' + m2(D.h) + ' ' + T('dakrand'));
    /* Onder een breukstreep hoort geen maaiveld: het maaiveld ligt daar twee
       bouwlagen lager en zou hier een hoogte suggereren die niet klopt. */
    if (!ONDER) out += grondlijn(P.y1, 60, VB_W - 60);
    out += schaalbalk(60, VB_H - 62, s);
    b.svg = svgDoc(u, D, out);
    b.titel = 'Vooraanzicht';
    b.noot = noot.join(' ') || ('De gevel aan de tuinzijde, getekend op de maten die je zojuist hebt gekozen: ' +
      m2(D.w) + ' m breed en ' + m2(D.h) + ' m tot de dakrand. ' +
      (D.soort === 'vrijstaand' ? 'Vrijstaand, dus er staat niets omheen dat de maat vertekent.'
        : D.soort === 'dakopbouw' ? 'De woning eronder is afgebroken getekend: de breukstreep betekent dat de gevel doorloopt tot het maaiveld, twee bouwlagen lager. Zo staat de opbouw zelf groot op het blad; hij is getekend op jouw maten.'
        : 'De bestaande woning staat er gestippeld achter en is indicatief.'));
    return b;
  }

  /* --------------------------------------------------------- zijaanzicht --- */

  function zij(D) {
    var b = blad(), u = b.u;
    var banden = gevelBanden(D, 'x');
    var out = titel(D.typeNaam + ' · zijaanzicht',
      'Diepte ' + m2(D.dp) + ' m · dakrand op +' + m2(D.h) + ' m' +
      (D.soort === 'aangebouwd' ? ' · aansluiting op de bestaande gevel links' : ''));
    var noot = [];
    /* De zijgevel wordt van rechts bekeken; op het blad loopt de diepte van
       links (de woning) naar rechts (de tuin), dus de bandcoördinaten worden
       gespiegeld noch gedraaid — y op de plattegrond is x op dit blad. */
    function tekenVolume(x0, vloerY, s) {
      var uit = '';
      banden.forEach(function (bd) {
        var x1 = x0 + bd.van * s, x2 = x0 + bd.tot * s;
        uit += tekenBand(u, D, x1, x2, vloerY - D.h * s, vloerY, s);
        if (!bd.voorste) {
          uit += sluier(x1, x2, vloerY - D.h * s - Math.max(12, 0.22 * s), vloerY);
          uit += '<text x="' + ((x1 + x2) / 2) + '" y="' + (vloerY - D.h * s + 26) + '" text-anchor="middle" class="micro">' +
                 esc(T('SMALLER') + ' ' + m2(bd.terug) + ' m') + '</text>';
        }
      });
      return uit;
    }

    if (D.soort === 'dakopbouw') {
      /* Een strook van de woning eronder met een breukstreep, niet de volle
         5,60 m: zo staat de dakopbouw groot op het blad in plaats van als
         donker blokje boven twee verdiepingen arcering. */
      var onderH = 1.4;
      var P = pas(D.dp * 1.55, D.h + onderH, { onder: 150, boven: 120 });
      var s = P.s, bw = D.dp * 1.55 * s, bx = P.x0, by = P.y1 - onderH * s;
      out += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + (onderH * s) +
             '" fill="url(#best' + u + ')" class="bestaand"/>';
      out += breukstreep(bx, bx + bw, P.y1);
      out += '<text x="' + (bx + 14) + '" y="' + (by + 22) + '" class="micro">' +
             esc(T('BESTAANDE WONING: AFGEBROKEN GETEKEND, TWEE BOUWLAGEN ERONDER')) + '</text>';
      var nx = bx + (bw - D.dp * s) / 2, nh = D.h * s;
      out += tekenVolume(nx, by, s);
      out += gevelKozijnenTekenen(D, { x0: nx, s: s, vloerY: by }, 'zij', noot);
      out += maatH(nx, nx + D.dp * s, by - nh - Math.max(12, 0.22 * s) - 30, m2(D.dp) + ' m');
      out += maatV(nx - 46, by - nh, by, m2(D.h) + ' m');
      out += peil(nx - 20, nx + D.dp * s + 30, by, '±0,000 ' + T('vloer dakopbouw'));
      out += peil(nx - 20, nx + D.dp * s + 30, by - nh, '+' + m2(D.h) + ' ' + T('dakrand'));
      out += schaalbalk(60, VB_H - 62, s);
      noot.push('De woning eronder is afgebroken getekend: de breukstreep betekent dat de gevel doorloopt ' +
                'tot het maaiveld, twee bouwlagen lager. Die hoogte komt uit de inmeting en verandert niets ' +
                'aan de opbouw zelf, dus staat de opbouw hier op ware grootte en de rest niet.');
    } else if (D.soort === 'aangebouwd') {
      var wonH = D.h + 2.4, wonB = 1.8;
      var P2 = pas(D.dp + wonB, wonH, { onder: 160, boven: 130 });
      var s2 = P2.s, wx = P2.x0, ww = wonB * s2;
      out += '<rect x="' + wx + '" y="' + (P2.y1 - wonH * s2) + '" width="' + ww + '" height="' + (wonH * s2) +
             '" fill="url(#best' + u + ')" class="bestaand"/>';
      out += '<text x="' + (wx + 10) + '" y="' + (P2.y1 - wonH * s2 + 22) + '" class="micro">' + esc(T('BESTAAND')) + '</text>';
      var ux = wx + ww, uh = D.h * s2, uw = D.dp * s2, uy = P2.y1 - uh;
      out += tekenVolume(ux, P2.y1, s2);
      out += gevelKozijnenTekenen(D, { x0: ux, s: s2, vloerY: P2.y1 }, 'zij', noot);
      var boei2 = Math.max(12, 0.22 * s2), ovr = (D.dak.overstek || 0) * s2;
      if (ovr) out += '<rect x="' + (ux + uw) + '" y="' + (uy - boei2) + '" width="' + ovr + '" height="' + boei2 +
                      '" fill="' + D.dak.kleur + '" class="nieuw"/>';
      /* Het afschot van het platte dak: 16 mm per meter is het minimum
         waarmee een plat dak leegloopt. Het staat er getekend en benoemd,
         want een plat dak dat op de tekening waterpas ligt is een plat dak
         waar later water op blijft staan. */
      out += '<line x1="' + (ux + uw) + '" y1="' + (uy - boei2 + 3) + '" x2="' + ux + '" y2="' + (uy - boei2 - D.dp * 0.016 * s2 + 3) +
             '" fill="none" class="stippel"/>' +
             '<text x="' + (ux + uw / 2) + '" y="' + (uy - boei2 - 16) + '" text-anchor="middle" class="micro">' +
             esc(T('AFSCHOT MIN. 16 MM/M NAAR DE AFVOER')) + '</text>';
      out += maatH(ux, ux + uw, P2.y1 + 52, m2(D.dp) + ' m');
      out += maatV(ux + uw + 52, uy, P2.y1, m2(D.h) + ' m');
      out += peil(wx - 10, ux + uw + 34, P2.y1, '±0,000 ' + T('afgewerkte vloer'));
      out += peil(ux - 10, ux + uw + 34, uy, '+' + m2(D.h) + ' ' + T('dakrand'));
      out += grondlijn(P2.y1, 60, VB_W - 60);
      out += '<rect x="' + wx + '" y="' + P2.y1 + '" width="' + (VB_W - 60 - wx) + '" height="14" fill="url(#grond' + u + ')"/>';
      out += schaalbalk(60, VB_H - 62, s2);
      noot.push('De ' + T(D.typeNaam).toLowerCase() + ' sluit links aan op de bestaande gevel. ' +
                'Die staat gearceerd en op aangenomen maat; het nieuwe deel staat op úw maten.');
    } else {
      var P3 = pas(D.dp, D.h, { onder: 170, boven: 150 });
      out += tekenVolume(P3.x0, P3.y1, P3.s);
      out += gevelKozijnenTekenen(D, { x0: P3.x0, s: P3.s, vloerY: P3.y1 }, 'zij', noot);
      out += maatH(P3.x0, P3.x1, P3.y1 + 52, m2(D.dp) + ' m');
      out += maatV(P3.x0 - 46, P3.y0, P3.y1, m2(D.h) + ' m');
      out += peil(P3.x0 - 20, P3.x1 + 30, P3.y1, '±0,000 ' + T('afgewerkte vloer'));
      out += peil(P3.x0 - 20, P3.x1 + 30, P3.y0, '+' + m2(D.h) + ' ' + T('dakrand'));
      out += grondlijn(P3.y1, 60, VB_W - 60);
      out += schaalbalk(60, VB_H - 62, P3.s);
      noot.push('Vrijstaand: vier eigen wanden en een eigen fundering, dus dit aanzicht staat op zichzelf.');
    }
    if (banden.length > 1) {
      noot.push('Ook van opzij is de knik in de plattegrond te zien: het lichtere vlak ligt verder naar binnen.');
    }
    b.svg = svgDoc(u, D, out);
    b.titel = 'Zijaanzicht';
    b.noot = noot.join(' ');
    return b;
  }

  /* ------------------------------------------ achtergevel / de doorbraak --- */

  /* Bij een aangebouwd deel is de vierde zijde geen nieuwe gevel maar de
     bestaande achtergevel met een gat erin. Dat gat is het duurste en het
     spannendste onderdeel van de hele verbouwing, en het is precies wat op
     geen enkele configuratorfoto te zien is. Daarom krijgt het een eigen
     blad, met dezelfde doorbraakmaat waarmee de balkberekening rekent. */
  function achter(D) {
    var b = blad(), u = b.u;
    var noot = [];
    var out;
    if (D.soort === 'aangebouwd') {
      var wonH = D.h + 3.2;
      var P = pas(D.w + 2.6, wonH, { onder: 165, boven: 140 });
      var gx = P.x0, gw = P.w, gy = P.y1 - wonH * P.s;
      out = titel('Doorbraak in de bestaande gevel',
        'Aanname voor de tekening: ' + m2(D.doorbraak) + ' m vrije opening · ligger volgens DB-01');
      out += '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + (wonH * P.s) +
             '" fill="url(#best' + u + ')" class="bestaand"/>';
      var dbW = D.doorbraak * P.s, dbH = Math.min(2.4, D.h - 0.5) * P.s;
      var dbX = gx + (gw - dbW) / 2, dbY = P.y1 - dbH;
      out += '<rect x="' + dbX + '" y="' + dbY + '" width="' + dbW + '" height="' + dbH + '" fill="#FBFAF7" class="dik"/>';
      /* De ligger boven de opening. Het profiel zelf komt uit de
         voordimensionering (NGStaal), niet uit deze tekening — die tekent
         alleen wáár hij zit. */
      var lh = Math.max(12, 0.22 * P.s);
      out += '<rect x="' + (dbX - 0.15 * P.s) + '" y="' + (dbY - lh) + '" width="' + (dbW + 0.3 * P.s) + '" height="' + lh +
             '" fill="#C9CDD2" class="nieuw"/>' +
             '<text x="' + (dbX + dbW / 2) + '" y="' + (dbY - lh - 12) + '" text-anchor="middle" class="micro">' +
             esc(T('STALEN LIGGER DB-01: PROFIEL VOLGENS BEREKENING')) + '</text>';
      out += '<rect x="' + (dbX - 0.15 * P.s) + '" y="' + (dbY - lh) + '" width="' + (0.15 * P.s) + '" height="' + (lh + dbH) +
             '" fill="#DCD8CE" class="dun"/>' +
             '<rect x="' + (dbX + dbW) + '" y="' + (dbY - lh) + '" width="' + (0.15 * P.s) + '" height="' + (lh + dbH) +
             '" fill="#DCD8CE" class="dun"/>' +
             '<text x="' + (dbX + dbW + 0.15 * P.s + 10) + '" y="' + (dbY + dbH / 2) + '" class="micro">' +
             esc(T('OPLEGGING MIN. 150 MM')) + '</text>';
      out += maatH(dbX, dbX + dbW, P.y1 + 52, m2(D.doorbraak) + ' m', 'maat maat--ca');
      out += maatV(dbX - 40, dbY, P.y1, m2(Math.min(2.4, D.h - 0.5)) + ' m');
      out += maatH(gx, gx + gw, P.y1 + 100, 'bestaande gevel, ter plaatse inmeten', 'maat maat--ca');
      out += grondlijn(P.y1, 60, VB_W - 60);
      out += schaalbalk(60, VB_H - 62, P.s);
      out += '<text x="40" y="' + (VB_H - 26) + '" class="micro">' +
             esc(T('BESTAANDE BOUW GEARCEERD · MATEN TER PLAATSE CONTROLEREN VÓÓR PRODUCTIE')) + '</text>';
      noot.push('De vrije opening is hier ' + m2(D.doorbraak) + ' m: 58% van de breedte, hoogstens vier meter. ' +
                'Dat is dezelfde aanname waarmee de balkberekening rekent, zodat de tekening en het rekenblad ' +
                'niet twee verschillende doorbraken beschrijven. Je werkelijke gevel bepaalt de definitieve maat.');
    } else {
      /* Een dakopbouw staat niet op het maaiveld maar twee bouwlagen hoger.
         Dit blad tekende hem toch op de grondlijn met "±0,000 afgewerkte
         vloer" eronder, en dat is een hoogteverschil van vijfeneenhalve meter
         dat niemand ziet. Hij krijgt nu dezelfde strook met breukstreep als
         het voor- en zijaanzicht. */
      var isDak = D.soort === 'dakopbouw';
      var strook = isDak ? 1.4 : 0;
      var P2 = pas(D.w, D.h + strook, { onder: 170, boven: 150 });
      var vloer2 = P2.y1 - strook * P2.s;
      var achterAantal = gevelKozijnen(D, 'achter').length;
      out = titel(D.typeNaam + ' · achteraanzicht',
        (achterAantal ? achterAantal + (achterAantal === 1 ? ' kozijn' : ' kozijnen') : 'Gesloten gevel') +
        ' · ' + m2(D.w) + ' × ' + m2(D.h) + ' m buitenwerks');
      if (strook) {
        out += '<rect x="' + P2.x0 + '" y="' + vloer2 + '" width="' + P2.w + '" height="' + (strook * P2.s) +
               '" fill="url(#best' + u + ')" class="bestaand"/>';
        out += breukstreep(P2.x0, P2.x1, P2.y1);
        out += '<text x="' + (P2.x0 + 12) + '" y="' + (vloer2 + 22) + '" class="micro">' +
               esc(T('BESTAANDE WONING: AFGEBROKEN GETEKEND, TWEE BOUWLAGEN ERONDER')) + '</text>';
      }
      out += '<rect x="' + P2.x0 + '" y="' + (vloer2 - D.h * P2.s) + '" width="' + P2.w + '" height="' + (D.h * P2.s) +
             '" fill="url(#gev' + u + ')" class="nieuw"/>';
      var boei = Math.max(12, 0.22 * P2.s);
      out += '<rect x="' + (P2.x0 - 4) + '" y="' + (vloer2 - D.h * P2.s - boei) + '" width="' + (P2.w + 8) + '" height="' + boei +
             '" fill="' + D.dak.kleur + '" class="nieuw"/>';
      var achterKz = gevelKozijnenTekenen(D, { x0: P2.x0, s: P2.s, vloerY: vloer2 }, 'achter', noot);
      out += achterKz;
      out += maatH(P2.x0, P2.x1, P2.y1 + 52, m2(D.w) + ' m');
      out += maatV(P2.x0 - 46, vloer2 - D.h * P2.s, vloer2, m2(D.h) + ' m');
      out += peil(P2.x0 - 20, P2.x1 + 30, vloer2, '±0,000 ' + T(isDak ? 'vloer dakopbouw' : 'afgewerkte vloer'));
      out += peil(P2.x0 - 20, P2.x1 + 30, vloer2 - D.h * P2.s, '+' + m2(D.h) + ' ' + T('dakrand'));
      if (!strook) out += grondlijn(P2.y1, 60, VB_W - 60);
      out += schaalbalk(60, VB_H - 62, P2.s);
      if (!achterKz) {
        noot.push('In deze gevel zit geen kozijn, dus staat hij dicht. Zet er op de plattegrond een raam ' +
                  'of een deur in en hij komt hier op maat te staan.');
      }
      if (strook) {
        noot.push('De woning eronder is afgebroken getekend: die loopt door tot het maaiveld, twee bouwlagen lager.');
      }
    }
    b.svg = svgDoc(u, D, out);
    b.titel = D.soort === 'aangebouwd' ? 'Doorbraak' : 'Achteraanzicht';
    b.noot = noot.join(' ');
    return b;
  }

  /* --------------------------------------------------------- plattegrond --- */

  /* De gevelranden. Een kozijn zit niet in "de noordgevel" maar in een
     bepááld stuk gevel, en bij een L- of U-vorm zijn dat er zes of acht. Elke
     rand kent zijn buitenlijn, zijn binnenlijn en zijn lengte; een opening is
     dan een positie t (0..1) langs die rand plus een breedte. Dat is meteen
     de vorm waarin de bezoeker hem kan verslepen.

     De buiten- en binnenomtrek hebben evenveel punten en lopen in dezelfde
     volgorde — dat garandeert `inzet()` — dus rand i loopt van buiten[i] naar
     buiten[i+1] en van binnen[i] naar binnen[i+1]. */
  function randen(D, binnen) {
    var V = global.NGBouwvormen;
    var buiten = D.vorm ? D.vorm.punten : [[0, 0], [D.w, 0], [D.w, D.dp], [0, D.dp]];
    var uit = [];
    for (var i = 0; i < buiten.length; i++) {
      var a = buiten[i], b = buiten[(i + 1) % buiten.length];
      var ai = binnen[i], bi = binnen[(i + 1) % binnen.length];
      var dx = b[0] - a[0], dy = b[1] - a[1];
      var L = Math.sqrt(dx * dx + dy * dy);
      if (L < 0.3) continue;
      var nx = -dy / L, ny = dx / L;
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      if (V && V.inPolygoon(buiten, mx + nx * 0.02, my + ny * 0.02)) { nx = -nx; ny = -ny; }
      uit.push({ i: i, a: a, b: b, ai: ai, bi: bi, L: L, nx: nx, ny: ny,
                 horizontaal: Math.abs(dy) < 1e-6,
                 /* De zijde van de bestaande woning: daar zit bij een
                    aangebouwd deel de doorbraak en dus geen raam. */
                 huiszijde: D.soort === 'aangebouwd' && Math.abs(a[1]) < 1e-6 && Math.abs(b[1]) < 1e-6,
                 tuinzijde: ny > 0.5 });
    }
    return uit;
  }

  /* Een punt op een rand: t = 0 is het begin, t = 1 het eind. */
  function opRand(r, t, binnenkant) {
    var a = binnenkant ? r.ai : r.a, b = binnenkant ? r.bi : r.b;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  /* Welke rand ligt onder dit punt op de buitenlijn, en waar op die rand?
     Zo vindt de pui zijn rand terug uit de band waarin hij is uitgerekend. */
  function randOpPunt(rndn, x, y) {
    var beste = null, bd = 0.30;
    rndn.forEach(function (r) {
      var dx = r.b[0] - r.a[0], dy = r.b[1] - r.a[1];
      var t = ((x - r.a[0]) * dx + (y - r.a[1]) * dy) / (r.L * r.L);
      if (t < 0 || t > 1) return;
      var qx = r.a[0] + dx * t, qy = r.a[1] + dy * t;
      var d = Math.sqrt((qx - x) * (qx - x) + (qy - y) * (qy - y));
      if (d < bd) { bd = d; beste = { rand: r, t: t }; }
    });
    return beste;
  }

  /* De rand met dit nummer. Het nummer is de index in de omtrek en niet in de
     lijst met randen: te korte randen vallen weg, en dan zou een opgeslagen
     kozijn na een vormwijziging stilletjes naar een andere gevel verhuizen. */
  function randNr(rndn, i) {
    for (var k = 0; k < rndn.length; k++) if (rndn[k].i === i) return rndn[k];
    return null;
  }

  /* Welke randen horen bij deze ruimte, en waar op die rand? Alleen randen die
     het rechthoekje van de ruimte werkelijk raken tellen mee. De lijst komt er
     op geschiktheid gesorteerd uit, zodat de aanroeper kan doorschuiven als de
     beste rand al bezet is. */
  function randenVoorRuimte(R, rndn, minB) {
    var kand = [];
    rndn.forEach(function (r) {
      if (r.huiszijde) return;
      var e = 0.06;
      var lo, hi, raakt;
      if (r.horizontaal) {
        var yy = r.ai[1];
        raakt = Math.abs(yy - R.y0) < e || Math.abs(yy - R.y1) < e;
        lo = Math.max(Math.min(r.ai[0], r.bi[0]), R.x0);
        hi = Math.min(Math.max(r.ai[0], r.bi[0]), R.x1);
      } else {
        var xx = r.ai[0];
        raakt = Math.abs(xx - R.x0) < e || Math.abs(xx - R.x1) < e;
        lo = Math.max(Math.min(r.ai[1], r.bi[1]), R.y0);
        hi = Math.min(Math.max(r.ai[1], r.bi[1]), R.y1);
      }
      var overlap = hi - lo;
      if (!raakt || overlap < minB + 0.4) return;
      var mid = (lo + hi) / 2;
      var t = r.horizontaal
        ? (mid - r.ai[0]) / (r.bi[0] - r.ai[0])
        : (mid - r.ai[1]) / (r.bi[1] - r.ai[1]);
      /* Bij gelijke geschiktheid wint de tuinzijde: daar wil je het licht. */
      kand.push({ rand: r, t: Math.min(0.92, Math.max(0.08, t)),
                  score: overlap + (r.tuinzijde ? 10 : 0) });
    });
    kand.sort(function (a, c) { return c.score - a.score; });
    return kand;
  }

  /* Raakt dit kozijn een kozijn dat er al staat? Twee openingen naast elkaar
     hebben een penant tussen zich nodig; zonder deze toets tekende de badkamer
     zijn raampje dwars door de schuifpui heen. */
  function botst(lijst, rand, t, b) {
    for (var i = 0; i < lijst.length; i++) {
      var k = lijst[i];
      if (k.edge !== rand.i) continue;
      if (Math.abs(k.t - t) * rand.L < (k.b + b) / 2 + 0.25) return true;
    }
    return false;
  }

  /* De kozijnen in de buitengevel. Ze worden afgeleid en niet verzonnen: elke
     verblijfsruimte heeft daglicht nodig (Bbl: tien procent van de vloer), dus
     een slaapkamer zónder raam zou een tekening zijn van iets dat niet gebouwd
     mag worden. De maten zijn standaardmaten en de posities zijn een voorstel;
     dat staat onder de tekening. De pui komt uit de keuze van de bezoeker en
     is dus wél gegeven.

     Een kozijn kent zijn plek als randnummer plus een positie t (0..1) langs
     die rand — niet als windrichting. Dat is de enige weergave die ook op een
     L- of U-vorm klopt, en het is meteen de vorm waarin de bezoeker hem kan
     verslepen. */
  /* Tot hoe hoog mag een kozijn in de gevel? Boven de bovendorpel moet nog de
     latei of raveling passen én de dakopbouw zelf. Dit is dezelfde maat waar
     de pui op wordt getekend, dus staat hij hier één keer. */
  function bovenGrens(D) {
    return D.h - Math.max(0.40, (D.dakDikte || 0.28) + 0.12);
  }

  function kozijnen(D, ruimten, bb, binnen) {
    var V = global.NGBouwvormen, N = global.NGBouwnormen;
    var rndn = randen(D, binnen);
    /* De raamhoogte volgt uit de gevel en is geen aanname. Een standaardraam
       van 1,50 m op 900 mm borstwering vraagt 2,40 m, en dat past niet onder
       een dakrand van 2,80 m waar 474 mm dakopbouw en latei vanaf gaat. Zo'n
       raam stond eerder gewoon getekend en klopte dus niet. Afgerond naar
       beneden op 5 cm: kozijnen worden op ronde maten besteld. */
    var RAAM_B = 1.00, BAD_B = 0.60, BAD_H = 0.60;
    var RAAM_SILL = 0.90;
    var RAAM_H = Math.floor(Math.min(1.50, bovenGrens(D) - RAAM_SILL) * 20) / 20;
    var lijst = [];
    var nr = 0;
    function code() { nr++; return 'R' + (nr < 10 ? '0' : '') + nr; }

    /* De pui staat vast: die koos de bezoeker zelf, en er hangt een prijs aan.
       Hij blijft dus altijd afgeleid uit de configuratie en is op de tekening
       niet te verslepen — anders zou een pui die in de keuzelijst 4,00 m is
       op de plattegrond 2,40 m kunnen zijn, en dat is het soort verschil dat
       pas op de bouw opvalt. Hij gaat als eerste op de rand, zodat de ramen
       erna om hem heen kunnen wijken in plaats van andersom. Hij zit in de
       gevel die het verst de tuin in steekt. */
    if (D.pui && D.pui.breedte) {
      var buiten = D.vorm ? D.vorm.punten : [[0, 0], [D.w, 0], [D.w, D.dp], [0, D.dp]];
      var bnd = V ? V.banden(buiten, 'y') : [];
      var band = bnd.length ? bnd[bnd.length - 1] : null;
      if (band) {
        var wdM = D.wandDikte || 0.30;
        var bandB = band.tot - band.van;
        var pbM = Math.min(D.pui.tekenBreedte || D.pui.breedte,
                           Math.max(0.9, bandB - 2 * wdM - 0.10));
        var pMid = (band.van + band.tot) / 2;
        var op = randOpPunt(rndn, pMid, band.diepte);
        if (op) {
          /* h is voor elk kozijn de maat van het kozijn zélf, niet de afstand
             tot het plafond. Anders zou een pui met een borstwering zijn
             borstwering meetellen als glas, en dat is precies het getal waar
             de daglichttoets op afgaat. */
          var puiSill = D.pui.totVloer ? 0 : 0.90;
          var puiH = bovenGrens(D) - puiSill;
          lijst.push({ soort: 'pui', edge: op.rand.i, t: op.t, b: pbM,
                       h: Math.max(0.9, Math.round(puiH * 100) / 100),
                       vakken: D.pui.vakken || 3, code: 'D01',
                       sill: puiSill, vast: true });
        }
      }
    }

    /* Het voorstel wordt áltijd afgeleid, ook als de bezoeker zijn eigen gevel
       heeft ingedeeld. Niet om het te tekenen, maar om het te kúnnen tellen:
       de basisprijs bevat het standaardaantal ramen, en zonder dat getal is
       er geen meer- of minderwerk te berekenen. Het is een paar
       meetkundesommetjes en geen meubelindeling, dus het kost niets. */
    var afgeleid = [];
    ruimten.forEach(function (r) {
      if (!r.rect) return;
      var f = r.functie || '';
      if (f === 'gang') return;
      var isBad = f === 'badkamer';
      var b = isBad ? BAD_B : RAAM_B, h = isBad ? BAD_H : RAAM_H;
      /* Blijft er onder deze dakrand geen raam van betekenis over, dan komt er
         geen — een raam van veertig centimeter hoog in een woonkamer is geen
         voorstel maar een verlegenheidsoplossing. De daglichttoets valt daar
         dan terecht op om. */
      if (!isBad && h < 0.90) return;
      var R = {
        x0: bb.x0 + r.rect.x0 * (bb.x1 - bb.x0), x1: bb.x0 + r.rect.x1 * (bb.x1 - bb.x0),
        y0: bb.y0 + r.rect.y0 * (bb.y1 - bb.y0), y1: bb.y0 + r.rect.y1 * (bb.y1 - bb.y0)
      };
      /* Hoeveel glas heeft deze ruimte nodig? Het Bbl vraagt tien procent van
         de vloer, en dat is precies de regel waar dit voorstel zich op
         beroept. Eén raam per ruimte klopte dus alleen bij kleine kamers: een
         mantelzorgwoning van 24 m² binnenwerks kreeg één raam van 1,08 m² glas
         terwijl er 2,40 m² nodig is, en zakte op zijn eigen toets. Natte
         ruimtes tellen niet als verblijfsruimte en houden hun ene raampje. */
      var vlak = (R.x1 - R.x0) * (R.y1 - R.y0);
      var perRaam = b * h * 0.80;                     // 20% kozijnhout eraf
      var nodig = isBad ? 1 : Math.max(1, Math.ceil(vlak * (N ? N.DAGLICHT.deelNieuwbouw : 0.10) / perRaam));
      /* Al aanwezig glas in deze ruimte telt mee: staat er een schuifpui van
         drie meter in de woonkamer, dan hoeven er geen vier ramen bij. */
      lijst.forEach(function (K) {
        var rr = randNr(rndn, K.edge);
        if (!rr) return;
        var q = opRand(rr, K.t, true);
        if (q[0] > R.x0 - 0.4 && q[0] < R.x1 + 0.4 && q[1] > R.y0 - 0.4 && q[1] < R.y1 + 0.4) {
          nodig -= Math.ceil(K.b * K.h * 0.80 / perRaam);
        }
      });
      if (nodig < 1) return;
      /* Hoogstens zes: daarboven is het geen voorstel meer maar een serre, en
         dan hoort de bezoeker zelf te kiezen waar zijn glas komt. */
      nodig = Math.min(6, nodig);
      var kand = randenVoorRuimte(R, rndn, b);
      var gezet = 0;
      for (var i = 0; i < kand.length && gezet < nodig; i++) {
        var rd = kand[i].rand;
        /* Meerdere ramen op dezelfde rand: verdeel ze over de vrije lengte in
           plaats van ze allemaal op het midden te willen zetten. */
        var stappen = Math.max(1, Math.floor(rd.L / (b + 0.6)));
        /* Eerst gelijkmatig over de héle gevel, daarna pas de tussenplekken.
           Zonder die volgorde vult hij de plekken op volgorde van de rand en
           staan drie ramen tegen elkaar aan het ene uiteinde met een blinde
           muur ernaast — wat op een gevelaanzicht meteen opvalt. */
        var slots = [], volgorde = [];
        for (var q = 0; q < stappen; q++) slots.push((q + 0.5) / stappen);
        var wens = Math.min(nodig - gezet, stappen);
        for (var q2 = 0; q2 < wens; q2++) {
          var idx = Math.min(stappen - 1, Math.round((q2 + 0.5) * stappen / wens - 0.5));
          if (volgorde.indexOf(slots[idx]) < 0) volgorde.push(slots[idx]);
        }
        slots.forEach(function (t0) { if (volgorde.indexOf(t0) < 0) volgorde.push(t0); });
        for (var j = 0; j < volgorde.length && gezet < nodig; j++) {
          var tt = volgorde[j];
          var marge2 = (b / 2 + 0.15) / rd.L;
          tt = Math.min(1 - marge2, Math.max(marge2, tt));
          /* Tegen de pui én tegen de ramen die al afgeleid zijn: twee
             openingen naast elkaar hebben een penant nodig. */
          if (botst(lijst.concat(afgeleid), rd, tt, b)) continue;
          afgeleid.push({ soort: 'raam', edge: rd.i, t: tt, b: b, h: h,
                          code: code(), sill: isBad ? 1.40 : RAAM_SILL, ruimte: r.naam, past: true });
          gezet++;
        }
      }
    });

    /* Heeft de bezoeker de gevel zelf ingedeeld, dan is dat het antwoord. Er
       wordt niets bijgetekend: een raam dat vanzelf terugkomt nadat iemand het
       heeft weggehaald is erger dan een gevel zonder raam. Wat op een rand
       staat die na een vormwijziging niet meer bestaat, vervalt — geteld, want
       een raam dat stilletjes verdwijnt haalt ook stilletjes de daglichttoets
       onderuit. */
    if (D.eigenKozijnen) {
      var vervallen = 0;
      D.eigenKozijnen.forEach(function (k) {
        if (!k || k.soort === 'pui') return;             // de pui staat er al
        var r = randNr(rndn, Math.round(num(k.edge, -1)));
        if (!r) { vervallen++; return; }
        var b = Math.min(num(k.b, 1.00), r.L - 0.30);
        if (b < 0.40) { vervallen++; return; }
        var marge = (b / 2 + 0.15) / r.L;
        if (marge >= 0.5) { vervallen++; return; }
        var kh = Math.max(0.30, num(k.h, 1.50));
        var ks = Math.max(0, num(k.sill, 0.90));
        lijst.push({ soort: k.soort === 'deur' ? 'deur' : 'raam', edge: r.i,
                     t: Math.min(1 - marge, Math.max(marge, num(k.t, 0.5))),
                     b: b, h: kh, code: k.code || code(), sill: ks, eigen: true,
                     /* Past hij onder het dak? Zo niet, dan wordt hij wél
                        getekend maar in het rood: hem stilletjes lager maken
                        zou een gevel opleveren die niet te bouwen is, en hem
                        weglaten zou de bezoeker laten zoeken naar een raam
                        dat hij zeker weet te hebben neergezet. */
                     past: ks + kh <= bovenGrens(D) + 0.005 });
      });
      return { randen: rndn, lijst: lijst, eigen: true, vervallen: vervallen,
               standaard: afgeleid.length };
    }

    return { randen: rndn, lijst: lijst.concat(afgeleid), eigen: false, vervallen: 0,
             standaard: afgeleid.length };
  }

  /* Het stuk vloer waar werkelijk iets neergezet kan worden. Het kamerplan
     rekent op de omhullende rechthoek en weet niets van de hap in een L- of
     U-vorm; zonder deze stap staat de fauteuil in de tuin. De vorm is
     opgeknipt in rechthoeken (bouwvormen.delen), dus het antwoord is de
     grootste doorsnede van de kamer met een van die delen. */
  /* Het trapgat: waar het ligt, hoe groot het is, en of een rechte trap er
     überhaupt in past. Eén functie, want de tekening zet hem neer en de
     inrichting moet eromheen — liepen die twee uiteen, dan stond het bed in
     het gat.

     Hij ligt strak in de hoek tegen twee wanden. Dat is niet alleen hoe het
     gebouwd wordt, het is ook het enige dat een bruikbaar stuk vloer
     overhoudt: een gat midden in een kamer van vier bij drie laat niets heel. */
  function trapgatVlak(D, bb) {
    if (!(D.soort === 'dakopbouw' && D.trapgat)) return null;
    var TL = 2.60, TB = 1.00;                       // rechte steektrap, 2,30 m doorloop
    var binB = bb.x1 - bb.x0, binD = bb.y1 - bb.y0;
    /* Wáár de trap uitkomt weet het kamerplan: op de overloop, en niet in een
       slaapkamer. De tekening bepaalt dat dus niet zelf — dat leverde eerder
       een trapgat op in de hoek van de eerste slaapkamer, die daardoor te
       smal werd voor een bed. */
    var uitPlan = D.kamerplan && D.kamerplan.trapgat;
    if (uitPlan) {
      /* Het kamerplan geeft het ankerpunt als breukdeel en de maat in meters.
         Dat laatste is essentieel: een trapgat dat als percentage van de
         buitenmaat wordt doorgegeven krimpt mee met de wanddikte, en dan is
         hij binnenwerks geen 2,60 m meer — waarna de tekening zichzelf
         terecht "krap" noemt terwijl er niets aan de hand is. */
      var x0 = bb.x0 + uitPlan.xNorm * binB;
      var y0 = bb.y0 + uitPlan.yNorm * binD;
      var x1 = Math.min(bb.x1, x0 + uitPlan.bM), y1 = Math.min(bb.y1, y0 + uitPlan.dM);
      var bM = x1 - x0, dM = y1 - y0;
      return { x0: x0, y0: y0, x1: x1, y1: y1, b: bM, d: dM,
               /* Past de trap er werkelijk in? Het gat moet 2,60 m lang zijn
                  in één van beide richtingen en 1,00 m breed in de andere. */
               past: (bM >= TL - 0.02 && dM >= TB - 0.02) || (dM >= TL - 0.02 && bM >= TB - 0.02),
               lang: TL, breed: TB, langsB: bM > dM };
    }
    var langsD = binD >= TL && binB >= TB;
    var langsB = !langsD && binB >= TL && binD >= TB;
    var lang = (langsD || langsB) ? TL : Math.max(1.2, Math.min(binD, binB) - 0.3);
    var breed = (langsD || langsB) ? TB : Math.min(TB, Math.max(binD, binB) - 0.3);
    var b2 = langsB ? lang : breed, d2 = langsB ? breed : lang;
    return { x0: bb.x0, y0: bb.y0, x1: bb.x0 + b2, y1: bb.y0 + d2, b: b2, d: d2,
             past: langsD || langsB, lang: TL, breed: TB, langsB: langsB };
  }

  /* Een rechthoek met een gat erin levert stroken op. De grootste strook is
     wat er nog te meubileren valt; de rest wordt door de aanroeper gesorteerd
     en geprobeerd. */
  function minObstakel(R, O) {
    if (!O || O.x1 <= R.x0 + 0.01 || O.x0 >= R.x1 - 0.01 ||
        O.y1 <= R.y0 + 0.01 || O.y0 >= R.y1 - 0.01) return [R];
    var uit = [];
    function voeg(x0, y0, x1, y1) {
      if (x1 - x0 > 0.5 && y1 - y0 > 0.5) uit.push({ x0: x0, y0: y0, x1: x1, y1: y1 });
    }
    voeg(R.x0, R.y0, R.x1, Math.min(R.y1, O.y0));          // boven het gat
    voeg(R.x0, Math.max(R.y0, O.y1), R.x1, R.y1);          // eronder
    voeg(R.x0, R.y0, Math.min(R.x1, O.x0), R.y1);          // ernaast, links
    voeg(Math.max(R.x0, O.x1), R.y0, R.x1, R.y1);          // ernaast, rechts
    return uit.length ? uit : [];
  }

  /* Een ruimte die geen `rect` meebrengt. Dat overkomt elke indeling die door
     de bezoeker zelf is aangepast: de indeling-editor bouwt bij het splitsen
     nieuwe ruimtes op met alleen een stempelpositie, en dan zou de tekening
     die kamer overslaan — geen vloer, geen meubels, geen naam. Het
     rechthoekje wordt hier afgeleid uit de wanden eromheen, met dezelfde
     methode als de editor zelf gebruikt om oppervlakten te bepalen. */
  function rectUitWanden(r, plan) {
    var L = 0, R = 1, T = 0, B = 1, eps = 0.002;
    (plan.wanden || []).forEach(function (w) {
      var vert = Math.abs(w.x1 - w.x2) < eps, hor = Math.abs(w.y1 - w.y2) < eps;
      if (vert && r.y >= Math.min(w.y1, w.y2) - eps && r.y <= Math.max(w.y1, w.y2) + eps) {
        if (w.x1 < r.x && w.x1 > L) L = w.x1;
        if (w.x1 > r.x && w.x1 < R) R = w.x1;
      }
      if (hor && r.x >= Math.min(w.x1, w.x2) - eps && r.x <= Math.max(w.x1, w.x2) + eps) {
        if (w.y1 < r.y && w.y1 > T) T = w.y1;
        if (w.y1 > r.y && w.y1 < B) B = w.y1;
      }
    });
    return { x0: L, y0: T, x1: R, y1: B };
  }

  /* En de functie uit de naam, want die kiest de bezoeker in de editor uit een
     vaste lijst. Onbekend blijft leeg: dan komt er geen inrichting in, en dat
     is beter dan een bed in een technische ruimte. */
  /* De namen komen uit de vaste lijst van de indeling-editor; die lijst en
     deze vertaling horen bij elkaar. Wat er niet in staat blijft leeg — beter
     een lege kamer dan een bed in een technische ruimte. */
  function functieUitNaam(naam) {
    var n = String(naam || '').toUpperCase();
    if (/SLAAPKAMER/.test(n)) return 'slaapkamer';
    if (/BADKAMER|SANITAIR|TOILET/.test(n)) return 'badkamer';
    if (/GANG|OVERLOOP|HAL/.test(n)) return 'gang';
    if (/KEUKEN/.test(n)) return 'keuken';
    if (/EETKAMER/.test(n)) return 'eetkamer';
    if (/KANTOOR|WERKKAMER/.test(n)) return 'kantoor';
    if (/BERGING|TECHNISCHE/.test(n)) return 'berging';
    if (/WOON|LEEF|SPEELKAMER|OPEN RUIMTE/.test(n)) return 'leefruimte';
    return '';
  }

  function ruimteVlakken(rect, bb, D, wdM) {
    var R = {
      x0: bb.x0 + rect.x0 * (bb.x1 - bb.x0), x1: bb.x0 + rect.x1 * (bb.x1 - bb.x0),
      y0: bb.y0 + rect.y0 * (bb.y1 - bb.y0), y1: bb.y0 + rect.y1 * (bb.y1 - bb.y0)
    };
    var V = global.NGBouwvormen;
    if (!V || !D.vorm || D.vorm.vorm === 'rechthoek') return [R];
    var hap = D.vorm.hap || {};
    var delen = V.delen(D.vorm.vorm, D.w, D.dp, hap.b, hap.d);
    var uit = [];
    delen.forEach(function (d) {
      var q = { x0: Math.max(R.x0, d.x0 + wdM), y0: Math.max(R.y0, d.y0 + wdM),
                x1: Math.min(R.x1, d.x1 - wdM), y1: Math.min(R.y1, d.y1 - wdM) };
      if (q.x1 - q.x0 > 0.4 && q.y1 - q.y0 > 0.4) {
        q.opp = (q.x1 - q.x0) * (q.y1 - q.y0);
        uit.push(q);
      }
    });
    uit.sort(function (a, c) { return c.opp - a.opp; });
    return uit.length ? uit : [R];
  }

  /* Het diepste stuk vloer in een vlak waar geen meubel staat. Levert het
     midden van die band op, of niets als er geen band van 45 cm te vinden is
     — dan is de kamer gewoon vol en valt er niets te ontwijken. */
  function vrijeBand(vk, meubels) {
    var randen = [{ y: vk.y0, d: 1 }, { y: vk.y1, d: -1 }];
    var bezet = meubels.map(function (mb) { return [mb.y, mb.y + mb.d]; })
                       .sort(function (a, b) { return a[0] - b[0]; });
    var banden = [], cursor = vk.y0;
    bezet.forEach(function (iv) {
      if (iv[0] > cursor) banden.push([cursor, Math.min(iv[0], vk.y1)]);
      cursor = Math.max(cursor, iv[1]);
    });
    if (cursor < vk.y1) banden.push([cursor, vk.y1]);
    var beste = null;
    banden.forEach(function (b) {
      var h = b[1] - b[0];
      if (h >= 0.45 && (!beste || h > beste.h)) beste = { h: h, mid: (b[0] + b[1]) / 2 };
    });
    return beste ? beste.mid : null;
  }

  function hoekenBinnen(poly, mb) {
    var V = global.NGBouwvormen, MB = global.NGBouwmeubels;
    var e = 0.03;
    /* Op het beslag en niet op b × d: een gedraaid bed van 1,60 × 2,00 is
       2,00 × 1,60, en wie dat vergeet keurt hem goed terwijl hij een halve
       meter door de buitenmuur steekt. */
    var g = MB && MB.beslag ? MB.beslag(mb)
          : { x0: mb.x, y0: mb.y, x1: mb.x + mb.b, y1: mb.y + mb.d };
    return [[g.x0 + e, g.y0 + e], [g.x1 - e, g.y0 + e],
            [g.x0 + e, g.y1 - e], [g.x1 - e, g.y1 - e]]
      .every(function (q) { return V.inPolygoon(poly, q[0], q[1]); });
  }

  /* De inrichting van alle ruimtes bij elkaar: per ruimte het bruikbare vlak,
     de meubels die daarin passen, en de zeef die weghaalt wat toch nog buiten
     de omtrek zou vallen. Dit staat hier als eigen functie en niet in de
     tekenlus, zodat er precies één antwoord bestaat op de vraag wat er waar
     staat — de tekening en de controle erop kunnen niet uit elkaar lopen. */
  function inrichting(D) {
    var MB = global.NGBouwmeubels, V = global.NGBouwvormen;
    var wdM = D.wandDikte || 0.30;
    var buiten = D.vorm ? D.vorm.punten : [[0, 0], [D.w, 0], [D.w, D.dp], [0, D.dp]];
    var binnen = V ? V.inzet(buiten, wdM)
                   : [[wdM, wdM], [D.w - wdM, wdM], [D.w - wdM, D.dp - wdM], [wdM, D.dp - wdM]];
    var xs = binnen.map(function (q) { return q[0]; }), ys = binnen.map(function (q) { return q[1]; });
    var bb = { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs),
               y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
    var plan = D.kamerplan || { ruimten: [] };
    var ruimten = (plan.ruimten && plan.ruimten.length) ? plan.ruimten
                  : [{ naam: 'NIEUWE LEEFRUIMTE', x: 0.5, y: 0.86, code: 'R-U01',
                       rect: { x0: 0, y0: 0, x1: 1, y1: 1 }, functie: 'leefruimte' }];
    var vlakken = {}, meubels = [], aangevuld = [];
    var leeg = [], geenBed = false, nrM = 0, buitenBeeld = 0;
    var gat = trapgatVlak(D, bb);
    ruimten.forEach(function (r) {
      /* Een aangepaste indeling brengt geen rechthoekje mee; dat wordt dan uit
         de wanden afgeleid in plaats van de kamer over te slaan. */
      if (!r.rect) {
        r = { code: r.code, naam: r.naam, x: r.x, y: r.y, opp: r.opp, nat: r.nat,
              rect: rectUitWanden(r, plan), functie: r.functie || functieUitNaam(r.naam),
              keuken: r.keuken, luxe: r.luxe };
      }
      /* Een L- of U-vorm valt uiteen in vleugels. De inrichting wordt in de
         grootste geprobeerd; levert die niets op — een vleugel van anderhalve
         meter breed neemt geen bank — dan de volgende. Wat nergens past, past
         nergens, en dan blijft de kamer leeg met een zin eronder die zegt
         waarom. */
      aangevuld.push(r);
      var vlakkenLijst = [];
      ruimteVlakken(r.rect, bb, D, wdM).forEach(function (q) {
        /* Het trapgat is geen vloer. Wat eromheen overblijft zijn stroken, en
           die worden op grootte geprobeerd. */
        minObstakel(q, gat).forEach(function (deel) {
          deel.opp = (deel.x1 - deel.x0) * (deel.y1 - deel.y0);
          vlakkenLijst.push(deel);
        });
      });
      vlakkenLijst.sort(function (a, c) { return c.opp - a.opp; });
      if (!vlakkenLijst.length) return;
      vlakken[r.code || r.naam] = vlakkenLijst[0];
      if (!MB) return;
      var gezet = 0;
      for (var i = 0; i < vlakkenLijst.length && !gezet; i++) {
        var set = MB.meubileer(r, vlakkenLijst[i]);
        if (set.geenBed) geenBed = true;
        set.forEach(function (mb) {
          /* Laatste zeef: wat toch nog buiten de omtrek zou vallen, wordt niet
             getekend. Een halve bank in de tuin is erger dan een lege hoek. */
          if (V && !hoekenBinnen(binnen, mb)) return;
          /* Een nummer per meubel. Zonder zou de bewerker na elke muisbeweging
             moeten raden wélke bank hij vasthoudt. */
          mb.id = 'M' + (++nrM);
          mb.ruimte = r.naam; mb.functie = r.functie;
          meubels.push(mb);
          gezet++;
        });
        if (gezet) vlakken[r.code || r.naam] = vlakkenLijst[i];
      }
      if (!gezet && r.functie && r.functie !== 'gang') leeg.push(T(r.naam));
    });
    /* Heeft de bezoeker zelf geschoven, dan is dát de opstelling. Er wordt
       niets bijgeplaatst en niets teruggezet: een bank die vanzelf terugkomt
       nadat iemand hem heeft weggehaald, is het snelste dat er is om het
       vertrouwen in een tekening kwijt te raken.

       Wat na een maatwijziging buiten de omtrek valt, verdwijnt wél — maar dan
       met een telling, zodat de noot het kan zeggen in plaats van dat er
       stilletjes een bed mist. */
    var eigenVloer = false;
    if (D.eigenInrichting && MB) {
      meubels = [];
      eigenVloer = true;
      D.eigenInrichting.forEach(function (m) {
        if (!m || !MB.SYMBOOL[m.soort]) return;
        var mb = { id: m.id || ('M' + (++nrM)), soort: m.soort,
                   x: num(m.x, 0), y: num(m.y, 0),
                   b: Math.max(0.20, num(m.b, 0.60)), d: Math.max(0.20, num(m.d, 0.60)),
                   rot: MB.draai(m.rot), opt: m.opt || {},
                   ruimte: m.ruimte || '', functie: m.functie || '' };
        if (V && !hoekenBinnen(binnen, mb)) { buitenBeeld++; return; }
        meubels.push(mb);
      });
      leeg = []; geenBed = false;
    }

    /* De kozijnen horen bij dezelfde uitkomst als de meubels. Stonden ze in
       de tekenlus, dan zou de daglichttoets een andere gevel doorrekenen dan
       er getekend is — en dat is precies het soort verschil dat niemand ziet
       tot de vergunning erop stukloopt. */
    var KZ = kozijnen(D, aangevuld.length ? aangevuld : ruimten, bb, binnen);
    return { binnen: binnen, bb: bb, ruimten: aangevuld.length ? aangevuld : ruimten, vlakken: vlakken,
             meubels: meubels, leeg: leeg, geenBed: geenBed, trapgat: gat, wandDikte: wdM,
             randen: KZ.randen, kozijnen: KZ.lijst, eigenGevel: KZ.eigen,
             vervallenKozijnen: KZ.vervallen || 0, standaardKozijnen: KZ.standaard || 0,
             eigenVloer: eigenVloer, buitenBeeld: buitenBeeld };
  }

  function plattegrond(D) {
    var b = blad(), u = b.u;
    var V = global.NGBouwvormen;
    var MB = global.NGBouwmeubels;
    /* De kozijnopschriften staan búiten de gevel, dus de marges moeten daar
       ruimte voor laten. Met de oude maat liepen de maatcijfers van een raam
       in de linkergevel het blad af zodra de uitbouw breed werd. */
    var P = pas(D.w, D.dp, { onder: 186, boven: 168, links: 150, rechts: 178 });
    var s = P.s, x0 = P.x0, y0 = P.y0, w = P.w, hh = P.h;
    var wdM = D.wandDikte || 0.30;
    var trapNoot = '';
    var trapVlak = null;
    var trapOpp = 0;

    function px(mx) { return x0 + mx * s; }
    function py(my) { return y0 + my * s; }
    function pad(punten) {
      return punten.map(function (q, i) { return (i ? 'L' : 'M') + px(q[0]) + ' ' + py(q[1]); }).join(' ') + ' Z';
    }
    /* Maten in centimeters, zoals op een verkoopplattegrond gebruikelijk is.
       De eenheid staat één keer op het blad; getallen zonder eenheid onder een
       maatlijn zijn de enige plek waar dat mag, en dan moet die vermelding er
       ook echt staan. */
    function cm(x) { return String(Math.round(x * 100)); }

    var INR = inrichting(D);
    var buiten = D.vorm.punten, binnen = INR.binnen, bb = INR.bb;
    var binnenOpp = V ? Math.round(V.oppervlak(binnen) * 10) / 10 : 0;

    var out = titel(D.typeNaam + ' · plattegrond',
      (D.vorm.vorm === 'rechthoek' ? '' : vormNaam(D.vorm.vorm) + ' · ') +
      m1(D.opp) + ' m² · wanddikte ' + (D.wandDikte ? mm(D.wandDikte) + ' mm' : 'nog niet bekend') +
      (D.bouwmethode === 'traditioneel' ? ' (traditioneel gemetseld)' : ' (prefab HSB)') +
      ' · maten in cm');

    /* ---- 1. de vloer, per ruimte een eigen afwerking ---- */
    var plan = D.kamerplan || { wanden: [], deuren: [], ruimten: [] };
    var ruimten = INR.ruimten;
    /* Eerst de hele binnenruimte in hout, daarna de natte ruimtes betegeld
       eroverheen. Zo hoeft er geen enkele ruimte uitgeknipt te worden en
       klopt de vloer ook bij een L-vorm tot in de hoek. */
    out += '<path d="' + pad(binnen) + '" fill="url(#vlh' + u + ')"/>';
    ruimten.forEach(function (r) {
      if (!r.rect || !MB || MB.vloerVoor(r.functie) !== 'tegel') return;
      var rx = bb.x0 + r.rect.x0 * (bb.x1 - bb.x0), rX = bb.x0 + r.rect.x1 * (bb.x1 - bb.x0);
      var ry = bb.y0 + r.rect.y0 * (bb.y1 - bb.y0), rY = bb.y0 + r.rect.y1 * (bb.y1 - bb.y0);
      out += '<rect x="' + px(rx) + '" y="' + py(ry) + '" width="' + ((rX - rx) * s) +
             '" height="' + ((rY - ry) * s) + '" fill="url(#vlt' + u + ')"/>';
    });

    /* ---- 2. de meubels ---- */
    var ctx = { px: px, py: py, s: s };
    var vlakken = INR.vlakken;
    if (MB) {
      INR.meubels.forEach(function (mb) {
        out += MB.teken(mb, ctx);
        if (mb.meterkast) {
          /* De kast staat aan het einde van de gang, dus lijnt het opschrift
             daar ook op uit; linksuitgelijnd liep het de kamer ernaast in. */
          var tegenRechts = mb.labelEind || mb.x + mb.b > bb.x1 - 0.4;
          out += '<text x="' + px(tegenRechts ? mb.x + mb.b : mb.x) + '" y="' + py(mb.y + mb.d + 0.24) +
                 '"' + (tegenRechts ? ' text-anchor="end"' : '') + ' class="micro">' +
                 esc(T('METERKAST')) + '</text>';
        }
      });
    }

    /* ---- 3. de wanden als massief vlak ---- */
    /* De buitenmuur is de ring tussen de buiten- en de binnenomtrek. Met
       fill-rule evenodd is dat één pad in plaats van vier losse rechthoeken,
       en dan klopt hij ook bij een L- of U-vorm zonder uitzonderingen. */
    /* De buitenwand als één vlak met een gat erin. data-gevel maakt hem
       aanwijsbaar: dat is waar de bezoeker straks op klikt om er een raam in
       te zetten. */
    out += '<path data-gevel="1" d="' + pad(buiten) + ' ' + pad(binnen) + '" fill-rule="evenodd" fill="#6F6C66" stroke="#3A3833" stroke-width="1.6"/>';
    var binnenWandM = 0.10;
    (plan.wanden || []).forEach(function (wn) {
      var ax = bb.x0 + wn.x1 * (bb.x1 - bb.x0), ay = bb.y0 + wn.y1 * (bb.y1 - bb.y0);
      var cx = bb.x0 + wn.x2 * (bb.x1 - bb.x0), cy = bb.y0 + wn.y2 * (bb.y1 - bb.y0);
      var vert = Math.abs(ax - cx) < 1e-6;
      out += '<rect x="' + px(vert ? ax - binnenWandM / 2 : Math.min(ax, cx)) +
             '" y="' + py(vert ? Math.min(ay, cy) : ay - binnenWandM / 2) +
             '" width="' + ((vert ? binnenWandM : Math.abs(cx - ax)) * s) +
             '" height="' + ((vert ? Math.abs(cy - ay) : binnenWandM) * s) +
             '" fill="#6F6C66" stroke="#3A3833" stroke-width="1"/>';
    });

    /* ---- 4. de openingen in de buitengevel ---- */
    var wd = Math.max(6, wdM * s);
    var tags = [];
    /* Eén tekenfunctie voor raam, deur en pui. Ze verschillen alleen in wat
       er in het gat komt te staan; de plek wordt voor alle drie op dezelfde
       manier uitgerekend, langs de rand en dwars erop. Dat is wat het mogelijk
       maakt om ze straks alle drie te verslepen. */
    function opening(K) {
      var r = randNr(INR.randen, K.edge);
      if (!r) return '';
      var ci = opRand(r, K.t, true), co = opRand(r, K.t, false);
      var ux = (r.b[0] - r.a[0]) / r.L, uy = (r.b[1] - r.a[1]) / r.L;
      var hb = K.b / 2;
      var hoek = [[ci[0] - ux * hb, ci[1] - uy * hb], [ci[0] + ux * hb, ci[1] + uy * hb],
                  [co[0] + ux * hb, co[1] + uy * hb], [co[0] - ux * hb, co[1] - uy * hb]];
      /* Het gat zelf: wit, want de gevelarcering loopt er niet doorheen. */
      var svg = '<path d="' + pad(hoek) + '" fill="#FBFAF7"/>';
      function dwars(f, dikte) {
        var ax = ci[0] + (co[0] - ci[0]) * f, ay = ci[1] + (co[1] - ci[1]) * f;
        return '<line x1="' + px(ax - ux * hb) + '" y1="' + py(ay - uy * hb) +
               '" x2="' + px(ax + ux * hb) + '" y2="' + py(ay + uy * hb) +
               '" stroke="' + D.kozijnkleur + '" stroke-width="' + dikte + '"/>';
      }
      if (K.soort === 'pui') {
        /* Een pui is één dikke lijn met de stijlen ertussen — dat is hoe een
           schuifpui op een plattegrond gelezen wordt. */
        svg += dwars(0.5, 4);
        var vk = Math.max(1, K.vakken || 3);
        for (var vi = 1; vi < vk; vi++) {
          var f2 = -hb + (K.b / vk) * vi;
          svg += '<line x1="' + px(ci[0] + ux * f2) + '" y1="' + py(ci[1] + uy * f2) +
                 '" x2="' + px(co[0] + ux * f2) + '" y2="' + py(co[1] + uy * f2) +
                 '" stroke="' + D.kozijnkleur + '" stroke-width="1.6"/>';
        }
      } else {
        /* Twee dunne lijnen in de dagmaat: de gangbare raamweergave. */
        svg += dwars(0.32, 2) + dwars(0.68, 2);
      }
      /* Binnen het blad houden. Een marge is geen garantie: bij een ondiepe,
         zeer brede uitbouw schuift de tekening zo ver naar de rand dat het
         opschrift er alsnog afloopt, en dan mist er een maat op de afdruk. */
      var tx = Math.min(Math.max(px(co[0]) + r.nx * 34, 62), VB_W - 62);
      var ty = Math.min(Math.max(py(co[1]) + r.ny * 34, 96), VB_H - 96);
      tags.push({ x: tx, y: ty, rot: r.horizontaal ? 0 : -90, b: cm(K.b), h: cm(K.h),
                  letter: K.soort === 'raam' ? 'R' : 'D', code: K.code });
      /* Het randnummer en de positie gaan mee de tekening in. De bewerker
         leest ze daar terug uit; zonder deze twee zou hij moeten raden welke
         gevel er onder de muisaanwijzer ligt. */
      return '<g class="kozijn" data-kozijn="' + esc(K.code) + '" data-edge="' + K.edge +
             '" data-t="' + (Math.round(K.t * 1e4) / 1e4) + '" data-b="' + K.b +
             '" data-soort="' + K.soort + '">' + svg + '</g>';
    }

    /* De doorbraak in de bestaande gevel: geen kozijn maar een gat. */
    if (D.soort === 'aangebouwd') {
      var dbW = D.doorbraak * s, dbX = px(D.w / 2) - dbW / 2;
      /* De haakjes zijn hier niet cosmetisch: zonder is dit een string min een
         getal, en dat is NaN. Het gat in de gevel verdween daardoor. */
      out += '<rect x="' + dbX + '" y="' + (py(bb.y0) - wd) + '" width="' + dbW + '" height="' + wd + '" fill="#FBFAF7"/>';
      out += '<line x1="' + dbX + '" y1="' + (py(bb.y0) - wd) + '" x2="' + dbX + '" y2="' + py(bb.y0) + '" class="dik"/>' +
             '<line x1="' + (dbX + dbW) + '" y1="' + (py(bb.y0) - wd) + '" x2="' + (dbX + dbW) + '" y2="' + py(bb.y0) + '" class="dik"/>';
      out += '<rect x="' + (x0 - 3) + '" y="' + (y0 - 24) + '" width="' + (w + 6) + '" height="9" fill="url(#best' + u + ')"/>';
      out += '<text x="' + (dbX + dbW / 2) + '" y="' + (y0 - 32) + '" text-anchor="middle" class="micro">' +
             esc(T('DOORBRAAK BESTAANDE GEVEL: DB-01') + ' · ' + cm(D.doorbraak)) + '</text>';
    }

    /* Pui en ramen komen uit één lijst, in de volgorde waarin ze zijn
       vastgesteld. De pui staat vooraan, dus overlap kan hier niet meer
       ontstaan: dat is bij het vaststellen al afgevangen. */
    INR.kozijnen.forEach(function (K) { out += opening(K); });
    /* ---- 5. binnendeuren en trapgat ---- */
    var ix = px(bb.x0), iy = py(bb.y0), iw = (bb.x1 - bb.x0) * s, ih = (bb.y1 - bb.y0) * s;
    (plan.deuren || []).forEach(function (dr) {
      var dx = ix + dr.x * iw, dy = iy + dr.y * ih, br = (dr.breedte || 0.9) * s;
      if (dr.richting === 'v') {
        out += '<rect x="' + (dx - binnenWandM * s / 2 - 1) + '" y="' + (dy - br / 2) + '" width="' + (binnenWandM * s + 2) + '" height="' + br + '" fill="#FBFAF7"/>' +
               '<path d="M' + dx + ' ' + (dy - br / 2) + ' a' + br + ' ' + br + ' 0 0 1 0 ' + br + '" fill="none" class="dun"/>' +
               '<line x1="' + dx + '" y1="' + (dy - br / 2) + '" x2="' + (dx + br) + '" y2="' + (dy - br / 2) + '" class="dun"/>';
      } else {
        out += '<rect x="' + (dx - br / 2) + '" y="' + (dy - binnenWandM * s / 2 - 1) + '" width="' + br + '" height="' + (binnenWandM * s + 2) + '" fill="#FBFAF7"/>' +
               '<path d="M' + (dx - br / 2) + ' ' + dy + ' a' + br + ' ' + br + ' 0 0 1 ' + br + ' 0" fill="none" class="dun"/>' +
               '<line x1="' + (dx - br / 2) + '" y1="' + dy + '" x2="' + (dx - br / 2) + '" y2="' + (dy + br) + '" class="dun"/>';
      }
    });

    var gat = INR.trapgat;
    if (gat) {
      out += MB ? MB.teken({ soort: 'trap', x: gat.x0, y: gat.y0, b: gat.b, d: gat.d }, ctx) : '';
      trapVlak = { x: px(gat.x0), y: py(gat.y0), w: gat.b * s, h: gat.d * s };
      trapOpp = Math.round(gat.b * gat.d * 10) / 10;
      trapNoot = gat.past
        ? 'Het trapgat is getekend op ' + m2(gat.lang) + ' × ' + m2(gat.breed) + ' m: de maat waarop een rechte ' +
          'steektrap naar een verdieping van ' + m2(D.h) + ' m nog ' + m2(2.30) + ' m doorloophoogte houdt. ' +
          'Hij ligt strak in de hoek, want dat is de enige plek waar er nog een bruikbaar stuk vloer overblijft.'
        : 'Een rechte steektrap vraagt een trapgat van ongeveer ' + m2(gat.lang) + ' m lang, en dat past niet in ' +
          'deze binnenmaat. Er is hier een kleiner gat getekend; in werkelijkheid wordt dat een draaitrap of ' +
          'een steilere trap, en dat is een keuze die de aannemer met je maakt.';
      /* Het opschrift onder het gat, tenzij het gat tegen de buitenmuur ligt —
         dan zou het buiten het gebouw komen te staan en gaat het erin. */
      var tegenGevel = gat.y1 > bb.y1 - 0.06;
      var lblY = tegenGevel ? trapVlak.y + 16 : trapVlak.y + trapVlak.h + 16;
      var lblX = trapVlak.x + trapVlak.w / 2;
      /* Altijd een wit plaatje eronder, ook als het gat niet tegen de gevel
         ligt: het opschrift viel anders als lichtgrijze tekst op de houten
         vloer en was niet te lezen. */
      out += '<rect x="' + (lblX - 62) + '" y="' + (lblY - 12) + '" width="124" height="16" rx="3" fill="#FBFAF7" fill-opacity=".9" pointer-events="none"/>';
      out += '<text x="' + lblX + '" y="' + lblY + '" text-anchor="middle" class="micro">' +
             esc(T('TRAPGAT') + ' ' + cm(gat.b) + ' × ' + cm(gat.d)) + '</text>';
      if (!gat.past) {
        out += '<text x="' + lblX + '" y="' + (lblY + 16) + '" text-anchor="middle" class="waarschuwing">' +
               esc(T('KRAP VOOR EEN RECHTE TRAP')) + '</text>';
      }
    }

    /* ---- 6. de ruimtestempels ---- */
    var bruto = 0;
    ruimten.forEach(function (r) { bruto += num(r.opp, 0); });
    var bruikbaar = Math.max(1, binnenOpp - trapOpp);
    var factor = bruto > 0 ? bruikbaar / bruto : 1;
    var zwaartepunt = middelpunt(binnen);
    ruimten.forEach(function (r) {
      var mxM = r.x * D.w, myM = r.y * D.dp;
      if (V && !V.inPolygoon(binnen, mxM, myM)) { mxM = zwaartepunt[0]; myM = zwaartepunt[1]; }
      /* Het stempel hoort in de ruimte zelf te staan, ook als die door de hap
         van een L-vorm kleiner is dan het kamerplan denkt. En liefst op een
         stuk vloer waar geen meubel staat: een ruimtenaam over een bank heen
         is leesbaar dankzij het witte vlak eronder, maar hij dekt dan wel de
         bank af die de bezoeker juist wilde zien. */
      var vk = vlakken[r.code || r.naam];
      if (vk) {
        mxM = Math.min(Math.max(mxM, vk.x0 + 0.6), vk.x1 - 0.6);
        myM = Math.min(Math.max(myM, vk.y0 + 0.3), vk.y1 - 0.5);
        var band = vrijeBand(vk, INR.meubels.filter(function (mb) { return mb.ruimte === r.naam; }));
        if (band) myM = band;
      }
      var rx = px(mxM), ry = py(myM);
      if (trapVlak && rx > trapVlak.x - 40 && rx < trapVlak.x + trapVlak.w + 40 &&
          ry > trapVlak.y - 16 && ry < trapVlak.y + trapVlak.h + 34) {
        ry = trapVlak.y + trapVlak.h + 52;
      }
      var regels = String(T(r.naam)).split(' + ');
      /* Een stempel op een gemeubileerde vloer heeft een achtergrond nodig,
         anders valt hij weg in de houtnerf. */
      var breed = Math.max(90, 7.2 * Math.max.apply(null, regels.map(function (x) { return x.length; })));
      var hoog = regels.length * 15 + (r.opp != null ? 16 : 0) + 10;
      out += '<rect x="' + (rx - breed / 2) + '" y="' + (ry - 15) + '" width="' + breed + '" height="' + hoog +
             '" rx="4" fill="#FBFAF7" fill-opacity=".96" pointer-events="none"/>';
      regels.forEach(function (rg, i) {
        out += '<text x="' + rx + '" y="' + (ry + i * 15) + '" text-anchor="middle" class="ruimte">' +
               esc(i ? '+ ' + rg : rg) + '</text>';
      });
      if (r.opp != null) {
        out += '<text x="' + rx + '" y="' + (ry + regels.length * 15 + 2) + '" text-anchor="middle" class="ruimteopp">' +
               esc(m1(num(r.opp, 0) * factor) + ' m²') + '</text>';
      }
    });

    /* ---- 7. de kozijnlabels onder de gevel ---- */
    tags.forEach(function (t) {
      var g = '<g transform="translate(' + t.x + ' ' + t.y + ')' + (t.rot ? ' rotate(' + t.rot + ')' : '') + '">';
      g += '<text x="-8" y="0" text-anchor="middle" class="kozijnmaat" transform="rotate(-90 -8 0)">' + esc(t.b) + '</text>';
      g += '<text x="4" y="0" text-anchor="middle" class="kozijnmaat" transform="rotate(-90 4 0)">' + esc(t.h) + '</text>';
      g += '<circle cx="-2" cy="22" r="9" fill="#FBFAF7" stroke="#6E6A62" stroke-width="1"/>';
      g += '<text x="-2" y="26" text-anchor="middle" class="kozijnletter">' + esc(t.letter) + '</text>';
      g += '</g>';
      out += g;
    });

    /* ---- 8. maatvoering ---- */
    out += maatH(x0, x0 + w, y0 - 62, cm(D.w));
    out += maatV(x0 + w + 86, y0, y0 + hh, cm(D.dp));
    if (D.vorm.hap && D.vorm.hap.b) {
      var hb = D.vorm.hap.b, hd = D.vorm.hap.d, hx0, hx1;
      if (D.vorm.vorm === 'l-rechts') { hx0 = D.w - hb; hx1 = D.w; }
      else if (D.vorm.vorm === 'l-links') { hx0 = 0; hx1 = hb; }
      else { hx0 = (D.w - hb) / 2; hx1 = (D.w + hb) / 2; }
      /* De hap zit aan de tuinzijde, dus staat zijn maat daar ook — een
         maatlijn boven een inspringing die onderaan zit, wijst naar niets. */
      out += maatH(px(hx0), px(hx1), y0 + hh + 92, cm(hb));
      out += maatV(x0 - 54, py(D.dp - hd), py(D.dp), cm(hd));
      out += '<text x="' + (VB_W - 60) + '" y="' + (VB_H - 62) + '" text-anchor="end" class="micro">' +
             esc(T('AFGESNEDEN') + ' ' + m1(D.vorm.afgesneden) + ' m² ' + T('T.O.V. DE OMHULLENDE RECHTHOEK')) + '</text>';
    }
    /* De snijlijn als twee stubs met een pijl, de gebruikelijke manier om een
       doorsnede aan te geven. Een streepjeslijn dwars over de plattegrond
       loopt door meubels en ruimtenamen heen en maakt de tekening onleesbaar
       voor precies één regel informatie. */
    var snedeY = py(bb.y0 + (bb.y1 - bb.y0) * 0.24);
    [[x0 - 46, x0 + 26, 1], [x0 + w - 26, x0 + w + 46, -1]].forEach(function (q) {
      out += '<line x1="' + q[0] + '" y1="' + snedeY + '" x2="' + q[1] + '" y2="' + snedeY + '" fill="none" class="snede"/>';
      var tip = q[2] > 0 ? q[1] : q[0];
      out += '<path d="M' + tip + ' ' + snedeY + ' l' + (-10 * q[2]) + ' -6 v12 Z" fill="#A32323"/>';
    });
    out += '<text x="' + (x0 - 52) + '" y="' + (snedeY - 10) + '" text-anchor="end" class="micro">A</text>' +
           '<text x="' + (x0 + w + 52) + '" y="' + (snedeY - 10) + '" class="micro">A</text>';
    out += noordpijl(VB_W - 84, 126);
    out += schaalbalk(60, VB_H - 62, s);
    out += '<text x="' + (VB_W - 60) + '" y="' + (VB_H - 40) + '" text-anchor="end" class="micro">' +
           esc(T('BINNENWERKS VLOEROPPERVLAK ca. ') + m1(binnenOpp) + ' m²' +
               (trapOpp ? ', ' + T('WAARVAN') + ' ' + m1(trapOpp) + ' m² ' + T('TRAPGAT') : '')) + '</text>';

    b.svg = svgDoc(u, D, out, MB ? MB.defs(u, s) : '', { x0: x0, y0: y0, s: s });
    /* Wat er getekend staat, ook als gegeven. De bewerker hoeft zo niets uit
       de SVG terug te lezen: hij krijgt dezelfde lijst die de tekening en de
       toets gebruiken. */
    b.model = { kozijnen: INR.kozijnen, meubels: INR.meubels, randen: INR.randen,
                binnen: binnen, bb: bb, trapgat: INR.trapgat,
                eigenGevel: INR.eigenGevel, eigenVloer: INR.eigenVloer,
                tf: { x0: x0, y0: y0, s: s, vbW: VB_W, vbH: VB_H } };
    b.titel = 'Plattegrond';
    b.noot = (D.vorm.vorm === 'rechthoek'
        ? 'Buitenwerks is ' + m2(D.w) + ' × ' + m2(D.dp) + ' m; daar gaat aan alle zijden de wand vanaf, '
        : vormNaam(D.vorm.vorm) + ' binnen een omhullende van ' + m2(D.w) + ' × ' + m2(D.dp) + ' m, waar ' +
          m1(D.vorm.afgesneden) + ' m² uit is gehaald; daar gaat aan alle zijden de wand vanaf, ') +
      'dus binnenwerks hou je ' + m1(binnenOpp) + ' m² vloer' +
      (trapOpp ? ', waarvan ' + m1(trapOpp) + ' m² trapgat, dus ' + m1(binnenOpp - trapOpp) +
                 ' m² bruikbare ruimte. ' : '. ') +
      'De meubels staan op ware maat en op dezelfde schaal als de wanden, dus daar valt aan te meten; ' +
      (INR.eigenVloer
        ? 'de opstelling is die van uzelf. '
        : 'de ópstelling is een voorstel en geen ontwerp. ') +
      (INR.buitenBeeld
        ? (INR.buitenBeeld === 1 ? 'Eén meubel viel ' : INR.buitenBeeld + ' meubels vielen ') +
          'buiten de omtrek nadat de maten waren gewijzigd en staat daarom niet meer op de tekening. ' : '') +
      (INR.vervallenKozijnen
        ? (INR.vervallenKozijnen === 1 ? 'Eén kozijn stond ' : INR.vervallenKozijnen + ' kozijnen stonden ') +
          'op een gevelstuk dat er na de vormwijziging niet meer is; ' +
          (INR.vervallenKozijnen === 1 ? 'hij is ' : 'ze zijn ') +
          'vervallen en tellen dus ook niet meer mee in de daglichttoets. ' : '') +
      (INR.kozijnen.length ? 'De ramen zijn standaardmaten op een voorgestelde plek. Elke verblijfsruimte heeft ' +
        'daglicht nodig, dus ze horen er te zijn; de definitieve maten en posities komen uit het ontwerp. ' : '') +
      (INR.geenBed
        ? 'Naast het trapgat blijft er op deze maat geen plek over voor een bed; er staat daarom een zithoek ' +
          'getekend. Een dakopbouw met een eigen slaapkamer én een rechte trap vraagt meer breedte of diepte. '
        : '') +
      (INR.leeg && INR.leeg.length
        ? 'In ' + INR.leeg.join(' en ').toLowerCase() + ' staat geen opstelling: de ruimte is in deze maat ' +
          'te smal voor de referentiemeubels. Dat is geen tekenfout maar het antwoord op de maat. '
        : '') +
      trapNoot;
    return b;
  }

  function middelpunt(punten) {
    var sx = 0, sy = 0;
    punten.forEach(function (q) { sx += q[0]; sy += q[1]; });
    return [sx / punten.length, sy / punten.length];
  }

  function vormNaam(v) {
    return v === 'l-links' ? 'L-vorm met de hap links'
         : v === 'l-rechts' ? 'L-vorm met de hap rechts'
         : v === 'u-vorm' ? 'U-vorm met binnenhof' : 'Rechthoek';
  }

  /* ---------------------------------------------------------- doorsnede --- */

  /* Wat er tussen binnen en buiten zit, op dikte getekend. De lagen komen
     uit dezelfde bouwkundige kern die de materiaalstaat vult, dus wat hier
     100 mm isolatie heet is ook 100 mm op de bestellijst. */
  function lagenlijst(x, y, breedte, kop, lagen, regelH) {
    regelH = regelH || 17;
    var out = '<text x="' + x + '" y="' + y + '" class="legendakop">' + esc(T(kop).toUpperCase()) + '</text>';
    if (!lagen || !lagen.length) {
      return out + '<text x="' + x + '" y="' + (y + 22) + '" class="laagtekst">' +
             esc(T('Nog niet bekend: de bouwkundige module is niet geladen.')) + '</text>';
    }
    /* SVG breekt tekst niet af en laat hem ook niet inkorten: een lange
       laagnaam schuift daardoor dwars door de millimeterkolom heen. Elf pixels
       Inter is ongeveer 5,4 pixels per teken; de kolom met de maat houdt 68
       pixels vrij. */
    var maxTekens = Math.max(12, Math.floor((breedte - 68) / 5.4));
    var yy = y + 20, tot = 0;
    lagen.forEach(function (l) {
      tot += num(l[1], 0);
      var naam = T(String(l[0]));
      if (naam.length > maxTekens) naam = naam.slice(0, maxTekens - 1).replace(/[ ,·]+$/, '') + '…';
      out += '<text x="' + x + '" y="' + yy + '" class="laagtekst">' + esc(naam) + '</text>' +
             '<text x="' + (x + breedte) + '" y="' + yy + '" text-anchor="end" class="laagmm">' +
             esc(String(Math.round(num(l[1], 0))) + ' mm') + '</text>';
      yy += regelH;
    });
    out += '<line x1="' + x + '" y1="' + (yy - 11) + '" x2="' + (x + breedte) + '" y2="' + (yy - 11) + '" class="dun"/>' +
           '<text x="' + x + '" y="' + (yy + 8) + '" class="laagmm">' + esc(T('totaal')) + '</text>' +
           '<text x="' + (x + breedte) + '" y="' + (yy + 8) + '" text-anchor="end" class="laagmm">' +
           esc(String(Math.round(tot)) + ' mm') + '</text>';
    return out;
  }

  function doorsnede(D) {
    var b = blad(), u = b.u;
    var onderM = D.soort === 'dakopbouw' ? 0.8 : 1.1;   // wat er onder de vloer zichtbaar is
    var P = pas(D.dp, D.h + onderM, { links: 110, rechts: 620, boven: 150, onder: 130 });
    var s = P.s, x0 = P.x0, w = P.w;
    var vloerY = P.y1 - onderM * s;             // bovenkant afgewerkte vloer = peil ±0,000
    var dakY = vloerY - D.h * s;                // dakrand
    var wd = Math.max(6, (D.wandDikte || 0.30) * s);
    var dd = Math.max(6, (D.dakDikte || 0.35) * s);
    var vd = Math.max(6, (D.vloerDikte || 0.52) * s);
    var out = titel(D.typeNaam + ' · doorsnede A–A',
      'Opbouw van vloer, gevel en dak op werkelijke dikte · maten in mm');

    /* Onder de vloer: grond met de gekozen fundering, of de bestaande
       verdiepingsvloer waar de dakopbouw op staat. */
    if (D.soort === 'dakopbouw') {
      out += '<rect x="' + (x0 - 40) + '" y="' + vloerY + '" width="' + (w + 80) + '" height="' + (onderM * s) +
             '" fill="url(#best' + u + ')" class="bestaand"/>' +
             '<text x="' + (x0 + 10) + '" y="' + (vloerY + onderM * s - 14) + '" class="micro">' +
             esc(T('BESTAANDE VERDIEPINGSVLOER / DRAAGCONSTRUCTIE: TE TOETSEN')) + '</text>';
    } else {
      out += '<rect x="' + (x0 - 60) + '" y="' + vloerY + '" width="' + (w + 120) + '" height="' + (onderM * s) +
             '" fill="url(#grond' + u + ')"/>';
      var fw = D.fundering === 'palen' ? 0.30 : (D.fundering === 'poeren' ? 0.60 : 0.50);
      var fh = D.fundering === 'palen' ? 0.9 : 0.7;
      [x0, x0 + w - fw * s].forEach(function (fx) {
        out += '<rect x="' + fx + '" y="' + (vloerY + vd) + '" width="' + (fw * s) + '" height="' + (fh * s) +
               '" fill="#D9D4C8" class="nieuw"/>';
      });
      out += '<text x="' + (x0 + w / 2) + '" y="' + (vloerY + onderM * s - 10) + '" text-anchor="middle" class="micro">' +
             esc(T(D.fundering === 'palen' ? 'HEI-/SCHROEFPALEN MET FUNDERINGSBALK'
                  : D.fundering === 'poeren' ? 'POERENFUNDERING' : 'STROKENFUNDERING') +
                 ', ' + T('DIEPTE PROJECTSPECIFIEK')) + '</text>';
    }

    /* De doorsnede zelf: twee wanden, de vloeropbouw ertussen, de dakopbouw
       erboven. */
    out += '<rect x="' + x0 + '" y="' + dakY + '" width="' + wd + '" height="' + (vloerY - dakY) + '" fill="url(#iso' + u + ')" class="nieuw"/>';
    out += '<rect x="' + (x0 + w - wd) + '" y="' + dakY + '" width="' + wd + '" height="' + (vloerY - dakY) + '" fill="url(#iso' + u + ')" class="nieuw"/>';
    out += '<rect x="' + x0 + '" y="' + vloerY + '" width="' + w + '" height="' + vd + '" fill="url(#iso' + u + ')" class="nieuw"/>';
    out += '<rect x="' + (x0 - (D.dak.overstek || 0) * s) + '" y="' + dakY + '" width="' +
           (w + 2 * (D.dak.overstek || 0) * s) + '" height="' + dd + '" fill="url(#iso' + u + ')" class="nieuw"/>';
    out += '<rect x="' + (x0 - (D.dak.overstek || 0) * s) + '" y="' + dakY + '" width="' +
           (w + 2 * (D.dak.overstek || 0) * s) + '" height="7" fill="' + D.dak.kleur + '"/>';

    /* De lichtstraat zit in het dakvlak, niet in de gevel: dit is de enige
       tekening waar dat te zien is. */
    if (D.licht && D.licht.breedte) {
      var lw = Math.min(D.licht.diepte || 1, D.dp * 0.6) * s;
      var lx = x0 + (w - lw) / 2;
      out += '<rect x="' + lx + '" y="' + (dakY - 10) + '" width="' + lw + '" height="' + (dd + 10) + '" class="glas"/>' +
             '<rect x="' + lx + '" y="' + (dakY - 10) + '" width="' + lw + '" height="' + (dd + 10) +
             '" fill="none" stroke="' + D.kozijnkleur + '" stroke-width="4"/>' +
             '<text x="' + (lx + lw / 2) + '" y="' + (dakY - 20) + '" text-anchor="middle" class="micro">' +
             esc(T(D.licht.naam).toUpperCase()) + '</text>';
    }

    var binnenTop = dakY + dd, binnenBodem = vloerY;
    out += maatV(x0 + w + 42, binnenTop, binnenBodem,
      D.binnenhoogte ? m2(D.h - (D.dakDikte || 0)) + ' m ' + T('vrije hoogte') : T('vrije hoogte: nog niet bekend'),
      D.binnenhoogte ? 'maat' : 'maat maat--ca');
    out += maatV(x0 - 46, dakY, vloerY, m2(D.h) + ' m');
    out += peil(x0 - 20, x0 + w + 26, vloerY, '±0,000');
    out += peil(x0 - 20, x0 + w + 26, dakY, '+' + m2(D.h));
    out += maatH(x0, x0 + w, P.y1 + 44, m2(D.dp) + ' m');
    out += schaalbalk(x0, VB_H - 58, s);

    /* Rechts de opbouwstaten. Ze staan naast de tekening en niet eronder,
       omdat de vraag "waar bestaat die wand uit" altijd samen met de
       tekening gesteld wordt. */
    /* Drie opbouwstaten onder elkaar naast de tekening. De regelhoogte volgt
       uit het aantal lagen: bij een gevel met negen lagen past 17 px niet meer
       en viel de totaalregel van het blad af. */
    var rijen = (D.daklagen || []).length + (D.vloeropbouw || []).length + ((D.wand && D.wand.lagen) || []).length;
    var rH = rijen > 20 ? 15 : 17;
    var yLijst = 128;
    out += lagenlijst(680, yLijst, 460, 'Dakopbouw van buiten naar binnen', D.daklagen, rH);
    yLijst += 20 + rH * ((D.daklagen || []).length) + 44;
    out += lagenlijst(680, yLijst, 460,
      D.soort === 'dakopbouw' ? 'Vloeropbouw op de bestaande vloer' : 'Vloeropbouw op de fundering', D.vloeropbouw, rH);
    yLijst += 20 + rH * ((D.vloeropbouw || []).length) + 44;
    out += lagenlijst(680, yLijst, 460, 'Gevelopbouw ' + (D.wand ? D.wand.code : ''), D.wand && D.wand.lagen, rH);
    b.svg = svgDoc(u, D, out);
    b.titel = 'Doorsnede';
    b.noot = (D.binnenhoogte
      ? 'De dakrand ligt op ' + m2(D.h) + ' m; daar gaat ' + mm(D.dakDikte) + ' mm dakopbouw vanaf, ' +
        'dus binnen sta je onder een plafond van ' + m2(D.h - D.dakDikte) + ' m.'
      : 'De vrije binnenhoogte volgt uit de dakopbouw en die is hier niet geladen, dus staat er geen maat.') +
      ' De opbouwstaten rechts zijn dezelfde als waarmee de materiaalstaat rekent.';
    return b;
  }

  /* --------------------------------------------------------- isometrie ---- */

  /* Eén blad waarop de drie maten tegelijk te zien zijn. Geen render en geen
     3D-model: een rechte axonometrische projectie van dezelfde doos die op de
     andere bladen in plat aanzicht staat, dus hij kan per definitie niet iets
     anders tonen dan wat er getekend is. */
  function isometrie(D) {
    var b = blad(), u = b.u;
    var V = global.NGBouwvormen;
    var C = 0.866, S = 0.5;
    var w = D.w, d = D.dp, h = D.h;
    var vlakP = D.vorm ? D.vorm.punten : [[0, 0], [w, 0], [w, d], [0, d]];
    /* Genoeg bestaande gevel om de aansluiting te laten zien, niet zoveel dat
       de uitbouw zelf een postzegel wordt: anderhalve meter boven de dakrand. */
    var extraH = D.soort === 'vrijstaand' ? 0 : (D.soort === 'dakopbouw' ? h + 0.2 : h + 1.6);
    var hoek = [];
    vlakP.forEach(function (q) {
      [0, Math.max(h, extraH)].forEach(function (Z) { hoek.push([(q[0] - q[1]) * C, (q[0] + q[1]) * S - Z]); });
    });
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    hoek.forEach(function (q) {
      if (q[0] < minX) minX = q[0]; if (q[0] > maxX) maxX = q[0];
      if (q[1] < minY) minY = q[1]; if (q[1] > maxY) maxY = q[1];
    });
    var VAK = { x: 150, y: 120, w: 900, h: 400 };
    var sc = Math.min(VAK.w / (maxX - minX), VAK.h / (maxY - minY));
    var ox = VAK.x + (VAK.w - (maxX - minX) * sc) / 2 - minX * sc;
    var oy = VAK.y + (VAK.h - (maxY - minY) * sc) / 2 - minY * sc;
    function p(X, Y, Z) { return [ox + (X - Y) * C * sc, oy + (X + Y) * S * sc - Z * sc]; }
    function vlak(punten, vul, klasse) {
      return '<polygon points="' + punten.map(function (q) { return q[0] + ',' + q[1]; }).join(' ') +
             '" fill="' + vul + '" class="' + (klasse || 'nieuw') + '"/>';
    }

    var out = titel(D.typeNaam + ' · ruimtelijk',
      m2(w) + ' × ' + m2(d) + ' × ' + m2(h) + ' m · ' + m1(D.opp) + ' m² · dezelfde vorm als op de plattegrond');

    /* Het opschrift van de bestaande bouw wordt pas aan het eind toegevoegd:
       het volume wordt er ná dit vlak overheen getekend, en dan verdwijnt de
       helft van de letters onder het dak. Hij komt links van het volume te
       staan en loopt naar buiten weg, dus hij kan er ook niet meer onder. */
    var bestaandTekst = '';
    if (D.soort !== 'vrijstaand') {
      out += vlak([p(0, 0, 0), p(w, 0, 0), p(w, 0, extraH), p(0, 0, extraH)], 'url(#best' + u + ')', 'bestaand');
      var hoek = p(0, 0, extraH);
      bestaandTekst = '<text x="' + (hoek[0] - 10) + '" y="' + (hoek[1] - 8) + '" text-anchor="end" class="micro">' +
             esc(T(D.soort === 'dakopbouw' ? 'BESTAANDE WONING ERONDER' : 'BESTAANDE GEVEL')) + '</text>';
    }

    /* Het dakvlak is de plattegrond op dakrandhoogte — bij een L-vorm dus een
       L en geen rechthoek. Daarna de gevels: alleen die met hun buitenzijde
       naar de kijker staan, van achter naar voren getekend zodat een gevel die
       vooraan staat de gevel erachter afdekt. Zonder die sortering staat bij
       een U-vorm de achterwand van de binnenhof vrolijk vóór de zijgevel. */
    out += vlak(vlakP.map(function (q) { return p(q[0], q[1], h); }), D.dak.kleur, 'nieuw');

    var gevels = [];
    for (var i = 0; i < vlakP.length; i++) {
      var a = vlakP[i], c = vlakP[(i + 1) % vlakP.length];
      var mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
      var dx = c[0] - a[0], dy = c[1] - a[1];
      var L = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / L, ny = dx / L;
      if (V && V.inPolygoon(vlakP, mx + nx * 0.01, my + ny * 0.01)) { nx = -nx; ny = -ny; }
      /* Zichtbaar zijn de gevels waarvan de buitenzijde naar de kijker wijst:
         die met een normaal in de +x- of +y-richting. */
      if (nx < 0.5 && ny < 0.5) continue;
      gevels.push({ a: a, c: c, diepte: mx + my, zij: nx > 0.5 });
    }
    gevels.sort(function (x, y) { return x.diepte - y.diepte; });
    gevels.forEach(function (g) {
      var vul = g.zij ? schaduw(D.gevel.kleur, -0.22) : 'url(#gev' + u + ')';
      out += vlak([p(g.a[0], g.a[1], 0), p(g.c[0], g.c[1], 0), p(g.c[0], g.c[1], h), p(g.a[0], g.a[1], h)], vul, 'nieuw');
    });

    /* De pui in de voorste gevel aan de tuinzijde. */
    if (D.pui && D.pui.breedte && V) {
      var bnd = V.banden(vlakP, 'y');
      var voorste = bnd.length ? bnd[bnd.length - 1] : null;
      if (voorste) {
        var bandB = voorste.tot - voorste.van;
        var pb = Math.min(D.pui.tekenBreedte || D.pui.breedte, Math.max(0.9, bandB - 2 * (D.wandDikte || 0.3) - 0.1));
        var px0 = voorste.van + (bandB - pb) / 2, boven = Math.max(0.40, D.dakDikte + 0.12);
        var pz1 = h - boven, pz0 = D.pui.totVloer ? 0.05 : 0.90, yy = voorste.diepte;
        out += vlak([p(px0, yy, pz0), p(px0 + pb, yy, pz0), p(px0 + pb, yy, pz1), p(px0, yy, pz1)], '#DCEEF4', 'nieuw');
        for (var k = 1; k < D.pui.vakken; k++) {
          var xx = px0 + (pb / D.pui.vakken) * k;
          var q1 = p(xx, yy, pz0), q2 = p(xx, yy, pz1);
          out += '<line x1="' + q1[0] + '" y1="' + q1[1] + '" x2="' + q2[0] + '" y2="' + q2[1] +
                 '" stroke="' + D.kozijnkleur + '" stroke-width="3"/>';
        }
      }
    }
    if (D.licht && D.licht.breedte) {
      var lb = Math.min(D.licht.breedte, w * 0.7), ld = Math.min(D.licht.diepte || 1, d * 0.5);
      var lx = (w - lb) / 2, ly = Math.max(0.4, d * 0.3);
      out += vlak([p(lx, ly, h), p(lx + lb, ly, h), p(lx + lb, ly + ld, h), p(lx, ly + ld, h)], '#DCEEF4', 'nieuw');
    }

    out += bestaandTekst;

    function ribmaat(a, bq, tekst, dx, dy) {
      var p1 = p(a[0], a[1], a[2]), p2 = p(bq[0], bq[1], bq[2]);
      var mx = (p1[0] + p2[0]) / 2 + dx, my = (p1[1] + p2[1]) / 2 + dy;
      /* Met aanhaallijntjes van de rib naar de maatlijn: zonder die twee
         streepjes zweeft een maat naast de doos en is niet te zien welke rib
         hij beschrijft. */
      return '<line x1="' + (p1[0] + dx) + '" y1="' + (p1[1] + dy) + '" x2="' + (p2[0] + dx) + '" y2="' + (p2[1] + dy) + '" class="dun"/>' +
             '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + (p1[0] + dx) + '" y2="' + (p1[1] + dy) + '" class="dun"/>' +
             '<line x1="' + p2[0] + '" y1="' + p2[1] + '" x2="' + (p2[0] + dx) + '" y2="' + (p2[1] + dy) + '" class="dun"/>' +
             '<text x="' + mx + '" y="' + (my - 6) + '" text-anchor="middle" class="maatcijfer">' + esc(tekst) + '</text>';
    }
    out += ribmaat([0, d, 0], [w, d, 0], m2(w) + ' m', -16, 30);
    out += ribmaat([w, 0, 0], [w, d, 0], m2(d) + ' m', 18, 26);
    out += ribmaat([w, 0, 0], [w, 0, h], m2(h) + ' m', 42, 0);
    out += schaalbalk(60, VB_H - 58, sc * C);
    out += '<text x="' + (VB_W - 60) + '" y="' + (VB_H - 44) + '" text-anchor="end" class="micro">' +
           esc(T('AXONOMETRISCHE PROJECTIE: GEEN PERSPECTIEF, DUS ELKE RIB IS OP SCHAAL')) + '</text>';
    b.svg = svgDoc(u, D, out);
    b.titel = 'Ruimtelijk';
    b.noot = 'Een axonometrie vertekent niet: alle ribben staan op dezelfde schaal, dus de schaalbalk klopt ' +
      'ook op deze tekening. Wat je hier ziet is precies het volume van de platte aanzichten' +
      (D.vorm && D.vorm.vorm !== 'rechthoek' ? ', inclusief de ' + vormNaam(D.vorm.vorm).toLowerCase() + '.' : '.');
    return b;
  }

  /* ----------------------------------------------------------- op schaal --- */

  /* "Vier bij drie" zegt niemand iets, en dat is de vraag waar de aanvraag
     op stukloopt: past mijn eettafel er nou in of niet. Dit blad zet de
     meubels die de bezoeker al heeft op dezelfde schaal in de plattegrond,
     mét een mens van 1,80 m ernaast. Het is dezelfde gedachte als de
     schaalreferentie op het jachtblad — daar een auto naast een romp van 29
     meter, hier een eettafel in een uitbouw van twaalf vierkante meter.

     Wat er niet gebeurt: een indeling verzinnen. De opstelling is een
     pakking, geen ontwerp, en dat staat er ook bij. */
  var MEUBELS = {
    woon: [
      { l: 'Eettafel 6 personen', b: 2.00, d: 1.00, stoelen: true },
      { l: 'Bank 3-zits', b: 2.40, d: 0.95 },
      { l: 'Salontafel', b: 1.10, d: 0.60 },
      { l: 'Dressoir', b: 1.80, d: 0.45 }
    ],
    slaap: [
      { l: 'Tweepersoonsbed', b: 1.80, d: 2.10 },
      { l: 'Kledingkast', b: 2.00, d: 0.60 },
      { l: 'Nachtkastjes', b: 0.90, d: 0.40 }
    ],
    wonen_klein: [
      { l: 'Eettafel 4 personen', b: 1.40, d: 0.90, stoelen: true },
      { l: 'Bank 2,5-zits', b: 2.00, d: 0.95 },
      { l: 'Bureau', b: 1.40, d: 0.70 }
    ]
  };

  function meubelset(D) {
    if (D.soort === 'dakopbouw') return MEUBELS.slaap;
    if (D.type === 'mantelzorgwoning' || D.type === 'vakantiewoning') return MEUBELS.slaap.concat(MEUBELS.wonen_klein);
    if (D.type === 'tuinstudio') return MEUBELS.wonen_klein;
    return MEUBELS.woon;
  }

  function schaal(D) {
    var b = blad(), u = b.u;
    var V = global.NGBouwvormen;
    var wdM = D.wandDikte || 0.30;
    var buiten = D.vorm ? D.vorm.punten : [[0, 0], [D.w, 0], [D.w, D.dp], [0, D.dp]];
    var binnen = V ? V.inzet(buiten, wdM)
                   : [[wdM, wdM], [D.w - wdM, wdM], [D.w - wdM, D.dp - wdM], [wdM, D.dp - wdM]];
    var binnenOpp = V ? Math.round(V.oppervlak(binnen) * 10) / 10 : 0;
    var P = pas(D.w, D.dp, { links: 150, rechts: 330, boven: 150, onder: 160 });
    var s = P.s;
    function px(x) { return P.x0 + x * s; }
    function py(y) { return P.y0 + y * s; }
    var out = titel(D.typeNaam + ' · op schaal',
      'Binnenwerks ' + m1(binnenOpp) + ' m² · meubels en mens op dezelfde schaal');
    out += '<path d="' + binnen.map(function (q, i) { return (i ? 'L' : 'M') + px(q[0]) + ' ' + py(q[1]); }).join(' ') +
           ' Z" fill="#FFFFFF" class="nieuw"/>';

    /* Pakken langs rijen binnen de omhullende van de binnenruimte, met 30 cm
       tussen de stukken. Wat er niet in past wordt niet kleiner getekend maar
       hieronder opgesomd — en bij een L- of U-vorm wordt ook getoetst of een
       stuk niet half in de hap staat. */
    var xs = binnen.map(function (q) { return q[0]; }), ys = binnen.map(function (q) { return q[1]; });
    var bx0 = Math.min.apply(null, xs), bx1 = Math.max.apply(null, xs);
    var by0 = Math.min.apply(null, ys), by1 = Math.max.apply(null, ys);
    var gap = 0.30, marge = 0.10;
    function paskaart(x, y, w, d) {
      if (!V) return true;
      var e = 0.02;
      return V.inPolygoon(binnen, x + e, y + e) && V.inPolygoon(binnen, x + w - e, y + e) &&
             V.inPolygoon(binnen, x + e, y + d - e) && V.inPolygoon(binnen, x + w - e, y + d - e);
    }
    var cx = bx0 + marge, cy = by0 + marge, rijH = 0, geplaatst = [], niet = [];
    meubelset(D).forEach(function (mb) {
      var mbD = mb.d + (mb.stoelen ? 1.10 : 0);   // stoelen aan twee zijden: 55 cm per kant
      var pogingen = 0, gelukt = false;
      while (pogingen < 60) {
        if (cx + mb.b > bx1 - marge) { cx = bx0 + marge; cy += (rijH || mbD) + gap; rijH = 0; }
        if (cy + mbD > by1 - marge) break;
        if (paskaart(cx, cy, mb.b, mbD)) { gelukt = true; break; }
        cx += 0.30;
        pogingen++;
      }
      if (!gelukt) { niet.push(mb); return; }
      geplaatst.push({ mb: mb, x: cx, y: cy, d: mbD });
      cx += mb.b + gap;
      rijH = Math.max(rijH, mbD);
    });
    geplaatst.forEach(function (g) {
      var x = px(g.x), y = py(g.y);
      if (g.mb.stoelen) {
        out += '<rect x="' + x + '" y="' + y + '" width="' + (g.mb.b * s) + '" height="' + (g.d * s) +
               '" fill="#F4F1E8" class="stippel"/>';
        y += 0.55 * s;
      }
      out += '<rect x="' + x + '" y="' + y + '" width="' + (g.mb.b * s) + '" height="' + (g.mb.d * s) +
             '" fill="#E7E2D5" class="nieuw"/>' +
             '<text x="' + (x + g.mb.b * s / 2) + '" y="' + (y + g.mb.d * s / 2 - 2) + '" text-anchor="middle" class="ruimteopp">' +
             esc(T(g.mb.l)) + '</text>' +
             '<text x="' + (x + g.mb.b * s / 2) + '" y="' + (y + g.mb.d * s / 2 + 14) + '" text-anchor="middle" class="micro">' +
             esc(m2(g.mb.b) + ' × ' + m2(g.mb.d) + ' m') + '</text>';
    });

    /* De mens: 1,80 m lang, van bovenaf een schouderbreedte van 45 cm. */
    var mensR = 0.225 * s;
    var mp = middelpunt(binnen);
    var mx = px(mp[0]), my = py(Math.min(by1 - 0.4, mp[1] + (by1 - mp[1]) * 0.7));
    out += '<circle cx="' + mx + '" cy="' + my + '" r="' + mensR + '" fill="#B9AE93" stroke="#7A7460" stroke-width="1.6"/>' +
           '<text x="' + (mx + mensR + 10) + '" y="' + (my + 4) + '" class="micro">' +
           esc(T('MENS 1,80 M, SCHOUDERS 45 CM')) + '</text>';

    out += maatH(px(bx0), px(bx1), P.y1 + 52, m2(bx1 - bx0) + ' m ' + T('binnenwerks'));
    out += maatV(px(bx0) - 46, py(by0), py(by1), m2(by1 - by0) + ' m');
    out += schaalbalk(P.x0, VB_H - 58, s);

    var lx = VB_W - 300;
    out += '<text x="' + lx + '" y="160" class="legendakop">' + esc(T('PAST IN DEZE MAAT')) + '</text>';
    var ly = 184;
    geplaatst.forEach(function (g) {
      out += '<text x="' + lx + '" y="' + ly + '" class="legenda">' + esc('• ' + T(g.mb.l)) + '</text>';
      ly += 19;
    });
    if (niet.length) {
      ly += 14;
      out += '<text x="' + lx + '" y="' + ly + '" class="legendakop">' + esc(T('PAST NIET IN DEZE MAAT')) + '</text>';
      ly += 24;
      niet.forEach(function (mb) {
        out += '<text x="' + lx + '" y="' + ly + '" class="waarschuwing">' + esc('• ' + T(mb.l)) + '</text>';
        ly += 19;
      });
    }
    b.svg = svgDoc(u, D, out);
    b.titel = 'Op schaal';
    b.noot = 'De meubels staan op dezelfde schaal als de plattegrond, maar de opstelling is een pakking en geen ' +
      'indeling: er is geen loopruimte in verwerkt. ' +
      (D.vorm && D.vorm.vorm !== 'rechthoek' ? 'De hap in de plattegrond telt mee: een stuk dat half in de ' +
        'inspringing zou staan, staat er niet. ' : '') +
      (niet.length ? 'Wat er niet in past staat er als zodanig bij. Dat is de maat waarop een uitbouw te klein wordt.'
                   : 'Alles uit de referentieset past binnen deze maat.');
    return b;
  }

  /* --------------------------------------------------------- materialen --- */

  function staal(x, y, kl, kop, waarde, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="76" height="52" rx="6" fill="' + kl + '" stroke="#B6B1A6"/>' +
      '<text x="' + (x + 92) + '" y="' + (y + 18) + '" class="legendakop">' + esc(T(kop).toUpperCase()) + '</text>' +
      '<text x="' + (x + 92) + '" y="' + (y + 38) + '" class="legenda">' + esc(T(waarde)) + '</text>' +
      (extra ? '<text x="' + (x + 92) + '" y="' + (y + 55) + '" class="micro">' + esc(T(extra)) + '</text>' : '');
  }

  function materialen(D) {
    var b = blad(), u = b.u;
    var out = titel(D.typeNaam + ' · materialen en opbouw',
      'Wat je gekozen hebt, en waar het uit bestaat · ' +
      (D.bouwmethode === 'traditioneel' ? 'traditioneel gemetseld' : 'prefab houtskeletbouw'));
    out += staal(60, 120, D.gevel.kleur, 'Gevel', D.gevel.naam, 'kleur: ' + D.gevel.kleurnaam);
    out += staal(60, 210, D.kozijnkleur, 'Kozijnen', D.pui ? D.pui.naam : 'Geen pui gekozen',
      'kleur: ' + D.kozijnkleurnaam);
    out += staal(60, 300, D.dak.kleur, 'Dakbedekking', D.dak.naam,
      D.dak.overstek ? 'met overstek ' + m2(D.dak.overstek) + ' m' : 'plat dak, afschot min. 16 mm/m');
    out += staal(60, 390, '#DCEEF4', 'Daglicht', D.licht ? D.licht.naam : 'Geen lichtstraat',
      D.licht && D.licht.breedte ? m2(D.licht.diepte) + ' × ' + m2(D.licht.breedte) + ' m'
        : (D.licht ? 'maat nog te bepalen' : ''));
    out += staal(60, 480, '#D9D4C8', D.soort === 'dakopbouw' ? 'Ondergrond' : 'Fundering',
      D.soort === 'dakopbouw' ? 'Bestaande draagconstructie'
        : (D.fundering === 'palen' ? 'Hei-/schroefpalen' : D.fundering === 'poeren' ? 'Poerenfundering' : 'Strokenfundering'),
      D.soort === 'dakopbouw' ? 'toetsing verplicht' : 'diepte projectspecifiek');

    /* De warmteweerstand als strook onderaan, met per onderdeel het gerekende
       getal en de eis ernaast. Onderaan en niet naast de staaltjes: daar botste
       hij met de fundering, en drie regels die elkaar overlappen zeggen minder
       dan geen regel. */
    function rcRegel(x, y, kop, r, eis) {
      if (!r) return '';
      var haalt = r.rc >= eis;
      return '<text x="' + x + '" y="' + y + '" class="legendakop">' + esc(T(kop).toUpperCase()) + '</text>' +
        '<text x="' + x + '" y="' + (y + 20) + '" class="laagmm">Rc ' + esc(m2(r.rc)) + ' m²·K/W</text>' +
        '<text x="' + x + '" y="' + (y + 38) + '" class="' + (haalt ? 'legenda' : 'waarschuwing') + '">' +
        esc((haalt ? T('haalt de nieuwbouweis van ') : T('onder de nieuwbouweis van ')) + m2(eis)) + '</text>';
    }
    var N = global.NGBouwnormen;
    if (D.rc && N) {
      var ry = VB_H - 92;
      out += '<line x1="60" y1="' + (ry - 22) + '" x2="' + (VB_W - 60) + '" y2="' + (ry - 22) + '" class="dun"/>';
      out += rcRegel(60, ry, 'Gevel', D.rc.gevel, N.RC_EIS.nieuwbouw.gevel);
      out += rcRegel(340, ry, 'Dak', D.rc.dak, N.RC_EIS.nieuwbouw.dak);
      if (D.rc.vloer) out += rcRegel(620, ry, 'Vloer', D.rc.vloer, N.RC_EIS.nieuwbouw.vloer);
      out += '<text x="' + (VB_W - 60) + '" y="' + (VB_H - 18) + '" text-anchor="end" class="micro">' +
             esc(T('GEREKEND UIT DE LAGEN HIERBOVEN; VOLLEDIGE TOETS OP HET BLAD TOETS')) + '</text>';
    }
    out += lagenlijst(560, 140, 300, 'Gevelopbouw ' + (D.wand ? D.wand.code : ''), D.wand && D.wand.lagen);
    out += lagenlijst(900, 140, 260, 'Dakopbouw', D.daklagen);
    out += lagenlijst(900, 140 + 40 + 17 * ((D.daklagen || []).length) + 40, 260, 'Vloeropbouw', D.vloeropbouw);
    if (D.wand && D.wand.noot) {
      out += '<text x="560" y="400" class="micro">' + esc(T('OVER DEZE GEVEL')) + '</text>';
      /* De noot van de gevelopbouw in regels van rond de zeventig tekens: SVG
         breekt tekst niet zelf af. */
      var woorden = String(D.wand.noot).split(' '), regel = '', regels = [];
      woorden.forEach(function (wo) {
        if ((regel + ' ' + wo).length > 48) { regels.push(regel); regel = wo; }
        else regel = regel ? regel + ' ' + wo : wo;
      });
      if (regel) regels.push(regel);
      regels.slice(0, 5).forEach(function (r, i) {
        out += '<text x="560" y="' + (420 + i * 16) + '" class="laagtekst">' + esc(T(r)) + '</text>';
      });
    }
    b.svg = svgDoc(u, D, out);
    b.titel = 'Materialen';
    b.noot = 'De opbouwstaten komen uit dezelfde bouwkundige kern die de materiaalstaat en de technische ' +
      'tekeningen vult. Wat hier 100 mm isolatie heet, is ook 100 mm op de bestellijst.';
    return b;
  }

  /* --------------------------------------------------------- constructie --- */

  function constructie(D) {
    var b = blad(), u = b.u;
    var K = global.NGBouwconstructie;
    var V = global.NGBouwvormen;
    var out = titel(D.typeNaam + ' · draagconstructie',
      'Balken, liggers en profielen · voordimensionering, ter controle door de constructeur');
    if (!K) {
      out += '<text x="60" y="200" class="legenda">' +
             esc(T('De constructiemodule is niet geladen, dus er valt niets te tekenen.')) + '</text>';
      b.svg = svgDoc(u, D, out); b.titel = 'Constructie';
      b.noot = 'De constructiemodule is niet geladen.';
      return b;
    }
    var C = K.lees(D);
    var P = pas(D.w, D.dp, { links: 120, rechts: 560, boven: 150, onder: 150 });
    var s = P.s;
    function px(x) { return P.x0 + x * s; }
    function py(y) { return P.y0 + y * s; }
    var buiten = D.vorm ? D.vorm.punten : [[0, 0], [D.w, 0], [D.w, D.dp], [0, D.dp]];
    out += '<path d="' + buiten.map(function (q, i) { return (i ? 'L' : 'M') + px(q[0]) + ' ' + py(q[1]); }).join(' ') +
           ' Z" fill="#FFFFFF" class="nieuw"/>';

    /* Het balkenplan: elke balk apart getekend, op de werkelijke hart-op-
       hartmaat. Niet een raster met "h.o.h. 600" ernaast, maar de balken zelf
       — dan is meteen te zien dat er bij een lichtstraat een raveling nodig
       is en dat de balken bij een L-vorm niet doorlopen. */
    C.onderdelen.forEach(function (o) {
      if (o.soort !== 'dakbalk') return;
      var d = o.deel;
      var n = Math.floor((o.richting === 'x' ? (d.y1 - d.y0) : (d.x1 - d.x0)) / o.hoh);
      for (var i = 0; i <= n; i++) {
        var t = Math.min(i * o.hoh, (o.richting === 'x' ? d.y1 - d.y0 : d.x1 - d.x0));
        if (o.richting === 'x') {
          var y = d.y0 + t;
          out += '<line x1="' + px(d.x0) + '" y1="' + py(y) + '" x2="' + px(d.x1) + '" y2="' + py(y) +
                 '" stroke="#8A7B4E" stroke-width="2.2"/>';
        } else {
          var x = d.x0 + t;
          out += '<line x1="' + px(x) + '" y1="' + py(d.y0) + '" x2="' + px(x) + '" y2="' + py(d.y1) +
                 '" stroke="#8A7B4E" stroke-width="2.2"/>';
        }
      }
      var cx = px((d.x0 + d.x1) / 2), cy = py((d.y0 + d.y1) / 2);
      out += '<rect x="' + (cx - 32) + '" y="' + (cy - 16) + '" width="64" height="26" rx="5" fill="#FFFFFF" stroke="#8A7B4E"/>' +
             '<text x="' + cx + '" y="' + (cy + 2) + '" text-anchor="middle" class="ruimteopp">' + esc(o.code) + '</text>';
    });

    /* Het trapgat en zijn raveling. Zonder dit lopen de vloerbalken op de
       tekening dwars door het gat heen — en dat is precies het onderdeel dat
       in het werk het meeste kost. Het gat wordt wit uitgespaard en de twee
       raveelbalken komen er dik omheen te liggen. */
    var gatC = trapgatVlak(D, (function () {
      var wd = D.wandDikte || 0.30;
      var bin = V ? V.inzet(buiten, wd) : [[wd, wd], [D.w - wd, wd], [D.w - wd, D.dp - wd], [wd, D.dp - wd]];
      var xs = bin.map(function (q) { return q[0]; }), ys = bin.map(function (q) { return q[1]; });
      return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs),
               y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
    })());
    var ravelC = C.onderdelen.filter(function (o) { return o.soort === 'raveling'; })[0];
    if (gatC) {
      out += '<rect x="' + px(gatC.x0) + '" y="' + py(gatC.y0) + '" width="' + ((gatC.x1 - gatC.x0) * s) +
             '" height="' + ((gatC.y1 - gatC.y0) * s) + '" fill="#FBFAF7" stroke="#3A3833" stroke-width="1.4"/>';
      /* De raveelbalken liggen dwars op de balkrichting, aan de twee koppen
         van het gat. De balken lopen in de korte richting van het vlak, dus
         staat de raveling in de lange richting van het gat. */
      var langsX = (gatC.x1 - gatC.x0) >= (gatC.y1 - gatC.y0);
      if (langsX) {
        out += '<line x1="' + px(gatC.x0) + '" y1="' + py(gatC.y0) + '" x2="' + px(gatC.x1) + '" y2="' + py(gatC.y0) + '" stroke="#1F3B57" stroke-width="7" stroke-linecap="round"/>' +
               '<line x1="' + px(gatC.x0) + '" y1="' + py(gatC.y1) + '" x2="' + px(gatC.x1) + '" y2="' + py(gatC.y1) + '" stroke="#1F3B57" stroke-width="7" stroke-linecap="round"/>';
      } else {
        out += '<line x1="' + px(gatC.x0) + '" y1="' + py(gatC.y0) + '" x2="' + px(gatC.x0) + '" y2="' + py(gatC.y1) + '" stroke="#1F3B57" stroke-width="7" stroke-linecap="round"/>' +
               '<line x1="' + px(gatC.x1) + '" y1="' + py(gatC.y0) + '" x2="' + px(gatC.x1) + '" y2="' + py(gatC.y1) + '" stroke="#1F3B57" stroke-width="7" stroke-linecap="round"/>';
      }
      var gcx = px((gatC.x0 + gatC.x1) / 2), gcy = py((gatC.y0 + gatC.y1) / 2);
      out += '<text x="' + gcx + '" y="' + (gcy + 4) + '" text-anchor="middle" class="ruimteopp">' +
             esc((ravelC ? ravelC.code : 'R-01') + ' ' + T('trapgat')) + '</text>';
    }

    /* De moerbalken en de lateien in staal: dik, donker en met hun code erbij. */
    C.onderdelen.forEach(function (o) {
      if (o.soort === 'moerbalk' && o.lijn) {
        out += '<line x1="' + px(o.lijn.x) + '" y1="' + py(o.lijn.y0) + '" x2="' + px(o.lijn.x) + '" y2="' + py(o.lijn.y1) +
               '" stroke="#1F3B57" stroke-width="8" stroke-linecap="round"/>' +
               '<text x="' + (px(o.lijn.x) + 12) + '" y="' + (py((o.lijn.y0 + o.lijn.y1) / 2)) + '" class="ruimteopp">' +
               esc(o.code) + '</text>';
      }
    });
    /* De latei ligt in de gevel die naar de tuin kijkt. */
    var voorste = V ? (function () { var bn = V.banden(buiten, 'y'); return bn.length ? bn[bn.length - 1] : null; })() : null;
    var latei = C.onderdelen.filter(function (o) { return o.soort === 'latei' && o.profiel; })[0];
    if (latei && voorste) {
      var lb = Math.min(latei.overspanning, voorste.tot - voorste.van);
      var lx0 = px((voorste.van + voorste.tot) / 2 - lb / 2), lx1 = px((voorste.van + voorste.tot) / 2 + lb / 2);
      out += '<line x1="' + lx0 + '" y1="' + py(voorste.diepte) + '" x2="' + lx1 + '" y2="' + py(voorste.diepte) +
             '" stroke="#1F3B57" stroke-width="8" stroke-linecap="round"/>' +
             '<text x="' + ((lx0 + lx1) / 2) + '" y="' + (py(voorste.diepte) + 24) + '" text-anchor="middle" class="ruimteopp">' +
             esc(latei.code) + '</text>';
    }
    var dbo = C.onderdelen.filter(function (o) { return o.soort === 'doorbraak'; })[0];
    if (dbo) {
      var dbw = D.doorbraak * s, dbx = px(D.w / 2) - dbw / 2;
      out += '<line x1="' + dbx + '" y1="' + py(0) + '" x2="' + (dbx + dbw) + '" y2="' + py(0) +
             '" stroke="#A32323" stroke-width="8" stroke-linecap="round"/>' +
             '<text x="' + (dbx + dbw / 2) + '" y="' + (py(0) - 12) + '" text-anchor="middle" class="ruimteopp">' +
             esc(dbo.code) + '</text>';
    }
    out += schaalbalk(P.x0, VB_H - 58, s);

    /* De staat rechts: per onderdeel de overspanning en het profiel. */
    var lx = 660, ly = 150;
    out += '<text x="' + lx + '" y="' + ly + '" class="legendakop">' + esc(T('CONSTRUCTIEONDERDELEN')) + '</text>';
    ly += 26;
    out += '<text x="' + lx + '" y="' + ly + '" class="micro">' + esc(T('CODE')) + '</text>' +
           '<text x="' + (lx + 62) + '" y="' + ly + '" class="micro">' + esc(T('ONDERDEEL')) + '</text>' +
           '<text x="' + (lx + 330) + '" y="' + ly + '" class="micro">' + esc(T('OVERSP.')) + '</text>' +
           '<text x="' + (lx + 420) + '" y="' + ly + '" class="micro">' + esc(T('PROFIEL')) + '</text>';
    ly += 6;
    out += '<line x1="' + lx + '" y1="' + ly + '" x2="' + (lx + 500) + '" y2="' + ly + '" class="dun"/>';
    ly += 20;
    var geweigerd = [];
    C.onderdelen.forEach(function (o) {
      var naam = T(o.naam);
      if (naam.length > 42) naam = naam.slice(0, 41) + '…';
      out += '<text x="' + lx + '" y="' + ly + '" class="laagmm">' + esc(o.code) + '</text>' +
             '<text x="' + (lx + 62) + '" y="' + ly + '" class="laagtekst">' + esc(naam) + '</text>' +
             '<text x="' + (lx + 330) + '" y="' + ly + '" class="laagtekst">' +
             esc(o.overspanning ? m2(o.overspanning) + ' m' : '–') + '</text>';
      if (o.profiel) {
        out += '<text x="' + (lx + 420) + '" y="' + ly + '" class="laagmm">' +
               esc(o.profiel.naam || o.profiel) + '</text>';
      } else if (o.geweigerd) {
        out += '<text x="' + (lx + 420) + '" y="' + ly + '" class="waarschuwing">' + esc(T('CONSTRUCTEUR')) + '</text>';
        geweigerd.push(o);
      } else {
        out += '<text x="' + (lx + 420) + '" y="' + ly + '" class="laagtekst">' + esc(T('geen profiel')) + '</text>';
      }
      ly += 21;
      if (o.materiaal) {
        out += '<text x="' + (lx + 62) + '" y="' + ly + '" class="micro">' + esc(T(o.materiaal)) + '</text>';
        ly += 18;
      }
    });
    ly += 12;
    out += '<text x="' + lx + '" y="' + ly + '" class="legendakop">' + esc(T('TE BEVESTIGEN DOOR DE CONSTRUCTEUR')) + '</text>';
    ly += 20;
    C.controle.slice(0, 4).forEach(function (r) {
      var tekst = T(r);
      if (tekst.length > 78) tekst = tekst.slice(0, 77) + '…';
      out += '<text x="' + lx + '" y="' + ly + '" class="micro">' + esc('• ' + tekst) + '</text>';
      ly += 16;
    });
    out += '<text x="' + (VB_W - 60) + '" y="' + (VB_H - 26) + '" text-anchor="end" class="waarschuwing">' +
           esc(T('VOORDIMENSIONERING, GEEN GEWAARMERKTE CONSTRUCTIEBEREKENING')) + '</text>';

    b.svg = svgDoc(u, D, out);
    b.titel = 'Constructie';
    b.noot = 'De houten dakbalken zijn voorgedimensioneerd volgens Eurocode 5, het staal volgens Eurocode 3, ' +
      'met dezelfde modules waarmee de knop Balkberekening DB-01 rekent, dus de tekening en dat rapport noemen ' +
      'hetzelfde profiel. ' +
      (D.vorm && D.vorm.vorm !== 'rechthoek'
        ? 'Op de knik in de plattegrond ligt een stalen moerbalk: daar eindigen de dakbalken van beide delen. '
        : '') +
      (geweigerd.length
        ? 'Voor ' + geweigerd.length + ' onderdeel' + (geweigerd.length > 1 ? 'en' : '') +
          ' geeft de voordimensionering geen profiel; die gaan rechtstreeks naar de constructeur.'
        : 'Elk onderdeel heeft een profiel dat de vier controles haalt; de constructeur bevestigt ze.');
    return b;
  }

  /* -------------------------------------------------------------- toets --- */

  /* De toets op hoofdlijnen. Wat hier staat volgt uit de geometrie en de
     opbouw; alles wat van het perceel, de buren of de gemeente afhangt staat
     er nadrukkelijk niet in en dat staat er ook bij. */
  function toetsen(D) {
    var N = global.NGBouwnormen;
    if (!N) return null;
    var V = global.NGBouwvormen;
    var wdM = D.wandDikte || 0.30;
    var buiten = D.vorm ? D.vorm.punten : [[0, 0], [D.w, 0], [D.w, D.dp], [0, D.dp]];
    var binnenOpp = V ? Math.round(V.oppervlak(V.inzet(buiten, wdM)) * 10) / 10
                      : Math.round((D.w - 2 * wdM) * (D.dp - 2 * wdM) * 10) / 10;
    var rijen = [];

    if (D.rc && D.rc.gevel) {
      rijen.push(N.toets('Warmteweerstand gevel', D.rc.gevel.rc, N.RC_EIS.nieuwbouw.gevel, 'm²·K/W', 'min',
        D.bouwmethode === 'traditioneel' ? 'Gemetselde spouwmuur; het buitenblad telt niet mee.' : 'Prefab houtskeletbouw.'));
    }
    if (D.rc && D.rc.dak) {
      rijen.push(N.toets('Warmteweerstand dak', D.rc.dak.rc, N.RC_EIS.nieuwbouw.dak, 'm²·K/W', 'min',
        'Warm dak: de isolatie ligt boven het dakbeschot.'));
    }
    if (D.rc && D.rc.vloer && D.soort !== 'dakopbouw') {
      rijen.push(N.toets('Warmteweerstand vloer', D.rc.vloer.rc, N.RC_EIS.nieuwbouw.vloer, 'm²·K/W', 'min',
        'Vloer op grondslag; het zandbed telt niet mee.'));
    }

    /* De vrije hoogte is de dakrand min de dakopbouw. Bij 2,80 m dakrand en
       389 mm dakopbouw blijft er 2,41 m over, en dat is onder het
       nieuwbouwniveau van 2,60 m. Dat is geen fout in de tekening maar een
       gevolg van de gekozen hoogte, en precies daarom hoort het hier. */
    if (D.dakDikte) {
      var vrij = Math.round((D.h - D.dakDikte) * 100) / 100;
      /* "Een uitbouw telt als verbouw" stond hier ook op het dakopbouwblad. De
         naam van het product zelf staat er nu, anders leest een klant met een
         dakopbouw een zin over iets wat hij niet koopt. */
      rijen.push(N.toets('Vrije hoogte verblijfsgebied', vrij, N.VRIJE_HOOGTE.nieuwbouw, 'm', 'min',
        'Verbouwniveau is ' + m2(N.VRIJE_HOOGTE.verbouw) + ' m; ' +
        (D.soort === 'vrijstaand'
          ? 'een vrijstaand bijgebouw wordt op nieuwbouwniveau beoordeeld.'
          : 'een ' + String(D.typeNaam || 'aanbouw').toLowerCase() + ' telt juridisch als verbouw.')));
    }

    /* Daglicht: het glasoppervlak van de pui en de lichtstraat tegen 10% van
       de vloer. De equivalente daglichtoppervlakte houdt ook rekening met
       belemmering door de omgeving, en die kent de configurator niet — dus
       staat het glasoppervlak er, met die beperking erbij. */
    var glas = 0;
    /* Het glas komt uit dezelfde kozijnlijst die de plattegrond tekent. Dat is
       het hele punt: haalt de bezoeker een raam weg of zet hij er een bij, dan
       verschuift deze toets mee. Een daglichttoets die alleen naar de pui
       kijkt zou na het eerste sleepje niet meer over deze woning gaan. */
    (inrichting(D).kozijnen || []).forEach(function (K) {
      /* 20% kozijnhout gaat van de dagmaat af; dat is de gangbare vuistregel
         waar het glasoppervlak uit een kozijnmaat wordt geschat. */
      glas += num(K.b, 0) * num(K.h, 0) * 0.80;
    });
    if (D.licht && D.licht.breedte) glas += D.licht.breedte * (D.licht.diepte || 1) * 0.85;
    rijen.push(N.toets('Daglichtoppervlakte', Math.round(glas * 100) / 100,
      Math.round(binnenOpp * N.DAGLICHT.deelNieuwbouw * 100) / 100, 'm²', 'min',
      'Tien procent van ' + m1(binnenOpp) + ' m² vloer. Gerekend op glasoppervlak; belemmering door de omgeving is niet meegenomen.'));

    /* Ventilatie: geen ja of nee maar een capaciteit die de installateur moet
       halen. Hij staat als eis en de waarde is dezelfde — dat is geen toets
       maar een opgave, en zo staat hij er ook. */
    var vent = Math.max(N.VENTILATIE.minimum, Math.round(binnenOpp * N.VENTILATIE.perM2 * 10) / 10);
    rijen.push({ naam: 'Ventilatiecapaciteit', waarde: vent, eis: vent, eenheid: 'dm³/s',
      voldoet: null, richting: 'min', marge: 0,
      uitleg: '0,9 dm³/s per m² vloer, minimaal 7 dm³/s. Dit is de opgave voor de installateur, geen toets.' });

    if (D.soort === 'dakopbouw' && D.trapgat) {
      /* De trap zelf: bij een verdiepingshoogte van 2,80 m zijn er vijftien
         optreden van 187 mm nodig, en veertien aantreden van 220 mm beslaan
         3,08 m vloer beneden. Dat is een andere maat dan het trapgat en wordt
         daarom apart genoemd — ze worden vaak door elkaar gehaald. */
      var rise = 2.80;
      var n = Math.ceil(rise / N.TRAP.optredeMax);
      var optrede = Math.round((rise / n) * 1000) / 1000;
      var gaanderij = Math.round((n - 1) * N.TRAP.aantredeMin * 100) / 100;
      rijen.push(N.toets('Optrede van de trap', optrede, N.TRAP.optredeMax, 'm', 'max',
        n + ' treden bij een verdiepingshoogte van ' + m2(rise) + ' m (aanname).'));
      rijen.push({ naam: 'Vloerruimte voor de trap beneden', waarde: gaanderij, eis: gaanderij, eenheid: 'm',
        voldoet: null, richting: 'min', marge: 0,
        uitleg: 'De trap beslaat dit stuk vloer in de ruimte eronder. Dat is niet hetzelfde als het trapgat van 2,60 m.' });
    }
    if (D.dakterras) {
      rijen.push({ naam: 'Vloerafscheiding dakterras', waarde: N.AFSCHEIDING.hoogte, eis: N.AFSCHEIDING.hoogte,
        eenheid: 'm', voldoet: null, richting: 'min', marge: 0,
        uitleg: 'Bij een hoogteverschil van meer dan 1,0 m is een afscheiding van ten minste 1,0 m verplicht.' });
    }
    return { rijen: rijen, binnenOpp: binnenOpp, voorbehoud: N.voorbehoud };
  }

  function toets(D) {
    var b = blad(), u = b.u;
    var out = titel(D.typeNaam + ' · toets op hoofdlijnen',
      'Besluit bouwwerken leefomgeving · nieuwbouwniveau, met het verbouwniveau erbij vermeld');
    var R = toetsen(D);
    if (!R) {
      out += '<text x="60" y="200" class="legenda">' + esc(T('De normenmodule is niet geladen.')) + '</text>';
      b.svg = svgDoc(u, D, out); b.titel = 'Toets';
      b.noot = 'De normenmodule is niet geladen, dus er is niet getoetst.';
      return b;
    }
    var y = 148;
    out += '<text x="60" y="' + y + '" class="micro">' + esc(T('ONDERDEEL')) + '</text>' +
           '<text x="560" y="' + y + '" text-anchor="end" class="micro">' + esc(T('WAARDE')) + '</text>' +
           '<text x="700" y="' + y + '" text-anchor="end" class="micro">' + esc(T('EIS')) + '</text>' +
           '<text x="760" y="' + y + '" class="micro">' + esc(T('OORDEEL')) + '</text>';
    y += 8;
    out += '<line x1="60" y1="' + y + '" x2="1140" y2="' + y + '" class="dun"/>';
    y += 26;
    var mis = 0;
    R.rijen.forEach(function (r) {
      var waarde = m2(r.waarde) + ' ' + r.eenheid;
      var eis = (r.richting === 'max' ? '≤ ' : '≥ ') + m2(r.eis) + ' ' + r.eenheid;
      out += '<text x="60" y="' + y + '" class="legenda">' + esc(T(r.naam)) + '</text>' +
             '<text x="560" y="' + y + '" text-anchor="end" class="laagmm">' + esc(waarde) + '</text>';
      if (r.voldoet === null) {
        out += '<text x="700" y="' + y + '" text-anchor="end" class="laagtekst">' + esc(T('opgave')) + '</text>' +
               '<text x="760" y="' + y + '" class="laagtekst">' + esc(T('ter informatie')) + '</text>';
      } else {
        out += '<text x="700" y="' + y + '" text-anchor="end" class="laagtekst">' + esc(eis) + '</text>';
        out += r.voldoet
          ? '<text x="760" y="' + y + '" class="laagmm" fill="#2F6B3A">' + esc(T('voldoet')) + '</text>'
          : '<text x="760" y="' + y + '" class="waarschuwing">' + esc(T('voldoet niet aan nieuwbouw')) + '</text>';
        if (!r.voldoet) mis++;
      }
      y += 18;
      var uit = T(r.uitleg || '');
      if (uit.length > 118) uit = uit.slice(0, 117) + '…';
      out += '<text x="60" y="' + y + '" class="micro">' + esc(uit) + '</text>';
      y += 24;
    });
    y += 10;
    /* Eén attentiepunt dat geen toets is en dat ook niet mag worden: of het
       bouwwerk vergunningvrij is hangt af van het perceel, het omgevingsplan
       en de buren. De diepte is er één voorwaarde van; de rest weet alleen de
       gemeente. */
    if (D.soort === 'aangebouwd') {
      out += '<text x="60" y="' + y + '" class="legendakop">' + esc(T('ATTENTIEPUNT, GEEN OORDEEL')) + '</text>';
      y += 20;
      out += '<text x="60" y="' + y + '" class="legenda">' +
             esc('De uitbouw is ' + m2(D.dp) + ' m diep. Vier meter vanaf de oorspronkelijke achtergevel is één van de ' +
                 'voorwaarden waaronder een aanbouw vergunningvrij kan zijn.') + '</text>';
      y += 18;
      out += '<text x="60" y="' + y + '" class="micro">' +
             esc(T('De overige voorwaarden (bebouwingsgebied, hoogte, afstand tot de erfgrens, het omgevingsplan) ' +
                   'beoordeelt je gemeente. Dit is geen vergunningstoets.')) + '</text>';
      y += 28;
    }
    var voor = T(R.voorbehoud), regels = [], regel = '';
    voor.split(' ').forEach(function (wo) {
      if ((regel + ' ' + wo).length > 130) { regels.push(regel); regel = wo; } else regel = regel ? regel + ' ' + wo : wo;
    });
    if (regel) regels.push(regel);
    regels.forEach(function (r) {
      out += '<text x="60" y="' + y + '" class="micro">' + esc(r) + '</text>';
      y += 16;
    });
    b.svg = svgDoc(u, D, out);
    b.titel = 'Toets';
    /* Bij een vrijstaand gebouw gaat de vlieger "het is verbouw" niet op: een
       mantelzorgwoning is nieuwbouw en wordt ook zo beoordeeld. Die zin stond
       er wél, en dat is precies het soort geruststelling waar een klant later
       niets aan heeft. */
    b.noot = (mis
      ? mis + ' onderdeel' + (mis > 1 ? 'en halen' : ' haalt') + ' het nieuwbouwniveau niet. ' +
        (D.soort === 'vrijstaand'
          ? 'Bij een vrijstaand gebouw is dat geen formaliteit: dit is nieuwbouw en wordt ook zo beoordeeld. ' +
            'Bespreek dit met je aannemer voordat er gebouwd wordt.'
          : 'Dat betekent niet dat het niet mag: een ' + String(D.typeNaam || 'aanbouw').toLowerCase() +
            ' telt juridisch als verbouw en daar gelden lagere ondergrenzen. Het is wel het getal om ' +
            'te bespreken voordat er gebouwd wordt.')
      : 'Alle getoetste onderdelen halen het nieuwbouwniveau.') +
      ' Constructie, brandveiligheid, geluid en het omgevingsplan zitten niet in deze toets.';
    return b;
  }

  /* -------------------------------------------------------------- register --- */

  var BLADEN = [
    { v: 'voor',        l: 'Vooraanzicht', fn: voor },
    { v: 'zij',         l: 'Zijaanzicht',  fn: zij },
    { v: 'achter',      l: 'Achteraanzicht', fn: achter },
    { v: 'plattegrond', l: 'Plattegrond',  fn: plattegrond },
    { v: 'doorsnede',   l: 'Doorsnede',    fn: doorsnede },
    { v: 'ruimtelijk',  l: 'Ruimtelijk',   fn: isometrie },
    { v: 'constructie', l: 'Constructie',  fn: constructie },
    { v: 'schaal',      l: 'Op schaal',    fn: schaal },
    { v: 'materialen',  l: 'Materialen',   fn: materialen },
    { v: 'toets',       l: 'Toets',        fn: toets }
  ];

  function bladen(D) {
    return BLADEN.map(function (bl) {
      return { v: bl.v, l: bl.v === 'achter' && D && D.soort === 'aangebouwd' ? 'Doorbraak' : bl.l };
    });
  }

  function teken(naam, cfg, m) {
    var D = (cfg && cfg.soort && cfg.gevel) ? cfg : lees(cfg, m);
    var gekozen = null;
    BLADEN.forEach(function (bl) { if (bl.v === naam) gekozen = bl; });
    if (!gekozen) gekozen = BLADEN[0];
    var r = gekozen.fn(D);
    return { v: gekozen.v, titel: r.titel,
             svg: benoem(r.svg, D.typeNaam + ' · ' + r.titel, r.noot),
             noot: r.noot, model: r.model || null, D: D };
  }

  /* --------------------------------------------------- kozijnen en geld --- */

  /* De kozijntarieven. Vastgesteld door de eigenaar en in gebruik — dit is
     geen openstaande invuloefening meer. Ze blijven wél richtbedragen: de
     definitieve prijs komt uit de offerte, net als bij de rest van de
     configurator.

     Ze staan hier en niet in de twee configuratorpagina's, omdat de telling
     van de kozijnen hier ook staat: twee kopieën van een tarief lopen vroeg of
     laat uit elkaar, en dan noemt de ene pagina een ander bedrag dan de
     andere voor precies hetzelfde raam. Wijzigen doet u dus hier, één keer.

     De basisprijs per m² bevat het standaardvoorstel: één kozijn per
     verblijfsruimte plus de gekozen pui. Wat de bezoeker daarna zelf bijzet is
     meerwerk en wat hij weghaalt is minderwerk — zoals in een echte offerte,
     en niet zoals in een configurator waar extra glas gratis is. */
  var KOZIJNPRIJS = {
    perM2: 780,          // kozijn met HR++ beglazing, geleverd en gesteld
    perStuk: 350,        // sparing, raveling of latei, aftimmering en afwerking
    deurToeslag: 450     // hang- en sluitwerk, dorpel en drempel
  };

  /* Wat er aan kozijnen in staat, wat daarvan in de prijs zit en wat er dus
     bij of af moet. De pui blijft buiten deze rekening: die heeft zijn eigen
     regel in de keuzelijst en zou hier voor de tweede keer betaald worden. */
  function kozijnstaat(cfg, m) {
    var D = (cfg && cfg.soort && cfg.gevel) ? cfg : lees(cfg, m);
    var INR = inrichting(D);
    var lijst = (INR.kozijnen || []).filter(function (K) { return K.soort !== 'pui'; });
    var opp = 0, deuren = 0, bedrag = 0;
    lijst.forEach(function (K) {
      var o = num(K.b, 0) * num(K.h, 0);
      opp += o;
      if (K.soort === 'deur') deuren++;
      bedrag += o * KOZIJNPRIJS.perM2 + KOZIJNPRIJS.perStuk +
                (K.soort === 'deur' ? KOZIJNPRIJS.deurToeslag : 0);
    });
    /* Het inbegrepen bedrag is het standaardaantal tegen de gemiddelde prijs
       van wat er nú staat. Afrekenen tegen een verzonnen standaardraam zou bij
       een gevel vol grote ramen een minderprijs opleveren die groter is dan het
       meerwerk zelf — dan verdient iemand geld door ramen bij te zetten. Staat
       er niets meer, dan is het referentiekozijn 1,00 × 1,50 m: het raam dat
       het voorstel zelf ook zou hebben getekend. */
    var gemiddeld = lijst.length ? bedrag / lijst.length
                                 : 1.00 * 1.50 * KOZIJNPRIJS.perM2 + KOZIJNPRIJS.perStuk;
    var inbegrepen = INR.standaardKozijnen * gemiddeld;
    return {
      lijst: lijst,
      aantal: lijst.length,
      deuren: deuren,
      standaard: INR.standaardKozijnen,
      eigen: !!INR.eigenGevel,
      oppervlak: Math.round(opp * 100) / 100,
      /* Naar boven op vijfentwintig euro: een meerprijs van 1 187,43 suggereert
         een nauwkeurigheid die een richtbedrag niet heeft. */
      meerprijs: Math.round((bedrag - inbegrepen) / 25) * 25,
      tarief: KOZIJNPRIJS
    };
  }

  global.NGBouwAanzichten = {
    lees: lees,
    kozijnstaat: kozijnstaat,
    KOZIJNPRIJS: KOZIJNPRIJS,
    bladen: bladen,
    toetsen: toetsen,
    inrichting: inrichting,
    teken: teken,
    /* Alle acht bladen achter elkaar — voor de afdruk en het dossier. */
    alle: function (cfg, m) {
      var D = lees(cfg, m);
      return BLADEN.map(function (bl) {
        var r = bl.fn(D);
        return { v: bl.v, titel: r.titel,
                 svg: benoem(r.svg, D.typeNaam + ' · ' + r.titel, r.noot), noot: r.noot };
      });
    },
    palet: function (extra) { PALET_EXTRA = extra || {}; },
    woorden: function (fn) { if (typeof fn === 'function') vertaler = fn; },
    /* Het tekengereedschap, zodat een tweede motor — de tuinbouwwerken —
       dezelfde maatlijnen, peilmerken en schaalbalken gebruikt. Eén uiterlijk
       op één plek: twee kopieën van een maatlijn gaan er na de eerste
       aanpassing anders uitzien, en dan zien twee bladen in hetzelfde dossier
       er niet meer uit alsof ze bij elkaar horen. */
    gereedschap: {
      blad: blad, svgDoc: svgDoc, stijlen: stijlen, titel: titel,
      maatH: maatH, maatV: maatV, peil: peil, schaalbalk: schaalbalk,
      grondlijn: grondlijn, breukstreep: breukstreep, pas: pas, benoem: benoem,
      esc: esc, m2: m2, m1: m1, mm: mm, kleur: kleur, schaduw: schaduw,
      num: num, T: T, VB_W: VB_W, VB_H: VB_H
    },
    _hulp: { puiUitWaarde: puiUitWaarde, lichtUitWaarde: lichtUitWaarde, soortVan: soortVan,
             kleur: kleur, esc: esc, m2: m2, m1: m1, mm: mm, dikte: dikte, schaduw: schaduw, pas: pas }
  };
})(typeof window !== 'undefined' ? window : globalThis);
