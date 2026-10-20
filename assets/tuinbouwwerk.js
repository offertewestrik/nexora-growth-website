/* Tekeningen voor open tuinbouwwerken: overkappingen en poolhouses.
 *
 * WAAROM DIT EEN EIGEN MOTOR IS
 * bouwaanzichten.js tekent een gesloten, geïsoleerd gebouw met een plat dak.
 * Een overkapping heeft geen wanden, geen isolatie en geen Rc-waarde, en
 * allebei kunnen ze een zadeldak of een lessenaarsdak hebben. Diezelfde motor
 * hergebruiken zou een tekening opleveren met een gevelopbouw die er niet is
 * en een plat dak dat niet gekozen is — precies het soort tekening waar deze
 * hele module tegen bedoeld is.
 *
 * Wat een tuinbouwwerk wél heeft is een stramien: staanders, liggers,
 * gordingen en een dakvlak met een echte helling. Dat is wat hier getekend
 * wordt, en dat is ook waar de aannemer naar kijkt.
 *
 * HET UITERLIJK KOMT UIT bouwaanzichten.js
 * Maatlijnen, peilmerken, schaalbalken en de bladopmaak worden daar geleend
 * (`NGBouwAanzichten.gereedschap`). Twee kopieën van een maatlijn zien er na
 * de eerste aanpassing anders uit, en dan horen twee bladen in hetzelfde
 * dossier niet meer bij elkaar.
 *
 * AANSLUITEN
 *   window.NGTekenMotor = NGTuinbouwwerk;
 *   window.NGTekenBron  = function () { ...vertaal de keuzes naar cfg... };
 */
