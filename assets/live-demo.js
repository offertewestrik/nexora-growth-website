/* ============================================================
   NEXT GROWTH — live-demo.js
   Een app-mockup die zichzelf afspeelt.

   Een demo die stilstaat leest als een plaatje; een demo die zichzelf
   afspeelt leest als een systeem. Dit script doet niets anders dan
   wachten en tikken, in de goede volgorde, en weer stoppen als de
   bezoeker een ander scenario kiest.

   Gebruik:
     var demo = NGLive.maak();
     demo.startBijZicht(venster, async function (s) {
       await s.wacht(800);
       await s.tik(el, 'Tekst die letter voor letter verschijnt');
     });

   `s.wacht` en `s.tik` gooien NGLive.STOP zodra `demo.stop()` of een
   nieuwe `demo.start()` is aangeroepen; het scenario valt dan vanzelf
   uit zijn lus. Met prefers-reduced-motion wachten ze niet en staat
   meteen het eindbeeld. Zonder JS staat het eindbeeld ook: elk element
   staat al in de HTML en het scenario haalt alleen `hidden` weg.
   ============================================================ */
(function () {
  'use strict';

  var STOP = { stop: true };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function maak() {
    var token = null;

    function nieuwToken() {
      if (token) token.dood = true;
      token = { dood: false };
      return token;
    }

    function sessie(t) {
      var s = {
        reduce: reduce,
        /* Wachten — of niet, bij reduced motion. Altijd asynchroon, zodat
           een scenario zonder wachttijden toch niet in één ruk de hele
           pagina blokkeert. */
        wacht: function (ms) {
          return new Promise(function (ok, nee) {
            if (t.dood) return nee(STOP);
            if (reduce) return Promise.resolve().then(function () { t.dood ? nee(STOP) : ok(); });
            setTimeout(function () { t.dood ? nee(STOP) : ok(); }, ms);
          });
        },
        /* Tikken: tekst letter voor letter in een element. Spaties en
           leestekens krijgen iets meer tijd, dat leest als typen en niet
           als een teletekstpagina. */
        tik: function (el, tekst, perLetter) {
          perLetter = perLetter || 22;
          el.textContent = '';
          if (reduce) { el.textContent = tekst; return s.wacht(0); }
          return new Promise(function (ok, nee) {
            var i = 0;
            (function stap() {
              if (t.dood) return nee(STOP);
              if (i >= tekst.length) return ok();
              el.textContent += tekst[i];
              var c = tekst[i++];
              setTimeout(stap, /[.,!?:]/.test(c) ? perLetter * 5 : c === ' ' ? perLetter * 1.6 : perLetter);
            })();
          });
        },
        toon: function (el) { if (el) el.hidden = false; },
        verberg: function (el) { if (el) el.hidden = true; },
        leeft: function () { return !t.dood; },
      };
      return s;
    }

    function start(scenario) {
      var t = nieuwToken();
      var s = sessie(t);
      return Promise.resolve()
        .then(function () { return scenario(s); })
        .catch(function (e) { if (e !== STOP) throw e; });
    }

    function stop() { if (token) token.dood = true; }

    /* Pas beginnen als het venster in beeld is: een demo die boven de
       vouw al klaar is voordat iemand scrolt, is een demo die niemand
       zag beginnen. */
    function startBijZicht(el, scenario) {
      if (!('IntersectionObserver' in window) || reduce) return start(scenario);
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          io.disconnect();
          start(scenario);
        }
      }, { threshold: 0.25 });
      io.observe(el);
    }

    return { start: start, stop: stop, startBijZicht: startBijZicht, reduce: reduce };
  }

  window.NGLive = { maak: maak, STOP: STOP };
})();
