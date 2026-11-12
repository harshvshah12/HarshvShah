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
  if(!canvas) return false;
  try{
    renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.setSize(canvas.clientWidth||innerWidth,canvas.clientHeight||innerHeight,false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070707,.035);
    camera = new THREE.PerspectiveCamera(38,(canvas.clientWidth||innerWidth)/(canvas.clientHeight||innerHeight),.1,100);
    camera.position.set(0,.2,10);
    root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xbac6ad,1.2));
    const key = new THREE.PointLight(0xd5ff7a,38,24); key.position.set(4,4,5); scene.add(key);
    const cool = new THREE.PointLight(0x9d9aff,28,20); cool.position.set(-5,-2,3); scene.add(cool);
    const rim = new THREE.PointLight(0xffffff,18,18); rim.position.set(0,5,-5); scene.add(rim);

    const metal = new THREE.MeshPhysicalMaterial({color:0xb5bd9b,metalness:.82,roughness:.24,clearcoat:.8,clearcoatRoughness:.15});
    const darkMetal = new THREE.MeshPhysicalMaterial({color:0x343b34,metalness:.9,roughness:.28,wireframe:false});
    const glass = new THREE.MeshPhysicalMaterial({color:0x9cff5c,metalness:.35,roughness:.12,transmission:.38,thickness:1.2,transparent:true,opacity:.8,clearcoat:1});
    const wire = new THREE.MeshBasicMaterial({color:0xcaff6c,wireframe:true,transparent:true,opacity:.3});
    core = new THREE.Group(); root.add(core);
    const central = new THREE.Mesh(new THREE.IcosahedronGeometry(1.22,2),glass);
    core.add(central);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.82,1),darkMetal);
    core.add(inner);
    const wireCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,1),wire);
    core.add(wireCore);

    ringA = new THREE.Mesh(new THREE.TorusGeometry(2.0,.018,8,180),new THREE.MeshStandardMaterial({color:0xd5ff7a,metalness:.8,roughness:.25,emissive:0x293d0c,emissiveIntensity:.65}));
    ringA.rotation.set(.9,.3,.2); core.add(ringA);
    ringB = new THREE.Mesh(new THREE.TorusGeometry(2.48,.012,8,180),new THREE.MeshStandardMaterial({color:0xaaa3ff,metalness:.7,roughness:.3,emissive:0x1c1744,emissiveIntensity:.7}));
    ringB.rotation.set(1.8,.6,-.4); core.add(ringB);
    const ringC = new THREE.Mesh(new THREE.TorusGeometry(1.55,.008,6,160),new THREE.MeshBasicMaterial({color:0xe8eee0,transparent:true,opacity:.38}));
    ringC.rotation.set(.1,1.2,.5); core.add(ringC);

    // Mechanical satellite modules: beveled-looking boxes, orbital nodes and connecting struts.
    const satellites = new THREE.Group(); core.add(satellites);
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2, radius=2.85+(i%2)*.28;
      const module=new THREE.Group();
      const block=new THREE.Mesh(new THREE.BoxGeometry(.34,.34,.34),i%2?metal:darkMetal);
      block.rotation.set(.3,.4,.2); module.add(block);
      const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.38,.38,.38)),new THREE.LineBasicMaterial({color:i%2?0xd8ff91:0xb5aaff,transparent:true,opacity:.7}));
      module.add(edge);
      module.position.set(Math.cos(a)*radius,Math.sin(a)*radius*.7,Math.sin(a*2)*.45);
      module.lookAt(0,0,0); satellites.add(module);
      const rod=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,radius-1.4,6),new THREE.MeshBasicMaterial({color:0x9ba28b,transparent:true,opacity:.36}));
      rod.position.copy(module.position).multiplyScalar(.5); rod.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),module.position.clone().normalize()); satellites.add(rod);
    }

    // Fine particle field around the sculpture.
    const count=950;
    particlePositions=new Float32Array(count*3);
    const colors=new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const r=3.2+Math.random()*4.5, a=Math.random()*Math.PI*2, y=(Math.random()-.5)*5;
      particlePositions[i*3]=Math.cos(a)*r;
      particlePositions[i*3+1]=y;
      particlePositions[i*3+2]=Math.sin(a)*r-1.5;
      const t=Math.random();
      colors[i*3]=.62+t*.3;colors[i*3+1]=.72+t*.26;colors[i*3+2]=.38+t*.25;
    }
    const pg=new THREE.BufferGeometry();
    pg.setAttribute("position",new THREE.BufferAttribute(particlePositions,3));
    pg.setAttribute("color",new THREE.BufferAttribute(colors,3));
    particles=new THREE.Points(pg,new THREE.PointsMaterial({size:.022,vertexColors:true,transparent:true,opacity:.76,sizeAttenuation:true,depthWrite:false}));
    scene.add(particles);

    // A secondary floating wireframe form gives the scene depth and a less mechanical silhouette.
    const ghost=new THREE.Mesh(new THREE.DodecahedronGeometry(.58,1),new THREE.MeshBasicMaterial({color:0xb7a6ff,wireframe:true,transparent:true,opacity:.28}));
    ghost.position.set(-3.6,1.3,-1.2); root.add(ghost);
    const ghost2=new THREE.Mesh(new THREE.OctahedronGeometry(.42,1),new THREE.MeshBasicMaterial({color:0xd5ff7a,wireframe:true,transparent:true,opacity:.32}));
    ghost2.position.set(3.6,-1.2,.4); root.add(ghost2);

    const resize=()=>{
      if(!renderer||!camera)return;
      const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas);
    window.addEventListener("pointermove",e=>{
      pointer.x=(e.clientX/innerWidth-.5)*2;
      pointer.y=(e.clientY/innerHeight-.5)*-2;
    },{passive:true});
    window.addEventListener("scroll",()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      scrollProgress=max>0?scrollY/max:0;
    },{passive:true});
    scene.userData.satellites=satellites;
    scene.userData.ghost=ghost;
    scene.userData.ghost2=ghost2;
    sceneReady=true;
    return true;
  }catch(err){
    console.warn("3D scene unavailable; using CSS fallback.",err);
    canvas.style.display="none";
    return false;
  }
}

