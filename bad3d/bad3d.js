/* Badkamer in 3D — eigen motor, los van alles.
 *
 * Bewust een eigen bestand met een eigen kopie van three.js. De 3D-motor van
 * ZwembadStudio doet grotendeels hetzelfde werk, maar die staat in een ander
 * product met een eigen uitrol en een eigen tempo. Eén motor voor allebei
 * betekent dat een verandering aan de badkamer een zwembad kan breken, en dat
 * is precies wat hier niet mag gebeuren. Twee kopieën van een bibliotheek is
 * goedkoper dan twee producten die aan elkaar vastzitten.
 *
 * De ruimte loopt van x = 0 tot B, z = 0 tot D en y = 0 tot Hg. De achterwand
 * ligt op z = D, de voorwand op z = 0 — dezelfde afspraak als in de platte
 * tekenaar, zodat plaatsing() van tegelbeeld.js hier één op één in gaat en
 * beide weergaven altijd hetzelfde laten zien.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/* ---------- de catalogus ----------
   153 producten met echte maten, de hoogte waarop ze hangen en waar ze tegenaan
   moeten. Zolang er van een product nog geen model is, tekent de motor zijn
   eigen vorm; zodra het model er staat neemt dat het over. Zo hoeft niemand te
   wachten tot alle 153 af zijn voordat de eerste te zien is.

   Modellen staan in bad3d/modellen/<product_id>.glb. De maatvoering staat
   beschreven in bad3d/MODELLEN.md — kort: meters, Y omhoog, oorsprong midden
   onder, en het product kijkt langs +Z de ruimte in. */

/* Naast dit bestand, niet naast de pagina. De motor wordt vanaf de
   configurator geladen én vanaf de proefopstelling in deze map; met een pad dat
   aan de pagina hangt klopt er altijd één van de twee niet. */
const HIER = new URL('.', import.meta.url).href;
const MODELPAD = HIER + 'modellen/';
let catalogus = null, gltfLader = null;
const modelCache = new Map();

function laadCatalogus() {
  if (catalogus) return Promise.resolve(catalogus);
  return fetch(HIER + 'catalogus.json')
    .then(r => r.ok ? r.json() : null)
    .then(j => { catalogus = j ? j.producten : {}; return catalogus; })
    .catch(() => { catalogus = {}; return catalogus; });
}

function lader() {
  if (gltfLader) return gltfLader;
  gltfLader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(HIER + 'vendor/addons/libs/draco/');
  gltfLader.setDRACOLoader(draco);
  return gltfLader;
}

/** Eén product ophalen. Ontbreekt het bestand, dan is dat geen fout maar een
    model dat nog gemaakt moet worden — de aanroeper valt terug op zijn vorm. */
function laadModel(pid) {
  if (modelCache.has(pid)) return modelCache.get(pid);
  const p = new Promise(klaar => {
    lader().load(MODELPAD + pid + '.glb',
      g => klaar(g.scene),
      undefined,
      () => klaar(null));
  }).then(scene => {
    if (!scene) return null;
    /* De modellen bevatten een onzichtbare hulpdoos die de opgegeven maat
       aangeeft. Die is precies wat we willen weten — een open lade of een
       uitstekende kraan hoort er soms wél en soms níet bij, en de maker weet
       dat beter dan een meting achteraf. Dus: eerst uitlezen, dan weghalen.
       Laten staan zou hem laten meetellen in het slepen en in de
       doorzichtigheidssortering van het glas ernaast. */
    const c = (catalogus && catalogus[pid]) || {};
    const isSpiegel = /spiegel/i.test(c.sub || '');
    const isKom = /wastafel|opzetkom|fontein/i.test(c.sub || '');
    const hulp = [];
    scene.traverse(o => {
      if (!o.isMesh) return;
      const naam = (o.material && o.material.name) || '';
      if (/bbox|proxy/i.test(naam)) { hulp.push(o); return; }
      /* De modellen gebruiken dark_inner — bijna zwart — voor alles wat een
         donkere holte hoort te zijn. Bij een afvoerputje klopt dat. Maar bij
         een spiegel is het het spiegelglas zelf, en bij een wastafel de hele
         kom, en dan hangt er een zwarte schijf in beeld waar wit keramiek
         hoort. Dat je een spiegeling niet in een los bestand kunt bakken is
         begrijpelijk; een zwarte wasbak is dat niet.

         Het onderscheid is de maat, en dan een absolute: een afvoerputje is
         zeven centimeter, een wasbak vijfentwintig of meer. Ik had dit eerst
         als verhouding tot de productbreedte gedaan, en toen bleef precies de
         dubbele wastafel zwart — twee kommen van veertig in een meubel van
         honderdtwintig vielen net onder de drempel. Een afvoer wordt niet
         groter omdat het meubel breder is. */
      if (/dark_inner/i.test(naam) && (isSpiegel || isKom)) {
        const b = new THREE.Box3().setFromObject(o);
        if (b.max.x - b.min.x > .18) o.material = isSpiegel ? M.spiegel : M.keramiek;
      }
      o.castShadow = true;
      o.receiveShadow = true;
    });
    if (hulp.length) {
      const b = new THREE.Box3();
      hulp.forEach(m => b.expandByObject(m));
      scene.userData.doos = b;
      hulp.forEach(m => m.parent && m.parent.remove(m));
    }
    return scene;
  });
  modelCache.set(pid, p);
  return p;
}

/** Een kloon van het model, op zijn plek gezet volgens de catalogusregels.
    De oorsprong staat midden onder; tegen een wand schuift hij zijn halve
    diepte de ruimte in, want daar staat hij met zijn rug tegenaan. */
/* Waar de diepte heen moet. Tegen een vlak aan: het model schuift zijn halve
   diepte de ruimte in, zodat zijn rug de tegel raakt. Erin verzonken: precies
   andersom — een inbouwreservoir hoort in de voorzetwand te verdwijnen en niet
   ervoor te hangen, en een douchegoot ligt in de vloer. */
const NAAR_BINNEN = { inwall: 1, wall_recess: 1 };
/* In de vloer verzonken is een ander gebaar dan in de wand verzonken. Een
   douchegoot ligt niet achter de tegel maar eronder: hij zakt zijn eigen hoogte
   omlaag zodat het rooster gelijk met de vloer komt, en zijn diepte gaat gewoon
   de ruimte in. Dat door NAAR_BINNEN laten afhandelen zette de goot rechtop in
   de achterwand. */
const IN_DE_VLOER = { floor_recess: 1 };

/* Een gekozen kleur op een model leggen. De catalogus kent kleurvarianten,
   maar niet één bestand per kleur — een spoelplaat in mat zwart is hetzelfde
   model als die in wit. Het materiaal wordt eerst gekloond: `scene.clone()`
   deelt materialen met de kopie in het geheugen, en zonder die kloon kleurt
   één zwarte spoelplaat ook alle kranen die daarna langskomen. */
function tint(obj, kleur) {
  const c = new THREE.Color(kleur);
  obj.traverse(o => {
    if (!o.isMesh || !o.material) return;
    o.material = Array.isArray(o.material)
      ? o.material.map(m => m.clone()) : o.material.clone();
    [].concat(o.material).forEach(m => { if (m.color) m.color.copy(c); });
  });
}

function modelGroep(pid, scene, kleur, maat) {
  const c = (catalogus && catalogus[pid]) || {};
  const g = new THREE.Group();
  const m = scene.clone(true);
  if (kleur) tint(m, kleur);
  /* Een deur en een raam worden op maat gemaakt; de catalogus geeft er één
     referentiemaat voor. Wie 900 invult krijgt anders een deur van 830 in een
     gat van 900, met een kier van zeven centimeter. De oorsprong van een model
     ligt midden onder, dus schalen om dat punt verbreedt naar twee kanten en
     groeit omhoog vanaf de vloer — precies wat je wilt. */
  if (maat) {
    const sx = (maat.b && c.b) ? maat.b / c.b : 1;
    const sy = (maat.h && c.h) ? maat.h / c.h : 1;
    // de diepte alleen als hij gevraagd wordt: een deur op maat wordt breder en
    // hoger maar niet dikker, een voorzetwand wél
    const sz = (maat.d && c.d) ? maat.d / c.d : 1;
    m.scale.set(sx, sy, sz);
  }
  const doos3 = scene.userData.doos
    ? scene.userData.doos.clone()
    : new THREE.Box3().setFromObject(m);
  /* Wie een maat meegeeft, krijgt die maat. De verschuiving moet met de
     geschaalde diepte rekenen en niet met de catalogusdiepte: een voorzetwand
     van 150 die naar 100 wordt geschaald schoof zijn halve catalogusdiepte op
     en stond dan vijfentwintig millimeter voor de nis die erin hoort te zitten.
     Zichtbaar als een randje wand over de opening heen. */
  const diep = (maat && maat.d) || c.d || (doos3.max.z - doos3.min.z);
  const hoog = (maat && maat.h) || c.h;
  const z = NAAR_BINNEN[c.op] ? -diep / 2 : diep / 2;
  const zakt = IN_DE_VLOER[c.op] ? (hoog || 0) : 0;
  m.position.set(0, (c.y || 0) - zakt, z);
  g.add(m);
  g.userData.pid = pid;
  g.userData.maat = { b: (maat && maat.b) || c.b || (doos3.max.x - doos3.min.x),
                      h: hoog, d: diep };
  return g;
}

/* ---------- wandkader ----------
   Een product wordt één keer beschreven — breed, hoog, diep, met de diepte de
   ruimte in — en hangt daarna aan elke wand. De groep krijgt zijn oorsprong op
   de wand op vloerhoogte, en een draai zodat de eigen +z de ruimte in wijst. */

const WANDEN = ['achter', 'links', 'rechts', 'voor'];

/** Waar ligt (langs, diep) op deze wand, in wereldcoördinaten. */
function wandPunt(K, wand, l, d) {
  const { B, D } = K;
  if (wand === 'links')  return [d, D - l];
  if (wand === 'rechts') return [B - d, D - l];
  if (wand === 'voor')   return [B - l, d];
  return [l, D - d];
}

/** De draai die de eigen +z van een product de ruimte in laat wijzen. */
function wandDraai(wand) {
  if (wand === 'links')  return Math.PI / 2;
  if (wand === 'rechts') return -Math.PI / 2;
  if (wand === 'voor')   return 0;
  return Math.PI;
}

/** De lengte van een wand: zijwanden zijn zo diep als de ruimte lang is. */
function wandLengte(K, wand) {
  return (wand === 'links' || wand === 'rechts') ? K.D : K.B;
}

/* ---------- L-vormige ruimte ----------
   Een uitsparing is geen tweede meetkunde maar één hap uit één hoek van de
   rechthoek. Welke twee wanden die hoek raakt, en welk stuk van elke wand
   erdoor verdwijnt, volgt rechtstreeks uit wandPunt() hierboven: bij l=0 zit
   de achterwand op de achterlinkshoek, bij l=D zit de linkerwand ook op die
   hoek, enzovoort. Dezelfde toewijzing staat, los van elkaar nagerekend, ook
   in tegelbeeld.js (de plaatsing) en tekening.js (de maatvoering) — alle drie
   moeten dezelfde hoek dezelfde plek laten betekenen, anders staat de wastafel
   op de tekening ergens anders dan in 3D. */
function snedeHoeken(K) {
  const s = K.snede; if (!s) return null;
  const { B, D } = K, { hoek, cb, cd } = s;
  const MAP = {
    achterlinks:  { a: 'achter', ar: [0, cb], b: 'links', br: [0, cd] },
    achterrechts: { a: 'achter', ar: [B - cb, B], b: 'rechts', br: [0, cd] },
    voorrechts:   { a: 'voor', ar: [0, cb], b: 'rechts', br: [D - cd, D] },
    voorlinks:    { a: 'voor', ar: [B - cb, B], b: 'links', br: [D - cd, D] }
  };
  return MAP[hoek] || null;
}

/** Het stuk van deze wand dat door de hap verdwijnt, of null. */
function snedeOpWand(K, wand) {
  const m = snedeHoeken(K); if (!m) return null;
  if (wand === m.a) return m.ar;
  if (wand === m.b) return m.br;
  return null;
}

/** De vloer als één rechthoek, of als twee wanneer er een hap uit een hoek
    is — een L is altijd in twee axis-aligned rechthoeken te knippen, en dat
    is eenvoudiger en robuuster dan een algemene veelhoek trianguleren. */
function vloerVlakken(K) {
  const { B, D, snede } = K;
  if (!snede) return [{ x0: 0, x1: B, z0: 0, z1: D }];
  const { hoek, cb, cd } = snede;
  const laagX = hoek === 'achterlinks' || hoek === 'voorlinks';
  const hoogZ = hoek === 'achterlinks' || hoek === 'achterrechts';
  const xSplit = laagX ? cb : B - cb;
  const vol = laagX ? { x0: xSplit, x1: B, z0: 0, z1: D }
                     : { x0: 0, x1: xSplit, z0: 0, z1: D };
  const hap = laagX
    ? { x0: 0, x1: xSplit, z0: hoogZ ? 0 : cd, z1: hoogZ ? D - cd : D }
    : { x0: xSplit, x1: B, z0: hoogZ ? 0 : cd, z1: hoogZ ? D - cd : D };
  return [vol, hap];
}

