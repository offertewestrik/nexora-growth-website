/* Sleepbare 360°-weergave uit een beeldenreeks, met de lakkleur in de browser.
 *
 * WAAROM EEN BEELDENREEKS EN GEEN 3D-MODEL
 * Een gereconstrueerd model is zo goed als zijn reconstructie, en die is bij een
 * jacht juist op de plekken zwak waar het oog naar kijkt: de opbouw wordt bol,
 * de raamband wordt een veeg. Een beeldenreeks heeft dat probleem niet, want
 * elk beeld is gewoon een render. Wat je sleept ziet er dus uit als de
 * bronrender en niet als een benadering ervan.
 *
 * WAAROM DIT EERDER NIET WERKTE, EN WAT ER MOET VERANDEREN
 * Er staan al vierentwintig sleepbeelden van de FB 24 in de beeldbank en die
 * zijn nooit ingebouwd. De reden is bij het slepen meteen te zien: elk beeld is
 * apart gegenereerd, dus het schip verandert van beeld tot beeld een beetje van
 * vorm. Stilstaand valt dat niet op, slepend morft het jacht.
 *
 * Beelden uit één doorlopende orbitvideo hebben dat niet: opeenvolgende
 * videobeelden zijn per definitie hetzelfde schip onder hetzelfde licht. Deze
 * weergave is dus bedoeld voor beelden uit zo'n video, en niet voor los
 * gegenereerde beelden.
 *
 * DE LAKKLEUR ZIT NIET IN DE BESTANDEN
 * Anders zou elke kleur zijn eigen reeks nodig hebben - zes rompkleuren maal
 * drie opbouwkleuren maal vierentwintig beelden maal tien modellen. In plaats
 * daarvan wordt de romp per beeldpunt omgekleurd op het moment dat het beeld
 * getoond wordt. Dat kan omdat de romplak in een studiobeeld eenduidig te
 * herkennen is: donker én blauw, tegen een neutrale achtergrond en wit gelcoat.
 * Op zee kan dat niet - dan is de zee zelf ook donker en blauw - en daarom moet
 * de orbit op een neutrale achtergrond gedraaid worden.
 *
 * Gebruik:
 *   NGJachtSpin.maak(houder, { map: './assets/media/jacht/360/fb24/',
 *                              aantal: 24, kleur: '#1d3b38' });
 */
