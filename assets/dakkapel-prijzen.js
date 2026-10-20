/* Prijsstructuur van de dakkapelconfigurator.
 *
 * INDICATIEVE RICHTPRIJZEN — TE VERVANGEN DOOR DIE VAN DE FABRIKANT.
 * De bedragen hieronder zijn marktconforme richtprijzen, geen offerteprijzen.
 * Ze staan in dit ene bestand zodat ze vervangen kunnen worden zonder de
 * configurator zelf aan te raken. Alles is EXCL. btw en inclusief plaatsing,
 * het openen en dichtzetten van het dakvlak, lood- en zetwerk en afvoer van
 * het sloopmateriaal.
 *
 * WAAROM ER PER GLASVAK GEREKEND WORDT EN NIET PER METER
 * De briefing is er stellig over: er mag geen metermaat aan een kozijnindeling
 * worden gehangen tot de fabrikant heeft bevestigd welke breedte bij welke
 * indeling technisch geldig is. Een prijs per strekkende meter zou die maat
 * langs de achterdeur alsnog het scherm in brengen. Daarom is de indeling zelf
 * de prijsdrager: twee tot en met zes glasvakken, elk met een eigen basisprijs.
 */
(function (global) {
  'use strict';

  var BTW = 0.21;

  /* Basisprijs per indeling, per uitvoering. Casco geplaatst: buitenkant af,
     binnenzijde nog niet afgewerkt (zie EXTRA.binnenafwerking). */
  var BASIS = {
    prefab:       { 2: 5400, 3: 6600, 4: 7900, 5: 9300, 6: 10700 },
    traditioneel: { 2: 7100, 3: 8600, 4: 10200, 5: 11900, 6: 13600 }
  };

  /* Toeslag op de buitenafwerking, per glasvak: een bredere dakkapel heeft
     meer wangen, boeideel en bekleding, en dat schaalt met de indeling. */
  var AFWERKING = {
    creme: 0, lichtgrijs: 0, antraciet: 0, zwart: 45, thermowood: 210, 'zink-platen': 265
  };

  /* Kozijnkleur. Wit is de standaardkleur van de reeks; een afwijkende RAL
     is een eenmalige toeslag op de hele kozijnconstructie, niet per vak. */
  var KOZIJNKLEUR = { wit: 0, creme: 195, antraciet: 195, zwart: 245 };

  /* Draaikiepraam ten opzichte van vast glas, per stuk. */
  var DRAAIEND = 365;

  /* Opties met een eigen render, per glasvak. */
  var OPTIE = { rolluiken: 395, screens: 345, rooster: 65, spots: 95 };

  /* Bijkomende keuzes. `perVak` schaalt met de indeling, `perDraai` met het
     aantal draaiende delen, `vast` is een eenmalig bedrag. */
  var EXTRA = {
    triple: { perVak: 85 },
    horren: { perDraai: 70 }
  };

  /* Binnenafwerking in drie niveaus. Casco is de basis en kost niets extra —
     dat is waar de basisprijs op staat. */
  var BINNEN = {
    casco:      { perVak: 0,   vast: 0 },
    gipsplaten: { perVak: 150, vast: 250 },
    afgewerkt:  { perVak: 290, vast: 420 }
  };

  /* Tekeningen en begeleiding van de omgevingsvergunning. Alleen als het
     dakvlak er een vraagt; leges van de gemeente zitten er niet in. */
  var VERGUNNING = 875;

  function regels(keuze, regelset) {
    var R = regelset || global.NGDakkapelRegels;
    var vk = keuze.glasvakken, uit = [];
    var basis = (BASIS[keuze.uitvoering] || BASIS.prefab)[vk] || 0;
    var uitvoering = R ? R.vind(R.uitvoeringen, keuze.uitvoering) : { l: keuze.uitvoering };
    var afw = R ? R.vind(R.afwerkingen, keuze.afwerking) : { l: keuze.afwerking };
    var koz = R ? R.vind(R.kozijnkleuren, keuze.kozijnkleur) : { l: keuze.kozijnkleur };

    uit.push({ t: uitvoering.l + ' dakkapel, ' + vk + ' glasvakken, casco geplaatst', p: basis });

    var pa = (AFWERKING[keuze.afwerking] || 0) * vk;
    if (pa) uit.push({ t: 'Buitenafwerking: ' + afw.l.toLowerCase(), p: pa });

    var pk = KOZIJNKLEUR[keuze.kozijnkleur] || 0;
    if (pk) uit.push({ t: 'Kozijnkleur ' + koz.l.toLowerCase() + ' (' + koz.d + ')', p: pk });

    if (keuze.draaiend) {
      var vast = vk - keuze.draaiend;
      uit.push({ t: keuze.draaiend + '× draaikiepraam, overige ' + vast + (vast === 1 ? ' vak' : ' vakken') + ' vast glas',
                 p: DRAAIEND * keuze.draaiend });
    }

    (R ? R.opties : []).forEach(function (o) {
      if (!keuze.opties || !keuze.opties[o.v]) return;
      uit.push({ t: o.l + ' (' + vk + ' vakken)', p: (OPTIE[o.v] || 0) * vk });
    });

    (R ? R.extras : []).forEach(function (e) {
      if (!keuze.extras || !keuze.extras[e.v]) return;
      var s = EXTRA[e.v] || {}, p = (s.vast || 0) + (s.perVak || 0) * vk + (s.perDraai || 0) * (keuze.draaiend || 0);
      if (p) uit.push({ t: e.l, p: p });
    });

    var bn = BINNEN[keuze.binnen] || BINNEN.casco;
    var pbn = (bn.vast || 0) + (bn.perVak || 0) * vk;
    if (pbn) {
      var bl = R ? R.vind(R.binnenafwerking, keuze.binnen) : { l: keuze.binnen };
      uit.push({ t: 'Binnenafwerking: ' + bl.l.toLowerCase(), p: pbn });
    }

    var dv = R ? R.vind(R.dakvlakken, keuze.dakvlak) : { vergunning: false, l: '' };
    if (dv.vergunning) {
      uit.push({ t: 'Omgevingsvergunning: tekeningen en begeleiding (' + dv.l.toLowerCase() + ')', p: VERGUNNING });
    }
    return uit;
  }

  function totaal(keuze, regelset) {
    return regels(keuze, regelset).reduce(function (s, r) { return s + r.p; }, 0);
  }

  global.NGDakkapelPrijzen = {
    btw: BTW, basis: BASIS, afwerking: AFWERKING, kozijnkleur: KOZIJNKLEUR,
    draaiend: DRAAIEND, optie: OPTIE, extra: EXTRA, binnen: BINNEN, vergunning: VERGUNNING,
    regels: regels, totaal: totaal,
    indicatief: true
  };
})(typeof window !== 'undefined' ? window : globalThis);
