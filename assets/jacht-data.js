/* Modellen, keuzes en prijzen van de jachtconfigurator.
 *
 * DIT IS HET ENIGE BESTAND DAT DE WERF HOEFT AAN TE PASSEN. De configurator,
 * het silhouet en het vaarprofiel lezen alles hieruit. Modelnamen,
 * specificaties, opties en prijzen zijn hier bewust van elkaar gescheiden van
 * de rest van de code.
 *
 * PRIJZEN EN SPECIFICATIES ZIJN MARKTCIJFERS, GEEN OFFERTE. Dit is een
 * demonstratiemodel: de tien schepen bestaan niet. De bedragen en maten
 * hieronder zijn daarom niet van een bestaand schip afgeleid, maar uit
 * openbare marktgegevens over nieuwbouwjachten van deze afmetingen — zie het
 * blok BRONNEN onderaan dit bestand, waarin per cijfer staat waar het vandaan
 * komt. Elke prijs ligt binnen de gepubliceerde bandbreedte én binnen de
 * gepubliceerde prijs per meter voor dat bouwtype.
 *
 * Dat is iets anders dan een verzonnen getal, en iets anders dan een offerte.
 * Overal waar een bedrag op het scherm komt staat "richtprijs" en de stempel
 * VOORBEELDMODEL. Een werf die dit systeem afneemt vervangt dit blok door de
 * eigen calculatie; aan de code hoeft dan niets te veranderen.
 *
 * Wat NIET in dit bestand hoort: de rekenregels. Rompsnelheid, actieradius
 * en vaarbewijsplicht zitten in jachtprofiel.js en gelden voor elk schip —
 * die veranderen niet als u een ander model invoert.
 */
