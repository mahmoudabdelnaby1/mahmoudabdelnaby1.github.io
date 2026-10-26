#!/usr/bin/env python3
"""Render the bilingual, static Marketing Systems Lab catalogue from catalog.json."""
from __future__ import annotations

import html
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "labs" / "catalog.json"
BASE = "https://mahmoudabdelnaby1.github.io"
REPOSITORY = "https://github.com/mahmoudabdelnaby1/mahmoudabdelnaby1.github.io/tree/main/labs"

AREAS = {
    "SEO": ("Search & AI discovery", "البحث والظهور في محركات الإجابة"),
    "PPC": ("Paid media & acquisition", "الإعلانات المدفوعة واكتساب العملاء"),
    "SMM": ("Social media & community", "التواصل الاجتماعي والمجتمعات"),
    "CONTENT": ("Content & creative", "المحتوى والإبداع"),
    "EMAIL": ("Email & lifecycle", "البريد الإلكتروني ودورة حياة العميل"),
    "INFLUENCER": ("Influencer & creator operations", "المؤثرون وعمليات صنّاع المحتوى"),
    "VIDEO": ("Video & production", "الفيديو والإنتاج"),
    "CRO": ("Conversion & experimentation", "التحويل والتجارب"),
    "AUTOMATION": ("Marketing technology & operations", "تقنيات التسويق والعمليات"),
}

COPY = {
    "en": {
        "html_lang": "en", "dir": "ltr", "home": "Portfolio", "skills": "Skills",
        "frameworks": "Frameworks", "playbooks": "Playbooks", "eyebrow": "MARKETING SYSTEMS LAB",
        "title": "Marketing tool concepts, examined before they’re promised.",
        "lede": "A reviewed register of 89 distinct research-stage concepts spanning acquisition, content, search, analytics, commerce and marketing operations.",
        "status": "Research register · not a catalogue of released software",
        "count_label": "distinct concepts", "areas_label": "marketing disciplines",
        "notice_title": "What this collection represents",
        "notice": "These are candidate concepts from supplied research batches. Three overlapping ideas were merged. The review did not verify functioning products, market demand, licenses or production readiness; entries are not presented as released tools.",
        "browse": "Browse the concepts", "search_label": "Search concepts",
        "search_placeholder": "Search by concept or marketing area…", "filter_label": "Filter by area",
        "all": "All areas", "results": "Showing", "of": "of", "concepts": "concepts",
        "candidate": "Research-stage candidate", "source": "View the catalogue source on GitHub",
        "open_concept": "Open concept details", "dialog_close": "Close",
        "dialog_status": "Research-stage concept · not a released product",
        "dialog_summary": "This register contains the candidate idea and its related marketing areas only. It does not include a working tool, implementation, or verified outcomes for this concept.",
        "dialog_next_title": "What needs validation before development",
        "dialog_next": "Define the target user and specific problem, review existing alternatives and constraints, check technical feasibility and data access, then decide whether a small prototype is justified.",
        "back": "Back to the portfolio", "lang": "العربية", "empty": "No concepts match this search. Try another phrase or area.",
        "list_label": "Research-stage marketing tool concepts",
        "schema_name": "Marketing Systems Lab: Digital Marketing Tool Concepts",
        "schema_description": "An editorial register of 89 distinct research-stage digital marketing tool concepts. No entry is presented as verified software.",
    },
    "ar": {
        "html_lang": "ar", "dir": "rtl", "home": "المعرض", "skills": "المهارات",
        "frameworks": "الأطر", "playbooks": "الأدلة العملية", "eyebrow": "مختبر أنظمة التسويق",
        "title": "أفكار أدوات تسويقية ندرسها قبل أن نعد بها.",
        "lede": "سجل يضم ٨٩ تصورًا بحثيًا متميزًا في اكتساب العملاء والمحتوى والبحث والتحليلات والتجارة وعمليات التسويق.",
        "status": "سجل بحثي · ليس دليلًا لبرمجيات مطروحة",
        "count_label": "تصورًا متميزًا", "areas_label": "تخصصات تسويقية",
        "notice_title": "ماذا تضم هذه المجموعة؟",
        "notice": "هذه تصورات أولية مستخلصة من دفعات بحثية مقدمة. دُمجت ثلاثة أزواج متداخلة. لم يثبت هذا الفرز أن المنتجات تعمل أو أن الطلب السوقي أو التراخيص أو الجاهزية الإنتاجية مؤكدة؛ لذلك لا تُعرض العناصر كأدوات مطروحة.",
        "browse": "تصفّح التصورات", "search_label": "ابحث في التصورات",
        "search_placeholder": "ابحث باسم التصور أو التخصص…", "filter_label": "تصفية حسب التخصص",
        "all": "كل التخصصات", "results": "المعروض", "of": "من", "concepts": "تصورًا",
        "candidate": "تصور في مرحلة البحث", "source": "افتح مصدر الفهرس على GitHub",
        "open_concept": "افتح تفاصيل التصور", "dialog_close": "إغلاق",
        "dialog_status": "تصور في مرحلة البحث · ليس منتجًا مطروحًا",
        "dialog_summary": "يعرض هذا السجل اسم الفكرة المرشحة والمجالات التسويقية المرتبطة بها فقط. لا تتوفر لهذا التصور أداة عاملة أو تنفيذ أو نتائج متحقق منها.",
        "dialog_next_title": "ما الذي يحتاج إلى تحقق قبل التطوير؟",
        "dialog_next": "تحديد المستخدم والمشكلة المحددة، ومراجعة البدائل والقيود، وفحص الجدوى التقنية وإمكانية الوصول إلى البيانات، ثم تقرير ما إذا كان نموذج أولي محدود يستحق التنفيذ.",
        "back": "العودة إلى المعرض", "lang": "English", "empty": "لا توجد تصورات تطابق البحث. جرّب عبارة أو تخصصًا آخر.",
        "list_label": "تصورات أدوات التسويق في مرحلة البحث",
        "schema_name": "مختبر أنظمة التسويق: تصورات لأدوات التسويق الرقمي",
        "schema_description": "سجل تحريري يضم ٨٩ تصورًا بحثيًا متميزًا لأدوات في التسويق الرقمي. لا يُعرض أي عنصر كبرنامج تم التحقق من عمله.",
    },
}


