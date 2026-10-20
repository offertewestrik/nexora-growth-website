/* Eén manier om een afdrukbaar blad te tonen — voor alle rapporten op de site.
 *
 * Waarom dit bestaat: elk rapport deed hetzelfde trucje, namelijk
 * `window.open('', 'naam')` en dan het blad erin schrijven. Dat werkt zolang
 * de browser de pop-up toestaat. Doet hij dat niet — en op iPhone en iPad is
 * blokkeren de standaardinstelling — dan kreeg de bezoeker alleen de melding
 * "sta pop-ups toe" en verder niets. Hij kon zijn overzicht dus niet openen
 * en niet opslaan, terwijl het blad gewoon klaarstond.
 *
 * NGAfdruk.toon() lost dat op: lukt de pop-up, dan gebeurt er niets nieuws.
 * Lukt hij niet, dan komt hetzelfde blad in de pagina zelf te staan, in een
 * iframe met een eigen afdrukknop. Afdrukken vanuit een iframe drukt alleen
 * dat iframe af, dus het resultaat is identiek aan het pop-upvenster.
 *
 * De bezoeker merkt van dit verschil niets, behalve dat het werkt.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  function overlay(html, titel) {
    var oud = doc.getElementById('ngAfdruk');
    if (oud) oud.parentNode.removeChild(oud);

    var wrap = doc.createElement('div');
    wrap.id = 'ngAfdruk';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', titel || 'Afdrukvoorbeeld');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#333;display:flex;flex-direction:column';

    var balk = doc.createElement('div');
    balk.style.cssText = 'flex:0 0 auto;background:#111;color:#fff;padding:12px 18px;display:flex;' +
      'justify-content:space-between;align-items:center;gap:12px;font:14px/1.3 Arial,sans-serif';
    var naam = doc.createElement('b');
    naam.textContent = titel || 'Afdrukvoorbeeld';
    naam.style.cssText = 'font-size:14px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';

    var knoppen = doc.createElement('div');
    knoppen.style.cssText = 'display:flex;gap:8px;flex:0 0 auto';

    var afdruk = doc.createElement('button');
    afdruk.type = 'button';
    afdruk.textContent = 'Afdrukken / opslaan als PDF';
    afdruk.style.cssText = 'background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer';

    var sluit = doc.createElement('button');
    sluit.type = 'button';
    sluit.textContent = 'Sluiten';
    sluit.setAttribute('aria-label', 'Afdrukvoorbeeld sluiten');
    sluit.style.cssText = 'background:transparent;border:1px solid #666;color:#fff;border-radius:8px;padding:10px 14px;cursor:pointer';

    knoppen.appendChild(afdruk); knoppen.appendChild(sluit);
    balk.appendChild(naam); balk.appendChild(knoppen);

    var frame = doc.createElement('iframe');
    frame.title = titel || 'Afdrukvoorbeeld';
    frame.style.cssText = 'flex:1 1 auto;width:100%;border:0;background:#333';

    wrap.appendChild(balk); wrap.appendChild(frame);
    doc.body.appendChild(wrap);

    /* De pagina eronder mag niet meescrollen zolang dit openstaat. */
    var scrollWas = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';

    /* srcdoc in plaats van document.write: het blad staat dan als één geheel
       klaar en de afdrukstijl van het blad geldt gewoon binnen het iframe. */
    frame.srcdoc = html;

    function weg() {
      doc.body.style.overflow = scrollWas;
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      doc.removeEventListener('keydown', ontsnap);
    }
    function ontsnap(e) { if (e.key === 'Escape') weg(); }
    doc.addEventListener('keydown', ontsnap);
    sluit.addEventListener('click', weg);

    afdruk.addEventListener('click', function () {
      var v = frame.contentWindow;
      if (!v) return;
      v.focus();
      v.print();
    });

    /* De knop in het blad zelf (die staat er voor het pop-upvenster) roept
       window.print() aan; binnen het iframe drukt dat hetzelfde af. Niets
       te doen dus — maar de kop van het blad is in deze weergave dubbelop,
       dus die verbergen we zodra het iframe klaar is. */
    frame.addEventListener('load', function () {
      try {
        var d = frame.contentDocument;
        var kop = d && d.querySelector('body > header');
        if (kop) kop.style.display = 'none';
      } catch (e) { /* andere herkomst kan hier niet, maar nooit laten vallen */ }
    });

    return true;
  }

  /**
   * Toont een compleet HTML-document als afdrukbaar blad.
   * @param html   het volledige document, inclusief eigen afdrukstijl
   * @param naam   vensternaam én titel van de terugvalweergave
   * @returns 'venster' als de pop-up openging, 'pagina' bij de terugval
   */
  function toon(html, naam, titel) {
    var win = null;
    try { win = global.open('', naam || '_blank'); } catch (e) { win = null; }
    if (win && win.document) {
      try {
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        return 'venster';
      } catch (e) { /* dichtgeklapt tijdens het schrijven; dan de terugval */ }
    }
    overlay(html, titel || naam);
    return 'pagina';
  }

  global.NGAfdruk = { toon: toon };
})(typeof window !== 'undefined' ? window : globalThis);
