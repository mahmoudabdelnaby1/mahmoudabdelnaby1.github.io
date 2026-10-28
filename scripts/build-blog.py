from __future__ import annotations
import html
from html.parser import HTMLParser
import json, math, re
from pathlib import Path
import xml.etree.ElementTree as ET
import markdown

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://mahmoudabdelnaby1.github.io"
UPDATED = "2026-10-28"
DATA = json.loads((ROOT / "data/blog-content.json").read_text(encoding="utf-8"))
POSTS = DATA["posts"]

UI = {
 "en": {
  "brand":"MAHMOUD <em>ABDELNABY</em>","home":"Portfolio","guides":"Marketing systems","language":"العربية",
  "search_label":"Search the library","search_placeholder":"Try “WhatsApp”, “SEO”, or “video testing”","all":"All topics",
  "count":"200 practical articles · 100 topics · English + Arabic","kicker":"FIELD NOTES · MARKETING SYSTEMS",
  "title":"Useful work for the decisions behind growth.",
  "intro":"Bilingual, task-led guides for marketers working across MENA. Each article turns an operating question into a method, checks, and related tools.",
  "featured":"START HERE","featured_label":"Growth diagnosis","read":"min read","back":"All articles",
  "related":"Related frameworks and tools","related_text":"Use these resources to apply the method to a specific task.",
  "next":"Next guide","footer":"Practical marketing systems for MENA","no_results":"No articles match. Try a broader term.",
  "topics":"Browse by topic","language_note":"Written for English-reading marketers in MENA.",
  "shown":"articles shown","shown_one":"article shown","explore":"Explore the guides",
 },
 "ar": {
  "brand":"محمود <em>عبدالنبي</em>","home":"معرض الأعمال","guides":"الأنظمة التسويقية","language":"English",
  "search_label":"ابحث في المكتبة","search_placeholder":"جرّب «واتساب» أو «SEO» أو «اختبار الفيديو»","all":"كل الموضوعات",
  "count":"٢٠٠ مقال عملي · ١٠٠ موضوع · العربية والإنجليزية","kicker":"ملاحظات تطبيقية · أنظمة التسويق",
  "title":"عمل عملي يدعم القرارات وراء النمو.",
  "intro":"أدلة عربية وإنجليزية تبدأ من مهمة تسويقية حقيقية في أسواق MENA، ثم تحوّلها إلى منهج وخطوات وأدوات مرتبطة.",
  "featured":"ابدأ من هنا","featured_label":"تشخيص النمو","read":"دقائق للقراءة","back":"كل المقالات",
  "related":"أطر وأدوات مرتبطة","related_text":"استخدم هذه الموارد لتطبيق المنهج على مهمة محددة.",
  "next":"الدليل التالي","footer":"أنظمة تسويق عملية لأسواق MENA","no_results":"لا توجد مقالات تطابق البحث. جرّب كلمة أوسع.",
  "topics":"تصفّح حسب الموضوع","language_note":"صياغة عربية تراعي سياق المسوقين في أسواق MENA.",
  "shown":"مقالًا ظاهرًا","shown_one":"مقال ظاهر","explore":"تصفّح الأدلة",
 }
}

def esc(value):
 return html.escape(str(value), quote=True)

