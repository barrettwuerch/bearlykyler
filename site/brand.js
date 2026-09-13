document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('[data-category]').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter)}));
const demo=document.querySelector('#bear-demo');document.querySelector('#play-bear').addEventListener('click',()=>{demo.currentTime=0;demo.play().catch(()=>{})});
const common='body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fcfdfd;font-family:Arial,sans-serif}button{font:inherit;cursor:pointer}button:focus-visible{outline:2px solid #2274ad;outline-offset:5px}@media(prefers-reduced-motion:reduce){*{transition:none!important}}';
const prototypes={};
Object.assign(prototypes,{wave:{title:'Bear wave — original animation',file:'components/bear-wave.html'},'name-tag':{title:'Name tag',file:'components/name-tag.html'},closingdoor:{title:'Closing door',file:'components/closingdoor.html'}});
/* The source sheet's highlighter. These exports take one shape — a single
   HTML document with a style block and a script block — so three modes is
   the whole job, and no library is needed. Tokens are emitted as {cls,text}
   and joined back together unchanged, which is the invariant worth keeping:
   colouring must never lose or double a character of code somebody is about
   to paste. */
const SC_RULES={
 js:[['com',/\/\*[\s\S]*?\*\/|\/\/[^\n]*/y],
  ['str',/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/y],
  ['kw',/\b(?:const|let|var|function|return|if|else|for|while|do|new|class|extends|of|in|typeof|instanceof|await|async|try|catch|finally|throw|break|continue|switch|case|default|this|null|true|false|undefined|void|delete|yield|import|export|from)\b/y],
  ['num',/\b(?:0[xX][\da-fA-F]+|\d*\.?\d+(?:[eE][-+]?\d+)?)\b/y],
  ['fn',/[A-Za-z_$][\w$]*(?=\s*\()/y],
  ['pun',/[{}()[\];,.:?=+\-*/%<>!&|^~]+/y]],
 css:[['com',/\/\*[\s\S]*?\*\//y],
  ['str',/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/y],
  ['at',/@[\w-]+/y],['var',/--[\w-]+/y],
  ['num',/#[\da-fA-F]{3,8}\b|\b\d*\.?\d+(?:px|em|rem|%|vw|vh|vmin|vmax|s|ms|deg|fr|ch)?\b/y],
  ['prop',/[-\w]+(?=\s*:)/y],['sel',/[.#][\w-]+|::?[\w-]+/y],['pun',/[{}();:,>+~*]+/y]],
 html:[['com',/<!--[\s\S]*?-->/y],['tag',/<\/?[A-Za-z][\w-]*|\/?>/y],
  ['str',/'(?:[^'\n])*'|"(?:[^"\n])*"/y],['attr',/[A-Za-z_:][-\w:.]*(?=\s*=)/y],['pun',/=/y]]};
function scScan(src,mode,out){const rules=SC_RULES[mode];let i=0,plain='';
 while(i<src.length){let hit=null;
  for(const [cls,re] of rules){re.lastIndex=i;const m=re.exec(src);
   if(m&&m.index===i&&m[0].length){hit=[cls,m[0]];break}}
  if(hit){if(plain){out.push({cls:'',text:plain});plain=''}
   out.push({cls:hit[0],text:hit[1]});i+=hit[1].length}
  else{plain+=src[i];i+=1}}
 if(plain)out.push({cls:'',text:plain});return out}
function scTokenise(src){const out=[];const re=/<(style|script)\b[^>]*>([\s\S]*?)<\/\1>/gi;
 let last=0,m;
 while((m=re.exec(src))){scScan(src.slice(last,m.index),'html',out);
  const openEnd=m.index+m[0].indexOf('>')+1;
  scScan(src.slice(m.index,openEnd),'html',out);
  scScan(m[2],m[1].toLowerCase()==='style'?'css':'js',out);
  last=m.index+m[0].length;
  scScan(src.slice(openEnd+m[2].length,last),'html',out)}
 scScan(src.slice(last),'html',out);return out}
/* Tokens to lines, splitting any token that spans newlines so the gutter and
   the code can never drift apart. */
function scLines(tokens){const lines=[[]];
 for(const t of tokens){const parts=t.text.split('\n');
  parts.forEach((part,k)=>{if(k)lines.push([]);
   if(part)lines[lines.length-1].push({cls:t.cls,text:part})})}
 return lines}
const scEsc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function scPaint(code,src){
 code.innerHTML=scLines(scTokenise(src)).map(toks=>
  '<span class="sc-row"><span class="sc-n"></span><span class="sc-src">'
  +(toks.map(t=>t.cls?'<span class="sc-'+t.cls+'">'+scEsc(t.text)+'</span>':scEsc(t.text)).join('')||' ')
  +'</span></span>').join('')}
const dialog=document.querySelector('#source-dialog');let selectedCode='',selectedName='';
/* The card actions are icon-only now, so feedback goes to the accessible name
   and a class that swaps the glyph — writing textContent would delete the icon. */
function flag(button,text,done){const was=button.dataset.label||(button.dataset.label=button.getAttribute('aria-label'));
 clearTimeout(button.flagTimer);button.classList.toggle('copied',!!done);
 button.setAttribute('aria-label',text);button.setAttribute('title',text);
 button.flagTimer=setTimeout(()=>{button.classList.remove('copied');
  button.setAttribute('aria-label',was);button.setAttribute('title',was)},1600)}
document.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',async()=>{const item=prototypes[button.dataset.source];selectedName=button.dataset.source;selectedCode='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+item.title+'</title><style>'+common+item.css+'</style></head><body>'+item.html+'<script>'+item.js+'</scr'+'ipt></body></html>';if(item.file){try{const response=await fetch(item.file);if(!response.ok)throw Error();selectedCode=await response.text()}catch{flag(button,'Could not load — retry');return}}if(button.hasAttribute('data-copy-direct')){try{await navigator.clipboard.writeText(selectedCode);flag(button,'Copied',true);return}catch{/* Show selectable source when clipboard access is unavailable. */}}document.querySelector('#source-title').textContent=item.title;const card=button.closest('article.card');const stamp=card&&card.querySelector('.preview-label');document.querySelector('#source-eyebrow').textContent=stamp?stamp.textContent.trim():'SOURCE';document.querySelector('#source-file').textContent=selectedName+'.html';document.querySelector('#source-size').textContent=(new TextEncoder().encode(selectedCode).length/1024).toFixed(1)+' KB';scPaint(document.querySelector('#source-code'),selectedCode);document.querySelector('#source-lines').textContent=document.querySelectorAll('#source-code .sc-row').length+' lines';document.querySelector('#source-slab').scrollTop=0;document.querySelector('#copy-code-label').textContent='Copy code';dialog.showModal()}));
document.querySelector('#close-source').addEventListener('click',()=>dialog.close());
document.querySelector('#copy-code').addEventListener('click',async()=>{const label=document.querySelector('#copy-code-label');try{await navigator.clipboard.writeText(selectedCode);label.textContent='Copied'}catch{label.textContent='Use Download'}clearTimeout(label.scTimer);label.scTimer=setTimeout(()=>{label.textContent='Copy code'},1600)});/* Wrap is on by default: these exports carry lines over a thousand characters
   long, and unwrapped a phone shows about four words of each. */
document.querySelector('#wrap-code').addEventListener('click',e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(on));document.querySelector('#source-slab').classList.toggle('sc-wrap',on)});
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
 // A finger is the pointer on a phone, so the surface it moves across becomes
 // the ring a cursor would have crossed: drag anywhere on the stage and the
 // button leans your way. Tapping holds that lean long enough to read.
 const stage=button.closest('.magnetic-stage')||button.parentElement;
 const TAP_SLOP=10,TAP_TIME=500,TAP_HOLD=380;
 let hold=0,downX=0,downY=0,downAt=0;
 // Same critically-damped spring the card tilt uses, so the two read as one
 // piece of hardware.
 function tick(now){const dt=Math.min((now-(last||now))/1000,.032)||.016;last=now;
  vx+=(190*(tx-x)-26*vx)*dt;vy+=(190*(ty-y)-26*vy)*dt;x+=vx*dt;y+=vy*dt;
  button.style.transform='translate('+x.toFixed(2)+'px,'+y.toFixed(2)+'px)';
  if(label)label.style.transform='translate('+(x*.34).toFixed(2)+'px,'+(y*.34).toFixed(2)+'px)';
  if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.02)raf=requestAnimationFrame(tick);
  else{raf=0;if(!tx&&!ty){button.style.transform='';if(label)label.style.transform=''}}}
 const start=()=>{if(!raf){last=0;raf=requestAnimationFrame(tick)}};
 // Springs home. The hard reset is for reduced motion only: it used to fire on
 // any device that could not hover, which would now snap the button back the
 // instant a finger lifted instead of letting it settle.
 const rest=()=>{clearTimeout(hold);hold=0;tx=ty=0;
  if(reduced.matches){cancelAnimationFrame(raf);raf=0;x=y=vx=vy=0;button.style.transform='';if(label)label.style.transform=''}else start()};
 // The pull itself, shared by cursor and finger. A finger gets a wider reach
 // and a stronger pull than a cursor: it arrives without the approach that
 // makes the effect legible, and it covers the button once it lands.
 const CURSOR={reach:90,factor:.42},FINGER={reach:160,factor:.62};
 const pullToward=(cx,cy,feel)=>{const box=button.getBoundingClientRect(),dx=cx-(box.left+box.width/2),dy=cy-(box.top+box.height/2);
  const distance=Math.hypot(dx,dy),reach=Math.max(box.width,box.height)/2+feel.reach;
  if(distance>reach){if(tx||ty){tx=ty=0;start()}return}
  const pull=1-distance/reach;tx=dx*pull*feel.factor;ty=dy*pull*feel.factor;start()};
 // Tracked from a ring around the button rather than from inside it, so the
 // pull starts before the cursor ever arrives.
 window.addEventListener('pointermove',e=>{if(reduced.matches||!hover.matches||e.pointerType==='touch')return;
  pullToward(e.clientX,e.clientY,CURSOR)});
 if(stage){
  stage.addEventListener('pointerdown',e=>{if(reduced.matches||e.pointerType!=='touch')return;
   clearTimeout(hold);hold=0;downX=e.clientX;downY=e.clientY;downAt=e.timeStamp;pullToward(e.clientX,e.clientY,FINGER)});
  stage.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType!=='touch')return;
   clearTimeout(hold);hold=0;pullToward(e.clientX,e.clientY,FINGER)});
  stage.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')return;
   const still=Math.abs(e.clientX-downX)<=TAP_SLOP&&Math.abs(e.clientY-downY)<=TAP_SLOP;
   // A tap ends the moment it lands, so without the hold the button would be
   // travelling home before it ever arrived.
   if(still&&e.timeStamp-downAt<=TAP_TIME&&!reduced.matches){clearTimeout(hold);hold=setTimeout(rest,TAP_HOLD)}
   else rest()});
  // pointercancel is the browser taking the gesture for a scroll.
  stage.addEventListener('pointercancel',rest);
 }
 // A touch pointer stops existing when the finger lifts, so the document
 // reports it leaving one frame after pointerup — honouring that here cancelled
 // the tap's hold before the button had travelled anywhere. Leaving is a mouse idea.
 document.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')rest()});
 window.addEventListener('blur',rest);
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
magnetic:{title:'Magnetic button',html:'<div class="magnetic-stage">'+magnetHTML+'</div>',css:'*{box-sizing:border-box}'+varsFor('--ink','--paper','--amber')+cssFor(/^\.magnetic/)+'.magnetic-stage{display:grid;place-items:center;width:min(340px,90vw);height:260px}',js:wireMagnetic.toString()+";wireMagnetic(document.querySelector('.magnetic'));"},
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
 ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--amber').trim()||'#2274ad';
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

/* Lean-out folder and gooey nav. Vanilla builds for this site. */
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
// The card sits inside the two-folder switch; the standalone export is one
// folder, so the switch's own bookkeeping does not travel with it.
const folderHTML=folder.outerHTML.replace(' data-pane="lean"','').replace('folder off','folder'),gooHTML=goo.outerHTML;
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

/* Card hover tilt, matrix dot loader and accordion expand, from the
   transitions.dev snippets supplied by the site owner. */
