from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET


BASE = "https://mahmoudabdelnaby1.github.io"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
XHTML_NS = "http://www.w3.org/1999/xhtml"
ET.register_namespace("", SITEMAP_NS)
ET.register_namespace("xhtml", XHTML_NS)


class HeadLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.robots = ""
        self.canonicals: list[str] = []
        self.alternates: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "meta" and (attributes.get("name") or "").lower() == "robots":
            self.robots = attributes.get("content", "") or ""
        elif tag == "link":
            rel = (attributes.get("rel") or "").lower().split()
            href = attributes.get("href") or ""
            if "canonical" in rel:
                self.canonicals.append(href)
            elif "alternate" in rel and attributes.get("hreflang"):
                self.alternates[attributes["hreflang"] or ""] = href


def canonical_tag(url: str) -> str:
    return f'<link href="{url}" rel="canonical"/>'


def alternate_tag(language: str, url: str) -> str:
    return f'<link href="{url}" hreflang="{language}" rel="alternate"/>'


def rewrite_links(source: str, replacements: dict[str, str]) -> tuple[str, bool]:
    changed = False

    def replace_tag(match: re.Match[str]) -> str:
        nonlocal changed
        tag = match.group(0)
        lowered = tag.lower()
        if "/assistants/library/#" not in tag:
            return tag
        if 'rel="canonical"' in lowered and "canonical" in replacements:
            changed = True
            return replacements["canonical"]
        if 'rel="alternate"' in lowered:
            for language in ("en", "ar", "x-default"):
                if f'hreflang="{language}"' in lowered and language in replacements:
                    changed = True
                    return replacements[language]
        return tag

    return re.sub(r"<link\b[^>]*>", replace_tag, source, flags=re.I), changed


def normalize_assistant_pages(root: Path) -> int:
    changed_pages = 0
    assistant_roots = (("assistants", "en"), ("ar/assistants", "ar"))
    for relative_root, language in assistant_roots:
        folder = root / relative_root
        if not folder.is_dir():
            continue
        for page in sorted(folder.glob("*/index.html")):
            if page.parent.name == "library":
                continue
            source = page.read_text(encoding="utf-8")
            parser = HeadLinks()
            parser.feed(source)
            if not parser.canonicals or "/assistants/library/#" not in parser.canonicals[0]:
                continue
            slug = parser.canonicals[0].rsplit("#", 1)[-1]
            if slug != page.parent.name:
                raise ValueError(f"{page}: fragment id does not match page directory ({slug})")
            en_url = f"{BASE}/assistants/{slug}/"
            ar_url = f"{BASE}/ar/assistants/{slug}/"
            replacements = {
                "canonical": canonical_tag(ar_url if language == "ar" else en_url),
                "en": alternate_tag("en", en_url),
                "ar": alternate_tag("ar", ar_url),
                "x-default": alternate_tag("x-default", en_url),
            }
            updated, changed = rewrite_links(source, replacements)
            if changed:
                page.write_text(updated, encoding="utf-8", newline="")
                changed_pages += 1

    # The calculator is a distinct interactive route in both languages. Keep the
    # two calculator pages as a reciprocal language pair instead of folding one
    # language into the guide page.
    en_url = f"{BASE}/playbooks/whatsapp-business-platform-cost-model/calculator.html"
    ar_url = f"{BASE}/ar/playbooks/whatsapp-business-platform-cost-model/calculator.html"
    for language, relative_path in (
        ("en", "playbooks/whatsapp-business-platform-cost-model/calculator.html"),
        ("ar", "ar/playbooks/whatsapp-business-platform-cost-model/calculator.html"),
    ):
        page = root / relative_path
        if not page.is_file():
            continue
        source = page.read_text(encoding="utf-8")
        replacements = {
            "canonical": canonical_tag(ar_url if language == "ar" else en_url),
            "en": alternate_tag("en", en_url),
            "ar": alternate_tag("ar", ar_url),
            "x-default": alternate_tag("x-default", en_url),
        }

        def replace_calculator_tag(match: re.Match[str]) -> str:
            tag = match.group(0)
            lowered = tag.lower()
            if 'rel="canonical"' in lowered:
                return replacements["canonical"]
            if 'rel="alternate"' in lowered:
                for alt_language in ("en", "ar", "x-default"):
                    if f'hreflang="{alt_language}"' in lowered:
                        return replacements[alt_language]
            return tag

        updated = re.sub(r"<link\b[^>]*>", replace_calculator_tag, source, flags=re.I)
        if updated != source:
            page.write_text(updated, encoding="utf-8", newline="")
            changed_pages += 1
    return changed_pages


