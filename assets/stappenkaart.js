/* Stappenkaart: één vraag per keer, zoals een advertentiebezoeker dat kent.
 *
 * Zonder dit staan alle keuzegroepen onder elkaar en het formulier ver
 * daaronder. Op een telefoon in een kader van 750 pixels betekent dat
 * scrollen, zoeken en afhaken. Met stapsgewijs: true in het bedrijfsbestand
 * (data-stapsgewijs op <html>) wordt de keuzekolom een kaart: bovenin een
 * voortgangsbalk, daaronder alleen de groep van nu, onderin Vorige en
 * Volgende. Na de laatste groep komt het aanvraagformulier als laatste stap
 * in dezelfde kaart, naast hetzelfde beeld.
 *
 * De configurator tekent #groups bij elke keuze opnieuw. Deze module houdt
 * daarom de huidige stap bij als groep-id en zet na elke nieuwe tekening de
 * juiste groep weer aan; van de rekenregels weet hij niets.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var opties = document.querySelector('.conf__options');
  var groepen = document.getElementById('groups');
  var offerte = document.getElementById('offerte');
  if (!opties || !groepen || !offerte) return;

  var FORM = '__formulier';
  /* De vier fases boven de kaart, zodat de bezoeker weet waar hij is en
     wat er nog komt. Een groep die hier niet staat telt mee als basis. */
  var FASES = [
    { id: 'basis', l: 'Basis' },
    { id: 'buiten', l: 'Buiten', g: ['material', 'facadeColor', 'kozijnindeling', 'kozijnAchter', 'frameColor', 'balustrade', 'roofing', 'skylight'] },
    { id: 'binnen', l: 'Binnen', g: ['indeling', 'elektra', 'finish', 'klimaat', 'isolatie', 'voorz', 'extras', 'fundering'] },
    { id: 'gegevens', l: 'Gegevens' }
  ];
  function faseVan(id) {
    if (id === FORM) return 'gegevens';
    for (var i = 1; i < 3; i++) if (FASES[i].g.indexOf(id) >= 0) return FASES[i].id;
    return 'basis';
  }
  var fasebalk = null;
  var volgorde = null;
  var ADVIES = [], slug = '';
  if (window.NGMerk) NGMerk.klaar(function (m) {
    if (Array.isArray(m.stappen)) volgorde = m.stappen;
    if (Array.isArray(m.advies)) ADVIES = m.advies;
    slug = m.slug || '';
    if (gebouwd) toon();
  });
  var plattegrond = null, overslaan = null, bewaar = null, bewaarGetoond = false, gemeten = {};
  /* Metingen: welke stap wordt bereikt, waar haakt men af. Gaat naar de
     analytics van onze site (meting.js) en, als de configurator op de site
     van het bedrijf staat, ook als bericht naar die pagina, zodat hun eigen
     Google Tag Manager kan meetellen. Geen persoonsgegevens. */
  function meet(naam, data) {
    data = data || {}; data.bedrijf = slug;
    try { if (window.NGMeting) NGMeting.gebeurtenis(naam, data); } catch (e) { /* meten breekt nooit iets */ }
    try { if (window.parent !== window) window.parent.postMessage({ bron: 'ng-configurator', gebeurtenis: naam, data: data }, '*'); } catch (e) { /* idem */ }
  }
  var huidig = null, gebouwd = false, nav, volgende, vorige, balk, label;

  function knop(cls, tekst) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = tekst;
    return b;
  }

  function bouw() {
    if (gebouwd) return;
    gebouwd = true;
    var kop = document.createElement('div');
    kop.className = 'stap__kop';
    balk = document.createElement('div');
    balk.className = 'stap__balk';
    balk.setAttribute('role', 'progressbar');
    balk.setAttribute('aria-valuemin', '0');
    balk.setAttribute('aria-valuemax', '100');
    balk.appendChild(document.createElement('i'));
    label = document.createElement('span');
    label.className = 'stap__nr';
    label.setAttribute('aria-live', 'polite');
    fasebalk = document.createElement('ol');
    fasebalk.className = 'stap__fases';
    fasebalk.innerHTML = FASES.map(function (f, i) {
      return '<li><button type="button" data-fase="' + f.id + '"><span>' + (i + 1) + '</span>' + f.l + '</button></li>';
    }).join('');
    fasebalk.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fase]'); if (!b) return;
      var f = b.getAttribute('data-fase'), ids = lijst();
      for (var i = 0; i < ids.length; i++) if (faseVan(ids[i]) === f) { naar(ids[i]); return; }
    });
    kop.appendChild(fasebalk);
    kop.appendChild(balk);
    kop.appendChild(label);
    opties.insertBefore(kop, opties.firstChild);

    // Het formulier wordt de laatste stap in dezelfde kaart.
    offerte.classList.add('stap__formulier');
    offerte.removeAttribute('data-reveal');
    opties.appendChild(offerte);

    /* Bij de indeling en de elektra: de plattegrond, in de stap zelf. De
       tekening staat op een breed scherm waar anders de foto staat; op een
       telefoon in de kaart, boven de knoppen. Zie assets/plattegrond.js. */
    if (window.NGPlattegrond) {
      plattegrond = { tekening: document.createElement('div'), bediening: document.createElement('div') };
      plattegrond.tekening.className = 'pl stap__tekening';
      plattegrond.bediening.className = 'pl stap__bediening';
      opties.insertBefore(plattegrond.bediening, offerte);
      opties.insertBefore(plattegrond.tekening, plattegrond.bediening);
      groepen.addEventListener('change', function () { setTimeout(function () { NGPlattegrond.synchroniseer(); }, 0); });
    }

    /* "Sla over": voor wie snel wil. Het bedrijf adviseert dan. */
    overslaan = knop('stap__overslaan', '');
    overslaan.addEventListener('click', function () {
      var st = window.NGKeuze && NGKeuze(); if (st) { st.advies = st.advies || {}; st.advies[huidig] = true; }
      meet('configurator_overslaan', { stap: huidig });
      ga(1);
    });
    groepen.addEventListener('change', function () {
      var st = window.NGKeuze && NGKeuze(); if (st && st.advies) delete st.advies[huidig];
    });
    opties.insertBefore(overslaan, offerte);

    /* Tussentijds bewaren: eenmalig, halverwege. */
    bewaar = document.createElement('form');
    bewaar.className = 'stap__bewaar'; bewaar.hidden = true; bewaar.noValidate = true;
    bewaar.innerHTML = '<b>Je ontwerp bewaren?</b><span>Vul je e-mail in, dan ontvang je een bevestiging en kijken we met je mee.</span>'
      + '<div class="stap__bewaar-rij"><input type="email" required autocomplete="email" placeholder="jouw@email.nl" aria-label="E-mailadres"><button type="submit" class="btn btn--acc">Bewaar</button></div>'
      + '<button type="button" class="stap__bewaar-nee">Nee, bedankt</button><p class="stap__bewaar-msg" hidden></p>';
    bewaar.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = bewaar.querySelector('input'), msg = bewaar.querySelector('.stap__bewaar-msg');
      if (!inp.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)) { inp.focus(); inp.setAttribute('aria-invalid', 'true'); return; }
      bewaar.querySelector('[type=submit]').disabled = true;
      (window.NGTussentijds ? NGTussentijds(inp.value) : Promise.resolve(false)).then(function (ok) {
        meet('configurator_bewaard', { stap: huidig, gelukt: ok ? 1 : 0 });
        msg.hidden = false;
        msg.textContent = ok ? 'Bewaard! Je kunt gewoon verder gaan.' : 'Dat lukte niet. Ga gerust verder; aan het eind kun je alles versturen.';
        setTimeout(function () { bewaar.hidden = true; }, 3500);
      });
    });
    bewaar.querySelector('.stap__bewaar-nee').addEventListener('click', function () { bewaar.hidden = true; meet('configurator_bewaren_nee', {}); });
    opties.insertBefore(bewaar, offerte);

    nav = document.createElement('div');
    nav.className = 'stap__nav';
    vorige = knop('btn btn--ghost stap__vorige', '← Vorige');
    volgende = knop('btn btn--acc stap__volgende', 'Volgende →');
    nav.appendChild(vorige);
    nav.appendChild(volgende);
    opties.appendChild(nav);

    volgende.addEventListener('click', function () { ga(1); });
    vorige.addEventListener('click', function () { ga(-1); });
    // De oude knoppen naar het formulier springen nu naar de laatste stap.
    ['naarOfferte'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', function (e) { e.stopImmediatePropagation(); naar(FORM); }, true);
    });
  }

  function lijst() {
    var ids = Array.prototype.filter.call(groepen.querySelectorAll('.grp[data-g]'), function (g) {
      return !g.classList.contains('grp--uit');
    }).map(function (g) { return g.getAttribute('data-g'); });
    /* De volgorde uit het bedrijfsbestand, niet die van de pagina: zo kan
       een bedrijf eerst alle buitenkeuzes en dan pas de binnenkant vragen. */
    if (volgorde) ids.sort(function (a, b) {
      var x = volgorde.indexOf(a), y = volgorde.indexOf(b);
      return (x < 0 ? 999 : x) - (y < 0 ? 999 : y);
    });
    ids.push(FORM);
    return ids;
  }

  function toon() {
    if (!gebouwd) return;
    var ids = lijst();
    if (ids.indexOf(huidig) === -1) huidig = ids[0];
    var i = ids.indexOf(huidig), n = ids.length;
    Array.prototype.forEach.call(groepen.querySelectorAll('.grp[data-g]'), function (g) {
      g.classList.toggle('is-stap', g.getAttribute('data-g') === huidig);
    });
    var form = huidig === FORM;
    offerte.classList.toggle('is-stap', form);
    groepen.hidden = form;
    var pct = Math.round((i + 1) / n * 100);
    balk.firstChild.style.width = pct + '%';
    balk.setAttribute('aria-valuenow', String(pct));
    var kopje = groepen.querySelector('.grp.is-stap .grp__h');
    var naam = kopje ? kopje.textContent.replace(/^[\s\d.+]*/, '').trim().toLowerCase() : '';
    naam = naam.charAt(0).toUpperCase() + naam.slice(1);
    label.textContent = form ? 'Laatste stap: je gegevens' : 'Stap ' + (i + 1) + ' van ' + n + (naam ? ' · ' + naam : '');
    var fase = faseVan(huidig), voorbij = true;
    Array.prototype.forEach.call(fasebalk.querySelectorAll('[data-fase]'), function (b) {
      var f = b.getAttribute('data-fase'), nu = f === fase;
      if (nu) voorbij = false;
      b.classList.toggle('is-nu', nu);
      b.classList.toggle('is-klaar', voorbij && !nu);
      if (nu) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    vorige.hidden = i === 0;
    if (plattegrond) {
      var stand = huidig === 'indeling' ? 'ruimtes' : huidig === 'elektra' ? 'elektra' : null;
      if (stand) {
        var breed = window.matchMedia('(min-width: 900px)').matches;
        var waar = breed ? document.querySelector('.conf__visual') : opties;
        if (breed) { if (plattegrond.tekening.parentNode !== waar) waar.insertBefore(plattegrond.tekening, waar.firstChild); }
        else if (plattegrond.tekening.nextSibling !== plattegrond.bediening) opties.insertBefore(plattegrond.tekening, plattegrond.bediening);
        if (html.getAttribute('data-plan') !== stand) NGPlattegrond.stand(stand, plattegrond);
        html.setAttribute('data-plan', stand);
      } else html.removeAttribute('data-plan');
    }
    volgende.hidden = form;
    if (overslaan) {
      overslaan.hidden = form || ADVIES.indexOf(huidig) < 0;
      overslaan.textContent = 'Sla over: ' + ((window.NGMerk && NGMerk.merk().naam) || 'wij') + ' adviseert →';
    }
    if (bewaar && !bewaarGetoond && i >= 5 && !form) { bewaarGetoond = true; bewaar.hidden = false; meet('configurator_bewaren_getoond', { stap: huidig }); }
    if (!gemeten[huidig]) { gemeten[huidig] = 1; meet('configurator_stap', { stap: huidig, nr: i + 1, van: n }); }
    volgende.textContent = i === n - 2 ? 'Naar je offerte →' : 'Volgende →';
    nav.classList.toggle('is-eerste', i === 0);
  }

  /* Na een stapwissel de vraag in beeld. Op een breed scherm staat het
     beeld ernaast; op een telefoon staat het vast bovenin, dus de kaart
     gaat er direct onder. */
  function inBeeld() {
    var breed = window.matchMedia('(min-width: 900px)').matches;
    var beeld = document.querySelector('.conf__visual');
    var boven = breed || !beeld || html.hasAttribute('data-plan') ? 12 : beeld.getBoundingClientRect().height + 8;
    var r = opties.getBoundingClientRect();
    if (breed ? (r.top < 0 || r.top > window.innerHeight * 0.5) : Math.abs(r.top - boven) > 40) {
      window.scrollTo({ top: window.pageYOffset + r.top - boven, behavior: 'smooth' });
    }
  }

  /* Het grote beeld volgt de stap: bij binnenkeuzes het interieur, zodat
     de gekozen afwerking of airco meteen te zien is; bij buitenkeuzes de
     gevel. Zonder dit moest de bezoeker zelf op "Interieur" klikken. */
  var BINNEN = ['finish', 'klimaat', 'isolatie', 'extras', 'voorz'];
  function aanzicht(id) {
    if (window.NGStapBeeld) window.NGStapBeeld(id);
    var doel = BINNEN.indexOf(id) >= 0 ? 'int' : (id === 'indeling' || id === 'elektra' || id === FORM ? null : 'ext');
    if (!doel) return;
    var knop = document.querySelector('[data-aanzicht="' + doel + '"]');
    if (knop && !knop.classList.contains('is-on')) knop.click();
  }

  function naar(id) {
    huidig = id;
    toon();
    aanzicht(id);
    inBeeld();
    var doel = id === FORM ? document.getElementById('f_naam') : groepen.querySelector('.grp.is-stap .grp__h');
    if (doel) {
      if (id !== FORM) doel.setAttribute('tabindex', '-1');
      try { doel.focus({ preventScroll: true }); } catch (e) { /* oude browser */ }
    }
  }

  function ga(d) {
    var ids = lijst(), i = ids.indexOf(huidig) + d;
    if (i < 0 || i >= ids.length) return;
    naar(ids[i]);
  }

  function start() {
    if (!html.hasAttribute('data-stapsgewijs')) return;
    bouw();
    toon();
    if (window.NGStapBeeld) window.NGStapBeeld(huidig);
  }

  if (window.MutationObserver) {
    new MutationObserver(function () { if (gebouwd) toon(); }).observe(groepen, { childList: true });
    new MutationObserver(start).observe(html, { attributes: true, attributeFilter: ['data-stapsgewijs'] });
  }
  start();
})();
