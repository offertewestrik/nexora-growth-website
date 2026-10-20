/* Eén configurator, veel bedrijven.
 *
 * Het gevaar bij dit soort producten is dat elke klant een eigen kopie van de
 * pagina krijgt. Dan is een fout herstellen veertig keer hetzelfde bestand
 * openen, en na een halfjaar durft niemand er meer aan. Dus: één pagina, één
 * motor, en per bedrijf alléén de verschillen in een klein bestand.
 *
 * Een bedrijf verschilt op vier punten van de demo, en op niet meer dan
 * die vier:
 *
 *   1. zijn merk        — naam, kleur, logo, telefoon, e-mail, en zijn
 *                         huisstijl (licht of donker, letter, knopvorm)
 *   2. zijn assortiment — wat hij niet verkoopt hoort er niet in te staan
 *   3. zijn prijzen     — marges lopen sterk uiteen; de demo staat op
 *                         marktgemiddelden
 *   4. zijn aanvragen   — die moeten bij hem binnenkomen, niet bij ons
 *
 * Het bedrijf wordt gekozen met ?bedrijf=slug of met data-bedrijf op <body>.
 * Staat er niets, dan draait de pagina als demo van Next Growth — dat is het
 * geval op onze eigen site.
 *
 * Aanhaken:
 *   <script src="./assets/merk.js"></script>   (vóór de configurator)
 *   NGMerk.klaar(function(m){ ... })           wachten tot het bedrijf er is
 *   NGMerk.prijs(groepId, optie, basisbedrag)  prijs na opslag en overschrijving
 *   NGMerk.toont(groepId, optieWaarde)         zit deze optie in het assortiment
 *   NGMerk.naamVan(sleutel, standaard)         eigen naam voor een optie
 *
 * In de pagina zetten deze attributen zichzelf zodra het bedrijf er is:
 *   data-merk-naam   de bedrijfsnaam
 *   data-merk-tel    telefoonnummer (ook op een <a> binnen het element)
 *   data-merk-mail   e-mailadres
 *   data-merk-site   link naar zijn site
 *   data-merk-logo   op een <img>: zijn logobestand
 * Met thema.modus = "licht" krijgt <html> data-thema="licht"; de regels
 * daarvoor staan in assets/merk-thema.css.
 * Met stappen: [groep-id's] staan alleen die keuzegroepen open (kort
 * formulier voor advertenties); de pagina krijgt data-kort op <html>.
 * Met prijzen: false ziet de bezoeker geen enkel bedrag (data-geen-prijs).
 * Met stapsgewijs: true wordt het een kaart met één vraag per keer, een
 * voortgangsbalk en Volgende; het formulier is de laatste stap
 * (data-stapsgewijs, zie assets/stappenkaart.js).
 * Met live: true verdwijnt de demonstratieregel boven de pagina.
 * Draait de pagina in een iframe op de site van het bedrijf, dan krijgt <html>
 * data-ingesloten en verdwijnen onze kopbalk en voet: die site heeft ze al.
 * Staat het bedrijf op status "opgeschort" of is geldig_tot verstreken, dan
 * krijgt <html> data-bedrijf-opgeschort, verdwijnt <main> en komt er een
 * melding met zijn eigen contactgegevens voor in de plaats.
 * Een veld dat het bedrijf niet heeft ingevuld verbergt zijn element.
 * Zie tenants/LEESMIJ.md.
 */