function wireTilt(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const card=root.querySelector('.t-tilt-card'),LIMIT=11;let frame=0,px=0,py=0;
 // A tap is the gesture people try first on a phone, and on a pointer-following
 // card it does nothing: pointerup lands a few frames after pointerdown, so the
 // card twitches and settles. These hold the tap so it plays a deliberate lean.
 const TAP_SLOP=10,TAP_TIME=500,TAP_HOLD=380,TAP_LIMIT=LIMIT*1.6;
 let hold=0,downX=0,downY=0,downAt=0,tapping=false;
 // Read the pointer against the OUTER wrapper, which never transforms — measuring
 // the card while it tilts would feed its own rotation back into the input.
 function apply(limit){frame=0;const box=root.getBoundingClientRect(),L=limit||LIMIT;
  const x=Math.min(Math.max((px-box.left)/box.width,0),1),y=Math.min(Math.max((py-box.top)/box.height,0),1);
  root.style.setProperty('--tilt-ry',((x-.5)*2*L).toFixed(2)+'deg');
  root.style.setProperty('--tilt-rx',((.5-y)*2*L).toFixed(2)+'deg');
  root.style.setProperty('--tilt-gx',(x*100).toFixed(1)+'%');
  root.style.setProperty('--tilt-gy',(y*100).toFixed(1)+'%')}
 function track(e){if(reduced.matches)return;px=e.clientX;py=e.clientY;
  root.classList.add('is-hover');card.classList.add('is-tilting');
  // Wrapped, not passed directly: rAF hands the callback a timestamp, which
  // would land in apply's limit argument and rotate the card by the clock.
  if(!frame)frame=requestAnimationFrame(()=>apply())}
 function rest(){clearTimeout(hold);hold=0;tapping=false;
  cancelAnimationFrame(frame);frame=0;
  root.classList.remove('is-hover');card.classList.remove('is-tilting');
  root.style.setProperty('--tilt-rx','0deg');root.style.setProperty('--tilt-ry','0deg')}
 // Lean further than a drag would, hold, then let the long return ease it back.
 function nudge(){if(reduced.matches)return rest();
  cancelAnimationFrame(frame);frame=0;tapping=true;
  root.classList.add('is-hover');card.classList.add('is-tilting');
  apply(TAP_LIMIT);
  clearTimeout(hold);hold=setTimeout(rest,TAP_HOLD)}
 root.addEventListener('pointermove',e=>{if(tapping)return;track(e)});
 root.addEventListener('pointerdown',e=>{rest();
  downX=e.clientX;downY=e.clientY;downAt=e.timeStamp;
  root.setPointerCapture?.(e.pointerId);track(e)});
 root.addEventListener('pointerup',e=>{
  const still=Math.abs(e.clientX-downX)<=TAP_SLOP&&Math.abs(e.clientY-downY)<=TAP_SLOP;
  if(e.pointerType==='touch'&&still&&e.timeStamp-downAt<=TAP_TIME)nudge();else rest()});
 // A touch pointer ceases to exist at the end of a gesture, so the browser
 // fires pointerleave immediately after pointerup — honouring it here would
 // cancel the tap lean in the same frame it starts. Leaving is a mouse idea.
 root.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')rest()});
 // pointercancel still rests: that is the browser taking the gesture for a scroll.
 root.addEventListener('pointercancel',rest);
 reduced.addEventListener('change',()=>{if(reduced.matches)rest()});
}
function wireMatrix(root){const grid=root.querySelector('.t-matrix');
 const dots=Array.from({length:16},()=>{const i=document.createElement('i');grid.append(i);return i});
 // A variant is just a table of delays into the one shared colour cycle.
 const CYCLE=1200,RING=[1,2,7,11,14,13,8,4],CENTRE=[5,6,9,10],CORNERS=[0,3,12,15];
 const TWINKLE=[7,2,11,5,14,9,0,12,3,15,6,10,13,1,8,4];
 const tables={
  scan:i=>[i%4*CYCLE/10,false],
  twinkle:i=>[TWINKLE.indexOf(i)*CYCLE/16,false],
  orbit:i=>RING.includes(i)?[RING.indexOf(i)*CYCLE/8,false]:[0,true],
  pulse:i=>[CENTRE.includes(i)?0:CYCLE*.16,false]};
 let variant='scan',rounded=false;
 function paint(){const table=tables[variant];
  dots.forEach((dot,i)=>{const [delay,still]=table(i);
   dot.style.setProperty('--d',Math.round(delay));
   dot.classList.toggle('is-still',still);
   dot.classList.toggle('is-gap',rounded&&CORNERS.includes(i))});
  grid.dataset.variant=variant}
 for(const button of root.querySelectorAll('[data-matrix]'))button.addEventListener('click',()=>{
  variant=button.dataset.matrix;
  root.querySelectorAll('[data-matrix]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  paint()});
 const round=root.querySelector('[data-matrix-round]');
 round.addEventListener('click',()=>{rounded=!rounded;round.setAttribute('aria-pressed',String(rounded));paint()});
 paint();
}
function wireAcc(root){const items=[...root.querySelectorAll('.t-acc')];
 const set=(item,open)=>{item.dataset.open=String(open);
  item.querySelector('.t-acc-head').setAttribute('aria-expanded',String(open))};
 for(const item of items)item.querySelector('.t-acc-head').addEventListener('click',()=>{
  const open=item.dataset.open!=='true';
  // One at a time: three open panels are taller than the card preview, and
  // this is what people expect an accordion to do anyway.
  for(const other of items)if(other!==item)set(other,false);
  set(item,open)})}
const tilt=document.querySelector('#tilt-demo'),matrix=document.querySelector('#matrix-demo'),acc=document.querySelector('#acc-demo');
const tiltHTML=tilt.outerHTML,matrixHTML=matrix.outerHTML,accHTML=acc.outerHTML;
wireTilt(tilt);wireMatrix(matrix);wireAcc(acc);
Object.assign(prototypes,{
// The exported file stands alone, so the portrait becomes a plain block rather
// than an <img> pointing at a bear that is not next to it.
tilt:{title:'Card hover tilt',html:tiltHTML.replace(/<img[^>]*>/,'<div class="t-tilt-shim"></div>'),
 css:'*{box-sizing:border-box}'+varsFor('--amber','--muted')+cssFor(/^\.t-tilt/)+'.t-tilt-shim{width:112px;height:112px;margin:0 auto 10px;border-radius:10px;background:#f4f7fa}',
 js:wireTilt.toString()+";wireTilt(document.querySelector('.t-tilt'));"},
matrix:{title:'Matrix dot loader',html:matrixHTML,css:'*{box-sizing:border-box}'+varsFor('--amber','--muted','--ink','--line')+cssFor(/^\.t-matrix|^\.matrix-|^t-matrix-pulse$/),
 js:wireMatrix.toString()+";wireMatrix(document.querySelector('.matrix-demo'));"},
acc:{title:'Accordion expand',html:accHTML,css:'*{box-sizing:border-box}'+varsFor('--amber','--muted','--ink','--line')+cssFor(/^\.t-acc|^\.acc-demo/),
 js:wireAcc.toString()+";wireAcc(document.querySelector('.acc-demo'));"}});

/* ── Mobile affordances ────────────────────────────────────────────────
   Three small host-side controls. None of them reach into the bear player:
   "Surprise me" sets the routine select and clicks the play button the
   player already owns, so the contract in living-bear/player.js is
   untouched. */
(function(){
 const controls=document.querySelector('.living-controls');
 if(controls){
  const choice=controls.querySelector('#living-choice'),play=controls.querySelector('#living-play');
  const surprise=controls.querySelector('#living-surprise');
  // Never repeat the routine already showing — a "surprise" that changes
  // nothing reads as a dead button.
  if(surprise&&choice&&play)surprise.addEventListener('click',()=>{
   const options=[...choice.options].filter(o=>o.value!==choice.value);
   if(!options.length)return play.click();
   choice.value=options[Math.floor(Math.random()*options.length)].value;
   play.click()});
  const toggle=controls.querySelector('#living-more-toggle');
  if(toggle)toggle.addEventListener('click',()=>{
   const open=toggle.getAttribute('aria-expanded')!=='true';
   toggle.setAttribute('aria-expanded',String(open));
   controls.classList.toggle('more-open',open)});
 }
 /* Back to top. The gallery runs nine screens deep on a phone, and the only
    other way up is a long swipe. Shown once the hero is behind you. */
 const toTop=document.querySelector('#to-top');
 if(toTop){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'}));
  let ticking=false;
  const update=()=>{ticking=false;toTop.hidden=scrollY<innerHeight};
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
  update();
 }
})();

/* ── Thinking orbs ─────────────────────────────────────────────────────
   Technique from the thinking orbs on libraries.dev, reimplemented in
   vanilla here. Points are laid out once on a unit sphere, then spun and
   flattened every frame; depth drives both radius and alpha, which is the
   whole of the 3D read — there is no perspective divide, and no second
   render path per variant. The character of each of the five comes from
   where its points sit, nothing else. */
function wireOrbs(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const INK='#59677b',ACCENT='#e0a92b';
 // The golden angle keeps successive points from ever lining up, so an even
 // cover of the sphere needs no relaxation pass.
 const fib=(n,fn)=>{const out=[],GOLD=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<n;i++){const y=1-(i/(n-1))*2,r=Math.sqrt(Math.max(0,1-y*y)),th=i*GOLD;
   out.push(Object.assign({x:Math.cos(th)*r,y:y,z:Math.sin(th)*r,r:1,size:1},fn?fn(i):null))}
  return out};
 const VARIANTS={
  solving:{name:'Solving',spin:.55,
   points:()=>fib(96,i=>({size:1.05+(i%3)*.35,seed:i*1.37})),
   breathe:(p,t)=>1+.09*Math.sin(t*1.6+p.seed)},
  thinking:{name:'Thinking',spin:.9,
   points(){const out=[],LINES=18,PER=16;
    for(let l=0;l<LINES;l++){const th=l/LINES*Math.PI*2;
     for(let k=0;k<PER;k++){const phi=(k+.5)/PER*Math.PI,y=Math.cos(phi),r=Math.sin(phi);
      // Tapered toward the poles: at full size the topmost latitude of all
      // eighteen meridians lands on one tight circle and reads as a ring
      // rather than a convergence.
      out.push({x:Math.cos(th)*r,y:y,z:Math.sin(th)*r,r:1,size:.95*(.3+.7*Math.sin(phi))})}}
    return out}},
  listening:{name:'Bear listening',spin:.42,
   points:()=>fib(260,()=>({size:.62})),
   breathe:(p,t)=>1+.05*Math.sin(t*2.4+p.y*3)},
  working:{name:'Working',spin:.7,
   points(){const out=fib(58,i=>({size:1.1,seed:i*.9}));
    for(let k=0;k<26;k++){const phi=k/26*Math.PI*2;
     out.push({x:Math.cos(phi),y:0,z:Math.sin(phi),r:1,size:1.9,hot:true,arc:k/26})}
    return out},
   breathe:(p,t)=>p.hot?1:1+.07*Math.sin(t*1.9+(p.seed||0)),
   fade:(p,t)=>p.hot?Math.max(0,1-((t*.45-p.arc+1)%1)*2.4):1},
  searching:{name:'Searching',spin:1.05,
   points(){const out=[],RINGS=11;
    for(let ri=0;ri<RINGS;ri++){const phi=(ri+.5)/RINGS*Math.PI,y=Math.cos(phi),r=Math.sin(phi);
     const count=Math.max(6,Math.round(28*r));
     for(let k=0;k<count;k++){const th=k/count*Math.PI*2+ri*.4;
      out.push({x:Math.cos(th)*r,y:y,z:Math.sin(th)*r,r:1,size:.8})}}
    return out}}};

 const canvas=root.querySelector('.orbs-canvas'),ctx=canvas.getContext('2d');
 const label=root.querySelector('.orbs-label'),dots=root.querySelector('.orbs-dots');
 const live=root.querySelector('.orbs-live'),buttons=[...root.querySelectorAll('[data-orbs]')];
 const size=canvas.width,dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=canvas.height=Math.round(size*dpr);
 canvas.style.width=canvas.style.height=size+'px';
 ctx.scale(canvas.width/size,canvas.height/size);
 const mid=size/2,R=size*.38,TILT=-.42,ct=Math.cos(TILT),st=Math.sin(TILT);

 let key='solving',pts=VARIANTS[key].points(),t=0,last=0,frame=0,inView=false,step=0,tick2=0;
 function draw(){const v=VARIANTS[key];
  ctx.clearRect(0,0,size,size);
  const a=t*v.spin,cs=Math.cos(a),sn=Math.sin(a);
  for(const p of pts){
   const rr=p.r*(v.breathe?v.breathe(p,t):1);
   const px=p.x*rr,py=p.y*rr,pz=p.z*rr;
   const X=px*cs-pz*sn,Zr=px*sn+pz*cs;
   const Y=py*ct-Zr*st,Z=py*st+Zr*ct;
   const depth=(Z+1)/2,f=v.fade?v.fade(p,t):1;
   if(f<=0)continue;
   ctx.globalAlpha=Math.max(0,Math.min(1,(.12+.88*depth)*(p.hot?1:.85)*f));
   ctx.fillStyle=p.hot?ACCENT:INK;
   ctx.beginPath();ctx.arc(mid+X*R,mid+Y*R,Math.max(.35,p.size*(.3+.7*depth)),0,6.284);ctx.fill()}
  ctx.globalAlpha=1}
 function loop(now){const dt=Math.min(.05,(now-(last||now))/1000);last=now;t+=dt;draw();
  frame=requestAnimationFrame(loop)}
 // Off-screen the loop stops entirely: a spinning canvas should cost nothing
 // while the rest of the page is being read.
 function sync(){const on=inView&&!document.hidden&&!reduced.matches;
  if(on&&!frame){last=0;frame=requestAnimationFrame(loop)}
  else if(!on){cancelAnimationFrame(frame);frame=0;last=0}
  if(dots)clearInterval(tick2);
  if(on&&dots)tick2=setInterval(()=>{step=(step+1)%4;dots.textContent='.'.repeat(step+1)},420)}
 function select(next){if(!VARIANTS[next])return;
  key=next;pts=VARIANTS[key].points();t=0;
  label.textContent=VARIANTS[key].name;
  if(live)live.textContent=VARIANTS[key].name;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.orbs===key));
  draw()}
 for(const b of buttons)b.addEventListener('click',()=>select(b.dataset.orbs));
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(root);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();draw()});
 // A still frame first, so reduced motion still shows the shape.
 draw();
 return{select}
}
const orbsCard=document.querySelector('#orbs-demo');
if(orbsCard){const orbsHTML=orbsCard.outerHTML;
 wireOrbs(orbsCard);
 Object.assign(prototypes,{orbs:{title:'Thinking orbs',html:orbsHTML,
  css:'*{box-sizing:border-box}'+varsFor('--ink','--muted','--line','--paper')+cssFor(/^\.orbs/),
  // toString() starts at "function", so the provenance comment above it never
  // reaches the downloaded file. Carry it into the export explicitly.
  js:'/* Thinking orbs. Technique from the thinking orbs on libraries.dev,\n'
   +'   reimplemented in vanilla: points laid out once on a unit sphere, then\n'
   +'   spun and flattened each frame, with depth driving radius and alpha. */\n'
   +wireOrbs.toString()+";wireOrbs(document.querySelector('.orbs'));"}});
}

