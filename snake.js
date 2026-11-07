(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const rules = window.SnakeRules;
  const canvas = $('board');
  const ctx = canvas.getContext('2d');
  if (!ctx || !rules) { $('overlay-copy').textContent = 'This browser could not start the game. Please try a newer browser.'; $('play').disabled = true; return; }
  const colors = { leaf: ['Leaf', '#b4ed77', '#6caf50'], sky: ['Sky', '#78cfff', '#379ace'], berry: ['Berry', '#ff99ba', '#d95f8b'], sunshine: ['Sunshine', '#ffda68', '#d4a232'], lavender: ['Lavender', '#c4a7ff', '#9776d0'], peach: ['Peach', '#ffa778', '#d97e48'] };
  const virtues = [
    ['Kindness', 'A kind word can brighten someone’s whole day.'],
    ['Love', 'Look for one small way to care for someone today.'],
    ['Joy', 'Notice a little thing that makes you thankful.'],
    ['Peace', 'Take a breath. You can be a peacemaker.'],
    ['Patience', 'Good things grow one small step at a time.'],
    ['Goodness', 'Choose to do what is good, even in little things.'],
    ['Faithfulness', 'Keep showing up for the people who count on you.'],
    ['Gentleness', 'Strong hearts can use gentle words.'],
    ['Self-control', 'Pause, think, and choose your next step.']
  ];
  function read(key, fallback) { try { const value = localStorage.getItem('rk-snake-' + key); return value === null ? fallback : value; } catch (_) { return fallback; } }
  function save(key, value) { try { localStorage.setItem('rk-snake-' + key, String(value)); } catch (_) { /* The game still works without storage. */ } }
  let selectedColor = read('color', 'leaf');
  if (!colors[selectedColor]) selectedColor = 'leaf';
  let pace = read('pace', 'classic');
  if (!['gentle', 'classic', 'zippy'].includes(pace)) pace = 'classic';
  let state = rules.initial();
  let best = 0, frame = null, lastStep = 0, particles = [], audioContext = null, sound = false;
  let resumeAfterDialog = false, touchStart = null, virtueIndex = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  $('pace').value = pace;
  function loadBest() { const value = Number(read('best-' + pace, '0')); best = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0; }
  loadBest();
  function announce(message) { $('announcement').textContent = message; }
  function updateColor() {
    document.querySelectorAll('[data-color]').forEach(button => { const active = button.dataset.color === selectedColor; button.setAttribute('aria-pressed', String(active)); button.textContent = active ? '✓' : ''; });
    $('color-name').textContent = colors[selectedColor][0];
    draw(performance.now());
  }
  function tone(frequency, duration) {
    if (!sound) return;
    try {
      if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(0.055, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* Sound is optional. */ }
  }
  function updateStats() {
    $('score').textContent = state.score;
    if (state.score > best) { best = state.score; save('best-' + pace, best); }
    $('best').textContent = best;
    $('level').textContent = 'Level ' + (Math.floor(state.score / 5) + 1);
    $('pace').disabled = state.status === 'running' || state.status === 'paused';
    $('pace-note').textContent = $('pace').disabled ? 'Restart to choose a new pace.' : 'A little faster every 5 fruits.';
    $('pause').disabled = !['running', 'paused'].includes(state.status);
    $('pause').textContent = state.status === 'paused' ? 'Resume' : 'Pause';
    canvas.setAttribute('aria-label', 'Snake playfield. ' + state.score + ' fruit; length ' + state.snake.length + '. Use arrow keys or W A S D to steer; Space or P pauses.');
    const nextVirtue = Math.floor(state.score / 3) % virtues.length;
    if (nextVirtue !== virtueIndex) { virtueIndex = nextVirtue; $('virtue').textContent = virtues[virtueIndex][0]; $('virtue-copy').textContent = virtues[virtueIndex][1]; }
  }
  function showOverlay(kind, message) {
    const content = {
      ready: ['✦', 'Fresh adventure ahead', 'Ready to grow?', 'Collect the fruit. Watch your tail.\nMake a little room to grow.', 'Let’s play →', 'Arrow keys · WASD · Swipe'],
      paused: ['II', 'A little breathing room', 'Take your time.', message || 'Your trail is right here when you’re ready.', 'Keep growing →', 'Space or P to resume'],
      over: ['❧', 'Every try is a fresh start', 'Good growing!', 'You collected ' + state.score + (state.score === 1 ? ' fruit' : ' fruits') + '.\n' + (state.reason === 'wall' ? 'Try turning before the edge next time.' : 'Give your tail a little more room next time.'), 'Try again →', 'A new trail is waiting for you'],
      won: ['✦', 'Look how far you’ve grown', 'You filled the garden!', 'Every space, one amazing snake.\n' + state.score + ' fruits. What a trail!', 'Play again →', 'Beautifully done!']
    }[kind];
    $('overlay-symbol').textContent = content[0]; $('overlay-kicker').textContent = content[1]; $('overlay-title').textContent = content[2];
    $('overlay-copy').replaceChildren(...content[3].split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
    $('play').textContent = content[4]; $('overlay-tip').textContent = content[5]; $('overlay').hidden = false;
  }
  function stopFrame() { if (frame !== null) cancelAnimationFrame(frame); frame = null; }
  function fresh() { stopFrame(); state = rules.initial(); particles = []; loadBest(); updateStats(); showOverlay('ready'); draw(performance.now()); }
  function play() {
    if ($('restart-dialog').open || state.status === 'running') return;
    if (state.status === 'over' || state.status === 'won') fresh();
    state.status = 'running'; state.queue = []; $('overlay').hidden = true; updateStats();
    canvas.focus({ preventScroll: true });
    const boardRect = $('board-frame').getBoundingClientRect();
    if (boardRect.bottom > window.innerHeight - 80 || boardRect.top < 0) $('board-frame').scrollIntoView({ block: 'center', behavior: 'instant' });
    lastStep = performance.now(); stopFrame(); frame = requestAnimationFrame(loop);
    announce('Game started. Steer with arrow keys, W A S D, swipes, or the direction buttons.');
  }
  function pause(message) {
    if (state.status !== 'running') return;
    state.status = 'paused'; state.queue = []; stopFrame(); updateStats(); showOverlay('paused', message); draw(performance.now()); announce(message || 'Game paused. Press Keep growing to resume.');
  }
  function togglePause() { if (state.status === 'running') pause(); else if (state.status === 'paused') play(); }
  function loop(now) {
    frame = null;
    if (state.status !== 'running') return;
    if (now - lastStep >= rules.interval(pace, state.score)) {
      lastStep = now; // Never catch up with multiple unseen moves after a delayed frame.
      const result = rules.step(state);
      if (result.ate) {
        tone(470 + (state.score % 5) * 75, .12);
        if (!reducedMotion.matches) for (let i = 0; i < 10; i++) particles.push({ x: state.snake[0].x * 30 + 15, y: state.snake[0].y * 30 + 15, dx: Math.cos(i * Math.PI / 5) * 40, dy: Math.sin(i * Math.PI / 5) * 40, birth: now });
        announce(state.score + (state.score === 1 ? ' fruit!' : ' fruits!') + ' Your snake is ' + state.snake.length + ' segments long.');
      }
      updateStats();
      if (state.status === 'over' || state.status === 'won') {
        showOverlay(state.status); tone(state.status === 'won' ? 800 : 220, .2); draw(now);
        announce(state.status === 'won' ? 'You filled the garden! ' + state.score + ' fruits.' : 'Round complete. ' + state.score + (state.score === 1 ? ' fruit.' : ' fruits.') + ' Press Try again for a fresh start.');
        $('play').focus({ preventScroll: true }); return;
      }
    }
    draw(now); frame = requestAnimationFrame(loop);
  }
  function roundRect(x, y, w, h, r, fill) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else { ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath(); } ctx.fillStyle = fill; ctx.fill(); }
  function fruit(x, y, type, now) {
    ctx.save(); ctx.translate(x, y); const bob = state.status === 'running' && !reducedMotion.matches ? Math.sin(now / 230) * .8 : 0; ctx.translate(0, bob);
    ctx.fillStyle = '#00000022'; ctx.beginPath(); ctx.ellipse(0, 11, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    const fruitColor = ['#ff9577', '#ffcc62', '#d0a0ff'][type];
    if (type === 2) {
      [[-5,-3],[5,-3],[0,4],[-5,5],[5,5],[0,11]].forEach(p => { ctx.beginPath(); ctx.arc(p[0],p[1],5,0,Math.PI*2);ctx.fillStyle=fruitColor;ctx.fill(); });
    } else {
      ctx.fillStyle = fruitColor; ctx.beginPath(); ctx.ellipse(-4,2,8.5,11,-.2,0,Math.PI*2);ctx.ellipse(4,2,8.5,11,.2,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle = '#ffe4ba'; ctx.lineWidth = 2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,-3);ctx.lineTo(-9,1);ctx.stroke();
    }
    ctx.strokeStyle = '#b6d78c';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-8);ctx.quadraticCurveTo(0,-13,4,-15);ctx.stroke();
    ctx.fillStyle='#92c965';ctx.beginPath();ctx.ellipse(6,-11,5,2.7,-.45,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function draw(now) {
    const scale = canvas.width / 600; ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = '#1c493d'; ctx.fillRect(0,0,600,600);
    for(let y=0;y<20;y++) for(let x=0;x<20;x++) { if((x+y)%2===0){ctx.fillStyle='#204d40';ctx.fillRect(x*30,y*30,30,30)} }
    // Quiet little garden details live in empty corners, never as obstacles.
    ctx.fillStyle='#62805a44';[[17,17],[583,17],[17,583],[583,583]].forEach(([x,y])=>{ctx.beginPath();ctx.ellipse(x,y,3,5,-.5,0,Math.PI*2);ctx.fill()});
    if(state.food)fruit(state.food.x*30+15,state.food.y*30+15,Math.floor(state.score/3)%3,now);
    const palette=colors[selectedColor], segments=state.snake;
    ctx.lineCap='round';ctx.lineJoin='round';
    const path=()=>{ctx.beginPath();segments.forEach((p,i)=>{if(i===0)ctx.moveTo(p.x*30+15,p.y*30+17);else ctx.lineTo(p.x*30+15,p.y*30+17)})};
    path();ctx.strokeStyle='#0b2a2660';ctx.lineWidth=25;ctx.stroke();
    ctx.save();ctx.translate(0,-2);path();ctx.strokeStyle=palette[2];ctx.lineWidth=23;ctx.stroke();path();ctx.strokeStyle=palette[1];ctx.lineWidth=19;ctx.stroke();ctx.restore();
    // A few soft markings give every color the same readable, friendly silhouette.
    segments.slice(1,-1).forEach((p,i)=>{if(i%2===0){ctx.fillStyle='#ffffff35';ctx.beginPath();ctx.arc(p.x*30+15,p.y*30+14,3,0,Math.PI*2);ctx.fill()}});
    const head=segments[0];ctx.save();ctx.translate(head.x*30+15,head.y*30+15);ctx.rotate({right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[state.direction]);
    roundRect(-13,-12,27,24,10,palette[1]);
    [-7,7].forEach(y=>{ctx.fillStyle='#ffffef';ctx.beginPath();ctx.ellipse(6,y,4.5,5.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#173b32';ctx.beginPath();ctx.arc(7.6,y,2.3,0,Math.PI*2);ctx.fill()});
    ctx.strokeStyle='#406942';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(9,0,2,-.8,.8);ctx.stroke();ctx.restore();
    particles=particles.filter(p=>now-p.birth<450);
    particles.forEach(p=>{const t=(now-p.birth)/450;ctx.globalAlpha=1-t;ctx.fillStyle='#e7ecac';ctx.beginPath();ctx.arc(p.x+p.dx*t,p.y+p.dy*t,3*(1-t),0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;
  }
  function fitCanvas() { const width = Math.round(canvas.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2)); if(width>0 && canvas.width !== width){canvas.width=width;canvas.height=width;} draw(performance.now()); }
  $('play').addEventListener('click', play);
  $('pause').addEventListener('click', togglePause);
  $('sound').addEventListener('click',()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label','Turn sound '+(sound?'off':'on'));$('sound').title='Sound '+(sound?'on':'off');if(sound)tone(600,.1)});
  document.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{if(state.status==='running')pause('A new color, the same little adventure. Resume when you’re ready.');selectedColor=button.dataset.color;save('color',selectedColor);updateColor();announce(colors[selectedColor][0]+' snake selected.')}));
  $('pace').addEventListener('change',()=>{pace=$('pace').value;save('pace',pace);fresh()});
  $('restart').addEventListener('click',()=>{
    if(state.status==='ready'||state.status==='over'||state.status==='won'){fresh();$('play').focus({preventScroll:true});return}
    resumeAfterDialog=state.status==='running';pause();$('restart-dialog').showModal();$('cancel-restart').focus();
  });
  $('cancel-restart').addEventListener('click',()=>{$('restart-dialog').close();if(resumeAfterDialog)play()});
  $('restart-dialog').addEventListener('cancel',()=>{if(resumeAfterDialog)setTimeout(play,0)});
  $('confirm-restart').addEventListener('click',()=>{$('restart-dialog').close();resumeAfterDialog=false;fresh();$('play').focus({preventScroll:true})});
  const keyDirection={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left'};
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||$('restart-dialog').open||event.target.closest('select,input,textarea,[contenteditable=true]'))return;
    const key=event.key.length===1?event.key.toLowerCase():event.key;
    if(keyDirection[key] && state.status==='running'){event.preventDefault();if(!event.repeat)rules.steer(state,keyDirection[key]);return}
    if((key===' '||key==='Enter') && event.target.closest('button,a,summary'))return;
    if(key===' '||key==='p'||key==='Escape'){if(state.status==='running'||state.status==='paused'){event.preventDefault();if(!event.repeat){if(key==='Escape')pause();else togglePause()}}}
    if(key==='Enter' && state.status!=='running'){event.preventDefault();if(!event.repeat)play()}
  });
  document.querySelectorAll('[data-direction]').forEach(button=>{
    button.addEventListener('pointerdown',event=>{event.preventDefault();if(state.status==='running'){rules.steer(state,button.dataset.direction);canvas.focus({preventScroll:true})}});
    button.addEventListener('click',event=>{if(event.detail===0)rules.steer(state,button.dataset.direction)});
  });
  canvas.addEventListener('pointerdown',event=>{if(state.status!=='running')return;event.preventDefault();touchStart={x:event.clientX,y:event.clientY,id:event.pointerId};canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true})});
  canvas.addEventListener('pointermove',event=>{
    if(!touchStart||event.pointerId!==touchStart.id||state.status!=='running')return;
    const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;
    rules.steer(state,Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
    touchStart={x:event.clientX,y:event.clientY,id:event.pointerId};
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,()=>{touchStart=null}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Your game paused while you were away. Ready to keep growing?')});
  window.addEventListener('blur',()=>pause('Your game paused while you were away. Ready to keep growing?'));
  window.addEventListener('pagehide',()=>pause());
  if(window.ResizeObserver)new ResizeObserver(fitCanvas).observe(canvas);else window.addEventListener('resize',fitCanvas);
  updateColor();updateStats();fitCanvas();
})();
