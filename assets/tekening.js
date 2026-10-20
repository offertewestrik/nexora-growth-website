/* Technische tekening van de badkamer — plattegrond, wandaanzichten en de
 * installatielaag, uit dezelfde configuratiestatus als het beeld en de prijs.
 *
 * WAAROM DIT GEEN TWEEDE SYSTEEM IS. De verleiding bij een technische tekening
 * is om er een eigen productindeling naast te zetten: een tekenlaag met eigen
 * maten, eigen namen en een eigen idee van waar de wastafel hangt. Dat werkt
 * één middag, en daarna lopen de tekening en de offerte uiteen zonder dat
 * iemand het merkt. Deze module rekent daarom niets zelf uit wat elders al
 * bekend is: de ruimte komt uit de maatschuiven, de plaatsing uit
 * plaatsen() in tegelbeeld.js — dezelfde functie die de 2D-tekenaar en de
 * 3D-motor gebruiken — en de productmaten en montagehoogtes uit de catalogus.
 * Wat hier wél gebeurt is meten: afstanden, vrije ruimte, maatlijnen.
 *
 * MILLIMETERS. Binnen deze module is alles millimeter en integer. De rest van
 * de configurator rekent in meters omdat dat voor een prijs prettiger leest,
 * maar een deurdag van 830 en een borstwering van 1400 verdragen geen
 * afronding op 5 cm. De omrekening gebeurt één keer, bij binnenkomst.
 *
 * HERKOMST. Elke maat draagt waar hij vandaan komt: 'ingevoerd' als iemand hem
 * heeft opgemeten, 'berekend' als de configurator hem heeft afgeleid,
 * 'aanname' als niemand het weet en er een gebruikelijke waarde staat. Een
 * tekening die dat onderscheid niet maakt is gevaarlijker dan geen tekening,
 * want dan gaat er iemand op zagen.
 *
 * ASSENSTELSEL. De plattegrond kijkt van boven met de achterwand bovenaan:
 * x loopt naar rechts langs de achterwand, y loopt naar beneden de ruimte in.
 * De rest van de configurator gebruikt z, waarbij z = D de achterwand is; de
 * omrekening is y = D - z en staat op één plek.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ maten */

  /* Vuistmaten die de tekening nodig heeft en de configurator niet vraagt.
     Ze staan hier bij elkaar zodat ze als aanname herkenbaar blijven en niet
     verspreid over de code als feit gaan leven. Bronnen zijn de gangbare
     Nederlandse praktijk; wie het beter weet vult het in en dan wint dat. */
  var AANNAME = {
    wanddikte: 100,
    plafond: 2600,
    deurbreedte: 830,
    deurhoogte: 2015,
    // vrije gebruiksruimte vóór een product, in mm
    vrijToilet: 600, vrijToiletBreed: 700,
    vrijWastafel: 700,
    vrijDouche: 600,
    vrijBad: 700,
    // montagehoogtes die niet uit de catalogus komen
    hToiletbril: 430,
    hSpoelplaat: 1000,
    hDouchekraan: 1100,
    hDouchekop: 2100,
    hBadkraan: 600,
    hWastafelblad: 900,
    hSpiegelOnder: 1400,
    hWcd: 1200,
    // installatiehoogtes
    hWaterWastafel: 550, hAfvoerWastafel: 500,
    hWaterDouche: 1100, hAfvoerDouche: 0,
    hWaterBad: 600, hAfvoerBad: 150,
    hWaterToilet: 1000, hAfvoerToilet: 220,
    hRadiator: 300,
    hLichtpunt: 2600
  };

  /* ------------------------------------------- Nederlandse standaardhoogtes */

  /* Wat in Nederland gebruikelijk is, met de bron erbij. Dit is nadrukkelijk
     géén norm: het Bouwbesluit schrijft geen montagehoogte voor een wastafel
     voor. Het zijn de maten die fabrikanten en installateurs aanhouden, en ze
     staan hier als bereik omdat er geen enkel getal is dat overal klopt.

     Waarom een bereik en niet één getal: een tekening die "900 mm" zegt terwijl
     de klant 850 wil, is fout. Een tekening die "850 mm — gebruikelijk 850-900,
     bron Geberit" zegt, is een gesprek. Alleen dat tweede is bruikbaar op de
     bouw.

     Alles in mm, gemeten vanaf de afgewerkte vloer tenzij anders vermeld. */
  var NLHOOGTE = [
    { id: 'wastafel', naam: 'Wastafel, bovenkant', van: 850, tot: 900, typisch: 900,
      meet: 'bovenkant blad tot afgewerkte vloer', bron: 'Geberit' },
    { id: 'wastafelkraan', naam: 'Wastafel inbouwkraan, hart rozet', van: 1050, tot: 1150,
      typisch: 1100, meet: 'hart rozet tot afgewerkte vloer, min. 100 mm boven de kom',
      bron: 'Voordelig Design Sanitair' },
    { id: 'wastafelwater', naam: 'Wastafel warm/koud water', van: 550, tot: 650, typisch: 600,
      meet: 'hart aansluiting, hart-op-hart 150 mm', bron: 'praktijk (Klusidee, Sanitino)' },
    { id: 'wastafelafvoer', naam: 'Wastafel afvoer', van: 500, tot: 600, typisch: 550,
      meet: 'hart afvoer, Ø40 mm', bron: 'praktijk (PVC-handel, Sanitino)' },
    { id: 'toilet', naam: 'Hangend toilet, bovenkant pot', van: 400, tot: 430, typisch: 400,
      meet: 'zonder bril; comfortmaat 450-500 mm', bron: 'Geberit' },
    { id: 'spoelplaat', naam: 'Bedieningsplaat', van: 1000, tot: 1100, typisch: 1050,
      meet: 'hart plaat, boven het hart van de pot', bron: 'Geberit' },
    { id: 'toiletafvoer', naam: 'Toilet afvoer', van: 180, tot: 230, typisch: 220,
      meet: 'hart wandaansluiting, Ø90/110 mm', bron: 'praktijk (Geberit-frames)' },
    { id: 'toiletwater', naam: 'Toilet watertoevoer reservoir', van: 1000, tot: 1100,
      typisch: 1000, meet: 'hart aansluiting in het frame', bron: 'praktijk' },
    { id: 'urinoir', naam: 'Urinoir, voorrand', van: 650, tot: 700, typisch: 650,
      meet: 'volwassenen; kinderen 450-550 mm', bron: 'Geberit' },
    { id: 'urinoirafvoer', naam: 'Urinoir afvoer', van: 500, tot: 550, typisch: 520,
      meet: 'hart afvoer, Ø50 mm', bron: 'praktijk (Viega, Rioolservice)' },
    { id: 'douchekraan', naam: 'Douchethermostaat, hart', van: 1000, tot: 1200, typisch: 1100,
      meet: 'hart kraan tot vloer of bovenkant douchebak', bron: 'Sanitairkamer, Maxaro' },
    { id: 'douchekop', naam: 'Hoofddouche / regendouche', van: 2100, tot: 2200, typisch: 2100,
      meet: 'onderkant douchekop; min. 200 mm boven de langste gebruiker',
      bron: 'Badkamerie' },
    { id: 'glijstang', naam: 'Glijstang, bovenkant', van: 2000, tot: 2100, typisch: 2000,
      meet: 'onderkant circa 1000 mm', bron: 'praktijk (Voordelig Sanitair)' },
    { id: 'badkraan', naam: 'Badkraan, hart', van: 600, tot: 700, typisch: 600,
      meet: 'hart kraan tot vloer, circa 150 mm boven de badrand', bron: 'praktijk' },
    { id: 'spiegel', naam: 'Spiegel, hartlijn', van: 1700, tot: 1800, typisch: 1800,
      meet: 'onderkant 150-200 mm boven de wastafel', bron: 'Geberit' },
    { id: 'wcd', naam: 'Wandcontactdoos', van: 1100, tot: 1300, typisch: 1200,
      meet: 'hart doos, buiten de natte zone', bron: 'praktijk' }
  ];

  var WANDEN = ['achter', 'rechts', 'voor', 'links'];
  var WANDNAAM = { achter: 'Achterwand', rechts: 'Rechterwand',
                   voor: 'Voorwand', links: 'Linkerwand' };

  /* ------------------------------------------------------------ meetkunde */

  /** Waar ligt een punt op een wand, in plattegrondcoördinaten (mm).
      `l` loopt vanaf de achterhoek langs de wand, `diep` de ruimte in. Dit is
      dezelfde afspraak als wandPunt() in de 3D-motor; ze moeten wel dezelfde
      hoek "achter" bedoelen, anders komt het toilet aan de andere kant. */
  function opWand(R, wand, l, diep) {
    diep = diep || 0;
    if (wand === 'links')  return { x: diep, y: l };
    if (wand === 'rechts') return { x: R.b - diep, y: l };
    if (wand === 'voor')   return { x: R.b - l, y: R.d - diep };
    return { x: l, y: diep };
  }

  /** De lengte van een wand: zijwanden zijn zo lang als de ruimte diep is. */
  function wandLengte(R, wand) {
    return (wand === 'links' || wand === 'rechts') ? R.d : R.b;
  }

  /** Een product tegen een wand als rechthoek in de plattegrond. `l` is het
      hart langs de wand, `b` de breedte langs de wand, `d` de diepte. */
  function wandVlak(R, wand, l, b, d) {
    var a = opWand(R, wand, l - b / 2, 0);
    var z = opWand(R, wand, l + b / 2, d);
    return { x0: Math.min(a.x, z.x), x1: Math.max(a.x, z.x),
             y0: Math.min(a.y, z.y), y1: Math.max(a.y, z.y) };
  }

  /* ---------------------------------------------------- L-vormige ruimte */

  /* Dezelfde hoektoewijzing als in de plaatsing (tegelbeeld.js) en de 3D-motor
     (bad3d.js), hier nagerekend aan opWand() hierboven in plaats van
     overgetypt: bij diep=0 zit de achterwand op l=0 in de achterlinkshoek,
     precies zoals daar. Alle drie moeten dezelfde hoek dezelfde plek laten
     betekenen — dat is de enige manier waarop een wastafel op de tekening
     ook echt op de plek staat waar hij in 3D staat. */
  function snedeHoeken(R) {
    var s = R.snede; if (!s) return null;
    var b = R.b, d = R.d, cb = s.cb, cd = s.cd;
    var MAP = {
      achterlinks:  { a: 'achter', ar: [0, cb], zij: 'links', zr: [0, cd] },
      achterrechts: { a: 'achter', ar: [b - cb, b], zij: 'rechts', zr: [0, cd] },
      voorrechts:   { a: 'voor', ar: [0, cb], zij: 'rechts', zr: [d - cd, d] },
      voorlinks:    { a: 'voor', ar: [b - cb, b], zij: 'links', zr: [d - cd, d] }
    };
    return MAP[s.hoek] || null;
  }

  /** Het stuk van deze wand dat door de hap verdwijnt, of null. */
  function snedeOpWand(R, wand) {
    var m = snedeHoeken(R); if (!m) return null;
    if (wand === m.a) return m.ar;
    if (wand === m.zij) return m.zr;
    return null;
  }

  /** De vloer als polygoon: vier hoekpunten voor een rechthoek, zes voor een
      L. Getekend rechtsom vanaf de achterlinkshoek, zodat plattegrondKader()
      en tekenPlattegrond() er zonder verdere kennis van de vorm doorheen
      kunnen lopen. */
  function vloerPolygoon(R) {
    var b = R.b, d = R.d, s = R.snede;
    if (!s) return [[0, 0], [b, 0], [b, d], [0, d]];
    // de zes hoeken rechtsom, startend bij de achterlinkshoek (0,0) — in
    // plattegrondcoördinaten is y=0 de achterwand en y=d de voorwand
    if (s.hoek === 'achterlinks') {
      return [[s.cb, 0], [b, 0], [b, d], [0, d], [0, s.cd], [s.cb, s.cd]];
    }
    if (s.hoek === 'achterrechts') {
      return [[0, 0], [b - s.cb, 0], [b - s.cb, s.cd], [b, s.cd], [b, d], [0, d]];
    }
    if (s.hoek === 'voorrechts') {
      return [[0, 0], [b, 0], [b, d - s.cd], [b - s.cb, d - s.cd], [b - s.cb, d], [0, d]];
    }
    // voorlinks
    return [[0, 0], [b, 0], [b, d], [s.cb, d], [s.cb, d - s.cd], [0, d - s.cd]];
  }

  function afgerond(v) { return Math.round(v); }

  /* Een leeg veld is geen nul, en `Number('')` is dat wel. Deze omzetting staat
     buiten model() omdat de openingen er ook buiten om berekend worden: de
     3D-motor moet dezelfde deur op dezelfde plek zetten als de tekening, en dat
     lukt alleen als er één plek is die uitrekent waar hij hangt. */
  function getal(v, terug) {
    var t = String(v == null ? '' : v).trim().replace(',', '.');
    if (t === '') return terug;
    var n = Number(t);
    return isFinite(n) ? n : terug;
  }

  /** Deur en raam uit de bouwkundige gegevens, in millimeters. Er staat altijd
      een deur: een plattegrond zonder deur is geen plattegrond. Waar hij zit
      weet de configurator niet, dus komt hij in het midden van de opgegeven
      wand — en dat is een berekende maat en geen gemeten. */
  function openingenVan(R, bouw, bron) {
    bouw = bouw || {};
    bron = bron || function () { return 'aanname'; };
    var uit = [];
    var deurW = bouw.deur_wand || 'voor';
    var deurB = getal(bouw.deur_breedte, AANNAME.deurbreedte);
    var deurL = getal(bouw.deur_pos, null);
    var deurBerekend = deurL === null;
    if (deurBerekend) deurL = Math.round(wandLengte(R, deurW) / 2);
    uit.push({
      soort: 'deur', wand: deurW, hart: deurL, breedte: deurB,
      hoogte: getal(bouw.deur_hoogte, AANNAME.deurhoogte), borstwering: 0,
      type: bouw.deur_type || 'draai',
      draai: bouw.deur_draai || 'links', naar: bouw.deur_naar || 'binnen',
      vlak: wandVlak(R, deurW, deurL, deurB, R.wanddikte),
      herkomst: { hart: deurBerekend ? 'berekend' : bron('deur_pos'),
                  breedte: bron('deur_breedte'), hoogte: 'aanname' }
    });
    if (bouw.raam === 'ja') {
      var raamW = bouw.raam_wand || 'links';
      var raamB = getal(bouw.raam_breedte, 600);
      var raamL = getal(bouw.raam_pos, null);
      var raamBerekend = raamL === null;
      if (raamBerekend) raamL = Math.round(wandLengte(R, raamW) / 2);
      /* Een raam past onder het plafond. Borstwering 1500 plus een raam van
         1200 is 2700 in een ruimte van 2600, en dan steekt het glas door het
         plafond — op de tekening onopvallend, in 3D meteen te zien. Hij wordt
         ingekort en dat wordt vermeld; stilzwijgend iets anders tekenen dan er
         is ingevuld mag niet. */
      var raamBw = getal(bouw.raam_borstwering, 1400);
      var raamH = getal(bouw.raam_hoogte, 600);
      var ruimte = R.h - raamBw - 50;
      var ingekort = raamH > ruimte;
      uit.push({
        soort: 'raam', wand: raamW, hart: raamL, breedte: raamB,
        hoogte: Math.max(100, ingekort ? ruimte : raamH),
        gevraagdeHoogte: raamH, ingekort: ingekort,
        borstwering: raamBw,
        vlak: wandVlak(R, raamW, raamL, raamB, R.wanddikte),
        herkomst: { hart: raamBerekend ? 'berekend' : bron('raam_pos'),
                    breedte: bron('raam_breedte'),
                    borstwering: bron('raam_borstwering'),
                    hoogte: ingekort ? 'berekend' : bron('raam_hoogte') }
      });
    }
    return uit;
  }

  /* -------------------------------------------------------------- het model */

  /* Van de losse gegevens naar één technische beschrijving. Alles wat verderop
     getekend, geëxporteerd of gecontroleerd wordt komt hier vandaan, zodat een
     PDF en een SVG onmogelijk uiteen kunnen lopen: ze lezen hetzelfde model. */
  function model(staat) {
    var s = staat || {};
    var cat = s.catalogus || {};
    var bouw = s.bouw || {};
    var bron = s.herkomst || function () { return 'aanname'; };

    var ruwSnede = s.ruimte && s.ruimte.snede;
    var R = {
      b: afgerond((s.ruimte && s.ruimte.B ? s.ruimte.B : 2.4) * 1000),
      d: afgerond((s.ruimte && s.ruimte.D ? s.ruimte.D : 3.0) * 1000),
      h: afgerond((s.ruimte && s.ruimte.Hg ? s.ruimte.Hg : 2.6) * 1000),
      wanddikte: getal(bouw.wanddikte, AANNAME.wanddikte),
      // dezelfde hap als in de plaatsing en de 3D-motor, alleen in mm: dit is
      // geen tweede invoer, het is dezelfde m.snede uit maatVan() omgerekend.
      snede: ruwSnede ? { hoek: ruwSnede.hoek, cb: afgerond(ruwSnede.cb * 1000),
                          cd: afgerond(ruwSnede.cd * 1000) } : null
    };
    R.opp = Math.round((R.b * R.d - (R.snede ? R.snede.cb * R.snede.cd : 0)) / 1000) / 1000;

    var M = {
      eenheid: 'mm',
      ruimte: R,
      herkomst: {
        breedte: 'ingevoerd', diepte: 'ingevoerd',
        hoogte: bron('plafondhoogte'),
        wanddikte: bron('wanddikte')
      },
      wanden: WANDEN.map(function (w) {
        /* Het zichtbare stuk van deze wand. Bij een gewone rechthoek is dat de
           hele lengte; raakt de hap deze wand, dan houdt hij op waar de hap
           begint (of begint hij waar de hap ophoudt) — voorbij dat punt zet de
           ruimte zich haaks voort, en dat teken je niet in hetzelfde platte
           aanzicht. */
        var lang = wandLengte(R, w);
        var snedeBereik = snedeOpWand(R, w);
        var zichtbaar = [0, lang];
        if (snedeBereik) zichtbaar = (snedeBereik[0] === 0)
          ? [snedeBereik[1], lang] : [0, snedeBereik[0]];
        return { naam: w, label: WANDNAAM[w], lengte: lang, hoogte: R.h,
                 zichtbaar: zichtbaar, afgesneden: !!snedeBereik };
      }),
      producten: [],
      openingen: [],
      vrij: [],
      installatie: [],
      waarschuwingen: []
    };

    /* ---- producten ----
       De plaatsing komt binnen zoals plaatsen() hem oplevert, in meters. Elk
       product krijgt zijn artikelnummer en zijn maten uit de catalogus; wat
       daar niet in staat wordt gemeten aan de getekende vorm, en dat is dan
       een aanname. */
    var pl = s.plaatsing || {};
    var art = s.artikelen || {};

    /* Het artikelnummer van een plek. Een plek kan een stapel zijn — een
       wandcloset is reservoir, pot en spoelplaat — en dan is de pot het
       artikel dat de plattegrond aangaat; de rest hangt eraan. */
    function pidVan(sleutel) {
      var a = art[sleutel];
      if (!a) return null;
      var lijst = [].concat(a).map(function (x) { return typeof x === 'string' ? x : (x && x.pid); });
      return lijst.filter(Boolean);
    }
    function catNaam(pid) { return (cat[pid] && cat[pid].naam) || null; }
    function catMaat(pid, veld, terug) {
      var c = cat[pid];
      return (c && c[veld] != null) ? afgerond(c[veld] * 1000) : terug;
    }

    /* Het artikelnummer van een plek is niet altijd het eerste uit de stapel.
       Bij een wandcloset staat het inbouwreservoir vooraan, maar wat er op de
       plattegrond staat en waar de montagehoogte bij hoort is de pot. Wie dat
       niet onderscheidt zet de zithoogte van een reservoir op de tekening. */
    function voegProduct(o) {
      o.pids = o.pids || [];
      if (!o.pid) o.pid = o.pids[0] || null;
      M.producten.push(o);
      return o;
    }

    // wastafel
    if (pl.wastafel) {
      var wp = pidVan('wastafel') || [];
      // de onderkast bepaalt de contour; is er geen model, dan de getekende maat
      var wKast = wp.filter(function (p) { return cat[p] && cat[p].cat === 'Meubel'; })[0];
      var wB = afgerond(pl.wastafel.w * 1000);
      var wD = catMaat(wKast, 'd', 460);
      voegProduct({
        sleutel: 'wastafel', naam: catNaam(wKast) || catNaam(wp[0]) || 'Wastafelmeubel',
        pids: wp, pid: wKast || wp[0] || null, wand: pl.wastafel.wand, hart: afgerond(pl.wastafel.l * 1000),
        breedte: wB, diepte: wD,
        vlak: wandVlak(R, pl.wastafel.wand, afgerond(pl.wastafel.l * 1000), wB, wD),
        hoogte: catMaat(wKast, 'h', 500),
        montage: catMaat(wKast, 'y', 350),
        montageBron: (wKast && cat[wKast] && cat[wKast].y != null) ? 'catalogus' : 'aanname',
        maatBron: wKast ? 'catalogus' : 'aanname'
      });
    }

    // toilet — de voorzetwand is wat de plattegrond ziet, niet de pot
    if (pl.toilet) {
      var tp = pidVan('toilet') || [];
      var tB = afgerond((pl.toilet.breed || .78) * 1000);
      /* De catalogus noemt dit 'Closet' en 'Closet staand'; er is geen enkel
         artikel met sub 'Wandcloset'. Die filter vond dus nooit iets en viel
         altijd terug op het tweede artikel uit de stapel. Dat is toevallig de
         pot, maar alleen zolang niemand de volgorde verandert — en dan staat de
         zithoogte van een spoelplaat op de tekening. */
      var pot = tp.filter(function (p) {
        return cat[p] && /^Closet/.test(cat[p].sub || '');
      })[0] || tp[1];
      var res = tp.filter(function (p) { return cat[p] && /reservoir/i.test(cat[p].naam || ''); })[0];
      var tD = catMaat(res, 'd', 200) + catMaat(pot, 'd', 540);
      voegProduct({
        sleutel: 'toilet', naam: catNaam(pot) || 'Closet',
        pids: tp, pid: pot || tp[0] || null, wand: pl.toilet.wand, hart: afgerond(pl.toilet.l * 1000),
        breedte: tB, diepte: tD,
        vlak: wandVlak(R, pl.toilet.wand, afgerond(pl.toilet.l * 1000), tB, tD),
        hoogte: catMaat(pot, 'h', 400),
        /* De zithoogte staat in de catalogus. Hier een vuistmaat van 430
           invullen terwijl het artikel 400 zegt is precies de fout die een
           tekening onbruikbaar maakt: het getal klopt niet met het product dat
           besteld wordt. De vuistmaat blijft over voor als het artikel het niet
           weet, en dan staat erbij dat het een aanname is. */
        montage: catMaat(pot, 'y', AANNAME.hToiletbril),
        montageBron: (pot && cat[pot] && cat[pot].y != null) ? 'catalogus' : 'aanname',
        maatBron: pot ? 'catalogus' : 'aanname'
      });
    }

    // douche — een hoek, geen wandproduct: breedte langs de achterwand,
    // diepte de ruimte in
    if (pl.douche) {
      var dw = afgerond(pl.douche.w * 1000), dd = afgerond(pl.douche.d * 1000);
      var links = pl.douche.kant !== 'rechts';
      var dx0 = links ? 0 : R.b - dw;
      var dp = (pidVan('douchewand') || []).concat(pidVan('douchebak') || [],
                                                   pidVan('doucheafvoer') || []);
      voegProduct({
        sleutel: 'douche', naam: 'Douche', pids: dp,
        wand: 'achter', hart: dx0 + dw / 2, breedte: dw, diepte: dd,
        vlak: { x0: dx0, x1: dx0 + dw, y0: 0, y1: dd },
        hoogte: 2000, montage: 0, kant: links ? 'links' : 'rechts',
        montageBron: 'berekend', maatBron: 'berekend'
      });
      /* Een gemetseld muurtje aan de open zijde is een bouwdeel en geen
         sanitair: het wordt gemetseld vóórdat er ook maar één tegel ligt, dus
         het moet apart uitgezet kunnen worden. Een glaswand niet — die wordt
         ingemeten als alles staat. Daarom staat alleen het muurtje hier als
         eigen product met een eigen contour en eigen maatlijnen. */
      if (pl.douchemuur) {
        var mm = pl.douchemuur;
        var mx0 = afgerond(mm.x * 1000);
        var mdik = afgerond(mm.dikte * 1000);
        var mwp = pidVan('douchewand') || [];
        voegProduct({
          sleutel: 'douchemuur',
          naam: mm.glasboven ? 'Halfhoog muurtje met glas' : 'Gemetseld muurtje',
          pids: mwp, pid: mwp[0] || null,
          wand: 'achter', hart: mx0 + mdik / 2, breedte: mdik, diepte: dd,
          vlak: { x0: mx0, x1: mx0 + mdik, y0: 0, y1: dd },
          hoogte: afgerond(mm.hoogte * 1000), montage: 0,
          montageBron: 'berekend', maatBron: 'berekend'
        });
      }
    }

    // bad — staat los in de ruimte, met zijn lange kant van achter naar voren
    if (pl.bad) {
      var bx = afgerond(pl.bad.x * 1000), bz = afgerond(pl.bad.z * 1000);
      var brx = afgerond(pl.bad.rx * 1000), brz = afgerond(pl.bad.rz * 1000);
      var by = R.d - bz;                       // z-as omklappen naar de plattegrond
      var bp = pidVan('bad') || [];
      voegProduct({
        sleutel: 'bad', naam: catNaam(bp[0]) || 'Ligbad', pids: bp,
        wand: pl.bad.kant === 'rechts' ? 'rechts' : 'links',
        /* rx/rz staan al gedraaid als iemand het bad zelf een kwartslag heeft
           gezet (zie plaatsen() in tegelbeeld.js) — het vlak hieronder klopt
           dus vanzelf, ook gedraaid. */
        hart: by, breedte: brx * 2, diepte: brz * 2, rot: pl.bad.rot === 90 ? 90 : 0,
        vlak: { x0: bx - brx, x1: bx + brx, y0: by - brz, y1: by + brz },
        hoogte: catMaat(bp[0], 'h', 600), montage: 0, montageBron: 'berekend',
        maatBron: bp[0] ? 'catalogus' : 'berekend'
      });
    }

    // hoge kast — staat waar de verdeling een strook voor hem vrijhield, of
    // waar iemand hem zelf heeft neergezet en eventueel een kwartslag gedraaid
    if (pl.kolomkast) {
      var kp = pidVan('kolomkast') || [];
      var kb = afgerond(pl.kolomkast.breed * 1000);
      var kd = afgerond(pl.kolomkast.diep * 1000);
      var kGedraaid = pl.kolomkast.rot === 90;
      voegProduct({
        sleutel: 'kolomkast', naam: catNaam(kp[0]) || 'Hoge kast', pids: kp,
        wand: pl.kolomkast.wand, hart: afgerond(pl.kolomkast.l * 1000),
        breedte: kb, diepte: kd, rot: kGedraaid ? 90 : 0,
        vlak: wandVlak(R, pl.kolomkast.wand, afgerond(pl.kolomkast.l * 1000),
                        kGedraaid ? kd : kb, kGedraaid ? kb : kd),
        hoogte: catMaat(kp[0], 'h', 1200), montage: catMaat(kp[0], 'y', 400),
        montageBron: (kp[0] && cat[kp[0]] && cat[kp[0]].y != null) ? 'catalogus' : 'aanname',
        maatBron: kp[0] ? 'catalogus' : 'berekend'
      });
    }

    // radiator — op de voorwand, 450 uit de rechterhoek
    if (art.radiator) {
      var rp = pidVan('radiator') || [];
      var rB = catMaat(rp[0], 'b', 600), rD = catMaat(rp[0], 'd', 80);
      voegProduct({
        sleutel: 'radiator', naam: catNaam(rp[0]) || 'Handdoekradiator', pids: rp,
        wand: 'voor', hart: 450, breedte: rB, diepte: rD,
        vlak: wandVlak(R, 'voor', 450, rB, rD),
        hoogte: catMaat(rp[0], 'h', 1800), montage: catMaat(rp[0], 'y', AANNAME.hRadiator),
        montageBron: (rp[0] && cat[rp[0]] && cat[rp[0]].y != null) ? 'catalogus' : 'aanname',
        maatBron: rp[0] ? 'catalogus' : 'aanname'
      });
    }

    /* Wandproducten zonder vloervlak: spiegel, accessoires, doucheset. Ze staan
       niet op de plattegrond maar wel in de aanzichten, want daar gaat het om
       de montagehoogte. */
    function wandProduct(sleutel, wand, l, terugNaam, terugY) {
      var p = pidVan(sleutel);
      if (!p || !p.length) return;
      var c = cat[p[0]] || {};
      M.producten.push({
        sleutel: sleutel, naam: c.naam || terugNaam, pids: p, pid: p[0],
        wand: wand, hart: afgerond(l), breedte: catMaat(p[0], 'b', 150),
        diepte: catMaat(p[0], 'd', 100), vlak: null,
        hoogte: catMaat(p[0], 'h', 150),
        montage: catMaat(p[0], 'y', terugY),
        montageBron: (cat[p[0]] && cat[p[0]].y != null) ? 'catalogus' : 'aanname',
        maatBron: 'catalogus'
      });
    }
    if (pl.wastafel) {
      var wl = afgerond(pl.wastafel.l * 1000);
      wandProduct('wastafelkraan', pl.wastafel.wand, wl, 'Wastafelkraan', 850);
    }
    if (pl.douche) {
      var dLinks = pl.douche.kant !== 'rechts';
      var dHart = dLinks ? afgerond(pl.douche.w * 1000) * .45
                         : R.b - afgerond(pl.douche.w * 1000) * .45;
      wandProduct('douchesysteem', 'achter', dHart, 'Doucheset', AANNAME.hDouchekraan);
      wandProduct('doucheplanchet', 'achter', dHart + (dLinks ? 300 : -300), 'Planchet', 1100);
      wandProduct('douchegreep', 'achter', dHart + (dLinks ? -300 : 300), 'Wandgreep', 900);
    }
    if (pl.toilet) {
      var tl = afgerond(pl.toilet.l * 1000);
      var tKant = pl.toilet.kant === 'rechts' ? -1 : 1;
      wandProduct('rolhouder', pl.toilet.wand,
                  tl + tKant * ((pl.toilet.breed || .78) * 500 + 120), 'Toiletrolhouder', 700);
    }
    if (pl.bad) {
      wandProduct('badkraan', pl.bad.kant === 'rechts' ? 'rechts' : 'links',
                  R.d - afgerond((pl.bad.z + pl.bad.rz) * 1000), 'Badkraan', AANNAME.hBadkraan);
    }

    /* ---- deur en raam ----
       Zonder deur is een plattegrond geen plattegrond, dus er staat er altijd
       een. Waar hij staat weet de configurator niet; hij komt in het midden van
       de wand die is opgegeven, en dat is een berekende maat en geen gemeten. */
    openingenVan(R, bouw, bron).forEach(function (o) { M.openingen.push(o); });

    /* ---- vrije gebruiksruimte ----
       Wat er vóór een product vrij moet blijven om het te kunnen gebruiken.
       Richtlijnen, geen wet, en dus als zodanig gemerkt. Ze zijn er om te laten
       zien dat een deur niet tegen het toilet openslaat, niet om een keuring te
       doorstaan. */
    M.producten.forEach(function (p) {
      if (!p.vlak) return;
      var eis = { toilet: AANNAME.vrijToilet, wastafel: AANNAME.vrijWastafel,
                  douche: AANNAME.vrijDouche, bad: AANNAME.vrijBad }[p.sleutel];
      if (!eis) return;
      var v = { x0: p.vlak.x0, x1: p.vlak.x1, y0: p.vlak.y0, y1: p.vlak.y1 };
      if (p.sleutel === 'bad') {
        // een bad stap je over de lange zijde in
        if (p.wand === 'links') { v.x0 = p.vlak.x1; v.x1 = p.vlak.x1 + eis; }
        else { v.x1 = p.vlak.x0; v.x0 = p.vlak.x0 - eis; }
      } else if (p.wand === 'achter') { v.y0 = p.vlak.y1; v.y1 = p.vlak.y1 + eis; }
      else if (p.wand === 'voor')   { v.y1 = p.vlak.y0; v.y0 = p.vlak.y0 - eis; }
      else if (p.wand === 'links')  { v.x0 = p.vlak.x1; v.x1 = p.vlak.x1 + eis; }
      else                          { v.x1 = p.vlak.x0; v.x0 = p.vlak.x0 - eis; }
      if (p.sleutel === 'toilet' && (p.wand === 'achter' || p.wand === 'voor')) {
        var hart = (p.vlak.x0 + p.vlak.x1) / 2;
        v.x0 = hart - AANNAME.vrijToiletBreed / 2;
        v.x1 = hart + AANNAME.vrijToiletBreed / 2;
      }
      M.vrij.push({ product: p.sleutel, eis: eis, vlak: v, herkomst: 'richtlijn' });
    });

    /* ---- draaicirkels ----
       De deur, en de deur van een douchecabine. Een kwartcirkel vanaf het
       draaipunt met de bladbreedte als straal — dat is wat er werkelijk
       doorheen zwaait. */
    M.draaicirkels = [];
    M.openingen.forEach(function (o) {
      if (o.soort !== 'deur') return;
      var start = o.hart - o.breedte / 2, eind = o.hart + o.breedte / 2;
      var scharnier = o.draai === 'rechts' ? eind : start;
      M.draaicirkels.push({
        van: 'deur', punt: opWand(R, o.wand, scharnier, 0),
        naarBinnen: o.naar !== 'buiten',
        straal: o.breedte, wand: o.wand, richting: o.draai
      });
    });

    /* ---- minimale doorgang ----
       De smalste plek waar iemand nog langs moet. Niet de smalste plek in de
       hele ruimte — dat is altijd een hoek — maar tussen de spullen die
       tegenover elkaar staan. */
    var opLinks = 0, opRechts = 0, opAchter = 0, opVoor = 0;
    M.producten.forEach(function (p) {
      if (!p.vlak) return;
      if (p.wand === 'links' || (p.sleutel === 'douche' && p.kant === 'links')) {
        opLinks = Math.max(opLinks, p.vlak.x1);
      } else if (p.wand === 'rechts' || (p.sleutel === 'douche' && p.kant === 'rechts')) {
        opRechts = Math.max(opRechts, R.b - p.vlak.x0);
      }
      if (p.wand === 'achter') opAchter = Math.max(opAchter, p.vlak.y1);
      if (p.wand === 'voor') opVoor = Math.max(opVoor, R.d - p.vlak.y0);
    });
    M.doorgang = {
      breedte: Math.max(0, R.b - opLinks - opRechts),
      diepte: Math.max(0, R.d - opAchter - opVoor),
      herkomst: 'berekend'
    };
    if (M.doorgang.breedte < 600 || M.doorgang.diepte < 600) {
      M.waarschuwingen.push('De vrije doorgang is smaller dan 600 mm (' +
        Math.min(M.doorgang.breedte, M.doorgang.diepte) + ' mm). Controleer of ' +
        'de indeling werkbaar is.');
    }

    /* ---- installatiepunten ----
       Per product wat er achter de tegel moet komen. De hoogtes zijn
       gebruikelijke waarden, geen opgemeten waarden, en staan als aanname in de
       legenda. De pósitie is wel hard: die volgt het product. */
    function punt(soort, wand, l, hoogte, bij) {
      M.installatie.push({ soort: soort, wand: wand, l: afgerond(l),
                           hoogte: afgerond(hoogte), bij: bij, herkomst: 'aanname' });
    }
    M.producten.forEach(function (p) {
      if (p.sleutel === 'wastafel') {
        punt('koudwater', p.wand, p.hart - 60, AANNAME.hWaterWastafel, 'wastafel');
        punt('warmwater', p.wand, p.hart + 60, AANNAME.hWaterWastafel, 'wastafel');
        punt('afvoer', p.wand, p.hart, AANNAME.hAfvoerWastafel, 'wastafel');
        punt('wcd', p.wand, p.hart + p.breedte / 2 + 150, AANNAME.hWcd, 'wastafel');
        punt('lichtpunt', p.wand, p.hart, R.h - 300, 'spiegel');
      } else if (p.sleutel === 'toilet') {
        punt('koudwater', p.wand, p.hart + 180, AANNAME.hWaterToilet, 'reservoir');
        punt('afvoer', p.wand, p.hart, AANNAME.hAfvoerToilet, 'closet');
      } else if (p.sleutel === 'douche') {
        var dh = p.hart;
        punt('koudwater', 'achter', dh - 75, AANNAME.hWaterDouche, 'douchekraan');
        punt('warmwater', 'achter', dh + 75, AANNAME.hWaterDouche, 'douchekraan');
        punt('afvoer', 'achter', dh, AANNAME.hAfvoerDouche, 'douchegoot');
      } else if (p.sleutel === 'bad') {
        var bl = p.hart;
        punt('koudwater', p.wand, bl - 75, AANNAME.hWaterBad, 'badkraan');
        punt('warmwater', p.wand, bl + 75, AANNAME.hWaterBad, 'badkraan');
        punt('afvoer', p.wand, bl, AANNAME.hAfvoerBad, 'bad');
      } else if (p.sleutel === 'radiator') {
        punt('radiatoraansluiting', p.wand, p.hart, AANNAME.hRadiator, 'radiator');
      }
    });
    punt('lichtpunt', 'achter', R.b / 2, AANNAME.hLichtpunt, 'plafond');

    /* ---- maatlijnen ----
       Drie niveaus, en ze staan bewust los van de tekening: een maatlijn is een
       gegeven met een waarde en een herkomst, niet een streepje. Zo kan de PDF
       er hetzelfde mee doen als het scherm, en kan een test controleren of de
       maat klopt zonder de SVG te moeten lezen. */
    M.maten = { plattegrond: [], wanden: {} };

    // niveau 1: de totale binnenmaten
    M.maten.plattegrond.push({
      niveau: 1, richting: 'x', van: 0, tot: R.b, waarde: R.b,
      tekst: 'Binnenmaat breedte', herkomst: 'ingevoerd', zijde: 'boven'
    });
    M.maten.plattegrond.push({
      niveau: 1, richting: 'y', van: 0, tot: R.d, waarde: R.d,
      tekst: 'Binnenmaat diepte', herkomst: 'ingevoerd', zijde: 'links'
    });

    /* De hap uit een L-vormige ruimte krijgt zijn eigen twee maten — breedte
       en diepte — los van de wandketting hierna. Zo staat er niet alleen "de
       wand stopt hier" maar ook hoe groot het afgeschuinde stuk precies is,
       en dat is de maat waar een metselaar iets aan heeft. */
    if (R.snede) {
      var sh = snedeHoeken(R);
      M.maten.plattegrond.push({
        niveau: 2, wand: sh.a, richting: (sh.a === 'links' || sh.a === 'rechts') ? 'y' : 'x',
        van: sh.ar[0], tot: sh.ar[1], waarde: R.snede.cb,
        tekst: 'Hap: breedte', herkomst: 'ingevoerd'
      });
      M.maten.plattegrond.push({
        niveau: 2, wand: sh.zij, richting: (sh.zij === 'links' || sh.zij === 'rechts') ? 'y' : 'x',
        van: sh.zr[0], tot: sh.zr[1], waarde: R.snede.cd,
        tekst: 'Hap: diepte', herkomst: 'ingevoerd'
      });
    }

    /* niveau 2: de ketting langs elke wand. Van hoek naar productrand naar
       productrand naar hoek — zo kan een uitvoerder aftekenen zonder op te
       tellen, en telt de som altijd op tot de totaalmaat. */
    function ketting(wand) {
      var lang = wandLengte(R, wand);
      var punten = [0];
      M.producten.forEach(function (p) {
        if (p.wand !== wand || !p.vlak) return;
        punten.push(p.hart - p.breedte / 2, p.hart + p.breedte / 2);
      });
      M.openingen.forEach(function (o) {
        if (o.wand !== wand) return;
        punten.push(o.hart - o.breedte / 2, o.hart + o.breedte / 2);
      });
      /* De hap breekt de ketting op precies dezelfde manier als een deur dat
         doet: op die grens houdt de wand op, dus daar hoort een streepje. */
      var snedeBereik = snedeOpWand(R, wand);
      if (snedeBereik) punten.push(snedeBereik[0], snedeBereik[1]);
      punten.push(lang);
      punten = punten.map(afgerond).filter(function (v, i, a) {
        return v >= 0 && v <= lang && a.indexOf(v) === i;
      }).sort(function (a, b) { return a - b; });
      var uit = [];
      for (var i = 0; i < punten.length - 1; i++) {
        if (punten[i + 1] - punten[i] < 1) continue;
        uit.push({ van: punten[i], tot: punten[i + 1], waarde: punten[i + 1] - punten[i] });
      }
      return uit;
    }
    WANDEN.forEach(function (w) {
      ketting(w).forEach(function (seg) {
        M.maten.plattegrond.push({
          niveau: 2, wand: w, richting: (w === 'links' || w === 'rechts') ? 'y' : 'x',
          van: seg.van, tot: seg.tot, waarde: seg.waarde,
          tekst: null, herkomst: 'berekend'
        });
      });
    });

    // niveau 3: de eigen maat van elk product, plus de afstand tot twee hoeken
    M.producten.forEach(function (p) {
      if (!p.vlak) return;
      var lang = wandLengte(R, p.wand);
      M.maten.plattegrond.push({
        niveau: 3, wand: p.wand, product: p.sleutel,
        van: p.hart - p.breedte / 2, tot: p.hart + p.breedte / 2, waarde: p.breedte,
        tekst: p.naam, herkomst: p.maatBron === 'catalogus' ? 'catalogus' : p.maatBron
      });
      p.referenties = [
        { vanaf: 'achterhoek ' + WANDNAAM[p.wand].toLowerCase(),
          waarde: afgerond(p.hart - p.breedte / 2), herkomst: 'berekend' },
        { vanaf: 'andere hoek ' + WANDNAAM[p.wand].toLowerCase(),
          waarde: afgerond(lang - p.hart - p.breedte / 2), herkomst: 'berekend' }
      ];
    });

    // per wand de hoogtematen voor het aanzicht
    WANDEN.forEach(function (w) {
      var wandInfo = M.wanden.filter(function (x) { return x.naam === w; })[0];
      var zichtbaarLang = wandInfo.zichtbaar[1] - wandInfo.zichtbaar[0];
      var rij = [{ niveau: 1, soort: 'hoogte', waarde: R.h, tekst: 'Kamerhoogte',
                   herkomst: M.herkomst.hoogte },
                 { niveau: 1, soort: 'breedte', waarde: zichtbaarLang,
                   tekst: 'Wandbreedte', herkomst: 'ingevoerd' }];
      if (wandInfo.afgesneden) {
        rij.push({ niveau: 2, soort: 'opmerking', waarde: null,
                   tekst: 'Deze wand loopt hier niet door: de ruimte zet ' +
                     'zich haaks voort. Zie de plattegrond voor de hap.',
                   herkomst: 'berekend' });
      }
      M.producten.forEach(function (p) {
        if (p.wand !== w) return;
        rij.push({ niveau: 2, soort: 'onderkant', product: p.sleutel,
                   waarde: p.montage, tekst: p.naam + ' onderkant',
                   herkomst: p.montageBron || 'aanname' });
        rij.push({ niveau: 2, soort: 'bovenkant', product: p.sleutel,
                   waarde: p.montage + p.hoogte, tekst: p.naam + ' bovenkant',
                   herkomst: p.montageBron || 'aanname' });
        rij.push({ niveau: 3, soort: 'uithoek', product: p.sleutel,
                   waarde: afgerond(p.hart - p.breedte / 2),
                   tekst: p.naam + ' vanaf de achterhoek', herkomst: 'berekend' });
      });
      M.openingen.forEach(function (o) {
        if (o.wand !== w) return;
        rij.push({ niveau: 2, soort: 'opening', product: o.soort, waarde: o.breedte,
                   tekst: (o.soort === 'deur' ? 'Deurbreedte' : 'Raambreedte'),
                   herkomst: o.herkomst.breedte });
        if (o.soort === 'raam') {
          rij.push({ niveau: 2, soort: 'borstwering', product: 'raam',
                     waarde: o.borstwering, tekst: 'Borstweringshoogte',
                     herkomst: o.herkomst.borstwering });
        }
      });
      M.maten.wanden[w] = rij;
    });

    /* ---- tegelverdeling ----
       De eerste hele tegel begint in het midden van de wand, zodat de snijmaat
       links en rechts gelijk is. Dat is hoe een tegelzetter het doet, en het
       maakt het verschil tussen een strook van 2 cm in de hoek en twee van 15. */
    var t = s.tegel || {};
    var tb = afgerond((t.breedte || .6) * 1000), th = afgerond((t.hoogte || .3) * 1000);
    var voeg = afgerond((t.voeg || .003) * 1000);
    M.tegel = { breedte: tb, hoogte: th, voeg: voeg, herkomst: 'ingevoerd', verdeling: {} };
    WANDEN.forEach(function (w) {
      var lang = wandLengte(R, w), stap = tb + voeg;
      var heel = Math.floor((lang - voeg) / stap);
      var rest = lang - heel * stap;
      M.tegel.verdeling[w] = {
        heleTegels: heel, snijmaat: Math.round(rest / 2),
        rijen: Math.ceil(R.h / (th + voeg)),
        bovensteRij: R.h - Math.floor(R.h / (th + voeg)) * (th + voeg)
      };
    });

    /* ---- natte zones ----
       Waar de waterdichting doorloopt. In en om de douche tot 2 meter hoog, en
       rond het bad tot een halve meter boven de rand. */
    M.natteZones = [];
    /* Een natte zone loopt niet door de wand heen. Zonder deze begrenzing stak
       de doucheruimte twintig centimeter de tekening uit, en dan lijkt het of
       er buiten de badkamer ook gekimd moet worden. */
    var binnen = function (v) {
      return { x0: Math.max(0, v.x0), x1: Math.min(R.b, v.x1),
               y0: Math.max(0, v.y0), y1: Math.min(R.d, v.y1) };
    };
    var douche = M.producten.filter(function (p) { return p.sleutel === 'douche'; })[0];
    if (douche) {
      M.natteZones.push({ naam: 'Doucheruimte', hoogte: 2000, vlak: binnen({
        x0: douche.vlak.x0 - 200, x1: douche.vlak.x1 + 200,
        y0: douche.vlak.y0, y1: douche.vlak.y1 + 200 }) });
    }
    var bad = M.producten.filter(function (p) { return p.sleutel === 'bad'; })[0];
    if (bad) {
      M.natteZones.push({ naam: 'Badzone', hoogte: bad.hoogte + 500, vlak: binnen({
        x0: bad.vlak.x0 - 100, x1: bad.vlak.x1 + 100,
        y0: bad.vlak.y0 - 100, y1: bad.vlak.y1 + 100 }) });
    }

    /* ---- aannames en waarschuwingen ----
       Alles wat op de tekening staat maar niet is opgemeten, op één plek, zodat
       het in de PDF onder elkaar komt te staan en niemand het kan missen. */
    M.openingen.forEach(function (o) {
      if (!o.ingekort) return;
      M.waarschuwingen.push('Het raam van ' + o.gevraagdeHoogte + ' mm past niet ' +
        'onder het plafond bij een borstwering van ' + o.borstwering +
        ' mm; op de tekening staat ' + o.hoogte + ' mm. Controleer de invoer.');
    });
    /* De vrije doorgang hierboven trekt productcontouren af van de volle
       rechthoek B×D — bij een L-vorm weet die som niet dat een stuk van die
       rechthoek al helemaal niet bestaat. Meestal geeft dat een te ruime maat
       (de hap ligt vaak buiten het looppad), maar gegarandeerd is dat niet, en
       een tekening die dat niet zegt is gevaarlijker dan een die het toegeeft. */
    if (R.snede) {
      M.waarschuwingen.push('Deze ruimte heeft een hap uit een hoek. De vrije ' +
        'doorgang hierboven is berekend als bij een gewone rechthoek en houdt ' +
        'nog geen rekening met de hap. Controleer de looproute op de plattegrond.');
    }

    M.aannames = [];
    if (M.herkomst.wanddikte !== 'ingevoerd') {
      M.aannames.push('Wanddikte ' + R.wanddikte + ' mm aangenomen, niet ingemeten.');
    }
    if (M.herkomst.hoogte !== 'ingevoerd') {
      M.aannames.push('Plafondhoogte ' + R.h + ' mm aangenomen, niet ingemeten.');
    }
    M.openingen.forEach(function (o) {
      var naam = o.soort === 'deur' ? 'Deur' : 'Raam';
      if (o.herkomst.hart !== 'ingevoerd') {
        M.aannames.push(naam + 'positie berekend op het midden van de ' +
          WANDNAAM[o.wand].toLowerCase() + ', niet ingemeten.');
      }
      if (o.herkomst.breedte !== 'ingevoerd') {
        M.aannames.push(naam + 'breedte ' + o.breedte + ' mm aangenomen, niet ingemeten.');
      }
    });
    if (M.vrij.length) {
      M.aannames.push('Vrije gebruiksruimte volgens gangbare richtlijnen, geen norm.');
    }
    M.aannames.push('Montagehoogtes zonder catalogusmaat zijn gebruikelijke waarden.');
    M.aannames.push('Installatiehoogtes zijn indicatief; posities volgen de producten.');

    /* ---- staat van de hoogtes ----
       Naast elke toegepaste hoogte de Nederlandse gebruikelijke maat, zodat een
       uitvoerder in één oogopslag ziet of er iets bijzonders aan de hand is. Dit
       vergelijkt met wat er echt op de tekening staat — niet met een tweede
       tabel met eigen getallen, want dan gaan die twee uit elkaar lopen. */
    M.hoogtes = hoogtestaat(M, R, cat);

    M.project = s.project || {};
    return M;
  }

  /* ------------------------------------------------- hoogtes langs de meetlat */

  /** De toegepaste hoogte van één onderdeel, uit het model dat er al ligt.
      Geeft `null` als het onderdeel niet in deze badkamer zit — dan blijft de
      richtlijn staan als naslag, maar er valt niets te vergelijken. */
  function toegepasteHoogte(M, cat, id) {
    function product(sleutel) {
      return M.producten.filter(function (p) { return p.sleutel === sleutel; })[0];
    }
    function inst(soort, bij) {
      return M.installatie.filter(function (i) {
        return i.soort === soort && i.bij === bij;
      })[0];
    }
    /* Een artikel uit een stapel op zijn onderkant plus zijn eigen hoogte. Zo
       staat de bovenkant van de pot op de tekening en niet de onderkant. */
    function uitStapel(sleutel, test, wat) {
      var p = product(sleutel); if (!p) return null;
      var pid = (p.pids || []).filter(function (x) { return test(cat[x] || {}); })[0];
      if (!pid) return null;
      var c = cat[pid] || {};
      if (c.y == null) return null;
      var y = afgerond(c.y * 1000);
      return { waarde: wat === 'boven' ? y + afgerond((c.h || 0) * 1000) : y,
               herkomst: 'catalogus', pid: pid };
    }
    function vanProduct(sleutel, wat) {
      var p = product(sleutel); if (!p) return null;
      return { waarde: wat === 'boven' ? p.montage + p.hoogte : p.montage,
               herkomst: p.montageBron || 'aanname', pid: p.pid };
    }
    function vanPunt(soort, bij) {
      var i = inst(soort, bij); if (!i) return null;
      return { waarde: i.hoogte, herkomst: i.herkomst, pid: null };
    }

    /* De bovenkant van een wastafel is niet de bovenkant van het meubel. Bij een
       opzetkom ligt de rand tot vijftien centimeter hoger, en dat is de hoogte
       waarop je je handen wast — dus dat is de hoogte die vergeleken hoort te
       worden. Alleen de kast pakken gaf 950 waar het in werkelijkheid 1010 is. */
    if (id === 'wastafel') {
      var basis = vanProduct('wastafel', 'boven');
      var kom = uitStapel('wastafel', function (c) {
        return c.cat === 'Wastafel';
      }, 'boven');
      if (!basis) return kom;
      if (kom && kom.waarde > basis.waarde) return kom;
      return basis;
    }
    if (id === 'wastafelkraan') return vanProduct('wastafelkraan', 'onder');
    if (id === 'wastafelwater') return vanPunt('koudwater', 'wastafel');
    if (id === 'wastafelafvoer')return vanPunt('afvoer', 'wastafel');
    if (id === 'toilet')        return vanProduct('toilet', 'boven');
    if (id === 'spoelplaat')    return uitStapel('toilet', function (c) {
                                  return /spoel|bedieningsplaat/i.test(c.naam || ''); }, 'onder');
    if (id === 'toiletafvoer')  return vanPunt('afvoer', 'closet');
    if (id === 'toiletwater')   return vanPunt('koudwater', 'reservoir');
    if (id === 'douchekraan')   return vanProduct('douchesysteem', 'onder');
    if (id === 'douchekop')     return vanProduct('douchesysteem', 'boven');
    if (id === 'glijstang')     return uitStapel('douchesysteem', function (c) {
                                  return /glijstang/i.test(c.naam || ''); }, 'boven');
    if (id === 'badkraan')      return vanProduct('badkraan', 'onder');
    if (id === 'spiegel')       return uitStapel('wastafel', function (c) {
                                  return c.cat === 'Spiegel'; }, 'boven');
    if (id === 'wcd')           return vanPunt('wcd', 'wastafel');
    return null;                       // urinoir: geen artikel in de catalogus
  }

  function hoogtestaat(M, R, cat) {
    return NLHOOGTE.map(function (r) {
      var t = toegepasteHoogte(M, cat, r.id);
      var rij = {
        id: r.id, naam: r.naam, van: r.van, tot: r.tot, typisch: r.typisch,
        meet: r.meet, bron: r.bron,
        toegepast: t ? t.waarde : null,
        herkomst: t ? t.herkomst : null,
        pid: t ? t.pid : null
      };
      /* Drie uitkomsten, en het verschil telt. "Niet aanwezig" is iets anders
         dan "wijkt af": het eerste is geen fout, het tweede is een vraag aan de
         klant. Ze op één hoop gooien maakt de tabel waardeloos. */
      rij.status = t == null ? 'nvt'
                 : (rij.toegepast >= r.van && rij.toegepast <= r.tot) ? 'binnen'
                 : 'afwijkend';
      if (rij.status === 'afwijkend') {
        rij.afwijking = rij.toegepast < r.van ? rij.toegepast - r.van
                                              : rij.toegepast - r.tot;
        M.waarschuwingen.push(r.naam + ' staat op ' + rij.toegepast +
          ' mm; in Nederland gebruikelijk is ' + r.van + '-' + r.tot +
          ' mm (' + r.bron + '). Controleer of dit bewust is.');
      }
      return rij;
    });
  }

  window.NGTekening = { model: model, openingen: openingenVan, AANNAME: AANNAME,
                        NLHOOGTE: NLHOOGTE,
                        WANDEN: WANDEN, WANDNAAM: WANDNAAM, opWand: opWand,
                        wandLengte: wandLengte, vloerPolygoon: vloerPolygoon,
                        snedeOpWand: snedeOpWand };
})();
