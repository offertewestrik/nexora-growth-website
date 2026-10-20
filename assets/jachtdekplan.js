/* Dekplan (general arrangement) van de jachtconfigurator.
 *
 * WAAROM DIT GETEKEND WORDT EN NIET GERENDERD
 * De dekindeling is het blad waar een koper in dit segment het langst naar
 * kijkt: hier ziet hij of zijn gezin past, waar de hutten liggen en wat de
 * bemanning voor ruimte heeft. Het was ook het enige blad dat nog helemaal
 * ontbrak.
 *
 * Als render zou het tien schepen maal twee dekvormen maal alle optiecombinaties
 * zijn, en het zou stilstaan zodra iemand een hut meer wil. Getekend uit
 * jacht-data.js klopt het altijd met de lengte, de breedte, het aantal hutten,
 * het aantal dekken en de gekozen opties - en het verandert mee bij elke klik.
 * Dezelfde afweging als bij het boven- en vooraanzicht in jachtaanzichten.js,
 * en de tekening hoort er ook zichtbaar bij: zelfde doek, zelfde letter,
 * zelfde stempel SCHEMATISCH.
 *
 * WAT HET WEL EN NIET IS
 * Het is een indelingsschema, geen werftekening. De verdeling van de ruimtes
 * volgt de gangbare indeling in dit segment - machinekamer achterin,
 * gastenhutten middenscheeps onder de waterlijn, bemanning vooruit bij kleine
 * schepen en achter de machinekamer bij grote, eigenaarshut op het hoofddek
 * zodra het schip breed genoeg is - maar de werf bepaalt de werkelijke
 * indeling. Dat staat onder de tekening, niet in de kleine lettertjes.
 *
 * WELKE DEKKEN ER GETEKEND WORDEN
 * Onderdek en hoofddek altijd; daarboven `dekkenAantal - 2` tussendekken uit
 * jacht-data.js, en als bovenste het flybridge zodra de bezoeker dat als
 * dekvorm kiest. Bij de Tri-deck 29 komt dat uit op onderdek, hoofddek,
 * brugdek en flybridge - precies wat de naam belooft.
 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var f1 = function (x) { return (Math.round(x * 10) / 10).toString().replace('.', (typeof window !== 'undefined' && window.NGTaal && window.NGTaal.decimaal) ? window.NGTaal.decimaal() : ','); };
  /* Een lengte met zijn eenheid erachter, in het stelsel dat de bezoeker koos.
     De maat wordt hier niet zelf uitgeschreven: dan zou dit de derde plek in
     de codebase zijn waar een komma en een 'm' aan elkaar geplakt worden, en
     op de Engelse pagina stond daardoor eerder "car 4.5 m" naast "28,9 m". */
  var maat = function (x, decimalen) {
    var E = (typeof window !== 'undefined') && window.NGEenheden;
    return E ? E.lengte(x, decimalen)
             : f1(x) + ' m';
  };


  function vindOp(lijst, val) {
    for (var i = 0; i < lijst.length; i++) if (lijst[i].v === val) return lijst[i];
    return lijst[0];
  }

  var teller = 0;

  /* Kleuren uit hetzelfde palet als de andere aanzichten. `ruim` is de
     algemene ruimte, `slaap` de hutten, `dienst` alles wat de bemanning en de
     techniek is, `optie` wat de bezoeker zelf heeft aangevinkt. Die laatste
     springt eruit, want dat is waar hij naar zoekt. */
  /* Twee paletten voor dezelfde tekening.

     Op het scherm staat het dekplan op een donker doek, want daar staat het
     tussen de renders en die zijn ook donker. Op papier klopt dat niet: een
     zwart vlak op een crème blad leest als een screenshot dat iemand in het
     document heeft geplakt, en de dunne lichte lijnen die op een scherm
     helder zijn, lopen in de druk dicht.

     Vandaar een tweede palet, inkt op ivoor, met dezelfde tekening eromheen.
     De aanroeper kiest: NGJachtDekplan.svg(st, D, { licht: true }).

     De sleutels zijn in beide paletten dezelfde, dus de zesenveertig plekken
     die eruit lezen hoeven niets te weten van de keuze. */
  var PALET = {
    donker: {
      doek: '#11151b', dek: '#1b222b', lijn: '#3d4a57', letter: '#9aa3ad',
      ruim: '#2b3541', slaap: '#33404e', dienst: '#232c36', optie: (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#FFC400'),
      water: '#2f6f86', rand: '#5c6774'
    },
    licht: {
      doek: '#F7F4EC', dek: '#FFFFFF', lijn: '#C4BCA6', letter: '#4A5560',
      ruim: '#EAE4D4', slaap: '#DED6C2', dienst: '#F1EDE1', optie: (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#FFC400'),
      water: '#CBDDE4', rand: '#A79E88'
    }
  };
  var KL = {};
  function zetPalet(licht) {
    var p = licht ? PALET.licht : PALET.donker;
    Object.keys(p).forEach(function (k) { KL[k] = p[k]; });
  }
  zetPalet(false);

  /* Naam en verhoudingen per dek, van onder naar boven. `breed` is het deel
     van de scheepsbreedte, `van` en `tot` het deel van de lengte. Hoe hoger
     het dek, hoe smaller en korter - dat is geen stijl maar de vorm van een
     schip, en het is de reden dat een jacuzzi op het bovendek zoveel minder
     ruimte heeft dan het achterdek waar hij naast zou passen. */
  var VORM = {
    onderdek:      { breed: 0.88, van: 0.03, tot: 0.94 },
    hoofddek:      { breed: 1.00, van: 0.00, tot: 1.00 },
    brugdek:       { breed: 0.82, van: 0.10, tot: 0.86 },
    bovendek:      { breed: 0.74, van: 0.15, tot: 0.80 },
    zonnedek:      { breed: 0.66, van: 0.19, tot: 0.75 },
    eigenaarsdek:  { breed: 0.60, van: 0.22, tot: 0.71 },
    observatiedek: { breed: 0.54, van: 0.25, tot: 0.67 },
    flybridge:     { breed: 0.62, van: 0.22, tot: 0.74 }
  };
  var TUSSEN = ['brugdek', 'bovendek', 'zonnedek', 'eigenaarsdek', 'observatiedek'];
  var TITEL = {
    onderdek: 'ONDERDEK', hoofddek: 'HOOFDDEK', brugdek: 'BRUGDEK',
    bovendek: 'BOVENDEK', zonnedek: 'ZONNEDEK', eigenaarsdek: 'EIGENAARSDEK',
    observatiedek: 'OBSERVATIEDEK', flybridge: 'FLYBRIDGE'
  };
  /* Waar een dek naar heet, hoort ook iets te staan. Zonder deze tabel kreeg
     de Giga 120 vier dekken op een rij met precies dezelfde drie hokjes erin -
     achterdek, skylounge, lounge - en dat is geen dekplan maar behang. */
  var MIDDEN = {
    brugdek: 'SKYLOUNGE', bovendek: 'BOVENSALON', zonnedek: 'ZONNESALON',
    eigenaarsdek: 'EIGENAARSSUITE', observatiedek: 'PANORAMALOUNGE'
  };
  var VOOR = {
    brugdek: 'KAARTENKAMER', bovendek: 'LOUNGE', zonnedek: 'BAR',
    eigenaarsdek: 'PRIVEDEK', observatiedek: 'UITKIJK'
  };

  /* Welke dekken dit schip in deze uitvoering heeft. */
  function dekkenVan(m, dekV) {
    var rij = ['onderdek', 'hoofddek'];
    var extra = Math.max(0, (m.dekkenAantal || 1) - 2);
    for (var i = 0; i < extra && i < TUSSEN.length; i++) rij.push(TUSSEN[i]);
    if (dekV === 'flybridge' || dekV === 'flybridge-ttop') rij.push('flybridge');
    return rij;
  }

  /* De eigenaarshut staat op het hoofddek zodra het schip breed genoeg is voor
     een hut over de volle breedte. Onder die maat ligt hij vooruit onderdeks,
     en dan is er op het hoofddek plaats voor een ruimer voordek. Achtentwintig
     meter is waar dat in dit segment omslaat. */
  function eigenaarBoven(m) { return m.loa >= 28; }

  /* Heeft het schip een heel eigenaarsdek, dan ligt de eigenaarssuite daar en
     niet ook nog eens vooruit op het hoofddek. Twee eigenaarshutten op een vel
     is geen luxe maar een fout, en op de Giga 120 stond hij er twee keer. Op
     het hoofddek komt dan de VIP-hut over de volle breedte - de indeling die
     werven in die maat aanhouden. */
  function eigenaarOpEigenDek(lijst) { return lijst.indexOf('eigenaarsdek') > -1; }

  /* ---------- tekengereedschap ---------- */

  /* De contour van een dek. Achter recht afgesneden, naar voren toelopend -
     dezelfde vorm als het bovenaanzicht, zodat de bladen bij elkaar horen. */
  function dekPad(x0, x1, mid, hb) {
    var L = x1 - x0, bMax = x0 + L * 0.42, sp = hb * 0.86;
    return 'M ' + x0 + ' ' + (mid - sp) +
      ' C ' + (x0 + L * 0.16) + ' ' + (mid - hb) + ', ' + (bMax - L * 0.08) + ' ' + (mid - hb) + ', ' + bMax + ' ' + (mid - hb) +
      ' C ' + (x0 + L * 0.72) + ' ' + (mid - hb * 0.94) + ', ' + (x1 - L * 0.12) + ' ' + (mid - hb * 0.42) + ', ' + x1 + ' ' + mid +
      ' C ' + (x1 - L * 0.12) + ' ' + (mid + hb * 0.42) + ', ' + (x0 + L * 0.72) + ' ' + (mid + hb * 0.94) + ', ' + bMax + ' ' + (mid + hb) +
      ' C ' + (bMax - L * 0.08) + ' ' + (mid + hb) + ', ' + (x0 + L * 0.16) + ' ' + (mid + hb) + ', ' + x0 + ' ' + (mid + sp) + ' Z';
  }

  /* Een ruimte: rechthoek met een naam erin. Past de naam niet, dan komt hij
     er niet half in te staan maar helemaal niet - een afgekapt woord leest als
     een fout in de tekening. */
  function ruimte(x, y, b, h, naam, vulling, kleurLetter) {
    if (b < 6 || h < 6) return '';
    /* Op het goud van een gekozen optie is de grijze letter onleesbaar; daar
       hoort de donkere kleur van het doek. Dit een keer hier regelen scheelt
       het bij elke aanroep te moeten onthouden. */
    if (!kleurLetter && vulling === KL.optie) kleurLetter = KL.doek;
    var o = '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + b.toFixed(1) +
      '" height="' + h.toFixed(1) + '" rx="3" fill="' + vulling + '" stroke="' + KL.lijn + '" stroke-width="1"/>';
    var maat = Math.min(11, Math.max(7, h * 0.42));
    if (naam && b > naam.length * maat * 0.60 && h >= 13) {
      o += '<text x="' + (x + b / 2).toFixed(1) + '" y="' + (y + h / 2 + maat * 0.36).toFixed(1) +
        '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="' + maat.toFixed(1) +
        '" fill="' + (kleurLetter || KL.letter) + '">' + esc(naam) + '</text>';
    }
    return o;
  }

  /* Een rij gelijke ruimtes naast elkaar - de gastenhutten, de bemanningshutten.
     Krijgt elke hut zijn eigen hokje, want "vier hutten" als één vlak met een
     getal erin is precies het soort tekening waar een koper niets aan heeft. */
  function rij(x0, x1, y, h, n, naam, vulling) {
    if (n < 1) return '';
    var br = (x1 - x0) / n;
    /* Past de naam niet in een hokje, dan is het geen hut meer maar een
       streepje. Bij de bemanningshutten van de Giga 120 gebeurde dat: een kam
       van lege vakjes waar niemand iets uit afleest. Dan liever een blok met
       het aantal erin - dat zegt wel wat. De maat is de naam zelf en niet een
       vast getal, want 'CREW' past waar 'EIGENAARSHUT' allang niet meer past. */
    if (br - 3 < naam.length * 6.6 + 6) {
      return ruimte(x0, y, x1 - x0, h, n + '\u00d7 ' + naam, vulling);
    }
    var o = '';
    for (var i = 0; i < n; i++) {
      o += ruimte(x0 + i * br + 1.5, y, br - 3, h, naam, vulling);
    }
    return o;
  }

  function merk(x, y, r, naam) {
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) +
      '" fill="' + KL.optie + '" opacity=".92"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + (y + r + 12).toFixed(1) + '" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="9" fill="' + KL.optie + '">' + esc(naam) + '</text>';
  }

  /* ---------- de dekken zelf ---------- */

  /* De ruimtes worden op de rompcontour afgeknipt, de merktekens niet: een
     stabilisatorvin steekt uit de romp en een kraan hangt over de reling. Als
     alles geknipt werd verdween de vin; werd er niets geknipt, dan stak de
     eigenaarshut door de boeg heen. Vandaar twee stapels. */
  function tekenDek(naam, m, opties, x0, x1, mid, hb, heeftStuurhuis, laatsteDek, eersteBovenDek, eigenDek) {
    var L = x1 - x0, o = '', buiten = '', heeftBootdek = !!eersteBovenDek;
    var G = function (a) { return x0 + L * a; };          // deel van de lengte
    var B = function (a) { return hb * a; };              // deel van de halve breedte

    if (naam === 'onderdek') {
      /* Achterin de machinekamer, dan de gastenhutten, vooruit de bemanning.
         Bij grote schepen gaat de bemanning juist achter de machinekamer: daar
         is de gang naar de kombuis kort en slapen de gasten er niet naast. */
      var bemAchter = m.loa >= 45;
      var mkA = G(bemAchter ? 0.18 : 0.04), mkV = G(bemAchter ? 0.42 : 0.30);
      o += ruimte(mkA, mid - B(0.86), mkV - mkA, B(1.72), 'MACHINEKAMER', KL.dienst);
      if (bemAchter) {
        o += ruimte(G(0.02), mid - B(0.80), G(0.16) - G(0.02), B(1.60), '', KL.dienst);
        o += rij(G(0.02), G(0.16), mid - B(0.80), B(0.74), Math.min(m.bemanningHutten, 6), 'CREW', KL.dienst);
        o += rij(G(0.02), G(0.16), mid + B(0.06), B(0.74), Math.max(0, Math.min(m.bemanningHutten - 6, 6)), 'CREW', KL.dienst);
      }
      var gast = m.hutten - (eigenaarBoven(m) ? 1 : 0);
      /* Niet doortrekken tot in de boegversmalling: daar knipt de contour de
         hutten en hun naam doormidden, en een half woord leest als een fout. */
      var gA = mkV + L * 0.02, gV = G(bemAchter ? 0.84 : 0.72);
      o += rij(gA, gV, mid - B(0.84), B(0.78), Math.ceil(gast / 2), 'HUT', KL.slaap);
      o += rij(gA, gV, mid + B(0.06), B(0.78), Math.floor(gast / 2), 'HUT', KL.slaap);
      o += '<text x="' + ((gA + gV) / 2).toFixed(1) + '" y="' + (mid + 4) +
        '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="' + KL.rand + '">GANG</text>';
      if (!bemAchter) {
        o += ruimte(G(0.76), mid - B(0.70), G(0.96) - G(0.76), B(1.40), 'BEMANNING', KL.dienst);
      }
      /* De opties die onder de waterlijn zitten horen op dit blad, en nergens
         anders: dat is precies waar de renders ze ook laten zien. */
      if (opties.indexOf('stabilisatoren') > -1) {
        buiten += merk(G(0.46), mid - B(1.14), 5, 'VIN');
        buiten += merk(G(0.46), mid + B(1.14), 5, 'VIN');
      }
      if (opties.indexOf('boegschroef') > -1) buiten += merk(G(0.90), mid, 5, 'BOEGSCHROEF');
      if (opties.indexOf('watermaker') > -1) buiten += merk((mkA + mkV) / 2 - L * 0.04, mid - B(0.40), 4.5, 'WATERMAKER');
      if (opties.indexOf('airco') > -1) buiten += merk((mkA + mkV) / 2 + L * 0.04, mid - B(0.40), 4.5, 'AIRCO');

    } else if (naam === 'hoofddek') {
      /* Van achter naar voor, in een rij, met een lopende grens. Eerder werd
         het stuurhuis er achteraf overheen gelegd op de plek van de eetsalon;
         op de Flybridge 24 - stuurhuis op het hoofddek en lang genoeg voor een
         eetsalon - lagen ze precies over elkaar en zag je alleen de bovenste.
         Een ruimte die er wel is maar onzichtbaar, is erger dan een ruimte die
         er niet is. */
      var na = G(0.02);
      o += ruimte(na, mid - B(0.78), G(0.24) - na, B(1.56), 'ACHTERDEK', KL.ruim); na = G(0.24);
      o += ruimte(na, mid - B(0.84), G(0.60) - na, B(1.68), 'SALON', KL.ruim); na = G(0.60);
      if (heeftStuurhuis) {
        /* Staat het stuurhuis op dit dek, dan neemt het de plek waar bij een
           groter schip de eetsalon zit. Op een schip van deze maat is er ook
           maar een salon, en daar wordt in gegeten. */
        o += ruimte(na, mid - B(0.84), G(0.71) - na, B(1.68), 'STUURHUIS', KL.dienst); na = G(0.71);
      } else if (m.loa >= 23) {
        o += ruimte(na, mid - B(0.84), G(0.71) - na, B(1.68), 'EETSALON', KL.ruim); na = G(0.71);
      }
      if (m.loa >= 19) {
        o += ruimte(na, mid - B(0.84), G(0.80) - na, B(0.80), 'KOMBUIS', KL.dienst);
        o += ruimte(na, mid + B(0.04), G(0.80) - na, B(0.80), 'ENTREE', KL.ruim); na = G(0.80);
      }
      if (eigenaarBoven(m)) {
        o += ruimte(na, mid - B(0.80), G(0.94) - na, B(1.60),
                    eigenDek ? 'VIP-HUT' : 'EIGENAARSHUT', KL.slaap);
      } else {
        o += ruimte(na, mid - B(0.70), G(0.96) - na, B(1.40), 'VOORDEK', KL.ruim);
      }
      if (opties.indexOf('zwemplateau') > -1) {
        o += ruimte(x0 - L * 0.045, mid - B(0.62), L * 0.045, B(1.24), '', KL.optie);
        o += '<text x="' + (x0 - L * 0.022).toFixed(1) + '" y="' + (mid + B(0.62) + 13).toFixed(1) +
          '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="' + KL.optie + '">PLATEAU</text>';
      }
      /* Zonder bootdek ligt de bijboot op het voordek met de kraan ernaast -
         zo staat hij ook op de optierenders van de kleine klasse. Heeft het
         schip wel een bootdek, dan ligt hij daar en niet hier. */
      if (opties.indexOf('tenderkraan') > -1 && !heeftBootdek) {
        o += ruimte(na + L * 0.01, mid - B(0.34), L * 0.10, B(0.68), 'TENDER', KL.optie);
        buiten += merk(na + L * 0.005, mid + B(0.52), 4.5, 'KRAAN');
      }

    } else {
      /* Alles boven het hoofddek. Drie zones, altijd dezelfde: achter, midden,
         voor. Een optie neemt een zone over in plaats van er bovenop te
         liggen - een gouden blok over een ruimtenaam heen leest als een fout
         in de tekening in plaats van als een keuze.

         Wie op dit dek wat krijgt, volgt de indeling die werven aanhouden. Het
         bad staat op het hoogste dek, want daar is de zon en daar hoort het.
         De bijboot staat op het BOOTDEK - het eerste dek boven het hoofddek -
         en niet bovenop, want daar staat de kraan die hem over de reling tilt
         en daar zit hij niet tussen de ligbedden. Heeft het schip geen
         bootdek, dan ligt hij op het voordek van het hoofddek; dat is precies
         wat je op een flybridgejacht van vierentwintig meter ziet. En het
         zwembad neemt de achterzone van het hoogste dek, dus het botst niet
         met de bijboot - op een schip dat allebei heeft zijn dat twee
         verschillende dekken. */
      var bovenste = (naam === 'flybridge' || naam === laatsteDek);
      var bootdek = (naam === eersteBovenDek);
      var tenderHier = bootdek && opties.indexOf('tenderkraan') > -1;
      var badHier = bovenste && opties.indexOf('zwembad') > -1;
      var jacuzziHier = bovenste && opties.indexOf('jacuzzi') > -1;

      if (badHier) {
        o += ruimte(G(0.03), mid - B(0.80), G(0.34) - G(0.03), B(1.60), '', KL.ruim);
        o += ruimte(G(0.08), mid - B(0.50), G(0.29) - G(0.08), B(1.00), 'ZWEMBAD', KL.water);
      } else if (tenderHier) {
        o += ruimte(G(0.03), mid - B(0.80), G(0.34) - G(0.03), B(1.60), '', KL.ruim);
        o += ruimte(G(0.07), mid - B(0.40), G(0.28) - G(0.07), B(0.80), 'TENDER', KL.optie);
        buiten += merk(G(0.055), mid + B(0.62), 4.5, 'KRAAN');
      } else {
        o += ruimte(G(0.03), mid - B(0.80), G(0.34) - G(0.03), B(1.60), 'ACHTERDEK', KL.ruim);
      }

      if (jacuzziHier) {
        o += ruimte(G(0.36), mid - B(0.84), G(0.72) - G(0.36), B(1.68), '', KL.ruim);
        o += ruimte(G(0.44), mid - B(0.46), G(0.64) - G(0.44), B(0.92), 'JACUZZI', KL.water);
      } else {
        /* Niet 'ZONNEDEK': dat is bij een schip met vijf dekken of meer de
           naam van een heel dek, en twee dingen op hetzelfde vel die hetzelfde
           heten is een tekening waar je bij moet nadenken. */
        o += ruimte(G(0.36), mid - B(0.84), G(0.72) - G(0.36), B(1.68),
                    bovenste ? 'LIGBEDDEN' : (MIDDEN[naam] || 'SKYLOUNGE'), KL.ruim);
      }

      if (heeftStuurhuis) {
        o += ruimte(G(0.74), mid - B(0.60), G(0.94) - G(0.74), B(1.20), 'STUURHUIS', KL.dienst);
      } else {
        o += ruimte(G(0.74), mid - B(0.55), G(0.92) - G(0.74), B(1.10),
                    bovenste ? 'STUURSTAND' : (VOOR[naam] || 'LOUNGE'), KL.ruim);
      }
      if (bovenste) {
        if (opties.indexOf('zonnepanelen') > -1) buiten += merk(G(0.86), mid - B(0.74), 4.5, 'ZON');
        if (opties.indexOf('satelliet') > -1) buiten += merk(G(0.86), mid + B(0.74), 4.5, 'SAT');
      }
    }
    return { binnen: o, buiten: buiten };
  }

  /* ---------- het blad ---------- */

  var BW = 1200;

  function dekplan(k, D, opties_) {
    /* Het palet wordt per aanroep gezet en na afloop teruggezet, zodat een
       lichte druktekening de schermversie niet verandert. */
    zetPalet(!!(opties_ && opties_.licht));
    var m = vindOp(D.modellen, k.model);
    var dekV = (k.dek || (m.dekken && m.dekken[0]));
    var opties = k.opties || [];
    var u = 'p' + (++teller);

    /* Zonder maten valt er niets te tekenen dat klopt. Net als bij het boven-
       en vooraanzicht is een lege melding dan eerlijker dan een plattegrond
       die met nullen rekent. */
    if (m.breedte === null || m.loa === null || m.hutten === null) { zetPalet(false); return null; }

    var lijst = dekkenVan(m, dekV);
    var LINKS = 118, RECHTS = 40, VLAK = BW - LINKS - RECHTS;
    var schaal = VLAK / m.loa;
    var volleHB = Math.min((m.breedte * schaal) / 2, 74);   // begrensd: anders lopen de bladen in elkaar
    var REGEL = volleHB * 2 + 62;
    var KOP = 52, VOET = 40;
    var BH = KOP + lijst.length * REGEL + VOET;

    var o = '<rect width="' + BW + '" height="' + BH.toFixed(0) + '" fill="' + KL.doek + '"/>';

    /* De maatlijn staat één keer bovenaan en geldt voor alle bladen: ze staan
       op dezelfde schaal, dus ze zijn onderling te vergelijken. Dat is het hele
       punt van een dekplan op één vel. */
    var x0v = LINKS, x1v = LINKS + m.loa * schaal;
    o += '<line x1="' + x0v + '" y1="30" x2="' + x1v.toFixed(1) + '" y2="30" stroke="' + KL.rand + '" stroke-width="1"/>' +
      '<line x1="' + x0v + '" y1="24" x2="' + x0v + '" y2="36" stroke="' + KL.rand + '"/>' +
      '<line x1="' + x1v.toFixed(1) + '" y1="24" x2="' + x1v.toFixed(1) + '" y2="36" stroke="' + KL.rand + '"/>' +
      '<text x="' + ((x0v + x1v) / 2).toFixed(1) + '" y="20" text-anchor="middle" ' +
      'font-family="IBM Plex Mono, monospace" font-size="13" fill="' + KL.letter + '">' +
      maat(m.loa) + ' over alles &#183; ' + maat(m.breedte) + ' breedte</text>';

    /* Van boven naar beneden tekenen, zoals een werf een dekplan opmaakt: het
       hoogste dek bovenaan het vel. */
    var omgekeerd = lijst.slice().reverse();
    /* Het stuurhuis staat op het hoogste dek dat er een heeft: bij een schip
       met drie dekken of meer op het brugdek, anders op het hoofddek. Twee
       stuurhuizen tekenen zou een schip suggereren dat er twee heeft. */
    /* Het hoogste dek, en het eerste dek boven het hoofddek. Dat tweede is het
       bootdek: daar staat de kraan met de bijboot. Bestaat het niet, dan is er
       geen bootdek en ligt de bijboot op het voordek. */
    var hoogste = lijst[lijst.length - 1];
    var eigenDek = eigenaarOpEigenDek(lijst);
    var bootDek = null;
    for (var bd = 0; bd < lijst.length; bd++) {
      if (lijst[bd] !== 'onderdek' && lijst[bd] !== 'hoofddek' && lijst[bd] !== hoogste) { bootDek = lijst[bd]; break; }
    }
    var stuurDek = null;
    if (m.loa >= 19) {
      for (var s = omgekeerd.length - 1; s >= 0; s--) {
        if (omgekeerd[s] === 'onderdek') continue;
        if (omgekeerd[s] === 'hoofddek') { stuurDek = 'hoofddek'; continue; }
        if (omgekeerd[s] !== 'flybridge') { stuurDek = omgekeerd[s]; break; }
      }
    }

    omgekeerd.forEach(function (naam, i) {
      var V = VORM[naam] || VORM.hoofddek;
      var mid = KOP + i * REGEL + REGEL / 2 - 8;
      var hb = volleHB * V.breed;
      var dx0 = LINKS + m.loa * schaal * V.van, dx1 = LINKS + m.loa * schaal * V.tot;

      var pad = dekPad(dx0, dx1, mid, hb), knip = u + 'k' + i;
      o += '<clipPath id="' + knip + '"><path d="' + pad + '"/></clipPath>';
      o += '<path d="' + pad + '" fill="' + KL.dek + '" stroke="' + KL.lijn + '" stroke-width="2"/>';
      var st2 = tekenDek(naam, m, opties, dx0, dx1, mid, hb, stuurDek === naam, hoogste, bootDek, eigenDek);
      o += '<g clip-path="url(#' + knip + ')">' + st2.binnen + '</g>' + st2.buiten;
      /* De contour er nog een keer overheen: het knippen legt de ruimtes tot
         precies op de lijn, en dan is de romplijn zelf half weggevallen. */
      o += '<path d="' + pad + '" fill="none" stroke="' + KL.lijn + '" stroke-width="2"/>';

      o += '<text x="14" y="' + (mid - 4).toFixed(1) + '" font-family="IBM Plex Mono, monospace" ' +
        'font-size="12" fill="' + KL.letter + '" letter-spacing="1">' + TITEL[naam] + '</text>';
      /* Ook dit regeltje in hoofdletters: de vertaallaag raakt korte woorden
         met kleine letters alleen tussen > en <, en dit staat midden in een
         tekst. In kleine letters bleef er op de Engelse pagina "4 hutten" en
         "eigenaarshut" onder een verder Engels dekplan staan. */
      var onder = naam === 'onderdek'
        ? (m.hutten - (eigenaarBoven(m) ? 1 : 0)) + ' HUTTEN'
        : naam === 'hoofddek'
        ? (eigenaarBoven(m) ? (eigenDek ? 'VIP-HUT' : 'EIGENAARSHUT') : 'VOORDEK')
        : '';
      if (onder) {
        o += '<text x="14" y="' + (mid + 12).toFixed(1) + '" font-family="IBM Plex Mono, monospace" ' +
          'font-size="10" fill="' + KL.rand + '">' + esc(onder) + '</text>';
      }
      if (i < omgekeerd.length - 1) {
        o += '<line x1="14" y1="' + (KOP + (i + 1) * REGEL - 6).toFixed(1) + '" x2="' + (BW - 24) +
          '" y2="' + (KOP + (i + 1) * REGEL - 6).toFixed(1) + '" stroke="' + KL.lijn +
          '" stroke-width="1" stroke-dasharray="3 6" opacity=".6"/>';
      }
    });

    /* De telling in hoofdletters, net als de andere labels op de tekening. Dat
       is niet alleen stijl: de vertaallaag vervangt korte woorden alleen
       tussen > en <, en deze vier staan midden in een zin. In hoofdletters
       mogen ze overal vervangen worden, en dan klopt dit blad ook op de
       Engelse pagina. */
    o += '<text x="14" y="' + (BH - 14).toFixed(1) + '" font-family="IBM Plex Mono, monospace" ' +
      'font-size="11" fill="' + KL.rand + '">GASTEN ' + m.gasten + ' &#183; HUTTEN ' + m.hutten +
      ' &#183; BADKAMERS ' + m.badkamers + ' &#183; BEMANNINGSHUTTEN ' + m.bemanningHutten + '</text>';
    o += '<text x="' + (BW - 24) + '" y="' + (BH - 14).toFixed(1) + '" text-anchor="end" ' +
      'font-family="IBM Plex Mono, monospace" font-size="11" fill="' + KL.rand +
      '" letter-spacing="1">DEKPLAN &#183; SCHEMATISCH</text>';

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + BW + ' ' + BH.toFixed(0) + '" ' +
      'role="img" aria-label="Dekplan van de ' + esc(m.l) + ' met ' + lijst.length + ' dekken">' +
      o + '</svg>';
    zetPalet(false);          // terug naar het scherm
    return svg;
  }

  global.NGJachtDekplan = { svg: dekplan, dekken: dekkenVan, eigenaarBoven: eigenaarBoven };
})(typeof window !== 'undefined' ? window : globalThis);
