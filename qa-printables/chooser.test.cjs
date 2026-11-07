const assert=require('node:assert/strict'); const fs=require('node:fs'); const vm=require('node:vm');
const html=fs.readFileSync('printables.html','utf8');
const choices=[...html.matchAll(/<button class="design-option"[^>]+>/g)].map(([tag])=>({dataset:Object.fromEntries([...tag.matchAll(/data-([a-z]+)="([^"]*)"/g)].map((m)=>[m[1],m[2]])),attrs:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this[k]=fn}}));
const nodes=Object.fromEntries(['preview-front','preview-back','selected-download','selected-title','selected-description','design-status'].map(id=>[id,{}]));
vm.runInNewContext(fs.readFileSync('printables.js','utf8'),{document:{querySelectorAll:()=>choices,getElementById:id=>nodes[id]}});
assert.equal(choices.length,6);
for(const c of [...choices,...choices.slice().reverse(),choices[0],choices[0]]) { c.click(); assert.equal(choices.filter(c=>c.attrs['aria-pressed']==='true').length,1); assert.equal(c.attrs['aria-pressed'],'true'); assert.equal(nodes['selected-title'].textContent,c.dataset.title); assert.equal(nodes['selected-download'].href,'printables/genesis/'+c.dataset.pdf); assert.match(nodes['preview-back'].alt,/In the beginning/); assert.equal(nodes['preview-front'].src,`printables/genesis/${c.dataset.theme}-front.png`); }
console.log('PASS: six choices, selected state, all download targets, images/alt text, repeated selection and reverse navigation');
