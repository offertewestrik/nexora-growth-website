/* De inrichting op de plattegrond: vloeren, meubels en sanitair.
 *
 * WAAROM DIT ER IS
 * Een plattegrond met alleen wanden en een ruimtenaam laat zien hoe groot
 * iets is. Een plattegrond met een bed, een bank en een eettafel erin laat
 * zien of het gaat wérken, en dat is de vraag die een koper stelt. Het is
 * hetzelfde verschil als tussen "19,8 m²" en "hier past een eettafel voor
 * zes én een bank van 2,40 m".
 *
 * WAT DIT WEL EN NIET IS
 * De meubels zijn op ware maat en staan op dezelfde schaal als de wanden;
 * daar valt dus aan af te meten. De ópstelling is een voorstel: de module
 * kiest een plaatsing die past bij de vorm van de kamer, niet de plaatsing
 * die de bewoner gaat kiezen. Dat staat onder elke tekening waar deze module
 * aan te pas komt. Wat niet past, wordt niet kleiner getekend maar
 * weggelaten — een bed dat in het echt tegen een deur aan staat, hoort ook op
 * de tekening tegen die deur aan te staan of er niet te zijn.
 *
 * MATEN
 * Alles in meters, gangbare Nederlandse maten:
 *   tweepersoonsbed 1,60 × 2,00 · eenpersoons 0,90 × 2,00
 *   bank 3-zits 2,20 × 0,90 · fauteuil 0,85 × 0,85
 *   eettafel 4 personen 1,40 × 0,90 · 6 personen 2,00 × 1,00
 *   keukenblok 0,60 diep · toilet 0,37 × 0,60 · douche 0,90 × 0,90
 *   wastafel 0,60 × 0,45 · ligbad 1,70 × 0,75
 *
 * TEKENSTIJL
 * Van bovenaf gezien, licht gevuld met een dunne donkere omtrek — de stijl
 * van een verkoopplattegrond. Geen schaduwen en geen perspectief: dit blijft
 * een tekening waar je aan kunt meten.
 */
