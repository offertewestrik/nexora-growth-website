/* Assetregistry dakkapelrenders — GEGENEREERD, niet met de hand bijwerken.
 *
 * Twee verzamelingen, met een verschillende rol.
 *
 * COMBINATIES is de actieve matrix uit renderpakket v5: vijf indelingen maal
 * zes gevelafwerkingen maal vier kozijnkleuren, 120 combinaties. Eén woning,
 * één camera, één bewolkte belichting; per beeld verandert alleen wat de
 * bezoeker heeft gekozen. Dit is wat hij te zien krijgt.
 *
 * EERDERE is de beoordeelde collectie van 114 renders die daarvoor gemaakt is.
 * Die zijn niet automatisch 114 extra knoppen: ze dienen als kleur- en
 * materiaalreferentie, als maatwerkvoorbeeld bij een bijzondere aanvraag, of
 * als bron voor een nieuwe render. Vier ervan horen bij een andere
 * productfamilie (lessenaar, tongewelfd, jaren dertig, zeven vakken) en staan
 * gemarkeerd als 'uit'.
 *
 * WAT ER UIT HET MANIFEST NIET IS OVERGENOMEN
 * Het manifest van v5 zet 106 combinaties op GEREED, maar zeven van die
 * bestanden zijn nul bytes groot en decoderen niet. Ze staan hieronder dus
 * niet als beeld; de configurator valt er terug op de maatschets en
 * `ontbrekend()` telt ze mee als nog te leveren. De schijf is de bron van
 * waarheid, niet de statuskolom.
 */
