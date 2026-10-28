"""Rebuild the 100 article endings as varied, source-led publishing assets."""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data/blog-content.json"
DATA = json.loads(DATA_PATH.read_text(encoding="utf-8"))

FAMILIES = {
    "01": ["experiment", "decision", "thread", "teardown", "scorecard"],
    "02": ["scorecard", "experiment", "decision", "swipe", "worksheet"],
    "03": ["carousel", "decision", "teardown", "worksheet", "prompt"],
    "04": ["experiment", "decision", "swipe", "scorecard", "video"],
    "05": ["carousel", "video", "thread", "responsekit", "checklist"],
    "06": ["carousel", "prompt", "teardown", "checklist", "worksheet", "case"],
    "07": ["swipe", "workflow", "decision", "checklist", "video"],
    "08": ["scorecard", "swipe", "experiment", "checklist", "worksheet"],
    "09": ["video", "storyboard", "experiment", "carousel", "checklist"],
    "10": ["experiment", "decision", "teardown", "swipe", "scorecard"],
    "11": ["prompt", "redteam", "workflow", "scorecard", "experiment"],
}

OVERRIDES = {
    "paid-media-conversion-signals": "scorecard",
    "paid-test-budget": "experiment",
    "seo-query-clusters": "worksheet",
    "seo-structured-data-qa": "checklist",
    "social-response-playbook": "responsekit",
    "content-case-study-proof": "case",
    "video-opening-test": "experiment",
    "video-storyboard": "storyboard",
    "video-funnel-diagnosis": "decision",
    "video-shot-list-production": "storyboard",
    "ai-output-evaluation": "scorecard",
    "ai-evidence-safe-drafting": "prompt",
    "ai-untrusted-input-safety": "redteam",
    "influencer-break-even-planning": "worksheet",
}

DELOITTE = ("[Deloitte, Digital Consumer Trends 2026 — KSA](https://www.deloitte.com/middle-east/en/about/press-room/ai-becomes-default-for-saudi-consumers-as-deloittes-2026-digital-consumer-trends-report-reveals-decisive-shift-in-how-the-kingdom-lives.html)", "[Deloitte، اتجاهات المستهلك الرقمي 2026 — السعودية](https://www.deloitte.com/middle-east/en/about/press-room/ai-becomes-default-for-saudi-consumers-as-deloittes-2026-digital-consumer-trends-report-reveals-decisive-shift-in-how-the-kingdom-lives.html)")
CMO = ("[The Marketing Society, CMO Barometer 2026](https://marketingsociety.com/think-piece/cmo-barometer)", "[The Marketing Society، مؤشر CMO لعام 2026](https://marketingsociety.com/think-piece/cmo-barometer)")
GOOGLE = ("[Google Search Essentials](https://developers.google.com/search/docs/essentials)", "[أساسيات بحث Google](https://developers.google.com/search/docs/essentials)")
GEO = ("[Critical survey of GEO research (2023–2026)](https://arxiv.org/abs/2607.14035)", "[مراجعة بحثية نقدية لأبحاث GEO (2023–2026)](https://arxiv.org/abs/2607.14035)")

MARKET_NOTES = {
    "bilingual-seo-mena-search-intent": "deloitte", "ai-marketing-workflows": "deloitte",
    "ai-visibility-monitoring": "geo", "ai-entity-consistency": "deloitte",
    "ai-referral-classification": "deloitte", "ai-source-provenance": "deloitte",
    "growth-system-broken-handoff": "cmo", "marketing-kpi-tree": "cmo",
    "measurement-dashboard-decisions": "cmo", "measurement-attribution-limits": "cmo",
    "marketing-test-prioritization": "cmo", "seo-query-clusters": "google",
    "seo-page-refresh": "google", "content-brief-originality": "google",
    "content-source-citations": "google", "content-outline-task-first": "google",
}