def route_for(root: Path, page: Path) -> str:
    relative = page.relative_to(root).as_posix()
    if relative == "index.html":
        return BASE + "/"
    if relative.endswith("/index.html"):
        return BASE + "/" + relative[: -len("/index.html")] + "/"
    return BASE + "/" + relative


def collect_pages(root: Path) -> tuple[dict[str, tuple[Path, HeadLinks]], int]:
    pages: dict[str, tuple[Path, HeadLinks]] = {}
    ignored = 0
    errors: list[str] = []
    for page in sorted(root.rglob("*.html")):
        if ".git" in page.parts or "_site" in page.parts:
            continue
        parser = HeadLinks()
        try:
            parser.feed(page.read_text(encoding="utf-8"))
        except (OSError, UnicodeError) as error:
            errors.append(f"{page.relative_to(root)}: unable to read HTML ({error})")
            continue
        if "noindex" in parser.robots.lower().split(","):
            ignored += 1
            continue
        if len(parser.canonicals) != 1:
            errors.append(f"{page.relative_to(root)}: expected exactly one canonical")
            continue
        canonical = parser.canonicals[0]
        if "#" in canonical:
            errors.append(f"{page.relative_to(root)}: canonical contains a fragment ({canonical})")
            continue
        if canonical != route_for(root, page):
            errors.append(f"{page.relative_to(root)}: canonical is not self-referential ({canonical})")
            continue
        if canonical in pages:
            errors.append(f"{page.relative_to(root)}: duplicate canonical ({canonical})")
            continue
        pages[canonical] = (page, parser)

    for url, (page, parser) in pages.items():
        for language, alternate in parser.alternates.items():
            if "#" in alternate:
                errors.append(f"{page.relative_to(root)}: {language} alternate contains a fragment ({alternate})")
            elif alternate not in pages:
                errors.append(f"{page.relative_to(root)}: {language} alternate is not an indexable self-canonical page ({alternate})")
        if "en" in parser.alternates and "ar" in parser.alternates:
            en = pages.get(parser.alternates["en"])
            ar = pages.get(parser.alternates["ar"])
            if en and ar:
                if en[1].alternates.get("ar") != parser.alternates["ar"]:
                    errors.append(f"{page.relative_to(root)}: English/Arabic alternates are not reciprocal")
                if ar[1].alternates.get("en") != parser.alternates["en"]:
                    errors.append(f"{page.relative_to(root)}: Arabic/English alternates are not reciprocal")
                if parser.alternates.get("x-default") and parser.alternates["x-default"] != parser.alternates["en"]:
                    errors.append(f"{page.relative_to(root)}: x-default does not point to the English URL")

    if errors:
        raise ValueError("\n".join(errors[:80]))
    return pages, ignored


def write_sitemap(root: Path, pages: dict[str, tuple[Path, HeadLinks]]) -> None:
    urlset = ET.Element(f"{{{SITEMAP_NS}}}urlset")
    for url in sorted(pages):
        entry = ET.SubElement(urlset, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(entry, f"{{{SITEMAP_NS}}}loc").text = url
        for language, href in sorted(pages[url][1].alternates.items()):
            ET.SubElement(entry, f"{{{XHTML_NS}}}link", {"rel": "alternate", "hreflang": language, "href": href})
    ET.indent(urlset, space="  ")
    ET.ElementTree(urlset).write(root / "sitemap.xml", encoding="utf-8", xml_declaration=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize bilingual assistant metadata and generate a sitemap from indexable canonical pages.")
    parser.add_argument("--root", type=Path, default=Path("."), help="site source or assembled Pages artifact directory")
    arguments = parser.parse_args()
    root = arguments.root.resolve()
    if not root.is_dir():
        print(f"Site root does not exist: {root}", file=sys.stderr)
        return 1
    try:
        updated = normalize_assistant_pages(root)
        pages, ignored = collect_pages(root)
        write_sitemap(root, pages)
    except (OSError, UnicodeError, ValueError) as error:
        print(error, file=sys.stderr)
        return 1
    print(f"Prepared {len(pages):,} canonical URLs; normalized {updated:,} assistant/calculator pages; excluded {ignored:,} noindex pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