def esc(value: str) -> str:
    return html.escape(str(value), quote=True)


def render(lang: str, records: list[dict]) -> str:
    c = COPY[lang]
    localized_counts = Counter(area for row in records for area in row["channels"])
    categories = [(key, *AREAS[key], localized_counts[key]) for key in AREAS]
    rows = []
    for number, record in enumerate(records, 1):
        title = esc(record["title"])
        slug = esc(record["slug"])
        channels = " ".join(record["channels"])
        tags = "".join(
            f'<span class="lab-tag" lang="{"ar" if lang == "ar" else "en"}" dir="ltr">{esc(AREAS[key][1 if lang == "ar" else 0])}</span>'
            for key in record["channels"]
        )
        searchable = " ".join([record["title"], *[AREAS[key][0] for key in record["channels"]], *[AREAS[key][1] for key in record["channels"]]])
        rows.append(
            f'<li class="lab-row" id="{slug}" data-channels="{esc(channels)}" data-search="{esc(searchable.lower())}">'
            f'<a class="lab-open" href="#{slug}" aria-haspopup="dialog" aria-controls="lab-detail-dialog" aria-label="{esc(c["open_concept"])}: {title}">'
            f'<span class="lab-number" aria-hidden="true">{number:02d}</span>'
            f'<span class="lab-row-main"><h3 class="lab-title" lang="en" dir="ltr">{title}</h3><span class="lab-tags">{tags}</span></span>'
            f'<span class="lab-open-icon" aria-hidden="true">↗</span></a>'
            f'</li>'
        )
    filters = [f'<button type="button" class="lab-filter is-active" data-filter="all" aria-pressed="true">{esc(c["all"])} <span>{len(records)}</span></button>']
    for key, en_name, ar_name, count in categories:
        if count:
            filters.append(f'<button type="button" class="lab-filter" data-filter="{key}" aria-pressed="false">{esc(ar_name if lang == "ar" else en_name)} <span>{count}</span></button>')
    items = [{"@type": "ListItem", "position": i, "name": row["title"], "url": f"{BASE}/{"ar/" if lang == "ar" else ""}labs/#{row["slug"]}"} for i, row in enumerate(records, 1)]
    schema = json.dumps({"@context": "https://schema.org", "@type": "CollectionPage", "name": c["schema_name"], "description": c["schema_description"], "url": f"{BASE}/{"ar/" if lang == "ar" else ""}labs/", "inLanguage": lang, "mainEntity": {"@type": "ItemList", "numberOfItems": len(records), "itemListElement": items}}, ensure_ascii=False, separators=(",", ":"))
    canonical = f'{BASE}/{"ar/" if lang == "ar" else ""}labs/'
    en_url, ar_url = f"{BASE}/labs/", f"{BASE}/ar/labs/"
    home = "/ar/#marketing-labs" if lang == "ar" else "/#marketing-labs"
    controls_dir = ' dir="rtl"' if lang == "ar" else ""
    return f'''<!doctype html>
<html lang="{c['html_lang']}" dir="{c['dir']}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(c['title'])} | Mahmoud Abdelnaby</title>
<meta name="description" content="{esc(c['schema_description'])}">
<link rel="canonical" href="{canonical}"><link rel="alternate" hreflang="en" href="{en_url}"><link rel="alternate" hreflang="ar" href="{ar_url}"><link rel="alternate" hreflang="x-default" href="{en_url}">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(c['schema_name'])}"><meta property="og:description" content="{esc(c['schema_description'])}"><meta property="og:url" content="{canonical}"><meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Manrope:wght@400;500;600;700;800&amp;family=Cairo:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=20261026-labs-v1"><link rel="stylesheet" href="/assets/marketing-labs.css?v=20261026-labs-interactive-v2">
<script type="application/ld+json">{schema}</script>
</head><body><div class="wrap labs-wrap">
<header class="topbar labs-topbar"><a class="brand" href="{('/ar/' if lang == 'ar' else '/')}">{('محمود <em>عبدالنبي</em>' if lang == 'ar' else 'MAHMOUD <em>ABDELNABY</em>')}</a><nav class="labs-nav" aria-label="{('التنقل الرئيسي' if lang == 'ar' else 'Main navigation')}"><a href="{('/ar/' if lang == 'ar' else '/')}">{esc(c['home'])}</a><a href="{('/ar/playbooks/' if lang == 'ar' else '/playbooks/')}">{esc(c['playbooks'])}</a><a href="{('/ar/frameworks/tasks/' if lang == 'ar' else '/frameworks/tasks/')}">{esc(c['frameworks'])}</a><a href="{('/ar/skills/' if lang == 'ar' else '/skills/')}">{esc(c['skills'])}</a><a class="lang" href="{('/labs/' if lang == 'ar' else '/ar/labs/')}">{esc(c['lang'])}</a></nav></header>
<main><a class="labs-back" href="{home}">← {esc(c['back'])}</a>
<section class="labs-hero" aria-labelledby="labs-title"><div class="labs-hero-copy"><span class="eyebrow">{esc(c['eyebrow'])}</span><h1 id="labs-title">{esc(c['title'])}</h1><p>{esc(c['lede'])}</p><span class="labs-status-line"><i aria-hidden="true"></i>{esc(c['status'])}</span></div><aside class="labs-hero-index" aria-label="{esc(c['count_label'])}"><span class="labs-index-label">{esc(c['eyebrow'])}</span><strong dir="ltr">{len(records)}</strong><span>{esc(c['count_label'])}</span><div class="labs-index-rule" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><small>{esc(c['areas_label'])} · {len(AREAS)}</small></aside></section>
<section class="labs-method" aria-labelledby="labs-method-title"><div class="labs-method-mark" aria-hidden="true">i</div><div><h2 id="labs-method-title">{esc(c['notice_title'])}</h2><p>{esc(c['notice'])}</p></div></section>
<section class="labs-catalog" aria-labelledby="labs-catalog-title"><div class="labs-section-heading"><div><span class="eyebrow">{esc(c['filter_label'])}</span><h2 id="labs-catalog-title">{esc(c['browse'])}</h2></div><p class="labs-results" aria-live="polite"><span id="labs-visible-count">{len(records)}</span> {esc(c['of'])} {len(records)} {esc(c['concepts'])}</p></div>
<label class="labs-search-label" for="labs-search">{esc(c['search_label'])}</label><input id="labs-search" class="labs-search" type="search" placeholder="{esc(c['search_placeholder'])}" autocomplete="off">
<div class="labs-filters" role="group" aria-label="{esc(c['filter_label'])}"{controls_dir}>{''.join(filters)}</div>
<ol class="labs-list" aria-label="{esc(c['list_label'])}">{''.join(rows)}</ol><p class="labs-empty" hidden>{esc(c['empty'])}</p>
<dialog class="lab-dialog" id="lab-detail-dialog" aria-labelledby="lab-dialog-title" aria-describedby="lab-dialog-summary">
<div class="lab-dialog-panel"><button class="lab-dialog-close" type="button" aria-label="{esc(c['dialog_close'])}">×</button>
<p class="lab-dialog-kicker">{esc(c['candidate'])}</p><h2 id="lab-dialog-title" dir="ltr" lang="en"></h2>
<div class="lab-tags lab-dialog-tags" id="lab-dialog-tags"></div>
<p class="lab-dialog-status">{esc(c['dialog_status'])}</p><p class="lab-dialog-summary" id="lab-dialog-summary">{esc(c['dialog_summary'])}</p>
<div class="lab-dialog-next"><h3>{esc(c['dialog_next_title'])}</h3><p>{esc(c['dialog_next'])}</p></div>
</div></dialog>
</section>
<section class="labs-source"><div><span class="eyebrow">{esc(c['source'])}</span><p>{esc(c['status'])}</p></div><a class="labs-source-link" href="{REPOSITORY}" target="_blank" rel="noopener noreferrer">{esc(c['source'])}<span aria-hidden="true">↗</span></a></section>
</main><footer class="footer"><div class="footer-grid"><span>© Mahmoud Abdelnaby · {esc(c['eyebrow'])}</span><span><a href="https://eg.linkedin.com/in/mahmoudabdelnaby4">LinkedIn</a> · <a href="https://github.com/mahmoudabdelnaby1">GitHub</a></span></div></footer>
</div><script defer src="/assets/marketing-labs.js?v=20261026-labs-interactive-v2"></script></body></html>'''


def main() -> None:
    records = json.loads(DATA.read_text(encoding="utf-8"))
    slugs = [r["slug"] for r in records]
    if len(records) != 89 or len(set(slugs)) != 89:
        raise SystemExit(f"Expected 89 unique research candidates, got {len(records)} records / {len(set(slugs))} slugs")
    known = set(AREAS)
    if any(not row["channels"] or set(row["channels"]) - known for row in records):
        raise SystemExit("Every candidate must have at least one recognized marketing area")
    (ROOT / "labs").mkdir(parents=True, exist_ok=True)
    (ROOT / "ar" / "labs").mkdir(parents=True, exist_ok=True)
    (ROOT / "labs" / "index.html").write_text(render("en", records), encoding="utf-8")
    (ROOT / "ar" / "labs" / "index.html").write_text(render("ar", records), encoding="utf-8")
    print(f"Rendered English and Arabic catalog pages for {len(records)} unique concepts across {len(AREAS)} areas.")


if __name__ == "__main__":
    main()
