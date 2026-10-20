/* Van dakrenovatie-configuratie naar materiaalstaat — de werkvoorbereiding.
 *
 * WAAROM DIT EEN APARTE MODULE IS
 * Dezelfde reden als bij de uitbouw: de prijs is een verkoopgetal en de staat
 * is een inkoopgetal. Ze hangen aan dezelfde keuzes maar hebben een andere
 * houdbaarheid. Een prijs mag afgerond en commercieel zijn; een bestellijst
 * niet, want daar komt een vrachtwagen op af. Gescheiden houden betekent dat
 * de staat verfijnd kan worden zonder dat er ergens een prijs verschuift.
 *
 * WAT DIT WEL EN NIET IS
 * Een werkvoorbereidingsstaat: hoeveelheden om mee in te kopen en uren om mee
 * te plannen. Het is geen constructieberekening en geen bestek. Alles wat uit
 * een aanname volgt in plaats van uit een maat staat onderaan bij `aannames`,
 * en alles wat op het dak nagemeten moet worden bij `controle`. Een dakdekker
 * die daaraan voorbijgaat bestelt te weinig latten en staat stil.
 *
 * DE MAATVOERING KOMT UIT TWEE GETALLEN
 * De configurator vraagt het dakvlak en de gootlengte, en meer niet - want
 * meer weet een bezoeker niet van zijn eigen dak. Alles daarna volgt uit die
 * twee plus het daktype:
 *
 *   zadeldak    nok = halve gootlengte (de goot loopt langs twee zijden)
 *   schilddak   korte nok plus vier hoekkepers; de nok is ruwweg een zesde
 *               van de gootlengte en de kepers zijn de rest van de omtrek
 *
 * Dat is een benadering en het staat als zodanig bij de aannames. Het scheelt
 * de bezoeker een vragenlijst die hij toch niet kan invullen, en de dakdekker
 * meet bij de inspectie de echte lengtes.
 *
 * SNIJVERLIES ZIT IN DE HOEVEELHEID, NIET IN EEN MARGE ACHTERAF
 * Folie krijgt 15 procent voor de overlap (die is voorgeschreven, geen
 * verspilling), latten 8 procent voor passtukken en stuiknaden, pannen 3
 * procent voor breuk bij het lossen en het snijden langs de kepers. Een
 * schilddak snijdt meer dan een zadeldak: elke keper kost halve pannen over de
 * volle lengte, en daar komt bij het schilddak nog 4 procent bovenop.
 */