/** De twee korte wandjes die de hap zelf afsluiten — geen van de vier
    hoofdwanden, dus geen deur of raam erin en geen plek voor sanitair; alleen
    een getextureerd vlak dat de ruimte optisch afsluit. */
function notchWanden(K) {
  const m = snedeHoeken(K); if (!m) return [];
  const { B, D, snede } = K, { hoek, cb, cd } = snede;
  const laagX = hoek === 'achterlinks' || hoek === 'voorlinks';
  const hoogZ = hoek === 'achterlinks' || hoek === 'achterrechts';
  const xSplit = laagX ? cb : B - cb;
  const zSplit = hoogZ ? D - cd : cd;
  const zVan = hoogZ ? D - cd : 0, zTot = hoogZ ? D : cd;
  const xVan = laagX ? 0 : B - cb, xTot = laagX ? cb : B;
  return [
    // sluit de x-kant van de hap af: staat op x=xSplit, loopt in z
    { x: xSplit, z: (zVan + zTot) / 2, lengte: cd,
      draai: laagX ? Math.PI / 2 : -Math.PI / 2, langsX: false },
    // sluit de z-kant van de hap af: staat op z=zSplit, loopt in x
    { x: (xVan + xTot) / 2, z: zSplit, lengte: cb,
      draai: hoogZ ? Math.PI : 0, langsX: true }
  ];
}

/** Naar binnen wijzende normaal, om te bepalen of een wand in de weg staat. */
function wandNormaal(wand) {
  if (wand === 'links')  return new THREE.Vector3(1, 0, 0);
  if (wand === 'rechts') return new THREE.Vector3(-1, 0, 0);
  if (wand === 'voor')   return new THREE.Vector3(0, 0, 1);
  return new THREE.Vector3(0, 0, -1);
}

/* ---------- materialen ----------
   Sanitair is keramiek: hard, glad, met een glazuurlaag erover. Dat is precies
   wat clearcoat beschrijft — een tweede, spiegelende laag boven een matter
   grondmateriaal. Zonder die laag ziet een wastafel eruit als geverfd gips. */

const M = {};

function bouwMaterialen() {
  M.keramiek = new THREE.MeshPhysicalMaterial({
    color: 0xf7f7f5, roughness: .28, metalness: 0,
    clearcoat: 1, clearcoatRoughness: .04
  });
  M.keramiekMat = new THREE.MeshPhysicalMaterial({
    color: 0xf2f2ef, roughness: .62, metalness: 0, clearcoat: .35, clearcoatRoughness: .35
  });
  M.chroom = new THREE.MeshStandardMaterial({
    color: 0xdfe3e6, roughness: .07, metalness: 1, envMapIntensity: 1.5
  });
  M.matzwart = new THREE.MeshStandardMaterial({
    color: 0x1d1f21, roughness: .45, metalness: .55
  });
  M.messing = new THREE.MeshStandardMaterial({
    color: 0xb08d57, roughness: .28, metalness: 1, envMapIntensity: 1.3
  });
  M.rvs = new THREE.MeshStandardMaterial({
    color: 0xc9ccce, roughness: .26, metalness: 1, envMapIntensity: 1.2
  });
  // Douchewand: helder veiligheidsglas van 8 mm. transmission in plaats van
  // opacity, want glas breekt en kleurt het licht dat er doorheen gaat — met
  // alleen doorzichtigheid krijg je een grijze folie.
  M.glas = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: .02, metalness: 0, transmission: .96,
    thickness: .008, ior: 1.52, transparent: true, opacity: .28,
    side: THREE.DoubleSide
  });
  M.spiegel = new THREE.MeshStandardMaterial({
    color: 0xeef2f4, roughness: .02, metalness: 1, envMapIntensity: 2
  });
  M.stuc = new THREE.MeshStandardMaterial({ color: 0xe9e5de, roughness: .95, metalness: 0 });
  M.plafond = new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: .96, metalness: 0 });
}

const KRAANKLEUR = {
  chroom: () => M.chroom, matzwart: () => M.matzwart,
  messing: () => M.messing, rvs: () => M.rvs, wit: () => M.keramiek
};
function kraanMat(sel) { return (KRAANKLEUR[sel] || KRAANKLEUR.chroom)(); }

const HOUT = {
  eiken:   0xb08a5e, noten: 0x6b4a32, wit: 0xf2f1ee,
  antraciet: 0x35383b, mat: 0xdedbd5
};
function meubelMat(kleur) {
  return new THREE.MeshStandardMaterial({
    color: HOUT[kleur] != null ? HOUT[kleur] : HOUT.eiken,
    roughness: .55, metalness: 0
  });
}

/* ---------- bouwstenen ---------- */

function doos(b, h, d, mat) {
  const g = new THREE.Mesh(new THREE.BoxGeometry(b, h, d), mat);
  g.castShadow = true; g.receiveShadow = true;
  return g;
}
function cil(r, h, mat, zij = 20) {
  const g = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, zij), mat);
  g.castShadow = true; g.receiveShadow = true;
  return g;
}
/** Een buis van punt naar punt — kranen zijn niets anders dan buizen. */
function buis(van, naar, r, mat) {
  const a = new THREE.Vector3(...van), b = new THREE.Vector3(...naar);
  const len = a.distanceTo(b);
  const m = cil(r, len, mat, 16);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0),
                                  b.clone().sub(a).normalize());
  return m;
}

/* ---------- de ruimte ----------
   Vloer, vier wanden en een plafond, allemaal met de tegel uit de configurator
   als textuur. Dezelfde tekenaar als de platte weergave, zodat de tegel in 2D
   en 3D niet twee verschillende tegels kunnen worden. */