(function (global) {
  'use strict';

  function G() { return global.NGBouwAanzichten && global.NGBouwAanzichten.gereedschap; }

  /* De houtkleuren op de tekening. Alleen de kleur: de naam en de prijs staan
     in de configurator zelf, en die hoort maar op één plek te staan. */
  var HOUT = {
    douglas:    { kleur: '#C9A87C' },
    eiken:      { kleur: '#B08D57' },
    lariks:     { kleur: '#D2B48C' },
    grenen:     { kleur: '#DCC49A' },
    thermohout: { kleur: '#8B6B4A' }
  };
  /* Dezelfde codes als de keuzelijsten van beide configurators gebruiken. */
  var DAKNAAM = {
    platdak: 'Plat dak', zadeldak: 'Zadeldak', lessenaars: 'Lessenaarsdak',
    schuindak: 'Schuin dak', groendak: 'Groendak',
    lamellen: 'Lamellendak', glasdak: 'Glasdak', polycarbonaat: 'Polycarbonaatdak'
  };

  /* ------------------------------------------------------------- lezen --- */

  /* De maten, profielen en hoogtes komen NIET uit dit bestand. Ze komen uit
     `NGTekeningenHout.model()`, hetzelfde model waar het technische
     tekeningenpakket op deze pagina's mee rekent.

     Dat is geen luiheid maar de kern: dat model weet dat een aluminium
     overkapping op alleen hoekstaanders zes meter overspant en een houten
     niet, dat een lamellendak een systeemhoogte van 2,63 m heeft, en dat een
     aan de muur gemonteerde uitvoering alleen staanders aan de voorzijde
     krijgt. Die kennis hier overschrijven levert twee waarheden op in één
     dossier — en dan noemt het ene blad een staander van 120 mm waar het
     andere er 150 tekent. */
  function lees(cfg) {
    cfg = cfg || {};
    var product = cfg.product === 'poolhouse' ? 'poolhouse' : 'overkapping';
    var H = global.NGTekeningenHout;
    var m = H && H.model ? H.model(product, cfg.sel || {}) : null;
    if (!m) {
      /* Zonder dat pakket is er geen model, en dan wordt er niets verzonnen. */
      return { ontbreekt: true, soort: product,
               typeNaam: product === 'poolhouse' ? 'Poolhouse' : 'Overkapping' };
    }
    var maatwerk = String((cfg.sel || {}).afm || '') === 'maatwerk';
    var helling = m.plat ? 0 : 25;
    return {
      ontbreekt: false,
      soort: product,
      typeNaam: product === 'poolhouse' ? 'Poolhouse' : (m.alu ? 'Aluminium overkapping' : 'Overkapping'),
      w: m.w, dp: m.dp, opp: m.opp,
      matenGegeven: !maatwerk,
      alu: m.alu, aanhuis: m.aanhuis,
      /* hVoor is de goot aan de tuinzijde, hAchter die aan de huiszijde. Bij
         een zadeldak liggen ze allebei op de goot en zit de nok ertussen. */
      hVoor: m.hVoor, hAchter: m.hAchter, nok: m.nok,
      goot: Math.min(m.hVoor, m.hAchter),
      top: Math.max(m.hVoor, m.hAchter, m.nok),
      daktype: m.daktype, plat: m.plat, helling: helling,
      daknaam: DAKNAAM[m.daktype] || m.daktype,
      dekkingNaam: m.bedekking,
      materiaalNaam: m.hout,
      kleur: m.alu ? '#3A3F44' : ((HOUT[m.houtCode] || HOUT.douglas).kleur),
      vakken: m.vakken, staanders: m.staanders,
      staanderMaat: 0.15,
      profiel: { staander: m.staander, ligger: m.ligger, gording: m.gording, poer: m.poer },
      wanden: m.wanden, wandenNaam: m.wandenNaam,
      /* Een poolhouse is een gebóuw: achter en opzij dicht, met de schuifpui
         aan de tuinzijde. Een overkapping is open tenzij er wanden gekozen
         zijn. Ze allebei als palenbos tekenen zou van het poolhouse iets
         maken dat niemand besteld heeft. */
      dichtGebouw: product === 'poolhouse',
      achterwand: product === 'poolhouse' || !!m.achterwand,
      extras: (cfg.sel && cfg.sel.extras) || {},
      project: m.project, datum: m.datum, revisie: m.revisie
    };
  }

  /* --------------------------------------------------------- het stramien --- */

  /* Waar de staanders staan. Een ligger van douglas overspant in de praktijk
     ruim drie meter; daarboven komt er een staander tussen. Dat is geen
     decoratie op de plattegrond maar het onderdeel waar de bezoeker straks
     omheen moet lopen, dus het hoort erop. */
  /* De kleur van het dakvlak op de tekening: wat er werkelijk op ligt. */
  function dakKleur(D) {
    var b = String(D.dekkingNaam || '').toLowerCase();
    if (b.indexOf('riet') >= 0) return '#9C8455';
    if (b.indexOf('pan') >= 0) return '#6E5B4B';
    if (b.indexOf('glas') >= 0 || b.indexOf('poly') >= 0) return '#BBD7E4';
    if (b.indexOf('groen') >= 0 || b.indexOf('sedum') >= 0) return '#5C7A४C'.replace('४','4');
    if (b.indexOf('lamel') >= 0) return '#4A5056';
    return '#2E3237';
  }

  /* svgDoc() bouwt zijn gevelpatronen uit D.gevel en D.dak. Een tuinbouwwerk
     heeft geen gevel in die zin, maar de patronen moeten wél een kleur
     krijgen: zonder komt er fill="undefined" in de tekening te staan. */
  function bladD(D) {
    return { gevel: { kleur: D.kleur, tex: D.alu ? 'stuc' : 'hout' },
             dak: { kleur: dakKleur(D) } };
  }

  function stramien(D) {
    /* Het aantal vakken komt uit het gedeelde model: hout hoogstens 2,5 m per
       vak, aluminium tot zes meter op alleen hoekstaanders. */
    var n = Math.max(1, D.vakken);
    var xs = [];
    for (var i = 0; i <= n; i++) xs.push(Math.round((D.w * i / n) * 1000) / 1000);
    var palen = [];
    xs.forEach(function (x) {
      palen.push({ x: x, y: D.dp });                       // tuinzijde
      /* Aan de muur gemonteerd aluminium draagt achter op een muurprofiel;
         daar staat dus niets. */
      if (!D.aanhuis) palen.push({ x: x, y: 0 });
    });
    return {
      xs: xs, palen: palen,
      overspanning: Math.round((D.w / n) * 100) / 100,
      /* De liggerlijnen: voor altijd, achter alleen als er staanders staan. */
      ys: D.aanhuis ? [D.dp] : [0, D.dp]
    };
  }

  /* De gordingen dragen het dakvlak en overspannen de diepte. Aluminium
     sporen liggen op 700 mm, houten gordingen op 600. */
  function gordingen(D) {
    var hoh = D.alu ? 0.70 : 0.60;
    var n = Math.max(2, Math.ceil(D.w / hoh) + 1);
    var uit = [];
    for (var i = 0; i < n; i++) uit.push(Math.min(D.w, i * hoh));
    return { hoh: hoh, x: uit };
  }

  /* De hoogte van het dakvlak op diepte y. y = 0 is de huiszijde, y = dp de
     tuinzijde — dezelfde afspraak als in de rest van het dossier. Dit is wat
     een zadeldak van een lessenaarsdak onderscheidt, en wat een plat dak zijn
     afschot geeft. */
  function dakHoogte(D, y) {
    if (D.daktype === 'zadeldak') {
      var half = D.dp / 2;
      return D.goot + (half - Math.abs(y - half)) * Math.tan(D.helling * Math.PI / 180);
    }
    if (!D.plat) {
      /* Lessenaar: hoog aan de huiszijde, aflopend naar de tuin. */
      return D.nok - (y / D.dp) * (D.nok - Math.min(D.hVoor, D.hAchter));
    }
    /* Plat is niet waterpas: het loopt af van voor naar achter. Een plat dak
       dat op de tekening waterpas ligt is een plat dak waar later water op
       blijft staan. */
    return D.hAchter + (y / D.dp) * (D.hVoor - D.hAchter);
  }

  /* ------------------------------------------------------------ bladen --- */

  var BLADEN = [
    { v: 'voor',        l: 'Vooraanzicht' },
    { v: 'zij',         l: 'Zijaanzicht' },
    { v: 'plattegrond', l: 'Plattegrond' },
    { v: 'doorsnede',   l: 'Doorsnede' },
    { v: 'constructie', l: 'Constructie' },
    { v: 'materialen',  l: 'Materialen' },
    { v: 'toets',       l: 'Toets' }
  ];

  function bladen() { return BLADEN.map(function (b) { return { v: b.v, l: b.l }; }); }

  function kop(D, g, wat) {
    return g.titel(D.typeNaam + ' · ' + wat,
      (D.matenGegeven ? g.m2(D.w) + ' × ' + g.m2(D.dp) + ' m' : 'maatwerk, hier getekend op ' + g.m2(D.w) + ' × ' + g.m2(D.dp) + ' m') +
      ' · ' + g.m1(D.opp) + ' m² · ' + D.daknaam.toLowerCase() +
      ' · ' + String(D.materiaalNaam || '').toLowerCase());
  }

  function maatNoot(D) {
    return D.matenGegeven ? ''
      : 'Je hebt maatwerk gekozen, dus er is nog geen maat. De tekening staat op ' +
        G().m2(D.w) + ' × ' + G().m2(D.dp) + ' m: een gangbare maat, geen toezegging. ' +
        'Zodra je maat bekend is, klopt elke maatlijn op dit blad weer. ';
  }

  /* ---- vooraanzicht en zijaanzicht ---- */

  function aanzicht(D, kant) {
    var g = G(), b = g.blad(), u = b.u;
    var breedte = kant === 'voor' ? D.w : D.dp;
    var top = D.top;
    var P = g.pas(breedte, top, { onder: 170, boven: 150 });
    var s = P.s, x0 = P.x0, vloerY = P.y1;
    var out = kop(D, g, kant === 'voor' ? 'vooraanzicht' : 'zijaanzicht');

    function px(m) { return x0 + m * s; }
    function py(hh) { return vloerY - hh * s; }

    /* Het dakvlak. In het vooraanzicht kijkt de bezoeker tegen de nok of de
       hoge zijde aan; in het zijaanzicht ziet hij de helling zelf. */
    var dakPunten;
    if (kant === 'zij') {
      dakPunten = [];
      for (var i = 0; i <= 20; i++) {
        var y = D.dp * i / 20;
        dakPunten.push([px(y), py(dakHoogte(D, y))]);
      }
    } else if (D.daktype === 'zadeldak') {
      /* De nok loopt evenwijdig aan deze gevel, dus wat je hier ziet is het
         dakvlak verkort: een vlak van de goot tot de nok. Alleen een bandje op
         nokhoogte tekenen liet een gat van tachtig centimeter tussen de
         wand en het dak — een dak dat zweeft. */
      dakPunten = null;
      out += '<path d="M' + px(0) + ' ' + py(D.goot) + ' L' + px(breedte) + ' ' + py(D.goot) +
             ' L' + px(breedte) + ' ' + py(D.nok) + ' L' + px(0) + ' ' + py(D.nok) + ' Z" fill="' +
             dakKleur(D) + '" stroke="#26251F" stroke-width="1.2"/>';
      out += '<line x1="' + px(0) + '" y1="' + py(D.nok) + '" x2="' + px(breedte) + '" y2="' + py(D.nok) +
             '" stroke="#0F1113" stroke-width="2"/>';
    } else {
      var hL = dakHoogte(D, D.dp);
      dakPunten = [[px(0), py(hL)], [px(breedte), py(hL)]];
    }

    /* De staanders. Ze staan op de tekening op hun werkelijke maat: een
       douglas paal van 120 × 120 is geen streepje. */
    var paal = D.staanderMaat;
    var st = stramien(D);
    var posities = kant === 'voor' ? st.xs : st.ys;
    posities.forEach(function (q) {
      var hh = kant === 'voor' ? dakHoogte(D, D.dp) : dakHoogte(D, q);
      if (kant === 'voor' && D.daktype === 'zadeldak') hh = D.goot;
      var xx = px(q) - (q === 0 ? 0 : (q >= breedte ? paal * s : paal * s / 2));
      out += '<rect x="' + xx + '" y="' + py(hh) + '" width="' + (paal * s) +
             '" height="' + (hh * s) + '" fill="' + D.kleur + '" stroke="#3A3833" stroke-width="1.2"/>';
    });

    /* Dichte wanden waar ze gekozen zijn. Wat open is blijft open — een
       overkapping met vier wanden op de tekening is een tuinhuis. */
    function wandVlak(vanM, totM, hoogteFn, label) {
      var d = 'M' + px(vanM) + ' ' + py(0);
      for (var k = 0; k <= 20; k++) {
        var q = vanM + (totM - vanM) * k / 20;
        d += ' L' + px(q) + ' ' + py(hoogteFn(q));
      }
      d += ' L' + px(totM) + ' ' + py(0) + ' Z';
      out += '<path d="' + d + '" fill="' + (label === 'glas' ? '#DCEEF4' : D.kleur) +
             '" fill-opacity="' + (label === 'glas' ? '.75' : '.55') +
             '" stroke="#3A3833" stroke-width="1"/>';
    }
    var achterDicht = kant === 'voor' && D.achterwand;
    var zijDicht = kant === 'zij' && (D.dichtGebouw || (D.wanden && D.wanden !== 'open'));
    if (achterDicht) {
      wandVlak(0, breedte, function () { return D.daktype === 'zadeldak' ? D.goot : dakHoogte(D, 0); }, 'hout');
    }
    if (zijDicht) {
      wandVlak(0, breedte, function (q) { return dakHoogte(D, q); },
               D.dichtGebouw ? 'hout' : 'glas');
    }
    if (D.dichtGebouw || D.wanden === 'dicht' || D.wanden === 'schuif') {
      /* Een glazen schuifwand aan de open zijde: getekend als glasvlak met
         zijn stijlen, want dat is wat er staat. */
      var glasH = kant === 'zij' ? null : (D.daktype === 'zadeldak' ? D.goot : dakHoogte(D, D.dp));
      /* Een standaard schuifpui beslaat niet de hele gevel: er blijft een
         penant over aan weerszijden. Alleen bij "glas rondom" loopt hij door.
         Een gevel die volledig van glas is terwijl er een pui van drie meter
         besteld is, is een tekening waar de bezoeker op afgaat. */
      var vol = D.wanden === 'dicht';
      var pb = vol ? breedte : Math.min(breedte - 0.6, Math.max(2.4, breedte * 0.62));
      var px0 = (breedte - pb) / 2;
      var vakken = Math.max(2, Math.round(pb / 1.0));
      if (glasH) {
        out += '<rect x="' + px(px0) + '" y="' + py(glasH) + '" width="' + (pb * s) +
               '" height="' + (glasH * s) + '" fill="#DCEEF4" fill-opacity=".6" stroke="#3A3833" stroke-width="1"/>';
        for (var v = 1; v < vakken; v++) {
          out += '<line x1="' + px(px0 + pb * v / vakken) + '" y1="' + py(glasH) +
                 '" x2="' + px(px0 + pb * v / vakken) + '" y2="' + py(0) +
                 '" stroke="' + (D.alu ? '#3A3F44' : '#5C584F') + '" stroke-width="2"/>';
        }
      }
    }

    /* Het dakvlak bovenop, inclusief de dakrand op zijn werkelijke dikte. */
    var dikte = 0.18;
    if (dakPunten) {
      var pad = dakPunten.map(function (q, i) { return (i ? 'L' : 'M') + q[0] + ' ' + q[1]; }).join(' ');
      var terug = dakPunten.slice().reverse()
        .map(function (q) { return 'L' + q[0] + ' ' + (q[1] + dikte * s); }).join(' ');
      out += '<path d="' + pad + ' ' + terug + ' Z" fill="' + dakKleur(D) + '" stroke="#26251F" stroke-width="1.2"/>';
    }

    out += g.maatH(px(0), px(breedte), vloerY + 52, g.m2(breedte) + ' m',
                   D.matenGegeven ? 'maat' : 'maat maat--ca');
    out += g.maatV(px(0) - 46, py(D.goot), vloerY, g.m2(D.goot) + ' m');
    out += g.peil(px(0) - 20, px(breedte) + 30, vloerY, '±0,000 ' + g.T('maaiveld'));
    out += g.peil(px(0) - 20, px(breedte) + 30, py(D.goot), '+' + g.m2(D.goot) + ' ' + g.T('goot'));
    /* Alleen een nokpeil bij een dak dat een nok heeft. Op een plat dak is
       het hoogste punt de goot aan de andere kant, en "+2,50 nok" op een plat
       dak leest als een fout. */
    if (!D.plat && D.nok > D.goot + 0.01) {
      out += g.peil(px(0) - 20, px(breedte) + 30, py(D.nok), '+' + g.m2(D.nok) + ' ' + g.T('nok'));
    } else if (D.plat && Math.abs(D.hVoor - D.hAchter) > 0.01) {
      out += g.peil(px(0) - 20, px(breedte) + 30, py(Math.max(D.hVoor, D.hAchter)),
                    '+' + g.m2(Math.max(D.hVoor, D.hAchter)) + ' ' + g.T('hoogste punt'));
    }
    out += g.grondlijn(vloerY, 60, g.VB_W - 60);
    out += g.schaalbalk(60, g.VB_H - 62, s);

    b.svg = g.svgDoc(u, bladD(D), out);
    b.titel = kant === 'voor' ? 'Vooraanzicht' : 'Zijaanzicht';
    b.noot = maatNoot(D) +
      (kant === 'zij' && D.helling
        ? 'Dit aanzicht laat de dakhelling zien: ' + D.helling + ' graden, van ' + g.m2(D.goot) +
          ' m aan de goot naar ' + g.m2(D.nok) + ' m. '
        : '') +
      (D.plat
        ? 'Het platte dak loopt af naar de afvoer; op de tekening is dat te zien. '
        : '') +
      'De staanders staan op hun werkelijke maat (' + g.esc(D.profiel.staander) + ') en op de plek waar ze ' +
      'komen: daar loop je straks omheen. De hoogtes staan niet in de keuzelijst en komen uit hetzelfde ' +
      'model waarmee het technische tekeningenpakket op deze pagina rekent, dus de twee kunnen niet uit ' +
      'elkaar lopen.';
    return b;
  }

  /* ---- plattegrond ---- */

  function plattegrond(D) {
    var g = G(), b = g.blad(), u = b.u;
    var P = g.pas(D.w, D.dp, { onder: 190, boven: 165, links: 120, rechts: 150 });
    var s = P.s, x0 = P.x0, y0 = P.y0;
    function px(m) { return x0 + m * s; }
    function py(m) { return y0 + m * s; }
    function cm(v) { return String(Math.round(v * 100)); }
    var out = kop(D, g, 'plattegrond');
    var st = stramien(D), gd = gordingen(D);

    /* De vloer. Een overkapping heeft geen vloer maar een terras eronder; die
       wordt licht getekend, want hij hoort meestal niet bij de levering. */
    out += '<rect x="' + px(0) + '" y="' + py(0) + '" width="' + (D.w * s) + '" height="' + (D.dp * s) +
           '" fill="' + (D.soort === 'poolhouse' ? '#EFE7D8' : '#EDEAE1') + '" stroke="#B9B2A4" stroke-width="1"/>';

    /* De gordingen: dit is het dakvlak van bovenaf gezien. */
    gd.x.forEach(function (x) {
      out += '<line x1="' + px(x) + '" y1="' + py(0) + '" x2="' + px(x) + '" y2="' + py(D.dp) +
             '" stroke="#8A7B4E" stroke-width="1.6" stroke-opacity=".65"/>';
    });
    /* De liggers op de staanderlijnen: dik, want dat is de hoofddraagrichting. */
    st.ys.forEach(function (y) {
      out += '<line x1="' + px(0) + '" y1="' + py(y) + '" x2="' + px(D.w) + '" y2="' + py(y) +
             '" stroke="#5C584F" stroke-width="4" stroke-linecap="round"/>';
    });

    /* De dichte zijden. */
    var wd = 0.10 * s;
    if (D.achterwand) {
      out += '<rect x="' + px(0) + '" y="' + (py(0) - wd) + '" width="' + (D.w * s) + '" height="' + wd +
             '" fill="#6F6C66" stroke="#3A3833" stroke-width="1"/>';
    }
    if (D.dichtGebouw || (D.wanden && D.wanden !== 'open')) {
      [0, D.w].forEach(function (x) {
        out += '<rect x="' + (x === 0 ? px(0) - wd : px(D.w)) + '" y="' + py(0) + '" width="' + wd +
               '" height="' + (D.dp * s) + '" fill="' + (D.dichtGebouw ? '#6F6C66' : '#DCEEF4') +
               '" stroke="#3A3833" stroke-width="1"/>';
      });
    }
    if (D.dichtGebouw || D.wanden === 'dicht') {
      [[0, D.dp, D.w, D.dp]].forEach(function (q) {
        out += '<line x1="' + px(q[0]) + '" y1="' + py(q[1]) + '" x2="' + px(q[2]) + '" y2="' + py(q[3]) +
               '" stroke="#7FA8BC" stroke-width="5"/>';
      });
    } else if (D.wanden === 'schuif') {
      out += '<line x1="' + px(0) + '" y1="' + py(D.dp) + '" x2="' + px(D.w) + '" y2="' + py(D.dp) +
             '" stroke="#7FA8BC" stroke-width="5"/>';
    }

    /* De staanders. Vierkantjes op ware maat met hun nummer erbij: zo is te
       zien dat er eentje midden voor de zithoek staat, en dat is precies wat
       iemand wil weten voordat er beton in de grond gaat. */
    var paal = D.staanderMaat;
    st.palen.forEach(function (q, i) {
      var cx = px(q.x) - paal * s / 2, cy = py(q.y) - paal * s / 2;
      cx = Math.min(Math.max(cx, px(0)), px(D.w) - paal * s);
      cy = Math.min(Math.max(cy, py(0)), py(D.dp) - paal * s);
      out += '<rect x="' + cx + '" y="' + cy + '" width="' + (paal * s) + '" height="' + (paal * s) +
             '" fill="' + D.kleur + '" stroke="#26251F" stroke-width="1.4"/>';
    });

    /* De maatvoering: totaal én de stramienmaten, want dat laatste is wat de
       aannemer uitzet. */
    out += g.maatH(px(0), px(D.w), y0 - 62, cm(D.w), D.matenGegeven ? 'maat' : 'maat maat--ca');
    out += g.maatV(px(D.w) + 86, py(0), py(D.dp), cm(D.dp), D.matenGegeven ? 'maat' : 'maat maat--ca');
    if (st.xs.length > 2) {
      for (var i = 0; i < st.xs.length - 1; i++) {
        out += g.maatH(px(st.xs[i]), px(st.xs[i + 1]), y0 + D.dp * s + 62, cm(st.xs[i + 1] - st.xs[i]));
      }
    }
    out += '<text x="' + (g.VB_W - 60) + '" y="' + (g.VB_H - 44) + '" text-anchor="end" class="micro">' +
           g.esc(g.T('MATEN IN CM · STRAMIEN H.O.H. ' + cm(st.overspanning) + ' · GORDINGEN H.O.H. ' +
                 Math.round(gd.hoh * 1000) + ' MM')) + '</text>';
    out += g.schaalbalk(60, g.VB_H - 62, s);

    b.svg = g.svgDoc(u, bladD(D), out);
    b.titel = 'Plattegrond';
    b.noot = maatNoot(D) +
      'De staanders staan waar ze komen: ' + D.staanders + ' stuks, ' + st.xs.length + ' per lange zijde, ' +
      'op ' + g.m2(st.overspanning) + ' m uit elkaar. ' +
      (D.alu
        ? 'Aluminium overspant veel verder dan hout, dus er staan er minder. '
        : 'Een houten ligger overspant in de praktijk hoogstens tweeënhalve meter. ') +
      (D.aanhuis ? 'Aan de achterzijde staat niets: daar draagt het dak op een muurprofiel. ' : '') +
      'Een staander midden voor de zithoek is iets wat je wilt weten voordat er beton in de grond gaat. ' +
      (D.dichtGebouw
        ? 'Een poolhouse is een gebouw: achter en opzij dicht, met de schuifpui aan de tuinzijde. '
        : D.achterwand || D.wanden !== 'open'
        ? 'De dichte zijden staan gearceerd, glas lichtblauw. '
        : 'Alle zijden zijn open; er zijn geen wanden gekozen. ');
    return b;
  }

  /* ---- doorsnede ---- */

  function doorsnede(D) {
    var g = G(), b = g.blad(), u = b.u;
    var P = g.pas(D.dp, D.top + 0.6, { onder: 175, boven: 150, rechts: 520 });
    var s = P.s, x0 = P.x0, vloerY = P.y1;
    function px(m) { return x0 + m * s; }
    function py(hh) { return vloerY - hh * s; }
    var out = kop(D, g, 'doorsnede');

    var paal = D.staanderMaat;
    /* Fundering: een poer per staander. Dat is wat er werkelijk onder ligt en
       het is de post die het vaakst vergeten wordt. */
    var poer = 0.30;
    [0, D.dp].forEach(function (y) {
      out += '<rect x="' + (px(y) - poer * s / 2) + '" y="' + vloerY + '" width="' + (poer * s) +
             '" height="' + (poer * s * 1.6) + '" fill="#D8D3C6" stroke="#6E6A62" stroke-width="1.2"/>';
      var hh = dakHoogte(D, y);
      out += '<rect x="' + (px(y) - paal * s / 2) + '" y="' + py(hh) + '" width="' + (paal * s) +
             '" height="' + (hh * s) + '" fill="' + D.kleur + '" stroke="#3A3833" stroke-width="1.2"/>';
    });
    /* Het dakvlak met zijn opbouw. */
    var pad = '', dikte = 0.18;
    for (var i = 0; i <= 20; i++) {
      var y = D.dp * i / 20;
      pad += (i ? 'L' : 'M') + px(y) + ' ' + py(dakHoogte(D, y));
    }
    var terug = '';
    for (var j = 20; j >= 0; j--) {
      var y2 = D.dp * j / 20;
      terug += 'L' + px(y2) + ' ' + (py(dakHoogte(D, y2)) + dikte * s);
    }
    out += '<path d="' + pad + ' ' + terug + ' Z" fill="#E4D9BE" stroke="#26251F" stroke-width="1.4"/>';

    out += g.maatH(px(0), px(D.dp), vloerY + 56, g.m2(D.dp) + ' m', D.matenGegeven ? 'maat' : 'maat maat--ca');
    out += g.maatV(px(0) - 46, py(D.goot), vloerY, g.m2(D.goot) + ' m');
    out += g.grondlijn(vloerY, 60, x0 + D.dp * s + 60);
    out += g.schaalbalk(60, g.VB_H - 62, s);

    /* De opbouwstaat ernaast. */
    var dek = String(D.dekkingNaam || '').toLowerCase();
    var lagen = dek.indexOf('riet') >= 0
      ? [['Rietbedekking / rietlook-plaat', 60], ['Panlatten 25 × 50', 25], ['Tengels 22 × 45', 22], ['Dakbeschot vuren', 18]]
      : dek.indexOf('pan') >= 0
      ? [['Dakpanprofielplaat staal', 12], ['Tengels 22 × 45', 22], ['Dakbeschot vuren', 18]]
      : (dek.indexOf('glas') >= 0 || dek.indexOf('poly') >= 0)
      ? [['Beglazing of polycarbonaatplaat', 16], ['Sponning- en klemprofiel', 40]]
      : dek.indexOf('lamel') >= 0
      ? [['Aluminium lamellen, kantelbaar', 210], ['Kaderprofiel met geïntegreerde goot', 230]]
      : [['EPDM dakbedekking', 2], ['Multiplex dakbeschot 18 mm', 18], ['Dakbeschot op afschot', 45]];
    var gy = 250;
    out += '<text x="' + (g.VB_W - 470) + '" y="' + (gy - 16) + '" class="legenda">' +
           g.esc(g.T('DAKOPBOUW VAN BUITEN NAAR BINNEN')) + '</text>';
    var tot = 0;
    lagen.forEach(function (l, k) {
      tot += l[1];
      out += '<text x="' + (g.VB_W - 470) + '" y="' + (gy + k * 20) + '" class="ruimteopp">' + g.esc(l[0]) + '</text>' +
             '<text x="' + (g.VB_W - 70) + '" y="' + (gy + k * 20) + '" text-anchor="end" class="ruimteopp">' +
             g.esc(l[1] + ' mm') + '</text>';
    });
    out += '<line x1="' + (g.VB_W - 470) + '" y1="' + (gy + lagen.length * 20 - 4) + '" x2="' + (g.VB_W - 70) +
           '" y2="' + (gy + lagen.length * 20 - 4) + '" class="dun"/>';
    out += '<text x="' + (g.VB_W - 470) + '" y="' + (gy + lagen.length * 20 + 16) + '" class="ruimteopp">' +
           g.esc(g.T('totaal')) + '</text>' +
           '<text x="' + (g.VB_W - 70) + '" y="' + (gy + lagen.length * 20 + 16) + '" text-anchor="end" class="maatcijfer">' +
           g.esc(tot + ' mm') + '</text>';

    b.svg = g.svgDoc(u, bladD(D), out);
    b.titel = 'Doorsnede';
    b.noot = maatNoot(D) +
      'Onder elke staander ligt een betonpoer; dat is de post die het vaakst wordt vergeten en die het ' +
      'graafwerk bepaalt. ' +
      (D.soort === 'poolhouse'
        ? 'Een poolhouse is geen verblijfsruimte in de zin van het Bbl zolang er niet in gewoond wordt, dus er ' +
          'is hier geen isolatie-eis. Wil je hem verwarmen, dan verandert dat en hoort er een geïsoleerde ' +
          'opbouw in. Dat is een ander product en een ander gesprek.'
        : 'Een overkapping is open, dus er is geen isolatie en geen Rc-waarde. Wie hem later dichtzet, ' +
          'bouwt in feite een tuinhuis en krijgt met andere regels te maken.');
    return b;
  }

  /* ---- constructie ---- */

  function constructie(D) {
    var g = G(), b = g.blad(), u = b.u;
    var st = stramien(D), gd = gordingen(D);
    var P = g.pas(D.w, D.dp, { links: 120, rechts: 560, boven: 150, onder: 150 });
    var s = P.s;
    function px(m) { return P.x0 + m * s; }
    function py(m) { return P.y0 + m * s; }
    var out = g.titel(D.typeNaam + ' · draagconstructie',
      'Staanders, liggers en gordingen · voordimensionering, ter controle door de constructeur');

    out += '<rect x="' + px(0) + '" y="' + py(0) + '" width="' + (D.w * s) + '" height="' + (D.dp * s) +
           '" fill="#FFFFFF" stroke="#3A3833" stroke-width="1.4"/>';
    gd.x.forEach(function (x) {
      out += '<line x1="' + px(x) + '" y1="' + py(0) + '" x2="' + px(x) + '" y2="' + py(D.dp) +
             '" stroke="#8A7B4E" stroke-width="1.8"/>';
    });
    st.ys.forEach(function (y) {
      out += '<line x1="' + px(0) + '" y1="' + py(y) + '" x2="' + px(D.w) + '" y2="' + py(y) +
             '" stroke="#1F3B57" stroke-width="7" stroke-linecap="round"/>';
    });
    var paal = D.staanderMaat;
    st.palen.forEach(function (q) {
      var cx = Math.min(Math.max(px(q.x) - paal * s / 2, px(0)), px(D.w) - paal * s);
      var cy = Math.min(Math.max(py(q.y) - paal * s / 2, py(0)), py(D.dp) - paal * s);
      out += '<rect x="' + cx + '" y="' + cy + '" width="' + (paal * s) + '" height="' + (paal * s) +
             '" fill="#26251F"/>';
    });

    /* De voordimensionering. De ligger draagt de halve dieptelast, de gording
       een strook van 600 mm — dezelfde module als de rest van het dossier, dus
       dezelfde profielen. */
    function houtBalk(span, opts) {
      if (!global.NGBouwkundig || !global.NGBouwkundig.voordimensioneer) return null;
      return global.NGBouwkundig.voordimensioneer('dak', span, opts || {});
    }
    var groen = String(D.dekkingNaam || '').toLowerCase().indexOf('groen') >= 0;
    /* Alleen hout wordt hier voorgedimensioneerd. Aluminium profielen zijn
       systeemprofielen van de leverancier; die door een houtmodule laten
       narekenen zou een getal opleveren dat nergens op slaat. */
    var ligger = D.alu ? null : houtBalk(st.overspanning, { spacing: D.dp / 2, groenDak: groen });
    var gording = D.alu ? null : houtBalk(D.dp, { spacing: gd.hoh, groenDak: groen });
    /* De maatkolom is smal. Een systeemprofiel heet "kaderprofiel hoogte 230
       mm, goot geïntegreerd" en dat loopt de tabel uit — op de afdruk eindigt
       hij dan halverwege een woord. De korte maat gaat in de kolom, de volle
       omschrijving op de regel eronder. */
    function kort(t, n) {
      t = String(t || '');
      if (t.length <= n) return t;
      /* Staat de doorsnede vooraan — "150 × 150 mm aluminium koker" — dan is
         dát de maat en de rest een omschrijving. Alleen als er helemaal geen
         maat vooraan staat, zoals bij "kaderprofiel hoogte 230 mm, goot
         geïntegreerd", verwijst de kolom naar de regel eronder. */
      var m = t.match(/^[0-9]+(\s*[×x]\s*[0-9]+)?\s*mm/);
      return m ? m[0] : 'zie toelichting';
    }
    var onderdelen = [
      { code: 'K-01', naam: 'Staanders', maat: kort(D.profiel.staander, 22),
        aantal: D.staanders, span: D.goot,
        materiaal: D.materiaalNaam + (D.profiel.staander.length > 22 ? ' · ' + D.profiel.staander : '') },
      { code: 'L-01', naam: 'Liggers op de staanderlijn',
        maat: kort(D.alu ? D.profiel.ligger : (ligger ? ligger.profiel : D.profiel.ligger), 22),
        aantal: st.ys.length, span: st.overspanning,
        materiaal: D.alu ? D.profiel.ligger
                 : (ligger ? ligger.materiaalLabel + ', voorgedimensioneerd' : D.materiaalNaam) },
      { code: 'G-01', naam: 'Gordingen h.o.h. ' + Math.round(gd.hoh * 1000) + ' mm',
        maat: kort(D.alu ? D.profiel.gording : (gording ? gording.profiel : D.profiel.gording), 22),
        aantal: gd.x.length, span: D.dp,
        materiaal: D.alu ? D.profiel.gording
                 : (gording ? gording.materiaalLabel + ', voorgedimensioneerd' : D.materiaalNaam) },
      /* De volle omschrijving van de fundering staat op de regel eronder: in
         de maatkolom liep hij het blad af en eindigde op de afdruk als
         "300 × 300 × 600 m". */
      { code: 'F-01', naam: 'Fundering onder de staanders',
        maat: D.alu ? 'zie toelichting' : '300 × 300 × 600 mm',
        aantal: D.staanders, span: 0, materiaal: D.profiel.poer }
    ];

    var tx = g.VB_W - 520, ty = 200;
    out += '<text x="' + tx + '" y="' + ty + '" class="legenda">' + g.esc(g.T('CONSTRUCTIEONDERDELEN')) + '</text>';
    ty += 28;
    ['CODE', 'ONDERDEEL', 'AANTAL', 'MAAT'].forEach(function (h, i) {
      var xs = [tx, tx + 62, tx + 262, tx + 330];
      out += '<text x="' + xs[i] + '" y="' + ty + '" class="micro">' + g.esc(h) + '</text>';
    });
    out += '<line x1="' + tx + '" y1="' + (ty + 8) + '" x2="' + (g.VB_W - 60) + '" y2="' + (ty + 8) + '" class="dun"/>';
    ty += 28;
    onderdelen.forEach(function (o) {
      out += '<text x="' + tx + '" y="' + ty + '" class="maatcijfer">' + g.esc(o.code) + '</text>' +
             '<text x="' + (tx + 62) + '" y="' + ty + '" class="ruimteopp">' + g.esc(o.naam) + '</text>' +
             '<text x="' + (tx + 262) + '" y="' + ty + '" class="ruimteopp">' + g.esc(o.aantal + ' st') + '</text>' +
             '<text x="' + (tx + 330) + '" y="' + ty + '" class="maatcijfer">' + g.esc(o.maat) + '</text>';
      ty += 17;
      out += '<text x="' + (tx + 62) + '" y="' + ty + '" class="micro">' + g.esc(o.materiaal +
             (o.span ? ' · overspanning ' + g.m2(o.span) + ' m' : '')) + '</text>';
      ty += 24;
    });
    ty += 10;
    out += '<text x="' + tx + '" y="' + ty + '" class="legenda">' + g.esc(g.T('TE BEVESTIGEN DOOR DE CONSTRUCTEUR')) + '</text>';
    ty += 22;
    [(D.alu
       ? 'De aluminium profielen zijn systeemprofielen van de leverancier, niet voorgedimensioneerd.'
       : 'Elk profiel is een voordimensionering; de constructeur bevestigt.'),
     'Windverband en stabiliteit vallen hierbuiten en zijn bij een open bouwwerk bepalend.',
     'Poerafmeting en funderingsdiepte hangen af van de grondslag ter plaatse.',
     'Verankering staander-poer: verstelbare voetplaat, niet in het beton gestort.'
    ].forEach(function (r) {
      out += '<text x="' + tx + '" y="' + ty + '" class="ruimteopp">• ' + g.esc(r) + '</text>';
      ty += 18;
    });
    out += '<text x="' + tx + '" y="' + (g.VB_H - 60) + '" class="waarschuwing">' +
           g.esc(g.T('VOORDIMENSIONERING, GEEN GEWAARMERKTE CONSTRUCTIEBEREKENING')) + '</text>';
    out += g.schaalbalk(60, g.VB_H - 62, s);

    b.svg = g.svgDoc(u, bladD(D), out);
    b.titel = 'Constructie';
    b.noot = 'De liggers en gordingen zijn voorgedimensioneerd volgens Eurocode 5, met dezelfde module ' +
      'waarmee de rest van het dossier rekent. Bij een open bouwwerk is niet de doorbuiging maar de ' +
      'stabiliteit het lastigste onderdeel: er zijn geen wanden die het windverband leveren, dus dat moet ' +
      'uit de verbindingen en eventuele schoren komen. Dat is werk voor de constructeur en staat niet op ' +
      'deze tekening.';
    return b;
  }

  /* ---- materialen ---- */

  function materialen(D) {
    var g = G(), b = g.blad(), u = b.u;
    var st = stramien(D), gd = gordingen(D);
    var out = g.titel(D.typeNaam + ' · materialen op hoofdlijnen',
      'Hoeveelheden uit de getekende maat · indicatief voor de werkvoorbereiding');
    var rijen = [
      ['Staanders ' + D.profiel.staander + ', ' + g.m2(D.top + 0.3) + ' m', D.staanders, 'st'],
      ['Liggers ' + D.profiel.ligger, st.ys.length, 'st'],
      ['Gordingen ' + D.profiel.gording + ' h.o.h. ' + Math.round(gd.hoh * 1000) + ' mm', gd.x.length, 'st'],
      ['Dakbeschot / dakplaat', Math.round(D.opp * 1.08 * 10) / 10, 'm²'],
      [D.dekkingNaam, Math.round(D.opp * 1.12 * 10) / 10, 'm²'],
      ['Fundering: ' + D.profiel.poer, D.staanders, 'st'],
      ['Boeiboord rondom', Math.round((2 * (D.w + D.dp)) * 10) / 10, 'm¹']
    ];
    if (D.achterwand) rijen.push(['Achterwand', Math.round(D.w * D.goot * 10) / 10, 'm²']);
    if (D.wanden && D.wanden !== 'open') rijen.push([D.wandenNaam, 1, 'set']);
    if (D.extras && D.extras.dakgoot) rijen.push(['Dakgoot + hemelwaterafvoer', Math.round(D.w * 10) / 10, 'm¹']);

    var y = 210;
    ['OMSCHRIJVING', 'AANTAL', 'EENHEID'].forEach(function (h, i) {
      var xs = [80, 700, 800];
      out += '<text x="' + xs[i] + '" y="' + y + '" class="micro">' + g.esc(h) + '</text>';
    });
    out += '<line x1="80" y1="' + (y + 9) + '" x2="' + (g.VB_W - 80) + '" y2="' + (y + 9) + '" class="dun"/>';
    y += 30;
    rijen.forEach(function (r) {
      out += '<text x="80" y="' + y + '" class="ruimteopp">' + g.esc(r[0]) + '</text>' +
             '<text x="760" y="' + y + '" text-anchor="end" class="maatcijfer">' +
             g.esc(String(r[1]).replace('.', ',')) + '</text>' +
             '<text x="800" y="' + y + '" class="ruimteopp">' + g.esc(r[2]) + '</text>';
      y += 24;
    });

    b.svg = g.svgDoc(u, bladD(D), out);
    b.titel = 'Materialen';
    b.noot = maatNoot(D) +
      'De hoeveelheden volgen uit de getekende maat en het stramien; snijverlies zit in de percentages op ' +
      'het dakvlak. Ze zijn bedoeld voor de werkvoorbereiding en niet als bestelstaat: de leverancier ' +
      'rekent op zijn eigen plaatmaten.';
    return b;
  }

  /* ---- toets ---- */

  /* Wat er voor een tuinbouwwerk werkelijk toe doet is niet de Rc-waarde maar
     de vergunningvraag. Een overkapping met een Rc-toets erop zou een toets
     zijn op iets dat er niet is. */
  function toetsen(D) {
    var rijen = [];
    var HOOG_VRIJ = 3.00;
    /* Afronden op centimeters. De nok komt uit een tangens en is dus
       3,1160384017712475 als je hem niet afrondt — een getal dat op een blad
       naast "≤ 3 m" staat en daarmee de hele tabel ongeloofwaardig maakt. */
    var top = Math.round(D.top * 100) / 100;
    rijen.push({
      naam: 'Hoogte van het bouwwerk', waarde: top, eis: HOOG_VRIJ, eenheid: 'm', richting: 'max',
      voldoet: top <= HOOG_VRIJ + 0.005,
      marge: Math.round((HOOG_VRIJ - top) * 100) / 100,
      uitleg: 'Vergunningvrij in het achtererfgebied is een bijbehorend bouwwerk tot 3,00 m hoog. ' +
        'Staat het verder dan 4 m van de woning, dan gelden er aanvullende regels voor de dakvorm.'
    });
    rijen.push({
      naam: 'Oppervlakte van dit bouwwerk', waarde: D.opp, eis: null, eenheid: 'm²', richting: 'info',
      voldoet: null, marge: 0,
      uitleg: 'De toegestane oppervlakte hangt af van de grootte van je erf, en álle bijgebouwen tellen ' +
        'samen: een bestaande schuur telt dus mee. Dat kan de configurator niet weten.'
    });
    if (D.helling) {
      rijen.push({
        naam: 'Dakhelling', waarde: D.helling, eis: null, eenheid: '°', richting: 'info',
        voldoet: null, marge: 0,
        uitleg: 'Aangenomen helling bij een ' + D.daknaam.toLowerCase() + '. Bij dakpannen is 20° in de ' +
          'praktijk de ondergrens; daaronder hoort een andere dekking.'
      });
    }
    rijen.push({
      naam: 'Afschot dakvlak', waarde: D.plat ? 16 : Math.round(Math.tan(D.helling * Math.PI / 180) * 1000),
      eis: 16, eenheid: 'mm/m', richting: 'min',
      voldoet: (D.plat ? 16 : Math.round(Math.tan(D.helling * Math.PI / 180) * 1000)) >= 16,
      marge: 0,
      uitleg: 'Een dakvlak dat waterpas ligt, houdt water vast. Zestien millimeter per meter is het minimum.'
    });
    return { rijen: rijen, mis: rijen.filter(function (r) { return r.voldoet === false; }).length };
  }

  function toetsBlad(D) {
    var g = G(), b = g.blad(), u = b.u;
    var t = toetsen(D);
    var out = g.titel(D.typeNaam + ' · toets op hoofdlijnen',
      'Vergunningvrij bouwen volgens het Besluit bouwwerken leefomgeving');
    var y = 210;
    ['ONDERDEEL', 'WAARDE', 'EIS', 'OORDEEL'].forEach(function (h, i) {
      var xs = [80, 560, 700, 840];
      out += '<text x="' + xs[i] + '" y="' + y + '" text-anchor="' + (i === 1 || i === 2 ? 'end' : 'start') +
             '" class="micro">' + g.esc(h) + '</text>';
    });
    out += '<line x1="80" y1="' + (y + 9) + '" x2="' + (g.VB_W - 80) + '" y2="' + (y + 9) + '" class="dun"/>';
    y += 32;
    t.rijen.forEach(function (r) {
      out += '<text x="80" y="' + y + '" class="ruimte">' + g.esc(r.naam) + '</text>' +
             '<text x="560" y="' + y + '" text-anchor="end" class="maatcijfer">' +
             g.esc(String(r.waarde).replace('.', ',') + ' ' + r.eenheid) + '</text>' +
             '<text x="700" y="' + y + '" text-anchor="end" class="ruimteopp">' +
             g.esc(r.eis == null ? '-' : (r.richting === 'max' ? '≤ ' : '≥ ') + String(r.eis).replace('.', ',') + ' ' + r.eenheid) + '</text>' +
             '<text x="840" y="' + y + '" class="' + (r.voldoet === false ? 'waarschuwing' : 'ruimte') + '">' +
             g.esc(r.voldoet === null ? 'ter informatie' : r.voldoet ? 'voldoet' : 'let op') + '</text>';
      y += 17;
      out += '<text x="80" y="' + y + '" class="micro">' + g.esc(r.uitleg) + '</text>';
      y += 28;
    });
    out += '<text x="80" y="' + (y + 16) + '" class="micro">' +
           g.esc(g.T('DIT IS GEEN VERGUNNINGSTOETS: HET BEVOEGD GEZAG BESLIST')) + '</text>';

    b.svg = g.svgDoc(u, bladD(D), out);
    b.titel = 'Toets';
    b.noot = (t.mis
      ? t.mis + ' onderdeel' + (t.mis > 1 ? 'en vragen' : ' vraagt') + ' aandacht. Dat betekent niet dat het ' +
        'niet mag, maar wel dat het waarschijnlijk vergunningplichtig wordt. '
      : 'Op deze punten blijft het bouwwerk binnen de vergunningvrije grenzen. ') +
      'De oppervlakteregel kan de configurator niet nagaan: die hangt af van je erf en van wat er al staat. ' +
      'Isolatie, Rc-waarden en daglicht staan hier niet in, want een open bouwwerk heeft ze niet. ' +
      'Dat is geen weglating maar het antwoord.';
    return b;
  }

  /* ------------------------------------------------------------ naar buiten --- */

  var FN = {
    voor: function (D) { return aanzicht(D, 'voor'); },
    zij: function (D) { return aanzicht(D, 'zij'); },
    plattegrond: plattegrond,
    doorsnede: doorsnede,
    constructie: constructie,
    materialen: materialen,
    toets: toetsBlad
  };

  function teken(naam, cfg) {
    var D = (cfg && cfg.typeNaam && cfg.daktype) ? cfg : lees(cfg);
    var fn = FN[naam] || FN.voor;
    var v = FN[naam] ? naam : 'voor';
    var r = fn(D);
    var g = G();
    return { v: v, titel: r.titel,
             svg: g && g.benoem ? g.benoem(r.svg, D.typeNaam + ' · ' + r.titel, r.noot) : r.svg,
             noot: r.noot, model: null, D: D };
  }

  global.NGTuinbouwwerk = {
    lees: lees,
    bladen: bladen,
    toetsen: toetsen,
    teken: teken,
    alle: function (cfg) {
      var D = lees(cfg);
      var g = G();
      return BLADEN.map(function (bl) {
        var r = FN[bl.v](D);
        return { v: bl.v, titel: r.titel,
                 svg: g && g.benoem ? g.benoem(r.svg, D.typeNaam + ' · ' + r.titel, r.noot) : r.svg,
                 noot: r.noot };
      });
    },
    /* Het tekenprogramma roept deze twee ook aan; een tuinbouwwerk heeft geen
       inrichting en geen vertaaltabel, dus doen ze niets. */
    inrichting: function () { return { meubels: [], kozijnen: [], leeg: [] }; },
    palet: function () {},
    woorden: function () {},
    _hulp: { stramien: stramien, gordingen: gordingen, dakHoogte: dakHoogte }
  };
})(typeof window !== 'undefined' ? window : globalThis);
