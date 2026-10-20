import test from 'node:test';
import assert from 'node:assert/strict';
import {createVisuals} from './visual-ui.js';
import {defaults} from './engine.js';
import {ASSETS} from './catalog.js';
class Element{
  constructor(){this.dataset={};this.attributes={};this.style={};this.children=[];this.events={};this.hidden=false;}
  setAttribute(k,v){this.attributes[k]=String(v);}
  before(){}
  insertAdjacentHTML(){}
  replaceChildren(...children){this.children=children;}
  append(...children){this.children.push(...children);}
  addEventListener(event,handler){this.events[event]=handler;}
  focus(){}
}
test('image loading ignores stale responses, uses exact fallback and recovers after failure',()=>{
  const nodes=new Map(),requests=[];
  global.document={querySelector:key=>{if(!nodes.has(key))nodes.set(key,new Element());return nodes.get(key);},createElement:()=>new Element()};
  global.Image=class extends Element{set src(value){this.url=value;requests.push(this);}};
  const ui=createVisuals(ASSETS,()=>{}),state=defaults(),hero=document.querySelector('#hero'),status=document.querySelector('#imageStatus');
  ui.update(state);const first=requests.at(-1);
  state.sel.kleur='olijf';ui.update(state);const second=requests.at(-1);
  first.onload();assert.equal(hero.style.visibility,'hidden');assert.equal(hero.src,undefined);
  second.onload();assert.ok(hero.src.endsWith('tuin-medium-olijf.webp'));assert.equal(status.hidden,true);assert.equal(document.querySelector('#zoom').disabled,false);
  state.sel.kleur='lentegroen';ui.update(state);requests.at(-1).onerror();
  assert.equal(requests.at(-1).url,'/assets/media/gras-tuin-lentegroen.jpg');
  requests.at(-1).onerror();assert.equal(hero.style.visibility,'hidden');assert.equal(document.querySelector('#zoom').disabled,true);assert.equal(document.querySelector('#retryImage').hidden,false);
  document.querySelector('#retryImage').events.click();assert.ok(requests.at(-1).url.endsWith('tuin-medium-lentegroen.webp'));requests.at(-1).onload();assert.equal(hero.style.visibility,'visible');
  state.sel.tuintype='luxe';state.sel.kwaliteit='java';ui.update(state);const count=requests.length;requests.at(-1).onerror();
  assert.equal(requests.length,count,'Do not fall back to a wrong pile height for missing short luxury legacy image');
  delete global.document;delete global.Image;
});
test('material selection refreshes even when two products share the same scene',()=>{
  const nodes=new Map();
  global.document={querySelector:key=>{if(!nodes.has(key))nodes.set(key,new Element());return nodes.get(key);},createElement:()=>new Element()};
  global.Image=class extends Element{};
  const ui=createVisuals(ASSETS,()=>{}),state=defaults();ui.update(state);
  state.sel.kwaliteit='dubai';ui.update(state);
  const detail=document.querySelector('#detailView');assert.ok(detail.children.some(figure=>figure.children.some(image=>image.src==='/assets/media/gras-swatch-dubai.jpg')));
  delete global.document;delete global.Image;
});
test('selecting an option opens its own render and removed extras do not linger',()=>{
  const nodes=new Map();
  global.document={querySelector:key=>{if(!nodes.has(key))nodes.set(key,new Element());return nodes.get(key);},createElement:()=>new Element()};
  global.Image=class extends Element{};
  const ui=createVisuals(ASSETS,()=>{}),state=defaults();state.sel.toepassing='padel';state.sel.verlichting='led8';state.sel.locatie='binnen';state.extras.bankjes=true;
  ui.update(state);ui.focusDetail('verlichting','led8');
  const featured=()=>document.querySelector('#detailView').children.find(n=>n.className==='detail-feature').children[0];
  assert.ok(featured().src.endsWith('padel-led8-binnen.webp'));
  ui.focusDetail('extra','bankjes');assert.ok(featured().src.endsWith('padel-bankjes.webp'));
  state.extras.bankjes=false;ui.update(state);assert.ok(!featured().src.endsWith('padel-bankjes.webp'));
  state.sel.toepassing='voetbal';ui.update(state);assert.ok(featured().src.includes('voetbal-'));
  delete global.document;delete global.Image;
});
