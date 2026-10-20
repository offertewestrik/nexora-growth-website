(function (global) {
  'use strict';
  function vanToepassing(s) { return s && (s.type === 'uitbouw' || s.type === 'aanbouw'); }
  // Use the same facade segments and wall build-up as the technical drawing.
  function maximalePui(s) {
    if (!vanToepassing(s)) return Infinity;
    if (!global.NGBouwkundig || !global.NGBouwAanzichten) return null;
    var d = global.NGBouwAanzichten.lees(s, global.NGBouwkundig.model(s));
    var bands = global.NGBouwvormen.banden(d.vorm.punten, 'y');
    var front = bands.filter(function (b) { return b.voorste; })[0];
    if (!front && bands.length) {
      var furthest = Math.max.apply(null, bands.map(function (b) { return b.diepte; }));
      front = bands.filter(function (b) { return b.diepte === furthest; })[0];
    }
    var width = front ? front.tot - front.van : d.w;
    return Math.max(0, Math.floor((width - 2 * (d.wandDikte || .3) - .1 + 1e-8) * 100) / 100);
  }
  function past(s, value) {
    if (!vanToepassing(s) || !value || value === 'none') return true;
    var cm = /-(\d{3})$/.exec(value), max = maximalePui(s);
    return !cm || (max !== null && Number(cm[1]) / 100 <= max + 1e-8);
  }
  function prijsTekst(amount, inclusive, rate, locale) {
    return new Intl.NumberFormat(locale || 'nl-NL', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(amount * (inclusive ? 1 + rate : 1));
  }
  global.NGAanbouwRegels = { maximalePui: maximalePui, past: past, vanToepassing: vanToepassing, prijsTekst: prijsTekst };
})(typeof window !== 'undefined' ? window : globalThis);