function tegelTextuur(mat, bm, hm) {
  if (!mat || !window.NGTegelBeeld || !window.NGTegelBeeld.textuur) return null;
  const cv = document.createElement('canvas');
  window.NGTegelBeeld.textuur(cv, mat, bm, hm, 240);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function vlakMateriaal(tegel, bm, hm, val) {
  const t = tegelTextuur(tegel, bm, hm);
  if (!t) return val === 'plafond' ? M.plafond : M.stuc;
  const glans = (tegel.af && tegel.af.glans) || .08;
  /* Een betegelde vloer glimt. Dat is geen opsmuk: de weerspiegeling van de
     wanden en het sanitair erin is precies wat een badkamer van een kale doos
     onderscheidt, en het was het enige oppervlak in beeld dat helemaal niets
     terugkaatste. De wand blijft matter — een wandtegel is dat ook. */
  const ruw = val === 'vloer' ? Math.max(.05, .34 - glans) : Math.max(.10, .76 - glans * 3);
  return new THREE.MeshStandardMaterial({
    map: t, roughness: ruw, metalness: 0,
    envMapIntensity: val === 'vloer' ? .55 : .35
  });
}

/* ---------- producten ----------
   Ieder product wordt gebouwd rond zijn eigen oorsprong: x naar de zijkant met
   het midden op nul, y omhoog vanaf de vloer, z de ruimte in vanaf de wand.
   Wat er daarna mee gebeurt — aan welke wand, waar langs die wand — regelt
   zetAanWand(). Zo hoeft geen enkel product te weten waar het hangt. */

/* De kraan hangt hier bewust niet meer in dezelfde groep als het meubel. Drie
   van de vijf kraansoorten (BTH-0124, BTH-0126, BTH-0127) hebben nog geen
   .glb — "alles of niets" gold voor de hele wastafel-plek, dus zodra het
   meubel en de kom hun eigen model kregen, verdween de kraan mee met de
   getekende vorm terwijl er niets voor in de plaats kwam: een wastafel zonder
   kraan. Zie ook de opmerking bij doucheVormen() hieronder, die dit probleem
   het eerst had. */
function wastafel(pl, inr) {
  const g = new THREE.Group();
  const w = pl.w || .80;
  const dubbel = inr.wastafelsoort === 'dubbel';
  const kastH = .50, kastD = .46, zweef = .35;
  const mm = meubelMat(inr.meubelkleur);

  if (inr.wastafelsoort !== 'wand') {
    const kast = doos(w, kastH, kastD, mm);
    kast.position.set(0, zweef + kastH / 2, kastD / 2);
    g.add(kast);
    // greeploos: een schaduwvoeg onder het front in plaats van een handgreep
    const voeg = doos(w - .02, .012, .004, M.matzwart);
    voeg.position.set(0, zweef + .03, kastD + .002);
    g.add(voeg);
    if (dubbel) {
      const naad = doos(.006, kastH - .02, .004, M.matzwart);
      naad.position.set(0, zweef + kastH / 2, kastD + .002);
      g.add(naad);
    }
  }

  // Het blad. Keramiek of een aparte bladplaat met een kom erop — dat verschil
  // zie je vooral aan de dikte en aan of de kom boven het blad uitkomt.
  const bladH = inr.wastafelsoort === 'wand' ? .12 : .04;
  const bladY = inr.wastafelsoort === 'wand' ? .82 : zweef + kastH + bladH / 2;
  const blad = doos(w, bladH, kastD, inr.bladkleur
    ? new THREE.MeshStandardMaterial({ color: new THREE.Color(inr.bladkleur),
                                       roughness: .4, metalness: 0 })
    : M.keramiek);
  blad.position.set(0, bladY, kastD / 2);
  g.add(blad);

  const komY = bladY + bladH / 2;
  const komX = dubbel ? [-w / 4, w / 4] : [0];
  const komR = Math.min(.19, (dubbel ? w / 4 : w / 2) - .06);
  komX.forEach(cx => {
    if (inr.komsoort === 'opbouw') {
      const kom = cil(komR, .12, M.keramiek, 32);
      kom.position.set(cx, komY + .06, kastD * .52);
      g.add(kom);
    } else {
      // verzonken kom: een ondiepe schaal in het blad
      const kom = new THREE.Mesh(
        new THREE.SphereGeometry(komR, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        M.keramiek);
      kom.scale.y = .45;
      kom.position.set(cx, komY - .002, kastD * .52);
      kom.receiveShadow = true;
      g.add(kom);
    }
  });

  // spiegel erboven
  const spH = inr.spiegelsoort === 'kast' ? .70 : .80;
  const spD = inr.spiegelsoort === 'kast' ? .15 : .02;
  /* De spiegel weerkaatst de omgevingsmap, niet de kamer zelf. Dat is eerlijk
     gezegd nog geen spiegel: je ziet een geloofwaardige lichtval maar niet je
     eigen badkamer erin. Een echte spiegeling vraagt een tweede camera achter
     het spiegelvlak die elk beeld meerendert; een opname in een kubusmap heb ik
     geprobeerd en die bleef zwart. Liever dit dan een zwart vlak boven de
     wastafel — maar het staat op de lijst. */
  const sp = doos(Math.min(w, 1.20), spH, spD, M.spiegel);
  sp.castShadow = false;
  sp.userData.spiegel = true;
  sp.position.set(0, 1.42 + spH / 2 - .30, spD / 2);
  if (inr.spiegelsoort === 'kast') {
    const romp = doos(Math.min(w, 1.20) + .004, spH + .004, spD, mm);
    romp.position.copy(sp.position); romp.position.z -= .004;
    g.add(romp);
  }
  g.add(sp);
  return g;
}

/* Dezelfde maten als in wastafel() hierboven — kastD, bladH/bladY, komX — want
   de kraan moet op precies dezelfde plek boven precies dezelfde kom staan, ook
   al is het nu een eigen plek met een eigen alles-of-niets. */
function wastafelkraanVorm(pl, inr) {
  const g = new THREE.Group();
  const w = pl.w || .80;
  const dubbel = inr.wastafelsoort === 'dubbel';
  const kastD = .46, zweef = .35, kastH = .50;
  const bladH = inr.wastafelsoort === 'wand' ? .12 : .04;
  const bladY = inr.wastafelsoort === 'wand' ? .82 : zweef + kastH + bladH / 2;
  const komY = bladY + bladH / 2;
  const komX = dubbel ? [-w / 4, w / 4] : [0];
  const km = kraanMat(inr.kraankleur);
  const kh = inr.wastafelkraan === 'verhoogd' ? .30 : .19;
  const kz = kastD * .16;
  komX.forEach(cx => {
    g.add(cil(.024, kh, km, 16).translateX(cx).translateY(komY + kh / 2).translateZ(kz));
    g.add(buis([cx, komY + kh, kz], [cx, komY + kh, kz + .11], .014, km));
    const uit = cil(.012, .03, km, 12);
    uit.position.set(cx, komY + kh - .015, kz + .11);
    g.add(uit);
  });
  return g;
}

function hangtoilet(pl, inr) {
  const g = new THREE.Group();
  const staand = inr.toiletsoort === 'staand';
  const potB = .37, potH = .40, potD = .54;

  if (!staand) {
    // De voorzetwand is geen decorstuk: hij is 20 cm diep en daar loopt het
    // inbouwreservoir in. Een wandcloset dat aan een kale wand hangt bestaat
    // niet, dus hij hoort er altijd bij.
    const vw = pl.breed || .78;
    const vh = inr.reservoir === 'plafond' ? 2.30 : 1.10;
    const wand = doos(vw, vh, .20, M.stuc);
    wand.position.set(0, vh / 2, .10);
    g.add(wand);
    // bedieningsplaat, in de kleur die gekozen is — er zijn vijf kleuren en
    // ze kostten alle vijf hetzelfde witte plaatje
    const plaat = doos(.24, .16, .012, new THREE.MeshStandardMaterial({
      color: new THREE.Color(inr.paneelkleur || '#F4F3F0'),
      roughness: .35, metalness: .1
    }));
    plaat.position.set(0, .98, .206);
    g.add(plaat);
  }

  const potY = staand ? 0 : .30;
  const pot = doos(potB, potH * (staand ? 1.05 : 1), potD, M.keramiek);
  pot.position.set(0, potY + potH / 2, .20 + potD / 2 - (staand ? .06 : 0));
  g.add(pot);
  // de bril: iets ruimer dan de pot en met een zichtbare naad ertussen
  const bril = doos(potB + .02, .04, potD * .82, M.keramiekMat);
  bril.position.set(0, potY + potH + .02, .20 + potD * .48);
  g.add(bril);
  if (staand) {
    const res = doos(.38, .38, .20, M.keramiek);
    res.position.set(0, .42 + .19, .10);
    g.add(res);
  }
  return g;
}

/* De douche in vier losse stukken: bak, afvoer, glaswand en doucheset.
   Vroeger was dit één groep, en dat werkte prima zolang alles getekend werd.
   Zodra er echte modellen bijkomen wil je ze stuk voor stuk kunnen inruilen —
   een glaswand uit de catalogus met daaronder nog de getekende goot. Eén groep
   betekent alles of niets, en dan verdwijnt met de eerste glaswand ook de
   afvoer en de kraan uit beeld. */
function doucheVormen(pl, K, inr) {
  const uit = { bak: null, afvoer: null, wand: new THREE.Group(),
                systeem: new THREE.Group() };
  const g = uit.wand;                   // in wereldcoördinaten, geen wandkader:
  const { D } = K;                      // een douche staat in een hoek, niet op een wand
  const links = pl.kant !== 'rechts';
  const x0 = links ? 0 : K.B - pl.w, x1 = links ? pl.w : K.B;
  const z0 = D - pl.d;

  // De vloer van de douche ligt op afschot of er ligt een bak; in beide
  // gevallen zit er een goot of een put in. Zonder afvoer leest de hoek als
  // een willekeurig stuk vloer met glas ervoor.
  if (inr.douchevloer === 'bak') {
    const bak = doos(pl.w - .02, .045, pl.d - .02, M.keramiekMat);
    bak.position.set((x0 + x1) / 2, .0225, z0 + pl.d / 2);
    uit.bak = new THREE.Group(); uit.bak.add(bak);
  }
  const goot = inr.afvoer === 'punt'
    ? cil(.055, .008, M.rvs, 24)
    : doos(pl.w - .30, .008, .07, M.rvs);
  goot.position.set((x0 + x1) / 2, .052,
                    inr.afvoer === 'midden' ? z0 + pl.d / 2 : D - .12);
  uit.afvoer = new THREE.Group(); uit.afvoer.add(goot);

  /* De open zijde. Glas is het uitgangspunt, maar het kan ook een gemetseld
     muurtje zijn — half hoog met glas erop, of door tot het plafond. Dat is
     dezelfde plek en hetzelfde gebaar, alleen een ander materiaal en een andere
     dikte, dus het hoort hier en niet in een eigen vorm ergens anders. */
  const wandSoort = (inr.douchewandsoort || 'glas');
  const xw = links ? x1 : x0;
  if (wandSoort === 'glas') {
    const gh = 2.00, dik = .008;
    const glas = doos(dik, gh, pl.d - .04, M.glas);
    glas.position.set(xw, gh / 2, z0 + pl.d / 2 + .02);
    glas.castShadow = false;
    g.add(glas);
    // stabilisatiestang naar de achterwand — zonder die stang valt het glas om,
    // en dat ziet een installateur meteen
    const stang = buis([xw, gh - .12, z0 + .06], [xw, gh - .12, D - .01], .008, M.rvs);
    g.add(stang);
    // profiel op de vloer
    const prof = doos(.03, .012, pl.d - .04, M.rvs);
    prof.position.set(xw, .006, z0 + pl.d / 2 + .02);
    g.add(prof);
  } else {
    /* Het muurtje staat met zijn dikte náást de douche en niet erin: wie de
       honderd millimeter van de doucheruimte afhaalt, levert een douche van
       negentig terwijl er honderd besteld is. Het hart schuift dus een halve
       muurdikte de kamer in. */
    const dikte = .10;
    const mh = wandSoort === 'halfmuur' ? 1.20 : (K.Hg || 2.6);
    const mx2 = xw + (links ? 1 : -1) * dikte / 2;
    const muur = doos(dikte, mh, pl.d, M.stuc);
    muur.position.set(mx2, mh / 2, z0 + pl.d / 2);
    muur.castShadow = true;
    g.add(muur);
    /* Een halfhoog muurtje krijgt glas erop tot twee meter — anders staat er
       een borstwering in de badkamer en spat het water er overheen. */
    if (wandSoort === 'halfmuur') {
      const glas2 = doos(.008, 2.00 - mh, pl.d - .04, M.glas);
      glas2.position.set(mx2, mh + (2.00 - mh) / 2, z0 + pl.d / 2);
      glas2.castShadow = false;
      g.add(glas2);
    }
  }

  // doucheset tegen de achterwand
  const s = uit.systeem;
  const km = kraanMat(inr.kraankleur);
  const mx = links ? pl.w * .45 : K.B - pl.w * .45;
  const staaf = cil(.014, .95, km, 12);
  staaf.position.set(mx, 1.55, D - .03);
  s.add(staaf);
  const therm = doos(.20, .09, .07, km);
  therm.position.set(mx, 1.08, D - .05);
  s.add(therm);
  /* Bij "Plafond-inbouw stortdouche" komt de kop uit het plafond in plaats
     van uit de wandarm hierboven — die kop staat sinds BTH-0154 op zijn eigen
     plek (plafondDoucheOpPlek hieronder), los van deze wandgroep. Een plafond-
     item hangt aan het plafond en niet aan deze wand, en heeft daardoor een
     eigen coördinatenstelsel nodig dat dit wandkader niet biedt. */
  if (inr.douchekraan !== 'plafond' && (inr.regendouche || inr.douchesysteem === 'regen')) {
    s.add(buis([mx, 2.03, D - .03], [mx, 2.03, D - .28], .014, km));
    const kop = cil(.13, .02, km, 28);
    kop.position.set(mx, 2.02, D - .28);
    s.add(kop);
  }
  /* De handdouche hoort bij de basisset en staat er dus altijd. Het vinkje in
     de configurator gaat over een glijstang, en dat is iets anders dan de vraag
     of er een handdouche is. */
  const hand = cil(.02, .16, km, 12);
  hand.position.set(mx + .10, 1.30, D - .05);
  hand.rotation.z = .25;
  s.add(hand);
  if (inr.handdouche) {
    // glijstang: een verticale stang naast de thermostaat
    s.add(buis([mx + .10, 1.05, D - .045], [mx + .10, 1.75, D - .045], .009, km));
  }
  return uit;
}

/* Ook het bad komt in stukken terug: de kuip en de kraan. Een vrijstaande
   vloerkraan is in de catalogus een eigen artikel dat naast het bad staat, geen
   onderdeel ervan — en wie een bad uit de catalogus kiest wil niet dat de kraan
   die hij apart koos daarmee uit beeld verdwijnt. */
function badVormen(pl, K, inr) {
  const g = new THREE.Group();
  const kr = new THREE.Group();
  const { rx, rz } = pl;
  const bh = .55, rand = .04;

  /* `inr.bad` is de kant waar het bad staat, niet de uitvoering — daarop
     vergelijken was altijd onwaar en elk inbouwbad kwam als vrijstaand bad in
     beeld. De uitvoering komt uit de plaatsing, die hem van `inr.ombouw` heeft. */
  if (pl.ombouw) {
    const omb = doos(rx * 2, bh, rz * 2, M.keramiekMat);
    omb.position.set(pl.x, bh / 2, pl.z);
    g.add(omb);
  } else {
    // vrijstaand: een gesloten schaal met een echte rand. Een dichte doos ziet
    // eruit als een bank; het gat is het bad.
    const buiten = new THREE.Mesh(
      new THREE.CylinderGeometry(1, .86, bh, 40, 1, false), M.keramiek);
    buiten.scale.set(rx, 1, rz);
    buiten.position.set(pl.x, bh / 2, pl.z);
    buiten.castShadow = true; buiten.receiveShadow = true;
    g.add(buiten);
  }
  // de kuip: een uitholling met een rand van 4 cm eromheen
  const kuip = new THREE.Mesh(
    new THREE.CylinderGeometry(1, .78, bh - .10, 40, 1, true), M.keramiek);
  kuip.material = M.keramiek;
  kuip.scale.set(Math.max(.02, rx - rand), 1, Math.max(.02, rz - rand));
  kuip.position.set(pl.x, bh / 2 + .05, pl.z);
  kuip.geometry.computeVertexNormals();
  const binnen = kuip.clone();
  binnen.material = new THREE.MeshPhysicalMaterial({
    color: 0xf7f7f5, roughness: .22, metalness: 0, side: THREE.BackSide,
    clearcoat: 1, clearcoatRoughness: .05
  });
  g.add(binnen);
  const bodem = new THREE.Mesh(
    new THREE.CircleGeometry(1, 40),
    new THREE.MeshPhysicalMaterial({ color: 0xf4f4f2, roughness: .25, clearcoat: 1 }));
  bodem.rotation.x = -Math.PI / 2;
  bodem.scale.set(Math.max(.02, (rx - rand) * .78), Math.max(.02, (rz - rand) * .78), 1);
  bodem.position.set(pl.x, .10, pl.z);
  bodem.receiveShadow = true;
  g.add(bodem);
  // afvoer en overloop
  const put = cil(.028, .006, M.rvs, 20);
  put.position.set(pl.x, .103, pl.z);
  g.add(put);

  // De kraan hoort aan het kopse eind, niet halverwege de looproute, en de
  // uitloop moet over de rand heen reiken — anders loopt het bad naast zichzelf.
  const km = kraanMat(inr.kraankleur);
  const kz = pl.z + rz - .12;
  if (inr.badkraan === 'vloer') {
    kr.add(cil(.026, 1.00, km, 16).translateX(pl.x).translateY(.50).translateZ(pl.z + rz + .22));
    kr.add(buis([pl.x, 1.00, pl.z + rz + .22], [pl.x, 1.00, pl.z + rz - .10], .018, km));
    const uit = cil(.014, .04, km, 12);
    uit.position.set(pl.x, .98, pl.z + rz - .10);
    kr.add(uit);
  } else {
    kr.add(cil(.022, .16, km, 16).translateX(pl.x).translateY(bh + .08).translateZ(kz));
    kr.add(buis([pl.x, bh + .16, kz], [pl.x, bh + .16, kz - .20], .015, km));
    const uit = cil(.012, .035, km, 12);
    uit.position.set(pl.x, bh + .145, kz - .20);
    kr.add(uit);
  }
  return { kuip: g, kraan: kr };
}

function radiator(K, inr) {
  const g = new THREE.Group();
  const b = .60, h = 1.20;
  const mat = inr.radiatorkleur === 'zwart' ? M.matzwart : M.keramiekMat;
  // Op de voorwand, want daar is bijna altijd plek en daar loopt de leiding.
  for (let i = 0; i < 14; i++) {
    const buisje = cil(.012, b, mat, 10);
    buisje.rotation.z = Math.PI / 2;
    buisje.position.set(K.B - .45, .35 + i * (h / 14), .06);
    g.add(buisje);
  }
  [-1, 1].forEach(s => {
    const stijl = doos(.03, h, .035, mat);
    stijl.position.set(K.B - .45 + s * b / 2, .35 + h / 2, .06);
    g.add(stijl);
  });
  return g;
}

/* ---------- de scene ---------- */

let renderer, scene, camera, controls, container, composer, gtao;
let plafondLicht = null, vulLicht = null;
/* 46 graden verticaal is ongeveer een 28 mm-objectief op kleinbeeld:
   ruim genoeg voor een kleine badkamer, en net niet zo wijd dat de
   ruimte groter lijkt dan hij is. */
const LENS = 46;
let laatstePlaatsing = {};
let kamerGroep, spullenGroep, wandMesh = {}, plafondMesh = null;
let staat = null, K = { B: 2.4, D: 3.0, Hg: 2.6, snede: null };
/* `plek` is elke plaats waar een catalogusmodel terecht kan; `sleepbaar` is de
   kleinere verzameling die je ook met de muis mag verplaatsen. Een douchegoot
   moet een model kunnen krijgen zonder dat iemand hem los kan trekken. */
let plek = {}, sleepbaar = {}, sleepObj = null, sleepVlak = null;
let bezig = false, aanvraag = false;

export const Bad3D = {
  init, update, resetView, overzicht, inDeRuimte, boven, screenshot, stand2,
  /* Waar de camera staat en waar hij naar kijkt. Om een gekozen aanzicht bij
     een aanvraag mee te sturen, en om te kunnen nameten of een camerastand
     doet wat hij belooft. */
  /* Koppel een plek aan een product uit de catalogus. Staat het model er, dan
     komt het in beeld in plaats van de getekende vorm. Zonder koppeling of
     zonder bestand verandert er niets. */
  koppel: (slot, pid) => { modelVoor[slot] = pid; },
  ontkoppel: (slot) => { delete modelVoor[slot]; },
  /* Wat de motor van zichzelf weet. Om na te kunnen meten of iets werkelijk
     gebeurt in plaats van er alleen naar te kijken. */
  diag: () => {
    const sp = [];
    spullenGroep.traverse(o => {
      if (!o.userData.spiegel) return;
      const p = o.getWorldPosition(new THREE.Vector3());
      sp.push({ plek: p.toArray().map(v => +v.toFixed(2)),
                envMap: !!o.material.envMap,
                soort: o.material.envMap ? o.material.envMap.mapping : null });
    });
    const mod = {};
    Object.keys(plek).forEach(s => {
      let pid = null;
      const pids = [];
      // een plek kan een stapel zijn — reservoir, pot en spoelplaat is er één
      plek[s].traverse(o => { if (o.userData.pid) { pid = o.userData.pid; pids.push(pid); } });
      // waar staat het echt, en hoe groot is het: de enige manier om te zien of
      // een model de afgesproken maatvoering aanhoudt
      const b = new THREE.Box3().setFromObject(plek[s]);
      const leeg = b.isEmpty();
      mod[s] = { pid: pid, pids: pids,
                 van: leeg ? null : b.min.toArray().map(v => +v.toFixed(2)),
                 tot: leeg ? null : b.max.toArray().map(v => +v.toFixed(2)) };
    });
    // de kamer zelf: hoeveel vlakken erin zitten en of ze binnen de opgegeven
    // maat blijven — vooral relevant bij een L-vorm, waar de vloer en de
    // wanden uit meer stukken bestaan dan bij een gewone rechthoek
    const kb = new THREE.Box3().setFromObject(kamerGroep);
    return { spiegels: sp, gebouwd: !!staat, modellen: mod,
             plekken: Object.keys(plek), sleepbaar: Object.keys(sleepbaar),
             catalogus: catalogus ? Object.keys(catalogus).length : 0,
             kamer: { vlakken: kamerGroep.children.length,
                      van: kb.min.toArray().map(v => +v.toFixed(2)),
                      tot: kb.max.toArray().map(v => +v.toFixed(2)) } };
  },
  /* Elk model op één plek apart opgemeten. `diag()` geeft de omhullende doos
     van de hele plek, en daarin is niet te zien of twee waskommen naast elkaar
     staan of precies in elkaar — en dat is nu juist wat je wilt weten. */
  meetPlek: (slot) => {
    const g = plek[slot]; if (!g) return null;
    const uit = [];
    g.children.forEach(k => {
      let pid = null;
      k.traverse(o => { if (o.userData.pid) pid = o.userData.pid; });
      const b = new THREE.Box3().setFromObject(k);
      uit.push({ pid, x0: +b.min.x.toFixed(3), x1: +b.max.x.toFixed(3),
                 y0: +b.min.y.toFixed(3), y1: +b.max.y.toFixed(3) });
    });
    return uit;
  },
  stand: () => ({
    p: camera.position.toArray().map(v => +v.toFixed(3)),
    t: controls.target.toArray().map(v => +v.toFixed(3)),
    vlucht: !!vlucht
  }),
  onGeplaatst: null, onGekozen: null,
  /* De douche kent geen positie langs een wand, alleen een hoek — vandaar een
     eigen callback met alleen 'links' of 'rechts' in plaats van wand/l/rot. */
  onDoucheGeplaatst: null
};

function init(el) {
  container = el;
  bouwMaterialen();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // niet hoger: sanitair is wit en tegels zijn licht, en boven de 1,0 lopen de
  // vloer en de wand in elkaar over tot één wit vlak
  renderer.toneMappingExposure = .92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeceae6);

  camera = new THREE.PerspectiveCamera(LENS, 1, .05, 60);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .08;
  controls.minDistance = .8;
  controls.maxDistance = 18;
  // niet onder de vloer door kunnen kijken, en niet helemaal loodrecht van
  // boven: dan verdwijnt het perspectief en is de ruimte niet meer te lezen
  controls.maxPolarAngle = Math.PI / 2 - .04;
  controls.minPolarAngle = .12;
  // wie zelf gaat draaien wint van een lopende cameravlucht
  controls.addEventListener('start', () => { vlucht = null; rechteLens(); });

  scene.environment = bouwOmgeving();
  bouwLicht();
  bindSlepen();

  kamerGroep = new THREE.Group(); scene.add(kamerGroep);
  spullenGroep = new THREE.Group(); scene.add(spullenGroep);
  sleepVlak = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  bouwNabewerking();
  new ResizeObserver(maatAanpassen).observe(el);
  maatAanpassen();
  renderer.setAnimationLoop(lus);
  return Bad3D;
}

/* ---------- omgevingsocclusie ----------
   Zonder dit staat alles op de vloer alsof het erop geplakt is: een kast raakt
   de wand, maar in de naad ertussen valt geen enkele schaduw en dus leest het
   niet als contact. Die naadschaduw is wat een render van een tekening
   onderscheidt. Slagschaduw van de lamp doet dat niet — die is te grof voor een
   naad van een halve centimeter. */
function bouwNabewerking() {
  const b = container.clientWidth || 800, h = container.clientHeight || 500;
  /* Met een nabewerking tekent de motor nooit naar het scherm maar naar een
     tussendoel, en daar deed antialias:true op de renderer niets meer. Alle
     randen stonden dus getrapt — het meest zichtbare mankement van het hele
     beeld, en het minst zichtbare in de code. Het tussendoel krijgt zijn eigen
     meervoudige bemonstering. */
  const doel = new THREE.WebGLRenderTarget(b * renderer.getPixelRatio(),
                                           h * renderer.getPixelRatio(),
                                           { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, doel);
  composer.addPass(new RenderPass(scene, camera));
  gtao = new GTAOPass(scene, camera, b, h);
  gtao.output = new URLSearchParams(location.search).has('ao')
    ? GTAOPass.OUTPUT.Denoise : GTAOPass.OUTPUT.Default;
  // een badkamer is klein; een straal van 20 cm pakt de naden en niet de
  // hele ruimte, anders wordt elke hoek een donkere veeg
  /* De occlusie stond te sterk en te grof. Op ware grootte was de donkere rand
     rond een kast geen schaduw maar korrel, en korrel op een witte tegel leest
     als vuil. Zachter en met meer monsters: een naadschaduw hoort te suggereren
     dat iets de wand raakt, niet om aandacht te vragen. */
  gtao.blendIntensity = .78;
  gtao.updateGtaoMaterial({ radius: .22, distanceExponent: 1.2, thickness: .4,
                            scale: 1.5, samples: 32, screenSpaceRadius: false });
  gtao.updatePdMaterial({ lumaPhi: 12, depthPhi: 3, normalPhi: 6,
                          radius: 8, radiusExponent: 1.2, rings: 4, samples: 16 });
  composer.addPass(gtao);
  composer.addPass(new OutputPass());
}

/* ---------- omgeving om in te spiegelen ----------
   Chroom en een spiegel hebben geen eigen kleur; ze laten zien wat er om hen
   heen staat. Zonder omgevingsmap is een verchroomde kraan dus pikzwart — en
   dat is precies wat er gebeurde. Dit is een kamertje van lichtvlakken dat
   nooit in beeld komt maar wel weerspiegeld wordt: een helder raam aan één
   kant, een licht plafond, en donkerder wanden ertegenover. */
function bouwOmgeving() {
  const s = new THREE.Scene();
  const vlak = (b, h, kleur, sterkte, pos, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(b, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(kleur).multiplyScalar(sterkte),
                                    side: THREE.DoubleSide }));
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    s.add(m);
  };
  const R = 8;
  vlak(R * 2, R * 2, 0xffffff, 1.5, [0, R, 0], [Math.PI / 2, 0, 0]);   // plafond
  vlak(R * 2, R * 2, 0x9a958c, .55, [0, -R, 0], [-Math.PI / 2, 0, 0]); // vloer
  vlak(R * 2, R * 2, 0xdfe6ec, .85, [0, 0, -R], [0, 0, 0]);
  vlak(R * 2, R * 2, 0xc9c4bc, .45, [0, 0, R], [0, Math.PI, 0]);
  vlak(R * 2, R * 2, 0xc9c4bc, .45, [-R, 0, 0], [0, Math.PI / 2, 0]);
  // het raam: één fel vlak, want dat is wat je in een kraan terugziet
  vlak(R * 2, R * 2, 0xf6f9fb, 3.2, [R, 0, 0], [0, -Math.PI / 2, 0]);

  const pm = new THREE.PMREMGenerator(renderer);
  pm.compileEquirectangularShader();
  const doel = pm.fromScene(s, .04);
  pm.dispose();
  s.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return doel.texture;
}

