import {sceneFor,colorVariants} from './visuals.js';
import {detailScenes} from './option-renders.js';
const $=s=>document.querySelector(s);
export function createVisuals(assets,onColor){
  const tab=document.createElement('button');
  tab.id='detailTab';tab.dataset.view='detail';tab.setAttribute('aria-pressed','false');tab.textContent='Materiaal';
  $('#photoTab').before(tab);
  $('#photoView').insertAdjacentHTML('beforebegin','<div id="detailView" hidden></div>');
  $('#imageNote').insertAdjacentHTML('beforebegin','<div id="colorComparison" role="group" aria-label="Vergelijk kleuren"></div>');
  $('#sceneView').insertAdjacentHTML('beforeend','<p id="imageStatus" role="status"></p><button id="retryImage" class="outline" hidden>Opnieuw laden</button>');
  let key='',revision=0,lastState,activeDetailId='';
  $('#retryImage').addEventListener('click',()=>{key='';update(lastState);});
  const note='Sfeerimpressie. Kleur en structuur kunnen afwijken; maten, framekleur en extra opties zijn niet exact afgebeeld.';
  function update(state){
    lastState=state;const sel=state.sel,scene=sceneFor(sel);
    tab.textContent=sel.toepassing==='tuin'?'Materiaal':'Optiedetails';
    const colors=colorVariants(sel);
    $('#colorComparison').replaceChildren(...colors.map(c=>{
      const button=document.createElement('button');button.type='button';button.dataset.color=c.value;
      button.setAttribute('aria-pressed',String(sel[c.key]===c.value));
      const image=document.createElement('img');image.src=c.thumb;image.alt='';image.loading='lazy';image.width=420;image.height=236;
      const label=document.createElement('span');label.textContent=c.label;
      button.append(image,label);button.addEventListener('click',()=>{onColor(c.key,c.value);$('#colorComparison [data-color="'+c.value+'"]')?.focus({preventScroll:true});});
      return button;
    }));
    renderDetails(state);
    $('#hero').alt=scene.title+', sfeerimpressie';
    if(scene.id===key)return;
    key=scene.id;$('#retryImage').hidden=true;const request=++revision,img=$('#hero'),status=$('#imageStatus');
    img.style.visibility='hidden';$('#zoom').disabled=true;$('#sceneView').setAttribute('aria-busy','true');status.hidden=false;status.textContent='Sfeerbeeld wordt geladen…';$('#imageNote').textContent=scene.title+'. '+note;
    function attempt(src,fallback=false){
      const preload=new Image();
      preload.onload=()=>{
        if(request!==revision)return;
        img.src=src;img.style.visibility='visible';$('#zoom').disabled=false;status.hidden=true;$('#sceneView').setAttribute('aria-busy','false');
        $('#imageNote').textContent=scene.title+'. '+(fallback?'Tijdelijk bestaand sfeerbeeld. ':'')+note;
      };
      preload.onerror=()=>{
        if(request!==revision)return;
        if(!fallback&&assets.has(scene.legacy))return attempt('/assets/media/'+scene.legacy+'.jpg',true);
        $('#retryImage').hidden=false;status.textContent='Het sfeerbeeld is niet beschikbaar. Je keuzes en richtprijs blijven behouden.';$('#sceneView').setAttribute('aria-busy','false');
      };
      preload.src=src;
    }
    attempt(scene.src);
  }
  function renderDetails(state){
    const cards=detailScenes(state),details=$('#detailView');
    const active=cards.find(c=>c.id===activeDetailId)||cards[0];
    activeDetailId=active?.id||'';details.replaceChildren();
    const heading=document.createElement('h3');heading.textContent=state.sel.toepassing==='tuin'?'Materiaal en afwerking':'Jouw opties van dichtbij';
    const intro=document.createElement('p');intro.className='fine';intro.textContent='Bekijk iedere gekozen optie afzonderlijk. Het optieplan en overzicht tonen de volledige samenstelling.';
    details.append(heading,intro);
    if(!active){const empty=document.createElement('p');empty.textContent='Er zijn geen aanvullende opties geselecteerd.';details.append(empty);return;}
    const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption'),title=document.createElement('strong'),note=document.createElement('span');
    figure.className='detail-feature';image.src=active.src;image.alt=active.title;image.width=1672;image.height=941;
    title.textContent=active.title;note.textContent=active.note;caption.append(title,note);figure.append(image,caption);details.append(figure);
    const zoom=document.createElement('button');zoom.className='outline detail-zoom';zoom.textContent='Vergroot dit detail';zoom.disabled=true;
    image.onload=()=>{zoom.disabled=false;};
    image.onerror=()=>{image.hidden=true;zoom.disabled=true;note.textContent='Dit detailbeeld kan niet laden. Je keuze en prijs blijven behouden.';};
    zoom.addEventListener('click',()=>{$('#zoomImg').src=image.src;$('#zoomImg').alt=active.title;$('#zoomDialog').showModal();});details.append(zoom);
    const nav=document.createElement('div');nav.className='detail-nav';nav.setAttribute('role','group');nav.setAttribute('aria-label','Gekozen opties in beeld');
    for(const card of cards){
      const button=document.createElement('button');button.type='button';button.dataset.detailId=card.id;button.className='detail-choice';button.setAttribute('aria-pressed',String(card.id===activeDetailId));
      const thumb=document.createElement('img'),label=document.createElement('span');thumb.src=card.thumb;thumb.alt='';thumb.loading='lazy';thumb.width=420;thumb.height=236;label.textContent=card.title;
      thumb.onerror=()=>{thumb.hidden=true;};button.append(thumb,label);button.addEventListener('click',()=>{activeDetailId=card.id;renderDetails(lastState);$('#detailView [data-detail-id="'+card.id+'"]')?.focus({preventScroll:true});});nav.append(button);
    }
    details.append(nav);
  }
  function focusDetail(key,value){const card=detailScenes(lastState).find(c=>c.key===key&&c.value===value);if(card){activeDetailId=card.id;renderDetails(lastState);$('#announce').textContent='Detailbeeld bijgewerkt: '+card.title;}}
  return {update,focusDetail};
}
