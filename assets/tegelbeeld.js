/* Tekent tegels in perspectief — gedeeld door de tegelconfigurators.
 *
 * Hier zit geen enkele keuze in over wát er te koop is. Deze module krijgt
 * kant-en-klaar te horen hoe de tegel eruitziet en waar hij ligt, en tekent
 * dat. Zo kunnen de wand en de vloer verschillende tegels krijgen, en kan er
 * een tweede pagina bij zonder dat er een tweede tekenaar bij komt.
 *
 * Een tegelvlak wordt niet als plaatje opgehaald maar per beeldpunt
 * uitgerekend: formaat, verband en voegbreedte zijn meetkunde, de tegel zelf
 * is een kleur met structuur. Daardoor kan geen enkele combinatie ontbreken en
 * blijft het beeld op elke afstand scherp.
 *
 * Een MATERIAAL ziet er zo uit:
 *   { tw, th,      tegelmaat in meters
 *     g,           voegbreedte in meters
 *     sprong,      0 = recht, .5 = halfsteens, 1/3 = derde verband
 *     visgraat,    waar bij visgraat
 *     hongaars,    waar bij Hongaarse punt
 *     kleur,       grondkleur (#rrggbb)
 *     lk,          { korrel, ader, nerf, spikkel } — hoe de tegel getekend wordt
 *     af,          { v, glans } — afwerking
 *     tn,          { a, a2, s } — aderkleuren en spikkelpalet
 *     voegRGB }    [r,g,b]
 *
 * En een OPSTELLING zo:
 *   { vloer: MATERIAAL of null,
 *     wand:  MATERIAAL of null,
 *     accent: { wand: 'achter'|'links'|'rechts', mat: MATERIAAL } of null,
 *     inrichting: { ... } — welke producten er in de ruimte staan }
 */
