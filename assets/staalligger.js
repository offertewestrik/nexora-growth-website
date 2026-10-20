/* Voordimensionering van de stalen ligger boven een doorbraak.
 *
 * Dit is nadrukkelijk GEEN constructieberekening. Het is het voorwerk dat een
 * constructeur anders zelf als eerste doet: belastingen opbouwen volgens de
 * Eurocode, een profiel kiezen uit de tabel, en de vier controles langslopen.
 * Het rapport draagt daarom de stempel TER CONTROLE CONSTRUCTEUR — de
 * gewaarmerkte berekening komt van een constructeur, dit dossier maakt dat
 * hij daar een uur over doet in plaats van dagen.
 *
 * Even belangrijk als wat de module rekent, is wat hij weigert. Boven de
 * grenzen hieronder (overspanning, belastingbreedte, wat erboven staat) geeft
 * hij geen profiel maar een weigering met redenen. Een voordimensionering die
 * altijd een antwoord geeft, is gevaarlijker dan geen voordimensionering.
 *
 * Rekenbasis, bewust eenvoudig gehouden en op het blad benoemd:
 *   - ligger op twee steunpunten, gelijkmatig verdeelde belasting
 *   - NEN-EN 1990/1991/1993 met Nederlandse bijlage, gevolgklasse CC2:
 *     qEd = max(1,35·Gk ; 1,2·Gk + 1,5·Qk)
 *   - buiging op W_el (elastisch — aan de veilige kant), S235 of S355
 *   - dwarskracht op A_vz, met de eis V_Ed <= 0,5·V_Rd zodat de
 *     moment-dwarskracht-interactie geen rol speelt
 *   - doorbuiging: bijkomend <= l/500 (metselwerk boven de opening is
 *     scheurgevoelig), totaal <= l/250
 *   - kip: aangenomen dat de bovenflens zijdelings gesteund is door de
 *     vloer of het dak — staat als aanname op het blad
 *   - oplegdruk op metselwerk <= 0,6 N/mm², opleglengte minimaal 150 mm
 */
