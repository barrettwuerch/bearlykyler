
const video=document.querySelector('.loader video'),loader=document.querySelector('.loader'),page=document.querySelector('.page'),motion=matchMedia('(prefers-reduced-motion: reduce)');
let finished=false,frame=0,hideTimer=0;
function reveal(){if(finished)return;finished=true;cancelAnimationFrame(frame);document.body.classList.add('ready');page.inert=false;page.removeAttribute('aria-hidden');loader.setAttribute('aria-hidden','true');hideTimer=setTimeout(()=>{loader.hidden=true;video.pause()},motion.matches?0:460)}
// Reveal after the welcoming wave settles at 1.5 seconds.
function check(){if(finished)return;if(video.currentTime>=1.5){reveal();return}frame=requestAnimationFrame(check)}
function start(){cancelAnimationFrame(frame);if(motion.matches){reveal();return}video.play().then(check).catch(reveal)}
video.addEventListener('loadedmetadata',start);video.addEventListener('ended',reveal);video.addEventListener('error',reveal);video.querySelector('source').addEventListener('error',reveal);
motion.addEventListener('change',()=>{if(motion.matches)reveal()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();cancelAnimationFrame(frame)}else if(!finished)start()});
document.querySelector('#replay').addEventListener('click',()=>{clearTimeout(hideTimer);finished=false;loader.hidden=false;loader.removeAttribute('aria-hidden');document.body.classList.remove('ready');page.inert=true;page.setAttribute('aria-hidden','true');video.currentTime=0;start()});
if(video.readyState>=1)start();
