/* Bemanningsmodule van de jachtconfigurator.
 *
 * Geeft een transparante bemanningsindicatie voor de gekozen samenstelling.
 * Transparant betekent hier: elk getal is herleidbaar. De basis komt uit de
 * modeltabel (door de werf per model ingevoerd, niet afgeleid uit alleen de
 * lengte), en elke bijstelling door een gekozen optie wordt met reden
 * benoemd in plaats van stilletjes opgeteld.
 *
 * De module verzint geen wettelijke aantallen. Het onderscheid dat zij maakt:
 *   min        wat de werf als technisch minimum heeft ingevoerd
 *   aanbevolen wat de werf aanraadt, plus gemotiveerde bijstellingen
 *   max        de slaapcapaciteit voor bemanning aan boord
 * De juridische kant (vlagstaat, klasse, vaargebied) blijft uitdrukkelijk
 * buiten de berekening en staat in de verplichte disclaimer.
 */
(function (global) {
  'use strict';

  /* Taal: rolnamen staan met een _en-veld in de lijst hieronder, losse
     woorden lopen via het woordenboek. Zonder taallaag verandert er niets. */
  function TT(z) { return (global.NGTaal && global.NGTaal.T) ? global.NGTaal.T(z) : z; }
  function rolNaam(r) { return (global.NGTaal && global.NGTaal.veld) ? global.NGTaal.veld(r, 'rol') : r.rol; }

  /* Functies aan boord, oplopend met de omvang van het schip. De grens is
     het aanbevolen aantal: de lijst toont welke rollen daar in de praktijk
     bij horen, niet meer dan dat. */
  var FUNCTIES = [
    { vanaf: 1, rol: 'Kapitein / schipper', rol_en: 'Captain / skipper' },
    { vanaf: 2, rol: 'Dekbemanning', rol_en: 'Deckhand' },
    { vanaf: 3, rol: 'Eerste officier', rol_en: 'First officer' },
    { vanaf: 4, rol: 'Engineer', rol_en: 'Engineer' },
    { vanaf: 5, rol: 'Chef-kok', rol_en: 'Chef' },
    { vanaf: 6, rol: 'Chief steward/stewardess', rol_en: 'Chief steward/stewardess' },
    { vanaf: 7, rol: 'Service- en interieurcrew', rol_en: 'Service and interior crew' }
  ];

  /**
   * @param st  de configuratiestand (model, opties, motorisering …)
   * @param D   NGJachtData
   * @returns   { beschikbaar, min, aanbevolen, max, hutten, functies,
   *             redenen, professioneel, zelfstandig, melding }
   */
  function bereken(st, D) {
    var m = null;
    D.modellen.forEach(function (x) { if (x.v === st.model) m = x; });
    if (!m) return { beschikbaar: false, melding: 'Onbekend model.' };

    if (m.bemanningMin === null || m.bemanningMin === undefined) {
      /* Geen basiswaarden ingevoerd: dan ook geen indicatie. Een verzonnen
         bemanningsgetal oogt betrouwbaar en is precies daarom gevaarlijk. */
      return {
        beschikbaar: false,
        melding: 'De werf heeft voor dit model nog geen bemanningswaarden ingevoerd ' +
                 '(bemanningMin, bemanningAanbevolen, bemanningMax, bemanningHutten in de modeltabel). ' +
                 'Tot die tijd toont het dossier hier geen aantallen.'
      };
    }

    var aanbevolen = m.bemanningAanbevolen;
    var redenen = [];
    /* de opbouw van de aanbeveling, term voor term — zodat het dossier de
       som kan laten zien: "3 basis + 1 tenderkraan = 4 aanbevolen" */
    var opbouw = [{ n: m.bemanningAanbevolen, label: TT('basis') }];

    /* Gemotiveerde bijstellingen door de gekozen configuratie. Elke regel
       verhoogt alleen de AANBEVELING — het door de werf ingevoerde minimum
       en de slaapcapaciteit staan vast. */
    var opties = st.opties || [];
    if (opties.indexOf('tenderkraan') > -1 && m.loa >= 20) {
      aanbevolen += 1;
      opbouw.push({ n: 1, label: 'tender en kraan' });
      redenen.push('Tender en kraan aan boord: één extra dekbemanningslid aanbevolen voor het te water laten en bergen.');
    }
    if (opties.indexOf('jacuzzi') > -1 && m.loa >= 25) {
      redenen.push('Jacuzzi hoog in het schip: geen extra bemanning, wel dagelijkse technische controle door de bestaande crew.');
    }
    if (st.motorisering === 'hybride') {
      redenen.push('Diesel-elektrische installatie: bij deze omvang geen extra bemanning, maar de engineer of schipper heeft kennis van het hybridesysteem nodig.');
    }
    if (st.motorisering === 'hybride' && m.bemanningAanbevolen >= 4) {
      aanbevolen += 0; /* engineer zit al in de aanbevolen bezetting */
    }
    if (opties.indexOf('satelliet') > -1 && m.loa >= 30) {
      redenen.push('Satellietcommunicatie: beheer valt binnen de bestaande bezetting.');
    }

    /* De aanbeveling kan nooit boven de slaapcapaciteit uitkomen; wie meer
       nodig heeft dan er kan slapen, heeft een ander schip nodig. Dat wordt
       benoemd in plaats van stil afgekapt. */
    if (aanbevolen > m.bemanningMax) {
      redenen.push('De aanbevolen bezetting (' + aanbevolen + ') overschrijdt de slaapcapaciteit voor bemanning (' +
        m.bemanningMax + '); bespreek met de werf of de indeling hierop aangepast kan worden.');
      aanbevolen = m.bemanningMax;
    }

    var functies = FUNCTIES.filter(function (f) { return f.vanaf <= aanbevolen; })
                           .map(function (f) { return rolNaam(f); });

    /* Zelfstandig varen: alleen bij een technisch minimum van nul en een
       schip onder de vaarbewijsgrens van 25 meter spreekt de module dat uit. */
    var zelfstandig;
    if (m.bemanningMin === 0 && m.loa < 25) {
      zelfstandig = { kan: true, uitleg: 'Dit model is er op gebouwd om zonder vaste bemanning gevaren te worden. Voor langere tochten en nachtelijke overtochten blijft een tweede ervaren opvarende verstandig.' };
    } else if (m.loa < 25) {
      zelfstandig = { kan: false, uitleg: 'Zelfstandig varen is denkbaar voor een zeer ervaren eigenaar, maar de werf voert een technisch minimum van ' + m.bemanningMin + ' op voor dit model.' };
    } else {
      zelfstandig = { kan: false, uitleg: 'Bij deze omvang is professioneel bemande exploitatie de aangewezen vorm.' };
    }

    return {
      beschikbaar: true,
      min: m.bemanningMin,
      aanbevolen: aanbevolen,
      max: m.bemanningMax,
      hutten: m.bemanningHutten,
      opbouw: opbouw,
      functies: functies,
      redenen: redenen,
      professioneel: m.loa >= 25 || aanbevolen >= 4,
      zelfstandig: zelfstandig
    };
  }

  global.NGJachtBemanning = { bereken: bereken };
})(typeof window !== 'undefined' ? window : globalThis);
