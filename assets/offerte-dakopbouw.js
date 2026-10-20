/* Offerte in de huisstijl van het bedrijf, opgebouwd uit de link die de
 * configurator met de aanvraag meestuurt (#o=…). De regels en bedragen komen
 * uit de interne calculatie (tenants/<slug>.json → calculatie), de teksten
 * rondom uit tenants/<slug>.json → offerte. Afdrukken geeft de PDF.
 */
(function () {
  'use strict';
  var doc = document.getElementById('doc');
  document.getElementById('print').addEventListener('click', function () { window.print(); });

  function e(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function unb64(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function eu(n) { return '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function nl(n) { return String(Math.round(n * 10) / 10).replace('.', ','); }
  function dat(d) { return ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear(); }
  function leeg(t) { doc.innerHTML = '<div class="leeg"><h2>Offerte niet gevonden</h2><p>' + e(t) + '</p></div>'; }

  var m = /o=([A-Za-z0-9_-]+)/.exec(location.hash), O;
  try { O = m && JSON.parse(unb64(m[1])); } catch (err) { O = null; }
  if (!O || !O.b || !/^[a-z0-9-]+$/.test(O.b)) { leeg('Deze link is onvolledig. Open de offerte via de link in de aanvraagmail.'); return; }

  fetch('./tenants/' + O.b + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (T) {
    var t = T.offerte || {};
    document.documentElement.style.setProperty('--logo', 'url("' + new URL(T.logo, location.href).href + '")');
    if (T.kleur) document.documentElement.style.setProperty('--acc', T.kleur);
    if (T.thema && T.thema.inkt) document.documentElement.style.setProperty('--ink', T.thema.inkt);
    document.title = 'Offerte ' + O.n + ' · ' + (O.k.n || '') + ' · ' + (T.naam || '');
    document.getElementById('titel').textContent = 'Offerte ' + O.n + ' · ' + (O.k.n || '');

    var voet = '<div class="voet"><span>' + e(t.voet || '') + '</span><span>' + e(t.webadres || '') + '</span></div>';
    function kop(lbl) { return '<div class="kop"><span class="logo"></span><span class="label">' + e(lbl) + '</span></div>'; }
    function punt(s) { return e(s).replace(/([.?!])$/, '<i>$1</i>'); }
    var contact = '<div class="contact"><div><small>TELEFOON</small>' + e(T.telefoon) + '</div><div><small>E-MAIL</small>' + e(T.email) + '</div><div><small>ADRES</small>' + e(t.adres) + ',<br>' + e(t.plaats) + '</div></div>';
    var sterren = '<div class="sterren"><b>★★★★★</b>Beoordeeld met 5 sterren</div>';
    var h = '';

    /* 1 · omslag */
    h += '<section class="pagina omslag"><div class="binnen"><span class="logo wit"></span><div class="hand">' + e(t.tagline) + '</div>'
      + '<h1>' + e(t.kop) + '<i>.</i></h1><p>' + e(t.intro) + '</p><div class="usps">'
      + (t.usps || []).map(function (u) { return '<div>' + e(u) + '</div>'; }).join('') + '</div>' + sterren
      + '<div class="tot">Tot snel, team ' + e((T.naam || '').split(' ')[0]) + '</div></div>' + voet + '</section>';

    /* 2 · zo werkt het */
    h += '<section class="pagina"><div class="binnen">' + kop('Zo werkt het') + '<div class="hand">Stap voor stap</div>'
      + '<h2>Van eerste gesprek tot oplevering in ' + (t.stappen || []).length + ' stappen<i>.</i></h2><div class="kaarten">'
      + (t.stappen || []).map(function (s, i) { return '<div class="kaart"><span>' + (i + 1) + '</span><h3>' + e(s[0]) + '</h3><p>' + e(s[1]) + '</p></div>'; }).join('')
      + '</div>' + contact + '</div>' + voet + '</section>';

    /* 3 · de offerte zelf */
    var d = new Date(O.d + 'T12:00:00'), geldig = new Date(d.getTime() + (t.geldigDagen || 30) * 864e5);
    var rijen = '', tot = 0, open = [];
    (O.r || []).forEach(function (r) {
      var titel = r[0], b = r[1], uitleg = r[2] || '', q = r[3], groep = r[4] || '';
      if (!b) { open.push(titel); return; }
      var bedrag = b[0], aantal = 1, prijs = bedrag, eh = '';
      if (q && q[0] > 0 && q[2]) { aantal = q[0]; prijs = q[2]; bedrag = Math.round(q[0] * q[2] * 100) / 100; }
      if (b[0] !== b[1]) uitleg = (uitleg ? uitleg + ' · ' : '') + 'vanafprijs, bandbreedte ' + eu(b[0]) + ' – ' + eu(b[1]);
      if (bedrag === 0 && !groep) uitleg = uitleg || 'inbegrepen';
      tot += bedrag;
      rijen += '<tr><td>' + (groep ? '<b>' + e(groep) + '</b> ' : '') + e(titel) + (uitleg ? '<small>' + e(uitleg) + '</small>' : '') + '</td><td class="r">' + nl(aantal) + e(eh) + '</td>'
        + '<td class="r">' + eu(prijs) + '</td><td class="r">' + eu(bedrag) + '</td><td class="r">21%</td></tr>';
    });
    var btw = Math.round(tot * 21) / 100;
    h += '<section class="pagina offerte"><div class="binnen"><div class="kop" style="margin-bottom:6mm;align-items:flex-start"><span class="logo"></span>'
      + '<div class="bedrijf">' + e(t.bedrijf || T.naam) + '<br>' + e(t.adres) + '<br>' + e(t.postcode) + '</div></div>'
      + '<div class="klant">' + e(O.k.n) + '<br>' + e(O.k.a) + '<br>' + e(O.k.p) + '<br>tel: ' + e(O.k.t) + '<br>mail: ' + e(O.k.e) + '</div>'
      + '<div class="meta"><div>Offertenummer<b>' + e(O.n) + '</b></div><div>Vervaldatum<b>' + dat(geldig) + '</b></div><div>' + e(t.plaats) + '<b>' + dat(d) + '</b></div></div>'
      + '<table><thead><tr><th>Omschrijving</th><th class="r">Aantal</th><th class="r">Prijs</th><th class="r">Totaal</th><th class="r">BTW</th></tr></thead><tbody>' + rijen + '</tbody></table>'
      + '<div class="totalen"><div><span>Totaal exclusief BTW</span><span>' + eu(tot) + '</span></div><div><span>BTW (21%)</span><span>' + eu(btw) + '</span></div>'
      + '<div class="groot"><span>Totaal inclusief BTW</span><span>' + eu(tot + btw) + '</span></div></div>'
      + (open.length || (O.l || []).length ? '<div class="noot"><b>Nog apart te calculeren:</b> ' + e(open.concat(O.l || []).join(', ')) + '</div>' : '')
      + '<div class="teken"><div>Voor akkoord opdrachtgever<br><br><br>Datum en handtekening</div><div>' + e(t.bedrijf || T.naam) + '<br><br><br>Datum en handtekening</div></div>'
      + '</div><div class="nr">Offerte ' + e(O.n) + '</div></section>';

    /* 3b · de tekening uit de configurator: plattegrond met kamers en elektra */
    var PL = window.NGPlattegrond, P = null;
    try { P = O.p && PL && PL.uitLink('#p=' + O.p); } catch (err) { P = null; }
    if (P) {
      var rg = PL.samenvattingVan(P).split('\n').filter(function (r) { return r && r.indexOf('http') < 0; });
      var pt = rg.shift() || '';
      var leg = Object.keys(PL.PUNTEN).filter(function (k) { return (P.punten || []).some(function (q) { return q.t === k; }); }).map(function (k) {
        return '<span>' + PL.symbool(k) + e(PL.PUNTEN[k].l) + ': ' + P.punten.filter(function (q) { return q.t === k; }).length + '</span>';
      }).join('');
      h += '<section class="pagina tek"><div class="binnen">' + kop('Tekening') + '<div class="hand">Jouw indeling</div>'
        + '<h2 style="margin-bottom:6mm">Plattegrond met kamers en elektra<i>.</i></h2>'
        + '<p style="font-size:10px;color:var(--tekst);margin:-4mm 0 5mm">' + e(pt.replace(/:$/, '')) + ' · voorgevel onderaan · maten in meters · zoals ingetekend in de configurator, definitief na inmeten</p>'
        + '<div class="pl">' + PL.svg(P, { raster: false }) + '</div>'
        + '<div class="kolom"><div><h3>Ruimtes en installatie</h3><ul>' + rg.map(function (r) { return '<li>' + e(r.replace(/^- /, '')) + '</li>'; }).join('') + '</ul></div>'
        + (leg ? '<div><h3>Legenda</h3><div class="legenda">' + leg + '</div></div>' : '') + '</div>'
        + '</div>' + voet + '</section>';
    }

    /* 4 · diensten */
    h += '<section class="pagina"><div class="binnen">' + kop('Onze diensten') + '<div class="hand">Eén vast team</div>'
      + '<h2>Voor elk bouwproject de juiste specialist<i>.</i></h2><div class="kaarten">'
      + (t.diensten || []).map(function (s, i) { return '<div class="kaart" style="min-height:40mm"><span>' + (i + 1) + '</span><h3>' + e(s[0]) + '</h3><p>' + e(s[1]) + '</p></div>'; }).join('')
      + '</div></div>' + voet + '</section>';

    /* 5 · over ons */
    h += '<section class="pagina"><div class="binnen">' + kop('Over ons') + '<div class="hand">Jouw bouwpartner</div>'
      + '<h2>Een bouwpartner die écht meedenkt<i>.</i></h2><div class="over"><div>' + (t.over || []).map(function (p) { return '<p>' + e(p) + '</p>'; }).join('')
      + '</div><blockquote>“' + e(t.citaat) + '”<small>' + e(T.naam) + '</small></blockquote></div><div class="cijfers">'
      + (t.cijfers || []).map(function (c) { return '<div><b>' + e(c[0]) + '</b>' + e(c[1]) + '</div>'; }).join('') + '</div><div class="reviews">'
      + (t.reviews || []).map(function (r) { return '<div><b>★★★★★</b>' + e(r[0]) + '<strong>' + e(r[1]) + '</strong></div>'; }).join('')
      + '</div></div>' + voet + '</section>';

    /* 6 · slot */
    h += '<section class="pagina omslag"><div class="binnen"><span class="logo wit"></span><h1 style="margin-top:30mm">' + punt(t.slotKop) + '</h1><p>' + e(t.slotTekst) + '</p>'
      + '<div class="contact" style="width:150mm;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18)"><div><small>BEL</small>' + e(T.telefoon) + '</div><div><small>MAIL</small>' + e(T.email) + '</div><div><small>ADRES</small>' + e(t.adres) + ',<br>' + e(t.plaats) + '</div></div>'
      + '<p style="margin-top:8mm;font-size:10px">' + e(t.social || '') + '</p>' + sterren
      + '<div class="tot">Tot snel, team ' + e((T.naam || '').split(' ')[0]) + '</div></div>' + voet + '</section>';

    doc.innerHTML = h;
  }).catch(function () { leeg('De gegevens van het bedrijf konden niet worden geladen.'); });
})();
