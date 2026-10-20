/* Tegelconfigurator — het voorbeeld wordt getekend, niet opgehaald.
 *
 * Alle andere configurators op deze site werken met een bibliotheek
 * voorgerenderde beelden. Dat heeft één hardnekkig probleem: bij elke nieuwe
 * optie moet er per combinatie een beeld bij, en er is altijd een combinatie
 * waar er geen is. Bij tegels hoeft dat niet. Een tegelvlak is een raster met
 * voegen: formaat, verband en voegbreedte zijn meetkunde, en de tegel zelf is
 * een kleur met structuur. Dat tekent de browser zelf, en dan klopt elke
 * combinatie per definitie.
 *
 * Een plat vlak is alleen geen badkamer. Daarom worden de tegels ook in echte
 * ruimtes gelegd: een badkamer en een toilet die hier in perspectief worden
 * opgebouwd, en een woonkamer die een echte foto is. Voor die foto is de
 * cameraopstelling uitgemeten aan de voegen die er al in liggen — verdwijnpunt
 * (535,172) en (2960,172), brandpunt 703 px, camerahoogte 1,22 m — zodat de
 * nieuwe vloer exact in het perspectief van de kamer valt. Het licht van de
 * foto wordt over de nieuwe tegels heen gelegd, dus de zonvlekken en de
 * schaduw langs de wand blijven staan.
 */
