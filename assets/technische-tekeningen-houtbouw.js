/* Technisch tekeningenpakket voor de overkapping- en poolhouse-configurators.
 * Dekt drie uitvoeringen: houten overkapping (en tuinkamer), aluminium
 * overkapping (lamellen-, glas- of polycarbonaatdak) en poolhouse.
 *
 * Zelfde gedachte als het pakket van de uitbouw: geen schets maar een
 * werktekening, met maatvoering in millimeters en de aannames er eerlijk bij.
 * Een overkapping is constructief eenvoudiger dan een uitbouw — staanders,
 * liggers, gordingen, een dakpakket — dus dit pakket telt acht bladen in
 * plaats van twintig. Wat er niet is, hoort er ook niet in te staan.
 *
 * De maten komen uit de keuzes van de configurator (window.NGKeuze). Alles
 * wat daar niet in zit — staanderafstanden, profielmaten, poeren — staat hier
 * als expliciete aanname op het blad, zodat een werkvoorbereider ziet wat hij
 * moet controleren in plaats van te raden wat er bedoeld is.
 *
 * Gebruik op de pagina:
 *   <script src="./assets/technische-tekeningen-houtbouw.js" defer></script>
 *   NGTekeningenHout.init({ product: 'overkapping' })   // of 'poolhouse'
 * De init hangt een knop "Technische tekeningen" in de prijsbalk.
 */
