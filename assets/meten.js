/* Meet hoe ver bezoekers in een configurator komen.
 *
 * De configurators lieten tot nu toe niets achter: wie hem opende en halverwege
 * wegklikte, bestond niet. Daardoor is niet te zien of mensen afhaken op de
 * maten, op de prijs of pas bij het formulier — en dus ook niet wat er beter
 * moet.
 *
 * Drie punten zijn genoeg om dat te zien:
 *   geopend       de pagina is geladen
 *   samengesteld  er is minstens één keuze gemaakt of maat versteld
 *   aangevraagd   het offerteformulier is verstuurd
 *
 * Het meet aantallen, geen mensen: alleen welke configurator en welk moment.
 * Geen naam, geen e-mailadres, geen identificatie tussen bezoeken door.
 *
 * Volledig los van de bestaande code. Het luistert op document-niveau naar
 * change, input en submit, zodat er niets in de configurators zelf verandert
 * en een fout hier nooit een aanvraag kan tegenhouden.
 */
(function () {
  'use strict';

  var BASIS = 'https://numqnwpkvlcxtvkiytmi.supabase.co';
  var SLEUTEL = 'sb_publishable_r-yX9wBX2UaM8iIXdjciJA_1AGlZ6qC';

  // Naam van deze configurator: expliciet via data-meet, anders de bestandsnaam.
  // "ng-" ervoor zodat deze tellingen niet door de ZwembadStudio-cijfers lopen.
  var bron = document.body.getAttribute('data-meet')
    || 'ng-' + (location.pathname.split('/').pop() || 'index')
         .replace(/\.html$/, '').replace(/-configurator$/, '');

  var gestuurd = {};

  function meet(gebeurtenis) {
    if (gestuurd[gebeurtenis]) return;          // één keer per bezoek
    gestuurd[gebeurtenis] = 1;
    try {
      fetch(BASIS + '/rest/v1/zs_events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SLEUTEL,
          Authorization: 'Bearer ' + SLEUTEL,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ tenant: bron, event: gebeurtenis }),
        // keepalive: de telling moet ook aankomen als de bezoeker meteen
        // doorklikt of het tabblad sluit
        keepalive: true
      }).catch(function () { /* meten mag nooit iets breken */ });
    } catch (e) { /* idem */ }
  }

  window.zsMeet = meet;

  meet('geopend');

  // Eerste echte handeling. Een klik op een tegel is een change op de radio
  // eronder; aan een maatschuif zitten input-gebeurtenissen.
  function bezig() { meet('samengesteld'); }
  document.addEventListener('change', bezig, true);
  document.addEventListener('input', bezig, true);

  // Het formulier verstuurt zichzelf via fetch en roept geen submit-handler van
  // ons aan; door in de capture-fase te luisteren tellen we hem toch mee,
  // ongeacht wat de pagina daarna met de gebeurtenis doet.
  document.addEventListener('submit', function () { meet('aangevraagd'); }, true);
})();
