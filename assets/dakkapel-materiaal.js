/* Van dakkapelconfiguratie naar materiaalstaat — de werkvoorbereiding vooraf.
 *
 * Dezelfde rol als assets/materiaalstaat.js bij de uitbouw en de dakopbouw, en
 * met opzet dezelfde uitvoer ({invoer, posten, aannames, controle}), zodat het
 * afdrukblad en de offertemail er hetzelfde mee omgaan.
 *
 * WAAROM EEN EIGEN MODULE EN GEEN SCHAKELAAR IN DE BESTAANDE
 * Die rekent een doos op de grond of op een woning: breedte maal diepte maal
 * hoogte, met een vloer, een fundering of een balklaag eronder. Een dakkapel
 * heeft dat allemaal niet. Hij staat ín het schuine dakvlak: er gaat een gat in
 * de kap, er komt een raveling omheen, hij heeft twee wangen en een voorwand,
 * en de aansluiting op het dak is lood- en zetwerk in plaats van metselwerk.
 * Dat als vlaggetje in de bestaande module hangen zou van bijna elke post een
 * uitzondering maken.
 *
 * DE BREEDTE IS EEN REKENMAAT, GEEN TOEZEGGING
 * De configurator laat met opzet geen metermaat zien: welke breedte technisch
 * bij welke kozijnindeling hoort, moet de fabrikant nog bevestigen. Maar een
 * bestellijst zonder maat is geen bestellijst. Daarom staat de rekenmaat hier
 * op één plek (REKENBREEDTE), komt hij bovenaan het blad te staan als aanname,
 * en is hij het eerste wat vervangen moet worden zodra de maatvoering vastligt.
 * Wie de maat aanpast, past hem hier aan — niet op de bouw.
 *
 * WAT DIT WEL EN NIET IS
 * Werkvoorbereiding: hoeveelheden om mee in te kopen en te calculeren. Geen
 * productiestuklijst en geen constructieberekening. De raveling, de sporen en
 * de belasting op de kap staan met een indicatief profiel in de staat en komen
 * allemaal terug onder `controle` — die horen door de constructeur bevestigd te
 * worden vóór er besteld wordt.
 *
 * DE OPBOUW ZOALS WIJ HEM BOUWEN
 * Stijl- en regelwerk SLS 144 × 38 mm, PIR 140 mm in wangen, voorwand én dak,
 * dampdichte folie binnen en dampopen folie buiten. Gelijk aan de uitbouw en de
 * dakopbouw, zodat een timmerman op alle drie dezelfde opbouw aantreft. Wand en
 * dak komen daarmee op Rc ≈ 6,0 en zitten boven de nieuwbouweis.
 */