(function (global) {
  'use strict';

  /* Per pansoort: stuks per m2, de werkende hoogte van de panlat (h.o.h. in
     meters) en het gewicht per stuk. De werkende hoogte bepaalt hoeveel meter
     panlat er per vierkante meter dak nodig is, en dat is de post waar de
     meeste dakdekkers zich op verrekenen: een leipan met 26 centimeter
     hartafstand vraagt bijna een derde meer latwerk dan een betonpan met 33,5.
     De getallen zijn de gangbare Nederlandse maten; wijkt de gekozen pan af,
     dan hoort dat hier aangepast te worden en niet op de bouw. */
  var PAN = {
    13: { l: 'Betonpan (sneldek) antraciet',   st: 10, hoh: 0.335, kg: 4.5 },
    14: { l: 'Betonpan (sneldek) rood',        st: 10, hoh: 0.335, kg: 4.5 },
    15: { l: 'Keramische vlakke pan antraciet',st: 14, hoh: 0.300, kg: 3.4 },
    16: { l: 'Keramische vlakke pan zwart',    st: 14, hoh: 0.300, kg: 3.4 },
    17: { l: 'Keramische golvende pan rood',   st: 12, hoh: 0.345, kg: 3.6 },
    18: { l: 'Keramische pan zwart verglaasd', st: 12, hoh: 0.345, kg: 3.6 },
    19: { l: 'Leipan antraciet',               st: 16, hoh: 0.260, kg: 2.8 },
    20: { l: 'Leipan zwart',                   st: 16, hoh: 0.260, kg: 2.8 }
  };
  if(global.NGDakProducten)global.NGDakProducten.forEach(function(p){PAN[p.v]=p;});

  var GOOT = { 30: null, 31: 'Zinken mastgoot 0,8 mm, ontwikkeld 333 mm',
                         32: 'Aluminium bakgoot antraciet, gemoffeld' };
  var BOEI = { 0: null, 33: 'Boeideel wit, 18 mm, incl. bevestiging',
                        34: 'Boeideel antraciet, 18 mm, incl. bevestiging' };
  var RAAM = { 26: null, 27: ['Dakraam 78 × 98 cm, incl. gootstuk', 1],
                         28: ['Dakraam 114 × 140 cm, incl. gootstuk', 1],
                         29: ['Dakraam 114 × 118 cm, incl. gootstuk', 2] };
  var ZON  = { 21: 0, 22: 4, 23: 6, 24: 8, 25: 10 };

  function rond(n, stap) { return Math.ceil(n / (stap || 1)) * (stap || 1); }

  /* De maatvoering die uit dakvlak, gootlengte en daktype volgt. */
  function meten(st) {
    var schild = st.woning === 'w02';
    var schuin = st.m2 / Math.max(st.gootm, 1);      // gemiddelde dakvlaklengte
    return {
      schild: schild,
      m2: st.m2,
      gootm: st.gootm,
      nokm: schild ? st.gootm / 6 : st.gootm / 2,
      keperm: schild ? 4 * schuin : 0,
      /* Gevelpannen zitten alleen op een zadeldak: een schilddak heeft geen
         verticale dakrand, daar loopt de keper. */
      gevelm: schild ? 0 : 2 * schuin,
      snij: schild ? 1.07 : 1.03
    };
  }

  function post(groep, omschrijving, aantal, eenheid, noot) {
    return { groep: groep, wat: omschrijving,
             aantal: Math.round(aantal * 10) / 10, eh: eenheid, noot: noot };
  }

  /* De bedekking van een plat dak, met verbruik per m2. Een bitumendak gaat in
     twee lagen en krijgt 12 procent voor overlap en opkanten; EPDM is een vel
     en snijdt juist meer weg dan het overlapt. */
  var PLAT = {
    13: { l: 'Bitumen APP, twee lagen (onder- en toplaag)', factor: 2.12, eh: 'm²' },
    14: { l: 'Bitumen wit reflecterend, twee lagen',        factor: 2.12, eh: 'm²' },
    15: { l: 'EPDM-folie 1,2 mm, één vel',                  factor: 1.18, eh: 'm²' },
    16: { l: 'PVC-membraan 1,5 mm, mechanisch bevestigd',   factor: 1.14, eh: 'm²' },
    17: { l: 'Bitumen twee lagen + grindballast 50 mm',     factor: 2.12, eh: 'm²' },
    18: { l: 'EPDM + sedumpakket met drainage en substraat', factor: 1.18, eh: 'm²' }
  };

  function aan(st, v) { return !!(st.opbouw && st.opbouw[v]); }

  function platteStaat(st, m, r, uren, aannames, controle) {
    var b = PLAT[st.bedekking] || PLAT[13];
    aannames.push('Plat dak van ' + st.m2 + ' m² met ' + st.gootm +
      ' m dakrand, zoals in de configurator ingevuld. Een plat dak heeft geen ' +
      'goot: de dakrandlengte bepaalt de daktrim en de boeidelen.');
    if (st.aanpak === 'reinigen' || st.aanpak === 'coaten') {
      r.push(post('Reiniging', 'Reinigen dakvlak, mos en vuil verwijderen', m.m2, 'm²'));
      r.push(post('Reiniging', 'Bestaande afvoer reinigen', 1, 'st'));
      uren.push(['Reinigen plat dak', m.m2 * 0.10]);
    }
    if (st.aanpak === 'repareren') {
      r.push(post('Reparatie', 'Bitumen reparatiebaan 1 m breed', 12, 'm'));
      r.push(post('Reparatie', 'Kit, primer en afwerkband', 1, 'set'));
      uren.push(['Reparatie ter plaatse', 5]);
      controle.push('De omvang is pas na inspectie vast te stellen; dit is een vanafpost.');
    }
    if (st.aanpak === 'overlagen') { controle.push('Overlagen: opbouw, hechting, vocht en afschot beoordelen. Bedekkingsmateriaal en arbeid nog niet bepaald; dit is geen complete bestellijst.'); }
    if (st.aanpak === 'vervangen') {
    if (aan(st, 'strippen')) {
      r.push(post('Sloop', 'Oude bitumen en onderlaag verwijderen en afvoeren',
                  m.m2 * 12 / 1000, 'ton', 'ca. 12 kg/m²'));
      r.push(post('Sloop', 'Afvalcontainer 6 m³', Math.max(1, Math.ceil(m.m2 / 90)), 'st'));
      uren.push(['Strippen tot op het beschot', m.m2 * 0.18]);
    }
    if (aan(st, 'beschot')) {
      r.push(post('Dakbeschot', 'Underlayment 18 mm', m.m2 * 1.06, 'm²', '6 % snijverlies'));
      r.push(post('Dakbeschot', 'Schroeven en randhout', rond(m.m2 * 12, 50), 'st'));
      uren.push(['Dakbeschot vernieuwen', m.m2 * 0.30]);
      controle.push('Of het beschot eruit moet blijkt pas als de bedekking eraf is; dit is een stelpost.');
    }
    if (aan(st, 'isolatie')) {
      r.push(post('Isolatie', 'PIR-isolatie, voorlopige aanname 120 mm; isolatiewaarde te bepalen', m.m2 * 1.05, 'm²'));
      r.push(post('Isolatie', 'Bevestiging met drukverdeelplaten, 5 st/m²', rond(m.m2 * 5, 50), 'st'));
      uren.push(['Isolatie leggen', m.m2 * 0.16]);
    }
    if (aan(st, 'dampremmer')) {
      r.push(post('Onderlaag', 'Dampremmende laag', m.m2 * 1.12, 'm²', '12 % overlap'));
      uren.push(['Dampremmer aanbrengen', m.m2 * 0.10]);
    }
    r.push(post('Dakbedekking', b.l, m.m2 * b.factor, b.eh,
                Math.round((b.factor > 2 ? 12 : (b.factor - 1) * 100)) + ' % overlap en opkanten'));
    r.push(post('Dakbedekking', 'Opstandprofiel en wandaansluiting', m.gootm * 0.4 + 6, 'm'));
    /* Een plat dak heeft geen hanggoot: het water gaat via afschot naar een
       afvoer door het dak, en een noodoverloop in de dakrand voert af als die
       verstopt raakt. Dat laatste is geen luxe - een verstopte afvoer laat het
       water staan, en water weegt duizend kilo per kuub. */
    uren.push(['Dakbedekking aanbrengen', m.m2 * (b.factor > 2 ? 0.34 : 0.26)]);
    } // Einde volledige vervanging; gekozen extra’s gelden bij iedere aanpak.
    if (st.boei && st.boei !== 60) {
      r.push(post('Boeidelen', st.boei === 61 ? 'Boeideel wit, 18 mm' : 'Boeideel antraciet, 18 mm',
                  m.gootm * 1.05, 'm'));
      r.push(post('Boeidelen', 'Hoek- en eindprofielen', Math.max(2, Math.round(m.gootm / 6)), 'st'));
      uren.push(['Boeidelen vervangen', m.gootm * 0.40]);
    }
    if (st.dakrand && st.dakrand !== 30) {
      r.push(post('Dakrand', 'Aluminium daktrim incl. verbindingsstukken', m.gootm * 1.05, 'm'));
      uren.push(['Daktrim monteren', m.gootm * 0.25]);
    }
    if (st.daglicht && st.daglicht !== 26) {
      var dl = { 27: 'Lichtkoepel 100 × 100 cm met opstand', 28: 'Platdakraam met opstand',
                 29: 'Lichtstraat 1 × 3 m met opstand' }[st.daglicht];
      r.push(post('Daglicht', dl, 1, 'st'));
      r.push(post('Daglicht', 'Aansluitmanchet en afwerkband', 1, 'set'));
      uren.push(['Daglichtopening maken en inbouwen', st.daglicht === 29 ? 9 : 6]);
      controle.push('Een daglichtopening vraagt een raveling in de balklaag; die wordt bij de inspectie ingemeten.');
    }
    if (st.terras && st.terras !== 35) {
      var tr = st.terras === 36
        ? ['Terrastegels 60 × 60 op stelpoten', 'Stelpoten regelbaar, 4 st/m²']
        : ['Hardhouten vlonderdelen', 'Onderregels en clips'];
      r.push(post('Dakterras', tr[0], (st.terrasm2 || Math.min(15,m.m2)), 'm²', 'Door klant gekozen terrasoppervlakte; indeling controleren'));
      r.push(post('Dakterras', tr[1], rond((st.terrasm2 || Math.min(15,m.m2)) * 4, 10), 'st'));
      controle.push('Balustrade, toegang en constructieve aanpassingen apart ontwerpen en begroten; niet in deze materiaalstaat.');
      uren.push(['Dakterras leggen', (st.terrasm2 || Math.min(15,m.m2)) * 0.28]);
      controle.push('Een dakterras belast het dak zwaarder; de draagkracht van de balklaag hoort nagerekend te worden.');
    }
    var zon = { 21: 0, 22: 4, 23: 6, 24: 8 }[st.zon] || 0;
    if (zon) {
      r.push(post('Zonnepanelen', 'Zonnepaneel full black 440 Wp', zon, 'st'));
      r.push(post('Zonnepanelen', 'Ballastframe met beschermmatten', zon, 'set'));
      r.push(post('Zonnepanelen', 'Ballasttegels', rond(zon * 6, 5), 'st'));
      r.push(post('Zonnepanelen', 'Omvormer + DC/AC-bekabeling', 1, 'set'));
      uren.push(['Zonnepanelen monteren', zon * 0.9]);
      controle.push('Ballast telt mee in de dakbelasting; bij twijfel de balklaag laten narekenen.');
    }
    if (st.afvoer === 'nieuw' || st.afvoer === 'nieuw-spuwer') {
      r.push(post('Afvoer', 'Hemelwaterafvoer met bladvanger', 1, 'st'));
      r.push(post('Afvoer', 'Hemelwaterafvoerbuis en beugels', 4, 'm', 'Voorlopige lengte; inmeten'));
      uren.push(['Hemelwaterafvoer vervangen', 2]);
    } else { controle.push('Bestaande hoofdafvoer behouden en controleren; geen nieuwe hoofdafvoer begroot.'); }
    if (st.afvoer === 'spuwer' || st.afvoer === 'nieuw-spuwer') {
      r.push(post('Afvoer', 'Noodoverloop (spuwer) in de dakrand', 1, 'st'));
      uren.push(['Noodoverloop plaatsen', 1.5]);
    }
    controle.push('Aantal, capaciteit en positie van afvoeren en noodoverlopen bij de opname bepalen; aantallen volgen hier de gekozen optie.');
    if(st.aanpak !== 'repareren' && st.aanpak !== 'overlagen') r.push(post('Algemeen', 'Hoogwerker of steiger volgens prijsregels', 1, 'set'));
    r.push(post('Algemeen', 'Afdekzeilen en dagelijkse waterdichte afdekking', 1, 'set'));
  }

  function staat(st) {
    var m = meten(st), p = PAN[st.pan] || PAN[13], r = [], uren = [];
    var aannames = [], controle = [];
    var vervangt = st.aanpak === 'vervangen';

    /* Een plat dak is een ander vak met een andere opbouw; het loopt daarom
       langs een eigen tak en niet langs de pannenposten hieronder. */
    if (st.plat) {
      platteStaat(st, m, r, uren, aannames, controle);
      var u0 = uren.reduce(function (s, u) { return s + u[1]; }, 0);
      return { regels: r,
               uren: uren.map(function (u) { return { wat: u[0], uren: Math.round(u[1] * 10) / 10 }; }),
               totaalUren: Math.round(u0 * 10) / 10,
               dagen: Math.max(1, Math.round(u0 / 16 * 10) / 10),
               maten: m, aannames: aannames, controle: controle };
    }

    aannames.push('Dakvlak ' + st.m2 + ' m² en gootlengte ' + st.gootm +
      ' m zoals in de configurator ingevuld; bij de inspectie wordt ingemeten.');
    aannames.push(m.schild
      ? 'Schilddak: nok geschat op een zesde van de gootlengte, vier hoekkepers over de dakvlaklengte.'
      : 'Zadeldak: nok geschat op de halve gootlengte, twee gevelranden.');

    if (st.aanpak === 'reinigen' || st.aanpak === 'coaten') {
      r.push(post('Reiniging', 'Reinigen dakvlak, mos en aanslag verwijderen', m.m2, 'm²'));
      r.push(post('Reiniging', 'Anti-mosbehandeling', m.m2, 'm²'));
      r.push(post('Reiniging', 'Goot uitspuiten en vuil afvoeren', m.gootm, 'm'));
      uren.push(['Reinigen', m.m2 * 0.12]);
      if (st.aanpak === 'coaten') {
        r.push(post('Coating', 'Primer, ' + (st.coat === 'rood' ? 'rood' : 'antraciet'),
                    m.m2 * 0.20, 'liter', '0,20 l/m²'));
        r.push(post('Coating', 'Coating tweelaags, ' + (st.coat === 'rood' ? 'rood' : 'antraciet'),
                    m.m2 * 0.55, 'liter', '2 lagen, samen 0,55 l/m²'));
        uren.push(['Coaten', m.m2 * 0.14]);
        controle.push('Coaten heeft alleen zin op een pan die nog gaaf is; poreuze of gebroken pannen eerst beoordelen.');
      }
    }

    if (st.aanpak === 'repareren') {
      r.push(post('Reparatie', 'Vervangende pannen, passend bij bestaand', 25, 'st',
                  'Stelpost; definitief na inspectie'));
      r.push(post('Reparatie', 'Loodvervangende slabbe / lood 20 kg-rol', 1, 'rol'));
      r.push(post('Reparatie', 'Voegmortel en afdichtingskit', 1, 'set'));
      uren.push(['Reparatie ter plaatse', 6]);
      controle.push('De omvang van de schade is pas na inspectie vast te stellen; dit is een vanafpost.');
    }

    if (vervangt) {
      var pannen = m.m2 * p.st * m.snij;
      r.push(post('Sloop', 'Bestaande pannen afnemen en afvoeren',
                  m.m2 * 45 / 1000, 'ton', 'ca. 45 kg/m² oude pannen'));
      r.push(post('Sloop', 'Afvalcontainer 6 m³', Math.max(1, Math.ceil(m.m2 / 70)), 'st'));
      uren.push(['Strippen dakvlak', m.m2 * 0.22]);

      if (aan(st, 'isolatie')) {
        r.push(post('Isolatie', 'Isolatiedakplaat PIR 100 mm, kraftcachering',
                    m.m2 * 1.05, 'm²', '5 % snijverlies'));
        r.push(post('Isolatie', 'Schroeven met drukverdeelplaat, 6 st/m²',
                    rond(m.m2 * 6, 100), 'st'));
        r.push(post('Isolatie', 'Aansluitband nok, goot en kepers',
                    m.nokm + m.gootm + m.keperm, 'm'));
        uren.push(['Isolatiedakplaten leggen', m.m2 * 0.20]);
        controle.push('Isolatie op het bestaande dakbeschot verhoogt de daklijn ca. 10 cm: goot, boeidelen en aansluiting bij de buren nameten.');
      }

      if (aan(st, 'beschot')) {
        r.push(post('Dakbeschot', 'Dakbeschot 18 mm', m.m2 * 1.06, 'm²', '6 % snijverlies'));
        r.push(post('Dakbeschot', 'Schroeven en randhout', rond(m.m2 * 12, 50), 'st'));
        uren.push(['Dakbeschot vernieuwen', m.m2 * 0.28]);
        controle.push('Of het beschot eruit moet blijkt pas als de pannen eraf zijn; dit is een stelpost.');
      }
      /* Het onderdak is een keuze geworden. Wie de latten laat liggen betaalt
         er ook niet voor - en dan hoort de folie hier evenmin te staan. */
      if (aan(st, 'folie')) {
        r.push(post('Onderdak', 'Dampopen dakfolie', m.m2 * 1.15, 'm²', '15 % overlap'));
        r.push(post('Onderdak', 'Tengel 22 × 50 mm, h.o.h. 600 mm',
                    m.m2 / 0.60 * 1.08, 'm', '8 % passtukken'));
        r.push(post('Onderdak', 'Panlat 25 × 50 mm, h.o.h. ' + Math.round(p.hoh * 1000) + ' mm',
                    m.m2 / p.hoh * 1.08, 'm', '8 % passtukken'));
        r.push(post('Onderdak', 'RVS nagels en schroeven', rond(m.m2 * 0.35, 5), 'kg'));
        uren.push(['Folie, tengels en panlatten', m.m2 * 0.30]);
      }

      r.push(post('Dakbedekking', p.l, rond(pannen, 10), 'st',
                  'Rekenaanname '+p.st+' st/m² (fabrikant '+(p.range||p.st)+'), artikel '+(p.article||'na productkeuze')+', ' + Math.round((m.snij - 1) * 100) + ' % snijverlies'));
      r.push(post('Dakbedekking', 'Panhaken RVS (randen en elke 3e pan)',
                  rond(pannen * 0.35, 50), 'st'));
      if (m.gevelm) r.push(post('Dakbedekking', 'Gevelpannen', rond(m.gevelm / p.hoh, 5), 'st'));
      if (m.keperm) {
        r.push(post('Dakbedekking', 'Keperafwerking, droog systeem', m.keperm, 'm'));
        r.push(post('Dakbedekking', 'Keperbeugels en vorsten', rond(m.keperm * 2.5, 5), 'st'));
      }
      r.push(post('Dakbedekking', 'Vogelschroot / vogelvide', m.gootm, 'm'));
      uren.push(['Pannen leggen', m.m2 * (p.st > 13 ? 0.42 : 0.30)]);
      controle.push('Productreferentie: '+(p.source||'nog vast te stellen')+'. Aantallen en latafstand zijn voorlopig; inmeten en legplan controleren vóór bestellen.');
      controle.push('Dakhelling en pandekking bepalen of de gekozen pan mag; onder 25° is niet elke pan toegelaten.');
    }

    /* Nok, lood, goot en boeidelen staan los: dat zijn eigen klussen die ook
       zonder volledige renovatie besteld worden, en zo staan ze ook in de
       configurator. Bij een volledige renovatie hoort de nok er hoe dan ook
       bij - een nieuw dak met een oude nokvorst bestaat niet. */
    if (st.nok || vervangt) {
      r.push(post('Nok', 'Nokvorst, droog bevestigd', rond(m.nokm * 2.5, 5), 'st', '2,5 st/m'));
      r.push(post('Nok', 'Nokrol geventileerd + nokschroeven', m.nokm, 'm'));
      r.push(post('Nok', 'Nokgording-beugels', rond(m.nokm * 1.2, 5), 'st'));
      uren.push(['Nok afwerken', m.nokm * 0.45]);
    }
    if (st.lood || vervangt) {
      r.push(post('Loodwerk', 'Bladlood code 25, rol 1 m', 28, 'kg',
                  'Schoorsteen en aansluitingen'));
      r.push(post('Loodwerk', 'Loodfixeer, loodvervanger en voegmortel', 1, 'set'));
      uren.push(['Loodwerk aanbrengen', 7]);
    }
    if (GOOT[st.goot]) {
      r.push(post('Goot', GOOT[st.goot], m.gootm * 1.05, 'm', '5 % voor stuiken en hoeken'));
      r.push(post('Goot', 'Gootbeugels h.o.h. 500 mm', rond(m.gootm * 2, 5), 'st'));
      r.push(post('Goot', 'Gootafvoer, bocht en bladvanger', Math.max(1, Math.round(m.gootm / 12)), 'set'));
      uren.push(['Goot vervangen', m.gootm * 0.55]);
    }
    if (BOEI[st.boei]) {
      r.push(post('Boeidelen', BOEI[st.boei], m.gootm * 1.05, 'm'));
      r.push(post('Boeidelen', 'Hoek- en eindprofielen', Math.max(2, Math.round(m.gootm / 6)), 'st'));
      uren.push(['Boeidelen vervangen', m.gootm * 0.40]);
    }
    if (RAAM[st.raam]) {
      var raam = RAAM[st.raam];
      r.push(post('Dakramen', raam[0], raam[1], 'st'));
      r.push(post('Dakramen', 'Aansluitset onderdak en isolatiekader', raam[1], 'st'));
      uren.push(['Dakraam inbouwen', raam[1] * 4.5]);
      controle.push('Dakraamplaatsing tussen de bestaande sporen inmeten; een spoor doorzagen vraagt een raveling.');
    }
    if (st.dakkapel) {
      var breed = st.dakkapel === 56 ? 4.5 : 2.5;
      r.push(post('Dakkapel', 'Prefab dakkapel ' + String(breed).replace('.', ',') +
                  ' m breed, casco met kozijn', 1, 'st'));
      r.push(post('Dakkapel', 'Raveling en ondersteuning in de sporen', 1, 'set'));
      r.push(post('Dakkapel', 'Loodaansluiting en pasteneren rondom', breed * 2 + 3, 'm'));
      uren.push(['Dakkapel plaatsen en aansluiten', breed * 6]);
      controle.push('Raveling, draagkracht en eventuele vergunning voor de dakkapel vooraf beoordelen.');
    }
    if (ZON[st.zon]) {
      var n = ZON[st.zon];
      r.push(post('Zonnepanelen', 'Zonnepaneel full black 440 Wp', n, 'st'));
      r.push(post('Zonnepanelen', 'Dakhaken onder de pan', n * 2, 'st'));
      r.push(post('Zonnepanelen', 'Montagerail', rond(n * 2.2, 1), 'm'));
      r.push(post('Zonnepanelen', 'Omvormer + DC/AC-bekabeling', 1, 'set'));
      uren.push(['Zonnepanelen monteren', n * 1.1]);
      controle.push('Zonnepanelen: dakhaken onder de nieuwe pannen meenemen; achteraf plaatsen betekent pannen lichten.');
    }

    r.push(post('Algemeen', 'Gevelsteiger incl. op- en afbouw',
                m.gootm * (m.schild ? 8 : 6), 'm²', 'Gootlengte × werkhoogte'));
    r.push(post('Algemeen', 'Afdekzeilen en dagelijkse waterdichte afdekking', 1, 'set'));

    var totaalUren = uren.reduce(function (s, u) { return s + u[1]; }, 0);
    return {
      regels: r,
      uren: uren.map(function (u) { return { wat: u[0], uren: Math.round(u[1] * 10) / 10 }; }),
      totaalUren: Math.round(totaalUren * 10) / 10,
      dagen: Math.max(1, Math.round(totaalUren / 16 * 10) / 10),
      maten: m,
      aannames: aannames,
      controle: controle
    };
  }

  function nl(n) { return n.toLocaleString('nl-NL'); }

  function tekst(s) {
    var r = ['MATERIAALSTAAT: WERKVOORBEREIDING', ''];
    var groep = null;
    s.regels.forEach(function (x) {
      if (x.groep !== groep) { groep = x.groep; r.push('', groep.toUpperCase()); }
      r.push('  ' + nl(x.aantal) + ' ' + x.eh + '  ' + x.wat + (x.noot ? '  (' + x.noot + ')' : ''));
    });
    r.push('', 'ARBEID');
    s.uren.forEach(function (u) { r.push('  ' + nl(u.uren) + ' uur  ' + u.wat); });
    r.push('  ' + nl(s.totaalUren) + ' uur totaal, ca. ' + nl(s.dagen) + ' werkdagen met twee man');
    if (s.aannames.length) { r.push('', 'AANNAMES'); s.aannames.forEach(function (a) { r.push('  - ' + a); }); }
    if (s.controle.length) { r.push('', 'NA TE METEN OP HET DAK'); s.controle.forEach(function (c) { r.push('  ! ' + c); }); }
    return r.join('\n');
  }

  global.NGDakrenovatieStaat = { staat: staat, tekst: tekst, meten: meten, PAN: PAN };
})(typeof window !== 'undefined' ? window : globalThis);

