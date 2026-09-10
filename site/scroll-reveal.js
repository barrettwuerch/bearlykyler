/* Section and card entrance. Arming happens here rather than in the
   stylesheet: if this script never runs, nothing is left invisible. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const targets=[...document.querySelectorAll('[data-reveal]')];
 if(!targets.length)return;
 if(reduced.matches)return;
 for(const el of targets)el.classList.add('reveal-armed');

 // Stagger by position within the element's own row, so a grid lights up
 // left to right instead of all at once — but reset per row, or late cards
 // would wait behind every card above them.
 const show=el=>{
  const row=targets.filter(t=>t.parentElement===el.parentElement&&Math.abs(t.offsetTop-el.offsetTop)<8);
  el.style.transitionDelay=Math.min(row.indexOf(el),4)*70+'ms';
  el.classList.add('reveal-in');
 };
 const watch=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){show(entry.target);watch.unobserve(entry.target)}
 },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
 for(const el of targets)watch.observe(el);

 // Anything already on screen before the opening wave hands over would
 // otherwise reveal behind the loader and be missed.
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const el of targets){el.style.transitionDelay='';el.classList.add('reveal-in')}});
})();
