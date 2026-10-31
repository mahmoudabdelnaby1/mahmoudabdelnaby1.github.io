"""Generate the static Arabic marketing-tools routes and bilingual resource finder."""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://mahmoudabdelnaby1.github.io"
TOOLS = json.loads((ROOT / "apps/shared/tools-index.json").read_text(encoding="utf-8-sig"))
BY_ID = {tool["id"]: tool for tool in TOOLS}


def localize_simple_elements(source: str, lang: str) -> str:
    """Set text nodes with paired data-en/data-ar values to the route's static language."""
    def replace_text(match: re.Match[str]) -> str:
        attrs = match.group("attrs")
        en = re.search(r'\bdata-en="([^"]*)"', attrs)
        ar = re.search(r'\bdata-ar="([^"]*)"', attrs)
        if not en or not ar:
            return match.group(0)
        selected = html.unescape(ar.group(1) if lang == "ar" else en.group(1))
        return f'<{match.group("tag")}{attrs}>{html.escape(selected)}</{match.group("tag")}>'

    source = re.sub(
        r'<(?P<tag>[A-Za-z][\w:-]*)(?P<attrs>[^>]*)>(?P<body>[^<]*)</(?P=tag)>',
        replace_text,
        source,
    )
    def localize_placeholder(match: re.Match[str]) -> str:
        tag = match.group(0)
        en = re.search(r'\bdata-en="([^"]*)"', tag)
        ar = re.search(r'\bdata-ar="([^"]*)"', tag)
        if not en or not ar or not re.search(r'\bplaceholder="', tag):
            return tag
        placeholder = html.escape(html.unescape(ar.group(1) if lang == "ar" else en.group(1)), quote=True)
        return re.sub(r'\bplaceholder="[^"]*"', f'placeholder="{placeholder}"', tag, count=1)
    return re.sub(r'<input\b[^>]*>', localize_placeholder, source)


