const save=document.querySelector('#save-demo');
function wireSave(button){let timer;button.addEventListener('click',()=>{if(button.disabled)return;button.disabled=true;button.querySelector('span').textContent='Saving…';button.querySelector('.button-icon').textContent='·';timer=setTimeout(()=>{button.classList.add('done');button.querySelector('span').textContent='Saved';button.querySelector('.button-icon').textContent='✓';timer=setTimeout(()=>{button.classList.remove('done');button.querySelector('span').textContent='Save changes';button.querySelector('.button-icon').textContent='↗';button.disabled=false},1300)},750)});}
function wireTabs(group){const buttons=[...group.querySelectorAll('button')];function select(button){buttons.forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1})}buttons.forEach((b,i)=>{b.addEventListener('click',()=>select(b));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%buttons.length;if(e.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;if(e.key==='Home')n=0;if(e.key==='End')n=buttons.length-1;if(n!==undefined){e.preventDefault();select(buttons[n]);buttons[n].focus()}})})}
function wireToggle(button){button.addEventListener('click',()=>button.setAttribute('aria-checked',String(button.getAttribute('aria-checked')!=='true')))}
wireSave(save);wireTabs(document.querySelector('.tabs'));wireToggle(document.querySelector('#quiet-demo'));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('[data-category]').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter)}));
const demo=document.querySelector('#bear-demo');document.querySelector('#play-bear').addEventListener('click',()=>{demo.currentTime=0;demo.play().catch(()=>{})});
const common='body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fcfdfd;font-family:Arial,sans-serif}button{font:inherit;cursor:pointer}button:focus-visible{outline:2px solid #247ab6;outline-offset:5px}@media(prefers-reduced-motion:reduce){*{transition:none!important}}';
const prototypes={
button:{title:'Loading button',html:save.outerHTML,css:'.save-button{min-width:165px;display:flex;justify-content:space-between;gap:25px;background:#29343c;color:white;border:1px solid #29343c;border-radius:8px;padding:14px 18px;font-size:13px;transition:background .2s,transform .12s}.save-button:active{transform:scale(.97)}.save-button.done{background:#247ab6;border-color:#247ab6}',js:wireSave.toString()+";wireSave(document.querySelector('button'));"},
tabs:{title:'Segmented control',html:document.querySelector('.tabs').outerHTML,css:'.tabs{display:flex;padding:5px;background:#e6f5ff;border:1px solid #e2e0d9;border-radius:10px}.tabs button{width:80px;padding:10px;border:0;background:transparent;border-radius:6px;font-size:13px;color:#888078;transition:background .2s,color .2s}.tabs button[aria-selected=true]{background:white;color:#29343c}',js:wireTabs.toString()+";wireTabs(document.querySelector('.tabs'));"},
toggle:{title:'Toggle study',html:document.querySelector('.toggle-row').outerHTML,css:'.toggle-row{display:flex;align-items:center;gap:65px;font-size:14px}.toggle{width:57px;height:33px;padding:4px;border:0;border-radius:30px;background:#d9d6cf;transition:background .25s}.toggle>span{display:block;width:25px;height:25px;background:white;border-radius:50%;transition:transform .3s}.toggle[aria-checked=true]{background:#ffc33d}.toggle[aria-checked=true]>span{transform:translateX(24px)}',js:wireToggle.toString()+";wireToggle(document.querySelector('button'));"}}
Object.assign(prototypes,{wave:{title:'Bear wave — original animation',file:'components/bear-wave.html'},'name-tag':{title:'Name tag',file:'components/name-tag.html'},'pixel-loader':{title:'Pixel loader',file:'components/pixel-loader.html'},closingdoor:{title:'Closing door',file:'components/closingdoor.html'}});
const dialog=document.querySelector('#source-dialog');let selectedCode='',selectedName='';
document.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',async()=>{const item=prototypes[button.dataset.source];selectedName=button.dataset.source;selectedCode='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+item.title+'</title><style>'+common+item.css+'</style></head><body>'+item.html+'<script>'+item.js+'</scr'+'ipt></body></html>';if(item.file){try{const response=await fetch(item.file);if(!response.ok)throw Error();selectedCode=await response.text()}catch{button.textContent='Could not load — retry';return}}if(button.hasAttribute('data-copy-direct')){try{await navigator.clipboard.writeText(selectedCode);button.textContent='Copied!';setTimeout(()=>button.textContent='Copy code',1600);return}catch{/* Show selectable source when clipboard access is unavailable. */}}document.querySelector('#source-title').textContent=item.title;document.querySelector('#source-code').textContent=selectedCode;document.querySelector('#copy-code').textContent='Copy code';dialog.showModal()}));
document.querySelector('#close-source').addEventListener('click',()=>dialog.close());
document.querySelector('#copy-code').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(selectedCode);e.target.textContent='Copied'}catch{e.target.textContent='Use Download HTML'}});
document.querySelector('#download-code').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([selectedCode],{type:'text/html'}));const a=document.createElement('a');a.href=url;a.download=selectedName+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});

/* Expandable action bar and status island. Behaviour adapted from the
   beui.dev ExpandableActionBar and DynamicIsland snippets supplied by the
   site owner; vanilla builds for this site. */
