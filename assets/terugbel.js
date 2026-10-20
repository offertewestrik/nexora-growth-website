/* Terugbelverzoek — het formulier dat op elke verkooppagina staat.
 *
 * Drie velden: naam, bedrijf, telefoon. Meer niet. Het blok staat als gewone
 * HTML in de pagina en werkt zonder JavaScript via de mailto in het
 * action-attribuut. Dit bestand maakt er een nette verzending van naar
 * /api/leads, met dezelfde terugval als het contactformulier — draait de site
 * ergens statisch of ligt de functie eruit, dan opent de mailclient en gaat de
 * aanvraag nooit verloren.
 *
 * Eén bestand voor alle pagina's, zodat de flow op één plek verandert.
 */
(function (global) {
  'use strict';

  var TELEFOON = '+31683902192';
  var MAIL = 'info@nextgrowthdigital.nl';

  /* ------------------------------------------------------------------------
     WEB3FORMS-SLEUTEL — HIER PLAKKEN

     Haal een gratis sleutel op via web3forms.com op naam van
     info@nextgrowthdigital.nl. Je krijgt hem per e-mail; plak hem hieronder tussen
     de quotes en dat is alles.

     Deze sleutel hoort openbaar in de website te staan: dat is hoe Web3Forms
     werkt. Hij geeft alleen het recht om een formulier naar het gekoppelde
     adres te sturen, verder niets.

     Waarom hij hier staat: als /api/leads wegvalt - de functie stuk, geen
     enkele sleutel ingesteld, Vercel eruit - post de browser de aanvraag
     hiermee rechtstreeks naar Web3Forms. Dan is er geen server meer nodig om
     de aanvraag binnen te krijgen. Staat hij leeg, dan valt het formulier
     terug op mailto, en dat opent op een telefoon de mailapp.

     LET OP: gebruik niet de sleutel die in westrik-bouw staat. Die is
     geregistreerd op info@westrik-installaties.nl en de aanvragen komen dan
     bij een ander bedrijf binnen.
     ------------------------------------------------------------------------ */
  var WEB3FORMS_SLEUTEL = '695172ae-1f2d-40b7-bb31-b8a4a882ad62';

  /* De Engelstalige pagina's hebben hetzelfde blok met Engelse labels. De
     bevestiging na verzenden komt uit dit bestand, dus die moet meebewegen —
     anders krijgt iemand op de Engelse pagina een Nederlands antwoord. Het
     formulier zegt zelf welke taal het spreekt via data-taal. */
  var TEKST = {
    nl: {
      nummer: '06 83 90 21 92',
      bezig: 'Versturen\u2026',
      ontvangen: 'Verzoek ontvangen',
      bedankt: function (naam) {
        return 'Bedankt' + (naam ? ', ' + naam : '') + '. We bellen je terug.';
      },
      na: 'Je hoort dezelfde werkdag van ons. Kan het niet wachten? Bel zelf: ',
      mailkop: 'Terugbelverzoek',
      onderwerp: 'Terugbelverzoek: ',
      velden: ['Naam', 'Bedrijf', 'Telefoon', 'Aangevraagd via']
    },
    en: {
      nummer: '+31 6 83 90 21 92',
      bezig: 'Sending\u2026',
      ontvangen: 'Request received',
      bedankt: function (naam) {
        return 'Thanks' + (naam ? ', ' + naam : '') + '. We will call you back.';
      },
      na: 'You hear from us the same working day. Can\'t wait? Call us: ',
      mailkop: 'Callback request',
      onderwerp: 'Callback request: ',
      velden: ['Name', 'Company', 'Phone', 'Requested via']
    }
  };

  /* Eerst beschikbaar stellen, dán pas afhaken. Het contactformulier op
     contact.html heeft geen terugbelblok maar gebruikt wel deze route, en
     stond daardoor met lege handen: de vroege return hieronder werd bereikt
     voordat NGWeb3Forms bestond. */
  global.NGWeb3Forms = { sleutel: function () { return WEB3FORMS_SLEUTEL; }, verstuur: viaWeb3Forms };

  var formulieren = document.querySelectorAll('form[data-terugbel]');
  if (!formulieren.length || !window.fetch) return;

  Array.prototype.forEach.call(formulieren, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var knop = form.querySelector('.ng-terugbel__verstuur');
      var waarde = function (naam) {
        var el = form.elements[naam];
        return el ? String(el.value || '').trim() : '';
      };

      var naam = waarde('naam');
      var bedrijf = waarde('bedrijf');
      var telefoon = waarde('telefoon');
      var bron = form.getAttribute('data-bron') || location.pathname;
      var t = TEKST[form.getAttribute('data-taal') === 'en' ? 'en' : 'nl'];

      var data = {
        name: bedrijf ? naam + ' (' + bedrijf + ')' : naam,
        email: '',
        phone: telefoon,
        projectType: t.mailkop,
        message: t.mailkop + ' via ' + bron + '.\n' +
                 t.velden[2] + ': ' + telefoon,
        website: waarde('website'),
        /* De pagina stond tot nu toe alleen in de tekst van de mail. Als los
           veld is hij te tellen: welke pagina levert aanvragen op. */
        bron: bron,
        /* En waar die bezoeker vandaan kwam voordat hij op deze pagina
           belandde - campagne, zoekmachine, verwijzer. Zie assets/meting.js.
           Ontbreekt meting.js, dan blijft dit veld gewoon weg. */
        herkomst: window.NGMeting ? window.NGMeting.herkomst() : null
      };

      meet('aanvraag_verzonden', { bron: bron });

      var oudLabel = knop ? knop.textContent : '';
      if (knop) { knop.disabled = true; knop.textContent = t.bezig; }

      /* Blijft het antwoord uit, dan niet eindeloos wachten: na acht seconden
         valt het terug op mailto, net als op de contactpagina. */
      var afgehandeld = false;
      var wekker = setTimeout(function () {
        if (afgehandeld) return;
        afgehandeld = true;
        terugvalMailto();
      }, 8000);

      /* Beide routes tegelijk, want ze vangen verschillende storingen op:
         /api/leads levert af via de kanalen die in Vercel zijn ingesteld,
         Web3Forms werkt ook als er van die kanalen niets staat of als de
         functie zelf plat ligt. Eén geslaagde route is genoeg. Pas als ze
         allebei mislukken komt mailto in beeld. */
      Promise.all([
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) { return r.ok ? 'api' : null; }).catch(function () { return null; }),
        viaWeb3Forms(data)
      ]).then(function (uitkomsten) {
        return uitkomsten.filter(Boolean)[0] || null;
      }).then(function (via) {
        if (afgehandeld) return;
        afgehandeld = true;
        clearTimeout(wekker);
        if (!via) return terugvalMailto();
        meet('aanvraag_bevestigd', { bron: bron, via: via });
        toonBevestiging(naam);
      }).catch(function () {
        if (afgehandeld) return;
        afgehandeld = true;
        clearTimeout(wekker);
        terugvalMailto();
      });

      function toonBevestiging(naam) {
        var kaart = form.closest('.ng-terugbel__kaart');
        if (!kaart) { form.reset(); herstelKnop(); return; }
        var voornaam = naam.split(' ')[0] || '';
        kaart.innerHTML =
          '<div class="ng-terugbel__klaar">' +
            '<p class="ng-terugbel__kop"><span class="dot dot--ok" aria-hidden="true"></span>' +
              t.ontvangen + '</p>' +
            '<h3>' + t.bedankt(tekst(voornaam)) + '</h3>' +
            '<p>' + t.na + '<a href="tel:' + TELEFOON + '">' + t.nummer + '</a>.</p>' +
          '</div>';
        kaart.setAttribute('role', 'status');
      }

      function terugvalMailto() {
        /* Hier gaat een aanvraag in de praktijk verloren: op een telefoon
           opent dit de mailapp en komt er zelden nog een mail uit. Dat moet
           je kunnen zien, niet alleen in de functielog. */
        meet('aanvraag_terugval_mailto', { bron: bron });
        herstelKnop();
        var body = t.mailkop + '\n\n' +
                   t.velden[0] + ': ' + naam + '\n' +
                   t.velden[1] + ': ' + bedrijf + '\n' +
                   t.velden[2] + ': ' + telefoon + '\n\n' +
                   t.velden[3] + ': ' + bron;
        location.href = 'mailto:' + MAIL +
          '?subject=' + encodeURIComponent(t.onderwerp + (bedrijf || naam)) +
          '&body=' + encodeURIComponent(body);
      }

      function herstelKnop() {
        if (!knop) return;
        knop.disabled = false;
        knop.textContent = oudLabel;
      }
    });
  });

  /* Rechtstreeks naar Web3Forms, zonder tussenkomst van onze server. Geeft de
     naam van het kanaal terug bij succes en null als het niet lukt of als er
     geen sleutel is ingevuld. */
  function viaWeb3Forms(data) {
    if (!WEB3FORMS_SLEUTEL) return Promise.resolve(null);
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_SLEUTEL,
        subject: 'Aanvraag via nextgrowthdigital.nl: ' + String(data.name).slice(0, 80),
        from_name: 'nextgrowthdigital.nl',
        naam: data.name,
        email: data.email || '(niet opgegeven)',
        telefoon: data.phone || '(niet opgegeven)',
        soort: data.projectType,
        bericht: data.message,
        pagina: location.pathname
      })
    }).then(function (r) { return r.ok ? 'web3forms' : null; })
      .catch(function () { return null; });
  }

  /* Meten mag het formulier nooit in de weg zitten: staat meting.js er niet,
     of gaat er iets mis in de meter, dan gaat de aanvraag gewoon door. */
  function meet(naam, data) {
    try {
      if (window.NGMeting) window.NGMeting.gebeurtenis(naam, data);
    } catch (e) { /* stil */ }
  }

  /* De naam gaat als tekst terug de pagina in, nooit als opmaak. */
  function tekst(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

})(typeof window !== 'undefined' ? window : this);