def add_market_note(md, slug, lang):
    signal=MARKET_NOTES.get(slug)
    marker="Market signal (" if lang=="en" else "إشارة سوقية ("
    chunks=md.split("\n\n")
    existing=[p for p in chunks if p.startswith("**"+marker)]
    if existing:
        kept=False; deduped=[]
        for p in chunks:
            if p.startswith("**"+marker):
                if kept: continue
                kept=True
            deduped.append(p)
        return "\n\n".join(deduped)
    if not signal: return md
    if signal=="deloitte":
        note=(f"**Market signal (Saudi Arabia only):** Deloitte’s 2026 KSA edition surveyed 1,000 consumers aged 18–50; 66% reported active AI-tool use, and information search was among common tasks (51%). This is KSA adoption evidence—not a query-volume estimate, an all-MENA claim, or a promise of AI citation. Validate actual wording and demand with first-party search data. {DELOITTE[0]}" if lang=="en" else f"**إشارة سوقية (السعودية فقط):** شمل إصدار Deloitte لعام 2026 في المملكة 1,000 مستهلك بعمر 18–50؛ وأفاد 66% باستخدام نشط لأدوات الذكاء الاصطناعي، وكان البحث عن المعلومات من الاستخدامات الشائعة (51%). هذه إشارة تبنٍّ في السعودية، وليست تقديرًا لحجم بحث أو تعميمًا على MENA أو وعدًا بالاستشهاد في إجابة آلية. تحقّق من الصيغ والطلب الفعليين ببيانات البحث المباشرة. {DELOITTE[1]}")
    elif signal=="cmo":
        note=(f"**Market signal (MENA marketers):** The 2026 CMO Barometer summary draws on 56 senior marketers and highlights AI-enabled performance, customer centricity, and capability gaps as regional priorities. This is a small leadership survey, not a representative consumer or keyword-demand study. {CMO[0]}" if lang=="en" else f"**إشارة سوقية (مسوّقو MENA):** يستند ملخص مؤشر CMO لعام 2026 إلى 56 من كبار المسوّقين، ويعرض الأداء المدعوم بالذكاء الاصطناعي والتركيز على العميل وفجوات القدرات كأولويات إقليمية. هذه عينة قيادية محدودة وليست دراسة ممثلة للمستهلكين أو حجم الكلمات المفتاحية. {CMO[1]}")
    elif signal=="google":
        note=(f"**Search quality signal:** Google’s Search Essentials emphasize helpful, reliable, people-first content and make clear that following best practices does not guarantee crawling, indexing, or serving. Treat query ideas as hypotheses until search data validates them. {GOOGLE[0]}" if lang=="en" else f"**إشارة جودة البحث:** تؤكد أساسيات بحث Google فائدة المحتوى الموثوق والمفيد والموجّه للناس، وتوضح أن اتباع الممارسات لا يضمن الزحف أو الفهرسة أو الظهور. تعامل مع أفكار الاستعلامات كفرضيات حتى تؤكدها بيانات البحث. {GOOGLE[1]}")
    else:
        note=(f"**Research signal:** A 2026 critical survey finds GEO terminology, metrics, and evidence standards remain heterogeneous. Treat visibility checks as observations tied to a query, date, and platform—not as stable ranking proof. {GEO[0]}" if lang=="en" else f"**إشارة بحثية:** تشير مراجعة نقدية منشورة في 2026 إلى استمرار اختلاف المصطلحات والمقاييس ومعايير الدليل في GEO. تعامل مع فحص الظهور كرصد مرتبط باستعلام وتاريخ ومنصة، لا كإثبات ترتيب ثابت. {GEO[1]}")
    paragraphs=md.split("\n\n",1)
    if len(paragraphs)<2: return md+"\n\n"+note
    return paragraphs[0]+"\n\n"+note+"\n\n"+paragraphs[1]

NAMES = {
    "en": {"experiment":"Field experiment thread", "decision":"Choose-your-path guide", "thread":"Operator thread", "teardown":"Illustrative teardown", "scorecard":"Evidence scorecard", "swipe":"Stop-doing swipe file", "carousel":"Educational carousel", "worksheet":"Working canvas", "prompt":"Tool-neutral prompt pack", "video":"Short-video script", "checklist":"Launch checklist", "workflow":"Workflow map", "storyboard":"Proof-first storyboard", "redteam":"Red-team simulation", "case":"Case-study lab", "responsekit":"Response copy kit"},
    "ar": {"experiment":"سلسلة تجربة ميدانية", "decision":"دليل قرار حسب الحالة", "thread":"سلسلة للممارسين", "teardown":"تفكيك توضيحي", "scorecard":"بطاقة تقييم بالدليل", "swipe":"ملف أمثلة: أوقف هذا", "carousel":"كاروسيل تعليمي", "worksheet":"ورقة عمل تطبيقية", "prompt":"حزمة مطالبات محايدة للأدوات", "video":"سكريبت فيديو قصير", "checklist":"قائمة فحص قبل الإطلاق", "workflow":"خريطة سير عمل", "storyboard":"مخطط يبدأ بالدليل", "redteam":"محاكاة اختبار هجومي", "case":"مختبر دراسة حالة", "responsekit":"حزمة ردود جاهزة"},
}