(function (global) {
  'use strict';

  /* Snijverlies: niet het stuk dat voor de zekerheid meekomt, maar het stuk dat
     in de container belandt. Gelijkgehouden aan materiaalstaat.js. */
  var VERLIES = {
    plaat: 1.10,
    isolatiePlaat: 1.07,
    hout: 1.08,
    folie: 1.15,
    epdm: 1.12,
    bekleding: 1.10,
    lood: 1.10
  };

  /* Rekenmaten. Alles wat hier staat is een aanname en verschijnt als zodanig
     bovenaan het blad.

     De breedte per indeling gaat uit van ongeveer 0,70 m per glasvak plus de
     stijlen en de wangen: een driedelige dakkapel komt zo op 2,30 m, wat een
     gangbare maat is voor een rijtjeswoning. */
  var REKENBREEDTE = { 2: 1.60, 3: 2.30, 4: 3.00, 5: 3.70, 6: 4.40 };
  var DIEPTE = 1.20;          // voorwand tot aansluiting op het dakvlak
  var HOOGTE_VOOR = 1.50;     // voorwand, boeideel meegerekend
  var HOOGTE_KOZIJN = 1.15;   // dagmaat van de doorlopende kozijnconstructie
  var DAKHELLING = 45;        // graden; bepaalt de lengte van de dakopening

  function n(x) { return Math.round(x * 100) / 100; }
  function omhoog(x) { return Math.ceil(x); }
  function nl(x) {
    return (Math.round(x * 100) / 100).toLocaleString('nl-NL',
      { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  /* Raveelprofiel. De raveelbalk draagt de sporen die zijn doorgezaagd, dus
     zijn overspanning is de breedte van het gat. Indicatief en altijd te
     bevestigen: bij een gordingenkap of een pan met veel gewicht valt hij
     zwaarder uit. */
  function raveelProfiel(breedte) {
    if (breedte <= 2.0) return 'gelamineerd 63 × 200 mm';
    if (breedte <= 3.0) return 'gelamineerd 63 × 240 mm';
    if (breedte <= 4.0) return 'LVL 75 × 260 mm';
    return 'LVL 75 × 300 mm';
  }

  /* Glasverdeling. De configurator zet de draaiende delen in de buitenste
     vakken; hier telt alleen hoeveel er draaien en hoeveel vast zijn. */
  function glasvlakken(vakken, draaiend, breedte) {
    var netto = breedte - 0.10;                 // stijlen en aanslag eraf
    var perVak = netto / vakken;
    return { draai: draaiend, vast: vakken - draaiend,
             perVak: n(perVak), oppervlak: n(netto * HOOGTE_KOZIJN) };
  }

  var GEVELNAAM = {
    creme: 'Kunststof gevelbekleding crème (RAL 9001)',
    lichtgrijs: 'Kunststof gevelbekleding lichtgrijs (RAL 7035)',
    antraciet: 'Kunststof gevelbekleding antraciet (RAL 7016)',
    zwart: 'Kunststof gevelbekleding zwart (RAL 9005)',
    thermowood: 'Thermowood gevelbekleding, verticaal geschroefd',
    'zink-platen': 'Zinken vlakke platen op onderconstructie'
  };
  var KOZIJNNAAM = {
    wit: 'wit (RAL 9016)', creme: 'crème (RAL 9001)',
    antraciet: 'antraciet (RAL 7016)', zwart: 'zwart (RAL 9005)'
  };

  /**
   * Bouwt de materiaalstaat op uit de configuratiestaat van de dakkapel.
   * @param cfg {glasvakken, afwerking, kozijnkleur, draaiend, uitvoering,
   *             dakvlak, opties{}, extras{}}
   */
  function materiaalstaat(cfg) {
    cfg = cfg || {};
    var vakken = cfg.glasvakken || 3;
    var breedte = REKENBREEDTE[vakken] || REKENBREEDTE[3];
    var prefab = cfg.uitvoering !== 'traditioneel';
    var opties = cfg.opties || {};
    var extras = cfg.extras || {};
    var draaiend = Math.min(cfg.draaiend || 0, vakken);

    var hoek = DAKHELLING * Math.PI / 180;
    /* De dakopening loopt schuin mee met de kap: bij 45° is de schuine lengte
       de diepte gedeeld door de cosinus, dus ruim 1,7 m. */
    var openingSchuin = n(DIEPTE / Math.cos(hoek));
    var opening = n(breedte * openingSchuin);
    var dakOpp = n(breedte * DIEPTE);
    var wangOpp = n(2 * ((HOOGTE_VOOR + (HOOGTE_VOOR - DIEPTE * Math.tan(hoek))) / 2) * DIEPTE);
    var glas = glasvlakken(vakken, draaiend, breedte);
    var voorwandBruto = n(breedte * HOOGTE_VOOR);
    var voorwandNetto = n(Math.max(voorwandBruto - glas.oppervlak, 0.4));

    var posten = [], aannames = [], controle = [];
    function post(groep, omschrijving, hoeveelheid, eenheid, opmerking) {
      posten.push({ groep: groep, omschrijving: omschrijving,
                    hoeveelheid: n(hoeveelheid), eenheid: eenheid,
                    opmerking: opmerking || '' });
    }

    /* ---------- uitgangspunten ---------- */
    aannames.push('Breedte gerekend op ' + nl(breedte) + ' m bij ' + vakken +
      ' glasvakken. Dit is een rekenmaat: de werkelijke breedte volgt uit het ' +
      'inmeten en uit de indeling die de fabrikant per maat vrijgeeft.');
    aannames.push('Dakhelling gerekend op ' + DAKHELLING + '°, diepte ' + nl(DIEPTE) +
      ' m en voorwandhoogte ' + nl(HOOGTE_VOOR) + ' m, binnen de 1,75 m die ' +
      'vergunningsvrij op het achterdakvlak is toegestaan.');
    aannames.push('Uitgegaan van een sporenkap met dakbeschot. Bij een ' +
      'gordingenkap verandert de raveling en daarmee het houtwerk.');

    /* ---------- sloopwerk ----------
       Het gat in de kap is de eerste post en meteen de reden dat een dakkapel
       geen klus van een middag is: pannen eraf, latten eraf, beschot eruit. */
    post('Sloopwerk', 'Dakpannen verwijderen en afvoeren', opening, 'm²',
         'ca. ' + omhoog(opening * 12) + ' pannen; hele exemplaren bewaren voor de aansluiting');
    post('Sloopwerk', 'Panlatten en tengels verwijderen', opening, 'm²', '');
    post('Sloopwerk', 'Dakbeschot uitzagen', opening, 'm²', '');
    post('Sloopwerk', 'Sporen doorzagen op de raveelmaat', omhoog(breedte / 0.6) - 1, 'st',
         'h.o.h. 600 mm aangehouden');
    post('Sloopwerk', 'Afvoer sloopafval', n(opening * 0.08), 'm³', 'exclusief containerhuur');

    /* ---------- constructie ----------
       De raveling is het hart van een dakkapel: de doorgezaagde sporen hangen
       eraan. Alles hier is indicatief en staat daarom ook onder `controle`. */
    var prof = raveelProfiel(breedte);
    post('Constructie', 'Raveelbalk boven, ' + prof, 1, 'st',
         'lengte ' + nl(breedte + 0.3) + ' m, incl. 150 mm oplegging per zijde');
    post('Constructie', 'Raveelbalk onder, ' + prof, 1, 'st',
         'lengte ' + nl(breedte + 0.3) + ' m');
    post('Constructie', 'Verzwaarde sporen links en rechts (gekoppeld)', 2, 'st',
         'lengte ' + nl(openingSchuin + 0.8) + ' m per zijde');
    post('Constructie', 'Balkschoenen en hoekankers', 8, 'st', 'verzinkt, incl. ankernagels');
    post('Constructie', 'Constructieschroeven 8 × 200 mm', omhoog(breedte * 14), 'st', '');
    post('Constructie', 'Onderregel op het dakbeschot, SLS 144 × 38 mm',
         n(breedte * VERLIES.hout), 'm¹', '');
    controle.push('Profiel en oplegging van de raveelbalken volgen uit een ' +
      'constructieberekening: de doorgezaagde sporen hangen eraan.');
    controle.push('Of de bestaande kap het extra gewicht draagt, wordt bij het ' +
      'inmeten beoordeeld, zeker bij een gordingenkap of een oude sporenkap.');

    /* ---------- voorwand en wangen ---------- */
    var stijlLengte = n((omhoog(breedte / 0.6) + 1) * HOOGTE_VOOR + 3 * breedte);
    post('Voorwand', 'Stijl- en regelwerk SLS 144 × 38 mm',
         n(stijlLengte * VERLIES.hout), 'm¹', 'stijlen h.o.h. 600 mm, incl. boven- en onderregel');
    post('Voorwand', 'PIR 140 mm', n(voorwandNetto * VERLIES.isolatiePlaat), 'm²', 'Rc ≈ 6,0');
    post('Voorwand', 'Dampremmende folie binnenzijde', n(voorwandBruto * VERLIES.folie), 'm²', '');
    post('Voorwand', 'Dampopen folie buitenzijde', n(voorwandBruto * VERLIES.folie), 'm²', '');
    post('Voorwand', 'Beplating buitenzijde 18 mm', n(voorwandNetto * VERLIES.plaat), 'm²', '');

    post('Zijwangen', 'Stijl- en regelwerk SLS 144 × 38 mm',
         n((2 * (HOOGTE_VOOR * 2 + DIEPTE * 2)) * VERLIES.hout), 'm¹', 'beide wangen');
    post('Zijwangen', 'PIR 140 mm', n(wangOpp * VERLIES.isolatiePlaat), 'm²', '');
    post('Zijwangen', 'Beplating binnen- en buitenzijde 18 mm',
         n(wangOpp * 2 * VERLIES.plaat), 'm²', '');
    post('Zijwangen', 'Dampremmende en dampopen folie', n(wangOpp * 2 * VERLIES.folie), 'm²', '');

    /* ---------- dak ---------- */
    post('Dak', 'Dakbalken SLS 195 × 45 mm', n((omhoog(breedte / 0.6) + 1) * (DIEPTE + 0.25) * VERLIES.hout),
         'm¹', 'h.o.h. 600 mm, incl. overstek');
    post('Dak', 'Dakbeschot multiplex 18 mm', n((dakOpp + breedte * 0.25) * VERLIES.plaat), 'm²', '');
    post('Dak', 'PIR 140 mm', n(dakOpp * VERLIES.isolatiePlaat), 'm²', 'Rc ≈ 6,0');
    post('Dak', 'EPDM dakbedekking incl. opstanden', n(dakOpp * VERLIES.epdm), 'm²',
         'eendelig, geen naden in het vlak');
    post('Dak', 'Daktrim aluminium', n((breedte + 2 * DIEPTE) * VERLIES.hout), 'm¹', '');
    post('Dak', 'Boeideel, beplating + afwerking', n(breedte * 0.3 * VERLIES.plaat), 'm²', '');

    /* ---------- kozijn en glas ----------
       Eén doorlopende constructie over de voorkant; de stijlen verdelen het
       glas. Dat is de productregel uit de configurator en het is hier ook de
       manier waarop besteld wordt: één kozijn, niet een reeks losse ramen. */
    post('Kozijn', 'Doorlopende kunststof kozijnconstructie ' + nl(breedte) + ' × ' +
         nl(HOOGTE_KOZIJN) + ' m, ' + KOZIJNNAAM[cfg.kozijnkleur || 'wit'], 1, 'st',
         vakken + ' vakken, tussenstijlen inbegrepen');
    if (glas.draai) {
      post('Kozijn', 'Draaikiepvleugel incl. beslag', glas.draai, 'st',
           'ca. ' + nl(glas.perVak) + ' × ' + nl(HOOGTE_KOZIJN) + ' m per stuk');
    }
    if (glas.vast) {
      post('Kozijn', 'Vast glasvak', glas.vast, 'st',
           'ca. ' + nl(glas.perVak) + ' × ' + nl(HOOGTE_KOZIJN) + ' m per stuk');
    }
    var glassoort = extras.triple ? 'Triple glas (Ug 0,6)' : 'HR++ beglazing (Ug 1,1)';
    post('Kozijn', glassoort, n(glas.oppervlak * 1.05), 'm²', 'inclusief inbouwverlies');
    if (extras.horren && glas.draai) {
      post('Kozijn', 'Inzethor op maat', glas.draai, 'st', 'op de draaiende delen');
    }

    /* ---------- gevelafwerking ----------
       Wangen en boeideel krijgen dezelfde afwerking; dat is wat de dakkapel van
       de straat af één geheel maakt. */
    var bekledingOpp = n(wangOpp + breedte * 0.3 + voorwandNetto);
    post('Gevelafwerking', GEVELNAAM[cfg.afwerking] || GEVELNAAM.antraciet,
         n(bekledingOpp * VERLIES.bekleding), 'm²', 'wangen, boeideel en voorwand');
    post('Gevelafwerking', 'Hoek- en aansluitprofielen',
         n((HOOGTE_VOOR * 4 + breedte * 2) * VERLIES.hout), 'm¹', '');
    if (cfg.afwerking === 'zink-platen') {
      post('Gevelafwerking', 'Onderconstructie zink, geventileerd', n(bekledingOpp), 'm²',
           'zink vraagt achterventilatie');
      controle.push('Zink en lood mogen elkaar niet raken: de detaillering van de ' +
        'aansluiting op het loodwerk vooraf vastleggen.');
    }
    if (cfg.afwerking === 'thermowood') {
      post('Gevelafwerking', 'RVS bevestiging thermowood', omhoog(bekledingOpp * 22), 'st',
           'RVS: thermowood tast verzinkt staal aan');
    }

    /* ---------- lood- en zetwerk ----------
       Waar de dakkapel het dakvlak raakt. Dit is de post waar een dakkapel gaat
       lekken als hij niet klopt, en de reden dat de aansluiting altijd door de
       dakdekker gaat en niet door de timmerman. */
    post('Lood- en zetwerk', 'Loodslabbe onderaansluiting, code 20',
         n(breedte * VERLIES.lood), 'm¹', 'onder de pannenrij door');
    post('Lood- en zetwerk', 'Loodaansluiting zijkanten, code 20',
         n(2 * openingSchuin * VERLIES.lood), 'm¹', 'in de sponning van de zijpannen');
    post('Lood- en zetwerk', 'Zetwerk aluminium, aansluiting dakrand',
         n((breedte + 2 * DIEPTE) * VERLIES.hout), 'm¹', '');
    post('Lood- en zetwerk', 'Pannen terugleggen en passtukken zagen',
         n(breedte * 1.2), 'm¹', 'rondom de aansluiting');

    /* ---------- opties ---------- */
    if (opties.rolluiken) {
      post('Opties', 'Rolluik met kast, elektrisch bediend', vakken, 'st',
           'ingebouwd boven het kozijn');
      post('Opties', 'Bedieningsschakelaar rolluik', vakken, 'st', '');
    }
    if (opties.screens) {
      post('Opties', 'Screen met cassette, elektrisch bediend', vakken, 'st', '');
      post('Opties', 'Zijgeleiding screen', n(vakken * 2 * HOOGTE_KOZIJN), 'm¹', '');
    }
    if (opties.rooster) {
      post('Opties', 'Doorlopend ventilatierooster', n(breedte), 'm¹',
           'boven het glas, over de volle breedte');
    }
    if (opties.spots) {
      post('Opties', 'LED-spot in het overstek', vakken + 1, 'st', 'IP65');
      post('Opties', 'Bekabeling en trafo spots', n(breedte * 2 + 8), 'm¹', '');
    }

    /* ---------- binnenafwerking ----------
       Drie niveaus, en het verschil is precies wat er bij oplevering te zien
       is: kaal hout, dichtgezet met gipsplaat, of afgewerkt. Elk niveau bouwt
       op het vorige voort, dus de posten stapelen. */
    var binnen = cfg.binnen || 'casco';
    var binnenOpp = n(voorwandNetto + wangOpp + dakOpp);
    if (binnen === 'casco') {
      aannames.push('Casco opgeleverd: de binnenzijde blijft in het zicht: geen ' +
        'gipsplaat, dagkanten, stuc- of schilderwerk in deze staat.');
    } else {
      post('Binnenafwerking', 'Gipsplaat 12,5 mm', n(binnenOpp * VERLIES.plaat), 'm²',
           'wangen, voorwand en plafond');
      post('Binnenafwerking', 'Metalstud of houten regelwerk', n(binnenOpp * 2.2 * VERLIES.hout), 'm¹', '');
      post('Binnenafwerking', 'Schroeven en gipsplaatband', 1, 'post', '');
      if (binnen === 'gipsplaten') {
        aannames.push('Gipsplaten opgeleverd: dichtgezet en klaar om te stucen. ' +
          'Stuc-, schilder- en aftimmerwerk zitten niet in de staat.');
      }
    }
    if (binnen === 'afgewerkt') {
      post('Binnenafwerking', 'Dagkanten en aftimmerlatten',
           n((breedte * 2 + HOOGTE_KOZIJN * 2) * VERLIES.hout), 'm¹', '');
      post('Binnenafwerking', 'Vensterbank', n(breedte * VERLIES.hout), 'm¹', '');
      post('Binnenafwerking', 'Stucwerk', n(binnenOpp), 'm²', 'glad, klasse behangklaar');
      post('Binnenafwerking', 'Schilderwerk, twee lagen', n(binnenOpp), 'm²', '');
    }

    /* ---------- uitvoering ----------
       Prefab en traditioneel verschillen niet in materiaal maar in hoe het op
       het dak komt, en dat is een kostenpost die op de bouw geregeld moet zijn. */
    if (prefab) {
      post('Uitvoering', 'Autolaadkraan, halve dag', 1, 'st',
           'prefab element in één keer op zijn plek');
      post('Uitvoering', 'Transport prefab element', 1, 'st', '');
      aannames.push('Prefab: het element wordt in de werkplaats gebouwd en met een ' +
        'kraan geplaatst. Er moet een kraan bij kunnen staan. Dat wordt bij het ' +
        'inmeten beoordeeld.');
    } else {
      post('Uitvoering', 'Ladderlift, twee dagen', 1, 'st', 'materiaal naar het dak');
      post('Uitvoering', 'Extra arbeidsuren opbouw op locatie', omhoog(breedte * 8), 'uur',
           'ten opzichte van prefab');
      aannames.push('Traditioneel: op het dak zelf opgebouwd, twee tot vijf werkdagen. ' +
        'Het dakvlak staat in die periode open en wordt dagelijks waterdicht afgedekt.');
    }
    post('Uitvoering', 'Rolsteiger of gevelsteiger', 1, 'st', 'huur voor de duur van het werk');
    post('Uitvoering', 'Afdekzeil en tijdelijke waterkering', n(opening * 1.5), 'm²', '');
    post('Uitvoering', 'Kitwerk en bevestigingsmateriaal', 1, 'post', '');

    /* ---------- vergunning ---------- */
    var dakvlak = cfg.dakvlak || 'achter';
    if (dakvlak !== 'achter') {
      post('Vergunning', 'Tekeningen omgevingsvergunning', 1, 'post',
           'aanzichten, doorsnede en detaillering');
      controle.push('Op het ' + (dakvlak === 'voor' ? 'voordakvlak' : 'zijdakvlak') +
        ' is een omgevingsvergunning nodig; leges van de gemeente zitten niet in deze staat.');
    } else {
      aannames.push('Achterdakvlak: gerekend als vergunningsvrij binnen de ' +
        'standaardvoorwaarden. De gemeente heeft het laatste woord.');
    }

    controle.push('Deze staat is werkvoorbereiding, geen productiestuklijst: ' +
      'maatvoering en hoeveelheden worden na het inmeten vastgesteld.');

    return {
      invoer: {
        soort: 'dakkapel',
        uitvoering: prefab ? 'prefab' : 'traditioneel',
        glasvakken: vakken, breedte: breedte, diepte: DIEPTE,
        hoogte: HOOGTE_VOOR, dakhelling: DAKHELLING,
        hoogteKozijn: HOOGTE_KOZIJN, openingSchuin: openingSchuin,
        dakOppervlak: dakOpp, gevelOppervlak: n(bekledingOpp),
        glasOppervlak: glas.oppervlak, opening: opening,
        afwerking: cfg.afwerking || 'antraciet',
        kozijnkleur: cfg.kozijnkleur || 'wit',
        draaiend: draaiend, dakvlak: dakvlak, binnen: binnen
      },
      posten: posten, aannames: aannames, controle: controle
    };
  }

  /** Platte tekst, voor in een offerteaanvraag of een mail. */
  function alsTekst(st) {
    var i = st.invoer;
    var r = ['MATERIAALSTAAT (indicatief, werkvoorbereiding)',
             'Dakkapel ' + i.uitvoering + ' · ' + i.glasvakken + ' glasvakken · rekenmaat ' +
             nl(i.breedte) + ' × ' + nl(i.diepte) + ' m · voorwand ' + nl(i.hoogte) + ' m',
             'Dakopening ' + nl(i.opening) + ' m² · gevelbekleding ' + nl(i.gevelOppervlak) +
             ' m² · glas ' + nl(i.glasOppervlak) + ' m²', ''];
    var volgorde = [], perGroep = {};
    st.posten.forEach(function (p) {
      if (!perGroep[p.groep]) { perGroep[p.groep] = []; volgorde.push(p.groep); }
      perGroep[p.groep].push(p);
    });
    volgorde.forEach(function (groep) {
      r.push(groep.toUpperCase());
      perGroep[groep].forEach(function (p) {
        r.push('  ' + nl(p.hoeveelheid) + ' ' + p.eenheid + '  ' + p.omschrijving +
               (p.opmerking ? '  (' + p.opmerking + ')' : ''));
      });
    });
    if (st.aannames.length) { r.push('', 'AANNAMES'); st.aannames.forEach(function (a) { r.push('  - ' + a); }); }
    if (st.controle.length) {
      r.push('', 'TE BEVESTIGEN DOOR DE CONSTRUCTEUR');
      st.controle.forEach(function (c) { r.push('  ! ' + c); });
    }
    return r.join('\n');
  }

  global.NGDakkapelMateriaal = {
    staat: materiaalstaat, tekst: alsTekst,
    rekenbreedte: REKENBREEDTE, raveelProfiel: raveelProfiel
  };
})(typeof window !== 'undefined' ? window : globalThis);
