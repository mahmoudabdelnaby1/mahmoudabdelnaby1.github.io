(() => {
  'use strict';
  const GA_ID = 'G-5RX5EFWJ8T';
  const CLARITY_ID = 'z48olb9rbi';
  const STORE = 'portfolio-optional-analytics-v1';
  const ar = document.documentElement.lang.toLowerCase().startsWith('ar');
  const copy = ar ? {
    title: 'اختيارات الخصوصية',
    body: 'تظل التحليلات الاختيارية متوقفة حتى توافق. عند الموافقة، نستخدم Google Analytics وMicrosoft Clarity لفهم الزيارات واستخدام الصفحات. لا نرسل بيانات النماذج أو محتوى الرسائل.',
    accept: 'موافقة على التحليلات الاختيارية',
    reject: 'رفض التحليلات الاختيارية',
    details: 'تفاصيل الخصوصية',
    settings: 'إعدادات الخصوصية',
    saved: 'تم حفظ اختيارك. يمكنك تغييره في أي وقت من إعدادات الخصوصية.',
    close: 'إغلاق'
  } : {
    title: 'Privacy choices',
    body: 'Optional analytics stay off unless you agree. If you accept, Google Analytics and Microsoft Clarity help us understand visits and page use. We do not send form data or message contents.',
    accept: 'Accept optional analytics',
    reject: 'Reject optional analytics',
    details: 'Privacy details',
    settings: 'Privacy settings',
    saved: 'Your choice is saved. You can change it any time in Privacy settings.',
    close: 'Close'
  };
  const style = document.createElement('style');
  style.textContent = '#privacy-consent{position:fixed;z-index:2147483000;inset:auto 1rem 1rem;max-width:42rem;margin-inline:auto;padding:1rem 1.1rem;background:#101827;color:#fff;border:1px solid #52647d;border-radius:1rem;box-shadow:0 12px 40px #0005;font:inherit;line-height:1.55}#privacy-consent[hidden]{display:none}#privacy-consent h2{font-size:1.1rem;margin:0 0 .4rem}#privacy-consent p{margin:.3rem 0 .8rem}#privacy-consent .pc-actions{display:flex;flex-wrap:wrap;gap:.55rem}#privacy-consent button,#privacy-settings{font:inherit;cursor:pointer;border-radius:.55rem;padding:.55rem .8rem;border:1px solid #9aacc5;background:#fff;color:#101827}#privacy-consent button[data-choice="accept"]{background:#93f0cf;border-color:#93f0cf}#privacy-consent a{color:#b8d7ff}#privacy-settings{position:fixed;z-index:2147482999;inset:auto 1rem 1rem auto;font-size:.85rem}html[dir="rtl"] #privacy-settings{inset:auto auto 1rem 1rem}@media(max-width:600px){#privacy-consent{inset:auto .5rem .5rem}#privacy-settings{inset:auto .5rem .5rem}html[dir="rtl"] #privacy-settings{inset:auto auto .5rem .5rem}}';
  document.head.append(style);
  function readChoice() {
    try {
      const stored = window.localStorage.getItem(STORE);
      if (stored === 'accepted' || stored === 'rejected') return stored;
    } catch (_) {}
    const cookie = document.cookie.split('; ').find((item) => item.startsWith(encodeURIComponent(STORE) + '='));
    const value = cookie ? decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1)) : null;
    return value === 'accepted' || value === 'rejected' ? value : null;
  }
  let choice = readChoice();
  let loaded = false;

  function sendGAConsent(value) {
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
      analytics_storage: value ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
  }
  function startAnalytics() {
    if (loaded) { sendGAConsent(true); if (window.clarity) window.clarity('consentv2', {analytics_Storage:'granted', ad_Storage:'denied'}); return; }
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {allow_google_signals:false,allow_ad_personalization_signals:false});
    const ga = document.createElement('script'); ga.async = true; ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.append(ga);
    (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}; t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i; y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window,document,'clarity','script',CLARITY_ID);
    window.clarity('consentv2', {analytics_Storage:'granted', ad_Storage:'denied'});
    sendGAConsent(true);
  }
  function revoke() {
    sendGAConsent(false);
    if (window.clarity) window.clarity('consentv2', {analytics_Storage:'denied', ad_Storage:'denied'});
  }
  function save(value) {
    choice = value ? 'accepted' : 'rejected';
    try { window.localStorage.setItem(STORE, choice); } catch (_) {}
    try { document.cookie = `${encodeURIComponent(STORE)}=${choice}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`; } catch (_) {}
    if (value) startAnalytics(); else revoke();
    show(false);
    announce(copy.saved);
  }
  const panel = document.createElement('section'); panel.id='privacy-consent'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','false'); panel.setAttribute('aria-labelledby','privacy-consent-title'); panel.hidden=true;
  panel.innerHTML = `<h2 id="privacy-consent-title"></h2><p></p><div class="pc-actions"><button type="button" data-choice="accept"></button><button type="button" data-choice="reject"></button><a></a></div>`;
  panel.querySelector('h2').textContent=copy.title; panel.querySelector('p').textContent=copy.body;
  panel.querySelector('[data-choice="accept"]').textContent=copy.accept;
  panel.querySelector('[data-choice="reject"]').textContent=copy.reject;
  const details=panel.querySelector('a'); details.textContent=copy.details; details.href=ar?'/ar/privacy/':'/privacy/';
  panel.querySelector('[data-choice="accept"]').addEventListener('click',()=>save(true));
  panel.querySelector('[data-choice="reject"]').addEventListener('click',()=>save(false));
  const settings=document.createElement('button'); settings.id='privacy-settings'; settings.type='button'; settings.textContent=copy.settings; settings.addEventListener('click',()=>show(true));
  const status=document.createElement('div'); status.setAttribute('aria-live','polite'); status.setAttribute('role','status'); status.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
  function announce(message){status.textContent=message;window.setTimeout(()=>status.textContent='',4500);}
  function show(open){panel.hidden=!open;settings.hidden=open;if(open)panel.querySelector('[data-choice="accept"]').focus();}
  document.addEventListener('DOMContentLoaded',()=>{document.body.append(panel,settings,status); if(choice==='accepted')startAnalytics(); else if(choice!=='rejected')show(true); trackContactIntents();});
  function trackContactIntents(){
    document.addEventListener('click',(event)=>{
      if(choice!=='accepted') return;
      const link=event.target.closest('a[href^="https://wa.me/"],a[href^="https://api.whatsapp.com/"]');
      if(!link||!window.gtag) return;
      window.gtag('event','contact_intent',{method:'whatsapp',language:ar?'ar':'en',page_path:location.pathname});
    },{capture:true});
  }
})();

