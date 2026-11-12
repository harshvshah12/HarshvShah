import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const $ = (s, root=document) => root.querySelector(s);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = $("#hero-canvas");
let sceneReady = false;
let renderer, scene, camera, root, particles, particlePositions, ringA, ringB, core;
let pointer = new THREE.Vector2(0,0), smoothPointer = new THREE.Vector2(0,0);
let scrollProgress = 0, raf = 0;

const intro = $("#intro-screen");
const enter = $("#enter-experience");
const skip = $("#skip-intro");
const progress = $("#intro-progress");
const status = $("#intro-status");
const setLoad = (v, label) => { if(progress) progress.style.width = Math.min(100,v)+"%"; if(status) status.textContent=label; };

function initScene(){
  if(!canvas)return false;
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
    renderer.setSize(canvas.clientWidth||innerWidth,canvas.clientHeight||innerHeight,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.1;
    scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x090b10,.027);
    camera=new THREE.PerspectiveCamera(36,(canvas.clientWidth||innerWidth)/(canvas.clientHeight||innerHeight),.1,100);
    camera.position.set(0,1.2,12);root=new THREE.Group();scene.add(root);
    scene.add(new THREE.HemisphereLight(0xbfd8f5,0x111927,1.5));
    const key=new THREE.DirectionalLight(0xd6e7ff,3.2);key.position.set(5,8,7);scene.add(key);
    const blue=new THREE.PointLight(0x6ca9ff,26,28);blue.position.set(-5,1,3);scene.add(blue);
    const rim=new THREE.PointLight(0xdceaff,18,25);rim.position.set(2,4,-7);scene.add(rim);
    // Concentric architectural portal, ribs and a perspective floor grid.
    const archGroup=new THREE.Group();root.add(archGroup);
    const archMat=new THREE.MeshStandardMaterial({color:0x8297b2,metalness:.72,roughness:.3});
    const edgeMat=new THREE.LineBasicMaterial({color:0xc3dafa,transparent:true,opacity:.48});
    function archShape(w,h,r){const sh=new THREE.Shape();sh.moveTo(-w/2,-h/2);sh.lineTo(-w/2,h/2-r);sh.absarc(0,h/2-r,r,Math.PI,0,true);sh.lineTo(w/2,-h/2);sh.closePath();return sh;}
    for(let i=0;i<7;i++){
      const w=5.4-i*.42,h=6.4-i*.36,r=w/2;
      const geo=new THREE.ExtrudeGeometry(archShape(w,h,r),{depth:.16,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:36});
      const mesh=new THREE.Mesh(geo,archMat);mesh.position.z=-i*.52;archGroup.add(mesh);
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMat);edges.position.copy(mesh.position);archGroup.add(edges);
    }
    const beamMat=new THREE.MeshStandardMaterial({color:0x34465e,metalness:.8,roughness:.24});
    for(let i=0;i<11;i++){const beam=new THREE.Mesh(new THREE.BoxGeometry(5.5,.035,.12),beamMat);beam.position.set(0,-2.8+i*.55,-.35);archGroup.add(beam);}
    for(let i=0;i<9;i++){const rib=new THREE.Mesh(new THREE.BoxGeometry(.025,5.7,.035),new THREE.MeshBasicMaterial({color:0x8caed5,transparent:true,opacity:.35}));rib.position.set(-2.5+i*.625,0,-1.1);archGroup.add(rib);}
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0x0d1420,metalness:.3,roughness:.72,side:THREE.DoubleSide}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-3.25;floor.position.z=-1;root.add(floor);
    const grid=new THREE.GridHelper(24,48,0x54749a,0x27384d);grid.position.set(0,-3.22,-1);root.add(grid);
    const orb=new THREE.Group();orb.position.set(0,-.3,1.3);root.add(orb);
    orb.add(new THREE.Mesh(new THREE.SphereGeometry(.34,32,24),new THREE.MeshPhysicalMaterial({color:0xb9d5f6,metalness:.6,roughness:.18,clearcoat:1})));
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.53,.012,8,80),new THREE.MeshBasicMaterial({color:0xa9d0ff,transparent:true,opacity:.8}));halo.rotation.x=.9;orb.add(halo);
    const halo2=new THREE.Mesh(new THREE.TorusGeometry(.68,.008,8,80),new THREE.MeshBasicMaterial({color:0x658bb8,transparent:true,opacity:.5}));halo2.rotation.y=1.1;orb.add(halo2);
    const count=800,positions=new Float32Array(count*3);
    for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*12;positions[i*3+1]=(Math.random()-.5)*8;positions[i*3+2]=(Math.random()-.5)*12-2;}
    const pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(positions,3));
    particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xb8d8ff,size:.018,transparent:true,opacity:.55,depthWrite:false}));root.add(particles);
    scene.userData.arch=archGroup;scene.userData.orb=orb;sceneReady=true;
    const resize=()=>{const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
    new ResizeObserver(resize).observe(canvas);
    window.addEventListener("pointermove",ev=>{pointer.x=(ev.clientX/innerWidth-.5)*2;pointer.y=(ev.clientY/innerHeight-.5)*-2},{passive:true});
    window.addEventListener("scroll",()=>{const max=document.documentElement.scrollHeight-innerHeight;scrollProgress=max>0?scrollY/max:0},{passive:true});
    return true;
  }catch(err){console.warn("3D scene unavailable",err);canvas.style.display="none";return false;}
}
function render(){
  raf=requestAnimationFrame(render);
  if(!renderer||!scene||!camera)return;
  smoothPointer.lerp(pointer,.045);
  const t=performance.now()*.001;
  const desktop=innerWidth>900;
  const targetX=desktop?1.35:0;
  root.position.x+=(targetX-root.position.x)*.035;
  root.position.y+=((desktop?-.05:0)-root.position.y)*.025;
  root.rotation.y+=(smoothPointer.x*.22+scrollProgress*.8-root.rotation.y)*.025;
  root.rotation.x+=(-smoothPointer.y*.16+Math.sin(t*.22)*.035-root.rotation.x)*.025;
  root.scale.setScalar(1-scrollProgress*.16);
  scene.userData.arch.rotation.y=smoothPointer.x*.08+Math.sin(t*.16)*.018;
  scene.userData.orb.position.y=-.3+Math.sin(t*.8)*.12;
  scene.userData.orb.rotation.y=t*.18;
  particles.rotation.y=t*.008;
  camera.position.x+=(smoothPointer.x*.32+(desktop?0.4:0)-camera.position.x)*.025;
  camera.position.y+=(smoothPointer.y*.2-camera.position.y)*.025;
  camera.position.z=12-scrollProgress*1.8;
  camera.lookAt(desktop?.6:0,0,0);
  renderer.render(scene,camera);
}

