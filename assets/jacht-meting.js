/* Wat er met de jachtconfigurator gebeurt, in cijfers.
 *
 * WAAROM DIT ER IS
 * De configurator kon alles behalve één ding: de werf iets terugvertellen. Wie
 * hem opende zag een schip, stelde het samen, en verdween. Of dat er honderd
 * per week waren of drie, of ze bij de Sport Coupé 16 bleven hangen of bij de
 * Giga 120, welke rompkleur ze het vaakst kozen en waar ze afhaakten - daar was
 * geen enkel antwoord op. Voor een werf die op deze configurator gaat verkopen
 * is dat het verschil tussen een etalage en een verkoopkanaal.
 *
 * DE VORM: ÉÉN REGEL PER BEZOEK, NIET ÉÉN PER KLIK
 * Een gebeurtenislogboek van elke aangeklikte kleur groeit hard en zegt weinig:
 * wie vijf keer tussen nachtblauw en grafiet heen en weer klikt heeft één
 * voorkeur en geen vijf. Er staat daarom per bezoek één regel die bijgewerkt
 * wordt, met de laatste samenstelling erin. Dat is wat de werf wil weten - wat
 * er uiteindelijk stond - en het is meteen honderd keer kleiner.
 *
 * WAT ER NIET IN STAAT, EN WAAROM NIET
 * Geen naam, geen e-mailadres, geen IP-adres, geen verwijzende pagina, geen
 * herkenning tussen bezoeken door. Een samenstelling is een productkeuze en
 * geen persoon: "iemand koos nachtblauw" heeft alle waarde die de werf nodig
 * heeft, en "wie" voegt daar niets aan toe behalve een bewaarplicht. Wil een
 * bezoeker zich bekendmaken, dan doet hij dat door een offerte aan te vragen,
 * en die gaat al met naam en al per mail naar de werf.
 *
 * WAAR HET BLIJFT: DRIE MOGELIJKHEDEN, ÉÉN STANDAARD
 *   lokaal   De standaard. Alles blijft in de browser van de bezoeker staan en
 *            gaat nergens heen. Het dashboard van de werf laat dan zien wat er
 *            op dát apparaat gebeurd is - genoeg om het te proberen, niet
 *            genoeg om op te sturen.
 *   server   Zet NG_METING_ENDPOINT en elke afgeronde samenstelling gaat ook
 *            naar dat adres. Pas dán verlaat er iets de browser, en dat is een
 *            bewuste handeling van de werf en geen standaardinstelling.
 *   uit      Helemaal niets. Voor wie geen toestemmingsbanner wil voeren.
 *
 * Deze volgorde is met opzet zo. Meten dat stilletjes aan staat en stilletjes
 * verstuurt is precies het soort ding waar een werf later een probleem mee
 * krijgt; meten dat je zelf moet aanzetten is een keuze die iemand kan
 * verantwoorden.
 */
