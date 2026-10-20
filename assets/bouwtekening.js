/* Bouwtekening uploaden voor de balkberekening DB-01.
 *
 * De voordimensionering (staalligger.js) rekent standaard met aannamen. Deze
 * module vervangt die aannamen waar het kan door de werkelijke maten: de
 * bezoeker uploadt de bestaande tekening van zijn woning, de Edge Function
 * tekening-analyse leest de maten af, en de bezoeker krijgt ze hier terug
 * ter bevestiging — per veld met de herkomst erbij (uit de tekening, onzeker
 * gelezen, of aanname). Niets gaat ongecontroleerd de berekening in: zonder
 * vinkje "gecontroleerd" is er geen rapport.
 *
 * Het resultaat blijft een voordimensionering TER CONTROLE CONSTRUCTEUR.
 * Betere invoer maakt het dossier vollediger, niet gewaarmerkt.
 *
 * Staat de leesfunctie nog niet aan (geen sleutel op de server), dan zegt de
 * module dat en werkt hetzelfde formulier als handmatige invoer — de
 * berekening zelf draait volledig in de browser.
 */
(function (global) {
  'use strict';

  var BACKEND = {
    url: 'https://numqnwpkvlcxtvkiytmi.supabase.co',
    fn: 'tekening-analyse',
    key: 'sb_publishable_r-yX9wBX2UaM8iIXdjciJA_1AGlZ6qC'
  };
  var MAX_MB = 12;      // foto's en scans; PDF's zijn vrijwel altijd kleiner
  var MAX_PX = 2200;    // hoger dan bij sfeerfoto's: maatcijfers moeten leesbaar blijven

  var T = {
    titel: 'Balkberekening DB-01',
    sub: 'Voordimensionering van de stalen ligger boven de doorbraak, ter controle door een constructeur.',
    keuzeTek: 'Met je bouwtekening',
    keuzeTekUit: 'Upload de bestaande tekening van je woning. De maten worden eruit gelezen en jij controleert ze. De berekening rekent dan met je werkelijke situatie in plaats van aannamen.',
    keuzeZonder: 'Zonder tekening',
    keuzeZonderUit: 'De velden staan vooraf ingevuld met veilige aannamen op basis van je samenstelling. Je controleert ze en past aan wat bij jou anders is.',
    drop: 'Sleep je bouwtekening hierheen',
    dropSub: 'of klik om te kiezen · PDF, JPG of PNG',
    privacy: 'De tekening wordt alleen gebruikt om de maten af te lezen en wordt niet opgeslagen.',
    lezen: 'De tekening wordt gelezen…',
    lezenSub: 'Alleen wat er werkelijk op staat wordt overgenomen. Wat onzeker leest, wordt gemarkeerd in plaats van gegokt.',
    kopBevestig: 'Controleer de gelezen waarden',
    subBevestig: 'Alles wat uit de tekening komt moet je bevestigen. Gemarkeerde waarden zijn onzeker gelezen: pas ze aan waar nodig.',
    kopZelf: 'Vul de maten in',
    subZelf: 'De velden staan op de standaard-aannamen. Pas ze aan naar je werkelijke situatie.',
    nogUit: 'Het automatisch uitlezen staat nog niet aan; er is niets verstuurd of opgeslagen. Vul de maten hieronder zelf in; de berekening werkt gewoon.',
    leesFout: 'De tekening kon niet betrouwbaar gelezen worden. Vul de maten hieronder zelf in.',
    geenBestand: 'Dat bestand is geen afbeelding of PDF.',
    teGroot: 'Dat bestand is groter dan ' + MAX_MB + ' MB. Kies een kleinere scan of foto.',
    akkoord: 'Ik heb deze waarden gecontroleerd tegen mijn tekening en situatie.',
    maak: 'Maak de voordimensionering',
    terug: 'Terug',
    voet: 'Dit is een voordimensionering, geen gewaarmerkte constructieberekening. Controle en waarmerking door een constructeur is vereist voor vergunning en uitvoering.'
  };

  /* Herkomst per veld. 'tekening' en 'onzeker' komen van de leesfunctie,
     'aanname' is de standaardwaarde, 'bevestigd' betekent: door de bezoeker
     zelf ingevuld of aangepast. */
  var TAG = {
    tekening: { tekst: 'uit je tekening', cls: 'tek' },
    onzeker: { tekst: 'controleren: onzeker gelezen', cls: 'warn' },
    aanname: { tekst: 'aanname', cls: 'aan' },
    bevestigd: { tekst: 'door jou ingevuld', cls: 'zelf' }
  };

  var VELDEN = [
    { id: 'overspanning', label: 'Overspanning ligger', hint: 'dagmaat doorbraak + 0,30 m oplegging', soort: 'getal', eenheid: 'm' },
    { id: 'belastingbreedte', label: 'Belastingbreedte', hint: 'helft van de vloeroverspanning die op deze gevel draagt', soort: 'getal', eenheid: 'm' },
    { id: 'watErboven', label: 'Wat staat erboven', soort: 'keuze',
      opties: [['dak', 'Alleen dak'], ['verdieping-plus-dak', 'Eén verdieping + dak'], ['meer', 'Meer dan één verdieping']] },
    { id: 'vloertype', label: 'Vloertype verdieping', soort: 'keuze',
      opties: [['hout', 'Houten vloer'], ['beton', 'Betonvloer']] },
    { id: 'muurdikte', label: 'Muurdikte gevel', hint: 'bijv. 0,21', soort: 'getal', eenheid: 'm' },
    { id: 'muurHoogteBoven', label: 'Metselwerk boven de opening', hint: 'hoogte tot vloer of dak', soort: 'getal', eenheid: 'm' },
    /* Oplegging: op het overblijvende metselwerk (standaard) of op twee
       pendelkolommen wanneer de hele gevelbreedte opengaat. De twee velden
       eronder verschijnen alleen in portaalmodus. */
    { id: 'oplegging', label: 'Waar ligt de ligger op', hint: 'kies kolommen wanneer de hele breedte opengaat en er geen muurdam overblijft', soort: 'keuze',
      opties: [['muur', 'Op het metselwerk'], ['portaal', 'Op stalen kolommen']] },
    { id: 'kolomHoogte', label: 'Kolomhoogte', hint: 'van vloer tot onderkant ligger', soort: 'getal', eenheid: 'm', bij: 'portaal' },
    { id: 'portaalStabiliteit', label: 'Het portaal moet zelf de gevel stabiliseren: er blijven geen dragende muurdelen of stabiliteitswanden naast de opening over', soort: 'vink', bij: 'portaal' },
    { id: 'puntlast', label: 'Er draagt een kolom of andere ligger op dit geveldeel af', soort: 'vink' }
  ];

  var cfg = null;       // standaardinvoer uit de configurator (staalligger.init)
  var waarschuwingen = [];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function getal(s) { var n = Number(String(s).replace(',', '.')); return isFinite(n) ? n : null; }

  /* ---------- opmaak ---------- */

  var CSS = [
    '.ngbt-achter{position:fixed;inset:0;z-index:900;background:rgba(10,10,12,.58);display:flex;align-items:center;justify-content:center;padding:1rem}',
    '.ngbt{background:#fff;color:#1a1a1a;border-radius:14px;max-width:660px;width:100%;max-height:92vh;overflow:auto;box-shadow:0 18px 60px rgba(0,0,0,.35);font-family:inherit}',
    '.ngbt-kop{padding:1.3rem 1.5rem 1rem;border-bottom:1px solid rgba(0,0,0,.09);display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}',
    // de site zelf is donker met lichte koppen; op dit witte paneel moeten
    // koppen en tekst hun eigen kleur afdwingen
    '.ngbt h3,.ngbt h4,.ngbt b{color:#1a1a1a}',
    '.ngbt-kop h3{margin:0 0 .3rem;font-size:1.25rem}',
    '.ngbt-kop p{margin:0;color:#6b6b66;font-size:.88rem;line-height:1.5;max-width:34rem}',
    '.ngbt-x{background:none;border:0;font-size:1.5rem;line-height:1;cursor:pointer;color:#6b6b66;padding:.2rem .4rem}',
    '.ngbt-lijf{padding:1.2rem 1.5rem 1.4rem}',
    '.ngbt-keuze{display:grid;gap:.8rem}',
    '.ngbt-kaart{border:1px solid rgba(0,0,0,.14);border-radius:11px;padding:1rem 1.1rem;text-align:left;background:#fff;cursor:pointer;font:inherit;transition:border-color .15s}',
    '.ngbt-kaart:hover{border-color:#FFC400}',
    '.ngbt-kaart b{display:block;margin-bottom:.3rem;font-size:1rem}',
    '.ngbt-kaart span{color:#6b6b66;font-size:.86rem;line-height:1.5;display:block}',
    '.ngbt-drop{border:2px dashed rgba(0,0,0,.2);border-radius:11px;padding:2rem 1.2rem;text-align:center;cursor:pointer;transition:border-color .15s,background .15s}',
    '.ngbt-drop.over{border-color:#FFC400;background:rgba(255,196,0,.07)}',
    '.ngbt-drop b{display:block;margin-bottom:.3rem}',
    '.ngbt-drop span{color:#6b6b66;font-size:.86rem}',
    '.ngbt-privacy{margin:.7rem 0 0;font-size:.8rem;color:#6b6b66}',
    '.ngbt-bezig{text-align:center;padding:2.2rem 1rem}',
    '.ngbt-spin{width:34px;height:34px;border:3px solid rgba(0,0,0,.14);border-top-color:#FFC400;border-radius:50%;margin:0 auto .9rem;animation:ngbtdraai .9s linear infinite}',
    '@keyframes ngbtdraai{to{transform:rotate(360deg)}}',
    '.ngbt-bezig b{display:block;margin-bottom:.35rem}',
    '.ngbt-bezig span{color:#6b6b66;font-size:.86rem}',
    '.ngbt-melding{margin:0 0 1rem;padding:.7rem .9rem;border-radius:9px;background:rgba(255,196,0,.12);border:1px solid rgba(255,196,0,.4);font-size:.86rem;line-height:1.5}',
    '.ngbt-veld{display:grid;grid-template-columns:1fr auto;gap:.2rem .8rem;align-items:center;padding:.55rem 0;border-bottom:1px solid rgba(0,0,0,.07)}',
    '.ngbt-veld label{font-size:.92rem;font-weight:600}',
    '.ngbt-hint{grid-column:1;color:#6b6b66;font-size:.78rem}',
    '.ngbt-veld input[type=text],.ngbt-veld select{width:9.5rem;padding:.42rem .55rem;border:1px solid rgba(0,0,0,.22);border-radius:7px;font:inherit;font-size:.92rem}',
    '.ngbt-eenheid{margin-left:.3rem;color:#6b6b66;font-size:.85rem}',
    '.ngbt-tag{grid-column:2;justify-self:end;font-size:.72rem;letter-spacing:.03em;padding:.14rem .5rem;border-radius:5px;white-space:nowrap}',
    '.ngbt-tag.tek{background:rgba(46,107,57,.12);color:#2e6b39}',
    '.ngbt-tag.warn{background:rgba(163,91,22,.13);color:#a35b16;font-weight:700}',
    '.ngbt-tag.aan{background:rgba(0,0,0,.07);color:#555}',
    '.ngbt-tag.zelf{background:rgba(37,74,116,.1);color:#254a74}',
    '.ngbt-toel{grid-column:1/-1;margin:0;font-size:.78rem;color:#6b6b66;font-style:italic}',
    '.ngbt-vink{display:flex;gap:.55rem;align-items:flex-start;margin:1rem 0 .4rem;font-size:.9rem;line-height:1.45}',
    '.ngbt-vink input{margin-top:.2rem}',
    '.ngbt-acties{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1rem}',
    '.ngbt-btn{background:#FFC400;border:0;border-radius:9px;padding:.7rem 1.15rem;font:inherit;font-weight:700;cursor:pointer}',
    '.ngbt-btn[disabled]{opacity:.45;cursor:not-allowed}',
    '.ngbt-ghost{background:none;border:1px solid rgba(0,0,0,.22);border-radius:9px;padding:.7rem 1.15rem;font:inherit;cursor:pointer}',
    '.ngbt-voet{margin:1.1rem 0 0;padding-top:.9rem;border-top:1px solid rgba(0,0,0,.09);font-size:.78rem;color:#6b6b66;line-height:1.5}',
    '.ngbt-waarsch{margin:.8rem 0 0;padding-left:1.1rem;font-size:.82rem;color:#a35b16}',
    '.ngbt-waarsch li{margin:.2rem 0}'
  ].join('');

  function zetCss() {
    if ($('ngbt-css')) return;
    var st = document.createElement('style');
    st.id = 'ngbt-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- paneel ---------- */

  function sluit() {
    var el = $('ngbt-achter');
    if (el) el.parentNode.removeChild(el);
  }

  function paneel(inhoud) {
    sluit();
    var achter = document.createElement('div');
    achter.className = 'ngbt-achter'; achter.id = 'ngbt-achter';
    achter.innerHTML =
      '<div class="ngbt" role="dialog" aria-label="' + esc(T.titel) + '">' +
        '<div class="ngbt-kop"><div><h3>' + esc(T.titel) + '</h3><p>' + esc(T.sub) + '</p></div>' +
        '<button type="button" class="ngbt-x" id="ngbt-x" aria-label="Sluiten">×</button></div>' +
        '<div class="ngbt-lijf" id="ngbt-lijf">' + inhoud + '</div>' +
      '</div>';
    document.body.appendChild(achter);
    achter.addEventListener('click', function (e) { if (e.target === achter) sluit(); });
    $('ngbt-x').addEventListener('click', sluit);
  }

  function stapKeuze() {
    paneel(
      '<div class="ngbt-keuze">' +
        '<button type="button" class="ngbt-kaart" id="ngbt-metTek"><b>' + esc(T.keuzeTek) + '</b><span>' + esc(T.keuzeTekUit) + '</span></button>' +
        '<button type="button" class="ngbt-kaart" id="ngbt-zonder"><b>' + esc(T.keuzeZonder) + '</b><span>' + esc(T.keuzeZonderUit) + '</span></button>' +
      '</div>' +
      '<p class="ngbt-voet">' + esc(T.voet) + '</p>'
    );
    $('ngbt-metTek').addEventListener('click', stapUpload);
    /* Ook zonder tekening langs het formulier: de bezoeker ziet de aannamen
       en kan kiezen voor een pendelportaal in plaats van oplegging op muur. */
    $('ngbt-zonder').addEventListener('click', function () { stapForm(null, null); });
  }

  function stapUpload() {
    paneel(
      '<div class="ngbt-drop" id="ngbt-drop"><b>' + esc(T.drop) + '</b><span>' + esc(T.dropSub) + '</span></div>' +
      '<p class="ngbt-privacy">' + esc(T.privacy) + '</p>' +
      '<p class="ngbt-privacy" id="ngbt-fout" style="color:#b4342c;display:none"></p>' +
      '<div class="ngbt-acties"><button type="button" class="ngbt-ghost" id="ngbt-terug">' + esc(T.terug) + '</button></div>'
    );
    $('ngbt-terug').addEventListener('click', stapKeuze);

    var invoer = document.createElement('input');
    invoer.type = 'file';
    invoer.accept = 'image/jpeg,image/png,image/webp,application/pdf';
    invoer.addEventListener('change', function () {
      if (invoer.files && invoer.files[0]) neem(invoer.files[0]);
      invoer.value = '';
    });
    var drop = $('ngbt-drop');
    drop.addEventListener('click', function () { invoer.click(); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault(); drop.classList.remove('over');
        if (ev === 'drop' && e.dataTransfer && e.dataTransfer.files[0]) neem(e.dataTransfer.files[0]);
      });
    });

    function fout(t) { var f = $('ngbt-fout'); f.style.display = 'block'; f.textContent = t; }
    function neem(file) {
      var pdf = file.type === 'application/pdf';
      if (!pdf && (!file.type || file.type.indexOf('image/') !== 0)) return fout(T.geenBestand);
      if (file.size > MAX_MB * 1024 * 1024) return fout(T.teGroot);
      if (pdf) {
        var fr = new FileReader();
        fr.onerror = function () { fout(T.geenBestand); };
        fr.onload = function () { verstuur(fr.result); };
        fr.readAsDataURL(file);
      } else {
        verklein(file).then(verstuur)['catch'](function () { fout(T.geenBestand); });
      }
    }
  }

  /* Foto's en scans verkleinen vóór verzending — maar minder agressief dan
     bij sfeerfoto's: de maatcijfers op een A3-plattegrond moeten na het
     schalen nog leesbaar zijn voor het leesmodel. */
  function verklein(file) {
    return new Promise(function (klaar, mis) {
      var af = function (bron) {
        var s = Math.min(1, MAX_PX / Math.max(bron.width, bron.height));
        var c = document.createElement('canvas');
        c.width = Math.round(bron.width * s);
        c.height = Math.round(bron.height * s);
        c.getContext('2d').drawImage(bron, 0, 0, c.width, c.height);
        if (bron.close) bron.close();
        klaar(c.toDataURL('image/jpeg', 0.9));
      };
      if (global.createImageBitmap) {
        createImageBitmap(file, { imageOrientation: 'from-image' }).then(af)['catch'](viaLezer);
      } else viaLezer();
      function viaLezer() {
        var fr = new FileReader();
        fr.onerror = function () { mis(new Error('lezen')); };
        fr.onload = function () {
          var im = new Image();
          im.onload = function () { af(im); };
          im.onerror = function () { mis(new Error('decoderen')); };
          im.src = fr.result;
        };
        fr.readAsDataURL(file);
      }
    });
  }

  function verstuur(dataUrl) {
    paneel('<div class="ngbt-bezig"><div class="ngbt-spin"></div><b>' + esc(T.lezen) + '</b><span>' + esc(T.lezenSub) + '</span></div>');
    fetch(BACKEND.url + '/functions/v1/' + BACKEND.fn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: BACKEND.key, Authorization: 'Bearer ' + BACKEND.key },
      body: JSON.stringify({ bestand: dataUrl, tenant: 'next-growth' })
    }).then(function (res) {
      return res.json()['catch'](function () { return {}; });
    }).then(verwerk)['catch'](function () {
      stapForm(null, T.leesFout);
    });
  }

  /** Verwerkt het antwoord van de leesfunctie. Publiek zodat een test dit
      pad kan doorlopen zonder backend. */
  function verwerk(d) {
    if (!d || d.configured === false) return stapForm(null, T.nogUit);
    if (d.geweigerd || !d.velden) return stapForm(null, T.leesFout);
    waarschuwingen = d.waarschuwingen || [];
    stapForm(d.velden, null);
  }

  /* ---------- het bevestigingsscherm ----------
     `gelezen` is null (handmatig) of het velden-object van de leesfunctie.
     Elke rij krijgt zijn waarde plus een herkomst-etiket; wie een gelezen
     waarde aanpast, ziet het etiket omslaan naar "door u ingevuld". */
  function stapForm(gelezen, melding) {
    var rijen = VELDEN.map(function (v) {
      var cel = gelezen && gelezen[v.id];
      var waarde = cel && cel.waarde != null ? cel.waarde : cfg[v.id];
      var herkomst = cel && cel.waarde != null
        ? (cel.zekerheid === 'hoog' ? 'tekening' : 'onzeker')
        : (gelezen ? 'aanname' : 'bevestigd');
      if (v.id === 'watErboven' && waarde === 'verdieping-plus-dak' && !cel) waarde = 'verdieping-plus-dak';
      var tag = TAG[herkomst];
      var r = '<div class="ngbt-veld" id="ngbt-rij-' + v.id + '">';
      if (v.soort === 'vink') {
        r += '<label style="font-weight:400"><input type="checkbox" id="ngbt-' + v.id + '" data-herkomst="' + herkomst + '"' +
             (waarde === true ? ' checked' : '') + '> ' + esc(v.label) + '</label>';
      } else {
        r += '<label for="ngbt-' + v.id + '">' + esc(v.label) + '</label>';
        if (v.soort === 'keuze') {
          r += '<span>' + '<select id="ngbt-' + v.id + '" data-herkomst="' + herkomst + '">' +
            v.opties.map(function (o) {
              return '<option value="' + o[0] + '"' + (String(waarde) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
            }).join('') + '</select></span>';
        } else {
          var num = typeof waarde === 'number' ? String(Math.round(waarde * 100) / 100).replace('.', ',') : '';
          r += '<span><input type="text" inputmode="decimal" id="ngbt-' + v.id + '" value="' + esc(num) + '" data-herkomst="' + herkomst + '">' +
               '<span class="ngbt-eenheid">' + esc(v.eenheid || '') + '</span></span>';
        }
      }
      if (v.hint) r += '<p class="ngbt-hint">' + esc(v.hint) + '</p>';
      r += '<span class="ngbt-tag ' + tag.cls + '" id="ngbt-tag-' + v.id + '">' + esc(tag.tekst) + '</span>';
      if (cel && cel.toelichting && cel.waarde != null) r += '<p class="ngbt-toel">' + esc(cel.toelichting) + '</p>';
      return r + '</div>';
    }).join('');

    paneel(
      '<h4 style="margin:0 0 .3rem">' + esc(gelezen ? T.kopBevestig : T.kopZelf) + '</h4>' +
      '<p style="margin:0 0 1rem;color:#6b6b66;font-size:.87rem;line-height:1.5">' + esc(gelezen ? T.subBevestig : T.subZelf) + '</p>' +
      (melding ? '<p class="ngbt-melding">' + esc(melding) + '</p>' : '') +
      rijen +
      (waarschuwingen.length && gelezen
        ? '<ul class="ngbt-waarsch">' + waarschuwingen.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>'
        : '') +
      '<label class="ngbt-vink"><input type="checkbox" id="ngbt-akkoord"> ' + esc(T.akkoord) + '</label>' +
      '<div class="ngbt-acties">' +
        '<button type="button" class="ngbt-btn" id="ngbt-maak" disabled>' + esc(T.maak) + '</button>' +
        '<button type="button" class="ngbt-ghost" id="ngbt-terug">' + esc(T.terug) + '</button>' +
      '</div>' +
      '<p class="ngbt-voet">' + esc(T.voet) + '</p>'
    );

    VELDEN.forEach(function (v) {
      var el = $('ngbt-' + v.id);
      el.addEventListener(v.soort === 'getal' ? 'input' : 'change', function () {
        el.dataset.herkomst = 'bevestigd';
        var t = $('ngbt-tag-' + v.id);
        t.className = 'ngbt-tag ' + TAG.bevestigd.cls;
        t.textContent = TAG.bevestigd.tekst;
      });
    });
    /* De portaalvelden alleen tonen wanneer de ligger op kolommen komt. */
    function toonPortaal() {
      var portaal = $('ngbt-oplegging').value === 'portaal';
      VELDEN.forEach(function (v) {
        if (v.bij === 'portaal') $('ngbt-rij-' + v.id).style.display = portaal ? '' : 'none';
      });
    }
    $('ngbt-oplegging').addEventListener('change', toonPortaal);
    toonPortaal();
    $('ngbt-akkoord').addEventListener('change', function () {
      $('ngbt-maak').disabled = !this.checked;
    });
    $('ngbt-terug').addEventListener('click', stapKeuze);
    $('ngbt-maak').addEventListener('click', function () { maak(!!gelezen); });
  }

  /* Formulier → invoer voor NGStaal, met per veld de herkomst zoals die op
     blad S-01 komt te staan. "onzeker" dat ongewijzigd bevestigd is, telt als
     "tekening": de bezoeker heeft het vinkje gezet. */
  function maak(metTekening) {
    var invoer = { staal: 'S235', herkomst: {} };
    VELDEN.forEach(function (v) {
      var el = $('ngbt-' + v.id);
      var h = el.dataset.herkomst;
      invoer.herkomst[v.id] = (h === 'onzeker') ? 'tekening' : h;
      if (v.soort === 'vink') invoer[v.id] = el.checked;
      else if (v.soort === 'keuze') invoer[v.id] = el.value;
      else invoer[v.id] = getal(el.value);
    });
    if (invoer.watErboven === 'meer') {
      invoer.watErboven = 'verdieping-plus-dak';
      invoer.verdiepingen = 2;      // boven de grens: NGStaal weigert met reden
    }
    /* Portaal: het vinkje betekent dat de stabiliteit NIET elders zit — dan
       weigert NGStaal met reden (momentvast portaal is constructeurswerk). */
    invoer.stabiliteitElders = !invoer.portaalStabiliteit;
    delete invoer.portaalStabiliteit;
    invoer.metTekening = metTekening;
    sluit();
    global.NGStaal.open(invoer);
  }

  /** Openen vanuit de configurator; `standaard` zijn de aannamen die de
      staalknop tot nu toe rechtstreeks gebruikte. */
  function open(standaard) {
    cfg = standaard || {};
    if (cfg.kolomHoogte == null) cfg.kolomHoogte = 2.6;   // gangbare verdiepingshoogte
    zetCss();
    stapKeuze();
  }

  global.NGBouwtekening = { open: open, verwerk: verwerk, stapForm: stapForm };
})(window);
