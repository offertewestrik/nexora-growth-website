import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CFG} from './catalog.js';
import {defaults,groups,normalize} from './engine.js';
import {detailFor,detailScenes} from './option-renders.js';
const detailGroups={
  tuin:['kwaliteit'],
  padel:['framekleur','verlichting','net','fundering'],
  voetbal:['vezel','vhoogte','belijning','omheining','verlichting','doeltype','invulling','vfundering']
};
test('every material, construction and accessory choice has an individual render',()=>{
  const reached=new Set();
  for(const application of ['tuin','padel','voetbal'])for(const location of ['binnen','buiten']){
    const state=defaults();Object.assign(state.sel,{toepassing:application,locatie:location});
    for(const group of groups(state.sel).filter(g=>detailGroups[application].includes(g.id)))for(const option of group.kz){
      const next=structuredClone(state);next.sel[group.id]=option.v;normalize(next);
      const image=detailFor(next,group.id,option.v);
      if(group.id==='verlichting'&&option.v==='geen'){assert.equal(image,null);continue;}
      assert.ok(image,application+' '+group.id+' '+option.v);
      assert.ok(detailScenes(next).some(c=>c.id===image.id));reached.add(image.id);
    }
    for(const extra of CFG.extra.filter(e=>!e.when||e.when(state.sel))){
      const next=structuredClone(state);next.extras[extra.v]=true;const image=detailFor(next,'extra',extra.v);
      assert.ok(image,extra.v);assert.ok(detailScenes(next).some(c=>c.id===image.id));reached.add(image.id);
    }
  }
  const manifest=JSON.parse(fs.readFileSync(new URL('../media/kunstgras-options/manifest.json',import.meta.url)));
  assert.equal(manifest.renders.length,51);
  assert.deepEqual([...reached].filter(id=>id!=='detail').sort(),manifest.renders.map(r=>r.id).sort());
  for(const image of manifest.renders)for(const file of [image.file,image.thumbnail]){
    const path=new URL('../media/kunstgras-options/'+file,import.meta.url);assert.ok(fs.statSync(path).size>1000,file);
  }
});
test('switching application removes unrelated extras and respects non-infill',()=>{
  const state=defaults();for(const e of CFG.extra)state.extras[e.v]=true;
  state.sel.toepassing='padel';assert.ok(detailScenes(state).every(c=>c.id.startsWith('padel-')));
  state.sel.toepassing='voetbal';state.sel.vezel='noninfill';normalize(state);
  const cards=detailScenes(state);assert.ok(cards.every(c=>c.id.startsWith('voetbal-')));
  assert.ok(!cards.some(c=>c.key==='invulling'));assert.ok(cards.some(c=>c.id==='voetbal-fundering-shockpad'));
  state.extras.scorebord=false;assert.ok(!detailScenes(state).some(c=>c.id==='voetbal-scorebord'));
});
test('indoor and outdoor lighting are separately resolved',()=>{
  const state=defaults();state.sel.toepassing='padel';
  for(const location of ['binnen','buiten'])for(const light of ['led4','led8']){
    state.sel.locatie=location;state.sel.verlichting=light;
    assert.equal(detailFor(state,'verlichting',light).id,'padel-'+light+'-'+location);
  }
});
