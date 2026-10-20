/* Bovenaanzicht, vooraanzicht en schaalreferentie van de jachtconfigurator.
 *
 * Waarom dit er is: de beste configurator in dit segment (Dynamiq GTT 115)
 * laat de koper een dekplattegrond KIEZEN uit een setje PDF's. Dat is een
 * catalogus met een klikje eromheen. Hier wordt de plattegrond GETEKEND uit
 * de maten van het gekozen model, dus hij klopt altijd met de lengte, de
 * breedte, het aantal hutten en het gekozen dektype — en hij verandert mee
 * zodra de bezoeker iets anders aanvinkt.
 *
 * Het derde aanzicht lost een probleem op dat elke jachtconfigurator heeft
 * en niemand aanpakt: "28,9 meter" zegt een koper niets. In het zijaanzicht
 * kan daarom een schaalreferentie mee — een mens, een auto en een rijtjes-
 * huis op dezelfde schaal. Dat is geen versiering; het is het antwoord op de
 * vraag die iedereen stelt en die geen enkele werf online beantwoordt.
 *
 * Alle maten komen uit jacht-data.js. De verhoudingen die daar niet in staan
 * (vrijboord, dekhuishoogte) volgen dezelfde regels als het zijaanzicht in
 * jachtsilhouet.js, zodat de drie tekeningen bij elkaar horen.
 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var f1 = function (x) { return (Math.round(x * 10) / 10).toString().replace('.', (typeof window !== 'undefined' && window.NGTaal && window.NGTaal.decimaal) ? window.NGTaal.decimaal() : ','); };
  /* Een lengte met zijn eenheid erachter, in het stelsel dat de bezoeker koos.
     De maat wordt hier niet zelf uitgeschreven: dan zou dit de derde plek in
     de codebase zijn waar een komma en een 'm' aan elkaar geplakt worden, en
     op de Engelse pagina stond daardoor eerder "car 4.5 m" naast "28,9 m". */
  /* Losse woorden die in een tekening naast een maat staan. Ze zijn te kort
     voor de documentvertaling - die laat woorden onder de zeven letters met
     rust, omdat 'dek' anders ook een klassenaam zou raken - dus worden ze hier
     zelf vertaald. Het gaat om twee stuks. */
  var T = function (z) {
    return (typeof window !== 'undefined' && window.NGTaal) ? window.NGTaal.T(z) : z;
  };
  var maat = function (x, decimalen) {
    var E = (typeof window !== 'undefined') && window.NGEenheden;
    return E ? E.lengte(x, decimalen)
             : f1(x) + ' m';
  };


  function vindOp(lijst, val) {
    for (var i = 0; i < lijst.length; i++) if (lijst[i].v === val) return lijst[i];
    return lijst[0];
  }

  var teller = 0;

  /* Dezelfde opbouwverhoudingen als het zijaanzicht, zodat de doorvaarthoogte
     in het vooraanzicht klopt met wat je op het zijaanzicht ziet staan. */
  function hoogten(m, dekV) {
    var vrijboord = m.loa / 13.5;
    var dekhuis = vrijboord * 0.95;
    var fly = 0, mast = 0;
    if (dekV === 'flybridge' || dekV === 'flybridge-ttop') fly = dekhuis * 0.55 + vrijboord * 0.22;
    if (dekV === 'flybridge-ttop') mast = dekhuis * 0.34 + vrijboord * 0.85;
    if (dekV === 'hardtop') fly = dekhuis * 0.22;
    return { vrijboord: vrijboord, dekhuis: dekhuis, fly: fly, mast: mast,
             airdraft: vrijboord + dekhuis + fly + mast };
  }

  /* ---------------- bovenaanzicht ---------------- */

  var BW = 1200, BH = 430;

  function boven(k, D) {
    var m = vindOp(D.modellen, k.model);
    var romp = vindOp(D.rompkleuren, k.rompkleur);
    var opb = vindOp(D.opbouw, k.opbouw);
    var dek = vindOp(D.dekken, k.dek);
    var dekaf = vindOp(D.dekafwerking, k.dekafwerking);
    var opties = k.opties || [];
    var u = 'b' + (++teller);

    var ACHTER = 90, VOOR = 1120, L = VOOR - ACHTER;
    /* De schaal volgt de lengte, maar wordt begrensd door de breedte: bij een
       kort en breed schip zou de romp anders buiten het vlak groeien en over
       de hut-band en de maatlijn heen lopen. */
    var schaal = Math.min(L / m.loa, 260 / m.breedte);
    var HB = (m.breedte * schaal) / 2;              // halve breedte in px
    var MID = BH / 2;
    var Lp = m.loa * schaal;                        // getekende lengte
    VOOR = ACHTER + Lp; L = Lp;

    var opbouwVerf = opb.verf === null ? romp.verf : opb.verf;
    var o = '<defs><linearGradient id="dk' + u + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + dekaf.kleur + '"/>' +
      '<stop offset="1" stop-color="' + dekaf.kleur + '" stop-opacity=".72"/></linearGradient></defs>';
    o += '<rect width="' + BW + '" height="' + BH + '" fill="#11151b"/>';

    /* Rompcontour in één gesloten pad: langs bakboord naar de boeg en langs
       stuurboord weer terug. Twee losse zijden aan elkaar plakken levert een
       gekruist pad op — een strik in plaats van een romp. */
    var bMax = ACHTER + L * 0.42, spiegelB = HB * 0.86;
    var rompPad =
      'M ' + ACHTER + ' ' + (MID - spiegelB) +
      ' C ' + (ACHTER + L * 0.16) + ' ' + (MID - HB) +
        ', ' + (bMax - L * 0.08) + ' ' + (MID - HB) +
        ', ' + bMax + ' ' + (MID - HB) +
      ' C ' + (ACHTER + L * 0.72) + ' ' + (MID - HB * 0.94) +
        ', ' + (VOOR - L * 0.12) + ' ' + (MID - HB * 0.42) +
        ', ' + VOOR + ' ' + MID +
      ' C ' + (VOOR - L * 0.12) + ' ' + (MID + HB * 0.42) +
        ', ' + (ACHTER + L * 0.72) + ' ' + (MID + HB * 0.94) +
        ', ' + bMax + ' ' + (MID + HB) +
      ' C ' + (bMax - L * 0.08) + ' ' + (MID + HB) +
        ', ' + (ACHTER + L * 0.16) + ' ' + (MID + HB) +
        ', ' + ACHTER + ' ' + (MID + spiegelB) +
      ' Z';

    o += '<path d="' + rompPad + '" fill="url(#dk' + u + ')" stroke="' + romp.verf + '" stroke-width="3"/>';

    /* dekindeling */
    var cA = ACHTER + L * 0.02, cV = ACHTER + L * 0.27;         // cockpit
    var dA = cV, dV = ACHTER + L * 0.775;                        // dekhuis
    o += '<rect x="' + dA + '" y="' + (MID - HB * 0.80) + '" width="' + (dV - dA) + '" height="' + (HB * 1.60) +
      '" rx="16" fill="' + opbouwVerf + '" stroke="rgba(10,14,18,.5)" stroke-width="1.5"/>';
    o += '<text x="' + ((dA + dV) / 2) + '" y="' + (MID + 5) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="14" fill="#2a2f36">SALON &#183; STUURSTAND</text>';

    /* flybridge als stippellijn erboven */
    if (dek.v === 'flybridge' || dek.v === 'flybridge-ttop') {
      o += '<rect x="' + (dA + L * 0.045) + '" y="' + (MID - HB * 0.60) + '" width="' + (dV - dA - L * 0.10) +
        '" height="' + (HB * 1.20) + '" rx="12" fill="none" stroke="#FFC400" stroke-width="1.6" stroke-dasharray="8 6"/>';
      o += '<text x="' + ((dA + dV) / 2) + '" y="' + (MID - HB * 0.60 - 8) + '" text-anchor="middle" ' +
        'font-family="IBM Plex Mono, monospace" font-size="11" fill="#FFC400">FLYBRIDGE ERBOVEN</text>';
    }

    /* hutten onderdeks, vooruit */
    var hA = ACHTER + L * 0.30, hV = ACHTER + L * 0.72;
    var hY = MID + HB + 26;
    for (var i = 0; i < m.hutten; i++) {
      var x1 = hA + (hV - hA) * (i / m.hutten), br = (hV - hA) / m.hutten - 6;
      o += '<rect x="' + x1.toFixed(1) + '" y="' + hY + '" width="' + br.toFixed(1) +
        '" height="24" rx="4" fill="none" stroke="#5c6774" stroke-width="1.2" stroke-dasharray="5 4"/>';
    }
    o += '<line x1="' + hA + '" y1="' + (hY - 9) + '" x2="' + hV + '" y2="' + (hY - 9) + '" stroke="#3d4a57" stroke-width="1"/>';
    o += '<text x="' + hA + '" y="' + (hY + 42) + '" font-family="IBM Plex Mono, monospace" ' +
      'font-size="11" fill="#6f7c88">' + m.hutten + ' HUTTEN ONDERDEKS &#183; ' + m.gasten + ' GASTEN &#183; ' + m.bemanning + ' BEMANNING</text>';

    /* cockpit en voordek benoemen */
    o += '<text x="' + ((cA + cV) / 2) + '" y="' + (MID + HB * 0.62) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="12" fill="#3b424b">COCKPIT</text>';
    o += '<text x="' + (dV + (VOOR - dV) * 0.38) + '" y="' + (MID + 5) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="12" fill="#3b424b">VOORDEK</text>';

    /* zichtbare opties op dek */
    if (opties.indexOf('tenderkraan') > -1) {
      o += '<rect x="' + (cA + L * 0.03) + '" y="' + (MID - HB * 0.34) + '" width="' + (L * 0.12) +
        '" height="' + (HB * 0.68) + '" rx="10" fill="#8b939c" opacity=".85"/>' +
        '<text x="' + (cA + L * 0.09) + '" y="' + (MID + 4) + '" text-anchor="middle" ' +
        'font-family="IBM Plex Mono, monospace" font-size="10" fill="#11151b">TENDER</text>';
    }
    if (opties.indexOf('jacuzzi') > -1) {
      o += '<circle cx="' + (dA + L * 0.10) + '" cy="' + MID + '" r="' + (HB * 0.42) + '" fill="#2f6f86" stroke="#e8e3d8" stroke-width="2"/>' +
        '<text x="' + (dA + L * 0.10) + '" y="' + (MID + 4) + '" text-anchor="middle" ' +
        'font-family="IBM Plex Mono, monospace" font-size="10" fill="#e8e3d8">SPA</text>';
    }
    if (opties.indexOf('zwembad') > -1) {
      o += '<rect x="' + (ACHTER + L * 0.10) + '" y="' + (MID - HB * 0.30) + '" width="' + (L * 0.20) +
        '" height="' + (HB * 0.60) + '" rx="4" fill="#2f6f86" stroke="#e8e3d8" stroke-width="2"/>' +
        '<text x="' + (ACHTER + L * 0.20) + '" y="' + (MID + 4) + '" text-anchor="middle" ' +
        'font-family="IBM Plex Mono, monospace" font-size="10" fill="#e8e3d8">POOL</text>';
    }
    if (opties.indexOf('zwemplateau') > -1) {
      o += '<rect x="' + (ACHTER - 40) + '" y="' + (MID - spiegelB * 0.9) + '" width="42" height="' + (spiegelB * 1.8) +
        '" rx="6" fill="' + dekaf.kleur + '" opacity=".9"/>';
    }

    /* maatlijnen */
    o += '<line x1="' + ACHTER + '" y1="34" x2="' + VOOR + '" y2="34" stroke="#6f7c88" stroke-width="1"/>' +
      '<line x1="' + ACHTER + '" y1="27" x2="' + ACHTER + '" y2="41" stroke="#6f7c88"/>' +
      '<line x1="' + VOOR + '" y1="27" x2="' + VOOR + '" y2="41" stroke="#6f7c88"/>' +
      '<text x="' + ((ACHTER + VOOR) / 2) + '" y="24" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="14" fill="#9aa3ad">' + maat(m.loa) + ' over alles</text>';
    o += '<line x1="' + bMax + '" y1="' + (MID - HB) + '" x2="' + bMax + '" y2="' + (MID + HB) + '" stroke="#6f7c88" stroke-width="1" stroke-dasharray="4 4"/>' +
      '<text x="' + (bMax + 10) + '" y="' + (MID - HB - 10) + '" font-family="IBM Plex Mono, monospace" font-size="12" fill="#9aa3ad">' +
      maat(m.breedte) + ' breedte</text>';
    o += '<text x="' + (BW - 24) + '" y="' + (BH - 12) + '" text-anchor="end" font-family="IBM Plex Mono, monospace" ' +
      'font-size="11" fill="#5b6672" letter-spacing="1">BOVENAANZICHT &#183; SCHEMATISCH</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + BW + ' ' + BH + '" role="img" ' +
      'aria-label="Bovenaanzicht met dekindeling van de ' + esc(m.l) + '">' + o + '</svg>';
  }

  /* ---------------- vooraanzicht ---------------- */

  var VW = 560, VH = 470;

  function voor(k, D) {
    var m = vindOp(D.modellen, k.model);
    var romp = vindOp(D.rompkleuren, k.rompkleur);
    var opb = vindOp(D.opbouw, k.opbouw);
    var dek = vindOp(D.dekken, k.dek);
    var u = 'v' + (++teller);
    var h = hoogten(m, dek.v);

    /* schaal zo dat het hoogste schip (mast) én de diepgang passen */
    var totaal = h.airdraft + m.diepgang;
    var schaal = Math.min((VH - 150) / totaal, (VW - 150) / m.breedte);
    var MID = VW / 2;
    var WL = 110 + h.airdraft * schaal;
    var HB = (m.breedte * schaal) / 2;
    var vb = h.vrijboord * schaal, dg = m.diepgang * schaal;

    var opbouwVerf = opb.verf === null ? romp.verf : opb.verf;
    var o = '<rect width="' + VW + '" height="' + VH + '" fill="#11151b"/>';
    o += '<line x1="0" y1="' + WL + '" x2="' + VW + '" y2="' + WL + '" stroke="#3d4a57" stroke-width="1" stroke-dasharray="7 6"/>';

    /* romp: V-bodem met kim */
    o += '<path d="M ' + (MID - HB) + ' ' + (WL - vb) +
      ' L ' + (MID - HB) + ' ' + (WL + dg * 0.18) +
      ' L ' + MID + ' ' + (WL + dg) +
      ' L ' + (MID + HB) + ' ' + (WL + dg * 0.18) +
      ' L ' + (MID + HB) + ' ' + (WL - vb) + ' Z" fill="' + romp.verf + '" stroke="' + romp.donker + '" stroke-width="1.5"/>';

    /* dekhuis */
    var dhB = HB * 0.78, dhH = h.dekhuis * schaal;
    o += '<path d="M ' + (MID - dhB) + ' ' + (WL - vb) +
      ' L ' + (MID - dhB * 0.92) + ' ' + (WL - vb - dhH) +
      ' L ' + (MID + dhB * 0.92) + ' ' + (WL - vb - dhH) +
      ' L ' + (MID + dhB) + ' ' + (WL - vb) + ' Z" fill="' + opbouwVerf + '" stroke="rgba(10,14,18,.5)" stroke-width="1.4"/>';
    /* voorruit */
    o += '<rect x="' + (MID - dhB * 0.74) + '" y="' + (WL - vb - dhH * 0.78) + '" width="' + (dhB * 1.48) +
      '" height="' + (dhH * 0.44) + '" rx="5" fill="#8fb6d0" opacity=".85"/>';

    /* flybridge en mast */
    if (h.fly > 0) {
      var fB = dhB * 0.80, fH = h.fly * schaal;
      o += '<path d="M ' + (MID - fB) + ' ' + (WL - vb - dhH) +
        ' L ' + (MID - fB * 0.9) + ' ' + (WL - vb - dhH - fH) +
        ' L ' + (MID + fB * 0.9) + ' ' + (WL - vb - dhH - fH) +
        ' L ' + (MID + fB) + ' ' + (WL - vb - dhH) + ' Z" fill="' + opbouwVerf + '" opacity=".92" stroke="rgba(10,14,18,.5)" stroke-width="1.3"/>';
    }
    if (h.mast > 0) {
      var mY = WL - vb - dhH - h.fly * schaal;
      o += '<rect x="' + (MID - 2.5) + '" y="' + (mY - h.mast * schaal) + '" width="5" height="' + (h.mast * schaal) + '" fill="#8d959e"/>';
      o += '<ellipse cx="' + MID + '" cy="' + (mY - h.mast * schaal) + '" rx="26" ry="5" fill="#c8ced5"/>';
    }

    /* maatlijnen: breedte en doorvaarthoogte */
    o += '<line x1="' + (MID - HB) + '" y1="' + (WL + dg + 34) + '" x2="' + (MID + HB) + '" y2="' + (WL + dg + 34) + '" stroke="#6f7c88"/>' +
      '<text x="' + MID + '" y="' + (WL + dg + 26) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" ' +
      'font-size="13" fill="#9aa3ad">' + maat(m.breedte) + '</text>';

    var topY = WL - h.airdraft * schaal;
    o += '<line x1="' + (MID + HB + 34) + '" y1="' + topY + '" x2="' + (MID + HB + 34) + '" y2="' + WL + '" stroke="#FFC400" stroke-width="1"/>' +
      '<line x1="' + (MID + HB + 27) + '" y1="' + topY + '" x2="' + (MID + HB + 41) + '" y2="' + topY + '" stroke="#FFC400"/>' +
      '<line x1="' + (MID + HB + 27) + '" y1="' + WL + '" x2="' + (MID + HB + 41) + '" y2="' + WL + '" stroke="#FFC400"/>' +
      '<text x="' + (MID + HB + 48) + '" y="' + ((topY + WL) / 2) + '" font-family="IBM Plex Mono, monospace" ' +
      'font-size="12" fill="#FFC400">' + maat(h.airdraft) + '</text>' +
      '<text x="' + (MID + HB + 48) + '" y="' + ((topY + WL) / 2 + 16) + '" font-family="IBM Plex Mono, monospace" ' +
      'font-size="10" fill="#8b7a4e">doorvaarthoogte</text>';

    o += '<text x="' + (VW - 20) + '" y="' + (VH - 12) + '" text-anchor="end" font-family="IBM Plex Mono, monospace" ' +
      'font-size="11" fill="#5b6672" letter-spacing="1">VOORAANZICHT</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + VW + ' ' + VH + '" role="img" ' +
      'aria-label="Vooraanzicht met breedte en doorvaarthoogte van de ' + esc(m.l) + '">' + o + '</svg>';
  }

  /* ---------------- schaalreferentie ----------------
     Het antwoord op "hoe groot is dat nou echt". Een auto van 4,5 meter en
     een rijtjeshuis van 6 meter breed staan op dezelfde schaal naast het
     schip. Geen enkele werf laat dit zien, terwijl het de eerste vraag is
     die aan de keukentafel gesteld wordt. */

  var SW = 1200, SH = 330;

  function schaal(k, D) {
    var m = vindOp(D.modellen, k.model);
    var romp = vindOp(D.rompkleuren, k.rompkleur);
    var dek = vindOp(D.dekken, k.dek);
    var h = hoogten(m, dek.v);

    var GROND = SH - 52;
    /* De schaal volgt uit twee eisen tegelijk: alles moet in de breedte
       naast elkaar passen (schip + huis + auto + mens met tussenruimte) en
       het hoogste object moet in de hoogte passen. De kleinste van de twee
       wint, anders steekt het huis boven de tekening uit. */
    var breedteM = m.loa + 1.5 + 6 + 1.5 + 4.5 + 1.5 + 0.8;
    var hoogsteM = Math.max(h.airdraft, 9);
    var s = Math.min((SW - 110) / breedteM, (GROND - 46) / hoogsteM);

    var o = '<rect width="' + SW + '" height="' + SH + '" fill="#11151b"/>';
    o += '<line x1="0" y1="' + GROND + '" x2="' + SW + '" y2="' + GROND + '" stroke="#3d4a57" stroke-width="1"/>';

    /* het schip, in dezelfde verhoudingen als het zijaanzicht */
    var x0 = 55, L = m.loa * s;
    var vb = h.vrijboord * s, dh = h.dekhuis * s, fly = h.fly * s, mast = h.mast * s;
    o += '<path d="M ' + x0 + ' ' + GROND + ' L ' + x0 + ' ' + (GROND - vb) +
      ' L ' + (x0 + L) + ' ' + (GROND - vb * 1.5) + ' L ' + (x0 + L) + ' ' + GROND + ' Z" fill="' + romp.verf + '"/>';
    o += '<path d="M ' + (x0 + L * 0.27) + ' ' + (GROND - vb) + ' L ' + (x0 + L * 0.30) + ' ' + (GROND - vb - dh) +
      ' L ' + (x0 + L * 0.70) + ' ' + (GROND - vb - dh) + ' L ' + (x0 + L * 0.775) + ' ' + (GROND - vb * 1.35) + ' Z" fill="#e9e6df"/>';
    if (fly > 0) {
      o += '<rect x="' + (x0 + L * 0.34) + '" y="' + (GROND - vb - dh - fly) + '" width="' + (L * 0.30) +
        '" height="' + fly + '" fill="#dcd8d0"/>';
    }
    if (mast > 0) {
      o += '<rect x="' + (x0 + L * 0.44) + '" y="' + (GROND - vb - dh - fly - mast) + '" width="3" height="' + mast + '" fill="#8d959e"/>';
    }
    o += '<text x="' + (x0 + L / 2) + '" y="' + (GROND - vb - dh - fly - mast - 14) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="13" fill="#FFC400">' + esc(m.l) + ' &#183; ' + maat(m.loa) + '</text>';

    /* rijtjeshuis: 6 m breed, 9 m tot de nok */
    var hx = x0 + L + 1.5 * s, hb = 6 * s, hh = 9 * s;
    o += '<g opacity=".6"><rect x="' + hx + '" y="' + (GROND - hh * 0.68) + '" width="' + hb + '" height="' + (hh * 0.68) + '" fill="#39434f"/>' +
      '<path d="M ' + (hx - 4) + ' ' + (GROND - hh * 0.68) + ' L ' + (hx + hb / 2) + ' ' + (GROND - hh) +
      ' L ' + (hx + hb + 4) + ' ' + (GROND - hh * 0.68) + ' Z" fill="#49545f"/></g>';
    o += '<text x="' + (hx + hb / 2) + '" y="' + (GROND + 19) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="10" fill="#6f7c88">' + T('huis') + ' ' + maat(6, 0) + '</text>';

    /* auto: 4,5 m lang, 1,5 m hoog */
    var ax = hx + hb + 1.5 * s, ab = 4.5 * s, ah = 1.5 * s;
    o += '<g opacity=".75" fill="#57626f">' +
      '<rect x="' + ax + '" y="' + (GROND - ah * 0.6) + '" width="' + ab + '" height="' + (ah * 0.6) + '" rx="' + (ah * 0.18) + '"/>' +
      '<rect x="' + (ax + ab * 0.24) + '" y="' + (GROND - ah) + '" width="' + (ab * 0.46) + '" height="' + (ah * 0.44) + '" rx="' + (ah * 0.12) + '"/></g>';
    o += '<text x="' + (ax + ab / 2) + '" y="' + (GROND + 19) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="10" fill="#6f7c88">' + T('auto') + ' ' + maat(4.5) + '</text>';

    /* mens: 1,8 m */
    var mx = ax + ab + 1.5 * s, mh = 1.8 * s;
    o += '<g fill="#939ea9">' +
      '<circle cx="' + mx + '" cy="' + (GROND - mh * 0.87) + '" r="' + (mh * 0.12) + '"/>' +
      '<rect x="' + (mx - mh * 0.09) + '" y="' + (GROND - mh * 0.74) + '" width="' + (mh * 0.18) + '" height="' + (mh * 0.74) + '" rx="' + (mh * 0.07) + '"/></g>';
    o += '<text x="' + mx + '" y="' + (GROND + 19) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="10" fill="#6f7c88">' + maat(1.8) + '</text>';

    o += '<text x="' + (SW - 20) + '" y="24" text-anchor="end" font-family="IBM Plex Mono, monospace" ' +
      'font-size="11" fill="#5b6672" letter-spacing="1">ALLES OP DEZELFDE SCHAAL</text>';
    o += '<text x="20" y="24" font-family="IBM Plex Mono, monospace" font-size="11" fill="#5b6672" letter-spacing="1">' +
      'DOORVAARTHOOGTE ' + maat(h.airdraft).toUpperCase() + '</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + SW + ' ' + SH + '" role="img" ' +
      'aria-label="De ' + esc(m.l) + ' op schaal naast een rijtjeshuis, een auto en een mens">' + o + '</svg>';
  }

  /* ---------------- interieur ----------------
     De salon als doorsnede, in de gekozen houtsoort en stoffering. Zolang de
     fotorealistische interieurrenders er niet zijn, kleurt deze tekening al
     mee met elke keuze — een koper die wengé met cognac overweegt, ziet
     meteen of die combinatie hem bevalt. Komt de render binnen, dan schuift
     die eroverheen, net als bij het buitenaanzicht. */

  var IW = 1200, IH = 520;

  function interieur(k, D) {
    var hout = vindOp(D.interieurhout, k.interieurhout);
    var stof = vindOp(D.stoffering, k.stoffering);
    var dekaf = vindOp(D.dekafwerking, k.dekafwerking);
    var u = 'i' + (++teller);
    var nacht = !!k.nacht;
    var PL = 92, RB = 132, RO = 316, VL = 386;

    var o = '<defs>' +
      '<linearGradient id="zicht' + u + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + (nacht ? '#05080d' : '#1b2129') + '"/><stop offset=".52" stop-color="' + (nacht ? '#0d141c' : '#2a3642') + '"/>' +
        '<stop offset=".53" stop-color="' + (nacht ? '#091017' : '#16202b') + '"/><stop offset="1" stop-color="' + (nacht ? '#04080c' : '#0d1218') + '"/></linearGradient>' +
      '<linearGradient id="ivloer' + u + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + dekaf.kleur + '"/>' +
        '<stop offset="1" stop-color="' + dekaf.kleur + '" stop-opacity=".62"/></linearGradient>' +
      '</defs>';

    /* wand in het gekozen hout, met paneelnaden */
    o += '<rect width="' + IW + '" height="' + IH + '" fill="' + hout.kleur + '"/>';
    for (var px = 75; px < IW; px += 150) {
      o += '<line x1="' + px + '" y1="' + PL + '" x2="' + px + '" y2="' + VL + '" stroke="rgba(0,0,0,.16)" stroke-width="1.4"/>';
    }

    /* plafond met spots */
    o += '<rect width="' + IW + '" height="' + PL + '" fill="#ece9e2"/>' +
      '<line x1="0" y1="' + PL + '" x2="' + IW + '" y2="' + PL + '" stroke="rgba(0,0,0,.25)"/>';
    for (var sx = 120; sx < IW; sx += 240) {
      o += '<circle cx="' + sx + '" cy="' + (PL - 26) + '" r="7" fill="#f7f3e6" stroke="rgba(0,0,0,.2)"/>';
    }

    /* de raampartij met zeezicht — horizon op 52% van het raam */
    o += '<rect x="150" y="' + RB + '" width="900" height="' + (RO - RB) + '" fill="url(#zicht' + u + ')" stroke="rgba(0,0,0,.4)" stroke-width="2"/>';
    for (var rx = 330; rx < 1050; rx += 180) {
      o += '<rect x="' + (rx - 5) + '" y="' + RB + '" width="10" height="' + (RO - RB) + '" fill="' + hout.kleur + '" stroke="rgba(0,0,0,.22)" stroke-width="1"/>';
    }
    o += '<rect x="142" y="' + RO + '" width="916" height="10" fill="rgba(0,0,0,.2)"/>';

    /* vloer in de dekafwerking */
    o += '<rect y="' + VL + '" width="' + IW + '" height="' + (IH - VL) + '" fill="url(#ivloer' + u + ')"/>' +
      '<line x1="0" y1="' + VL + '" x2="' + IW + '" y2="' + VL + '" stroke="rgba(0,0,0,.3)" stroke-width="2"/>';
    for (var fy = VL + 26; fy < IH - 30; fy += 26) {
      o += '<line x1="0" y1="' + fy + '" x2="' + IW + '" y2="' + fy + '" stroke="rgba(0,0,0,.11)"/>';
    }

    /* de bank in de gekozen stoffering */
    o += '<rect x="200" y="272" width="330" height="70" rx="16" fill="' + stof.kleur + '"/>' +
      '<rect x="188" y="330" width="354" height="52" rx="14" fill="' + stof.kleur + '"/>' +
      '<rect x="188" y="330" width="354" height="52" rx="14" fill="rgba(0,0,0,.10)"/>' +
      '<line x1="310" y1="278" x2="310" y2="336" stroke="rgba(0,0,0,.16)" stroke-width="2"/>' +
      '<line x1="420" y1="278" x2="420" y2="336" stroke="rgba(0,0,0,.16)" stroke-width="2"/>' +
      '<rect x="196" y="382" width="338" height="10" fill="rgba(0,0,0,.35)"/>';

    /* salontafel */
    o += '<rect x="596" y="352" width="150" height="10" rx="3" fill="rgba(22,17,12,.82)"/>' +
      '<rect x="608" y="362" width="10" height="26" fill="rgba(22,17,12,.7)"/>' +
      '<rect x="728" y="362" width="10" height="26" fill="rgba(22,17,12,.7)"/>';

    /* eethoek: tafel, twee stoelen in de stoffering, hanglampen */
    o += '<rect x="820" y="336" width="210" height="10" rx="3" fill="rgba(22,17,12,.85)"/>' +
      '<rect x="836" y="346" width="9" height="42" fill="rgba(22,17,12,.7)"/>' +
      '<rect x="1006" y="346" width="9" height="42" fill="rgba(22,17,12,.7)"/>';
    [862, 948].forEach(function (cx) {
      o += '<rect x="' + cx + '" y="296" width="14" height="60" rx="6" fill="' + stof.kleur + '"/>' +
        '<rect x="' + (cx - 8) + '" y="348" width="46" height="12" rx="5" fill="' + stof.kleur + '"/>' +
        '<rect x="' + (cx - 8) + '" y="348" width="46" height="12" rx="5" fill="rgba(0,0,0,.12)"/>' +
        '<rect x="' + (cx + 26) + '" y="360" width="7" height="28" fill="rgba(22,17,12,.6)"/>';
    });
    [880, 972].forEach(function (lx) {
      o += '<line x1="' + lx + '" y1="' + PL + '" x2="' + lx + '" y2="238" stroke="rgba(22,17,12,.6)" stroke-width="2"/>' +
        '<path d="M ' + (lx - 16) + ' 262 L ' + (lx - 9) + ' 238 L ' + (lx + 9) + ' 238 L ' + (lx + 16) + ' 262 Z" fill="rgba(22,17,12,.85)"/>' +
        '<ellipse cx="' + lx + '" cy="262" rx="16" ry="4" fill="#f2dfae" opacity=".8"/>' +
        (nacht ? '<ellipse cx="' + lx + '" cy="280" rx="46" ry="26" fill="#f2dfae" opacity=".13"/>' : '');
    });

    /* benoeming */
    o += '<rect x="20" y="' + (IH - 48) + '" width="470" height="30" rx="6" fill="rgba(12,15,19,.72)"/>' +
      '<text x="34" y="' + (IH - 27) + '" font-family="IBM Plex Mono, monospace" font-size="12" fill="#d8dde2" letter-spacing="1">SALON &#183; ' +
      esc(hout.l.toUpperCase()) + ' &#183; ' + esc(stof.l.toUpperCase()) + '</text>';
    o += '<rect x="' + (IW - 350) + '" y="' + (IH - 48) + '" width="330" height="30" rx="6" fill="rgba(12,15,19,.72)"/>' +
      '<text x="' + (IW - 335) + '" y="' + (IH - 27) + '" font-family="IBM Plex Mono, monospace" font-size="11" fill="#8b96a2" letter-spacing="1">INTERIEURIMPRESSIE &#183; SCHEMATISCH</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + IW + ' ' + IH + '" role="img" ' +
      'aria-label="Interieurimpressie van de salon in ' + esc(hout.l) + ' met ' + esc(stof.l) + '">' + o + '</svg>';
  }

  global.NGJachtAanzichten = { boven: boven, voor: voor, schaal: schaal, interieur: interieur, hoogten: hoogten };
})(typeof window !== 'undefined' ? window : globalThis);
