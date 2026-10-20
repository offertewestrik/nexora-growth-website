/* Verbouwkosten-calculator.
 *
 * De bezoeker vinkt aan wat er moet gebeuren en vult aantallen in; de
 * calculator telt de landelijke richtprijzen op tot een bandbreedte voor
 * de hele verbouwing, met opslagen voor regio, onvoorzien en leges.
 *
 * Waarom dit bewust een BANDBREEDTE geeft en geen bedrag: een verbouwing
 * die op de euro nauwkeurig voorspeld wordt vóórdat iemand de woning
 * gezien heeft, is een verkooppraatje. De onder- en bovengrens komen
 * rechtstreeks uit de bronnen in verbouwkosten-data.js. Wat de calculator
 * niet weet — de staat van uw woning, de bereikbaarheid, de fundering —
 * staat als voorbehoud op het overzicht in plaats van weggerekend te zijn.
 *
 * Dit is uitdrukkelijk geen offerte van Next Growth. Het overzicht draagt
 * daarom de stempel INDICATIE — GEEN OFFERTE.
 */
(function (global) {
  'use strict';

  var D = global.NGVerbouwPrijzen;
  var BEWAARSLEUTEL = 'ng-verbouwkosten-v1';

  var euro = function (n) {
    return '€ ' + new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(n);
  };
  /* Afronden in de veilige richting: ondergrens omlaag, bovengrens omhoog.
     Zo suggereert het overzicht nooit meer precisie dan er is. */
  var omlaag = function (n) { var s = n < 500 ? 10 : 50; return Math.floor(n / s) * s; };
  var omhoog = function (n) { var s = n < 500 ? 10 : 50; return Math.ceil(n / s) * s; };
  var bereik = function (lo, hi) { return euro(omlaag(lo)) + ' – ' + euro(omhoog(hi)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var EENHEID = { m2: 'm²', m: 'm', st: 'x' };

  var staat = {};          // { itemId: aantal }
  var regio = 'buiten';    // 'buiten' | 'randstad'
  var onvoorzien = D.opslagen.onvoorzien.standaard;
  var vergunning = false;

  /* ---------- rekenen ---------- */

  function itemZoek(id) {
    for (var g = 0; g < D.groepen.length; g++) {
      for (var i = 0; i < D.groepen[g].items.length; i++) {
        if (D.groepen[g].items[i].id === id) return D.groepen[g].items[i];
      }
    }
    return null;
  }

  function regels() {
    var uit = [];
    Object.keys(staat).forEach(function (id) {
      var n = Number(staat[id]);
      if (!(n > 0)) return;
      var it = itemZoek(id);
      if (!it) return;
      uit.push({ item: it, aantal: n, lo: it.lo * n, hi: it.hi * n });
    });
    return uit;
  }

  function totalen() {
    var rs = regels();
    var werk = rs.reduce(function (a, r) { return { lo: a.lo + r.lo, hi: a.hi + r.hi }; }, { lo: 0, hi: 0 });

    var opRegio = { lo: 0, hi: 0 };
    if (regio === 'randstad') {
      opRegio.lo = werk.lo * D.opslagen.randstad.lo;
      opRegio.hi = werk.hi * D.opslagen.randstad.hi;
    }
    var bouwsom = { lo: werk.lo + opRegio.lo, hi: werk.hi + opRegio.hi };

    var opOnvoorzien = { lo: bouwsom.lo * onvoorzien, hi: bouwsom.hi * onvoorzien };

    var opLeges = { lo: 0, hi: 0 };
    if (vergunning) {
      opLeges.lo = bouwsom.lo * D.opslagen.leges.lo;
      opLeges.hi = bouwsom.hi * D.opslagen.leges.hi;
    }

    return {
      regels: rs, werk: werk, regio: opRegio, bouwsom: bouwsom,
      onvoorzien: opOnvoorzien, leges: opLeges,
      totaal: { lo: bouwsom.lo + opOnvoorzien.lo + opLeges.lo,
                hi: bouwsom.hi + opOnvoorzien.hi + opLeges.hi }
    };
  }

  /* ---------- opbouw van het formulier ---------- */

  function bouwGroepen(doel) {
    doel.innerHTML = D.groepen.map(function (g) {
      var rijen = g.items.map(function (it) {
        var bron = D.bronnen[it.bron] || {};
        return '' +
          '<div class="vk-rij" data-item="' + it.id + '">' +
            '<div class="vk-rij__naam">' +
              '<label for="vk-' + it.id + '">' + esc(it.naam) + '</label>' +
              (it.noot ? '<p class="vk-rij__noot">' + esc(it.noot) + '</p>' : '') +
              (it.link ? '<a class="vk-rij__link" href="' + esc(it.link) + '">' + esc(it.linkTekst || 'Bekijk') + ' <span aria-hidden="true">&rarr;</span></a>' : '') +
            '</div>' +
            '<div class="vk-rij__prijs">' +
              '<span class="vk-rij__eenheidprijs">' + euro(it.lo) + '–' + new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(it.hi) +
                '<em>per ' + (it.eenheid === 'st' ? 'stuk' : EENHEID[it.eenheid]) + '</em></span>' +
              '<span class="vk-rij__bron" title="' + esc(bron.naam || '') + '">' + esc(it.bron === 'eigen' ? 'eigen prijs' : 'richtprijs') + '</span>' +
            '</div>' +
            '<div class="vk-rij__invoer">' +
              '<input type="number" id="vk-' + it.id + '" min="0" step="' + (it.stap || 1) + '" inputmode="decimal" placeholder="0" aria-label="Aantal ' + esc(it.naam) + '">' +
              '<span class="vk-rij__eenheid">' + EENHEID[it.eenheid] + '</span>' +
            '</div>' +
            '<div class="vk-rij__som" id="vk-som-' + it.id + '" aria-live="off">&ndash;</div>' +
          '</div>';
      }).join('');
      return '' +
        '<section class="vk-groep" id="groep-' + g.id + '">' +
          '<header class="vk-groep__kop">' +
            '<h3>' + esc(g.naam) + '</h3>' +
            '<p>' + esc(g.uitleg) + '</p>' +
            '<span class="vk-groep__som" id="vk-groepsom-' + g.id + '"></span>' +
          '</header>' +
          '<div class="vk-rijen">' + rijen + '</div>' +
        '</section>';
    }).join('');

    doel.addEventListener('input', function (e) {
      var inp = e.target;
      if (inp.tagName !== 'INPUT' || inp.type !== 'number') return;
      var id = inp.id.replace(/^vk-/, '');
      var n = Number(String(inp.value).replace(',', '.'));
      if (n > 0) staat[id] = n; else delete staat[id];
      inp.closest('.vk-rij').classList.toggle('is-aan', n > 0);
      ververs();
      bewaar();
    });
  }

  /* ---------- weergave ---------- */

  function ververs() {
    var t = totalen();

    D.groepen.forEach(function (g) {
      var lo = 0, hi = 0, aantal = 0;
      g.items.forEach(function (it) {
        var n = Number(staat[it.id]) || 0;
        var som = document.getElementById('vk-som-' + it.id);
        if (som) som.innerHTML = n > 0 ? bereik(it.lo * n, it.hi * n) : '&ndash;';
        if (n > 0) { lo += it.lo * n; hi += it.hi * n; aantal++; }
      });
      var gs = document.getElementById('vk-groepsom-' + g.id);
      if (gs) gs.textContent = aantal ? bereik(lo, hi) : '';
    });

    var leeg = t.regels.length === 0;
    document.getElementById('vkLeeg').hidden = !leeg;
    document.getElementById('vkUitkomst').hidden = leeg;

    zet('vkWerk', bereik(t.werk.lo, t.werk.hi));
    zet('vkTotaal', leeg ? '–' : bereik(t.totaal.lo, t.totaal.hi));
    zet('vkAantalPosten', t.regels.length + (t.regels.length === 1 ? ' post gekozen' : ' posten gekozen'));

    var rijRegio = document.getElementById('vkRijRegio');
    rijRegio.hidden = regio !== 'randstad';
    if (regio === 'randstad') zet('vkRegio', '+ ' + bereik(t.regio.lo, t.regio.hi));

    var rijOnv = document.getElementById('vkRijOnvoorzien');
    rijOnv.hidden = !(onvoorzien > 0);
    if (onvoorzien > 0) zet('vkOnvoorzien', '+ ' + bereik(t.onvoorzien.lo, t.onvoorzien.hi));

    var rijLeges = document.getElementById('vkRijLeges');
    rijLeges.hidden = !vergunning;
    if (vergunning) zet('vkLeges', '+ ' + bereik(t.leges.lo, t.leges.hi));

    document.getElementById('vkOverzichtBtn').disabled = leeg;
  }

  function zet(id, tekst) { var el = document.getElementById(id); if (el) el.textContent = tekst; }

  /* ---------- bewaren zodat een halve invoer niet verloren gaat ---------- */

  function bewaar() {
    try {
      localStorage.setItem(BEWAARSLEUTEL, JSON.stringify({
        staat: staat, regio: regio, onvoorzien: onvoorzien, vergunning: vergunning
      }));
    } catch (e) { /* privémodus: dan zonder bewaren */ }
  }

  function laad() {
    try {
      var d = JSON.parse(localStorage.getItem(BEWAARSLEUTEL) || 'null');
      if (!d) return;
      staat = d.staat || {};
      regio = d.regio || 'buiten';
      onvoorzien = typeof d.onvoorzien === 'number' ? d.onvoorzien : D.opslagen.onvoorzien.standaard;
      vergunning = !!d.vergunning;
      Object.keys(staat).forEach(function (id) {
        var inp = document.getElementById('vk-' + id);
        if (inp) {
          inp.value = staat[id];
          inp.closest('.vk-rij').classList.add('is-aan');
        }
      });
      var r = document.getElementById('vkRegioKeuze'); if (r) r.value = regio;
      var o = document.getElementById('vkOnvoorzienKeuze'); if (o) o.value = String(onvoorzien);
      var v = document.getElementById('vkVergunning'); if (v) v.checked = vergunning;
    } catch (e) { /* stuk of oud formaat: dan blanco beginnen */ }
  }

  function wis() {
    staat = {};
    document.querySelectorAll('.vk-rij input[type=number]').forEach(function (inp) { inp.value = ''; });
    document.querySelectorAll('.vk-rij').forEach(function (r) { r.classList.remove('is-aan'); });
    ververs();
    bewaar();
  }

  /* ---------- het kostenoverzicht om af te drukken ---------- */

  function overzichtHtml() {
    var t = totalen();
    var datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

    var perGroep = D.groepen.map(function (g) {
      var rs = t.regels.filter(function (r) { return g.items.indexOf(r.item) > -1; });
      if (!rs.length) return '';
      var lo = 0, hi = 0;
      var rijen = rs.map(function (r) {
        lo += r.lo; hi += r.hi;
        var eh = r.item.eenheid === 'st' ? (r.aantal === 1 ? 'stuk' : 'stuks') : EENHEID[r.item.eenheid];
        return '<tr><td>' + esc(r.item.naam) + '</td>' +
          '<td class="nr">' + String(r.aantal).replace('.', ',') + ' ' + eh + '</td>' +
          '<td class="nr klein">' + euro(r.item.lo) + '–' + euro(r.item.hi) + '</td>' +
          '<td class="nr sterk">' + bereik(r.lo, r.hi) + '</td></tr>';
      }).join('');
      return '<tbody class="groep"><tr class="groepkop"><th colspan="3">' + esc(g.naam) + '</th>' +
        '<th class="nr">' + bereik(lo, hi) + '</th></tr>' + rijen + '</tbody>';
    }).join('');

    var opslagRijen = '';
    if (regio === 'randstad') {
      opslagRijen += '<tr><td>Regio-opslag Randstad</td><td class="nr">20–30%</td><td></td>' +
        '<td class="nr sterk">+ ' + bereik(t.regio.lo, t.regio.hi) + '</td></tr>';
    }
    if (onvoorzien > 0) {
      opslagRijen += '<tr><td>Post onvoorzien</td><td class="nr">' + Math.round(onvoorzien * 100) + '%</td><td></td>' +
        '<td class="nr sterk">+ ' + bereik(t.onvoorzien.lo, t.onvoorzien.hi) + '</td></tr>';
    }
    if (vergunning) {
      opslagRijen += '<tr><td>Leges omgevingsvergunning</td><td class="nr">0,9–8,4%</td><td></td>' +
        '<td class="nr sterk">+ ' + bereik(t.leges.lo, t.leges.hi) + '</td></tr>';
    }

    var gebruikteBronnen = {};
    t.regels.forEach(function (r) { gebruikteBronnen[r.item.bron] = true; });
    var bronLijst = Object.keys(gebruikteBronnen).map(function (k) {
      var b = D.bronnen[k] || {};
      return '<li>' + esc(b.naam || k) + (b.url ? ': <span class="url">' + esc(b.url) + '</span>' : '') + '</li>';
    }).join('');

    var voorbehoud = [
      'Dit overzicht is een indicatie op basis van landelijke kostenoverzichten, geen offerte en geen aanbod van Next Growth.',
      'De bedragen zijn richtprijzen inclusief btw en inclusief arbeid. Voor schilderen, stukadoren, behangen en het aanbrengen van isolatie geldt bij woningen ouder dan twee jaar het verlaagde tarief van 9%; isolatiemateriaal zelf blijft 21%.',
      'Wat de calculator niet kan weten, zit niet in het bedrag: de staat van je woning, de fundering, verborgen gebreken, asbest dat pas bij de sloop tevoorschijn komt, en de bereikbaarheid van de werkplek.',
      'Steigerwerk, tijdelijke huisvesting, verhuizen en opslag, en het herstel van tuin of bestrating zitten niet in dit overzicht.',
      'De post onvoorzien is een vuistregel uit de bouw, geen bronprijs. Bij woningen van voor 1970 is de bovenkant van dat percentage realistischer dan de onderkant.',
      'Leges verschillen sterk per gemeente. Kijk voor je eigen gemeente in de legesverordening; dit overzicht rekent met de landelijke spreiding.'
    ].map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('');

    return '<!doctype html><html lang="nl"><head><meta charset="utf-8">' +
      '<title>Kostenindicatie verbouwing</title><style>' +
      'body{margin:0;background:#333;font-family:Arial,Helvetica,sans-serif;color:#111}' +
      'header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}' +
      'header b{font-size:14px}header span{font-size:11px;color:#e8b04b}' +
      'button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}' +
      '.blad{width:min(96vw,900px);margin:22px auto;background:#fff;padding:44px 48px 38px;box-shadow:0 8px 28px #0008}' +
      '.kop{display:flex;justify-content:space-between;align-items:flex-start;gap:2rem;border-bottom:2px solid #111;padding-bottom:14px}' +
      '.kop h1{font-size:22px;margin:0 0 6px}.kop p{margin:0;font-size:12px;color:#555}' +
      '.stempel{font-size:11px;font-weight:800;color:#a32323;letter-spacing:.4px;white-space:nowrap;text-align:right}' +
      '.stempel em{display:block;font-style:normal;font-weight:400;color:#555;margin-top:4px;letter-spacing:0}' +
      'table{width:100%;border-collapse:collapse;margin-top:22px}' +
      'th,td{text-align:left;padding:7px 8px;font-size:12.5px;vertical-align:top}' +
      '.nr{text-align:right;white-space:nowrap}.klein{color:#666;font-size:11px}.sterk{font-weight:700}' +
      '.groepkop th{background:#f3f0e9;border-top:1px solid #ccc;border-bottom:1px solid #ccc;font-size:12px;letter-spacing:.4px;text-transform:uppercase}' +
      'tbody.groep tr:not(.groepkop) td{border-bottom:1px solid #eee}' +
      '.opslagen td{border-bottom:1px solid #eee}' +
      '.totaal{border-top:2px solid #111}.totaal td{padding-top:14px;font-size:16px;font-weight:800}' +
      'h2{font-size:13px;letter-spacing:.5px;text-transform:uppercase;margin:30px 0 8px;border-bottom:1px solid #ccc;padding-bottom:5px}' +
      'ul{margin:0;padding-left:18px}li{font-size:11.5px;line-height:1.55;margin:4px 0;color:#333}' +
      '.url{color:#666;font-size:10.5px}' +
      '.voet{margin-top:26px;padding-top:12px;border-top:1px solid #ccc;font-size:11px;color:#555;line-height:1.55}' +
      '@media print{header{display:none}body{background:#fff}.blad{width:100%;margin:0;padding:16mm;box-shadow:none}}' +
      '@page{size:A4 portrait;margin:0}' +
      '</style></head><body>' +
      '<header><b>Kostenindicatie verbouwing</b><span>INDICATIE OP LANDELIJKE RICHTPRIJZEN, GEEN OFFERTE</span>' +
      '<button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' +
      '<div class="blad">' +
        '<div class="kop"><div><h1>Kostenindicatie verbouwing</h1>' +
          '<p>Opgesteld op ' + esc(datum) + ' · ' + t.regels.length + ' posten · ' +
          (regio === 'randstad' ? 'Randstad' : 'buiten de Randstad') + '</p></div>' +
          '<div class="stempel">INDICATIE, GEEN OFFERTE<em>Demo van Next Growth · nextgrowthdigital.nl</em></div></div>' +
        '<table>' + perGroep +
          '<tbody class="opslagen"><tr class="groepkop"><th colspan="2">Opslagen</th>' +
            '<th colspan="2" class="nr">Subtotaal werkzaamheden ' + bereik(t.werk.lo, t.werk.hi) + '</th></tr>' +
            (opslagRijen || '<tr><td colspan="4" class="klein">Geen opslagen gekozen.</td></tr>') +
          '</tbody>' +
          '<tbody><tr class="totaal"><td colspan="3">Totale bandbreedte</td>' +
            '<td class="nr">' + bereik(t.totaal.lo, t.totaal.hi) + '</td></tr></tbody>' +
        '</table>' +
        '<h2>Waar deze bedragen vandaan komen</h2><ul>' + bronLijst +
          '<li>Prijspeil bijgewerkt op ' + esc(D.bijgewerkt) + '.</li></ul>' +
        '<h2>Voorbehouden</h2><ul>' + voorbehoud + '</ul>' +
        '<p class="voet">Dit overzicht helpt je een budget bepalen en offertes beoordelen. Het is geen aanbod en er kunnen geen rechten aan worden ontleend. ' +
        'Wil je een preciezere prijs voor een uitbouw, dakopbouw, badkamer of de balkberekening voor de doorbraak? Stel het onderdeel dan samen in een configurator. Deze calculator is een demo die Next Growth bouwt voor bouwbedrijven: nextgrowthdigital.nl.</p>' +
      '</div></body></html>';
  }

  function openOverzicht() {
    NGAfdruk.toon(overzichtHtml(), 'ng-verbouwkosten', 'Kostenindicatie verbouwing');
  }

  /* ---------- start ---------- */

  function init() {
    var doel = document.getElementById('vkGroepen');
    if (!doel || !D) return;
    bouwGroepen(doel);

    document.getElementById('vkRegioKeuze').addEventListener('change', function () {
      regio = this.value; ververs(); bewaar();
    });
    document.getElementById('vkOnvoorzienKeuze').addEventListener('change', function () {
      onvoorzien = Number(this.value); ververs(); bewaar();
    });
    document.getElementById('vkVergunning').addEventListener('change', function () {
      vergunning = this.checked; ververs(); bewaar();
    });
    document.getElementById('vkOverzichtBtn').addEventListener('click', openOverzicht);
    document.getElementById('vkWisBtn').addEventListener('click', wis);

    laad();
    ververs();
  }

  global.NGVerbouwkosten = { init: init, totalen: totalen, overzichtHtml: overzichtHtml,
                             _staat: function () { return staat; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
