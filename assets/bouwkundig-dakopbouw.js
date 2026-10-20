(function (global) {
  'use strict';

  /* Bouwkundige kern voor de dakopbouwconfigurator.
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

  /* Het houtaandeel van het stijlwerk — 38 mm op 600 hart-op-hart — en de
     lambdawaarden per laag, zodat de Rc uit de opbouw volgt. Een dakopbouw
     wordt altijd in houtskeletbouw uitgevoerd: gemetseld op een bestaand dak
     kan het gewicht niet hebben. Er is hier dus met opzet geen traditionele
     tegenhanger zoals bij de aanbouw. */
  var HSB_REGEL = { hout: 38 / 600, lambdaHout: 0.13 };

  var WANDEN = {
    'classic-brick': {
      code: 'W-01', naam: 'HSB gevel met keramische steenstrips',
      buiten: 'Keramische steenstrips op gecertificeerd gevelisolatiesysteem',
      lagen: [
        ['Keramische steenstrip, waalformaat',20,'steenstrip'],
        ['Systeemlijm / gewapende mortellaag',8,'gipspleister'],
        ['EPS-HR gevelisolatie, systeemgebonden',100,'eps_hr'],
        ['Constructieve/winddichte buitenbeplating',12,'osb'],
        ['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],
        ['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_REGEL],
        ['Gipskartonplaat',12.5,'gipskarton']
      ],
      noot: 'Steenstrips zijn gevelafwerking, géén gemetseld buitenspouwblad. Definitieve bevestiging en plaatopbouw conform het gekozen gecertificeerde steenstripsysteem.'
    },
    'keralit': {
      code: 'W-02', naam: 'HSB gevel met Keralit sponningdeel',
      buiten: 'Keralit gevelpaneel op geventileerde houten achterconstructie',
      lagen: [
        ['Keralit sponningdeel gevelpaneel',17,'kunststof_paneel'],['Geventileerde spouw / verticaal regelwerk',22,null,{spouw:'sterk'}],
        ['Waterkerende dampopen plaat/folie',12,'osb'],['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_REGEL],['Gipskartonplaat',12.5,'gipskarton']
      ],
      noot: 'Minimaal 20 mm geventileerde spouw; bij horizontale panelen verticaal regelwerk h.o.h. 300 mm. Ventilatie-openingen en bevestigers volgens actueel Keralit voorschrift.'
    },
    'stuc-modern': {
      code: 'W-03', naam: 'HSB gevel met minerale/stucafwerking',
      buiten: 'Gevelpleister op buitenisolatiesysteem',
      lagen: [
        ['Sierpleister + gewapende basislaag',8,'sierpleister'],['Buitengevelisolatie EPS-HR',100,'eps_hr'],
        ['Constructieve/winddichte buitenbeplating',12,'osb'],['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_REGEL],['Gipskartonplaat',12.5,'gipskarton']
      ], noot: 'Pleister, wapening, isolatie en bevestiging als één gecertificeerd gevelsysteem toepassen.'
    },
    'modern-wood': {
      code: 'W-04', naam: 'HSB gevel met houtlook composiet',
      buiten: 'Houtlook composiet geveldeel op geventileerde achterconstructie',
      lagen: [
        ['Houtlook composiet geveldeel',20,'composiet'],['Geventileerde spouw / regelwerk',28,null,{spouw:'sterk'}],['Waterkerende dampopen laag',1,null,{teltNiet:true}],
        ['Constructieve buitenbeplating',12,'osb'],['SLS 38×140 h.o.h. 600 + PIR 140 tussen de stijlen',140,'pir',HSB_REGEL],
        ['OSB/3 constructieve beplating',15,'osb'],['Dampremmende en luchtdichte laag',1,null,{teltNiet:true}],
        ['Installatiespouw 45 mm + minerale wol',45,'minerale_wol',HSB_REGEL],['Gipskartonplaat',12.5,'gipskarton']
      ], noot: 'Merk/type composiet, brandklasse, open/gesloten gevel, ventilatie en bevestiging projectspecifiek vastleggen.'
    }
  };

  function materiaalSleutel(material) {
    var map = {
      metselwerk:'classic-brick', 'classic-brick':'classic-brick',
      stucwerk:'stuc-modern', 'stuc-modern':'stuc-modern',
      houtlook:'modern-wood', 'modern-wood':'modern-wood', composite:'modern-wood',
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

  function rcVan(gevel, dak) {
    var N = global.NGBouwnormen;
    if (!N) return null;
    return { gevel: N.rc(gevel), dak: N.rc(dak), vloer: null };
  }

  function wand(material) { return WANDEN[materiaalSleutel(material)] || WANDEN.keralit; }

  /* Parametrisch kamerplan. Alle coordinaten zijn genormaliseerd (0..1) en
     worden pas op het tekenblad naar echte millimeters vertaald. Hierdoor
     blijven deuren, wanden en ruimtestempels gekoppeld aan de gekozen maat. */
  function kamerplan(indeling, voorzieningen, opp, w, dp) {
    voorzieningen = voorzieningen || {};
    w = num(w, 6); dp = num(dp, 4);
    var aantal = indeling === '3-slaapkamers' ? 3 : (indeling === '2-slaapkamers' ? 2 : (indeling === '1-slaapkamer' ? 1 : 0));
    var bad = !!(voorzieningen['badkamer-basis'] || voorzieningen['badkamer-compleet'] || voorzieningen['luxe-badkamer']);
    var luxeBad = !!(voorzieningen['badkamer-compleet'] || voorzieningen['luxe-badkamer']);
    var plan = { wanden:[], deuren:[], ruimten:[] };

    /* WAAR DE TRAP UITKOMT
       De trap landt op de overloop en niet in een slaapkamer. Dat klinkt
       vanzelfsprekend maar stond er niet: het trapgat werd in de hoek van de
       plattegrond gezet, en bij twee slaapkamers viel dat middenin de eerste
       kamer — die daardoor te smal werd voor een bed.

       Het gat ligt dwars: 2,60 m langs de breedte en 1,00 m diep. Zo hoeft de
       overloop maar 1,10 m diep te zijn in plaats van 2,70, en houden de
       slaapkamers erachter nog diepte over voor een bed. Die 1,10 m is een
       absolute maat en geen percentage van de diepte — bij een ondiepe
       dakopbouw levert een percentage een overloop op waar de trap niet in
       past, en dat is precies het geval waarin het misgaat. */
    var TRAP_L = 2.60, TRAP_B = 1.00;
    /* De overloop moet het trapgat kunnen herbergen: 1,00 m plus de wanden
       eromheen. 1,15 m buitenwerks houdt binnenwerks net iets meer dan een
       meter over, en dat is de ondergrens. */
    var overloopM = aantal ? Math.max(1.15, dp * 0.24) : 0;
    var overloop = overloopM / dp;
    var badB = bad ? 0.28 : 0;
    var xb = 1 - badB;                          // waar de badkamer begint
    var kamerY = 1 - overloop;                  // waar de overloop begint

    if (!aantal) {
      plan.ruimten.push({ code:'R-01', naam:'OPEN RUIMTE', x: xb * 0.5, y: 0.62,
        opp: rond(opp * (bad ? xb : 1), 1),
        /* Een dakopbouw zonder binnenwanden wordt in de praktijk een
           slaapkamer — zo heten de voorbeelden in de configurator ook. De
           inrichting begint daarom met een bed en valt pas terug op een
           zithoek als dat er naast het trapgat niet meer bij kan. */
        rect:{ x0:0, y0:0, x1:xb, y1:1 }, functie:'zolderkamer' });
      /* Zonder overloop komt de trap in de hoek van de ruimte zelf uit. */
      plan.trapgat = { xNorm: 0, yNorm: 0, bM: TRAP_L, dM: TRAP_B };
    } else {
      for (var i = 1; i < aantal; i++) {
        plan.wanden.push({ x1: (i / aantal) * xb, y1: 0, x2: (i / aantal) * xb, y2: kamerY });
      }
      plan.wanden.push({ x1: 0, y1: kamerY, x2: 1, y2: kamerY });
      for (var k = 0; k < aantal; k++) {
        var vak = xb / aantal, cx = (k + 0.5) * vak;
        plan.deuren.push({ code:'D-'+String(k+1).padStart(2,'0'), x: cx, y: kamerY,
                           richting:'h', draai: k % 2 ? 'rechts' : 'links', breedte: 0.88 });
        plan.ruimten.push({ code:'R-'+String(k+1).padStart(2,'0'), naam:'SLAAPKAMER '+(k+1),
          x: cx, y: kamerY * 0.55, opp: rond(opp * vak * kamerY, 1),
          rect:{ x0: k * vak, y0: 0, x1: (k + 1) * vak, y1: kamerY }, functie:'slaapkamer' });
      }
      plan.ruimten.push({ code:'R-'+String(aantal+1).padStart(2,'0'), naam:'OVERLOOP',
        /* Het stempel rechts van het trapgat, waar de overloop vrij is. */
        x: Math.min(0.86, (TRAP_L + 1.6) / w), y: kamerY + overloop * 0.5, opp: rond(opp * overloop, 1),
        rect:{ x0:0, y0:kamerY, x1:1, y1:1 }, functie:'gang' });
      /* Het gat ligt aan de linkerkop van de overloop, tegen de gevel aan. */
      plan.trapgat = { xNorm: 0, yNorm: kamerY, bM: TRAP_L, dM: TRAP_B };
    }
    if (bad) {
      plan.wanden.push({ x1: xb, y1: 0, x2: xb, y2: aantal ? kamerY : 1 });
      plan.deuren.push({ code:'D-BAD', x: xb + badB * 0.5, y: aantal ? kamerY : 0.5,
                         richting: aantal ? 'h' : 'v', draai:'rechts', breedte: 0.83 });
      plan.ruimten.push({ code:'R-BAD', naam:'BADKAMER', x: xb + badB * 0.5,
        y: (aantal ? kamerY : 1) * 0.5, opp: rond(opp * badB * (aantal ? kamerY : 1), 1), nat:true,
        rect:{ x0: xb, y0: 0, x1: 1, y1: aantal ? kamerY : 1 }, functie:'badkamer', luxe: luxeBad });
    }
    return plan;
  }

  function model(cfg) {
    cfg = cfg || {};
    var w = Math.max(1, num(cfg.w, 6));
    var dp = Math.max(1, num(cfg.dp, 4));
    var h = Math.max(2.1, num(cfg.h, 2.6));
    var span = Math.min(w, dp);
    var langs = Math.max(w, dp);
    var groen = cfg.roofing === 'green';
    var vloer = voordimensioneer('vloer', span, {});
    var dak = voordimensioneer('dak', span, { groenDak:groen });
    var W = wand(cfg.material);
    /* Warm plat dak: alle isolatie ligt bóven het dakbeschot, de balklaag
       eronder is een gesloten luchtlaag. Die als isolatievlak meerekenen zou
       het dak een halve Rc te goed doen. */
    var DAKLAGEN = [
      ['Dakbedekking '+(cfg.roofing === 'bitumen' ? 'bitumen tweelaags' : 'EPDM'),2, cfg.roofing === 'bitumen' ? 'bitumen' : 'epdm'],
      ['PIR afschot-/dakisolatie',140,'pir'],
      ['Dampremmende laag',1,null,{teltNiet:true}],
      ['OSB/3 dakbeschot',18,'osb'],
      [(dak.materiaalLabel||'LVL')+' dakbalk '+dak.profiel+' h.o.h. '+Math.round(dak.spacing*1000), dak.h || 300, null, {spouw:'gesloten'}],
      ['Installatiestrook',45,null,{teltNiet:true}],
      ['Gipskarton plafond',12.5,'gipskarton']
    ];
    /* De vloer van een dakopbouw ligt tussen twee verwarmde ruimtes en is dus
       geen schilonderdeel: hier telt akoestiek, niet Rc. Daarom staat er geen
       warmteweerstand bij. */
    var VLOERLAGEN = [
      ['Droge vloerafwerking / dekvloer',25],['Underlayment vloerplaat',22],
      [(vloer.materiaalLabel||'LVL')+' vloerbalk '+vloer.profiel+' h.o.h. '+Math.round(vloer.spacing*1000), vloer.h || 300],
      ['Minerale wol akoestisch tussen balken',100],['Plafond-/aansluitlaag bestaande bouw',12.5]
    ];
    return {
      project: cfg.project || ('DOP-AUTO-'+Math.round(w*10)+'X'+Math.round(dp*10)), datum: new Date().toISOString().slice(0,10),
      breedte:w, diepte:dp, hoogte:h, opp:rond(w*dp,1), span:span, langs:langs,
      type:cfg.type || 'op-woning', material:cfg.material || 'metselwerk', materiaalSleutel:materiaalSleutel(cfg.material),
      facadeColor:cfg.facadeColor || 'rood', frameColor:cfg.frameColor || 'antraciet',
      kozijn:cfg.kozijnindeling || cfg.accent || 'indeling-02-dubbel', accent:cfg.accent || 'none',
      roofing:cfg.roofing || 'epdm', skylight:cfg.skylight || 'none', indeling:cfg.indeling || 'open',
      voorzieningen:cfg.voorzieningen || {}, extras:cfg.extras || {}, fundering:cfg.fundering || {},
      wand:W, vloer:vloer, dak:dak, kamerplan:cfg.kamerplanOverride ? JSON.parse(JSON.stringify(cfg.kamerplanOverride)) : kamerplan(cfg.indeling || 'open', cfg.voorzieningen || {}, rond(w*dp,1), w, dp),
      bouwmethode: 'hsb',
      rc: rcVan(W.lagen, DAKLAGEN),
      dakopbouw: DAKLAGEN,
      vloeropbouw: VLOERLAGEN,
      waarschuwingen:[
        'VOORONTWERP: niet gebruiken als uitvoerings- of productietekening zonder constructieve vrijgave.',
        'Bestaande draagconstructie, fundering, opleggingen en stabiliteit altijd projectspecifiek opnemen en toetsen.',
        'Belastingen in voorselectie: vloer gk '+vloer.gk+' / qk '+vloer.qk+' kN/m²; dak gk '+dak.gk+' / qk '+dak.qk+' kN/m².',
        'Definitieve steenstripopbouw en bevestiging conform gekozen gecertificeerd gevelsysteem.'
      ]
    };
  }

  global.NGBouwkundig = { model:model, voordimensioneer:voordimensioneer, wand:wand, kamerplan:kamerplan, materiaalSleutel:materiaalSleutel, materialen:MATERIALEN };
})(typeof window !== 'undefined' ? window : globalThis);
