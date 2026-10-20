/* Plattegrond: de bezoeker tekent zijn eigen indeling en zet zijn eigen
 * elektra, in één nette tekening die met de aanvraag meegaat.
 *
 * Twee standen op dezelfde tekening:
 *   ruimtes — slaapkamers, badkamer, toilet en trapgat erin zetten, slepen,
 *             groter en kleiner maken; deuren schuiven langs de wand.
 *   elektra — spotjes, lamppunten, stopcontacten, schakelaars, data, airco,
 *             radiator en rookmelder vanuit de balk de tekening in slepen
 *             (of aantikken en dan in de tekening tikken).
 *
 * Alles in meters, op een raster van 10 cm. De tekening zelf is een SVG in
 * centimeters, zodat een wand van 10 cm ook echt 10 eenheden dik is.
 *
 * De gegevens staan in de keuze van de configurator (st.plattegrond), zodat
 * ze met de rest bewaard worden. Bij de aanvraag gaat er een beschrijving
 * per ruimte mee én een link naar plattegrond.html, die exact deze tekening
 * opbouwt uit de link zelf: geen opslag nodig, altijd te openen en te printen.
 *
 * Publiek: NGPlattegrond.teken(host, data, opties), .stand(naam, hosts),
 * .samenvatting(), .link(), .data(), .TYPES, .PUNTEN.
 */
