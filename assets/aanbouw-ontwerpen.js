(function(w){
 'use strict';
 var d=w.document, saved=null, key='ng-uitbouw-vergelijk-v1';
 function node(tag,text){var n=d.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
 function button(text,fn){var b=node('button',text);b.type='button';b.className='btn btn--ghost';b.onclick=fn;return b;}
 function say(s){d.getElementById('ngDesignStatus').textContent=s;}
 function clean(v,depth){
  if(depth>12)throw Error('Te veel gegevens');
  if(v===null||typeof v==='boolean')return v;
  if(typeof v==='number'){if(!isFinite(v)||Math.abs(v)>100000)throw Error('Ongeldige maat');return v;}
  if(typeof v==='string'){if(v.length>300||/[<>"&\\]/.test(v))throw Error('Ongeldige keuze');return v;}
  if(Array.isArray(v)){if(v.length>200)throw Error('Te veel onderdelen');return v.map(function(x){return clean(x,depth+1);});}
  if(v&&typeof v==='object'){var o={};Object.keys(v).forEach(function(k){if(!/^[a-zA-Z0-9_-]{1,80}$/.test(k)||['__proto__','constructor','prototype'].indexOf(k)>=0)throw Error('Ongeldige sleutel');o[k]=clean(v[k],depth+1);});return o;}
  throw Error('Ongeldig ontwerp');
 }
 function state(){var s=JSON.parse(JSON.stringify(w.NGKeuze()));delete s.lastImg;return clean(s,0);}
 function link(){var url=new URL(w.location.href);url.searchParams.delete('start');url.searchParams.set('type',w.NGKeuze().type);url.hash='ontwerp='+encodeURIComponent(JSON.stringify({v:1,st:state()}));if(url.href.length>24000)throw Error('Dit ontwerp is te groot voor een link. Bewaar het als PDF.');return url.href;}
 function restore(s){w.NGOntwerpHerstel(clean(s,0));}
 function table(){
  var target=d.getElementById('ngCompare');target.replaceChildren();if(!saved){target.appendChild(node('p','Bewaar een variant en pas daarna je keuzes aan om het verschil te zien.'));return;}
  var g=w.NGConfigGegevens(), t=node('table'),head=node('tr');['Keuze','Bewaarde variant','Huidig ontwerp'].forEach(function(v){head.appendChild(node('th',v));});t.appendChild(head);
  var rows=new Map();saved.regels.forEach(function(r){rows.set(r.label,[r.waarde,'–']);});g.regels.forEach(function(r){if(!rows.has(r.label))rows.set(r.label,['–',r.waarde]);else rows.get(r.label)[1]=r.waarde;});
  rows.forEach(function(v,k){if(v[0]===v[1]||k==='Nog te controleren')return;var tr=node('tr');tr.append(node('th',k),node('td',v[0]),node('td',v[1]));t.appendChild(tr);});
  var total=node('tr');total.append(node('th','Richtprijs incl. btw'),node('td',g.euro(saved.incl)),node('td',g.euro(g.incl)));t.appendChild(total);target.appendChild(t);
  var delta=g.incl-saved.incl;target.appendChild(node('p',delta===0?'De richtprijzen zijn gelijk.':'Je huidige ontwerp is '+g.euro(Math.abs(delta))+(delta>0?' duurder.':' voordeliger.')));
  target.appendChild(node('p','Bewaard op '+new Date(saved.time).toLocaleDateString('nl-NL')+'. Prijzen kunnen wijzigen; bij terugzetten wordt opnieuw gerekend.'));
  target.appendChild(button('Bewaarde variant terugzetten',function(){try{restore(saved.st);say('Bewaarde variant teruggezet en opnieuw berekend.');}catch(e){say('Deze variant kan niet worden teruggezet.');}}));
  target.appendChild(button('Vergelijking wissen',function(){saved=null;try{w.localStorage.removeItem(key);}catch(e){}table();say('Vergelijkingsvariant gewist.');}));
 }
 function init(){
  var panel=node('details');panel.className='ng-designs';panel.id='ngDesigns';panel.appendChild(node('summary','Bewaren, delen en vergelijken'));
  panel.appendChild(node('p','Je keuzes worden op dit apparaat automatisch bewaard. Met een ontwerplink kun je verder op een ander apparaat. De link bevat je ontwerp, geen contactgegevens of woningfoto.'));
  var actions=node('div');actions.className='ng-design-actions';
  actions.appendChild(button('Ontwerplink maken',async function(){try{var s=link(),input=d.getElementById('ngDesignLink');input.value=s;input.hidden=false;input.focus();input.select();try{await w.navigator.clipboard.writeText(s);say('Ontwerplink gekopieerd. Iedereen die toegang heeft tot deze website kan hem openen.');}catch(e){say('Kopieer de geselecteerde ontwerplink om je ontwerp te delen.');}}catch(e){say(e.message);}}));
  actions.appendChild(button('Bewaar als vergelijkingsvariant',function(){var g=w.NGConfigGegevens();try{saved={st:state(),regels:g.regels,incl:g.incl,time:Date.now()};try{w.localStorage.setItem(key,JSON.stringify(saved));say('Variant bewaard op dit apparaat. Pas nu je keuzes aan.');}catch(e){say('Variant bewaard voor deze sessie; opslag op dit apparaat is niet beschikbaar.');}table();}catch(e){say('Het ontwerp kan niet worden bewaard: '+e.message);}}));
  actions.appendChild(button('Ontwerpdocument / PDF',function(){w.NGConfigOverzicht.open();}));panel.appendChild(actions);
  var input=node('input');input.id='ngDesignLink';input.readOnly=true;input.hidden=true;input.setAttribute('aria-label','Ontwerplink om te kopiëren');panel.appendChild(input);
  var status=node('p');status.id='ngDesignStatus';status.setAttribute('role','status');panel.appendChild(status);
  var compare=node('div');compare.id='ngCompare';panel.appendChild(compare);d.getElementById('ngStepActions').after(panel);
  try{var raw=w.localStorage.getItem(key);if(raw&&raw.length<50000){var q=JSON.parse(raw);if(q.time>Date.now()-30*864e5&&Array.isArray(q.regels)&&typeof q.incl==='number'){clean(q.st,0);saved=q;}}}catch(e){}
  if(w.location.hash.indexOf('#ontwerp=')===0){try{if(w.location.hash.length>24000)throw Error();var data=JSON.parse(decodeURIComponent(w.location.hash.slice(9)));if(data.v!==1)throw Error();restore(data.st);panel.open=true;say('Gedeeld ontwerp geladen. De prijs is opnieuw berekend met de huidige tarieven.');}catch(e){panel.open=true;say('Deze ontwerplink is ongeldig of verouderd. Je bestaande keuzes zijn behouden.');}}
  table();
 }
 w.NGOntwerpen={update:function(){if(d.getElementById('ngCompare'))table();},link:link,clean:clean};
 d.addEventListener('DOMContentLoaded',init);
})(window);
