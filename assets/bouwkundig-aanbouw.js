(function (global) {
  'use strict';

  /* Bouwkundige kern voor de aanbouw-/uitbouwconfigurator.
     De geometrie en hoeveelheden zijn deterministisch. De liggerkeuze hieronder
     is nadrukkelijk een VOORDIMENSIONERING; bestaande bouw, opleggingen,
     verbindingen, stabiliteit, trillingen en projectspecifieke belastingen
     moeten voor uitvoering door de constructeur worden bevestigd. */

  var MATERIALEN = {
    C24: { label: 'Vuren C24', E: 11000, fm: 24, fv: 4.0, gammaM: 1.30, kmod: 0.80 },
    LVL: { label: 'Kerto LVL S-beam / LVL 48 P', E: 13800, fm: 44, fv: 4.2, gammaM: 1.20, kmod: 0.80 }
  };

  var C24 = [
    [45,170],[45,195],[45,220],[45,245],
    [60,170],[60,195],[60,220],[60,245]
  ];
  var LVL = [];
  [45,51,57,63,69,75].forEach(function (b) {
    [200,220,240,260,280,300,320,360,400,450,500].forEach(function (h) { LVL.push([b,h]); });
  });

  /* ------------------------------------------------------- gevelopbouwen ---
     Twee bouwmethoden naast elkaar, want dat is de keuze die een koper
     werkelijk maakt en die tot nu toe nergens stond:

       hsb            prefab houtskeletbouw. Wat wij standaard leveren: in de
                      fabriek gemaakt, in een dag geplaatst, lichte fundering.
       traditioneel   gemetseld ter plaatse, kalkzandsteen binnenblad met een
                      gemetseld buitenblad of buitenisolatie. Zwaarder,
                      langzamer, en het sluit naadloos aan op een bestaande
                      gemetselde woning.

     Elke laag draagt zijn eigen lambdawaarde, zodat de Rc uit de opbouw volgt
     en niet als getal wordt opgeschreven. Het derde element is de sleutel in
     NGBouwnormen.LAMBDA (of een getal); het vierde zijn opties — een
     luchtspouw, of het houtaandeel van een regelwerklaag.

     De volgorde is van BUITEN naar BINNEN. Dat is niet willekeurig: de
     Rc-berekening haalt alles wat buiten een sterk geventileerde spouw ligt
     uit de optelling, en die regel werkt alleen op een lijst die die kant op
     leest. Een gemetseld buitenblad telt dus niet mee — vergeet je dat, dan
     doet de spouwmuur op papier een halve Rc te goed. */

  /* Het houtaandeel van het stijlwerk: 38 mm stijl op 600 mm hart-op-hart is
     6,3% hout in het isolatievlak, en dat hout is de koudebrug. De
     materiaalstaat beschrijft dezelfde wand — SLS 38 × 140 met PIR 140 — dus
     staat hij hier ook zo, en niet als "vuren met minerale wol" zoals eerder.
     Twee beschrijvingen van dezelfde wand is één beschrijving te veel. */
  var HSB_REGEL = { hout: 38 / 600, lambdaHout: 0.13 };
  var HSB_INSTAL = { hout: 38 / 600, lambdaHout: 0.13 };

  var WANDEN = {
    'classic-brick': {
      code: 'W-01', naam: 'HSB gevel met keramische steenstrips',
      buiten: 'Keramische steenstrips op gecertificeerd gevelisolatiesysteem',
      methode: 'hsb',
      lagen: [
        ['Keramische steenstrip, waalformaat',20,'steenstrip'],
        ['Systeemlijm / gewapende mortellaag',8,'gipspleister'],
        ['EPS-HR gevelisolatie, systeemgebonden',100,'eps_hr'],
        ['Constructieve/winddichte buitenbeplating',12,'osb'],
        ['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],
        ['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_INSTAL],
        ['Gipskartonplaat',12.5,'gipskarton']
      ],
      noot: 'Steenstrips zijn gevelafwerking, géén gemetseld buitenspouwblad. Definitieve bevestiging en plaatopbouw conform het gekozen gecertificeerde steenstripsysteem.'
    },
    'keralit': {
      code: 'W-02', naam: 'HSB gevel met Keralit sponningdeel',
      buiten: 'Keralit gevelpaneel op geventileerde houten achterconstructie',
      methode: 'hsb',
      lagen: [
        ['Keralit sponningdeel gevelpaneel',17,'kunststof_paneel'],
        ['Geventileerde spouw / verticaal regelwerk',22,null,{spouw:'sterk'}],
        ['Waterkerende dampopen plaat/folie',12,'osb'],
        ['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],
        ['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_INSTAL],
        ['Gipskartonplaat',12.5,'gipskarton']
      ],
      noot: 'Minimaal 20 mm geventileerde spouw; bij horizontale panelen verticaal regelwerk h.o.h. 300 mm. Ventilatie-openingen en bevestigers volgens actueel Keralit voorschrift.'
    },
    'stuc-modern': {
      code: 'W-03', naam: 'HSB gevel met minerale/stucafwerking',
      buiten: 'Gevelpleister op buitenisolatiesysteem',
      methode: 'hsb',
      lagen: [
        ['Sierpleister + gewapende basislaag',8,'sierpleister'],
        ['Buitengevelisolatie EPS-HR',100,'eps_hr'],
        ['Constructieve/winddichte buitenbeplating',12,'osb'],
        ['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],
        ['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_INSTAL],
        ['Gipskartonplaat',12.5,'gipskarton']
      ], noot: 'Pleister, wapening, isolatie en bevestiging als één gecertificeerd gevelsysteem toepassen.'
    },
    'modern-wood': {
      code: 'W-04', naam: 'HSB gevel met houtlook composiet',
      buiten: 'Houtlook composiet geveldeel op geventileerde achterconstructie',
      methode: 'hsb',
      lagen: [
        ['Houtlook composiet geveldeel',20,'composiet'],
        ['Geventileerde spouw / regelwerk',28,null,{spouw:'sterk'}],
        ['Waterkerende dampopen laag',1,null,{teltNiet:true}],
        ['Constructieve buitenbeplating',12,'osb'],
        ['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],
        ['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_INSTAL],
        ['Gipskartonplaat',12.5,'gipskarton']
      ], noot: 'Merk/type composiet, brandklasse, open/gesloten gevel, ventilatie en bevestiging projectspecifiek vastleggen.'
    }
  };

  /* De traditionele tegenhangers. Kalkzandsteen binnenblad van 100 mm is het
     gangbare lijmblok; 150 mm waar het binnenblad ook de gevelisolatie moet
     dragen. De isolatiediktes zijn zo gekozen dat de opbouw het
     nieuwbouwniveau van Rc 4,7 haalt — dat wordt gerekend, niet aangenomen,
     en het rekenresultaat staat op de tekening. */
  var WANDEN_TRAD = {
    'classic-brick': {
      code: 'W-11', naam: 'Traditionele spouwmuur, schoon metselwerk',
      buiten: 'Gemetseld buitenblad waalformaat in kruisverband',
      methode: 'traditioneel',
      lagen: [
        ['Baksteen buitenblad, waalformaat',100,'baksteen'],
        ['Geventileerde spouw met open stootvoegen',30,null,{spouw:'sterk'}],
        ['Resolhardschuim spouwplaat',110,'resol'],
        ['Kalkzandsteen lijmblok binnenblad',100,'kalkzandsteen'],
        ['Gipspleister / spuitwerk',10,'gipspleister']
      ],
      noot: 'Buitenblad met open stootvoegen onderin en bovenin, spouwankers vier per m², waterkerende folie ter plaatse van lateien en aansluitingen. Het gemetselde buitenblad telt niet mee in de Rc: het ligt buiten de geventileerde spouw.'
    },
    'keralit': {
      code: 'W-14', naam: 'Kalkzandsteen met geventileerde gevelbekleding',
      buiten: 'Gevelpaneel op geventileerd regelwerk, buitenisolatie op steen',
      methode: 'traditioneel',
      lagen: [
        ['Gevelpaneel, kunststof of composiet',17,'kunststof_paneel'],
        ['Geventileerde spouw / verticaal regelwerk',40,null,{spouw:'sterk'}],
        ['Minerale wol buitengevelisolatie',160,'minerale_wol'],
        ['Kalkzandsteen lijmblok',150,'kalkzandsteen'],
        ['Gipspleister / spuitwerk',10,'gipspleister']
      ],
      noot: 'Regelwerk mechanisch verankerd in het kalkzandsteen door de isolatie heen; koudebrug van de ankers projectspecifiek beoordelen.'
    },
    'stuc-modern': {
      code: 'W-13', naam: 'Kalkzandsteen met gepleisterde buitenisolatie',
      buiten: 'Sierpleister op buitengevelisolatiesysteem',
      methode: 'traditioneel',
      lagen: [
        ['Sierpleister + gewapende basislaag',8,'sierpleister'],
        ['EPS-HR buitengevelisolatie',150,'eps_hr'],
        ['Kalkzandsteen lijmblok',150,'kalkzandsteen'],
        ['Gipspleister / spuitwerk',10,'gipspleister']
      ],
      noot: 'Pleister, wapening, isolatie en bevestiging als één gecertificeerd systeem. Geen geventileerde spouw, dus de hele opbouw telt mee in de Rc.'
    },
    'modern-wood': {
      code: 'W-15', naam: 'Kalkzandsteen met houten gevelbekleding',
      buiten: 'Houten of composiet geveldeel op geventileerd regelwerk',
      methode: 'traditioneel',
      lagen: [
        ['Houten geveldeel, duurzaamheidsklasse 1-2',22,'hout'],
        ['Geventileerde spouw / regelwerk',40,null,{spouw:'sterk'}],
        ['Minerale wol buitengevelisolatie',160,'minerale_wol'],
        ['Kalkzandsteen lijmblok',150,'kalkzandsteen'],
        ['Gipspleister / spuitwerk',10,'gipspleister']
      ],
      noot: 'Houtsoort, afwerking en onderhoudscyclus projectspecifiek vastleggen; onderzijde bekleding minimaal 200 mm boven maaiveld.'
    }
  };

  function materiaalSleutel(material) {
    var map = {
      metselwerk:'classic-brick', 'classic-brick':'classic-brick',
      stucwerk:'stuc-modern', 'stuc-modern':'stuc-modern',
      hout:'modern-wood', houtlook:'modern-wood', 'modern-wood':'modern-wood', composite:'modern-wood', natuursteen:'classic-brick',
      keralit:'keralit'
    };
    return map[material] || 'keralit';
  }

  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function rond(v, n) { var p = Math.pow(10, n || 0); return Math.round(v * p) / p; }

  function checkProfiel(matKey, b, h, Lm, spacing, gk, qk, limiet) {
    var m = MATERIALEN[matKey], L = Lm * 1000;
    var qd = (1.35 * gk + 1.50 * qk) * spacing; // kN/m = N/mm
    var qsls = (gk + qk) * spacing;
    var M = qd * L * L / 8;
    var V = qd * L / 2;
    var W = b * h * h / 6;
    var I = b * Math.pow(h, 3) / 12;
    var kh = matKey === 'LVL' ? Math.min(1.2, Math.pow(300 / h, 0.12)) : 1;
    var fmd = m.kmod * kh * m.fm / m.gammaM;
    var fvd = m.kmod * m.fv / m.gammaM;
    var sigma = M / W;
    var tau = 1.5 * V / (b * h);
    var defl = 5 * qsls * Math.pow(L,4) / (384 * m.E * I);
    var deflMax = L / limiet;
    return {
      ok: sigma <= fmd && tau <= fvd && defl <= deflMax,
      sigma: rond(sigma,2), fmd: rond(fmd,2), tau:rond(tau,2), fvd:rond(fvd,2),
      defl:rond(defl,1), deflMax:rond(deflMax,1)
    };
  }

  function voordimensioneer(kind, span, opts) {
    opts = opts || {};
    var spacing = num(opts.spacing, 0.60);
    var gk = num(opts.gk, kind === 'vloer' ? 0.75 : 0.65);
    var qk = num(opts.qk, kind === 'vloer' ? 2.00 : 0.70);
    if (opts.groenDak) gk += 1.00;
    /* Naast de elastische doorbuigingscheck gebruiken we bij de voorselectie
       een slankheidsfilter. Daarmee voorkomen we dat een profiel dat op papier
       nét L/300 haalt als comfortabele vloer wordt gepresenteerd; trillingen
       en langetermijnkruip worden immers pas in de definitieve berekening
       volledig beoordeeld. */
    var limiet = kind === 'vloer' ? 400 : 300;
    var minDiepte = span * 1000 / (kind === 'vloer' ? 18 : 22);
    var voorkeur = span <= 4.8 ? ['C24','LVL'] : ['LVL'];
    for (var mi=0; mi<voorkeur.length; mi++) {
      var mk = voorkeur[mi], lijst = mk === 'C24' ? C24 : LVL;
      for (var i=0; i<lijst.length; i++) {
        if (lijst[i][1] < minDiepte) continue;
        var c = checkProfiel(mk, lijst[i][0], lijst[i][1], span, spacing, gk, qk, limiet);
        if (c.ok) return {
          materiaal:mk, materiaalLabel:MATERIALEN[mk].label, b:lijst[i][0], h:lijst[i][1],
          profiel:lijst[i][0]+' × '+lijst[i][1]+' mm', span:rond(span,2), spacing:spacing,
          gk:rond(gk,2), qk:rond(qk,2), check:c, status:'VOORDIMENSIONERING'
        };
      }
    }
    return { materiaal:'LVL', materiaalLabel:MATERIALEN.LVL.label, profiel:'PROJECTSPECIFIEK', span:rond(span,2), spacing:spacing, gk:gk, qk:qk, status:'CONSTRUCTEUR DIMENSIONEERT' };
  }

  /* De gevelopbouw volgt uit de gevelafwerking én uit de bouwmethode. Twee
     argumenten dus, en het tweede is nieuw; wie het weglaat krijgt de
     prefab-uitvoering, wat de bestaande aanroepen ongewijzigd laat werken. */
  function wand(material, methode) {
    var tabel = methode === 'traditioneel' ? WANDEN_TRAD : WANDEN;
    return tabel[materiaalSleutel(material)] || tabel.keralit;
  }
  /* Hoeveel van een balklaag hout is: balkbreedte gedeeld door de hart-op-
     hartmaat. Dat aandeel is de koudebrug in het dakvlak; bij 45 mm op 600
     is het 7,5%, bij een zwaar LVL-profiel loopt het op en dat hoort in de
     Rc terug te komen. */
  function dakHoutaandeel(dak) {
    var b = num(dak && dak.b, 45), hoh = num(dak && dak.spacing, 0.60) * 1000;
    return Math.max(0.04, Math.min(0.30, b / hoh));
  }

  /* De drie warmteweerstanden bij elkaar. Ontbreekt de normenmodule, dan komt
     er null uit en zegt de tekening dat er niet getoetst is — beter dan een
     getal zonder herkomst. */
  function rcVan(gevel, dak, vloer) {
    var N = global.NGBouwnormen;
    if (!N) return null;
    return { gevel: N.rc(gevel), dak: N.rc(dak), vloer: N.rc(vloer) };
  }

  function bouwmethodeVan(cfg) {
    return (cfg && cfg.bouwmethode === 'traditioneel') ? 'traditioneel' : 'hsb';
  }

  /* Parametrisch kamerplan. Alle coordinaten zijn genormaliseerd (0..1) en
     worden pas op het tekenblad naar echte millimeters vertaald. Hierdoor
     blijven deuren, wanden en ruimtestempels gekoppeld aan de gekozen maat. */
  function kamerplan(indeling, voorzieningen, opp) {
    /* UITBOUW = uitsluitend begane-gronduitbreiding tegen een bestaande
       woning. Geen functies of constructieprincipes uit andere producttypen
       hier hergebruiken. De standaard nieuwe ruimte
       is open en sluit via DB-01 aan op de bestaande begane grond. */
    return {
      wanden:[], deuren:[],
      ruimten:[{code:'R-U01',naam:'NIEUWE LEEFRUIMTE',x:.5,y:.86,opp:rond(opp,1),
        /* De hele binnenruimte, want een uitbouw is één open ruimte. Het
           rechthoekje is wat de plattegrond nodig heeft om er meubels in te
           zetten. */
        rect:{x0:0,y0:0,x1:1,y1:1}, functie:'leefruimte'}]
    };
  }

  /* Parametrisch kamerplan voor de VRIJSTAANDE woonunits: mantelzorgwoning,
     vakantiewoning en tuinstudio. Bewust een tweede functie naast
     kamerplan() en niet een vlag erin: een uitbouw is een uitbreiding van
     een bestaande woonkamer en heeft daarom één open ruimte, een vrijstaande
     unit is een woning op zichzelf met slaapkamers, een badkamer en een
     keuken. Die twee door elkaar halen is precies wat de waarschuwing bij
     kamerplan() verbiedt, dus staan ze los.

     De unit is langgerekt: slaapkamers op een rij aan de achterzijde, het
     woondeel aan de puizijde. Coördinaten genormaliseerd (0..1), x langs de
     breedte en y van de achterzijde (0) naar de puizijde (1). */
  /* Een keukenblok van 2,40 m lang en 2,40 m diep werkruimte: de maat waarop
     een keuken met werkblad en loopruimte erlangs past. Bij een smal woondeel
     krimpt hij mee. */
  function keukenOpp(woonB, dp, slaap) {
    return Math.min(2.40, (slaap ? woonB : woonB) * 0.35) * Math.min(2.40, dp * 0.6);
  }

  function kamerplanVrijstaand(indeling, voorzieningen, opp, w, dp) {
    voorzieningen = voorzieningen || {};
    w = num(w, 8); dp = num(dp, 4);
    var slaap = indeling === '2-slaapkamers' ? 2 : (indeling === '1-slaapkamer' ? 1 : 0);
    var bad = !!(voorzieningen['basis-sanitair'] || voorzieningen['luxe-badkamer']);
    var luxeBad = !!voorzieningen['luxe-badkamer'];
    var keuken = !!(voorzieningen['kitchenette'] || voorzieningen['full-kitchen']);
    var plan = { wanden: [], deuren: [], ruimten: [] };

    /* Verdelen langs de LENGTE, niet langs de diepte. Deze units zijn
       ongeveer vier meter diep; een slaapkamer die daar een strook van
       afsnijdt wordt anderhalve meter diep en daar past geen bed in. Dus:
       slaapkamers naast elkaar aan één kop, met een gang ervoor, en het
       woondeel aan de andere kop. Dat is ook hoe deze units werkelijk
       gebouwd worden.

       Alle streefmaten staan hier in meters en worden pas op het eind
       genormaliseerd, zodat een kamer van 2,90 m ook echt 2,90 m is en niet
       een percentage dat bij een andere breedte iets anders betekent.

       Elke ruimte krijgt naast zijn stempel ook een `rect`: het rechthoekje
       waar hij ligt, genormaliseerd. Dat is wat de plattegrond nodig heeft om
       er meubels in te zetten — een zwaartepunt alleen zegt niet hoeveel
       ruimte er is. */
    var GANG = 1.10, SLAAPB = 2.90, BADB = 2.00, WOONMIN = 3.20;
    var gang = slaap ? Math.min(GANG, dp * 0.30) : 0;
    var slaapB = slaap ? slaap * SLAAPB : 0;
    var badB = bad ? BADB : 0;
    /* Past het woondeel niet meer, dan krimpen slaap- en baddeel mee in
       plaats van dat er een woonkamer van tachtig centimeter ontstaat. Dat
       de kamers dan klein worden is de waarheid over deze maat; die hoort
       op de tekening te staan en niet weggerekend te worden. */
    if (slaapB + badB > w - WOONMIN) {
      var f = Math.max(0.3, (w - WOONMIN) / Math.max(0.01, slaapB + badB));
      slaapB *= f; badB *= f;
    }
    var xs = slaapB / w, xb = (slaapB + badB) / w, gy = gang / dp;

    if (slaap) {
      plan.wanden.push({ x1: 0, y1: gy, x2: xb, y2: gy });
      for (var i = 1; i < slaap; i++) plan.wanden.push({ x1: (i / slaap) * xs, y1: gy, x2: (i / slaap) * xs, y2: 1 });
      for (var k = 0; k < slaap; k++) {
        var cx = ((k + 0.5) / slaap) * xs;
        plan.deuren.push({ code: 'D-' + String(k + 1).padStart(2, '0'), x: cx, y: gy,
                           richting: 'h', draai: k % 2 ? 'rechts' : 'links', breedte: 0.85 });
        plan.ruimten.push({ code: 'R-' + String(k + 1).padStart(2, '0'), naam: 'SLAAPKAMER ' + (k + 1),
                            x: cx, y: gy + (1 - gy) * 0.5, opp: rond((slaapB / slaap) * (dp - gang), 1),
                            rect: { x0: (k / slaap) * xs, y0: gy, x1: ((k + 1) / slaap) * xs, y1: 1 },
                            functie: 'slaapkamer' });
      }
      plan.ruimten.push({ code: 'R-G01', naam: 'GANG', x: xb * 0.5, y: gy * 0.5,
                          opp: rond((slaapB + badB) * gang, 1),
                          rect: { x0: 0, y0: 0, x1: xb, y1: gy }, functie: 'gang' });
    }
    if (bad && slaap) {
      plan.wanden.push({ x1: xs, y1: gy, x2: xs, y2: 1 });
      plan.deuren.push({ code: 'D-BAD', x: (xs + xb) / 2, y: gy, richting: 'h', draai: 'rechts', breedte: 0.8 });
      plan.ruimten.push({ code: 'R-BAD', naam: 'BADKAMER', x: (xs + xb) / 2, y: gy + (1 - gy) * 0.5,
                         opp: rond(badB * (dp - gang), 1), nat: true,
                         rect: { x0: xs, y0: gy, x1: xb, y1: 1 }, functie: 'badkamer', luxe: luxeBad });
    } else if (bad) {
      /* Zonder slaapkamers is er geen gang om de badkamer aan te hangen, en
         een badkamer over de volle diepte van vier meter is geen badkamer
         maar een gymzaal. Hij wordt dus een blok in de hoek, met de rest van
         de kop als woon-/slaapruimte eromheen. */
      var badD = Math.min(2.40, dp * 0.62);
      plan.wanden.push({ x1: 0, y1: badD / dp, x2: badB / w, y2: badD / dp },
                       { x1: badB / w, y1: 0, x2: badB / w, y2: badD / dp });
      plan.deuren.push({ code: 'D-BAD', x: badB / (2 * w), y: badD / dp, richting: 'h', draai: 'rechts', breedte: 0.8 });
      plan.ruimten.push({ code: 'R-BAD', naam: 'BADKAMER', x: badB / (2 * w), y: badD / (2 * dp),
                         opp: rond(badB * badD, 1), nat: true,
                         rect: { x0: 0, y0: 0, x1: badB / w, y1: badD / dp }, functie: 'badkamer', luxe: luxeBad });
    }
    /* De scheidingswand tussen het slaap-/baddeel en de woonruimte loopt over
       de volle diepte; daar zit de doorgang in. */
    if (xb > 0) {
      plan.wanden.push({ x1: xb, y1: 0, x2: xb, y2: 1 });
      plan.deuren.push({ code: 'D-W01', x: xb, y: 0.5, richting: 'v', draai: 'links', breedte: 0.9 });
    }
    /* De keuken krijgt geen eigen kamer: hij staat open op de woonkamer, en
       zo heet hij dan ook. Twee stempels in één ruimte zonder wand ertussen
       suggereert een scheiding die er niet is. */
    var woonX0 = slaap || bad ? xb : (bad ? badB / w : 0);
    var woonB = w - slaapB - badB;
    var woonOpp = slaap ? woonB * dp : (w * dp - badB * Math.min(2.40, dp * 0.62));
    plan.ruimten.push({ code: 'R-W01',
                        naam: (slaap ? 'WOONKAMER' : 'WOON-/SLAAPRUIMTE') + (keuken ? ' + KEUKEN' : ''),
                        /* Het stempel laag in de kamer: bovenin staan de keuken en de
                           zithoek, en een naam over een bank heen leest niet. */
                        x: woonX0 + (1 - woonX0) * 0.5, y: 0.86,
                        opp: rond(woonOpp, 1),
                        rect: { x0: woonX0, y0: 0, x1: 1, y1: 1 },
                        functie: slaap ? 'woonkamer' : 'studio', keuken: keuken,
                        keukenLang: !!voorzieningen['full-kitchen'] });
    return plan;
  }

  var VRIJSTAAND = { mantelzorgwoning: 1, vakantiewoning: 1, tuinstudio: 1 };

  function model(cfg) {
    cfg = cfg || {};
    var w = Math.max(1, num(cfg.w, 6));
    var dp = Math.max(1, num(cfg.dp, 4));
    var h = Math.max(2.1, num(cfg.h, 2.6));
    var span = Math.min(w, dp);
    var langs = Math.max(w, dp);
    var groen = cfg.roofing === 'green';
    var methode = bouwmethodeVan(cfg);
    var dak = voordimensioneer('dak', span, { groenDak:groen });
    var W = wand(cfg.material, methode);
    var vrijstaand = !!VRIJSTAAND[cfg.type];
    var fundType = cfg.fundering && cfg.fundering['fundering-heipalen'] ? 'palen' : (cfg.fundering && cfg.fundering['fundering-poeren'] ? 'poeren' : 'stroken');

    /* Dakopbouw van buiten naar binnen. De balklaag telt met zijn houtaandeel
       mee als koudebrug; de ruimte ernaast is isolatie, en die twee bij elkaar
       zijn wat er werkelijk isoleert. */
    var DAKLAGEN = [
      ['Dakbedekking '+(cfg.roofing === 'bitumen' ? 'bitumen tweelaags' : 'EPDM'),2, cfg.roofing === 'bitumen' ? 'bitumen' : 'epdm'],
      ['PIR afschot-/dakisolatie',140,'pir'],
      ['Dampremmende laag',1,null,{teltNiet:true}],
      ['OSB/3 dakbeschot',18,'osb'],
      [(dak.materiaalLabel||'LVL')+' dakbalk '+dak.profiel+' h.o.h. '+Math.round(dak.spacing*1000), dak.h || 300,
       null, {spouw:'gesloten'}],
      ['Installatiestrook',45,null,{teltNiet:true}],
      ['Gipskarton plafond',12.5,'gipskarton']
    ];
    /* Vloer op grondslag. Het zandbed telt niet mee: dat is draagkracht, geen
       isolatie, en meerekenen levert een vloer op die op papier warmer is dan
       hij ooit wordt. */
    var VLOERLAGEN = [
      ['Vloerafwerking',10,'tegel'],
      ['Zandcement / anhydriet dekvloer',70,'dekvloer'],
      ['Gewapende betonvloer, constructief te berekenen',120,'beton'],
      ['EPS vloerisolatie op de betonvloer',100,'eps'],
      ['PE folie / werkvloer',1,null,{teltNiet:true}],
      ['Verdicht zandbed',200,null,{teltNiet:true}]
    ];
    var vloer = {materiaal:'BETON',materiaalLabel:'Gewapende betonvloer',profiel:'projectspecifiek',spacing:0,span:span,gk:0,qk:2,status:'FUNDERING/GROND PROJECTSPECIFIEK'};
    return {
      project: cfg.project || ('UIT-AUTO-'+Math.round(w*10)+'X'+Math.round(dp*10)), datum: new Date().toISOString().slice(0,10),
      breedte:w, diepte:dp, hoogte:h, opp:rond(w*dp,1), span:span, langs:langs,
      type:cfg.type || 'uitbouw', vrijstaand:vrijstaand, funderingType:fundType, material:cfg.material || 'classic-brick', materiaalSleutel:materiaalSleutel(cfg.material),
      facadeColor:cfg.facadeColor || 'rood', frameColor:cfg.frameColor || 'antraciet',
      kozijn:cfg.kozijnindeling || cfg.accent || 'indeling-02-dubbel', accent:cfg.accent || 'none',
      roofing:cfg.roofing || 'epdm', skylight:cfg.skylight || 'none', indeling:cfg.indeling || 'open',
      voorzieningen:cfg.voorzieningen || {}, extras:cfg.extras || {}, fundering:cfg.fundering || {},
      wand:W, vloer:vloer, dak:dak, kamerplan:cfg.kamerplanOverride ? JSON.parse(JSON.stringify(cfg.kamerplanOverride))
        : (vrijstaand ? kamerplanVrijstaand(cfg.indeling || 'studio', cfg.voorzieningen || {}, rond(w*dp,1), w, dp)
                      : kamerplan('uitbouw', {}, rond(w*dp,1))),
      bouwmethode: methode,
      /* De warmteweerstand van de drie schilonderdelen, gerekend uit de lagen
         hierboven met NGBouwnormen. Niet opgeschreven maar gerekend: verandert
         iemand een isolatiedikte, dan verandert de Rc mee en niet pas als
         iemand eraan denkt. Zonder de normenmodule blijft het leeg en zegt de
         tekening dat, in plaats van een getal te tonen dat nergens op slaat. */
      rc: rcVan(W.lagen, DAKLAGEN, VLOERLAGEN),
      /* Dakopbouw van buiten naar binnen. De balklaag telt met zijn
         houtaandeel mee als koudebrug; de ruimte ernaast is isolatie, en
         die twee bij elkaar zijn wat er werkelijk isoleert. */
      daklagen: DAKLAGEN,
      vloeropbouw: VLOERLAGEN,
      waarschuwingen:[
        'VOORONTWERP: niet gebruiken als uitvoerings- of productietekening zonder constructieve vrijgave.',
        'Bodemgesteldheid, fundering, bestaande gevel/doorbraak, opleggingen en stabiliteit altijd projectspecifiek opnemen en toetsen.',
        'Dakbelasting in voorselectie: gk '+dak.gk+' / qk '+dak.qk+' kN/m².',
        'Definitieve steenstripopbouw en bevestiging conform gekozen gecertificeerd gevelsysteem.'
      ]
    };
  }

  global.NGBouwkundig = { model:model, voordimensioneer:voordimensioneer, wand:wand, kamerplan:kamerplan,
    kamerplanVrijstaand:kamerplanVrijstaand, materiaalSleutel:materiaalSleutel, materialen:MATERIALEN };
})(typeof window !== 'undefined' ? window : globalThis);
