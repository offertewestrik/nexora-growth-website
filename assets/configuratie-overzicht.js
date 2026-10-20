/* Configuratie-overzicht van de uitbouw-/aanbouwconfigurator, als afdrukbaar
 * A4-blad.
 *
 * Waarom dit er is: de configurator had wel een downloadknop, maar die leverde
 * een kaal tekstbestand op. Wie het overzicht wilde bewaren of doorsturen —
 * naar een partner, een aannemer, de gemeente — had niets bruikbaars. Het
 * enige blad dat je als PDF kon opslaan zat verstopt achter "Technische
 * tekeningen", en dat is een heel ander document: twintig werktekeningen in
 * plaats van één samenvatting.
 *
 * Dit blad is die samenvatting: wat er gekozen is, wat het ongeveer kost en
 * waar de grens ligt van wat de configurator kan zeggen.
 *
 * De regel die hier net zo hard geldt als overal: geen enkel bedrag en geen
 * enkel voorbehoud wordt hier verzonnen. Alles komt uit de configurator zelf —
 * dezelfde prijsopbouw en dezelfde btw-tekst die de bezoeker op het scherm
 * ziet. Wijkt het blad af van het scherm, dan is het blad fout.
 *
 * De pagina levert de gegevens via window.NGConfigGegevens(); dit bestand
 * doet alleen de opmaak en het afdrukken.
 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  function blad(g) {
    var datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    var p = projectgegevens();
    var hero=global.document && global.document.getElementById('confHero');
    var afbeelding=hero ? '<figure><img src="'+esc(hero.src)+'" alt="Sfeerimpressie uitbouw"><figcaption>Sfeerimpressie; de gekozen maten, puien en inrichting kunnen afwijken. De specificaties hieronder zijn leidend.</figcaption></figure>' : '';

    var rijen = g.regels.map(function (r) {
      return '<tr><th>' + esc(r.label) + '</th><td>' + esc(r.waarde) + '</td></tr>';
    }).join('');

    /* De prijsopbouw komt regel voor regel uit prijs(). Staat er een post op
       nul, dan laten we hem weg in plaats van een streepje te tonen: een lege
       regel roept vragen op die het blad niet kan beantwoorden. */
    var posten = [
      ['Basis + gekozen afwerking · ' + g.m2 + ' m²', g.base],
      ['Opties en meer-/minderwerk', g.extra],
      ['Transport en plaatsing', g.transport]
    ].filter(function (x) { return x[1] !== 0; }).map(function (x) {
      return '<tr><td>' + esc(x[0]) + '</td><td class="nr">' + esc(g.euro(x[1])) + '</td></tr>';
    }).join('');

    var voorbehoud = [
      'Dit is een richtprijs op basis van je keuzes in de configurator, geen offerte. ' +
        'Er kunnen geen rechten aan worden ontleend.',
      'De prijs geldt voor een normaal bereikbare bouwplaats. Bijzondere omstandigheden, zoals ' +
        'beperkte aanvoer, hoogteverschil, sloopwerk of het verleggen van leidingen, zitten er niet in.',
      'Constructie, fundering en de draagbalk boven een doorbraak moeten door een constructeur ' +
        'worden bevestigd voordat er gebouwd wordt.',
      'Of er een vergunning nodig is, hangt af van je perceel en de gemeente. Dat toetst de ' +
        'gemeente, niet deze configurator.',
      g.btwNoot
    ].filter(Boolean).map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('');

    return '<!doctype html><html lang="nl"><head><meta charset="utf-8">' +
      '<title>Configuratie-overzicht ' + esc(g.type) + (p.project ? ' · ' + esc(p.project) : '') + '</title>' +
      '<style>' +
      '*{box-sizing:border-box}figure{margin:20px 0;break-inside:avoid}figure img{width:100%;max-height:75mm;object-fit:contain}figcaption{font-size:11px;line-height:1.5;color:#555}tr{break-inside:avoid}thead{display:table-header-group}h2{break-after:avoid}' +
      'body{margin:0;background:#333;font-family:Arial,Helvetica,sans-serif;color:#111}' +
      'header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;' +
        'display:flex;justify-content:space-between;align-items:center;gap:12px}' +
      'header b{font-size:14px}header span{font-size:11px;color:#e8b04b}' +
      'button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}' +
      '.blad{width:min(96vw,210mm);margin:22px auto;background:#fff;padding:16mm;box-shadow:0 8px 28px #0008}' +
      '.kop{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;' +
        'border-bottom:2px solid #111;padding-bottom:12px}' +
      'h1{font-size:21px;margin:0 0 4px}.kop p{margin:0;font-size:12px;color:#555}' +
      '.stempel{border:2px solid #111;padding:8px 12px;text-align:center;font-size:11px;' +
        'font-weight:800;letter-spacing:.5px;line-height:1.3;white-space:nowrap}' +
      '.stempel em{display:block;font-style:normal;font-weight:400;font-size:10px;color:#555;margin-top:3px}' +
      'h2{font-size:13px;letter-spacing:.5px;text-transform:uppercase;margin:26px 0 8px;' +
        'border-bottom:1px solid #ccc;padding-bottom:5px}' +
      'table{width:100%;border-collapse:collapse}' +
      'th,td{text-align:left;padding:7px 8px;font-size:12.5px;vertical-align:top;border-bottom:1px solid #eee}' +
      'th{width:34%;font-weight:700;color:#333}' +
      '.nr{text-align:right;white-space:nowrap}' +
      '.totaal td{border-top:2px solid #111;border-bottom:0;padding-top:12px;font-size:16px;font-weight:800}' +
      '.subtot td{font-weight:700}' +
      'ul{margin:0;padding-left:18px}li{font-size:11.5px;line-height:1.55;margin:5px 0;color:#333}' +
      '.voet{margin-top:24px;padding-top:12px;border-top:1px solid #ccc;font-size:11px;color:#555;line-height:1.55}' +
      /* Zonder dit laat Chrome bij de standaardinstelling alle vlakken weg,
         en dan verdwijnt de stempel uit de opgeslagen PDF. */
      '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '@media print{header{display:none}body{background:#fff}' +
        '.blad{width:100%;margin:0;box-shadow:none}}' +
      '@page{size:A4 portrait;margin:0}' +
      '</style></head><body>' +
      '<header><b>Configuratie-overzicht ' + esc(g.type) + '</b>' +
        '<span>RICHTPRIJS · GEEN OFFERTE</span>' +
        '<button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' +
      '<div class="blad">' +
        '<div class="kop"><div><h1>' + esc(g.type) + (p.project ? ' · ' + esc(p.project) : '') + '</h1>' +
          '<p>Samengesteld op ' + esc(datum) +
          (p.adres ? ' · ' + esc(p.adres) : '') +
          (p.revisie ? ' · revisie ' + esc(p.revisie) : '') + '</p></div>' +
          '<div class="stempel">RICHTPRIJS<br>GEEN OFFERTE<em>Next Growth · nextgrowthdigital.nl</em></div></div>' +

        afbeelding + '<h2>Jouw keuzes</h2><table>' + rijen + '</table>' +

        '<h2>Prijsopbouw</h2><table>' + posten +
          '<tr class="subtot"><td>Subtotaal exclusief btw</td><td class="nr">' + esc(g.euro(g.excl)) + '</td></tr>' +
          '<tr><td>Btw ' + g.btwPct + '%</td><td class="nr">' + esc(g.euro(g.incl - g.excl)) + '</td></tr>' +
          '<tr class="totaal"><td>Richtprijs inclusief btw</td><td class="nr">' + esc(g.euro(g.incl)) + '</td></tr>' +
        '</table>' +

        '<h2>Voorbehouden</h2><ul>' + voorbehoud + '</ul>' +

        '<p class="voet">Dit overzicht laat zien wat je hebt samengesteld en wat dat ongeveer kost, ' +
        'zodat je het kunt bewaren, vergelijken of doorsturen. Wil je een echte prijs? Die maken we ' +
        'op basis van jouw situatie. Vraag een offerte aan via nextgrowthdigital.nl of bel 06 83 90 21 92. ' +
        'De bijbehorende werktekeningen staan in de configurator onder “Technische tekeningen”.</p>' +
      '</div></body></html>';
  }

  /* Dezelfde projectgegevens die het tekeningenpakket gebruikt, zodat een
     overzicht en een tekeningenset van dezelfde configuratie dezelfde kop
     dragen. */
  function projectgegevens() {
    try { return JSON.parse(global.localStorage.getItem('ng-uitbouw-project') || '{}'); }
    catch (e) { return {}; }
  }

  function open() {
    if (typeof global.NGConfigGegevens !== 'function') {
      return alert('Het overzicht kan nog niet worden opgebouwd. Ververs de pagina en probeer het opnieuw.');
    }
    var g = global.NGConfigGegevens();
    if (!g) return alert('Het overzicht kan nog niet worden opgebouwd. Ververs de pagina en probeer het opnieuw.');
    var html = blad(g);
    if (global.NGAfdruk) global.NGAfdruk.toon(html, 'ng-configuratie', 'Configuratie-overzicht ' + g.type);
    else {
      var w = global.open('', 'ng-configuratie');
      if (!w) return alert('Sta pop-ups toe om het overzicht te openen.');
      w.document.open(); w.document.write(html); w.document.close();
    }
  }

  function init() {
    var b = document.getElementById('overzichtBtn');
    if (b) b.addEventListener('click', open);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  global.NGConfigOverzicht = { blad: blad, open: open };
})(typeof window !== 'undefined' ? window : globalThis);
