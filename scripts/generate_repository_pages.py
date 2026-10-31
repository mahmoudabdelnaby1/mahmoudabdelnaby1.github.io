from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"D:\different files\github projects\Repository Opportunity\portfolio")
BASE = "https://mahmoudabdelnaby1.github.io"
CATALOG = ROOT / "repositories" / "catalog-source.json"

LABELS = {
    "en": {
        "portfolio": "Portfolio", "directory": "All repositories", "problem": "Problem it addresses",
        "files": "What is inside", "use": "How to evaluate and use it", "limits": "Scope and limitations",
        "related": "Related repositories", "repo": "Open the original GitHub repository",
        "lang": "العربية", "faq": "Quick answers", "who": "Who it is for",
    },
    "ar": {
        "portfolio": "الملف المهني", "directory": "كل المستودعات", "problem": "المشكلة التي يعالجها",
        "files": "محتويات المستودع", "use": "طريقة مراجعته واستخدامه", "limits": "النطاق والقيود",
        "related": "مستودعات مرتبطة", "repo": "افتح مستودع GitHub الأصلي",
        "lang": "English", "faq": "إجابات سريعة", "who": "لمن صُمم؟",
    },
}

CATEGORY_AR = {
    "automation": "الأتمتة", "career": "المسار المهني والمهارات", "content": "أنظمة المحتوى",
    "cro": "تحسين التحويل", "e-commerce": "التجارة الإلكترونية", "localization": "التوطين",
    "media-buying": "شراء الوسائط", "reporting": "التقارير والتحليلات", "seo": "تحسين الظهور والبحث",
    "social": "التواصل الاجتماعي",
}

FORMAT_AR = {
    "CLI_SCRIPT": "أداة سطر أوامر",
    "CURATED_DATASET": "مجموعة بيانات منتقاة",
    "PROJECT_BLUEPRINT": "مخطط مشروع",
    "SKILL_MD": "مهارة تشغيلية",
    "STATIC_INTERACTIVE_TOOL": "أداة تفاعلية",
    "TEMPLATE_FRAMEWORK": "قالب وإطار عمل",
}


def section(text: str, heading: str) -> str:
    match = re.search(rf"^##[^\n]*{re.escape(heading)}[^\n]*\n([\s\S]*?)(?=^##\s+|\Z)", text, re.M | re.I)
    return match.group(1).strip() if match else ""


def clean_md(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"\1", value)
    value = re.sub(r"^#+\s*", "", value, flags=re.M)
    value = re.sub(r"\s+", " ", value).strip()
    return re.sub(r"\s*---\s*$", "", value).strip()


def bullets(text: str) -> list[str]:
    return [clean_md(m.group(1)) for m in re.finditer(r"^\s*[-*]\s+(.+?)\s*$", text, re.M) if m.group(1).strip()]


def first_paragraph(text: str) -> str:
    for part in re.split(r"\n\s*\n", text):
        if part.strip() and not part.lstrip().startswith(("#", "[", "!", "-", "*", "```", ">")):
            return clean_md(part)
    return ""