(function (global) {
  'use strict';

  var PAD_COMBI = './assets/media/dakkapel/combinaties/';
  var PAD_OPTIE = './assets/media/dakkapel/opties/';
  var PAD_EERDER = './assets/media/dakkapel/renders/';

  /* 'glasvakken|gevel|kozijn' -> bestandspad onder PAD_COMBI */
  var COMBINATIES = {
    '2|creme|wit': '2-vaks/gevel-creme/kozijn-wit.webp',
    '2|creme|creme': '2-vaks/gevel-creme/kozijn-creme.webp',
    '2|creme|antraciet': '2-vaks/gevel-creme/kozijn-antraciet.webp',
    '2|creme|zwart': '2-vaks/gevel-creme/kozijn-zwart.webp',
    '2|lichtgrijs|wit': '2-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '2|lichtgrijs|creme': '2-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '2|lichtgrijs|antraciet': '2-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '2|lichtgrijs|zwart': '2-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '2|antraciet|creme': '2-vaks/gevel-antraciet/kozijn-creme.webp',
    '2|antraciet|antraciet': '2-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '2|antraciet|zwart': '2-vaks/gevel-antraciet/kozijn-zwart.webp',
    '2|zwart|wit': '2-vaks/gevel-zwart/kozijn-wit.webp',
    '2|zwart|creme': '2-vaks/gevel-zwart/kozijn-creme.webp',
    '2|zwart|antraciet': '2-vaks/gevel-zwart/kozijn-antraciet.webp',
    '2|zwart|zwart': '2-vaks/gevel-zwart/kozijn-zwart.webp',
    '2|thermowood|wit': '2-vaks/gevel-thermowood/kozijn-wit.webp',
    '2|thermowood|creme': '2-vaks/gevel-thermowood/kozijn-creme.webp',
    '2|thermowood|antraciet': '2-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '2|thermowood|zwart': '2-vaks/gevel-thermowood/kozijn-zwart.webp',
    '2|zink-platen|wit': '2-vaks/gevel-zink-platen/kozijn-wit.webp',
    '2|zink-platen|creme': '2-vaks/gevel-zink-platen/kozijn-creme.webp',
    '2|zink-platen|antraciet': '2-vaks/gevel-zink-platen/kozijn-antraciet.webp',
    '2|zink-platen|zwart': '2-vaks/gevel-zink-platen/kozijn-zwart.webp',
    '3|creme|wit': '3-vaks/gevel-creme/kozijn-wit.webp',
    '3|creme|creme': '3-vaks/gevel-creme/kozijn-creme.webp',
    '3|creme|antraciet': '3-vaks/gevel-creme/kozijn-antraciet.webp',
    '3|creme|zwart': '3-vaks/gevel-creme/kozijn-zwart.webp',
    '3|lichtgrijs|creme': '3-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '3|lichtgrijs|antraciet': '3-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '3|lichtgrijs|zwart': '3-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '3|antraciet|wit': '3-vaks/gevel-antraciet/kozijn-wit.webp',
    '3|antraciet|creme': '3-vaks/gevel-antraciet/kozijn-creme.webp',
    '3|antraciet|antraciet': '3-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '3|antraciet|zwart': '3-vaks/gevel-antraciet/kozijn-zwart.webp',
    '3|zwart|wit': '3-vaks/gevel-zwart/kozijn-wit.webp',
    '3|zwart|creme': '3-vaks/gevel-zwart/kozijn-creme.webp',
    '3|zwart|zwart': '3-vaks/gevel-zwart/kozijn-zwart.webp',
    '3|thermowood|wit': '3-vaks/gevel-thermowood/kozijn-wit.webp',
    '3|thermowood|creme': '3-vaks/gevel-thermowood/kozijn-creme.webp',
    '3|thermowood|antraciet': '3-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '3|thermowood|zwart': '3-vaks/gevel-thermowood/kozijn-zwart.webp',
    '3|zink-platen|wit': '3-vaks/gevel-zink-platen/kozijn-wit.webp',
    '3|zink-platen|creme': '3-vaks/gevel-zink-platen/kozijn-creme.webp',
    '3|zink-platen|antraciet': '3-vaks/gevel-zink-platen/kozijn-antraciet.webp',
    '3|zink-platen|zwart': '3-vaks/gevel-zink-platen/kozijn-zwart.webp',
    '4|creme|creme': '4-vaks/gevel-creme/kozijn-creme.webp',
    '4|creme|antraciet': '4-vaks/gevel-creme/kozijn-antraciet.webp',
    '4|creme|zwart': '4-vaks/gevel-creme/kozijn-zwart.webp',
    '4|lichtgrijs|wit': '4-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '4|lichtgrijs|creme': '4-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '4|lichtgrijs|antraciet': '4-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '4|lichtgrijs|zwart': '4-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '4|antraciet|wit': '4-vaks/gevel-antraciet/kozijn-wit.webp',
    '4|antraciet|creme': '4-vaks/gevel-antraciet/kozijn-creme.webp',
    '4|antraciet|antraciet': '4-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '4|antraciet|zwart': '4-vaks/gevel-antraciet/kozijn-zwart.webp',
    '4|zwart|wit': '4-vaks/gevel-zwart/kozijn-wit.webp',
    '4|zwart|creme': '4-vaks/gevel-zwart/kozijn-creme.webp',
    '4|zwart|antraciet': '4-vaks/gevel-zwart/kozijn-antraciet.webp',
    '4|zwart|zwart': '4-vaks/gevel-zwart/kozijn-zwart.webp',
    '4|thermowood|wit': '4-vaks/gevel-thermowood/kozijn-wit.webp',
    '4|thermowood|creme': '4-vaks/gevel-thermowood/kozijn-creme.webp',
    '4|thermowood|antraciet': '4-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '4|thermowood|zwart': '4-vaks/gevel-thermowood/kozijn-zwart.webp',
    '4|zink-platen|wit': '4-vaks/gevel-zink-platen/kozijn-wit.webp',
    '4|zink-platen|creme': '4-vaks/gevel-zink-platen/kozijn-creme.webp',
    '4|zink-platen|zwart': '4-vaks/gevel-zink-platen/kozijn-zwart.webp',
    '5|creme|wit': '5-vaks/gevel-creme/kozijn-wit.webp',
    '5|creme|creme': '5-vaks/gevel-creme/kozijn-creme.webp',
    '5|creme|antraciet': '5-vaks/gevel-creme/kozijn-antraciet.webp',
    '5|creme|zwart': '5-vaks/gevel-creme/kozijn-zwart.webp',
    '5|lichtgrijs|wit': '5-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '5|lichtgrijs|creme': '5-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '5|lichtgrijs|antraciet': '5-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '5|lichtgrijs|zwart': '5-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '5|antraciet|creme': '5-vaks/gevel-antraciet/kozijn-creme.webp',
    '5|antraciet|antraciet': '5-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '5|antraciet|zwart': '5-vaks/gevel-antraciet/kozijn-zwart.webp',
    '5|zwart|wit': '5-vaks/gevel-zwart/kozijn-wit.webp',
    '5|thermowood|wit': '5-vaks/gevel-thermowood/kozijn-wit.webp',
    '5|thermowood|creme': '5-vaks/gevel-thermowood/kozijn-creme.webp',
    '5|thermowood|antraciet': '5-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '5|thermowood|zwart': '5-vaks/gevel-thermowood/kozijn-zwart.webp',
    '5|zink-platen|wit': '5-vaks/gevel-zink-platen/kozijn-wit.webp',
    '5|zink-platen|creme': '5-vaks/gevel-zink-platen/kozijn-creme.webp',
    '5|zink-platen|zwart': '5-vaks/gevel-zink-platen/kozijn-zwart.webp',
    '5|zwart|creme': '5-vaks/gevel-zwart/kozijn-creme.webp',
    '5|zwart|antraciet': '5-vaks/gevel-zwart/kozijn-antraciet.webp',
    '5|zwart|zwart': '5-vaks/gevel-zwart/kozijn-zwart.webp',
    '6|creme|wit': '6-vaks/gevel-creme/kozijn-wit.webp',
    '6|creme|creme': '6-vaks/gevel-creme/kozijn-creme.webp',
    '6|creme|antraciet': '6-vaks/gevel-creme/kozijn-antraciet.webp',
    '6|creme|zwart': '6-vaks/gevel-creme/kozijn-zwart.webp',
    '6|lichtgrijs|wit': '6-vaks/gevel-lichtgrijs/kozijn-wit.webp',
    '6|lichtgrijs|creme': '6-vaks/gevel-lichtgrijs/kozijn-creme.webp',
    '6|antraciet|wit': '6-vaks/gevel-antraciet/kozijn-wit.webp',
    '6|antraciet|creme': '6-vaks/gevel-antraciet/kozijn-creme.webp',
    '6|antraciet|antraciet': '6-vaks/gevel-antraciet/kozijn-antraciet.webp',
    '6|antraciet|zwart': '6-vaks/gevel-antraciet/kozijn-zwart.webp',
    '6|zwart|wit': '6-vaks/gevel-zwart/kozijn-wit.webp',
    '6|thermowood|wit': '6-vaks/gevel-thermowood/kozijn-wit.webp',
    '6|zink-platen|wit': '6-vaks/gevel-zink-platen/kozijn-wit.webp',
    '6|lichtgrijs|antraciet': '6-vaks/gevel-lichtgrijs/kozijn-antraciet.webp',
    '6|lichtgrijs|zwart': '6-vaks/gevel-lichtgrijs/kozijn-zwart.webp',
    '6|thermowood|creme': '6-vaks/gevel-thermowood/kozijn-creme.webp',
    '6|thermowood|antraciet': '6-vaks/gevel-thermowood/kozijn-antraciet.webp',
    '6|thermowood|zwart': '6-vaks/gevel-thermowood/kozijn-zwart.webp',
    '6|zink-platen|creme': '6-vaks/gevel-zink-platen/kozijn-creme.webp',
    '6|zink-platen|antraciet': '6-vaks/gevel-zink-platen/kozijn-antraciet.webp',
    '6|zwart|creme': '6-vaks/gevel-zwart/kozijn-creme.webp',
    '6|zwart|antraciet': '6-vaks/gevel-zwart/kozijn-antraciet.webp',
    '6|zwart|zwart': '6-vaks/gevel-zwart/kozijn-zwart.webp',
  };

  /* Eén beeld per optie, op dezelfde woning en camera als de matrix. */
  var OPTIEBEELDEN = {
    rooster: 'optie-ventilatierooster-op-dakkapel.webp',
    screens: 'optie-screen-op-dakkapel.webp',
    rolluiken: 'optie-rolluik-op-dakkapel.webp',
    spots: 'optie-spotjes-overstek.webp',
  };

  /* De binnenafwerking heeft drie niveaus en van alle drie is een beeld
     gemaakt, vanuit dezelfde hoek op dezelfde zolder. Daarmee is het geen
     vinkje meer maar een keuze die je kunt zien: kaal hout, dichtgezet met
     gipsplaat, of afgewerkt en geschilderd. */
  var BINNENBEELDEN = {
    casco: 'optie-binnenzijde-casco.webp',
    gipsplaten: 'optie-binnenzijde-gipsplaten.webp',
    afgewerkt: 'optie-binnenzijde-afgewerkt.webp',
  };

  /* id: [origineel bestand, categorie, glasvakken (0 = niet vastgelegd),
          kozijnconstructie, kleurlabel uit de bronselectie] */
  var EERDERE = {
    'anthraciet-dakkapel-met-drie-toplights': ['Anthraciet dakkapel met drie toplights', 'maatwerk', 3, 'bovenlicht', 'Antraciet'],
    'anthraciet-dakkapel-met-twee-gelijke-ramen': ['Anthraciet dakkapel met twee gelijke ramen', 'standaard', 2, 'doorlopend', 'Antraciet'],
    'anthraciet-dakkapel-met-vierdelig-zwart-raam': ['Anthraciet dakkapel met vierdelig zwart raam', 'standaard', 4, 'doorlopend', 'Zwart'],
    'anthraciet-dakkapel-met-vijf-afzonderlijke-ramen': ['Anthraciet dakkapel met vijf afzonderlijke ramen', 'maatwerk', 5, 'los', 'Antraciet'],
    'anthraciete-dakkapel-met-doorlopend-ventilatierooster': ['Anthraciete dakkapel met doorlopend ventilatierooster', 'optie', 0, 'doorlopend', 'Antraciet'],
    'anthraciete-dakkapel-met-drie-bovenlichten': ['Anthraciete dakkapel met drie bovenlichten', 'maatwerk', 3, 'bovenlicht', 'Antraciet'],
    'anthraciete-dakkapel-met-drie-glasvakken': ['Anthraciete dakkapel met drie glasvakken', 'standaard', 3, 'doorlopend', 'Antraciet'],
    'anthraciete-dakkapel-met-drie-raamvakken': ['Anthraciete dakkapel met drie raamvakken', 'standaard', 3, 'doorlopend', 'Antraciet'],
    'anthraciete-dakkapel-met-drievoudige-raamindeling': ['Anthraciete dakkapel met drievoudige raamindeling', 'standaard', 3, 'doorlopend', 'Antraciet'],
    'anthraciete-dakkapel-met-twee-glasvakken': ['Anthraciete dakkapel met twee glasvakken', 'standaard', 2, 'doorlopend', 'Antraciet'],
    'anthraciete-dakkapel-met-vijf-aparte-ramen': ['Anthraciete dakkapel met vijf aparte ramen', 'maatwerk', 5, 'los', 'Antraciet'],
    'anthraciete-dakkapel-met-witte-kozijnen': ['Anthraciete dakkapel met witte kozijnen', 'standaard', 0, 'doorlopend', 'Antraciet'],
    'anthraciete-lessenaarsdakkapel-met-driedelig-raam': ['Anthraciete lessenaarsdakkapel met driedelig raam', 'uit', 3, 'doorlopend', 'Antraciet'],
    'antraciet-dakkapel-met-drie-vaste-glasvakken': ['Antraciet dakkapel met drie vaste glasvakken', 'maatwerk', 3, 'doorlopend', 'Antraciet'],
    'antraciete-dakkapel-met-drie-ramen': ['Antraciete dakkapel met drie ramen', 'standaard', 3, 'doorlopend', 'Antraciet'],
    'antraciete-dakkapel-met-gemengde-raamindeling': ['Antraciete dakkapel met gemengde raamindeling', 'maatwerk', 0, 'doorlopend', 'Antraciet'],
    'antraciete-dakkapel-met-plat-dak': ['Antraciete dakkapel met plat dak', 'standaard', 0, 'doorlopend', 'Antraciet'],
    'antraciete-dakkapel-met-twee-losse-ramen': ['Antraciete dakkapel met twee losse ramen', 'maatwerk', 2, 'los', 'Antraciet'],
    'antraciete-dakkapel-met-vier-losse-ramen': ['Antraciete dakkapel met vier losse ramen', 'maatwerk', 4, 'los', 'Antraciet'],
    'antraciete-dakkapel-met-vijf-glasvakken': ['Antraciete dakkapel met vijf glasvakken', 'standaard', 5, 'doorlopend', 'Antraciet'],
    'antraciete-dakkapel-met-zwart-drieluikraam': ['Antraciete dakkapel met zwart drieluikraam', 'standaard', 3, 'doorlopend', 'Zwart'],
    'antraciete-dakkapel-met-zwart-kozijn': ['Antraciete dakkapel met zwart kozijn', 'standaard', 0, 'doorlopend', 'Zwart'],
    'asymmetrische-antraciet-dakkapel-met-brede-ruit': ['Asymmetrische antraciet dakkapel met brede ruit', 'maatwerk', 0, 'doorlopend', 'Antraciet'],
    'asymmetrische-dakkapel-met-brede-vaste-ruit': ['Asymmetrische dakkapel met brede vaste ruit', 'maatwerk', 0, 'doorlopend', 'Niet benoemd'],
    'asymmetrische-dakkapel-met-doorlopend-antraciet-kozijn': ['Asymmetrische dakkapel met doorlopend antraciet kozijn', 'maatwerk', 0, 'doorlopend', 'Antraciet'],
    'blauwgrijze-dakkapel-met-zwarte-kozijnen': ['Blauwgrijze dakkapel met zwarte kozijnen', 'kleur', 0, 'doorlopend', 'Blauwgrijs'],
    'blauwgrijze-rechte-dakkapel-met-oranje-dak': ['Blauwgrijze rechte dakkapel met oranje dak', 'kleur', 0, 'doorlopend', 'Blauwgrijs'],
    'blauwgrijze-zinken-dakkapel-met-drie-glasvlakken': ['Blauwgrijze zinken dakkapel met drie glasvlakken', 'kleur', 3, 'doorlopend', 'Zink/blauwgrijs'],
    'blauwgrijze-zinken-dakkapel-met-drie-ramen': ['Blauwgrijze zinken dakkapel met drie ramen', 'kleur', 3, 'doorlopend', 'Zink/blauwgrijs'],
    'brede-dakkapel-met-vier-zwarte-ramen': ['Brede dakkapel met vier zwarte ramen', 'standaard', 4, 'doorlopend', 'Zwart'],
    'brede-dakkapel-met-vijf-aparte-zwarte-ramen': ['Brede dakkapel met vijf aparte zwarte ramen', 'maatwerk', 5, 'los', 'Zwart'],
    'brede-dakkapel-met-zes-antraciete-ramen': ['Brede dakkapel met zes antraciete ramen', 'standaard', 6, 'doorlopend', 'Antraciet'],
    'brede-dakkapel-met-zeven-raamvakken': ['Brede dakkapel met zeven raamvakken', 'uit', 7, 'doorlopend', 'Niet benoemd'],
    'brede-rechte-dakkapel-met-drie-losse-ramen': ['Brede rechte dakkapel met drie losse ramen', 'maatwerk', 3, 'los', 'Niet benoemd'],
    'brede-rechte-dakkapel-met-vijf-glasvakken': ['Brede rechte dakkapel met vijf glasvakken', 'standaard', 5, 'doorlopend', 'Niet benoemd'],
    'brede-rechte-dakkapel-met-vijf-ramen': ['Brede rechte dakkapel met vijf ramen', 'standaard', 5, 'doorlopend', 'Niet benoemd'],
    'brede-rechte-dakkapel-met-zes-ramen': ['Brede rechte dakkapel met zes ramen', 'standaard', 6, 'doorlopend', 'Niet benoemd'],
    'compacte-dakkapel-met-doorlopend-wit-kozijn': ['Compacte dakkapel met doorlopend wit kozijn', 'standaard', 0, 'doorlopend', 'Wit'],
    'compacte-witte-dakkapel-met-twee-ramen': ['Compacte witte dakkapel met twee ramen', 'standaard', 2, 'doorlopend', 'Wit'],
    'cremekleurige-dakkapel-met-drie-raamvakken': ['Crèmekleurige dakkapel met drie raamvakken', 'kleur', 3, 'doorlopend', 'Crème'],
    'dakkapel-met-centraal-draai-kiepraam': ['Dakkapel met centraal draai-kiepraam', 'optie', 0, 'doorlopend', 'Niet benoemd'],
    'dakkapel-met-creme-kozijnen': ['Dakkapel met crème kozijnen', 'kleur', 0, 'doorlopend', 'Crème'],
    'dakkapel-met-drie-afzonderlijke-zwarte-ramen': ['Dakkapel met drie afzonderlijke zwarte ramen', 'maatwerk', 3, 'los', 'Zwart'],
    'dakkapel-met-drie-anthraciete-rolluiken': ['Dakkapel met drie anthraciete rolluiken', 'optie', 3, 'doorlopend', 'Antraciet'],
    'dakkapel-met-drie-aparte-witte-ramen': ['Dakkapel met drie aparte witte ramen', 'maatwerk', 3, 'los', 'Wit'],
    'dakkapel-met-drie-gescheiden-ramen': ['Dakkapel met drie gescheiden ramen', 'maatwerk', 3, 'los', 'Niet benoemd'],
    'dakkapel-met-drie-halfgesloten-antraciete-screens': ['Dakkapel met drie halfgesloten antraciete screens', 'optie', 3, 'doorlopend', 'Antraciet'],
    'dakkapel-met-drie-vaste-glasvlakken': ['Dakkapel met drie vaste glasvlakken', 'maatwerk', 3, 'doorlopend', 'Niet benoemd'],
    'dakkapel-met-dubbele-driedelige-raamunits': ['Dakkapel met dubbele driedelige raamunits', 'maatwerk', 3, 'los', 'Niet benoemd'],
    'dakkapel-met-geopende-zijramen': ['Dakkapel met geopende zijramen', 'optie', 0, 'doorlopend', 'Niet benoemd'],
    'dakkapel-met-satijnaluminium-en-zwart-kozijn': ['Dakkapel met satijnaluminium en zwart kozijn', 'kleur', 0, 'doorlopend', 'Satijnaluminium'],
    'dakkapel-met-thermowood-en-zwarte-ramen': ['Dakkapel met thermowood en zwarte ramen', 'kleur', 0, 'doorlopend', 'Thermowood/houtlook'],
    'dakkapel-met-twee-aparte-ramen': ['Dakkapel met twee aparte ramen', 'maatwerk', 2, 'los', 'Niet benoemd'],
    'dakkapel-met-verkeerswitte-raamkozijnen': ['Dakkapel met verkeerswitte raamkozijnen', 'kleur', 0, 'doorlopend', 'Verkeerswit'],
    'donkergroene-dakkapel-op-roodbruine-dakpannen': ['Donkergroene dakkapel op roodbruine dakpannen', 'kleur', 0, 'doorlopend', 'Donkergroen'],
    'klassieke-1930s-dakkapel-in-creme-en-donkergroen': ['Klassieke 1930s-dakkapel in crème en donkergroen', 'uit', 0, 'doorlopend', 'Donkergroen'],
    'lichtgrijze-dakkapel-met-witte-kozijnen': ['Lichtgrijze dakkapel met witte kozijnen', 'kleur', 0, 'doorlopend', 'Lichtgrijs'],
    'lichtgrijze-rechte-dakkapel-op-oranje-dak': ['Lichtgrijze rechte dakkapel op oranje dak', 'kleur', 0, 'doorlopend', 'Lichtgrijs'],
    'matte-zwarte-dakkapel-met-vier-ramen': ['Matte zwarte dakkapel met vier ramen', 'standaard', 4, 'doorlopend', 'Zwart'],
    'matte-zwarte-dakkapel-met-vijf-glasvakken': ['Matte zwarte dakkapel met vijf glasvakken', 'standaard', 5, 'doorlopend', 'Zwart'],
    'moderne-anthracieten-dakkapel-met-drievoudig-raam': ['Moderne anthracieten dakkapel met drievoudig raam', 'standaard', 3, 'doorlopend', 'Antraciet'],
    'moderne-dakkapel-met-witte-omlijsting': ['Moderne dakkapel met witte omlijsting', 'standaard', 0, 'doorlopend', 'Wit'],
    'moderne-dakkapel-op-nederlands-rijtjeshuis': ['Moderne dakkapel op Nederlands rijtjeshuis', 'maatwerk', 0, 'doorlopend', 'Niet benoemd'],
    'mosgroene-rechte-dakkapel-onder-oranje-dak': ['Mosgroene rechte dakkapel onder oranje dak', 'kleur', 0, 'doorlopend', 'Mosgroen'],
    'platdakdakkapel-met-twee-aparte-ramen': ['Platdakdakkapel met twee aparte ramen', 'maatwerk', 2, 'los', 'Niet benoemd'],
    'rechte-antraciet-dakkapel-met-vier-glasvakken': ['Rechte antraciet dakkapel met vier glasvakken', 'standaard', 4, 'doorlopend', 'Antraciet'],
    'rechte-antraciet-dakkapel-op-nederlands-huis': ['Rechte antraciet dakkapel op Nederlands huis', 'maatwerk', 0, 'doorlopend', 'Antraciet'],
    'rechte-dakkapel-in-diep-chocoladebruin': ['Rechte dakkapel in diep chocoladebruin', 'kleur', 0, 'doorlopend', 'Chocoladebruin'],
    'rechte-dakkapel-in-warm-taupe': ['Rechte dakkapel in warm taupe', 'kleur', 0, 'doorlopend', 'Taupe'],
    'rechte-dakkapel-met-antraciet-kozijn': ['Rechte dakkapel met antraciet kozijn', 'standaard', 0, 'doorlopend', 'Antraciet'],
    'rechte-dakkapel-met-antraciete-bekleding': ['Rechte dakkapel met antraciete bekleding', 'standaard', 0, 'doorlopend', 'Antraciet'],
    'rechte-dakkapel-met-creme-bekleding': ['Rechte dakkapel met crème bekleding', 'kleur', 0, 'doorlopend', 'Crème'],
    'rechte-dakkapel-met-donkergroene-kozijnen': ['Rechte dakkapel met donkergroene kozijnen', 'kleur', 0, 'doorlopend', 'Donkergroen'],
    'rechte-dakkapel-met-drie-bovenlichten': ['Rechte dakkapel met drie bovenlichten', 'maatwerk', 3, 'bovenlicht', 'Niet benoemd'],
    'rechte-dakkapel-met-drie-losse-antracietramen': ['Rechte dakkapel met drie losse antracietramen', 'maatwerk', 3, 'los', 'Antraciet'],
    'rechte-dakkapel-met-drie-vaste-glasvakken': ['Rechte dakkapel met drie vaste glasvakken', 'maatwerk', 3, 'doorlopend', 'Niet benoemd'],
    'rechte-dakkapel-met-drie-vaste-ruiten': ['Rechte dakkapel met drie vaste ruiten', 'maatwerk', 3, 'doorlopend', 'Niet benoemd'],
    'rechte-dakkapel-met-satijnzwarte-kozijnen': ['Rechte dakkapel met satijnzwarte kozijnen', 'standaard', 0, 'doorlopend', 'Zwart'],
    'rechte-dakkapel-met-twee-zwarte-ramen': ['Rechte dakkapel met twee zwarte ramen', 'standaard', 2, 'doorlopend', 'Zwart'],
    'rechte-dakkapel-met-vier-aparte-ramen': ['Rechte dakkapel met vier aparte ramen', 'maatwerk', 4, 'los', 'Niet benoemd'],
    'rechte-dakkapel-met-vier-losse-ramen': ['Rechte dakkapel met vier losse ramen', 'maatwerk', 4, 'los', 'Niet benoemd'],
    'rechte-dakkapel-met-vier-witte-raampartijen': ['Rechte dakkapel met vier witte raampartijen', 'standaard', 4, 'doorlopend', 'Wit'],
    'rechte-dakkapel-met-vier-witte-ramen': ['Rechte dakkapel met vier witte ramen', 'standaard', 4, 'doorlopend', 'Wit'],
    'rechte-dakkapel-met-vijf-aparte-kozijnen': ['Rechte dakkapel met vijf aparte kozijnen', 'maatwerk', 5, 'los', 'Niet benoemd'],
    'rechte-dakkapel-met-wit-raam-en-antraciet': ['Rechte dakkapel met wit raam en antraciet', 'standaard', 0, 'doorlopend', 'Antraciet'],
    'rechte-dakkapel-met-zes-antraciete-ramen': ['Rechte dakkapel met zes antraciete ramen', 'standaard', 6, 'doorlopend', 'Antraciet'],
    'rechte-dakkapel-met-zes-aparte-ramen': ['Rechte dakkapel met zes aparte ramen', 'maatwerk', 6, 'los', 'Niet benoemd'],
    'rechte-dakkapel-met-zesdelige-raamverdeling': ['Rechte dakkapel met zesdelige raamverdeling', 'standaard', 6, 'doorlopend', 'Niet benoemd'],
    'rechte-dakkapel-met-zwarte-bekleding': ['Rechte dakkapel met zwarte bekleding', 'standaard', 0, 'doorlopend', 'Zwart'],
    'satijnzwarte-platte-dakkapel': ['Satijnzwarte platte dakkapel', 'standaard', 0, 'doorlopend', 'Zwart'],
    'standaard-dakkapel-met-twee-aparte-ramen': ['Standaard dakkapel met twee aparte ramen', 'maatwerk', 2, 'los', 'Niet benoemd'],
    'standaard-dakkapel-met-vier-aparte-ramen': ['Standaard dakkapel met vier aparte ramen', 'maatwerk', 4, 'los', 'Niet benoemd'],
    'strakke-anthraciet-dakkapel-met-vier-zwarte-ramen': ['Strakke anthraciet dakkapel met vier zwarte ramen', 'standaard', 4, 'doorlopend', 'Zwart'],
    'strakke-antracietkleurige-dakkapel-met-drie-ramen': ['Strakke antracietkleurige dakkapel met drie ramen', 'standaard', 3, 'doorlopend', 'Antraciet'],
    'strakke-dakkapel-met-wit-raamfront': ['Strakke dakkapel met wit raamfront', 'standaard', 0, 'doorlopend', 'Wit'],
    'strakke-dakkapel-met-witte-kozijnen': ['Strakke dakkapel met witte kozijnen', 'standaard', 0, 'doorlopend', 'Wit'],
    'strakke-platte-dakkapel-met-wit-kozijn': ['Strakke platte dakkapel met wit kozijn', 'standaard', 0, 'doorlopend', 'Wit'],
    'strakke-platte-dakkapel-met-wit-raamfront': ['Strakke platte dakkapel met wit raamfront', 'standaard', 0, 'doorlopend', 'Wit'],
    'strakke-vlakke-dakkapel-met-zes-ruiten': ['Strakke vlakke dakkapel met zes ruiten', 'standaard', 6, 'doorlopend', 'Niet benoemd'],
    'strakke-zwarte-dakkapel-met-plat-dak': ['Strakke zwarte dakkapel met plat dak', 'standaard', 0, 'doorlopend', 'Zwart'],
    'taupe-grijze-dakkapel-met-zwart-kozijn': ['Taupe-grijze dakkapel met zwart kozijn', 'kleur', 0, 'doorlopend', 'Taupe'],
    'thermowood-dakkapel-met-drie-raamvakken': ['Thermowood dakkapel met drie raamvakken', 'kleur', 3, 'doorlopend', 'Thermowood/houtlook'],
    'tongewelfde-zinken-dakkapel-met-drieluikraam': ['Tongewelfde zinken dakkapel met drieluikraam', 'uit', 3, 'doorlopend', 'Zink/blauwgrijs'],
    'vierdelige-dakkapel-met-witte-raamwand': ['Vierdelige dakkapel met witte raamwand', 'standaard', 4, 'doorlopend', 'Wit'],
    'warmwitte-rechte-dakkapel': ['Warmwitte rechte dakkapel', 'kleur', 0, 'doorlopend', 'Warmwit'],
    'witte-dakkapel-met-drie-raamvakken': ['Witte dakkapel met drie raamvakken', 'standaard', 3, 'doorlopend', 'Wit'],
    'witte-dakkapel-met-twee-raamvakken': ['Witte dakkapel met twee raamvakken', 'standaard', 2, 'doorlopend', 'Wit'],
    'witte-dakkapel-met-tweedelige-raampartij': ['Witte dakkapel met tweedelige raampartij', 'standaard', 2, 'doorlopend', 'Wit'],
    'witte-dakkapel-met-zwart-drievoudig-raam': ['Witte dakkapel met zwart drievoudig raam', 'standaard', 3, 'doorlopend', 'Zwart'],
    'witte-dakkapel-met-zwarte-kozijnen': ['Witte dakkapel met zwarte kozijnen', 'standaard', 0, 'doorlopend', 'Zwart'],
    'zandbeige-dakkapel-met-antraciete-kozijnen': ['Zandbeige dakkapel met antraciete kozijnen', 'kleur', 0, 'doorlopend', 'Zandbeige'],
    'zwarte-dakkapel-met-asymmetrische-raamindeling': ['Zwarte dakkapel met asymmetrische raamindeling', 'maatwerk', 0, 'doorlopend', 'Zwart'],
    'zwarte-dakkapel-met-drievaksraam': ['Zwarte dakkapel met drievaksraam', 'standaard', 3, 'doorlopend', 'Zwart'],
    'zwarte-dakkapel-met-tweedelige-raampartij': ['Zwarte dakkapel met tweedelige raampartij', 'standaard', 2, 'doorlopend', 'Zwart'],
  };

  function render(glasvakken, gevel, kozijnkleur) {
    var b = COMBINATIES[glasvakken + '|' + gevel + '|' + kozijnkleur];
    return b ? { src: PAD_COMBI + b, bestand: b,
                 glasvakken: glasvakken, gevel: gevel, kozijnkleur: kozijnkleur } : null;
  }
  function optieBeeld(optie) {
    var b = OPTIEBEELDEN[optie];
    return b ? { src: PAD_OPTIE + b, bestand: b, optie: optie } : null;
  }
  function binnenBeeld(niveau) {
    var b = BINNENBEELDEN[niveau];
    return b ? { src: PAD_OPTIE + b, bestand: b, niveau: niveau } : null;
  }
  function eerder(id) {
    var b = EERDERE[id];
    return b ? { id: id, bestand: b[0], categorie: b[1], glasvakken: b[2] || null,
                 kozijnconstructie: b[3], kleurBron: b[4], src: PAD_EERDER + id + '.jpg' } : null;
  }
  function eerdereLijst(categorie) {
    return Object.keys(EERDERE).filter(function (id) {
      return !categorie || EERDERE[id][1] === categorie;
    }).map(eerder);
  }

  global.NGDakkapelRenders = {
    padCombi: PAD_COMBI, padOptie: PAD_OPTIE, padEerder: PAD_EERDER,
    combinaties: COMBINATIES, optiebeelden: OPTIEBEELDEN,
    binnenbeelden: BINNENBEELDEN, eerdere: EERDERE,
    render: render, optieBeeld: optieBeeld, binnenBeeld: binnenBeeld,
    eerder: eerder, eerdereLijst: eerdereLijst
  };
})(typeof window !== 'undefined' ? window : globalThis);
