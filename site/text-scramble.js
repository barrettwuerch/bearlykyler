/* Character-scramble reveal. Effect inspired by the beui.dev TextScramble
   snippet supplied by the site owner; written independently for this site,
   in the same spirit as the TiltCard adaptation in site-motion.js.

   Differences from the reference behaviour: characters settle on scattered
   per-character deadlines rather than strictly left to right, punctuation
   holds still while only letters and digits churn, the reveal is driven by
   the viewport instead of a component re-render, and the final text reserves
   its own box so the line never reflows mid-animation. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Deliberately excludes I, O, 0 and 1: near-identical shapes read as a
 // stalled animation rather than a churning one.
 const GLYPHS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789*+=/\\<>~';
 const churn=/[A-Za-z0-9]/;

 for(const el of document.querySelectorAll('[data-scramble]')){
  // Text-only elements: anything with child markup would lose it.
  if(el.firstElementChild)continue;
  const text=el.textContent;if(!text.trim())continue;
  const glyphs=el.dataset.scrambleGlyphs||GLYPHS;
  const span=t=>{const s=document.createElement('span');s.textContent=t;return s};

  const size=span(text);size.className='scramble-size';size.setAttribute('aria-hidden','true');
  const ink=span(text);ink.className='scramble-ink';ink.setAttribute('aria-hidden','true');
  const sr=span(text);sr.className='scramble-sr';

  // Per-character deadlines: biased left to right, scattered enough that the
  // resolve front reads as organic rather than as a wipe.
  const chars=[...text];
  const span_=chars.length||1;
  const duration=+el.dataset.scrambleDuration||Math.min(1100,Math.max(500,span_*45));
  let deadlines=[],frame=0,rolled=0,started=false;

  function settle(){cancelAnimationFrame(frame);frame=0;ink.textContent=text}

  function tick(now,startedAt){
   const elapsed=now-startedAt;
   if(now-rolled>=45){
    rolled=now;
    ink.textContent=chars.map((c,i)=>{
     if(elapsed>=deadlines[i]||!churn.test(c))return c;
     const g=glyphs[Math.random()*glyphs.length|0];
     // Match the original's case so the word keeps its silhouette while it churns.
     return c>='a'&&c<='z'?g.toLowerCase():g;
    }).join('');
   }
   if(elapsed<duration)frame=requestAnimationFrame(t=>tick(t,startedAt));else settle();
  }

  function run(){
   if(started||reduced.matches)return;started=true;
   deadlines=chars.map((_,i)=>duration*(.1+.9*(i/span_*.55+Math.random()*.45)));
   const startedAt=performance.now();rolled=0;
   frame=requestAnimationFrame(t=>tick(t,startedAt));
  }

  if(reduced.matches)continue;
  el.replaceChildren(size,ink,sr);el.classList.add('scramble');

  // Hold until the opening wave has handed over, then reveal on approach.
  const watch=new IntersectionObserver(e=>{
   if(!e[0].isIntersecting||!document.body.classList.contains('ready'))return;
   watch.disconnect();run();
  },{threshold:.4});
  watch.observe(el);
  new MutationObserver((_,m)=>{
   if(!document.body.classList.contains('ready'))return;
   m.disconnect();watch.unobserve(el);watch.observe(el);
  }).observe(document.body,{attributes:true,attributeFilter:['class']});

  // A tab switch mid-animation would otherwise resume into a frozen frame.
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame)settle()});
  reduced.addEventListener('change',()=>{if(reduced.matches)settle()});
 }
})();
