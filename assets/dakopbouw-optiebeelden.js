/* Welke keuzetegels van de dakopbouw een eigen render hebben.
 *
 * Bijgehouden door tools/dakopbouw-optiebeelden-scan.py. Niet met de hand
 * wijzigen.
 *
 * De configurator leende zijn optiebeelden van de uitbouw: grondgebonden
 * aanbouwen met een tuin eromheen, terwijl een dakopbouw een verdieping op een
 * dak is. Wat hier in staat is vervangen door een eigen render; wat er niet in
 * staat valt terug op het oude beeld, en dat is beter dan een gebroken tegel.
 */
(function (global) {
  'use strict';
  var MAP = './assets/media/dakopbouw/opties/';
  var VOORVOEGSEL = {
    airco: 'klimaat',
    elektra: 'elektra',
    extras: 'extra',
    finish: 'afwerking',
    frameColor: 'kozijnkleur',
    fundering: 'fundering',
    skylight: 'licht',
    voorz: 'voorziening'
  };
  var EIGEN = {
    'airco': ['airco-multi', 'airco-single', 'none'],
    'elektra': ['lamp-punten-binnen', 'lamp-punten-buiten', 'meterkast', 'radiator', 'spotjes', 'stopcontact-buiten', 'stopcontacten-binnen'],
    'extras': ['dakraam', 'overstek-spotjes', 'rolluiken', 'screens', 'vloerverwarming'],
    'finish': ['casco', 'luxe', 'stuc'],
    'frameColor': ['antraciet', 'creme', 'wit', 'zwart'],
    'fundering': ['trap-bestaand', 'trap-nieuw'],
    'skylight': ['glasplaat-200', 'glasplaat-300', 'glasplaat-400', 'vakverdeling-200', 'vakverdeling-300', 'vakverdeling-400'],
    'voorz': ['apart-toilet', 'badkamer-basis', 'badkamer-compleet', 'inbouwkasten']
  };
  /* Het adres van het eigen beeld, of null als het er niet is. Nooit dat van
     een andere keuze: een koper die op champagnegoud klikt en brons ziet,
     denkt dat hij brons krijgt. */
  function beeld(groep, waarde) {
    var v = VOORVOEGSEL[groep];
    if (!v || !EIGEN[groep] || EIGEN[groep].indexOf(waarde) < 0) return null;
    return MAP + v + '-' + waarde + '.webp';
  }
  global.NGDakopbouwOptiebeelden = { beeld: beeld, EIGEN: EIGEN };
})(typeof window !== 'undefined' ? window : globalThis);
