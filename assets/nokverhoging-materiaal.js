/* Van nokverhogingconfiguratie naar materiaalstaat — de werkvoorbereiding vooraf.
 *
 * Zelfde rol en zelfde uitvoer als dakkapel-materiaal.js en materiaalstaat.js,
 * zodat het afdrukblad en de offertemail er hetzelfde mee omgaan.
 *
 * WAAROM DIT EEN DERDE MODULE IS
 * De dakkapelstaat rekent een gat in de kap met een raveling eromheen. Hier
 * gaat de kap zélf omhoog: nieuwe nokgording, nieuwe sporen, de kopgevel mee
 * naar boven en het hele dakvlak opnieuw gedekt. Er is geen post die
 * ongewijzigd blijft, dus is een schakelaar in de dakkapelstaat geen
 * vereenvoudiging maar een verkleding.
 *
 * ALLES WAT EEN MAAT IS, IS EEN REKENMAAT
 * Net als bij de dakkapel toont de configurator geen metermaat: welke breedte
 * bij welke kozijnindeling hoort, moet de fabrikant bevestigen. Hier komt daar
 * de woningbreedte bij, want die bepaalt hoeveel dakvlak er opnieuw gedekt
 * wordt. Beide staan als constante bovenaan, verschijnen op het blad onder
 * Aannames, en zijn het eerste wat vervangen wordt zodra er ingemeten is.
 *
 * DE OPBOUW ZOALS WIJ HEM BOUWEN
 * Sporen 220 × 45 mm, PIR 140 mm in dak en kopgevel, dampdicht binnen en
 * dampopen buiten — dezelfde opbouw als bij de uitbouw, de dakopbouw en de
 * dakkapel, zodat een timmerman overal hetzelfde aantreft.
 */
