/* De draagconstructie: welke balk waar ligt, en welk profiel dat wordt.
 *
 * WAAROM DIT ER IS
 * De configurator kende tot nu toe één constructief getal — het profiel van
 * de stalen ligger boven de doorbraak. Al het andere zat verstopt: hoe het
 * dak wordt overspannen, wat er gebeurt als de plattegrond een knik maakt, en
 * wat een pui van vijf meter in een dragende gevel betekent. Dat zijn precies
 * de dingen die een offerte laten schuiven nadat hij is gegeven.
 *
 * Deze module maakt van de vorm en de maten een lijst constructieonderdelen
 * met een voorgedimensioneerd profiel per stuk, en gebruikt daarvoor de twee
 * rekenmodules die er al waren: NGBouwkundig.voordimensioneer voor hout
 * (Eurocode 5) en NGStaal.bereken voor staal (Eurocode 3). Er wordt hier dus
 * niets nieuws gerekend; wat nieuw is, is dat de onderdelen benoemd worden.
 *
 * WAT HET NIET IS
 * Geen constructieberekening. Elk profiel draagt het stempel
 * VOORDIMENSIONERING — TER CONTROLE CONSTRUCTEUR, en de module weigert een
 * antwoord te geven waar de rekenmodules zelf weigeren. Stabiliteit,
 * verbindingen, opleggingen, windbelasting en de bestaande fundering vallen
 * er nadrukkelijk buiten.
 *
 * DE DRIE SOORTEN ONDERDELEN
 *   dakbalken    per rechthoek van de plattegrond, overspannend in de korte
 *                richting, h.o.h. 600 mm — hout.
 *   moerbalken   op de scheidslijn tussen twee rechthoeken van een L- of
 *                U-vorm. Daar eindigen de balken van het ene deel; dat is
 *                geen detail maar de zwaarste balk van het hele dak — staal.
 *   lateien      boven de pui en boven de doorbraak. Staal.
 * Waar een gevel over de volle breedte opengaat is er geen muurdam meer om
 * op te leggen; dan wordt het een pendelportaal met twee kolommen, en dat
 * rekent NGStaal ook door.
 */