def trim_meta(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    cut = text.rfind(" ", 0, limit)
    if cut < limit * 0.6:
        cut = limit - 1
    return text[:cut].rstrip(" ,;:|-") + "…"


def localize_title_tag(source: str, title_en: str, title_ar: str) -> str:
    match = re.search(r'<title\b[^>]*>[^<]*</title>', source, re.I)
    if not match:
        return source
    tag = match.group(0)
    for name, value in (("data-en", title_en), ("data-ar", title_ar)):
        tag = re.sub(rf'\b{name}="[^"]*"', f'{name}="{html.escape(value, quote=True)}"', tag, count=1)
    return source[:match.start()] + tag + source[match.end():]

# Each problem card points to one practical guide, one relevant skill area, and two tools.
PROBLEMS = [
    ("quality", "Why are my leads low quality?", "عندي عملاء محتملون كثيرون لكن جودتهم ضعيفة", "Trace qualification, form friction, scoring, and sales handoff before changing the campaign.", "راجع التأهيل واحتكاك النموذج والتقييم وتسليم العميل للمبيعات قبل تغيير الحملة.", ("APP-083", "APP-064"), "education-lead-quality-review", "07-b2b-leadgen-abm-revops"),
    ("profit", "I spend on ads but cannot tell if the business is profitable.", "أنفق على الإعلانات ولا أعرف إن كان النشاط يربح فعلًا", "Compare contribution economics, blended return, and channel decisions using real business inputs.", "اربط هامش الربح بالعائد الكلي وقرارات توزيع الإنفاق باستخدام بيانات النشاط.", ("APP-009", "APP-004"), "revenue-roas-reconciliation", "10-data-measurement-attribution-mmm"),
    ("checkout", "Customers add products to the cart, then leave before paying.", "الناس تضيف المنتجات إلى السلة ثم تغادر قبل الدفع", "Locate checkout leakage and review delivery, COD, shipping, and payment assumptions.", "حدّد تسرب الطلبات وراجع التوصيل والدفع عند الاستلام والشحن ووسائل الدفع.", ("APP-062", "APP-011"), "ecommerce-funnel-diagnostic", "08-ecommerce-marketplaces-feeds-merch"),
    ("localization", "My Arabic ads sound translated and do not connect with the market.", "إعلاناتي العربية تبدو مترجمة ولا تتواصل مع الجمهور", "Adapt language, dialect, cultural context, hooks, and calls to action for a defined MENA audience.", "كيّف اللغة واللهجة والسياق الثقافي والخطاف والدعوة للإجراء لجمهور محدد في المنطقة.", ("APP-041", "APP-066"), "arabic-market-copy-localizer", "04-content-creative-media"),
    ("visibility", "My site is not appearing in search or useful AI answers.", "موقعي لا يظهر في البحث أو الإجابات المفيدة للذكاء الاصطناعي", "Start with crawlable pages, clear answers, language targeting, structured information, and evidence.", "ابدأ بالصفحات القابلة للزحف والإجابات الواضحة واستهداف اللغة والبيانات المنظمة والأدلة.", ("APP-021", "APP-028"), "arabic-aeo-geo-visibility-kit", "03-organic-discovery-seo-aeo-geo"),
    ("whatsapp", "People click WhatsApp but conversations do not become orders.", "تصلني نقرات واتساب لكن المحادثات لا تتحول إلى طلبات", "Separate clicks from received inquiries, response handling, qualified leads, and completed orders.", "افصل بين النقرة والرسالة المستلمة وسرعة الرد وتأهيل العميل والطلب المكتمل.", ("APP-038", "APP-035"), "whatsapp-order-follow-up", "06-lifecycle-crm-email-sms-whatsapp"),
    ("content", "I need a repeatable content and short-video workflow.", "أحتاج إلى طريقة متكررة لإنتاج المحتوى والفيديو القصير", "Connect the editorial calendar, scripts, hooks, production steps, and review into one workflow.", "اربط التقويم التحريري والسيناريوهات والخطافات وخطوات الإنتاج والمراجعة في سير عمل واحد.", ("APP-042", "APP-046"), "organic-content-video-operations", "04-content-creative-media"),
    ("creator", "Is an influencer's rate worth paying?", "لا أعرف إن كان سعر المؤثر يستحق ما سأدفعه", "Review audience quality, rate assumptions, usage rights, deliverables, and alternatives.", "راجع جودة الجمهور وافتراضات السعر وحقوق الاستخدام والتسليمات والبدائل.", ("APP-051", "APP-053"), "tiktok-spark-ugc-mena-factory", "05-social-community-influencer-ugc"),
    ("measurement", "Several platforms claim the same sale and I cannot compare channels.", "تحتسب منصات متعددة المبيعة نفسها ولا أستطيع مقارنة القنوات", "Reconcile measurement views and compare attribution assumptions against business records.", "طابق تقارير القياس وقارن افتراضات الإسناد بسجلات النشاط الفعلية.", ("APP-072", "APP-071"), "commerce-measurement-planning", "10-data-measurement-attribution-mmm"),
    ("seasonal", "A seasonal sale may grow revenue but damage my margin.", "قد يرفع الموسم المبيعات لكنه يضر هامش الربح", "Plan discount depth, inventory, media, and operational readiness together.", "خطط للخصم والمخزون والإنفاق الإعلاني والاستعداد التشغيلي معًا.", ("APP-091", "APP-044"), "mena-white-friday-11-11-war-room", "08-ecommerce-marketplaces-feeds-merch"),
    ("email", "My email campaigns are not reaching customers consistently.", "رسائل البريد لا تصل إلى العملاء بانتظام", "Review permission, list hygiene, sender practices, and a safe re-engagement approach.", "راجع الموافقات ونظافة القائمة وممارسات الإرسال وخطة إعادة التفاعل الآمنة.", ("APP-085", "APP-100"), "permission-email-deliverability-review", "06-lifecycle-crm-email-sms-whatsapp"),
    ("expansion", "I want to enter a GCC market with a realistic acquisition plan.", "أريد دخول سوق خليجي وأحتاج إلى خطة اكتساب واقعية", "Model market-entry spend, qualified-lead economics, and localized campaign assumptions.", "قدّر إنفاق دخول السوق واقتصاديات العميل المؤهل وافتراضات الحملة المحلية.", ("APP-093", "APP-081"), "mena-cross-border-ppc-guardrails", "01-strategy-research-positioning-gtm"),
]


def app_routes() -> None:
    for tool in TOOLS:
        slug = tool["href"].strip("/")
        en_path = ROOT / "apps" / slug / "index.html"
        source = en_path.read_text(encoding="utf-8")
        en_url, ar_url = f"{BASE}/apps/{slug}/", f"{BASE}/ar/apps/{slug}/"
        title_en, title_ar = trim_meta(tool["titleEn"], 60), trim_meta(tool["titleAr"], 60)
        description_en, description_ar = trim_meta(tool["descriptionEn"], 160), trim_meta(tool["descriptionAr"], 160)
        source = re.sub(r'<html lang="[^"]*" dir="[^"]*">', '<html lang="en" dir="ltr">', source, count=1)
        source = localize_title_tag(source, title_en, title_ar)
        source = re.sub(
            r'<meta name="description"[^>]*>',
            f'<meta name="description" content="{html.escape(description_en, quote=True)}" data-en="{html.escape(description_en, quote=True)}" data-ar="{html.escape(description_ar, quote=True)}">',
            source, count=1,
        )
        source = re.sub(r'\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">', '', source)
        source = re.sub(
            r'<link rel="canonical" href="[^"]*">',
            f'<link rel="canonical" href="{en_url}">\n  <link rel="alternate" hreflang="en" href="{en_url}">\n  <link rel="alternate" hreflang="ar" href="{ar_url}">\n  <link rel="alternate" hreflang="x-default" href="{en_url}">',
            source, count=1,
        )
        source = re.sub(
            r'(<p class="app-promise"[^>]*data-ar=")[^"]*("[^>]*>)[\s\S]*?(</p>)',
            lambda m: m.group(1) + html.escape(tool["descriptionAr"], quote=True) + m.group(2) + html.escape(tool["descriptionEn"]) + m.group(3),
            source, count=1,
        )
        source = localize_simple_elements(source, "en")
        en_path.write_text(source, encoding="utf-8")

        ar_url_path = ROOT / "ar" / "apps" / slug / "index.html"
        ar_url_path.parent.mkdir(parents=True, exist_ok=True)
        ar_source = source.replace(f'<link rel="canonical" href="{en_url}">', f'<link rel="canonical" href="{ar_url}">', 1)
        ar_source = re.sub(r'<html lang="[^"]*" dir="[^"]*">', '<html lang="ar" dir="rtl">', ar_source, count=1)
        ar_source = ar_source.replace('../shared/', '/apps/shared/')
        ar_source = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + html.escape(description_ar, quote=True) + m.group(2), ar_source, count=1)
        ar_source = localize_simple_elements(ar_source, "ar")
        ar_url_path.write_text(ar_source, encoding="utf-8")
        for asset in en_path.parent.iterdir():
            if asset.is_file() and asset.name != "index.html":
                (ar_url_path.parent / asset.name).write_bytes(asset.read_bytes())

    # Localize all app-card summaries in the index from the verified tools data.
    en_index = ROOT / "apps" / "index.html"
    text = en_index.read_text(encoding="utf-8")
    text = re.sub(r'<html lang="[^"]*" dir="[^"]*">', '<html lang="en" dir="ltr">', text, count=1)
    text = re.sub(r'\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">', '', text)
    text = text.replace(
        f'<link rel="canonical" href="{BASE}/apps/">',
        f'<link rel="canonical" href="{BASE}/apps/">\n  <link rel="alternate" hreflang="en" href="{BASE}/apps/">\n  <link rel="alternate" hreflang="ar" href="{BASE}/ar/apps/">\n  <link rel="alternate" hreflang="x-default" href="{BASE}/apps/">', 1,
    )
    text = localize_title_tag(text, "MENA Marketing Tools | 100 Browser-Based Apps", "أدوات تسويق رقمية لمصر والخليج | 100 أداة")
    description_en = "100 browser-based digital marketing tools for Egypt, Saudi Arabia, UAE, and GCC markets."
    description_ar = "مئة أداة تسويق رقمية تعمل داخل المتصفح لمصر والسعودية والإمارات وأسواق الخليج، للتخطيط والقياس والتحسين."
    text = re.sub(r'<meta name="description"[^>]*>', f'<meta name="description" content="{description_en}" data-en="{description_en}" data-ar="{description_ar}">', text, count=1)
    for tool in TOOLS:
        marker = f'data-id="{tool["id"]}"'
        at = text.find(marker)
        if at == -1:
            continue
        start = text.find('<p class="catalog-card-desc"', at)
        end = text.find('>', start) + 1
        tag = text[start:end]
        tag = re.sub(r'data-ar="[^"]*"', f'data-ar="{html.escape(tool["descriptionAr"], quote=True)}"', tag, count=1)
        text = text[:start] + tag + text[end:]
    text = localize_simple_elements(text, "en")
    en_index.write_text(text, encoding="utf-8")

    ar_index = ROOT / "ar" / "apps" / "index.html"
    ar_index.parent.mkdir(parents=True, exist_ok=True)
    localized = text.replace(f'<link rel="canonical" href="{BASE}/apps/">', f'<link rel="canonical" href="{BASE}/ar/apps/">', 1)
    localized = re.sub(r'<html lang="[^"]*" dir="[^"]*">', '<html lang="ar" dir="rtl">', localized, count=1)
    localized = localized.replace('href="shared/', 'href="/apps/shared/').replace('src="shared/', 'src="/apps/shared/')
    localized = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + description_ar + m.group(2), localized, count=1)
    localized = localize_simple_elements(localized, "ar")
    ar_index.write_text(localized, encoding="utf-8")


