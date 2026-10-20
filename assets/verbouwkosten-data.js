/* Prijstabel voor de verbouwkosten-calculator.
 *
 * DIT IS HET ENIGE BESTAND MET BEDRAGEN. Wilt u met uw eigen prijzen
 * rekenen in plaats van met landelijke richtprijzen, pas dan hier de
 * `lo` en `hi` per regel aan en zet `bron` op 'eigen'. De calculator en
 * het kostenoverzicht nemen dat automatisch over, inclusief de
 * bronvermelding op het overzicht.
 *
 * SPELREGELS VOOR DEZE TABEL — belangrijk:
 *   - Geen enkel bedrag mag verzonnen zijn. Elke regel heeft een `bron`
 *     die verwijst naar BRONNEN hieronder, of 'eigen' als het uw eigen
 *     prijs is. Een bedrag zonder herleidbare bron hoort hier niet.
 *   - Altijd een bereik (lo–hi), nooit één getal. Een verbouwing die op
 *     de euro nauwkeurig voorspeld wordt, is een verkooppraatje.
 *   - Bedragen zijn richtprijzen INCLUSIEF btw en inclusief arbeid,
 *     zoals de landelijke kostenoverzichten ze noemen.
 *
 * Btw: voor schilderen, stukadoren, behangen en het aanbrengen van
 * isolatiemateriaal geldt bij woningen ouder dan twee jaar het verlaagde
 * tarief van 9% (isolatiemateriaal zelf blijft 21%). Dat verschil zit al
 * verwerkt in de richtprijzen van de bronnen; de calculator rekent er
 * niets bovenop. Zie belastingdienst.nl.
 */
