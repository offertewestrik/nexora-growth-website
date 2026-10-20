/* Statische pagina's: menu, video's in beeld, terugbelformulier */
(function(){
  var b=document.querySelector('.menu'),n=document.getElementById('mnav');
  if(b&&n){b.addEventListener('click',function(){var o=n.hasAttribute('hidden');if(o){n.removeAttribute('hidden')}else{n.setAttribute('hidden','')}b.setAttribute('aria-expanded',o?'true':'false');b.textContent=o?'Sluiten':'Menu'});
    n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.setAttribute('hidden','');b.setAttribute('aria-expanded','false');b.textContent='Menu'}})}
  var vids=[].slice.call(document.querySelectorAll('video'));
  if(vids.length&&'IntersectionObserver' in window){vids.forEach(function(v){v.removeAttribute('autoplay');v.muted=true;v.playsInline=true});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.play().catch(function(){})}else{e.target.pause()}})},{threshold:.35});
    vids.forEach(function(v){io.observe(v)})}
  /* Terugbelverzoek: opent een e-mail met de gegevens erin, zodat het verzoek altijd aankomt. */
  [].slice.call(document.querySelectorAll('form[data-cb]')).forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();
      var naam=f.naam.value.trim(),tel=f.tel.value.trim(),wat=f.wat.value,ok=f.querySelector('.ok'),bad=false;
      f.naam.setAttribute('aria-invalid',naam?'false':'true');if(!naam)bad=true;
      var tOk=/^[+\d][\d\s\-()]{7,}$/.test(tel);f.tel.setAttribute('aria-invalid',tOk?'false':'true');if(!tOk)bad=true;
      if(bad){ok.hidden=false;ok.textContent='Vul je naam en een geldig telefoonnummer in.';return}
      var body='Naam: '+naam+'\nTelefoon: '+tel+'\nOnderwerp: '+wat+'\nPagina: '+location.href;
      location.href='mailto:info@nextgrowthdigital.nl?subject='+encodeURIComponent('Terugbelverzoek: '+wat)+'&body='+encodeURIComponent(body);
      ok.hidden=false;ok.textContent='Je e-mailprogramma opent met je gegevens. Verstuur het bericht, dan bellen we je dezelfde werkdag terug. Lukt dat niet? Bel 06 83 90 21 92.';
    });
  });
})();