def resource_page(lang: str) -> str:
    ar = lang == "ar"
    root_prefix = "/ar/" if ar else "/"
    title = "دليل الموارد حسب المشكلة | محمود عبدالنبي" if ar else "Find a Marketing Resource by Problem | Mahmoud Abdelnaby"
    description = "ابدأ من تحدٍ تسويقي واضح، ثم انتقل إلى أدوات وأدلة ومهارات عملية موجودة بالفعل." if ar else "Start with a real marketing challenge and find relevant browser-based tools, practical guides, and skill areas."
    cards = []
    for number, p in enumerate(PROBLEMS, 1):
        key, en_title, ar_title, en_desc, ar_desc, tool_ids, guide, skill = p
        links = []
        search_text = [key, en_title, ar_title, en_desc, ar_desc]
        for tool_id in tool_ids:
            tool = BY_ID[tool_id]
            slug = tool["href"].strip("/")
            href = f'{root_prefix}apps/{slug}/'
            label = tool["titleAr"] if ar else tool["titleEn"]
            kind = "أداة تفاعلية" if ar else "Interactive tool"
            links.append(f'<a class="resource-link" href="{href}"><span>{kind}</span><strong>{html.escape(label)}</strong><b aria-hidden="true">↗</b></a>')
            search_text += [tool["titleEn"], tool["titleAr"], tool["descriptionEn"], tool["descriptionAr"]]

        section = "playbooks" if (ROOT / root_prefix.lstrip("/") / "playbooks" / guide / "index.html").exists() else "marketing-systems"
        guide_path = ROOT / root_prefix.lstrip("/") / section / guide / "index.html"
        skill_path = ROOT / root_prefix.lstrip("/") / "skill-areas" / skill / "index.html"
        guide_html = guide_path.read_text(encoding="utf-8")
        skill_html = skill_path.read_text(encoding="utf-8")
        guide_title = re.search(r"<title>(.*?)</title>", guide_html, re.I | re.S)
        skill_title = re.search(r"<title>(.*?)</title>", skill_html, re.I | re.S)
        guide_label = html.unescape(guide_title.group(1)).split("|")[0].strip() if guide_title else guide
        skill_label = html.unescape(skill_title.group(1)).split("|")[0].strip() if skill_title else skill
        search_text.extend([guide_label, skill_label, "practical guide playbook skill area tool", "دليل عملي أداة مهارة"])
        links.append(f'<a class="resource-link" href="{root_prefix}{section}/{guide}/"><span>{"دليل عملي" if ar else "Practical guide"}</span><strong>{html.escape(guide_label)}</strong><b aria-hidden="true">↗</b></a>')
        links.append(f'<a class="resource-link" href="{root_prefix}skill-areas/{skill}/"><span>{"مجال مهاري" if ar else "Skill area"}</span><strong>{html.escape(skill_label)}</strong><b aria-hidden="true">↗</b></a>')
        title_text = ar_title if ar else en_title
        desc_text = ar_desc if ar else en_desc
        cards.append(
            f'<article class="resource-card" data-search="{html.escape(" ".join(search_text), quote=True)}">'
            f'<div class="resource-card-head"><span class="resource-index">{number:02d}</span><span class="resource-card-kicker">{"ابدأ من هنا" if ar else "START HERE"}</span></div>'
            f'<h2>{html.escape(title_text)}</h2><p>{html.escape(desc_text)}</p><div class="resource-links">{"".join(links)}</div></article>'
        )

    if ar:
        eyebrow, h1 = "دليل الموارد · ابدأ من المشكلة", "ما الذي تحاول حله؟"
        intro = "اكتب المشكلة كما تصفها لفريقك، أو اختر موقفًا قريبًا منها. البحث محلي بالكلمات الواردة في فهرس الموارد؛ لا يرسل استفسارك إلى خادم أو نموذج ذكاء اصطناعي."
        placeholder = "مثال: العملاء بيسألوا على واتساب ومش بيكملوا الطلب"
        search_label, count_label = "ابحث بوصف المشكلة", "مجالًا عمليًا"
        help_text = "البحث يقارن وصفك بالأدوات والأدلة والمهارات المتاحة."
        examples = ["عندي مشكلة في جودة العملاء المحتملين", "الإعلانات بتصرف ومش عارفين بنربح ولا لا", "مشكلة في إتمام الدفع", "كيف أكتب إعلانًا باللهجة المناسبة؟"]
        empty = "لا توجد موارد قريبة من الوصف. جرّب كلمات أبسط أو اختر مشكلة من القائمة."
        footer = "الأدوات تعمل داخل المتصفح، والأدلة ومجالات المهارات تشرح مسارات أوسع. تختلف النتائج حسب بياناتك وسياق نشاطك."
        nav = '<a href="/ar/resources/">الموارد</a><a href="/ar/apps/">الأدوات</a><a href="/ar/playbooks/">الأدلة</a><a href="/ar/skills/">المهارات</a><a class="lang" href="/resources/">English</a>'
        back = "العودة إلى الملف المهني"
        more_title = "استكشف المكتبات الأخرى"
        more = [
            ("/ar/frameworks/tasks/", "مكتبة الأطر", "مناهج منظمة لمهام التسويق الرقمي."),
            ("/ar/blog/", "المدونة والمقالات", "شروحات عملية لأسئلة وقرارات التسويق."),
            ("/ar/assistants/library/", "مكتبة المساعدين", "مساعدون متخصصون مع نطاق استخدام واضح."),
            ("/ar/repositories/", "مستودعات GitHub", "مشروعات وأدوات ومراجع مفتوحة المصدر."),
        ]
    else:
        eyebrow, h1 = "RESOURCE FINDER · START WITH THE PROBLEM", "What are you trying to solve?"
        intro = "Describe the issue in your own words, or choose a situation below. Search runs in this page against the resource index; it does not send your query to a server or an AI model."
        placeholder = "For example: people ask on WhatsApp but do not complete the order"
        search_label, count_label = "Search by describing the problem", "problem areas"
        help_text = "Search matches your wording against available tools, guides, and skill areas."
        examples = ["Why are my leads low quality?", "I spend on ads but cannot see profit", "Customers click WhatsApp but do not order", "How do I enter a GCC market?"]
        empty = "No close match. Try simpler words or choose a problem area below."
        footer = "Tools run in your browser. Guides and skill areas offer broader workflows. Results depend on your inputs and business context."
        nav = '<a href="/resources/">Resources</a><a href="/apps/">Tools</a><a href="/playbooks/">Playbooks</a><a href="/skills/">Skills</a><a class="lang" href="/ar/resources/">العربية</a>'
        back = "Back to portfolio"
        more_title = "Explore the other libraries"
        more = [
            ("/frameworks/tasks/", "Task frameworks", "Structured methods for specific digital marketing tasks."),
            ("/blog/", "Blog and articles", "Practical explanations for marketing questions and decisions."),
            ("/assistants/library/", "Assistant library", "Specialized assistants with clearly scoped instructions."),
            ("/repositories/", "GitHub repositories", "Open-source projects, tools, and reference material."),
        ]

    more_cards = "".join(f'<a class="resource-more-card" href="{href}"><strong>{html.escape(label)}</strong><span>{html.escape(note)}</span><b aria-hidden="true">↗</b></a>' for href, label, note in more)

    canonical = f"{BASE}{root_prefix}resources/"
    en_url, ar_url = f"{BASE}/resources/", f"{BASE}/ar/resources/"
    return f'''<!doctype html><html lang="{lang}" dir="{'rtl' if ar else 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><meta name="description" content="{html.escape(description, quote=True)}"><link rel="canonical" href="{canonical}"><link rel="alternate" hreflang="en" href="{en_url}"><link rel="alternate" hreflang="ar" href="{ar_url}"><link rel="alternate" hreflang="x-default" href="{en_url}"><meta property="og:type" content="website"><meta property="og:title" content="{html.escape(title, quote=True)}"><meta property="og:description" content="{html.escape(description, quote=True)}"><meta property="og:url" content="{canonical}"><link rel="stylesheet" href="/assets/site.css?v=20261031-resources-v1"><link rel="stylesheet" href="/assets/resources.css?v=20261031-resources-v1"><script type="application/ld+json">{{"@context":"https://schema.org","@type":"CollectionPage","name":{json.dumps(title, ensure_ascii=False)},"description":{json.dumps(description, ensure_ascii=False)},"url":"{canonical}","inLanguage":"{lang}","isPartOf":{{"@type":"WebSite","name":"Mahmoud Abdelnaby | Technical Marketing & Growth","url":"{BASE}/"}}}}</script></head><body><div class="resources-shell wrap"><header class="topbar"><a class="brand" href="{root_prefix}">MAHMOUD <em>ABDELNABY</em></a><nav class="resource-nav" aria-label="{'التنقل الرئيسي' if ar else 'Primary navigation'}">{nav}</nav></header><main><section class="resource-hero"><p class="eyebrow">{eyebrow}</p><h1>{h1}</h1><p class="resource-intro">{intro}</p><label class="sr-only" for="resource-search">{search_label}</label><div class="resource-search-wrap"><input id="resource-search" type="search" autocomplete="off" placeholder="{html.escape(placeholder, quote=True)}" aria-describedby="search-help"><span class="resource-count"><b id="result-count">{len(PROBLEMS)}</b> {count_label}</span></div><p class="resource-search-help" id="search-help">{help_text}</p><div class="query-chips" aria-label="{'أمثلة للبحث' if ar else 'Search examples'}">{"".join(f'<button type="button" class="query-chip">{html.escape(x)}</button>' for x in examples)}</div></section><section class="resource-grid" id="resource-grid" aria-live="polite">{"".join(cards)}</section><p class="resource-empty" id="resource-empty" hidden>{empty}</p><section class="resource-more"><h2>{more_title}</h2><div class="resource-more-grid">{more_cards}</div></section></main><footer class="resource-footer"><p>{footer}</p><a href="{root_prefix}">{back}</a></footer></div><script src="/assets/resources.js?v=20261031-resources-v1" defer></script></body></html>'''