(function (global) {
  'use strict';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>\"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c]; }); };
  var mm = function (m) { return Math.round(m * 1000); };
  /* A3 liggend is 420 mm breed; het vlak is 1120 eenheden. Eén meter op 1:n
     is dus 1120/420*1000/n eenheden — dan klopt de schaal ook echt op papier. */
  var scaleM = function (n) { return (1120 / 420) * (1000 / n); };

  /* ---------- het model: van keuzes naar maten ---------- */

  var HOUT = {
    douglas: 'Douglas, fijnbezaagd', eiken: 'Eiken, geschaafd', lariks: 'Lariks',
    grenen: 'Grenen, geïmpregneerd', thermohout: 'Thermisch gemodificeerd hout',
    'zwart-douglas': 'Douglas, zwart gedompeld', 'douglas-zwartwand': 'Douglas, zwarte wanden'
  };
  var DAK = {
    platdak: 'Plat dak', schuindak: 'Schuin dak', zadeldak: 'Zadeldak',
    lessenaars: 'Lessenaarsdak', groendak: 'Plat dak met sedum'
  };
  var BEDEKKING = {
    epdm: 'EPDM-folie', dakpan: 'Keramische dakpannen', riet: 'Riet',
    groendak: 'Sedumpakket op EPDM'
  };
  var WANDEN = {
    open: 'Open, alleen staanders', schuif: 'Glazen schuifwanden', dicht: 'Dichte wanden (tuinkamer)',
    geen: 'Open, alleen staanders', screens: 'Rits-screens'
  };
  var ALU_KLEUR = {
    antraciet: 'RAL 7016 structuur', zwart: 'RAL 9005 structuur', wit: 'RAL 9016 structuur',
    taupe: 'RAL 7006', zilver: 'RAL 9006'
  };
  var ALU_DAK = {
    lamellen: 'Lamellendak, kantelbare lamellen 210 mm',
    glasdak: 'Glasdak, gehard gelaagd glas 8.8.2',
    poly: 'Polycarbonaat 16 mm opaal'
  };

  /** @returns het tekenmodel, of null als er geen keuzes te vinden zijn */
  function model(product, sel) {
    sel = sel || {};
    var afm = String(sel.afm || (product === 'poolhouse' ? '500x350' : '500x300'));
    if (afm === 'maatwerk') afm = product === 'poolhouse' ? '600x400' : '600x300';
    var d = afm.split('x');
    var w = (parseInt(d[0], 10) || 500) / 100;      // meters
    var dp = (parseInt(d[1], 10) || 300) / 100;

    /* De aluminium overkapping is aan de keuzes te herkennen: die kant heeft
       een RAL-kleur en een lamellen-, glas- of polydak in plaats van een
       houtsoort. Zo volgt het pakket vanzelf de stand van de configurator. */
    var alu = !!(sel.kleur && ALU_KLEUR[sel.kleur]) || !!ALU_DAK[sel.daktype];
    var aanhuis = alu && sel.montage !== 'vrijstaand';

    var houtKeuze = sel.hout || sel.houtsoort || 'douglas';
    var daktype = sel.daktype || 'platdak';
    var plat = alu || daktype === 'platdak' || daktype === 'groendak';
    var bedekking = alu ? (ALU_DAK[daktype] || ALU_DAK.lamellen)
      : daktype === 'groendak' ? 'groendak' : (sel.dakbedekking || 'epdm');

    /* Hoogtes. Hout: plat dak op 2,50 m onderkant ligger. Aluminium volgt de
       maatvoering van de gangbare lamellendaken: doorloophoogte 2,40 m met
       een kaderprofiel van 230 mm erboven — systeemhoogte 2,63 m. */
    var hVoor = alu ? 2.40 : 2.50, hAchter = plat ? (alu ? 2.40 : 2.42) : 2.30;
    var nok = plat ? (alu ? 2.63 : hVoor) : (2.30 + Math.tan(25 * Math.PI / 180) * (daktype === 'zadeldak' ? dp / 2 : dp));

    /* Staanders. Hout: hart-op-hart hoogstens 2,5 m. Aluminium draagt veel
       verder: één dakveld haalt zes tot zeven meter op alleen hoekstaanders,
       dus daar begint een tussenstaander pas boven de zes meter. */
    var vakken = alu ? Math.max(1, Math.ceil(w / 6)) : Math.max(2, Math.ceil(w / 2.5));
    var staandersPerZijde = vakken + 1;
    /* Aan huis gemonteerd aluminium draagt achter op een muurprofiel: dan
       staan er alleen staanders aan de voorzijde. */
    var staanders = aanhuis ? staandersPerZijde : staandersPerZijde * 2;
    if (!alu && (product === 'poolhouse' || (sel.wanden && sel.wanden !== 'open'))) {
      staanders += 2;                                // tussenstaanders bij wanden
    }

    return {
      product: product, alu: alu, aanhuis: aanhuis,
      project: (product === 'poolhouse' ? 'PLH-' : alu ? 'OVK-ALU-' : 'OVK-') + Math.round(w * 100) + 'X' + Math.round(dp * 100),
      datum: new Date().toLocaleDateString('nl-NL'),
      revisie: 'P01',
      w: w, dp: dp, hVoor: hVoor, hAchter: hAchter, nok: nok,
      opp: Math.round(w * dp * 10) / 10,
      plat: plat, daktype: daktype,
      houtCode: houtKeuze,
      hout: alu ? 'Aluminium, ' + (ALU_KLEUR[sel.kleur] || ALU_KLEUR.antraciet) : (HOUT[houtKeuze] || houtKeuze),
      bedekking: alu ? bedekking : (BEDEKKING[bedekking] || bedekking),
      wanden: (alu ? sel.zijwanden : sel.wanden) || 'open',
      wandenNaam: WANDEN[alu ? sel.zijwanden : sel.wanden] || WANDEN.open,
      achterwand: !alu && sel.achterwand && sel.achterwand !== 'geen',
      vakken: vakken, staanders: staanders,
      staander: alu ? '150 × 150 mm aluminium koker' : '150 × 150 mm',
      ligger: alu ? 'kaderprofiel hoogte 230 mm, goot geïntegreerd' : '65 × 180 mm',
      gording: alu ? (daktype === 'lamellen' ? 'lamellen 210 mm · kantelbaar 0–150°' : 'sporenprofiel h.o.h. 700 mm') : '65 × 165 mm',
      poer: alu ? 'chemische ankers op bestaande verharding, anders betonpoer 300 × 300 × 600 mm'
                : 'betonpoer 300 × 300 × 600 mm met verstelbare voetplaat',
    };
  }

  /* ---------- tekenhulpjes (zelfde conventies als het uitbouwpakket) ---------- */

  function styles() {
    return '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.micro{font-size:9px;letter-spacing:.45px}.tiny{font-size:11px}.small{font-size:14px}.label{font-size:16px}.title{font-size:25px;font-weight:700;letter-spacing:.4px}.brand{font-size:15px;font-weight:800}.bold{font-weight:700}.stamp{font-size:10px;font-weight:800;fill:#a32323}.dimtxt{font-size:13px;fill:#333}.note{font-size:12px;fill:#333}.heavy{stroke:#111;stroke-width:6;fill:none}.medium{stroke:#222;stroke-width:2.2;fill:none}.thin{stroke:#555;stroke-width:.9;fill:none}.dash{stroke:#777;stroke-width:1;stroke-dasharray:8 5;fill:none}.dim{stroke:#555;stroke-width:1;fill:none;marker-start:url(#harr);marker-end:url(#harr)}.wood{fill:url(#hwood);stroke:#333}.alum{fill:#d6d8db;stroke:#333}.glass{fill:#e8f5fa;stroke:#222}.sheetbg{fill:white}.tag{fill:#fff;stroke:#111;stroke-width:1.4}.grond{stroke:#111;stroke-width:2}.poer{fill:#e8e4da;stroke:#333}</style>';
  }
  function defs() {
    return '<defs><marker id="harr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M8,4 L0,0 L0,8 z" fill="#555"/></marker><pattern id="hwood" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f0dfb8"/><path d="M0 8L8 0" stroke="#b99a65" stroke-width=".7"/></pattern></defs>';
  }
  function sheetStart() { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 770" role="img">' + defs() + styles() + '<rect width="1120" height="770" class="sheetbg"/>'; }

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
    var merk = merknaam() + ' · TECHNISCHE ' + (m.product === 'poolhouse' ? 'POOLHOUSE' : 'OVERKAPPING');
    return '<rect x="20" y="20" width="1080" height="730" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<line x1="20" y1="680" x2="1100" y2="680" stroke="#111" stroke-width="1"/>' +
      '<line x1="650" y1="680" x2="650" y2="750" stroke="#111"/>' +
      '<line x1="790" y1="680" x2="790" y2="750" stroke="#111"/>' +
      '<line x1="900" y1="680" x2="900" y2="750" stroke="#111"/>' +
      '<line x1="1000" y1="680" x2="1000" y2="750" stroke="#111"/>' +
      '<text x="38" y="704" class="brand">' + merk + '</text>' +
      '<text x="38" y="728" class="tiny">' + esc(m.project) + ' · ' + esc(titel) + '</text>' +
      '<text x="665" y="702" class="micro">DATUM</text><text x="665" y="727" class="tiny bold">' + esc(m.datum) + '</text>' +
      '<text x="805" y="702" class="micro">TEKENING</text><text x="805" y="727" class="small bold">' + esc(blad) + '</text>' +
      '<text x="915" y="702" class="micro">SCHAAL</text><text x="915" y="727" class="tiny bold">' + esc(schaal) + '</text>' +
      '<text x="1015" y="702" class="micro">REVISIE</text><text x="1015" y="727" class="tiny bold">' + esc(m.revisie) + '</text>' +
      '<text x="1080" y="744" text-anchor="end" class="stamp">VOORONTWERP</text>';
  }

  function maatH(x1, x2, y, objY, label) {
    return '<line x1="' + x1 + '" y1="' + objY + '" x2="' + x1 + '" y2="' + (y + 8) + '" class="thin"/><line x1="' + x2 + '" y1="' + objY + '" x2="' + x2 + '" y2="' + (y + 8) + '" class="thin"/><line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" class="dim"/><text x="' + ((x1 + x2) / 2) + '" y="' + (y - 7) + '" text-anchor="middle" class="dimtxt">' + esc(label) + '</text>';
  }
  function maatV(x, y1, y2, objX, label) {
    var cy = (y1 + y2) / 2;
    return '<line x1="' + objX + '" y1="' + y1 + '" x2="' + (x - 8) + '" y2="' + y1 + '" class="thin"/><line x1="' + objX + '" y1="' + y2 + '" x2="' + (x - 8) + '" y2="' + y2 + '" class="thin"/><line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" class="dim"/><text x="' + (x - 8) + '" y="' + cy + '" transform="rotate(-90 ' + (x - 8) + ' ' + cy + ')" text-anchor="middle" class="dimtxt">' + esc(label) + '</text>';
  }
  function schaalbalk(x, y, n) {
    var u = scaleM(n);
    return '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 2 * u) + '" y2="' + y + '" stroke="#111" stroke-width="4"/><line x1="' + x + '" y1="' + (y - 7) + '" x2="' + x + '" y2="' + (y + 7) + '" class="thin"/><line x1="' + (x + u) + '" y1="' + (y - 7) + '" x2="' + (x + u) + '" y2="' + (y + 7) + '" class="thin"/><line x1="' + (x + 2 * u) + '" y1="' + (y - 7) + '" x2="' + (x + 2 * u) + '" y2="' + (y + 7) + '" class="thin"/><text x="' + x + '" y="' + (y + 22) + '" class="micro">0</text><text x="' + (x + u) + '" y="' + (y + 22) + '" text-anchor="middle" class="micro">1 m</text><text x="' + (x + 2 * u) + '" y="' + (y + 22) + '" text-anchor="end" class="micro">2 m</text>';
  }

  /* ---------- de bladen ---------- */

  function voorblad(m) {
    var naam = m.product === 'poolhouse' ? 'POOLHOUSE'
      : m.alu ? 'ALUMINIUM OVERKAPPING'
      : (m.wanden === 'dicht' ? 'TUINKAMER' : 'OVERKAPPING');
    var out = sheetStart() + kader(m, 'H-00', 'TEKENINGENLIJST', 'n.v.t.');
    out += '<text x="55" y="78" class="title">' + (m.alu ? 'ALUMINIUM' : 'HOUTBOUW') + ' VOORONTWERP · ' + naam + '</text>';
    out += '<text x="55" y="112" class="label bold">' + esc(m.project) + '</text>';
    out += '<rect x="55" y="145" width="500" height="230" fill="#f6f2e7" stroke="#222"/>' +
      '<text x="78" y="180" class="label bold">PROJECTGEGEVENS</text>' +
      '<text x="78" y="212" class="small">Buitenmaat: ' + mm(m.w) + ' × ' + mm(m.dp) + ' mm · ' + m.opp + ' m²</text>' +
      '<text x="78" y="238" class="small">' + (m.alu ? 'Uitvoering' : 'Houtsoort') + ': ' + esc(m.hout) + '</text>' +
      '<text x="78" y="264" class="small">Dak: ' + esc(DAK[m.daktype] || m.daktype) + ' · ' + esc(m.bedekking) + '</text>' +
      '<text x="78" y="290" class="small">Wanden: ' + esc(m.wandenNaam) + '</text>' +
      '<text x="78" y="316" class="small">Staanders: ' + m.staanders + ' st · ' + m.staander + '</text>' +
      '<text x="78" y="342" class="small">Fundering: ' + esc(m.poer) + '</text>';
    out += '<text x="610" y="160" class="label bold">TEKENINGENLIJST</text>';
    var lijst = [
      ['H-01', 'Plattegrond · staanders en overspanningen'],
      ['H-02', 'Vooraanzicht'],
      ['H-03', 'Zijaanzicht'],
      ['H-04', 'Doorsnede dakpakket'],
      ['C-01', 'Funderingsplan · poeren'],
      ['M-01', (m.alu ? 'Materiaallijst' : 'Houtpakket') + ' / bestellijst'],
      ['M-02', 'Uitgangspunten en aannames'],
    ];
    lijst.forEach(function (r, i) {
      out += '<text x="610" y="' + (192 + i * 26) + '" class="small bold">' + r[0] + '</text><text x="672" y="' + (192 + i * 26) + '" class="small">' + esc(r[1]) + '</text>';
    });
    out += '<rect x="55" y="420" width="1010" height="150" fill="#fdf9ec" stroke="#b9a75a"/>' +
      '<text x="78" y="452" class="label bold">STATUS</text>' +
      '<text x="78" y="480" class="small">Parametrisch voorontwerp uit de configurator. De maatvoering volgt de gekozen samenstelling.</text>' +
      '<text x="78" y="506" class="small">' + (m.alu ? 'Profielen volgens systeemleverancier; definitieve maten na inmeting van de gevel.' : 'Staanderposities en profielmaten zijn richtwaarden; definitief na controle op de fundering ter plaatse.') + '</text>' +
      '<text x="78" y="532" class="small">Vergunningsvrij bouwen is situatieafhankelijk: controleer de regels van de gemeente.</text>';
    return out + '</svg>';
  }

  function plattegrond(m) {
    var s = scaleM(50), W = m.w * s, H = m.dp * s;
    var x = Math.max(150, Math.round((820 - W) / 2) + 90), y = 200;
    var out = sheetStart() + kader(m, 'H-01', 'PLATTEGROND', '1:50');
    out += '<text x="55" y="70" class="title">PLATTEGROND · STAANDERS EN OVERSPANNINGEN</text>';
    out += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + H + '" class="medium"/>';
    // liggers over de diepte, gestippeld
    for (var i = 1; i < m.vakken; i++) {
      var lx = x + (W / m.vakken) * i;
      out += '<line x1="' + lx + '" y1="' + y + '" x2="' + lx + '" y2="' + (y + H) + '" class="dash"/>';
    }
    // staanders: bij montage aan huis draagt de achterzijde op een muurprofiel
    var vul = m.alu ? 'alum' : 'wood';
    var st = 14;
    for (var k = 0; k <= m.vakken; k++) {
      var sx = x + (W / m.vakken) * k - st / 2;
      out += '<rect x="' + sx + '" y="' + (y - st / 2) + '" width="' + st + '" height="' + st + '" class="' + vul + '"/>';
      if (!m.aanhuis) out += '<rect x="' + sx + '" y="' + (y + H - st / 2) + '" width="' + st + '" height="' + st + '" class="' + vul + '"/>';
    }
    if (m.aanhuis) {
      out += '<line x1="' + (x - 20) + '" y1="' + (y + H) + '" x2="' + (x + W + 20) + '" y2="' + (y + H) + '" class="heavy"/>' +
        '<text x="' + (x + W / 2) + '" y="' + (y + H + 24) + '" text-anchor="middle" class="micro bold">MUURPROFIEL AAN BESTAANDE GEVEL · CHEMISCH VERANKERD</text>';
    }
    // wanden
    if (m.achterwand || m.wanden === 'dicht') out += '<line x1="' + x + '" y1="' + (y + H) + '" x2="' + (x + W) + '" y2="' + (y + H) + '" class="heavy"/>';
    if (m.wanden === 'dicht') {
      out += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + H) + '" class="heavy"/><line x1="' + (x + W) + '" y1="' + y + '" x2="' + (x + W) + '" y2="' + (y + H) + '" class="heavy"/>';
    } else if (m.wanden === 'schuif') {
      out += '<line x1="' + x + '" y1="' + (y + 6) + '" x2="' + x + '" y2="' + (y + H - 6) + '" stroke="#2b7f95" stroke-width="4"/><line x1="' + (x + W) + '" y1="' + (y + 6) + '" x2="' + (x + W) + '" y2="' + (y + H - 6) + '" stroke="#2b7f95" stroke-width="4"/>';
      out += '<text x="' + (x - 14) + '" y="' + (y + H / 2) + '" transform="rotate(-90 ' + (x - 14) + ' ' + (y + H / 2) + ')" text-anchor="middle" class="micro bold" fill="#2b7f95">GLAZEN SCHUIFWAND</text>';
    }
    out += maatH(x, x + W, y + H + 92, y + H, mm(m.w) + ' mm');
    out += maatH(x, x + W / m.vakken, y + H + 56, y + H, 'h.o.h. ' + Math.round(mm(m.w) / m.vakken) + ' mm');
    out += maatV(x - 55, y, y + H, x, mm(m.dp) + ' mm');
    out += '<text x="850" y="160" class="label bold">CONSTRUCTIE</text>' +
      '<text x="850" y="190" class="small">Staanders ' + m.staander + '</text>' +
      '<text x="850" y="212" class="tiny">' + esc(m.hout) + '</text>' +
      '<text x="850" y="244" class="small">Liggers ' + m.ligger + '</text>' +
      '<text x="850" y="266" class="tiny">overspanning ' + mm(m.dp) + ' mm</text>' +
      '<text x="850" y="298" class="small">' + (m.alu ? 'Dak ' : 'Gordingen ') + m.gording + '</text>' +
      '<text x="850" y="320" class="tiny">' + (m.alu ? (m.daktype === 'lamellen' ? 'aaneengesloten in het kader' : 'h.o.h. 700 mm') : 'h.o.h. 600 mm') + '</text>';
    out += schaalbalk(850, 380, 50);
    out += '<text x="55" y="640" class="note">Maatvoering in millimeters. Staanders op de hoeken; tussenafstand hoogstens 2,5 m. A3 afdrukken op 100%.</text>';
    return out + '</svg>';
  }

  function aanzicht(m, blad, titel, breedteM, zij) {
    var s = scaleM(50), W = breedteM * s;
    var x = Math.max(140, Math.round((1120 - W) / 2)), grond = 560;
    var hV = m.hVoor * s, nokH = m.nok * s;
    var out = sheetStart() + kader(m, blad, titel, '1:50');
    out += '<text x="55" y="70" class="title">' + esc(titel).toUpperCase() + '</text>';
    // maaiveld
    out += '<line x1="80" y1="' + grond + '" x2="1040" y2="' + grond + '" class="grond"/>';
    for (var gx = 90; gx < 1030; gx += 26) out += '<line x1="' + gx + '" y1="' + grond + '" x2="' + (gx - 11) + '" y2="' + (grond + 11) + '" class="thin"/>';
    var vak = zij ? 1 : m.vakken;
    var vul = m.alu ? 'alum' : 'wood';
    var st = 12;
    // staanders
    for (var i = 0; i <= vak; i++) {
      var sx = x + (W / vak) * i - st / 2;
      out += '<rect x="' + sx + '" y="' + (grond - hV) + '" width="' + st + '" height="' + hV + '" class="' + vul + '"/>';
    }
    /* Het dak. In het zijaanzicht zie je het profiel (driehoek of helling);
       in het vooraanzicht zie je de goot als horizontale band, met bij een
       zadeldak de noklijn erboven — een helling tekenen in het vooraanzicht
       zou de kijkrichting verwisselen. */
    if (m.plat && m.alu) {
      /* Het kaderprofiel van 230 mm boven de doorloophoogte — de twee maten
         die een verkoper en een monteur allebei willen zien. */
      var kh = 0.23 * s;
      out += '<rect x="' + (x - 22) + '" y="' + (grond - hV - kh) + '" width="' + (W + 44) + '" height="' + kh + '" class="' + vul + '"/>';
      out += maatV(x - 60, grond - hV - kh, grond, x - 22, mm(m.nok) + ' mm systeem');
      out += maatV(x - 100, grond - hV, grond, x - 22, mm(m.hVoor) + ' mm doorloop');
      out += '<text x="' + (x + W + 30) + '" y="' + (grond - hV - kh - 6) + '" class="tiny bold">+' + mm(m.nok) + ' BOVENKANT KADER</text>';
    } else if (m.plat) {
      out += '<rect x="' + (x - 22) + '" y="' + (grond - hV - 20) + '" width="' + (W + 44) + '" height="20" class="' + vul + '"/>';
      out += maatV(x - 60, grond - hV - 20, grond, x - 22, mm(m.hVoor) + ' mm');
      out += '<text x="' + (x + W + 30) + '" y="' + (grond - hV - 26) + '" class="tiny bold">+' + mm(m.hVoor) + ' BOVENKANT DAKRAND</text>';
    } else if (zij) {
      if (m.daktype === 'zadeldak') {
        var nokX = x + W / 2;
        out += '<path d="M' + (x - 22) + ' ' + (grond - hV) + ' L' + nokX + ' ' + (grond - nokH) + ' L' + (x + W + 22) + ' ' + (grond - hV) + '" class="heavy"/>';
        out += maatV(x - 60, grond - nokH, grond, x - 22, mm(m.nok) + ' mm nok');
      } else {
        out += '<path d="M' + (x - 22) + ' ' + (grond - hV) + ' L' + (x + W + 22) + ' ' + (grond - nokH) + '" class="heavy"/>';
        out += maatV(x - 60, grond - hV, grond, x - 22, mm(m.hVoor) + ' mm goot');
      }
    } else {
      out += '<rect x="' + (x - 22) + '" y="' + (grond - hV - 16) + '" width="' + (W + 44) + '" height="16" class="' + vul + '"/>';
      out += maatV(x - 60, grond - hV - 16, grond, x - 22, mm(m.hVoor) + ' mm goot');
      if (m.daktype === 'zadeldak') {
        out += '<line x1="' + (x - 22) + '" y1="' + (grond - nokH) + '" x2="' + (x + W + 22) + '" y2="' + (grond - nokH) + '" class="dash"/>' +
          '<text x="' + (x + W + 30) + '" y="' + (grond - nokH + 4) + '" class="tiny bold">+' + mm(m.nok) + ' NOK</text>';
      }
    }
    // wanden in aanzicht
    if (!zij && m.wanden === 'schuif') {
      out += '<rect x="' + x + '" y="' + (grond - hV + 24) + '" width="' + W + '" height="' + (hV - 24) + '" class="glass" opacity=".55"/>';
      for (var p = 1; p < 4; p++) out += '<line x1="' + (x + W * p / 4) + '" y1="' + (grond - hV + 24) + '" x2="' + (x + W * p / 4) + '" y2="' + grond + '" class="medium"/>';
      out += '<text x="' + (x + W / 2) + '" y="' + (grond - hV / 2) + '" text-anchor="middle" class="tiny bold" fill="#2b7f95">GLAZEN SCHUIFWAND · 4 PANELEN</text>';
    }
    if (!zij && m.wanden === 'dicht') {
      out += '<rect x="' + x + '" y="' + (grond - hV + 24) + '" width="' + W + '" height="' + (hV - 24) + '" class="wood" opacity=".5"/>';
      var deurW = Math.min(W * .22, scaleM(50) * 1.0);
      out += '<rect x="' + (x + W * .12) + '" y="' + (grond - scaleM(50) * 2.05) + '" width="' + deurW + '" height="' + (scaleM(50) * 2.05) + '" fill="#fff" class="medium"/>' +
        '<text x="' + (x + W * .12 + deurW / 2) + '" y="' + (grond - 12) + '" text-anchor="middle" class="micro bold">DEUR</text>';
    }
    out += maatH(x, x + W, grond + 48, grond, mm(breedteM) + ' mm');
    out += '<text x="55" y="640" class="note">Peil = bovenkant afgewerkte bestrating. Hoogtes in millimeters vanaf peil.</text>';
    out += schaalbalk(870, 130, 50);
    return out + '</svg>';
  }

  function doorsnede(m) {
    var out = sheetStart() + kader(m, 'H-04', 'DOORSNEDE DAKPAKKET', '1:10');
    out += '<text x="55" y="70" class="title">DOORSNEDE DAKPAKKET</text>';
    var x = 240, y = 210, w = 560;
    var lagen = m.alu
      ? [[m.daktype === 'lamellen' ? 'Lamellen 210 mm · kantelbaar 0–150°, sluiten waterdicht' : m.bedekking, 30],
         ['Geïntegreerde goot rondom · bladvanger, vergrote uitloop', 34],
         ['Kaderprofiel hoogte 230 mm · motor en bediening ingebouwd', 56]]
      : m.plat
      ? [[m.bedekking, 26], ['Dakbeschot 18 mm', 20], ['Gordingen ' + m.gording + ' · h.o.h. 600 mm', 56], ['Ligger ' + m.ligger, 62]]
      : [[m.bedekking + (m.daktype === 'zadeldak' ? ' · beide dakvlakken' : ''), 30], ['Panlatten 22 × 50 mm + tengels', 24], ['Dakbeschot 18 mm', 20], ['Gordingen ' + m.gording, 56]];
    var yy = y;
    lagen.forEach(function (l, i) {
      out += '<rect x="' + x + '" y="' + yy + '" width="' + w + '" height="' + l[1] + '" class="' + (i % 2 ? (m.alu ? 'alum' : 'wood') : 'poer') + '"/>';
      out += '<line x1="' + (x + w) + '" y1="' + (yy + l[1] / 2) + '" x2="' + (x + w + 46) + '" y2="' + (yy + l[1] / 2) + '" class="thin"/>';
      out += '<text x="' + (x + w + 54) + '" y="' + (yy + l[1] / 2 + 4) + '" class="small">' + esc(l[0]) + '</text>';
      yy += l[1];
    });
    out += '<rect x="' + (x + w / 2 - 16) + '" y="' + yy + '" width="32" height="150" class="' + (m.alu ? 'alum' : 'wood') + '"/>';
    out += '<text x="' + (x + w / 2 + 28) + '" y="' + (yy + 80) + '" class="small">Staander ' + m.staander + '</text>';
    out += maatV(x - 42, y, yy, x, Math.round(lagen.reduce(function (a, l) { return a + l[1]; }, 0) / scaleM(10) * 1000) + ' mm');
    out += '<text x="55" y="640" class="note">' + (m.alu ? 'Waterafvoer via de goot door de staander. Optioneel: regen- en windsensor, waarmee de lamellen automatisch sluiten bij regen. Elektra in de staander meenemen.' : m.plat ? 'Afschot ca. 2% naar de achterzijde; hwa in de achterste staander weggewerkt.' : 'Dakhelling 25 graden; overstek 220 mm rondom.') + '</text>';
    return out + '</svg>';
  }

  function fundering(m) {
    var s = scaleM(50), W = m.w * s, H = m.dp * s;
    var x = Math.max(150, Math.round((820 - W) / 2) + 90), y = 200;
    var out = sheetStart() + kader(m, 'C-01', 'FUNDERINGSPLAN', '1:50');
    out += '<text x="55" y="70" class="title">FUNDERINGSPLAN · POEREN</text>';
    out += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + H + '" class="dash"/>';
    var pr = 11;
    for (var k = 0; k <= m.vakken; k++) {
      var px = x + (W / m.vakken) * k;
      (m.aanhuis ? [y] : [y, y + H]).forEach(function (py) {
        out += '<rect x="' + (px - pr) + '" y="' + (py - pr) + '" width="' + (pr * 2) + '" height="' + (pr * 2) + '" class="poer"/><line x1="' + (px - pr) + '" y1="' + (py - pr) + '" x2="' + (px + pr) + '" y2="' + (py + pr) + '" class="thin"/><line x1="' + (px - pr) + '" y1="' + (py + pr) + '" x2="' + (px + pr) + '" y2="' + (py - pr) + '" class="thin"/>';
      });
    }
    out += maatH(x, x + W / m.vakken, y + H + 56, y + H, 'h.o.h. ' + Math.round(mm(m.w) / m.vakken) + ' mm');
    out += maatH(x, x + W, y + H + 92, y + H, mm(m.w) + ' mm');
    out += maatV(x - 55, y, y + H, x, mm(m.dp) + ' mm');
    out += '<text x="850" y="160" class="label bold">POER</text>' +
      '<text x="850" y="190" class="small">' + esc(m.poer) + '</text>' +
      '<text x="850" y="216" class="tiny">aantal: ' + m.staanders + ' st</text>' +
      '<text x="850" y="242" class="tiny">vorstvrij aanleggen, min. 600 mm diep</text>' +
      '<text x="850" y="268" class="tiny">stelruimte voetplaat ± 25 mm</text>';
    out += schaalbalk(850, 330, 50);
    out += '<text x="55" y="640" class="note">Posities uitzetten vanaf de achterste bouwlijn. Ondergrond en draagkracht ter plaatse beoordelen.</text>';
    return out + '</svg>';
  }

  function houtpakket(m) {
    var titel = (m.alu ? 'MATERIAALLIJST' : 'HOUTPAKKET') + ' / BESTELLIJST';
    var out = sheetStart() + kader(m, 'M-01', titel, 'n.v.t.');
    out += '<text x="55" y="70" class="title">' + titel + '</text>';
    var lengteHoek = m.plat ? m.hVoor : m.nok;
    if (m.alu) {
      var regels = [
        [m.staanders, 'st', 'Staander ' + m.staander + ' · lengte ' + mm(m.hVoor) + ' mm', esc(m.hout)],
        [1, 'set', 'Goot-/kaderprofiel 200 × 130 mm · ' + mm(m.w) + ' × ' + mm(m.dp) + ' mm', 'afwatering door de staander'],
        [Math.round(m.w * m.dp * 10) / 10, 'm²', esc(m.bedekking), m.daktype === 'lamellen' ? 'inclusief motor en bediening' : 'op sporenprofielen'],
        [1, 'set', 'Bevestiging: ' + (m.aanhuis ? 'muurprofiel + chemische ankers' : 'voetplaten + ankers'), m.aanhuis ? 'gevel vooraf inmeten' : ''],
      ];
      if (m.wanden === 'schuif') regels.push([4, 'st', 'Glazen schuifwandpaneel · hoogte 2200 mm', 'gehard glas 10 mm']);
      if (m.wanden === 'screens') regels.push([2, 'st', 'Rits-screen elektrisch · breedte per vak', 'windvast, op afstandsbediening']);
      if (m.wanden === 'dicht') regels.push([Math.round((m.w + 2 * m.dp) * m.hVoor * 10) / 10, 'm²', 'Aluminium wandpanelen', 'inclusief deur en beslag']);
      return bestellijstBlad(out, regels);
    }
    var regels = [
      [m.staanders, 'st', 'Staander ' + m.staander + ' · lengte ' + mm(lengteHoek + 0.1) + ' mm', esc(m.hout)],
      [2, 'st', 'Hoofdligger ' + m.ligger + ' · lengte ' + mm(m.w + 0.44) + ' mm', 'inclusief overstek'],
      [Math.ceil(mm(m.w) / 600) + 1, 'st', 'Gording ' + m.gording + ' · lengte ' + mm(m.dp + 0.44) + ' mm', 'h.o.h. 600 mm'],
      [Math.round(m.w * m.dp * 1.05 * 10) / 10, 'm²', 'Dakbeschot 18 mm', 'incl. 5% zaagverlies'],
      [Math.round(m.w * m.dp * 1.1 * 10) / 10, 'm²', esc(m.bedekking), m.plat ? 'incl. opstanden en randafwerking' : 'incl. nok- en gevelpannen'],
      [2 * (m.vakken + 1), 'st', esc(m.poer), 'met verstelbare voetplaat'],
      [1, 'set', 'Bevestigingsmiddelen RVS', 'balkdragers, hoekankers, schroeven'],
      [Math.round((m.w + m.dp) * 2 * 10) / 10, 'm¹', 'Hemelwaterafvoer + goot', 'antraciet aluminium'],
    ];
    if (m.wanden === 'schuif') regels.push([4, 'st', 'Glazen schuifwandpaneel · hoogte 2200 mm', 'gehard glas 10 mm']);
    if (m.wanden === 'dicht') regels.push([Math.round((m.w + 2 * m.dp) * m.hVoor * 10) / 10, 'm²', 'Wandpakket rabat + regelwerk', 'inclusief deur en beslag']);
    if (m.achterwand) regels.push([Math.round(m.w * m.hVoor * 10) / 10, 'm²', 'Achterwand rabat + regelwerk', '']);
    return bestellijstBlad(out, regels);
  }

  function bestellijstBlad(out, regels) {
    out += '<line x1="55" y1="120" x2="1065" y2="120" stroke="#111" stroke-width="2"/>';
    out += '<text x="70" y="112" class="micro bold">AANTAL</text><text x="150" y="112" class="micro bold">EENHEID</text><text x="240" y="112" class="micro bold">OMSCHRIJVING</text><text x="760" y="112" class="micro bold">OPMERKING</text>';
    regels.forEach(function (r, i) {
      var ry = 152 + i * 36;
      out += '<text x="128" y="' + ry + '" text-anchor="end" class="small bold">' + String(r[0]).replace('.', ',') + '</text>' +
        '<text x="150" y="' + ry + '" class="small">' + r[1] + '</text>' +
        '<text x="240" y="' + ry + '" class="small">' + r[2] + '</text>' +
        '<text x="760" y="' + ry + '" class="tiny">' + r[3] + '</text>' +
        '<line x1="55" y1="' + (ry + 12) + '" x2="1065" y2="' + (ry + 12) + '" class="thin" opacity=".4"/>';
    });
    out += '<text x="55" y="640" class="note">Indicatieve bestellijst voor de werkvoorbereiding, geen productiestuklijst. Lengtes afgestemd op gangbare handelsmaten.</text>';
    return out + '</svg>';
  }

  function aannames(m) {
    var out = sheetStart() + kader(m, 'M-02', 'UITGANGSPUNTEN EN AANNAMES', 'n.v.t.');
    out += '<text x="55" y="70" class="title">UITGANGSPUNTEN EN AANNAMES</text>';
    var punten = m.alu ? [
      'Eén dakveld overspant tot ca. 6 × 4,5 m; grotere maten door velden te koppelen. De opgave van de systeemleverancier is leidend.',
      'Doorloophoogte 2400 mm, systeemhoogte 2630 mm (kaderprofiel 230 mm).',
      m.aanhuis ? 'Montage aan huis: muurprofiel chemisch verankerd; gevel en spouw vooraf beoordelen.'
                : 'Vrijstaand: staanders rondom, voetplaten verankerd in de verharding of op poeren.',
      'Waterafvoer loopt door de goot en de staander; positie afvoer afstemmen op de bestrating.',
      'Elektra voor lamellenbediening, screens en verlichting vóór montage aanleggen.',
      m.wanden === 'screens' ? 'Rits-screens zijn windvast tot windkracht 6; boven balustrades paneelhoogte controleren.' : null,
      'Vergunningsvrij bouwen is situatieafhankelijk: controleer bijbehorend bouwwerk en achtererfgebied bij de gemeente.',
    ].filter(Boolean) : [
      'Staanderafstand hoogstens 2,5 m hart-op-hart; op elke hoek een staander.',
      'Profielmaten zijn richtwaarden voor overspanningen tot 4 m; daarboven een zwaarder profiel of extra staander.',
      'Poeren vorstvrij aanleggen (600 mm); draagkracht van de ondergrond ter plaatse beoordelen.',
      'Peil = bovenkant afgewerkte bestrating; hoogtes vanaf peil in millimeters.',
      m.plat ? 'Plat dak op 2% afschot naar achteren; hwa weggewerkt in de achterste staander.'
             : 'Dakhelling 25 graden; bedekking bepaalt de minimale helling: riet vraagt 30 graden of meer.',
      m.wanden === 'schuif' ? 'Glazen schuifwanden: gehard glas 10 mm, lopend op een RVS bovenrail.' : null,
      m.wanden === 'dicht' ? 'Tuinkamer: wandpakket met regelwerk en rabat; deurpositie in overleg.' : null,
      'Vergunningsvrij bouwen is situatieafhankelijk: controleer bijbehorend bouwwerk en achtererfgebied bij de gemeente.',
    ].filter(Boolean);
    punten.forEach(function (t, i) {
      out += '<circle cx="72" cy="' + (140 + i * 52) + '" r="4" fill="#B38900"/><text x="94" y="' + (145 + i * 52) + '" class="small">' + esc(t) + '</text>';
    });
    return out + '</svg>';
  }

  function sheets(m) {
    return [voorblad(m), plattegrond(m), aanzicht(m, 'H-02', 'Vooraanzicht', m.w, false),
      aanzicht(m, 'H-03', 'Zijaanzicht', m.dp, true), doorsnede(m), fundering(m), houtpakket(m), aannames(m)];
  }

  function pakketHtml(m) {
    var bladen = sheets(m);
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Technisch tekeningenpakket ' + esc(m.project) + '</title><style>body{margin:0;background:#333;font-family:Arial}header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center}header b{font-size:14px}button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}.sheet{width:min(96vw,1120px);margin:22px auto;box-shadow:0 8px 28px #0008;background:#fff}.sheet svg{display:block;width:100%;height:auto}@media print{header{display:none}body{background:#fff}.sheet{width:100%;margin:0;box-shadow:none;page-break-after:always}.sheet:last-child{page-break-after:auto}}@page{size:A3 landscape;margin:0}</style></head><body><header><b>' + esc(m.project) + ' · technisch tekeningenpakket · ' + bladen.length + ' bladen</b><button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' + bladen.map(function (s) { return '<div class="sheet">' + s + '</div>'; }).join('') + '</body></html>';
  }

  function open(product) {
    var sel = typeof global.NGKeuze === 'function' ? (global.NGKeuze() || {}) : {};
    var m = model(product, sel);
    NGAfdruk.toon(pakketHtml(m), 'ng-tekeningen-hout', 'Technische tekeningen');
  }

  function init(opties) {
    var product = (opties && opties.product) || 'overkapping';
    var haak = function () {
      var offerte = document.getElementById('naarOfferte');
      if (!offerte || document.getElementById('tekeningenBtn')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn--ghost'; b.id = 'tekeningenBtn';
      b.textContent = 'Technische tekeningen';
      b.title = 'Open het technische voorontwerp';
      b.addEventListener('click', function () { open(product); });
      offerte.parentNode.insertBefore(b, offerte.nextSibling);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', haak); else haak();
  }

  global.NGTekeningenHout = { init: init, open: open, model: model, pakketHtml: pakketHtml, sheets: sheets };
})(typeof window !== 'undefined' ? window : globalThis);
