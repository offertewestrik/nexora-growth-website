/* De configurator zelf: paneel, doek, tabbladen, prijsbalk en dossier.
 *
 * Deze code stond inline in jacht-configurator.html. Dat kon zolang er
 * één pagina was, maar de Engelse uitvoering draait op precies dezelfde
 * logica - en dezelfde logica twee keer onderhouden is dezelfde logica
 * langzaam uit elkaar laten lopen. Beide pagina's laden nu dit bestand.
 *
 * Alle zichtbare tekst loopt via T() uit jacht-taal.js, dat de taal leest
 * uit het lang-attribuut van de pagina. Staat er geen vertaling, dan komt
 * de Nederlandse tekst terug - nooit een lege plek.
 */
  (function () {
    'use strict';
    var D = window.NGJachtData;
    /* Eerst de taal, dan pas iets tekenen: de taallaag zet de labels en
       omschrijvingen in de gegevens om naar de taal van de pagina, zodat
       elke module hieronder vanzelf de juiste taal toont. */
    if (window.NGTaal) window.NGTaal.pasToe(D, window.NGJachtBeelden);
    var T = (window.NGTaal && window.NGTaal.T) || function (z) { return z; };

    if (!D) return;

    var esc = function (s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    };
    /* Getallen, maten en bedragen komen uit één plek. Deze twee schreven het
       zelf uit - met een vaste komma en een vast euroteken - en dat is precies
       wat een bezoeker die in voeten en dollars denkt buitensluit. */
    var E = window.NGEenheden;
    var f1 = function (x) { return E ? E.getal(x, 1) : (Math.round(x * 10) / 10).toString().replace('.', ','); };
    var euro = function (n) { return E ? E.geld(n) : '€ ' + Math.round(n); };

    function eerste(lijst) {
      for (var i = 0; i < lijst.length; i++) if (lijst[i].def) return lijst[i].v;
      return lijst[0].v;
    }
    function vind(lijst, v) {
      for (var i = 0; i < lijst.length; i++) if (lijst[i].v === v) return lijst[i];
      return lijst[0];
    }

    var st = {
      model: eerste(D.modellen),
      rompkleur: eerste(D.rompkleuren),
      opbouw: eerste(D.opbouw),
      dek: null,
      dekafwerking: eerste(D.dekafwerking),
      interieurhout: eerste(D.interieurhout),
      stoffering: eerste(D.stoffering),
      /* De vijf afwerkingen die de salonrender niet volgt. Ze staan hier
         gelijkwaardig aan hout en stoffering, want in de gesprekken die op
         een dossier volgen gaat het net zo goed over de badkamer als over
         het houtfineer. Wat de render niet toont, toont de materiaalstaat. */
      vloer: eerste(D.vloer),
      wandafwerking: eerste(D.wandafwerking),
      marmer: eerste(D.marmer),
      metaal: eerste(D.metaal),
      verlichting: eerste(D.verlichting),
      motorisering: eerste(D.motorisering),
      opties: [],
      nacht: false
    };

    /* Niet elk dektype past op elk model: een dagjacht van 16 meter krijgt
       geen flybridge. De modeltabel bepaalt wat er te kiezen valt, en na een
       modelwissel wordt een ongeldige keuze automatisch rechtgezet. */
    function dekkenVoorModel() {
      var m = vind(D.modellen, st.model);
      return D.dekken.filter(function (d) { return m.dekken.indexOf(d.v) > -1; });
    }
    /* Het eerste dek uit de modeltabel wint, niet het dek dat in de dekkenlijst
       als standaard staat. Die laatste is een algemene voorkeur; de modeltabel
       zegt wat de werf voor dít schip als uitgangspunt ziet — een Sport Coupé
       16 hoort open te openen, niet met een hardtop.

       Het is bovendien dezelfde regel die de renderopdracht gebruikt: fase 1
       is per model het eerste dek in nachtblauw. Liepen die twee uiteen, dan
       kon de eerste render die de werf aanlevert nooit op het openingsscherm
       terechtkomen, en dat gebeurde ook. */
    function borgDek() {
      var mag = dekkenVoorModel();
      for (var i = 0; i < mag.length; i++) if (mag[i].v === st.dek) return;
      var m = vind(D.modellen, st.model);
      st.dek = m.dekken[0] || mag[0].v;
    }
    /* Sommige opties gelden pas vanaf een bepaalde lengte. Wie een zwembad
       koos op de Elite 90 en daarna terugstapt naar de SC 16, mag die keuze
       niet meeslepen: hij verdwijnt dan uit het paneel maar zou wél in de
       prijs, de samenvatting en het dossier blijven staan. Deze bewaker haalt
       hem weg — ook bij een gedeelde link, want die zet dezelfde toestand. */
    function borgOpties() {
      var loa = vind(D.modellen, st.model).loa;
      st.opties = st.opties.filter(function (v) {
        var o = vind(D.opties, v);
        return o && (!o.vanaf || loa >= o.vanaf);
      });
    }
    borgDek();
    borgOpties();

    /* ---------- keuzepaneel ----------
       Elke keuze is een tegel met beeld, zoals bij de aanbouw en de
       dakopbouw. De miniatuur komt uit dezelfde beeldbank als het grote
       doek en volgt dezelfde regel: exact deze combinatie of niets. Is er
       geen render, dan toont de tegel een kleurstaal — nooit een render van
       een andere combinatie, want dan denkt de koper dat hij dát krijgt. */

    function kloon(basis, anders) {
      var k = {}, s;
      for (s in basis) k[s] = basis[s];
      for (s in anders) k[s] = anders[s];
      return k;
    }
    function mini(anders) {
      if (!window.NGJachtBeelden) return null;
      return window.NGJachtBeelden.buiten(
        kloon({ model: st.model, dek: st.dek, rompkleur: st.rompkleur, opbouw: st.opbouw }, anders || {}));
    }
    /* De tegels tonen een miniatuur van een paar centimeter; daarvoor de
       volledige render van 1200 px laden is zonde van de mobiele data.
       klein() wijst naar de kleine variant uit de beeldbank. */
    function klein(src) {
      return (window.NGJachtBeelden && window.NGJachtBeelden.mini) ? window.NGJachtBeelden.mini(src) : src;
    }
    function miniHtml(src) { return '<span class="kz__mini" style="background-image:url(\'' + klein(src) + '\')"></span>'; }
    function swHtml(kleur) { return '<span class="kz__sw" style="background:' + esc(kleur) + '"></span>'; }

    function tegel(groep, item, actief, beeld, sub) {
      /* role="radio" vraagt aria-checked; aria-pressed hoort bij een toggle en
         wordt op een radio genegeerd, waardoor een schermlezer niet meldt wat
         er gekozen is. De losse opties verderop zijn wel echte toggles en
         houden daarom aria-pressed. */
      return '<button type="button" class="kz__knop" role="radio" aria-checked="' + (actief ? 'true' : 'false') + '"' +
        ' data-groep="' + groep + '" data-waarde="' + esc(item.v) + '">' + (beeld || '') +
        '<span class="kz__tekst"><b>' + esc(item.l) + '</b>' +
        (sub ? '<em>' + esc(sub) + '</em>' : '') + '</span></button>';
    }
    function kzWrap(inhoud, klas, titel) {
      return '<div class="kz' + (klas ? ' ' + klas : '') + '" role="radiogroup" aria-label="' + esc(titel) + '">' + inhoud + '</div>';
    }
    function groepKop(nr, titel) {
      return '<h3>' + (nr ? '<b>' + nr + '.</b> ' : '') + esc(titel) + '</h3>';
    }
    function nootVan(lijst, waarde) {
      var i = vind(lijst, waarde);
      return i && i.noot ? '<p class="groep__noot">' + esc(i.noot) + '</p>' : '';
    }

    /* Het modelbeeld is het catalogusbeeld: het eerste dek in nachtblauw met
       witte opbouw — de render die per model als eerste gemaakt wordt.
       Ontbreekt die (alleen de Tri-deck 29 nog), dan tekent het silhouet de
       miniatuur, zodat er nooit een leeg vak staat. */
    function modelMini(m) {
      var src = window.NGJachtBeelden &&
        window.NGJachtBeelden.buiten({ model: m.v, dek: m.dekken[0], rompkleur: 'nachtblauw', opbouw: 'wit' });
      if (src) return miniHtml(src);
      /* Geen render van deze kleurcombinatie: dan de modelopname, niet een
         getekend silhouetje. Van alle tien de modellen ligt er een. */
      return miniHtml('./assets/media/jacht/hero/' + m.v + '.webp');
    }

    /* Elke groep tekent zichzelf, zodat een klik alleen de groepen ververst
       die er werkelijk anders uit gaan zien. Het oude paneel herbouwde bij
       elke klik alles; dan verspringt de lijst onder de muis en is de
       bezoeker zijn plek kwijt. */
    /* De vijf interieurafwerkingen delen precies dezelfde vorm: vier keuzes,
       een kleurstaal, een noot eronder. Vijf keer dezelfde functie uitschrijven
       zou vijf plekken maken waar hij uit elkaar kan gaan lopen. */
    function afwerkingGroep(groep, nummer, kop) {
      return function () {
        return groepKop(nummer, T(kop)) + kzWrap(D[groep].map(function (x) {
          /* De macro-opname van het materiaal zelf, net als bij de
             dekafwerking. Travertijn en wollen tapijt zijn allebei zandkleurig:
             als kleurstaal zijn ze niet uit elkaar te houden, als opname wel.
             Staat de opname er nog niet, dan blijft de kleurstaal staan. */
          var src = window.NGJachtBeelden && window.NGJachtBeelden.los &&
                    window.NGJachtBeelden.los('materiaal', groep + '-' + x.v);
          return tegel(groep, x, x.v === st[groep], src ? miniHtml(src) : swHtml(x.kleur));
        }).join(''), 'kz--drie', T(kop)) + nootVan(D[groep], st[groep]);
      };
    }

    var GROEPEN = {
      start: function () {
        return groepKop('', T('Begin hier')) + '<div class="kz kz--een">' +
          D.startpunten.map(function (s) {
            var src = window.NGJachtBeelden && window.NGJachtBeelden.los('startpunt', s.v);
            return '<button type="button" class="kz__knop kz__knop--start" data-groep="startpunt" data-waarde="' + esc(s.v) + '">' +
              (src ? '<span class="kz__smini" style="background-image:url(\'' + klein(src) + '\')"></span>' : '') +
              '<span class="kz__tekst"><b>' + esc(s.l) + '</b><em>' + esc(s.uit) + '</em></span></button>';
          }).join('') + '</div>';
      },
      model: function () {
        var m = vind(D.modellen, st.model);
        return groepKop('1', T('Model')) + kzWrap(D.modellen.map(function (x) {
          return tegel('model', x, x.v === st.model, modelMini(x),
                       (E ? E.lengte(x.loa) : f1(x.loa) + ' m') + ' · ' + x.klasse);
        }).join(''), '', T('Model')) +
        '<p class="groep__noot">' + esc(m.omschrijving) + '</p>';
      },
      rompkleur: function () {
        return groepKop('2', T('Rompkleur')) + kzWrap(D.rompkleuren.map(function (k) {
          var src = mini({ rompkleur: k.v });
          return tegel('rompkleur', k, k.v === st.rompkleur, src ? miniHtml(src) : swHtml(k.verf));
        }).join(''), '', T('Rompkleur')) + nootVan(D.rompkleuren, st.rompkleur);
      },
      opbouw: function () {
        var romp = vind(D.rompkleuren, st.rompkleur);
        return groepKop('3', T('Opbouw')) + kzWrap(D.opbouw.map(function (o) {
          var src = mini({ opbouw: o.v });
          return tegel('opbouw', o, o.v === st.opbouw, src ? miniHtml(src) : swHtml(o.verf || romp.verf));
        }).join(''), 'kz--drie', T('Opbouw')) + nootVan(D.opbouw, st.opbouw);
      },
      dek: function () {
        var m = vind(D.modellen, st.model);
        return groepKop('4', T('Dek en bovenbouw')) + kzWrap(dekkenVoorModel().map(function (d) {
          var src = mini({ dek: d.v });
          /* Zonder render tekent het silhouet de tegel: het dektype is nu
             net de keuze waarbij de vorm van het schip verandert, dus een
             tekening zegt hier meer dan een kleurstaal. Alleen niet bij een
             model zonder maten — dan valt er niets te tekenen. */
          /* Zonder render van deze dekvorm liever geen beeld dan een tekening:
             de tegel draagt zijn naam en zijn toelichting al. */
          var beeld = src ? miniHtml(src) : '';
          return tegel('dek', d, d.v === st.dek, beeld);
        }).join(''), '', T('Dek en bovenbouw')) + nootVan(D.dekken, st.dek);
      },
      dekafwerking: function () {
        return groepKop('5', T('Dekafwerking')) + kzWrap(D.dekafwerking.map(function (d) {
          /* de macrodetails van de dekafwerking zijn er nu: die zeggen meer
             dan een kleurstaal */
          var src = window.NGJachtBeelden && window.NGJachtBeelden.los('dek', d.v);
          return tegel('dekafwerking', d, d.v === st.dekafwerking, src ? miniHtml(src) : swHtml(d.kleur));
        }).join(''), 'kz--drie', T('Dekafwerking')) + nootVan(D.dekafwerking, st.dekafwerking);
      },
      interieurhout: function () {
        /* met de modelspecifieke salonrenders toont elke houttegel de echte
           salon van het gekozen model in dat hout, bij de huidige stoffering;
           de grote lijn heeft nog geen salonmaster en houdt de kleurstaal */
        return groepKop('6', T('Interieurhout')) + kzWrap(D.interieurhout.map(function (h) {
          var src = window.NGJachtBeelden && window.NGJachtBeelden.interieur &&
            window.NGJachtBeelden.interieur({ model: st.model, interieurhout: h.v, stoffering: st.stoffering });
          return tegel('interieurhout', h, h.v === st.interieurhout, src ? miniHtml(src) : swHtml(h.kleur));
        }).join(''), 'kz--drie', T('Interieurhout')) + nootVan(D.interieurhout, st.interieurhout);
      },
      stoffering: function () {
        return groepKop('7', T('Stoffering')) + kzWrap(D.stoffering.map(function (s) {
          var src = window.NGJachtBeelden && window.NGJachtBeelden.interieur &&
            window.NGJachtBeelden.interieur({ model: st.model, interieurhout: st.interieurhout, stoffering: s.v });
          return tegel('stoffering', s, s.v === st.stoffering, src ? miniHtml(src) : swHtml(s.kleur));
        }).join(''), '', T('Stoffering')) + nootVan(D.stoffering, st.stoffering);
      },
      /* De vijf afwerkingen die de salonrender niet volgt, in de volgorde
         waarin een werf ze op tafel legt: eerst waar je op loopt, dan waar je
         tegenaan kijkt, dan het licht. Ze krijgen een kleurstaal en geen
         miniatuur, want er is geen foto die ze toont - en een geleende foto
         die er ongeveer op lijkt is precies wat deze configurator nergens
         doet. Wat ze wel krijgen is een eigen blad: de materiaalstaat. */
      vloer:         afwerkingGroep('vloer', '8', 'Vloer'),
      wandafwerking: afwerkingGroep('wandafwerking', '9', 'Wandafwerking'),
      marmer:        afwerkingGroep('marmer', '10', 'Marmer badkamer'),
      metaal:        afwerkingGroep('metaal', '11', 'Metaalafwerking'),
      verlichting:   afwerkingGroep('verlichting', '12', 'Verlichting'),
      motorisering: function () {
        return groepKop('13', T('Motorisering')) + kzWrap(D.motorisering.map(function (mo) {
          return tegel('motorisering', mo, mo.v === st.motorisering, '', mo.omschrijving);
        }).join(''), 'kz--een', T('Motorisering')) + nootVan(D.motorisering, st.motorisering);
      },
      opties: function () {
        var loa = vind(D.modellen, st.model).loa;
        return groepKop('14', T('Opties')) + '<div class="kz kz--een">' +
          D.opties.filter(function (o) { return !o.vanaf || loa >= o.vanaf; }).map(function (o) {
            var aan = st.opties.indexOf(o.v) > -1;
            /* Elke optie heeft een eigen beeld, ook wat in de machinekamer
               staat: een smetteloze installatieruimte is in dit segment net zo
               goed een verkoopargument als het bovendek. En op maat van het
               gekozen schip, net als op het doek — een koper van een Giga 120
               kreeg op de knop nog de modelloze versie te zien en op het doek
               de zijne: twee formaten voor dezelfde optie, op hetzelfde
               scherm. */
            var src = window.NGJachtBeelden && window.NGJachtBeelden.optie(o.v, st.model);
            return '<button type="button" class="kz__knop kz__knop--optie" aria-pressed="' + (aan ? 'true' : 'false') +
              '" data-groep="opties" data-waarde="' + esc(o.v) + '">' +
              '<span class="kz__vink"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span>' +
              (src ? '<span class="kz__omini" style="background-image:url(\'' + klein(src) + '\')"></span>' : '') +
              '<span class="kz__tekst"><b>' + esc(o.l) + '</b><em>' + esc(o.uit) + '</em></span></button>';
          }).join('') + '</div>';
      }
    };
    var PANEEL_VOLGORDE = ['start', 'model', 'rompkleur', 'opbouw', 'dek',
                          'dekafwerking', 'interieurhout', 'stoffering',
                          'vloer', 'wandafwerking', 'marmer', 'metaal', 'verlichting',
                          'motorisering', 'opties'];

    function tekenPaneel() {
      document.getElementById('paneel').innerHTML = PANEEL_VOLGORDE.map(function (id) {
        return '<div class="groep" data-g="' + id + '">' + GROEPEN[id]() + '</div>';
      }).join('');
    }
    function herteken(ids) {
      ids.forEach(function (id) {
        var el = document.querySelector('#paneel .groep[data-g="' + id + '"]');
        if (el) el.innerHTML = GROEPEN[id]();
      });
    }

    /* ---------- doek, specs en samenvatting ---------- */
    var aanzicht = 'zij';
    /* Welke ruimte het interieurblad toont. 'salon' is de enige die uw keuze
       van hout en stoffering exact volgt; de overige ruimtes zijn impressies
       in de catalogusafwerking. Dit is kijkgedrag, geen samenstelling: het
       hoort dus niet in de deelbare code en niet in het dossier. */
    var ruimte = 'salon';
    /* Welke optie het doek toont zodra iemand er een aanvinkt. Net als de
       ruimtekeuze is dit kijkgedrag en geen samenstelling: het hoort niet in de
       deelbare code en niet in het dossier. */
    var optieToon = null;

    /* De draaibare 360-weergave: een echt 3D-model per jacht, met AI
       gereconstrueerd uit de catalogusrender plus drie bijpassende
       aanzichten (achter, boeg, boven). Het blijft een modelimpressie
       met een eerlijke toelichting: de rompkleur volgt de keuze van de
       koper, opbouw- en dekkleuren tonen de catalogusuitvoering. De
       viewer (Google model-viewer, zelf gehost) laadt pas bij de eerste
       klik op het tabblad. */
    var NG3D = {
      sc16: './assets/media/jacht/3d/sc16.glb', fb19: './assets/media/jacht/3d/fb19.glb',
      fb24: './assets/media/jacht/3d/fb24.glb', td29: './assets/media/jacht/3d/td29.glb',
      sy37: './assets/media/jacht/3d/sy37.glb', sport40: './assets/media/jacht/3d/sport40.glb',
      grand55: './assets/media/jacht/3d/grand55.glb', flagship70: './assets/media/jacht/3d/flagship70.glb',
      elite90: './assets/media/jacht/3d/elite90.glb', giga120: './assets/media/jacht/3d/giga120.glb'
    };
    /* Romp- en opbouwkleur worden niet opnieuw gegenereerd maar in de
       textuur omgekleurd: dezelfde geometrie, alleen de nachtblauwe
       romppixels en de witte opbouwpixels dragen de gekozen kleuren.
       Nachtblauw met witte opbouw zit al in het model gebakken en heeft
       geen los bestand. Mislukt het laden van een kleurtextuur, dan
       blijft de gebakken uitvoering staan. */
    /* Twee modellen hebben inmiddels iets beters dan het 3D-model: een echte
       360-graden opnameronde van zesendertig standen, opgebouwd uit
       studioclips op renderniveau. Waar die bestaat gaat hij vóór het
       GLB-model. De kleurwissel werkt met maskers die per opnameronde geijkt
       moeten worden; bij de FB 19 is die ijking nog niet rond, dus daar staat
       de ronde vast in nachtblauw met een eerlijke noot. */
    var NGSPIN = {
      /* Het aantal standen staat per model apart: de FB 19 heeft er
         tweeënzeventig - één per vijf graden - omdat tien graden per stand op
         een telefoon als doorbladeren leest in plaats van als draaien. */
      /* GEEN VAN DE RONDEN VERKLEURT MEE - EEN BEWUSTE KEUZE

         De ronde wordt niet in zes kleuren gerenderd; de romp werd op het
         moment zelf gemaskeerd en overgeschilderd. Dat is nagemeten met
         tools/jacht-rondom-kleurtoets.mjs en met het oog nagekeken op drie
         standen maal vijf kleuren, en het haalt de lat niet:

           het masker wordt op halve maat hard op nul of een gezet en met een
           vierkante kern verwijd; op de schuine scheer- en waterlijn gaf dat
           een blokkentrap van vier tot acht beeldpunten. Bij nachtblauw valt
           dat weg, bij parelwit leest het als een gescheurde rand.

         Een doezeling op vol formaat bracht de rafeling terug van 17,4 naar
         2,7 procent van de randlengte (zie schoon() in jacht-spin.js, die
         verbetering blijft staan). Maar wat daarna overbleef is niet met een
         randbewerking op te lossen: bij de SC 16 loopt het masker over de
         ramen, bij de FB 24 kruipt het onder de waterlijn door en zet daar een
         witte halo neer.

         Liever een ronde die klopt in een kleur dan zes kleuren waarvan er vijf
         rafelen. De noot onder de ronde zegt het eerlijk: de opname toont
         nachtblauw, uw eigen kleur staat onder Zijaanzicht - en daar klopt hij
         wel, want daar staat een echte render per kleur. */
      /* De SC 16 is opnieuw opgenomen: was zesendertig standen, is nu
         tweeenzeventig, en van dezelfde draaitafel als de rest.

         HET LABEL KLOPTE NIET  Er stond 'hardtop-uitvoering' onder, maar de
         oude ronde toonde al de open cockpit - en de nieuwe ook. Open cockpit
         is bovendien de standaardkeuze van dit model, dus het beeld klopte en
         het bijschrift niet. Nu andersom gezet.

         Lassen op 3,8 en 3,8 tegen 2,7 voor een gewone stap in beide helften;
         mediaan 6,1 over de hele ronde, de schoonste die we hebben. */
      sc16: { map: './assets/media/jacht/360/sc16/', kleurbaar: false, standen: 72,
              uitvoering: 'open cockpit' },
      /* De FB 19 is opnieuw opgenomen, van dezelfde draaitafel als de rest en
         vanaf een startbeeld uit zijn eigen oude ronde. Lassen op 3,9 en 4,1
         tegen 2,8 en 3,7 voor een gewone stap; mediaan 7,2.

         DE RONDE DRAAIDE DE VERKEERDE KANT OP  De opname liep vanaf de
         dwarsstand eerst langs de SPIEGEL, terwijl alle acht andere ronden
         eerst langs de BOEG lopen. Op zichzelf niet fout, maar wie van model
         wisselt en dezelfde sleepbeweging maakt ziet het schip dan ineens de
         andere kant op draaien. Daarom gebouwd met --achteruit vanaf beeld
         193. Nu geldt overal hetzelfde: stand 0 dwars met de boeg rechts,
         stand 18 recht op de boeg, stand 54 recht op de spiegel. */
      fb19: { map: './assets/media/jacht/360/fb19/', kleurbaar: false, standen: 72,
              uitvoering: 'hardtop met schuifdak' },
      /* De twee grote ronden komen van een draaitafel in een studio, niet van
         de zee. Dat is bewust: op een draaitafel staat het schip stil en draait
         alleen de camera, dus tussen twee standen verandert er niets behalve de
         hoek. Bij een varende opname deint het schip mee en dan schokt de ronde
         onder de vinger. De naadmaat laat dat zien - deze twee zitten op zes en
         acht, de eerste FB 19-poging zat op veertien. */
      /* DE GRAND 55 IS ALSNOG GOED GEKOMEN
         De eerste ronde van dit model was technisch de beste van de vier, maar
         het was een ander schip dan de render: geen strandclub, geen bad,
         rechte scheer in plaats van gebogen. Die stond daarom uit.

         Wat het opgelost heeft: het startbeeld niet meer uit een prompt laten
         komen maar uit de eigen render, met tools/jacht-draaitafel-startbeelden
         .py. De opname die daaruit volgde is wel dit schip - vier getrapte
         lagen, de gezwiepte donkere raamband in de romp, het bad achterop, het
         naamplaatje bij de boeg. De oude beelden in 360/grand55/ zijn
         overschreven.

         Lassen op 4,0 en 3,9 tegen 3,0 en 3,6 voor een gewone stap. */
      grand55:  { map: './assets/media/jacht/360/grand55/', kleurbaar: false, standen: 72,
                  uitvoering: 'flybridge-uitvoering' },
      giga120:  { map: './assets/media/jacht/360/giga120/', kleurbaar: false, standen: 72,
                  uitvoering: 'flybridge-uitvoering' },
      /* De Flagship 70 kwam in twee helften van honderdtachtig graden. Dat ging
         drie keer mis: alle drie de opnamen draaiden langs de BOEG, zodat de
         achterkant nergens in beeld kwam. Pas de vierde ging achterlangs. De
         twee helften die er nu liggen sluiten aan op 5,5 en 5,9, tegen 3,5 en
         4,2 voor twee opeenvolgende beelden binnen een helft - dus de lassen
         zijn nauwelijks meer dan een gewone stap. */
      flagship70: { map: './assets/media/jacht/360/flagship70/', kleurbaar: false, standen: 72,
                    uitvoering: 'flybridge-uitvoering' },
      /* De Elite 90 is de eerste die in een keer goed kwam: opgenomen vanaf de
         twee startbeelden uit levering/draaitafel-startbeelden/, de ene helft
         langs de boeg en de andere langs de spiegel. De lassen zitten op 4,2 en
         3,6 terwijl twee gewone opeenvolgende beelden 2,6 tot 3,1 schelen - de
         overgang is dus nauwelijks van een gewone stap te onderscheiden. */
      elite90:  { map: './assets/media/jacht/360/elite90/', kleurbaar: false, standen: 72,
                  uitvoering: 'flybridge-uitvoering' },
      /* De FB 24 op dezelfde manier: twee helften vanaf de startbeelden, lassen
         op 4,4 en 3,5 tegen 3,2 en 3,7 voor een gewone stap. De ronde toont de
         flybridge-uitvoering; wie de flybridge met T-top kiest ziet die onder
         Zijaanzicht, waar per dekvorm een echte render staat. */
      fb24:     { map: './assets/media/jacht/360/fb24/', kleurbaar: false, standen: 72,
                  uitvoering: 'flybridge-uitvoering' },
      /* De TD 29, de explorer. Twee helften, lassen op 3,9 en 5,7 tegen 2,0 en
         3,4 voor een gewone stap - de tweede las is de zwakste tot nu toe, maar
         hij valt binnen de spreiding van de ronde zelf en is bij het slepen
         niet als sprong te zien. */
      td29:     { map: './assets/media/jacht/360/td29/', kleurbaar: false, standen: 72,
                  uitvoering: 'flybridge-uitvoering' },
      /* DE SPORT 40 IS ER BIJ DE TWEEDE POGING WEL
         De eerste opname stond uit: technisch prima, maar het beeldmodel had
         het schip in het startbeeld verbouwd tot een gewonere motorjacht met
         drie gescheiden dekken en een witte opbouwkast. Deze tweede opname is
         wel de Sport 40 - de lage wigvorm, de lange donkere glasband onder de
         doorlopende witte lijst, het bad op het voordek, de strandclub achter,
         de rij kleine rompramen, de scherpe boeg, het naamplaatje.

         DE ZWAKSTE LAS DIE WE AANZETTEN  Stand 71 naar 0 zit op 13,1 terwijl
         de mediaan van de ronde 8,8 is en het negentigste percentiel 11,0. Dat
         is anderhalf keer een gewone stap. Nagekeken waar het vandaan komt: het
         is geen verschuiving en geen maatverschil - het jacht staat in beide
         beelden even breed en even hoog, en uitlijnen brengt het verschil maar
         van 8,8 naar 8,3. Het zit in de tekening zelf; de twee opnamen hebben
         de randen net iets anders gezet. Bij het slepen is het een kleine tik,
         geen sprong, en het is dezelfde orde als de FB 24 (11,7 tegen 8,3).
         Beter wordt het pas met een hele draai in een keer. */
      sport40:  { map: './assets/media/jacht/360/sport40/', kleurbaar: false, standen: 72,
                  uitvoering: 'flybridge-uitvoering' },
      /* De SY 37, tot nu toe de schoonste van de acht: lassen op 3,4 en 4,3
         tegen 2,3 en 3,4 voor een gewone stap, mediaan 6,5 over de hele ronde. */
      sy37:     { map: './assets/media/jacht/360/sy37/', kleurbaar: false, standen: 72,
                  uitvoering: 'flybridge-uitvoering' }
    };
    /* VARENDE OPNAMEN
       Een studioronde laat zien wát het schip is; een varende opname laat zien
       hoe het voelt. Ze staan per model apart, want ze zijn er nog niet voor
       alle tien - het tabblad verschijnt alleen waar een opname klaarstaat.
       Een nieuwe erbij is één regel hier plus drie bestanden in de map. */
    var NGVAREND = {
      fb19: { map: './assets/media/jacht/video/varend-fb19',
              uitvoering: 'hardtop met schuifdak',
              uit: 'op kruissnelheid, met de kuip in gebruik' }
    };
    var NG3DKLEUR = './assets/media/jacht/3d/kleur/';
    function kleurRomp(v) {
      if (!v.createTexture) return;
      if (st.rompkleur === 'nachtblauw' && st.opbouw === 'wit') return;
      v.createTexture(NG3DKLEUR + st.model + '-' + st.rompkleur + '-' + st.opbouw + '.webp').then(function (t) {
        ((v.model && v.model.materials) || []).forEach(function (mat) {
          var pbr = mat.pbrMetallicRoughness;
          if (pbr && pbr.baseColorTexture && pbr.baseColorTexture.texture) pbr.baseColorTexture.setTexture(t);
        });
      }).catch(function () {});
    }
    /* De opnameronde: zelfde laadpatroon als de 3D-viewer — het script komt
       pas binnen bij de eerste klik op het tabblad. De spin tekent op een
       canvas dat de houder vult; slepen draait het schip. */
    var spinScriptKlaar = false;
    function spinKleur(s) {
      if (!s.kleurbaar || st.rompkleur === 'nachtblauw') return '';
      return vind(D.rompkleuren, st.rompkleur).verf;
    }
    function laadSpin(s, m) {
      var houder = document.getElementById('rondomHouder');
      if (!houder) return;
      var maak = function () {
        houder.innerHTML = '';
        var vlak = document.createElement('div');
        houder.appendChild(vlak);
        /* Een knop die één volle omwenteling draait. Zonder die knop beweegt de
           weergave alleen zolang er gesleept wordt, en dan is niet te zien dat
           het schip helemaal rond gaat - dat is precies de indruk die het hier
           wekte. De weergave draait bovendien uit zichzelf één ronde zodra hij
           in beeld komt. */
        var draaiknop = document.createElement('button');
        draaiknop.type = 'button';
        draaiknop.className = 'doek__rondomvol doek__rondomdraai';
        draaiknop.textContent = 'Draai rond';
        draaiknop.setAttribute('aria-pressed', 'false');
        var sp = window.NGJachtSpin.maak(vlak, {
          map: s.map, voorvoegsel: 'spin-', cijfers: 2, aantal: s.standen || 36, kleur: spinKleur(s),
          opDraai: function (aan) {
            draaiknop.setAttribute('aria-pressed', aan ? 'true' : 'false');
            draaiknop.textContent = aan ? 'Stop' : 'Draai rond';
          }
        });
        draaiknop.addEventListener('click', function () {
          if (sp.draait()) sp.stopDraai(); else sp.draaiRond(1);
        });
        houder.appendChild(draaiknop);
        var knop = document.createElement('button');
        knop.type = 'button';
        knop.className = 'doek__rondomvol';
        knop.textContent = 'Volledig scherm';
        houder.appendChild(knop);
        knop.addEventListener('click', function () {
          var laag = document.createElement('div');
          laag.className = 'beeldgroot beeldgroot--rondom';
          laag.setAttribute('role', 'dialog');
          laag.setAttribute('aria-label', 'Schermvullende 360-graden weergave van de ' + esc(m.l));
          laag.style.cursor = 'default';
          laag.innerHTML =
            '<div class="beeldgroot__spin"></div>' +
            '<button type="button" class="doek__rondomvol doek__rondomdraai">Draai rond</button>' +
            '<button type="button" class="beeldgroot__sluit">Sluiten &times;</button>' +
            '<p class="beeldgroot__hint mono">Sleep om te draaien</p>';
          var volKnop = laag.querySelector('.doek__rondomdraai');
          var volSpin = window.NGJachtSpin.maak(laag.querySelector('.beeldgroot__spin'),
            { map: s.map, voorvoegsel: 'spin-', cijfers: 2, aantal: s.standen || 36, kleur: spinKleur(s),
              opDraai: function (aan) {
                volKnop.setAttribute('aria-pressed', aan ? 'true' : 'false');
                volKnop.textContent = aan ? 'Stop' : 'Draai rond';
              } });
          volKnop.addEventListener('click', function () {
            if (volSpin.draait()) volSpin.stopDraai(); else volSpin.draaiRond(1);
          });
          var scrollWas = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          function dicht() {
            document.body.style.overflow = scrollWas;
            if (laag.parentNode) laag.parentNode.removeChild(laag);
            document.removeEventListener('keydown', esc2);
          }
          function esc2(ev) { if (ev.key === 'Escape') dicht(); }
          laag.querySelector('.beeldgroot__sluit').addEventListener('click', dicht);
          document.addEventListener('keydown', esc2);
          document.body.appendChild(laag);
        });
      };
      if (spinScriptKlaar || window.NGJachtSpin) { spinScriptKlaar = true; return maak(); }
      var sc = document.createElement('script');
      sc.src = './assets/jacht-spin.js';
      sc.onload = function () { spinScriptKlaar = true; maak(); };
      document.head.appendChild(sc);
    }
    var rondomViewerKlaar = false;
    /* Elk gegenereerd model heeft zijn eigen basisoriëntatie: het ene schip
       ligt langs de x-as, het andere langs de z-as. Uit de afmetingen volgt
       de lengteas, en daarmee de camerahoek die het schip breed in beeld
       zet — iets gedraaid voor een driekwart openingsbeeld. */
    function richtCamera(v) {
      v.addEventListener('load', function () {
        try {
          var d = v.getDimensions();
          var az = (d.x >= d.z ? 0 : 90) - 24;
          v.cameraOrbit = az + 'deg 82deg 72%';
          v.jumpCameraToGoal();
        } catch (e) { /* dan blijft de standaardhoek staan */ }
      }, { once: true });
    }
    function laadRondom(glb, m) {
      var houder = document.getElementById('rondomHouder');
      if (!houder) return;
      var maak = function () {
        houder.innerHTML =
          '<model-viewer src="' + glb + '" camera-controls auto-rotate rotation-per-second="10deg" ' +
            'bounds="tight" camera-orbit="30deg 82deg 72%" min-camera-orbit="auto auto 45%" max-camera-orbit="auto auto 130%" ' +
          'interaction-prompt="none" exposure="0.85" shadow-intensity="0.6" ' +
          'alt="Draaibare 360-graden modelimpressie van de ' + esc(m.l) + '"></model-viewer>' +
          '<button type="button" class="doek__rondomvol">Volledig scherm</button>';
        var mv = houder.querySelector('model-viewer');
        richtCamera(mv);
        mv.addEventListener('load', function () { kleurRomp(mv); }, { once: true });
        /* laadt het model niet (bestand ontbreekt, verbinding valt weg), dan
           een nette mededeling in plaats van een leeg zwart vlak */
        houder.querySelector('model-viewer').addEventListener('error', function () {
          houder.innerHTML = '<div class="doek__open"><b>360&deg;-weergave niet beschikbaar</b>' +
            '<p>Het draaibare model kon niet geladen worden. Kies het zijaanzicht om de ' + esc(m.l) + ' te zien.</p></div>';
        });
        /* beeldvullend draaien: dezelfde viewer, het hele scherm */
        houder.querySelector('.doek__rondomvol').addEventListener('click', function () {
          var laag = document.createElement('div');
          laag.className = 'beeldgroot beeldgroot--rondom';
          laag.setAttribute('role', 'dialog');
          laag.setAttribute('aria-label', 'Schermvullende 360-graden weergave van de ' + esc(m.l));
          laag.style.cursor = 'default';
          laag.innerHTML =
            '<model-viewer src="' + glb + '" camera-controls auto-rotate rotation-per-second="10deg" ' +
            'bounds="tight" camera-orbit="30deg 82deg 72%" min-camera-orbit="auto auto 45%" max-camera-orbit="auto auto 130%" ' +
            'interaction-prompt="none" exposure="0.85" shadow-intensity="0.6" alt=""></model-viewer>' +
            '<button type="button" class="beeldgroot__sluit">Sluiten &times;</button>' +
            '<p class="beeldgroot__hint mono">Sleep om te draaien &middot; knijp of scrol om te zoomen</p>';
          var mvGroot = laag.querySelector('model-viewer');
          richtCamera(mvGroot);
          mvGroot.addEventListener('load', function () { kleurRomp(mvGroot); }, { once: true });
          var scrollWas = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          function dicht() {
            document.body.style.overflow = scrollWas;
            if (laag.parentNode) laag.parentNode.removeChild(laag);
            document.removeEventListener('keydown', esc2);
          }
          function esc2(ev) { if (ev.key === 'Escape') dicht(); }
          laag.querySelector('.beeldgroot__sluit').addEventListener('click', dicht);
          document.addEventListener('keydown', esc2);
          document.body.appendChild(laag);
        });
      };
      if (rondomViewerKlaar) return maak();
      var s = document.createElement('script');
      s.type = 'module';
      s.src = './assets/vendor/model-viewer.min.js';
      s.onload = function () { rondomViewerKlaar = true; maak(); };
      document.head.appendChild(s);
    }

    /* Wat elk gerenderd vlak heet, waar het over gaat, en welke getekende
       maatschets eronder hoort. Van het achteraanzicht bestaat geen schets. */
    var VLAKNAAM  = { boven: T('Bovenaanzicht'), voor: T('Vooraanzicht'), achter: T('Achteraanzicht') };
    var VLAKNOOT  = { boven: T('Dekindeling'), voor: T('Boegvorm en dekopbouw'),
                      achter: T('Spiegel, zwemplateau en achterdekken') };

    /* Van boven-, voor- en achteraanzicht bestaat één render per model, en die
       toont onvermijdelijk één dekvorm. Wijkt die af van wat de bezoeker heeft
       gekozen, dan wordt dat hier gezegd in plaats van stilgehouden.

       Het gaat niet om een randgeval. Bij de Sport Coupé 16 is 'open cockpit'
       de standaardkeuze terwijl de render een hardtop toont, en bij de
       Flybridge 19 is het andersom: standaard hardtop, render met flybridge.
       Beide modellen tonen dus meteen bij openen een ander dek dan er
       aangevinkt staat. Wie open cockpit kiest en een dak ziet, gelooft de
       configurator verder ook niet meer.

       De renders vervangen kan alleen met nieuw renderwerk per dekvorm. Zolang
       dat er niet is, is benoemen wat er staat het eerlijke alternatief. */
    function dekAfwijking() {
      var B = window.NGJachtBeelden;
      if (!B || !B.aanzichtDek) return '';
      var getoond = B.aanzichtDek(st.model, st.dek, aanzicht);
      if (!getoond || getoond === st.dek) return '';
      /* vind() valt bij een onbekende waarde terug op het eerste item in
         plaats van op niets. Zonder deze toets zou een dekvorm die niet in de
         lijst staat stilzwijgend als 'open cockpit' worden benoemd, en dan
         staat er een waarschuwing die zelf niet klopt. */
      var d = vind(D.dekken, getoond);
      var g = vind(D.dekken, st.dek);
      if (d.v !== getoond || g.v !== st.dek) return '';
      return ' ' + T('Let op: dit beeld toont de') + ' ' + esc(d.l.toLowerCase()) +
             ', ' + T('niet de door jou gekozen') + ' ' + esc(g.l.toLowerCase()) + '.';
    }

    /* De ruimtes aan boord: de salon voorop, want die is de enige die uw
       keuze exact volgt. De rest zijn impressies, in dezelfde volgorde als de
       beeldbank ze kent — van eigenaarshut naar wijnkelder, ruwweg van
       vanzelfsprekend naar uitzonderlijk. */
    function ruimteLijst(m) {
      var B = window.NGJachtBeelden;
      if (!B || !B.ruimten) return [];
      return [{ v: 'salon', l: T('Salon'), uit: T('Volgt je hout- en stofferingskeuze.') }]
        .concat(B.ruimten(m.loa));
    }
    function RUIMTENAAM() {
      var r = ruimteLijst(vind(D.modellen, st.model)).filter(function (x) { return x.v === ruimte; })[0];
      return r ? r.l : T('Ruimte');
    }
    function ruimteStrook(m) {
      if (aanzicht !== 'interieur') return '';
      var lijst = ruimteLijst(m);
      if (lijst.length < 2) return '';
      return '<div class="ruimtes" role="tablist" aria-label="Ruimtes aan boord">' +
        lijst.map(function (r) {
          var beeld = r.v === 'salon'
            ? window.NGJachtBeelden.interieur({ model: st.model, interieurhout: st.interieurhout, stoffering: st.stoffering })
            : window.NGJachtBeelden.ruimte(r.v, st.model);
          return '<button type="button" class="ruimte" role="tab" data-ruimte="' + esc(r.v) + '"' +
            ' aria-selected="' + (r.v === ruimte ? 'true' : 'false') + '" title="' + esc(r.uit) + '">' +
            (beeld ? '<span class="ruimte__beeld" style="background-image:url(\'' + klein(beeld) + '\')"></span>' : '') +
            '<span class="ruimte__naam">' + esc(r.l) + '</span></button>';
        }).join('') + '</div>';
    }

    function tekenDoek() {
      var m = vind(D.modellen, st.model);
      /* Het blad Varend staat er alleen bij een model waarvan een varende
         opname klaarligt. Een blad dat naar een lege pagina wijst is erger dan
         geen blad. Dit hoort hier en niet bij het wisselen van tabblad, want
         het hangt aan het gekozen model - en dat wisselt ook zonder dat er op
         een tabblad geklikt wordt. */
      var varendTab = document.getElementById('tabVarend');
      if (varendTab) {
        varendTab.hidden = !NGVAREND[st.model];
        if (varendTab.hidden && aanzicht === 'varend') aanzicht = 'zij';
      }
      var A = window.NGJachtAanzichten;
      /* Staat er voor deze exacte combinatie een render klaar, dan gaat die
         voor; anders blijft de tekening staan. Nooit terugvallen op een
         andere kleur of een ander dektype — dan denkt de koper dat hij
         krijgt wat hij ziet. Boven- en vooraanzicht worden altijd getekend;
         die hoeven dus niet gerenderd te worden. */
      /* DE NACHTOPNAME
         Hetzelfde schip bij avond, met het licht aan. Hij bestaat alleen in de
         catalogusuitvoering - nachtblauw met witte opbouw - want de romplak is
         bij nacht nauwelijks te onderscheiden en zes kleuren maal tien
         modellen renderen om een verschil dat niemand ziet is weggegooid werk.
         Dat staat in de noot eronder.

         `nachtBeschikbaar` hangt niet aan de stand van de knop maar aan het
         bestaan van de opname: anders zou de knop verdwijnen zodra hij uit
         staat, en kon hij nooit meer aan. */
      var NB = window.NGJachtBeelden;
      var nachtBeschikbaar = !!(aanzicht === 'zij' && NB && NB.nacht && NB.nacht(st.model, st.dek));
      var nachtRender = (nachtBeschikbaar && st.nacht) ? NB.nacht(st.model, st.dek) : null;
      var render = window.NGJachtBeelden
        ? (aanzicht === 'zij'       ? (nachtRender || window.NGJachtBeelden.buiten(st))
         : (aanzicht === 'interieur' && ruimte === 'salon')
                                    ? window.NGJachtBeelden.interieur({ model: st.model, interieurhout: st.interieurhout, stoffering: st.stoffering })
         : null)
        : null;
      /* De overige ruimtes aan boord: één impressie per ruimte, met een noot
         die zegt dat hout en stoffering daar de catalogusafwerking tonen. */
      var ruimteRender = (aanzicht === 'interieur' && ruimte !== 'salon' && window.NGJachtBeelden)
        ? window.NGJachtBeelden.ruimte(ruimte, st.model) : null;
      /* Boven- en vooraanzicht hebben elk een eigen render per model: van
         bovenaf ziet u de dekindeling, recht van voren de boegvorm en het
         aantal dekken. Geen van beide verandert mee met de rompkleur, dus één
         render per model volstaat — ook voor de modellen waarvan de maten nog
         open staan, want een foto van het dek verzint geen breedte. */
      var B = window.NGJachtBeelden;
      var vlakRender = !B ? null
                     : (B.boven  && aanzicht === 'boven')  ? B.boven(st.model, st.dekafwerking, st.dek)
                     : (B.voor   && aanzicht === 'voor')   ? B.voor(st.model, st.dek)
                     : (B.achter && aanzicht === 'achter') ? B.achter(st.model, st.dek)
                     : null;
      /* Het schaalaanzicht wordt wél uit de maten getekend. Heeft de werf die
         voor dit model nog niet opgegeven, dan levert tekenen een schip van nul
         meter breed op met "null hutten" eronder. Liever dan dat zeggen we wat
         er aan de hand is. Het zijaanzicht — de goedgekeurde render — blijft
         gewoon werken, en boven- en vooraanzicht nu ook. */
      var maatloos = m.specsOpen && ['boven', 'voor', 'schaal'].indexOf(aanzicht) > -1 && !vlakRender;
      var varendeOpname = aanzicht === 'varend' ? NGVAREND[st.model] : null;
      var rondomSpin = aanzicht === 'rondom' ? NGSPIN[st.model] : null;
      var rondomGlb = (aanzicht === 'rondom' && !rondomSpin) ? NG3D[st.model] : null;
      /* De render van de zojuist gekozen optie. */
      var optieRender = (aanzicht === 'optie' && optieToon && B && B.optie)
                        ? B.optie(optieToon, st.model) : null;
      /* Het dekplan wordt getekend uit de maten, net als het boven- en het
         vooraanzicht, en het volgt de gekozen opties: wie de jacuzzi aanvinkt
         ziet hem op het bovenste dek staan, wie de tenderkraan aanvinkt ziet
         waar de bijboot ligt. Ontbreken de maten, dan geeft de module null en
         zegt het doek dat eerlijk. */
      /* De materiaalstaat: alle zeven interieurkeuzes als staal naast elkaar.
         Hij hangt niet aan de maten van het schip maar aan de keuzes, dus hij
         bestaat voor elk model - ook voor de modellen waarvan de werf de maten
         nog niet heeft opgegeven. */
      /* De drie kamerbeelden als blok boven de staalkaart.

         De lichtstanden staan als strook van vier en niet als één beeld: het
         verschil tussen warm dimbaar en nisverlichting is pas te zien als je
         ze naast elkaar legt, en dat is nu juist wat er te kiezen valt. De
         gekozen stand krijgt een gouden rand - dat is de enige plek op dit
         blad waar het beeld zegt wat er aanstaat. */
      function kamerBlok(kb) {
        if (!kb) return '';
        var uit = '';
        var hout = vind(D.interieurhout, st.interieurhout);
        var stof = vind(D.stoffering, st.stoffering);
        var vl = vind(D.vloer, st.vloer);
        var wa = vind(D.wandafwerking, st.wandafwerking);
        var ma = vind(D.marmer, st.marmer);
        var me = vind(D.metaal, st.metaal);

        if (kb.salon) {
          uit += '<img class="kamer__beeld" src="' + esc(kb.salon) + '" alt="' +
            esc(T('Salon met ') + hout.l.toLowerCase() + ', ' + stof.l.toLowerCase() + ', ' +
                vl.l.toLowerCase() + T(' en ') + wa.l.toLowerCase()) + '" ' +
            'width="1200" height="520" loading="lazy">' +
            '<p class="doek__rondomnoot"><b>' + esc(T('Jouw salon')) + '</b>: ' +
            esc(hout.l + ' · ' + stof.l + ' · ' + vl.l + ' · ' + wa.l) + '. ' +
            esc(T('Deze vier keuzes volgt het beeld werkelijk.')) + '</p>';
        } else {
          /* Geen gat en geen ander schip: gewoon zeggen wat er is. */
          uit += '<p class="doek__rondomnoot">' +
            esc(T('Van deze combinatie is nog geen salonopname gemaakt. ')) +
            esc(T('De materialen staan hieronder als staal; de opname volgt.')) + '</p>';
        }

        if (kb.bad) {
          uit += '<img class="kamer__beeld" src="' + esc(kb.bad) + '" alt="' +
            esc(T('Badkamer in ') + ma.l.toLowerCase() + T(' met ') + me.l.toLowerCase()) + '" ' +
            'width="1200" height="520" loading="lazy">' +
            '<p class="doek__rondomnoot"><b>' + esc(T('Jouw badkamer')) + '</b>: ' +
            esc(ma.l + ' · ' + me.l) + '. ' +
            esc(T('Alle zestien combinaties van marmer en metaal staan klaar.')) + '</p>';
        }

        /* De vier lichtstanden naast elkaar. Ze staan er alleen als ze er
           alle vier zijn: een strook van twee suggereert dat er maar twee
           standen zijn. */
        var licht = D.verlichting.map(function (v) {
          return { v: v.v, l: v.l, url: B.licht ? B.licht({ verlichting: v.v }) : null };
        });
        if (licht.every(function (x) { return !!x.url; })) {
          uit += '<div class="kamer__licht">' + licht.map(function (x) {
            return '<button type="button" class="kamer__licht__k" data-groep="verlichting" ' +
              'data-waarde="' + esc(x.v) + '" aria-pressed="' + (x.v === st.verlichting ? 'true' : 'false') + '">' +
              '<img src="' + esc(x.url) + '" alt="' + esc(x.l) + '" width="1200" height="520" loading="lazy">' +
              '<span>' + esc(x.l) + '</span></button>';
          }).join('') + '</div>' +
            '<p class="doek__rondomnoot"><b>' + esc(T('Lichtstanden')) + '</b>: ' +
            ((st.interieurhout === 'walnoot' && st.stoffering === 'zand')
              ? esc(T('dezelfde salon, vier keer anders verlicht. Klik om te wisselen.'))
              : esc(T('vier keer anders verlicht. Deze opnames staan in de catalogusuitvoering ' +
                      '(walnoot met zandkleurig leer) en volgen je hout- en ' +
                      'stofferingskeuze niet. Klik om te wisselen.'))) + '</p>';
        }
        return uit;
      }

      var materiaalblad = (aanzicht === 'materialen' && window.NGJachtMaterialen)
                    ? window.NGJachtMaterialen.svg(st, D) : null;

      /* De materiaalkamers: de interieurkeuzes in een echte ruimte.

         WAAROM DIT BOVEN DE STAALKAART STAAT
         Een staal laat zien wát een materiaal is; het laat niet zien wat het
         doet. Wie tussen wengé en essen twijfelt wil geen twee lapjes hout
         naast elkaar maar twee salons. De staalkaart blijft eronder staan,
         want die is het enige dat alle zeven keuzes tegelijk toont en dat ook
         doet als een combinatie nog niet gerenderd is.

         WAAROM DE SALON SOMS ONTBREEKT EN DE BADKAMER NOOIT
         De salon volgt vier keuzes en dat zijn 320 combinaties; daarvan staan
         de meest gelopen wegen klaar. De badkamer volgt er twee - zestien
         combinaties - en die zijn compleet. Ontbreekt de salon, dan zegt het
         blad dat en toont de stalen; nooit een andere combinatie, want dat is
         dezelfde regel als bij de rompkleur en om dezelfde reden. */
      var kamerBeelden = null;
      if (aanzicht === 'materialen' && B) {
        kamerBeelden = { salon: B.salon ? B.salon(st) : null,
                         bad: B.bad ? B.bad(st) : null,
                         licht: B.licht ? B.licht(st) : null };
      }
      var optieRegel  = optieToon ? vind(D.opties, optieToon) : null;

      var tekening =
        aanzicht === 'varend'    ? (varendeOpname
                                   ? '<video class="doek__varend" autoplay muted loop playsinline preload="metadata" ' +
                                     'poster="' + varendeOpname.map + '.jpg" ' +
                                     'aria-label="De ' + esc(m.l) + ' varend op zee">' +
                                     '<source src="' + varendeOpname.map + '.webm" type="video/webm">' +
                                     '<source src="' + varendeOpname.map + '.mp4" type="video/mp4">' +
                                     '</video>' +
                                     '<p class="doek__rondomnoot">De ' + esc(m.l) + ' varend: ' +
                                     esc(varendeOpname.uitvoering) + ', ' + esc(varendeOpname.uit) + '. ' +
                                     'De opname toont de catalogusuitvoering in nachtblauw; je eigen ' +
                                     'samenstelling staat onder Zijaanzicht.</p>'
                                   : '<div class="doek__open"><b>Varende opname nog niet beschikbaar</b>' +
                                     '<p>Van de ' + esc(m.l) + ' is nog geen varende opname gemaakt. ' +
                                     'Kies het zijaanzicht om dit model te zien.</p></div>') :
        aanzicht === 'rondom'    ? (rondomSpin
                                   ? '<div class="doek__rondom" id="rondomHouder"></div>' +
                                     '<p class="doek__rondomnoot">360&deg;-opname van de ' + esc(rondomSpin.uitvoering) +
                                     ' op renderniveau. Sleep om te draaien. ' +
                                     (rondomSpin.kleurbaar
                                       ? 'De romplak volgt je kleurkeuze (' +
                                         esc(vind(D.rompkleuren, st.rompkleur).l.toLowerCase()) +
                                         '); dek en opbouw tonen de opname-uitvoering.'
                                       : (st.rompkleur === 'nachtblauw'
                                         ? 'De opname toont je gekozen rompkleur nachtblauw.'
                                         : 'De opname staat in nachtblauw; je rompkleur (' +
                                           esc(vind(D.rompkleuren, st.rompkleur).l.toLowerCase()) +
                                           ') zie je onder Zijaanzicht.')) + '</p>'
                                   : rondomGlb
                                   ? '<div class="doek__rondom" id="rondomHouder"></div>' +
                                     '<p class="doek__rondomnoot">360&deg;-modelimpressie: romp- en opbouwkleur volgen je keuzes (' +
                                     esc(vind(D.rompkleuren, st.rompkleur).l.toLowerCase()) + ', opbouw ' +
                                     esc(vind(D.opbouw, st.opbouw).l.toLowerCase()) + '); dek en materialen tonen de ' +
                                     'catalogusuitvoering. Het exacte beeld van je samenstelling staat onder Zijaanzicht.</p>'
                                   : '<div class="doek__open"><b>360&deg;-weergave nog niet beschikbaar</b>' +
                                     '<p>Voor de ' + esc(m.l) + ' is nog geen draaibaar model klaargezet. Kies het zijaanzicht om dit model te zien.</p></div>') :
        optieRender              ? '<img src="' + optieRender + '" alt="' +
                                   esc(optieRegel ? optieRegel.l : optieToon) + '" ' +
                                   'width="1200" height="520" style="display:block;width:100%;height:auto">' +
                                   '<p class="doek__rondomnoot"><b>' +
                                   esc(optieRegel ? optieRegel.l : optieToon) + '</b>: impressie van de optie. ' +
                                   (optieRegel && optieRegel.uit ? esc(optieRegel.uit) + ' ' : '') +
                                   ((B && B.optieOpMaat && B.optieOpMaat(optieToon, st.model))
                                     ? 'De optie staat hier op een schip van het formaat van de ' + esc(m.l) +
                                       '; de kleuren en de afwerking tonen de catalogusuitvoering. '
                                     : 'Het schip, de kleuren en de afwerking op dit beeld tonen de ' +
                                       'catalogusuitvoering en niet je samenstelling. ') +
                                   'Je eigen schip staat onder Zijaanzicht.</p>' :
        maatloos                 ? '<div class="doek__open"><b>Maten nog niet vastgesteld</b>' +
                                   '<p>Van de ' + esc(m.l) + ' is het zijaanzicht goedgekeurd, maar breedte, ' +
                                   'diepgang en indeling zijn nog niet opgegeven. Zonder die maten valt er geen ' +
                                   'boven-, voor- of schaalaanzicht te tekenen dat klopt, en een tekening die niet ' +
                                   'klopt is erger dan geen tekening.</p>' +
                                   '<p>Kies het zijaanzicht om dit model te zien.</p></div>' :
        /* 1200 × 520 is het formaat waarin de werf de renders aanlevert, en
           het is ook de verhouding van de getekende SVG ernaast. De maten
           moeten kloppen met het bestand: staan ze verkeerd, dan reserveert
           de browser de verkeerde hoogte en springt de pagina op het moment
           dat het beeld binnen is. */
        /* Boven- en vooraanzicht: eerst de render, daaronder — als de maten
           bekend zijn — de maatschets. De render toont hoe het schip eruitziet,
           de schets waar de meters zitten. */
        vlakRender               ? '<img src="' + vlakRender + '" alt="' + esc(VLAKNAAM[aanzicht]) +
                                   ' van de ' + esc(m.l) + '" ' +
                                   'width="2400" height="1350" style="display:block;width:100%;height:auto">' +
                                   '<p class="doek__rondomnoot">' + VLAKNOOT[aanzicht] +
                                   /* Deze stukken gingen niet door de vertaling en bleven op de
                                      Engelse pagina in het Nederlands staan, midden in een verder
                                      Engelse zin: "Deck layout met solid teak - de rompkleur volgt
                                      hier uw keuze nog niet." */
                                   (aanzicht === 'boven'
                                     ? T(' met ') + esc(vind(D.dekafwerking, st.dekafwerking).l.toLowerCase()) +
                                       T('; de rompkleur volgt hier je keuze nog niet.')
                                     : T(' van de catalogusuitvoering; romp- en dekkleur volgen hier je keuzes nog niet.')) +
                                   dekAfwijking() +
                                   T(' Het exacte beeld van je samenstelling staat onder Zijaanzicht.') + '</p>' :
        ruimteRender             ? '<img src="' + ruimteRender + '" alt="' + esc(RUIMTENAAM()) +
                                   ' aan boord van de ' + esc(m.l) + '" ' +
                                   'width="1200" height="520" style="display:block;width:100%;height:auto">' +
                                   '<p class="doek__rondomnoot">' + esc(RUIMTENAAM()) +
                                   ': ruimte-impressie in de catalogusafwerking. Hout- en ' +
                                   'stofferingskeuze volgen hier je keuze nog niet; de salon doet dat w&eacute;l.' +
                                   /* Een ruimte op een schip van honderdtwintig meter is een andere
                                      ruimte dan op een schip van zestien. Is er een impressie voor
                                      deze maatklasse, dan staat dat er; is die er niet, dan staat er
                                      dat het beeld een kleiner schip toont - want dat is wat de
                                      bezoeker dan ziet, en dat hoort hij te weten. */
                                   ((B && B.ruimteOpMaat && !B.ruimteOpMaat(ruimte, st.model))
                                     ? ' Dit beeld toont deze ruimte op een kleiner schip; aan boord van de ' +
                                       esc(m.l) + ' is hij ruimer.'
                                     : '') + '</p>' :
        render                   ? '<img src="' + render + '" alt="' + esc(m.l) +
                                   (nachtRender ? ' bij nacht' : ' in de gekozen uitvoering') + '" ' +
                                   'width="1200" height="520" style="display:block;width:100%;height:auto">' +
                                   (nachtRender
                                     ? '<p class="doek__rondomnoot">De ' + esc(m.l) + ' bij avond, met de ' +
                                       'verlichting aan, ' +
                                       esc(vind(D.dekken, st.dek).l.toLowerCase()) + '. ' +
                                       'De nachtopname staat in de catalogusuitvoering: nachtblauw met ' +
                                       'parelwitte opbouw. Kies je een andere romp- of opbouwkleur, dan ' +
                                       'gaat het beeld vanzelf terug naar dag om die kleur te laten zien.</p>'
                                     : '') +
                                   /* Onder de salon hoort te staan wat hij wel en niet volgt. Nu er
                                      zeven interieurkeuzes zijn en de render er twee van toont, is
                                      zwijgen daarover een belofte die het beeld niet waarmaakt. */
                                   (aanzicht === 'interieur' && ruimte === 'salon'
                                     ? '<p class="doek__rondomnoot">' +
                                       T('Deze salon staat in ') + esc(vind(D.interieurhout, st.interieurhout).l.toLowerCase()) +
                                       T(' met ') + esc(vind(D.stoffering, st.stoffering).l.toLowerCase()) +
                                       T('. Die twee volgt het beeld werkelijk. ') +
                                       T('Je vloer, wandafwerking, marmer, metaalafwerking en verlichting ' +
                                         'staan als staal onder Materialen; die vijf zijn op deze opname ' +
                                         'de catalogusuitvoering.') + '</p>'
                                     : '') :
        materiaalblad            ? kamerBlok(kamerBeelden) + materiaalblad +
                                   '<p class="doek__rondomnoot">' +
                                   /* Kort houden: deze noot staat in kapitalen, en drie zinnen
                                      in kapitalen leest niemand. Het lange verhaal staat waar het
                                      hoort - onder de salon en in het dossier. */
                                   /* Stond hier als "de twee keuzes die de salonrender
                                      werkelijk volgt". Sinds de salon er vier volgt en er een
                                      badkamer en vier lichtstanden bij zijn, kunnen dat er twee
                                      tot zeven zijn - en de staalkaart telt ze zelf al in zijn
                                      voetnoot. Twee tellingen onder elkaar die verschillende
                                      getallen noemen is erger dan geen. Wat hier overblijft is
                                      wat de staalkaart niet zegt. */
                                   T('De werf bepaalt de leverancier en de exacte tint.') +
                                   '</p>' :
                                   modelRender();
      /* De laatste terugval van het doek. Hier stond een getekend silhouet;
         nu de modelrender uit de heromap, die er voor alle tien de modellen
         is. Is ook die er niet, dan een regel tekst - want een schets van een
         schip van miljoenen is slechter dan geen beeld. */
      function modelRender() {
        var url = m && m.v ? './assets/media/jacht/hero/' + m.v + '.webp' : null;
        return url
          ? '<img src="' + url + '" alt="' + esc(m.l) + '" ' +
            'style="display:block;width:100%;height:auto">' +
            '<p class="doek__rondomnoot">' +
            T('Modelopname in de catalogusuitvoering. Je eigen kleuren staan onder Zijaanzicht.') +
            '</p>'
          : '<div class="doek__open"><b>' + esc(m.l) + '</b><p>' +
            T('Van deze combinatie is nog geen opname beschikbaar.') + '</p></div>';
      }

      /* Onder het interieurbeeld een strook met de ruimtes aan boord. Welke er
         staan hangt af van de lengte: een schip van zestien meter heeft geen
         stuurhuis en geen autogarage, dus die knoppen komen er niet. */
      /* Het doek gaat door de vertaling voordat het in de pagina komt. Dat was
         de enige plek op de Engelse pagina waar nog Nederlands stond: een
         bovenaanzicht met SALON, COCKPIT en "5 HUTTEN ONDERDEKS" erin, en
         noten die halverwege van het Engels in het Nederlands vielen. Op de
         Nederlandse pagina geeft vertaalHtml de tekst ongewijzigd terug, dus
         dit kost daar niets. */
      var doekHtml = tekening + ruimteStrook(m);
      if (window.NGTaal && window.NGTaal.vertaalHtml) doekHtml = window.NGTaal.vertaalHtml(doekHtml);
      document.getElementById('doek').innerHTML = doekHtml;
      /* De knop Nacht staat er alleen als er iets te schakelen valt: als er
         een nachtopname van dit schip is, of als er een tekening op het doek
         staat - die reageert er wel op. Op een dagrender zonder nachtopname
         deed hij niets: gemeten gemiddeld verschil 0,0 over het hele beeld, en
         een knop die zichtbaar is en niets doet leest als een storing. */
      var nachtKnop = document.getElementById('nachtKnop');
      if (nachtKnop) {
        /* Het dekplan reageert niet op de nachtknop - een plattegrond heeft geen
           dag en geen nacht - dus daar hoort de knop niet te staan. */
        /* Net als het dekplan kent de materiaalstaat geen dag en geen nacht:
           een staalkaart in het donker is geen staalkaart meer. */
        var tekeningOpHetDoek = !(render || vlakRender || ruimteRender || optieRender ||
                                  rondomSpin || rondomGlb || varendeOpname || maatloos ||
                                  materiaalblad || aanzicht === 'dekplan');
        nachtKnop.hidden = !(nachtBeschikbaar || tekeningOpHetDoek);
      }
      /* Het doek wordt bij elke keuze opnieuw opgebouwd, dus ook de strook —
         en die begint dan weer bij nul. Op een telefoon passen er vier van de
         veertien ruimtes naast elkaar: wie doorschuift naar de bioscoop en
         erop tikt, zou zichzelf terugvinden bij de salon. De gekozen tegel
         wordt daarom teruggeschoven naar het midden. */
      var strook = document.querySelector('#doek .ruimtes');
      var gekozen = strook && strook.querySelector('[aria-selected="true"]');
      if (gekozen) {
        strook.scrollLeft = gekozen.offsetLeft - (strook.clientWidth - gekozen.offsetWidth) / 2;
      }
      if (rondomSpin) laadSpin(rondomSpin, m);
      else if (rondomGlb) laadRondom(rondomGlb, m);
      /* De uitleg "waarom een tekening en geen foto" is precies dat: uitleg
         bij de tekening. Zodra dit aanzicht een goedgekeurde render toont,
         klopt de tekst niet meer en verdwijnt hij vanzelf. */
      var uitlegBlok = document.querySelector('.uitleg > div:first-child');
      if (uitlegBlok) uitlegBlok.style.display = (render || vlakRender || aanzicht === 'rondom') ? 'none' : '';
      document.getElementById('naam').textContent = m.l;
      document.getElementById('ondertitel').textContent =
        m.klasse.toUpperCase() + ' · ' + vind(D.rompkleuren, st.rompkleur).l.toUpperCase();

      /* Een maat die de werf nog niet heeft opgegeven wordt een streepje, geen
         NaN en geen geschatte waarde. En weigert het vaarprofiel, dan bleef de
         strook eerder helemaal leeg — dan zag de bezoeker niets en wist hij
         niet waarom. Nu blijft staan wat wél vaststaat, met de reden erbij. */
      var maat = function (v) {
        return E ? E.lengte(v)
                 : ((v === null || v === undefined || isNaN(v)) ? '-' : f1(v) + ' m');
      };
      var geheel = function (v) {
        return (v === null || v === undefined || isNaN(v)) ? '-' : String(v);
      };

      var p = window.NGJachtProfiel.bereken(st, D);
      var specs = [
        [maat(m.loa), 'lengte over alles'],
        [maat(m.breedte), 'breedte'],
        [maat(m.diepgang), 'diepgang'],
        [geheel(m.gasten), 'gasten'],
        [geheel(m.hutten), 'hutten']
      ];
      if (!p.geweigerd) {
        /* Knopen en zeemijlen blijven knopen en zeemijlen, ook in het
           imperiale stelsel: een knoop is een zeemijl per uur en dat is de
           maat waarin dit hele bedrijf rekent, van Monaco tot Miami. */
        specs = specs.concat([
          [E ? E.snelheid(p.kruis) : f1(p.kruis) + ' kn', 'kruissnelheid'],
          [E ? E.afstand(p.afstand) : Math.round(p.afstand) + ' nm', 'bereik'],
          [maat(window.NGJachtAanzichten.hoogten(m, st.dek).airdraft), 'doorvaarthoogte'],
          [p.regime, 'vaarregime']
        ]);
      }
      document.getElementById('specs').innerHTML = specs.map(function (s) {
        /* Ook de waarde door de vertaling: 'glijdend' is een vaarregime en geen
           getal, en die bleef op de Engelse en Duitse pagina Nederlands staan
           tussen acht vertaalde labels. Een maat als "16,4 m" staat niet in het
           woordenboek en komt er ongewijzigd weer uit. */
        return '<div class="spec"><b>' + esc(T(s[0])) + '</b><span>' + esc(T(s[1])) + '</span></div>';
      }).join('') +
      (p.geweigerd
        ? '<p class="specs__noot">' + esc(p.redenen.map(T).join(' ')) + ' ' + esc(T(p.advies)) + '</p>'
        : '');
    }

    function tekenSamenvatting() {
      var m = vind(D.modellen, st.model);
      var rijen = [
        [T('Model'), m.l],
        [T('Rompkleur'), vind(D.rompkleuren, st.rompkleur).l],
        [T('Opbouw'), vind(D.opbouw, st.opbouw).l],
        [T('Dek en bovenbouw'), vind(D.dekken, st.dek).l],
        [T('Dekafwerking'), vind(D.dekafwerking, st.dekafwerking).l],
        [T('Interieur'), vind(D.interieurhout, st.interieurhout).l],
        [T('Stoffering'), vind(D.stoffering, st.stoffering).l],
        [T('Vloer'), vind(D.vloer, st.vloer).l],
        [T('Wandafwerking'), vind(D.wandafwerking, st.wandafwerking).l],
        [T('Marmer badkamer'), vind(D.marmer, st.marmer).l],
        [T('Metaalafwerking'), vind(D.metaal, st.metaal).l],
        [T('Verlichting'), vind(D.verlichting, st.verlichting).l],
        [T('Motorisering'), vind(D.motorisering, st.motorisering).l],
        [T('Opties'), st.opties.length ? st.opties.map(function (v) { return vind(D.opties, v).l; }).join(', ') : T('geen')]
      ];
      document.getElementById('samenvatting').innerHTML = rijen.map(function (r) {
        return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>';
      }).join('');
    }

    /* ---------- prijs ----------
       Zolang de prijstabel leeg is, staat er "op aanvraag". Dat is geen
       tijdelijke noodgreep maar de juiste weergave: liever geen bedrag dan
       een verzonnen bedrag. */
    function tekenPrijs() {
      var el = document.getElementById('prijs');
      var uit = document.getElementById('prijsUit');
      if (!D.prijzenActief) {
        el.textContent = T('op aanvraag');
        document.getElementById('prijsLabel').textContent = T('Richtprijs');
        uit.textContent = 'De prijzen van dit demonstratiemodel staan nog niet in het systeem. Je kunt je samenstelling gewoon doorsturen; de werf koppelt de prijs terug.';
        return;
      }
      /* Eén rekenpunt in jacht-data.js: de configurator, het dossier en de PDF
         rekenden dit eerder elk apart uit, en dat is precies hoe bedragen uit
         elkaar gaan lopen. */
      var m = vind(D.modellen, st.model);
      var r = D.prijsVan(st, D);
      if (!r) { el.textContent = T('op aanvraag'); return; }
      document.getElementById('prijsLabel').textContent = T('Richtprijs excl. btw');
      el.textContent = euro(r.totaal);
      /* Levertijd erbij: wie een schip samenstelt wil weten wanneer het er is,
         en dat is in dit segment een even harde afweging als de prijs. */
      var lever = m.bouwtijd
        ? T(' Bouwtijd vanaf contract circa ') + m.bouwtijd + T(' maanden.')
        : '';
      /* Staat er een bedrag in een andere munt dan de euro, dan hoort erbij
         tegen welke koers en van wanneer. Zonder die zin leest een dollarprijs
         als een prijs die in dollars is afgesproken, en dat is hij niet. */
      var koersnoot = E && E.geldNoot() ? ' ' + E.geldNoot() : '';
      uit.textContent = T('Richtprijs van deze samenstelling, exclusief btw en exclusief afleveringskosten. Inclusief ') +
        Math.round(D.btw * 100) + T('% btw: ') + euro(r.inclusief) + '.' + lever + koersnoot;
    }

    /* Welke groepen er na een keuze anders uitzien. De miniaturen van
       rompkleur, opbouw en dek tonen het huidige schip, dus die drie hangen
       aan elkaar; een modelwissel raakt alles omdat de deklijst en alle
       miniaturen meebewegen. De rest raakt alleen zichzelf. */
    var HANGT_SAMEN = {
      model: PANEEL_VOLGORDE.slice(1),
      startpunt: PANEEL_VOLGORDE.slice(1),
      rompkleur: ['rompkleur', 'opbouw', 'dek'],
      opbouw: ['rompkleur', 'opbouw', 'dek'],
      dek: ['rompkleur', 'opbouw', 'dek'],
      /* de interieurtegels tonen de salon in de huidige combinatie van hout
         en stoffering: wijzigt het een, dan hertekenen beide groepen */
      interieurhout: ['interieurhout', 'stoffering'],
      stoffering: ['interieurhout', 'stoffering']
    };

    function tekenSamenbalk() {
      var m = vind(D.modellen, st.model);
      var crew = window.NGJachtBemanning ? window.NGJachtBemanning.bereken(st, D) : { beschikbaar: false };
      var zet = function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };
      zet('sbModel', m.l);
      zet('sbSub', (m.loa !== null ? (E ? E.lengte(m.loa) : f1(m.loa) + ' m') + ' · ' : '') +
                   vind(D.rompkleuren, st.rompkleur).l.toLowerCase());
      zet('sbGasten', m.gasten === null ? '-' : String(m.gasten));
      zet('sbCrew', crew.beschikbaar ? String(crew.aanbevolen) : '-');
      zet('sbPrijs', document.getElementById('prijs') ? document.getElementById('prijs').textContent : T('op aanvraag'));
    }

    /* Wie de bioscoop bekijkt op de Giga 120 en terugstapt naar de SC 16,
       zou anders naar een lege plek kijken: die ruimte bestaat daar niet. */
    function borgRuimte() {
      var mag = ruimteLijst(vind(D.modellen, st.model));
      for (var i = 0; i < mag.length; i++) if (mag[i].v === ruimte) return;
      ruimte = 'salon';
    }
    function ververs(groepen) {
      borgDek();
      borgOpties();
      borgRuimte();
      if (groepen === 'alles') tekenPaneel();
      else if (groepen && groepen.length) herteken(groepen);
      tekenDoek(); tekenSamenvatting(); tekenPrijs(); schrijfUrl(); tekenSamenbalk();
    }

    /* Wat er gebeurt, doorgeven aan de meting.

       Eén regel per plek, en de configurator weet niet waar het heen gaat:
       jacht-meting.js beslist of er iets bewaard wordt en waar. Staat die
       module er niet - een pagina die hem niet inlaadt, of een werf die
       niet wil meten - dan gebeurt hier niets en merkt niemand er iets van.
       Dat is met opzet: meten mag nooit iets kunnen breken aan het ding dat
       het meet. */
    function meld(soort) {
      try { if (window.NGJachtMeting) window.NGJachtMeting.gebeurtenis(soort); }
      catch (e) { /* meten is bijzaak */ }
    }

    document.getElementById('paneel').addEventListener('click', function (e) {
      var k = e.target.closest('.kz__knop');
      if (!k || k.disabled) return;
      var g = k.dataset.groep, v = k.dataset.waarde;
      /* Het beeld volgt de keuze — het principe waarmee de Hanse-configurator
         zijn awards won, hier vertaald naar tabs: wie stoffering kiest, kijkt
         de salon in; wie dekafwerking kiest, kijkt op het dek. */
      var TABWISSEL = { model: 'zij', rompkleur: 'zij', opbouw: 'zij', dek: 'zij',
                        motorisering: 'zij', dekafwerking: 'boven',
                        interieurhout: 'interieur', stoffering: 'interieur',
                        /* De vijf afwerkingen zijn op geen enkele render te
                           zien. Ze naar het interieurblad sturen zou een salon
                           tonen die niet meebeweegt - dus gaan ze naar het blad
                           dat ze wel toont. */
                        vloer: 'materialen', wandafwerking: 'materialen',
                        marmer: 'materialen', metaal: 'materialen',
                        verlichting: 'materialen' };
      /* Waar een optie geen eigen render heeft, valt hij terug op het aanzicht
         waar hij het best te zien zou zijn. Het zwemplateau zit op de spiegel,
         dus daar is het achteraanzicht het juiste blad. */
      var OPTIEWISSEL = { jacuzzi: 'boven', zwembad: 'boven', tenderkraan: 'boven',
                          zwemplateau: 'achter', onderwaterlicht: 'zij',
                          zonnepanelen: 'zij', satelliet: 'zij' };
      if (g === 'opties') {
        /* Wie een optie aanvinkt wil die optie zien. Voorheen sprong het doek
           naar het bovenaanzicht — een render van de catalogusuitvoering waar
           helemaal geen jacuzzi in staat, zodat het leek alsof er niets
           gebeurde. Er ligt voor elke optie een eigen render klaar; die komt nu
           in beeld. Alleen bij aanvinken: wie hem uitzet wil juist het schip
           terugzien. */
        var zetAan = st.opties.indexOf(v) < 0;
        var optieBeeld = (window.NGJachtBeelden && window.NGJachtBeelden.optie)
                       ? window.NGJachtBeelden.optie(v, st.model) : null;
        if (zetAan && optieBeeld) { optieToon = v; zetAanzicht('optie'); }
        else if (OPTIEWISSEL[v]) { optieToon = null; zetAanzicht(OPTIEWISSEL[v]); }
        else if (aanzicht === 'optie') { optieToon = null; zetAanzicht('zij'); }
        if (v === 'onderwaterlicht' && st.opties.indexOf(v) < 0) {
          st.nacht = true;
          document.getElementById('nachtKnop').setAttribute('aria-pressed', 'true');
        }
      } else if (TABWISSEL[g]) {
        /* wie in de 360-weergave van model, rompkleur of opbouwkleur
           wisselt, ziet die keuze daar meteen terug; bij dek- en
           materiaalkeuzes wisselen we wél weg, want die zijn in de
           360-impressie niet te zien */
        if (!(aanzicht === 'rondom' && (g === 'model' || g === 'rompkleur' || g === 'opbouw'))) zetAanzicht(TABWISSEL[g]);
      } else if (g === 'startpunt') {
        zetAanzicht('zij');
      }
      if (g === 'startpunt') {
        var sp = D.startpunten.filter(function (s) { return s.v === v; })[0];
        if (sp) Object.keys(sp.zet).forEach(function (sleutel) {
          st[sleutel] = Array.isArray(sp.zet[sleutel]) ? sp.zet[sleutel].slice() : sp.zet[sleutel];
        });
      } else if (g === 'opties') {
        var i = st.opties.indexOf(v);
        if (i > -1) st.opties.splice(i, 1); else st.opties.push(v);
      } else {
        st[g] = v;
      }
      /* De nachtopname bestaat alleen in de catalogusuitvoering: nachtblauw
         met een parelwitte opbouw. Stond Nacht aan en koos de bezoeker daarna
         een rompkleur of een opbouwkleur, dan bleef diezelfde opname staan en
         gebeurde er op het scherm niets - klik op parelwit, klik op zandbeige,
         hetzelfde beeld. Een keuze die geen zichtbaar gevolg heeft leest als
         een kapotte knop, en de noot eronder ("zet Nacht uit voor uw eigen
         kleurkeuze") vroeg de bezoeker om zelf op te lossen wat de
         configurator hoort te doen.

         Nacht gaat daarom vanzelf uit zodra er iets gekozen wordt dat de
         nachtopname niet kan tonen. Dat is precies de romp- en opbouwkleur, en
         een startpunt omdat dat allebei in een klik zet. Model en dekvorm
         blijven wel in de nacht staan: daarvan is er een opname per
         combinatie, dus die keuze is er gewoon te zien. De knop blijft staan,
         dus terug naar de avond is een klik. */
      if (st.nacht && (g === 'rompkleur' || g === 'opbouw' || g === 'startpunt')) {
        st.nacht = false;
        var nachtUit = document.getElementById('nachtKnop');
        if (nachtUit) nachtUit.setAttribute('aria-pressed', 'false');
      }
      ververs(HANGT_SAMEN[g] || [g]);
      meld('gewijzigd');
    });

    document.getElementById('profielBtn').addEventListener('click', function () {
      window.NGJachtProfiel.open(st, D);
    });
    /* Dossier: eerst een nette preview waarin de klant alles controleert,
       daarna pas kiezen: echte PDF downloaden, delen, doorsturen of terug.
       De preview toont exact dezelfde bladen als het afdrukbare dossier —
       één bron, dus de preview kan nooit iets anders beweren dan de PDF. */
    function dossierPreview() {
      var url = location.origin + location.pathname + '?c=' + encodeURIComponent(naarCode());
      /* In het dossier en de QR-code hoort altijd het echte webadres, ook als
         het dossier op een testomgeving wordt aangemaakt: de link moet het bij
         de klant thuis doen, niet alleen op de machine waar hij ontstond. */
      var dossierUrl = (D.werf && D.werf.web ? 'https://' + D.werf.web + location.pathname : location.origin + location.pathname)
        + '?c=' + encodeURIComponent(naarCode());
      var oud = document.getElementById('dossierVoorbeeld');
      if (oud) oud.parentNode.removeChild(oud);

      var wrap = document.createElement('div');
      wrap.id = 'dossierVoorbeeld';
      wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
      wrap.setAttribute('aria-label', T('Jouw jachtdossier'));
      wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#26241f;display:flex;flex-direction:column';

      var balk = document.createElement('div');
      balk.style.cssText = 'flex:0 0 auto;display:flex;flex-wrap:wrap;gap:8px;align-items:center;' +
        'justify-content:space-between;padding:10px 16px;background:#111;color:#fff;font:14px/1.3 inherit';
      balk.innerHTML = '<b style="font-size:13px">Controleer je jachtdossier</b>' +
        '<span style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="btn" id="dvPdf">Download PDF</button>' +
        '<button type="button" class="btn btn--ghost" id="dvDeel">Deel configuratie</button>' +
        '<a class="btn btn--ghost" id="dvStuur" href="#">Verstuur naar jachtspecialist</a>' +
        '<button type="button" class="btn btn--ghost" id="dvTerug">Terug naar configurator</button></span>';

      var frame = document.createElement('iframe');
      frame.title = 'Voorbeeld van je jachtdossier';
      frame.style.cssText = 'flex:1 1 auto;width:100%;border:0;background:#26241f';
      /* het voorbeeld loopt niet via NGAfdruk maar rechtstreeks in een
         iframe, dus de vertaling moet hier apart gebeuren */
      frame.srcdoc = (window.NGTaal && window.NGTaal.vertaalHtml)
        ? window.NGTaal.vertaalHtml(window.NGJachtDossier.rapportHtml(st, D, url))
        : window.NGJachtDossier.rapportHtml(st, D, url);

      wrap.appendChild(balk); wrap.appendChild(frame);
      document.body.appendChild(wrap);
      var scrollWas = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      function weg() {
        document.body.style.overflow = scrollWas;
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        document.removeEventListener('keydown', esc);
      }
      function esc(e) { if (e.key === 'Escape') weg(); }
      document.addEventListener('keydown', esc);
      balk.querySelector('#dvTerug').addEventListener('click', weg);
      /* De aanvraag gaat naar de eigen jachtpagina en niet meer naar de algemene
         contactpagina. Die las de meegestuurde samenstelling namelijk nergens uit
         en stelde bovendien vragen over softwareproblemen — wie net een jacht van
         miljoenen had samengesteld, kreeg een formulier over spreadsheets. */
      balk.querySelector('#dvStuur').href = './jachtaanvraag.html?c=' + encodeURIComponent(naarCode()) +
        (document.documentElement.lang === 'en' ? '&taal=en' : '');
      balk.querySelector('#dvDeel').addEventListener('click', function () {
        var knop = this;
        meld('gedeeld');
        var klaar = function () { knop.textContent = T('Link gekopieerd'); setTimeout(function () { knop.textContent = T('Deel configuratie'); }, 2200); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(klaar, function () { prompt(T('Kopieer deze link:'), url); });
        else prompt(T('Kopieer deze link:'), url);
      });
      balk.querySelector('#dvPdf').addEventListener('click', function () {
        var knop = this, tekst = knop.textContent;
        knop.disabled = true;
        laadDossierGereedschap(function (gelukt) {
          if (!gelukt) {
            knop.textContent = T('Downloaden mislukt');
            setTimeout(function () { knop.textContent = tekst; knop.disabled = false; }, 2600);
            return;
          }
          meld('dossier');
          window.NGJachtPDF.download(st, D, { code: naarCode(), url: dossierUrl }, function () { knop.disabled = false; });
        });
      });
      /* de printkop in het voorbeeld is hier dubbelop */
      frame.addEventListener('load', function () {
        try { var k = frame.contentDocument.querySelector('body > header'); if (k) k.style.display = 'none'; }
        catch (e) { /* nooit op laten vallen */ }
      });
    }
    /* Het PDF-gereedschap weegt 0,7 MB: jsPDF zelf, de ingesloten
       huisstijlletters, de QR-generator en de dossierbouwer. Die stonden in de
       kop van de pagina en werden dus door élke bezoeker gedownload, terwijl
       alleen wie het dossier opent ze nodig heeft. Nu komen ze op dat moment.

       De vier bestanden gaan om beurten en op volgorde: de letters registreren
       zich in jsPDF, dus die moet er eerst zijn. Omdat het laden pas ná het
       load-event van de pagina gebeurt, haakt de eigen wachtconstructie van het
       lettertypebestand niet meer aan; daarom roepen we hier zelf registreren
       aan. Alles wordt één keer geladen en daarna onthouden. */
    var pdfGereed = null;
    function laadDossierGereedschap(klaar) {
      if (pdfGereed !== null) return klaar(pdfGereed);
      var lijst = ['./assets/vendor/jspdf.umd.min.js',
                   './assets/jacht-dossier-fonts.js',
                   './assets/vendor/qrcode-generator.js',
                   './assets/jachtdossier-pdf.js'];
      (function volgende(i) {
        if (i >= lijst.length) {
          if (window.NGDossierFonts) window.NGDossierFonts.geregistreerd();
          pdfGereed = !!(window.NGJachtPDF && window.jspdf);
          return klaar(pdfGereed);
        }
        var s = document.createElement('script');
        s.src = lijst[i];
        s.onload = function () { volgende(i + 1); };
        s.onerror = function () { pdfGereed = false; klaar(false); };
        document.head.appendChild(s);
      })(0);
    }

    /* Wie het voorbeeld opent, wil daarna meestal downloaden. Het laden begint
       daarom al bij het openen van het voorbeeld, zodat de knop later niet
       hoeft te wachten. */
    function dossierMetVoorbereiding() {
      laadDossierGereedschap(function () { /* stil: de knop meldt het wel */ });
      dossierPreview();
      meld('voorbeeld');
    }
    document.getElementById('dossierBtn').addEventListener('click', dossierMetVoorbereiding);
    document.getElementById('sbDossier').addEventListener('click', dossierMetVoorbereiding);

    /* Tik of klik op het beeld: schermvullend bekijken. Op een telefoon is
       het doek maar een strook; schermvullend — en zeker gedraaid naar
       liggend — komt de render pas echt tot zijn recht. Werkt ook voor de
       getekende aanzichten. */
    /* De ruimtestrook staat in hetzelfde doek, dus die klik moet eerst worden
       afgevangen — anders valt hij door naar het vergrootglas hieronder. */
    document.getElementById('doek').addEventListener('click', function (e) {
      var knop = e.target.closest ? e.target.closest('.ruimte') : null;
      if (!knop) return;
      e.stopPropagation();
      ruimte = knop.dataset.ruimte;
      tekenDoek();
    });
    /* De lichtstrook op het materiaalblad is bedienbaar: klikken op een van de
       vier zet die lichtstand. Dat is dezelfde keuze als in het paneel rechts,
       maar hier zie je meteen waar je op klikt - en dat is het hele punt van
       vier beelden naast elkaar.

       Deze afhandelaar staat vóór het vergrootglas hieronder, want een klik op
       een lichttegel is een keuze en geen verzoek om hem groot te zien. */
    document.getElementById('doek').addEventListener('click', function (e) {
      var k = e.target.closest ? e.target.closest('.kamer__licht__k') : null;
      if (!k) return;
      e.stopPropagation();
      if (st.verlichting === k.dataset.waarde) return;
      st.verlichting = k.dataset.waarde;
      ververs(['verlichting']);
      meld('gewijzigd');
    });
    document.getElementById('doek').addEventListener('click', function (e) {
      if (e.target.closest && (e.target.closest('.ruimte') || e.target.closest('.kamer__licht__k'))) return;
      var bron = e.target && e.target.tagName === 'IMG' ? e.target
               : (e.target.closest ? e.target.closest('svg') : null);
      if (!bron) return;
      var laag = document.createElement('div');
      laag.className = 'beeldgroot';
      laag.setAttribute('role', 'dialog');
      laag.setAttribute('aria-label', 'Vergrote weergave van je jacht');
      if (bron.tagName === 'IMG') {
        var groot = document.createElement('img');
        groot.src = bron.src; groot.alt = bron.alt || '';
        laag.appendChild(groot);
      } else {
        laag.appendChild(bron.cloneNode(true));
      }
      var hint = document.createElement('p');
      hint.className = 'beeldgroot__hint mono';
      hint.innerHTML = '<span class="beeldgroot__hint--draai">Draai je telefoon voor het grootste beeld &middot; </span>Tik of klik om te sluiten';
      laag.appendChild(hint);
      var scrollWas = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      function dicht() {
        document.body.style.overflow = scrollWas;
        if (laag.parentNode) laag.parentNode.removeChild(laag);
        document.removeEventListener('keydown', esc);
      }
      function esc(ev) { if (ev.key === 'Escape') dicht(); }
      laag.addEventListener('click', dicht);
      document.addEventListener('keydown', esc);
      document.body.appendChild(laag);
    });
    if (D.audit) D.audit();     /* beheerdersmeldingen over ontbrekende modelgegevens */

    /* Vergelijken: één samenstelling vastleggen, doorschuiven naar een
       andere, en de twee naast elkaar zien met de verschillen gemarkeerd.
       De vastgelegde blijft in de browser bewaard, dus ook morgen nog. */
    var vastgelegd = null;
    try { vastgelegd = JSON.parse(localStorage.getItem('ng-jacht-vgl') || 'null'); } catch (e) { /* privémodus */ }
    function zetVergelijkKnop() {
      var b = document.getElementById('vglBtn');
      b.disabled = !vastgelegd;
      b.textContent = vastgelegd ? 'Vergelijk met vastgelegde' : 'Vergelijk';
    }
    document.getElementById('vastBtn').addEventListener('click', function () {
      vastgelegd = JSON.parse(JSON.stringify(st));
      try { localStorage.setItem('ng-jacht-vgl', JSON.stringify(vastgelegd)); } catch (e) { /* dan alleen deze sessie */ }
      zetVergelijkKnop();
      var knop = this;
      knop.textContent = 'Vastgelegd';
      setTimeout(function () { knop.textContent = 'Leg vast om te vergelijken'; }, 1800);
    });
    document.getElementById('vglBtn').addEventListener('click', function () {
      if (vastgelegd) window.NGJachtDossier.vergelijk(vastgelegd, st, D);
    });
    zetVergelijkKnop();

    /* De tabbladen dragen nu ook de koppeling naar het doek: aria-controls op
       de knop, role="tabpanel" en aria-labelledby op het doek. Een schermlezer
       kondigt daardoor aan hoeveel aanzichten er zijn, het hoeveelste u bekijkt
       en welk beeld erbij hoort — voorheen waren het zeven losse knoppen zonder
       verband. Bij de wissel verhuist ook de naam van het paneel mee. */
    function zetAanzicht(a) {
      aanzicht = a;
      /* Het optieblad hoort niet permanent in de rij te staan — er is pas een
         optie om te tonen zodra iemand er een aanvinkt. Hij verschijnt dus met
         de naam van die optie erop en verdwijnt weer bij het eerste andere
         tabblad, zodat de rij niet volloopt met bladen die nergens heen gaan. */
      var optieTab = document.getElementById('tabOptie');
      if (optieTab) {
        if (a === 'optie' && optieToon) {
          var r = vind(D.opties, optieToon);
          optieTab.textContent = r ? r.l : optieToon;
          optieTab.hidden = false;
        } else {
          optieTab.hidden = true;
          if (a !== 'optie') optieToon = null;
        }
      }
      var actief = null;
      document.querySelectorAll('.tab[data-aanzicht]:not([hidden])').forEach(function (x) {
        var aan = x.dataset.aanzicht === a;
        x.setAttribute('aria-selected', aan ? 'true' : 'false');
        /* Roving tabindex: binnen een tablist hoort één stop te zitten. De
           pijltjestoetsen lopen de rest langs, zoals een schermlezergebruiker
           dat van tabbladen verwacht. */
        x.setAttribute('tabindex', aan ? '0' : '-1');
        if (aan) actief = x;
      });
      var paneel = document.getElementById('doek');
      if (paneel && actief) paneel.setAttribute('aria-labelledby', actief.id);
    }
    document.querySelector('.tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (!b || !b.dataset.aanzicht) return;
      zetAanzicht(b.dataset.aanzicht);
      tekenDoek();
    });
    /* Pijltjestoetsen door de aanzichten, Home en End naar de uiteinden. Dat is
       hoe tabbladen horen te werken en de enige manier waarop iemand die geen
       muis gebruikt hier vlot doorheen komt. */
    document.querySelector('.tabs').addEventListener('keydown', function (e) {
      var b = e.target.closest('.tab[data-aanzicht]:not([hidden])');
      if (!b) return;
      var lijst = [].slice.call(document.querySelectorAll('.tab[data-aanzicht]:not([hidden])'));
      var i = lijst.indexOf(b), naar = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') naar = (i + 1) % lijst.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') naar = (i - 1 + lijst.length) % lijst.length;
      else if (e.key === 'Home') naar = 0;
      else if (e.key === 'End') naar = lijst.length - 1;
      if (naar < 0) return;
      e.preventDefault();
      zetAanzicht(lijst[naar].dataset.aanzicht);
      tekenDoek();
      lijst[naar].focus();
    });
    document.getElementById('nachtKnop').addEventListener('click', function () {
      st.nacht = !st.nacht;
      this.setAttribute('aria-pressed', st.nacht ? 'true' : 'false');
      tekenDoek();
    });

    /* De samenstelling in de adresbalk, zodat een koper hem kan doorsturen
       naar zijn partner of makelaar en de werf hem terugkrijgt zoals hij
       bedoeld was. De beste configurator in dit segment biedt alleen een
       PDF; een link werkt in elk gesprek. */
    var VELDEN = ['model', 'rompkleur', 'opbouw', 'dek', 'dekafwerking',
                  'interieurhout', 'stoffering', 'motorisering',
                  /* De vijf interieurafwerkingen kwamen er later bij en staan
                     daarom achteraan: een link uit de tijd ervoor heeft acht
                     velden en moet blijven werken. Achteraan aanvullen kan dat;
                     ertussen schuiven zou elke bestaande link stilletjes
                     verschuiven - dan wordt walnoot ineens een dektype. */
                  'vloer', 'wandafwerking', 'marmer', 'metaal', 'verlichting'];
    /* Zoveel velden had de code voordat het interieur uitbreidde. Een kortere
       code wordt aangevuld met de standaardafwerkingen; korter dan dit is geen
       code van ons. */
    var VELDEN_KERN = 8;
    /* Welke lijst hoort bij welk veld — nodig om elke waarde uit een link te
       kunnen toetsen voordat hij de stand in gaat. */
    var VELD_LIJST = { model: 'modellen', rompkleur: 'rompkleuren', opbouw: 'opbouw',
                       dek: 'dekken', dekafwerking: 'dekafwerking',
                       interieurhout: 'interieurhout', stoffering: 'stoffering',
                       motorisering: 'motorisering', vloer: 'vloer',
                       wandafwerking: 'wandafwerking', marmer: 'marmer',
                       metaal: 'metaal', verlichting: 'verlichting' };
    function geldig(veld, waarde) {
      return D[VELD_LIJST[veld]].some(function (x) { return x.v === waarde; });
    }

    function naarCode() {
      /* Het scheidingsteken voor de opties komt er alleen als er opties zíjn.
         De oude vorm plakte altijd een '~' achteraan, dus elke gedeelde link
         zonder opties eindigde op "standaard~" — dat oogt als een fout en
         was het ook. De opties staan bovendien in de vaste volgorde van de
         optielijst, zodat dezelfde samenstelling altijd dezelfde code geeft. */
      var kern = VELDEN.map(function (f) { return st[f]; }).join('.');
      var volgorde = D.opties.map(function (o) { return o.v; });
      var opties = st.opties.slice().sort(function (a, b) {
        return volgorde.indexOf(a) - volgorde.indexOf(b);
      });
      return opties.length ? kern + '~' + opties.join(',') : kern;
    }
    function uitCode(code) {
      if (!code) return;
      /* Alles wat geen code-teken is gaat eruit voordat er ontleed wordt;
         een link met een bungelende '~' of een meegekopieerd leesteken
         blijft zo gewoon werken. */
      var schoon = String(code).replace(/[^a-z0-9.,~-]/gi, '').replace(/~+$/, '');
      var stuk = schoon.split('~');
      var d = stuk[0].split('.').filter(function (x) { return x !== ''; });
      if (d.length < VELDEN_KERN || d.length > VELDEN.length) return;
      /* Elke waarde wordt tegen zijn eigen lijst gehouden: een onbekende of
         verouderde waarde wordt genegeerd en valt terug op de standaard,
         in plaats van de configurator een niet-bestaande keuze in te duwen. */
      VELDEN.forEach(function (f, i) { if (d[i] && geldig(f, d[i])) st[f] = d[i]; });
      /* Een oude link zwijgt over de vijf afwerkingen. Zwijgen is hier de
         standaarduitvoering en niet 'onbekend': de stand die al in `st` staat
         blijft dus gewoon staan. */
      st.opties = (stuk[1] || '').split(',').filter(function (o) {
        return o && D.opties.some(function (x) { return x.v === o; });
      });
    }
    function schrijfUrl() {
      try { history.replaceState(null, '', location.pathname + '?c=' + encodeURIComponent(naarCode())); }
      catch (e) { /* oudere browser: dan zonder */ }
      /* De offerteknop draagt de samenstelling mee, zodat de aanvraag bij de
         werf binnenkomt zoals hij is samengesteld — niet als los berichtje. */
      var knop = document.getElementById('offerteBtn');
      if (knop) knop.href = './contact.html?samenstelling=' + encodeURIComponent(naarCode());
      /* Eén keer aanhaken en niet bij elke hertekening opnieuw: schrijfUrl()
         draait na elke keuze, en een luisteraar per keuze zou de offerte
         twintig keer tellen bij één klik. */
      if (knop && !knop.dataset.gemeten) {
        knop.dataset.gemeten = 'ja';
        knop.addEventListener('click', function () { meld('offerte'); });
      }
    }
    document.getElementById('deelBtn').addEventListener('click', function () {
      var knop = this;
      meld('gedeeld');
      var url = location.origin + location.pathname + '?c=' + encodeURIComponent(naarCode());
      var klaar = function () { knop.textContent = T('Link gekopieerd'); setTimeout(function () { knop.textContent = 'Kopieer deelbare link'; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(klaar, function () { prompt(T('Kopieer deze link:'), url); });
      else prompt(T('Kopieer deze link:'), url);
    });

    /* ---------- eenheden en valuta ----------
       Twee knoppenrijtjes boven de maatstrook: meter of voet, en in welke munt
       de bedragen staan. De keuze wordt in de browser onthouden en gaat NIET
       mee in de deelbare code: hij zegt niets over het schip dat besteld
       wordt, net zomin als welke ruimte er op het interieurblad staat.

       De maten en bedragen zitten door de hele pagina heen - de maatstrook,
       de prijsbalk, de samenbalk, de modeltegels, de tekeningen - dus na een
       wissel wordt gewoon alles opnieuw getekend. Dat kost een paar
       milliseconden en het spaart een lijst van plekken die iemand ooit
       vergeet bij te werken. */
    function tekenEenheden() {
      var el = document.getElementById('eenheden');
      if (!el || !E) return;
      function rij(label, keuzes, nu, soort) {
        return '<span class="eh"><span class="eh__l">' + esc(T(label)) + '</span>' +
          keuzes.map(function (k) {
            return '<button type="button" class="eh__k" data-soort="' + soort + '" data-waarde="' +
              esc(k[0]) + '" aria-pressed="' + (k[0] === nu ? 'true' : 'false') + '"' +
              (k[2] ? ' title="' + esc(k[2]) + '"' : '') + '>' + esc(k[1]) + '</button>';
          }).join('') + '</span>';
      }
      el.innerHTML =
        rij('Maten', [['metrisch', T('meter'), T('meters, liters en tonnen')],
                      ['imperiaal', T('voet'), T('voeten, gallons en long tons')]],
            E.stelsel(), 'stelsel') +
        rij('Valuta', E.munten().map(function (mu) {
              return [mu.v, mu.v, mu.v === 'EUR'
                ? T('de contractvaluta van de werf')
                : T('omgerekend tegen de koers van ') + E.peildatum()];
            }), E.munt(), 'munt');
    }
    var ehBalk = document.getElementById('eenheden');
    if (ehBalk) ehBalk.addEventListener('click', function (e) {
      var k = e.target.closest('.eh__k');
      if (!k) return;
      if (k.dataset.soort === 'stelsel') E.zetStelsel(k.dataset.waarde);
      else E.zetMunt(k.dataset.waarde);
    });
    window.addEventListener('ng-eenheden', function () { tekenEenheden(); ververs('alles'); });

    try {
      var q = new URLSearchParams(location.search).get('c');
      if (q) uitCode(q);
    } catch (e) { /* geen geldige parameter: dan de standaardsamenstelling */ }

    tekenEenheden();
    ververs('alles');
    window.NGJachtKeuze = function () { return JSON.parse(JSON.stringify(st)); };
    /* Ná NGJachtKeuze, want de meting leest de stand daaruit uit. Andersom
       zou de eerste regel leeg zijn en zou het dashboard elk bezoek als
       "geen model gekozen" tellen. */
    meld('gestart');
  })();
