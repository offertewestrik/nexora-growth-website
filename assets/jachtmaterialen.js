/* Materiaalstaat van het interieur — de stalen naast elkaar.
 *
 * WAAROM DIT ER IS
 * Hout en stoffering stuurden de salonrender; de vloer, de wanden, het marmer,
 * het beslag en het licht stonden vast. Dat zijn precies de vijf waar een
 * koper in dit segment over doorvraagt, en ze zijn niet te renderen: de salon
 * bestaat in tweehonderd uitvoeringen (vijf houtsoorten maal vier stofferingen
 * maal tien modellen) en er vijf keuzes bij renderen zou dat tweehonderdduizend
 * maken.
 *
 * Dus komen ze als materiaal in beeld en niet als foto - zoals een werf ze op
 * tafel legt: een staal met de naam erbij, en eronder waarom je het zou
 * kiezen. Dat is eerlijker dan een render die doet alsof, en het is het blad
 * dat in het dossier meegaat naar de werf.
 *
 * DE GOUDEN STIP
 * Twee van de zeven stalen stuurden de salonrender werkelijk; vijf niet. Die
 * twee krijgen een stip en onderaan staat wat die stip betekent. Zonder dat
 * onderscheid zou dit blad suggereren dat de foto ernaast alle zeven toont, en
 * dat is precies de belofte die deze configurator nergens doet.
 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  function vindOp(lijst, val) {
    if (!lijst) return null;
    for (var i = 0; i < lijst.length; i++) if (lijst[i].v === val) return lijst[i];
    return lijst[0];
  }

  /* Twee paletten, net als bij het dekplan: op het scherm donker tussen de
     renders, op papier inkt op ivoor. Een zwart blad in een crème brochure
     leest als een screenshot en niet als een staalkaart. */
  var PALET = {
    donker: { doek: '#11151b', vak: '#1b222b', lijn: '#3d4a57', letter: '#9aa3ad',
              kop: '#e8e3d8', rand: '#5c6774', merk: (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#FFC400') },
    licht:  { doek: '#F7F4EC', vak: '#FFFFFF', lijn: '#DCD5C2', letter: '#646C78',
              kop: '#17222E', rand: '#B3AA95', merk: '#A87F3D' }
  };
  var KL = {};
  function zetPalet(licht) {
    var p = licht ? PALET.licht : PALET.donker;
    Object.keys(p).forEach(function (k) { KL[k] = p[k]; });
  }
  zetPalet(false);

  /* De zeven posten, in de vololgorde waarin een werf ze op tafel legt: eerst
     waar je op zit en loopt, dan waar je tegenaan kijkt, dan het licht.
     `kamer` zegt wélke opname deze keuze volgt. Of die opname er voor déze
     samenstelling ook werkelijk is, hangt van de combinatie af: de badkamer en
     het licht zijn compleet, de salon is dat niet. Dat wordt hieronder per
     samenstelling opgezocht en niet hier vastgelegd - een stip die altijd
     staat is een belofte die de beeldbank niet altijd waarmaakt. */
  var POSTEN = [
    { g: 'interieurhout', l: 'INTERIEURHOUT', kamer: 'salon' },
    { g: 'stoffering',    l: 'STOFFERING',    kamer: 'salon' },
    { g: 'vloer',         l: 'VLOER',         kamer: 'salon' },
    { g: 'wandafwerking', l: 'WANDAFWERKING', kamer: 'salon' },
    { g: 'marmer',        l: 'MARMER BADKAMER', kamer: 'bad' },
    { g: 'metaal',        l: 'METAALAFWERKING', kamer: 'bad' },
    { g: 'verlichting',   l: 'VERLICHTING',   kamer: 'licht' }
  ];

  /* Tekst die niet in één regel past, over meer regels. Afbreken op woorden en
     niet midden in een woord: een half woord op een staalkaart leest als een
     fout in de tekening. */
  function regels(tekst, perRegel, maxRegels) {
    var woorden = String(tekst || '').split(' '), uit = [], regel = '';
    for (var i = 0; i < woorden.length; i++) {
      var poging = regel ? regel + ' ' + woorden[i] : woorden[i];
      if (poging.length > perRegel && regel) { uit.push(regel); regel = woorden[i]; }
      else regel = poging;
      if (uit.length === maxRegels) break;
    }
    if (regel && uit.length < maxRegels) uit.push(regel);
    return uit;
  }

  var BW = 1200;

  /* Waar het staal van deze post vandaan komt. Er staat van elke afwerking een
     macro-opname in de beeldbank - hetzelfde soort opname als van de drie
     dekafwerkingen - en die zegt meer dan een blokje kleur: travertijn en
     tapijt zijn allebei zandkleurig en niet uit elkaar te houden zolang je
     alleen de kleur ziet.

     Het adres gaat als <image> de tekening in. Dat werkt in de browser, maar
     niet in een SVG die als los beeld wordt ingeladen - en zo gaat de
     tekening de PDF in. Daar wordt daarom een eigen oplosser meegegeven die
     data-adressen teruggeeft; die laden wel. Levert de oplosser niets, dan
     blijft het gekleurde vlak staan en klopt het blad nog steeds. */
  function staalVan(post, keuze, opties) {
    var op = (opties && opties.staal) ||
      function (groep, waarde) {
        var B = global.NGJachtBeelden;
        return (B && B.los) ? B.los('materiaal', groep + '-' + waarde) : null;
      };
    try { return op(post.g, keuze.v) || null; } catch (e) { return null; }
  }

  /* De maat en de plek van elk staalvak, los opvraagbaar. De PDF heeft die
     nodig om te weten hoeveel beeld hij vooraf moet inladen, en het houdt de
     tekening en de opsomming aan één bron. */
  function vakken() {
    var kolommen = 4, breedte = 268, hoogte = 150, marge = 24, kopH = 74;
    return { kolommen: kolommen, breedte: breedte, hoogte: hoogte,
             marge: marge, kopH: kopH, staal: 62 };
  }

  function materialen(st, D, opties) {
    zetPalet(!!(opties && opties.licht));
    var m = vindOp(D.modellen, st.model);

    /* Welke kamers er voor déze samenstelling werkelijk zijn. Dat bepaalt waar
       de gouden stip komt te staan en wat de voetnoot eronder zegt.

       De PDF geeft het antwoord mee - die weet welke beelden hij heeft
       ingeladen - en op het scherm wordt het rechtstreeks aan de beeldbank
       gevraagd. Zo hoeft deze module niets over bestandsnamen te weten en kan
       de PDF hem gebruiken zonder een beeldbank bij zich te hebben. */
    var kamers = (opties && opties.kamers) || (function () {
      var B = global.NGJachtBeelden;
      if (!B) return {};
      return { salon: !!(B.salon && B.salon(st)),
               bad: !!(B.bad && B.bad(st)),
               licht: !!(B.licht && B.licht(st)) };
    })();

    var V = vakken();
    var kolommen = V.kolommen, breedte = V.breedte, hoogte = V.hoogte,
        marge = V.marge, kopH = V.kopH;
    var rijen = Math.ceil(POSTEN.length / kolommen);
    var BH = kopH + rijen * (hoogte + 16) + 44;

    var o = '<rect width="' + BW + '" height="' + BH + '" fill="' + KL.doek + '"/>';
    o += '<text x="' + marge + '" y="34" font-family="IBM Plex Mono, monospace" font-size="15" ' +
      'fill="' + KL.kop + '" letter-spacing="1">MATERIAALSTAAT &#183; INTERIEUR</text>';
    o += '<text x="' + marge + '" y="54" font-family="IBM Plex Mono, monospace" font-size="11" ' +
      'fill="' + KL.rand + '">' + esc(m.l) + '</text>';
    o += '<line x1="' + marge + '" y1="' + (kopH - 12) + '" x2="' + (BW - marge) + '" y2="' + (kopH - 12) +
      '" stroke="' + KL.lijn + '" stroke-width="1"/>';

    POSTEN.forEach(function (post, i) {
      var lijst = D[post.g];
      if (!lijst) return;
      var keuze = vindOp(lijst, st[post.g]);
      if (!keuze) return;
      var kx = marge + (i % kolommen) * (breedte + 16);
      var ky = kopH + Math.floor(i / kolommen) * (hoogte + 16);

      o += '<rect x="' + kx + '" y="' + ky + '" width="' + breedte + '" height="' + hoogte +
        '" rx="5" fill="' + KL.vak + '" stroke="' + KL.lijn + '" stroke-width="1"/>';
      /* Het staal zelf: de macro-opname als die er is, anders een blok in de
         kleur van de keuze. In allebei de gevallen een lijn eromheen, zodat
         een licht staal niet in het vak verdwijnt. */
      var staal = staalVan(post, keuze, opties);
      var sid = 'st' + i;
      if (staal) {
        o += '<clipPath id="' + sid + '"><rect x="' + (kx + 14) + '" y="' + (ky + 14) +
          '" width="62" height="62" rx="4"/></clipPath>' +
          '<image href="' + esc(staal) + '" xlink:href="' + esc(staal) + '" x="' + (kx + 14) +
          '" y="' + (ky + 14) + '" width="62" height="62" preserveAspectRatio="xMidYMid slice" ' +
          'clip-path="url(#' + sid + ')"/>' +
          '<rect x="' + (kx + 14) + '" y="' + (ky + 14) + '" width="62" height="62" rx="4" ' +
          'fill="none" stroke="' + KL.rand + '" stroke-width="1"/>';
      } else {
        o += '<rect x="' + (kx + 14) + '" y="' + (ky + 14) + '" width="62" height="62" rx="4" fill="' +
          (keuze.kleur || '#666') + '" stroke="' + KL.rand + '" stroke-width="1"/>';
      }
      o += '<text x="' + (kx + 88) + '" y="' + (ky + 28) + '" font-family="IBM Plex Mono, monospace" ' +
        'font-size="8.5" fill="' + KL.rand + '" letter-spacing="1">' + post.l + '</text>';
      regels(keuze.l, 20, 2).forEach(function (r, n) {
        o += '<text x="' + (kx + 88) + '" y="' + (ky + 46 + n * 15) + '" font-family="IBM Plex Mono, monospace" ' +
          'font-size="12" fill="' + KL.kop + '">' + esc(r) + '</text>';
      });
      if (kamers[post.kamer]) {
        o += '<circle cx="' + (kx + breedte - 16) + '" cy="' + (ky + 16) + '" r="4" fill="' + KL.merk + '"/>';
      }
      regels(keuze.noot || keuze.uit || '', 42, 3).forEach(function (r, n) {
        o += '<text x="' + (kx + 14) + '" y="' + (ky + 96 + n * 13) + '" font-family="IBM Plex Mono, monospace" ' +
          'font-size="8.5" fill="' + KL.letter + '">' + esc(r) + '</text>';
      });
    });

    /* De voetnoot telt wat er op dít blad werkelijk staat.

       Hij stond hier als vaste zin: "deze twee stuurt de salonrender werkelijk
       aan". Dat klopte toen alleen hout en stoffering een opname hadden. Sinds
       de salon ook de vloer en de wandafwerking volgt en er een badkamer en
       vier lichtstanden bij zijn gekomen, kan dat er tussen twee en zeven zijn
       - afhankelijk van of déze saloncombinatie gerenderd is. Een vaste zin
       zou dus de ene keer te weinig beloven en de andere keer te veel. */
    var gestipt = POSTEN.filter(function (p) { return st[p.g] && kamers[p.kamer]; }).length;
    var TELWOORD = ['geen', 'deze ene', 'deze twee', 'deze drie', 'deze vier',
                    'deze vijf', 'deze zes', 'alle zeven'];
    var voetnoot = gestipt >= POSTEN.length
      ? 'Alle zeven keuzes staan op dit blad in een opname: de salon, de badkamer en de lichtstand.'
      : (TELWOORD[gestipt] || gestipt) + ' ' +
        (gestipt === 1 ? 'keuze staat' : 'keuzes staan') + ' hierboven in een opname; ' +
        'de overige ' + (POSTEN.length - gestipt) + ' staan als staal en niet als foto.';
    var vy = BH - 20;
    o += '<circle cx="' + (marge + 5) + '" cy="' + (vy - 4) + '" r="4" fill="' + KL.merk + '"/>';
    o += '<text x="' + (marge + 18) + '" y="' + vy + '" font-family="IBM Plex Mono, monospace" ' +
      'font-size="9.5" fill="' + KL.rand + '">' + esc(voetnoot) + '</text>';
    o += '<text x="' + (BW - marge) + '" y="' + vy + '" text-anchor="end" ' +
      'font-family="IBM Plex Mono, monospace" font-size="9.5" fill="' + KL.rand +
      '" letter-spacing="1">MATERIAALSTAAT</text>';

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'viewBox="0 0 ' + BW + ' ' + BH + '" role="img" ' +
      'aria-label="Materiaalstaat van het interieur van de ' + esc(m.l) + '">' + o + '</svg>';
    zetPalet(false);          // terug naar het scherm
    return svg;
  }

  global.NGJachtMaterialen = { svg: materialen, POSTEN: POSTEN, vakken: vakken };
})(typeof window !== 'undefined' ? window : globalThis);
