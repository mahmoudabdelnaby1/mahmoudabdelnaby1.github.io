(()=>{
const input=document.querySelector('#directory-search');
const entries=[...document.querySelectorAll('.directory-entry')];
const buttons=[...document.querySelectorAll('.directory-filter')];
const count=document.querySelector('#directory-result-count');
const empty=document.querySelector('.directory-empty');
let selected='';
const normalize=s=>(s||'').toLocaleLowerCase().normalize('NFKC').trim();
function update(){
 const q=normalize(input?.value);let shown=0;
 for(const entry of entries){
  const matchCategory=!selected||entry.dataset.category===selected;
  const matchText=!q||normalize(entry.dataset.search).includes(q);
  const visible=matchCategory&&matchText;entry.hidden=!visible;if(visible)shown++;
 }
 if(count)count.textContent=new Intl.NumberFormat(document.documentElement.lang==='ar'?'ar-EG':'en').format(shown);
 if(empty)empty.hidden=shown!==0;
}
for(const button of buttons)button.addEventListener('click',()=>{
 selected=button.dataset.filter||'';
 for(const b of buttons){const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));}
 update();
});
input?.addEventListener('input',update);
})();
