/* Het werfdashboard: wat de bezoekers van de configurator samenstellen.
 *
 * WAAROM DIT ER IS
 * De configurator was een eenrichtingsweg. Een bezoeker stelde een schip van
 * zes miljoen samen en de werf hoorde er niets over tenzij hij op "offerte"
 * drukte - en dat doet ongeveer één op de vijfentwintig. De vierentwintig
 * anderen lieten precies achter wat een verkoper wil weten: welk model, welke
 * kleur, hoeveel opties, welk bedrag, en op welk moment ze ermee stopten. Dat
 * stond nergens.
 *
 * WAT HET WEL EN NIET IS
 * Dit is geen bezoekersstatistiek. Er staat niet in hoeveel mensen er langs
 * kwamen, waar ze vandaan kwamen of hoe lang ze bleven hangen - daar is een
 * webstatistiekpakket voor en dat doet het beter. Dit gaat over één ding: wat
 * er samengesteld wordt. Elke tegel op dit scherm beantwoordt een vraag die een
 * werf in een verkoopoverleg stelt.
 *
 * DE DRIE BRONNEN
 *   lokaal   Wat er in deze browser gemeten is. De standaard.
 *   server   Wat er van NG_METING_ENDPOINT terugkomt, als de werf dat inricht.
 *   demo     Verzonnen cijfers, met een streep eromheen dat ze verzonnen zijn.
 *            Dit is wat de demonstratiesite laat zien: een leeg dashboard
 *            verkoopt niets en echte bezoekcijfers van vreemden horen niet op
 *            een openbare pagina.
 *
 * De demo-cijfers komen uit een toevalsgenerator met een vaste startwaarde.
 * Dat is met opzet: een dashboard dat bij elke verversing andere getallen laat
 * zien is een animatie en geen dashboard, en wie het twee keer opent hoort
 * hetzelfde te zien.
 */