function wireActionBar(bar){const reduced=matchMedia('(prefers-reduced-motion: reduce)');const buttons=[...bar.querySelectorAll('button')];
 const glow=document.createElement('span');glow.className='ab-glow';glow.setAttribute('aria-hidden','true');bar.prepend(glow);
 let timer=0,armed=false,lastType='mouse',wasOpen=false;
 const open=()=>{clearTimeout(timer);bar.classList.add('open')};
 const lift=()=>{glow.style.opacity='0'};
 const close=()=>{clearTimeout(timer);timer=setTimeout(()=>{bar.classList.remove('open');armed=false;lift()},90)};
 const move=b=>{glow.style.width=b.offsetWidth+'px';glow.style.transform='translateX('+b.offsetLeft+'px)';glow.style.opacity='1'};
 const select=b=>buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 // Pointer events rather than mouseenter/mouseleave: a tap fires compatibility
 // mouse events carrying no pointerType, and the bar growing under a still
 // finger fired the leave before the click landed — one tap opened, closed and
 // ran nothing.
 bar.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')open()});
 bar.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'){lift();close()}});
 bar.addEventListener('focusin',open);
 bar.addEventListener('focusout',e=>{if(!bar.contains(e.relatedTarget))close()});
 for(const b of buttons){
  b.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){clearTimeout(timer);move(b)}});
  b.addEventListener('focus',()=>{open();move(b)});
  b.addEventListener('pointerdown',e=>{lastType=e.pointerType;wasOpen=bar.classList.contains('open')});
  // Nothing reveals the labels to a finger, so the first tap opens the bar and
  // the next one acts. Read from the state at pointerdown: a browser that
  // focuses the button on contact opens the bar mid-tap, and that first tap
  // would otherwise fire the action it was meant to reveal.
  b.addEventListener('click',()=>{
   if(lastType!=='mouse'&&!wasOpen&&!armed){armed=true;open();move(b);return}
   select(b);move(b);
  });
 }
 // A finger never hovers, so a bar a tap opened has nothing to close it.
 document.addEventListener('pointerdown',e=>{if(armed&&!bar.contains(e.target))close()});
 reduced.addEventListener('change',()=>{if(reduced.matches)lift()});
}
function wireIsland(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const shell=root.querySelector('.island-shell'),sizer=root.querySelector('.island-sizer');
 const slots=[...sizer.querySelectorAll('.island-slot')],tabs=[...root.querySelectorAll('[data-island-view]')];
 let current=slots.find(s=>!s.hidden)||slots[0],timer=0;
 // The shell owns explicit dimensions and springs toward the natural size of
 // whatever slot is showing, so the slot is never scale-distorted.
 const fit=()=>{shell.style.width=sizer.offsetWidth+'px';shell.style.height=sizer.offsetHeight+'px'};
 function show(next){if(!next||next===current)return;clearTimeout(timer);
  const swap=()=>{current.classList.remove('leaving');current.hidden=true;next.hidden=false;current=next;
   next.classList.remove('enter');void next.offsetWidth;if(!reduced.matches)next.classList.add('enter');fit()};
  if(reduced.matches){swap();return}
  current.classList.add('leaving');timer=setTimeout(swap,80);
 }
 for(const tab of tabs)tab.addEventListener('click',()=>{tabs.forEach(t=>t.setAttribute('aria-pressed',String(t===tab)));
  show(slots.find(s=>s.dataset.view===tab.dataset.islandView))});
 new ResizeObserver(fit).observe(sizer);fit();
}
const bar=document.querySelector('#action-bar-demo'),island=document.querySelector('#island-demo');
// Snapshot the authored markup before wiring: the bar injects its highlight
// span and the island writes inline dimensions, neither of which belongs in
// an exported copy that wires itself up again.
const barHTML=bar.outerHTML,islandHTML=island.outerHTML;
wireActionBar(bar);wireIsland(island);

/* Lift each prototype's rules straight out of the live stylesheet, so the
   exported file cannot drift from what the page is actually showing. */
/* Two :root blocks exist and the later one wins, so hardcoding palette values
   into an export ships the dead one. Read what the page is actually using. */
function varsFor(...names){const style=getComputedStyle(document.documentElement);
 return ':root{'+names.map(n=>n+':'+style.getPropertyValue(n).trim()).join(';')+'}'}
function cssFor(test){const out=[];for(const sheet of document.styleSheets){let rules;try{rules=sheet.cssRules}catch{continue}
 for(const rule of rules){
  if(rule.selectorText&&test.test(rule.selectorText)){out.push(rule.cssText);continue}
  if(rule.name&&test.test(rule.name)){out.push(rule.cssText);continue}
  if(rule.media&&rule.cssRules){const inner=[...rule.cssRules].filter(r=>r.selectorText&&test.test(r.selectorText));
   if(inner.length)out.push('@media '+rule.conditionText+'{'+inner.map(r=>r.cssText).join('')+'}')}
 }}return out.join('')}
Object.assign(prototypes,{
metallic:{title:'Metallic button',html:document.querySelector('#metallic-demo').outerHTML,css:'*{box-sizing:border-box}'+varsFor('--paper','--ink')+cssFor(/^\.metallic|^metal-drift$/),js:''},
'action-bar':{title:'Expandable action bar',html:barHTML,css:'*{box-sizing:border-box}'+varsFor('--line','--muted','--ink','--amber')+cssFor(/^\.(action-bar|ab-)/),js:wireActionBar.toString()+";wireActionBar(document.querySelector('.action-bar'));"},
island:{title:'Status island',html:islandHTML,css:'*{box-sizing:border-box}'+varsFor('--line','--muted','--ink')+cssFor(/^\.island|^island-in$/),js:wireIsland.toString()+";wireIsland(document.querySelector('.island'));"}});

