/* Statische pagina's: menu, video's in beeld, terugbelformulier */
(function(){
  var b=document.querySelector('.menu'),n=document.getElementById('mnav');
  if(b&&n){b.addEventListener('click',function(){var o=n.hasAttribute('hidden');if(o){n.removeAttribute('hidden')}else{n.setAttribute('hidden','')}b.setAttribute('aria-expanded',o?'true':'false');b.textContent=o?'Sluiten':'Menu'});
    n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.setAttribute('hidden','');b.setAttribute('aria-expanded','false');b.textContent='Menu'}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!n.hasAttribute('hidden')){n.setAttribute('hidden','');b.setAttribute('aria-expanded','false');b.textContent='Menu';b.focus()}})}
  var vids=[].slice.call(document.querySelectorAll('video'));
  if(vids.length&&'IntersectionObserver' in window){vids.forEach(function(v){v.removeAttribute('autoplay');v.muted=true;v.playsInline=true});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.play().catch(function(){})}else{e.target.pause()}})},{threshold:.35});
    vids.forEach(function(v){io.observe(v)})}
  /* Terugbelverzoek: rechtstreeks naar de mail van Next Growth (Web3Forms). Lukt dat niet, dan opent een e-mail met de gegevens. */
  [].slice.call(document.querySelectorAll('form[data-cb]')).forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();
      var naam=f.naam.value.trim(),tel=f.tel.value.trim(),wat=f.wat.value,ok=f.querySelector('.ok'),knop=f.querySelector('button[type=submit]'),bad=false;
      if(f.website&&f.website.value)return;
      f.naam.setAttribute('aria-invalid',naam?'false':'true');if(!naam)bad=true;
      var tOk=/^[+\d][\d\s\-()]{7,}$/.test(tel);f.tel.setAttribute('aria-invalid',tOk?'false':'true');if(!tOk)bad=true;
      if(bad){ok.hidden=false;ok.textContent='Vul je naam en een geldig telefoonnummer in.';(naam?f.tel:f.naam).focus();return}
      var label=knop?knop.innerHTML:'';if(knop){knop.disabled=true;knop.textContent='Versturen…'}
      function mailto(){var body='Naam: '+naam+'\nTelefoon: '+tel+'\nOnderwerp: '+wat+'\nPagina: '+location.href;
        location.href='mailto:info@nextgrowthdigital.nl?subject='+encodeURIComponent('Terugbelverzoek: '+wat)+'&body='+encodeURIComponent(body);
        ok.hidden=false;ok.textContent='Je e-mailprogramma opent met je gegevens. Verstuur het bericht, of bel 06 83 90 21 92.'}
      var klaar=false,wekker=setTimeout(function(){if(klaar)return;klaar=true;if(knop){knop.disabled=false;knop.innerHTML=label}mailto()},9000);
      fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:'695172ae-1f2d-40b7-bb31-b8a4a882ad62',subject:'Terugbelverzoek via nextgrowthdigital.nl: '+naam,from_name:'nextgrowthdigital.nl',naam:naam,telefoon:tel,onderwerp:wat,pagina:location.href})})
        .then(function(r){return r.ok}).catch(function(){return false})
        .then(function(gelukt){if(klaar)return;klaar=true;clearTimeout(wekker);if(knop){knop.disabled=false;knop.innerHTML=label}
          if(gelukt){f.reset();ok.hidden=false;ok.textContent='Bedankt, je aanvraag is binnen. We bellen je dezelfde werkdag terug.'}else{mailto()}});
    });
  });
})();
