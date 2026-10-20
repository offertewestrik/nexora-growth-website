const ROOT='/assets/media/kunstgras-v2/';
const pick=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
export function sceneFor(sel={}){
  const application=pick(sel.toepassing,['tuin','padel','voetbal'],'tuin');
  let id,legacy,title;
  if(application==='tuin'){
    const type=sel.tuintype==='luxe'?'luxe':'tuin';
    const pile={java:'kort',dubai:'medium',ibiza:'medium',bali:'lang',dubaixl:'lang'}[sel.kwaliteit]||'medium';
    const color=pick(sel.kleur,['natuurlijk','lentegroen','olijf'],'natuurlijk');
    id=[type,pile,color].join('-');
    legacy='gras-'+type+(pile==='medium'?'':'-'+pile)+(color==='natuurlijk'?'':'-'+color);
    title=(type==='luxe'?'Villatuin':'Tuin')+' · '+color+' · '+pile+' gras';
  }else if(application==='padel'){
    const color=pick(sel.baankleur,['blauw','groen','terracotta','zwart'],'blauw');
    const location=sel.locatie==='binnen'?'binnen':'buiten',type=sel.uitvoering==='panorama'?'panorama':'standaard';
    id=['padel',color,location,type].join('-');
    legacy='gras-padel-'+color+(location==='binnen'?'-binnen':'')+(type==='panorama'?'-panorama':'');
    title='Padel · '+color+' · '+location+' · '+type;
  }else{
    const field=pick(sel.veld,['panna','cruyff','half','heel'],'cruyff');
    const color=pick(sel.kleurstelling,['klassiek','rood','groen','zwart'],'klassiek');
    id='voetbal-'+field+(color==='klassiek'?'':'-'+color);legacy='gras-'+id;
    title=({panna:'Pannaveld',cruyff:'Compact speelveld',half:'Trainingsveld',heel:'Volledig veld'}[field])+' · '+(color==='klassiek'?'blauw / geel':color);
  }
  return {id,src:ROOT+id+'.webp',thumb:ROOT+id+'-thumb.webp',legacy,title};
}
export const legacyCandidates=sel=>[sceneFor(sel).legacy];
export function colorVariants(sel){
  const key=sel.toepassing==='padel'?'baankleur':sel.toepassing==='voetbal'?'kleurstelling':'kleur';
  const colors=key==='kleur'?['natuurlijk','lentegroen','olijf']:key==='baankleur'?['blauw','groen','terracotta','zwart']:['klassiek','rood','groen','zwart'];
  return colors.map(value=>({key,value,label:value==='klassiek'?'Blauw / geel':value,...sceneFor({...sel,[key]:value})}));
}
export function optionScenes(sel,assets){
  if(sel.toepassing!=='voetbal')return [];
  const base=sceneFor(sel).legacy;
  const options=[
    [sel.verlichting&&sel.verlichting!=='geen','avond','Avondverlichting'],
    [sel.omheining==='boarding','boarding','Boarding'],
    [sel.belijning==='geel','lijngeel','Gele belijning'],
    [sel.belijning==='blauw','lijnblauw','Blauwe belijning'],
    [sel.omheining==='ballenvanger','ballenvanger','Ballenvanger'],
    [sel.doeltype==='pro','doelpro','Grote doelen']
  ];
  return options.filter(([active,suffix])=>active&&assets.has(base+'-'+suffix)).map(([,suffix,title])=>({src:'/assets/media/'+base+'-'+suffix+'.jpg',title}));
}
export function choiceImage(url){
  const name=url.split('/').pop().replace(/\.jpg$/,'');
  const defaults={'gras-tuin':{},'gras-luxe':{tuintype:'luxe',kwaliteit:'dubaixl'},'gras-padel':{toepassing:'padel'},'gras-padel-blauw':{toepassing:'padel'},'gras-voetbal-cruyff':{toepassing:'voetbal'},'gras-voetbal':{toepassing:'voetbal'}};
  return name in defaults?sceneFor(defaults[name]).thumb:url;
}
