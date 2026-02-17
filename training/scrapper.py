"""
Indian Finance Data Scraper
Targets only verified working sites:
- RBI FAQs (10 pages)
- Zerodha Varsity (chapters)
- Finshots articles
- Freefincal articles
- MoneyControl glossary
- BSE India
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re

print("="*60)
print("INDIAN FINANCE SCRAPER")
print("="*60)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

OUTPUT_FILE = "india_finance_dataset.json"
all_data = []

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_page(url, delay=1.5):
    """Fetch a page safely"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        time.sleep(delay)
        if response.status_code == 200:
            return BeautifulSoup(response.content, 'html.parser')
        return None
    except:
        return None

def clean_text(text):
    """Clean scraped text"""
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def save_progress(data, filename=OUTPUT_FILE):
    """Save current data"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ============================================================
# SOURCE 1: RBI FAQs (10 pages)
# ============================================================
def scrape_rbi():
    print("\n[1/6] Scraping RBI FAQs (10 pages)...")
    data = []

    rbi_pages = [
        ("Bank Accounts",    "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=16"),
        ("Loans",            "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=69"),
        ("Digital Payments", "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=92"),
        ("NEFT RTGS",        "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=115"),
        ("Credit Cards",     "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=116"),
        ("KYC",              "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=79"),
        ("Forex",            "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=67"),
        ("Deposits",         "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=30"),
        ("Ombudsman",        "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=57"),
        ("Prepaid Cards",    "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=99"),
    ]

    for topic, url in rbi_pages:
        soup = get_page(url)
        if not soup:
            print(f"   ⚠️ Skipped: {topic}")
            continue

        page_data = []

        # RBI uses accordion with divs containing Q and A
        # Try multiple selectors
        
        # Method 1: Find by accordion/panel structure
        accordions = soup.find_all('div', class_=re.compile('accordion|panel|faq|collaps', re.I))
        for acc in accordions:
            q = acc.find(['h3', 'h4', 'h5', 'strong', 'b', 'dt'])
            a = acc.find(['p', 'dd', 'div'])
            if q and a:
                q_text = clean_text(q.get_text())
                a_text = clean_text(a.get_text())
                if len(q_text) > 15 and len(a_text) > 30 and q_text != a_text:
                    page_data.append({
                        "instruction": q_text,
                        "output": a_text
                    })

        # Method 2: Find all bold/strong text followed by paragraphs
        if len(page_data) < 3:
            content = soup.find('div', id=re.compile('content|main|body', re.I))
            if not content:
                content = soup.find('body')

            if content:
                elements = content.find_all(['b', 'strong', 'h3', 'h4'])
                for elem in elements:
                    q_text = clean_text(elem.get_text())
                    if len(q_text) > 20:
                        # Get answer from siblings
                        answer_parts = []
                        for sib in elem.find_next_siblings():
                            tag = sib.name
                            if tag in ['b', 'strong', 'h3', 'h4']:
                                break
                            text = clean_text(sib.get_text())
                            if len(text) > 20:
                                answer_parts.append(text)
                            if len(answer_parts) >= 3:
                                break

                        if answer_parts:
                            a_text = ' '.join(answer_parts)
                            if len(a_text) > 30:
                                page_data.append({
                                    "instruction": q_text,
                                    "output": a_text
                                })

        # Method 3: Extract Q? pattern from raw text
        if len(page_data) < 3:
            text = soup.get_text()
            lines = [clean_text(l) for l in text.split('\n') if len(clean_text(l)) > 15]

            i = 0
            while i < len(lines):
                line = lines[i]
                # If line looks like a question
                if (line.endswith('?') or line.startswith('Q.') or line.startswith('Q:')) and len(line) > 20:
                    q_text = line.replace('Q.', '').replace('Q:', '').strip()
                    # Collect answer
                    answer_parts = []
                    j = i + 1
                    while j < len(lines) and j < i + 6:
                        next_line = lines[j]
                        if next_line.endswith('?') or next_line.startswith('Q.'):
                            break
                        if len(next_line) > 20:
                            answer_parts.append(next_line.replace('A.', '').replace('A:', '').strip())
                        j += 1

                    if answer_parts:
                        a_text = ' '.join(answer_parts)
                        page_data.append({
                            "instruction": q_text,
                            "output": a_text
                        })
                i += 1

        print(f"   ✅ {topic}: {len(page_data)} Q&As")
        data.extend(page_data)

    print(f"   📊 RBI Total: {len(data)} Q&As")
    return data


# ============================================================
# SOURCE 2: Zerodha Varsity (chapters)
# ============================================================
def scrape_zerodha():
    print("\n[2/6] Scraping Zerodha Varsity chapters...")
    data = []

    modules = [
        ("Stock Markets",    "https://zerodha.com/varsity/module/introduction-to-stock-markets/"),
        ("Technical",        "https://zerodha.com/varsity/module/technical-analysis/"),
        ("Fundamental",      "https://zerodha.com/varsity/module/fundamental-analysis/"),
        ("Personal Finance", "https://zerodha.com/varsity/module/personalfinance/"),
    ]

    for module_name, module_url in modules:
        soup = get_page(module_url, delay=2)
        if not soup:
            continue

        # Find chapter links
        chapter_links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '/varsity/chapter/' in href:
                if href.startswith('/'):
                    href = 'https://zerodha.com' + href
                if href not in chapter_links:
                    chapter_links.append(href)

        print(f"   📚 {module_name}: {len(chapter_links)} chapters found")

        # Scrape each chapter (limit to 8 per module)
        for chapter_url in chapter_links[:8]:
            chap_soup = get_page(chapter_url, delay=2)
            if not chap_soup:
                continue

            # Get title
            title_elem = chap_soup.find('h1')
            if not title_elem:
                continue
            title = clean_text(title_elem.get_text())

            # Get content
            content_div = chap_soup.find('div', class_=re.compile('post-content|entry|chapter|article|content', re.I))
            if not content_div:
                content_div = chap_soup.find('article')
            if not content_div:
                continue

            # Get all paragraphs
            paragraphs = content_div.find_all('p')
            content_text = ' '.join([
                clean_text(p.get_text())
                for p in paragraphs
                if len(clean_text(p.get_text())) > 40
            ])

            if len(content_text) < 100:
                continue

            # Create main Q&A from full content
            data.append({
                "instruction": f"Explain {title} in the context of Indian financial markets.",
                "output": content_text[:1200]
            })

            # Also extract sub-sections as separate Q&As
            headings = content_div.find_all(['h2', 'h3', 'h4'])
            for heading in headings:
                heading_text = clean_text(heading.get_text())
                if len(heading_text) < 5:
                    continue

                # Get text after this heading
                section_parts = []
                for sib in heading.find_next_siblings():
                    if sib.name in ['h2', 'h3', 'h4']:
                        break
                    text = clean_text(sib.get_text())
                    if len(text) > 30:
                        section_parts.append(text)
                    if len(section_parts) >= 4:
                        break

                if section_parts:
                    section_text = ' '.join(section_parts)
                    if len(section_text) > 80:
                        data.append({
                            "instruction": f"What is {heading_text} in Indian stock market and investing?",
                            "output": section_text[:1000]
                        })

        print(f"   ✅ {module_name}: done")

    print(f"   📊 Zerodha Total: {len(data)} entries")
    return data


# ============================================================
# SOURCE 3: Finshots Articles
# ============================================================
def scrape_finshots():
    print("\n[3/6] Scraping Finshots articles...")
    data = []

    # Get archive page
    soup = get_page("https://finshots.in/archive/", delay=2)
    if not soup:
        print("   ⚠️ Finshots archive not accessible")
        return data

    # Find article links
    article_links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if href.startswith('https://finshots.in/') and '/archive/' not in href and len(href) > 25:
            if href not in article_links:
                article_links.append(href)

    print(f"   📰 Found {len(article_links)} articles")

    # Scrape each article (limit 30)
    for url in article_links[:30]:
        art_soup = get_page(url, delay=2)
        if not art_soup:
            continue

        # Title
        title_elem = art_soup.find('h1')
        if not title_elem:
            continue
        title = clean_text(title_elem.get_text())

        # Content
        content_div = art_soup.find('div', class_=re.compile('post-content|article|entry|content|body', re.I))
        if not content_div:
            content_div = art_soup.find('article')
        if not content_div:
            continue

        paragraphs = content_div.find_all('p')
        content = ' '.join([
            clean_text(p.get_text())
            for p in paragraphs
            if len(clean_text(p.get_text())) > 40
        ])

        if len(content) < 150:
            continue

        data.append({
            "instruction": f"Explain this Indian finance topic: {title}",
            "output": content[:1200]
        })

    print(f"   📊 Finshots Total: {len(data)} articles")
    return data


# ============================================================
# SOURCE 4: Freefincal Articles
# ============================================================
def scrape_freefincal():
    print("\n[4/6] Scraping Freefincal articles...")
    data = []

    soup = get_page("https://freefincal.com/", delay=2)
    if not soup:
        print("   ⚠️ Freefincal not accessible")
        return data

    # Find article links
    article_links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if 'freefincal.com' in href and len(href) > 30:
            if href not in article_links and '?' not in href:
                article_links.append(href)

    print(f"   📰 Found {len(article_links)} links")

    for url in article_links[:25]:
        art_soup = get_page(url, delay=2)
        if not art_soup:
            continue

        title_elem = art_soup.find('h1')
        if not title_elem:
            continue
        title = clean_text(title_elem.get_text())

        content_div = art_soup.find('div', class_=re.compile('entry|post|content|article', re.I))
        if not content_div:
            continue

        paragraphs = content_div.find_all('p')
        content = ' '.join([
            clean_text(p.get_text())
            for p in paragraphs
            if len(clean_text(p.get_text())) > 40
        ])

        if len(content) < 150:
            continue

        data.append({
            "instruction": f"Explain {title} for Indian investors.",
            "output": content[:1200]
        })

    print(f"   📊 Freefincal Total: {len(data)} articles")
    return data


# ============================================================
# SOURCE 5: MoneyControl Glossary
# ============================================================
def scrape_moneycontrol():
    print("\n[5/6] Scraping MoneyControl glossary...")
    data = []

    # Glossary pages A-Z
    for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
        url = f"https://www.moneycontrol.com/glossary/{letter}/"
        soup = get_page(url, delay=1.5)
        if not soup:
            continue

        # Find glossary terms and definitions
        terms = soup.find_all('div', class_=re.compile('glossary|term|definition', re.I))

        for term_div in terms:
            term_elem = term_div.find(['h2', 'h3', 'h4', 'strong', 'b'])
            def_elem = term_div.find('p')

            if term_elem and def_elem:
                term = clean_text(term_elem.get_text())
                definition = clean_text(def_elem.get_text())

                if len(term) > 3 and len(definition) > 30:
                    data.append({
                        "instruction": f"What is {term} in Indian financial markets?",
                        "output": definition
                    })

        # Also try direct text extraction
        if len(data) < 10:
            content = soup.get_text()
            # Look for term: definition pattern
            matches = re.findall(r'([A-Z][A-Za-z\s]{3,50})\n([^A-Z\n].{50,500})', content)
            for term, definition in matches[:10]:
                term = clean_text(term)
                definition = clean_text(definition)
                if len(term) > 3 and len(definition) > 30:
                    data.append({
                        "instruction": f"What is {term} in Indian financial markets?",
                        "output": definition
                    })

    print(f"   📊 MoneyControl Total: {len(data)} terms")
    return data


# ============================================================
# SOURCE 6: BSE India Investor Education
# ============================================================
def scrape_bse():
    print("\n[6/6] Scraping BSE India investor education...")
    data = []

    urls = [
        "https://www.bseindia.com/investors/",
        "https://www.bseindia.com/investors/invfaq.aspx",
    ]

    for url in urls:
        soup = get_page(url, delay=2)
        if not soup:
            continue

        # Extract Q&A
        text = soup.get_text()
        lines = [clean_text(l) for l in text.split('\n') if len(clean_text(l)) > 15]

        for i, line in enumerate(lines):
            if (line.endswith('?') or 'Q.' in line[:3]) and len(line) > 20:
                q_text = re.sub(r'^Q\.?\s*', '', line).strip()
                answer_parts = []
                for j in range(i+1, min(i+5, len(lines))):
                    if lines[j].endswith('?') or 'Q.' in lines[j][:3]:
                        break
                    next_line = re.sub(r'^A\.?\s*', '', lines[j]).strip()
                    if len(next_line) > 20:
                        answer_parts.append(next_line)

                if answer_parts:
                    data.append({
                        "instruction": q_text,
                        "output": ' '.join(answer_parts)
                    })

    print(f"   📊 BSE Total: {len(data)} Q&As")
    return data


# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":

    print("\nStarting scraping...")
    print("Being respectful - 1.5-2 second delays between requests\n")

    # Run all scrapers
    all_data.extend(scrape_rbi())
    save_progress(all_data)
    print(f"   💾 Saved checkpoint: {len(all_data)} samples")

    all_data.extend(scrape_zerodha())
    save_progress(all_data)
    print(f"   💾 Saved checkpoint: {len(all_data)} samples")

    all_data.extend(scrape_finshots())
    save_progress(all_data)
    print(f"   💾 Saved checkpoint: {len(all_data)} samples")

    all_data.extend(scrape_freefincal())
    save_progress(all_data)
    print(f"   💾 Saved checkpoint: {len(all_data)} samples")

    all_data.extend(scrape_moneycontrol())
    save_progress(all_data)
    print(f"   💾 Saved checkpoint: {len(all_data)} samples")

    all_data.extend(scrape_bse())
    save_progress(all_data)

    # Add existing Indian dataset
    for fname in ["finance_dataset.json", "finance_dataset_india_100.json"]:
        if os.path.exists(fname):
            with open(fname, 'r', encoding='utf-8') as f:
                existing = json.load(f)
            all_data.extend(existing)
            print(f"\n✅ Added {len(existing)} samples from {fname}")

    # Remove duplicates and clean
    print("\n🧹 Cleaning and deduplicating...")
    seen = set()
    clean_data = []
    for item in all_data:
        q = item.get('instruction', '').strip()
        a = item.get('output', '').strip()

        # Quality filters
        if len(q) < 15 or len(a) < 40:
            continue
        if q == a:
            continue
        key = q[:60].lower()
        if key in seen:
            continue

        seen.add(key)
        clean_data.append({
            "instruction": q,
            "output": a
        })

    # Save final dataset
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=2)

    size_mb = os.path.getsize(OUTPUT_FILE) / 1024 / 1024

    print("\n" + "="*60)
    print("✅ SCRAPING COMPLETE!")
    print("="*60)
    print(f"   File: {OUTPUT_FILE}")
    print(f"   Total samples: {len(clean_data)}")
    print(f"   File size: {size_mb:.1f} MB")
    print(f"\n💡 Use '{OUTPUT_FILE}' for FinGPT training!")
    print("="*60)