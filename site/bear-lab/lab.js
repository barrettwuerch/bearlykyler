import * as THREE from './three.module.js';
import {region,pose,duration} from './reactions.js';
const stage=document.querySelector('#stage'),status=document.querySelector('#status'),fallback=document.querySelector('#fallback');
const boopButton=document.querySelector('#boop'),turnButton=document.querySelector('#turn');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
try {
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.setClearColor(0xfaf9f6,0);stage.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.5,1.5,1.5,-1.5,.1,20);camera.position.set(0,0,5);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0xd4bc97,2.3));const key=new THREE.DirectionalLight(0xfff4e3,2.1);key.position.set(-3,5,5);scene.add(key);const fill=new THREE.DirectionalLight(0xd7e3ff,.65);fill.position.set(4,1,2);scene.add(fill);
 const response=await fetch(new URL('./bear.json',import.meta.url));if(!response.ok)throw Error('Model unavailable');const data=await response.json();
 const texture=await new THREE.TextureLoader().loadAsync(new URL('./texture.png',import.meta.url).href);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const geometry=new THREE.BufferGeometry();const rest=new Float32Array(data.positions);const positions=new Float32Array(rest);geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(data.uv,2));geometry.setIndex(data.indices);geometry.addGroup(0,data.frontCount,0);geometry.addGroup(data.frontCount,data.indices.length-data.frontCount,1);geometry.computeVertexNormals();geometry.computeBoundingSphere();
 const front=new THREE.MeshStandardMaterial({map:texture,roughness:.48,metalness:0});const back=new THREE.MeshStandardMaterial({color:0xffefd5,roughness:.48});const bear=new THREE.Mesh(geometry,[front,back]);scene.add(bear);
 // Honey is a separate prop, animated continuously with the supporting paw.
 const honeySource=await new THREE.TextureLoader().loadAsync(new URL('../bear-story/honey-low.png',import.meta.url).href);
 const propCanvas=document.createElement('canvas');propCanvas.width=108;propCanvas.height=118;
 const pc=propCanvas.getContext('2d');pc.beginPath();pc.moveTo(14,6);pc.bezierCurveTo(33,0,79,0,87,7);pc.lineTo(87,25);pc.bezierCurveTo(107,48,107,89,87,105);pc.bezierCurveTo(59,115,17,114,7,96);pc.lineTo(20,72);pc.lineTo(23,47);pc.lineTo(13,27);pc.closePath();pc.clip();pc.drawImage(honeySource.image,151,277,94,110,7,4,94,110);
 const propTexture=new THREE.CanvasTexture(propCanvas);propTexture.colorSpace=THREE.SRGBColorSpace;
 const jar=new THREE.Sprite(new THREE.SpriteMaterial({map:propTexture,transparent:true,depthTest:false}));jar.scale.set(.40,.44,1);jar.visible=false;jar.renderOrder=3;bear.add(jar);
 // A separate undeformed picking surface avoids feedback between deformation and pointer depth.
 const pick=new THREE.Mesh(geometry.clone(),new THREE.MeshBasicMaterial());const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(10,10);const contact=new THREE.Vector3();let hovering=false,pressed=false,angle=0,desiredAngle=0,frame=0,last=0,active=true,pulse=0,remaining=1;
 const offsets=new Float32Array(rest.length/3),velocities=new Float32Array(offsets.length);let tiltX=0,tiltY=0;let action=null,actionTime=0;
 function react(kind){if(action)return;status.textContent=({left:'A little honey.',right:'Hello!',smile:'Happy to see you.',head:'Happy to see you.',boop:'Boop!'})[kind];if(reduced.matches){setTimeout(()=>status.textContent='',1000);return}action=kind;actionTime=0;if(kind==='boop')pulse=.16;wake()} 
 const controls=[['right','Wave hello',53,54,44,41],['left','Bring out honey',3,54,44,41],['head','Give a happy smile',18,5,64,49]];
 for(const [kind,label,x,y,w,h] of controls){const button=document.createElement('button');button.type='button';button.className='bear-hit';button.setAttribute('aria-label',label);Object.assign(button.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',e=>{e.stopPropagation();react(kind)});stage.append(button);button.dataset.region=kind}
 stage.setAttribute('role','group');stage.setAttribute('aria-label','Interactive bear. Click a paw or his head.');
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);const aspect=w/h;const extent=Math.max(1.08,1.02/aspect);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();
 const boxes={right:[.18,-.90,.94,-.25],left:[-.94,-.90,-.18,-.25],head:[-.72,-.03,.72,.89]};
 for(const button of stage.querySelectorAll('.bear-hit')){const [x0,y0,x1,y1]=boxes[button.dataset.region];Object.assign(button.style,{left:((x0-camera.left)/(camera.right-camera.left)*w)+'px',top:((camera.top-y1)/(camera.top-camera.bottom)*h)+'px',width:((x1-x0)/(camera.right-camera.left)*w)+'px',height:((y1-y0)/(camera.top-camera.bottom)*h)+'px'})}wake()}
 function locate(e){const r=stage.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);pick.rotation.copy(bear.rotation);pick.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(pick)[0];hovering=!!hit;if(hit)contact.copy(pick.worldToLocal(hit.point));wake()}
 function wake(){remaining=2;if(!frame&&active)frame=requestAnimationFrame(tick)}
 stage.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||pressed)locate(e)});
 stage.addEventListener('pointerdown',e=>{pressed=true;locate(e);if(hovering){react(region(contact.x,contact.y));stage.setPointerCapture(e.pointerId)}});
 function release(){pressed=false;hovering=false;wake()}
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('pointerleave',()=>{if(!pressed)release()});
 function boop(){if(reduced.matches){status.textContent='Boop!';setTimeout(()=>status.textContent='',900);return}contact.set(-.08,.29,.35);hovering=false;react('smile')}
 boopButton?.addEventListener('click',boop);stage.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();boop()}else if(e.code==='ArrowLeft'){e.preventDefault();react('left')}else if(e.code==='ArrowRight'){e.preventDefault();react('right')}else if(e.code==='ArrowUp'){e.preventDefault();react('head')}});
 turnButton?.addEventListener('click',()=>{const on=turnButton.getAttribute('aria-pressed')!=='true';turnButton.setAttribute('aria-pressed',String(on));desiredAngle=on?.75:0;wake()});
 function tick(now){frame=0;if(!active)return;const dt=Math.min((now-(last||now-16))/1000,.025);last=now;const ease=1-Math.exp(-dt*10);angle+= (desiredAngle-angle)*(reduced.matches?1:ease);tiltX+=((hovering?-pointer.y*.045:0)-tiltX)*ease;tiltY+=((hovering?pointer.x*.06:0)-tiltY)*ease;bear.rotation.set(reduced.matches?0:tiltX,angle+(reduced.matches?0:tiltY),0);
 if(action){actionTime+=dt;if(actionTime>=duration[action]){action=null;status.textContent=''}}
 const hp=action==='left'?actionTime/duration.left:0;
 const he=hp?Math.min(1,hp/.24)*(1-Math.max(0,(hp-.72)/.28)):0;
 const easeHoney=he*he*(3-2*he);
 jar.visible=he>0;jar.position.set(-.35,-.87+.39*easeHoney,.6);jar.material.opacity=Math.min(1,he*4);jar.material.rotation=-.08*easeHoney;

 let energy=0;const strength=reduced.matches?0:((hovering&&!action?(pressed?.12:.055):0)+pulse);pulse*=Math.exp(-dt*8);
 for(let i=0;i<offsets.length;i++){const j=i*3,x=rest[j],y=rest[j+1],z=rest[j+2];const dx=x-contact.x,dy=y-contact.y;const radius=.23;const gaussian=Math.exp(-(dx*dx+dy*dy)/(2*radius*radius));const frontWeight=Math.max(0,Math.min(1,z/.10));const target=-strength*gaussian*frontWeight;
 velocities[i]+=(210*(target-offsets[i])-18*velocities[i])*dt;offsets[i]+=velocities[i]*dt;if(reduced.matches){offsets[i]=0;velocities[i]=0}const posed=pose(x,y,z,action,actionTime);positions[j]=posed[0];positions[j+1]=posed[1];positions[j+2]=posed[2]+offsets[i];energy+=Math.abs(offsets[i])+Math.abs(velocities[i])*.1;
 }
 geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();renderer.render(scene,camera);remaining-=dt;if(action||hovering||remaining>0||energy>.01||Math.abs(angle-desiredAngle)>.0001)frame=requestAnimationFrame(tick);else last=0;
 }
 document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(!active){cancelAnimationFrame(frame);frame=0;last=0}else wake()});reduced.addEventListener('change',()=>{action=null;status.textContent='';wake()});new ResizeObserver(resize).observe(stage);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);fallback.hidden=false;status.textContent='The 3D view paused. Reload to try again.'});
 fallback.hidden=true;status.textContent='';if(boopButton)boopButton.disabled=false;if(turnButton)turnButton.disabled=false;resize();
} catch(error){console.error(error);status.textContent='The 3D view couldn’t load. Please try a browser with WebGL enabled.';fallback.hidden=false;}