(function (global) {
  'use strict';

  var BRONNEN = {
    homedeal:     { naam: 'Homedeal: prijzenoverzichten 2026', url: 'https://www.homedeal.nl/' },
    klussendirect:{ naam: 'Klussendirect: kosten verbouwing 2026', url: 'https://klussendirect.nl/kosten-verbouwing/' },
    werkspot:     { naam: 'Werkspot: prijzen en kosten 2026', url: 'https://www.werkspot.nl/' },
    verbouwstart: { naam: 'VerbouwStart: verbouwkosten en legeskaart 2026', url: 'https://www.verbouwstart.nl/' },
    offerteadv:   { naam: 'OfferteAdviseur: kostenindicaties 2026', url: 'https://www.offerteadviseur.nl/kostenindicatie/' },
    trustoo:      { naam: 'Trustoo: kosten dakdekker en dakkapel 2026', url: 'https://trustoo.nl/kosten/' },
    isolatieinfo: { naam: 'Isolatie-info: kosten per maatregel 2026', url: 'https://www.isolatie-info.nl/kosten' },
    sloopbrabant: { naam: 'Sloopbedrijf Brabant: doorbraak keuken en woonkamer', url: 'https://www.sloopbedrijfbrabant.nl/kennisbank/doorbraak-keuken-woonkamer-kosten/' },
    tegelkemp:    { naam: 'Kemp Tegelwerk: kosten badkamer betegelen 2026', url: 'https://www.kemptegelwerk.nl/advies/kosten-badkamer-betegelen' },
    coatingvloer: { naam: 'Coatingvloer: gietvloer prijs 2026', url: 'https://www.coatingvloer.nl/gietvloer-prijs/' },
    vandalen:     { naam: 'Van Dalen Containers: kostengids puincontainer', url: 'https://vandalencontainers.nl/blogs/wat-kost-puincontainer-kostengids/' },
    eigen:        { naam: 'Eigen prijs van het bouwbedrijf', url: '' }
  };

  /* eenheid: 'm2' | 'm' | 'st' — 'st' telt in hele stuks of als post (aantal 1).
     stap: invoerstap van het aantalveld. */
  var GROEPEN = [
    {
      id: 'uitbreiden',
      naam: 'Uitbreiden',
      uitleg: 'Extra vierkante meters erbij: aan de achtergevel, op het dak of in de kap. Dit zijn de posten waar het grootste deel van een verbouwbudget in gaat zitten.',
      items: [
        { id: 'uitbouw', naam: 'Uitbouw of aanbouw, compleet afgewerkt', eenheid: 'm2', stap: 1, lo: 1500, hi: 3500, bron: 'verbouwstart',
          noot: 'Inclusief fundering, casco, gevel, dak en afwerking. Je eigen samenstelling reken je exact door in de aanbouw-configurator.',
          link: './aanbouw-configurator.html', linkTekst: 'Stel je uitbouw samen' },
        { id: 'dakopbouw', naam: 'Dakopbouw of extra verdieping', eenheid: 'm2', stap: 1, lo: 1600, hi: 2750, bron: 'verbouwstart',
          noot: 'Optopping of opbouw op een bestaande bouwlaag. De draagcheck en de vergunningsvraag zitten in de dakopbouw-configurator.',
          link: './dakopbouw-configurator.html', linkTekst: 'Stel je dakopbouw samen' },
        { id: 'dakkapel', naam: 'Dakkapel, per strekkende meter breedte', eenheid: 'm', stap: 0.5, lo: 1500, hi: 3500, bron: 'trustoo',
          noot: 'Smalle dakkapellen kosten per meter meer dan brede: bij 2 m ligt de meterprijs rond het hoogste deel van dit bereik, bij 6 m rond het laagste.' },
        { id: 'zolder', naam: 'Zolder verbouwen tot slaapkamer', eenheid: 'st', stap: 1, lo: 12000, hi: 25000, bron: 'klussendirect',
          noot: 'Eén slaapkamer inclusief isolatie, wanden, vloer en installaties. Twee kamers: €20.000 tot €40.000.' }
      ]
    },
    {
      id: 'constructie',
      naam: 'Constructie en doorbraken',
      uitleg: 'Muren eruit, staal erin. Dit is het deel waar een berekening bij hoort. De draagbalk-rekentool maakt daar de voordimensionering voor.',
      items: [
        { id: 'doorbraakDragend', naam: 'Doorbraak in een dragende muur, incl. stalen ligger', eenheid: 'st', stap: 1, lo: 2500, hi: 7500, bron: 'sloopbrabant',
          noot: 'Inclusief constructieberekening, stalen ligger, stempelen, doorbreken en herstelwerk. De voordimensionering maak je zelf, direct online.',
          link: './draagbalk-berekenen.html', linkTekst: 'Bereken je draagbalk' },
        { id: 'doorbraakNiet', naam: 'Doorbraak in een niet-dragende muur', eenheid: 'st', stap: 1, lo: 500, hi: 2000, bron: 'sloopbrabant',
          noot: 'Geen ligger nodig, wel afwerking van de dagkanten en herstel van vloer en plafond.' },
        { id: 'muurSlopen', naam: 'Binnenmuur verwijderen', eenheid: 'm2', stap: 1, lo: 40, hi: 120, bron: 'offerteadv',
          noot: 'Alleen slopen en afvoeren; herstel van vloer, wand en plafond staat bij de afwerking.' }
      ]
    },
    {
      id: 'wanden',
      naam: 'Wanden, plafonds en stucwerk',
      uitleg: 'De indeling en de afwerking van alles wat je aanraakt. Voor stucwerk aan een woning ouder dan twee jaar geldt het verlaagde btw-tarief van 9%.',
      items: [
        { id: 'gipswand', naam: 'Gipswand plaatsen (metal stud), stucklaar', eenheid: 'm2', stap: 1, lo: 40, hi: 80, bron: 'klussendirect',
          noot: 'Inclusief frame, beplating en arbeid. Met isolatie of een deur in de wand valt het hoger uit.' },
        { id: 'plafondVerlaagd', naam: 'Verlaagd plafond in gipsplaat', eenheid: 'm2', stap: 1, lo: 55, hi: 75, bron: 'klussendirect',
          noot: 'Metal-studframe met gipsplaat, inclusief plaatsen. Vaak gecombineerd met inbouwspots en leidingwerk.' },
        { id: 'stucSausklaar', naam: 'Stucwerk wanden, sausklaar', eenheid: 'm2', stap: 1, lo: 18, hi: 30, bron: 'homedeal',
          noot: 'Glad pleisterwerk dat je direct kunt schilderen. Renovatiestucwerk op oude muren zit aan de bovenkant.' },
        { id: 'stucBehangklaar', naam: 'Stucwerk wanden, behangklaar', eenheid: 'm2', stap: 1, lo: 14, hi: 22, bron: 'homedeal' },
        { id: 'spackspuit', naam: 'Spackspuitwerk (spuitwerk wanden of plafond)', eenheid: 'm2', stap: 1, lo: 9, hi: 16, bron: 'homedeal' },
        { id: 'stucPlafond', naam: 'Plafond stucen', eenheid: 'm2', stap: 1, lo: 20, hi: 35, bron: 'homedeal' },
        { id: 'stucBuiten', naam: 'Buitenmuur stucen', eenheid: 'm2', stap: 1, lo: 35, hi: 65, bron: 'homedeal' }
      ]
    },
    {
      id: 'vloeren',
      naam: 'Vloeren en vloerverwarming',
      uitleg: 'Van ondergrond tot afwerkvloer. Let op de volgorde: egaliseren en vloerverwarming gaan altijd vóór de afwerkvloer.',
      items: [
        { id: 'dekvloer', naam: 'Zandcement dekvloer', eenheid: 'm2', stap: 1, lo: 20, hi: 30, bron: 'offerteadv',
          noot: 'Vezelversterkt of zwevend uitgevoerd loopt op tot ongeveer €57 per m².' },
        { id: 'egaliseren', naam: 'Bestaande vloer egaliseren', eenheid: 'm2', stap: 1, lo: 10, hi: 25, bron: 'klussendirect',
          noot: 'Geldt voor een betonvloer. Een houten ondervloer egaliseren kost €40 tot €80 per m².' },
        { id: 'vloerverwarming', naam: 'Vloerverwarming infrezen in bestaande vloer', eenheid: 'm2', stap: 1, lo: 45, hi: 85, bron: 'homedeal',
          noot: 'Inclusief frezen en slang. De verdeler tel je apart mee.' },
        { id: 'verdeler', naam: 'Verdeler vloerverwarming, incl. aansluiten', eenheid: 'st', stap: 1, lo: 450, hi: 1100, bron: 'homedeal' },
        { id: 'gietvloer', naam: 'Gietvloer, inclusief aanbrengen', eenheid: 'm2', stap: 1, lo: 55, hi: 105, bron: 'coatingvloer' },
        { id: 'pvc', naam: 'PVC-vloer, inclusief leggen', eenheid: 'm2', stap: 1, lo: 31, hi: 77, bron: 'werkspot',
          link: './pvc-configurator.html', linkTekst: 'Kies je PVC-vloer' },
        { id: 'laminaat', naam: 'Laminaat, inclusief leggen', eenheid: 'm2', stap: 1, lo: 35, hi: 55, bron: 'klussendirect' },
        { id: 'parket', naam: 'Houten vloer of parket, inclusief leggen', eenheid: 'm2', stap: 1, lo: 50, hi: 120, bron: 'klussendirect' },
        { id: 'tegelvloer', naam: 'Tegelvloer (standaard keramiek), incl. leggen', eenheid: 'm2', stap: 1, lo: 30, hi: 60, bron: 'klussendirect',
          noot: 'Grootformaat, visgraat of natuursteen loopt op tot ruim €200 per m².',
          link: './tegelvloer-configurator.html', linkTekst: 'Kies je tegelvloer' },
        { id: 'vloerisolatie', naam: 'Vloerisolatie', eenheid: 'm2', stap: 1, lo: 15, hi: 55, bron: 'isolatieinfo',
          noot: 'Arbeid valt onder het 9%-tarief bij woningen ouder dan twee jaar; het isolatiemateriaal zelf blijft 21%.' }
      ]
    },
    {
      id: 'natte',
      naam: 'Badkamer, toilet en keuken',
      uitleg: 'De duurste kamers per vierkante meter, omdat installatiewerk, tegelwerk en sanitair hier samenkomen.',
      items: [
        { id: 'badkamerStandaard', naam: 'Badkamer compleet vernieuwen, standaard', eenheid: 'm2', stap: 1, lo: 1200, hi: 1800, bron: 'verbouwstart',
          noot: 'Compleet: slopen, leidingwerk, tegelwerk, sanitair en afwerking. Budgetuitvoering €800–€1.200 per m², luxe vanaf €2.000 per m².',
          link: './badkamer-configurator.html', linkTekst: 'Stel je badkamer samen' },
        { id: 'tegelwerkBad', naam: 'Tegelwerk badkamer (wand en vloer), incl. arbeid', eenheid: 'm2', stap: 1, lo: 55, hi: 115, bron: 'tegelkemp',
          noot: 'Recht tegelwerk zit aan de onderkant; visgraat of grootformaat aan de bovenkant.' },
        { id: 'toilet', naam: 'Toilet compleet vernieuwen', eenheid: 'st', stap: 1, lo: 2500, hi: 5000, bron: 'klussendirect' },
        { id: 'keukenNieuw', naam: 'Nieuwe keuken, inclusief montage', eenheid: 'st', stap: 1, lo: 10000, hi: 25000, bron: 'homedeal',
          noot: 'Het bereik zegt vooral iets over je keuze in fronten, blad en apparatuur, niet over de kwaliteit van het werk.' },
        { id: 'keukenRenovatie', naam: 'Keukenrenovatie (kasten blijven staan)', eenheid: 'st', stap: 1, lo: 2000, hi: 8000, bron: 'klussendirect',
          noot: 'Nieuwe fronten, blad en eventueel apparatuur. Een fractie van een complete keuken.' },
        { id: 'keukenMontage', naam: 'Alleen keukenmontage, per strekkende meter', eenheid: 'm', stap: 0.5, lo: 250, hi: 450, bron: 'klussendirect' }
      ]
    },
    {
      id: 'installaties',
      naam: 'Installaties',
      uitleg: 'Elektra, water en verwarming. In oudere woningen is dit vaker maatgevend voor de planning dan het bouwkundige werk.',
      items: [
        { id: 'elektraHeel', naam: 'Elektra volledig vernieuwen in de woning', eenheid: 'st', stap: 1, lo: 3700, hi: 5000, bron: 'homedeal',
          noot: 'Complete nieuwe installatie. Bij gedeeltelijk werk reken je met losse groepen en stopcontacten hieronder.' },
        { id: 'groepenkast', naam: 'Groepenkast of meterkast vervangen', eenheid: 'st', stap: 1, lo: 365, hi: 875, bron: 'homedeal' },
        { id: 'groep', naam: 'Extra groep in de groepenkast', eenheid: 'st', stap: 1, lo: 200, hi: 450, bron: 'homedeal' },
        { id: 'stopcontact', naam: 'Wandcontactdoos of schakelaar bijplaatsen', eenheid: 'st', stap: 1, lo: 80, hi: 180, bron: 'homedeal' },
        { id: 'warmtepompHybride', naam: 'Hybride warmtepomp, incl. installatie', eenheid: 'st', stap: 1, lo: 4500, hi: 6000, bron: 'homedeal',
          noot: 'Bedrag na aftrek van de beschikbare ISDE-subsidie.' },
        { id: 'zonnepanelen', naam: 'Zonnepanelen, set van circa 10 panelen', eenheid: 'st', stap: 1, lo: 4500, hi: 7000, bron: 'homedeal',
          noot: 'Ongeveer 4.200 Wp. Reken op circa 1,8 m² dakoppervlak per paneel.' }
      ]
    },
    {
      id: 'schilder',
      naam: 'Schilderwerk',
      uitleg: 'Voor woningen ouder dan twee jaar geldt hier het verlaagde btw-tarief van 9%, ook op de voorbereiding en de verf.',
      items: [
        { id: 'schilderBinnen', naam: 'Binnenschilderwerk, wanden en plafonds', eenheid: 'm2', stap: 1, lo: 30, hi: 35, bron: 'homedeal' },
        { id: 'sauswerk', naam: 'Sauswerk (alleen latex op stucwerk)', eenheid: 'm2', stap: 1, lo: 10, hi: 16, bron: 'homedeal' },
        { id: 'schilderBuiten', naam: 'Buitenschilderwerk', eenheid: 'm2', stap: 1, lo: 35, hi: 40, bron: 'homedeal',
          noot: 'Als totaalprijs per woning: appartement vanaf €1.000, tussenwoning vanaf €1.500, hoekhuis of 2-onder-1-kap vanaf €3.000, vrijstaand vanaf €6.000.' },
        { id: 'trapSchilderen', naam: 'Trap schilderen', eenheid: 'st', stap: 1, lo: 600, hi: 800, bron: 'homedeal' }
      ]
    },
    {
      id: 'schil',
      naam: 'Dak, gevel en isolatie',
      uitleg: 'De schil van de woning. Isolatiewerk verdient zichzelf deels terug, en de arbeid valt onder het 9%-tarief.',
      items: [
        { id: 'platDak', naam: 'Plat dak vervangen', eenheid: 'm2', stap: 1, lo: 60, hi: 120, bron: 'homedeal',
          noot: 'Bitumen is doorgaans de voordeligste keuze en zit rond €70 tot €90 per m².' },
        { id: 'pannendak', naam: 'Dakpannen vervangen', eenheid: 'm2', stap: 1, lo: 55, hi: 85, bron: 'trustoo' },
        { id: 'dakisolatie', naam: 'Dakisolatie', eenheid: 'm2', stap: 1, lo: 30, hi: 60, bron: 'isolatieinfo' },
        { id: 'spouwisolatie', naam: 'Spouwmuurisolatie', eenheid: 'm2', stap: 1, lo: 15, hi: 40, bron: 'isolatieinfo',
          noot: 'EPS-parels en glaswol zitten rond €15 tot €20 per m²; PUR-schuim rond €25 tot €40.' },
        { id: 'kozijnen', naam: 'Kunststof kozijnen incl. HR++ glas en plaatsen', eenheid: 'm2', stap: 0.5, lo: 750, hi: 1400, bron: 'homedeal',
          noot: 'Per m² kozijnoppervlak. Voor HR++ glas geldt in 2026 een ISDE-subsidie van €25 per m², voor triple glas €111 per m².' }
      ]
    },
    {
      id: 'voorbereiding',
      naam: 'Sloop, afvoer en bijkomend',
      uitleg: 'De posten die in offertes het vaakst vergeten worden en achteraf voor verrassingen zorgen.',
      items: [
        { id: 'sloopwerk', naam: 'Sloop- en breekwerk inclusief afvoer', eenheid: 'st', stap: 1, lo: 1200, hi: 3200, bron: 'klussendirect',
          noot: 'Als post voor de hele verbouwing. Driekwart van dit bedrag is arbeid.' },
        { id: 'container', naam: 'Bouwcontainer 6 m³, incl. plaatsen en afvoeren', eenheid: 'st', stap: 1, lo: 190, hi: 350, bron: 'vandalen' },
        { id: 'asbest', naam: 'Asbest verwijderen (als het aanwezig is)', eenheid: 'st', stap: 1, lo: 300, hi: 1500, bron: 'klussendirect',
          noot: 'Een asbestinventarisatie is verplicht en komt hier bovenop. Bij twijfel: laat eerst inventariseren, sloop nooit zelf.' }
      ]
    }
  ];

  /* Opslagen en posten die over het totaal gaan in plaats van per regel. */
  var OPSLAGEN = {
    /* Landelijke kostenoverzichten melden 20 tot 30% hogere tarieven in de
       Randstad. Buiten de Randstad rekent de calculator zonder opslag. */
    randstad: { lo: 0.20, hi: 0.30, bron: 'klussendirect' },
    /* Vuistregel uit de bouw, geen bronprijs: reserveer 5 tot 10% voor wat
       je pas ziet als de muur open is. In oudere woningen eerder 10%. */
    onvoorzien: { keuzes: [0, 0.05, 0.10, 0.15], standaard: 0.10 },
    /* Leges omgevingsvergunning: gemeenten rekenen een percentage van de
       bouwsom. De spreiding tussen gemeenten is enorm — vandaar dit brede
       bereik in plaats van één getal. */
    leges: { lo: 0.009, hi: 0.084, bron: 'verbouwstart' }
  };

  /* Uurtarieven ter oriëntatie. Deze tellen NIET mee in de calculator; ze
     staan op de pagina zodat u een losse offerte kunt narekenen.
     Let op: dit zijn de enige bedragen op de pagina EXCLUSIEF btw. */
  var UURTARIEVEN = [
    { vak: 'Aannemer of bouwcoördinator', lo: 50, hi: 85 },
    { vak: 'Metselaar', lo: 45, hi: 70 },
    { vak: 'Tegelzetter', lo: 40, hi: 65 },
    { vak: 'Elektricien', lo: 45, hi: 85 },
    { vak: 'Loodgieter of installateur', lo: 50, hi: 80 },
    { vak: 'Schilder', lo: 35, hi: 55 },
    { vak: 'Stukadoor', lo: 40, hi: 65 }
  ];

  global.NGVerbouwPrijzen = {
    bijgewerkt: '11 augustus 2026',
    bronnen: BRONNEN,
    groepen: GROEPEN,
    opslagen: OPSLAGEN,
    uurtarieven: UURTARIEVEN
  };
})(typeof window !== 'undefined' ? window : globalThis);
