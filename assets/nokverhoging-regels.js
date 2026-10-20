/* Productregels van de nokverhogingconfigurator.
 *
 * Een nokverhoging tilt de nok van het dak omhoog. Het achterdakvlak wordt
 * doorgetrokken tot een nieuwe, hogere noklijn en de kopgevel groeit mee; in
 * die nieuwe gevel komt één doorlopende kozijnconstructie. Je wint stahoogte
 * over de volle breedte van de woning in plaats van alleen ter plaatse van een
 * dakkapel.
 *
 * WAT HET ONDERSCHEIDT VAN DE DAKKAPEL
 * De dakkapel zit ín het dakvlak: de kap blijft staan en er komt een gat in
 * met een raveling eromheen. Bij een nokverhoging gaat de kap zelf omhoog. Dat
 * betekent een nieuwe nokgording, langere of nieuwe sporen, een opgemetselde
 * of opgebouwde kopgevel — en het betekent dat de bouwhoogte verandert.
 *
 * DAAROM STAAT ER GEEN DAKVLAKKEUZE IN
 * Bij een dakkapel bepaalt het dakvlak of er een vergunning nodig is; op het
 * achterdakvlak kan hij vergunningsvrij. Een nokverhoging verandert altijd de
 * bouwhoogte en het aanzicht van de woning, en is daarmee vrijwel nooit
 * vergunningsvrij. Die keuze aanbieden zou suggereren dat er een route is die
 * er niet is; in plaats daarvan zit de vergunning vast in de prijs en staat de
 * welstandstoets in het scherm.
 *
 * Er hangt met opzet géén metermaat aan een indeling, net als bij de dakkapel:
 * welke breedte bij welke kozijnindeling technisch geldig is, moet de
 * fabrikant bevestigen.
 */
(function (global) {
  'use strict';

  var INDELINGEN = [
    { v: 2, l: '2 glasvakken', d: 'Compacte kopgevel' },
    { v: 3, l: '3 glasvakken', d: 'De meest gevraagde indeling' },
    { v: 4, l: '4 glasvakken', d: 'Breed, met twee draaiende delen' },
    { v: 5, l: '5 glasvakken', d: 'Bijna over de volle gevelbreedte' },
    { v: 6, l: '6 glasvakken', d: 'Maximale lichtinval' }
  ];

  /* Gelijk aan de dakkapel: dezelfde zes afwerkingen en vier kozijnkleuren, uit
     dezelfde renderreeks. Wie beide producten aanbiedt, houdt daarmee één
     assortiment in plaats van twee. */
  var AFWERKINGEN = [
    { v: 'creme',       l: 'Crème',      sw: '#E8DFCB', d: 'RAL 9001' },
    { v: 'lichtgrijs',  l: 'Lichtgrijs', sw: '#C2C4C3', d: 'RAL 7035' },
    { v: 'antraciet',   l: 'Antraciet',  sw: '#3A4045', d: 'RAL 7016' },
    { v: 'zwart',       l: 'Zwart',      sw: '#17181A', d: 'RAL 9005' },
    { v: 'thermowood',  l: 'Thermowood', sw: '#6B4A32', d: 'Houtlook' },
    { v: 'zink-platen', l: 'Zinkplaten', sw: '#8E969B', d: 'Vlakke platen' }
  ];

  var KOZIJNKLEUREN = [
    { v: 'wit',       l: 'Wit',       sw: '#F2F1EC', d: 'RAL 9016' },
    { v: 'creme',     l: 'Crème',     sw: '#E8DFCB', d: 'RAL 9001' },
    { v: 'antraciet', l: 'Antraciet', sw: '#3A4045', d: 'RAL 7016' },
    { v: 'zwart',     l: 'Zwart',     sw: '#17181A', d: 'RAL 9005' }
  ];

  var OPTIES = [
    { v: 'rolluiken', l: 'Rolluiken',     d: 'Verduisterend en inbraakwerend', groep: 'zonwering' },
    { v: 'screens',   l: 'Screens',       d: 'Zonwering aan de buitenzijde',   groep: 'zonwering' },
    { v: 'rooster',   l: 'Ventilatierooster', d: 'Doorlopend, boven het glas', groep: 'ventilatie' },
    { v: 'spots',     l: 'LED-spots in het overstek', d: 'Aanlichting van buiten', groep: 'licht' }
  ];

  var EXTRAS = [
    { v: 'triple', l: 'Triple glas', d: 'Stiller en warmer dan HR++' },
    { v: 'horren', l: 'Horren',      d: 'Op de draaiende delen' },
    { v: 'dakraam', l: 'Dakraam in het nieuwe dakvlak', d: 'Licht midden in de ruimte' }
  ];

  /* Drie niveaus, gelijk aan de dakkapel. Van de nokverhoging is nog geen
     binnenaanzicht gerenderd; de keuze staat er wel, want hij bepaalt de prijs
     en de materiaalstaat. */
  var BINNENAFWERKING = [
    { v: 'casco',      l: 'Casco',      d: 'Kaal hout en isolatie in het zicht' },
    { v: 'gipsplaten', l: 'Gipsplaten', d: 'Dichtgezet, klaar om te stucen' },
    { v: 'afgewerkt',  l: 'Afgewerkt',  d: 'Gestuukt, geschilderd, dagkanten af' }
  ];

  /* Het woningtype bepaalt hoeveel kopgevel er opgemetseld moet worden en of er
     met de buren afgestemd moet worden. Bij een tussenwoning zitten er twee
     woningscheidende wanden aan vast, bij een hoekwoning één. */
  var WONINGTYPEN = [
    { v: 'tussen',      l: 'Tussenwoning',  d: 'Twee bouwmuren, geen vrije kopgevel', kopgevels: 0 },
    { v: 'hoek',        l: 'Hoekwoning',    d: 'Eén vrije kopgevel',                  kopgevels: 1 },
    { v: 'twee-onder',  l: 'Twee-onder-een-kap', d: 'Eén vrije kopgevel',             kopgevels: 1 },
    { v: 'vrijstaand',  l: 'Vrijstaand',    d: 'Twee vrije kopgevels',                kopgevels: 2 }
  ];

  var UITVOERINGEN = [
    { v: 'prefab', l: 'Prefab',
      titel: '<span>Prefab</span> nokverhoging',
      sub: 'De nieuwe kap wordt in de werkplaats gebouwd en in één dag op zijn plek gehesen.',
      badge: 'In één dag waterdicht' },
    { v: 'traditioneel', l: 'Traditioneel',
      titel: '<span>Traditionele</span> nokverhoging',
      sub: 'Op de woning zelf opgebouwd: elke kapvorm en hoek kan. Eén tot drie weken.',
      badge: 'Elke kapvorm' }
  ];

  function maxDraaiend(glasvakken) { return glasvakken >= 5 ? 3 : 2; }
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
     bijgehouden in een lijst die na de eerste renderbatch niet meer klopt. */
  function ontbrekend(renders) {
    renders = renders || global.NGNokverhogingRenders;
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

  global.NGNokverhogingRegels = {
    indelingen: INDELINGEN, afwerkingen: AFWERKINGEN, kozijnkleuren: KOZIJNKLEUREN,
    opties: OPTIES, extras: EXTRAS, binnenafwerking: BINNENAFWERKING,
    woningtypen: WONINGTYPEN, uitvoeringen: UITVOERINGEN,
    maxDraaiend: maxDraaiend, draaiVolgorde: draaiVolgorde, vind: vind,
    ontbrekend: ontbrekend
  };
})(typeof window !== 'undefined' ? window : globalThis);
