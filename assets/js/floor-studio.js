
// Classify from the article's explicit supplier label, never from a colour or a neighbouring SKU.
function supplierPattern(product){
 if(['Design serie','Woven serie'].includes(product.collection))return 'supplier';
 const label=String(product.patternLabel||'').toLowerCase();
 if(/visgraat|herringbone/.test(label))return 'visgraat';
 if(/hongaarse|chevron/.test(label))return 'hongaarse';
 if(/tegel|tile/.test(label))return 'tegel';
 if(/plank/.test(label))return 'recht';
 return product.pattern;
}
const supplierProducts=JSON.parse(document.getElementById("supplier-catalog").textContent).products.map(p=>({...p,pattern:supplierPattern(p)}));
const materialSource=product=>'./api/floor-material?id='+encodeURIComponent(product.id)+'&v=20260929';
const supplierIndex=new Map(supplierProducts.map(p=>[p.id,p]));
const selectedProduct=s=>supplierIndex.get(s.product)||null;
const decors = [
 ['naturel','Naturel eiken','Warm & natuurlijk','warm',0],['licht','Licht eiken','Licht eiken','licht',0],['creme','Crème','Witgeolied eiken','licht',0],['zand','Zand','Zacht beige','licht',0],['rustiek','Rustiek Eiken','Levendige houtstructuur','warm',0],['greige','Greige','Grijs met een warme toon','licht',0],['gerookt','Gerookt eiken','Diep & karaktervol','donker',4],['boterkoek','Boterkoek','Goudbruin eiken','warm',0],['noten','Noten donker','Rijk donkerbruin','donker',4],['zwart','Zwart eiken','Donker & uitgesproken','donker',6],['beton','Betonlook','Rustig & mineraal','licht',0]
].map(([id,name,description,tone,rate])=>({id,name,description,tone,rate}));
const patterns = [{id:'recht',name:'Rechte plank',rate:0,description:'Rustig, tijdloos en ruimtelijk.'},{id:'visgraat',name:'Visgraat',rate:15,description:'Een klassieker met karakter.'},{id:'hongaarse',name:'Hongaarse punt',rate:22,description:'Strakke lijnen, luxe uitstraling.'}];
const types = [{id:'klik',name:'PVC klik',rate:0,description:'Zwevend gelegd op een geschikte ondervloer.'},{id:'dryback',name:'PVC dryback',rate:8,description:'Verlijmd op een voorbereide, vlakke ondergrond.'},{id:'spc',name:'SPC composiet',rate:12,description:'Een stijve kern. Ondervloer volgens productspecificatie.'}];
patterns.push({id:'tegel',name:'Tegels',rate:0,description:'Rechte tegelbanen met betonlook.'});
patterns.push({id:'supplier',name:'Leverancierspatroon',rate:0,description:'Uitvoering volgens het gekozen artikel.'});
types.push({id:'supplier',name:'Leveranciersuitvoering',rate:0,description:'Uitvoering volgens het gekozen artikel.'});
const selectionName=s=>{const p=selectedProduct(s);return p?p.brand+' · '+p.name:decors.find(d=>d.id===s.decor).name;};
const patternName=s=>selectedProduct(s)?.patternLabel||patterns.find(p=>p.id===s.pattern).name;
const typeName=s=>selectedProduct(s)?.typeLabel||types.find(t=>t.id===s.type).name;
const heatingOptions=[
 {id:'none',name:'Geen vloerverwarming',description:'Alleen je nieuwe vloer.',image:'dekvloer'},
 {id:'existing',name:'Al aanwezig',description:'De bestaande installatie behouden.',image:'dekvloer'},
 {id:'milled',name:'Ingefreesd',description:'Buizen in sleuven in de bestaande dekvloer.',image:'ingefreesd'},
 {id:'mesh',name:'Op netten',description:'Buizen bevestigd op staalnetten, met nieuwe zandcementvloer.',image:'netten'}
];
function drawBuild(){
 $('#heating-options').innerHTML=heatingOptions.map(h=>`<button class="heat-card" data-heating-system="${h.id}" aria-pressed="${state.heatingSystem===h.id}">${['milled','mesh'].includes(h.id)?`<img src="${media}vloer-${h.image}.webp" alt="" loading="lazy">`:''}<span><b>${h.name}</b><small>${h.description}</small>${['milled','mesh'].includes(h.id)?'<em>Prijs op aanvraag</em>':''}</span></button>`).join('');
 const h=heatingOptions.find(h=>h.id===state.heatingSystem);
 $('#build-phases').hidden=state.heatingSystem!=='mesh';$$('[data-build-phase]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.buildPhase===buildPhase));
 const image=state.heatingSystem==='mesh'&&buildPhase==='dekvloer'?'zandcement':state.heatingSystem==='milled'?'ingefreesd':state.heatingSystem==='mesh'?'netten':state.screed==='sandcement'?'zandcement':'dekvloer';
 $('#build-image').src=media+'vloer-'+image+'.webp';
 $('#build-image').alt=({ingefreesd:'Vloerverwarmingsbuizen in gefreesde sleuven',netten:'Vloerverwarmingsbuizen bevestigd op staalnetten',zandcement:'Een afgewerkte zandcementdekvloer',dekvloer:'Bestaande dekvloer vóór de vloerafwerking'})[image];
 $('#build-title').textContent=state.heatingSystem==='mesh'?'Op netten + zandcementvloer':state.screed==='sandcement'?'Nieuwe zandcementvloer':h.name;
 $('#build-caption').textContent=image==='zandcement'?'Afgewerkte zandcementvloer; deze aanlegimpressie toont een voorbeeld met vloerverwarming.':state.heatingSystem==='mesh'?'Aanleg vóór het aanbrengen van de zandcementvloer.':state.heatingSystem==='milled'?'Aanleg vóór het dichtzetten van de sleuven en de vloerafwerking.':'De dekvloer vóór de gekozen PVC-afwerking.';
 $$('[data-screed]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.screed===state.screed);b.disabled=state.heatingSystem==='mesh'&&b.dataset.screed==='none'||state.heatingSystem==='milled'&&b.dataset.screed==='sandcement';});
 $('#screed-note').textContent=state.heatingSystem==='mesh'?'Bij deze opbouw is een nieuwe zandcementvloer geselecteerd. Beide posten worden apart geoffreerd.':state.heatingSystem==='milled'?'Bij infrezen gebruiken we de bestaande dekvloer. Voor een nieuwe opbouw kies je op netten.':state.screed==='sandcement'?'Nieuwe zandcementvloer geselecteerd. Dikte, voorbereiding en prijs worden bij de offerte bevestigd.':'De bestaande dekvloer wordt beoordeeld op geschiktheid.';
}

const plintProfiles=[{id:'plat',name:'Platte plakplint',description:'Een lage, vlakke afdekstrip op de vloer.',image:'plint-plat'},{id:'recht',name:'Rechte plint',description:'Een strak, recht profiel langs de wand.',image:'plint-recht'},{id:'hoog',name:'Hoge plint',description:'Een hogere, rechte plint met meer nadruk.',image:'plint-hoog'},{id:'sier',name:'Sierplint',description:'Een klassiek profiel met gevormde bovenkant.',image:'plint-sier'}];
function finishName(s){return plintProfiles.find(p=>p.id===s.plintProfile).name;}
function borderName(s){return s.border==='black'?'Zwarte bies met randstrook':'Geen band of bies';}

const defaults = {product:'',decor:'naturel',pattern:'recht',type:'klik',area:25,room:'kamer',plint:'wit',plintProfile:'recht',border:'none',underlay:true,level:false,profiles:false,removal:false,heatingSystem:'none',screed:'none'};
function validate(input){
 if(!input || typeof input!=='object' || Array.isArray(input)) throw new Error('Ongeldige configuratie.');
 const s={...defaults,...input};
 if(typeof s.product!=='string'||s.product&&!supplierIndex.has(s.product))throw new Error('Dit leveranciersartikel staat niet in de gecontroleerde collectie.');
 for(const [key,list] of [['decor',decors.map(d=>d.id)],['pattern',patterns.map(d=>d.id)],['type',types.map(d=>d.id)],['heatingSystem',['none','existing','milled','mesh']],['screed',['none','sandcement']],['room',['kamer','luxe']],['plint',['wit','zwart','antraciet','vloer']],['plintProfile',plintProfiles.map(p=>p.id)],['border',['none','black']]]) if(!list.includes(s[key])) throw new Error('Ongeldige keuze: '+key);
 if(typeof s.area!=='number'||!Number.isFinite(s.area)||s.area<1||s.area>1000) throw new Error('Vul een oppervlakte in van 1 tot en met 1.000 m².');
 for(const key of ['underlay','level','profiles','removal']) if(typeof s[key]!=='boolean') throw new Error('Ongeldige optie: '+key);
 return Object.fromEntries(Object.keys(defaults).map(k=>[k,s[k]]));
}
function normalize(input){const s=validate(input);const product=selectedProduct(s);if(product){s.type=product.type;s.pattern=product.pattern;if(product.integratedUnderlay||product.type==='supplier')s.underlay=false;}else{if(s.type==='supplier')s.type='klik';if(s.pattern==='supplier')s.pattern='recht';if(s.decor==='beton'&&s.pattern==='recht')s.pattern='tegel';if(s.decor!=='beton'&&s.pattern==='tegel')s.pattern='recht';} if(s.type==='dryback'){s.underlay=false;} if(s.heatingSystem==='mesh')s.screed='sandcement'; if(s.heatingSystem==='milled')s.screed='none'; if(s.border==='black'&&(s.pattern!=='visgraat'||s.type!=='dryback'))s.border='none'; return s;}
const money = value => new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
function calculate(input){
 const s=normalize(input), decor=decors.find(d=>d.id===s.decor), type=types.find(d=>d.id===s.type), pattern=patterns.find(d=>d.id===s.pattern);
 const items=s.product?[]:[{label:'Vloer, leggen & standaard plinten',quantity:s.area,unit:'m²',rate:64}];
 if(!s.product&&decor.rate) items.push({label:'Decor: '+decor.name,quantity:s.area,unit:'m²',rate:decor.rate});
 if(!s.product&&type.rate) items.push({label:type.name,quantity:s.area,unit:'m²',rate:type.rate});
 if(!s.product&&pattern.rate) items.push({label:'Legpatroon: '+pattern.name,quantity:s.area,unit:'m²',rate:pattern.rate});
 if(s.underlay) items.push({label:'Geluidsondervloer',quantity:s.area,unit:'m²',rate:6});
 if(s.level) items.push({label:'Egaliseren',quantity:s.area,unit:'m²',rate:9});
 if(s.profiles) items.push({label:'Profielen & drempels',quantity:1,unit:'post',rate:95});
 if(s.removal) items.push({label:'Afvoer oude vloer',quantity:1,unit:'post',rate:180});
 items.forEach(item=>{item.cents=Math.round(item.quantity*item.rate*100);item.amount=item.cents/100;});
 const cents=items.reduce((a,b)=>a+b.cents,0),vatCents=Math.round(cents*21/100);
 // Allocate fractional VAT cents by largest remainder, preserving the invoice total.
 const shares=items.map((item,index)=>({index,fraction:(item.cents*21)%100})).sort((a,b)=>b.fraction-a.fraction||a.index-b.index);
 items.forEach(item=>item.vatCents=Math.floor(item.cents*21/100));
 const remainder=vatCents-items.reduce((n,item)=>n+item.vatCents,0);
 for(let i=0;i<remainder;i++)items[shares[i].index].vatCents++;
 items.forEach(item=>item.gross=(item.cents+item.vatCents)/100);
 const net=cents/100,vat=vatCents/100,gross=(cents+vatCents)/100;
 const pending=s.product?['Merkvloer, leggen & standaard plinten ('+selectionName(s)+')']:[];if(s.heatingSystem==='milled')pending.push('Vloerverwarming ingefreesd');if(s.heatingSystem==='mesh')pending.push('Vloerverwarming op netten');if(s.screed==='sandcement')pending.push('Zandcementvloer');if(s.plintProfile!=='recht')pending.push('Afwerking: '+finishName(s)+' (lengte en meerprijs te bevestigen)');if(s.border==='black')pending.push('Zwarte bies met randstrook (lengte en meerprijs te bevestigen)');return {items,net,vat,gross,perM2:gross/s.area,pending,complete:pending.length===0};
}
function changeType(input,type){const s=normalize(input);return normalize({...s,type,...(s.type!==type&&type==='dryback'?{underlay:false,level:true}:{})});}
function cleanRooms(input){if(!Array.isArray(input)||input.length>20)throw new Error('Gebruik maximaal 20 ruimtes.');return input.map(r=>{if(!r||typeof r.name!=='string'||!Number.isFinite(r.area)||r.area<1||r.area>1000)throw new Error('Controleer de ruimtes.');return {name:r.name.trim().slice(0,60)||'Ruimte',area:Math.round(r.area*100)/100};});}
function decodeDesign(raw){if(!raw||raw.v!==1)throw new Error('Deze samenstelling kan niet worden geopend.');const configuration=normalize(raw.configuration),rooms=cleanRooms(raw.rooms||[]);if(rooms.length&&Math.round(rooms.reduce((n,r)=>n+r.area,0)*100)!==Math.round(configuration.area*100))throw new Error('De ruimtes sluiten niet aan op de oppervlakte.');return {v:1,configuration,rooms};}
function summary(input){const s=normalize(input),p=calculate(s);return ['PVC-vloer · Next Growth','Richtprijs, geen definitieve offerte','',`Oppervlakte: ${s.area.toLocaleString('nl-NL')} m²`,`Vloer: ${selectionName(s)}`,...(selectedProduct(s)?[`Merk: ${selectedProduct(s).brand}`,`Collectie: ${selectedProduct(s).collection}`,`Kleur / code: ${selectedProduct(s).color}`,`Artikelnummer: ${selectedProduct(s).sku}`,`Productbron: ${selectedProduct(s).source}`,`Collectie gecontroleerd: ${selectedProduct(s).verified}`]:[]),`Type: ${typeName(s)}`,`Legpatroon: ${patternName(s)}`,`Plinten: ${finishName(s)}, ${s.plint==='vloer'?'Kleur vloer':s.plint}`,`Band en bies: ${borderName(s)}`,`Vloerverwarming: ${heatingOptions.find(h=>h.id===s.heatingSystem).name}`,`Dekvloer: ${s.screed==='sandcement'?'Nieuwe zandcementvloer':'Bestaande dekvloer behouden'}`,`Beeld: ${s.product?'Materiaalprojectie van het gekozen leveranciersartikel':s.room==='luxe'?'Luxe woonkamer · sfeerimpressie':'Woonkamer · sfeerimpressie'}`,'',...p.items.map(i=>`${i.label}: ${i.quantity} ${i.unit} × ${money(i.rate)} = ${money(i.amount)} excl. btw`),'',`Subtotaal excl. btw: ${money(p.net)}`,`Btw (21%): ${money(p.vat)}`,`${p.complete?'Totaal':'Bekend deel'} incl. btw: ${money(p.gross)}`,...p.pending.map(x=>x+': prijs op aanvraag, NIET in bovenstaand bedrag opgenomen'),'',s.product?'De merkgebonden vloerprijs en levering zijn op aanvraag. De bekende posten gebruiken de bestaande voorbereidingstarieven.':'Gebaseerd op de tarieven van de bestaande Next Growth-configurator.','Ondergrond, productgeschiktheid, plintlengte en uitvoeringsdetails worden bij inmeten gecontroleerd.','Geen extra snijverlies berekend: de bestaande basisprijs specificeert dit niet. Dit moet in de definitieve offerte worden bevestigd.','Afvoer is geen verwijdering. De oude vloer verwijderen en deuren inkorten zijn niet meegerekend.','nextgrowthdigital.nl · 06 83 90 21 92'].join('\n');}

const imageIdentity=s=>s.product?'article:'+s.product:[s.room,s.decor,s.pattern].join(':');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const media='./assets/media/floor-v3/';
let buildPhase='aanleg';
let catalogBrand='demo',catalogCollection='all',catalogColor='all',catalogPattern='all',catalogSearch='',catalogLimit=24;
let rooms=[],favorites=[],advice={heating:"onbekend",housing:"onbekend"};
let state={...defaults},step=0,tone='all',showNet=false,areaValid=true,imageTurn=0,photoInitialized=false,toastTimer;
const number=value=>Number(String(value).trim().replace(',','.'));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4000);}
function rateText(rate,unit='m²'){return rate?`+ ${money(rate*1.21)} / ${unit}`:'Inbegrepen';}
function imageSource(s){if(selectedProduct(s))return materialSource(selectedProduct(s));const pattern=['recht','visgraat','hongaarse'].includes(s.pattern)?s.pattern:'recht';return `${media}pvc-${s.room}-${s.decor}${pattern==='recht'?'':'-'+pattern}.webp`;}
function patternIcon(id){const p=id==='tegel'?'<path d="M1 1h34v26H1zM1 14h34M18 1v13M9 14v13M27 14v13"/>':id==='recht'?'<path d="M1 5h34M1 13h34M1 21h34M10 5v8m15 0v8M18 21v6"/>':id==='visgraat'?'<path d="m1 7 11-7 11 7M1 15l11-8 11 8M1 23l11-8 11 8m0-16 11-7m-11 15 11-8m-11 16 11-8"/>':'<path d="m2 0 15 9L32 0M2 9l15 9 15-9M2 18l15 9 15-9M17 0v27"/>';return `<svg viewBox="0 0 36 28" aria-hidden="true">${p}</svg>`;}
function swatchSource(s){return selectedProduct(s)?materialSource(selectedProduct(s)):`${media}pvc-swatch-${s.decor}.webp`;}
function drawCatalog(){
 const demo=catalogBrand==='demo';
 $('#demo-choices').hidden=!demo;$('#supplier-grid').hidden=demo;$('#catalog-search').closest('label').hidden=demo;$('#catalog-note').hidden=demo;
 for(const id of ['catalog-collection','catalog-color','catalog-pattern'])$('#'+id).closest('label').hidden=demo;
 $('#catalog-brand').value=catalogBrand;
 const brandRows=supplierProducts.filter(p=>catalogBrand==='all'||p.brand===catalogBrand);
 const collections=[...new Set(brandRows.map(p=>p.collection))].sort((a,b)=>a.localeCompare(b,'nl'));
 $('#catalog-collection').innerHTML='<option value="all">Alle collecties</option>'+collections.map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');$('#catalog-collection').value=catalogCollection;
 const base=brandRows.filter(p=>catalogCollection==='all'||p.collection===catalogCollection);
 const colors=[...new Set(base.map(p=>p.color))].sort((a,b)=>a.localeCompare(b,'nl',{numeric:true}));
 $('#catalog-color').innerHTML='<option value="all">Alle kleuren</option>'+colors.map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');$('#catalog-color').value=catalogColor;
 $('#catalog-pattern').value=catalogPattern;
 const needle=catalogSearch.trim().toLocaleLowerCase('nl');
 const filtered=base.filter(p=>(catalogColor==='all'||p.color===catalogColor)&&(catalogPattern==='all'||p.pattern===catalogPattern)&&(!needle||[p.brand,p.collection,p.name,p.color,p.sku].join(' ').toLocaleLowerCase('nl').includes(needle)));
 const showAllBelakos=catalogBrand==='Belakos'&&catalogPattern==='visgraat';
 const visibleLimit=showAllBelakos?filtered.length:catalogLimit;
 $('#catalog-count').textContent=demo?'11 sfeertinten':supplierProducts.length+' artikelen';
 $('#catalog-status').textContent=demo?'11 sfeertinten · 3 legpatronen · 2 voorbeeldruimtes. Geen merkartikelen.':filtered.length+' uitvoeringen gevonden · collectiecontrole 9 september 2026';
 $('#supplier-grid').innerHTML=filtered.slice(0,visibleLimit).map(p=>`<button class="supplier-card" data-product="${escape(p.id)}" aria-pressed="${state.product===p.id}" ${p.renderUnavailable?'disabled title="Juiste artikelbeeld wordt aangevuld"':''}>${p.renderUnavailable?'<span style="height:110px;display:grid;place-items:center;background:#eee;color:#555;font-size:12px">Beeld nog niet beschikbaar</span>':`<img src="${escape(materialSource(p))}" alt="" loading="lazy" referrerpolicy="no-referrer">`}<span><small>${escape(p.brand)} · ${escape(p.collection)}</small><b>${escape(p.color)}</b><small>${escape(p.patternLabel)} · ${escape(p.typeLabel)}</small><small>Art. ${escape(p.sku)}</small></span></button>`).join('')||'<p class="info-note">Geen artikelen bij deze filters. Probeer een andere kleur, collectie of zoekterm.</p>';
 $('#catalog-more').hidden=demo||filtered.length<=visibleLimit;
 const p=selectedProduct(state);$('#supplier-detail').hidden=!p;
 if(p)$('#supplier-detail').innerHTML=`Gekozen: <b>${escape(p.brand)} ${escape(p.name)}</b><br>Kleur ${escape(p.color)} · artikel ${escape(p.sku)}<br><a href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">Bekijk dit artikel bij ${escape(p.brand)} ↗</a><br>De officiële materiaalafbeelding wordt in onze vaste woonkamer geprojecteerd. Kleur onder dit licht en schaal zijn indicatief; controleer de fysieke staal. De vloerprijs is op aanvraag.<br><a href="${escape(p.image)}" target="_blank" rel="noopener noreferrer">Bekijk de officiële kleurstaal ↗</a>`;
}
function chooseProduct(id){const p=supplierIndex.get(id);if(!p||p.renderUnavailable)return;update({product:id,type:p.type,pattern:p.pattern,underlay:p.type==='klik'&&!p.integratedUnderlay,level:p.type==='dryback'?true:state.level});}
for(const key of ['brand','collection','color','pattern'])$('#catalog-'+key).addEventListener('change',e=>{if(key==='brand'){catalogBrand=e.target.value;catalogCollection='all';catalogColor='all';catalogPattern='all';catalogSearch='';$('#catalog-search').value='';}if(key==='collection'){catalogCollection=e.target.value;catalogColor='all';}if(key==='color')catalogColor=e.target.value;if(key==='pattern')catalogPattern=e.target.value;catalogLimit=24;if(key==='brand'&&catalogBrand==='demo'&&state.product){update({product:''});}else drawCatalog();});
$('#belakos-herringbone').addEventListener('click',()=>{catalogBrand='Belakos';catalogCollection='all';catalogColor='all';catalogPattern='visgraat';catalogSearch='';catalogLimit=24;$('#catalog-search').value='';drawCatalog();$('#catalog-brand').focus({preventScroll:true});});
$('#catalog-search').addEventListener('input',e=>{catalogSearch=e.target.value;catalogLimit=24;drawCatalog();});
$('#catalog-more').addEventListener('click',()=>{catalogLimit+=24;drawCatalog();});
function drawChoices(){
 drawBuild();drawCatalog();
 $('#swatches').innerHTML=decors.filter(d=>tone==='all'||d.tone===tone).map(d=>`<button class="swatch" data-decor="${d.id}" aria-pressed="${state.decor===d.id}" aria-label="${d.name}, ${d.description}${d.rate?', '+rateText(d.rate):''}"><img src="${media}pvc-swatch-${d.id}.webp" alt="" loading="lazy"><span>${d.name}</span></button>`).join('');
 $('#patterns').innerHTML=patterns.filter(p=>p.id!=='supplier'&&(state.decor==='beton'?p.id!=='recht':p.id!=='tegel')).map(p=>`<button class="pattern" data-pattern="${p.id}" aria-pressed="${state.pattern===p.id}" aria-label="${p.name}, ${rateText(p.rate)}">${patternIcon(p.id)}<span>${p.name}</span></button>`).join('');
 $('#types').innerHTML=types.filter(t=>t.id!=='supplier').map(t=>`<button class="type-option" data-type="${t.id}" aria-pressed="${state.type===t.id}"><span><b>${t.name}</b><small>${t.description}</small></span><span>${rateText(t.rate)}</span></button>`).join('');
 const extras=[['underlay','Geluidsondervloer',state.type==='dryback'?'Niet van toepassing bij verlijmd PVC.':'Controleer de product- en eventuele VvE-eisen.',6,'m²'],['level','Egaliseren','Voor een vlakke ondergrond. Opbouw na beoordeling.',9,'m²'],['profiles','Profielen & drempels','Een stelpost voor de overgangen.',95,'post'],['removal','Afvoer oude vloer','Afvoer; het verwijderen zelf is niet inbegrepen.',180,'post']];
 $('#extras').innerHTML=extras.map(([key,title,description,rate,unit])=>`<label class="extra-row"><input type="checkbox" data-extra="${key}" ${state[key]?'checked':''} ${key==='underlay'&&(state.type==='dryback'||selectedProduct(state)?.integratedUnderlay||state.type==='supplier')?'disabled':''}><span><b>${title}</b><small>${description}</small></span><span>${rateText(rate,unit)}</span></label>`).join('');
 $$('[data-plint]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.plint===state.plint));
 $$('[data-area]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.area)===state.area));
 $$('[data-room]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.room===state.room));
 const p=patterns.find(p=>p.id===state.pattern); $('#pattern-rate').textContent=rateText(p.rate);$('#pattern-description').textContent=p.description;
 const product=selectedProduct(state);
 if(product){$('#patterns').innerHTML=`<button class="pattern" aria-pressed="true" disabled>${patternIcon(product.pattern)}<span>${escape(product.patternLabel)}</span></button>`;$('#pattern-rate').textContent='Bij dit artikel';$('#pattern-description').textContent='Patroon en uitvoering horen bij het artikel. Selecteer een andere uitvoering in de collectie om te wisselen.';$('#types').innerHTML=`<div class="type-option"><span><b>${escape(product.typeLabel)}</b><small>${escape(product.name)}${product.dimensions?' · '+escape(product.dimensions):''}</small></span><span>Op aanvraag</span></div>`;}
 $$('[data-room]').forEach(b=>b.textContent=(b.dataset.room==='kamer'?'Woonkamer':'Luxe woonkamer'));
 $('.scene-switch').hidden=!!product;
 $('#own-photo').disabled=!!product;$('#own-photo').title=product?'De eigen-fotofunctie is beschikbaar bij onze sfeercollectie.':'';
 $('#preparation-note').textContent=state.type==='dryback'?(state.level?'Egaliseren is meegerekend. Een geluidsondervloer is bij deze verlijmde opbouw niet van toepassing.':'Egaliseren is niet meegerekend. Laat bevestigen dat je ondergrond al geschikt is voor verlijmd PVC.'):(state.underlay?'De geluidsondervloer is meegerekend. Geschiktheid en eventuele ingebouwde onderlaag worden bij de offerte gecontroleerd.':'Er is geen geluidsondervloer meegerekend. Controleer of je gekozen product een geschikte geïntegreerde onderlaag heeft.');
}
function drawPrice(){const p=calculate(state);$('#toolbar-price').textContent=areaValid?money(p.gross)+' · '+state.area.toLocaleString('nl-NL')+' m² · incl. btw':'Controleer je oppervlakte';$('#mobile-total').textContent=areaValid?money(p.gross):'Controleer m²';$('#mobile-area').textContent=state.area.toLocaleString('nl-NL')+' m² · incl. btw';$('#total').textContent=areaValid?money(p.gross):'Controleer m²';$('#dock-area').textContent=`Voor ${state.area.toLocaleString('nl-NL')} m²${rooms.length?' · '+rooms.length+' ruimtes':''}`;$('#per-m2').textContent=areaValid?`${money(p.perM2)} / m²`:'Voer je oppervlakte in';$('#next').disabled=!areaValid;
 $('#price-lines').innerHTML=p.items.map(i=>`<div class="price-line"><span>${i.label}<small>${i.quantity.toLocaleString('nl-NL')} ${i.unit} × ${money(i.rate*(showNet?1:1.21))}${showNet?' excl.':' incl.'} btw</small></span><span>${money(showNet?i.amount:i.gross)}</span></div>`).join('');
 $('#price-totals').innerHTML=`<div class="price-line"><span>Subtotaal excl. btw</span><span>${money(p.net)}</span></div><div class="price-line"><span>Btw · 21%</span><span>${money(p.vat)}</span></div><div class="price-line total-line"><span>Richtprijs incl. btw</span><span>${money(p.gross)}</span></div>`;
 const pendingText=p.pending.length?'Nog te offreren: '+p.pending.join(' + ')+'. Niet in dit bedrag opgenomen.':'';
 $('#pending-price').hidden=!p.pending.length;$('#pending-price').textContent=pendingText;
 $('.price-top .eyebrow').textContent=p.complete?'JOUW RICHTPRIJS':'BEKEND DEEL VAN JE PRIJS';
 if(!p.complete){$('#mobile-area').textContent='Extra posten op aanvraag';$('#toolbar-price').textContent+=' · aanvullende posten op aanvraag';$('#per-m2').textContent+=' · bekend deel';$('#price-lines').insertAdjacentHTML('beforeend',p.pending.map(x=>`<div class="price-line"><span>${escape(x)}<small>Hoeveelheid en tarief te bevestigen</small></span><span>Op aanvraag</span></div>`).join(''));$('#price-totals .total-line span').textContent='Bekend deel incl. btw';}
 $('#tax-toggle').textContent=showNet?'Toon incl. btw':'Toon excl. btw';$('#tax-toggle').setAttribute('aria-pressed',showNet);
 const d=decors.find(d=>d.id===state.decor),pat=patterns.find(p=>p.id===state.pattern),type=types.find(t=>t.id===state.type);
 if(state.product){$('#total').textContent=areaValid?'Op aanvraag':'Controleer m²';$('#mobile-total').textContent='Op aanvraag';$('#mobile-area').textContent=state.area.toLocaleString('nl-NL')+' m² · merkartikel';$('#toolbar-price').textContent=areaValid?'Merkvloer op aanvraag · '+state.area.toLocaleString('nl-NL')+' m²':'Controleer je oppervlakte';$('#per-m2').textContent='Inclusief leggen te offreren';$('.price-top .eyebrow').textContent='JOUW OFFERTE OP MAAT';}
 $('.price-inclusions').textContent=state.product?'Vloer, leggen en plinten worden samen geoffreerd.':'✓ Inclusief vloer, leggen en standaard plinten';
 $('#selection-summary').innerHTML=`<img src="${escape(swatchSource(state))}" alt=""><div><b>${escape(selectionName(state))}</b><small>${escape(patternName(state))} · ${escape(typeName(state))}</small><small>${state.area.toLocaleString('nl-NL')} m² · Plint: ${state.plint==='vloer'?'kleur vloer':state.plint}</small></div><button data-edit>Wijzigen</button>`;
}
async function drawImage(){const turn=++imageTurn;const identity=imageIdentity(state);$('#fullscreen').disabled=true;$('#retry-image').hidden=true;
 const projection=$('#material-projection'),chosen=selectedProduct(state);
 projection.hidden=true;
 if(chosen){
  $('#room-image').style.visibility='hidden';
  $('#scene-decor').textContent=chosen.brand+' '+chosen.color;
  $('.scene-tag').textContent='JOUW MERKVLOER IN ONZE KAMER';
  $('#scene-pattern').textContent=chosen.patternLabel.toUpperCase();
  $('#scene-description').textContent=chosen.collection+' · '+chosen.sku+' · schaal en kleur onder dit licht zijn indicatief';
  $('#image-status').hidden=false;$('#image-status').textContent='Je merkvloer wordt in de woonkamer gelegd…';
  if(chosen.renderUnavailable){$('#image-status').textContent='Voor dit artikel ontbreekt een gecontroleerd vloerbeeld. Kies voorlopig een ander artikel.';return;}
  try{const ready=await FloorProjection.render(projection,chosen,{isCurrent:()=>turn===imageTurn});if(!ready||turn!==imageTurn)return;projection.setAttribute('aria-label',chosen.brand+' '+chosen.name+' in onze vaste woonkamer, materiaalprojectie');projection.hidden=false;projection.dataset.selection=identity;$('#fullscreen').disabled=false;$('#image-status').hidden=true;}
  catch(error){if(turn!==imageTurn)return;$('#image-status').textContent='Het beeld van dit artikel kon niet laden. Je selectie is bewaard.';$('#retry-image').hidden=false;}
  return;
 }
 $('#room-image').style.visibility='hidden';
 const d=decors.find(d=>d.id===state.decor),p=patterns.find(p=>p.id===state.pattern),src=imageSource(state);const product=selectedProduct(state);$('#scene-decor').textContent=d.name;$('.scene-tag').textContent='EIGEN SFEERIMPRESSIE';$('#scene-pattern').textContent=(state.pattern==='supplier'?'Voorbeeld: rechte plank':patternName(state)).toUpperCase();$('#scene-description').textContent=product?'Voorbeeldruimte · geen exacte weergave van '+product.brand+' '+product.sku:d.description+' · sfeerimpressie';
 if($('#room-image').getAttribute('src')===src&&$('#room-image').complete&&$('#room-image').naturalWidth){$('#room-image').style.visibility='visible';$('#room-image').style.opacity='1';$('#room-image').dataset.selection=identity;$('#fullscreen').disabled=false;$('#image-status').hidden=true;return;}
 $('#image-status').textContent='Je vloerbeeld wordt geladen…';$('#image-status').hidden=false;$('#room-image').style.opacity='.4';
 const img=new Image();img.src=src;
 try{await img.decode();if(turn!==imageTurn)return;$('#room-image').src=src;$('#room-image').alt=`Eigen sfeerimpressie: ${d.name}, ${state.pattern==='supplier'?'rechte plank':patternName(state)}, ${state.room==='luxe'?'luxe woonkamer':'standaard kamer'}`;$('#room-image').style.opacity='1';$('#room-image').style.visibility='visible';$('#room-image').dataset.selection=identity;$('#fullscreen').disabled=false;$('#image-status').hidden=true;}
 catch{if(turn!==imageTurn)return;$('#room-image').style.visibility='hidden';$('#image-status').textContent='Dit vloerbeeld kon niet laden. Je keuzes zijn bewaard.';$('#retry-image').hidden=false;}
}

function finishImage(profile,s=state){return './assets/media/floor-finishes/'+profile.image+(s.plint==='zwart'?'-zwart':'')+'.webp';}
function drawFinishes(){
 $('#plint-profiles').innerHTML=plintProfiles.map(p=>`<button class="finish-card" data-plint-profile="${p.id}" aria-pressed="${p.id===state.plintProfile}"><img src="${finishImage(p)}" alt="" loading="lazy"><span>${p.name}</span></button>`).join('');
 const profile=plintProfiles.find(p=>p.id===state.plintProfile);$('#plint-detail-image').src=finishImage(profile);$('#plint-detail-image').alt='Detailvoorbeeld: '+profile.name+(state.plint==='zwart'?' in zwart':'');$('#plint-detail-title').textContent=profile.name;
 $('#plint-detail-caption').textContent=profile.description+' Profielvoorbeeld; gekozen kleur: '+(state.plint==='vloer'?'kleur vloer':state.plint)+'. Hoogte, materiaal en leverbaarheid worden bevestigd.';
 const available=state.pattern==='visgraat'&&state.type==='dryback';
 $$('[data-border]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.border===state.border);b.disabled=b.dataset.border==='black'&&!available;});
 $('#border-preview').hidden=state.border!=='black';$('#border-note').textContent=available?'Een smalle zwarte lijn tussen het visgraatvlak en een rechte randstrook. Uitvoering en prijs op aanvraag.':'Kies een verlijmde visgraatvloer om een zwarte bies met randstrook toe te voegen.';
}

function update(patch={},image=true){$('#pdf-ready').hidden=true;$('#quote-pdf-ready').hidden=true;state=normalize({...state,...patch});drawChoices();drawFinishes();drawPrice();if(image)drawImage();persist();}
function setArea(value){const n=number(value);areaValid=Number.isFinite(n)&&n>=1&&n<=1000;$('#area-error').hidden=areaValid;$('#area').setAttribute('aria-invalid',!areaValid);if(!areaValid){$('#area-error').textContent='Vul een getal van 1 tot en met 1.000 m² in.';drawPrice();return false;}if(rooms.length){rooms=[];drawRooms();toast('Handmatige oppervlakte gebruikt. De ruimtelijst is vervangen.');}update({area:Math.round(n*100)/100},false);return true;}
function go(next,focus=true){if(!areaValid&&next!==1){toast('Controleer eerst je oppervlakte.');next=1;}step=next;$$('[data-panel]').forEach(p=>p.hidden=Number(p.dataset.panel)!==step);$$('[data-step]').forEach(b=>{if(Number(b.dataset.step)===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});$('#back').hidden=step===0;$('#next').innerHTML=['Verder naar je ruimte','Kies je afwerking','Bekijk jouw vloer','Vraag vrijblijvend een offerte aan'][step]+' <span aria-hidden="true">→</span>';$('#view-price').hidden=step===3;
 if(focus){const heading=$(`[data-panel="${step}"] h2`);heading.tabIndex=-1;heading.focus({preventScroll:true});if(matchMedia('(max-width:800px)').matches)$('#controls').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}}
function openQuote(){prepareQuote();if(!areaValid){go(1);return;}$('#quote-preview').textContent=`${selectionName(state)} · ${state.area.toLocaleString('nl-NL')} m² · ${state.product?'Merkvloer op aanvraag':money(calculate(state).gross)+' incl. btw'+(calculate(state).complete?'':' (bekend deel; aanvullende posten op aanvraag)')}`;$('#quote-dialog').showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.product){chooseProduct(b.dataset.product);$(`[data-product="${state.product}"]`)?.focus({preventScroll:true});}
 if(b.dataset.buildPhase){buildPhase=b.dataset.buildPhase;drawBuild();}
 if(b.dataset.heatingSystem){buildPhase='aanleg';update({heatingSystem:b.dataset.heatingSystem},false);$(`[data-heating-system="${state.heatingSystem}"]`)?.focus({preventScroll:true});}
 if(b.dataset.screed){update({screed:b.dataset.screed},false);}
 if(b.dataset.decor){update({product:'',decor:b.dataset.decor});$(`[data-decor="${state.decor}"]`)?.focus({preventScroll:true});}
 if(b.dataset.pattern){update({pattern:b.dataset.pattern});$(`[data-pattern="${state.pattern}"]`)?.focus({preventScroll:true});}
 if(b.dataset.type){const type=b.dataset.type;update(changeType(state,type));$(`[data-type="${type}"]`)?.focus({preventScroll:true});}
 if(b.dataset.plint)update({plint:b.dataset.plint},false);
 if(b.dataset.plintProfile)update({plintProfile:b.dataset.plintProfile},false);
 if(b.dataset.border)update({border:b.dataset.border},false);
 if(b.dataset.room)update({room:b.dataset.room});
 if(b.dataset.tone){tone=b.dataset.tone;$$('[data-tone]').forEach(x=>x.setAttribute('aria-pressed',x===b));drawChoices();}
 if(b.dataset.step!==undefined)go(Number(b.dataset.step));
 if(b.dataset.area){$('#area').value=b.dataset.area;setArea(b.dataset.area);}
 if(b.hasAttribute('data-edit'))go(0);
 if(b.hasAttribute('data-close'))b.closest('dialog').close();
 if(b.dataset.preset){const presets={natural:{decor:'naturel',pattern:'recht',type:'klik'},herringbone:{decor:'gerookt',pattern:'visgraat',type:'dryback',underlay:false,level:true},mineral:{decor:'beton',pattern:'recht',type:'spc',plint:'antraciet'}};const area=state.area;state={...state,...presets[b.dataset.preset],product:'',area};catalogBrand='demo';tone='all';$$('[data-tone]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.tone==='all'));update();drawRooms();drawAdvice();drawFavorites();go(0,false);toast('Stijl toegepast. Je oppervlakte is behouden.');}
});
document.addEventListener('change',e=>{if(e.target.dataset.extra){const key=e.target.dataset.extra;update({[key]:e.target.checked},false);$(`[data-extra="${key}"]`)?.focus({preventScroll:true});}});
$('#area').addEventListener('input',e=>setArea(e.target.value));
$('#use-dimensions').addEventListener('click',()=>{const l=number($('#length').value),w=number($('#width').value);if(!Number.isFinite(l)||!Number.isFinite(w)||l<=0||w<=0||l*w<1||l*w>1000){toast('Vul geldige maten in. Het resultaat moet tussen 1 en 1.000 m² liggen.');return;}const area=Math.round(l*w*100)/100;$('#area').value=String(area).replace('.',',');setArea(area);toast(`${area.toLocaleString('nl-NL')} m² overgenomen.`);});
$('#next').addEventListener('click',()=>step===3?openQuote():go(step+1));$('#back').addEventListener('click',()=>go(step-1));$('#mobile-overview').addEventListener('click',()=>go(3));$('#view-price').addEventListener('click',()=>go(3));$('#tax-toggle').addEventListener('click',()=>{showNet=!showNet;drawPrice();});
$('#retry-image').addEventListener('click',()=>drawImage());
$('#fullscreen').addEventListener('click',()=>{const img=$('#room-image'),large=$('#large-image'),projection=$('#material-projection');let copy=$('#large-projection');if(!copy){copy=document.createElement('canvas');copy.id='large-projection';copy.style.cssText='display:block;max-width:100%;max-height:85vh;object-fit:contain';large.after(copy);}const projected=!!selectedProduct(state)&&!projection.hidden&&projection.dataset.selection===imageIdentity(state);if(!selectedProduct(state)&&img.dataset.selection!==imageIdentity(state)){toast('Het beeld van je huidige keuze wordt nog geladen.');return;}if(selectedProduct(state)&&!projected){toast('Wacht tot het materiaalbeeld geladen is.');return;}large.hidden=projected;copy.hidden=!projected;copy.style.display=projected?'block':'none';if(projected){copy.width=projection.width;copy.height=projection.height;copy.getContext('2d').drawImage(projection,0,0);}else{large.src=img.src;large.alt=img.alt;}$('#image-dialog').showModal();});
$('#download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([fullSummary()],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Mijn-vloer-Next-Growth.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Je samenstelling is gedownload.');});
$('#own-photo').addEventListener('click',()=>{drawPhotoSelection();$('#photo-dialog').showModal();});
let submitting=false,quoteSent=false,inquiryReference='',quoteSnapshot='';
$('#quote-form').addEventListener('submit',async e=>{e.preventDefault();if(submitting)return;const f=e.currentTarget;if(!f.reportValidity())return;if(!areaValid)return;const data=new FormData(f);if(data.get('website'))return;submitting=true;if(!(await createFloorPdf())){submitting=false;return;}const button=$('#submit-quote'),status=$('#quote-status');button.disabled=true;button.textContent='Aanvraag versturen…';status.hidden=true;$('#email-fallback').hidden=true;
 const configuration=fullSummary(),payload={_subject:'Offerteaanvraag PVC-vloer: '+data.get('naam'),_template:'table',_replyto:data.get('email'),Product:'PVC-vloer',Referentie:inquiryReference,Verzoek:data.get('verzoek'),Naam:data.get('naam'),'E-mail':data.get('email'),Plaats:data.get('plaats'),Telefoon:data.get('telefoon')||'-',Bericht:data.get('bericht')||'-',Configuratie:configuration};
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch('https://formsubmit.co/ajax/info@nextgrowthdigital.nl',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});const result=await response.json();if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('not-confirmed');status.textContent='Bedankt! De verzenddienst heeft je aanvraag geaccepteerd. Next Growth neemt contact met je op.';button.textContent='Aanvraag verstuurd';quoteSent=true;f.querySelectorAll('input,textarea,select').forEach(el=>el.disabled=true);status.textContent+=' Referentie: '+inquiryReference;}
 catch{status.textContent='We hebben geen ontvangstbevestiging gekregen. Je gegevens zijn behouden. Je kunt je aanvraag zelf per e-mail versturen; vermeld dat dit mogelijk een herhaling is.';const body=Object.entries(payload).filter(([k])=>!k.startsWith('_')).map(([k,v])=>`${k}: ${v}`).join('\n\n');$('#email-fallback').href='mailto:info@nextgrowthdigital.nl?subject='+encodeURIComponent('Offerteaanvraag PVC-vloer')+'&body='+encodeURIComponent(body);$('#email-fallback').hidden=false;button.disabled=false;button.textContent='Opnieuw proberen';}
 finally{clearTimeout(timeout);status.hidden=false;submitting=false;}
});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
const storageKey='next-growth.floor-studio.v2';
function design(){return {v:1,configuration:{...state},rooms:rooms.map(r=>({...r}))};}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify({design:design(),favorites,advice}));$('#save-status').textContent='✓ Ontwerp bewaard op dit apparaat';}catch{$('#save-status').textContent='Bewaren is niet beschikbaar · gebruik Deel ontwerp';}}
function restore(){
 try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved){const d=decodeDesign(saved.design);state=d.configuration;rooms=d.rooms;favorites=(Array.isArray(saved.favorites)?saved.favorites:[]).slice(0,3).map(normalize);for(const key of ['heating','housing'])if([...$('#'+key).options].some(o=>o.value===saved.advice?.[key]))advice[key]=saved.advice[key];}}catch{toast('Een eerder ontwerp kon niet worden hersteld. Je kunt opnieuw beginnen.');}
 if(location.hash.startsWith('#vloer=')){try{const raw=location.hash.slice(7);if(raw.length>12000)throw new Error();const d=decodeDesign(JSON.parse(decodeURIComponent(raw)));state=d.configuration;rooms=d.rooms;history.replaceState(null,'',location.pathname+location.search);toast('Gedeeld ontwerp geopend.');}catch{toast('Deze ontwerplink is ongeldig. Je bewaarde ontwerp is behouden.');}}
 $('#area').value=String(state.area).replace('.',',');
}
function drawRooms(){
 $('#room-list').innerHTML=rooms.map((r,i)=>`<div class="room-row"><span>${escape(r.name)}<b>${r.area.toLocaleString('nl-NL')} m²</b></span><button data-remove-room="${i}" aria-label="Verwijder ${escape(r.name)}">×</button></div>`).join('');
 $('#room-total').textContent=rooms.length?`Totaal: ${rooms.reduce((n,r)=>n+r.area,0).toLocaleString('nl-NL',{maximumFractionDigits:2})} m². De vloerkeuzes gelden voor alle ruimtes.`:'Nog geen ruimtes toegevoegd.';
}
function useRooms(){areaValid=true;$('#area-error').hidden=true;$('#area').setAttribute('aria-invalid','false');const area=rooms.length?Math.round(rooms.reduce((n,r)=>n+r.area,0)*100)/100:defaults.area;$('#area').value=String(area).replace('.',',');update({area},false);drawRooms();}
$('#add-room').addEventListener('click',()=>{const area=number($('#room-area').value);try{const next=cleanRooms([...rooms,{name:$('#room-name').value||'Ruimte '+(rooms.length+1),area}]);if(next.reduce((n,r)=>n+r.area,0)>1000)throw new Error('Het totaal mag maximaal 1.000 m² zijn.');rooms=next;useRooms();$('#room-name').value='';$('#room-area').value='';$('#room-name').focus();}catch(e){toast(e.message);}});
function drawAdvice(){for(const key of ['heating','housing'])$('#'+key).value=advice[key];$('#advice-note').textContent=[advice.heating==='ja'?'Laat de warmteweerstand van de complete vloeropbouw en het opstookprotocol bevestigen.':'Een adviseur controleert product, ondergrond en de benodigde voorbereiding.',advice.housing==='appartement'?'Vraag de geluidseisen van je VvE op. Een geluidsondervloer alleen bewijst niet dat je aan die eisen voldoet.':''].filter(Boolean).join(' ');}
for(const key of ['heating','housing'])$('#'+key).addEventListener('change',e=>{advice[key]=e.target.value;drawAdvice();persist();});
function fullSummary(){return summary(state)+'\n\n'+(rooms.length?'Ruimtes:\n'+rooms.map(r=>r.name+': '+r.area.toLocaleString('nl-NL')+' m²').join('\n')+'\n\n':'')+'Advies over bestaande vloerverwarming: '+advice.heating+'; woning '+advice.housing+'.';}
function drawFavorites(){
 $('#compare-count').textContent=favorites.length;$('#compare-open').setAttribute('aria-label',`Vergelijk ${favorites.length} bewaarde varianten`);
 const prices=favorites.map(f=>calculate({...f,area:state.area}).gross),lowest=Math.min(...prices),comparable=favorites.every(f=>calculate(f).complete);
 $('#comparison-grid').innerHTML=favorites.length?favorites.map((f,i)=>{const s={...f,area:state.area,room:state.room},p=calculate(s);return `<article class="compare-card"><img src="${escape(imageSource(s))}" alt="${escape(selectionName(s))}, ${escape(patternName(s))}" loading="lazy"><div><p class="eyebrow">VARIANT ${i+1}</p><h3>${escape(selectionName(s))}</h3><p>${escape(patternName(s))} · ${escape(typeName(s))}</p><strong>${s.product?'Op aanvraag':money(p.gross)}</strong><p>${state.area.toLocaleString('nl-NL')} m² · incl. btw</p><p class="difference">${!comparable?'Definitieve prijzen vergelijken na offerte':p.gross===lowest?'Laagste richtprijs':money(p.gross-lowest)+' meer dan de laagste'}</p><p>${heatingOptions.find(h=>h.id===s.heatingSystem).name} · ${s.screed==='sandcement'?'Zandcementvloer':'Bestaande dekvloer'}</p>${p.pending.length?'<p class="pending-price">Bekend deel. '+escape(p.pending.join(' + '))+' nog op aanvraag.</p>':''}<p>Plint: ${s.plint==='vloer'?'kleur vloer':s.plint}</p><ul>${[['underlay','Geluidsondervloer'],['level','Egaliseren'],['profiles','Profielen'],['removal','Afvoer']].map(([k,v])=>`<li>${s[k]?'✓':'✕'} ${v}</li>`).join('')}</ul><button class="primary full" data-use-favorite="${i}">Kies deze vloer</button><button class="text-button full" data-remove-favorite="${i}">Verwijder variant ${i+1}</button></div></article>`;}).join(''):'<div class="empty-state"><h3>Welke vloeren wil je vergelijken?</h3><p>Kies een decor, patroon en afwerking. Druk op ‘Bewaar variant’ en probeer daarna een andere combinatie.</p></div>';
}
$('#save-comparison').addEventListener('click',()=>{if(!areaValid){go(1);return;}const keys=Object.keys(defaults).filter(k=>!['area','room'].includes(k));if(favorites.some(f=>keys.every(k=>f[k]===state[k]))){toast('Deze vloer staat al bij je varianten.');return;}if(favorites.length===3){drawFavorites();$('#compare-dialog').showModal();toast('Verwijder eerst een variant om een nieuwe te bewaren.');return;}favorites.push({...state});persist();drawFavorites();toast('Variant bewaard. Kies gerust een andere vloer om te vergelijken.');});
$('#compare-open').addEventListener('click',()=>{drawFavorites();$('#compare-dialog').showModal();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.removeRoom!==undefined){rooms.splice(Number(b.dataset.removeRoom),1);useRooms();}
 if(b.dataset.removeFavorite!==undefined){favorites.splice(Number(b.dataset.removeFavorite),1);persist();drawFavorites();$('#compare-title').tabIndex=-1;$('#compare-title').focus();}
 if(b.dataset.useFavorite!==undefined){update({...favorites[Number(b.dataset.useFavorite)],area:state.area,room:state.room});$('#compare-dialog').close();go(3);toast('Variant gekozen. Je huidige ruimtes zijn behouden.');}
});
$('#share').addEventListener('click',()=>{if(!areaValid){go(1);return;}$('#share-link').value=location.origin+location.pathname+'#vloer='+encodeURIComponent(JSON.stringify(design()));$('#share-status').textContent='';$('#share-dialog').showModal();});
$('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#share-link').value);$('#share-status').textContent='Link gekopieerd.';}catch{$('#share-link').focus();$('#share-link').select();$('#share-status').textContent='Selecteer en kopieer de link met je toetsenbord of telefoonmenu.';}});
$('#reset-design').addEventListener('click',()=>$('#reset-dialog').showModal());
$('#confirm-reset').addEventListener('click',()=>{rooms=[];advice={heating:'onbekend',housing:'onbekend'};state={...defaults};areaValid=true;tone='all';$('#area').value='25';$('#area-error').hidden=true;$('#area').setAttribute('aria-invalid','false');$$('[data-tone]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tone==='all'));if(location.hash.startsWith('#vloer='))history.replaceState(null,'',location.pathname+location.search);update();drawRooms();drawAdvice();$('#reset-dialog').close();go(0);});
function prepareQuote(){const next=fullSummary();if(quoteSent&&next===quoteSnapshot)return;if(next!==quoteSnapshot){quoteSnapshot=next;inquiryReference='NG-'+crypto.randomUUID().slice(0,8).toUpperCase();quoteSent=false;$('#quote-status').hidden=true;$('#email-fallback').hidden=true;$('#quote-form').querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=false);$('#submit-quote').textContent='Verstuur mijn aanvraag ↗';}}

let pdfWorking=false,pdfUrl='',pdfKey='',pdfReference='';
function quoteModel(){
 const configuration={...state},p=selectedProduct(configuration),f=$('#quote-form').elements;
 const customer={name:f.namedItem('naam').value.trim(),place:f.namedItem('plaats').value.trim(),email:f.namedItem('email').value.trim(),phone:f.namedItem('telefoon').value.trim(),message:f.namedItem('bericht').value.trim()};
 const product=p?{name:p.brand+' '+p.name,brand:p.brand,collection:p.collection,color:p.color,sku:p.sku,dimensions:p.dimensions,source:p.source,typeLabel:p.typeLabel,patternLabel:p.patternLabel}:{name:selectionName(configuration),brand:'Next Growth',collection:'Sfeercollectie',color:decors.find(d=>d.id===configuration.decor).name,sku:'',dimensions:'Product en formaat te bevestigen',source:'',typeLabel:typeName(configuration),patternLabel:patternName(configuration)};
 const key=JSON.stringify({configuration,rooms,customer});if(key!==pdfKey){pdfKey=key;pdfReference='VL-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomUUID().slice(0,6).toUpperCase();}
 return {company:"Next Growth",demo:false,reference:pdfReference,date:new Date().toLocaleDateString('nl-NL'),customer,product,material:p?{...p}:null,state:configuration,rooms:rooms.map(r=>({...r})),estimate:calculate(configuration),plint:finishName(configuration)+', '+(configuration.plint==='vloer'?'Kleur van de vloer':configuration.plint==='wit'?'Wit':configuration.plint==='zwart'?'Zwart':'Antraciet'),border:borderName(configuration),finishUrl:finishImage(plintProfiles.find(p=>p.id===configuration.plintProfile),configuration),borderUrl:configuration.border==='black'?'./assets/media/floor-finishes/bies-zwart.webp':null,heating:'Vloerverwarming: '+heatingOptions.find(h=>h.id===configuration.heatingSystem).name,screed:'Dekvloer: '+(configuration.screed==='sandcement'?'Nieuwe zandcementvloer':'Bestaande dekvloer behouden'),extras:[['level','Egaliseren geselecteerd'],['underlay','Geluidsondervloer geselecteerd'],['profiles','Profielen en drempels geselecteerd'],['removal','Afvoer van de oude vloer geselecteerd; verwijderen apart te beoordelen']].filter(([key])=>configuration[key]).map(([,label])=>label),roomUrl:imageSource(configuration),swatchUrl:swatchSource(configuration),buildUrl:['mesh','milled'].includes(configuration.heatingSystem)||configuration.screed==='sandcement'?$('#build-image').src:null};
}
async function createFloorPdf(){
 if(pdfWorking)return false;if(!areaValid){go(1);return false;}
 pdfWorking=true;const button=$('#print-design'),status=$('#pdf-status'),quoteStatus=$('#quote-status');
 button.disabled=true;status.hidden=false;status.textContent='Je offerte wordt opgemaakt, inclusief jouw vloerbeeld…';
 if($('#quote-dialog').open){quoteStatus.hidden=false;quoteStatus.textContent=status.textContent;}
 try{
  const model=quoteModel(),signature=pdfKey,result=await FloorQuote.generate(model);quoteModel();if(signature!==pdfKey)throw Error('Je samenstelling is gewijzigd. Maak de PDF opnieuw voor je nieuwste keuzes.');
  if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=URL.createObjectURL(result.blob);
  for(const id of ['pdf-ready','quote-pdf-ready']){const a=$('#'+id);a.href=pdfUrl;a.download=result.filename;a.hidden=false;a.textContent='Download jouw offerte-PDF ('+result.pages+' pagina’s)';}
  $('#pdf-ready').click();status.textContent='Je offerte-PDF is klaar, met jouw vloerbeeld en complete specificatie.';
  return true;
 }catch(error){status.textContent=error.message||'De PDF kon niet worden gemaakt. Je keuzes zijn behouden; probeer opnieuw.';if($('#quote-dialog').open){quoteStatus.hidden=false;quoteStatus.textContent=status.textContent;}return false;}
 finally{button.disabled=false;pdfWorking=false;}
}
$('#print-design').addEventListener('click',createFloorPdf);

window.addEventListener('afterprint',()=>$('#print-sheet').hidden=true);
// Photos are kept only in memory; no upload is made until the explicit render action.
let photoData=null,photoRequest=null,photoRevision=0,photoCache=new Map();
function drawPhotoSelection(){$('#photo-selection').textContent=`Je huidige stijl: ${selectionName(state)} · ${patternName(state)}.`;}
$('#photo-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;const revision=++photoRevision;photoRequest?.abort();photoData=null;$('#photo-generate').disabled=true;$('#photo-after-wrap').hidden=true;$('#photo-before-wrap').hidden=true;try{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024)throw new Error('Kies een JPG, PNG of WEBP van maximaal 12 MB.');
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});const scale=Math.min(1,1400/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();if(revision!==photoRevision)return;photoData=canvas.toDataURL('image/jpeg',.86);$('#photo-before').src=photoData;$('#photo-before-wrap').hidden=false;$('#photo-generate').disabled=false;$('#photo-clear').hidden=false;$('#photo-status').textContent='Foto klaar. Klik op ‘Maak de impressie’ om je foto en keuzes naar de beeldservice te versturen.';
 }catch(error){if(revision===photoRevision)$('#photo-status').textContent=error.message||'Deze foto kon niet worden gelezen. Probeer een andere foto.';}
});
$('#photo-clear').addEventListener('click',()=>{photoRevision++;photoRequest?.abort();photoData=null;photoCache.clear();$('#photo-file').value='';$('#photo-before').removeAttribute('src');$('#photo-after').removeAttribute('src');$('#photo-before-wrap').hidden=true;$('#photo-after-wrap').hidden=true;$('#photo-generate').disabled=true;$('#photo-clear').hidden=true;$('#photo-status').textContent='Foto van dit apparaat verwijderd. Eerder verzonden foto’s worden hiermee niet bij de beeldservice gewist.';});
$('#photo-cancel').addEventListener('click',()=>photoRequest?.abort());
$('#photo-generate').addEventListener('click',async()=>{if(!photoData||photoRequest||state.product)return;const snapshot={...state},source=photoData,revision=photoRevision,label=decors.find(d=>d.id===snapshot.decor).name+' · '+patterns.find(p=>p.id===snapshot.pattern).name;
 const key=JSON.stringify([source,snapshot.decor,snapshot.pattern,snapshot.plint,snapshot.area]);const show=url=>{$('#photo-after').src=url;$('#photo-after-wrap').hidden=false;$('#photo-result-label').textContent='AI-impressie · '+label;$('#photo-status').textContent='Impressie gereed voor '+label+'. Kleur, details en andere delen van je kamer kunnen afwijken.';};if(photoCache.has(key)){show(photoCache.get(key));return;}
 const controller=new AbortController();photoRequest=controller;$('#photo-generate').disabled=true;$('#photo-file').disabled=true;$('#photo-cancel').hidden=false;$('#photo-after-wrap').hidden=true;$('#photo-status').textContent='Je impressie wordt gemaakt. Dit kan ongeveer een minuut duren…';const timeout=setTimeout(()=>controller.abort(),90000);
 try{const decor=({rustiek:'eiken-rustiek',naturel:'eiken-naturel',noten:'noten',zwart:'antraciet',greige:'grijs',gerookt:'grijs',beton:'beton'})[snapshot.decor]||'eiken';const publicKey='sb_publishable_r-yX9wBX2UaM8iIXdjciJA_1AGlZ6qC';const response=await fetch('https://numqnwpkvlcxtvkiytmi.supabase.co/functions/v1/pool-render',{method:'POST',headers:{'Content-Type':'application/json',apikey:publicKey,Authorization:'Bearer '+publicKey},body:JSON.stringify({image:source,mode:'pvc',tenant:'next-growth',decor,patroon:snapshot.pattern==='hongaarse'?'hongaars':snapshot.pattern,m2:String(snapshot.area),plint:snapshot.plint}),signal:controller.signal});const result=await response.json();if(revision!==photoRevision)return;if(result.configured===false)throw new Error('De beeldservice is nog niet ingesteld. Je aanvraag is wel naar de service verstuurd; er is geen impressie gemaakt.');if(response.status===429)throw new Error('De beeldservice heeft het aanvraaglimiet bereikt. Probeer het later opnieuw.');if(!response.ok||!result.render_url)throw new Error('De beeldservice kon geen impressie maken. Je foto is behouden; probeer het later opnieuw.');const url=new URL(result.render_url);if(url.protocol!=='https:')throw new Error('De beeldservice gaf een ongeldig resultaat terug.');const image=new Image();await new Promise((resolve,reject)=>{const stop=()=>{image.removeAttribute?.("src");reject(new DOMException("Aborted","AbortError"));};controller.signal.addEventListener("abort",stop,{once:true});image.src=url.href;image.decode().then(resolve,reject).finally(()=>controller.signal.removeEventListener("abort",stop));if(controller.signal.aborted)stop();});if(revision!==photoRevision)return;if(photoCache.size>=3)photoCache.delete(photoCache.keys().next().value);photoCache.set(key,url.href);show(url.href);
 }catch(e){if(revision===photoRevision)$('#photo-status').textContent=e.name==='AbortError'?'Het wachten is gestopt. De beeldservice kan de al verzonden aanvraag nog verwerken. Je kunt later opnieuw proberen.':e.message;}
 finally{clearTimeout(timeout);photoRequest=null;$('#photo-file').disabled=false;$('#photo-cancel').hidden=true;$('#photo-generate').disabled=!photoData;}
});

