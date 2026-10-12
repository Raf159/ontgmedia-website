(() => {
'use strict';
const progress=document.querySelector('.cinema-progress');
const sticky=document.querySelector('.cinema-sticky');
const frame=document.querySelector('.cinema-frame');
const slides=[...document.querySelectorAll('[data-story]')];
const orb=document.querySelector('.cinema-orbit');
const panels=[...document.querySelectorAll('.cinema-panel')];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let scheduled=false;
function clamp(x){return Math.max(0,Math.min(1,x))}
function update(){
scheduled=false;
const scrollMax=Math.max(1,document.documentElement.scrollHeight-innerHeight);
progress.style.transform='scaleX('+clamp(scrollY/scrollMax)+')';
if(!sticky||!frame)return;
const total=Math.max(1,sticky.offsetHeight-innerHeight);
const fraction=clamp(-sticky.getBoundingClientRect().top/total);
const act=fraction<.31?0:fraction<.68?1:2;
frame.dataset.act=String(act);
slides.forEach((slide,i)=>{slide.classList.toggle('active',i===act);slide.setAttribute('aria-hidden',String(i!==act&&!reduce.matches))});
if(reduce.matches){orb.style.transform='translate(-50%,-50%)';panels.forEach(p=>p.style.transform='');return}
const angle=fraction*160;
orb.style.transform='translate(-50%,-50%) rotate('+angle+'deg) scale('+(0.85+fraction*.5)+')';
panels.forEach((p,i)=>{const sign=i%2?-1:1;p.style.transform='translate3d('+(sign*fraction*36)+'px,'+((i<2?-1:1)*fraction*40)+'px,0)'});
}
function request(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});reduce.addEventListener('change',request);update();
})();