/* Van het technische model naar een schaalvaste tekening.
 *
 * Het model weet de maten, deze module weet hoe je ze opschrijft. Die scheiding
 * is er met opzet: de PDF, de SVG op het scherm en de DXF lezen allemaal
 * hetzelfde model, dus ze kúnnen niet uiteenlopen. Wat hier gebeurt is
 * uitsluitend opmaak — waar de maatlijn staat, welke kant de tekst op wijkt als
 * hij niet past, hoe dik de contour is.
 *
 * Er wordt getekend op een blad (zie tekenblad.js) dat niet weet of er SVG of
 * PDF uit komt. Zo staat het tekenwerk één keer in de code en niet twee keer,
 * en kan een PDF geen andere maat tonen dan het scherm.
 *
 * SCHAALVAST. Er wordt getekend in millimeters van het werkelijke object.
 * Lijndiktes en teksthoogtes staan daarom óók in objectmillimeters: een tekst
 * van 62 mm komt er op 1:20 uit als ruim 3 mm, en dat is de hoogte die op een
 * A3 nog leesbaar is.
 *
 * NIET OVERLAPPEN. Een maatlijn met een tekst die over de buurmaat heen valt is
 * erger dan geen maatlijn, want je leest hem verkeerd in plaats van niet. Elke
 * tekst wordt daarom gemeten voordat hij wordt gezet, en past hij niet tussen
 * zijn streepjes, dan wijkt hij uit — om en om naar links en naar rechts, met
 * een verwijslijntje erbij.
 */