(function (global) {
  'use strict';

  var STERKTE = 0.30;

  function hexNaarRgb(h) {
    h = String(h || '').replace('#', '');
    return [parseInt(h.slice(0, 2), 16) / 255,
            parseInt(h.slice(2, 4), 16) / 255,
            parseInt(h.slice(4, 6), 16) / 255];
  }

  function band(w, laag, hoog) {
    var v = (w - laag) / Math.max(hoog - laag, 1e-6);
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  /* Hoe zeker is dit beeldpunt romplak? Geen harde grens maar een overgang:
     een harde drempel geeft op de scheerlijn een kartelrand van één pixel, en
     die valt bij het slepen op als geflikker langs de hele romp.

     DE KOELTE WORDT OP DE HELDERHEID GEDEELD EN NIET RAUW GENOMEN
     De eerste versie keek naar blauw min rood zonder meer. Dat gaat goed zolang
     de nieuwe lak ongeveer even donker is als de oude, en het gaat mis zodra
     hij dat niet is. In een schaduw op de romp is blauw min rood bijna nul -
     alles is daar donker - dus die plek viel buiten de regel en bleef staan.
     Bij nachtblauw of zeegroen zag niemand dat, want daar was de romp toch al
     donker. Bij parelwit en champagne werd de rest licht en bleven die plekken
     als zwarte vegen achter; dat was op de proefpagina goed te zien.

     Delen door de helderheid haalt die afhankelijkheid eruit: een donkerblauwe
     schaduw is net zo blauw als een lichte blauwe partij, alleen zwakker
     verlicht. Gemeten scheelt dat een half procent van het beeld, en dat halve
     procent was precies de vlek.

     MAAR DEZE REGEL ALLEEN IS NIET GENOEG
     Waar de romp het grijze studiodoek spiegelt is blauw-min-rood óók bijna
     nul: gemeten op de boegstand heeft de spiegelende flank koelte 0,01-0,07
     bij helderheid 0,40-0,64, en het doek zelf 0,00-0,03 bij 0,55-0,74. Per
     beeldpunt zijn romp en doek daar dus niet te scheiden - op de boeg- en
     spiegelstanden dekte deze regel maar een derde van de zichtbare romp, en
     bij parelwit bleef de rest als grijze vlek staan. Daarom levert deze regel
     tegenwoordig alleen het ZAAD, en groeit rompmasker() daar ruimtelijk
     omheen. */
  function rompgewicht(r, g, b) {
    var helder = (r + g + b) / 3;
    var koel = (b - r) / Math.max(helder, 0.04);
    return band(koel, 0.10, 0.30) * (1 - band(helder, 0.45, 0.55));
  }

  /* Het masker ruimtelijk opschonen.

     WAAROM DIT NODIG IS BOVEN OP DE KLEURREGEL
     Een regel die per beeldpunt kijkt, kent geen vorm. Op de romp lopen een
     chromen sierlijst en een paar schaduwstrepen die geen lak zijn, en die
     laten in het masker dunne gaten achter. Bij een donkere lak vallen die weg;
     bij een lichte lak worden het vegen.

     Sluiten - eerst verwijden, dan weer krimpen - dicht een gat dat smaller is
     dan de kern en laat een gat dat breder is open staan. Dat is precies het
     onderscheid dat hier nodig is: de sierlijst is een dunne lijn en hoort
     dicht, de rompramen zijn brede vlakken en horen open. Bij een kern van
     negen beeldpunten blijft het raam voor elf procent open; bij zeventien nog
     maar twee procent en dan wordt het raam dus mee overgeschilderd.

     Het werk gebeurt op halve maat. Dat scheelt vier keer zoveel rekenwerk, en
     bij het terugschalen ontstaat de zachte rand vanzelf - die was er anders
     apart bij gekomen. */
  function schoon(gew, breed, hoog) {
    var hb = breed >> 1, hh = hoog >> 1;
    var klein = new Float32Array(hb * hh), x, y;
    for (y = 0; y < hh; y++) {
      for (x = 0; x < hb; x++) {
        var p = (y * 2) * breed + x * 2;
        klein[y * hb + x] = Math.max(Math.max(gew[p], gew[p + 1]),
                                     Math.max(gew[p + breed], gew[p + breed + 1])) > 0.5 ? 1 : 0;
      }
    }
    var straal = 2;   /* halve maat, dus dit is een kern van negen op vol formaat */
    klein = strek(klein, hb, hh, straal, true);
    klein = strek(klein, hb, hh, straal, false);

    /* Terug naar vol formaat, bilineair. De tussenwaarden die daarbij ontstaan
       zijn de zachte rand. */
    var uit = new Float32Array(breed * hoog);
    for (y = 0; y < hoog; y++) {
      var fy = Math.min(y / 2, hh - 1.001), y0 = fy | 0, wy = fy - y0;
      for (x = 0; x < breed; x++) {
        var fx = Math.min(x / 2, hb - 1.001), x0 = fx | 0, wx = fx - x0;
        var a = klein[y0 * hb + x0], b2 = klein[y0 * hb + x0 + 1];
        var c = klein[(y0 + 1) * hb + x0], d2 = klein[(y0 + 1) * hb + x0 + 1];
        uit[y * breed + x] = (a * (1 - wx) + b2 * wx) * (1 - wy) +
                             (c * (1 - wx) + d2 * wx) * wy;
      }
    }
    return doezel(uit, breed, hoog, 3);
  }

  /* De rand zacht maken, op vol formaat.
   *
   * Zonder deze stap is de rand een trap. Het masker wordt hierboven op halve
   * maat hard op nul of een gezet en daar met een vierkante kern van negen
   * verwijd en gekrompen; op een schuine lijn - en de scheerlijn en de
   * waterlijn zijn schuin - levert dat blokjes van vier tot acht beeldpunten
   * op. Bilineair terugschalen geeft maar twee beeldpunten overgang en verbergt
   * die niet.
   *
   * Bij een nachtblauwe of antracieten lak valt dat weg: de romp was al donker.
   * Bij parelwit staat er ineens een gescheurde rand langs de hele romp. Dat is
   * met het oog gezien op de SC 16 en de FB 24 en daarna gemeten: de rafeling
   * liep op tot 28 procent van de randlengte, tegen 17 bij de FB 19.
   *
   * Twee doorgangen van een lopend gemiddelde - eerst horizontaal, dan
   * verticaal - kosten samen 2r stappen per beeldpunt en maken van de trap een
   * verloop. Het masker wordt per stand één keer berekend en bewaard, dus dit
   * kost niets tijdens het slepen. */
  function doezel(v, breed, hoog, straal) {
    var tmp = new Float32Array(v.length), uit = new Float32Array(v.length);
    var n = straal * 2 + 1, x, y, k, som;
    for (y = 0; y < hoog; y++) {
      var r0 = y * breed;
      for (x = 0; x < breed; x++) {
        som = 0;
        for (k = -straal; k <= straal; k++) {
          var xk = x + k;
          som += v[r0 + (xk < 0 ? 0 : xk >= breed ? breed - 1 : xk)];
        }
        tmp[r0 + x] = som / n;
      }
    }
    for (x = 0; x < breed; x++) {
      for (y = 0; y < hoog; y++) {
        som = 0;
        for (k = -straal; k <= straal; k++) {
          var yk = y + k;
          som += tmp[(yk < 0 ? 0 : yk >= hoog ? hoog - 1 : yk) * breed + x];
        }
        uit[y * breed + x] = som / n;
      }
    }
    return uit;
  }

  /* Verwijden en weer krimpen, per as apart. Twee doorgangen over één as
     kosten samen 2r stappen per beeldpunt in plaats van r maal r, en het
     resultaat is hetzelfde voor een vierkante kern. */
  function strek(v, breed, hoog, straal, verwijden) {
    var tmp = new Float32Array(v.length), uit = new Float32Array(v.length), x, y, k, w;
    for (y = 0; y < hoog; y++) {
      for (x = 0; x < breed; x++) {
        w = verwijden ? 0 : 1;
        for (k = -straal; k <= straal; k++) {
          var xx = x + k; if (xx < 0 || xx >= breed) continue;
          var s2 = v[y * breed + xx];
          w = verwijden ? Math.max(w, s2) : Math.min(w, s2);
        }
        tmp[y * breed + x] = w;
      }
    }
    for (y = 0; y < hoog; y++) {
      for (x = 0; x < breed; x++) {
        w = verwijden ? 0 : 1;
        for (k = -straal; k <= straal; k++) {
          var yy = y + k; if (yy < 0 || yy >= hoog) continue;
          var s3 = tmp[yy * breed + x];
          w = verwijden ? Math.max(w, s3) : Math.min(w, s3);
        }
        uit[y * breed + x] = w;
      }
    }
    return uit;
  }

  function mediaan(waarden) {
    var a = Array.prototype.slice.call(waarden).sort(function (p, q) { return p - q; });
    return a.length ? a[a.length >> 1] : 0;
  }

  /* Het volledige rompmasker voor één stand: 1 waar lak hoort te komen, 0 elders.
   *
   * WAT ER MIS WAS MET ALLEEN DE KLEURREGEL
   * De romp is hoogglans. Op standen waar hij het grijze studiodoek spiegelt
   * (vooral de boeg- en de spiegelstand) is de flank in het beeld gewoon grijs:
   * koelte vrijwel nul, helderheid vlak bij die van het doek. Gemeten op de
   * boegstand: flank 0,40-0,64 helder bij koelte 0,01-0,07, het doek op
   * dezelfde rijen 0,74. Per beeldpunt is dat niet te scheiden; met alleen de
   * kleurregel dekte het masker daar ~1,5% van het beeld waar ~4,8% romp in
   * beeld was, en bij parelwit bleef tweederde van de boeg donker staan.
   *
   * DE AANPAK: ZAAIEN EN DAN BEGRENSD LATEN GROEIEN
   * 1. Zaad: de oude kleurregel (donker én koel), ruimtelijk geopend met een
   *    kern van 7 zodat losse spikkels in schaduw en op het teak wegvallen.
   * 2. Doekmodel per rij: de mediaan van de 120 randkolommen. De spiegelende
   *    romp is 0,15-0,30 donkerder dan het doek op dezelfde rij; dat verschil
   *    is de kern van de groeiregel. De grens ligt op 0,12: de schaduwzweem
   *    die het schip op het doek vlak naast het silhouet werpt is maar 0,10
   *    donkerder, en met een grens van 0,06 werd die zweem meegeverfd en
   *    stonden er bij nachtblauw blauwe blokken naast de boeg.
   * 3. Kandidaten: donkerder dan het doekmodel, niet warm (teak is koelte
   *    -0,12 en lager), niet spierwit (de gelcoat en de waterlijn-strook),
   *    en zonder flinke witte partij ERONDER in dezelfde kolom - want onder
   *    de romp zit hooguit een dunne waterlijn-glint, maar onder de voorruit
   *    zit de hele witte kuiprand (gemeten: langste witte run onder de romp
   *    hooguit ~17 rijen, onder de voorruit 23-114). Die ene toets houdt
   *    voorruit, wand en opbouwschaduw buiten het masker zonder dat er een
   *    aparte scheerlijn-detectie nodig is.
   * 4. Ondergrens per kolom: het diepste zaad plus twaalf, of - beter - de
   *    bovenkant van de waterlijn-glint (de diepste dunne lichte run in de
   *    kolom, met schaduw eronder; een dikke lichte partij is de lichtplas op
   *    de vloer en telt niet). Kolommen zonder anker worden lineair
   *    geïnterpoleerd en met een mediaan over 31 kolommen gladgestreken.
   *    Zonder deze grens liep het masker onder de kiel door in de slagschaduw
   *    en stond er bij parelwit een lichte gloed onder het schip.
   * 5. Heel donkere punten (helderheid < 0,16) doen alleen mee in een smalle
   *    strook net boven het bovenste zaad: dat is de donkere schoergang die
   *    op de boegstand tussen dek en flank doorloopt. Overal anders blijven
   *    donkere punten barrière, en dat houdt de rompramen open - die zijn
   *    vrijwel zwart en liggen ONDER het bovenste zaad van hun kolom.
   * 6. Geodetische groei (breedte-eerst) vanuit het zaad door de kandidaten:
   *    alleen wat met de zekere lak samenhangt wordt lak. De schaduw op de
   *    vloer voldoet plaatselijk ook aan de kandidaatregels, maar hangt er
   *    niet mee samen zolang de ondergrens hem afsnijdt.
   * 7. Naschoonmaak: groei die tegen doekkleurige punten aanligt wordt
   *    afgeschaafd (anders een lichte zoom van halve doekpixels rond het
   *    silhouet), maskerpunten in overwegend warme omgeving vervallen
   *    (teakspikkels op het zwemplateau), en ingesloten grijze zakken worden
   *    gevuld (spiegelpartijen die door een lichte bies van het zaad
   *    afgesneden waren) - donkere zakken zoals de ramen blijven open, lichte
   *    zoals het chroom ook.
   *
   * Gemeten dekking op de acht toetsstanden: 3,6-8,8% van het beeld, tegen
   * 1,5-6,3% met alleen de kleurregel; op de boegstand is de hele romp nu één
   * vlak. De prijs is rekenwerk: dit is alles bij elkaar een handvol lineaire
   * doorgangen over het beeld plus één breedte-eerst-groei, en dat wordt per
   * stand maar één keer gedaan en dan bewaard. */
  function rompmasker(dat, breed, hoog) {
    var n = breed * hoog, p, q, x, y;
    var hel = new Float32Array(n), koel = new Float32Array(n);
    for (p = 0, q = 0; p < dat.length; p += 4, q++) {
      var r = dat[p] / 255, g = dat[p + 1] / 255, b = dat[p + 2] / 255;
      var h = (r + g + b) / 3;
      hel[q] = h;
      koel[q] = (b - r) / Math.max(h, 0.04);
    }

    /* 1. zaad: kleurregel, daarna openen met kern 7 (erosie en verwijding,
       per as gescheiden zoals strek dat doet). */
    var zaad = new Float32Array(n);
    for (q = 0; q < n; q++) {
      zaad[q] = rompgewicht0(hel[q], koel[q]) > 0.5 ? 1 : 0;
    }
    zaad = strek(zaad, breed, hoog, 3, false);
    zaad = strek(zaad, breed, hoog, 3, true);

    /* 2. doekmodel per rij: mediaan van de 120 randkolommen. De rand is in
       alle standen vrij van schip, dus dit is een zuivere meting van het
       verloop in het doek (0,55 boven tot 0,76 in het lichtste deel). */
    var doekm = new Float32Array(hoog);
    var rij = new Float32Array(120);
    for (y = 0; y < hoog; y++) {
      for (x = 0; x < 60; x++) {
        rij[x] = hel[y * breed + x];
        rij[60 + x] = hel[y * breed + breed - 60 + x];
      }
      doekm[y] = mediaan(rij);
    }

    /* 3a. langste witte run STRIKT onder elk punt, per kolom van onder naar
       boven bijgehouden. Wit is hier: duidelijk lichter dan het doek. */
    var wit = new Uint8Array(n), witzacht = new Uint8Array(n);
    for (y = 0; y < hoog; y++) {
      for (x = 0; x < breed; x++) {
        q = y * breed + x;
        if (hel[q] > doekm[y] + 0.10) wit[q] = 1;
        if (hel[q] > doekm[y] + 0.05) witzacht[q] = 1;
      }
    }
    var runOnder = new Int16Array(n);
    var lopend = new Int32Array(breed), beste = new Int32Array(breed);
    for (y = hoog - 1; y >= 0; y--) {
      for (x = 0; x < breed; x++) {
        q = y * breed + x;
        runOnder[q] = beste[x];
        lopend[x] = wit[q] ? lopend[x] + 1 : 0;
        if (lopend[x] > beste[x]) beste[x] = lopend[x];
      }
    }

    /* Kolomstatistiek van het zaad. */
    var GEEN = 1 << 30;
    var zkolom = new Int32Array(breed);
    var onder = new Int32Array(breed), bovenz = new Int32Array(breed);
    var top = GEEN, zmin = -1, zmax = -1;
    for (x = 0; x < breed; x++) { onder[x] = -GEEN; bovenz[x] = GEEN; }
    for (y = 0; y < hoog; y++) {
      for (x = 0; x < breed; x++) {
        if (zaad[y * breed + x] > 0.5) {
          zkolom[x]++;
          if (y > onder[x]) onder[x] = y;
          if (y < bovenz[x]) bovenz[x] = y;
          if (y < top) top = y;
        }
      }
    }
    if (top === GEEN) return new Float32Array(n);   /* geen lak in beeld */
    for (x = 0; x < breed; x++) {
      if (zkolom[x] >= 4) { if (zmin < 0) zmin = x; zmax = x; }
    }

    /* bovenz lineair interpoleren over kolommen zonder zaad: de deklijn. */
    var bovenzI = interpKolommen(bovenz, zkolom, breed, top);

    /* 4. ondergrens per kolom. Eerst een anker per kolom: diepste zaad + 12,
       of de bovenkant van de diepste dunne lichte run (de waterlijn-glint,
       1-22 rijen, met schaduw eronder; de lichtplas op de vloer is dikker of
       heeft juist licht onder zijn rand en valt zo af). Eerst met de strenge
       witdrempel zoeken, dan pas met de zachte: op de spiegelstand is de
       glint maar één rij dun en net niet spierwit. */
    var rand = new Float32Array(breed);
    var randOk = new Uint8Array(breed);
    for (x = 0; x < breed; x++) {
      var anker = -1;
      if (zkolom[x] >= 4) anker = onder[x] + 12;
      var beneden = Math.max(0, bovenzI[x] | 0);
      for (var slag = 0; slag < 2; slag++) {
        var kaart = slag === 0 ? wit : witzacht;
        var yy = hoog - 2, gevonden = false;
        while (yy > beneden) {
          if (kaart[yy * breed + x]) {
            var y1 = yy;
            while (y1 > beneden && kaart[y1 * breed + x]) y1--;
            var lengte = yy - y1;
            if (lengte >= 1 && lengte <= 22) {
              var oy = Math.min(yy + 3, hoog - 1), oy2 = Math.min(yy + 8, hoog);
              var som = 0, m2 = 0;
              for (var oyy = oy; oyy < oy2; oyy++) { som += hel[oyy * breed + x]; m2++; }
              if (m2 > 0 && som / m2 < doekm[oy] - 0.03) {
                if (y1 + 1 > anker) anker = y1 + 1;
                gevonden = true;
              }
            }
            break;   /* alleen de diepste run telt */
          }
          yy--;
        }
        if (gevonden) break;
      }
      if (anker >= 0) { rand[x] = anker; randOk[x] = 1; }
    }
    var randv = interpKolommen2(rand, randOk, breed, hoog);

    /* Buiten het buitenste anker doorzetten met de plaatselijke helling in
       plaats van vlak: de rompbodem loopt naar boeg en spiegel toe op, en
       vlak doortrekken liet op de kwartstanden een geverfde gloed in de
       slagschaduw onder de boeg staan. */
    hellingDoorzetten(randv, rand, randOk, breed);

    /* Mediaan over 31 kolommen: één kolom met een misgegrepen anker mag de
       grenslijn niet laten uitschieten. */
    var randm = new Float32Array(breed);
    var venster = new Float32Array(31);
    for (x = 0; x < breed; x++) {
      var lo = Math.max(0, x - 15), hi = Math.min(breed, x + 16), k2 = 0;
      for (var xx = lo; xx < hi; xx++) venster[k2++] = randv[xx];
      randm[x] = mediaan(venster.subarray(0, k2));
    }

    /* Bootkolommen: kolommen met zaad, of met flink wit BOVEN de ondergrens
       (het witte dek). Het wit moet boven de grens gemeten worden, anders telt
       de lichtplas op de vloer mee en wordt het doek naast het schip
       bootkolom. Verder niet verder dan 400 kolommen buiten het zaad: op de
       kwartstanden is de hele boeghelft spiegelend en zonder zaad. */
    var bootkol = new Uint8Array(breed);
    for (x = 0; x < breed; x++) {
      if (x < zmin - 400 || x > zmax + 400) continue;
      if (zkolom[x] >= 4) { bootkol[x] = 1; continue; }
      var t = 0, ylim = Math.max(0, (randm[x] - 60) | 0);
      for (y = 0; y < ylim && t < 6; y++) if (wit[y * breed + x]) t++;
      if (t >= 6) bootkol[x] = 1;
    }

    /* 5+3b. kandidaatkaart. */
    var kand = new Uint8Array(n);
    var topgrens = top - 80;
    for (y = 0; y < hoog; y++) {
      for (x = 0; x < breed; x++) {
        q = y * breed + x;
        if (zaad[q] > 0.5) { kand[q] = 1; continue; }
        if (!bootkol[x] || y > randm[x] || y < topgrens) continue;
        var k3 = koel[q];
        if (k3 <= -0.08 || k3 >= 0.9) continue;
        if (runOnder[q] >= 20) continue;
        var h3 = hel[q];
        var grijsdonker = h3 > 0.16 && h3 < doekm[y] - 0.12;
        var schoergang = h3 <= 0.16 && y >= bovenzI[x] - 60 && y <= bovenzI[x];
        if (grijsdonker || schoergang) kand[q] = 1;
      }
    }

    /* 6. geodetische groei: breedte-eerst vanuit het zaad, acht buren. */
    var mas = new Uint8Array(n);
    var wachtrij = new Int32Array(n);
    var kop = 0, staart = 0;
    for (q = 0; q < n; q++) {
      if (zaad[q] > 0.5) { mas[q] = 1; wachtrij[staart++] = q; }
    }
    while (kop < staart) {
      q = wachtrij[kop++];
      y = (q / breed) | 0; x = q - y * breed;
      for (var dy = -1; dy <= 1; dy++) {
        var by = y + dy; if (by < 0 || by >= hoog) continue;
        for (var dx = -1; dx <= 1; dx++) {
          var bx = x + dx; if (bx < 0 || bx >= breed) continue;
          var bq = by * breed + bx;
          if (!mas[bq] && kand[bq]) { mas[bq] = 1; wachtrij[staart++] = bq; }
        }
      }
    }

    /* 7a. afschaven waar de groei tegen doekkleur aanligt: de silhouetrand is
       op de spiegelende flank een zachte overgang, en de halfdonkere
       overgangspixels hoorden bij het doek maar vielen binnen de groeiregel.
       Geverfd gaven ze een lichte zoom net buiten het schip. */
    var doekachtig = new Float32Array(n);
    for (y = 0; y < hoog; y++) {
      for (x = 0; x < breed; x++) {
        q = y * breed + x;
        doekachtig[q] = (hel[q] > doekm[y] - 0.035 && Math.abs(koel[q]) < 0.06) ? 1 : 0;
      }
    }
    doekachtig = strek(doekachtig, breed, hoog, 2, true);
    for (q = 0; q < n; q++) {
      if (mas[q] && doekachtig[q] > 0.5 && zaad[q] < 0.5) mas[q] = 0;
    }

    /* 7b. teakspikkels: zaad dat op de donkere naden van het teak terechtkwam.
       Een lakpunt ligt nooit in een overwegend warme omgeving, dus alles met
       meer dan 35% warme buren binnen 13x13 vervalt. */
    var warm = new Float32Array(n);
    for (q = 0; q < n; q++) warm[q] = koel[q] < -0.12 ? 1 : 0;
    var warmsom = boxsom(warm, breed, hoog, 6);
    for (q = 0; q < n; q++) {
      if (mas[q] && warmsom[q] > 0.35 * 13 * 13) mas[q] = 0;
    }

    /* 7c. ingesloten zakken. Vrijloop vanaf de beeldrand door alles wat geen
       masker is; wat dan nog over is ligt ingesloten in het masker. Grijze
       zakken (mediaan 0,18-0,62) zijn spiegelpartijen die door een lichte
       bies afgesneden waren en horen dicht; donkere zakken zijn de ramen en
       blijven open, tenzij ze klein zijn (spleetjes rond het beslag); lichte
       zakken zijn chroom en blijven ook open. */
    vulZakken(mas, hel, breed, hoog);

    var uit = new Float32Array(n);
    for (q = 0; q < n; q++) uit[q] = mas[q];
    return uit;
  }

  /* rompgewicht op reeds berekende helderheid/koelte (scheelt per beeldpunt
     drie delingen in de duurste lus). */
  function rompgewicht0(helder, koel) {
    return band(koel, 0.10, 0.30) * (1 - band(helder, 0.45, 0.55));
  }

  /* Lineaire interpolatie van een kolomgrootheid over kolommen zonder zaad;
     buiten het bereik wordt de eindwaarde doorgetrokken. */
  function interpKolommen(waarde, zkolom, breed, terugval) {
    var uit = new Float32Array(breed), x;
    var vorigX = -1, vorigW = 0, eerste = true;
    for (x = 0; x < breed; x++) {
      if (zkolom[x] >= 4 && waarde[x] < (1 << 29)) {
        if (eerste) { for (var x2 = 0; x2 < x; x2++) uit[x2] = waarde[x]; eerste = false; }
        else {
          for (var x3 = vorigX + 1; x3 < x; x3++) {
            uit[x3] = vorigW + (waarde[x] - vorigW) * (x3 - vorigX) / (x - vorigX);
          }
        }
        uit[x] = waarde[x]; vorigX = x; vorigW = waarde[x];
      }
    }
    if (vorigX < 0) { for (x = 0; x < breed; x++) uit[x] = terugval; }
    else { for (x = vorigX + 1; x < breed; x++) uit[x] = vorigW; }
    return uit;
  }

  function interpKolommen2(waarde, ok, breed, terugval) {
    var uit = new Float32Array(breed), x;
    var vorigX = -1, vorigW = 0, eerste = true;
    for (x = 0; x < breed; x++) {
      if (ok[x]) {
        if (eerste) { for (var x2 = 0; x2 < x; x2++) uit[x2] = waarde[x]; eerste = false; }
        else {
          for (var x3 = vorigX + 1; x3 < x; x3++) {
            uit[x3] = vorigW + (waarde[x] - vorigW) * (x3 - vorigX) / (x - vorigX);
          }
        }
        uit[x] = waarde[x]; vorigX = x; vorigW = waarde[x];
      }
    }
    if (vorigX < 0) { for (x = 0; x < breed; x++) uit[x] = terugval; }
    else { for (x = vorigX + 1; x < breed; x++) uit[x] = vorigW; }
    return uit;
  }

  /* Buiten het buitenste anker de grenslijn met de plaatselijke helling
     doorzetten (kleinste-kwadraten over de buitenste 120 ankers), en alleen
     omlaag bijstellen: strenger mag, ruimer niet. */
  function hellingDoorzetten(randv, rand, randOk, breed) {
    var idx = [], x;
    for (x = 0; x < breed; x++) if (randOk[x]) idx.push(x);
    if (idx.length < 30) return;
    for (var kant = 0; kant < 2; kant++) {
      var deel = kant === 0 ? idx.slice(0, 120) : idx.slice(-120);
      var grensX = kant === 0 ? idx[0] : idx[idx.length - 1];
      if ((kant === 0 && grensX <= 0) || (kant === 1 && grensX >= breed - 1)) continue;
      if (deel.length < 10) continue;
      var sx = 0, sy = 0, sxx = 0, sxy = 0, m = deel.length;
      for (var i = 0; i < m; i++) {
        sx += deel[i]; sy += rand[deel[i]];
        sxx += deel[i] * deel[i]; sxy += deel[i] * rand[deel[i]];
      }
      var noemer = m * sxx - sx * sx;
      if (Math.abs(noemer) < 1e-6) continue;
      var a = (m * sxy - sx * sy) / noemer, b = (sy - a * sx) / m;
      if (kant === 0) { for (x = 0; x < grensX; x++) randv[x] = Math.min(randv[x], a * x + b); }
      else { for (x = grensX + 1; x < breed; x++) randv[x] = Math.min(randv[x], a * x + b); }
    }
  }

  /* Boxsom over (2*straal+1)^2 via een integraalbeeld. */
  function boxsom(v, breed, hoog, straal) {
    var integ = new Float64Array((breed + 1) * (hoog + 1));
    var x, y;
    for (y = 0; y < hoog; y++) {
      var rijsom = 0;
      for (x = 0; x < breed; x++) {
        rijsom += v[y * breed + x];
        integ[(y + 1) * (breed + 1) + x + 1] = integ[y * (breed + 1) + x + 1] + rijsom;
      }
    }
    var uit = new Float32Array(breed * hoog);
    for (y = 0; y < hoog; y++) {
      var y0 = Math.max(0, y - straal), y1 = Math.min(hoog, y + straal + 1);
      for (x = 0; x < breed; x++) {
        var x0 = Math.max(0, x - straal), x1 = Math.min(breed, x + straal + 1);
        uit[y * breed + x] = integ[y1 * (breed + 1) + x1] - integ[y0 * (breed + 1) + x1] -
                             integ[y1 * (breed + 1) + x0] + integ[y0 * (breed + 1) + x0];
      }
    }
    return uit;
  }

  /* Ingesloten niet-maskergebieden zoeken (vrijloop vanaf de beeldrand,
     vier buren) en per gebied beslissen: grijze zakken dicht, ramen open. */
  function vulZakken(mas, hel, breed, hoog) {
    var n = breed * hoog;
    var label = new Int32Array(n);   /* 0 = ongezien, 1 = buiten, 2+ = zak */
    var wachtrij = new Int32Array(n);
    var kop = 0, staart = 0, q, x, y;
    function duw(bq) { if (!label[bq] && !mas[bq]) { label[bq] = 1; wachtrij[staart++] = bq; } }
    for (x = 0; x < breed; x++) { duw(x); duw((hoog - 1) * breed + x); }
    for (y = 0; y < hoog; y++) { duw(y * breed); duw(y * breed + breed - 1); }
    while (kop < staart) {
      q = wachtrij[kop++];
      y = (q / breed) | 0; x = q - y * breed;
      if (x > 0) duw(q - 1);
      if (x < breed - 1) duw(q + 1);
      if (y > 0) duw(q - breed);
      if (y < hoog - 1) duw(q + breed);
    }
    var zak = 2;
    for (var start = 0; start < n; start++) {
      if (label[start] || mas[start]) continue;
      /* nieuwe zak: verzamelen, mediaan van de helderheid bepalen */
      kop = 0; staart = 0;
      label[start] = zak; wachtrij[staart++] = start;
      var leden = [];
      while (kop < staart) {
        q = wachtrij[kop++]; leden.push(q);
        y = (q / breed) | 0; x = q - y * breed;
        var buren = [];
        if (x > 0) buren.push(q - 1);
        if (x < breed - 1) buren.push(q + 1);
        if (y > 0) buren.push(q - breed);
        if (y < hoog - 1) buren.push(q + breed);
        for (var i = 0; i < buren.length; i++) {
          var bq = buren[i];
          if (!label[bq] && !mas[bq]) { label[bq] = zak; wachtrij[staart++] = bq; }
        }
      }
      var waarden = new Float32Array(leden.length);
      for (var j = 0; j < leden.length; j++) waarden[j] = hel[leden[j]];
      var mh = mediaan(waarden);
      var dicht = (mh > 0.18 && mh < 0.62) || (mh <= 0.18 && leden.length < 800);
      if (dicht) { for (var j2 = 0; j2 < leden.length; j2++) mas[leden[j2]] = 1; }
      zak++;
    }
  }

  function maak(houder, opties) {
    var map = opties.map;
    var aantal = opties.aantal || 24;
    var doel = hexNaarRgb(opties.kleur || '#16243c');
    var kleurAan = !!opties.kleur;
    /* De bestandsnaam is instelbaar. De eigen reeksen heten spin-00.webp met
       twee cijfers; wat er van buiten binnenkomt heeft zijn eigen telling, en
       daarvoor omdopen zou een stap zijn die niets oplevert. */
    var voorvoegsel = opties.voorvoegsel || 'spin-';
    var cijfers = opties.cijfers || 2;
    var vanzelf = opties.vanzelf;

    var doek = document.createElement('canvas');
    doek.className = 'spin__doek';
    doek.style.cssText = 'display:block;width:100%;height:auto;touch-action:pan-y;cursor:grab';
    houder.innerHTML = '';
    houder.appendChild(doek);
    var ctx = doek.getContext('2d', { willReadFrequently: true });

    var beelden = new Array(aantal);
    var maskers = new Array(aantal);  /* het opgeschoonde rompmasker per stand */
    var klaar = 0;
    var stand = 0;
    var ijk = 0.22;

    function bestand(i) {
      var n = String(i);
      while (n.length < cijfers) n = '0' + n;
      return map + voorvoegsel + n + '.webp';
    }

    /* De ijkwaarde is de gemiddelde helderheid van de lak zoals hij in de
       bestanden staat. Zonder die maat zou elke nieuwe kleur even licht worden
       als de oude toevallig was; met de maat houdt de romp zijn eigen
       glansstreep en zijn eigen schaduw onder de kim.

       Gemeten wordt over het ZAAD (de zekere donkere lak) en niet over het
       volledige masker: het masker bevat sinds de groei ook de spiegelende
       partijen, en die zijn twee keer zo licht als de lak zelf. Met het
       masker als basis verschoof de ijk van 0,16 naar 0,33 en werden de
       donkere lakken merkbaar donkerder naverfd; met het zaad blijft de toon
       gelijk aan hoe hij altijd was. */
    function ijkenOp(dat) {
      var som = 0, n = 0;
      for (var p = 0; p < dat.length; p += 4) {
        var r = dat[p] / 255, g = dat[p + 1] / 255, b = dat[p + 2] / 255;
        if (rompgewicht(r, g, b) > 0.5) { som += (r + g + b) / 3; n++; }
      }
      if (n > 200) ijk = som / n;
    }

    /* Het masker wordt één keer per stand gemaakt en dan bewaard. De opbouw
       (zaaien, groeien, opschonen) is te duur om bij elke kleurwissel opnieuw
       te doen, en het masker hangt alleen van het bronbeeld af - niet van de
       gekozen kleur. */
    function maskerVoor(i, dat, breed, hoog) {
      if (maskers[i]) return maskers[i];
      var gew = rompmasker(dat, breed, hoog);
      maskers[i] = schoon(gew, breed, hoog);
      return maskers[i];
    }

    function tekenStand(i) {
      var im = beelden[i];
      if (!im) return;
      if (doek.width !== im.naturalWidth) {
        doek.width = im.naturalWidth;
        doek.height = im.naturalHeight;
      }
      ctx.drawImage(im, 0, 0);
      if (!kleurAan) return;

      var beeld = ctx.getImageData(0, 0, doek.width, doek.height);
      var d = beeld.data;
      var mas = maskerVoor(i, d, doek.width, doek.height);
      for (var p = 0, q = 0; p < d.length; p += 4, q++) {
        var m = mas[q];
        if (m <= 0.002) continue;
        var r = d[p] / 255, g = d[p + 1] / 255, b = d[p + 2] / 255;
        var f = 1 + ((r + g + b) / 3 / ijk - 1) * STERKTE;
        var nr = doel[0] * f, ng = doel[1] * f, nb = doel[2] * f;
        d[p]     = Math.min(255, (r + (nr - r) * m) * 255);
        d[p + 1] = Math.min(255, (g + (ng - g) * m) * 255);
        d[p + 2] = Math.min(255, (b + (nb - b) * m) * 255);
      }
      ctx.putImageData(beeld, 0, 0);
    }

    for (var i = 0; i < aantal; i++) {
      (function (k) {
        var im = new Image();
        im.onload = function () {
          beelden[k] = im;
          klaar++;
          if (k === 0) {
            doek.width = im.naturalWidth; doek.height = im.naturalHeight;
            ctx.drawImage(im, 0, 0);
            ijkenOp(ctx.getImageData(0, 0, doek.width, doek.height).data);
            tekenStand(0);
          }
          probeerVanzelf();
        };
        im.onerror = function () { klaar++; probeerVanzelf(); };
        im.src = bestand(k);
      })(i);
    }

    /* Slepen: één hele breedte van de weergave is één hele omwenteling.
       Dat was een halve breedte, en dat is op een telefoon te snel: het beeld
       is daar zo'n 360 pixels breed, dus een halve omwenteling paste in een
       duimveeg van honderdtachtig pixels. Op de schermopname van de klant
       sprong de weergave daardoor van stand 20 naar 29 naar 2 naar 8 - dat
       leest niet als draaien maar als doorbladeren. Met de volle breidte per
       omwenteling kost een hele ronde ongeveer twee vegen, en dat is precies
       wat een productweergave hoort te kosten. */
    var sleept = false, laatsteX = 0, opgespaard = 0;
    function begin(x) { sleept = true; laatsteX = x; doek.style.cursor = 'grabbing'; }
    function beweeg(x) {
      if (!sleept) return;
      var perStand = Math.max(houder.clientWidth, 200) / aantal;
      opgespaard += x - laatsteX;
      laatsteX = x;
      while (Math.abs(opgespaard) >= perStand) {
        var richting = opgespaard > 0 ? -1 : 1;
        opgespaard -= richting * -perStand;
        stand = (stand + richting + aantal) % aantal;
        tekenStand(stand);
      }
    }
    function eind() { sleept = false; opgespaard = 0; doek.style.cursor = 'grab'; }

    doek.addEventListener('pointerdown', function (e) { stopDraai(); begin(e.clientX); doek.setPointerCapture(e.pointerId); });
    doek.addEventListener('pointermove', function (e) { beweeg(e.clientX); });
    doek.addEventListener('pointerup', eind);
    doek.addEventListener('pointercancel', eind);

    /* UIT ZICHZELF EEN RONDE DRAAIEN
       Zonder dit beweegt de weergave alleen zolang er gesleept wordt. Wie de
       pagina opent ziet dan een stilstaande foto, en wie kort sleept ziet een
       stukje - dat leest als "hij gaat niet rond", en dat is precies hoe het
       hier is misgegaan. De eerste keer dat de weergave in beeld komt draait
       hij daarom vanzelf één volle omwenteling. Daarna staat hij stil, want
       een beeld dat blijft ronddraaien terwijl je de tekst ernaast leest is
       vervelend. Aanraken stopt hem meteen: wie zelf stuurt, stuurt. */
    var draaiKlok = null, teGaan = 0, vanzelfGedaan = false;
    var stilVoorkeur = typeof matchMedia === 'function' &&
                       matchMedia('(prefers-reduced-motion: reduce)').matches;

    function stopDraai() {
      if (draaiKlok) { clearInterval(draaiKlok); draaiKlok = null; }
      teGaan = 0;
      if (opties.opDraai) opties.opDraai(false);
    }
    function draaiRond(rondes, msPerStand) {
      stopDraai();
      /* Eén omwenteling duurt ongeveer zeven seconden, ongeacht het aantal
         standen. Met een vaste tijd per stand zou een reeks van tweeënzeventig
         twee keer zo traag rondgaan als een van zesendertig. */
      msPerStand = msPerStand || Math.round(7000 / aantal);
      teGaan = aantal * (rondes || 1);
      if (opties.opDraai) opties.opDraai(true);
      draaiKlok = setInterval(function () {
        if (klaar < aantal) return;              /* nog niet alles geladen: wachten */
        stand = (stand + 1) % aantal;
        tekenStand(stand);
        if (--teGaan <= 0) stopDraai();
      }, msPerStand || 150);
    }

    /* Twee dingen moeten allebei waar zijn voordat hij vanzelf gaat draaien: de
       weergave staat in beeld en alle beelden zijn binnen. Welke van de twee als
       laatste klaar is verschilt per bezoek, dus beide melden zich hier. Eerder
       keek alleen de waarnemer, en die vuurt niet nog een keer als het beeld al
       zichtbaar was - dan bleef hij dus stilstaan. */
    var inBeeld = false;
    function probeerVanzelf() {
      if (vanzelfGedaan || !inBeeld || klaar < aantal) return;
      if (vanzelf === false || stilVoorkeur) return;
      vanzelfGedaan = true;
      draaiRond(1);
    }
    if (typeof IntersectionObserver === 'function') {
      var kijker = new IntersectionObserver(function (waarnemingen) {
        for (var w = 0; w < waarnemingen.length; w++) {
          if (!waarnemingen[w].isIntersecting) continue;
          inBeeld = true;
          kijker.disconnect();
          probeerVanzelf();
        }
      }, { threshold: 0.4 });
      kijker.observe(doek);
    } else {
      inBeeld = true;
    }

    return {
      draaiRond: draaiRond,
      stopDraai: stopDraai,
      draait: function () { return !!draaiKlok; },
      zetKleur: function (hex) {
        doel = hexNaarRgb(hex);
        kleurAan = !!hex;
        tekenStand(stand);
      },
      zetStand: function (i) { stand = ((i % aantal) + aantal) % aantal; tekenStand(stand); },
      geefStand: function () { return stand; },
      geladen: function () { return klaar; }
    };
  }

  global.NGJachtSpin = { maak: maak };
})(typeof window !== 'undefined' ? window : globalThis);