def build_resources() -> None:
    for lang in ("en", "ar"):
        out = ROOT / ("ar/" if lang == "ar" else "") / "resources" / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(resource_page(lang), encoding="utf-8")
    (ROOT / "assets/resources.css").write_text(""".resources-shell{max-width:1160px}.resource-nav{display:flex;align-items:center;gap:18px;flex-wrap:wrap;font-size:14px;color:var(--muted)}.resource-hero{padding:74px 0 42px;max-width:850px}.resource-hero h1{font-size:clamp(42px,7vw,78px);line-height:1.02;letter-spacing:-.055em;margin:16px 0}.resource-intro{font-size:18px;color:#495766;max-width:760px}.resource-search-wrap{display:flex;gap:14px;align-items:center;margin-top:28px}.resource-search-wrap input{min-width:0;flex:1;border:1px solid #506575;border-radius:14px;background:#fff;color:var(--ink);padding:16px 18px;box-shadow:var(--shadow)}.resource-search-wrap input:focus{outline:3px solid rgba(20,168,154,.25);border-color:var(--teal)}.resource-count{white-space:nowrap;color:var(--muted);font-size:14px}.resource-search-help{color:var(--muted);font-size:13px;margin:8px 0}.query-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:15px}.query-chip{border:1px solid var(--line);border-radius:99px;background:#fffdf8;color:var(--ink);padding:8px 12px;cursor:pointer;font-size:13px}.query-chip:hover,.query-chip:focus-visible{border-color:var(--teal);color:#087f79}.resource-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:16px 0 54px}.resource-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 10px 30px rgba(18,38,53,.05)}.resource-card-head{display:flex;justify-content:space-between;align-items:center;color:#087f79;font-size:12px;font-weight:850;letter-spacing:.08em}.resource-index{font-size:13px}.resource-card h2{font-size:21px;line-height:1.25;margin:14px 0 8px;letter-spacing:-.025em}.resource-card>p{color:var(--muted);font-size:14px;margin:0 0 18px}.resource-links{display:grid;gap:8px}.resource-link{display:grid;grid-template-columns:105px 1fr auto;gap:12px;align-items:center;padding:11px 12px;border:1px solid var(--line);border-radius:12px;background:#fffdf8}.resource-link:hover{border-color:var(--teal);color:#087f79}.resource-link span{font-size:11px;color:var(--muted)}.resource-link strong{font-size:13px;line-height:1.35}.resource-link b{font-size:17px;color:#087f79}.resource-empty{padding:28px 0;color:var(--muted)}.resource-footer{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:24px 0 42px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}.resource-footer p{max-width:750px}html[dir=rtl] .resource-nav,html[dir=rtl] .resource-search-wrap,html[dir=rtl] .resource-card-head,html[dir=rtl] .resource-footer{direction:rtl}html[dir=rtl] .resource-hero h1,html[dir=rtl] .resource-card{text-align:right}@media(max-width:760px){.resource-nav{gap:10px;font-size:12px}.resource-hero{padding:48px 0 28px}.resource-grid{grid-template-columns:1fr}.resource-search-wrap{align-items:stretch;flex-direction:column}.resource-count{white-space:normal}.resource-link{grid-template-columns:85px 1fr auto}.resource-footer{align-items:flex-start;flex-direction:column}}""" + "\n", encoding="utf-8")
    with (ROOT / "assets/resources.css").open("a", encoding="utf-8") as css:
        css.write(".resource-more{padding:0 0 54px}.resource-more h2{font-size:clamp(24px,4vw,34px);letter-spacing:-.04em}.resource-more-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.resource-more-card{display:flex;flex-direction:column;gap:7px;background:var(--blue);color:white;border-radius:16px;padding:17px}.resource-more-card:hover{background:#087f79;color:white}.resource-more-card span{color:#d1dce0;font-size:12px}.resource-more-card b{align-self:flex-end}@media(max-width:900px){.resource-more-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.resource-more-grid{grid-template-columns:1fr 1fr}}\n")
    (ROOT / "assets/resources.js").write_text("""(function(){'use strict';var input=document.getElementById('resource-search');var cards=Array.from(document.querySelectorAll('.resource-card'));var count=document.getElementById('result-count');var empty=document.getElementById('resource-empty');function normalize(value){return(value||'').toLocaleLowerCase().normalize('NFKD').replace(/[\\u064b-\\u065f\\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[ؤئ]/g,'ء').replace(/[^\\p{L}\\p{N}]+/gu,' ').trim()}function filter(){var terms=normalize(input.value).split(/\\s+/).filter(Boolean);var visible=0;cards.forEach(function(card){var text=normalize(card.dataset.search);var match=!terms.length||terms.some(function(term){return text.includes(term)});card.hidden=!match;if(match)visible++});count.textContent=String(visible);empty.hidden=visible!==0}input.addEventListener('input',filter);document.querySelectorAll('.query-chip').forEach(function(button){button.addEventListener('click',function(){input.value=button.textContent;filter();input.focus()})});filter()})();""", encoding="utf-8")


