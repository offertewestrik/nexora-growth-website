/* ============================================================
   NEXT GROWTH — meting.js
   Wat leverde welke pagina op?
   ============================================================

   WAAROM DIT BESTAAT
   De site meet paginaweergaven en snelheid (Vercel Web Analytics en Speed
   Insights, zie scripts/analytics.py). Wat er niet gemeten werd is de trechter
   ertussen: hoeveel bezoekers een configurator openen, hoeveel er bellen,
   hoeveel er een aanvraag afmaken, en via welke campagne of zoekopdracht die
   binnenkwamen. Zonder dat is niet te zeggen welke pagina omzet oplevert en
   welke alleen verkeer, en is elke keuze over content en budget een aanname.

   TWEE ROUTES, BEWUST
   1. Gebeurtenissen gaan naar de analytics die er staat. Welke dat is, weet
      dit bestand niet: het kijkt bij elke gebeurtenis of gtag, dataLayer,
      plausible of va bestaat en gebruikt wat er is. Staat er niets, dan valt
      er niets om. Wie later GA4 of Plausible aanzet, meet vanaf dat moment mee
      zonder dat hier iets verandert.
   2. De herkomst reist mee met de aanvraag zelf, naar /api/leads. Die route
      werkt altijd - ook zonder analytics, ook met een adblocker - en levert
      het enige cijfer dat echt telt: deze aanvraag kwam van die pagina, via
      die campagne. Dat is wat er in het CRM moet staan.

   PRIVACY
   Geen cookies, geen derde partij, geen persoonsgegevens, geen profiel over
   bezoeken heen. De herkomst staat in sessionStorage: hij hoort bij dit ene
   bezoek en is weg zodra het tabblad dicht gaat. Hij is er alleen om een
   aanvraag aan de pagina te kunnen koppelen waar hij vandaan komt.
   ============================================================ */