(function (global) {
  'use strict';

  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function rond(v, n) { var p = Math.pow(10, n || 0); return Math.round(v * p) / p; }

  /* Boven welke overspanning een houten dakbalk het niet meer redt en er een
     stalen moerbalk onder moet. Niet hard nodig — de houtmodule weigert zelf
     ook — maar het scheelt een blad vol weigeringen bij een grote uitbouw. */
  var HOUT_GRENS = 6.0;

  function houtBalk(span, opts) {
    if (!global.NGBouwkundig || !global.NGBouwkundig.voordimensioneer) return null;
    return global.NGBouwkundig.voordimensioneer('dak', span, opts || {});
  }

  function staalBalk(overspanning, belastingbreedte, extra) {
    if (!global.NGStaal || !global.NGStaal.bereken) return null;
    var inv = {
      overspanning: rond(overspanning, 2),
      belastingbreedte: rond(belastingbreedte, 2),
      watErboven: 'dak',
      vloertype: 'hout',
      muurdikte: 0.21,
      /* Nieuwbouw: er staat geen metselwerk bóven deze balk, dus die
         belasting hoort er ook niet bij opgeteld te worden. Bij de doorbraak
         in de bestaande gevel is dat anders, en daar wordt hij wél meegegeven. */
      muurHoogteBoven: 0,
      staal: 'S235'
    };
    if (extra) Object.keys(extra).forEach(function (k) { inv[k] = extra[k]; });
    return global.NGStaal.bereken(inv);
  }

  function profielNaam(r) {
    if (!r) return null;
    if (r.geweigerd) return null;
    return r.profiel ? r.profiel.naam : null;
  }

  /* De hele draagconstructie in één keer. `D` is het tekenmodel uit
     NGBouwAanzichten.lees(); daar zitten de vorm, de maten en de gekozen pui
     al in. */
  function lees(D) {
    var V = global.NGBouwvormen;
    var vorm = D.vorm || { vorm: 'rechthoek', punten: [], hap: { b: 0, d: 0 } };
    var delen = V ? V.delen(vorm.vorm, D.w, D.dp, vorm.hap && vorm.hap.b, vorm.hap && vorm.hap.d)
                  : [{ x0: 0, y0: 0, x1: D.w, y1: D.dp, naam: 'hoofdvolume' }];
    var scheidingen = V ? V.scheidingen(vorm.vorm, D.w, D.dp, vorm.hap && vorm.hap.b, vorm.hap && vorm.hap.d) : [];
    var groen = D.dak && D.dak.sleutel === 'green';

    var onderdelen = [];

    /* 1. De dakbalken per rechthoek, in de korte richting. */
    delen.forEach(function (deel, i) {
      var bw = deel.x1 - deel.x0, bd = deel.y1 - deel.y0;
      var span = Math.min(bw, bd);
      var richting = bw <= bd ? 'x' : 'y';          // balken lopen langs de korte zijde
      var lengteVlak = Math.max(bw, bd);
      var res = span <= HOUT_GRENS ? houtBalk(span, { groenDak: groen }) : null;
      onderdelen.push({
        soort: 'dakbalk', code: 'B-' + String(i + 1).padStart(2, '0'),
        naam: 'Dakbalken ' + deel.naam,
        deel: deel, richting: richting,
        overspanning: rond(span, 2), hoh: 0.60,
        aantal: Math.max(2, Math.ceil(lengteVlak / 0.60) + 1),
        materiaal: res ? res.materiaalLabel : 'staal of projectspecifiek',
        profiel: res ? res.profiel : null,
        status: res ? res.status : 'CONSTRUCTEUR DIMENSIONEERT',
        toelichting: res
          ? 'h.o.h. 600 mm, overspanning ' + rond(span, 2).toFixed(2).replace('.', ',') + ' m'
          : 'Overspanning boven het bereik van de houtvoordimensionering; hier hoort staal of een tussensteunpunt.'
      });
    });

    /* 2. De moerbalken op de scheidslijnen. Belastingbreedte is de helft van
       wat er aan weerszijden op afdraagt — daar liggen de balkkoppen. */
    scheidingen.forEach(function (sch, i) {
      var links = null, rechts = null;
      delen.forEach(function (d) {
        if (Math.abs(d.x1 - sch.x) < 1e-6) links = d;
        if (Math.abs(d.x0 - sch.x) < 1e-6) rechts = d;
      });
      var bbLinks = links ? Math.min(links.x1 - links.x0, links.y1 - links.y0) / 2 : 0;
      var bbRechts = rechts ? Math.min(rechts.x1 - rechts.x0, rechts.y1 - rechts.y0) / 2 : 0;
      var bb = Math.max(0.6, bbLinks + bbRechts);
      var res = staalBalk(sch.lengte + 0.3, bb);
      onderdelen.push({
        soort: 'moerbalk', code: 'S-' + String(i + 1).padStart(2, '0'),
        naam: 'Moerbalk op de knik in de plattegrond',
        lijn: sch,
        overspanning: rond(sch.lengte + 0.3, 2), belastingbreedte: rond(bb, 2),
        materiaal: 'Staal S235',
        profiel: res && !res.geweigerd ? res.profiel : null,
        geweigerd: !!(res && res.geweigerd), redenen: res && res.redenen ? res.redenen : null,
        status: 'VOORDIMENSIONERING',
        toelichting: 'Hier eindigen de dakbalken van beide delen. Belastingbreedte ' +
          rond(bb, 2).toFixed(2).replace('.', ',') + ' m.'
      });
    });

    /* 3. De latei boven de pui. Een pui in een dragende gevel draagt het dak
       niet zelf; daar ligt een balk boven. Onder de 2,5 m volstaat in de
       praktijk een houten regel binnen de HSB-gevel, en dan hoort er geen
       stalen profiel op de tekening te staan dat niemand nodig heeft. */
    if (D.pui && D.pui.breedte) {
      var puiB = D.pui.tekenBreedte || D.pui.breedte;
      var deelBijPui = delen[0];
      var puiSpan = Math.min(deelBijPui.x1 - deelBijPui.x0, deelBijPui.y1 - deelBijPui.y0);
      if (puiB >= 2.5) {
        var resL = staalBalk(puiB + 0.3, puiSpan / 2);
        onderdelen.push({
          soort: 'latei', code: 'L-01', naam: 'Latei boven de pui',
          overspanning: rond(puiB + 0.3, 2), belastingbreedte: rond(puiSpan / 2, 2),
          materiaal: 'Staal S235',
          profiel: resL && !resL.geweigerd ? resL.profiel : null,
          geweigerd: !!(resL && resL.geweigerd), redenen: resL && resL.redenen ? resL.redenen : null,
          status: 'VOORDIMENSIONERING',
          toelichting: 'Draagt het dak boven de pui van ' + rond(puiB, 2).toFixed(2).replace('.', ',') + ' m.'
        });
      } else {
        onderdelen.push({
          soort: 'latei', code: 'L-01', naam: 'Latei boven de pui',
          overspanning: rond(puiB + 0.3, 2), materiaal: 'Hout, binnen de gevelopbouw',
          profiel: null, status: 'GEEN APART PROFIEL',
          toelichting: 'Onder de 2,50 m wordt dit een dubbele regel in de gevelstijlen; er hoort geen ' +
            'stalen profiel op de tekening dat in het werk niet geplaatst wordt.'
        });
      }
    }

    /* 4. De raveling om het trapgat. Een gat van 2,60 × 1,00 m in de vloer
       onderbreekt de vloerbalken die daar zouden lopen; die koppen moeten
       ergens op landen. Dat is precies de raveelbalk, en hij stond hier niet —
       terwijl het trapgat wél op de plattegrond staat en de vloer eromheen dus
       zichtbaar onderbroken is. Een constructieblad dat het duurste gat in het
       werk niet noemt, is een constructieblad dat de aannemer moet corrigeren. */
    if (D.soort === 'dakopbouw' && D.trapgat) {
      var gatL = 2.60, gatB = 1.00;                    // rechte steektrap
      /* De raveelbalk overspant de breedte van het gat en draagt de koppen van
         de onderbroken vloerbalken: belastingbreedte is de halve gatlengte. */
      /* Vloerbelasting en niet dakbelasting: hier lopen mensen overheen. Dat
         scheelt niet alleen in de q-last maar ook in de doorbuigingseis
         (L/400 in plaats van L/300), en dat is precies waar een vloer die
         "veert" vandaan komt. De belastingbreedte is de halve gatlengte: dat
         is wat de onderbroken balken op deze raveelbalk afdragen. */
      var ravel = global.NGBouwkundig && global.NGBouwkundig.voordimensioneer
        ? global.NGBouwkundig.voordimensioneer('vloer', gatB + 0.2, { spacing: gatL / 2 })
        : null;
      onderdelen.push({
        soort: 'raveling', code: 'R-01', naam: 'Raveelbalken om het trapgat',
        overspanning: rond(gatB + 0.2, 2), belastingbreedte: rond(gatL / 2, 2),
        aantal: 2,
        materiaal: ravel ? ravel.materiaalLabel : 'hout',
        profiel: ravel ? ravel.profiel : null,
        status: ravel ? ravel.status : 'CONSTRUCTEUR DIMENSIONEERT',
        toelichting: 'Twee stuks, dwars op de vloerbalken aan weerszijden van het gat van ' +
          gatL.toFixed(2).replace('.', ',') + ' × ' + gatB.toFixed(2).replace('.', ',') +
          ' m. De onderbroken balkkoppen landen hierop; de wisselbalken ernaast worden verdubbeld.'
      });
    }

    /* 5. De doorbraak in de bestaande gevel — dezelfde invoer als de knop
       Balkberekening DB-01, zodat de tekening en dat rapport hetzelfde
       profiel noemen. Loopt dat uiteen, dan is er één te veel. */
    var db = null;
    if (D.soort === 'aangebouwd' && D.doorbraak) {
      db = staalBalk(rond(D.doorbraak + 0.3, 1), 1.8, {
        watErboven: 'verdieping-plus-dak', muurdikte: 0.21, muurHoogteBoven: 2.4
      });
      onderdelen.push({
        soort: 'doorbraak', code: 'DB-01', naam: 'Ligger boven de doorbraak',
        overspanning: rond(D.doorbraak + 0.3, 1), belastingbreedte: 1.8,
        materiaal: 'Staal S235',
        profiel: db && !db.geweigerd ? db.profiel : null,
        geweigerd: !!(db && db.geweigerd), redenen: db && db.redenen ? db.redenen : null,
        status: 'VOORDIMENSIONERING',
        toelichting: 'In de bestaande achtergevel, met een verdieping en het dak erboven. ' +
          'Belastingbreedte 1,80 m: aanname, te bevestigen met de tekening van de woning.'
      });
    }

    return {
      delen: delen, scheidingen: scheidingen, onderdelen: onderdelen,
      db01: db,
      /* Alles wat de constructeur moet bevestigen voordat er besteld wordt.
         Deze lijst hoort mee te gaan met elke tekening waar een profiel op
         staat. */
      /* Kort gehouden: deze regels staan op een tekening naast een tabel, en
         een regel die daar niet past wordt afgekapt en zegt dan het
         tegenovergestelde van wat er stond. */
      controle: [
        'Elk profiel is een voordimensionering; de constructeur bevestigt.',
        'Opleggingen, verbindingen en stabiliteit vallen erbuiten.',
        'Bestaande draagconstructie en fundering niet beoordeeld.',
        'Brandwerende bekleding van staal waar het Bbl dat vraagt.'
      ]
    };
  }

  global.NGBouwconstructie = { lees: lees, profielNaam: profielNaam };
})(typeof window !== 'undefined' ? window : globalThis);
