(function (global) {
  'use strict';
  var doc=global.document, step=1, current=null, lastType=null, initialized=false;
  var names=['Maten','Buitenkant','Indeling','Afwerking','Overzicht'];
  var mapping={afmetingen:1,vorm:1,bouwmethode:1,material:2,facadeColor:2,roofing:2,skylight:2,accent:2,frameColor:2,zonw:2,indeling:3,voorz:3,bad:3,keuken:3,extraR:3,klimaat:4,elektra:4,fundering:4,achterom:4,btwbe:4,finish:4,finishPh:4,vloer:4,isolatie:4,extras:4};
  function el(id){return doc.getElementById(id);}
  function node(tag,text,cls){var e=doc.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
  function button(text,action,cls){var b=node('button',text,cls);b.type='button';b.addEventListener('click',action);return b;}
  function money(n){return global.NGAanbouwRegels.prijsTekst(n,current.incl,current.rate);}
  function voorbehoud(s){
    var notes=[];
    if(s.type==='uitbouw'||s.type==='aanbouw'){
      if(!s.fundering['doorbraak-standaard']&&!s.fundering['doorbraak-t-splitsing'])notes.push('doorbraak niet geselecteerd');
      if(!s.fundering['fundering-heipalen'])notes.push('eventuele heipalen/schroefpalen niet opgenomen');
    }
    notes.push('bodem, bereikbaarheid, constructie en eventuele vergunning na projectcontrole');
    return notes.join('; ')+'.';
  }
  function melding(text){var e=el('ngChoiceNotice');if(e){e.textContent=text;e.hidden=false;}}
  function scrollTo(e){if(e&&e.scrollIntoView)e.scrollIntoView({behavior:global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  /* Op een telefoon is de stappenbalk een strook die meeschuift; stap 4 en 5
     staan buiten beeld. Deze schuift alleen de strook zelf, dus de pagina
     springt er niet van. scrollIntoView zou hier ook verticaal scrollen. */
  function toonStap(b){
    var nav=el('ngSteps');
    if(!nav||!b||!nav.scrollTo||nav.scrollWidth<=nav.clientWidth+1)return;
    var r=b.getBoundingClientRect(),n=nav.getBoundingClientRect();
    nav.scrollBy({left:(r.left+r.width/2)-(n.left+n.width/2),behavior:global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  function ga(n){
    step=Math.max(1,Math.min(5,n));
    if(current)sync(current);
    scrollTo(el('ngSteps'));
    if(el('ngStepTitle'))el('ngStepTitle').focus({preventScroll:true});
  }
  function next(){if(step<5)ga(step+1);else{scrollTo(el('offerte'));el('f_naam').focus({preventScroll:true});}}
  function init(){
    if(initialized)return;initialized=true;
    doc.body.classList.add('ng-guided');
    var nav=el('ngSteps');
    names.forEach(function(name,i){var b=button((i+1)+'. '+name,function(){ga(i+1);});b.setAttribute('data-step',i+1);nav.appendChild(b);});
    var actions=el('ngStepActions');
    var back=button('← Vorige',function(){ga(step-1);},'btn btn--ghost');back.id='ngBack';actions.appendChild(back);
    var forward=button('Verder →',next,'btn btn--acc');forward.id='ngNext';actions.appendChild(forward);
    var layout=node('div',undefined,'ng-layout-step');layout.id='ngLayoutStep';
    layout.appendChild(node('p','Bepaal hoe je de extra ruimte wilt gebruiken. Met de plattegrondeditor kun je een scheidingswand en deur toevoegen.'));
    var edit=el('indelingBtn');if(edit)layout.appendChild(edit);
    el('groups').before(layout);
    var detail=node('details',undefined,'ng-price-detail');detail.id='ngPriceDetail';detail.appendChild(node('summary','Bekijk prijsopbouw'));
    var breakdown=node('div');breakdown.id='ngBreakdown';detail.appendChild(breakdown);
    doc.querySelector('.pricebar').appendChild(detail);
    var note=node('p',undefined,'ng-budget-note');note.id='ngBudgetNote';doc.querySelector('.pricebar').appendChild(note);
    var small=node('nav',undefined,'ng-mobile-progress');small.setAttribute('aria-label','Richtprijs en volgende stap');
    var amount=node('div');amount.appendChild(node('small','Indicatieve totaalprijs'));var value=node('strong');value.id='ngMobilePrice';amount.appendChild(value);var tax=node('small');tax.id='ngMobileTax';amount.appendChild(tax);small.appendChild(amount);
    var mb=button('Verder →',next,'btn btn--acc');mb.id='ngMobileNext';small.appendChild(mb);doc.body.appendChild(small);
    var taxes=node('p',undefined,'ng-tax-note');taxes.id='ngOptionTax';el('ngStepTitle').after(taxes);
    var fit=node('p',undefined,'ng-fit-note');fit.id='ngFitNote';el('groups').before(fit);
    var link=el('tekeningenBtn');if(link)link.addEventListener('click',function(){el('ngTechnical').open=true;});
  }
  function dimensions(){
    doc.querySelectorAll('#groups .dim__row').forEach(function(row){
      var range=row.querySelector('input[type=range]');if(!range||row.querySelector('.ng-number'))return;
      var label=row.querySelector('label');if(label)label.htmlFor=range.id;
      range.setAttribute('aria-label',(label?label.textContent:'Maat')+' schuifregelaar');
      var wrap=node('span',undefined,'ng-number');
      var minus=button('−',function(){adjust(-1);});minus.setAttribute('aria-label',(label?label.textContent:'Maat')+' verkleinen');
      var input=node('input');input.type='number';input.inputMode='decimal';input.min=range.min;input.max=range.max;input.step=range.step;input.value=range.value;input.setAttribute('aria-label',(label?label.textContent:'Maat')+' in meters');
      var plus=button('+',function(){adjust(1);});plus.setAttribute('aria-label',(label?label.textContent:'Maat')+' vergroten');
      function commit(v){
        if(!isFinite(v))v=Number(range.value);
        v=Math.round(Math.max(Number(range.min),Math.min(Number(range.max),v))*10)/10;
        range.value=v;input.value=v;range.dispatchEvent(new global.Event('input',{bubbles:true}));
        if(current)current.render();
      }
      function adjust(dir){commit(Number(range.value)+dir*Number(range.step));}
      input.addEventListener('change',function(){commit(input.value===''?NaN:Number(input.value));});
      input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();input.blur();}});
      range.addEventListener('input',function(){input.value=range.value;});
      range.addEventListener('change',function(){if(current)current.render();});
      wrap.append(minus,input,plus,node('span','m'));row.appendChild(wrap);
    });
  }
  function priceRows(){
    var p=current.price, box=el('ngBreakdown');box.replaceChildren();
    [['Basis + gekozen afwerking',p.base],['Opties en meer-/minderwerk',p.extra],['Transport en plaatsing',p.transport]].forEach(function(r){var line=node('div');line.append(node('span',r[0]),node('strong',money(r[1])));box.appendChild(line);});
    var vat=node('div');vat.append(node('span','Btw ('+Math.round(current.rate*100)+'%)'+(current.incl?' · inbegrepen':'')),node('strong',global.NGAanbouwRegels.prijsTekst(p.incl-p.excl,false,0)));box.appendChild(vat);
    el('ngBudgetNote').textContent=voorbehoud(current.state)+' De aannemer bevestigt de definitieve uitvoering en prijs in de offerte.';
    el('ngMobilePrice').textContent=money(p.excl);
    el('ngMobileTax').textContent=current.incl?'incl. '+Math.round(current.rate*100)+'% btw':'excl. btw';
    el('ngOptionTax').textContent='Alle bedragen '+(current.incl?'inclusief '+Math.round(current.rate*100)+'% btw':'exclusief btw')+'.';
    doc.querySelectorAll('[data-price-excl]').forEach(function(e){e.textContent=money(Number(e.dataset.priceExcl));});
  }
  function review(){
    var box=el('ngReview');box.replaceChildren();
    box.appendChild(node('h3','Controleer je samenstelling'));
    var dl=node('dl');
    current.summary().split('\n').filter(function(r){return r&&r.indexOf('Richtprijs')!==0;}).forEach(function(r){var i=r.indexOf(': '),row=node('div');row.append(node('dt',i<0?'':r.slice(0,i)),node('dd',i<0?r:r.slice(i+2)));dl.appendChild(row);});
    box.appendChild(dl);
    box.appendChild(button('Maten wijzigen',function(){ga(1);},'btn btn--ghost'));
    box.appendChild(node('p','De sfeerimpressie is geen exacte weergave. Je gekozen specificaties gaan mee met de aanvraag.','ng-image-note'));
  }
  function sync(ctx){
    current=ctx;init();
    if(lastType&&lastType!==ctx.state.type)step=1;lastType=ctx.state.type;
    doc.body.dataset.configStep=String(step);
    el('ngStepTitle').textContent=names[step-1];
    el('ngSteps').querySelectorAll('button').forEach(function(b){if(Number(b.dataset.step)===step){b.setAttribute('aria-current','step');toonStap(b);}else b.removeAttribute('aria-current');});
    el('groups').querySelectorAll('.grp[data-g]').forEach(function(g){g.hidden=(mapping[g.dataset.g]||4)!==step;});
    el('ngLayoutStep').hidden=step!==3||ctx.state.type!=='uitbouw';
    if(step===3&&ctx.state.type==='aanbouw'){
      el('ngLayoutStep').hidden=false;
      el('ngLayoutStep').querySelector('p').textContent='Bij dit projecttype wordt de definitieve indeling tijdens het adviesgesprek bepaald. Je kunt je wensen invullen bij de aanvraag.';
    }else el('ngLayoutStep').querySelector('p').textContent='Bepaal hoe je de extra ruimte wilt gebruiken. Met de plattegrondeditor kun je een scheidingswand en deur toevoegen.';
    el('ngReview').hidden=step!==5;el('offerte').hidden=step!==5;
    el('ngBack').hidden=step===1;
    el('ngNext').textContent=step===5?'Naar aanvraag ↓':'Verder naar '+names[step]+' →';
    el('ngMobileNext').textContent=step===5?'Naar aanvraag':'Verder →';
    ['tekeningenBtn','staalBtn','downloadBtn'].forEach(function(id){var b=el(id);if(b)el('ngTechnicalActions').appendChild(b);});
    doc.querySelectorAll('.pricebar__cta button').forEach(function(b){if(b.textContent.trim()==='Projectgegevens')el('ngTechnicalActions').appendChild(b);});
    var r=global.NGAanbouwRegels,max=r.maximalePui(ctx.state);
    var fit=el('ngFitNote');fit.hidden=step!==2||!r.vanToepassing(ctx.state);
    fit.textContent=max===null?'De wandopbouw wordt geladen…':'Beschikbare breedte voor een pui: '+max.toFixed(2).replace('.',',')+' m, na aftrek van de wandopbouw en ruimte naast de pui.';
    doc.querySelectorAll('input[name=g_accent]').forEach(function(i){i.disabled=!r.past(ctx.state,i.value);i.checked=i.value===ctx.state.accent;});
    var help={fundering:'Een doorbraak verbindt de uitbouw met je woning. Het type fundering en eventuele palen worden na beoordeling van de bodem en constructie bepaald. Een niet gekozen optie is niet in de prijs opgenomen. Noteer twijfel bij je aanvraag.',accent:'Een schuifpui schuift langs een vast deel. Openslaande deuren draaien naar buiten; daarvoor is ruimte nodig op het terras. Een vouwwand kan verder openen, met een pakket panelen aan de zijkant.',finish:'Casco is bedoeld om verder af te bouwen. Lees per pakket welke afwerking inbegrepen is. Meubels en inrichting in de sfeerimpressie maken geen deel uit van het pakket.'};
    Object.keys(help).forEach(function(k){var g=doc.querySelector('.grp[data-g="'+k+'"]');if(g&&!g.querySelector('.ng-choice-help')){var h=node('details',undefined,'ng-choice-help');h.append(node('summary','Hulp bij deze keuze'),node('p',help[k]));g.appendChild(h);}});
    dimensions();priceRows();if(step===5)review();
    if(global.NGOntwerpen)global.NGOntwerpen.update();
  }
  global.NGAanbouwUX={sync:sync,ga:ga,melding:melding,voorbehoud:voorbehoud};
})(window);
