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

def posts_for(lang):
 return [p for p in POSTS if isinstance(p.get(lang),dict) and p[lang].get("markdown")]

UI = {
 "en": {
  "brand":"MAHMOUD <em>ABDELNABY</em>","home":"Portfolio","guides":"Marketing systems","language":"العربية",
  "search_label":"Describe what you need in your own words","search_placeholder":"e.g. My ads get clicks but no sales—what should I check?","all":"All topics",
  "count":"200 practical articles · English + Arabic","kicker":"FIELD NOTES · MARKETING SYSTEMS",
  "title":"Useful work for the decisions behind growth.",
  "intro":"Bilingual, task-led guides for marketers working across MENA. Each article turns an operating question into a method, checks, and related tools.",
  "featured":"START HERE","featured_label":"Growth diagnosis","read":"min read","back":"All articles",
  "related":"Related frameworks and tools","related_text":"Use these resources to apply the method to a specific task.",
  "next":"Next guide","footer":"Practical marketing systems for MENA","no_results":"No guides match yet. Try describing the task another way.",
  "topics":"Browse by topic","language_note":"Written for English-reading marketers in MENA.",
  "shown":"articles shown","shown_one":"article shown","explore":"Explore the guides",
 },
 "ar": {
  "brand":"محمود <em>عبدالنبي</em>","home":"معرض الأعمال","guides":"الأنظمة التسويقية","language":"English",
  "search_label":"اكتب ما تحتاجه بطريقتك","search_placeholder":"مثال: عندي مشكلة؛ الإعلانات بتجيب نقرات لكن مفيش مبيعات، أعمل إيه؟","all":"كل الموضوعات",
  "count":"٢٠٠ مقال عملي · العربية والإنجليزية","kicker":"ملاحظات تطبيقية · أنظمة التسويق",
  "title":"عمل عملي يدعم القرارات وراء النمو.",
  "intro":"أدلة عربية وإنجليزية تبدأ من مهمة تسويقية حقيقية في أسواق MENA، ثم تحوّلها إلى منهج وخطوات وأدوات مرتبطة.",
  "featured":"ابدأ من هنا","featured_label":"تشخيص النمو","read":"دقائق للقراءة","back":"كل المقالات",
  "related":"أطر وأدوات مرتبطة","related_text":"استخدم هذه الموارد لتطبيق المنهج على مهمة محددة.",
  "next":"الدليل التالي","footer":"أنظمة تسويق عملية لأسواق MENA","no_results":"لم نعثر على دليل مطابق. جرّب وصف المهمة بطريقة أخرى.",
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

def head(title,description,canonical,en_url,ar_url,lang,schema,kind,has_translation=True):
 alternates=(f'<link rel="alternate" hreflang="en" href="{esc(en_url)}"><link rel="alternate" hreflang="ar" href="{esc(ar_url)}"><link rel="alternate" hreflang="x-default" href="{esc(en_url)}">' if has_translation else "")
 return f'''<!doctype html>
<html lang="{lang}" dir="{"rtl" if lang=="ar" else "ltr"}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101d27">
<title>{esc(title)}</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{esc(canonical)}">{alternates}
<meta property="og:type" content="{kind}"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{esc(canonical)}"><meta property="og:site_name" content="Mahmoud Abdelnaby | Technical Marketing &amp; Growth"><meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Manrope:wght@400;500;600;700;800&amp;family=Cairo:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/marketing-systems.css?v=20261027-marketing-systems-v1"><link rel="stylesheet" href="/assets/blog.css?v=20261029-blog-mobile-language-v3">
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
 label=post.get("category_ar" if lang=="ar" else "category_en",data.get("category",ui["topics"]))
 search_headings=[]
 for language in ("en","ar"):
  if post.get(language): search_headings.extend(re.findall(r"^#{1,3}\s+(.+)$",post[language]["markdown"],flags=re.M))
 search_tags=sum((post.get(language,{}).get("tags",[]) for language in ("en","ar")),[])
 search_parts=[]
 for language in ("en","ar"):
  if post.get(language): search_parts.extend((post[language]["title"],post[language].get("description","")))
 search_parts.extend((post.get("category_en",""),post.get("category_ar",""),*search_tags,*search_headings))
 search_text=" ".join(search_parts)
 search_title=" ".join(post[l]["title"] for l in ("en","ar") if post.get(l))
 cls="blog-feature-card" if featured else "blog-card"
 eyebrow=ui["featured_label"] if featured else label
 return f'''<a class="{cls}" href="{url}" data-theme="{esc(post.get("category_key",post.get("theme","00")[:2]))}" data-search="{esc(search_text.lower())}" data-search-title="{esc(search_title.lower())}">
<span class="blog-card-kicker">{esc(eyebrow)} <span aria-hidden="true">↗</span></span><h2>{esc(data["title"])}</h2><p>{esc(data["description"])}</p><span class="blog-card-meta">{minutes(post,lang)} {esc(ui["read"])}</span></a>'''

def index_page(lang):
 posts=posts_for(lang)
 if not posts: raise SystemExit("No blog articles for language: "+lang)
 ui=dict(UI[lang]); basepath="/ar/blog/" if lang=="ar" else "/blog/"
 if lang=="ar":
  count=str(len(posts)).translate(str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩"))+" مقالًا عمليًا · العربية"
 else: count=f"{len(posts)} practical articles · English"
 ui["count"]=count
 canonical=BASE+basepath; en_url=BASE+"/blog/"; ar_url=BASE+"/ar/blog/"
 schema={"@context":"https://schema.org","@type":"CollectionPage","name":ui["title"],"description":ui["intro"],"url":canonical,"inLanguage":lang,
 "author":{"@type":"Person","name":"Mahmoud Abdelnaby","url":BASE+"/"},
 "mainEntity":{"@type":"ItemList","numberOfItems":len(posts),"itemListElement":[
  {"@type":"ListItem","position":i+1,"url":BASE+f'/{("ar/" if lang=="ar" else "")}blog/{p["slug"]}/',"name":p[lang]["title"]} for i,p in enumerate(posts)]}}
 pagehead=head(("مدونة التسويق والنمو | محمود عبدالنبي" if lang=="ar" else "Marketing & Growth Blog | Mahmoud Abdelnaby"),ui["intro"],canonical,en_url,ar_url,lang,schema,"website")
 filters=[f'<button class="blog-filter" type="button" data-filter="all" aria-pressed="true">{esc(ui["all"])}</button>']
 seen=set()
 for p in posts:
  category_key=p.get("category_key",p["theme"][:2])
  if category_key in seen: continue
  seen.add(category_key)
  label=p["category_ar" if lang=="ar" else "category_en"]
  filters.append(f'<button class="blog-filter" type="button" data-filter="{esc(category_key)}" aria-pressed="false">{esc(label)}</button>')
 cards="\n".join(card(p,lang) for p in posts[1:])
 language_href="/blog/" if lang=="ar" else "/ar/blog/"
 return f'''{pagehead}
<body class="blog-page blog-index-page"><div class="wrap blog-wrap">{nav(lang,language_href)}
<main id="main-content" class="blog-main">
<section class="blog-index-hero"><div class="blog-index-copy"><p class="blog-kicker">{esc(ui["kicker"])}</p><h1>{esc(ui["title"])}</h1><p class="blog-intro">{esc(ui["intro"])}</p><p class="blog-count">{esc(ui["count"])}</p></div><div class="blog-hero-mark" aria-hidden="true"><span>FIELD<br>NOTES</span><b>{len(posts)}</b><i>01 — {len(posts):02d}</i></div></section>
<section class="blog-featured"><div class="blog-featured-aside"><span>{esc(ui["featured"])}</span><p>{esc(ui["language_note"])}</p></div>{card(posts[0],lang,True)}</section>
<section class="blog-library" aria-labelledby="blog-library-title"><div class="blog-library-heading"><div><p class="blog-kicker">{esc(ui["topics"])}</p><h2 id="blog-library-title">{esc(ui["explore"])}</h2></div><label class="blog-search"><span>{esc(ui["search_label"])}</span><input type="search" data-blog-search placeholder="{esc(ui["search_placeholder"])}" autocomplete="off" dir="auto"></label></div>
<div class="blog-filter-list" aria-label="{esc(ui["topics"])}">{"".join(filters)}</div><p class="blog-results-status" data-blog-status data-default="{esc(ui["count"])}" data-one="{esc(ui["shown_one"])}" data-many="{esc(ui["shown"])}" aria-live="polite">{esc(ui["count"])}</p>
<div class="blog-grid" data-blog-grid>{"".join(cards)}</div><p class="blog-empty" data-blog-empty hidden>{esc(ui["no_results"])}</p></section>
<section class="blog-faq-note"><span class="blog-faq-index">MENA · EN / AR</span><p>{esc(ui["intro"])}</p><a href="{("/ar/marketing-systems/" if lang=="ar" else "/marketing-systems/")}">{esc(ui["guides"])} ↗</a></section>
</main>{footer(lang)}</div><script defer src="/assets/blog.js?v=20261029-natural-search-v5"></script></body></html>'''

def article_page(p,lang,localized_posts):
 data=p[lang]; ui=dict(UI[lang])
 if lang=="ar":
  ui["count"]=str(len(localized_posts)).translate(str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩"))+" مقالًا عمليًا · العربية"
 else: ui["count"]=f"{len(localized_posts)} practical articles · English"
 basepath=f'/{("ar/" if lang=="ar" else "")}blog/{p["slug"]}/'
 en_url=BASE+f'/blog/{p["slug"]}/'; ar_url=BASE+f'/ar/blog/{p["slug"]}/'
 canonical=ar_url if lang=="ar" else en_url
 other_lang="ar" if lang=="en" else "en"
 has_translation=isinstance(p.get(other_lang),dict) and bool(p[other_lang].get("markdown"))
 collection=BASE+("/ar/blog/" if lang=="ar" else "/blog/")
 category=p.get("category_ar" if lang=="ar" else "category_en",data.get("category",UI[lang]["topics"]))
 resources=[framework(fid,lang) for fid in p["framework_ids"]]
 resources=[x for x in resources if x]
 rendered=markdown.markdown(data["markdown"],extensions=["tables","fenced_code","sane_lists","toc"],output_format="html5")
 schema={"@context":"https://schema.org","@type":"BlogPosting","headline":data["title"],"description":data["description"],"inLanguage":lang,"dateModified":UPDATED,
 "author":{"@type":"Person","@id":BASE+"/#person","name":"Mahmoud Abdelnaby","url":BASE+"/"},"publisher":{"@type":"Person","@id":BASE+"/#person"},
 "mainEntityOfPage":{"@type":"WebPage","@id":canonical},"isPartOf":{"@type":"Blog","@id":collection,"name":("مدونة التسويق والنمو" if lang=="ar" else "Marketing & Growth Blog")},
 "about":[{"@type":"Thing","name":category}]}
 index=localized_posts.index(p)
 next_post=localized_posts[(index+1)%len(localized_posts)]; next_url=f'/{("ar/" if lang=="ar" else "")}blog/{next_post["slug"]}/'
 related_html="".join(f'<li><a href="{esc(x["href"])}">{esc(x["title"])} <span aria-hidden="true">↗</span></a><span>{esc(x["id"])}</span></li>' for x in resources)
 language_href=(f'/{("ar/" if other_lang=="ar" else "")}blog/{p["slug"]}/' if has_translation else ("/ar/blog/" if lang=="en" else "/blog/"))
 pagehead=head(data["title"]+(" | مدونة محمود عبدالنبي" if lang=="ar" else " | Mahmoud Abdelnaby"),data["description"],canonical,en_url,ar_url,lang,schema,"article",has_translation)
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
 en_count=len(posts_for("en")); ar_count=len(posts_for("ar")); total=en_count+ar_count
 ar_total=str(total).translate(str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩"))
 en_total=f"{total:,}"
 for path,anchor,promo in [
  (ROOT/"marketing-systems/index.html",'<section class="systems-utm-product" aria-labelledby="creator-planner-title">',f'<section class="blog-promo"><div><span>FIELD NOTES · {en_total} ARTICLE PAGES</span><h2>Read the marketing blog.</h2><p>{en_count} English and {ar_count} Arabic guides connect day-to-day marketing questions with practical frameworks.</p></div><a href="/blog/">Explore all articles <span aria-hidden="true">↗</span></a></section>'),
  (ROOT/"ar/marketing-systems/index.html",'<section class="systems-utm-product" aria-labelledby="creator-planner-title">',f'<section class="blog-promo" dir="rtl"><div><span>ملاحظات تطبيقية · {ar_total} مقالًا</span><h2>اقرأ مدونة التسويق.</h2><p>{str(ar_count).translate(str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩"))} دليلًا بالعربية و{str(en_count).translate(str.maketrans("0123456789","٠١٢٣٤٥٦٧٨٩"))} بالإنجليزية تربط أسئلة العمل التسويقي بأطر عملية.</p></div><a href="/ar/blog/">استكشف المقالات <span aria-hidden="true">↗</span></a></section>')]:
  text=path.read_text(encoding="utf-8")
  text=re.sub(r'<section class="blog-promo"[^>]*>.*?</section>',"",text,flags=re.S)
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
  block='  <url>\n    <loc>'+html.escape(r["url"])+'</loc>\n    <lastmod>'+UPDATED+'</lastmod>'
  if r.get("en") and r.get("ar"):
   block+='\n    <xhtml:link rel="alternate" hreflang="en" href="'+html.escape(r["en"])+'" />\n    <xhtml:link rel="alternate" hreflang="ar" href="'+html.escape(r["ar"])+'" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="'+html.escape(r["en"])+'" />'
  blocks.append(block+'\n  </url>')
 closing=re.search(r"</urlset>\s*$",raw)
 if not closing: raise SystemExit("Sitemap closing tag not found")
 result=raw[:closing.start()]+"\n"+"\n".join(blocks)+"\n"+raw[closing.start():]
 ET.fromstring(result)
 path.write_text(result,encoding="utf-8",newline="\n")
 return len(missing)

def main():
 if len({p["slug"] for p in POSTS})!=len(POSTS): raise SystemExit("Duplicate blog slug")
 for lang in ("en","ar"):
  localized=posts_for(lang)
  if not localized: raise SystemExit("No blog pages for language: "+lang)
  seen_bodies={}
  seen_titles={}
  seen_headings={}
  for p in localized:
   body=p[lang]["markdown"]
   title=p[lang]["title"].strip().casefold()
   if title in seen_titles: raise SystemExit("Duplicate article title: "+seen_titles[title]+" and "+p["slug"]+" "+lang)
   seen_titles[title]=p["slug"]
   if re.search(r"_{3,}",body): raise SystemExit("Unfilled placeholder: "+p["slug"]+" "+lang)
   if body in seen_bodies: raise SystemExit("Duplicate article body: "+seen_bodies[body]+" and "+p["slug"]+" "+lang)
   seen_bodies[body]=p["slug"]
   for heading in re.findall(r"^#{1,3}\s+(.+)$",body,re.M):
    normalized=heading.strip().casefold()
    if ("disclosure" in normalized or "الإفصاح عن مساعدة الذكاء الاصطناعي" in normalized
        or "إفصاح عن الذكاء الاصطناعي" in normalized):
     continue
    if normalized in seen_headings: raise SystemExit("Repeated article heading: "+seen_headings[normalized]+" and "+p["slug"]+" "+lang)
    seen_headings[normalized]=p["slug"]
 for p in POSTS:
  for lang in ("en","ar"):
   if not p.get(lang): continue
   if not p[lang].get("markdown"): raise SystemExit("Missing body: "+p["slug"]+" "+lang)
   for fid in p.get("framework_ids",[]):
    if not framework(fid,lang): raise SystemExit("Missing related framework: "+fid+" "+lang)
 (ROOT/"assets/blog.css").write_text(BLOG_CSS,encoding="utf-8",newline="\n")
 (ROOT/"assets/blog.js").write_text(BLOG_JS,encoding="utf-8",newline="\n")
 routes=[{"url":BASE+"/blog/","en":BASE+"/blog/","ar":BASE+"/ar/blog/"},{"url":BASE+"/ar/blog/","en":BASE+"/blog/","ar":BASE+"/ar/blog/"}]
 for lang in ("en","ar"):
  dest=ROOT/("ar/blog/index.html" if lang=="ar" else "blog/index.html"); dest.parent.mkdir(parents=True,exist_ok=True)
  dest.write_text(index_page(lang),encoding="utf-8",newline="\n")
 for p in POSTS:
  for lang in ("en","ar"):
   if not p.get(lang): continue
   dest=ROOT/("ar" if lang=="ar" else "")/"blog"/p["slug"]/"index.html"
   dest.parent.mkdir(parents=True,exist_ok=True); dest.write_text(article_page(p,lang,posts_for(lang)),encoding="utf-8",newline="\n")
   route={"url":BASE+f'/{("ar/" if lang=="ar" else "")}blog/{p["slug"]}/'}
   if p.get("en") and p.get("ar"):
    route.update({"en":BASE+"/blog/"+p["slug"]+"/","ar":BASE+"/ar/blog/"+p["slug"]+"/"})
   routes.append(route)
 add_links(); add_hub_promo(); added=update_sitemap(routes)
 print(f"Generated {len(posts_for('en'))} English and {len(posts_for('ar'))} Arabic article pages and 2 indexes.")
 print(f"Added {added} canonical routes to sitemap.")
 print("Each article links to its existing matching frameworks in both languages.")

BLOG_CSS = r"""/* Portfolio editorial blog */
.blog-page{--blog-paper:#f0ede3;--blog-green:#7ce6c5;--blog-gold:#f0c96b;--blog-muted:#94a8b5;background:#101d27;color:#edf0e9}
.blog-wrap{max-width:1240px}.blog-topbar{border-bottom:1px solid #ffffff1c;padding-inline:clamp(20px,2vw,32px)}.blog-topbar .nav>a.lang{display:inline-flex;align-items:center;justify-content:center;min-height:44px;white-space:nowrap}.blog-main{padding-bottom:64px}
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
@media(max-width:620px){.blog-topbar .nav>a.lang{display:inline-flex!important;visibility:visible!important;min-width:44px;min-height:44px;margin-inline-start:8px}.blog-page #privacy-settings{position:fixed!important;inset-block-start:auto!important;inset-block-end:.5rem!important;inset-inline-start:auto!important;inset-inline-end:.5rem!important;width:auto!important;max-width:calc(100vw - 1rem)!important}html[dir="rtl"] .blog-page #privacy-settings{inset-inline-start:.5rem!important;inset-inline-end:auto!important}}
@media(max-width:620px){.blog-topbar{padding-inline:12px}.blog-index-hero{grid-template-columns:1fr;padding:48px 0 52px}.blog-hero-mark{min-height:160px}.blog-hero-mark b{font-size:100px}.blog-featured{grid-template-columns:1fr;gap:12px;margin-bottom:76px}.blog-featured-aside{min-height:auto;gap:12px}.blog-featured-aside p{max-width:100%}.blog-feature-card{min-height:280px;padding:24px}.blog-library-heading{align-items:stretch;flex-direction:column}.blog-search{width:100%}.blog-grid{grid-template-columns:1fr}.blog-card{min-height:200px}.blog-faq-note{grid-template-columns:1fr;gap:12px;margin-top:65px}.blog-faq-note a{grid-column:auto;white-space:normal}.blog-footer{align-items:flex-start;flex-direction:column}.blog-article-header{padding-top:45px}.blog-prose{margin-top:28px;padding:22px 19px}.blog-prose p,.blog-prose li{font-size:16px}.blog-related{gap:12px}.blog-next{grid-template-columns:1fr}.blog-promo{align-items:flex-start;flex-direction:column;padding:20px}.blog-promo>a{white-space:normal}}
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
 const stopWords=new Set(("a an and are as at be by do does did for from how i in is it me my of on or the to was were what when where why with you your need want looking find show help have has had this that please can could would should about into using get gets getting make makes made much many more most some any something anything thing things aint dont doesn't didn't not no but so then than there here they them their we us our he she his her its if while after before very really much just also still already done going go goes got give giving take taking have has had am is are was were will would can could should do does did pls please want to רוצה i want looking for trying to need to" ).split(/\s+/));
 const arabicStopWords="انا أنا احنا إحنا انت انتو انتم هو هي هما هم هن احنا عندي عندنا لدي لديك لي عند عايز عايزة عاوز عاوزه عايزين عاوزين محتاج محتاجة محتاجين اريد أرغب ابغى ابغي ابي نفسي ازاي ازاى كيف ماذا ايه ايش اي ايه هو هي هل في ف فين من على عن الي اللي الذي التي و او ثم لكن لو يكون كده كدا كذا كمان جدا مش مو مشي ما لا ليس لسه دلوقتي حاليا بعدها بهم بي بقى بقي على الرغم عندي لدي طريقة طرق حاجه حاجة شيء حل حلول مشكله مشكلة مشاكل يعني مثلا مثل مثلا عايز اعرف اريد ان عايز ان عايزة ان محتاج ان انا عندي عندنا يوجد عندهم عندنا بتاع بتاعتي بتاعتي بتاعه بتاعها بتاعهم بتاعت بتاعتي اللي هو اللي هي بيكون يكون بقي بخصوص الخاصه الخاصة بتاعتي بتاعتهم عشان عشان كده الخ إلخ من بقا بقى كدا جدا فعلا قوي كويس حلو افضل أفضل احسن أحسن ممكن اقدر أقدر اقدر اعمل أعمل اعمل اجيب ازود أزود ياريت يريت لو سمحت ممكن تعمل ازاي ازاي ليه لماذا ليش مش عارف معرفش ماعرفش مش فاهم فاهم فكره فكرة عايز حاجة".split(/\s+/);
 for(const word of arabicStopWords)stopWords.add(word);
 const synonymGroups=[
  "lead leads prospect prospects inquiry inquiries enquiry enquiries contact conversion customer customers buyer buyers signup signups العميل العملاء عميل عملاء محتمل محتملة محتملين محتملون زبون زباين استفسار استفسارات استعلام تواصل رسالة رسائل",
  "measure measurement tracking track analytics attribution pixel event events conversion rate reporting metrics measure clicks clicks click قياس قياسه قياسها تتبع تتبعها تتبعهم تحليلات احصاء احصائيات نسبه نتائج نقره نقرة نقرات",
  "problem issue broken fix troubleshoot diagnose diagnosis stuck failing fail fails failed notworking حل حلول مشكلة مشاكل عطل اعطال لايعمل لايعملش اصلاح تشخيص مش شغال مش شغالة واقف بيعلق مش بيشتغل مش راضي",
  "growth grow improve improvement optimize optimization increase increased boost raise scale scaling sales revenue profit business performance sales growth sale sell selling grow نمو نموه تنمية تطور تطوير تحسين احسن ازود زيادة زياده مبيعات المبيعات بيع ايرادات ربح ارباح اداء نتائج ازود ازودها تكبير",
  "campaign campaigns ads advertising paid media ad spend advertising spend budget اعلان اعلانات اعلاني حملة حملات اعلان اعلانية اعلانيه اعلان ممول اعلانات مموله مصاريف ميزانية",
  "content writing write draft article blog copy content post posts idea ideas calendar كتابة اكتب محتوى مقال مقالات نص صياغة صياغه بوست بوستات منشور منشورات افكار افكار محتوى تقويم",
  "search seo ranking rankings index indexing indexed discover discoverability visibility visible showing show appear appearing appear google searchengine serp rank بحث بحثا ظهور اظهر اظهره ترتيب فهرسة مفهرس فهرسة نتائج جوجل ظاهر ظاهرش بيظهر بيظهرش يطلع يطلعش مش ظاهر مش بيظهر مش بيطلع مش لاقي",
  "whatsapp واتساب واتس اب واتسآب",
  "video videos creative film فيديو فيديوهات مرئي اعلان اعلانات تصوير مونتاج",
  "website page landing site web mobile form checkout websiteconversion conversion rate customer journey site speed website site speed موقع صفحات موقع صفحة صفحات صفحة هبوط لاندنج موبايل جوال فورم نموذج checkout",
  "email emails newsletter emailmarketing deliverability bounce inbox open click unsubscribers subscribe welcome automation lifecycle بريد ايميل ايميلات رسائل نشرة يوصل بيوصلش مش بيوصل مش بيفتح",
  "social socials instagram tiktok linkedin youtube engagement community post posts instagram tiktok linkedin سوشيال اجتماعي اجتماعية انستغرام انستجرام تيك توك لينكدان يوتيوب تفاعل متابعين جمهور بوستات",
  "video videos creative film views watch watched hook ad creative storyboard production video فيديو فيديوهات مرئي تصوير مونتاج مشاهدات مشاهده اعلان اعلانات",
  "influencer influencers creator creators brand sponsorship disclosure audience partnership المؤثرين مؤثر مؤثرين صانع صناع محتوى رعاية افصاح",
  "budget spend cost cpa cpc cpm bidding auction paid budget الميزانية ميزانيه صرف تكلفة تكاليف مزايدة مزايدات"
 ];
 const normalize=value=>value.toLocaleLowerCase().normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/[ؤ]/g,"و").replace(/[ئ]/g,"ي").replace(/ة/g,"ه").replace(/[^a-z0-9\u0600-\u06ff]+/g," ").trim();
 const stem=word=>{
  if(word.length>5) word=word.replace(/^(وال|بال|كال|لل|ال)/," ").trim();
  if(word.length>5) word=word.replace(/(يات|ات|ون|ين|ان|ها|هم|هن|ية|يه|نا|كم|كن)$/," ").trim();
  if(word.length>5) word=word.replace(/(ing|ers|ies|ied|ed|es|s)$/," ").trim();
  return word;
 };
 const concepts=synonymGroups.map(group=>new Set(group.split(/\s+/).map(word=>stem(normalize(word))).filter(Boolean)));
 const tokens=value=>Array.from(new Set(normalize(value).split(/\s+/).map(stem).filter(word=>word.length>1&&!stopWords.has(word))));
 const expanded=word=>{const group=concepts.find(set=>set.has(word));return group||new Set([word]);};
 const intentRules=[
  {pattern:/(مش\s*(ظاهر|بيظهر|بيطلع|مفهرس)|مش\s*بيبان|مش\s*لاق[يى].{0,12}(جوجل|google)|اظهر.{0,20}(جوجل|google|بحث)|ظهور.{0,20}(جوجل|google|بحث)|doesn\s*t\s*(show|appear|rank|index)|not\s*(showing|appearing|indexed|ranking)|can\s*t\s*find.{0,20}(site|page)|missing\s*from\s*google|not\s*in\s*search)/,terms:["search","seo","indexing","visibility"]},
  {pattern:/(واتساب|واتس\s*اب|whatsapp).{0,45}(ضغط|نقر|بعت|يبعت|رساله|استفسار|عميل|lead|message|click|contact)|(ضغط|نقر|click).{0,35}(واتساب|whatsapp)|clicks?.{0,35}(but|no|without).{0,25}(message|lead|sales?)/,terms:["whatsapp","contact","lead","measure"]},
  {pattern:/(اعلان|إعلان|حمل[هة]|ads?|campaign).{0,55}(صرف|فلوس|نقر|مبيع|عميل|نتيج|تحويل|مفيش|مش|but|no|without|click|sale|lead|result|convert|spend)|(صرف|فلوس|مبيع|نقر).{0,35}(اعلان|إعلان|ads?|campaign)|ads?.{0,40}(but|no|without).{0,25}(sales?|leads?|conversions?)/,terms:["campaign","paid","sales","conversion","measure"]},
  {pattern:/(محتاج|عايز|اريد|want|need|looking).{0,35}(محتوى|مقال|بوست|افكار|كتابة|content|article|post|ideas?)/,terms:["content","writing","social"]},
  {pattern:/(فيديو|video|creative|اعلان فيديو).{0,45}(مش|ضعيف|قليل|مشاهد|نتيج|بيجيب|views?|perform|hook|click|watch)|(مشاهدات|مشاهده|views?).{0,35}(فيديو|video|اعلان|ad)/,terms:["video","creative","campaign"]},
  {pattern:/(موقع|صفحه|صفحة|form|landing page|website).{0,45}(موبايل|موبايل|جوال|بطيء|بيخرج|بيسيب|مش بيكمل|نموذج|تحويل|موبايل|mobile|slow|drop|leave|form|convert)|(checkout|form).{0,30}(drop|abandon|fail|مشكله|مشكلة)/,terms:["website","mobile","conversion","form"]},
  {pattern:/(ايميل|إيميل|email|بريد).{0,40}(مش بيوصل|مش بيظهر|spam|inbox|bounce|مش بيفتح|deliver|open|مشكله|مشكلة)/,terms:["email","deliverability","measurement"]},
  {pattern:/(مؤثر|مؤثرين|influencer|creator).{0,45}(مش|نتيج|جمهور|اعلان|حملة|قياس|سعر|سعره|result|audience|campaign|measure|cost)/,terms:["influencer","campaign","measure"]},
  {pattern:/(عايز|عايزة|عاوز|اريد|want|need).{0,45}(ازود|زيادة|مبيع|عملاء|استفسارات|leads?|sales?|grow|increase|more customers)/,terms:["growth","sales","lead"]},
  {pattern:/(مش عارف|مش فاهم|ازاي اعرف|كيف اعرف|how do i know|how can i tell).{0,50}(قناة|حملة|نتيجة|اعلان|تسويق|channel|campaign|result|ads?)/,terms:["measure","campaign","growth"]}
 ];
 const interpretQuery=value=>{
  const normalized=normalize(value);
  const queryTokens=tokens(value);
  for(const rule of intentRules)if(rule.pattern.test(normalized))queryTokens.push(...rule.terms.flatMap(term=>tokens(term)));
  return Array.from(new Set(queryTokens));
 };
 const searchScore=(card,queryTokens)=>{
  if(!queryTokens.length)return 1;
  const title=new Set(tokens(card.dataset.searchTitle||""));
  const body=new Set(tokens(card.dataset.search||""));
  let score=0,matched=0;
  for(const queryToken of queryTokens){
   const alternatives=expanded(queryToken);
   const titleHit=Array.from(alternatives).some(word=>title.has(word)||Array.from(title).some(candidate=>candidate.startsWith(word)&&word.length>=4));
   const bodyHit=titleHit||Array.from(alternatives).some(word=>body.has(word)||Array.from(body).some(candidate=>candidate.startsWith(word)&&word.length>=4));
   if(bodyHit){matched++;score+=titleHit?3:1;}
  }
  const coverage=matched/queryTokens.length;
  const minimum=queryTokens.length===1?1:queryTokens.length===2?.5:Math.min(.55,2/queryTokens.length);
  return coverage>=minimum?score+coverage:-1;
 };
 const apply=()=>{
  const queryTokens=interpretQuery(search?search.value:"");
  let visible=0;
  const ranked=[];
  for(const card of cards){
   const matchTheme=active==="all"||card.dataset.theme===active;
   const score=searchScore(card,queryTokens);
   const matchSearch=score>=0;
   const show=matchTheme&&matchSearch; card.hidden=!show; if(show)visible+=1;
   if(card.classList.contains("blog-card"))ranked.push({card,score:matchTheme&&show?score:-1});
  }
  if(queryTokens.length){ranked.sort((a,b)=>b.score-a.score);const grid=document.querySelector("[data-blog-grid]");if(grid)for(const item of ranked)grid.append(item.card);}
  if(empty)empty.hidden=visible!==0;
  if(status){
   if(queryTokens.length||active!=="all") status.textContent=String(visible)+" "+(visible===1?status.dataset.one:status.dataset.many);
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

BLOG_JS = (ROOT / "assets/blog.js").read_text(encoding="utf-8")

if __name__ == "__main__":
 main()


