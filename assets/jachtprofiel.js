/* Vaarprofiel V-01 — wat de samengestelde boot in de praktijk betekent.
 *
 * Een configurator die alleen kleuren laat kiezen, vertelt de koper niets wat
 * hij niet al ziet. Dit blad beantwoordt de vragen die ná het kiezen komen en
 * die verkopers liever laten liggen: hoe hard gaat hij écht, hoe ver kom ik,
 * welk vaarbewijs heb ik nodig, en past hij in mijn box.
 *
 * De rekenregels zijn algemeen geldig en veranderen niet als de werf andere
 * modellen invoert:
 *
 *   Verdringingssnelheid   v = 2,43 x wortel(Lwl in meter), in knopen.
 *     Dit is de klassieke rompsnelheid (in voeten v = 1,34 x wortel(Lwl));
 *     2,43 is diezelfde constante omgerekend naar meters.
 *   Snelheid-lengteverhouding  v / wortel(Lwl), bepaalt het vaarregime:
 *     tot 2,43 verdringend, 2,43 tot 4,53 semi-glijdend, daarboven glijdend.
 *   Actieradius   bruikbare brandstof / verbruik per uur x kruissnelheid,
 *     met 10% van de tank als reserve. Dat is een vuistregel uit de
 *     zeevaart, geen wettelijke marge, en staat als zodanig op het blad.
 *
 * De vaarbewijsregels zijn geen vuistregel maar wet, en komen van het CBR
 * (Binnenvaartbesluit art. 16, Binnenvaartregeling hoofdstuk 7):
 *   - motorboot korter dan 15 m die harder kan dan 20 km/u: Klein Vaarbewijs
 *   - pleziervaartuig van 15 tot 25 m: Klein Vaarbewijs
 *   - pleziervaartuig van 25 tot 40 m: Groot Pleziervaartbewijs II
 *   - 40 m en langer: geen pleziervaartuig meer; ander regime, en daar
 *     weigert dit blad op.
 *
 * Net als bij de balkberekening geldt: waar het buiten het bereik valt, geeft
 * de module geen antwoord maar een reden.
 */
