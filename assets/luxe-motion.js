/* Beweging en videobeeld op de jachtpagina's.
 *
 * Twee taken, bewust in één bestand omdat ze dezelfde regel delen: beweging
 * is een aanbod, geen voorwaarde. Alles hier is optioneel — zet je het uit,
 * dan staat de pagina er nog steeds compleet en leesbaar.
 *
 *   1. Video's die het beeld overnemen zodra ze bestaan. De videobank
 *      (jacht-video.js) weet welke bestanden er staan. Zolang er niets is,
 *      blijft de getekende hero of het stilstaande beeld staan.
 *   2. Beweging bij het scrollen: onthullen, lichte parallax en een
 *      voortgangslijn.
 *
 * Regels die niet gebroken worden:
 *   - prefers-reduced-motion: geen enkele beweging, video's blijven op hun
 *     poster staan. Dat is geen degradatie maar de bedoelde weergave.
 *   - Video's spelen alleen als ze in beeld zijn en het tabblad zichtbaar is;
 *     een video die niemand ziet mag geen batterij kosten.
 *   - Nooit geluid. De video's worden muted geladen en krijgen geen knop om
 *     dat te veranderen.
 *   - Faalt het laden, dan valt de plek terug op wat er stond.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var stil = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- video's inhangen ---------- */

  /**
   * Vervangt de inhoud van een container door een achtergrondvideo, mits de
   * videobank er een heeft. Geeft true terug als dat gelukt is.
   * @param el container
   * @param id sleutel in de videobank ('hero', 'scene-licht', …)
   * @param opt { onder: Element die boven de video blijft staan }
   */
  function videoIn(el, id) {
    if (!el || !global.NGJachtVideo) return false;
    var v = global.NGJachtVideo.kies(id);
    if (!v) return false;

    var video = doc.createElement('video');
    video.className = 'lux-video';
    video.muted = true;            /* vóór autoplay zetten, anders weigert Safari */
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('aria-hidden', 'true');
    video.poster = v.poster;
    video.preload = 'metadata';
    if (v.webm) {
      var bw = doc.createElement('source');
      bw.src = v.webm; bw.type = 'video/webm';
      video.appendChild(bw);
    }
    var bm = doc.createElement('source');
    bm.src = v.mp4; bm.type = 'video/mp4';
    video.appendChild(bm);

    /* Gaat het laden mis, dan halen we de video weer weg en blijft staan wat
       er stond. Beter een tekening dan een zwart vlak. */
    video.addEventListener('error', function () {
      el.classList.remove('heeft-video');
      if (video.parentNode) video.parentNode.removeChild(video);
    });

    el.classList.add('heeft-video');
    el.insertBefore(video, el.firstChild);

    if (stil) return true;         /* poster blijft staan, niet afspelen */

    /* alleen spelen als hij in beeld is */
    var speelt = false;
    var probeer = function (aan) {
      if (aan && !speelt) { var p = video.play(); if (p && p.catch) p.catch(function () {}); speelt = true; }
      else if (!aan && speelt) { video.pause(); speelt = false; }
    };
    if (global.IntersectionObserver) {
      new IntersectionObserver(function (rijen) {
        rijen.forEach(function (r) { probeer(r.isIntersecting && !doc.hidden); });
      }, { rootMargin: '10%' }).observe(el);
    } else probeer(true);
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) probeer(false);
    });
    return true;
  }

  /* ---------- onthullen bij scrollen ---------- */

  function onthul() {
    var doelen = doc.querySelectorAll('.lux-op');
    if (!doelen.length) return;
    if (stil || !global.IntersectionObserver) {
      doelen.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    var oog = new IntersectionObserver(function (rijen) {
      rijen.forEach(function (r) {
        if (!r.isIntersecting) return;
        r.target.classList.add('is-in');
        oog.unobserve(r.target);
      });
    }, { rootMargin: '-8% 0px' });
    doelen.forEach(function (e) { oog.observe(e); });
  }

  /* ---------- lichte parallax op de scenebeelden ----------
     Vier procent verloop over de hele doorgang: net genoeg om diepte te
     suggereren, te weinig om op te vallen. Alles via transform, dus de
     browser hoeft niets opnieuw te berekenen aan de layout. */

  function parallax() {
    if (stil) return;
    var beelden = [].slice.call(doc.querySelectorAll('.lux-scene figure'));
    if (!beelden.length) return;
    beelden.forEach(function (f) { f.classList.add('lux-par'); });

    var bezig = false;
    function teken() {
      bezig = false;
      var h = global.innerHeight;
      beelden.forEach(function (f) {
        var r = f.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) return;
        var midden = (r.top + r.height / 2 - h / 2) / h;   /* -1 … 1 */
        var kind = f.firstElementChild;
        if (kind) kind.style.transform = 'translate3d(0,' + (midden * -18).toFixed(1) + 'px,0) scale(1.06)';
      });
    }
    function op() { if (!bezig) { bezig = true; global.requestAnimationFrame(teken); } }
    global.addEventListener('scroll', op, { passive: true });
    global.addEventListener('resize', op, { passive: true });
    teken();
  }

  /* ---------- voortgangslijn ----------
     Feadship zet een voortgangsindicator op zijn homepage; op een lange
     pagina met grote beelden helpt dat echt, want de bezoeker verliest
     anders zijn gevoel voor lengte. */

  function voortgang() {
    if (stil) return;
    var balk = doc.createElement('div');
    balk.className = 'lux-voortgang';
    balk.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(balk);
    var bezig = false;
    function teken() {
      bezig = false;
      var h = doc.documentElement.scrollHeight - global.innerHeight;
      balk.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, global.scrollY / h) : 0) + ')';
    }
    global.addEventListener('scroll', function () {
      if (!bezig) { bezig = true; global.requestAnimationFrame(teken); }
    }, { passive: true });
    teken();
  }

  function start() {
    onthul();
    parallax();
    voortgang();
  }

  global.NGLuxeMotion = { videoIn: videoIn, start: start, stil: stil };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})(window);