function bouwLicht() {
  // Een badkamer heeft zelden direct zonlicht; wat je ziet is een raam of een
  // plafondarmatuur plus wat er van de wanden terugkomt. Dat laatste is
  // hemisferisch licht, en zonder dat blijven de onderkanten pikzwart.
  // Laag houden. Hemisferisch licht komt van overal en werpt dus nergens een
  // schaduw; te veel ervan maakt de ruimte plat en dan is er ook niets meer
  // voor de omgevingsocclusie om donkerder te maken.
  scene.add(new THREE.HemisphereLight(0xf3f6f8, 0xb8b2a8, .30));

  /* Het licht kwam van buiten de ruimte. De wanden zijn vlakken van niets, dus
     het scheen er dwars doorheen en verlichtte alles even hard — daar kwam het
     vlakke, wit-op-witte beeld vandaan. Een badkamer wordt verlicht van binnen
     en van boven, en juist die val van boven naar beneden geeft een ruimte
     diepte: het plafond licht, de plint donker. */
  plafondLicht = new THREE.DirectionalLight(0xfff6ec, 1.55);
  plafondLicht.castShadow = true;
  plafondLicht.shadow.mapSize.set(2048, 2048);
  plafondLicht.shadow.camera.near = .2;
  plafondLicht.shadow.camera.far = 12;
  plafondLicht.shadow.bias = -.0006;
  plafondLicht.shadow.normalBias = .022;
  scene.add(plafondLicht);
  scene.add(plafondLicht.target);

  // Een tweede, zwakke bron schuin van voren zodat de voorkanten van kasten en
  // sanitair niet in hun eigen schaduw verdwijnen. Werpt geen schaduw: twee
  // schaduwen in een badkamer van vier vierkante meter is er een te veel.
  vulLicht = new THREE.DirectionalLight(0xe6eef6, .55);
  scene.add(vulLicht);
}

/** De lampen volgen de maat van de ruimte: midden boven, en de vulling schuin
    van de open kant. Zonder dit staat het licht op de maat van de vorige. */
function lichtOpMaat() {
  if (!plafondLicht) return;
  const { B, D, Hg } = K;
  plafondLicht.position.set(B * .42, Hg + 1.6, D * .40);
  plafondLicht.target.position.set(B * .52, 0, D * .58);
  plafondLicht.target.updateMatrixWorld();
  const s = Math.max(B, D) * .8 + 1;
  const c = plafondLicht.shadow.camera;
  c.left = -s; c.right = s; c.top = s; c.bottom = -s;
  c.updateProjectionMatrix();
  vulLicht.position.set(B * .5, Hg * .8, -D * .6);
}

function maatAanpassen() {
  if (!container) return;
  const b = container.clientWidth || 800, h = container.clientHeight || 500;
  renderer.setSize(b, h, false);
  camera.aspect = b / h;
  camera.updateProjectionMatrix();
  if (composer) composer.setSize(b, h);
  if (gtao) gtao.setSize(b, h);
}

