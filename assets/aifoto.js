/* AI-foto voor de configurators — de bezoeker ziet zijn eigen huis terug.
 *
 * Een configurator laat zien hoe een product eruitziet. Deze module laat zien
 * hoe het er bij hém uitziet: hij uploadt een foto van zijn gevel, tuin of
 * kamer en krijgt zijn eigen samenstelling erop terug. Dat is het verschil
 * tussen "mooi product" en "dit wil ik".
 *
 * Het rekenwerk gebeurt niet hier. De Edge Function pool-render doet het
 * beeld, de afscherming, de limieten en de opslag; die machine draait al voor
 * de zwembadstudio. Deze module regelt alleen het uploaden, het verkleinen,
 * de wachttoestanden en het tonen.
 *
 * Gebruik, onderin de configurator, ná de eigen optielijsten:
 *
 *   NGFoto.init({
 *     product: 'aanbouw',
 *     scene:   'buiten',                 // of 'binnen' (pvc)
 *     payload: function(){ return { w:st.w, dp:st.dp, material:st.material }; },
 *     voorbeeld: { voor: './assets/...jpg', na: './assets/...jpg' }
 *   });
 *
 * payload() wordt bij elke render opnieuw aangeroepen, zodat altijd de
 * keuzes van dát moment meegaan.
 */