(function (window, document) {
  'use strict';

  var SLEUTEL = 'ng_herkomst';
  var VELDEN = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

  /* sessionStorage kan weigeren: privémodus, een browser die opslag blokkeert,
     een iframe zonder rechten. Dat mag de meting niet laten klappen en al
     helemaal niet het formulier eronder. */
  function lees() {
    try { return JSON.parse(window.sessionStorage.getItem(SLEUTEL) || 'null'); }
    catch (e) { return null; }
  }

  function schrijf(waarde) {
    try { window.sessionStorage.setItem(SLEUTEL, JSON.stringify(waarde)); }
    catch (e) { /* dan houden we hem alleen in het geheugen van deze pagina */ }
  }

  /* De eerste pagina van het bezoek bepaalt de herkomst, niet de laatste.
     Wie via een advertentie binnenkomt, drie pagina's verder klikt en dan pas
     het formulier invult, hoort bij die advertentie - niet bij "direct". */
  function bepaal() {
    var bestaand = lees();
    if (bestaand) return bestaand;

    var params = new URLSearchParams(window.location.search);
    var herkomst = {
      landingspagina: window.location.pathname,
      verwijzer: verwijzer(),
      begonnen: new Date().toISOString()
    };
    VELDEN.forEach(function (naam) {
      var waarde = params.get(naam);
      if (waarde) herkomst[naam] = String(waarde).slice(0, 120);
    });
    schrijf(herkomst);
    return herkomst;
  }

  /* Een verwijzer van het eigen domein zegt niets over herkomst - dat is de
     vorige pagina van hetzelfde bezoek. */
  function verwijzer() {
    var ref = document.referrer || '';
    if (!ref) return '';
    try {
      if (new URL(ref).host === window.location.host) return '';
    } catch (e) { /* geen geldige url: laat hem staan */ }
    return ref.slice(0, 300);
  }

  var herkomst = bepaal();

  /* ---------- gebeurtenissen ---------- */

  /* Elke aanwezige meter krijgt dezelfde gebeurtenis. Geen van de vier is
     verplicht; wat er niet is, wordt overgeslagen. */
  /* Een verzonden aanvraag gaat over meerdere kanalen tegelijk de deur uit, en
     sommige pagina's melden hem daarnaast zelf. Dat is een aanvraag, geen
     drie. Dus telt de eerste melding en worden de rest binnen dit tijdvak
     overgeslagen. Liever een keer te weinig dan een conversiecijfer dat
     meetelt hoeveel kanalen er toevallig aanstonden. */
  var VENSTER = 15000;
  var laatste = {};

  function gebeurtenis(naam, data) {
    if (naam.indexOf('aanvraag_') === 0) {
      var nu = Date.now();
      if (laatste[naam] && nu - laatste[naam] < VENSTER) return;
      laatste[naam] = nu;
    }
    var payload = data || {};
    payload.pagina = window.location.pathname;

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', naam, payload);
      }
      if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push(assign({ event: naam }, payload));
      }
      if (typeof window.plausible === 'function') {
        window.plausible(naam, { props: payload });
      }
      /* Vercel Web Analytics. Eigen gebeurtenissen zitten daar niet in elk
         plan; lukt het niet, dan is dat geen storing voor de rest. */
      if (typeof window.va === 'function') {
        window.va('event', { name: naam, data: payload });
      }
    } catch (e) { /* meten mag nooit de pagina breken */ }

    try {
      document.dispatchEvent(new CustomEvent('ng:meting', {
        detail: assign({ naam: naam }, payload)
      }));
    } catch (e) { /* oude browser zonder CustomEvent-constructor */ }
  }

  function assign(doel, bron) {
    Object.keys(bron || {}).forEach(function (k) { doel[k] = bron[k]; });
    return doel;
  }

  /* ---------- wat we vanzelf meten ---------- */

  /* Bellen en WhatsApp zijn op deze site geen bijzaak: de vaste balk onderin
     en het nummer in de kop zijn twee van de drie conversie-elementen. Een
     telefoongesprek is een lead die nooit langs een formulier komt, dus zonder
     deze twee lijkt een pagina die de telefoon laat rinkelen niets te doen. */
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      gebeurtenis('telefoon_klik', { nummer: href.replace('tel:', '') });
    } else if (href.indexOf('wa.me') > -1 || href.indexOf('whatsapp.com') > -1) {
      gebeurtenis('whatsapp_klik', {});
    }
  }, true);

  /* Een configurator telt als gestart zodra de bezoeker er iets in aanraakt -
     niet zodra de pagina laadt. Het verschil tussen "de pagina is bezocht" en
     "er is echt geconfigureerd" is precies waar de kwalificatie zit. Alle
     configurators delen dezelfde wortel .conf, dus dit werkt op alle negentien
     zonder dat er per pagina iets ingesteld hoeft te worden. */
  var conf = document.querySelector('.conf');
  if (conf) {
    var gestart = false;
    var start = function () {
      if (gestart) return;
      gestart = true;
      gebeurtenis('configurator_start', {});
    };
    conf.addEventListener('click', start, { passive: true });
    conf.addEventListener('change', start, { passive: true });
  }

  /* Een aanvraag telt pas als er een aanvraag is. Dat is niet aan de knop te
     zien - een formulier kan afbreken op een leeg veld - maar wel aan de
     aanroep die eruit vertrekt. Alle formulieren op deze site gaan naar
     dezelfde drie adressen, dus die zijn het signaal.

     Waarom hier en niet per pagina: zeventien configurators melden nu niets
     bij "Offerte aanvragen", en de achttiende die er bij komt zou het weer
     vergeten. Een pagina hoeft alleen dit bestand te laden; de meting hangt
     aan de route, niet aan de knop. Hetzelfde idee als configurator_start
     hierboven.

     Er wordt niets aan de aanroep veranderd: dezelfde argumenten gaan erin,
     dezelfde belofte komt eruit, ook als het meten zelf misgaat. */
  var LEADROUTES = ['formsubmit.co', 'api.web3forms.com', '/api/leads'];

  function isLead(url) {
    for (var i = 0; i < LEADROUTES.length; i++) {
      if (url.indexOf(LEADROUTES[i]) > -1) return true;
    }
    return false;
  }

  function adres(invoer) {
    try {
      if (typeof invoer === 'string') return invoer;
      if (invoer && typeof invoer.url === 'string') return invoer.url;   /* Request */
      return String(invoer || '');
    } catch (e) { return ''; }
  }

  if (typeof window.fetch === 'function') {
    var origineel = window.fetch;
    window.fetch = function (invoer, opties) {
      var lead = false;
      try { lead = isLead(adres(invoer)); } catch (e) { /* dan meten we niet */ }
      /* Tussentijds bewaren is geen aanvraag; die telt apart. */
      if (!lead || window.NGMetingStil) return origineel.apply(this, arguments);

      var bron = window.location.pathname.replace(/^\//, '') || 'home';
      try { gebeurtenis('aanvraag_verzonden', { bron: bron }); } catch (e) {}

      return origineel.apply(this, arguments).then(function (antwoord) {
        try {
          if (antwoord && antwoord.ok) gebeurtenis('aanvraag_bevestigd', { bron: bron });
        } catch (e) {}
        return antwoord;
      });
    };
  }

  window.NGMeting = {
    gebeurtenis: gebeurtenis,
    herkomst: function () { return assign({}, herkomst); }
  };

})(window, document);
