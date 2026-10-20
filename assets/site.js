/* Video's in statische pagina's alleen afspelen als ze in beeld zijn. */
(function(){
  var vids=[].slice.call(document.querySelectorAll('video'));
  if(!vids.length)return;
  vids.forEach(function(v){v.removeAttribute('autoplay');v.muted=true;v.playsInline=true});
  if(!('IntersectionObserver' in window)){vids.forEach(function(v){v.play().catch(function(){})});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){v.play().catch(function(){})}else{v.pause()}})},{threshold:.35});
  vids.forEach(function(v){io.observe(v)});
})();
(function(){var b=document.querySelector('.menu'),n=document.getElementById('mnav');if(!b||!n)return;b.addEventListener('click',function(){var o=n.hasAttribute('hidden');if(o){n.removeAttribute('hidden')}else{n.setAttribute('hidden','')}b.setAttribute('aria-expanded',o?'true':'false');b.textContent=o?'Sluiten':'Menu'})})();
