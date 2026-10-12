(() => {
'use strict';
const lab=document.getElementById('system-lab');
if(!lab)return;
const svg=lab.querySelector('.lab-lines'),core=lab.querySelector('.lab-core');
const nodes=[...lab.querySelectorAll('.lab-node')],status=lab.querySelector('.lab-status'),reset=lab.querySelector('.lab-reset');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const ns='http://www.w3.org/2000/svg';
const lines=new Map(),active=new Set(),pulses=new Map();
const messages=['CHOOSE A MODULE','1 MODULE CONNECTED','2 MODULES CONNECTED','3 MODULES CONNECTED','SYSTEM ONLINE — 4/4'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function center(el){const a=el.getBoundingClientRect(),b=lab.getBoundingClientRect();return {x:a.left-b.left+a.width/2,y:a.top-b.top+a.height/2}}
function layout(){
 const w=lab.clientWidth,h=lab.clientHeight;svg.setAttribute('viewBox','0 0 '+w+' '+h);
 const target=center(core);
 nodes.forEach(n=>{
 const start=center(n),path=lines.get(n);
 const midX=(start.x+target.x)/2,midY=(start.y+target.y)/2;
 const bend=(start.y<target.y?-1:1)*18;
 path.setAttribute('d','M '+start.x+' '+start.y+' Q '+midX+' '+(midY+bend)+' '+target.x+' '+target.y);
 });
}
function update(){
 nodes.forEach(n=>{const on=active.has(n.dataset.node);n.classList.toggle('on',on);n.setAttribute('aria-pressed',String(on));lines.get(n).classList.toggle('on',on)});
 const count=active.size;status.textContent=messages[count];core.querySelector('small').textContent=count===4?'ALL SYSTEMS GO':count+' / 4 CONNECTED';
 core.style.boxShadow=count===4?'0 0 0 12px #84ffd011,0 0 0 29px #84ffd00c,0 0 110px #65e2b77a':'';
}
nodes.forEach(n=>{
 const path=document.createElementNS(ns,'path');path.classList.add('lab-line');svg.append(path);lines.set(n,path);
 let pointer=null,moved=false,origin=null;
 n.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  pointer=e.pointerId;moved=false;origin={x:e.clientX,y:e.clientY,left:n.offsetLeft,top:n.offsetTop};
  n.setPointerCapture(pointer);
 });
 n.addEventListener('pointermove',e=>{
  if(e.pointerId!==pointer||!origin)return;
  const dx=e.clientX-origin.x,dy=e.clientY-origin.y;
  if(Math.hypot(dx,dy)>6)moved=true;
  if(!moved)return;
  n.classList.add('dragging');
  const x=clamp(origin.left+dx,8,lab.clientWidth-n.offsetWidth-8);
  const y=clamp(origin.top+dy,88,lab.clientHeight-n.offsetHeight-62);
  n.style.left=x+'px';n.style.top=y+'px';n.style.right='auto';n.style.bottom='auto';
  layout();
 });
 function finish(e){
  if(e.pointerId!==pointer)return;
  if(moved){n.dataset.justDragged='true';n.classList.remove('dragging');setTimeout(()=>delete n.dataset.justDragged,0)}
  pointer=null;origin=null;
 }
 n.addEventListener('pointerup',finish);n.addEventListener('pointercancel',finish);
 n.addEventListener('click',()=>{
  if(n.dataset.justDragged)return;
  const key=n.dataset.node;active.has(key)?active.delete(key):active.add(key);
  update();
 });
});
reset.addEventListener('click',()=>{
 active.clear();
 nodes.forEach(n=>{n.style.left='';n.style.top='';n.style.right='';n.style.bottom='';});
 update();layout();
});
let raf=0,last=0;
function animate(t){
 if(!document.hidden&&!reduced.matches&&lab.getBoundingClientRect().bottom>0&&lab.getBoundingClientRect().top<innerHeight){
  const target=center(core);
  nodes.forEach((n,i)=>{
   const key=n.dataset.node;
   let dot=pulses.get(key);
   if(!dot){dot=document.createElement('span');dot.className='lab-pulse';lab.append(dot);pulses.set(key,dot)}
   dot.classList.toggle('active',active.has(key));
   if(!active.has(key))return;
   const start=center(n),p=((t/1700+i*.23)%1);
   const x=(1-p)*start.x+p*target.x,y=(1-p)*start.y+p*target.y+Math.sin(Math.PI*p)*(start.y<target.y?-9:9);
   dot.style.transform='translate('+x+'px,'+y+'px)';
  });
 }
 raf=requestAnimationFrame(animate);
}
if('ResizeObserver' in window)new ResizeObserver(layout).observe(lab);else addEventListener('resize',layout);
layout();update();if(!reduced.matches)raf=requestAnimationFrame(animate);
reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);pulses.forEach(p=>p.remove());pulses.clear()}else raf=requestAnimationFrame(animate)});
})();