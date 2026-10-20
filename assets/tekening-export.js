/* Uitvoer van de technische tekening: PDF, SVG, PNG, JSON en DXF.
 *
 * Alle vijf lezen hetzelfde model en tekenen met dezelfde routine op een ander
 * blad. Daarmee is de belangrijkste eis van een technische tekening — dat de
 * PDF hetzelfde zegt als het scherm — geen kwestie van opletten maar van bouw:
 * er is domweg geen tweede plek waar een maat vandaan kan komen.
 *
 * Geen enkele externe bibliotheek. De configurator is een los HTML-bestand
 * zonder bouwstap; een PDF-bibliotheek van driehonderd kilobyte erbij halen om
 * lijnen en tekst op papier te zetten staat niet in verhouding, en een
 * ingesloten bitmap zou van een technische tekening een foto van een technische
 * tekening maken.
 */
(function () {
  "use strict";

  var PAPIER = {
    A4: { b: 210, h: 297 }, A4L: { b: 297, h: 210 },
    A3: { b: 297, h: 420 }, A3L: { b: 420, h: 297 }
  };
  /* De gangbare reeks. Groter dan 1:10 heeft geen zin voor een hele badkamer,
     kleiner dan 1:100 is niet meer op te meten. */
  var SCHALEN = [10, 20, 25, 50, 100];

  function kiesSchaal(kader, ruimteMm) {
    for (var i = 0; i < SCHALEN.length; i++) {
      var s = SCHALEN[i];
      if (kader.b / s <= ruimteMm.b && kader.h / s <= ruimteMm.h) return s;
    }
    return SCHALEN[SCHALEN.length - 1];
  }

  function datumTekst(d) {
    d = d || new Date();
    var tw = function (n) { return (n < 10 ? '0' : '') + n; };
    return tw(d.getDate()) + '-' + tw(d.getMonth() + 1) + '-' + d.getFullYear();
  }

  /* ------------------------------------------------------------------ JSON */

  /* De volledige tekening als gegevens. Dit is wat een ander systeem inleest —
     een werkvoorbereider, een calculatie, een CAD-koppeling — en het bevat
     daarom niet alleen de maten maar ook waar elke maat vandaan komt. */
  function json(M) {
    return {
      versie: 1,
      eenheid: 'mm',
      opgesteld: new Date().toISOString(),
      project: M.project || {},
      ruimte: {
        breedte: M.ruimte.b, diepte: M.ruimte.d, hoogte: M.ruimte.h,
        wanddikte: M.ruimte.wanddikte, oppervlakte_m2: M.ruimte.opp,
        vorm: M.ruimte.snede ? 'l-vorm' : 'rechthoek', snede: M.ruimte.snede,
        vloerPolygoon: window.NGTekening.vloerPolygoon(M.ruimte),
        herkomst: M.herkomst
      },
      wanden: M.wanden,
      producten: M.producten.map(function (p) {
        return {
          plek: p.sleutel, artikel: p.pid, artikelen: p.pids, naam: p.naam,
          wand: p.wand, hart: p.hart, breedte: p.breedte, diepte: p.diepte,
          hoogte: p.hoogte, montagehoogte: p.montage, montageBron: p.montageBron,
          contour: p.vlak, referenties: p.referenties || [],
          maatBron: p.maatBron
        };
      }),
      openingen: M.openingen,
      vrijeRuimte: M.vrij,
      draaicirkels: M.draaicirkels,
      doorgang: M.doorgang,
      installatie: M.installatie,
      tegelwerk: M.tegel,
      natteZones: M.natteZones,
      maten: M.maten,
      hoogtes: M.hoogtes,
      aannames: M.aannames,
      waarschuwingen: M.waarschuwingen,
      let_op: 'Alle maten vóór uitvoering op locatie controleren.'
    };
  }

  /* ------------------------------------------------------------------- SVG */

  function svg(M, wat, opties) {
    var o = opties || {};
    if (wat === 'plattegrond' || !wat) return window.NGTekeningSVG.plattegrond(M, o);
    return window.NGTekeningSVG.wandaanzicht(M, wat, o);
  }

  /* ------------------------------------------------------------------- DXF */

  /* Dezelfde tekenroutine, maar dan op een DXF-blad. De lagen komen erin door de
     tekening in stukken te zetten en per stuk de laag te wisselen; zo kan een
     CAD-gebruiker de maatvoering uitzetten zonder hem eerst te moeten opzoeken. */
  function dxf(M, opties) {
    var o = opties || {};
    var blad = window.NGBlad.dxf();
    blad.laag('TEKENING');
    window.NGTekeningSVG.tekenPlattegrond(blad, M, {
      maatlijnen: false, installatie: false, vrijeRuimte: false
    });
    blad.laag('VRIJE_RUIMTE');
    (M.vrij || []).forEach(function (v) { blad.rect(v.vlak, {}); });
    blad.laag('INSTALLATIE');
    var R = M.ruimte;
    M.installatie.forEach(function (i) {
      if (i.bij === 'plafond') return;
      var p = window.NGTekening.opWand(R, i.wand, i.l, 55);
      blad.cirkel(p.x, p.y, 46, {});
      blad.tekst(p.x, p.y - 90, i.soort, { hoogte: 46, anker: 'middle' });
    });
    blad.laag('MAATVOERING');
    window.NGTekeningSVG.tekenPlattegrond(blad, M, {
      maatlijnen: true, installatie: false, vrijeRuimte: false, alleenMaten: true
    });
    return blad.inhoud();
  }

  /* ------------------------------------------------------------------- PNG */

  /* Via een canvas, want dat is de enige weg van SVG naar bitmap die de browser
     zelf al kent. De schaal is een vermenigvuldiging op de viewBox, zodat een
     PNG voor het scherm klein blijft en een PNG voor een e-mail scherp is. */
  function png(M, wat, opties) {
    var o = opties || {};
    var bron = svg(M, wat, o);
    var breedte = o.breedte || 1600;
    return new Promise(function (klaar, fout) {
      var img = new Image();
      var blob = new Blob([bron], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      img.onload = function () {
        var verh = img.height / img.width || 0.7;
        var c = document.createElement('canvas');
        c.width = breedte; c.height = Math.round(breedte * verh);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { klaar(b); }, 'image/png');
      };
      img.onerror = function (e) { URL.revokeObjectURL(url); fout(e); };
      img.src = url;
    });
  }

  /* ------------------------------------------------------------------- PDF */

  var PDF_STIJL = { klein: 2.4, normaal: 3.0, kop: 4.6, titel: 7 };

  function pdfTekst(blad, x, y, t, hoogte, o) {
    o = o || {};
    blad.tekst(x, y, t, { hoogte: hoogte, kleur: o.kleur || '#1d1a17',
                          anker: o.anker || 'start' });
  }

  /* Het titelblok. Elke pagina draagt hem, want een losgeraakt vel van een
     tekeningenset zonder projectnaam en revisie is een blad papier met lijnen. */
  function titelblok(blad, pagina, M, gegevens) {
    var b = pagina.b, h = pagina.h, m = 10;
    var hoogte = 26;
    var y0 = h - m - hoogte;
    blad.lijn(m, y0, b - m, y0, { kleur: '#1d1a17', dikte: 0.4 });
    blad.rect({ x0: m, y0: y0, x1: b - m, y1: h - m },
              { kleur: '#1d1a17', dikte: 0.4 });
    var k = m + 4, r = y0 + 6;
    pdfTekst(blad, k, r, gegevens.projectnaam || 'Badkamer', PDF_STIJL.kop);
    pdfTekst(blad, k, r + 6, 'Configuratie ' + (gegevens.nummer || '-'), PDF_STIJL.klein);
    if (gegevens.klant) pdfTekst(blad, k, r + 11, 'Klant: ' + gegevens.klant, PDF_STIJL.klein);
    pdfTekst(blad, k, r + 16, 'Datum ' + (gegevens.datum || datumTekst()) +
             '   Revisie ' + (gegevens.revisie || 'A'), PDF_STIJL.klein);

    var mid = m + (b - 2 * m) * 0.52;
    pdfTekst(blad, mid, r, gegevens.blad || '', PDF_STIJL.kop);
    pdfTekst(blad, mid, r + 6, 'Schaal 1:' + (gegevens.schaal || '-') +
             '   Maten in mm', PDF_STIJL.klein);
    pdfTekst(blad, mid, r + 11, 'Papier ' + (gegevens.papier || ''), PDF_STIJL.klein);
    pdfTekst(blad, mid, r + 16, 'ALLE MATEN VÓÓR UITVOERING OP LOCATIE CONTROLEREN',
             PDF_STIJL.klein, { kleur: '#b4442f' });

    pdfTekst(blad, b - m - 4, r, 'Next Growth', PDF_STIJL.kop, { anker: 'end' });
    pdfTekst(blad, b - m - 4, r + 6, 'blad ' + gegevens.paginanummer + ' van ' +
             gegevens.paginas, PDF_STIJL.klein, { anker: 'end' });
  }

  /* De hoogtestaat als blok op het papier, in twee kolommen. Hij hoort op het
     plattegrondblad omdat dat het vel is dat op de bouw meegaat; een aparte
     bijlage met hoogtes wordt niet meegenomen naar de tweede verdieping.

     Twee kolommen en geen zestien regels onder elkaar: onder elkaar kost het
     bijna tachtig millimeter, en dat is een hele schaalstap van de plattegrond
     af. Naast elkaar past het in ruim veertig. */
  function hoogteblok(blad, vak, y0, M) {
    var rijen = M.hoogtes || [];
    if (!rijen.length) return 0;
    var kolB = vak.b / 2 - 4;
    var perKolom = Math.ceil(rijen.length / 2);
    var y = y0;
    pdfTekst(blad, vak.x, y, 'Montage- en aansluithoogtes (mm vanaf afgewerkte vloer)',
             PDF_STIJL.kop);
    y += 3;
    pdfTekst(blad, vak.x, y + 1.5, 'Gebruikelijke Nederlandse waarden, geen norm. ' +
             'Rood = deze tekening wijkt af.', PDF_STIJL.klein, { kleur: '#8a6a3c' });
    y += 4.5;
    blad.lijn(vak.x, y, vak.x + vak.b, y, { kleur: '#8a6a3c', dikte: 0.3 });
    y += 3.6;

    rijen.forEach(function (r, i) {
      var kol = Math.floor(i / perKolom);
      var rx = vak.x + kol * (kolB + 8);
      var ry = y + (i % perKolom) * 3.6;
      var kleur = r.status === 'afwijkend' ? '#b4442f'
                : r.status === 'nvt' ? '#8d867c' : '#1d1a17';
      pdfTekst(blad, rx, ry, r.naam, PDF_STIJL.klein, { kleur: kleur });
      pdfTekst(blad, rx + kolB * 0.60, ry,
               r.toegepast == null ? '-' : String(r.toegepast),
               PDF_STIJL.klein, { kleur: kleur, anker: 'end' });
      var bereik = r.van + '-' + r.tot;
      pdfTekst(blad, rx + kolB * 0.64, ry, bereik, PDF_STIJL.klein, { kleur: kleur });
      /* De bron staat rechts uitgelijnd. Op A4 is de kolom zo smal dat een
         lange bron ("praktijk (Klusidee, Sanitino)") over het bereik heen
         viel. Meet hem; past hij niet, dan zonder de toelichting tussen
         haakjes, en past dat ook niet, dan liever geen bron dan onleesbaar. */
      var breed = window.NGBlad && window.NGBlad.tekstBreed
                ? function (t) { return window.NGBlad.tekstBreed(t, PDF_STIJL.klein); }
                : function (t) { return String(t).length * PDF_STIJL.klein * 0.53; };
      var bronX0 = rx + kolB * 0.64 + breed(bereik) + 2;
      var bron = r.bron || '';
      if (bron && rx + kolB - breed(bron) < bronX0) bron = bron.replace(/\s*\(.*\)\s*$/, '');
      if (bron && rx + kolB - breed(bron) < bronX0) bron = '';
      if (bron) pdfTekst(blad, rx + kolB, ry, bron, PDF_STIJL.klein,
                         { kleur: '#8d867c', anker: 'end' });
    });
    return (y - y0) + perKolom * 3.6 + 2;
  }

  /* Een tekening op een plek op het papier, op de grootste schaal uit de reeks
     die past. De schaal wordt teruggegeven zodat hij in het titelblok komt te
     staan en niet geraden hoeft te worden. */
  function tekenOpPapier(pagina, plek, kader, teken) {
    var schaal = kiesSchaal({ b: kader.b, h: kader.h }, { b: plek.b, h: plek.h });
    // gecentreerd in het beschikbare vak, met de oorsprong van de tekening
    // verschoven zodat het kader precies in het vak valt
    var breedMm = kader.b / schaal, hoogMm = kader.h / schaal;
    var ox = plek.x + (plek.b - breedMm) / 2 - kader.x / schaal;
    var oy = plek.y + (plek.h - hoogMm) / 2 - kader.y / schaal;
    teken(pagina.venster({ x: ox, y: oy }, schaal));
    return schaal;
  }

  function pdf(M, opties) {
    var o = opties || {};
    var groot = o.formaat === 'A3';
    /* De plattegrond van een badkamer is meestal dieper dan breed, en die past
       staand een schaalstap groter op hetzelfde vel. De aanzichten zijn juist
       breed en laag; die blijven liggend. Eén formaat voor alles kostte een
       halvering van de schaal, en op 1:50 zijn de artikelnummers niet meer te
       lezen. */
    var kaderPlat = window.NGTekeningSVG.plattegrondKader(M, {});
    var staand = kaderPlat.h > kaderPlat.b;
    var velPlat = PAPIER[groot ? (staand ? 'A3' : 'A3L') : (staand ? 'A4' : 'A4L')];
    var vel = PAPIER[groot ? 'A3L' : 'A4L'];
    var formaat = groot ? 'A3' : 'A4';
    var doc = window.NGBlad.document();
    var g = {
      projectnaam: (M.project && M.project.naam) || 'Badkamer',
      nummer: (M.project && M.project.nummer) || '-',
      klant: (M.project && M.project.klant) || '',
      datum: (M.project && M.project.datum) || datumTekst(),
      revisie: (M.project && M.project.revisie) || 'A',
      papier: formaat
    };
    /* Hoeveel aanzichten er op een vel gaan bepaalt hoe dik de set wordt, en dat
       moet vaststaan voordat blad 1 zijn "blad 1 van n" krijgt. Met z'n vieren
       op één A4 kwam er 1:100 uit, en op 1:100 is een tekst van 52 mm een halve
       millimeter op papier — niet te lezen, dus niet te gebruiken. */
    var perBlad = groot ? 2 : 1;
    var bladenAanzicht = Math.ceil(4 / perBlad);
    g.paginas = bladenAanzicht + 3;
    var marge = 12, titelH = 30;
    var vakVan = function (v) {
      return { x: marge, y: marge, b: v.b - marge * 2, h: v.h - marge * 2 - titelH };
    };
    var vak = vakVan(vel);

    // ---- blad 1: plattegrond, met de hoogtestaat eronder
    doc.pagina(velPlat.b, velPlat.h, function (blad, pagina) {
      var eigenVak = vakVan(velPlat);
      /* De tekening staat bovenaan en de hoogtes eronder. De strook wordt van
         de tekenhoogte afgetrokken vóór het schalen, anders loopt de
         plattegrond over de tabel heen. */
      var staatH = Math.ceil((M.hoogtes || []).length / 2) * 3.6 + 14;
      var tekenVak = { x: eigenVak.x, y: eigenVak.y,
                       b: eigenVak.b, h: eigenVak.h - staatH - 6 };
      var schaal = tekenOpPapier(pagina, tekenVak, kaderPlat, function (teken) {
        window.NGTekeningSVG.tekenPlattegrond(teken, M, { maatlijnen: true });
      });
      hoogteblok(blad, eigenVak, eigenVak.y + eigenVak.h - staatH, M);
      titelblok(blad, pagina, M, Object.assign({}, g,
        { blad: 'Plattegrond', schaal: schaal, paginanummer: 1,
          papier: formaat + (staand ? ' staand' : ' liggend') }));
    });

    /* ---- de wandaanzichten: op A4 één per blad, op A3 twee. Een set met wat
       meer bladen is geen probleem; een onleesbare set wel. */
    window.NGTekening.WANDEN.forEach(function (w, i) {
      if (i % perBlad !== 0) return;
      var groep = window.NGTekening.WANDEN.slice(i, i + perBlad);
      doc.pagina(vel.b, vel.h, function (blad, pagina) {
        var schaal = 0;
        groep.forEach(function (wand, k) {
          var deel = { x: vak.x + k * vak.b / perBlad, y: vak.y + 7,
                       b: vak.b / perBlad - (perBlad > 1 ? 8 : 0), h: vak.h - 10 };
          var kader = window.NGTekeningSVG.wandKader(M, wand, {});
          schaal = tekenOpPapier(pagina, deel, kader, function (teken) {
            window.NGTekeningSVG.tekenWandaanzicht(teken, M, wand, { maatlijnen: true });
          });
          pdfTekst(blad, deel.x, deel.y - 2, window.NGTekening.WANDNAAM[wand] +
                   ', schaal 1:' + schaal, PDF_STIJL.normaal);
        });
        titelblok(blad, pagina, M, Object.assign({}, g,
          { blad: 'Wandaanzicht ' + groep.map(function (x) {
              return window.NGTekening.WANDNAAM[x];
            }).join(' en '),
            schaal: schaal, paginanummer: 2 + i / perBlad,
            papier: formaat + ' liggend' }));
      });
    });

    // ---- blad 3: installatietekening met legenda
    doc.pagina(vel.b, vel.h, function (blad, pagina) {
      var tekenVak = { x: vak.x, y: vak.y, b: vak.b * 0.72, h: vak.h };
      var kader = window.NGTekeningSVG.plattegrondKader(M, {});
      var schaal = tekenOpPapier(pagina, tekenVak, kader, function (teken) {
        window.NGTekeningSVG.tekenPlattegrond(teken, M,
          { maatlijnen: false, installatie: true, vrijeRuimte: false });
      });
      // legenda rechts, op een vaste schaal zodat de symbolen leesbaar blijven
      var lx = vak.x + vak.b * 0.75;
      pdfTekst(blad, lx, vak.y + 4, 'Legenda installatie', PDF_STIJL.kop);
      var lblad = pagina.venster({ x: lx, y: vak.y + 8 }, 22);
      window.NGTekeningSVG.tekenLegenda(lblad, gebruikteSoorten(M), 0, 60);
      var ly = vak.y + 8 + (gebruikteSoorten(M).length * 150) / 22 + 8;
      pdfTekst(blad, lx, ly, 'Aansluitpunten', PDF_STIJL.normaal);
      ly += 5;
      M.installatie.slice(0, 22).forEach(function (i) {
        pdfTekst(blad, lx, ly, '· ' + i.soort + ': ' + i.bij + ', h=' + i.hoogte +
                 ' (' + i.herkomst + ')', PDF_STIJL.klein);
        ly += 4;
      });
      titelblok(blad, pagina, M, Object.assign({}, g,
        { blad: 'Installatietekening', schaal: schaal, paginanummer: g.paginas - 1,
          papier: formaat + ' liggend' }));
    });

    // ---- laatste blad: productlijst, maatvoering, aannames
    doc.pagina(vel.b, vel.h, function (blad, pagina) {
      var y = vak.y + 6;
      pdfTekst(blad, vak.x, y, 'Productlijst', PDF_STIJL.kop); y += 7;
      pdfTekst(blad, vak.x, y, 'Artikel', PDF_STIJL.klein);
      pdfTekst(blad, vak.x + 28, y, 'Omschrijving', PDF_STIJL.klein);
      pdfTekst(blad, vak.x + 105, y, 'B×D×H (mm)', PDF_STIJL.klein);
      pdfTekst(blad, vak.x + 148, y, 'Wand', PDF_STIJL.klein);
      pdfTekst(blad, vak.x + 175, y, 'Hart', PDF_STIJL.klein);
      pdfTekst(blad, vak.x + 200, y, 'Montage', PDF_STIJL.klein);
      pdfTekst(blad, vak.x + 228, y, 'Bron', PDF_STIJL.klein);
      y += 1.5;
      blad.lijn(vak.x, y, vak.x + vak.b, y, { kleur: '#8a6a3c', dikte: 0.3 });
      y += 4;
      M.producten.forEach(function (p) {
        pdfTekst(blad, vak.x, y, p.pid || '-', PDF_STIJL.klein);
        pdfTekst(blad, vak.x + 28, y, p.naam, PDF_STIJL.klein);
        pdfTekst(blad, vak.x + 105, y, Math.round(p.breedte) + '×' + Math.round(p.diepte) +
                 '×' + Math.round(p.hoogte), PDF_STIJL.klein);
        pdfTekst(blad, vak.x + 148, y, window.NGTekening.WANDNAAM[p.wand] || '-', PDF_STIJL.klein);
        pdfTekst(blad, vak.x + 175, y, String(Math.round(p.hart)), PDF_STIJL.klein);
        pdfTekst(blad, vak.x + 200, y, String(Math.round(p.montage)), PDF_STIJL.klein);
        pdfTekst(blad, vak.x + 228, y, p.maatBron || '-', PDF_STIJL.klein);
        y += 4.2;
      });

      y += 6;
      pdfTekst(blad, vak.x, y, 'Maatvoering', PDF_STIJL.kop); y += 6;
      pdfTekst(blad, vak.x, y, 'Binnenmaat ' + M.ruimte.b + ' × ' + M.ruimte.d +
        ' mm, hoogte ' + M.ruimte.h + ' mm, wanddikte ' + M.ruimte.wanddikte +
        ' mm.', PDF_STIJL.klein); y += 4.2;
      pdfTekst(blad, vak.x, y, 'Vrije doorgang ' + M.doorgang.breedte + ' mm in de breedte, ' +
        M.doorgang.diepte + ' mm in de diepte.', PDF_STIJL.klein); y += 4.2;
      window.NGTekening.WANDEN.forEach(function (w) {
        var v = M.tegel.verdeling[w] || {};
        pdfTekst(blad, vak.x, y, window.NGTekening.WANDNAAM[w] + ': ' +
          window.NGTekening.wandLengte(M.ruimte, w) + ' mm: ' + v.heleTegels +
          ' hele tegels, snijmaat ' + v.snijmaat + ' mm per zijde, ' + v.rijen +
          ' rijen.', PDF_STIJL.klein);
        y += 4.2;
      });

      y += 6;
      pdfTekst(blad, vak.x, y, 'Aannames en waarschuwingen', PDF_STIJL.kop); y += 6;
      (M.waarschuwingen || []).forEach(function (t) {
        pdfTekst(blad, vak.x, y, '! ' + t, PDF_STIJL.klein, { kleur: '#b4442f' });
        y += 4.2;
      });
      (M.aannames || []).forEach(function (t) {
        pdfTekst(blad, vak.x, y, '· ' + t, PDF_STIJL.klein);
        y += 4.2;
      });
      y += 4;
      pdfTekst(blad, vak.x, y, 'Deze tekening is een uitwerking van een online ' +
        'samenstelling. Maten die niet zijn ingemeten staan hierboven als aanname; ' +
        'ze zijn niet geschikt om op te bestellen of te zagen.', PDF_STIJL.klein);

      titelblok(blad, pagina, M, Object.assign({}, g,
        { blad: 'Productlijst en maatvoering', schaal: '-', paginanummer: g.paginas,
          papier: formaat + ' liggend' }));
    });

    return doc.uit();
  }

  function gebruikteSoorten(M) {
    var uit = [];
    M.installatie.forEach(function (i) { if (uit.indexOf(i.soort) < 0) uit.push(i.soort); });
    return uit;
  }

  /* --------------------------------------------------------------- bewaren */

  function bestand(inhoud, naam, type) {
    var data = type === 'application/pdf' ? window.NGBlad.naarBytes(inhoud) : inhoud;
    var blob = data instanceof Blob ? data : new Blob([data], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = naam;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function pdfUrl(inhoud) {
    var blob = new Blob([window.NGBlad.naarBytes(inhoud)], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }

  window.NGTekeningExport = {
    json: json, svg: svg, dxf: dxf, png: png, pdf: pdf,
    bestand: bestand, pdfUrl: pdfUrl, datumTekst: datumTekst,
    PAPIER: PAPIER, SCHALEN: SCHALEN, kiesSchaal: kiesSchaal
  };
})();
