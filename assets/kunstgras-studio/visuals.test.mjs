import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CFG,ASSETS} from './catalog.js';
import {defaults,groups,normalize,choices,totals,preset,valid} from './engine.js';
import {sceneFor,colorVariants,optionScenes,legacyCandidates} from './visuals.js';
import {optionPlan} from './option-plan.js';
const exists=src=>fs.existsSync(new URL('../..'+src,import.meta.url));
test('all garden, padel and football main variants have full images and thumbnails',()=>{
  const seen=new Set();let combinations=0;
  for(const type of ['standaard','luxe'])for(const quality of ['java','dubai','ibiza','bali','dubaixl'])for(const color of ['natuurlijk','lentegroen','olijf']){
    const scene=sceneFor({toepassing:'tuin',tuintype:type,kwaliteit:quality,kleur:color});
    assert.ok(exists(scene.src),scene.src);assert.ok(exists(scene.thumb));seen.add(scene.id);combinations++;
  }
  for(const baankleur of ['blauw','groen','terracotta','zwart'])for(const locatie of ['binnen','buiten'])for(const uitvoering of ['standaard','panorama']){
    const scene=sceneFor({toepassing:'padel',baankleur,locatie,uitvoering});assert.ok(exists(scene.src),scene.src);assert.ok(exists(scene.thumb));seen.add(scene.id);combinations++;
  }
  for(const veld of ['panna','cruyff','half','heel'])for(const kleurstelling of ['klassiek','rood','groen','zwart']){
    const scene=sceneFor({toepassing:'voetbal',veld,kleurstelling});assert.ok(exists(scene.src),scene.src);assert.ok(exists(scene.thumb));seen.add(scene.id);combinations++;
  }
  assert.equal(combinations,62);assert.equal(seen.size,50);
});
test('every catalog option and extra appears in the option plan without changing prices or state',()=>{
  let checked=0;
  for(const toepassing of ['tuin','padel','voetbal']){
    const initial=defaults();initial.sel.toepassing=toepassing;
    for(const g of groups(initial.sel))for(const k of g.kz){
      const state=structuredClone(initial);state.sel[g.id]=k.v;normalize(state);
      const before=JSON.stringify(state),price=totals(state),plan=optionPlan(state);
      for(const c of choices(state))assert.ok(plan.includes(c.value.replaceAll('&','&amp;')),c.value);
      assert.ok(!/NaN|undefined/.test(plan));assert.equal(JSON.stringify(state),before);assert.deepEqual(totals(state),price);
      assert.ok(exists(sceneFor(state.sel).src));checked++;
    }
    for(const e of CFG.extra.filter(e=>!e.when||e.when(initial.sel))){
      const state=structuredClone(initial);state.extras[e.v]=true;
      assert.ok(optionPlan(state).includes(e.l.replaceAll('&','&amp;')),e.l);checked++;
    }
  }
  assert.ok(checked>80);console.log('Catalog choices checked:',checked);
});
test('sport schematic reflects total lighting, court count, line color, frame color and goals',()=>{
  for(const toepassing of ['padel','voetbal'])for(const verlichting of ['geen','led4','led8'])for(const banen of ['1','2','3','4']){
    const state=defaults();Object.assign(state.sel,{toepassing,verlichting,banen,framekleur:'wit',belijning:'geel',doeltype:'pro'});
    const plan=optionPlan(state);assert.equal((plan.match(/data-light=/g)||[]).length,{geen:0,led4:4,led8:8}[verlichting]);
    assert.equal((plan.match(/data-court=/g)||[]).length,toepassing==='padel'?Number(banen):1);
    assert.ok(plan.includes(toepassing==='padel'?'#ecece4':'#f4d849'));
    if(toepassing==='voetbal')assert.equal((plan.match(/data-goal="pro"/g)||[]).length,2);
  }
});
test('fallbacks and details never silently change the selected field or color',()=>{
  for(const veld of ['panna','cruyff','half','heel'])for(const kleurstelling of ['klassiek','rood','groen','zwart'])for(const omheining of ['hek','ballenvanger','boarding'])for(const belijning of ['wit','geel','blauw'])for(const verlichting of ['geen','led4','led8']){
    const s={toepassing:'voetbal',veld,kleurstelling,omheining,belijning,verlichting,doeltype:'pro'},base=sceneFor(s).legacy;
    assert.deepEqual(legacyCandidates(s),[base]);
    for(const detail of optionScenes(s,ASSETS))assert.ok(detail.src.startsWith('/assets/media/'+base+'-'));
  }
  assert.deepEqual(legacyCandidates({toepassing:'tuin',tuintype:'luxe',kwaliteit:'java',kleur:'olijf'}),['gras-luxe-kort-olijf']);
});
test('presets, color comparisons and non-infill remain consistent',()=>{
  for(let i=0;i<CFG.presets.length;i++){const state=preset(i);assert.ok(valid(state));assert.ok(exists(sceneFor(state.sel).src));}
  for(const toepassing of ['tuin','padel','voetbal']){
    const state=defaults();state.sel.toepassing=toepassing;
    for(const c of colorVariants(state.sel))assert.equal(sceneFor({...state.sel,[c.key]:c.value}).id,c.id);
  }
  const state=defaults();Object.assign(state.sel,{toepassing:'voetbal',vezel:'noninfill',vfundering:'lava'});normalize(state);
  assert.equal(state.sel.vfundering,'shockpad');assert.ok(!choices(state).some(c=>c.id==='invulling'));
});
