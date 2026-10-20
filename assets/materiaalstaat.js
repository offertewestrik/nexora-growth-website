/* Van configuratie naar materiaalstaat — de werkvoorbereiding vooraf.
 *
 * De configurator kent de maten en de keuzes al; daar rolt nu een richtprijs
 * uit. Wat er nog niet uit rolde is wát je moet bestellen. Dat is precies het
 * werk dat anders per aanvraag met de hand gebeurt: hoeveel steenstrips,
 * hoeveel stijlen, welke balken, hoeveel beton, hoeveel bekisting.
 *
 * WAAROM DIT EEN APARTE MODULE IS
 * De prijs is een verkoopgetal en de materiaalstaat is een inkoopgetal. Ze
 * hangen aan dezelfde keuzes maar hebben een andere houdbaarheid: een prijs
 * mag afgerond en commercieel zijn, een bestellijst niet. Door ze te scheiden
 * kan de staat verfijnd worden zonder dat er ergens een prijs verschuift.
 *
 * WAT DIT WEL EN NIET IS
 * Dit is een wérkvoorbereidingsstaat: hoeveelheden om mee in te kopen en te
 * calculeren. Het is geen constructieberekening. Overspanningen, lateien en
 * de doorbraak staan er met een indicatief profiel bij, en elk van die posten
 * komt terug in `controle` — die moeten door de constructeur bevestigd worden
 * voordat er besteld wordt. Een balk die te licht is besteld kost meer dan
 * een balk die te zwaar is berekend.
 *
 * UITGANGSPUNT: PREFAB HOUTSKELETBOUW, PLAT DAK
 * Drie soorten, met `soort` en `vrijstaand` als schakelaars:
 *
 *   uitbouw op de grond   drie nieuwe wanden, de vierde zijde is de bestaande
 *                         gevel met de doorbraak. Strokenfundering, betonvloer.
 *   vrijstaand            tuinstudio of mantelzorgwoning: vier wanden, geen
 *                         doorbraak. Verder gelijk aan de uitbouw.
 *   dakopbouw             staat op de bestaande woning. Geen grondwerk en geen
 *                         fundering, maar wél een trapgat, een aansluiting op
 *                         het bestaande dak en een kraan.
 *
 * BIJ EEN DAKOPBOUW IS GEWICHT DE BEPERKING
 * Een vloer op de grond mag zwaar zijn: 120 mm beton en 80 mm zandcement is
 * ruim 450 kg/m² en de fundering draagt het. Boven op een bestaande woning kan
 * dat niet. De dakopbouw krijgt daarom een houten balklaag met plaatmateriaal
 * en een lichte dekvloer — ongeveer 75 kg/m². Dat is geen bezuiniging maar de
 * enige manier waarop het kán, en het is meteen de reden dat de eerste vraag
 * van zo'n project altijd is of de bestaande constructie het draagt.
 *
 * DE OPBOUW ZOALS WIJ HEM BOUWEN
 * Stijl- en regelwerk SLS 144 × 38 mm, PIR 140 mm in de wand én in het dak,
 * EPS 100 mm onder de vloer op de grond, dampdichte folie aan de binnenzijde
 * en dampopen folie aan de buitenzijde. Dat is de vaste werkwijze; wijkt een
 * project daarvan af, dan hoort dat hier aangepast te worden en niet op de
 * bouw rechtgezet.
 *
 * Wat dat betekent voor de isolatiewaarden: wand en dak komen met PIR 140 op
 * Rc ≈ 6,0 en zitten daarmee ruim boven de nieuwbouweis (gevel 4,7 · dak 6,3
 * uit het Besluit bouwwerken leefomgeving). De vloer op de grond komt met
 * EPS 100 op Rc ≈ 2,9: dat haalt de verbouweis van 2,1 ruim, maar blijft onder
 * de nieuwbouweis van 3,7. Prima voor een uitbouw, die als verbouw telt — maar
 * het is het getal om te controleren zodra er een vergunning bij komt kijken
 * of iemand op nieuwbouwniveau wil opleveren.
 */
