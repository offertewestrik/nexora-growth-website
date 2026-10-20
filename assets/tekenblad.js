/* Een tekenblad met twee achterkanten: SVG voor het scherm, PDF voor de printer.
 *
 * WAAROM. De tekening moet op het scherm staan én in een PDF, en die twee mogen
 * onmogelijk verschillen. De verleiding is om de PDF te maken door de SVG als
 * plaatje in te sluiten, maar dan is een technische tekening ineens een foto van
 * een technische tekening: niet meer in te zoomen, niet meer op te meten, niet
 * meer over te nemen in CAD. De andere verleiding is om het tekenwerk twee keer
 * te schrijven, en dan lopen ze na de derde wijziging uiteen.
 *
 * Dus: één tekenroutine die niet weet waar hij op tekent. Hij vraagt om een
 * blad, zet er lijnen, vlakken en teksten op, en of daar SVG of PDF uit komt is
 * de zorg van het blad.
 *
 * ASSEN. Het blad werkt in de assen van de tekening: millimeters, x naar rechts,
 * y naar beneden. PDF rekent in punten met y omhoog; die omkering zit in het
 * PDF-blad en nergens anders.
 */
(function () {
  "use strict";

  var PT_PER_MM = 72 / 25.4;

  function hexNaarRgb(h) {
    if (!h || h === 'none') return null;
    if (h[0] !== '#') h = '#000000';
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    var n = parseInt(h.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* -------------------------------------------------------------- SVG-blad */

  function svgBlad() {
    var uit = [];
    function attr(o) {
      o = o || {};
      var s = ' stroke="' + (o.kleur || 'none') + '" stroke-width="' + (o.dikte || 0) + '"';
      if (o.streep) s += ' stroke-dasharray="' + o.streep.join(' ') + '"';
      if (o.doorzicht != null) s += ' opacity="' + o.doorzicht + '"';
      return s;
    }
    return {
      soort: 'svg',
      lijn: function (x1, y1, x2, y2, o) {
        uit.push('<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' +
          x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"' + attr(o) + '/>');
      },
      rect: function (v, o) {
        o = o || {};
        uit.push('<rect x="' + v.x0.toFixed(1) + '" y="' + v.y0.toFixed(1) + '" width="' +
          (v.x1 - v.x0).toFixed(1) + '" height="' + (v.y1 - v.y0).toFixed(1) +
          '" fill="' + (o.vul || 'none') + '"' + attr(o) + '/>');
      },
      cirkel: function (x, y, r, o) {
        o = o || {};
        uit.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' +
          r.toFixed(1) + '" fill="' + (o.vul || 'none') + '"' + attr(o) + '/>');
      },
      /* Een boog van (x0,y0) naar (x1,y1) over een cirkel met straal r. */
      boog: function (x0, y0, x1, y1, r, groot, mee, o) {
        uit.push('<path d="M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A ' + r.toFixed(1) +
          ' ' + r.toFixed(1) + ' 0 ' + (groot ? 1 : 0) + ' ' + (mee ? 1 : 0) + ' ' +
          x1.toFixed(1) + ' ' + y1.toFixed(1) + '" fill="none"' + attr(o) + '/>');
      },
      /* Een gesloten veelhoek — de L-vormige plattegrond is geen rechthoek meer,
         dus moet er iets zijn dat een willekeurige omtrek kan vullen. */
      veelhoek: function (punten, o) {
        o = o || {};
        var d = punten.map(function (p, i) {
          return (i ? 'L ' : 'M ') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
        }).join(' ') + ' Z';
        uit.push('<path d="' + d + '" fill="' + (o.vul || 'none') + '"' + attr(o) + '/>');
      },
      tekst: function (x, y, t, o) {
        o = o || {};
        var h = o.hoogte || 60;
        var kern = '<text font-size="' + h + '" fill="' + (o.kleur || '#000') +
          '" text-anchor="' + (o.anker || 'middle') +
          '" font-family="Helvetica,Arial,sans-serif">' + esc(t) + '</text>';
        if (o.draai) {
          uit.push('<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) +
            ') rotate(' + o.draai + ')">' + kern.replace('<text ', '<text x="0" y="0" ') + '</g>');
        } else {
          uit.push(kern.replace('<text ', '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" '));
        }
      },
      groep: function (attrs) { uit.push('<g ' + (attrs || '') + '>'); },
      eindGroep: function () { uit.push('</g>'); },
      inhoud: function () { return uit.join(''); }
    };
  }

  /* -------------------------------------------------------------- PDF-blad */

  /* Tekent in de assen van de tekening en schrijft PDF-operatoren. De omrekening
     naar punten en de omgekeerde y-as gebeuren hier, zodat de tekenroutine er
     niets van hoeft te weten. */
  function pdfBlad(ctx) {
    // ctx: { ox, oy, k }  — ox/oy in punten (linksonder is 0,0), k = punt per mm
    var uit = [];
    var X = function (x) { return ctx.ox + x * ctx.k; };
    var Y = function (y) { return ctx.oy - y * ctx.k; };
    var L = function (v) { return v * ctx.k; };
    function nr(v) { return (Math.round(v * 100) / 100).toString(); }

    function stijl(o) {
      o = o || {};
      var s = '';
      var lijnKleur = hexNaarRgb(o.kleur);
      var vulKleur = hexNaarRgb(o.vul);
      if (lijnKleur) s += nr(lijnKleur[0]) + ' ' + nr(lijnKleur[1]) + ' ' + nr(lijnKleur[2]) + ' RG\n';
      if (vulKleur) s += nr(vulKleur[0]) + ' ' + nr(vulKleur[1]) + ' ' + nr(vulKleur[2]) + ' rg\n';
      s += nr(Math.max(0.1, L(o.dikte || 0))) + ' w\n';
      s += o.streep ? '[' + o.streep.map(function (d) { return nr(L(d)); }).join(' ') + '] 0 d\n'
                    : '[] 0 d\n';
      // doorzichtigheid vraagt een ExtGState; een technische tekening kan zonder,
      // dus lichte lijnen worden lichter van kleur in plaats van doorzichtig
      return s;
    }
    function verf(o) {
      o = o || {};
      var heeftVul = !!hexNaarRgb(o.vul), heeftLijn = !!hexNaarRgb(o.kleur) && (o.dikte || 0) > 0;
      if (heeftVul && heeftLijn) return 'B\n';
      if (heeftVul) return 'f\n';
      return 'S\n';
    }

    return {
      soort: 'pdf',
      lijn: function (x1, y1, x2, y2, o) {
        uit.push('q\n' + stijl(o) + nr(X(x1)) + ' ' + nr(Y(y1)) + ' m ' +
                 nr(X(x2)) + ' ' + nr(Y(y2)) + ' l S\nQ\n');
      },
      rect: function (v, o) {
        uit.push('q\n' + stijl(o) + nr(X(v.x0)) + ' ' + nr(Y(v.y1)) + ' ' +
                 nr(L(v.x1 - v.x0)) + ' ' + nr(L(v.y1 - v.y0)) + ' re ' + verf(o) + 'Q\n');
      },
      cirkel: function (x, y, r, o) {
        var c = 0.5523 * r;
        var p = [[x + r, y], [x + r, y + c, x + c, y + r, x, y + r],
                 [x - c, y + r, x - r, y + c, x - r, y],
                 [x - r, y - c, x - c, y - r, x, y - r],
                 [x + c, y - r, x + r, y - c, x + r, y]];
        var s = 'q\n' + stijl(o) + nr(X(p[0][0])) + ' ' + nr(Y(p[0][1])) + ' m\n';
        for (var i = 1; i < p.length; i++) {
          s += nr(X(p[i][0])) + ' ' + nr(Y(p[i][1])) + ' ' + nr(X(p[i][2])) + ' ' +
               nr(Y(p[i][3])) + ' ' + nr(X(p[i][4])) + ' ' + nr(Y(p[i][5])) + ' c\n';
        }
        uit.push(s + verf(o) + 'Q\n');
      },
      /* PDF kent geen boog. Een kwartcirkel is met één derdegraads kromme na te
         doen met een fout van minder dan een duizendste van de straal, en meer
         dan een kwartslag komt hier niet voor. */
      boog: function (x0, y0, x1, y1, r, groot, mee, o) {
        var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        var dx = x1 - x0, dy = y1 - y0;
        var koorde = Math.hypot(dx, dy);
        if (!r || koorde < 1e-6) return;
        var hoogte = Math.sqrt(Math.max(0, r * r - koorde * koorde / 4));
        var teken = mee ? 1 : -1;
        var cx = mx + teken * (dy / koorde) * hoogte * (groot ? -1 : 1);
        var cy = my - teken * (dx / koorde) * hoogte * (groot ? -1 : 1);
        var a0 = Math.atan2(y0 - cy, x0 - cx), a1 = Math.atan2(y1 - cy, x1 - cx);
        var d = a1 - a0;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        var stappen = Math.max(1, Math.ceil(Math.abs(d) / (Math.PI / 2)));
        var s = 'q\n' + stijl(o) + nr(X(x0)) + ' ' + nr(Y(y0)) + ' m\n';
        for (var i = 0; i < stappen; i++) {
          var b0 = a0 + d * i / stappen, b1 = a0 + d * (i + 1) / stappen;
          var t = Math.tan((b1 - b0) / 4) * 4 / 3;
          var p0 = [cx + r * Math.cos(b0), cy + r * Math.sin(b0)];
          var p3 = [cx + r * Math.cos(b1), cy + r * Math.sin(b1)];
          var p1 = [p0[0] - t * r * Math.sin(b0), p0[1] + t * r * Math.cos(b0)];
          var p2 = [p3[0] + t * r * Math.sin(b1), p3[1] - t * r * Math.cos(b1)];
          s += nr(X(p1[0])) + ' ' + nr(Y(p1[1])) + ' ' + nr(X(p2[0])) + ' ' + nr(Y(p2[1])) +
               ' ' + nr(X(p3[0])) + ' ' + nr(Y(p3[1])) + ' c\n';
        }
        uit.push(s + 'S\nQ\n');
      },
      veelhoek: function (punten, o) {
        if (!punten.length) return;
        var s = 'q\n' + stijl(o) + nr(X(punten[0][0])) + ' ' + nr(Y(punten[0][1])) + ' m\n';
        for (var i = 1; i < punten.length; i++) {
          s += nr(X(punten[i][0])) + ' ' + nr(Y(punten[i][1])) + ' l\n';
        }
        uit.push(s + 'h ' + verf(o) + 'Q\n');
      },
      tekst: function (x, y, t, o) {
        o = o || {};
        var h = L(o.hoogte || 60);
        var s = String(t == null ? '' : t);
        var breed = pdfTekstBreed(s, h);
        var dx = o.anker === 'start' ? 0 : (o.anker === 'end' ? -breed : -breed / 2);
        var kleur = hexNaarRgb(o.kleur) || [0, 0, 0];
        var body = 'q\n' + nr(kleur[0]) + ' ' + nr(kleur[1]) + ' ' + nr(kleur[2]) + ' rg\nBT\n/F1 ' +
          nr(h) + ' Tf\n';
        if (o.draai) {
          var a = o.draai * Math.PI / 180;
          var co = Math.cos(a), si = Math.sin(a);
          // de draai is in schermassen (y omlaag); in PDF-assen keert de hoek om
          body += nr(co) + ' ' + nr(-si) + ' ' + nr(si) + ' ' + nr(co) + ' ' +
                  nr(X(x) + dx * co) + ' ' + nr(Y(y) - dx * si) + ' Tm\n';
        } else {
          body += nr(X(x) + dx) + ' ' + nr(Y(y) - h * 0.32) + ' Td\n';
        }
        uit.push(body + '(' + pdfEsc(s) + ') Tj\nET\nQ\n');
      },
      groep: function () { },
      eindGroep: function () { },
      inhoud: function () { return uit.join(''); }
    };
  }

  /* De breedtes van Helvetica, in duizendsten van de tekstgrootte. Alleen de
     tekens die op een bouwtekening voorkomen; de rest krijgt de breedte van een
     cijfer, en dat zit er nooit ver naast. */
  var HELV = { ' ': 278, '.': 278, ',': 278, '-': 333, '×': 584, '/': 278, ':': 278,
               '(': 333, ')': 333, '0': 556, '1': 556, '2': 556, '3': 556, '4': 556,
               '5': 556, '6': 556, '7': 556, '8': 556, '9': 556 };
  function pdfTekstBreed(t, h) {
    var som = 0, s = String(t);
    for (var i = 0; i < s.length; i++) {
      var c = s[i], w = HELV[c];
      if (w == null) w = /[A-Z]/.test(c) ? 667 : (/[a-z]/.test(c) ? 528 : 556);
      som += w;
    }
    return som / 1000 * h;
  }
  /* WinAnsi is latin-1 met een handvol drukkerstekens in de gaten van 0x80 tot
     0x9F. Zonder deze tabel werd elk kastlijntje en elk aanhalingsteken een
     vraagteken op papier — en een titelblok met "Achterwand ? 1:25" leest als
     een fout in de tekening in plaats van een fout in de tekenset. */
  var WINANSI = { '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84,
    '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89,
    'Š': 0x8A, '‹': 0x8B, 'Œ': 0x8C, 'Ž': 0x8E, '‘': 0x91,
    '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96,
    '\u2014': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9A, '›': 0x9B,
    'œ': 0x9C, 'ž': 0x9E, 'Ÿ': 0x9F };
  function pdfEsc(t) {
    var s = String(t).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    var uit = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i], n = s.charCodeAt(i);
      if (n <= 0xff) uit += c;               // latin-1, waaronder é, ë en ×
      else if (WINANSI[c] != null) uit += String.fromCharCode(WINANSI[c]);
      else uit += '?';
    }
    return uit;
  }

  /* -------------------------------------------------------------- DXF-blad */

  /* DXF R12, in ware grootte en in millimeters. Bewust de oudste versie die er
     is: elk CAD-pakket leest hem, hij is leesbaar met een teksteditor, en een
     badkamer heeft geen enkele constructie nodig die R12 niet kent.

     De y-as keert om — CAD rekent met y omhoog — en dat gebeurt hier, zodat de
     tekenroutine er niets van merkt. Kleuren worden lagen: wie de maatvoering
     wil uitzetten, zet de laag MAATVOERING uit. */
  function dxfBlad() {
    var uit = [];
    var laagNu = 'TEKENING';
    function p(code, waarde) { uit.push(code, String(waarde)); }
    function laagVan(o) {
      o = o || {};
      if (o.laag) return o.laag;
      return laagNu;
    }
    function Y(y) { return -y; }
    return {
      soort: 'dxf',
      laag: function (naam) { laagNu = naam; },
      lijn: function (x1, y1, x2, y2, o) {
        p(0, 'LINE'); p(8, laagVan(o));
        p(10, x1.toFixed(2)); p(20, Y(y1).toFixed(2));
        p(11, x2.toFixed(2)); p(21, Y(y2).toFixed(2));
      },
      rect: function (v, o) {
        var self = this;
        [[v.x0, v.y0, v.x1, v.y0], [v.x1, v.y0, v.x1, v.y1],
         [v.x1, v.y1, v.x0, v.y1], [v.x0, v.y1, v.x0, v.y0]].forEach(function (l) {
          self.lijn(l[0], l[1], l[2], l[3], o);
        });
      },
      cirkel: function (x, y, r, o) {
        p(0, 'CIRCLE'); p(8, laagVan(o));
        p(10, x.toFixed(2)); p(20, Y(y).toFixed(2)); p(40, r.toFixed(2));
      },
      /* Geen losse vulling in DXF R12 zonder hatch-entiteiten erbij te
         schrijven — de omtrek is hier het punt, niet de vulkleur. */
      veelhoek: function (punten, o) {
        var self = this;
        for (var i = 0; i < punten.length; i++) {
          var a = punten[i], b = punten[(i + 1) % punten.length];
          self.lijn(a[0], a[1], b[0], b[1], o);
        }
      },
      boog: function (x0, y0, x1, y1, r, groot, mee, o) {
        var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        var dx = x1 - x0, dy = y1 - y0, koorde = Math.hypot(dx, dy);
        if (!r || koorde < 1e-6) return;
        var hoogte = Math.sqrt(Math.max(0, r * r - koorde * koorde / 4));
        var teken = mee ? 1 : -1;
        var cx = mx + teken * (dy / koorde) * hoogte;
        var cy = my - teken * (dx / koorde) * hoogte;
        // DXF tekent altijd tegen de klok in; in omgeklapte assen wisselen de
        // uiteinden dus van rol
        var a0 = Math.atan2(Y(y0) - Y(cy), x0 - cx) * 180 / Math.PI;
        var a1 = Math.atan2(Y(y1) - Y(cy), x1 - cx) * 180 / Math.PI;
        p(0, 'ARC'); p(8, laagVan(o));
        p(10, cx.toFixed(2)); p(20, Y(cy).toFixed(2)); p(40, r.toFixed(2));
        p(50, (mee ? a0 : a1).toFixed(2)); p(51, (mee ? a1 : a0).toFixed(2));
      },
      tekst: function (x, y, t, o) {
        o = o || {};
        var h = o.hoogte || 60;
        p(0, 'TEXT'); p(8, laagVan(o));
        p(10, x.toFixed(2)); p(20, Y(y).toFixed(2)); p(40, h.toFixed(2));
        p(1, String(t == null ? '' : t));
        p(72, o.anker === 'start' ? 0 : (o.anker === 'end' ? 2 : 1));
        p(11, x.toFixed(2)); p(21, Y(y).toFixed(2));
        if (o.draai) p(50, (-o.draai).toFixed(2));
      },
      groep: function () { },
      eindGroep: function () { },
      inhoud: function () {
        var kop = ['0', 'SECTION', '2', 'ENTITIES'];
        var staart = ['0', 'ENDSEC', '0', 'EOF'];
        return kop.concat(uit, staart).join('\n') + '\n';
      }
    };
  }

  /* ---------------------------------------------------------- PDF-document */

  /* Genoeg PDF om een tekening op papier te krijgen: pagina's, één lettertype,
     en per pagina één inhoudsstroom. Geen compressie — een tekening van een paar
     honderd lijnen is klein genoeg, en ongecomprimeerd is te lezen met een
     teksteditor, wat bij het naspeuren van een maat een zegen is. */
  function pdfDocument() {
    var paginas = [];
    return {
      /** Een pagina in millimeters (A4 = 210 × 297). `teken` krijgt een blad dat
          in paginamillimeters werkt, en een pagina-object waarmee je een venster
          kunt openen: een tweede blad met een eigen nulpunt en schaal, zodat een
          tekening in objectmillimeters op een plek op het papier belandt. Alle
          bladen van één pagina komen achter elkaar in dezelfde inhoudsstroom —
          zonder dat zou de tekening uit een venster nergens terechtkomen. */
      pagina: function (breedteMm, hoogteMm, teken) {
        var bladen = [];
        var hoofd = pdfBlad({ ox: 0, oy: hoogteMm * PT_PER_MM, k: PT_PER_MM });
        bladen.push(hoofd);
        var pagina = {
          b: breedteMm, h: hoogteMm,
          /** `schaal` is de noemer: 20 betekent 1:20. `plek` in paginamillimeters,
              gemeten vanaf linksboven. */
          venster: function (plek, schaal) {
            var b = pdfBlad({ ox: plek.x * PT_PER_MM,
                              oy: (hoogteMm - plek.y) * PT_PER_MM,
                              k: PT_PER_MM / schaal });
            bladen.push(b);
            return b;
          }
        };
        teken(hoofd, pagina);
        paginas.push({ b: breedteMm * PT_PER_MM, h: hoogteMm * PT_PER_MM,
                       inhoud: bladen.map(function (x) { return x.inhoud(); }).join('') });
      },
      uit: function () {
        var objecten = [], nu = 0;
        function obj(inhoud) { objecten.push(inhoud); return ++nu; }
        // 1 catalogus, 2 pagina's, 3 lettertype, daarna per pagina twee objecten
        var idCatalogus = 1, idPaginas = 2, idFont = 3;
        nu = 3;
        var kids = [];
        paginas.forEach(function (p) {
          var idInhoud = ++nu;
          var idPagina = ++nu;
          objecten[idInhoud] = '<< /Length ' + p.inhoud.length + ' >>\nstream\n' +
            p.inhoud + 'endstream';
          objecten[idPagina] = '<< /Type /Page /Parent ' + idPaginas + ' 0 R /MediaBox [0 0 ' +
            p.b.toFixed(2) + ' ' + p.h.toFixed(2) + '] /Resources << /Font << /F1 ' + idFont +
            ' 0 R >> >> /Contents ' + idInhoud + ' 0 R >>';
          kids.push(idPagina + ' 0 R');
        });
        objecten[idCatalogus] = '<< /Type /Catalog /Pages ' + idPaginas + ' 0 R >>';
        objecten[idPaginas] = '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' +
          paginas.length + ' >>';
        objecten[idFont] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica ' +
          '/Encoding /WinAnsiEncoding >>';

        var kop = '%PDF-1.4\n';
        var stuk = [kop], plek = kop.length, plekken = [];
        for (var i = 1; i <= nu; i++) {
          plekken[i] = plek;
          var t = i + ' 0 obj\n' + (objecten[i] || '<< >>') + '\nendobj\n';
          stuk.push(t); plek += t.length;
        }
        var xref = 'xref\n0 ' + (nu + 1) + '\n0000000000 65535 f \n';
        for (var j = 1; j <= nu; j++) {
          xref += ('0000000000' + plekken[j]).slice(-10) + ' 00000 n \n';
        }
        stuk.push(xref);
        stuk.push('trailer\n<< /Size ' + (nu + 1) + ' /Root ' + idCatalogus +
                  ' 0 R >>\nstartxref\n' + plek + '\n%%EOF\n');
        return stuk.join('');
      }
    };
  }

  /** Van een PDF-tekst naar bytes. PDF met WinAnsi verwacht latin-1, en een
      string met accenten die als UTF-8 het bestand in gaat levert mojibake. */
  function naarBytes(s) {
    var b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
    return b;
  }

  function svgOmhulsel(blad, x, y, w, h, o) {
    o = o || {};
    var maat = o.schaal ? ' width="' + (w / o.schaal).toFixed(2) + 'mm" height="' +
      (h / o.schaal).toFixed(2) + 'mm"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + Math.round(x) + ' ' +
      Math.round(y) + ' ' + Math.round(w) + ' ' + Math.round(h) + '"' + maat +
      (o.klasse ? ' class="' + o.klasse + '"' : '') +
      ' preserveAspectRatio="xMidYMid meet">' + blad.inhoud() + '</svg>';
  }

  window.NGBlad = {
    svg: svgBlad, pdf: pdfBlad, dxf: dxfBlad, document: pdfDocument,
    naarBytes: naarBytes, svgOmhulsel: svgOmhulsel, tekstBreed: pdfTekstBreed,
    PT_PER_MM: PT_PER_MM
  };
})();
