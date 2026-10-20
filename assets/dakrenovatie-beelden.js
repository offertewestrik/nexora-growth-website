/* Welke van de 92 dakrenovatiebeelden er werkelijk liggen.
 *
 * Bijgehouden door tools/dakrenovatie-beelden-scan.py. Niet met de hand
 * wijzigen. De nummers zijn de rijen van de renderlijst
 * (tools/dakrenovatie-brief/01_RENDERLIJST.csv): 1 = het bestaande dak,
 * 12 = de complete renovatie, enzovoort.
 */
(function (global) {
  'use strict';
  var MAP = './assets/media/dakrenovatie/';
  /* Per daktype een eigen namenlijst: rij 13 is bij een pannendak een
     sneldekpan en bij een plat dak bitumen zwart. */
  var NAAM = {
    w01: {1: 'bestaand_verouderd', 2: 'gereinigd', 3: 'gecoat_antraciet', 4: 'gecoat_rood', 5: 'lokale_reparatie', 6: 'dakpannen_verwijderd', 7: 'bestaande_latten_verwijderd', 8: 'dakbeschot_open', 9: 'isolatie_buitenzijde', 10: 'folie_tengels_panlatten', 11: 'nieuwe_pannen_in_aanbouw', 12: 'complete_dakrenovatie', 13: 'sneldekpan_antraciet', 14: 'sneldekpan_rood', 15: 'keramisch_vlak_antraciet', 16: 'keramisch_vlak_zwart', 17: 'keramisch_golvend_rood', 18: 'keramisch_golvend_zwart', 19: 'leipan_antraciet', 20: 'leipan_zwart', 21: 'zonnepanelen_0', 22: 'zonnepanelen_4', 23: 'zonnepanelen_6', 24: 'zonnepanelen_8', 25: 'zonnepanelen_10', 26: 'dakramen_0', 27: 'dakraam_1_klein', 28: 'dakraam_1_groot', 29: 'dakramen_2_naast_elkaar', 30: 'goot_bestaand', 31: 'goot_zink', 32: 'goot_antraciet', 33: 'boeidelen_wit', 34: 'boeidelen_antraciet', 35: 'nok_bestaand', 36: 'nokvorsten_nieuw', 37: 'loodwerk_bestaand', 38: 'loodwerk_nieuw', 39: 'gebroken_dakpannen', 40: 'verschoven_dakpannen', 41: 'mos_en_algen', 42: 'lekkagezone', 43: 'schade_hersteld', 44: 'voor_totaal', 45: 'na_totaal', 46: 'na_compleet_met_opties', 50: 'nieuwdak_goot_bestaand', 51: 'nieuwdak_goot_zink', 52: 'nieuwdak_goot_antraciet', 53: 'nieuwdak_boeidelen_wit', 54: 'nieuwdak_boeidelen_antraciet', 55: 'dakkapel_smal', 56: 'dakkapel_breed'},
    w02: {1: 'bestaand_verouderd', 2: 'gereinigd', 3: 'gecoat_antraciet', 4: 'gecoat_rood', 5: 'lokale_reparatie', 6: 'dakpannen_verwijderd', 7: 'bestaande_latten_verwijderd', 8: 'dakbeschot_open', 9: 'isolatie_buitenzijde', 10: 'folie_tengels_panlatten', 11: 'nieuwe_pannen_in_aanbouw', 12: 'complete_dakrenovatie', 13: 'sneldekpan_antraciet', 14: 'sneldekpan_rood', 15: 'keramisch_vlak_antraciet', 16: 'keramisch_vlak_zwart', 17: 'keramisch_golvend_rood', 18: 'keramisch_golvend_zwart', 19: 'leipan_antraciet', 20: 'leipan_zwart', 21: 'zonnepanelen_0', 22: 'zonnepanelen_4', 23: 'zonnepanelen_6', 24: 'zonnepanelen_8', 25: 'zonnepanelen_10', 26: 'dakramen_0', 27: 'dakraam_1_klein', 28: 'dakraam_1_groot', 29: 'dakramen_2_naast_elkaar', 30: 'goot_bestaand', 31: 'goot_zink', 32: 'goot_antraciet', 33: 'boeidelen_wit', 34: 'boeidelen_antraciet', 35: 'nok_bestaand', 36: 'nokvorsten_nieuw', 37: 'loodwerk_bestaand', 38: 'loodwerk_nieuw', 39: 'gebroken_dakpannen', 40: 'verschoven_dakpannen', 41: 'mos_en_algen', 42: 'lekkagezone', 43: 'schade_hersteld', 44: 'voor_totaal', 45: 'na_totaal', 46: 'na_compleet_met_opties', 50: 'nieuwdak_goot_bestaand', 51: 'nieuwdak_goot_zink', 52: 'nieuwdak_goot_antraciet', 53: 'nieuwdak_boeidelen_wit', 54: 'nieuwdak_boeidelen_antraciet', 55: 'dakkapel_smal', 56: 'dakkapel_breed'},
    w03: {1: 'bestaand_verouderd', 2: 'gereinigd', 5: 'lokale_reparatie', 6: 'bitumen_verwijderd', 7: 'dakbeschot_vernieuwd', 9: 'isolatie_pir', 10: 'dampremmer_onderlaag', 11: 'nieuwe_bitumen_in_aanbouw', 12: 'complete_dakrenovatie', 13: 'bitumen_zwart', 14: 'bitumen_wit', 15: 'epdm_zwart', 16: 'pvc_lichtgrijs', 17: 'grind_ballast', 18: 'sedum_groendak', 21: 'zonnepanelen_0', 22: 'zonnepanelen_4', 23: 'zonnepanelen_6', 24: 'zonnepanelen_8', 26: 'daglicht_geen', 27: 'lichtkoepel', 28: 'platdakraam', 29: 'lichtstraat', 30: 'dakrand_bestaand', 31: 'dakrand_antraciet', 32: 'dakrand_grijs', 35: 'terras_geen', 36: 'terras_tegels', 37: 'terras_vlonder', 39: 'blaasvorming', 40: 'open_naden', 41: 'plasvorming', 42: 'lekkagezone', 43: 'schade_hersteld', 44: 'voor_totaal', 45: 'na_totaal', 46: 'na_compleet_met_opties', 60: 'boeidelen_bestaand', 61: 'boeidelen_wit', 62: 'boeidelen_antraciet', 64: 'nieuwdak_boeidelen_bestaand', 65: 'nieuwdak_boeidelen_wit', 66: 'nieuwdak_boeidelen_antraciet'}
  };
  var AANWEZIG = {
    w01: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 55, 56],
    w02: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 55, 56],
    w03: [1, 2, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 39, 40, 41, 42, 43, 44, 45, 46, 60, 61, 62, 64, 65, 66]
  };
  function nul(n) { return (n < 10 ? '0' : '') + n; }
  /* Het adres van het beeld, of null als het er (nog) niet is. Nooit dat van
     een andere keuze: wie op rode pannen klikt en antraciet ziet, denkt dat
     hij antraciet krijgt. */
  function beeld(woning, nr) {
    var n = NAAM[woning];
    if (!n || !n[nr] || !AANWEZIG[woning] || AANWEZIG[woning].indexOf(nr) < 0) return null;
    return MAP + woning + '/' + woning.toUpperCase() + '_' + nul(nr) + '_' + n[nr] + '.webp';
  }
  /* Dezelfde opname op 512 px breed, voor keuzetegels en miniaturen. De
     tegel is 54 px hoog; daar 2048 px voor laden kostte twaalf megabyte per
     paginabezoek. Het grote voorbeeld blijft de volle opname. */
  function klein(woning, nr) {
    var p = beeld(woning, nr);
    return p ? p.replace(MAP + woning + '/', MAP + 'klein/' + woning + '/') : null;
  }
  global.NGDakrenovatieBeelden = { beeld: beeld, klein: klein, NAAM: NAAM, AANWEZIG: AANWEZIG };
})(typeof window !== 'undefined' ? window : globalThis);