/* Magnetic button, marquee and count-up. Vanilla builds for this site. */
function wireMagnetic(button){const reduced=matchMedia('(prefers-reduced-motion: reduce)'),hover=matchMedia('(hover: hover) and (pointer: fine)');
 const label=button.querySelector('.magnetic-label');let x=0,y=0,vx=0,vy=0,tx=0,ty=0,raf=0,last=0;
 // Same critically-damped spring the card tilt uses, so the two read as one
 // piece of hardware.
 function tick(now){const dt=Math.min((now-(last||now))/1000,.032)||.016;last=now;
  vx+=(190*(tx-x)-26*vx)*dt;vy+=(190*(ty-y)-26*vy)*dt;x+=vx*dt;y+=vy*dt;
  button.style.transform='translate('+x.toFixed(2)+'px,'+y.toFixed(2)+'px)';
  if(label)label.style.transform='translate('+(x*.34).toFixed(2)+'px,'+(y*.34).toFixed(2)+'px)';
  if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.02)raf=requestAnimationFrame(tick);
  else{raf=0;if(!tx&&!ty){button.style.transform='';if(label)label.style.transform=''}}}
 const start=()=>{if(!raf){last=0;raf=requestAnimationFrame(tick)}};
 const rest=()=>{tx=ty=0;if(reduced.matches||!hover.matches){cancelAnimationFrame(raf);raf=0;x=y=vx=vy=0;button.style.transform='';if(label)label.style.transform=''}else start()};
 // Tracked from a ring around the button rather than from inside it, so the
 // pull starts before the cursor ever arrives.
 window.addEventListener('pointermove',e=>{if(reduced.matches||!hover.matches||e.pointerType==='touch')return;
  const box=button.getBoundingClientRect(),dx=e.clientX-(box.left+box.width/2),dy=e.clientY-(box.top+box.height/2);
  const distance=Math.hypot(dx,dy),reach=Math.max(box.width,box.height)/2+90;
  if(distance>reach){if(tx||ty){tx=ty=0;start()}return}
  const pull=1-distance/reach;tx=dx*pull*.42;ty=dy*pull*.42;start()});
 document.addEventListener('pointerleave',rest);window.addEventListener('blur',rest);
 reduced.addEventListener('change',rest);hover.addEventListener('change',rest);
}
function wireMarquee(root){const track=root.querySelector('.marquee-track');
 // A second copy closes the loop: both travel one track width and restart
 // together, so there is never a gap to see.
 const copy=track.cloneNode(true);copy.setAttribute('aria-hidden','true');root.append(copy);
}
function wireCount(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for(const el of root.querySelectorAll('.counter-value')){
  const target=+el.dataset.count,suffix=el.dataset.suffix||'',duration=+el.dataset.duration||1400;
  const paint=n=>{el.textContent=n.toLocaleString()+suffix};
  if(reduced.matches){paint(target);continue}
  // The authored markup already carries the final number, so a page with no
  // scripting shows the real figure rather than a zero.
  paint(0);
  const run=startedAt=>{const step=now=>{const progress=Math.min((now-startedAt)/duration,1);
    paint(Math.round(target*(1-Math.pow(1-progress,3))));
    if(progress<1)requestAnimationFrame(step)};requestAnimationFrame(step)};
  const watch=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){watch.disconnect();run(performance.now())}},{threshold:.5});
  watch.observe(el);
 }
}
const magnet=document.querySelector('#magnetic-demo'),marquee=document.querySelector('#marquee-demo'),counter=document.querySelector('#counter-demo');
const magnetHTML=magnet.outerHTML,marqueeHTML=marquee.outerHTML,counterHTML=counter.outerHTML;
wireMagnetic(magnet);wireMarquee(marquee);wireCount(counter);
Object.assign(prototypes,{
magnetic:{title:'Magnetic button',html:magnetHTML,css:'*{box-sizing:border-box}'+varsFor('--ink','--paper','--amber')+cssFor(/^\.magnetic/),js:wireMagnetic.toString()+";wireMagnetic(document.querySelector('.magnetic'));"},
marquee:{title:'Marquee',html:marqueeHTML,css:'*{box-sizing:border-box}body{display:block!important;padding:40px 0}'+varsFor('--muted','--amber')+cssFor(/^\.marquee|^marquee-run$/),js:wireMarquee.toString()+";wireMarquee(document.querySelector('.marquee'));"},
counter:{title:'Count up',html:counterHTML,css:'*{box-sizing:border-box}'+varsFor('--ink','--muted')+cssFor(/^\.counter/),js:wireCount.toString()+";wireCount(document.querySelector('.counter'));"}});

