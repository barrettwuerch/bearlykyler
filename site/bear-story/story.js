const stage=document.querySelector('#stage'),fallback=document.querySelector('#fallback'),status=document.querySelector('#status');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');stage.prepend(canvas);const c=canvas.getContext('2d');
const names=['wave1','wave2','wave3','wave4','wave5','wave6','wave7','wave8','honey-low','honey-held','smile','honey-smile'];
let images,current='wave8',previous=current,elapsed=0,sequence=[],index=0,raf=0,last=0,visible=true,hasHoney=false;
const load=name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=new URL(name+'.png',import.meta.url)});
function bounds(){const size=420*Math.min(stage.clientWidth/520,stage.clientHeight/510);return {size,x:(stage.clientWidth-size)/2,y:(stage.clientHeight-size)/2}}
// Every wave pose uses the approved full-cell registration. No vertex warping.
let pointerX=0,lean=0;
function draw(){
 if(!images)return;
 const d=Math.min(devicePixelRatio,2),b=bounds();c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,stage.clientWidth,stage.clientHeight);
 c.save();c.translate(b.x+b.size/2,b.y+b.size*.9);c.rotate(motion.matches?0:lean*.012);c.translate(-b.size/2,-b.size*.9);c.scale(b.size/444,b.size/444);
 const honey=current.startsWith('honey'),smiling=current==='smile'||current==='honey-smile';
 c.drawImage(images[honey?(current==='honey-low'?'honey-low':'honey-held'):smiling?'wave8':current],0,0,444,444);
 if(smiling){c.drawImage(images.mouth,154,167,84,56)}
 c.restore();
}
function fit(){const d=Math.min(devicePixelRatio,2);canvas.width=stage.clientWidth*d;canvas.height=stage.clientHeight*d;draw()}
function active(){return images&&visible&&!document.hidden&&document.body.classList.contains('ready')&&!motion.matches&&(sequence.length||Math.abs(lean-pointerX)>.001)}
function sync(){if(active()&&!raf){last=0;raf=requestAnimationFrame(tick)}else if(!active()){cancelAnimationFrame(raf);raf=0;last=0}}
function tick(now){raf=0;if(!active())return;const dt=Math.min(.04,(now-(last||now))/1000);last=now;lean+=(pointerX-lean)*(1-Math.exp(-dt*10));if(sequence.length){elapsed+=dt;if(elapsed>=sequence[index][1]){elapsed=0;index++;if(index===sequence.length){sequence=[]}else{previous=current;current=sequence[index][0]}}}draw();if(active())raf=requestAnimationFrame(tick)}
function play(action){if(!images||sequence.length)return;let beats;
 if(action==='wave'){beats=[...(hasHoney?[['honey-low',.22],['wave8',.16]]:[]),['wave1',.18],['wave2',.12],['wave3',.13],['wave4',.14],['wave5',.17],['wave6',.14],['wave3',.10],['wave7',.12],['wave8',.40]];hasHoney=false}
 else if(action==='honey'){beats=[['honey-low',.3],['honey-held',.42]];hasHoney=true}
 else beats=[[hasHoney?'honey-smile':'smile',.3]];
 previous=current;index=0;elapsed=0;sequence=beats;current=beats[0][0];if(motion.matches){current=beats.at(-1)[0];sequence=[]}draw();sync();
}
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointerX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));sync()});stage.addEventListener('pointerleave',()=>{pointerX=0;sync()});
const regions=[['honey','Bring out the honey',.02,.55,.46,.4],['wave','Wave hello',.52,.55,.46,.4],['smile','Give a happy smile',.16,.06,.68,.49]];
const buttons=regions.map(([action,label,x,y,w,h])=>{const button=document.createElement('button');button.type='button';button.className='bear-hit';button.setAttribute('aria-label',label);button.addEventListener('click',()=>play(action));stage.append(button);return{button,x,y,w,h}});
function layout(){fit();const b=bounds();for(const r of buttons)Object.assign(r.button.style,{left:b.x+r.x*b.size+'px',top:b.y+r.y*b.size+'px',width:r.w*b.size+'px',height:r.h*b.size+'px'})}
stage.removeAttribute('tabindex');stage.setAttribute('role','group');stage.setAttribute('aria-label','Play with the bear: choose a paw or his head');
new ResizeObserver(layout).observe(stage);new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync()}).observe(stage);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);motion.addEventListener('change',()=>{if(motion.matches&&sequence.length){current=sequence.at(-1)[0];sequence=[];draw()}sync()});
Promise.all(names.map(load)).then(ims=>{images=Object.fromEntries(names.map((n,i)=>[n,ims[i]]));const mouth=document.createElement('canvas');mouth.width=84;mouth.height=56;const mc=mouth.getContext('2d');mc.drawImage(images.smile,154,167,84,56,0,0,84,56);mc.globalCompositeOperation='destination-in';const mask=mc.createRadialGradient(42,28,19,42,28,42);mask.addColorStop(0,'white');mask.addColorStop(1,'transparent');mc.fillStyle=mask;mc.fillRect(0,0,84,56);images.mouth=mouth;fallback.hidden=true;status.textContent='';layout()}).catch(()=>{canvas.hidden=true;fallback.hidden=false;status.textContent='Please refresh to load the bear’s reactions.'});