/* ── Staff badge ───────────────────────────────────────────────────────
   Mechanics from the ID card recording supplied by the site owner,
   reimplemented in vanilla. Three transforms that never touch each
   other's axis: the scene holds the perspective, the hanger swings on a
   pendulum about the lanyard slot, and the sleeve tilts toward the
   pointer. Hovering tilts, grabbing swings — they never run at once, so
   neither can stamp on the other's transform. */
function wireBadge(scene){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const hanger=scene.querySelector('.badge-hanger'),sleeve=scene.querySelector('.badge-sleeve');
 const TILT=9;
 // zeta ~0.23: two or three overshoots, done inside two seconds. Lighter than
 // that and a released badge is still swinging long after you looked away.
 const K=58,C=3.5,SWAY=.55;
 let angle=0,vel=0,target=null,frame=0,last=0,clock=0;
 let dragging=false,anchorX=0,anchorY=0,inView=false,downX=0,travel=0,limit=26;

 // The card preview clips, so the swing may not exceed the room it has. A swung
 // badge grows downward as well as sideways, so all four corners are tested
 // against the box, not just its width. Measured square: reading the rects while
 // the hanger is already rotated would compound the angle into the answer.
 function measure(){const box=scene.parentElement;if(!box)return;
  const was=hanger.style.getPropertyValue('--swing');
  hanger.style.setProperty('--swing','0deg');
  const P=box.getBoundingClientRect(),s=sleeve.getBoundingClientRect(),h=hanger.getBoundingClientRect();
  const px=h.left+h.width/2,py=h.top,half=s.width/2,top=s.top-py,bot=s.bottom-py;
  const fits=deg=>{const r=deg*Math.PI/180,c=Math.cos(r),sn=Math.sin(r);
   for(const p of [[-half,top],[half,top],[-half,bot],[half,bot]]){
    const X=px+p[0]*c-p[1]*sn,Y=py+p[0]*sn+p[1]*c;
    if(X<P.left+2||X>P.right-2||Y<P.top+2||Y>P.bottom-2)return false}
   return true};
  let lo=0,hi=26;
  if(fits(26)&&fits(-26))lo=26;
  else for(let i=0;i<16;i++){const mid=(lo+hi)/2;(fits(mid)&&fits(-mid))?lo=mid:hi=mid}
  limit=Math.max(4,lo);
  hanger.style.setProperty('--swing',was||'0deg')}

 const paint=()=>hanger.style.setProperty('--swing',angle.toFixed(3)+'deg');
 function step(now){const dt=Math.min(.033,(now-(last||now))/1000);last=now;clock+=dt;
  if(dragging&&target!==null){angle+=(target-angle)*Math.min(1,dt*14);vel=0}
  else{const rest=reduced.matches?0:Math.sin(clock*1.15)*SWAY;
   vel+=(-K*(angle-rest)-C*vel)*dt;angle+=vel*dt}
  paint();
  if((dragging||Math.abs(vel)>.02||Math.abs(angle)>.02)&&inView&&!reduced.matches)
   frame=requestAnimationFrame(step);
  else{frame=0;last=0}}
 const run=()=>{if(!frame&&inView&&!reduced.matches){last=0;frame=requestAnimationFrame(step)}};
 const halt=()=>{cancelAnimationFrame(frame);frame=0;last=0};

 function tiltTo(e){if(reduced.matches||dragging)return;
  const b=sleeve.getBoundingClientRect();
  const x=Math.min(Math.max((e.clientX-b.left)/b.width,0),1);
  const y=Math.min(Math.max((e.clientY-b.top)/b.height,0),1);
  scene.classList.add('is-live');
  sleeve.style.setProperty('--ry',((x-.5)*2*TILT).toFixed(2)+'deg');
  sleeve.style.setProperty('--rx',((.5-y)*2*TILT).toFixed(2)+'deg');
  sleeve.style.setProperty('--gx',(x*100).toFixed(1)+'%');
  sleeve.style.setProperty('--gy',(y*100).toFixed(1)+'%')}
 const flat=()=>{scene.classList.remove('is-live');
  sleeve.style.setProperty('--rx','0deg');sleeve.style.setProperty('--ry','0deg')};

 function angleFor(e){const dx=e.clientX-anchorX,dy=Math.max(24,e.clientY-anchorY);
  // Negated: a positive rotate about a top origin swings the hanging end left,
  // so the raw angle would send the badge away from the pointer.
  const deg=-Math.atan2(dx,dy)*180/Math.PI;
  return Math.max(-limit,Math.min(limit,deg))}

 sleeve.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')tiltTo(e)});
 // A touch pointer stops existing when the finger lifts, so the browser reports
 // it leaving right after pointerup. Leaving is a mouse idea.
 sleeve.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')flat()});
 sleeve.addEventListener('pointerdown',e=>{if(reduced.matches)return;
  measure();
  const h=hanger.getBoundingClientRect();anchorX=h.left+h.width/2;anchorY=h.top;
  dragging=true;downX=e.clientX;travel=0;scene.classList.add('is-drag');flat();
  sleeve.setPointerCapture&&sleeve.setPointerCapture(e.pointerId);
  target=angleFor(e);run()});
 sleeve.addEventListener('pointermove',e=>{if(!dragging)return;
  travel=Math.max(travel,Math.abs(e.clientX-downX));target=angleFor(e)});
 function release(){if(!dragging)return;
  dragging=false;target=null;scene.classList.remove('is-drag');
  // Hand the spring a little of the angle as speed, so a flick throws it.
  vel=angle*-1.6;run()}
 for(const t of ['pointerup','pointercancel','lostpointercapture'])sleeve.addEventListener(t,release);
 // Pointer capture does not cross browsing contexts, and a release past the edge
 // of the page never arrives as pointerup here. These are the other ways out.
 addEventListener('pointerup',release,true);
 addEventListener('pointercancel',release,true);
 addEventListener('blur',release);
 addEventListener('pointermove',e=>{
  if(dragging&&e.pointerType!=='touch'&&e.buttons===0)release()},true);

 // A tap is the gesture people try first on a phone, and a drag handler alone
 // ignores it. Push it toward the side that was touched.
 sleeve.addEventListener('click',e=>{
  if(reduced.matches||travel>6||Math.abs(vel)>6)return;
  measure();const h=hanger.getBoundingClientRect();
  vel+=(e.clientX<h.left+h.width/2?1:-1)*46;run()});
 sleeve.addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  e.preventDefault();vel+=(e.key==='ArrowLeft'?1:-1)*46;run()});

 new IntersectionObserver(es=>{inView=es[0].isIntersecting;if(inView){measure();run()}else halt()}).observe(scene);
 new ResizeObserver(measure).observe(scene);
 document.addEventListener('visibilitychange',()=>{document.hidden?halt():run()});
 reduced.addEventListener('change',()=>{if(reduced.matches){angle=0;vel=0;paint();flat();halt()}else run()});
 measure();paint();
}
const badgeCard=document.querySelector('#badge-demo');
if(badgeCard){const badgeHTML=badgeCard.outerHTML;
 wireBadge(badgeCard);
 Object.assign(prototypes,{badge:{title:'Staff badge',
  html:'<div class="badge-stage">'+badgeHTML+'</div>',
  css:'*{box-sizing:border-box}'+varsFor('--ink','--muted','--paper','--line','--honey','--blue-ink')
   +cssFor(/^\.badge-|^\.cord|^\.clip|^\.slot|^\.sheen|^\.stock|^\.crest|^\.idrow|^\.photo|^\.facts|^\.stamp|^\.fact|^\.nameplate|^\.sig|^\.meta|^\.footer-tape/)
   +'.badge-stage{display:grid;place-items:center;width:min(460px,92vw);padding:20px 0 40px}'
   +'.badge-scene{--bw:300px;--drop:86px}',
  // toString() starts at "function", so the provenance comment above it never
  // reaches the downloaded file. Carry it explicitly.
  js:'/* Staff badge. Mechanics reimplemented in vanilla from an ID card\n'
   +'   reference: a perspective scene, a pendulum hanger, and a sleeve that\n'
   +'   tilts toward the pointer. */\n'
   +wireBadge.toString()+";wireBadge(document.querySelector('.badge-scene'));"}});
}

/* ── Gatefold folder ───────────────────────────────────────────────────
   Mechanic reimplemented in vanilla from a gatefold folder recording
   supplied by the site owner. A disclosure that happens to be a folder:
   the cover splits and swings outward on two hinges, the document rises
   from a pocket that sits genuinely in front of it in 3D, and opening the
   document hands off to a sheet at reading width. Expanding a 300px card
   only ever produces a 320px card, so it does not try. */
