const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../thanksgiving.js'),'utf8');
function boot(instant, hostname='reidkids.com', search='') {
  let time = +new Date(instant), callback, delay;
  const classes=new Set(), frames=[], events={};
  class FakeDate extends Date { constructor(...args){super(...(args.length?args:[time]));} static now(){return time;} }
  const document={
    documentElement:{classList:{add(...names){names.forEach(x=>classes.add(x));},remove(...names){names.forEach(x=>classes.delete(x));}}},
    querySelectorAll(){return [...frames];},
    createElement(){return {setAttribute(name,value){this[name]=value;},remove(){frames.splice(frames.indexOf(this),1);}};},
    body:{appendChild(frame){frames.push(frame);}},
    addEventListener(name,fn){events[name]=fn;}
  };
  vm.runInNewContext(source,{Date:FakeDate,Intl,URLSearchParams,document,location:{hostname,search},
    window:{addEventListener(name,fn){events[name]=fn;}},
    setTimeout(fn,ms){callback=fn;delay=ms;return 1;},clearTimeout(){}});
  return {classes,frames,events,get delay(){return delay;},tick(instant){time=+new Date(instant);callback();},setTime(instant){time=+new Date(instant);}};
}
test('open page switches exactly at Eastern December midnight and removes November frame',()=>{
  const page=boot('2026-12-01T04:59:59.999Z');
  assert.ok(page.classes.has('thanksgiving-season'));
  assert.equal(page.delay,1);
  assert.equal(page.frames[0].className,'thanksgiving-frame');
  page.tick('2026-12-01T05:00:00Z');
  assert.ok(!page.classes.has('thanksgiving-season'));
  assert.ok(page.classes.has('season-christmas'));
  assert.equal(page.frames.length,1);
  assert.equal(page.frames[0]['aria-hidden'],'true');
  page.tick('2027-01-01T05:00:00Z');
  assert.ok(page.classes.has('season-new-year'));
  page.tick('2027-01-08T05:00:00Z');
  assert.equal(page.classes.size,0);
  assert.equal(page.frames.length,0);
});
test('restored sleeping tabs catch up and refreshes do not duplicate artwork',()=>{
  const page=boot('2026-11-20T17:00:00Z');
  page.events.pageshow();page.events.visibilitychange();
  assert.equal(page.frames.length,1);
  page.setTime('2027-03-10T05:00:00Z');page.events.visibilitychange();
  assert.ok(page.classes.has('season-st-patricks'));
  assert.equal(page.frames.length,1);
  page.setTime('2027-03-18T04:00:00Z');page.events.pageshow();
  assert.equal(page.frames.length,0);
});
test('preview is loopback-only, valid, and never persists',()=>{
  for(const host of ['reidkids.com','www.reidkids.com','oakaloke.github.io']) {
    const page=boot('2026-11-20T17:00:00Z',host,'?season-preview=christmas');
    assert.ok(page.classes.has('thanksgiving-season'));
  }
  for(const host of ['localhost','127.0.0.1','[::1]']) {
    assert.ok(boot('2026-11-20T17:00:00Z',host,'?season-preview=christmas').classes.has('season-christmas'));
    assert.ok(boot('2026-11-20T17:00:00Z',host,'?season-preview=bad').classes.has('thanksgiving-season'));
    assert.equal(boot('2026-11-20T17:00:00Z',host,'?season-preview=default').frames.length,0);
  }
});
test('approved November stylesheet is an unchanged prefix; homepage and joke files are untouched',()=>{
  const cp=require('node:child_process');
  const original=cp.execFileSync('git',['show','5fc7321:thanksgiving.css'],{encoding:'utf8'});
  assert.ok(fs.readFileSync(require.resolve('../thanksgiving.css'),'utf8').startsWith(original));
  assert.equal(cp.execFileSync('git',['diff','5fc7321','--','index.html','daily-joke.js','daily-joke.css'],{encoding:'utf8'}),'');
});
