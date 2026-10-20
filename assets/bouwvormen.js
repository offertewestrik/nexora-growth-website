/* De plattegrondvorm: rechthoek, L-vorm of U-vorm.
 *
 * WAAROM DIT ER IS
 * Een uitbouw is lang niet altijd een doos. De meest gevraagde variant na de
 * rechthoek is de L: over de volle breedte tegen de woning aan, en dan om de
 * hoek smaller worden omdat de erfgrens, een boom of de bestaande keuken in
 * de weg staat. Zolang de configurator alleen breedte × diepte kende, moest
 * die vraag telefonisch — en kwam er geen prijs en geen tekening uit.
 *
 * HOE DE VORM BESCHREVEN IS
 * Altijd als een rechthoek van breedte × diepte met daar één rechthoekige hap
 * uit. Dat is geen beperking maar een keuze: het houdt de omtrek gelijk aan
 * die van de omhullende rechthoek (bij een uitsparing in een hoek loopt de
 * gevel dezelfde lengte af), het houdt alle hoeken recht, en het maakt elke
 * vorm met twee schuiven te bedienen. Wie een echt vrije vorm wil, tekent
 * geen configurator maar een ontwerp.
 *
 *   rechthoek   geen hap
 *   l-vorm      de hap zit in een hoek aan de tuinzijde, links of rechts
 *   u-vorm      de hap zit midden in de tuingevel: een binnenhof
 *
 * ASSENSTELSEL
 * x loopt van 0 tot de breedte, y van 0 (de zijde van de bestaande woning)
 * tot de diepte (de tuinzijde). Alle maten in meters. De punten staan met de
 * klok mee als je y naar beneden tekent, wat op een plattegrond het geval is.
 */
