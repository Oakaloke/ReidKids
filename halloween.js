/* Seasonal porch-inspired installation. Decorative only; no stored data. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  if (!header || document.getElementById('halloween-decor')) return;
  const host = document.createElement('div');
  host.id='halloween-decor'; host.setAttribute('aria-hidden','true'); host.inert=true;
  header.after(host);
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 1200 500'); svg.setAttribute('focusable','false');
  host.append(svg);
  document.documentElement.classList.add('halloween-season');
  // Each skeleton is individually articulated, rather than mirrored icon art.
  function skeleton(x,y,scale,angle,pose,anchor) {
    const poses={
      seated:{arms:[[-28,53],[-37,86],[35,57],[49,83]],legs:[[-45,108],[-18,155],[48,112],[76,146]]},
      hanging:{arms:[[-31,3],[-27,-43],[42,14],[58,-10]],legs:[[2,146],[60,104],[51,132],[94,91]]},
      climbing:{arms:[[-34,9],[-35,-29],[29,16],[35,-18]],legs:[[-31,132],[-17,166],[31,111],[39,140]]},
      pulling:{arms:[[-44,48],[-76,16],[-7,64],[-54,28]],legs:[[-18,141],[-42,187],[33,135],[50,179]]}
    };
    const p=poses[pose];
    let ax=0,ay=0;
    if(anchor){const a=angle*Math.PI/180;ax=(anchor[0]*Math.cos(a)-anchor[1]*Math.sin(a))*scale;ay=(anchor[0]*Math.sin(a)+anchor[1]*Math.cos(a))*scale;}
    const bone=(a,b,width=4)=>`<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" class="hw-bone-outline" stroke-width="${width+1.5}"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" class="hw-bone" stroke-width="${width}"/>`;
    const joint=(a,r=2.6)=>`<circle cx="${a[0]}" cy="${a[1]}" r="${r}" fill="#ddd3b7" stroke="#9e9582" stroke-width=".8"/>`;
    const hand=(a,flip)=>`<g transform="translate(${a[0]} ${a[1]}) rotate(${flip?18:-22})"><path d="M0 4 l-3 -7 m3 7 l0 -11 m0 11 l3 -11 m-3 11 l6 -8 m-6 8 l8 -4" class="hw-fingers"/></g>`;
    let out=`<g transform="translate(${x-ax} ${y-ay}) rotate(${angle}) scale(${scale})" class="hw-skeleton">`;
    // Small skull, long neck and torso: restrained proportions like the reference props.
    out+=`<path d="M-12 1 C-15 -8 -10 -18 0 -19 C10 -19 15 -12 13 -2 L10 8 L7 13 L-7 13 L-10 7 Z" fill="url(#hw-ivory)" stroke="#9e9582" stroke-width="1"/>
    <path d="M-8 7 L-7 17 Q0 21 7 17 L8 7" fill="#ddd3b7" stroke="#9e9582" stroke-width=".8"/><path d="M-7 11 H7 M-4 9 V16 M0 9 V17 M4 9 V16" stroke="#918a7c" stroke-width=".8"/>
    <ellipse cx="-6" cy="0" rx="3.8" ry="4.7" fill="#474940"/><ellipse cx="6" cy="0" rx="3.8" ry="4.7" fill="#474940"/><path d="M0 3 L-2.7 8 H2.7 Z" fill="#636155"/>`;
    out+=bone([0,20],[0,91],3.2);
    out+=`<path d="M-21 35 Q-10 28 0 34 Q10 28 21 35" class="hw-bone" stroke-width="3.5"/>`;
    for(let i=0;i<6;i++){const yy=39+i*6,spread=21-i*1.3;out+=`<path d="M-2 ${yy} C-${spread} ${yy-9} -${spread+5} ${yy+5} -3 ${yy+7} M2 ${yy} C${spread} ${yy-9} ${spread+5} ${yy+5} 3 ${yy+7}" fill="none" stroke="#dcd2b8" stroke-width="2.6"/>`;}
    out+=`<path d="M-15 88 Q-6 96 0 89 Q6 96 15 88 L19 101 L9 112 L0 104 L-9 112 L-19 101 Z" fill="url(#hw-ivory)" stroke="#9e9582" stroke-width="1"/><ellipse cx="-10" cy="100" rx="4" ry="5" fill="#6a6a57"/><ellipse cx="10" cy="100" rx="4" ry="5" fill="#6a6a57"/>`;
    [[[-21,35],p.arms[0],p.arms[1]],[[21,35],p.arms[2],p.arms[3]]].forEach((v,i)=>{out+=bone(v[0],v[1],3.8)+joint(v[1])+bone(v[1],v[2],2.8)+bone([v[1][0]+2,v[1][1]],[v[2][0]+2,v[2][1]],1.2)+hand(v[2],i);});
    [[[-10,108],p.legs[0],p.legs[1]],[[10,108],p.legs[2],p.legs[3]]].forEach(v=>{out+=bone(v[0],v[1],4.6)+joint(v[1],3)+bone(v[1],v[2],3.2)+bone([v[1][0]+3,v[1][1]],[v[2][0]+2,v[2][1]],1.5)+`<path d="M${v[2][0]-3} ${v[2][1]} q4 -3 7 1 l8 5 q-8 4 -15 0 Z" fill="#e0d7bd" stroke="#9e9582" stroke-width=".8"/>`;});
    return out+'</g>';
  }
  function draw() {
  const mark=header.querySelector('.site-wordmark');
  const anchorX=mark ? (mark.getBoundingClientRect().left+18)*1200/document.documentElement.clientWidth : 79;
  const rope=`M ${anchorX} 0 C ${anchorX+12} 42 236 88 349 119 S 669 184 811 209 S 1030 254 1184 278`;
  let content=`<defs><linearGradient id="hw-ivory"><stop stop-color="#f1e9d6"/><stop offset=".55" stop-color="#d8ceb3"/><stop offset="1" stop-color="#b5aa90"/></linearGradient></defs>
  <path d="${rope}" fill="none" stroke="#725e3e" stroke-width="3.4"/>
  <path d="${rope}" fill="none" stroke="#c4ae7c" stroke-width="2.1"/>
  <path d="${rope}" fill="none" stroke="#e0cc9d" stroke-width=".65" stroke-dasharray="2 5"/>`;
  // Delicate warm bulbs and small gauze scraps, never a rectangular light border.
  const lamps=[[127,32],[182,62],[246,86],[309,109],[382,127],[458,145],[538,161],[619,177],[703,191],[785,205],[868,220],[949,237],[1030,253],[1110,267],[1170,276]];
  lamps.forEach(([x,y],i)=>{content+=`<path d="M${x-7} ${y-3} q7 9 14 3" fill="none" stroke="#b39863" stroke-width=".7"/><path d="M${x} ${y} v7" stroke="#887148" stroke-width="1"/><ellipse cx="${x}" cy="${y+10}" rx="2.3" ry="3.6" fill="#e4a75d"/><ellipse cx="${x-.5}" cy="${y+9}" rx=".65" ry="1.5" fill="#ffe1a5"/>`;});
  [[281,103,1],[561,168,.65],[765,203,.8]].forEach(([x,y,s])=>{content+=`<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="#e5dfcc" stroke-width=".7" opacity=".42"><path d="M-14 -5 L-5 22 L1 8 L10 34 L16 11 L25 29 L32 4 M-10 4 L29 9 M-5 12 L24 18 M2 18 L17 23 M-14 -5 L32 4"/></g>`;});
  content+=skeleton(anchorX,22,.6,28,'seated');
  content+=skeleton(238,83,.88,-64,'hanging',[-27,-43]);
  content+=skeleton(697,190,.31,-23,'climbing',[-35,-29]);
  content+=skeleton(1000,247,1.18,7,'pulling',[-76,16]);
  svg.innerHTML=content;
  }
  draw();
  window.addEventListener('resize',draw,{passive:true});
  window.addEventListener('load',draw,{once:true});
})();
