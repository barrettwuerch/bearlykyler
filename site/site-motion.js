/* Interaction approach adapted from the beui.dev TiltCard
   snippets supplied by the site owner. Vanilla JS adaptation for this site. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),hover=matchMedia('(hover: hover) and (pointer: fine)');
 // Stable outer bounds prevent the moving card from feeding back into its input.
 document.querySelectorAll('.card').forEach(card=>{
  // The tilt demo does its own tilting; nesting this one inside it would
  // compound two rotations driven by the same pointer.
  if(card.querySelector('.t-tilt'))return;
  const surface=card.querySelector('.preview');let x=0,y=0,vx=0,vy=0,tx=0,ty=0,raf=0,last=0;
  const glare=document.createElement('span');glare.className='card-glare';glare.setAttribute('aria-hidden','true');surface.append(glare);
  function tick(now){const dt=Math.min((now-(last||now))/1000,.032)||.016;last=now;
   vx+=(170*(tx-x)-25*vx)*dt;vy+=(170*(ty-y)-25*vy)*dt;x+=vx*dt;y+=vy*dt;
   surface.style.transform=`perspective(1100px) rotateX(${x}deg) rotateY(${y}deg)`;
   if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.015)raf=requestAnimationFrame(tick);else{raf=0;surface.style.transform=tx||ty?surface.style.transform:''}
  }
  function start(){if(!raf){last=0;raf=requestAnimationFrame(tick)}}
  function reset(){tx=ty=0;glare.style.opacity='0';if(reduced.matches||!hover.matches){cancelAnimationFrame(raf);raf=0;x=y=vx=vy=0;surface.style.transform=''}else start()}
  card.addEventListener('pointermove',e=>{if(reduced.matches||!hover.matches||e.pointerType==='touch')return;const b=card.getBoundingClientRect(),px=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),py=Math.max(0,Math.min(1,(e.clientY-b.top)/b.height));tx=(.5-py)*6;ty=(px-.5)*6;glare.style.background=`radial-gradient(circle at ${px*100}% ${py*100}%, #fff8, transparent 65%)`;glare.style.opacity='.18';start()});
  card.addEventListener('pointerleave',reset);card.addEventListener('focusin',reset);reduced.addEventListener('change',reset);hover.addEventListener('change',reset);
 });
})();