def update_navigation() -> None:
    additions = {
        ROOT / "index.html": ('<a href="/apps/">Marketing tools</a>', '<a href="/apps/">Marketing tools</a><a href="/resources/">Find resources by problem</a>'),
        ROOT / "ar/index.html": ('<a href="/apps/">الأدوات التسويقية</a>', '<a href="/ar/apps/">الأدوات التسويقية</a><a href="/ar/resources/">دليل الموارد حسب المشكلة</a>'),
    }
    for path, (old, new) in additions.items():
        text = path.read_text(encoding="utf-8")
        if new not in text:
            if old not in text:
                raise ValueError(f"Navigation insertion point not found in {path}")
            path.write_text(text.replace(old, new, 1), encoding="utf-8")

    llms = ROOT / "llms.txt"
    llms_text = llms.read_text(encoding="utf-8")
    llms_text = llms_text.replace(
        f"{BASE}/#assistant-library", f"{BASE}/assistants/library/", 1
    ).replace(
        f"{BASE}/ar/#assistant-library", f"{BASE}/ar/assistants/library/", 1
    )
    section = """## Problem-first resource finder

- [English resource finder](https://mahmoudabdelnaby1.github.io/resources/)
- [دليل الموارد حسب المشكلة](https://mahmoudabdelnaby1.github.io/ar/resources/)

## Browser-based marketing tools

- [English marketing tools](https://mahmoudabdelnaby1.github.io/apps/)
- [الأدوات التسويقية بالعربية](https://mahmoudabdelnaby1.github.io/ar/apps/)

## GitHub repositories

- [English repository directory](https://mahmoudabdelnaby1.github.io/repositories/)
- [دليل مستودعات GitHub](https://mahmoudabdelnaby1.github.io/ar/repositories/)

"""
    if "## Problem-first resource finder" not in llms_text:
        anchor = "## Assistant library"
        if anchor not in llms_text:
            raise ValueError("Assistant library section missing from llms.txt")
        llms_text = llms_text.replace(anchor, section + anchor, 1)
    if "## GitHub repositories" not in llms_text:
        repo_section = "## GitHub repositories\n\n- [English repository directory](https://mahmoudabdelnaby1.github.io/repositories/)\n- [دليل مستودعات GitHub](https://mahmoudabdelnaby1.github.io/ar/repositories/)\n\n"
        llms_text = llms_text.replace("## Assistant library", repo_section + "## Assistant library", 1)
    llms.write_text(llms_text, encoding="utf-8")

    shared = ROOT / "apps/shared/shared.js"
    js = shared.read_text(encoding="utf-8")
    old = """  // Check saved preference or URL param
  try {
    var savedLang = localStorage.getItem('dm_app_lang');
    if (savedLang === 'en' || savedLang === 'ar') {
      currentLang = savedLang;
    }
  } catch (e) {
    // LocalStorage disabled or sandboxed
  }
"""
    new = """  // Locale-specific URLs win on first load; saved preference is the fallback.
  var routeLang = /^\\/ar\\/apps(?:\\/|$)/.test(window.location.pathname) ? 'ar'
    : /^\\/apps(?:\\/|$)/.test(window.location.pathname) ? 'en' : null;
  try {
    var savedLang = localStorage.getItem('dm_app_lang');
    currentLang = routeLang || ((savedLang === 'en' || savedLang === 'ar') ? savedLang : 'en');
  } catch (e) {
    currentLang = routeLang || 'en';
  }
"""
    if old in js:
        js = js.replace(old, new, 1)
    if "var description = document.querySelector('meta[name=\"description\"][data-en][data-ar]');" not in js:
        js = js.replace("    var localizedLinks = document.querySelectorAll('[data-href-en][data-href-ar]');", "    var description = document.querySelector('meta[name=\"description\"][data-en][data-ar]');\n    if (description) description.setAttribute('content', description.getAttribute('data-' + lang));\n\n    var localizedLinks = document.querySelectorAll('[data-href-en][data-href-ar]');", 1)
    js = js.replace("'/apps/', '/apps/', 'portfolio-tools-context'", "'/apps/', '/ar/apps/', 'portfolio-tools-context'")
    js = js.replace("['Marketing tools', 'الأدوات التسويقية', '/apps/', '/apps/']", "['Marketing tools', 'الأدوات التسويقية', '/apps/', '/ar/apps/']")
    js = js.replace("link.href = new URL('/apps/' + tool.href, window.location.origin).href;", "link.href = new URL((currentLang === 'ar' ? '/ar/apps/' : '/apps/') + tool.href, window.location.origin).href;")
    line = "      ['Marketing tools', 'الأدوات التسويقية', '/apps/', '/ar/apps/'],"
    resource = "      ['Find resources by problem', 'دليل الموارد حسب المشكلة', '/resources/', '/ar/resources/'],"
    if resource not in js:
        js = js.replace(line, line + "\n" + resource, 1)
    shared.write_text(js, encoding="utf-8")