function wireGatefold(scene){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const gf=scene.querySelector('.gf');
 const openBtn=gf.querySelector('.gf-open-btn'),closeBtn=gf.querySelector('.gf-close');
 const doc=gf.querySelector('.gf-doc'),slot=gf.querySelector('.gf-slot');
 const reader=scene.querySelector('.gf-reader'),back=reader.querySelector('.gf-return');
 const label=gf.dataset.label||'Folder';
 // In the gallery the card's own number sits exactly where the sheet's header
 // lands, and the two overlapped. The number is card chrome; while a document
 // is open it gets out of the way. Absent outside the gallery, hence the guard.
 const cardPreview=scene.closest('.preview');
 let state='shut',timer=0;

 function apply(){const reading=state==='reading',shut=state==='shut';
  gf.classList.toggle('is-open',!shut);
  gf.classList.toggle('is-wide',reading);
  scene.classList.toggle('is-reading',reading);
  if(cardPreview)cardPreview.classList.toggle('gf-reading',reading);
  openBtn.setAttribute('aria-expanded',String(!shut));
  doc.setAttribute('aria-expanded',String(reading));
  // Closed means closed: out of the tab order and out of the accessibility
  // tree, not merely invisible. The same holds for the sheet while it is down.
  slot.setAttribute('aria-hidden',shut?'true':'false');
  if('inert' in slot)slot.inert=shut; else doc.tabIndex=shut?-1:0;
  clearTimeout(timer);
  if(reading){reader.hidden=false;if('inert' in reader)reader.inert=false}
  else{if('inert' in reader)reader.inert=true;
   if(reduced.matches)reader.hidden=true;
   else timer=setTimeout(()=>{if(state!=='reading')reader.hidden=true},420)}}

 function go(next,focusEl){
  // Measured, not guessed: the sheet's height comes from its own content, so
  // the scene asks it before growing rather than letting it spill downward.
  if(next==='reading'){reader.hidden=false;
   const h=reader.querySelector('.gf-sheet-doc').offsetHeight;
   scene.style.setProperty('--gf-box',(h+8)+'px')}
  state=next;apply();
  if(focusEl)requestAnimationFrame(()=>{
   if(focusEl.offsetParent!==null||focusEl===back)focusEl.focus()})}

 openBtn.addEventListener('click',()=>go('open',doc));
 doc.addEventListener('click',()=>go('reading',back));
 closeBtn.addEventListener('click',()=>go('shut',openBtn));
 back.addEventListener('click',()=>go('open',doc));
 scene.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||state==='shut')return;
  e.stopPropagation();
  go(state==='reading'?'open':'shut',state==='reading'?doc:openBtn)});

 const count=gf.querySelectorAll('.gf-doc').length;
 const sr=openBtn.querySelector('.gf-sr');
 if(sr)sr.textContent='Open '+label+', '+count+' document'+(count===1?'':'s');
 const cover=gf.querySelector('.gf-title');
 if(cover){const b=cover.querySelector('b'),n=cover.querySelector('span');
  if(b)b.textContent=label;
  if(n)n.textContent=String(count).padStart(2,'0')+' DOCUMENT'+(count===1?'':'S')}
 // No auto-close on leaving the viewport: opening the sheet grows the scene,
 // and the reflow that follows reads as the folder leaving the screen, so it
 // shut itself the instant it opened. The visible controls are the way out.
 apply();
 return{get state(){return state},close(){go('shut')}}
}
/* One square, two folders. The card's source buttons follow the choice, so
   "view source" always hands over the folder you are actually looking at. */
function wireSwap(root,onLeave){const SOURCE={gatefold:'gatefold',lean:'folder'};
 const picks=[...root.querySelectorAll('.swap-switch button')];
 const panes=new Map(picks.map(b=>[b.dataset.pick,root.querySelector('[data-pane="'+b.dataset.pick+'"]')]));
 const actions=[...(root.closest('.card')||root).querySelectorAll('.card-actions [data-source]')];
 let current='';
 const select=key=>{if(key===current)return;
  // Switching away from an open folder leaves it open behind the one you
  // asked for; it is put away without taking the focus off the switch.
  if(current&&onLeave)onLeave(current);
  current=key;
  picks.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pick===key)));
  panes.forEach((el,k)=>{const on=k===key;el.classList.toggle('off',!on);
   if('inert' in el)el.inert=!on});
  actions.forEach(b=>{if(SOURCE[key])b.dataset.source=SOURCE[key]})};
 picks.forEach(b=>b.addEventListener('click',()=>select(b.dataset.pick)));
 const first=picks.find(b=>b.getAttribute('aria-pressed')==='true')||picks[0];
 select(first.dataset.pick);
}
const gatefoldCard=document.querySelector('#gatefold');
if(gatefoldCard){const gatefoldHTML=gatefoldCard.outerHTML.replace(' data-pane="gatefold"','').replace('gf-scene off','gf-scene');
 const gfHandle=wireGatefold(gatefoldCard);
 const swap=document.querySelector('#folders');
 if(swap)wireSwap(swap,from=>{if(from==='gatefold')gfHandle.close();else folder.classList.remove('open')});
 Object.assign(prototypes,{gatefold:{title:'Gatefold folder',
  html:'<div class="gf-stage">'+gatefoldHTML+'</div>',
  css:'*{box-sizing:border-box}'+varsFor('--ink','--paper','--muted','--honey','--line')
   +cssFor(/^\.gf-|^\.gf\b|^\.gf\./)
   +'.gf-stage{display:grid;place-items:center;padding:30px 0 50px}'
   +'.gf-scene{--gf-w:300px;--gf-h:300px}',
  js:'/* Gatefold folder. Mechanic reimplemented in vanilla from a gatefold\n'
   +'   folder reference: two flaps hinged on their outer edges, a pocket that\n'
   +'   sits in front of the document in 3D, and a sheet at reading width. */\n'
   +wireGatefold.toString()+";wireGatefold(document.querySelector('.gf-scene'));"}});
}

/* ── Rain ───────────────────────────────────────────────────────────────
   Technique from a p5 rain sketch supplied by the site owner, reimplemented
   in vanilla. The idea it is built on: one drop accelerates down to a point
   on a ground plane and hands off to a short stack of rings.

   Two things are done differently, both because the sketch counts frames.
   Timers here run on elapsed seconds, so a 120Hz screen shows the same
   weather as a 60Hz one rather than twice as much of it; and the rings are
   spawned on impact instead of being created up front with a negative timer,
   which is the same thing with none of the bookkeeping. */
function wireRain(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // The site's own colours rather than the sketch's carnival, weighted so that
 // honey stays an accent instead of being a seventh of the weather.
 const COLOURS=['#48a8ee','#48a8ee','#48a8ee','#3e92d0','#3e92d0','#e6f5ff','#fcfdfd','#ffc33d'];
 const RATE=27,CAP=420,FALL=1.05,RING_LIFE=.8,RINGS=4,RING_GAP=.075;

 const canvas=root.querySelector('.rain-canvas'),ctx=canvas.getContext('2d');
 let w=0,h=0,S=1,drops=[],rings=[],last=0,frame=0,inView=false,carry=0;
 // One seam for randomness, so the still frame can be produced by running the
 // real simulation on a seeded stream instead of being posed by hand.
 let rand=Math.random;
 const rnd=(a,b)=>a+rand()*(b-a);
 const pick=()=>COLOURS[(rand()*COLOURS.length)|0];

 // One ground plane for the whole scene: how far down the panel a drop lands
 // is how near it is, and near things are bigger and less foreshortened. The
 // sketch scales size by depth; carrying the same number into the ring's
 // squash is what keeps the floor reading as one surface.
 function burst(x,y,col){
  const d=Math.max(0,Math.min(1,y/h)),size=(.07+.23*d)*h;
  drops.push({x,y,d,size,col:col||pick(),t:0,life:FALL*rnd(.88,1.12)})}

 function land(drop){
  for(let i=0;i<RINGS;i++)
   rings.push({x:drop.x,y:drop.y,d:drop.d,col:drop.col,t:-i*RING_GAP,
    life:RING_LIFE*rnd(.85,1.15),max:drop.size*rnd(.9,1.15),weight:drop.size*.035})}

 function step(dt){
  // Rain per square, not rain per second: the panel is half the area on a
  // phone, and a fixed spawn rate turned that into a downpour.
  carry+=dt*RATE*Math.min(1.25,(w*h)/114000);
  while(carry>=1){carry-=1;
   if(drops.length+rings.length<CAP)burst(rnd(0,w),rnd(h*.12,h))}
  for(let i=drops.length-1;i>=0;i--){const o=drops[i];o.t+=dt;
   if(o.t>=o.life){land(o);drops.splice(i,1)}}
  for(let i=rings.length-1;i>=0;i--){const o=rings[i];o.t+=dt;
   if(o.t>=o.life)rings.splice(i,1)}}

 function drawDrop(o){
  const p=Math.max(0,Math.min(1,o.t/o.life));
  // Squared, so it is still gathering speed when it hits — and the streak is
  // stretched by that speed rather than by a constant, so the drop looks like
  // it is falling instead of sliding.
  const y=(o.y-h)+h*p*p,stretch=1+1.6*p;
  ctx.fillStyle=o.col;ctx.globalAlpha=.94;
  ctx.beginPath();
  ctx.ellipse(o.x,y,o.size*.034,o.size*.1*stretch,0,0,6.2832);
  ctx.fill()}

 function drawRing(o){
  if(o.t<0)return;
  const p=Math.max(0,Math.min(1,o.t/o.life)),e=Math.sqrt(p);
  // The ring keeps its weight and its colour most of the way out and then
  // goes, rather than thinning linearly: a stroke carried to nothing spends
  // its last third as a grey smudge on the dark, which reads as dirt.
  const r=o.max*e/2,weight=o.weight*(1-p*p);
  if(weight<=.35)return;
  ctx.strokeStyle=o.col;ctx.globalAlpha=Math.max(0,1-p*p*p);ctx.lineWidth=weight;
  ctx.beginPath();
  ctx.ellipse(o.x,o.y,r,r*(.16+.2*o.d),0,0,6.2832);
  ctx.stroke()}

 function draw(){
  ctx.clearRect(0,0,w,h);
  for(const o of rings)drawRing(o);
  for(const o of drops)drawDrop(o);
  ctx.globalAlpha=1}

 // Something to look at when the loop never runs. Two and a bit seconds of the
 // real simulation on a fixed seed, rather than a tableau posed by hand: the
 // frame is then honestly a frame of this weather, and the same one every time.
 function still(){
  drops=[];rings=[];carry=0;
  let seed=20260911;
  rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<136;i++)step(1/60);
  rand=Math.random;
  draw()}

 // A cold start is a second of empty sky, because the first drop has a second
 // of falling to do. Opening mid-weather costs eighty simulated frames and no
 // allocation the loop would not have made a moment later anyway.
 function prime(){if(drops.length+rings.length)return;
  for(let i=0;i<84;i++)step(1/60)}

 function loop(now){const dt=Math.min(.05,(now-(last||now))/1000);last=now;
  step(dt);draw();frame=requestAnimationFrame(loop)}

 function sync(){const on=inView&&!document.hidden&&!reduced.matches&&w>0;
  if(on&&!frame){last=0;prime();draw();frame=requestAnimationFrame(loop)}
  else if(!on){cancelAnimationFrame(frame);frame=0;last=0;
   if(reduced.matches&&w>0)still()}}

 function size(){const r=root.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const dpr=Math.min(devicePixelRatio||1,2);
  w=r.width;h=r.height;S=h/226;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=w+'px';canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(reduced.matches)still();else{prime();draw()}}

 // Placing one by hand is the whole reason this is a control and not a
 // picture.
 function place(x,y){
  burst(x,Math.max(h*.12,Math.min(h,y)));
  // With motion off there is no fall to watch, and a drop spends frame zero
  // above the top edge — so it lands at once and leaves its rings instead. A
  // press has to produce something either way.
  if(!reduced.matches)return;
  land(drops.pop());
  const fresh=rings.slice(-RINGS);
  fresh.forEach((r,i)=>{r.t=r.life*(.5-i*.11)});
  draw()}
 root.addEventListener('pointerdown',e=>{const r=root.getBoundingClientRect();
  place(e.clientX-r.left,e.clientY-r.top)});
 // A keyboard press has no pointer, so it lands somewhere in the near middle.
 root.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  e.preventDefault();place(w*rnd(.25,.75),h*rnd(.45,.9))});

 new ResizeObserver(size).observe(root);
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(root);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();if(reduced.matches)still()});
 size();sync();
 return{place,get count(){return drops.length+rings.length}}
}
const rainCard=document.querySelector('#rain-demo');
if(rainCard){const rainHTML=rainCard.outerHTML;
 wireRain(rainCard);
 Object.assign(prototypes,{rain:{title:'Rain',html:rainHTML,
  // The panel is pinned to its card on the site, so the standalone copy has to
  // let the insets go — left on, it positions itself against the viewport.
  css:'*{box-sizing:border-box}'+cssFor(/^\.rain/)
   +'.rain{position:relative;inset:auto;width:min(560px,90vw);height:320px;margin:0}',
  js:'/* Rain. Technique from a p5 rain sketch supplied by the site owner,\n'
   +'   reimplemented in vanilla: a drop accelerates down to a point on a\n'
   +'   ground plane and hands off to a short stack of rings that chase each\n'
   +'   other out. Timers run on elapsed seconds rather than frame counts, so\n'
   +'   a 120Hz screen shows the same weather as a 60Hz one. */\n'
   +wireRain.toString()+";wireRain(document.querySelector('.rain'));"}});
}

