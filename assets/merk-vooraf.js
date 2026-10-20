/* Draait in de <head>, vóór er iets getekend is. Staat er ?bedrijf= in de
 * adres, dan krijgt de bezoeker niet eerst onze donkere pagina te zien
 * terwijl merk.js het bedrijfsbestand nog ophaalt: de pagina blijft wit
 * tot de huisstijl erop staat (merk-thema.css, merk.js haalt dit weg). */
(function () {
  try {
    if (/[?&]bedrijf=/.test(location.search)) document.documentElement.setAttribute('data-merk-laden', '');
  } catch (e) { /* niets: dan gewoon het oude gedrag */ }
})();
