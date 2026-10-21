(()=>{
const q=document.querySelector('#search');
const cat=document.querySelector('#category');
const cards=[...document.querySelectorAll('.bot')];
const count=document.querySelector('#result-count');
const filters=[...document.querySelectorAll('.task-filter')];
const totalMark=document.querySelector('[data-assistant-total]');
const ar=document.documentElement.lang==='ar';
const fmt=new Intl.NumberFormat(ar?'ar-EG':'en');
const number=n=>fmt.format(n);
function updateCounts(){
  if(totalMark) totalMark.textContent=number(cards.length);
  for(const filter of filters){
    const category=filter.dataset.categoryFilter||'';
    const total=cards.reduce((n,card)=>n+(!category||card.dataset.category===category?1:0),0);
    let badge=filter.querySelector('small');
    if(!badge){badge=document.createElement('small');badge.setAttribute('aria-hidden','true');filter.append(badge);}
    badge.textContent=number(total);
  }
}
function update(){
  const s=(q?.value||'').toLowerCase().trim();
  const c=cat?.value||'';
  let n=0;
  for(const card of cards){
    const hit=(!s||card.dataset.search.includes(s))&&(!c||card.dataset.category===c);
    card.hidden=!hit;
    if(hit)n++;
  }
  if(count){
    const label=ar?(n===0?'لا يوجد مساعدون':n===1?'مساعد واحد':n===2?'مساعدان':n<=10?`${number(n)} مساعدين`:`${number(n)} مساعدًا`):`${number(n)} ${count.dataset.label}`;
    count.textContent=label+' '+count.dataset.after;
  }
}
updateCounts();update();
q?.addEventListener('input',()=>{if(q.value.trim())document.querySelector('.library')?.classList.add('expanded');update()});
cat?.addEventListener('change',update);
const more=document.querySelector('#show-all'),lib=document.querySelector('.library');
more?.addEventListener('click',()=>{const expanded=lib.classList.toggle('expanded');more.setAttribute('aria-expanded',String(expanded));more.firstChild.textContent=expanded?more.dataset.close:more.dataset.open});
document.querySelectorAll('[data-copy-target]').forEach(b=>b.addEventListener('click',async()=>{const e=document.querySelector(b.dataset.copyTarget);if(!e)return;try{await navigator.clipboard.writeText(e.textContent);const old=b.textContent;b.textContent=b.dataset.done||'Copied';setTimeout(()=>b.textContent=old,1600)}catch{b.textContent='Select and copy manually'}}));
const els=[...document.querySelectorAll('.hero,.detail-head,.bot')];
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.08});els.forEach((e,i)=>{e.classList.add('reveal');if(e.classList.contains('bot'))e.style.setProperty('--reveal-index',String(i%9));io.observe(e)})}else els.forEach(e=>e.classList.add('is-visible'));
})();