(function () {
  'use strict';

  var klem = function (x, a, b) { return x < a ? a : x > b ? b : x; };

  /* ---------- kleurgereedschap ---------- */

  /* Neemt #rrggbb en rgb(r,g,b). Het tweede is nodig omdat een gezicht met een
     verschoven kleur wordt getekend en die verschuiving een rgb-tekst oplevert;
     zonder deze regel las helderheid() daar NaN en werd een antracieten tegel
     als een lichte behandeld. */
  function ontleed(kleur) {
    if (kleur.charAt(0) === '#') {
      var n = parseInt(kleur.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var m = kleur.match(/\d+/g) || ['0', '0', '0'];
    return [+m[0], +m[1], +m[2]];
  }
  function schaduw(hex, d) {
    var c = ontleed(hex);
    return 'rgb(' + klem(c[0] + d, 0, 255) + ',' + klem(c[1] + d, 0, 255) + ',' + klem(c[2] + d, 0, 255) + ')';
  }
  /* Verschuift een kleur in helderheid maar houdt de verhouding tussen de
     kanalen heel, zodat een warme tegel warm blijft. */
  function kleurVerschuif(hex, d) {
    var c = ontleed(hex), h = (c[0] + c[1] + c[2]) / 3 || 1;
    return 'rgb(' + klem(Math.round(c[0] + d * c[0] / h), 0, 255) + ',' +
                    klem(Math.round(c[1] + d * c[1] / h), 0, 255) + ',' +
                    klem(Math.round(c[2] + d * c[2] / h), 0, 255) + ')';
  }
  function helderheid(hex) {
    var c = ontleed(hex);
    return (c[0] * .299 + c[1] * .587 + c[2] * .114) / 255;
  }

  /* ---------- één tegelgezicht tekenen ----------
     De tegel krijgt korrel, aders of spikkels naar gelang de look, en een
     lichtval van linksboven. Zonder dat leest een egaal vlak als een
     kleurenkaart in plaats van als materiaal. Er worden meerdere gezichten
     gemaakt, zodat een vloer geen zichtbaar herhalend patroon krijgt — precies
     zoals een echte serie in vier of zes gezichten wordt geleverd. */

  function tegelVlak(ctx, x, y, w, h, kleur, lk, af, zaad, tn) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = kleur; ctx.fillRect(x, y, w, h);

    var r = function () { zaad = (zaad * 9301 + 49297) % 233280; return zaad / 233280; };
    var donker = helderheid(kleur) < .45;

    if (lk.nerf) {                       // houtnerf in de lengterichting
      for (var n = 0; n < 30; n++) {
        ctx.globalAlpha = .05 + r() * .09;
        ctx.strokeStyle = r() > .5 ? '#000' : '#fff';
        ctx.lineWidth = .6 + r() * 1.6;
        var yy = y + r() * h;
        ctx.beginPath(); ctx.moveTo(x, yy);
        ctx.bezierCurveTo(x + w * .3, yy + (r() - .5) * 6, x + w * .7, yy + (r() - .5) * 6, x + w, yy);
        ctx.stroke();
      }
      // een enkele kwast
      for (var q = 0; q < 3; q++) {
        ctx.globalAlpha = .10 + r() * .10;
        ctx.fillStyle = donker ? '#000' : '#6b5439';
        ctx.beginPath();
        ctx.ellipse(x + r() * w, y + r() * h, 2 + r() * 4, 6 + r() * 12, 0, 0, 6.3);
        ctx.fill();
      }
    }
    if (lk.ader && !lk.nerf) {           // marmeraders
      var hoofd = tn.a || (donker ? '#e8e6e0' : '#5b5348');
      var bij = tn.a2 || (donker ? '#8b8880' : '#b9b4ab');
      var aantal = Math.round(2 + lk.ader * 4);
      var lang = (w > h ? w : h) * 1.7;
      for (var a = 0; a < aantal; a++) {
        var groot = a < 2;
        // Elke ader krijgt een eigen richting. Laat je ze allemaal van boven
        // naar beneden lopen, dan leest het vlak als behang in plaats van steen.
        var ang = (r() - .5) * 2.4 + (r() > .5 ? 1.35 : -1.35);
        var px = x + r() * w - Math.cos(ang) * lang * .5;
        var py = y + r() * h - Math.sin(ang) * lang * .5;
        ctx.globalAlpha = ((groot ? .34 : .17) + r() * .16) * (.34 + lk.ader * .66);
        ctx.strokeStyle = groot ? hoofd : bij;
        ctx.lineWidth = ((groot ? 1.4 : .6) + r() * 2.6 * lk.ader);
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px, py);
        var stap = lang / 7, tak = [];
        for (var k = 0; k < 7; k++) {
          ang += (r() - .5) * .62;
          var qx = px + Math.cos(ang) * stap * .55, qy = py + Math.sin(ang) * stap * .55;
          px += Math.cos(ang) * stap; py += Math.sin(ang) * stap;
          ctx.quadraticCurveTo(qx, qy, px, py);
          if (groot && k > 0 && k < 6) tak.push([px, py, ang]);
        }
        ctx.stroke();
        // zijtakken: die maken het verschil tussen een lijn en een ader
        if (groot) {
          ctx.globalAlpha = .10 + r() * .10;
          ctx.lineWidth = .5 + r() * .8;
          for (var t = 0; t < tak.length; t++) {
            if (r() > .55) continue;
            var hx = tak[t][0], hy = tak[t][1], ha = tak[t][2] + (r() > .5 ? .9 : -.9);
            ctx.beginPath(); ctx.moveTo(hx, hy);
            for (var m = 0; m < 3; m++) {
              ha += (r() - .5) * .7;
              hx += Math.cos(ha) * stap * .38; hy += Math.sin(ha) * stap * .38;
              ctx.lineTo(hx, hy);
            }
            ctx.stroke();
          }
        }
      }
      ctx.lineCap = 'butt';
    }
    if (lk.spikkel) {                    // terrazzo
      var pal = tn.s || ['#8d8377', '#c4b7a3', '#5d5b57', '#e7e2d8', '#a58f74'];
      for (var s = 0; s < Math.round(w * h / 240); s++) {
        ctx.globalAlpha = .32 + r() * .45;
        ctx.fillStyle = pal[Math.floor(r() * pal.length)];
        var px = x + r() * w, py = y + r() * h, pr = 1 + r() * 3.6;
        ctx.beginPath(); ctx.ellipse(px, py, pr, pr * (.6 + r() * .7), r() * 3, 0, 6.3);
        ctx.fill();
      }
    }
    if (lk.korrel) {                     // fijne structuur
      for (var g = 0; g < Math.round(w * h / 90); g++) {
        ctx.globalAlpha = (.02 + r() * .05) * (lk.korrel / 10);
        ctx.fillStyle = r() > .5 ? '#000' : '#fff';
        ctx.fillRect(x + r() * w, y + r() * h, 1.4, 1.4);
      }
    }
    // Strijklicht van linksboven, sterker naarmate de tegel gladder is. De
    // uiteinden zijn een verschuiving van de tegelkleur zelf en niet wit en
    // zwart: absoluut wit tilt een antracieten tegel veel verder op dan een
    // witte, en dan is de sprong tussen twee tegelhoeken groter dan het
    // kleurverschil tussen twee gezichten. Een wand van kleine donkere tegels
    // las daardoor als een dambord in plaats van als tegelwerk.
    if (af.glans > .07) {
      var d = 3 + af.glans * 48;
      var gr = ctx.createLinearGradient(x, y, x + w, y + h);
      gr.addColorStop(0, kleurVerschuif(kleur, d));
      gr.addColorStop(.45, kleurVerschuif(kleur, 0));
      gr.addColorStop(1, kleurVerschuif(kleur, -d * .6));
      ctx.globalAlpha = .55; ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
    }
    if (af.v === 'struct') {             // antislip: fijne bobbels
      for (var b = 0; b < Math.round(w * h / 160); b++) {
        ctx.globalAlpha = .05 + r() * .07;
        ctx.fillStyle = r() > .5 ? '#fff' : '#000';
        ctx.beginPath(); ctx.arc(x + r() * w, y + r() * h, .8 + r() * 1.4, 0, 6.3); ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ---------- gezichten met mipmaps ----------
     Ver weg wordt een tegel kleiner dan een pixel. Zonder verkleinde versies
     gaat het voegraster dan flikkeren; met mipmaps blijft het rustig. */

  var GEZICHTEN = 10;
  var gzCache = {};

  function sleutelVan(M) {
    return [M.tw, M.th, M.kleur, M.af.v, M.lk.korrel, M.lk.ader, M.lk.nerf, M.lk.spikkel,
            M.tn.a, M.tn.a2, (M.tn.s || []).join(','), M.variatie || 1].join('|');
  }

  /* Gezichten worden per materiaal bewaard, want wand en vloer kunnen
     verschillende tegels hebben en die mogen elkaars textuur niet overschrijven. */
  function gezichten(M) {
    var sleutel = sleutelVan(M);
    if (gzCache[sleutel]) return gzCache[sleutel];

    var lang = 384;
    var w = M.tw >= M.th ? lang : Math.round(lang * M.tw / M.th);
    var h = M.tw >= M.th ? Math.round(lang * M.th / M.tw) : lang;

    var lijst = [];
    for (var i = 0; i < GEZICHTEN; i++) {
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      // Elk gezicht een fractie anders van toon. Een echte serie wordt in vier
      // of zes gezichten geleverd en juist dat verschil maakt dat een vloer
      // niet als behang leest. Vlekken in de tegel zelf tekenen werkt niet:
      // die herhalen zich dan zichtbaar over het hele vlak.
      var schuif = [0, -3, 2, -1, 4, -4, 1, -2, 3, -2][i % 10] * (M.variatie || 1);
      tegelVlak(ctx, 0, 0, w, h, kleurVerschuif(M.kleur, schuif), M.lk, M.af, 7919 * (i + 1) + 13, M.tn);
      var niveaus = [], bron = c, bw = w, bh = h;
      niveaus.push(vlakData(bron, bw, bh));
      while (bw > 4 && bh > 4 && niveaus.length < 7) {
        var nw = Math.max(1, bw >> 1), nh = Math.max(1, bh >> 1);
        var k = document.createElement('canvas'); k.width = nw; k.height = nh;
        var kc = k.getContext('2d');
        kc.imageSmoothingEnabled = true;
        kc.drawImage(bron, 0, 0, nw, nh);
        niveaus.push(vlakData(k, nw, nh));
        bron = k; bw = nw; bh = nh;
      }
      lijst.push(niveaus);
    }
    // Zes materialen in beeld is al veel; daarboven groeit het geheugen zonder
    // dat iemand het verschil ziet, dus dan beginnen we opnieuw.
    if (Object.keys(gzCache).length > 6) gzCache = {};
    gzCache[sleutel] = { lijst: lijst, w: w, h: h };
    return gzCache[sleutel];
  }

  function vlakData(canvas, w, h) {
    var d = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    return { w: w, h: h, d: d };
  }

  /* ---------- het patroon, uitgerekend in plaats van getekend ----------
     Voor elk punt op een vlak (in meters) leveren we: zit het in de voeg, en zo
     nee, welk gezicht en waar op dat gezicht. Daarmee kan het beeld op elke
     schaal scherp blijven — er is geen bitmap van de hele vloer nodig. */

  /* rand = afstand tot de dichtstbijzijnde voeg in meters. Positief binnen de
     tegel, negatief in de voeg. Daarmee kan het beeld de voeg netjes uitvlakken:
     3 mm is op vier meter afstand dunner dan één beeldpunt, en zonder die
     afstand zou het voegraster daar gewoon verdwijnen. */
  var pat = { fx: 0, fy: 0, g: 0, rand: 0 };

  /* Welk gezicht ligt er op tegel (i,j). Met i*7+j*13 vielen de gezichten in
     een schuine streep en las de vloer als een dambord; dit hutselt ze echt. */
  function gezichtVan(i, j) {
    var h = (i * 73856093) ^ (j * 19349663);
    h = (h ^ (h >>> 13)) >>> 0;
    return h % GEZICHTEN;
  }

  function patroon(u, v, P) {
    var tw = P.tw, th = P.th, g = P.g, pw = tw + g, ph = th + g;
    if (P.visgraat) {
      // 45 graden gedraaid; de eenheid is de korte zijde van de tegel
      var ru = (u + v) * .70710678, rv = (v - u) * .70710678;
      var W = ph, x = ru / W, y = rv / W;
      var J = Math.floor(y), Pp = x + J;
      var r = Pp - 4 * Math.floor(Pp / 4);
      var lu, lv, bw, bh, x0, y0, staand;
      if (r < 2)      { lu = r;     lv = y - J;     bw = 2; bh = 1; x0 = x - r;       y0 = J;     staand = 0; }
      else if (r < 3) { lu = r - 2; lv = y - J;     bw = 1; bh = 2; x0 = x - (r - 2); y0 = J;     staand = 1; }
      else            { lu = r - 3; lv = y - J + 1; bw = 1; bh = 2; x0 = x - (r - 3); y0 = J - 1; staand = 1; }
      var gg = g / W, hg = gg * .5;
      var du = Math.min(lu - hg, bw - hg - lu), dv = Math.min(lv - hg, bh - hg - lv);
      pat.rand = Math.min(du, dv) * W;
      var nu = klem((lu - hg) / (bw - gg), 0, 1), nv = klem((lv - hg) / (bh - gg), 0, 1);
      if (staand) { pat.fx = nv; pat.fy = nu; } else { pat.fx = nu; pat.fy = nv; }
      pat.g = gezichtVan(Math.floor(x0) + staand * 91, Math.floor(y0));
      return pat;
    }
    if (P.hongaars) {
      // Hongaarse punt: kolommen van schuin afgezaagde tegels die om en om de
      // andere kant op hellen, zodat de naden één doorlopende punt vormen.
      // Dat is iets anders dan visgraat, waar hele tegels haaks op elkaar
      // liggen — het verschil zie je meteen en het kost ook anders.
      var kol = Math.floor(u / pw), lu2 = u - kol * pw;
      var richting = (kol & 1) ? -1 : 1;
      var vs = v + richting * lu2;
      var rij = Math.floor(vs / ph), lv2 = vs - rij * ph;
      // de schuine naad loopt onder 45 graden, dus daar meten we schuin
      pat.rand = Math.min(Math.min(lu2 - g, pw - lu2),
                          Math.min(lv2 - g, ph - lv2) * .7071);
      pat.fx = klem((lu2 - g) / tw, 0, 1); pat.fy = klem((lv2 - g) / th, 0, 1);
      if (richting < 0) pat.fy = 1 - pat.fy;
      pat.g = gezichtVan(kol, rij);
      return pat;
    }
    var j = Math.floor(v / ph), vv = v - j * ph;
    var sp = P.sprong ? (j * P.sprong) : 0;
    sp = (sp - Math.floor(sp)) * pw;
    var uu = u - sp, i = Math.floor(uu / pw); uu -= i * pw;
    pat.rand = Math.min(Math.min(uu - g, pw - uu), Math.min(vv - g, ph - vv));
    pat.fx = klem((uu - g) / tw, 0, 1); pat.fy = klem((vv - g) / th, 0, 1);
    pat.g = gezichtVan(i, j);
    // om de zoveel tegel een halve slag: breekt de herhaling verder
    if ((gezichtVan(i + 311, j + 977) & 3) === 0) { pat.fx = 1 - pat.fx; pat.fy = 1 - pat.fy; }
    return pat;
  }

  /* ---------- meetkunde ---------- */

  function inv3(m) {
    var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5], g = m[6], h = m[7], i = m[8];
    var A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    var det = a * A + b * B + c * C;
    if (!det) return null;
    var q = 1 / det;
    return [A * q, (c * h - b * i) * q, (b * f - c * e) * q,
            B * q, (a * i - c * g) * q, (c * d - a * f) * q,
            C * q, (b * g - a * h) * q, (a * e - b * d) * q];
  }

  /* Een camera: brandpunt in pixels, beeldmidden, positie en neerwaartse hoek. */
  function Camera(f, cx, cy, pos, pitch, draai) {
    this.f = f; this.cx = cx; this.cy = cy; this.pos = pos || [0, 0, 0];
    var p = pitch || 0, q = draai || 0;
    this.cp = Math.cos(p); this.sp = Math.sin(p);
    this.cq = Math.cos(q); this.sq = Math.sin(q);
    this.draai = q;
  }
  Camera.prototype.naarCam = function (P, richting) {
    var x = P[0] - (richting ? 0 : this.pos[0]);
    var y = P[1] - (richting ? 0 : this.pos[1]);
    var z = P[2] - (richting ? 0 : this.pos[2]);
    // eerst om de staande as draaien, dan kantelen
    var rx = x * this.cq + z * this.sq;
    var rz = -x * this.sq + z * this.cq;
    // kijkrichting (0,-sin p, cos p), omhoog (0, cos p, sin p)
    return [rx, -(y * this.cp + rz * this.sp), -y * this.sp + rz * this.cp];
  };
  Camera.prototype.punt = function (P) {
    var c = this.naarCam(P, 0);
    if (c[2] <= .02) return null;
    return [this.cx + this.f * c[0] / c[2], this.cy + this.f * c[1] / c[2]];
  };
  /* Matrix die (u,v,1) op een vlak afbeeldt op het homogene beeldpunt.
     Q = oorsprong, A en B = de twee richtingen (in meters). */
  Camera.prototype.vlak = function (Q, A, B) {
    var q = this.naarCam(Q, 0), a = this.naarCam(A, 1), b = this.naarCam(B, 1);
    var f = this.f, cx = this.cx, cy = this.cy;
    var kol = function (v) { return [f * v[0] + cx * v[2], f * v[1] + cy * v[2], v[2]]; };
    var ka = kol(a), kb = kol(b), kq = kol(q);
    return [ka[0], kb[0], kq[0], ka[1], kb[1], kq[1], ka[2], kb[2], kq[2]];
  };

  /* De woonkamerfoto: geen opgestelde camera maar een uitgemeten camera.
     De vloer ligt al in camera-assen, dus positie en hoek zijn nul. */
  var FOTO = {
    f: 702.92, cx: 800, cy: 450,
    d1: [-0.330295, -0.347028, 0.877768],   // richting van de kamer in
    d2: [0.943878, -0.121437, 0.307161],    // richting naar rechts
    O:  [0, 0.753441, 1.179523]             // vloerpunt onderaan het beeld
  };

  var fotoKol = function (v) {
    return [FOTO.f * v[0] + FOTO.cx * v[2], FOTO.f * v[1] + FOTO.cy * v[2], v[2]];
  };

  function fotoVlak() {
    var ka = fotoKol(FOTO.d1), kb = fotoKol(FOTO.d2), kq = fotoKol(FOTO.O);
    return [ka[0], kb[0], kq[0], ka[1], kb[1], kq[1], ka[2], kb[2], kq[2]];
  }

  /* Omhoog is de normaal op de vloer. d1 en d2 staan loodrecht op elkaar, dus
     hun kruisproduct is meteen een eenheidsvector; de beeld-y wijst omlaag, dus
     de tak met negatieve y is de goede. */
  var FOTO_OP = (function () {
    var a = FOTO.d1, b = FOTO.d2;
    var n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    var L = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
    n = [n[0] / L, n[1] / L, n[2] / L];
    return n[1] > 0 ? [-n[0], -n[1], -n[2]] : n;
  })();

  /* Van een beeldpunt op de vloer terug naar het punt in de ruimte. */
  function fotoVloerpunt(Minv, x, y) {
    if (!Minv) return null;
    var u = Minv[0] * x + Minv[1] * y + Minv[2];
    var v = Minv[3] * x + Minv[4] * y + Minv[5];
    var w = Minv[6] * x + Minv[7] * y + Minv[8];
    if (!w) return null;
    u /= w; v /= w;
    var O = FOTO.O, d1 = FOTO.d1, d2 = FOTO.d2;
    return [O[0] + u * d1[0] + v * d2[0],
            O[1] + u * d1[1] + v * d2[1],
            O[2] + u * d1[2] + v * d2[2]];
  }

  function fotoPunt(P) {
    if (!P || P[2] <= .02) return null;
    return [FOTO.cx + FOTO.f * P[0] / P[2], FOTO.cy + FOTO.f * P[1] / P[2]];
  }

  /* Het staande vlak door twee vloerpunten. A wordt op lengte één gebracht,
     anders loopt u van nul tot één over de hele wand en wordt het tegelpatroon
     uitgerekt in plaats van herhaald. */
  function fotoWandVlak(P1, P2) {
    var a = [P2[0] - P1[0], P2[1] - P1[1], P2[2] - P1[2]];
    var L = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1;
    a = [a[0] / L, a[1] / L, a[2] / L];
    var ka = fotoKol(a), kb = fotoKol(FOTO_OP), kq = fotoKol(P1);
    return [ka[0], kb[0], kq[0], ka[1], kb[1], kq[1], ka[2], kb[2], kq[2]];
  }

  /* ---------- vlakken vullen ---------- */

  /* Rijen van een veelhoek: per beeldregel de x-paren waar hij dekt. */
  function spans(poly, y) {
    var kruis = [], n = poly.length;
    for (var i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        kruis.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
    }
    kruis.sort(function (p, q) { return p - q; });
    return kruis;
  }

  /* Vult de veelhoek met het tegelpatroon dat via Minv op het vlak wordt
     teruggerekend. licht(x,y) mag een factor teruggeven; dat is hoe het licht
     van de foto of van de getekende kamer over de tegels heen komt. */
  function vulVlak(img, W, H, Mx, poly, P, licht, opt) {
    var Mi = inv3(Mx); if (!Mi) return;
    var g = gezichten(P), voegRGB = P.voegRGB;
    var data = img.data;
    var maxN = g.lijst[0].length - 1;
    var texW = g.w, texH = g.h;
    // hoeveel meter is één tegelbreedte per gezichtspixel
    var texel = P.tw / texW;
    var yl = H, yh = 0;
    for (var i = 0; i < poly.length; i++) { if (poly[i][1] < yl) yl = poly[i][1]; if (poly[i][1] > yh) yh = poly[i][1]; }
    yl = Math.max(0, Math.floor(yl)); yh = Math.min(H - 1, Math.ceil(yh));
    var dekking = opt && opt.dekking != null ? opt.dekking : 1;
    var vastLicht = typeof licht === 'number' ? licht : 1;
    var lichtFn = typeof licht === 'function' ? licht : null;

    for (var y = yl; y <= yh; y++) {
      var k = spans(poly, y + .5);
      for (var s = 0; s + 1 < k.length; s += 2) {
        var x0 = Math.max(0, Math.ceil(k[s])), x1 = Math.min(W - 1, Math.floor(k[s + 1]));
        if (x1 < x0) continue;
        var px = x0 + .5, py = y + .5;
        var a = Mi[0] * px + Mi[1] * py + Mi[2];
        var b = Mi[3] * px + Mi[4] * py + Mi[5];
        var w = Mi[6] * px + Mi[7] * py + Mi[8];
        var da = Mi[0], db = Mi[3], dw = Mi[6];
        var ea = Mi[1], eb = Mi[4], ew = Mi[7];      // stap van één beeldregel
        var voet = 1e-7, n = 0, teller = 0;
        for (var x = x0; x <= x1; x++) {
          if (w > 1e-9 || w < -1e-9) {
            var iw = 1 / w, u = a * iw, v = b * iw;
            // hoe groot is één beeldpunt op het vlak? Zowel naar rechts als
            // naar beneden, want een vloer wordt vooral in de diepte platgedrukt
            // De grootte van een beeldpunt op het vlak verandert langzaam, dus
            // die hoeft niet voor elk punt opnieuw: dat scheelt twee delingen
            // en een logaritme per punt.
            if ((teller-- ) <= 0) {
              teller = 3;
              var vx = 0, vy = 0, w2 = w + dw, w3 = w + ew;
              if (w2 > 1e-9 || w2 < -1e-9) {
                var iw2 = 1 / w2;
                vx = Math.max(Math.abs((a + da) * iw2 - u), Math.abs((b + db) * iw2 - v));
              }
              if (w3 > 1e-9 || w3 < -1e-9) {
                var iw3 = 1 / w3;
                vy = Math.max(Math.abs((a + ea) * iw3 - u), Math.abs((b + eb) * iw3 - v));
              }
              // meetkundig gemiddelde: een vloer die je scheef ziet is in de ene
              // richting veel sterker samengedrukt dan in de andere, en het
              // maximum nemen maakt hem dan onnodig wazig
              if (vx < 1e-7) vx = 1e-7; if (vy < 1e-7) vy = 1e-7;
              voet = Math.sqrt(vx * vy);
              var scherp = vx < vy ? vx : vy;
              if (voet < scherp) voet = scherp;
              n = 0;
              if (voet > texel) { n = Math.round(Math.log(voet / texel) / Math.LN2); if (n < 0) n = 0; if (n > maxN) n = maxN; }
            }
            var p = patroon(u, v, P);
            var o = (y * W + x) << 2;
            var R, G, B;
            var lvl = g.lijst[p.g][n];
            var tx = p.fx * lvl.w; if (tx < 0) tx = 0; if (tx > lvl.w - 1) tx = lvl.w - 1;
            var ty = p.fy * lvl.h; if (ty < 0) ty = 0; if (ty > lvl.h - 1) ty = lvl.h - 1;
            var ti = ((ty | 0) * lvl.w + (tx | 0)) << 2;
            R = lvl.d[ti]; G = lvl.d[ti + 1]; B = lvl.d[ti + 2];
            // de tegel loopt naar de rand toe iets donkerder weg: dat is de
            // afronding van de kant, en zonder dat plakken de tegels aan elkaar
            if (p.rand < .008) {
              var kant = 1 - .10 * (1 - klem(p.rand / .008, 0, 1));
              R *= kant; G *= kant; B *= kant;
            }
            // voeg met uitvlakking: op afstand wordt hij dunner dan een beeldpunt
            // en dan hoort hij te vervagen, niet te verdwijnen
            var mix = klem(.5 - p.rand / voet, 0, 1);
            if (mix > 0) {
              R += (voegRGB[0] - R) * mix; G += (voegRGB[1] - G) * mix; B += (voegRGB[2] - B) * mix;
            }
            if (vastLicht !== 1) { R *= vastLicht; G *= vastLicht; B *= vastLicht; }
            else if (lichtFn) {
              var L = lichtFn(x, y);
              if (L > 1) {
                // Oplichten naar wit toe in plaats van vermenigvuldigen. Een
                // witte tegel in de zon liep anders meteen tegen 255 aan en
                // werd één plat wit vlak zonder voegen.
                var k = (L - 1) * .55;
                R += (255 - R) * k; G += (255 - G) * k; B += (255 - B) * k;
              } else { R *= L; G *= L; B *= L; }
            }
            if (dekking >= 1) {
              data[o] = R > 255 ? 255 : R < 0 ? 0 : R;
              data[o + 1] = G > 255 ? 255 : G < 0 ? 0 : G;
              data[o + 2] = B > 255 ? 255 : B < 0 ? 0 : B;
              data[o + 3] = 255;
            } else {
              data[o] += (klem(R, 0, 255) - data[o]) * dekking;
              data[o + 1] += (klem(G, 0, 255) - data[o + 1]) * dekking;
              data[o + 2] += (klem(B, 0, 255) - data[o + 2]) * dekking;
              data[o + 3] = 255;
            }
          }
          a += da; b += db; w += dw;
        }
      }
    }
  }

  /* ---------- de vier weergaven ---------- */

  // 1280×720 in plaats van 1600×900: het beeld staat in de opmaak ongeveer 700
  // punten breed, dus dit blijft ruim scherp op een hoge-resolutiescherm en
  // scheelt bijna de helft van het rekenwerk bij elke klik.
  var canvasBreed = 1280, canvasHoog = 720;

  function ctx2d(c) {
    if (!c) return null;
    if (c.width !== canvasBreed || c.height !== canvasHoog) { c.width = canvasBreed; c.height = canvasHoog; }
    return c.getContext('2d');
  }

  /* 1. Het platte tegelvlak — recht van voren, zonder ruimte eromheen. */
  function tekenVlak(canvas, op) {
    var ctx = ctx2d(canvas); if (!ctx) return;
    var W = canvasBreed, H = canvasHoog;
    var img = ctx.createImageData(W, H);
    // M beeldt (u,v,1) op het beeldpunt af, dus de schaal is beeldpunten per
    // meter — niet andersom. Beeldbreedte 4,4 meter.
    var sx = W / 4.4;

    if (op.wand && op.vloer) {
      var grens = Math.round(H * .5);
      vulVlak(img, W, H, [sx, 0, 0, 0, sx, 0, 0, 0, 1],
              [[0, 0], [W, 0], [W, grens], [0, grens]], op.wand, null);
      // vloer: iets kleiner in beeld, alsof je er verder vanaf staat
      var sv = sx / 1.2;
      vulVlak(img, W, H, [sv, 0, -W * .07, 0, sv, 0, 0, 0, 1],
              [[0, grens], [W, grens], [W, H], [0, H]], op.vloer, null);
      ctx.putImageData(img, 0, 0);
      var gr = ctx.createLinearGradient(0, grens - 30, 0, grens + 34);
      gr.addColorStop(0, 'rgba(0,0,0,.38)');
      gr.addColorStop(.47, 'rgba(0,0,0,.12)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, grens - 30, W, 64);
      ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(0, grens, W, 1.5);
    } else {
      vulVlak(img, W, H, [sx, 0, 0, 0, sx, 0, 0, 0, 1],
              [[0, 0], [W, 0], [W, H], [0, H]], op.wand || op.vloer, null);
      ctx.putImageData(img, 0, 0);
    }
    randlicht(ctx, W, H);
  }

  /* Eén klein vierkant met de tegel erop, voor de keuzelijst. Hetzelfde
     materiaal als in het grote beeld, dus het staal liegt niet. */
  function tekenSwatch(canvas, M, zijde) {
    var z = zijde || 200;
    canvas.width = z; canvas.height = z;
    var ctx = canvas.getContext('2d');
    var img = ctx.createImageData(z, z);
    // anderhalve tegel in beeld: genoeg om de voeg te zien zonder een raster te worden
    var sx = z / (M.tw * 1.6);
    vulVlak(img, z, z, [sx, 0, -sx * M.tw * .18, 0, sx, 0, 0, 0, 1],
            [[0, 0], [z, 0], [z, z], [0, z]], M, null);
    ctx.putImageData(img, 0, 0);
    var gr = ctx.createLinearGradient(0, 0, z, z);
    gr.addColorStop(0, 'rgba(255,255,255,.10)');
    gr.addColorStop(1, 'rgba(0,0,0,.14)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, z, z);
  }

  /* Een recht vlak van bm bij hm meter, voor de 3D-weergave. De schaal wordt
     begrensd: een wand van 4 meter bij 400 beeldpunten per meter zou een
     textuur van 1600 breed opleveren en dat kost meer dan het oplevert. */
  function tekenTextuur(canvas, M, bm, hm, pxm) {
    var px = pxm || 260;
    var W = Math.max(8, Math.min(1400, Math.round(bm * px)));
    var H = Math.max(8, Math.min(1400, Math.round(hm * px)));
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var img = ctx.createImageData(W, H);
    // (u,v) in meters naar beeldpunt. v telt naar beneden, net als het canvas,
    // dus de tegels beginnen linksboven — waar een tegelzetter ook begint.
    vulVlak(img, W, H, [W / bm, 0, 0, 0, H / hm, 0, 0, 0, 1],
            [[0, 0], [W, 0], [W, H], [0, H]], M, null);
    ctx.putImageData(img, 0, 0);
    return { w: W, h: H };
  }

  /* 2. De woonkamerfoto — de bestaande vloer wordt vervangen, het licht blijft. */
  var foto = null, fotoKlaar = false, lichtVeld = null;

  var fotoWachters = [];

  function laadFoto(klaar) {
    if (klaar) fotoWachters.push(klaar);
    if (fotoKlaar) { fotoWachters.splice(0).forEach(function (f) { f(); }); return; }
    if (foto) return;
    foto = new Image();
    foto.onload = function () {
      fotoKlaar = true;
      fotoWachters.splice(0).forEach(function (f) { f(); });
    };
    foto.onerror = function () { foto = null; };
    foto.src = './assets/media/pvc-kamer-beton.jpg';
  }

  var VLOERHOEK = [[0, 900], [0, 694], [397, 312], [891, 287], [1599, 501], [1599, 900]];

  /* Het lichtveld: de foto zwaar vervaagd, zodat de zonvlekken en de schaduw
     langs de wand overblijven maar de oude voegen verdwijnen. */
  function maakLicht() {
    var k = 10;
    var kl = document.createElement('canvas'); kl.width = Math.ceil(1600 / k); kl.height = Math.ceil(900 / k);
    var kc = kl.getContext('2d');
    kc.imageSmoothingEnabled = true;
    kc.drawImage(foto, 0, 0, kl.width, kl.height);
    var d = kc.getImageData(0, 0, kl.width, kl.height).data;
    var n = kl.width * kl.height, L = new Float32Array(n), som = 0, tel = 0;
    for (var i = 0; i < n; i++) {
      L[i] = (d[i << 2] * .299 + d[(i << 2) + 1] * .587 + d[(i << 2) + 2] * .114);
    }
    // referentie: het gemiddelde over de vloer zelf
    for (var y = 420; y < 890; y += 6) for (var x = 40; x < 1560; x += 6) {
      var idx = ((y / k) | 0) * kl.width + ((x / k) | 0);
      som += L[idx]; tel++;
    }
    var ref = tel ? som / tel : 128;
    lichtVeld = { w: kl.width, h: kl.height, k: k, L: L, ref: ref || 128 };
  }

  function lichtFoto(x, y) {
    var lv = lichtVeld; if (!lv) return 1;
    var fx = x / lv.k, fy = y / lv.k;
    var ix = fx | 0, iy = fy | 0;
    if (ix < 0) ix = 0; if (iy < 0) iy = 0;
    if (ix > lv.w - 2) ix = lv.w - 2; if (iy > lv.h - 2) iy = lv.h - 2;
    var ax = fx - ix, ay = fy - iy, r = lv.w;
    var v = lv.L[iy * r + ix] * (1 - ax) * (1 - ay) + lv.L[iy * r + ix + 1] * ax * (1 - ay) +
            lv.L[(iy + 1) * r + ix] * (1 - ax) * ay + lv.L[(iy + 1) * r + ix + 1] * ax * ay;
    var f = 1 + .80 * (v / lv.ref - 1);
    return f < .52 ? .52 : f > 1.42 ? 1.42 : f;
  }

  function tekenWoonkamer(canvas, op) {
    var ctx = ctx2d(canvas); if (!ctx) return;
    var W = canvasBreed, H = canvasHoog;
    if (!fotoKlaar) {
      ctx.fillStyle = '#14141a'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = '28px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText('Foto wordt geladen…', W / 2, H / 2);
      ctx.textAlign = 'left';
      return;
    }
    ctx.drawImage(foto, 0, 0, W, H);
    if (!lichtVeld) maakLicht();
    var img = ctx.getImageData(0, 0, W, H);
    var M = fotoVlak();
    // de foto is uitgemeten op 1600×900; bij een ander canvas schalen we mee
    var sc = W / 1600;
    if (sc !== 1) { M = [M[0], M[1], M[2], M[3], M[4], M[5], M[6] / sc, M[7] / sc, M[8] / sc]; }
    var poly = VLOERHOEK.map(function (p) { return [p[0] * sc, p[1] * (H / 900)]; });
    vulVlak(img, W, H, M, poly, op.vloer || op.wand, lichtFoto);
    ctx.putImageData(img, 0, 0);
    if (op.plint) fotoPlint(ctx, W, H, sc, op.plint, op.plintHoogte);
    // een zachte plint-schaduw langs de wanden, anders plakt de vloer tegen de muur
    kimSchaduw(ctx, [[0, 692 * (H / 900)], [397 * sc, 307 * (H / 900)]], 16);
    kimSchaduw(ctx, [[397 * sc, 307 * (H / 900)], [891 * sc, 281 * (H / 900)]], 12);
    kimSchaduw(ctx, [[891 * sc, 281 * (H / 900)], [1599 * sc, 498 * (H / 900)]], 16);
  }

  /* Waar vloer en wand elkaar raken, uitgemeten op de foto van 1600×900. De
     achterwand is opgeknipt: over een raamopening hoort geen plint te lopen, en
     die twee kozijnen komen in deze kamer tot op de vloer. */
  var FOTOKIM = [
    [[0, 693], [397, 310]],       // linkerwand
    [[397, 310], [455, 307]],     // achterwand tot het eerste kozijn
    [[598, 299], [688, 295]],     // de penant tussen de twee kozijnen
    [[808, 288], [891, 284]],     // van het tweede kozijn tot de hoek
    [[891, 284], [1599, 500]]     // rechterwand
  ];

  /* ---- tegelplint ----
     Een tegelplint is een gezaagde strook van dezelfde tegel, dus hij draagt
     hetzelfde patroon en dezelfde kleur als de vloer. Hij wordt als echt staand
     vlak opgezet en niet als een balkje over de foto geplakt: alleen zo klopt de
     hoogte ook achterin de kamer, waar hij smaller in beeld komt.

     Het tegelwerk gaat op een eigen laag en wordt daarna door een uitgeknipt pad
     op zijn plaats gezet. Rechtstreeks in de beeldpunten vullen kan ook, maar
     dan wordt de bovenrand getrapt — en juist die rand is een lange, bijna
     horizontale lijn waar je elke trede ziet. */
  function fotoPlint(ctx, W, H, sc, M, hoogte) {
    var Minv = inv3(fotoVlak());
    if (!Minv) return;
    var h = hoogte || .08;
    var scy = H / 900;
    var laag = document.createElement('canvas');
    laag.width = W; laag.height = H;
    var lctx = laag.getContext('2d');
    if (!lctx) return;
    var img = lctx.createImageData(W, H);
    var vormen = [];

    FOTOKIM.forEach(function (seg) {
      var P1 = fotoVloerpunt(Minv, seg[0][0], seg[0][1]);
      var P2 = fotoVloerpunt(Minv, seg[1][0], seg[1][1]);
      if (!P1 || !P2) return;
      var b1 = [P1[0] + FOTO_OP[0] * h, P1[1] + FOTO_OP[1] * h, P1[2] + FOTO_OP[2] * h];
      var b2 = [P2[0] + FOTO_OP[0] * h, P2[1] + FOTO_OP[1] * h, P2[2] + FOTO_OP[2] * h];
      var hoek = [fotoPunt(P1), fotoPunt(P2), fotoPunt(b2), fotoPunt(b1)];
      for (var i = 0; i < 4; i++) if (!hoek[i]) return;
      var poly = hoek.map(function (p) { return [p[0] * sc, p[1] * scy]; });
      var Mw = fotoWandVlak(P1, P2);
      if (sc !== 1) {
        Mw = [Mw[0], Mw[1], Mw[2], Mw[3], Mw[4], Mw[5], Mw[6] / sc, Mw[7] / sc, Mw[8] / sc];
      }
      // een plint staat in de schaduw aan de voet van de wand, dus iets donkerder
      // dan de vloer ernaast; anders licht hij op als een strip
      vulVlak(img, W, H, Mw, poly, M, function (x, y) { return lichtFoto(x, y) * .86; });
      vormen.push(poly);
    });
    if (!vormen.length) return;

    lctx.putImageData(img, 0, 0);
    ctx.save();
    ctx.beginPath();
    vormen.forEach(function (v) {
      ctx.moveTo(v[0][0], v[0][1]);
      for (var i = 1; i < v.length; i++) ctx.lineTo(v[i][0], v[i][1]);
      ctx.closePath();
    });
    ctx.clip();
    ctx.drawImage(laag, 0, 0);
    ctx.restore();
  }

  function kimSchaduw(ctx, lijn, dikte) {
    var a = lijn[0], b = lijn[1];
    var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;           // loodrecht, naar de vloer toe
    if (ny < 0) { nx = -nx; ny = -ny; }
    ctx.save();
    var gr = ctx.createLinearGradient(a[0], a[1], a[0] + nx * dikte, a[1] + ny * dikte);
    gr.addColorStop(0, 'rgba(0,0,0,.34)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
    ctx.lineTo(b[0] + nx * dikte, b[1] + ny * dikte);
    ctx.lineTo(a[0] + nx * dikte, a[1] + ny * dikte);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* 3 en 4. Getekende ruimtes: badkamer en toilet. */

  /* De cameraopstelling is uitgerekend en niet op gevoel gezet: brandpunt en
     beeldmidden zijn zo gekozen dat de achterwand van de vloer tot 2,70 m
     precies het bovenste deel van het beeld vult en de vloer de onderste helft.
     Zonder die rekensom kijk je of tegen een muur aan of alleen naar de vloer. */
  var BAD = {
    v: 'badkamer', B: 3.9, D: 4.6, Hg: 2.7,
    pitch: 16 * Math.PI / 180, raam: 1
  };
  var WC = {
    v: 'wc', B: 1.60, D: 2.60, Hg: 2.60,
    pitch: 13 * Math.PI / 180, raam: null
  };

  /* De camera rekent zichzelf uit op de maat van de ruimte.
     Een badkamer van 1,6 bij 2,2 en een van 3,5 bij 4,5 met dezelfde lens
     leveren twee onbruikbare beelden op: de ene zit tegen de achterwand aan,
     de andere kijkt in een gymzaal. Daarom worden brandpunt en beeldmidden
     hier bepaald door twee eisen — de achterwand mag niet breder worden dan
     tweederde van het beeld, en de wand tot 2,15 m niet hoger dan
     tweeënzestig procent. De strengste van de twee wint; bij een smalle
     ruimte is dat de breedte, bij een brede de hoogte. */
  /* De camera draait om de ruimte heen. Bij draai 0 staat hij vooraan in het
     midden en kijkt hij naar de achterwand — dat is het beeld dat er altijd al
     was. Bij elke andere hoek schuift hij over een cirkel om het midden van de
     ruimte, en blijft hij naar dat midden kijken.

     Het brandpunt wordt niet meer uit B en D afgeleid maar uit de acht hoeken
     van de ruimte zelf: die worden geprojecteerd en het brandpunt wordt zo
     groot gekozen dat ze allemaal net in beeld vallen. Met een vaste formule op
     B en D klopt de uitsnede alleen recht van voren; zodra je draait, kijk je
     tegen een muur aan of staat de kamer half buiten beeld. */
  function stelCamera(K, draai) {
    var Hg = K.Hg, B = K.B, D = K.D;
    var q = draai || 0;
    var ch = 1.55;                                  // ooghoogte van de camera
    var p = K.pitch;
    var hw = Math.min(Hg, 2.15);                    // tot hier is de wand in beeld

    /* De kijkrichting die bij draai q hoort is (-sin q, 0, cos q) — dat volgt
       uit de draaiing in naarCam. De camera moet dus aan de andere kant van het
       midden staan, anders staat hij links en kijkt hij naar rechts. */
    var mid = [B / 2, ch, D / 2];
    var achteruit = [Math.sin(q), 0, -Math.cos(q)];

    /* Niet op een cirkel om de ruimte heen, maar net dóór de wand achter je.
       Bij het rechte beeld stond de camera al een halve meter voor de voorwand;
       op een grote cirkel eromheen kijk je van buitenaf naar een poppenhuis in
       plaats van vanuit de ruimte zelf. Dus: zoek waar de kijklijn de ruimte
       verlaat en zet de camera daar net achter. */
    var marge = Math.max(.5, Math.min(B, D) * .18);
    var tUit = Infinity;
    if (Math.abs(achteruit[0]) > 1e-6) {
      var tx = (achteruit[0] > 0 ? B - mid[0] : -mid[0]) / achteruit[0];
      if (tx > 0) tUit = Math.min(tUit, tx);
    }
    if (Math.abs(achteruit[2]) > 1e-6) {
      var tz = (achteruit[2] > 0 ? D - mid[2] : -mid[2]) / achteruit[2];
      if (tz > 0) tUit = Math.min(tUit, tz);
    }
    if (!isFinite(tUit)) tUit = Math.max(B, D) / 2;
    var t = tUit + marge;
    var pos = [mid[0] + t * achteruit[0], ch, mid[2] + t * achteruit[2]];

    /* Het brandpunt uit de hoekpunten afleiden werkt niet zodra de camera vlak
       bij een hoek staat: dat hoekpunt ligt dan bijna in het beeldvlak, zijn
       projectie loopt naar oneindig en het brandpunt klapt in. Daarom een vaste
       beeldhoek, zoals een fotograaf ook een vaste lens opzet — 78 graden, de
       groothoek waarmee interieurs worden geschoten. Wat er aan de zijkanten
       afvalt, valt bij een echte foto ook af. */
    var fov = 78 * Math.PI / 180;
    var f = (canvasBreed / 2) / Math.tan(fov / 2);

    /* Richten: het midden van de vloer komt op zestig procent hoogte. Dat is de
       uitsnede die er al was — vloer in de onderste helft, wand daarboven — en
       hij blijft kloppen bij elke draaiing. */
    var doel = new Camera(f, 0, 0, pos, p, q).naarCam([B / 2, 0, D / 2], 0);
    if (!doel || doel[2] <= .05) return new Camera(f, canvasBreed / 2, canvasHoog * .5, pos, p, q);
    var cx = canvasBreed / 2 - f * doel[0] / doel[2];
    var cy = canvasHoog * .60 - f * doel[1] / doel[2];
    return new Camera(f, cx, cy, pos, p, q);
  }

  function tekenKamer(canvas, K, op) {
    var ctx = ctx2d(canvas); if (!ctx) return;
    var W = canvasBreed, H = canvasHoog;
    // de maat van de ruimte komt van de bezoeker, niet uit een vaste opstelling
    if (op.maat) {
      K = { v: K.v, raam: K.raam, pitch: K.pitch,
            B: op.maat.B, D: op.maat.D, Hg: op.maat.Hg || K.Hg };
    }
    var cam = stelCamera(K, op.draai);
    var accent = op.accent || null;

    // ondergrond: pleisterwerk en dekvloer voor alles wat geen tegel krijgt
    ctx.fillStyle = '#e9e5de'; ctx.fillRect(0, 0, W, H);
    var img = ctx.createImageData(W, H);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) { d[i] = 233; d[i + 1] = 229; d[i + 2] = 222; d[i + 3] = 255; }

    var B = K.B, D = K.D, Hg = K.Hg;
    var hoek = function (P3) { return cam.punt(P3); };

    // ---- vlakken definiëren: oorsprong, richting u, richting v
    var vlakken = [
      { naam: 'links',  Q: [0, 0, 0], A: [0, 0, 1], Bv: [0, 1, 0],
        hoeken: [[0, 0, 0], [0, 0, D], [0, Hg, D], [0, Hg, 0]], wand: 1, licht: .82 },
      { naam: 'rechts', Q: [B, 0, D], A: [0, 0, -1], Bv: [0, 1, 0],
        hoeken: [[B, 0, D], [B, 0, 0], [B, Hg, 0], [B, Hg, D]], wand: 1, licht: .90 },
      { naam: 'achter', Q: [0, 0, D], A: [1, 0, 0], Bv: [0, 1, 0],
        hoeken: [[0, 0, D], [B, 0, D], [B, Hg, D], [0, Hg, D]], wand: 1, licht: 1.0 },
      /* De voorwand hoort er ook bij. Zolang de camera recht van voren stond
         viel hij altijd achter je en was hij overbodig; draai je om, dan kijk je
         zonder deze wand de leegte in. */
      { naam: 'voor',   Q: [B, 0, 0], A: [-1, 0, 0], Bv: [0, 1, 0],
        hoeken: [[B, 0, 0], [0, 0, 0], [0, Hg, 0], [B, Hg, 0]], wand: 1, licht: .86 },
      { naam: 'vloer',  Q: [0, 0, 0], A: [1, 0, 0], Bv: [0, 0, 1],
        hoeken: [[0, 0, 0], [B, 0, 0], [B, 0, D], [0, 0, D]], wand: 0, licht: .94 }
    ];

    /* Een wand waar de camera búiten staat zou het zicht blokkeren. Welke dat
       is volgt uit de positie en niet uit een aanname over de kijkrichting:
       daarmee klopt het bij elke draaiing. */
    var buiten = {
      links:  cam.pos[0] < 0,
      rechts: cam.pos[0] > B,
      achter: cam.pos[2] > D,
      voor:   cam.pos[2] < 0
    };
    /* Een tegelplint heeft alleen zin waar de wand niet al betegeld is: staat
       er tegelwerk tot het plafond, dan is de onderste rij zelf de plint. Bij
       een gestucte wand loopt er een gezaagde strook van de vloertegel langs de
       voet, met dezelfde oorsprong als de wand zodat het voegwerk doorloopt. */
    if (op.plint && !op.wand) {
      var ph = op.plintHoogte || .08;
      vlakken.push(
        { naam: 'plint', Q: [0, 0, 0], A: [0, 0, 1], Bv: [0, 1, 0],
          hoeken: [[0, 0, 0], [0, 0, D], [0, ph, D], [0, ph, 0]], plint: 1, opWand: 'links', licht: .78 },
        { naam: 'plint', Q: [B, 0, D], A: [0, 0, -1], Bv: [0, 1, 0],
          hoeken: [[B, 0, D], [B, 0, 0], [B, ph, 0], [B, ph, D]], plint: 1, opWand: 'rechts', licht: .84 },
        { naam: 'plint', Q: [0, 0, D], A: [1, 0, 0], Bv: [0, 1, 0],
          hoeken: [[0, 0, D], [B, 0, D], [B, ph, D], [0, ph, D]], plint: 1, opWand: 'achter', licht: .92 }
      );
    }
    // een nis krijgt dezelfde tegels, met dezelfde oorsprong als de wand:
    // dan loopt het voegwerk er echt in door, precies zoals het gemetseld wordt
    var nissen = nissenVan(K, op.inrichting || {});
    nissen.forEach(function (n) {
      var xd = n.wand === 'links' ? n.diep : B - n.diep;
      vlakken.push({ naam: 'nis',
        Q: n.wand === 'links' ? [xd, 0, 0] : [xd, 0, D],
        A: n.wand === 'links' ? [0, 0, 1] : [0, 0, -1], Bv: [0, 1, 0],
        hoeken: [[xd, n.y0, n.z0], [xd, n.y0, n.z1], [xd, n.y1, n.z1], [xd, n.y1, n.z0]],
        wand: 1, accentVan: n.wand, licht: .62 });
    });

    // Ook de plinten en de nissen liggen op een wand; die vallen mee weg.
    vlakken = vlakken.filter(function (vl) {
      var op_ = vl.naam === 'plint' || vl.naam === 'nis' ? vl.accentVan || vl.opWand : vl.naam;
      return !buiten[op_ || vl.naam];
    });

    vlakken.forEach(function (vl) {
      var poly = [], goed = 1;
      for (var i = 0; i < vl.hoeken.length; i++) {
        var p = cam.punt(vl.hoeken[i]);
        if (!p) { goed = 0; break; }
        poly.push(p);
      }
      if (!goed) return;
      // De camera staat in de ruimte, dus alle vier de vlakken kijken naar ons
      // toe; er valt niets weg te laten.
      // Een accentwand krijgt zijn eigen materiaal; de nis volgt de wand
      // waarin hij zit, want die is er letterlijk uitgehakt.
      var mat = vl.plint ? op.plint : (vl.wand ? op.wand : op.vloer);
      if (accent && vl.wand && (vl.naam === accent.wand || vl.accentVan === accent.wand)) mat = accent.mat;
      var M = cam.vlak(vl.Q, vl.A, vl.Bv);
      if (mat) {
        vulVlak(img, W, H, M, poly, mat, vl.licht);
      } else {
        vulOnbetegeld(img, W, H, M, poly, vl);
      }
    });
    ctx.putImageData(img, 0, 0);

    // ---- licht, hoeken en inrichting
    kamerLicht(ctx, cam, K, W, H);
    nissen.forEach(function (n) { nis(ctx, cam, K, n); });
    if (K.v === 'badkamer') {
      var inr = op.inrichting || {};
      // de ombouw van een inbouwbad wordt in de gekozen wandtegel uitgevoerd
      inr.ombouw = (op.wand && op.wand.kleur) || (op.vloer && op.vloer.kleur) || null;
      meubelBad(ctx, cam, K, inr);
    }
    else meubelWc(ctx, cam, K, op.inrichting || {});
    kamerRanden(ctx, cam, K);
    randlicht(ctx, W, H);
  }

  /* Wat geen tegel krijgt: pleisterwerk op de wand, een gietvloer op de vloer. */
  function vulOnbetegeld(img, W, H, M, poly, vl) {
    var Mi = inv3(M); if (!Mi) return;
    var data = img.data;
    var basis = vl.wand ? [236, 232, 225] : [206, 200, 190];
    var yl = H, yh = 0;
    for (var i = 0; i < poly.length; i++) { if (poly[i][1] < yl) yl = poly[i][1]; if (poly[i][1] > yh) yh = poly[i][1]; }
    yl = Math.max(0, Math.floor(yl)); yh = Math.min(H - 1, Math.ceil(yh));
    for (var y = yl; y <= yh; y++) {
      var k = spans(poly, y + .5);
      for (var s = 0; s + 1 < k.length; s += 2) {
        var x0 = Math.max(0, Math.ceil(k[s])), x1 = Math.min(W - 1, Math.floor(k[s + 1]));
        for (var x = x0; x <= x1; x++) {
          var px = x + .5, py = y + .5;
          var w = Mi[6] * px + Mi[7] * py + Mi[8];
          var u = (Mi[0] * px + Mi[1] * py + Mi[2]) / w, v = (Mi[3] * px + Mi[4] * py + Mi[5]) / w;
          // heel fijne ruis, anders is het vlak volstrekt dood
          var r = Math.sin(u * 91.7 + v * 57.3) * Math.sin(u * 33.1 - v * 71.9);
          var t = vl.licht * (1 + r * .018);
          var o = (y * W + x) << 2;
          data[o] = klem(basis[0] * t, 0, 255);
          data[o + 1] = klem(basis[1] * t, 0, 255);
          data[o + 2] = klem(basis[2] * t, 0, 255);
          data[o + 3] = 255;
        }
      }
    }
  }

  /* Licht in de ruimte: daglicht van het raam, donkerder in de hoeken. */
  function kamerLicht(ctx, cam, K, W, H) {
    var B = K.B, D = K.D, Hg = K.Hg;
    ctx.save();
    // daglicht: een brede zachte veeg vanaf het raam of vanaf voren
    // het daglicht komt uit de achterwand; waar het raam precies zit hangt van
    // de inrichting af, dus we nemen het midden van die wand als bron
    var bron = cam.punt([B / 2, K.raam ? 1.5 : Hg * .8, D]);
    if (bron) {
      var gr = ctx.createRadialGradient(bron[0], bron[1], 10, bron[0], bron[1], H * 1.35);
      gr.addColorStop(0, 'rgba(255,250,238,.20)');
      gr.addColorStop(.40, 'rgba(255,250,240,.06)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      // en aan de overkant juist wegvallen, anders is alles even licht
      var dv = ctx.createLinearGradient(bron[0], 0, bron[0] < W / 2 ? W : 0, 0);
      dv.addColorStop(0, 'rgba(0,0,0,0)');
      dv.addColorStop(1, 'rgba(12,10,6,.20)');
      ctx.fillStyle = dv; ctx.fillRect(0, 0, W, H);
    }
    // de kim tussen wand en vloer, en de verticale hoeken
    [[[0, 0, 0], [0, 0, D]], [[B, 0, 0], [B, 0, D]], [[0, 0, D], [B, 0, D]]].forEach(function (l) {
      var a = cam.punt(l[0]), b = cam.punt(l[1]);
      if (a && b) kimSchaduw(ctx, [a, b], 26);
    });
    [[[0, 0, D], [0, Hg, D]], [[B, 0, D], [B, Hg, D]]].forEach(function (l) {
      var a = cam.punt(l[0]), b = cam.punt(l[1]);
      if (!a || !b) return;
      ctx.save();
      var naarBinnen = a[0] < W / 2 ? 1 : -1;
      var g = ctx.createLinearGradient(a[0], 0, a[0] + naarBinnen * 46, 0);
      g.addColorStop(0, 'rgba(0,0,0,.30)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      ctx.lineTo(b[0] + naarBinnen * 46, b[1]); ctx.lineTo(a[0] + naarBinnen * 46, a[1]);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    // naar boven toe wat donkerder: geen plafond in beeld, wel de val van licht
    var vg = ctx.createLinearGradient(0, 0, 0, H * .5);
    vg.addColorStop(0, 'rgba(0,0,0,.22)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H * .5);
    ctx.restore();
  }

  /* ---------- tekenhulp voor de inrichting ---------- */

  function pad(ctx, cam, punten) {
    ctx.beginPath();
    var eerst = 1;
    for (var i = 0; i < punten.length; i++) {
      var p = cam.punt(punten[i]); if (!p) return 0;
      if (eerst) { ctx.moveTo(p[0], p[1]); eerst = 0; } else ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath(); return 1;
  }

  function vulPad(ctx, cam, punten, kleur, lijn) {
    if (!pad(ctx, cam, punten)) return;
    ctx.fillStyle = kleur; ctx.fill();
    if (lijn) { ctx.strokeStyle = lijn; ctx.lineWidth = 1; ctx.stroke(); }
  }

  /* Een liggende doos: de drie zichtbare vlakken, elk met een eigen toon. */
  /* ---------- werken tegen een wand ----------
     Een wastafel tegen de linkerwand is dezelfde wastafel als tegen de
     achterwand, alleen een kwartslag gedraaid. Door een product te beschrijven
     in wandcoördinaten — langs de wand, en de diepte de ruimte in — hoeft het
     maar één keer beschreven te worden en kan het aan elke wand hangen.

     langs loopt vanaf de achterhoek van die wand, diep vanaf het wandvlak. */
  function wandFrame(K, wand) {
    var B = K.B, D = K.D;
    if (wand === 'links')  return { wand: wand, zij: 1, lengte: D, p: function (l, d) { return [d, D - l]; } };
    if (wand === 'rechts') return { wand: wand, zij: 1, lengte: D, p: function (l, d) { return [B - d, D - l]; } };
    // De voorwand is de wand achter de kijker. Langs loopt daar gespiegeld, want
    // wie zich omdraait heeft links en rechts verwisseld.
    if (wand === 'voor')   return { wand: wand, zij: 0, lengte: B, p: function (l, d) { return [B - l, d]; } };
    return { wand: 'achter', zij: 0, lengte: B, p: function (l, d) { return [l, D - d]; } };
  }

  function wandDoos(ctx, cam, F, l0, l1, y0, y1, d0, d1, kleur, tint) {
    var a = F.p(l0, d0), b = F.p(l1, d1);
    doos(ctx, cam, Math.min(a[0], b[0]), Math.max(a[0], b[0]), y0, y1,
         Math.min(a[1], b[1]), Math.max(a[1], b[1]), kleur, tint);
  }
  /* punten als [langs, hoogte, diep] */
  function naarWereld(F, q) { var xz = F.p(q[0], q[2]); return [xz[0], q[1], xz[1]]; }
  function wandPad(ctx, cam, F, punten, kleur, lijn) {
    vulPad(ctx, cam, punten.map(function (q) { return naarWereld(F, q); }), kleur, lijn);
  }
  function wandOvaal(ctx, cam, F, l, d, rl, rd, y, n) {
    var c = F.p(l, d);
    return ovaal(ctx, cam, c[0], c[1], F.zij ? rd : rl, F.zij ? rl : rd, y, n);
  }
  function wandContact(ctx, cam, F, l, d, rl, rd, sterkte) {
    var c = F.p(l, d);
    contact(ctx, cam, c[0], c[1], F.zij ? rd : rl, F.zij ? rl : rd, sterkte);
  }

  function doos(ctx, cam, x0, x1, y0, y1, z0, z1, kleur, tint) {
    var t = tint || [1, .90, .80];
    vulPad(ctx, cam, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], tinten(kleur, t[0]));
    vulPad(ctx, cam, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], tinten(kleur, t[1]));
    var links = cam.pos[0] > (x0 + x1) / 2;
    if (links) vulPad(ctx, cam, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], tinten(kleur, t[2]));
    else vulPad(ctx, cam, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], tinten(kleur, t[2]));
  }

  function tinten(hex, f) {
    var c = ontleed(hex);
    return 'rgb(' + klem(Math.round(c[0] * f), 0, 255) + ',' + klem(Math.round(c[1] * f), 0, 255) +
           ',' + klem(Math.round(c[2] * f), 0, 255) + ')';
  }

  /* Contactschaduw: een zachte ovaal op de vloer onder een voorwerp. */
  function contact(ctx, cam, x, z, rx, rz, sterkte) {
    var m = cam.punt([x, 0.002, z]); if (!m) return;
    var a = cam.punt([x + rx, 0.002, z]), b = cam.punt([x, 0.002, z + rz]);
    if (!a || !b) return;
    var ra = Math.hypot(a[0] - m[0], a[1] - m[1]), rb = Math.hypot(b[0] - m[0], b[1] - m[1]);
    ctx.save();
    var gr = ctx.createRadialGradient(m[0], m[1], 1, m[0], m[1], Math.max(ra, rb));
    gr.addColorStop(0, 'rgba(0,0,0,' + (sterkte || .34) + ')');
    gr.addColorStop(.55, 'rgba(0,0,0,' + (sterkte || .34) * .45 + ')');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.ellipse(m[0], m[1], Math.max(ra, rb), Math.min(ra, rb) * .8, 0, 0, 6.3);
    ctx.fill(); ctx.restore();
  }

  /* Een ovale bak (het bad) als twee ellipsen met een romp ertussen. */
  function ovaal(ctx, cam, x, z, rx, rz, y, n) {
    var pnt = [];
    for (var i = 0; i < (n || 40); i++) {
      var a = i / (n || 40) * Math.PI * 2;
      var p = cam.punt([x + Math.cos(a) * rx, y, z + Math.sin(a) * rz]);
      if (p) pnt.push(p);
    }
    return pnt;
  }
  /* Convexe omhullende (monotone ketting). Gebruikt om van twee ellipsen in
     beeld één gesloten silhouet te maken. */
  function omhullende(p) {
    var q = p.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (q.length < 3) return q;
    var kruis = function (o, a, b) {
      return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    };
    var onder = [], boven = [], i;
    for (i = 0; i < q.length; i++) {
      while (onder.length >= 2 && kruis(onder[onder.length - 2], onder[onder.length - 1], q[i]) <= 0) onder.pop();
      onder.push(q[i]);
    }
    for (i = q.length - 1; i >= 0; i--) {
      while (boven.length >= 2 && kruis(boven[boven.length - 2], boven[boven.length - 1], q[i]) <= 0) boven.pop();
      boven.push(q[i]);
    }
    onder.pop(); boven.pop();
    return onder.concat(boven);
  }

  function tekenOvaal(ctx, pnt, vul, lijn) {
    if (pnt.length < 3) return;
    ctx.beginPath(); ctx.moveTo(pnt[0][0], pnt[0][1]);
    for (var i = 1; i < pnt.length; i++) ctx.lineTo(pnt[i][0], pnt[i][1]);
    ctx.closePath();
    if (vul) { ctx.fillStyle = vul; ctx.fill(); }
    if (lijn) { ctx.strokeStyle = lijn; ctx.lineWidth = 1.2; ctx.stroke(); }
  }

  /* ---------- badkamer ---------- */

  /* ---------- de badkamer inrichten ----------

     Elk product staat op een plek, en een plek kan maar door één product
     bezet zijn. Er zijn er vier: de twee helften van de achterwand en de twee
     zijwanden. Wat tegen de achterwand staat kijkt recht in de camera en houdt
     daardoor zijn vorm; wat tegen een zijwand staat zien we schuin, dus daar
     staan alleen dingen die daar tegen kunnen — een bad en een nis.

     Rechts is het spiegelbeeld van links. Door dat één keer op te lossen hoeft
     elk product maar één keer getekend te worden. */

  /* ---------- waar past wat ----------

     De plaats van elk product volgt uit de maat van de ruimte, niet uit een
     vaste coördinaat. Anders staat in een badkamer van 1,7 bij 2,3 het bad
     dwars door de wastafel heen.

     Dezelfde rekensom beantwoordt ook de vraag of iets er überhaupt in past.
     Die vraag hoort maar op één plek te worden beantwoord, dus de configurator
     vraagt het hier op in plaats van het na te rekenen. */

  var RUIMTENODIG = {
    douche:   { B: 1.45, D: 1.70, w: 'een douchehoek van minstens 90 bij 90 cm' },
    bad:      { B: 1.95, D: 2.30, w: 'een bad van 170 cm plus ruimte om erlangs te lopen' },
    wastafel: { B: 1.30, D: 1.20, w: 'een wandhelft van minstens 65 cm' },
    toilet:   { B: 1.30, D: 1.60, w: 'een wandhelft van minstens 65 cm plus de voorzetwand' },
    nis:      { B: 1.20, D: 1.60, w: 'een wandvlak van minstens 60 cm' }
  };

  /* Geeft null als het past, en anders waaróm niet. */
  function past(maat, product, opties) {
    var n = RUIMTENODIG[product];
    if (!n) return null;
    if (maat.B < n.B || maat.D < n.D) {
      return 'past niet in ' + maat.B.toFixed(1).replace('.', ',') + ' × ' +
             maat.D.toFixed(1).replace('.', ',') + ' m: hiervoor is ' + n.w + ' nodig';
    }
    /* Een breed meubel vraagt vrije achterwand, en die is er niet zomaar: de
       douche bezet een hoek en het toilet een voorzetwand van 76 cm. Alleen
       tegen de halve wand aanhouden gaf een meubel van 120 cm vrij baan in een
       kamer waar na de douche nog anderhalve meter over was — en dan schoof het
       in het beeld over het toilet heen. */
    if (product === 'wastafel' && opties && opties.breedte) {
      /* Alleen tegen de douche afwegen, niet tegen het toilet. Een wastafel en
         een toilet staan in het echt vaak op verschillende wanden; ze allebei
         van dezelfde strook aftrekken maakte élke wastafel onmogelijk in een
         badkamer van 2,20 m, en dat is een doodgewone maat. Dat ze elkaar in
         beeld niet raken lost de tekening op, niet deze regel. */
      var over = vrijeAchterwand(maat, opties) - .24;
      if (opties.breedte / 100 > over) {
        var heeftD = opties.douche && opties.douche !== 'geen';
        return 'een meubel van ' + opties.breedte + ' cm past niet' +
               (heeftD ? ' naast de douche' : ' op deze wand') +
               ', daar is nog ' + Math.max(0, Math.round(over * 100)) + ' cm vrij';
      }
    }
    return null;
  }

  /* Wat er van de achterwand overblijft naast de douche. */
  function vrijeAchterwand(maat, opties) {
    var heeftDouche = opties && opties.douche && opties.douche !== 'geen';
    return maat.B - (heeftDouche ? Math.min(1.20, maat.B * .45) : 0);
  }

  /* De werkelijke coördinaten, uitgerekend op de maat van de ruimte. */
  function plaatsen(K, inr) {
    var B = K.B, D = K.D, p = {};
    var kx = function (kant, x) { return kant === 'rechts' ? B - x : x; };

    /* ---- zelf plaatsen ----
       inr.plek geeft per product een wand en een plek langs die wand. Wat daar
       staat gaat vóór op de automatische verdeling: de configurator weet wel
       wat er past, maar niet waar de deur zit of waar de leidingen al liggen.
       Wat er niet in staat wordt gewoon uitgerekend, zodat iemand die niets
       wil verslepen er geen last van heeft. Deze twee staan helemaal bovenaan
       omdat douche en bad — die verderop als eerste worden uitgerekend — ze
       ook al nodig hebben. */
    var eigen = inr.plek || {};
    /* Draaien is alleen voor wie zelf al een wand koos: de automatische
       verdeling rekent met de breedte van een product langs de wand, en die
       som klopt niet meer zodra iemand het een kwartslag zet. Door rot alleen
       via zetVast binnen te laten, kan een gedraaid product nooit een ander,
       automatisch geplaatst product in de weg zitten dat nog met de oude
       richting rekent. */
    var zetVast = function (naam, breedte) {
      var e = eigen[naam];
      if (!e || !e.wand) return null;
      var F = wandFrame(K, e.wand);
      var l = Math.max(breedte / 2 + .04, Math.min(F.lengte - breedte / 2 - .04,
                       e.l == null ? F.lengte / 2 : e.l));
      return { wand: e.wand, kant: e.wand === 'rechts' ? 'rechts' : 'links', l: l,
               rot: e.rot === 90 ? 90 : 0 };
    };

    /* Wat er van een wand af gaat omdat er een deur of raam in zit. Een deur
       neemt niet alleen zijn eigen breedte in beslag maar ook een marge: een
       kast die tot tegen de deurpost staat kun je niet openen zonder eerst de
       deur dicht te doen. Deze staat helemaal bovenaan omdat de verdeling van
       de achterwand er meteen mee begint. */
    var openingOp = function (wand) {
      var uit = [];
      (inr.openingen || []).forEach(function (o) {
        if (o.wand !== wand) return;
        var marge = o.soort === 'deur' ? .10 : 0;
        uit.push([o.hart - o.breedte / 2 - marge, o.hart + o.breedte / 2 + marge]);
      });
      var snede = snedeOp(wand);
      if (snede) uit.push(snede);
      return uit;
    };

    /* De hap uit een L-vormige ruimte is voor de verdeling precies wat een deur
       ook is: een stuk wand waar niets tegenaan kan. Elke hoek raakt twee
       wanden, en welk stuk van elke wand dat is hangt af van welke kant van die
       wand naar die hoek toe loopt — zie wandFrame() hierboven voor de
       l-richting per wand. Door de hap als "opening" aan te bieden hergebruikt
       elke plek die al met deuren en ramen rekent — de achterwandverdeling, de
       hoge kast, de zijwanden — die logica automatisch, in plaats van er een
       aparte uitzondering voor te worden. */
    var snedeOp = function (wand) {
      if (!K.snede) return null;
      var s = K.snede;
      /* Elke hoek is waar twee wanden elkaar raken, en op welk uiteinde van
         elke wand dat is volgt uit wandFrame() hierboven: achter loopt van de
         achterlinkshoek (l=0) naar de achterrechtshoek (l=B), links van de
         achterlinkshoek (l=0) naar de voorlinkshoek (l=D), enzovoort. Fout
         hierin levert geen crash op — de blokkade zit gewoon aan de verkeerde
         kant van de wand, en dan staat er alsnog een wastafel over de hap
         heen. Nagerekend puntje voor puntje aan de vier wandPunt-formules. */
      var HOEK = {
        achterlinks:  { a: 'achter', ar: [0, s.cb], b: 'links', br: [0, s.cd] },
        achterrechts: { a: 'achter', ar: [B - s.cb, B], b: 'rechts', br: [0, s.cd] },
        voorrechts:   { a: 'voor', ar: [0, s.cb], b: 'rechts', br: [D - s.cd, D] },
        voorlinks:    { a: 'voor', ar: [B - s.cb, B], b: 'links', br: [D - s.cd, D] }
      };
      var m = HOEK[s.hoek];
      if (!m) return null;
      if (wand === m.a) return m.ar;
      if (wand === m.b) return m.br;
      return null;
    };

    if (inr.douche && inr.douche !== 'geen') {
      var dw = Math.min(1.20, B * .45), dd = Math.min(1.35, D * .42);
      p.douche = { kant: inr.douche, w: dw, d: dd, z: D - dd };
      /* Een gemetseld muurtje aan de open zijde is geen glasplaat van acht
         millimeter maar een wand van honderd. Die dikte hoort in de verdeling
         en niet alleen in het beeld: hij gaat van de vrije doorgang af, en op
         de tekening moet er een maat op staan die klopt met wat er gemetseld
         wordt. Een halfhoog muurtje is even dik als een heel muurtje — het
         verschil zit in de hoogte, niet in de dikte. */
      var ws = inr.douchewandsoort || 'glas';
      if (ws !== 'glas' && inr.douchesoort === 'walkin') {
        p.douchemuur = {
          kant: inr.douche, dikte: .10, diep: dd,
          hoogte: ws === 'halfmuur' ? 1.20 : (K.Hg || 2.6),
          glasboven: ws === 'halfmuur',
          z: D - dd,
          x: inr.douche === 'rechts' ? B - dw - .10 : dw
        };
      }
    }

    if (inr.bad && inr.bad !== 'geen') {
      // het bad staat vóór de douche als die aan dezelfde kant zit
      var achter = (p.douche && p.douche.kant === inr.bad) ? p.douche.z : D;
      var lang = Math.min(1.70, (achter - .30));
      var brx = Math.min(.40, B * .17), brz = lang / 2;
      /* Een rond bad is rond. Met de gewone verhoudingen — smal en lang —
         kwam er een ovaal uit terwijl er "Ø 150" in de keuzelijst stond, en
         dan klopt het beeld niet met wat er besteld wordt. */
      if (inr.badsoort === 'rond') {
        var straal = Math.min(.75, B * .28, lang / 2);
        brx = straal; brz = straal;
      }
      /* Zelf plaatsen kan ook voor het bad — maar alleen tegen een zijwand,
         nooit tegen de achter- of voorwand: badOpPlek() in bad3d.js en de
         tekening gaan er allebei van uit dat een bad met zijn lange kant
         langs links of rechts ligt, niet dwars door de kamer. */
      var vb = null;
      if (eigen.bad && (eigen.bad.wand === 'links' || eigen.bad.wand === 'rechts')) {
        vb = zetVast('bad', brz * 2);
      }
      if (vb) {
        // bij een kwartslag wisselen de lange en de korte kant om
        var effRx = vb.rot === 90 ? brz : brx, effRz = vb.rot === 90 ? brx : brz;
        p.bad = { kant: vb.wand, x: kx(vb.wand, effRx + .06), z: D - vb.l,
                  rx: effRx, rz: effRz, rot: vb.rot, ombouw: inr.ombouw, eigen: true };
      } else {
        // tegen de achterkant van de vrije strook, niet vooraan: vlak voor de
        // camera vult een bad het halve beeld
        p.bad = { kant: inr.bad, x: kx(inr.bad, brx + .06),
                  z: Math.max(.30 + brz, achter - brz - .22), rx: brx, rz: brz, rot: 0,
                  ombouw: inr.ombouw };
      }
    }

    if (inr.nis && inr.nis !== 'geen') {
      // in de douche als die aan dezelfde kant zit, anders midden op de wand
      var nz0, nz1;
      if (p.douche && p.douche.kant === inr.nis) { nz0 = D - p.douche.d + .18; nz1 = D - .18; }
      else { nz0 = D * .52; nz1 = Math.min(D - .25, nz0 + 1.10); }
      if (nz1 - nz0 > .45) p.nis = { wand: inr.nis, z0: nz0, z1: nz1, y0: 1.08, y1: 1.54, diep: .11 };
    }

    /* ---- de achterwand verdelen ----
       De achterwand is niet overal vrij. Staat er een douche in een hoek, dan
       loopt die tot aan het glas dóór over de achterwand, en die strook is op.
       Een wandcloset dat in de douchehoek hangt bestaat niet — en dat was wat
       er gebeurde zodra iemand het toilet en de douche aan dezelfde kant zette.

       Er wordt gerekend met de werkelijke breedte op de wand, niet met de
       breedte van het voorwerp: een hangend toilet vraagt een voorzetwand van
       76 cm, ook al is de pot maar 38 cm breed. Met de pot rekenen levert een
       voorzetwand op die half in de douche of half in het wastafelmeubel zit. */
    var vrij0 = 0, vrij1 = B;
    if (p.douche) {
      /* Staat er een gemetseld muurtje aan de open zijde, dan houdt de vrije
         achterwand niet op bij het glas maar tien centimeter verderop. Zonder
         die dikte kwam een wastafel tegen het muurtje aan te staan in plaats
         van ernaast. */
      var dmuur = p.douchemuur ? p.douchemuur.dikte : 0;
      if (p.douche.kant === 'links') vrij0 = p.douche.w + dmuur;
      else vrij1 = B - p.douche.w - dmuur;
    }
    /* Zit de deur in de achterwand, dan is die strook op. Een wastafel voor een
       deur is geen wastafel maar een versperring, en tot nu toe kon dat gewoon
       gebeuren omdat de verdeling niet wist dat er een deur was. */
    openingOp('achter').forEach(function (o) {
      if (o[0] - vrij0 > vrij1 - o[1]) vrij1 = Math.min(vrij1, o[0]);
      else vrij0 = Math.max(vrij0, o[1]);
    });
    var vrijB = vrij1 - vrij0;

    var heeftW = inr.wastafel && inr.wastafel !== 'geen';
    var heeftT = inr.toilet && inr.toilet !== 'geen';
    var lucht = .12;
    var tb = (inr.toiletsoort === 'staand') ? .42 : .78;   // voorzetwand, niet de pot

    var gevraagd = (inr.breedte || 80) / 100;

    /* Een zijwand is ook een wand. Wat er op de achterwand niet meer bij kan,
       gaat daarheen — precies zoals een badkamerontwerper het zou doen. De
       douche bezet daar de achterste strook, een inbouwbad de zijne; wat
       overblijft is het grootste vrije gat. */
    var zijGat = function (kant, ookProducten) {
      var bezet = [];
      if (p.douche && p.douche.kant === kant) bezet.push([D - p.douche.d, D]);
      if (p.bad && p.bad.kant === kant) bezet.push([p.bad.z - p.bad.rz, p.bad.z + p.bad.rz]);
      /* Voor het toilet wordt deze vraag gesteld vóórdat er iets op de zijwand
         staat. Voor alles wat daarna komt moet er ook langs gekeken worden wat
         er inmiddels hangt, anders zet de kast zich over het toilet heen. */
      if (ookProducten) {
        [p.wastafel, p.toilet].forEach(function (q) {
          if (!q || q.wand !== kant) return;
          var b = (q.w || q.breed || .6);
          bezet.push([D - q.l - b / 2, D - q.l + b / 2]);
        });
        openingOp(kant).forEach(function (o) { bezet.push([D - o[1], D - o[0]]); });
      }
      bezet.sort(function (a, b) { return a[0] - b[0]; });
      // langs loopt vanaf de achterhoek, dus omrekenen naar langs-coördinaten
      var gaten = [], vorige = 0;
      bezet.forEach(function (b) {
        var l0 = D - b[1], l1 = D - b[0];
        if (l0 > vorige) gaten.push([vorige, l0]);
        vorige = Math.max(vorige, l1);
      });
      if (vorige < D - .10) gaten.push([vorige, D - .10]);
      var beste = null;
      gaten.forEach(function (g) { if (!beste || g[1] - g[0] > beste[1] - beste[0]) beste = g; });
      return beste;
    };

    var aanKant = function (kant, breedte, af) {
      var x = kant === 'rechts' ? vrij1 - af - breedte / 2 : vrij0 + af + breedte / 2;
      // nooit buiten de vrije strook, ook niet als de ruimte er eigenlijk te
      // klein voor is: dan liever tegen elkaar aan dan in de douche
      return Math.max(vrij0 + breedte / 2, Math.min(vrij1 - breedte / 2, x));
    };

    /* Passen ze samen niet op de achterwand, dan gaat het toilet naar de
       zijwand van de kant die het koos. Dat is wat een ontwerper ook doet: de
       wastafel is het gezicht van de badkamer en houdt de plek tegenover de
       deur, het toilet kan prima om de hoek. Alleen als daar geen gat van 80 cm
       vrij is, blijven ze samen op de achterwand. */
    var zijNodig = heeftW && heeftT &&
                   vrijB < Math.min(gevraagd, vrijB - lucht) + tb + lucht * 2.4;
    var gat = zijNodig ? zijGat(inr.toilet) : null;
    var naarZij = zijNodig && gat && gat[1] - gat[0] >= tb + .06;

    /* De breedte van het meubel hangt af van wat er náást komt. Verhuist het
       toilet naar een zijwand, dan is de hele achterwand van de wastafel — die
       eerst laten krimpen tegen een toilet dat er niet meer staat levert een
       meubel van veertig centimeter op in een kamer waar tachtig kan. */
    var deeltStrook = heeftW && heeftT && !naarZij;
    var wb = 0;
    if (heeftW) {
      wb = Math.min(gevraagd, vrijB - (deeltStrook ? tb + lucht : 0) - lucht);
      if (wb < .40) {
        wb = Math.min(gevraagd, vrijB - (deeltStrook ? tb : 0));   // zonder lucht
        if (wb < .40) { heeftW = false; wb = 0; }
      }
    }

    /* Passen ze aan weerszijden van de strook, dan krijgt ieder zijn eigen
       kant. Zo niet — en met een douche in de hoek blijft er vaak maar
       anderhalve meter over — dan gaan ze naast elkaar. Wie er dan aan de
       buitenkant staat volgt uit de kant die iemand koos: die keuze stilzwijgend
       laten vallen is erger dan hem niet aanbieden. */
    var samen = heeftW && heeftT &&
                (inr.wastafel === inr.toilet || vrijB < wb + tb + lucht * 2.4);

    /* Eerst automatisch verdelen, dan de eigen keuze eroverheen. Andersom zou
       de verdeling om een handmatig gezet product heen moeten rekenen, en dan
       verspringt de rest zodra je iets versleept. */
    /* Het bad staat vóór de douche, maar niet vóór wat er op de achterwand
       hangt. Dat was het gat: het bad werd geplaatst voordat de wastafel een
       plek had, en schoof met zijn kopse eind tot 22 cm van de achterwand —
       dwars door een meubel van 46 cm diep. Op het beeld zag je het nauwelijks,
       op een technische tekening staat het bad ineens ín de wastafel.

       De correctie gebeurt hier, na de verdeling, en alleen als ze elkaar in de
       breedte werkelijk raken. Het bad schuift naar voren; is daar te weinig
       ruimte, dan wordt het korter — nooit korter dan 1,40 m, want dat is geen
       bad meer en dan hoort de keuze te vervallen in plaats van te krimpen. */
    var badVrijHouden = function () {
      // wie het bad zelf heeft neergezet, bedoelde die plek — dit mag hem
      // dan niet meer verschuiven of, erger, laten vervallen
      if (!p.bad || p.bad.eigen) return;
      var diepte = 0;
      [p.wastafel, p.toilet].forEach(function (q) {
        if (!q || q.wand !== 'achter') return;
        var q0 = aanKantVlak(q), b0 = p.bad.x - p.bad.rx, b1 = p.bad.x + p.bad.rx;
        if (q0[1] <= b0 || q0[0] >= b1) return;      // raken elkaar niet
        // een meubel is 46 cm diep, een voorzetwand met pot samen 74
        diepte = Math.max(diepte, q === p.wastafel ? .46 : .74);
      });
      if (!diepte) return;
      var maxAchter = D - diepte - .04;
      if (p.bad.z + p.bad.rz <= maxAchter) return;
      var nieuweZ = maxAchter - p.bad.rz;
      if (nieuweZ - p.bad.rz >= .20) { p.bad.z = nieuweZ; return; }
      // naar voren kan niet meer: dan korter, en anders vervalt het bad
      var ruimte = maxAchter - .24;
      if (ruimte < 1.40) { delete p.bad; return; }
      p.bad.rz = ruimte / 2;
      p.bad.z = maxAchter - p.bad.rz;
    };
    /* Waar een achterwandproduct in de breedte begint en eindigt. `l` loopt
       langs de wand vanaf de achterhoek, en op de achterwand is dat gewoon x. */
    var aanKantVlak = function (q) {
      var b = (q.w || q.breed || 0);
      return [q.l - b / 2, q.l + b / 2];
    };

    var metEigen = function () {
      if (heeftW && eigen.wastafel && eigen.wastafel.wand) {
        var vw = zetVast('wastafel', p.wastafel ? p.wastafel.w : gevraagd);
        if (vw) p.wastafel = { wand: vw.wand, kant: vw.kant, l: vw.l, rot: vw.rot,
                               w: p.wastafel ? p.wastafel.w : Math.min(gevraagd, 1.6) };
      }
      if (heeftT && eigen.toilet && eigen.toilet.wand) {
        var vt = zetVast('toilet', tb);
        if (vt) p.toilet = { wand: vt.wand, kant: vt.kant, l: vt.l, rot: vt.rot, breed: tb };
      }
      // pas als alles op zijn plek staat, ook wat iemand zelf heeft gezet
      badVrijHouden();
      kastPlaatsen();
      return p;
    };

    /* De hoge kast krijgt een eigen strook, en die is er niet altijd. Hem
       zomaar naast de wastafel zetten was de eerste ingeving, en dat is precies
       hoe het bad eerder dwars door een meubel kwam te staan: een product dat de
       verdeling niet kent, belandt in iets anders.

       Dus: eerst kijken wat er op de achterwand over is, dan wat er op een
       zijwand over is, en past hij nergens, dan komt hij er niet. Dat de keuze
       dan vervalt regelt de configurator; hier wordt alleen gemeten. */
    var kastPlaatsen = function () {
      var kb = (inr.kolomkast || 0) / 100;
      if (!kb) return;
      var kd = .35;
      // wie de kast zelf tegen een wand heeft gezet wint van het gat zoeken
      if (eigen.kolomkast && eigen.kolomkast.wand) {
        var vk = zetVast('kolomkast', kb);
        if (vk) { p.kolomkast = { wand: vk.wand, kant: vk.kant, l: vk.l, rot: vk.rot,
                                  breed: kb, diep: kd }; return; }
      }

      var bezetAchter = [];
      if (p.douche) {
        var kdm = p.douchemuur ? p.douchemuur.dikte : 0;
        if (p.douche.kant === 'links') bezetAchter.push([0, p.douche.w + kdm]);
        else bezetAchter.push([B - p.douche.w - kdm, B]);
      }
      [p.wastafel, p.toilet].forEach(function (q) {
        if (!q || q.wand !== 'achter') return;
        var b = (q.w || q.breed || .6);
        bezetAchter.push([q.l - b / 2, q.l + b / 2]);
      });
      openingOp('achter').forEach(function (o) { bezetAchter.push(o); });
      bezetAchter.sort(function (a, b) { return a[0] - b[0]; });
      var gaten = [], vorige = 0;
      bezetAchter.forEach(function (g) {
        if (g[0] > vorige) gaten.push([vorige, g[0]]);
        vorige = Math.max(vorige, g[1]);
      });
      if (vorige < B) gaten.push([vorige, B]);
      var beste = null;
      gaten.forEach(function (g) { if (!beste || g[1] - g[0] > beste[1] - beste[0]) beste = g; });

      /* Passen is niet genoeg: er moet ook nog langs te lopen zijn. Zestig
         centimeter vrije doorgang is de ondergrens waaronder een badkamer geen
         badkamer meer is, en een kast van 35 diep in een gang van 90 haalt dat
         niet. */
      var houdtDoorgang = function (wand) {
        var over = (wand === 'achter') ? D : B;
        if (wand === 'achter') {
          if (p.douche) over -= p.douche.d;
        } else {
          if (p.douche && p.douche.kant !== wand) over -= p.douche.w;
        }
        return over - kd >= .60;
      };

      if (beste && beste[1] - beste[0] >= kb + .04 && houdtDoorgang('achter')) {
        p.kolomkast = { wand: 'achter', kant: 'links', breed: kb, diep: kd,
                        l: (beste[0] + beste[1]) / 2 };
        return;
      }
      /* Niet op de achterwand? Dan de zijwand met het grootste gat, en bij
         gelijk spel de kant waar de douche niet staat — daar loop je hem het
         minst voor de voeten. */
      var keuzes = ['links', 'rechts'].map(function (k) {
        var g = zijGat(k, true);
        return { kant: k, gat: g, ruim: g ? g[1] - g[0] : 0 };
      }).sort(function (a, b) { return b.ruim - a.ruim; });
      var win = keuzes[0];
      if (win.gat && win.ruim >= kb + .04 && houdtDoorgang(win.kant)) {
        p.kolomkast = { wand: win.kant, kant: win.kant, breed: kb, diep: kd,
                        l: (win.gat[0] + win.gat[1]) / 2 };
      }
    };

    if (naarZij) {
      p.wastafel = { wand: 'achter', kant: inr.wastafel, w: wb,
                     l: aanKant(inr.wastafel, wb, (vrijB - wb) / 2) };
      p.toilet = { wand: inr.toilet, kant: inr.toilet, breed: tb,
                   l: Math.min(gat[1] - tb / 2 - .03, Math.max(gat[0] + tb / 2 + .03,
                        gat[0] + (gat[1] - gat[0]) / 2)) };
      return metEigen();
    }

    if (heeftW && heeftT && !samen) {
      p.wastafel = { wand: 'achter', kant: inr.wastafel, l: aanKant(inr.wastafel, wb, lucht), w: wb };
      p.toilet = { wand: 'achter', kant: inr.toilet, l: aanKant(inr.toilet, tb, lucht), breed: tb };
    } else if (heeftW && heeftT) {
      // Kozen ze verschillende kanten, dan staat het toilet aan de kant die het
      // koos en schuift de wastafel ernaast. Kozen ze dezelfde kant, dan neemt
      // de wastafel de hoek — dat is het bredere stuk en dat oogt rustiger.
      var buitenT = inr.toilet !== inr.wastafel;
      var eind = buitenT ? inr.toilet : inr.wastafel;
      // De ruimte die overblijft verdelen we over de randen en de tussenruimte.
      // Is er niets over, dan staan ze tegen elkaar aan — maar nooit in elkaar.
      var over = Math.max(0, vrijB - wb - tb);
      var rand = Math.min(lucht, over / 3);
      var tussen = Math.min(lucht, over - rand * 2);
      if (buitenT) {
        p.toilet = { wand: 'achter', kant: eind, l: aanKant(eind, tb, rand), breed: tb };
        p.wastafel = { wand: 'achter', kant: eind, l: aanKant(eind, wb, rand + tb + tussen), w: wb };
      } else {
        p.wastafel = { wand: 'achter', kant: eind, l: aanKant(eind, wb, rand), w: wb };
        p.toilet = { wand: 'achter', kant: eind, l: aanKant(eind, tb, rand + wb + tussen), breed: tb };
      }
    } else if (heeftW) {
      p.wastafel = { wand: 'achter', kant: inr.wastafel, w: wb,
                     l: aanKant(inr.wastafel, wb, (vrijB - wb) / 2) };
    } else if (heeftT) {
      p.toilet = { wand: 'achter', kant: inr.toilet, breed: tb,
                   l: aanKant(inr.toilet, tb, (vrijB - tb) / 2) };
    }
    return metEigen();
  }

  function kantX(K, kant, x) { return kant === 'rechts' ? K.B - x : x; }

  function meubelBad(ctx, cam, K, inr) {
    var B = K.B, D = K.D;
    inr = inr || {};
    var pl = plaatsen(K, inr);

    // Het raam komt op de helft van de achterwand die vrij blijft. Staat er aan
    // beide kanten iets, dan is er geen raam — een raam achter een spiegel
    // tekenen levert alleen een raar beeld op. Wat naar een zijwand verhuisd is
    // telt hier niet meer mee: die achterwandhelft is dan juist vrij.
    var bezetAchter = {};
    if (pl.douche) bezetAchter[pl.douche.kant] = 1;
    ['wastafel', 'toilet'].forEach(function (n) {
      if (pl[n] && pl[n].wand === 'achter') bezetAchter[pl[n].kant] = 1;
    });
    var raamKant = !bezetAchter.links ? 'links' : (!bezetAchter.rechts ? 'rechts' : null);
    if (raamKant) raam(ctx, cam, K, raamKant);

    /* Volgorde op diepte: wat achterin staat eerst, zodat wat vooraan staat er
       overheen valt. Zolang alles tegen de achterwand hing was die volgorde
       vast; nu een toilet aan een zijwand vlak bij de camera kan staan, moet
       hij uitgerekend worden. */
    var stukken = [];
    var opWand = function (wand, l, d) { return wandFrame(K, wand).p(l, d); };
    if (pl.douche) {
      var dxz = [pl.douche.kant === 'links' ? pl.douche.w / 2 : B - pl.douche.w / 2,
                 D - pl.douche.d / 2];
      stukken.push({ xz: dxz, doe: function () { douche(ctx, cam, K, pl.douche); } });
    }
    if (pl.wastafel) {
      stukken.push({ xz: opWand(pl.wastafel.wand, pl.wastafel.l, .25),
                     doe: function () { wastafel(ctx, cam, K, pl.wastafel, inr); } });
    }
    if (pl.toilet) {
      stukken.push({ xz: opWand(pl.toilet.wand, pl.toilet.l, .40),
                     doe: function () { hangtoilet(ctx, cam, K, pl.toilet, inr); } });
    }
    if (pl.bad) {
      stukken.push({ xz: [pl.bad.x, pl.bad.z], doe: function () { ligbad(ctx, cam, K, pl.bad, inr); } });
    }
    /* Op afstand tot de camera, niet op diepte in de ruimte: zodra het beeld
       draait valt de z-as niet meer samen met de kijkrichting, en dan zou een
       wastafel vlak voor je neus achter het bad verdwijnen. */
    stukken.forEach(function (s) {
      var c = cam.naarCam([s.xz[0], .8, s.xz[1]], 0);
      s.ver = c[2];
    });
    stukken.sort(function (a, b) { return b.ver - a.ver; });
    stukken.forEach(function (s) { s.doe(); });

    // handdoek aan een haak, maar alleen aan een zijwand waar niets voor staat
    var bezetZij = {};
    if (inr.bad && inr.bad !== 'geen') bezetZij[inr.bad] = 1;
    if (pl.douche) bezetZij[pl.douche.kant] = 1;
    ['wastafel', 'toilet'].forEach(function (n) {
      if (pl[n] && pl[n].wand !== 'achter') bezetZij[pl[n].wand] = 1;
    });
    var vrijeZij = !bezetZij.links ? 'links' : (!bezetZij.rechts ? 'rechts' : null);
    if (vrijeZij) handdoek(ctx, cam, K, vrijeZij);
  }

  /* ---- raam in de achterwand ---- */
  function raam(ctx, cam, K, kant) {
    var D = K.D, w = D - .012;
    var x0 = kantX(K, kant, .40), x1 = kantX(K, kant, 1.45);
    if (x0 > x1) { var t = x0; x0 = x1; x1 = t; }
    var y0 = .95, y1 = 2.05;
    var vlak = [[x0, y0, w], [x1, y0, w], [x1, y1, w], [x0, y1, w]];
    if (pad(ctx, cam, vlak)) {
      var a = cam.punt([x0, y1, w]), b = cam.punt([x1, y0, w]);
      var g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#f6f4ee'); g.addColorStop(1, '#e8e6df');
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.save();
    ctx.strokeStyle = 'rgba(38,39,42,.8)'; ctx.lineWidth = 3;
    if (pad(ctx, cam, vlak)) ctx.stroke();
    ctx.lineWidth = 2;
    var my = y0 + (y1 - y0) * .55;
    var l1 = cam.punt([x0, my, w]), l2 = cam.punt([x1, my, w]);
    if (l1 && l2) { ctx.beginPath(); ctx.moveTo(l1[0], l1[1]); ctx.lineTo(l2[0], l2[1]); ctx.stroke(); }
    ctx.restore();
    // het licht dat het raam de ruimte in gooit
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var s1 = cam.punt([(x0 + x1) / 2, y0, w]);
    if (s1) {
      var gl = ctx.createRadialGradient(s1[0], s1[1] - 40, 8, s1[0], s1[1] - 40, 520);
      gl.addColorStop(0, 'rgba(255,248,232,.20)');
      gl.addColorStop(1, 'rgba(255,248,232,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctx.restore();
  }

  /* ---- inloopdouche in een achterhoek ---- */
  function douche(ctx, cam, K, d) {
    var D = K.D, kant = d.kant, gz = d.z;
    var xb = kantX(K, kant, 0), xg = kantX(K, kant, d.w);
    var hoog = Math.min(2.05, K.Hg - .4);
    // regendouche aan de achterwand, midden boven de douchehoek
    var rm = kantX(K, kant, d.w * .55);
    doos(ctx, cam, Math.min(rm - .27, rm + .27), Math.max(rm - .27, rm + .27),
         hoog + .03, hoog + .07, D - .55, D - .06, '#25262a', [1, .78, .66]);

    var glas = [[xb, 0, gz], [xg, 0, gz], [xg, hoog, gz], [xb, hoog, gz]];
    if (pad(ctx, cam, glas)) {
      var p1 = cam.punt([xb, hoog, gz]), p2 = cam.punt([xg, 0, gz]);
      var gg = ctx.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
      gg.addColorStop(0, 'rgba(214,232,236,.26)');
      gg.addColorStop(.5, 'rgba(228,242,244,.13)');
      gg.addColorStop(1, 'rgba(204,222,228,.24)');
      ctx.fillStyle = gg; ctx.fill();
    }
    ctx.save();
    ctx.strokeStyle = 'rgba(32,34,36,.62)'; ctx.lineWidth = 4;
    if (pad(ctx, cam, [[xg, 0, gz], [xg, hoog, gz]])) ctx.stroke();
    ctx.lineWidth = 3;
    if (pad(ctx, cam, [[xb, hoog, gz], [xg, hoog, gz]])) ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(32,34,36,.5)';
    if (pad(ctx, cam, [[xb, .01, gz], [xg, .01, gz]])) ctx.stroke();
    // bij een hoekcabine staat er ook een paneel haaks erop, tegen de zijwand
    if (d.cabine) {
      var zz = gz + (D - gz) * .5;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(32,34,36,.62)';
      if (pad(ctx, cam, [[xg, 0, D], [xg, hoog, D]])) ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- wastafel met spiegel, tegen de achterwand ---- */
  function wastafel(ctx, cam, K, pw, inr) {
    var F = wandFrame(K, pw.wand || 'achter');
    var wl = pw.l, ww = pw.w, wd = Math.min(.46, ww * .5), wt = .86;
    var dw = .012;                       // het wandvlak zelf
    var soort = (inr && inr.wastafelsoort) || 'meubel';
    var dubbel = soort === 'dubbel' || soort === 'dubbelekom';
    var kom = soort === 'kom' || soort === 'dubbelekom';
    var zwevend = soort !== 'wand';

    // spiegel: bij een dubbele wastafel twee stuks
    var spBreed = dubbel ? ww * .44 : Math.min(.80, ww * .9);
    var spL = dubbel ? [wl - ww * .25, wl + ww * .25] : [wl];
    spL.forEach(function (ml) {
      var sp = [[ml - spBreed / 2, 1.10, dw], [ml + spBreed / 2, 1.10, dw],
                [ml + spBreed / 2, 1.98, dw], [ml - spBreed / 2, 1.98, dw]]
        .map(function (q) { return naarWereld(F, q); });
      if (pad(ctx, cam, sp)) {
        var m1 = cam.punt(naarWereld(F, [ml - spBreed / 2, 1.98, dw]));
        var m2 = cam.punt(naarWereld(F, [ml + spBreed / 2, 1.10, dw]));
        var gm = ctx.createLinearGradient(m1[0], m1[1], m2[0], m2[1]);
        gm.addColorStop(0, 'rgba(94,104,110,.62)');
        gm.addColorStop(.45, 'rgba(126,136,142,.50)');
        gm.addColorStop(1, 'rgba(72,80,86,.66)');
        ctx.fillStyle = gm; ctx.fill();
      }
      ctx.save(); ctx.strokeStyle = 'rgba(30,32,34,.5)'; ctx.lineWidth = 2;
      if (pad(ctx, cam, sp)) ctx.stroke(); ctx.restore();
    });

    // schaduw op de wand, zodat het meubel niet zweeft zonder reden
    wandPad(ctx, cam, F, [[wl - ww / 2 - .05, wt - .30, dw], [wl + ww / 2 + .05, wt - .30, dw],
                          [wl + ww / 2 + .05, wt, dw], [wl - ww / 2 - .05, wt, dw]], 'rgba(0,0,0,.14)');

    var meubelKleur = (inr && inr.bladkleur) || '#b08d5f';
    if (zwevend) {
      // onderkast met een blad erop
      wandDoos(ctx, cam, F, wl - ww / 2, wl + ww / 2, wt - .34, wt, dw, wd, meubelKleur, [1, .93, .74]);
      wandPad(ctx, cam, F, [[wl - ww / 2, wt, wd], [wl + ww / 2, wt, wd],
                            [wl + ww / 2, wt, dw], [wl - ww / 2, wt, dw]], '#fbfaf8');
      wandContact(ctx, cam, F, wl, wd / 2, ww * .55, wd * .7, .24);
    } else {
      // wandmontage: alleen de kom, geen meubel
      wandPad(ctx, cam, F, [[wl - ww / 2, wt, wd], [wl + ww / 2, wt, wd],
                            [wl + ww / 2, wt, dw], [wl - ww / 2, wt, dw]], '#fbfaf8');
      wandPad(ctx, cam, F, [[wl - ww / 2, wt, wd], [wl + ww / 2, wt, wd],
                            [wl + ww / 2, wt - .14, wd], [wl - ww / 2, wt - .14, wd]], '#f2f1ed');
    }

    var komL = dubbel ? [wl - ww * .25, wl + ww * .25] : [wl];
    komL.forEach(function (cl) {
      if (kom) {
        // opbouwkom op het blad
        var kb = wandOvaal(ctx, cam, F, cl, wd / 2, Math.min(.20, ww * .17), .17, wt + .14, 30);
        var ko = wandOvaal(ctx, cam, F, cl, wd / 2, Math.min(.17, ww * .15), .145, wt + .005, 30);
        if (kb.length && ko.length) {
          ctx.beginPath(); ctx.moveTo(ko[0][0], ko[0][1]);
          for (var a = 1; a < ko.length; a++) ctx.lineTo(ko[a][0], ko[a][1]);
          for (var b = kb.length - 1; b >= 0; b--) ctx.lineTo(kb[b][0], kb[b][1]);
          ctx.closePath(); ctx.fillStyle = '#efeeea'; ctx.fill();
        }
        tekenOvaal(ctx, kb, '#faf9f6', 'rgba(120,118,112,.45)');
        tekenOvaal(ctx, wandOvaal(ctx, cam, F, cl, wd / 2, Math.min(.155, ww * .13), .125, wt + .115, 26), '#e6e4de');
      } else {
        // verzonken bak in het blad
        tekenOvaal(ctx, wandOvaal(ctx, cam, F, cl, wd / 2, Math.min(.19, ww * .16), .145, wt - .003, 30),
                   '#e9e7e2', 'rgba(130,128,122,.4)');
      }
      // kraan: bij een opbouwkom een verhoogde
      var kh = kom ? .52 : .30;
      wandDoos(ctx, cam, F, cl - .03, cl + .03, wt + .04, wt + kh, .01, .05, '#25262a', [1, .8, .68]);
      wandDoos(ctx, cam, F, cl - .03, cl + .03, wt + kh - .04, wt + kh, .01, .22, '#25262a', [1, .8, .68]);
    });
  }

  /* ---- hangend toilet tegen de achterwand ---- */
  function hangtoilet(ctx, cam, K, pt, inr) {
    var F = wandFrame(K, pt.wand || 'achter');
    var tl = pt.l, dw = .012;
    var soort = (inr && inr.toiletsoort) || 'hangend';
    var staand = soort === 'staand';
    var pd0, pd1;                        // de pot, in diepte vanaf de wand

    if (staand) {
      // duoblok: reservoir op de pot, alles staat op de vloer
      pd0 = .02; pd1 = .70;
      wandDoos(ctx, cam, F, tl - .20, tl + .20, 0, .40, pd0, pd1, '#f7f6f3', [1, .94, .86]);
      wandDoos(ctx, cam, F, tl - .19, tl + .19, .40, .78, dw, .22, '#f7f6f3', [1, .95, .87]);
      wandContact(ctx, cam, F, tl, (pd0 + pd1) / 2, .26, .34, .30);
    } else {
      // voorzetwandje waar het reservoir in zit
      var vh = (inr && inr.reservoir === 'plafond') ? Math.min(K.Hg, 2.5) : 1.02;
      wandDoos(ctx, cam, F, tl - .38, tl + .38, 0, vh, 0, .22, '#e2ded6', [1, .965, .90]);
      var pl = [[tl - .13, .82, .225], [tl + .13, .82, .225],
                [tl + .13, .97, .225], [tl - .13, .97, .225]]
        .map(function (q) { return naarWereld(F, q); });
      vulPad(ctx, cam, pl, (inr && inr.paneelkleur) || '#f5f4f1');
      ctx.save(); ctx.strokeStyle = 'rgba(120,118,112,.55)'; ctx.lineWidth = 1.4;
      if (pad(ctx, cam, pl)) ctx.stroke(); ctx.restore();

      pd0 = .22; pd1 = .80;
      wandPad(ctx, cam, F, [[tl - .22, .30, .219], [tl + .22, .30, .219],
                            [tl + .22, .60, .219], [tl - .22, .60, .219]], 'rgba(0,0,0,.16)');
      wandDoos(ctx, cam, F, tl - .19, tl + .19, .38, .57, pd0, pd1, '#f7f6f3', [1, .94, .86]);
      wandContact(ctx, cam, F, tl, pd0 + .35, .30, .34, .22);
    }

    var zit = staand ? .40 : .575;
    var midden = (pd0 + pd1) / 2 + .03;
    tekenOvaal(ctx, wandOvaal(ctx, cam, F, tl, midden, .175, .245, zit, 34),
               '#fcfbf9', 'rgba(120,118,112,.4)');
    tekenOvaal(ctx, wandOvaal(ctx, cam, F, tl, midden, .115, .175, zit - .005, 30), '#e9e7e2');
  }

  /* ---- vrijstaand bad tegen een zijwand ---- */
  function ligbad(ctx, cam, K, pb, inr) {
    var kant = pb.kant, bx = pb.x, bz = pb.z, brx = pb.rx, brz = pb.rz, bh = .58;
    var soort = (inr && inr.badsoort) || 'vrijstaand';

    if (soort === 'inbouw') {
      // Inbouwbad in een betegelde ombouw. De ombouw krijgt de kleur van de
      // gekozen wandtegel: het staat er letterlijk als "betegelde ombouw", dus
      // hem in een vaste grijstint zetten spreekt de keuze tegen.
      var x0 = kant === 'links' ? .02 : bx - brx, x1 = kant === 'links' ? bx + brx : K.B - .02;
      // de slagschaduw eerst, anders ligt hij als een vlek op de voorkant
      contact(ctx, cam, (x0 + x1) / 2, bz, (x1 - x0) / 2, brz, .30);
      doos(ctx, cam, x0, x1, 0, bh, bz - brz, bz + brz, pb.ombouw || '#d8d3ca', [1, .95, .88]);
      vulPad(ctx, cam, [[x0 + .06, bh + .002, bz - brz + .06], [x1 - .06, bh + .002, bz - brz + .06],
                        [x1 - .06, bh + .002, bz + brz - .06], [x0 + .06, bh + .002, bz + brz - .06]], '#f4f3f0');
      vulPad(ctx, cam, [[x0 + .12, bh, bz - brz + .12], [x1 - .12, bh, bz - brz + .12],
                        [x1 - .12, bh, bz + brz - .12], [x0 + .12, bh, bz + brz - .12]], '#e6e4df');
    } else {
      contact(ctx, cam, bx, bz, brx * 1.25, brz * 1.1, .40);
      var boven = ovaal(ctx, cam, bx, bz, brx, brz, bh, 44);
      var onder = ovaal(ctx, cam, bx, bz, brx * .82, brz * .86, .04, 44);
      if (boven.length && onder.length) {
        // De omtrek van de kuip is de omhullende van de rand en de voet samen.
        // Die twee ellipsen overlappen in beeld, dus de ene om de andere heen
        // trekken levert een ring op met een gat erin in plaats van een bad.
        var romp = omhullende(boven.concat(onder));
        ctx.beginPath();
        ctx.moveTo(romp[0][0], romp[0][1]);
        for (var i = 1; i < romp.length; i++) ctx.lineTo(romp[i][0], romp[i][1]);
        ctx.closePath();
        var bp = cam.punt([bx, bh / 2, bz]);
        var g = ctx.createLinearGradient(bp[0] - 90, 0, bp[0] + 90, 0);
        g.addColorStop(0, '#e7e4de'); g.addColorStop(.42, '#fbfaf7'); g.addColorStop(1, '#cfccc5');
        ctx.fillStyle = g; ctx.fill();
      }
      tekenOvaal(ctx, boven, '#f7f6f2', 'rgba(120,118,112,.5)');
      tekenOvaal(ctx, ovaal(ctx, cam, bx, bz, brx - .055, brz - .055, bh - .045, 44),
                 '#eceae4', 'rgba(150,148,142,.45)');
    }

    // Vrijstaande kraan aan de kant die naar het midden van de ruimte wijst,
    // met een uitloop over de rand heen — zonder die uitloop staat er alleen
    // een zwarte paal naast het bad.
    var soortKraan = (inr && inr.badkraan) || 'vloer';
    var kz = bz + brz * .70;
    if (soortKraan === 'vloer') {
      // Aan het kopeinde, tegen het bad aan — niet halverwege de lange zijde,
      // want daar staat hij midden in de looproute.
      var kx = kantX(K, kant, kantX(K, kant, bx) + brx + .10);
      // De uitloop moet over de rand héén reiken, dus naar het bad toe: bij een
      // bad rechts staat de kraan er links van en wijst de tuit naar rechts.
      var naarBad = kant === 'rechts' ? .20 : -.20;
      doos(ctx, cam, kx - .03, kx + .03, 0, .92, kz - .03, kz + .03, '#26272a', [1, .85, .7]);
      doos(ctx, cam, Math.min(kx, kx + naarBad), Math.max(kx, kx + naarBad),
           .88, .92, kz - .025, kz + .025, '#26272a', [1, .85, .7]);
    } else if (soortKraan === 'rand') {
      // badrandkraan: een lage uitloop op de rand zelf
      var rx = kantX(K, kant, kantX(K, kant, bx) - brx * .55);
      doos(ctx, cam, rx - .025, rx + .025, bh, bh + .16, kz - .025, kz + .025, '#26272a', [1, .85, .7]);
      var naarMidden = kant === 'rechts' ? -.15 : .15;
      doos(ctx, cam, Math.min(rx, rx + naarMidden), Math.max(rx, rx + naarMidden),
           bh + .12, bh + .16, kz - .02, kz + .02, '#26272a', [1, .85, .7]);
    }
  }

  /* ---- handdoek aan een haak in een zijwand ---- */
  function handdoek(ctx, cam, K, kant) {
    var x = kant === 'links' ? .02 : K.B - .02;
    var xb = kant === 'links' ? .06 : K.B - .06;
    doos(ctx, cam, Math.min(x, xb), Math.max(x, xb), 1.42, 1.46, 1.55, 1.75, '#25262a', [1, .8, .68]);
    var xd = kant === 'links' ? .05 : K.B - .05;
    vulPad(ctx, cam, [[xd, 1.44, 1.58], [xd, 1.44, 1.72], [xd, .82, 1.74], [xd, .82, 1.56]],
           'rgba(226,220,209,.95)');
  }

  /* Waar de nis zit hangt van de inrichting af. Hij komt in een zijwand, want
     in de achterwand zou hij achter de wastafel of het toilet verdwijnen. */
  function nissenVan(K, inr) {
    if (K.v !== 'badkamer') return [];
    var p = plaatsen(K, inr || {});
    return p.nis ? [p.nis] : [];
  }

  function nis(ctx, cam, K, n) {
    var z0 = n.z0, z1 = n.z1, y0 = n.y0, y1 = n.y1;
    var xw = n.wand === 'links' ? 0 : K.B;
    var xd = n.wand === 'links' ? n.diep : K.B - n.diep;
    ctx.save();
    // bovendagkant vangt geen licht, onderdagkant juist wel
    vulPad(ctx, cam, [[xw, y1, z0], [xw, y1, z1], [xd, y1, z1], [xd, y1, z0]], 'rgba(20,18,15,.58)');
    vulPad(ctx, cam, [[xw, y0, z0], [xw, y0, z1], [xd, y0, z1], [xd, y0, z0]], 'rgba(255,252,244,.34)');
    // de twee verticale dagkanten
    vulPad(ctx, cam, [[xw, y0, z0], [xw, y1, z0], [xd, y1, z0], [xd, y0, z0]], 'rgba(24,22,18,.20)');
    vulPad(ctx, cam, [[xw, y0, z1], [xw, y1, z1], [xd, y1, z1], [xd, y0, z1]], 'rgba(24,22,18,.14)');
    // slagschaduw net binnen de opening
    var op = [[xw, y0, z0], [xw, y0, z1], [xw, y1, z1], [xw, y1, z0]];
    if (pad(ctx, cam, op)) {
      ctx.strokeStyle = 'rgba(20,18,15,.30)'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- toilet ---------- */

  /* Het toilet voegt zich naar de maat, net als de badkamer. Stonden hier vaste
     getallen, dan schoof de pot bij een smalle ruimte over het fonteintje heen
     en bleef er bij een brede ruimte een gat in het midden staan — en wie dat
     ziet, gelooft de rest van het beeld ook niet meer.

     De pot en het fonteintje verdelen de achterwand: de pot heeft 0,38 m nodig
     en het fonteintje 0,42 m, met wat lucht ertussen. Past dat niet naast
     elkaar, dan gaat het fonteintje naar de zijwand. */
  function meubelWc(ctx, cam, K, inr) {
    var B = K.B, D = K.D, Hg = K.Hg;
    var w = D - .012;
    var kant = (inr && inr.toilet === 'rechts') ? 'rechts' : 'links';
    var potB = .38, fonteinB = .42, lucht = .12;
    var samen = B >= potB + fonteinB + lucht * 2;

    // De pot staat op zijn helft; is er geen ruimte voor twee, dan in het midden.
    var mx = samen
      ? (kant === 'links' ? potB / 2 + lucht : B - potB / 2 - lucht)
      : B * .5;
    // Het fonteintje op de andere helft, tegen de hoek aan.
    var fx = samen
      ? (kant === 'links' ? B - fonteinB / 2 - lucht : fonteinB / 2 + lucht)
      : null;

    // voorzetwand met inbouwreservoir
    doos(ctx, cam, .08, B - .08, 0, 1.05, D - .24, D, '#e2ded6', [1, .965, .90]);
    // bedieningsplaat
    var pl = [[mx - .13, .84, D - .245], [mx + .13, .84, D - .245],
              [mx + .13, .99, D - .245], [mx - .13, .99, D - .245]];
    vulPad(ctx, cam, pl, '#f5f4f1');
    ctx.save(); ctx.strokeStyle = 'rgba(120,118,112,.55)'; ctx.lineWidth = 1.4;
    if (pad(ctx, cam, pl)) ctx.stroke(); ctx.restore();

    // zwevende pot
    var pz0 = D - .80, pz1 = D - .24;
    ctx.save();
    vulPad(ctx, cam, [[mx - .22, .30, D - .243], [mx + .22, .30, D - .243],
                      [mx + .22, .60, D - .243], [mx - .22, .60, D - .243]], 'rgba(0,0,0,.16)');
    ctx.restore();
    doos(ctx, cam, mx - .19, mx + .19, .38, .57, pz0, pz1, '#f7f6f3', [1, .94, .86]);
    tekenOvaal(ctx, ovaal(ctx, cam, mx, (pz0 + pz1) / 2 - .03, .175, .245, .575, 34),
               '#fcfbf9', 'rgba(120,118,112,.4)');
    tekenOvaal(ctx, ovaal(ctx, cam, mx, (pz0 + pz1) / 2 - .03, .115, .175, .570, 30), '#e9e7e2');
    contact(ctx, cam, mx, pz1 - .35, .30, .34, .22);

    // Fonteintje op de voorzetwand — die is hier de wastafelbank. Alleen als de
    // wand breed genoeg is voor pot én fonteintje naast elkaar.
    if (fx !== null) {
      doos(ctx, cam, fx - .21, fx + .21, 1.05, 1.17, D - .245, w, '#f8f7f4', [1, .945, .87]);
      tekenOvaal(ctx, ovaal(ctx, cam, fx, D - .13, .14, .085, 1.171, 28), '#ebeae5', 'rgba(130,128,122,.35)');
      doos(ctx, cam, fx - .025, fx + .025, 1.19, 1.36, w - .05, w - .01, '#25262a', [1, .8, .68]);
      doos(ctx, cam, fx - .025, fx + .025, 1.32, 1.36, w - .18, w - .01, '#25262a', [1, .8, .68]);
      // spiegeltje erboven
      var sp = [[fx - .22, 1.52, w], [fx + .22, 1.52, w], [fx + .22, 2.02, w], [fx - .22, 2.02, w]];
      if (pad(ctx, cam, sp)) {
        var a = cam.punt([fx - .22, 2.02, w]), b = cam.punt([fx + .22, 1.52, w]);
        var g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
        g.addColorStop(0, 'rgba(96,106,112,.6)'); g.addColorStop(1, 'rgba(74,82,88,.66)');
        ctx.fillStyle = g; ctx.fill();
      }
    }

    // De rolhouder komt aan de zijwand naast de pot, binnen handbereik: dat is
    // de wand waar de pot tegenaan staat, niet altijd de rechterwand.
    var rw = (kant === 'links') ? 0 : B;
    var rt = (kant === 'links') ? 1 : -1;
    doos(ctx, cam, Math.min(rw + rt * .03, rw + rt * .07), Math.max(rw + rt * .03, rw + rt * .07),
         .74, .78, Math.max(.10, D - 1.05), Math.max(.28, D - .88), '#25262a', [1, .8, .68]);
    tekenOvaal(ctx, ovaal(ctx, cam, rw + rt * .12, Math.max(.19, D - .965), .058, .058, .755, 22), '#f3f1ed');
  }
  /* De randen van de ruimte: een dunne lichte lijn waar wand en vloer elkaar
     raken, zodat het beeld niet uit elkaar valt. */
  function kamerRanden(ctx, cam, K) {
    var B = K.B, D = K.D;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1.2;
    [[[0, 0, 0], [0, 0, D]], [[B, 0, 0], [B, 0, D]], [[0, 0, D], [B, 0, D]]].forEach(function (l) {
      var a = cam.punt(l[0]), b = cam.punt(l[1]);
      if (a && b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    });
    ctx.restore();
  }

  function randlicht(ctx, W, H) {            // zachte vignettering
    var gr = ctx.createRadialGradient(W * .42, H * .34, H * .12, W * .5, H * .5, H * 1.15);
    gr.addColorStop(0, 'rgba(255,255,255,.05)');
    gr.addColorStop(.6, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,.40)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  }
  /* ---------- wat de buitenwereld mag ---------- */

  window.NGTegelBeeld = {
    vlak: tekenVlak,
    woonkamer: tekenWoonkamer,
    kamer: tekenKamer,
    laadFoto: laadFoto,
    fotoKlaar: function () { return fotoKlaar; },
    KAMERS: { badkamer: BAD, wc: WC },
    maat: function () { return { b: canvasBreed, h: canvasHoog }; },
    /* Een enkele tegel op een eigen canvas — voor de swatches in de keuzelijst. */
    swatch: tekenSwatch,
    /* Een vlak van een gegeven maat in meters, recht van voren, als textuur voor
       de 3D-weergave. Bewust géén herhalend lapje: het gezicht van een tegel
       wordt per tegel gehusseld en dat is niet periodiek, dus een lapje dat je
       herhaalt geeft zichtbare naden. Eén textuur per wand is een paar honderd
       beeldpunten en dan begint het voegraster ook in de goede hoek. */
    textuur: tekenTextuur,
    /* Past dit product in deze ruimte? null als het past, anders de reden. */
    past: past,
    /* Waar alles komt te staan, in meters. Alleen om na te rekenen: een
       voorzetwand die in de douche hangt zie je op een klein beeld niet, maar
       in deze getallen wel. */
    plaatsing: function (K, inr) { return plaatsen(K, inr || {}); }
  };
})();
