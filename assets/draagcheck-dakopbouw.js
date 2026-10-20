/* Draagcheck D-01: kan de bestaande woning de dakopbouw dragen?
 *
 * Dit is nadrukkelijk GEEN constructieberekening van de bestaande bouw. Het
 * is de eerste toets die een constructeur zelf ook doet: hoeveel gewicht
 * brengt de opbouw in, waar draagt dat op af, en past de oplegdruk binnen
 * wat gangbaar metselwerk aankan. Elk blad draagt daarom de status TER
 * CONTROLE CONSTRUCTEUR — de definitieve beoordeling van muren, fundering
 * en stabiliteit blijft mensenwerk, ter plaatse.
 *
 * Net als bij de balkberekening is het weigeren de kern van het ontwerp:
 * bij een onbekende muuropbouw, zichtbare scheuren, drie of meer bouwlagen
 * of maten buiten het bereik geeft de check geen oordeel maar een
 * doorverwijzing met redenen. Een draagcheck die altijd "kan" zegt, is
 * gevaarlijker dan geen draagcheck.
 *
 * De belastingen komen uit dezelfde voorselectie als de technische
 * tekeningen (NGBouwkundig): dak gk 0,65 / qk 0,70 kN/m² (groendak +1,00),
 * vloer gk 0,75 / qk 2,00 kN/m². Zo spreken tekeningen en draagcheck
 * elkaar nooit tegen.
 */