/* ---------- wanden wegnemen ----------
   De weergave die iemand nodig heeft om zelf in te richten is die van een
   poppenhuis: van schuin boven, met de wanden die tussen jou en de ruimte in
   staan weggehaald. Dat is geen truc met vaste hoeken maar een som per beeld:
   staat de camera aan de buitenkant van een wand, dan is die wand in de weg. */
function wandenBijwerken() {
  const c = camera.position;
  WANDEN.forEach(w => {
    // een wand is sinds de deuren en ramen erin zitten een reeks stukken
    const stukken = wandMesh[w];
    if (!stukken || !stukken.length) return;
    const n = wandNormaal(w);
    const p = new THREE.Vector3(...(() => {
      const [x, z] = wandPunt(K, w, 0, 0);
      return [x, 0, z];
    })());
    const zichtbaar = n.dot(c.clone().sub(p)) > 0;
    stukken.forEach(m => { m.visible = zichtbaar; });
  });
  // het plafond alleen als je er echt onder staat
  if (plafondMesh) plafondMesh.visible = c.y < K.Hg && binnenRuimte(c);
}

function binnenRuimte(p) {
  return p.x > 0 && p.x < K.B && p.z > 0 && p.z < K.D;
}

/* ---------- opbouw ---------- */

function bouwKamer(op) {
  kamerGroep.clear();
  const { B, D, Hg } = K;

  /* De vloer is één rechthoek, of twee wanneer er een hap uit een hoek is.
     Beide stukken delen hetzelfde materiaal en dezelfde tegelmaat — de UV komt
     daarom niet uit de eigen vorm van het stuk maar uit de positie in de hele
     ruimte, anders lopen de voegen op de naad tussen de twee stukken niet
     door. */
  const vloerMat = vlakMateriaal(op.vloer, B, D, 'vloer');
  vloerVlakken(K).forEach(v => {
    const w = v.x1 - v.x0, d = v.z1 - v.z0;
    if (w < .002 || d < .002) return;
    const g = new THREE.PlaneGeometry(w, d);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      // lokaal 0..1 terugrekenen naar de wereldpositie, en die delen door B/D
      const lx = v.x0 + uv.getX(i) * w, lz = v.z0 + uv.getY(i) * d;
      uv.setXY(i, lx / B, lz / D);
    }
    uv.needsUpdate = true;
    const vloer = new THREE.Mesh(g, vloerMat);
    vloer.rotation.x = -Math.PI / 2;
    vloer.position.set((v.x0 + v.x1) / 2, 0, (v.z0 + v.z1) / 2);
    vloer.receiveShadow = true;
    kamerGroep.add(vloer);
  });

  /* Een wand bestaat uit twee stukken. De onderste 36 cm blijft altijd staan,
     ook als de camera erachter zit; alleen het stuk daarboven verdwijnt. Zonder
     die band is een badkamer van bovenaf een vloer met zwevende meubels: het
     toilet hangt aan een wand die je net hebt weggehaald, en dan lijkt het los
     in de ruimte te staan. Met de band lees je de plattegrond én zie je waar
     alles tegenaan staat. */
  const LAAG = .36;
  wandMesh = {};
  WANDEN.forEach(w => {
    const lang = wandLengte(K, w);
    const wandMateriaal = op.accent && op.accent.wand === w ? op.accent.mat : op.wand;
    const mat = vlakMateriaal(wandMateriaal, lang, Hg, 'wand');

    /* Eén stuk wand: van l0 tot l1 langs de wand en van y0 tot y1 omhoog. De
       textuur is voor de hele wand gemaakt, dus elk stuk pakt zijn eigen strook
       eruit — anders krijgt een smalle strook naast een deur de hele
       tegelverdeling in zijn eentje. */
    const deel = (l0, l1, y0, y1, hoort) => {
      if (l1 - l0 < .002 || y1 - y0 < .002) return null;
      const g = new THREE.PlaneGeometry(l1 - l0, y1 - y0);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, (l0 + uv.getX(i) * (l1 - l0)) / lang);
        uv.setY(i, (y0 + uv.getY(i) * (y1 - y0)) / Hg);
      }
      uv.needsUpdate = true;
      const m = new THREE.Mesh(g, mat);
      const [x, z] = wandPunt(K, w, (l0 + l1) / 2, 0);
      m.position.set(x, (y0 + y1) / 2, z);
      m.rotation.y = wandDraai(w);
      m.receiveShadow = true;
      kamerGroep.add(m);
      if (hoort) hoort.push(m);
      return m;
    };

    /* De openingen in deze wand. Een deur loopt van de vloer tot zijn hoogte,
       een raam begint op de borstwering — dus onder een raam zit nog wand en
       onder een deur niet. Zonder dit onderscheid staat er een deur met een
       dorpel of een raam dat tot de grond doorloopt. */
    const gaten = ((op.openingen || []).filter(o => o.wand === w) || [])
      .map(o => ({ l0: Math.max(0, o.hart - o.breedte / 2),
                   l1: Math.min(lang, o.hart + o.breedte / 2),
                   y0: o.soort === 'raam' ? o.borstwering : 0,
                   y1: (o.soort === 'raam' ? o.borstwering : 0) + o.hoogte }))
      .filter(g => g.l1 > g.l0)
      .sort((a, b) => a.l0 - b.l0);

    /* De hap uit een L-vormige ruimte is voor deze wand precies een gat over
       de volle hoogte — behalve dat er geen deur of raam in hangt, dus dit
       stuk vult zich niet uit `op.openingen`. Dat blijft bewust een lokale
       toevoeging: `op.openingen` voedt ook waar de deur- en raammodellen
       komen te hangen, en een hap is geen deur. */
    const snedeBereik = snedeOpWand(K, w);
    if (snedeBereik) {
      gaten.push({ l0: snedeBereik[0], l1: snedeBereik[1], y0: 0, y1: Hg });
      gaten.sort((a, b) => a.l0 - b.l0);
    }

    /* Wat er overblijft nadat de gaten eruit zijn: de stroken ernaast over de
       volle hoogte, en boven (en bij een raam ook onder) het gat een stuk wand.
       Alles wordt bij 36 cm doorgesneden, want die onderste band blijft staan
       ook als de rest van de wand wordt weggehaald om naar binnen te kijken. */
    const boven = [];
    const rechthoeken = [];
    let vorige = 0;
    gaten.forEach(g => {
      if (g.l0 > vorige) rechthoeken.push([vorige, g.l0, 0, Hg]);
      if (g.y0 > 0) rechthoeken.push([g.l0, g.l1, 0, g.y0]);
      if (g.y1 < Hg) rechthoeken.push([g.l0, g.l1, g.y1, Hg]);
      vorige = Math.max(vorige, g.l1);
    });
    if (vorige < lang) rechthoeken.push([vorige, lang, 0, Hg]);

    rechthoeken.forEach(r => {
      const [l0, l1, y0, y1] = r;
      if (y0 < LAAG) deel(l0, l1, y0, Math.min(y1, LAAG), null);
      if (y1 > LAAG) deel(l0, l1, Math.max(y0, LAAG), y1, boven);
    });
    wandMesh[w] = boven;               // dit gaat weg als het in de weg staat
  });

  /* De twee korte wandjes die de hap zelf afsluiten. Ze horen niet bij WANDEN
     — er kan geen deur of raam in, en `wandenBijwerken()` haalt ze dus nooit
     weg als de camera erachter komt te staan. Voor twee wandjes van hooguit
     anderhalve meter is dat een aanvaardbare beperking; ze blokkeren nooit
     meer dan één hoek van het overzicht. */
  notchWanden(K).forEach(n => {
    if (n.lengte < .002) return;
    const mat = vlakMateriaal(op.wand, n.lengte, Hg, 'wand');
    const g = new THREE.PlaneGeometry(n.lengte, Hg);
    const m = new THREE.Mesh(g, mat);
    m.position.set(n.x, Hg / 2, n.z);
    m.rotation.y = n.draai;
    m.receiveShadow = true;
    kamerGroep.add(m);
  });

  const plaf = new THREE.Mesh(new THREE.PlaneGeometry(B, D), M.plafond);
  plaf.rotation.x = Math.PI / 2;
  plaf.position.set(B / 2, Hg, D / 2);
  kamerGroep.add(plaf);
  plafondMesh = plaf;
}

/** Zet een productgroep op een plek in de ruimte en onthoud waar hij staat.
    Een plek is een wand, een afstand langs die wand en een afstand ervandaan;
    daarmee is elk punt op de vloer te beschrijven zonder een tweede stelsel.
    De groep krijgt zijn oorsprong op vloerhoogte met de eigen +z de ruimte in,
    precies zoals de catalogus zijn producten beschrijft. */
function zetOpPlek(g, sleutel, wand, l, diep, breed, sleep, rot) {
  const [x, z] = wandPunt(K, wand, l, diep || 0);
  g.position.set(x, 0, z);
  g.rotation.y = wandDraai(wand) + (rot || 0) * Math.PI / 180;
  g.userData.sleutel = sleutel;
  g.userData.wand = wand;
  g.userData.l = l;
  g.userData.diep = diep || 0;
  g.userData.breed = breed || .60;
  g.userData.rot = rot || 0;
  plek[sleutel] = g;
  if (sleep) sleepbaar[sleutel] = g;
  return g;
}

/** Zet een productgroep tegen zijn wand; slepen weet dan wat het verplaatst. */
function zetAanWand(g, sleutel, wand, l, breed, rot) {
  return zetOpPlek(g, sleutel, wand, l, 0, breed, true, rot);
}

/* Een getekende vorm staat in wereldcoördinaten; een model staat in het kader
   van zijn plek. Om ze uitwisselbaar te maken hangt de vorm in datzelfde kader,
   met de omgekeerde verplaatsing ervoor — op het scherm verandert er niets, en
   `g.clear()` kan de vorm nu vervangen door een model dat wél in het kader
   hoort. Anders zou elk model dat een vorm inruilt in de hoek van de kamer
   belanden. */
function inKader(g, vorm) {
  if (!vorm) return g;
  const om = new THREE.Group();
  om.rotation.y = -g.rotation.y;
  om.position.copy(g.position).negate()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), -g.rotation.y);
  om.add(vorm);
  g.add(om);
  return g;
}

/** Een plek met een getekende vorm erin, klaar om ingeruild te worden. */
function vormOpPlek(sleutel, wand, l, diep, breed, vorm, rot, sleep) {
  const g = zetOpPlek(new THREE.Group(), sleutel, wand, l, diep, breed, !!sleep, rot);
  inKader(g, vorm);
  spullenGroep.add(g);
  return g;
}

function bouwSpullen(inr) {
  spullenGroep.clear();
  sleepbaar = {};
  plek = {};
  const pl = window.NGTegelBeeld && window.NGTegelBeeld.plaatsing
    ? window.NGTegelBeeld.plaatsing(K, inr) : {};
  laatstePlaatsing = pl;

  if (pl.douche) doucheOpPlek(pl.douche, inr);
  if (pl.douche && inr.douchekraan === 'plafond') plafondDoucheOpPlek(pl.douche, inr);
  if (pl.bad) badOpPlek(pl.bad, inr);
  if (pl.wastafel) {
    const g = wastafel(pl.wastafel, inr);
    spullenGroep.add(zetAanWand(g, 'wastafel', pl.wastafel.wand, pl.wastafel.l, pl.wastafel.w, pl.wastafel.rot));
    // eigen plek voor de kraan — zie de opmerking bij wastafel() hierboven
    vormOpPlek('wastafelkraan', pl.wastafel.wand, pl.wastafel.l, 0, pl.wastafel.w,
                wastafelkraanVorm(pl.wastafel, inr), pl.wastafel.rot);
  }
  if (pl.toilet) {
    const g = hangtoilet(pl.toilet, inr);
    spullenGroep.add(zetAanWand(g, 'toilet', pl.toilet.wand, pl.toilet.l, pl.toilet.breed, pl.toilet.rot));
  }
  if (inr.radiator && inr.radiator !== 'geen') {
    // De getekende radiator staat op de voorwand, 45 cm uit de rechterhoek.
    vormOpPlek('radiator', 'voor', .45, 0, .60, radiator(K, inr));
  }
  /* Deur en raam. De opening zit al in de wand — bouwKamer() snijdt hem eruit —
     en hier komt wat erin hangt. Zonder model blijft het gat gewoon een gat, en
     dat leest nog altijd als een deur. */
  (staat && staat.openingen || []).forEach(function (o) {
    vormOpPlek(o.soort, o.wand, o.hart, 0, o.breedte, null);
  });
  if (pl.kolomkast) {
    var kk = pl.kolomkast;
    var hoog = (inr.kolomhoogte || 120) / 100;
    var kast = doos(kk.breed, hoog, kk.diep, meubelMat(inr.meubelkleur));
    // de getekende vorm staat in het kader zelf: midden onder, diepte de ruimte in
    var vorm = new THREE.Group();
    kast.position.set(0, .40 + hoog / 2, kk.diep / 2);
    vorm.add(kast);
    var g = zetOpPlek(new THREE.Group(), 'kolomkast', kk.wand, kk.l, 0, kk.breed, true, kk.rot);
    g.add(vorm);
    spullenGroep.add(g);
  }
  accessoiresOpPlek(pl, inr);
  nisOpPlek(pl);
  lichtOpPlek(pl, inr);
  modellenInvoegen();
}

