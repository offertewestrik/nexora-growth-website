/* Productregels van de dakkapelconfigurator.
 *
 * Alles wat bepaalt wát er te kiezen valt staat hier, los van de prijzen
 * (dakkapel-prijzen.js) en los van de beelden (dakkapel-renders.js). Zo kan
 * een fabrikant zijn eigen assortiment samenstellen zonder aan de rest te
 * komen.
 *
 * DE HARDE REGELS UIT DE BRIEFING, HIER VASTGELEGD
 * - De standaardreeks is een rechte dakkapel met plat dak. Lessenaars-,
 *   tongewelfde, klassieke jaren-30- en zevendelige varianten horen bij een
 *   andere productfamilie en staan niet in deze lijst.
 * - Het kozijn is één doorlopende constructie over vrijwel de hele voorkant.
 *   Slanke verticale stijlen verdelen de glasvakken; losse raamkasten met
 *   gevelbekleding ertussen zijn geen standaarduitvoering.
 * - Er hangt met opzet GEEN metermaat aan een indeling. Welke breedte bij
 *   welke kozijnindeling technisch geldig is, moet de fabrikant bevestigen;
 *   tot die tijd zou elke maat in het scherm een verzonnen maat zijn.
 */
(function (global) {
  'use strict';

  /* Vijf vaste geometrische indelingen. `master` verwijst naar de layoutmaster
     uit de renderselectie waar de geometrie vandaan komt. */
  var INDELINGEN = [
    { v: 2, l: '2 glasvakken', d: 'Compact, één slaapkamer of werkplek' },
    { v: 3, l: '3 glasvakken', d: 'De meest gevraagde indeling' },
    { v: 4, l: '4 glasvakken', d: 'Breed, met twee draaiende delen' },
    { v: 5, l: '5 glasvakken', d: 'Bijna over de volle dakbreedte' },
    { v: 6, l: '6 glasvakken', d: 'Maximale lichtinval' }
  ];

  /* De zes gevelafwerkingen van renderpakket v5. Wit is er als gevelkleur
     bewust uit: het pakket levert geen witte gevel, en een kleur aanbieden
     waar geen render bij hoort betekent dat de meest voor de hand liggende
     keuze altijd op een schets uitkomt. Wit bestaat wel als kozijnkleur.
     De uitbreidingsset uit de masterselectie (warmwit, verkeerswit,
     blauwgrijs, satijnaluminium, zandbeige, taupe, chocoladebruin,
     donkergroen, mosgroen) staat in de registry maar nog niet hier. */
  var AFWERKINGEN = [
    { v: 'creme',       l: 'Crème',         sw: '#E8DFCB', d: 'RAL 9001' },
    { v: 'lichtgrijs',  l: 'Lichtgrijs',    sw: '#C2C4C3', d: 'RAL 7035' },
    { v: 'antraciet',   l: 'Antraciet',     sw: '#3A4045', d: 'RAL 7016' },
    { v: 'zwart',       l: 'Zwart',         sw: '#17181A', d: 'RAL 9005' },
    { v: 'thermowood',  l: 'Thermowood',    sw: '#6B4A32', d: 'Houtlook' },
    { v: 'zink-platen', l: 'Zinkplaten',    sw: '#8E969B', d: 'Vlakke platen' }
  ];

  var KOZIJNKLEUREN = [
    { v: 'wit',       l: 'Wit',       sw: '#F2F1EC', d: 'RAL 9016' },
    { v: 'creme',     l: 'Crème',     sw: '#E8DFCB', d: 'RAL 9001' },
    { v: 'antraciet', l: 'Antraciet', sw: '#3A4045', d: 'RAL 7016' },
    { v: 'zwart',     l: 'Zwart',     sw: '#17181A', d: 'RAL 9005' }
  ];

  /* Drie opties met een eigen renderreeks in de planning. Ze sluiten elkaar
     in het beeld uit — rolluik en screen zitten op dezelfde plek — dus mag er
     één zonwering tegelijk aanstaan. Het rooster kan er los bij. */
  var OPTIES = [
    { v: 'rolluiken', l: 'Rolluiken',     d: 'Verduisterend en inbraakwerend', groep: 'zonwering' },
    { v: 'screens',   l: 'Screens',       d: 'Zonwering aan de buitenzijde',   groep: 'zonwering' },
    { v: 'rooster',   l: 'Ventilatierooster', d: 'Doorlopend, boven het glas', groep: 'ventilatie' },
    { v: 'spots',     l: 'LED-spots in het overstek', d: 'Aanlichting van buiten', groep: 'licht' }
  ];

  /* Bijkomende keuzes. `spots` heeft sinds de laatste renderbatch een eigen
     beeld en staat daarom bij OPTIES; triple glas en horren zijn niet te
     fotograferen en horen hier. */
  var EXTRAS = [
    { v: 'triple',  l: 'Triple glas', d: 'Stiller en warmer dan HR++' },
    { v: 'horren',  l: 'Horren',      d: 'Op de draaiende delen' }
  ];

  /* De binnenafwerking was een vinkje: aan of uit. Er zijn nu drie beelden van
     dezelfde zolder vanuit dezelfde hoek — kaal, dichtgezet, afgewerkt — en
     daarmee is het een keuze die de bezoeker kan zíen in plaats van moet
     aannemen. Dat scheelt precies de discussie die anders bij oplevering komt:
     "casco" betekent voor niemand hetzelfde. */
  var BINNENAFWERKING = [
    { v: 'casco',      l: 'Casco',      d: 'Kaal hout en isolatie in het zicht' },
    { v: 'gipsplaten', l: 'Gipsplaten', d: 'Dichtgezet, klaar om te stucen' },
    { v: 'afgewerkt',  l: 'Afgewerkt',  d: 'Gestuukt, geschilderd, dagkanten af' }
  ];

  /* Het dakvlak bepaalt of er een vergunning nodig is. Indicatie, geen
     toezegging: de gemeente heeft het laatste woord en dat staat er in het
     scherm ook bij. */
  var DAKVLAKKEN = [
    { v: 'achter', l: 'Achterdakvlak', d: 'Vaak vergunningsvrij', vergunning: false },
    { v: 'voor',   l: 'Voordakvlak',   d: 'Vergunning nodig',     vergunning: true },
    { v: 'zij',    l: 'Zijdakvlak',    d: 'Vergunning nodig',     vergunning: true }
  ];

  var UITVOERINGEN = [
    { v: 'prefab', l: 'Prefab',
      titel: '<span>Prefab</span> dakkapel',
      sub: 'In de werkplaats gebouwd op de ingemeten maat, in één dag geplaatst.',
      badge: 'In één dag geplaatst' },
    { v: 'traditioneel', l: 'Traditioneel',
      titel: '<span>Traditionele</span> dakkapel',
      sub: 'Op het dak zelf opgebouwd: elke maat en hoek kan. Twee tot vijf werkdagen.',
      badge: 'Elke maat en hoek' }
  ];

  /* Draaiende delen: hoeveel er in een indeling passen. Aan de buitenste
     vakken zitten de grepen op de layoutmasters, dus daar beginnen we ook. */
  function maxDraaiend(glasvakken) { return glasvakken >= 5 ? 3 : 2; }

  /* Welke vakken draaien: buitenste eerst, dan naar binnen. Zo staat een enkel
     draairaam aan de kant waar je het pakt, niet midden in de wand. */
  function draaiVolgorde(n) {
    var uit = [], a = 0, b = n - 1;
    while (a <= b) { uit.push(a); if (a !== b) uit.push(b); a++; b--; }
    return uit;
  }

  function vind(lijst, v) {
    for (var i = 0; i < lijst.length; i++) if (lijst[i].v === v) return lijst[i];
    return lijst[0];
  }

  /* De ontbrekende assets, uitgerekend uit de registry in plaats van
     bijgehouden in een lijst die na de eerste renderbatch niet meer klopt.
     De matrix is drie assen diep: indeling maal gevelafwerking maal
     kozijnkleur, plus één beeld per optie.

     Er wordt getoetst op wat er werkelijk in de registry staat, niet op wat
     een statuskolom belooft: zeven bestanden uit v5 stonden op GEREED maar
     waren nul bytes groot, en die horen hier gewoon bij het werk dat nog
     gedaan moet worden. */
  function ontbrekend(renders) {
    renders = renders || global.NGDakkapelRenders;
    var basis = [], opties = [], gereed = [];
    if (!renders) return { basis: basis, opties: opties, gereed: gereed, totaal: 0 };
    INDELINGEN.forEach(function (i) {
      AFWERKINGEN.forEach(function (a) {
        KOZIJNKLEUREN.forEach(function (k) {
          var r = renders.render(i.v, a.v, k.v);
          var rij = { soort: 'combinatie', glasvakken: i.v, afwerking: a.v, kozijnkleur: k.v,
                      id: i.v + '-vaks|' + a.v + '|' + k.v };
          if (r) { rij.bestand = r.bestand; gereed.push(rij); } else basis.push(rij);
        });
      });
    });
    OPTIES.forEach(function (o) {
      var r = renders.optieBeeld(o.v);
      var rij = { soort: 'optie', optie: o.v, id: 'optie|' + o.v };
      if (r) { rij.bestand = r.bestand; gereed.push(rij); } else opties.push(rij);
    });
    return { basis: basis, opties: opties, gereed: gereed,
             totaal: basis.length + opties.length };
  }

  global.NGDakkapelRegels = {
    indelingen: INDELINGEN, afwerkingen: AFWERKINGEN, kozijnkleuren: KOZIJNKLEUREN,
    opties: OPTIES, extras: EXTRAS, binnenafwerking: BINNENAFWERKING,
    dakvlakken: DAKVLAKKEN, uitvoeringen: UITVOERINGEN,
    maxDraaiend: maxDraaiend, draaiVolgorde: draaiVolgorde, vind: vind,
    ontbrekend: ontbrekend
  };
})(typeof window !== 'undefined' ? window : globalThis);
