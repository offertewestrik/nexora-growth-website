/* Zelf indelen: meubels verslepen, ramen en deuren in de gevel zetten.
 *
 * WAAROM DIT BESTAAT
 * Het tekenprogramma zet een voorstel neer. Een voorstel is precies goed
 * genoeg om te laten zien dat het kán, en precies niet goed genoeg voor de
 * bezoeker die weet dat zijn bank aan de andere kant staat en dat het raam
 * naar de tuin moet. Die bezoeker gaat anders bellen, of erger: hij gaat weg.
 *
 * WAT HET WEL EN NIET DOET
 * Wel: meubels verplaatsen, draaien in kwartslagen, weghalen en er nieuwe bij
 * zetten uit een palet met Nederlandse standaardmaten; ramen en deuren op een
 * gevelrand zetten, langs die rand verschuiven, breder of smaller maken en
 * weghalen. Alles wat hij neerzet komt in dezelfde lijst waar de plattegrond
 * en de daglichttoets uit lezen — dus de toets verschuift mee.
 *
 * Niet: de plattegrond hertekenen. Wanden verplaatsen is geen tekenwerk maar
 * een constructieve keuze, en een tekenprogramma dat dat laat doen levert
 * plattegronden op die niet gebouwd kunnen worden. Daar is de bestaande
 * indeling-editor voor, die de wanden kent.
 *
 * WAAR HET BLIJFT STAAN
 * Op de configuratie zelf (st.inrichting en st.kozijnen). Dat is dezelfde
 * plek waar de breedte en de gevelkleur staan, dus alles wat die configuratie
 * al meeneemt — de offerte-aanvraag, de afdruk, het overzicht — neemt de
 * indeling vanzelf mee. De pui hoort daar níet bij: die is een productkeuze
 * met een prijs en blijft dus afgeleid uit de keuzelijst.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var SNAP = 0.05;                 // vijf centimeter; fijner is schijnnauwkeurig
  var MUUR = 0.15;                 // binnen deze afstand klikt een meubel tegen de wand

  var S = {
    aan: false, modus: 'kies', sel: null, melding: '',
    doek: null, svg: null, model: null, tf: null, sleep: null, balk: null, kader: null
  };

  function keuze() { return typeof global.NGKeuze === 'function' ? global.NGKeuze() : null; }
  function hertekenen() { if (global.NGTekenprogramma) global.NGTekenprogramma.ververs(); }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function rond(v, stap) { return Math.round(v / stap) * stap; }
  function cm(v) { return String(Math.round(v * 100)); }

  /* ------------------------------------------------------- ongedaan maken --- */

  /* Eén verkeerde Delete was tot nu toe definitief, op "Voorstel terugzetten"
     na — en dat gooit álles weg. Bij iets dat "tekenprogramma" heet verwacht
     iedereen Ctrl+Z, en terecht: zonder durft niemand te experimenteren, en
     experimenteren is precies waar dit voor bedoeld is.

     Bewaard wordt de hele indeling en gevel als momentopname. Dat is een paar
     honderd bytes per stap en het scheelt de hele boekhouding van wat er
     precies veranderd is — die boekhouding is waar dit soort code fout gaat. */
  var HIST_MAX = 40;
  var hist = { terug: [], vooruit: [] };

  function momentopname() {
    var st = keuze();
    if (!st) return null;
    return JSON.stringify({ i: st.inrichting || null, k: st.kozijnen || null });
  }

  /* Vóór elke wijziging aanroepen. De vooruit-stapel wordt leeggegooid: wie na
     een stap terug iets nieuws doet, vertakt de geschiedenis, en dan is
     "opnieuw" niet meer te definiëren. */
  function onthoud() {
    var nu = momentopname();
    if (nu === null) return;
    if (hist.terug.length && hist.terug[hist.terug.length - 1] === nu) return;
    hist.terug.push(nu);
    if (hist.terug.length > HIST_MAX) hist.terug.shift();
    hist.vooruit.length = 0;
  }

  function zetTerug(tekst) {
    var st = keuze();
    if (!st || !tekst) return;
    var q = JSON.parse(tekst);
    st.inrichting = q.i;
    st.kozijnen = q.k;
    S.sel = null;
    hertekenen();
  }

  function ongedaan() {
    if (!hist.terug.length) { melding('Er is niets meer om ongedaan te maken.'); return; }
    var nu = momentopname();
    hist.vooruit.push(nu);
    zetTerug(hist.terug.pop());
  }

  function opnieuw() {
    if (!hist.vooruit.length) { melding('Er is niets om opnieuw te doen.'); return; }
    hist.terug.push(momentopname());
    zetTerug(hist.vooruit.pop());
  }

  /* ------------------------------------------------------------- opslag --- */

  /* De eerste bewerking neemt het voorstel over. Daarna is de lijst van de
     bezoeker en wordt er niets meer bij verzonnen; dat is de enige manier
     waarop "ik heb die bank weggehaald" ook betekent dat hij weg blijft. */
  function neemOver() {
    var st = keuze();
    if (!st || !S.model) return null;
    if (!Array.isArray(st.inrichting)) {
      st.inrichting = S.model.meubels.map(function (m) {
        return { id: m.id, soort: m.soort, x: m.x, y: m.y, b: m.b, d: m.d,
                 rot: m.rot || 0, opt: m.opt || {}, ruimte: m.ruimte || '' };
      });
    }
    if (!Array.isArray(st.kozijnen)) {
      st.kozijnen = S.model.kozijnen.filter(function (k) { return k.soort !== 'pui'; })
        .map(function (k) {
          return { code: k.code, soort: k.soort, edge: k.edge, t: k.t,
                   b: k.b, h: k.h, sill: k.sill };
        });
    }
    return st;
  }

  function herstel() {
    var st = keuze();
    if (!st) return;
    /* Ook terugzetten is een stap: wie per ongeluk op deze knop drukt hoort
       zijn hele indeling met één Ctrl+Z terug te krijgen. */
    onthoud();
    /* Terug naar afgeleid, niet naar leeg: null betekent "nog niets
       aangeraakt" en dan tekent het programma zijn eigen voorstel weer. */
    st.inrichting = null;
    st.kozijnen = null;
    S.sel = null;
    hertekenen();
  }

  function meubelMet(id) {
    var st = keuze();
    if (!st || !Array.isArray(st.inrichting)) return null;
    for (var i = 0; i < st.inrichting.length; i++) if (st.inrichting[i].id === id) return st.inrichting[i];
    return null;
  }
  function kozijnMet(code) {
    var st = keuze();
    if (!st || !Array.isArray(st.kozijnen)) return null;
    for (var i = 0; i < st.kozijnen.length; i++) if (st.kozijnen[i].code === code) return st.kozijnen[i];
    return null;
  }

  function nieuwId(voorvoegsel, bestaat) {
    var n = 1;
    while (bestaat(voorvoegsel + n)) n++;
    return voorvoegsel + n;
  }

  /* ---------------------------------------------------------- meetkunde --- */

  /* Van een muispositie naar meters. De SVG schaalt met de breedte van de
     pagina, dus de omrekening moet via de matrix van het element lopen; een
     vaste factor klopt alleen bij toeval. */
  function naarMeters(e) {
    if (!S.svg || !S.tf) return null;
    var r = S.svg.getBoundingClientRect();
    if (!r.width) return null;
    var f = 1200 / r.width;                       // viewBox-breedte / schermbreedte
    var ux = (e.clientX - r.left) * f, uy = (e.clientY - r.top) * f;
    return { x: (ux - S.tf.x0) / S.tf.s, y: (uy - S.tf.y0) / S.tf.s, ux: ux, uy: uy };
  }

  /* Dezelfde bovengrens als de tekening hanteert: de dakrand min de
     dakopbouw en de latei. Hij wordt hier uit de configuratie herleid en niet
     apart gedefinieerd, want twee sommen voor dezelfde maat lopen uit elkaar. */
  function bovenGrens() {
    var A = global.NGBouwAanzichten, B = global.NGBouwkundig, st = keuze();
    if (!A || !B || !st) return 0;
    try {
      var D = A.lees(st, B.model(st));
      return D.h - Math.max(0.40, (D.dakDikte || 0.28) + 0.12);
    } catch (e) { return 0; }
  }

  function randNr(i) {
    var R = S.model && S.model.randen;
    if (!R) return null;
    for (var k = 0; k < R.length; k++) if (R[k].i === i) return R[k];
    return null;
  }

  /* De dichtstbijzijnde gevelrand bij een punt, met de positie daarlangs. */
  function randBij(x, y) {
    var R = S.model && S.model.randen;
    if (!R) return null;
    var beste = null;
    R.forEach(function (r) {
      if (r.huiszijde) return;
      var dx = r.b[0] - r.a[0], dy = r.b[1] - r.a[1];
      var t = ((x - r.a[0]) * dx + (y - r.a[1]) * dy) / (r.L * r.L);
      t = Math.min(1, Math.max(0, t));
      var qx = r.a[0] + dx * t, qy = r.a[1] + dy * t;
      var d = Math.sqrt((qx - x) * (qx - x) + (qy - y) * (qy - y));
      if (!beste || d < beste.d) beste = { rand: r, t: t, d: d };
    });
    return beste;
  }

  /* Past dit meubel hier? Vier hoeken binnen de omtrek, en niet in het
     trapgat. Er wordt niets kleiner getekend om het passend te maken: past
     het niet, dan gaat het niet, en dan blijft het meubel staan waar het
     stond. */
  function magHier(mb) {
    var V = global.NGBouwvormen, MB = global.NGBouwmeubels;
    if (!V || !S.model) return true;
    var g = MB && MB.beslag ? MB.beslag(mb)
          : { x0: mb.x, y0: mb.y, x1: mb.x + mb.b, y1: mb.y + mb.d };
    var e = 0.02;
    var hoeken = [[g.x0 + e, g.y0 + e], [g.x1 - e, g.y0 + e],
                  [g.x0 + e, g.y1 - e], [g.x1 - e, g.y1 - e]];
    for (var i = 0; i < hoeken.length; i++) {
      if (!V.inPolygoon(S.model.binnen, hoeken[i][0], hoeken[i][1])) return false;
    }
    var gat = S.model.trapgat;
    if (gat && g.x0 < gat.x1 - 0.02 && g.x1 > gat.x0 + 0.02 &&
        g.y0 < gat.y1 - 0.02 && g.y1 > gat.y0 + 0.02) return false;
    if (botstMeubel(mb, g)) return false;
    return true;
  }

  /* Staat hier al iets? Een bank dwars door de eettafel is op een
     verkoopplattegrond geen keuze maar een fout, en de bezoeker ziet hem niet
     omdat de symbolen half doorzichtig ogen.

     Met een marge van vijf centimeter: meubels stáán tegen elkaar aan — een
     nachtkastje raakt het bed, een fauteuil de bank. Zonder die marge zou elk
     realistisch groepje geweigerd worden. En alleen wat werkelijk overlapt
     telt: twee stukken die elkaar over een paar vierkante centimeter raken
     leveren geen tekening op die iemand verkeerd leest. */
  function botstMeubel(mb, g) {
    var MB = global.NGBouwmeubels;
    var lijst = (keuze() && keuze().inrichting) || (S.model && S.model.meubels) || [];
    var e = 0.05;
    for (var i = 0; i < lijst.length; i++) {
      var q = lijst[i];
      if (!q || q.id === mb.id) continue;
      var h = MB && MB.beslag ? MB.beslag(q)
            : { x0: q.x, y0: q.y, x1: q.x + q.b, y1: q.y + q.d };
      var ox = Math.min(g.x1, h.x1) - Math.max(g.x0, h.x0) - e;
      var oy = Math.min(g.y1, h.y1) - Math.max(g.y0, h.y0) - e;
      if (ox > 0 && oy > 0 && ox * oy > 0.02) return true;
    }
    return false;
  }

  /* Tegen de wand klikken. Binnen vijftien centimeter schuift het meubel
     strak tegen de binnenmuur — dat is waar meubels in het echt staan, en
     het scheelt de bezoeker het gepriegel met de laatste twee centimeter. */
  function tegenWand(mb) {
    var MB = global.NGBouwmeubels, bb = S.model && S.model.bb;
    if (!bb) return mb;
    var g = MB && MB.beslag ? MB.beslag(mb)
          : { x0: mb.x, y0: mb.y, x1: mb.x + mb.b, y1: mb.y + mb.d };
    var dx = 0, dy = 0;
    if (Math.abs(g.x0 - bb.x0) < MUUR) dx = bb.x0 - g.x0;
    else if (Math.abs(g.x1 - bb.x1) < MUUR) dx = bb.x1 - g.x1;
    if (Math.abs(g.y0 - bb.y0) < MUUR) dy = bb.y0 - g.y0;
    else if (Math.abs(g.y1 - bb.y1) < MUUR) dy = bb.y1 - g.y1;
    mb.x += dx; mb.y += dy;
    return mb;
  }

  /* --------------------------------------------------------- bedienbalk --- */

  function css() {
    if (!doc || doc.getElementById('ngBewerkCss')) return;
    var s = doc.createElement('style');
    s.id = 'ngBewerkCss';
    s.textContent =
      '.ngbw{display:flex;flex-wrap:wrap;gap:.45rem;align-items:center;padding:.6rem 1.2rem;' +
      'border-top:1px solid #E2DED4;background:#F6F4EF;font-size:.74rem}' +
      '.ngbw b{font-weight:800;margin-right:.3rem}' +
      '.ngbw select,.ngbw button{font:inherit;font-size:.74rem;border:1px solid #E2DED4;background:#fff;' +
      'border-radius:8px;padding:.4rem .6rem;cursor:pointer;color:#26251F}' +
      '.ngbw button:hover,.ngbw select:hover{border-color:#C8A24A}' +
      '.ngbw button[aria-pressed="true"]{background:#26251F;border-color:#26251F;color:#fff}' +
      '.ngbw__hint{color:#75716A;flex:1 1 16rem;min-width:0}' +
      '.ngbw__waarschuw{color:#9A3412;font-weight:700}' +
      '.ngbw__geld{font-weight:800;background:#26251F;color:#fff;border-radius:999px;padding:.34rem .7rem}' +
      '.ngbw button[disabled]{opacity:.4;cursor:default}' +
      '.ngbw-kies [data-meubel],.ngbw-kies [data-kozijn]{cursor:move}' +
      '.ngbw-raam [data-gevel]{cursor:crosshair}' +
      /* Tijdens het indelen mag een veeg over de tekening niet de pagina
         scrollen: dan sleept de bezoeker op zijn telefoon de bank nooit een
         centimeter. */
      '.ngbw-kies svg,.ngbw-raam svg{touch-action:none}' +
      '.ngbw__kader{position:absolute;z-index:4;border:2px dashed #C8A24A;border-radius:4px;' +
      'pointer-events:none;background:#C8A24A18}' +
      '.ngbw__zweef{position:absolute;z-index:5;display:flex;gap:.25rem;background:#26251FF2;border-radius:9px;' +
      'padding:.3rem;transform:translate(-50%,-115%);white-space:nowrap;pointer-events:auto}' +
      '.ngbw__zweef button,.ngbw__zweef select{font:inherit;font-size:.7rem;font-weight:700;border:0;background:#fff;' +
      'color:#26251F;border-radius:6px;padding:.28rem .5rem;cursor:pointer}' +
      '.ngbw__zweef button:hover{background:#C8A24A}' +
      '@media print{.ngbw,.ngbw__zweef{display:none}}';
    doc.head.appendChild(s);
  }

  function paletHtml() {
    var MB = global.NGBouwmeubels;
    if (!MB || !MB.PALET) return '';
    var groepen = [], perGroep = {};
    MB.PALET.forEach(function (p, i) {
      if (!perGroep[p.groep]) { perGroep[p.groep] = []; groepen.push(p.groep); }
      perGroep[p.groep].push({ p: p, i: i });
    });
    return '<select data-bw="palet" aria-label="Meubel toevoegen">' +
      '<option value="">+ Meubel toevoegen…</option>' +
      groepen.map(function (g) {
        return '<optgroup label="' + esc(g) + '">' + perGroep[g].map(function (q) {
          return '<option value="' + q.i + '">' + esc(q.p.naam) + ' · ' +
                 cm(q.p.b) + ' × ' + cm(q.p.d) + ' cm</option>';
        }).join('') + '</optgroup>';
      }).join('') + '</select>';
  }

  /* Wat het kost, terwijl het gekozen wordt. Een raam bijzetten dat de prijs
     stilletjes met duizend euro verhoogt is precies het soort verrassing
     waarvoor een configurator bedoeld is om hem te voorkomen. Staat er niets
     bijzonders, dan staat er ook niets — nul euro meerwerk hoeft niet gemeld. */
  function meerprijsHtml() {
    var A = global.NGBouwAanzichten, B = global.NGBouwkundig;
    var st = keuze();
    if (!A || !A.kozijnstaat || !B || !st) return '';
    var kz;
    try { kz = A.kozijnstaat(st, B.model(st)); } catch (e) { return ''; }
    if (!kz || !kz.meerprijs) return '';
    var bedrag = Math.abs(kz.meerprijs).toLocaleString('nl-NL');
    return '<span class="ngbw__geld">' + (kz.meerprijs > 0 ? '+' : '−') + ' € ' + esc(bedrag) +
           ' ' + (kz.meerprijs > 0 ? 'meerwerk' : 'minderwerk') + ' kozijnen</span>';
  }

  function balkHtml() {
    var st = keuze();
    var eigen = st && (Array.isArray(st.inrichting) || Array.isArray(st.kozijnen));
    return '<b>Zelf indelen</b>' +
      meerprijsHtml() +
      paletHtml() +
      '<button type="button" data-bw="raam" aria-pressed="' + (S.modus === 'raam') + '">Raam plaatsen</button>' +
      '<button type="button" data-bw="deur" aria-pressed="' + (S.modus === 'deur') + '">Deur plaatsen</button>' +
      '<button type="button" data-bw="ongedaan"' + (hist.terug.length ? '' : ' disabled') +
      ' title="Ctrl+Z">Ongedaan</button>' +
      (hist.vooruit.length ? '<button type="button" data-bw="opnieuw" title="Ctrl+Shift+Z">Opnieuw</button>' : '') +
      (eigen ? '<button type="button" data-bw="herstel">Voorstel terugzetten</button>' : '') +
      /* Een waarschuwing verdringt de uitleg en verdwijnt weer bij de volgende
         handeling. Zo staat er nooit tegelijk "sleep maar" en "dat kan niet". */
      '<span class="ngbw__hint' + (S.melding ? ' ngbw__waarschuw' : '') + '">' +
      esc(S.melding || hint()) + '</span>';
  }

  function hint() {
    if (S.modus === 'raam') return 'Klik op een buitenmuur: daar komt het raam. Klik nogmaals op de knop om te stoppen.';
    if (S.modus === 'deur') return 'Klik op een buitenmuur: daar komt de deur. Klik nogmaals op de knop om te stoppen.';
    if (S.sel) {
      return 'Pijltjestoetsen verplaatsen per 5 cm (met Shift per cm), R draait, Delete haalt weg, ' +
             'Ctrl+Z maakt ongedaan. De pui kies je in de configurator, die staat hier vast.';
    }
    return 'Sleep een meubel of een kozijn naar zijn plek. Klik erop voor draaien, breedte en weghalen; ' +
           'daarna werken ook de pijltjestoetsen. De pui kies je in de configurator, die staat hier vast.';
  }

  /* --------------------------------------------------------- zweefbalkje --- */

  function zweefWeg() {
    if (S.balk) { S.balk.remove(); S.balk = null; }
    if (S.kader) { S.kader.remove(); S.kader = null; }
  }

  function zweef() {
    zweefWeg();
    if (!S.aan || !S.sel || !S.doek) return;
    var el = S.doek.querySelector(S.sel.type === 'meubel'
      ? '[data-meubel="' + S.sel.id + '"]' : '[data-kozijn="' + S.sel.id + '"]');
    if (!el) { S.sel = null; return; }
    var r = el.getBoundingClientRect(), dr = S.doek.getBoundingClientRect();
    /* Een kader om wat er vastzit. Zonder dit is aan niets te zien welk meubel
       de knoppen bedienen, en dat is precies waar iemand het verkeerde
       wegklikt. */
    var kader = doc.createElement('div');
    kader.className = 'ngbw__kader';
    kader.style.left = (r.left - dr.left - 3) + 'px';
    kader.style.top = (r.top - dr.top - 3) + 'px';
    kader.style.width = (r.width + 6) + 'px';
    kader.style.height = (r.height + 6) + 'px';
    S.doek.appendChild(kader);
    S.kader = kader;
    var d = doc.createElement('div');
    d.className = 'ngbw__zweef';
    d.style.left = (r.left - dr.left + r.width / 2) + 'px';
    d.style.top = (r.top - dr.top) + 'px';
    if (S.sel.type === 'meubel') {
      d.innerHTML = '<button type="button" data-bw="draai" title="Kwartslag draaien">Draai 90°</button>' +
                    '<button type="button" data-bw="weg" title="Weghalen">Weghalen</button>';
    } else {
      var K = kozijnMet(S.sel.id);
      var breed = [0.60, 0.90, 1.20, 1.50, 1.80, 2.40];
      d.innerHTML = '<select data-bw="breedte" aria-label="Breedte">' +
        breed.map(function (b) {
          var aan = K && Math.abs(K.b - b) < 0.02;
          return '<option value="' + b + '"' + (aan ? ' selected' : '') + '>' + cm(b) + ' cm</option>';
        }).join('') + '</select>' +
        '<button type="button" data-bw="weg" title="Weghalen">Weghalen</button>';
    }
    /* Het zweefbalkje hangt in het doek en niet in de bedienbalk, dus het
       heeft zijn eigen luisteraar nodig. Zonder deze regels stond er een
       knop "Weghalen" die niets deed — het ergste soort knop. */
    d.addEventListener('click', function (ev) {
      var k = ev.target.closest ? ev.target.closest('[data-bw]') : null;
      if (!k || k.tagName === 'SELECT') return;
      ev.preventDefault();
      ev.stopPropagation();
      var wat = k.getAttribute('data-bw');
      if (wat === 'draai') draaiSel();
      else if (wat === 'weg') wegSel();
    });
    d.addEventListener('change', function (ev) {
      var sel = ev.target.closest ? ev.target.closest('[data-bw="breedte"]') : null;
      if (!sel) return;
      breedteSel(Number(sel.value));
    });
    S.doek.appendChild(d);
    S.balk = d;
  }

  /* ------------------------------------------------------------ acties --- */

  function voegMeubelToe(i) {
    var MB = global.NGBouwmeubels;
    var st = neemOver();
    if (!st || !MB || !MB.PALET[i] || !S.model) return;
    var p = MB.PALET[i];
    var bb = S.model.bb;
    /* Middenin de vloer neerzetten en dan de eerste vrije plek zoeken. Boven
       op een bank neerzetten mag: dat ziet de bezoeker en hij sleept hem weg.
       Half door de buitenmuur mag niet, want dat is geen keuze maar een fout. */
    var mb = { id: nieuwId('N', function (id) { return !!meubelMet(id); }),
               soort: p.soort, b: p.b, d: p.d, rot: 0, opt: p.opt || {},
               x: rond((bb.x0 + bb.x1) / 2 - p.b / 2, SNAP),
               y: rond((bb.y0 + bb.y1) / 2 - p.d / 2, SNAP) };
    if (!magHier(mb)) {
      var gevonden = false;
      for (var yy = bb.y0; yy <= bb.y1 - p.d + 0.001 && !gevonden; yy += 0.10) {
        for (var xx = bb.x0; xx <= bb.x1 - p.b + 0.001 && !gevonden; xx += 0.10) {
          mb.x = rond(xx, SNAP); mb.y = rond(yy, SNAP);
          if (magHier(mb)) gevonden = true;
        }
      }
      if (!gevonden) {
        melding(p.naam + ' van ' + cm(p.b) + ' × ' + cm(p.d) + ' cm past nergens binnen deze maten.');
        return;
      }
    }
    onthoud();
    st.inrichting.push(mb);
    S.sel = { type: 'meubel', id: mb.id };
    hertekenen();
  }

  function voegKozijnToe(x, y, soort) {
    var st = neemOver();
    if (!st || !S.model) return;
    var bij = randBij(x, y);
    if (!bij) return;
    var b = soort === 'deur' ? 0.90 : 1.20;
    var sill = soort === 'deur' ? 0 : 0.90;
    /* 2,10 m voor een buitendeur en 1,50 m voor een raam zijn de gangbare
       kozijnmaten. Boven de bovendorpel moet de latei nog kunnen liggen en
       daarboven de dakopbouw; is er minder ruimte, dan wordt het raam korter
       gemaakt — dat is hoe een raam werkelijk wordt besteld, dezelfde som die
       het voorstel zelf ook maakt.

       Een deur niet: die is 2,10 of hij is er niet. Een buitendeur van 1,80
       die niemand heeft gevraagd is geen oplossing maar een fout die pas op de
       bouw opvalt. */
    var grens = bovenGrens();
    var h = soort === 'deur' ? 2.10 : 1.50;
    if (grens) {
      var ruimte = Math.floor((grens - sill) * 20) / 20;
      if (soort === 'raam') h = Math.min(h, ruimte);
      if (sill + h > grens + 0.005 || h < (soort === 'deur' ? 1.90 : 0.90)) {
        melding('Een ' + (soort === 'deur' ? 'buitendeur' : 'raam') +
                ' past niet onder deze dakrand: er is tot ' + cm(grens) +
                ' cm boven de vloer ruimte. Kies een hogere dakrand.');
        return;
      }
    }
    var marge = (b / 2 + 0.15) / bij.rand.L;
    if (marge >= 0.5) {
      melding('Dit gevelstuk is te kort voor een kozijn van ' + cm(b) + ' cm.');
      return;
    }
    var t = Math.min(1 - marge, Math.max(marge, bij.t));
    /* Niet bovenop een bestaand kozijn: twee openingen naast elkaar hebben een
       penant nodig. Er wordt geschoven zolang dat kan, en anders niet
       geplaatst — een raam dat de pui overlapt is niet te bouwen. */
    var vrij = schuifVrij(bij.rand, t, b);
    if (vrij === null) {
      melding('Op dit gevelstuk staat al zoveel dat er geen kozijn van ' + cm(b) + ' cm meer bij kan.');
      return;
    }
    onthoud();
    st.kozijnen.push({ code: nieuwId('K', function (c) { return !!kozijnMet(c) || bezet(c); }),
                       soort: soort, edge: bij.rand.i, t: vrij, b: b, h: h, sill: sill });
    S.modus = 'kies';
    hertekenen();
  }

  function bezet(code) {
    var lijst = (S.model && S.model.kozijnen) || [];
    for (var i = 0; i < lijst.length; i++) if (lijst[i].code === code) return true;
    return false;
  }

  /* Een vrije plek op deze rand, zo dicht mogelijk bij t. Er wordt in stapjes
     naar links en naar rechts gezocht; levert dat niets op dan komt er niets. */
  function schuifVrij(rand, t, b, negeer) {
    var marge = (b / 2 + 0.15) / rand.L;
    var stap = 0.05 / rand.L;
    for (var k = 0; k <= 40; k++) {
      for (var teken = 1; teken >= -1; teken -= 2) {
        var kandidaat = t + teken * k * stap;
        if (kandidaat < marge || kandidaat > 1 - marge) continue;
        if (!botst(rand, kandidaat, b, negeer)) return kandidaat;
        if (k === 0) break;
      }
    }
    return null;
  }

  function botst(rand, t, b, negeer) {
    var lijst = (S.model && S.model.kozijnen) || [];
    for (var i = 0; i < lijst.length; i++) {
      var k = lijst[i];
      if (k.edge !== rand.i || k.code === negeer) continue;
      if (Math.abs(k.t - t) * rand.L < (k.b + b) / 2 + 0.20) return true;
    }
    return false;
  }

  function draaiSel() {
    var mb = S.sel && S.sel.type === 'meubel' ? meubelMet(S.sel.id) : null;
    if (!mb) return;
    var oud = mb.rot || 0;
    onthoud();
    mb.rot = (oud + 90) % 360;
    /* Draaien mag alleen als het gedraaide meubel er ook echt in past. Anders
       terug: liever de melding dan een bed dat door de gevel steekt. */
    if (!magHier(mb)) {
      mb.rot = oud;
      melding('Gedraaid past dit meubel hier niet: er is te weinig ruimte, of hij komt tegen iets anders aan.');
      return;
    }
    hertekenen();
  }

  function wegSel() {
    var st = keuze();
    if (!st || !S.sel) return;
    neemOver();
    onthoud();
    if (S.sel.type === 'meubel') {
      st.inrichting = st.inrichting.filter(function (m) { return m.id !== S.sel.id; });
    } else {
      st.kozijnen = st.kozijnen.filter(function (k) { return k.code !== S.sel.id; });
    }
    S.sel = null;
    hertekenen();
  }

  function breedteSel(b) {
    var K = S.sel && S.sel.type === 'kozijn' ? kozijnMet(S.sel.id) : null;
    if (!K) return;
    var rand = randNr(K.edge);
    if (!rand) return;
    var vrij = schuifVrij(rand, K.t, b, K.code);
    if (vrij === null) {
      melding('Een kozijn van ' + cm(b) + ' cm past hier niet zonder tegen de buren aan te lopen.');
      zweef();
      return;
    }
    onthoud();
    K.b = b; K.t = vrij;
    hertekenen();
  }

  /* Zeggen wat er niet kan. De melding gaat de balk in bij de eerstvolgende
     opbouw en wordt daar meteen weer opgeruimd; blijft hij staan, dan leest de
     bezoeker straks een waarschuwing over een handeling van drie stappen
     geleden. */
  function melding(tekst) { S.melding = tekst; balkVerversen(); }

  /* ------------------------------------------------------------- slepen --- */

  function omlaag(e) {
    if (!S.aan) return;
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    /* Klikken op de tekening geeft de tekening de focus, ook als er niets
       geraakt wordt. Anders doet Ctrl+Z het pas nadat iemand toevallig een
       meubel heeft aangeraakt, en juist na een Delete is er niets meer om aan
       te raken. */
    if (S.doek && S.doek.focus) {
      try { S.doek.focus({ preventScroll: true }); } catch (err) { S.doek.focus(); }
    }

    if (S.modus === 'raam' || S.modus === 'deur') {
      var gevel = t.closest('[data-gevel]');
      if (!gevel) return;
      var p = naarMeters(e);
      if (p) voegKozijnToe(p.x, p.y, S.modus);
      e.preventDefault();
      return;
    }

    var mEl = t.closest('[data-meubel]');
    var kEl = t.closest('[data-kozijn]');
    if (!mEl && !kEl) { S.sel = null; zweefWeg(); return; }

    neemOver();
    var p2 = naarMeters(e);
    if (!p2) return;

    if (mEl) {
      var id = mEl.getAttribute('data-meubel');
      var mb = meubelMet(id);
      if (!mb) return;
      S.sel = { type: 'meubel', id: id };
      S.sleep = { type: 'meubel', el: mEl, item: mb, tf0: mEl.getAttribute('transform'),
                  x0: mb.x, y0: mb.y, mx: p2.x, my: p2.y, verplaatst: false };
    } else {
      var code = kEl.getAttribute('data-kozijn');
      var K = kozijnMet(code);
      S.sel = { type: 'kozijn', id: code };
      if (!K) {
        /* De pui: die hoort bij de productkeuze en wordt hier niet verschoven. */
        S.sel = null;
        melding('De pui volgt de keuze in de configurator en staat op de tekening vast.');
        zweefWeg();
        return;
      }
      var rand = randNr(K.edge);
      if (!rand) return;
      S.sleep = { type: 'kozijn', el: kEl, item: K, rand: rand, tf0: kEl.getAttribute('transform') || '',
                  t0: K.t, mx: p2.x, my: p2.y, verplaatst: false };
    }
    zweefWeg();
    e.preventDefault();
    if (e.pointerId != null && S.svg.setPointerCapture) {
      try { S.svg.setPointerCapture(e.pointerId); } catch (err) { /* oude browser */ }
    }
  }

  function beweeg(e) {
    if (!S.sleep) return;
    var p = naarMeters(e);
    if (!p) return;
    var sl = S.sleep;
    if (sl.type === 'meubel') {
      var nx = rond(sl.x0 + (p.x - sl.mx), SNAP), ny = rond(sl.y0 + (p.y - sl.my), SNAP);
      if (Math.abs(nx - sl.item.x) < 1e-9 && Math.abs(ny - sl.item.y) < 1e-9) return;
      sl.verplaatst = true;
      /* Tijdens het slepen alleen het beeld verschuiven en niet de hele
         tekening opnieuw opbouwen: dat zou tien bladen per muisbeweging
         kosten en het slepen laten haperen. De echte waarde wordt pas bij
         loslaten weggeschreven. */
      var dx = (nx - sl.x0) * S.tf.s, dy = (ny - sl.y0) * S.tf.s;
      sl.el.setAttribute('transform', 'translate(' + dx + ' ' + dy + ') ' + sl.tf0);
      sl.nx = nx; sl.ny = ny;
    } else {
      var r = sl.rand;
      var ux = (r.b[0] - r.a[0]) / r.L, uy = (r.b[1] - r.a[1]) / r.L;
      /* Alleen langs de rand: een kozijn dat de gevel uit sleept bestaat niet. */
      var langs = (p.x - sl.mx) * ux + (p.y - sl.my) * uy;
      var marge = (sl.item.b / 2 + 0.15) / r.L;
      var nt = Math.min(1 - marge, Math.max(marge, sl.t0 + langs / r.L));
      if (Math.abs(nt - (sl.nt == null ? sl.t0 : sl.nt)) < 1e-6) return;
      sl.verplaatst = true;
      sl.nt = nt;
      var d = (nt - sl.t0) * r.L * S.tf.s;
      sl.el.setAttribute('transform', 'translate(' + (ux * d) + ' ' + (uy * d) + ') ' + sl.tf0);
    }
  }

  function omhoog(e) {
    var sl = S.sleep;
    S.sleep = null;
    if (!sl) return;
    if (e && e.pointerId != null && S.svg && S.svg.releasePointerCapture) {
      try { S.svg.releasePointerCapture(e.pointerId); } catch (err) { /* oude browser */ }
    }
    if (!sl.verplaatst) { zweef(); return; }
    if (sl.type === 'meubel') {
      /* Het id moet mee: zonder vergelijkt de botsingstoets het meubel met
         zichzelf en kan er niets meer verschoven worden. */
      var proef = { id: sl.item.id, soort: sl.item.soort, x: sl.nx, y: sl.ny,
                    b: sl.item.b, d: sl.item.d, rot: sl.item.rot };
      tegenWand(proef);
      if (!magHier(proef)) {
        /* Buiten de omtrek of in het trapgat: terug naar waar hij stond. Er
           wordt niets half over de muur getekend. */
        S.melding = 'Daar past dit meubel niet: buiten de muren of boven op iets dat er al staat. ' +
                    'Hij staat terug op zijn oude plek.';
        hertekenen();
        return;
      }
      onthoud();
      sl.item.x = Math.round(proef.x * 1000) / 1000;
      sl.item.y = Math.round(proef.y * 1000) / 1000;
    } else {
      var vrij = schuifVrij(sl.rand, sl.nt, sl.item.b, sl.item.code);
      if (vrij === null) { hertekenen(); return; }
      onthoud();
      sl.item.t = Math.round(vrij * 1e4) / 1e4;
    }
    hertekenen();
  }

  /* ---------------------------------------------------------- toetsenbord --- */

  /* Alles wat met de muis kan, kan ook met het toetsenbord. Dat is niet
     alleen een toegankelijkheidseis: op een laptop zonder muis is een pijltje
     van vijf centimeter nauwkeuriger dan een touchpad, en dat is precies wat
     iemand wil die zijn eettafel op de centimeter wil zetten. */
  function toets(e) {
    if (!S.aan) return;
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    /* Ongedaan maken werkt ook zonder dat er iets geselecteerd is — juist dan,
       want na een Delete is er niets meer om aan te wijzen. */
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) opnieuw(); else ongedaan();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); opnieuw(); return; }
    if (!S.sel) return;
    var mb = S.sel.type === 'meubel' ? meubelMet(S.sel.id) : null;
    var K = S.sel.type === 'kozijn' ? kozijnMet(S.sel.id) : null;
    var stap = e.shiftKey ? 0.01 : SNAP;

    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); wegSel(); return; }
    if ((e.key === 'r' || e.key === 'R') && mb) { e.preventDefault(); draaiSel(); return; }
    if (e.key === 'Escape') { e.preventDefault(); S.sel = null; zweefWeg(); return; }

    var dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -stap;
    else if (e.key === 'ArrowRight') dx = stap;
    else if (e.key === 'ArrowUp') dy = -stap;
    else if (e.key === 'ArrowDown') dy = stap;
    else return;
    e.preventDefault();

    if (mb) {
      /* Op het raster afronden en niet er blind bij optellen: anders schuift
         een meubel dat tegen de wand is geklikt voor altijd twee centimeter
         naast de maatvoering. */
      var proef = { id: mb.id, soort: mb.soort, b: mb.b, d: mb.d, rot: mb.rot,
                    x: dx ? rond(mb.x + dx, stap) : mb.x,
                    y: dy ? rond(mb.y + dy, stap) : mb.y };
      if (Math.abs(proef.x - mb.x) < 1e-9 && Math.abs(proef.y - mb.y) < 1e-9) {
        proef.x = mb.x + dx; proef.y = mb.y + dy;
      }
      if (!magHier(proef)) { melding('Verder kan hij niet: daar houdt de vloer op of staat al iets anders.'); return; }
      onthoud();
      mb.x = Math.round(proef.x * 1000) / 1000;
      mb.y = Math.round(proef.y * 1000) / 1000;
      hertekenen();
    } else if (K) {
      var rand = randNr(K.edge);
      if (!rand) return;
      /* Langs de rand, in de richting waar het pijltje het meest op lijkt. */
      var ux = (rand.b[0] - rand.a[0]) / rand.L, uy = (rand.b[1] - rand.a[1]) / rand.L;
      var langs = dx * ux + dy * uy;
      if (!langs) return;
      var marge = (K.b / 2 + 0.15) / rand.L;
      var nt = Math.min(1 - marge, Math.max(marge, K.t + langs / rand.L));
      var vrij = schuifVrij(rand, nt, K.b, K.code);
      if (vrij === null) { melding('Verder kan hij niet: dan loopt hij tegen het volgende kozijn aan.'); return; }
      onthoud();
      K.t = Math.round(vrij * 1e4) / 1e4;
      hertekenen();
    }
  }

  /* --------------------------------------------------------- aansluiting --- */

  function balkVerversen() {
    if (!S.doek || !S.doek.parentNode) return;
    var balk = S.doek.parentNode.querySelector('.ngbw');
    if (!S.aan) { if (balk) balk.remove(); return; }
    if (!balk) {
      balk = doc.createElement('div');
      balk.className = 'ngbw';
      S.doek.parentNode.insertBefore(balk, S.doek.nextSibling);
      balk.addEventListener('click', function (e) {
        var k = e.target.closest ? e.target.closest('[data-bw]') : null;
        if (!k || k.tagName === 'SELECT') return;
        var wat = k.getAttribute('data-bw');
        if (wat === 'raam' || wat === 'deur') { S.modus = S.modus === wat ? 'kies' : wat; S.sel = null; teken(); }
        else if (wat === 'ongedaan') ongedaan();
        else if (wat === 'opnieuw') opnieuw();
        else if (wat === 'herstel') herstel();
        else if (wat === 'draai') draaiSel();
        else if (wat === 'weg') wegSel();
      });
      balk.addEventListener('change', function (e) {
        var sel = e.target.closest ? e.target.closest('[data-bw]') : null;
        if (!sel) return;
        var wat = sel.getAttribute('data-bw');
        if (wat === 'palet' && sel.value !== '') { var i = Number(sel.value); sel.value = ''; voegMeubelToe(i); }
        else if (wat === 'breedte') breedteSel(Number(sel.value));
      });
    }
    balk.innerHTML = balkHtml();
    S.melding = '';
  }

  function teken() {
    balkVerversen();
    if (S.doek) {
      S.doek.classList.toggle('ngbw-kies', S.aan && S.modus === 'kies');
      S.doek.classList.toggle('ngbw-raam', S.aan && S.modus !== 'kies');
    }
    zweef();
  }

  /* Het tekenprogramma roept dit aan zodra er een nieuw blad in het doek
     staat. De bewerker hangt zijn luisteraars aan de SVG die er nú is — de
     vorige is weg, dus opnieuw aanhaken is geen luxe maar noodzaak. */
  function na(doek, r) {
    S.doek = doek;
    var isPlattegrond = r && r.v === 'plattegrond' && r.model;
    if (!isPlattegrond) {
      S.svg = null; S.model = null; S.tf = null;
      if (S.aan) { S.aan = false; balkVerversen(); }
      zweefWeg();
      return;
    }
    S.model = r.model;
    S.tf = r.model.tf;
    S.svg = doek.querySelector('svg');
    if (S.svg && S.aan) {
      S.svg.addEventListener('pointerdown', omlaag);
      S.svg.addEventListener('pointermove', beweeg);
      S.svg.addEventListener('pointerup', omhoog);
      S.svg.addEventListener('pointercancel', omhoog);
    }
    /* Op het doek en niet op de SVG: die wordt bij elke hertekening vervangen,
       en dan zou de pijltjestoets het na één stap niet meer doen. */
    if (!doek.dataset.ngbwToets) {
      doek.dataset.ngbwToets = '1';
      doek.addEventListener('keydown', toets);
    }
    teken();
  }

  function aanZetten(aan) {
    S.aan = aan == null ? !S.aan : !!aan;
    S.modus = 'kies';
    S.sel = null;
    if (!S.aan) { hist.terug.length = 0; hist.vooruit.length = 0; }
    css();
    hertekenen();
    /* Het doek de focus geven zodra het indelen begint, anders doet Ctrl+Z
       niets tot iemand toevallig eerst iets aanklikt. De luisteraar blijft op
       het doek staan en niet op het document: Ctrl+Z elders op de pagina is
       niet van ons. */
    if (S.aan && S.doek && S.doek.focus) {
      var straks = global.requestAnimationFrame || function (fn) { return global.setTimeout(fn, 16); };
      straks(function () {
        try { S.doek.focus({ preventScroll: true }); } catch (e) { S.doek.focus(); }
      });
    }
    return S.aan;
  }

  css();

  global.NGTekenbewerker = {
    na: na,
    aan: aanZetten,
    actief: function () { return S.aan; },
    herstel: herstel,
    _staat: function () { return { aan: S.aan, modus: S.modus, sel: S.sel }; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
