/* Het jachtdossier als echte PDF — tweede, goedgekeurde opzet.
 *
 * Wat er anders is dan in de eerste versie, en waarom:
 *
 *   LETTERS   De kernlettertypen van jsPDF dragen geen glyfmetriek mee,
 *             waardoor viewers spaties op de verkeerde plek reconstrueren
 *             ("F lybridge", "hetschip"). Het dossier gebruikt daarom de
 *             ingebedde huisstijlletters van de site zelf (Inter voor lopende
 *             tekst, Instrument Serif alleen voor grote titels, IBM Plex Mono
 *             voor nummers en labels) — geregistreerd door
 *             jacht-dossier-fonts.js. Er wordt nergens charSpace gezet.
 *
 *   PAGINA'S  Geen vaste pagina per onderwerp meer, maar vloeiende secties:
 *             elke sectie meet zijn inhoud en begint alleen op een nieuwe
 *             pagina als hij niet meer past. Een model zonder ingevoerde
 *             specificaties krijgt zo een compact, gevuld dossier van 6-7
 *             pagina's in plaats van elf halflege.
 *
 *   EERLIJK   Onbekende specificaties verschijnen niet als vijftien kaarten
 *             "Op aanvraag" maar als één blok: aanvullende werfspecificaties
 *             volgen in het adviesgesprek. Beheerdersmeldingen horen in de
 *             console (NGJachtData.audit), nooit in een klantdossier.
 *             Rekenwaarden van het demonstratiemodel dragen het label
 *             "indicatieve demonstratiewaarden".
 *
 * De vaste regels blijven: exact het gekozen beeld of eerlijk geen beeld,
 *  geen verzonnen cijfers, geen EUR 0, en de verplichte bemanningsdisclaimer.
 */
