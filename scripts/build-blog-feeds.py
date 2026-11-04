from __future__ import annotations

import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET


BASE = "https://mahmoudabdelnaby1.github.io"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ATOM_NS = "http://www.w3.org/2005/Atom"
ET.register_namespace("atom", ATOM_NS)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build bilingual RSS feeds from the portfolio blog content.")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()

    data = json.loads((root / "data/blog-content.json").read_text(encoding="utf-8"))
    sitemap = ET.parse(root / "sitemap.xml").getroot()
    sitemap_urls = {
        node.findtext(f"{{{SITEMAP_NS}}}loc")
        for node in sitemap.findall(f"{{{SITEMAP_NS}}}url")
    }

    count_by_language: dict[str, int] = {}
    for lang, prefix, output, feed_title in (
        ("en", "", root / "blog/feed.xml", "Marketing & Growth Blog | Mahmoud Abdelnaby"),
        ("ar", "ar/", root / "ar/blog/feed.xml", "مدونة التسويق والنمو | محمود عبدالنبي"),
    ):
        localized = [post for post in data["posts"] if isinstance(post.get(lang), dict) and post[lang].get("markdown")]
        if not localized:
            raise SystemExit(f"No {lang} blog posts found in data/blog-content.json")

        channel = ET.Element("channel")
        ET.SubElement(channel, "title").text = feed_title
        ET.SubElement(channel, "link").text = f"{BASE}/{prefix}blog/"
        ET.SubElement(channel, "description").text = (
            "Bilingual, task-led marketing guides for MENA." if lang == "en"
            else "أدلة تسويقية عملية تبدأ من أسئلة العمل في أسواق MENA."
        )
        ET.SubElement(channel, f"{{{ATOM_NS}}}link", {
            "href": f"{BASE}/{prefix}blog/feed.xml", "rel": "self", "type": "application/rss+xml"
        })
        ET.SubElement(channel, "language").text = "en" if lang == "en" else "ar"

        for post in localized:
            page_url = f"{BASE}/{prefix}blog/{post['slug']}/"
            if page_url not in sitemap_urls:
                raise SystemExit(f"Blog URL missing from sitemap.xml: {page_url}")
            item = ET.SubElement(channel, "item")
            ET.SubElement(item, "title").text = post[lang]["title"]
            ET.SubElement(item, "link").text = page_url
            ET.SubElement(item, "description").text = post[lang].get("description", "")
            ET.SubElement(item, "guid", {"isPermaLink": "true"}).text = page_url

        output.parent.mkdir(parents=True, exist_ok=True)
        rss = ET.Element("rss", {"version": "2.0"})
        rss.append(channel)
        ET.ElementTree(rss).write(output, encoding="utf-8", xml_declaration=True)
        count_by_language[lang] = len(localized)

    print(f"Generated English and Arabic RSS feeds with {count_by_language['en']} and {count_by_language['ar']} canonical sitemap URLs.")


if __name__ == "__main__":
    main()
