/* plattegrond.html: de brochure bij een aanvraag. Alles komt uit de link
 * zelf (#p=...): de keuzes, het voorbeeldbeeld en de plattegrond. Er wordt
 * niets opgeslagen of verstuurd. Printen geeft een nette A4-pdf. */
(function () {
  'use strict';
  var blad = document.getElementById('blad');
  var PL = window.NGPlattegrond;
  var P = PL && PL.uitLink(location.hash);
  if (!P) { blad.innerHTML = '<p class="leeg">Deze link bevat geen ontwerp.</p>'; return; }
  if (P.kleur && /^#[0-9a-f]{3,8}$/i.test(P.kleur)) document.documentElement.style.setProperty('--acc', P.kleur);
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function veiligBeeld(u) { return /^https:\/\/[a-z0-9.-]+\/[^"'<>\s]*$/i.test(u || '') || /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/[^"'<>\s]*$/i.test(u || '') ? u : ''; }
  var naam = P.naam || '';
  if (naam) document.title = 'Brochure dakopbouw: ' + naam;
  var datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  var keuzes = (P.keuzes || []).map(function (r) {
    var i = r.indexOf(': ');
    return i > 0 ? '<tr><th>' + esc(r.slice(0, i)) + '</th><td>' + esc(r.slice(i + 2)) + '</td></tr>' : '<tr><td colspan="2">' + esc(r) + '</td></tr>';
  }).join('');
  var b1 = veiligBeeld(P.beeld), b2 = veiligBeeld(P.binnen);
  var beelden = (b1 || b2) ? '<div class="beelden' + (b1 && b2 ? '' : ' een') + '">' + (b1 ? '<img src="' + esc(b1) + '" alt="Voorbeeld van de gevel">' : '') + (b2 ? '<img src="' + esc(b2) + '" alt="Voorbeeld van de afwerking binnen">' : '') + '</div>' : '';

  var plan = '';
  if (!P.geenPlan) {
    var tekst = PL.samenvattingVan(P).split('\n').filter(function (r) { return r.indexOf('http') < 0; });
    var titel = tekst.shift();
    var leg = Object.keys(PL.PUNTEN).filter(function (t) { return P.punten.some(function (p) { return p.t === t; }); }).map(function (t) {
      var n = P.punten.filter(function (p) { return p.t === t; }).length;
      return '<span>' + PL.symbool(t) + esc(PL.PUNTEN[t].l) + ': ' + n + '</span>';
    }).join('');
    plan = '<section class="vel plan"><h2>Plattegrond</h2><p class="voet" style="margin-top:-.5rem">' + esc(titel.replace(/:$/, '')) + ' · voorgevel onderaan · maten in meters</p>'
      + '<div class="pl">' + PL.svg(P, { raster: false }) + '</div>'
      + '<div class="kolommen"><div class="kaart"><h3>Ruimtes en installatie</h3><ul>'
      + tekst.map(function (r) { return '<li>' + esc(r.replace(/^- /, '')) + '</li>'; }).join('') + '</ul></div>'
      + (leg ? '<div class="kaart"><h3>Legenda</h3><div class="legenda">' + leg + '</div></div>' : '') + '</div></section>';
  }

  blad.innerHTML =
    '<div class="balk"><span class="merk">' + esc(naam || 'Dakopbouw') + '</span><button class="print" type="button" id="print">Printen of opslaan als pdf</button></div>'
    + '<section class="vel voorblad"><h1>Ontwerp dakopbouw</h1><p class="sub">Samengesteld in de configurator op ' + esc(datum) + (naam ? ' · ' + esc(naam) : '') + '</p>' + beelden + '</section>'
    + (keuzes ? '<section class="vel"><h2>Gekozen opties</h2><table class="keuzes">' + keuzes + '</table></section>' : '')
    + plan
    + '<section class="vel voet"><p style="margin:0">Dit ontwerp is een indicatie op basis van de keuzes in de configurator. Beelden zijn voorbeelden; maatvoering, constructie en uitvoering worden bij het inmeten bevestigd'
    + (naam ? ' door ' + esc(naam) : '') + (P.tel ? ' (' + esc(P.tel) + ')' : '') + '.</p></section>';
  document.getElementById('print').addEventListener('click', function () { window.print(); });
})();
