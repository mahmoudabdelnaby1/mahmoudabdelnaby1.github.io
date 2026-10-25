(()=>{
const input=document.querySelector('#directory-search');
const entries=[...document.querySelectorAll('.directory-entry')];
const buttons=[...document.querySelectorAll('.directory-filter')];
const examples=[...document.querySelectorAll('[data-search-example]')];
const count=document.querySelector('#directory-result-count');
const empty=document.querySelector('.directory-empty');
const language=document.documentElement.lang==='ar'?'ar':'en';
let selected='';

// Task language is deliberately separate from the catalogue copy so new assistants
// can be matched by the job they do, even when a visitor describes it differently.
const intents=[
 {keys:['hook','hooks','headline','opening line','ad copy','هوك','الهوك','افتتاحية','افتتاحيه','بداية الاعلان','خطاف'],terms:['hook','headline','opening','copywriting','ad copy','creative','caption','هوك','افتتاح','اعلان','إعلان','كتابة']},
 {keys:['conversion','conversions','checkout','sales are low','low sales','تحويل','التحويلات','مبيعات','البيع','السلة','الدفع'],terms:['conversion','checkout','cro','funnel','cart','sales','purchase','تحويل','السلة','الدفع','مبيعات','شراء']},
 {keys:['social media','content calendar','post ideas','social posts','السوشيال','السوشيال ميديا','تقويم محتوى','أفكار محتوى','افكار محتوى','منشورات'],terms:['social media','content calendar','social content','post','caption','platform','سوشيال','محتوى','منشور','تقويم']},
 {keys:['seo','google ranking','search visibility','ai search','ظهور في جوجل','محركات البحث','تحسين محركات البحث','السيو'],terms:['seo','search visibility','search engine','keyword','serp','aeo','geo','محركات البحث','السيو','كلمات مفتاحية']},
 {keys:['tracking','analytics','pixel','conversion api','capi','قياس','تتبع','البيانات','التحليلات','بيكسل'],terms:['tracking','analytics','attribution','pixel','gtm','capi','measurement','تتبع','قياس','تحليلات','بيانات']},
 {keys:['email','crm','whatsapp','follow up','رسالة واتساب','واتساب','بريد إلكتروني','بريد الكتروني','متابعة العملاء'],terms:['email','crm','whatsapp','lifecycle','automation','follow-up','رسائل','واتساب','بريد إلكتروني','عملاء']},
 {keys:['campaign','media plan','advertising','ads','campaign plan','حملة','اعلان','إعلان','الإعلانات','خطة إعلانية','خطة اعلانية'],terms:['campaign','advertising','media buying','paid media','ads','ad set','حملة','إعلان','اعلان','إعلانات']},
 {keys:['product description','product page','product listing','وصف منتج','صفحة منتج','المنتج'],terms:['product description','product page','product listing','e-commerce','commerce','وصف المنتج','صفحة المنتج','متجر']},
 {keys:['brand strategy','positioning','brand voice','هوية العلامة','تموضع','صوت العلامة','استراتيجية العلامة'],terms:['brand strategy','positioning','brand voice','messaging','branding','العلامة التجارية','تموضع','هوية']},
 {keys:['research','competitor','market analysis','بحث السوق','المنافسين','تحليل السوق','ابحث عن'],terms:['research','competitor','market analysis','researcher','benchmark','بحث','منافس','السوق','تحليل']},
 {keys:['cv','resume','linkedin profile','سيرة ذاتية','السي في','لينكدإن','لينكد ان'],terms:['resume','cv','linkedin','career','job search','سيرة ذاتية','لينكدإن','وظيفة']},
 {keys:['image','visual','logo','design','صورة','صور','تصميم','شعار','صورة بالذكاء الاصطناعي'],terms:['image','visual','design','illustration','logo','midjourney','صورة','تصميم','شعار','رسم']},
 {keys:['video','reel','script','فيديو','ريلز','سيناريو','سكريبت'],terms:['video','reel','script','storyboard','tiktok','youtube','فيديو','ريلز','سيناريو']},
 {keys:['prompt','ai assistant','generative ai','ذكاء اصطناعي','برومبت','موجه','مساعد ذكاء'],terms:['prompt','generative ai','ai assistant','llm','chatbot','ذكاء اصطناعي','برومبت','موجه']},
 {keys:['pricing','profit','unit economics','سعر','تسعير','ربحية','هامش الربح','تكلفة المنتج'],terms:['pricing','profit','unit economics','margin','cost','economics','تسعير','ربح','هامش','تكلفة']},
 {keys:['localize','translation','dialect','لهجة','ترجمة','توطين','مصري','خليجي'],terms:['localizer','localization','translation','dialect','arabic','لهجة','ترجمة','توطين','مصري','خليجي']},
 {keys:['website','landing page','store','موقع','صفحة هبوط','متجر إلكتروني','متجر الكتروني'],terms:['website','landing page','e-commerce','storefront','shopify','wordpress','موقع','صفحة هبوط','متجر']},
 {keys:['teach me','learn','study','explain','علمني','شرح','اتعلم','أتعلم','مذاكرة','تعليم'],terms:['tutor','learning','study','education','explain','teacher','تعليم','شرح','تعلم','دراسة']}
];
const stop=new Set(['i','me','my','we','you','a','an','the','to','for','of','on','in','and','with','please','help','need','want','make','write','create','give','عايز','عاوزه','عاوز','محتاج','محتاجة','اريد','أريد','اعمل','اعملي','اكتب','لي','لنا','انا','أنا','عندي','عندي','مشكلة','مشكلتي','في','من','عن','على','اي','أي','حاجة','شي','ابغى','ابي','لو','سمحت','ممكن']);
const normalize=value=>(value||'').toLocaleLowerCase().normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[’‘`]/g,"'").replace(/[^\p{L}\p{N}+#.\s'-]/gu,' ').replace(/\s+/g,' ').trim();
const haystacks=entries.map(entry=>normalize(entry.dataset.search||''));
const normalizedIntents=intents.map(item=>({keys:item.keys.map(normalize),terms:item.terms.map(normalize)}));

function rank(query,index){
 const text=haystacks[index];
 if(!query)return 0;
 let score=0;
 if(text.includes(query))score+=100;
 const tokens=query.split(' ').filter(token=>token.length>1&&!stop.has(token));
 for(const token of tokens){if(text.includes(token))score+=12;}
 const matched=normalizedIntents.filter(intent=>intent.keys.some(key=>key&&query.includes(key)));
 for(const intent of matched){
  const hits=intent.terms.filter(term=>term&&text.includes(term));
  if(hits.length)score+=Math.min(54,22+hits.length*6);
 }
 return score;
}
function update(){
 const query=normalize(input?.value);let shown=0;
 const ranked=[];
 entries.forEach((entry,index)=>{
  const relevance=rank(query,index);
  const visible=(!selected||entry.dataset.category===selected)&&(!query||relevance>0);
  entry.hidden=!visible;
  if(visible){shown++;ranked.push({entry,index,relevance});}
 });
 // CSS order changes only the visible ranking; equal scores retain catalogue order.
 if(query)ranked.sort((a,b)=>b.relevance-a.relevance||a.index-b.index);
 ranked.forEach((item,position)=>{item.entry.style.order=String(position);});
 if(!query)entries.forEach(entry=>entry.style.removeProperty('order'));
 if(count)count.textContent=new Intl.NumberFormat(language==='ar'?'ar-EG':'en').format(shown);
 if(empty)empty.hidden=shown!==0;
}
for(const button of buttons)button.addEventListener('click',()=>{
 selected=button.dataset.filter||'';
 for(const b of buttons){const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));}
 update();
});
input?.addEventListener('input',update);
examples.forEach(button=>button.addEventListener('click',()=>{
 if(!input)return;
 input.value=button.dataset.searchExample||'';
 input.dispatchEvent(new Event('input',{bubbles:true}));
 input.focus();
}));
})();