(function (global) {
  'use strict';

  var RASTER = 0.1;
  var TYPES = {
    slaapkamer: { l: 'Slaapkamer', b: 3.0, d: 3.0, kleur: '#F4EFE6' },
    badkamer:   { l: 'Badkamer',   b: 2.0, d: 2.2, kleur: '#E6F0F2' },
    toilet:     { l: 'Toilet',     b: 0.9, d: 1.3, kleur: '#E6F0F2' },
    kantoor:    { l: 'Werkkamer',  b: 2.4, d: 2.4, kleur: '#EEF0E8' },
    berging:    { l: 'Berging',    b: 1.2, d: 1.2, kleur: '#EFEDEA' },
    inloopkast: { l: 'Inloopkast', b: 1.5, d: 1.2, kleur: '#EFEDEA' },
    trapgat:    { l: 'Trap',       b: 0.9, d: 2.6, kleur: '#FFFFFF' }
  };
  var PUNTEN = {
    spot:     { l: 'Spotje',        k: 'elektra' },
    lamp:     { l: 'Lamppunt',      k: 'elektra' },
    wcd:      { l: 'Stopcontact',   k: 'elektra' },
    schak:    { l: 'Schakelaar',    k: 'elektra' },
    data:     { l: 'Data / tv',     k: 'elektra' },
    rook:     { l: 'Rookmelder',    k: 'elektra' },
    airco:    { l: 'Airco',         k: 'klimaat' },
    radiator: { l: 'Radiator',      k: 'klimaat' }
  };

  function r1(v) { return Math.round(Math.round(v / RASTER) * RASTER * 100) / 100; }
  function rond(v) { return Math.round(v * 100) / 100; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function nl(v) { return (Math.round(v * 10) / 10).toFixed(1).replace('.', ','); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var nr = 0;
  function nieuwId() { nr++; return 'k' + Date.now().toString(36) + nr; }

  /* ---------- startindeling uit de gekozen indeling ---------- */
  /* Een logische startindeling bij de gekozen indeling en maten:
     slaapkamers aan de voorgevel (daar zitten de ramen), langs de
     achtergevel een overloop met de trap, en een badkamer erbij zodra er
     breedte genoeg is. De klant schuift daarna alleen nog wat hij anders wil. */
  function sjabloon(W, D, indeling, metBad) {
    var n = indeling === '1-slaapkamer' ? 1 : indeling === '2-slaapkamers' ? 2 : indeling === '3-slaapkamers' ? 3 : 0;
    var kamers = [], strook = D >= 3.4 ? 1.2 : 0, trapD = 0.9, trapB = r1(Math.min(2.6, W - 0.2));
    /* Past de badkamer niet naast de slaapkamers (smal of veel kamers), dan
       komt hij achterin naast de trap: de strook langs de achtergevel wordt
       daarvoor dieper, zolang de slaapkamers minstens 3 m diep blijven. */
    var nn = indeling === '1-slaapkamer' ? 1 : indeling === '2-slaapkamers' ? 2 : indeling === '3-slaapkamers' ? 3 : 0;
    var x0t = strook ? 0 : trapD + 0.2, achterBad = null;
    if (nn && metBad !== 'nee' && strook && rond(W - x0t) - nn * 2.0 < 1.6) {
      var sd = Math.min(2.0, rond(D - 3.0)), ab = r1(Math.min(2.6, W - trapB - 1.1));
      if (sd >= 1.5 && ab >= 1.6) { strook = sd; achterBad = { b: ab }; }
    }
    if (strook) kamers.push({ id: nieuwId(), t: 'trapgat', x: 0.1, y: rond((strook - trapD) / 2), b: trapB, d: trapD });
    else kamers.push({ id: nieuwId(), t: 'trapgat', x: 0.1, y: 0.1, b: trapD, d: r1(Math.min(2.6, D - 0.2)) });
    if (n) {
      var x0 = strook ? 0 : trapD + 0.2, voorD = rond(D - strook), breed = rond(W - x0);
      // past er naast de slaapkamers (minimaal 2,4 m breed) een badkamer van 1,8 m?
      /* Badkamer als de klant hem wil (standaard ja); past hij niet naast
         slaapkamers van 2,4 m, dan worden de slaapkamers smaller, tot 2,0 m. */
      var bad = !achterBad && metBad !== 'nee' && voorD >= 2.0 && breed - n * 2.0 >= 1.6;
      var badB = bad ? r1(clamp(breed - n * 3.2, 1.6, 2.4)) : 0;
      if (bad && breed - badB < n * 2.0) badB = r1(breed - n * 2.0);
      var rest = rond(breed - badB), per = r1(rest / n);
      for (var i = 0; i < n; i++) {
        var b = i === n - 1 ? rond(rest - per * (n - 1)) : per;
        kamers.push({ id: nieuwId(), t: 'slaapkamer', x: rond(x0 + per * i), y: strook, b: b, d: voorD, deur: { z: 'b', p: 0.5 } });
      }
      if (bad) kamers.push({ id: nieuwId(), t: 'badkamer', x: rond(x0 + rest), y: strook, b: badB, d: voorD, deur: { z: 'b', p: 0.5 } });
      if (achterBad) kamers.push({ id: nieuwId(), t: 'badkamer', x: rond(W - achterBad.b), y: 0, b: achterBad.b, d: strook, deur: { z: 'l', p: 0.5 } });
    }
    var P0 = { v: 1, w: W, d: D, ind: (indeling || 'open') + '|' + (metBad || 'ja'), eigen: false, kamers: kamers, wanden: [], punten: [], sanitair: [] };
    kamers.forEach(function (k) { P0.sanitair = P0.sanitair.concat(standaardSanitair(P0, k)); });
    return P0;
  }

  /* ---------- meetkunde ---------- */
  function binnen(k, x, y) { return x >= k.x && x <= k.x + k.b && y >= k.y && y <= k.y + k.d; }
  function ruimteVan(P, x, y) {
    for (var i = P.kamers.length - 1; i >= 0; i--) if (P.kamers[i].t !== 'trapgat' && binnen(P.kamers[i], x, y)) return P.kamers[i];
    return null;
  }
  function namen(P) {
    var tel = {}, tot = {}, uit = {};
    P.kamers.forEach(function (k) { tot[k.t] = (tot[k.t] || 0) + 1; });
    P.kamers.forEach(function (k) {
      tel[k.t] = (tel[k.t] || 0) + 1;
      uit[k.id] = TYPES[k.t].l + (tot[k.t] > 1 ? ' ' + tel[k.t] : '');
    });
    return uit;
  }
  function overlapt(a, b) {
    return a.x < b.x + b.b - 0.001 && b.x < a.x + a.b - 0.001 && a.y < b.y + b.d - 0.001 && b.y < a.y + a.d - 0.001;
  }
  /* Wat overblijft als overloop: geteld op een raster van 10 cm, zodat twee
     ruimtes die (nog) over elkaar liggen niet dubbel worden afgetrokken. */
  function vrijOppervlak(P) {
    var vrij = 0;
    for (var x = 0.05; x < P.w; x += 0.1) for (var y = 0.05; y < P.d; y += 0.1) {
      if (!P.kamers.some(function (k) { return binnen(k, x, y); })) vrij++;
    }
    return vrij / 100;
  }
  /* Een plek voor het woord "overloop": het rasterpunt dat het verst van
     alle kamers af ligt. */
  function vrijePlek(P) {
    var best = null, bd = -1;
    for (var x = 0.3; x < P.w; x += 0.2) for (var y = 0.3; y < P.d; y += 0.2) {
      var vrij = true, dmin = 99;
      P.kamers.forEach(function (k) {
        if (binnen(k, x, y)) vrij = false;
        var dx = Math.max(k.x - x, 0, x - (k.x + k.b)), dy = Math.max(k.y - y, 0, y - (k.y + k.d));
        dmin = Math.min(dmin, Math.sqrt(dx * dx + dy * dy));
      });
      dmin = Math.min(dmin, x, y, P.w - x, P.d - y);
      if (vrij && dmin > bd) { bd = dmin; best = { x: x, y: y }; }
    }
    return bd > 0.25 ? best : null;
  }

  /* ---------- tekenen ---------- */
  var M = 140; // marge in cm rond de tekening voor maatlijnen
  function cm(v) { return Math.round(v * 1000) / 10; }

  function meubels(k) {
    var x = cm(k.x), y = cm(k.y), b = cm(k.b), d = cm(k.d), s = '', st = 'fill="#fff" stroke="#8A8F8F" stroke-width="2"';
    if (k.t === 'slaapkamer') {
      /* Geen bed: de klant tekent ruimtes, geen inrichting. */
    } else if (k.t === 'trapgat') {
      var lang = Math.max(b, d), kort = Math.min(b, d), hor = b >= d, tr = Math.max(4, Math.floor(lang / 25));
      for (var i = 1; i < tr; i++) {
        var p = (lang / tr) * i;
        s += hor ? '<line x1="' + (x + p) + '" y1="' + y + '" x2="' + (x + p) + '" y2="' + (y + d) + '" stroke="#8A8F8F" stroke-width="2"/>'
                 : '<line x1="' + x + '" y1="' + (y + p) + '" x2="' + (x + b) + '" y2="' + (y + p) + '" stroke="#8A8F8F" stroke-width="2"/>';
      }
      s += hor ? '<path d="M' + (x + 10) + ' ' + (y + d / 2) + ' H' + (x + b - 22) + ' l-10 -8 m10 8 l-10 8" fill="none" stroke="#103C3C" stroke-width="2.5"/>'
               : '<path d="M' + (x + b / 2) + ' ' + (y + d - 10) + ' V' + (y + 22) + ' l-8 10 m8 -10 l8 10" fill="none" stroke="#103C3C" stroke-width="2.5"/>';
      void kort;
    }
    return s;
  }
  function toiletSym(x, y) {
    var st = 'fill="#fff" stroke="#8A8F8F" stroke-width="2"';
    return '<rect x="' + x + '" y="' + y + '" width="40" height="18" rx="3" ' + st + '/><ellipse cx="' + (x + 20) + '" cy="' + (y + 45) + '" rx="18" ry="26" ' + st + '/>';
  }

  /* ---------- sanitair ----------
     Douche, ligbad, wastafel en toilet zijn losse onderdelen: de klant
     sleept ze waar hij wil. Ze staan altijd met de achterkant tegen een wand
     (b = breedte langs de wand, d = diepte de kamer in, in cm). */
  var SANITAIR = {
    douche:   { l: 'Douche', b: 90, d: 90 },
    bad:      { l: 'Ligbad', b: 170, d: 75 },
    wastafel: { l: 'Wastafel', b: 60, d: 45 },
    wc:       { l: 'Toilet', b: 40, d: 70 }
  };
  function sanSvg(it, i, sel, bewerk) {
    var T = SANITAIR[it.t]; if (!T) return '';
    var X = cm(it.x), Y = cm(it.y), b = T.b, d = T.d, x = X - b / 2, y = Y - d / 2, st = 'fill="#fff" stroke="#6F7A7A" stroke-width="2"', s = '';
    if (it.t === 'douche') s = '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + d + '" ' + st + '/><path d="M' + x + ' ' + y + 'L' + (x + b) + ' ' + (y + d) + 'M' + (x + b) + ' ' + y + 'L' + x + ' ' + (y + d) + '" stroke="#6F7A7A" stroke-width="1.5"/><circle cx="' + X + '" cy="' + Y + '" r="5" fill="#6F7A7A"/>';
    else if (it.t === 'bad') s = '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + d + '" rx="6" ' + st + '/><rect x="' + (x + 10) + '" y="' + (y + 10) + '" width="' + (b - 20) + '" height="' + (d - 20) + '" rx="26" ' + st + '/>';
    else if (it.t === 'wastafel') s = '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + d + '" rx="4" ' + st + '/><ellipse cx="' + X + '" cy="' + (Y + 3) + '" rx="' + (b / 2 - 9) + '" ry="' + (d / 2 - 9) + '" ' + st + '/>';
    else if (it.t === 'wc') s = '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="18" rx="3" ' + st + '/><ellipse cx="' + X + '" cy="' + (y + 18 + (d - 18) / 2) + '" rx="' + (b / 2 - 2) + '" ry="' + ((d - 18) / 2) + '" ' + st + '/>';
    if (it.r) s = '<g transform="rotate(' + it.r + ' ' + X + ' ' + Y + ')">' + s + '</g>';
    if (sel) s += '<circle cx="' + X + '" cy="' + Y + '" r="' + (Math.max(b, d) / 2 + 10) + '" fill="none" stroke="var(--pl-acc)" stroke-width="3" stroke-dasharray="10 7"/>';
    return '<g data-san="' + i + '"' + (bewerk ? ' style="cursor:grab"' : '') + '><rect x="' + (X - Math.max(b, d) / 2) + '" y="' + (Y - Math.max(b, d) / 2) + '" width="' + Math.max(b, d) + '" height="' + Math.max(b, d) + '" fill="transparent"/>' + s + '</g>';
  }
  /* Tegen de dichtstbijzijnde wand, achterkant naar de wand. */
  function sanTegenWand(P, it) {
    var T = SANITAIR[it.t]; if (!T) return it;
    var best = null, bd = 1e9;
    wandSegmenten(P).forEach(function (sg) {
      var dx = sg[2] - sg[0], dy = sg[3] - sg[1], l2 = dx * dx + dy * dy || 1e-9;
      var t = clamp(((it.x - sg[0]) * dx + (it.y - sg[1]) * dy) / l2, 0, 1);
      var x = sg[0] + t * dx, y = sg[1] + t * dy, dd = (x - it.x) * (x - it.x) + (y - it.y) * (y - it.y);
      if (dd < bd) { bd = dd; best = { x: x, y: y, hor: Math.abs(dy) < 1e-6, sg: sg }; }
    });
    if (!best) return it;
    var half = T.d / 200, hb = T.b / 200, o = { t: it.t };
    if (best.hor) {
      var onder = it.y > best.y || best.y <= 0.001; if (best.y >= P.d - 0.001) onder = false;
      o.r = onder ? 0 : 180; o.y = best.y + (onder ? half : -half);
      o.x = clamp(it.x, Math.min(best.sg[0], best.sg[2]) + hb, Math.max(best.sg[0], best.sg[2]) - hb);
    } else {
      var rechts = it.x > best.x || best.x <= 0.001; if (best.x >= P.w - 0.001) rechts = false;
      o.r = rechts ? -90 : 90; o.x = best.x + (rechts ? half : -half);
      o.y = clamp(it.y, Math.min(best.sg[1], best.sg[3]) + hb, Math.max(best.sg[1], best.sg[3]) - hb);
    }
    o.x = rond(o.x); o.y = rond(o.y);
    return o;
  }
  function standaardSanitair(P, k) {
    var lijst = k.t === 'toilet' ? [['wc', k.x + k.b / 2, k.y + k.d - 0.1]]
      : k.t === 'badkamer' ? [['douche', k.x + k.b - 0.2, k.y + 0.2], ['wastafel', k.x + 0.2, k.y + Math.min(1.0, k.d / 3)], ['wc', k.x + 0.2, k.y + k.d - 0.5]] : [];
    return lijst.map(function (a) { return sanTegenWand(P, { t: a[0], x: a[1], y: a[2] }); });
  }
  function sanInKamer(P, k) { return (P.sanitair || []).filter(function (it) { return it.x >= k.x - 0.01 && it.x <= k.x + k.b + 0.01 && it.y >= k.y - 0.01 && it.y <= k.y + k.d + 0.01; }); }

  /* Een deur: opening in de wand plus draaicirkel de kamer in. */
  function deurGeo(k) {
    var dr = k.deur; if (!dr) return null;
    var w = 0.8, z = dr.z, x, y, len = (z === 'b' || z === 'o') ? k.b : k.d;
    if (len < w + 0.1) return null;
    var p = clamp(dr.p, (w / 2 + 0.05) / len, 1 - (w / 2 + 0.05) / len);
    var mid = p * len;
    if (z === 'b') { x = k.x + mid; y = k.y; }
    else if (z === 'o') { x = k.x + mid; y = k.y + k.d; }
    else if (z === 'l') { x = k.x; y = k.y + mid; }
    else { x = k.x + k.b; y = k.y + mid; }
    return { x: x, y: y, z: z, w: w };
  }
  function deurSvg(k, id, actief) {
    var g = deurGeo(k); if (!g) return '';
    var X = cm(g.x), Y = cm(g.y), h = cm(g.w) / 2, R = cm(g.w), s = '';
    var hor = g.z === 'b' || g.z === 'o', inw = (g.z === 'b' || g.z === 'l') ? 1 : -1;
    if (hor) {
      s += '<line x1="' + (X - h) + '" y1="' + Y + '" x2="' + (X + h) + '" y2="' + Y + '" stroke="#fff" stroke-width="14"/>';
      s += '<line x1="' + (X - h) + '" y1="' + Y + '" x2="' + (X - h) + '" y2="' + (Y + inw * R) + '" stroke="#103C3C" stroke-width="2.5"/>';
      s += '<path d="M' + (X - h) + ' ' + (Y + inw * R) + ' A' + R + ' ' + R + ' 0 0 ' + (inw > 0 ? 0 : 1) + ' ' + (X + h) + ' ' + Y + '" fill="none" stroke="#103C3C" stroke-width="1.5" stroke-dasharray="5 4"/>';
    } else {
      s += '<line x1="' + X + '" y1="' + (Y - h) + '" x2="' + X + '" y2="' + (Y + h) + '" stroke="#fff" stroke-width="14"/>';
      s += '<line x1="' + X + '" y1="' + (Y - h) + '" x2="' + (X + inw * R) + '" y2="' + (Y - h) + '" stroke="#103C3C" stroke-width="2.5"/>';
      s += '<path d="M' + (X + inw * R) + ' ' + (Y - h) + ' A' + R + ' ' + R + ' 0 0 ' + (inw > 0 ? 1 : 0) + ' ' + X + ' ' + (Y + h) + '" fill="none" stroke="#103C3C" stroke-width="1.5" stroke-dasharray="5 4"/>';
    }
    if (actief) s += '<circle data-deur="' + id + '" cx="' + X + '" cy="' + Y + '" r="16" fill="var(--pl-acc)" stroke="#fff" stroke-width="4" style="cursor:grab"/>';
    return s;
  }

  /* Losse wand: recht, horizontaal of verticaal, 10 cm dik, met een
     eventuele deur halverwege (p = plek langs de wand, 0..1). */
  function wandSvg(w, i, sel) {
    var x1 = cm(w.x1), y1 = cm(w.y1), x2 = cm(w.x2), y2 = cm(w.y2), hor = Math.abs(w.y1 - w.y2) < 0.001, s = '';
    var len = hor ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
    s += '<g data-wand="' + i + '" style="cursor:move"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="transparent" stroke-width="40"/>';
    s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#103C3C" stroke-width="10" stroke-linecap="square"/>';
    if (w.deur != null && len >= 90) {
      var h = 40, mid = clamp(w.deur * len, h + 5, len - h - 5), R = 80;
      if (hor) {
        var X = Math.min(x1, x2) + mid, Y = y1;
        s += '<line x1="' + (X - h) + '" y1="' + Y + '" x2="' + (X + h) + '" y2="' + Y + '" stroke="#fff" stroke-width="14"/><line x1="' + (X - h) + '" y1="' + Y + '" x2="' + (X - h) + '" y2="' + (Y + R) + '" stroke="#103C3C" stroke-width="2.5"/><path d="M' + (X - h) + ' ' + (Y + R) + ' A' + R + ' ' + R + ' 0 0 0 ' + (X + h) + ' ' + Y + '" fill="none" stroke="#103C3C" stroke-width="1.5" stroke-dasharray="5 4"/>';
      } else {
        var X2 = x1, Y2 = Math.min(y1, y2) + mid;
        s += '<line x1="' + X2 + '" y1="' + (Y2 - h) + '" x2="' + X2 + '" y2="' + (Y2 + h) + '" stroke="#fff" stroke-width="14"/><line x1="' + X2 + '" y1="' + (Y2 - h) + '" x2="' + (X2 + R) + '" y2="' + (Y2 - h) + '" stroke="#103C3C" stroke-width="2.5"/><path d="M' + (X2 + R) + ' ' + (Y2 - h) + ' A' + R + ' ' + R + ' 0 0 1 ' + X2 + ' ' + (Y2 + h) + '" fill="none" stroke="#103C3C" stroke-width="1.5" stroke-dasharray="5 4"/>';
      }
    }
    if (sel) s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="var(--pl-acc)" stroke-width="4" stroke-dasharray="12 8"/>';
    s += '</g>';
    if (sel) [[x1, y1, 0], [x2, y2, 1]].forEach(function (e) {
      s += '<circle data-wandeind="' + i + ':' + e[2] + '" cx="' + e[0] + '" cy="' + e[1] + '" r="18" fill="var(--pl-acc)" stroke="#fff" stroke-width="4" style="cursor:pointer"/>';
    });
    return s;
  }

  /* De gekozen kozijnen in de gevel: voorgevel onderaan, achtergevel
     bovenaan. Breedtes in cm, gecentreerd, met 40 cm tussen twee kozijnen. */
  var KOZIJNEN = {
    model01: { l: 'Schuifpui', delen: [{ b: 300, t: 'schuif', v: 3 }] },
    model02: { l: 'Openslaande deuren', delen: [{ b: 180, t: 'deuren' }] },
    model03: { l: '2-vaks + 3-vaks', delen: [{ b: 135, t: 'raam', v: 2 }, { b: 170, t: 'raam', v: 3 }] },
    model04: { l: 'Klein + 2-vaks', delen: [{ b: 120, t: 'raam', v: 1 }, { b: 135, t: 'raam', v: 2 }] },
    raam:    { l: 'Eén raam', delen: [{ b: 100, t: 'raam', v: 1 }] },
    twee:    { l: 'Twee ramen', delen: [{ b: 100, t: 'raam', v: 1 }, { b: 100, t: 'raam', v: 1 }] },
    dicht:   { l: 'Dichte gevel', delen: [] }
  };
  function gevelKozijnen(model, W, D, voor) {
    var K = KOZIJNEN[model] || KOZIJNEN.raam, s = '', tot = 0;
    K.delen.forEach(function (d, i) { tot += d.b + (i ? 40 : 0); });
    var schaal = tot > W - 40 ? (W - 40) / tot : 1, x = (W - tot * schaal) / 2;
    var y0 = voor ? D : -20, binnen = voor ? D : 0, uit = voor ? 1 : -1;
    K.delen.forEach(function (d, i) {
      if (i) x += 40 * schaal;
      var b = d.b * schaal;
      s += '<rect x="' + x + '" y="' + y0 + '" width="' + b + '" height="20" fill="#fff" stroke="#103C3C" stroke-width="2"/>';
      if (d.t === 'deuren') {
        var h = b / 2;
        s += '<path d="M' + x + ' ' + (y0 + (voor ? 20 : 0)) + ' L' + x + ' ' + (y0 + (voor ? 20 : 0) + uit * h) + ' A' + h + ' ' + h + ' 0 0 ' + (voor ? 0 : 1) + ' ' + (x + h) + ' ' + (y0 + (voor ? 20 : 0))
          + ' M' + (x + b) + ' ' + (y0 + (voor ? 20 : 0)) + ' L' + (x + b) + ' ' + (y0 + (voor ? 20 : 0) + uit * h) + ' A' + h + ' ' + h + ' 0 0 ' + (voor ? 1 : 0) + ' ' + (x + h) + ' ' + (y0 + (voor ? 20 : 0)) + '" fill="none" stroke="#103C3C" stroke-width="2" stroke-dasharray="6 4"/>';
      } else {
        var v = d.v || 1, vb = b / v;
        for (var k = 1; k < v; k++) s += '<line x1="' + (x + vb * k) + '" y1="' + y0 + '" x2="' + (x + vb * k) + '" y2="' + (y0 + 20) + '" stroke="#103C3C" stroke-width="2"/>';
        if (d.t === 'schuif') {
          s += '<line x1="' + x + '" y1="' + (y0 + 7) + '" x2="' + (x + b * 0.55) + '" y2="' + (y0 + 7) + '" stroke="#103C3C" stroke-width="2"/><line x1="' + (x + b * 0.45) + '" y1="' + (y0 + 13) + '" x2="' + (x + b) + '" y2="' + (y0 + 13) + '" stroke="#103C3C" stroke-width="2"/>';
          var ay = binnen - uit * 22;
          s += '<path d="M' + (x + b * 0.3) + ' ' + ay + ' h' + (b * 0.4) + ' l-10 -7 m10 7 l-10 7" fill="none" stroke="var(--pl-acc,#EE4E34)" stroke-width="2.5"/>';
        } else s += '<line x1="' + x + '" y1="' + (y0 + 10) + '" x2="' + (x + b) + '" y2="' + (y0 + 10) + '" stroke="#103C3C" stroke-width="1.5"/>';
      }
      x += b;
    });
    var ly = voor ? D + (model === 'model02' ? 110 : 52) : (model === 'model02' && !voor ? -110 : -40), naam = (voor ? 'VOORGEVEL' : 'ACHTERGEVEL') + ' · ' + K.l.toUpperCase();
    try { var mk = global.NGMerk && global.NGMerk.merk && global.NGMerk.merk(), km = mk && !mk.demo && mk.kozijnMaten && mk.kozijnMaten[voor ? 'voor' : 'achter'];
      var lm = km && km[model]; if (lm && lm.length) naam += ' · ' + lm.map(function (d) { return d.b + '×' + d.h; }).join(' + ') + ' CM'; } catch (e) { /* zonder maten */ }
    s += '<text x="' + (W / 2) + '" y="' + ly + '" text-anchor="middle" font-size="16" font-weight="700" fill="#5B6B6B" letter-spacing="1.5">' + naam + '</text>';
    return s;
  }

  function puntSvg(p, i, sel) {
    var X = cm(p.x), Y = cm(p.y), a = 'var(--pl-acc)', s = '', k = '#2B6CB0';
    switch (p.t) {
      case 'spot': s = '<circle cx="' + X + '" cy="' + Y + '" r="9" fill="' + a + '"/><circle cx="' + X + '" cy="' + Y + '" r="14" fill="none" stroke="' + a + '" stroke-width="2"/>'; break;
      case 'lamp': s = '<circle cx="' + X + '" cy="' + Y + '" r="15" fill="#fff" stroke="' + a + '" stroke-width="3"/><path d="M' + (X - 10) + ' ' + (Y - 10) + 'L' + (X + 10) + ' ' + (Y + 10) + 'M' + (X + 10) + ' ' + (Y - 10) + 'L' + (X - 10) + ' ' + (Y + 10) + '" stroke="' + a + '" stroke-width="3"/>'; break;
      case 'wcd': s = '<path d="M' + (X - 14) + ' ' + Y + ' A14 14 0 0 1 ' + (X + 14) + ' ' + Y + ' Z" fill="#fff" stroke="' + a + '" stroke-width="3"/><line x1="' + X + '" y1="' + Y + '" x2="' + X + '" y2="' + (Y + 12) + '" stroke="' + a + '" stroke-width="3"/><circle cx="' + (X - 5) + '" cy="' + (Y - 5) + '" r="2" fill="' + a + '"/><circle cx="' + (X + 5) + '" cy="' + (Y - 5) + '" r="2" fill="' + a + '"/>'; break;
      case 'schak': s = '<circle cx="' + X + '" cy="' + Y + '" r="8" fill="#fff" stroke="' + a + '" stroke-width="3"/><line x1="' + (X + 5) + '" y1="' + (Y - 5) + '" x2="' + (X + 17) + '" y2="' + (Y - 17) + '" stroke="' + a + '" stroke-width="3"/>'; break;
      case 'data': s = '<path d="M' + X + ' ' + (Y - 14) + ' L' + (X + 14) + ' ' + (Y + 11) + ' L' + (X - 14) + ' ' + (Y + 11) + ' Z" fill="#fff" stroke="' + a + '" stroke-width="3"/>'; break;
      case 'rook': s = '<circle cx="' + X + '" cy="' + Y + '" r="15" fill="#fff" stroke="' + a + '" stroke-width="3"/><text x="' + X + '" y="' + (Y + 6) + '" text-anchor="middle" font-size="17" font-weight="800" fill="' + a + '">R</text>'; break;
      case 'airco': s = '<rect x="' + (X - 40) + '" y="' + (Y - 11) + '" width="80" height="22" rx="5" fill="#fff" stroke="' + k + '" stroke-width="3"/><text x="' + X + '" y="' + (Y + 6) + '" text-anchor="middle" font-size="15" font-weight="800" fill="' + k + '">AIRCO</text>'; break;
      case 'radiator': s = '<rect x="' + (X - 32) + '" y="' + (Y - 8) + '" width="64" height="16" fill="#fff" stroke="' + k + '" stroke-width="3"/><path d="M' + (X - 22) + ' ' + (Y - 8) + 'V' + (Y + 8) + 'M' + (X - 8) + ' ' + (Y - 8) + 'V' + (Y + 8) + 'M' + (X + 8) + ' ' + (Y - 8) + 'V' + (Y + 8) + 'M' + (X + 22) + ' ' + (Y - 8) + 'V' + (Y + 8) + '" stroke="' + k + '" stroke-width="2"/>'; break;
    }
    if (p.r) s = '<g transform="rotate(' + p.r + ' ' + X + ' ' + Y + ')">' + s + '</g>';
    var ring = sel ? '<circle cx="' + X + '" cy="' + Y + '" r="26" fill="none" stroke="#103C3C" stroke-width="2.5" stroke-dasharray="5 4"/>' : '';
    return '<g data-punt="' + i + '" style="cursor:grab">' + '<circle cx="' + X + '" cy="' + Y + '" r="26" fill="transparent"/>' + ring + s + '</g>';
  }

  function maatlijn(x1, y1, x2, y2, tekst, vert) {
    var s = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#5B6B6B" stroke-width="1.5"/>';
    if (vert) {
      s += '<line x1="' + (x1 - 8) + '" y1="' + y1 + '" x2="' + (x1 + 8) + '" y2="' + y1 + '" stroke="#5B6B6B" stroke-width="1.5"/><line x1="' + (x2 - 8) + '" y1="' + y2 + '" x2="' + (x2 + 8) + '" y2="' + y2 + '" stroke="#5B6B6B" stroke-width="1.5"/>';
      s += '<text x="' + (x1 - 12) + '" y="' + ((y1 + y2) / 2) + '" text-anchor="middle" font-size="20" fill="#3D4B4B" transform="rotate(-90 ' + (x1 - 12) + ' ' + ((y1 + y2) / 2) + ')">' + tekst + '</text>';
    } else {
      s += '<line x1="' + x1 + '" y1="' + (y1 - 8) + '" x2="' + x1 + '" y2="' + (y1 + 8) + '" stroke="#5B6B6B" stroke-width="1.5"/><line x1="' + x2 + '" y1="' + (y2 - 8) + '" x2="' + x2 + '" y2="' + (y2 + 8) + '" stroke="#5B6B6B" stroke-width="1.5"/>';
      s += '<text x="' + ((x1 + x2) / 2) + '" y="' + (y1 - 10) + '" text-anchor="middle" font-size="20" fill="#3D4B4B">' + tekst + '</text>';
    }
    return s;
  }

  function svgVan(P, o) {
    o = o || {};
    var W = cm(P.w), D = cm(P.d), nm = namen(P), s = '';
    var vb = (-M) + ' ' + (-M) + ' ' + (W + 2 * M) + ' ' + (D + 2 * M + 10);
    s += '<svg xmlns="http://www.w3.org/2000/svg" class="pl__svg" viewBox="' + vb + '" font-family="Inter, system-ui, sans-serif">';
    s += '<rect x="' + (-M) + '" y="' + (-M) + '" width="' + (W + 2 * M) + '" height="' + (D + 2 * M + 10) + '" fill="#fff"/>';
    // vloer en raster
    s += '<rect x="0" y="0" width="' + W + '" height="' + D + '" fill="#FBFAF7"/>';
    if (o.raster) {
      for (var gx = 50; gx < W; gx += 50) s += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + D + '" stroke="#ECE8DF" stroke-width="1"/>';
      for (var gy = 50; gy < D; gy += 50) s += '<line x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="#ECE8DF" stroke-width="1"/>';
    }
    // kamers
    P.kamers.forEach(function (k, i) {
      var T = TYPES[k.t], x = cm(k.x), y = cm(k.y), b = cm(k.b), d = cm(k.d);
      var fout = P.kamers.some(function (q) { return q !== k && overlapt(q, k); }) || k.x < -0.001 || k.y < -0.001 || k.x + k.b > P.w + 0.001 || k.y + k.d > P.d + 0.001;
      var sel = o.selectie === k.id;
      s += '<g data-kamer="' + i + '"' + (o.bewerk ? ' style="cursor:move"' : '') + '>';
      s += '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + d + '" fill="' + T.kleur + '" stroke="' + (fout ? '#D93025' : '#103C3C') + '" stroke-width="' + (k.t === 'trapgat' ? 3 : 10) + '"' + (k.t === 'trapgat' ? ' stroke-dasharray="10 6"' : '') + '/>';
      s += meubels(k);
      if (sel) s += '<rect x="' + (x - 8) + '" y="' + (y - 8) + '" width="' + (b + 16) + '" height="' + (d + 16) + '" fill="none" stroke="var(--pl-acc)" stroke-width="4" stroke-dasharray="12 8"/>';
      s += '</g>';
    });
    (P.sanitair || []).forEach(function (it, i) { s += sanSvg(it, i, o.bewerk && o.sanSel === i, o.bewerk); });
    // deuren
    P.kamers.forEach(function (k, i) { s += deurSvg(k, i, o.bewerk && o.selectie === k.id); });
    (P.wanden || []).forEach(function (w, i) { s += wandSvg(w, i, o.bewerk && o.wandSel === i); });
    // buitenwand en ramen
    s += '<rect x="-10" y="-10" width="' + (W + 20) + '" height="' + (D + 20) + '" fill="none" stroke="#103C3C" stroke-width="20"/>';
    s += gevelKozijnen(P.kv || 'model01', W, D, true);
    s += gevelKozijnen(P.ka || 'raam', W, D, false);
    // namen en maten
    P.kamers.forEach(function (k) {
      if (k.t === 'trapgat') {
        s += '<text pointer-events="none" x="' + cm(k.x + k.b / 2) + '" y="' + (cm(k.y) - 8 < 14 ? cm(k.y + k.d) + 20 : cm(k.y) - 8) + '" text-anchor="middle" font-size="15" font-weight="800" fill="#103C3C">TRAP</text>';
        return;
      }
      var cx = cm(k.x + k.b / 2), cy = cm(k.y + k.d / 2), klein = k.b < 1.4 || k.d < 1.4, f = klein ? 15 : 20;
      var ty = cy;
      s += '<g pointer-events="none"><text x="' + cx + '" y="' + ty + '" text-anchor="middle" font-size="' + f + '" font-weight="800" fill="#103C3C">' + esc(nm[k.id]) + '</text>';
      s += '<text x="' + cx + '" y="' + (ty + f + 4) + '" text-anchor="middle" font-size="' + (f - 3) + '" fill="#3D4B4B">' + nl(k.b) + ' × ' + nl(k.d) + ' m · ' + nl(k.b * k.d) + ' m²</text></g>';
    });
    var vp = vrijePlek(P);
    if (vp) s += '<g pointer-events="none"><text x="' + cm(vp.x) + '" y="' + cm(vp.y) + '" text-anchor="middle" font-size="18" font-weight="800" fill="#103C3C">Overloop</text><text x="' + cm(vp.x) + '" y="' + (cm(vp.y) + 20) + '" text-anchor="middle" font-size="15" fill="#3D4B4B">' + nl(vrijOppervlak(P)) + ' m²</text></g>';
    // elektra en klimaat
    if (o.punten !== false) P.punten.forEach(function (p, i) { s += puntSvg(p, i, o.puntSel === i); });
    // greep om de geselecteerde kamer groter of kleiner te maken
    if (o.bewerk) {
      var ks = null; P.kamers.forEach(function (k) { if (k.id === o.selectie) ks = k; });
      if (ks) s += '<g data-greep="1" style="cursor:nwse-resize"><circle cx="' + cm(ks.x + ks.b) + '" cy="' + cm(ks.y + ks.d) + '" r="22" fill="var(--pl-acc)" stroke="#fff" stroke-width="5"/><path d="M' + (cm(ks.x + ks.b) - 8) + ' ' + (cm(ks.y + ks.d) + 1) + 'l9 9 0-9zM' + (cm(ks.x + ks.b) + 8) + ' ' + (cm(ks.y + ks.d) - 1) + 'l-9-9 0 9z" fill="#fff"/></g>';
    }
    // maatvoering en gevels
    s += maatlijn(0, -M + 30, W, -M + 30, nl(P.w) + ' m', false);
    s += maatlijn(-40, 0, -40, D, nl(P.d) + ' m', true);
    s += '</svg>';
    return s;
  }

  /* ---------- bewerken ---------- */
  var S = { P: null, stand: 'ruimtes', sel: null, wandSel: null, sanSel: null, puntSel: null, gereedschap: null, hosts: null, sleep: null, actief: false };

  function keuze() { return global.NGKeuze ? global.NGKeuze() : null; }
  /* Ongedaan maken: na elke wijziging een momentopname. */
  var historie = [];
  function moment() {
    var j = JSON.stringify(S.P);
    if (historie[historie.length - 1] !== j) historie.push(j);
    if (historie.length > 60) historie.shift();
  }
  function bewaar() {
    moment();
    var st = keuze(); if (st) st.plattegrond = S.P;
    if (S.stand === 'elektra') zetElektra();
  }
  /* De aantallen uit de tekening gaan terug in de elektrakeuze, zodat de
     materiaalstaat en de tekeningen dezelfde aantallen tonen. */
  function zetElektra() {
    var st = keuze(); if (!st || !st.elektra) return;
    var tel = {}; S.P.punten.forEach(function (p) { tel[p.t] = (tel[p.t] || 0) + 1; });
    var kop = { spot: 'spotjes', lamp: 'lamp-punten-binnen', wcd: 'stopcontacten-binnen' };
    Object.keys(kop).forEach(function (t) { if (tel[t]) st.elektra[kop[t]] = tel[t]; else delete st.elektra[kop[t]]; });
    if (tel.radiator) st.elektra.radiator = true; else delete st.elektra.radiator;
  }

  function synchroniseer() {
    var st = keuze(); if (!st) return;
    var W = r1(st.w || 4), D = r1(st.dp || 3), ind = (st.indeling || 'open') + '|' + (st.metBad || 'ja');
    var P = S.P || st.plattegrond;
    /* Een andere indeling of badkamerkeuze is een bewuste keuze: dan een
       nieuwe tekening, ook als de klant de oude al had aangepast. */
    if (!P || P.ind !== ind || (!P.eigen && (P.w !== W || P.d !== D))) P = sjabloon(W, D, st.indeling || 'open', st.metBad);
    else if (P.w !== W || P.d !== D) {
      P.w = W; P.d = D;
      P.kamers.forEach(function (k) { k.b = Math.min(k.b, W); k.d = Math.min(k.d, D); k.x = clamp(k.x, 0, rond(W - k.b)); k.y = clamp(k.y, 0, rond(D - k.d)); });
      P.punten = P.punten.filter(function (p) { return p.x <= W && p.y <= D; });
    }
    if (!P.wanden) P.wanden = [];
    if (!P.sanitair) { P.sanitair = []; P.kamers.forEach(function (k) { P.sanitair = P.sanitair.concat(standaardSanitair(P, k)); }); }
    P.kv = st.kozijnindeling; P.ka = st.kozijnAchter;
    P.wanden.forEach(function (w) { w.x1 = Math.min(w.x1, P.w); w.x2 = Math.min(w.x2, P.w); w.y1 = Math.min(w.y1, P.d); w.y2 = Math.min(w.y2, P.d); });
    S.P = P; st.plattegrond = P;
  }

  function svgPunt(svg, e) {
    var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: q.x / 100, y: q.y / 100 };
  }

  function teken() {
    if (!S.hosts) return;
    var P = S.P, h = S.hosts;
    h.tekening.innerHTML = svgVan(P, { bewerk: S.stand === 'ruimtes', selectie: S.sel, wandSel: S.wandSel, sanSel: S.sanSel, raster: true, puntSel: S.puntSel });
    h.tekening.classList.toggle('pl--elektra', S.stand === 'elektra');
    bindTekening(h.tekening.querySelector('svg'));
    bediening();
  }

  /* De tekening ververst binnen dezelfde SVG: zo blijft een sleepbeweging
     die net begonnen is aan het element hangen. */
  function ververs(svg) {
    var tmp = document.createElement('div');
    tmp.innerHTML = svgVan(S.P, { bewerk: S.stand === 'ruimtes', selectie: S.sel, wandSel: S.wandSel, sanSel: S.sanSel, raster: true, puntSel: S.puntSel });
    svg.innerHTML = tmp.firstChild.innerHTML;
  }
  function bindTekening(svg) {
    svg.addEventListener('pointerdown', function (e) {
      var p = svgPunt(svg, e), P = S.P;
      var wand = e.target.closest('[data-wand]'), wandeind = e.target.closest('[data-wandeind]'), san = e.target.closest('[data-san]');
      var greep = e.target.closest('[data-greep]'), deur = e.target.closest('[data-deur]'), punt = e.target.closest('[data-punt]'), kamer = e.target.closest('[data-kamer]');
      if (S.stand === 'elektra') {
        if (punt) {
          var i = +punt.getAttribute('data-punt');
          S.sleep = { soort: 'punt', i: i, start: p, bewogen: false };
        } else if (S.gereedschap && p.x >= 0 && p.y >= 0 && p.x <= P.w && p.y <= P.d) {
          P.punten.push(inWand(P, { t: S.gereedschap, x: rond(p.x), y: rond(p.y) }));
          S.puntSel = P.punten.length - 1; P.eigen = true; bewaar(); teken(); return;
        } else { S.puntSel = null; teken(); return; }
      } else {
        if (san) { S.sleep = { soort: 'san', i: +san.getAttribute('data-san'), start: p, bewogen: false }; S.sel = null; S.wandSel = null; }
        else if (wandeind) { var we = wandeind.getAttribute('data-wandeind').split(':'); S.sleep = { soort: 'wandeind', i: +we[0], e: +we[1] }; }
        else if (wand) {
          var wi = +wand.getAttribute('data-wand'), ww = P.wanden[wi];
          S.wandSel = wi; S.sel = null; S.sleep = { soort: 'wand', w: ww, dx: p.x - ww.x1, dy: p.y - ww.y1 };
          ververs(svg); bediening();
        }
        else if (greep) S.sleep = { soort: 'greep' };
        else if (deur) S.sleep = { soort: 'deur', i: +deur.getAttribute('data-deur') };
        else if (kamer) {
          var k = P.kamers[+kamer.getAttribute('data-kamer')];
          S.wandSel = null; S.sanSel = null; S.sel = k.id;
          S.sleep = { soort: 'kamer', k: k, dx: p.x - k.x, dy: p.y - k.y, mee: sanInKamer(P, k).map(function (it) { return { it: it, rx: it.x - k.x, ry: it.y - k.y }; }) };
          ververs(svg); bediening();
        } else { S.sel = null; S.wandSel = null; S.sanSel = null; teken(); return; }
      }
      e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch (x) { /* oude browser */ }
      svg.addEventListener('pointermove', beweeg);
      svg.addEventListener('pointerup', los);
      svg.addEventListener('pointercancel', los);
      function beweeg(ev) {
        var q = svgPunt(svg, ev), sl = S.sleep; if (!sl) return;
        if (sl.soort === 'san') {
          if (Math.abs(q.x - sl.start.x) + Math.abs(q.y - sl.start.y) > 0.05) sl.bewogen = true;
          if (sl.bewogen) P.sanitair[sl.i] = sanTegenWand(P, { t: P.sanitair[sl.i].t, x: clamp(q.x, 0, P.w), y: clamp(q.y, 0, P.d) });
        } else if (sl.soort === 'wand') {
          var w = sl.w, lx = w.x2 - w.x1, ly = w.y2 - w.y1;
          var nx = clamp(r1(q.x - sl.dx), Math.max(0, -lx), Math.min(P.w, P.w - lx)), ny = clamp(r1(q.y - sl.dy), Math.max(0, -ly), Math.min(P.d, P.d - ly));
          w.x1 = rond(nx); w.y1 = rond(ny); w.x2 = rond(nx + lx); w.y2 = rond(ny + ly);
        } else if (sl.soort === 'wandeind') {
          var wd = P.wanden[sl.i], hz = Math.abs(wd.y1 - wd.y2) < 0.001, k2 = sl.e ? '2' : '1';
          if (hz) wd['x' + k2] = rond(clamp(r1(q.x), 0, P.w)); else wd['y' + k2] = rond(clamp(r1(q.y), 0, P.d));
        } else if (sl.soort === 'kamer') {
          sl.k.x = clamp(r1(q.x - sl.dx), 0, rond(P.w - sl.k.b)); sl.k.y = clamp(r1(q.y - sl.dy), 0, rond(P.d - sl.k.d));
          (sl.mee || []).forEach(function (m) { m.it.x = rond(sl.k.x + m.rx); m.it.y = rond(sl.k.y + m.ry); });
        } else if (sl.soort === 'greep') {
          var ks = P.kamers.filter(function (k) { return k.id === S.sel; })[0]; if (!ks) return;
          ks.b = clamp(r1(q.x - ks.x), 0.6, rond(P.w - ks.x)); ks.d = clamp(r1(q.y - ks.y), 0.6, rond(P.d - ks.y));
        } else if (sl.soort === 'deur') {
          var kd = P.kamers[sl.i], cands = [
            { z: 'b', d: Math.abs(q.y - kd.y), p: (q.x - kd.x) / kd.b }, { z: 'o', d: Math.abs(q.y - kd.y - kd.d), p: (q.x - kd.x) / kd.b },
            { z: 'l', d: Math.abs(q.x - kd.x), p: (q.y - kd.y) / kd.d }, { z: 'r', d: Math.abs(q.x - kd.x - kd.b), p: (q.y - kd.y) / kd.d }];
          cands.sort(function (a, b) { return a.d - b.d; });
          kd.deur = { z: cands[0].z, p: clamp(cands[0].p, 0, 1) };
        } else if (sl.soort === 'punt') {
          if (Math.abs(q.x - sl.start.x) + Math.abs(q.y - sl.start.y) > 0.05) sl.bewogen = true;
          var pp = P.punten[sl.i], np = inWand(P, { t: pp.t, x: rond(clamp(q.x, 0, P.w)), y: rond(clamp(q.y, 0, P.d)) });
          pp.x = np.x; pp.y = np.y; if (np.r != null) pp.r = np.r;
        }
        P.eigen = true;
        ververs(svg);
      }
      function los() {
        svg.removeEventListener('pointermove', beweeg); svg.removeEventListener('pointerup', los); svg.removeEventListener('pointercancel', los);
        var sl = S.sleep; S.sleep = null;
        if (sl && sl.soort === 'punt' && !sl.bewogen) S.puntSel = S.puntSel === sl.i ? null : sl.i;
        if (sl && sl.soort === 'san') S.sanSel = sl.i;
        bewaar(); teken();
      }
    });
  }

  /* Uit de balk de tekening in slepen. Werkt met muis en vinger; wie
     liever tikt, tikt een symbool aan en daarna de plek in de tekening. */
  function sleepUitBalk(e, t) {
    var svg = S.hosts.tekening.querySelector('svg'); if (!svg) return;
    var spook = document.createElement('div');
    spook.className = 'pl__spook';
    spook.innerHTML = symboolIcoon(t);
    document.body.appendChild(spook);
    var startX = e.clientX, startY = e.clientY, bewogen = false;
    function plaats(ev) { spook.style.left = ev.clientX + 'px'; spook.style.top = ev.clientY + 'px'; }
    plaats(e);
    function beweeg(ev) { if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 6) bewogen = true; plaats(ev); ev.preventDefault(); }
    function los(ev) {
      document.removeEventListener('pointermove', beweeg); document.removeEventListener('pointerup', los); document.removeEventListener('pointercancel', los);
      spook.remove();
      if (!bewogen) { S.gereedschap = S.gereedschap === t ? null : t; bediening(); return; }
      var r = svg.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return;
      var p = svgPunt(svg, ev), P = S.P;
      if (p.x < 0 || p.y < 0 || p.x > P.w || p.y > P.d) return;
      P.punten.push(inWand(P, { t: t, x: rond(p.x), y: rond(p.y) }));
      S.puntSel = P.punten.length - 1; P.eigen = true; bewaar(); teken();
    }
    document.addEventListener('pointermove', beweeg, { passive: false });
    document.addEventListener('pointerup', los);
    document.addEventListener('pointercancel', los);
  }

  function symboolIcoon(t) {
    return '<svg viewBox="-30 -30 60 60" width="30" height="30" aria-hidden="true">' + puntSvg({ t: t, x: 0, y: 0 }, -1, false) + '</svg>';
  }

  function bediening() {
    var h = S.hosts.bediening, P = S.P, s = '';
    if (S.stand === 'ruimtes') {
      s += '<p class="pl__uitleg">Tik op <b>+ ruimte</b> of <b>+ Wand</b> en sleep hem op zijn plek. Tik een ruimte aan om hem te verplaatsen, groter te maken met het rondje rechtsonder, of de deur te verschuiven.</p>';
      s += '<p class="pl__tip"><b>Let op de trap:</b> de nieuwe trap komt bijna altijd recht boven de trap die er nu al is. Sleep de trap naar die plek en houd daar rekening mee bij de kamers.</p>';
      s += '<div class="pl__knoppen"><button type="button" class="pl__chip pl__chip--wand" data-wandnieuw="1">+ Wand</button>' + ['slaapkamer', 'badkamer', 'toilet', 'trapgat', 'kantoor', 'berging', 'inloopkast'].map(function (t) {
        return '<button type="button" class="pl__chip" data-voeg="' + t + '">+ ' + TYPES[t].l + '</button>';
      }).join('') + '</div>';
      var k = P.kamers.filter(function (q) { return q.id === S.sel; })[0];
      var sk = S.sanSel != null ? P.sanitair[S.sanSel] : null;
      if (sk) {
        s += '<div class="pl__paneel"><div class="pl__paneel-kop"><b>' + SANITAIR[sk.t].l + '</b><span>sleep hem langs de wand</span></div><div class="pl__rij"><button type="button" class="pl__klein" data-sandraai="1">Omdraaien</button><button type="button" class="pl__klein pl__weg" data-sanweg="1">Verwijderen</button></div></div>';
      }
      if (k && (k.t === 'badkamer' || k.t === 'toilet')) {
        s += '<div class="pl__paneel"><div class="pl__paneel-kop"><b>Inrichting ' + esc(namen(P)[k.id].toLowerCase()) + '</b><span>sleep om te verplaatsen</span></div><div class="pl__knoppen" style="margin:0">'
          + Object.keys(SANITAIR).map(function (t) { return '<button type="button" class="pl__chip" data-sannieuw="' + t + '">+ ' + SANITAIR[t].l + '</button>'; }).join('') + '</div></div>';
      }
      if (!k && S.wandSel == null && S.sanSel == null) {
        var lijstK = P.kamers.filter(function (q) { return q.t !== 'trapgat'; });
        if (lijstK.length) s += '<div class="pl__paneel"><div class="pl__paneel-kop"><b>Kamers groter of kleiner</b><span>de buurkamer schuift mee</span></div>'
          + lijstK.map(function (q) { return '<div class="pl__kmaat"><b>' + esc(namen(P)[q.id]) + '</b>' + maatRegel('Breedte', 'b', q.b, q.id) + maatRegel('Diepte', 'd', q.d, q.id) + '</div>'; }).join('') + '</div>';
      }
      if (k) {
        var nm = namen(P)[k.id];
        s += '<div class="pl__paneel"><div class="pl__paneel-kop"><b>' + esc(nm) + '</b><span>' + nl(k.b * k.d) + ' m²</span></div>';
        s += maatRegel('Breedte', 'b', k.b) + maatRegel('Diepte', 'd', k.d);
        s += '<div class="pl__rij">' + (k.t === 'trapgat' ? '<button type="button" class="pl__klein" data-draai="1">Draaien</button>' : '') + (k.t !== 'trapgat' ? '<button type="button" class="pl__klein" data-deurzet="1">' + (k.deur ? 'Geen deur' : 'Deur toevoegen') + '</button>' : '')
          + '<button type="button" class="pl__klein pl__weg" data-weg="1">Verwijderen</button></div></div>';
      }
      var wsel = S.wandSel != null ? P.wanden[S.wandSel] : null;
      if (wsel) {
        var wl = Math.abs(wsel.x2 - wsel.x1) + Math.abs(wsel.y2 - wsel.y1);
        s += '<div class="pl__paneel"><div class="pl__paneel-kop"><b>Wand</b><span>' + nl(wl) + ' m</span></div>';
        s += maatRegel('Lengte', 'wl', wl);
        s += '<div class="pl__rij"><button type="button" class="pl__klein" data-wanddraai="1">Draaien</button><button type="button" class="pl__klein" data-wanddeur="1">' + (wsel.deur != null ? 'Geen deur' : 'Deur in wand') + '</button><button type="button" class="pl__klein pl__weg" data-wandweg="1">Verwijderen</button></div>';
        s += '<p class="pl__uitleg" style="margin:.6rem 0 0">Sleep de wand of de rondjes aan de uiteinden.</p></div>';
      }
      if (P.kamers.some(function (a) { return P.kamers.some(function (b) { return a !== b && overlapt(a, b); }); }))
        s += '<p class="pl__let">Twee ruimtes liggen over elkaar (rood). Schuif ze uit elkaar.</p>';
      s += '<button type="button" class="pl__reset" data-reset="1">Opnieuw beginnen</button>';
    } else {
      s += '<button type="button" class="pl__chip pl__chip--wand" data-auto="1" style="margin-bottom:.7rem">⚡ ' + (P.punten.length ? 'Opnieuw automatisch indelen' : 'Automatisch indelen') + '</button>';
      s += '<div class="pl__palet">' + Object.keys(PUNTEN).map(function (t) {
        var n = P.punten.filter(function (p) { return p.t === t; }).length;
        return '<button type="button" class="pl__sym' + (S.gereedschap === t ? ' is-aan' : '') + '" data-sym="' + t + '">' + symboolIcoon(t) + '<span>' + PUNTEN[t].l + '</span>' + (n ? '<i>' + n + '</i>' : '') + '</button>';
      }).join('') + '</div>';
      s += '<p class="pl__uitleg"><b>Sleep</b> een symbool de tekening in, of tik het aan en tik daarna op de plek. Verschuiven kan door te slepen; tik een symbool aan om het te verwijderen.</p>';
      if (S.puntSel != null && P.punten[S.puntSel]) {
        var pt = P.punten[S.puntSel], ko = kamerKant(pt), kr = ruimteVan(P, pt.x + ko[0], pt.y + ko[1]);
        s += '<div class="pl__paneel"><div class="pl__paneel-kop"><b>' + PUNTEN[pt.t].l + '</b><span>' + (kr ? esc(namen(P)[kr.id]) : 'Overloop') + '</span></div><div class="pl__rij"><button type="button" class="pl__klein pl__weg" data-puntweg="1">Verwijderen</button></div></div>';
      }
    }
    s = '<div class="pl__terug"><button type="button" class="pl__klein" data-terug="1"' + (historie.length > 1 ? '' : ' disabled') + '>↶ Ongedaan maken</button></div>' + s;
    h.innerHTML = s;
    var tg = h.querySelector('[data-terug]');
    if (tg) tg.addEventListener('click', function () {
      if (historie.length < 2) return;
      historie.pop(); S.P = JSON.parse(historie[historie.length - 1]);
      S.sel = null; S.wandSel = null; S.puntSel = null;
      var st = keuze(); if (st) st.plattegrond = S.P;
      if (S.stand === 'elektra') zetElektra();
      teken();
    });
    h.querySelectorAll('[data-voeg]').forEach(function (b) { b.addEventListener('click', function () { voegToe(b.getAttribute('data-voeg')); }); });
    h.querySelectorAll('[data-maat]').forEach(function (b) {
      b.addEventListener('click', function () {
        var as = b.getAttribute('data-maat'), d = +b.getAttribute('data-d');
        if (as === 'wl') return;
        var id = b.getAttribute('data-k') || S.sel, k = P.kamers.filter(function (q) { return q.id === id; })[0]; if (!k) return;
        zetMaat(P, k, as, (as === 'b' ? k.b : k.d) + d);
        P.eigen = true; bewaar(); teken();
      });
    });
    h.querySelectorAll('[data-maatin]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var as = inp.getAttribute('data-maatin'), id = inp.getAttribute('data-k') || S.sel;
        var k = P.kamers.filter(function (q) { return q.id === id; })[0], v = parseFloat(String(inp.value).replace(',', '.'));
        if (!k || isNaN(v)) { teken(); return; }
        zetMaat(P, k, as, v); P.eigen = true; bewaar(); teken();
      });
    });
    var w = h.querySelector('[data-weg]');
    if (w) w.addEventListener('click', function () { var kw = P.kamers.filter(function (q) { return q.id === S.sel; })[0]; if (kw) { var weg = sanInKamer(P, kw); P.sanitair = (P.sanitair || []).filter(function (it) { return weg.indexOf(it) < 0; }); } P.kamers = P.kamers.filter(function (q) { return q.id !== S.sel; }); S.sel = null; P.eigen = true; bewaar(); teken(); });
    var dz = h.querySelector('[data-deurzet]');
    if (dz) dz.addEventListener('click', function () { var k = P.kamers.filter(function (q) { return q.id === S.sel; })[0]; if (!k) return; k.deur = k.deur ? null : { z: 'b', p: 0.5 }; P.eigen = true; bewaar(); teken(); });
    function welWand(fn) { return function () { var w = P.wanden[S.wandSel]; if (!w) return; fn(w); P.eigen = true; bewaar(); teken(); }; }
    var wn = h.querySelector('[data-wandnieuw]');
    if (wn) wn.addEventListener('click', function () {
      var l = Math.min(2, P.w - 0.2), y = rond(r1(P.d / 2)), x = rond(r1((P.w - l) / 2));
      P.wanden.push({ x1: x, y1: y, x2: rond(x + l), y2: y, deur: null });
      S.wandSel = P.wanden.length - 1; S.sel = null; P.eigen = true; bewaar(); teken();
    });
    h.querySelectorAll('[data-maat="wl"]').forEach(function (b) {
      b.addEventListener('click', welWand(function (w) {
        var d = +b.getAttribute('data-d'), hor = Math.abs(w.y1 - w.y2) < 0.001;
        if (hor) { if (w.x2 >= w.x1) w.x2 = rond(clamp(w.x2 + d, w.x1 + 0.3, P.w)); else w.x1 = rond(clamp(w.x1 + d, w.x2 + 0.3, P.w)); }
        else { if (w.y2 >= w.y1) w.y2 = rond(clamp(w.y2 + d, w.y1 + 0.3, P.d)); else w.y1 = rond(clamp(w.y1 + d, w.y2 + 0.3, P.d)); }
      }));
    });
    var wdr = h.querySelector('[data-wanddraai]');
    if (wdr) wdr.addEventListener('click', welWand(function (w) {
      var l = Math.abs(w.x2 - w.x1) + Math.abs(w.y2 - w.y1), cx = (w.x1 + w.x2) / 2, cy = (w.y1 + w.y2) / 2, hor = Math.abs(w.y1 - w.y2) < 0.001;
      if (hor) { l = Math.min(l, P.d); w.x1 = w.x2 = r1(cx); w.y1 = rond(clamp(r1(cy - l / 2), 0, P.d - l)); w.y2 = rond(w.y1 + l); }
      else { l = Math.min(l, P.w); w.y1 = w.y2 = r1(cy); w.x1 = rond(clamp(r1(cx - l / 2), 0, P.w - l)); w.x2 = rond(w.x1 + l); }
    }));
    var wdd = h.querySelector('[data-wanddeur]');
    if (wdd) wdd.addEventListener('click', welWand(function (w) { w.deur = w.deur != null ? null : 0.5; }));
    var wwg = h.querySelector('[data-wandweg]');
    if (wwg) wwg.addEventListener('click', function () { P.wanden.splice(S.wandSel, 1); S.wandSel = null; P.eigen = true; bewaar(); teken(); });
    h.querySelectorAll('[data-sannieuw]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = P.kamers.filter(function (q) { return q.id === S.sel; })[0]; if (!k) return;
        P.sanitair = P.sanitair || [];
        P.sanitair.push(sanTegenWand(P, { t: b.getAttribute('data-sannieuw'), x: k.x + k.b / 2, y: k.y + 0.3 }));
        S.sanSel = P.sanitair.length - 1; P.eigen = true; bewaar(); teken();
      });
    });
    var sdr = h.querySelector('[data-sandraai]');
    if (sdr) sdr.addEventListener('click', function () { var it = P.sanitair[S.sanSel]; if (!it) return; it.r = ((it.r || 0) + 180) % 360; P.eigen = true; bewaar(); teken(); });
    var swg = h.querySelector('[data-sanweg]');
    if (swg) swg.addEventListener('click', function () { P.sanitair.splice(S.sanSel, 1); S.sanSel = null; P.eigen = true; bewaar(); teken(); });
    var dr = h.querySelector('[data-draai]');
    if (dr) dr.addEventListener('click', function () { var k = P.kamers.filter(function (q) { return q.id === S.sel; })[0]; if (!k) return; var b = k.b; k.b = Math.min(k.d, P.w); k.d = Math.min(b, P.d); k.x = clamp(k.x, 0, rond(P.w - k.b)); k.y = clamp(k.y, 0, rond(P.d - k.d)); P.eigen = true; bewaar(); teken(); });
    var rs = h.querySelector('[data-reset]');
    if (rs) rs.addEventListener('click', function () { var st = keuze(); S.P = sjabloon(r1(st.w), r1(st.dp), st.indeling, st.metBad); S.sel = null; S.wandSel = null; bewaar(); teken(); });
    h.querySelectorAll('[data-sym]').forEach(function (b) {
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); sleepUitBalk(e, b.getAttribute('data-sym')); });
    });
    var au = h.querySelector('[data-auto]');
    if (au) au.addEventListener('click', function () { P.punten = autoElektra(P); S.puntSel = null; P.eigen = true; bewaar(); teken(); });
    var pw = h.querySelector('[data-puntweg]');
    if (pw) pw.addEventListener('click', function () { P.punten.splice(S.puntSel, 1); S.puntSel = null; P.eigen = true; bewaar(); teken(); });
  }
  function maatRegel(lbl, as, v, kid) {
    var ka = kid ? ' data-k="' + kid + '"' : '';
    return '<div class="pl__maat"><span>' + lbl + '</span><button type="button" data-maat="' + as + '" data-d="-0.1"' + ka + ' aria-label="' + lbl + ' kleiner">−</button><input type="text" inputmode="decimal" data-maatin="' + as + '"' + ka + ' value="' + nl(v) + '" aria-label="' + lbl + ' in meters"><button type="button" data-maat="' + as + '" data-d="0.1"' + ka + ' aria-label="' + lbl + ' groter">+</button></div>';
  }
  /* Een kamer kleiner of groter maken: de buurkamer die aan dezelfde wand
     grenst schuift mee, zodat er geen gat of overlap ontstaat. */
  function zetMaat(P, k, as, nieuw) {
    var bx = as === 'b', oud = bx ? k.b : k.d, max = bx ? rond(P.w - k.x) : rond(P.d - k.y);
    nieuw = clamp(rond(nieuw), 0.6, max);
    var rand = rond((bx ? k.x : k.y) + oud), delta = rond(nieuw - oud);
    P.kamers.forEach(function (q) {
      if (q === k || q.t === 'trapgat') return;
      var raakt = bx ? Math.abs(q.x - rand) < 0.06 && q.y < k.y + k.d - 0.05 && q.y + q.d > k.y + 0.05
                     : Math.abs(q.y - rand) < 0.06 && q.x < k.x + k.b - 0.05 && q.x + q.b > k.x + 0.05;
      if (!raakt) return;
      var qm = bx ? q.b : q.d;
      if (qm - delta < 0.6) { delta = rond(qm - 0.6); nieuw = rond(oud + delta); }
    });
    P.kamers.forEach(function (q) {
      if (q === k || q.t === 'trapgat') return;
      if (bx && Math.abs(q.x - rand) < 0.06 && q.y < k.y + k.d - 0.05 && q.y + q.d > k.y + 0.05) { q.x = rond(q.x + delta); q.b = rond(q.b - delta); }
      if (!bx && Math.abs(q.y - rand) < 0.06 && q.x < k.x + k.b - 0.05 && q.x + q.b > k.x + 0.05) { q.y = rond(q.y + delta); q.d = rond(q.d - delta); }
    });
    if (bx) k.b = nieuw; else k.d = nieuw;
  }

  /* Nieuwe ruimte op de eerste vrije plek waar hij past; anders zo groot als
     past linksboven, rood omrand tot hij verschoven is. */
  function voegToe(t) {
    var P = S.P, T = TYPES[t], b = Math.min(T.b, P.w), d = Math.min(T.d, P.d), plek = null;
    for (var y = 0; y <= P.d - d + 0.001 && !plek; y = rond(y + RASTER)) for (var x = 0; x <= P.w - b + 0.001; x = rond(x + RASTER)) {
      var k = { x: x, y: y, b: b, d: d };
      if (!P.kamers.some(function (q) { return overlapt(q, k); })) { plek = k; break; }
    }
    plek = plek || { x: 0, y: 0, b: b, d: d };
    var nk = { id: nieuwId(), t: t, x: rond(plek.x), y: rond(plek.y), b: rond(b), d: rond(d) };
    if (t !== 'trapgat') nk.deur = { z: 'b', p: 0.5 };
    P.kamers.push(nk); P.sanitair = (P.sanitair || []).concat(standaardSanitair(P, nk)); S.sel = nk.id; S.wandSel = null; P.eigen = true; bewaar(); teken();
  }

  /* ---------- in de wand ----------
     Stopcontacten, schakelaars, data, airco en radiatoren hangen aan een
     wand. Ze springen naar de dichtstbijzijnde wand: buitengevel, kamerwand
     of een losse wand; het symbool draait met de platte kant naar de wand. */
  var WANDPUNT = { wcd: 1, schak: 1, data: 1, airco: 1, radiator: 1 };
  function wandSegmenten(P) {
    var seg = [[0, 0, P.w, 0], [0, P.d, P.w, P.d], [0, 0, 0, P.d], [P.w, 0, P.w, P.d]];
    P.kamers.forEach(function (k) {
      if (k.t === 'trapgat') return;
      seg.push([k.x, k.y, k.x + k.b, k.y], [k.x, k.y + k.d, k.x + k.b, k.y + k.d], [k.x, k.y, k.x, k.y + k.d], [k.x + k.b, k.y, k.x + k.b, k.y + k.d]);
    });
    (P.wanden || []).forEach(function (w) { seg.push([w.x1, w.y1, w.x2, w.y2]); });
    return seg;
  }
  /* Een wandpunt hoort bij de ruimte aan de kant waar het symbool naar wijst. */
  function kamerKant(p) {
    if (!WANDPUNT[p.t]) return [0, 0];
    var r = p.r || 0;
    return r === 180 ? [0, 0.1] : r === 90 ? [0.1, 0] : r === -90 ? [-0.1, 0] : [0, -0.1];
  }
  function inWand(P, p) {
    if (!WANDPUNT[p.t]) return p;
    var best = null, bd = 1e9;
    wandSegmenten(P).forEach(function (s) {
      var dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx * dx + dy * dy || 1e-9;
      var t = clamp(((p.x - s[0]) * dx + (p.y - s[1]) * dy) / l2, 0, 1);
      var x = s[0] + t * dx, y = s[1] + t * dy, d = (x - p.x) * (x - p.x) + (y - p.y) * (y - p.y);
      if (d < bd) { bd = d; best = { x: x, y: y, hor: Math.abs(dy) < 1e-6 }; }
    });
    if (!best) return p;
    var r = p.r || 0;
    if (best.hor) r = p.y <= best.y ? 0 : 180; else r = p.x >= best.x ? 90 : -90;
    if (bd < 1e-6 && p.r != null) r = p.r;
    // aan de buitengevel altijd naar binnen gericht
    if (best.hor && best.y <= 0.001) r = 180; if (best.hor && best.y >= P.d - 0.001) r = 0;
    if (!best.hor && best.x <= 0.001) r = 90; if (!best.hor && best.x >= P.w - 0.001) r = -90;
    return { t: p.t, x: rond(best.x), y: rond(best.y), r: r };
  }

  /* ---------- automatische elektra ----------
     Een logisch voorstel per ruimte, zoals een installateur het zou tekenen:
     slaapkamer en werkkamer een lamppunt in het midden, stopcontacten op de
     zijwanden, data bij de gevel; badkamer spotjes in een raster en een
     stopcontact bij de wastafel; toilet en berging één spotje; overloop
     spotjes om de anderhalve meter en een rookmelder. Bij elke deur een
     schakelaar aan de binnenkant. De klant past daarna aan wat hij wil. */
  function schakelaarBij(k) {
    var g = deurGeo(k); if (!g) return null;
    var x = g.x, y = g.y, o = 0.55;
    if (g.z === 'b') { x += o; y += 0.15; } else if (g.z === 'o') { x += o; y -= 0.15; }
    else if (g.z === 'l') { x += 0.15; y += o; } else { x -= 0.15; y += o; }
    return { t: 'schak', x: rond(clamp(x, k.x + 0.1, k.x + k.b - 0.1)), y: rond(clamp(y, k.y + 0.1, k.y + k.d - 0.1)) };
  }
  function autoElektra(P) {
    var pt = [], add = function (t, x, y) { pt.push({ t: t, x: rond(x), y: rond(y) }); };
    P.kamers.forEach(function (k) {
      if (k.t === 'trapgat') return;
      var cx = k.x + k.b / 2, cy = k.y + k.d / 2, rand = 0.15;
      if (k.t === 'slaapkamer' || k.t === 'kantoor') {
        add('lamp', cx, k.y + k.d * 0.3);
        add('wcd', k.x + rand, cy + 0.4); add('wcd', k.x + k.b - rand, cy - 0.4);
        if (k.b >= 3) add('wcd', cx, k.y + k.d - rand);
        if (k.t === 'kantoor' || k.b >= 2.8) add('data', k.x + k.b * 0.25, k.y + k.d - rand);
      } else if (k.t === 'badkamer') {
        var nx = clamp(Math.round(k.b / 1.6), 1, 2), ny = clamp(Math.round(k.d / 1.6), 1, 3);
        for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) add('spot', k.x + k.b * (i + 0.5) / nx, k.y + k.d * (j + 0.5) / ny);
        add('wcd', k.x + 0.45, k.y + rand);
      } else add('spot', cx, k.d > 1.4 ? k.y + k.d * 0.3 : cy);
      var sw = schakelaarBij(k); if (sw) pt.push(sw);
    });
    // overloop: spotjes op de vrije vloer, om de ~1,5 m
    var vrij = function (x, y) { return x > 0.2 && y > 0.2 && x < P.w - 0.2 && y < P.d - 0.2 && !P.kamers.some(function (k) { return x >= k.x - 0.15 && x <= k.x + k.b + 0.15 && y >= k.y - 0.15 && y <= k.y + k.d + 0.15; }); };
    var vp = vrijePlek(P), gezet = vp ? [{ x: vp.x, y: vp.y }] : [];
    for (var y = 0.3; y < P.d; y += 0.3) for (var x = 0.3; x < P.w; x += 0.3) {
      if (!vrij(x, y) || gezet.some(function (q) { return Math.abs(q.x - x) < 1.5 && Math.abs(q.y - y) < 1.2; })) continue;
      gezet.push({ x: x, y: y }); add('spot', x, y);
    }
    if (vp) add('rook', clamp(vp.x + 0.9, 0.2, P.w - 0.2), vp.y);
    var trap = P.kamers.filter(function (k) { return k.t === 'trapgat'; })[0];
    if (trap) {
      var tx = trap.x + trap.b + 0.2, ty = trap.y + trap.d / 2;
      if (vrij(tx, ty)) add('schak', tx, ty);
    }
    return pt.map(function (p) { return inWand(P, p); });
  }

  /* ---------- naar buiten ---------- */
  function stand(naam, hosts) {
    synchroniseer();
    S.actief = true; S.stand = naam; S.hosts = hosts; S.sel = null; S.wandSel = null; S.sanSel = null; S.puntSel = null; S.gereedschap = null;
    if (naam === 'elektra' && !S.P.punten.length) { S.P.punten = autoElektra(S.P); var st0 = keuze(); if (st0) st0.plattegrond = S.P; zetElektra(); }
    historie = []; moment();
    teken();
  }

  function samenvatting(P) {
    P = P || S.P; if (!P) return '';
    var nm = namen(P), r = ['Plattegrond (' + nl(P.w) + ' × ' + nl(P.d) + ' m):'];
    if (P.kv) r.push('- Voorgevel: ' + (KOZIJNEN[P.kv] || { l: P.kv }).l + (P.ka ? ' · achtergevel: ' + (KOZIJNEN[P.ka] || { l: P.ka }).l : ''));
    var per = {};
    P.punten.forEach(function (p) { var o = kamerKant(p), k = ruimteVan(P, p.x + o[0], p.y + o[1]), sl = k ? k.id : '_'; per[sl] = per[sl] || {}; per[sl][p.t] = (per[sl][p.t] || 0) + 1; });
    function lijst(o) { return o ? Object.keys(o).map(function (t) { return o[t] + '× ' + PUNTEN[t].l.toLowerCase(); }).join(', ') : ''; }
    P.kamers.forEach(function (k) {
      if (k.t === 'trapgat') { r.push('- Trapgat ' + nl(k.b) + ' × ' + nl(k.d) + ' m'); return; }
      var e = lijst(per[k.id]), inr = sanInKamer(P, k).map(function (it) { return SANITAIR[it.t].l.toLowerCase(); });
      r.push('- ' + nm[k.id] + ': ' + nl(k.b) + ' × ' + nl(k.d) + ' m (' + nl(k.b * k.d) + ' m²)' + (inr.length ? '; ' + inr.join(', ') : '') + (e ? '; ' + e : ''));
    });
    if (P.wanden && P.wanden.length) {
      var tl = 0, dn = 0; P.wanden.forEach(function (w) { tl += Math.abs(w.x2 - w.x1) + Math.abs(w.y2 - w.y1); if (w.deur != null) dn++; });
      r.push('- Extra binnenwanden: ' + P.wanden.length + ' (samen ' + nl(tl) + ' m)' + (dn ? ', ' + dn + ' met deur' : ''));
    }
    var ov = lijst(per._);
    r.push('- Overloop: ' + nl(vrijOppervlak(P)) + ' m²' + (ov ? '; ' + ov : ''));
    var tot = {}; P.punten.forEach(function (p) { tot[p.t] = (tot[p.t] || 0) + 1; });
    if (P.punten.length) r.push('Totaal: ' + lijst(tot));
    var l = link(P); if (l) r.push('Plattegrond bekijken en printen: ' + l);
    return r.join('\n');
  }

  /* Compact in de link: korte sleutels, centimeters als gehele getallen. */
  function inpakken(P, extra) {
    var m = global.NGMerk && global.NGMerk.merk && global.NGMerk.merk();
    var o = !P ? { w: 0, d: 0, n: m && !m.demo ? m.naam : '', c: m && m.kleur || '', k: [], p: [] } : {
      w: cm(P.w), d: cm(P.d), n: m && !m.demo ? m.naam : '', c: m && m.kleur || '',
      k: P.kamers.map(function (k) { return [k.t, cm(k.x), cm(k.y), cm(k.b), cm(k.d), k.deur ? k.deur.z : '', k.deur ? Math.round(k.deur.p * 100) : 0]; }),
      p: P.punten.map(function (p) { return p.r ? [p.t, cm(p.x), cm(p.y), p.r] : [p.t, cm(p.x), cm(p.y)]; }),
      kv: P.kv || '', ka: P.ka || '',
      sa: (P.sanitair || []).map(function (it) { return [it.t, cm(it.x), cm(it.y), it.r || 0]; }),
      m: (P.wanden || []).map(function (w) { return [cm(w.x1), cm(w.y1), cm(w.x2), cm(w.y2), w.deur != null ? Math.round(w.deur * 100) : -1]; })
    };
    if (m && m.telefoon) o.t = m.telefoon;
    if (extra) Object.keys(extra).forEach(function (k) { if (extra[k]) o[k] = extra[k]; });
    return o;
  }
  function uitpakken(o) {
    return {
      v: 1, w: o.w / 100, d: o.d / 100, eigen: true, kv: o.kv, ka: o.ka, keuzes: o.s || null, beeld: o.i || '', binnen: o.ii || '', tel: o.t || '', geenPlan: !o.w, naam: o.n, kleur: o.c,
      kamers: (o.k || []).filter(function (a) { return TYPES[a[0]]; }).map(function (a) { return { id: nieuwId(), t: a[0], x: a[1] / 100, y: a[2] / 100, b: a[3] / 100, d: a[4] / 100, deur: a[5] ? { z: a[5], p: a[6] / 100 } : null }; }),
      sanitair: (o.sa || []).filter(function (a) { return SANITAIR[a[0]]; }).map(function (a) { return { t: a[0], x: a[1] / 100, y: a[2] / 100, r: a[3] || 0 }; }),
      wanden: (o.m || []).map(function (a) { return { x1: a[0] / 100, y1: a[1] / 100, x2: a[2] / 100, y2: a[3] / 100, deur: a[4] >= 0 ? a[4] / 100 : null }; }),
      punten: (o.p || []).filter(function (a) { return PUNTEN[a[0]]; }).map(function (a) { return { t: a[0], x: a[1] / 100, y: a[2] / 100, r: a[3] || 0 }; })
    };
  }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function link(P) {
    P = P || S.P; if (!P) return '';
    try { return new URL('plattegrond.html', location.href).href.split('?')[0] + '#p=' + b64(JSON.stringify(inpakken(P))); } catch (e) { return ''; }
  }
  function brochureLink(extra) {
    try { return new URL('plattegrond.html', location.href).href.split('?')[0] + '#p=' + b64(JSON.stringify(inpakken(S.P, extra))); } catch (e) { return ''; }
  }
  function uitLink(hash) {
    var m = /p=([A-Za-z0-9_-]+)/.exec(hash || ''); if (!m) return null;
    try { return uitpakken(JSON.parse(unb64(m[1]))); } catch (e) { return null; }
  }

  /* Na een geslaagde aanvraag: de tekening om te bewaren of te printen. */
  function naVerzenden() {
    var msg = document.getElementById('leadMsg'); if (!msg || !global.MutationObserver) return;
    new MutationObserver(function () {
      if (!S.actief || !msg.classList.contains('ok') || msg.querySelector('a')) return;
      var a = document.createElement('a');
      a.href = link(); a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Bekijk of print je plattegrond';
      a.style.cssText = 'display:block;margin-top:.5rem;font-weight:700;color:inherit;text-decoration:underline';
      msg.appendChild(a);
    }).observe(msg, { childList: true, attributes: true, attributeFilter: ['class'] });
  }

  function css() {
    if (document.getElementById('plCss')) return;
    var s = document.createElement('style'); s.id = 'plCss';
    s.textContent = [
      '.pl{--pl-acc:var(--acc,#EE4E34)}',
      '.pl__svg{display:block;width:100%;height:auto;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:14px;border:1px solid var(--line,#e5e5e5);background:#fff}',
      '.pl__uitleg{font-size:.84rem;line-height:1.5;color:var(--text-2,#555);margin:0 0 .8rem}',
      '.pl__knoppen,.pl__palet{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:.8rem}',
      '.pl__chip,.pl__klein,.pl__reset{font:inherit;font-size:.82rem;font-weight:700;border:1px solid var(--line-strong,#ccc);background:#fff;color:var(--text,#103C3C);border-radius:999px;padding:.5rem .8rem;cursor:pointer}',
      '.pl__chip--wand{background:var(--text,#103C3C);color:#fff;border-color:var(--text,#103C3C)}',
      '.pl__chip:hover{border-color:var(--pl-acc)}',
      '.pl__sym{position:relative;display:flex;flex-direction:column;align-items:center;gap:.2rem;width:calc(25% - .35rem);min-width:68px;font:inherit;font-size:.7rem;font-weight:700;color:var(--text,#103C3C);background:#fff;border:1px solid var(--line-strong,#ccc);border-radius:12px;padding:.45rem .2rem;cursor:grab;touch-action:none}',
      '.pl__sym.is-aan{border-color:var(--pl-acc);box-shadow:0 0 0 2px var(--pl-acc) inset}',
      '.pl__sym i{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:var(--pl-acc);color:#fff;font-style:normal;font-size:.7rem;line-height:20px;text-align:center;padding:0 5px}',
      '.pl__paneel{border:1px solid var(--line,#e5e5e5);border-radius:14px;padding:.8rem .9rem;margin-bottom:.8rem;background:var(--bg,#fff)}',
      '.pl__paneel-kop{display:flex;justify-content:space-between;margin-bottom:.5rem;font-size:.9rem}',
      '.pl__maat{display:grid;grid-template-columns:1fr 40px 74px 40px;align-items:center;gap:.3rem;margin:.3rem 0;font-size:.85rem}',
      '.pl__maat button{height:36px;border-radius:10px;border:1px solid var(--line-strong,#ccc);background:#fff;font-size:1.1rem;cursor:pointer;color:var(--text,#103C3C)}',
      '.pl__maat b{text-align:center}',
      '.pl__maat input{height:36px;width:100%;box-sizing:border-box;text-align:center;border:1px solid var(--line-strong,#ccc);border-radius:10px;font:inherit;font-weight:700}',
      '.pl__kmaat{padding:.4rem 0;border-top:1px solid var(--line,#eee)}.pl__kmaat:first-of-type{border-top:0}.pl__kmaat>b{font-size:.85rem}',
      '.pl__rij{display:flex;gap:.45rem;margin-top:.55rem;flex-wrap:wrap}',
      '.pl__terug{display:flex;justify-content:flex-end;margin:-.2rem 0 .6rem}',
      '.pl__klein[disabled]{opacity:.4;cursor:default}',
      '.pl__weg{color:#B3261E}',
      '.pl__reset{border-style:dashed;background:none}',
      '.pl__tip{font-size:.8rem;line-height:1.5;margin:0 0 .8rem;padding:.6rem .75rem;border-radius:10px;background:color-mix(in srgb,var(--pl-acc) 9%,#fff);color:var(--text,#103C3C)}',
      '.pl__let{font-size:.82rem;color:#B3261E;margin:0 0 .8rem}',
      '.pl__spook{position:fixed;z-index:100000;pointer-events:none;transform:translate(-50%,-50%) scale(1.6);filter:drop-shadow(0 4px 10px rgba(0,0,0,.25))}'
    ].join('');
    document.head.appendChild(s);
  }

  css();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', naVerzenden); else naVerzenden();

  global.NGPlattegrond = {
    TYPES: TYPES, PUNTEN: PUNTEN,
    stand: stand,
    synchroniseer: function () { if (S.actief) { synchroniseer(); if (S.hosts) teken(); } },
    actief: function () { return S.actief; },
    data: function () { return S.P; },
    samenvatting: function () { return S.actief ? samenvatting() : ''; },
    link: function () { return S.actief ? link() : ''; },
    brochureLink: brochureLink,
    svg: svgVan,
    symbool: symboolIcoon,
    uitLink: uitLink,
    samenvattingVan: samenvatting
  };
})(window);
