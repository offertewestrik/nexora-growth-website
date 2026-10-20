/* Het tekenprogramma zoals de bezoeker het gebruikt: tabbladen, een doek en
 * een afdrukknop.
 *
 * De tekeningen zelf komen uit bouwaanzichten.js; dit bestand is alleen de
 * bediening eromheen. Die scheiding is met opzet: de aanzichten moeten los
 * te testen zijn zonder browser, en het paneel moet te verplaatsen zijn
 * zonder dat er een maatlijn verschuift.
 *
 * WAAROM DIT NAAST DE FOTO STAAT EN NIET IN PLAATS DAARVAN
 * De sfeerfoto verkoopt, de tekening overtuigt. Een koper die twijfelt
 * tussen vier en vijf meter heeft niets aan een foto van een uitbouw die
 * geen van beide is; hij heeft een plattegrond nodig waar zijn eettafel in
 * staat. Dus blijft de foto boven staan en komt het tekenprogramma eronder,
 * met dezelfde configuratie als bron.
 *
 * AANSLUITEN OP EEN CONFIGURATOR — drie dingen:
 *   1. de drie scripts laden (bouwkundig-*, bouwaanzichten, tekenprogramma)
 *   2. een leeg element neerzetten met id="tekenprogramma"
 *   3. na elke render van de configurator NGTekenprogramma.ververs() aanroepen
 * De rest — welke bladen er zijn, hoe ze heten, wat er onder staat — volgt
 * uit de configuratie en hoeft nergens herhaald te worden.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var staat = { el: null, blad: 'voor', gemount: false, laatste: null, opties: {} };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function css() {
    if (!doc || doc.getElementById('ngTekenCss')) return;
    var s = doc.createElement('style');
    s.id = 'ngTekenCss';
    s.textContent =
      '.ngtk{--tk-lijn:#E2DED4;--tk-tekst:#26251F;--tk-zacht:#75716A;--tk-accent:#C8A24A;' +
      'background:#fff;border:1px solid var(--tk-lijn);border-radius:16px;overflow:hidden;color:var(--tk-tekst)}' +
      '.ngtk__kop{display:flex;flex-wrap:wrap;gap:.8rem;align-items:baseline;justify-content:space-between;' +
      'padding:1rem 1.2rem .6rem}' +
      // De kop erfde de paginatekstkleur niet: core.css zet h1 t/m h3 rechtstreeks op
      // var(--text), en een directe regel wint van overerving. Op de donkere
      // configuratorpagina's is dat #F7F8F9, en dat is wit op het witte paneel van
      // deze widget: 1,06:1, oftewel onleesbaar. Daarom hier expliciet.
      '.ngtk__kop h2{margin:0;font-size:1.05rem;letter-spacing:-.01em;color:var(--tk-tekst)}' +
      '.ngtk__kop p{margin:.15rem 0 0;font-size:.76rem;color:var(--tk-zacht)}' +
      '.ngtk__tabs{display:flex;gap:.3rem;flex-wrap:wrap;padding:0 1.2rem .8rem}' +
      '.ngtk__tab{border:1px solid var(--tk-lijn);background:#fff;color:var(--tk-zacht);border-radius:999px;' +
      'padding:.42rem .82rem;font:inherit;font-size:.76rem;font-weight:600;cursor:pointer;line-height:1}' +
      '.ngtk__tab:hover{border-color:var(--tk-accent);color:var(--tk-tekst)}' +
      '.ngtk__tab[aria-selected="true"]{background:#26251F;border-color:#26251F;color:#fff}' +
      '.ngtk__doek{background:#FBFAF7;border-top:1px solid var(--tk-lijn);border-bottom:1px solid var(--tk-lijn);' +
      'padding:.6rem;position:relative}' +
      '.ngtk__doek svg{display:block;width:100%;height:auto}' +
      '.ngtk__voet{display:flex;flex-wrap:wrap;gap:.9rem;align-items:flex-start;justify-content:space-between;padding:.85rem 1.2rem 1rem}' +
      '.ngtk__noot{margin:0;font-size:.76rem;line-height:1.55;color:var(--tk-zacht);max-width:64ch}' +
      '.ngtk__knoppen{display:flex;gap:.45rem;flex-wrap:wrap}' +
      '.ngtk__knop{border:1px solid var(--tk-lijn);background:#fff;border-radius:9px;padding:.5rem .8rem;' +
      'font:inherit;font-size:.74rem;font-weight:700;cursor:pointer;color:var(--tk-tekst)}' +
      '.ngtk__knop:hover{border-color:var(--tk-accent)}' +
      '.ngtk__vol{position:fixed;inset:0;z-index:99998;background:#0B0B0Bef;display:grid;place-items:center;padding:2vmin}' +
      '.ngtk__volkaart{background:#FBFAF7;border-radius:14px;width:min(1500px,96vw);max-height:94vh;overflow:auto;padding:1rem}' +
      /* Gedraaid: de kaart krijgt de hóógte van het scherm als breedte. */
      /* Gedraaid wordt de hóógte van de kaart zijn breedte op het scherm. Die
         hoogte volgt uit de bladverhouding (660/1200), dus de breedte mag
         hoogstens 155vw zijn — anders steekt hij er na het draaien links en
         rechts uit en valt de helft van de tekening weg. */
      /* Vast gepositioneerd en niet door het raster gecentreerd: de kaart is
         vóór het draaien breder dan het scherm, en een rasteritem dat niet
         past valt terug op links uitlijnen. Na de draai stak daardoor de
         rechterhelft van de tekening buiten beeld. */
      '.ngtk__volkaart--dwars{position:fixed;left:50%;top:50%;' +
      'transform:translate(-50%,-50%) rotate(90deg);transform-origin:center;' +
      'width:min(92vh,155vw);max-height:none;max-width:none;padding:.6rem}' +
      '.ngtk__voldraai{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);margin:0;' +
      'color:#fff;font:600 .72rem/1.4 Inter,Arial,sans-serif;text-align:center;max-width:88vw;opacity:.85}' +
      '.ngtk__volsluit{position:absolute;top:2vmin;right:2vmin;border:0;background:#fff;width:42px;height:42px;' +
      'border-radius:50%;font-size:22px;cursor:pointer}' +
      '@media (max-width:640px){.ngtk__tab{font-size:.7rem;padding:.36rem .62rem}}' +
      '@media print{.ngtk__tabs,.ngtk__knoppen{display:none}}';
    doc.head.appendChild(s);
  }

  /* De configuratie ophalen zoals de pagina hem heeft. Ontbreekt er een
     schakel — de bouwkundige kern is niet geladen, of de configurator staat
     nog niet — dan tekent het programma niets in plaats van iets met nullen
     erin. */
  /* Welke tekenmotor. Een overkapping is geen gesloten geïsoleerd gebouw: hij
     heeft geen wanden, geen Rc en wél een zadeldak. Die met dezelfde motor
     tekenen zou een tekening opleveren van iets dat niet besteld is, dus mag
     een pagina zijn eigen motor aanwijzen. */
  function motor() { return global.NGTekenMotor || global.NGBouwAanzichten; }

  /* En welke bron. De meeste configurators leggen hun keuzes in NGKeuze neer
     in precies de vorm die de motor wil. De tuinconfigurators niet — die
     werken met keuzegroepen — dus mogen ze een vertaling neerzetten. NGKeuze
     zelf blijft ongemoeid, want de AI-foto leest daar ook uit. */
  function huidig() {
    var cfg = typeof global.NGTekenBron === 'function' ? global.NGTekenBron()
            : (typeof global.NGKeuze === 'function' ? global.NGKeuze() : null);
    if (!cfg || !motor()) return null;
    var m = global.NGBouwkundig ? global.NGBouwkundig.model(cfg) : {};
    return { cfg: cfg, m: m };
  }

  function tabsHtml(D) {
    return motor().bladen(D).map(function (bl) {
      var aan = bl.v === staat.blad;
      return '<button type="button" class="ngtk__tab" role="tab" data-blad="' + bl.v + '" ' +
        'id="ngtk-tab-' + bl.v + '" aria-controls="ngtk-doek" aria-selected="' + (aan ? 'true' : 'false') + '"' +
        (aan ? '' : ' tabindex="-1"') + '>' + esc(bl.l) + '</button>';
    }).join('');
  }

  function skelet() {
    staat.el.className = (staat.el.className ? staat.el.className + ' ' : '') + 'ngtk';
    staat.el.innerHTML =
      '<div class="ngtk__kop"><div><h2 id="ngtk-titel"></h2><p id="ngtk-sub"></p></div></div>' +
      '<div class="ngtk__tabs" role="tablist" aria-label="Tekening kiezen" id="ngtk-tabs"></div>' +
      '<div class="ngtk__doek" id="ngtk-doek" role="tabpanel" tabindex="0"></div>' +
      '<div class="ngtk__voet"><p class="ngtk__noot" id="ngtk-noot"></p>' +
      '<div class="ngtk__knoppen">' +
      '<button type="button" class="ngtk__knop" data-tk="bewerk" hidden aria-pressed="false">Zelf indelen</button>' +
      '<button type="button" class="ngtk__knop" data-tk="vol">Volledig scherm</button>' +
      '<button type="button" class="ngtk__knop" data-tk="afdruk">Alle bladen afdrukken</button>' +
      '<button type="button" class="ngtk__knop" data-tk="svg">Deze tekening downloaden</button>' +
      '</div></div>';

    staat.el.addEventListener('click', function (e) {
      var tab = e.target.closest ? e.target.closest('.ngtk__tab') : null;
      if (tab) { staat.blad = tab.getAttribute('data-blad'); tekenNu(); return; }
      var knop = e.target.closest ? e.target.closest('.ngtk__knop') : null;
      if (!knop) return;
      var wat = knop.getAttribute('data-tk');
      if (wat === 'bewerk') {
        if (!global.NGTekenbewerker) return;
        var aan = global.NGTekenbewerker.aan();
        knop.setAttribute('aria-pressed', aan ? 'true' : 'false');
        knop.textContent = aan ? 'Klaar met indelen' : 'Zelf indelen';
      }
      else if (wat === 'vol') volledig();
      else if (wat === 'afdruk') afdrukken();
      else if (wat === 'svg') download();
    });
    /* Pijltjestoetsen door de tabbladen, zoals een tablist hoort te werken.
       Zonder dit is het paneel met het toetsenbord alleen met tab-tab-tab te
       bedienen en slaat een schermlezer de helft over. */
    staat.el.addEventListener('keydown', function (e) {
      if (!e.target.classList || !e.target.classList.contains('ngtk__tab')) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      var lijst = [].slice.call(staat.el.querySelectorAll('.ngtk__tab'));
      var i = lijst.indexOf(e.target);
      var n = e.key === 'Home' ? 0 : e.key === 'End' ? lijst.length - 1
            : e.key === 'ArrowRight' ? (i + 1) % lijst.length : (i - 1 + lijst.length) % lijst.length;
      staat.blad = lijst[n].getAttribute('data-blad');
      tekenNu();
      var nieuw = staat.el.querySelector('#ngtk-tab-' + staat.blad);
      if (nieuw) nieuw.focus();
    });
  }

  /* De maatschuiven vuren tijdens het slepen tientallen keren per seconde.
     Acht tekeningen per beweging opbouwen zou zonde zijn, dus wordt er per
     beeldopbouw hoogstens één keer getekend. Dat is geen vertraging: de
     browser tekent toch niet vaker dan dat. */
  var gepland = false;
  function ververs() {
    if (!staat.el || gepland) return;
    gepland = true;
    var straks = global.requestAnimationFrame || function (fn) { return global.setTimeout(fn, 16); };
    straks(function () { gepland = false; tekenNu(); });
  }

  function tekenNu() {
    if (!staat.el || !motor()) return;
    var h = huidig();
    var doek = staat.el.querySelector('#ngtk-doek');
    if (!doek) return;
    if (!h) {
      doek.innerHTML = '<p class="ngtk__noot">De configuratie is nog niet geladen, dus er valt nog niets te tekenen.</p>';
      return;
    }
    var D = motor().lees(h.cfg, h.m);
    /* Het blad "Doorbraak" bestaat alleen bij een aangebouwd deel; wisselt de
       bezoeker naar een vrijstaande woning terwijl hij daar staat, dan heet
       hetzelfde blad daar Achteraanzicht en blijft hij dus gewoon staan.
       Bestaat het gekozen blad in deze motor helemaal niet, dan valt teken()
       terug op het eerste — dat gebeurt bij een tuinbouwwerk, dat er zeven
       heeft in plaats van tien. */
    var r = motor().teken(staat.blad, D);
    if (r.v !== staat.blad) staat.blad = r.v;
    staat.laatste = r;
    staat.el.querySelector('#ngtk-tabs').innerHTML = tabsHtml(D);
    doek.innerHTML = r.svg;
    doek.setAttribute('aria-labelledby', 'ngtk-tab-' + r.v);
    var titelEl = staat.el.querySelector('#ngtk-titel');
    var subEl = staat.el.querySelector('#ngtk-sub');
    if (titelEl) titelEl.textContent = 'Tekenprogramma: ' + D.typeNaam;
    if (subEl) {
      subEl.textContent = 'Alle bladen worden getekend uit jouw maten en keuzes. ' +
        'Voorontwerp op verkoopniveau, geen uitvoeringstekening.';
    }
    var nootEl = staat.el.querySelector('#ngtk-noot');
    if (nootEl) nootEl.textContent = r.noot || '';

    /* De bewerker mag alleen op de plattegrond: op een gevelaanzicht heeft
       "sleep de bank" geen betekenis. De knop verdwijnt daar dus, en de
       bewerker zet zichzelf uit. */
    var bewerkKnop = staat.el.querySelector('[data-tk="bewerk"]');
    if (bewerkKnop) {
      var mag = r.v === 'plattegrond' && !!global.NGTekenbewerker;
      bewerkKnop.hidden = !mag;
      var actief = mag && global.NGTekenbewerker.actief();
      bewerkKnop.setAttribute('aria-pressed', actief ? 'true' : 'false');
      bewerkKnop.textContent = actief ? 'Klaar met indelen' : 'Zelf indelen';
    }
    if (global.NGTekenbewerker) global.NGTekenbewerker.na(doek, r);
  }

  /* --------------------------------------------------------------- extra --- */

  function volledig() {
    if (!staat.laatste) return;
    var laag = doc.createElement('div');
    laag.className = 'ngtk__vol';
    /* Een blad is 1200 bij 660: liggend. Op een telefoon in portret is dat
       390 px breed en dus 215 hoog — de maatcijfers zijn dan niet te lezen en
       "volledig scherm" levert niets op. Een kwartslag draaien maakt van 390 ×
       844 een tekenvlak van 844 × 390, en dat is meer dan twee keer zo groot.
       Alleen wanneer het werkelijk helpt: op een breed scherm blijft hij staan
       zoals hij hoort. */
    var draai = global.innerWidth < 700 && global.innerHeight > global.innerWidth * 1.2;
    laag.innerHTML = '<button type="button" class="ngtk__volsluit" aria-label="Sluiten">×</button>' +
      '<div class="ngtk__volkaart' + (draai ? ' ngtk__volkaart--dwars' : '') + '">' +
      staat.laatste.svg + '</div>' +
      (draai ? '<p class="ngtk__voldraai">Een kwartslag gedraaid, zodat de maten leesbaar blijven. ' +
               'Draai je telefoon voor dezelfde stand.</p>' : '');
    function weg() { laag.remove(); doc.removeEventListener('keydown', ontsnap); }
    function ontsnap(e) { if (e.key === 'Escape') weg(); }
    laag.addEventListener('click', function (e) {
      if (e.target === laag || (e.target.classList && e.target.classList.contains('ngtk__volsluit'))) weg();
    });
    doc.addEventListener('keydown', ontsnap);
    doc.body.appendChild(laag);
  }

  /* Alle acht bladen achter elkaar in een afdrukvenster: één blad per pagina,
     A3 liggend, met de noot eronder. Dat is het pakket dat een bezoeker aan
     zijn aannemer laat zien. */
  function afdrukHtml() {
    var h = huidig();
    if (!h) return null;
    var D = motor().lees(h.cfg, h.m);
    var bladen = motor().alle(h.cfg, h.m);
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8">' +
      '<title>Tekeningen ' + esc(D.typeNaam) + '</title><style>' +
      'body{margin:0;background:#EFEDE7;font-family:Arial,Helvetica,sans-serif}' +
      '.blad{width:min(96vw,1180px);margin:20px auto;background:#fff;box-shadow:0 6px 24px #0002;padding:14px}' +
      '.blad svg{display:block;width:100%;height:auto}' +
      '.blad p{font-size:12px;line-height:1.55;color:#55524B;margin:10px 4px 2px}' +
      'header{background:#1B1B1B;color:#fff;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px}' +
      'header b{font-size:14px}header span{font-size:11px;color:#C8A24A}' +
      'button{background:#C8A24A;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}' +
      '@media print{header{display:none}body{background:#fff}.blad{width:100%;margin:0;box-shadow:none;page-break-after:always}' +
      '.blad:last-child{page-break-after:auto}}@page{size:A3 landscape;margin:8mm}' +
      '</style></head><body><header><b>' + esc(D.typeNaam) + ' · ' + esc(D.w.toFixed(2).replace('.', ',')) +
      ' × ' + esc(D.dp.toFixed(2).replace('.', ',')) + ' m</b>' +
      '<span>VOORONTWERP · maten ter plaatse controleren vóór productie</span>' +
      '<button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' +
      bladen.map(function (bl) {
        return '<div class="blad">' + bl.svg + '<p>' + esc(bl.titel) + ': ' + esc(bl.noot) + '</p></div>';
      }).join('') + '</body></html>';
  }

  function afdrukken() {
    var html = afdrukHtml();
    if (!html) return;
    if (global.NGAfdruk && global.NGAfdruk.toon) global.NGAfdruk.toon(html, 'ng-tekeningen', 'Tekeningen');
    else {
      var w = global.open('', 'ng-tekeningen');
      if (w) { w.document.write(html); w.document.close(); }
    }
  }

  /* De tekening als los SVG-bestand. Een SVG en geen PNG: hij is vectorieel,
     dus een aannemer kan hem op elk formaat afdrukken zonder dat de
     maatcijfers vervagen. */
  function download() {
    if (!staat.laatste) return;
    var h = huidig();
    var naam = 'tekening-' + (h ? (h.cfg.type || h.cfg.product || 'bouw') : 'bouw') + '-' + staat.laatste.v + '.svg';
    var blob = new global.Blob([staat.laatste.svg], { type: 'image/svg+xml' });
    var url = global.URL.createObjectURL(blob);
    var a = doc.createElement('a');
    a.href = url; a.download = naam;
    doc.body.appendChild(a); a.click(); a.remove();
    global.setTimeout(function () { global.URL.revokeObjectURL(url); }, 4000);
  }

  function mount(el, opties) {
    if (!doc) return;
    staat.el = typeof el === 'string' ? doc.getElementById(el) : el;
    if (!staat.el) return;
    staat.opties = opties || {};
    if (staat.opties.blad) staat.blad = staat.opties.blad;
    css();
    skelet();
    staat.gemount = true;
    tekenNu();
  }

  global.NGTekenprogramma = {
    mount: mount, ververs: ververs, afdrukken: afdrukken, afdrukHtml: afdrukHtml,
    blad: function (v) { if (v) { staat.blad = v; tekenNu(); } return staat.blad; },
    staat: function () { return { blad: staat.blad, gemount: staat.gemount }; }
  };

  /* Zelf aanhaken zodra de pagina er is: staat er een element met
     id="tekenprogramma", dan hoeft de configurator er niets voor te doen
     behalve ververs() aanroepen als er iets verandert. */
  if (doc) {
    var start = function () {
      var el = doc.getElementById('tekenprogramma');
      if (el && !staat.gemount) mount(el);
    };
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(typeof window !== 'undefined' ? window : globalThis);