/* Confirm tile, signal orb and odometer. Vanilla builds for this site. */
function wireConfirm(root){const trigger=root.querySelector('.confirm-trigger'),status=root.querySelector('[role=status]');
 let hold=0;
 const finish=(mark,ms,word)=>{clearTimeout(hold);
  root.classList.remove('open');trigger.setAttribute('aria-expanded','false');
  root.classList.add(mark);status.textContent=word;trigger.focus();
  hold=setTimeout(()=>{root.classList.remove(mark);status.textContent=''},ms)};
 trigger.addEventListener('click',()=>{
  if(root.classList.contains('open')){finish('kept',600,'Kept');return}
  clearTimeout(hold);root.classList.remove('done','kept');status.textContent='';
  root.classList.add('open');trigger.setAttribute('aria-expanded','true')});
 root.querySelector('[data-confirm]').addEventListener('click',()=>finish('done',1400,'Deleted'));
 root.querySelector('[data-cancel]').addEventListener('click',()=>finish('kept',600,'Kept'));
 // Escape is how people expect to back out of a confirmation.
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('open')){e.stopPropagation();finish('kept',600,'Kept')}});
}
function wireOrb(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),readout=root.querySelector('.orb-state');
 const tabs=[...root.querySelectorAll('[data-orb]')];
 const size=canvas.width,dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=canvas.height=Math.round(size*dpr);canvas.style.width=canvas.style.height=size+'px';
 // Scale by buffer/size rather than by dpr, so the transform stays exact when
 // the buffer rounds.
 ctx.scale(canvas.width/size,canvas.height/size);
 ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--amber').trim()||'#247ab6';
 const GRID=11,half=(GRID-1)/2,gap=size*.74/(GRID-1),rmax=gap*.6,mid=size/2;
 const REST={idle:.86,listening:1,thinking:.93};
 const weights={idle:1,listening:0,thinking:0};
 let mode='idle',scale=REST.idle,vel=0,clock=0,last=0,frame=0;

 // Two slow waves multiplied: neither crosses zero, so the level never snaps
 // at a trough the way a rectified sine does.
 const level=t=>.24+.76*(.45+.55*(.5+.5*Math.sin(t*.64+.4)))*(.5+.5*Math.sin(t*1.87+1.1));
 const heat=(state,d,nx,ny,t,amp)=>{
  if(state==='listening')return .3+amp*(.34+.4*(.5+.5*Math.sin(d*4.6-t*3.1)));
  if(state==='thinking'){let sum=0;
   for(const o of [[.6,2.1,0,.42],[.38,-1.6,2.2,.35],[.8,1.1,4.1,.33]]){
    const a=t*o[1]+o[2],dx=nx-Math.cos(a)*o[0],dy=ny-Math.sin(a)*o[0];
    sum+=Math.exp(-(dx*dx+dy*dy)/(o[3]*o[3]))}
   return .25+.8*Math.min(1,sum)}
  return .6+.13*Math.sin(t*1.05-d*2.3)};

 function draw(t,amp,s){ctx.clearRect(0,0,size,size);
  for(let iy=0;iy<GRID;iy++)for(let ix=0;ix<GRID;ix++){
   const nx=(ix-half)/half,ny=(iy-half)/half,d=Math.hypot(nx,ny);
   // 1.12 rather than the square's 1.41 corner is what rounds the silhouette.
   if(d>1.12)continue;
   let v=0;for(const k in weights)if(weights[k]>=.001)v+=weights[k]*heat(k,d,nx,ny,t,amp);
   const r=rmax*Math.exp(-d*d*1.7)*Math.min(1,Math.max(0,v))*s;
   // Under half a device pixel a dot renders as haze rather than a dot.
   if(r*dpr<.5)continue;
   ctx.beginPath();ctx.arc(mid+(ix-half)*gap*s,mid+(iy-half)*gap*s,r,0,Math.PI*2);ctx.fill()}}

 function tick(now){const dt=Math.min((now-(last||now))/1000,.05);last=now;clock+=dt;
  // Per-state weights, so interrupting a change blends from what is on screen
  // rather than restarting.
  const blend=1-Math.pow(1-.16,dt*60);
  for(const k in weights)weights[k]+=((k===mode?1:0)-weights[k])*blend;
  vel+=(-180*(scale-REST[mode])-26*vel)*dt;scale+=vel*dt;
  draw(clock,level(clock),scale);frame=requestAnimationFrame(tick)}

 function still(){cancelAnimationFrame(frame);frame=0;
  for(const k in weights)weights[k]=k===mode?1:0;draw(0,level(0),REST[mode])}
 function sync(){if(reduced.matches||document.hidden){still();return}if(!frame){last=0;frame=requestAnimationFrame(tick)}}
 for(const tab of tabs)tab.addEventListener('click',()=>{mode=tab.dataset.orb;
  tabs.forEach(t=>t.setAttribute('aria-pressed',String(t===tab)));
  readout.textContent=tab.textContent;sync()});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 new IntersectionObserver(e=>{e[0].isIntersecting?sync():(cancelAnimationFrame(frame),frame=0)},{threshold:.15}).observe(root);
 sync();
}
function wireOdometer(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const row=root.querySelector('.odometer-value'),status=root.querySelector('[role=status]');
 const start=+root.dataset.value||0;let value=start,shape='';
 const face=n=>{const s=document.createElement('span');s.className='odo-face';s.textContent=n;return s};
 const mod=(n,m)=>((n%m)+m)%m;

 function build(text){row.replaceChildren();shape='';
  for(const ch of text){
   if(ch>='0'&&ch<='9'){shape+='d';
    const place=document.createElement('span');place.className='odo-place';
    const reel=document.createElement('span');reel.className='odo-reel';
    reel.append(face(ch));place.append(reel);place.dataset.digit=ch;row.append(place)}
   else{shape+='m';const mark=document.createElement('span');mark.className='odo-mark';mark.textContent=ch;row.append(mark)}}}

 // Rebuild the reel as the exact run of faces between here and there, so the
 // column always travels the real distance instead of snapping or unwinding
 // the long way round.
 function roll(place,to,dir){const from=+place.dataset.digit;
  const steps=dir>=0?mod(to-from,10):mod(from-to,10);
  place.dataset.digit=to;
  if(!steps)return;
  const seq=[];for(let i=0;i<=steps;i++)seq.push(dir>=0?mod(from+i,10):mod(from-i,10));
  const reel=place.firstElementChild;
  reel.replaceChildren(...(dir>=0?seq:seq.slice().reverse()).map(face));
  const at=dir>=0?0:-steps*1.5,to_=dir>=0?-steps*1.5:0;
  reel.style.transition='none';reel.style.transform='translateY('+at+'em)';
  void reel.offsetHeight;
  reel.style.transition=reduced.matches?'none':'';
  reel.style.transform='translateY('+to_+'em)'}

 function show(next){const text=next.toLocaleString('en-US');
  const pattern=[...text].map(c=>c>='0'&&c<='9'?'d':'m').join('');
  const dir=next>=value?1:-1;value=next;status.textContent=text;
  // A place appearing or disappearing changes the row, so rebuild rather than
  // roll columns that no longer line up.
  if(pattern!==shape){build(text);return}
  const places=[...row.querySelectorAll('.odo-place')];let i=0;
  for(const ch of text)if(ch>='0'&&ch<='9')roll(places[i++],+ch,dir)}

 build(start.toLocaleString('en-US'));
 root.querySelector('[data-odo=step]').addEventListener('click',()=>show(value+37));
 root.querySelector('[data-odo=random]').addEventListener('click',()=>show(Math.floor(Math.random()*99999)));
 root.querySelector('[data-odo=reset]').addEventListener('click',()=>show(start));
}
const confirmTile=document.querySelector('#confirm-demo'),orb=document.querySelector('#orb-demo'),odometer=document.querySelector('#odometer-demo');
const confirmHTML=confirmTile.outerHTML,orbHTML=orb.outerHTML,odometerHTML=odometer.outerHTML;
wireConfirm(confirmTile);wireOrb(orb);wireOdometer(odometer);
Object.assign(prototypes,{
confirm:{title:'Delete, then mean it',html:confirmHTML,css:'*{box-sizing:border-box}'+varsFor('--muted','--ink','--line','--amber','--sky')+cssFor(/^\.confirm/)+'.scramble-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}',js:wireConfirm.toString()+";wireConfirm(document.querySelector('.confirm'));"},
orb:{title:'Signal orb',html:orbHTML,css:'*{box-sizing:border-box}'+varsFor('--muted','--ink','--line','--amber')+cssFor(/^\.orb/),js:wireOrb.toString()+";wireOrb(document.querySelector('.orb'));"},
odometer:{title:'Odometer',html:odometerHTML,css:'*{box-sizing:border-box}'+varsFor('--muted','--ink','--line')+cssFor(/^\.odo/)+'.scramble-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}',js:wireOdometer.toString()+";wireOdometer(document.querySelector('.odometer'));"}});

