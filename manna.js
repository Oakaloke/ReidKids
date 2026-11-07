(function () {
  'use strict';
  const $ = id => document.getElementById(id), rules = window.MannaRules, canvas = $('board'), ctx = canvas.getContext('2d');
  if (!ctx || !rules) { $('overlay-title').textContent = 'A newer browser will help.'; $('overlay-copy').textContent = 'This game needs canvas support. Try an up-to-date browser, or visit All games.'; $('play').disabled = true; return; }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const load = key => { try { return localStorage.getItem('reidkids.manna.' + key); } catch (_) { return null; } };
  const save = (key, value) => { try { localStorage.setItem('reidkids.manna.' + key, String(value)); } catch (_) {} };
  let mode = rules.MODES[load('pace')] ? load('pace') : 'gentle', state = rules.initial(mode), best = 0;
  let frame = null, lastTime = 0, keys = new Set(), pointer = null, particles = [], trail = [], sound = false, audio = null, pendingMode = null, dialogStatus = null;
  $('pace').value = mode;
  function announce(message) { $('announcement').textContent = message; }
  function readBest() { const n = Number(load('best.' + mode)); best = Number.isFinite(n) && n >= 0 && n <= 1000000 ? Math.floor(n) : 0; }
  function tone(frequency, duration = .07, volume = .025) {
    if (!sound) return;
    try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; if (!audio) audio = new AC(); if (audio.state === 'suspended') audio.resume().catch(() => {});
      const oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(volume, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration); oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
    } catch (_) { /* Audio is optional, including in privacy-restricted browsers. */ }
  }
  function stats() {
    $('score').textContent = state.score; $('stage').textContent = 'Morning ' + state.level + ' / 3';
    $('lives').textContent = '♥ '.repeat(state.lives).trim() || '♡'; $('lives').setAttribute('aria-label', state.lives + ' chances left');
    if (state.score > best) { best = state.score; save('best.' + mode, best); } $('best').textContent = best;
    $('pause').disabled = !['running', 'paused'].includes(state.status); $('pause').textContent = state.status === 'paused' ? 'Resume' : 'Pause';
    $('pace-note').textContent = mode === 'gentle' ? 'A wider basket & 5 chances. Perfect for little hands.' : 'A quicker ball & 3 chances. A little extra adventure.';
  }
  function overlay() {
    if (state.status === 'running') { $('overlay').hidden = true; return; }
    const content = {
      ready: ['A FRESH MORNING', 'Good things are on the horizon.', 'Bounce the ball. Gather every golden piece. Keep it above your basket!', 'Let’s play →', '← → keys · Mouse · Touch'],
      serve: ['EVERY TRY IS A FRESH START', 'You’ve got this.', 'The pieces you gathered are still yours. Take a breath and try another bounce.', 'Try this bounce →', state.lives + (state.lives === 1 ? ' chance left' : ' chances left')],
      paused: ['A LITTLE BREATHER', 'Your sky can wait.', 'Everything is right where you left it. Ready when you are.', 'Keep playing →', 'Space or P to resume'],
      level: ['MORNING ' + state.level + ' COMPLETE', 'A grateful little heart.', 'You cleared the sky! A new morning brings new manna and one chance back, up to your starting total.', 'Next morning →', 'What’s one good thing you’re thankful for?'],
      over: ['THERE’S ALWAYS A NEW MORNING', 'Good gathering!', 'You gathered ' + state.score + ' points. Every bounce is practice. A fresh start is waiting for you.', 'Try again →', 'Your best: ' + best],
      won: ['THREE BEAUTIFUL MORNINGS', 'A sky full of gratitude.', 'You gathered every piece across all 3 mornings! ' + state.score + ' points, and a whole lot of joy.', 'Play again →', 'Take a little gratitude with you.']
    }[state.status];
    if (!content) return;
    ['overlay-kicker','overlay-title','overlay-copy','play','overlay-tip'].forEach((id, i) => $(id).textContent = content[i]); $('overlay').hidden = false;
  }
  function clearInput() { keys.clear(); pointer = null; }
  function stop() { if (frame !== null) cancelAnimationFrame(frame); frame = null; clearInput(); }
  function fresh() { stop(); state = rules.initial(mode); particles = []; trail = []; readBest(); stats(); overlay(); draw(performance.now()); }
  function play() {
    if ($('restart-dialog').open || state.status === 'running') return;
    if (state.status === 'over' || state.status === 'won') fresh();
    if (state.status === 'level') rules.nextLevel(state);
    if (state.status === 'paused') state.status = 'running'; else rules.launch(state);
    clearInput(); particles = []; trail = []; stats(); overlay(); canvas.focus({ preventScroll: true });
    const rect = $('board-frame').getBoundingClientRect(); if (rect.bottom > window.innerHeight - 70 || rect.top < 0) $('board-frame').scrollIntoView({ block: 'center', behavior: 'instant' });
    lastTime = performance.now(); if (frame === null) frame = requestAnimationFrame(loop); tone(640, .09);
    announce('Morning ' + state.level + '. Move the basket left and right. ' + state.lives + ' chances left.');
  }
  function pause(message) { if (state.status !== 'running') return; state.status = 'paused'; stop(); stats(); overlay(); if (message) $('overlay-copy').textContent = message; draw(performance.now()); announce(message || 'Game paused. Press Keep playing to resume.'); }
  function togglePause() { if (state.status === 'running') pause(); else if (state.status === 'paused') play(); }
  function loop(now) {
    frame = null; if (state.status !== 'running') return;
    const dt = Math.min(Math.max((now - lastTime) / 1000, 0), .04); lastTime = now;
    const direction = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0); if (direction) rules.move(state, state.paddle.x + direction * 560 * dt);
    const events = rules.step(state, dt);
    for (const event of events) {
      if (event.type === 'brick') {
        tone(550 + (state.hits % 5) * 90);
        if (!reducedMotion.matches) for (let i = 0; i < 8; i++) particles.push({ x: event.x, y: event.y, dx: Math.cos(i * Math.PI / 4) * 55, dy: Math.sin(i * Math.PI / 4) * 55, birth: now });
      } else if (event.type === 'paddle') tone(350, .045);
      else if (event.type === 'miss') tone(210, .14, .018);
    }
    if (!reducedMotion.matches) { trail.push({ x: state.ball.x, y: state.ball.y }); if (trail.length > 7) trail.shift(); }
    if (events.length) stats(); draw(now);
    if (state.status !== 'running') { clearInput(); trail = []; overlay(); announce($('overlay-title').textContent + ' ' + $('overlay-copy').textContent); $('play').focus({ preventScroll: true }); return; }
    frame = requestAnimationFrame(loop);
  }
  function round(x, y, w, h, r, color) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else { ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath(); } ctx.fillStyle = color; ctx.fill(); }
  function cloud(x, y, scale, opacity) { ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.globalAlpha=opacity;ctx.fillStyle='#fffdf0';ctx.beginPath();ctx.ellipse(0,0,56,15,0,0,Math.PI*2);ctx.ellipse(-20,-9,24,19,0,0,Math.PI*2);ctx.ellipse(9,-19,30,28,0,0,Math.PI*2);ctx.ellipse(35,-5,22,18,0,0,Math.PI*2);ctx.fill();ctx.restore(); }
  function draw(now) {
    const scale = canvas.width / rules.WIDTH; ctx.setTransform(scale,0,0,scale,0,0);
    const sky = ctx.createLinearGradient(0,0,0,600); sky.addColorStop(0, ['#8bbaca','#92bacd','#a5b6cd'][state.level-1]);sky.addColorStop(.7,'#d1e5df');sky.addColorStop(1,'#eee7c5');ctx.fillStyle=sky;ctx.fillRect(0,0,720,600);
    // Hand-drawn, quiet scenery keeps the active pieces easy to recognize.
    ctx.fillStyle='#fff0b5';ctx.beginPath();ctx.arc(586,60,29,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff1bd88';ctx.lineWidth=2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(586+Math.cos(a)*38,60+Math.sin(a)*38);ctx.lineTo(586+Math.cos(a)*45,60+Math.sin(a)*45);ctx.stroke();}
    cloud(90,51,.85,.7);cloud(385,47,.6,.45);cloud(650,307,1,.22);cloud(55,332,.85,.22);
    ctx.fillStyle='#c6d3bd';ctx.beginPath();ctx.moveTo(0,510);ctx.quadraticCurveTo(140,404,330,515);ctx.quadraticCurveTo(510,437,720,499);ctx.lineTo(720,600);ctx.lineTo(0,600);ctx.closePath();ctx.fill();
    ctx.fillStyle='#dee0bf';ctx.beginPath();ctx.moveTo(0,543);ctx.quadraticCurveTo(220,460,432,546);ctx.quadraticCurveTo(602,493,720,547);ctx.lineTo(720,600);ctx.lineTo(0,600);ctx.closePath();ctx.fill();
    // Distant tents on the wilderness horizon are decorative, never obstacles.
    [[74,477,24],[112,488,17],[626,490,28]].forEach(([x,y,w])=>{ctx.fillStyle='#b6bc9b';ctx.beginPath();ctx.moveTo(x-w,y+18);ctx.lineTo(x,y-8);ctx.lineTo(x+w,y+18);ctx.fill();ctx.fillStyle='#929f8a';ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+w,y+18);ctx.lineTo(x+8,y+18);ctx.fill()});
    for(const brick of state.bricks){if(!brick.alive)continue;round(brick.x,brick.y+4,brick.w,brick.h,8,'#a9732c55');round(brick.x,brick.y,brick.w,brick.h,8,['#fff2bd','#f6d585','#eeb969','#f8df9b','#f3ca79','#f7e9ba'][brick.row]);ctx.strokeStyle='#ffffff77';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(brick.x+9,brick.y+5);ctx.lineTo(brick.x+brick.w-9,brick.y+5);ctx.stroke();ctx.fillStyle='#bd8d4380';[[-9,-1],[3,3],[12,-3]].forEach(([x,y])=>{ctx.beginPath();ctx.ellipse(brick.x+brick.w/2+x,brick.y+13+y,2.4,1.5,-.4,0,Math.PI*2);ctx.fill()})}
    if(!reducedMotion.matches && state.status==='running')trail.forEach((p,i)=>{ctx.globalAlpha=(i+1)/trail.length*.2;ctx.fillStyle='#fffdf0';ctx.beginPath();ctx.arc(p.x,p.y,3+i*.65,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;
    const b=state.ball;ctx.fillStyle='#ffffff25';ctx.beginPath();ctx.arc(b.x,b.y,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#173f59';ctx.beginPath();ctx.arc(b.x,b.y,b.r+1.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fffdf0';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4cd75';ctx.beginPath();ctx.arc(b.x+2,b.y+2,4,0,Math.PI*2);ctx.fill();
    const p=state.paddle,left=p.x-p.w/2;round(left,p.y+5,p.w,22,7,'#92632d');round(left,p.y,p.w,21,7,'#bc8b47');
    ctx.save();ctx.beginPath();ctx.rect(left+5,p.y+6,p.w-10,15);ctx.clip();ctx.strokeStyle='#e6be75';ctx.lineWidth=1.7;
    for(let x=left-10;x<left+p.w+20;x+=12){ctx.beginPath();ctx.moveTo(x,p.y+5);ctx.lineTo(x+18,p.y+25);ctx.stroke();ctx.beginPath();ctx.moveTo(x+18,p.y+5);ctx.lineTo(x,p.y+25);ctx.stroke()}ctx.restore();round(left-2,p.y-2,p.w+4,7,3.5,'#f4d697');
    ctx.fillStyle='#9caa8d';ctx.font='10px Trebuchet MS';ctx.textAlign='center';ctx.fillText('KEEP THE BOUNCE ABOVE YOUR BASKET',360,588);
    particles=particles.filter(p=>now-p.birth<550);particles.forEach(p=>{const t=(now-p.birth)/550;ctx.globalAlpha=1-t;ctx.fillStyle='#fff7cf';ctx.beginPath();ctx.arc(p.x+p.dx*t,p.y+p.dy*t+25*t*t,3*(1-t),0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;
  }
  function fit() { const width = Math.round(canvas.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2)); if(width>0){canvas.width=width;canvas.height=Math.round(width*5/6);} draw(performance.now()); }
  function requestRestart(newMode = null) {
    pendingMode = newMode;
    if (['ready','over','won'].includes(state.status)) { if(pendingMode){mode=pendingMode;save('pace',mode)}pendingMode=null;fresh();$('play').focus({preventScroll:true});return; }
    dialogStatus = state.status; pause(); $('restart-title').textContent = newMode ? 'Try a different pace?' : 'A fresh morning?'; $('restart-copy').textContent = newMode ? 'Changing pace starts a new game. Your best scores will stay.' : 'Start over from morning one? Your best score will stay.';
    $('restart-dialog').showModal(); $('cancel-restart').focus();
  }
  function cancelRestart() { $('restart-dialog').close();pendingMode=null;$('pace').value=mode;if(dialogStatus==='running')play();else{$('restart').focus({preventScroll:true})}dialogStatus=null; }
  $('play').addEventListener('click', play);$('pause').addEventListener('click',togglePause);$('restart').addEventListener('click',()=>requestRestart());
  $('cancel-restart').addEventListener('click',cancelRestart);$('restart-dialog').addEventListener('cancel',e=>{e.preventDefault();cancelRestart()});
  $('confirm-restart').addEventListener('click',()=>{$('restart-dialog').close();if(pendingMode){mode=pendingMode;save('pace',mode)}pendingMode=null;dialogStatus=null;$('pace').value=mode;fresh();$('play').focus({preventScroll:true})});
  $('pace').addEventListener('change',()=>{const selected=$('pace').value;if(rules.MODES[selected] && selected!==mode)requestRestart(selected)});
  $('sound').addEventListener('click',()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label','Turn sound '+(sound?'off':'on'));$('sound').title='Sound '+(sound?'on':'off');tone(660,.1)});
  const keyDirections={ArrowLeft:'left',ArrowRight:'right',a:'left',d:'right'};
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||$('restart-dialog').open||event.target.closest('select,input,textarea,[contenteditable=true]'))return;
    const key=event.key.length===1?event.key.toLowerCase():event.key;
    if(keyDirections[key] && state.status==='running'){event.preventDefault();keys.add(keyDirections[key]);return;}
    if(key===' ' && event.target.closest('button,a,summary'))return;
    if(key===' '||key==='p'||key==='Escape'){event.preventDefault();if(event.repeat)return;if(key==='Escape')pause();else if(key==='p')togglePause();else if(state.status==='running')pause();else play();}
  });
  document.addEventListener('keyup',event=>{const key=event.key.length===1?event.key.toLowerCase():event.key;if(keyDirections[key])keys.delete(keyDirections[key])});
  ['left','right'].forEach(direction=>{const button=$(direction);button.addEventListener('pointerdown',e=>{if(state.status!=='running')return;e.preventDefault();keys.add(direction);button.setPointerCapture(e.pointerId)});['pointerup','pointercancel','lostpointercapture'].forEach(name=>button.addEventListener(name,()=>keys.delete(direction)));button.addEventListener('click',e=>{if(e.detail===0 && state.status==='running'){rules.move(state,state.paddle.x+(direction==='left'?-46:46));draw(performance.now())}})});
  function steerPointer(e) { const rect=canvas.getBoundingClientRect();if(rect.width>0)rules.move(state,(e.clientX-rect.left)*rules.WIDTH/rect.width); }
  canvas.addEventListener('pointerdown',e=>{if(state.status!=='running')return;e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});steerPointer(e)});
  canvas.addEventListener('pointermove',e=>{if(state.status==='running' && (e.pointerType==='mouse'||e.pointerId===pointer))steerPointer(e)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,()=>{pointer=null}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Your game paused while you were away. Come back when you’re ready.')});window.addEventListener('blur',()=>{clearInput();pause('Your game paused while you were away. Come back when you’re ready.')});window.addEventListener('pagehide',()=>pause());
  if(window.ResizeObserver)new ResizeObserver(fit).observe(canvas);else window.addEventListener('resize',fit);
  readBest();stats();fit();
})();
