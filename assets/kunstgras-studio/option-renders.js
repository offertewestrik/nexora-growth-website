import {CFG} from './catalog.js';
import {groups,selected} from './engine.js';
const ROOT='/assets/media/kunstgras-options/';
const maps={
  tuin:{kwaliteit:{java:'tuin-pool-kort',dubai:'detail',ibiza:'detail',bali:'tuin-pool-lang',dubaixl:'tuin-pool-lang'}},
  padel:{framekleur:'frame',net:'net',fundering:'fundering'},
  voetbal:{vezel:'vezel',vhoogte:'hoogte',belijning:'belijning',omheining:'omheining',doeltype:'doel',invulling:'invulling',vfundering:'fundering'}
};
export function detailFor(state,key,value){
  const s=state.sel,application=s.toepassing;
  let id;
  if(key==='extra'){
    if(!CFG.extra.some(e=>e.v===value&&(!e.when||e.when(s))))return null;
    id=application+'-'+value;
  }else if(key==='verlichting'&&['padel','voetbal'].includes(application)){
    if(!['led4','led8'].includes(value))return null;
    id=application+'-'+value+(application==='padel'?'-'+(s.locatie==='binnen'?'binnen':'buiten'):'');
  }else{
    const mapping=maps[application]?.[key];
    if(!mapping)return null;
    if(typeof mapping==='object')id=mapping[value];
    else{
      const group=groups(s).find(g=>g.id===key);
      if(!group?.kz.some(k=>k.v===value))return null;
      id=application+'-'+mapping+'-'+value;
    }
  }
  if(!id)return null;
  const base=id==='detail'?'/assets/media/kunstgras-v2/detail':ROOT+id;
  return {id,key,value,src:base+'.webp',thumb:base+'-thumb.webp'};
}
export function detailChoiceImage(state,key,value){return detailFor(state,key,value)?.thumb||'';}
export function detailScenes(state){
  const cards=[];
  if(state.sel.toepassing==='tuin'){
    const group=groups(state.sel).find(g=>g.id==='kwaliteit'),product=selected(group,state);
    cards.push({id:'staal-'+product.v,key:'staal',value:product.v,src:product.img,thumb:product.img,title:'Assortimentsbeeld · '+product.l,note:'Bestaand assortimentsbeeld. Vraag een fysiek staal om het product te beoordelen.'});
  }
  for(const group of groups(state.sel)){
    const option=selected(group,state),scene=detailFor(state,group.id,option.v);
    if(scene)cards.push({...scene,title:group.t+' · '+option.l,note:group.id==='kwaliteit'||['vezel','vhoogte'].includes(group.id)?'Algemene structuurimpressie; geen exacte weergave van dit product of de poolhoogte.':'Impressie van deze afzonderlijke optie. Overige materialen, kleuren en plaatsing kunnen afwijken.'});
  }
  for(const extra of CFG.extra.filter(e=>state.extras[e.v]&&(!e.when||e.when(state.sel)))){
    const scene=detailFor(state,'extra',extra.v);
    if(scene)cards.push({...scene,title:extra.l,note:'Voorbeeld van deze extra optie; uitvoering en positie worden bij het project bepaald.'});
  }
  return cards;
}
