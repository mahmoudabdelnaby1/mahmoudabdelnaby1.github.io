from html.parser import HTMLParser
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://mahmoudabdelnaby1.github.io"
NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.canonicals = []
        self.jsonld = []
        self.in_jsonld = False
        self.jsonld_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_jsonld = True
            self.jsonld_text = []

    def handle_endtag(self, tag):
        if tag == "script" and self.in_jsonld:
            self.jsonld.append("".join(self.jsonld_text))
            self.in_jsonld = False

    def handle_data(self, data):
        if self.in_jsonld:
            self.jsonld_text.append(data)


pages = [(ROOT / "marketing-systems/index.html"), (ROOT / "ar/marketing-systems/index.html")] + sorted((ROOT / "marketing-systems").glob("*/index.html")) + sorted((ROOT / "ar/marketing-systems").glob("*/index.html"))
if len(pages) != 20:
    raise SystemExit(f"Expected 20 collection/detail pages; found {len(pages)}")
markdown = list((ROOT / "marketing-systems/guides/en").glob("*.md")) + list((ROOT / "marketing-systems/guides/ar").glob("*.md"))
if len(markdown) != 18:
    raise SystemExit(f"Expected 18 source guides for nine new resources; found {len(markdown)}")

errors = []
for path in pages:
    parser = PageParser()
    source = path.read_text(encoding="utf-8")
    parser.feed(source)
    if len(parser.canonicals) != 1:
        errors.append(f"{path.relative_to(ROOT)}: expected exactly one canonical")
    for data in parser.jsonld:
        try:
            json.loads(data)
        except json.JSONDecodeError as error:
            errors.append(f"{path.relative_to(ROOT)}: invalid JSON-LD: {error}")
    for href in parser.links:
        if href.startswith(("https://", "http://", "mailto:", "tel:", "#")):
            continue
        target = href.split("#", 1)[0].split("?", 1)[0]
        if not target:
            continue
        local = ROOT / target.lstrip("/")
        if target.endswith("/"):
            local = local / "index.html"
        if not local.is_file():
            errors.append(f"{path.relative_to(ROOT)}: missing local link {href}")

tree = ET.parse(ROOT / "sitemap.xml")
urls = {element.findtext("s:loc", namespaces=NS) for element in tree.getroot().findall("s:url", NS)}
expected = {BASE + "/marketing-systems/", BASE + "/ar/marketing-systems/"}
for guide in (ROOT / "marketing-systems").glob("*/index.html"):
    if guide.parent.name != "marketing-systems":
        expected.add(BASE + "/marketing-systems/" + guide.parent.name + "/")
for guide in (ROOT / "ar/marketing-systems").glob("*/index.html"):
    if guide.parent.name != "marketing-systems":
        expected.add(BASE + "/ar/marketing-systems/" + guide.parent.name + "/")
missing_sitemap = expected - urls
if missing_sitemap:
    errors.append(f"Sitemap missing {len(missing_sitemap)} new routes")
if any("/labs/" in url for url in urls):
    errors.append("Retired Labs URLs remain in sitemap")

for filename, expected_path in (("index.html", "/marketing-systems/"), ("ar/index.html", "/ar/marketing-systems/")):
    source = (ROOT / filename).read_text(encoding="utf-8")
    if expected_path not in source or "id=\"marketing-systems\"" not in source:
        errors.append(f"{filename}: systems navigation or home section is missing")
    if "marketing-labs" in source or "#marketing-labs" in source:
        errors.append(f"{filename}: retired Labs navigation or section remains")

for filename in ("marketing-systems/index.html", "ar/marketing-systems/index.html"):
    source = (ROOT / filename).read_text(encoding="utf-8")
    if source.count('class="system-card"') != 18:
        errors.append(f"{filename}: expected 18 listed resources")
    if "9 NEW GUIDES" not in source and "٩ أدلة جديدة" not in source:
        errors.append(f"{filename}: new versus existing resources are not distinguished")

if errors:
    print("\n".join(errors))
    raise SystemExit(1)
print(f"PASS: {len(pages)} HTML pages, {len(markdown)} working guides, local links, JSON-LD, canonicals, and sitemap routes.")
