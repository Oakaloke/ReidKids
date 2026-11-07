const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const data = JSON.parse(fs.readFileSync('printables/collections.json', 'utf8'));
function element(extra = {}) {
  return Object.assign({attrs:{}, handlers:{}, dataset:{}, hidden:false,
    setAttribute(k,v) { this.attrs[k]=v; }, removeAttribute(k) { delete this.attrs[k]; },
    addEventListener(k,fn) { this.handlers[k]=fn; }, scrollIntoView() { this.scrolled=true; }
  }, extra);
}
const sections = data.collections.map(c => {
  const nodes = Object.fromEntries(['preview-front','preview-back','selected-title','selected-description','selected-download','download-filename','design-status'].map(k=>[k, element()]));
  const buttons = data.designs.map(d => element({dataset:{theme:d.id,title:d.title,description:d.description,pdf:`printables/${c.id}/${c.prefix}_${d.suffix}`,front:`printables/${c.id}/${d.id}-front.png`,back:`printables/${c.id}/${d.id}-back.png`,frontAlt:`${d.title} design, ${c.firstReference} reference front`,backAlt:`${d.title} design, ${c.firstReference} verse back: ${c.firstVerse}`}}));
  const section = element({id:c.id,nodes,buttons,querySelector(s) { return nodes[s.slice(1)]; },querySelectorAll() { return buttons; }});
  section.closest=()=>section;
  return section;
});
const links = data.collections.map(c=>element({dataset:{selectCollection:c.id},querySelector(){return {textContent:c.title};}}));
const status=element(); const listeners={};
const document={documentElement:{classList:{add(){}}},querySelectorAll(s){return s==='[data-collection]'?sections:links;},getElementById(id){return id==='collection-status'?status:sections.find(s=>s.id===id);}};
const window={location:{hash:''},addEventListener(k,fn){listeners[k]=fn;}};
vm.runInNewContext(fs.readFileSync('printables.js','utf8'),{document,window});
const assertSelected=(id)=>{ assert.equal(sections.filter(s=>!s.hidden).length,1); assert.equal(sections.find(s=>!s.hidden).id,id); assert.equal(links.filter(l=>l.attrs['aria-current']).length,1); assert.equal(links.find(l=>l.attrs['aria-current']).dataset.selectCollection,id); };
assertSelected('genesis');
for (const section of [...sections,...sections.slice().reverse(),sections[0]]) {
  window.location.hash='#'+section.id; listeners.hashchange(); assertSelected(section.id);
  for(const button of [...section.buttons,...section.buttons.slice().reverse(),section.buttons[0],section.buttons[0]]) {
    button.handlers.click();
    assert.equal(section.buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
    assert.equal(button.attrs['aria-pressed'],'true');
    assert.equal(section.nodes['preview-front'].src,button.dataset.front);
    assert.equal(section.nodes['preview-back'].src,button.dataset.back);
    assert.equal(section.nodes['preview-back'].alt,button.dataset.backAlt);
    assert.equal(section.nodes['selected-download'].href,button.dataset.pdf);
    assert.equal(section.nodes['selected-title'].textContent,button.dataset.title);
    assert.equal(section.nodes['download-filename'].textContent,button.dataset.pdf.split('/').pop());
  }
  for (const hash of ['#print-help','#collections','#unknown','#%not-valid']) {
    window.location.hash=hash; listeners.hashchange(); assertSelected(section.id);
  }
}
window.location.hash=''; listeners.hashchange(); assertSelected('genesis');
console.log(`PASS: ${sections.length} collections, six designs each, repeated and reverse choices, preview/alt/download/filename updates, unknown hashes, default Genesis and Back hash handling`);