/* De inbouwnis. plaatsen() rekent hem al uit — welke wand, van welke hoogte tot
   welke hoogte, hoe diep — maar er werd nooit iets van getekend. Wie hem
   aanvinkte betaalde ervoor en zag hem niet. */
function nisOpPlek(pl) {
  if (!pl.nis) return;
  var lang = pl.nis.z1 - pl.nis.z0;
  vormOpPlek('nis', pl.nis.wand, K.D - (pl.nis.z0 + pl.nis.z1) / 2, 0, lang, null);
}

/* Verlichting hangt aan het plafond of boven de spiegel. Een plafondplek is
   gewoon een wandkader met een afstand tot die wand: de montagehoogte komt uit
   de catalogus, dus een spot belandt vanzelf tegen het plafond. */
function lichtOpPlek(pl, inr) {
  vormOpPlek('spots', 'achter', K.B / 2, K.D / 2, .30, null);
  if (pl.wastafel) {
    vormOpPlek('spiegellamp', pl.wastafel.wand, pl.wastafel.l, 0, .60, null);
    vormOpPlek('wandlamp', pl.wastafel.wand,
               pl.wastafel.l + (pl.wastafel.w || .8) / 2 + .20, 0, .10, null);
  }
  /* Een hanglamp hangt boven het bad als dat er is, en anders boven de
     wastafel. Boven de looproute hangen is hem in je gezicht hangen. */
  if (pl.bad) {
    var zij = pl.bad.kant === 'rechts' ? 'rechts' : 'links';
    var vanaf = zij === 'rechts' ? K.B - pl.bad.x - pl.bad.rx : pl.bad.x - pl.bad.rx;
    vormOpPlek('hanglamp', zij, K.D - pl.bad.z, vanaf + pl.bad.rx, .25, null);
  } else if (pl.wastafel) {
    vormOpPlek('hanglamp', pl.wastafel.wand, pl.wastafel.l, .45, .25, null);
  }
  // de prullenbak staat op de vloer naast het meubel
  if (pl.wastafel) {
    vormOpPlek('prullenbak', pl.wastafel.wand,
               pl.wastafel.l - (pl.wastafel.w || .8) / 2 - .16, .12, .15, null);
  }
}

/* De vier stukken van de douche, elk op zijn eigen plek zodat de catalogus ze
   stuk voor stuk kan overnemen. De glaswand is de enige die dwars staat: die
   loopt van de achterwand naar voren, dus hangt hij aan een zijkader waar de
   lengterichting van achter naar voor wijst. */
function doucheOpPlek(d, inr) {
  const v = doucheVormen(d, K, inr);
  const links = d.kant !== 'rechts';
  const hart = links ? d.w / 2 : K.B - d.w / 2;   // hart van de douche op de achterwand
  const zij = links ? 'links' : 'rechts';

  vormOpPlek('douchebak', 'achter', hart, 0, d.w, v.bak);
  vormOpPlek('doucheafvoer', 'achter', hart,
             inr.afvoer === 'midden' ? d.d / 2 : .12, d.w, v.afvoer);
  /* Een inloopwand staat dwars: hij loopt van de achterwand naar voren en zijn
     breedte is dus de diepte van de douche. Een cabine niet — die hangt met
     zijn breedte langs de achterwand en met zijn diepte de ruimte in. Twee
     verschillende gebaren, dus twee verschillende kaders, anders staat een
     hoekinstap van 90 bij 90 naast de douche in plaats van erin.

     Het scherm is ook het aangrijpingspunt om de hele douche naar de andere
     hoek te verslepen — het is, anders dan de bak, altijd getekend: met een
     betegelde vloer (de standaard) bestaat er geen aparte bak-vorm, maar wel
     altijd een scherm. De andere drie stukken delen geen kader met het scherm
     en volgen dus pas mee zodra bouwSpullen() na het loslaten opnieuw
     opbouwt, precies zoals de wastafelkraan nu al pas ná het loslaten met de
     wastafel meegaat. */
  if (inr.douchesoort && inr.douchesoort !== 'walkin') {
    vormOpPlek('douchewand', 'achter', hart, 0, d.w, v.wand, 0, true);
  } else {
    vormOpPlek('douchewand', zij, d.d / 2, d.w, d.d, v.wand, 0, true);
  }
  vormOpPlek('douchesysteem', 'achter', links ? d.w * .45 : K.B - d.w * .45, 0, .30, v.systeem);
}

/* De hoogte waarop een hoofddouche hoort te hangen, niet bedacht maar
   opgezocht: 2,10–2,20 m onderkant is gebruikelijk in Nederland (Badkamerie),
   dezelfde waarde als NLHOOGTE.douchekop in tekening.js. Eén plek voor dat
   getal voorkomt dat de tekening en de 3D-motor uiteenlopen. */
const HOOGTE_DOUCHEKOP = 2.10;

/* Plafond-stortdouche: een plek op zichzelf, los van het wandkader van
   douchesysteem hierboven. Een plafondmodel hangt aan een ander vlak dan een
   wandmodel en heeft dus een ander coördinatenstelsel nodig — vormOpPlek()
   veronderstelt een wand op vloerhoogte, en die aanname klopt hier niet.
   Daarom wordt deze plek rechtstreeks in wereldcoördinaten gezet in plaats
   van via een wandkader, en het echte model (BTH-0154) hier zelf ingeladen in
   plaats van via de generieke modellenInvoegen()-ronde: dat mechanisme schaalt
   een model altijd uniform, en hier mag alleen de arm meebewegen met de
   plafondhoogte — de douchekop moet zijn eigen maat houden. */
function plafondDoucheOpPlek(d, inr) {
  const links = d.kant !== 'rechts';
  const hcx = links ? d.w / 2 : K.B - d.w / 2, hcz = K.D - d.d / 2;
  const km = kraanMat(inr.kraankleur);

  const g = new THREE.Group();
  g.position.set(hcx, K.Hg, hcz);
  g.userData.sleutel = 'plafonddouche';
  plek.plafonddouche = g;
  spullenGroep.add(g);

  const armLengte = () => Math.max(.05, K.Hg - HOOGTE_DOUCHEKOP - .022);
  const tekenGetekend = () => {
    g.clear();
    const lang = armLengte();
    g.add(buis([0, 0, 0], [0, -lang, 0], .016, km));
    const kop = cil(.14, .022, km, 28);
    kop.position.set(0, -lang - .011, 0);
    g.add(kop);
  };
  tekenGetekend();

  laadModel('BTH-0154').then(scene => {
    // ontbreekt het bestand, of is de kamer intussen opnieuw opgebouwd? dan
    // blijft de getekende arm staan — die is al zichtbaar.
    if (!scene || !g.parent) return;
    g.clear();
    // pid op het kind, niet op g zelf: meetPlek() meet g.children, net als bij
    // elke andere plek waar kloonModel() het kind teruggeeft met zijn eigen pid
    const model = plafondArmGroep(scene, inr.kraankleur, armLengte());
    model.userData.pid = 'BTH-0154';
    g.add(model);
  });
}

/* BTH-0154 heeft zijn oorsprong bovenaan (center-top): x en z gecentreerd,
   y = 0 tegen het plafond, en het model hangt in -Y de kamer in — precies
   zoals in bad3d/MODELLEN.md staat, maar dan omgekeerd bovenaan in plaats van
   onderaan. Dat is precies wat nodig is om zonder extra verschuiving vanaf
   het plafond te laten hangen.

   De 154 "nozzle_dark" meshes zijn de douchekop; de rest ("metal_chrome") is
   de arm met zijn bevestiging. Alleen de arm wordt verticaal geschaald — de
   kop schuift alleen mee naar het nieuwe uiteinde. */
function plafondArmGroep(scene, kleur, doelArmLengte) {
  const m = scene.clone(true);
  if (kleur) tint(m, kleur);
  const arm = new THREE.Group(), kop = new THREE.Group();
  // eerst verzamelen, dán pas verplaatsen: add() hertekent tijdens de traversal
  // de children-array van het origineel, en die array is dezelfde die
  // traverse() zelf aan het doorlopen is — verplaatsen tijdens het lopen slaat
  // de helft van de meshes over en loopt uiteindelijk voorbij het einde
  const armMeshes = [], kopMeshes = [];
  m.traverse(o => {
    if (!o.isMesh) return;
    const naam = (o.material && o.material.name) || '';
    if (/bbox|proxy/i.test(naam)) return;
    (/nozzle/i.test(naam) ? kopMeshes : armMeshes).push(o);
  });
  armMeshes.forEach(o => arm.add(o));
  kopMeshes.forEach(o => kop.add(o));

  // eerst allebei de eigen, ongewijzigde afmetingen opmeten — de kop wordt
  // nooit geschaald, dus zijn doos blijft de hele functie lang geldig
  const kopDoos = kop.children.length ? new THREE.Box3().setFromObject(kop) : null;

  const g = new THREE.Group();
  if (arm.children.length) {
    const doos3 = new THREE.Box3().setFromObject(arm);
    // de arm loopt al vanaf y=0 (het plafond) naar beneden; alleen de
    // schaalfactor bepalen en om het eigen bovenpunt (0) schalen — dat punt
    // verandert niet, dus geen verschuiving nodig, alleen scale.y
    const eigenLengte = -doos3.min.y;
    if (eigenLengte > 1e-4) arm.scale.y = doelArmLengte / eigenLengte;
    g.add(arm);
  }
  if (kop.children.length) {
    /* De kop blijft zijn eigen maat houden — geen schaal, alleen een
       verschuiving die zijn bovenkant (kopDoos.max.y, van nature net onder de
       arm) naar het nieuwe uiteinde van de arm (-doelArmLengte) schuift. */
    g.add(kop);
    kop.position.y = -doelArmLengte - kopDoos.max.y;
  }
  return g;
}

/* Het bad ligt met zijn lange kant van achter naar voren, en dat is precies de
   lengterichting van een zijkader. In het achterkader zou een bad van 170 dwars
   door de kamer liggen. */
function badOpPlek(b, inr) {
  const v = badVormen(b, K, inr);
  const rechts = b.kant === 'rechts';
  const zij = rechts ? 'rechts' : 'links';
  const vanaf = rechts ? K.B - (b.x + b.rx) : b.x - b.rx;

  // 'bad' is de enige van de drie die zelf versleept en gedraaid mag worden;
  // de kraan en de badwand delen zijn kader en volgen dus vanzelf mee
  const g = vormOpPlek('bad', zij, K.D - b.z, vanaf, b.rz * 2, v.kuip, b.rot, true);
  // de diepte van het bad (de korte kant) is er niet uit af te leiden zoals
  // bij een kolomkast — die verschilt per badsoort en per kamer — dus gaat
  // hij als eigen gegeven mee voor de botsingscontrole tijdens het slepen
  g.userData.diepBad = b.rx * 2;
  /* Een vrijstaande vloerkraan staat achter het bad op de vloer; een rand- of
     wandkraan zit aan het kopse eind. Twee heel verschillende plekken, dus
     twee heel verschillende kaders. */
  const kz = inr.badkraan === 'vloer' ? b.z + b.rz + .22 : b.z + b.rz - .12;
  vormOpPlek('badkraan', zij, K.D - kz, vanaf, .30, v.kraan, b.rot);

  /* Een badwand staat op de rand aan het kopse eind — daar waar de kraan zit en
     waar je onder de douche gaat staan. Hij deelt het kader van het bad, dus
     zijn breedte loopt langs de badlengte en niet erdwars overheen. */
  vormOpPlek('badwand', zij, K.D - (b.z + b.rz - .45), vanaf, .90, null, b.rot);
}

/* Accessoires hangen aan een wand op een hoogte die de catalogus kent. Ze
   hebben geen getekende vorm — zonder model is er domweg niets, en dat is ook
   eerlijk: een toiletrolhouder tekenen we niet na. */
function accessoiresOpPlek(pl, inr) {
  if (pl.toilet) {
    // naast het toilet, aan de kant waar de meeste ruimte is
    const kant = pl.toilet.kant === 'rechts' ? -1 : 1;
    vormOpPlek('rolhouder', pl.toilet.wand,
               pl.toilet.l + kant * ((pl.toilet.breed || .78) / 2 + .12), 0, .15, null);
  }
  if (pl.douche) {
    const links = pl.douche.kant !== 'rechts';
    const hart = links ? pl.douche.w / 2 : K.B - pl.douche.w / 2;
    vormOpPlek('doucheplanchet', 'achter', hart + (links ? .30 : -.30), 0, .15, null);
    vormOpPlek('douchegreep', 'achter', hart + (links ? -.30 : .30), 0, .15, null);
  }
}

