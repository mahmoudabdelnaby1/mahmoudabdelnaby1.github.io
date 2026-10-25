#!/usr/bin/env python3
"""Build bilingual portfolio landing pages for the task-level framework library."""
from __future__ import annotations

import argparse
import csv
import html
import json
import re
import shutil
from pathlib import Path

BASE = "https://mahmoudabdelnaby1.github.io"
REPO = "https://github.com/mahmoudabdelnaby1/mena-ai-marketing-frameworks"
CATEGORY_AR = {
    "Search Engine Optimization (SEO)": "تحسين محركات البحث",
    "Pay-Per-Click (PPC) Advertising": "إعلانات الدفع مقابل النقر",
    "Social Media Marketing": "التسويق عبر وسائل التواصل الاجتماعي",
    "Content Marketing": "تسويق المحتوى",
    "Email Marketing": "التسويق عبر البريد الإلكتروني",
    "Influencer Marketing": "التسويق عبر المؤثرين",
    "Video Advertising": "إعلانات الفيديو",
    "CRO - Conversion Rate Optimization": "تحسين معدل التحويل",
    "Marketing Automation": "أتمتة التسويق",
}
TYPE_AR = {
    "CHECKLIST": "قائمة مراجعة", "DECISION_AID": "أداة قرار",
    "OPERATING_FRAMEWORK": "إطار عمل تشغيلي", "PROMPT_TEMPLATE": "قالب موجّه",
    "CONTENT_TEMPLATE": "قالب محتوى", "PLAYBOOK": "دليل عملي",
}


def read_field(path: Path, field: str) -> str:
    text = path.read_text(encoding="utf-8-sig")
    match = re.search(rf"(?im)^\s*-\s*\*\*{re.escape(field)}\s*\((?:EN|AR)\)\*\*:\s*(.+)$", text)
    return match.group(1).strip().rstrip(".`") if match else ""