(function (global) {
  'use strict';

  var KNOOP_KMU = 1.852;
  var RESERVE = 0.10;          // deel van de tank dat niet meetelt
  var HULL_C = 2.43;           // constante rompsnelheid, metrisch
  var GLIJDEN = 4.53;          // v/wortel(Lwl) waarboven een romp glijdt

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var f1 = function (x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); };
  /* Lengtematen uit de eenhedenmodule: het vaarprofiel stond in meters terwijl
     de configurator ernaast in voeten kon staan. */
  var maat = function (x, decimalen) {
    var E = (typeof window !== 'undefined') && window.NGEenheden;
    return E ? E.lengte(x, decimalen) : f1(x) + ' m';
  };
  var f0 = function (x) { return String(Math.round(x)); };

  function vindOp(lijst, val) {
    for (var i = 0; i < lijst.length; i++) if (lijst[i].v === val) return lijst[i];
    return lijst[0];
  }

  /** @param k {model, motorisering, dek, opties[]} @param D NGJachtData */
  function bereken(k, D) {
    var m = vindOp(D.modellen, k.model);
    var mo = vindOp(D.motorisering, k.motorisering);
    var dek = vindOp(D.dekken, k.dek);
    var opties = k.opties || [];

    var redenen = [];
    if (m.loa >= 40) {
      redenen.push('Vanaf 40 meter is het schip geen pleziervaartuig meer. Dan gelden certificering, bemanningseisen en vlagstaatregels waar deze module niet over gaat.');
    }
    if (!(m.lwl > 0)) redenen.push('De waterlijnlengte ontbreekt in de modeltabel; zonder die maat is er geen rompsnelheid te bepalen.');
    if (redenen.length) {
      return { geweigerd: true, redenen: redenen, model: m,
               advies: 'Dit valt buiten het vaarprofiel. Laat het beoordelen door de werf en een klassenbureau.' };
    }

    /* -- snelheid en vaarregime -- */
    var vRomp = HULL_C * Math.sqrt(m.lwl);
    var slKruis = mo.kruis / Math.sqrt(m.lwl);
    var slTop = mo.top / Math.sqrt(m.lwl);
    var regime = slKruis < HULL_C ? 'verdringend'
      : (slKruis < GLIJDEN ? 'semi-glijdend' : 'glijdend');

    /* -- actieradius -- */
    var bruikbaar = m.tank * (1 - RESERVE);
    var verbruik = mo.verbruikFactor * m.loa;          // liter per uur, alle motoren
    var uren = bruikbaar / verbruik;
    var afstand = uren * mo.kruis;                      // zeemijl
    var vermogen = mo.kwFactor * m.loa;                 // kW per motor

    /* Zuinig varen: op verdringingssnelheid daalt het verbruik ruwweg met de
       derde macht van de snelheidsverhouding. Dat is een benadering en staat
       als zodanig op het blad — maar het verschil is zo groot dat het
       vermelden verdient. */
    var vZuinig = Math.min(mo.kruis, vRomp);
    var verbruikZuinig = verbruik * Math.pow(vZuinig / mo.kruis, 3);
    var afstandZuinig = (bruikbaar / verbruikZuinig) * vZuinig;

    /* -- vaarbewijs, volgens het CBR -- */
    var topKmu = mo.top * KNOOP_KMU;
    var bewijs, bewijsUit;
    if (m.loa >= 25) {
      bewijs = 'Groot Pleziervaartbewijs II';
      bewijsUit = 'Voor pleziervaartuigen van 25 tot 40 meter. Het Klein Vaarbewijs volstaat hier niet.';
    } else if (m.loa >= 15) {
      bewijs = 'Klein Vaarbewijs';
      bewijsUit = 'Voor pleziervaartuigen van 15 tot 25 meter, ongeacht de snelheid. Ook een langzame boot van 16 meter valt hieronder.';
    } else if (topKmu > 20) {
      bewijs = 'Klein Vaarbewijs';
      bewijsUit = 'Korter dan 15 meter, maar sneller dan 20 km/u. Dan is het vaarbewijs verplicht.';
    } else {
      bewijs = 'Geen vaarbewijs verplicht';
      bewijsUit = 'Korter dan 15 meter en niet sneller dan 20 km/u.';
    }

    /* -- ligplaats: vuistregel, geen norm -- */
    var boxLengte = m.loa + 1.5;
    var boxBreedte = m.breedte + 1.2;
    var boxDiepte = m.diepgang + 0.5;

    /* -- waarschuwingen: de dingen die een verkoper niet uit zichzelf zegt -- */
    var letOp = [];
    if (dek.v === 'flybridge-ttop') {
      letOp.push('Met T-top en radarmast wordt het schip hoog. Meet de doorvaarthoogte na voordat je vaste bruggen in het binnenland plant; een strijkbare mast is vaak de oplossing.');
    }
    if (opties.indexOf('jacuzzi') > -1 && opties.indexOf('stabilisatoren') < 0) {
      letOp.push('Een gevulde jacuzzi weegt al gauw een ton, en hij staat hoog in het schip. Zonder stabilisatoren merk je dat aan het slingergedrag; bespreek dit met de werf.');
    }
    if (opties.indexOf('zwembad') > -1) {
      letOp.push('Een zwembad van enkele kubieke meters weegt gevuld meerdere tonnen, en dat water schuift bij slingeren mee naar de lage zijde. Dat vrije-vloeistofeffect verslechtert de stabiliteit meetbaar; laat de werf de berekening maken en overweeg om leeg te varen op zee.');
    }
    if (opties.indexOf('tenderkraan') > -1 && opties.indexOf('stabilisatoren') < 0) {
      letOp.push('Een tender op het bovendek verhoogt het gewicht bovendeks. Vraag de werf naar de stabiliteitsberekening bij volle belading.');
    }
    /* Onder de dertig meter is het bovendek een klein vlak, en de jacuzzi en de
       tenderkraan willen er allebei staan. Dat is geen theorie: op een
       flybridgejacht van drieentwintig en een halve meter is het in de
       prijslijst letterlijk een keuze uit drie - bad, jetski met kraan, of
       ligbedden - op dezelfde plek. Wie ze hier allebei aanvinkt hoort dat te
       weten voordat de werf het zegt. */
    if (m.loa < 30 && opties.indexOf('jacuzzi') > -1 && opties.indexOf('tenderkraan') > -1) {
      letOp.push('Op een schip van deze lengte staan de jacuzzi en de tenderkraan op hetzelfde stuk bovendek. Bij de meeste werven is dat een keuze: het bad, of de kraan met bijboot, of ligbedden. Vraag de werf om een dekindeling voordat je beide bestelt.');
    }
    if (mo.v === 'drie') {
      letOp.push('Waterjets manoeuvreren uitstekend en varen ondiep, maar zijn gevoeliger voor drijfvuil en zeewier dan schroeven. Op de Nederlandse binnenwateren is dat een reële afweging.');
    }
    if (regime === 'verdringend' && mo.v !== 'hybride') {
      letOp.push('Bij deze rompvorm en kruissnelheid vaart het schip verdringend. Zwaarder motorvermogen levert dan nauwelijks snelheid op, wél meer verbruik en gewicht.');
    }
    if (m.loa >= 25) {
      letOp.push('Boven de 25 meter komen er naast het vaarbewijs vaak eisen bij rond bemanning, veiligheidsuitrusting en registratie. Reken op professionele begeleiding bij de oplevering.');
    }

    return {
      geweigerd: false, model: m, motor: mo, dek: dek, opties: opties,
      vRomp: vRomp, slKruis: slKruis, slTop: slTop, regime: regime,
      kruis: mo.kruis, top: mo.top, topKmu: topKmu,
      vermogen: vermogen, aantalMotoren: mo.aantal,
      tank: m.tank, bruikbaar: bruikbaar, verbruik: verbruik,
      uren: uren, afstand: afstand,
      vZuinig: vZuinig, verbruikZuinig: verbruikZuinig, afstandZuinig: afstandZuinig,
      bewijs: bewijs, bewijsUit: bewijsUit,
      box: { lengte: boxLengte, breedte: boxBreedte, diepte: boxDiepte },
      letOp: letOp
    };
  }

  /* ---------- het blad ---------- */

  function bladProfiel(r) {
    var m = r.model;
    var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 770" role="img">' +
      '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}' +
      '.micro{font-size:9px;letter-spacing:.45px}.tiny{font-size:11px}.small{font-size:14px}' +
      '.label{font-size:16px}.title{font-size:25px;font-weight:700}.brand{font-size:15px;font-weight:800}' +
      '.bold{font-weight:700}.stamp{font-size:12px;font-weight:800;fill:#a32323}' +
      '.grijs{font-size:11px;fill:#666}.note{font-size:12px;fill:#333}' +
      '.balk{fill:#eee;stroke:#999;stroke-width:.6}.balkIn{fill:#3f7d47}</style>' +
      '<rect width="1120" height="770" fill="#fff"/>';

    o += '<rect x="20" y="20" width="1080" height="730" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<line x1="20" y1="680" x2="1100" y2="680" stroke="#111"/>' +
      '<line x1="650" y1="680" x2="650" y2="750" stroke="#111"/>' +
      '<line x1="850" y1="680" x2="850" y2="750" stroke="#111"/>' +
      '<text x="38" y="704" class="brand">NEXT GROWTH &#183; VAARPROFIEL</text>' +
      '<text x="38" y="728" class="tiny">' + esc(m.l) + ' &#183; ' + esc(r.motor.l) + '</text>' +
      '<text x="665" y="702" class="micro">BLAD</text><text x="665" y="727" class="small bold">V-01</text>' +
      '<text x="865" y="702" class="micro">STATUS</text><text x="865" y="727" class="stamp">VOORBEELDMODEL</text>';

    o += '<text x="55" y="70" class="title">VAARPROFIEL &#183; ' + esc(m.l.toUpperCase()) + '</text>';

    /* -- snelheid -- */
    o += '<text x="55" y="118" class="label bold">SNELHEID EN VAARREGIME</text>';
    var rijen = [
      ['Waterlijnlengte', maat(m.lwl), 'bepaalt de rompsnelheid'],
      ['Verdringingssnelheid', f1(r.vRomp) + ' kn', 'v = 2,43 &#215; &#8730;L' + 'wl'],
      ['Kruissnelheid', f1(r.kruis) + ' kn', 'opgave werf'],
      ['Topsnelheid', f1(r.top) + ' kn (' + f0(r.topKmu) + ' km/u)', 'bepaalt de vaarbewijsplicht'],
      ['Snelheid-lengteverhouding', f1(r.slKruis), 'bij kruissnelheid'],
      ['Vaarregime', r.regime, 'tot 2,43 verdringend &#183; tot 4,53 semi &#183; daarboven glijdend']
    ];
    var y = 146;
    rijen.forEach(function (rij) {
      o += '<text x="55" y="' + y + '" class="small">' + rij[0] + '</text>' +
        '<text x="300" y="' + y + '" class="small bold">' + rij[1] + '</text>' +
        '<text x="470" y="' + y + '" class="grijs">' + rij[2] + '</text>';
      y += 26;
    });

    /* -- actieradius -- */
    o += '<text x="55" y="' + (y + 24) + '" class="label bold">ACTIERADIUS</text>';
    y += 52;
    var rijen2 = [
      ['Tankinhoud', f0(r.tank) + ' liter', ''],
      ['Bruikbaar, na 10% reserve', f0(r.bruikbaar) + ' liter', 'vuistregel, geen wettelijke marge'],
      ['Vermogen', r.aantalMotoren + ' &#215; ' + f0(r.vermogen) + ' kW', ''],
      ['Verbruik op kruissnelheid', f0(r.verbruik) + ' l/uur', 'alle motoren samen'],
      ['Vaartijd op kruissnelheid', f1(r.uren) + ' uur', ''],
      ['Bereik op kruissnelheid', f0(r.afstand) + ' zeemijl', 'circa ' + f0(r.afstand * 1.852) + ' km']
    ];
    rijen2.forEach(function (rij) {
      o += '<text x="55" y="' + y + '" class="small">' + rij[0] + '</text>' +
        '<text x="300" y="' + y + '" class="small bold">' + rij[1] + '</text>' +
        '<text x="470" y="' + y + '" class="grijs">' + rij[2] + '</text>';
      y += 26;
    });
    if (r.afstandZuinig > r.afstand * 1.15) {
      o += '<text x="55" y="' + (y + 6) + '" class="note bold">Zuinig varen op ' + f1(r.vZuinig) +
        ' kn brengt je circa ' + f0(r.afstandZuinig) + ' zeemijl ver, ruim ' +
        f0((r.afstandZuinig / r.afstand - 1) * 100) + '% verder op dezelfde tank.</text>';
      y += 26;
    }

    /* -- rechterkolom: vaarbewijs en ligplaats -- */
    o += '<text x="700" y="118" class="label bold">VAARBEWIJS</text>' +
      '<text x="700" y="148" class="small bold">' + esc(r.bewijs) + '</text>';
    var woorden = r.bewijsUit.split(' '), regel = '', rs = [];
    woorden.forEach(function (w) { if ((regel + ' ' + w).length > 44) { rs.push(regel); regel = w; } else regel = regel ? regel + ' ' + w : w; });
    rs.push(regel);
    var by = 170;
    rs.forEach(function (t) { o += '<text x="700" y="' + by + '" class="tiny">' + esc(t) + '</text>'; by += 16; });
    o += '<text x="700" y="' + (by + 12) + '" class="grijs">Bron: CBR &#183; Binnenvaartbesluit art. 16</text>';
    o += '<text x="700" y="' + (by + 30) + '" class="grijs">Klein Vaarbewijs I voor rivieren, kanalen en meren;</text>';
    o += '<text x="700" y="' + (by + 46) + '" class="grijs">II ook voor IJsselmeer, Waddenzee en Scheldes.</text>';

    o += '<text x="700" y="' + (by + 96) + '" class="label bold">LIGPLAATS</text>';
    o += '<text x="700" y="' + (by + 124) + '" class="small">Box minimaal ' + maat(r.box.lengte) + ' &#215; ' + maat(r.box.breedte) + '</text>';
    o += '<text x="700" y="' + (by + 148) + '" class="small">Waterdiepte minimaal ' + maat(r.box.diepte) + '</text>';
    o += '<text x="700" y="' + (by + 170) + '" class="grijs">Scheepsmaat plus stootmarge; vuistregel, geen norm.</text>';

    /* -- let op -- */
    if (r.letOp.length) {
      o += '<text x="700" y="' + (by + 216) + '" class="label bold">LET OP</text>';
      var ly = by + 244;
      r.letOp.slice(0, 4).forEach(function (t) {
        var w = t.split(' '), rg = '', rr = [];
        w.forEach(function (x) { if ((rg + ' ' + x).length > 48) { rr.push(rg); rg = x; } else rg = rg ? rg + ' ' + x : x; });
        rr.push(rg);
        o += '<circle cx="706" cy="' + (ly - 4) + '" r="3.2" fill="#a35b16"/>';
        rr.forEach(function (x) { o += '<text x="720" y="' + ly + '" class="tiny">' + esc(x) + '</text>'; ly += 15; });
        ly += 8;
      });
    }

    o += '<text x="55" y="640" class="note bold">Dit vaarprofiel rekent met de opgaven uit de modeltabel van een voorbeeldmodel. ' +
      'Werkelijke snelheden en verbruiken volgen uit de proefvaart; de werf bevestigt ze bij de offerte.</text>';

    return o + '</svg>';
  }

  function bladWeigering(r) {
    var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 770" role="img">' +
      '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}.title{font-size:25px;font-weight:700}' +
      '.small{font-size:14px}</style><rect width="1120" height="770" fill="#fff"/>' +
      '<rect x="20" y="20" width="1080" height="730" fill="#fff" stroke="#111" stroke-width="2"/>';
    o += '<text x="55" y="90" class="title">DIT VALT BUITEN HET VAARPROFIEL</text>';
    var y = 140;
    r.redenen.forEach(function (t) {
      o += '<circle cx="62" cy="' + (y - 5) + '" r="4" fill="#a32323"/><text x="82" y="' + y + '" class="small">' + esc(t) + '</text>';
      y += 30;
    });
    o += '<text x="55" y="' + (y + 20) + '" class="small">' + esc(r.advies) + '</text>';
    return o + '</svg>';
  }

  function rapportHtml(r) {
    var blad = r.geweigerd ? bladWeigering(r) : bladProfiel(r);
    var titel = r.geweigerd ? 'Buiten het vaarprofiel' : 'Vaarprofiel V-01: ' + r.model.l;
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>' + esc(titel) + '</title>' +
      '<style>body{margin:0;background:#333;font-family:Arial}' +
      'header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}' +
      'header b{font-size:14px}header span{font-size:11px;color:#e8b04b}' +
      'button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}' +
      '.sheet{width:min(96vw,1120px);margin:22px auto;box-shadow:0 8px 28px #0008;background:#fff}' +
      '.sheet svg{display:block;width:100%;height:auto}' +
      '@media print{header{display:none}body{background:#fff}.sheet{width:100%;margin:0;box-shadow:none}}' +
      '@page{size:A3 landscape;margin:0}</style></head><body>' +
      '<header><b>' + esc(titel) + '</b><span>VOORBEELDMODEL: specificaties worden door de werf ingevuld</span>' +
      '<button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' +
      '<div class="sheet">' + blad + '</div></body></html>';
  }

  function open(k, D) {
    var r = bereken(k, D);
    /* het afgemaakte blad in één keer door de taallaag; zie jacht-taal.js */
    var vt = function (h) { return (global.NGTaal && global.NGTaal.vertaalHtml) ? global.NGTaal.vertaalHtml(h) : h; };
    NGAfdruk.toon(vt(rapportHtml(r)), 'ng-vaarprofiel',
      (global.NGTaal ? global.NGTaal.T('Vaarprofiel') : 'Vaarprofiel'));
  }

  global.NGJachtProfiel = { bereken: bereken, rapportHtml: rapportHtml, open: open };
})(typeof window !== 'undefined' ? window : globalThis);