(function (global) {
  'use strict';

  function num(v, d) { if (v === null || v === undefined || v === '') return d; v = Number(v); return isFinite(v) ? v : d; }

  /* ------------------------------------------------------------ patronen --- */

  /* Vloerpatronen per ruimtefunctie. Ze worden per tekening opnieuw
     gedefinieerd met een eigen id, want twee tekeningen naast elkaar met
     hetzelfde id laten de tweede het patroon van de eerste erven. */
  function defs(u, s) {
    /* De plank schaalt mee met de tekening: 1,20 m lang en 0,19 m breed is
       een gangbare vloerplank, en die hoort op een plattegrond van 1:50
       kleiner te zijn dan op een van 1:20. */
    var pl = Math.max(14, 1.20 * s), pb = Math.max(4, 0.19 * s);
    var tg = Math.max(10, 0.60 * s);
    return '' +
      '<pattern id="vlh' + u + '" width="' + (pl * 2) + '" height="' + (pb * 2) + '" patternUnits="userSpaceOnUse">' +
        '<rect width="' + (pl * 2) + '" height="' + (pb * 2) + '" fill="#C9A16B"/>' +
        '<rect y="0" width="' + (pl * 2) + '" height="' + pb + '" fill="#C49A62"/>' +
        '<line x1="0" y1="' + pb + '" x2="' + (pl * 2) + '" y2="' + pb + '" stroke="#A8804B" stroke-width="0.8"/>' +
        '<line x1="0" y1="' + (pb * 2) + '" x2="' + (pl * 2) + '" y2="' + (pb * 2) + '" stroke="#A8804B" stroke-width="0.8"/>' +
        '<line x1="' + pl + '" y1="0" x2="' + pl + '" y2="' + pb + '" stroke="#A8804B" stroke-width="0.8"/>' +
        '<line x1="' + (pl * 0.5) + '" y1="' + pb + '" x2="' + (pl * 0.5) + '" y2="' + (pb * 2) + '" stroke="#A8804B" stroke-width="0.8"/>' +
        '<line x1="' + (pl * 1.6) + '" y1="' + pb + '" x2="' + (pl * 1.6) + '" y2="' + (pb * 2) + '" stroke="#A8804B" stroke-width="0.8"/>' +
      '</pattern>' +
      '<pattern id="vlt' + u + '" width="' + tg + '" height="' + tg + '" patternUnits="userSpaceOnUse">' +
        '<rect width="' + tg + '" height="' + tg + '" fill="#E4E2DC"/>' +
        '<path d="M0 0 H' + tg + ' M0 0 V' + tg + '" stroke="#CBC7BE" stroke-width="1" fill="none"/>' +
      '</pattern>';
  }

  function vloerVoor(functie) {
    return (functie === 'badkamer' || functie === 'gang') ? 'tegel' : 'hout';
  }

  /* --------------------------------------------------------- gereedschap --- */

  /* Elk meubel wordt getekend in zijn eigen assenstelsel — 0,0 linksboven,
     breedte × diepte in meters — en daarna met één transform op zijn plek
     gezet. Dat scheelt in elke symboolfunctie een coördinatensom, en het
     maakt draaien een kwestie van een graad in plaats van alle punten
     omrekenen. */
  function plaats(item, ctx, inhoud) {
    var r = draai(item.rot);
    /* Draaien gebeurt om het middelpunt van het meubel en niet om zijn
       linkerbovenhoek. Dat is wat iemand verwacht die op "draai 90°" drukt:
       de bank staat daarna dwars op dezelfde plek. Om de hoek zou hij een
       halve banklengte de kamer in zwaaien, en bij een bed van twee meter is
       dat het verschil tussen tegen de muur en midden op de vloer. */
    var cx = ctx.px(item.x + item.b / 2), cy = ctx.py(item.y + item.d / 2);
    return '<g class="meubel" data-meubel="' + esc(item.id || '') +
           '" data-soort="' + esc(item.soort) + '" data-rot="' + r + '"' +
           ' transform="translate(' + cx + ' ' + cy + ')' + (r ? ' rotate(' + r + ')' : '') +
           ' scale(' + ctx.s + ') translate(' + (-item.b / 2) + ' ' + (-item.d / 2) + ')">' +
           inhoud + '</g>';
  }

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Alleen kwartslagen. Een bank onder 37 graden is geen verkoopplattegrond
     maar een ongeluk, en hij maakt bovendien elke maat onmeetbaar. */
  function draai(r) {
    r = Math.round(((Number(r) || 0) % 360 + 360) % 360 / 90) * 90;
    return r === 360 ? 0 : r;
  }

  /* Het vlak dat het meubel na het draaien werkelijk beslaat. Een gedraaid
     bed van 1,60 × 2,00 is 2,00 × 1,60, en wie dat vergeet schuift hem
     vrolijk half door de buitenmuur heen. */
  function beslag(item) {
    var r = draai(item.rot);
    var dwars = (r === 90 || r === 270);
    var b = dwars ? item.d : item.b, d = dwars ? item.b : item.d;
    var cx = item.x + item.b / 2, cy = item.y + item.d / 2;
    return { x0: cx - b / 2, y0: cy - d / 2, x1: cx + b / 2, y1: cy + d / 2, b: b, d: d };
  }

  var LIJN = 'fill="none" stroke="#6E6A62" stroke-width="0.012"';
  var VLAK = 'fill="#E9E4D9" stroke="#6E6A62" stroke-width="0.014"';
  var ZACHT = 'fill="#C6C1B5" stroke="#5C584F" stroke-width="0.014"';
  var WIT = 'fill="#FBFAF7" stroke="#6E6A62" stroke-width="0.014"';

  /* ------------------------------------------------------------ symbolen --- */

  var SYMBOOL = {
    bed: function (b, d, o) {
      var kop = 0.20, dek = d * 0.62;
      var uit = '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.05" ' + VLAK + '/>';
      /* Het dekbed als apart vlak met een omslag: zo is aan het symbool te
         zien welke kant het hoofdeinde is, en dat bepaalt of het bed logisch
         staat. */
      uit += '<rect x="0.04" y="' + (d - dek) + '" width="' + (b - 0.08) + '" height="' + (dek - 0.04) + '" rx="0.04" ' + ZACHT + '/>';
      uit += '<line x1="0.04" y1="' + (d - dek + 0.22) + '" x2="' + (b - 0.04) + '" y2="' + (d - dek + 0.22) + '" ' + LIJN + '/>';
      var n = o && o.eenpersoons ? 1 : 2;
      for (var i = 0; i < n; i++) {
        var kb = (b - 0.12 - (n - 1) * 0.06) / n;
        uit += '<rect x="' + (0.06 + i * (kb + 0.06)) + '" y="0.07" width="' + kb + '" height="' + kop + '" rx="0.06" ' + WIT + '/>';
      }
      return uit;
    },
    nachtkastje: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.03" ' + VLAK + '/>' +
             '<circle cx="' + (b / 2) + '" cy="' + (d / 2) + '" r="0.05" ' + LIJN + '/>';
    },
    kast: function (b, d) {
      var uit = '<rect x="0" y="0" width="' + b + '" height="' + d + '" ' + VLAK + '/>';
      var n = Math.max(2, Math.round(b / 0.55));
      for (var i = 1; i < n; i++) uit += '<line x1="' + (b / n * i) + '" y1="0" x2="' + (b / n * i) + '" y2="' + d + '" ' + LIJN + '/>';
      /* Het streepje naar de kamer toe is de deuropening: zo is te zien dat er
         voor de kast ruimte nodig is. */
      uit += '<line x1="0.03" y1="' + (d - 0.03) + '" x2="' + (b - 0.03) + '" y2="' + (d - 0.03) + '" ' + LIJN + '/>';
      return uit;
    },
    bank: function (b, d) {
      /* Rug en armleuningen als donkere schil, de zitkussens licht. Andersom —
         een lichte schil met een wit vlak erin — leest bij deze schaal als een
         tafel, en dat was hij op de eerste versie ook. */
      var arm = 0.26, rug = 0.26;
      var uit = '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.07" fill="#B4AEA1" stroke="#5C584F" stroke-width="0.016"/>';
      var zitB = b - 2 * arm, zitD = d - rug - 0.06;
      var n = Math.max(2, Math.round(zitB / 0.70));
      for (var i = 0; i < n; i++) {
        var kb = (zitB - (n - 1) * 0.04) / n;
        uit += '<rect x="' + (arm + i * (kb + 0.04)) + '" y="' + rug + '" width="' + kb + '" height="' + zitD +
               '" rx="0.05" fill="#EDE9E0" stroke="#6E6A62" stroke-width="0.012"/>';
      }
      return uit;
    },
    fauteuil: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.09" fill="#B4AEA1" stroke="#5C584F" stroke-width="0.016"/>' +
             '<rect x="0.20" y="0.22" width="' + (b - 0.40) + '" height="' + (d - 0.28) +
             '" rx="0.06" fill="#EDE9E0" stroke="#6E6A62" stroke-width="0.012"/>';
    },
    salontafel: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.06" ' + VLAK + '/>' +
             '<circle cx="' + (b * 0.32) + '" cy="' + (d / 2) + '" r="' + Math.min(0.13, d * 0.22) + '" ' + LIJN + '/>' +
             '<rect x="' + (b * 0.52) + '" y="' + (d * 0.3) + '" width="' + (b * 0.3) + '" height="' + (d * 0.4) + '" rx="0.02" ' + LIJN + '/>';
    },
    eettafel: function (b, d, o) {
      var stoel = 0.45, marge = 0.55;
      var uit = '';
      var langs = Math.max(2, Math.floor((b - 0.2) / (stoel + 0.12)));
      /* De stoelen staan buiten het blad; de ruimte die ze vragen is
         meegerekend in de plaatsing, niet in het tafelblad. */
      for (var i = 0; i < langs; i++) {
        var sx = (b - (langs * stoel + (langs - 1) * 0.12)) / 2 + i * (stoel + 0.12);
        uit += '<rect x="' + sx + '" y="' + (-marge + 0.06) + '" width="' + stoel + '" height="' + (stoel - 0.04) + '" rx="0.05" ' + ZACHT + '/>';
        uit += '<rect x="' + sx + '" y="' + (d + marge - stoel - 0.02) + '" width="' + stoel + '" height="' + (stoel - 0.04) + '" rx="0.05" ' + ZACHT + '/>';
      }
      if (o && o.kopstoelen) {
        uit += '<rect x="' + (-marge + 0.08) + '" y="' + ((d - stoel) / 2) + '" width="' + (stoel - 0.04) + '" height="' + stoel + '" rx="0.05" ' + ZACHT + '/>';
        uit += '<rect x="' + (b + marge - stoel - 0.04) + '" y="' + ((d - stoel) / 2) + '" width="' + (stoel - 0.04) + '" height="' + stoel + '" rx="0.05" ' + ZACHT + '/>';
      }
      uit += '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.04" fill="#B9B2A4" stroke="#5C584F" stroke-width="0.016"/>';
      return uit;
    },
    keuken: function (b, d, o) {
      /* Een aanrecht van 0,60 diep met een spoelbak en een kookplaat erin, en
         een koelkast aan het eind. De volgorde is de gangbare werkdriehoek:
         koelen, spoelen, koken. */
      var uit = '<rect x="0" y="0" width="' + b + '" height="' + d + '" ' + VLAK + '/>';
      uit += '<line x1="0" y1="' + (d - 0.03) + '" x2="' + b + '" y2="' + (d - 0.03) + '" ' + LIJN + '/>';
      var koel = Math.min(0.60, b * 0.28);
      uit += '<rect x="0" y="0" width="' + koel + '" height="' + d + '" ' + WIT + '/>' +
             '<line x1="' + (koel * 0.5) + '" y1="0.06" x2="' + (koel * 0.5) + '" y2="' + (d - 0.06) + '" ' + LIJN + '/>';
      if (b > koel + 1.1) {
        var sx = koel + 0.25;
        uit += '<rect x="' + sx + '" y="0.10" width="0.50" height="' + (d - 0.20) + '" rx="0.05" ' + WIT + '/>' +
               '<circle cx="' + (sx + 0.25) + '" cy="' + (d / 2) + '" r="0.055" ' + LIJN + '/>' +
               '<line x1="' + (sx + 0.25) + '" y1="0.06" x2="' + (sx + 0.25) + '" y2="0.14" ' + LIJN + '/>';
        var kx = Math.min(b - 0.70, sx + 0.85);
        uit += '<rect x="' + kx + '" y="0.09" width="0.58" height="' + (d - 0.18) + '" rx="0.03" ' + WIT + '/>';
        [[0.16, 0.16], [0.42, 0.16], [0.16, 0.42], [0.42, 0.42]].forEach(function (p) {
          uit += '<circle cx="' + (kx + p[0]) + '" cy="' + (0.09 + p[1] * (d - 0.18) / 0.58) + '" r="0.055" ' + LIJN + '/>';
        });
      }
      if (o && o.lang && b > 3.0) {
        uit += '<rect x="' + (b - 0.60) + '" y="0" width="0.60" height="' + d + '" ' + WIT + '/>' +
               '<circle cx="' + (b - 0.30) + '" cy="' + (d / 2) + '" r="0.14" ' + LIJN + '/>';
      }
      return uit;
    },
    toilet: function (b, d) {
      return '<rect x="' + (b * 0.1) + '" y="0" width="' + (b * 0.8) + '" height="0.16" rx="0.02" ' + WIT + '/>' +
             '<path d="M' + (b * 0.5) + ' 0.16 m-' + (b * 0.38) + ' 0 a' + (b * 0.38) + ' ' + ((d - 0.16) * 0.55) +
             ' 0 1 0 ' + (b * 0.76) + ' 0 Z" ' + WIT + '/>' +
             '<ellipse cx="' + (b * 0.5) + '" cy="' + (0.16 + (d - 0.16) * 0.45) + '" rx="' + (b * 0.24) + '" ry="' + ((d - 0.16) * 0.3) + '" ' + LIJN + '/>';
    },
    wastafel: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.04" ' + WIT + '/>' +
             '<ellipse cx="' + (b / 2) + '" cy="' + (d * 0.56) + '" rx="' + (b * 0.33) + '" ry="' + (d * 0.3) + '" ' + LIJN + '/>' +
             '<circle cx="' + (b / 2) + '" cy="' + (d * 0.16) + '" r="0.035" ' + LIJN + '/>';
    },
    douche: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" ' + WIT + '/>' +
             '<path d="M0 0 L' + b + ' ' + d + ' M' + b + ' 0 L0 ' + d + '" ' + LIJN + '/>' +
             '<circle cx="' + (b / 2) + '" cy="' + (d / 2) + '" r="0.055" ' + LIJN + '/>';
    },
    bad: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.08" ' + WIT + '/>' +
             '<rect x="0.07" y="0.07" width="' + (b - 0.14) + '" height="' + (d - 0.14) + '" rx="0.07" ' + LIJN + '/>' +
             '<circle cx="' + (b - 0.24) + '" cy="' + (d / 2) + '" r="0.045" ' + LIJN + '/>';
    },
    wasmachine: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" ' + WIT + '/>' +
             '<circle cx="' + (b / 2) + '" cy="' + (d / 2) + '" r="' + (Math.min(b, d) * 0.32) + '" ' + LIJN + '/>';
    },
    kastje: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" ' + VLAK + '/>';
    },
    bureau: function (b, d) {
      return '<rect x="0" y="0" width="' + b + '" height="' + d + '" rx="0.03" ' + VLAK + '/>' +
             '<rect x="' + (b * 0.35) + '" y="' + (d + 0.08) + '" width="0.45" height="0.42" rx="0.05" ' + ZACHT + '/>';
    },
    trap: function (b, d) {
      var uit = '<rect x="0" y="0" width="' + b + '" height="' + d + '" ' + WIT + '/>';
      var n = Math.max(4, Math.round(d / 0.24));
      for (var i = 1; i < n; i++) uit += '<line x1="0" y1="' + (d / n * i) + '" x2="' + b + '" y2="' + (d / n * i) + '" ' + LIJN + '/>';
      uit += '<path d="M' + (b / 2) + ' ' + (d - 0.12) + ' V0.20 m-0.10 0.18 l0.10 -0.18 l0.10 0.18" ' + LIJN + '/>';
      return uit;
    }
  };

  function teken(item, ctx) {
    var fn = SYMBOOL[item.soort];
    if (!fn) return '';
    return plaats(item, ctx, fn(item.b, item.d, item.opt || {}));
  }

  /* ------------------------------------------------------------ opstellen --- */

  /* De inrichting per ruimte. `R` is het rechthoekje van de ruimte in meters
     ({x0,y0,x1,y1}); y0 is de zijde van de bestaande woning, y1 de tuinzijde.
     Er wordt niets geplaatst wat niet past: krap is krap, en dat hoort te
     zien te zijn. */
  function past(R, x, y, b, d) {
    return x >= R.x0 - 0.001 && y >= R.y0 - 0.001 && x + b <= R.x1 + 0.001 && y + d <= R.y1 + 0.001;
  }

  function slaapkamer(R) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0, uit = [];
    var breed = Math.min(1.60, b - 0.9);
    if (breed < 0.85 || d < 2.3) {
      /* Geen bed erin: liever leeg dan een bed dat er in het echt niet past. */
      return uit;
    }
    var eenpersoons = breed < 1.35;
    var bedB = eenpersoons ? 0.90 : 1.60;
    /* Het hoofdeinde tegen de wand aan de woningzijde; nachtkastjes ernaast
       waar ruimte is. */
    var bx = R.x0 + (b - bedB) / 2, by = R.y0 + 0.10;
    uit.push({ soort: 'bed', x: bx, y: by, b: bedB, d: 2.00, opt: { eenpersoons: eenpersoons } });
    [bx - 0.50, bx + bedB + 0.05].forEach(function (nx) {
      if (past(R, nx, by, 0.45, 0.40)) uit.push({ soort: 'nachtkastje', x: nx, y: by, b: 0.45, d: 0.40 });
    });
    /* De kast tegen de tuinzijde, als er na het bed nog 0,6 m over is. */
    var kastY = by + 2.00 + 0.70;
    var kastB = Math.min(b - 0.4, 2.20);
    if (past(R, R.x0 + 0.15, kastY, kastB, 0.60)) {
      uit.push({ soort: 'kast', x: R.x0 + 0.15, y: kastY, b: kastB, d: 0.60 });
    }
    return uit;
  }

  function badkamer(R, opt) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0, uit = [];
    if (b < 1.2 || d < 1.4) return uit;
    /* Douche in de verste hoek, toilet en wastafel langs de lange wand. Dat is
       de gangbare indeling van een badkamer van deze maat, en hij houdt de
       natte hoek bij elkaar. */
    var dou = Math.min(0.90, Math.min(b, d) * 0.5);
    uit.push({ soort: 'douche', x: R.x1 - dou - 0.05, y: R.y1 - dou - 0.05, b: dou, d: dou });
    if (past(R, R.x0 + 0.08, R.y1 - 0.65, 0.37, 0.60)) {
      uit.push({ soort: 'toilet', x: R.x0 + 0.08, y: R.y1 - 0.65, b: 0.37, d: 0.60 });
    }
    if (past(R, R.x0 + 0.08, R.y0 + 0.10, 0.60, 0.45)) {
      uit.push({ soort: 'wastafel', x: R.x0 + 0.08, y: R.y0 + 0.10, b: 0.60, d: 0.45 });
    }
    if (opt && opt.luxe && past(R, R.x0 + 0.80, R.y0 + 0.10, 1.70, 0.75)) {
      uit.push({ soort: 'bad', x: R.x0 + 0.80, y: R.y0 + 0.10, b: 1.70, d: 0.75 });
    } else if (past(R, R.x0 + 0.78, R.y0 + 0.10, 0.60, 0.60)) {
      uit.push({ soort: 'wasmachine', x: R.x0 + 0.78, y: R.y0 + 0.10, b: 0.60, d: 0.60 });
    }
    return uit;
  }

  /* De woonruimte in twee zones naast elkaar: koken en eten links, zitten
     rechts. Dat is de indeling die op een woonkamer van vier bij vijf
     werkelijk past, en het is ook wat een verkoopplattegrond laat zien.

     De eerdere versie zette de eettafel tegen het einde van het keukenblok en
     hield daarna nog anderhalve meter over voor de zithoek — te weinig, dus
     verdween de bank en stond er een woonkamer van zestien vierkante meter
     met alleen een tafel erin. Zones werken beter: elke zone krijgt zijn deel
     van de breedte en wat daarin past, past. */
  function woonruimte(R, opt) {
    opt = opt || {};
    var b = R.x1 - R.x0, d = R.y1 - R.y0, uit = [];
    var boven = R.y0;

    if (opt.keuken && b > 2.6 && d > 2.4) {
      /* Het keukenblok blijft kort: een blok van drie en een halve meter vult
         de halve woonkamer en laat geen plek meer over om te eten. */
      var kb = Math.min(opt.keukenLang ? 3.00 : 2.40, b * 0.48);
      uit.push({ soort: 'keuken', x: R.x0 + 0.05, y: R.y0 + 0.05, b: kb, d: 0.60,
                 opt: { lang: !!opt.keukenLang } });
      /* 0,65 m vrij vóór het aanrecht. Samen met de 0,55 m die de eettafel
         zelf voor zijn stoelen reserveert is dat 1,20 m tussen aanrecht en
         tafelrand — de gangbare maat. Hier eerst 0,85 aanhouden telde die
         loopruimte twee keer, en dan paste er in een woonkamer van bijna vijf
         bij drieënhalf geen eettafel meer. */
      boven = R.y0 + 0.60 + 0.65;
    } else {
      boven = R.y0 + 0.15;
    }
    /* De keukenstrook geldt alleen voor de linkerzone. De zithoek staat
       ernaast en heeft de volle diepte van de kamer — dat is het verschil
       tussen een bank die past en een bank die niet past. */
    var vrijD = R.y1 - boven;                 // linkerzone: onder de keuken
    var zitBoven = R.y0 + 0.15;
    var zitD = R.y1 - zitBoven;               // rechterzone: hele diepte
    var linksB = opt.keuken ? b * 0.48 : b * 0.52;
    var rechtsX = R.x0 + linksB, rechtsB = R.x1 - rechtsX;

    /* Eettafel in de linkerzone. Zes personen als het past, anders vier, en
       anders geen — een tafel die er niet bij kan hoort er niet te staan. */
    var tafels = [{ b: 2.00, d: 1.00, kop: true }, { b: 1.60, d: 0.90, kop: false }, { b: 1.20, d: 0.80, kop: false }];
    var tafelGeplaatst = false;
    for (var i = 0; i < tafels.length; i++) {
      var t = tafels[i];
      var nodigB = t.b + (t.kop ? 1.10 : 0.20), nodigD = t.d + 1.10;
      var zoneB = (rechtsB <= 1.9 && b > 2.6 && vrijD >= 2.95) ? b : linksB;
      if (nodigB <= zoneB - 0.2 && nodigD <= vrijD - 0.1) {
        var tx = R.x0 + (zoneB - t.b) / 2;
        uit.push({ soort: 'eettafel', x: tx, y: boven + 0.55, b: t.b, d: t.d,
                   opt: { kopstoelen: t.kop } });
        tafelGeplaatst = true;
        break;
      }
    }

    /* Past de zithoek niet naast de eettafel, dan gaat hij eronder: tafel in
       de bovenhelft, bank tegen de tuinzijde. Dat is bij een uitbouw de
       gangbare opstelling — eten bij de doorgang, zitten bij de tuindeuren —
       en zonder deze terugval bleef er in een kamer van vier bij drie alleen
       een tafel over. */
    /* Zonder eettafel is er ook geen linkerzone: dan is de hele kamer
       zitruimte. Zonder deze regel bleef er in een ondiepe kamer een losse
       fauteuil over terwijl er een bank van 2,20 m in past. */
    if (!tafelGeplaatst) { rechtsX = R.x0; rechtsB = b; }
    var gestapeld = tafelGeplaatst && rechtsB <= 1.9 && b > 2.6 && vrijD >= 2.95;
    if (gestapeld) {
      var stapelBank = Math.min(2.20, b - 0.5);
      uit.push({ soort: 'bank', x: R.x0 + (b - stapelBank) / 2, y: R.y1 - 1.05, b: stapelBank, d: 0.90 });
      if (vrijD >= 3.6) {
        uit.push({ soort: 'salontafel', x: R.x0 + (b - 1.10) / 2, y: R.y1 - 2.00, b: 1.10, d: 0.60 });
      }
      return uit;
    }
    if (rechtsB > 1.9 && zitD > 1.15) {
      var bankB = Math.min(2.20, rechtsB - 0.30);
      var bx = rechtsX + (rechtsB - bankB) / 2;
      uit.push({ soort: 'bank', x: bx, y: zitBoven, b: bankB, d: 0.90 });
      if (zitD > 2.3) {
        uit.push({ soort: 'salontafel', x: rechtsX + (rechtsB - 1.10) / 2, y: zitBoven + 1.15, b: 1.10, d: 0.60 });
      }
      if (zitD > 3.0 && rechtsB > 2.4) {
        uit.push({ soort: 'fauteuil', x: R.x1 - 1.00, y: zitBoven + 1.95, b: 0.85, d: 0.85 });
      }
    } else if (rechtsB > 1.2 && zitD > 1.2) {
      uit.push({ soort: 'fauteuil', x: rechtsX + (rechtsB - 0.85) / 2, y: zitBoven, b: 0.85, d: 0.85 });
    }
    return uit;
  }

  /* Een studio doet alles in één ruimte: het bed aan de verste kop, en de
     rest als woonruimte in de ruimte die overblijft. */
  function studio(R, opt) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0;
    var bedB = 1.60;
    if (b > 5.4 && d > 2.4) {
      var bedX = R.x1 - bedB - 0.30;
      var uit = woonruimte({ x0: R.x0, y0: R.y0, x1: bedX - 0.60, y1: R.y1 }, opt);
      uit.push({ soort: 'bed', x: bedX, y: R.y0 + 0.20, b: bedB, d: 2.00 });
      if (past(R, bedX - 0.50, R.y0 + 0.20, 0.45, 0.40)) {
        uit.push({ soort: 'nachtkastje', x: bedX - 0.50, y: R.y0 + 0.20, b: 0.45, d: 0.40 });
      }
      return uit;
    }
    return woonruimte(R, opt);
  }

  /* De open ruimte van een dakopbouw. Mensen bouwen er meestal een slaapkamer
     in — dat is ook wat de voorbeelden in de configurator heten — dus komt
     het bed eerst. Past dat niet naast het trapgat, dan wordt het een
     zitruimte, en dat is dan het eerlijke antwoord op de maat: op vier bij
     drie blijft er naast een trap van 2,60 m geen slaapkamer over. */
  function zolderkamer(R, opt) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0;
    var uit = [];
    if (b >= 2.5 && d >= 2.35) {
      var bedB = Math.min(1.60, b - 0.9);
      var bx = R.x0 + 0.15, by = R.y0 + 0.12;
      uit.push({ soort: 'bed', x: bx, y: by, b: bedB, d: 2.00 });
      if (past(R, bx + bedB + 0.05, by, 0.45, 0.40)) {
        uit.push({ soort: 'nachtkastje', x: bx + bedB + 0.05, y: by, b: 0.45, d: 0.40 });
      }
      var kastX = bx + bedB + 0.60;
      if (past(R, kastX, R.y0 + 0.60, Math.min(1.80, R.x1 - kastX - 0.15), 0.60)) {
        uit.push({ soort: 'kast', x: kastX, y: R.y0 + 0.60, b: Math.min(1.80, R.x1 - kastX - 0.15), d: 0.60 });
      }
      if (past(R, R.x1 - 1.55, R.y1 - 0.85, 1.40, 0.70)) {
        uit.push({ soort: 'bureau', x: R.x1 - 1.55, y: R.y1 - 1.35, b: 1.40, d: 0.70 });
      }
      uit.bedGeplaatst = true;
      return uit;
    }
    var w = woonruimte(R, opt || {});
    w.geenBed = true;
    return w;
  }

  function leefruimte(R) {
    /* Een uitbouw is een verlengde woonkamer: eettafel bij de bestaande
       woning, zithoek bij de tuindeuren. Geen keuken, tenzij de bezoeker die
       apart heeft gekozen — dat staat dan in de opties en niet hier. */
    return woonruimte(R, {});
  }

  /* De gang blijft leeg op één ding na: de meterkast. Die is in een
     zelfstandige woning verplicht en hij neemt echte ruimte in, dus hoort hij
     op de plattegrond te staan en niet pas op de bouw op te duiken. */
  function gang(R) {
    var uit = [];
    if (R.x1 - R.x0 > 1.2 && R.y1 - R.y0 > 0.55) {
      /* Aan het einde van de gang, niet aan het begin: daar komt bij een
         dakopbouw de trap uit, en het opschrift botste er met de ruimtenaam. */
      uit.push({ soort: 'kastje', x: R.x1 - 0.72, y: R.y0 + 0.05, b: 0.60, d: 0.35,
                 meterkast: true, labelEind: true });
    }
    return uit;
  }

  /* De ruimtes die de indeling-editor kent, elk met wat er in hoort. De
     bezoeker kiest daar een functie uit een vaste lijst; die lijst en deze
     opstellingen horen bij elkaar, anders krijgt een berging een bank. */
  function keukenruimte(R) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0, uit = [];
    if (b < 1.6 || d < 1.6) return uit;
    var kb = Math.min(b - 0.3, 3.20);
    uit.push({ soort: 'keuken', x: R.x0 + 0.15, y: R.y0 + 0.10, b: kb, d: 0.60, opt: { lang: kb > 3.0 } });
    /* Tweede blok tegenover het eerste als de kamer diep genoeg is voor
       1,20 m loopruimte ertussen. */
    if (d > 0.60 + 1.20 + 0.60) {
      uit.push({ soort: 'kastje', x: R.x0 + 0.15, y: R.y1 - 0.70, b: Math.min(b - 0.3, 2.40), d: 0.60 });
    } else if (b > 3.2 && d > 2.4) {
      uit.push({ soort: 'eettafel', x: R.x0 + (b - 1.20) / 2, y: R.y0 + 1.45, b: 1.20, d: 0.80 });
    }
    return uit;
  }
  function eetkamer(R) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0;
    var tafels = [{ b: 2.00, d: 1.00, kop: true }, { b: 1.60, d: 0.90, kop: false }, { b: 1.20, d: 0.80, kop: false }];
    for (var i = 0; i < tafels.length; i++) {
      var t = tafels[i];
      if (t.b + (t.kop ? 1.10 : 0.20) <= b - 0.2 && t.d + 1.10 <= d - 0.1) {
        return [{ soort: 'eettafel', x: R.x0 + (b - t.b) / 2, y: R.y0 + (d - t.d) / 2,
                  b: t.b, d: t.d, opt: { kopstoelen: t.kop } }];
      }
    }
    return [];
  }
  function kantoor(R) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0, uit = [];
    if (b < 1.7 || d < 1.6) return uit;
    uit.push({ soort: 'bureau', x: R.x0 + 0.20, y: R.y0 + 0.20, b: Math.min(1.60, b - 0.4), d: 0.70 });
    if (past(R, R.x1 - 1.95, R.y1 - 0.75, 1.80, 0.60)) {
      uit.push({ soort: 'kast', x: R.x1 - 1.95, y: R.y1 - 0.75, b: 1.80, d: 0.60 });
    }
    return uit;
  }
  function berging(R) {
    var b = R.x1 - R.x0, d = R.y1 - R.y0, uit = [];
    if (b < 0.9 || d < 0.8) return uit;
    uit.push({ soort: 'kast', x: R.x0 + 0.10, y: R.y0 + 0.10, b: Math.min(b - 0.2, 2.40), d: 0.60 });
    if (past(R, R.x0 + 0.10, R.y1 - 0.70, 0.60, 0.60)) {
      uit.push({ soort: 'wasmachine', x: R.x0 + 0.10, y: R.y1 - 0.70, b: 0.60, d: 0.60 });
    }
    return uit;
  }

  function meubileer(ruimte, R, ctxOpt) {
    if (!ruimte || !R) return [];
    var f = ruimte.functie || '';
    var opt = { keuken: !!ruimte.keuken, keukenLang: !!ruimte.keukenLang, luxe: !!ruimte.luxe };
    if (f === 'slaapkamer') return slaapkamer(R);
    if (f === 'badkamer') return badkamer(R, opt);
    if (f === 'woonkamer') return woonruimte(R, opt);
    if (f === 'studio') return studio(R, opt);
    if (f === 'zolderkamer') return zolderkamer(R, opt);
    if (f === 'keuken') return keukenruimte(R);
    if (f === 'eetkamer') return eetkamer(R);
    if (f === 'kantoor') return kantoor(R);
    if (f === 'berging') return berging(R);
    if (f === 'leefruimte') return leefruimte(R);
    if (f === 'gang') return gang(R);
    return [];                                  // overloop, berging: leeg
  }

  /* Het palet: wat de bezoeker er zelf bij kan zetten. De maten zijn de
     gangbare Nederlandse standaardmaten, want daar gaat het om — een
     plattegrond waarop de bank 1,80 blijkt te zijn omdat dat lekker paste, is
     een plattegrond waar niemand iets aan heeft. Ze staan hier in centimeters
     bij de naam, zodat in de keuzelijst meteen te zien is wat je neerzet. */
  var PALET = [
    { groep: 'Wonen', soort: 'bank', naam: 'Bank', b: 2.10, d: 0.90 },
    { groep: 'Wonen', soort: 'bank', naam: 'Hoekbank', b: 2.60, d: 0.95 },
    { groep: 'Wonen', soort: 'fauteuil', naam: 'Fauteuil', b: 0.80, d: 0.85 },
    { groep: 'Wonen', soort: 'salontafel', naam: 'Salontafel', b: 1.10, d: 0.60 },
    { groep: 'Wonen', soort: 'kastje', naam: 'Dressoir', b: 1.60, d: 0.45 },
    { groep: 'Eten', soort: 'eettafel', naam: 'Eettafel 4 personen', b: 1.20, d: 0.80 },
    { groep: 'Eten', soort: 'eettafel', naam: 'Eettafel 6 personen', b: 1.80, d: 0.90, opt: { kopstoelen: true } },
    { groep: 'Eten', soort: 'keuken', naam: 'Keukenblok 2,40 m', b: 2.40, d: 0.60 },
    { groep: 'Eten', soort: 'keuken', naam: 'Keukenblok 3,60 m', b: 3.60, d: 0.60, opt: { lang: true } },
    { groep: 'Slapen', soort: 'bed', naam: 'Tweepersoonsbed 160 × 200', b: 1.60, d: 2.00 },
    { groep: 'Slapen', soort: 'bed', naam: 'Tweepersoonsbed 180 × 200', b: 1.80, d: 2.00 },
    { groep: 'Slapen', soort: 'bed', naam: 'Eenpersoonsbed 90 × 200', b: 0.90, d: 2.00, opt: { eenpersoons: true } },
    { groep: 'Slapen', soort: 'nachtkastje', naam: 'Nachtkastje', b: 0.45, d: 0.40 },
    { groep: 'Slapen', soort: 'kast', naam: 'Kledingkast 1,20 m', b: 1.20, d: 0.60 },
    { groep: 'Slapen', soort: 'kast', naam: 'Kledingkast 2,00 m', b: 2.00, d: 0.60 },
    { groep: 'Badkamer', soort: 'douche', naam: 'Douche 90 × 90', b: 0.90, d: 0.90 },
    { groep: 'Badkamer', soort: 'bad', naam: 'Ligbad 170 × 75', b: 1.70, d: 0.75 },
    { groep: 'Badkamer', soort: 'wastafel', naam: 'Wastafel', b: 0.60, d: 0.45 },
    { groep: 'Badkamer', soort: 'toilet', naam: 'Toilet', b: 0.40, d: 0.60 },
    { groep: 'Badkamer', soort: 'wasmachine', naam: 'Wasmachine', b: 0.60, d: 0.60 },
    { groep: 'Werken', soort: 'bureau', naam: 'Bureau', b: 1.40, d: 0.70 },
    { groep: 'Werken', soort: 'kast', naam: 'Boekenkast', b: 0.90, d: 0.35 }
  ];

  global.NGBouwmeubels = {
    defs: defs, teken: teken, meubileer: meubileer, vloerVoor: vloerVoor,
    SYMBOOL: SYMBOOL, PALET: PALET, beslag: beslag, draai: draai,
    _hulp: { past: past, slaapkamer: slaapkamer, badkamer: badkamer, woonruimte: woonruimte }
  };
})(typeof window !== 'undefined' ? window : globalThis);
