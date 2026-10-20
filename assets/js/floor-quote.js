/* Floor studio PDF: the same configuration and price calculation as the UI.
 * No customer information leaves the browser when generating this document.
 */
(function(root){
'use strict';
const palette={ink:[23,27,28],gold:[167,132,67],muted:[103,108,107],line:[219,221,217],paper:[250,249,246]};
const clean=(value,max=5000)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/[→↗✓♡]/g,'').replace(/[–\u2014‑]/g,'-').slice(0,max).trim();
const money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n).replace(/\u00a0/g,' ');
const number=n=>Number(n).toLocaleString('nl-NL',{maximumFractionDigits:2});
function createDocument(model,images){
 if(!images.room)throw Error('Het gekozen kamerbeeld ontbreekt.');
 const {jsPDF}=root.jspdf;if(!jsPDF)throw Error('De PDF-opmaak is nog niet geladen.');
 const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
 for(const [key,name,style] of [['normal','StudioSans','normal'],['bold','StudioSans','bold'],['serif','StudioSerif','normal']]){doc.addFileToVFS(key+'.ttf',root.FloorQuoteFonts[key]);doc.addFont(key+'.ttf',name,style);}
 doc.setProperties({title:'Offertevoorstel: '+clean(model.product.name),subject:'Persoonlijk vloerplan en gespecificeerde offerte',author:model.company,creator:'Next Growth Vloerenstudio'});
 let y=0;const M=18,R=192,W=174;
 function color(c){doc.setTextColor(...palette[c]);}
 function text(s,x,at,size=10,font='StudioSans',style='normal',c='ink',options={}){doc.setFont(font,style);doc.setFontSize(size);color(c);doc.text(clean(s),x,at,options);}
 function lines(s,width,size=10,font='StudioSans',style='normal'){doc.setFont(font,style);doc.setFontSize(size);return doc.splitTextToSize(clean(s),width);}
 function paragraph(s,x,at,width=174,size=10,c='muted'){const a=lines(s,width,size);doc.setFont('StudioSans','normal');doc.setFontSize(size);color(c);doc.text(a,x,at,{lineHeightFactor:1.5});return at+a.length*size*.3528*1.5;}
 function rule(at){doc.setDrawColor(...palette.line);doc.setLineWidth(.25);doc.line(M,at,R,at);}
 function base(title,sub){doc.setFillColor(...palette.paper);doc.rect(0,0,210,297,'F');text(model.company,M,18,11,'StudioSans','bold');text(model.demo?'CONCEPTDEMO / NEXT GROWTH':'VLOERENSTUDIO',R,18,8,'StudioSans','normal','muted',{align:'right'});rule(26);text(title,M,49,29,'StudioSerif');if(sub)y=paragraph(sub,M,59,W,10);else y=59;y+=9;}
 function next(title,sub){doc.addPage();base(title,sub);}
 function ensure(h,title='Vervolg specificatie'){if(y+h>263){next(title,'Onderdeel van jouw persoonlijke vloerplan.');}}
 function fitImage(data,x,at,w,h){const info=doc.getImageProperties(data),scale=Math.min(w/info.width,h/info.height);doc.addImage(data,'JPEG',x+(w-info.width*scale)/2,at+(h-info.height*scale)/2,info.width*scale,info.height*scale,undefined,'FAST');}
 function detail(label,value){const a=lines(value,107,10);const h=Math.max(12,a.length*5+7);ensure(h,'Jouw productdetails');text(label,M,y+4,9,'StudioSans','normal','muted');doc.setFont('StudioSans','normal');doc.setFontSize(10);color('ink');doc.text(a,83,y+4,{lineHeightFactor:1.4});y+=h;rule(y-3);}
 base('Een vloer die bij je past.','Persoonlijk offertevoorstel');
 text(model.reference,M,83,9,'StudioSans','bold','gold');text(model.date,R,83,9,'StudioSans','normal','muted',{align:'right'});
 fitImage(images.room,M,94,W,116);
 text('JOUW GEKOZEN VLOER',M,223,8,'StudioSans','bold','gold');
 const title=lines(model.product.name,W,23,'StudioSerif');doc.setFont('StudioSerif','normal');doc.setFontSize(23);color('ink');doc.text(title.slice(0,2),M,235,{lineHeightFactor:1.15});
 const coverY=title.length>1?259:249;
 text(number(model.state.area)+' m²  /  '+model.product.patternLabel+'  /  '+model.product.typeLabel,M,coverY,10);
 paragraph(model.customer.name?'Samengesteld voor '+model.customer.name:'Samengesteld voor jouw woning',M,coverY+10,W,10);
 text('Vloerimpressie. Plint en bies: zie de afwerkingsdetails. Kleur en schaal zijn indicatief.',M,278,8,'StudioSans','normal','muted');
 next('Jouw vloer, tot in detail.','De productkeuze en ruimtes waarop dit voorstel is gebaseerd.');
 const productY=y;
 if(images.swatch)fitImage(images.swatch,M,productY,49,49);
 let infoY=paragraph(model.product.name,78,productY+5,114,16,'ink');
 infoY=paragraph(model.product.brand+(model.product.collection?' / '+model.product.collection:''),78,infoY+3,114,10);
 paragraph(model.product.color,78,infoY+3,114,10);
 y=productY+62;
 detail('Artikelnummer',model.product.sku||'Sfeercollectie');
 detail('Formaat',model.product.dimensions||'Te bevestigen bij de productkeuze');
 detail('Uitvoering',model.product.typeLabel+' / '+model.product.patternLabel);
 detail('Plinten',model.plint);
 if(model.product.source){detail('Productinformatie','Bekijk de officiële productpagina');doc.link(83,y-12,107,12,{url:model.product.source});}
 ensure(26);text('De ruimtes',M,y+6,18,'StudioSerif');y+=17;
 const roomRows=model.rooms.length?model.rooms:[{name:'Totale vloeroppervlakte',area:model.state.area}];
 for(const room of roomRows){const a=lines(room.name,126,10),h=Math.max(11,a.length*5+5);ensure(h,'Jouw ruimtes');doc.setFont('StudioSans','normal');doc.setFontSize(10);color('ink');doc.text(a,M,y+4);text(number(room.area)+' m²',R,y+4,10,'StudioSans','bold','ink',{align:'right'});y+=h;rule(y-2);}
 ensure(20);text('Totaal vloeroppervlak',M,y+7,11,'StudioSans','bold');text(number(model.state.area)+' m²',R,y+7,11,'StudioSans','bold','ink',{align:'right'});y+=23;

 if(images.finish){
  next('De afwerking maakt het af.','Jouw plintprofiel en eventuele band-en-biesafwerking.');
  if(images.border){
   const top=y;fitImage(images.finish,M,top,82,82);fitImage(images.border,110,top,82,82);
   text('Gekozen plint',M,top+94,16,'StudioSerif');paragraph(model.plint,M,top+106,82,11,'ink');
   text('Band en bies',110,top+94,16,'StudioSerif');paragraph(model.border,110,top+106,82,11,'ink');
   paragraph('Profielvoorbeeld. De gekozen kleur en maat staan in de specificatie.',M,top+131,82,9);
   paragraph('Detailimpressie van de zwarte lijn met randstrook. Breedte en uitvoering te bevestigen.',110,top+131,82,9);y=top+160;
  }else{fitImage(images.finish,M,y,W,100);y+=111;text('Gekozen plint',M,y,16,'StudioSerif');y+=11;y=paragraph(model.plint,M,y,W,11,'ink')+10;y=paragraph('Band en bies: '+(model.border||'niet geselecteerd'),M,y,W,10)+10;}
  paragraph('De detailbeelden tonen de vorm en afwerking als voorbeeld, niet de exacte geselecteerde vloer of plintkleur. Materiaal, kleur, hoogte en benodigde lengtes worden bij de offerte bevestigd.',M,y,W,9);
 }
 next('Een helder offerteoverzicht.',model.estimate.complete?'De onderstaande richtbedragen komen uit jouw configuratie.':'Alle gekozen onderdelen op een rij. Nog te bevestigen tarieven staan op aanvraag.');
 text('ONDERDEEL',M,y,8,'StudioSans','bold','muted');text('BEDRAG INCL. BTW',R,y,8,'StudioSans','bold','muted',{align:'right'});y+=6;rule(y);y+=5;
 for(const item of model.estimate.items){const a=lines(item.label,122,10),h=Math.max(20,a.length*5+14);ensure(h,'Offerteoverzicht (vervolg)');doc.setFont('StudioSans','normal');doc.setFontSize(10);color('ink');doc.text(a,M,y+4);text(money(item.gross),R,y+4,11,'StudioSans','bold','ink',{align:'right'});text(number(item.quantity)+' '+item.unit+' x '+money(item.rate*1.21)+' incl. btw',M,y+5+a.length*5,8,'StudioSans','normal','muted');y+=h;rule(y-3);}
 for(const item of model.estimate.pending){const a=lines(item,119,10),h=Math.max(17,a.length*5+9);ensure(h,'Offerteoverzicht (vervolg)');doc.setFont('StudioSans','normal');doc.setFontSize(10);color('ink');doc.text(a,M,y+4);text('Op aanvraag',R,y+4,10,'StudioSans','bold','gold',{align:'right'});y+=h;rule(y-3);}
 ensure(53);y+=5;doc.setFillColor(...palette.ink);const bh=model.estimate.items.length?42:26;doc.roundedRect(M,y,W,bh,2,2,'F');
 if(model.estimate.items.length){doc.setTextColor(220,222,218);doc.setFontSize(9);doc.text('Subtotaal excl. btw',M+7,y+9);doc.text(money(model.estimate.net),R-7,y+9,{align:'right'});doc.text('Btw 21%',M+7,y+16);doc.text(money(model.estimate.vat),R-7,y+16,{align:'right'});doc.setTextColor(255,255,255);doc.setFont('StudioSans','bold');doc.setFontSize(12);doc.text(model.estimate.complete?'Totaal incl. btw':'Bekend deel incl. btw',M+7,y+31);doc.text(money(model.estimate.gross),R-7,y+31,{align:'right'});}else{doc.setTextColor(255,255,255);doc.setFont('StudioSans','normal');doc.setFontSize(12);doc.text('Jouw offerte op maat',M+7,y+16);doc.setFont('StudioSans','bold');doc.text('Op aanvraag',R-7,y+16,{align:'right'});}y+=bh+11;
 const note=model.estimate.complete?'Dit is een offertevoorstel op basis van de configuratortarieven. Een adviseur bevestigt de definitieve prijs en uitvoering.':model.estimate.items.length?'Dit bedrag is uitsluitend het bekende deel. Posten op aanvraag zijn hier niet in opgenomen; het is geen totaalprijs.':'Er zijn nog geen definitieve tarieven gekoppeld. Dit document legt je keuzes vast en is geen vaste prijsaanbieding.';
 ensure(28);y=paragraph(note,M,y,W,10)+8;
 const preparation=[model.heating,model.screed,...model.extras];
 next('Klaar voor de volgende stap.','De gekozen vloeropbouw en de punten die we samen bevestigen.');
 if(images.build){fitImage(images.build,M,y,W,91);y+=100;}
 text('Jouw vloeropbouw',M,y,18,'StudioSerif');y+=11;
 for(const line of preparation){const a=lines(line,W,10);ensure(a.length*5+7,'Vloeropbouw (vervolg)');y=paragraph(line,M,y,W,10,'ink')+5;}
 ensure(49);text('Van voorstel naar uitvoering',M,y+3,18,'StudioSerif');y+=14;
 for(const line of ['1. Vergelijk de kleur met een fysieke staal in jouw eigen licht.','2. Laat ondergrond, maten, snijverlies en plintlengte controleren.','3. Bevestig de definitieve offerte, beschikbaarheid en planning.']){ensure(18);y=paragraph(line,M,y,W,10)+4;}
 if(model.customer.name){ensure(32);text('Voor wie we dit samenstellen',M,y,16,'StudioSerif');y+=10;for(const line of [model.customer.name,model.customer.place,model.customer.email,model.customer.phone].filter(Boolean)){ensure(12);y=paragraph(line,M,y,W,10,'ink')+3;}}
 if(model.customer.message){ensure(23);text('Jouw toelichting',M,y+5,16,'StudioSerif');y+=16;for(const line of lines(model.customer.message,W,10)){ensure(7,'Jouw toelichting (vervolg)');text(line,M,y,10,'StudioSans','normal','muted');y+=6;}y+=5;}
 ensure(28);y=paragraph(model.demo?'Conceptdemo van Next Growth voor vloerenzaken. Er is geen bestelling of aanvraag verstuurd. De aanvraagkoppeling en bedrijfstarieven worden afzonderlijk afgestemd.':'Dit document is geen opdrachtbevestiging. Een PDF-download verstuurt geen aanvraag. De bestaande aanvraagfunctie bevestigt het versturen afzonderlijk.',M,y+5,W,9)+6;
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);rule(285);text(model.reference,M,291,8,'StudioSans','normal','muted');text('Offertevoorstel / '+model.company,105,291,8,'StudioSans','normal','muted',{align:'center'});text(i+' / '+pages,R,291,8,'StudioSans','normal','muted',{align:'right'});}
 return doc;
}
let library;
function libraryReady(){if(root.jspdf&&root.FloorQuoteFonts)return Promise.resolve();if(!library)library=Promise.all([['jspdf','./assets/js/jspdf-4.2.1.umd.min.js'],['FloorQuoteFonts','./assets/js/floor-quote-fonts.js']].map(([key,url])=>root[key]?Promise.resolve():new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>{s.remove();reject(Error('De PDF-opmaak kon niet laden. Probeer opnieuw.'));};document.head.append(s);}))).catch(error=>{library=null;throw error;});return library;}

