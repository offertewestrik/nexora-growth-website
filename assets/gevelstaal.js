/* Materiaalstaal van de gevelbekleding: een close-up van het gekozen
 * materiaal in de gekozen kleur, getekend als SVG. Geen foto nodig per
 * combinatie (materiaal × kleur), dus elke nieuwe kleur werkt meteen.
 *
 *   NGGevelstaal.svg(materiaal, hex)  -> SVG-tekst
 *   NGGevelstaal.url(materiaal, hex)  -> data-URL voor een <img>
 */
(function (global) {
  'use strict';

  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function hexRgb(h) { h = String(h || '#888').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function tint(h, f) { // f > 0 lichter, f < 0 donkerder
    var c = hexRgb(h).map(function (v) { return Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)); });
    return 'rgb(' + c.join(',') + ')';
  }

  var W = 800, H = 500;

  function defs(id, freqX, freqY, oct, alpha) {
    return '<filter id="' + id + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="' + freqX + ' ' + freqY + '" numOctaves="' + oct + '" seed="7"/>'
      + '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ' + alpha + ' 0"/></filter>';
  }
  function licht() { // zacht strijklicht van linksboven, maakt het tastbaar
    return '<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>';
  }

  function planken(hex, hout) {
    var s = '', r = rng(hout ? 31 : 17), ph = hout ? 92 : 110, y = 0, i = 0;
    while (y < H) {
      var f = (r() - .5) * (hout ? .16 : .05);
      s += '<rect x="0" y="' + y + '" width="' + W + '" height="' + ph + '" fill="' + tint(hex, f) + '"/>';
      if (hout) s += '<rect x="0" y="' + y + '" width="' + W + '" height="' + ph + '" filter="url(#nerf)" opacity=".9"/>';
      // schaduwgroef + lichte bovenrand: het profiel van een rabat/plank
      s += '<rect x="0" y="' + (y + ph - 9) + '" width="' + W + '" height="9" fill="' + tint(hex, -.55) + '"/>';
      s += '<rect x="0" y="' + (y + ph - 11) + '" width="' + W + '" height="2" fill="' + tint(hex, -.25) + '"/>';
      s += '<rect x="0" y="' + y + '" width="' + W + '" height="3" fill="' + tint(hex, .22) + '"/>';
      if (hout && i % 2) { var vx = 120 + r() * 520; s += '<rect x="' + vx + '" y="' + y + '" width="3" height="' + (ph - 9) + '" fill="' + tint(hex, -.45) + '"/>'; }
      y += ph; i++;
    }
    return s;
  }

  function steen(hex) {
    var s = '<rect width="' + W + '" height="' + H + '" fill="' + tint(hex, .55) + '"/>', r = rng(11), bh = 52, bw = 172, v = 11, y = 0, rij = 0;
    // voeg: licht grijs; stenen met kleurverloop per steen, halfsteensverband
    s = '<rect width="' + W + '" height="' + H + '" fill="#bdb6aa"/>';
    while (y < H) {
      var x = rij % 2 ? -bw / 2 : 0;
      while (x < W) {
        s += '<rect x="' + (x + v / 2) + '" y="' + (y + v / 2) + '" width="' + (bw - v) + '" height="' + (bh - v) + '" rx="2" fill="' + tint(hex, (r() - .5) * .28) + '"/>';
        x += bw;
      }
      y += bh; rij++;
    }
    return s + '<rect width="' + W + '" height="' + H + '" filter="url(#korrel)"/>';
  }

  function stuc(hex) {
    return '<rect width="' + W + '" height="' + H + '" fill="' + tint(hex, 0) + '"/><rect width="' + W + '" height="' + H + '" filter="url(#stucf)"/>';
  }

  function svg(materiaal, hex) {
    var body, d = '<defs>' + licht() + defs('nerf', '.004', '.09', 3, .28) + defs('korrel', '.9', '.9', 2, .22) + defs('stucf', '.55', '.55', 3, .30) + '</defs>';
    if (materiaal === 'metselwerk') body = steen(hex);
    else if (materiaal === 'stucwerk') body = stuc(hex);
    else if (materiaal === 'houtcomposiet') body = planken(hex, true);
    else body = planken(hex, false); // keralit en onbekend: strak kunststof rabat
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice">' + d + body
      + '<rect width="' + W + '" height="' + H + '" fill="url(#lg)"/></svg>';
  }

  /* Productbeelden per materiaal + kleur (gegenereerde materiaalvisualisaties,
     eigen beelden). Wat hier niet staat valt terug op de getekende staal. */
  var FOTO = ["houtcomposiet-antraciet-composiet", "houtcomposiet-donker-walnoot", "houtcomposiet-licht-eiken", "houtcomposiet-vergrijsd-hout", "houtcomposiet-warme-ceder", "houtcomposiet-zwart-composiet", "keralit-antraciet", "keralit-creme", "keralit-lichtgrijs", "keralit-taupe", "keralit-wit", "keralit-zwart", "stucwerk-antraciet", "stucwerk-creme", "stucwerk-lichtgrijs", "stucwerk-taupe", "stucwerk-wit", "stucwerk-zwart"];
  function foto(m, kleur) { var k = m + '-' + kleur; return kleur && FOTO.indexOf(k) >= 0 ? './assets/media/dakopbouw/staal/' + k + '.webp' : null; }
  global.NGGevelstaal = {
    svg: svg,
    foto: foto,
    url: function (m, hex, kleur) { return foto(m, kleur) || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(m, hex)); }
  };
})(window);