/* ── Point cloud ────────────────────────────────────────────────────────
   Technique from a p5 sketch supplied by the site owner, reimplemented in
   vanilla. The sketch's own trick is kept intact and it is a good one: using
   a point's index as an angle, cos(i*i) picks a latitude and sin(i*i) the
   radius of that latitude's circle, so thousands of points land spread over a
   sphere with no random numbers and nothing stored per point.

   What is done differently is all arithmetic:

   - The sketch recomputes sin(i*i) and cos(i*i) for every point on every
     frame, roughly a million calls a second to produce numbers that never
     change. They are computed once here, and the frame's rotation comes out of
     the angle-sum identity, so the inner loop has no trig in it at all.
   - The sketch's timers are frames: it spins by 0.01 and damps by 0.9 per
     frame, so a 120Hz screen spins twice as fast and settles differently. The
     physics runs on a fixed 60Hz step here, whatever the display does.
   - Mouse only means no repulsion on a phone, and the sketch's user-agent
     sniff is the thing that breaks on the next tablet. Pointer events cover
     both without asking what the device is. */
function wireCloud(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const SPRING=.01,DAMP=.9,PUSH=28,SPIN=.01,STEP=1/60;
 // Grain, not a count. The sketch puts the same eight thousand points in a
 // 360px phone canvas as in a 900px desktop one, which is the difference
 // between a cloud and a solid disc. Points spread over the sphere, so the
 // number follows the sphere's area — its radius squared — and the density
 // the site owner chose on a 340px panel holds at every size.
 const AT=6800,FOR=340;
 const canvas=root.querySelector('.cloud-canvas'),ctx=canvas.getContext('2d');

 let w=0,h=0,dpr=1,n=0,R=0,reach=0,dot=2;
 let px,py,vx,vy,sinP,cosP,amp,homeY;
 let angle=0,acc=0,last=0,frame=0,inView=false,touching=false;
 let mx=1e9,my=1e9;

 function build(){
  const span=Math.min(w,h);
  n=Math.max(900,Math.min(9000,Math.round(AT*(span/FOR)*(span/FOR))));
  px=new Float32Array(n);py=new Float32Array(n);vx=new Float32Array(n);vy=new Float32Array(n);
  sinP=new Float32Array(n);cosP=new Float32Array(n);amp=new Float32Array(n);homeY=new Float32Array(n);
  for(let i=0;i<n;i++){
   sinP[i]=Math.sin(i);cosP[i]=Math.cos(i);
   amp[i]=Math.sin(i*i)*R;homeY[i]=Math.cos(i*i)*R;
   px[i]=amp[i]*sinP[i];py[i]=homeY[i]}}

 function physics(){
  const ca=Math.cos(angle),sa=Math.sin(angle),r2=reach*reach;
  const mxl=mx-w/2,myl=my-h/2,live=mxl<1e8;
  for(let i=0;i<n;i++){
   // sin(i + angle) without calling sin: both halves were computed once.
   const hx=amp[i]*(sinP[i]*ca+cosP[i]*sa);
   let ux=vx[i]+(hx-px[i])*SPRING,uy=vy[i]+(homeY[i]-py[i])*SPRING;
   if(live){const dx=px[i]-mxl,dy=py[i]-myl,d2=dx*dx+dy*dy;
    if(d2>.1&&d2<r2){const d=Math.sqrt(d2),f=PUSH*(1-d/reach)/d;ux+=dx*f;uy+=dy*f}}
   ux*=DAMP;uy*=DAMP;
   vx[i]=ux;vy[i]=uy;px[i]+=ux;py[i]+=uy}
  angle+=SPIN}

 function draw(){
  // Transparent, so the card's own ground shows through and the two can never
  // drift apart the way a hardcoded background colour would.
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle=getComputedStyle(root).getPropertyValue('--cloud-ink').trim()||'#3f5162';
  const cx=w/2,cy=h/2,s=dot;
  // One fillRect a point, no path per point: several thousand beginPath and
  // fill pairs a frame is the difference between a budget and a slideshow.
  for(let i=0;i<n;i++)ctx.fillRect((cx+px[i]-s/2)|0,(cy+py[i]-s/2)|0,s,s)}

 function loop(now){const dt=Math.min(.1,(now-(last||now))/1000);last=now;
  acc+=dt;let steps=0;
  while(acc>=STEP&&steps<4){physics();acc-=STEP;steps++}
  draw();frame=requestAnimationFrame(loop)}

 function sync(){const on=inView&&!document.hidden&&!reduced.matches&&w>0;
  if(on&&!frame){last=0;acc=0;frame=requestAnimationFrame(loop)}
  else if(!on){cancelAnimationFrame(frame);frame=0;last=0}}

 function size(){const r=root.getBoundingClientRect();
  if(!r.width||!r.height)return;
  dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=w+'px';canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  R=Math.min(w,h)*.42;reach=Math.min(w,h)*.22;dot=dpr>1?1.6:2;
  build();draw()}

 const at=e=>{const r=root.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top};
 const release=()=>{mx=my=1e9;touching=false};
 root.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||touching)at(e)});
 root.addEventListener('pointerdown',e=>{touching=true;at(e);
  // Without motion there is no loop to pick the press up, so it is stepped by
  // hand — a press has to do something.
  if(reduced.matches){physics();draw()}});
 // A touch pointer stops existing when the finger lifts, and pointerleave
 // fires right behind pointerup for it, so the release hangs on the events
 // that actually mean the gesture ended. pan-y leaves the page scrollable
 // over the card; the browser cancels the pointer once it takes the scroll.
 root.addEventListener('pointerup',release);
 root.addEventListener('pointercancel',release);
 root.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')release()});

 new ResizeObserver(size).observe(root);
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(root);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();draw()});
 size();sync();
 return{get count(){return n}}
}
const cloudCard=document.querySelector('#cloud-demo');
if(cloudCard){const cloudHTML=cloudCard.outerHTML;
 wireCloud(cloudCard);
 Object.assign(prototypes,{cloud:{title:'Point cloud',html:cloudHTML,
  css:'*{box-sizing:border-box}'+cssFor(/^\.cloud/)
   +'.cloud{position:relative;inset:auto;width:min(560px,92vw);height:360px}',
  js:'/* Point cloud. Technique from a p5 sketch supplied by the site owner,\n'
   +'   reimplemented in vanilla: every point springs toward a home on a slowly\n'
   +'   turning sphere, and the pointer shoves aside whatever it passes over.\n'
   +'   The index-as-angle sphere is the sketch\'s own; the trig is hoisted out\n'
   +'   of the inner loop, the physics runs on a fixed step rather than per\n'
   +'   frame, and pointer events replace a mouse-only, user-agent-sniffed\n'
   +'   interaction. */\n'
   +wireCloud.toString()+";wireCloud(document.querySelector('.cloud'));"}});
}

/* ── Press depth ────────────────────────────────────────────────────────
   Inferred from a React call site supplied by the site owner — the component
   itself was not included, only its props, so the API is faithful and the
   drawing is this site's. It was used there two ways, as a wrapper and as a
   hook bound onto a button of the caller's own, so the behaviour is kept
   separate from the element here too: pressDepth() wires anything.

   What the press is worth getting right is what ends it. A pointer that
   leaves while held, a cancelled gesture, a window that loses focus, a key
   released — all of them, or a key stays stuck down when you alt-tab away.
   And a key is one of them: a control that depresses under a finger but not
   under the space bar behaves differently depending on how you reach it. */
function pressDepth(el,opt){const depth=(opt&&opt.depth)||2;
 let down=false,byKey=false;
 const apply=()=>{el.style.transform=down?'translateY('+depth+'px)':'';
  el.classList.toggle('is-pressed',down);
  if(opt&&opt.onChange)opt.onChange(down)};
 const press=()=>{if(!el.disabled&&!down){down=true;apply()}};
 const release=()=>{if(down){down=false;byKey=false;apply()}};
 el.addEventListener('pointerdown',e=>{if(e.button===0||e.pointerType!=='mouse')press()});
 el.addEventListener('pointerup',release);
 el.addEventListener('pointercancel',release);
 el.addEventListener('pointerleave',release);
 el.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){byKey=true;press()}});
 el.addEventListener('keyup',e=>{if(byKey&&(e.key===' '||e.key==='Enter'))release()});
 el.addEventListener('blur',release);
 addEventListener('blur',release);
 return{get pressed(){return down},release}}

function wirePad(root){
 const amount=root.querySelector('.pk-amount'),live=root.querySelector('.pk-live');
 const charge=root.querySelector('.pk-charge');
 const keys=[...root.querySelectorAll('.pk-key')];
 // Held in cents, so there is no decimal key to press — the grid has a gap
 // where one would be rather than a key that does nothing.
 let digits='';
 const money=()=>(Number(digits||'0')/100).toFixed(2);
 const paint=()=>{amount.textContent=money();charge.disabled=digits.length===0};
 for(const k of keys){pressDepth(k,{depth:2});
  k.addEventListener('click',()=>{const d=k.dataset.key;
   digits=d==='del'?digits.slice(0,-1):(digits+d).slice(0,6);paint()})}
 pressDepth(charge,{depth:2});
 charge.addEventListener('click',()=>{live.textContent='Charged $'+money();digits='';paint()});
 paint();
 return{get value(){return Number(digits||'0')}}}

const padCard=document.querySelector('#pad-demo');
if(padCard){const padHTML=padCard.outerHTML;
 wirePad(padCard);
 Object.assign(prototypes,{pad:{title:'Press depth',html:padHTML,
  css:'*{box-sizing:border-box}'+varsFor('--ink','--muted','--paper','--line','--amber')
   +cssFor(/^\.pk/)+'.pk-scene{position:relative;inset:auto;margin:0 auto}',
  js:'/* Press depth. Inferred from a React call site supplied by the site\n'
   +'   owner: the component was not included, only its props. A press ends on\n'
   +'   any of the events that actually mean the gesture ended — pointer up,\n'
   +'   cancel, leave, blur, key up — and a key presses it as a finger does. */\n'
   +pressDepth.toString()+'\n'+wirePad.toString()
   +";wirePad(document.querySelector('.pk-scene'));"}});
}

/* ── Saturn ─────────────────────────────────────────────────────────────
   Technique from a p5 sketch supplied by the site owner, reimplemented in
   vanilla. The formula is left exactly as written, because the formula is the
   piece: nothing here models a planet. Indices are walked, even ones for the
   body and odd for the ring, and each index-squared is used as an angle. The
   body's x is compressed by cos(i / counter) and the ring's is not, which is
   the only difference between a sphere and a disc. Brightness is 1 - cos(ang),
   which is also what sets each point's height, so the lit side and the top of
   the figure are the same fact stated twice.

   Three things are plumbing rather than art and all three changed. The counter
   advanced once per frame, so a 120Hz screen ran it twice as fast. The geometry
   was written against windowWidth and a hardcoded y of 400, so it framed
   correctly in exactly one window. And the counter grows without bound, taking
   the figure with it — normalising by the counter holds the framing while
   leaving the structure free to keep evolving.

   The index count stays fixed at every size, unlike the point cloud's. There
   the points are samples on a sphere and the count is density; here the set of
   indices IS the drawing, so scaling it would draw a different figure on a
   phone. The dot size carries the frame instead. */
function wireSaturn(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=root.querySelector('.sat-canvas'),ctx=canvas.getContext('2d');
 const TOP=5200,RATE=.6;              // the sketch's 0.01 a frame, in seconds
 let w=0,h=0,counter=100,last=0,frame=0,inView=false;

 function paint(){
  const span=Math.min(w,h);
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle=getComputedStyle(root).getPropertyValue('--sat-ink').trim()||'#29343c';
  // The ring reaches about two and a half counters out, so that is what has to
  // fit — not the body.
  const k=span/(counter*5.4),cx=w*.5,cy=h*.5,dot=span/372;
  for(let par=0;par<2;par++){          // 0 body, 1 ring — the sketch's parity
   for(let i=TOP-par;i>0;i-=2){
    const radial=counter/Math.cos(counter/i)+par*(counter/2+i%counter);
    const ang=counter/9+i*i;
    const x=cx+radial*Math.sin(ang)*(par?1:Math.cos(i/counter))*k;
    const y=cy+radial*Math.cos(ang+par*2)*k;
    const s=(1-Math.cos(ang))*dot;
    if(s<=.02||x<-4||y<-4||x>w+4||y>h+4)continue;
    ctx.fillRect(x-s/2,y-s/2,s,s)}}}

 function loop(now){const dt=Math.min(.05,(now-(last||now))/1000);last=now;
  counter+=dt*RATE;paint();frame=requestAnimationFrame(loop)}
 function sync(){const on=inView&&!document.hidden&&!reduced.matches&&w>0;
  if(on&&!frame){last=0;frame=requestAnimationFrame(loop)}
  else if(!on){cancelAnimationFrame(frame);frame=0;last=0}}
 function size(){const r=root.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=w+'px';canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);paint()}
 new ResizeObserver(size).observe(root);
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(root);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();paint()});
 size();sync();
 return{get counter(){return counter}}}