function imageData(url){return new Promise((resolve,reject)=>{const im=new Image();const timer=setTimeout(()=>{im.onload=im.onerror=null;reject(Error('Een afbeelding kon niet op tijd laden. Probeer opnieuw.'));},25000);im.onload=()=>{clearTimeout(timer);try{const c=document.createElement('canvas');const scale=Math.min(1,1800/im.naturalWidth);c.width=Math.round(im.naturalWidth*scale);c.height=Math.round(im.naturalHeight*scale);c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.92));}catch{reject(Error('Het gekozen beeld kan niet in de PDF worden opgenomen.'));}};im.onerror=()=>{clearTimeout(timer);reject(Error('De gekozen materiaalafbeelding is niet beschikbaar. Probeer opnieuw.'));};im.src=url;});}
async function generate(model){
 await libraryReady();let room,swatch;
 if(model.material){const url=new URL('./api/floor-material?id='+encodeURIComponent(model.material.id)+'&v=20260929',location.href).href;const canvas=document.createElement('canvas');await root.FloorProjection.render(canvas,model.material,{materialUrl:url});try{room=canvas.toDataURL('image/jpeg',.93);}catch{throw Error('Het kamerbeeld kon niet worden geëxporteerd. Vernieuw de pagina en probeer opnieuw.');}swatch=await imageData(url);}else{[room,swatch]=await Promise.all([imageData(model.roomUrl),imageData(model.swatchUrl)]);}
 const build=model.buildUrl?await imageData(model.buildUrl):null;
 const [finish,border]=await Promise.all([model.finishUrl?imageData(model.finishUrl):null,model.borderUrl?imageData(model.borderUrl):null]);
 const doc=createDocument(model,{room,swatch,build,finish,border});return {blob:doc.output('blob'),filename:'Offertevoorstel-'+model.reference+'.pdf',pages:doc.getNumberOfPages()};
}
root.FloorQuote={generate,createDocument};
})(typeof window==='undefined'?globalThis:window);