/* Folder and gooey nav. Vanilla builds for this site. */
function wireFolder(root){const body=root.querySelector('.folder-body');
 const set=open=>{root.classList.toggle('open',open);body.setAttribute('aria-expanded',String(open))};
 body.addEventListener('click',()=>set(!root.classList.contains('open')));
 // Leaving the folder puts it away; hover already lifts the cards, so a
 // half-open state left behind on exit reads as a bug.
 body.addEventListener('pointerleave',()=>set(false));
 body.addEventListener('focusout',e=>{if(!body.contains(e.relatedTarget))set(false)});
}
function wireGoo(root){const track=root.querySelector('.goo-track');
 const labels=[...root.querySelectorAll('.goo-labels button')];
 // The backing shapes mirror the labels rather than being authored twice, so
 // a renamed section cannot leave the goo layer the wrong width.
 const segs=labels.map(()=>{const s=document.createElement('span');s.className='goo-seg';track.append(s);return s});
 const measure=()=>labels.forEach((label,i)=>{segs[i].style.width=label.offsetWidth+'px'});
 const select=i=>{labels.forEach((label,n)=>{label.setAttribute('aria-pressed',String(n===i));segs[n].classList.toggle('on',n===i)});measure()};
 labels.forEach((label,i)=>label.addEventListener('click',()=>select(i)));
 new ResizeObserver(measure).observe(root);
 select(labels.findIndex(l=>l.getAttribute('aria-pressed')==='true')||0);
 // Web fonts land after first paint and change every label's width.
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
}
const folder=document.querySelector('#folder-demo'),goo=document.querySelector('#goo-demo');
const folderHTML=folder.outerHTML,gooHTML=goo.outerHTML;
wireFolder(folder);wireGoo(goo);
Object.assign(prototypes,{
folder:{title:'Folder',html:folderHTML,css:'*{box-sizing:border-box}'+varsFor('--amber','--line','--ink')+cssFor(/^\.folder/),js:wireFolder.toString()+";wireFolder(document.querySelector('.folder'));"},
goo:{title:'Gooey nav',html:gooHTML,css:'*{box-sizing:border-box}'+varsFor('--amber','--muted','--ink')+cssFor(/^\.goo/),js:wireGoo.toString()+";wireGoo(document.querySelector('.goo'));"}});

/* Gravity letters. A heightmap rather than pairwise collision: glyphs only
   ever need to know how high the pile is beneath them, which stays cheap no
   matter how many have landed. */
