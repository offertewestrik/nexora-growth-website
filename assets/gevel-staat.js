/* Van gevelconfiguratie naar materiaalstaat - de werkvoorbereiding.
 *
 * WAAROM DIT EEN APARTE MODULE IS
 * Dezelfde reden als bij de dakrenovatie: de prijs is een verkoopgetal en de
 * staat is een inkoopgetal. Ze hangen aan dezelfde keuzes maar hebben een
 * andere houdbaarheid. Een prijs mag afgerond en commercieel zijn; een
 * bestellijst niet, want daar komt een vrachtwagen op af. Gescheiden houden
 * betekent dat de staat verfijnd kan worden zonder dat er ergens een prijs
 * verschuift.
 *
 * WAT DIT WEL EN NIET IS
 * Hoeveelheden om mee in te kopen en uren om mee te plannen. Geen bestek en
 * geen constructieberekening. Alles wat uit een aanname volgt in plaats van
 * uit een maat staat onderaan bij `aannames`, en alles wat bij de opname
 * nagemeten moet worden bij `controle`.
 *
 * WAAR DE HOEVEELHEDEN VANDAAN KOMEN
 * Van twee getallen die de bezoeker wel weet - het geveloppervlak en, bij
 * plaatselijk werk, hoeveel daarvan - plus vaste kentallen uit het vak. De
 * belangrijkste staat hieronder uitgerekend in plaats van als getal
 * neergezet, want een kental dat je niet kunt narekenen is een kental dat
 * niemand durft te vertrouwen.
 *
 * DE VOEGMORTEL, VOORGEREKEND
 * Waalformaat is 210 x 50 mm met een voeg van 12,5 mm. Een steen plus voeg
 * beslaat dus 222,5 x 62,5 mm, en de steen zelf 210 x 50. Van dat vlak is
 * 1 - (210 x 50) / (222,5 x 62,5) = 24,5 procent voeg. Bij 15 mm diep
 * uithakken en een mortel van 1900 kg/m3 is dat 0,245 x 0,015 x 1900 =
 * 7,0 kg per vierkante meter. Met 10 procent voor verlies en aanmaakrest:
 * 7,7 kg/m2, oftewel een zak van 25 kg per ruim drie vierkante meter.
 *
 * SNIJVERLIES EN BREUK ZITTEN IN DE HOEVEELHEID
 * Niet als marge achteraf maar in de post zelf, want daar hoort het: wie
 * twaalf stenen besteld voor twaalf kapotte stenen komt er een tekort zodra
 * er een breekt bij het uithakken.
 */
