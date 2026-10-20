/* Videobank van de jachtpagina's — GEGENEREERD BESTAND.
 *
 * Niet met de hand bijwerken: dit komt uit tools/jacht-videolijst.cjs, dat
 * controleert welke bestanden er werkelijk in assets/media/jacht/video/ staan.
 *
 * kies() geeft alleen een video terug als er ook een poster naast ligt. Een
 * video zonder poster levert namelijk een zwart gat op zolang hij laadt, en
 * dat is slechter dan de tekening die er nu staat.
 *
 * Stand: 7 van 7 plekken hebben video.
 */
(function (global) {
  'use strict';

  var BASIS = './assets/media/';
  var BANK = [{"id":"hero","mp4":"jacht/video/hero.mp4","webm":"jacht/video/hero.webm","poster":"jacht/video/hero.jpg"},{"id":"hero-nacht","mp4":"jacht/video/hero-nacht.mp4","webm":"jacht/video/hero-nacht.webm","poster":"jacht/video/hero-nacht.jpg"},{"id":"scene-beeld","mp4":"jacht/video/scene-beeld.mp4","webm":"jacht/video/scene-beeld.webm","poster":"jacht/video/scene-beeld.jpg"},{"id":"scene-interieur","mp4":"jacht/video/scene-interieur.mp4","webm":"jacht/video/scene-interieur.webm","poster":"jacht/video/scene-interieur.jpg"},{"id":"scene-rekenwerk","mp4":"jacht/video/scene-rekenwerk.mp4","webm":"jacht/video/scene-rekenwerk.webm","poster":"jacht/video/scene-rekenwerk.jpg"},{"id":"scene-twijfel","mp4":"jacht/video/scene-twijfel.mp4","webm":"jacht/video/scene-twijfel.webm","poster":"jacht/video/scene-twijfel.jpg"},{"id":"scene-licht","mp4":"jacht/video/scene-licht.mp4","webm":"jacht/video/scene-licht.webm","poster":"jacht/video/scene-licht.jpg"}];

  function kies(id) {
    for (var i = 0; i < BANK.length; i++) {
      var e = BANK[i];
      if (e.id !== id) continue;
      if (!e.mp4 || !e.poster) return null;
      return {
        mp4: BASIS + e.mp4,
        webm: e.webm ? BASIS + e.webm : null,
        poster: BASIS + e.poster
      };
    }
    return null;
  }

  function dekking() {
    var n = 0;
    for (var i = 0; i < BANK.length; i++) if (BANK[i].mp4 && BANK[i].poster) n++;
    return { aanwezig: n, totaal: BANK.length };
  }

  global.NGJachtVideo = { kies: kies, dekking: dekking };
})(typeof window !== 'undefined' ? window : globalThis);
