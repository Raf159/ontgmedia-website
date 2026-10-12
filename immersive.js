/* Ontario Grow Media — immersive scroll layer. No external libraries or subscriptions. */
(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 901px)');
  const hero = document.querySelector('.hero');
  const blueprint = document.querySelector('.blueprint');
  const work = document.querySelector('#work');
  if (!hero || !blueprint || !work) return;
  const style = document.createElement('style');
  style.textContent = `
    .immersive-progress{position:fixed;top:0;left:0;height:2px;width:100%;z-index:100;background:var(--mint);transform:scaleX(0);transform-origin:left;pointer-events:none}
    .immersive-scroll-label{position:absolute;bottom:23px;right:28px;z-index:4;color:var(--mint);font:10px monospace;letter-spacing:2px}
    .immersive-scroll-label:after{content:' ↓';font-size:16px}
    .immersive-scene{position:relative;height:245vh}
    .immersive-scene>.hero{height:100vh;min-height:680px;position:sticky;top:0;display:flex;align-items:center;padding:0;isolation:isolate}
    .immersive-scene .blueprint{perspective:900px;will-change:transform,opacity}
    .immersive-scene .app-core{will-change:transform}
    .immersive-scene .orbit{will-change:transform}
    .immersive-scene .hero h1{will-change:transform,opacity}
    .immersive-scene .hero:before{width:1100px;height:1100px;right:-320px;top:-330px}
    .immersive-scene .blueprint:before{content:'';position:absolute;inset:-80%;background:conic-gradient(from 0deg,transparent 0 40%,#63dc9511 50%,transparent 60%);animation:immersive-sweep 18s linear infinite}
    @keyframes immersive-sweep{to{transform:rotate(360deg)}}
    .immersive-scene .module{animation-play-state:running}
    .immersive-chapter{display:inline-flex;gap:12px;align-items:center;color:var(--mint);font:10px monospace;letter-spacing:2px;margin-bottom:12px}
    .immersive-chapter:before{content:'';height:1px;width:34px;background:var(--mint)}
    @media(max-width:900px),(prefers-reduced-motion:reduce){
      .immersive-scene{height:auto}
      .immersive-scene>.hero{height:auto;min-height:0;position:relative;display:block;padding:65px 0 50px}
      .immersive-scene .blueprint,.immersive-scene .app-core,.immersive-scene .orbit,.immersive-scene .hero h1{will-change:auto!important;transform:none!important;opacity:1!important}
      .immersive-scene .blueprint:before{animation:none}
      .immersive-scroll-label{display:none}
    }
  `;
  document.head.append(style);
  const progress = document.createElement('div');
  progress.className = 'immersive-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  const scene = document.createElement('div');
  scene.className = 'immersive-scene';
  hero.parentNode.insertBefore(scene,hero);
  scene.append(hero);
  const hint = document.createElement('span');
  hint.className = 'immersive-scroll-label';
  hint.textContent = 'SCROLL TO EXPLORE';
  blueprint.append(hint);
  const chapter = document.createElement('div');
  chapter.className = 'immersive-chapter';
  chapter.textContent = 'SYSTEMS IN MOTION / 001';
  const sectionHead = work.querySelector('.section-head > div');
  if(sectionHead) sectionHead.insertBefore(chapter,sectionHead.firstChild);
  const heading=hero.querySelector('h1'), core=blueprint.querySelector('.app-core');
  const modules=[...blueprint.querySelectorAll('.module')];
  const orbits=[...blueprint.querySelectorAll('.orbit')];
  let ticking=false;
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
  function render(){
    ticking=false;
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform='scaleX('+clamp(scrollY/Math.max(max,1))+')';
    if(motion.matches||!desktop.matches){
      blueprint.style.removeProperty('transform');
      blueprint.style.removeProperty('opacity');
      heading.style.removeProperty('transform');
      heading.style.removeProperty('opacity');
      core.style.removeProperty('transform');
      modules.forEach(m=>m.style.removeProperty('transform'));
      orbits.forEach(o=>o.style.removeProperty('transform'));
      return;
    }
    const bounds=scene.getBoundingClientRect();
    const travel=Math.max(scene.offsetHeight-innerHeight,1);
    const t=clamp(-bounds.top/travel);
    const smooth=t*t*(3-2*t);
    blueprint.style.transform='translate3d('+(-smooth*16)+'vw,0,0) scale('+(1+smooth*1.3)+') rotate('+(smooth*8)+'deg)';
    blueprint.style.opacity=String(1-clamp((t-.76)/.24)*.88);
    heading.style.transform='translate3d(0,'+(-smooth*90)+'px,0)';
    heading.style.opacity=String(1-clamp((t-.52)/.42)*.9);
    core.style.transform='rotate('+(-8+smooth*185)+'deg) scale('+(1+smooth*.55)+')';
    modules.forEach((m,i)=>m.style.transform='translate3d('+((i-1)*smooth*110)+'px,'+((i%2?1:-1)*smooth*95)+'px,0)');
    orbits.forEach((o,i)=>o.style.transform='rotate('+(i?35-smooth*190:-25+smooth*210)+'deg) scaleX(1.4)');
  }
  function schedule(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  motion.addEventListener('change',schedule);
  desktop.addEventListener('change',schedule);
  schedule();
})();