def read_repo(item: dict) -> dict:
    readme = SOURCE / item["slug"] / "README.md"
    if not readme.is_file():
        return {key: item.get(key, []) for key in (
            "title_en", "tagline_en", "persona_en", "problem_en", "deliverables", "constraints_en", "quick_start"
        )}
    text = readme.read_text(encoding="utf-8")
    title = re.search(r"^#\s+(.+)$", text, re.M)
    tagline = re.search(r"^>\s*(.+)$", text, re.M)
    persona_section = section(text, "Problem Statement & Target Persona")
    persona_match = re.search(r"###\s+Target Persona\s*([\s\S]*?)(?=\n\s*###|\Z)", persona_section, re.I)
    problem_match = re.search(r"###\s+Core Problem\s*([\s\S]*?)(?=\n\s*(?:###|##|---)|\Z)", persona_section, re.I)
    deliverables_section = section(text, "Repository Architecture & Deliverables")
    constraints_section = section(text, "Known Technical & Domain Constraints")
    quick = section(text, "Quick Start & How to Run Locally")
    code = re.findall(r"```(?:bash|sh|powershell|pwsh)?\s*\n([\s\S]*?)```", quick, re.I)
    return {
        "title_en": clean_md(title.group(1)) if title else item["title_en"],
        "tagline_en": clean_md(tagline.group(1)) if tagline else item.get("tagline_en", ""),
        "persona_en": clean_md(persona_match.group(1)) if persona_match else item.get("persona_en", ""),
        "problem_en": clean_md(problem_match.group(1)) if problem_match else item.get("problem_en", ""),
        "deliverables": bullets(deliverables_section) or item.get("deliverables", []),
        "constraints_en": bullets(constraints_section) or item.get("constraints_en", []),
        "quick_start": [line.strip() for block in code for line in block.splitlines()
                        if line.strip() and not line.strip().startswith("#")
                        and not line.strip().lower().startswith(("export pythondontwritebytecode", "$env:pythondontwritebytecode"))][:5] or item.get("quick_start", []),
    }


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def category_name(item: dict, lang: str) -> str:
    return CATEGORY_AR.get(item["category"], item["category"]) if lang == "ar" else item["category"].replace("-", " ").title()