$('#quote-form').addEventListener('input',()=>{$('#quote-pdf-ready').hidden=true;$('#pdf-ready').hidden=true;if(!submitting){quoteSent=false;$('#submit-quote').disabled=false;$('#submit-quote').textContent='Verstuur mijn aanvraag';}});
restore();update();drawRooms();drawAdvice();drawFavorites();go(0,false);
const context=document.modelContext;
if(context?.registerTool){const lifecycle=new AbortController();const result=()=>({configuration:{...state},estimate:calculate(state),step:step+1});const tools=[{name:'read_floor_configuration',description:'Read the selected PVC floor and itemized estimate. Does not submit an inquiry.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>result()},{name:'configure_floor',description:'Set floor choices and show the price overview. Does not send contact information or submit an inquiry.',inputSchema:{type:'object',properties:{product:{type:'string',enum:['',...supplierProducts.map(p=>p.id)]},decor:{type:'string',enum:decors.map(d=>d.id)},pattern:{type:'string',enum:patterns.map(p=>p.id)},type:{type:'string',enum:types.map(t=>t.id)},area:{type:'number',minimum:1,maximum:1000},heatingSystem:{type:'string',enum:['none','existing','milled','mesh']},screed:{type:'string',enum:['none','sandcement']},room:{type:'string',enum:['kamer','luxe']},plint:{type:'string',enum:['wit','zwart','antraciet','vloer']},plintProfile:{type:'string',enum:['plat','recht','hoog','sier']},border:{type:'string',enum:['none','black']},underlay:{type:'boolean'},level:{type:'boolean'},profiles:{type:'boolean'},removal:{type:'boolean'}},additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(Object.keys(input).some(k=>!Object.hasOwn(defaults,k)))throw new Error('Unknown field');const next=normalize({...state,...input});if(input.area!==undefined&&input.area!==state.area){rooms=[];drawRooms();}areaValid=true;$('#area').value=String(next.area).replace('.',',');$('#area').setAttribute('aria-invalid','false');$('#area-error').hidden=true;update(next);go(3,false);return result();}}];for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}