(function (global) {
  'use strict';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>\"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[c]; }); };
  var f1 = function (x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); };
  var f2 = function (x) { return (Math.round(x * 100) / 100).toString().replace('.', ','); };

  /* ---------- profieltabellen ----------
     Gangbare walsprofielen; W_el,y in cm3, I_y in cm4, A_vz in cm2, G in
     kg/m, h in mm. Openbare tabelwaarden. */
  var PROFIELEN = [
    ['IPE 100', 100, 34.2, 171, 5.08, 8.1], ['IPE 120', 120, 53.0, 318, 6.31, 10.4],
    ['IPE 140', 140, 77.3, 541, 7.64, 12.9], ['IPE 160', 160, 109, 869, 9.66, 15.8],
    ['IPE 180', 180, 146, 1317, 11.3, 18.8], ['IPE 200', 200, 194, 1943, 14.0, 22.4],
    ['IPE 220', 220, 252, 2772, 15.9, 26.2], ['IPE 240', 240, 324, 3892, 19.1, 30.7],
    ['IPE 270', 270, 429, 5790, 22.1, 36.1], ['IPE 300', 300, 557, 8356, 25.7, 42.2],
    ['IPE 330', 330, 713, 11770, 30.8, 49.1], ['IPE 360', 360, 904, 16270, 35.1, 57.1],
    ['HEA 100', 96, 72.8, 349, 7.56, 16.7], ['HEA 120', 114, 106, 606, 8.46, 19.9],
    ['HEA 140', 133, 155, 1033, 10.1, 24.7], ['HEA 160', 152, 220, 1673, 13.2, 30.4],
    ['HEA 180', 171, 294, 2510, 14.5, 35.5], ['HEA 200', 190, 389, 3692, 18.1, 42.3],
    ['HEA 220', 210, 515, 5410, 20.7, 50.5], ['HEA 240', 230, 675, 7763, 25.2, 60.3],
    ['HEB 100', 100, 89.9, 450, 9.04, 20.4], ['HEB 120', 120, 144, 864, 11.0, 26.7],
    ['HEB 140', 140, 216, 1509, 13.1, 33.7], ['HEB 160', 160, 311, 2492, 17.6, 42.6],
    ['HEB 180', 180, 426, 3831, 20.2, 51.2], ['HEB 200', 200, 570, 5696, 24.8, 61.3],
    ['HEB 220', 220, 736, 8091, 27.9, 71.5], ['HEB 240', 240, 938, 11260, 33.2, 83.2],
  ].map(function (r) { return { naam: r[0], h: r[1], Wel: r[2], Iy: r[3], Avz: r[4], G: r[5] }; });

  /* ---------- kolomprofielen voor het pendelportaal ----------
     Vierkante kokers, S235. De doorsnede-eigenschappen worden uit de
     geometrie berekend met scherpe hoeken en daarna 5% gereduceerd — dat
     ligt aan de veilige kant van de tabelwaarden voor koudgevormde kokers
     met hoekafrondingen. Alleen doorsneden die in klasse 3 passen
     ((a−2t)/t ≤ 42) doen mee, zodat de drukcapaciteit op de volle
     doorsnede gerekend mag worden. */
  var KOKERS = (function () {
    var uit = [];
    [[80,4],[80,5],[90,5],[100,5],[100,6.3],[120,6.3],[140,6.3],[150,8],[160,8]].forEach(function (m) {
      var a = m[0], t = m[1], b = a - 2 * t;
      if (b / t > 42) return;                       // klasse-3-grens, S235
      var A = 0.95 * (a * a - b * b);               // mm2
      var I = 0.95 * (Math.pow(a, 4) - Math.pow(b, 4)) / 12; // mm4
      uit.push({ naam: 'Koker ' + a + ' × ' + a + ' × ' + t, a: a, t: t,
                 A: A, I: I, i: Math.sqrt(I / A), G: A * 7850 / 1e6 });
    });
    return uit;
  })();

  /** Kniktoets pendelkolom volgens NEN-EN 1993-1-1 §6.3.1, kniklijn c
      (koudgevormde koker, alfa 0,49), kniklengte = kolomhoogte (scharnier
      boven en onder). Geeft het lichtste profiel dat voldoet. */
  function kolomToets(NEd, hoogteM) {
    var L = hoogteM * 1000, fy = STAAL.S235, alfa = 0.49;
    var lambda1 = 93.9;                             // epsilon = 1 voor S235
    for (var i = 0; i < KOKERS.length; i++) {
      var k = KOKERS[i];
      var NkolomEd = NEd + 1.35 * k.G * 9.81 / 1000 * hoogteM; // + eigen gewicht
      var lamRel = (L / k.i) / lambda1;
      var fi = 0.5 * (1 + alfa * (lamRel - 0.2) + lamRel * lamRel);
      var chi = Math.min(1, 1 / (fi + Math.sqrt(Math.max(0, fi * fi - lamRel * lamRel))));
      var NbRd = chi * k.A * fy / 1e3;              // kN, gammaM1 = 1,0
      var uc = NkolomEd / NbRd;
      if (uc <= 1.0) {
        return { profiel: k, NEd: NkolomEd, lamRel: lamRel, chi: chi, NbRd: NbRd, uc: uc,
                 hoogte: hoogteM, voetlast: NkolomEd };
      }
    }
    return null;
  }

  /* ---------- belastingopbouw (kN/m2, tenzij anders vermeld) ---------- */
  var VLOER = { hout: { g: 1.0, naam: 'houten vloer incl. plafond en afwerking' },
                beton: { g: 4.0, naam: 'betonvloer incl. afwerkvloer' } };
  var DAK = { g: 0.85, q: 1.0, naam: 'plat houten dak incl. isolatie en bitumen' };
  var WOONFUNCTIE = 1.75;          // veranderlijke vloerbelasting, woonfunctie
  var MUUR_SG = 19;                // metselwerk, kN/m3
  var STAAL = { S235: 235, S355: 355 };
  var E_STAAL = 210000;            // N/mm2
  var OPLEGDRUK_TOEL = 0.6;        // N/mm2, conservatief voor metselwerk

  /* ---------- de harde grenzen ----------
     Hierboven rekent de module niet verder. De grens is het product. */
  var GRENZEN = {
    overspanningMax: 5.0,          // m
    belastingbreedteMax: 5.0,      // m
    muurHoogteMax: 3.5,            // m metselwerk boven de opening
  };

  /**
   * @param invoer {overspanning, belastingbreedte, watErboven:
   *   'dak'|'verdieping'|'verdieping-plus-dak', vloertype: 'hout'|'beton',
   *   muurdikte (m), muurHoogteBoven (m), staal: 'S235'|'S355'}
   */
  function bereken(invoer) {
    var inv = {
      overspanning: Number(invoer.overspanning) || 0,
      belastingbreedte: Number(invoer.belastingbreedte) || 0,
      watErboven: invoer.watErboven || 'verdieping-plus-dak',
      vloertype: invoer.vloertype === 'beton' ? 'beton' : 'hout',
      muurdikte: Number(invoer.muurdikte) || 0.21,
      muurHoogteBoven: invoer.muurHoogteBoven == null ? 2.4 : Number(invoer.muurHoogteBoven),
      staal: STAAL[invoer.staal] ? invoer.staal : 'S235',
      /* Oplegging: op het metselwerk (standaard) of op twee pendelkolommen
         wanneer de hele breedte opengaat en er geen muurdam overblijft. */
      oplegging: invoer.oplegging === 'portaal' ? 'portaal' : 'muur',
      kolomHoogte: invoer.kolomHoogte == null ? 2.6 : Number(invoer.kolomHoogte),
      stabiliteitElders: invoer.stabiliteitElders !== false,
      /* Herkomst per veld ('tekening' | 'bevestigd' | 'aanname'), gezet door
         de bouwtekening-module. Zonder die module is alles impliciet aanname. */
      herkomst: invoer.herkomst || null,
    };
    var l = inv.overspanning, bB = inv.belastingbreedte;

    /* -- weigeren wat niet in een voordimensionering thuishoort -- */
    var redenen = [];
    if (!(l > 0.5)) redenen.push('Overspanning ontbreekt of is kleiner dan 0,5 m.');
    if (l > GRENZEN.overspanningMax) redenen.push('Overspanning groter dan ' + f1(GRENZEN.overspanningMax) + ' m, buiten het bereik van deze voordimensionering.');
    if (bB > GRENZEN.belastingbreedteMax) redenen.push('Belastingbreedte groter dan ' + f1(GRENZEN.belastingbreedteMax) + ' m.');
    if (inv.muurHoogteBoven > GRENZEN.muurHoogteMax) redenen.push('Meer dan ' + f1(GRENZEN.muurHoogteMax) + ' m metselwerk boven de opening.');
    if (invoer.puntlast) redenen.push('Puntlasten (kolom of ligger die hierop afdraagt) vallen buiten deze voordimensionering.');
    if (inv.oplegging === 'portaal') {
      if (!inv.stabiliteitElders) redenen.push('Het portaal zou zelf de stabiliteit van de gevel moeten leveren (momentvast portaal). Dat vraagt een raamwerkberekening en een stabiliteitsbeoordeling van de hele woning. Dat is constructeurswerk, geen voordimensionering.');
      if (inv.kolomHoogte > 3.5) redenen.push('Kolommen langer dan 3,5 m vallen buiten het bereik van deze voordimensionering.');
      if (!(inv.kolomHoogte > 2.0)) redenen.push('Kolomhoogte ontbreekt of is kleiner dan 2,0 m.');
    }
    if (invoer.verdiepingen > 1) redenen.push('Meer dan één verdieping boven de opening.');
    if (redenen.length) {
      return { geweigerd: true, redenen: redenen, invoer: inv,
               advies: 'Dit geval moet rechtstreeks naar de constructeur. De configurator stuurt de aanvraag met deze gegevens door.' };
    }

    /* -- belastingopbouw, regel voor regel zodat het rapport ze kan tonen -- */
    var regels = [];
    var gk = 0, qk = 0;
    if (inv.watErboven === 'verdieping' || inv.watErboven === 'verdieping-plus-dak') {
      var vl = VLOER[inv.vloertype];
      regels.push({ soort: 'G', naam: vl.naam, basis: f2(vl.g) + ' kN/m² × ' + f2(bB) + ' m', kNm: vl.g * bB });
      gk += vl.g * bB;
      regels.push({ soort: 'Q', naam: 'veranderlijk, woonfunctie', basis: f2(WOONFUNCTIE) + ' kN/m² × ' + f2(bB) + ' m', kNm: WOONFUNCTIE * bB });
      qk += WOONFUNCTIE * bB;
    }
    if (inv.watErboven === 'dak' || inv.watErboven === 'verdieping-plus-dak') {
      regels.push({ soort: 'G', naam: DAK.naam, basis: f2(DAK.g) + ' kN/m² × ' + f2(bB) + ' m', kNm: DAK.g * bB });
      gk += DAK.g * bB;
      regels.push({ soort: 'Q', naam: 'dak: onderhoud/sneeuw', basis: f2(DAK.q) + ' kN/m² × ' + f2(bB) + ' m', kNm: DAK.q * bB });
      qk += DAK.q * bB;
    }
    if (inv.muurHoogteBoven > 0) {
      var muur = inv.muurdikte * inv.muurHoogteBoven * MUUR_SG;
      regels.push({ soort: 'G', naam: 'metselwerk boven de opening', basis: f2(inv.muurdikte) + ' m × ' + f2(inv.muurHoogteBoven) + ' m × ' + MUUR_SG + ' kN/m³', kNm: muur });
      gk += muur;
    }

    var fy = STAAL[inv.staal];

    /* -- profiel zoeken: het lichtste dat alle vier de controles haalt -- */
    var gekozen = null, alternatieven = [], controlesGekozen = null;
    for (var i = 0; i < PROFIELEN.length && alternatieven.length < 3; i++) {
      var p = PROFIELEN[i];
      var gkP = gk + p.G * 9.81 / 1000;                      // eigengewicht ligger
      var qEd = Math.max(1.35 * gkP, 1.2 * gkP + 1.5 * qk);  // NL, CC2
      var MEd = qEd * l * l / 8;                             // kNm
      var VEd = qEd * l / 2;                                 // kN

      var MRd = p.Wel * 1e3 * fy / 1e6;                      // kNm
      var VRd = p.Avz * 1e2 * (fy / Math.sqrt(3)) / 1e3;     // kN

      var Iy = p.Iy * 1e4;                                   // mm4
      var lmm = l * 1000;
      /* q in kN/m is numeriek gelijk aan N/mm, dus dit levert direct mm. */
      var doorb = function (q) { return 5 * q * Math.pow(lmm, 4) / (384 * E_STAAL * Iy); };
      var wBij = doorb(qk);                                  // alleen veranderlijk
      var wTot = doorb(gkP + qk);

      var controles = [
        { naam: 'Buiging', eis: 'M_Ed ≤ M_Rd', waarde: f1(MEd) + ' kNm', grens: f1(MRd) + ' kNm', uc: MEd / MRd },
        { naam: 'Dwarskracht', eis: 'V_Ed ≤ 0,5·V_Rd', waarde: f1(VEd) + ' kN', grens: f1(0.5 * VRd) + ' kN', uc: VEd / (0.5 * VRd) },
        { naam: 'Doorbuiging bijkomend', eis: 'w ≤ l/500', waarde: f1(wBij) + ' mm', grens: f1(lmm / 500) + ' mm', uc: wBij / (lmm / 500) },
        { naam: 'Doorbuiging totaal', eis: 'w ≤ l/250', waarde: f1(wTot) + ' mm', grens: f1(lmm / 250) + ' mm', uc: wTot / (lmm / 250) },
      ];
      var ok = controles.every(function (c) { return c.uc <= 1.0; });
      if (!ok) continue;
      if (!gekozen) {
        gekozen = p; controlesGekozen = controles;
        var R = VEd;                                          // oplegreactie
        var oplegLengte = Math.max(150, Math.ceil(R * 1e3 / (OPLEGDRUK_TOEL * inv.muurdikte * 1000) / 10) * 10);
        var oplegdruk = R * 1e3 / (oplegLengte * inv.muurdikte * 1000);
        /* Portaal: de reactie landt niet op metselwerk maar op twee
           pendelkolommen; die krijgen hun eigen kniktoets en blad. */
        var portaal = null;
        if (inv.oplegging === 'portaal') {
          portaal = kolomToets(R, inv.kolomHoogte);
          if (!portaal) {
            return { geweigerd: true, invoer: inv,
                     redenen: ['Geen kokerprofiel uit de tabel voldoet voor de kolommen: de last of kolomhoogte is te groot voor deze voordimensionering.'],
                     advies: 'Dit geval moet rechtstreeks naar de constructeur.' };
          }
        }
        var res = {
          geweigerd: false, invoer: inv, regels: regels,
          gk: gkP, qk: qk, qEd: qEd,
          combinatie: (1.35 * gkP >= 1.2 * gkP + 1.5 * qk) ? '1,35·Gk' : '1,2·Gk + 1,5·Qk',
          MEd: MEd, VEd: VEd, R: R,
          profiel: p, fy: fy, controles: controles,
          oplegging: inv.oplegging === 'portaal'
            ? { lengte: 0, druk: 0, plaat: 'ligger op twee pendelkolommen, zie blad S-03' }
            : { lengte: oplegLengte, druk: oplegdruk,
                plaat: R > 40 ? 'stalen verdeelplaat ' + Math.max(200, oplegLengte) + ' × ' + Math.round(inv.muurdikte * 1000) + ' × 15 mm' : 'opleg op vlak, gaaf metselwerk' },
          portaal: portaal,
          aannamen: [
            'Ligger op twee steunpunten, gelijkmatig verdeelde belasting; geen puntlasten.',
            'Bovenflens zijdelings gesteund door vloer of dak (kip niet maatgevend). Los liggend: kipcontrole door de constructeur.',
            'Belastingcombinatie NEN-EN 1990 NB, gevolgklasse CC2: maatgevend ' + ((1.35 * gk >= 1.2 * gk + 1.5 * qk) ? '6.10a' : '6.10b') + '.',
            'Buigcontrole elastisch (W_el), aan de veilige kant ten opzichte van plastisch.',
            'Bijkomende doorbuiging begrensd op l/500 vanwege scheurgevoelig metselwerk boven de opening.',
            'Bestaand metselwerk en fundering ter plaatse te beoordelen; oplegdruk gerekend op ' + f2(OPLEGDRUK_TOEL) + ' N/mm².',
            'Stalen ligger brandwerend bekleden volgens Bbl waar vereist.',
          ].concat(inv.oplegging === 'portaal' ? [
            'Pendelportaal: kolommen scharnierend boven en onder, kniklengte gelijk aan de kolomhoogte. De stabiliteit van de gevel komt uit de omringende bouwmuren, niet uit het portaal.',
            'Kop- en voetplaten, bouten en de verankering van de kolomvoet dimensioneert de constructeur; de voetlast per kolom staat op blad S-03.',
            'De fundering onder elke kolom (poer of bestaande strook) beoordeelt de constructeur op de opgegeven voetlast.',
          ] : []).concat(inv.herkomst && Object.keys(inv.herkomst).some(function (k) { return inv.herkomst[k] === 'tekening'; })
            ? ['Invoer deels afgelezen uit de aangeleverde bouwtekening en door de aanvrager bevestigd; de constructeur verifieert tegen de originele tekening.']
            : []),
        };
        res.alternatieven = alternatieven; gekozen = res;
      } else {
        alternatieven.push(p.naam);
      }
    }
    if (!gekozen) {
      return { geweigerd: true, redenen: ['Geen profiel uit de tabel voldoet: de belasting of overspanning is te groot voor deze voordimensionering.'], invoer: inv,
               advies: 'Dit geval moet rechtstreeks naar de constructeur.' };
    }
    return gekozen;
  }

  /* ---------- het rapport: twee A3-bladen in de stijl van de pakketten ---------- */

  function kader(project, blad, titel) {
    return '<rect x="20" y="20" width="1080" height="730" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<line x1="20" y1="680" x2="1100" y2="680" stroke="#111"/>' +
      '<line x1="650" y1="680" x2="650" y2="750" stroke="#111"/>' +
      '<line x1="850" y1="680" x2="850" y2="750" stroke="#111"/>' +
      '<text x="38" y="704" class="brand">NEXT GROWTH · VOORDIMENSIONERING STAAL</text>' +
      '<text x="38" y="728" class="tiny">' + esc(project) + ' · ' + esc(titel) + '</text>' +
      '<text x="665" y="702" class="micro">BLAD</text><text x="665" y="727" class="small bold">' + esc(blad) + '</text>' +
      '<text x="865" y="702" class="micro">STATUS</text><text x="865" y="727" class="stampG">TER CONTROLE CONSTRUCTEUR</text>';
  }
  function styles() {
    return '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.micro{font-size:9px;letter-spacing:.45px}.tiny{font-size:11px}.small{font-size:14px}.label{font-size:16px}.title{font-size:25px;font-weight:700}.brand{font-size:15px;font-weight:800}.bold{font-weight:700}.stampG{font-size:12px;font-weight:800;fill:#a32323}.bron{font-size:9px;letter-spacing:.4px;fill:#666}.note{font-size:12px;fill:#333}.dimtxt{font-size:13px;fill:#333}.thin{stroke:#555;stroke-width:.9;fill:none}.medium{stroke:#222;stroke-width:2.2;fill:none}.heavy{stroke:#111;stroke-width:6;fill:none}.dim{stroke:#555;stroke-width:1;fill:none;marker-start:url(#sarr);marker-end:url(#sarr)}.balkje{fill:#e8e4da;stroke:#333}.ucOk{fill:#3f7d47}.ucBar{fill:#eee;stroke:#999;stroke-width:.6}</style>';
  }
  function sheetStart() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 770" role="img"><defs><marker id="sarr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M8,4 L0,0 L0,8 z" fill="#555"/></marker></defs>' + styles() + '<rect width="1120" height="770" fill="#fff"/>';
  }

  function bladRapport(r) {
    var project = 'DB-01 · overspanning ' + f2(r.invoer.overspanning) + ' m';
    var out = sheetStart() + kader(project, 'S-01', 'Berekeningsrapport');
    out += '<text x="55" y="70" class="title">VOORDIMENSIONERING STALEN LIGGER · DB-01</text>';
    out += '<text x="55" y="100" class="label bold">Gekozen profiel: ' + esc(r.profiel.naam) + ' · ' + esc(r.invoer.staal) + '</text>';

    out += '<text x="55" y="140" class="label bold">BELASTINGOPBOUW</text>';
    var y = 168;
    r.regels.forEach(function (rg) {
      out += '<text x="55" y="' + y + '" class="small bold">' + rg.soort + '</text>' +
        '<text x="85" y="' + y + '" class="small">' + esc(rg.naam) + '</text>' +
        '<text x="470" y="' + y + '" class="tiny">' + esc(rg.basis) + '</text>' +
        '<text x="705" y="' + y + '" text-anchor="end" class="small bold">' + f2(rg.kNm) + ' kN/m</text>';
      y += 26;
    });
    out += '<text x="85" y="' + y + '" class="small">eigengewicht ligger</text><text x="705" y="' + y + '" text-anchor="end" class="small bold">' + f2(r.profiel.G * 9.81 / 1000) + ' kN/m</text>';
    y += 34;
    out += '<line x1="55" y1="' + (y - 22) + '" x2="705" y2="' + (y - 22) + '" class="thin"/>';
    out += '<text x="55" y="' + y + '" class="small bold">Gk = ' + f2(r.gk) + ' kN/m · Qk = ' + f2(r.qk) + ' kN/m → q_Ed = ' + f2(r.qEd) + ' kN/m (' + esc(r.combinatie) + ')</text>';
    y += 26;
    out += '<text x="55" y="' + y + '" class="small">M_Ed = q·l²/8 = ' + f1(r.MEd) + ' kNm · V_Ed = q·l/2 = ' + f1(r.VEd) + ' kN</text>';

    out += '<text x="55" y="' + (y + 44) + '" class="label bold">CONTROLES</text>';
    var cy = y + 72;
    r.controles.forEach(function (c) {
      out += '<text x="55" y="' + cy + '" class="small">' + esc(c.naam) + '</text>' +
        '<text x="255" y="' + cy + '" class="tiny">' + esc(c.eis) + '</text>' +
        '<text x="420" y="' + cy + '" class="small">' + esc(c.waarde) + ' / ' + esc(c.grens) + '</text>' +
        '<rect x="640" y="' + (cy - 12) + '" width="180" height="15" class="ucBar"/>' +
        '<rect x="640" y="' + (cy - 12) + '" width="' + Math.min(180, 180 * c.uc) + '" height="15" class="ucOk"/>' +
        '<text x="832" y="' + cy + '" class="small bold">UC ' + f2(c.uc) + '</text>';
      cy += 30;
    });
    if (r.alternatieven && r.alternatieven.length) {
      out += '<text x="55" y="' + (cy + 16) + '" class="tiny">Ook passend: ' + esc(r.alternatieven.join(' · ')) + '</text>';
    }

    out += '<text x="880" y="140" class="label bold">OPLEGGING</text>' +
      '<text x="880" y="168" class="small">Reactie R = ' + f1(r.R) + ' kN</text>';
    if (r.portaal) {
      out += '<text x="880" y="192" class="small">Op pendelkolommen:</text>' +
        '<text x="880" y="216" class="small bold">' + esc(r.portaal.profiel.naam) + '</text>' +
        '<text x="880" y="240" class="tiny">kniktoets op blad S-03</text>';
    } else {
      out += '<text x="880" y="192" class="small">Opleglengte ≥ ' + r.oplegging.lengte + ' mm</text>' +
        '<text x="880" y="216" class="small">Druk ' + f2(r.oplegging.druk) + ' N/mm²</text>' +
        '<text x="880" y="240" class="tiny">' + esc(r.oplegging.plaat) + '</text>';
    }

    /* Met een bouwtekening erbij krijgt elk invoergetal zijn bron op het
       blad: de constructeur ziet in één oogopslag wat afgelezen is en wat
       aanname bleef. Zonder herkomst (de standaardknop) blijft het blad
       zoals het was. */
    if (r.invoer.herkomst) {
      var BRON = { tekening: 'uit bouwtekening, bevestigd', bevestigd: 'door aanvrager ingevuld', aanname: 'aanname' };
      var WATERB = { dak: 'alleen dak', verdieping: 'verdieping', 'verdieping-plus-dak': 'verdieping + dak' };
      var invoerRijen = [
        ['Overspanning', f2(r.invoer.overspanning) + ' m', 'overspanning'],
        ['Belastingbreedte', f2(r.invoer.belastingbreedte) + ' m', 'belastingbreedte'],
        ['Erboven', WATERB[r.invoer.watErboven] || r.invoer.watErboven, 'watErboven'],
        ['Vloertype', r.invoer.vloertype, 'vloertype'],
        ['Muurdikte', f2(r.invoer.muurdikte) + ' m', 'muurdikte'],
        ['Metselwerk boven', f2(r.invoer.muurHoogteBoven) + ' m', 'muurHoogteBoven'],
      ];
      /* In de rechterkolom onder OPLEGGING, vanaf x=940: de UC-teksten van de
         controles eindigen rond x=905, dus hier blijft het vrij. */
      out += '<text x="940" y="292" class="label bold">INVOER · BRON</text>';
      var by = 318;
      invoerRijen.forEach(function (rij) {
        out += '<text x="940" y="' + by + '" class="tiny">' + esc(rij[0]) + '</text>' +
          '<text x="1090" y="' + by + '" text-anchor="end" class="tiny bold">' + esc(rij[1]) + '</text>' +
          '<text x="940" y="' + (by + 15) + '" class="bron">' + esc(BRON[r.invoer.herkomst[rij[2]]] || 'aanname') + '</text>';
        by += 40;
      });
    }

    out += '<text x="55" y="618" class="note bold">Dit is een voordimensionering, geen gewaarmerkte constructieberekening. Controle en waarmerking door een constructeur is vereist voor vergunning en uitvoering.</text>';
    return out + '</svg>';
  }

  function bladSchema(r) {
    var project = 'DB-01 · overspanning ' + f2(r.invoer.overspanning) + ' m';
    var out = sheetStart() + kader(project, 'S-02', 'Belastingschema en aannamen');
    out += '<text x="55" y="70" class="title">BELASTINGSCHEMA</text>';
    var x = 160, bw = 560, yB = 300;
    // verdeelde belasting
    out += '<line x1="' + x + '" y1="' + (yB - 90) + '" x2="' + (x + bw) + '" y2="' + (yB - 90) + '" class="medium"/>';
    for (var px = x; px <= x + bw; px += 40) out += '<line x1="' + px + '" y1="' + (yB - 90) + '" x2="' + px + '" y2="' + (yB - 14) + '" class="thin" marker-end="url(#sarr)"/>';
    out += '<text x="' + (x + bw / 2) + '" y="' + (yB - 104) + '" text-anchor="middle" class="dimtxt">q_Ed = ' + f2(r.qEd) + ' kN/m</text>';
    // de ligger met opleggingen
    out += '<rect x="' + x + '" y="' + (yB - 12) + '" width="' + bw + '" height="24" class="balkje"/>';
    out += '<path d="M' + x + ' ' + (yB + 12) + ' l-16 30 h32 z" class="medium"/><path d="M' + (x + bw) + ' ' + (yB + 12) + ' l-16 30 h32 z" class="medium"/>';
    out += '<line x1="' + x + '" y1="' + (yB + 70) + '" x2="' + (x + bw) + '" y2="' + (yB + 70) + '" class="dim"/>' +
      '<text x="' + (x + bw / 2) + '" y="' + (yB + 62) + '" text-anchor="middle" class="dimtxt">' + Math.round(r.invoer.overspanning * 1000) + ' mm</text>';
    out += '<text x="' + (x + bw / 2) + '" y="' + (yB + 4) + '" text-anchor="middle" class="small bold">' + esc(r.profiel.naam) + '</text>';
    out += '<text x="' + (x - 24) + '" y="' + (yB + 108) + '" class="tiny">R = ' + f1(r.R) + ' kN</text>' +
      '<text x="' + (x + bw - 60) + '" y="' + (yB + 108) + '" class="tiny">R = ' + f1(r.R) + ' kN</text>';

    out += '<text x="820" y="70" class="title">AANNAMEN</text>';
    var ay = 108;
    r.aannamen.forEach(function (t) {
      // regels afbreken zodat ze in de kolom passen
      var woorden = t.split(' '), regel = '', rs = [];
      woorden.forEach(function (w) { if ((regel + ' ' + w).length > 42) { rs.push(regel); regel = w; } else regel = regel ? regel + ' ' + w : w; });
      rs.push(regel);
      out += '<circle cx="826" cy="' + (ay - 4) + '" r="3.4" fill="#B38900"/>';
      rs.forEach(function (rr) { out += '<text x="842" y="' + ay + '" class="tiny">' + esc(rr) + '</text>'; ay += 17; });
      ay += 9;
    });
    out += '<text x="55" y="618" class="note bold">Dit is een voordimensionering, geen gewaarmerkte constructieberekening. Controle en waarmerking door een constructeur is vereist voor vergunning en uitvoering.</text>';
    return out + '</svg>';
  }

  /** Blad S-03: het pendelportaal. Links het schema — twee kolommen met
      scharnieren boven en onder, de ligger erbovenop — rechts de kniktoets
      volgens NEN-EN 1993-1-1 §6.3.1 en de voetlast voor de fundering. */
  function bladKolommen(r) {
    var project = 'DB-01 · overspanning ' + f2(r.invoer.overspanning) + ' m';
    var pt = r.portaal, k = pt.profiel;
    var out = sheetStart() + kader(project, 'S-03', 'Kolommen (pendel)');
    out += '<text x="55" y="70" class="title">PENDELKOLOMMEN ONDER DE LIGGER</text>';
    out += '<text x="55" y="100" class="label bold">Gekozen kolomprofiel: ' + esc(k.naam) + ' · S235</text>';

    /* -- schema: ligger op twee kolommen, scharnieren als open cirkels -- */
    var xL = 170, xR = 480, yTop = 200, yVoet = 480;
    out += '<rect x="' + (xL - 40) + '" y="' + (yTop - 26) + '" width="' + (xR - xL + 80) + '" height="26" class="balkje"/>' +
      '<text x="' + ((xL + xR) / 2) + '" y="' + (yTop - 7) + '" text-anchor="middle" class="small bold">' + esc(r.profiel.naam) + '</text>';
    [xL, xR].forEach(function (x) {
      out += '<line x1="' + x + '" y1="' + (yTop + 8) + '" x2="' + x + '" y2="' + (yVoet - 8) + '" class="heavy"/>' +
        '<circle cx="' + x + '" cy="' + (yTop + 8) + '" r="7" fill="#fff" stroke="#111" stroke-width="2"/>' +
        '<circle cx="' + x + '" cy="' + (yVoet - 8) + '" r="7" fill="#fff" stroke="#111" stroke-width="2"/>' +
        '<line x1="' + (x - 26) + '" y1="' + yVoet + '" x2="' + (x + 26) + '" y2="' + yVoet + '" class="medium"/>';
      for (var hx = x - 24; hx <= x + 20; hx += 11) out += '<line x1="' + hx + '" y1="' + (yVoet + 10) + '" x2="' + (hx + 8) + '" y2="' + yVoet + '" class="thin"/>';
      out += '<line x1="' + x + '" y1="' + (yVoet + 20) + '" x2="' + x + '" y2="' + (yVoet + 52) + '" class="thin" marker-end="url(#sarr)"/>' +
        '<text x="' + x + '" y="' + (yVoet + 72) + '" text-anchor="middle" class="tiny">voetlast ' + f1(pt.voetlast) + ' kN</text>';
    });
    out += '<line x1="' + (xL - 70) + '" y1="' + (yTop + 8) + '" x2="' + (xL - 70) + '" y2="' + (yVoet - 8) + '" class="dim"/>' +
      '<text x="' + (xL - 78) + '" y="' + ((yTop + yVoet) / 2) + '" text-anchor="end" class="dimtxt">' + f2(pt.hoogte) + ' m</text>';
    out += '<text x="' + ((xL + xR) / 2) + '" y="' + ((yTop + yVoet) / 2) + '" text-anchor="middle" class="tiny">scharnier boven en onder,</text>' +
      '<text x="' + ((xL + xR) / 2) + '" y="' + ((yTop + yVoet) / 2 + 18) + '" text-anchor="middle" class="tiny">kniklengte L_cr = kolomhoogte</text>';

    /* -- rechts: de kniktoets, stap voor stap -- */
    out += '<text x="640" y="150" class="label bold">KNIKTOETS · NEN-EN 1993-1-1 §6.3.1</text>';
    var rijen = [
      ['Normaalkracht per kolom', 'N_Ed = R + eigen gewicht', f1(pt.NEd) + ' kN'],
      ['Kniklengte', 'scharnier–scharnier', Math.round(pt.hoogte * 1000) + ' mm'],
      ['Traagheidsstraal', 'i = √(I/A)', f1(k.i) + ' mm'],
      ['Relatieve slankheid', 'λ̄ = (L_cr/i)/93,9', f2(pt.lamRel)],
      ['Reductiefactor', 'kniklijn c, α = 0,49', 'χ = ' + f2(pt.chi)],
      ['Knikweerstand', 'N_b,Rd = χ·A·f_y (γ_M1 = 1,0)', f1(pt.NbRd) + ' kN'],
    ];
    var ky = 182;
    rijen.forEach(function (rij) {
      out += '<text x="640" y="' + ky + '" class="small">' + esc(rij[0]) + '</text>' +
        '<text x="828" y="' + ky + '" class="tiny">' + esc(rij[1]) + '</text>' +
        '<text x="1090" y="' + ky + '" text-anchor="end" class="small bold">' + esc(rij[2]) + '</text>';
      ky += 30;
    });
    out += '<line x1="640" y1="' + (ky - 14) + '" x2="1090" y2="' + (ky - 14) + '" class="thin"/>';
    out += '<text x="640" y="' + (ky + 12) + '" class="small">Toets N_Ed ≤ N_b,Rd</text>' +
      '<rect x="828" y="' + ky + '" width="180" height="15" class="ucBar"/>' +
      '<rect x="828" y="' + ky + '" width="' + Math.min(180, 180 * pt.uc) + '" height="15" class="ucOk"/>' +
      '<text x="1020" y="' + (ky + 12) + '" class="small bold">UC ' + f2(pt.uc) + '</text>';

    out += '<text x="640" y="' + (ky + 58) + '" class="label bold">VOETLAST · FUNDERING</text>' +
      '<text x="640" y="' + (ky + 86) + '" class="small">Rekenwaarde per kolomvoet: ' + f1(pt.voetlast) + ' kN</text>' +
      '<text x="640" y="' + (ky + 108) + '" class="tiny">De constructeur beoordeelt de fundering (poer of bestaande strook)</text>' +
      '<text x="640" y="' + (ky + 124) + '" class="tiny">op deze last en dimensioneert kop- en voetplaten, bouten en verankering.</text>';

    out += '<text x="55" y="618" class="note bold">Dit is een voordimensionering, geen gewaarmerkte constructieberekening. Controle en waarmerking door een constructeur is vereist voor vergunning en uitvoering.</text>';
    return out + '</svg>';
  }

  function bladWeigering(r) {
    var out = sheetStart() + kader('DB-01', 'S-00', 'Buiten bereik');
    out += '<text x="55" y="80" class="title">DEZE SITUATIE MOET NAAR DE CONSTRUCTEUR</text>';
    out += '<text x="55" y="118" class="small">De voordimensionering rekent hier bewust niet verder. Redenen:</text>';
    var y = 158;
    r.redenen.forEach(function (t) {
      out += '<circle cx="62" cy="' + (y - 5) + '" r="4" fill="#a32323"/><text x="82" y="' + y + '" class="small">' + esc(t) + '</text>';
      y += 32;
    });
    out += '<text x="55" y="' + (y + 24) + '" class="small bold">' + esc(r.advies) + '</text>';
    return out + '</svg>';
  }

  function rapportHtml(r) {
    var bladen = r.geweigerd ? [bladWeigering(r)]
      : r.portaal ? [bladRapport(r), bladSchema(r), bladKolommen(r)]
      : [bladRapport(r), bladSchema(r)];
    var titel = r.geweigerd ? 'Buiten bereik: naar de constructeur' : 'Voordimensionering ' + r.profiel.naam;
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>' + esc(titel) + '</title><style>body{margin:0;background:#333;font-family:Arial}header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center}header b{font-size:14px}header span{font-size:11px;color:#e8b04b}button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}.sheet{width:min(96vw,1120px);margin:22px auto;box-shadow:0 8px 28px #0008;background:#fff}.sheet svg{display:block;width:100%;height:auto}@media print{header{display:none}body{background:#fff}.sheet{width:100%;margin:0;box-shadow:none;page-break-after:always}.sheet:last-child{page-break-after:auto}}@page{size:A3 landscape;margin:0}</style></head><body><header><b>' + esc(titel) + '</b><span>TER CONTROLE CONSTRUCTEUR, geen gewaarmerkte berekening</span><button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' + bladen.map(function (s) { return '<div class="sheet">' + s + '</div>'; }).join('') + '</body></html>';
  }

  function open(invoer) {
    var r = bereken(invoer || {});
    NGAfdruk.toon(rapportHtml(r), 'ng-staal', 'Staalligger-berekening');
  }

  /** Knop in de prijsbalk van de aanbouwconfigurator. De invoer volgt de
      doorbraak zoals de tekeningen hem tekenen: 58% van de breedte, hoogstens
      4 m, plus 0,3 m oplegging. */
  function init() {
    var haak = function () {
      var anker = document.getElementById('tekeningenBtn') || document.getElementById('naarOfferte');
      if (!anker || document.getElementById('staalBtn')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn--ghost'; b.id = 'staalBtn';
      b.textContent = 'Balkberekening DB-01';
      b.title = 'Voordimensionering van de stalen ligger boven de doorbraak, ter controle door de constructeur';
      b.addEventListener('click', function () {
        var sel = typeof global.NGKeuze === 'function' ? (global.NGKeuze() || {}) : {};
        var breedte = Number(sel.w || sel.breedte) || 4;
        var doorbraak = Math.min(breedte * 0.58, 4.0);
        var standaard = {
          overspanning: Math.round((doorbraak + 0.3) * 10) / 10,
          belastingbreedte: 1.8,           // halve vloeroverspanning bestaande woning, aanname
          watErboven: 'verdieping-plus-dak',
          vloertype: 'hout',
          muurdikte: 0.21, muurHoogteBoven: 2.4,
          staal: 'S235',
        };
        /* Met de bouwtekening-module erbij loopt de knop via het paneel:
           tekening uploaden of bewust zonder. Zonder module: direct rekenen. */
        if (global.NGBouwtekening) global.NGBouwtekening.open(standaard);
        else open(standaard);
      });
      anker.parentNode.insertBefore(b, anker.nextSibling);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', haak); else haak();
  }

  global.NGStaal = { bereken: bereken, rapportHtml: rapportHtml, open: open, init: init,
                     PROFIELEN: PROFIELEN, GRENZEN: GRENZEN };
})(typeof window !== 'undefined' ? window : globalThis);
