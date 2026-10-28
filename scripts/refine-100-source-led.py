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

def body_only(md, strip_all_assets=False):
    heads = list(re.finditer(r"(?m)^##\s+[^\n]+$", md))
    if strip_all_assets:
        markers=("Short-video script:","Educational carousel:","Field experiment thread:","Tool-neutral prompt pack:","Stop-doing swipe file:","Hook–Value–Template:","سكريبت فيديو قصير:","كاروسيل تعليمي:","سلسلة تجربة ميدانية:","حزمة مطالبات محايدة للأدوات:","ملف أمثلة: أوقف هذا:","الخطاف والقيمة والقالب:")
        assets=[h for h in heads if any(h.group(0).startswith("## "+marker) for marker in markers)]
        if assets: return md[:assets[0].start()].rstrip()
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
        for sentence in ss:
            if sentence and (not steps or sentence != steps[-1][1]):
                steps.append((h,sentence))
            if len(steps)>=8: break
        if len(steps)>=8: break
    return opening, (sentences(relevant) or [relevant])[0], example, steps[:5]

def make_asset(post, lang, family, md):
    title=clean(post[lang]["title"])
    opening, principle, example, steps=material(md)
    example_line=(sentences(example) or [example])[0]
    steps=steps or [(title,principle)]
    lines="\n".join(f"{i}. **{clean(h)}:** {clean(s)}" for i,(h,s) in enumerate(steps,1))
    rows="\n".join(f"| {i} | {clean(h)} | {clean(s)[:140]} |" for i,(h,s) in enumerate(steps,1))
    ar=lang=="ar"
    digit=lambda n: str(n) if not ar else str(n).translate(str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩"))
    name=NAMES[lang][family]
    if family=="experiment":
        if ar: text=f"""## {name}: {title}\n\n**سلسلة تجربة قابلة للتنفيذ — خطة وليست نتيجة منشورة**\n\n**١/ سؤال الاختبار:** هل يساعد هذا الإجراء في معالجة المشكلة المحددة هنا: {opening}\n\n**٢/ الفرضية:** إذا نفذنا خطوة المقال التالية على [حالات مؤهلة محددة]، فينبغي أن نرى تغيرًا في [إشارة مرتبطة بالمشكلة] من دون تراجع [حاجز الجودة]. الإجراء: {principle}\n\n**٣/ خط الأساس:** سجّل [عدد الحالات المؤهلة] و[الإشارة] و[المصدر] و[الفترة] قبل التغيير. لا تخلط النقرات أو الطلبات أو النتائج النهائية.\n\n**٤/ التنفيذ:** غيّر هذا العامل وحده: [الخطوة المحددة أعلاه]. ثبّت بقية الظروف قدر الإمكان وسجّل الاستثناءات.\n\n**٥/ القرار:** قارن الفترة المحددة بخط أساس قابل للمقارنة. انشر القيمة الفعلية ومصدرها وحدود الإسناد، حتى إذا لم يتحسن المؤشر.\n\nأوقف الاختبار عند تعطل القياس أو تجاوز حاجز الجودة. لا تملأ النتائج مسبقًا ولا تسمِّ الخطة دراسة حالة مكتملة."""
        else: text=f"""## {name}: {title}\n\n**Executable experiment thread — a plan, not a reported result**\n\n**1/** **Question:** Can this action address the specific problem described here: {opening}\n\n**2/** **Hypothesis:** If we apply the article’s step to [defined eligible cases], [problem-linked signal] should change without harming [quality guardrail]. Action: {principle}\n\n**3/** **Baseline:** Record [eligible case count], [signal], [source], and [period] before the change. Keep clicks, requests, and completed outcomes separate.\n\n**4/** **Run:** Change only this factor: [the action above]. Hold other conditions steady where possible and log exceptions.\n\n**5/** **Decision:** Compare with a comparable baseline period. Report the observed value, source, and attribution limits—even if the signal did not improve.\n\nStop if tracking breaks or the guardrail crosses its agreed limit. Do not prefill results or describe this plan as a completed case study."""
    elif family=="carousel":
        if ar:
            points=[]
            for h,s in steps:
                point=clean(s)
                if point not in points and point not in {opening,principle}: points.append(point)
            cards=[f"١. **الغلاف:** {title}",f"٢. **المشكلة:** {opening}"]
            cards += [f"{digit(i)}. **خطوة من المقال:** {point}" for i,point in enumerate(points[:4],3)]
            cards += [f"{digit(len(cards)+1)}. **الدليل المطلوب:** {clean(example_line)}",f"{digit(len(cards)+2)}. **طبّقها:** {principle}"]
            text=f"## {name}: {title}\n\n"+"\n\n".join(cards)+"\n\n**ملاحظة إخراج:** فكرة واحدة في كل شريحة. سمِّ المثال توضيحيًا ما لم يكن قياسًا موثقًا، واختم بسؤال عملي مرتبط بقرار المقال."
        else:
            points=[]
            for h,s in steps:
                point=clean(s)
                if point not in points and point not in {opening,principle}: points.append(point)
            cards=[f"1. **Cover:** {title}",f"2. **Problem:** {opening}"]
            cards += [f"{digit(i)}. **Article step:** {point}" for i,point in enumerate(points[:4],3)]
            cards += [f"{digit(len(cards)+1)}. **Evidence to record:** {clean(example_line)}",f"{digit(len(cards)+2)}. **Apply it:** {principle}"]
            text=f"## {name}: {title}\n\n"+"\n\n".join(cards)+"\n\n**Production note:** Keep one idea per card. Label an illustration unless it is a sourced measurement, and close with a practical question tied to the article’s decision."
    elif family=="prompt":
        if ar: text=f"""## {name}: {title}\n\nيمكن تنفيذها يدويًا أو بمساعد نصي عام. أدخل مقتطف المقال وموادًا معتمدة بعد إزالة بيانات العملاء.\n\n**١ — استخرج قرار المقال**\n> من المادة الخاصة بـ«{title}»، حدّد قرار القارئ، والشرط الذي يغيّر القرار، والدليل اللازم. لا تضف حقائق من خارج المادة. اذكر ما ينقص صراحةً.\n\n**٢ — أنشئ أداة قابلة للاستخدام**\n> حوّل الإجراء التالي إلى [مخرج محدد: قائمة فحص/نموذج/سكريبت/مخطط]: {principle} اجعل كل خطوة قابلة للتحقق، واذكر المدخل والمسؤول ومصدر الإثبات والبديل عند غيابه.\n\n**٣ — راجع قبل الاستخدام**\n> طابق كل ادعاء بالمصدر. افصل الحقيقة عن المثال والفرضية، وافحص الخصوصية والاستثناءات. أعد أي خانة لا يدعمها دليل بصيغة «غير معروف»؛ لا تنشر المخرج ولا تنفذ إجراءً حيًا تلقائيًا."""
        else: text=f"""## {name}: {title}\n\nUse manually or with any general text assistant. Supply the relevant article excerpt and approved material with customer data removed.\n\n**1 — Extract the article’s decision**\n> From the material on “{title},” identify the reader’s decision, the condition that changes it, and the evidence needed. Add no facts from outside the material. Name what is missing.\n\n**2 — Build a usable asset**\n> Turn this action into a [specific output: checklist/form/script/map]: {principle} Make each step verifiable and state its input, owner, evidence source, and fallback when evidence is missing.\n\n**3 — Review before use**\n> Match every claim to a source. Separate fact, illustration, and hypothesis; check privacy and exceptions. Return unsupported fields as “unknown.” Do not publish the output or execute a live action automatically."""
    elif family=="swipe":
        if ar: text=f"""## {name}: {title}\n\n**توقف عن اختزال موضوع المقال في نتيجة واحدة:** «{title}: فعلنا [خطوة] إذن [نتيجة]». هذه الصياغة تقفز فوق الشروط والدليل.\n\n**اكتبها بهذه الصورة:** «في [الحالة المحددة]، نتحقق أولًا من [الدليل المرتبط بالموضوع]. إذا تأكد [الشرط]، ننفذ [الإجراء: {principle}] ونسجل [المقياس] من [المصدر] خلال [الفترة]. لا ننسب النتيجة للخطوة قبل مراجعة العوامل الأخرى».\n\n**مثال تحرير توضيحي:** {clean(example_line)}\n\nالمثال ليس اقتباسًا من عميل ولا حالة نجاح. لا تملأ النتيجة أو النسبة إلا ببيانات موثقة، واحتفظ بالخطوات التي لم تنجح أيضًا."""
        else: text=f"""## {name}: {title}\n\n**Stop collapsing this topic into one outcome:** “{title}: we took [step], therefore [result].” That skips the conditions and evidence.\n\n**Write it this way:** “For [defined case], first verify [topic-specific evidence]. If [condition] holds, take [action: {principle}] and record [measure] from [source] over [period]. Do not attribute the outcome to the step until other changes are reviewed.”\n\n**Illustrative editorial example:** {clean(example_line)}\n\nThis is not a client quote or success case. Fill in a result or percentage only from verified records, and retain cases where the method did not work."""
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
        if ar: text=f"""## {name}: {title}\n\n**المدة:** ٤٠–٤٥ ثانية · رأسي مع ترجمة واضحة\n\n**٠–٤ ث | الخطاف — لقطة قريبة للمشكلة**\nالتعليق: «{opening}»\n\n**٥–١٢ ث | وضّح ما يجب فحصه**\nعلى الشاشة: {clean(steps[0][1]) if steps else principle}\n\n**١٣–٢٨ ث | اعرض الإجراء بالتتابع**\nالتعليق: «{principle}»\nالصورة: لقطة فعلية للخطوة، مع إخفاء بيانات العملاء.\n\n**٢٩–٣٧ ث | أظهر الدليل والحدود**\nاستخدم: «{clean(example_line)}» وبيّن المصدر أو اكتب «مثال توضيحي».\n\n**٣٨–٤٥ ث | خطوة المشاهد التالية**\nاطلب منه تطبيق الفحص على حالة واحدة وتسجيل المصدر قبل اتخاذ القرار. لا تدّع نتيجة لم تُقَس."""
        else: text=f"""## {name}: {title}\n\n**Length:** 40–45 seconds · vertical with readable captions\n\n**0–4 sec | Hook — close-up on the problem**\nVoice: “{opening}”\n\n**5–12 sec | Name what to check**\nOn screen: {clean(steps[0][1]) if steps else principle}\n\n**13–28 sec | Demonstrate the action in sequence**\nVoice: “{principle}”\nVisual: show the actual step while masking customer data.\n\n**29–37 sec | Show the evidence and its limit**\nUse: “{clean(example_line)}” and identify its source, or label it “illustrative.”\n\n**38–45 sec | Viewer’s next step**\nAsk viewers to apply the check to one case and record the source before deciding. Do not claim an unmeasured result."""
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
    return text


ALL_SIX = ["video", "carousel", "experiment", "prompt", "swipe", "hvt"]

def make_hvt(post, lang, md):
    title=clean(post[lang]["title"])
    opening, principle, example, steps=material(md)
    if lang=="ar":
        return f"""## الخطاف والقيمة والقالب: {title}

**الخطاف:** {opening}

**القيمة:** {principle} ابدأ بتحديد الحالة ومصدرها، ثم نفّذ خطوة واحدة قابلة للمراجعة. لا تعتبر المثال أو الفرضية نتيجة مؤكدة.

**قالب قابل للتعبئة:** «في [السوق/الحالة] نريد [هدفًا محددًا]. الدليل الحالي هو [المصدر والتاريخ]. تشير المراجعة إلى [الفجوة المرتبطة بموضوع المقال]. سننفذ [خطوة واحدة] بواسطة [المسؤول]، ونقيس [إشارة أساسية] مع حماية [مؤشر الجودة]. نراجع في [موعد]؛ وإذا غاب الدليل نكتب: غير معروف».

**مثال توضيحي من موضوع المقال:** {clean((sentences(example) or [example])[0])}

المثال صياغة تعليمية، وليس نتيجة عميل أو ادعاءً بأن الطريقة نجحت بالفعل."""
    return f"""## Hook–Value–Template: {title}

**Hook:** {opening}

**Value:** {principle} Start by naming the state and its source, then take one reviewable step. Do not present an illustration or hypothesis as a verified outcome.

**Fill-in template:** “For [market/case], we want [specific goal]. Current evidence: [source and date]. The review points to [gap tied to this article]. [Owner] will take [one action], tracking [primary signal] while protecting [quality measure]. Review on [date]. If evidence is missing, record ‘unknown.’”

**Illustrative example from this topic:** {clean((sentences(example) or [example])[0])}

This is teaching copy, not a client result or a claim that the method has already worked."""

def word_count(md):
    return len(re.findall(r"\w+", md, flags=re.UNICODE))

def dedupe_exact_paragraphs(md):
    result=[]; seen=set()
    for paragraph in re.split(r"\n\s*\n",md.strip()):
        key=re.sub(r"\s+"," ",paragraph).strip()
        if key and key not in seen:
            seen.add(key); result.append(paragraph.strip())
    return "\n\n".join(result)

def main():
    counts=Counter()
    for post in DATA["posts"]:
        en=dedupe_exact_paragraphs(add_market_note(body_only(post["en"]["markdown"],"content_asset_styles" in post),post["slug"],"en"))
        ar=dedupe_exact_paragraphs(add_market_note(body_only(post["ar"]["markdown"],"content_asset_styles" in post),post["slug"],"ar"))
        assets_en=[make_asset(post,"en",family,en) for family in ALL_SIX if family!="hvt"]
        assets_ar=[make_asset(post,"ar",family,ar) for family in ALL_SIX if family!="hvt"]
        assets_en.append(make_hvt(post,"en",en))
        assets_ar.append(make_hvt(post,"ar",ar))
        post["content_asset_styles"]=ALL_SIX
        post.pop("content_asset_style",None)
        disclosure_en="> **AI disclosure:** AI tools assisted with drafting. This guide presents a general method and does not claim a verified client result."
        disclosure_ar="> **إفصاح عن الذكاء الاصطناعي:** أُعد هذا الدليل بمساعدة الذكاء الاصطناعي. يعرض منهجًا عامًا ولا يدّعي نتيجة موثقة لعميل."
        post["en"]["markdown"]=en+"\n\n"+"\n\n".join(assets_en)+"\n\n"+disclosure_en
        post["ar"]["markdown"]=ar+"\n\n"+"\n\n".join(assets_ar)+"\n\n"+disclosure_ar
        post["en"]["approx_words"]=word_count(post["en"]["markdown"])
        post["ar"]["approx_words"]=word_count(post["ar"]["markdown"])
        counts.update(ALL_SIX)
    DATA["updated"]="2026-10-28"
    DATA_PATH.write_text(json.dumps(DATA,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Applied all six styles to {len(DATA['posts'])} topics ({len(DATA['posts'])*2} language pages).")
    print("Per-language-page style sections:",dict(sorted(counts.items())))

if __name__=="__main__": main()
