/* Welke gevelrenders er werkelijk zijn.
 *
 * Bijgehouden door tools/gevel-beelden-scan.py. Niet met de hand wijzigen.
 *
 * DE REGEL DIE HIER GELDT
 * De exacte combinatie of niets. Nooit terugvallen op een naburig beeld: wie
 * gele steen kiest en een rode gevel te zien krijgt, denkt dat hij dat koopt.
 * `beeld()` en `detail()` geven daarom null terug als de combinatie er niet is,
 * en het scherm zegt dan eerlijk dat de opname nog volgt.
 *
 * 125 beelden op het moment van scannen.
 */
(function (global) {
  'use strict';
  var MAP = './assets/media/gevel/';

  /* Per woningtype en gevelsoort de behandelingen die er als heel gevelbeeld
   * zijn. Sleutel: 'woningtype|gevelsoort'. */
  var GEVEL = {
  'flatgebouw|geel': { 'compleet-geimpregneerd|platvol|lichtgrijs': 'flatgebouw_geel_compleet-geimpregneerd_platvol_lichtgrijs.webp', 'compleet|platvol|lichtgrijs': 'flatgebouw_geel_compleet_platvol_lichtgrijs.webp', 'gereinigd': 'flatgebouw_geel_gereinigd_geen_geen.webp', 'gevoegd|platvol|lichtgrijs': 'flatgebouw_geel_gevoegd_platvol_lichtgrijs.webp', 'scheurherstel': 'flatgebouw_geel_scheurherstel_geen_geen.webp', 'steenherstel': 'flatgebouw_geel_steenherstel_geen_geen.webp', 'steiger': 'flatgebouw_geel_steiger_geen_geen.webp', 'uitgehakt': 'flatgebouw_geel_uitgehakt_geen_geen.webp', 'vervuild': 'flatgebouw_geel_vervuild_geen_geen.webp', 'voegenherstel': 'flatgebouw_geel_voegenherstel_geen_geen.webp' },
  'flatgebouw|gestuct': { 'compleet': 'flatgebouw_gestuct_compleet_geen_geen.webp', 'compleet-geimpregneerd': 'flatgebouw_gestuct_compleet-geimpregneerd_geen_geen.webp', 'gereinigd': 'flatgebouw_gestuct_gereinigd_geen_geen.webp', 'geschilderd': 'flatgebouw_gestuct_geschilderd_geen_geen.webp', 'opnieuw-gestuct': 'flatgebouw_gestuct_opnieuw-gestuct_geen_geen.webp', 'scheurherstel': 'flatgebouw_gestuct_scheurherstel_geen_geen.webp', 'steiger': 'flatgebouw_gestuct_steiger_geen_geen.webp', 'stucherstel': 'flatgebouw_gestuct_stucherstel_geen_geen.webp', 'vervuild': 'flatgebouw_gestuct_vervuild_geen_geen.webp' },
  'flatgebouw|rood': { 'compleet-geimpregneerd|platvol|lichtgrijs': 'flatgebouw_rood_compleet-geimpregneerd_platvol_lichtgrijs.webp', 'compleet|platvol|lichtgrijs': 'flatgebouw_rood_compleet_platvol_lichtgrijs.webp', 'gereinigd': 'flatgebouw_rood_gereinigd_geen_geen.webp', 'gevoegd|platvol|lichtgrijs': 'flatgebouw_rood_gevoegd_platvol_lichtgrijs.webp', 'scheurherstel': 'flatgebouw_rood_scheurherstel_geen_geen.webp', 'steenherstel': 'flatgebouw_rood_steenherstel_geen_geen.webp', 'steiger': 'flatgebouw_rood_steiger_geen_geen.webp', 'uitgehakt': 'flatgebouw_rood_uitgehakt_geen_geen.webp', 'vervuild': 'flatgebouw_rood_vervuild_geen_geen.webp', 'voegenherstel': 'flatgebouw_rood_voegenherstel_geen_geen.webp' },
  'rijtjeswoning|geel': { 'compleet-geimpregneerd|platvol|lichtgrijs': 'rijtjeswoning_geel_compleet-geimpregneerd_platvol_lichtgrijs.webp', 'compleet|platvol|lichtgrijs': 'rijtjeswoning_geel_compleet_platvol_lichtgrijs.webp', 'gereinigd': 'rijtjeswoning_geel_gereinigd_geen_geen.webp', 'gevoegd|platvol|lichtgrijs': 'rijtjeswoning_geel_gevoegd_platvol_lichtgrijs.webp', 'scheurherstel': 'rijtjeswoning_geel_scheurherstel_geen_geen.webp', 'steenherstel': 'rijtjeswoning_geel_steenherstel_geen_geen.webp', 'steiger': 'rijtjeswoning_geel_steiger_geen_geen.webp', 'uitgehakt': 'rijtjeswoning_geel_uitgehakt_geen_geen.webp', 'vervuild': 'rijtjeswoning_geel_vervuild_geen_geen.webp', 'voegenherstel': 'rijtjeswoning_geel_voegenherstel_geen_geen.webp' },
  'rijtjeswoning|gestuct': { 'compleet': 'rijtjeswoning_gestuct_compleet_geen_geen.webp', 'compleet-geimpregneerd': 'rijtjeswoning_gestuct_compleet-geimpregneerd_geen_geen.webp', 'gereinigd': 'rijtjeswoning_gestuct_gereinigd_geen_geen.webp', 'geschilderd': 'rijtjeswoning_gestuct_geschilderd_geen_geen.webp', 'opnieuw-gestuct': 'rijtjeswoning_gestuct_opnieuw-gestuct_geen_geen.webp', 'scheurherstel': 'rijtjeswoning_gestuct_scheurherstel_geen_geen.webp', 'steiger': 'rijtjeswoning_gestuct_steiger_geen_geen.webp', 'stucherstel': 'rijtjeswoning_gestuct_stucherstel_geen_geen.webp', 'vervuild': 'rijtjeswoning_gestuct_vervuild_geen_geen.webp' },
  'rijtjeswoning|rood': { 'compleet-geimpregneerd|platvol|lichtgrijs': 'rijtjeswoning_rood_compleet-geimpregneerd_platvol_lichtgrijs.webp', 'compleet|platvol|lichtgrijs': 'rijtjeswoning_rood_compleet_platvol_lichtgrijs.webp', 'gereinigd': 'rijtjeswoning_rood_gereinigd_geen_geen.webp', 'gevoegd|platvol|lichtgrijs': 'rijtjeswoning_rood_gevoegd_platvol_lichtgrijs.webp', 'scheurherstel': 'rijtjeswoning_rood_scheurherstel_geen_geen.webp', 'steenherstel': 'rijtjeswoning_rood_steenherstel_geen_geen.webp', 'steiger': 'rijtjeswoning_rood_steiger_geen_geen.webp', 'uitgehakt': 'rijtjeswoning_rood_uitgehakt_geen_geen.webp', 'vervuild': 'rijtjeswoning_rood_vervuild_geen_geen.webp', 'voegenherstel': 'rijtjeswoning_rood_voegenherstel_geen_geen.webp' },
  'vrijstaand|geel': { 'compleet-geimpregneerd|platvol|lichtgrijs': 'vrijstaand_geel_compleet-geimpregneerd_platvol_lichtgrijs.webp', 'compleet|platvol|lichtgrijs': 'vrijstaand_geel_compleet_platvol_lichtgrijs.webp', 'gereinigd': 'vrijstaand_geel_gereinigd_geen_geen.webp', 'gevoegd|platvol|lichtgrijs': 'vrijstaand_geel_gevoegd_platvol_lichtgrijs.webp', 'scheurherstel': 'vrijstaand_geel_scheurherstel_geen_geen.webp', 'steenherstel': 'vrijstaand_geel_steenherstel_geen_geen.webp', 'steiger': 'vrijstaand_geel_steiger_geen_geen.webp', 'uitgehakt': 'vrijstaand_geel_uitgehakt_geen_geen.webp', 'vervuild': 'vrijstaand_geel_vervuild_geen_geen.webp', 'voegenherstel': 'vrijstaand_geel_voegenherstel_geen_geen.webp' },
  'vrijstaand|gestuct': { 'compleet': 'vrijstaand_gestuct_compleet_geen_geen.webp', 'compleet-geimpregneerd': 'vrijstaand_gestuct_compleet-geimpregneerd_geen_geen.webp', 'gereinigd': 'vrijstaand_gestuct_gereinigd_geen_geen.webp', 'geschilderd': 'vrijstaand_gestuct_geschilderd_geen_geen.webp', 'opnieuw-gestuct': 'vrijstaand_gestuct_opnieuw-gestuct_geen_geen.webp', 'scheurherstel': 'vrijstaand_gestuct_scheurherstel_geen_geen.webp', 'steiger': 'vrijstaand_gestuct_steiger_geen_geen.webp', 'stucherstel': 'vrijstaand_gestuct_stucherstel_geen_geen.webp', 'vervuild': 'vrijstaand_gestuct_vervuild_geen_geen.webp' },
  'vrijstaand|rood': { 'compleet-geimpregneerd|platvol|lichtgrijs': 'vrijstaand_rood_compleet-geimpregneerd_platvol_lichtgrijs.webp', 'compleet|platvol|lichtgrijs': 'vrijstaand_rood_compleet_platvol_lichtgrijs.webp', 'gereinigd': 'vrijstaand_rood_gereinigd_geen_geen.webp', 'gevoegd|platvol|lichtgrijs': 'vrijstaand_rood_gevoegd_platvol_lichtgrijs.webp', 'scheurherstel': 'vrijstaand_rood_scheurherstel_geen_geen.webp', 'steenherstel': 'vrijstaand_rood_steenherstel_geen_geen.webp', 'steiger': 'vrijstaand_rood_steiger_geen_geen.webp', 'uitgehakt': 'vrijstaand_rood_uitgehakt_geen_geen.webp', 'vervuild': 'vrijstaand_rood_vervuild_geen_geen.webp', 'voegenherstel': 'vrijstaand_rood_voegenherstel_geen_geen.webp' }
};

  /* Per gevelsoort de detailopnamen: een halve vierkante meter muur. Die zijn
   * niet woningtypegebonden, want een uitgehakte voeg op een flat is dezelfde
   * uitgehakte voeg als op een rijtjeswoning. */
  var DETAIL = {
  'geel': { 'chemische-reiniging': 'detail_geel_chemische-reiniging_geen_geen.webp', 'gereinigd': 'detail_geel_gereinigd_geen_geen.webp', 'gevoegd|platvol|middengrijs': 'detail_geel_gevoegd_platvol_middengrijs.webp', 'nevelstralen': 'detail_geel_nevelstralen_geen_geen.webp', 'scheurherstel': 'detail_geel_scheurherstel_geen_geen.webp', 'softwash': 'detail_geel_softwash_geen_geen.webp', 'steenherstel': 'detail_geel_steenherstel_geen_geen.webp', 'stoomreiniging': 'detail_geel_stoomreiniging_geen_geen.webp', 'uitgehakt': 'detail_geel_uitgehakt_geen_geen.webp', 'vervuild': 'detail_geel_vervuild_geen_geen.webp', 'voegenherstel': 'detail_geel_voegenherstel_geen_geen.webp', 'zandstralen': 'detail_geel_zandstralen_geen_geen.webp' },
  'gestuct': { 'chemische-reiniging': 'detail_gestuct_chemische-reiniging_geen_geen.webp', 'gereinigd': 'detail_gestuct_gereinigd_geen_geen.webp', 'geschilderd': 'detail_gestuct_geschilderd_geen_geen.webp', 'opnieuw-gestuct': 'detail_gestuct_opnieuw-gestuct_geen_geen.webp', 'scheurherstel': 'detail_gestuct_scheurherstel_geen_geen.webp', 'softwash': 'detail_gestuct_softwash_geen_geen.webp', 'stoomreiniging': 'detail_gestuct_stoomreiniging_geen_geen.webp', 'stucherstel': 'detail_gestuct_stucherstel_geen_geen.webp', 'vervuild': 'detail_gestuct_vervuild_geen_geen.webp' },
  'rood': { 'chemische-reiniging': 'detail_rood_chemische-reiniging_geen_geen.webp', 'gereinigd': 'detail_rood_gereinigd_geen_geen.webp', 'gevoegd|platvol|middengrijs': 'detail_rood_gevoegd_platvol_middengrijs.webp', 'impregneren': 'detail_rood_impregneren_geen_geen.webp', 'nevelstralen': 'detail_rood_nevelstralen_geen_geen.webp', 'scheurherstel': 'detail_rood_scheurherstel_geen_geen.webp', 'softwash': 'detail_rood_softwash_geen_geen.webp', 'steenherstel': 'detail_rood_steenherstel_geen_geen.webp', 'stoomreiniging': 'detail_rood_stoomreiniging_geen_geen.webp', 'uitgehakt': 'detail_rood_uitgehakt_geen_geen.webp', 'vervuild': 'detail_rood_vervuild_geen_geen.webp', 'voegenherstel': 'detail_rood_voegenherstel_geen_geen.webp', 'voegsoort|geborsteld|middengrijs': 'detail_rood_voegsoort_geborsteld_middengrijs.webp', 'voegsoort|knip|middengrijs': 'detail_rood_voegsoort_knip_middengrijs.webp', 'voegsoort|platvol|middengrijs': 'detail_rood_voegsoort_platvol_middengrijs.webp', 'voegsoort|schaduw|middengrijs': 'detail_rood_voegsoort_schaduw_middengrijs.webp', 'voegsoort|verdiept|middengrijs': 'detail_rood_voegsoort_verdiept_middengrijs.webp' }
};

  function sleutel(behandeling, voegsoort, voegkleur) {
    return (voegsoort && voegsoort !== 'geen')
      ? behandeling + '|' + voegsoort + '|' + voegkleur
      : behandeling;
  }

  function beeld(woningtype, gevelsoort, behandeling, voegsoort, voegkleur) {
    var g = GEVEL[woningtype + '|' + gevelsoort];
    if (!g) return null;
    var n = g[sleutel(behandeling, voegsoort, voegkleur)];
    return n ? MAP + n : null;
  }

  function detail(gevelsoort, behandeling, voegsoort, voegkleur) {
    var d = DETAIL[gevelsoort];
    if (!d) return null;
    var n = d[sleutel(behandeling, voegsoort, voegkleur)];
    return n ? MAP + n : null;
  }

  /* Dezelfde opname op 512 px breed, voor de keuzetegels en de detailstrook.
   * Het schuifbeeld en het offerteblad houden de volle opname. */
  function klein(pad) {
    return pad ? pad.replace(MAP, MAP + 'klein/') : null;
  }

  global.NGGevelBeelden = {
    beeld: beeld, detail: detail, klein: klein, GEVEL: GEVEL, DETAIL: DETAIL
  };
})(window);