function setupIntro(){
  if(!intro)return;
  const finish=()=>{
    if(intro.classList.contains("is-leaving"))return;
    intro.classList.add("is-leaving");
    document.body.classList.remove("intro-active");
    setTimeout(()=>intro.remove(),900);
    if(window.gsap&&!reduced){
      window.gsap.fromTo(".hero-copy .eyebrow,.hero-copy h1,.hero-copy .hero-lede,.hero-copy .hero-actions,.hero-copy .hero-readout",{y:35,opacity:0},{y:0,opacity:1,duration:1,stagger:.12,ease:"power3.out",delay:.25});
    }
  };
  enter?.addEventListener("click",finish);
  skip?.addEventListener("click",finish);
  window.addEventListener("keydown",e=>{if(e.key==="Escape"&&intro.isConnected)finish()});
  if(!sceneReady){enter.disabled=false;enter.innerHTML='ENTER EXPERIENCE <span>↗</span>';setLoad(100,"2D FALLBACK READY");return;}
  setLoad(100,"SCENE READY · WEBGL ONLINE");
  enter.disabled=false;enter.innerHTML='ENTER EXPERIENCE <span>↗</span>';
  if(reduced)finish();
}

function setupCarousel(){
  const section=$(".projects-section"),grid=section?.querySelector(".project-grid");
  if(!section||!grid)return;
  const cards=[...section.querySelectorAll(".project-card")];
  const carousel=document.createElement("div");carousel.className="project-carousel";carousel.setAttribute("aria-label","Draggable project carousel");
  const track=document.createElement("div");track.className="project-track";
  cards.forEach(card=>track.appendChild(card));
  carousel.appendChild(track);grid.replaceWith(carousel);
  const controls=document.createElement("div");controls.className="carousel-controls";
  controls.innerHTML='<div class="carousel-count"><strong>01</strong> / '+String(cards.length).padStart(2,"0")+' <span>— DRAG TO EXPLORE</span></div><div class="carousel-arrows"><button type="button" aria-label="Previous projects">←</button><button type="button" aria-label="Next projects">→</button></div>';
  carousel.before(controls);
  const count=$(".carousel-count strong",controls),prev=$("button:first-child",controls),next=$("button:last-child",controls);
  let x=0,startX=0,startTranslate=0,dragging=false,lastX=0,lastTime=0,velocity=0,frame=0;
  const minX=()=>Math.min(0,carousel.clientWidth-track.scrollWidth);
  const setX=(v)=>{x=Math.max(minX(),Math.min(0,v));track.style.transform="translate3d("+x+"px,0,0)";const index=Math.min(cards.length,Math.max(1,Math.round(Math.abs(x)/(cards[0]?.getBoundingClientRect().width+18))+1));if(count)count.textContent=String(index).padStart(2,"0");};
  const stop=()=>cancelAnimationFrame(frame);
  carousel.addEventListener("pointerdown",e=>{
    if(e.target.closest("a,button"))return;
    dragging=true;carousel.classList.add("is-dragging");startX=e.clientX;startTranslate=x;lastX=e.clientX;lastTime=performance.now();velocity=0;stop();carousel.setPointerCapture(e.pointerId);
  });
  carousel.addEventListener("pointermove",e=>{
    if(!dragging)return;
    const now=performance.now(),dx=e.clientX-startX;
    velocity=(e.clientX-lastX)/Math.max(1,now-lastTime)*16;
    lastX=e.clientX;lastTime=now;setX(startTranslate+dx);
  });
  const release=()=>{
    if(!dragging)return;dragging=false;carousel.classList.remove("is-dragging");
    const coast=()=>{velocity*=.92;if(Math.abs(velocity)<.25){stop();return;}setX(x+velocity);frame=requestAnimationFrame(coast)};frame=requestAnimationFrame(coast);
  };
  carousel.addEventListener("pointerup",release);carousel.addEventListener("pointercancel",release);
  prev.addEventListener("click",()=>{const w=(cards[0]?.getBoundingClientRect().width||400)+18;setX(x+w)});
  next.addEventListener("click",()=>{const w=(cards[0]?.getBoundingClientRect().width||400)+18;setX(x-w)});
  window.addEventListener("resize",()=>setX(x));
  setX(0);
}

