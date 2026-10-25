/* A removable, purely decorative October layer. No tracking or stored data. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  if (!header || document.getElementById('halloween-decor')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const layer = document.createElement('div');
  layer.id = 'halloween-decor';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  document.body.append(layer);
  const defs = `<defs>
    <filter id="hw-glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3"/></filter>
    <g id="hw-skeleton" fill="#fff5d9" stroke="#bba67f" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
      <g transform="rotate(-10 50 25)"><path d="M31 27 C25 5 34 1 49 1 C66 1 73 10 69 27 L63 36 L37 36 Z"/><path d="M38 33 L38 42 Q50 47 62 41 L62 33"/><path d="M40 37 H60 M45 35 V41 M51 35 V42 M57 35 V41" fill="none"/><ellipse cx="39" cy="22" rx="6" ry="7" fill="#26395a" stroke="none"/><ellipse cx="59" cy="22" rx="6" ry="7" fill="#26395a" stroke="none"/><path d="M48 28 L45 33 H52 Z" fill="#26395a" stroke="none"/></g>
      <path d="M48 46 L49 85" fill="none" stroke="#fff5d9" stroke-width="5"/>
      <path d="M47 49 Q30 46 30 55 Q31 62 46 61 M52 49 Q68 46 68 55 Q67 62 53 61 M46 64 Q30 59 33 67 Q36 73 46 73 M53 64 Q68 59 65 67 Q62 73 53 73 M46 76 Q36 72 38 78 L46 82 M53 76 Q63 72 60 78 L53 82" fill="none" stroke="#fff5d9" stroke-width="4"/>
      <path d="M36 86 Q49 91 62 86 L60 98 L50 104 L39 98 Z"/><path d="M44 91 L47 97 M55 91 L52 97" fill="none"/>
      <g fill="none" stroke="#fff5d9" stroke-width="5"><path d="M31 51 L16 31 L21 8 M66 52 L83 68 L94 47 M41 101 L22 120 L32 143 M58 101 L72 119 L61 138"/></g>
      <g stroke="#bba67f"><circle cx="16" cy="31" r="3"/><circle cx="83" cy="68" r="3"/><circle cx="22" cy="120" r="3"/><circle cx="72" cy="119" r="3"/></g>
      <g fill="none" stroke="#fff5d9" stroke-width="2.4"><path d="M21 8 L17 1 M21 8 L22 0 M21 8 L27 2 M94 47 L90 39 M94 47 L96 38 M94 47 L101 41"/></g>
      <path d="M29 140 Q35 138 38 145 L43 150 Q37 156 29 149 Z M58 136 Q64 134 65 142 L59 151 Q50 151 53 145 Z"/>
    </g>
    <g id="hw-pumpkin" stroke="#ad4517" stroke-width="1.5"><path d="M30 12 Q23 0 33 0 L36 3 L33 14" fill="#7e8e49"/><ellipse cx="30" cy="34" rx="29" ry="24" fill="#fc8b2b"/><ellipse cx="30" cy="34" rx="18" ry="24" fill="#ff9e37"/><path d="M29 12 Q20 34 29 57 M32 12 Q43 34 32 57" fill="none"/><path d="M13 29 L21 22 L23 32 Z M38 22 L47 29 L37 32 Z M17 40 Q30 51 44 39 Q39 53 29 51 Q20 51 17 40" fill="#26395a" stroke="none"/></g>
  </defs>`;
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('hw-ropes');
  svg.setAttribute('focusable', 'false');
  layer.append(svg);
  const topper = document.createElement('span');
  topper.className = 'hw-topper';
  topper.setAttribute('aria-hidden', 'true');
  topper.innerHTML = `<svg viewBox="0 0 110 160" focusable="false"><use href="#hw-skeleton"/></svg>`;
  const wordmark = header.querySelector('.site-wordmark');
  if (wordmark) wordmark.append(topper);
  const hero = document.querySelector('.hero');
  if (hero && hero.querySelector('.hero__inner')) {
    const badge = document.createElement('p');
    badge.className = 'hw-badge';
    badge.innerHTML = '<span aria-hidden="true">✦</span> A LITTLE HALLOWEEN MAGIC <span aria-hidden="true">✦</span>';
    hero.querySelector('.hero__inner').prepend(badge);
  }
  document.documentElement.classList.add('halloween-season');
  let frame = 0;
  function draw() {
    frame = 0;
    svg.setAttribute('height', '0');
    const w = document.documentElement.clientWidth;
    const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const small = w < 760;
    const headerBottom = header.offsetHeight;
    const gap = small ? 9 : Math.max(28, (w - 1140) / 2);
    const left = gap, right = w - gap;
    const start = headerBottom + 12, end = h - 20;
    const wave = small ? 3 : 14;
    const rope = (x, phase) => {
      let d = `M ${x} ${start}`;
      for (let y = start; y < end; y += 160) d += ` Q ${x + phase * wave} ${Math.min(y + 80,end)} ${x} ${Math.min(y + 160,end)}`;
      return d;
    };
    const paths = [rope(left,1),rope(right,-1)];
    let html = defs;
    paths.forEach(d => { html += `<path d="${d}" class="hw-rope-shadow"/><path d="${d}" class="hw-rope"/><path d="${d}" class="hw-rope-twist"/>`; });
    const brandX = wordmark ? wordmark.getBoundingClientRect().left + 13 : left;
    const tether = `M ${brandX} ${start-16} C ${brandX+18} ${start+8} ${left+20} ${start+35} ${left} ${start+82}`;
    html += `<path d="${tether}" class="hw-rope-shadow"/><path d="${tether}" class="hw-rope"/><path d="${tether}" class="hw-rope-twist"/><ellipse cx="${brandX}" cy="${start-13}" rx="7" ry="4" fill="none" stroke="#ead0a0" stroke-width="2"/>`;
    [left,right].forEach((x,i)=>{
      let wire=`M ${x} ${start}`;
      for(let y=start;y<end;y+=24) wire+=` Q ${x+8} ${y+6} ${x} ${y+12} Q ${x-8} ${y+18} ${x} ${Math.min(y+24,end)}`;
      html+=`<path d="${wire}" fill="none" stroke="#9f7044" stroke-width="1" opacity=".9"/>`;
    });
    // A porch-like garland beneath the navigation, leaving all links unobstructed.
    const garland = `M ${left} ${start} Q ${w*.25} ${start+31} ${w*.5} ${start+8} Q ${w*.75} ${start+31} ${right} ${start}`;
    html += `<path d="${garland}" class="hw-rope"/><path d="${garland}" class="hw-rope-twist"/>`;
    for (let x = left+20; x < right-10; x += small ? 33 : 45) {
      const y = start + 9 + Math.sin(x/w*Math.PI)*9;
      html += bulb(x,y,Math.round(x));
    }
    for (let y = start + 55; y < end - 35; y += small ? 112 : 88) {
      [left,right].forEach((x,i)=>{ html += bulb(x + Math.sin((y-start)/160*Math.PI)*wave*(i?-1:1)/2,y,Math.round(y+i*11)); });
    }
    const skeleton = (x,y,size,flip=false,angle=0) => {
      // The upper hand is the pivot: every climber actually holds its tether.
      const scale=size/110, a=angle*Math.PI/180, handX=(flip?-21:21)*scale, handY=8*scale;
      const px=handX*Math.cos(a)-handY*Math.sin(a), py=handX*Math.sin(a)+handY*Math.cos(a);
      return `<g transform="translate(${x-px} ${y-py}) rotate(${angle}) scale(${flip?-scale:scale} ${scale})" class="hw-climber"><use href="#hw-skeleton"/></g>`;
    };
    // Larger hero climbers echo the mixed-size skeletons in the reference photo.
    const heroSize = hero ? (small ? 39 : w >= 1000 ? 116 : 40) : Math.max(16,Math.min(44,gap-12));
    html += skeleton(left, start+85, heroSize, false, small?-8:-12);
    html += skeleton(right, start+(small?150:295), hero ? heroSize*1.1 : heroSize, true, small?8:12);
    if (!small && hero && w >= 1200) html += skeleton(left,start+550,60,false,8);
    // Keep subsequent ornaments in the gutters, not over reading or drawing areas.
    for (let y=start+1000, n=0; y<end-230; y+=850,n++) {
      const flip=n%2===1, x=flip?right:left;
      html += skeleton(x,y,small?16:Math.max(16,Math.min(68,gap-12)),flip,flip?8:-8);
      if(!small) html += `<path d="M${x-10} ${y-70} l15 28 14 -24 -9 51 -11 -19 -8 16 Z" fill="#fff8e5" opacity=".5"/>`;
    }
    html += `<use href="#hw-pumpkin" x="${left+5}" y="${end-65}" width="60" height="60"/><g transform="translate(${right-(small?25:65)} ${end-48}) scale(.72)"><use href="#hw-pumpkin"/></g>`;
    svg.setAttribute('width', String(w)); svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    svg.innerHTML = html;
  }
  function bulb(x,y,seed) {
    return `<g class="hw-light" style="--hw-delay:-${seed%7}s"><path d="M${x} ${y-6} v6" stroke="#947353" stroke-width="2"/><ellipse cx="${x}" cy="${y+5}" rx="7" ry="9" fill="#ff8e28" opacity=".7" filter="url(#hw-glow)"/><ellipse cx="${x}" cy="${y+5}" rx="3.1" ry="5.2" fill="#ffb25b"/><ellipse cx="${x-1}" cy="${y+3}" rx=".9" ry="2" fill="#fff3c9"/></g>`;
  }
  const schedule = () => { if(!frame) frame = requestAnimationFrame(draw); };
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('load',schedule,{once:true});
  // Layout changes (e.g. book data) must not leave the tethers hanging mid-page.
  const observer = new ResizeObserver(schedule);
  observer.observe(document.body);
  draw();
})();
