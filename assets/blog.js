(() => {
 const search=document.querySelector("[data-blog-search]");
 const cards=Array.from(document.querySelectorAll(".blog-card,.blog-feature-card"));
 const filters=Array.from(document.querySelectorAll("[data-filter]"));
 const status=document.querySelector("[data-blog-status]");
 const empty=document.querySelector("[data-blog-empty]");
 if(!cards.length)return;
 let active="all";
 const apply=()=>{
  const query=(search?search.value:"").trim().toLocaleLowerCase();
  let visible=0;
  for(const card of cards){
   const matchTheme=active==="all"||card.dataset.theme===active;
   const matchSearch=!query||(card.dataset.search||"").includes(query);
   const show=matchTheme&&matchSearch; card.hidden=!show; if(show)visible+=1;
  }
  if(empty)empty.hidden=visible!==0;
  if(status){
   if(query||active!=="all") status.textContent=String(visible)+" "+(visible===1?status.dataset.one:status.dataset.many);
   else status.textContent=status.dataset.default;
  }
 };
 for(const button of filters)button.addEventListener("click",()=>{
  active=button.dataset.filter||"all";
  for(const item of filters)item.setAttribute("aria-pressed",String(item===button));
  apply();
 });
 if(search)search.addEventListener("input",apply);
})();