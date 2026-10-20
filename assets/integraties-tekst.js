(()=>{
 const roots=document.querySelectorAll('[data-ng-copy]');const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 roots.forEach(root=>{
  if(root.dataset.ngInitialized)return;root.dataset.ngInitialized='true';
  const explicit=[...root.querySelectorAll('[data-ng-reveal]')];
  const items=explicit.length?explicit:[...root.children];
  items.forEach((el,i)=>{el.setAttribute('data-ng-reveal','');el.style.setProperty('--ng-delay',Math.min(i*105,950)+'ms')});
  if(reduced.matches||!('IntersectionObserver'in window))return;
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){root.classList.add('ng-copy-visible');observer.unobserve(root)}})},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  // Visible by default if scripts fail; set up the observer before hiding content.
  observer.observe(root);root.classList.add('ng-copy-ready');
  reduced.addEventListener('change',e=>{if(e.matches){root.classList.add('ng-copy-visible');observer.disconnect()}});
 });
})();
