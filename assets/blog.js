(() => {
 const search=document.querySelector("[data-blog-search]");
 const cards=Array.from(document.querySelectorAll(".blog-card,.blog-feature-card"));
 const originalOrder=new Map(cards.map((card,index)=>[card,index]));
 const filters=Array.from(document.querySelectorAll("[data-filter]"));
 const status=document.querySelector("[data-blog-status]");
 const empty=document.querySelector("[data-blog-empty]");
 const grid=document.querySelector("[data-blog-grid]");
 if(!cards.length)return;

 let active="all";
 const stopWords=new Set(`a an and are as at be been being by can could did do does doing for from get got had has have having he her here hers him his how i if in into is it its just me more my of on or our ours she should so some than that the their them they this those to too up us very was we were what when where which who why will with would you your yourself want need looking find tell show help make made much many please about currently still really already something anything thing things not no but nor then there these while use using used working works trying try me my am pm after before also problem problems issue issues trouble struggling
 انا أنا احنا إحنا انت انتو انتم هو هي هما هم هن عندي عندنا لديك لدي لي عايز عايزة عاوز عاوزه عايزين محتاج محتاجة محتاجين اريد ابغى ابي نفسي ازاي ازاى كيف ماذا ايه ايش اي هل في ف فين من على عن الي اللي الذي التي و او ثم لكن لو يكون كده كدا كذا كمان جدا مش مو ما لا ليس لسه دلوقتي حاليا بعدها بهم بي بقى بقي حاجه حاجة شيء يعني مثلا مثل عايز اعرف اريد ان محتاج ان يوجد عايز ان انا اللي هو اللي هي بتاع بتاعتي بتاعه بتاعها بتاعت بتاعهم عشان الخ إلخ بقا فعلا كويس حلو افضل أفضل احسن أحسن ممكن اقدر اعمل اجيب ياريت لو سمحت فاهم فاهمة الفكرة فكره معنديش مفيش مش عارف معرفش مش فاهم عندي عندنا اللي عندي اية ايه ليه ليش كيفيه كيفية`.split(/\s+/));
 const normalize=value=>value.toLocaleLowerCase().normalize("NFKC")
  .replace(/[\u064B-\u065F\u0670\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي")
  .replace(/[ؤ]/g,"و").replace(/[ئ]/g,"ي").replace(/ة/g,"ه")
  .replace(/[^a-z0-9\u0600-\u06ff]+/g," ").trim();
 const stem=word=>{
  if(word.length>5)word=word.replace(/^(وال|بال|كال|لل|ال)/,"");
  if(word.length>5)word=word.replace(/(يات|ات|ون|ين|ان|ها|هم|هن|ية|يه|نا|كم|كن)$/,"");
  if(word.length>5)word=word.replace(/(ing|ers|ies|ied|ed|es|s)$/i,"");
  return word;
 };
 const tokens=value=>Array.from(new Set(normalize(value).split(/\s+/).map(stem).filter(word=>word.length>1&&!stopWords.has(word))));

 // Group equivalent words so everyday phrasing can meet the guide's topic terms.
 const conceptGroups=[
  "lead leads prospect prospects inquiry inquiries enquiry enquiries contact contacts customer customers buyer buyers client clients conversion conversions signup signups order orders purchase purchases booking bookings request requests عميل عملاء العميل العملاء محتمل محتملة محتملين زبون زباين استفسار استفسارات استعلام تواصل رسالة رسائل طلب طلبات اوردر اوردرات اوردرات حجز حجوزات شراء مشتريات",
  "traffic visitor visitors visit visits session sessions زيارات الزيارات زيارة زائر زوار جلسات دخول",
  "measure measurement tracking track analytics attribution pixel event events reporting metrics clicks click قياس تتبع تحليلات احصاء احصائيات نسبة نقره نقرة نقرات",
  "problem issue broken fix troubleshoot diagnose diagnosis stuck failing fail failed لايعمل لايعملش اصلاح تشخيص مشكلة مشاكل عطل اعطال مشغله مش شغال مش شغاله مش بيشتغل مش راضي",
  "growth grow improve improvement optimize optimization increase increased boost raise scale scaling sales revenue profit performance sale sell selling purchase purchases order orders نمو تنمية تطوير تحسين زيادة زياده مبيعات المبيعات بيع ايرادات ربح ارباح اداء طلب طلبات اوردر اوردرات شراء مشتريات",
  "campaign campaigns ads advertising ad paid media spend اعلان اعلانات اعلاني حملة حملات ممول ممولة مصاريف ميزانية ميزانيه",
  "content writing write draft article blog copy post posts ideas calendar كتابة محتوى مقال مقالات نص صياغة بوست بوستات منشور منشورات افكار تقويم",
  "search seo ranking rank indexing indexed index discover visibility visible showing appear google searchengine serp بحث ظهور ترتيب فهرسة مفهرس نتائج جوجل ظاهر بيظهر بيطلع مش ظاهر مش بيظهر مش بيطلع مش لاقي",
  "whatsapp واتساب واتس واتسآب",
  "video videos creative film footage hook storyboard production فيديو فيديوهات مرئي تصوير مونتاج مشاهدات مشاهده",
  "website page landing site web mobile form checkout conversionrate موقع صفحة صفحات هبوط لاندنج موبايل جوال فورم نموذج",
  "email emails newsletter emailmarketing deliverability bounce inbox open subscribe welcome automation lifecycle بريد ايميل ايميلات نشرة يوصل بيوصلش مش بيوصل مش بيفتح",
  "social instagram tiktok linkedin youtube engagement community سوشيال اجتماعي اجتماعية انستغرام انستجرام تيك توك لينكدان يوتيوب تفاعل متابعين جمهور",
  "influencer influencers creator creators sponsorship audience partnership مؤثر مؤثرين صانع صناع محتوى رعاية افصاح",
  "budget cost cpa cpc cpm bidding auction ميزانية صرف تكلفة تكاليف مزايدة"
 ];
 const concepts=conceptGroups.map(group=>new Set(group.split(/\s+/).map(stem).map(normalize).filter(Boolean)));
 const conceptOf=word=>concepts.findIndex(group=>group.has(word));
 const expands=word=>{const group=conceptOf(word);return group<0?[word]:Array.from(concepts[group]);};

 // Common symptom-led questions are mapped to guide concepts, without sending queries off-site.
 const intentRules=[
  {pattern:/(مش\s*(ظاهر|بيظهر|بيطلع|مفهرس)|ما\s*بيطلعش|مابيطلعش|مش\s*بيبان|مش\s*لاق[يى].{0,18}(جوجل|google)|اظهر.{0,20}(جوجل|google|بحث)|ظهور.{0,20}(جوجل|google|بحث)|doesn\s*t\s*(show|appear|rank|index)|not\s*(showing|appearing|indexed|ranking)|can\s*t\s*find.{0,20}(site|page)|missing\s*from\s*google|not\s*in\s*search)/,terms:["search","index","visibility"]},
  {pattern:/(واتساب|واتس\s*اب|whatsapp).{0,60}(ضغط|نقر|بعت|يبعت|رساله|استفسار|عميل|lead|message|click|contact|مفيش|مش)|(ضغط|نقر|click).{0,40}(واتساب|whatsapp)|clicks?.{0,40}(but|no|without).{0,25}(message|lead|sales?)/,terms:["whatsapp","contact","lead","measure"]},
  {pattern:/(اعلان|حمل[هة]|ads?|campaign).{0,75}(صرف|فلوس|نقر|مبيع|عميل|نتيج|تحويل|مفيش|مش|but|no|without|click|sale|lead|result|convert|spend)|(صرف|فلوس|مبيع|نقر).{0,35}(اعلان|حمل[هة]|ads?|campaign)|ads?.{0,45}(but|no|without).{0,25}(sales?|leads?|conversions?)/,terms:["campaign","lead","sales","conversion","measure"]},
  {pattern:/(زوار|ناس|عملاء|visitors|traffic).{0,55}(مش|مفيش|مبيشتروش|مش بيشتري|سيب|checkout|buy|buying|sales?|convert)|(مفيش|مش).{0,30}(مبيعات|طلبات|تحويلات|sales?|orders?)/,terms:["website","conversion","sales","checkout"]},
  {pattern:/(مش عارف|مش فاهم|ازاي اعرف|كيف اعرف|ازاي اقيس|how do i know|how can i tell|how do i measure).{0,65}(قناة|حملة|نتيجة|اعلان|تسويق|channel|campaign|result|ads?|مبيعات|عملاء|نتايج)/,terms:["measure","campaign","growth"]},
  {pattern:/(عندي|عندنا|i have|we have|struggling with|having trouble with).{0,40}(مشكله|مشاكل|problem|issue|trouble|صعوبه|صعب|broken|مش شغال|مش شغاله)/,terms:["problem","fix","diagnose"]},
  {pattern:/(عايز|عايزة|عاوز|اريد|want|need|trying).{0,55}(ازود|زيادة|مبيع|عملاء|استفسارات|leads?|sales?|grow|increase|more customers)/,terms:["growth","sales","lead"]},
  {pattern:/(محتاج|عايز|عايزة|اريد|want|need|trying).{0,45}(محتوى|مقال|بوست|افكار|كتابة|content|article|post|ideas?)/,terms:["content","writing","social"]},
  {pattern:/(فيديو|video|creative).{0,55}(مش|ضعيف|قليل|مشاهد|نتيج|بيجيب|views?|perform|hook|click|watch)|(مشاهدات|مشاهده|views?).{0,35}(فيديو|video|اعلان|ad)/,terms:["video","creative","campaign"]},
  {pattern:/(موقع|صفحه|صفحة|form|landing page|website).{0,60}(موبايل|جوال|بطيء|بيخرج|بيسيب|مش بيكمل|نموذج|تحويل|mobile|slow|drop|leave|convert|bounce)|(checkout|form).{0,35}(drop|abandon|fail|مشكله|مشكلة)/,terms:["website","mobile","conversion","form"]},
  {pattern:/(ايميل|إيميل|email|بريد).{0,50}(مش بيوصل|مش بيظهر|مش بيفتح|مبيوصلش|spam|inbox|bounce|deliver|open|مشكله|مشكلة)/,terms:["email","deliverability","measurement"]},
  {pattern:/(مؤثر|مؤثرين|influencer|creator).{0,50}(مش|نتيج|جمهور|اعلان|حملة|قياس|سعر|مفيش|result|audience|campaign|measure|cost|sales?)/,terms:["influencer","campaign","measure"]},
  // Orders, purchases and abandoned checkouts are common ways people describe a sales problem.
  {pattern:/(مفيش|مافيش|مفيش|مش بيجيلي|مبيجيليش|مش بيجي|قليل|قلت|وقفت|واقفه|ضعيفه|ضعيف|مفيش|بدون|من غير|no|zero|few|fewer|dropped|drop|lost|without).{0,55}(طلبات|اوردر|اوردرات|حجوزات|شراء|مبيعات|بيع|مشتريات|orders?|purchases?|sales?|bookings?)|(طلبات|اوردر|اوردرات|مبيعات|orders?|purchases?|sales?).{0,50}(مفيش|مافيش|قليل|قلت|وقفت|واقفه|مش|بدون|من غير|no|zero|few|dropped|drop|without)/,terms:["sales","orders","purchase","conversion","checkout","website"]},
  {pattern:/(اصرف|بصرف|صرف|بتصرف|بيصرف|مصروف|فلوس|ميزانيه|ميزانية|مكلف|غالي|تكلفه|تكلفة|spend|spending|spent|expensive|cost|budget).{0,60}(مفيش|مافيش|مش|بدون|من غير|نتيجه|نتائج|طلبات|مبيعات|استفسارات|عملاء|no|without|but|few|sales?|orders?|leads?|results?|conversions?)|(مفيش|مافيش|مش|بدون|من غير|no|without|but).{0,45}(نتيجه|نتائج|طلبات|مبيعات|استفسارات|عملاء|sales?|orders?|leads?|results?|conversions?).{0,45}(اعلان|حمله|ads?|campaign|spend|budget)/,terms:["campaign","budget","sales","orders","lead","conversion","measure"]},
  {pattern:/(محدش|الناس|زوار|زيارات|traffic|visitors?|people|users?).{0,45}(بيشتري|بيطلب|بيحجز|بيكمل|بيدخل|بتمشي|مش|مفيش|مافيش|لكن|but|not|aren.t|don.t|without).{0,35}(شراء|طلبات|اوردر|مبيعات|checkout|buy|purchase|order|sales?|convert)|(checkout|cart|عربه|سله|سلة).{0,40}(مفتوح|متروك|بيسيب|مش بيكمل|abandon|drop|leave|leaves|not complete)/,terms:["traffic","website","checkout","conversion","sales","orders"]},
  {pattern:/(تفاعل|تفاعلات|وصول|مشاهدات|مشاهده|مشاهد|متابعين|جمهور|engagement|reach|views?|followers?).{0,50}(قليل|ضعيف|مش|مفيش|مافيش|واقع|نازل|stopped|low|down|no|decline|drop)|((بوست|محتوى|فيديو|اعلان|post|content|video|creative).{0,50}(محدش|الناس|مش|مفيش|مافيش|مشاهدات|تفاعل|بيوصل|ضعيف|no|low|reach|engagement|views?))/,terms:["social","content","engagement","video","creative"]},
  {pattern:/(عايز|عايزة|عاوز|محتاج|اريد|want|need|trying|looking).{0,65}(اختار|اختيار|ابدأ|ابدا|انسب|افضل|احسن|قناة|منصه|منصة|طريقه|طريقة|اقارن|مقارنه|choose|pick|start|best|right|which|compare|channel|platform)/,terms:["compare","channel","platform","decision","marketing"]},
  {pattern:/(مش عارف|مش فاهم|مش عارفة|ازاي اعرف|ازاي اقيس|كيف اعرف|كيف اقيس|what is working|which channel|how do i measure|how can i tell|how do i know).{0,75}(اعلان|حمله|قناه|قناة|تسويق|مبيعات|عملاء|نتايج|نتائج|فلوس|عائد|اعلانات|channel|campaign|marketing|sales?|leads?|results?|spend|roi|return)/,terms:["measure","campaign","channel","marketing","growth"]},
  {pattern:/(مش عارف|مش فاهم|عايز|عايزة|عاوز|محتاج|اريد|how do i|how can i|what should i).{0,60}(اعمل|ابدأ|اكتب|استخدم|اعمل ايه|ايه الحل|ايه اعمل|محتوى|مقال|بوست|فيديو|حمله|اعلان|كتابة|افكار|make|start|write|use|create|content|article|post|video|campaign|ad|ideas?)/,terms:["problem","guide","content","marketing","writing"]},
  {pattern:/(جوجل|google|بحث|search|seo).{0,55}(مش|مفيش|مافيش|مش لاقي|مش ظاهر|مش بيظهر|مش بيطلع|محدش|not|missing|invisible|cannot|can't|doesn't|does not)|(مش لاقي|مش ظاهر|مش بيظهر|مش بيطلع|محدش بيشوف|مفيش ظهور|مافيش ظهور|not showing|not found|can't find|cannot find|missing from).{0,45}(جوجل|google|موقع|صفحه|صفحة|site|page|search|بحث)/,terms:["search","seo","indexing","visibility"]}
 ];
 const interpretQuery=value=>{
  const normalized=normalize(value);
  const queryTokens=tokens(value);
  const intents=intentRules.filter(rule=>rule.pattern.test(normalized)).flatMap(rule=>rule.terms);
  return {queryTokens:Array.from(new Set(queryTokens)),intents:Array.from(new Set(intents.map(normalize).flatMap(tokens)))};
 };
 const hasToken=(haystack,word)=>haystack.has(word)||Array.from(haystack).some(candidate=>word.length>=4&&candidate.startsWith(word));
 const searchScore=(card,query)=>{
  if(!query.queryTokens.length&&!query.intents.length)return 0;
  const title=new Set(tokens(card.dataset.searchTitle||""));
  const body=new Set(tokens(card.dataset.search||""));
  const termScore=(word,weight)=>{
   const alternatives=expands(word);
   const titleHit=alternatives.some(candidate=>hasToken(title,candidate));
   const bodyHit=titleHit||alternatives.some(candidate=>hasToken(body,candidate));
   return bodyHit?weight*(titleHit?2.6:1):0;
  };
  let score=0,matched=0;
  for(const word of query.queryTokens){
   const points=termScore(word,1);
   if(points){matched++;score+=points;}
  }
  let intentMatches=0;
  for(const word of query.intents){
   const points=termScore(word,.8);
   if(points){intentMatches++;score+=points;}
  }
  const required=query.queryTokens.length>=4?2:1;
  if(matched<required&&intentMatches<2)return -1;
  return score+(matched/Math.max(query.queryTokens.length,1));
 };
 const apply=()=>{
  const query=interpretQuery(search?search.value:"");
  const searching=query.queryTokens.length>0||query.intents.length>0;
  let visible=0;
  const ranked=[];
  for(const card of cards){
   const matchTheme=active==="all"||card.dataset.theme===active;
   const score=searchScore(card,query);
   const show=matchTheme&&score>=0;
   card.hidden=!show;
   if(show)visible++;
   if(card.classList.contains("blog-card"))ranked.push({card,score:show?score:-1});
  }
  if(grid){
   if(searching)ranked.sort((a,b)=>b.score-a.score||originalOrder.get(a.card)-originalOrder.get(b.card));
   else ranked.sort((a,b)=>originalOrder.get(a.card)-originalOrder.get(b.card));
   for(const item of ranked)grid.append(item.card);
  }
  if(empty)empty.hidden=visible!==0;
  if(status){
   if(searching||active!=="all")status.textContent=String(visible)+" "+(visible===1?status.dataset.one:status.dataset.many);
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
