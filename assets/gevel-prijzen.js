/* De prijzen van de gevelrenovatieconfigurator.
 *
 * WAAR DEZE GETALLEN VANDAAN KOMEN
 * Niet verzonnen: elk tarief is in augustus 2026 opgezocht bij Nederlandse
 * prijsgidsen en vakbedrijven, en bij elke post staat de gevonden bandbreedte
 * plus de bron. Het gekozen tarief ligt steeds rond het midden van die band -
 * niet de stuntprijs en niet de bovenkant, want dit is een richtprijs waar een
 * echte offerte op moet kunnen volgen zonder dat de klant zich bekocht voelt.
 *
 * Bronnen (geraadpleegd augustus 2026):
 *   reiniging      emd-reiniging.nl, poseidonsoftwash.nl, gevelpro.nl,
 *                  beschermende-coating.nl, metsel-gigant.nl
 *   zand/nevel     homedeal.nl, offerteadviseur.nl, metsel-gigant.nl, bkbouw.nl
 *   voegwerk       homedeal.nl, metsel-gigant.nl, gevelpro.nl,
 *                  gevelreinigingenrenovatie.nl
 *   impregneren    werkspot.nl, wijreinigen.nl, dejongbv.nl, metsel-gigant.nl
 *   steenherstel   slimster.nl, kosten-gevelrenovatie.nl, hydrogroep.nl
 *   scheurherstel  gevelreinigingwijzer.nl, verbouwprijzen.nl, slimster.nl
 *   stucwerk       homedeal.nl, casius.nl, stukadoorsclub.nl
 *   schilderwerk   slimster.nl, schilder-gigant.nl, homedeal.nl
 *   steiger        klussendirect.nl, jansensteigerverhuur.nl, reco.eu
 *
 * ALLES PER VIERKANTE METER GEVEL, tenzij de eenheid anders zegt. De
 * configurator rekent met het geveloppervlak dat de bezoeker opgeeft (of dat
 * uit het woningtype volgt); posten per steen of per strekkende meter krijgen
 * een eigen invoerveld.
 *
 * BTW: op arbeid aan woningen ouder dan twee jaar geldt voor schilderen en
 * stukadoren het 9%-tarief; de overige posten vallen onder 21%. De tarieven
 * hieronder zijn inclusief btw tegen het tarief dat er in de praktijk op zit -
 * zo rekent de klant nergens zichzelf rijk.
 */