(function (global) {
  'use strict';

  var BACKEND = {
    url: 'https://numqnwpkvlcxtvkiytmi.supabase.co',
    fn: 'pool-render',
    key: 'sb_publishable_r-yX9wBX2UaM8iIXdjciJA_1AGlZ6qC'
  };
  var MAX_MB = 12;        // groter dan dit is een telefoonfoto zelden
  var MAX_PX = 1400;      // groter heeft het beeldmodel niet nodig

  var T = {
    kop: 'Zie het bij je eigen huis',
    kopBinnen: 'Zie het in je eigen kamer',
    lead: 'Upload een foto van je situatie. Je krijgt je eigen samenstelling ' +
          'er fotorealistisch op terug. Alles eromheen blijft zoals het is.',
    drop: 'Sleep je foto hierheen',
    dropSub: 'of klik om er een te kiezen · JPG, PNG of WEBP',
    dropVoorbeeld: 'Geen foto bij de hand? ',
    voorbeeldKnop: 'gebruik een voorbeeldfoto',
    gen: 'Maak de impressie',
    opnieuw: 'Maak opnieuw',
    andere: 'Andere foto',
    voor: 'Voor',
    na: 'Na',
    bezig: 'Je impressie wordt gemaakt',
    bezigStap: ['Je foto wordt gelezen…', 'Je samenstelling wordt beschreven…',
                'Het beeld wordt opgebouwd…', 'Laatste details…'],
    demo: 'Dit is een voorbeeldresultaat. De beeldgenerator staat nog niet aan, ' +
          'dus dit is niet je eigen foto.',
    voorbeeldNoot: 'Dit is een voorbeeldfoto, niet je eigen situatie.',
    fout: 'Het maken van de impressie is niet gelukt. Probeer het zo nog eens.',
    nogUit: 'Deze functie staat nog niet aan. Je foto is niet verstuurd en er is ' +
            'niets opgeslagen. Vraag een offerte aan, dan sturen we je de impressie toe.',
    druk: 'Er worden op dit moment veel impressies gemaakt. Probeer het over ' +
          'een kwartier nog eens.',
    geenBeeld: 'Dat bestand is geen afbeelding.',
    teGroot: 'Die foto is groter dan ' + MAX_MB + ' MB. Kies een kleinere.',
    leesFout: 'De foto kon niet gelezen worden. Probeer een andere.',
    download: 'Bewaar de impressie',
    prompt: 'Prompt bekijken'
  };

  var cfg = null, doos = null, fotoData = null, isVoorbeeld = false;
  var bezig = false, klaarStaand = false, demoModus = false;
  var cache = {}, stapTimer = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /** Debugstand: alleen met ?zsdebug=1 in de URL, nooit voor bezoekers. */
  function debugAan() {
    return /[?&]zsdebug=1\b/.test(global.location.search);
  }

  /* ---------- opmaak ---------- */

  var CSS = [
    // Deze widget neemt de achtergrond van de pagina over via --bg-raise, maar
    // zette de tekst op een vaste grijstint via een --muted die nergens is
    // gedefinieerd. Op de donkere configuratorpagina's werd dat #6b6b66 op
    // #131318: 3,45:1. --text-2 beweegt wel met het thema mee.
    '.ngf{border:1px solid var(--line,rgba(0,0,0,.1));border-radius:16px;overflow:hidden;background:var(--bg-raise,#fff)}',
    '.ngf-kop{padding:clamp(1.1rem,3vw,1.7rem)}',
    '.ngf-kop h3{margin:0 0 .4rem;font-size:clamp(1.15rem,2.4vw,1.5rem)}',
    '.ngf-kop p{margin:0;color:var(--text-2,#6b6b66);max-width:44rem;line-height:1.55}',
    '.ngf-box{position:relative;aspect-ratio:3/2;background:#0C0D10;overflow:hidden}',
    '.ngf-box>img{width:100%;height:100%;object-fit:cover;display:block}',
    '.ngf-drop{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:.5rem;color:#cfd2d6;text-align:center;padding:1.2rem;cursor:pointer;',
    'border:2px dashed rgba(255,255,255,.22);margin:.7rem;border-radius:12px;transition:border-color .15s,background .15s}',
    '.ngf-drop.over{border-color:var(--acc,#FFC400);background:rgba(255,196,0,.08)}',
    '.ngf-drop b{font-size:1.02rem;color:#fff}',
    '.ngf-drop span{font-size:.87rem;opacity:.8}',
    '.ngf-link{background:none;border:0;color:var(--acc,#FFC400);text-decoration:underline;cursor:pointer;font:inherit;padding:0}',
    '.ngf-bezig{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;',
    'justify-content:center;gap:.7rem;background:rgba(8,9,11,.72);color:#fff;backdrop-filter:blur(2px)}',
    '.ngf-bezig.aan{display:flex}',
    '.ngf-spin{width:34px;height:34px;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;',
    'border-radius:50%;animation:ngfdraai .9s linear infinite}',
    '@keyframes ngfdraai{to{transform:rotate(360deg)}}',
    '.ngf-bezig span{font-size:.87rem;opacity:.85}',
    '.ngf-cmp{position:absolute;inset:0;--split:50%}',
    '.ngf-cmp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.ngf-cmp img.na{clip-path:inset(0 0 0 var(--split))}',
    '.ngf-greep{position:absolute;top:0;bottom:0;left:var(--split);width:2px;background:#fff;pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,.25)}',
    '.ngf-schuif{position:absolute;inset:auto 0 0;width:100%;margin:0;padding:0 0 .6rem;opacity:0;height:100%;cursor:ew-resize}',
    '.ngf-tag{position:absolute;top:.6rem;padding:.2rem .55rem;border-radius:5px;background:rgba(0,0,0,.55);',
    'color:#fff;font-size:.74rem;letter-spacing:.04em;text-transform:uppercase}',
    '.ngf-tag.l{left:.6rem}.ngf-tag.r{right:.6rem}',
    '.ngf-terug{position:absolute;right:.6rem;bottom:.6rem;display:inline-flex;align-items:center;gap:.35rem;',
    'padding:.35rem .7rem;border-radius:7px;border:0;background:rgba(0,0,0,.6);color:#fff;font-size:.8rem;cursor:pointer}',
    // .btn zet display:inline-flex en wint anders van het hidden-attribuut,
    // waardoor "bewaar de impressie" al zichtbaar is voor er iets te bewaren is
    '.ngf [hidden]{display:none !important}',
    '.ngf-voet{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;padding:clamp(.8rem,2.4vw,1.1rem)}',
    '.ngf-noot{width:100%;margin:0;font-size:.84rem;color:var(--text-2,#6b6b66);line-height:1.5}',
    '.ngf-fout{width:100%;margin:0;font-size:.86rem;color:#b4342c;display:none}',
    '.ngf-prompt{width:100%;margin:.5rem 0 0;padding:.7rem;border-radius:8px;background:rgba(0,0,0,.05);',
    'font:.76rem/1.5 ui-monospace,monospace;white-space:pre-wrap;display:none;max-height:15rem;overflow:auto}'
  ].join('');

  function zetCss() {
    if ($('ngf-css')) return;
    var st = document.createElement('style');
    st.id = 'ngf-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- foto klaarmaken ----------
     Telefoonfoto's zijn groot en staan vaak gedraaid. Verkleinen scheelt
     uploadtijd en kosten; de oriëntatie moet mee, anders staat het huis op
     zijn kant en klopt de hele impressie niet. */
  function verklein(file) {
    return new Promise(function (klaar, mis) {
      var af = function (bron) {
        var w = bron.width, h = bron.height;
        var s = Math.min(1, MAX_PX / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * s);
        c.height = Math.round(h * s);
        c.getContext('2d').drawImage(bron, 0, 0, c.width, c.height);
        if (bron.close) bron.close();
        klaar(c.toDataURL('image/jpeg', 0.86));
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

  /* ---------- toestanden ---------- */

  function toonDrop() {
    fotoData = null; demoModus = false;
    $('ngf-box').innerHTML =
      '<div class="ngf-drop" id="ngf-drop">' +
        '<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" ' +
        'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5"/><path d="M12 15V3"/>' +
        '<path d="m7.5 7.5 4.5-4.5 4.5 4.5"/></svg>' +
        '<b>' + esc(T.drop) + '</b>' +
        '<span>' + esc(T.dropSub) + '</span>' +
        (cfg.voorbeeld ? '<span>' + esc(T.dropVoorbeeld) +
          '<button type="button" class="ngf-link" id="ngf-vb">' + esc(T.voorbeeldKnop) + '</button></span>' : '') +
      '</div>';
    $('ngf-gen').disabled = true;
    $('ngf-dl').hidden = true;
    $('ngf-noot').textContent = '';
    $('ngf-gen').textContent = T.gen;
  }

  function toonFoto(dataUrl, voorbeeld) {
    fotoData = dataUrl;
    isVoorbeeld = !!voorbeeld;
    demoModus = false;
    $('ngf-box').innerHTML =
      '<img alt="" src="' + dataUrl + '">' +
      '<button type="button" class="ngf-terug" id="ngf-terug">' + esc(T.andere) + '</button>' +
      '<div class="ngf-bezig" id="ngf-bezig"><div class="ngf-spin"></div>' +
        '<b>' + esc(T.bezig) + '</b><span id="ngf-stap"></span></div>';
    $('ngf-gen').disabled = false;
    $('ngf-gen').textContent = T.gen;
    $('ngf-dl').hidden = true;
    $('ngf-noot').textContent = voorbeeld ? T.voorbeeldNoot : '';
    $('ngf-fout').style.display = 'none';
  }

  function toonResultaat(voor, na, demo) {
    $('ngf-box').innerHTML =
      '<div class="ngf-cmp" id="ngf-cmp">' +
        '<img alt="" src="' + voor + '">' +
        '<img alt="" class="na" src="' + na + '">' +
        '<div class="ngf-greep"></div>' +
        '<span class="ngf-tag l">' + esc(T.voor) + '</span>' +
        '<span class="ngf-tag r">' + esc(T.na) + '</span>' +
        '<input type="range" class="ngf-schuif" min="0" max="100" value="50" id="ngf-schuif" ' +
          'aria-label="' + esc(T.voor) + ' / ' + esc(T.na) + '">' +
      '</div>' +
      '<button type="button" class="ngf-terug" id="ngf-terug">' + esc(T.andere) + '</button>';
    var cmp = $('ngf-cmp'), sch = $('ngf-schuif');
    var zet = function (v) { cmp.style.setProperty('--split', v + '%'); };
    zet(50);
    sch.addEventListener('input', function () { zet(sch.value); });
    $('ngf-gen').textContent = T.opnieuw;
    $('ngf-gen').disabled = false;
    $('ngf-dl').href = na;
    $('ngf-dl').hidden = false;
    $('ngf-noot').textContent = demo ? T.demo : (isVoorbeeld ? T.voorbeeldNoot : '');
  }

  function startBezig() {
    var b = $('ngf-bezig');
    if (b) b.classList.add('aan');
    var i = 0;
    var toon = function () {
      var s = $('ngf-stap');
      if (s) s.textContent = T.bezigStap[Math.min(i, T.bezigStap.length - 1)];
      i++;
    };
    toon();
    stapTimer = setInterval(toon, 4500);
  }
  function stopBezig() {
    clearInterval(stapTimer);
    var b = $('ngf-bezig');
    if (b) b.classList.remove('aan');
  }

  /* ---------- render ---------- */

  function keuzes() {
    var o = {};
    try { o = cfg.payload() || {}; } catch (e) { o = {}; }
    // alles als tekst: de Edge Function leest string-waarden
    var uit = {};
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) {
      if (o[k] === null || o[k] === undefined || o[k] === '') continue;
      uit[k] = String(o[k]);
    }
    return uit;
  }

  function verstuur(body) {
    return fetch(BACKEND.url + '/functions/v1/' + BACKEND.fn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: BACKEND.key,
        Authorization: 'Bearer ' + BACKEND.key
      },
      body: JSON.stringify(body)
    });
  }

  function render() {
    if (!fotoData || bezig) { if (bezig) klaarStaand = true; return; }
    var o = keuzes();
    var sleutel = JSON.stringify(o) + '|' + fotoData.length;
    if (cache[sleutel]) {
      toonResultaat(demoModus ? cfg.voorbeeld.voor : fotoData, cache[sleutel], demoModus);
      return;
    }
    bezig = true;
    $('ngf-gen').disabled = true;
    $('ngf-fout').style.display = 'none';
    startBezig();
    var voor = fotoData;

    var lading = { image: fotoData, mode: cfg.product, tenant: 'next-growth' };
    for (var k in o) lading[k] = o[k];

    verstuur(lading).then(function (res) {
      return res.json()['catch'](function () { return {}; })
        .then(function (d) { return { res: res, d: d }; });
    }).then(function (r) {
      stopBezig();
      // Nog geen sleutel bij de beeldleverancier. Is er een voorbeeldpaar,
      // dan tonen we dat met de melding erbij dat het niet zijn eigen foto is.
      // Is dat er niet, dan zeggen we dat gewoon: een bezoeker die "er ging
      // iets mis" leest denkt dat hij iets fout deed.
      if (r.d.configured === false) {
        if (cfg.voorbeeld) {
          demoModus = true;
          cache[sleutel] = cfg.voorbeeld.na;
          toonResultaat(cfg.voorbeeld.voor, cfg.voorbeeld.na, true);
        } else {
          $('ngf-fout').style.display = 'block';
          $('ngf-fout').textContent = T.nogUit;
        }
        return;
      }
      if (r.res.status === 429) {
        $('ngf-fout').style.display = 'block';
        $('ngf-fout').textContent = T.druk;
        return;
      }
      if (!r.res.ok || !r.d.render_url) throw new Error(r.d.error || 'mislukt');
      demoModus = false;
      cache[sleutel] = r.d.render_url;
      toonResultaat(voor, r.d.render_url, false);
    })['catch'](function () {
      stopBezig();
      $('ngf-fout').style.display = 'block';
      $('ngf-fout').textContent = T.fout;
    }).then(function () {
      bezig = false;
      $('ngf-gen').disabled = !fotoData;
      if (klaarStaand) { klaarStaand = false; render(); }
    });
  }

  /** Alleen met ?zsdebug=1: laat zien wat het beeldmodel te horen krijgt. */
  function toonPrompt() {
    var vak = $('ngf-prompt');
    var lading = { mode: 'prompt', product: cfg.product };
    var o = keuzes();
    for (var k in o) lading[k] = o[k];
    vak.style.display = 'block';
    vak.textContent = 'bezig…';
    verstuur(lading).then(function (r) { return r.json(); }).then(function (d) {
      vak.textContent = d.prompt || ('geen prompt: ' + JSON.stringify(d));
    })['catch'](function (e) { vak.textContent = 'mislukt: ' + e; });
  }

  /* ---------- opbouw ---------- */

  function init(opties) {
    cfg = opties || {};
    var houder = $(cfg.doel || 'aifoto');
    if (!houder) return;              // pagina heeft de sectie niet: stil stoppen
    zetCss();
    var binnen = cfg.scene === 'binnen';

    houder.innerHTML =
      '<div class="ngf">' +
        '<div class="ngf-kop">' +
          '<h3>' + esc(cfg.kop || (binnen ? T.kopBinnen : T.kop)) + '</h3>' +
          '<p>' + esc(cfg.lead || T.lead) + '</p>' +
        '</div>' +
        '<div class="ngf-box" id="ngf-box"></div>' +
        '<div class="ngf-voet">' +
          '<button type="button" class="btn" id="ngf-gen">' + esc(T.gen) + '</button>' +
          '<a class="btn btn--ghost" id="ngf-dl" download="impressie.jpg" hidden>' + esc(T.download) + '</a>' +
          (debugAan() ? '<button type="button" class="btn btn--ghost" id="ngf-pr">' + esc(T.prompt) + '</button>' : '') +
          '<p class="ngf-noot" id="ngf-noot"></p>' +
          '<p class="ngf-fout" id="ngf-fout"></p>' +
          '<pre class="ngf-prompt" id="ngf-prompt"></pre>' +
        '</div>' +
      '</div>';
    doos = $('ngf-box');
    toonDrop();

    var invoer = document.createElement('input');
    invoer.type = 'file';
    invoer.accept = 'image/jpeg,image/png,image/webp';
    invoer.addEventListener('change', function () {
      if (invoer.files && invoer.files[0]) neem(invoer.files[0]);
      invoer.value = '';
    });

    function neem(file) {
      var f = $('ngf-fout');
      f.style.display = 'none';
      if (!file.type || file.type.indexOf('image/') !== 0) {
        f.style.display = 'block'; f.textContent = T.geenBeeld; return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        f.style.display = 'block'; f.textContent = T.teGroot; return;
      }
      verklein(file).then(function (d) { toonFoto(d, false); })['catch'](function () {
        f.style.display = 'block'; f.textContent = T.leesFout;
      });
    }

    doos.addEventListener('click', function (e) {
      if (e.target.closest('#ngf-vb')) { toonFoto(cfg.voorbeeld.voor, true); return; }
      if (e.target.closest('#ngf-terug')) { toonDrop(); return; }
      if (e.target.closest('#ngf-drop')) invoer.click();
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      doos.addEventListener(ev, function (e) {
        e.preventDefault();
        var d = $('ngf-drop'); if (d) d.classList.add('over');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      doos.addEventListener(ev, function (e) {
        e.preventDefault();
        var d = $('ngf-drop'); if (d) d.classList.remove('over');
        if (ev === 'drop' && e.dataTransfer && e.dataTransfer.files[0]) neem(e.dataTransfer.files[0]);
      });
    });

    $('ngf-gen').addEventListener('click', render);
    if ($('ngf-pr')) $('ngf-pr').addEventListener('click', toonPrompt);
  }

  global.NGFoto = { init: init };
})(window);