def update_sitemap() -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text(encoding="utf-8")

    def pair(en: str, ar: str) -> None:
        nonlocal text
        for loc in (en, ar):
            block_pattern = re.compile(r"  <url>\s*<loc>" + re.escape(loc) + r"</loc>[\s\S]*?</url>")
            match = block_pattern.search(text)
            links = "\n".join((
                f'    <xhtml:link rel="alternate" hreflang="en" href="{en}" />',
                f'    <xhtml:link rel="alternate" hreflang="ar" href="{ar}" />',
                f'    <xhtml:link rel="alternate" hreflang="x-default" href="{en}" />',
            ))
            if match:
                block = re.sub(r"\s*<xhtml:link\b[^>]*/>", "", match.group(0))
                block = re.sub(r"</loc>", "</loc>\n" + links, block, count=1)
                text = text[:match.start()] + block + text[match.end():]
            else:
                block = f'  <url>\n    <loc>{loc}</loc>\n{links}\n  </url>\n'
                text = text.replace("</urlset>", block + "</urlset>", 1)

    pair(f"{BASE}/apps/", f"{BASE}/ar/apps/")
    for tool in TOOLS:
        slug = tool["href"].strip("/")
        pair(f"{BASE}/apps/{slug}/", f"{BASE}/ar/apps/{slug}/")
    pair(f"{BASE}/resources/", f"{BASE}/ar/resources/")
    path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    app_routes()
    build_resources()
    update_navigation()
    update_sitemap()
    print("Generated 100 Arabic app detail routes, Arabic tools index, bilingual resource finders, and reciprocal sitemap alternates.")
