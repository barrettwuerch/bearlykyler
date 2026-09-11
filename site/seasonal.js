(()=>{
// Viewport-wide atmosphere. Geometry stays independent of the inset content grid.
const hero=document.querySelector('.bear-hero'),scene=hero.querySelector('.seasonal-scene');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');scene.replaceChildren();
let width=1,height=1,time=0,last=0,frame=0,inView=false;
const leaves=Array.from({length:6},(_,i)=>{const el=document.createElement('div'),im=new Image();el.className='fall-leaf';im.src='seasonal/'+(i%2?'oak':'maple')+'.webp';im.alt='';el.append(im);scene.append(el);el.style.width=(i%3===0?90:48+i%2*16)+'px';return{el,im,p:i/6,phase:i*1.7,speed:.023+i%3*.005}});
// On a phone the copy runs the full width of the hero, so a leaf crossing it
// has nowhere to pass except behind the words — and an .88 leaf behind grey
// text is what washes the copy out. Measured from the live layout rather than
// hardcoded, so it survives the headline changing size.
let clear=0;
function size(){width=scene.clientWidth;height=scene.clientHeight;
 const intro=hero.querySelector('.bear-introduction');
 clear=(width<600&&intro)?Math.max(0,intro.getBoundingClientRect().bottom-scene.getBoundingClientRect().top+14):0;
 paint(0)}
function paint(dt){time+=dt;const mobile=width<600;
 const gust=.85+.2*Math.sin(time*.4);
 for(const [i,l] of leaves.entries()){l.p+=dt*l.speed*gust;if(l.p>1)l.p=0;const x=-130+l.p*(width+260);
  // Below the copy on a phone, with the drift damped so a leaf cannot climb
  // back into it. Desktop keeps its original bands and its full drift.
  const span=Math.max(180,height-clear),drift=mobile?.55:1;
  const y=mobile?clear+span*(.14+i%3*.26)+Math.sin(l.p*6+l.phase)*55*drift+Math.sin(time*.7+l.phase)*24*drift
   :height*(.19+i%3*.22)+Math.sin(l.p*6+l.phase)*55+Math.sin(time*.7+l.phase)*24; l.el.style.display=mobile&&i>3?'none':'block';l.el.style.opacity='.88';l.el.style.transform=`translate3d(${x}px,${y}px,0)`;l.im.style.transform=`rotate(${Math.sin(time*.8+l.phase)*35+l.p*90}deg) rotateY(${Math.sin(time+l.phase)*45}deg)`}
}
function tick(now){frame=0;const dt=Math.min(.04,(now-(last||now))/1000);last=now;paint(dt);frame=requestAnimationFrame(tick)}
function sync(){const on=inView&&!document.hidden&&!reduced.matches&&document.body.classList.contains('ready');if(on&&!frame){last=0;frame=requestAnimationFrame(tick)}else if(!on){cancelAnimationFrame(frame);frame=0;last=0}}
new ResizeObserver(size).observe(scene);new IntersectionObserver(e=>{inView=e[0].isIntersecting;sync()}).observe(hero);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);size();

})();