(function () {
  "use strict";

  /* Alles in objectmillimeters. Bij 1:20 op papier: deel door twintig. */
  var STIJL = {
    dun: 5, normaal: 9, dik: 18,
    tekst: 64, tekstKlein: 52, tekstGroot: 86,
    pijl: 34,                       // lengte van het maatstreepje
    band: [170, 430, 700],          // afstand van de contour per maatniveau (3, 2, 1)
    rijhoogte: 88,                  // hoeveel een uitgeweken maat opschuift
    marge: 260
  };

  var KLEUR = {
    contour: '#1d1a17', wand: '#c9c2b6', product: '#5d5852', productVul: '#efeae1',
    maat: '#8a6a3c', maatOnzeker: '#b4442f', vrij: '#7d968b', natte: '#7fa3c4',
    installatie: '#2f6f9e', tegel: '#e2dbcd', tekst: '#2a251f', selectie: '#c07a2a',
    licht: '#b9b2a6'
  };

  function tekstBreed(t, hoogte) { return window.NGBlad.tekstBreed(t, hoogte); }

  /* ---------------------------------------------------------- maatlijnen ---- */

  /* Eén maatlijn tussen twee punten op een rechte. `as` is 'x' of 'y'; `vast` is
     de andere coördinaat. Op een bouwtekening staan er schuine streepjes op de
     uiteinden en geen pijlpunten — dat leest sneller en het scheelt inkt. */
  function maatlijn(blad, as, vast, van, tot, waarde, o) {
    o = o || {};
    var kleur = o.onzeker ? KLEUR.maatOnzeker : KLEUR.maat;
    var h = o.klein ? STIJL.tekstKlein : STIJL.tekst;
    var lang = Math.abs(tot - van);
    var p = STIJL.pijl;
    var stijl = { kleur: kleur, dikte: STIJL.dun };

    var A = as === 'x' ? [van, vast] : [vast, van];
    var B = as === 'x' ? [tot, vast] : [vast, tot];
    blad.lijn(A[0], A[1], B[0], B[1], stijl);
    [A, B].forEach(function (q) {
      if (as === 'x') blad.lijn(q[0] - p / 2, q[1] - p / 2, q[0] + p / 2, q[1] + p / 2, stijl);
      else blad.lijn(q[0] - p / 2, q[1] + p / 2, q[0] + p / 2, q[1] - p / 2, stijl);
    });
    if (o.aanhaal) {
      var l = o.aanhaal, licht = { kleur: KLEUR.licht, dikte: STIJL.dun };
      if (as === 'x') {
        blad.lijn(A[0], vast, A[0], vast + (o.naarObject || 1) * l, licht);
        blad.lijn(B[0], vast, B[0], vast + (o.naarObject || 1) * l, licht);
      } else {
        blad.lijn(vast, A[1], vast + (o.naarObject || 1) * l, A[1], licht);
        blad.lijn(vast, B[1], vast + (o.naarObject || 1) * l, B[1], licht);
      }
    }

    /* Past de maat niet tussen zijn eigen streepjes, dan gaat hij een rij naar
       buiten in plaats van opzij. Opzij schuiven was de eerste ingeving en het
       werkte precies zolang er één krappe maat was: twee krappe maten naast
       elkaar weken naar elkaar toe en botsten alsnog. Naar buiten kan altijd,
       en de rij waarin hij belandt bepaalt de ketting. */
    var label = String(Math.round(waarde));
    var midden = (van + tot) / 2;
    var rij = o.rij || 0;
    var afstand = h * 0.45 + rij * STIJL.rijhoogte;

    if (as === 'x') {
      var ty = vast - afstand;
      if (rij) blad.lijn(midden, vast, midden, ty + h * 0.2,
                         { kleur: KLEUR.licht, dikte: STIJL.dun });
      blad.tekst(midden, ty, label, { hoogte: h, kleur: kleur });
    } else {
      var rx = vast - afstand;
      if (rij) blad.lijn(vast, midden, rx + h * 0.2, midden,
                         { kleur: KLEUR.licht, dikte: STIJL.dun });
      blad.tekst(rx, midden, label, { hoogte: h, kleur: kleur, draai: -90 });
    }
  }

  /* Een ketting maatlijnen op één hoogte.

     Elke tekst krijgt een rij toegewezen: rij 0 is op de maatlijn zelf, en past
     hij daar niet, dan de laagste rij daarboven waar hij zijn buurman niet
     raakt. Dat is de enige aanpak die ook standhoudt bij drie smalle maten op
     rij — uitwijken naar links en rechts niet, want dan botsen ze in het
     midden. Wat er uitkomt leest van dichtbij naar veraf: brede maten op de
     lijn, krappe maten erboven met een streepje naar hun plek. */
  function ketting(blad, as, vast, segmenten, o) {
    o = o || {};
    var h = o.klein ? STIJL.tekstKlein : STIJL.tekst;
    var eind = [];                 // per rij: waar de vorige tekst ophield
    segmenten.forEach(function (seg) {
      var lang = Math.abs(seg.tot - seg.van);
      var label = String(Math.round(seg.waarde));
      var breed = tekstBreed(label, h);
      var midden = (seg.van + seg.tot) / 2;
      var van = midden - breed / 2 - 30, tot = midden + breed / 2 + 30;
      var rij = 0;
      if (breed + 70 >= lang) {
        rij = 1;
        while (eind[rij] != null && eind[rij] > van) rij++;
      }
      eind[rij] = tot;
      maatlijn(blad, as, vast, seg.van, seg.tot, seg.waarde, {
        klein: o.klein, onzeker: seg.onzeker, rij: rij,
        aanhaal: o.aanhaal, naarObject: o.naarObject
      });
    });
  }

  /* -------------------------------------------------------- de plattegrond -- */

  /** Hoeveel ruimte de plattegrond inneemt, inclusief maatlijnen.

      De maatlijnen staan links en boven, dus daar is ruimte nodig; rechts en
      onder niet. Dat scheelt bijna anderhalve meter tekenpapier, en die anderhalve
      meter is precies het verschil tussen 1:50 en 1:25 op een A4 — tussen een
      tekening waarop je de artikelnummers niet kunt lezen en een die werkt. */
  function plattegrondKader(M, opties) {
    var o = opties || {};
    var R = M.ruimte;
    var kaal = (o.maatlijnen === false);
    var voor = kaal ? STIJL.marge : STIJL.band[2] + 190;
    var na = STIJL.marge;
    return { x: -voor, y: -voor, b: R.b + voor + na, h: R.d + voor + na };
  }

  /* De omtrek van de plattegrond, w naar buiten geschoven — de rechthoek van
     vroeger is hier het geval zonder hap. Voor een rechtlijnige veelhoek werkt
     hetzelfde recept op elke hoek, of hij nu convex is (zeven van de acht) of
     de ene concave binnenhoek van de hap: elke hoek schuift op met de som van
     de naar-buiten-normalen van zijn twee aanliggende randen. Bij haakse
     randen is die normaal simpelweg de rand 90° gedraaid, dus (dx,dy) wordt
     (dy,-dx) — geen algemene hoekberekening nodig, en dus ook geen risico dat
     een miter bij de concave hoek de verkeerde kant op wijst. */
  function naarBuiten(polygoon, w) {
    var n = polygoon.length;
    return polygoon.map(function (pt, i) {
      var vorig = polygoon[(i - 1 + n) % n], volgend = polygoon[(i + 1) % n];
      var eIn = [pt[0] - vorig[0], pt[1] - vorig[1]];
      var eUit = [volgend[0] - pt[0], volgend[1] - pt[1]];
      var nIn = [eIn[1], -eIn[0]], nUit = [eUit[1], -eUit[0]];
      var norm = function (v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
      var a = norm(nIn), b = norm(nUit);
      return [pt[0] + w * (a[0] + b[0]), pt[1] + w * (a[1] + b[1])];
    });
  }

  function tekenPlattegrond(blad, M, opties) {
    var o = opties || {};
    var toonMaten = o.maatlijnen !== false;
    var toonInst = !!o.installatie;
    var toonVrij = o.vrijeRuimte !== false;
    var R = M.ruimte;
    var w = R.wanddikte;
    var vloer = window.NGTekening.vloerPolygoon(R);

    /* De wanden als omranding. De binnenmaat is wat telt, dus de wand groeit
       naar buiten: wie op de tekening de binnenmaat afmeet krijgt de
       binnenmaat, en niet de binnenmaat plus een halve steen. Bij een
       rechthoek is dit twee rechthoeken; bij een L-vorm zijn het twee
       veelhoeken met dezelfde vorm, de buitenste w naar buiten geschoven. */
    blad.veelhoek(naarBuiten(vloer, w),
                  { vul: KLEUR.wand, kleur: KLEUR.contour, dikte: STIJL.normaal });
    blad.veelhoek(vloer, { vul: '#ffffff', kleur: KLEUR.contour, dikte: STIJL.dik });

    // natte zones onderop, als een lichte vulling
    (M.natteZones || []).forEach(function (z) {
      blad.rect(z.vlak, { vul: '#eaf1f7' });
    });

    if (toonVrij) {
      blad.groep('class="tk-vrij"');
      M.vrij.forEach(function (v) {
        blad.rect(v.vlak, { kleur: KLEUR.vrij, dikte: STIJL.dun,
                            streep: [STIJL.dun * 6, STIJL.dun * 5] });
        blad.tekst((v.vlak.x0 + v.vlak.x1) / 2, (v.vlak.y0 + v.vlak.y1) / 2,
                   'vrij ' + v.eis, { hoogte: STIJL.tekstKlein, kleur: KLEUR.vrij });
      });
      blad.eindGroep();
    }

    /* De producten. Contour, artikelnummer, naam en de eigen maat. Past het niet
       in het vlak, dan een genummerd puntje dat naar de productlijst wijst —
       liever een verwijzing dan een tekst die over de contour heen kruipt. */
    blad.groep('class="tk-producten"');
    M.producten.forEach(function (p) {
      if (!p.vlak) return;
      var gekozen = o.selectie === p.sleutel;
      blad.groep('class="tk-product" data-product="' + p.sleutel + '"' +
                 (p.pid ? ' data-pid="' + p.pid + '"' : ''));
      blad.rect(p.vlak, { vul: KLEUR.productVul,
                          kleur: gekozen ? KLEUR.selectie : KLEUR.product,
                          dikte: gekozen ? STIJL.dik : STIJL.normaal });
      var bx = (p.vlak.x0 + p.vlak.x1) / 2, by = (p.vlak.y0 + p.vlak.y1) / 2;
      var breed = p.vlak.x1 - p.vlak.x0, diep = p.vlak.y1 - p.vlak.y0;
      var regels = [p.pid || 'geen artikelnummer', p.naam,
                    Math.round(p.breedte) + ' × ' + Math.round(p.diepte)];
      var past = breed > tekstBreed(regels[1], STIJL.tekstKlein) + 80 &&
                 diep > STIJL.tekstKlein * 4;
      if (past) {
        regels.forEach(function (r, i) {
          blad.tekst(bx, by + (i - 1) * STIJL.tekstKlein * 1.3, r,
                     { hoogte: STIJL.tekstKlein, kleur: i === 0 ? KLEUR.maat : KLEUR.tekst });
        });
      } else {
        blad.cirkel(bx, by, STIJL.tekstKlein * .62, { vul: KLEUR.maat });
        blad.tekst(bx, by + STIJL.tekstKlein * .3,
                   String(p.pid || '?').replace('BTH-', '').replace(/^0+/, ''),
                   { hoogte: STIJL.tekstKlein * .8, kleur: '#ffffff' });
      }
      blad.eindGroep();
    });
    blad.eindGroep();

    /* Deuren en ramen. Een deur is een gat in de wand plus het blad plus de
       cirkel die het blad beschrijft; zonder die cirkel weet je niet of hij
       tegen de wastafel aan slaat, en dat is nu juist wat je wilt weten. */
    blad.groep('class="tk-openingen"');
    M.openingen.forEach(function (op) {
      var her = op.herkomst || {};
      var onzeker = her.hart !== 'ingevoerd' || her.breedte !== 'ingevoerd';
      var kleur = onzeker ? KLEUR.maatOnzeker : KLEUR.contour;
      var g = { x0: op.vlak.x0, y0: op.vlak.y0, x1: op.vlak.x1, y1: op.vlak.y1 };
      if (op.wand === 'achter') { g.y0 = -w; g.y1 = 0; }
      else if (op.wand === 'voor') { g.y0 = R.d; g.y1 = R.d + w; }
      else if (op.wand === 'links') { g.x0 = -w; g.x1 = 0; }
      else { g.x0 = R.b; g.x1 = R.b + w; }
      blad.rect(g, { vul: '#ffffff', kleur: kleur, dikte: STIJL.normaal,
                     streep: onzeker ? [STIJL.dun * 8, STIJL.dun * 6] : null });
      if (op.soort === 'raam') {
        if (op.wand === 'achter' || op.wand === 'voor') {
          var ym = (g.y0 + g.y1) / 2;
          blad.lijn(g.x0, ym, g.x1, ym, { kleur: kleur, dikte: STIJL.dun });
        } else {
          var xm = (g.x0 + g.x1) / 2;
          blad.lijn(xm, g.y0, xm, g.y1, { kleur: kleur, dikte: STIJL.dun });
        }
      }
    });
    (M.draaicirkels || []).forEach(function (c) {
      var pt = c.punt, r = c.straal, binnen = c.naarBinnen;
      var nx = { achter: [0, 1], voor: [0, -1], links: [1, 0], rechts: [-1, 0] }[c.wand];
      var lx = { achter: [1, 0], voor: [-1, 0], links: [0, 1], rechts: [0, -1] }[c.wand];
      var teken = c.richting === 'rechts' ? -1 : 1;
      var kx = pt.x + lx[0] * r * teken, ky = pt.y + lx[1] * r * teken;
      var bx = pt.x + nx[0] * r * (binnen ? 1 : -1), by = pt.y + nx[1] * r * (binnen ? 1 : -1);
      blad.lijn(pt.x, pt.y, bx, by, { kleur: KLEUR.contour, dikte: STIJL.normaal });
      blad.boog(kx, ky, bx, by, r, false, teken * (binnen ? 1 : -1) > 0,
                { kleur: KLEUR.licht, dikte: STIJL.dun,
                  streep: [STIJL.dun * 5, STIJL.dun * 4] });
    });
    blad.eindGroep();

    if (toonInst) tekenInstallatie(blad, M);

    /* De maatvoering, in drie schillen om de ruimte heen. Productmaten het
       dichtst bij de tekening, de totaalmaat het verst weg — dan leest het van
       binnen naar buiten, van detail naar geheel, zoals een uitvoerder kijkt. */
    if (toonMaten) {
      blad.groep('class="tk-maten"');
      var b3 = -STIJL.band[0], b2 = -STIJL.band[1], b1 = -STIJL.band[2];

      // niveau 3: de producten langs de achterwand, met hun eigen maat
      ketting(blad, 'x', b3, M.maten.plattegrond.filter(function (m) {
        return m.niveau === 3 && m.wand === 'achter';
      }), { klein: true, aanhaal: 90 });

      // niveau 2: de ketting langs de achterwand en langs de linkerwand
      ketting(blad, 'x', b2, M.maten.plattegrond.filter(function (m) {
        return m.niveau === 2 && m.wand === 'achter';
      }), { aanhaal: 90 });
      ketting(blad, 'y', b2, M.maten.plattegrond.filter(function (m) {
        return m.niveau === 2 && m.wand === 'links';
      }), { aanhaal: 90 });

      // niveau 1: de binnenmaten
      maatlijn(blad, 'x', b1, 0, R.b, R.b, { aanhaal: 90 });
      maatlijn(blad, 'y', b1, 0, R.d, R.d, { aanhaal: 90 });
      blad.eindGroep();
    }

    /* Een noordpijl heeft in een badkamer geen betekenis — er is geen buiten om
       je op te richten. Wat wél oriënteert is de deur, dus die wijzen we aan. */
    var deur = M.openingen.filter(function (x) { return x.soort === 'deur'; })[0];
    if (deur) {
      var dp = window.NGTekening.opWand(R, deur.wand, deur.hart, 0);
      var dy = deur.wand === 'voor' ? 300 : (deur.wand === 'achter' ? -190 : 0);
      var dx = deur.wand === 'links' ? -190 : (deur.wand === 'rechts' ? 190 : 0);
      blad.tekst(dp.x + dx, dp.y + dy, 'entree',
                 { hoogte: STIJL.tekstKlein, kleur: KLEUR.contour });
    }
    return plattegrondKader(M, o);
  }

  /* --------------------------------------------------------- wandaanzicht -- */

  /* Bij een wandaanzicht staan de hoogtematen links en de lengtematen onder,
     plus de onder-/bovenkantlabels rechts van de tekening. */
  /* Waar valt een rechthoek uit de plattegrond op een wand, uitgedrukt in de
     lengterichting van die wand? Raakt hij de wand niet, dan niets. */
  /** Het zichtbare stuk van deze wand: bij een gewone rechthoek de hele
      lengte, bij een L-vorm het stuk vóór de hap. Alle drie de functies
      hieronder gebruiken hem, dus staat hij hier één keer. */
  function wandZichtbaar(M, wand) {
    var info = (M.wanden || []).filter(function (x) { return x.naam === wand; })[0];
    return (info && info.zichtbaar) || [0, window.NGTekening.wandLengte(M.ruimte, wand)];
  }

  function opWandBereik(R, wand, v, zichtbaar) {
    var a, b;
    if (wand === 'achter') { if (v.y0 > 300) return null; a = v.x0; b = v.x1; }
    else if (wand === 'voor') { if (v.y1 < R.d - 300) return null; a = R.b - v.x1; b = R.b - v.x0; }
    else if (wand === 'links') { if (v.x0 > 300) return null; a = v.y0; b = v.y1; }
    else { if (v.x1 < R.b - 300) return null; a = v.y0; b = v.y1; }
    var z = zichtbaar || [0, window.NGTekening.wandLengte(R, wand)];
    var u0 = Math.max(z[0], Math.min(a, b)), u1 = Math.min(z[1], Math.max(a, b));
    return u1 > u0 ? [u0, u1] : null;
  }

  function wandKader(M, wand, opties) {
    var o = opties || {};
    var R = M.ruimte;
    var z = wandZichtbaar(M, wand);
    var lang = z[1] - z[0];
    var kaal = (o.maatlijnen === false);
    /* Onder het aanzicht staan twee maatlijnen en niet drie: de ketting en de
       totale wandbreedte. Ze mogen dus dichter bij elkaar dan bij de
       plattegrond — en dat scheelt precies de schaalstap tussen 1:50 en 1:25,
       waarmee de artikelnummers weer leesbaar worden. */
    var links = kaal ? STIJL.marge : STIJL.band[1] + 190;
    var boven = STIJL.marge;
    var rechts = kaal ? STIJL.marge : 900;
    var onder = kaal ? STIJL.marge : STIJL.band[1] + 190;
    return { x: -links, y: -boven, b: lang + links + rechts, h: R.h + boven + onder };
  }

  function tekenWandaanzicht(blad, M, wand, opties) {
    var o = opties || {};
    var toonMaten = o.maatlijnen !== false;
    var toonInst = !!o.installatie;
    var R = M.ruimte;
    var zBereik = wandZichtbaar(M, wand);
    /* Het aanzicht tekent in lokale coördinaten die bij 0 beginnen op het
       zichtbare begin van de wand — niet noodzakelijk de achterhoek van de
       héle wand. Bij een rechthoek is dat hetzelfde punt; bij een L-vorm
       begint het aanzicht waar de hap ophoudt. `V()` rekent een wereldpositie
       (dezelfde die producten en openingen al gebruiken) om naar die lokale
       as, zodat er verder in deze functie niets hoeft te veranderen. */
    var zOffset = zBereik[0];
    var V = function (l) { return l - zOffset; };
    var lang = zBereik[1] - zBereik[0], hoog = R.h;
    var Y = function (v) { return hoog - v; };     // hoogte omklappen: 0 is de vloer

    blad.rect({ x0: 0, y0: 0, x1: lang, y1: hoog },
              { vul: '#ffffff', kleur: KLEUR.contour, dikte: STIJL.dik });

    /* Bij een afgesneden wand staat er een haakse markering op het einde: een
       streep die laat zien dat de wand hier niet ophoudt met de kamer, maar
       een hoek om gaat. Zonder dat teken lijkt een verkorte wand een wand die
       gewoon korter is — en dat is niet wat er aan de hand is. */
    var wandInfo = (M.wanden || []).filter(function (x) { return x.naam === wand; })[0];
    if (wandInfo && wandInfo.afgesneden) {
      var volleLang = wandInfo.lengte;
      var opEinde = zBereik[1] >= volleLang - 1;   // het zichtbare stuk eindigt bij de hap
      var kx = opEinde ? lang : 0;
      for (var hh = 0; hh < hoog; hh += 220) {
        blad.lijn(kx, Y(hh), kx + (opEinde ? 1 : -1) * 140, Y(hh + 140),
                  { kleur: KLEUR.licht, dikte: STIJL.dun });
      }
      blad.tekst(kx + (opEinde ? -1 : 1) * 40, Y(hoog * .5), 'hap, zie plattegrond',
                 { hoogte: STIJL.tekstKlein, kleur: KLEUR.licht,
                   anker: opEinde ? 'end' : 'start', draai: -90 });
    }

    /* De natte zone eerst, anders dekt hij het tegelwerk af. En alleen over de
       breedte waar hij werkelijk ligt: de hele wand blauw maken suggereert dat
       er van hoek tot hoek gekimd moet worden, en dat is een dure suggestie. */
    (M.natteZones || []).forEach(function (z) {
      var u = opWandBereik(R, wand, z.vlak, zBereik);
      if (!u) return;
      blad.rect({ x0: V(u[0]), y0: Y(z.hoogte), x1: V(u[1]), y1: Y(0) }, { vul: '#eaf1f7' });
    });

    /* De tegelverdeling. De eerste hele tegel ligt in het midden van de wand,
       zodat de snijmaat links en rechts gelijk is — dat is het getal waar een
       tegelzetter naar zoekt en dat op geen enkele offerte staat. */
    var t = M.tegel;
    blad.groep('class="tk-tegels"');
    var stap = t.breedte + t.voeg;
    var start = lang / 2 - Math.floor((lang / 2) / stap) * stap - t.breedte / 2;
    for (var x = start; x < lang; x += stap) {
      if (x > 1) blad.lijn(x, Y(hoog), x, Y(0), { kleur: KLEUR.tegel, dikte: STIJL.dun });
    }
    var vstap = t.hoogte + t.voeg;
    for (var yy = vstap; yy < hoog; yy += vstap) {
      blad.lijn(0, Y(yy), lang, Y(yy), { kleur: KLEUR.tegel, dikte: STIJL.dun });
    }
    blad.eindGroep();


    blad.groep('class="tk-openingen"');
    M.openingen.forEach(function (op) {
      if (op.wand !== wand) return;
      var her = op.herkomst || {};
      var onzeker = her.hart !== 'ingevoerd' || her.breedte !== 'ingevoerd';
      var u0 = V(op.hart - op.breedte / 2), u1 = V(op.hart + op.breedte / 2);
      var v0 = op.soort === 'raam' ? op.borstwering : 0;
      var v1 = v0 + op.hoogte;
      blad.rect({ x0: u0, y0: Y(v1), x1: u1, y1: Y(v0) },
                { vul: '#f7f5f1', kleur: onzeker ? KLEUR.maatOnzeker : KLEUR.contour,
                  dikte: STIJL.normaal,
                  streep: onzeker ? [STIJL.dun * 8, STIJL.dun * 6] : null });
      blad.tekst((u0 + u1) / 2, Y(v1) - STIJL.tekstKlein * .6,
                 (op.soort === 'deur' ? 'deur ' : 'raam ') + op.breedte + '×' + op.hoogte,
                 { hoogte: STIJL.tekstKlein,
                   kleur: onzeker ? KLEUR.maatOnzeker : KLEUR.tekst });
    });
    blad.eindGroep();

    /* De producten op deze wand, op hun montagehoogte. Dit is waar het aanzicht
       voor bestaat: op de plattegrond zie je waar iets staat, hier hoe hoog. */
    var hoogtelabels = [];
    blad.groep('class="tk-producten"');
    M.producten.forEach(function (p) {
      if (p.wand !== wand) return;
      var gekozen = o.selectie === p.sleutel;
      var u0 = V(p.hart - p.breedte / 2), u1 = V(p.hart + p.breedte / 2);
      var v0 = p.montage, v1 = p.montage + p.hoogte;
      blad.groep('class="tk-product" data-product="' + p.sleutel + '"' +
                 (p.pid ? ' data-pid="' + p.pid + '"' : ''));
      blad.rect({ x0: u0, y0: Y(v1), x1: u1, y1: Y(v0) },
                { vul: KLEUR.productVul, kleur: gekozen ? KLEUR.selectie : KLEUR.product,
                  dikte: gekozen ? STIJL.dik : STIJL.normaal });
      if (u1 - u0 > tekstBreed(p.naam, STIJL.tekstKlein) + 60 && v1 - v0 > STIJL.tekstKlein * 3) {
        blad.tekst((u0 + u1) / 2, Y((v0 + v1) / 2) - STIJL.tekstKlein * .2,
                   p.pid || '', { hoogte: STIJL.tekstKlein, kleur: KLEUR.maat });
        blad.tekst((u0 + u1) / 2, Y((v0 + v1) / 2) + STIJL.tekstKlein, p.naam,
                   { hoogte: STIJL.tekstKlein, kleur: KLEUR.tekst });
      }
      blad.eindGroep();
      if (toonMaten) {
        // verzamelen, niet meteen tekenen: ze moeten straks als groep uit
        // elkaar geduwd worden
        hoogtelabels.push({ h: v0, u: u1, tekst: 'ok ' + Math.round(v0) });
        hoogtelabels.push({ h: v1, u: u1, tekst: 'bk ' + Math.round(v1) });
      }
    });
    blad.eindGroep();

    /* De onder- en bovenkanten, rechts naast de tekening. Ze staan op hun eigen
       hoogte tenzij ze te dicht op elkaar komen — en dat gebeurt niet alleen bij
       een laag product, maar ook tussen twee producten die toevallig vlak boven
       elkaar eindigen. Daarom worden ze als één rij behandeld en van onder naar
       boven uit elkaar geduwd, met een knik in het verwijslijntje naar hun
       werkelijke hoogte. */
    if (hoogtelabels.length) {
      var ruim = STIJL.tekstKlein * 1.7;
      hoogtelabels.sort(function (a, b) { return a.h - b.h; });
      var vorige = -1e9;
      hoogtelabels.forEach(function (e) {
        e.plek = Math.max(e.h, vorige + ruim);
        vorige = e.plek;
      });
      hoogtelabels.forEach(function (e) {
        blad.lijn(e.u, Y(e.h), lang + 60, Y(e.h), { kleur: KLEUR.licht, dikte: STIJL.dun });
        if (Math.abs(e.plek - e.h) > 1) {
          blad.lijn(lang + 60, Y(e.h), lang + 95, Y(e.plek),
                    { kleur: KLEUR.licht, dikte: STIJL.dun });
        }
        blad.tekst(lang + 110, Y(e.plek) + STIJL.tekstKlein * .35, e.tekst,
                   { hoogte: STIJL.tekstKlein, kleur: KLEUR.maat, anker: 'start' });
      });
    }

    if (toonInst) {
      blad.groep('class="tk-installatie"');
      M.installatie.forEach(function (i) {
        if (i.wand !== wand || i.bij === 'plafond') return;
        symbool(blad, V(i.l), Y(i.hoogte), i.soort);
      });
      blad.eindGroep();
    }

    if (toonMaten) {
      blad.groep('class="tk-maten"');
      /* De plattegrondketting staat in wereldcoördinaten (dezelfde die de
         plattegrond gebruikt) en kan bij een L-vorm ook het stuk van de hap
         zelf bevatten — dat hoort hier niet, dit aanzicht toont alleen het
         zichtbare deel van de wand. Uitsluiten en verschuiven naar de lokale
         as, in plaats van een tweede berekening. */
      var kettingSegmenten = M.maten.plattegrond.filter(function (m) {
        return m.niveau === 2 && m.wand === wand &&
               m.van >= zBereik[0] - 1 && m.tot <= zBereik[1] + 1;
      }).map(function (m) {
        return Object.assign({}, m, { van: V(m.van), tot: V(m.tot) });
      });
      ketting(blad, 'x', hoog + STIJL.band[0], kettingSegmenten,
              { aanhaal: -90, naarObject: -1 });
      maatlijn(blad, 'x', hoog + STIJL.band[1], 0, lang, lang, { aanhaal: -90, naarObject: -1 });
      maatlijn(blad, 'y', -STIJL.band[1], 0, hoog, hoog,
               { onzeker: M.herkomst.hoogte !== 'ingevoerd', aanhaal: 90 });
      blad.eindGroep();
    }
    return wandKader(M, wand, o);
  }

  /* ------------------------------------------------------ installatielaag -- */

  /* Herkenbare symbolen, en herkenbaar betekent: onderling verschillend van
     vórm, niet alleen van kleur. Een tekening wordt zwart-wit uitgeprint en dan
     is een blauwe stip niet te onderscheiden van een rode. */
  function symbool(blad, x, y, soort) {
    var r = 46, k = KLEUR.installatie;
    var rand = { kleur: k, dikte: STIJL.normaal, vul: '#ffffff' };
    blad.groep('class="tk-inst" data-soort="' + soort + '"');
    if (soort === 'koudwater') {
      blad.cirkel(x, y, r, rand);
      blad.lijn(x - r * .5, y, x + r * .5, y, { kleur: k, dikte: STIJL.normaal });
    } else if (soort === 'warmwater') {
      blad.cirkel(x, y, r, rand);
      blad.lijn(x - r * .5, y, x + r * .5, y, { kleur: k, dikte: STIJL.normaal });
      blad.lijn(x, y - r * .5, x, y + r * .5, { kleur: k, dikte: STIJL.normaal });
    } else if (soort === 'afvoer') {
      blad.cirkel(x, y, r, rand);
      blad.cirkel(x, y, r * .45, { vul: k });
    } else if (soort === 'wcd') {
      blad.rect({ x0: x - r, y0: y - r, x1: x + r, y1: y + r }, rand);
      blad.lijn(x - r * .45, y, x + r * .45, y, { kleur: k, dikte: STIJL.normaal });
    } else if (soort === 'lichtpunt') {
      blad.cirkel(x, y, r, rand);
      blad.lijn(x - r * .7, y - r * .7, x + r * .7, y + r * .7, { kleur: k, dikte: STIJL.dun });
      blad.lijn(x - r * .7, y + r * .7, x + r * .7, y - r * .7, { kleur: k, dikte: STIJL.dun });
    } else {
      blad.rect({ x0: x - r, y0: y - r * .6, x1: x + r, y1: y + r * .6 }, rand);
    }
    blad.eindGroep();
  }

  function tekenInstallatie(blad, M) {
    var R = M.ruimte;
    blad.groep('class="tk-installatie"');
    M.installatie.forEach(function (i) {
      if (i.bij === 'plafond') return;              // die hoort in het plafondplan
      // een aansluitpunt zit in de wand, niet middenin het product ervoor
      var p = window.NGTekening.opWand(R, i.wand, i.l, 55);
      symbool(blad, p.x, p.y, i.soort);
    });
    blad.eindGroep();
  }

  var LEGENDA_NAAM = {
    koudwater: 'Koud water', warmwater: 'Warm water', afvoer: 'Afvoer',
    wcd: 'Wandcontactdoos', lichtpunt: 'Lichtpunt',
    radiatoraansluiting: 'Radiator- of elektrische aansluiting'
  };

  /* De legenda hoort bij de installatielaag: zonder legenda is een symbool een
     vlekje. */
  function tekenLegenda(blad, soorten, x, y) {
    var lijst = soorten && soorten.length ? soorten : Object.keys(LEGENDA_NAAM);
    var ry = y;
    lijst.forEach(function (k) {
      symbool(blad, x + 70, ry, k);
      blad.tekst(x + 190, ry + STIJL.tekstKlein * .35, LEGENDA_NAAM[k] || k,
                 { hoogte: STIJL.tekstKlein, kleur: KLEUR.tekst, anker: 'start' });
      ry += 150;
    });
    return ry - y;
  }

  /* ------------------------------------------------------- hoogtestaat ---- */

  /* De Nederlandse standaardhoogtes naast wat er op deze tekening staat. Hoort
     bij de plattegrond en niet bij een los blaadje: wie op de bouw de
     plattegrond in handen heeft, moet deze getallen daar zien staan.

     Kolommen: onderdeel, wat de tekening aanhoudt, wat gebruikelijk is, de
     bron. De bron staat erbij omdat "gebruikelijk" zonder herkomst niets waard
     is — dan is het mijn mening tegen die van de installateur. */
  var HKOLOM = [2600, 900, 1100, 1700];       // kolombreedtes in objectmillimeters
  var HRIJ = 150;

  function tekenHoogtetabel(blad, M, x, y) {
    var rijen = M.hoogtes || [];
    var breed = HKOLOM.reduce(function (a, b) { return a + b; }, 0);
    var kop = ['Onderdeel', 'Tekening', 'NL gebruikelijk', 'Bron'];
    var ry = y;

    blad.tekst(x, ry, 'Montage- en aansluithoogtes',
               { hoogte: STIJL.tekst, kleur: KLEUR.tekst, anker: 'start' });
    ry += 80;
    blad.tekst(x, ry, 'Alle maten in mm vanaf de afgewerkte vloer. Gebruikelijke ' +
               'waarden, geen norm.',
               { hoogte: STIJL.tekstKlein, kleur: KLEUR.licht, anker: 'start' });
    ry += 110;

    /* De kop staat op zijn eigen regel met een lijn eronder; zonder die lijn
       leest de eerste rij als onderdeel van de kop. */
    var kx = x;
    kop.forEach(function (t, i) {
      blad.tekst(kx, ry, t, { hoogte: STIJL.tekstKlein, kleur: KLEUR.tekst, anker: 'start' });
      kx += HKOLOM[i];
    });
    ry += 40;
    blad.lijn(x, ry, x + breed, ry, { kleur: KLEUR.contour, dikte: STIJL.normaal });

    rijen.forEach(function (r) {
      ry += HRIJ;
      /* Een afwijking krijgt de kleur die de rest van de tekening voor een
         onzekere maat gebruikt. Eén betekenis, één kleur — een tweede rode
         tint zou de lezer laten raden of het iets anders betekent. */
      var kleur = r.status === 'afwijkend' ? KLEUR.maatOnzeker
                : r.status === 'nvt' ? KLEUR.licht : KLEUR.tekst;
      var cel = [
        r.naam,
        r.toegepast == null ? 'niet in deze badkamer' : String(r.toegepast),
        r.van + '–' + r.tot,
        r.bron
      ];
      var cx = x;
      cel.forEach(function (t, i) {
        blad.tekst(cx, ry, t, { hoogte: STIJL.tekstKlein, kleur: kleur, anker: 'start' });
        cx += HKOLOM[i];
      });
      blad.lijn(x, ry + 44, x + breed, ry + 44, { kleur: KLEUR.tegel, dikte: STIJL.dun });
    });

    ry += 120;
    blad.tekst(x, ry, 'Rood = wijkt af van de gebruikelijke maat. Grijs = dit ' +
               'onderdeel zit niet in deze badkamer.',
               { hoogte: STIJL.tekstKlein, kleur: KLEUR.licht, anker: 'start' });
    return { x: x, y: y - 80, b: breed, h: ry - y + 200 };
  }

  function hoogtetabel(M) {
    var blad = window.NGBlad.svg();
    var k = tekenHoogtetabel(blad, M, 0, 120);
    return window.NGBlad.svgOmhulsel(blad, -60, 0, k.b + 120, k.h + 160,
                                     { klasse: 'tk-svg' });
  }

  /* ------------------------------------------------------------ voor het scherm */

  function plattegrond(M, opties) {
    var blad = window.NGBlad.svg();
    var kader = tekenPlattegrond(blad, M, opties);
    return window.NGBlad.svgOmhulsel(blad, kader.x, kader.y, kader.b, kader.h,
                                     { schaal: (opties || {}).schaal, klasse: 'tk-svg' });
  }

  function wandaanzicht(M, wand, opties) {
    var blad = window.NGBlad.svg();
    var kader = tekenWandaanzicht(blad, M, wand, opties);
    return window.NGBlad.svgOmhulsel(blad, kader.x, kader.y, kader.b, kader.h,
                                     { schaal: (opties || {}).schaal, klasse: 'tk-svg' });
  }

  function legenda(soorten) {
    var blad = window.NGBlad.svg();
    var h = tekenLegenda(blad, soorten, 0, 80);
    return window.NGBlad.svgOmhulsel(blad, 0, 0, 1900, h + 120, { klasse: 'tk-svg' });
  }

  window.NGTekeningSVG = {
    plattegrond: plattegrond, wandaanzicht: wandaanzicht, legenda: legenda,
    hoogtetabel: hoogtetabel, tekenHoogtetabel: tekenHoogtetabel,
    tekenPlattegrond: tekenPlattegrond, tekenWandaanzicht: tekenWandaanzicht,
    tekenLegenda: tekenLegenda, plattegrondKader: plattegrondKader,
    wandKader: wandKader, LEGENDA_NAAM: LEGENDA_NAAM,
    STIJL: STIJL, KLEUR: KLEUR, tekstBreed: tekstBreed
  };
})();
