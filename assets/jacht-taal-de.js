/* Duits woordenboek van de jachtconfigurator.
 *
 * WAAROM DUITS EN WAAROM APART
 * Na Nederlands en Engels is Duits de taal die er in dit segment werkelijk toe
 * doet: het grootste deel van de Noord-Europese eigenaren van een schip in
 * deze klasse spreekt het, en de werven die dit systeem zouden afnemen
 * verkopen al decennia aan die markt.
 *
 * Het staat in een eigen bestand omdat jacht-taal.js anders na drie talen
 * duizend regels woordenlijst is met de logica ergens onderaan. Dit bestand
 * meldt zich aan bij de taallaag en doet verder niets; wordt het niet geladen,
 * dan is er simpelweg geen Duitse pagina en werkt de rest gewoon.
 *
 * DE SLEUTEL IS DE NEDERLANDSE ZIN
 * Precies zoals bij het Engels. Staat een zin hier niet in, dan komt de
 * Nederlandse tekst terug - nooit een lege plek en nooit een zichtbare
 * sleutel. Een vergeten vertaling levert dus hooguit één Nederlandse zin
 * tussen de Duitse op.
 *
 * DE HOOFDLETTERSLEUTELS
 * De tekeningen - dekplan, aanzichten, materiaalstaat - lopen via
 * vertaalHtml(), en dat is een platte tekstvervanging zonder de
 * hoofdletterregel van T(). Korte woorden worden daar alleen tussen > en <
 * vervangen, en op een tekening zit een woord midden in een langere regel.
 * Vandaar dat de gezette koppen hier apart in kapitalen staan. Let op de
 * volgorde: er wordt van lang naar kort vervangen, dus zet nooit een sleutel
 * neer die in een langere sleutel voorkomt zonder te controleren dat de
 * langere er ook staat.
 *
 * NOG NA TE KIJKEN
 * Deze vertaling is niet door een moedertaalspreker nagelezen. Voor een werf
 * die hiermee naar de markt gaat is dat een stap die er nog bij hoort; het
 * staat in BEHEER-JACHT.md. De maritieme vaktermen zijn wel bewust gekozen:
 * Länge über alles, Tiefgang, Durchfahrtshöhe, Verdrängung, Rumpf, Aufbau.
 */