(function (global) {
  'use strict';

  /* null en een lege string zijn "niet ingevuld" en moeten de standaardwaarde
     opleveren. Number(null) is 0 en dat is een geldig getal, dus een gewone
     isFinite-controle laat een niet-ingevulde hap als nul door — en dan is
     een L-vorm net zo groot als de rechthoek waar hij uit komt. */
  function num(v, d) {
    if (v === null || v === undefined || v === '') return d;
    v = Number(v);
    return isFinite(v) ? v : d;
  }
  function rond(v, n) { var p = Math.pow(10, n || 0); return Math.round(v * p) / p; }

  var VORMEN = [
    { v: 'rechthoek', l: 'Rechthoek', d: 'De hele breedte over de hele diepte.' },
    { v: 'l-links',   l: 'L-vorm, hap links',  d: 'Aan de tuinzijde links smaller, bijvoorbeeld om een boom of de erfgrens heen.' },
    { v: 'l-rechts',  l: 'L-vorm, hap rechts', d: 'Aan de tuinzijde rechts smaller.' },
    { v: 'u-vorm',    l: 'U-vorm',             d: 'Een binnenhof midden in de tuingevel: daglicht van drie kanten.' }
  ];

  /* De hap begrensd op wat er overblijft. Zonder deze grenzen levert een
     schuif die te ver gaat een uitbouw op met een negatieve poot, en dat
     tekent als een doos die binnenstebuiten geklapt is. */
  function hap(vorm, w, dp, hb, hd) {
    if (vorm === 'rechthoek' || !vorm) return { b: 0, d: 0 };
    var maxB = vorm === 'u-vorm' ? Math.max(0, w - 2.0) : Math.max(0, w - 1.5);
    var maxD = Math.max(0, dp - 1.5);
    return {
      b: Math.max(0, Math.min(num(hb, w * 0.35), maxB)),
      d: Math.max(0, Math.min(num(hd, dp * 0.40), maxD)),
      maxB: rond(maxB, 2), maxD: rond(maxD, 2)
    };
  }

  /* De omtrek als lijst van punten. */
  function punten(vorm, w, dp, hb, hd) {
    var h = hap(vorm, w, dp, hb, hd);
    function P(a, b) { return [rond(a, 3), rond(b, 3)]; }
    if (!h.b || !h.d || vorm === 'rechthoek' || !vorm) {
      return [P(0, 0), P(w, 0), P(w, dp), P(0, dp)];
    }
    if (vorm === 'l-rechts') {
      return [P(0, 0), P(w, 0), P(w, dp - h.d), P(w - h.b, dp - h.d), P(w - h.b, dp), P(0, dp)];
    }
    if (vorm === 'l-links') {
      return [P(0, 0), P(w, 0), P(w, dp), P(h.b, dp), P(h.b, dp - h.d), P(0, dp - h.d)];
    }
    /* u-vorm: de hap ligt in het midden van de tuingevel. */
    var a = (w - h.b) / 2, b = (w + h.b) / 2;
    return [P(0, 0), P(w, 0), P(w, dp), P(b, dp), P(b, dp - h.d), P(a, dp - h.d), P(a, dp), P(0, dp)];
  }

  /* Oppervlak volgens de schoenveterformule; de absolute waarde, want de
     draairichting van de punten mag de uitkomst niet bepalen. */
  function oppervlak(p) {
    var s = 0;
    for (var i = 0; i < p.length; i++) {
      var q = p[(i + 1) % p.length];
      s += p[i][0] * q[1] - q[0] * p[i][1];
    }
    return Math.abs(s) / 2;
  }

  function omtrek(p) {
    var s = 0;
    for (var i = 0; i < p.length; i++) {
      var q = p[(i + 1) % p.length];
      s += Math.abs(q[0] - p[i][0]) + Math.abs(q[1] - p[i][1]);
    }
    return s;
  }

  function inPolygoon(p, x, y) {
    var binnen = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
      var xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) binnen = !binnen;
    }
    return binnen;
  }

  /* De binnenzijde van de gevel: elke zijde t meter naar binnen geschoven.
     Welke kant "naar binnen" is, wordt niet uit de draairichting afgeleid maar
     gewoon getest — een punt naast het midden van de zijde ligt binnen of
     buiten. Dat werkt ook bij een inspringende hoek, waar de draairichting je
     op het verkeerde been zet. */
  function inzet(p, t) {
    var n = p.length, lijnen = [];
    for (var i = 0; i < n; i++) {
      var a = p[i], b = p[(i + 1) % n];
      var dx = b[0] - a[0], dy = b[1] - a[1];
      var L = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / L, ny = dx / L;                       // loodrecht op de zijde
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      if (!inPolygoon(p, mx + nx * 0.01, my + ny * 0.01)) { nx = -nx; ny = -ny; }
      lijnen.push({ a: [a[0] + nx * t, a[1] + ny * t], b: [b[0] + nx * t, b[1] + ny * t] });
    }
    var uit = [];
    for (var k = 0; k < n; k++) {
      var l1 = lijnen[(k - 1 + n) % n], l2 = lijnen[k];
      var s = snij(l1, l2);
      uit.push(s || l2.a);
    }
    return uit;
  }

  function snij(l1, l2) {
    var x1 = l1.a[0], y1 = l1.a[1], x2 = l1.b[0], y2 = l1.b[1];
    var x3 = l2.a[0], y3 = l2.a[1], x4 = l2.b[0], y4 = l2.b[1];
    var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(d) < 1e-9) return null;
    var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  }

  /* Wat je ziet als je recht op de tuingevel kijkt: per stuk breedte de zijde
     die het dichtst bij je staat. Bij een L-vorm zijn dat er twee — één op de
     volle diepte en één die terugligt — en dat is precies wat een
     gevelaanzicht van een L-vorm moet laten zien. Achterste eerst, zodat een
     tekening ze in die volgorde over elkaar heen kan zetten. */
  function banden(p, richting) {
    /* richting 'y' = recht op de tuingevel kijken: stroken langs x, en het
       zichtvlak per strook is de zijde met de grootste y.
       richting 'x' = van opzij kijken: stroken langs y, zichtvlak is de zijde
       met de grootste x. */
    var as = richting === 'y' ? 0 : 1;
    var diep = 1 - as;
    var xs = [];
    p.forEach(function (q) { if (xs.indexOf(q[as]) < 0) xs.push(q[as]); });
    xs.sort(function (a, b) { return a - b; });
    var uit = [];
    for (var i = 0; i < xs.length - 1; i++) {
      var mid = (xs[i] + xs[i + 1]) / 2, beste = null;
      for (var j = 0; j < p.length; j++) {
        var q = p[j], r = p[(j + 1) % p.length];
        /* Alleen zijden die dwars op de kijkrichting staan zijn een zichtvlak;
           de zijden evenwijdig aan de blik zie je op hun kant. */
        if (Math.abs(q[diep] - r[diep]) > 1e-9) continue;
        var lo = Math.min(q[as], r[as]), hi = Math.max(q[as], r[as]);
        if (mid <= lo || mid >= hi) continue;
        if (beste === null || q[diep] > beste) beste = q[diep];
      }
      if (beste !== null) uit.push({ van: rond(xs[i], 3), tot: rond(xs[i + 1], 3), diepte: rond(beste, 3) });
    }
    /* Achterste eerst: een tekening zet ze in deze volgorde over elkaar heen. */
    uit.sort(function (a, b) { return a.diepte - b.diepte; });
    return uit;
  }

  /* De vorm opgeknipt in rechthoeken. Een dakvlak wordt per rechthoek
     overspannen — balken lopen recht, niet om een hoek — dus dit is de
     verdeling waar de constructie op gebouwd wordt. De knip volgt de hap en
     staat daarom per vorm uitgeschreven in plaats van uit een algemeen
     algoritme te komen: drie vormen, drie regels, geen verrassingen. */
  function delen(vorm, w, dp, hb, hd) {
    var h = hap(vorm, w, dp, hb, hd);
    if (!h.b || !h.d || vorm === 'rechthoek' || !vorm) {
      return [{ x0: 0, y0: 0, x1: w, y1: dp, naam: 'hoofdvolume' }];
    }
    if (vorm === 'l-rechts') {
      return [
        { x0: 0, y0: 0, x1: w - h.b, y1: dp, naam: 'diepe deel' },
        { x0: w - h.b, y0: 0, x1: w, y1: dp - h.d, naam: 'ondiepe deel' }
      ];
    }
    if (vorm === 'l-links') {
      return [
        { x0: h.b, y0: 0, x1: w, y1: dp, naam: 'diepe deel' },
        { x0: 0, y0: 0, x1: h.b, y1: dp - h.d, naam: 'ondiepe deel' }
      ];
    }
    var a = (w - h.b) / 2, c = (w + h.b) / 2;
    return [
      { x0: 0, y0: 0, x1: a, y1: dp, naam: 'linkervleugel' },
      { x0: a, y0: 0, x1: c, y1: dp - h.d, naam: 'middendeel' },
      { x0: c, y0: 0, x1: w, y1: dp, naam: 'rechtervleugel' }
    ];
  }

  /* De scheidslijnen tussen de delen: daar eindigen de balken van het ene deel
     en begint het andere, dus daar ligt een moerbalk. Zonder die lijn zou een
     L-vorm getekend worden alsof het dak vanzelf de hoek om gaat. */
  function scheidingen(vorm, w, dp, hb, hd) {
    var d = delen(vorm, w, dp, hb, hd);
    var uit = [];
    for (var i = 0; i < d.length; i++) {
      for (var j = i + 1; j < d.length; j++) {
        var a = d[i], b = d[j];
        if (Math.abs(a.x1 - b.x0) < 1e-9 || Math.abs(b.x1 - a.x0) < 1e-9) {
          var x = Math.abs(a.x1 - b.x0) < 1e-9 ? a.x1 : b.x1;
          var y0 = Math.max(a.y0, b.y0), y1 = Math.min(a.y1, b.y1);
          if (y1 - y0 > 0.2) uit.push({ x: x, y0: y0, y1: y1, lengte: rond(y1 - y0, 2), richting: 'v' });
        }
      }
    }
    return uit;
  }

  /* Alles wat een tekening of een prijs van een vorm nodig heeft, in één keer. */
  function lees(cfg) {
    cfg = cfg || {};
    var w = Math.max(1, num(cfg.w, 4)), dp = Math.max(1, num(cfg.dp, 3));
    var vorm = cfg.vorm || 'rechthoek';
    var h = hap(vorm, w, dp, cfg.hoekB, cfg.hoekD);
    var p = punten(vorm, w, dp, cfg.hoekB, cfg.hoekD);
    return {
      vorm: vorm, w: w, dp: dp, hap: h, punten: p,
      opp: rond(oppervlak(p), 2),
      omtrek: rond(omtrek(p), 2),
      /* Hoeveel er van de omhullende rechthoek af gaat. Nul bij een
         rechthoek, en dat is meteen de test of een vorm iets doet. */
      afgesneden: rond(w * dp - oppervlak(p), 2),
      hoeken: p.length
    };
  }

  global.NGBouwvormen = {
    VORMEN: VORMEN, lees: lees, punten: punten, hap: hap, delen: delen, scheidingen: scheidingen,
    oppervlak: oppervlak, omtrek: omtrek, inzet: inzet, inPolygoon: inPolygoon, banden: banden
  };
})(typeof window !== 'undefined' ? window : globalThis);