/* ---------- getekende vorm inruilen voor een echt model ----------
   Per plek kan een product_id uit de catalogus gekoppeld worden. Staat het
   model er, dan vervangt het de getekende vorm; staat het er niet, dan blijft
   de vorm staan en merkt de bezoeker er niets van. Zo kan de modellenreeks
   product voor product binnenkomen zonder dat er ooit een gat in beeld valt. */
const modelVoor = {};

function modellenInvoegen() {
  const plekken = Object.keys(modelVoor).filter(s => plek[s]);
  if (!plekken.length) return;
  laadCatalogus().then(() => Promise.all(plekken.map(slot => {
    /* Een plek kan meer dan één product zijn. Een hangend toilet is een
       inbouwreservoir, een pot en een bedieningsplaat — drie artikelen met
       ieder een eigen montagehoogte, en zo staan ze ook in de catalogus. Ze
       hier weer samenvoegen tot één model zou die hoogtes weggooien. */
    /* Een artikel is een nummer, of een nummer met een kleur eraan. Het tweede
       is nodig zodra de klant een kleur kiest die de catalogus als variant kent
       maar waarvoor geen apart bestand bestaat — een spoelplaat in mat zwart,
       een kraan in geborsteld messing. */
    const alles = [].concat(modelVoor[slot])
      .map(x => (typeof x === 'string' ? { pid: x } : x))
      .filter(x => x && x.pid);
    /* De voorzetwand is een bouwdeel en geen product dat ergens op hangt: hij
       wordt op maat gemaakt om het reservoir of de nis heen. Hij zit daarom wel
       in de stapel — het is een artikel met een nummer — maar hij wordt niet als
       gewoon onderdeel geplaatst, want zijn maat volgt uit wat erin verdwijnt. */
    const lijst = alles.filter(x => x.rol !== 'wand');
    const wandArt = alles.filter(x => x.rol === 'wand')[0] || null;
    const teLaden = lijst.concat(wandArt ? [wandArt] : []);
    return Promise.all(teLaden.map(x => laadModel(x.pid))).then(alleScenes => {
      const scenes = alleScenes.slice(0, lijst.length);
      const wandScene = wandArt ? alleScenes[lijst.length] : null;
      const g = plek[slot];
      // tussen laden en aankomen kan de ruimte al opnieuw opgebouwd zijn
      if (!g || !g.parent) return;
      const gevonden = scenes.filter(Boolean);
      // alles of niets: half model, half getekende vorm wordt een rommeltje
      if (gevonden.length !== lijst.length) return;
      g.clear();
      /* Een inbouwreservoir hoort in een voorzetwand. Dat is geen detail: de
         wand in dit model is een vlak zonder dikte, dus iets "in de wand"
         zetten steekt er aan de achterkant weer uit — en in de
         overzichtsweergave, waar die wand net is weggehaald, staat het
         reservoir dan in het volle zicht. De voorzetwand wordt er dus bij
         gebouwd, en alles wat erop hangt schuift zijn dikte naar voren. */
      let duct = 0, ductB = 0, ductH = 0;
      lijst.forEach(a => {
        const c = (catalogus && catalogus[a.pid]) || {};
        if (!NAAR_BINNEN[c.op]) return;
        duct = Math.max(duct, c.d || 0);
        ductB = Math.max(ductB, c.b || 0);
        /* Hoe hoog de wand moet zijn is niet hoe hoog het artikel is, maar hoe
           hoog het bovenste punt ervan komt. Een inbouwreservoir staat op de
           vloer, dus daar viel dat samen. Een inbouwnis hangt op een meter, en
           die stond dan achter een muurtje van vierendertig centimeter op de
           grond terwijl de nis zelf vrij in de lucht de badkamer in stak. */
        ductH = Math.max(ductH, (c.y || 0) + (c.h || 0));
      });

      let breed = 0;
      lijst.forEach((a, i) => {
        const c = (catalogus && catalogus[a.pid]) || {};
        const deel = modelGroep(a.pid, scenes[i], a.kleur, a.maat);
        // Beide gevallen schuiven even ver op: het reservoir stond op -d/2 en
        // komt zo op 0..d te liggen, en wat erop hangt begint waar de
        // voorzetwand ophoudt.
        if (duct) deel.position.z += duct;
        /* Twee waskommen op één blad staan niet op dezelfde plek. Een stapel
           deelt zijn oorsprong, dus krijgt een artikel een eigen verspringing
           langs de wand mee — zonder dat staan de kommen precies in elkaar en
           zie je er één. */
        if (a.x) deel.position.x += a.x;
        /* En omhoog. Een raam heeft in de catalogus één borstwering, en die van
           dit huis is een andere — dan schuift het model naar de hoogte die is
           opgemeten in plaats van de hoogte die de fabrikant koos. */
        if (a.y) deel.position.y += a.y;
        g.add(deel);
        if (c.b) breed = Math.max(breed, c.b);
      });

      if (duct) {
        const wb = Math.max(ductB + .24, breed);
        /* Hoe hoog de wand wordt is een bouwkeuze en geen rekensom. Achter een
           toilet komt een halfhoge voorzetwand met een blad erop; een nis in de
           douche zit in een wand die doorloopt tot het plafond. Wie het weet
           geeft het mee, en anders is het net zo hoog als wat erin verdwijnt. */
        const wh = wandArt && wandArt.hoog ? wandArt.hoog : ductH + .04;
        if (wandScene) {
          /* Het echte artikel in plaats van een grijze doos. Een voorzetwand
             wordt op maat gemetseld of getimmerd, dus schaalt het model mee met
             het gat dat het moet verbergen. */
          /* Geen extra verschuiving: modelGroep zet een bouwdeel al met zijn
             voorkant op nul en zijn dikte de ruimte in — precies waar de
             getekende doos stond. De onderdelen die erin verdwijnen schuiven
             wél op, want die stonden achter de wand. */
          const wg = modelGroep(wandArt.pid, wandScene, null, { b: wb, h: wh, d: duct });
          g.add(wg);
        } else {
          const wand = doos(wb, wh, duct, M.stuc);
          wand.position.set(0, wh / 2, duct / 2);
          g.add(wand);
        }
        breed = Math.max(breed, ductB + .24);
      }
      if (breed) g.userData.breed = breed;
    });
  })));
}

/** Nieuwe stand van de configurator. Alles wordt opnieuw gebouwd; een badkamer
    is klein genoeg dat dat sneller gaat dan uitzoeken wat er veranderd is. */
function update(nieuw) {
  const eerste = staat === null;
  staat = nieuw;
  const m = nieuw.maat || {};
  // bij de eerste opbouw staat de camera nog in de oorsprong — dat is de hoek
  // van de ruimte, en daar zie je niets
  const nieuweMaat = eerste || K.B !== m.B || K.D !== m.D;
  K = { B: m.B || 2.4, D: m.D || 3.0, Hg: m.Hg || 2.6, snede: m.snede || null };
  lichtOpMaat();
  bouwKamer(nieuw);
  bouwSpullen(nieuw.inrichting || {});
  wandenBijwerken();
  if (nieuweMaat) resetView();
}

/* ---------- camerastanden ---------- */

/* De vlucht loopt op de klok, niet op beeldjes. Met een vaste stap per beeld
   duurt dezelfde vlucht op een telefoon van 15 beeldjes per seconde vier keer
   zo lang als op een laptop, en dan lijkt de configurator te hangen. */
const VLUCHTTIJD = 900;
let vlucht = null;
function vliegNaar(p, t) {
  vlucht = { vanP: camera.position.clone(), vanT: controls.target.clone(),
             naarP: p.clone(), naarT: t.clone(), start: performance.now() };
}
function midden() { return new THREE.Vector3(K.B / 2, 1.05, K.D / 2); }

/** Poppenhuis: van schuin boven en van buitenaf, de hele plattegrond in beeld.
    Dit is de stand waarin je iets kunt verslepen, want je ziet alle wanden. */
function overzicht() {
  const t = midden();
  /* De ruimte stond klein in een zee van achtergrond. De afstand hing aan de
     langste zijde, maar wat je moet inpassen is de diagonaal gezien onder de
     kijkhoek — en die staat vast. Zo vult elke kamer het beeld ongeveer even
     goed, of hij nu 1,1 of 4,4 meter breed is. */
  const diag = Math.hypot(K.B, K.D, K.Hg);
  const straal = (diag * .58) / Math.tan(LENS * Math.PI / 360) * .82;
  vliegNaar(new THREE.Vector3(K.B / 2 - straal * .60, straal * .62, -straal * .50), t);
}
/** Op ooghoogte middenin: zo staat iemand er straks echt in. */
function inDeRuimte() {
  /* Het blikpunt lag te hoog. Je keek tegen een wand aan met wat sanitair
     ervoor en zag nauwelijks vloer — en zonder vloer leest een beeld niet als
     een ruimte maar als een productfoto. Iemand die een badkamer binnenloopt
     kijkt licht omlaag, en dan valt de hele plattegrond in beeld. */
  vliegNaar(new THREE.Vector3(K.B / 2, 1.62, .28),
            new THREE.Vector3(K.B / 2, .92, K.D * .88));
}
/* ---------- rechte verticalen ----------
   Een camera die omlaag kantelt laat de wanden naar elkaar toe lopen. Dat is
   optisch juist maar het is niet hoe een badkamer wordt gefotografeerd: een
   architectuurfoto houdt de verticalen recht, en dat is precies het verschil
   tussen een render die klopt en een render die duur oogt. Vroeger gebeurde
   dat met een kantelbaar objectief; hier met hetzelfde principe. De camera
   blijft waterpas en er wordt een venster uit een groter beeld genomen dat
   lager ligt. Zo kijk je omlaag zonder te kantelen. */
function schuifLens(omlaag, fov) {
  const b = container.clientWidth || 800, h = container.clientHeight || 500;
  const volH = h * 1.7;
  // de kijkhoek geldt voor het venster, niet voor het hele denkbeeldige beeld
  camera.fov = 2 * Math.atan((volH / h) * Math.tan(fov * Math.PI / 360)) * 180 / Math.PI;
  camera.setViewOffset(b, volH, 0, (volH - h) * omlaag, b, h);
  camera.updateProjectionMatrix();
}
function rechteLens() {
  camera.clearViewOffset();
  camera.fov = LENS;
  camera.updateProjectionMatrix();
}

/* Zes vaste standen. Dezelfde namen, dezelfde plekken, elke keer — anders is
   een vergelijking tussen twee versies van het beeld niets waard. */
function stand2(naam) {
  const { B, D, Hg } = K;
  const OOG = 1.58;                       // ooghoogte, zoals een fotograaf hem zet
  if (naam === 'boven') { rechteLens(); return boven(); }
  if (naam === 'overzicht') { rechteLens(); return overzicht(); }

  if (naam === 'deur') {
    // vanaf de deur naar binnen: de eerste blik die iemand op zijn badkamer werpt
    schuifLens(.70, 40);
    return vliegNaar(new THREE.Vector3(B * .5, OOG, .22),
                     new THREE.Vector3(B * .5, OOG, D));
  }
  if (naam === 'hoek') {
    /* Vanuit de hoek naast de deur schuin de ruimte in. Eerst stond hij in de
       achterhoek naar de deurhoek te kijken: precies de kant op waar niets
       staat, want alles hangt aan de wanden achter de camera. Een tegenoverliggend
       aanzicht moet de inrichting in beeld hebben, niet de uitgang. */
    schuifLens(.68, 46);
    return vliegNaar(new THREE.Vector3(B * .92, OOG, D * .10),
                     new THREE.Vector3(B * .18, OOG - .15, D * .82));
  }
  if (naam === 'wastafel') {
    const p = laatstePlaatsing.wastafel;
    const doel = p ? wandPunt(K, p.wand, p.l, .3) : [B * .5, D - .3];
    const uit = p ? wandNormaal(p.wand).clone().multiplyScalar(1.35) : new THREE.Vector3(0, 0, -1.35);
    schuifLens(.58, 34);
    return vliegNaar(new THREE.Vector3(doel[0] + uit.x, 1.45, doel[1] + uit.z),
                     new THREE.Vector3(doel[0], 1.15, doel[1]));
  }
  if (naam === 'natcel') {
    // douche of bad, wat er staat; anders de achterwand
    const d = laatstePlaatsing.douche, b2 = laatstePlaatsing.bad;
    let x, z;
    if (d) { x = d.kant === 'rechts' ? B - d.w / 2 : d.w / 2; z = D - d.d / 2; }
    else if (b2) { x = b2.x; z = b2.z; }
    else { x = B * .5; z = D * .6; }
    schuifLens(.62, 42);
    /* Op afstand blijven van wat er getoond wordt, en binnen de ruimte. Met een
       vaste afstand belandde de camera in een kleine badkamer buiten de wand en
       keek je tegen de achterkant van je eigen douche aan. */
    const naar = new THREE.Vector3(x, 1.15, z);
    const weg = new THREE.Vector3(B / 2 - x, 0, D * .12 - z);
    if (weg.lengthSq() < .01) weg.set(0, 0, -1);
    weg.normalize().multiplyScalar(Math.min(2.6, Math.max(1.5, Math.max(B, D) * .62)));
    const van = new THREE.Vector3(
      Math.max(.22, Math.min(B - .22, x + weg.x)), 1.52,
      Math.max(.22, Math.min(D - .22, z + weg.z)));
    return vliegNaar(van, naar);
  }
  rechteLens();
  return overzicht();
}

