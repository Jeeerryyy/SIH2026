import os
import subprocess
import markdown
import re

ROOT_DIR = r"c:\Users\parak\OneDrive\Desktop\SIH 2026"
DOCS_DIR = os.path.join(ROOT_DIR, "docs")
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

PDF_CSS = """
@page {
    size: A4;
    margin: 14mm 14mm 14mm 14mm;
}

:root {
    --brand-black: #15191E;
    --brand-orange: #FF5900;
    --brand-blue: #006EF5;
    --brand-green: #0D9926;
    --brand-red: #FF3D00;
    --gray-secondary: #60646C;
    --gray-tertiary: #8B8D98;
    --gray-divider: #EAEAEF;
    --bg-card: #FFFFFF;
    --bg-subtle: #F7F7FA;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--brand-black);
    background-color: #FFFFFF;
    line-height: 1.55;
    font-size: 10.5pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

.pdf-container {
    max-width: 100%;
    margin: 0 auto;
}

.header-banner {
    border-bottom: 2px solid var(--brand-orange);
    padding-bottom: 12px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    font-size: 19pt;
    font-weight: 700;
    color: var(--brand-black);
    letter-spacing: -0.5px;
}

.header-tag {
    font-size: 9pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #FFFFFF;
    background: var(--brand-orange);
    padding: 4px 10px;
    border-radius: 6px;
    display: inline-block;
}

h1 {
    font-size: 16pt;
    font-weight: 700;
    color: var(--brand-black);
    margin-top: 22px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--gray-divider);
    padding-bottom: 6px;
    page-break-after: avoid;
}

h2 {
    font-size: 13pt;
    font-weight: 600;
    color: var(--brand-black);
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
}

h3 {
    font-size: 11.5pt;
    font-weight: 600;
    color: var(--brand-orange);
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
}

h4 {
    font-size: 10.5pt;
    font-weight: 600;
    color: var(--gray-secondary);
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
}

p {
    margin-bottom: 10px;
    text-align: justify;
}

ul, ol {
    margin-left: 20px;
    margin-bottom: 12px;
}

li {
    margin-bottom: 4px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9pt;
    page-break-inside: avoid;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

th {
    background-color: var(--brand-black);
    color: #FFFFFF;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #333333;
}

td {
    padding: 7px 10px;
    border: 1px solid var(--gray-divider);
    background-color: #FFFFFF;
    vertical-align: top;
}

tr:nth-child(even) td {
    background-color: var(--bg-subtle);
}

pre, code {
    font-family: "SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
    font-size: 8.5pt;
}

pre {
    background-color: #15191E;
    color: #E6EAEF;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;
    page-break-inside: avoid;
    line-height: 1.4;
    border-left: 4px solid var(--brand-orange);
}

code {
    background-color: #EAEAEF;
    color: #15191E;
    padding: 2px 5px;
    border-radius: 4px;
}

pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
}

blockquote {
    border-left: 4px solid var(--brand-blue);
    padding: 8px 14px;
    background-color: #F0F7FF;
    color: var(--gray-secondary);
    margin: 12px 0;
    border-radius: 0 8px 8px 0;
    page-break-inside: avoid;
}

hr {
    border: 0;
    border-top: 1px solid var(--gray-divider);
    margin: 20px 0;
}

a {
    color: var(--brand-blue);
    text-decoration: none;
    font-weight: 500;
}

.footer-stamp {
    margin-top: 30px;
    padding-top: 12px;
    border-top: 1px solid var(--gray-divider);
    font-size: 8.5pt;
    color: var(--gray-tertiary);
    text-align: center;
}
"""

def generate_pdf_from_md(md_file_path, pdf_file_path, doc_title, tag_name):
    if not os.path.exists(md_file_path):
        print(f"[SKIP] {md_file_path} not found.")
        return False
    
    with open(md_file_path, "r", encoding="utf-8") as f:
        md_text = f.read()
    
    # Convert Markdown to HTML
    html_body = markdown.markdown(
        md_text,
        extensions=["extra", "codehilite", "tables", "toc", "fenced_code"]
    )
    
    # Wrap in Apple UI Print Layout
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{doc_title}</title>
    <style>
        {PDF_CSS}
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="header-banner">
            <div>
                <div class="header-title">{doc_title}</div>
                <div style="font-size: 9.5pt; color: var(--gray-secondary); margin-top: 3px;">
                    ArogyaSetu Bridge • SIH 2026 Problem Statement ID 26133
                </div>
            </div>
            <div>
                <span class="header-tag">{tag_name}</span>
            </div>
        </div>
        
        {html_body}
        
        <div class="footer-stamp">
            ArogyaSetu Bridge | Government of Maharashtra • Maharashtra State Innovation Society (MSInS) | SIH 2026
        </div>
    </div>
</body>
</html>
"""
    
    temp_html = pdf_file_path.replace(".pdf", "_temp_print.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(full_html)
    
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_file_path}",
        temp_html
    ]
    
    result = subprocess.run(cmd, capture_output=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)
        
    if os.path.exists(pdf_file_path) and os.path.getsize(pdf_file_path) > 0:
        size_kb = os.path.getsize(pdf_file_path) / 1024
        print(f"  [OK] Generated {os.path.basename(pdf_file_path)} ({size_kb:.1f} KB)")
        return True
    else:
        print(f"  [ERROR] Failed to generate {os.path.basename(pdf_file_path)}")
        return False

def build_all_pdfs():
    print("\n[PDF EXPORT] Generating High-Resolution Apple UI Styled PDFs...")
    tasks = [
        (
            os.path.join(DOCS_DIR, "presentation.md"),
            os.path.join(DOCS_DIR, "presentation.pdf"),
            "ArogyaSetu Bridge — SIH 2026 Presentation",
            "5 Core Topics"
        ),
        (
            os.path.join(DOCS_DIR, "database.md"),
            os.path.join(DOCS_DIR, "database.pdf"),
            "ArogyaSetu Bridge — Database Architecture",
            "25 PostgreSQL Tables"
        ),
        (
            os.path.join(DOCS_DIR, "codebase.md"),
            os.path.join(DOCS_DIR, "codebase.pdf"),
            "ArogyaSetu Bridge — Codebase Blueprint",
            "Monorepo Architecture"
        ),
        (
            os.path.join(DOCS_DIR, "comprehensive_research.md"),
            os.path.join(DOCS_DIR, "comprehensive_research.pdf"),
            "ArogyaSetu Bridge — Master Research Dossier",
            "National Grand-Prix"
        ),
        (
            os.path.join(DOCS_DIR, "team_roles.md"),
            os.path.join(DOCS_DIR, "team_roles.pdf"),
            "ArogyaSetu Bridge — Enterprise Team & Roles Blueprint",
            "14 Dedicated Roles"
        )
    ]
    
    success = True
    for md_path, pdf_path, title, tag in tasks:
        ok = generate_pdf_from_md(md_path, pdf_path, title, tag)
        if not ok:
            success = False
            
    if success:
        print("[SUCCESS] All PDFs generated and up to date with full data and theme!\n")
    return success

if __name__ == "__main__":
    build_all_pdfs()