def render(item: dict, all_items: list[dict], lang: str) -> str:
    slug = item["slug"]
    en_url, ar_url = f"{BASE}/repositories/{slug}/", f"{BASE}/ar/repositories/{slug}/"
    here = ar_url if lang == "ar" else en_url
    title = item["title_en"]
    display_name = item.get("title_ar", title) if lang == "ar" else title
    display_title = f"دليل المستودع: {display_name}" if lang == "ar" else title
    description = (
        f"دليل عربي لمستودع {display_name}: المشكلة التي يعالجها، الملفات التي يضمها، طريقة مراجعته، وحدود استخدامه."
        if lang == "ar" else (item["tagline_en"] or f"Explore {title}: its problem, intended audience, deliverables, usage notes, and limitations.")
    )
    intro = (
        f"صفحة تعريفية مستقلة بمستودع {display_name}. توضّح ما الذي يحاول حله، ولمن يناسب، وما الملفات التي ستجدها قبل الانتقال إلى المصدر."
        if lang == "ar" else (item["tagline_en"] or f"A source-based guide to {title}, including its intended use, included files, and practical limitations.")
    )
    category = category_name(item, lang)
    labels = LABELS[lang]
    problem = item["problem_en"] or item["tagline_en"] or title
    persona = item["persona_en"] or ("للمهنيين والفرق التي تواجه هذه المهمة." if lang == "ar" else "Practitioners and teams working on this task.")
    files = item["deliverables"][:12]
    constraints = item["constraints_en"][:5]
    related = [x for x in all_items if x["slug"] != slug and x["category"] == item["category"]][:3]
    related_markup = "".join(
        f'<li><a href="/{"ar/" if lang == "ar" else ""}repositories/{esc(x["slug"])}/">{esc(x.get("title_ar", x["title_en"]) if lang == "ar" else x["title_en"])}</a></li>' for x in related
    )
    files_markup = "".join(f"<li><code>{esc(f)}</code></li>" for f in files) or f"<li>{esc(title)}</li>"
    limits_markup = "".join(f"<li>{esc(c)}</li>" for c in constraints)
    if not limits_markup:
        limits_markup = f"<li>{'راجع التوثيق والبيانات التجريبية قبل الاعتماد، ولا تعتبر المثال نتيجة مؤكدة.' if lang == 'ar' else 'Review the documentation and sample data before relying on outputs; examples are not verified outcomes.'}</li>"
    if lang == "ar":
        problem_section = f'<p>{esc("يوضح التوثيق الأصلي نطاق المشكلة بهذا الوصف:")}</p><blockquote lang="en" dir="ltr">{esc(problem)}</blockquote>'
        audience = f'<p>{esc("الجمهور المحدد في README:")} <span lang="en" dir="ltr">{esc(persona)}</span></p>'
        use_steps = [
            "ابدأ بقراءة README وتأكد أن المشكلة المذكورة تطابق احتياجك الفعلي.",
            "افحص الملفات المذكورة أعلاه؛ أسماء الملفات توضح مكان البيانات والأدوات والقوالب والاختبارات.",
            "اتبع Quick Start الموجود في README، وتحقق من المتطلبات قبل تشغيل أي أمر.",
            "قارن المخرجات بعينة موثقة، وراجع القيود قبل استخدامها في قرار أو عمل عميل.",
        ]
        quick_label = "أمثلة أوامر البدء من README" if item["quick_start"] else "خطوة البدء"
        quick_value = " · ".join(item["quick_start"][:3]) if item["quick_start"] else "افتح README وراجع قسم الاستخدام والمتطلبات."
        quick_note = f'<p class="repo-source-note"><strong>{quick_label}:</strong> <code dir="ltr">{esc(quick_value)}</code></p>'
    else:
        problem_section = f'<p>{esc(problem)}</p>'
        audience = f'<p>{esc(persona)}</p>'
        use_steps = [
            "Read the README first and confirm that the documented problem matches your use case.",
            "Inspect the listed files to find the data, tools, templates, and tests relevant to your task.",
            "Follow the repository’s Quick Start and check prerequisites before running commands.",
            "Compare outputs with documented examples and review limitations before using them in a decision or client workflow.",
        ]
        quick_label = "Quick Start from the README" if item["quick_start"] else "Start here"
        quick_value = " · ".join(item["quick_start"][:3]) if item["quick_start"] else "Open the README and review its setup and usage sections."
        quick_note = f'<p class="repo-source-note"><strong>{quick_label}:</strong> <code dir="ltr">{esc(quick_value)}</code></p>'
    steps_markup = "".join(f"<li>{esc(s)}</li>" for s in use_steps)
    schema = json.dumps({"@context": "https://schema.org", "@type": "WebPage", "name": display_title,
        "description": description, "inLanguage": lang, "url": here,
        "about": {"@type": "CreativeWork", "name": title, "url": item["repo_url"]},
        "author": {"@type": "Person", "name": "Mahmoud Abdelnaby", "url": f"{BASE}/"}}, ensure_ascii=False, separators=(",", ":"))
    return f'''<!doctype html>
<html lang="{lang}" dir="{'rtl' if lang == 'ar' else 'ltr'}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(display_title)} | Mahmoud Abdelnaby</title><meta name="description" content="{esc(description[:300])}"><meta name="author" content="Mahmoud Abdelnaby">
<link rel="canonical" href="{here}"><link rel="alternate" hreflang="en" href="{en_url}"><link rel="alternate" hreflang="ar" href="{ar_url}"><link rel="alternate" hreflang="x-default" href="{en_url}">
<meta property="og:type" content="article"><meta property="og:title" content="{esc(display_title)}"><meta property="og:description" content="{esc(description[:300])}"><meta property="og:url" content="{here}">
<link rel="stylesheet" href="/assets/site.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/marketing-systems.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/repositories.css?v=20261031-repositories-v1">
<script type="application/ld+json">{schema}</script></head><body class="marketing-systems-page repositories-page"><div class="wrap">
<header class="topbar"><a class="brand" href="/{'ar/' if lang == 'ar' else ''}">{'محمود <em>عبدالنبي</em>' if lang == 'ar' else 'MAHMOUD <em>ABDELNABY</em>'}</a><nav class="nav"><a href="/{'ar/' if lang == 'ar' else ''}">{labels['portfolio']}</a><a class="lang" href="/{'ar/' if lang == 'en' else ''}repositories/{slug}/">{labels['lang']}</a></nav></header>
<main class="systems-detail repository-detail"><nav class="systems-breadcrumb" aria-label="{'مسار التنقل' if lang == 'ar' else 'Breadcrumb'}"><a href="/{'ar/' if lang == 'ar' else ''}">{labels['portfolio']}</a><span>/</span><a href="/{'ar/' if lang == 'ar' else ''}repositories/">{labels['directory']}</a><span>/</span><span aria-current="page">{esc(display_name)}</span></nav>
<article><header class="systems-detail-hero"><span class="eyebrow">{esc(category)} · {esc(FORMAT_AR.get(item['format'], item['format'].replace('_', ' ').title()) if lang == 'ar' else item['format'].replace('_', ' ').title())} · {esc(item['tier'])}</span><h1>{esc(display_title)}</h1><p class="systems-answer">{esc(intro)}</p></header>
<div class="systems-detail-grid"><section><h2>{labels['problem']}</h2>{problem_section}</section><section><h2>{labels['who']}</h2>{audience}</section><section><h2>{labels['files']}</h2><p>{'الملفات الأساسية التي يسردها قسم بنية المستودع في README:' if lang == 'ar' else 'Key files listed in the README repository architecture:'}</p><ul>{files_markup}</ul></section><section><h2>{labels['use']}</h2><ol>{steps_markup}</ol>{quick_note}</section><section class="systems-limits"><h2>{labels['limits']}</h2><ul>{limits_markup}</ul><p>{'هذه الصفحة تلخص التوثيق المتاح ولا تثبت أداءً أو نتيجة تجارية. تحقق من صلاحية البيانات والمتطلبات قبل الاستخدام.' if lang == 'ar' else 'This page summarizes the available documentation; it does not establish performance or business results. Verify data and prerequisites before use.'}</p></section><section><h2>{labels['related']}</h2><ul>{related_markup}</ul></section></div>
<footer class="systems-detail-actions"><a class="btn" href="{esc(item['repo_url'])}" target="_blank" rel="noopener noreferrer">{labels['repo']} ↗</a><a class="btn secondary" href="/{'ar/' if lang == 'ar' else ''}repositories/">{labels['directory']} ↗</a></footer></article></main></div></body></html>'''


