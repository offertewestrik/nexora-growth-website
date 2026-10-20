/* Eenheden en valuta van de jachtconfigurator.
 *
 * WAAROM DIT ER IS
 * De configurator rekent en tekent in meters en euro's, en dat blijft zo: dat
 * is wat de werf bouwt en wat de werf factureert. Maar dit segment is niet
 * Nederlands. Een koper in Fort Lauderdale denkt in voeten en dollars, een
 * koper in Poole in voeten en ponden, en wie op een scherm moet omrekenen wat
 * "28,9 m" in zijn eigen maten is, leest niet verder.
 *
 * Dus staat er één plek waar een getal een eenheid krijgt. Elke module vraagt
 * hier om, en niemand plakt zelf nog ' m' of '€ ' achter een getal.
 *
 * WAT NIET MEEBEWEEGT, EN WAAROM
 *   knopen        Een knoop is een zeemijl per uur en die is in Miami net zo
 *                 lang als in Monaco. Er is geen jachtwereld waarin snelheid
 *                 in kilometers of mijlen per uur staat.
 *   zeemijlen     Zelfde verhaal: het bereik van een schip staat overal in nm.
 *   graden, uren  Een bouwtijd in maanden is in elke maat een maand.
 *
 * Wat wel meebeweegt: lengtematen (m/ft), inhoud (liter/US gallon), gewicht
 * (ton/long ton) en het bedrag.
 *
 * DE KEUZE IS KIJKGEDRAG, GEEN SAMENSTELLING
 * Net als welke ruimte er op het interieurblad staat, zegt de eenheidkeuze
 * niets over het schip dat besteld wordt. Hij hoort daarom niet in de deelbare
 * code en niet in het dossiernummer: wie een link doorstuurt naar zijn
 * makelaar deelt een schip, geen voorkeur. Hij wordt wel onthouden in de
 * browser, want twee keer op dezelfde dag omschakelen is geen keuze maar een
 * ergernis.
 *
 * DE KOERS
 * Staat als vaste tabel met peildatum in jacht-data.js. Elk omgerekend bedrag
 * draagt die datum zichtbaar bij zich en heet "circa": een prijs die in euro's
 * is afgesproken is in dollars geen bedrag maar een indicatie, en dat hoort er
 * te staan in plaats van het aan de lezer over te laten.
 */