/** Recht van boven: de plattegrond, om maten te beoordelen. */
function boven() {
  const t = midden();
  const R = Math.max(K.B, K.D) * 1.5 + 1.5;
  /* Helemaal loodrecht mag niet — de bediening kantelt dan om — dus staat de
     camera een fractie schuin. Die fractie moet wél recht naar achteren wijzen
     en niet over de hoek: met een gelijke uitwijking in x en z komt de ruimte
     scheef in beeld te liggen, en dan is het geen plattegrond meer. */
  const p = controls.minPolarAngle + .01;
  vliegNaar(new THREE.Vector3(t.x, t.y + R * Math.cos(p), t.z + R * Math.sin(p)), t);
}
function resetView() { overzicht(); }

function screenshot() {
  if (composer) composer.render(); else renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/jpeg', .92);
}

/* ---------- slepen ----------
   Iets verslepen in een badkamer is niet vrij slepen: alles staat tegen een
   wand. Dus wordt het punt onder de muis omgerekend naar de dichtstbijzijnde
   wand en de plek langs die wand, en dát gaat terug naar de configurator. Zo
   blijft de keuzelijst kloppen met wat er in beeld staat. */

const straal = new THREE.Raycaster();
const muis = new THREE.Vector2();

function straalVan(e) {
  const r = renderer.domElement.getBoundingClientRect();
  muis.set(((e.clientX - r.left) / r.width) * 2 - 1,
           -((e.clientY - r.top) / r.height) * 2 + 1);
  straal.setFromCamera(muis, camera);
  return straal;
}
function vloerPunt(e) {
  const p = new THREE.Vector3();
  return straalVan(e).ray.intersectPlane(sleepVlak, p) ? p : null;
}
function objectOnder(e) {
  const treffers = straalVan(e).intersectObjects(Object.values(sleepbaar), true);
  for (const t of treffers) {
    let o = t.object;
    while (o && !o.userData.sleutel) o = o.parent;
    if (o) return o;
  }
  return null;
}

/** Welke wand ligt het dichtst bij dit punt, en waar langs die wand. */
function dichtsteWand(p, breed) {
  const afstand = {
    links: p.x, rechts: K.B - p.x, achter: K.D - p.z, voor: p.z
  };
  let wand = 'achter', best = Infinity;
  WANDEN.forEach(w => { if (afstand[w] < best) { best = afstand[w]; wand = w; } });
  // de plek langs die wand, uit dezelfde omrekening maar dan andersom
  let l;
  if (wand === 'links' || wand === 'rechts') l = K.D - p.z;
  else if (wand === 'voor') l = K.B - p.x;
  else l = p.x;
  const lang = wandLengte(K, wand);
  const half = breed / 2 + .04;
  l = Math.max(half, Math.min(lang - half, l));
  return { wand, l };
}

/* ---------- botsingscontrole ----------
   Een plek langs de dichtstbijzijnde wand is nog geen vrije plek: er kan al
   iets anders staan, of er zit een deur in de weg. Elk voorwerp krijgt hier
   zijn eigen rechthoek op de vloer — axis-aligned, want een wand staat altijd
   haaks op zijn buren — en die wordt getoetst aan alle andere rechthoeken
   vóór een verplaatsing of draai wordt toegestaan. Dezelfde aanname als
   wandVlak() in tekening.js: bij een kwartslag wisselen breedte en diepte. */
const DIEPTE_BOTS = { wastafel: .46, toilet: .74, kolomkast: .35 };

/** De douche staat niet tegen een wand op een positie, maar in een hoek —
    linksachter of rechtsachter, nooit ertussenin. Dezelfde vorm als in
    tegelbeeld.js en tekening.js: hart van de kamer af, over de volle
    douchediepte tot aan de achterwand. */
function doucheRechthoek(kant, breedte, diepte) {
  const links = kant !== 'rechts';
  return { x0: links ? 0 : K.B - breedte, x1: links ? breedte : K.B,
           z0: K.D - diepte, z1: K.D };
}

function rechthoekVoor(wand, l, breedte, diepte, rotGraden) {
  let b = breedte, d = Math.max(diepte, .08);
  if (rotGraden === 90 || rotGraden === 270) { const t = b; b = d; d = t; }
  const a = wandPunt(K, wand, l - b / 2, 0);
  const z = wandPunt(K, wand, l + b / 2, d);
  return { x0: Math.min(a[0], z[0]), x1: Math.max(a[0], z[0]),
           z0: Math.min(a[1], z[1]), z1: Math.max(a[1], z[1]) };
}
function overlapt(r1, r2, marge) {
  const m = marge || 0;
  return r1.x0 < r2.x1 - m && r1.x1 > r2.x0 + m && r1.z0 < r2.z1 - m && r1.z1 > r2.z0 + m;
}
/** De rechthoeken van alles wat al staat, behalve het voorwerp dat zelf
    beweegt — inclusief douche, bad en de deur- en raamopeningen, die geen
    van alle zelf versleept kunnen worden maar wel in de weg zitten. */
function andereRechten(exclSleutel) {
  const pl = laatstePlaatsing || {}, uit = [];
  ['wastafel', 'toilet', 'kolomkast'].forEach(naam => {
    if (naam === exclSleutel) return;
    const it = pl[naam]; if (!it) return;
    const breedte = naam === 'kolomkast' ? it.breed : (it.w || it.breed);
    uit.push(rechthoekVoor(it.wand, it.l, breedte, DIEPTE_BOTS[naam], it.rot));
  });
  if (pl.douche && exclSleutel !== 'douche' && exclSleutel !== 'douchewand') {
    uit.push(doucheRechthoek(pl.douche.kant, pl.douche.w, pl.douche.d));
  }
  if (pl.bad && exclSleutel !== 'bad') {
    uit.push({ x0: pl.bad.x - pl.bad.rx, x1: pl.bad.x + pl.bad.rx,
               z0: pl.bad.z - pl.bad.rz, z1: pl.bad.z + pl.bad.rz });
  }
  (staat && staat.openingen || []).forEach(o => {
    uit.push(rechthoekVoor(o.wand, o.hart, o.breedte, o.soort === 'deur' ? .90 : .04, 0));
  });
  return uit;
}

/* Alleen een vrijstaand voorwerp zonder leidingwerk mag ook draaien: een
   wastafel en een toilet hangen aan het water en de afvoer van hún wand, en
   een kwartslag zou ze van hun aansluiting losdraaien. Een kolomkast en een
   bad hebben dat probleem niet — een bad heeft wel een aan- en afvoer, maar
   die zit los in de vloer en niet vast aan één kant van de kuip. */
const ROTEERBAAR = { kolomkast: true, bad: true };

/** Breedte en diepte zoals ze zouden zijn zónder de huidige draaiing — nodig
    om een ándere stand te kunnen toetsen. Voor de meeste voorwerpen zijn ze
    vast (ze horen bij het artikel); voor het bad hangen ze af van de
    badsoort en de kamer, en staat de huidige, al gedraaide maat in
    userData. Terugrekenen naar de ongedraaide maat is dan de enige manier om
    rechthoekVoor() daarna weer eerlijk te laten draaien. */
function kanoniekeMaat(d) {
  if (d.sleutel === 'bad') {
    return d.rot === 90 ? { breed: d.diepBad, diep: d.breed } : { breed: d.breed, diep: d.diepBad };
  }
  return { breed: d.breed, diep: DIEPTE_BOTS[d.sleutel] || .46 };
}

function bindSlepen() {
  const el = renderer.domElement;
  let neerX = 0, neerY = 0, bewogen = false;
  el.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    const o = objectOnder(e);
    if (!o) return;
    sleepObj = o;
    neerX = e.clientX; neerY = e.clientY; bewogen = false;
    controls.enabled = false;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('pointermove', e => {
    if (!sleepObj) {
      el.style.cursor = objectOnder(e) ? 'grab' : '';
      return;
    }
    if (Math.hypot(e.clientX - neerX, e.clientY - neerY) > 6) bewogen = true;
    if (!bewogen) return;
    const p = vloerPunt(e);
    if (!p) return;
    const d = sleepObj.userData;
    /* De douche kent geen positie langs een wand, alleen een hoek — links of
       rechts van het midden van de kamer — dus een eigen, veel eenvoudiger
       pad dat niet via dichtsteWand()/wandPunt('achter', l, ...) loopt. */
    if (d.sleutel === 'douchewand') {
      const dd = laatstePlaatsing && laatstePlaatsing.douche;
      if (!dd) return;
      const hoek = p.x < K.B / 2 ? 'links' : 'rechts';
      const rechthoek = doucheRechthoek(hoek, dd.w, dd.d);
      if (andereRechten('douche').some(r => overlapt(rechthoek, r, -.02))) {
        el.style.cursor = 'not-allowed';
        return;
      }
      el.style.cursor = 'grabbing';
      const hart = hoek === 'links' ? dd.w / 2 : K.B - dd.w / 2;
      const [x, z] = wandPunt(K, 'achter', hart, 0);
      sleepObj.position.set(x, 0, z);
      d.hoek = hoek;
      return;
    }
    const { wand, l } = dichtsteWand(p, d.breed);
    const maat = kanoniekeMaat(d);
    const rechthoek = rechthoekVoor(wand, l, maat.breed, maat.diep, d.rot);
    if (andereRechten(d.sleutel).some(r => overlapt(rechthoek, r, -.02))) {
      // hier mag het niet staan — blijft op de laatst geldige plek staan
      el.style.cursor = 'not-allowed';
      return;
    }
    el.style.cursor = 'grabbing';
    const [x, z] = wandPunt(K, wand, l, 0);
    sleepObj.position.set(x, 0, z);
    sleepObj.rotation.y = wandDraai(wand) + (d.rot || 0) * Math.PI / 180;
    d.wand = wand;
    d.l = l;
  });
  const klaar = e => {
    if (!sleepObj) return;
    const d = sleepObj.userData;
    if (d.sleutel === 'douchewand') {
      if (bewogen && d.hoek && Bad3D.onDoucheGeplaatst) Bad3D.onDoucheGeplaatst(d.hoek);
      else if (!bewogen && Bad3D.onGekozen) Bad3D.onGekozen(d.sleutel, e.clientX, e.clientY);
      sleepObj = null;
      controls.enabled = true;
      el.style.cursor = '';
      if (e.pointerId !== undefined && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      return;
    }
    if (!bewogen && ROTEERBAAR[d.sleutel]) {
      // een klik zonder sleep draait het voorwerp een kwartslag, als dat past
      const nieuweRot = ((d.rot || 0) + 90) % 360;
      const maat = kanoniekeMaat(d);
      const rechthoek = rechthoekVoor(d.wand, d.l, maat.breed, maat.diep, nieuweRot);
      if (!andereRechten(d.sleutel).some(r => overlapt(rechthoek, r, -.02))) {
        d.rot = nieuweRot;
        sleepObj.rotation.y = wandDraai(d.wand) + nieuweRot * Math.PI / 180;
        if (Bad3D.onGeplaatst) Bad3D.onGeplaatst(d.sleutel, d.wand, d.l, nieuweRot);
      }
    } else if (bewogen && Bad3D.onGeplaatst) {
      Bad3D.onGeplaatst(d.sleutel, d.wand, d.l, d.rot || 0);
    } else if (!bewogen && Bad3D.onGekozen) {
      Bad3D.onGekozen(d.sleutel, e.clientX, e.clientY);
    }
    sleepObj = null;
    controls.enabled = true;
    el.style.cursor = '';
    if (e.pointerId !== undefined && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };
  el.addEventListener('pointerup', klaar);
  el.addEventListener('pointercancel', klaar);
}

/* ---------- de lus ---------- */

function lus() {
  if (vlucht) {
    const t = Math.min(1, (performance.now() - vlucht.start) / VLUCHTTIJD);
    // rustig aanzetten en uitlopen; springen leest als een fout
    const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.lerpVectors(vlucht.vanP, vlucht.naarP, e);
    controls.target.lerpVectors(vlucht.vanT, vlucht.naarT, e);
    if (t >= 1) vlucht = null;
  }
  controls.update();
  wandenBijwerken();
  if (composer) composer.render(); else renderer.render(scene, camera);
}

window.Bad3D = Bad3D;