(function (global) {
  'use strict';
  if (!global.NGTaal || !global.NGTaal.woordenboek) return;

  global.NGTaal.woordenboek('de', {
    /* De materiaalkamers: de interieurkeuzes in een echte ruimte. */
    'Salon met ':
      'Salon in ',
    ' en ':
      ' und ',
    'Jouw salon':
      'Ihr Salon',
    'Deze vier keuzes volgt het beeld werkelijk.':
      'Diesen vier Entscheidungen folgt die Darstellung tatsächlich.',
    'Van deze combinatie is nog geen salonopname gemaakt. ':
      'Von dieser Kombination gibt es noch keine Salonaufnahme. ',
    'De materialen staan hieronder als staal; de opname volgt.':
      'Die Materialien stehen unten als Muster; die Aufnahme folgt.',
    'Badkamer in ':
      'Badezimmer in ',
    'Jouw badkamer':
      'Ihr Badezimmer',
    'Alle zestien combinaties van marmer en metaal staan klaar.':
      'Alle sechzehn Kombinationen aus Marmor und Metall stehen bereit.',
    'Lichtstanden':
      'Lichtstimmungen',
    'dezelfde salon, vier keer anders verlicht. Klik om te wisselen.':
      'derselbe Salon, viermal anders beleuchtet. Zum Wechseln anklicken.',

    'bovenaanzicht':
      'Draufsicht',
    'dekindeling':
      'Decksaufteilung',
    'Indeling per dek, uit de maten van dit model en je gekozen opties; de werf bepaalt de werkelijke indeling':
      'Aufteilung je Deck, aus den Maßen dieses Modells und Ihren gewählten Optionen; die Werft legt die tatsächliche Aufteilung fest',
    'De indeling volgt de maten van de ':
      'Die Aufteilung folgt den Maßen der ',
    ' en je keuzes: ':
      ' und Ihren Entscheidungen: ',
    ' hutten, ':
      ' Kabinen, ',
    ' hut, ':
      ' Kabine, ',
    ' badkamers, ':
      ' Bäder, ',
    ' badkamer, ':
      ' Bad, ',
    ' bemanningshutten en ':
      ' Crewkabinen und ',
    ' bemanningshut en ':
      ' Crewkabine und ',
    'dek':
      'Deck',
    'een dek':
      'ein Deck',
    ' dekken':
      ' Decks',
    'De volgorde van de ruimtes is de gangbare indeling in dit segment: machinekamer achterin, gastenhutten onder de waterlijn, eigenaarshut op het hoofddek zodra het schip daar breed genoeg voor is.':
      'Die Reihenfolge der Räume entspricht der in diesem Segment üblichen Aufteilung: Maschinenraum achtern, Gästekabinen unter der Wasserlinie, Eignerkabine auf dem Hauptdeck, sobald das Schiff dafür breit genug ist.',
    'De werf bepaalt de werkelijke indeling; dit is een schema, geen werftekening.':
      'Die Werft legt die tatsächliche Aufteilung fest; dies ist ein Schema, keine Werftzeichnung.',
    ' met ':
      ' mit ',
    '; de rompkleur volgt hier je keuze nog niet.':
      '; die Rumpffarbe folgt Ihrer Wahl hier noch nicht.',
    ' van de catalogusuitvoering; romp- en dekkleur volgen hier je keuzes nog niet.':
      ' der Katalogausführung; Rumpf- und Decksfarbe folgen Ihren Entscheidungen hier noch nicht.',
    ' Het exacte beeld van je samenstelling staat onder Zijaanzicht.':
      ' Die exakte Darstellung Ihrer Konfiguration finden Sie unter Seitenansicht.',
    'ALLES OP DEZELFDE SCHAAL':
      'ALLES IM GLEICHEN MASSSTAB',
    'DOORVAARTHOOGTE':
      'DURCHFAHRTSHÖHE',
    'huis':
      'Haus',
    'auto':
      'Auto',

    /* de tekeningen: dekplan, aanzichten, materiaalstaat */
    'ONDERDEK':
      'UNTERDECK',
    'HOOFDDEK':
      'HAUPTDECK',
    'BRUGDEK':
      'BRÜCKENDECK',
    'BOVENDEK':
      'OBERDECK',
    'ZONNEDEK':
      'SONNENDECK',
    'EIGENAARSDEK':
      'EIGNERDECK',
    'OBSERVATIEDEK':
      'AUSSICHTSDECK',
    'ACHTERDEK':
      'ACHTERDECK',
    'EETSALON':
      'ESSSALON',
    'BOVENSALON':
      'OBERSALON',
    'ZONNESALON':
      'SONNENSALON',
    'PANORAMALOUNGE':
      'PANORAMALOUNGE',
    'SKYLOUNGE':
      'SKYLOUNGE',
    'KAARTENKAMER':
      'KARTENRAUM',
    'PRIVEDEK':
      'PRIVATDECK',
    'MACHINEKAMER':
      'MASCHINENRAUM',
    'EIGENAARSSUITE':
      'EIGNERSUITE',
    'EIGENAARSHUT':
      'EIGNERKABINE',
    'BEMANNINGSHUTTEN':
      'CREWKABINEN',
    'HUTTEN ONDERDEKS':
      'KABINEN UNTER DECK',
    'FLYBRIDGE ERBOVEN':
      'FLYBRIDGE DARÜBER',
    'BOVENAANZICHT':
      'DRAUFSICHT',
    'VOORAANZICHT':
      'BUGANSICHT',
    'SCHEMATISCH':
      'SCHEMATISCH',
    'STUURSTAND':
      'OBERER FAHRSTAND',
    'STUURHUIS':
      'STEUERHAUS',
    'LIGBEDDEN':
      'SONNENLIEGEN',
    'BADKAMERS':
      'BÄDER',
    'BOEGSCHROEF':
      'BUGSTRAHLRUDER',
    'BEMANNING':
      'CREW',
    'VOORDEK':
      'VORDECK',
    'ZWEMBAD':
      'POOL',
    'KOMBUIS':
      'KOMBÜSE',
    'DEKPLAN':
      'DECKSPLAN',
    'PLATEAU':
      'PLATTFORM',
    'UITKIJK':
      'AUSGUCK',
    'ENTREE':
      'ENTREE',
    'GASTEN':
      'GÄSTE',
    'HUTTEN':
      'KABINEN',
    'KRAAN':
      'KRAN',
    'SALON':
      'SALON',
    'VIP-HUT':
      'VIP-KABINE',
    'GANG':
      'GANG',
    'HUT':
      'KABINE',
    'VIN':
      'FLOSSE',
    'ZON':
      'SONNE',

    /* de tabbladen en het doek */
    'Zijaanzicht':
      'Seitenansicht',
    'Bovenaanzicht':
      'Draufsicht',
    'Vooraanzicht':
      'Bugansicht',
    'Achteraanzicht':
      'Heckansicht',
    'Interieur':
      'Interieur',
    'Op schaal':
      'Im Maßstab',
    'Nacht':
      'Nacht',
    'Aanzicht kiezen':
      'Ansicht wählen',
    'Dekindeling':
      'Decksaufteilung',
    'Boegvorm en dekopbouw':
      'Bugform und Aufbau',
    'Spiegel, zwemplateau en achterdekken':
      'Spiegel, Badeplattform und Achterdecks',
    'Maatschets':
      'Maßskizze',
    'Ruimtes aan boord':
      'Räume an Bord',
    'Salon':
      'Hauptsalon',
    'Volgt je hout- en stofferingskeuze.':
      'Folgt Ihrer Holz- und Polsterwahl.',
    'Ruimte':
      'Raum',
    'Maten nog niet vastgesteld':
      'Maße noch nicht festgelegt',
    '360&deg;-weergave nog niet beschikbaar':
      '360&deg;-Ansicht noch nicht verfügbar',
    'Richtprijs':
      'Richtpreis',
    'Richtprijs excl. btw':
      'Richtpreis zzgl. MwSt.',
    'op aanvraag':
      'auf Anfrage',
    'lengte over alles':
      'Länge über alles',
    'breedte':
      'Breite',
    'diepgang':
      'Tiefgang',
    'gasten':
      'Gäste',
    'hutten':
      'Kabinen',
    'bemanning':
      'Crew',
    'badkamers':
      'Bäder',
    'kruissnelheid':
      'Marschfahrt',
    'bereik':
      'Reichweite',
    'vaarbewijs':
      'Führerschein',
    'doorvaarthoogte':
      'Durchfahrtshöhe',
    'vaarregime':
      'Fahrzustand',
    'Vanaf 40 meter is het schip geen pleziervaartuig meer. Dan gelden certificering, bemanningseisen en vlagstaatregels waar deze module niet over gaat.':
      'Ab vierzig Metern gilt das Schiff nicht mehr als Sportboot. Dann greifen Zertifizierung, Besatzungsvorschriften und Flaggenstaatregeln, die dieses Modul nicht abdeckt.',
    'Dit valt buiten het vaarprofiel. Laat het beoordelen door de werf en een klassenbureau.':
      'Das liegt außerhalb des Fahrprofils. Lassen Sie es von der Werft und einer Klassifikationsgesellschaft beurteilen.',
    'De waterlijnlengte ontbreekt in de modeltabel; zonder die maat is er geen rompsnelheid te bepalen.':
      'Die Wasserlinienlänge fehlt in der Modelltabelle; ohne dieses Maß lässt sich keine Rumpfgeschwindigkeit bestimmen.',
    'Open dossier':
      'Dossier öffnen',
    'Download PDF':
      'PDF herunterladen',
    'Deel configuratie':
      'Konfiguration teilen',
    'Link gekopieerd':
      'Link kopiert',
    'Kopieer deze link:':
      'Diesen Link kopieren:',
    'Downloaden mislukt':
      'Download fehlgeschlagen',
    'Alleen het vaarprofiel V-01':
      'Nur das Fahrprofil V-01',
    'Vergrote weergave van je jacht':
      'Vergrößerte Ansicht Ihrer Yacht',
    'Begin hier':
      'Hier beginnen',
    'Dek en bovenbouw':
      'Deck und Aufbau',
    'Jouw jachtdossier':
      'Ihr Yachtdossier',
    'Richtprijs van deze samenstelling, exclusief btw en exclusief afleveringskosten. Inclusief ':
      'Richtpreis dieser Konfiguration, zzgl. MwSt. und zzgl. Überführungskosten. Inklusive ',
    '% btw: ':
      '% MwSt.: ',
    ' Bouwtijd vanaf contract circa ':
      ' Bauzeit ab Vertragsabschluss etwa ',
    ' maanden.':
      ' Monate.',
    'Model':
      'Modell',
    'Rompkleur':
      'Rumpffarbe',
    'Opbouw':
      'Aufbau',
    'Dek':
      'Deck',

    /* de vijf interieurafwerkingen en de materiaalstaat */
    'Vloer':
      'Bodenbelag',
    'VLOER':
      'BODENBELAG',
    'Wandafwerking':
      'Wandverkleidung',
    'WANDAFWERKING':
      'WANDVERKLEIDUNG',
    'Marmer badkamer':
      'Marmor Bad',
    'MARMER BADKAMER':
      'MARMOR BAD',
    'Marmer':
      'Marmor',
    'Metaalafwerking':
      'Metallausführung',
    'METAALAFWERKING':
      'METALLAUSFÜHRUNG',
    'Verlichting':
      'Beleuchtung',
    'VERLICHTING':
      'BELEUCHTUNG',
    'Materialen':
      'Materialien',
    'MATERIAALSTAAT &#183; INTERIEUR':
      'MATERIALLISTE &#183; INTERIEUR',
    'MATERIAALSTAAT':
      'MATERIALLISTE',
    'INTERIEURHOUT':
      'INTERIEURHOLZ',
    'STOFFERING':
      'POLSTERUNG',
    'Deze twee stuurt de salonrender werkelijk aan; de andere vijf staan hier als staal en niet als foto.':
      'Diesen beiden folgt das Salon-Rendering tatsächlich; die anderen fünf stehen hier als Muster und nicht als Foto.',
    'Materiaalstaat van het interieur van de ':
      'Materialliste des Interieurs der ',
    'De gouden stip staat bij de twee keuzes die de salonrender werkelijk volgt. De werf bepaalt de leverancier en de exacte tint.':
      'Der goldene Punkt markiert die beiden Entscheidungen, denen das Salon-Rendering tatsächlich folgt. Die Werft bestimmt den Lieferanten und den genauen Farbton.',
    'Deze salon staat in ':
      'Dieser Salon ist ausgeführt in ',
    '. Die twee volgt het beeld werkelijk. ':
      '. Diesen beiden folgt das Bild tatsächlich. ',
    'Je vloer, wandafwerking, marmer, metaalafwerking en verlichting staan als staal onder Materialen; die vijf zijn op deze opname de catalogusuitvoering.':
      'Ihr Bodenbelag, Ihre Wandverkleidung, Ihr Marmor, Ihre Metallausführung und Ihre Beleuchtung stehen als Muster unter Materialien; auf dieser Aufnahme zeigen diese fünf die Katalogausführung.',

    /* eenheden en valuta */
    'Maten':
      'Maße',
    'meter':
      'Meter',
    'voet':
      'Fuß',
    'meters, liters en tonnen':
      'Meter, Liter und Tonnen',
    'voeten, gallons en long tons':
      'Fuß, Gallonen und Long Tons',
    'Valuta':
      'Währung',
    'Eenheden en valuta':
      'Maße und Währung',
    'de contractvaluta van de werf':
      'die Vertragswährung der Werft',
    'omgerekend tegen de koers van ':
      'umgerechnet zum Kurs vom ',
    'Bedragen in vreemde valuta zijn omgerekend tegen de koers van ':
      'Beträge in Fremdwährung sind umgerechnet zum Kurs vom ',
    ' en zijn indicatief; de werf sluit af in euro’s.':
      ' und sind Richtwerte; die Werft schließt in Euro ab.',

    'INHOUD':
      'INHALT',
    'Het schip':
      'Das Schiff',
    'HET SCHIP':
      'DAS SCHIFF',
    '01  ·  Het schip':
      '01  ·  Das Schiff',
    '01  ·  HET SCHIP':
      '01  ·  DAS SCHIFF',
    '02  ·  Aan boord':
      '02  ·  An Bord',
    '02  ·  AAN BOORD':
      '02  ·  AN BORD',
    '03  ·  Indeling':
      '03  ·  Aufteilung',
    '03  ·  INDELING':
      '03  ·  AUFTEILUNG',
    '04  ·  Techniek':
      '04  ·  Technik',
    '04  ·  TECHNIEK':
      '04  ·  TECHNIK',
    'Jouw keuzes':
      'Ihre Auswahl',
    'UW KEUZES':
      'IHRE AUSWAHL',
    'Materiaalstaat van het interieur':
      'Materialliste des Interieurs',
    'Indicatieve demonstratiewaarden, te valideren door de werf.':
      'Indikative Demonstrationswerte, von der Werft zu bestätigen.',
    'Interieur  ·  hout, stoffering en afwerking':
      'Interieur  ·  Holz, Polsterung und Ausführung',
    'Naast de salon hierboven telt dit model de volgende ruimtes. De salon volgt je keuze van hout en stoffering exact; de ruimtes hieronder tonen de catalogusafwerking.':
      'Neben dem Salon oben verfügt dieses Modell über die folgenden Räume. Der Salon folgt Ihrer Holz- und Polsterwahl exakt; die Räume unten zeigen die Katalogausführung.',
    '4.  Offerte met definitieve prijsopbouw':
      '4.  Angebot mit endgültigem Preisaufbau',
    '5.  Contract en bouw':
      '5.  Vertrag und Bau',
    'Waarom deze aandrijving past: het schip vaart in het ':
      'Warum dieser Antrieb passt: das Schiff fährt im ',
    ' regime bij een rompsnelheid van ':
      '-Zustand bei einer Rumpfgeschwindigkeit von ',
    'Het bereik rekent met 90% bruikbare tankinhoud; 10% blijft als reserve buiten de som.':
      'Die Reichweite rechnet mit 90% nutzbarem Tankinhalt; 10% bleiben als Reserve außen vor.',
    'Bij avond':
      'Am Abend',
    'De nachtopname toont de catalogusuitvoering: nachtblauw met parelwitte opbouw. ':
      'Die Nachtaufnahme zeigt die Katalogausführung: Nachtblau mit perlweißem Aufbau. ',
    'Je eigen romp- en opbouwkleur staat op het exterieurblad hiervoor.':
      'Ihre eigene Rumpf- und Aufbaufarbe finden Sie auf der Exterieurseite davor.',
    'OVER DIT DOSSIER':
      'ÜBER DIESES DOSSIER',
    'SAMENGESTELD':
      'ZUSAMMENGESTELLT',
    'Dit dossier legt één samenstelling vast: dit model, deze kleuren, dit interieur en deze opties, met de maten en de berekeningen die erbij horen. Het configuratienummer hieronder opent exact deze samenstelling opnieuw, ook over een jaar.':
      'Dieses Dossier hält eine Konfiguration fest: dieses Modell, diese Farben, dieses Interieur und diese Optionen, mit den zugehörigen Maßen und Berechnungen. Die Konfigurationsnummer unten öffnet genau diese Konfiguration erneut, auch in einem Jahr.',
    'CONTACT':
      'KONTAKT',
    'Dit dossier is samengesteld met de jachtconfigurator. Vragen over deze samenstelling, of klaar voor een gesprek over de bouw? Neem gerust contact op; houd het configuratienummer bij de hand, dan hebben we exact dit schip voor ons.':
      'Dieses Dossier wurde mit dem Yachtkonfigurator erstellt. Fragen zu dieser Konfiguration oder bereit für ein Gespräch über den Bau? Sprechen Sie uns an; halten Sie die Konfigurationsnummer bereit, dann haben wir genau dieses Schiff vor uns.',
    'Van achteren':
      'Von achtern',
    'Spiegel, zwemplateau en achterdekken. ':
      'Spiegel, Badeplattform und Achterdecks. ',
    'De rompkleur is hier de catalogusuitvoering en niet je gekozen kleur.':
      'Die Rumpffarbe zeigt hier die Katalogausführung, nicht Ihre gewählte Farbe.',
    'Van voren':
      'Von vorn',
    'Boegvorm en dekopbouw. ':
      'Bugform und Aufbau. ',
    'Alle ruimtes op dit model':
      'Alle Räume dieses Modells',
    'Dekafwerking':
      'Decksbelag',
    'Interieurhout':
      'Interieurholz',
    'Stoffering':
      'Polsterung',
    'Motorisering':
      'Motorisierung',
    'Opties':
      'Optionen',
    'geen':
      'keine',

    /* koppen in het dossier en de PDF */
    'ACTIERADIUS':
      'REICHWEITE',
    'BLAD':
      'BLATT',
    'LET OP':
      'BITTE BEACHTEN',
    'LIGPLAATS':
      'LIEGEPLATZ',
    'SNELHEID EN VAARREGIME':
      'GESCHWINDIGKEIT UND FAHRZUSTAND',
    'STATUS':
      'STATUS',
    'VAARBEWIJS':
      'FÜHRERSCHEIN',
    'VOORBEELDMODEL':
      'DEMONSTRATIONSMODELL',
    'VAARPROFIEL':
      'FAHRPROFIL',
    'DIT VALT BUITEN HET VAARPROFIEL':
      'DIES LIEGT AUSSERHALB DES FAHRPROFILS',
    'VOORBEELDMODEL: specificaties worden door de werf ingevuld':
      'DEMONSTRATIONSMODELL: Spezifikationen werden von der Werft ergänzt',
    'VOORBEELDMODEL: geen aanbod':
      'DEMONSTRATIONSMODELL: kein Angebot',
    'bepaalt de rompsnelheid':
      'bestimmt die Rumpfgeschwindigkeit',
    'bepaalt de vaarbewijsplicht':
      'bestimmt die Führerscheinpflicht',
    'bij kruissnelheid':
      'bei Marschfahrt',
    'Vaartijd op kruissnelheid':
      'Fahrzeit bei Marschfahrt',
    'Korter dan 15 meter en niet sneller dan 20 km/u.':
      'Kürzer als 15 Meter und nicht schneller als 20 km/h.',
    'Korter dan 15 meter, maar sneller dan 20 km/u. Dan is het vaarbewijs verplicht.':
      'Kürzer als 15 Meter, aber schneller als 20 km/h. Dann ist der Führerschein Pflicht.',
    'Voor pleziervaartuigen van 15 tot 25 meter, ongeacht de snelheid. Ook een langzame boot van 16 meter valt hieronder.':
      'Für Sportboote von 15 bis 25 Metern, unabhängig von der Geschwindigkeit. Auch ein langsames 16-Meter-Boot fällt darunter.',
    'Voor pleziervaartuigen van 25 tot 40 meter. Het Klein Vaarbewijs volstaat hier niet.':
      'Für Sportboote von 25 bis 40 Metern. Der kleine Bootsführerschein reicht hier nicht aus.',
    'Groot Pleziervaartbewijs II':
      'Großer Sportbootführerschein II (NL)',
    'Klein Vaarbewijs':
      'Kleiner Bootsführerschein (NL)',
    'Geen vaarbewijs verplicht':
      'Kein Führerschein erforderlich',
    'verdringend':
      'verdrängend',
    'semi-glijdend':
      'halbgleitend',
    'glijdend':
      'gleitend',
    'Met T-top en radarmast wordt het schip hoog. Meet de doorvaarthoogte na voordat je vaste bruggen in het binnenland plant; een strijkbare mast is vaak de oplossing.':
      'Mit T-Top und Radarmast baut das Schiff hoch. Prüfen Sie die Durchfahrtshöhe, bevor Sie feste Brücken im Binnenland einplanen; ein legbarer Mast ist oft die Lösung.',
    'Een gevulde jacuzzi weegt al gauw een ton, en hij staat hoog in het schip. Zonder stabilisatoren merk je dat aan het slingergedrag; bespreek dit met de werf.':
      'Ein gefüllter Whirlpool wiegt schnell eine Tonne und sitzt hoch im Schiff. Ohne Stabilisatoren merken Sie das am Rollverhalten; besprechen Sie das mit der Werft.',
    'Een tender op het bovendek verhoogt het gewicht bovendeks. Vraag de werf naar de stabiliteitsberekening bij volle belading.':
      'Ein Tender auf dem Oberdeck erhöht das Gewicht über Deck. Fragen Sie die Werft nach der Stabilitätsberechnung bei voller Beladung.',
    'Een zwembad van enkele kubieke meters weegt gevuld meerdere tonnen, en dat water schuift bij slingeren mee naar de lage zijde. Dat vrije-vloeistofeffect verslechtert de stabiliteit meetbaar; laat de werf de berekening maken en overweeg om leeg te varen op zee.':
      'Ein Pool von mehreren Kubikmetern wiegt gefüllt mehrere Tonnen, und dieses Wasser läuft beim Rollen zur tiefen Seite mit. Dieser Freispiegeleffekt verschlechtert die Stabilität messbar; lassen Sie die Werft die Berechnung anstellen und erwägen Sie, auf See leer zu fahren.',
    'Waterjets manoeuvreren uitstekend en varen ondiep, maar zijn gevoeliger voor drijfvuil en zeewier dan schroeven. Op de Nederlandse binnenwateren is dat een reële afweging.':
      'Wasserstrahlantriebe manövrieren hervorragend und gehen flach, reagieren aber empfindlicher auf Treibgut und Seegras als Propeller. Auf Binnengewässern ist das eine echte Abwägung.',
    'Bij deze rompvorm en kruissnelheid vaart het schip verdringend. Zwaarder motorvermogen levert dan nauwelijks snelheid op, wél meer verbruik en gewicht.':
      'Bei dieser Rumpfform und Marschfahrt fährt das Schiff verdrängend. Mehr Motorleistung bringt dann kaum Geschwindigkeit, wohl aber mehr Verbrauch und Gewicht.',
    'Boven de 25 meter komen er naast het vaarbewijs vaak eisen bij rond bemanning, veiligheidsuitrusting en registratie. Reken op professionele begeleiding bij de oplevering.':
      'Über 25 Meter kommen neben dem Führerschein häufig Anforderungen an Besatzung, Sicherheitsausrüstung und Registrierung hinzu. Rechnen Sie bei der Übergabe mit professioneller Begleitung.',
    'Vaarprofiel':
      'Fahrprofil',
    'Jachtdossier':
      'Yachtdossier',
    'Vergelijking':
      'Vergleich',
    'Afdrukken / opslaan als PDF':
      'Drucken / als PDF speichern',
    'Next Growth &#183; jachtconfigurator':
      'Next Growth &#183; Yachtkonfigurator',
    'samenstelling van de aanvrager':
      'Konfiguration wie zusammengestellt',
    'INTERIEUR EN OPTIES':
      'INTERIEUR UND OPTIONEN',
    'AANZICHTEN':
      'ANSICHTEN',
    'INVESTERING':
      'INVESTITION',
    'VERGELIJKING':
      'VERGLEICH',
    'DOSSIER':
      'DOSSIER',
    'SCHEMATISCH ZIJAANZICHT':
      'SCHEMATISCHE SEITENANSICHT',
    'GEEN ONTWERPTEKENING':
      'KEINE KONSTRUKTIONSZEICHNUNG',
    'WATERLIJN':
      'WASSERLINIE',
    'over alles':
      'über alles',
    'Snelheid en vaarregime':
      'Geschwindigkeit und Fahrzustand',
    'Verdringingssnelheid':
      'Verdrängungsgeschwindigkeit',
    'Actieradius':
      'Reichweite',
    'Vermogen':
      'Leistung',
    'Verbruik op kruissnelheid':
      'Verbrauch bei Marschfahrt',
    'Bereik bij zuinig varen':
      'Reichweite bei sparsamer Fahrt',
    'Ligplaats':
      'Liegeplatz',
    'Box minimaal':
      'Liegeplatz mindestens',
    'Waterdiepte minimaal':
      'Wassertiefe mindestens',
    'Let op':
      'Bitte beachten',
    'Gekozen opties':
      'Gewählte Optionen',
    'Geen opties gekozen.':
      'Keine Optionen gewählt.',
    'buiten bereik':
      'außerhalb des Rahmens',
    'Bouwtijd vanaf contract':
      'Bauzeit ab Vertragsabschluss',
    'Richtprijs incl. btw':
      'Richtpreis inkl. MwSt.',
    'Onderdeel':
      'Position',
    'Huidig':
      'Aktuell',
    'Vastgelegd':
      'Gespeichert',
    'Keuze':
      'Wahl',
    'Alleen links':
      'Nur links',
    'Alleen rechts':
      'Nur rechts',
    'Opties, allebei':
      'Optionen, beide',
    'brandstof':
      'Kraftstoff',
    'drinkwater':
      'Trinkwasser',
    'verplaatsing':
      'Verdrängung',
    'richtprijs van deze samenstelling':
      'Richtpreis dieser Konfiguration',
    'Je jacht in één oogopslag':
      'Ihre Yacht auf einen Blick',
    'Jouw gekozen uitvoering':
      'Ihre gewählte Ausführung',
    'Jouw geselecteerde opties':
      'Ihre gewählten Optionen',
    'Jouw interieurconcept':
      'Ihr Interieurkonzept',
    'Jouw persoonlijke vaarprofiel':
      'Ihr persönliches Fahrprofil',
    'Adviezen bij deze samenstelling':
      'Hinweise zu dieser Konfiguration',
    'Bemanning en vaarprofiel':
      'Crew und Fahrprofil',
    'Bemanning en verblijfscapaciteit':
      'Crew und Unterbringungskapazität',
    'Dekken en indeling':
      'Decks und Aufteilung',
    'Motorisering en prestaties':
      'Motorisierung und Leistung',
    'Papieren en ligplaats':
      'Papiere und Liegeplatz',
    'Interieur: hout en stoffering':
      'Interieur: Holz und Polsterung',
    'Prijsopbouw':
      'Preisaufbau',
    'Investering':
      'Investition',
    'Overzicht':
      'Übersicht',
    'Indeling':
      'Aufteilung',
    'Uitrusting':
      'Ausstattung',
    'Exterieur':
      'Exterieur',
    'Vervolg':
      'Fortsetzung',
    'Volgende stappen':
      'Nächste Schritte',
    'Goed om te weten':
      'Gut zu wissen',
    'Disclaimer':
      'Haftungsausschluss',
    'Materiaalconcept':
      'Materialkonzept',
    'Ruimte voor je opmerkingen':
      'Raum für Ihre Anmerkungen',
    'Samengesteld op':
      'Zusammengestellt am',
    'Configuratienummer':
      'Konfigurationsnummer',
    'Pagina ':
      'Seite ',
    'Op aanvraag':
      'Auf Anfrage',
    'Geen':
      'Keine',
    'Aandrijving':
      'Antrieb',
    'Motoren':
      'Motoren',
    'Totaal vermogen':
      'Gesamtleistung',
    'Rompsnelheid':
      'Rumpfgeschwindigkeit',
    'Kruissnelheid':
      'Marschfahrt',
    'Topsnelheid':
      'Höchstgeschwindigkeit',
    'Economische snelheid':
      'Wirtschaftliche Geschwindigkeit',
    'Verbruik kruissnelheid':
      'Verbrauch bei Marschfahrt',
    'Bereik':
      'Reichweite',
    'Bereik economisch':
      'Reichweite, wirtschaftlich',
    'Bereik op kruissnelheid':
      'Reichweite bei Marschfahrt',
    'Brandstofcapaciteit':
      'Kraftstoffkapazität',
    'Snelheid en bereik':
      'Geschwindigkeit und Reichweite',
    'Vaarregime':
      'Fahrzustand',
    'Vaarbewijs':
      'Führerschein',
    'Ligplaatsmaat':
      'Liegeplatzmaß',
    'Doorvaarthoogte':
      'Durchfahrtshöhe',
    'Lengte over alles':
      'Länge über alles',
    'Breedte':
      'Breite',
    'Diepgang':
      'Tiefgang',
    'Gasten':
      'Gäste',
    'Hutten':
      'Kabinen',
    'Badkamers':
      'Bäder',
    'Slaapgasten':
      'Schlafgäste',
    'Bemanning':
      'Crew',
    'Bemanningshutten':
      'Crewkabinen',
    'Minimum crew':
      'Mindestcrew',
    'Aanbevolen crew':
      'Empfohlene Crew',
    'Crewcapaciteit':
      'Crewkapazität',
    'Opbouw van de aanbeveling':
      'Herleitung der Empfehlung',
    'Dekken':
      'Decks',
    'Bovenbouw':
      'Aufbau',
    'Opbouwkleur':
      'Aufbaufarbe',
    'Indicatieve totaalprijs excl. btw':
      'Indikativer Gesamtpreis zzgl. MwSt.',
    'Inclusief ':
      'Inklusive ',
    'Basisprijs ':
      'Grundpreis ',
    'Rompkleur  ·  ':
      'Rumpffarbe  ·  ',
    'Opbouw  ·  ':
      'Aufbau  ·  ',
    'Dekafwerking  ·  ':
      'Decksbelag  ·  ',
    'Interieurhout  ·  ':
      'Interieurholz  ·  ',
    'Stoffering  ·  ':
      'Polsterung  ·  ',
    'Motorisering  ·  ':
      'Motorisierung  ·  ',
    'UW PERSOONLIJKE JACHTCONFIGURATIE':
      'IHRE PERSÖNLICHE YACHTKONFIGURATION',
    'Aanvullende werfspecificaties worden tijdens het adviesgesprek vastgesteld.':
      'Weitere Werftspezifikationen werden im Beratungsgespräch festgelegt.',
    'De bemanningsindicatie en het vaarprofiel voor dit model worden tijdens het adviesgesprek met de werf vastgesteld.':
      'Die Crew-Indikation und das Fahrprofil für dieses Modell werden im Beratungsgespräch mit der Werft festgelegt.',
    'De prestatieberekening voor dit model wordt door de werf opgesteld zodra de definitieve specificaties en proefvaartcijfers vaststaan.':
      'Die Leistungsberechnung für dieses Modell erstellt die Werft, sobald die endgültigen Spezifikationen und die Probefahrtwerte feststehen.',
    'Het vaarprofiel voor dit model wordt opgesteld zodra de werf de definitieve specificaties heeft vastgesteld.':
      'Das Fahrprofil für dieses Modell wird erstellt, sobald die Werft die endgültigen Spezifikationen festgelegt hat.',
    'Materiaalconcept: interieurimpressie volgt van de werf.':
      'Materialkonzept: Interieurimpression folgt von der Werft.',
    'Overweeg zero-speed stabilisatoren: de meest gekozen comfortoptie in dit segment.':
      'Erwägen Sie Zero-Speed-Stabilisatoren: die meistgewählte Komfortoption in diesem Segment.',
    'Voor tochten langer dan een week van de haven is een watermaker vrijwel onmisbaar.':
      'Für Törns von mehr als einer Woche fern des Hafens ist ein Wassermacher nahezu unverzichtbar.',
    'detail van je samenstelling, exact de gekozen combinatie':
      'Detail Ihrer Konfiguration, exakt die gewählte Kombination',
    'bovenaanzicht: schematisch, uit de werkelijke maten getekend':
      'Draufsicht: schematisch, aus den tatsächlichen Maßen gezeichnet',
    'vooraanzicht: boegvorm en dekopbouw van de catalogusuitvoering':
      'Bugansicht: Bugform und Aufbau der Katalogausführung',
    'Let op: dit beeld toont de':
      'Bitte beachten: dieses Bild zeigt die',
    'niet de door jou gekozen':
      'nicht die von Ihnen gewählte',
    'achteraanzicht: spiegel, zwemplateau en achterdekken':
      'Heckansicht: Spiegel, Badeplattform und Achterdecks',
    ' van de catalogusuitvoering':
      ' der Katalogausführung',
    'Service- en interieurcrew':
      'Service- und Interieurcrew',
    'Tot die tijd toont het dossier hier geen aantallen.':
      'Bis dahin zeigt das Dossier hier keine Zahlen.',
    'basis':
      'Basis',
    'aanbevolen':
      'empfohlen',
    'van':
      'von',
    'BEMANNING (AANBEVOLEN)':
      'CREW (EMPFOHLEN)',
    'je samenstelling in detail, exact de gekozen combinatie':
      'Ihre Konfiguration im Detail, exakt die gewählte Kombination',
    'Bespreek deze configuratie met een jachtspecialist':
      'Besprechen Sie diese Konfiguration mit einem Yachtspezialisten',
    'De QR-code opent exact deze samenstelling.':
      'Der QR-Code öffnet genau diese Konfiguration.',
    'HET VERVOLG, STAP VOOR STAP':
      'DAS WEITERE VORGEHEN, SCHRITT FÜR SCHRITT',
    '1.  Controle van je samenstelling en wensen':
      '1.  Prüfung Ihrer Konfiguration und Wünsche',
    '2.  Werfgesprek over indeling, materialen en planning':
      '2.  Werftgespräch über Aufteilung, Materialien und Terminplanung',
    '3.  Technische validatie door werf en klassenbureau':
      '3.  Technische Validierung durch Werft und Klassifikationsgesellschaft',
    'Comfort: groot effect voor anker en op zee. Gewicht en energieverbruik nemen toe.':
      'Komfort: große Wirkung vor Anker und auf See. Gewicht und Energieverbrauch steigen.',
    'Manoeuvreren: zijwaarts aanleggen zonder hulp. Verwaarloosbaar effect op vaart en bereik.':
      'Manövrieren: seitlich anlegen ohne Hilfe. Vernachlässigbare Wirkung auf Fahrt und Reichweite.',
    'Gewicht bovendeks; vraagt dekruimte én een extra dekbemanningslid bij het tewaterlaten.':
      'Gewicht über Deck; benötigt Decksfläche und einen zusätzlichen Decksmann beim Aussetzen.',
    'Gevuld circa een ton hoog in het schip: stabilisatoren sterk aanbevolen.':
      'Gefüllt etwa eine Tonne, hoch im Schiff: Stabilisatoren dringend empfohlen.',
    'Meerdere tonnen water op het achterdek; vrije-vloeistofeffect op de stabiliteit. Werf beoordeelt plaatsing en vulbeleid op zee.':
      'Mehrere Tonnen Wasser auf dem Achterdeck; Freispiegeleffekt auf die Stabilität. Die Werft beurteilt Platzierung und Füllstand auf See.',
    'Minder generatordraaiuren; stiller voor anker. Geen bemanningseffect.':
      'Weniger Generatorstunden; leiser vor Anker. Keine Auswirkung auf die Crew.',
    'Autonomie: drinkwater op zee. Onderhoud valt binnen de bestaande bezetting.':
      'Autonomie: Trinkwasser auf See. Die Wartung fällt in die bestehende Besetzung.',
    'Comfort benedendeks; hoger energieverbruik, zwaardere generator.':
      'Komfort unter Deck; höherer Energieverbrauch, größerer Generator.',
    'Toegang tot het water en de bijboot; hydrauliek vraagt periodiek onderhoud.':
      'Zugang zum Wasser und zum Beiboot; die Hydraulik braucht regelmäßige Wartung.',
    'Sfeer bij avond; verwaarloosbaar verbruik.':
      'Atmosphäre am Abend; vernachlässigbarer Verbrauch.',
    'Verbinding buiten kustbereik; abonnementskosten via de werf.':
      'Verbindung außerhalb der Küstenreichweite; Abonnementskosten über die Werft.',
    'Dit document is een indicatieve configuratiesamenvatting, geen definitieve offerte en geen bouwcontract.':
      'Dieses Dokument ist eine indikative Konfigurationsübersicht, kein verbindliches Angebot und kein Bauvertrag.',
    'Afbeeldingen kunnen impressies zijn; kleuren kunnen per scherm en per materiaal afwijken.':
      'Abbildungen können Impressionen sein; Farben können je nach Bildschirm und Material abweichen.',
    'Specificaties en prijzen kunnen zonder aankondiging veranderen.':
      'Spezifikationen und Preise können sich ohne Ankündigung ändern.',
    'Gekozen opties kunnen technische gevolgen hebben voor gewicht, stabiliteit, bereik en bemanning; de werf beoordeelt de definitieve uitvoerbaarheid.':
      'Gewählte Optionen können technische Folgen für Gewicht, Stabilität, Reichweite und Crew haben; die Werft beurteilt die endgültige Umsetzbarkeit.',
    'Functies aan boord bij deze bezetting: ':
      'Funktionen an Bord bei dieser Besetzung: ',
    'Bij deze omvang is professioneel bemande exploitatie de aangewezen vorm.':
      'In dieser Größe ist der professionell bemannte Betrieb die angemessene Form.',
    'Indicatie op basis van je configuratie; de definitieve eisen stelt de werf vast met vlagstaat en klassenbureau.':
      'Richtwert auf Basis Ihrer Konfiguration; die endgültigen Anforderungen legt die Werft mit Flaggenstaat und Klassifikationsgesellschaft fest.',
    'Vaarbewijs-, bemannings- en certificeringseisen moeten extern worden bevestigd door de werf, een maritiem adviseur en het betrokken klassenbureau.':
      'Anforderungen an Führerschein, Besatzung und Zertifizierung sind extern zu bestätigen durch die Werft, einen maritimen Berater und die beteiligte Klassifikationsgesellschaft.',
    'Dit is een demonstratieconfigurator: de getoonde modellen zijn voorbeeldmodellen en de specificaties zijn voorbeeldwaarden totdat een werf de eigen gegevens invoert.':
      'Dies ist ein Demonstrationskonfigurator: die gezeigten Modelle sind Beispielmodelle und die Spezifikationen Beispielwerte, bis eine Werft ihre eigenen Daten einträgt.',
    'De genoemde bemanningsbehoefte is een indicatie op basis van de gekozen configuratie. Definitieve eisen zijn afhankelijk van vlagstaat, classificatie, vaargebied, gebruik, brutotonnage en toepasselijke wet- en regelgeving. Laat de uiteindelijke bemannings- en certificeringseisen bevestigen door de werf, maritiem adviseur en het betrokken klassenbureau.':
      'Der genannte Crewbedarf ist ein Richtwert auf Basis der gewählten Konfiguration. Die endgültigen Anforderungen hängen von Flaggenstaat, Klassifikation, Fahrtgebiet, Nutzung, Bruttoraumzahl und geltenden Vorschriften ab. Lassen Sie die endgültigen Besatzungs- und Zertifizierungsanforderungen von der Werft, einem maritimen Berater und der beteiligten Klassifikationsgesellschaft bestätigen.',
    'Voor deze configuratie wordt professioneel bemande exploitatie aanbevolen.':
      'Für diese Konfiguration wird der professionell bemannte Betrieb empfohlen.',
    'Dit model is er op gebouwd om zonder vaste bemanning gevaren te worden. Voor langere tochten en nachtelijke overtochten blijft een tweede ervaren opvarende verstandig.':
      'Dieses Modell ist darauf ausgelegt, ohne feste Crew gefahren zu werden. Für längere Törns und Nachtfahrten bleibt eine zweite erfahrene Person an Bord sinnvoll.',
    'Zelfstandig varen is denkbaar voor een zeer ervaren eigenaar, maar de werf voert een technisch minimum van ':
      'Eigenhändiges Fahren ist für einen sehr erfahrenen Eigner denkbar, die Werft nennt jedoch ein technisches Minimum von '
  });
})(typeof window !== 'undefined' ? window : globalThis);