(function (global) {
  'use strict';

  var SLEUTEL = 'ng-jacht-meting';
  var SLEUTEL_UIT = 'ng-jacht-meting-uit';

  /* Hoeveel bezoeken er bewaard blijven en hoe lang.
     Vierhonderd regels van een paar honderd tekens is ruim binnen wat een
     browser kwijt kan, en honderdtachtig dagen is een half seizoen - lang
     genoeg om een voorjaar met een najaar te vergelijken, kort genoeg om niet
     eindeloos te bewaren wat niemand meer bekijkt. */
  var MAX_REGELS = 400;
  var MAX_DAGEN = 180;

  /* De velden die de samenstelling beschrijven. Dezelfde volgorde als de
     deelbare code, zodat een regel uit de meting rechtstreeks als link
     geopend kan worden. */
  var VELDEN = ['model', 'rompkleur', 'opbouw', 'dek', 'dekafwerking',
                'interieurhout', 'stoffering', 'motorisering',
                'vloer', 'wandafwerking', 'marmer', 'metaal', 'verlichting'];

  /* De stappen die een bezoek kan zetten, van vrijblijvend naar serieus. De
     volgorde doet ertoe: het dashboard leest hem als trechter. */
  var STAPPEN = ['gestart', 'gewijzigd', 'voorbeeld', 'dossier', 'gedeeld', 'offerte'];

  var huidige = null;      // de regel van dit bezoek
  var geschreven = false;  // staat hij al in de opslag?

  function nu() { return Date.now(); }

  function uitgeschakeld() {
    if (global.NG_METING === 'uit') return true;
    try { return global.localStorage.getItem(SLEUTEL_UIT) === 'ja'; }
    catch (e) { return false; }
  }

  /* Een browser die niets mag opslaan - privévenster, oude
     toestemmingsinstelling, opslag vol - gooit hier een fout. Dan wordt er
     gewoon niet gemeten en werkt de configurator verder zoals hij deed. Meten
     is nooit een reden om iets kapot te laten gaan. */
  function lees() {
    try {
      var ruw = global.localStorage.getItem(SLEUTEL);
      var lijst = ruw ? JSON.parse(ruw) : [];
      return Array.isArray(lijst) ? lijst : [];
    } catch (e) { return []; }
  }
  function schrijf(lijst) {
    try { global.localStorage.setItem(SLEUTEL, JSON.stringify(lijst)); return true; }
    catch (e) { return false; }
  }

  /* Oud en te veel eruit. Dit gebeurt bij het wegschrijven en niet bij het
     lezen: een dashboard dat opgeruimd wordt terwijl je ernaar kijkt is
     verwarrend, en het opruimen hoort bij het schrijven thuis. */
  function opschonen(lijst) {
    var grens = nu() - MAX_DAGEN * 86400000;
    var uit = lijst.filter(function (r) { return r && r.eind > grens; });
    return uit.length > MAX_REGELS ? uit.slice(uit.length - MAX_REGELS) : uit;
  }

  function taal() {
    return (global.NGTaal && global.NGTaal.taal) ? global.NGTaal.taal() : 'nl';
  }

  /* Een kenmerk voor dit bezoek. Bewust niet stabiel tussen bezoeken door: het
     dient alleen om de regel van dit bezoek terug te vinden zolang de pagina
     openstaat, en niet om iemand te herkennen die morgen terugkomt. */
  function nieuwId() {
    return 'b' + nu().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function nieuweRegel() {
    var r = { id: nieuwId(), begin: nu(), eind: nu(), taal: taal(),
              code: null, model: null, prijs: null, wijzigingen: 0, stappen: {} };
    STAPPEN.forEach(function (s) { r.stappen[s] = 0; });
    return r;
  }

  /* De huidige stand van de configurator, samengevat tot wat het dashboard
     nodig heeft. Alles komt uit modules die er al zijn; deze module weet zelf
     niets van schepen. */
  function stand() {
    if (!global.NGJachtKeuze) return null;
    var st;
    try { st = global.NGJachtKeuze(); } catch (e) { return null; }
    if (!st) return null;
    var uit = { opties: (st.opties || []).slice() };
    VELDEN.forEach(function (f) { uit[f] = st[f] || null; });
    uit.code = code(st);
    uit.prijs = prijs(st);
    return uit;
  }

  /* Dezelfde vorm als de deelbare link, zodat de werf een regel uit het
     dashboard kan aanklikken en precies dat schip voor zich krijgt. Wordt de
     codevorm in de configurator ooit anders, dan hoort hij hier mee te
     veranderen - vandaar dat het één functie is en geen losse plakwerkjes. */
  function code(st) {
    var D = global.NGJachtData;
    var kern = VELDEN.map(function (f) { return st[f]; }).join('.');
    var opties = (st.opties || []).slice();
    if (D && D.opties) {
      var volgorde = D.opties.map(function (o) { return o.v; });
      opties.sort(function (a, b) { return volgorde.indexOf(a) - volgorde.indexOf(b); });
    }
    return opties.length ? kern + '~' + opties.join(',') : kern;
  }

  /* Het bedrag in euro's, ongeacht in welke munt de bezoeker stond te kijken.
     Anders zouden de gemiddelden in het dashboard een mengsel van valuta's
     zijn, en dat is geen gemiddelde maar een optelsom van appels en peren. */
  function prijs(st) {
    var D = global.NGJachtData;
    if (!D || !D.prijzenActief || !D.prijsVan) return null;
    try {
      var p = D.prijsVan(st);
      return p && typeof p.totaal === 'number' ? Math.round(p.totaal) : null;
    } catch (e) { return null; }
  }

  /* ---------- wegschrijven ---------- */

  function bewaar() {
    if (!huidige) return;
    var lijst = lees();
    var i = -1;
    for (var k = 0; k < lijst.length; k++) if (lijst[k] && lijst[k].id === huidige.id) { i = k; break; }
    if (i >= 0) lijst[i] = huidige; else lijst.push(huidige);
    schrijf(opschonen(lijst));
    geschreven = true;
  }

  /* Naar de werf, als de werf daarom gevraagd heeft.
     sendBeacon omdat dit ook op het moment van weggaan gebeurt: een gewone
     fetch wordt dan afgebroken en het bericht komt nooit aan. Lukt beacon niet,
     dan een fetch met keepalive; lukt die ook niet, dan gebeurt er niets en
     staat het bezoek nog steeds lokaal. */
  function verstuur() {
    var adres = global.NG_METING_ENDPOINT;
    if (!adres || !huidige) return;
    var pak = JSON.stringify({ bezoek: huidige, versie: 1 });
    try {
      if (global.navigator && navigator.sendBeacon) {
        navigator.sendBeacon(adres, new Blob([pak], { type: 'application/json' }));
        return;
      }
    } catch (e) { /* dan de fetch hieronder */ }
    try {
      global.fetch(adres, { method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' }, body: pak })
        .catch(function () { /* het staat lokaal; dat is genoeg */ });
    } catch (e) { /* idem */ }
  }

  /* ---------- wat de configurator meldt ---------- */

  /* Eén ingang voor alles wat er gebeurt. De configurator roept dit aan en weet
     niet - en hoeft niet te weten - waar het heen gaat. */
  function gebeurtenis(soort, gegevens) {
    if (uitgeschakeld()) return;
    if (STAPPEN.indexOf(soort) < 0) return;
    if (!huidige) huidige = nieuweRegel();

    huidige.eind = nu();
    huidige.taal = taal();
    huidige.stappen[soort] = (huidige.stappen[soort] || 0) + 1;
    if (soort === 'gewijzigd') huidige.wijzigingen++;

    var s = stand();
    if (s) {
      VELDEN.forEach(function (f) { huidige[f] = s[f]; });
      huidige.opties = s.opties;
      huidige.code = s.code;
      huidige.prijs = s.prijs;
    }
    if (global.NGEenheden) {
      try { huidige.stelsel = global.NGEenheden.stelsel(); huidige.munt = global.NGEenheden.munt(); }
      catch (e) { /* dan zonder */ }
    }
    if (gegevens && typeof gegevens === 'object') {
      if (gegevens.model) huidige.model = gegevens.model;
    }

    bewaar();
    /* Versturen gebeurt alleen bij een stap die iets betekent. Bij elke
       kleurwissel een bericht naar de server sturen is verkeer zonder inhoud:
       de tussenstanden zeggen niets en de eindstand zegt alles. */
    if (soort === 'dossier' || soort === 'offerte' || soort === 'gedeeld') verstuur();
  }

  /* Bij het weggaan nog één keer, zodat een bezoek dat wél samenstelde maar
     niets aanvroeg ook geteld wordt. Juist die bezoeken zijn interessant: dat
     zijn de afhakers, en die staan in het dashboard met hun samenstelling
     erbij zodat de werf ziet waar het misging.

     pagehide en niet unload: unload werkt niet meer op mobiel Safari en op
     Chrome met terug-vooruit-cache staat hij op de nominatie. */
  function afsluiten() {
    if (!huidige || uitgeschakeld()) return;
    huidige.eind = nu();
    bewaar();
    verstuur();
  }

  /* ---------- lezen, voor het dashboard ---------- */

  function bezoeken() {
    return lees().filter(function (r) { return r && r.begin && r.eind; });
  }
  function wissen() {
    try { global.localStorage.removeItem(SLEUTEL); } catch (e) { /* dan niet */ }
    huidige = null; geschreven = false;
  }
  function zetUit(ja) {
    try {
      if (ja) { global.localStorage.setItem(SLEUTEL_UIT, 'ja'); wissen(); }
      else global.localStorage.removeItem(SLEUTEL_UIT);
    } catch (e) { /* dan niet */ }
  }
  function bron() {
    if (uitgeschakeld()) return 'uit';
    return global.NG_METING_ENDPOINT ? 'server' : 'lokaal';
  }

  if (global.addEventListener) {
    global.addEventListener('pagehide', afsluiten);
    /* Voor browsers die pagehide niet geven bij het wisselen van tabblad. */
    global.addEventListener('visibilitychange', function () {
      if (global.document && global.document.visibilityState === 'hidden') afsluiten();
    });
  }

  global.NGJachtMeting = {
    gebeurtenis: gebeurtenis,
    bezoeken: bezoeken,
    wissen: wissen,
    zetUit: zetUit,
    bron: bron,
    VELDEN: VELDEN,
    STAPPEN: STAPPEN,
    MAX_DAGEN: MAX_DAGEN,
    MAX_REGELS: MAX_REGELS
  };
})(typeof window !== 'undefined' ? window : globalThis);
