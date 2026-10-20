/* Prijsdok: de prijs en de offerteknop blijven in beeld.
 *
 * De configurator heeft zestien keuzegroepen onder elkaar. Op een telefoon
 * staat de prijs daar duizenden pixels boven, en op een laag beeldscherm
 * schuift de vaste kolom met het voorbeeld en de prijs onder de rand. Wie
 * wil weten wat zijn keuze doet, moet dan terug naar boven. Dat is precies
 * het moment waarop iemand afhaakt.
 *
 * Dus: zodra de prijsbalk uit beeld is, verschijnt onderin een dok met het
 * huidige voorbeeld, de stap waar de bezoeker is, de prijs en de knop naar
 * het aanvraagformulier. Komt het formulier in beeld, dan gaat het dok weg.
 *
 * Het dok leest mee met de pagina (de prijs in #prijs, het beeld in
 * #confHero) en hoeft dus niets van de rekenregels te weten. Werkt op elke
 * configurator met dezelfde onderdelen: .conf, .pricebar, #prijs, #confHero,
 * #offerte en .grp met een .grp__h.
 */
(function () {
  'use strict';

  var conf = document.querySelector('.conf');
  var pricebar = document.querySelector('.pricebar');
  var prijs = document.getElementById('prijs');
  var hero = document.getElementById('confHero');
  var offerte = document.getElementById('offerte');
  if (!conf || !pricebar || !prijs || !offerte) return;

  var dok = document.createElement('div');
  dok.className = 'conf__dok';
  dok.setAttribute('role', 'region');
  dok.setAttribute('aria-label', 'Prijs en aanvraag');

  var beeld = document.createElement('button');
  beeld.type = 'button';
  beeld.className = 'conf__dok-beeld';
  beeld.setAttribute('aria-label', 'Terug naar het voorbeeld');
  var img = document.createElement('img');
  img.alt = '';
  beeld.appendChild(img);

  var tekst = document.createElement('div');
  tekst.className = 'conf__dok-tekst';
  var stap = document.createElement('span');
  stap.className = 'k';
  var bedrag = document.createElement('span');
  bedrag.className = 'v';
  tekst.appendChild(stap);
  tekst.appendChild(bedrag);

  var cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'btn btn--acc conf__dok-cta';
  cta.textContent = 'Offerte aanvragen';

  dok.appendChild(beeld);
  dok.appendChild(tekst);
  dok.appendChild(cta);
  document.body.appendChild(dok);

  beeld.addEventListener('click', function () {
    conf.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  cta.addEventListener('click', function () {
    offerte.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* Prijs en beeld overnemen zodra de pagina ze verandert. */
  function neemPrijs() {
    bedrag.textContent = document.documentElement.hasAttribute('data-geen-prijs')
      ? 'Gratis offerte op maat' : prijs.textContent;
  }
  function neemBeeld() {
    if (!hero) return;
    var src = hero.currentSrc || hero.src;
    if (src && img.src !== src) img.src = src;
    beeld.hidden = !src;
  }
  if (window.MutationObserver) {
    new MutationObserver(neemPrijs).observe(prijs, { childList: true, characterData: true, subtree: true });
    if (hero) new MutationObserver(neemBeeld).observe(hero, { attributes: true, attributeFilter: ['src'] });
  }

  /* In welke stap zit de bezoeker? De laatste keuzegroep waarvan de kop
     boven het midden van het scherm staat. */
  function neemStap() {
    var groepen = Array.prototype.filter.call(conf.querySelectorAll('.grp[data-g]'),
      function (g) { return g.offsetHeight > 0; });
    if (!groepen.length) { stap.textContent = 'Totaalprijs'; return; }
    var grens = window.innerHeight * 0.45, huidige = null, nr = 0;
    for (var i = 0; i < groepen.length; i++) {
      if (groepen[i].getBoundingClientRect().top <= grens) { huidige = groepen[i]; nr = i + 1; }
    }
    if (!huidige) { stap.textContent = 'Totaalprijs'; return; }
    var kop = huidige.querySelector('.grp__h');
    var titel = kop ? kop.textContent.replace(/^\s*\d+\.\s*/, '').trim().toLowerCase() : '';
    titel = titel.charAt(0).toUpperCase() + titel.slice(1);
    stap.textContent = nr + '/' + groepen.length + (titel ? ' · ' + titel : '');
  }

  /* Aan zodra de prijsbalk boven uit beeld is, uit zodra het formulier in
     beeld komt. Op onze eigen site staat op mobiel al een belbalk onderin;
     daar gaat het dok bovenop. */
  var aan = false, bezig = false;
  function peil() {
    bezig = false;
    var vh = window.innerHeight;
    var pb = pricebar.getBoundingClientRect();
    var of = offerte.getBoundingClientRect();
    var moet = pb.bottom < 0 && of.top > vh - 40;
    if (moet) {
      neemStap();
      var balk = document.querySelector('.ng-mobielbalk');
      var h = balk && balk.offsetHeight > 0 && getComputedStyle(balk).position === 'fixed' ? balk.offsetHeight : 0;
      dok.style.bottom = h ? h + 'px' : '';
    }
    if (moet !== aan) {
      aan = moet;
      dok.classList.toggle('is-aan', aan);
    }
  }
  function vraag() {
    if (bezig) return;
    bezig = true;
    window.requestAnimationFrame(peil);
  }
  window.addEventListener('scroll', vraag, { passive: true });
  window.addEventListener('resize', vraag);

  neemPrijs();
  neemBeeld();
  peil();
})();