(function (global) {
  'use strict';

  var MAP = './tenants/';

  var merk = {
    slug: null,
    naam: 'Next Growth',
    demo: true,
    kleur: null,
    telefoon: null,
    email: null,
    site: null,
    logo: null,
    /* De huisstijl waarin de configurator draait. Zonder thema blijft hij
       zoals hij op onze eigen site staat: donker, goud, serif. Een bedrijf
       met een lichte site zet modus op 'licht' en geeft drie kleuren op;
       de rest wordt daaruit afgeleid. Zie zetThema. */
    thema: { modus: null, achtergrond: null, vlak: null, inkt: null,
             kopbalk: null, font: null, kopfont: null, knopvorm: null,
             knoptekst: null },
    prijs: { basisM2: null, opslag: 1, per: {} },
    assortiment: { verberg: [], hernoem: {} },
    aanvraag: { endpoint: null, email: null },
    /* Of het bedrijf de configurator mag draaien. De pagina staat op onze
       server en hij sluit hem alleen in, dus dit is de schakelaar: status
       'opgeschort' of een verstreken geldig_tot (JJJJ-MM-DD) en de bezoeker
       ziet een nette melding met zijn telefoonnummer in plaats van de
       configurator. Betaalt hij, dan gaat de datum een jaar vooruit. Zonder
       datum verloopt er niets. */
    status: 'actief',
    geldig_tot: null,
    /* Zolang een opzet een demonstratie is, staat er een regel boven de
       pagina die dat zegt. Gaat hij echt op zijn site, dan zet hij live op
       true en verdwijnt die regel. */
    live: false,
    /* Vanaf welke sites hij de configurator mag insluiten (iframe). Wordt
       door scripts/csp.py in de beveiligingsheaders gezet; de pagina zelf
       doet er niets mee. */
    insluiten: [],
    /* Kort formulier voor advertentieverkeer: alleen deze keuzegroepen
       staan open, de rest zit achter "meer opties" en rekent met de
       standaardkeuze mee. Leeg of weggelaten: alle groepen. */
    stappen: null,
    /* false: de bezoeker ziet geen enkel bedrag. Voor een bedrijf dat zijn
       prijs pas na het adviesgesprek geeft; de configurator wordt dan een
       ontwerp-en-aanvraagformulier. */
    prijzen: true,
    /* true: één keuzegroep per keer in een kaart naast het beeld, met een
       voortgangsbalk, Vorige en Volgende, en het formulier als laatste
       stap. Voor advertentieverkeer dat niet wil scrollen of zoeken. */
    stapsgewijs: false
  };

  /* Draait de pagina in een iframe op de site van het bedrijf? Dan heeft die
     site al een kop en een voet, en horen de onze er niet nog eens onder. */
  var ingesloten = false;
  try { ingesloten = global.self !== global.top; } catch (e) { ingesloten = true; }

  var wachters = [], geladen = false;

  function slugUit() {
    try {
      var q = new URLSearchParams(global.location.search).get('bedrijf');
      if (q) return q.toLowerCase().replace(/[^a-z0-9-]/g, '');
    } catch (e) { /* oude browser: dan maar via het body-attribuut */ }
    var b = document.body && document.body.getAttribute('data-bedrijf');
    return b ? b.toLowerCase().replace(/[^a-z0-9-]/g, '') : null;
  }

  function neem(doel, bron) {
    if (!bron) return;
    Object.keys(bron).forEach(function (k) {
      if (bron[k] && typeof bron[k] === 'object' && !Array.isArray(bron[k]) && doel[k]) {
        neem(doel[k], bron[k]);
      } else if (bron[k] !== undefined && bron[k] !== null) {
        doel[k] = bron[k];
      }
    });
  }

  /* De huisstijl in de bestaande variabelen zetten. De pagina is er al op
     gebouwd, dus één kleur omzetten kleurt de hele configurator om. */
  function zetKleur(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var s = document.documentElement.style;
    s.setProperty('--accent', hex);
    s.setProperty('--acc', hex);
    s.setProperty('--accent-dim', 'rgba(' + r + ',' + g + ',' + b + ',.15)');
    s.setProperty('--acc-soft', 'rgba(' + r + ',' + g + ',' + b + ',.15)');
    s.setProperty('--glow', 'rgba(' + r + ',' + g + ',' + b + ',.30)');
    // donkerder voor de hover-stand
    var d = function (x) { return Math.max(0, Math.round(x * .78)); };
    s.setProperty('--accent-strong',
      'rgb(' + d(r) + ',' + d(g) + ',' + d(b) + ')');
  }

  function hexNaarRgb(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return null;
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

  /* De huisstijl van het bedrijf. De pagina is op CSS-variabelen gebouwd,
     dus een licht palet is in de kern drie kleuren: de achtergrond, het vlak
     waarmee een sectie of kaart zich daarvan onderscheidt, en de inkt. Tekst
     in twee lichtere tinten en de lijnen worden uit de inkt afgeleid, zodat
     een bedrijf niet twaalf kleuren hoeft op te geven die bij elkaar moeten
     passen. Wat CSS-variabelen niet kunnen — de serifkop, het goudverloop op
     de knoppen, de donkere waas achter het beeld — staat in merk-thema.css
     onder html[data-thema="licht"]. */
  function zetThema(t) {
    if (!t) return;
    var root = document.documentElement, s = root.style;
    var fontstapel = ', "Inter", "Inter fallback", system-ui, -apple-system, sans-serif';
    if (t.font) s.setProperty('--font', '"' + t.font + '"' + fontstapel);
    if (t.kopfont || t.font) s.setProperty('--kopfont', '"' + (t.kopfont || t.font) + '"' + fontstapel);
    if (t.knopvorm) s.setProperty('--merk-radius', t.knopvorm === 'pil' ? '999px' : t.knopvorm === 'hoekig' ? '4px' : '12px');
    if (t.knoptekst) s.setProperty('--merk-knoptekst', t.knoptekst);
    if (t.modus !== 'licht') return;

    var bg = hexNaarRgb(t.achtergrond) ? t.achtergrond : '#FFFFFF';
    var vlak = hexNaarRgb(t.vlak) ? t.vlak : '#F4F4F2';
    var inktHex = hexNaarRgb(t.inkt) ? t.inkt : '#15201F';
    var inkt = hexNaarRgb(inktHex);
    var kopbalk = hexNaarRgb(t.kopbalk) ? t.kopbalk : inktHex;

    s.setProperty('--bg', bg);
    s.setProperty('--bg-raise', bg);
    s.setProperty('--bg-raise-2', vlak);
    s.setProperty('--tint', vlak);
    /* De inktschaal van core.css: invoervelden worden met --ink-800 gevuld en
       met --ink-400 omrand. Zonder deze regels staat donkere tekst op een
       bijna zwart vlak. */
    s.setProperty('--ink-900', vlak);
    s.setProperty('--ink-800', bg);
    s.setProperty('--ink-700', vlak);
    s.setProperty('--ink-600', bg);
    s.setProperty('--ink-500', bg);
    s.setProperty('--ink-400', rgba(inkt, .18));
    s.setProperty('--text', inktHex);
    s.setProperty('--text-2', rgba(inkt, .74));
    s.setProperty('--text-3', rgba(inkt, .56));
    s.setProperty('--line', rgba(inkt, .10));
    s.setProperty('--line-strong', rgba(inkt, .18));
    s.setProperty('--schaduw-1', '0 1px 2px ' + rgba(inkt, .06));
    s.setProperty('--schaduw-2', '0 2px 4px ' + rgba(inkt, .05) + ', 0 10px 24px -8px ' + rgba(inkt, .14));
    s.setProperty('--schaduw-3', '0 4px 8px ' + rgba(inkt, .05) + ', 0 16px 32px -10px ' + rgba(inkt, .18) + ', 0 32px 64px -24px ' + rgba(inkt, .18));
    s.setProperty('--merk-kopbalk', kopbalk);
    s.setProperty('--merk-kopbalk-tekst', '#FFFFFF');
    root.setAttribute('data-thema', 'licht');
  }

  function zetNaam(naam) {
    document.querySelectorAll('[data-merk-naam]').forEach(function (el) {
      el.textContent = naam;
    });
    if (document.title.indexOf('Next Growth') >= 0) {
      document.title = document.title.replace('Next Growth', naam);
    }
  }

  /* De overige merkvelden in de pagina zetten. Alleen elementen die er zelf om
     vragen worden aangeraakt: staat het attribuut er niet, dan gebeurt er
     niets. Een veld dat het bedrijf niet heeft ingevuld blijft leeg en wordt
     verborgen — een telefoonnummer van iemand anders tonen is erger dan geen
     telefoonnummer tonen. */
  function zetVeld(attr, waarde, href) {
    document.querySelectorAll('[' + attr + ']').forEach(function (el) {
      if (!waarde) { el.hidden = true; return; }
      el.hidden = false;
      if (el.tagName === 'IMG') { el.src = waarde; return; }
      /* Het merkteken mag ook om een zinnetje heen staan ("Liever bellen?
         <a>nummer</a>."). Dan blijft de zin staan — die is van de pagina — en
         krijgt alleen de link erbinnen het nummer en het adres. Zo verdwijnt
         bij een bedrijf zonder telefoonnummer de hele zin, in plaats van dat
         er "Liever bellen? ." overblijft. */
      var vast = el.hasAttribute('data-merk-vast');
      var a = (el.tagName === 'A') ? el : el.querySelector('a');
      if (href && a) a.setAttribute('href', href + waarde);
      if (!vast) el.textContent = waarde;
      else if (a && a !== el) a.textContent = waarde;
    });
  }

  function zetVelden() {
    zetVeld('data-merk-tel', merk.telefoon, 'tel:');
    zetVeld('data-merk-mail', merk.email, 'mailto:');
    zetVeld('data-merk-logo', merk.logo, null);
    document.querySelectorAll('[data-merk-site]').forEach(function (el) {
      if (!merk.site) { el.hidden = true; return; }
      el.hidden = false;
      el.setAttribute('href', merk.site);
      if (!el.textContent.trim()) {
        el.textContent = merk.site.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
    });
  }

  /* Mag dit bedrijf de configurator draaien? Vergeleken op de lokale datum,
     zodat een licentie tot en met 31 december ook op 31 december nog werkt. */
  function actief() {
    if (merk.status === 'opgeschort') return false;
    var tot = merk.geldig_tot;
    if (tot && /^\d{4}-\d{2}-\d{2}$/.test(tot)) {
      var d = new Date();
      var vandaag = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
      if (vandaag > tot) return false;
    }
    return true;
  }

  /* De configurator uit, de huisstijl aan. De bezoeker komt op zijn site en
     ziet zijn naam, zijn kleur en zijn telefoonnummer, met de mededeling dat
     samenstellen even niet kan. Niets over facturen: dat is iets tussen ons
     en het bedrijf, niet iets voor zijn klanten. De pagina zelf blijft in de
     DOM maar wordt verborgen, zodat geen enkel script hoeft te weten dat er
     een pauze is. */
  function zetOpgeschort() {
    var root = document.documentElement;
    root.setAttribute('data-bedrijf-opgeschort', '');
    var css = document.createElement('style');
    css.textContent =
      'html[data-bedrijf-opgeschort] main{display:none!important}' +
      '.merk-pauze{min-height:60vh;display:grid;place-items:center;text-align:center;' +
      'padding:clamp(3rem,10vh,6rem) 1.25rem;background:var(--bg);color:var(--text-2);line-height:1.6}' +
      '.merk-pauze__kop{font-family:var(--kopfont,var(--font));font-size:clamp(1.5rem,3.6vw,2.4rem);' +
      'font-weight:700;letter-spacing:-.02em;color:var(--text);max-width:22ch;margin:0 auto .9rem}' +
      '.merk-pauze p{max-width:46ch;margin:0 auto;font-size:1.02rem}' +
      '.merk-pauze a{color:var(--acc);font-weight:600;text-decoration:none}';
    document.head.appendChild(css);

    var blok = document.createElement('section');
    blok.className = 'merk-pauze';
    blok.setAttribute('role', 'status');
    var in_ = document.createElement('div');
    var kop = document.createElement('p');
    kop.className = 'merk-pauze__kop';
    kop.textContent = merk.demo
      ? 'De configurator is tijdelijk niet beschikbaar.'
      : 'De configurator van ' + merk.naam + ' is tijdelijk niet beschikbaar.';
    in_.appendChild(kop);
    if (merk.telefoon || merk.email) {
      var p = document.createElement('p');
      p.appendChild(document.createTextNode('Een offerte aanvragen kan gewoon: '));
      if (merk.telefoon) {
        p.appendChild(document.createTextNode('bel '));
        var a = document.createElement('a'); a.href = 'tel:' + merk.telefoon; a.textContent = merk.telefoon;
        p.appendChild(a);
      }
      if (merk.telefoon && merk.email) p.appendChild(document.createTextNode(' of '));
      if (merk.email) {
        p.appendChild(document.createTextNode('mail '));
        var b = document.createElement('a'); b.href = 'mailto:' + merk.email; b.textContent = merk.email;
        p.appendChild(b);
      }
      p.appendChild(document.createTextNode('.'));
      in_.appendChild(p);
    }
    blok.appendChild(in_);
    var main = document.querySelector('main');
    if (main && main.parentNode) main.parentNode.insertBefore(blok, main);
    else document.body.appendChild(blok);
  }

  function toepassen() {
    if (merk.kleur) zetKleur(merk.kleur);
    if (!merk.demo) zetThema(merk.thema);
    if (!merk.demo) {
      zetNaam(merk.naam);
      zetVelden();
      document.documentElement.setAttribute('data-bedrijf', merk.slug || '');
      if (ingesloten) document.documentElement.setAttribute('data-ingesloten', '');
      merk.opgeschort = !actief();
      if (merk.opgeschort) zetOpgeschort();
    }
    geladen = true;
    document.documentElement.removeAttribute('data-merk-laden');
    wachters.splice(0).forEach(function (f) { f(merk); });
  }

  function laad() {
    var slug = slugUit();
    if (!slug) { toepassen(); return; }
    merk.slug = slug;
    fetch(MAP + slug + '.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('geen bedrijf ' + slug);
        return r.json();
      })
      .then(function (d) {
        neem(merk, d);
        merk.demo = false;
        toepassen();
      })
      .catch(function () {
        if (global.console) console.warn('[merk] onbekend bedrijf: ' + slug);
        /* In een kader op de site van een bedrijf mag onze eigen demo nooit
           verschijnen: dan staat onze navigatie en ons telefoonnummer op
           zíjn pagina. Eerst nog één keer proberen (een haperend netwerk),
           daarna een neutrale melding zonder merk. Zo is het bestand
           weghalen ook een harde uit-knop. */
        if (ingesloten && !opnieuw) {
          opnieuw = true;
          global.setTimeout(laad, 1500);
          return;
        }
        document.documentElement.removeAttribute('data-merk-laden');
        if (ingesloten) {
          document.documentElement.setAttribute('data-bedrijf', '');
          zetOpgeschort();
          // Neutraal, want we weten niet in wiens huisstijl we staan: wit
          // past op vrijwel elke site, onze donkere achtergrond op geen.
          document.body.style.background = '#fff';
          var bl = document.querySelector('.merk-pauze');
          if (bl) { bl.style.background = '#fff'; bl.style.color = '#555'; }
          var kp = document.querySelector('.merk-pauze__kop');
          if (kp) kp.style.color = '#222';
          merk.opgeschort = true;
          geladen = true;
          wachters.splice(0);
          return;
        }
        // Los geopend (onze eigen site): dan de demo, en niet een halve pagina.
        merk.slug = null;
        toepassen();
      });
  }
  var opnieuw = false;

  global.NGMerk = {
    /* Wacht tot het bedrijf geladen is. Roept meteen terug als dat al zo is. */
    klaar: function (fn) {
      if (geladen) fn(merk); else wachters.push(fn);
    },
    merk: function () { return merk; },

    /* Prijs van één optie. Eerst een eigen bedrag als dat er is, anders het
       richtbedrag maal de opslag van het bedrijf. Zo hoeft een badkamerzaak
       niet honderd bedragen in te vullen om te beginnen: één opslagfactor is
       genoeg, en wat daarna niet klopt zet hij per optie recht. */
    prijs: function (groep, optie, basis) {
      var eigen = merk.prijs.per[groep + ':' + optie];
      if (typeof eigen === 'number') return eigen;
      return (basis || 0) * (merk.prijs.opslag || 1);
    },
    basisM2: function (standaard) {
      return typeof merk.prijs.basisM2 === 'number' ? merk.prijs.basisM2 : standaard;
    },

    /* Verkoopt dit bedrijf deze optie? Wat hij niet levert hoort er niet te
       staan: een keuze die later "die voeren wij niet" oplevert is erger dan
       een keuze die er nooit was. */
    toont: function (groep, optie) {
      return merk.assortiment.verberg.indexOf(groep + ':' + optie) < 0;
    },
    /* Een eigen naam voor een optie of groep, bijvoorbeeld een serienaam. */
    naamVan: function (sleutel, standaard) {
      return merk.assortiment.hernoem[sleutel] || standaard;
    },

    /* Waar de aanvraag heen moet. */
    aanvraag: function () { return merk.aanvraag; },
    /* Draait de configurator voor dit bedrijf, of staat hij op pauze? */
    actief: function () { return merk.demo || !merk.opgeschort; },
    /* Staat de pagina in een iframe op de site van het bedrijf? */
    ingesloten: function () { return ingesloten; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', laad);
  } else {
    laad();
  }
})(window);
