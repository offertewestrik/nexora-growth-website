/* ============================================================
   NEXT GROWTH V2 — core.js
   Snappy en subtiel. Alleen transform/opacity, 60fps.
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveals ----------
     De drempel is bewust 0 en geen percentage. Een percentage lijkt netter —
     "toon hem pas als er een stukje in beeld staat" — maar het is een breuk
     van het élement, niet van het scherm. Bij een element dat hoger is dan
     het venster is die breuk onhaalbaar: 6% van een configurator van 15.896 px
     is 954 px, en dat past niet in een venster van 900. De waarnemer vuurt dan
     nooit, .is-in wordt nooit gezet, en het CSS-regeltje dat hem verbergt
     blijft staan. Resultaat: een pagina die volledig gevuld is en toch zwart.

     Het uitstel dat we wilden zit al in rootMargin: die krimpt de onderkant
     van het venster met 6%, en dat is een percentage van het scherm en dus
     altijd haalbaar, hoe lang de pagina ook wordt. */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- tellende cijfers ----------
     Het echte getal staat in de HTML, geen nul. Dat is geen detail: de
     tellers dragen het bewijs van de site - +212% aanvragen, 100 op
     Lighthouse, 2,3x omzet. Met <span data-count="212">0</span> is nul wat
     er staat zodra er niet geanimeerd wordt, en dat gebeurt vaker dan het
     lijkt: zonder JavaScript, in de weergave van een antwoordmachine die de
     pagina wel rendert maar niet scrolt, en op een schermafdruk van een blok
     dat nooit halverwege in beeld kwam. Precies daar waar we bewijzen stond
     dus een nul.

     Daarom telt de animatie nu op naar het getal dat er al staat, en pas
     nadat de bezoeker zelf gescrold heeft. Wie niet scrolt - een crawler, een
     schermafdruk, iemand met prefers-reduced-motion - houdt het juiste
     cijfer. scripts/tellers.py zet de tekst gelijk aan data-count en
     controle.py telt na of dat zo gebleven is. */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function telDoel(el) {
    var raw = el.getAttribute('data-count');
    var getal = parseFloat(raw);
    if (!isFinite(getal)) return null;
    return { getal: getal, decimalen: (String(raw).split('.')[1] || '').length };
  }

  function telSchrijf(el, waarde, decimalen) {
    el.textContent = waarde.toFixed(decimalen).replace('.', ',');
  }

  function telLoop(el) {
    var d = telDoel(el);
    if (!d) return;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1100, 1);
      telSchrijf(el, d.getal * (1 - Math.pow(1 - p, 3)), d.decimalen);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function telInBeeld(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
  }

  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    /* Op nul zetten gebeurt bij de eerste scroll, niet bij het laden. Wat al
       in beeld staat is al gelezen en blijft staan; de rest gaat pas op nul
       als er iemand is die hem omhoog ziet lopen. */
    var telScherp = false;
    window.addEventListener('scroll', function () {
      if (telScherp) return;
      telScherp = true;
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { telLoop(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) {
        if (telInBeeld(el)) return;
        var d = telDoel(el);
        if (d) telSchrijf(el, 0, d.decimalen);
        cio.observe(el);
      });
    }, { passive: true });
  }

  /* ---------- hero-tilt: scroll-gekoppeld opzetten (niet op mobiel) ---------- */
  var tilts = Array.prototype.slice.call(document.querySelectorAll('.app--tilt'));
  if (tilts.length && !reduceMotion && window.innerWidth > 720) {
    var tiltTick = false;
    function paintTilt() {
      tiltTick = false;
      var vh = window.innerHeight;
      tilts.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        // 14deg wanneer de bovenkant onderin beeld staat, 2deg rond het midden
        var p = Math.min(Math.max((vh * 0.85 - r.top) / (vh * 0.55), 0), 1);
        var deg = 14 - 12 * p;
        var sc = 0.98 + 0.02 * p;
        el.style.transform = 'perspective(1400px) rotateX(' + deg.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
      });
    }
    function queueTilt() { if (!tiltTick) { tiltTick = true; requestAnimationFrame(paintTilt); } }
    window.addEventListener('scroll', queueTilt, { passive: true });
    window.addEventListener('resize', queueTilt, { passive: true });
    queueTilt();
  }

  /* ---------- cursor-aware spotlight op kaarten en app-frames ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest ? e.target.closest('.card--hover, .app') : null;
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      t.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    }, { passive: true });
  }

  /* ---------- flow-stappen sequentieel activeren ---------- */
  var flows = document.querySelectorAll('.flow-steps');
  if (flows.length) {
    flows.forEach(function (fl) {
      var i = 0;
      fl.querySelectorAll('.flow-step, .flow-verbinder').forEach(function (el) {
        if (el.classList.contains('flow-step')) i++;
        el.style.setProperty('--fi', i - 1);
      });
    });
    if ('IntersectionObserver' in window && !reduceMotion) {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-run'); fio.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      flows.forEach(function (fl) { fio.observe(fl); });
    } else {
      flows.forEach(function (fl) { fl.classList.add('is-run'); });
    }
  }

  /* ---------- video's: afspelen wanneer zichtbaar ---------- */
  var vids = document.querySelectorAll('video[data-autoplay]');
  if (vids.length && 'IntersectionObserver' in window && !reduceMotion) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.play().catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- nav-status ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobiel menu ---------- */
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      links.classList.toggle('is-open', open);
      if (open && nav) nav.classList.add('is-scrolled');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        burger.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      }
    });
  }
})();

/* ---------- bescherming van het beeldmateriaal ----------
   Eerlijk is eerlijk: wat een browser kan tonen, kan een vastberaden bezoeker
   ook bemachtigen. Dit is dus een drempel tegen achteloos rechtsklik-kopiëren
   van renders en ontwerpen, geen slot. De echte bescherming is juridisch en
   staat op auteursrecht.html. Tekst selecteren en kopiëren blijft gewoon
   werken: wie een telefoonnummer wil overnemen, mag dat. */
(function () {
  'use strict';
  var opBeeld = function (e) {
    var t = e.target;
    return t && (t.tagName === 'IMG' || t.tagName === 'VIDEO' || (t.closest && t.closest('#doek')));
  };
  document.addEventListener('contextmenu', function (e) { if (opBeeld(e)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (opBeeld(e)) e.preventDefault(); });
  try {
    console.log('%c© Next Growth. Alle inhoud van deze site is auteursrechtelijk beschermd.',
      'color:#FFC400;font-weight:bold');
    console.log('Gebruik zonder schriftelijke toestemming is niet toegestaan: https://nextgrowthdigital.nl/auteursrecht');
  } catch (e) { /* console kan ontbreken; dan gewoon door */ }
})();