/* ── Ripple grid ────────────────────────────────────────────────────────
   Technique from a p5 sketch supplied by the site owner, reimplemented in
   vanilla. Each dot springs toward a target displaced from its home along the
   line to the pointer, by the sine of a phase that maps distance through pi.

   The interesting part is an accident worth keeping: that mapping is never
   clamped, so past the influence radius the phase keeps climbing and the sine
   keeps turning over. Dots well outside are alternately pushed and pulled in
   rings, and the whole field ripples rather than only the patch under the
   cursor. Clamping it would be more correct and much duller.

   Changed: three thousand vectors allocated every frame become six typed
   arrays; the spring runs on a fixed step, since damping by .87 per frame is
   twice the friction at half the rate; pointer events replace mouse-only
   handlers, so a finger works; the grid takes as many columns as the card is
   wide, rather than sitting square in the middle of it; and with nothing
   touching it the source drifts, because p5 leaves an untouched mouse at 0,0
   and puts the whole effect in a corner. */
function wireRipple(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=root.querySelector('.rip-canvas'),ctx=canvas.getContext('2d');
 const N=55,STEP=1/60,DAMP=.87,MAXD=15;
 let w=0,h=0,gap=8,reach=50,n=0,cols=N,rows=N;
 let px,py,vx,vy,ox,oy;
 let mx=0,my=0,live=false,touching=false,t=0,acc=0,last=0,frame=0,inView=false;

 function build(){
  // The sketch's grid is square because its canvas is. A card is not, so the
  // spacing comes from the short side and the long side takes the columns it
  // needs — otherwise the grid sits in the middle with bare margins.
  gap=h/(N+2);reach=gap*6.2;rows=N;cols=Math.max(N,Math.ceil(w/gap)+1);
  const x0=(w-(cols-1)*gap)/2,y0=(h-(rows-1)*gap)/2;
  n=cols*rows;
  px=new Float32Array(n);py=new Float32Array(n);vx=new Float32Array(n);vy=new Float32Array(n);
  ox=new Float32Array(n);oy=new Float32Array(n);
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const k=i*rows+j;
   ox[k]=x0+i*gap;oy[k]=y0+j*gap;px[k]=ox[k];py[k]=oy[k]}}

 const sourceX=()=>live?mx:w/2+Math.cos(t*.31)*w*.3;
 const sourceY=()=>live?my:h/2+Math.sin(t*.47)*h*.3;

 function step(){const sx=sourceX(),sy=sourceY();
  for(let k=0;k<n;k++){
   const dx=ox[k]-sx,dy=oy[k]-sy,d=Math.hypot(dx,dy)||1e-6;
   const push=MAXD*Math.sin(d/reach*Math.PI)/d;   // unclamped, as the sketch has it
   const tx=ox[k]+dx*push,ty=oy[k]+dy*push;
   const pd=Math.hypot(px[k]-sx,py[k]-sy);
   const pull=.1-(Math.min(pd,2*w)/(2*w))*.09;
   const ux=(vx[k]+(tx-px[k])*pull)*DAMP,uy=(vy[k]+(ty-py[k])*pull)*DAMP;
   vx[k]=ux;vy[k]=uy;px[k]+=ux;py[k]+=uy}}

 function paint(){
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle=getComputedStyle(root).getPropertyValue('--rip-ink').trim()||'#29343c';
  const sx=sourceX(),sy=sourceY(),far=Math.max(w,h),scale=gap/8;
  for(let k=0;k<n;k++){
   const d=Math.hypot(ox[k]-sx,oy[k]-sy),phase=d/reach*Math.PI;
   const s=(d<reach?1+10*Math.abs(Math.cos(phase/2))
                   :Math.max(.1,5-(Math.min(d,far)/far)*4.9))*scale;
   if(s<=.06)continue;
   ctx.fillRect(px[k]-s/2,py[k]-s/2,s,s)}}

 function loop(now){const dt=Math.min(.1,(now-(last||now))/1000);last=now;t+=dt;
  acc+=dt;let guard=0;
  while(acc>=STEP&&guard<4){step();acc-=STEP;guard++}
  paint();frame=requestAnimationFrame(loop)}
 function sync(){const on=inView&&!document.hidden&&!reduced.matches&&w>0;
  if(on&&!frame){last=0;acc=0;frame=requestAnimationFrame(loop)}
  else if(!on){cancelAnimationFrame(frame);frame=0;last=0}}
 function size(){const r=root.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=w+'px';canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);build();paint()}

 const at=e=>{const r=root.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;live=true};
 const drop=()=>{live=false;touching=false};
 root.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||touching)at(e)});
 root.addEventListener('pointerdown',e=>{touching=true;at(e);if(reduced.matches){step();paint()}});
 root.addEventListener('pointerup',drop);
 root.addEventListener('pointercancel',drop);
 root.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')drop()});

 new ResizeObserver(size).observe(root);
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(root);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();paint()});
 size();sync();
 return{get dots(){return n}}}

const satCard=document.querySelector('#saturn-demo');
if(satCard){const satHTML=satCard.outerHTML;
 wireSaturn(satCard);
 Object.assign(prototypes,{saturn:{title:'Saturn',html:satHTML,
  css:'*{box-sizing:border-box}'+cssFor(/^\.sat/)
   +'.sat-scene{position:relative;inset:auto;width:min(620px,92vw);aspect-ratio:1.45/1}',
  js:'/* Saturn. Technique from a p5 sketch supplied by the site owner,\n'
   +'   reimplemented in vanilla. The formula is the piece and is left as\n'
   +'   written; the counter runs on seconds rather than frames, the geometry\n'
   +'   is written against the canvas rather than the window, and the figure is\n'
   +'   normalised by the counter it would otherwise outgrow. */\n'
   +wireSaturn.toString()+";wireSaturn(document.querySelector('.sat-scene'));"}});
}
const ripCard=document.querySelector('#ripple-demo');
if(ripCard){const ripHTML=ripCard.outerHTML;
 wireRipple(ripCard);
 Object.assign(prototypes,{ripple:{title:'Ripple grid',html:ripHTML,
  css:'*{box-sizing:border-box}'+cssFor(/^\.rip/)
   +'.rip-scene{position:relative;inset:auto;width:min(620px,92vw);aspect-ratio:1.45/1}',
  js:'/* Ripple grid. Technique from a p5 sketch supplied by the site owner,\n'
   +'   reimplemented in vanilla. The distance-to-phase mapping is deliberately\n'
   +'   left unclamped, as the sketch has it: past the influence radius the\n'
   +'   sine keeps turning over and the whole field ripples in rings rather\n'
   +'   than only the patch under the pointer. */\n'
   +wireRipple.toString()+";wireRipple(document.querySelector('.rip-scene'));"}});
}
/* Oscillation. A stack of waveforms drawn once per colour channel, the copies
   pulled apart so they fringe where they disagree and go white where they
   agree. Additive compositing does the colour: it is the density, not a
   palette. The stack breathes between two silhouettes, a cone and a leaf.
   Silhouette and wavelength gradient after an RGB waveform stack the site
   owner shared; the implementation and the touch response are original. */
function wireOsc(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=root.querySelector('.osc-canvas'),ctx=canvas.getContext('2d',{alpha:false});
 const ROWS=80;
 // Two silhouettes the stack breathes between. Cone is a pointed crown
 // opening downward; leaf swells at the middle and closes toward both ends.
 const CONE=t=>.10+.62*Math.pow(t,.55)*(1-.45*Math.pow(t,4));
 const LEAF=t=>Math.max(.15+.60*Math.pow(Math.sin(Math.PI*Math.pow(t,1.15)),.75),.15+.24*t);
 // morph is held for the whole frame so all three channels agree on the shape.
 let morph=0;
 const widthAt=t=>{const c=CONE(t);return c+(LEAF(t)-c)*morph};
 // Wavelength is what changes down the stack — a tight buzz at the crown
 // opening into slow swells at the foot.
 const freqAt=t=>3.2+19*Math.pow(1-t,2);
 const ampAt=t=>1.3+1.75*t;
 let w=0,h=0,dpr=1,clock=0,last=null,raf=0;
 let held=false,heat=0,heatY=.5,tear=0,tearY=.5,inView=true;

 const size=()=>{dpr=Math.min(devicePixelRatio||1,2);
  const cw=root.clientWidth,ch=root.clientHeight;if(!cw||!ch)return false;
  const nw=Math.round(cw*dpr),nh=Math.round(ch*dpr);
  if(canvas.width!==nw||canvas.height!==nh){canvas.width=nw;canvas.height=nh}
  w=cw;h=ch;return true};

 // One channel's worth of the whole stack as a single path, so each colour
 // costs one stroke rather than one per row.
 const channel=(colour,dx,shift)=>{ctx.strokeStyle=colour;ctx.beginPath();
  const gap=h/(ROWS+11),top=gap*3.2;
  // The figure is drawn portrait whatever the frame is. A gallery preview is
  // wide and short, and letting the stack run its full width flattens the
  // silhouette into a fan, so the horizontal span is capped against the height
  // and centred. In a portrait frame the cap never binds.
  const bw=Math.min(w,h*1.7);
  for(let i=0;i<ROWS;i++){const t=i/(ROWS-1),rowY=top+i*gap;
   const dy=rowY/h-heatY,grip=heat*Math.exp(-(dy*dy)/.012);
   const span=widthAt(t)*(1+grip*.42)*bw*.5;
   const freq=freqAt(t),amp=ampAt(t)*gap*(1+grip*1.9);
   const steps=Math.min(230,Math.max(44,Math.round(span*.62)));
   // The torn slice: one band slides sideways, like a dropped frame.
   const slide=Math.exp(-Math.pow((rowY/h-tearY)/.035,2))*tear*bw*.16;
   for(let s=0;s<=steps;s++){const u=s/steps*2-1,fade=Math.pow(1-u*u,.18);
    const a=clock*(.55+t*.5)+i*.045+shift;
    const y=rowY+amp*fade*Math.sin(freq*Math.PI*u+a)
              +amp*.22*fade*Math.sin(freq*2.17*Math.PI*u-a*1.37);
    const x=w*.5+u*span+dx*(.35+fade)+slide;
    if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}}
  ctx.stroke()};

 const paint=()=>{if(!size())return;
  // An 18s round trip between the two silhouettes.
  morph=.5-.5*Math.cos(clock*(Math.PI*2/18));
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  // The channels diverge further the more the stack is excited, so a touch
  // reads as the colours coming apart and not only as more movement.
  const split=Math.min(w,h*1.7)*.004*(1+heat*5.2);
  ctx.lineWidth=Math.max(.75,Math.min(1.35,w/520));
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.92;
  channel('#f00',-split,-.16*(1+heat));
  channel('#0f0',0,0);
  channel('#00f',split,.16*(1+heat));
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'};

 const frame=now=>{const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;
  clock+=dt;
  // Blooms fast under the finger, relaxes slowly after.
  heat+=((held?1:0)-heat)*Math.min(1,dt*(held?9:1.6));
  tear+=-tear*Math.min(1,dt*3.4);
  paint();raf=requestAnimationFrame(frame)};

 const sync=()=>{const run=inView&&!document.hidden&&!reduced.matches;
  if(run&&!raf){last=null;raf=requestAnimationFrame(frame)}
  else if(!run&&raf){cancelAnimationFrame(raf);raf=0}};

 const at=e=>{const r=root.getBoundingClientRect();return (e.clientY-r.top)/Math.max(r.height,1)};
 const grab=e=>{const y=at(e);held=true;
  const jump=Math.abs(y-heatY);heatY=y;
  if(tear<1||jump>.06){tearY=y;tear=1}
  if(reduced.matches){heat=1;paint()}};
 const track=e=>{if(!held)return;const y=at(e),jump=Math.abs(y-heatY);heatY=y;
  if(jump>.06){tear=Math.min(1,tear+jump*2.4);tearY=y}
  if(reduced.matches)paint()};
 const drop=()=>{held=false;if(reduced.matches){heat=0;tear=0;paint()}};
 root.addEventListener('pointerdown',e=>{grab(e);
  if(root.setPointerCapture&&e.pointerId!==undefined){try{root.setPointerCapture(e.pointerId)}catch{/* capture unavailable */}}});
 root.addEventListener('pointermove',track);
 root.addEventListener('pointerup',drop);
 root.addEventListener('pointercancel',drop);
 root.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')drop()});

 new ResizeObserver(()=>{size();if(!raf)paint()}).observe(root);
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(root);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();paint()});
 clock=3.4;size();sync();paint();
 return{get rows(){return ROWS}}}