(function (global) {
  'use strict';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>\"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c]; }); };
  var f1 = function (x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); };
  var f2 = function (x) { return (Math.round(x * 100) / 100).toString().replace('.', ','); };

  /* ---------- rekenwaarden ---------- */
  var DAK_GK = 0.65, DAK_QK = 0.70, GROEN_EXTRA = 1.00;   // kN/m², als NGBouwkundig
  var VLOER_GK = 0.75, VLOER_QK = 2.00;                    // kN/m², als NGBouwkundig
  /* Eigen gewicht van de nieuwe HSB-gevels per m² wandoppervlak. Aanname,
     voluit op het blad benoemd: steenstrips zijn het zwaarste pakket. */
  var WAND_GEWICHT = { 'classic-brick': 0.85, standaard: 0.55 };
  var OPLEGDRUK_TOEL = 0.6;                                // N/mm², zelfde conservatieve waarde als DB-01
  var MUUR = {
    steens: { naam: 'steens metselwerk', dikte: 210 },
    spouw:  { naam: 'spouwmuur, dragend binnenblad', dikte: 100 },
  };
  var GRENZEN = { diepteMax: 6.0, bouwlagenMax: 2 };

  /**
   * @param invoer {breedte, diepte, hoogte, gevel, groenDak, bestaandDak,
   *   muurtype:'steens'|'spouw'|'onbekend', vloertype:'hout'|'beton',
   *   bouwlagen:1|2|3, scheuren:boolean}
   */
  function bereken(invoer) {
    var inv = {
      breedte: Number(invoer.breedte) || 6,
      diepte: Number(invoer.diepte) || 4,
      hoogte: Number(invoer.hoogte) || 2.8,
      gevel: invoer.gevel || 'keralit',
      groenDak: !!invoer.groenDak,
      bestaandDak: invoer.bestaandDak === 'hellend' ? 'hellend' : 'plat',
      muurtype: MUUR[invoer.muurtype] ? invoer.muurtype : 'onbekend',
      vloertype: invoer.vloertype === 'beton' ? 'beton' : 'hout',
      bouwlagen: Number(invoer.bouwlagen) || 2,
      scheuren: !!invoer.scheuren,
    };

    /* -- weigeren wat niet in een draagcheck thuishoort -- */
    var redenen = [];
    if (inv.muurtype === 'onbekend') redenen.push('De opbouw van de dragende muren is onbekend. Zonder muurtype valt er niets te toetsen. Een bouwtekening van de woning of een opname ter plaatse is nodig.');
    if (inv.scheuren) redenen.push('Er zijn scheuren in het metselwerk gemeld. Bestaande schade moet eerst door een constructeur beoordeeld worden; daar rekent deze check bewust niet overheen.');
    if (inv.bouwlagen > GRENZEN.bouwlagenMax) redenen.push('Drie of meer bestaande bouwlagen: de lastafdracht door zoveel lagen valt buiten het bereik van deze check.');
    if (inv.diepte > GRENZEN.diepteMax) redenen.push('Opbouw dieper dan ' + f1(GRENZEN.diepteMax) + ' m, buiten het bereik van deze draagcheck.');
    if (redenen.length) {
      return { geweigerd: true, redenen: redenen, invoer: inv,
               advies: 'Dit geval moet rechtstreeks naar de constructeur. Vraag de offerte aan met deze gegevens erbij; wij zetten de beoordeling voor je in gang.' };
    }

    /* -- lastopbouw, regel voor regel zodat het blad ze kan tonen --
       De opbouw draagt over de diepte af op de twee draaggevels. */
    var half = inv.diepte / 2;
    var dakGk = DAK_GK + (inv.groenDak ? GROEN_EXTRA : 0);
    var wandG = (WAND_GEWICHT[inv.gevel] || WAND_GEWICHT.standaard) * inv.hoogte;
    var regels = [
      { soort: 'G', naam: 'nieuw dak (' + (inv.groenDak ? 'incl. sedum' : 'EPDM/bitumen') + ')', basis: f2(dakGk) + ' kN/m² × ' + f2(half) + ' m', kNm: dakGk * half },
      { soort: 'G', naam: 'nieuwe vloeropbouw', basis: f2(VLOER_GK) + ' kN/m² × ' + f2(half) + ' m', kNm: VLOER_GK * half },
      { soort: 'G', naam: 'nieuwe HSB-gevel', basis: f2(WAND_GEWICHT[inv.gevel] || WAND_GEWICHT.standaard) + ' kN/m² × ' + f2(inv.hoogte) + ' m', kNm: wandG },
      { soort: 'Q', naam: 'veranderlijk, woonfunctie', basis: f2(VLOER_QK) + ' kN/m² × ' + f2(half) + ' m', kNm: VLOER_QK * half },
    ];
    var gk = dakGk * half + VLOER_GK * half + wandG;
    var qk = VLOER_QK * half;
    /* NEN-EN 1990 NB, CC2: maatgevende combinatie zoals bij DB-01 */
    var nEd = Math.max(1.35 * gk, 1.2 * gk + 1.5 * qk);   // kN per m¹ gevel

    var muur = MUUR[inv.muurtype];
    var druk = nEd * 1e3 / (muur.dikte * 1000);            // N/mm²
    var controles = [
      { naam: 'Oplegdruk op ' + muur.naam, eis: 'σ ≤ ' + f2(OPLEGDRUK_TOEL) + ' N/mm²',
        waarde: f2(druk) + ' N/mm²', grens: f2(OPLEGDRUK_TOEL) + ' N/mm²', uc: druk / OPLEGDRUK_TOEL },
    ];
    var ok = controles.every(function (c) { return c.uc <= 1.0; });
    if (!ok) {
      return { geweigerd: true, invoer: inv, redenen: ['De oplegdruk op de bestaande muur (' + f2(druk) + ' N/mm²) komt boven de conservatieve grens van ' + f2(OPLEGDRUK_TOEL) + ' N/mm². Dat betekent niet per se dat het niet kan, wel dat een constructeur de werkelijke muursterkte moet vaststellen.'],
               advies: 'Dit geval moet rechtstreeks naar de constructeur.' };
    }

    var advies = [];
    if (inv.vloertype === 'hout') {
      advies.push('De bestaande zoldervloer is van hout en wordt de vloer van de nieuwe verdieping. Reken op verzwaring van de bestaande balklaag. Die optie staat in de configurator onder Toegang & verzwaring; de constructeur bepaalt de definitieve maat.');
    } else {
      advies.push('De bestaande verdiepingsvloer is van beton; verzwaring van de balklaag is doorgaans niet nodig. De constructeur bevestigt dit bij de opname.');
    }
    if (inv.bestaandDak === 'hellend') {
      advies.push('De bestaande kap gaat eraf. Na sloop wijzigt de lastafdracht; de aansluiting op de muurplaat en de stabiliteit van de topgevels neemt de constructeur mee in de beoordeling.');
    }
    advies.push('De fundering is niet getoetst: daarvoor is de bestaande situatie (funderingstype, grondslag) nodig. De extra last per gevel is ' + f1(nEd) + ' kN per strekkende meter. Dat getal neemt de constructeur mee.');

    return {
      geweigerd: false, invoer: inv, regels: regels,
      gk: gk, qk: qk, nEd: nEd,
      combinatie: (1.35 * gk >= 1.2 * gk + 1.5 * qk) ? '1,35·Gk' : '1,2·Gk + 1,5·Qk',
      controles: controles, advies: advies,
      aannamen: [
        'Lastafdracht van de opbouw over de diepte op de twee draaggevels; tussenwanden dragen niet mee.',
        'Belastingen gelijk aan de voorselectie van de technische tekeningen: dak gk ' + f2(dakGk) + ' / qk ' + f2(DAK_QK) + ' kN/m², vloer gk ' + f2(VLOER_GK) + ' / qk ' + f2(VLOER_QK) + ' kN/m².',
        'Eigen gewicht nieuwe HSB-gevel ' + f2(WAND_GEWICHT[inv.gevel] || WAND_GEWICHT.standaard) + ' kN/m² wandoppervlak (steenstrips zwaarder dan panelen).',
        'Belastingcombinatie NEN-EN 1990 NB, gevolgklasse CC2, zelfde basis als balkberekening DB-01.',
        'Oplegdruk getoetst op ' + f2(OPLEGDRUK_TOEL) + ' N/mm², conservatief voor gangbaar metselwerk; de werkelijke muursterkte stelt de constructeur vast.',
        'Fundering, stabiliteit, windbelasting en de staat van het bestaande metselwerk vallen buiten deze check en horen bij de constructeur.',
      ],
    };
  }

  /* ---------- de bladen, in de stijl van DB-01 ---------- */

  function kader(project, blad, titel) {
    return '<rect x="20" y="20" width="1080" height="730" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<line x1="20" y1="680" x2="1100" y2="680" stroke="#111"/>' +
      '<line x1="650" y1="680" x2="650" y2="750" stroke="#111"/>' +
      '<line x1="850" y1="680" x2="850" y2="750" stroke="#111"/>' +
      '<text x="38" y="704" class="brand">NEXT GROWTH · DRAAGCHECK DAKOPBOUW</text>' +
      '<text x="38" y="728" class="tiny">' + esc(project) + ' · ' + esc(titel) + '</text>' +
      '<text x="665" y="702" class="micro">BLAD</text><text x="665" y="727" class="small bold">' + esc(blad) + '</text>' +
      '<text x="865" y="702" class="micro">STATUS</text><text x="865" y="727" class="stampG">TER CONTROLE CONSTRUCTEUR</text>';
  }
  function styles() {
    return '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.micro{font-size:9px;letter-spacing:.45px}.tiny{font-size:11px}.small{font-size:14px}.label{font-size:16px}.title{font-size:25px;font-weight:700}.brand{font-size:15px;font-weight:800}.bold{font-weight:700}.stampG{font-size:12px;font-weight:800;fill:#a32323}.note{font-size:12px;fill:#333}.thin{stroke:#555;stroke-width:.9;fill:none}.medium{stroke:#222;stroke-width:2.2;fill:none}.ucOk{fill:#3f7d47}.ucBar{fill:#eee;stroke:#999;stroke-width:.6}.muur{fill:#e8e4da;stroke:#333}.hsb{fill:#f6efe2;stroke:#B38900}</style>';
  }
  function sheetStart() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 770" role="img">' + styles() + '<rect width="1120" height="770" fill="#fff"/>';
  }
  function voetnoot() {
    return '<text x="55" y="618" class="note bold">Dit is een draagcheck als voorwerk, geen constructieberekening van de bestaande bouw. Beoordeling en waarmerking door een constructeur is vereist voor vergunning en uitvoering.</text>';
  }

  function bladToets(r) {
    var project = 'D-01 · opbouw ' + f2(r.invoer.breedte) + ' × ' + f2(r.invoer.diepte) + ' m';
    var out = sheetStart() + kader(project, 'D-01', 'Lastopbouw en toets');
    out += '<text x="55" y="70" class="title">DRAAGCHECK DAKOPBOUW · D-01</text>';
    out += '<text x="55" y="100" class="label bold">Bestaand: ' + esc(MUUR[r.invoer.muurtype].naam) + ' · ' + esc(r.invoer.vloertype) + 'nen verdiepingsvloer · ' + r.invoer.bouwlagen + ' bouwla' + (r.invoer.bouwlagen > 1 ? 'gen' : 'ag') + '</text>';

    out += '<text x="55" y="140" class="label bold">LASTOPBOUW PER STREKKENDE METER DRAAGGEVEL</text>';
    var y = 168;
    r.regels.forEach(function (rg) {
      out += '<text x="55" y="' + y + '" class="small bold">' + rg.soort + '</text>' +
        '<text x="85" y="' + y + '" class="small">' + esc(rg.naam) + '</text>' +
        '<text x="470" y="' + y + '" class="tiny">' + esc(rg.basis) + '</text>' +
        '<text x="705" y="' + y + '" text-anchor="end" class="small bold">' + f2(rg.kNm) + ' kN/m</text>';
      y += 26;
    });
    y += 8;
    out += '<line x1="55" y1="' + (y - 22) + '" x2="705" y2="' + (y - 22) + '" class="thin"/>';
    out += '<text x="55" y="' + y + '" class="small bold">Gk = ' + f2(r.gk) + ' kN/m · Qk = ' + f2(r.qk) + ' kN/m → N_Ed = ' + f2(r.nEd) + ' kN/m (' + esc(r.combinatie) + ')</text>';

    out += '<text x="55" y="' + (y + 44) + '" class="label bold">TOETS</text>';
    var cy = y + 72;
    r.controles.forEach(function (c) {
      out += '<text x="55" y="' + cy + '" class="small">' + esc(c.naam) + '</text>' +
        '<text x="380" y="' + cy + '" class="tiny">' + esc(c.eis) + '</text>' +
        '<text x="540" y="' + cy + '" class="small">' + esc(c.waarde) + ' / ' + esc(c.grens) + '</text>' +
        '<rect x="740" y="' + (cy - 12) + '" width="180" height="15" class="ucBar"/>' +
        '<rect x="740" y="' + (cy - 12) + '" width="' + Math.min(180, 180 * c.uc) + '" height="15" class="ucOk"/>' +
        '<text x="932" y="' + cy + '" class="small bold">UC ' + f2(c.uc) + '</text>';
      cy += 30;
    });

    /* eenvoudige doorsnede: bestaande muur met nieuwe opbouw erop */
    var mx = 830, mb = 190, mt = 300;
    out += '<text x="' + (mx + mb / 2) + '" y="' + (mt - 162) + '" text-anchor="middle" class="label bold">DOORSNEDE</text>';
    out += '<rect x="' + mx + '" y="' + (mt - 70) + '" width="' + mb + '" height="60" class="hsb"/>' +
      '<text x="' + (mx + mb / 2) + '" y="' + (mt - 36) + '" text-anchor="middle" class="tiny">nieuwe HSB-opbouw</text>';
    out += '<rect x="' + (mx + 30) + '" y="' + (mt - 10) + '" width="' + (mb - 60) + '" height="150" class="muur"/>' +
      '<text x="' + (mx + mb / 2) + '" y="' + (mt + 70) + '" text-anchor="middle" class="tiny">bestaande</text>' +
      '<text x="' + (mx + mb / 2) + '" y="' + (mt + 87) + '" text-anchor="middle" class="tiny">draaggevel</text>';
    out += '<line x1="' + (mx + mb / 2) + '" y1="' + (mt - 120) + '" x2="' + (mx + mb / 2) + '" y2="' + (mt - 78) + '" class="medium"/>' +
      '<text x="' + (mx + mb / 2) + '" y="' + (mt - 128) + '" text-anchor="middle" class="tiny">N_Ed = ' + f1(r.nEd) + ' kN/m</text>';

    out += voetnoot();
    return out + '</svg>';
  }

  function bladAdvies(r) {
    var project = 'D-01 · opbouw ' + f2(r.invoer.breedte) + ' × ' + f2(r.invoer.diepte) + ' m';
    var out = sheetStart() + kader(project, 'D-02', 'Advies en aannamen');
    var wrap = function (t, x, y, breed) {
      var woorden = t.split(' '), regel = '', rs = [];
      woorden.forEach(function (w) { if ((regel + ' ' + w).length > breed) { rs.push(regel); regel = w; } else regel = regel ? regel + ' ' + w : w; });
      rs.push(regel);
      var uit = '';
      rs.forEach(function (rr) { uit += '<text x="' + x + '" y="' + y + '" class="tiny">' + esc(rr) + '</text>'; y += 17; });
      return { svg: uit, y: y };
    };
    out += '<text x="55" y="70" class="title">WAT DIT BETEKENT</text>';
    var ay = 108;
    r.advies.forEach(function (t) {
      out += '<circle cx="61" cy="' + (ay - 4) + '" r="3.4" fill="#B38900"/>';
      var w = wrap(t, 77, ay, 78); out += w.svg; ay = w.y + 9;
    });
    out += '<text x="620" y="70" class="title">AANNAMEN</text>';
    var by = 108;
    r.aannamen.forEach(function (t) {
      out += '<circle cx="626" cy="' + (by - 4) + '" r="3.4" fill="#B38900"/>';
      var w = wrap(t, 642, by, 52); out += w.svg; by = w.y + 9;
    });
    out += voetnoot();
    return out + '</svg>';
  }

  function bladWeigering(r) {
    var out = sheetStart() + kader('D-01', 'D-00', 'Buiten bereik');
    out += '<text x="55" y="80" class="title">DEZE SITUATIE MOET NAAR DE CONSTRUCTEUR</text>';
    out += '<text x="55" y="118" class="small">De draagcheck rekent hier bewust niet verder. Redenen:</text>';
    var y = 158;
    r.redenen.forEach(function (t) {
      var woorden = t.split(' '), regel = '', rs = [];
      woorden.forEach(function (w) { if ((regel + ' ' + w).length > 88) { rs.push(regel); regel = w; } else regel = regel ? regel + ' ' + w : w; });
      rs.push(regel);
      out += '<circle cx="62" cy="' + (y - 5) + '" r="4" fill="#a32323"/>';
      rs.forEach(function (rr) { out += '<text x="82" y="' + y + '" class="small">' + esc(rr) + '</text>'; y += 22; });
      y += 10;
    });
    out += '<text x="55" y="' + (y + 24) + '" class="small bold">' + esc(r.advies) + '</text>';
    return out + '</svg>';
  }

  function rapportHtml(r) {
    var bladen = r.geweigerd ? [bladWeigering(r)] : [bladToets(r), bladAdvies(r)];
    var titel = r.geweigerd ? 'Draagcheck: naar de constructeur' : 'Draagcheck D-01: oplegdruk voldoet';
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>' + esc(titel) + '</title><style>body{margin:0;background:#333;font-family:Arial}header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center}header b{font-size:14px}header span{font-size:11px;color:#e8b04b}button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}.sheet{width:min(96vw,1120px);margin:22px auto;box-shadow:0 8px 28px #0008;background:#fff}.sheet svg{display:block;width:100%;height:auto}@media print{header{display:none}body{background:#fff}.sheet{width:100%;margin:0;box-shadow:none;page-break-after:always}.sheet:last-child{page-break-after:auto}}@page{size:A3 landscape;margin:0}</style></head><body><header><b>' + esc(titel) + '</b><span>TER CONTROLE CONSTRUCTEUR, geen berekening van de bestaande bouw</span><button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' + bladen.map(function (s) { return '<div class="sheet">' + s + '</div>'; }).join('') + '</body></html>';
  }

  function open(invoer) {
    var r = bereken(invoer || {});
    NGAfdruk.toon(rapportHtml(r), 'ng-draagcheck', 'Draagcheck dakopbouw');
  }

  /* ---------- het vragenpaneel ----------
     De maten en het dak komen uit de configurator; de vier dingen die alleen
     de bewoner weet, vraagt dit paneel. Zonder antwoord geen oordeel. */

  var CSS = [
    '.ngdc-achter{position:fixed;inset:0;z-index:900;background:rgba(10,10,12,.58);display:flex;align-items:center;justify-content:center;padding:1rem}',
    '.ngdc{background:#fff;color:#1a1a1a;border-radius:14px;max-width:600px;width:100%;max-height:92vh;overflow:auto;box-shadow:0 18px 60px rgba(0,0,0,.35);font-family:inherit;padding:1.4rem 1.5rem}',
    '.ngdc h3{margin:0 0 .3rem;font-size:1.2rem;color:#1a1a1a}',
    '.ngdc>p{margin:0 0 1.1rem;color:#6b6b66;font-size:.87rem;line-height:1.5}',
    '.ngdc-veld{margin:0 0 1rem}',
    '.ngdc-veld>span{display:block;font-size:.9rem;font-weight:600;margin-bottom:.45rem;color:#1a1a1a}',
    '.ngdc-keuzes{display:flex;flex-wrap:wrap;gap:.5rem}',
    '.ngdc-keuzes label{display:inline-flex;align-items:center;gap:.45rem;padding:.5rem .85rem;border:1px solid rgba(0,0,0,.18);border-radius:9px;font-size:.88rem;cursor:pointer;color:#1a1a1a}',
    '.ngdc-keuzes label:has(input:checked){border-color:#FFC400;background:rgba(255,196,0,.12)}',
    '.ngdc-acties{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.2rem}',
    '.ngdc-btn{background:#FFC400;border:0;border-radius:9px;padding:.7rem 1.15rem;font:inherit;font-weight:700;cursor:pointer}',
    '.ngdc-ghost{background:none;border:1px solid rgba(0,0,0,.22);border-radius:9px;padding:.7rem 1.15rem;font:inherit;cursor:pointer;color:#1a1a1a}',
    '.ngdc-voet{margin:1.1rem 0 0;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.09);font-size:.78rem;color:#6b6b66;line-height:1.5}'
  ].join('');

  function radio(naam, opties) {
    return '<div class="ngdc-keuzes">' + opties.map(function (o, i) {
      return '<label><input type="radio" name="ngdc-' + naam + '" value="' + o[0] + '"' + (i === 0 ? ' checked' : '') + '> ' + esc(o[1]) + '</label>';
    }).join('') + '</div>';
  }

  function paneel() {
    if (!document.getElementById('ngdc-css')) {
      var st = document.createElement('style'); st.id = 'ngdc-css'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    var achter = document.createElement('div');
    achter.className = 'ngdc-achter'; achter.id = 'ngdc-achter';
    achter.innerHTML = '<div class="ngdc" role="dialog" aria-label="Draagcheck D-01">' +
      '<h3>Draagcheck D-01</h3>' +
      '<p>De maten en het dak komen uit jouw samenstelling. Vier dingen weet alleen jij. Daarna rekent de check direct, in je eigen browser.</p>' +
      '<div class="ngdc-veld"><span>Waar zijn de dragende muren van gemaakt?</span>' + radio('muur', [['spouw', 'Spouwmuur (na ± 1930)'], ['steens', 'Steens metselwerk (ouder)'], ['onbekend', 'Weet ik niet']]) + '</div>' +
      '<div class="ngdc-veld"><span>Wat voor verdiepingsvloer ligt er nu bovenin?</span>' + radio('vloer', [['hout', 'Houten balklaag'], ['beton', 'Beton']]) + '</div>' +
      '<div class="ngdc-veld"><span>Hoeveel bouwlagen heeft de woning nu?</span>' + radio('lagen', [['1', '1 (begane grond)'], ['2', '2'], ['3', '3 of meer']]) + '</div>' +
      '<div class="ngdc-veld"><span>Zie je scheuren in het metselwerk?</span>' + radio('scheuren', [['nee', 'Nee'], ['ja', 'Ja']]) + '</div>' +
      '<div class="ngdc-acties">' +
      '<button type="button" class="ngdc-btn" id="ngdc-doen">Voer de draagcheck uit</button>' +
      '<button type="button" class="ngdc-ghost" id="ngdc-weg">Annuleren</button></div>' +
      '<p class="ngdc-voet">De uitkomst is voorwerk voor de constructeur, geen constructieberekening van je woning. Bij twijfel weigert de check en verwijzen we door. Dat is de bedoeling.</p>' +
      '</div>';
    document.body.appendChild(achter);
    var weg = function () { achter.parentNode.removeChild(achter); };
    achter.addEventListener('click', function (e) { if (e.target === achter) weg(); });
    document.getElementById('ngdc-weg').addEventListener('click', weg);
    document.getElementById('ngdc-doen').addEventListener('click', function () {
      var kies = function (n) { var el = document.querySelector('input[name="ngdc-' + n + '"]:checked'); return el ? el.value : ''; };
      var sel = typeof global.NGKeuze === 'function' ? (global.NGKeuze() || {}) : {};
      /* Antwoorden eerst uitlezen, dan pas het paneel sluiten: na weg()
         bestaan de invoervelden niet meer. */
      var antwoorden = { muurtype: kies('muur'), vloertype: kies('vloer'),
                         bouwlagen: parseInt(kies('lagen'), 10), scheuren: kies('scheuren') === 'ja' };
      weg();
      open({
        breedte: sel.w, diepte: sel.dp, hoogte: sel.h,
        gevel: sel.material, groenDak: sel.roofing === 'green',
        bestaandDak: sel.bestaandDak,
        muurtype: antwoorden.muurtype, vloertype: antwoorden.vloertype,
        bouwlagen: antwoorden.bouwlagen, scheuren: antwoorden.scheuren,
      });
    });
  }

  /** Knop in de prijsbalk, naast de technische tekeningen. */
  function init() {
    var haak = function () {
      var anker = document.getElementById('tekeningenBtn') || document.getElementById('naarOfferte');
      if (!anker || document.getElementById('draagcheckBtn')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn--ghost'; b.id = 'draagcheckBtn';
      b.textContent = 'Draagcheck D-01';
      b.title = 'Kan jouw woning de dakopbouw dragen? Eerste toets, ter controle door de constructeur';
      b.addEventListener('click', paneel);
      anker.parentNode.insertBefore(b, anker.nextSibling);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', haak); else haak();
  }

  global.NGDraagcheck = { bereken: bereken, rapportHtml: rapportHtml, open: open, init: init, GRENZEN: GRENZEN };
})(typeof window !== 'undefined' ? window : globalThis);
