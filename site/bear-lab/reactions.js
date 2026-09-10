// Continuous local gestures. The torso and face remain anchored.
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export function region(x,y){if(y<-.25&&Math.abs(x)>.18)return x<0?'left':'right';if(y>-.03)return 'head';return 'boop'}
export const duration={left:2.8,right:2.2,smile:1.9,head:1.9,boop:.8};
export function pose(x,y,z,action,t){
 if(!action||t<0||t>=duration[action])return [x,y,z];
 const p=t/duration[action],envelope=smooth(0,.24,p)*(1-smooth(.72,1,p));
 if(action==='right'){
  const weight=smooth(.18,.48,x)*(1-smooth(-.37,-.12,y));
  const angle=(1.20+Math.sin(Math.max(0,p-.24)*Math.PI*8)*.13)*envelope;
  const px=.49,py=-.19,dx=x-px,dy=y-py;
  return [x+(px+dx*Math.cos(angle)-dy*Math.sin(angle)-x)*weight,y+(py+dx*Math.sin(angle)+dy*Math.cos(angle)-y)*weight,z+.045*envelope*weight];
 }
 if(action==='left'){
  const weight=smooth(.12,.43,-x)*(1-smooth(-.30,-.07,y));
  return [x+.07*envelope*weight,y+.15*envelope*weight,z+.05*envelope*weight];
 }
 if(action==='head'||action==='smile'){
  const cx=-.08,cy=.13,dx=x-cx;
  const weight=Math.exp(-Math.pow((y-cy)/.12,2))*Math.exp(-Math.pow(dx/.29,4))*smooth(0,.14,z);
  return [x+dx*.25*envelope*weight,y+.037*envelope*weight*smooth(.035,.18,Math.abs(dx)),z+.012*envelope*weight];
 }
 return [x,y,z];
}
