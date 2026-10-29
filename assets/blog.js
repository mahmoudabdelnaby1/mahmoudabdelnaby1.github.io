(() => {
 const search=document.querySelector("[data-blog-search]");
 const cards=Array.from(document.querySelectorAll(".blog-card,.blog-feature-card"));
 const filters=Array.from(document.querySelectorAll("[data-filter]"));
 const status=document.querySelector("[data-blog-status]");
 const empty=document.querySelector("[data-blog-empty]");
 if(!cards.length)return;
 let active="all";
 const stopWords=new Set(("a an and are as at be by do for from how i in is it me my of on or the to was what when where why with you your need want looking find show help have has had this that please can could would should about into using find عندي عندنا لدي عندي عايز عايزه عاوز عاوزه اريد محتاج محتاجه ابغى ابي ازاي ازاى كيف ماذا ايه اي ما في فين من على عن الي اللي الذي التي و او ثم لكن لو هل هو هي يكون كذا كده كمان جدا مش مو ليس لا مشكلة مشاكل عند لدي لديّ اريد اريد ان عايز ان عايزة ان محتاج ان اريد اعرف طريقة طرق شيء حاجه حاجة عايز اعمل اعمل اعرف حل حلول ليه ليش اريد معرفة" ).split(/\s+/));
 const synonymGroups=[
  "lead leads prospect prospects inquiry inquiries enquiry enquiries contact conversion العملاء عميل عملاء محتمل محتملة محتملين محتملون استفسار استفسارات استعلام تواصل رسالة رسائل",
  "measure measurement tracking track analytics attribution قياس قياسه قياسها تتبع تتبعها تتبعهم تحليلات احصاء احصائيات نسبه نتائج",
  "problem issue broken fix troubleshoot diagnose diagnosis حل حلول مشكلة مشاكل عطل اعطال لايعمل لايعملش اصلاح تشخيص",
  "growth grow improve improvement optimize optimization increase increase sales revenue profit business performance sales growth نمو نموه تنمية تطور تطوير تحسين احسن ازود زيادة زياده مبيعات المبيعات بيع ايرادات ربح ارباح اداء نتائج",
  "campaign campaigns ads advertising paid media إعلان اعلانات اعلاني حملة حملات اعلان اعلانية اعلانيه",
  "content writing write draft article blog copy content كتابة اكتب محتوى مقال مقالات نص صياغة صياغه",
  "search seo ranking indexing searchengine بحث بحثا ظهور ترتيب فهرسة فهرسة نتائج جوجل",
  "whatsapp واتساب واتس اب واتسآب",
  "video videos creative film فيديو فيديوهات مرئي اعلان اعلانات تصوير مونتاج",
  "website page landing site web موقع صفحة صفحات صفحة هبوط لاندنج",
  "email emails newsletter emailmarketing بريد ايميل ايميلات رسائل نشرة",
  "social socials instagram tiktok linkedin youtube سوشيال اجتماعي اجتماعية انستغرام انستجرام تيك توك لينكدان يوتيوب"
 ];
 const normalize=value=>value.toLocaleLowerCase().normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/[ؤ]/g,"و").replace(/[ئ]/g,"ي").replace(/ة/g,"ه").replace(/[^a-z0-9\u0600-\u06ff]+/g," ").trim();
 const stem=word=>{
  if(word.length>5) word=word.replace(/^(وال|بال|كال|لل|ال)/," ").trim();
  if(word.length>5) word=word.replace(/(يات|ات|ون|ين|ان|ها|هم|هن|ية|يه|نا|كم|كن)$/," ").trim();
  if(word.length>5) word=word.replace(/(ing|ers|ies|ied|ed|es|s)$/," ").trim();
  return word;
 };
 const concepts=synonymGroups.map(group=>new Set(group.split(/\s+/).map(word=>stem(normalize(word))).filter(Boolean)));
 const tokens=value=>Array.from(new Set(normalize(value).split(/\s+/).map(stem).filter(word=>word.length>1&&!stopWords.has(word))));
 const expanded=word=>{const group=concepts.find(set=>set.has(word));return group||new Set([word]);};
 const searchScore=(card,queryTokens)=>{
  if(!queryTokens.length)return 1;
  const title=new Set(tokens(card.dataset.searchTitle||""));
  const body=new Set(tokens(card.dataset.search||""));
  let score=0,matched=0;
  for(const queryToken of queryTokens){
   const alternatives=expanded(queryToken);
   const titleHit=Array.from(alternatives).some(word=>title.has(word)||Array.from(title).some(candidate=>candidate.startsWith(word)&&word.length>=4));
   const bodyHit=titleHit||Array.from(alternatives).some(word=>body.has(word)||Array.from(body).some(candidate=>candidate.startsWith(word)&&word.length>=4));
   if(bodyHit){matched++;score+=titleHit?3:1;}
  }
  const coverage=matched/queryTokens.length;
  const minimum=queryTokens.length===1?1:queryTokens.length===2?.5:Math.min(.55,2/queryTokens.length);
  return coverage>=minimum?score+coverage:-1;
 };
 const apply=()=>{
  const queryTokens=tokens(search?search.value:"");
  let visible=0;
  const ranked=[];
  for(const card of cards){
   const matchTheme=active==="all"||card.dataset.theme===active;
   const score=searchScore(card,queryTokens);
   const matchSearch=score>=0;
   const show=matchTheme&&matchSearch; card.hidden=!show; if(show)visible+=1;
   if(card.classList.contains("blog-card"))ranked.push({card,score:matchTheme&&show?score:-1});
  }
  if(queryTokens.length){ranked.sort((a,b)=>b.score-a.score);const grid=document.querySelector("[data-blog-grid]");if(grid)for(const item of ranked)grid.append(item.card);}
  if(empty)empty.hidden=visible!==0;
  if(status){
   if(queryTokens.length||active!=="all") status.textContent=String(visible)+" "+(visible===1?status.dataset.one:status.dataset.many);
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