(function (global) {
  'use strict';

  /* Per woningtype het geveloppervlak van de voorgevel in vierkante meters,
   * als voorzet. Een tussenwoning heeft 40-60 m2 voorgevel (bron:
   * poseidonsoftwash.nl); het midden daarvan is de voorzet en de bezoeker mag
   * hem aanpassen. De flat is een portiek van vier lagen. */
  var OPPERVLAK = { rijtjeswoning: 50, vrijstaand: 85, flatgebouw: 220 };

  /* De behandelingen. `p` is het gekozen tarief, `band` wat de bronnen samen
   * zeggen, `eenheid` waarover gerekend wordt. `alleen` beperkt een post tot
   * de gevelsoorten waar hij bestaat - dezelfde poorten als in de renderlijst,
   * want een prijs voor voegwerk op een gestucte gevel is onzin met een
   * eurobedrag erop. */
  var BEHANDELING = {
    /* -------------------------------------------------- reinigingsmethoden */
    'stoomreiniging':      { p: 8,   band: [5, 12],  eenheid: 'm2',
                             l: 'Stoomreiniging' },
    'softwash':            { p: 11,  band: [8, 15],  eenheid: 'm2',
                             l: 'Softwash (biocide, laagdruk)' },
    'chemische-reiniging': { p: 15,  band: [10, 22], eenheid: 'm2',
                             l: 'Chemische reiniging' },
    'nevelstralen':        { p: 16,  band: [12, 20], eenheid: 'm2',
                             alleen: ['rood', 'geel'],
                             l: 'Nevelstralen' },
    'zandstralen':         { p: 14,  band: [10, 25], eenheid: 'm2',
                             alleen: ['geel'],
                             l: 'Zandstralen' },

    /* --------------------------------------------------------- voegwerk */
    'voegenherstel':       { p: 55,  band: [45, 75], eenheid: 'm2-hersteld',
                             alleen: ['rood', 'geel'], minimum: 500,
                             l: 'Plaatselijk voegenherstel' },
    'uitgehakt':           { p: 32,  band: [30, 35], eenheid: 'm2',
                             alleen: ['rood', 'geel'],
                             l: 'Voegen uithakken/uitslijpen' },
    'gevoegd':             { p: 16,  band: [12, 20], eenheid: 'm2',
                             alleen: ['rood', 'geel'],
                             l: 'Opnieuw voegen',
                             /* De band 8-13 is kaal voegwerk in doorsnee
                              * platvol; een sier- of knipvoeg is arbeid en
                              * ligt erboven. Vandaar 16 als midden over de
                              * voegsoorten heen; de toeslag per soort staat
                              * in VOEGSOORT. */
                             noot: 'basis; toeslag per voegsoort hieronder' },

    /* ---------------------------------------------------------- herstel */
    'steenherstel':        { p: 20,  band: [12.5, 30], eenheid: 'steen',
                             alleen: ['rood', 'geel'],
                             l: 'Beschadigde stenen vervangen' },
    'scheurherstel':       { p: 115, band: [80, 150], eenheid: 'm1',
                             minimum: 500,
                             l: 'Scheurherstel met spiraalankers' },

    /* --------------------------------------------------------- stucwerk */
    'stucherstel':         { p: 75,  band: [55, 90], eenheid: 'm2-hersteld',
                             alleen: ['gestuct'], minimum: 500,
                             l: 'Plaatselijk stucherstel' },
    'opnieuw-gestuct':     { p: 85,  band: [70, 105], eenheid: 'm2',
                             alleen: ['gestuct'],
                             l: 'Volledig opnieuw stucen',
                             noot: 'oude laag eraf plus nieuw stucwerk met gaas' },
    'geschilderd':         { p: 32,  band: [25, 45], eenheid: 'm2',
                             alleen: ['gestuct'],
                             l: 'Gevel schilderen' },

    /* ------------------------------------------------------ afwerkingen */
    'impregneren':         { p: 8,   band: [5, 15],  eenheid: 'm2',
                             l: 'Impregneren (waterafstotend)' },

    /* ---------------------------------------------------------- steiger */
    /* Huur ligt op 8-15 euro per m2 per week; op- en afbouw en transport
     * komen daar eenmalig bij. Voor gevelrenovatie staat een steiger
     * doorgaans twee tot drie weken. Alles bij elkaar geslagen tot een
     * eenmalig tarief per m2 gevel, want zo kiest de klant hem ook: erbij
     * of niet erbij, niet per week. */
    'steiger':             { p: 18,  band: [14, 25], eenheid: 'm2',
                             l: 'Steiger (op- en afbouw plus huur)',
                             noot: 'nodig boven 2,5 m werkhoogte; bij een ' +
                                   'flatgebouw niet optioneel' },
  };

  /* De voegsoorten: toeslag op het basistarief van opnieuw voegen. Een
   * platvolle voeg is het werk waarop de m2-prijs gebaseerd is; een knipvoeg
   * is handwerk met de voegspijker en kost een veelvoud aan uren. De bedragen
   * zijn toeslagen per m2 bovenop `gevoegd`. */
  var VOEGSOORT = {
    'platvol':    { t: 0,  l: 'Platvolle voeg' },
    'verdiept':   { t: 2,  l: 'Verdiepte voeg' },
    'schaduw':    { t: 4,  l: 'Schaduwvoeg' },
    'geborsteld': { t: 2,  l: 'Geborstelde voeg' },
    'knip':       { t: 18, l: 'Knipvoeg (handwerk)' },
  };

  /* Voegkleuren en steenkleuren kosten niets extra: de mortel wordt op kleur
   * gemengd en de steen wordt op kleur ingekocht. Ze staan hier alleen zodat
   * de configurator er niet zelf nul van hoeft te maken. */
  var VOEGKLEUR = ['lichtgrijs', 'middengrijs', 'donkergrijs', 'zandkleur', 'antraciet'];

  function bedrag(sleutel, opp, extra) {
    var b = BEHANDELING[sleutel];
    if (!b) return null;
    var eenheden = (b.eenheid === 'm2') ? opp : (extra || 0);
    var uit = Math.round(b.p * eenheden);
    if (b.minimum && uit > 0 && uit < b.minimum) uit = b.minimum;
    return uit;
  }

  /* De maand waarin de tarieven zijn opgezocht; het offerteblad noemt hem. */
  var TARIEFDATUM = 'augustus 2026';

  global.NGGevelPrijzen = {
    TARIEFDATUM: TARIEFDATUM,
    OPPERVLAK: OPPERVLAK,
    BEHANDELING: BEHANDELING,
    VOEGSOORT: VOEGSOORT,
    VOEGKLEUR: VOEGKLEUR,
    bedrag: bedrag,
  };
})(window);