function setupMotion(){
  const gsap=window.gsap,ST=window.ScrollTrigger;
  if(!gsap||!ST||reduced){
    document.querySelectorAll(".manifesto-line").forEach(line=>{line.style.opacity="1";line.style.transform="none";});
    if(!gsap||!ST) window.addEventListener("load",()=>{ if(window.gsap&&window.ScrollTrigger) setupMotion(); },{once:true});
    return;
  }
  gsap.registerPlugin(ST);
  gsap.utils.toArray(".section-label,.section-heading,.timeline-item,.about-copy,.skills>div,.achievement-grid>div,.contact-inner").forEach(el=>{
    gsap.fromTo(el,{y:32,opacity:0},{y:0,opacity:1,duration:.85,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 88%",once:true}});
  });
  const lines=gsap.utils.toArray(".story-lines p");
  if(lines.length){
    gsap.timeline({scrollTrigger:{trigger:".story-section",start:"top top",end:"+="+(lines.length*300),pin:true,scrub:1,anticipatePin:1}})
      .to(lines,{opacity:1,y:0,stagger:.8,duration:1,ease:"power2.out"})
      .to(lines,{opacity:.2,duration:.6,stagger:.8},.6);
  }
  gsap.utils.toArray(".project-card").forEach((card,i)=>{
    gsap.fromTo(card,{y:30,opacity:0},{y:0,opacity:1,duration:.7,delay:(i%3)*.07,ease:"power3.out",scrollTrigger:{trigger:".projects-section",start:"top 78%",once:true}});
  });
}

const ok=initScene();
if(ok){setLoad(55,"BUILDING GEOMETRY");render();}
setupIntro();
setupCarousel();
setupMotion();