const oscCard=document.querySelector('#osc-demo');
if(oscCard){const oscHTML=oscCard.outerHTML;
 wireOsc(oscCard);
 Object.assign(prototypes,{oscillation:{title:'Oscillation',html:oscHTML,
  css:'*{box-sizing:border-box}body{background:#000;margin:0}'+cssFor(/^\.osc/)
   +'.osc-scene{position:relative;inset:auto;width:min(620px,92vw);aspect-ratio:3/4}',
  js:'/* Oscillation. A stack of waveforms drawn once per colour channel, the\n'
   +'   copies pulled apart so they fringe where they disagree and go white\n'
   +'   where they agree. Additive compositing does the colour: it is the\n'
   +'   density, not a palette. Silhouette and wavelength gradient after an RGB\n'
   +'   waveform stack the site owner shared; the implementation and the touch\n'
   +'   response are original. */\n'
   +wireOsc.toString()+";wireOsc(document.querySelector('.osc-scene'));"}});
}
/* Voice. A listening orb: one fragment shader over a single triangle, with an
   idle state and a thinking state it crossfades between. The shader is the
   WebGL2 port of a WebGPU/WGSL "Glass Liquid" orb the site owner shared,
   trimmed to the one preset this card uses — the spectrum voice field and its
   glass shell. The trim is pixel-identical to the full shader at every phase
   tested; every other preset, the noise bank and the palette ramp are gone.
   Where WebGL2 is missing the card paints a still marble on a 2D context
   instead of leaving an empty box. */
const VOX_FRAG=`#version 300 es
precision highp float;
uniform vec4 P[22];
in vec2 vUv;
out vec4 fragColor;

#define u_size        P[0].xy
#define u_time        P[0].z
#define u_speed       P[0].w
#define u_radius      P[1].x
#define u_zoom        P[1].y
#define u_warp        P[1].z
#define u_ridgeAmt    P[1].w
#define u_shade       P[2].y
#define u_sheen       P[2].z
#define u_gloss       P[2].w
#define u_shellMidA   P[3].x
#define u_shellEdgeA  P[3].y
#define u_exposure    P[3].z
#define u_style       P[3].w
#define u_edgeSoft    P[4].x
#define u_edgeGlow    P[4].y
#define u_glassOn     P[4].w
#define u_glassOpac   P[5].x
#define u_contour     P[5].y
#define u_colorA      P[10].rgb
#define u_colorB      P[11].rgb
#define u_colorC      P[12].rgb
#define u_colorD      P[13].rgb
#define u_highlight   P[14].rgb
#define u_shellInner  P[15].rgb
#define u_shellMid    P[16].rgb
#define u_shellEdge   P[17].rgb
#define u_sheenColor  P[18].rgb
#define u_specColor   P[19].rgb
#define u_canvasColor P[20].rgb
#define u_glowColor   P[21].rgb

// ── edge bank ───────────────────────────────────────────────────────────────
float mfEdgeD(float soft){ return soft - 0.005; }

vec3 mfEdgeGlow(vec3 col, vec2 uv, vec2 ctr, float rad,
                float soft, float glow, vec3 glowRGB){
  if (glow <= 0.0) { return col; }
  float r = length(uv - ctr);
  float outside = smoothstep(rad - max(soft, 0.0005), rad + max(soft, 0.0005), r);
  return col + glowRGB * (glow * exp(-max(r - rad, 0.0) * 11.0) * outside);
}

// ── palette ramp bank ───────────────────────────────────────────────────────
// ── geometry + diffusion constants ──────────────────────────────────────────
const float GL_FU = 0.88172043;
const float GL_BSIG_CLEAR = 0.018;
const float GL_BSIG_GLASS = 0.0399;
const float GL_KA  = 6.0;
const float GL_KG  = 4.1209;
const float GL_KWA = 0.5;
const float GL_KR  = 0.32;
const float GL_GH  = 1.73205081;
const float GL_CLEAR_EA = 0.995;
const float GL_CLEAR_EB = 1.04;

// ── the liquid noise bank ───────────────────────────────────────────────────
// Returns .x the attenuated value and .y the standard deviation of the detail
// the frequency-domain blur removed — what a following nonlinearity has to
// integrate back over.
// Three-point Gauss-Hermite over the detail the blur took out.
vec3 glsFinishEmissionFluid(vec3 colorIn, vec2 p){
  vec3 color = colorIn;
  if (u_glassOn > 0.5) {
    color = mix(color, u_highlight,
                u_shade * 0.22 * smoothstep(0.15, 1.15, dot(p, vec2(-0.32, 0.78))));
  }
  color = color * (1.0 - u_shade * 0.34 * smoothstep(-0.1, 1.2, dot(p, vec2(0.45, -0.62))));
  color = color * (1.0 - u_shade * 0.22 * smoothstep(0.72, 1.08, length(p)));
  return clamp(color, vec3(0.0), vec3(1.0));
}

// ── style 9 · Siri bands ────────────────────────────────────────────────────
// ── style 14 · spectrum (the voice field) ───────────────────────────────────
float glsSpectrumHeight(vec2 q, float t, float frequency,
                        float phaseOffset, float amplitude){
  float x = q.x * 2.15;
  float envelope = pow(4.0 / (4.0 + x * x), 4.0);
  float breathing = 0.82 + 0.18 * sin(t * 0.48 + phaseOffset * 0.7);
  float wave = abs(sin(frequency * x - t * 1.36 + phaseOffset));
  return envelope * amplitude * breathing * (0.28 + 0.72 * wave);
}

float glsSpectrumLayer(vec2 q, float height, float softness){
  return (1.0 - smoothstep(max(height - softness, 0.0), height + softness, abs(q.y)))
         * smoothstep(0.0, 0.045, height);
}

vec3 glsSpectrumFluid(vec2 p, float t){
  float scale = 0.74 + u_zoom * 0.34;
  vec2 q = p / scale;
  float amplitude = 0.26 + u_ridgeAmt * 0.27;
  float frequency = 0.72 + u_warp * 0.095;
  float softness = 0.026 + (1.0 - u_ridgeAmt) * 0.032;
  float h0 = glsSpectrumHeight(q, t, frequency * 0.82, -1.2, amplitude * 0.72);
  float h1 = glsSpectrumHeight(q, t, frequency, 0.45, amplitude);
  float h2 = glsSpectrumHeight(q, t, frequency * 1.17, 2.05, amplitude * 0.82);
  float l0 = glsSpectrumLayer(q, h0, softness);
  float l1 = glsSpectrumLayer(q, h1, softness);
  float l2 = glsSpectrumLayer(q, h2, softness);
  float spectrumX = q.x * 2.15;
  float envelope = pow(4.0 / (4.0 + spectrumX * spectrumX), 4.0);
  float support = exp(-q.y * q.y / 0.00072) * envelope;
  float total = l0 + l1 + l2;
  vec3 spectral = (u_colorB * l0 + u_colorC * l1 + u_colorD * l2) / max(total, 0.001);
  float glassFill = (u_glassOn > 0.5) ? 1.0 : 0.0;
  vec3 color = u_colorD * 0.025 * glassFill + spectral * (1.0 - exp(-total * 0.86));
  color = color + u_colorA * support * 0.58;
  color = color / (vec3(1.0) + color * 0.2);
  return glsFinishEmissionFluid(color, p);
}

// ── style 15 · frost ────────────────────────────────────────────────────────
// ── style 21 · violet ember ─────────────────────────────────────────────────
// ── style 22 · chromatic metal ──────────────────────────────────────────────
// ── the shell ───────────────────────────────────────────────────────────────
vec3 glsOver(vec3 dst, vec3 src, float a){
  float k = clamp(a, 0.0, 1.0);
  return src * k + dst * (1.0 - k);
}

float glsRefractionProfile(float t){
  float depth = clamp(t, 0.0, 1.0);
  float circular = sqrt(max(1.0 - (1.0 - depth) * (1.0 - depth), 0.0));
  return 1.0 - circular;
}

float glsHighlightLobe(vec2 normal, vec2 direction, float cut, float power){
  float angular = clamp((dot(normal, direction) - cut) / max(1.0 - cut, 0.001), 0.0, 1.0);
  return pow(angular, power);
}

vec2 glsContourWave(float angle, float t){
  int style = int(u_style + 0.5);
  if (style == 19) {
    float wave = sin(angle * 2.0 + t * 0.27) * 0.72 + sin(angle * 4.0 - t * 0.16 + 2.1) * 0.28;
    float slope = cos(angle * 2.0 + t * 0.27) * 1.44 + cos(angle * 4.0 - t * 0.16 + 2.1) * 1.12;
    return vec2(wave, slope);
  }
  float wave = sin(angle * 3.0 + t * 0.62) * 0.52
             + sin(angle * 5.0 - t * 0.41 + 1.7) * 0.31
             + sin(angle * 2.0 + t * 0.23 + 3.1) * 0.17;
  float slope = cos(angle * 3.0 + t * 0.62) * 1.56
              + cos(angle * 5.0 - t * 0.41 + 1.7) * 1.55
              + cos(angle * 2.0 + t * 0.23 + 3.1) * 0.34;
  return vec2(wave, slope);
}

float glsContourStrength(){
  if (u_style >= 18.5) { return 0.11; }
  return (u_style >= 15.5) ? 0.16 : 0.09;
}

float glsContourScale(vec2 uv, float t, float amount){
  if (amount <= 0.0) { return 1.0; }
  vec2 contour = glsContourWave(atan(uv.y, uv.x), t);
  return 1.0 + clamp(amount, 0.0, 1.0) * glsContourStrength() * contour.x;
}

vec2 glsContourNormal(vec2 uv, float rad, float t, float amount){
  float distance = length(uv);
  if (distance <= 0.0001) { return vec2(0.0); }
  vec2 radial = uv / distance;
  vec2 contour = glsContourWave(atan(uv.y, uv.x), t);
  float slope = clamp(amount, 0.0, 1.0) * glsContourStrength() * contour.y;
  vec2 tangent = vec2(-radial.y, radial.x);
  return normalize(radial - tangent * (rad * slope / distance));
}

vec4 orbGlassLiquidAnim(vec2 uv01){
  vec2 fc = vec2(uv01.x, 1.0 - uv01.y) * u_size;
  vec2 uv = (2.0 * fc - u_size) / max(min(u_size.x, u_size.y), 1.0);

  float rad = max(u_radius, 0.05);
  float t = u_time * u_speed;
  int s = int(u_style + 0.5);
  bool emissionOnly = u_glassOn <= 0.5 && (s == 9 || s == 14);
  float contourRad = rad * glsContourScale(uv, t, u_contour);

  if (length(uv) > contourRad * (1.01 + mfEdgeD(u_edgeSoft))) {
    vec3 halo = clamp(mfEdgeGlow(vec3(0.0), uv, vec2(0.0), contourRad,
                                 u_edgeSoft, u_edgeGlow, u_glowColor),
                      vec3(0.0), vec3(1.0));
    return vec4(halo, max(halo.r, max(halo.g, halo.b)));
  }

  vec2 p  = uv / contourRad;
  float pd = length(p);

  float clearFa = 1.0 - smoothstep(GL_CLEAR_EA, GL_CLEAR_EB, pd);
  vec2 normal = glsContourNormal(uv, rad, t, u_contour);
  float edgeDepth = max(1.0 - pd, 0.0);
  float refractionWidth = 0.015 + 0.95 * clamp(u_shellMidA, 0.0, 1.0);
  float refractionT = edgeDepth / max(refractionWidth, 0.001);
  float refractionProfile = pow(glsRefractionProfile(refractionT), 0.68);
  float refractionAmount = 1.6 * clamp(u_glassOpac, 0.0, 1.0) * refractionProfile;
  vec2 refractedP = p - normal * refractionAmount;
  vec3 fcol = vec3(0.0);
  if (clearFa > 0.0) {
    if (u_glassOn > 0.5) {
      float channelSplit = 0.14 * clamp(u_gloss, 0.0, 2.0)
                         * clamp(u_glassOpac, 0.0, 1.0) * refractionProfile;
      // glsRefractionProfile() is EXACTLY zero once edgeDepth passes
      // refractionWidth, so over the inner ~66% of the disc the three channel
      // samples are the same sample. Taking it once there is bit-identical,
      // not an approximation -- and it is two thirds of the fluid evaluations
      // in the frame.
      if (channelSplit > 0.0) {
        vec3 redSample   = glsSpectrumFluid(refractedP - normal * channelSplit, t);
        vec3 greenSample = glsSpectrumFluid(refractedP, t);
        vec3 blueSample  = glsSpectrumFluid(refractedP + normal * channelSplit, t);
        fcol = vec3(redSample.r, greenSample.g, blueSample.b);
      } else {
        fcol = glsSpectrumFluid(refractedP, t);
      }
    } else {
      fcol = glsSpectrumFluid(p, t);
    }
  }

  float lum = dot(fcol, vec3(0.213, 0.715, 0.072));
  vec3 clearSat = clamp(vec3(lum) + (fcol - vec3(lum)) * 1.22, vec3(0.0), vec3(1.0));
  vec3 col = glsOver(u_canvasColor, clearSat, 0.99 * clearFa);
  if (emissionOnly) {
    float signal = max(clearSat.r, max(clearSat.g, clearSat.b));
    col = clearSat * smoothstep(0.025, 0.16, signal);
  }
  if (u_glassOn > 0.5) {
    float surfaceWidth = 0.026 + 0.055 * clamp(u_shellEdgeA, 0.0, 1.0);
    float surfaceBand = (1.0 - smoothstep(0.0, surfaceWidth, edgeDepth)) * clearFa;
    float opticalRim = pow(surfaceBand, 1.8);
    col = glsOver(col, u_shellInner, opticalRim * u_glassOpac * 0.45);

    vec2 coolDirection = normalize(vec2(0.84, 0.54));
    vec2 warmDirection = normalize(vec2(-0.62, -0.78));
    float coolSplit = glsHighlightLobe(normal, coolDirection, -0.32, 1.8);
    float warmSplit = glsHighlightLobe(normal, warmDirection, -0.28, 2.0);
    float dispersion = opticalRim * clamp(u_gloss, 0.0, 2.0) * (0.8 + 0.8 * u_shellEdgeA);
    col = glsOver(col, u_shellMid,  dispersion * coolSplit);
    col = glsOver(col, u_shellEdge, dispersion * warmSplit);

    float edgeShadow = opticalRim * (0.015 + 0.15 * u_shellEdgeA)
                     * (0.15 + 0.85 * max(dot(normal, vec2(0.45, -0.89)), 0.0));
    col = col * (1.0 - edgeShadow);

    vec2 keyDirection = normalize(vec2(-0.68, 0.73));
    vec2 fillDirection = normalize(vec2(0.74, -0.67));
    float key = opticalRim * glsHighlightLobe(normal, keyDirection, 0.2, 2.8)
              * clamp(u_sheen, 0.0, 2.0) * 1.4;
    float fill = opticalRim * glsHighlightLobe(normal, fillDirection, 0.4, 3.6)
               * clamp(u_sheen, 0.0, 2.0) * 1.0;
    col = glsOver(col, u_sheenColor, key);
    col = glsOver(col, u_specColor, fill);
  }

  float ballA = 1.0 - smoothstep(0.99 - mfEdgeD(u_edgeSoft), 1.01 + mfEdgeD(u_edgeSoft), pd);
  col = clamp(col * max(u_exposure, 0.0), vec3(0.0), vec3(1.0)) * ballA;
  vec3 edged = mfEdgeGlow(col, uv, vec2(0.0), contourRad, u_edgeSoft, u_edgeGlow, u_glowColor);
  vec3 finalColor = clamp(edged, vec3(0.0), vec3(1.0));
  float emissionAlpha = max(finalColor.r, max(finalColor.g, finalColor.b));
  float sphereAlpha = clamp(max(ballA, emissionAlpha), 0.0, 1.0);
  return vec4(finalColor, emissionOnly ? emissionAlpha : sphereAlpha);
}

void main(){
  vec4 c = orbGlassLiquidAnim(vUv);

  vec2 fc = vec2(vUv.x, 1.0 - vUv.y) * u_size;
  vec2 uv = (2.0 * fc - u_size) / max(min(u_size.x, u_size.y), 1.0);
  float rad = max(u_radius, 0.05);
  float t = u_time * u_speed;
  float contourRad = rad * glsContourScale(uv, t, u_contour);
  vec2 q = (2.0 * fc - u_size) / u_size;
  float fitEnd = 1.0;
  float fitFeather = 2.0 / max(min(u_size.x, u_size.y), 1.0);
  float fitStart = min(mix(contourRad, fitEnd, 0.5), fitEnd - fitFeather);
  float fit = 1.0 - smoothstep(fitStart, fitEnd, max(abs(q.x), abs(q.y)));
  fragColor = vec4(c.rgb * fit, c.a * fit);
}
`;
const VOX_VERT=`#version 300 es
precision highp float;
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0;
  gl_Position = vec4(p, 0.0, 1.0);
  vec2 uv01 = (p + vec2(1.0)) * 0.5;
  vUv = vec2(uv01.x, 1.0 - uv01.y);
}
`;
/* 88 floats: 40 scalars, then 12 colours as vec4s. Same order the shader's
   uniform block declares, so the seed can be uploaded straight in. */