def update_ar_directory(items: list[dict]) -> None:
    path = ROOT / "ar" / "repositories" / "index.html"
    page = path.read_text(encoding="utf-8")
    for item in items:
        slug = re.escape(item["slug"])
        card_pattern = re.compile(
            rf'(<a class="repo-card" href="/ar/repositories/{slug}/"[^>]*>)([\s\S]*?)(</a>)'
        )
        match = card_pattern.search(page)
        if not match:
            raise SystemExit(f"Missing Arabic directory card: {item['slug']}")
        card = match.group(2)
        title = item.get("title_ar", item["title_en"])
        card, heading_count = re.subn(r"<h2(?:\s[^>]*)?>[\s\S]*?</h2>", f"<h2 lang=\"ar\">{esc(title)}</h2>", card, count=1)
        if heading_count != 1:
            raise SystemExit(f"Missing Arabic title element: {item['slug']}")
        search_match = re.search(r'data-search="([^"]*)"', match.group(1))
        attrs = match.group(1)
        if search_match:
            search_terms = html.unescape(search_match.group(1))
            if title not in search_terms:
                attrs = attrs.replace(search_match.group(0), f'data-search="{esc(search_terms + " " + title)}"')
        page = page[:match.start()] + attrs + card + match.group(3) + page[match.end():]
    path.write_text(page, encoding="utf-8", newline="\n")


def main() -> None:
    raw = json.loads(CATALOG.read_text(encoding="utf-8"))
    items = []
    for item in raw:
        detail = read_repo(item)
        items.append({**item, **detail})
    if len(items) != 94 or len({x["slug"] for x in items}) != len(items):
        raise SystemExit(f"Expected 94 unique repositories; found {len(items)}")
    for item in items:
        if not item["problem_en"] or not item["deliverables"]:
            raise SystemExit(f"Missing README problem or deliverables: {item['slug']}")
        for lang, folder in (("en", ROOT / "repositories" / item["slug"]), ("ar", ROOT / "ar" / "repositories" / item["slug"])):
            folder.mkdir(parents=True, exist_ok=True)
            (folder / "index.html").write_text(render(item, items, lang), encoding="utf-8", newline="\n")
    update_ar_directory(items)
    # Store a compact source catalog for reproducible page generation.
    keep = ("slug", "repo_url", "category", "format", "tier", "title_en", "title_ar", "tagline_en", "persona_en", "problem_en", "deliverables", "constraints_en", "quick_start")
    CATALOG.write_text(json.dumps([{k: x[k] for k in keep} for x in items], ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Generated {len(items) * 2} pages for {len(items)} repositories.")


if __name__ == "__main__":
    main()
