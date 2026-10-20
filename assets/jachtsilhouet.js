/* Het live zijaanzicht van de jachtconfigurator.
 *
 * Waarom getekend en niet gefotografeerd: de dakopbouwconfigurator heeft 225
 * voorgerenderde beelden nodig om alle combinaties te dekken, de poolhouse
 * 133. Voor een jacht met vijf modellen, zes rompkleuren, drie opbouwkleuren
 * en vier dektypes zijn dat er 360 vóórdat het interieur meetelt. Dat is een
 * renderopdracht van weken, en tot die klaar is staat de configurator stil.
 *
 * Dit silhouet lost dat op: het tekent het schip uit de maten in
 * jacht-data.js, dus élke combinatie is meteen zichtbaar en klopt met de
 * gekozen lengte, diepgang en opbouw. Komen de fotorealistische renders
 * later binnen, dan schuift de beeldbank er overheen — dezelfde aanpak als
 * bij de dakopbouw, waar een ontbrekende render "render volgt" toont en
 * nooit een verkeerde combinatie.
 *
 * Het is nadrukkelijk een SCHEMATISCH zijaanzicht, geen ontwerptekening. Het
 * blad zegt dat er ook bij. Verhoudingen kloppen (lengte, breedte, diepgang
 * en dekhoogten komen uit de tabel), de lijnvoering is stilering.
 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* Een lengte met zijn eenheid erachter, in het stelsel dat de bezoeker koos.
     Hier stond het decimaalteken eerder uitgeschreven; nu komt de hele maat
     uit één plek, zodat de tekening niet in meters blijft staan terwijl de
     maatstrook ernaast in voeten staat. */
  var maat = function (x, decimalen) {
    var E = (typeof window !== 'undefined') && window.NGEenheden;
    if (E) return E.lengte(x, decimalen);
    var d = (typeof window !== 'undefined' && window.NGTaal && window.NGTaal.decimaal)
      ? window.NGTaal.decimaal() : ',';
    return String(x).replace('.', d) + ' m';
  };

  /* Tekenvlak. De boeg wijst naar rechts, zoals op een scheepstekening. */
  /* Verticale begroting, zodat de hoogste combinatie (flybridge + T-top +
     radarmast) er nog net in past en de diepste kiel de maatlijn niet raakt:
       boven water  vrijboord 76 + dekhuis 88 + flybridge 71 + mast 78 = 313
       onder water  ten hoogste 80 px kiel, daaronder 46 px voor de maatlijn */
  var W = 1200, H = 520;
  var ACHTER = 90, VOOR = 1120;          // x van spiegel en boeg
  var WL = 345;                          // waterlijn

  function vindOp(lijst, v, val) {
    for (var i = 0; i < lijst.length; i++) if (lijst[i][v] === val) return lijst[i];
    return lijst[0];
  }

  /* Verloopnamen moeten uniek zijn per tekening. Staan er twee silhouetten op
     één pagina met dezelfde id, dan pakt de browser voor allebei de éérste
     definitie — en kreeg het tweede schip de kleuren van het eerste. */
  var teller = 0;

  /**
   * @param k {model, rompkleur, opbouw, dek, dekafwerking, motorisering, opties[]}
   * @param D  NGJachtData
   */
  function svg(k, D) {
    var m = vindOp(D.modellen, 'v', k.model);
    var romp = vindOp(D.rompkleuren, 'v', k.rompkleur);
    var opb = vindOp(D.opbouw, 'v', k.opbouw);
    var dek = vindOp(D.dekken, 'v', k.dek);
    var dekaf = vindOp(D.dekafwerking, 'v', k.dekafwerking);
    var opties = k.opties || [];

    /* Alle modellen worden op dezelfde tekenlengte gezet; de verhoudingen
       binnen het schip verschillen wél, want die komen uit de maten. */
    var L = VOOR - ACHTER;
    var schaal = L / m.loa;                        // px per meter
    var diepgang = m.diepgang * schaal;            // op schaal, zoals de tabel zegt
    /* Vrijboord van een motorjacht ligt rond een veertiende van de lengte.
       Uit de tabel valt het niet af te leiden, dus dit is de verhouding die
       het silhouet aanhoudt — en de reden dat er "schematisch" op staat. */
    var vrijboord = (m.loa / 13.5) * schaal;

    var shA = WL - vrijboord;                      // zeeg bij de spiegel
    var shV = shA - vrijboord * 0.50;              // zeeg bij de boeg, loopt op

    /* De zeeg als functie: laag achter, oplopend naar voren. De macht boven 1
       houdt hem achterop vlak en laat hem vooruit pas echt oplopen — dat is
       wat een scheepsromp een scheepsromp maakt. */
    function zeeg(x) {
      var t = Math.min(1, Math.max(0, (x - ACHTER) / L));
      return shA + (shV - shA) * Math.pow(t, 1.75);
    }
    function zeegPad(vanX, totX, stap) {
      var d = '', x;
      for (x = vanX; x <= totX; x += (stap || 24)) d += (d ? ' L ' : '') + x.toFixed(1) + ' ' + zeeg(x).toFixed(1);
      return d + ' L ' + totX.toFixed(1) + ' ' + zeeg(totX).toFixed(1);
    }

    var opbouwVerf = opb.verf === null ? romp.verf : opb.verf;
    var opbouwDonker = opb.donker === null ? romp.donker : opb.donker;
    var lichteRomp = !!romp.licht;

    var u = 'j' + (++teller);                      // unieke id-achtervoegsel

    /* Nachtweergave: geen andere tekening, dezelfde tekening met ander
       licht. De ramen gaan warm branden, de lucht wordt echt donker, en de
       onderwaterverlichting — overdag nauwelijks te zien, zoals in het echt —
       komt tot leven. Geen enkele werf laat dit online zien. */
    var nacht = !!k.nacht;
    var LU1 = nacht ? '#04060b' : '#11151b', LU2 = nacht ? '#0a0f16' : '#1b2129';
    var ZE1 = nacht ? '#091017' : '#16202b', ZE2 = nacht ? '#04080c' : '#0d1218';
    var GL1 = nacht ? '#f0cf8a' : '#8fb6d0', GL2 = nacht ? '#8a6428' : '#223039';

    var o = '';

    /* ---------- water en lucht ---------- */
    o += '<defs>' +
      '<linearGradient id="lucht' + u + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + LU1 + '"/><stop offset="1" stop-color="' + LU2 + '"/></linearGradient>' +
      '<linearGradient id="zee' + u + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + ZE1 + '"/><stop offset="1" stop-color="' + ZE2 + '"/></linearGradient>' +
      '<linearGradient id="rompVerloop' + u + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + romp.verf + '"/>' +
        '<stop offset=".62" stop-color="' + romp.verf + '"/>' +
        '<stop offset="1" stop-color="' + romp.donker + '"/></linearGradient>' +
      '<linearGradient id="opbouwVerloop' + u + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + opbouwVerf + '"/>' +
        '<stop offset="1" stop-color="' + opbouwDonker + '"/></linearGradient>' +
      '<linearGradient id="glas' + u + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + GL1 + '" stop-opacity=".9"/>' +
        '<stop offset="1" stop-color="' + GL2 + '" stop-opacity=".95"/></linearGradient>' +
      '<clipPath id="onderWater' + u + '"><rect x="0" y="' + WL + '" width="' + W + '" height="' + (H - WL) + '"/></clipPath>' +
      '</defs>';

    o += '<rect width="' + W + '" height="' + WL + '" fill="url(#lucht' + u + ')"/>';
    o += '<rect y="' + WL + '" width="' + W + '" height="' + (H - WL) + '" fill="url(#zee' + u + ')"/>';
    o += '<line x1="0" y1="' + WL + '" x2="' + W + '" y2="' + WL + '" stroke="#3d4a57" stroke-width="1" stroke-dasharray="7 6"/>';
    if (nacht) {
      /* vaste sterposities: elke render identiek, dus geen geflikker */
      [[120,62],[214,112],[300,44],[422,96],[540,58],[662,122],[760,50],[858,102],
       [948,40],[1044,122],[1122,72],[172,162],[502,150],[822,164],[1092,172],[382,176],[642,36],[262,206]]
        .forEach(function (s) {
          o += '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="1.5" fill="#cdd6e0" opacity=".75"/>';
        });
      o += '<circle cx="1004" cy="84" r="24" fill="#e9e5d7"/>' +
        '<circle cx="1016" cy="76" r="22" fill="' + LU1 + '"/>' +
        '<ellipse cx="1004" cy="' + (WL + 30) + '" rx="30" ry="6" fill="#e9e5d7" opacity=".07"/>' +
        '<ellipse cx="1004" cy="' + (WL + 52) + '" rx="20" ry="4" fill="#e9e5d7" opacity=".05"/>';
    }

    /* ---------- de romp ----------
       Boven de zeeg van spiegel naar boeg, dan de gestrekte steven omlaag,
       het vlak terug naar achteren en tot slot de licht hellende spiegel. */
    var stevenVoet = VOOR - L * 0.075;             // waar de steven het water raakt
    var kiel = WL + diepgang;
    var spiegelOnder = WL + diepgang * 0.42;       // de spiegel loopt niet tot de kiel

    var hull =
      'M ' + ACHTER + ' ' + shA.toFixed(1) +
      ' L ' + zeegPad(ACHTER, VOOR, 20) +
      ' L ' + stevenVoet.toFixed(1) + ' ' + kiel.toFixed(1) +
      ' C ' + (ACHTER + L * 0.52).toFixed(1) + ' ' + (kiel + diepgang * 0.06).toFixed(1) +
        ', ' + (ACHTER + L * 0.18).toFixed(1) + ' ' + (kiel + diepgang * 0.02).toFixed(1) +
        ', ' + (ACHTER + L * 0.035).toFixed(1) + ' ' + (kiel - diepgang * 0.10).toFixed(1) +
      ' L ' + ACHTER + ' ' + spiegelOnder.toFixed(1) + ' Z';

    /* spiegelbeeld in het water, subtiel */
    o += '<g clip-path="url(#onderWater' + u + ')" opacity=".07">' +
      '<g transform="translate(0,' + (1.62 * WL) + ') scale(1,-0.62)">' +
      '<path d="' + hull + '" fill="' + romp.verf + '"/></g></g>';

    o += '<path d="' + hull + '" fill="url(#rompVerloop' + u + ')"/>';

    /* de gouden scheerbies, een handbreed onder het gangboord */
    o += '<path d="M ' + zeegPad(ACHTER + 6, VOOR - 8, 20) + '" fill="none" ' +
      'stroke="#FFC400" stroke-width="2.6" opacity=".9" transform="translate(0,' + (vrijboord * 0.20).toFixed(1) + ')"/>';

    /* waterlijnbies vlak boven het water */
    o += '<path d="M ' + (ACHTER + 2) + ' ' + (WL - 6) + ' L ' + (stevenVoet - L * 0.02).toFixed(1) + ' ' + (WL - 6) +
      '" stroke="' + (lichteRomp ? '#5a6470' : '#e8e3d8') + '" stroke-width="2.6" opacity=".45" fill="none"/>';

    /* patrijspoorten: één per gastenhut, halverwege het vrijboord */
    var np = Math.max(3, m.hutten + 1);
    for (var i = 0; i < np; i++) {
      var px = ACHTER + L * 0.34 + (L * 0.40) * (i / (np - 1));
      var py = zeeg(px) + vrijboord * 0.55;
      o += '<ellipse cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" rx="9.5" ry="6" ' +
        'fill="url(#glas' + u + ')" stroke="#0c0f13" stroke-width="1.2"/>';
    }

    /* ---------- dekhuis ----------
       Het dekhuis staat óp de zeeg, dus de voet loopt mee met de romplijn.
       De voorkant helt naar achteren: dat is de voorruit. */
    var dhA = ACHTER + L * 0.27, dhV = ACHTER + L * 0.775;
    var voetA = zeeg(dhA), voetV = zeeg(dhV);
    var dh = vrijboord * 0.95;                     // hoogte dekhuis
    var dakY = Math.min(voetA, voetV) - dh;
    var dekY = voetA;

    /* dekvloer in de cockpit, in de gekozen dekafwerking */
    o += '<path d="M ' + (ACHTER + 5) + ' ' + zeeg(ACHTER + 5).toFixed(1) +
      ' L ' + zeegPad(ACHTER + 5, dhA, 18) +
      ' L ' + dhA.toFixed(1) + ' ' + (voetA - 6).toFixed(1) +
      ' L ' + (ACHTER + 5) + ' ' + (zeeg(ACHTER + 5) - 5).toFixed(1) + ' Z" fill="' + dekaf.kleur + '" opacity=".92"/>';
    /* voordek */
    o += '<path d="M ' + zeegPad(dhV, VOOR - 10, 18) +
      ' L ' + (VOOR - 10).toFixed(1) + ' ' + (zeeg(VOOR - 10) - 5).toFixed(1) +
      ' L ' + dhV.toFixed(1) + ' ' + (voetV - 6).toFixed(1) + ' Z" fill="' + dekaf.kleur + '" opacity=".92"/>';

    o += '<path d="M ' + dhA.toFixed(1) + ' ' + voetA.toFixed(1) +
      ' L ' + dhA.toFixed(1) + ' ' + (dakY + dh * 0.20).toFixed(1) +
      ' L ' + (dhA + L * 0.030).toFixed(1) + ' ' + dakY.toFixed(1) +
      ' L ' + (dhV - L * 0.085).toFixed(1) + ' ' + dakY.toFixed(1) +
      ' L ' + dhV.toFixed(1) + ' ' + (dakY + dh * 0.62).toFixed(1) +
      ' L ' + dhV.toFixed(1) + ' ' + voetV.toFixed(1) + ' Z" fill="url(#opbouwVerloop' + u + ')" ' +
      'stroke="rgba(10,14,18,.45)" stroke-width="1.4"/>';

    /* doorlopende salonruit, met de voorruit in dezelfde helling als de romp */
    o += '<path d="M ' + (dhA + L * 0.022).toFixed(1) + ' ' + (dakY + dh * 0.26).toFixed(1) +
      ' L ' + (dhA + L * 0.042).toFixed(1) + ' ' + (dakY + dh * 0.16).toFixed(1) +
      ' L ' + (dhV - L * 0.092).toFixed(1) + ' ' + (dakY + dh * 0.16).toFixed(1) +
      ' L ' + (dhV - L * 0.020).toFixed(1) + ' ' + (dakY + dh * 0.62).toFixed(1) +
      ' L ' + (dhV - L * 0.020).toFixed(1) + ' ' + (dakY + dh * 0.74).toFixed(1) +
      ' L ' + (dhA + L * 0.022).toFixed(1) + ' ' + (dakY + dh * 0.74).toFixed(1) + ' Z" ' +
      'fill="url(#glas' + u + ')" stroke="#0c0f13" stroke-width="1.4"/>';

    var dekhuisTop = dakY;

    /* ---------- bovenbouw per dektype ---------- */
    var topY = dekhuisTop;
    if (dek.v === 'hardtop') {
      var hy = dekhuisTop - dh * 0.16;
      o += '<path d="M ' + (dhA - L * 0.055) + ' ' + hy +
        ' L ' + (dhV - L * 0.02) + ' ' + hy +
        ' L ' + (dhV - L * 0.02) + ' ' + (hy - 11) +
        ' L ' + (dhA - L * 0.048) + ' ' + (hy - 11) + ' Z" fill="' + opbouwVerf + '"/>';
      /* stijlen naar het dek */
      o += '<rect x="' + (dhA - L * 0.050) + '" y="' + hy + '" width="4.5" height="' + (dekY - hy) + '" fill="' + opbouwDonker + '"/>';
      topY = hy - 11;
    } else if (dek.v === 'flybridge' || dek.v === 'flybridge-ttop') {
      var fy = dekhuisTop, fh = dh * 0.55;
      var fbA = dhA + L * 0.045, fbV = dhV - L * 0.055;
      o += '<path d="M ' + fbA + ' ' + fy +
        ' L ' + fbA + ' ' + (fy - fh * 0.55) +
        ' L ' + (fbA + L * 0.04) + ' ' + (fy - fh) +
        ' L ' + (fbV - L * 0.03) + ' ' + (fy - fh) +
        ' L ' + fbV + ' ' + (fy - fh * 0.45) +
        ' L ' + fbV + ' ' + fy + ' Z" fill="url(#opbouwVerloop' + u + ')" ' +
        'stroke="rgba(10,14,18,.45)" stroke-width="1.4"/>';
      /* windscherm van het flybridge */
      o += '<path d="M ' + (fbV - L * 0.075) + ' ' + (fy - fh * 0.94) +
        ' L ' + (fbV - L * 0.012) + ' ' + (fy - fh * 0.44) +
        ' L ' + (fbV - L * 0.012) + ' ' + (fy - fh * 0.20) +
        ' L ' + (fbV - L * 0.085) + ' ' + (fy - fh * 0.20) + ' Z" fill="url(#glas' + u + ')" stroke="#0c0f13" stroke-width="1.2"/>';
      /* reling rondom het flybridge */
      o += '<path d="M ' + fbA + ' ' + (fy - fh - 16) + ' L ' + (fbV - L * 0.03) + ' ' + (fy - fh - 16) +
        '" stroke="#9aa3ad" stroke-width="2" fill="none" opacity=".8"/>';
      topY = fy - fh - 16;

      if (dek.v === 'flybridge-ttop') {
        var ty = topY - dh * 0.34;
        o += '<path d="M ' + (fbA + L * 0.02) + ' ' + ty + ' L ' + (fbV - L * 0.02) + ' ' + ty +
          ' L ' + (fbV - L * 0.02) + ' ' + (ty - 9) + ' L ' + (fbA + L * 0.02) + ' ' + (ty - 9) + ' Z" fill="' + opbouwVerf + '"/>';
        o += '<rect x="' + (fbA + L * 0.03) + '" y="' + ty + '" width="4" height="' + (topY - ty) + '" fill="' + opbouwDonker + '"/>';
        o += '<rect x="' + (fbV - L * 0.05) + '" y="' + ty + '" width="4" height="' + (topY - ty) + '" fill="' + opbouwDonker + '"/>';
        /* radarmast */
        o += '<rect x="' + (fbA + L * 0.10) + '" y="' + (ty - 38) + '" width="4" height="38" fill="#8d959e"/>';
        o += '<ellipse cx="' + (fbA + L * 0.10 + 2) + '" cy="' + (ty - 42) + '" rx="17" ry="5" fill="#c8ced5"/>';
        topY = ty - 44;
      }
    }

    /* ---------- opties die je van buiten ziet ---------- */
    if (opties.indexOf('zonnepanelen') > -1 && dek.v !== 'open') {
      o += '<rect x="' + (dhA + L * 0.06) + '" y="' + (topY - 6) + '" width="' + (L * 0.20) + '" height="5" fill="#1d2732" stroke="#39434f" stroke-width="1"/>';
    }
    if (opties.indexOf('tenderkraan') > -1) {
      o += '<path d="M ' + (ACHTER + L * 0.16) + ' ' + dekY + ' L ' + (ACHTER + L * 0.16) + ' ' + (dekY - vrijboord * 0.85) +
        ' L ' + (ACHTER + L * 0.05) + ' ' + (dekY - vrijboord * 0.72) + '" fill="none" stroke="#aeb5bd" stroke-width="3.4" stroke-linecap="round"/>';
    }
    if (opties.indexOf('zwemplateau') > -1) {
      o += '<path d="M ' + (ACHTER - 34) + ' ' + (WL - 4) + ' L ' + (ACHTER + 4) + ' ' + (WL - 4) +
        ' L ' + (ACHTER + 4) + ' ' + (WL + 4) + ' L ' + (ACHTER - 34) + ' ' + (WL + 4) + ' Z" fill="' + dekaf.kleur + '" opacity=".92"/>';
    }
    if (opties.indexOf('jacuzzi') > -1 && dek.v !== 'open') {
      o += '<ellipse cx="' + (dhA + L * 0.30) + '" cy="' + (topY + 4) + '" rx="26" ry="7" fill="#2f6f86" stroke="#e8e3d8" stroke-width="1.6"/>';
    }
    /* Het zwembad ligt op het achterdek, dus laag en achter — anders dan de
       jacuzzi, die juist hoog op het bovendek staat. */
    if (opties.indexOf('zwembad') > -1) {
      o += '<rect x="' + (ACHTER + L * 0.10) + '" y="' + (WL - 20) + '" width="' + (L * 0.20) +
        '" height="11" rx="2" fill="#2f6f86" stroke="#e8e3d8" stroke-width="1.6"/>';
    }
    if (opties.indexOf('onderwaterlicht') > -1) {
      o += '<ellipse cx="' + (ACHTER + L * 0.35) + '" cy="' + (WL + 26) + '" rx="' + (L * 0.30) + '" ry="20" fill="#4fd0e3" opacity="' + (nacht ? '.55' : '.16') + '"/>';
      if (nacht) {
        o += '<ellipse cx="' + (ACHTER + L * 0.35) + '" cy="' + (WL + 22) + '" rx="' + (L * 0.18) + '" ry="12" fill="#8fe9f6" opacity=".45"/>';
      }
    }
    if (opties.indexOf('satelliet') > -1) {
      o += '<circle cx="' + (dhA + L * 0.12) + '" cy="' + (topY - 12) + '" r="10" fill="#dfe4ea"/>' +
        '<rect x="' + (dhA + L * 0.12 - 2) + '" y="' + (topY - 4) + '" width="4" height="8" fill="#9aa3ad"/>';
    }

    /* ---------- maatlijn ---------- */
    var my = H - 46;
    o += '<line x1="' + ACHTER + '" y1="' + my + '" x2="' + VOOR + '" y2="' + my + '" stroke="#6f7c88" stroke-width="1"/>' +
      '<line x1="' + ACHTER + '" y1="' + (my - 7) + '" x2="' + ACHTER + '" y2="' + (my + 7) + '" stroke="#6f7c88" stroke-width="1"/>' +
      '<line x1="' + VOOR + '" y1="' + (my - 7) + '" x2="' + VOOR + '" y2="' + (my + 7) + '" stroke="#6f7c88" stroke-width="1"/>' +
      '<text x="' + ((ACHTER + VOOR) / 2) + '" y="' + (my - 12) + '" text-anchor="middle" ' +
        'font-family="IBM Plex Mono, monospace" font-size="15" fill="#9aa3ad">' +
        maat(m.loa) + ' over alles</text>';

    /* De diepgangteksten mogen wél bovenop; de lijn zelf is hierboven achter
       de romp getekend, anders loopt hij dwars door het schip. */
    o += '<text x="24" y="' + (WL - 10) + '" font-family="IBM Plex Mono, monospace" font-size="12" fill="#6f7c88">WATERLIJN</text>';
    /* De diepgang staat linksonder bij de maatlijn: naast de spiegel is maar
       86 px vrij en daar past de tekst niet in zonder over de romp te lopen. */
    o += '<text x="' + ACHTER + '" y="' + (H - 68) + '" font-family="IBM Plex Mono, monospace" font-size="13" fill="#8b96a2">' +
      maat(m.diepgang) + ' diepgang</text>';

    o += '<text x="' + (W - 24) + '" y="' + (H - 14) + '" text-anchor="end" ' +
      'font-family="IBM Plex Mono, monospace" font-size="11" fill="#5b6672" letter-spacing="1">' +
      'SCHEMATISCH ZIJAANZICHT &#183; GEEN ONTWERPTEKENING</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'role="img" aria-label="Zijaanzicht van de samengestelde ' + esc(m.l) + '" ' +
      'preserveAspectRatio="xMidYMid meet">' + o + '</svg>';
  }

  global.NGJachtSilhouet = { svg: svg };
})(typeof window !== 'undefined' ? window : globalThis);