function wireGravity(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const POOL='ABCDEFGHJKLMNPRSTUVWXYZ',COL=8,MAX=44,GRAVITY=1150,SLOPE=.34,LEAVE=340;
 const bodies=[];let heights=[],frame=0,last=0,hold=0,pour=0,live=null;
 const box=()=>({w:root.clientWidth||1,h:root.clientHeight||1});
 const span=(x,w)=>{const from=Math.max(0,Math.floor(x/COL));
  return [from,Math.min(heights.length-1,Math.max(from,Math.ceil((x+w)/COL)-1))]};
 const topOf=(from,to)=>{if(from<0||to>=heights.length)return Infinity;let t=0;
  for(let i=from;i<=to;i++)t=Math.max(t,heights[i]);return t};
 const restY=(x,w,h)=>{const [a,b]=span(x,w);return box().h-topOf(a,b)-h};
 const deposit=body=>{const [a,b]=span(body.x,body.w);
  for(let i=a;i<=b;i++)heights[i]=Math.max(heights[i],box().h-body.y)};

 // Walk downhill while a neighbouring column sits far enough below: this is
 // what makes a pile spread instead of growing a single tower.
 function settleX(x,w,h){const {w:width}=box();let at=Math.min(Math.max(x,0),Math.max(width-w,0));
  const fall=h*SLOPE,step=Math.max(COL,Math.round(w/3));
  for(let i=0;i<40;i++){const [a,b]=span(at,w),run=b-a+1,here=topOf(a,b);
   const left=here-topOf(a-run,a-1),right=here-topOf(b+1,b+run);
   let next=at;
   if(left>fall&&right>fall)next=Math.random()<.5?at-step:at+step;
   else if(left>fall&&left>=right)next=at-step;
   else if(right>fall)next=at+step;
   next=Math.min(Math.max(next,0),Math.max(width-w,0));
   if(next===at)break;at=next}
  return at}

 // Tilt to the slope it lands on, so a glyph resting half on a neighbour
 // leans rather than floating level.
 function aim(body){const {h:height}=box();
  body.targetX=settleX(body.x,body.w,body.h);
  const [a,b]=span(body.targetX,body.w),mid=Math.ceil((a+b)/2);
  const lean=b>a?(topOf(a,mid-1)-topOf(mid,b))/Math.max((b-a+1)/2*COL,1):0;
  body.rest=Math.max(-16,Math.min(16,Math.atan(lean)*180/Math.PI+(Math.random()-.5)*7));
  body.targetY=restY(body.targetX,body.w,body.h);
  body.fromX=body.x;body.fromY=Math.min(body.y,body.targetY)}

 const paint=body=>{body.el.style.transform='translate3d('+body.x.toFixed(1)+'px,'+body.y.toFixed(1)+'px,0) rotate('+body.rot.toFixed(1)+'deg)'};
 function rebuild(){heights=new Array(Math.max(1,Math.ceil(box().w/COL))).fill(0);
  for(const body of bodies.filter(b=>b.done).sort((x,y)=>y.y-x.y))deposit(body)}

 function tick(now){const dt=Math.min((now-(last||now))/1000,1/30);last=now;let busy=false;
  for(const body of bodies){if(body.done)continue;
   body.vy+=GRAVITY*dt;body.y+=body.vy*dt;
   const total=body.targetY-body.fromY,p=total>0?Math.min((body.y-body.fromY)/total,1):1;
   // Drift across to the landing column as it falls, rather than teleporting.
   body.x=body.fromX+(body.targetX-body.fromX)*p*(2-p);
   body.rot=body.spin*(1-p*p*p)+body.rest*(p*p*p);
   // Land against the pile as it is now, not as it was at spawn: anything
   // still in the air would otherwise drop straight through whatever landed
   // underneath it while it fell.
   if(body.y>=restY(body.x,body.w,body.h)){
    body.x=settleX(body.x,body.w,body.h);body.y=restY(body.x,body.w,body.h);body.rot=body.rest;
    body.done=true;deposit(body);paint(body);
    body.inner.animate?.([{transform:'scaleY(.82)'},{transform:'scaleY(1)'}],{duration:160,easing:'cubic-bezier(.215,.61,.355,1)'});
    continue}
   paint(body);busy=true}
  frame=busy?requestAnimationFrame(tick):0}
 const wake=()=>{if(!frame&&!reduced.matches){last=0;frame=requestAnimationFrame(tick)}};

 function trim(){const alive=bodies.filter(b=>!b.leaving);
  for(let i=0;i<alive.length-MAX;i++){const body=alive[i];body.leaving=true;body.el.style.opacity='0';
   setTimeout(()=>{body.el.remove();bodies.splice(bodies.indexOf(body),1);rebuild()},LEAVE)}}

 function drop(cx,cy){const {w,h}=box();if(!heights.length)rebuild();
  const el=document.createElement('span');el.className='gravity-glyph';
  const inner=document.createElement('span');inner.textContent=POOL[Math.random()*POOL.length|0];el.append(inner);
  el.style.fontSize=Math.round(21*(.8+Math.random()*.5))+'px';root.append(el);
  const body={el,inner,w:el.offsetWidth,h:el.offsetHeight,vy:0,rot:0,done:false};
  body.x=Math.min(Math.max(cx-body.w/2,0),Math.max(w-body.w,0));body.y=cy-body.h/2;
  body.spin=reduced.matches?0:(Math.random()-.5)*70;
  aim(body);
  if(reduced.matches){body.x=body.targetX;body.y=body.targetY;body.rot=body.rest;body.done=true;deposit(body)}
  else{// start clear of the pile, and clear of anything still falling above it
   let from=Math.min(body.y,body.targetY-22);
   for(const other of bodies)if(!other.done&&other.targetX<body.targetX+body.w&&body.targetX<other.targetX+other.w)
    from=Math.min(from,other.y-body.h-8);
   body.y=body.fromY=from;body.rot=body.spin}
  bodies.push(body);paint(body);root.classList.add('used');trim();wake()}

 const at=e=>{const r=root.getBoundingClientRect();
  return [Math.min(Math.max(e.clientX-r.left,0),r.width),Math.min(Math.max(e.clientY-r.top,0),r.height)]};
 root.addEventListener('pointerdown',e=>{if(e.button)return;e.preventDefault();
  root.setPointerCapture?.(e.pointerId);live=e.pointerId;const [x,y]=at(e);drop(x,y);
  let px=x,py=y;
  root.addEventListener('pointermove',function move(m){if(m.pointerId!==live)return;[px,py]=at(m);
   root.__move=move},{passive:true});
  hold=setTimeout(()=>{pour=setInterval(()=>drop(px+(Math.random()-.5)*16,py),120)},300)});
 const stop=()=>{clearTimeout(hold);clearInterval(pour);pour=0;live=null};
 for(const type of ['pointerup','pointercancel','pointerleave'])root.addEventListener(type,stop);
 new ResizeObserver(()=>{rebuild()}).observe(root);
 reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0}});
 rebuild();
}

