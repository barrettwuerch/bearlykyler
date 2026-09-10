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
function cssFor(test){const out=[];for(const sheet of document.styleSheets){let rules;try{rules=sheet.cssRules}catch{continue}
 for(const rule of rules){
  if(rule.selectorText&&test.test(rule.selectorText)){out.push(rule.cssText);continue}
  if(rule.name&&test.test(rule.name)){out.push(rule.cssText);continue}
  if(rule.media&&rule.cssRules){const inner=[...rule.cssRules].filter(r=>r.selectorText&&test.test(r.selectorText));
   if(inner.length)out.push('@media '+rule.conditionText+'{'+inner.map(r=>r.cssText).join('')+'}')}
 }}return out.join('')}
Object.assign(prototypes,{
metallic:{title:'Metallic button',html:document.querySelector('#metallic-demo').outerHTML,css:'*{box-sizing:border-box}:root{--paper:#faf9f6;--ink:#292823}'+cssFor(/^\.metallic|^metal-drift$/),js:''},
'action-bar':{title:'Expandable action bar',html:barHTML,css:'*{box-sizing:border-box}:root{--line:#dedbd4;--muted:#77736b;--ink:#292823;--amber:#b77637}'+cssFor(/^\.(action-bar|ab-)/),js:wireActionBar.toString()+";wireActionBar(document.querySelector('.action-bar'));"},
island:{title:'Status island',html:islandHTML,css:'*{box-sizing:border-box}:root{--line:#dedbd4;--muted:#77736b;--ink:#292823}'+cssFor(/^\.island|^island-in$/),js:wireIsland.toString()+";wireIsland(document.querySelector('.island'));"}});

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
magnetic:{title:'Magnetic button',html:magnetHTML,css:'*{box-sizing:border-box}:root{--ink:#292823;--paper:#faf9f6;--amber:#b77637}'+cssFor(/^\.magnetic/),js:wireMagnetic.toString()+";wireMagnetic(document.querySelector('.magnetic'));"},
marquee:{title:'Marquee',html:marqueeHTML,css:'*{box-sizing:border-box}:root{--muted:#77736b;--amber:#b77637}body{display:block!important;padding:40px 0}'+cssFor(/^\.marquee|^marquee-run$/),js:wireMarquee.toString()+";wireMarquee(document.querySelector('.marquee'));"},
counter:{title:'Count up',html:counterHTML,css:'*{box-sizing:border-box}:root{--ink:#292823;--muted:#77736b}'+cssFor(/^\.counter/),js:wireCount.toString()+";wireCount(document.querySelector('.counter'));"}});
