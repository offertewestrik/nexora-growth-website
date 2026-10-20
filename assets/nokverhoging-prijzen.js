/* Prijsstructuur van de nokverhogingconfigurator.
 *
 * INDICATIEVE RICHTPRIJZEN — TE VERVANGEN DOOR DIE VAN DE FABRIKANT.
 * Marktconforme richtprijzen, geen offerteprijzen. Alles EXCL. btw en inclusief
 * plaatsing, het openleggen en dichtzetten van de kap, lood- en zetwerk en
 * afvoer van het sloopmateriaal.
 *
 * WAAROM EEN NOKVERHOGING EEN VEELVOUD VAN EEN DAKKAPEL KOST
 * Bij een dakkapel komt er een gat in de kap. Bij een nokverhoging gaat de kap
 * eraf: nieuwe nokgording, nieuwe of verlengde sporen, de kopgevel omhoog, en
 * het hele dakvlak opnieuw gedekt. De woning staat daarbij open, dus er hoort
 * ook een tijdelijke overkapping bij. Dat is een ander soort project, en dat
 * hoort in de basisprijs terug te komen in plaats van in de kleine lettertjes.
 *
 * PER INDELING, NIET PER METER — net als bij de dakkapel, en om dezelfde reden:
 * er mag geen breedte aan een kozijnindeling hangen tot de fabrikant die heeft
 * bevestigd.
 */
(function (global) {
  'use strict';

  var BTW = 0.21;

  var BASIS = {
    prefab:       { 2: 14500, 3: 16800, 4: 19200, 5: 21800, 6: 24500 },
    traditioneel: { 2: 18200, 3: 21000, 4: 24000, 5: 27300, 6: 30600 }
  };

  /* Toeslag op de gevelafwerking, per glasvak. */
  var AFWERKING = {
    creme: 0, lichtgrijs: 0, antraciet: 0, zwart: 55, thermowood: 260, 'zink-platen': 330
  };

  var KOZIJNKLEUR = { wit: 0, creme: 245, antraciet: 245, zwart: 310 };
  var DRAAIEND = 395;
  var OPTIE = { rolluiken: 445, screens: 385, rooster: 75, spots: 110 };

  var EXTRA = {
    triple:  { perVak: 95 },
    horren:  { perDraai: 70 },
    dakraam: { vast: 1850 }
  };
  var BINNEN = {
    casco:      { perVak: 0,   vast: 0 },
    gipsplaten: { perVak: 210, vast: 450 },
    afgewerkt:  { perVak: 390, vast: 750 }
  };

  /* Woningtype: elke vrije kopgevel moet mee omhoog, en dat is metsel- of
     timmerwerk op hoogte. Bij een tussenwoning zit die kop tegen de buren aan
     en komt er in plaats daarvan aansluitwerk op twee bouwmuren. */
  var KOPGEVEL = 2350;
  var BOUWMUUR_AANSLUITING = 1150;

  /* Een nokverhoging verandert de bouwhoogte: vergunning, welstandstoets en
     constructieberekening horen er altijd bij en zitten daarom vast in de
     prijs in plaats van als optie. Leges van de gemeente zitten er niet in. */
  var VERGUNNING = 1950;

  function regels(keuze, regelset) {
    var R = regelset || global.NGNokverhogingRegels;
    var vk = keuze.glasvakken, uit = [];
    var basis = (BASIS[keuze.uitvoering] || BASIS.prefab)[vk] || 0;
    var uitvoering = R ? R.vind(R.uitvoeringen, keuze.uitvoering) : { l: keuze.uitvoering };
    var afw = R ? R.vind(R.afwerkingen, keuze.afwerking) : { l: keuze.afwerking };
    var koz = R ? R.vind(R.kozijnkleuren, keuze.kozijnkleur) : { l: keuze.kozijnkleur };
    var won = R ? R.vind(R.woningtypen, keuze.woningtype) : { l: '', kopgevels: 1 };

    uit.push({ t: uitvoering.l + ' nokverhoging, ' + vk + ' glasvakken, casco geplaatst', p: basis });

    if (won.kopgevels) {
      uit.push({ t: won.kopgevels + '× vrije kopgevel mee omhoog (' + won.l.toLowerCase() + ')',
                 p: KOPGEVEL * won.kopgevels });
    }
    var muren = 2 - won.kopgevels;
    if (muren > 0) {
      uit.push({ t: muren + '× aansluiting op de woningscheidende bouwmuur', p: BOUWMUUR_AANSLUITING * muren });
    }

    var pa = (AFWERKING[keuze.afwerking] || 0) * vk;
    if (pa) uit.push({ t: 'Gevelafwerking: ' + afw.l.toLowerCase(), p: pa });

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

    uit.push({ t: 'Omgevingsvergunning: tekeningen, constructieberekening en begeleiding', p: VERGUNNING });
    return uit;
  }

  function totaal(keuze, regelset) {
    return regels(keuze, regelset).reduce(function (s, r) { return s + r.p; }, 0);
  }

  global.NGNokverhogingPrijzen = {
    btw: BTW, basis: BASIS, afwerking: AFWERKING, kozijnkleur: KOZIJNKLEUR,
    draaiend: DRAAIEND, optie: OPTIE, extra: EXTRA, binnen: BINNEN,
    kopgevel: KOPGEVEL, bouwmuur: BOUWMUUR_AANSLUITING, vergunning: VERGUNNING,
    regels: regels, totaal: totaal, indicatief: true
  };
})(typeof window !== 'undefined' ? window : globalThis);
