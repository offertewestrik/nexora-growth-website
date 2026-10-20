/* Technisch tekeningenpakket voor de dakkapel- en nokverhogingconfigurators.
 *
 * WAAROM ÉÉN MODULE VOOR TWEE PRODUCTEN
 * Het zijn twee verschillende ingrepen — een dakkapel maakt een gat in de kap
 * met een raveling eromheen, bij een nokverhoging gaat de kap zélf omhoog —
 * maar het papier eromheen is identiek: hetzelfde naamhoekje, dezelfde
 * maatlijnen, dezelfde bestellijst, dezelfde aannamepagina. Twee bestanden
 * zouden die helft verdubbelen, en verdubbelde opmaak loopt uit elkaar zodra
 * er één ding verandert. Zelfde afweging als bij het houtbouwpakket, dat
 * overkapping, aluminium en poolhouse in één module dekt.
 *
 * WAAR DE MATEN VANDAAN KOMEN
 * Niet uit dit bestand. De materiaalstaatmodules rekenen de samenstelling al
 * helemaal door — nokgordingprofiel op overspanning, sporen op hart-op-hart,
 * de schuine lengte van de dakopening — en geven dat terug in `invoer`. Deze
 * module leest dat en tekent het. Dat is geen luiheid maar de enige manier om
 * te voorkomen dat het blad iets anders zegt dan de lijst ernaast: één getal
 * op twee plekken loopt vroeg of laat uit elkaar, en dan staat de timmerman
 * met twee papieren die elkaar tegenspreken.
 *
 * Om dezelfde reden komen de bestellijst en de aannamepagina rechtstreeks uit
 * `posten`, `aannames` en `controle` van diezelfde staat. Wat op het blad
 * staat is dus letterlijk wat de materiaalstaatknop ook toont.
 *
 * WAT DIT NIET IS
 * Een voorontwerp, geen gewaarmerkte constructieberekening en geen
 * vergunningsset. Dat staat op elk blad in het naamhoekje en het staat
 * voluit op de aannamepagina. Een dakkapel is meestal vergunningsvrij op het
 * achterdakvlak; een nokverhoging verandert de bouwhoogte en is dat nooit.
 *
 * Gebruik op de pagina:
 *   <script src="./assets/technische-tekeningen-kap.js" defer></script>
 *   NGTekeningenKap.init({ product: 'dakkapel' })      // of 'nokverhoging'
 * De init hangt een knop "Technische tekeningen" naast de offerteknop.
 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var mm = function (m) { return Math.round(m * 1000); };
  /* A3 liggend is 420 mm breed; het tekenvlak is 1120 eenheden. Eén meter op
     1:n is dus 1120/420*1000/n eenheden — dan klopt de schaal op papier ook
     echt, en kan iemand er met een rolmaat overheen. */
  var scaleM = function (n) { return (1120 / 420) * (1000 / n); };
  var graden = function (g) { return g * Math.PI / 180; };

  var GEVEL = {
    creme: 'crème (RAL 9001)', lichtgrijs: 'lichtgrijs (RAL 7035)',
    antraciet: 'antraciet (RAL 7016)', zwart: 'zwart (RAL 9005)',
    thermowood: 'Thermowood, verticaal geschroefd',
    'zink-platen': 'zinken vlakke platen'
  };
  var KOZIJN = {
    wit: 'wit (RAL 9016)', creme: 'crème (RAL 9001)',
    antraciet: 'antraciet (RAL 7016)', zwart: 'zwart (RAL 9005)'
  };
  var BINNEN = {
    casco: 'Casco opgeleverd', gipsplaten: 'Gipsplaten, niet afgewerkt',
    afgewerkt: 'Afgewerkt: gestuct en geschilderd'
  };

  /* ---------- het model ---------- */

  /** Leest de materiaalstaat van het product en maakt daar een tekenmodel van.
   *  @returns het model, of null als de staatmodule niet geladen is. */
  function model(product, sel) {
    var mod = product === 'nokverhoging' ? global.NGNokverhogingMateriaal
                                         : global.NGDakkapelMateriaal;
    if (!mod || typeof mod.staat !== 'function') return null;
    var staat = mod.staat(sel || {});
    var v = staat.invoer;
    var nok = product === 'nokverhoging';
    return {
      product: product,
      nok: nok,
      v: v,
      posten: staat.posten,
      aannames: staat.aannames,
      controle: staat.controle,
      project: (nok ? 'NV-' : 'DK-') + (nok ? mm(v.woningbreedte) : mm(v.breedte)) +
               '-' + v.glasvakken + 'V',
      datum: new Date().toLocaleDateString('nl-NL'),
      revisie: 'P01',
      gevel: GEVEL[v.afwerking] || v.afwerking,
      kozijn: KOZIJN[v.kozijnkleur] || v.kozijnkleur,
      binnen: BINNEN[v.binnen] || v.binnen,
      raveel: (!nok && mod.raveelProfiel) ? mod.raveelProfiel(v.breedte) : null
    };
  }

  /* ---------- de opmaak van een blad ---------- */

  function styles() {
    return '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#111}' +
      '.micro{font-size:9px;letter-spacing:.45px}.tiny{font-size:11px}.small{font-size:14px}' +
      '.label{font-size:16px}.title{font-size:25px;font-weight:700;letter-spacing:.4px}' +
      '.brand{font-size:15px;font-weight:800}.bold{font-weight:700}' +
      '.stamp{font-size:10px;font-weight:800;fill:#a32323}.dimtxt{font-size:13px;fill:#333}' +
      '.note{font-size:12px;fill:#333}.heavy{stroke:#111;stroke-width:6;fill:none}' +
      '.medium{stroke:#222;stroke-width:2.2;fill:none}.thin{stroke:#555;stroke-width:.9;fill:none}' +
      '.dash{stroke:#777;stroke-width:1.2;stroke-dasharray:9 6;fill:none}' +
      '.bestaand{stroke:#9a9a9a;stroke-width:2;stroke-dasharray:12 7;fill:none}' +
      '.dim{stroke:#555;stroke-width:1;fill:none;marker-start:url(#karr);marker-end:url(#karr)}' +
      '.hout{fill:url(#khout);stroke:#333}.glas{fill:#e8f5fa;stroke:#222}' +
      '.gevelvlak{fill:#dcd8d0;stroke:#333}.isolatie{fill:#fdeccf;stroke:#b08d4a}' +
      '.pan{fill:#c9714f;stroke:#8d4a30}.sheetbg{fill:white}.metsel{fill:#e3dcd2;stroke:#444}' +
      '.tag{fill:#fff;stroke:#111;stroke-width:1.4}</style>';
  }
  function defs() {
    return '<defs><marker id="karr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">' +
      '<path d="M8,4 L0,0 L0,8 z" fill="#555"/></marker>' +
      '<pattern id="khout" width="8" height="8" patternUnits="userSpaceOnUse">' +
      '<rect width="8" height="8" fill="#f0dfb8"/><path d="M0 8L8 0" stroke="#b99a65" stroke-width=".7"/>' +
      '</pattern></defs>';
  }
  function sheetStart() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 770" role="img">' +
      defs() + styles() + '<rect width="1120" height="770" class="sheetbg"/>';
  }

  /* Wiens naam staat er in het naamhoekje? Die van het bedrijf dat de tekening
     levert, en dat is niet altijd het onze. Draait deze configurator onder de
     naam van een ander bedrijf, dan is een blad met ONZE naam precies het
     verkeerde bewijs: de uitvoerder kijkt daar als eerste. Zonder bedrijf
     staat NGMerk op 'Next Growth' en verandert er niets. */
  function merknaam() {
    try {
      var m = global.NGMerk && global.NGMerk.merk && global.NGMerk.merk();
      if (m && m.naam) return String(m.naam).toUpperCase();
    } catch (e) { /* de merkmodule staat er niet: dan onze eigen naam */ }
    return 'NEXT GROWTH';
  }

  function kader(m, blad, titel, schaal) {
    var merk = merknaam() + ' · TECHNISCHE ' + (m.nok ? 'NOKVERHOGING' : 'DAKKAPEL');
    return '<rect x="20" y="20" width="1080" height="730" fill="#fff" stroke="#111" stroke-width="2"/>' +
      '<line x1="20" y1="680" x2="1100" y2="680" stroke="#111" stroke-width="1"/>' +
      '<line x1="650" y1="680" x2="650" y2="750" stroke="#111"/>' +
      '<line x1="790" y1="680" x2="790" y2="750" stroke="#111"/>' +
      '<line x1="900" y1="680" x2="900" y2="750" stroke="#111"/>' +
      '<line x1="1000" y1="680" x2="1000" y2="750" stroke="#111"/>' +
      '<text x="38" y="704" class="brand">' + merk + '</text>' +
      '<text x="38" y="728" class="tiny">' + esc(m.project) + ' · ' + esc(titel) + '</text>' +
      '<text x="665" y="702" class="micro">DATUM</text><text x="665" y="727" class="tiny bold">' + esc(m.datum) + '</text>' +
      '<text x="805" y="702" class="micro">TEKENING</text><text x="805" y="727" class="small bold">' + esc(blad) + '</text>' +
      '<text x="915" y="702" class="micro">SCHAAL</text><text x="915" y="727" class="tiny bold">' + esc(schaal) + '</text>' +
      '<text x="1015" y="702" class="micro">REVISIE</text><text x="1015" y="727" class="tiny bold">' + esc(m.revisie) + '</text>' +
      '<text x="1080" y="744" text-anchor="end" class="stamp">VOORONTWERP</text>';
  }

  function maatH(x1, x2, y, objY, label) {
    return '<line x1="' + x1 + '" y1="' + objY + '" x2="' + x1 + '" y2="' + (y + 8) + '" class="thin"/>' +
      '<line x1="' + x2 + '" y1="' + objY + '" x2="' + x2 + '" y2="' + (y + 8) + '" class="thin"/>' +
      '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" class="dim"/>' +
      '<text x="' + ((x1 + x2) / 2) + '" y="' + (y - 7) + '" text-anchor="middle" class="dimtxt">' + esc(label) + '</text>';
  }
  function maatV(x, y1, y2, objX, label) {
    var cy = (y1 + y2) / 2;
    return '<line x1="' + objX + '" y1="' + y1 + '" x2="' + (x - 8) + '" y2="' + y1 + '" class="thin"/>' +
      '<line x1="' + objX + '" y1="' + y2 + '" x2="' + (x - 8) + '" y2="' + y2 + '" class="thin"/>' +
      '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" class="dim"/>' +
      '<text x="' + (x - 8) + '" y="' + cy + '" transform="rotate(-90 ' + (x - 8) + ' ' + cy + ')" ' +
      'text-anchor="middle" class="dimtxt">' + esc(label) + '</text>';
  }
  function schaalbalk(rechts, y, n) {
    var u = scaleM(n), x = rechts - 2 * u;
    return '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 2 * u) + '" y2="' + y + '" stroke="#111" stroke-width="4"/>' +
      '<line x1="' + x + '" y1="' + (y - 7) + '" x2="' + x + '" y2="' + (y + 7) + '" class="thin"/>' +
      '<line x1="' + (x + u) + '" y1="' + (y - 7) + '" x2="' + (x + u) + '" y2="' + (y + 7) + '" class="thin"/>' +
      '<line x1="' + (x + 2 * u) + '" y1="' + (y - 7) + '" x2="' + (x + 2 * u) + '" y2="' + (y + 7) + '" class="thin"/>' +
      '<text x="' + x + '" y="' + (y + 22) + '" class="micro">0</text>' +
      '<text x="' + (x + u) + '" y="' + (y + 22) + '" text-anchor="middle" class="micro">1 m</text>' +
      '<text x="' + (x + 2 * u) + '" y="' + (y + 22) + '" text-anchor="end" class="micro">2 m</text>';
  }

  /* Het kozijn, in vooraanzicht. Wordt bij allebei de producten getekend: de
     dakkapel heeft hem in de voorwand, de nokverhoging in de opgemetselde
     gevel. De draaiende delen zitten in de buitenste vakken — zo zet de
     configurator ze ook — en krijgen het gebruikelijke driehoekje met de punt
     naar de scharnierzijde. */
  function kozijnVlak(x, y, w, h, vakken, draaiend) {
    var out = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="glas"/>';
    var vw = w / vakken;
    for (var i = 1; i < vakken; i++) {
      out += '<rect x="' + (x + vw * i - 3) + '" y="' + y + '" width="6" height="' + h + '" fill="#fff" stroke="#222" stroke-width="1.2"/>';
    }
    for (var d = 0; d < draaiend && d < vakken; d++) {
      /* Even nummers links, oneven rechts: de configurator vult van buiten
         naar binnen, dus zo staan ze op het blad waar ze in het echt zitten. */
      var idx = d % 2 === 0 ? Math.floor(d / 2) : vakken - 1 - Math.floor(d / 2);
      var vx = x + vw * idx, links = idx < vakken / 2;
      out += '<path d="M' + (vx + (links ? vw : 0)) + ' ' + (y + 4) +
        ' L' + (vx + (links ? 4 : vw - 4)) + ' ' + (y + h / 2) +
        ' L' + (vx + (links ? vw : 0)) + ' ' + (y + h - 4) + '" class="dash"/>';
    }
    out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="#222" stroke-width="2.4"/>';
    return out;
  }

  /* ---------- gedeelde bladen ---------- */

  function voorblad(m) {
    var v = m.v;
    var naam = m.nok ? 'NOKVERHOGING' : 'DAKKAPEL';
    var out = sheetStart() + kader(m, m.nok ? 'NV-00' : 'DK-00', 'TEKENINGENLIJST', 'n.v.t.');
    out += '<text x="55" y="78" class="title">VOORONTWERP · ' + naam + '</text>';
    out += '<text x="55" y="112" class="label bold">' + esc(m.project) + '</text>';
    out += '<rect x="55" y="145" width="500" height="256" fill="#f6f2e7" stroke="#222"/>' +
      '<text x="78" y="180" class="label bold">PROJECTGEGEVENS</text>';
    var reg = m.nok ? [
      'Woningtype: ' + esc(v.woningtype),
      'Woningbreedte: ' + mm(v.woningbreedte) + ' mm (rekenmaat)',
      'Noklijn omhoog: ' + mm(v.verhoging) + ' mm',
      'Nieuw dakvlak: ' + mm(v.dakvlakSchuin) + ' mm schuin · ' + v.dakOppervlak + ' m²',
      'Kozijn: ' + v.glasvakken + ' vakken · ' + mm(v.kozijnBreedte) + ' × ' + mm(v.hoogteKozijn) + ' mm',
      'Uitvoering: ' + esc(v.uitvoering) + ' · gevel ' + esc(m.gevel)
    ] : [
      'Dakvlak: ' + esc(v.dakvlak) + 'dakvlak · helling ' + v.dakhelling + '°',
      'Buitenmaat: ' + mm(v.breedte) + ' × ' + mm(v.diepte) + ' mm (b × d)',
      'Hoogte voorwand: ' + mm(v.hoogte) + ' mm',
      'Dakopening: ' + mm(v.openingSchuin) + ' mm schuin · ' + v.opening + ' m²',
      'Kozijn: ' + v.glasvakken + ' vakken · ' + mm(v.hoogteKozijn) + ' mm dagmaat',
      'Uitvoering: ' + esc(v.uitvoering) + ' · gevel ' + esc(m.gevel)
    ];
    reg.forEach(function (t, i) {
      out += '<text x="78" y="' + (212 + i * 26) + '" class="small">' + t + '</text>';
    });
    out += '<text x="610" y="160" class="label bold">TEKENINGENLIJST</text>';
    var lijst = m.nok ? [
      ['NV-01', 'Doorsnede · bestaand en nieuw'],
      ['NV-02', 'Vooraanzicht · opgaande gevel'],
      ['NV-03', 'Sporenplan · nieuw dakvlak'],
      ['C-01', 'Nokgording · overspanning en oplegging'],
      ['M-01', 'Materiaalstaat / bestellijst'],
      ['M-02', 'Uitgangspunten en aannames']
    ] : [
      ['DK-01', 'Vooraanzicht'],
      ['DK-02', 'Doorsnede · aansluiting op het dakvlak'],
      ['DK-03', 'Dakvlak · uitslag van de opening'],
      ['C-01', 'Raveling · constructie rond de opening'],
      ['M-01', 'Materiaalstaat / bestellijst'],
      ['M-02', 'Uitgangspunten en aannames']
    ];
    lijst.forEach(function (r, i) {
      out += '<text x="610" y="' + (192 + i * 26) + '" class="small bold">' + r[0] + '</text>' +
        '<text x="678" y="' + (192 + i * 26) + '" class="small">' + esc(r[1]) + '</text>';
    });
    out += '<rect x="55" y="430" width="1010" height="176" fill="#fdf9ec" stroke="#b9a75a"/>' +
      '<text x="78" y="462" class="label bold">STATUS</text>' +
      '<text x="78" y="490" class="small">Parametrisch voorontwerp uit de configurator. De maatvoering volgt de gekozen samenstelling.</text>' +
      '<text x="78" y="516" class="small">Geen gewaarmerkte constructieberekening: profielmaten zijn richtwaarden ter controle door de constructeur.</text>' +
      '<text x="78" y="542" class="small">' + (m.nok
        ? 'Een nokverhoging verandert de bouwhoogte: omgevingsvergunning met welstandstoets is altijd nodig.'
        : 'Een dakkapel op het achterdakvlak is vaak vergunningsvrij. De gemeente heeft het laatste woord.') + '</text>' +
      '<text x="78" y="568" class="small">Definitieve maten worden vastgesteld na het inmeten ter plaatse.</text>';
    return out + '</svg>';
  }

  /* De bestellijst komt regelrecht uit de materiaalstaat, gegroepeerd zoals
     die hem zelf groepeert. Zo staat er op het blad letterlijk wat de
     materiaalstaatknop toont — geen tweede lijst die kan afwijken.

     Past het niet op één blad, dan komt er een tweede. Afkappen zou de
     onderste posten stilletjes laten verdwijnen, en juist die achterin
     (vergunning, stelposten) zijn degene die iemand vergeet. */
  function bestellijsten(m) {
    var perBlad = 13, bladen = [], rij = [];
    var groep = null;
    m.posten.forEach(function (p) {
      if (p.groep !== groep) { groep = p.groep; rij.push({ kop: groep }); }
      rij.push(p);
    });
    for (var i = 0; i < rij.length; i += perBlad) bladen.push(rij.slice(i, i + perBlad));
    return bladen.map(function (blok, n) {
      var blad = 'M-01' + (bladen.length > 1 ? '.' + (n + 1) : '');
      var out = sheetStart() + kader(m, blad, 'MATERIAALSTAAT / BESTELLIJST', 'n.v.t.');
      out += '<text x="55" y="70" class="title">MATERIAALSTAAT / BESTELLIJST' +
        (bladen.length > 1 ? '  ·  ' + (n + 1) + ' van ' + bladen.length : '') + '</text>';
      out += '<line x1="55" y1="120" x2="1065" y2="120" stroke="#111" stroke-width="2"/>' +
        '<text x="70" y="112" class="micro bold">AANTAL</text>' +
        '<text x="150" y="112" class="micro bold">EENHEID</text>' +
        '<text x="240" y="112" class="micro bold">OMSCHRIJVING</text>' +
        '<text x="770" y="112" class="micro bold">OPMERKING</text>';
      var y = 150;
      blok.forEach(function (p) {
        if (p.kop) {
          y += 10;
          out += '<text x="55" y="' + y + '" class="small bold">' + esc(p.kop).toUpperCase() + '</text>';
          y += 26;
          return;
        }
        out += '<text x="128" y="' + y + '" text-anchor="end" class="small bold">' +
            esc(String(p.hoeveelheid).replace('.', ',')) + '</text>' +
          '<text x="150" y="' + y + '" class="small">' + esc(p.eenheid) + '</text>' +
          '<text x="240" y="' + y + '" class="small">' + esc(p.omschrijving) + '</text>' +
          '<text x="770" y="' + y + '" class="tiny">' + esc(p.opmerking) + '</text>' +
          '<line x1="55" y1="' + (y + 11) + '" x2="1065" y2="' + (y + 11) + '" class="thin" opacity=".35"/>';
        y += 34;
      });
      out += '<text x="55" y="655" class="note">Indicatieve bestellijst voor de werkvoorbereiding, geen productiestuklijst. ' +
        'Hoeveelheden inclusief het gebruikelijke zaag- en snijverlies.</text>';
      return out + '</svg>';
    });
  }

  /* De aannames en de controlepunten komen ook uit de staat. De controlepunten
     staan apart en in rood: dat zijn de dingen die iemand anders moet
     bevestigen voordat er gebouwd wordt, en die horen niet weg te vallen
     tussen de gewone aannames. */
  function aannamesBlad(m) {
    var out = sheetStart() + kader(m, 'M-02', 'UITGANGSPUNTEN EN AANNAMES', 'n.v.t.');
    out += '<text x="55" y="70" class="title">UITGANGSPUNTEN EN AANNAMES</text>';
    var y = 118;
    out += '<text x="55" y="' + y + '" class="label bold">AANNAMES</text>';
    y += 30;
    m.aannames.forEach(function (t) {
      var regels = wikkel(t, 118);
      out += '<circle cx="72" cy="' + (y - 5) + '" r="4" fill="#B38900"/>';
      regels.forEach(function (r, i) {
        out += '<text x="94" y="' + (y + i * 19) + '" class="small">' + esc(r) + '</text>';
      });
      y += regels.length * 19 + 12;
    });
    y += 14;
    out += '<line x1="55" y1="' + (y - 22) + '" x2="1065" y2="' + (y - 22) + '" class="thin"/>';
    out += '<text x="55" y="' + y + '" class="label bold" fill="#a32323">TE BEVESTIGEN DOOR DE CONSTRUCTEUR</text>';
    y += 30;
    m.controle.forEach(function (t) {
      var regels = wikkel(t, 118);
      out += '<circle cx="72" cy="' + (y - 5) + '" r="4" fill="#a32323"/>';
      regels.forEach(function (r, i) {
        out += '<text x="94" y="' + (y + i * 19) + '" class="small">' + esc(r) + '</text>';
      });
      y += regels.length * 19 + 12;
    });
    return out + '</svg>';
  }

  /* SVG breekt geen tekst af, dus dat doen we zelf. Op tekens tellen en niet
     op pixels: het is Arial op een vaste bladbreedte, en een letterteller die
     je kunt nalezen is hier meer waard dan een meting die je moet geloven. */
  function wikkel(tekst, max) {
    var woorden = String(tekst).split(' '), regels = [], nu = '';
    woorden.forEach(function (w) {
      if (nu && (nu + ' ' + w).length > max) { regels.push(nu); nu = w; }
      else nu = nu ? nu + ' ' + w : w;
    });
    if (nu) regels.push(nu);
    return regels;
  }

  /* ---------- de dakkapelbladen ---------- */

  function dkVooraanzicht(m) {
    var v = m.v, s = scaleM(20);
    var W = v.breedte * s, H = v.hoogte * s;
    var x = Math.round((1120 - W) / 2), y = 200;
    var out = sheetStart() + kader(m, 'DK-01', 'VOORAANZICHT', '1:20');
    out += '<text x="55" y="70" class="title">VOORAANZICHT</text>';
    /* De voorwand, met het boeideel als aparte band bovenaan: dat is het deel
       dat de kleur draagt en waar de goot achter wegvalt. */
    var boei = 0.20 * s;
    out += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + H + '" class="gevelvlak"/>';
    out += '<rect x="' + (x - 6) + '" y="' + y + '" width="' + (W + 12) + '" height="' + boei + '" class="gevelvlak"/>';
    out += '<text x="' + (x + W + 22) + '" y="' + (y + boei - 6) + '" class="tiny bold">BOEIDEEL 200 mm</text>';
    /* Het kozijn: 50 mm stijl links en rechts, dagmaat uit de staat. */
    var kx = x + 0.05 * s, kw = W - 0.10 * s, kh = v.hoogteKozijn * s;
    var ky = y + boei + (H - boei - kh) / 2;
    out += kozijnVlak(kx, ky, kw, kh, v.glasvakken, v.draaiend);
    out += maatH(x, x + W, y + H + 96, y + H, mm(v.breedte) + ' mm');
    out += maatH(kx, kx + kw, y + H + 56, y + H, 'kozijn ' + mm(v.breedte - 0.10) + ' mm');
    out += maatV(x - 58, y, y + H, x, mm(v.hoogte) + ' mm');
    out += maatV(x - 108, ky, ky + kh, x, 'dagmaat ' + mm(v.hoogteKozijn) + ' mm');
    out += '<text x="60" y="150" class="label bold">AFWERKING</text>' +
      '<text x="60" y="180" class="small">Gevel: ' + esc(m.gevel) + '</text>' +
      '<text x="60" y="204" class="small">Kozijn: ' + esc(m.kozijn) + '</text>' +
      '<text x="60" y="228" class="small">Vakken: ' + v.glasvakken +
        (v.draaiend ? ' · ' + v.draaiend + ' draaikiep' : ' · alle vast') + '</text>' +
      '<text x="60" y="252" class="small">Binnen: ' + esc(m.binnen) + '</text>';
    out += schaalbalk(1050, 620, 20);
    out += '<text x="55" y="655" class="note">Maatvoering in millimeters. De draaikiepdelen zitten in de buitenste vakken. ' +
      'A3 afdrukken op 100%.</text>';
    return out + '</svg>';
  }

  function dkDoorsnede(m) {
    var v = m.v, s = scaleM(20);
    var hoek = graden(v.dakhelling);
    var D = v.diepte * s, H = v.hoogte * s;
    /* Het bestaande dakvlak loopt onder de gekozen helling omhoog naar rechts.
       De voorwand staat op punt P0; de opening loopt van daar 'diepte' naar
       achteren, en op dat punt is het dakvlak diepte*tan(helling) gestegen.
       Bij 45 graden is dat precies de diepte, en het verschil met de
       voorwandhoogte is de opstand waar de loodaansluiting op komt. */
    var x0 = 300, y0 = 500;
    var stijging = D * Math.tan(hoek);
    var opstand = H - stijging;
    var out = sheetStart() + kader(m, 'DK-02', 'DOORSNEDE', '1:20');
    out += '<text x="55" y="70" class="title">DOORSNEDE · AANSLUITING OP HET DAKVLAK</text>';
    // bestaand dakvlak, doorlopend voor en achter de kapel
    var vL = 118, vR = 150;
    out += '<line x1="' + (x0 - vL) + '" y1="' + (y0 + vL * Math.tan(hoek)) + '" x2="' + x0 + '" y2="' + y0 + '" class="heavy"/>';
    out += '<line x1="' + (x0 + D) + '" y1="' + (y0 - stijging) + '" x2="' + (x0 + D + vR) + '" y2="' + (y0 - stijging - vR * Math.tan(hoek)) + '" class="heavy"/>';
    // de dakkapel zelf
    out += '<rect x="' + (x0 + 14) + '" y="' + (y0 - H + 14) + '" width="' + (D - 14) + '" height="' + (H - 14 - opstand) + '" fill="#f7f4ee" stroke="none"/>';
    out += '<rect x="' + x0 + '" y="' + (y0 - H) + '" width="14" height="' + H + '" class="hout"/>';
    out += '<rect x="' + x0 + '" y="' + (y0 - H) + '" width="' + D + '" height="14" class="hout"/>';
    out += '<line x1="' + (x0 + D) + '" y1="' + (y0 - H) + '" x2="' + (x0 + D) + '" y2="' + (y0 - stijging) + '" class="medium"/>';
    out += '<text x="' + (x0 + D / 2 + 6) + '" y="' + (y0 - H / 2 + 10) + '" text-anchor="middle" class="tiny">binnenruimte</text>';
    // de opstand met de loodaansluiting
    out += '<rect x="' + (x0 + D - 3) + '" y="' + (y0 - H) + '" width="10" height="' + opstand + '" fill="#b9bfc6" stroke="#444"/>';
    // de raveling waar de kapel op draagt
    out += '<rect x="' + (x0 - 4) + '" y="' + (y0 - 6) + '" width="18" height="18" class="hout"/>';
    out += '<rect x="' + (x0 + D - 8) + '" y="' + (y0 - stijging - 12) + '" width="18" height="18" class="hout"/>';

    /* Verwijzingen in plaats van losse labels. Drie onderdelen zitten hier
       binnen veertig millimeter van elkaar — loodaansluiting, opstand en de
       bovenste raveelbalk — en die passen niet naast elkaar op het blad
       zonder over elkaar heen te lopen. Een genummerde bol met een lijntje
       naar een lijst is de gebruikelijke oplossing en leest ook beter. */
    var wijzers = [
      [x0 + D + 6, y0 - H + opstand / 2, 'Loodaansluiting, opstand ' + mm(opstand / s) + ' mm'],
      [x0 + D + 1, y0 - stijging - 4, 'Raveelbalk boven de opening'],
      [x0 + 5, y0 + 3, 'Raveelbalk onder de opening'],
      [x0 + D / 2, y0 - H + 7, 'Plat dak: EPDM op dakbeschot 18 mm']
    ];
    var lx = 700, ly = 430;
    wijzers.forEach(function (w, i) {
      var ty = ly + i * 32;
      out += '<line x1="' + w[0] + '" y1="' + w[1] + '" x2="' + (lx - 26) + '" y2="' + (ty - 5) + '" class="thin"/>';
      out += '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="9" class="tag"/>' +
        '<text x="' + w[0] + '" y="' + (w[1] + 4) + '" text-anchor="middle" class="tiny bold">' + (i + 1) + '</text>';
      out += '<circle cx="' + (lx - 14) + '" cy="' + (ty - 5) + '" r="9" class="tag"/>' +
        '<text x="' + (lx - 14) + '" y="' + (ty - 1) + '" text-anchor="middle" class="tiny bold">' + (i + 1) + '</text>';
      out += '<text x="' + lx + '" y="' + ty + '" class="small">' + esc(w[2]) + '</text>';
    });
    // maatvoering
    out += maatV(x0 - 70, y0 - H, y0, x0, mm(v.hoogte) + ' mm');
    out += maatH(x0, x0 + D, y0 + 96, y0, mm(v.diepte) + ' mm');
    /* De hellingshoek als hoekje in de knik van het dakvlak, niet als los
       label ernaast: daar botste hij op de naam van de raveelbalk. */
    out += '<path d="M' + (x0 - 96) + ' ' + y0 + ' l0 0 l52 0" class="thin"/>' +
      '<path d="M' + (x0 - 96) + ' ' + (y0 + 46) + ' a46 46 0 0 0 -33 -46" fill="none" stroke="#555" stroke-width="1"/>' +
      '<text x="' + (x0 - 150) + '" y="' + (y0 + 34) + '" class="tiny bold">' + v.dakhelling + '°</text>';
    out += '<text x="700" y="150" class="label bold">OPBOUW</text>' +
      '<text x="700" y="180" class="small">Isolatie: PIR 140 mm · Rc 6,0</text>' +
      '<text x="700" y="204" class="small">Wanden: stijl- en regelwerk 145 mm</text>' +
      '<text x="700" y="228" class="small">Binnen dampdicht, buiten dampopen</text>' +
      '<text x="700" y="252" class="small">Opening schuin: ' + mm(v.openingSchuin) + ' mm</text>' +
      '<text x="700" y="276" class="small">Raveelbalk: ' + esc(m.raveel || 'n.t.b.') + '</text>';
    out += schaalbalk(1050, 620, 20);
    out += '<text x="55" y="655" class="note">Maatvoering in millimeters vanaf het bestaande dakvlak. ' +
      'De hoogte van de voorwand is inclusief boeideel.</text>';
    return out + '</svg>';
  }

  function dkDakvlak(m) {
    var v = m.v, s = scaleM(20);
    /* De uitslag van het dakvlak: het schuine vlak plat neergelegd. Zo meet
       een timmerman het ook af op de kap zelf, dus staat hier de SCHUINE
       lengte en niet de horizontale projectie. */
    var W = v.breedte * s, L = v.openingSchuin * s;
    var x = Math.round((1120 - W) / 2), y = 220;
    var out = sheetStart() + kader(m, 'DK-03', 'DAKVLAK · UITSLAG', '1:20');
    out += '<text x="55" y="70" class="title">DAKVLAK · UITSLAG VAN DE OPENING</text>';
    // bestaande sporen h.o.h. 600, de doorgesneden exemplaren gestippeld
    var hoh = 0.6 * s;
    for (var sx = x - 2 * hoh; sx < x + W + 2 * hoh; sx += hoh) {
      var binnen = sx > x - 6 && sx < x + W - 6;
      out += '<line x1="' + sx + '" y1="' + (y - 70) + '" x2="' + sx + '" y2="' + (y + L + 70) + '" class="' + (binnen ? 'dash' : 'thin') + '"/>';
    }
    out += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + L + '" fill="#fff" stroke="#111" stroke-width="2.4"/>';
    // raveelbalken rondom
    out += '<rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="14" height="' + (L + 28) + '" class="hout"/>';
    out += '<rect x="' + (x + W) + '" y="' + (y - 14) + '" width="14" height="' + (L + 28) + '" class="hout"/>';
    out += '<rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="' + (W + 28) + '" height="14" class="hout"/>';
    out += '<rect x="' + (x - 14) + '" y="' + (y + L) + '" width="' + (W + 28) + '" height="14" class="hout"/>';
    out += '<text x="' + (x + W / 2) + '" y="' + (y + L / 2) + '" text-anchor="middle" class="label bold">DAKOPENING</text>';
    out += '<text x="' + (x + W / 2) + '" y="' + (y + L / 2 + 24) + '" text-anchor="middle" class="small">' + v.opening + ' m²</text>';
    out += maatH(x, x + W, y + L + 118, y + L + 14, mm(v.breedte) + ' mm');
    out += maatV(x - 74, y, y + L, x - 14, 'schuin ' + mm(v.openingSchuin) + ' mm');
    out += '<text x="' + (x + W + 60) + '" y="' + (y + 20) + '" class="tiny bold">NOKZIJDE</text>';
    out += '<text x="' + (x + W + 60) + '" y="' + (y + L) + '" class="tiny bold">GOOTZIJDE</text>';
    out += '<text x="60" y="150" class="label bold">RAVELING</text>' +
      '<text x="60" y="178" class="small">Raveelbalk</text>' +
      '<text x="60" y="200" class="tiny">' + esc(m.raveel || 'n.t.b.') + '</text>' +
      '<text x="60" y="228" class="small">Sporen h.o.h. 600 mm</text>' +
      '<text x="60" y="250" class="tiny">gestippeld = doorgesneden</text>';
    out += schaalbalk(1050, 620, 20);
    out += '<text x="55" y="655" class="note">Uitslag van het schuine dakvlak: de lengtemaat is de schuine maat, ' +
      'zoals hij op de kap wordt afgetekend. Niet de horizontale projectie.</text>';
    return out + '</svg>';
  }

  function dkRaveling(m) {
    var v = m.v, s = scaleM(10);
    var out = sheetStart() + kader(m, 'C-01', 'RAVELING', '1:10');
    out += '<text x="55" y="70" class="title">RAVELING · CONSTRUCTIE ROND DE OPENING</text>';
    /* De balk wordt getekend op de maat die het profiel zelf noemt. Een vaste
       maat tekenen naast een tekst die iets anders zegt is precies het soort
       tegenspraak waar dit pakket vanaf moet: bij 2,30 m is de raveelbalk
       63 × 240, bij 4 m is hij 75 × 300, en dat hoort te zien te zijn. */
    var maat = /(\d+)\s*[x\u00d7]\s*(\d+)/.exec(m.raveel || '');
    var rb = maat ? parseInt(maat[1], 10) / 1000 : 0.075;
    var rh = maat ? parseInt(maat[2], 10) / 1000 : 0.300;

    // links: het doorgesneden spoor, verdubbeld
    var x = 190, y = 300;
    out += '<rect x="' + x + '" y="' + y + '" width="' + (0.045 * s) + '" height="' + (0.22 * s) + '" class="hout"/>';
    out += '<rect x="' + (x + 0.045 * s) + '" y="' + y + '" width="' + (0.045 * s) + '" height="' + (0.22 * s) + '" class="hout"/>';
    out += '<text x="' + x + '" y="' + (y - 18) + '" class="tiny bold">VERDUBBELD SPOOR 2 × 220 × 45 mm</text>';
    out += maatV(x - 54, y, y + 0.22 * s, x, '220 mm');
    out += maatH(x, x + 0.09 * s, y + 0.22 * s + 54, y + 0.22 * s, '90 mm');

    // rechts: de raveelbalk op ware profielmaat, met de balkschoen ertegen
    var rx = 640;
    out += '<rect x="' + rx + '" y="' + (y - 30) + '" width="' + (rb * s) + '" height="' + (rh * s) + '" class="hout"/>';
    out += '<text x="' + rx + '" y="' + (y - 44) + '" class="tiny bold">RAVEELBALK</text>';
    out += '<text x="' + (rx + rb * s + 22) + '" y="' + (y - 30 + 18) + '" class="small bold">' + esc(m.raveel || 'n.t.b.') + '</text>';
    out += maatV(rx - 54, y - 30, y - 30 + rh * s, rx, mm(rh) + ' mm');
    out += maatH(rx, rx + rb * s, y - 30 + rh * s + 96, y - 30 + rh * s, mm(rb) + ' mm');
    // de balkschoen waar het spoor in hangt
    out += '<path d="M' + (rx - 30) + ' ' + (y + 16) + ' l30 0 l0 66 l-30 0" fill="none" stroke="#2b6ca3" stroke-width="4"/>';
    out += '<text x="' + (rx - 250) + '" y="' + (y + 118) + '" class="tiny bold" fill="#2b6ca3">BALKSCHOEN, VERZINKT</text>';
    out += '<line x1="' + (rx - 108) + '" y1="' + (y + 114) + '" x2="' + (rx - 24) + '" y2="' + (y + 60) + '" class="thin"/>';

    out += '<rect x="120" y="470" width="880" height="150" fill="#f6f2e7" stroke="#222"/>';
    out += '<text x="146" y="502" class="label bold">CONSTRUCTIEF UITGANGSPUNT</text>';
    var pt = [
      'De raveelbalk neemt de sporen op die voor de opening worden doorgesneden en draagt af op de verdubbelde',
      'sporen links en rechts. Overspanning ' + mm(v.breedte) + ' mm; profiel ' + (m.raveel || 'n.t.b.') + ' is een richtwaarde.',
      'De dakkapel draagt op de raveling en niet op het dakbeschot. Bevestiging met verzinkte balkschoenen.'
    ];
    pt.forEach(function (t, i) {
      out += '<text x="146" y="' + (532 + i * 26) + '" class="small">' + esc(t) + '</text>';
    });
    out += schaalbalk(1050, 180, 10);
    out += '<text x="55" y="655" class="note">Detail 1:10. Profielmaten zijn richtwaarden uit de configurator: ' +
      'de constructeur stelt ze vast.</text>';
    return out + '</svg>';
  }

  /* ---------- de nokverhogingbladen ---------- */

  function nvDoorsnede(m) {
    var v = m.v, s = scaleM(50);
    /* De doorsnede staat haaks op de gevel: links de voorgevel die omhoog
       gaat, rechts de bestaande nok. Dit is het blad waar het hele product op
       staat, dus krijgt het de bestaande situatie er gestippeld bij — het
       verschil IS het werk. */
    var out = sheetStart() + kader(m, 'NV-01', 'DOORSNEDE BESTAAND EN NIEUW', '1:50');
    out += '<text x="55" y="70" class="title">DOORSNEDE · BESTAAND EN NIEUW</text>';
    var verh = v.verhoging * s, spar = v.dakvlakSchuin * s;
    var gootX = 250, gootY = 470;
    /* Het nieuwe dakvlak loopt van de bovenkant van de opgaande gevel naar de
       nok. De helling volgt uit de schuine lengte en de gekozen verhoging;
       wat er niet uit volgt staat als aanname op M-02. */
    var nieuwTopY = gootY - verh;
    var dx = Math.sqrt(Math.max(spar * spar - verh * verh, spar * 0.25));
    var nokX = gootX + dx, nokY = nieuwTopY - verh;
    // bestaande situatie
    out += '<line x1="' + gootX + '" y1="' + gootY + '" x2="' + nokX + '" y2="' + (nokY + verh) + '" class="bestaand"/>';
    out += '<text x="' + (gootX + dx / 2 - 40) + '" y="' + (gootY - verh / 2 + 40) + '" class="tiny" fill="#8a8a8a">BESTAAND DAKVLAK</text>';
    // de opgaande gevel
    out += '<rect x="' + (gootX - 16) + '" y="' + nieuwTopY + '" width="16" height="' + verh + '" class="gevelvlak"/>';
    // het nieuwe dakvlak
    out += '<line x1="' + gootX + '" y1="' + nieuwTopY + '" x2="' + nokX + '" y2="' + nokY + '" class="heavy"/>';
    // de bestaande onderbouw
    out += '<rect x="' + (gootX - 16) + '" y="' + gootY + '" width="16" height="120" class="metsel"/>';
    out += '<line x1="' + (gootX - 90) + '" y1="' + gootY + '" x2="' + (gootX - 16) + '" y2="' + gootY + '" class="thin"/>';
    out += '<text x="' + (gootX + 24) + '" y="' + (gootY + 104) + '" class="tiny">bestaande gevel</text>';
    // nok
    out += '<circle cx="' + nokX + '" cy="' + nokY + '" r="7" class="hout"/>';
    out += '<text x="' + (nokX + 18) + '" y="' + (nokY + 4) + '" class="tiny bold">NIEUWE NOKGORDING</text>';
    out += '<text x="' + (nokX + 18) + '" y="' + (nokY + 22) + '" class="tiny">' + esc(v.nokprofiel) + '</text>';
    out += '<circle cx="' + nokX + '" cy="' + (nokY + verh) + '" r="5" fill="none" stroke="#9a9a9a" stroke-width="2"/>';
    out += '<text x="' + (nokX + 18) + '" y="' + (nokY + verh + 6) + '" class="tiny" fill="#8a8a8a">oude noklijn</text>';
    // het kozijn in de opgaande gevel
    var kh = v.hoogteKozijn * s;
    out += '<rect x="' + (gootX - 16) + '" y="' + (nieuwTopY + (verh - kh) / 2) + '" width="16" height="' + kh + '" class="glas"/>';
    // maatvoering
    out += maatV(gootX - 70, nieuwTopY, gootY, gootX - 16, mm(v.verhoging) + ' mm');
    /* De nokmaat hoort bij de nok en niet aan de andere kant van het blad:
       een hulplijn die daar dwars overheen loopt leest als een bouwlijn. */
    out += maatV(nokX + 210, nokY, nokY + verh, nokX + 10, '+' + mm(v.verhoging) + ' mm');
    var mx = (gootX + nokX) / 2, my = (nieuwTopY + nokY) / 2;
    out += '<text x="' + mx + '" y="' + (my - 16) + '" text-anchor="middle" class="dimtxt" ' +
      'transform="rotate(' + (Math.atan2(nokY - nieuwTopY, dx) * 180 / Math.PI) + ' ' + mx + ' ' + my + ')">' +
      'nieuw dakvlak ' + mm(v.dakvlakSchuin) + ' mm schuin</text>';
    out += '<text x="740" y="150" class="label bold">WAT ER VERANDERT</text>';
    var pt = [
      'Het bestaande dakvlak gaat er in zijn geheel af:',
      'pannen, panlatten, beschot en de oude sporen.',
      '',
      'De gevel gaat ' + mm(v.verhoging) + ' mm omhoog en draagt',
      'het nieuwe kozijn van ' + mm(v.kozijnBreedte) + ' × ' + mm(v.hoogteKozijn) + ' mm.',
      '',
      'Nieuwe sporen 220 × 45 mm, h.o.h. 600 mm.',
      'PIR 140 mm in dak en gevel, Rc 6,0.',
      '',
      'Dakvlak opnieuw gedekt: ' + v.dakOppervlak + ' m².'
    ];
    pt.forEach(function (t, i) {
      out += '<text x="740" y="' + (182 + i * 24) + '" class="small">' + esc(t) + '</text>';
    });
    out += schaalbalk(1050, 470, 50);
    out += '<text x="55" y="655" class="note">Gestippeld = bestaand, doorgetrokken = nieuw. Maatvoering in millimeters. ' +
      'De dakhelling volgt uit het inmeten; hier gerekend met de schuine lengte uit de staat.</text>';
    return out + '</svg>';
  }

  function nvVooraanzicht(m) {
    var v = m.v, s = scaleM(50);
    var W = v.woningbreedte * s, verh = v.verhoging * s;
    var x = Math.round((1120 - W) / 2), y = 280;
    var out = sheetStart() + kader(m, 'NV-02', 'VOORAANZICHT', '1:50');
    out += '<text x="55" y="70" class="title">VOORAANZICHT · OPGAANDE GEVEL</text>';
    // bestaande gevel eronder
    out += '<rect x="' + x + '" y="' + (y + verh) + '" width="' + W + '" height="150" class="metsel"/>';
    out += '<text x="' + (x + W / 2) + '" y="' + (y + verh + 90) + '" text-anchor="middle" class="small">bestaande gevel</text>';
    // de opgaande band
    out += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + verh + '" class="gevelvlak"/>';
    // het kozijn, gecentreerd
    var kw = v.kozijnBreedte * s, kh = v.hoogteKozijn * s;
    var kx = x + (W - kw) / 2, ky = y + (verh - kh) / 2;
    out += kozijnVlak(kx, ky, kw, kh, v.glasvakken, v.draaiend);
    // de oude noklijn erboven, gestippeld
    out += '<line x1="' + (x - 30) + '" y1="' + (y + verh) + '" x2="' + (x + W + 30) + '" y2="' + (y + verh) + '" class="bestaand"/>';
    out += '<text x="' + (x + W + 36) + '" y="' + (y + verh + 4) + '" class="tiny" fill="#8a8a8a">oude noklijn</text>';
    out += maatH(x, x + W, y - 60, y, mm(v.woningbreedte) + ' mm');
    out += maatH(kx, kx + kw, ky + kh + 46, ky + kh, 'kozijn ' + mm(v.kozijnBreedte) + ' mm');
    out += maatV(x - 66, y, y + verh, x, mm(v.verhoging) + ' mm');
    out += '<text x="60" y="150" class="label bold">AFWERKING</text>' +
      '<text x="60" y="180" class="small">Gevel: ' + esc(m.gevel) + '</text>' +
      '<text x="60" y="204" class="small">Kozijn: ' + esc(m.kozijn) + '</text>' +
      '<text x="60" y="228" class="small">Vakken: ' + v.glasvakken +
        (v.draaiend ? ' · ' + v.draaiend + ' draaikiep' : ' · alle vast') + '</text>';
    out += '<text x="820" y="150" class="label bold">WONING</text>' +
      '<text x="820" y="180" class="small">' + esc(v.woningtype) + '</text>' +
      '<text x="820" y="204" class="small">Vrije kopgevels: ' + v.kopgevels + '</text>' +
      '<text x="820" y="228" class="small">Binnen: ' + esc(m.binnen) + '</text>';
    out += schaalbalk(1050, 620, 50);
    out += '<text x="55" y="655" class="note">De woningbreedte is een rekenmaat en wordt bij het inmeten vastgesteld. ' +
      'Het kozijn staat gecentreerd; een andere positie in overleg.</text>';
    return out + '</svg>';
  }

  function nvSporenplan(m) {
    var v = m.v, s = scaleM(50);
    var W = v.woningbreedte * s, L = v.dakvlakSchuin * s;
    var x = Math.round((1120 - W) / 2), y = 210;
    var out = sheetStart() + kader(m, 'NV-03', 'SPORENPLAN', '1:50');
    out += '<text x="55" y="70" class="title">SPORENPLAN · NIEUW DAKVLAK (UITSLAG)</text>';
    out += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + L + '" fill="#fff" stroke="#111" stroke-width="2.4"/>';
    // de sporen, h.o.h. 600
    var hoh = W / (v.sporen - 1);
    for (var i = 0; i < v.sporen; i++) {
      var sx = x + hoh * i;
      out += '<rect x="' + (sx - 3) + '" y="' + y + '" width="6" height="' + L + '" class="hout"/>';
    }
    // nokgording bovenaan, muurplaat onderaan
    out += '<rect x="' + (x - 20) + '" y="' + (y - 16) + '" width="' + (W + 40) + '" height="16" class="hout"/>';
    out += '<text x="' + (x + W + 30) + '" y="' + (y - 4) + '" class="tiny bold">NOKGORDING</text>';
    out += '<rect x="' + (x - 20) + '" y="' + (y + L) + '" width="' + (W + 40) + '" height="14" class="hout"/>';
    out += '<text x="' + (x + W + 30) + '" y="' + (y + L + 12) + '" class="tiny bold">MUURPLAAT 70 × 145</text>';
    out += maatH(x, x + W, y + L + 108, y + L + 14, mm(v.woningbreedte) + ' mm');
    var steek = v.woningbreedte / (v.sporen - 1);
    out += maatH(x, x + hoh, y + L + 62, y + L + 14, 'h.o.h. ' + mm(steek) + ' mm');
    out += maatV(x - 70, y, y + L, x, 'schuin ' + mm(v.dakvlakSchuin) + ' mm');
    out += '<text x="60" y="150" class="label bold">SPOREN</text>' +
      '<text x="60" y="178" class="small">' + v.sporen + ' × 220 × 45 mm</text>' +
      '<text x="60" y="202" class="tiny">gelijk verdeeld, ten hoogste 600 mm</text>';
    out += '<text x="880" y="150" class="label bold">DAKVLAK</text>' +
      '<text x="880" y="178" class="small">' + v.dakOppervlak + ' m²</text>' +
      '<text x="880" y="202" class="tiny">één zijde</text>';
    out += schaalbalk(1050, 620, 50);
    out += '<text x="55" y="655" class="note">Uitslag van het schuine dakvlak, zoals het op de kap wordt afgetekend. ' +
      'Bij een symmetrische kap geldt dit plan voor beide zijden.</text>';
    return out + '</svg>';
  }

  function nvNokgording(m) {
    var v = m.v, s = scaleM(50);
    var L = (v.woningbreedte + 0.4) * s;
    var x = Math.round((1120 - L) / 2), y = 250;
    var out = sheetStart() + kader(m, 'C-01', 'NOKGORDING', '1:50');
    out += '<text x="55" y="70" class="title">NOKGORDING · OVERSPANNING EN OPLEGGING</text>';
    /* De ligger als staafschema, want dat is wat de constructeur nakijkt:
       overspanning, oplegging en waar de schoren staan. */
    out += '<rect x="' + x + '" y="' + y + '" width="' + L + '" height="26" class="hout"/>';
    out += '<text x="' + (x + L / 2) + '" y="' + (y + 130) + '" text-anchor="middle" class="label bold">' + esc(v.nokprofiel) + '</text>';
    // opleggingen op de bouwmuren
    [0, 1].forEach(function (k) {
      var ox = x + k * L;
      out += '<path d="M' + ox + ' ' + (y + 26) + ' l-22 44 l44 0 z" fill="#e3dcd2" stroke="#444" stroke-width="1.6"/>';
      out += '<line x1="' + (ox - 34) + '" y1="' + (y + 70) + '" x2="' + (ox + 34) + '" y2="' + (y + 70) + '" stroke="#111" stroke-width="3"/>';
      out += '<text x="' + ox + '" y="' + (y + 94) + '" text-anchor="middle" class="tiny bold">BOUWMUUR</text>';
    });
    // de schoren
    var schoren = 2 + v.kopgevels;
    for (var i = 1; i <= schoren; i++) {
      var sx = x + (L / (schoren + 1)) * i;
      out += '<line x1="' + sx + '" y1="' + (y + 26) + '" x2="' + (sx - 30) + '" y2="' + (y + 96) + '" class="medium"/>';
      out += '<line x1="' + sx + '" y1="' + (y + 26) + '" x2="' + (sx + 30) + '" y2="' + (y + 96) + '" class="medium"/>';
    }
    out += '<text x="' + (x + L / 2) + '" y="' + (y + 112) + '" text-anchor="middle" class="tiny bold">' +
      schoren + ' × SPANTBEEN / SCHOOR</text>';
    // de sporenlast als pijltjes op de ligger
    for (var p = 0; p < v.sporen; p++) {
      var px = x + 0.2 * s + ((L - 0.4 * s) / (v.sporen - 1)) * p;
      out += '<line x1="' + px + '" y1="' + (y - 34) + '" x2="' + px + '" y2="' + (y - 6) + '" class="thin" marker-end="url(#karr)"/>';
    }
    out += '<text x="' + (x - 10) + '" y="' + (y - 44) + '" class="tiny">belasting uit ' + v.sporen + ' sporen</text>';
    out += maatH(x, x + L, y + 186, y + 96, 'overspanning ' + mm(v.woningbreedte + 0.4) + ' mm');
    out += '<rect x="120" y="470" width="880" height="150" fill="#fdf9ec" stroke="#b9a75a"/>';
    out += '<text x="146" y="502" class="label bold" fill="#a32323">TE BEVESTIGEN DOOR DE CONSTRUCTEUR</text>';
    var pt = [
      'Profiel, oplegging en schoren zijn richtwaarden uit de configurator en volgen uit een constructieberekening.',
      'De extra belasting komt op de bestaande bouwmuren en de fundering: die moeten worden nagerekend.',
      'Oplegging op de bouwmuur ten minste 150 mm, met een verdeelplaat volgens opgave van de constructeur.'
    ];
    pt.forEach(function (t, i) {
      out += '<text x="146" y="' + (532 + i * 26) + '" class="small">' + esc(t) + '</text>';
    });
    out += '<text x="55" y="655" class="note">Staafschema, niet op schaal in de hoogte. ' +
      'De overspanning is de woningbreedte plus 200 mm oplegging aan weerszijden.</text>';
    return out + '</svg>';
  }

  /* ---------- samenstellen ---------- */

  function sheets(m) {
    var teken = m.nok
      ? [nvDoorsnede(m), nvVooraanzicht(m), nvSporenplan(m), nvNokgording(m)]
      : [dkVooraanzicht(m), dkDoorsnede(m), dkDakvlak(m), dkRaveling(m)];
    return [voorblad(m)].concat(teken, bestellijsten(m), [aannamesBlad(m)]);
  }

  function pakketHtml(m) {
    var bladen = sheets(m);
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8">' +
      '<title>Technisch tekeningenpakket ' + esc(m.project) + '</title>' +
      '<style>body{margin:0;background:#333;font-family:Arial}' +
      'header{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;' +
      'display:flex;justify-content:space-between;align-items:center}header b{font-size:14px}' +
      'button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}' +
      '.sheet{width:min(96vw,1120px);margin:22px auto;box-shadow:0 8px 28px #0008;background:#fff}' +
      '.sheet svg{display:block;width:100%;height:auto}' +
      '@media print{header{display:none}body{background:#fff}' +
      '.sheet{width:100%;margin:0;box-shadow:none;page-break-after:always}' +
      '.sheet:last-child{page-break-after:auto}}@page{size:A3 landscape;margin:0}</style></head><body>' +
      '<header><b>' + esc(m.project) + ' · technisch tekeningenpakket · ' + bladen.length + ' bladen</b>' +
      '<button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' +
      bladen.map(function (s) { return '<div class="sheet">' + s + '</div>'; }).join('') +
      '</body></html>';
  }

  function open(product) {
    var sel = typeof global.NGKeuze === 'function' ? (global.NGKeuze() || {}) : {};
    var m = model(product, sel);
    if (!m) { alert('De tekeningenmodule kon de samenstelling niet lezen.'); return; }
    var html = pakketHtml(m);
    /* Via NGAfdruk: lukt de pop-up niet — op iPhone is blokkeren de standaard —
       dan komt hetzelfde pakket in de pagina zelf, met een eigen afdrukknop. */
    if (global.NGAfdruk) {
      global.NGAfdruk.toon(html, 'ng-tekeningen-' + product, 'Technische tekeningen');
    } else {
      var w = global.open('', 'ng-tekeningen-' + product);
      if (!w) { alert('Sta pop-ups toe om de tekeningen te openen.'); return; }
      w.document.open(); w.document.write(html); w.document.close();
    }
  }

  function init(opties) {
    var product = (opties && opties.product) || 'dakkapel';
    var haak = function () {
      /* Naast de materiaalstaatknop, want die twee horen bij elkaar: het zijn
         de twee helften van dezelfde werkvoorbereiding. */
      var buur = document.getElementById('materiaalstaatBtn') || document.getElementById('naarOfferte');
      if (!buur || document.getElementById('tekeningenBtn')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn--ghost'; b.id = 'tekeningenBtn';
      b.textContent = 'Technische tekeningen';
      b.title = 'Open het technische voorontwerp als afdrukbaar pakket';
      b.addEventListener('click', function () { open(product); });
      buur.parentNode.insertBefore(b, buur.nextSibling);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', haak);
    else haak();
  }

  global.NGTekeningenKap = {
    init: init, open: open, model: model, sheets: sheets, pakketHtml: pakketHtml
  };
})(typeof window !== 'undefined' ? window : globalThis);
