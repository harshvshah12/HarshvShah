document.addEventListener("DOMContentLoaded",()=>{
 const navLinks=[...document.querySelectorAll(".nav a")],sections=[...document.querySelectorAll("main section[id]")],progress=document.querySelector("#scroll-progress");
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const updateProgress=()=>{if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+"%"}};
 window.addEventListener("scroll",updateProgress,{passive:true});updateProgress();
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{const target=document.querySelector(a.getAttribute("href"));if(target){e.preventDefault();target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})}}));
 if("IntersectionObserver" in window){
  const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id))}),{rootMargin:"-35% 0px -55% 0px"});
  sections.forEach(s=>navObserver.observe(s));
  const revealTargets=document.querySelectorAll(".origin-heading,.origin-copy,.experience-strip article,.mission-card,.archive-grid a,.power-card,.contact-grid>div");
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target)}}),{threshold:.08,rootMargin:"0px 0px -5% 0px"});
  revealTargets.forEach((el,i)=>{el.classList.add("js-reveal");el.style.transitionDelay=Math.min(i%4*70,210)+"ms";revealObserver.observe(el)});
  const lines=[...document.querySelectorAll(".alter-line")];
  const lineObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("is-active")}),{threshold:.55});
  lines.forEach(line=>lineObserver.observe(line));
 }else{document.querySelectorAll(".alter-line").forEach(el=>el.classList.add("is-active"))}
 const cards=document.querySelectorAll(".mission-card");
 if(!reduce&&window.matchMedia("(pointer:fine)").matches){
  cards.forEach(card=>{const visual=card.querySelector(".mission-visual");if(!visual)return;
   visual.addEventListener("pointermove",e=>{const r=visual.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;visual.style.transform="perspective(900px) rotateX("+(-y*2.2)+"deg) rotateY("+(x*2.5)+"deg) translateY(-3px)";visual.style.setProperty("--mx",(x+.5)*100+"%");visual.style.setProperty("--my",(y+.5)*100+"%")});
   visual.addEventListener("pointerleave",()=>visual.style.transform="");
  });
  const dot=document.querySelector(".cursor-dot"),ring=document.querySelector(".cursor-ring");let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;
  if(dot&&ring){dot.style.opacity="1";ring.style.opacity="1";window.addEventListener("pointermove",e=>{x=e.clientX;y=e.clientY;dot.style.left=x+"px";dot.style.top=y+"px";const el=document.elementFromPoint(x,y);ring.classList.toggle("is-hover",!!(el&&el.closest("a,button,.mission-visual")))});
   const loop=()=>{rx+=(x-rx)*.18;ry+=(y-ry)*.18;ring.style.left=rx+"px";ring.style.top=ry+"px";requestAnimationFrame(loop)};loop();
  }
 }else{document.querySelector(".cursor-dot")?.remove();document.querySelector(".cursor-ring")?.remove()}
 document.querySelectorAll(".power-card").forEach(card=>{card.addEventListener("pointerenter",()=>{document.querySelectorAll(".power-card").forEach(c=>c.classList.remove("is-active"));card.classList.add("is-active")});card.addEventListener("focusin",()=>{document.querySelectorAll(".power-card").forEach(c=>c.classList.remove("is-active"));card.classList.add("is-active")})});
});