(function (global) {
  'use strict';

  var VERLIES = {
    plaat: 1.10, isolatiePlaat: 1.07, hout: 1.08, folie: 1.15,
    bekleding: 1.10, lood: 1.10, pannen: 1.06
  };

  /* Rekenmaten — alle vijf verschijnen als aanname op het blad. */
  var REKENBREEDTE = { 2: 1.60, 3: 2.30, 4: 3.00, 5: 3.70, 6: 4.40 };
  var WONINGBREEDTE = { tussen: 5.40, hoek: 5.40, 'twee-onder': 6.50, vrijstaand: 8.00 };
  var VERHOGING = 1.20;       // hoeveel de noklijn omhoog gaat
  var DAKVLAK_SCHUIN = 4.20;  // schuine lengte van het nieuwe dakvlak, goot tot nok
  var HOOGTE_KOZIJN = 1.15;

  function n(x) { return Math.round(x * 100) / 100; }
  function omhoog(x) { return Math.ceil(x); }
  function nl(x) {
    return (Math.round(x * 100) / 100).toLocaleString('nl-NL',
      { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  /* De nokgording overspant de hele woningbreedte en draagt de koppen van alle
     nieuwe sporen. Indicatief; altijd door de constructeur bevestigen. */
  function nokProfiel(breedte) {
    if (breedte <= 5.0) return 'gelamineerd 90 × 300 mm';
    if (breedte <= 6.5) return 'gelamineerd 115 × 360 mm';
    if (breedte <= 8.0) return 'LVL 90 × 400 mm';
    return 'stalen HE180A met houten omtimmering';
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

  function materiaalstaat(cfg) {
    cfg = cfg || {};
    var R = global.NGNokverhogingRegels;
    var vakken = cfg.glasvakken || 3;
    var kozijnBreedte = REKENBREEDTE[vakken] || REKENBREEDTE[3];
    var woningtype = cfg.woningtype || 'tussen';
    var won = R ? R.vind(R.woningtypen, woningtype) : { l: 'Tussenwoning', kopgevels: 0 };
    var breedte = WONINGBREEDTE[woningtype] || WONINGBREEDTE.tussen;
    var prefab = cfg.uitvoering !== 'traditioneel';
    var opties = cfg.opties || {};
    var extras = cfg.extras || {};
    var draaiend = Math.min(cfg.draaiend || 0, vakken);
    var binnen = cfg.binnen || 'casco';

    var dakOpp = n(breedte * DAKVLAK_SCHUIN);
    var kopgevelOpp = n(won.kopgevels * breedte * VERHOGING * 0.5 + breedte * VERHOGING);
    var glasOpp = n((kozijnBreedte - 0.10) * HOOGTE_KOZIJN);
    var gevelNetto = n(Math.max(breedte * VERHOGING - glasOpp, 0.5));
    var sporen = omhoog(breedte / 0.6) + 1;

    var posten = [], aannames = [], controle = [];
    function post(groep, omschrijving, hoeveelheid, eenheid, opmerking) {
      posten.push({ groep: groep, omschrijving: omschrijving,
                    hoeveelheid: n(hoeveelheid), eenheid: eenheid,
                    opmerking: opmerking || '' });
    }

    aannames.push('Woningbreedte gerekend op ' + nl(breedte) + ' m (' + won.l.toLowerCase() +
      ') en de noklijn ' + nl(VERHOGING) + ' m omhoog. Rekenmaten: de werkelijke ' +
      'maten volgen uit het inmeten.');
    aannames.push('Kozijnbreedte gerekend op ' + nl(kozijnBreedte) + ' m bij ' + vakken +
      ' glasvakken. Welke breedte per indeling technisch geldig is, geeft de fabrikant vrij.');
    aannames.push('Nieuw dakvlak gerekend op ' + nl(DAKVLAK_SCHUIN) + ' m schuine lengte, ' +
      'goot tot nok, aan één zijde. Bij een symmetrische kap verdubbelt dat.');

    /* ---------- sloopwerk ----------
       Anders dan bij een dakkapel gaat hier het hele dakvlak eraf. Dat is de
       post die het verschil in doorlooptijd en in prijs verklaart. */
    post('Sloopwerk', 'Dakpannen verwijderen en afvoeren', dakOpp, 'm²',
         'ca. ' + omhoog(dakOpp * 12) + ' pannen');
    post('Sloopwerk', 'Panlatten en tengels verwijderen', dakOpp, 'm²', '');
    post('Sloopwerk', 'Dakbeschot en oude sporen verwijderen', dakOpp, 'm²', '');
    post('Sloopwerk', 'Oude nokgording en muurplaat demonteren', n(breedte), 'm¹', '');
    if (won.kopgevels) {
      post('Sloopwerk', 'Kopgevel gedeeltelijk afbreken op de nieuwe noklijn',
           n(won.kopgevels * breedte * 0.4), 'm²', 'per vrije kopgevel');
    }
    post('Sloopwerk', 'Afvoer sloopafval', n(dakOpp * 0.12), 'm³', 'exclusief containerhuur');

    /* ---------- constructie ---------- */
    var prof = nokProfiel(breedte);
    post('Constructie', 'Nokgording ' + prof, 1, 'st',
         'lengte ' + nl(breedte + 0.4) + ' m, over de volle woningbreedte');
    post('Constructie', 'Nieuwe sporen 220 × 45 mm', n(sporen * DAKVLAK_SCHUIN * VERLIES.hout), 'm¹',
         sporen + ' stuks, h.o.h. 600 mm');
    post('Constructie', 'Muurplaat 70 × 145 mm incl. ankers', n(breedte * VERLIES.hout), 'm¹', '');
    post('Constructie', 'Spantbenen / schoren nokgording', 2 + won.kopgevels, 'st', '');
    post('Constructie', 'Balkschoenen, hoekankers en stormankers', omhoog(sporen * 1.5), 'st', 'verzinkt');
    post('Constructie', 'Constructieschroeven 8 × 240 mm', omhoog(sporen * 8), 'st', '');
    controle.push('De nokgording overspant de volle woningbreedte en draagt alle nieuwe ' +
      'sporen: profiel, oplegging en schoren volgen uit een constructieberekening.');
    controle.push('De extra belasting komt op de bestaande bouwmuren en de fundering. ' +
      'Of die dat dragen, wordt vóór de vergunningsaanvraag berekend.');

    /* ---------- kopgevel en bouwmuren ---------- */
    if (won.kopgevels) {
      post('Kopgevel', 'Kopgevel opmetselen tot de nieuwe noklijn',
           n(won.kopgevels * breedte * VERHOGING * 0.5), 'm²',
           won.kopgevels + '× vrije kopgevel, driehoek boven de oude noklijn');
      post('Kopgevel', 'Gevelsteen, passend bij het bestaande werk',
           omhoog(won.kopgevels * breedte * VERHOGING * 0.5 * 52), 'st', 'ca. 52 st/m²');
      post('Kopgevel', 'Metselmortel', n(won.kopgevels * breedte * VERHOGING * 0.5 * 0.03), 'm³', '');
      controle.push('De nieuwe kopgevel moet in verband en in kleur aansluiten op het ' +
        'bestaande metselwerk; steen en voegkleur vooraf op de bouw beoordelen.');
    }
    var muren = 2 - won.kopgevels;
    if (muren > 0) {
      post('Kopgevel', 'Aansluiting op de woningscheidende bouwmuur', muren, 'st',
           'brandwerend dichtzetten en waterdicht aansluiten');
      post('Kopgevel', 'Brandwerende manchetten en kitwerk', muren, 'post',
           'WBDBO-eis tussen de woningen blijft gelden');
      controle.push('De aansluiting op de woningscheidende wand moet de brandwerendheid ' +
        'tussen de woningen in stand houden; detail vooraf vastleggen.');
    }

    /* ---------- nieuw dakvlak ---------- */
    post('Dakvlak', 'Dakbeschot multiplex 18 mm', n(dakOpp * VERLIES.plaat), 'm²', '');
    post('Dakvlak', 'PIR 140 mm', n(dakOpp * VERLIES.isolatiePlaat), 'm²', 'Rc ≈ 6,0');
    post('Dakvlak', 'Dampremmende folie binnenzijde', n(dakOpp * VERLIES.folie), 'm²', '');
    post('Dakvlak', 'Dampopen dakfolie', n(dakOpp * VERLIES.folie), 'm²', '');
    post('Dakvlak', 'Tengels 25 × 50 mm', n(sporen * DAKVLAK_SCHUIN * VERLIES.hout), 'm¹', '');
    post('Dakvlak', 'Panlatten 32 × 50 mm', n(dakOpp / 0.32 * VERLIES.hout), 'm¹', 'h.o.h. ca. 320 mm');
    post('Dakvlak', 'Dakpannen, passend bij het bestaande dak',
         omhoog(dakOpp * 12 * VERLIES.pannen), 'st', 'incl. breuk en passtukken');
    post('Dakvlak', 'Nokvorsten incl. droge nokconstructie', n(breedte * VERLIES.pannen), 'm¹', '');
    post('Dakvlak', 'Panhaken en stormvaste bevestiging', omhoog(dakOpp * 4), 'st',
         'aan de randen en bij de nok verplicht');
    if (extras.dakraam) {
      post('Dakvlak', 'Dakraam incl. gootstuk', 1, 'st', 'in het nieuwe dakvlak');
      controle.push('De sparing voor het dakraam onderbreekt de sporen: versteviging ' +
        'door de constructeur.');
    }

    /* ---------- kozijn en glas ---------- */
    post('Kozijn', 'Doorlopende kunststof kozijnconstructie ' + nl(kozijnBreedte) + ' × ' +
         nl(HOOGTE_KOZIJN) + ' m, ' + KOZIJNNAAM[cfg.kozijnkleur || 'wit'], 1, 'st',
         vakken + ' vakken, tussenstijlen inbegrepen');
    if (draaiend) post('Kozijn', 'Draaikiepvleugel incl. beslag', draaiend, 'st', '');
    if (vakken - draaiend) post('Kozijn', 'Vast glasvak', vakken - draaiend, 'st', '');
    post('Kozijn', extras.triple ? 'Triple glas (Ug 0,6)' : 'HR++ beglazing (Ug 1,1)',
         n(glasOpp * 1.05), 'm²', 'inclusief inbouwverlies');
    if (extras.horren && draaiend) post('Kozijn', 'Inzethor op maat', draaiend, 'st', '');

    /* ---------- gevelafwerking ---------- */
    post('Gevelafwerking', GEVELNAAM[cfg.afwerking] || GEVELNAAM.antraciet,
         n(gevelNetto * VERLIES.bekleding), 'm²', 'nieuwe gevel boven de oude noklijn');
    post('Gevelafwerking', 'Hoek- en aansluitprofielen',
         n((breedte + VERHOGING * 4) * VERLIES.hout), 'm¹', '');
    post('Gevelafwerking', 'Boeideel en windveer', n((breedte + DAKVLAK_SCHUIN * 2) * VERLIES.hout), 'm¹', '');
    if (cfg.afwerking === 'zink-platen') {
      post('Gevelafwerking', 'Onderconstructie zink, geventileerd', n(gevelNetto), 'm²', '');
    }
    if (cfg.afwerking === 'thermowood') {
      post('Gevelafwerking', 'RVS bevestiging thermowood', omhoog(gevelNetto * 22), 'st', '');
    }

    /* ---------- lood- en zetwerk ---------- */
    post('Lood- en zetwerk', 'Loodaansluiting kopgevel, code 20',
         n((won.kopgevels ? won.kopgevels : 2) * DAKVLAK_SCHUIN * VERLIES.lood), 'm¹', '');
    post('Lood- en zetwerk', 'Zetwerk aluminium, dakrand en windveer',
         n((breedte + DAKVLAK_SCHUIN * 2) * VERLIES.hout), 'm¹', '');
    post('Lood- en zetwerk', 'Goot herstellen en aansluiten', n(breedte * VERLIES.hout), 'm¹', '');
    post('Lood- en zetwerk', 'Hemelwaterafvoer aanpassen', 1, 'post', '');

    /* ---------- opties ---------- */
    if (opties.rolluiken) {
      post('Opties', 'Rolluik met kast, elektrisch bediend', vakken, 'st', '');
      post('Opties', 'Bedieningsschakelaar rolluik', vakken, 'st', '');
    }
    if (opties.screens) {
      post('Opties', 'Screen met cassette, elektrisch bediend', vakken, 'st', '');
      post('Opties', 'Zijgeleiding screen', n(vakken * 2 * HOOGTE_KOZIJN), 'm¹', '');
    }
    if (opties.rooster) post('Opties', 'Doorlopend ventilatierooster', n(kozijnBreedte), 'm¹', '');
    if (opties.spots) {
      post('Opties', 'LED-spot in het overstek', vakken + 1, 'st', 'IP65');
      post('Opties', 'Bekabeling en trafo spots', n(breedte * 2 + 8), 'm¹', '');
    }

    /* ---------- binnenafwerking ---------- */
    var binnenOpp = n(dakOpp + gevelNetto);
    if (binnen === 'casco') {
      aannames.push('Casco opgeleverd: de binnenzijde blijft in het zicht: geen ' +
        'gipsplaat, dagkanten, stuc- of schilderwerk in deze staat.');
    } else {
      post('Binnenafwerking', 'Gipsplaat 12,5 mm', n(binnenOpp * VERLIES.plaat), 'm²',
           'schuine kap en nieuwe geveldelen');
      post('Binnenafwerking', 'Regelwerk en ophangbeugels', n(binnenOpp * 2.2 * VERLIES.hout), 'm¹', '');
      post('Binnenafwerking', 'Schroeven en gipsplaatband', 1, 'post', '');
      if (binnen === 'gipsplaten') {
        aannames.push('Gipsplaten opgeleverd: dichtgezet en klaar om te stucen.');
      }
    }
    if (binnen === 'afgewerkt') {
      post('Binnenafwerking', 'Dagkanten en aftimmerlatten',
           n((kozijnBreedte * 2 + HOOGTE_KOZIJN * 2) * VERLIES.hout), 'm¹', '');
      post('Binnenafwerking', 'Vensterbank', n(kozijnBreedte * VERLIES.hout), 'm¹', '');
      post('Binnenafwerking', 'Stucwerk', n(binnenOpp), 'm²', 'glad, klasse behangklaar');
      post('Binnenafwerking', 'Schilderwerk, twee lagen', n(binnenOpp), 'm²', '');
    }

    /* ---------- uitvoering ----------
       De woning staat open tot het nieuwe dakvlak dicht is. Dat is geen detail:
       het is de post waar een nokverhoging in het najaar op stukloopt. */
    if (prefab) {
      post('Uitvoering', 'Autolaadkraan, hele dag', 1, 'st', 'kapelementen op hun plek');
      post('Uitvoering', 'Transport prefab kapelementen', 1, 'st', '');
      post('Uitvoering', 'Tijdelijke overkapping / zeilconstructie', n(dakOpp * 1.3), 'm²',
           'één dag open in plaats van weken');
      aannames.push('Prefab: de nieuwe kap wordt in de werkplaats gebouwd en met een kraan ' +
        'geplaatst. Er moet een kraan bij kunnen staan. Dat wordt bij het inmeten beoordeeld.');
    } else {
      post('Uitvoering', 'Ladderlift of bouwlift, twee weken', 1, 'st', '');
      post('Uitvoering', 'Tijdelijke overkapping / steigerdak', n(dakOpp * 1.6), 'm²',
           'de woning staat een tot drie weken open');
      post('Uitvoering', 'Extra arbeidsuren opbouw op locatie', omhoog(breedte * 22), 'uur', '');
      aannames.push('Traditioneel: op de woning zelf opgebouwd, één tot drie weken. In die ' +
        'periode is een deugdelijke tijdelijke overkapping geen luxe maar voorwaarde.');
    }
    post('Uitvoering', 'Gevelsteiger rondom het werkvlak', 1, 'st', 'huur voor de duur van het werk');
    post('Uitvoering', 'Kitwerk en bevestigingsmateriaal', 1, 'post', '');

    /* ---------- vergunning ---------- */
    post('Vergunning', 'Tekeningen omgevingsvergunning', 1, 'post',
         'aanzichten, doorsneden en detaillering');
    post('Vergunning', 'Constructieberekening', 1, 'post', 'nokgording, sporen en afdracht');
    controle.push('Een nokverhoging verandert de bouwhoogte en het aanzicht: ' +
      'omgevingsvergunning met welstandstoets is altijd nodig. Leges van de gemeente ' +
      'zitten niet in deze staat.');
    controle.push('Deze staat is werkvoorbereiding, geen productiestuklijst: maatvoering ' +
      'en hoeveelheden worden na het inmeten vastgesteld.');

    return {
      invoer: {
        soort: 'nokverhoging', uitvoering: prefab ? 'prefab' : 'traditioneel',
        woningtype: won.l, glasvakken: vakken, kozijnBreedte: kozijnBreedte,
        woningbreedte: breedte, verhoging: VERHOGING, dakOppervlak: dakOpp,
        dakvlakSchuin: DAKVLAK_SCHUIN, hoogteKozijn: HOOGTE_KOZIJN,
        sporen: sporen, kopgevels: won.kopgevels, nokprofiel: prof,
        gevelOppervlak: gevelNetto, glasOppervlak: glasOpp,
        afwerking: cfg.afwerking || 'antraciet', kozijnkleur: cfg.kozijnkleur || 'wit',
        draaiend: draaiend, binnen: binnen
      },
      posten: posten, aannames: aannames, controle: controle
    };
  }

  function alsTekst(st) {
    var i = st.invoer;
    var r = ['MATERIAALSTAAT (indicatief, werkvoorbereiding)',
             'Nokverhoging ' + i.uitvoering + ' · ' + i.woningtype + ' · ' + i.glasvakken +
             ' glasvakken · noklijn ' + nl(i.verhoging) + ' m omhoog',
             'Woningbreedte ' + nl(i.woningbreedte) + ' m · nieuw dakvlak ' + nl(i.dakOppervlak) +
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

  global.NGNokverhogingMateriaal = {
    staat: materiaalstaat, tekst: alsTekst,
    rekenbreedte: REKENBREEDTE, woningbreedte: WONINGBREEDTE, nokProfiel: nokProfiel
  };
})(typeof window !== 'undefined' ? window : globalThis);
