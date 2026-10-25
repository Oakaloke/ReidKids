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
    <filter id="hw-glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>`;
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('hw-ropes');
  svg.setAttribute('focusable', 'false');
  layer.append(svg);
  const wordmark = header.querySelector('.site-wordmark');
  const hero = document.querySelector('.hero');
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
    const heroSize = small ? 100 : Math.min(430, Math.max(240, w*.36));
    if(hero) {
      const top=start+18;
      html+=`<image href="assets/halloween-skeleton.webp?v=20261025-4" x="${left-heroSize*.47}" y="${top}" width="${heroSize}" height="${heroSize*1.5}" preserveAspectRatio="xMidYMid meet"/><g transform="translate(${right+heroSize*.47} ${top}) scale(-1 1)"><image href="assets/halloween-skeleton.webp?v=20261025-4" width="${heroSize}" height="${heroSize*1.5}" preserveAspectRatio="xMidYMid meet"/></g>`;
    }
    svg.setAttribute('width', String(w)); svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    svg.innerHTML = html;
  }
  function bulb(x,y,seed) {
    return `<g class="hw-light" style="--hw-delay:-${seed%7}s"><path d="M${x} ${y-6} v6" stroke="#947353" stroke-width="2"/><ellipse cx="${x}" cy="${y+5}" rx="7" ry="9" fill="#ff8e28" opacity=".45" filter="url(#hw-glow)"/><ellipse cx="${x}" cy="${y+5}" rx="3.1" ry="5.2" fill="#ffb25b"/><ellipse cx="${x-1}" cy="${y+3}" rx=".9" ry="2" fill="#fff3c9"/></g>`;
  }
  const schedule = () => { if(!frame) frame = requestAnimationFrame(draw); };
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('load',schedule,{once:true});
  // Layout changes (e.g. book data) must not leave the tethers hanging mid-page.
  const observer = new ResizeObserver(schedule);
  observer.observe(document.body);
  draw();
})();