def clean(s):
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)
    return re.sub(r"[*_`]+|\s+", lambda m: " " if m.group(0).isspace() else "", s).strip()

def body_only(md):
    heads = list(re.finditer(r"(?m)^##\s+[^\n]+$", md))
    return md[:heads[-1].start()].rstrip() if heads else md.rstrip()

def sentences(s):
    return [clean(x) for x in re.split(r"(?<=[.!?؟])\s+", clean(s)) if clean(x)]

def material(md):
    paras = [clean(p) for p in re.split(r"\n\s*\n", md) if clean(p) and not p.lstrip().startswith(("|", ">", "---", "#"))]
    sections=[]; heading=""; buf=[]
    for line in md.splitlines():
        m=re.match(r"^##\s+(.+)$",line.strip())
        if m:
            if heading and buf: sections.append((clean(heading),clean(" ".join(buf))))
            heading,buf=m.group(1),[]
        elif line.strip() and not line.lstrip().startswith(("|",">","---")): buf.append(line.strip())
    if heading and buf: sections.append((clean(heading),clean(" ".join(buf))))
    paras=[p for p in paras if not p.lower().startswith(("ai disclosure:","إفصاح عن الذكاء الاصطناعي:"))]
    opening=(sentences(paras[0]) or [""])[0] if paras else ""
    relevant=next((t for h,t in sections if t and not re.search(r"example|مثال",h,re.I)), paras[1] if len(paras)>1 else opening)
    example=next((t for h,t in sections if t and re.search(r"example|مثال|تطبيق",h,re.I)), paras[-1] if paras else opening)
    steps=[]
    for h,t in sections:
        if re.search(r"example|مثال|تطبيق",h,re.I): continue
        ss=sentences(t)
        if ss: steps.append((h,ss[0]))
    return opening, (sentences(relevant) or [relevant])[0], example, steps[:5]

