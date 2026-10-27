/* Meting: Vercel Web Analytics (alleen op nextgrowthdigital.nl) en een event per terugbelverzoek */
(function(){if(!/(^|\.)nextgrowthdigital\.nl$/.test(location.hostname))return;window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};var s=document.createElement('script');s.defer=true;s.src='/_vercel/insights/script.js';document.head.appendChild(s);window.addEventListener('ng:lead',function(e){try{window.va('event',{name:'Terugbelverzoek',data:e.detail||{}})}catch(_){}})})();
/* Statische pagina's: menu, video's in beeld, terugbelformulier */
(function(){
  var b=document.querySelector('.menu'),n=document.getElementById('mnav');
  if(b&&n){b.addEventListener('click',function(){var o=n.hasAttribute('hidden');if(o){n.removeAttribute('hidden')}else{n.setAttribute('hidden','')}b.setAttribute('aria-expanded',o?'true':'false');b.textContent=o?'Sluiten':'Menu'});
    n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.setAttribute('hidden','');b.setAttribute('aria-expanded','false');b.textContent='Menu'}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!n.hasAttribute('hidden')){n.setAttribute('hidden','');b.setAttribute('aria-expanded','false');b.textContent='Menu';b.focus()}})}
  var vids=[].slice.call(document.querySelectorAll('video'));
  /* op nextgrowthdigital.nl video's rechtstreeks van de nieuwe site laden (de omweg via het oude project werkt niet in Safari) */
  if(/(^|\.)nextgrowthdigital\.nl$/.test(location.hostname))vids.forEach(function(v){[v].concat([].slice.call(v.querySelectorAll('source'))).forEach(function(e){var s=e.getAttribute('src');if(s&&/^\/?assets\//.test(s))e.setAttribute('src','https://next-growth-nieuw.vercel.app/'+s.replace(/^\//,''))});v.load&&v.getAttribute('src')&&v.load()});
  if(vids.length&&'IntersectionObserver' in window){vids.forEach(function(v){v.removeAttribute('autoplay');v.muted=true;v.playsInline=true});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.play().catch(function(){})}else{e.target.pause()}})},{threshold:.35});
    vids.forEach(function(v){io.observe(v)});
    /* iOS in energiebesparing: alleen starten binnen een aanraking */
    var zicht=function(v){var r=v.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
    ['touchend','click'].forEach(function(ev){addEventListener(ev,function(){vids.forEach(function(v){if(v.paused&&zicht(v))v.play().catch(function(){})})},{passive:true,capture:true})})}
  /* "Bel mij terug": naar het terugbelformulier en de cursor direct in het eerste veld */
  var cb=document.getElementById('terugbellen'),bar=document.querySelector('.mobbar');
  if(cb){var veld=cb.querySelector('input[name=naam]');
    [].slice.call(document.querySelectorAll('a[href="#terugbellen"]')).forEach(function(a){a.addEventListener('click',function(e){
      e.preventDefault();var stil=matchMedia('(prefers-reduced-motion: reduce)').matches;
      (veld?veld.closest('form')||cb:cb).scrollIntoView({behavior:stil?'auto':'smooth',block:'center'});
      if(veld){try{veld.focus({preventScroll:true})}catch(_){veld.focus()}}
      if(history.replaceState)history.replaceState(null,'','#terugbellen')})});
    /* de belbalk verdwijnt zodra het formulier in beeld is */
    if(bar&&'IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){
      bar.classList.toggle('uit',e.isIntersecting);if(e.isIntersecting){bar.setAttribute('aria-hidden','true')}else{bar.removeAttribute('aria-hidden')}})},{threshold:0,rootMargin:'0px 0px -15% 0px'}).observe(cb.querySelector('form')||cb)}}
  /* Terugbelverzoek: rechtstreeks naar de mail van Next Growth (Web3Forms). Lukt dat niet, dan opent een e-mail met de gegevens. */
  [].slice.call(document.querySelectorAll('form[data-cb]')).forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();
      var naam=f.naam.value.trim(),tel=f.tel.value.trim(),wat=f.wat.value,ok=f.querySelector('.ok'),knop=f.querySelector('button[type=submit]'),bad=false;
      if(f.website&&f.website.value)return;
      f.naam.setAttribute('aria-invalid',naam?'false':'true');if(!naam)bad=true;
      var tOk=/^[+\d][\d\s\-()]{7,}$/.test(tel);f.tel.setAttribute('aria-invalid',tOk?'false':'true');if(!tOk)bad=true;
      if(bad){ok.hidden=false;ok.textContent='Vul je naam en een geldig telefoonnummer in.';(naam?f.tel:f.naam).focus();return}
      var label=knop?knop.innerHTML:'';if(knop){knop.disabled=true;knop.textContent='Versturen…'}
      function mailto(){ok.hidden=false;ok.innerHTML='Versturen lukte niet. Bel ons direct op <a href="tel:+31683902192">06 83 90 21 92</a>, dan helpen we je meteen.'}
      var klaar=false,wekker=setTimeout(function(){if(klaar)return;klaar=true;if(knop){knop.disabled=false;knop.innerHTML=label}mailto()},9000);
      fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:'695172ae-1f2d-40b7-bb31-b8a4a882ad62',subject:'Terugbelverzoek via nextgrowthdigital.nl: '+naam,from_name:'nextgrowthdigital.nl',naam:naam,telefoon:tel,onderwerp:wat,pagina:location.href})})
        .then(function(r){return r.ok}).catch(function(){return false})
        .then(function(gelukt){if(klaar)return;klaar=true;clearTimeout(wekker);if(knop){knop.disabled=false;knop.innerHTML=label}
          if(gelukt){f.reset();ok.hidden=false;ok.textContent='Bedankt, je aanvraag is binnen. We bellen je dezelfde werkdag terug.';try{window.dispatchEvent(new CustomEvent('ng:lead',{detail:{page:location.pathname,onderwerp:wat}}))}catch(_){}}else{mailto()}});
    });
  });
})();
