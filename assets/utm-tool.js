(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const t = (en, ar) => document.documentElement.lang === 'ar' ? ar : en;
  const known = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const normalize = (s) => String(s || '').replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  const aliases = {
    landing_url: ['landing_url','url','destination_url','رابط_الوجهة','رابط_الصفحة','الرابط'],
    utm_source: ['utm_source','source','المصدر','مصدر'], utm_medium: ['utm_medium','medium','الوسيط'],
    utm_campaign: ['utm_campaign','campaign','الحملة','اسم_الحملة'], utm_content: ['utm_content','content','المحتوى'],
    utm_term: ['utm_term','term','الكلمة','مصطلح']
  };
  function addIssue(list, level, text) { list.push({level,text}); }
  function buildUrl(rawUrl, values) {
    const issues = [];
    let url;
    try { url = new URL(String(rawUrl || '').trim()); }
    catch { return {url:'',issues:[{level:'error',text:t('Enter a valid full URL.','أدخل رابطًا كاملًا وصحيحًا.')}],status:'error'}; }
    if (!['http:','https:'].includes(url.protocol)) return {url:'',issues:[{level:'error',text:t('Only http:// and https:// destinations are supported.','تُقبل روابط http:// وhttps:// فقط.')}],status:'error'};
    if (!url.hostname || !url.hostname.includes('.')) addIssue(issues,'warning',t('Check that this destination host is correct.','تحقق من صحة نطاق الوجهة.'));
    let existingCounts = {}, existingValues = {};
    for (const [key,value] of url.searchParams) { const normalized=key.toLowerCase(); if (known.includes(normalized)) { existingCounts[normalized]=(existingCounts[normalized]||0)+1; (existingValues[normalized] ||= []).push(value); } }
    Object.entries(existingCounts).forEach(([key,count]) => { if (count > 1) addIssue(issues,'warning',t(`The URL has ${count} copies of ${key}; they will be consolidated.`,`الرابط يحتوي على ${count} نسخ من ${key} وسيتم توحيدها.`)); });
    const next = {};
    known.forEach((key) => {
      const value = String(values[key] || '').trim();
      const current = existingValues[key] || [];
      if (value) {
        if (current.length && current.some(v => v !== value)) addIssue(issues,'warning',t(`${key} already exists and will be replaced by the entered value.`,`القيمة ${key} موجودة وستُستبدل بالقيمة المدخلة.`));
        next[key] = value;
      } else if (current.length) next[key] = current[0];
    });
    for (const key of [...url.searchParams.keys()]) if (known.includes(key.toLowerCase())) url.searchParams.delete(key);
    Object.entries(next).forEach(([key,value]) => url.searchParams.set(key,value));
    Object.values(next).forEach(value => {
      if (/\s/.test(value)) addIssue(issues,'warning',t('A UTM value contains spaces. Consider a consistent underscore or hyphen convention.','إحدى قيم UTM تحتوي مسافات؛ استخدم نمطًا ثابتًا مثل الشرطة السفلية أو الواصلة.'));
      if (/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(value) || /\b\+?\d[\d ()-]{7,}\b/.test(value)) addIssue(issues,'warning',t('A value may contain personal contact data. Remove personal data from tracking parameters.','قد تحتوي إحدى القيم بيانات تواصل شخصية؛ أزلها من وسوم التتبع.'));
    });
    const status = issues.some(x=>x.level==='error') ? 'error' : issues.some(x=>x.level==='warning') ? 'warning' : 'ok';
    return {url:url.toString(),issues,status};
  }
  function showIssues(container, issues) {
    container.replaceChildren();
    if (!issues.length) { const p=document.createElement('p'); p.className='utm-issue'; p.textContent=t('No URL or naming issues detected. Measurement still needs separate verification.','لم تظهر مشكلات في الرابط أو التسمية. يظل القياس بحاجة إلى تحقق منفصل.'); container.append(p); return; }
    issues.forEach(issue=>{const p=document.createElement('p');p.className=`utm-issue ${issue.level}`;p.textContent=issue.text;container.append(p);});
  }
  const form=$('single-form'), result=$('single-result');
  form?.addEventListener('submit',event=>{
    event.preventDefault(); const data=new FormData(form); const values={}; known.forEach(k=>values[k]=data.get(k));
    const built=buildUrl(data.get('url'),values);
    ['utm_source','utm_medium','utm_campaign'].forEach(key=>{let inUrl=false;try{inUrl=Boolean(new URL(built.url).searchParams.get(key));}catch{}if(!String(values[key]||'').trim()&&!inUrl)addIssue(built.issues,'error',t(`${key} is required.`,`قيمة ${key} مطلوبة.`));});
    built.status=built.issues.some(x=>x.level==='error')?'error':built.issues.some(x=>x.level==='warning')?'warning':'ok';
    result.hidden=false; $('single-output').textContent=built.url;
    $('single-copy').disabled=built.status==='error';
    const status=$('single-status'); status.textContent=built.status==='ok'?t('READY TO REVIEW','جاهز للمراجعة'):built.status==='warning'?t('CHECK NOTES','راجع الملاحظات'):t('FIX REQUIRED','يلزم التصحيح'); status.className=`utm-result-status ${built.status==='warning'?'has-warning':built.status==='error'?'has-error':''}`;
    $('single-result-title').textContent=built.status==='error'?t('The URL needs a correction','يحتاج الرابط إلى تصحيح'):t('Review before using','راجعه قبل الاستخدام'); showIssues($('single-issues'),built.issues);
  });
  form?.addEventListener('reset',()=>{if(result)result.hidden=true;});
  $('single-copy')?.addEventListener('click',async()=>{const val=$('single-output').textContent;if(!val)return;try{await navigator.clipboard.writeText(val);$('single-copy').textContent=t('Copied','تم النسخ');setTimeout(()=>$('single-copy').textContent=t('Copy URL','نسخ الرابط'),1500);}catch{$('single-copy').textContent=t('Select and copy the URL','حدد الرابط وانسخه');}});
  const tabs=[...document.querySelectorAll('.utm-mode')];
  function activateTab(tab){tabs.forEach(x=>{x.classList.toggle('is-active',x===tab);x.setAttribute('aria-selected',String(x===tab));x.tabIndex=x===tab?0:-1;});document.querySelectorAll('.utm-panel').forEach(panel=>panel.hidden=panel.dataset.panel!==tab.dataset.mode);}
  tabs.forEach((tab,index)=>{tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1;tab.addEventListener('click',()=>activateTab(tab));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();activateTab(tabs[next]);});});
  function parseCSV(text) {
    const first=(text.split(/\r?\n/,1)[0]||''); let delim=','; const counts=[',',';','\t'].map(d=>({d,n:(first.match(new RegExp(d==='\t'?'\\t':d==='.'?'\\.':d,'g'))||[]).length})).sort((a,b)=>b.n-a.n);if(counts[0]?.n)delim=counts[0].d;
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===delim&&!quoted){row.push(cell);cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}else cell+=ch;}
    row.push(cell);if(row.some(v=>v.trim()))rows.push(row);if(quoted)throw new Error(t('A quoted CSV field is not closed.','يوجد حقل CSV مفتوح بعلامة اقتباس غير مغلقة.'));return rows;
  }
  let outputRows=[];
  function processBatch(){
    outputRows=[];$('download-csv').disabled=true;
    const raw=$('csv-input').value.trim();if(!raw){$('batch-result').hidden=true;return;}
    let rows;try{rows=parseCSV(raw);}catch(e){$('batch-result').hidden=false;$('batch-title').textContent=e.message;$('batch-rows').replaceChildren();return;}
    if(rows.length<2){$('batch-result').hidden=false;$('batch-title').textContent=t('Add a header and at least one data row.','أضف صف عناوين وصف بيانات واحدًا على الأقل.');$('batch-rows').replaceChildren();return;}
    const headers=rows[0].map(normalize), map={};Object.keys(aliases).forEach(key=>{map[key]=headers.findIndex(h=>aliases[key].map(normalize).includes(h));});
    if(map.landing_url<0){$('batch-result').hidden=false;$('batch-title').textContent=t('Required column not found: landing_url','لم يتم العثور على العمود المطلوب: landing_url');$('batch-rows').replaceChildren();return;}
    outputRows=rows.slice(1).map((cells,index)=>{
      const get=k=>map[k]>=0?(cells[map[k]]||'').trim():'';const vals={};known.forEach(k=>vals[k]=get(k));const rawUrl=get('landing_url');const built=buildUrl(rawUrl,vals);const issues=built.issues;
      const builtParams=new URLSearchParams((()=>{try{return new URL(built.url).search}catch{return ''}})());
      if(!vals.utm_source&&!builtParams.get('utm_source'))addIssue(issues,'error',t('Missing utm_source.','قيمة utm_source مفقودة.'));
      if(!vals.utm_medium&&!builtParams.get('utm_medium'))addIssue(issues,'error',t('Missing utm_medium.','قيمة utm_medium مفقودة.'));
      if(!vals.utm_campaign&&!builtParams.get('utm_campaign'))addIssue(issues,'error',t('Missing utm_campaign.','قيمة utm_campaign مفقودة.'));
      const status=issues.some(x=>x.level==='error')?'error':issues.some(x=>x.level==='warning')?'warning':'ok';return {cells,index:index+2,url:built.url,status,issues,campaign:vals.utm_campaign||t('From URL','من الرابط')};
    });
    const tbody=$('batch-rows');tbody.replaceChildren();outputRows.forEach(item=>{const tr=document.createElement('tr');const vals=[String(item.index),item.campaign,item.status==='ok'?t('Ready','جاهز'):item.status==='warning'?t('Review','مراجعة'):t('Fix','تصحيح'),item.url,item.issues.map(x=>x.text).join(' · ')||t('No issues detected','لا توجد ملاحظات')];vals.forEach((value,i)=>{const td=document.createElement('td');if(i===3){const code=document.createElement('code');code.textContent=value;td.append(code);}else td.textContent=value;if(i===2)td.className=`utm-row-status ${item.status}`;tr.append(td);});tbody.append(tr);});
    const counts={ok:outputRows.filter(r=>r.status==='ok').length,warning:outputRows.filter(r=>r.status==='warning').length,error:outputRows.filter(r=>r.status==='error').length};$('batch-counts').replaceChildren();[['ok',t('Ready','جاهز')],['warning',t('Review','مراجعة')],['error',t('Fix required','يلزم التصحيح')]].forEach(([key,label])=>{const span=document.createElement('span');span.className='utm-count';span.textContent=label+' ';const strong=document.createElement('strong');strong.textContent=counts[key];span.append(strong);$('batch-counts').append(span);});$('batch-title').textContent=t(`${outputRows.length} rows reviewed`,`تمت مراجعة ${outputRows.length} صفوف`);$('download-csv').disabled=false;$('batch-result').hidden=false;
  }
  $('run-batch')?.addEventListener('click',processBatch);$('csv-input')?.addEventListener('input',()=>{$('file-name').textContent=t('Pasted CSV data','بيانات CSV ملصقة');});
  $('load-sample')?.addEventListener('click',()=>{$('csv-input').value='landing_url,utm_source,utm_medium,utm_campaign,utm_content,utm_term\nhttps://example.com/new-arrivals?ref=homepage,newsletter,email,autumn_launch,hero_cta,\nhttps://example.org/products?utm_source=old,instagram,social,creator_drop,story_link,\nhttps://example.net/sale,,,,,';$('file-name').textContent=t('Fictional sample rows','صفوف تجريبية افتراضية');processBatch();});
  $('csv-file')?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;$('file-name').textContent=file.name;try{$('csv-input').value=await file.text();processBatch();}catch{$('batch-title').textContent=t('Could not read this file.','تعذرت قراءة هذا الملف.');$('batch-result').hidden=false;}});
  $('clear-batch')?.addEventListener('click',()=>{$('csv-input').value='';$('csv-file').value='';$('file-name').textContent=t('No file selected','لم يتم اختيار ملف');$('batch-result').hidden=true;outputRows=[];});
  function csvEscape(value){let s=String(value??'');if(/^[\s]*[=+@\-\t\r]/.test(s))s="'"+s;return /[",\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  $('download-csv')?.addEventListener('click',()=>{if(!outputRows.length)return;const rows=parseCSV($('csv-input').value.trim());const headers=rows[0];const delimiter=(()=>{const f=$('csv-input').value.split(/\r?\n/,1)[0];return f.includes('\t')?'\t':f.includes(';')?';':','})();const extra=['final_url','qa_status','qa_issues'];const result=[headers.concat(extra),...outputRows.map(item=>item.cells.concat([item.url,item.status,item.issues.map(x=>x.text).join(' | ')]))].map(row=>row.map(csvEscape).join(delimiter)).join('\r\n');const blob=new Blob(['\ufeff'+result],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='utm-campaign-review.csv';document.body.append(a);a.click();const objectUrl=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);});
})();