(function (global) {
  'use strict';

  /* De kentallen. Alles per vierkante meter gevel tenzij anders vermeld, en
     alles op Nederlandse praktijkwaarden. Wijkt een leverancier af, dan hoort
     dat hier aangepast te worden en niet op de steiger. */
  var VOEGMORTEL_KG_M2 = 7.7;    // waalformaat, 15 mm diep, incl. 10% verlies
  var METSELMORTEL_KG_STEEN = 0.6;
  var STUC_KG_M2_PER_MM = 1.5;   // minerale stucmortel
  var STUC_DIKTE_MM = 12;        // nieuwe volle laag
  var STUC_REPARATIE_MM = 10;    // plaatselijke lap
  var VERF_L_M2_LAAG = 0.22;
  var PRIMER_L_M2 = 0.15;
  var IMPREGNEER_L_M2 = 0.4;     // zuigende gevel; op dichte steen minder

  /* Reiniging: per methode het middel, het verbruik en de uren. Water staat er
     apart bij omdat een gevelreiniger dat zelf meeneemt en het bij een VvE
     soms afgetapt moet worden - dan wil je weten hoeveel. */
  var REINIGING = {
    'stoomreiniging':      { uren: 0.12, water: 8,
                             middel: null },
    'softwash':            { uren: 0.10, water: 4,
                             middel: ['Biocide-concentraat voor softwash', 0.05, 'L',
                                      'verdunning 1:20, dus 1 liter oplossing per m\u00b2'] },
    'chemische-reiniging': { uren: 0.16, water: 10,
                             middel: ['Gevelreiniger in gelvorm', 0.25, 'L',
                                      'plus naspoelen; op kalkzandsteen eerst proefvak'] },
    'nevelstralen':        { uren: 0.20, water: 6,
                             middel: ['Straalgrit fijn (0,2-0,5 mm)', 4, 'kg',
                                      'nat verneveld, dus laag verbruik'] },
    'zandstralen':         { uren: 0.25, water: 0,
                             middel: ['Straalgrit (0,5-1,0 mm)', 10, 'kg',
                                      'droog stralen; grit is eenmalig'] }
  };

  var REINIGING_NAAM = {
    'stoomreiniging': 'Stoomreiniging', 'softwash': 'Softwash',
    'chemische-reiniging': 'Chemische reiniging',
    'nevelstralen': 'Nevelstralen', 'zandstralen': 'Zandstralen'
  };

  var VOEGSOORT_NAAM = {
    platvol: 'platvolle voeg', verdiept: 'verdiepte voeg',
    schaduw: 'schaduwvoeg', geborsteld: 'geborstelde voeg', knip: 'knipvoeg'
  };

  /* Welke posten bij welke stap horen. Dit is dezelfde tabel als in de
     configurator, en dat is met opzet: staat het op twee plekken anders, dan
     rekent de staat iets anders af dan de prijs. */
  var STAP = {
    'geen': [], 'voegenherstel': ['voegenherstel'], 'uitgehakt': ['uitgehakt'],
    'gevoegd': ['uitgehakt', 'gevoegd'], 'steenherstel': ['steenherstel'],
    'scheurherstel': ['scheurherstel'], 'stucherstel': ['stucherstel'],
    'opnieuw-gestuct': ['opnieuw-gestuct'], 'geschilderd': ['geschilderd'],
    'compleet': ['uitgehakt', 'gevoegd', 'steenherstel', 'scheurherstel'],
    'compleet-geimpregneerd': ['uitgehakt', 'gevoegd', 'steenherstel',
                               'scheurherstel', 'impregneren']
  };
  var STAP_STUC = {
    'compleet': ['stucherstel', 'scheurherstel', 'opnieuw-gestuct'],
    'compleet-geimpregneerd': ['stucherstel', 'scheurherstel', 'opnieuw-gestuct',
                               'impregneren']
  };

  function op(n, stap) { return Math.ceil(n / (stap || 1)) * (stap || 1); }
  function rond1(n) { return Math.round(n * 10) / 10; }
  /* Een getal in een noot komt anders als '7.7' op het blad, met een punt. Dit
     blad wordt door een Nederlandse uitvoerder gelezen, dus met een komma. */
  function komma(n) { return String(n).replace('.', ','); }

  function staat(st) {
    var stuc = st.gevelsoort === 'gestuct';
    var m2 = Math.max(1, st.opp || 0);
    var r = [], uren = [], aannames = [], controle = [];

    function post(groep, wat, aantal, eh, noot) {
      r.push({ groep: groep, wat: wat, aantal: aantal, eh: eh, noot: noot || '' });
    }
    function uur(wat, u) { if (u > 0) uren.push([wat, rond1(u)]); }

    /* ---------------------------------------------------------- reiniging */
    var rn = REINIGING[st.reiniging];
    if (rn) {
      var naam = REINIGING_NAAM[st.reiniging];
      if (rn.middel) {
        post('Reiniging', rn.middel[0], rond1(rn.middel[1] * m2), rn.middel[2], rn.middel[3]);
      }
      if (rn.water) {
        post('Reiniging', 'Water', Math.round(rn.water * m2), 'L',
             'ca. ' + komma(rn.water) + ' L/m\u00b2 bij ' + naam.toLowerCase());
      }
      uur(naam + ' van ' + m2 + ' m\u00b2 gevel', rn.uren * m2);
      if (st.reiniging === 'zandstralen') {
        controle.push('Zandstralen neemt de bakhuid mee. Eerst een proefvak van een '
          + 'halve vierkante meter, en pas doorgaan als de eigenaar dat gezien heeft.');
      }
    }

    var lijst = (stuc && STAP_STUC[st.stap]) ? STAP_STUC[st.stap] : (STAP[st.stap] || []);
    var doet = function (x) { return lijst.indexOf(x) >= 0; };

    /* ------------------------------------------------------------ voegwerk */
    if (doet('uitgehakt')) {
      post('Voegwerk', 'Diamant-voegfrees schijven', op(m2 / 40, 1), 'st',
           'ca. een schijf per 40 m\u00b2 uithakken');
      uur('Voegen uithakken, ' + m2 + ' m\u00b2', 0.30 * m2);
      controle.push('Uithakken tot 15 mm diep. Zit de voeg dieper weg, dan is er '
        + 'meer mortel nodig dan hieronder staat.');
    }
    if (doet('gevoegd')) {
      var kg = VOEGMORTEL_KG_M2 * m2;
      post('Voegwerk', 'Voegmortel ' + (st.voegkleur || 'lichtgrijs'), op(kg / 25, 1), 'zak',
           'zakken van 25 kg; ' + komma(VOEGMORTEL_KG_M2) + ' kg/m\u00b2 bij waalformaat, 15 mm diep');
      uur('Voegen (' + (VOEGSOORT_NAAM[st.voegsoort] || 'platvolle voeg') + '), ' + m2 + ' m\u00b2',
          (st.voegsoort === 'knip' ? 0.55 : 0.35) * m2);
      if (st.voegsoort === 'knip') {
        aannames.push('De knipvoeg is handwerk met de voegspijker en kost ruim anderhalf '
          + 'keer zoveel tijd als een machinaal aangebrachte voeg.');
      }
    }
    if (doet('voegenherstel')) {
      var hm2 = Math.max(1, st.herstelopp || 0);
      post('Voegwerk', 'Voegmortel ' + (st.voegkleur || 'lichtgrijs'),
           op(VOEGMORTEL_KG_M2 * hm2 / 25, 1), 'zak',
           'alleen over de ' + hm2 + ' m\u00b2 die hersteld wordt');
      uur('Plaatselijk uithakken en voegen, ' + hm2 + ' m\u00b2', 0.65 * hm2);
      controle.push('Het aantal vierkante meter voegwerk dat werkelijk stuk is, valt pas '
        + 'van de steiger af te lezen. Hier staat ' + hm2 + ' m2.');
    }

    /* ---------------------------------------------------------- metselwerk */
    if (doet('steenherstel')) {
      var n = Math.max(1, st.stenen || 0);
      post('Metselwerk', 'Gevelsteen, passend bij het bestaande werk', op(n * 1.1, 1), 'st',
           n + ' te vervangen plus 10% breuk bij het uithakken');
      post('Metselwerk', 'Metselmortel', op(n * METSELMORTEL_KG_STEEN / 25, 1), 'zak',
           'zakken van 25 kg; ' + komma(METSELMORTEL_KG_STEEN) + ' kg per steen');
      uur('Stenen uithakken en vervangen, ' + n + ' stuks', 0.25 * n);
      controle.push('De vervangende steen moet op kleur en formaat uitgezocht worden bij '
        + 'de opname. Een steen uit de handel wijkt bijna altijd af van een gevel van '
        + 'vijftig jaar oud.');
    }
    if (doet('scheurherstel')) {
      var sm = Math.max(1, st.scheurmeter || 0);
      post('Scheurherstel', 'Roestvast spiraalanker, 1 m', op(sm * 2, 1), 'st',
           'twee per strekkende meter scheur, om en om in de lintvoeg');
      post('Scheurherstel', 'Injectiemortel voor spiraalankers', op(sm * 0.4, 1), 'L',
           'ca. 0,4 L per meter');
      uur('Scheuren uitzagen, ankers zetten en dichtzetten, ' + sm + ' m', 0.5 * sm);
      controle.push('Loopt een scheur door tot in het metselwerk onder maaiveld, dan is '
        + 'het geen gevelwerk maar een funderingsvraag. Dat hoort voor de opname '
        + 'vastgesteld te worden.');
    }

    /* ------------------------------------------------------------ stucwerk */
    if (doet('stucherstel')) {
      var shm2 = Math.max(1, st.herstelopp || 0);
      post('Stucwerk', 'Reparatiestucmortel',
           op(STUC_KG_M2_PER_MM * STUC_REPARATIE_MM * shm2 / 25, 1), 'zak',
           'zakken van 25 kg; ' + STUC_REPARATIE_MM + ' mm dik over ' + shm2 + ' m\u00b2');
      post('Stucwerk', 'Voorstrijk', rond1(PRIMER_L_M2 * shm2), 'L', 'op de kale ondergrond');
      uur('Losse stuc afhakken en plaatselijk aanhelen, ' + shm2 + ' m\u00b2', 0.7 * shm2);
    }
    if (doet('opnieuw-gestuct')) {
      post('Stucwerk', 'Minerale stucmortel',
           op(STUC_KG_M2_PER_MM * STUC_DIKTE_MM * m2 / 25, 1), 'zak',
           'zakken van 25 kg; ' + STUC_DIKTE_MM + ' mm dik over ' + m2 + ' m\u00b2');
      post('Stucwerk', 'Wapeningsweefsel glasvezel', op(m2 * 1.1, 1), 'm\u00b2',
           '10% overlap op de naden');
      post('Stucwerk', 'Hoekprofielen met weefsel', op(m2 / 6, 1), 'm',
           'raamdagkanten en buitenhoeken, geschat op ' + Math.round(m2 / 6) + ' m');
      post('Stucwerk', 'Voorstrijk', rond1(PRIMER_L_M2 * m2), 'L', '');
      uur('Stucwerk aanbrengen en afwerken, ' + m2 + ' m\u00b2', 0.45 * m2);
      controle.push('De lengte aan hoekprofielen is geschat uit het geveloppervlak. Tel '
        + 'bij de opname de werkelijke dagkanten en buitenhoeken.');
    }
    if (doet('geschilderd')) {
      post('Schilderwerk', 'Gevelverf, mat minerale verf',
           rond1(VERF_L_M2_LAAG * 2 * m2), 'L', 'twee lagen \u00e0 ' + komma(VERF_L_M2_LAAG) + ' L/m\u00b2');
      post('Schilderwerk', 'Voorstrijk', rond1(PRIMER_L_M2 * m2), 'L', '');
      uur('Schilderen, twee lagen over ' + m2 + ' m\u00b2', 0.30 * m2);
    }

    /* ---------------------------------------------------------- impregneren */
    if (doet('impregneren')) {
      post('Impregneren', 'Impregneermiddel op siloxaanbasis',
           rond1(IMPREGNEER_L_M2 * m2), 'L',
           komma(IMPREGNEER_L_M2) + ' L/m\u00b2 op een zuigende gevel; op dichte steen minder');
      uur('Impregneren, ' + m2 + ' m\u00b2', 0.06 * m2);
      aannames.push('Impregneren kan pas als de gevel droog is. Reken op twee droge '
        + 'dagen tussen de laatste natte bewerking en het impregneren.');
    }

    /* -------------------------------------------------- steiger en algemeen */
    if (st.steiger) {
      post('Steiger', 'Gevelsteiger', m2, 'm\u00b2', 'zelfde oppervlak als de gevel');
      var weken = Math.max(1, Math.ceil(
        (uren.reduce(function (s, u) { return s + u[1]; }, 0)) / 16 / 5));
      post('Steiger', 'Huur gevelsteiger', weken, 'week',
           'op basis van ca. ' + weken * 5 + ' werkdagen met twee man');
      uur('Steiger op- en afbouwen', 0.08 * m2);
    } else {
      aannames.push('Er is geen steiger gerekend. Boven tweeeneenhalve meter werkhoogte '
        + 'is die verplicht; deze staat gaat er dus van uit dat de gevel vanaf de grond '
        + 'of vanaf een rolsteiger bereikbaar is.');
    }

    post('Algemeen', 'Afdekfolie', op(m2 * 0.4, 5), 'm\u00b2',
         'kozijnen, deuren en beplanting afdekken');
    post('Algemeen', 'Afplaktape voor buiten', op(m2 / 12, 1), 'rol', '');
    if (doet('uitgehakt') || doet('steenherstel') || doet('stucherstel')
        || doet('opnieuw-gestuct')) {
      post('Algemeen', 'Afvoer puin en gruis', op(m2 / 30, 1), 'big bag',
           'een big bag per ca. 30 m\u00b2 hak- en freeswerk');
    }

    /* -------------------------------------------------------------- aannames */
    aannames.push('Het geveloppervlak van ' + m2 + ' m\u00b2 is opgegeven door de bezoeker en '
      + 'niet ingemeten. Kozijnen zijn er niet uit gerekend.');
    aannames.push('De hoeveelheden gaan uit van waalformaat metselwerk met een voeg van '
      + '12,5 mm. Een andere steenmaat verandert vooral de voegmortel.');
    aannames.push('De uren zijn gerekend met twee man en normale bereikbaarheid, zonder '
      + 'verkeersmaatregelen en zonder werk boven water of over een dak.');

    var totaalUren = uren.reduce(function (s, u) { return s + u[1]; }, 0);
    return {
      regels: r,
      uren: uren.map(function (u) { return { wat: u[0], uren: rond1(u[1]) }; }),
      totaalUren: rond1(totaalUren),
      dagen: Math.max(1, Math.round(totaalUren / 16 * 10) / 10),
      aannames: aannames,
      controle: controle
    };
  }

  function nl(n) { return n.toLocaleString('nl-NL'); }

  function tekst(s) {
    var r = ['MATERIAALSTAAT: WERKVOORBEREIDING', ''];
    var groep = null;
    s.regels.forEach(function (x) {
      if (x.groep !== groep) { groep = x.groep; r.push('', groep.toUpperCase()); }
      r.push('  ' + nl(x.aantal) + ' ' + x.eh + '  ' + x.wat + (x.noot ? '  (' + x.noot + ')' : ''));
    });
    r.push('', 'ARBEID');
    s.uren.forEach(function (u) { r.push('  ' + nl(u.uren) + ' uur  ' + u.wat); });
    r.push('  ' + nl(s.totaalUren) + ' uur totaal, ca. ' + nl(s.dagen)
           + ' werkdagen met twee man');
    if (s.aannames.length) {
      r.push('', 'AANNAMES'); s.aannames.forEach(function (a) { r.push('  - ' + a); });
    }
    if (s.controle.length) {
      r.push('', 'NA TE METEN BIJ DE OPNAME');
      s.controle.forEach(function (c) { r.push('  ! ' + c); });
    }
    return r.join('\n');
  }

  global.NGGevelStaat = { staat: staat, tekst: tekst };
})(typeof window !== 'undefined' ? window : globalThis);
