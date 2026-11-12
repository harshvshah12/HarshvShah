import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";
const $=(s,r=document)=>r.querySelector(s);
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas=$("#hero-canvas"),intro=$("#intro-screen"),enter=$("#enter-experience"),skip=$("#skip-intro");
const progress=$("#intro-progress"),status=$("#intro-status"),meter=$("#suit-meter"),percent=$("#suit-percent"),state=$("#suit-state");
let renderer,scene,camera,root,parts=[],ring,particles,mouse=new THREE.Vector2(),smoothMouse=new THREE.Vector2(),scrollValue=0,raf=0,ready=false;
const setLoad=(n,t)=>{if(progress)progress.style.width=n+"%";if(status)status.textContent=t};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function material(color,metalness=.65,roughness=.28,emissive=0x000000){return new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:.45})}
function addPart(geometry,mat,end,start,rotation=[0,0,0],startRotation=[0,0,0]){
 const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(...start);mesh.rotation.set(...startRotation);mesh.userData={end:new THREE.Vector3(...end),start:new THREE.Vector3(...start),endRotation:new THREE.Euler(...rotation),startRotation:new THREE.Euler(...startRotation)};root.add(mesh);parts.push(mesh);return mesh;
}
function buildSuit(){
 const steel=material(0x84928a,.82,.22),dark=material(0x26312b,.78,.3),light=material(0xd1d9c8,.72,.2),acid=material(0xc9f36a,.6,.2,0x7ea72e);
 const glow=new THREE.MeshBasicMaterial({color:0xc9f36a});
 // The assembly starts as separated components and locks together as the page scrolls.
 addPart(new THREE.DodecahedronGeometry(.55,1),light,[0,2.25,0],[-4,3,-2],[0,.12,0],[1.2,1.5,1]);
 addPart(new THREE.BoxGeometry(1.55,1.55,.68),steel,[0,.65,0],[3,2,-3],[0,0,0],[.7,1.2,.4]);
 addPart(new THREE.OctahedronGeometry(.42,1),acid,[0,.72,.43],[-3,-1,2],[0,0,0],[2,0,1]);
 addPart(new THREE.BoxGeometry(.82,.72,.68),dark,[0,-.55,0],[3,-3,-2],[0,0,0],[1,1,0]);
 // Shoulders
 addPart(new THREE.SphereGeometry(.48,24,18),light,[-1.02,1.2,0],[-4,1,1],[0,0,-.12],[1,0,1]);
 addPart(new THREE.SphereGeometry(.48,24,18),light,[1.02,1.2,0],[4,1,-1],[0,0,.12],[0,1,0]);
 // Upper arms and forearms
 addPart(new THREE.CylinderGeometry(.24,.31,.95,12),steel,[-1.22,.35,0],[-4,-1,1],[0,0,-.18],[1,0,1]);
 addPart(new THREE.CylinderGeometry(.24,.31,.95,12),steel,[1.22,.35,0],[4,-1,-1],[0,0,.18],[0,1,0]);
 addPart(new THREE.CylinderGeometry(.2,.25,.88,12),dark,[-1.3,-.62,.02],[-3,-3,2],[0,0,-.08],[1,1,0]);
 addPart(new THREE.CylinderGeometry(.2,.25,.88,12),dark,[1.3,-.62,.02],[3,-3,-2],[0,0,.08],[0,1,1]);
 // Hip and legs
 addPart(new THREE.BoxGeometry(.58,.45,.58),steel,[-.38,-1.2,0],[-2,-4,1],[0,0,-.04],[1,1,0]);
 addPart(new THREE.BoxGeometry(.58,.45,.58),steel,[.38,-1.2,0],[2,-4,-1],[0,0,.04],[0,1,1]);
 addPart(new THREE.CylinderGeometry(.28,.34,1.05,12),light,[-.4,-1.95,0],[-2,-5,2],[0,0,-.02],[1,0,0]);
 addPart(new THREE.CylinderGeometry(.28,.34,1.05,12),light,[.4,-1.95,0],[2,-5,-2],[0,0,.02],[0,1,0]);
 addPart(new THREE.BoxGeometry(.48,.52,.78),dark,[-.4,-2.7,.12],[-3,-6,1],[0,0,0],[1,1,0]);
 addPart(new THREE.BoxGeometry(.48,.52,.78),dark,[.4,-2.7,.12],[3,-6,-1],[0,0,0],[0,1,1]);
 // Accent seams and chest reactor
 const reactor=new THREE.Mesh(new THREE.TorusGeometry(.22,.035,10,48),glow);reactor.position.set(0,.72,.38);root.add(reactor);
 const reactorCore=new THREE.Mesh(new THREE.SphereGeometry(.13,24,16),glow);reactorCore.position.set(0,.72,.4);root.add(reactorCore);
 const spine=new THREE.Mesh(new THREE.BoxGeometry(.035,2.6,.04),glow);spine.position.set(0,.1,-.36);root.add(spine);
 const shoulderRing=new THREE.Mesh(new THREE.TorusGeometry(1.55,.012,6,100),new THREE.MeshBasicMaterial({color:0x8da98a,transparent:true,opacity:.55}));shoulderRing.position.y=.1;shoulderRing.rotation.x=Math.PI/2.3;root.add(shoulderRing);ring=shoulderRing;
}
function init(){
 if(!canvas)return false;
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(canvas.clientWidth||innerWidth,canvas.clientHeight||innerHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x090b0a,.035);
  camera=new THREE.PerspectiveCamera(34,(canvas.clientWidth||innerWidth)/(canvas.clientHeight||innerHeight),.1,100);camera.position.set(0,.1,11);
  root=new THREE.Group();root.position.set(.1,-.05,0);scene.add(root);
  scene.add(new THREE.HemisphereLight(0xd7e7c8,0x111a12,1.7));
  const key=new THREE.DirectionalLight(0xe4efdb,3.2);key.position.set(4,7,7);scene.add(key);
  const rim=new THREE.PointLight(0xc9f36a,22,22);rim.position.set(-4,1,3);scene.add(rim);
  const fill=new THREE.PointLight(0x9db5c7,14,20);fill.position.set(4,-2,-4);scene.add(fill);
  buildSuit();
  const count=750,pos=new Float32Array(count*3);for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*12;pos[i*3+1]=(Math.random()-.5)*9;pos[i*3+2]=(Math.random()-.5)*10-2}
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc9f36a,size:.018,transparent:true,opacity:.45,depthWrite:false}));scene.add(particles);
  const resize=()=>{const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(canvas);
  window.addEventListener("pointermove",e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*-2},{passive:true});
  window.addEventListener("scroll",()=>{scrollValue=clamp(scrollY/(innerHeight*1.45),0,1)},{passive:true});
  ready=true;return true;
 }catch(e){console.warn("3D suit unavailable; using visual fallback",e);canvas.style.display="none";return false}
}
function animate(){
 raf=requestAnimationFrame(animate);if(!renderer||!scene||!camera)return;
 const t=performance.now()*.001,ease=scrollValue*scrollValue*(3-2*scrollValue);
 smoothMouse.lerp(mouse,.04);
 parts.forEach((p,i)=>{
  const u=p.userData,spread=1-ease;
  p.position.lerpVectors(u.start,u.end,ease);
  p.rotation.x=u.startRotation.x*spread+u.endRotation.x*ease+Math.sin(t*.45+i)*.018*spread;
  p.rotation.y=u.startRotation.y*spread+u.endRotation.y*ease+Math.cos(t*.38+i)*.02*spread;
  p.rotation.z=u.startRotation.z*spread+u.endRotation.z*ease;
 });
 root.rotation.y+=(smoothMouse.x*.18+Math.sin(t*.22)*.035-root.rotation.y)*.035;
 root.rotation.x+=(-smoothMouse.y*.1-root.rotation.x)*.035;
 root.position.y=-.05+Math.sin(t*.7)*.045;
 root.scale.setScalar(1+ease*.035);
 if(ring){ring.rotation.z=t*.12;ring.rotation.x=Math.PI/2.3+smoothMouse.y*.12}
 particles.rotation.y=t*.006;particles.rotation.x=smoothMouse.y*.04;
 camera.position.x+=(smoothMouse.x*.25-camera.position.x)*.025;
 camera.position.y+=(.1+smoothMouse.y*.16-camera.position.y)*.025;
 camera.lookAt(0,-.1,0);renderer.render(scene,camera);
 const pct=Math.round(ease*100);if(percent)percent.textContent=String(pct).padStart(3,"0")+"%";if(meter)meter.style.width=pct+"%";
 if(state)state.textContent=pct<18?"CIVILIAN":pct<92?"TRANSFORMING":"SUITED";
}
function setupIntro(){
 const finish=()=>{if(!intro||intro.classList.contains("is-leaving"))return;intro.classList.add("is-leaving");document.body.classList.remove("intro-active");setTimeout(()=>intro.remove(),850)};
 enter?.addEventListener("click",finish);skip?.addEventListener("click",finish);window.addEventListener("keydown",e=>{if(e.key==="Escape"&&intro?.isConnected)finish()});
 if(!ready){setLoad(100,"2D FALLBACK READY");if(enter){enter.disabled=false;enter.innerHTML='ENTER EXPERIENCE <span>↗</span>'}return}
 setLoad(100,"SUIT SYSTEM ONLINE");if(enter){enter.disabled=false;enter.innerHTML='ENTER EXPERIENCE <span>↗</span>'}
 if(reduced)finish();
}
if(init()){setLoad(55,"ASSEMBLING SUIT GEOMETRY");animate()}setupIntro();