(function (global) {
  'use strict';

  var SLEUTEL = 'ng-jacht-eenheden';

  /* Omrekenfactoren. Exact, niet afgerond: het afronden gebeurt pas bij het
     tonen, want twee keer afronden op een rij laat 24,0 m als 78 ft eindigen
     terwijl het er 78,7 zijn. */
  var VOET = 3.280839895;          // 1 m
  var GALLON = 0.2641720524;       // 1 liter, US gallon
  var LONGTON = 0.9842065276;      // 1 metrische ton

  var stand = { stelsel: 'metrisch', munt: 'EUR' };

  function taal() {
    return (global.NGTaal && global.NGTaal.taal) ? global.NGTaal.taal() : 'nl';
  }
  function scheider() {
    return (global.NGTaal && global.NGTaal.decimaal) ? global.NGTaal.decimaal() : ',';
  }
  function locale() {
    var t = taal();
    return t === 'nl' ? 'nl-NL' : (t === 'de' ? 'de-DE' : 'en-GB');
  }
  function T(z) { return (global.NGTaal && global.NGTaal.T) ? global.NGTaal.T(z) : z; }

  /* Wat de bezoeker de vorige keer koos. Een browser die niets mag opslaan
     (privacyvenster, oude toestemmingsinstelling) gooit hier een fout; dan
     staat er gewoon de standaard en werkt alles verder. */
  function lees() {
    try {
      var ruw = global.localStorage && global.localStorage.getItem(SLEUTEL);
      if (!ruw) return;
      var v = JSON.parse(ruw);
      if (v && (v.stelsel === 'metrisch' || v.stelsel === 'imperiaal')) stand.stelsel = v.stelsel;
      if (v && typeof v.munt === 'string') stand.munt = v.munt;
    } catch (e) { /* dan de standaard */ }
  }
  function bewaar() {
    try { global.localStorage.setItem(SLEUTEL, JSON.stringify(stand)); }
    catch (e) { /* niet kunnen onthouden is geen reden om niet te werken */ }
  }
  lees();

  function stelsel() { return stand.stelsel; }
  function munt() { return stand.munt; }
  function imperiaal() { return stand.stelsel === 'imperiaal'; }

  /* Iemand heeft omgeschakeld. De configurator luistert hierop en tekent
     opnieuw; dat gebeurt hier niet zelf, want deze module weet niet wat er op
     het scherm staat en hoort dat ook niet te weten. */
  function meld() {
    try {
      global.dispatchEvent(new CustomEvent('ng-eenheden', { detail: { stelsel: stand.stelsel, munt: stand.munt } }));
    } catch (e) {
      /* oudere browser zonder CustomEvent-constructor */
      try {
        var ev = global.document.createEvent('CustomEvent');
        ev.initCustomEvent('ng-eenheden', false, false, stand);
        global.dispatchEvent(ev);
      } catch (e2) { /* dan geen bericht; de knop zelf hertekent wel */ }
    }
  }
  function zetStelsel(v) {
    if (v !== 'metrisch' && v !== 'imperiaal') return;
    if (stand.stelsel === v) return;
    stand.stelsel = v; bewaar(); meld();
  }
  function zetMunt(v) {
    if (stand.munt === v) return;
    stand.munt = v; bewaar(); meld();
  }

  /* ---------- getallen ---------- */

  /* Eén decimaal, in het scheidingsteken van de taal. Dit was in drie modules
     apart uitgeschreven en liep uit elkaar: op de Engelse pagina stond
     "car 4.5 m" naast "28,9 m". */
  function getal(x, decimalen) {
    if (x === null || x === undefined || isNaN(x)) return '-';
    var d = decimalen === undefined ? 1 : decimalen;
    var s = (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
    /* Een nul achter de komma valt weg als er niet om een vast aantal
       decimalen gevraagd is: de Giga 120 is 120 meter en niet 120,0 meter, en
       zo stond het er ook voordat deze module bestond. Vraagt een aanroeper
       wél om een vast aantal - de diepgang in de PDF staat op twee decimalen -
       dan blijft de nul staan, want daar is een kolom die moet uitlijnen. */
    if (decimalen === undefined) s = s.replace(/\.0$/, '');
    return s.replace('.', scheider());
  }
  function heel(x) {
    if (x === null || x === undefined || isNaN(x)) return '-';
    try { return new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(x); }
    catch (e) { return String(Math.round(x)); }
  }

  /* ---------- lengte ---------- */

  /* Een lengte in meters, getoond in het gekozen stelsel.
     Decimale voeten en geen voeten-en-duimen: 94 ft 10 in leest als een
     timmermaat, terwijl elke jachtmakelaar zijn schepen in 94.8 ft adverteert.
     `decimalen` mag omlaag voor een tekening waar geen ruimte is. */
  function lengte(meters, decimalen) {
    if (meters === null || meters === undefined || isNaN(meters)) return '-';
    /* `decimalen` wordt ongewijzigd doorgegeven, ook als hij niet gezet is:
       getal() gebruikt dan één decimaal en laat een nul achter de komma weg.
       Stond hier eerder een harde 1, en dan werd de Giga 120 "120,0 m". */
    return imperiaal()
      ? getal(meters * VOET, decimalen) + ' ft'
      : getal(meters, decimalen) + ' m';
  }
  /* Alleen de eenheid, voor een tekening die het getal zelf al zet. */
  function lengteEenheid() { return imperiaal() ? 'ft' : 'm'; }
  /* Alleen het getal, zonder eenheid erachter. */
  function lengteGetal(meters, decimalen) {
    if (meters === null || meters === undefined || isNaN(meters)) return '-';
    return getal(imperiaal() ? meters * VOET : meters, decimalen);
  }

  /* ---------- inhoud en gewicht ---------- */

  function inhoud(liters) {
    if (liters === null || liters === undefined || isNaN(liters)) return '-';
    return imperiaal() ? heel(liters * GALLON) + ' gal' : heel(liters) + ' l';
  }
  function gewicht(ton) {
    if (ton === null || ton === undefined || isNaN(ton)) return '-';
    return imperiaal() ? getal(ton * LONGTON, 0) + ' LT' : getal(ton, 0) + ' t';
  }

  /* ---------- wat niet meebeweegt ---------- */

  function snelheid(knopen) { return getal(knopen) + ' kn'; }
  function afstand(zeemijlen) { return heel(zeemijlen) + ' nm'; }

  /* ---------- geld ---------- */

  function muntRegel(code) {
    var K = global.NGJachtData && global.NGJachtData.koersen;
    if (!K) return { v: 'EUR', teken: '€', koers: 1 };
    for (var i = 0; i < K.munten.length; i++) if (K.munten[i].v === (code || stand.munt)) return K.munten[i];
    return K.munten[0];
  }
  function munten() {
    var K = global.NGJachtData && global.NGJachtData.koersen;
    return K ? K.munten : [];
  }
  function peildatum() {
    var K = global.NGJachtData && global.NGJachtData.koersen;
    if (!K) return '';
    var t = taal();
    return (t !== 'nl' && K['peildatum_' + t]) || K.peildatum;
  }

  /* Een bedrag in euro's, getoond in de gekozen munt.

     Omgerekende bedragen worden hard afgerond - op tienduizend bij alles boven
     een miljoen. Een dollarbedrag dat op de euro nauwkeurig lijkt suggereert
     een prijs die in dollars is afgesproken, en dat is hij niet: de euro is de
     contractvaluta en de koers van morgen is een andere. Grof afronden zegt
     precies dat, zonder er een zin over te hoeven schrijven. */
  function geld(euros) {
    if (euros === null || euros === undefined || isNaN(euros)) return '-';
    var m = muntRegel();
    var bedrag = euros * m.koers;
    if (m.v !== 'EUR') {
      var stap = Math.abs(bedrag) >= 1e6 ? 10000 : (Math.abs(bedrag) >= 1e5 ? 1000 : 100);
      bedrag = Math.round(bedrag / stap) * stap;
    }
    return m.teken + ' ' + heel(bedrag);
  }
  /* Staat er een omgerekend bedrag op het scherm, dan hoort erbij waar het
     vandaan komt. In euro's is er niets om te melden. */
  function geldNoot() {
    if (stand.munt === 'EUR') return '';
    return T('Bedragen in vreemde valuta zijn omgerekend tegen de koers van ') + peildatum() +
           T(' en zijn indicatief; de werf sluit af in euro’s.');
  }

  global.NGEenheden = {
    stelsel: stelsel, munt: munt, imperiaal: imperiaal,
    zetStelsel: zetStelsel, zetMunt: zetMunt,
    getal: getal, heel: heel,
    lengte: lengte, lengteGetal: lengteGetal, lengteEenheid: lengteEenheid,
    inhoud: inhoud, gewicht: gewicht,
    snelheid: snelheid, afstand: afstand,
    geld: geld, geldNoot: geldNoot, munten: munten, peildatum: peildatum,
    VOET: VOET
  };
})(typeof window !== 'undefined' ? window : globalThis);
