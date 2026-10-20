/* De Nederlandse bouwregels waar de tekeningen en de materiaalstaat aan
 * getoetst worden.
 *
 * WAAROM DIT EEN EIGEN BESTAND IS
 * Een configurator die een uitbouw van 2,80 m tot de dakrand tekent, tekent
 * daarmee ook een vrije hoogte van 2,41 m — en dat is onder het nieuwbouw-
 * niveau van 2,60 m. Dat soort dingen valt niemand op zolang er alleen een
 * foto staat. Zodra er een tekening is, kan het wél opvallen, en dan hoort
 * het ook opgemerkt te worden. Deze module is de plek waar één keer staat
 * wat de eis is, zodat de tekening, de materiaalstaat en het dossier niet
 * ieder hun eigen versie van "voldoet" hebben.
 *
 * WAT HET WEL EN NIET IS
 * Dit is een TOETS OP HOOFDLIJNEN op de eisen die uit de geometrie en de
 * opbouw volgen: warmteweerstand, vrije hoogte, daglicht, ventilatie en de
 * trap. Het is geen vergunningstoets. Constructie, brandveiligheid,
 * geluidwering, welstand, bestemmingsplan en vergunningvrij bouwen zitten er
 * nadrukkelijk niet in en staan als zodanig in de uitvoer.
 *
 * VERBOUW OF NIEUWBOUW
 * Een uitbouw aan een bestaande woning is juridisch verbouw. Daar geldt het
 * rechtens verkregen niveau met een ondergrens die veel lager ligt dan
 * nieuwbouw. Wij tekenen en toetsen op nieuwbouwniveau, want dat is wat er
 * gebouwd wordt, maar de module zegt bij elk oordeel welk niveau het betreft.
 * Een uitbouw die "niet voldoet" aan nieuwbouw is dus niet meteen
 * onvergunbaar — dat verschil weglaten zou de toets waardeloos maken.
 *
 * BRONNEN
 * Besluit bouwwerken leefomgeving (Bbl, sinds 1 januari 2024), dat de eisen
 * van Bouwbesluit 2012 met dezelfde getallen heeft overgenomen. Warmte-
 * weerstand volgens NEN 1068 / NEN-EN ISO 6946. De lambdawaarden hieronder
 * zijn gangbare rekenwaarden; een fabrikant met een geldige verklaring mag
 * een gunstigere waarde hebben, en die gaat dan voor.
 */
