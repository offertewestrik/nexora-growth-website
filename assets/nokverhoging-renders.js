/* Assetregistry nokverhogingrenders — GEGENEREERD, niet met de hand bijwerken.
 *
 * Dezelfde opzet als dakkapel-renders.js: vijf indelingen maal zes
 * gevelafwerkingen maal vier kozijnkleuren, 120 combinaties, één woning en
 * één camera. Per beeld verandert alleen wat de bezoeker heeft gekozen.
 *
 * Wat er nog niet is, staat er ook niet: van de 120 zijn er 96 geleverd. De
 * overige 24 vallen in de configurator terug op de maatschets. `ontbrekend()`
 * in nokverhoging-regels.js rekent dat uit de registry uit, zodat de telling
 * meeloopt zodra er een render bij komt.
 */
(function (global) {
  'use strict';

  var PAD_COMBI = './assets/media/nokverhoging/combinaties/';
  var PAD_OPTIE = './assets/media/nokverhoging/opties/';

  /* 'glasvakken|gevel|kozijn' -> bestandspad onder PAD_COMBI */
  var COMBINATIES = {
    '2|creme|wit': '2-vaks/gevel-creme/kozijn-wit.webp',
    '2|creme|creme': '2-vaks/gevel-creme/kozijn-creme.webp',
    '2|creme|antraciet': '2-vaks/gevel-creme/kozijn-antraciet.webp',
    '2|creme|zwart': '2-vaks/gevel-creme/kozijn-zwart.webp',
    '2|lichtgrijs|wit': '2-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '2|lichtgrijs|creme': '2-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '2|lichtgrijs|antraciet': '2-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '2|lichtgrijs|zwart': '2-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '2|antraciet|wit': '2-vaks/gevel-antraciet/kozijn-wit.webp',
    '2|antraciet|creme': '2-vaks/gevel-antraciet/kozijn-creme.webp',
    '2|antraciet|antraciet': '2-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '2|antraciet|zwart': '2-vaks/gevel-antraciet/kozijn-zwart.webp',
    '2|zwart|wit': '2-vaks/gevel-zwart/kozijn-wit.webp',
    '2|zwart|creme': '2-vaks/gevel-zwart/kozijn-creme.webp',
    '2|zwart|antraciet': '2-vaks/gevel-zwart/kozijn-antraciet.webp',
    '2|zwart|zwart': '2-vaks/gevel-zwart/kozijn-zwart.webp',
    '2|thermowood|wit': '2-vaks/gevel-thermowood/kozijn-wit.webp',
    '2|thermowood|creme': '2-vaks/gevel-thermowood/kozijn-creme.webp',
    '2|thermowood|antraciet': '2-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '2|thermowood|zwart': '2-vaks/gevel-thermowood/kozijn-zwart.webp',
    '2|zink-platen|wit': '2-vaks/gevel-zink-platen/kozijn-wit.webp',
    '2|zink-platen|creme': '2-vaks/gevel-zink-platen/kozijn-creme.webp',
    '2|zink-platen|antraciet': '2-vaks/gevel-zink-platen/kozijn-antraciet.webp',
    '2|zink-platen|zwart': '2-vaks/gevel-zink-platen/kozijn-zwart.webp',
    '3|creme|wit': '3-vaks/gevel-creme/kozijn-wit.webp',
    '3|creme|creme': '3-vaks/gevel-creme/kozijn-creme.webp',
    '3|creme|antraciet': '3-vaks/gevel-creme/kozijn-antraciet.webp',
    '3|creme|zwart': '3-vaks/gevel-creme/kozijn-zwart.webp',
    '3|lichtgrijs|wit': '3-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '3|lichtgrijs|creme': '3-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '3|lichtgrijs|antraciet': '3-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '3|lichtgrijs|zwart': '3-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '3|antraciet|wit': '3-vaks/gevel-antraciet/kozijn-wit.webp',
    '3|antraciet|creme': '3-vaks/gevel-antraciet/kozijn-creme.webp',
    '3|antraciet|antraciet': '3-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '3|antraciet|zwart': '3-vaks/gevel-antraciet/kozijn-zwart.webp',
    '3|zwart|wit': '3-vaks/gevel-zwart/kozijn-wit.webp',
    '3|zwart|creme': '3-vaks/gevel-zwart/kozijn-creme.webp',
    '3|zwart|antraciet': '3-vaks/gevel-zwart/kozijn-antraciet.webp',
    '3|zwart|zwart': '3-vaks/gevel-zwart/kozijn-zwart.webp',
    '3|thermowood|wit': '3-vaks/gevel-thermowood/kozijn-wit.webp',
    '3|thermowood|creme': '3-vaks/gevel-thermowood/kozijn-creme.webp',
    '3|thermowood|antraciet': '3-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '3|thermowood|zwart': '3-vaks/gevel-thermowood/kozijn-zwart.webp',
    '3|zink-platen|wit': '3-vaks/gevel-zink-platen/kozijn-wit.webp',
    '3|zink-platen|creme': '3-vaks/gevel-zink-platen/kozijn-creme.webp',
    '3|zink-platen|antraciet': '3-vaks/gevel-zink-platen/kozijn-antraciet.webp',
    '3|zink-platen|zwart': '3-vaks/gevel-zink-platen/kozijn-zwart.webp',
    '4|creme|wit': '4-vaks/gevel-creme/kozijn-wit.webp',
    '4|creme|creme': '4-vaks/gevel-creme/kozijn-creme.webp',
    '4|creme|antraciet': '4-vaks/gevel-creme/kozijn-antraciet.webp',
    '4|creme|zwart': '4-vaks/gevel-creme/kozijn-zwart.webp',
    '4|lichtgrijs|wit': '4-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '4|lichtgrijs|creme': '4-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '4|lichtgrijs|antraciet': '4-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '4|lichtgrijs|zwart': '4-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '4|antraciet|wit': '4-vaks/gevel-antraciet/kozijn-wit.webp',
    '4|antraciet|creme': '4-vaks/gevel-antraciet/kozijn-creme.webp',
    '4|antraciet|antraciet': '4-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '4|antraciet|zwart': '4-vaks/gevel-antraciet/kozijn-zwart.webp',
    '4|zwart|wit': '4-vaks/gevel-zwart/kozijn-wit.webp',
    '4|zwart|creme': '4-vaks/gevel-zwart/kozijn-creme.webp',
    '4|zwart|antraciet': '4-vaks/gevel-zwart/kozijn-antraciet.webp',
    '4|zwart|zwart': '4-vaks/gevel-zwart/kozijn-zwart.webp',
    '4|thermowood|wit': '4-vaks/gevel-thermowood/kozijn-wit.webp',
    '4|zink-platen|wit': '4-vaks/gevel-zink-platen/kozijn-wit.webp',
    '5|creme|wit': '5-vaks/gevel-creme/kozijn-wit.webp',
    '5|creme|creme': '5-vaks/gevel-creme/kozijn-creme.webp',
    '5|creme|antraciet': '5-vaks/gevel-creme/kozijn-antraciet.webp',
    '5|creme|zwart': '5-vaks/gevel-creme/kozijn-zwart.webp',
    '5|lichtgrijs|wit': '5-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '5|lichtgrijs|creme': '5-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '5|lichtgrijs|antraciet': '5-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '5|lichtgrijs|zwart': '5-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '5|antraciet|wit': '5-vaks/gevel-antraciet/kozijn-wit.webp',
    '5|antraciet|creme': '5-vaks/gevel-antraciet/kozijn-creme.webp',
    '5|antraciet|antraciet': '5-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '5|antraciet|zwart': '5-vaks/gevel-antraciet/kozijn-zwart.webp',
    '5|zwart|wit': '5-vaks/gevel-zwart/kozijn-wit.webp',
    '5|zwart|creme': '5-vaks/gevel-zwart/kozijn-creme.webp',
    '5|zwart|antraciet': '5-vaks/gevel-zwart/kozijn-antraciet.webp',
    '5|zwart|zwart': '5-vaks/gevel-zwart/kozijn-zwart.webp',
    '5|thermowood|wit': '5-vaks/gevel-thermowood/kozijn-wit.webp',
    '5|thermowood|creme': '5-vaks/gevel-thermowood/kozijn-creme.webp',
    '5|thermowood|antraciet': '5-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '5|thermowood|zwart': '5-vaks/gevel-thermowood/kozijn-zwart.webp',
    '5|zink-platen|wit': '5-vaks/gevel-zink-platen/kozijn-wit.webp',
    '5|zink-platen|creme': '5-vaks/gevel-zink-platen/kozijn-creme.webp',
    '5|zink-platen|antraciet': '5-vaks/gevel-zink-platen/kozijn-antraciet.webp',
    '5|zink-platen|zwart': '5-vaks/gevel-zink-platen/kozijn-zwart.webp',
    '6|creme|wit': '6-vaks/gevel-creme/kozijn-wit.webp',
    '6|lichtgrijs|wit': '6-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '6|antraciet|wit': '6-vaks/gevel-antraciet/kozijn-wit.webp',
    '6|zwart|wit': '6-vaks/gevel-zwart/kozijn-wit.webp',
    '6|thermowood|wit': '6-vaks/gevel-thermowood/kozijn-wit.webp',
    '6|zink-platen|wit': '6-vaks/gevel-zink-platen/kozijn-wit.webp',
  };

  /* Eén beeld per optie, op dezelfde woning en camera als de matrix. */
  var OPTIEBEELDEN = {
    rolluiken: 'optie-rolluiken.webp',
    screens: 'optie-screens.webp',
    spots: 'optie-spotjes-overstek.webp',
    rooster: 'optie-ventilatierooster.webp',
  };

  function render(glasvakken, gevel, kozijnkleur) {
    var b = COMBINATIES[glasvakken + '|' + gevel + '|' + kozijnkleur];
    return b ? { src: PAD_COMBI + b, bestand: b,
                 glasvakken: glasvakken, gevel: gevel, kozijnkleur: kozijnkleur } : null;
  }
  function optieBeeld(optie) {
    var b = OPTIEBEELDEN[optie];
    return b ? { src: PAD_OPTIE + b, bestand: b, optie: optie } : null;
  }

  global.NGNokverhogingRenders = {
    padCombi: PAD_COMBI, padOptie: PAD_OPTIE,
    combinaties: COMBINATIES, optiebeelden: OPTIEBEELDEN,
    render: render, optieBeeld: optieBeeld
  };
})(typeof window !== 'undefined' ? window : globalThis);