def safe_desc(value: str, limit: int = 158) -> str:
    value = re.sub(r"[`*_]", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\b(?:guarantee|guarantees|guaranteed|compliant|compliance|approved|production-ready)\b", "reviewable", value, flags=re.I)
    if len(value) > limit:
        value = value[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:") + "…"
    return value


def page_shell(row: dict[str, str], slug: str, description: str, when_en: str, when_ar: str, language: str) -> str:
    en = language == "en"
    route = f"/frameworks/tasks/{slug}/"
    ar_route = f"/ar/frameworks/tasks/{slug}/"
    title = row["title_en"] if en else row["title_ar"]
    category = row["channel"] if en else CATEGORY_AR.get(row["channel"], row["channel"])
    lang_path = route if en else ar_route
    home = "/" if en else "/ar/"
    index = "/frameworks/tasks/" if en else "/ar/frameworks/tasks/"
    other = ar_route if en else route
    description_meta = description if en else row["title_ar"] + " — " + category + ". أداة عملية للمراجعة البشرية والتحقق من المصادر الحالية قبل التطبيق."
    github_folder = f"{REPO}/tree/main/task-frameworks/{row['folder_path']}"
    github_readme = f"{REPO}/blob/main/task-frameworks/{row['folder_path']}/README.md"
    github_sources = f"{REPO}/blob/main/task-frameworks/{row['folder_path']}/SOURCES.md"
    source_status = "Review draft · not legal or platform approval" if en else "مسودة للمراجعة · ليست اعتمادًا قانونيًا أو من المنصة"
    use_title = "When this helps" if en else "متى تساعدك هذه الأداة؟"
    use_text = when_en if en else (when_ar or "استخدمها لتوحيد خطوات العمل وجعل المدخلات والمراجعة البشرية والمخرجات أوضح.")
    utility = "This task-level aid is one of 92 specialized frameworks across nine digital-marketing disciplines. It complements the six cross-functional frameworks and the portfolio playbooks." if en else "هذه أداة متخصصة ضمن مكتبة من 92 إطارًا موزعة على تسعة تخصصات في التسويق الرقمي. وهي تكمل الأطر العامة الستة والأدلة العملية في المعرض."
    review = "Confirm current platform behavior, market rules, and evidence with primary sources and a qualified reviewer before applying this material. Examples are illustrative unless explicitly identified otherwise; they are not client results." if en else "تحقق من سلوك المنصة الحالي ومتطلبات السوق والأدلة عبر المصادر الأولية ومراجع مؤهل قبل التطبيق. الأمثلة توضيحية ما لم يُذكر غير ذلك، وليست نتائج لعملاء."
    artifact = row["artifact_type"] if en else TYPE_AR.get(row["artifact_type"], row["artifact_type"])
    jsonld = json.dumps({"@context":"https://schema.org","@type":"WebPage","name":title,"description":description_meta,"url":BASE+lang_path,"inLanguage":"en" if en else "ar","isPartOf":{"@type":"CollectionPage","name":"Digital marketing task frameworks","url":BASE+route}}, ensure_ascii=False)
    direction = "ltr" if en else "rtl"
    switch = "العربية" if en else "English"
    nav_name = "Task frameworks" if en else "الأطر المتخصصة"
    overview = "Portfolio" if en else "المعرض"
    label = "DIGITAL MARKETING TASK FRAMEWORK" if en else "إطار متخصص في التسويق الرقمي"
    return f'''<!doctype html>
<html lang="{language}" dir="{direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} | Mahmoud Abdelnaby</title><meta name="description" content="{html.escape(description_meta, quote=True)}">
<link rel="canonical" href="{BASE+lang_path}"><link rel="alternate" hreflang="en" href="{BASE+route}"><link rel="alternate" hreflang="ar" href="{BASE+ar_route}"><link rel="alternate" hreflang="x-default" href="{BASE+route}">
<meta property="og:type" content="article"><meta property="og:title" content="{html.escape(title, quote=True)}"><meta property="og:description" content="{html.escape(description_meta, quote=True)}"><meta property="og:url" content="{BASE+lang_path}"><meta name="theme-color" content="#09121c">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Manrope:wght@400;500;600;700;800&amp;family=Space+Grotesk:wght@400;500;600;700&amp;family=Cairo:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/site.css?v=20261025-task-frameworks-v1"><link rel="stylesheet" href="/assets/frameworks.css?v=20261025-task-frameworks-v1"><script type="application/ld+json">{jsonld}</script></head>
<body class="framework-page"><header class="framework-topbar"><a class="framework-brand" href="{home}">Mahmoud <span>Abdelnaby</span></a><nav><a href="{index}">{nav_name}</a><a href="{other}">{switch}</a></nav></header>
<main class="framework-shell"><nav class="framework-crumb"><a href="{home}">{overview}</a><span aria-hidden="true">/</span><a href="{index}">{nav_name}</a><span aria-hidden="true">/</span><span>{row['framework_id']}</span></nav>
<header class="framework-detail-hero task-framework-hero"><span class="framework-eyebrow">{label} · {row['framework_id']}</span><p class="task-framework-category">{html.escape(category)} · {html.escape(artifact)}</p><h1>{html.escape(title)}</h1><p>{html.escape(description)}</p><div class="framework-hero-actions"><a class="framework-action" href="{github_folder}" target="_blank" rel="noopener noreferrer">{'Open the complete working files on GitHub' if en else 'افتح ملفات الإطار الكاملة على GitHub'} <span aria-hidden="true">↗</span></a><a class="framework-action framework-action-quiet" href="{github_sources}" target="_blank" rel="noopener noreferrer">{'Review source notes' if en else 'راجع ملاحظات المصادر'} <span aria-hidden="true">↗</span></a></div></header>
<div class="framework-detail-grid task-framework-grid"><section><span class="framework-eyebrow">01</span><h2>{use_title}</h2><p>{html.escape(use_text)}</p></section><section><span class="framework-eyebrow">02</span><h2>{'What it is' if en else 'ما طبيعة الأداة؟'}</h2><p>{html.escape(utility)}</p></section><section class="framework-overlap"><span class="framework-eyebrow">03</span><h2>{'Review before use' if en else 'مراجعة قبل الاستخدام'}</h2><p>{html.escape(review)}</p><p class="task-framework-status">{source_status}</p></section></div>
<footer class="framework-footer"><a href="{index}">{nav_name}</a><a href="{github_readme}" target="_blank" rel="noopener noreferrer">{'Framework files' if en else 'ملفات الإطار'} ↗</a><a href="{other}">{switch}</a></footer></main></body></html>'''


def index_page(rows: list[dict[str, str]], language: str) -> str:
    en = language == "en"
    route = "/frameworks/tasks/" if en else "/ar/frameworks/tasks/"
    other = "/ar/frameworks/tasks/" if en else "/frameworks/tasks/"
    home = "/" if en else "/ar/"
    title = "Digital marketing task frameworks" if en else "أطر متخصصة لمهام التسويق الرقمي"
    desc = "Browse 92 task-level working frameworks across SEO, paid media, social, content, email, influencers, video, conversion, and automation." if en else "استكشف 92 إطارًا عمليًا متخصصًا في تحسين البحث والإعلانات والسوشيال والمحتوى والبريد والمؤثرين والفيديو والتحويل والأتمتة."
    groups: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        groups.setdefault(row["channel"], []).append(row)
    sections=[]
    i=0
    for category, items in groups.items():
        category_label=category if en else CATEGORY_AR.get(category,category)
        cards=[]
        for row in items:
            slug=Path(row["folder_path"]).name
            page=f"/{'frameworks/tasks' if en else 'ar/frameworks/tasks'}/{slug}/"
            number=row["framework_id"].replace("FW-","")
            t=row["title_en"] if en else row["title_ar"]
            other_t=row["title_ar"] if en else row["title_en"]
            summary=read_field(Path(row["folder_path"])/"README.md", "One-Sentence Promise")
            if not summary: summary=other_t
            summary=safe_desc(summary,190)
            artifact=row["artifact_type"] if en else TYPE_AR.get(row["artifact_type"],row["artifact_type"])
            cards.append(f'<a class="framework-row task-framework-row" href="{page}"><span class="framework-row-index" dir="ltr">{number}</span><span class="framework-row-copy"><small>{html.escape(artifact)}</small><strong>{html.escape(t)}</strong><span>{html.escape(summary)}</span></span><span class="framework-row-arrow" aria-hidden="true">↗</span></a>')
        sections.append(f'<section class="task-framework-category" id="discipline-{i}"><header><span class="framework-eyebrow">{i+1:02d} · {len(items)} {"frameworks" if en else "أطر"}</span><h2>{html.escape(category_label)}</h2></header><div class="framework-index">{"".join(cards)}</div></section>')
        i+=1
    eyebrow="SPECIALIZED LIBRARY · 92 FRAMEWORKS" if en else "مكتبة متخصصة · 92 إطارًا"
    intro=("A growing, task-level library for practical work across digital marketing. Each item links to its full working files, examples, and source notes. The six cross-functional frameworks remain a separate collection.") if en else ("مكتبة متنامية لأطر عملية متخصصة في مهام التسويق الرقمي. يرتبط كل إطار بملفاته وأمثلته وملاحظات مصادره. وتظل الأطر العامة الستة مجموعة منفصلة.")
    caution=("A source review consolidated 500 eligible pattern IDs into 92 distinct assets; 408 patterns were merged rather than published as separate frameworks. This library is general guidance, not legal or platform approval. Check current primary sources and assign human review before use.") if en else ("دُمجت 500 مُدخل مؤهل من مراجعة المصادر في 92 أداة مستقلة؛ جرى دمج 408 مُدخلات ضمنها ولم تُنشر كأطر منفصلة. هذه المكتبة إرشادات عامة وليست اعتمادًا قانونيًا أو موافقة من منصة. تحقق من المصادر الأولية الحالية وعيّن مراجعًا بشريًا قبل الاستخدام.")
    github=f"{REPO}/tree/main/task-frameworks"
    jsonld=json.dumps({"@context":"https://schema.org","@type":"CollectionPage","name":title,"description":desc,"url":BASE+route,"inLanguage":language,"numberOfItems":92},ensure_ascii=False)
    direction="ltr" if en else "rtl"
    switch="العربية" if en else "English"
    return f'''<!doctype html><html lang="{language}" dir="{direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} | Mahmoud Abdelnaby</title><meta name="description" content="{html.escape(desc,quote=True)}"><link rel="canonical" href="{BASE+route}"><link rel="alternate" hreflang="en" href="{BASE+'/frameworks/tasks/'}"><link rel="alternate" hreflang="ar" href="{BASE+'/ar/frameworks/tasks/'}"><link rel="alternate" hreflang="x-default" href="{BASE+'/frameworks/tasks/'}"><meta property="og:type" content="website"><meta property="og:title" content="{html.escape(title,quote=True)}"><meta property="og:description" content="{html.escape(desc,quote=True)}"><meta property="og:url" content="{BASE+route}"><meta name="theme-color" content="#09121c"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Manrope:wght@400;500;600;700;800&amp;family=Space+Grotesk:wght@400;500;600;700&amp;family=Cairo:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/site.css?v=20261025-task-frameworks-v1"><link rel="stylesheet" href="/assets/frameworks.css?v=20261025-task-frameworks-v1"><script type="application/ld+json">{jsonld}</script></head><body class="framework-page"><header class="framework-topbar"><a class="framework-brand" href="{home}">Mahmoud <span>Abdelnaby</span></a><nav><a href="{route}">{title}</a><a href="{other}">{switch}</a></nav></header><main class="framework-shell"><nav class="framework-crumb"><a href="{home}">{'Portfolio' if en else 'المعرض'}</a><span aria-hidden="true">/</span><span>{title}</span></nav><header class="framework-hero"><span class="framework-eyebrow">{eyebrow}</span><h1>{'Practical systems for the work behind digital marketing' if en else 'أطر عملية لمهام التسويق الرقمي'}</h1><p>{intro}</p><p class="framework-caution">{caution}</p><div class="framework-hero-actions"><a class="framework-action" href="{github}" target="_blank" rel="noopener noreferrer">{'Browse the full source library on GitHub' if en else 'تصفح المكتبة المصدرية على GitHub'} <span aria-hidden="true">↗</span></a><a class="framework-action framework-action-quiet" href="{'/frameworks/' if en else '/ar/frameworks/'}">{'The six cross-functional frameworks' if en else 'الأطر العامة الستة'} <span aria-hidden="true">↗</span></a></div></header><nav class="task-framework-jump" aria-label="{'Browse by discipline' if en else 'تصفح حسب التخصص'}">{"".join(f'<a href="#discipline-{j}">{html.escape(c if en else CATEGORY_AR.get(c,c))}<span>{len(v)}</span></a>' for j,(c,v) in enumerate(groups.items()))}</nav>{''.join(sections)}<footer class="framework-footer"><a href="{home}">{'Portfolio' if en else 'المعرض'}</a><a href="{github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="{other}">{switch}</a></footer></main></body></html>'''


def main() -> None:
    ap=argparse.ArgumentParser()
    ap.add_argument("source",type=Path,help="Path to the mena-ai-marketing-frameworks repository")
    ap.add_argument("--out",type=Path,default=Path(__file__).resolve().parents[1])
    args=ap.parse_args()
    source=args.source.resolve(); out=args.out.resolve()
    with (source/"task-frameworks"/"FRAMEWORK-CATALOG.csv").open(encoding="utf-8-sig",newline="") as f:
        rows=list(csv.DictReader(f))
    if len(rows)!=92 or len({r["framework_id"] for r in rows})!=92:
        raise SystemExit(f"Expected 92 unique catalog assets; found {len(rows)} rows")
    # Resolve metadata against the supplied source tree while rendering indexes.
    global read_field
    original=read_field
    def source_read(path: Path, field: str) -> str:
        return original(source/"task-frameworks"/path,field)
    read_field=source_read
    en_root=out/"frameworks"/"tasks"; ar_root=out/"ar"/"frameworks"/"tasks"
    en_root.mkdir(parents=True,exist_ok=True); ar_root.mkdir(parents=True,exist_ok=True)
    (en_root/"index.html").write_text(index_page(rows,"en"),encoding="utf-8")
    (ar_root/"index.html").write_text(index_page(rows,"ar"),encoding="utf-8")
    for row in rows:
        folder=source/"task-frameworks"/row["folder_path"]
        readme=folder/"README.md"
        slug=Path(row["folder_path"]).name
        desc=safe_desc(read_field(folder/"README.md","One-Sentence Promise")) or row["title_en"]
        # Avoid exposure of internal IDs, scores, and merge ledger on public portfolio pages.
        en_when=read_field(readme,"Trigger")
        ar_when=read_field(readme,"داعي الاستخدام")
        if not ar_when:
            ar_when="تُستخدم عند الحاجة إلى " + row["title_ar"].rstrip(".") + "."
        (en_root/slug/"index.html").parent.mkdir(parents=True,exist_ok=True)
        (en_root/slug/"index.html").write_text(page_shell(row,slug,desc,en_when,ar_when,"en"),encoding="utf-8")
        (ar_root/slug/"index.html").parent.mkdir(parents=True,exist_ok=True)
        (ar_root/slug/"index.html").write_text(page_shell(row,slug,desc,en_when,ar_when,"ar"),encoding="utf-8")
    (en_root/"catalog.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Generated {len(rows)} task framework pages per language and two indexes in {out}")

if __name__=="__main__": main()
