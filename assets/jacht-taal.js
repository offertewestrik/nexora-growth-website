/* Taallaag van de jachtconfigurator.
 *
 * De configurator draait op één codebestand voor beide talen. De taal komt uit
 * het lang-attribuut van de pagina: jacht-configurator.html is Nederlands,
 * yacht-configurator.html is Engels. Zo ziet een zoekmachine per pagina echte
 * tekst in die taal staan in plaats van Nederlandse tekst die pas na het laden
 * door javascript wordt omgezet.
 *
 * De sleutel van een vertaling is de Nederlandse zin zelf. Dat leest in de code
 * prettiger dan een verzonnen sleutel als `doek.noot.boven`, en het heeft een
 * nuttige eigenschap: staat een zin niet in de lijst, dan komt de Nederlandse
 * tekst terug. Een vergeten vertaling levert dus nooit een lege plek of een
 * zichtbare sleutel op — hooguit één Nederlandse zin tussen de Engelse.
 *
 * Wat hier NIET in staat: de modelnamen, de kleurnamen en de omschrijvingen.
 * Die horen bij de gegevens en staan daarom in jacht-data.js, naast het
 * Nederlandse origineel, in velden met het achtervoegsel _en.
 */
(function (global) {
  'use strict';

  var EN = {
    /* De materiaalkamers: de interieurkeuzes in een echte ruimte. */
    'Salon met ':
      'Saloon in ',
    ' en ':
      ' and ',
    'Jouw salon':
      'Your saloon',
    'Deze vier keuzes volgt het beeld werkelijk.':
      'The rendering follows these four choices exactly.',
    'Van deze combinatie is nog geen salonopname gemaakt. ':
      'No saloon rendering has been made of this combination yet. ',
    'De materialen staan hieronder als staal; de opname volgt.':
      'The materials are shown below as samples; the rendering follows.',
    'Badkamer in ':
      'Bathroom in ',
    'Jouw badkamer':
      'Your bathroom',
    'Alle zestien combinaties van marmer en metaal staan klaar.':
      'All sixteen combinations of marble and metal are ready.',
    'Lichtstanden':
      'Lighting settings',
    'dezelfde salon, vier keer anders verlicht. Klik om te wisselen.':
      'the same saloon, lit four different ways. Click to switch.',

    'bovenaanzicht':
      'top view',
    'dekindeling':
      'deck layout',
    'Indeling per dek, uit de maten van dit model en je gekozen opties; de werf bepaalt de werkelijke indeling':
      'Deck layout, drawn from this model\u2019s dimensions and your chosen options; the yard determines the actual arrangement',
    'De indeling volgt de maten van de ':
      'The layout follows the dimensions of the ',
    ' en je keuzes: ':
      ' and your choices: ',
    ' hutten, ':
      ' cabins, ',
    ' hut, ':
      ' cabin, ',
    ' badkamers, ':
      ' bathrooms, ',
    ' badkamer, ':
      ' bathroom, ',
    ' bemanningshutten en ':
      ' crew cabins and ',
    ' bemanningshut en ':
      ' crew cabin and ',
    'dek':
      'deck',
    'een dek':
      'one deck',
    ' dekken':
      ' decks',
    'De volgorde van de ruimtes is de gangbare indeling in dit segment: machinekamer achterin, gastenhutten onder de waterlijn, eigenaarshut op het hoofddek zodra het schip daar breed genoeg voor is.':
      'The order of the spaces is the arrangement customary in this segment: engine room aft, guest cabins below the waterline, and the owner\u2019s cabin on the main deck once the vessel is wide enough for it.',
    'De werf bepaalt de werkelijke indeling; dit is een schema, geen werftekening.':
      'The yard determines the actual layout; this is a schematic, not a shipyard drawing.',
    ' met ':
      ' with ',
    '; de rompkleur volgt hier je keuze nog niet.':
      '; the hull colour does not follow your choice here yet.',
    ' van de catalogusuitvoering; romp- en dekkleur volgen hier je keuzes nog niet.':
      ' of the catalogue specification; hull and deck colour do not follow your choices here yet.',
    ' Het exacte beeld van je samenstelling staat onder Zijaanzicht.':
      ' The exact image of your specification is under Side view.',
    'ALLES OP DEZELFDE SCHAAL':
      'ALL TO THE SAME SCALE',
    'DOORVAARTHOOGTE':
      'AIR DRAUGHT',
    /* De maten in deze twee komen nu uit de eenhedenmodule en staan dus niet
       meer in de sleutel: die zou bij een omschakeling naar voet niet meer
       raken en het woord ervoor Nederlands laten staan. */
    'huis':
      'house',
    'auto':
      'car',
    /* DE TEKENINGEN OP HET DOEK
       Deze staan er sinds het doek zelf ook door de vertaling gaat. Het waren
       de enige plekken op de Engelse pagina waar nog onvertaald Nederlands
       stond - een bovenaanzicht met SALON, COCKPIT en "5 HUTTEN ONDERDEKS"
       erin, en een noot die halverwege van het Engels in het Nederlands
       viel. Ze staan in hoofdletters omdat de vervanging korte woorden alleen
       tussen > en < aanraakt; in hoofdletters mag hij overal, en op deze
       tekeningen is elke hoofdletterreeks zichtbare tekst.

       Let op de volgorde van vervangen: die gaat van lang naar kort, dus
       EETSALON is al weg voordat SALON aan de beurt is, en BEMANNINGSHUTTEN
       voordat HUTTEN en HUT komen. Zet er niets tussen dat korter is dan een
       woord waar het in zit. */
    'ONDERDEK':
      'LOWER DECK',
    'HOOFDDEK':
      'MAIN DECK',
    'BRUGDEK':
      'BRIDGE DECK',
    'BOVENDEK':
      'UPPER DECK',
    'ZONNEDEK':
      'SUN DECK',
    'EIGENAARSDEK':
      'OWNER&#8217;S DECK',
    'OBSERVATIEDEK':
      'OBSERVATION DECK',
    'ACHTERDEK':
      'AFT DECK',
    'EETSALON':
      'DINING SALOON',
    'BOVENSALON':
      'UPPER SALOON',
    'ZONNESALON':
      'SUN SALOON',
    'PANORAMALOUNGE':
      'PANORAMA LOUNGE',
    'SKYLOUNGE':
      'SKY LOUNGE',
    'KAARTENKAMER':
      'CHART ROOM',
    'PRIVEDEK':
      'PRIVATE DECK',
    'MACHINEKAMER':
      'ENGINE ROOM',
    'EIGENAARSSUITE':
      'OWNER&#8217;S SUITE',
    'EIGENAARSHUT':
      'OWNER&#8217;S CABIN',
    'BEMANNINGSHUTTEN':
      'CREW CABINS',
    'HUTTEN ONDERDEKS':
      'CABINS BELOW DECK',
    'FLYBRIDGE ERBOVEN':
      'FLYBRIDGE ABOVE',
    'BOVENAANZICHT':
      'TOP VIEW',
    'VOORAANZICHT':
      'BOW VIEW',
    'SCHEMATISCH':
      'SCHEMATIC',
    'STUURSTAND':
      'UPPER HELM',
    'STUURHUIS':
      'WHEELHOUSE',
    'LIGBEDDEN':
      'SUNBEDS',
    'BADKAMERS':
      'BATHROOMS',
    'BOEGSCHROEF':
      'BOW THRUSTER',
    'BEMANNING':
      'CREW',
    'VOORDEK':
      'FOREDECK',
    'ZWEMBAD':
      'POOL',
    'KOMBUIS':
      'GALLEY',
    'DEKPLAN':
      'DECK PLAN',
    'PLATEAU':
      'PLATFORM',
    'UITKIJK':
      'LOOKOUT',
    'ENTREE':
      'LOBBY',
    'GASTEN':
      'GUESTS',
    'HUTTEN':
      'CABINS',
    'KRAAN':
      'CRANE',
    'SALON':
      'SALOON',
    'VIP-HUT':
      'VIP CABIN',
    'GANG':
      'PASSAGE',
    'HUT':
      'CABIN',
    'VIN':
      'FIN',
    'ZON':
      'SUN',
    /* 'over alles', 'breedte' en 'diepgang' staan verderop als los woord: de
       eenheid ervoor komt uit de eenhedenmodule en hoort dus niet meer in de
       sleutel te zitten. Stond hij er wel in, dan bleef een tekening in voeten
       half Nederlands. */

    'Zijaanzicht':
      'Side view',
    'Bovenaanzicht':
      'Top view',
    'Vooraanzicht':
      'Bow view',
    'Achteraanzicht':
      'Stern view',
    'Interieur':
      'Interior',
    'Op schaal':
      'To scale',
    'Nacht':
      'Night',
    'Aanzicht kiezen':
      'Choose a view',
    'Dekindeling':
      'Deck layout',
    'Boegvorm en dekopbouw':
      'Bow shape and superstructure',
    'Spiegel, zwemplateau en achterdekken':
      'Transom, bathing platform and aft decks',
    'Maatschets':
      'Dimensioned drawing',
    'Ruimtes aan boord':
      'Spaces on board',
    'Salon':
      'Main saloon',
    'Volgt je hout- en stofferingskeuze.':
      'Follows your timber and upholstery choice.',
    'Ruimte':
      'Space',
    'Maten nog niet vastgesteld':
      'Dimensions not yet established',
    '360&deg;-weergave nog niet beschikbaar':
      '360&deg; view not yet available',
    'Richtprijs':
      'Guide price',
    'Richtprijs excl. btw':
      'Guide price excl. VAT',
    'op aanvraag':
      'on request',
    'lengte over alles':
      'length overall',
    'breedte':
      'beam',
    'diepgang':
      'draught',
    'gasten':
      'guests',
    'hutten':
      'cabins',
    'bemanning':
      'crew',
    'badkamers':
      'bathrooms',
    'kruissnelheid':
      'cruising speed',
    'bereik':
      'range',
    'vaarbewijs':
      'licence',
    'doorvaarthoogte':
      'air draught',
    'vaarregime':
      'operating regime',
    'Vanaf 40 meter is het schip geen pleziervaartuig meer. Dan gelden certificering, bemanningseisen en vlagstaatregels waar deze module niet over gaat.':
      'From forty metres a vessel is no longer a pleasure craft. Certification, manning requirements and flag state rules then apply, which this module does not cover.',
    'Dit valt buiten het vaarprofiel. Laat het beoordelen door de werf en een klassenbureau.':
      'This falls outside the performance profile. Have it assessed by the yard and a classification society.',
    'De waterlijnlengte ontbreekt in de modeltabel; zonder die maat is er geen rompsnelheid te bepalen.':
      'The waterline length is missing from the model table; without it no hull speed can be determined.',
    'Open dossier':
      'Open dossier',
    'Download PDF':
      'Download PDF',
    'Deel configuratie':
      'Share configuration',
    'Link gekopieerd':
      'Link copied',
    'Kopieer deze link:':
      'Copy this link:',
    'Downloaden mislukt':
      'Download failed',
    'Alleen het vaarprofiel V-01':
      'Performance profile V-01 only',
    'Vergrote weergave van je jacht':
      'Enlarged view of your yacht',
    'Begin hier':
      'Start here',
    'Dek en bovenbouw':
      'Deck and superstructure',
    'Jouw jachtdossier':
      'Your yacht dossier',
    'Richtprijs van deze samenstelling, exclusief btw en exclusief afleveringskosten. Inclusief ':
      'Guide price for this specification, excluding VAT and delivery. Including ',
    '% btw: ':
      '% VAT: ',
    ' Bouwtijd vanaf contract circa ':
      ' Build time from contract approximately ',
    ' maanden.':
      ' months.',
    'Model':
      'Model',
    'Rompkleur':
      'Hull colour',
    'Opbouw':
      'Superstructure',
    'Dek':
      'Deck',
    /* De vijf interieurafwerkingen en het blad waarop ze staan. De
       materiaalstaat is een tekening, en die loopt via vertaalHtml - dat is
       een platte tekstvervanging zonder de hoofdletterregel van T(), dus de
       gezette koppen staan hier ook in kapitalen. */
    'Vloer':
      'Flooring',
    'VLOER':
      'FLOORING',
    'Wandafwerking':
      'Wall finish',
    'WANDAFWERKING':
      'WALL FINISH',
    'Marmer badkamer':
      'Bathroom marble',
    'MARMER BADKAMER':
      'BATHROOM MARBLE',
    'Marmer':
      'Marble',
    'Metaalafwerking':
      'Metal finish',
    'METAALAFWERKING':
      'METAL FINISH',
    'Verlichting':
      'Lighting',
    'VERLICHTING':
      'LIGHTING',
    'Materialen':
      'Materials',
    'MATERIAALSTAAT &#183; INTERIEUR':
      'MATERIAL SCHEDULE &#183; INTERIOR',
    'MATERIAALSTAAT':
      'MATERIAL SCHEDULE',
    'INTERIEURHOUT':
      'INTERIOR TIMBER',
    'STOFFERING':
      'UPHOLSTERY',
    'Deze twee stuurt de salonrender werkelijk aan; de andere vijf staan hier als staal en niet als foto.':
      'These two are what the saloon rendering actually follows; the other five appear here as samples, not as photographs.',
    'Materiaalstaat van het interieur van de ':
      'Material schedule for the interior of the ',
    'De gouden stip staat bij de twee keuzes die de salonrender werkelijk volgt. De werf bepaalt de leverancier en de exacte tint.':
      'The gold dot marks the two choices the saloon rendering actually follows. The yard determines the supplier and the exact shade.',
    'Deze salon staat in ':
      'This saloon is shown in ',
    '. Die twee volgt het beeld werkelijk. ':
      '. The image genuinely follows those two. ',
    'Je vloer, wandafwerking, marmer, metaalafwerking en verlichting staan als staal onder Materialen; die vijf zijn op deze opname de catalogusuitvoering.':
      'Your flooring, wall finish, marble, metal finish and lighting appear as samples under Materials; on this photograph those five show the catalogue specification.',
    /* Eenheden en valuta. */
    'Maten':
      'Units',
    'meter':
      'metres',
    'voet':
      'feet',
    'meters, liters en tonnen':
      'metres, litres and tonnes',
    'voeten, gallons en long tons':
      'feet, gallons and long tons',
    'Valuta':
      'Currency',
    'Eenheden en valuta':
      'Units and currency',
    'de contractvaluta van de werf':
      'the yard\u2019s contract currency',
    'omgerekend tegen de koers van ':
      'converted at the rate of ',
    'Bedragen in vreemde valuta zijn omgerekend tegen de koers van ':
      'Amounts in foreign currency are converted at the rate of ',
    ' en zijn indicatief; de werf sluit af in euro\u2019s.':
      ' and are indicative; the yard contracts in euros.',
    'INHOUD':
      'CONTENTS',
    'Het schip':
      'The vessel',
    'HET SCHIP':
      'THE VESSEL',
    '01  ·  Het schip':
      '01  ·  The vessel',
    '01  ·  HET SCHIP':
      '01  ·  THE VESSEL',
    '02  ·  Aan boord':
      '02  ·  On board',
    '02  ·  AAN BOORD':
      '02  ·  ON BOARD',
    '03  ·  Indeling':
      '03  ·  Layout',
    '03  ·  INDELING':
      '03  ·  LAYOUT',
    '04  ·  Techniek':
      '04  ·  Engineering',
    '04  ·  TECHNIEK':
      '04  ·  ENGINEERING',
    'Jouw keuzes':
      'Your choices',
    'UW KEUZES':
      'YOUR CHOICES',
    'Materiaalstaat van het interieur':
      'Material schedule for the interior',
    'Indicatieve demonstratiewaarden, te valideren door de werf.':
      'Indicative demonstration values, to be validated by the yard.',
    'Interieur  ·  hout, stoffering en afwerking':
      'Interior  ·  timber, upholstery and finishes',
    'Naast de salon hierboven telt dit model de volgende ruimtes. De salon volgt je keuze van hout en stoffering exact; de ruimtes hieronder tonen de catalogusafwerking.':
      'Besides the saloon above, this model has the following spaces. The saloon follows your timber and upholstery choice exactly; the spaces below show the catalogue finish.',
    '4.  Offerte met definitieve prijsopbouw':
      '4.  Quotation with the final price breakdown',
    '5.  Contract en bouw':
      '5.  Contract and build',
    'Waarom deze aandrijving past: het schip vaart in het ':
      'Why this propulsion suits her: the vessel runs in the ',
    ' regime bij een rompsnelheid van ':
      ' regime at a hull speed of ',
    'Het bereik rekent met 90% bruikbare tankinhoud; 10% blijft als reserve buiten de som.':
      'The range assumes 90% usable tank capacity; 10% is left out of the sum as reserve.',
    'Bij avond':
      'After dark',
    'De nachtopname toont de catalogusuitvoering: nachtblauw met parelwitte opbouw. ':
      'The night photograph shows the catalogue specification: midnight blue with a pearl-white superstructure. ',
    'Je eigen romp- en opbouwkleur staat op het exterieurblad hiervoor.':
      'Your own hull and superstructure colour appears on the exterior page before this one.',
    'OVER DIT DOSSIER':
      'ABOUT THIS DOSSIER',
    'SAMENGESTELD':
      'COMPILED',
    'Dit dossier legt één samenstelling vast: dit model, deze kleuren, dit interieur en deze opties, met de maten en de berekeningen die erbij horen. Het configuratienummer hieronder opent exact deze samenstelling opnieuw, ook over een jaar.':
      'This dossier records one specification: this model, these colours, this interior and these options, with the dimensions and calculations that belong to them. The configuration number below reopens exactly this specification, even a year from now.',
    'CONTACT':
      'CONTACT',
    'Dit dossier is samengesteld met de jachtconfigurator. Vragen over deze samenstelling, of klaar voor een gesprek over de bouw? Neem gerust contact op; houd het configuratienummer bij de hand, dan hebben we exact dit schip voor ons.':
      'This dossier was compiled with the yacht configurator. Questions about this specification, or ready to talk about the build? Do get in touch; keep the configuration number to hand and we will have exactly this vessel in front of us.',
    'Van achteren':
      'From astern',
    'Spiegel, zwemplateau en achterdekken. ':
      'Transom, bathing platform and aft decks. ',
    'De rompkleur is hier de catalogusuitvoering en niet je gekozen kleur.':
      'The hull colour here is the catalogue specification, not your chosen colour.',
    'Van voren':
      'From ahead',
    'Boegvorm en dekopbouw. ':
      'Bow shape and superstructure. ',
    'Alle ruimtes op dit model':
      'Every space on this model',
    'Dekafwerking':
      'Deck finish',
    'Interieurhout':
      'Interior timber',
    'Stoffering':
      'Upholstery',
    'Motorisering':
      'Propulsion',
    'Opties':
      'Options',
    'geen':
      'none',
    'ACTIERADIUS':
      'RANGE',
    'BLAD':
      'SHEET',
    'LET OP':
      'PLEASE NOTE',
    'LIGPLAATS':
      'BERTH',
    'SNELHEID EN VAARREGIME':
      'SPEED AND OPERATING REGIME',
    'STATUS':
      'STATUS',
    'VAARBEWIJS':
      'LICENCE',
    'VOORBEELDMODEL':
      'DEMONSTRATION MODEL',
    'VAARPROFIEL':
      'PERFORMANCE PROFILE',
    'DIT VALT BUITEN HET VAARPROFIEL':
      'THIS FALLS OUTSIDE THE PERFORMANCE PROFILE',
    'VOORBEELDMODEL: specificaties worden door de werf ingevuld':
      'DEMONSTRATION MODEL: specifications to be completed by the yard',
    'VOORBEELDMODEL: geen aanbod':
      'DEMONSTRATION MODEL: not an offer',
    'bepaalt de rompsnelheid':
      'determines hull speed',
    'bepaalt de vaarbewijsplicht':
      'determines the licence requirement',
    'bij kruissnelheid':
      'at cruising speed',
    'Vaartijd op kruissnelheid':
      'Time under way at cruising speed',
    'Korter dan 15 meter en niet sneller dan 20 km/u.':
      'Under 15 metres and no faster than 20 km/h.',
    'Korter dan 15 meter, maar sneller dan 20 km/u. Dan is het vaarbewijs verplicht.':
      'Under 15 metres but faster than 20 km/h, so a licence is required.',
    'Voor pleziervaartuigen van 15 tot 25 meter, ongeacht de snelheid. Ook een langzame boot van 16 meter valt hieronder.':
      'For pleasure craft from 15 to 25 metres, whatever the speed. A slow 16-metre boat falls under it too.',
    'Voor pleziervaartuigen van 25 tot 40 meter. Het Klein Vaarbewijs volstaat hier niet.':
      'For pleasure craft from 25 to 40 metres. The small-craft licence does not suffice here.',
    'Groot Pleziervaartbewijs II':
      'Large Pleasure Craft Licence II',
    'Klein Vaarbewijs':
      'Small Craft Licence',
    'Geen vaarbewijs verplicht':
      'No licence required',
    'verdringend':
      'displacement',
    'semi-glijdend':
      'semi-planing',
    'glijdend':
      'planing',
    'Met T-top en radarmast wordt het schip hoog. Meet de doorvaarthoogte na voordat je vaste bruggen in het binnenland plant; een strijkbare mast is vaak de oplossing.':
      'With a T-top and radar mast the vessel stands tall. Check the air draught before planning fixed inland bridges; a lowering mast is often the answer.',
    'Een gevulde jacuzzi weegt al gauw een ton, en hij staat hoog in het schip. Zonder stabilisatoren merk je dat aan het slingergedrag; bespreek dit met de werf.':
      'A filled jacuzzi weighs a tonne before you know it, and it sits high. Without stabilisers you will feel it in the roll; discuss this with the yard.',
    'Een tender op het bovendek verhoogt het gewicht bovendeks. Vraag de werf naar de stabiliteitsberekening bij volle belading.':
      'A tender on the upper deck raises weight high in the vessel. Ask the yard for the stability calculation at full load.',
    'Een zwembad van enkele kubieke meters weegt gevuld meerdere tonnen, en dat water schuift bij slingeren mee naar de lage zijde. Dat vrije-vloeistofeffect verslechtert de stabiliteit meetbaar; laat de werf de berekening maken en overweeg om leeg te varen op zee.':
      'A pool of several cubic metres weighs tonnes when filled, and that water surges to the low side as she rolls. This free-surface effect measurably degrades stability; have the yard run the calculation and consider sailing with it empty offshore.',
    'Waterjets manoeuvreren uitstekend en varen ondiep, maar zijn gevoeliger voor drijfvuil en zeewier dan schroeven. Op de Nederlandse binnenwateren is dat een re\u00eble afweging.':
      'Waterjets manoeuvre superbly and run shallow, but are more sensitive to floating debris and weed than propellers. On inland waterways that is a real trade-off.',
    'Bij deze rompvorm en kruissnelheid vaart het schip verdringend. Zwaarder motorvermogen levert dan nauwelijks snelheid op, w\u00e9l meer verbruik en gewicht.':
      'With this hull form and cruising speed the vessel runs in displacement mode. More engine power then buys almost no speed, but it does buy consumption and weight.',
    'Boven de 25 meter komen er naast het vaarbewijs vaak eisen bij rond bemanning, veiligheidsuitrusting en registratie. Reken op professionele begeleiding bij de oplevering.':
      'Above 25 metres, requirements around crew, safety equipment and registration usually come on top of the licence. Allow for professional guidance at handover.',
    'Vaarprofiel':
      'Performance profile',
    'Jachtdossier':
      'Yacht dossier',
    'Vergelijking':
      'Comparison',
    'Afdrukken / opslaan als PDF':
      'Print / save as PDF',
    'Next Growth &#183; jachtconfigurator':
      'Next Growth &#183; yacht configurator',
    'samenstelling van de aanvrager':
      'specification as configured',
    'INTERIEUR EN OPTIES':
      'INTERIOR AND OPTIONS',
    'AANZICHTEN':
      'VIEWS',
    'INVESTERING':
      'INVESTMENT',
    'VERGELIJKING':
      'COMPARISON',
    'DOSSIER':
      'DOSSIER',
    'SCHEMATISCH ZIJAANZICHT':
      'SCHEMATIC SIDE VIEW',
    'GEEN ONTWERPTEKENING':
      'NOT A DESIGN DRAWING',
    'WATERLIJN':
      'WATERLINE',
    'over alles':
      'overall',
    'Snelheid en vaarregime':
      'Speed and operating regime',
    'Verdringingssnelheid':
      'Displacement speed',
    'Actieradius':
      'Range',
    'Vermogen':
      'Output',
    'Verbruik op kruissnelheid':
      'Consumption at cruising speed',
    'Bereik bij zuinig varen':
      'Range when running economically',
    'Ligplaats':
      'Berth',
    'Box minimaal':
      'Minimum berth',
    'Waterdiepte minimaal':
      'Minimum water depth',
    'Let op':
      'Please note',
    'Gekozen opties':
      'Selected options',
    'Geen opties gekozen.':
      'No options selected.',
    'buiten bereik':
      'out of scope',
    'Bouwtijd vanaf contract':
      'Build time from contract',
    'Richtprijs incl. btw':
      'Guide price incl. VAT',
    'Onderdeel':
      'Item',
    'Huidig':
      'Current',
    'Vastgelegd':
      'Saved',
    'Keuze':
      'Choice',
    'Alleen links':
      'Left only',
    'Alleen rechts':
      'Right only',
    'Opties, allebei':
      'Options, both',
    'brandstof':
      'fuel',
    'drinkwater':
      'fresh water',
    'verplaatsing':
      'displacement',
    'richtprijs van deze samenstelling':
      'guide price for this specification',
    'Je jacht in \u00e9\u00e9n oogopslag':
      'Your yacht at a glance',
    'Jouw gekozen uitvoering':
      'Your chosen specification',
    'Jouw geselecteerde opties':
      'Your selected options',
    'Jouw interieurconcept':
      'Your interior concept',
    'Jouw persoonlijke vaarprofiel':
      'Your personal performance profile',
    'Adviezen bij deze samenstelling':
      'Advice on this specification',
    'Bemanning en vaarprofiel':
      'Crew and performance profile',
    'Bemanning en verblijfscapaciteit':
      'Crew and accommodation capacity',
    'Dekken en indeling':
      'Decks and layout',
    'Motorisering en prestaties':
      'Propulsion and performance',
    'Papieren en ligplaats':
      'Paperwork and berth',
    'Interieur: hout en stoffering':
      'Interior: timber and upholstery',
    'Prijsopbouw':
      'Price breakdown',
    'Investering':
      'Investment',
    'Overzicht':
      'Overview',
    'Indeling':
      'Layout',
    'Uitrusting':
      'Equipment',
    'Exterieur':
      'Exterior',
    'Vervolg':
      'Continued',
    'Volgende stappen':
      'Next steps',
    'Goed om te weten':
      'Worth knowing',
    'Disclaimer':
      'Disclaimer',
    'Materiaalconcept':
      'Material concept',
    'Ruimte voor je opmerkingen':
      'Space for your notes',
    'Samengesteld op':
      'Compiled on',
    'Configuratienummer':
      'Configuration number',
    'Pagina ':
      'Page ',
    'Op aanvraag':
      'On request',
    'Geen':
      'None',
    'Aandrijving':
      'Propulsion',
    'Motoren':
      'Engines',
    'Totaal vermogen':
      'Total output',
    'Rompsnelheid':
      'Hull speed',
    'Kruissnelheid':
      'Cruising speed',
    'Topsnelheid':
      'Top speed',
    'Economische snelheid':
      'Economical speed',
    'Verbruik kruissnelheid':
      'Consumption at cruising speed',
    'Bereik':
      'Range',
    'Bereik economisch':
      'Range, economical',
    'Bereik op kruissnelheid':
      'Range at cruising speed',
    'Brandstofcapaciteit':
      'Fuel capacity',
    'Snelheid en bereik':
      'Speed and range',
    'Vaarregime':
      'Operating regime',
    'Vaarbewijs':
      'Licence',
    'Ligplaatsmaat':
      'Berth dimensions',
    'Doorvaarthoogte':
      'Air draught',
    'Lengte over alles':
      'Length overall',
    'Breedte':
      'Beam',
    'Diepgang':
      'Draught',
    'Gasten':
      'Guests',
    'Hutten':
      'Cabins',
    'Badkamers':
      'Bathrooms',
    'Slaapgasten':
      'Sleeping guests',
    'Bemanning':
      'Crew',
    'Bemanningshutten':
      'Crew cabins',
    'Minimum crew':
      'Minimum crew',
    'Aanbevolen crew':
      'Recommended crew',
    'Crewcapaciteit':
      'Crew capacity',
    'Opbouw van de aanbeveling':
      'How the recommendation is built up',
    'Dekken':
      'Decks',
    'Bovenbouw':
      'Superstructure',
    'Opbouwkleur':
      'Superstructure colour',
    'Indicatieve totaalprijs excl. btw':
      'Indicative total excl. VAT',
    'Inclusief ':
      'Including ',
    'Basisprijs ':
      'Base price ',
    'Rompkleur  \u00b7  ':
      'Hull colour  \u00b7  ',
    'Opbouw  \u00b7  ':
      'Superstructure  \u00b7  ',
    'Dekafwerking  \u00b7  ':
      'Deck finish  \u00b7  ',
    'Interieurhout  \u00b7  ':
      'Interior timber  \u00b7  ',
    'Stoffering  \u00b7  ':
      'Upholstery  \u00b7  ',
    'Motorisering  \u00b7  ':
      'Propulsion  \u00b7  ',
    'UW PERSOONLIJKE JACHTCONFIGURATIE':
      'YOUR PERSONAL YACHT CONFIGURATION',
    'Aanvullende werfspecificaties worden tijdens het adviesgesprek vastgesteld.':
      'Further yard specifications are established during the advisory meeting.',
    'De bemanningsindicatie en het vaarprofiel voor dit model worden tijdens het adviesgesprek met de werf vastgesteld.':
      'The crew indication and performance profile for this model are established during the advisory meeting with the yard.',
    'De prestatieberekening voor dit model wordt door de werf opgesteld zodra de definitieve specificaties en proefvaartcijfers vaststaan.':
      'The performance calculation for this model is drawn up by the yard once the final specifications and sea-trial figures are settled.',
    'Het vaarprofiel voor dit model wordt opgesteld zodra de werf de definitieve specificaties heeft vastgesteld.':
      'The performance profile for this model is drawn up once the yard has settled the final specifications.',
    'Materiaalconcept: interieurimpressie volgt van de werf.':
      'Material concept: interior impression to follow from the yard.',
    'Overweeg zero-speed stabilisatoren: de meest gekozen comfortoptie in dit segment.':
      'Consider zero-speed stabilisers: the most chosen comfort option in this segment.',
    'Voor tochten langer dan een week van de haven is een watermaker vrijwel onmisbaar.':
      'For passages of more than a week away from harbour a watermaker is all but indispensable.',
    'detail van je samenstelling, exact de gekozen combinatie':
      'detail of your specification, exactly the chosen combination',
    'bovenaanzicht: schematisch, uit de werkelijke maten getekend':
      'top view: schematic, drawn from the actual dimensions',
    'vooraanzicht: boegvorm en dekopbouw van de catalogusuitvoering':
      'bow view: bow shape and superstructure of the catalogue specification',
    'Let op: dit beeld toont de':
      'Please note: this image shows the',
    'niet de door jou gekozen':
      'not the selected',
    'achteraanzicht: spiegel, zwemplateau en achterdekken':
      'stern view: transom, bathing platform and aft decks',
    ' van de catalogusuitvoering':
      ' of the catalogue specification',
    'Service- en interieurcrew':
      'Service and interior crew',
    'Tot die tijd toont het dossier hier geen aantallen.':
      'Until then the dossier shows no figures here.',
    'basis':
      'base',
    'aanbevolen':
      'recommended',
    'van':
      'of',
    'BEMANNING (AANBEVOLEN)':
      'CREW (RECOMMENDED)',
    'je samenstelling in detail, exact de gekozen combinatie':
      'your specification in detail, exactly the chosen combination',
    'Bespreek deze configuratie met een jachtspecialist':
      'Discuss this configuration with a yacht specialist',
    'De QR-code opent exact deze samenstelling.':
      'The QR code opens exactly this specification.',
    'HET VERVOLG, STAP VOOR STAP':
      'WHAT HAPPENS NEXT, STEP BY STEP',
    '1.  Controle van je samenstelling en wensen':
      '1.  Review of your specification and requirements',
    '2.  Werfgesprek over indeling, materialen en planning':
      '2.  Yard meeting on layout, materials and planning',
    '3.  Technische validatie door werf en klassenbureau':
      '3.  Technical validation by yard and classification society',
    'Comfort: groot effect voor anker en op zee. Gewicht en energieverbruik nemen toe.':
      'Comfort: a large effect at anchor and at sea. Weight and energy consumption increase.',
    'Manoeuvreren: zijwaarts aanleggen zonder hulp. Verwaarloosbaar effect op vaart en bereik.':
      'Manoeuvring: berth sideways unaided. Negligible effect on speed and range.',
    'Gewicht bovendeks; vraagt dekruimte \u00e9n een extra dekbemanningslid bij het tewaterlaten.':
      'Weight high in the vessel; takes deck space and an extra deckhand when launching.',
    'Gevuld circa een ton hoog in het schip: stabilisatoren sterk aanbevolen.':
      'About a tonne, high in the vessel when filled: stabilisers strongly recommended.',
    'Meerdere tonnen water op het achterdek; vrije-vloeistofeffect op de stabiliteit. Werf beoordeelt plaatsing en vulbeleid op zee.':
      'Several tonnes of water on the aft deck; free-surface effect on stability. The yard assesses placement and filling policy at sea.',
    'Minder generatordraaiuren; stiller voor anker. Geen bemanningseffect.':
      'Fewer generator hours; quieter at anchor. No effect on crew.',
    'Autonomie: drinkwater op zee. Onderhoud valt binnen de bestaande bezetting.':
      'Autonomy: drinking water at sea. Maintenance falls within the existing complement.',
    'Comfort benedendeks; hoger energieverbruik, zwaardere generator.':
      'Comfort below deck; higher energy use, a heavier generator.',
    'Toegang tot het water en de bijboot; hydrauliek vraagt periodiek onderhoud.':
      'Access to the water and the tender; the hydraulics need periodic servicing.',
    'Sfeer bij avond; verwaarloosbaar verbruik.':
      'Atmosphere after dark; negligible consumption.',
    'Verbinding buiten kustbereik; abonnementskosten via de werf.':
      'Connectivity beyond coastal range; subscription costs through the yard.',
    'Dit document is een indicatieve configuratiesamenvatting, geen definitieve offerte en geen bouwcontract.':
      'This document is an indicative configuration summary, not a final quotation and not a build contract.',
    'Afbeeldingen kunnen impressies zijn; kleuren kunnen per scherm en per materiaal afwijken.':
      'Images may be impressions; colours can differ per screen and per material.',
    'Specificaties en prijzen kunnen zonder aankondiging veranderen.':
      'Specifications and prices may change without notice.',
    'Gekozen opties kunnen technische gevolgen hebben voor gewicht, stabiliteit, bereik en bemanning; de werf beoordeelt de definitieve uitvoerbaarheid.':
      'Selected options can have technical consequences for weight, stability, range and crew; the yard assesses final feasibility.',
    'Functies aan boord bij deze bezetting: ':
      'Roles on board at this complement: ',
    'Bij deze omvang is professioneel bemande exploitatie de aangewezen vorm.':
      'At this size, professionally crewed operation is the appropriate arrangement.',
    'Indicatie op basis van je configuratie; de definitieve eisen stelt de werf vast met vlagstaat en klassenbureau.':
      'Indicative, based on your configuration; final requirements are set by the yard together with the flag state and classification society.',
    'Vaarbewijs-, bemannings- en certificeringseisen moeten extern worden bevestigd door de werf, een maritiem adviseur en het betrokken klassenbureau.':
      'Licensing, manning and certification requirements must be confirmed externally by the yard, a maritime adviser and the classification society involved.',
    'Dit is een demonstratieconfigurator: de getoonde modellen zijn voorbeeldmodellen en de specificaties zijn voorbeeldwaarden totdat een werf de eigen gegevens invoert.':
      'This is a demonstration configurator: the models shown are example models and the specifications example values until a yard enters its own data.',
    'De genoemde bemanningsbehoefte is een indicatie op basis van de gekozen configuratie. Definitieve eisen zijn afhankelijk van vlagstaat, classificatie, vaargebied, gebruik, brutotonnage en toepasselijke wet- en regelgeving. Laat de uiteindelijke bemannings- en certificeringseisen bevestigen door de werf, maritiem adviseur en het betrokken klassenbureau.':
      'The stated crew requirement is indicative, based on the chosen configuration. Final requirements depend on flag state, classification, cruising area, use, gross tonnage and applicable legislation. Have the final manning and certification requirements confirmed by the yard, a maritime adviser and the classification society involved.',
    'Voor deze configuratie wordt professioneel bemande exploitatie aanbevolen.':
      'Professionally crewed operation is recommended for this configuration.',
    'Dit model is er op gebouwd om zonder vaste bemanning gevaren te worden. Voor langere tochten en nachtelijke overtochten blijft een tweede ervaren opvarende verstandig.':
      'This model is built to be handled without permanent crew. For longer passages and night crossings a second experienced hand remains sensible.',
    'Zelfstandig varen is denkbaar voor een zeer ervaren eigenaar, maar de werf voert een technisch minimum van ':
      'Owner operation is conceivable for a very experienced owner, but the yard sets a technical minimum of ',
  };

  /* De woordenboeken, op taalcode. Het Engelse staat hierboven omdat het er
     als eerste was; elk volgend woordenboek meldt zich aan uit een eigen
     bestand met `NGTaal.woordenboek('de', { ... })`. Zo groeit dit bestand
     niet met elke taal mee - het zou anders na drie talen duizend regels
     woordenlijst zijn met de logica ergens onderaan - en laadt een pagina
     alleen het woordenboek dat ze nodig heeft.

     Een taal toevoegen is daarmee: één bestand met vertalingen, `_<code>`-
     velden in jacht-data.js voor de namen en omschrijvingen, en een HTML-
     pagina met het juiste lang-attribuut. Aan de configurator zelf verandert
     niets. */
  var WOORDENBOEKEN = { en: EN };

  function woordenboek(code, lijst) {
    if (!code || !lijst) return;
    var w = WOORDENBOEKEN[code] || (WOORDENBOEKEN[code] = {});
    Object.keys(lijst).forEach(function (k) { w[k] = lijst[k]; });
  }

  function taal() {
    try {
      var l = (global.document && global.document.documentElement.lang) || 'nl';
      return l.toLowerCase().slice(0, 2);
    } catch (e) { return 'nl'; }
  }

  /* Vertaalt één zin. Zonder vertaling komt de Nederlandse tekst terug.

     De PDF zet labels in hoofdletters vóórdat ze hier langskomen: "Gasten"
     bereikt deze functie als "GASTEN". In plaats van elk label twee keer in
     het woordenboek te zetten, wordt een volledig hoofdlettergeschreven zin
     die niet direct raak is nog eens opgezocht met alleen de eerste letter
     als hoofdletter - en het antwoord komt dan in hoofdletters terug. */
  function T(zin) {
    var w = WOORDENBOEKEN[taal()];
    if (!w) return zin;
    if (w[zin]) return w[zin];
    if (typeof zin !== 'string') return zin;
    /* Hoofdletterkoppen: de PDF zet labels in kapitalen vóórdat ze hier
       langskomen. Zoek dezelfde zin op met normale schrijfwijze en geef het
       antwoord in kapitalen terug. */
    if (zin.length > 1 && zin === zin.toUpperCase() && /[A-ZÀ-Þ]/.test(zin)) {
      var titel = zin.charAt(0) + zin.slice(1).toLowerCase();
      if (w[titel]) return w[titel].toUpperCase();
      if (w[zin.toLowerCase()]) return w[zin.toLowerCase()].toUpperCase();
    }
    /* Samengestelde koppen: "Rompkleur — Nachtblauw" en "04 — INDELING".
       Het label staat in het woordenboek, de waarde erachter komt uit de
       gegevens en is daar al vertaald. Vertaal dus alleen het deel vóór het
       gedachtestreepje, en laat de rest staan. */
    var deel = zin.split(' \u2014 ');
    if (deel.length !== 2) deel = zin.split('  \u00b7  ');
    if (deel.length === 2) {
      var links = T(deel[0]), rechts = T(deel[1]);
      var teken = zin.indexOf(' \u2014 ') > -1 ? ' \u2014 ' : '  \u00b7  ';
      if (links !== deel[0] || rechts !== deel[1]) return links + teken + rechts;
    }
    /* Opsommingstekens en telwoorden eromheen: "\u2022  Dit document is..." en
       "Opties (1)". Haal het versiersel eraf, vertaal de kern, zet het terug. */
    var bul = zin.match(/^([\u2022\-]\s+)([\s\S]+)$/);
    if (bul) { var kern = T(bul[2]); if (kern !== bul[2]) return bul[1] + kern; }
    var tel = zin.match(/^([\s\S]+?)(\s*\(\d+\))$/);
    if (tel) { var k2 = T(tel[1]); if (k2 !== tel[1]) return k2 + tel[2]; }

    /* Zinnen die met een vast label beginnen en daarna gegevens bevatten,
       zoals "Functies aan boord bij deze bezetting: Kapitein, Dekbemanning".
       Het label staat in het woordenboek, de opsomming erachter is al
       vertaald bij de bron. */
    var sleutels = Object.keys(w).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < sleutels.length; i++) {
      var sl = sleutels[i];
      /* Ook de rest achter het label nog een keer aanbieden: een zin als
         "<vaste inleiding> <toelichting uit de bemanningsmodule>" bestaat uit
         twee stukken die elk apart in het woordenboek staan. */
      if (sl.length > 12 && zin.indexOf(sl) === 0) {
        var staart = zin.slice(sl.length);
        var spatie = staart.match(/^\s*/)[0];
        return w[sl] + spatie + T(staart.slice(spatie.length));
      }
    }

    /* "Pagina 3 van 8" en "12 basis = 12 aanbevolen": vervang alleen de
       woorden, laat de getallen staan. */
    /* Alleen op korte regels als "12 basis  =  12 aanbevolen" mag er per woord
       worden vervangen. Op een hele zin zou dat halve vertalingen opleveren. */
    if (zin.length > 40) return zin;
    var los = zin.replace(/\b(Pagina|pagina)\b/g, function () { return T('Pagina '); })
      .replace(/\baanbevolen\b/g, w['aanbevolen'] || 'aanbevolen')
      .replace(/\bbasis\b/g, w['basis'] || 'basis').trim();
    if (los !== zin.trim() && w['van']) los = los.replace(/\bvan\b/g, w['van']);
    if (los !== zin.trim()) return los;
    return zin;
  }

  /* Kiest het juiste veld uit een gegevensrecord: `l` of `l_en`, `uit` of
     `uit_en`. Zo staan vertaling en origineel naast elkaar in jacht-data.js in
     plaats van in twee bestanden die uit elkaar lopen. */
  function veld(record, naam) {
    if (!record) return '';
    var t = taal();
    if (t !== 'nl' && record[naam + '_' + t]) return record[naam + '_' + t];
    return record[naam] || '';
  }

  /* Zet de gegevens één keer om naar de taal van de pagina.

     Het alternatief was om op elke plek waar een label wordt getoond `veld()`
     aan te roepen. Dat zijn tientallen plekken in de configurator, en nog eens
     zoveel in het vaarprofiel, het dossier en de PDF — met de garantie dat er
     op den duur eentje wordt vergeten. Door de velden hier één keer te
     overschrijven, tonen álle modules vanzelf de juiste taal, ook de modules
     waar geen letter aan is veranderd.

     Wat niet wordt vertaald: de modelnamen. Sport Coupé 16 heet in elke taal
     Sport Coupé 16, en een productnaam vertalen is precies het soort ijver
     waar een koper van in de war raakt. */
  function pasToe(D, B) {
    if (taal() === 'nl' || !D) return;
    var groepen = ['modellen', 'rompkleuren', 'opbouw', 'dekken', 'dekafwerking',
                   'interieurhout', 'stoffering', 'vloer', 'wandafwerking',
                   'marmer', 'metaal', 'verlichting',
                   'motorisering', 'opties', 'startpunten'];
    var velden = ['l', 'uit', 'noot', 'omschrijving'];
    groepen.forEach(function (g) {
      (D[g] || []).forEach(function (r) {
        velden.forEach(function (f) {
          var vert = veld(r, f);
          if (vert && vert !== r[f]) r[f] = vert;
        });
      });
    });
    if (B && B.RUIMTEN) {
      B.RUIMTEN.forEach(function (r) {
        ['l', 'uit'].forEach(function (f) {
          var vert = veld(r, f);
          if (vert && vert !== r[f]) r[f] = vert;
        });
      });
    }
  }


  /* Vertaalt een compleet gegenereerd document.

     Het vaarprofiel en het dossiervoorbeeld zijn één grote reeks HTML- en
     SVG-tekst. Elke zin daar apart door T() halen zou betekenen dat je door
     honderden regels opmaak heen moet, met de kans dat er eentje wordt gemist
     en de zekerheid dat het onleesbaar wordt. Deze functie doet het aan het
     eind, over het afgemaakte document.

     De vervanging gaat van lang naar kort. Anders zou "Bereik" eerder raken
     dan "Bereik op kruissnelheid" en houdt u halve vertalingen over. Korte
     sleutels worden alleen tussen > en < vervangen, zodat ze nooit een
     klassenaam of een attribuut raken. */
  function vertaalHtml(html) {
    if (taal() === 'nl' || !html) return html;
    var w = WOORDENBOEKEN[taal()];
    if (!w) return html;
    var sleutels = Object.keys(w).sort(function (a, b) { return b.length - a.length; });
    sleutels.forEach(function (nl) {
      /* Korte sleutels zijn riskant: "Dek" zou ook in een klassenaam kunnen
         zitten. Staat zo'n sleutel volledig in hoofdletters, dan komt hij in
         deze documenten alleen in zichtbare tekst voor - attributen en
         klassenamen zijn hier consequent kleine letters - en mag hij overal
         vervangen worden, ook midden in een langere regel als
         "VOORBEELDMODEL - BLAD J-01". Korte sleutels met kleine letters
         blijven tussen > en < opgesloten. */
      if (nl.length >= 7 || nl === nl.toUpperCase()) html = html.split(nl).join(w[nl]);
      else html = html.split('>' + nl + '<').join('>' + w[nl] + '<');
    });
    return html;
  }

  /* Laat alle tekst van een jsPDF-document door de vertaling lopen.

     De PDF tekent op vierendertig plekken tekst. In plaats van die allemaal
     los aan te passen, worden hier de twee methodes onderschept waar alle
     tekst doorheen gaat. Het afbreken over regels gebeurt ná de vertaling,
     want anders zou je losse woordfragmenten proberen op te zoeken. */
  function pdfVertalen(doc) {
    if (taal() === 'nl' || !doc || doc.__ngVertaald) return doc;
    var tekst = doc.text.bind(doc);
    var splits = doc.splitTextToSize.bind(doc);
    doc.splitTextToSize = function (t, breedte, opties) {
      return splits(typeof t === 'string' ? T(t) : t, breedte, opties);
    };
    doc.text = function (t, x, y, opties) {
      if (typeof t === 'string') t = T(t);
      else if (Object.prototype.toString.call(t) === '[object Array]') {
        t = t.map(function (r) { return typeof r === 'string' ? T(r) : r; });
      }
      return tekst(t, x, y, opties);
    };
    doc.__ngVertaald = true;
    return doc;
  }

  /* Het decimaalteken volgt de taal. Nederlands schrijft 28,9 meter, Engels
     28.9, en op een tekening waar allebei door elkaar staat leest het als een
     slordigheid - wat het ook is. De tekenmodules halen hun f1() hier vandaan;
     staat de taallaag er niet, dan blijft het de komma. */
  /* Het decimaalteken van de taal. Duits schrijft net als het Nederlands een
     komma; alleen het Engels een punt. Dit stond eerder als 'nl of niet' en
     zou een Duitse pagina dus Engelse getallen geven. */
  function decimaal() { return taal() === 'en' ? '.' : ','; }

  global.NGTaal = { taal: taal, T: T, veld: veld, pasToe: pasToe, decimaal: decimaal,
                    vertaalHtml: vertaalHtml, pdfVertalen: pdfVertalen,
                    woordenboek: woordenboek, WOORDENBOEKEN: WOORDENBOEKEN };
})(typeof window !== 'undefined' ? window : globalThis);