const VOX_SEEDS={idle:[
  1,1,0,0.486,0.72,0.4232,1.936,0.2736,
  2.2,0.06,0.26,0.24,0.18,0.18,0.93,14,
  0.005,0,0,1,0.4,0.009,2,0.42,
  0.77,0.23,65,0,0,1,0.22,0.25,
  0.72,5,0.42,1.25,0.55,0.3,1.2,0.7,
  0.7058824,0.7333333,0.7607843,1,0.1568628,0.3647059,0.5607843,1,
  0.5686275,0.3137255,0.4352941,1,0.2470588,0.5333334,0.4509804,1,
  0.8470588,0.8666667,0.8823529,1,1,1,1,1,
  0.4,0.9098039,1,1,0.8235294,0.4235294,1,1,
  0.9176471,0.9568627,1,1,0.8627451,0.9176471,1,1,
  0.0117647,0.0156863,0.0392157,1,0.2196078,0.4039216,0.5372549,1
],thinking:[
  1,1,0,1.8,0.72,0.46,4.4,0.72,
  2.2,0.06,0.26,0.24,0.18,0.18,1.5,14,
  0.005,0,0,1,0.4,0.03,2,0.42,
  0.77,0.23,65,0,0,1,0.22,0.25,
  0.72,5,0.42,1.25,0.55,0.3,1.2,0.7,
  1,1,1,1,0.0862745,0.4666667,1,1,
  0.9490196,0.2862745,0.627451,1,0.2078431,0.9019608,0.6980392,1,
  1,1,1,1,1,1,1,1,
  0.4,0.9098039,1,1,0.8235294,0.4235294,1,1,
  0.9176471,0.9568627,1,1,0.8627451,0.9176471,1,1,
  0.0117647,0.0156863,0.0392157,1,0.0862745,0.4666667,1,1
]};

function wireVox(root){const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=root.querySelector('.vox-canvas');
 const ACTIVATE=170,SETTLE=650;
 const toLin=v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);
 const toSrgb=v=>v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055;
 // Colour crossfades run in linear light; mixing sRGB directly muddies the
 // midpoint, which on this palette turns the pink band grey as it arrives.
 const mixSrgb=(a,b,k)=>toSrgb(toLin(a)+(toLin(b)-toLin(a))*k);

 const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 let state='idle',toState='idle',from=new Float32Array(VOX_SEEDS.idle),
  target=new Float32Array(VOX_SEEDS.idle),shown=new Float32Array(VOX_SEEDS.idle),
  startedAt=0,duration=0,phase=0,last=null,raf=0,inView=true,loc=null,values=null;

 const progress=now=>{if(duration===0)return 1;
  const raw=Math.min(1,Math.max(0,(now-startedAt)/duration));
  return toState==='thinking'?1-Math.pow(1-raw,3):raw*raw*(3-2*raw)};
 const sample=now=>{const k=progress(now);
  for(let i=3;i<shown.length;i++){const col=i>=40&&(i-40)%4<3;
   shown[i]=col?mixSrgb(from[i],target[i],k):from[i]+(target[i]-from[i])*k}
  return shown};

 const size=()=>{const dpr=Math.min(devicePixelRatio||1,2);
  const cw=root.clientWidth,ch=root.clientHeight;if(!cw||!ch)return false;
  const w=Math.round(cw*dpr),h=Math.round(ch*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  return true};

 if(!gl){
  // No WebGL2: a still marble, so the card is never an empty square.
  const ctx=canvas.getContext('2d');
  const paint2d=()=>{if(!size())return;const w=canvas.width,h=canvas.height;
   const r=Math.min(w,h)*.36,cx=w/2,cy=h/2;
   ctx.clearRect(0,0,w,h);
   const g=ctx.createRadialGradient(cx-r*.3,cy-r*.35,r*.1,cx,cy,r);
   g.addColorStop(0,'#2b3c4e');g.addColorStop(.55,'#0d1218');g.addColorStop(1,'#05070b');
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
   const band=ctx.createLinearGradient(cx-r,cy,cx+r,cy);
   band.addColorStop(0,'rgba(143,182,232,0)');band.addColorStop(.5,'rgba(214,232,255,.9)');
   band.addColorStop(1,'rgba(143,182,232,0)');
   ctx.fillStyle=band;ctx.fillRect(cx-r,cy-r*.035,r*2,r*.07)};
  new ResizeObserver(paint2d).observe(root);paint2d();
  return{get state(){return state},supported:false}}

 const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const prog=gl.createProgram();
 gl.attachShader(prog,compile(gl.VERTEX_SHADER,VOX_VERT));
 gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,VOX_FRAG));
 gl.linkProgram(prog);
 if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));
 gl.useProgram(prog);
 loc=gl.getUniformLocation(prog,'P[0]');
 gl.bindVertexArray(gl.createVertexArray());
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 values=new Float32Array(shown);

 const paint=now=>{if(!size())return;
  gl.viewport(0,0,canvas.width,canvas.height);
  values.set(sample(now));
  const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;
  // Phase is integrated against speed rather than read from the clock, so a
  // state change alters the rate without jumping the wave.
  phase+=dt*Math.max(values[3],0);
  values[0]=canvas.width;values[1]=canvas.height;
  values[2]=phase/Math.max(values[3],.001);
  gl.uniform4fv(loc,values);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES,0,3)};

 const frame=now=>{paint(now);raf=requestAnimationFrame(frame)};
 const sync=()=>{const run=inView&&!document.hidden&&!reduced.matches;
  if(run&&!raf){last=null;raf=requestAnimationFrame(frame)}
  else if(!run&&raf){cancelAnimationFrame(raf);raf=0}};

 const setState=next=>{if(next===state||!VOX_SEEDS[next])return;
  const now=performance.now();sample(now);
  from=new Float32Array(shown);target=new Float32Array(VOX_SEEDS[next]);
  toState=next;startedAt=now;duration=next==='thinking'?ACTIVATE:SETTLE;state=next;
  if(reduced.matches)paint(now)};

 root.addEventListener('click',()=>setState(state==='idle'?'thinking':'idle'));
 new ResizeObserver(()=>{size();if(!raf)paint(performance.now())}).observe(root);
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(root);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();paint(performance.now())});
 phase=6.2;size();sync();paint(performance.now());
 return{get state(){return state},setState,supported:true}}

const voxCard=document.querySelector('#vox-demo');
if(voxCard){const voxHTML=voxCard.outerHTML;
 try{wireVox(voxCard)}catch(err){/* a shader that will not build must not take the page with it */}
 Object.assign(prototypes,{voice:{title:'Listening',html:voxHTML,
  css:'*{box-sizing:border-box}body{background:#f5f5f3;margin:0;display:grid;place-items:center;min-height:100vh}'
   +cssFor(/^\.vox/)
   +'.vox-scene{position:relative;inset:auto;width:min(520px,92vw);aspect-ratio:1}',
  js:[
   '/* Listening. A voice orb: one fragment shader over a single triangle, with',
   '   an idle state and a thinking state it crossfades between in linear light.',
   '   WebGL2 port of a WebGPU/WGSL orb supplied by the site owner, trimmed to',
   '   the one preset used here and verified pixel-identical to the original at',
   '   every phase tested. Falls back to a still marble on a 2D context where',
   '   WebGL2 is missing. */',
   'const VOX_FRAG='+JSON.stringify(VOX_FRAG)+';',
   'const VOX_VERT='+JSON.stringify(VOX_VERT)+';',
   'const VOX_SEEDS='+JSON.stringify(VOX_SEEDS)+';',
   wireVox.toString()+";wireVox(document.querySelector('.vox-scene'));"
  ].join(String.fromCharCode(10))}});
}