(function () {
  'use strict';

  var BTW = 1.21;

  /* ---------- assortiment ---------- */

  var FORMAAT = [
    { v: '60x60',   l: '60 × 60 cm',   b: 60,  h: 60,  pm2: 0,  leg: 0,  d: 'Meest gelegd. Makkelijk te zagen en vergevingsgezind.' },
    { v: '120x60',  l: '120 × 60 cm',  b: 120, h: 60,  pm2: 9,  leg: 7,  d: 'Half zoveel voegen en richting in de ruimte.' },
    { v: '120x120', l: '120 × 120 cm', b: 120, h: 120, pm2: 24, leg: 18, d: 'Het rustigste beeld. Vraagt een vlakke ondergrond.' }
  ];

  var PLEK = [
    { v: 'vloer', l: 'Vloer',          d: 'Alleen de vloer' },
    { v: 'wand',  l: 'Wand',           d: 'Alleen de wand' },
    { v: 'beide', l: 'Wand én vloer',  d: 'Doorlopend in hetzelfde beeld' }
  ];

  var RUIMTE = [
    { v: 'badkamer',  l: 'Badkamer',   d: 'Wand en vloer in één beeld' },
    { v: 'woonkamer', l: 'Woonkamer',  d: 'Jouw tegel in een echte foto' },
    { v: 'wc',        l: 'Toilet',     d: 'Kleine ruimte, groot formaat' },
    { v: 'vlak',      l: 'Tegelvlak',  d: 'De tegel zelf, van dichtbij' }
  ];

  /* kleur, aders en korrel bepalen samen hoe de tegel getekend wordt */
  var LOOK = [
    { v: 'beton',   l: 'Betonlook',      pm2: 0,  korrel: 9,  ader: 0,   d: 'Strak en neutraal' },
    { v: 'marmer',  l: 'Marmerlook',     pm2: 22, korrel: 3,  ader: 1,   d: 'Aders, veel diepte' },
    { v: 'natuur',  l: 'Natuursteenlook',pm2: 14, korrel: 14, ader: .35, d: 'Warm en levendig' },
    { v: 'hout',    l: 'Houtlook',       pm2: 12, korrel: 5,  ader: .8,  d: 'Nerf in de lengte', nerf: 1 },
    { v: 'terrazzo',l: 'Terrazzo',       pm2: 26, korrel: 0,  ader: 0,   d: 'Spikkels in het vlak', spikkel: 1 },
    { v: 'uni',     l: 'Uni',            pm2: -6, korrel: 2,  ader: 0,   d: 'Egaal, één kleur' }
  ];

  /* n = naam, c = grondkleur, a = aderkleur, a2 = tweede ader,
     s = spikkels bij terrazzo, p = meerprijs per m² boven de look */
  var TINT = {
    beton: [
      { n: 'Lichtgrijs',   c: '#cfcdc8' },
      { n: 'Parelgrijs',   c: '#dbd9d3' },
      { n: 'Greige',       c: '#c6bdb0' },
      { n: 'Zand',         c: '#d6cbb6' },
      { n: 'Taupe',        c: '#a89c8d' },
      { n: 'Cementgrijs',  c: '#9a9a98' },
      { n: 'Antraciet',    c: '#4a4b4e' },
      { n: 'Grafiet',      c: '#35363a' }
    ],
    marmer: [
      { n: 'Calacatta wit',   c: '#f1eee8', a: '#c3a05c', a2: '#9a958c', p: 6 },
      { n: 'Calacatta oro',   c: '#efe9dd', a: '#b98d44', a2: '#8f8778', p: 8 },
      { n: 'Statuario',       c: '#e9e7e3', a: '#8e9298', a2: '#b6b2ab', p: 6 },
      { n: 'Carrara',         c: '#e2e2df', a: '#9aa0a4', a2: '#c2c4c3' },
      { n: 'Arabescato',      c: '#eae6de', a: '#7d7a72', a2: '#b3aea3', p: 4 },
      { n: 'Pulpis grijs',    c: '#b9b6b0', a: '#6e6b66', a2: '#d6d3cd' },
      { n: 'Emperador bruin', c: '#6d5a4b', a: '#c8ae8c', a2: '#3f342b', p: 4 },
      { n: 'Nero marquina',   c: '#33343a', a: '#e8e6e0', a2: '#7d7f85', p: 8 },
      { n: 'Onyx groen',      c: '#46564e', a: '#cfd8c9', a2: '#2c3730', p: 10 },
      { n: 'Travertino zilver', c: '#cfcac2', a: '#8c8880', a2: '#e4e0d8' }
    ],
    natuur: [
      { n: 'Travertin',     c: '#d7c8ae' },
      { n: 'Kalksteen',     c: '#cfc7b6' },
      { n: 'Zandsteen',     c: '#d3c3a2' },
      { n: 'Pietra grijs',  c: '#b0aca4' },
      { n: 'Leisteen',      c: '#5c5f60' },
      { n: 'Basalt',        c: '#494b4d' },
      { n: 'Graniet grijs', c: '#8e8f8d' },
      { n: 'Quartsiet wit', c: '#ddd9d0' },
      { n: 'Lavasteen',     c: '#3c3d3f' }
    ],
    hout: [
      { n: 'Eiken naturel',  c: '#c9a677' },
      { n: 'Eiken wit',      c: '#d9c9b0' },
      { n: 'Eiken honing',   c: '#bd9159' },
      { n: 'Rustiek eiken',  c: '#a97f4f' },
      { n: 'Gerookt eiken',  c: '#7a5c40' },
      { n: 'Noten',          c: '#6b4a33' },
      { n: 'Teak',           c: '#8f6a41' },
      { n: 'Essen grijs',    c: '#a9a49b' },
      { n: 'Verweerd grijs', c: '#8b8781' }
    ],
    terrazzo: [
      { n: 'Wit',        c: '#e6e3dc', s: ['#8d8377', '#c4b7a3', '#5d5b57', '#f2efe8', '#a58f74'] },
      { n: 'Crème',      c: '#ded3bd', s: ['#8a7a5e', '#c9b894', '#5f584a', '#f0e8d6', '#a89474'] },
      { n: 'Zand',       c: '#d8ccb4', s: ['#7d6f57', '#bfae8c', '#55503f', '#ece2cd', '#9c8a6c'] },
      { n: 'Salie',      c: '#c3cabb', s: ['#6f7c68', '#a3b09a', '#4d574a', '#e2e7dc', '#8a9682'] },
      { n: 'Grijs',      c: '#b9b7b2', s: ['#6f6d69', '#d3d1cb', '#4a4947', '#8e8c87', '#e0ded8'] },
      { n: 'Blauwgrijs', c: '#a9b2b8', s: ['#5f696f', '#cbd3d7', '#414a4f', '#859399', '#dfe4e7'] },
      { n: 'Antraciet',  c: '#55565a', s: ['#c9c6bf', '#8b8a88', '#2f3033', '#e6e2d9', '#6f7d84'] },
      { n: 'Zwart',      c: '#3a3a3d', s: ['#d6d2c9', '#7e7c78', '#222224', '#f0ece2', '#5d6a72'] }
    ],
    uni: [
      { n: 'Superwit',    c: '#f2f1ed' },
      { n: 'Crème',       c: '#e7e0d2' },
      { n: 'Lichtgrijs',  c: '#cfcdc8' },
      { n: 'Cementgrijs', c: '#a5a5a2' },
      { n: 'Taupe',       c: '#a1968a' },
      { n: 'Antraciet',   c: '#4a4b4e' },
      { n: 'Zwart',       c: '#2f3032' },
      { n: 'Diepgroen',   c: '#3f5049' }
    ]
  };

  var AFWERKING = [
    { v: 'mat',       l: 'Mat',            pm2: 0,  glans: .06, d: 'Rustig, weinig weerspiegeling' },
    { v: 'zijde',     l: 'Zijdeglans',     pm2: 5,  glans: .18, d: 'Lichte glans' },
    { v: 'gepolijst', l: 'Gepolijst',      pm2: 14, glans: .42, d: 'Spiegelend, niet in natte ruimtes' },
    { v: 'struct',    l: 'Gestructureerd', pm2: 7,  glans: .03, d: 'Antislip, voor badkamer en buiten' }
  ];

  var VERBAND = [
    { v: 'recht',    l: 'Recht',          leg: 0,  d: 'Voegen in één lijn' },
    { v: 'half',     l: 'Halfsteens',     leg: 4,  d: 'Elke rij een halve tegel verspringend' },
    { v: 'derde',    l: 'Derde verband',  leg: 5,  d: 'Verspringing van een derde, advies bij groot formaat' },
    { v: 'visgraat', l: 'Visgraat',       leg: 22, d: 'Alleen bij rechthoekige tegels' }
  ];

  var VOEG = [
    { v: 'tegel',    l: 'Kleur van de tegel', d: 'Het vlak loopt door' },
    { v: 'wit',      l: 'Wit',      hex: '#efeeea' },
    { v: 'grijs',    l: 'Grijs',    hex: '#a8a6a1' },
    { v: 'antraciet',l: 'Antraciet',hex: '#4c4d50' }
  ];

  var EXTRA = [
    { v: 'egaliseren', l: 'Egaliseren van de ondergrond', pm2: 11 },
    { v: 'verwijderen',l: 'Oude vloer verwijderen',       pm2: 14 },
    { v: 'vloerverw',  l: 'Geschikt maken voor vloerverwarming', pm2: 6 },
    { v: 'plinten',    l: 'Bijpassende plinten',          pm2: 5 }
  ];

  var OPP = ['4', '10', '20', '35', '50', '75', '100'];

  var BASIS_M2 = 34;      // kale tegelprijs per m² bij 60×60 beton mat
  var LEG_M2   = 38;      // leggen en voegen per m²
  var VOEGBREEDTE = 0.003; // 3 mm, in meters

  /* ---------- inrichting van de badkamer ----------
     Elk product staat op een plek en een plek is maar door één ding bezet. De
     achterwand heeft twee helften, de zijwanden zijn er twee. Een optie die al
     bezet is wordt niet aangeboden — dan kan er ook geen combinatie ontstaan
     die in het beeld door elkaar heen loopt. */

  var PRODUCT = [
    { v: 'douche',   l: 'Inloopdouche', wand: 'achter', d: 'Glaswand in de hoek' },
    { v: 'wastafel', l: 'Wastafel',     wand: 'achter', d: 'Met spiegel erboven' },
    { v: 'toilet',   l: 'Hangend toilet', wand: 'achter', d: 'Op een voorzetwand' },
    { v: 'bad',      l: 'Vrijstaand bad', wand: 'zij',   d: 'Tegen een zijwand' },
    { v: 'nis',      l: 'Nis',          wand: 'zij',     d: 'Betegeld, in de wand uitgespaard' }
  ];
  var KANT = [
    { v: 'geen',   l: 'Niet' },
    { v: 'links',  l: 'Links' },
    { v: 'rechts', l: 'Rechts' }
  ];

  var ACCENT = [
    { v: 'geen',   l: 'Geen',        d: 'Overal dezelfde wandtegel' },
    { v: 'achter', l: 'Achterwand',  d: 'De wand recht voor je' },
    { v: 'links',  l: 'Linkerwand',  d: '' },
    { v: 'rechts', l: 'Rechterwand', d: '' }
  ];

  var KOPPEL = [
    { v: 'zelfde', l: 'Dezelfde tegel', d: 'Wand en vloer lopen door' },
    { v: 'los',    l: 'Verschillend',   d: 'Kies apart voor wand en vloer' }
  ];

  /* ---------- toestand ---------- */

  function nieuwMat(look, tintNr, formaat, verband, voeg) {
    return { formaat: formaat, look: look, tint: tintNr, afwerking: 'mat', verband: verband, voeg: voeg };
  }

  var sel = {
    plek: 'beide', ruimte: 'badkamer', opp: '20',
    koppel: 'zelfde',        // wand en vloer dezelfde tegel, of apart
    vlak: 'vloer',           // welk vlak je op dit moment instelt
    accent: 'geen',          // welke wand een afwijkende tegel krijgt
    inr: { douche: 'links', wastafel: 'rechts', toilet: 'geen', bad: 'rechts', nis: 'links' },
    mat: {
      vloer:  nieuwMat('marmer', 1, '60x60', 'recht', 'wit'),
      wand:   nieuwMat('marmer', 1, '30x60', 'half', 'wit'),
      accent: nieuwMat('natuur', 4, '60x60', 'recht', 'antraciet')
    }
  };
  var extras = {};

  var $ = function (id) { return document.getElementById(id); };
  var vind = function (lijst, v) {
    for (var i = 0; i < lijst.length; i++) if (lijst[i].v === v) return lijst[i];
    return lijst[0];
  };
  var esc = function (t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var klem = function (x, a, b) { return x < a ? a : x > b ? b : x; };

  var heeftWand = function () { return sel.plek === 'wand' || sel.plek === 'beide'; };
  var heeftVloer = function () { return sel.plek === 'vloer' || sel.plek === 'beide'; };
  var losseVlakken = function () { return sel.plek === 'beide' && sel.koppel === 'los'; };
  var heeftAccent = function () { return heeftWand() && sel.accent !== 'geen'; };

  /* Welke tegel hoort bij welk vlak. Bij "dezelfde tegel" volgt de wand de
     vloer, zodat één keer kiezen genoeg is. */
  function matVan(vlak) {
    if (vlak === 'accent') return sel.mat.accent;
    if (vlak === 'wand' && !losseVlakken()) return sel.mat.vloer;
    return sel.mat[vlak] || sel.mat.vloer;
  }

  /* Welk vlak stellen de keuzegroepen hieronder in. */
  function huidigVlak() {
    if (!heeftVloer()) return 'wand';
    if (!heeftWand()) return 'vloer';
    if (!losseVlakken() && sel.vlak === 'wand') return 'vloer';
    if (sel.vlak === 'accent' && !heeftAccent()) return 'vloer';
    return sel.vlak;
  }
  function huidigMat() { return matVan(huidigVlak()); }

  var tintVan = function (m) { return (TINT[m.look] || TINT.beton)[m.tint] || TINT[m.look][0]; };

  /* visgraat en Hongaarse punt kunnen niet met een vierkante tegel: dat is geen
     smaakkwestie maar meetkunde, dus die opties verdwijnen in plaats van dat ze
     stilletjes iets anders doen */
  function verbandenVan(m) {
    var f = vind(FORMAAT, m.formaat);
    return VERBAND.filter(function (b) { return b.v !== 'visgraat' || f.b === 2 * f.h; });
  }

  /* ---------- prijs ---------- */

  function m2Prijs(m) {
    var f = vind(FORMAAT, m.formaat), lk = vind(LOOK, m.look);
    var af = vind(AFWERKING, m.afwerking), vb = vind(verbandenVan(m), m.verband);
    var tegel = BASIS_M2 + f.pm2 + lk.pm2 + af.pm2 + (tintVan(m).p || 0);
    var leggen = LEG_M2 + f.leg + vb.leg;
    return { tegel: tegel, leggen: leggen };
  }

  /* Bij verschillende tegels op wand en vloer is er niet één m²-prijs meer. De
     opgegeven oppervlakte is het totaal, dus we rekenen met het gemiddelde van
     de vlakken die er werkelijk liggen — en laten die vlakken los zien, want
     één samengevoegd getal verbergt precies het verschil waar het om gaat. */
  function prijs() {
    var m2 = Number(sel.opp) || 0;
    var delen = [];
    if (heeftVloer()) delen.push({ n: 'vloer', p: m2Prijs(matVan('vloer')) });
    if (heeftWand()) delen.push({ n: 'wand', p: m2Prijs(matVan('wand')) });
    if (heeftAccent()) delen.push({ n: 'accentwand', p: m2Prijs(matVan('accent')) });
    if (!delen.length) delen.push({ n: 'vloer', p: m2Prijs(matVan('vloer')) });

    var tegel = 0, leggen = 0;
    delen.forEach(function (d) { tegel += d.p.tegel; leggen += d.p.leggen; });
    tegel /= delen.length; leggen /= delen.length;

    var extra = 0;
    EXTRA.forEach(function (e) { if (extras[e.v]) extra += e.pm2; });
    var perM2 = tegel + leggen + extra;
    // wand én vloer: meer snijwerk en meer hoeken, dus een opslag op het leggen
    if (sel.plek === 'beide') perM2 += 6;
    if (heeftAccent()) perM2 += 4;      // een tweede tegel betekent een tweede levering

    return { perM2: perM2 * BTW, totaal: perM2 * m2 * BTW,
             tegel: tegel * BTW, leggen: leggen * BTW, m2: m2, delen: delen };
  }

  /* ---------- het beeld ----------
     Het tekenwerk zelf staat in assets/tegelbeeld.js, want de
     tegelvloerconfigurator gebruikt precies dezelfde tekenaar. Hier blijft
     alleen staan hoe een keuze zich vertaalt naar een materiaal. */

  function ontleed(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function helderheid(hex) {
    var c = ontleed(hex);
    return (c[0] * .299 + c[1] * .587 + c[2] * .114) / 255;
  }

  function voegKleur(welke, tegelKleur) {
    var vg = vind(VOEG, welke);
    if (vg.hex) return ontleed(vg.hex);
    // "kleur van de tegel": een tint donkerder bij een lichte tegel, lichter bij
    // een donkere — anders is er helemaal geen voeg meer te zien
    var c = ontleed(tegelKleur);
    var d = helderheid(tegelKleur) > .5 ? -16 : 18;
    return [klem(c[0] + d, 0, 255), klem(c[1] + d, 0, 255), klem(c[2] + d, 0, 255)];
  }

  function materiaal(m) {
    var f = vind(FORMAAT, m.formaat), lk = vind(LOOK, m.look);
    var af = vind(AFWERKING, m.afwerking), tn = tintVan(m);
    var vb = vind(verbandenVan(m), m.verband);
    return {
      tw: f.b / 100, th: f.h / 100, g: VOEGBREEDTE,
      sprong: vb.v === 'half' ? .5 : vb.v === 'derde' ? (1 / 3) : 0,
      visgraat: vb.v === 'visgraat',
      kleur: tn.c, lk: lk, af: af, tn: tn,
      voegRGB: voegKleur(m.voeg, tn.c)
    };
  }

  /* Welk materiaal komt waar, en wat staat er in de ruimte. */
  function opstelling() {
    return {
      vloer: heeftVloer() ? materiaal(matVan('vloer')) : null,
      wand: heeftWand() ? materiaal(matVan('wand')) : null,
      accent: heeftAccent() ? { wand: sel.accent, mat: materiaal(matVan('accent')) } : null,
      inrichting: sel.inr
    };
  }

  function teken() {
    var B = window.NGTegelBeeld, c = $('tgCanvas');
    if (!B || !c) return;
    var op = opstelling();
    if (sel.ruimte === 'vlak') B.vlak(c, op);
    // alleen wachten als de foto er nog niet is; anders roept de wachtrij
    // meteen terug en tekent teken() zichzelf aan gruzelementen
    else if (sel.ruimte === 'woonkamer') {
      if (!B.fotoKlaar()) B.laadFoto(teken);
      B.woonkamer(c, op);
    } else {
      // De ruimte volgt de gekozen oppervlakte, ook het toilet. Een toilethok
      // dat bij elke oppervlakte even groot blijft terwijl de badkamer wél
      // meebeweegt, verraadt meteen dat het beeld een plaatje is.
      var K = B.KAMERS[sel.ruimte] || B.KAMERS.badkamer;
      op.maat = ruimteMaat(K, Number(sel.opp) || 0);
      B.kamer(c, K, op);
    }
  }

  /* Van vierkante meters naar een lengte en een breedte. Een badkamer is
     doorgaans wat langer dan breed; een toilet is uitgesproken smal en diep.

     De gekozen oppervlakte gaat over hoeveel tegels er nodig zijn, niet over
     hoe groot de ruimte is: iemand kan 50 m² tegels voor een heel huis
     bestellen. De getekende ruimte blijft daarom binnen wat een badkamer of
     toilet in het echt is. Zonder die grens wordt een toilet van 20 m² een
     gang van tien meter diep, en dan klopt er niets meer van de schaal. */
  var RUIMTEGRENS = {
    wc:       { B: [0.95, 2.00], D: [1.30, 3.20], verhouding: 1.8 },
    badkamer: { B: [1.70, 4.20], D: [2.00, 5.60], verhouding: 1.3 }
  };

  function ruimteMaat(K, m2) {
    var g = RUIMTEGRENS[K.v];
    if (!g || !m2) return null;
    var klem = function (x, r) { return x < r[0] ? r[0] : (x > r[1] ? r[1] : x); };
    var B = klem(Math.sqrt(m2 / g.verhouding), g.B);
    var D = klem(m2 / B, g.D);
    return { B: B, D: D, Hg: K.Hg };
  }

  /* ---------- opbouw van de keuzes ---------- */

  function tegelKnop(groep, o, aan, extra) {
    return '<label class="tg-opt' + (aan ? ' is-on' : '') + '">' +
      '<input type="radio" name="tg_' + groep + '" value="' + esc(o.v) + '"' + (aan ? ' checked' : '') + '>' +
      (extra || '') +
      '<b>' + esc(o.l) + '</b>' +
      (o.d ? '<span>' + esc(o.d) + '</span>' : '') +
      '</label>';
  }

  /* Welke kanten zijn nog vrij voor dit product. Twee dingen op dezelfde plek
     lopen in het beeld door elkaar heen, dus die keuze bieden we niet aan. */
  function vrijeKanten(p) {
    return KANT.filter(function (k) {
      if (k.v === 'geen') return true;
      for (var i = 0; i < PRODUCT.length; i++) {
        var q = PRODUCT[i];
        if (q.v === p.v || q.wand !== p.wand) continue;
        if (sel.inr[q.v] === k.v) return false;
      }
      return true;
    });
  }

  function bouw() {
    var h = '';
    var nr = 0;
    var groep = function (titel, inhoud, klasse) {
      nr++;
      return '<div class="tg-grp"><div class="tg-grp__h"><b>' + nr + '.</b>' + titel + '</div>' +
             '<div class="tg-tiles' + (klasse ? ' ' + klasse : '') + '">' + inhoud + '</div></div>';
    };

    h += groep('WAAR KOMEN DE TEGELS', PLEK.map(function (o) {
      return tegelKnop('plek', o, sel.plek === o.v);
    }).join(''));

    if (sel.plek === 'beide') {
      h += groep('WAND EN VLOER', KOPPEL.map(function (o) {
        return tegelKnop('koppel', o, sel.koppel === o.v);
      }).join(''));
    }

    if (heeftWand()) {
      h += groep('ACCENTWAND', ACCENT.map(function (o) {
        return tegelKnop('accent', o, sel.accent === o.v);
      }).join(''));
    }

    // Welke tegel stel je nu in? Alleen zichtbaar als er meer dan één te kiezen is.
    var vlakken = [];
    if (losseVlakken()) { vlakken.push({ v: 'vloer', l: 'Vloertegel' }); vlakken.push({ v: 'wand', l: 'Wandtegel' }); }
    if (heeftAccent()) {
      if (!vlakken.length) vlakken.push({ v: heeftVloer() ? 'vloer' : 'wand', l: heeftVloer() && !heeftWand() ? 'Vloertegel' : 'Wandtegel' });
      vlakken.push({ v: 'accent', l: 'Accentwand' });
    }
    var hv = huidigVlak();
    if (vlakken.length > 1) {
      h += groep('WELKE TEGEL STEL JE IN', vlakken.map(function (o) {
        return tegelKnop('vlak', o, hv === o.v);
      }).join(''), 'tg-tiles--vlak');
    }

    var M = huidigMat();
    var voor = vlakken.length > 1 ? ' <span class="tg-grp__tel">' +
      esc((vind(vlakken, hv) || vlakken[0]).l.toLowerCase()) + '</span>' : '';

    h += groep('FORMAAT' + voor, FORMAAT.map(function (o) {
      var schets = '<span class="tg-maatje" style="aspect-ratio:' + o.b + '/' + o.h + '"></span>';
      return tegelKnop('formaat', o, M.formaat === o.v, schets);
    }).join(''));

    h += groep('LOOK' + voor, LOOK.map(function (o) {
      return tegelKnop('look', o, M.look === o.v);
    }).join(''));

    h += groep('KLEUR <span class="tg-grp__tel">' + TINT[M.look].length + ' tinten</span>',
      TINT[M.look].map(function (t, i) {
        var stip = t.a ? '<span class="tg-sw tg-sw--ader" style="background:' + t.c +
                         ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.14), inset -6px 6px 0 -4px ' + t.a + '"></span>'
                       : '<span class="tg-sw" style="background:' + t.c + '"></span>';
        return '<label class="tg-opt tg-opt--sw' + (M.tint === i ? ' is-on' : '') + '">' +
          '<input type="radio" name="tg_tint" value="' + i + '"' + (M.tint === i ? ' checked' : '') + '>' +
          stip + '<b>' + esc(t.n) + '</b></label>';
      }).join(''), 'tg-tiles--kleur');

    h += groep('AFWERKING' + voor, AFWERKING.map(function (o) {
      return tegelKnop('afwerking', o, M.afwerking === o.v);
    }).join(''));

    h += groep('LEGPATROON' + voor, verbandenVan(M).map(function (o) {
      return tegelKnop('verband', o, M.verband === o.v);
    }).join(''));

    h += groep('VOEGKLEUR' + voor, VOEG.map(function (o) {
      var sw = o.hex ? '<span class="tg-sw" style="background:' + o.hex + '"></span>' : '';
      return tegelKnop('voeg', o, M.voeg === o.v, sw);
    }).join(''));

    if (sel.ruimte === 'badkamer') {
      var inh = PRODUCT.map(function (p) {
        var kanten = vrijeKanten(p);
        return '<div class="tg-inr">' +
          '<div class="tg-inr__k"><b>' + esc(p.l) + '</b><span>' + esc(p.d) + '</span></div>' +
          '<div class="tg-inr__r">' + kanten.map(function (k) {
            var aan = (sel.inr[p.v] || 'geen') === k.v;
            return '<label class="tg-opt tg-opt--kort' + (aan ? ' is-on' : '') + '">' +
              '<input type="radio" name="tgi_' + p.v + '" value="' + k.v + '"' + (aan ? ' checked' : '') + '>' +
              '<b>' + esc(k.l) + '</b></label>';
          }).join('') + '</div></div>';
      }).join('');
      h += groep('WAT STAAT ER IN DE BADKAMER', inh, 'tg-tiles--inr');
    }

    h += groep('OPPERVLAKTE', OPP.map(function (m) {
      return '<label class="tg-opt tg-opt--kort' + (sel.opp === m ? ' is-on' : '') + '">' +
        '<input type="radio" name="tg_opp" value="' + m + '"' + (sel.opp === m ? ' checked' : '') + '>' +
        '<b>' + m + ' m&sup2;</b></label>';
    }).join(''));

    h += groep('EXTRA', EXTRA.map(function (o) {
      return '<label class="tg-opt tg-opt--check' + (extras[o.v] ? ' is-on' : '') + '">' +
        '<input type="checkbox" name="tgx_' + o.v + '"' + (extras[o.v] ? ' checked' : '') + '>' +
        '<b>' + esc(o.l) + '</b><span>+ &euro; ' + o.pm2 + ' per m&sup2;</span></label>';
    }).join(''));

    $('tgGroups').innerHTML = h;

    // keuzes die het materiaal van het huidige vlak veranderen
    var perVlak = { formaat: 1, look: 1, tint: 1, afwerking: 1, verband: 1, voeg: 1 };

    $('tgGroups').querySelectorAll('input[type="radio"]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var naam = this.name;
        if (naam.indexOf('tgi_') === 0) {
          sel.inr[naam.slice(4)] = this.value;
        } else {
          var g = naam.slice(3);
          if (perVlak[g]) {
            var m = huidigMat();
            m[g] = g === 'tint' ? Number(this.value) : this.value;
            if (g === 'look') m.tint = 0;                  // andere look, andere kleuren
            if (g === 'formaat' && m.verband === 'visgraat' &&
                vind(FORMAAT, m.formaat).b !== 2 * vind(FORMAAT, m.formaat).h) {
              m.verband = 'recht';
            }
          } else {
            sel[g] = this.value;
          }
        }
        bouw(); ververs();
      });
    });
    $('tgGroups').querySelectorAll('input[type="checkbox"]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        extras[this.name.slice(4)] = this.checked;
        bouw(); ververs();
      });
    });
  }

  function bouwRuimtes() {
    var el = $('tgRuimtes'); if (!el) return;
    el.innerHTML = RUIMTE.map(function (r) {
      return '<button type="button" class="tg-ruimte' + (sel.ruimte === r.v ? ' is-on' : '') +
        '" data-r="' + r.v + '"><b>' + esc(r.l) + '</b><span>' + esc(r.d) + '</span></button>';
    }).join('');
    el.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        sel.ruimte = this.getAttribute('data-r');
        bouwRuimtes(); bouw(); ververs();
      });
    });
  }

  function omschrijf(m) {
    return vind(LOOK, m.look).l.toLowerCase() + ' ' + tintVan(m).n.toLowerCase() +
      ' ' + vind(FORMAAT, m.formaat).l.replace(/ /g, '') +
      ', ' + vind(verbandenVan(m), m.verband).l.toLowerCase() +
      ', voeg ' + vind(VOEG, m.voeg).l.toLowerCase();
  }

  function ververs() {
    var viz = $('tgCanvas');
    if (viz) viz.style.opacity = '.55';
    // even uitstellen zodat de knop wél meteen reageert
    requestAnimationFrame(function () {
      teken();
      if (viz) viz.style.opacity = '';
    });

    var p = prijs();
    $('tgTot').textContent = '€ ' + Math.round(p.totaal / 5) * 5;

    var sub = '€ ' + Math.round(p.perM2) + ' per m² incl. btw · ' + p.m2 + ' m²';
    var los = p.delen.map(function (d) { return Math.round((d.p.tegel + d.p.leggen) * BTW); });
    var verschilt = los.some(function (b) { return b !== los[0]; });
    if (verschilt) {
      // alleen uitsplitsen als de vlakken echt verschillen; twee keer hetzelfde
      // bedrag naast elkaar is ruis
      sub += ' · ' + p.delen.map(function (d, i) { return d.n + ' € ' + los[i]; }).join(', ');
    } else {
      sub += ' · tegel € ' + Math.round(p.tegel) + ' en leggen € ' + Math.round(p.leggen) + ' per m²';
    }
    $('tgSub').textContent = sub;
    $('tgMaat').innerHTML = '<b>' + vind(FORMAAT, huidigMat().formaat).l + '</b>';

    var regels = [];
    var vt = heeftVloer() ? omschrijf(matVan('vloer')) : null;
    var wt = heeftWand() ? omschrijf(matVan('wand')) : null;
    // dezelfde tegel twee keer opsommen leest als een fout
    if (vt && wt && vt === wt) regels.push('Wand en vloer: ' + vt);
    else {
      if (vt) regels.push('Vloer: ' + vt);
      if (wt) regels.push('Wand: ' + wt);
    }
    if (heeftAccent()) regels.push(vind(ACCENT, sel.accent).l + ': ' + omschrijf(matVan('accent')));
    if (sel.ruimte === 'woonkamer') regels.unshift('Echte foto, vloer vervangen');
    $('tgOnder').textContent = regels.join(' · ');
  }

  function samenvatting() {
    var p = prijs();
    var r = ['Tegels: samenstelling via nextgrowthdigital.nl', ''];
    r.push('Waar: ' + vind(PLEK, sel.plek).l);
    if (heeftVloer()) r.push('Vloertegel: ' + omschrijf(matVan('vloer')));
    if (heeftWand()) r.push('Wandtegel: ' + omschrijf(matVan('wand')));
    if (heeftAccent()) r.push('Accentwand (' + vind(ACCENT, sel.accent).l.toLowerCase() + '): ' + omschrijf(matVan('accent')));
    r.push('Afwerking: ' + vind(AFWERKING, huidigMat().afwerking).l);
    r.push('Oppervlakte: ' + sel.opp + ' m²');
    if (sel.ruimte === 'badkamer') {
      var inr = PRODUCT.filter(function (q) { return sel.inr[q.v] && sel.inr[q.v] !== 'geen'; })
        .map(function (q) { return q.l.toLowerCase() + ' ' + sel.inr[q.v]; });
      r.push('In de badkamer: ' + (inr.length ? inr.join(', ') : 'leeg'));
    }
    var ex = EXTRA.filter(function (e) { return extras[e.v]; }).map(function (e) { return e.l; });
    r.push('Extra: ' + (ex.length ? ex.join(', ') : 'geen'));
    r.push('');
    r.push('Richtprijs: € ' + Math.round(p.totaal / 5) * 5 + ' incl. btw (€ ' +
           Math.round(p.perM2) + ' per m²)');
    return r.join('\n');
  }

  function start() {
    if (!$('tgCanvas')) return;
    bouwRuimtes(); bouw(); ververs();
    if (window.NGTegelBeeld) window.NGTegelBeeld.laadFoto();
    $('tgKopieer').addEventListener('click', function () {
      var t = samenvatting(), knop = this;
      var klaar = function () { knop.textContent = 'Gekopieerd'; setTimeout(function () { knop.textContent = 'Kopieer samenstelling'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(klaar, klaar);
      else klaar();
    });
    // haak om het beeld te controleren zonder te klikken; alleen met ?zsdebug=1
    if (/[?&]zsdebug=1/.test(location.search)) {
      window.NGTegelDebug = {
        sel: sel, extras: extras, TINT: TINT, LOOK: LOOK, FORMAAT: FORMAAT,
        VERBAND: VERBAND, VOEG: VOEG, AFWERKING: AFWERKING, RUIMTE: RUIMTE,
        PLEK: PLEK, PRODUCT: PRODUCT, ACCENT: ACCENT,
        zet: function (o) {
          for (var k in o) {
            if (k === 'mat' || k === 'inr') { for (var j in o[k]) sel[k][j] = o[k][j]; }
            else sel[k] = o[k];
          }
          bouwRuimtes(); bouw(); teken();
        },
        zetMat: function (vlak, o) {
          var m = matVan(vlak);
          for (var k in o) m[k] = o[k];
          bouw(); teken();
        }
      };
    }
    // de keuzes doorgeven aan de AI-foto onderaan de pagina
    window.NGKeuze = function () {
      var M = matVan(heeftVloer() ? 'vloer' : 'wand');
      return { plek: sel.plek, ruimte: sel.ruimte, formaat: M.formaat, look: M.look,
               tint: tintVan(M).n, afwerking: M.afwerking,
               verband: M.verband, voeg: M.voeg, opp: sel.opp,
               accent: sel.accent, inrichting: sel.inr };
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();