(function (global) {
  'use strict';

  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function rond(v, n) { var p = Math.pow(10, n || 0); return Math.round(v * p) / p; }

  /* -------------------------------------------------- warmtegeleiding ----- */

  /* Rekenwaarden in W/(m·K). Waar een reeks gangbaar is, staat de
     ongunstigste kant van die reeks: een isolatiewaarde die op papier beter
     is dan in het werk is erger dan geen berekening. */
  var LAMBDA = {
    baksteen: 0.90, steenstrip: 0.90, metselwerk: 0.90,
    kalkzandsteen: 1.10, betonsteen: 1.30, cellenbeton: 0.16,
    beton: 2.30, dekvloer: 1.20, anhydriet: 1.20, tegel: 1.30,
    minerale_wol: 0.035, glaswol: 0.035, eps: 0.036, eps_hr: 0.032,
    pir: 0.022, resol: 0.021, houtvezel: 0.040,
    hout: 0.13, osb: 0.13, multiplex: 0.17, underlayment: 0.13,
    gipskarton: 0.25, gipspleister: 0.52, sierpleister: 0.52, spuitwerk: 0.52,
    kunststof_paneel: 0.17, composiet: 0.25, natuursteen: 2.50,
    epdm: 0.20, bitumen: 0.23, folie: 0.23, zand: 1.40, grind: 1.40,
    sedum: 0.60
  };

  /* Warmteovergangsweerstanden (NEN-EN ISO 6946). Ze horen NIET bij de Rc —
     die is de weerstand van de constructie zelf — maar wel bij de U-waarde,
     dus staan ze hier en niet in de optelling. */
  var OVERGANG = {
    gevel: { si: 0.13, se: 0.04 },
    dak:   { si: 0.10, se: 0.04 },
    vloer: { si: 0.17, se: 0.04 }
  };

  /* Stilstaande luchtlaag, verticaal, vanaf 25 mm (NEN-EN ISO 6946 tabel).
     Een zwak geventileerde spouw telt voor de helft; een sterk geventileerde
     spouw telt niet mee en alles wat er buiten ligt evenmin — dat is de regel
     die een gemetseld buitenblad uit de berekening haalt, en die vergeten
     levert een spouwmuur op die op papier een halve Rc te goed doet. */
  var R_SPOUW_GESLOTEN = 0.18;

  /* Een laag is [naam, mm, sleutel-of-lambda, opties].
     opties:
       spouw: 'gesloten' | 'zwak' | 'sterk'   — luchtlaag in plaats van materiaal
       hout: 0..1                              — houtaandeel in een regelwerklaag
       lambdaHout: getal                       — standaard vuren, 0,13
       teltNiet: true                          — afwerking zonder isolerende waarde
     Een laag zonder lambda telt als 0 en zegt dat ook. */
  function laagR(l) {
    var opt = l[3] || {};
    var d = num(l[1], 0) / 1000;
    if (opt.spouw) {
      if (opt.spouw === 'gesloten') return R_SPOUW_GESLOTEN;
      if (opt.spouw === 'zwak') return R_SPOUW_GESLOTEN / 2;
      return 0;                                    // sterk geventileerd
    }
    var lam = typeof l[2] === 'number' ? l[2] : LAMBDA[l[2]];
    if (!lam || !d) return 0;
    if (opt.hout) {
      /* Regelwerk met isolatie ertussen: het hout is de koudebrug. De
         eenvoudige parallelle middeling (bovengrens uit NEN 1068) volstaat
         hier; hij ligt aan de ongunstige kant van de gedetailleerde methode. */
      var lamHout = num(opt.lambdaHout, LAMBDA.hout);
      lam = (1 - opt.hout) * lam + opt.hout * lamHout;
    }
    return d / lam;
  }

  /* De warmteweerstand van een hele opbouw, van buiten naar binnen genoteerd.
     Zodra er een sterk geventileerde spouw in zit, telt alles daarbuiten niet
     meer mee — de lagen worden dus van binnen naar buiten opgeteld tot die
     spouw. */
  function rc(lagen) {
    lagen = lagen || [];
    var eerste = -1;
    for (var i = 0; i < lagen.length; i++) {
      var o = lagen[i][3] || {};
      if (o.spouw === 'sterk') { eerste = i; break; }
    }
    var vanaf = eerste === -1 ? 0 : eerste + 1;
    var som = 0, onbekend = [];
    for (var j = vanaf; j < lagen.length; j++) {
      var r = laagR(lagen[j]);
      if (!r && !(lagen[j][3] || {}).teltNiet && num(lagen[j][1], 0) > 3) onbekend.push(lagen[j][0]);
      som += r;
    }
    return {
      rc: rond(som, 2),
      buitenbladBuitenBeschouwing: eerste !== -1,
      onbekend: onbekend,
      dikte: lagen.reduce(function (a, l) { return a + num(l[1], 0); }, 0)
    };
  }

  function u(rcWaarde, onderdeel) {
    var o = OVERGANG[onderdeel] || OVERGANG.gevel;
    return rond(1 / (rcWaarde + o.si + o.se), 2);
  }

  /* ------------------------------------------------------------ eisen ----- */

  /* Bbl afdeling 4.4 (energiezuinigheid) — dezelfde getallen als Bouwbesluit
     2012 artikel 5.3. Verbouw kent het rechtens verkregen niveau met een
     ondergrens van Rc 1,3. */
  var RC_EIS = {
    nieuwbouw: { gevel: 4.7, vloer: 3.7, dak: 6.3 },
    verbouw:   { gevel: 1.3, vloer: 1.3, dak: 1.3 }
  };
  /* U-waarde ramen, deuren en kozijnen: hoogstens 1,65 W/(m²·K) gemiddeld
     over het gebouw, en hoogstens 2,2 voor een afzonderlijk onderdeel. */
  var U_RAAM = { gemiddeld: 1.65, onderdeel: 2.2 };

  /* Bbl afdeling 4.2 / Bouwbesluit 2012 afdeling 4.4: vrije hoogte van een
     verblijfsgebied. Nieuwbouw 2,60 m, bestaande bouw en verbouw 2,10 m. */
  var VRIJE_HOOGTE = { nieuwbouw: 2.60, verbouw: 2.10 };
  /* Vrije hoogte boven een trap: 2,30 m. */
  var TRAP = { doorloop: 2.30, aantredeMin: 0.22, optredeMax: 0.188, breedteMin: 0.80 };
  /* Daglicht: de equivalente daglichtoppervlakte van een verblijfsgebied is
     ten minste 10% van de vloeroppervlakte (nieuwbouw). De equivalente
     oppervlakte is niet de kozijnmaat maar het glasoppervlak maal een
     factor voor belemmering; zonder gegevens over de omgeving rekenen we
     met het glasoppervlak zelf en zeggen dat erbij. */
  var DAGLICHT = { deelNieuwbouw: 0.10, minVerbouw: 0.50 };
  /* Ventilatie verblijfsruimte: 0,9 dm³/s per m² vloeroppervlakte, met een
     ondergrens van 7 dm³/s per verblijfsruimte. */
  var VENTILATIE = { perM2: 0.9, minimum: 7 };
  /* Vloerafscheiding vanaf 1,0 m hoogteverschil, hoogte ten minste 1,0 m. */
  var AFSCHEIDING = { vanaf: 1.0, hoogte: 1.0 };

  /* Een oordeel is nooit alleen ja of nee: er hoort bij welk niveau getoetst
     is en wat de marge is, anders is "voldoet niet" niet te wegen. */
  function toets(naam, waarde, eis, eenheid, richting, uitleg) {
    var haalt = richting === 'max' ? waarde <= eis : waarde >= eis;
    return {
      naam: naam, waarde: rond(waarde, 2), eis: eis, eenheid: eenheid,
      voldoet: haalt, richting: richting || 'min',
      marge: rond(richting === 'max' ? eis - waarde : waarde - eis, 2),
      uitleg: uitleg || ''
    };
  }

  global.NGBouwnormen = {
    LAMBDA: LAMBDA, RC_EIS: RC_EIS, U_RAAM: U_RAAM, VRIJE_HOOGTE: VRIJE_HOOGTE,
    TRAP: TRAP, DAGLICHT: DAGLICHT, VENTILATIE: VENTILATIE, AFSCHEIDING: AFSCHEIDING,
    OVERGANG: OVERGANG,
    rc: rc, u: u, laagR: laagR, toets: toets,
    /* De vaste tekst die overal onder een toets hoort. Eén plek, want hij
       hoort nergens anders te staan dan hier en hij hoort nergens te
       ontbreken. */
    voorbehoud: 'Toets op hoofdlijnen volgens het Besluit bouwwerken leefomgeving. ' +
      'Constructieve veiligheid, brandveiligheid, geluidwering, bestemmingsplan en ' +
      'welstand zijn hierin niet meegenomen. De vergunningstoets doet het bevoegd gezag.'
  };
})(typeof window !== 'undefined' ? window : globalThis);
