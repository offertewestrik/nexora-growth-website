/* De configuratie overleeft een herlaad.
 *
 * WAAROM
 * Iemand schuift een kwartier aan maten, kiest een gevel, sleept zijn bank
 * naar de goede hoek — en drukt dan op F5, of klikt naar de prijzenpagina en
 * terug. Alles weg. Dat is niet alleen zonde van zijn tijd: het is precies het
 * moment waarop iemand afhaakt, want opnieuw beginnen doet niemand.
 *
 * De zelfgemaakte indeling apart bewaren zou niet helpen. De rest van de
 * configuratie verdween namelijk óók, en een indeling die terugkomt in een
 * uitbouw van andere maten is erger dan geen indeling. Dus gaat de hele staat
 * mee.
 *
 * WAT ER NIET GEBEURT
 * Er wordt niets naar een server gestuurd. Het staat in localStorage van de
 * bezoeker zelf, hij kan het met één knop weggooien, en na dertig dagen
 * vervalt het vanzelf. Een configuratie is geen persoonsgegeven, maar hij
 * hoort ook niet eeuwig ergens te blijven staan.
 *
 * AANSLUITEN — twee regels in de configurator:
 *   NGBewaren.laad(st);                      // ná defaults(), vóór render()
 *   NGBewaren.bewaar(st);                    // in updatePrijs()
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var VERSIE = 1;
  var MAX_DAGEN = 30;
  var PREFIX = 'ng-conf-';

  /* Private modus, uitgeschakelde opslag, een volle schijf: localStorage kan
     bij élke aanroep gooien, ook bij lezen. Eén keer proberen en daarna
     zwijgen is beter dan een configurator die stukloopt op een instelling van
     de browser. */
  function veilig(fn, terug) {
    try { return fn(); } catch (e) { return terug; }
  }

  function sleutel(st) { return PREFIX + (st && st.type ? st.type : 'onbekend'); }

  function bewaarNu(st) {
    if (!st || !global.localStorage) return;
    veilig(function () {
      global.localStorage.setItem(sleutel(st), JSON.stringify({
        v: VERSIE, t: Date.now(), st: st
      }));
    });
  }

  /* De prijsfunctie draait bij elke muisbeweging op een maatschuif. Naar
     localStorage schrijven is synchroon en raakt de schijf, dus dat gebeurt
     hoogstens één keer per halve seconde. */
  var wacht = null;
  function bewaar(st) {
    if (wacht) global.clearTimeout(wacht);
    wacht = global.setTimeout(function () { wacht = null; bewaarNu(st); }, 500);
  }

  function wis(st) {
    veilig(function () { global.localStorage.removeItem(sleutel(st)); });
  }

  /* Terugzetten in de bestaande staat en niet ervoor in de plaats. Zo kan een
     sleutel die in de code is verdwenen niet terugkomen uit een oude opslag,
     en krijgt een sleutel die er nieuw bij is gekomen netjes zijn
     standaardwaarde. */
  function samenvoegen(doel, bron) {
    Object.keys(doel).forEach(function (k) {
      if (!(k in bron)) return;
      var d = doel[k], b = bron[k];
      if (b === null) { doel[k] = null; return; }
      if (Array.isArray(d) || Array.isArray(b)) { doel[k] = b; return; }
      if (d && typeof d === 'object' && b && typeof b === 'object') { doel[k] = b; return; }
      if (typeof b === typeof d || d === null) doel[k] = b;
    });
    /* inrichting en kozijnen staan niet in de standaardstaat — ze bestaan pas
       zodra de bezoeker zelf iets indeelt. Ze horen er wél bij. */
    ['inrichting', 'kozijnen', 'kamerplanOverride'].forEach(function (k) {
      if (k in bron) doel[k] = bron[k];
    });
    return doel;
  }

  function laad(st, opties) {
    opties = opties || {};
    if (!st || !global.localStorage) return false;
    /* Komt iemand binnen via een landingspagina met een startpunt erin, dan
       wil hij dát zien en niet zijn sessie van vorige week. */
    if (opties.negeer) return false;
    var ruw = veilig(function () { return global.localStorage.getItem(sleutel(st)); }, null);
    if (!ruw) return false;
    var q = veilig(function () { return JSON.parse(ruw); }, null);
    if (!q || q.v !== VERSIE || !q.st || q.st.type !== st.type) { wis(st); return false; }
    if (!q.t || Date.now() - q.t > MAX_DAGEN * 864e5) { wis(st); return false; }
    samenvoegen(st, q.st);
    return true;
  }

  /* Stilzwijgend terugzetten is verwarrend: de bezoeker weet niet waarom hij
     niet op de standaardmaat binnenkomt. Eén regel die het zegt, met de knop
     om het weg te gooien ernaast, en na tien seconden verdwijnt hij. */
  function melden(st, opnieuw) {
    if (!doc || !doc.body) return;
    if (doc.getElementById('ngBewaardMelding')) return;
    var s = doc.createElement('style');
    s.textContent =
      '#ngBewaardMelding{position:fixed;left:1rem;bottom:1rem;z-index:9997;display:flex;gap:.6rem;' +
      'align-items:center;background:var(--merk-kopbalk,#26251F);color:#fff;border-radius:12px;padding:.7rem .9rem;' +
      'font:600 .78rem/1.4 Inter,Arial,sans-serif;box-shadow:0 8px 24px #0003;max-width:min(92vw,26rem)}' +
      '#ngBewaardMelding button{font:inherit;font-weight:800;border:0;border-radius:8px;padding:.4rem .7rem;' +
      'background:var(--acc,#C8A24A);color:var(--merk-knoptekst,#26251F);cursor:pointer}' +
      '#ngBewaardMelding .ngbm__x{background:transparent;color:#fff;padding:.2rem .4rem;font-size:1rem}' +
      '@media print{#ngBewaardMelding{display:none}}';
    doc.head.appendChild(s);
    var el = doc.createElement('div');
    el.id = 'ngBewaardMelding';
    el.setAttribute('role', 'status');
    el.innerHTML = '<span>Je eerdere samenstelling staat er weer in.</span>' +
      '<button type="button" data-ngbm="opnieuw">Opnieuw beginnen</button>' +
      '<button type="button" class="ngbm__x" data-ngbm="weg" aria-label="Melding sluiten">×</button>';
    el.addEventListener('click', function (e) {
      var k = e.target.closest ? e.target.closest('[data-ngbm]') : null;
      if (!k) return;
      if (k.getAttribute('data-ngbm') === 'opnieuw') {
        wis(st);
        if (typeof opnieuw === 'function') opnieuw();
        else global.location.reload();
      }
      el.remove();
    });
    doc.body.appendChild(el);
    global.setTimeout(function () { if (el.parentNode) el.remove(); }, 10000);
  }

  global.NGBewaren = {
    laad: laad, bewaar: bewaar, bewaarNu: bewaarNu, wis: wis, melden: melden,
    _hulp: { samenvoegen: samenvoegen, sleutel: sleutel }
  };
})(typeof window !== 'undefined' ? window : globalThis);