(function (global) {
  'use strict';

  /* Snijverlies. Geen veiligheidsmarge op de constructie, maar het stuk dat
     in de container belandt: hoeken, passtukken, overlap. Plaatmateriaal
     verliest meer dan lijnmateriaal, en een visgraat of hoekverband meer dan
     recht werk. */
  var VERLIES = {
    plaat: 1.10,      // OSB, gips, dakbeschot
    isolatiePlaat: 1.07,
    hout: 1.08,       // stijlen en regels, incl. passtukken
    folie: 1.15,      // overlap hoort erbij
    steenstrip: 1.08, // hoeken en passtukken zagen
    epdm: 1.12        // opstanden en overlap
  };

  /* Steenstrip waalformaat 210 × 50 mm met een voeg van 10 mm. Dat is de maat
     die het vaakst geleverd wordt; een andere strip betekent een ander aantal
     per m², dus staat de maat er expliciet bij in plaats van alleen het getal. */
  var STRIP = { l: 0.210, h: 0.050, voeg: 0.010 };

  /* Trapgat voor een rechte Nederlandse vaste trap. 2600 × 900 mm is de maat
     waar een trap met een gebruikelijke aantrede en optrede in past zonder dat
     je met je hoofd tegen de rand komt. Staat als maat vast omdat er drie
     posten uit volgen: de raveling eromheen, de balustrade langs de open kant
     en de aftimmering van de rand. Het vloeroppervlak wordt er bewust niet op
     gekort — plaatmateriaal koop je per plaat, en dat gat zit zelden zo dat
     het een hele plaat scheelt. */
  var TRAPGAT = { l: 2.60, b: 0.90 };

  function stripsPerM2() { return 1 / ((STRIP.l + STRIP.voeg) * (STRIP.h + STRIP.voeg)); }
  function stripsPerM1Hoek() { return 1 / (STRIP.h + STRIP.voeg); }

  /* Indicatieve overspanningen voor gedroogd vuren C24, hart-op-hart 600 mm,
     plat dak met de gebruikelijke belasting (eigen gewicht, isolatie, dakbedekking
     plus sneeuw en een beloopbaar dak). Bewust conservatief: dit getal gaat naar
     de inkoop, niet naar de constructeur, en te zwaar bestellen is goedkoper dan
     twee keer bestellen. Boven de vijf meter houdt vuren op en wordt het gelamineerd
     of staal — dan staat er geen profiel maar een verwijzing. */
  var DAKBALK = [
    { tot: 2.4, profiel: '50 × 175 mm' },
    { tot: 3.0, profiel: '63 × 175 mm' },
    { tot: 3.4, profiel: '63 × 200 mm' },
    { tot: 3.8, profiel: '63 × 225 mm' },
    { tot: 4.2, profiel: '63 × 250 mm' },
    { tot: 4.8, profiel: '75 × 250 mm' }
  ];
  function dakbalkProfiel(overspanning) {
    for (var i = 0; i < DAKBALK.length; i++) {
      if (overspanning <= DAKBALK[i].tot) return DAKBALK[i].profiel;
    }
    return null;   // te ver voor vuren: gelamineerd of staal, door constructeur
  }

  /* Een stalen ligger voor de doorbraak. Deze tabel is grof en met opzet:
     hij bepaalt niet wat er komt, hij bepaalt wat er in de calculatie staat
     tot de constructeur het echte profiel geeft. */
  var LATEI = [
    { tot: 2.0, profiel: 'HEA 120' },
    { tot: 3.0, profiel: 'HEA 140' },
    { tot: 4.0, profiel: 'HEA 160' },
    { tot: 5.0, profiel: 'HEA 180' },
    { tot: 6.0, profiel: 'HEA 200' }
  ];
  function lateiProfiel(breedte) {
    for (var i = 0; i < LATEI.length; i++) if (breedte <= LATEI[i].tot) return LATEI[i].profiel;
    return null;
  }

  function n(x) { return Math.round(x * 100) / 100; }

  /* Een getal zoals een Nederlandse leverancier het leest. Een bestellijst met
     "13.8 m²" erop is in het beste geval slordig en in het slechtste geval
     dertien-komma-acht gelezen als dertienhonderdtachtig. `m()` is de variant
     voor getallen die in een zin worden gezet; `nl()` voor kant-en-klare
     hoeveelheden. */
  function nl(x) { return String(x).replace('.', ','); }
  function getal(x) { return nl(n(x)); }

  /* De breedte van een kozijn staat in de sleutel: "schuifpui-400" is 4,00 m.
     Zo hoeft er geen tweede lijst bijgehouden te worden die met de eerste uit
     de pas kan lopen. */
  function kozijnBreedte(sleutel) {
    if (!sleutel || sleutel === 'none') return 0;
    var m = String(sleutel).match(/(\d{3,4})$/);
    return m ? +m[1] / 100 : 0;
  }
  function lichtstraatMaat(sleutel) {
    if (!sleutel || sleutel === 'none') return null;
    var m = String(sleutel).match(/(\d{3,4})$/);
    return m ? { b: 1.0, l: +m[1] / 100 } : null;
  }

  /**
   * @param {object} cfg  de staat uit de configurator (st)
   * @returns {{invoer:object, posten:Array, aannames:string[], controle:string[]}}
   */
  function materiaalstaat(cfg) {
    cfg = cfg || {};
    var w = +cfg.w || 4, dp = +cfg.dp || 3, h = +cfg.h || 2.8;
    var vrijstaand = !!cfg.vrijstaand;
    /* Een dakopbouw staat op de bestaande woning in plaats van op de grond.
       Dat schrapt het grondwerk en de fundering, maakt de vloer een houten
       balklaag in plaats van beton, en voegt drie dingen toe die een uitbouw
       niet heeft: een trapgat, een aansluiting op het bestaande dak en een
       kraan om de elementen erover te tillen. */
    var dakopbouw = cfg.soort === 'dakopbouw';
    var DEKVLOER = 0.08;

    var posten = [], aannames = [], controle = [];
    function post(groep, omschrijving, hoeveelheid, eenheid, opmerking) {
      posten.push({ groep: groep, omschrijving: omschrijving,
                    hoeveelheid: hoeveelheid, eenheid: eenheid,
                    opmerking: opmerking || '' });
    }

    var opp = w * dp;                       // vloer- en dakoppervlak
    var wandLengte = vrijstaand ? 2 * (w + dp) : w + 2 * dp;
    var gevelBruto = wandLengte * h;

    /* Openingen gaan van het geveloppervlak af, want daar komen geen
       steenstrips en geen isolatie. Bij een kozijn zonder opgegeven hoogte
       wordt 2,40 m aangehouden — dat is de gangbare dagmaat voor een pui. */
    var puiB = kozijnBreedte(cfg.accent);
    var puiH = puiB ? 2.4 : 0;
    var openingen = puiB * puiH;
    if (puiB) aannames.push('Pui ' + getal(puiB) + ' m breed gerekend op 2,40 m hoogte (dagmaat).');

    var gevelNetto = Math.max(0, gevelBruto - openingen);

    if (!dakopbouw) {
      /* ---------- grondwerk en fundering ---------- */
      var strookB = 0.60, strookH = 0.30, sleufD = 0.80;
      var fundLengte = wandLengte;
      aannames.push('Strokenfundering ' + (strookB * 100) + ' × ' + (strookH * 100) +
                    ' cm op ' + getal(sleufD) + ' m diepte (vorstvrij), lengte gelijk aan de nieuwe wanden.');

      post('Grondwerk', 'Ontgraven funderingssleuf', n(fundLengte * strookB * sleufD), 'm³',
           'af te voeren of op eigen terrein verwerken');
      post('Grondwerk', 'Zandaanvulling / cunet onder de vloer', n(opp * 0.30), 'm³',
           '300 mm zandbed onder de vloerisolatie');

      post('Fundering', 'Beton C20/25 strokenfundering', n(fundLengte * strookB * strookH), 'm³', '');
      post('Fundering', 'Bekisting funderingsstrook', n(2 * fundLengte * strookH), 'm²',
           'twee zijden; vervalt bij storten tegen de sleufwand');
      post('Fundering', 'Wapeningskorf funderingsstrook', n(fundLengte * 1.05), 'm¹',
           'incl. 5% overlap op de lassen');
      post('Fundering', 'Wapeningskorven, stuks à 6 m', Math.ceil(fundLengte * 1.05 / 6), 'st',
           'gangbare leverlengte');
      post('Fundering', 'Funderingsbalken / metselwerk tot vloerpeil', n(fundLengte), 'm¹', '');

      if (cfg.fundering && cfg.fundering['fundering-heipalen']) {
        var palen = Math.max(4, Math.ceil(fundLengte / 2.5));
        post('Fundering', 'Schroef-/heipalen', palen, 'st',
             'h.o.h. ca. 2,5 m; aantal en lengte volgen uit de sondering');
        controle.push('Paalfundering: aantal, lengte en draagkracht volgen uit de sondering en de constructieberekening.');
      }

      /* ---------- vloer op de grond ---------- */
      post('Vloer', 'Vloerisolatie EPS 100 mm', n(opp * VERLIES.isolatiePlaat), 'm²',
           'Rc ≈ 2,9: ruim boven de verbouweis van 2,1, onder de nieuwbouweis van 3,7');
      post('Vloer', 'PE-folie onder de vloer', n(opp * VERLIES.folie), 'm²', '');
      post('Vloer', 'Beton C20/25 vloer 120 mm', n(opp * 0.12), 'm³', '');
      post('Vloer', 'Wapeningsnet Ø8-150', n(opp * 1.15), 'm²', 'incl. overlap');

      /* Zandcement dekvloer. Besteld wordt er in kubieke meters (mortelkuip of
         silo), maar het gewicht bepaalt of het met een kruiwagen kan of dat er
         een pomp bij moet — en dat is een planningsvraag, geen inkoopvraag. Dus
         staan beide erbij. Zandcement weegt ongeveer 2000 kg/m³. */
      var dekM3 = opp * DEKVLOER;
      /* De hele vloeropbouw bij elkaar bepaalt of de uitbouw straks gelijk ligt
         met de bestaande vloer. Dat is geen materiaalvraag maar het is wel de
         maat waar het misgaat, dus staat de optelsom in de aannames en niet
         alleen in de losse posten. */
      aannames.push('Vloeropbouw ' + getal((0.10 + 0.12 + DEKVLOER) * 1000) +
                    ' mm boven het zandbed: EPS 100 + beton 120 + dekvloer ' +
                    (DEKVLOER * 1000) + ' mm. Controleer of dat aansluit op het ' +
                    'peil van de bestaande vloer.');
      post('Vloer', 'Zandcement dekvloer ' + (DEKVLOER * 1000) + ' mm', n(dekM3), 'm³',
           getal(opp) + ' m² × ' + (DEKVLOER * 1000) + ' mm, ca. ' +
           getal(dekM3 * 2000 / 1000) + ' ton' +
           (cfg.extras && cfg.extras.vloerverwarming
              ? '; dekt de vloerverwarmingsslang af' : ''));
      post('Vloer', 'Randisolatiestrook', n(wandLengte * 1.05), 'm¹',
           'langs de dekvloer, tegen contactgeluid en werken');

    } else {
      /* ---------- vloer van een dakopbouw ----------
         Hier draait alles om gewicht. De vloer van een uitbouw weegt met
         120 mm beton en 80 mm zandcement ruim 450 kg/m²; dat legt geen enkele
         bestaande verdiepings- of dakvloer op. Een dakopbouw krijgt daarom een
         houten vloer: balklaag, plaatmateriaal, en hooguit een droge of
         anhydriet dekvloer. Dat scheelt een factor zes.

         Dat is geen detail maar de kern van het ontwerp, dus staat het gewicht
         er in kg/m² bij — dat is het getal waar de constructeur op rekent. */
      var vloerOverspanning = Math.min(w, dp);
      var vloerLangs = Math.max(w, dp);
      var vloerBalken = Math.ceil(vloerLangs / 0.6) + 1;
      var vloerProfiel = dakbalkProfiel(vloerOverspanning);

      post('Vloer', 'Vloerbalken ' + (vloerProfiel || 'gelamineerd/staal, n.t.b.') +
           ', lengte ' + getal(vloerOverspanning + 0.2) + ' m',
           vloerBalken, 'st',
           'h.o.h. 600 mm, overspanning ' + getal(vloerOverspanning) + ' m');
      post('Vloer', 'Vloerplaat underlayment 22 mm', n(opp * VERLIES.plaat), 'm²',
           'gelijmd en geschroefd op de balklaag');
      post('Vloer', 'Isolatie PIR 140 mm tussen de vloerbalken', n(opp * VERLIES.isolatiePlaat), 'm²',
           'scheidt de opbouw van de onverwarmde ruimte eronder');
      post('Vloer', 'Anhydriet-/droge dekvloer 50 mm', n(opp * VERLIES.plaat), 'm²',
           'licht alternatief voor zandcement, ca. 45 kg/m² tegen 160');
      post('Vloer', 'Randisolatiestrook', n(wandLengte * 1.05), 'm¹',
           'tegen contactgeluid naar de woning eronder');

      aannames.push('Vloeropbouw als houten balklaag, niet als betonvloer: een dakopbouw ' +
                    'moet licht. Reken op ca. 75 kg/m² eigen gewicht tegen ruim 450 kg/m² ' +
                    'bij een vloer op de grond.');
      controle.push('DRAAGT DE BESTAANDE CONSTRUCTIE DIT? Een dakopbouw belast de bestaande ' +
                    'wanden, vloeren en fundering. Deze staat gaat ervan uit dat dat kan; ' +
                    'of dat zo is, blijkt pas uit een constructieberekening op de bestaande ' +
                    'woning. Dit is de eerste vraag van het project, niet de laatste.');
      if (!vloerProfiel) {
        controle.push('Vloeroverspanning ' + getal(vloerOverspanning) + ' m is te groot voor ' +
                      'gedroogd vuren: gelamineerd, LVL of staal. Profiel door de constructeur.');
      }

      /* Toegang. Een opbouw zonder trapgat is een zolder waar je niet komt.
         Wij zetten er standaard een nieuwe vaste trap in — de bestaande trap
         doortrekken kan, maar is de uitzondering en vraagt om maatwerk. */
      var trapgatOmtrek = 2 * (TRAPGAT.l + TRAPGAT.b);
      var bestaandeTrap = !!(cfg.fundering && cfg.fundering['trap-bestaand']);
      post('Toegang', 'Raveling trapgat, 4 × balk zwaarder profiel', 4, 'st',
           'trapgat ' + getal(TRAPGAT.l) + ' × ' + getal(TRAPGAT.b) + ' m, profiel gelijk ' +
           'aan of zwaarder dan de vloerbalk');
      if (bestaandeTrap) {
        post('Toegang', 'Bestaande trap doortrekken', 1, 'st',
             'aansluitend op de bestaande trap; maat en helling opnemen op de bouw');
      } else {
        post('Toegang', 'Nieuwe vaste trap naar de opbouw', 1, 'st',
             'rechte trap, op maat gemaakt naar de definitieve verdiepingshoogte');
      }
      post('Toegang', 'Balustrade / hekwerk langs het trapgat',
           n(TRAPGAT.l + TRAPGAT.b), 'm¹', 'langs de open zijden, hoogte 1000 mm');
      post('Toegang', 'Afwerking trapgatrand', n(trapgatOmtrek), 'm¹',
           'aftimmering rondom de sparing');
      controle.push('Het trapgat onderbreekt de vloerbalklaag: raveling en profiel door de constructeur.');
      if (bestaandeTrap) {
        controle.push('Bestaande trap doortrekken: controleer of de huidige trap qua helling, ' +
                      'aantrede en doorloophoogte een verdieping verder nog voldoet.');
      }

      /* Aansluiting op wat er al staat. */
      post('Aansluiting', 'Loodslabben / aansluitprofielen bestaand dak', n(wandLengte * 1.05), 'm¹',
           'waterdichte overgang naar de bestaande dakbedekking');
      post('Aansluiting', 'Opstanden en isolatie bij de aansluiting', n(wandLengte), 'm¹', '');
      post('Aansluiting', 'Herstel bestaande dakbedekking rondom', n(wandLengte * 0.5), 'm²',
           'strook van ca. 500 mm langs de nieuwe wanden');

      /* ---------- leidingwerk dat door het oude dak liep ----------
         Dit is de post die bij een dakopbouw het vaakst vergeten wordt en
         nooit optioneel is. Alles wat nu door het dak naar buiten gaat, gaat
         straks door een vloer waar mensen op lopen: de mechanische ventilatie,
         de rookgasafvoer van de ketel en de ontspanningsleiding van de
         riolering. Die drie doorvoeren verdwijnen met het oude dak en moeten
         alle drie opnieuw, hoger, en op een plek die weer aan de eisen voldoet.

         De routelengte is een schatting: verticaal door de nieuwe vloer en
         langs de wand omhoog, plus een horizontaal stuk van de schacht naar de
         nieuwe doorvoer. Genoeg om op in te kopen, niet genoeg om op te
         monteren — dat volgt uit het installatietekeningetje. */
      var leidingVert = h + 0.35;
      var leidingHor = Math.min(w, dp) / 2 + 1.0;
      var leidingRoute = leidingVert + leidingHor;
      var cvOmhoog = !(cfg.elektra && cfg.elektra['cv-blijft']);

      post('Leidingwerk', 'Ventilatiekanaal Ø 125 mm, geïsoleerd', n(leidingRoute * 1.15), 'm¹',
           'van de MV-box naar de nieuwe dakdoorvoer');
      post('Leidingwerk', 'Geluiddemper Ø 125 mm', 2, 'st',
           'de MV-box komt dichter bij de verblijfsruimten te liggen');
      post('Leidingwerk', 'Rookgasafvoer concentrisch 60/100 mm', n(leidingVert + 1.0), 'm¹',
           'verlengen tot boven het nieuwe dakvlak');
      post('Leidingwerk', 'Ontspanningsleiding riolering Ø 110 mm', n(leidingVert), 'm¹',
           'de bestaande ontluchting gaat mee omhoog');
      post('Leidingwerk', 'Dakdoorvoeren (ventilatie, rookgas, riolering)', 3, 'st',
           'compleet met manchet en aansluiting op de dakbedekking');
      post('Leidingwerk', 'Brandwerend dichtzetten sparingen', 3, 'st',
           'waar de leidingen door de nieuwe vloer gaan');

      if (cvOmhoog) {
        post('Leidingwerk', 'CV-ketel verplaatsen naar de opbouw', 1, 'st',
             'inclusief ophangbeugel; expansievat en inlaatcombinatie gaan mee');
        post('Leidingwerk', 'CV-leiding aanvoer en retour verlengen', n(leidingRoute * 2), 'm¹',
             'twee leidingen over de volle route');
        post('Leidingwerk', 'Gasleiding verlengen', n(leidingRoute), 'm¹',
             'aftakking en afpersen door de installateur');
        post('Leidingwerk', 'Condensafvoer ketel', n(leidingVert), 'm¹',
             'met sifon, naar de bestaande riolering');
        controle.push('CV-ketel omhoog: de opvoerhoogte van de installatie verandert. ' +
                      'Controleer waterdruk, expansievat en pompcapaciteit, en of er een ' +
                      'condensafvoer met voldoende afschot te maken is.');
      }

      aannames.push('Drie dakdoorvoeren gerekend: mechanische ventilatie, rookgasafvoer en ' +
                    'de ontspanningsleiding van de riolering. Dat is de gebruikelijke set. ' +
                    'Een woning met een open haard, een doorvoer voor de afzuigkap of een ' +
                    'tweede ketel heeft er meer. Dat is opnemen op de bouw, niet rekenen.');
      controle.push('Rookgasafvoer: de uitmonding moet weer op de vereiste afstand van ramen, ' +
                    'dakramen en de perceelgrens uitkomen (NEN 2757). Dat bepaalt mede waar de ' +
                    'ketel kan hangen, dus vóór de indeling vaststaat.');
      controle.push('De MV-box en de leidingen komen in of onder een verblijfsruimte te liggen: ' +
                    'geluid en bereikbaarheid voor onderhoud meenemen in de indeling.');

      /* Logistiek: prefabelementen moeten over de woning heen. */
      post('Logistiek', 'Mobiele kraan, inzet', 1, 'dag',
           'prefabelementen over de woning heen hijsen; vraagt een vrije opstelplaats');
      aannames.push('Eén kraandag gerekend. Een smalle straat, een erfdienstbaarheid of ' +
                    'bovenleiding kan daar een tweede dag of een grotere kraan van maken.');
    }

    /* ---------- wanden, houtskeletbouw ---------- */
    /* Stijlen staan hart-op-hart 600. Per wand komt er één stijl bij (de laatste
       staat aan het eind, niet ín het veld), en per hoek een extra omdat daar
       twee wanden op elkaar aansluiten. Rond een pui staat een samengestelde
       stijl: dat zijn er twee per zijde. */
    var wanden = vrijstaand ? 4 : 3;
    var hoeken = vrijstaand ? 4 : 2;
    var stijls = Math.ceil(wandLengte / 0.6) + wanden + hoeken;
    if (puiB) stijls += 4;

    post('Wanden HSB', 'Stijlen SLS 144 × 38 mm, lengte ' + getal(h) + ' m',
         Math.ceil(stijls * VERLIES.hout), 'st', 'h.o.h. 600 mm, incl. hoek- en penantstijlen');
    post('Wanden HSB', 'Onderregel SLS 144 × 38 mm', n(wandLengte * VERLIES.hout), 'm¹', '');
    post('Wanden HSB', 'Bovenregel SLS 144 × 38 mm (dubbel)', n(2 * wandLengte * VERLIES.hout), 'm¹', '');
    post('Wanden HSB', 'Isolatie PIR 140 mm', n(gevelNetto * VERLIES.isolatiePlaat), 'm²',
         'tussen de stijlen, volledig gevuld: Rc ≈ 6,0 incl. koudebrug van het hout');
    post('Wanden HSB', 'Beplating buiten OSB-3 18 mm', n(gevelNetto * VERLIES.plaat), 'm²',
         'windverband');
    post('Wanden HSB', 'Dampopen folie (buitenzijde)', n(gevelNetto * VERLIES.folie), 'm²', '');
    post('Wanden HSB', 'Dampdichte folie (binnenzijde)', n(gevelNetto * VERLIES.folie), 'm²',
         'luchtdicht afgeplakt; bepaalt de blowerdoor');
    post('Wanden HSB', 'Tape en kit luchtdichting', Math.ceil(wandLengte / 10), 'set',
         'ca. 1 set per 10 m¹ wand');
    post('Wanden HSB', 'Gipsplaat 12,5 mm wanden', n(gevelNetto * VERLIES.plaat), 'm²',
         cfg.finish === 'casco' ? 'bij casco: alleen indien meegeleverd' : '');

    /* ---------- plafond ----------
       Onder de balklaag komen panlatten om het plafond uit te vullen, en
       daaronder pas de gipsplaat. De latten liggen dichter dan de balken:
       12,5 mm gipsplaat wil om de 400 mm steun hebben, de balken staan op 600.
       Dat is precies waarom die latten er zitten, dus de afstand is hier een
       eigen getal en niet de balkafstand. */
    var LAT_HOH = 0.40;
    post('Plafond', 'Panlatten 22 × 50 mm', n(opp / LAT_HOH * VERLIES.hout), 'm¹',
         'h.o.h. ' + (LAT_HOH * 1000) + ' mm, om het plafond uit te vullen, ca. ' +
         getal(1 / LAT_HOH) + ' m¹ per m²');
    post('Plafond', 'Gipsplaat 12,5 mm plafond', n(opp * VERLIES.plaat), 'm²',
         cfg.finish === 'casco' ? 'bij casco: alleen indien meegeleverd' : '');

    /* ---------- binnenwanden volgens de indeling ----------
       Elke kamer die erbij komt is een wand dwars door de ruimte, met een deur
       erin. Niet-dragend, dus metalstud: lichter dan hout en dat telt op een
       verdieping die al aan zijn gewicht zit. */
    /* Twee configurators, twee woordenlijsten. De dakopbouw spreekt van een
       open ruimte en een badkamer, de aanbouw van een studio en sanitair. Ze
       betekenen hetzelfde, dus staan beide sleutels hier — één vertaaltabel is
       beter dan twee rekenblokken die uit elkaar gaan lopen. */
    var kamers = { open: 0, studio: 0, '1-slaapkamer': 1,
                   '2-slaapkamers': 2, '3-slaapkamers': 3 };
    var aantalKamers = kamers[cfg.indeling] || 0;
    var vz = cfg.voorzieningen || {};
    var badCompleet = !!(vz['badkamer-compleet'] || vz['luxe-badkamer']);
    var badBasis = !!(vz['badkamer-basis'] || vz['basis-sanitair']);
    var heeftBad = badCompleet || badBasis;
    var apartToilet = !!vz['apart-toilet'];
    var keuken = vz['full-kitchen'] ? 'volwaardig' : (vz.kitchenette ? 'compact' : null);

    /* Een wand per kamer, plus een wand om de badkamer en om het toilet. De
       wand loopt door de kórtste richting: dat is hoe je een langwerpige
       verdieping opdeelt zonder gangen van niks. */
    var wandSpan = Math.min(w, dp);
    var binnenwanden = aantalKamers + (heeftBad ? 1 : 0) + (apartToilet ? 1 : 0);
    if (binnenwanden > 0) {
      var binnenL = binnenwanden * wandSpan;
      var binnenOpp = binnenL * h;
      var deuren = binnenwanden;
      post('Binnenwanden', 'Metalstud profielen 70 mm (stijl + regel)',
           n(binnenL * 4.2 * VERLIES.hout), 'm¹',
           binnenwanden + ' wand(en) van ' + getal(wandSpan) + ' m, h.o.h. 600 mm');
      post('Binnenwanden', 'Gipsplaat 12,5 mm, dubbel beplaat',
           n(binnenOpp * 2 * VERLIES.plaat), 'm²',
           'twee zijden, ' + getal(binnenOpp) + ' m² wand');
      post('Binnenwanden', 'Minerale wol 70 mm (geluid)',
           n(binnenOpp * VERLIES.isolatiePlaat), 'm²', 'tussen de slaapkamers');
      post('Binnenwanden', 'Binnendeur met kozijn', deuren, 'st',
           'stompe deur 2015 × 880 mm, inclusief beslag');
      post('Binnenwanden', 'Plint langs de binnenwanden', n(binnenL * 2 * 1.05), 'm¹', '');
      aannames.push('Indeling: ' + (aantalKamers ? aantalKamers + ' slaapkamer(s)' : 'open ruimte') +
                    (heeftBad ? ' met badkamer' : '') + (apartToilet ? ' en een apart toilet' : '') +
                    '. Binnenwanden gerekend als rechte wand door de kortste richting; een ' +
                    'plattegrond met een gang of een schuine wand geeft meer m¹.');
    }

    /* ---------- badkamer ----------
       Water naar boven is het makkelijke deel. Het water dat er weer uit moet
       is het lastige: afvoer vraagt afschot, en afschot vraagt hoogte die er op
       een houten vloer niet is. Daarom staat de standleiding hier als
       controlepunt en niet als aanname. */
    if (heeftBad) {
      var badOpp = badCompleet ? 7.0 : 5.0;
      var badOmtrek = 2 * (badOpp / 2 + 2);   // ruwweg een rechthoek van 2 m diep
      var route = (w + dp) / 2 + h;
      post('Badkamer', 'Meerlagenbuis 16 mm, warm en koud', n(route * 2 * 1.15), 'm¹',
           'vanaf de bestaande verdeler naar de opbouw');
      post('Badkamer', 'Riolering PVC Ø 110 mm (toilet)', n(route * 0.6), 'm¹',
           'naar de bestaande standleiding');
      post('Badkamer', 'Riolering PVC Ø 40/50 mm (douche en wastafel)', n(route * 0.6), 'm¹', '');
      post('Badkamer', 'Doucheput met vloerafvoer', 1, 'st',
           badCompleet ? 'inloopdouche, vlak in de vloer' : 'douchebak of vlakke put');
      post('Badkamer', 'Waterdichte afwerking: kimband en coating',
           n(badOpp + badOmtrek * 0.3), 'm²',
           'vloer plus 300 mm omhoog langs de wanden; verplicht op een houten vloer');
      post('Badkamer', 'Wandtegels', n(badOmtrek * 2.4 * VERLIES.plaat), 'm²',
           'tot 2400 mm hoog rondom');
      post('Badkamer', 'Vloertegels', n(badOpp * VERLIES.plaat), 'm²', '');
      post('Badkamer', 'Tegellijm en voegmortel', Math.ceil((badOmtrek * 2.4 + badOpp) * 5), 'kg',
           'ca. 5 kg/m²');
      post('Badkamer', 'Sanitairset', 1, 'set',
           badCompleet ? 'inloopdouche, wastafelmeubel, hangend toilet met inbouwreservoir'
                       : 'douche, wastafel en hangend toilet');
      post('Badkamer', 'Afzuigkanaal badkamer Ø 125 mm', n(route * 0.5), 'm¹',
           'aangesloten op de mechanische ventilatie');
      post('Badkamer', 'Elektrische radiator of handdoekradiator', 1, 'st', '');
      controle.push('BADKAMER BOVEN: de afvoer moet met voldoende afschot de bestaande ' +
                    'standleiding halen. Dat bepaalt waar de badkamer kán liggen. Bepaal ' +
                    'dit vóór de indeling vastligt, niet erna.');
      controle.push('Een natte ruimte op een houten vloer vraagt een doorlopende waterdichte ' +
                    'laag onder de tegels; alleen voegen is niet genoeg.');
      aannames.push('Badkamer gerekend op ' + getal(badOpp) + ' m². Tegelwerk rondom tot ' +
                    '2400 mm. Wijkt de plattegrond af, dan wijken deze m² mee.');
    }
    if (apartToilet) {
      post('Badkamer', 'Toiletset apart toilet', 1, 'set',
           'hangend toilet, fonteintje en inbouwreservoir');
      post('Badkamer', 'Wand- en vloertegels apart toilet', n(8 * VERLIES.plaat), 'm²',
           'ca. 1,5 m² vloer plus een betegelde wand');
    }

    /* Een keuken is meubilair, maar de aansluitingen zijn dat niet — en juist
       die worden vergeten omdat het meubel op de offerte staat. */
    if (keuken) {
      var kRoute = (w + dp) / 2 + h;
      post('Keuken', 'Keukenblok ' + (keuken === 'volwaardig' ? '(volwaardig)' : '(compact)'),
           1, 'set', keuken === 'volwaardig' ? 'inclusief vaatwasseraansluiting' : '');
      post('Keuken', 'Waterleiding 16 mm, warm en koud', n(kRoute * 2 * 1.15), 'm¹', '');
      post('Keuken', 'Riolering PVC Ø 50 mm', n(kRoute * 0.6), 'm¹', 'met afschot naar de standleiding');
      post('Keuken', 'Perilex/krachtaansluiting en 2 aparte groepen', 1, 'set',
           'kookplaat, oven en vaatwasser horen elk een eigen groep te hebben');
    }

    /* ---------- elektra ----------
       De aantallen komen uit wat de klant heeft aangevinkt; de rest (buis,
       draad, dozen) volgt daaruit. Eén punt is nooit één artikel: er hoort
       buis, draad en een doos bij, en die drie zijn precies wat er op de bouw
       ontbreekt als je alleen stopcontacten telt. */
    var el = cfg.elektra || {};
    function aantal(sleutel) { var v = +el[sleutel]; return v > 0 ? v : 0; }
    var scBinnen = aantal('stopcontacten-binnen');
    var lpBinnen = aantal('lamp-punten-binnen');
    var spots = aantal('spotjes');
    var scBuiten = aantal('stopcontact-buiten');
    var lpBuiten = aantal('lamp-punten-buiten');
    /* Eén schakelaar per lichtpunt, en één voor de spots als groep. Een
       hotelschakeling of een dimmer is een keuze die later valt; dit is de
       ondergrens waar je niet onder komt. */
    var schakelaars = lpBinnen + (spots > 0 ? 1 : 0) + (lpBuiten > 0 ? 1 : 0);
    var punten = scBinnen + lpBinnen + scBuiten + lpBuiten + schakelaars + (spots > 0 ? 1 : 0);

    if (punten > 0) {
      /* Gemiddelde route van de groepenkast naar één punt: half de plattegrond
         plus de hoogte. Ruw, maar het is een inkoopgetal — draad koop je per
         rol van 100 m, niet per meter. */
      var routeE = (w + dp) / 2 + h;
      var krachtPunten = scBinnen + scBuiten;
      var lichtPunten = lpBinnen + lpBuiten + schakelaars + (spots > 0 ? 1 : 0);

      post('Elektra', 'Installatiebuis Ø 19 mm', n(punten * routeE * 1.10), 'm¹',
           punten + ' aansluitpunten × ca. ' + getal(routeE) + ' m');
      if (krachtPunten > 0) {
        post('Elektra', 'Installatiedraad 2,5 mm² (kracht)',
             n(krachtPunten * routeE * 3 * 1.10), 'm¹', 'fase, nul en aarde per punt');
      }
      if (lichtPunten > 0) {
        post('Elektra', 'Installatiedraad 1,5 mm² (licht en schakelaars)',
             n(lichtPunten * routeE * 3 * 1.10), 'm¹', '');
      }
      if (scBinnen + schakelaars > 0) {
        post('Elektra', 'Inbouwdozen Ø 65 mm', scBinnen + schakelaars, 'st',
             'per stopcontact en per schakelaar');
      }
      if (lpBinnen + lpBuiten > 0) {
        post('Elektra', 'Centraal-/lasdozen', lpBinnen + lpBuiten, 'st', 'per lichtpunt');
      }
      if (scBinnen > 0) post('Elektra', 'Wandcontactdozen binnen', scBinnen, 'st', '');
      if (scBuiten > 0) {
        post('Elektra', 'Wandcontactdoos buiten, spatwaterdicht IP44', scBuiten, 'st', '');
      }
      if (schakelaars > 0) post('Elektra', 'Schakelaars', schakelaars, 'st', '');
      if (spots > 0) post('Elektra', 'Inbouwspots met driver', spots, 'st', '');
      if (lpBinnen > 0) post('Elektra', 'Plafondlichtpunten, afgemonteerd', lpBinnen, 'st', '');
      post('Elektra', 'Voedingskabel XMvK 3 × 2,5 mm² naar de groepenkast',
           n(routeE + (dakopbouw ? h + 3 : 3)), 'm¹',
           dakopbouw ? 'via de schacht omhoog naar de opbouw' : 'vanaf de bestaande meterkast');
      if (el.meterkast) {
        post('Elektra', 'Groepenkast uitbreiden: 2 groepen + aardlekschakelaar', 1, 'st', '');
      } else {
        controle.push('Er is geen uitbreiding van de groepenkast gekozen. Controleer of de ' +
                      'bestaande kast nog vrije groepen én ruimte heeft; zo niet, dan komt ' +
                      'die uitbreiding er alsnog bij.');
      }
      if (heeftBad) {
        post('Elektra', 'Elektra badkamer: spatwaterdichte punten en aparte groep', 1, 'set',
             'zone-indeling volgens NEN 1010');
      }
      aannames.push(punten + ' aansluitpunten gerekend, uit de gekozen aantallen: ' +
                    scBinnen + ' stopcontact(en), ' + lpBinnen + ' lichtpunt(en), ' +
                    spots + ' spot(s) en ' + schakelaars + ' schakelaar(s). Leidinglengte is ' +
                    'geschat op ca. ' + getal(routeE) + ' m per punt.');
      controle.push('Bij houtskeletbouw gaan de leidingen door de stijlen: boorgaten in de ' +
                    'stijl mogen niet zomaar overal. Hou de installatievolgorde aan en boor ' +
                    'in het midden, niet bij een aansluiting.');
    }

    /* ---------- gevelafwerking ---------- */
    /* Deze vier takken zijn geschreven op de slugs van de aanbouwconfigurator
       (classic-brick/stuc-modern/modern-wood/keralit). De dakopbouwconfigurator
       gebruikt eigen namen voor dezelfde vier materialen (metselwerk/stucwerk/
       houtcomposiet/keralit) — zonder deze alias viel elke dakopbouw-gevel
       behalve keralit stil terug op de generieke "Composiet gevelpanelen"-tak,
       met de verkeerde materiaalregels tot gevolg. */
    var GEVEL_ALIAS = { metselwerk: 'classic-brick', stucwerk: 'stuc-modern', houtcomposiet: 'modern-wood' };
    var gevel = cfg.material || 'classic-brick';
    gevel = GEVEL_ALIAS[gevel] || gevel;
    if (gevel === 'classic-brick') {
      var perM2 = stripsPerM2();
      post('Gevel', 'Steenstrips waalformaat 210 × 50 mm',
           Math.ceil(gevelNetto * perM2 * VERLIES.steenstrip), 'st',
           Math.round(perM2) + ' st/m² bij 10 mm voeg, ' + getal(gevelNetto) + ' m² gevel');
      post('Gevel', 'Hoekstrips (buitenhoeken)',
           Math.ceil(hoeken * h * stripsPerM1Hoek() * VERLIES.steenstrip), 'st',
           Math.round(stripsPerM1Hoek()) + ' st/m¹ hoek, ' + hoeken + ' hoeken');
      post('Gevel', 'Steenstriplijm', Math.ceil(gevelNetto * 5), 'kg', 'ca. 5 kg/m²');
      post('Gevel', 'Voegmortel', Math.ceil(gevelNetto * 7), 'kg', 'ca. 7 kg/m²');
      post('Gevel', 'Isolatiedrager / lijmplaat', n(gevelNetto * VERLIES.plaat), 'm²', '');
    } else if (gevel === 'stuc-modern') {
      post('Gevel', 'Stucdrager / wapeningsweefsel', n(gevelNetto * VERLIES.plaat), 'm²', '');
      post('Gevel', 'Basismortel', Math.ceil(gevelNetto * 6), 'kg', 'ca. 6 kg/m²');
      post('Gevel', 'Sierpleister buiten', Math.ceil(gevelNetto * 3.5), 'kg', 'ca. 3,5 kg/m²');
      post('Gevel', 'Hoekprofielen', n(hoeken * h + wandLengte * 0.2), 'm¹', '');
    } else if (gevel === 'modern-wood') {
      /* Verticale delen van 145 mm werkende breedte: per m² gevel is dat
         1 / 0,145 ≈ 6,9 strekkende meter. */
      post('Gevel', 'Gevelbekleding hout, verticale delen 145 mm werkend',
           n(gevelNetto / 0.145 * VERLIES.hout), 'm¹', 'ca. 6,9 m¹ per m² gevel');
      post('Gevel', 'Regelwerk / achterconstructie 22 × 50 mm',
           n(gevelNetto / 0.6 * 2 * VERLIES.hout), 'm¹', 'gekruist, h.o.h. 600');
      post('Gevel', 'RVS gevelschroeven', Math.ceil(gevelNetto * 25), 'st', 'ca. 25 st/m²');
    } else {
      post('Gevel', gevel === 'keralit' ? 'Keralit gevelpanelen' : 'Composiet gevelpanelen',
           n(gevelNetto * VERLIES.plaat), 'm²', '');
      post('Gevel', 'Regelwerk / achterconstructie', n(gevelNetto / 0.6 * VERLIES.hout), 'm¹', '');
      post('Gevel', 'Start-, hoek- en eindprofielen', n(hoeken * h + wandLengte), 'm¹', '');
    }

    /* ---------- dak ---------- */
    /* De balken overspannen de kortste richting; dat scheelt profiel en dus
       geld. Het aantal volgt uit de andere richting. */
    var overspanning = Math.min(w, dp);
    var langs = Math.max(w, dp);
    var aantalBalken = Math.ceil(langs / 0.6) + 1;
    var profiel = dakbalkProfiel(overspanning);

    post('Dak', 'Dakbalken ' + (profiel || 'gelamineerd/staal, n.t.b.') +
         ', lengte ' + getal(overspanning + 0.2) + ' m',
         aantalBalken, 'st', 'h.o.h. 600 mm, overspanning ' + getal(overspanning) + ' m');
    if (!profiel) {
      controle.push('Overspanning ' + getal(overspanning) + ' m is te groot voor gedroogd vuren: ' +
                    'gelamineerde liggers, LVL of staal. Profiel door de constructeur.');
    } else {
      controle.push('Dakbalken ' + profiel + ' zijn indicatief (C24, h.o.h. 600, plat dak). ' +
                    'Laat het profiel bevestigen voor er besteld wordt.');
    }
    post('Dak', 'Randbalk / muurplaat SLS 144 × 38 mm', n((2 * (w + dp)) * VERLIES.hout), 'm¹', '');
    post('Dak', 'Dakbeschot underlayment 18 mm', n(opp * VERLIES.plaat), 'm²', '');
    post('Dak', 'Dakisolatie PIR 140 mm', n(opp * VERLIES.isolatiePlaat), 'm²',
         'Rc ≈ 6,4: voldoet aan de nieuwbouweis van 6,3');
    post('Dak', 'Dampdichte folie dak', n(opp * VERLIES.folie), 'm²', '');

    var dakrand = 2 * (w + dp);
    var dakbedekking = { epdm: 'EPDM 1,2 mm', bitumen: 'Bitumen tweelaags',
                         'white-roofing': 'Witte bitumen tweelaags', green: 'EPDM + sedumpakket' };
    post('Dak', dakbedekking[cfg.roofing] || 'EPDM 1,2 mm',
         n((opp + dakrand * 0.25) * VERLIES.epdm), 'm²', 'incl. opstanden ca. 250 mm');
    post('Dak', 'Daktrim / randprofiel aluminium', n(dakrand), 'm¹', '');
    if (cfg.roofing === 'green') {
      post('Dak', 'Sedumcassettes / substraat', n(opp), 'm²', '');
      controle.push('Sedumdak legt ca. 60–100 kg/m² extra op de constructie; de balklaag moet daarop berekend zijn.');
    }
    post('Dak', 'Hemelwaterafvoer', Math.max(1, Math.ceil(opp / 60)), 'st',
         '1 tapput per ca. 60 m² dak');
    post('Dak', 'HWA-pijp Ø80', n(h + 1), 'm¹', '');

    /* ---------- kozijnen en lichtstraat ---------- */
    if (puiB) {
      post('Kozijn', 'Pui ' + getal(puiB) + ' × 2,40 m (' + (cfg.frameColor || 'zwart') + ')', 1, 'st', '');
      var lat = lateiProfiel(puiB);
      post('Kozijn', 'Raveling / latei boven de pui ' + (lat || 'n.t.b.'),
           n(puiB + 0.3), 'm¹', 'incl. 150 mm oplegging per zijde');
      controle.push('Latei boven de pui van ' + getal(puiB) + ' m: profiel en oplegging door de constructeur.');
    }
    /* De ramen en deuren uit de plattegrond. Ze stonden hier tot nu toe niet
       in, want ze werden alleen getekend; nu de bezoeker ze zelf plaatst is
       een materiaalstaat zonder die kozijnen een staat die niet klopt met de
       tekening ernaast. Ze komen uit dezelfde lijst als de tekening, dus twee
       verschillende aantallen kunnen niet ontstaan. */
    if (typeof NGBouwAanzichten !== 'undefined' && typeof NGBouwkundig !== 'undefined') {
      var kz = null;
      try { kz = NGBouwAanzichten.kozijnstaat(cfg, NGBouwkundig.model(cfg)); } catch (e) { kz = null; }
      if (kz && kz.lijst.length) {
        /* Gelijke maten bij elkaar: een staat met acht regels "raam 100 x 150"
           is voor de calculator werk in plaats van informatie. */
        var perMaat = {};
        kz.lijst.forEach(function (K) {
          /* In millimeters, want zo bestelt een timmerman een kozijn. Stond
             hier per ongeluk de centimetermaat, dan vraagt deze staat om een
             buitendeur van negentig millimeter breed. */
          var sleutel = K.soort + '|' + Math.round(K.b * 1000) + 'x' + Math.round(K.h * 1000);
          perMaat[sleutel] = (perMaat[sleutel] || 0) + 1;
        });
        Object.keys(perMaat).forEach(function (sleutel) {
          var d = sleutel.split('|'), maat = d[1].split('x');
          post('Kozijn', (d[0] === 'deur' ? 'Buitendeur ' : 'Raam ') + maat[0] + ' × ' + maat[1] +
               ' mm, HR++ (' + (cfg.frameColor || 'zwart') + ')', perMaat[sleutel], 'st', '');
        });
        post('Kozijn', 'Raveling of latei boven de kozijnen', kz.lijst.length, 'st',
             'profiel per opening door de constructeur');
        if (kz.eigen) {
          aannames.push('De kozijnen zijn geplaatst zoals de bezoeker ze op de plattegrond heeft neergezet: ' +
                        kz.aantal + ' stuks, samen ' + getal(kz.oppervlak) + ' m² kozijnoppervlak.');
        }
      }
    }

    var ls = lichtstraatMaat(cfg.skylight);
    if (ls) {
      post('Dak', 'Lichtstraat ' + getal(ls.b) + ' × ' + getal(ls.l) + ' m', 1, 'st', '');
      post('Dak', 'Opstand lichtstraat, timmerwerk + isolatie',
           n(2 * (ls.b + ls.l)), 'm¹', '');
      controle.push('De sparing voor de lichtstraat onderbreekt de balklaag: verstevigingsbalken door de constructeur.');
    }

    /* ---------- doorbraak ----------
       Alleen bij een uitbouw op de grond. Een dakopbouw sluit niet aan via een
       gat in een dragende gevel maar via het trapgat, en dat staat hierboven
       al onder Toegang. */
    if (!vrijstaand && !dakopbouw) {
      var dbBreedte = cfg.fundering && cfg.fundering['doorbraak-t-splitsing'] ? Math.min(w, 4.0) : Math.min(w, 3.0);
      var dbProfiel = lateiProfiel(dbBreedte);
      post('Doorbraak', 'Stalen ligger ' + (dbProfiel || 'n.t.b.') + ', lengte ' + getal(dbBreedte + 0.4) + ' m',
           1, 'st', 'incl. 200 mm oplegging per zijde');
      post('Doorbraak', 'Oplegblokken / stalen stoelen', 2, 'st', '');
      post('Doorbraak', 'Stempels tijdens de doorbraak', 4, 'st', '');
      post('Doorbraak', 'Puinafvoer doorbraak', n(dbBreedte * 2.6 * 0.3), 'm³', 'ca. 300 mm gevel');
      controle.push('De doorbraak zit in een dragende gevel: liggerprofiel, oplegging en tijdelijke ' +
                    'ondersteuning altijd op basis van een constructieberekening.');
      aannames.push('Doorbraak gerekend op ' + getal(dbBreedte) + ' m breed; de werkelijke maat volgt uit de plattegrond.');
    }

    /* ---------- verwarming ----------
       Het elektrawerk stond hier vroeger ook, maar telde élke aangevinkte
       optie als aansluitpunt — een uitbreiding van de meterkast werd zo een
       stopcontact. Dat rekenwerk staat nu hierboven onder Elektra, waar het
       onderscheid tussen kracht, licht en schakelaars wél gemaakt wordt. */
    if (cfg.extras && cfg.extras.vloerverwarming) {
      post('Verwarming', 'Vloerverwarmingsslang', n(opp * 8), 'm¹', 'h.o.h. 125 mm, ca. 8 m¹/m²');
      post('Verwarming', 'Verdeler', 1, 'st', '');
    }
    if (cfg.elektra && cfg.elektra.radiator) {
      post('Verwarming', 'Radiator met aansluitset', 1, 'st', 'op de bestaande cv');
      post('Verwarming', 'Cv-leiding 15 mm naar de radiator', n((w + dp) / 2 + h), 'm¹', '');
    }

    return {
      invoer: { soort: dakopbouw ? 'dakopbouw' : 'uitbouw',
                breedte: w, diepte: dp, hoogte: h, oppervlak: n(opp),
                wandLengte: n(wandLengte), gevelNetto: n(gevelNetto),
                vrijstaand: vrijstaand },
      posten: posten,
      aannames: aannames,
      controle: controle
    };
  }

  /** Platte tekst, voor in een offerteaanvraag of een mail. */
  function alsTekst(st) {
    var i = st.invoer;
    var r = ['MATERIAALSTAAT (indicatief, werkvoorbereiding)',
             (i.soort === 'dakopbouw' ? 'Dakopbouw'
               : i.vrijstaand ? 'Vrijstaand' : 'Uitbouw') + ' ' + nl(i.breedte) + ' × ' + nl(i.diepte) +
             ' × ' + nl(i.hoogte) + ' m · ' + nl(i.oppervlak) + ' m² · gevel ' +
             nl(i.gevelNetto) + ' m²', ''];

    /* Posten per groep bij elkaar, in de volgorde waarin de groep voor het eerst
       voorkomt. De lichtstraat wordt bij het dak berekend maar komt pas ná het
       kozijn binnen, en zonder deze stap stond "DAK" twee keer in de lijst. */
    var volgorde = [], perGroep = {};
    st.posten.forEach(function (p) {
      if (!perGroep[p.groep]) { perGroep[p.groep] = []; volgorde.push(p.groep); }
      perGroep[p.groep].push(p);
    });
    volgorde.forEach(function (groep) {
      r.push(groep.toUpperCase());
      perGroep[groep].forEach(function (p) {
        r.push('  ' + nl(p.hoeveelheid) + ' ' + p.eenheid + '  ' + p.omschrijving +
               (p.opmerking ? '  (' + p.opmerking + ')' : ''));
      });
    });
    if (st.aannames.length) { r.push('', 'AANNAMES'); st.aannames.forEach(function (a) { r.push('  - ' + a); }); }
    if (st.controle.length) {
      r.push('', 'TE BEVESTIGEN DOOR DE CONSTRUCTEUR');
      st.controle.forEach(function (c) { r.push('  ! ' + c); });
    }
    return r.join('\n');
  }

  global.NGMateriaal = { staat: materiaalstaat, tekst: alsTekst,
                         stripsPerM2: stripsPerM2, dakbalkProfiel: dakbalkProfiel };
})(typeof window !== 'undefined' ? window : globalThis);