def make_asset(post, lang, family, md):
    title=clean(post[lang]["title"])
    opening, principle, example, steps=material(md)
    steps=steps or [(title,principle)]
    lines="\n".join(f"{i}. **{clean(h)}:** {clean(s)}" for i,(h,s) in enumerate(steps,1))
    rows="\n".join(f"| {i} | {clean(h)} | {clean(s)[:140]} |" for i,(h,s) in enumerate(steps,1))
    ar=lang=="ar"
    name=NAMES[lang][family]
    if family=="experiment":
        if ar: text=f"""## {name}: {title}\n\n**الفرضية:** تطبيق هذا الإجراء على جمهور ومسار محددين سيغيّر موضع التعطل الذي يصفه المقال: {opening}\n\n**خطة الاختبار، لا نتيجة منشورة:**\n١. سجّل خط الأساس ومصدره والفترة والحالات المؤهلة.\n٢. غيّر عاملًا واحدًا: {principle}\n٣. راقب نتيجة أساسية وحاجز جودة قد يتأثر.\n٤. ثبّت بقية الظروف وسجّل الاستثناءات والتغييرات المتزامنة.\n٥. اعرض النتيجة الفعلية، حتى لو لم يظهر فرق واضح، مع المصدر والقيود.\n\nأوقف الاختبار إذا تعطل القياس أو تجاوز حاجز الجودة حدًا متفقًا عليه. لا تنسب نتيجة إلى الطريقة قبل التحقق من السجلات."""
        else: text=f"""## {name}: {title}\n\n**Hypothesis:** Applying this procedure to one defined audience and workflow should change the bottleneck described here: {opening}\n\n**Test plan, not a reported result:**\n1. Record the baseline, source, period, and eligible cases.\n2. Change one variable: {principle}\n3. Track one primary outcome and a quality guardrail.\n4. Hold other conditions steady and log exceptions or concurrent changes.\n5. Report what actually happened—including no clear change—with source and limitations.\n\nStop if tracking breaks or the guardrail crosses its agreed limit. Do not attribute an outcome to the method until the records support it."""
    elif family=="carousel":
        if ar:
            cards=[f"١. **الغلاف:** {title}",f"٢. **المشكلة:** {opening}"]+[f"{i}. **{clean(h)}:** {clean(s)}" for i,(h,s) in enumerate(steps[:4],3)]+[f"٦. **خطوة التطبيق:** {principle}",f"٧. **حدود الدليل:** {clean(example)[:260]}"]
            text=f"## {name}: {title}\n\n"+"\n\n".join(cards)+"\n\n**ملاحظة تحريرية:** ادعاء واحد في كل شريحة؛ افصل المثال التوضيحي عن نتيجة تم قياسها فعلًا."
        else:
            cards=[f"1. **Cover:** {title}",f"2. **The problem:** {opening}"]+[f"{i}. **{clean(h)}:** {clean(s)}" for i,(h,s) in enumerate(steps[:4],3)]+[f"6. **Apply it:** {principle}",f"7. **Evidence limit:** {clean(example)[:260]}"]
            text=f"## {name}: {title}\n\n"+"\n\n".join(cards)+"\n\n**Editorial note:** One claim per card; distinguish the illustration from an outcome that was actually measured."
    elif family=="prompt":
        if ar: text=f"""## {name}: {title}\n\nاستخدمها مع أي مساعد نصي أو يدويًا. أدخل مواد معتمدة ومنقحة فقط.\n\n**التشخيص**\n> للمهمة «{title}»، افحص [المادة المعتمدة]. حدّد هدف المستخدم وآخر حالة مؤكدة وأول نقطة تعطل وما ينقص من دليل. اربط كل استنتاج بمصدره ولا تخترع أرقامًا أو نتائج.\n\n**إنشاء أداة عملية**\n> حوّل هذا المبدأ إلى خطوات قابلة للتنفيذ: {principle} أضف مسؤولًا ومصدر قياس وحاجز جودة وبديلًا يدويًا.\n\n**المراجعة**\n> راجع المخرج بحثًا عن ادعاء بلا دليل أو خطوة غير قابلة للتحقق أو خطر خصوصية. أعد التصحيحات مع مصدرها، واكتب «غير معروف» عند غياب الدليل. لا تنشر ولا تغيّر إعدادًا حيًا."""
        else: text=f"""## {name}: {title}\n\nUse with any text assistant or manually. Supply approved, sanitized material only.\n\n**Diagnose**\n> For “{title},” inspect [approved material]. Identify the user goal, last verified state, first broken step, and missing evidence. Tie each finding to its source. Invent no figures or outcomes.\n\n**Build a practical tool**\n> Turn this principle into executable steps: {principle} Include an owner, measurement source, quality guardrail, and manual fallback.\n\n**Review**\n> Audit the output for unsupported claims, unverifiable steps, and privacy risks. Return corrections with sources; say “unknown” when evidence is absent. Do not publish or change a live setting."""
    elif family=="swipe":
        if ar: text=f"""## {name}: {title}\n\n**صياغة ضعيفة توضيحية:** «غيّرنا [العنصر] وحققنا [نتيجة]» من دون تحديد المصدر أو الفترة أو العوامل الأخرى.\n\n**صياغة قابلة للاستخدام:** «قبل **[الإجراء الذي يتناوله المقال]**، تحقّق من **[الدليل المحدد]**. سجّل **[الحالة والفترة]**، ثم نفّذ **[خطوة واحدة]**. لا تصف التغير بأنه نتيجة مؤكدة قبل مراجعته في **[المصدر]**».\n\n**المبدأ التطبيقي:** {principle}\n\nالصياغة الضعيفة مثال تعليمي وليست اقتباسًا من عميل. املأ الخانات بسجلات حقيقية ولا تصف المنهج بأنه مثبت دون بيانات."""
        else: text=f"""## {name}: {title}\n\n**Illustrative weak line:** “We changed [element] and achieved [result]” without naming source, period, or other changes.\n\n**Use this instead:** “Before **[action covered here]**, verify **[specific evidence]**. Record **[state and period]**, then take **[one step]**. Do not call the change a confirmed outcome until checking **[source]**.”\n\n**Applied principle:** {principle}\n\nThe weak line is a teaching example, not a client quote. Fill the fields with real records; do not call the method proven without data."""
    elif family=="decision":
        if ar: text=f"""## {name}: {title}\n\n**ابدأ بالسؤال:** {opening}\n\n- **إذا لم يوجد دليل:** أوقف التحسين وحدد من أو أي نظام يستطيع تأكيد الحالة.\n- **إذا وُجدت الإشارة وتعطل التسليم:** عالج أقرب خطوة مفقودة: {principle}\n- **إذا اكتمل التسليم وبقيت النتيجة ضعيفة:** افحص الجمهور والوعد وتجربة الخطوة التالية قبل زيادة الحجم.\n- **إذا كانت البيانات متذبذبة:** لا تنسب التغير لسبب واحد قبل مقارنة فترات وظروف متشابهة.\n\n**القرار العملي:** وثّق المرحلة والسجل والإجراء والمسؤول وحاجز الجودة. غيّر سببًا واحدًا ثم راجع النتيجة من المصدر نفسه. «غير معروف» تعني جمع دليل، لا تخمينًا."""
        else: text=f"""## {name}: {title}\n\n**Start with this question:** {opening}\n\n- **If there is no evidence:** pause optimization and identify who or which system can verify the state.\n- **If the signal exists but handoff fails:** fix the nearest missing step: {principle}\n- **If handoff completes but the outcome remains weak:** inspect audience, promise, and next-step experience before increasing volume.\n- **If the data is volatile:** do not attribute movement to one cause until periods and conditions are comparable.\n\n**Practical decision:** record the stage, source, action, owner, and guardrail. Change one cause, then review against the same source. “Unknown” means gather evidence, not guess."""
    elif family=="thread":
        if ar: text=f"## {name}: {title}\n\n{opening}\n\n**١/** عرّف النتيجة قبل اختيار التكتيك.\n\n**٢/** تتبّع حالة واحدة بدليلها عبر المراحل بدل دمج النقرات والطلبات والنتائج.\n\n**٣/** نفّذ أقرب خطوة عملية: {principle}\n\n**٤/** سجّل المسؤول وخط الأساس وحاجز الجودة.\n\n**٥/** اعرض ما تحقق وما بقي مجهولًا ومصدر كل منهما.\n\nهذه خلاصة تطبيقية للمقال، لا ادعاء بنتيجة عميل لم تُقَس."
        else: text=f"## {name}: {title}\n\n{opening}\n\n**1/** Define the outcome before choosing a tactic.\n\n**2/** Follow one case and its evidence across stages; do not collapse clicks, requests, and outcomes.\n\n**3/** Take the closest practical step: {principle}\n\n**4/** Log the owner, baseline, and quality guardrail.\n\n**5/** Report what is verified, what remains unknown, and the source for each.\n\nThis is an operational summary of the article, not an unmeasured client result."
    elif family=="teardown":
        if ar: text=f"""## {name}: {title}\n\n**سيناريو افتراضي:** يرى فريق هذه الإشارة: {opening}، فيقفز إلى حل واسع قبل أن يراجع موضع التعطل. هذا مثال تدريبي وليس حالة عميل.\n\n**أسئلة التفكيك**\n١. ما الفعل أو النتيجة المقصودة؟\n٢. ما السجل الذي يثبت الحالة الحالية؟\n٣. أين ضاع الانتقال أو الالتباس؟\n٤. ما أصغر تغيير يعالج السبب الأقرب؟\n\n**إعادة البناء:** {principle}\n\nقبل النشر، أضف مصدرًا وتاريخًا ومالكًا للخطوة التالية. لا تكتب نتيجة قبل قياسها."""
        else: text=f"""## {name}: {title}\n\n**Hypothetical scenario:** A team sees this signal: {opening} and jumps to a broad fix before locating the failure. This is a training illustration, not a client case.\n\n**Teardown questions**\n1. What action or outcome was intended?\n2. Which record proves the current state?\n3. Where did the handoff or interpretation fail?\n4. What smallest change addresses the nearest cause?\n\n**Rebuild:** {principle}\n\nBefore publishing, attach a source, date, and owner for the next step. Do not state an outcome before measuring it."""
    elif family=="scorecard":
        if ar: text=f"""## {name}: {title}\n\nقيّم كل بند بـ **نعم / لا / غير معروف** وأرفق الدليل. الإجابة بلا مصدر تظل «غير معروف».\n\n| # | فحص مرتبط بالمقال | الدليل المطلوب |\n|---:|---|---|\n{rows}\n\n**قاعدة الاعتماد:** أصلح أي «لا» حرج قبل الإطلاق. اجمع دليلًا لأي «غير معروف». احفظ الإصدار والتاريخ واسم المراجع والسجل المستخدم.\n\n**نقطة الانطلاق:** {opening}"""
        else: text=f"""## {name}: {title}\n\nScore each row **Yes / No / Unknown** and attach evidence. An answer without a source remains “Unknown.”\n\n| # | Article-specific check | Evidence to retain |\n|---:|---|---|\n{rows}\n\n**Approval rule:** fix any critical “No” before launch. Gather evidence for “Unknown.” Keep the version, date, reviewer, and source record.\n\n**Starting point:** {opening}"""
    elif family=="video":
        if ar: text=f"""## {name}: {title}\n\n**المدة:** ٣٥–٤٥ ثانية · رأسي مع ترجمة مقروءة\n\n**٠–٤ ثوانٍ | افتح بالمشكلة** — أظهرها بصريًا.\nالتعليق: «{opening}»\n\n**٥–١٥ ثانية | اعرض الفحص** — أظهر أين تبحث عن الدليل، لا شاشة شكلية.\n\n**١٦–٣٠ ثانية | نفّذ خطوة واحدة**\nالتعليق: «{principle}»\n\n**٣١–٤٢ ثانية | حدّد ما يمكن تأكيده** — أظهر المصدر والقيود أو اكتب «مثال توضيحي».\n\nلا تعرض بيانات خاصة ولا توحِ بنتيجة لم تحدث. اختم بخطوة يمكن للمشاهد تنفيذها من الدليل."""
        else: text=f"""## {name}: {title}\n\n**Length:** 35–45 seconds · vertical with readable captions\n\n**0–4 sec | Open on the problem** — show it visually.\nVoice: “{opening}”\n\n**5–15 sec | Show the check** — demonstrate where evidence comes from, not a decorative screen.\n\n**16–30 sec | Apply one step**\nVoice: “{principle}”\n\n**31–42 sec | State what can be verified** — show the source and limitation, or label it “illustrative.”\n\nDo not expose private data or imply an outcome that did not happen. Close with one step viewers can take from the guide."""
    elif family=="worksheet":
        if ar: text=f"""## {name}: {title}\n\nاملأها لحالة واحدة حقيقية.\n\n| الحقل | ما الذي تكتبه؟ |\n|---|---|\n| الجمهور / الحالة | [من أو ما الذي نراجعه] |\n| المطلوب | [الفعل أو النتيجة المقصودة] |\n| ما تحقق | [آخر حالة ودليلها] |\n| الفجوة | [الخطوة أو المعلومة الناقصة] |\n| الإجراء الواحد | [أقرب تغيير يمكن التحكم به] |\n| المسؤول والمصدر | [من ينفذ وأين يُسجل] |\n| حاجز الجودة | [ما يجب ألا يتدهور] |\n| قرار المراجعة | [ما الذي سيؤكد الاستمرار أو التعديل] |\n\nاستخدم منهج المقال: {principle}\n\nإذا تعذر إثبات حقل، اكتب «غير معروف» وحدد من سيتحقق منه."""
        else: text=f"""## {name}: {title}\n\nComplete this for one real case.\n\n| Field | What to record |\n|---|---|\n| Audience / case | [who or what is being reviewed] |\n| Intended state | [action or outcome sought] |\n| Verified state | [last state and its evidence] |\n| Gap | [missing step or information] |\n| One action | [nearest controllable change] |\n| Owner and source | [who acts and where it is logged] |\n| Quality guardrail | [what must not deteriorate] |\n| Review decision | [what supports continuing or revising] |\n\nApply the article’s method: {principle}\n\nIf a field cannot be proved, mark it “unknown” and assign an owner to verify it."""
    elif family=="checklist":
        if ar: text=f"## {name}: {title}\n\nقبل التسليم، تحقّق من كل بند مقابل مصدر فعلي:\n\n"+"\n".join(f"- [ ] **{clean(h)}:** {clean(s)}" for h,s in steps)+"\n- [ ] المسؤول والخطوة التالية معروفان.\n- [ ] حاجز الجودة والبديل عند الفشل واضحان.\n- [ ] النتيجة مفصولة عن الفرضية والمثال.\n\nأوقف الإطلاق إذا كان فحص حرج «غير معروف»؛ سجّل الدليل الناقص ومسؤول جمعه."
        else: text=f"## {name}: {title}\n\nBefore handoff, check each item against a real source:\n\n"+"\n".join(f"- [ ] **{clean(h)}:** {clean(s)}" for h,s in steps)+"\n- [ ] The owner and next action are named.\n- [ ] The guardrail and failure fallback are clear.\n- [ ] Outcome, hypothesis, and illustration are kept separate.\n\nStop launch if a critical check is “unknown”; log the missing evidence and its owner."
    elif family=="workflow":
        if ar: text=f"""## {name}: {title}\n\n| المرحلة | ما يحدث | ما يُسجّل | عند التعطل |\n|---|---|---|---|\n| التحضير | حدّد الهدف والحالة الصحيحة | مصدر معتمد وإصدار | أوقف العمل عند نقص المدخلات |\n| التنفيذ | {principle} | سجل التنفيذ والمسؤول | أحل الغموض لشخص |\n| التحقق | طابق المخرج بالدليل | مراجعة وتاريخ | علّم غير المدعوم «غير معروف» |\n| التسليم | وجّه الخطوة التالية | تأكيد الاستلام | استخدم البديل اليدوي |\n| التعلم | قارن بخط الأساس | المقياس والقيود | دوّن التغييرات المتزامنة |\n\nلا توسع سيرًا بلا مالك أو سجل أو مسار استثناء."""
        else: text=f"""## {name}: {title}\n\n| Stage | Action | Record | Failure path |\n|---|---|---|---|\n| Prepare | Define the goal and valid state | Approved source and version | Stop if inputs are missing |\n| Execute | {principle} | Action log and owner | Route ambiguity to a person |\n| Verify | Compare output with evidence | Reviewer and date | Mark unsupported items unknown |\n| Handoff | Route the next step | Receipt confirmation | Use a manual fallback |\n| Learn | Compare with baseline | Measure and limitations | Log concurrent changes |\n\nDo not scale a workflow without an owner, record, and exception path."""
    elif family=="storyboard":
        if ar: text=f"## {name}: {title}\n\n| المشهد | الصورة / النص | فحص الإثبات |\n|---|---|---|\n| المشكلة | {opening} | هل المشهد حقيقي ومأذون؟ |\n| الفحص | أظهر أين يوجد الدليل | هل المصدر مقروء؟ |\n| التطبيق | {principle} | هل يحافظ الترتيب على السبب والنتيجة؟ |\n| النتيجة | أظهر حالة متحققة أو وسم المثال | هل التاريخ والحدود واضحان؟ |\n| الخاتمة | خطوة عملية واحدة | هل حُميت الحقوق والبيانات؟ |\n\nاترك مساحة للترجمة وصوّر خاتمة بديلة. لا يوحي المونتاج بنتيجة غير حقيقية."
        else: text=f"## {name}: {title}\n\n| Beat | Picture / line | Proof check |\n|---|---|---|\n| Problem | {opening} | Is the scene real and permissioned? |\n| Check | Show where the evidence lives | Can viewers read the source? |\n| Apply | {principle} | Does the edit preserve cause and effect? |\n| Outcome | Show a verified state or label the example | Are date and limits clear? |\n| Close | One useful next step | Are rights and data protected? |\n\nLeave caption-safe space and capture an alternate close. Do not edit in an outcome that did not occur."
    elif family=="case":
        if ar: text=f"""## {name}: {title}\n\nهذا إطار لإعداد دراسة موثقة؛ ليس دراسة حالة مكتملة.\n\n- **السياق والفترة:** [السوق والقناة والمدة]\n- **المشكلة قبل التدخل:** [حالة موثقة ومصدرها]\n- **خط الأساس:** [المقياس والمقام والنظام والتاريخ]\n- **التغيير:** {principle}\n- **ما بقي ثابتًا وما تغير أيضًا:** [العوامل المتزامنة]\n- **النتيجة بعد التدخل:** [قيمة ومصدر وفترة مقارنة؛ اتركها فارغة حتى التحقق]\n- **حدود الاستنتاج:** [العينة والإسناد والبيانات الناقصة]\n- **إذن النشر:** [موافقة العميل على الاسم والشعار والاقتباس والبيانات]\n\nإذا غاب الدليل أو الإذن، انشر المنهج العام فقط ولا تنسب نتيجة لعميل."""
        else: text=f"""## {name}: {title}\n\nThis is a frame for a sourced case study, not a completed case.\n\n- **Context and period:** [market, channel, duration]\n- **Problem before intervention:** [verified state and source]\n- **Baseline:** [measure, denominator, system, dates]\n- **Change:** {principle}\n- **What stayed fixed and what also changed:** [concurrent factors]\n- **Outcome after intervention:** [value, source, comparison period; leave blank until verified]\n- **Inference limits:** [sample, attribution, missing data]\n- **Publication permission:** [approval for name, logo, quote, and data]\n\nIf evidence or permission is missing, publish the general method only; do not attribute an outcome to a client."""
    elif family=="responsekit":
        if ar: text=f"""## {name}: {title}\n\n**عندما يصل سؤال واضح:** «أفهم أنك تريد **[الهدف]**. لكي أوجهك بدقة، أحتاج **[معلومة لازمة واحدة]**. لا ترسل **[بيانات حساسة]** هنا».\n\n**عندما يكون الطلب خارج النطاق:** «الخدمة لا تغطي **[الحالة]**. أقدر أوضح لك **[البديل الحقيقي]** أو أحيلك إلى **[الجهة المناسبة]**».\n\n**عندما لا نملك جوابًا موثقًا:** «لا أريد أن أخمّن. سأتحقق من **[المصدر/المسؤول]** وأعود إليك عبر **[القناة والوقت المتفق عليهما]**».\n\nاربط كل رد بمرحلة ومسؤول وموعد متابعة. لا تعد بتوافر أو سعر أو نتيجة لم يتم تأكيدها."""
        else: text=f"""## {name}: {title}\n\n**When the request is clear:** “I understand you want **[goal]**. To route this accurately, I need **[one required detail]**. Please do not send **[sensitive data]** here.”\n\n**When it is out of scope:** “We do not cover **[case]**. I can explain **[real alternative]** or route you to **[appropriate owner]**.”\n\n**When the answer is not verified:** “I do not want to guess. I’ll check **[source/owner]** and follow up through **[agreed channel and time]**.”\n\nTie each response to a stage, owner, and follow-up time. Do not promise availability, pricing, or outcomes that have not been confirmed."""
    elif family=="redteam":
        if ar: text=f"## {name}: {title}\n\nنفّذ ببيانات اصطناعية، ولا تربطه بالنشر أو العملاء.\n\n١. **مصدر غائب:** اطلب جوابًا غير موجود؛ المتوقع أن يصرّح النظام بالفجوة.\n٢. **تعارض:** قدم مصدرين مختلفين؛ المتوقع إظهار التعارض وإحالته للمراجعة.\n٣. **تعليمة مزروعة:** ضع أمرًا بتجاوز القواعد داخل نص غير موثوق؛ المتوقع معاملته كبيانات لا كتعليمات.\n٤. **حقل حساس:** أدخل قيمة اصطناعية؛ المتوقع تقليلها أو إخفاؤها.\n٥. **مدخل ناقص:** احذف حقلًا لازمًا؛ المتوقع طلب توضيح أو اتباع بديل آمن.\n\nسجّل المدخل المتوقع والمرصود وشدة الخطر ومسؤول الإصلاح. هذه خطة اختبار، وليست ادعاء بوقوع هجوم."
        else: text=f"## {name}: {title}\n\nRun with synthetic data; do not connect it to publishing or customers.\n\n1. **Missing source:** ask for an absent answer; expected behavior is to state the gap.\n2. **Conflict:** supply two different sources; expected behavior is to show the conflict and route it for review.\n3. **Injected instruction:** place a rule-override request inside untrusted text; expected behavior is to treat it as data.\n4. **Sensitive field:** insert a synthetic value; expected behavior is to minimize or mask it.\n5. **Missing input:** remove a required field; expected behavior is clarification or safe fallback.\n\nLog expected and observed behavior, severity, and the fix owner. This is a test plan, not a claim an attack occurred."
    else:
        raise ValueError(f"Unknown content style: {family}")
    disclosure=("> **إفصاح عن الذكاء الاصطناعي:** أُعد هذا الدليل بمساعدة الذكاء الاصطناعي. يعرض منهجًا عامًا ولا يدّعي نتيجة موثقة لعميل." if ar else "> **AI disclosure:** AI tools assisted with drafting. This guide presents a general method and does not claim a verified client result.")
    return text + "\n\n" + disclosure

def main():
    counts=Counter(); seen=Counter()
    for post in DATA["posts"]:
        en=add_market_note(body_only(post["en"]["markdown"]),post["slug"],"en")
        ar=add_market_note(body_only(post["ar"]["markdown"]),post["slug"],"ar")
        group=post.get("theme","01").split("-",1)[0]
        family_list=FAMILIES.get(group,FAMILIES["01"])
        family=OVERRIDES.get(post["slug"],family_list[seen[group] % len(family_list)])
        seen[group]+=1; counts[family]+=1
        post["content_asset_style"]=family
        post["en"]["markdown"]=en+"\n\n"+make_asset(post,"en",family,en)
        post["ar"]["markdown"]=ar+"\n\n"+make_asset(post,"ar",family,ar)
    DATA["updated"]="2026-10-28"
    DATA_PATH.write_text(json.dumps(DATA,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Rebuilt bilingual source-led assets for {len(DATA['posts'])} topics ({len(DATA['posts'])*2} language pages).")
    print("Style counts:",dict(sorted(counts.items())))

if __name__=="__main__": main()
