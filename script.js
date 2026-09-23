document.addEventListener("DOMContentLoaded",()=>{const links=[...document.querySelectorAll(".nav a")],sections=[...document.querySelectorAll("section[id]")],progress=document.querySelector("#scroll-progress");const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id))}),{rootMargin:"-35% 0px -55% 0px"});sections.forEach(s=>io.observe(s));document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{const el=document.querySelector(a.getAttribute("href"));if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth",block:"start"})}}));window.addEventListener("scroll",()=>{if(progress){const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h>0?scrollY/h*100:0)+"%"}});

const terminal=document.querySelector("#portfolio-terminal"),input=document.querySelector("#terminal-input"),output=document.querySelector("#terminal-output");if(terminal&&input&&output){const commands={help:"Available: help, about, skills, projects, experience, education, achievements, contact, github, linkedin, clear",about:"Harsh Vipul Shah, 3rd year B.Tech CSE (AI & DS) at MIT-WPU. Focused on AI/ML, data analytics and software development.",skills:"Python, C, SQL, HTML · ML, Deep Learning, Computer Vision · Power BI, Tableau · React, Next.js, FastAPI, Streamlit, Firebase, Supabase · Git, GitHub, Apryse WebViewer, Tkinter, Playwright",projects:"Vegapod 3D Portal, Deepfake Sentinel, 4SOHA / Musically, ConnectSphere, ParkSense, Dynamic Hotel Pricing, ESP32-CAM Gesture Recognition, Maze Algorithm Visualizer.",experience:"Vegapod Hyperloop: Business Associate. Linde Engineering: Data Analysis Intern. Synapse AI Club: Organizing Team Member.",education:"B.Tech CSE (AI & DS), MIT World Peace University, Pune, 2024–2028 · CGPA 8.2/10.",achievements:"EHW 2026: #8 globally, top Outreach & Showcasing nominees, Upcoming Engineering Innovation Award. iQOO Hackathon: team rank 22/1500+. Pinnacle Coding: Round 2. SciQuest: Project Excellence.",contact:"harshvshah2019@gmail.com · LinkedIn: linkedin.com/in/harsh-vipul-shah/ · GitHub: github.com/harshvshah12",github:"https://github.com/harshvshah12",linkedin:"https://www.linkedin.com/in/harsh-vipul-shah/"};const run=v=>{const cmd=v.trim().toLowerCase();if(!cmd)return;if(cmd==="clear"){output.innerHTML="";input.value="";return}const wrap=document.createElement("div"),ans=commands[cmd];wrap.innerHTML='<p class="cmd"><i>›</i> '+v+'</p><p class="answer">'+(ans||'Command not found. Type <span class="link">help</span> to see available commands.')+"</p>";output.appendChild(wrap);output.scrollTop=output.scrollHeight;if((cmd==="github"||cmd==="linkedin")&&ans)window.open(ans,"_blank","noopener,noreferrer");input.value=""};input.addEventListener("keydown",e=>{if(e.key==="Enter")run(input.value)});terminal.addEventListener("click",()=>input.focus())}

document.querySelectorAll(".tilt").forEach(card=>{card.addEventListener("pointermove",e=>{if(matchMedia("(max-width:900px)").matches)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform="perspective(1000px) rotateX("+(-y*2.5)+"deg) rotateY("+(x*3)+"deg) translateY(-7px)"});card.addEventListener("pointerleave",()=>card.style.transform="")});

// Personal interaction layer: custom cursor, pointer-driven depth, project spotlights and scroll choreography.
const cursorDot=document.querySelector(".cursor-dot"),cursorRing=document.querySelector(".cursor-ring"),heroStage=document.querySelector(".hero-3d-stage");
let mouseX=window.innerWidth/2,mouseY=window.innerHeight/2,ringX=mouseX,ringY=mouseY;
if(cursorDot&&cursorRing&&window.matchMedia("(pointer:fine)").matches){
  cursorDot.style.opacity="1"; cursorRing.style.opacity="1";
  window.addEventListener("pointermove",e=>{
    mouseX=e.clientX; mouseY=e.clientY;
    cursorDot.style.left=mouseX+"px"; cursorDot.style.top=mouseY+"px";
    const el=document.elementFromPoint(e.clientX,e.clientY);
    const hot=el&&el.closest("a,button,input,.project-card");
    cursorRing.classList.toggle("is-hover",!!hot);
    cursorRing.classList.toggle("is-project",!!(el&&el.closest(".project-card")));
    const card=el&&el.closest(".project-card");
    if(card){const r=card.getBoundingClientRect();card.style.setProperty("--mx",(e.clientX-r.left)+"px");card.style.setProperty("--my",(e.clientY-r.top)+"px")}
  });
  const loop=()=>{ringX+=(mouseX-ringX)*.18;ringY+=(mouseY-ringY)*.18;cursorRing.style.left=ringX+"px";cursorRing.style.top=ringY+"px";requestAnimationFrame(loop)};loop();
}else if(cursorDot&&cursorRing){cursorDot.remove();cursorRing.remove()}

if(heroStage&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  window.addEventListener("pointermove",e=>{
    if(window.matchMedia("(max-width:900px)").matches)return;
    const rx=(e.clientX/window.innerWidth-.5)*10, ry=(e.clientY/window.innerHeight-.5)*-8;
    heroStage.style.transform="translate3d("+rx+"px,"+ry+"px,0)";
  },{passive:true});
  window.addEventListener("scroll",()=>{
    if(window.matchMedia("(max-width:900px)").matches)return;
    const p=Math.min(1,scrollY/900);
    heroStage.style.opacity=(1-p*.55).toFixed(2);
  },{passive:true});
}

document.querySelectorAll(".project-card,.button,.nav-cta").forEach(el=>{
  el.addEventListener("pointerenter",()=>el.classList.add("interaction-hot"));
  el.addEventListener("pointerleave",()=>el.classList.remove("interaction-hot"));
});

const motionTargets=[...document.querySelectorAll(".timeline-item,.project-card,.achievement-grid>div,.about-copy,.skills>div,.contact-links>a")];
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches && motionTargets.length){
  motionTargets.forEach((el,i)=>{
    el.style.opacity="0";el.style.transform="translateY(22px)";
    el.style.transition="opacity .7s cubic-bezier(.2,.8,.2,1) "+Math.min(i*35,260)+"ms,transform .7s cubic-bezier(.2,.8,.2,1) "+Math.min(i*35,260)+"ms";
  });
  const revealIO=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.style.opacity="1";entry.target.style.transform="translateY(0)";revealIO.unobserve(entry.target)}
    });
  },{rootMargin:"0px 0px -8% 0px",threshold:.08});
  motionTargets.forEach(el=>revealIO.observe(el));
}

const magnetic=[...document.querySelectorAll(".button.primary,.nav-cta")];
if(window.matchMedia("(pointer:fine)").matches){
  magnetic.forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.transform="translate("+(x*7)+"px,"+(y*5)+"px)";
    });
    el.addEventListener("pointerleave",()=>el.style.transform="");
  });
}

});