(function (global) {
  'use strict';

  /* ---------- huisstijl ---------- */
  var GOUD = [168, 127, 61];
  var GOUD_LICHT = [201, 164, 95];
  var INKT = [23, 34, 46];
  var GRIJS = [100, 108, 120];
  var IVOOR = [247, 244, 236];
  var KAART_RAND = [224, 218, 202];
  var DONKER = [16, 20, 26];
  var WIT = [255, 255, 255];

  var A4W = 595.28, A4H = 841.89, M = 52, VOET = 56;

  var SERIF = 'InstrumentSerif', BODY = 'Inter', MONO = 'IBMPlexMono';

  /* ---------- opmaak ---------- */
  function fmt(n, dec) {
    if (n === null || n === undefined || isNaN(n)) return null;
    return Number(n).toLocaleString('nl-NL', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }
  /* Bedrag, maat en inhoud komen uit de eenhedenmodule. Zonder dat zou de PDF
     in euro's en meters uitrollen terwijl de bezoeker het scherm ernaast in
     dollars en voeten heeft staan - en juist de PDF is het stuk dat hij
     doorstuurt. */
  function E() { return global.NGEenheden; }
  function euro(n) { return E() ? E().geld(n) : '€ ' + fmt(Math.round(n)); }
  function maat(x, decimalen) {
    if (x === null || x === undefined || isNaN(x)) return null;
    return E() ? E().lengte(x, decimalen) : fmt(x, decimalen === undefined ? 1 : decimalen) + ' m';
  }
  function inhoud(liters) {
    if (liters === null || liters === undefined || isNaN(liters)) return null;
    return E() ? E().inhoud(liters) : fmt(liters) + ' l';
  }
  function vind(lijst, v) { for (var i = 0; i < lijst.length; i++) if (lijst[i].v === v) return lijst[i]; return null; }
  /* Losse woorden vertalen bij het bouwen. pdfVertalen zoekt een hele zin op,
     dus een bijschrift dat halverwege een al vertaalde materiaalnaam bevat -
     "dekindeling met solid teak" - vindt hij nooit. Die stukken gaan hier
     langs, elk apart. */
  function T(z) { return (global.NGTaal && global.NGTaal.T) ? global.NGTaal.T(z) : z; }
  function hexNaarRgb(hex) {
    var h = String(hex || '#888888').replace('#', '');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function slug(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ---------- configuratienummer ---------- */
  function hash4(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4).padStart(4, '0');
  }
  function confignummer(st, code) {
    var sleutel = 'ng-jacht-dossiernr:' + code;
    try { var b = global.localStorage.getItem(sleutel); if (b) return b; } catch (e) { /* privémodus */ }
    var d = new Date();
    var datum = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    var nr = 'NG-YACHT-' + String(st.model).toUpperCase() + '-' + datum + '-' + hash4(code);
    try { global.localStorage.setItem(sleutel, nr); } catch (e) { /* zie boven */ }
    return nr;
  }

  /* ---------- beelden ---------- */
  /* maxBreed schaalt het beeld terug vóór het in de PDF gaat. De ruimtes aan
     boord komen met z'n twaalven in het dossier; op ware grootte zou dat het
     bestand vier keer zo zwaar maken zonder dat iemand het verschil ziet op een
     halve pagina. Zonder maxBreed blijft het beeld op ware grootte. */
  function laadBeeld(url, maxBreed) {
    return new Promise(function (klaar) {
      if (!url) return klaar(null);
      var img = new Image();
      var af = setTimeout(function () { klaar(null); }, 10000);
      img.onload = function () {
        clearTimeout(af);
        try {
          var bw = img.naturalWidth, bh = img.naturalHeight;
          if (maxBreed && bw > maxBreed) { bh = Math.round(bh * maxBreed / bw); bw = maxBreed; }
          var c = global.document.createElement('canvas');
          c.width = bw; c.height = bh;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#10141a'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          klaar({ data: c.toDataURL('image/jpeg', 0.88), w: c.width, h: c.height });
        } catch (e) { klaar(null); }
      };
      img.onerror = function () { clearTimeout(af); klaar(null); };
      img.src = url;
    });
  }
  /* De zeven stalen van de materiaalstaat, elk als data-adres.

     WAAROM NIET GEWOON HET BESTANDSADRES
     De materiaalstaat gaat als SVG door svgNaarBeeld, en die laadt de tekening
     als los beeld in. Een SVG die zo geladen wordt mag niets van buiten
     ophalen: een <image href="assets/..."> blijft dan leeg en er staat een gat
     waar het staal hoort. Een data-adres staat in de tekening zelf en laadt
     wel. Dus worden ze hier eerst opgehaald en omgezet, en gaat de tekening er
     pas daarna doorheen. Lukt er een niet, dan valt dat vak terug op zijn
     kleur - de staat klopt dan nog steeds. */
  function stalenLaden(st) {
    var M = global.NGJachtMaterialen, B = global.NGJachtBeelden;
    if (!M || !B || !B.los) return Promise.resolve({});
    var posten = M.POSTEN.filter(function (p) { return !!st[p.g]; });
    return Promise.all(posten.map(function (p) {
      var url = B.los('materiaal', p.g + '-' + st[p.g]);
      /* 200 breed is ruim: het vak is 62 eenheden op een blad van 1200, en dat
         blad gaat op 1500 de PDF in. Groter maakt het bestand zwaarder zonder
         dat er een korrel bijkomt. */
      return url ? laadBeeld(url, 200).then(function (b) { return b ? [p.g, b.data] : null; })
                 : Promise.resolve(null);
    })).then(function (rij) {
      var uit = {};
      rij.filter(Boolean).forEach(function (r) { uit[r[0]] = r[1]; });
      return uit;
    });
  }

  function svgNaarBeeld(svgTekst, breedte, licht) {
    return new Promise(function (klaar) {
      try {
        /* Een tekening gaat als beeld de PDF in, en de vertaallaag van de PDF
           pakt alleen tekst die jsPDF zelf zet. Zonder deze regel bleef het
           dekplan - en het silhouet - op de Engelse pagina Nederlands, midden
           in een verder Engels dossier. De HTML-preview deed dit al; hier stond
           het nog niet. */
        if (global.NGTaal && global.NGTaal.vertaalHtml) svgTekst = global.NGTaal.vertaalHtml(svgTekst);
        var blob = new Blob([svgTekst], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        var img = new Image();
        var af = setTimeout(function () { URL.revokeObjectURL(url); klaar(null); }, 8000);
        img.onload = function () {
          clearTimeout(af);
          var c = global.document.createElement('canvas');
          c.width = breedte; c.height = Math.round(img.height * breedte / img.width);
          var ctx = c.getContext('2d');
          /* De ondergrond onder de tekening. Stond hard op donker; met de
             lichte drukvariant erbij moet hij mee, anders krijgt een licht
             blad een zwarte rand rondom waar de tekening niet precies past. */
          ctx.fillStyle = licht ? '#F7F4EC' : '#10141a';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          klaar({ data: c.toDataURL('image/jpeg', 0.88), w: c.width, h: c.height });
        };
        img.onerror = function () { clearTimeout(af); URL.revokeObjectURL(url); klaar(null); };
        img.src = url;
      } catch (e) { klaar(null); }
    });
  }
  function detailKnip(bron, ratio, focusX, zoom, focusY) {
    /* een uitsnede uit de goedgekeurde render, in de exacte verhouding van
       het vlak waarin hij komt: zo kan het beeld van rand tot rand zonder
       vervorming. zoom is de fractie van de bronbreedte die de uitsnede
       gebruikt; focusX schuift hem naar boeg- of achterschipzijde en focusY
       naar de opbouw of naar de waterlijn.

       focusY is erbij gekomen toen de zoom eruit ging. Twee uitsnedes die
       alleen horizontaal van elkaar verschilden moesten daarvoor inzoomen om
       verschillend te zijn, en elke procent zoom is een procent scherpte. Op
       de volle bronbreedte kan dat verschil alleen nog verticaal zitten - de
       ene uitsnede kijkt naar de dekken, de andere naar de romp - en dat kost
       geen enkele beeldpunt. */
    return new Promise(function (klaar) {
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.width, h = img.height;
          var kw = w * (zoom || 1), kh = kw / ratio;
          if (kh > h) { kh = h; kw = h * ratio; }
          if (kw > w) { kw = w; kh = w / ratio; }
          var sx = (w - kw) * (focusX === undefined ? 0.5 : focusX);
          var sy = (h - kh) * (focusY === undefined ? 0.5 : focusY);
          var c = global.document.createElement('canvas');
          c.width = Math.round(kw); c.height = Math.round(kh);
          c.getContext('2d').drawImage(img, sx, sy, kw, kh, 0, 0, c.width, c.height);
          klaar({ data: c.toDataURL('image/jpeg', 0.9), w: c.width, h: c.height });
        } catch (e) { klaar(null); }
      };
      img.onerror = function () { klaar(null); };
      img.src = bron.data;
    });
  }
  function imageResolver(st, D) {
    var m = vind(D.modellen, st.model);
    var buitenUrl = global.NGJachtBeelden ? global.NGJachtBeelden.buiten(st) : null;
    var interieurUrl = global.NGJachtBeelden && global.NGJachtBeelden.interieur
      ? global.NGJachtBeelden.interieur({ model: st.model, interieurhout: st.interieurhout, stoffering: st.stoffering })
      : null;
    /* het gerenderde boven- en vooraanzicht bestaan voor elk model, ook voor de
       modellen waarvan de maten nog open staan — een dekfoto verzint geen
       breedte, en een boegaanzicht evenmin */
    var bovenFotoUrl = global.NGJachtBeelden && global.NGJachtBeelden.boven
      ? global.NGJachtBeelden.boven(st.model, st.dekafwerking, st.dek) : null;
    var voorFotoUrl = global.NGJachtBeelden && global.NGJachtBeelden.voor
      ? global.NGJachtBeelden.voor(st.model, st.dek) : null;
    var achterFotoUrl = global.NGJachtBeelden && global.NGJachtBeelden.achter
      ? global.NGJachtBeelden.achter(st.model, st.dek) : null;
    /* De ruimtes aan boord. De salon volgt hout en stoffering exact en staat al
       groot in het interieurhoofdstuk; de overige ruimtes zijn impressies in de
       catalogusafwerking en horen er net zo goed in — wie een jacht van zes
       miljoen samenstelt wil zien wat hij binnen krijgt, niet alleen de salon.
       Welke ruimtes bestaan hangt van de lengte af: een sloep heeft geen
       bioscoop. */
    var ruimten = [];
    if (global.NGJachtBeelden && global.NGJachtBeelden.ruimten && global.NGJachtBeelden.ruimte) {
      ruimten = (global.NGJachtBeelden.ruimten(m.loa) || [])
        .filter(function (r) { return r.v !== 'salon'; })
        .map(function (r) { return { naam: r.l, url: global.NGJachtBeelden.ruimte(r.v, st.model) }; })
        .filter(function (r) { return !!r.url; });
    }
    /* Het dekplan is geen render maar een tekening: hij komt uit de maten van
       dit model en volgt de gekozen opties. In het dossier hoort hij daarom
       altijd te staan, ook bij een model waarvan nog geen enkele foto bestaat.
       Hij gaat als SVG door dezelfde omzetter als het silhouet - de PDF-laag
       tekent geen SVG's, maar dit is een beeld en geen tekstblok. Ontbreken de
       maten, dan geeft de module null en blijft het blad zonder dekplan. */
    /* De lichte drukvariant, niet de schermversie. Een donkere tekening op een
       crème blad leest als een screenshot dat iemand erin geplakt heeft, en de
       dunne lichte lijnen die op een scherm helder zijn lopen in de druk
       dicht. Zelfde tekening, ander palet. */
    /* Het dekplan was het laatste getekende blad in dit document: rechthoeken
       met HUT erin, op een blad vol echte renders. Het is er uit. De indeling
       staat er nog wel, maar in cijfers - hutten, badkamers, bemanningshutten,
       dekken - en de ruimten zelf staan verderop als render. */
    var dekplanSvg = null;
    /* De materiaalstaat hangt aan de keuzes en niet aan de maten, dus die
       bestaat ook voor een model waarvan de werf de breedte nog niet heeft
       opgegeven. Hij wordt pas opgebouwd als de stalen binnen zijn, want
       anders zou de tekening met lege vakken de PDF in gaan. */
    /* De nachtopname. Hij bestaat voor elk model en elke dekvorm, alleen in de
       catalogusuitvoering - en dat is precies goed voor een brochure: één blad
       hetzelfde schip bij avond met het licht aan. Het dossier gebruikte hem
       tot nu toe niet, terwijl hij klaarlag. */
    var nachtUrl = (global.NGJachtBeelden && global.NGJachtBeelden.nacht)
      ? global.NGJachtBeelden.nacht(st.model, st.dek) : null;

    /* De modelrender als terugval op het zijaanzicht. Hij staat in de
       cataloguskleuren en niet in de gekozen kleur, dus het bijschrift moet
       dat zeggen - vandaar de vlag. Wat hier NIET meer gebeurt, is terugvallen
       op een getekend silhouet. */
    var heroUrl = m && m.v ? './assets/media/jacht/hero/' + m.v + '.webp' : null;

    /* Een render per aangevinkte optie. De uitrustingslijst was tekst: een
       kaartje met een gouden medaillon met de beginletter erin. Er ligt van
       elke optie een beeld klaar, in de maatklasse van dit schip, en dat is
       nu juist waar een koper naar wil kijken als hij voor een half miljoen
       aan opties heeft aangevinkt. Het medaillon was een plaatsvervanger voor
       een beeld dat er wel is. */
    var optieBeelden = [];
    if (global.NGJachtBeelden && global.NGJachtBeelden.optie) {
      (st.opties || []).forEach(function (ov) {
        var u = global.NGJachtBeelden.optie(ov, st.model);
        if (u) optieBeelden.push({ v: ov, url: u });
      });
    }

    /* De materiaalkamers: de salon met vier keuzes tegelijk, de badkamer met
       marmer en metaal, en de lichtstand. Ze horen in het dossier om dezelfde
       reden als op het scherm - een staal zegt wat een materiaal is, een kamer
       zegt wat het doet - en de materiaalstaat leest hieruit af waar de gouden
       stip mag staan. */
    var salonUrl = (global.NGJachtBeelden && global.NGJachtBeelden.salon)
      ? global.NGJachtBeelden.salon(st) : null;
    var badUrl = (global.NGJachtBeelden && global.NGJachtBeelden.bad)
      ? global.NGJachtBeelden.bad(st) : null;
    var lichtUrl = (global.NGJachtBeelden && global.NGJachtBeelden.licht)
      ? global.NGJachtBeelden.licht(st) : null;
    var kamerBeelden = { salon: !!salonUrl, bad: !!badUrl, licht: !!lichtUrl };

    var materiaalBlad = global.NGJachtMaterialen
      ? stalenLaden(st).then(function (stalen) {
          return svgNaarBeeld(global.NGJachtMaterialen.svg(st, D, {
            licht: true,
            staal: function (groep) { return stalen[groep] || null; },
            /* Welke kamers er in dít dossier staan. De materiaalstaat zet de
               gouden stip bij de keuzes die op een opname te zien zijn, en in
               de PDF is dat een andere verzameling dan op het scherm: hier
               staan alleen de beelden die werkelijk ingeladen zijn. Zonder
               deze regel zou de staat in de PDF naar een salonopname wijzen
               die er in het document niet is. */
            kamers: kamerBeelden
          }), 1500, true);
        })
      : Promise.resolve(null);
    return {
      taken: { buitenUrl: buitenUrl, interieurUrl: interieurUrl },
      laad: function () {
        return Promise.all([
          buitenUrl ? laadBeeld(buitenUrl)
            : (heroUrl ? laadBeeld(heroUrl, 1600) : Promise.resolve(null)),
          interieurUrl ? laadBeeld(interieurUrl) : Promise.resolve(null),
          bovenFotoUrl ? laadBeeld(bovenFotoUrl) : Promise.resolve(null),
          voorFotoUrl ? laadBeeld(voorFotoUrl) : Promise.resolve(null),
          achterFotoUrl ? laadBeeld(achterFotoUrl) : Promise.resolve(null),
          Promise.all(ruimten.map(function (r) {
            /* Op ware grootte en niet op 900. De ruimtes stonden hier alleen
               in een raster van een kwart blad, en 900 was daar ruim voor. Sinds
               de eerste ruimte het hoofdstukblad "Aan boord" opent, moet hij ook
               een band over de volle bladbreedte kunnen dragen - en dat kan een
               beeld van 900 punten niet zonder zacht te worden. De renders zijn
               1200 breed, dus dit schaalt niets terug; het houdt alleen op met
               weggooien wat er is. */
            return laadBeeld(r.url, 1200).then(function (b) { return b ? { naam: r.naam, beeld: b } : null; });
          })).then(function (lijst) { return lijst.filter(Boolean); }),
          dekplanSvg ? svgNaarBeeld(dekplanSvg, 1500, true) : Promise.resolve(null),
          materiaalBlad,
          nachtUrl ? laadBeeld(nachtUrl, 1500) : Promise.resolve(null),
          salonUrl ? laadBeeld(salonUrl, 1200) : Promise.resolve(null),
          badUrl ? laadBeeld(badUrl, 1200) : Promise.resolve(null),
          Promise.all(optieBeelden.map(function (o) {
            return laadBeeld(o.url, 900).then(function (bd) {
              return bd ? { v: o.v, beeld: bd } : null;
            });
          })).then(function (l) { return l.filter(Boolean); })
        ]).then(function (r) {
          var basis = { buiten: r[0], interieur: r[1], bovenFoto: r[2], voorFoto: r[3],
                        achterFoto: r[4], ruimten: r[5], dekplan: r[6], materiaal: r[7],
                        nacht: r[8], salon: r[9], bad: r[10], opties: r[11],
                        echt: !!(buitenUrl && r[0]),
                        buitenIsHero: !buitenUrl && !!r[0] };
          /* alleen van een echte render maken we brochurebeelden: het volle
             voorbladbeeld en twee detailuitsnedes — allemaal exact dezelfde
             goedgekeurde combinatie, dus nooit een verkeerd schip */
          if (!basis.echt || r[0].w < 1000) return basis;
          /* De verhouding en de zoom van deze uitsnedes bepalen hoe scherp ze
             op het blad staan, en dat was hier niet meegewogen.

             Een uitsnede die 62 procent van de bronbreedte pakt houdt 744 van
             1200 beeldpunten over, en die 744 werden daarna over de volle
             bladbreedte getrokken: negentig beeldpunten per duim, en op een
             hoofdstukblad zelfs negentien. Er wordt nu niet meer ingezoomd: de
             uitsnede pakt de volle 1200 punten breed en snijdt alleen boven en
             onder weg. Dat is precies genoeg voor een band over de volle
             bladbreedte op 144 per duim.

             Het verschil tussen de twee zit daarmee in de hoogte en niet in de
             breedte - de ene kijkt naar de dekken, de andere naar de romp en de
             waterlijn.

             De voorbladuitsnede is vervallen: die sneed op 1,75 op 1 en hield
             daarmee 910 punten over voor een vlak van 595. Het voorblad gebruikt
             nu de render zelf, over de volle breedte en in zijn eigen
             verhouding, en er worden er dus twee gesneden in plaats van drie. */
          return Promise.all([
            detailKnip(r[0], 2.9, 0.5, 1, 0.12),
            detailKnip(r[0], 2.9, 0.5, 1, 0.88)
          ]).then(function (k) {
            basis.detailA = k[0]; basis.detailB = k[1];
            return basis;
          });
        });
      }
    };
  }

  /* ---------- de vloeiende bouwer ----------
     Secties schrijven door op de huidige pagina; wie niet meer past, gaat
     naar de volgende. Zo bestaan er geen halflege pagina's per onderwerp. */
  function Bouwer(doc) {
    this.d = doc;
    this.y = M + 26;
    this.paginas = 1;
  }
  Bouwer.prototype.zorg = function (hoogte) {
    if (this.y + hoogte > A4H - VOET) this.breek();
  };
  Bouwer.prototype.breek = function () {
    this.d.addPage();
    this.paginas++;
    this.d.setFillColor(IVOOR[0], IVOOR[1], IVOOR[2]);
    this.d.rect(0, 0, A4W, A4H, 'F');
    this.y = M + 26;
  };
  Bouwer.prototype.kop = function (nr, titel, minRuimte) {
    /* Ook de secties komen in de inhoud, ingesprongen onder hun hoofdstuk.
       Een inhoud van vier regels op een A4 is geen inhoud maar een kop. */
    var noteer = this.hoofdstukken = this.hoofdstukken || [];
    /* Een sectiekop begint nooit onderaan een blad zonder inhoud eronder.

       Wel met een bovengrens: vraagt de aanroeper meer ruimte dan er op een
       heel blad past - het dekplan van de Giga 120 met zeven dekken is hoger
       dan de bladspiegel - dan breekt zorg() af, past het op het verse blad
       nog steeds niet, en blijft er een leeg blad achter. Meer dan een blad
       reserveren heeft geen zin: dan is één afbreking het maximum dat helpt. */
    var bruikbaar = A4H - VOET - (M + 26) - 76;
    this.zorg(76 + Math.min(minRuimte || 90, bruikbaar));
    if (this.y > M + 30) this.y += 16;
    var d = this.d;
    d.setFont(MONO, 'normal'); d.setFontSize(7.5);
    d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
    d.text(nr.toUpperCase(), M, this.y);
    d.setFont(SERIF, 'normal'); d.setFontSize(25);
    d.setTextColor(INKT[0], INKT[1], INKT[2]);
    d.text(titel, M, this.y + 28);
    d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.9);
    d.line(M, this.y + 38, M + 84, this.y + 38);
    noteer.push({ titel: titel, pagina: this.paginas, hoofdstuk: false });
    this.y += 60;
  };
  /* ---------- hoe groot een beeld hoogstens geplaatst mag worden ----------

     WAAROM DIT ER IS
     Een beeld dat groter op het blad staat dan het aan beeldpunten heeft, wordt
     niet groter maar zachter. Dat was hier op acht bladen aan de hand, en het
     ergste geval was een hoofdstukblad: een uitsnede van 744 punten breed werd
     over de volle bladhoogte getrokken en kwam daarmee op een vlak van 2860 bij
     842 terecht - negentien beeldpunten per duim, ofwel een streep waar een
     schip hoort te staan. De maat werd berekend uit wat het vlak wilde, en
     nergens uit wat het beeld te bieden had.

     DE ONDERGRENS
     Twee beeldpunten per punt papier is 144 per duim. Dat is de grens waaronder
     een foto op een scherm zichtbaar zacht wordt en in de druk merkbaar. De
     renders zijn 1200 punten breed; die halen daarmee precies de volle
     bladbreedte van een A4 (595 punten, 145 per duim) en geen punt meer. De
     aanzichten zijn 2400 breed en kunnen dus wel over de rand.

     WAT DAT BETEKENT VOOR DE OPMAAK
     Een beeld dat de grens niet haalt wordt niet uitgerekt maar kleiner
     geplaatst: een band over de bladbreedte in plaats van een vulling van rand
     tot rand, of een ingezette plaat op een donker blad. Dat is geen
     noodoplossing maar het eerlijke formaat van wat er ligt - en het leest als
     een keuze, wat een uitgerekte foto nooit doet.

     Meer beeld op het blad krijgen kan maar op één manier, en dat is met
     grotere renders. Zolang die 1200 punten breed zijn, is 595 punten papier
     het maximum. */
  var PPP_MIN = 2;                       // beeldpunten per punt papier = 144 dpi
  function beeldMaat(beeld, vlakB, vlakH, vullen) {
    if (!beeld || !beeld.w || !beeld.h) return null;
    var v = beeld.w / beeld.h;
    var b, h;
    if (vullen) {
      /* vullend: het kleinste formaat dat het vlak aan alle kanten bedekt */
      var s = Math.max(vlakB / beeld.w, vlakH / beeld.h);
      b = beeld.w * s; h = beeld.h * s;
    } else {
      /* passend: het grootste formaat dat binnen het vlak blijft */
      b = Math.min(vlakB, vlakH * v); h = b / v;
    }
    var maxB = beeld.w / PPP_MIN;
    if (b > maxB) { b = maxB; h = b / v; }
    return { b: b, h: h, dpi: Math.round(beeld.w / b * 72) };
  }

  Bouwer.prototype.beeldVol = function (bnd, hoog, bijschrift) {
    /* Beeld over de volle bladbreedte, als in een drukwerkbrochure.

       Hier stond het beeld hard op A4W bij `hoog` - de aanroeper gaf een hoogte
       en die werd gehaald, wat de verhouding van het beeld ook was. Bij de
       detailuitsnede van het exterieur betekende dat een strook van 3,4 op 1
       die op 2,1 op 1 werd getrokken: het schip stond twee derde te hoog op
       blad vijf, en niemand die het zag rekende het uit - het zag er alleen
       niet goed uit.

       Nu bepaalt het beeld zijn eigen verhouding en zijn eigen bovengrens, en
       is `hoog` wat het hoogstens mag worden. */
    if (!bnd) return false;
    var p = beeldMaat(bnd, A4W, hoog, true);
    if (!p) return false;
    this.zorg(p.h + (bijschrift ? 22 : 12));
    var d = this.d;
    var kanKnippen = typeof d.clip === 'function' && typeof d.discardPath === 'function';
    var vlakH = Math.min(hoog, p.h);
    if (p.b > A4W && kanKnippen) {
      /* breder dan het blad: de overhang wordt weggeknipt en niet weggerekt */
      d.saveGraphicsState();
      d.rect(0, this.y, A4W, vlakH, null); d.clip(); d.discardPath();
      d.addImage(bnd.data, 'JPEG', (A4W - p.b) / 2, this.y + (vlakH - p.h) / 2, p.b, p.h, undefined, 'FAST');
      d.restoreGraphicsState();
    } else {
      d.addImage(bnd.data, 'JPEG', (A4W - p.b) / 2, this.y, p.b, p.h, undefined, 'FAST');
    }
    /* De lijn onder het beeld loopt zo breed als het beeld en niet zo breed
       als het blad: bij een band die de volle breedte niet haalt stak hij aan
       weerszijden uit, en een lijn die verder loopt dan waar hij onder staat
       leest als een fout. */
    d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.8);
    var lb = Math.min(p.b, A4W), lx = (A4W - lb) / 2;
    d.line(lx, this.y + vlakH, lx + lb, this.y + vlakH);
    this.y += vlakH + 8;
    if (bijschrift) this.bijschrift(bijschrift, M, A4W - 2 * M);
    return true;
  };
  /* Een bijschrift dat over de rand loopt.

     Dit stond twee keer als één regel `d.text(...)` zonder breedte, en een
     bijschrift is nu eenmaal soms lang: onder de materiaalstaat liep hij het
     blad af en eindigde midden in "MATERIAAL EN NIE". jsPDF breekt niet uit
     zichzelf af, dus dat moet hier gebeuren - en dan meteen op één plek, want
     twee plekken is precies hoe de ene wel en de andere niet werd
     bijgewerkt. */
  Bouwer.prototype.bijschrift = function (tekst, x, breed) {
    var d = this.d;
    d.setFont(MONO, 'normal'); d.setFontSize(6.4);
    d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
    var regels = d.splitTextToSize(String(tekst).toUpperCase(), breed);
    d.text(regels, x, this.y + 2);
    this.y += regels.length * 9 + 6;
  };
  Bouwer.prototype.citaat = function (tekst) {
    /* de modelomschrijving als gecentreerd citaat met gouden accentlijnen */
    var d = this.d;
    d.setFont(SERIF, 'italic'); d.setFontSize(13.5);
    var breed = A4W - 2 * M - 90;
    var regels = d.splitTextToSize(tekst, breed);
    this.zorg(regels.length * 18.5 + 40);
    d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.7);
    d.line(A4W / 2 - 32, this.y + 2, A4W / 2 + 32, this.y + 2);
    d.setTextColor(INKT[0], INKT[1], INKT[2]);
    d.text(regels, A4W / 2, this.y + 24, { align: 'center' });
    this.y += regels.length * 18.5 + 34;
  };
  Bouwer.prototype.alinea = function (tekst, o) {
    o = o || {};
    var d = this.d;
    d.setFont(o.font || BODY, o.stijl || 'normal');
    d.setFontSize(o.maat || 9.3);
    var kleur = o.kleur || INKT;
    d.setTextColor(kleur[0], kleur[1], kleur[2]);
    var breed = o.breed || (A4W - 2 * M);
    var regels = d.splitTextToSize(tekst, breed);
    var regelH = o.regel || (o.maat || 9.3) * 1.42;
    this.zorg(regels.length * regelH + 4);
    d.text(regels, o.x || M, this.y);
    this.y += regels.length * regelH + (o.na === undefined ? 7 : o.na);
  };
  Bouwer.prototype.label = function (tekst) {
    var d = this.d;
    this.zorg(20);
    d.setFont(MONO, 'normal'); d.setFontSize(6.8);
    d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
    d.text(tekst.toUpperCase(), M, this.y);
    this.y += 14;
  };
  Bouwer.prototype.kaarten = function (items, perRij, kh) {
    var d = this.d;
    perRij = perRij || 3; kh = kh || 50;
    var gut = 10;
    var kw = (A4W - 2 * M - (perRij - 1) * gut) / perRij;
    var rijen = Math.ceil(items.length / perRij);
    this.zorg(rijen * (kh + gut));
    for (var i = 0; i < items.length; i++) {
      var x = M + (i % perRij) * (kw + gut);
      var y = this.y + Math.floor(i / perRij) * (kh + gut);
      d.setFillColor(WIT[0], WIT[1], WIT[2]);
      d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]);
      d.roundedRect(x, y, kw, kh, 4, 4, 'FD');
      d.setFont(MONO, 'normal'); d.setFontSize(6.2);
      d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
      d.text(String(items[i][1]).toUpperCase(), x + 10, y + 14);
      d.setFont(BODY, 'bold'); d.setFontSize(12);
      d.setTextColor(INKT[0], INKT[1], INKT[2]);
      /* een lang configuratienummer krimpt tot het in de kaart past */
      var waarde = String(items[i][0]);
      while (d.getTextWidth(waarde) > kw - 20 && d.getFontSize() > 7) d.setFontSize(d.getFontSize() - 0.5);
      d.text(waarde, x + 10, y + 33);
    }
    this.y += rijen * (kh + gut) + 4;
  };
  /* Hoe hoog dit beeld werkelijk wordt op de bladspiegel.

     kop() reserveert ruimte voor wat eronder komt, maar kreeg dat als een
     geschat getal mee. Klopte de schatting niet, dan brak beeld() daarna
     alsnog af en bleef de kop alleen op een blad achter - precies wat er bij
     de Giga 120 gebeurde: "Dekken en indeling" stond in zijn eentje op blad
     tien. Met de echte hoogte kan kop() de goede beslissing nemen. */
  Bouwer.prototype.beeldHoogte = function (beeld, maxH) {
    if (!beeld) return 0;
    maxH = Math.min(maxH, A4H - VOET - (M + 26) - 24);
    /* Dezelfde grens als beeld() zelf aanhoudt, anders reserveert kop() ruimte
       voor een beeld dat straks kleiner blijkt en staat er wit onder. */
    var p = beeldMaat(beeld, A4W - 2 * M, maxH, false);
    return p.h + 22;
  };
  Bouwer.prototype.beeld = function (beeld, maxH, bijschrift) {
    if (!beeld) return false;
    var d = this.d;
    /* Een beeld hoger dan de bladspiegel loopt van het blad af, hoe vaak je
       ook afbreekt. De grens is dus niet alleen wat de aanroeper vraagt maar
       ook wat er op een blad past.

       En niet alleen dat: hij moet zich ook schikken naar wat er ná de kop nog
       over is. Het dekplan van de Giga 120 telt zeven dekken en is hoger dan
       de ruimte onder een sectiekop; dan brak zorg() af en bleef "Dekken en
       indeling" alleen op een blad achter. Is er nog een behoorlijk stuk blad
       over, dan krimpt het beeld naar dat stuk in plaats van een blad verder
       te springen. Is er bijna niets meer, dan is afbreken juist wel het
       goede antwoord. */
    var rest = A4H - VOET - this.y - 24;
    maxH = Math.min(maxH, rest >= 300 ? rest : (A4H - VOET - (M + 26) - 24));
    /* Passend binnen de bladspiegel, en nooit groter dan het beeld scherp aan
       kan. De bladspiegel is 491 punten breed; een render van 1200 haalt dat
       ruim, maar een uitsnede van 744 niet meer. */
    var pm = beeldMaat(beeld, A4W - 2 * M, maxH, false);
    var breed = pm.b, hoog = pm.h;
    this.zorg(hoog + 22);
    var x = (A4W - breed) / 2;
    d.addImage(beeld.data, 'JPEG', x, this.y, breed, hoog, undefined, 'FAST');
    d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]); d.setLineWidth(0.6);
    d.roundedRect(x, this.y, breed, hoog, 4, 4, 'D');
    this.y += hoog + 5;
    if (bijschrift) this.bijschrift(bijschrift, x, breed);
    else this.y += 8;
    return true;
  };
  Bouwer.prototype.beeldPaar = function (items) {
    /* De ruimtes twee naast elkaar, elk met de naam eronder. Twaalf ruimtes op
       volle breedte zou vier bladen kosten; naast elkaar leest het als een
       brochure en past het op één à twee. Elk beeld wordt in zijn eigen vak
       bijgesneden zodat de rij een rechte onderrand houdt, ook als de ene
       impressie iets anders is aangeleverd dan de andere. */
    var d = this.d;
    var gut = 8;
    var kb = (A4W - 2 * M - gut) / 2;
    var kh = Math.round(kb * 520 / 1200);
    for (var i = 0; i < items.length; i += 2) {
      var rij = items.slice(i, i + 2);
      /* Blijft er één ruimte over, dan krijgt die de volle breedte in plaats
         van een halve met wit ernaast. Een losse foto naast een leeg vak leest
         als een ontbrekend beeld. */
      if (rij.length === 1) {
        var vb = A4W - 2 * M, vh = Math.round(vb * 520 / 1200);
        this.zorg(vh + 16);
        var it1 = rij[0];
        var kanKnip1 = typeof d.clip === 'function' && typeof d.discardPath === 'function' &&
                       typeof d.saveGraphicsState === 'function';
        var sc1 = kanKnip1 ? Math.max(vb / it1.beeld.w, vh / it1.beeld.h)
                           : Math.min(vb / it1.beeld.w, vh / it1.beeld.h);
        var bw1 = it1.beeld.w * sc1, bh1 = it1.beeld.h * sc1;
        if (kanKnip1) {
          d.saveGraphicsState();
          d.rect(M, this.y, vb, vh, null); d.clip(); d.discardPath();
          d.addImage(it1.beeld.data, 'JPEG', M + (vb - bw1) / 2, this.y + (vh - bh1) / 2,
                     bw1, bh1, undefined, 'FAST');
          d.restoreGraphicsState();
        } else {
          d.addImage(it1.beeld.data, 'JPEG', M + (vb - bw1) / 2, this.y + (vh - bh1) / 2,
                     bw1, bh1, undefined, 'FAST');
        }
        d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]); d.setLineWidth(0.6);
        d.rect(M, this.y, vb, vh, 'D');
        d.setFont(MONO, 'normal'); d.setFontSize(6.4);
        d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
        d.text(String(it1.naam).toUpperCase(), M, this.y + vh + 8);
        this.y += vh + 16;
        continue;
      }
      this.zorg(kh + 16);
      for (var k = 0; k < rij.length; k++) {
        var x = M + k * (kb + gut);
        var it = rij[k];
        /* verhoudingsverschillen opvangen: vullen en overtollige hoogte
           wegsnijden in plaats van het beeld uitrekken */
        var kanKnippen = typeof d.clip === 'function' && typeof d.discardPath === 'function' &&
                         typeof d.saveGraphicsState === 'function';
        var schaal = kanKnippen ? Math.max(kb / it.beeld.w, kh / it.beeld.h)
                                : Math.min(kb / it.beeld.w, kh / it.beeld.h);
        var bw = it.beeld.w * schaal, bh = it.beeld.h * schaal;
        var bx = x + (kb - bw) / 2, by = this.y + (kh - bh) / 2;
        if (kanKnippen) {
          d.saveGraphicsState();
          d.rect(x, this.y, kb, kh, null);
          d.clip(); d.discardPath();
          d.addImage(it.beeld.data, 'JPEG', bx, by, bw, bh, undefined, 'FAST');
          d.restoreGraphicsState();
        } else {
          /* geen knipfunctie in deze jsPDF: dan passend erin in plaats van
             vullend, want een uitgerekt interieur is erger dan een witrand */
          d.addImage(it.beeld.data, 'JPEG', bx, by, bw, bh, undefined, 'FAST');
        }
        d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]); d.setLineWidth(0.6);
        d.rect(x, this.y, kb, kh, 'D');
        d.setFont(MONO, 'normal'); d.setFontSize(6.4);
        d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
        d.text(String(it.naam).toUpperCase(), x, this.y + kh + 8);
      }
      this.y += kh + 16;
    }
    this.y += 4;
  };
  Bouwer.prototype.materiaalKaarten = function (stalen) {
    /* grotere materiaalkaarten: witte kaart met een royaal staal, de naam en
       een korte toelichting — het exterieurdeel zonder tweede render leunt
       hierop, dus ze mogen wat meer ruimte innemen dan de gewone staalrij */
    var d = this.d;
    var perRij = 2, gut = 12;
    var kw = (A4W - 2 * M - gut) / perRij;
    var kh = 64;
    for (var ri = 0; ri < stalen.length; ri += perRij) {
      var rij = stalen.slice(ri, ri + perRij);
      this.zorg(kh + 10);
      for (var i = 0; i < rij.length; i++) {
        var x = M + i * (kw + gut);
        d.setFillColor(WIT[0], WIT[1], WIT[2]);
        d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]);
        d.roundedRect(x, this.y, kw, kh, 4, 4, 'FD');
        var rgb = hexNaarRgb(rij[i][0]);
        d.setFillColor(rgb[0], rgb[1], rgb[2]);
        d.roundedRect(x + 12, this.y + 12, 56, 40, 3, 3, 'FD');
        d.setFont(BODY, 'bold'); d.setFontSize(9.6);
        while (d.getTextWidth(rij[i][1]) > kw - 92 && d.getFontSize() > 7) d.setFontSize(d.getFontSize() - 0.5);
        d.setTextColor(INKT[0], INKT[1], INKT[2]);
        d.text(rij[i][1], x + 80, this.y + 26);
        if (rij[i][2]) {
          d.setFont(BODY, 'normal'); d.setFontSize(7.6);
          d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
          d.text(d.splitTextToSize(rij[i][2], kw - 92).slice(0, 2), x + 80, this.y + 39);
        }
      }
      this.y += kh + 10;
    }
    this.y += 4;
  };
  Bouwer.prototype.staalRij = function (stalen) {
    /* materiaalstalen naast elkaar: [kleurhex, naam, sub] */
    var d = this.d;
    var perRij = 2, gut = 12;
    var kw = (A4W - 2 * M - gut) / perRij;
    var kh = 40;
    var rijen = Math.ceil(stalen.length / perRij);
    this.zorg(rijen * (kh + 8));
    for (var i = 0; i < stalen.length; i++) {
      var x = M + (i % perRij) * (kw + gut);
      var y = this.y + Math.floor(i / perRij) * (kh + 8);
      var rgb = hexNaarRgb(stalen[i][0]);
      d.setFillColor(rgb[0], rgb[1], rgb[2]);
      d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]);
      d.roundedRect(x, y, 44, 30, 3, 3, 'FD');
      d.setFont(BODY, 'bold'); d.setFontSize(8.8);
      d.setTextColor(INKT[0], INKT[1], INKT[2]);
      d.text(stalen[i][1], x + 54, y + 12);
      if (stalen[i][2]) {
        d.setFont(BODY, 'normal'); d.setFontSize(7.6);
        d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
        var sub = d.splitTextToSize(stalen[i][2], kw - 58);
        d.text(sub.slice(0, 2), x + 54, y + 23);
      }
    }
    this.y += rijen * (kh + 8) + 6;
  };
  Bouwer.prototype.luxeBlok = function (tekst) {
    /* één rustig goudomlijnd blok in plaats van rijen "Op aanvraag" */
    var d = this.d;
    var breed = A4W - 2 * M;
    d.setFont(SERIF, 'italic'); d.setFontSize(12.5);
    var regels = d.splitTextToSize(tekst, breed - 56);
    var h = regels.length * 17 + 30;
    this.zorg(h + 10);
    d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.8);
    d.setFillColor(252, 250, 244);
    d.roundedRect(M, this.y, breed, h, 5, 5, 'FD');
    d.setTextColor(INKT[0], INKT[1], INKT[2]);
    d.text(regels, M + 28, this.y + 24);
    this.y += h + 12;
  };
  Bouwer.prototype.demoLabel = function () {
    /* het label hoort bij de kaarten eronder; blijft er onderaan een blad te
       weinig ruimte over voor minstens één kaartenrij, dan verhuist het mee */
    this.zorg(80);
    this.alinea('Indicatieve demonstratiewaarden, te valideren door de werf.', {
      font: MONO, maat: 6.8, kleur: GOUD, na: 6, regel: 10
    });
  };

  /* ---------- bouwstenen voor een brochure in plaats van een datablad ----------

     Wat hieronder staat is er bijgekomen toen bleek dat het dossier weliswaar
     compleet was maar las als een formulier: elke pagina een kop met daaronder
     een raster van omkaderde vakjes, en onderaan een half blad wit omdat de
     tekst op was. Een werf die een schip van anderhalf miljoen verkoopt legt
     geen invulformulier op tafel.

     Drie dingen maken het verschil, en die drie staan hier:
       - een hoofdstukblad, zodat het document een ritme krijgt
       - beeld dat de bladspiegel vult in plaats van een strook
       - cijfers als gezette tabel met haarlijnen in plaats van kaartjes
  */

  /* Een heel blad voor een hoofdstuk: donker, een beeld dat het blad vult, en
     de titel eroverheen. Dit is wat een datablad van een brochure scheidt -
     de lezer weet waar hij is en krijgt even lucht.

     Zonder beeld blijft het blad gewoon donker met de titel; dat is rustiger
     dan een grijs vlak waar een foto had moeten staan. */
  Bouwer.prototype.hoofdstukBlad = function (nr, titel, onder, beeld, inhoudTitel) {
    var d = this.d;
    this.nieuwBlad(true);
    /* Onthouden waar dit hoofdstuk begint, zodat de inhoudsopgave straks de
       juiste bladnummers kan zetten. Ze worden hier geteld en niet achteraf
       geraden.

       Op het hoofdstukblad staat groot wat de lezer wil zien - bij het eerste
       hoofdstuk de naam van het schip - maar in de inhoud hoort te staan waar
       het hoofdstuk over gaat. Vandaar dat die twee apart kunnen. */
    (this.hoofdstukken = this.hoofdstukken || []).push({
      titel: inhoudTitel || titel, pagina: this.paginas, hoofdstuk: true });
    d.setFillColor(DONKER[0], DONKER[1], DONKER[2]);
    d.rect(0, 0, A4W, A4H, 'F');
    if (beeld) {
      /* Zo groot als dit beeld scherp kan, en geen punt meer.

         Hier stond `Math.max(A4W / beeld.w, A4H / beeld.h)`: vullend, zodat een
         brochurebeeld alle vier de randen raakt. Dat werkt met een staand beeld
         en niet met wat hier ligt. Een render is 2,3 op 1 en een uitsnede 3,4 op
         1; om die de hoogte van een A4 te laten halen moet hij 2860 punten breed
         worden op een blad van 595, en dan staat er een streep van negentien
         beeldpunten per duim.

         Wat het wel wordt: een band over de bladbreedte, zo hoog als de
         verhouding van het beeld geeft, gecentreerd in het bovenste deel van het
         blad met de titel eronder. Haalt het beeld de volle breedte niet, dan
         wordt het een ingezette plaat - kleiner, maar scherp, en met de gouden
         lijnen erboven en eronder leest dat als een plaat en niet als een gat. */
      var vlakH = A4H - 300;
      var p = beeldMaat(beeld, A4W, vlakH, true);
      var bandH = Math.min(p.h, vlakH);
      /* Gecentreerd tussen de kopregel en de titel, en niet in het blad: het
         onderste kwart is van de titel, en een band die daar niet komt hoort
         niet halverwege het hele blad te hangen maar halverwege de ruimte die
         hij heeft. Anders staat er honderd punten lucht boven en tweehonderd
         eronder, en dat leest als een beeld dat is weggezakt. */
      var ruimteBoven = 96, ruimteOnder = A4H - 230;
      var bandY = Math.max(ruimteBoven, ruimteBoven + (ruimteOnder - ruimteBoven - bandH) / 2);
      var kanKnippen = typeof d.clip === 'function' && typeof d.discardPath === 'function';
      if (p.b > A4W && kanKnippen) {
        d.saveGraphicsState();
        d.rect(0, bandY, A4W, bandH, null); d.clip(); d.discardPath();
        d.addImage(beeld.data, 'JPEG', (A4W - p.b) / 2, bandY + (bandH - p.h) / 2, p.b, p.h, undefined, 'FAST');
        d.restoreGraphicsState();
      } else {
        d.addImage(beeld.data, 'JPEG', (A4W - p.b) / 2, bandY, p.b, p.h, undefined, 'FAST');
      }
      d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.7);
      var lijnB = Math.min(p.b, A4W), lijnX = (A4W - lijnB) / 2;
      d.line(lijnX, bandY, lijnX + lijnB, bandY);
      d.line(lijnX, bandY + bandH, lijnX + lijnB, bandY + bandH);
      /* Een verloop naar de titel toe, maar alleen als het beeld daar ook komt.
         jsPDF kent geen verloop, dus twintig banen met oplopende dekking doen
         hetzelfde werk. Reikt de band niet tot de titel, dan is er niets om
         leesbaar te houden en zou het verloop een schaduw zijn zonder voorwerp. */
      if (bandY + bandH > A4H - 300) {
        for (var i = 0; i < 20; i++) {
          d.setFillColor(DONKER[0], DONKER[1], DONKER[2]);
          d.setGState(new d.GState({ opacity: 0.045 * (i + 1) }));
          d.rect(0, A4H - 300 + i * 15, A4W, 15, 'F');
        }
        d.setGState(new d.GState({ opacity: 1 }));
      }
    }
    d.setDrawColor(GOUD[0], GOUD[1], GOUD[2]); d.setLineWidth(0.8);
    d.line(M, A4H - 196, M + 46, A4H - 196);
    d.setFont(MONO, 'normal'); d.setFontSize(8);
    d.setTextColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]);
    d.text(String(nr).toUpperCase(), M, A4H - 172);
    d.setFont(SERIF, 'normal'); d.setFontSize(40);
    d.setTextColor(247, 244, 236);
    d.text(d.splitTextToSize(titel, A4W - 2 * M - 40), M, A4H - 128);
    if (onder) {
      d.setFont(BODY, 'normal'); d.setFontSize(10);
      d.setTextColor(186, 181, 168);
      d.text(d.splitTextToSize(onder, A4W - 2 * M - 90), M, A4H - 94);
    }
    this.donkerBlad = true;
    this.y = A4H;                    // dit blad is vol
  };

  /* Een heel blad met één beeld van rand tot rand en een korte tekst eronder.

     Anders dan hoofdstukBlad() kondigt dit niets aan: het is het beeld zelf
     dat het blad rechtvaardigt. De nachtopname is daar het voorbeeld van - een
     schip bij avond met het licht aan hoort groot, niet als strook tussen twee
     tabellen. */
  Bouwer.prototype.volbladBeeld = function (beeld, titel, tekst) {
    if (!beeld) return false;
    var d = this.d;
    this.nieuwBlad(true);
    d.setFillColor(DONKER[0], DONKER[1], DONKER[2]);
    d.rect(0, 0, A4W, A4H, 'F');
    /* Zo groot als het beeld scherp kan binnen de bovenste 72 procent van het
       blad. Een aanzicht is 2400 punten breed en vult dat vlak van rand tot
       rand; de nachtopname is 1200 breed en wordt een band met donker erboven
       en eronder. Uitrekken tot het vlak vol is zou de nachtopname op 62
       beeldpunten per duim zetten, en dat is precies het blad waar een koper
       het langst naar kijkt. */
    var vlakH = A4H * 0.72;
    var p = beeldMaat(beeld, A4W, vlakH, true);
    var bandH = Math.min(p.h, vlakH);
    /* Band en onderschrift als één blok, gecentreerd op het blad.

       Het beeld begon hier bovenaan en het onderschrift stond op 72 procent
       hoogte, want het beeld vulde die 72 procent altijd - het werd immers
       uitgerekt tot het paste. Nu een band zijn eigen hoogte houdt, zou dat
       blok bovenaan blijven kleven met een kwart blad donker eronder. Als blok
       gecentreerd staat het beeld midden op een donker blad met evenveel rust
       erboven als eronder, en dat is wat een volbladbeeld in een brochure
       hoort te zijn. */
    var d2 = this.d;
    d2.setFont(BODY, 'normal'); d2.setFontSize(9.4);
    var regels = tekst ? d2.splitTextToSize(tekst, A4W - 2 * M - 60) : [];
    var blokH = bandH + 46 + regels.length * 13 + 12;
    var bandY = Math.max(0, Math.min((A4H - blokH) / 2, A4H - VOET - 30 - blokH));
    var kanKnippen = typeof d.clip === 'function' && typeof d.discardPath === 'function';
    if (kanKnippen) {
      d.saveGraphicsState();
      d.rect(0, bandY, A4W, bandH, null); d.clip(); d.discardPath();
      d.addImage(beeld.data, 'JPEG', (A4W - p.b) / 2, bandY + (bandH - p.h) / 2, p.b, p.h, undefined, 'FAST');
      d.restoreGraphicsState();
    } else {
      d.addImage(beeld.data, 'JPEG', (A4W - p.b) / 2, bandY, p.b, p.h, undefined, 'FAST');
    }
    if (bandH < vlakH - 4) {
      d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.7);
      var lb = Math.min(p.b, A4W), lx = (A4W - lb) / 2;
      d.line(lx, bandY, lx + lb, bandY);
      d.line(lx, bandY + bandH, lx + lb, bandY + bandH);
    }
    /* Het bijschrift staat onder het beeld en niet op een vaste hoogte: bij een
       band die het vlak niet vult zou een vaste hoogte een gat laten waar niets
       staat, en dat leest als een vergeten regel. */
    var y = bandY + bandH + 46;
    d.setDrawColor(GOUD[0], GOUD[1], GOUD[2]); d.setLineWidth(0.8);
    d.line(M, y - 26, M + 46, y - 26);
    d.setFont(SERIF, 'normal'); d.setFontSize(26);
    d.setTextColor(247, 244, 236);
    d.text(titel, M, y);
    if (tekst) {
      d.setFont(BODY, 'normal'); d.setFontSize(9.4);
      d.setTextColor(186, 181, 168);
      d.text(d.splitTextToSize(tekst, A4W - 2 * M - 60), M, y + 22);
    }
    this.donkerBlad = true;
    this.y = A4H;
    return true;
  };

  /* Een nieuw blad beginnen. `donker` slaat de ivoren ondergrond over, want
     een hoofdstukblad schildert zijn eigen achtergrond. */
  Bouwer.prototype.nieuwBlad = function (donker) {
    this.d.addPage();
    this.paginas++;
    if (!donker) {
      this.d.setFillColor(IVOOR[0], IVOOR[1], IVOOR[2]);
      this.d.rect(0, 0, A4W, A4H, 'F');
    }
    this.donkerBlad = !!donker;
    this.y = M + 26;
  };

  /* Beeld over de volle bladbreedte en zo hoog als het mag, met het bijschrift
     eronder. Anders dan beeldVol() begint dit altijd bovenaan een vers blad:
     een brochurebeeld dat halverwege een pagina begint is een illustratie,
     geen beeld. */
  Bouwer.prototype.beeldBlad = function (beeld, bijschrift, tekst) {
    if (!beeld) return false;
    var d = this.d;
    this.nieuwBlad();
    /* Onder de kopregel beginnen en niet op nul.

       Deze methode was tot nu toe niet in gebruik, en dat is te zien: hij zette
       het beeld op y=0 en de kop- en voetregelronde tekent daarna over elke
       pagina heen. De kopregel van de salon liep dus dwars over de foto en was
       op een lichte lucht onleesbaar. Het beeld begint nu waar de bladspiegel
       begint - de gouden haarlijn van de kopregel staat op M-12. */
    var top = M + 4;
    var p = beeldMaat(beeld, A4W, A4H * 0.62, false);
    var hoog = p.h;
    var kanKnippen = typeof d.clip === 'function' && typeof d.discardPath === 'function';
    if (kanKnippen) {
      d.saveGraphicsState();
      d.rect(0, top, A4W, hoog, null); d.clip(); d.discardPath();
      d.addImage(beeld.data, 'JPEG', (A4W - p.b) / 2, top, p.b, p.h, undefined, 'FAST');
      d.restoreGraphicsState();
    } else {
      d.addImage(beeld.data, 'JPEG', (A4W - p.b) / 2, top, p.b, p.h, undefined, 'FAST');
    }
    d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.8);
    d.line(0, top + hoog, A4W, top + hoog);
    this.y = top + hoog + 22;
    if (bijschrift) this.bijschrift(bijschrift, M, A4W - 2 * M);
    if (tekst) { this.y += 6; this.alinea(tekst, { maat: 10, regel: 15.5, breed: A4W - 2 * M - 80 }); }
    return true;
  };

  /* Cijfers als gezette tabel: label links, waarde rechts, een haarlijn ertussen.

     Dit vervangt de kaartenrasters. Een kaartje met een randje en afgeronde
     hoeken is een webonderdeel; in drukwerk is een tabel met een haarlijn
     rustiger, past er meer op een blad, en - dat is het echte punt - de
     waarden staan onder elkaar uitgelijnd zodat je ze kunt vergelijken.

     `rijen` is [[label, waarde], ...]; een lege waarde slaat de regel over,
     want een tabel met tien keer "Op aanvraag" is geen tabel. */
  Bouwer.prototype.tabel = function (rijen, o) {
    o = o || {};
    var d = this.d;
    var lijst = rijen.filter(function (r) { return r && r[1] !== null && r[1] !== undefined && r[1] !== ''; });
    if (!lijst.length) return;
    var kolommen = o.kolommen || 1;
    var gut = 26;
    var kb = (A4W - 2 * M - (kolommen - 1) * gut) / kolommen;
    /* Ruimer dan een schermtabel. Op een blad van A4 met twee kolommen van
       acht regels vult 19 punt maar de helft van de bladspiegel; 25 punt geeft
       lucht tussen de regels én een blad dat afgemaakt oogt. */
    var rh = o.rijhoogte || 25;
    var perKolom = Math.ceil(lijst.length / kolommen);
    this.zorg(perKolom * rh + 10);
    var start = this.y;
    for (var i = 0; i < lijst.length; i++) {
      var k = Math.floor(i / perKolom), r = i % perKolom;
      var x = M + k * (kb + gut);
      var y = start + r * rh;
      d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]); d.setLineWidth(0.5);
      d.line(x, y + rh - 5, x + kb, y + rh - 5);
      d.setFont(MONO, 'normal'); d.setFontSize(6.6);
      d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
      var etiket = String(lijst[i][0]).toUpperCase();
      d.text(etiket, x, y + 7);
      var etiketW = d.getTextWidth(etiket);
      d.setFont(BODY, o.vet === false ? 'normal' : 'bold'); d.setFontSize(o.maat || 11);
      d.setTextColor(INKT[0], INKT[1], INKT[2]);
      var w = String(lijst[i][1]);
      /* De waarde staat rechts en het label links; ze mogen elkaar niet raken.
         "Twee dieselmotoren, standaard vermogen" liep dwars over het woord
         AANDRIJVING heen, want er werd alleen tegen de kolombreedte gemeten en
         niet tegen de ruimte die het label al inneemt. Eerst krimpen, en als
         dat niet genoeg is: afbreken met een beletselteken. Een waarde die
         over zijn eigen label heen valt is onleesbaar; een afgekorte niet. */
      var vrij = kb - etiketW - 10;
      while (d.getTextWidth(w) > vrij && d.getFontSize() > 7) d.setFontSize(d.getFontSize() - 0.4);
      if (d.getTextWidth(w) > vrij) {
        while (w.length > 4 && d.getTextWidth(w + '\u2026') > vrij) w = w.slice(0, -1);
        w += '\u2026';
      }
      d.text(w, x + kb, y + 7, { align: 'right' });
    }
    this.y = start + perKolom * rh + 8;
  };

  /* Een inhoudsopgave. Tien bladen zonder wegwijzer is een stapel papier;
     met een inhoud is het een document. De paginanummers worden pas aan het
     eind ingevuld, want tot dan weten we ze niet - vandaar dat dit blad
     gereserveerd wordt en later beschreven. */
  Bouwer.prototype.inhoudsblad = function (m, regel) {
    var d = this.d;
    this.nieuwBlad();
    d.setFont(MONO, 'normal'); d.setFontSize(7.5);
    d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
    d.text(T('INHOUD').toUpperCase(), M, this.y);
    d.setFont(SERIF, 'normal'); d.setFontSize(30);
    d.setTextColor(INKT[0], INKT[1], INKT[2]);
    d.text(m.l, M, this.y + 36);
    d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.9);
    d.line(M, this.y + 48, M + 84, this.y + 48);
    this.y += 74;
    if (regel) {
      d.setFont(SERIF, 'italic'); d.setFontSize(14);
      d.setTextColor(INKT[0], INKT[1], INKT[2]);
      var rr = d.splitTextToSize(regel, A4W - 2 * M - 70);
      d.text(rr, M, this.y);
      this.y += rr.length * 20 + 22;
    }
    this.inhoudY = this.y;           // hier komen de regels straks
    this.inhoudBlad = this.paginas;
    this.y = A4H;                    // dit blad is verder gereserveerd
  };
  /* De inhoudsregels invullen, als alle bladen geteld zijn. */
  Bouwer.prototype.vulInhoud = function (items, voet) {
    var d = this.d;
    d.setPage(this.inhoudBlad);
    var y = this.inhoudY;
    var nr = 0;
    for (var i = 0; i < items.length; i++) {
      var isHoofdstuk = items[i][2];
      if (isHoofdstuk) {
        nr++;
        if (i > 0) y += 8;
        d.setFont(MONO, 'normal'); d.setFontSize(7);
        d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
        d.text(('0' + nr).slice(-2), M, y);
        d.setFont(BODY, 'bold'); d.setFontSize(11);
        d.setTextColor(INKT[0], INKT[1], INKT[2]);
        d.text(items[i][0], M + 30, y);
        d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]); d.setLineWidth(0.5);
        d.line(M, y + 8, A4W - M, y + 8);
      } else {
        d.setFont(BODY, 'normal'); d.setFontSize(9.6);
        d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
        d.text(items[i][0], M + 30, y);
      }
      d.setFont(MONO, 'normal'); d.setFontSize(8.5);
      d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
      d.text(String(items[i][1]), A4W - M, y, { align: 'right' });
      y += isHoofdstuk ? 24 : 18;
    }
    /* Onder de inhoud: wat dit document is en van wie het komt. Een
       inhoudsopgave met een halve bladzijde wit eronder oogt als een blad dat
       niet af is; deze twee blokken horen er hoe dan ook in te staan en
       hebben nergens anders een betere plek. */
    if (!voet) return;
    y = Math.max(y + 30, A4H - VOET - 150);
    d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.8);
    d.line(M, y - 22, M + 46, y - 22);
    d.setFont(MONO, 'normal'); d.setFontSize(6.8);
    d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
    d.text(T('OVER DIT DOSSIER').toUpperCase(), M, y);
    d.setFont(BODY, 'normal'); d.setFontSize(9);
    d.setTextColor(INKT[0], INKT[1], INKT[2]);
    d.text(d.splitTextToSize(voet.over, A4W - 2 * M - 150), M, y + 18);
    var kx = A4W - M - 150;
    d.setFont(MONO, 'normal'); d.setFontSize(6.8);
    d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
    d.text(T('SAMENGESTELD').toUpperCase(), kx, y);
    d.setFont(BODY, 'normal'); d.setFontSize(9);
    d.setTextColor(INKT[0], INKT[1], INKT[2]);
    d.text(voet.regels, kx, y + 18);
  };

  /* QR als vectorvlakjes */
  function tekenQr(doc, tekst, x, y, maat) {
    if (typeof global.qrcode !== 'function') return false;
    var qr = global.qrcode(0, 'M');
    qr.addData(tekst); qr.make();
    var n = qr.getModuleCount(), cel = maat / n;
    doc.setFillColor(INKT[0], INKT[1], INKT[2]);
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (qr.isDark(r, c)) doc.rect(x + c * cel, y + r * cel, cel + 0.15, cel + 0.15, 'F');
    }
    return true;
  }

  function kopEnVoet(doc, totaal, meta) {
    for (var p = 2; p <= totaal; p++) {
      doc.setPage(p);
      doc.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); doc.setLineWidth(0.6);
      doc.line(M, M - 12, A4W - M, M - 12);
      doc.setFont(MONO, 'normal'); doc.setFontSize(6.6);
      doc.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
      doc.text(meta.modelNaam.toUpperCase() + '  ·  UW PERSOONLIJKE JACHTCONFIGURATIE', M, M - 20);
      doc.text(meta.nummer, A4W - M, M - 20, { align: 'right' });
      doc.line(M, A4H - 38, A4W - M, A4H - 38);
      doc.text(meta.werf.naam.toUpperCase() + '  ·  ' + meta.werf.web, M, A4H - 26);
      doc.text('Pagina ' + p + ' van ' + totaal, A4W - M, A4H - 26, { align: 'right' });
    }
  }

  /* invloed van opties op comfort, gewicht, bereik of bemanning — vaste,
     eerlijke omschrijvingen naast de verkooptekst */
  var OPTIE_INVLOED = {
    stabilisatoren: 'Comfort: groot effect voor anker en op zee. Gewicht en energieverbruik nemen toe.',
    boegschroef: 'Manoeuvreren: zijwaarts aanleggen zonder hulp. Verwaarloosbaar effect op vaart en bereik.',
    tenderkraan: 'Gewicht bovendeks; vraagt dekruimte én een extra dekbemanningslid bij het tewaterlaten.',
    jacuzzi: 'Gevuld circa een ton hoog in het schip: stabilisatoren sterk aanbevolen.',
    zwembad: 'Meerdere tonnen water op het achterdek; vrije-vloeistofeffect op de stabiliteit. Werf beoordeelt plaatsing en vulbeleid op zee.',
    zonnepanelen: 'Minder generatordraaiuren; stiller voor anker. Geen bemanningseffect.',
    watermaker: 'Autonomie: drinkwater op zee. Onderhoud valt binnen de bestaande bezetting.',
    airco: 'Comfort benedendeks; hoger energieverbruik, zwaardere generator.',
    zwemplateau: 'Toegang tot het water en de bijboot; hydrauliek vraagt periodiek onderhoud.',
    onderwaterlicht: 'Sfeer bij avond; verwaarloosbaar verbruik.',
    satelliet: 'Verbinding buiten kustbereik; abonnementskosten via de werf.'
  };

  /* ---------- het dossier ---------- */
  function genereer(st, D, meta) {
    var m = vind(D.modellen, st.model);
    var romp = vind(D.rompkleuren, st.rompkleur);
    var opb = vind(D.opbouw, st.opbouw);
    var dek = vind(D.dekken, st.dek);
    var dekAf = vind(D.dekafwerking, st.dekafwerking);
    var hout = vind(D.interieurhout, st.interieurhout);
    var stof = vind(D.stoffering, st.stoffering);
    /* De vijf afwerkingen die de salon- en badkamerbijschriften noemen. Ze
       stonden hier niet, want tot nu toe noemde het dossier ze alleen in de
       materiaalstaat - en die haalt zijn eigen labels op. */
    var vloer = vind(D.vloer, st.vloer);
    var wand = vind(D.wandafwerking, st.wandafwerking);
    var marmer = vind(D.marmer, st.marmer);
    var metaal = vind(D.metaal, st.metaal);
    var motor = vind(D.motorisering, st.motorisering);
    var profiel = global.NGJachtProfiel.bereken(st, D);
    var crew = global.NGJachtBemanning.bereken(st, D);
    var nummer = confignummer(st, meta.code);

    return imageResolver(st, D).laad().then(function (beeld) {
      var jsPDF = global.jspdf && global.jspdf.jsPDF;
      if (!jsPDF) throw new Error('jsPDF is niet geladen.');
      var doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
      /* Alle tekst van de PDF loopt vanaf hier door de taallaag: zie
         pdfVertalen() in jacht-taal.js. Zonder Engelse pagina verandert er
         niets, want dan geeft de vertaalfunctie het Nederlands terug. */
      if (global.NGTaal && global.NGTaal.pdfVertalen) global.NGTaal.pdfVertalen(doc);
      var d = doc;
      /* Datum en tijd volgen de taal van de pagina. Ze stonden hard op nl-NL,
         waardoor een Engelse klant een Engelstalige offerte kreeg met "21
         augustus 2026" erin. De taallaag weet welke taal de pagina spreekt;
         daar leiden we de locale uit af. Komt er een taal bij waarvoor hier
         geen regel staat, dan valt hij terug op en-GB - internationaal
         begrijpelijk, in tegenstelling tot Nederlands. */
      var LOCALES = { nl: 'nl-NL', en: 'en-GB', it: 'it-IT', de: 'de-DE',
                      tr: 'tr-TR', fr: 'fr-FR', es: 'es-ES', ar: 'ar-AE' };
      var taalcode = (global.NGTaal && global.NGTaal.taal && global.NGTaal.taal()) || 'nl';
      var locale = LOCALES[taalcode] || 'en-GB';
      var datum = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      var tijd = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

      /* ===== voorblad: donker, beeld van rand tot rand, gouden kader ===== */
      d.setFillColor(DONKER[0], DONKER[1], DONKER[2]);
      d.rect(0, 0, A4W, A4H, 'F');
      d.setFont(MONO, 'normal'); d.setFontSize(9);
      d.setTextColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]);
      d.text('N E X T   G R O W T H', A4W / 2, 66, { align: 'center' });
      d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.7);
      d.line(A4W / 2 - 42, 78, A4W / 2 + 42, 78);
      d.setFontSize(7);
      d.setTextColor(148, 148, 148);
      d.text('UW PERSOONLIJKE JACHTCONFIGURATIE', A4W / 2, 102, { align: 'center' });

      /* Het schip over de volle bladbreedte, in zijn eigen verhouding.

         Hier stond een uitsnede van 1,75 op 1 die op 595 bij 340 werd gezet.
         Die uitsnede hield 910 van de 1200 beeldpunten over en kwam daarmee op
         110 per duim uit - op het ene blad dat een koper als eerste ziet. De
         render zelf is 2,3 op 1 en haalt op dezelfde breedte 145 per duim: geen
         uitsnede, geen vergroting, wel het hele schip.

         De band is daarmee lager dan het vlak van 340 dat er stond. De gouden
         lijnen erboven en eronder volgen mee, en de titel eronder houdt zijn
         plaats: die stond al ruim onder het beeld. */
      if (beeld.buiten) {
        var vp = beeldMaat(beeld.buiten, A4W, 340, false);
        var vy = 138 + (340 - vp.h) / 2;
        d.addImage(beeld.buiten.data, 'JPEG', (A4W - vp.b) / 2, vy, vp.b, vp.h, undefined, 'FAST');
        d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.8);
        var vx = (A4W - vp.b) / 2;
        d.line(vx, vy, vx + vp.b, vy); d.line(vx, vy + vp.h, vx + vp.b, vy + vp.h);
      }

      d.setFont(SERIF, 'normal'); d.setFontSize(46);
      d.setTextColor(WIT[0], WIT[1], WIT[2]);
      d.text(m.l, A4W / 2, 556, { align: 'center' });
      d.setFont(MONO, 'normal'); d.setFontSize(8.5);
      d.setTextColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]);
      var onderregel = [m.klasse, maat(m.loa), romp.l, 'opbouw ' + opb.l.toLowerCase()].join('  ·  ');
      d.text(onderregel.toUpperCase(), A4W / 2, 584, { align: 'center' });
      d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.7);
      d.line(A4W / 2 - 20, 604, A4W / 2 + 20, 604);

      d.setFont(MONO, 'normal'); d.setFontSize(7.5); d.setTextColor(120, 120, 120);
      d.text(nummer + '   ·   ' + datum, A4W / 2, 706, { align: 'center' });
      if (D.werf.demo) d.text('DEMONSTRATIECONFIGURATIE  ·  VOORBEELDMODEL', A4W / 2, 722, { align: 'center' });

      /* dubbele gouden kaderlijn over het geheel: het brochuregevoel */
      d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]);
      d.setLineWidth(0.9); d.rect(18, 18, A4W - 36, A4H - 36, 'D');
      d.setLineWidth(0.4); d.rect(24, 24, A4W - 48, A4H - 48, 'D');

      /* ===== de bladen na het voorblad =====
         De Bouwer begon met een breek() en het eerste hoofdstukblad begint zelf
         ook een nieuw blad: dat leverde een leeg blad 2 op. De Bouwer telt het
         voorblad nu als blad 1 en wacht op wie er als eerste iets wil
         neerzetten. */
      var b = new Bouwer(doc);
      /* Blad 2 is de inhoud. Hij wordt hier gereserveerd en pas aan het eind
         beschreven: de bladnummers van de hoofdstukken zijn nu nog niet
         bekend. Tien tot twintig bladen zonder wegwijzer is een stapel
         papier; met een inhoud is het een document. */
      b.inhoudsblad(m, m.omschrijving);

      /* Secties die niets te melden hebben verschijnen niet, dus vaste
         nummers zouden gaten laten (02 naar 05). De teller loopt daarom mee
         met wat er werkelijk in het dossier komt. */
      var sectieNr = 0;
      var volgKop = function (naam, titel, minRuimte) {
        sectieNr++;
        b.kop(('0' + sectieNr).slice(-2) + '  ·  ' + naam, titel, minRuimte);
      };

      /* — in één oogopslag: de werfwaarden die bekend zijn, plus alles wat
         de klant zelf gekozen heeft en dus per definitie vaststaat.

         Twee tabellen naast elkaar in plaats van achttien kaartjes: links wat
         het schip is, rechts wat de koper gekozen heeft. Dat onderscheid was
         in één raster niet te zien, en het is precies het onderscheid dat
         ertoe doet - het ene komt van de werf, het andere van hem. — */
      b.hoofdstukBlad(T('Het schip'), m.l,
        [m.klasse, maat(m.loa), romp.l].join('  ·  '), beeld.detailA || beeld.buiten,
        T('Het schip'));
      b.nieuwBlad();
      volgKop('Overzicht', 'Je jacht in één oogopslag');
      /* Het goedgekeurde zijaanzicht van deze exacte samenstelling. Het stond
         alleen op het voorblad, en daar als uitsnede: de lezer had het schip
         waar dit hele document over gaat nog nergens in zijn geheel gezien.
         Hier staat het, boven de maten die erbij horen. */
      b.beeld(beeld.buiten, 230, beeld.buitenIsHero
        ? 'zijaanzicht: catalogusuitvoering; van deze kleurcombinatie bestaat nog geen render'
        : 'zijaanzicht van je samenstelling: ' + romp.l.toLowerCase() + ' met ' +
          opb.l.toLowerCase() + ', ' + dek.l.toLowerCase());
      var kaarten = [];
      var duw = function (waarde, label) { if (waarde !== null) kaarten.push([label, waarde]); };
      duw(maat(m.loa), 'Lengte over alles');
      duw(maat(m.breedte), 'Breedte');
      duw(maat(m.diepgang, 2), 'Diepgang');
      duw(m.dekkenAantal === null ? null : fmt(m.dekkenAantal), 'Dekken');
      duw(m.gasten === null ? null : fmt(m.gasten), 'Gasten');
      duw(m.slaapgasten === null ? null : fmt(m.slaapgasten), 'Slaapgasten');
      duw(m.hutten === null ? null : fmt(m.hutten), 'Hutten');
      duw(m.badkamers === null ? null : fmt(m.badkamers), 'Badkamers');
      if (crew.beschikbaar) duw(fmt(crew.aanbevolen), 'Bemanning (aanbevolen)');
      if (!profiel.geweigerd) {
        duw(fmt(profiel.kruis) + ' kn', 'Kruissnelheid');
        duw(fmt(profiel.top) + ' kn', 'Topsnelheid');
        duw(fmt(Math.round(profiel.afstand)) + ' nm', 'Bereik');
      }
      var werfKaarten = kaarten.length;
      duw(romp.l, 'Rompkleur');
      duw(opb.l, 'Opbouwkleur');
      duw(dekAf.l, 'Dekafwerking');
      duw(dek.l, 'Bovenbouw');
      duw(motor.l, 'Aandrijving');
      duw(hout.l, 'Interieurhout');
      duw(stof.l, 'Stoffering');
      duw(st.opties.length ? fmt(st.opties.length) : 'Geen', 'Gekozen opties');
      if (!profiel.geweigerd) b.demoLabel();
      /* De werfwaarden en de eigen keuzes gescheiden: `werfKaarten` telde al
         waar de grens lag, die wordt hier gebruikt in plaats van weggegooid. */
      b.label(T('Het schip'));
      b.tabel(kaarten.slice(0, werfKaarten), { kolommen: 2 });
      b.y += 10;
      b.label(T('Jouw keuzes'));
      b.tabel(kaarten.slice(werfKaarten), { kolommen: 2 });
      b.citaat(m.omschrijving);
      if (werfKaarten < 6) {
        b.luxeBlok('Aanvullende werfspecificaties worden tijdens het adviesgesprek vastgesteld.');
      }

      /* — exterieur: de hero-render staat al op het voorblad; hier opent een
         detailuitsnede van diezelfde render — een ander beeld, hetzelfde
         schip — gevolgd door de materiaalkeuzes, royaal uitgevoerd — */
      /* Beeld en stalen horen bij elkaar op hetzelfde blad: kop() reserveert
         daarom de hoogte van allebei voordat hij begint. Een vers blad
         forceren doet dat ook, maar laat dan de onderste helft leeg. */
      volgKop('Exterieur', 'Jouw gekozen uitvoering', 290 + 150);
      b.beeldVol(beeld.detailB || beeld.detailA, 290, 'detail van je samenstelling, exact de gekozen combinatie');
      b.materiaalKaarten([
        [romp.verf, 'Rompkleur  ·  ' + romp.l, romp.noot || ''],
        [opb.verf || romp.verf, 'Opbouw  ·  ' + opb.l, opb.noot || ''],
        [dekAf.kleur, 'Dekafwerking  ·  ' + dekAf.l, dekAf.noot || '']
      ]);
      b.alinea('Dek en bovenbouw: ' + dek.l + (dek.noot ? ', ' + dek.noot : '.'), { maat: 9.3 });

      /* Hetzelfde schip bij avond, met het licht aan. Een heel blad, donker,
         beeld van rand tot rand - het klassieke brochureblad, en het lag
         klaar zonder dat het dossier er iets mee deed.

         Met de mededeling erbij die overal geldt: de nachtopname bestaat
         alleen in de catalogusuitvoering. Zonder die zin leest een nachtblauwe
         romp op dit blad als de gekozen kleur, en die is hij niet
         noodzakelijk. */
      if (beeld.nacht) {
        b.volbladBeeld(beeld.nacht, T('Bij avond'),
          T('De nachtopname toont de catalogusuitvoering: nachtblauw met parelwitte opbouw. ') +
          T('Je eigen romp- en opbouwkleur staat op het exterieurblad hiervoor.'));
      }

      var interieurStalen = [
        [hout.kleur, 'Interieurhout  ·  ' + hout.l, hout.noot || ''],
        [stof.kleur, 'Stoffering  ·  ' + stof.l, stof.noot || '']
      ];
      if (beeld.interieur) {
        /* De salon is het beeld waar een koper in dit segment het langst naar
           kijkt, en hij stond hier als plaatje van een derde blad met een
           randje eromheen. Nu opent hij een hoofdstuk over de volle
           bladbreedte, en staan de twee keuzes die hij werkelijk volgt
           eronder. */
        /* Het hoofdstukblad toont een ruimte aan boord en niet de salon: die
           staat op het blad erna, en twee keer hetzelfde beeld achter elkaar
           leest als een fout in de opmaak. Is er geen ruimte-impressie, dan
           mag de salon het hoofdstuk wel openen - dan is er ook geen
           herhaling. */
        var opener = (beeld.ruimten && beeld.ruimten.length)
          ? beeld.ruimten[0].beeld : beeld.interieur;
        b.hoofdstukBlad(T('Aan boord'), T('Jouw interieurconcept'),
          hout.l + '  ·  ' + stof.l, opener);
        b.nieuwBlad();
        volgKop('Interieur', 'Jouw interieurconcept',
          b.beeldHoogte(beeld.interieur, 400) + 110);
        b.beeld(beeld.interieur, 400,
          'interieurimpressie: exact ' + hout.l.toLowerCase() + ' met ' + stof.l.toLowerCase());
        b.staalRij(interieurStalen);
      } else {
        /* geen render van deze combinatie: een compacte materiaalcompositie
           bij het exterieur, met de belofte die de werf waarmaakt */
        b.label('Materiaalconcept');
        b.materiaalKaarten(interieurStalen);
        b.alinea('Materiaalconcept: interieurimpressie volgt van de werf.', { maat: 8.4, kleur: GRIJS });
      }

      /* — de materiaalstaat: alle zeven interieurkeuzes als staal naast elkaar.
           Hij staat direct onder de salon, want daar komt de vraag op die hij
           beantwoordt: het beeld hierboven volgt hout en stoffering, en de
           koper wil weten waar zijn vloer, zijn marmer en zijn licht zijn
           gebleven. Hier staan ze, met de naam erbij, op het blad dat mee de
           werf in gaat. — */
      if (beeld.materiaal) {
        /* De materiaalstaat hoort onder de salon en op hetzelfde blad.

           Dat is geen opmaakvoorkeur maar de volgorde van de vraag: het beeld
           erboven volgt hout en stoffering, en de eerste gedachte van de lezer
           is "en mijn vloer dan, en mijn marmer?". Het antwoord hoort in beeld
           te staan zonder een blad om te slaan.

           Het past ook: de salonrender is 1200 bij 520, dus op bladbreedte
           niet hoger dan een kwart blad. Met de staalkaart eronder is het blad
           vol in plaats van halfleeg. */
        /* De materiaalkamers, vóór de staalkaart.

           Een staal zegt wát een materiaal is; een kamer zegt wat het doet.
           Wie tussen wengé en essen twijfelt wil geen twee lapjes hout maar
           twee salons - en dat geldt op papier net zo goed als op het scherm.
           De staalkaart blijft eronder staan, want die is het enige dat alle
           zeven keuzes tegelijk toont, ook wanneer een combinatie nog niet
           gerenderd is. */
        if (beeld.salon) {
          b.beeldBlad(beeld.salon,
            'je salon: ' + [hout.l, stof.l, vloer.l, wand.l].join(' · ').toLowerCase(),
            T('Deze vier keuzes volgt de opname werkelijk: het hout, de stoffering, de ') +
            T('vloer en de wandafwerking. Het is dezelfde ruimte in elke uitvoering, zodat ') +
            T('twee samenstellingen naast elkaar te leggen zijn.'));
        }
        if (beeld.bad) {
          b.beeld(beeld.bad, 300,
            'je badkamer: ' + marmer.l.toLowerCase() + ' met ' + metaal.l.toLowerCase());
        }

        volgKop('Materialen', 'Materiaalstaat van het interieur',
          b.beeldHoogte(beeld.materiaal, 300));
        b.beeld(beeld.materiaal, 300,
          'materiaalstaat: de gouden stip staat bij de keuzes die op een opname in dit ' +
          'dossier te zien zijn; de overige staan hier als materiaal en niet als beeld');
      }

      /* — de overige ruimtes aan boord, twee naast elkaar — */
      if (beeld.ruimten && beeld.ruimten.length) {
        /* Een rij van twee ruimtes is 220 hoog; onder de kop moet er minstens
           één rij passen, anders staat de kop alleen. */
        volgKop('Ruimtes', 'Ruimtes aan boord', 260);
        b.alinea('Naast de salon hierboven telt dit model de volgende ruimtes. De salon volgt je ' +
          'keuze van hout en stoffering exact; de ruimtes hieronder tonen de catalogusafwerking.',
          { maat: 9.3, kleur: GRIJS });
        b.beeldPaar(beeld.ruimten);
        /* De volledige lijst onder de beelden. Van dertien ruimtes passen er
           niet dertien op een blad, en wie het dossier doorbladert wil kunnen
           nagaan wat dit schip nu eigenlijk heeft. Het vult bovendien de staart
           van dit hoofdstuk, waar anders een halve bladzijde wit stond. */
        var alleRuimten = (global.NGJachtBeelden && global.NGJachtBeelden.ruimten)
          ? (global.NGJachtBeelden.ruimten(m.loa) || []) : [];
        if (alleRuimten.length) {
          b.y += 6;
          b.label(T('Alle ruimtes op dit model'));
          b.tabel(alleRuimten.map(function (r) { return [r.l, r.uit]; }),
                  { kolommen: 1, maat: 8.6, vet: false, rijhoogte: 21 });
        }
      }

      /* — indeling: de gerenderde aanzichten. De schematische maattekening is
           hier weg: naast een fotorealistische render leest een blokkenschema
           als een fout, en de maten staan al in de tabel op blad 01. — */
      if (beeld.bovenFoto || beeld.voorFoto || beeld.achterFoto || beeld.dekplan) {
        b.hoofdstukBlad(T('Indeling'), T('Dekken en indeling'),
          (m.dekkenAantal ? m.dekkenAantal + ' ' +
            T(m.dekkenAantal === 1 ? 'dek' : 'dekken') + '  ·  ' : '') + dek.l,
          beeld.detailA || beeld.achterFoto || beeld.bovenFoto);
        b.nieuwBlad();
        /* De echte hoogte van het eerste beeld, niet een geschat getal. */
        volgKop('Indeling', 'Dekken en indeling',
          b.beeldHoogte(beeld.dekplan, 660) ||
          b.beeldHoogte(beeld.bovenFoto, 250) || 200);

        /* Van boven-, voor- en achteraanzicht bestaat één render per model, en
           die toont onvermijdelijk één dekvorm. Wijkt die af van wat de klant
           gekozen heeft, dan staat dat in het bijschrift. Een dossier dat een
           ander dek toont dan de samenstelling ernaast noemt is erger dan een
           dossier met een voorbehoud: dit stuk gaat mee naar de prijsopgave.

           Bij de Sport Coupé 16 en de Flybridge 19 speelt dat al bij de
           standaardkeuze. Welke dekvorm er op welke render staat is nagekeken
           op de beelden zelf en staat in jacht-beelden.js. */
        var afwijkend = '';
        var beeldbank = global.NGJachtBeelden;
        if (beeldbank && beeldbank.aanzichtDek) {
          /* Het bijschrift staat onder alle drie de aanzichten, dus de
             waarschuwing geldt zodra er voor één van de drie geen eigen render
             is. 'voor' is daarvoor de maat: die en 'achter' worden samen
             geleverd, en het bovenaanzicht hangt aan dezelfde levering. */
          var getoond = beeldbank.aanzichtDek(st.model, st.dek, 'voor');
          var dGetoond = getoond ? vind(D.dekken, getoond) : null;
          var dGekozen = vind(D.dekken, st.dek);
          if (dGetoond && dGekozen && getoond !== st.dek) {
            afwijkend = ', let op: dit is de ' + dGetoond.l.toLowerCase() +
                        ', niet de gekozen ' + dGekozen.l.toLowerCase();
          }
        }

        /* Het dekplan voorop in dit hoofdstuk. De aanzichten eronder laten zien
           hoe het schip eruitziet; dit laat zien hoe het is ingedeeld, en dat
           is het blad waar een koper in dit segment het langst naar kijkt. Het
           volgt zijn eigen verhouding: bij een schip met twee dekken is dat een
           halve pagina, bij de Giga 120 met zeven dekken bijna een hele. */
        /* Deze telling hoort bij het dekplan en niet als staartje onder het
           achteraanzicht: het gaat over de indeling en niet over hoe het schip
           er van achteren uitziet. */
        var ind = [];
        if (m.hutten !== null) ind.push([fmt(m.hutten), 'Hutten']);
        if (m.badkamers !== null) ind.push([fmt(m.badkamers), 'Badkamers']);
        if (m.bemanningHutten !== null) ind.push([fmt(m.bemanningHutten), 'Bemanningshutten']);
        if (m.dekkenAantal !== null) ind.push([fmt(m.dekkenAantal), 'Dekken']);

        if (beeld.dekplan) {
          /* Zo groot als er ruimte is: dit is de tekening waar een koper in dit
             segment het langst naar kijkt, en hij gaat mee de werf in. */
          b.beeld(beeld.dekplan, 660,
            'dekplan: indeling per dek, uit de maten van dit model en je gekozen opties; ' +
            'de werf bepaalt de werkelijke indeling');
        }
        if (ind.length) b.tabel(ind.map(function (r) { return [r[1], r[0]]; }), { kolommen: 2 });
        /* De drie aanzichten op 212 punten: dan passen ze samen op één blad.
           Op 300 paste de derde er net niet meer bij en kwam het achteraanzicht
           in zijn eentje op een vers blad terecht, met tweederde wit eronder.
           Drie aanzichten onder elkaar op één blad is bovendien hoe je ze wilt
           lezen - je vergelijkt boeg, spiegel en dek in één oogopslag. */
        if (beeld.bovenFoto) {
          /* vind() geeft hier null bij een onbekende waarde, dus niet zomaar
             doorpakken op .l — een dossier hoort niet te klappen op een bijschrift */
          var dekaf = vind(D.dekafwerking, st.dekafwerking);
          /* Van rand tot rand. Een 16:9-beeld is op de bladspiegel altijd 276
             punten hoog; over de volle bladbreedte wordt datzelfde beeld 335.
             Dat is een vijfde meer blad gevuld met precies hetzelfde beeld, en
             van rand tot rand is bovendien hoe een brochure een dekindeling
             laat zien. */
          b.beeldVol(beeld.bovenFoto, 335, T('bovenaanzicht') + '  ·  ' + T('dekindeling') +
            (dekaf ? T(' met ') + dekaf.l.toLowerCase() : T(' van de catalogusuitvoering')) + afwijkend);
        }
        /* Boeg en spiegel elk als volblad.

           Ze zijn allebei een studio-opname op donkere grond, en als strook op
           een crème blad staan ze zwak; als heel blad staan ze sterk. Het
           bovenaanzicht blijft wel bij het dekplan staan: dat is geen
           sfeerbeeld maar een tekening van de dekindeling, en die twee hoor je
           naast elkaar te lezen.

           Dat ze de rompkleur niet volgen moet er met zoveel woorden bij: de
           romp heeft daar de cataloguskleur en niet de gekozen kleur, en zonder
           die zin leest het als een fout in het dossier. De dekvorm volgen ze
           wél zodra daar een render voor is; tot die tijd zegt `afwijkend`
           erbij welke dekvorm er dan staat. */
        if (beeld.voorFoto) {
          b.volbladBeeld(beeld.voorFoto, T('Van voren'),
            T('Boegvorm en dekopbouw. ') +
            T('De rompkleur is hier de catalogusuitvoering en niet je gekozen kleur.') +
            (afwijkend || ''));
        }
        /* Het achteraanzicht als volblad, en niet als derde strook.

           De drie aanzichten zijn 16:9. Op bladbreedte worden ze daarmee altijd
           276 punten hoog, wat de verhouding ook is die je vraagt - drie passen
           dus nooit op één blad, en de derde kwam in zijn eentje op een vers
           blad terecht met tweederde wit eronder.

           Deze drie is bovendien een studio-opname op donkere grond: als heel
           blad staat hij sterker dan als strook, en het blad is vol. */
        if (beeld.achterFoto) {
          b.volbladBeeld(beeld.achterFoto, T('Van achteren'),
            T('Spiegel, zwemplateau en achterdekken. ') +
            T('De rompkleur is hier de catalogusuitvoering en niet je gekozen kleur.') +
            (afwijkend || ''));
        }
      }

      /* — motorisering. Opent het technische deel, dus met een hoofdstukblad:
         hiervoor gaat het over hoe het schip eruitziet, hierna over wat het
         doet. — */
      b.hoofdstukBlad(T('Techniek'), T('Motorisering en prestaties'),
        motor.l, beeld.detailB || beeld.buiten);
      b.nieuwBlad();
      volgKop('Aandrijving', 'Motorisering en prestaties', profiel.geweigerd ? 60 : 90);
      b.alinea(motor.l + '. ' + motor.omschrijving, { maat: 10, regel: 14 });
      if (!profiel.geweigerd) {
        b.demoLabel();
        b.tabel([
          ['Motoren', fmt(profiel.aantalMotoren)],
          ['Totaal vermogen', fmt(profiel.vermogen) + ' kW'],
          ['Kruissnelheid', fmt(profiel.kruis) + ' kn'],
          ['Topsnelheid', fmt(profiel.top) + ' kn'],
          ['Economische snelheid', fmt(profiel.vZuinig, 1) + ' kn'],
          ['Bereik op kruissnelheid', fmt(Math.round(profiel.afstand)) + ' nm'],
          ['Bereik economisch', fmt(Math.round(profiel.afstandZuinig)) + ' nm'],
          ['Verbruik kruissnelheid', inhoud(Math.round(profiel.verbruik)) + '/u'],
          ['Brandstofcapaciteit', inhoud(m.tank)]
        ], { kolommen: 2 });
        /* In stukken door de vertaling. Deze zin stond als één geheel in de
           code met het vaarregime en de rompsnelheid erin gevlochten, en een
           zin met getallen erin staat nooit in een woordenboek: hij bleef als
           enige Nederlands op de Engelse en de Duitse pagina. De vaste delen
           zijn nu wel op te zoeken; het regime is bij de bron al vertaald. */
        b.alinea(T('Waarom deze aandrijving past: het schip vaart in het ') + profiel.regime +
          T(' regime bij een rompsnelheid van ') + fmt(profiel.vRomp, 1) + ' kn. ' +
          T('Het bereik rekent met 90% bruikbare tankinhoud; 10% blijft als reserve buiten de som.'),
          { maat: 8.6, kleur: GRIJS });
      } else {
        b.luxeBlok('De prestatieberekening voor dit model wordt door de werf opgesteld zodra de definitieve specificaties en proefvaartcijfers vaststaan.');
      }

      /* — opties: nette kaarten, alleen wat gekozen is — */
      if (st.opties && st.opties.length) {
        volgKop('Uitrusting', 'Jouw geselecteerde opties', 200);

        /* Elke gekozen optie met zijn eigen render ernaast.

           Dit was een raster van tekstkaartjes met een gouden medaillon en het
           beginletter erin. Er ligt van elke optie een render klaar, in de
           maatklasse van dit schip, en dat is nu juist waar een koper naar wil
           kijken als hij voor een half miljoen aan opties heeft aangevinkt.
           Het medaillon was een plaatsvervanger voor een beeld dat er wél is.

           Beeld links, tekst rechts, één optie per rij: dat leest als een
           brochure en het vult het blad, in plaats van twee smalle kaartjes
           met wit eronder. */
        var beeldW = 200, gut = 16;
        var tekstX = M + beeldW + gut;
        var tekstW = A4W - M - tekstX;
        st.opties.forEach(function (ov) {
          var o = vind(D.opties, ov);
          if (!o) return;
          var ob = (beeld.opties || []).filter(function (x) { return x.v === ov; })[0];
          var bh = ob ? Math.min(beeldW * ob.beeld.h / ob.beeld.w, 130) : 0;

          d.setFont(BODY, 'normal'); d.setFontSize(9);
          var uitR = d.splitTextToSize(o.uit, tekstW);
          var invloed = OPTIE_INVLOED[ov] ? d.splitTextToSize(OPTIE_INVLOED[ov], tekstW) : [];
          var tekstH = 26 + uitR.length * 12 + (invloed.length ? invloed.length * 11 + 8 : 0);
          var rijH = Math.max(bh, tekstH) + 18;
          b.zorg(rijH);

          if (ob) {
            d.addImage(ob.beeld.data, 'JPEG', M, b.y, beeldW, bh, undefined, 'FAST');
            d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]); d.setLineWidth(0.6);
            d.rect(M, b.y, beeldW, bh, 'D');
          }

          var prijsTekst = null;
          if (D.prijzenActief && D.prijzen.opties[ov]) {
            var pob = D.postPrijs(D.prijzen.opties[ov], D.prijzen.modellen[st.model] || 0, m.loa);
            if (pob > 0) prijsTekst = euro(pob);
          }
          d.setFont(SERIF, 'normal'); d.setFontSize(16);
          d.setTextColor(INKT[0], INKT[1], INKT[2]);
          d.text(d.splitTextToSize(o.l, tekstW - (prijsTekst ? 70 : 0))[0], tekstX, b.y + 14);
          if (prijsTekst) {
            d.setFont(MONO, 'normal'); d.setFontSize(8);
            d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
            d.text(prijsTekst, A4W - M, b.y + 14, { align: 'right' });
          }
          d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.7);
          d.line(tekstX, b.y + 22, tekstX + 34, b.y + 22);
          d.setFont(BODY, 'normal'); d.setFontSize(9);
          d.setTextColor(INKT[0], INKT[1], INKT[2]);
          d.text(uitR, tekstX, b.y + 38);
          if (invloed.length) {
            d.setFontSize(8); d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
            d.text(invloed, tekstX, b.y + 38 + uitR.length * 12 + 8);
          }
          b.y += rijH;
        });
      }

      /* het volledige vaarprofiel; herbruikbaar omdat het zowel als eigen
         sectie als binnen de gecombineerde sectie kan verschijnen */
      var vaarprofielInhoud = function () {
        var hoogten = global.NGJachtAanzichten ? global.NGJachtAanzichten.hoogten(m, st.dek) : null;
        b.demoLabel();
        b.label('Snelheid en bereik');
        b.tabel([
          ['Vaarregime', profiel.regime],
          ['Rompsnelheid', fmt(profiel.vRomp, 1) + ' kn'],
          ['Bereik', fmt(Math.round(profiel.afstand)) + ' nm']
        ], { kolommen: 2 });
        b.label('Papieren en ligplaats');
        b.tabel([
          ['Vaarbewijs', profiel.bewijs],
          ['Ligplaatsmaat', profiel.box && profiel.box.lengte ? maat(profiel.box.lengte) + ' × ' + maat(profiel.box.breedte) : 'Op aanvraag'],
          ['Doorvaarthoogte', hoogten ? maat(hoogten.airdraft) : 'Op aanvraag']
        ], { kolommen: 2 });
        b.alinea(profiel.bewijsUit, { maat: 8.8 });
        var adviezen = (profiel.letOp || []).slice();
        if (st.opties.indexOf('stabilisatoren') < 0 && m.loa >= 20) adviezen.push('Overweeg zero-speed stabilisatoren: de meest gekozen comfortoptie in dit segment.');
        if (st.opties.indexOf('watermaker') < 0 && m.loa >= 20) adviezen.push('Voor tochten langer dan een week van de haven is een watermaker vrijwel onmisbaar.');
        if (adviezen.length) {
          b.label('Adviezen bij deze samenstelling');
          adviezen.forEach(function (r) { b.alinea('•  ' + r, { maat: 8.4, kleur: GRIJS, na: 3 }); });
        }
      };

      /* een tweede detailuitsnede als visuele adempauze tussen de uitrusting
         en het tekstrijkere bemanningsdeel — weer exact hetzelfde schip */
      /* Een beeld over de volle breedte als adempauze tussen de uitrusting en
         het tekstrijkere bemanningsdeel — weer exact hetzelfde schip. */
      b.beeldVol(beeld.detailA, 200, 'je samenstelling in detail, exact de gekozen combinatie');

      if (crew.beschikbaar) {
        /* — bemanning: visueel en narekenbaar — */
        volgKop('Bemanning', 'Bemanning en verblijfscapaciteit', 150);
        b.tabel([
          ['Gasten', fmt(m.gasten)],
          ['Minimum crew', fmt(crew.min)],
          ['Aanbevolen crew', fmt(crew.aanbevolen)],
          ['Crewcapaciteit', fmt(crew.max)]
        ], { kolommen: 2 });
        /* de som van de aanbeveling, zichtbaar gemaakt */
        var som = crew.opbouw.map(function (t) { return t.n + ' ' + t.label; }).join('  +  ') +
                  '   =   ' + crew.aanbevolen + ' aanbevolen';
        b.label('Opbouw van de aanbeveling');
        b.alinea(som, { font: MONO, maat: 9, na: 10 });
        if (crew.functies.length) {
          b.alinea('Functies aan boord bij deze bezetting: ' + crew.functies.join(', ') + '.', { maat: 9.3 });
        }
        b.alinea((crew.professioneel
          ? 'Voor deze configuratie wordt professioneel bemande exploitatie aanbevolen. '
          : 'Deze configuratie leent zich voor varen zonder vaste professionele bemanning. ') +
          crew.zelfstandig.uitleg, { maat: 9.3 });
        crew.redenen.forEach(function (r) { b.alinea('•  ' + r, { maat: 8.4, kleur: GRIJS, na: 3 }); });
        /* kort houden; de volledige juridische tekst staat op de laatste pagina */
        b.alinea('Indicatie op basis van je configuratie; de definitieve eisen stelt de werf vast met vlagstaat en klassenbureau.',
          { maat: 7.6, kleur: GRIJS, regel: 10.5 });

        /* — vaarprofiel V-01, in categorieën — */
        volgKop('Vaarprofiel V-01', 'Jouw persoonlijke vaarprofiel', profiel.geweigerd ? 60 : 130);
        if (!profiel.geweigerd) {
          vaarprofielInhoud();
        } else {
          b.luxeBlok('Het vaarprofiel voor dit model wordt opgesteld zodra de werf de definitieve specificaties heeft vastgesteld.' +
            (m.loa >= 40 ? ' Vanaf 40 meter gelden bovendien certificerings- en bemanningsregels die buiten dit demonstratieprofiel vallen.' : ''));
        }
      } else {
        /* zonder ingevoerde bemanningswaarden zou een eigen bemanningssectie
           vrijwel leeg zijn; dan schuiven bemanning en vaarprofiel ineen */
        volgKop('Bemanning · Vaarprofiel V-01', 'Bemanning en vaarprofiel', 60);
        if (profiel.geweigerd) {
          b.luxeBlok('De bemanningsindicatie en het vaarprofiel voor dit model worden tijdens het adviesgesprek met de werf vastgesteld.' +
            (m.loa >= 40 ? ' Vanaf 40 meter gelden bovendien certificerings- en bemanningsregels die buiten dit demonstratieprofiel vallen.' : ''));
        } else {
          b.luxeBlok('De bemanningsindicatie voor dit model wordt tijdens het adviesgesprek met de werf vastgesteld.');
          vaarprofielInhoud();
        }
      }

      /* — prijs: commercieel bruikbaar, met of zonder bedragen — */
      volgKop('Investering', 'Prijsopbouw', 100);
      if (D.prijzenActief) {
        /* Dezelfde rekensom als de configurator, uit hetzelfde punt: anders
           kan het dossier een ander bedrag tonen dan het scherm. */
        var pr = D.prijsVan(st, D);
        /* Op naam en niet op plaats in de rij. Deze vier regels telden de
           posten op hun nummer op, en toen het interieur van twee keuzes naar
           zeven ging schoof de motorisering van plaats 7 naar plaats 12: het
           dossier zette toen de prijs van de vloer achter de naam van de
           motor. Een optelling die stilzwijgend verschuift zodra er een keuze
           bijkomt hoort niet in een document dat naar een prijsopgave gaat. */
        var somVan = function (namen) {
          var t = 0;
          pr.posten.forEach(function (x) { if (namen.indexOf(x.l) > -1) t += x.bedrag; });
          return t;
        };
        var regels = [
          ['Basisprijs ' + m.l, pr.basis],
          ['Motorisering  ·  ' + motor.l, somVan(['Motorisering'])],
          ['Exterieur  ·  romp, opbouw, dek',
            somVan(['Rompkleur', 'Opbouwkleur', 'Dek en bovenbouw', 'Dekafwerking'])],
          ['Interieur  ·  hout, stoffering en afwerking',
            somVan(['Interieurhout', 'Stoffering', 'Vloer', 'Wandafwerking',
                    'Marmer', 'Metaalafwerking', 'Verlichting'])]
        ];
        var optSom = pr.optieSom;
        regels.push(['Opties (' + st.opties.length + ')', optSom]);
        var som = 0;
        b.zorg(regels.length * 17 + 70);
        regels.forEach(function (r) {
          som += r[1];
          d.setFont(BODY, 'normal'); d.setFontSize(9.5);
          d.setTextColor(INKT[0], INKT[1], INKT[2]);
          d.text(r[0], M, b.y);
          d.setFont(MONO, 'normal');
          d.text(r[1] > 0 ? euro(r[1]) : 'inbegrepen', A4W - M, b.y, { align: 'right' });
          b.y += 17;
        });
        d.setDrawColor(INKT[0], INKT[1], INKT[2]); d.line(M, b.y, A4W - M, b.y); b.y += 15;
        d.setFont(BODY, 'bold'); d.setFontSize(11.5);
        d.text('Indicatieve totaalprijs excl. btw', M, b.y);
        d.setFont(MONO, 'normal'); d.text(euro(som), A4W - M, b.y, { align: 'right' }); b.y += 15;
        d.setFont(BODY, 'normal'); d.setFontSize(8.4); d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
        d.text('Inclusief ' + Math.round(D.btw * 100) + '% btw: ' + euro(som * (1 + D.btw)) + ' (particuliere levering Nederland).', M, b.y);
        b.y += 18;
      } else {
        /* zonder bedragen: de gekozen uitvoering benoemen en de weg wijzen */
        b.label('Jouw gekozen uitvoering');
        var uitvoering = [m.l + ', ' + romp.l.toLowerCase() + ' met ' + opb.l.toLowerCase() + ' opbouw',
          dek.l, hout.l + ' met ' + stof.l.toLowerCase(), motor.l];
        if (st.opties.length) uitvoering.push(st.opties.length + ' gekozen optie' + (st.opties.length > 1 ? 's' : '') + ', waaronder ' +
          st.opties.slice(0, 3).map(function (v) { return vind(D.opties, v).l.toLowerCase(); }).join(', '));
        uitvoering.forEach(function (r) { b.alinea('•  ' + r, { maat: 9.3, na: 3 }); });
        b.y += 4;
        b.luxeBlok('Prijs op aanvraag. De definitieve prijs wordt door de werf vastgesteld op basis van technische specificaties, materiaalkeuzes, levering, belastingen en aanvullende maatwerkopdrachten.');
        b.alinea('Bespreek deze configuratie met een jachtspecialist: je samenstelling ligt volledig vast onder nummer ' + nummer + '.',
          { maat: 9.5, stijl: 'bold' });
      }

      /* — volgende stappen — */
      volgKop('Vervolg', 'Volgende stappen', 200);
      b.tabel([['Configuratienummer', nummer], ['Samengesteld op', datum + ', ' + tijd + ' uur']], { kolommen: 2 });

      /* donkere contactkaart: de brochure sluit in dezelfde toon als hij
         opent, met de QR-code op een wit vlak zodat elke scanner hem leest */
      b.zorg(168);
      var ky = b.y, kkh = 152;
      d.setFillColor(DONKER[0], DONKER[1], DONKER[2]);
      d.roundedRect(M, ky, A4W - 2 * M, kkh, 6, 6, 'F');
      d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.7);
      d.line(M + 18, ky + 26, M + 58, ky + 26);
      d.setFont(SERIF, 'normal'); d.setFontSize(14);
      d.setTextColor(IVOOR[0], IVOOR[1], IVOOR[2]);
      d.text('Bespreek deze configuratie met een jachtspecialist', M + 18, ky + 50);
      d.setFont(BODY, 'normal'); d.setFontSize(9);
      d.setTextColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]);
      d.text(D.werf.naam + '  ·  ' + D.werf.email + '  ·  ' + D.werf.telefoon, M + 18, ky + 72);
      d.setFont(MONO, 'normal'); d.setFontSize(6.4);
      d.setTextColor(150, 150, 150);
      var urlRegels = d.splitTextToSize(meta.url, A4W - 2 * M - 190);
      d.text(urlRegels, M + 18, ky + 94);
      /* de stille zone rond een QR-code is geen wit randje maar een eis:
         zonder ruime marge op het witte vlak leest een scanner hem niet */
      var qrOk = false;
      d.setFillColor(255, 255, 255);
      d.roundedRect(A4W - M - 148, ky + 10, 132, 132, 4, 4, 'F');
      qrOk = tekenQr(d, meta.url, A4W - M - 136, ky + 22, 108);
      if (qrOk) {
        d.setFont(BODY, 'normal'); d.setFontSize(8);
        d.setTextColor(IVOOR[0], IVOOR[1], IVOOR[2]);
        d.text('De QR-code opent exact deze samenstelling.', M + 18, ky + kkh - 18);
      }
      b.y = ky + kkh + 18;
      b.label('Het vervolg, stap voor stap');
      ['1.  Controle van je samenstelling en wensen',
       '2.  Werfgesprek over indeling, materialen en planning',
       '3.  Technische validatie door werf en klassenbureau',
       '4.  Offerte met definitieve prijsopbouw',
       '5.  Contract en bouw'].forEach(function (r) { b.alinea(r, { maat: 9, na: 2 }); });
      b.y += 6;
      b.label('Ruimte voor je opmerkingen');
      b.zorg(66);
      d.setDrawColor(KAART_RAND[0], KAART_RAND[1], KAART_RAND[2]);
      for (var l = 0; l < 3; l++) { d.line(M, b.y, A4W - M, b.y); b.y += 20; }

      /* — disclaimer: hier staat wél de volledige juridische tekst — */
      volgKop('Disclaimer', 'Goed om te weten', 120);
      D.disclaimers.dossier.forEach(function (r) { b.alinea('•  ' + r, { maat: 8.4, na: 4 }); });
      b.y += 4;
      b.alinea(D.disclaimers.bemanning, { maat: 7.6, kleur: GRIJS, regel: 10.5 });

      /* Het slotblad sluit af met wie dit gemaakt heeft en waar de lezer
         terechtkan. Een document dat eindigt met kleine lettertjes en dan
         een halve bladzijde wit laat de lezer met een voorbehoud achter; met
         een adres eronder laat het hem achter met een gesprekspartner. */
      b.y = Math.max(b.y + 26, A4H - VOET - 132);
      d.setDrawColor(GOUD_LICHT[0], GOUD_LICHT[1], GOUD_LICHT[2]); d.setLineWidth(0.8);
      d.line(M, b.y - 22, A4W - M, b.y - 22);
      d.setFont(SERIF, 'normal'); d.setFontSize(20);
      d.setTextColor(INKT[0], INKT[1], INKT[2]);
      d.text(D.werf.naam, M, b.y + 4);
      d.setFont(BODY, 'normal'); d.setFontSize(9.4);
      d.setTextColor(GRIJS[0], GRIJS[1], GRIJS[2]);
      d.text(d.splitTextToSize(
        T('Dit dossier is samengesteld met de jachtconfigurator. Vragen over deze ' +
          'samenstelling, of klaar voor een gesprek over de bouw? Neem gerust contact op; ' +
          'houd het configuratienummer bij de hand, dan hebben we exact dit schip voor ons.'),
        A4W - 2 * M - 170), M, b.y + 26);
      var cx = A4W - M - 160;
      d.setFont(MONO, 'normal'); d.setFontSize(6.8);
      d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
      d.text(T('CONTACT').toUpperCase(), cx, b.y + 4);
      d.setFont(BODY, 'normal'); d.setFontSize(9.4);
      d.setTextColor(INKT[0], INKT[1], INKT[2]);
      d.text([D.werf.email, D.werf.telefoon || '', D.werf.web || ''].filter(Boolean),
             cx, b.y + 22);
      d.setFont(MONO, 'normal'); d.setFontSize(7.6);
      d.setTextColor(GOUD[0], GOUD[1], GOUD[2]);
      d.text(nummer, cx, b.y + 66);

      /* De inhoudsopgave als laatste invullen: nu pas staat vast op welk blad
         elk hoofdstuk begint. */
      /* Een sectie die net zo heet als het hoofdstuk waar hij in staat, hoeft
         er niet twee keer onder elkaar te staan: "Motorisering en prestaties"
         als hoofdstuk en er direct onder nog eens als sectie leest als een
         fout in de opmaak. */
      var laatsteHoofdstuk = '';
      b.vulInhoud((b.hoofdstukken || []).filter(function (h) {
        if (h.hoofdstuk) { laatsteHoofdstuk = h.titel; return true; }
        return h.titel !== laatsteHoofdstuk;
      }).map(function (h) { return [h.titel, h.pagina, h.hoofdstuk]; }), {
        over: T('Dit dossier legt één samenstelling vast: dit model, deze kleuren, dit ' +
                'interieur en deze opties, met de maten en de berekeningen die erbij ' +
                'horen. Het configuratienummer hieronder opent exact deze samenstelling ' +
                'opnieuw, ook over een jaar.'),
        regels: [nummer, datum + ', ' + tijd, D.werf.naam, D.werf.email]
      });

      /* b.paginas telt vanaf het voorblad mee en is dus al het totaal */
      kopEnVoet(doc, b.paginas, { modelNaam: m.l, nummer: nummer, werf: D.werf });

      /* ook de bestandsnaam volgt de taal van de pagina */
      var voorvoegsel = (global.NGTaal ? global.NGTaal.T('Jachtdossier') : 'Jachtdossier');
      var bestand = 'Next-Growth-' + slug(voorvoegsel) + '-' + slug(m.l) + '-' + nummer + '.pdf';
      return { doc: doc, bestand: bestand, nummer: nummer, paginas: b.paginas };
    });
  }

  /* ---------- download met laadtoestand ---------- */
  var bezig = false;
  function download(st, D, meta, klaarCb) {
    if (bezig) return Promise.resolve(null);
    bezig = true;
    var overlay = global.document.createElement('div');
    overlay.setAttribute('role', 'status');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:grid;place-items:center;' +
      'background:rgba(10,12,16,.82);color:#EDE8DC;font:500 15px/1.5 system-ui,sans-serif;text-align:center';
    overlay.innerHTML = '<div><div style="width:34px;height:34px;border:2px solid rgba(255,196,0,.25);' +
      'border-top-color:#FFC400;border-radius:50%;margin:0 auto 14px;animation:ngdraai 1s linear infinite"></div>' +
      'Je persoonlijke jachtdossier wordt samengesteld…</div>' +
      '<style>@keyframes ngdraai{to{transform:rotate(360deg)}}</style>';
    global.document.body.appendChild(overlay);

    return genereer(st, D, meta).then(function (r) {
      r.doc.save(r.bestand);
      return r;
    }).catch(function (fout) {
      global.alert('Het dossier kon niet worden samengesteld: ' + fout.message +
        '\nProbeer het opnieuw; blijft dit gebeuren, meld het ons dan via ' + D.werf.email + '.');
      if (typeof console !== 'undefined') console.error('[jachtdossier-pdf]', fout);
      return null;
    }).finally(function () {
      bezig = false;
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (klaarCb) klaarCb();
    });
  }

  global.NGJachtPDF = { genereer: genereer, download: download, confignummer: confignummer, imageResolver: imageResolver };
})(typeof window !== 'undefined' ? window : globalThis);