function render(){
  raf=requestAnimationFrame(render);
  if(!renderer||!scene||!camera)return;
  smoothPointer.lerp(pointer,.045);
  const t=performance.now()*.001;
  const desktop=innerWidth>900;
  const targetX=desktop?2.15:0;
  root.position.x+=(targetX-root.position.x)*.035;
  root.position.y+=((desktop?-.05:0)-root.position.y)*.025;
  root.rotation.y+=(smoothPointer.x*.22+scrollProgress*.8-root.rotation.y)*.025;
  root.rotation.x+=(-smoothPointer.y*.16+Math.sin(t*.22)*.035-root.rotation.x)*.025;
  root.scale.setScalar(1-scrollProgress*.16);
  core.rotation.y=t*.12+smoothPointer.x*.08;
  core.rotation.z=Math.sin(t*.18)*.08;
  ringA.rotation.z=t*.12;ringB.rotation.y=t*.1;ringB.rotation.z=-t*.07;
  scene.userData.satellites.rotation.y=-t*.08;
  scene.userData.ghost.rotation.x=t*.16;scene.userData.ghost.rotation.y=-t*.12;
  scene.userData.ghost2.rotation.x=-t*.18;scene.userData.ghost2.rotation.y=t*.14;
  particles.rotation.y=t*.012;
  camera.position.x+=(smoothPointer.x*.32+(desktop?0.4:0)-camera.position.x)*.025;
  camera.position.y+=(smoothPointer.y*.2-camera.position.y)*.025;
  camera.position.z=10+scrollProgress*1.8;
  camera.lookAt(desktop?1.2:0,0,0);
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
  const lines=gsap.utils.toArray(".manifesto-line");
  if(lines.length){
    const tl=gsap.timeline({scrollTrigger:{trigger:".manifesto",start:"top top",end:"+="+(lines.length*360),pin:true,scrub:1,anticipatePin:1}});
    lines.forEach((line,i)=>{tl.to(line,{opacity:1,y:0,duration:1,ease:"power2.out"},i*.85).to(line,{opacity:.2,duration:.6},i*.85+.65)});
    tl.to(".manifesto-orbit",{rotation:180,scale:1.25,duration:lines.length*1.2,ease:"none"},0);
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