(function (global) {
  'use strict';

  function D() { return global.NGJachtData; }
  function T(z) { return (global.NGTaal && global.NGTaal.T) ? global.NGTaal.T(z) : z; }

  /* ---------- kleine hulpjes ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function heel(n) {
    try { return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(n); }
    catch (e) { return String(Math.round(n)); }
  }
  function euro(n) {
    if (n === null || n === undefined || isNaN(n)) return '-';
    return '€ ' + heel(n);
  }
  function deel(n, van) { return van ? Math.round(n / van * 1000) / 10 : 0; }
  function procent(n, van) { return van ? deel(n, van).toFixed(deel(n, van) % 1 ? 1 : 0) + '%' : '0%'; }

  /* Het label bij een waarde. Staat de lijst er niet of is de waarde
     verdwenen uit de catalogus - een oude meting van een model dat de werf
     niet meer bouwt - dan blijft de kale waarde staan. Dat is eerlijker dan
     hem weglaten: er is toen wel degelijk iets gekozen. */
  function label(lijst, waarde) {
    var d = D();
    if (!d || !d[lijst]) return waarde;
    for (var i = 0; i < d[lijst].length; i++) if (d[lijst][i].v === waarde) return d[lijst][i].l;
    return waarde;
  }

  /* ---------- de groepen die geteld worden ----------
     Titel, het veld in de meting, en de lijst waar de labels uit komen. De
     volgorde is die van het configuratiepaneel, zodat het dashboard dezelfde
     route aflegt als de bezoeker. */
  var GROEPEN = [
    { veld: 'model',         lijst: 'modellen',      kop: 'Model' },
    { veld: 'rompkleur',     lijst: 'rompkleuren',   kop: 'Rompkleur' },
    { veld: 'opbouw',        lijst: 'opbouw',        kop: 'Opbouwkleur' },
    { veld: 'dek',           lijst: 'dekken',        kop: 'Dek en bovenbouw' },
    { veld: 'dekafwerking',  lijst: 'dekafwerking',  kop: 'Dekafwerking' },
    { veld: 'motorisering',  lijst: 'motorisering',  kop: 'Motorisering' },
    { veld: 'interieurhout', lijst: 'interieurhout', kop: 'Interieurhout' },
    { veld: 'stoffering',    lijst: 'stoffering',    kop: 'Stoffering' },
    { veld: 'vloer',         lijst: 'vloer',         kop: 'Vloer' },
    { veld: 'wandafwerking', lijst: 'wandafwerking', kop: 'Wandafwerking' },
    { veld: 'marmer',        lijst: 'marmer',        kop: 'Marmer' },
    { veld: 'metaal',        lijst: 'metaal',        kop: 'Metaal' },
    { veld: 'verlichting',   lijst: 'verlichting',   kop: 'Verlichting' }
  ];

  /* De trechter, van vrijblijvend naar getekend. Elke stap is een deelverzameling
     van de vorige, en dat moet ook zo blijven: een bezoek dat downloadde maar
     volgens de telling niets wijzigde zou de trechter breed maken op een plek
     waar hij smal hoort te zijn. Vandaar dat er geteld wordt op "heeft deze stap
     of een latere gezet" en niet op de stap alleen. */
  var TRECHTER = [
    { stap: 'gestart',   kop: 'Configurator geopend' },
    { stap: 'gewijzigd', kop: 'Zelf samengesteld' },
    { stap: 'voorbeeld', kop: 'Dossier bekeken' },
    { stap: 'dossier',   kop: 'Dossier gedownload' },
    { stap: 'offerte',   kop: 'Offerte aangevraagd' }
  ];

  /* ---------- rekenen ---------- */

  function gezet(b, stap) { return !!(b.stappen && b.stappen[stap]); }

  /* Heeft dit bezoek deze stap gezet, of een die verder ligt? Zo blijft de
     trechter een trechter, ook als een bezoeker een stap overslaat - en dat
     gebeurt: wie een link van iemand anders opent en meteen downloadt heeft
     zelf niets gewijzigd. */
  function totMinstens(b, i) {
    for (var k = i; k < TRECHTER.length; k++) if (gezet(b, TRECHTER[k].stap)) return true;
    /* 'gedeeld' staat niet in de trechter maar is wel een serieuze stap: wie
       zijn samenstelling doorstuurt naar zijn partner is verder dan wie hem
       alleen bekeek. Hij telt daarom mee vanaf "dossier bekeken". */
    return i <= 2 && gezet(b, 'gedeeld');
  }

  function mediaan(getallen) {
    if (!getallen.length) return null;
    var s = getallen.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  }

  /* Telt één veld over alle bezoeken, aflopend gesorteerd.
     Waarden die niemand koos blijven staan met nul erachter: dat een kleur
     nooit gekozen is, is precies zo'n bevinding als dat een andere altijd
     gekozen wordt. Een lijst die alleen de winnaars toont verbergt dat. */
  function tel(bezoeken, veld, lijst) {
    var telling = {};
    var d = D();
    if (d && d[lijst]) d[lijst].forEach(function (x) { telling[x.v] = 0; });
    var totaal = 0;
    bezoeken.forEach(function (b) {
      var v = b[veld];
      if (!v) return;
      telling[v] = (telling[v] || 0) + 1;
      totaal++;
    });
    return Object.keys(telling).map(function (v) {
      return { v: v, l: label(lijst, v), n: telling[v], deel: deel(telling[v], totaal) };
    }).sort(function (a, b) { return b.n - a.n || String(a.l).localeCompare(String(b.l)); });
  }

  function telOpties(bezoeken) {
    var d = D();
    var telling = {};
    if (d && d.opties) d.opties.forEach(function (o) { telling[o.v] = 0; });
    bezoeken.forEach(function (b) {
      (b.opties || []).forEach(function (o) { telling[o] = (telling[o] || 0) + 1; });
    });
    return Object.keys(telling).map(function (v) {
      return { v: v, l: label('opties', v), n: telling[v], deel: deel(telling[v], bezoeken.length) };
    }).sort(function (a, b) { return b.n - a.n || String(a.l).localeCompare(String(b.l)); });
  }

  /* Alles wat het scherm nodig heeft, in één keer uitgerekend. */
  function cijfers(bezoeken) {
    var uit = { aantal: bezoeken.length };

    uit.trechter = TRECHTER.map(function (t, i) {
      var n = bezoeken.filter(function (b) { return totMinstens(b, i); }).length;
      return { stap: t.stap, kop: t.kop, n: n, deel: deel(n, bezoeken.length) };
    });
    uit.gedeeld = bezoeken.filter(function (b) { return gezet(b, 'gedeeld'); }).length;

    uit.groepen = GROEPEN.map(function (g) {
      return { veld: g.veld, kop: g.kop, rijen: tel(bezoeken, g.veld, g.lijst) };
    });
    uit.opties = telOpties(bezoeken);
    uit.optiesPerBezoek = bezoeken.length
      ? Math.round(bezoeken.reduce(function (s, b) { return s + (b.opties || []).length; }, 0) / bezoeken.length * 10) / 10
      : 0;

    /* Alleen bezoeken waarvan een bedrag bekend is. Staan de prijzen uit, dan
       blijft dit hele blok leeg in plaats van nul te tonen - nul euro is geen
       gemiddelde maar een ontbrekend gegeven. */
    var bedragen = bezoeken.map(function (b) { return b.prijs; })
                           .filter(function (p) { return typeof p === 'number' && p > 0; });
    uit.prijs = bedragen.length ? {
      n: bedragen.length,
      gemiddeld: Math.round(bedragen.reduce(function (s, x) { return s + x; }, 0) / bedragen.length),
      mediaan: mediaan(bedragen),
      hoogste: Math.max.apply(null, bedragen),
      laagste: Math.min.apply(null, bedragen)
    } : null;

    /* Per model, want een gemiddelde over alle modellen samen zegt vooral iets
       over welke modellen populair zijn en niet over wat er per schip
       bijbesteld wordt. */
    var perModel = {};
    bezoeken.forEach(function (b) {
      if (!b.model || typeof b.prijs !== 'number' || b.prijs <= 0) return;
      (perModel[b.model] = perModel[b.model] || []).push(b.prijs);
    });
    uit.prijsPerModel = Object.keys(perModel).map(function (m) {
      var r = perModel[m];
      return { v: m, l: label('modellen', m), n: r.length,
               gemiddeld: Math.round(r.reduce(function (s, x) { return s + x; }, 0) / r.length),
               hoogste: Math.max.apply(null, r) };
    }).sort(function (a, b) { return b.gemiddeld - a.gemiddeld; });

    /* De afhakers: wel zelf samengesteld, niets aangevraagd en niets
       gedownload. Dit is de lijst waar een verkoper wat aan heeft, dus staat
       de zwaarste bovenaan - een afhaker van zes miljoen is een ander gesprek
       dan een van achthonderdduizend. */
    uit.afgehaakt = bezoeken.filter(function (b) {
      return gezet(b, 'gewijzigd') && !gezet(b, 'dossier') && !gezet(b, 'offerte');
    }).sort(function (a, b) { return (b.prijs || 0) - (a.prijs || 0); });

    uit.duur = mediaan(bezoeken.map(function (b) { return Math.round((b.eind - b.begin) / 1000); })
                               .filter(function (x) { return x > 0; }));
    uit.talen = tel(bezoeken, 'taal', '_geen');
    uit.stelsels = tel(bezoeken, 'stelsel', '_geen');
    uit.munten = tel(bezoeken, 'munt', '_geen');
    return uit;
  }

  /* ---------- demonstratiecijfers ----------

     Een vaste startwaarde, zodat het dashboard bij elke verversing dezelfde
     cijfers laat zien. Een lineaire congruentiegenerator is hier ruim genoeg:
     er hoeft niets onvoorspelbaars aan te zijn, alleen maar willekeurig
     ogend. */
  function generator(zaad) {
    var s = zaad >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* Trekken uit een lijst met gewichten. Zonder gewichten wordt elke rompkleur
     even vaak gekozen en dat is precies wat een dashboard nooit laat zien -
     echte voorkeuren zijn scheef, en een demo die dat niet toont demonstreert
     niets. */
  function trek(r, lijst, gewichten) {
    if (!lijst || !lijst.length) return null;
    var g = lijst.map(function (x, i) { return gewichten && gewichten[i] !== undefined ? gewichten[i] : 1; });
    var som = g.reduce(function (a, b) { return a + b; }, 0);
    var t = r() * som;
    for (var i = 0; i < lijst.length; i++) { t -= g[i]; if (t <= 0) return lijst[i].v; }
    return lijst[lijst.length - 1].v;
  }

  /* Aflopende gewichten: de eerste keuze in een lijst wordt het vaakst
     gekozen, de laatste het minst. Dat is hoe een catalogus in de praktijk
     werkt - wat bovenaan staat wordt gekozen - en het geeft een demo die
     herkenbaar oogt in plaats van vlak. */
  function aflopend(n, sterkte) {
    var uit = [];
    for (var i = 0; i < n; i++) uit.push(Math.pow(sterkte === undefined ? 0.72 : sterkte, i));
    return uit;
  }

  function demo(aantal, dagen) {
    var d = D();
    if (!d) return [];
    var r = generator(20260822);
    aantal = aantal || 260;
    dagen = dagen || 90;
    var eind = Date.now();
    var uit = [];

    /* De kleine modellen worden het vaakst opengeklikt en de grote het minst -
       zoals in elke jachtcatalogus. De Giga 120 is de uitzondering die er wel
       moet zijn: die wordt vaker aangeklikt dan hij verkocht wordt, want
       iedereen wil hem één keer zien. */
    var modelGewicht = d.modellen.map(function (m, i) {
      return i === d.modellen.length - 1 ? 1.5 : Math.pow(0.82, i) * 3;
    });

    for (var k = 0; k < aantal; k++) {
      /* Recentere dagen iets zwaarder: een configurator die net live staat
         krijgt meer bezoek naarmate hij langer bestaat. */
      var dagTerug = Math.floor(Math.pow(r(), 1.35) * dagen);
      var begin = eind - dagTerug * 86400000 - Math.floor(r() * 86400000);
      var wijzigingen = Math.floor(Math.pow(r(), 1.8) * 26);
      var b = {
        id: 'demo' + k, begin: begin, eind: begin + (30 + Math.floor(Math.pow(r(), 0.6) * 900)) * 1000,
        taal: trek(r, [{ v: 'nl' }, { v: 'en' }, { v: 'de' }], [6, 3, 2]),
        stelsel: trek(r, [{ v: 'metrisch' }, { v: 'imperiaal' }], [7, 3]),
        munt: trek(r, [{ v: 'EUR' }, { v: 'USD' }, { v: 'GBP' }], [7, 2, 1]),
        wijzigingen: wijzigingen, stappen: { gestart: 1 }, opties: []
      };
      GROEPEN.forEach(function (g) {
        var lijst = d[g.lijst];
        b[g.veld] = trek(r, lijst, g.veld === 'model' ? modelGewicht : aflopend(lijst.length));
      });
      /* Niet elk model kent elke dekvorm; een demo die een flybridge op een
         sloep van zestien meter zet, laat een dashboard zien dat niet kan
         kloppen. */
      var m = null;
      for (var i = 0; i < d.modellen.length; i++) if (d.modellen[i].v === b.model) m = d.modellen[i];
      if (m && m.dekken && m.dekken.indexOf(b.dek) < 0) b.dek = m.dekken[0];

      d.opties.forEach(function (o, i) {
        if (r() < 0.30 * Math.pow(0.88, i)) b.opties.push(o.v);
      });
      if (wijzigingen > 0) b.stappen.gewijzigd = wijzigingen;
      if (r() < 0.30) b.stappen.voorbeeld = 1;
      if (b.stappen.voorbeeld && r() < 0.46) b.stappen.dossier = 1;
      if (r() < 0.09) b.stappen.gedeeld = 1;
      if (b.stappen.dossier && r() < 0.30) b.stappen.offerte = 1;

      b.code = [b.model, b.rompkleur, b.opbouw, b.dek, b.dekafwerking, b.interieurhout,
                b.stoffering, b.motorisering, b.vloer, b.wandafwerking, b.marmer,
                b.metaal, b.verlichting].join('.') + (b.opties.length ? '~' + b.opties.join(',') : '');
      try {
        var p = d.prijzenActief && d.prijsVan ? d.prijsVan(b) : null;
        b.prijs = p ? Math.round(p.totaal) : null;
      } catch (e) { b.prijs = null; }
      uit.push(b);
    }
    return uit.sort(function (a, b2) { return a.begin - b2.begin; });
  }

  /* ---------- tekenen ----------

     Alle grafieken op dit scherm zijn hetzelfde ding: een gerangschikte lijst
     met een balk erachter. Dat is met opzet. De vraag is telkens "hoeveel, en
     hoe verhoudt zich dat", en daar is een liggende balk het antwoord op -
     labels van "Composiet teaklook" passen er leesbaar naast, wat bij een
     staande balk niet zo is. Taartpunten staan er niet op: die vergelijken
     slecht zodra twee stukken op elkaar lijken, en dat is precies het geval
     waar dit dashboard voor gemaakt is.

     Eén reeks, dus één kleur voor elke balk. Donkerder-waar-groter zou de
     lengte van de balk nog een keer vertellen in kleur, en dan is er een
     kanaal opgebruikt aan iets wat er al staat. */
  function balk(rij, max, opties) {
    opties = opties || {};
    var breedte = max > 0 ? Math.max(rij.n / max * 100, rij.n > 0 ? 1.5 : 0) : 0;
    var waarde = opties.waarde || (heel(rij.n) + '<span class="dbl__pct">' + procent(rij.n, opties.totaal || max) + '</span>');
    return '<div class="dbl" title="' + esc(rij.l) + ': ' + heel(rij.n) + '">' +
      '<div class="dbl__l">' + esc(rij.l) + '</div>' +
      '<div class="dbl__spoor"><div class="dbl__vul' + (rij.n ? '' : ' dbl__vul--nul') +
        '" style="width:' + breedte.toFixed(2) + '%"></div></div>' +
      '<div class="dbl__n">' + waarde + '</div>' +
      '</div>';
  }

  function balkenBlok(kop, rijen, opties) {
    opties = opties || {};
    if (!rijen.length) return '';
    var max = rijen.reduce(function (m, r) { return Math.max(m, r.n); }, 0);
    var totaal = opties.totaal !== undefined ? opties.totaal
               : rijen.reduce(function (s, r) { return s + r.n; }, 0);
    var toon = opties.top ? rijen.slice(0, opties.top) : rijen;
    return '<section class="dbk">' +
      '<h2 class="dbk__kop">' + esc(T(kop)) + '</h2>' +
      (opties.onder ? '<p class="dbk__onder">' + esc(T(opties.onder)) + '</p>' : '') +
      '<div class="dbk__lijst">' + toon.map(function (r) {
        return balk(r, max, { totaal: totaal, waarde: opties.waarde && opties.waarde(r) });
      }).join('') + '</div>' +
      (opties.top && rijen.length > opties.top
        ? '<p class="dbk__rest">' + esc(T('en nog ')) + (rijen.length - opties.top) + esc(T(' andere')) + '</p>' : '') +
      '</section>';
  }

  /* Een kerncijfer. Geen grafiek maar één getal: waar het antwoord één getal
     is, is een balk van één balk geen grafiek maar opsmuk.

     Het getal staat in dezelfde schreefloze letter als de rest en niet in de
     schreefletter van de koppen: een cijfer dat je moet aflezen hoort in de
     letter die daarvoor gemaakt is. En met gewone cijferbreedtes, want een
     los groot getal met tabelcijfers staat los in zijn eigen ruimte. */
  function tegel(kop, waarde, onder, soort) {
    return '<div class="dbt' + (soort ? ' dbt--' + soort : '') + '">' +
      '<div class="dbt__k">' + esc(T(kop)) + '</div>' +
      '<div class="dbt__w">' + waarde + '</div>' +
      (onder ? '<div class="dbt__o">' + esc(onder) + '</div>' : '') +
      '</div>';
  }

  function duurTekst(s) {
    if (!s) return '-';
    if (s < 60) return s + ' sec';
    var m = Math.round(s / 60);
    return m < 60 ? m + ' min' : Math.round(m / 6) / 10 + ' uur';
  }

  function datum(ms) {
    try {
      return new Date(ms).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) + ' ' +
             new Date(ms).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function teken(el, c, opties) {
    opties = opties || {};
    if (!el) return;
    if (!c.aantal) {
      el.innerHTML = '<div class="dbleeg"><h3>' + esc(T('Nog niets gemeten')) + '</h3>' +
        '<p>' + esc(T('Zodra er iemand een schip samenstelt verschijnen de cijfers hier. ')) +
        esc(T('Of kies hierboven de demonstratiecijfers om te zien wat er komt te staan.')) + '</p></div>';
      return;
    }

    var t = c.trechter;
    var dossier = t[3].n, offerte = t[4].n, samengesteld = t[1].n;

    var kern = '<div class="dbrij">' +
      tegel('Samenstellingen', heel(c.aantal), T('in de gekozen periode')) +
      tegel('Zelf samengesteld', heel(samengesteld), procent(samengesteld, c.aantal) + T(' van alle bezoeken')) +
      tegel('Dossiers gedownload', heel(dossier), procent(dossier, c.aantal) + T(' van alle bezoeken')) +
      tegel('Offerteaanvragen', heel(offerte), procent(offerte, samengesteld) + T(' van wie samenstelde'), 'accent') +
      /* De mediaan groot en het gemiddelde eronder, en niet andersom.
         De modellen lopen van anderhalf miljoen tot driehonderddertig, dus
         één bezoeker die de Giga 120 openklikt tilt het gemiddelde over alle
         samenstellingen naar vijftig miljoen - een bedrag waar geen enkele
         samenstelling in de buurt komt. De mediaan zegt wat een doorsnee
         bezoeker samenstelt en dat is de vraag die deze tegel beantwoordt. */
      (c.prijs ? tegel('Mediaan per samenstelling', euro(c.prijs.mediaan),
                       T('gemiddeld ') + euro(c.prijs.gemiddeld) +
                       T(', scheefgetrokken door de grootste modellen')) : '') +
      tegel('Mediane tijd', duurTekst(c.duur), T('per bezoek')) +
      '</div>';

    var trechter = balkenBlok('Van openen tot aanvraag', t.map(function (x) {
      return { v: x.stap, l: T(x.kop), n: x.n };
    }), { totaal: c.aantal, onder: 'Elke stap telt iedereen die minstens zover kwam.' });

    var modellen = c.groepen[0];
    var modelBlok = balkenBlok('Welk model men samenstelt', modellen.rijen, { totaal: c.aantal });

    var optieBlok = balkenBlok('Opties', c.opties, {
      totaal: c.aantal,
      onder: 'Aandeel van de samenstellingen waarin de optie aan stond. Gemiddeld ' +
             String(c.optiesPerBezoek).replace('.', ',') + ' opties per samenstelling.'
    });

    var keuzes = c.groepen.slice(1).map(function (g) {
      return balkenBlok(g.kop, g.rijen, { totaal: c.aantal, top: 6 });
    }).join('');

    var prijsBlok = '';
    if (c.prijsPerModel && c.prijsPerModel.length) {
      prijsBlok = '<section class="dbk dbk--breed"><h2 class="dbk__kop">' +
        esc(T('Gemiddeld bedrag per model')) + '</h2>' +
        '<table class="dbtab"><thead><tr><th scope="col">' + esc(T('Model')) + '</th>' +
        '<th class="r" scope="col">' + esc(T('Aantal')) + '</th><th class="r" scope="col">' + esc(T('Gemiddeld')) + '</th>' +
        '<th class="r" scope="col">' + esc(T('Hoogste')) + '</th></tr></thead><tbody>' +
        c.prijsPerModel.map(function (p) {
          return '<tr><th scope="row">' + esc(p.l) + '</th><td class="r">' + heel(p.n) + '</td>' +
                 '<td class="r">' + euro(p.gemiddeld) + '</td><td class="r">' + euro(p.hoogste) + '</td></tr>';
        }).join('') + '</tbody></table></section>';
    }

    /* De afhakerslijst is de enige tabel op dit scherm met een link erin. Dat
       is ook het punt ervan: een verkoper klikt hem aan en heeft het schip dat
       die bezoeker samenstelde voor zich, precies zoals hij het achterliet. */
    var afhakers = '';
    if (c.afgehaakt.length) {
      var pagina = opties.configuratorUrl || './jacht-configurator.html';
      afhakers = '<section class="dbk dbk--breed"><h2 class="dbk__kop">' +
        esc(T('Afgehaakt na samenstellen')) + '</h2>' +
        '<p class="dbk__onder">' +
        esc(T('Wel zelf samengesteld, geen dossier en geen aanvraag. Zwaarste bovenaan. ')) +
        esc(T('Klik een regel om die samenstelling te openen zoals de bezoeker hem achterliet.')) +
        '</p><table class="dbtab"><thead><tr><th>' + esc(T('Model')) + '</th>' +
        '<th class="r">' + esc(T('Bedrag')) + '</th><th class="r">' + esc(T('Keuzes')) + '</th>' +
        '<th class="r">' + esc(T('Wanneer')) + '</th><th></th></tr></thead><tbody>' +
        c.afgehaakt.slice(0, 25).map(function (b) {
          return '<tr><td>' + esc(label('modellen', b.model)) + '</td>' +
            '<td class="r">' + euro(b.prijs) + '</td>' +
            '<td class="r">' + heel(b.wijzigingen || 0) + '</td>' +
            '<td class="r dbtab__stil">' + esc(datum(b.eind)) + '</td>' +
            '<td class="r">' + (b.code
              ? '<a class="dbtab__l" href="' + esc(pagina) + '?c=' + encodeURIComponent(b.code) + '">' +
                esc(T('openen')) + '</a>' : '') + '</td></tr>';
        }).join('') + '</tbody></table>' +
        (c.afgehaakt.length > 25
          ? '<p class="dbk__rest">' + esc(T('en nog ')) + (c.afgehaakt.length - 25) + esc(T(' andere')) + '</p>' : '') +
        '</section>';
    }

    var voorkeuren = balkenBlok('Taal', c.talen, { totaal: c.aantal }) +
                     balkenBlok('Maateenheid', c.stelsels.map(function (x) {
                       return { v: x.v, l: x.v === 'imperiaal' ? T('voet') : T('meter'), n: x.n };
                     }), { totaal: c.aantal }) +
                     balkenBlok('Valuta', c.munten, { totaal: c.aantal });

    el.innerHTML = kern +
      '<div class="dbraster dbraster--twee">' + trechter + modelBlok + '</div>' +
      prijsBlok +
      '<h2 class="dbsec">' + esc(T('Wat men kiest')) + '</h2>' +
      '<div class="dbraster">' + optieBlok + keuzes + '</div>' +
      afhakers +
      '<h2 class="dbsec">' + esc(T('Hoe men kijkt')) + '</h2>' +
      '<div class="dbraster">' + voorkeuren + '</div>';
  }

  global.NGJachtDashboard = {
    cijfers: cijfers, demo: demo, teken: teken,
    GROEPEN: GROEPEN, TRECHTER: TRECHTER
  };
})(typeof window !== 'undefined' ? window : globalThis);
