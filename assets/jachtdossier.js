/* Dossier J-01 en de vergelijker van de jachtconfigurator.
 *
 * Waarom dit het verschil maakt: de beste configurator in dit segment
 * (Dynamiq) eindigt in "Save PDF" — een optielijst met een totaal. Dit
 * dossier is een tekeningenset: zijaanzicht, dekindeling, vooraanzicht met
 * doorvaarthoogte, schaalreferentie, interieurimpressie en het complete
 * vaarprofiel, op vier bladen die samen als één document afdrukken. Een
 * koper legt dit op de keukentafel; een werf herkent er een voorlopig
 * ontwerp in.
 *
 * De vergelijker zet twee samenstellingen naast elkaar met de verschillen
 * gemarkeerd. Geen enkele jacht- of autoconfigurator biedt dat, terwijl
 * "twijfel tussen twee uitvoeringen" precies de fase is waarin een koper
 * zit als hij een configurator opent.
 *
 * Alles hier leest uitsluitend uit jacht-data.js en de reken- en
 * tekenmodules; er staat geen enkel eigen getal in dit bestand.
 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  /* Een maat die de werf nog niet heeft opgegeven wordt een streepje. Een
     dossier met "NaN t" naast "verplaatsing" oogt als een storing; een
     streepje zegt eerlijk dat het cijfer nog moet komen. */
  var leeg = function (x) { return x === null || x === undefined || (typeof x === 'number' && isNaN(x)); };
  var f1 = function (x) { return leeg(x) ? '-' : (Math.round(x * 10) / 10).toString().replace('.', ','); };
  var f0 = function (x) { return leeg(x) ? '-' : String(Math.round(x)); };
  var fg = function (x) { return leeg(x) ? '-' : String(x); };

  function vind(lijst, v) {
    for (var i = 0; i < lijst.length; i++) if (lijst[i].v === v) return lijst[i];
    return lijst[0];
  }

  var CSS =
    'body{margin:0;background:#333;font-family:Arial,Helvetica,sans-serif;color:#111}' +
    'header.balk{position:sticky;top:0;z-index:4;background:#111;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}' +
    'header.balk b{font-size:14px}header.balk span{font-size:11px;color:#e8b04b}' +
    'header.balk button{background:#d7b55b;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer}' +
    '.blad{width:min(96vw,1120px);margin:22px auto;background:#fff;padding:34px 40px 26px;box-shadow:0 8px 28px #0008;box-sizing:border-box}' +
    '.kop{display:flex;justify-content:space-between;align-items:flex-start;gap:1.5rem;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px}' +
    '.kop h1,.kop h2{font-size:19px;margin:0 0 4px;letter-spacing:.02em}' +
    '.kop p{margin:0;font-size:11px;color:#555}' +
    '.stempel{text-align:right;font-size:11px;font-weight:800;color:#a32323;letter-spacing:.4px;white-space:nowrap}' +
    '.stempel em{display:block;font-style:normal;font-weight:400;color:#555;margin-top:3px;letter-spacing:0}' +
    '.tek{border:1px solid #ccc;border-radius:6px;overflow:hidden;margin:0 0 14px}' +
    '.noot{font-size:10.5px;color:#555;line-height:1.5;margin:0 0 10px}' +
    '.tek svg{display:block;width:100%;height:auto}' +
    '.ruimten{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0 6px}' +
    '.ruimte{margin:0;break-inside:avoid}' +
    '.ruimte img{display:block;width:100%;height:auto;border-radius:6px}' +
    '.ruimte figcaption{padding:8px 2px 0}' +
    '.ruimte figcaption b{display:block;font-size:13px}' +
    '.ruimte figcaption span{display:block;font-size:11px;color:#555;margin-top:2px}' +
    '.rij{display:flex;gap:14px;align-items:flex-start}.rij .tek{flex:1;min-width:0}' +
    '.cel3{flex:0 0 34%}' +
    '.kern{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:1px;background:#ddd;border:1px solid #ddd;border-radius:6px;overflow:hidden;margin:0 0 14px}' +
    '.kern div{background:#f7f5f0;padding:8px 10px}' +
    '.kern b{display:block;font-size:15px;font-variant-numeric:tabular-nums}' +
    '.kern span{display:block;font-size:9.5px;color:#666;margin-top:2px;letter-spacing:.04em;text-transform:uppercase}' +
    'table{width:100%;border-collapse:collapse;font-size:12px}' +
    'th{text-align:left;padding:5px 8px;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#666;font-weight:400;border-bottom:1px solid #bbb}' +
    'td{padding:5px 8px;border-bottom:1px solid #eee;vertical-align:top}' +
    'td.r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}' +
    'td.anders,th.anders{background:#f6ecd8}' +
    'h3.sec{font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin:16px 0 6px;color:#333}' +
    'ul.punten{margin:0;padding-left:16px}ul.punten li{font-size:11.5px;line-height:1.5;margin:3px 0;color:#333}' +
    '.voet{margin-top:14px;padding-top:8px;border-top:1px solid #ccc;font-size:10px;color:#555;line-height:1.5}' +
    '.voet .url{color:#B38900;word-break:break-all}' +
    '@media print{header.balk{display:none}body{background:#fff}.blad{width:100%;margin:0;box-shadow:none;page-break-after:always}.blad:last-child{page-break-after:auto}}' +
    '@page{size:A4 landscape;margin:10mm}';

  /* Bedrag en maat komen uit de eenhedenmodule: het dossier hoort te tonen wat
     de bezoeker op het scherm koos, niet standaard euro's en meters terwijl
     hij de configurator in voeten en dollars stond te lezen. */
  function E() { return global.NGEenheden; }
  function euro(n) {
    return E() ? E().geld(n) : '\u20ac\u00a0' + Math.round(n).toLocaleString('nl-NL');
  }
  function maat(x, decimalen) {
    return E() ? E().lengte(x, decimalen) : f1(x) + ' m';
  }
  function kop(titel, sub, blad) {
    return '<div class="kop"><div><h2>' + titel + '</h2><p>' + esc(sub) + '</p></div>' +
      '<div class="stempel">VOORBEELDMODEL &#183; BLAD ' + esc(blad) + '<em>Next Growth &#183; jachtconfigurator</em></div></div>';
  }
  function voet(deelUrl) {
    return '<p class="voet">Dit dossier hoort bij een demonstratiemodel: specificaties zijn voorbeeldwaarden en worden door de werf vervangen door de meetwaarden van de proefvaart. Het is geen aanbod en er kunnen geen rechten aan worden ontleend.' +
      (deelUrl ? ' Deze samenstelling opnieuw openen: <span class="url">' + esc(deelUrl) + '</span>' : '') + '</p>';
  }

  /* ---------- het dossier ---------- */

  function rapportHtml(st, D, deelUrl) {
    var m = vind(D.modellen, st.model);
    var p = global.NGJachtProfiel.bereken(st, D);
    var A = global.NGJachtAanzichten;
    var h = A.hoogten(m, st.dek);

    var keuzes = [
      ['Rompkleur', vind(D.rompkleuren, st.rompkleur).l],
      ['Opbouw', vind(D.opbouw, st.opbouw).l],
      ['Dek en bovenbouw', vind(D.dekken, st.dek).l],
      ['Dekafwerking', vind(D.dekafwerking, st.dekafwerking).l],
      ['Interieurhout', vind(D.interieurhout, st.interieurhout).l],
      ['Stoffering', vind(D.stoffering, st.stoffering).l],
      ['Motorisering', vind(D.motorisering, st.motorisering).l]
    ];
    var opties = (st.opties || []).map(function (v) { return vind(D.opties, v); });

    var Bd = global.NGJachtBeelden || {};

    /* Eén plek waar een render een blad op komt. Geen url, geen blok: zo kan
       er nergens per ongeluk een tekening als terugval insluipen. */
    function vlak(url, tekst, klasse) {
      return url ? '<div class="tek' + (klasse ? ' ' + klasse : '') + '">' +
        '<img src="' + url + '" alt="' + esc(tekst) + ' van de ' + esc(m.l) + '" ' +
        'style="display:block;width:100%;height:auto"></div>' : '';
    }

    /* Het beeld op blad 1. Eerst de render van deze exacte samenstelling —
       dezelfde die de koper in de configurator zag. Bestaat die combinatie
       niet, dan de modelrender uit de heromap; die is er voor alle tien.
       Bestaat ook die niet, dan komt er geen beeld. Nooit een schets: dit is
       de eerste bladzijde van een dossier over een schip van miljoenen. */
    function hoofdbeeld(k, mod) {
      var url = (Bd.buiten ? Bd.buiten(k) : null) ||
                (mod && mod.v ? './assets/media/jacht/hero/' + mod.v + '.webp' : null);
      return vlak(url, 'Aanzicht');
    }

    /* blad 1: het schip en de samenstelling */
    var blad1 = '<div class="blad">' +
      kop('DOSSIER &#183; ' + esc(m.l.toUpperCase()), m.klasse + ' · samenstelling van de aanvrager', 'J-01') +
      hoofdbeeld(st, m) +
      '<div class="kern">' +
        '<div><b>' + maat(m.loa) + '</b><span>lengte over alles</span></div>' +
        '<div><b>' + maat(m.breedte) + '</b><span>breedte</span></div>' +
        '<div><b>' + maat(m.diepgang) + '</b><span>diepgang</span></div>' +
        '<div><b>' + maat(h.airdraft) + '</b><span>doorvaarthoogte</span></div>' +
        '<div><b>' + f0(m.verplaatsing) + ' t</b><span>verplaatsing</span></div>' +
        '<div><b>' + fg(m.gasten) + '</b><span>gasten</span></div>' +
        '<div><b>' + fg(m.hutten) + '</b><span>hutten</span></div>' +
        '<div><b>' + fg(m.bemanning) + '</b><span>bemanning</span></div>' +
        '<div><b>' + f0(m.tank) + ' l</b><span>brandstof</span></div>' +
        '<div><b>' + f0(m.watertank) + ' l</b><span>drinkwater</span></div>' +
      '</div>' +
      '<table><thead><tr><th>Onderdeel</th><th>Keuze</th></tr></thead><tbody>' +
      keuzes.map(function (k) { return '<tr><td>' + esc(k[0]) + '</td><td>' + esc(k[1]) + '</td></tr>'; }).join('') +
      '<tr><td>Opties</td><td>' + (opties.length ? opties.map(function (o) { return esc(o.l); }).join(' &#183; ') : 'geen') + '</td></tr>' +
      '</tbody></table>' + voet(deelUrl) + '</div>';

    /* blad 2: de aanzichten.
       Boven de streep de gerenderde aanzichten — die bestaan voor elk model,
       ook als de maten nog open staan. Daaronder de schematische tekeningen,
       maar alleen wanneer de werf de maten heeft opgegeven: zonder maten tekent
       de schets een schip van nul meter breed, en dat is erger dan geen schets. */
    /* Mét de gekozen dekvorm. Zonder dat derde argument pakte de beeldbank
       altijd de standaardrender, dus wie op de Flybridge 24 de t-top koos zag
       in zijn dossier het schip zonder t-top staan - met de gekozen uitvoering
       ernaast in de tabel. Van elke dekvorm bestaat inmiddels een eigen
       render, dus er valt niets meer te kiezen: dit hoort het gekozen dek te
       zijn. */
    var rBoven  = Bd.boven  ? Bd.boven(st.model, st.dekafwerking, st.dek) : null;
    var rVoor   = Bd.voor   ? Bd.voor(st.model, st.dek)   : null;
    var rAchter = Bd.achter ? Bd.achter(st.model, st.dek) : null;
    /* De nachtrender vult de plek waar de schetsen stonden. Bestaat hij niet
       voor deze combinatie, dan blijft de plek leeg: liever een blad met drie
       aanzichten dan een blad met drie aanzichten en een tekening. */
    var rNacht  = Bd.nacht  ? Bd.nacht(st.model, st.dek)  : null;

    var blad2 = '<div class="blad">' +
      kop('AANZICHTEN',
          m.specsOpen
            ? 'boven-, voor- en achteraanzicht: catalogusuitvoering; maten nog niet opgegeven'
            : 'boven-, voor- en achteraanzicht van deze uitvoering',
          'J-02') +
      vlak(rBoven, 'Bovenaanzicht') +
      '<div class="rij">' + vlak(rVoor, 'Vooraanzicht') + vlak(rAchter, 'Achteraanzicht') + '</div>' +
      vlak(rNacht, 'Bij nacht') +
      voet(null) + '</div>';

    /* blad 3: het dekplan
       Hetzelfde blad als in de PDF, uit dezelfde module - de preview hoort te
       tonen wat er straks uit de printer komt. Zonder maten geen dekplan; dan
       slaat dit blad over in plaats van een indeling te tekenen die niet
       bestaat. */
    var ruimten = (Bd.ruimten && !m.specsOpen) ? Bd.ruimten(m.loa) : [];
    var ruimteVlakken = ruimten.map(function (r) {
      var url = Bd.ruimte ? Bd.ruimte(r.v, st.model) : null;
      return url ? '<figure class="ruimte">' +
        '<img src="' + url + '" alt="' + esc(r.l) + ' van de ' + esc(m.l) + '">' +
        '<figcaption><b>' + esc(r.l) + '</b><span>' + esc(r.uit) + '</span></figcaption>' +
        '</figure>' : '';
    }).filter(Boolean);
    var bladDek = !ruimteVlakken.length ? '' : '<div class="blad">' +
      kop('AAN BOORD', 'de ruimten die dit schip op deze lengte heeft', 'J-03') +
      '<div class="ruimten">' + ruimteVlakken.join('') + '</div>' +
      '<p class="noot">Welke ruimten een schip heeft, volgt uit zijn lengte: een eetsalon vanaf ' +
      'drieëntwintig meter, een beach club en een spa vanaf veertig. De werf bepaalt de ' +
      'werkelijke indeling en de afwerking per ruimte.</p>' +
      voet(null) + '</div>';

    /* blad 4: interieur en opties
       De materiaalstaat komt boven de tekening. Zij is namelijk het blad dat
       met de koper mee de werf in gaat: zeven keuzes met de naam erbij, in
       plaats van een tekening die er twee van laat zien. Wat de tekening
       toont staat er daaronder alsnog. */
    var materiaalSvg = global.NGJachtMaterialen
      ? global.NGJachtMaterialen.svg(st, D) : null;
    var blad3 = '<div class="blad">' +
      kop('INTERIEUR EN OPTIES', vind(D.interieurhout, st.interieurhout).l + ' · ' + vind(D.stoffering, st.stoffering).l, 'J-04') +
      (materiaalSvg
        ? '<div class="tek">' + materiaalSvg + '</div>' +
          '<p class="noot">De salon hieronder is de render van deze combinatie hout, stoffering, ' +
          'vloer en wandafwerking; de badkamer volgt het gekozen marmer en metaal. De werf ' +
          'bepaalt de leverancier en de exacte tint.</p>'
        : '') +
      vlak(Bd.salon ? Bd.salon(st) : null, 'Salon') +
      '<div class="rij">' +
        vlak(Bd.bad ? Bd.bad(st) : null, 'Eigenaarsbadkamer') +
        vlak(Bd.licht ? Bd.licht(st) : null, 'Lichtstand') +
      '</div>' +
      (opties.length
        ? '<h3 class="sec">Gekozen opties</h3><ul class="punten">' +
          opties.map(function (o) { return '<li><b>' + esc(o.l) + '</b>: ' + esc(o.uit) + '</li>'; }).join('') + '</ul>'
        : '<h3 class="sec">Opties</h3><ul class="punten"><li>Geen opties gekozen.</li></ul>') +
      voet(null) + '</div>';

    /* blad 4: het vaarprofiel */
    var blad4;
    if (p.geweigerd) {
      blad4 = '<div class="blad">' + kop('VAARPROFIEL', 'buiten bereik', 'J-05') +
        '<ul class="punten">' + p.redenen.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
        voet(null) + '</div>';
    } else {
      blad4 = '<div class="blad">' +
        kop('VAARPROFIEL', p.motor.l, 'J-05') +
        '<div class="rij"><div style="flex:1">' +
          '<h3 class="sec">Snelheid en vaarregime</h3>' +
          '<table><tbody>' +
          '<tr><td>Verdringingssnelheid</td><td class="r">' + f1(p.vRomp) + ' kn</td></tr>' +
          '<tr><td>Kruissnelheid</td><td class="r">' + f1(p.kruis) + ' kn</td></tr>' +
          '<tr><td>Topsnelheid</td><td class="r">' + f1(p.top) + ' kn (' + f0(p.topKmu) + ' km/u)</td></tr>' +
          '<tr><td>Vaarregime</td><td class="r">' + esc(p.regime) + '</td></tr>' +
          '</tbody></table>' +
          '<h3 class="sec">Actieradius</h3>' +
          '<table><tbody>' +
          '<tr><td>Vermogen</td><td class="r">' + p.aantalMotoren + ' &#215; ' + f0(p.vermogen) + ' kW</td></tr>' +
          '<tr><td>Verbruik op kruissnelheid</td><td class="r">' + f0(p.verbruik) + ' l/uur</td></tr>' +
          '<tr><td>Bereik op kruissnelheid</td><td class="r">' + f0(p.afstand) + ' zeemijl</td></tr>' +
          '<tr><td>Bereik bij zuinig varen (' + f1(p.vZuinig) + ' kn)</td><td class="r">' + f0(p.afstandZuinig) + ' zeemijl</td></tr>' +
          '</tbody></table></div>' +
          '<div style="flex:1">' +
          '<h3 class="sec">Vaarbewijs</h3>' +
          '<table><tbody><tr><td><b>' + esc(p.bewijs) + '</b></td></tr>' +
          '<tr><td style="color:#555">' + esc(p.bewijsUit) + ' Bron: CBR, Binnenvaartbesluit art. 16.</td></tr></tbody></table>' +
          '<h3 class="sec">Ligplaats</h3>' +
          '<table><tbody>' +
          '<tr><td>Box minimaal</td><td class="r">' + maat(p.box.lengte) + ' &#215; ' + maat(p.box.breedte) + '</td></tr>' +
          '<tr><td>Waterdiepte minimaal</td><td class="r">' + maat(p.box.diepte) + '</td></tr>' +
          '</tbody></table>' +
          (p.letOp.length ? '<h3 class="sec">Let op</h3><ul class="punten">' +
            p.letOp.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') +
          '</div></div>' +
        voet(null) + '</div>';
    }

    /* blad 5: de investering. Dit blad ontbrak: het voorbeeld dat de koper
       vóór het downloaden bekijkt toonde geen enkel bedrag, terwijl de PDF
       erna wél een volledige prijsopbouw heeft. Een voorbeeld dat iets anders
       laat zien dan het document zelf is erger dan geen voorbeeld. De
       bedragen komen uit hetzelfde rekenpunt als de prijsbalk en de PDF. */
    var prijs = D.prijsVan ? D.prijsVan(st, D) : null;
    var blad5 = !prijs ? '' : '<div class="blad">' +
      kop('INVESTERING', 'richtprijs van deze samenstelling', 'J-06') +
      '<table><tbody>' +
      prijs.posten.filter(function (r) { return r.bedrag !== 0; }).map(function (r) {
        return '<tr><td>' + esc(r.l) + '</td><td class="r">' + euro(r.bedrag) + '</td></tr>';
      }).join('') +
      prijs.opties.map(function (o) {
        var od = vind(D.opties, o.v);
        return '<tr><td>' + esc(od ? od.l : o.v) + '</td><td class="r">' + euro(o.bedrag) + '</td></tr>';
      }).join('') +
      '<tr><td><b>Richtprijs excl. btw</b></td><td class="r"><b>' + euro(prijs.totaal) + '</b></td></tr>' +
      '<tr><td>Btw ' + Math.round(D.btw * 100) + '%</td><td class="r">' + euro(prijs.btw) + '</td></tr>' +
      '<tr><td><b>Richtprijs incl. btw</b></td><td class="r"><b>' + euro(prijs.inclusief) + '</b></td></tr>' +
      (m.bouwtijd ? '<tr><td>Bouwtijd vanaf contract</td><td class="r">circa ' + m.bouwtijd + ' maanden</td></tr>' : '') +
      '</tbody></table>' +
      '<ul class="punten"><li>Richtprijs van een voorbeeldmodel op basis van openbare marktgegevens, ' +
      'geen offerte. De werf stelt de definitieve prijs vast.</li>' +
      '<li>Exclusief afleveringskosten, registratie, verzekering en exploitatie.</li></ul>' +
      voet(null) + '</div>';

    return '<!doctype html><html lang="nl"><head><meta charset="utf-8">' +
      '<title>Dossier J-01: ' + esc(m.l) + '</title><style>' + CSS + '</style></head><body>' +
      '<header class="balk"><b>Dossier J-01 &#183; ' + esc(m.l) + '</b>' +
      '<span>VOORBEELDMODEL: specificaties worden door de werf ingevuld</span>' +
      '<button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' +
      blad1 + blad2 + bladDek + blad3 + blad4 + blad5 + '</body></html>';
  }

  function open(st, D, deelUrl) {
    var vt = function (h) { return (global.NGTaal && global.NGTaal.vertaalHtml) ? global.NGTaal.vertaalHtml(h) : h; };
    NGAfdruk.toon(vt(rapportHtml(st, D, deelUrl)), 'ng-jacht-dossier',
      (global.NGTaal ? global.NGTaal.T('Jachtdossier') : 'Jachtdossier'));
  }

  /* ---------- de vergelijker ---------- */

  function vergelijkHtml(a, b, D) {
    var A = global.NGJachtAanzichten;
    var P = global.NGJachtProfiel;

    function beeld(k) {
      var m = vind(D.modellen, k.model);
      var p = P.bereken(k, D);
      var h = A.hoogten(m, k.dek);
      return { k: k, m: m, p: p, h: h };
    }
    var A1 = beeld(a), B1 = beeld(b);

    /* Ook in de vergelijker geen schetsen. Eerst de render van die
       samenstelling, anders de modelrender; bestaat geen van beide, dan blijft
       de kolom leeg in plaats van getekend. */
    function vglBeeld(x) {
      var Bd = global.NGJachtBeelden || {};
      var url = (Bd.buiten ? Bd.buiten(x.k) : null) ||
                (x.m && x.m.v ? './assets/media/jacht/hero/' + x.m.v + '.webp' : null);
      return url ? '<div class="tek"><img src="' + url + '" alt="' + esc(x.m.l) + '" ' +
        'style="display:block;width:100%;height:auto"></div>' : '<div class="tek"></div>';
    }

    function optieNamen(k) {
      return (k.opties || []).map(function (v) { return vind(D.opties, v).l; });
    }
    var oa = optieNamen(a), ob = optieNamen(b);
    var alleen = function (x, y) { return x.filter(function (i) { return y.indexOf(i) < 0; }); };

    var rijen = [
      ['Model', A1.m.l, B1.m.l],
      ['Lengte over alles', maat(A1.m.loa), maat(B1.m.loa)],
      ['Breedte', maat(A1.m.breedte), maat(B1.m.breedte)],
      ['Diepgang', maat(A1.m.diepgang), maat(B1.m.diepgang)],
      ['Doorvaarthoogte', maat(A1.h.airdraft), maat(B1.h.airdraft)],
      ['Gasten / hutten', A1.m.gasten + ' / ' + A1.m.hutten, B1.m.gasten + ' / ' + B1.m.hutten],
      ['Bemanning', fg(A1.m.bemanning), fg(B1.m.bemanning)],
      ['Kruis- / topsnelheid', f1(A1.p.kruis) + ' / ' + f1(A1.p.top) + ' kn', f1(B1.p.kruis) + ' / ' + f1(B1.p.top) + ' kn'],
      ['Bereik op kruissnelheid', f0(A1.p.afstand) + ' nm', f0(B1.p.afstand) + ' nm'],
      ['Vaarregime', A1.p.regime, B1.p.regime],
      ['Vaarbewijs', A1.p.bewijs, B1.p.bewijs],
      ['Motorisering', vind(D.motorisering, a.motorisering).l, vind(D.motorisering, b.motorisering).l],
      ['Rompkleur', vind(D.rompkleuren, a.rompkleur).l, vind(D.rompkleuren, b.rompkleur).l],
      ['Opbouw', vind(D.opbouw, a.opbouw).l, vind(D.opbouw, b.opbouw).l],
      ['Dek', vind(D.dekken, a.dek).l, vind(D.dekken, b.dek).l],
      ['Dekafwerking', vind(D.dekafwerking, a.dekafwerking).l, vind(D.dekafwerking, b.dekafwerking).l],
      ['Interieur', vind(D.interieurhout, a.interieurhout).l + ' · ' + vind(D.stoffering, a.stoffering).l,
                    vind(D.interieurhout, b.interieurhout).l + ' · ' + vind(D.stoffering, b.stoffering).l]
    ];

    var lijf = rijen.map(function (r) {
      var anders = r[1] !== r[2] ? ' class="anders"' : '';
      return '<tr><td>' + esc(r[0]) + '</td><td' + anders + '>' + esc(r[1]) + '</td><td' + anders + '>' + esc(r[2]) + '</td></tr>';
    }).join('');

    var extraA = alleen(oa, ob), extraB = alleen(ob, oa);
    var samen = oa.filter(function (i) { return ob.indexOf(i) > -1; });
    var optieRij = '<tr><td>Opties, allebei</td><td colspan="2">' + (samen.length ? esc(samen.join(' · ')) : 'geen') + '</td></tr>' +
      '<tr><td>Alleen links</td><td class="' + (extraA.length ? 'anders' : '') + '" colspan="2">' + (extraA.length ? esc(extraA.join(' · ')) : '-') + '</td></tr>' +
      '<tr><td>Alleen rechts</td><td class="' + (extraB.length ? 'anders' : '') + '" colspan="2">' + (extraB.length ? esc(extraB.join(' · ')) : '-') + '</td></tr>';

    var aantalAnders = rijen.filter(function (r) { return r[1] !== r[2]; }).length + (extraA.length || extraB.length ? 1 : 0);

    return '<!doctype html><html lang="nl"><head><meta charset="utf-8">' +
      '<title>Vergelijking: ' + esc(A1.m.l) + ' en ' + esc(B1.m.l) + '</title><style>' + CSS +
      '.twee{display:flex;gap:14px}.twee .tek{flex:1;min-width:0}' +
      '.naam{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin:-8px 0 10px}' +
      '</style></head><body>' +
      '<header class="balk"><b>Vergelijking &#183; ' + aantalAnders + ' verschillen</b>' +
      '<span>VOORBEELDMODEL: geen aanbod</span>' +
      '<button onclick="window.print()">Afdrukken / opslaan als PDF</button></header>' +
      '<div class="blad">' +
      kop('VERGELIJKING', A1.m.l + '  tegenover  ' + B1.m.l, 'J-05') +
      '<div class="twee">' + vglBeeld(A1) + vglBeeld(B1) + '</div>' +
      '<div class="naam"><span>&#9668; ' + esc(A1.m.l) + ' (vastgelegd)</span><span>' + esc(B1.m.l) + ' (huidig) &#9658;</span></div>' +
      '<table><thead><tr><th></th><th>Vastgelegd</th><th>Huidig</th></tr></thead><tbody>' +
      lijf + optieRij + '</tbody></table>' +
      '<p class="voet">Gemarkeerde regels verschillen. Specificaties zijn voorbeeldwaarden van een demonstratiemodel.</p>' +
      '</div></body></html>';
  }

  function vergelijk(a, b, D) {
    var vtv = function (h) { return (global.NGTaal && global.NGTaal.vertaalHtml) ? global.NGTaal.vertaalHtml(h) : h; };
    NGAfdruk.toon(vtv(vergelijkHtml(a, b, D)), 'ng-jacht-vergelijk',
      (global.NGTaal ? global.NGTaal.T('Vergelijking') : 'Vergelijking'));
  }

  global.NGJachtDossier = { open: open, rapportHtml: rapportHtml,
                            vergelijk: vergelijk, vergelijkHtml: vergelijkHtml };
})(typeof window !== 'undefined' ? window : globalThis);
