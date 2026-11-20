const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8126';
const pages = ['index.html','coloring.html','worship.html','song.html','verses.html','games.html','bible-match.html','adventure.html'];
(async()=> {
  fs.mkdirSync('/tmp/reid-seasons-qa',{recursive:true});
  const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),args:['--no-sandbox']});
  const context = await browser.newContext({reducedMotion:'reduce',timezoneId:'Asia/Tokyo'});
  const page = await context.newPage();
  await page.clock.install({time:new Date('2026-11-20T16:59:59Z')});
  await page.clock.pauseAt(new Date('2026-11-20T17:00:00Z'));
  await page.route('https://fonts.googleapis.com/**', r=>r.abort());
  await page.route('https://fonts.gstatic.com/**', r=>r.abort());
  const errors=[];
  const preexisting=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const season of ['thanksgiving','christmas','new-year','st-patricks','default']) {
    for(const width of [320,375,768,1440]) {
      await page.setViewportSize({width,height:900});
      for(const path of pages) {
        await page.goto(`${BASE}/${path}?season-preview=${season}`,{waitUntil:'networkidle'});
        await page.evaluate(()=>document.fonts.ready);
        const result = await page.evaluate(()=>({
          overflow:document.documentElement.scrollWidth>innerWidth,
          scrollWidth:document.documentElement.scrollWidth,
          frameCount:document.querySelectorAll('.thanksgiving-frame,.holiday-frame').length,
          pointer:document.querySelector('.holiday-frame') && getComputedStyle(document.querySelector('.holiday-frame')).pointerEvents,
          root:document.documentElement.className
        }));
        if(result.overflow && season==='default') {
          // Compare to the repository's existing unthemed styles, with its old
          // unconditional Thanksgiving activator disabled. Do not hide regressions.
          const baseline=await context.newPage();
          await baseline.setViewportSize({width,height:900});
          await baseline.route('**/thanksgiving.js?*',r=>r.fulfill({contentType:'application/javascript',body:''}));
          await baseline.route('**/thanksgiving.css?*',r=>r.fulfill({contentType:'text/css',body:cp.execFileSync('git',['show','5fc7321:thanksgiving.css'],{encoding:'utf8'})}));
          await baseline.goto(`${BASE}/${path}`,{waitUntil:'networkidle'});
          const originalWidth=await baseline.evaluate(()=>document.documentElement.scrollWidth);
          assert.equal(result.scrollWidth,originalWidth,`${path}: new default layout regression`);
          preexisting.push(`${path} viewport ${width}: unchanged default width ${originalWidth}`);
          await baseline.close();
        } else assert.equal(result.overflow,false,`${season} ${width} ${path}: overflow`);
        assert.equal(result.frameCount,season==='default'?0:1);
        if(!['thanksgiving','default'].includes(season)) assert.equal(result.pointer,'none');
        if(path==='index.html') {
          const joke=page.locator('#daily-joke-reveal');
          await joke.locator('summary').focus();
          await page.keyboard.press('Enter');
          assert.equal(await joke.getAttribute('open'),'');
          await page.keyboard.press('Enter');
          if(width<1201) {
            await page.locator('.menu-toggle').click();
            assert.equal(await page.locator('.site-nav').isVisible(),true);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
            await page.locator('.menu-toggle').click();
          }
        }
        if(path==='index.html' && [375,1440].includes(width))
          await page.screenshot({path:`/tmp/reid-seasons-qa/${season}-${width}.png`});
      }
    }
  }
  // Pixel-identical November against the committed baseline script and CSS.
  for(const width of [375,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto(`${BASE}/index.html`,{waitUntil:'networkidle'});
    const actual=await page.screenshot({animations:'disabled'});
    await page.route('**/thanksgiving.js?*',r=>r.fulfill({contentType:'application/javascript',body:cp.execFileSync('git',['show','6483c84:thanksgiving.js'],{encoding:'utf8'})}));
    await page.route('**/thanksgiving.css?*',r=>r.fulfill({contentType:'text/css',body:cp.execFileSync('git',['show','6483c84:thanksgiving.css'],{encoding:'utf8'})}));
    await page.reload({waitUntil:'networkidle'});
    const original=await page.screenshot({animations:'disabled'});
    assert.ok(actual.equals(original),`November pixel match ${width}`);
    await page.unrouteAll();
  }
  // Keep the same loaded page open across Eastern midnight.
  await page.clock.setSystemTime(new Date('2026-12-01T04:59:59Z'));
  await page.goto(`${BASE}/index.html`,{waitUntil:'networkidle'});
  assert.ok(await page.locator('html').evaluate(e=>e.classList.contains('thanksgiving-season')));
  await page.clock.runFor(1001);
  assert.ok(await page.locator('html').evaluate(e=>e.classList.contains('season-christmas')));
  for(const [instant, expected] of [
    ['2027-01-01T04:59:59Z','new-year'],['2027-01-08T04:59:59Z','default'],
    ['2027-03-10T04:59:59Z','st-patricks'],['2027-03-18T03:59:59Z','default']
  ]) {
    await page.clock.setSystemTime(new Date(instant));
    await page.goto(`${BASE}/index.html`,{waitUntil:'networkidle'});
    await page.clock.runFor(1001);
    const cls=await page.locator('html').getAttribute('class');
    assert.ok(expected==='default'?!cls.includes('season'):cls.includes('season-'+expected),instant+' '+cls);
  }
  // Public hosts ignore preview parameters, even when they request Christmas.
  await page.clock.setSystemTime(new Date('2026-11-20T17:00:00Z'));
  await page.route('https://reidkids.com/**',async route=> {
    const url=new URL(route.request().url());
    const response=await context.request.get(BASE+url.pathname+url.search);
    await route.fulfill({response});
  });
  await page.goto('https://reidkids.com/index.html?season-preview=christmas',{waitUntil:'networkidle'});
  assert.ok(await page.locator('html').evaluate(e=>e.classList.contains('thanksgiving-season')));
  assert.deepEqual(errors,[]);
  console.log('Existing default layout findings:',JSON.stringify(preexisting));
  await browser.close();
  console.log('PASS: 160 page/theme/viewport combinations; November identical at 375/1440; five open-tab midnight transitions; public preview disabled; no page errors.');
})().catch(e=>{console.error(e);process.exit(1)});