def minutes(post, lang):
 words = post[lang].get("approx_words") or len(re.findall(r"\w+", post[lang]["markdown"], flags=re.UNICODE))
 n = max(2, math.ceil(words / (220 if lang == "en" else 190)))
 return str(n).translate(str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩")) if lang == "ar" else str(n)

class TitleReader(HTMLParser):
 def __init__(self):
  super().__init__(); self.inside=False; self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag=="title": self.inside=True
 def handle_endtag(self,tag):
  if tag=="title": self.inside=False
 def handle_data(self,data):
  if self.inside: self.parts.append(data)

def framework(fid,lang):
 folder=ROOT/("ar" if lang=="ar" else "")/"frameworks"/"tasks"
 matches=sorted(folder.glob(fid+"-*/index.html"))
 if not matches: return None
 p=matches[0]; parser=TitleReader(); parser.feed(p.read_text(encoding="utf-8"))
 title=html.unescape("".join(parser.parts)).strip()
 title=re.split(r"\s+[|—-]\s+",title,maxsplit=1)[0].strip() or fid
 return {"id":fid,"title":title,"href":"/"+p.relative_to(ROOT).as_posix().removesuffix("index.html")}

def ld(value):
 return json.dumps(value,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")

def head(title,description,canonical,en_url,ar_url,lang,schema,kind):
 return f'''<!doctype html>
<html lang="{lang}" dir="{"rtl" if lang=="ar" else "ltr"}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101d27">
<title>{esc(title)}</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{esc(canonical)}">
<link rel="alternate" hreflang="en" href="{esc(en_url)}"><link rel="alternate" hreflang="ar" href="{esc(ar_url)}"><link rel="alternate" hreflang="x-default" href="{esc(en_url)}">
<meta property="og:type" content="{kind}"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{esc(canonical)}"><meta property="og:site_name" content="Mahmoud Abdelnaby | Technical Marketing &amp; Growth"><meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Manrope:wght@400;500;600;700;800&amp;family=Cairo:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/marketing-systems.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/blog.css?v=20261028-blog-v1">
<script type="application/ld+json">{ld(schema)}</script></head>'''

def nav(lang,language_href):
 ui=UI[lang]; root="/ar/" if lang=="ar" else "/"; blog="/ar/blog/" if lang=="ar" else "/blog/"
 marketing="/ar/marketing-systems/" if lang=="ar" else "/marketing-systems/"
 return f'''<header class="topbar blog-topbar"><a class="brand" href="{root}">{ui["brand"]}</a><nav class="nav" aria-label="{"التنقل الرئيسي" if lang=="ar" else "Primary navigation"}"><div class="nav-links"><a href="{blog}" aria-current="page">{"المدونة" if lang=="ar" else "Blog"}</a><a href="{marketing}">{ui["guides"]}</a></div><a class="lang" href="{language_href}">{ui["language"]}</a></nav></header>'''

def footer(lang):
 ui=UI[lang]; root="/ar/" if lang=="ar" else "/"
 return f'''<footer class="blog-footer"><a class="blog-footer-brand" href="{root}">{ui["brand"]}</a><span>{esc(ui["footer"])}</span><a href="https://github.com/mahmoudabdelnaby1/mena-ai-marketing-frameworks" rel="noopener">GitHub frameworks ↗</a></footer>'''

def card(post,lang,featured=False):
 ui=UI[lang]; data=post[lang]; url=f'/{("ar/" if lang=="ar" else "")}blog/{post["slug"]}/'
 label=post["category_ar" if lang=="ar" else "category_en"]
 cls="blog-feature-card" if featured else "blog-card"
 eyebrow=ui["featured_label"] if featured else label
 return f'''<a class="{cls}" href="{url}" data-theme="{esc(post.get("category_key",post["theme"][:2]))}" data-search="{esc((data["title"]+" "+data["description"]+" "+label).lower())}">
<span class="blog-card-kicker">{esc(eyebrow)} <span aria-hidden="true">↗</span></span><h2>{esc(data["title"])}</h2><p>{esc(data["description"])}</p><span class="blog-card-meta">{minutes(post,lang)} {esc(ui["read"])}</span></a>'''

def index_page(lang):
 ui=UI[lang]; basepath="/ar/blog/" if lang=="ar" else "/blog/"
 canonical=BASE+basepath; en_url=BASE+"/blog/"; ar_url=BASE+"/ar/blog/"
 schema={"@context":"https://schema.org","@type":"CollectionPage","name":ui["title"],"description":ui["intro"],"url":canonical,"inLanguage":lang,
 "author":{"@type":"Person","name":"Mahmoud Abdelnaby","url":BASE+"/"},
 "mainEntity":{"@type":"ItemList","numberOfItems":len(POSTS),"itemListElement":[
  {"@type":"ListItem","position":i+1,"url":BASE+f'/{("ar/" if lang=="ar" else "")}blog/{p["slug"]}/',"name":p[lang]["title"]} for i,p in enumerate(POSTS)]}}
 pagehead=head(("مدونة التسويق والنمو | محمود عبدالنبي" if lang=="ar" else "Marketing & Growth Blog | Mahmoud Abdelnaby"),ui["intro"],canonical,en_url,ar_url,lang,schema,"website")
 filters=[f'<button class="blog-filter" type="button" data-filter="all" aria-pressed="true">{esc(ui["all"])}</button>']
 seen=set()
 for p in POSTS:
  category_key=p.get("category_key",p["theme"][:2])
  if category_key in seen: continue
  seen.add(category_key)
  label=p["category_ar" if lang=="ar" else "category_en"]
  filters.append(f'<button class="blog-filter" type="button" data-filter="{esc(category_key)}" aria-pressed="false">{esc(label)}</button>')
 cards="\n".join(card(p,lang) for p in POSTS[1:])
 language_href="/blog/" if lang=="ar" else "/ar/blog/"
 return f'''{pagehead}
<body class="blog-page blog-index-page"><div class="wrap blog-wrap">{nav(lang,language_href)}
<main id="main-content" class="blog-main">
<section class="blog-index-hero"><div class="blog-index-copy"><p class="blog-kicker">{esc(ui["kicker"])}</p><h1>{esc(ui["title"])}</h1><p class="blog-intro">{esc(ui["intro"])}</p><p class="blog-count">{esc(ui["count"])}</p></div><div class="blog-hero-mark" aria-hidden="true"><span>FIELD<br>NOTES</span><b>{len(POSTS)}</b><i>01 — {len(POSTS):02d}</i></div></section>
<section class="blog-featured"><div class="blog-featured-aside"><span>{esc(ui["featured"])}</span><p>{esc(ui["language_note"])}</p></div>{card(POSTS[0],lang,True)}</section>
<section class="blog-library" aria-labelledby="blog-library-title"><div class="blog-library-heading"><div><p class="blog-kicker">{esc(ui["topics"])}</p><h2 id="blog-library-title">{esc(ui["explore"])}</h2></div><label class="blog-search"><span>{esc(ui["search_label"])}</span><input type="search" data-blog-search placeholder="{esc(ui["search_placeholder"])}" autocomplete="off"></label></div>
<div class="blog-filter-list" aria-label="{esc(ui["topics"])}">{"".join(filters)}</div><p class="blog-results-status" data-blog-status data-default="{esc(ui["count"])}" data-one="{esc(ui["shown_one"])}" data-many="{esc(ui["shown"])}" aria-live="polite">{esc(ui["count"])}</p>
<div class="blog-grid" data-blog-grid>{"".join(cards)}</div><p class="blog-empty" data-blog-empty hidden>{esc(ui["no_results"])}</p></section>
<section class="blog-faq-note"><span class="blog-faq-index">MENA · EN / AR</span><p>{esc(ui["intro"])}</p><a href="{("/ar/marketing-systems/" if lang=="ar" else "/marketing-systems/")}">{esc(ui["guides"])} ↗</a></section>
</main>{footer(lang)}</div><script defer src="/assets/blog.js?v=20261028-blog-v1"></script></body></html>'''

def article_page(index,lang):
 p=POSTS[index]; data=p[lang]; ui=UI[lang]
 basepath=f'/{("ar/" if lang=="ar" else "")}blog/{p["slug"]}/'
 en_url=BASE+f'/blog/{p["slug"]}/'; ar_url=BASE+f'/ar/blog/{p["slug"]}/'
 canonical=ar_url if lang=="ar" else en_url
 collection=BASE+("/ar/blog/" if lang=="ar" else "/blog/")
 category=p["category_ar" if lang=="ar" else "category_en"]
 resources=[framework(fid,lang) for fid in p["framework_ids"]]
 resources=[x for x in resources if x]
 rendered=markdown.markdown(data["markdown"],extensions=["tables","fenced_code","sane_lists","toc"],output_format="html5")
 schema={"@context":"https://schema.org","@type":"BlogPosting","headline":data["title"],"description":data["description"],"inLanguage":lang,"dateModified":UPDATED,
 "author":{"@type":"Person","@id":BASE+"/#person","name":"Mahmoud Abdelnaby","url":BASE+"/"},"publisher":{"@type":"Person","@id":BASE+"/#person"},
 "mainEntityOfPage":{"@type":"WebPage","@id":canonical},"isPartOf":{"@type":"Blog","@id":collection,"name":("مدونة التسويق والنمو" if lang=="ar" else "Marketing & Growth Blog")},
 "about":[{"@type":"Thing","name":category}]}
 next_post=POSTS[(index+1)%len(POSTS)]; next_url=f'/{("ar/" if lang=="ar" else "")}blog/{next_post["slug"]}/'
 related_html="".join(f'<li><a href="{esc(x["href"])}">{esc(x["title"])} <span aria-hidden="true">↗</span></a><span>{esc(x["id"])}</span></li>' for x in resources)
 language_href=f'/{("ar/" if lang=="en" else "")}blog/{p["slug"]}/'
 pagehead=head(data["title"]+(" | مدونة محمود عبدالنبي" if lang=="ar" else " | Mahmoud Abdelnaby"),data["description"],canonical,en_url,ar_url,lang,schema,"article")
 return f'''{pagehead}<body class="blog-page blog-article-page"><div class="wrap blog-wrap">{nav(lang,language_href)}
<main id="main-content" class="blog-article-main" dir="{"rtl" if lang=="ar" else "ltr"}">
<nav class="blog-breadcrumb" aria-label="{"مسار الصفحة" if lang=="ar" else "Breadcrumb"}"><a href="{("/ar/blog/" if lang=="ar" else "/blog/")}">{esc(ui["back"])}</a><span aria-hidden="true">/</span><span>{esc(category)}</span></nav>
<header class="blog-article-header"><p class="blog-kicker">{esc("دليل تطبيقي" if lang=="ar" else "PRACTICAL GUIDE")} <span>·</span> {esc(category)}</p><h1>{esc(data["title"])}</h1><p class="blog-article-deck">{esc(data["description"])}</p>
<div class="blog-article-meta"><span>{esc("محمود عبدالنبي" if lang=="ar" else "Mahmoud Abdelnaby")}</span><span aria-hidden="true">·</span><span>{minutes(p,lang)} {esc(ui["read"])}</span><span aria-hidden="true">·</span><a href="{language_href}">{esc(ui["language"])}</a></div></header>
<article class="blog-prose">{rendered}</article>
<section class="blog-related" aria-labelledby="blog-related-title"><div class="blog-related-intro"><p class="blog-kicker">{esc(ui["related"])}</p><h2 id="blog-related-title">{esc(ui["related_text"])}</h2></div><ul>{related_html}</ul></section>
<nav class="blog-next" aria-label="{"التنقل بين الأدلة" if lang=="ar" else "Guide navigation"}"><a href="{next_url}"><span>{esc(ui["next"])}</span><strong>{esc(next_post[lang]["title"])}</strong><b aria-hidden="true">↗</b></a><a href="{("/ar/blog/" if lang=="ar" else "/blog/")}"><span>{esc(ui["back"])}</span><strong>{esc(ui["count"])}</strong><b aria-hidden="true">↗</b></a></nav></main>{footer(lang)}</div></body></html>'''

def add_links():
 for path,anchor,addition in [
  (ROOT/"index.html",'<a href="/marketing-systems/">Marketing systems</a>','<a href="/blog/">Blog &amp; articles</a>'),
  (ROOT/"ar/index.html",'<a href="/ar/marketing-systems/">الأنظمة التسويقية</a>','<a href="/ar/blog/">المدونة والمقالات</a>')]:
  text=path.read_text(encoding="utf-8")
  if addition not in text:
   if anchor not in text: raise SystemExit("Missing homepage navigation anchor: "+str(path))
   path.write_text(text.replace(anchor,anchor+addition,1),encoding="utf-8",newline="\n")

def add_hub_promo():
 for path,anchor,promo in [
  (ROOT/"marketing-systems/index.html",'<section class="systems-utm-product" aria-labelledby="creator-planner-title">','<section class="blog-promo"><div><span>FIELD NOTES · 200 ARTICLES</span><h2>Read the marketing blog.</h2><p>One hundred bilingual guides connect day-to-day marketing questions with practical frameworks.</p></div><a href="/blog/">Explore all articles <span aria-hidden="true">↗</span></a></section>'),
  (ROOT/"ar/marketing-systems/index.html",'<section class="systems-utm-product" aria-labelledby="creator-planner-title">','<section class="blog-promo" dir="rtl"><div><span>ملاحظات تطبيقية · ٢٠٠ مقال</span><h2>اقرأ مدونة التسويق.</h2><p>مئة موضوع بالعربية والإنجليزية تربط أسئلة العمل التسويقي بأطر عملية.</p></div><a href="/ar/blog/">استكشف المقالات <span aria-hidden="true">↗</span></a></section>')]:
  text=path.read_text(encoding="utf-8")
  if promo not in text:
   if anchor not in text: raise SystemExit("Missing marketing library insertion point: "+str(path))
   path.write_text(text.replace(anchor,promo+anchor,1),encoding="utf-8",newline="\n")

def update_sitemap(routes):
 path=ROOT/"sitemap.xml"; raw=path.read_text(encoding="utf-8")
 root=ET.fromstring(raw); ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
 existing={node.findtext("s:loc",namespaces=ns) for node in root.findall("s:url",ns)}
 missing=[r for r in routes if r["url"] not in existing]
 if not missing: return 0
 blocks=[]
 for r in missing:
  blocks.append('  <url>\n    <loc>'+html.escape(r["url"])+'</loc>\n    <lastmod>'+UPDATED+'</lastmod>\n    <xhtml:link rel="alternate" hreflang="en" href="'+html.escape(r["en"])+'" />\n    <xhtml:link rel="alternate" hreflang="ar" href="'+html.escape(r["ar"])+'" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="'+html.escape(r["en"])+'" />\n  </url>')
 closing=re.search(r"</urlset>\s*$",raw)
 if not closing: raise SystemExit("Sitemap closing tag not found")
 result=raw[:closing.start()]+"\n"+"\n".join(blocks)+"\n"+raw[closing.start():]
 ET.fromstring(result)
 path.write_text(result,encoding="utf-8",newline="\n")
 return len(missing)

def main():
 if len(POSTS)!=100 or len({p["slug"] for p in POSTS})!=100: raise SystemExit("Expected 100 bilingual topics")
 for p in POSTS:
  for lang in ("en","ar"):
   if not p[lang]["markdown"]: raise SystemExit("Missing body: "+p["slug"])
   disclosure="AI disclosure" if lang=="en" else "إفصاح عن الذكاء الاصطناعي"
   if disclosure not in p[lang]["markdown"]: raise SystemExit("Missing AI disclosure: "+p["slug"]+" "+lang)
   for fid in p["framework_ids"]:
    if not framework(fid,lang): raise SystemExit("Missing related framework: "+fid+" "+lang)
 (ROOT/"assets/blog.css").write_text(BLOG_CSS,encoding="utf-8",newline="\n")
 (ROOT/"assets/blog.js").write_text(BLOG_JS,encoding="utf-8",newline="\n")
 routes=[{"url":BASE+"/blog/","en":BASE+"/blog/","ar":BASE+"/ar/blog/"},{"url":BASE+"/ar/blog/","en":BASE+"/blog/","ar":BASE+"/ar/blog/"}]
 for lang in ("en","ar"):
  dest=ROOT/("ar/blog/index.html" if lang=="ar" else "blog/index.html"); dest.parent.mkdir(parents=True,exist_ok=True)
  dest.write_text(index_page(lang),encoding="utf-8",newline="\n")
 for i,p in enumerate(POSTS):
  for lang in ("en","ar"):
   dest=ROOT/("ar" if lang=="ar" else "")/"blog"/p["slug"]/"index.html"
   dest.parent.mkdir(parents=True,exist_ok=True); dest.write_text(article_page(i,lang),encoding="utf-8",newline="\n")
  routes.extend([
   {"url":BASE+"/blog/"+p["slug"]+"/","en":BASE+"/blog/"+p["slug"]+"/","ar":BASE+"/ar/blog/"+p["slug"]+"/"},
   {"url":BASE+"/ar/blog/"+p["slug"]+"/","en":BASE+"/blog/"+p["slug"]+"/","ar":BASE+"/ar/blog/"+p["slug"]+"/"}])
 add_links(); add_hub_promo(); added=update_sitemap(routes)
 print(f"Generated {len(POSTS)*2} bilingual article pages and 2 indexes.")
 print(f"Added {added} canonical routes to sitemap.")
 print("Each article links to its existing matching frameworks in both languages.")

BLOG_CSS = r"""/* Portfolio editorial blog */
.blog-page{--blog-paper:#f0ede3;--blog-green:#7ce6c5;--blog-gold:#f0c96b;--blog-muted:#94a8b5;background:#101d27;color:#edf0e9}
.blog-wrap{max-width:1240px}.blog-topbar{border-bottom:1px solid #ffffff1c}.blog-main{padding-bottom:64px}
.blog-index-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(240px,.7fr);gap:clamp(28px,6vw,88px);align-items:center;padding:clamp(68px,9vw,118px) 0 70px}
.blog-kicker{margin:0;color:var(--blog-green);font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}html[dir=rtl] .blog-kicker{letter-spacing:0}
.blog-index-copy h1{max-width:850px;margin:18px 0 22px;font-size:clamp(42px,7vw,82px);line-height:1.02;letter-spacing:-.065em}html[dir=rtl] .blog-index-copy h1,.blog-article-header h1{letter-spacing:-.025em;line-height:1.25}
.blog-intro{max-width:730px;margin:0;color:#c1ced1;font-size:clamp(17px,2vw,21px);line-height:1.8}.blog-count{display:inline-block;margin:28px 0 0;padding:8px 0;border-bottom:1px solid #ffffff43;color:#e6cc8b;font-size:12px;font-weight:700}
.blog-hero-mark{position:relative;min-height:255px;display:flex;flex-direction:column;justify-content:space-between;padding:25px 28px;border-block:1px solid #7ce6c5;background:repeating-linear-gradient(135deg,#ffffff07 0 1px,transparent 1px 18px)}
.blog-hero-mark span{color:#c8d2cd;font-size:12px;font-weight:700;line-height:1.25;letter-spacing:.22em}.blog-hero-mark b{align-self:flex-end;color:#f0c96b;font-family:"Manrope",sans-serif;font-size:clamp(96px,13vw,176px);font-weight:500;line-height:.85;letter-spacing:-.12em}.blog-hero-mark i{color:#94a8b5;font-size:11px;font-style:normal;letter-spacing:.2em}
.blog-featured{display:grid;grid-template-columns:minmax(180px,.36fr) minmax(0,1.64fr);gap:22px;margin:0 0 105px;padding-top:20px;border-top:1px solid #ffffff39}
.blog-featured-aside{display:flex;flex-direction:column;justify-content:space-between;min-height:240px;padding:4px 0}.blog-featured-aside span{color:#f0c96b;font-size:11px;font-weight:800;letter-spacing:.15em}.blog-featured-aside p{max-width:180px;margin:0;color:var(--blog-muted);font-size:13px;line-height:1.75}
.blog-feature-card{position:relative;display:flex;min-height:270px;flex-direction:column;justify-content:flex-end;overflow:hidden;padding:clamp(27px,4vw,54px);border:1px solid #ffffff29;background:linear-gradient(118deg,#172a35 0%,#15232d 68%,#21312f 100%);text-decoration:none;isolation:isolate}
.blog-feature-card:before{position:absolute;z-index:-1;inset:0;content:"";background:repeating-linear-gradient(122deg,transparent 0 48px,#ffffff08 49px 50px)}.blog-feature-card:after{position:absolute;z-index:-1;inset-inline-end:7%;top:8%;content:"↗";color:#7ce6c521;font-size:clamp(140px,24vw,340px);font-weight:300;line-height:.8}
.blog-card-kicker{display:flex;justify-content:space-between;gap:18px;color:#7ce6c5;font-size:11px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}html[dir=rtl] .blog-card-kicker{letter-spacing:0}
.blog-feature-card h2{max-width:810px;margin:22px 0 12px;color:#f3f0e8;font-size:clamp(30px,4.5vw,58px);line-height:1.08;letter-spacing:-.045em}.blog-feature-card p{max-width:720px;margin:0;color:#bdc9c7;font-size:17px;line-height:1.7}.blog-card-meta{display:block;margin-top:22px;color:#a9b7bb;font-size:12px}
.blog-library{padding-top:8px}.blog-library-heading{display:flex;justify-content:space-between;align-items:end;gap:24px;padding-bottom:24px;border-bottom:1px solid #ffffff3a}.blog-library-heading h2{margin:12px 0 0;font-size:clamp(30px,4vw,46px);letter-spacing:-.04em}
.blog-search{display:grid;gap:7px;width:min(360px,100%);color:#b3c2c5;font-size:11px;font-weight:700;letter-spacing:.06em}html[dir=rtl] .blog-search{letter-spacing:0}
.blog-search input{width:100%;min-height:48px;padding:0 14px;border:1px solid #ffffff43;border-radius:2px 14px 2px 14px;background:#0c1720;color:#f3f0e8;font:inherit;font-size:14px;letter-spacing:0}.blog-search input::placeholder{color:#82959f;opacity:1}
.blog-search input:focus-visible,.blog-filter:focus-visible,.blog-page a:focus-visible{outline:3px solid #f0c96b;outline-offset:3px}
.blog-filter-list{display:flex;flex-wrap:wrap;gap:8px;padding:20px 0 6px}.blog-filter{min-height:36px;padding:7px 12px;border:1px solid #ffffff33;border-radius:2px 14px 2px 14px;background:transparent;color:#d7dfd8;font:inherit;font-size:12px;cursor:pointer}.blog-filter:hover,.blog-filter[aria-pressed="true"]{border-color:var(--blog-green);background:#7ce6c516;color:#a4f1d5}
.blog-results-status{min-height:20px;margin:13px 0;color:var(--blog-muted);font-size:12px}.blog-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:42px}
.blog-card{display:flex;min-height:230px;flex-direction:column;padding:25px 2px 23px;border-top:1px solid #ffffff32;text-decoration:none;transition:border-color .18s ease,transform .18s ease}.blog-card:hover{border-color:var(--blog-green);transform:translateY(-2px)}
.blog-card h2{margin:22px 0 10px;color:#f0efe9;font-size:clamp(20px,2.2vw,28px);line-height:1.25;letter-spacing:-.025em}.blog-card p{margin:0;color:#b4c2c4;font-size:14px;line-height:1.75}.blog-card .blog-card-meta{margin-top:auto;padding-top:16px}
.blog-empty{padding:26px 0;color:#e6cc8b}.blog-faq-note{display:grid;grid-template-columns:.4fr 1fr auto;align-items:center;gap:22px;margin:90px 0 20px;padding:21px 0;border-block:1px solid #ffffff35}.blog-faq-index{color:#f0c96b;font-size:11px;font-weight:800;letter-spacing:.12em}.blog-faq-note p{margin:0;color:#c1ced1;line-height:1.75}.blog-faq-note a{color:var(--blog-green);font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap}
.blog-footer{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:26px 0 42px;border-top:1px solid #ffffff30;color:#93a8b2;font-size:12px}.blog-footer a{color:#c2d0cf;text-decoration:none}.blog-footer a:hover{color:var(--blog-green)}.blog-footer-brand{font-weight:800;letter-spacing:.07em}.blog-footer-brand em{color:var(--blog-green);font-style:normal}
.blog-article-main{max-width:960px;margin:0 auto;padding-bottom:70px}.blog-breadcrumb{display:flex;align-items:center;gap:10px;padding:30px 0 0;color:#8fa3ad;font-size:13px}.blog-breadcrumb a{color:#aee6d1;text-decoration:none}
.blog-article-header{padding:62px 0 39px;border-bottom:1px solid #ffffff3a}.blog-article-header h1{max-width:900px;margin:17px 0 18px;font-size:clamp(38px,6vw,68px);line-height:1.05;letter-spacing:-.055em}.blog-article-deck{max-width:820px;margin:0;color:#c1ced1;font-size:clamp(17px,2vw,21px);line-height:1.75}.blog-article-meta{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:25px;color:#a7b7bd;font-size:12px}.blog-article-meta a{color:var(--blog-green);text-decoration:none}
.blog-prose{max-width:790px;margin:40px auto 0;padding:clamp(25px,5vw,62px);background:var(--blog-paper);color:#26363c;box-shadow:0 16px 42px #00000022}
.blog-prose h2{margin:45px 0 15px;color:#15252d;font-size:clamp(24px,3vw,34px);line-height:1.2;letter-spacing:-.035em}.blog-prose h3{margin:32px 0 12px;color:#23363d;font-size:21px;line-height:1.3}
.blog-prose p,.blog-prose li{font-family:"DM Sans","Cairo",sans-serif;font-size:17px;line-height:1.9}html[lang="ar"] .blog-prose p,html[lang="ar"] .blog-prose li{font-family:"Cairo","DM Sans",sans-serif}
.blog-prose p{margin:0 0 20px}.blog-prose ol,.blog-prose ul{padding-inline-start:24px;margin:0 0 24px}html[dir=rtl] .blog-prose ol,html[dir=rtl] .blog-prose ul{padding-inline-start:0;padding-inline-end:24px}.blog-prose li+li{margin-top:9px}.blog-prose strong{color:#142c34}
.blog-prose a{color:#156353;text-decoration-thickness:1px;text-underline-offset:3px}.blog-prose blockquote{margin:30px 0;padding:18px 20px;border-inline-start:3px solid #557d70;background:#e7e3d8;color:#40514e}
.blog-prose table{display:block;width:100%;overflow-x:auto;border-collapse:collapse;margin:28px 0;font-size:14px}.blog-prose th,.blog-prose td{padding:10px 12px;border:1px solid #c9c5ba;text-align:start;vertical-align:top}.blog-prose th{background:#e2ded3;color:#172a31}.blog-prose code{padding:.12em .3em;background:#e2ded3;font-size:.9em}
.blog-related{display:grid;grid-template-columns:.8fr 1.2fr;gap:30px;margin:54px auto 0;padding:26px 0;border-block:1px solid #ffffff35}.blog-related-intro h2{max-width:370px;margin:12px 0;color:#e5e9e1;font-size:20px;line-height:1.5}
.blog-related ul{display:grid;gap:0;margin:0;padding:0;list-style:none}.blog-related li{display:flex;justify-content:space-between;gap:15px;padding:13px 0;border-bottom:1px solid #ffffff22;color:#879ba5;font-size:11px}.blog-related li:last-child{border-bottom:0}.blog-related li a{color:#b9ead6;font-size:14px;line-height:1.5;text-decoration:none}
.blog-next{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:28px 0}.blog-next a{display:grid;grid-template-columns:1fr auto;gap:7px;padding:18px;border:1px solid #ffffff29;text-decoration:none}.blog-next a:hover{border-color:var(--blog-green)}.blog-next span{grid-column:1/-1;color:#f0c96b;font-size:11px;font-weight:700}.blog-next strong{color:#ebf0e8;font-size:14px;line-height:1.45}.blog-next b{color:var(--blog-green)}
.blog-promo{display:flex;justify-content:space-between;align-items:center;gap:24px;margin:30px 0;padding:24px 28px;border-block:1px solid #ffffff3b;background:linear-gradient(110deg,#0d1d28,#142a31)}.blog-promo>div>span{color:#f0c96b;font-size:10px;font-weight:800;letter-spacing:.13em}.blog-promo h2{margin:9px 0;color:#edf0e9;font-size:clamp(22px,3vw,32px)}.blog-promo p{max-width:680px;margin:0;color:#b3c1c4;font-size:14px;line-height:1.7}.blog-promo>a{padding:12px 15px;border:1px solid #7ce6c5;color:#a8edd5;text-decoration:none;white-space:nowrap}.blog-promo>a:hover{background:#7ce6c518}html[dir=rtl] .blog-promo>div>span{letter-spacing:0}
@media(max-width:850px){.blog-index-hero{grid-template-columns:1fr .58fr}.blog-featured{grid-template-columns:.45fr 1.55fr}.blog-grid{column-gap:25px}.blog-related{grid-template-columns:1fr}.blog-faq-note{grid-template-columns:.4fr 1fr}.blog-faq-note a{grid-column:2}}
@media(max-width:620px){.blog-index-hero{grid-template-columns:1fr;padding:48px 0 52px}.blog-hero-mark{min-height:160px}.blog-hero-mark b{font-size:100px}.blog-featured{grid-template-columns:1fr;gap:12px;margin-bottom:76px}.blog-featured-aside{min-height:auto;gap:12px}.blog-featured-aside p{max-width:100%}.blog-feature-card{min-height:280px;padding:24px}.blog-library-heading{align-items:stretch;flex-direction:column}.blog-search{width:100%}.blog-grid{grid-template-columns:1fr}.blog-card{min-height:200px}.blog-faq-note{grid-template-columns:1fr;gap:12px;margin-top:65px}.blog-faq-note a{grid-column:auto;white-space:normal}.blog-footer{align-items:flex-start;flex-direction:column}.blog-article-header{padding-top:45px}.blog-prose{margin-top:28px;padding:22px 19px}.blog-prose p,.blog-prose li{font-size:16px}.blog-related{gap:12px}.blog-next{grid-template-columns:1fr}.blog-promo{align-items:flex-start;flex-direction:column;padding:20px}.blog-promo>a{white-space:normal}}
@media(prefers-reduced-motion:reduce){.blog-card{transition:none}.blog-card:hover{transform:none}}
"""

BLOG_JS = r"""(() => {
 const search=document.querySelector("[data-blog-search]");
 const cards=Array.from(document.querySelectorAll(".blog-card,.blog-feature-card"));
 const filters=Array.from(document.querySelectorAll("[data-filter]"));
 const status=document.querySelector("[data-blog-status]");
 const empty=document.querySelector("[data-blog-empty]");
 if(!cards.length)return;
 let active="all";
 const apply=()=>{
  const query=(search?search.value:"").trim().toLocaleLowerCase();
  let visible=0;
  for(const card of cards){
   const matchTheme=active==="all"||card.dataset.theme===active;
   const matchSearch=!query||(card.dataset.search||"").includes(query);
   const show=matchTheme&&matchSearch; card.hidden=!show; if(show)visible+=1;
  }
  if(empty)empty.hidden=visible!==0;
  if(status){
   if(query||active!=="all") status.textContent=String(visible)+" "+(visible===1?status.dataset.one:status.dataset.many);
   else status.textContent=status.dataset.default;
  }
 };
 for(const button of filters)button.addEventListener("click",()=>{
  active=button.dataset.filter||"all";
  for(const item of filters)item.setAttribute("aria-pressed",String(item===button));
  apply();
 });
 if(search)search.addEventListener("input",apply);
})();"""

if __name__ == "__main__":
 main()