(function (global) {
  'use strict';

  /* Staat dit op false, dan toont de configurator overal "op aanvraag" en
     blijft de offerteknop gewoon werken. Een werf die de eigen calculatie nog
     niet in dit bestand heeft staan, zet hem terug op false en er verschijnt
     nergens een bedrag. */
  var PRIJZEN_ACTIEF = true;

  var VALUTA = 'EUR';
  var BTW = 0.21;              // btw op pleziervaartuigen, particuliere levering NL

  /* ---------- omrekenkoersen ----------
     De euro is de contractvaluta: de werf rekent af in euro's en elke prijs in
     dit bestand staat in euro's. Een koper in Fort Lauderdale of Londen denkt
     alleen niet in euro's, en die moet niet met een rekenmachine naast zijn
     scherm zitten om te weten waar hij aan toe is.

     WAAROM DIT EEN VASTE TABEL IS EN GEEN KOERS VAN VANDAAG
     Een live koers ophalen zou dit demonstratiemodel afhankelijk maken van een
     dienst van buiten, en een bedrag dat elke dag anders is naast een prijs
     die een jaar hetzelfde blijft is geen nauwkeurigheid maar ruis. Dus staat
     hier één koers met de datum erbij, en zegt de configurator die datum
     erbij. Wie hem bijwerkt, werkt één regel bij.

     LET OP  Deze koersen verouderen. Ze staan in BEHEER-JACHT.md bij wat er
     periodiek nagelopen hoort te worden, en elk omgerekend bedrag draagt de
     datum zichtbaar bij zich. */
  var KOERSEN = {
    peildatum: '21 augustus 2026',
    peildatum_en: '21 August 2026',
    munten: [
      { v: 'EUR', teken: '\u20ac', koers: 1,     l: 'euro',          l_en: 'euro' },
      { v: 'USD', teken: '$',       koers: 1.12,  l: 'Amerikaanse dollar', l_en: 'US dollar' },
      { v: 'GBP', teken: '\u00a3', koers: 0.85,  l: 'Britse pond',   l_en: 'pound sterling' }
    ]
  };

  /* ---------- de modellen ----------
     loa/breedte/diepgang in meters, lwl = lengte waterlijn (bepaalt de
     verdringingssnelheid), verplaatsing in ton, tank in liter. */
  var MODELLEN = [
    { v: 'sc16', l: 'Sport Coupé 16', klasse: 'Sport Coupé',
      loa: 16.4, lwl: 14.1, breedte: 4.6, diepgang: 1.25, verplaatsing: 21,
      gasten: 6, hutten: 3, bemanning: 1, badkamers: 2, slaapgasten: 6, bemanningMin: 0, bemanningAanbevolen: 1, bemanningMax: 1, bemanningHutten: 1, dekkenAantal: 1,
      tank: 2400, watertank: 600, brutotonnage: 32, ecoSnelheid: 22, bouwtijd: 8, vanafprijs: 1650000,
      dekken: ['open', 'hardtop'], def: 1,
      omschrijving: 'Dagjacht met overnachtingsruimte voor zes gasten op één dek, bedoeld voor korte tochten en de Zeeuwse en Zuid-Hollandse wateren.', omschrijving_de: 'Tagesyacht mit Übernachtungsmöglichkeit für sechs Gäste auf einem Deck, gedacht für kurze Törns und geschützte Küstengewässer.', omschrijving_en: 'A day boat with berths for six on a single deck, built for short passages and sheltered coastal water.' },
    { v: 'fb19', l: 'Flybridge 19', klasse: 'Flybridge',
      loa: 19.2, lwl: 16.4, breedte: 5.2, diepgang: 1.45, verplaatsing: 34,
      gasten: 8, hutten: 4, bemanning: 2, badkamers: 3, slaapgasten: 8, bemanningMin: 1, bemanningAanbevolen: 2, bemanningMax: 2, bemanningHutten: 1, dekkenAantal: 2,
      tank: 4200, watertank: 900, brutotonnage: 52, ecoSnelheid: 20, bouwtijd: 10, vanafprijs: 3150000,
      dekken: ['hardtop', 'flybridge'],
      omschrijving: 'De klassieke stap omhoog: een tweede stuurstand op het flybridge en vier hutten onderdeks. Geschikt voor het IJsselmeer en de Waddenzee.', omschrijving_de: 'Der klassische Schritt nach oben: ein zweiter Fahrstand auf der Flybridge und vier Kabinen unter Deck. Geeignet für Reviere wie IJsselmeer und Wattenmeer.', omschrijving_en: 'The classic step up: a second helm on the flybridge and four cabins below. At home on open inland seas and tidal flats.' },
    { v: 'fb24', l: 'Flybridge 24', klasse: 'Flybridge',
      loa: 23.8, lwl: 20.3, breedte: 6.0, diepgang: 1.70, verplaatsing: 58,
      gasten: 8, hutten: 4, bemanning: 3, badkamers: 4, slaapgasten: 8, bemanningMin: 2, bemanningAanbevolen: 3, bemanningMax: 4, bemanningHutten: 2, dekkenAantal: 2,
      tank: 7500, watertank: 1400, brutotonnage: 98, ecoSnelheid: 18, bouwtijd: 14, vanafprijs: 5600000,
      dekken: ['flybridge', 'flybridge-ttop'],
      omschrijving: 'Volwaardig jacht met vier hutten en een gescheiden bemanningsverblijf. Vanaf deze lengte vaar je kustwateren en het Kanaal.', omschrijving_de: 'Vollwertige Yacht mit vier Kabinen und getrennter Crewunterkunft. Ab dieser Länge fahren Sie Küstengewässer und den Ärmelkanal.', omschrijving_en: 'A fully fledged yacht with four cabins and separate crew quarters. From this length you cross coastal waters and the Channel.' },
    { v: 'td29', l: 'Tri-deck 29', klasse: 'Tri-deck',
      loa: 28.9, lwl: 24.8, breedte: 7.1, diepgang: 2.05, verplaatsing: 105,
      gasten: 10, hutten: 5, bemanning: 5, badkamers: 5, slaapgasten: 10, bemanningMin: 4, bemanningAanbevolen: 5, bemanningMax: 6, bemanningHutten: 3, dekkenAantal: 3,
      tank: 14000, watertank: 2600, brutotonnage: 185, ecoSnelheid: 14, bouwtijd: 18, vanafprijs: 9200000,
      dekken: ['flybridge', 'flybridge-ttop'],
      omschrijving: 'Drie dekken en volledige bemanningsaccommodatie. Boven de 25 meter geldt een ander vaarbewijs. Het vaarprofiel rekent dat voor je uit.', omschrijving_de: 'Drei Decks und vollständige Crewunterkunft. Über 25 Meter gilt ein anderer Führerschein. Das Fahrprofil rechnet Ihnen das aus.', omschrijving_en: 'Three decks and full crew accommodation. Above twenty-five metres a different licence applies - the performance profile works that out for you.' },
    { v: 'sy37', l: 'Superyacht 37', klasse: 'Superyacht',
      loa: 36.8, lwl: 31.6, breedte: 8.0, diepgang: 2.35, verplaatsing: 198,
      gasten: 12, hutten: 6, bemanning: 8, badkamers: 7, slaapgasten: 12, bemanningMin: 6, bemanningAanbevolen: 8, bemanningMax: 9, bemanningHutten: 4, dekkenAantal: 3,
      tank: 26000, watertank: 4200, brutotonnage: 385, ecoSnelheid: 12, bouwtijd: 22, vanafprijs: 14800000,
      dekken: ['flybridge', 'flybridge-ttop'],
      omschrijving: 'Aan de bovengrens van wat nog als pleziervaartuig geregistreerd wordt, met twaalf gasten en volledige bemanningsaccommodatie.', omschrijving_de: 'An der Obergrenze dessen, was noch als Sportboot registriert wird, mit zwölf Gästen und vollständiger Crewunterkunft.', omschrijving_en: 'At the upper limit of what still registers as a pleasure vessel, with twelve guests and full crew accommodation.' },

    /* ---------- de grote luxe serie ----------
       Deze vijf stonden lange tijd zonder maten in dit bestand, met alleen de
       lengte uit de modelnaam. Dat was destijds de juiste keuze: liever een
       streepje dan een verzonnen waterlijnlengte.

       Nu staan de maten er wél, en ze zijn niet verzonnen maar afgeleid.
       Breedte, diepgang en waterlijnlengte volgen de verhoudingen van de vijf
       kleinere modellen hierboven, doorgetrokken met de slankheid die grotere
       rompen nu eenmaal hebben. De verplaatsing schaalt met de derde macht van
       de lengte, zoals scheepsrompen dat doen. Het aantal gasten staat op
       twaalf omdat de Large Yacht Code daarboven passagiersschipregels
       oplegt. De bemanningsaantallen volgen de vuistregel van ongeveer één
       bemanningslid per drie à vier meter en de gepubliceerde bandbreedtes per
       lengteklasse; de brutotonnage is zo gekozen dat de Sport 40 net onder de
       500 GT blijft en de Grand 55 daarboven, want daar begint SOLAS, ISM,
       ISPS en de MLC te gelden. Zie BRONNEN onderaan.

       Vanaf veertig meter blijft het vaarprofiel weigeren en verwijzen naar de
       werf en een klassenbureau. Dat is geen ontbrekend gegeven maar de wet. */
    { v: 'sport40', l: 'Sport 40', klasse: 'Sport',
      loa: 40.0, lwl: 34.4, breedte: 8.4, diepgang: 2.50, verplaatsing: 254,
      gasten: 12, hutten: 6, bemanning: 8, badkamers: 7, slaapgasten: 12, bemanningMin: 6, bemanningAanbevolen: 8, bemanningMax: 10, bemanningHutten: 5, dekkenAantal: 3,
      tank: 42000, watertank: 6500, brutotonnage: 465, ecoSnelheid: 14, bouwtijd: 26, vanafprijs: 19500000,
      dekken: ['flybridge'],
      omschrijving: 'De sportieve lijn binnen de grote serie, veertig meter lang. Specificaties en indeling volgen uit het ontwerptraject met de werf.', omschrijving_de: 'Die sportliche Linie innerhalb der großen Serie, vierzig Meter lang. Spezifikationen und Aufteilung ergeben sich aus dem Entwurfsprozess mit der Werft.', omschrijving_en: 'The sporting line within the large series, forty metres long. Specification and layout emerge from the design process with the yard.' },
    { v: 'grand55', l: 'Grand 55', klasse: 'Grand',
      loa: 55.0, lwl: 47.5, breedte: 10.2, diepgang: 3.10, verplaatsing: 661,
      gasten: 12, hutten: 7, bemanning: 12, badkamers: 8, slaapgasten: 12, bemanningMin: 9, bemanningAanbevolen: 12, bemanningMax: 14, bemanningHutten: 7, dekkenAantal: 4,
      tank: 95000, watertank: 14000, brutotonnage: 1150, ecoSnelheid: 12, bouwtijd: 32, vanafprijs: 38500000,
      dekken: ['flybridge'],
      omschrijving: 'Vijfenvijftig meter, tussen de sportieve en de grote modellen in. Specificaties en indeling volgen uit het ontwerptraject met de werf.', omschrijving_de: 'Fünfundfünfzig Meter, zwischen den sportlichen und den großen Modellen. Spezifikationen und Aufteilung ergeben sich aus dem Entwurfsprozess mit der Werft.', omschrijving_en: 'Fifty-five metres, between the sporting and the largest models. Specification and layout emerge from the design process with the yard.' },
    { v: 'flagship70', l: 'Flagship 70', klasse: 'Flagship',
      loa: 70.0, lwl: 60.5, breedte: 12.0, diepgang: 3.60, verplaatsing: 1362,
      gasten: 12, hutten: 8, bemanning: 19, badkamers: 9, slaapgasten: 12, bemanningMin: 14, bemanningAanbevolen: 19, bemanningMax: 22, bemanningHutten: 11, dekkenAantal: 4,
      tank: 165000, watertank: 22000, brutotonnage: 1780, ecoSnelheid: 12, bouwtijd: 38, vanafprijs: 63000000,
      dekken: ['flybridge'],
      omschrijving: 'Het vlaggenschip van zeventig meter. Vanaf deze lengte is een vaste bemanning geen keuze meer; de indeling ontstaat in het ontwerptraject met de werf.', omschrijving_de: 'Das Flaggschiff mit siebzig Metern. Ab dieser Länge ist eine feste Crew keine Wahl mehr; die Aufteilung entsteht im Entwurfsprozess mit der Werft.', omschrijving_en: 'The seventy-metre flagship. At this length a permanent crew is no longer a choice; the layout takes shape in the design process with the yard.' },
    { v: 'elite90', l: 'Elite 90', klasse: 'Elite',
      loa: 90.0, lwl: 78.0, breedte: 14.5, diepgang: 4.10, verplaatsing: 2896,
      gasten: 12, hutten: 9, bemanning: 27, badkamers: 10, slaapgasten: 12, bemanningMin: 20, bemanningAanbevolen: 27, bemanningMax: 31, bemanningHutten: 16, dekkenAantal: 5,
      tank: 310000, watertank: 38000, brutotonnage: 3250, ecoSnelheid: 11, bouwtijd: 48, vanafprijs: 148000000,
      dekken: ['flybridge'],
      omschrijving: 'Negentig meter, volledig op maat gebouwd. Specificaties en indeling volgen uit het ontwerptraject met de werf.', omschrijving_de: 'Neunzig Meter, vollständig nach Maß gebaut. Spezifikationen und Aufteilung ergeben sich aus dem Entwurfsprozess mit der Werft.', omschrijving_en: 'Ninety metres, built entirely to order. Specification and layout emerge from the design process with the yard.' },
    { v: 'giga120', l: 'Giga 120', klasse: 'Giga',
      loa: 120.0, lwl: 104.0, breedte: 18.5, diepgang: 5.00, verplaatsing: 6862,
      gasten: 12, hutten: 10, bemanning: 38, badkamers: 12, slaapgasten: 12, bemanningMin: 28, bemanningAanbevolen: 38, bemanningMax: 44, bemanningHutten: 22, dekkenAantal: 6,
      tank: 620000, watertank: 70000, brutotonnage: 7400, ecoSnelheid: 12, bouwtijd: 60, vanafprijs: 330000000,
      dekken: ['flybridge'],
      omschrijving: 'Het grootste model van de lijn: honderdtwintig meter. Specificaties en indeling volgen uit het ontwerptraject met de werf.', omschrijving_de: 'Das größte Modell der Linie: hundertzwanzig Meter. Spezifikationen und Aufteilung ergeben sich aus dem Entwurfsprozess mit der Werft.', omschrijving_en: 'The largest model in the range: one hundred and twenty metres. Specification and layout emerge from the design process with the yard.' }
  ];

  /* ---------- rompkleuren ----------
     `verf` is de kleur die het silhouet gebruikt, `donker` de schaduwzijde.
     Metallic lakken zijn duurder in onderhoud; dat staat als noot bij de
     keuze, niet als prijsverschil dat wij verzinnen. */
  var ROMPKLEUREN = [
    { v: 'nachtblauw', l: 'Nachtblauw', l_de: 'Nachtblau', l_en: 'Midnight blue', verf: '#16243c', donker: '#0d1626', def: 1 },
    { v: 'antraciet', l: 'Antraciet', l_de: 'Anthrazit', l_en: 'Anthracite', verf: '#2b2f33', donker: '#1a1d20' },
    { v: 'parelwit', l: 'Parelwit', l_en: 'Pearl white', l_de: 'Perlweiß', verf: '#eceae4', donker: '#cdc9c0', licht: 1 },
    { v: 'champagne', l: 'Champagne', l_de: 'Champagner', l_en: 'Champagne', verf: '#c3ab84', donker: '#a08c68', licht: 1,
      noot: 'Metallic lak: mooier in de zon, gevoeliger bij reparatie.', noot_en: 'Metallic paint: finer in sunlight, less forgiving to repair.', noot_de: 'Metalliclack: schöner in der Sonne, empfindlicher bei der Reparatur.' },
    { v: 'grafiet', l: 'Grafiet metallic', l_de: 'Graphit metallic', l_en: 'Graphite metallic', verf: '#3f464d', donker: '#282d32',
      noot: 'Metallic lak: mooier in de zon, gevoeliger bij reparatie.', noot_en: 'Metallic paint: finer in sunlight, less forgiving to repair.', noot_de: 'Metalliclack: schöner in der Sonne, empfindlicher bei der Reparatur.' },
    { v: 'zeegroen', l: 'Zeegroen', l_de: 'Meergrün', l_en: 'Sea green', verf: '#1d3b38', donker: '#122523' }
  ];

  /* De opbouw is bijna altijd licht — donkere opbouw wordt in de zon warm en
     vraagt zwaardere airco. Dat staat erbij, want het is een echte afweging. */
  var OPBOUW = [
    { v: 'wit', l: 'Parelwit', l_en: 'Pearl white', l_de: 'Perlweiß', verf: '#f0eee9', donker: '#d5d1c8', def: 1 },
    { v: 'romp', l: 'Gelijk aan de romp', l_de: 'Wie der Rumpf', l_en: 'Matching the hull', verf: null, donker: null,
      noot: 'Eén doorlopend volume. Bij donkere rompkleuren wordt het interieur warmer; reken op zwaardere koeling.', noot_de: 'Ein durchgehendes Volumen. Bei dunklen Rumpffarben wird es innen wärmer; rechnen Sie mit einer stärkeren Klimaanlage.', noot_en: 'One continuous volume. With darker hull colours the interior runs warmer; allow for heavier air conditioning.' },
    { v: 'zand', l: 'Zandbeige', l_de: 'Sandbeige', l_en: 'Sand beige', verf: '#ded3bd', donker: '#c0b49a' }
  ];

  var DEKKEN = [
    { v: 'open', l: 'Open cockpit', l_de: 'Offenes Cockpit', l_en: 'Open cockpit', hoogte: 0, noot: 'Zon en wind, geen beschutting. Het meeste dekoppervlak per meter schip.', noot_de: 'Sonne und Wind, kein Schutz. Die größte Decksfläche pro Meter Schiff.', noot_en: 'Sun and wind, no shelter. The most deck area per metre of boat.' },
    { v: 'hardtop', l: 'Hardtop met schuifdak', l_de: 'Hardtop mit Schiebedach', l_en: 'Hardtop with sunroof', hoogte: 1, def: 1 },
    { v: 'flybridge', l: 'Flybridge', l_de: 'Flybridge', l_en: 'Flybridge', hoogte: 2 },
    { v: 'flybridge-ttop', l: 'Flybridge met T-top en radarmast', l_de: 'Flybridge mit T-Top und Radarmast', l_en: 'Flybridge with T-top and radar mast', hoogte: 3,
      noot: 'Let op de doorvaarthoogte: met mast erop kom je onder sommige vaste bruggen in het binnenland niet door.', noot_de: 'Achten Sie auf die Durchfahrtshöhe: mit Mast kommen Sie unter manchen festen Brücken im Binnenland nicht hindurch.', noot_en: 'Mind the air draught: with the mast fitted, some fixed inland bridges are out of reach.' }
  ];

  var DEKAFWERKING = [
    { v: 'teak', l: 'Massief teak', l_de: 'Massives Teak', l_en: 'Solid teak', kleur: '#c8a878', def: 1,
      noot: 'Het mooiste en het meeste onderhoud. Vergrijst zonder behandeling.', noot_de: 'Das schönste Deck und das mit dem meisten Aufwand. Vergraut ohne Behandlung.', noot_en: 'The most beautiful and the most upkeep. Weathers to grey if left untreated.' },
    { v: 'composiet', l: 'Composiet teaklook', l_de: 'Komposit in Teakoptik', l_en: 'Composite teak-look', kleur: '#c2a785',
      noot: 'Nagenoeg onderhoudsvrij en koeler onder blote voeten dan echt teak.', noot_de: 'Nahezu wartungsfrei und unter bloßen Füßen kühler als echtes Teak.', noot_en: 'Virtually maintenance-free and cooler underfoot than real teak.' },
    { v: 'antislip', l: 'Antisliplak', l_de: 'Antirutschlack', l_en: 'Non-slip paint', kleur: '#d9d5cc' }
  ];

  var INTERIEURHOUT = [
    { v: 'walnoot', l: 'Amerikaans walnoot', l_de: 'Amerikanischer Nussbaum', l_en: 'American walnut', kleur: '#5a3c28', def: 1 },
    { v: 'eiken', l: 'Licht eiken', l_de: 'Helle Eiche', l_en: 'Light oak', kleur: '#c3a173' },
    { v: 'teakhout', l: 'Teak', l_de: 'Teak', l_en: 'Teak', kleur: '#8a6035' },
    { v: 'wenge', l: 'Wengé', l_de: 'Wengé', l_en: 'Wenge', kleur: '#33241c' },
    { v: 'essen', l: 'Essen wit geolied', l_de: 'Esche weiß geölt', l_en: 'White-oiled ash', kleur: '#ddd2c2' }
  ];

  var STOFFERING = [
    { v: 'zand', l: 'Zandkleurig leer', l_de: 'Sandfarbenes Leder', l_en: 'Sand leather', kleur: '#cbb69a', def: 1 },
    { v: 'antraciet', l: 'Antraciet leer', l_de: 'Anthrazitfarbenes Leder', l_en: 'Anthracite leather', kleur: '#3a3d40' },
    { v: 'offwhite', l: 'Off-white leer', l_de: 'Off-White-Leder', l_en: 'Off-white leather', kleur: '#e6e1d6' },
    { v: 'cognac', l: 'Cognac leer', l_de: 'Cognacfarbenes Leder', l_en: 'Cognac leather', kleur: '#9c6434' }
  ];

  /* ---------- de rest van het interieur ----------
     Hout en stoffering stuurden de salonrender; al het andere binnen stond
     vast. Dat is precies waar een koper in dit segment over doorvraagt: de
     vloer, de wanden, het marmer in de badkamer, de kleur van het beslag en
     het licht.

     WAAROM DIT GEEN NIEUWE RENDERS ZIJN
     De salon bestaat in tweehonderd uitvoeringen: vijf houtsoorten maal vier
     stofferingen maal tien modellen, en elke render toont exact die
     combinatie. Er vijf keuzes bij renderen zou dat tweehonderdduizend maken.
     Deze vijf komen daarom als materiaal in beeld - een staal met de naam
     erbij op de materiaalstaat - en niet als foto. Onder de salonrender staat
     met zoveel woorden welke twee keuzes die foto volgt en welke vijf niet.
     Dat is dezelfde afspraak als bij het boven- en vooraanzicht. */
  var VLOER = [
    { v: 'teakparket', l: 'Teak parket', l_de: 'Teakparkett', l_en: 'Teak parquet', kleur: '#8a6035', def: 1,
      noot: 'Het scheepshout bij uitstek: warm, slijtvast en bij slijtage opnieuw te schuren.', noot_de: 'Das Schiffsholz schlechthin: warm, strapazierfähig und bei Verschleiß neu abschleifbar.', noot_en: 'The classic yacht floor: warm, hard-wearing and sandable when it wears.' },
    { v: 'visgraat', l: 'Eiken visgraat', l_de: 'Eiche Fischgrät', l_en: 'Oak herringbone', kleur: '#c3a173',
      noot: 'Legpatroon uit de landhuisbouw. Vraagt meer legwerk en maakt de salon optisch langer.', noot_de: 'Verlegemuster aus dem Landhausbau. Mehr Verlegearbeit, und der Salon wirkt optisch länger.', noot_en: 'A pattern borrowed from country houses. More work to lay, and it lengthens the saloon to the eye.' },
    { v: 'steen', l: 'Natuursteen', l_de: 'Naturstein', l_en: 'Natural stone', kleur: '#b9b2a6',
      noot: 'Koel onder de voet en ongevoelig voor natte voeten uit de kuip. Zwaarder dan hout, dus alleen op het hoofddek.', noot_de: 'Kühl unter den Füßen und unempfindlich gegen nasse Füße aus dem Cockpit. Schwerer als Holz, daher nur auf dem Hauptdeck.', noot_en: 'Cool underfoot and indifferent to wet feet from the cockpit. Heavier than wood, so main deck only.' },
    { v: 'tapijt', l: 'Wollen tapijt', l_de: 'Wollteppich', l_en: 'Wool carpet', kleur: '#a89880',
      noot: 'Het stilste van de vier: dempt de loopgeluiden die op een schip door de hele romp dragen.', noot_de: 'Der leiseste der vier: dämpft die Trittgeräusche, die auf einem Schiff durch den ganzen Rumpf tragen.', noot_en: 'The quietest of the four: it absorbs footfall, which on a vessel carries through the whole hull.' }
  ];

  var WANDAFWERKING = [
    { v: 'panelen', l: 'Houten panelen', l_de: 'Holzpaneele', l_en: 'Timber panelling', kleur: '#6b4a30', def: 1,
      noot: 'Fineer in dezelfde houtsoort als de rest van het interieur.', noot_de: 'Furnier in derselben Holzart wie das übrige Interieur.', noot_en: 'Veneer in the same species as the rest of the interior.' },
    { v: 'stof', l: 'Stofpanelen', l_de: 'Stoffpaneele', l_en: 'Fabric panels', kleur: '#bdb3a2',
      noot: 'Dempt de nagalm in de salon merkbaar; de meest gekozen afwerking bij een lange salon.', noot_de: 'Dämpft den Nachhall im Salon spürbar; die meistgewählte Ausführung bei einem langen Salon.', noot_en: 'Noticeably reduces reverberation; the usual choice in a long saloon.' },
    { v: 'leer', l: 'Leerpanelen', l_de: 'Lederpaneele', l_en: 'Leather panels', kleur: '#7d5a3c',
      noot: 'Zelfde huid als de stoffering, op de wand gezet. Duur in onderhoud bij fel zonlicht.', noot_de: 'Dasselbe Leder wie die Polsterung, an der Wand. Bei starker Sonne aufwendig im Unterhalt.', noot_en: 'The same hide as the upholstery, taken up the wall. Costly to maintain in strong sun.' },
    { v: 'lak', l: 'Hoogglans lak', l_de: 'Hochglanzlack', l_en: 'High-gloss lacquer', kleur: '#e8e4dc',
      noot: 'Maakt de ruimte lichter en groter, maar toont elke vingerafdruk.', noot_de: 'Lässt den Raum heller und größer wirken, zeigt aber jeden Fingerabdruck.', noot_en: 'Makes the space lighter and larger, and shows every fingerprint.' }
  ];

  var MARMER = [
    { v: 'calacatta', l: 'Calacatta', l_de: 'Calacatta', l_en: 'Calacatta', kleur: '#efece5', def: 1,
      noot: 'Wit met een grove grijze ader. De klassieke keuze voor de eigenaarsbadkamer.', noot_de: 'Weiß mit kräftiger grauer Aderung. Die klassische Wahl für das Eignerbad.', noot_en: 'White with a bold grey vein. The classic choice for the owner\'s bathroom.' },
    { v: 'nero', l: 'Nero Marquina', l_de: 'Nero Marquina', l_en: 'Nero Marquina', kleur: '#2b2a28',
      noot: 'Diepzwart met witte aders. Vraagt om ruime verlichting, anders wordt de badkamer een grot.', noot_de: 'Tiefschwarz mit weißen Adern. Verlangt reichlich Licht, sonst wird das Bad zur Höhle.', noot_en: 'Deep black with white veining. It needs generous lighting, or the bathroom becomes a cave.' },
    { v: 'emperador', l: 'Emperador', l_de: 'Emperador', l_en: 'Emperador', kleur: '#5b4335',
      noot: 'Bruin met een fijne tekening; sluit aan op walnoot en teak.', noot_de: 'Braun mit feiner Zeichnung; passt zu Nussbaum und Teak.', noot_en: 'Brown with a fine figure; sits well with walnut and teak.' },
    { v: 'travertijn', l: 'Travertijn', l_de: 'Travertin', l_en: 'Travertine', kleur: '#cdbda4',
      noot: 'Warm en open van structuur. Poreus, dus hij moet behandeld blijven.', noot_de: 'Warm und offenporig. Porös, muss also versiegelt bleiben.', noot_en: 'Warm and open in structure. Porous, so it has to stay sealed.' }
  ];

  var METAAL = [
    { v: 'rvs', l: 'RVS geborsteld', l_de: 'Edelstahl gebürstet', l_en: 'Brushed stainless', kleur: '#b6bbc0', def: 1,
      noot: 'Het standaardbeslag: onverwoestbaar en overal na te leveren.', noot_de: 'Der Standardbeschlag: unverwüstlich und überall nachlieferbar.', noot_en: 'The standard fit: indestructible and replaceable anywhere.' },
    { v: 'zwart', l: 'Mat zwart', l_de: 'Mattschwarz', l_en: 'Matt black', kleur: '#26282b',
      noot: 'Strak en modern. Krassen vallen eerder op dan bij geborsteld staal.', noot_de: 'Klar und modern. Kratzer fallen eher auf als auf gebürstetem Stahl.', noot_en: 'Sharp and modern. Scratches show sooner than on brushed steel.' },
    { v: 'brons', l: 'Geborsteld brons', l_de: 'Bronze gebürstet', l_en: 'Brushed bronze', kleur: '#8a6a45',
      noot: 'Loopt in de jaren donkerder aan; dat patina is de bedoeling.', noot_de: 'Dunkelt über die Jahre nach; diese Patina ist gewollt.', noot_en: 'Darkens over the years; that patina is the point.' },
    { v: 'champagne', l: 'Champagnegoud', l_de: 'Champagnergold', l_en: 'Champagne gold', kleur: '#c3ab84',
      noot: 'Warm en licht, en de enige van de vier die met een lichte houtsoort niet wegvalt.', noot_de: 'Warm und hell, und als einziges der vier neben einem hellen Holz nicht unscheinbar.', noot_en: 'Warm and light, and the only one of the four that holds its own against a pale wood.' }
  ];

  var VERLICHTING = [
    { v: 'warm', l: 'Warm dimbaar', l_de: 'Warm dimmbar', l_en: 'Warm dimmable', kleur: '#e8c88a', def: 1,
      noot: 'Tweeduizendzevenhonderd kelvin, overal dimbaar. De huiskamerinstelling.', noot_de: 'Zweitausendsiebenhundert Kelvin, überall dimmbar. Die Wohnzimmereinstellung.', noot_en: 'Twenty-seven hundred kelvin, dimmable throughout. The living-room setting.' },
    { v: 'neutraal', l: 'Neutraal wit', l_de: 'Neutralweiß', l_en: 'Neutral white', kleur: '#e9e7e0',
      noot: 'Drieduizend kelvin. Houdt de kleuren van hout en leer dichter bij de werkelijkheid.', noot_de: 'Dreitausend Kelvin. Hält die Farben von Holz und Leder näher am Original.', noot_en: 'Three thousand kelvin. Keeps the colours of wood and leather closer to true.' },
    { v: 'nissen', l: 'Nisverlichting', l_de: 'Voutenbeleuchtung', l_en: 'Cove lighting', kleur: '#d8b877',
      noot: 'Licht uit de randen van plafond en meubel in plaats van uit spots. Geen schaduw op tafel.', noot_de: 'Licht aus den Kanten von Decke und Möbel statt aus Spots. Kein Schatten auf dem Tisch.', noot_en: 'Light from the edges of ceiling and joinery instead of downlights. No shadow on the table.' },
    { v: 'scenes', l: 'Instelbare lichtscenes', l_de: 'Programmierbare Lichtszenen', l_en: 'Programmable light scenes', kleur: '#9ec6d8',
      noot: 'Vaste standen voor diner, film en nachtvaart, met kleur. Vraagt een bus-installatie door het hele schip.', noot_de: 'Feste Einstellungen für Dinner, Film und Nachtfahrt, in Farbe. Erfordert eine Bus-Installation durch das ganze Schiff.', noot_en: 'Fixed settings for dinner, film and night passage, in colour. Needs a bus system through the whole vessel.' }
  ];

  /* ---------- motorisering ----------
     kwFactor    = kW per motor, per meter scheepslengte
     verbruikFactor = liter per uur voor alle motoren samen, per meter lengte,
                      gemeten bij de kruissnelheid hieronder
     Deze twee voeden de actieradius in het vaarprofiel. Ze zijn zo gekozen
     dat de uitkomsten in de orde van grootte liggen die bij dit scheepstype
     hoort; de werf vervangt ze door de meetwaarden van de proefvaart. */
  var MOTORISERING = [
    { v: 'standaard', l: 'Twee dieselmotoren, standaard vermogen', l_de: 'Zwei Dieselmotoren, Standardleistung', l_en: 'Twin diesels, standard output', aantal: 2,
      kwFactor: 30, verbruikFactor: 13, kruis: 18, top: 24, def: 1,
      omschrijving: 'De zuinigste keuze. Ruim voldoende voor binnenwater en kustvaart.', omschrijving_de: 'Die sparsamste Wahl. Mehr als ausreichend für Binnengewässer und Küstenfahrt.', omschrijving_en: 'The most economical choice. Ample for inland waters and coastal cruising.' },
    { v: 'zwaar', l: 'Twee dieselmotoren, zwaar vermogen', l_de: 'Zwei Dieselmotoren, erhöhte Leistung', l_en: 'Twin diesels, uprated output', aantal: 2,
      kwFactor: 40, verbruikFactor: 18, kruis: 22, top: 30,
      omschrijving: 'Meer reserve bij zwaar weer en tegenstroom, en een hogere kruissnelheid.', omschrijving_de: 'Mehr Reserve bei schwerem Wetter und Gegenströmung, und eine höhere Marschfahrt.', omschrijving_en: 'More reserve in heavy weather and against the current, and a higher cruising speed.' },
    { v: 'drie', l: 'Drie motoren met waterjets', l_de: 'Drei Motoren mit Wasserstrahlantrieb', l_en: 'Triple engines with waterjets', aantal: 3,
      kwFactor: 34, verbruikFactor: 22, kruis: 26, top: 36,
      omschrijving: 'Ondiepe diepgang en hoge snelheid. Waterjets manoeuvreren uitstekend maar zijn gevoelig voor drijfvuil.', omschrijving_de: 'Geringer Tiefgang und hohe Geschwindigkeit. Wasserstrahlantriebe manövrieren hervorragend, reagieren aber empfindlich auf Treibgut.', omschrijving_en: 'Shallow draught and high speed. Waterjets manoeuvre superbly but are sensitive to floating debris.' },
    { v: 'hybride', l: 'Diesel-elektrisch hybride', l_de: 'Diesel-elektrischer Hybrid', l_en: 'Diesel-electric hybrid', aantal: 2,
      kwFactor: 32, verbruikFactor: 9.5, kruis: 16, top: 22,
      omschrijving: 'Stil varen op de accu\'s in de haven en op beschermd water; diesel voor de lange afstand. Zwaarder en duurder, zuiniger op kruissnelheid.', omschrijving_de: 'Leises Fahren auf den Batterien im Hafen und auf geschütztem Wasser; Diesel für die lange Strecke. Schwerer und teurer, sparsamer bei Marschfahrt.', omschrijving_en: 'Silent running on batteries in harbour and sheltered water; diesel for the long haul. Heavier and dearer, but thriftier at cruising speed.' }
  ];

  /* ---------- opties ----------
     `perM` betekent: het bedrag geldt per meter scheepslengte in plaats van
     als vast bedrag. Dat is bij grote jachten gebruikelijk voor onder meer
     stabilisatoren en verlichting. */
  var OPTIES = [
    { v: 'stabilisatoren', l: 'Zero-speed stabilisatoren', l_de: 'Zero-Speed-Stabilisatoren', l_en: 'Zero-speed stabilisers',
      uit: 'Houden het schip ook voor anker rustig. In dit segment de meest gevraagde optie, en de optie die het meeste verschil maakt voor wie snel zeeziek is.', uit_de: 'Halten das Schiff auch vor Anker ruhig. In diesem Segment die meistgefragte Option, und die mit dem größten Unterschied für alle, die schnell seekrank werden.', uit_en: 'Keep the vessel steady at anchor as well as under way. The most requested option in this segment, and the one that makes the greatest difference to anyone prone to seasickness.' },
    { v: 'boegschroef', l: 'Boeg- en hekschroef', l_de: 'Bug- und Heckstrahlruder', l_en: 'Bow and stern thruster',
      uit: 'Zijwaarts aanleggen zonder sleepboot. Bij schepen boven de 20 meter eerder noodzaak dan luxe.', uit_de: 'Seitlich anlegen ohne Schlepper. Bei Schiffen über 20 Meter eher Notwendigkeit als Luxus.', uit_en: 'Berth sideways without a tug. Above twenty metres this is a necessity rather than a luxury.' },
    /* `vanaf` bij deze twee om dezelfde reden als bij het zwembad hieronder, en
       op hetzelfde getal, want ze delen de plek: het bovendek.

       Onder de vierentwintig meter ligt de bijboot in een garage in de spiegel
       of op het zwemplateau, niet aan een kraan - een dekkraan is er voor
       zwaardere schepen. En een bijboot loopt mee met de scheepslengte: de
       garagematen komen uit op ongeveer een zevende (50 m -> 7,0-7,5 m; 70 m ->
       9,0-9,5 m). Een tender van vier en een halve meter hoort dus bij een
       schip van rond de dertig, niet bij een van zestien.

       Het kleinste serieschip waar de jacuzzi werkelijk te bestellen is, is er
       een van drieentwintig en een halve meter - en daar is het een keuze
       tussen die drie: het bad, of een jetski met kraan, of extra ligbedden.
       Precies dezelfde plek. Op eenentwintig meter staat er op het flybridge
       ligbedden, een tafel en een bar, en geen bad.

       Vandaar 23: dat laat de Flybridge 24 wel kiezen en de Sport Coupe 16 en
       de Flybridge 19 niet. Zie BRONNEN onderaan. Vindt de werf dat zij het
       wel levert, dan is dit een getal en geen verbouwing. */
    { v: 'tenderkraan', l: 'Tenderkraan en bijboot', l_de: 'Tenderkran und Beiboot', l_en: 'Tender crane and tender', vanaf: 23,
      uit: 'Voor een bijboot van ongeveer een zevende van de scheepslengte: op vierentwintig meter ruim drie meter, op vijfenvijftig meter zeven a acht. Vraagt dekruimte en verhoogt het gewicht bovendeks.', uit_de: 'Für ein Beiboot von etwa einem Siebtel der Schiffslänge: bei vierundzwanzig Metern gut drei Meter, bei fünfundfünfzig Metern sieben bis acht. Benötigt Decksfläche und erhöht das Gewicht über Deck.', uit_en: 'For a tender of roughly a seventh of the yacht\'s length: a little over three metres on a twenty-four metre yacht, seven to eight on a fifty-five. Takes deck space and raises weight high in the vessel.' },
    { v: 'jacuzzi', l: 'Jacuzzi op het bovendek', l_de: 'Whirlpool auf dem Oberdeck', l_en: 'Jacuzzi on the sun deck', vanaf: 23,
      uit: 'Gevuld weegt een jacuzzi al gauw een ton, hoog in het schip. Dat vraagt om stabilisatoren erbij, en op het bovendek gaat hij ten koste van de plek voor een tenderkraan of ligbedden.', uit_de: 'Gefüllt wiegt ein Whirlpool schnell eine Tonne, hoch im Schiff. Das verlangt zusätzlich Stabilisatoren, und auf dem Oberdeck geht er zulasten des Platzes für Tenderkran oder Sonnenliegen.', uit_en: 'Filled, a jacuzzi weighs a tonne before you know it, and it sits high. That calls for stabilisers alongside it, and on the sun deck it takes the space that would otherwise hold a tender crane or sunbeds.' },
    /* `vanaf` is de lengte over alles waaronder een optie niet wordt aangeboden.
       Een zwembad van enkele kubieke meters vraagt dekbreedte en draagvermogen
       die een schip van twintig meter simpelweg niet heeft; het als keuze tonen
       zou een belofte zijn die de werf niet kan waarmaken. */
    { v: 'zwembad', l: 'Zwembad op het achterdek', l_de: 'Pool auf dem Achterdeck', l_en: 'Swimming pool on the aft deck', vanaf: 35,
      uit: 'Enkele kubieke meters water, vaak met glazen zijwand. Het water klotst mee met het schip, dus dit vraagt om stabilisatoren en om overleg met de werf over plaatsing.', uit_de: 'Mehrere Kubikmeter Wasser, oft mit gläserner Seitenwand. Das Wasser schwappt mit dem Schiff mit, das verlangt Stabilisatoren und eine Abstimmung mit der Werft über die Platzierung.', uit_en: 'Several cubic metres of water, often with a glass side panel. The water surges with the vessel, so this calls for stabilisers and for a conversation with the yard about placement.' },
    { v: 'zonnepanelen', l: 'Zonnepanelen op hardtop of T-top', l_de: 'Solarmodule auf Hardtop oder T-Top', l_en: 'Solar panels on hardtop or T-top',
      uit: 'Houdt de accu\'s op peil zonder de generator te laten draaien. Scheelt vooral geluid als je voor anker ligt.', uit_de: 'Hält die Batterien auf Stand, ohne den Generator laufen zu lassen. Spart vor allem Geräusch, wenn Sie vor Anker liegen.', uit_en: 'Keeps the batteries topped up without running the generator. Above all it saves noise at anchor.' },
    { v: 'watermaker', l: 'Watermaker', l_de: 'Wassermacher', l_en: 'Watermaker',
      uit: 'Maakt drinkwater uit zeewater. Onmisbaar zodra je langer dan een week weg bent van de haven.', uit_de: 'Erzeugt Trinkwasser aus Seewasser. Unverzichtbar, sobald Sie länger als eine Woche fern des Hafens sind.', uit_en: 'Makes drinking water from seawater. Indispensable once you are away from harbour for more than a week.' },
    { v: 'airco', l: 'Airconditioning met verwarming', l_de: 'Klimaanlage mit Heizung', l_en: 'Air conditioning with heating',
      uit: 'In dit segment vrijwel standaard; bij een donkere opbouw of veel glas een zwaardere installatie.', uit_de: 'In diesem Segment nahezu Standard; bei dunklem Aufbau oder viel Glas eine stärkere Anlage.', uit_en: 'All but standard in this segment; a darker superstructure or a lot of glazing calls for a heavier plant.' },
    { v: 'zwemplateau', l: 'Hydraulisch zwemplateau', l_de: 'Hydraulische Badeplattform', l_en: 'Hydraulic bathing platform',
      uit: 'Zakt onder water zodat je droog in de bijboot stapt en makkelijk zwemt. Draagt ook de jetski.', uit_de: 'Senkt sich unter Wasser, sodass Sie trocken ins Beiboot steigen und bequem schwimmen. Trägt auch den Jetski.', uit_en: 'Lowers below the surface so you step dry into the tender and swim easily. It carries the jet ski too.' },
    { v: 'onderwaterlicht', l: 'Onderwaterverlichting', l_de: 'Unterwasserbeleuchtung', l_en: 'Underwater lighting',
      uit: 'Vooral effect in helder water. Trekt \'s nachts vis aan, wat sommigen juist willen.', uit_de: 'Wirkt vor allem in klarem Wasser. Zieht nachts Fische an, was manche gerade wollen.', uit_en: 'Most effective in clear water. It draws fish at night, which some owners want precisely for that reason.' },
    { v: 'satelliet', l: 'Satelliet-internet en televisie', l_de: 'Satelliten-Internet und -Fernsehen', l_en: 'Satellite internet and television',
      uit: 'Werken vanaf het schip. Buiten de kust de enige verbinding die het houdt.', uit_de: 'Arbeiten vom Schiff aus. Außerhalb der Küstenreichweite die einzige Verbindung, die hält.', uit_en: 'Work from on board. Beyond the coast it is the only connection that holds.' }
  ];

  /* ---------- startpunten ----------
     De beste configurator in dit segment opent met kant-en-klare pakketten;
     dat werkt, omdat een leeg scherm met negen keuzegroepen afschrikt. Deze
     startpunten doen hetzelfde, maar benoemen ook waar het schip voor bedoeld
     is — dat is de vraag achter de vraag. Eén klik zet de hele samenstelling. */
  var STARTPUNTEN = [
    { v: 'weekend', l: 'Weekend op eigen water', l_de: 'Wochenende im Heimatrevier', l_en: 'A weekend on home water',
      uit: 'Dagvaren en af en toe blijven slapen, op Zeeuwse en Zuid-Hollandse wateren. Kort, wendbaar en zonder bemanning te varen.', uit_de: 'Tagesfahrten und gelegentlich an Bord übernachten, in geschützten Revieren. Kurz, wendig und ohne Crew zu fahren.', uit_en: 'Day cruising with the occasional night aboard, on sheltered coastal water. Compact, nimble and handled without crew.',
      zet: { model: 'sc16', rompkleur: 'nachtblauw', opbouw: 'wit', dek: 'hardtop',
             dekafwerking: 'teak', interieurhout: 'eiken', stoffering: 'offwhite',
             motorisering: 'standaard', opties: ['zwemplateau', 'boegschroef'] } },
    { v: 'familie', l: 'Familie op het IJsselmeer', l_de: 'Familie auf dem IJsselmeer', l_en: 'Family cruising on open inland water',
      uit: 'Vier hutten, beschut sturen vanaf het flybridge en genoeg reserve voor ruw water op het IJsselmeer en de Wadden.', uit_de: 'Vier Kabinen, geschützt steuern von der Flybridge und genug Reserve für raues Wasser auf IJsselmeer und Wattenmeer.', uit_en: 'Four cabins, sheltered helming from the flybridge and enough reserve for rough water on open inland seas.',
      zet: { model: 'fb19', rompkleur: 'parelwit', opbouw: 'wit', dek: 'flybridge',
             dekafwerking: 'teak', interieurhout: 'walnoot', stoffering: 'zand',
             motorisering: 'standaard', opties: ['boegschroef', 'airco', 'zwemplateau'] } },
    { v: 'middellandse', l: 'Zomer in de Middellandse Zee', l_de: 'Sommer im Mittelmeer', l_en: 'A summer in the Mediterranean',
      uit: 'Langere oversteken, een tender aan boord en stabilisatoren voor wie ook voor anker rustig wil liggen.', uit_de: 'Längere Überfahrten, ein Tender an Bord und Stabilisatoren für alle, die auch vor Anker ruhig liegen wollen.', uit_en: 'Longer passages, a tender aboard and stabilisers for anyone who wants to lie quietly at anchor too.',
      zet: { model: 'fb24', rompkleur: 'nachtblauw', opbouw: 'wit', dek: 'flybridge-ttop',
             dekafwerking: 'teak', interieurhout: 'teakhout', stoffering: 'cognac',
             motorisering: 'zwaar', opties: ['stabilisatoren', 'tenderkraan', 'airco', 'zwemplateau', 'watermaker'] } },
    { v: 'oceaan', l: 'Oceaanwaardig met bemanning', l_de: 'Hochseetauglich mit Crew', l_en: 'Ocean-capable, with crew',
      uit: 'Groot bereik, stil varen op de hybride aandrijving en volledige bemanningsaccommodatie. Boven de 25 meter, dus met Groot Pleziervaartbewijs.', uit_de: 'Große Reichweite, leises Fahren mit dem Hybridantrieb und vollständige Crewunterkunft. Über 25 Meter, also mit großem Sportbootführerschein.', uit_en: 'Long range, silent running on the hybrid drive and full crew accommodation. Above twenty-five metres, so a large-craft licence applies.',
      zet: { model: 'sy37', rompkleur: 'grafiet', opbouw: 'wit', dek: 'flybridge',
             dekafwerking: 'teak', interieurhout: 'wenge', stoffering: 'antraciet',
             motorisering: 'hybride', opties: ['stabilisatoren', 'watermaker', 'satelliet', 'zonnepanelen', 'airco', 'jacuzzi'] } }
  ];

  /* ---------- de prijstabel ----------
     Drie soorten bedragen, omdat kosten in deze markt niet allemaal op
     dezelfde manier meeschalen:

       vast   een bedrag in euro, ongeacht de scheepsgrootte
       perM   een bedrag per meter lengte over alles
       pct    een deel van de basisprijs van het gekozen model

     `pct` is voor deze markt de eerlijkste maat. Jachtprijzen lopen
     exponentieel op - een schip van vijftig meter kost geen twee keer maar
     vijf tot tien keer zoveel als een van vijfentwintig - en de meeste opties
     lopen met die curve mee. Een teakdek, metallic lak of een hybride
     aandrijving kost op een schip van honderdtwintig meter een veelvoud van
     hetzelfde op een van zestien. Een vast bedrag of een bedrag per meter zou
     aan één kant van de reeks altijd onzin zijn.

     `min` en `max` begrenzen die percentages waar de werkelijkheid dat ook
     doet. Stabilisatoren op een schip van honderdtwintig meter zijn duur, maar
     niet drie procent van driehonderd miljoen: er zit een bovengrens aan wat
     een set vinnen kost. Andersom kost de kleinste installatie nooit minder
     dan de ondergrens.

     Alle bedragen zijn exclusief btw. Zie BRONNEN onderaan dit bestand. */
  var PRIJZEN = {
    /* Basisprijzen. Elk bedrag ligt binnen de gepubliceerde bandbreedte voor
       zijn lengteklasse én binnen de gepubliceerde prijs per meter voor het
       bouwtype dat bij die lengte hoort (composiet semi-custom tot ongeveer
       vijfenveertig meter, staal semi-custom daarboven, volledig custom vanaf
       tachtig meter). De reeks loopt daarmee van ruim honderdduizend euro per
       meter bij het kleinste model tot bijna drie miljoen bij het grootste. */
    modellen: {
      sc16:         1650000,   // 16,4 m -  101 k/m
      fb19:         3150000,   // 19,2 m -  164 k/m
      fb24:         5600000,   // 23,8 m -  235 k/m
      td29:         9200000,   // 28,9 m -  318 k/m
      sy37:        14800000,   // 36,8 m -  402 k/m
      sport40:     19500000,   // 40,0 m -  488 k/m
      grand55:     38500000,   // 55,0 m -  700 k/m
      flagship70:  63000000,   // 70,0 m -  900 k/m
      elite90:    148000000,   // 90,0 m - 1,64 M/m
      giga120:    330000000    // 120  m - 2,75 M/m
    },

    /* Lak. Nachtblauw en parelwit zijn de standaardkleuren en zitten in de
       basisprijs. Donkere effen lakken vragen meer voorbereiding, metallic
       lakken zijn een vak apart: meer lagen, strengere omstandigheden en een
       reparatie die nooit onzichtbaar is. */
    rompkleuren: {
      nachtblauw: { pct: 0 },
      parelwit:   { pct: 0 },
      antraciet:  { pct: 0.004 },
      zeegroen:   { pct: 0.004 },
      champagne:  { pct: 0.012 },
      grafiet:    { pct: 0.012 }
    },

    /* Opbouw. Parelwit is standaard. De opbouw in de rompkleur betekent dat
       het dure lakwerk over veel meer oppervlak gaat. */
    opbouw: {
      wit:  { pct: 0 },
      zand: { pct: 0.003 },
      romp: { pct: 0.005 }
    },

    /* Dek en bovenbouw. Dit is een ladder: het verschil met het standaarddek
       van het gekozen model wordt gerekend, niet het bedrag zelf. Zo betaalt
       iemand die een flybridge kiest op een model waar dat standaard is,
       daar niets extra voor. */
    dekken: {
      open:              { pct: 0 },
      hardtop:           { pct: 0.015 },
      flybridge:         { pct: 0.035 },
      'flybridge-ttop':  { pct: 0.045 }
    },

    /* Dekafwerking. Teak is in dit segment de standaard en zit in de
       basisprijs; composiet kost ongeveer hetzelfde, want wat je bespaart op
       materiaal gaat op aan hetzelfde legwerk. Antisliplak scheelt wél echt:
       dat is geen dek leggen maar een dek schilderen. Vandaar een negatief
       bedrag - de configurator mag ook naar beneden. */
    dekafwerking: {
      teak:      { pct: 0 },
      composiet: { pct: 0 },
      antislip:  { pct: -0.006 }
    },

    /* Interieurhout. Alle vijf zijn fineer op dezelfde ondergrond; het
       verschil zit in inkoop en in hoeveel uitval een nerf oplevert. */
    interieurhout: {
      eiken:    { pct: 0 },
      essen:    { pct: 0 },
      walnoot:  { pct: 0.0015 },
      teakhout: { pct: 0.002 },
      wenge:    { pct: 0.0025 }
    },

    /* Stoffering. Zand en antraciet zijn de standaardstoffen; gebroken wit en
       cognac zijn leer, en licht leer vraagt meer selectie op de huid. */
    stoffering: {
      zand:      { pct: 0 },
      antraciet: { pct: 0 },
      offwhite:  { pct: 0.001 },
      cognac:    { pct: 0.0025 }
    },

    /* De rest van het interieur. Kleine percentages, en dat klopt: dit is
       afwerking op een oppervlak dat al betimmerd wordt, geen extra ruimte en
       geen extra installatie. De uitschieters zijn de steenvloer (gewicht en
       ondersteuning), de lichtscenes (een bus door het hele schip) en het
       zwarte marmer (meer uitval bij het uitzoeken van de platen). */
    vloer: {
      teakparket: { pct: 0 },
      visgraat:   { pct: 0.0012 },
      steen:      { pct: 0.0035 },
      tapijt:     { pct: -0.0005 }
    },
    wandafwerking: {
      panelen: { pct: 0 },
      stof:    { pct: 0.0008 },
      leer:    { pct: 0.0030 },
      lak:     { pct: 0.0018 }
    },
    marmer: {
      calacatta:  { pct: 0 },
      nero:       { pct: 0.0022 },
      emperador:  { pct: 0.0012 },
      travertijn: { pct: -0.0004 }
    },
    metaal: {
      rvs:       { pct: 0 },
      zwart:     { pct: 0.0009 },
      brons:     { pct: 0.0020 },
      champagne: { pct: 0.0026 }
    },
    verlichting: {
      warm:     { pct: 0 },
      neutraal: { pct: 0 },
      nissen:   { pct: 0.0016 },
      scenes:   { pct: 0.0045 }
    },

    /* Aandrijving. De zware lijn is een grotere motor in dezelfde ruimte, de
       waterjets vragen een ander achterschip, en diesel-elektrisch is een
       compleet andere installatie met generatoren, omvormers en accu's. */
    motorisering: {
      standaard: { pct: 0 },
      zwaar:     { pct: 0.025 },
      drie:      { pct: 0.040 },
      hybride:   { pct: 0.090 }
    },

    /* Opties. De onder- en bovengrenzen komen uit gepubliceerde prijzen voor
       de installaties zelf; het percentage daartussen laat ze meeschalen met
       het schip. Zie BRONNEN. */
    opties: {
      stabilisatoren:  { pct: 0.030, min: 55000,  max: 4500000 },
      boegschroef:     { pct: 0.008, min: 12000,  max: 900000 },
      tenderkraan:     { pct: 0.006, min: 18000,  max: 650000 },
      jacuzzi:         { pct: 0.0035, min: 22000, max: 450000 },
      zwembad:         { pct: 0.011, min: 180000, max: 3500000 },
      zonnepanelen:    { pct: 0.0025, min: 9000,  max: 400000 },
      watermaker:      { pct: 0.0018, min: 11000, max: 350000 },
      airco:           { pct: 0.009, min: 14000,  max: 1800000 },
      zwemplateau:     { pct: 0.007, min: 16000,  max: 900000 },
      onderwaterlicht: { pct: 0.0012, min: 4500,  max: 180000 },
      satelliet:       { pct: 0.0022, min: 13000, max: 500000 }
    }
  };

  /* Rekent één post uit. `basis` is de basisprijs van het gekozen model,
     `loa` de lengte over alles. Alle drie de soorten bedragen komen hier
     samen, zodat de configurator, het dossier en de PDF gegarandeerd hetzelfde
     getal tonen - eerder rekende elk van die drie het zelf uit, en dat is
     precies hoe bedragen uit elkaar gaan lopen. */
  function postPrijs(post, basis, loa) {
    if (!post) return 0;
    if (typeof post === 'number') return post;
    var bedrag = post.vast || 0;
    if (post.perM) bedrag += post.perM * loa;
    if (post.pct) bedrag += post.pct * basis;
    if (post.min && bedrag > 0 && bedrag < post.min) bedrag = post.min;
    if (post.max && bedrag > post.max) bedrag = post.max;
    return Math.round(bedrag);
  }

  /* De volledige richtprijs van een samenstelling, opgesplitst per post zodat
     het dossier hem kan uitschrijven. */
  function prijsVan(st, D) {
    var m = null, i;
    for (i = 0; i < MODELLEN.length; i++) if (MODELLEN[i].v === st.model) m = MODELLEN[i];
    if (!m || !PRIJZEN_ACTIEF) return null;
    var basis = PRIJZEN.modellen[st.model] || 0, loa = m.loa;
    var p = function (groep, sleutel) { return postPrijs(PRIJZEN[groep][sleutel], basis, loa); };
    /* het dek wordt afgezet tegen het standaarddek van dit model */
    var dekVerschil = p('dekken', st.dek) - p('dekken', m.dekken[0]);
    var posten = [
      { l: 'Basisprijs ' + m.l, bedrag: basis },
      { l: 'Rompkleur',     bedrag: p('rompkleuren', st.rompkleur) },
      { l: 'Opbouwkleur',   bedrag: p('opbouw', st.opbouw) },
      { l: 'Dek en bovenbouw', bedrag: dekVerschil },
      { l: 'Dekafwerking',  bedrag: p('dekafwerking', st.dekafwerking) },
      { l: 'Interieurhout', bedrag: p('interieurhout', st.interieurhout) },
      { l: 'Stoffering',    bedrag: p('stoffering', st.stoffering) },
      { l: 'Vloer',         bedrag: p('vloer', st.vloer) },
      { l: 'Wandafwerking', bedrag: p('wandafwerking', st.wandafwerking) },
      { l: 'Marmer',        bedrag: p('marmer', st.marmer) },
      { l: 'Metaalafwerking', bedrag: p('metaal', st.metaal) },
      { l: 'Verlichting',   bedrag: p('verlichting', st.verlichting) },
      { l: 'Motorisering',  bedrag: p('motorisering', st.motorisering) }
    ];
    var optieSom = 0, opties = [];
    (st.opties || []).forEach(function (v) {
      var b = postPrijs(PRIJZEN.opties[v], basis, loa);
      optieSom += b;
      opties.push({ v: v, bedrag: b });
    });
    var totaal = optieSom;
    posten.forEach(function (x) { totaal += x.bedrag; });
    return { basis: basis, posten: posten, opties: opties, optieSom: optieSom,
             totaal: totaal, btw: totaal * BTW, inclusief: totaal * (1 + BTW) };
  }

  /* ---------- bronnen ----------
     Elk cijfer hierboven is terug te voeren op openbaar marktonderzoek van
     augustus 2026. Dit blok staat hier zodat een lezer kan nagaan waar een
     bedrag vandaan komt in plaats van het te moeten geloven. */
  var BRONNEN = [
    { onderwerp: 'Nieuwbouwprijzen per lengteklasse',
      cijfer: '24-30 m EUR 3-15 mln; 30-40 m EUR 8-25 mln; 40-50 m EUR 15-50 mln; ' +
              '50-70 m EUR 25-80 mln; 70-100 m EUR 60-200 mln; 100 m+ EUR 150-500 mln',
      bron: 'SuperYachtReview, Superyacht Cost Guide',
      url: 'https://superyachtreview.com/intelligence/superyacht-cost-guide' },
    { onderwerp: 'Prijs per meter per bouwtype',
      cijfer: 'semi-custom composiet 30-44 m EUR 250-450 k/m; semi-custom staal 45-72 m ' +
              'EUR 500-900 k/m; volledig custom 80 m+ EUR 2,5-5 mln/m',
      bron: 'SuperYachtReview, Superyacht Cost Guide',
      url: 'https://superyachtreview.com/intelligence/superyacht-cost-guide' },
    { onderwerp: 'Exponentieel verloop',
      cijfer: 'een jacht van 50 m kost geen twee keer maar vijf tot tien keer zoveel als een van 25 m',
      bron: 'Ocean Independence, How Much Does a Superyacht Cost',
      url: 'https://www.oceanindependence.com/articles/how-much-does-a-superyacht-cost/' },
    { onderwerp: 'Bemanningsomvang naar lengte',
      cijfer: '24-30 m: 2-8; 30-60 m: 8-20; 60 m+: 20 of meer; 100 m+: 30-50; ' +
              'vuistregel ongeveer een bemanningslid per drie a vier meter',
      bron: 'YPI Crew',
      url: 'https://www.ypicrew.com/how-many-crew-members-are-needed-on-a-yacht' },
    { onderwerp: 'Regelgeving naar tonnage en lengte',
      cijfer: 'Large Yacht Code vanaf 24 m lastlijnlengte en ten hoogste 12 passagiers; ' +
              'boven 200 GT een International Minimum Safe Manning Certificate; ' +
              'vanaf 500 GT gelden SOLAS, ISM, ISPS en de MLC volledig',
      bron: 'MCA Large Commercial Yacht Code (LY3)',
      url: 'https://assets.publishing.service.gov.uk/media/5a81a95aed915d74e33ff69c/LY3_-_Final_Version.pdf' },
    { onderwerp: 'Bouwtijd',
      cijfer: 'onder 40 m 18-24 maanden; boven 60 m 30-36 maanden; ' +
              'custom 18-36 maanden, complexe projecten 24-60 maanden',
      bron: 'YATCO, Building a Yacht: phases and timelines',
      url: 'https://blog.yatco.com/building-a-yacht-process/' },
    { onderwerp: 'Stabilisatoren',
      cijfer: 'gyro op 8 m circa USD 25 k; vinnensysteem op 18 m USD 80-150 k gemonteerd; ' +
              'vinnensysteem op 24 m USD 300 k en hoger',
      bron: 'Yacht Trading, Yacht Stabilizers Guide 2026',
      url: 'https://e.yachttrading.net/blog/yacht-stabilizers-zero-speed-gyro-guide-2026.html' },
    { onderwerp: 'Jacuzzi: vanaf welke lengte',
      cijfer: 'op een flybridgejacht van 23,6 m is het bad een optie, en een keuze tussen ' +
              'drie dingen op dezelfde plek: spa tub, jetski met kraan of extra ligbedden; ' +
              'op 21,3 m heeft het flybridge ligbedden, een tafel en een bar en geen bad',
      bron: 'Sunseeker 76 Yacht (23,6 m) en Absolute Navetta 70 (21,3 m)',
      url: 'https://www.sunseeker.com/yachts-and-boats/yacht/76-yacht' },
    { onderwerp: 'Tenderkraan: vanaf welke lengte, en welke bijboot',
      cijfer: 'onder 30 m ligt de tender in een garage in de spiegel of op het zwemplateau; ' +
              'een dekkraan hoort bij zwaardere schepen. Bijbootmaat loopt mee met de ' +
              'scheepslengte: 50 m -> 7,0-7,5 m, 60 m -> 8,0-8,5 m, 70 m -> 9,0-9,5 m, ' +
              'dus ongeveer een zevende',
      bron: 'YachtBuyer, Tender Launch and Recovery Systems; Superyacht Tenders, Tender Garage Sizing',
      url: 'https://www.yachtbuyer.com/en/advice/yacht-tender-launch-and-recovery-systems' },
    { onderwerp: 'Boeg- en hekschroef',
      cijfer: 'set USD 2-20 k, montage USD 1,5-15 k',
      bron: 'Australian Marine Sales, cost of a bow thruster',
      url: 'https://australianmarinesales.com.au/bow-stern-thrusters/what-is-the-cost-of-a-bow-thruster-a-price-breakdown/' },
    { onderwerp: 'Watermaker',
      cijfer: 'instap USD 4-7 k, midden USD 7-15 k, grote installaties USD 15-30 k en hoger; ' +
              'montage 25-35 procent bovenop de aanschaf',
      bron: 'PureOcean Marine, marine watermaker prices',
      url: 'https://www.pureoceanmarine.com/blogs/news/marine-watermaker-prices' },
    { onderwerp: 'Jaarlijkse exploitatie',
      cijfer: 'boven 50 m 12-15 procent van de marktwaarde per jaar; boven 80 m 15-20 procent',
      bron: 'SuperYachtReview, Superyacht Cost Guide',
      url: 'https://superyachtreview.com/intelligence/superyacht-cost-guide' }
  ];

  /* ---------- werfgegevens en vaste teksten ----------
     Alles wat het dossier over de afzender zegt komt hieruit; een werf die
     dit systeem afneemt vervangt alleen dit blok. */
  var WERF = {
    naam: 'Next Growth',
    ondertitel: 'Demonstratieconfigurator',
    web: 'nextgrowthdigital.nl',
    email: 'info@nextgrowthdigital.nl',
    telefoon: '06 83 90 21 92',
    demo: true
  };

  var DISCLAIMERS = {
    bemanning: 'De genoemde bemanningsbehoefte is een indicatie op basis van de gekozen configuratie. Definitieve eisen zijn afhankelijk van vlagstaat, classificatie, vaargebied, gebruik, brutotonnage en toepasselijke wet- en regelgeving. Laat de uiteindelijke bemannings- en certificeringseisen bevestigen door de werf, maritiem adviseur en het betrokken klassenbureau.',
    prijs: 'Prijs op aanvraag. De definitieve prijs wordt door de werf vastgesteld op basis van technische specificaties, materiaalkeuzes, levering, belastingen en aanvullende maatwerkopdrachten.',
    dossier: [
      'Dit document is een indicatieve configuratiesamenvatting, geen definitieve offerte en geen bouwcontract.',
      'Afbeeldingen kunnen impressies zijn; kleuren kunnen per scherm en per materiaal afwijken.',
      'Specificaties en prijzen kunnen zonder aankondiging veranderen.',
      'Gekozen opties kunnen technische gevolgen hebben voor gewicht, stabiliteit, bereik en bemanning; de werf beoordeelt de definitieve uitvoerbaarheid.',
      'Vaarbewijs-, bemannings- en certificeringseisen moeten extern worden bevestigd door de werf, een maritiem adviseur en het betrokken klassenbureau.',
      'Dit is een demonstratieconfigurator: de getoonde modellen zijn voorbeeldmodellen en de specificaties zijn voorbeeldwaarden totdat een werf de eigen gegevens invoert.'
    ]
  };

  /* ---------- datavalidatie ----------
     Meldt in de console welke verplichte gegevens ontbreken. Het onderscheid
     is bewust: commerciele gegevens (prijs, bouwtijd) mogen ontbreken en
     worden "Op aanvraag"; technische gegevens die ontbreken zijn een
     beheerderstaak en worden hier met naam en toenaam genoemd. */
  function audit() {
    var technisch = ['lwl', 'breedte', 'diepgang', 'verplaatsing', 'gasten',
                     'hutten', 'badkamers', 'slaapgasten', 'bemanningMin',
                     'bemanningAanbevolen', 'bemanningMax', 'bemanningHutten',
                     'dekkenAantal', 'tank', 'watertank'];
    var uit = [];
    MODELLEN.forEach(function (m) {
      var mist = technisch.filter(function (v) { return m[v] === null || m[v] === undefined; });
      if (mist.length) uit.push({ model: m.v, ontbreekt: mist });
    });
    if (uit.length && typeof console !== 'undefined') {
      uit.forEach(function (r) {
        console.warn('[jacht-data] model ' + r.model + ' mist technische gegevens: ' +
          r.ontbreekt.join(', ') + '. Het dossier meldt dit als beheerderstaak.');
      });
    }
    return uit;
  }

  global.NGJachtData = {
    prijzenActief: PRIJZEN_ACTIEF,
    valuta: VALUTA, btw: BTW, koersen: KOERSEN,
    startpunten: STARTPUNTEN,
    modellen: MODELLEN,
    rompkleuren: ROMPKLEUREN,
    opbouw: OPBOUW,
    dekken: DEKKEN,
    dekafwerking: DEKAFWERKING,
    interieurhout: INTERIEURHOUT,
    stoffering: STOFFERING,
    vloer: VLOER,
    wandafwerking: WANDAFWERKING,
    marmer: MARMER,
    metaal: METAAL,
    verlichting: VERLICHTING,
    motorisering: MOTORISERING,
    opties: OPTIES,
    prijzen: PRIJZEN,
    /* Eén rekenpunt voor de configurator, het dossier en de PDF. */
    prijsVan: prijsVan,
    postPrijs: postPrijs,
    bronnen: BRONNEN,
    werf: WERF,
    disclaimers: DISCLAIMERS,
    audit: audit
  };
})(typeof window !== 'undefined' ? window : globalThis);
