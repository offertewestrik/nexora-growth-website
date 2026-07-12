/* ============================================================
   NEXT GROWTH V2 — core.js
   Snappy en subtiel. Alleen transform/opacity, 60fps.
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveals ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- tellende cijfers ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var decimals = (raw.split('.')[1] || '').length;
    if (reduceMotion) { el.textContent = target.toFixed(decimals).replace('.', ','); return; }
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1100, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals).replace('.', ',');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
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