/* Grid reveal. The picture is arrived at rather than faded in: one cell
   splits into two, over and over, each pair carrying the average colour of
   the half it covers, so the image resolves out of its own blocks. */
function wireReveal(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
 const SIZE=canvas.width,LEAVES=130,SAMPLE=96,MORPH=.07,RUN=2700;
 const dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=canvas.height=Math.round(SIZE*dpr);canvas.style.width=canvas.style.height=SIZE+'px';
 ctx.scale(canvas.width/SIZE,canvas.height/SIZE);

 const clamp01=n=>n>0?(n<1?n:1):0;
 const mix=(a,b,t)=>a+(b-a)*t;
 const ease=t=>1-Math.pow(1-t,3);
 const smooth=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t)};
 const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
 const cell=(x,y,w,h,parent)=>({x,y,w,h,parent,kids:null,r:228,g:234,b:241,tone:hash(x+3.1,y+1.7),detail:0,at:0});

 const trunk=cell(0,0,1,1,null),branches=[];
 {const leaves=[trunk];
  while(leaves.length<LEAVES){
   let pick=0,best=-1;
   for(let i=0;i<leaves.length;i++){const c=leaves[i];
    // Always split the biggest: that keeps cells near-square and makes the
    // count climb one at a time. The jitter only separates equal areas.
    const area=c.w*c.h*(1+.12*hash(c.x,c.y));
    if(area>best){best=area;pick=i}}
   const parent=leaves.splice(pick,1)[0],wide=parent.w>=parent.h,half=wide?parent.w/2:parent.h/2;
   const a=wide?cell(parent.x,parent.y,half,parent.h,parent):cell(parent.x,parent.y,parent.w,half,parent);
   const b=wide?cell(parent.x+half,parent.y,half,parent.h,parent):cell(parent.x,parent.y+half,parent.w,half,parent);
   parent.kids=[a,b];branches.push(parent);leaves.push(a,b)}
  branches.forEach((c,i)=>{c.at=.92*(i+1)/branches.length})}

 let photo=null,measured=false;
 const apply=(c,s)=>{const n=s.n||1;c.r=s.r/n;c.g=s.g/n;c.b=s.b/n;
  // Luminance variance: how much is going on inside this cell.
  c.detail=Math.max(0,s.q/n-(s.l/n)*(s.l/n))};
 function gather(c){let s;
  if(c.kids){const a=gather(c.kids[0]),b=gather(c.kids[1]);
   s={n:a.n+b.n,r:a.r+b.r,g:a.g+b.g,b:a.b+b.b,l:a.l+b.l,q:a.q+b.q}}
  else{s={n:0,r:0,g:0,b:0,l:0,q:0};
   const data=gather.data,x0=Math.round(c.x*SAMPLE),y0=Math.round(c.y*SAMPLE);
   const x1=Math.max(x0+1,Math.round((c.x+c.w)*SAMPLE)),y1=Math.max(y0+1,Math.round((c.y+c.h)*SAMPLE));
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*SAMPLE+x)*4;
    const r=data[i],g=data[i+1],b=data[i+2],l=.299*r+.587*g+.114*b;
    s.n++;s.r+=r;s.g+=g;s.b+=b;s.l+=l;s.q+=l*l}}
  apply(c,s);return s}

 // Reuse the same time slots and only change the order, so busy areas resolve
 // first while the pacing stays exactly as built. A cell can never be dealt a
 // slot before its parent's.
 function order(){const slots=branches.map(c=>c.at).sort((a,b)=>a-b);
  const queue=branches.filter(c=>!c.parent);let next=0;
  while(queue.length&&next<slots.length){let pick=0;
   for(let i=1;i<queue.length;i++)if(queue[i].detail>queue[pick].detail)pick=i;
   const c=queue.splice(pick,1)[0];c.at=slots[next++];
   for(const kid of c.kids||[])if(kid.kids)queue.push(kid)}}

 function cover(img){const s=Math.max(SIZE/img.naturalWidth,SIZE/img.naturalHeight);
  const w=img.naturalWidth*s,h=img.naturalHeight*s;return [(SIZE-w)/2,(SIZE-h)/2,w,h]}

 function paint(split){ctx.clearRect(0,0,SIZE,SIZE);
  const tint=measured?smooth(.04,.5,split):0;
  const soft=1-smooth(.34,.74,split),gutter=1.6*soft;
  const shade=(tone,target)=>Math.round(mix(226+tone*14,target,tint));
  const rounded=soft>.01&&typeof ctx.roundRect==='function';
  const block=p=>{
   // Snap to whole pixels so neighbours stay flush and no seam shows.
   const x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.x+p.w)-x,h=Math.round(p.y+p.h)-y;
   const l=x<=0?0:gutter,t=y<=0?0:gutter;
   const iw=w-l-(x+w>=SIZE?0:gutter),ih=h-t-(y+h>=SIZE?0:gutter);
   if(iw<=0||ih<=0)return;
   ctx.fillStyle='rgb('+shade(p.tone,p.r)+','+shade(p.tone,p.g)+','+shade(p.tone,p.b)+')';
   const radius=Math.min(iw,ih)*.16*soft;
   if(rounded&&radius>.4){ctx.beginPath();ctx.roundRect(x+l,y+t,iw,ih,radius);ctx.fill()}
   else ctx.fillRect(x+l,y+t,iw,ih)};
  const walk=(c,p)=>{
   if(!c.kids||split<c.at){block(p);return}
   // Children start on the parent's rectangle and separate into their own.
   const t=ease(clamp01((split-c.at)/MORPH));
   for(const kid of c.kids)walk(kid,{x:mix(p.x,kid.x*SIZE,t),y:mix(p.y,kid.y*SIZE,t),
    w:mix(p.w,kid.w*SIZE,t),h:mix(p.h,kid.h*SIZE,t),r:mix(p.r,kid.r,t),g:mix(p.g,kid.g,t),
    b:mix(p.b,kid.b,t),tone:mix(p.tone,kid.tone,t)})};
  walk(trunk,{x:0,y:0,w:SIZE,h:SIZE,r:trunk.r,g:trunk.g,b:trunk.b,tone:trunk.tone});
  if(photo){const a=smooth(.9,1,split);if(a>.002){ctx.globalAlpha=a;
   // Lay the ground down at the same opacity, or the blocks stay visible
   // through everything the picture leaves transparent.
   ctx.fillStyle='#e7edf3';ctx.fillRect(0,0,SIZE,SIZE);
   ctx.drawImage(photo,...cover(photo));ctx.globalAlpha=1}}}

 let frame=0,startedAt=0;
 function run(){cancelAnimationFrame(frame);
  if(reduced.matches){paint(1);return}
  startedAt=performance.now();
  const step=now=>{const t=clamp01((now-startedAt)/RUN);paint(ease(t));
   if(t<1)frame=requestAnimationFrame(step);else frame=0};
  frame=requestAnimationFrame(step)}

 paint(0);
 const image=new Image();
 image.decoding='async';
 image.onload=()=>{photo=image;
  const buffer=document.createElement('canvas');buffer.width=buffer.height=SAMPLE;
  const bctx=buffer.getContext('2d',{willReadFrequently:true});
  if(bctx){
   // The bear is a transparent PNG: sampled straight, its background
   // averages to black rather than to the canvas it will sit on.
   bctx.fillStyle='#e7edf3';bctx.fillRect(0,0,SAMPLE,SAMPLE);
   bctx.drawImage(image,...cover(image).map(v=>v*SAMPLE/SIZE));
   try{gather.data=bctx.getImageData(0,0,SAMPLE,SAMPLE).data;gather(trunk);order();measured=true}
   catch{/* a cross-origin source leaves the grid grey; the photo still lands */}}
  root.dataset.ready='1';
  if(reduced.matches)paint(1)};
 // Local and same-origin, so the pixels can actually be read back.
 image.src='bear.png';

 root.querySelector('[data-reveal-run]').addEventListener('click',run);
 const watch=new IntersectionObserver(e=>{if(e[0].isIntersecting){watch.disconnect();
  // Wait for the pixels before starting, or the grid would resolve to grey.
  if(root.dataset.ready)run();else image.addEventListener('load',run,{once:true})}},{threshold:.35});
 watch.observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}});
}
const gravity=document.querySelector('#gravity-demo'),grid=document.querySelector('#reveal-demo');
const gravityHTML=gravity.outerHTML,gridHTML=grid.outerHTML;
wireGravity(gravity);wireReveal(grid);
Object.assign(prototypes,{
gravity:{title:'Gravity letters',html:gravityHTML,css:'*{box-sizing:border-box}'+varsFor('--amber','--muted')+cssFor(/^\.gravity/)+'.gravity{position:relative;width:min(90vw,460px);height:300px;border-radius:14px;background:#eef3f8}',js:wireGravity.toString()+";wireGravity(document.querySelector('.gravity'));"},
reveal:{title:'Grid reveal',html:gridHTML,css:'*{box-sizing:border-box}'+varsFor('--line','--muted','--ink')+cssFor(/^\.reveal/),js:wireReveal.toString()+";wireReveal(document.querySelector('.reveal'));"}});
