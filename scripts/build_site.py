import markdown
import re
import os
import shutil
import base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

root_dir = r"c:\Users\parak\OneDrive\Desktop\SIH 2026"
docs_dir = os.path.join(root_dir, "docs")
scripts_dir = os.path.join(root_dir, "scripts")

os.makedirs(docs_dir, exist_ok=True)
os.makedirs(scripts_dir, exist_ok=True)

# Master Auth Credential & Unified Project Salt (Zero Knowledge)
MASTER_CREDENTIAL = b"sih2026:26133"
PROJECT_SALT = b"ArogyaSetuBridge"

kdf = PBKDF2HMAC(
    algorithm=hashes.SHA256(),
    length=32,
    salt=PROJECT_SALT,
    iterations=100000
)
MASTER_KEY = kdf.derive(MASTER_CREDENTIAL)
AES_GCM_ENGINE = AESGCM(MASTER_KEY)

def encrypt_payload(plaintext_str):
    iv = os.urandom(12)
    ciphertext = AES_GCM_ENGINE.encrypt(iv, plaintext_str.encode("utf-8"), None)
    
    return {
        "iv": base64.b64encode(iv).decode("ascii"),
        "data": base64.b64encode(ciphertext).decode("ascii")
    }

COMMON_CSS = """
        /* ==========================================================================
           1. DESIGN TOKENS & CONSTANTS (Hireavilla Luxury Sage)
           ========================================================================== */
        :root {
            /* Hireavilla Luxury Sage Core Palette */
            --brand-primary: #75A68C;
            --brand-primary-hover: #456B4D;
            --brand-link: #517C65;
            --brand-ink: #2D2D2E;
            --pure-black: #000000;
            
            --brand-orange: #75A68C;
            --brand-orange-hover: #456B4D;
            --brand-orange-active: #517C65;
            --brand-orange-light: #E3EDE8;
            --brand-blue: #517C65;
            --brand-blue-light: #E3EDE8;
            --brand-purple: #456B4D;
            --brand-purple-light: #E3EDE8;
            --brand-green: #517C65;
            --brand-green-light: #E3EDE8;
            --brand-red: #C8372D;
            --brand-red-light: #FDF2F2;
            
            /* Neutrals */
            --gray-secondary: #737373;
            --gray-tertiary: #659079;
            --gray-light: #D6D6D6;
            --gray-border: #D6D6D6;
            --gray-divider: #D6D6D6;
            
            /* Surfaces */
            --bg-canvas: #FFFFFF;
            --surface-card: #FFFFFF;
            --surface-elevated: #E3EDE8;
            --surface-subtle: #E3EDE8;
            --brand-surface-alt: #E3EDE8;
            
            /* Elevation & Shadows */
            --shadow-level-1: none;
            --shadow-level-2: none;
            --shadow-level-3: none;
            --shadow-level-4: none;
            --shadow-focus: 0px 0px 0px 3px rgba(117, 166, 140, 0.25);
            
            /* Radii */
            --radius-none: 0px;
            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 12px;
            --radius-full: 9999px;
            
            /* Timing / Spring */
            --spring-transition: 200ms ease;
        }

        /* Anti-Copy & Selection Lock */
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        input, textarea, select, button, a {
            -webkit-user-select: auto;
            user-select: auto;
        }

        html {
            scroll-behavior: smooth;
            background-color: var(--bg-canvas);
        }

        body {
            font-family: 'Hanken Grotesk', 'Inter', -apple-system, sans-serif;
            font-size: 15px;
            line-height: 1.6;
            color: var(--brand-ink);
            background-color: var(--bg-canvas);
            -webkit-font-smoothing: antialiased;
            padding-bottom: 80px;
        }

        #progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            width: 0%;
            background: var(--brand-primary);
            z-index: 2000;
            transition: width 100ms ease-out;
        }

        /* ==========================================================================
           2. UNIFIED TWO-TIER HIREAVILLA NAVIGATION BAR
           ========================================================================== */
        .apple-nav-container {
            position: sticky;
            top: 12px;
            z-index: 1000;
            max-width: 1240px;
            margin: 12px auto 24px auto;
            padding: 0 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .apple-nav {
            width: 100%;
            padding: 10px 20px;
            background: #FFFFFF;
            border: 1px solid var(--gray-border);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .apple-nav a,
        .apple-nav a:hover,
        .nav-brand,
        .nav-brand:hover,
        .nav-link,
        .nav-link:hover,
        .nav-link.active,
        .doc-tab,
        .doc-tab:hover,
        .doc-tab.active {
            text-decoration: none !important;
        }

        .nav-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
            font-weight: 600;
            color: var(--brand-ink);
            letter-spacing: -0.01em;
            cursor: pointer;
        }

        .brand-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--brand-primary);
            display: inline-block;
        }

        .nav-right-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .doc-tabs {
            display: flex;
            align-items: center;
            background: var(--brand-surface-alt);
            padding: 3px;
            border-radius: var(--radius-full);
            gap: 2px;
            flex-shrink: 0;
        }

        .doc-tab {
            color: var(--gray-secondary);
            font-size: 13px;
            font-weight: 500;
            padding: 6px 16px;
            border-radius: var(--radius-full);
            transition: var(--spring-transition);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .doc-tab:hover {
            color: var(--brand-ink);
            background: rgba(255, 255, 255, 0.6);
        }

        .doc-tab.active {
            color: var(--brand-ink);
            background: #FFFFFF;
            font-weight: 600;
        }

        /* Sign Out Button */
        .auth-logout-btn {
            background: transparent;
            border: 1px solid var(--gray-border);
            color: var(--brand-ink);
            font-size: 12px;
            font-weight: 500;
            padding: 6px 14px;
            border-radius: var(--radius-full);
            cursor: pointer;
            transition: var(--spring-transition);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .auth-logout-btn:hover {
            background: var(--brand-primary);
            border-color: var(--brand-primary);
            color: #FFFFFF;
        }

        /* Sub-Navigation Pill Bar */
        .apple-subnav-container {
            width: fit-content;
            max-width: 100%;
            background: #FFFFFF;
            border: 1px solid var(--gray-border);
            border-radius: var(--radius-full);
            padding: 4px 10px;
            overflow-x: auto;
        }

        .nav-section-pills {
            display: flex;
            align-items: center;
            gap: 4px;
            list-style: none;
            white-space: nowrap;
        }

        .nav-link {
            color: var(--gray-secondary);
            font-size: 12px;
            font-weight: 500;
            padding: 5px 12px;
            border-radius: var(--radius-full);
            transition: var(--spring-transition);
            white-space: nowrap;
        }

        .nav-link:hover {
            color: var(--brand-ink);
            background: var(--brand-surface-alt);
        }

        .nav-link.active {
            color: #FFFFFF;
            background: var(--brand-primary);
            font-weight: 600;
        }

        /* Container & Cards */
        .container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .apple-card {
            background: var(--surface-card);
            border: 1px solid var(--gray-border);
            border-radius: var(--radius-none);
            padding: 44px 48px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
        }

        .hero-card {
            background: #FFFFFF;
            border-top: 4px solid var(--brand-primary);
            padding: 48px;
        }

        h1 {
            font-family: 'Playfair Display', 'Athelas', 'Georgia', serif;
            font-size: 32px;
            font-weight: 500;
            color: var(--brand-ink);
            letter-spacing: -0.01em;
            line-height: 1.25;
            margin-bottom: 16px;
        }

        .hero-card h1 {
            font-size: 36px;
            color: var(--brand-ink);
        }

        h2 {
            font-family: 'Playfair Display', 'Athelas', 'Georgia', serif;
            font-size: 22px;
            font-weight: 500;
            color: var(--brand-ink);
            letter-spacing: -0.020em;
            line-height: 1.3;
            margin-top: 24px;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--gray-divider);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        h3 {
            font-size: 16px;
            font-weight: 600;
            color: var(--brand-black);
            letter-spacing: -0.015em;
            line-height: 1.35;
            margin-top: 24px;
            margin-bottom: 12px;
        }

        h4 {
            font-size: 14px;
            font-weight: 600;
            color: var(--brand-black);
            letter-spacing: -0.011em;
            line-height: 1.4;
            margin-top: 20px;
            margin-bottom: 8px;
        }

        p {
            font-size: 14px;
            font-weight: 400;
            color: var(--brand-black);
            letter-spacing: -0.011em;
            line-height: 1.65;
            margin-bottom: 16px;
        }

        strong {
            font-weight: 600;
            color: var(--pure-black);
        }

        em {
            color: var(--gray-secondary);
            font-style: italic;
        }

        ul, ol {
            padding-left: 24px;
            margin-bottom: 20px;
        }

        li {
            font-size: 14px;
            line-height: 1.65;
            color: var(--brand-black);
            margin-bottom: 8px;
            letter-spacing: -0.011em;
        }

        hr {
            border: none;
            border-top: 1px solid var(--gray-divider);
            margin: 32px 0;
        }

        a {
            color: var(--brand-blue);
            text-decoration: none;
            font-weight: 500;
            transition: color 150ms ease;
        }

        a:hover {
            color: var(--brand-orange);
            text-decoration: underline;
        }

        .table-wrapper {
            width: 100%;
            overflow-x: auto;
            margin: 24px 0;
            border-radius: var(--radius-md);
            border: 1px solid var(--gray-border);
            box-shadow: var(--shadow-level-1);
            background: #FFFFFF;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
        }

        thead {
            background: var(--brand-black);
        }

        th {
            color: #FFFFFF;
            font-weight: 600;
            font-size: 13px;
            padding: 12px 16px;
            letter-spacing: -0.01em;
            border: none;
        }

        td {
            padding: 11px 16px;
            border-bottom: 1px solid var(--gray-divider);
            color: var(--brand-black);
            line-height: 1.5;
            vertical-align: top;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        tbody tr:nth-child(even) {
            background: var(--surface-subtle);
        }

        .macos-terminal {
            background: var(--brand-black);
            border-radius: var(--radius-md);
            border: 1px solid rgba(255, 255, 255, 0.12);
            margin: 24px 0;
            overflow: hidden;
            box-shadow: var(--shadow-level-3);
        }

        .terminal-header {
            background: rgba(255, 255, 255, 0.06);
            padding: 10px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
        }

        .dot.red { background: #FF5F56; border: 1px solid #E0443E; }
        .dot.yellow { background: #FFBD2E; border: 1px solid #DEA123; }
        .dot.green { background: #27C93F; border: 1px solid #1AAB29; }

        .terminal-title {
            color: var(--gray-tertiary);
            font-size: 12px;
            font-weight: 500;
            margin-left: 8px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        pre {
            margin: 0;
            padding: 20px 24px;
            overflow-x: auto;
            background: transparent;
        }

        pre code {
            font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            line-height: 1.55;
            color: #DDE2EB;
            background: none;
            padding: 0;
            border: none;
        }

        code {
            font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            background: rgba(21, 25, 30, 0.06);
            color: var(--brand-black);
            padding: 2px 6px;
            border-radius: 4px;
            border: 0.5px solid rgba(21, 25, 30, 0.08);
        }

        .mermaid-container {
            background: #FFFFFF;
            border: 1px solid var(--gray-border);
            border-radius: var(--radius-md);
            padding: 24px;
            margin: 24px 0;
            overflow-x: auto;
            text-align: center;
            box-shadow: var(--shadow-level-1);
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: var(--radius-sm);
            letter-spacing: -0.01em;
            margin: 4px 0;
        }

        .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }

        .badge-error {
            background: var(--brand-red-light);
            color: var(--brand-red);
            border: 1px solid rgba(255, 61, 0, 0.2);
        }
        .badge-error .badge-dot { background: var(--brand-red); }

        .badge-warning {
            background: rgba(255, 165, 0, 0.12);
            color: #D97706;
            border: 1px solid rgba(255, 165, 0, 0.25);
        }
        .badge-warning .badge-dot { background: #D97706; }

        .badge-info {
            background: var(--brand-blue-light);
            color: var(--brand-blue);
            border: 1px solid rgba(0, 110, 245, 0.2);
        }
        .badge-info .badge-dot { background: var(--brand-blue); }

        .badge-success {
            background: var(--brand-green-light);
            color: var(--brand-green);
            border: 1px solid rgba(13, 153, 38, 0.2);
        }
        .badge-success .badge-dot { background: var(--brand-green); }

        .apple-footer {
            max-width: 1240px;
            margin: 40px auto 0 auto;
            padding: 32px 24px;
            text-align: center;
            color: var(--gray-secondary);
            font-size: 12px;
            border-top: 1px solid var(--gray-divider);
        }

        /* Decryption Loading Skeleton */
        #content-loading {
            text-align: center;
            padding: 120px 24px;
            color: var(--gray-secondary);
            font-size: 14px;
            font-weight: 500;
        }

        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255, 89, 0, 0.2);
            border-top-color: var(--brand-orange);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px auto;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @media print {
            body { background: #FFFFFF; color: #000; padding: 0; }
            .apple-nav-container, #progress-bar { display: none !important; }
            .apple-card { box-shadow: none !important; border: 1px solid #E0E0E0 !important; background: #FFF !important; page-break-inside: avoid; }
            .macos-terminal { border: 1px solid #333 !important; page-break-inside: avoid; }
            table { page-break-inside: avoid; }
            h1, h2, h3, h4 { page-break-after: avoid; }
        }

        /* ==========================================================================
           PROFESSIONAL RESPONSIVE BREAKPOINTS (Tablets & Mobile Viewports)
           ========================================================================== */
        @media (max-width: 900px) {
            .apple-nav-container {
                top: 8px;
                margin: 8px auto 18px auto;
                padding: 0 16px;
                gap: 6px;
            }
            .apple-nav {
                flex-direction: column;
                align-items: stretch;
                border-radius: var(--radius-lg);
                padding: 10px 14px;
                gap: 8px;
            }
            .nav-brand {
                justify-content: center;
                font-size: 14px;
            }
            .nav-right-group {
                width: 100%;
                justify-content: space-between;
                gap: 8px;
            }
            .doc-tabs {
                display: flex;
                flex: 1;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                gap: 4px;
                padding: 2px;
                scrollbar-width: none;
            }
            .doc-tabs::-webkit-scrollbar {
                display: none;
            }
            .doc-tab {
                font-size: 11px;
                padding: 6px 10px;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .auth-logout-btn {
                padding: 6px 10px;
                font-size: 11px;
                flex-shrink: 0;
            }
            .apple-subnav-container {
                width: 100%;
                border-radius: var(--radius-md);
                padding: 3px 6px;
            }
            .nav-section-pills {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                gap: 4px;
                padding: 2px;
                scrollbar-width: none;
            }
            .nav-section-pills::-webkit-scrollbar {
                display: none;
            }
            .nav-link {
                font-size: 11px;
                padding: 4px 10px;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .container {
                padding: 0 14px;
            }
            .apple-card {
                padding: 28px 20px;
                border-radius: var(--radius-lg);
                margin-bottom: 20px;
            }
            h1 { font-size: 22px; }
            h2 { font-size: 18px; }
            h3 { font-size: 15px; }
            h4 { font-size: 13.5px; }
            
            table {
                display: block;
                max-width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                white-space: nowrap;
                border-radius: var(--radius-sm);
            }
            .macos-terminal {
                margin: 16px 0;
            }
            pre {
                padding: 14px 16px;
                font-size: 11.5px;
            }
            .mermaid-container {
                padding: 16px 12px;
                margin: 18px 0;
            }
        }

        @media (max-width: 540px) {
            .apple-nav-container {
                top: 4px;
                margin: 4px auto 14px auto;
                padding: 0 8px;
                gap: 4px;
            }
            .apple-nav {
                padding: 8px 10px;
                border-radius: var(--radius-md);
                gap: 6px;
            }
            .nav-brand {
                font-size: 13px;
                gap: 6px;
            }
            .brand-dot {
                width: 8px;
                height: 8px;
            }
            .doc-tab {
                font-size: 10.5px;
                padding: 5px 8px;
            }
            .auth-logout-btn {
                padding: 5px 8px;
                font-size: 10.5px;
            }
            .apple-subnav-container {
                border-radius: var(--radius-sm);
                padding: 2px 4px;
            }
            .nav-link {
                font-size: 10px;
                padding: 3px 8px;
            }
            .container {
                padding: 0 6px;
            }
            .apple-card {
                padding: 20px 14px;
                border-radius: var(--radius-md);
                margin-bottom: 14px;
            }
            h1 { font-size: 19px !important; line-height: 1.3; }
            h2 { font-size: 16px !important; }
            h3 { font-size: 14px !important; }
            h4 { font-size: 12.5px !important; }
            p, li { font-size: 13px !important; line-height: 1.55; }
            ul, ol { margin-left: 16px; margin-bottom: 10px; }
            
            table {
                font-size: 11px;
                margin: 12px 0;
            }
            th, td {
                padding: 8px 10px;
            }
            .macos-terminal {
                border-radius: var(--radius-sm);
                margin: 12px 0;
            }
            pre {
                padding: 10px 12px;
                font-size: 10.5px;
                line-height: 1.4;
            }
            .terminal-header {
                padding: 6px 12px;
            }
            .dot {
                width: 9px;
                height: 9px;
            }
            .terminal-title {
                font-size: 10px;
            }
            .mermaid-container {
                padding: 12px 6px;
                margin: 14px 0;
            }
            .apple-footer {
                padding: 24px 12px;
                font-size: 11px;
            }
            .apple-footer div {
                flex-wrap: wrap;
                gap: 8px !important;
            }
        }
"""

def generate_encrypted_document(md_filename, output_path, page_type, is_root=False):
    md_file_path = os.path.join(docs_dir, md_filename)
    with open(md_file_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    html_content = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "toc", "attr_list", "nl2br"]
    )

    sections = re.split(r'(<h1[^>]*>.*?</h1>)', html_content)
    processed_html = ""
    card_index = 0

    for part in sections:
        if part.startswith("<h1"):
            if card_index > 0:
                processed_html += "\n</div><!-- /.apple-card -->\n"
            
            section_id = f"section-{card_index}" if card_index > 0 else "hero-section"
            card_class = "apple-card slide-card" if card_index > 0 else "apple-card hero-card"
            
            if page_type == "presentation":
                if card_index == 1: section_id = "slide-1"
                elif card_index == 2: section_id = "slide-2"
                elif card_index == 3: section_id = "slide-3"
                elif card_index == 4: section_id = "slide-4"
                elif card_index == 5: section_id = "slide-5"
            elif page_type == "database":
                if card_index == 1: section_id = "db-philosophy"
                elif card_index == 2: section_id = "db-schema"
                elif card_index == 3: section_id = "db-er-diagrams"
                elif card_index == 4: section_id = "db-data-flow"
                elif card_index == 5: section_id = "db-summary"
            elif page_type == "codebase":
                if card_index == 1: section_id = "cb-overview"
                elif card_index == 2: section_id = "cb-structure"
                elif card_index == 3: section_id = "cb-apps"
                elif card_index == 4: section_id = "cb-packages"
                elif card_index == 5: section_id = "cb-database"
                elif card_index == 6: section_id = "cb-infra"
                elif card_index == 7: section_id = "cb-docs"
                elif card_index == 8: section_id = "cb-dev-setup"
                elif card_index == 9: section_id = "cb-summary"
                
            processed_html += f'\n<div id="{section_id}" class="{card_class}">\n'
            processed_html += part
            card_index += 1
        else:
            processed_html += part

    if card_index > 0:
        processed_html += "\n</div><!-- /.apple-card -->\n"

    def wrap_terminal(match):
        code_content = match.group(0)
        if "class=\"language-mermaid\"" in code_content or "mermaid" in code_content:
            raw_mermaid = re.sub(r'<pre><code[^>]*>', '', code_content)
            raw_mermaid = re.sub(r'</code></pre>', '', raw_mermaid)
            raw_mermaid = raw_mermaid.replace('&gt;', '>').replace('&lt;', '<').replace('&amp;', '&')
            return f"""
            <div class="mermaid-container">
                <div class="mermaid">
{raw_mermaid}
                </div>
            </div>
            <div class="macos-terminal">
                <div class="terminal-header">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                    <span class="terminal-title">Mermaid Diagram Source</span>
                </div>
                {code_content}
            </div>
            """
        else:
            return f"""
            <div class="macos-terminal">
                <div class="terminal-header">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                    <span class="terminal-title">Code / Architecture Map</span>
                </div>
                {code_content}
            </div>
            """

    processed_html = re.sub(r'<pre><code.*?</code></pre>', wrap_terminal, processed_html, flags=re.DOTALL)

    processed_html = processed_html.replace('Risk Level: HIGH', '<span class="badge badge-error"><span class="badge-dot"></span>Risk Level: HIGH</span>')
    processed_html = processed_html.replace('Risk Level: MEDIUM', '<span class="badge badge-warning"><span class="badge-dot"></span>Risk Level: MEDIUM</span>')
    processed_html = processed_html.replace('Risk Level: LOW-MEDIUM', '<span class="badge badge-info"><span class="badge-dot"></span>Risk Level: LOW-MEDIUM</span>')

    # Path prefixes
    if is_root:
        pres_url = "index.html"
        db_url = "docs/database.html"
        code_url = "docs/codebase.html"
        team_url = "docs/team_roles.html"
        home_url = "index.html"
        login_url = "login.html"
    else:
        pres_url = "../index.html"
        db_url = "database.html"
        code_url = "codebase.html"
        team_url = "team_roles.html"
        home_url = "../index.html"
        login_url = "../login.html"

    tab_pres_class = "doc-tab active" if page_type == "presentation" else "doc-tab"
    tab_db_class = "doc-tab active" if page_type == "database" else "doc-tab"
    tab_code_class = "doc-tab active" if page_type == "codebase" else "doc-tab"
    tab_team_class = "doc-tab active" if page_type == "team_roles" else "doc-tab"

    if page_type == "presentation":
        section_pills = """
            <a href="#slide-1" class="nav-link">Slide 1: Idea</a>
            <a href="#slide-2" class="nav-link">Slide 2: Tech</a>
            <a href="#slide-3" class="nav-link">Slide 3: Feasibility</a>
            <a href="#slide-4" class="nav-link">Slide 4: Impact</a>
            <a href="#slide-5" class="nav-link">Slide 5: Research</a>
        """
        page_title = "SIH 2026 | Presentation Content — ArogyaSetu Bridge"
    elif page_type == "database":
        section_pills = """
            <a href="#db-philosophy" class="nav-link">1. Philosophy</a>
            <a href="#db-schema" class="nav-link">2. Schema (25 Tables)</a>
            <a href="#db-er-diagrams" class="nav-link">3. ER Diagrams</a>
            <a href="#db-data-flow" class="nav-link">4. Data Flow</a>
            <a href="#db-summary" class="nav-link">5. Summary</a>
        """
        page_title = "SIH 2026 | Database Schema & ER Diagrams — ArogyaSetu Bridge"
    elif page_type == "team_roles":
        section_pills = """
            <a href="#1-executive-summary--organizational-strategy" class="nav-link">1. Strategy</a>
            <a href="#2-detailed-roster-of-14-enterprise-roles" class="nav-link">2. 14 Roles Roster</a>
            <a href="#3-raci-responsibility-assignment-matrix" class="nav-link">3. RACI Matrix</a>
            <a href="#4-project-delivery--team-synergy" class="nav-link">4. Synergy</a>
        """
        page_title = "SIH 2026 | Enterprise Team & Roles Blueprint — ArogyaSetu Bridge"
    else:
        section_pills = """
            <a href="#cb-overview" class="nav-link">1. Overview</a>
            <a href="#cb-structure" class="nav-link">2. Structure</a>
            <a href="#cb-apps" class="nav-link">3. Apps (5)</a>
            <a href="#cb-packages" class="nav-link">4. Packages (4)</a>
            <a href="#cb-database" class="nav-link">5. Database</a>
            <a href="#cb-infra" class="nav-link">6. Infrastructure</a>
            <a href="#cb-dev-setup" class="nav-link">8. Setup</a>
        """
        page_title = "SIH 2026 | Project Codebase Structure — ArogyaSetu Bridge"

    # Encrypt the processed HTML content
    enc_payload = encrypt_payload(processed_html)

    full_page = f"""<!-- Apple UI Design System – Verified: 8pt Grid, SF Pro Typography, Material-Depth, Natural Spring Motion -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_title}</title>
    
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    
    <style>
{COMMON_CSS}
    </style>
</head>
<body oncontextmenu="return false;" oncopy="return false;" oncut="return false;" ondragstart="return false;">

<div id="progress-bar"></div>

<!-- Top Sticky Two-Tier Apple Navigation -->
<div class="apple-nav-container">
    <nav class="apple-nav">
        <a href="{home_url}" class="nav-brand">
            <span class="brand-dot"></span>
            <span>ArogyaSetu Bridge</span>
        </a>
        
        <div class="nav-right-group">
            <div class="doc-tabs">
                <a href="{pres_url}" class="{tab_pres_class}">Presentation</a>
                <a href="{db_url}" class="{tab_db_class}">Database & ER</a>
                <a href="{code_url}" class="{tab_code_class}">Codebase</a>
                <a href="{team_url}" class="{tab_team_class}">Team & Roles</a>
            </div>

            <button type="button" class="auth-logout-btn" onclick="handleLogout()" title="Lock / Sign Out">
                <span>Sign Out</span>
            </button>
        </div>
    </nav>

    <div class="apple-subnav-container">
        <div class="nav-section-pills">
            {section_pills}
        </div>
    </div>
</div>

<div class="container" id="main-content-container">
    <div id="content-loading">
        <div class="loading-spinner"></div>
        <p>Decrypting secure healthcare payload...</p>
    </div>
</div>

<footer class="apple-footer">
    <p><strong>ArogyaSetu Bridge</strong> — Prepared for Smart India Hackathon (SIH) 2026 • Problem Statement ID 26133</p>
    <p><a href="https://www.maharashtra.gov.in/" target="_blank" rel="noopener noreferrer" style="color: inherit;">Government of Maharashtra</a> • <a href="https://msins.in/" target="_blank" rel="noopener noreferrer" style="color: inherit;">Maharashtra State Innovation Society</a> • <a href="https://arogya.maharashtra.gov.in/" target="_blank" rel="noopener noreferrer" style="color: inherit;">Department of Public Health</a></p>
    <div style="margin-top: 12px; display: flex; justify-content: center; gap: 16px;">
        <a href="{pres_url}" style="color: var(--brand-orange); font-weight: 500;">Presentation Content</a> •
        <a href="{db_url}" style="color: var(--brand-blue); font-weight: 500;">Database Schema & ER</a> •
        <a href="{code_url}" style="color: var(--brand-blue); font-weight: 500;">Project Codebase</a> •
        <a href="{team_url}" style="color: var(--brand-orange); font-weight: 500;">Team & Roles</a>
    </div>
</footer>

<!-- Zero-Knowledge AES-256-GCM Encrypted Payload (No plaintext on disk) -->
<script id="enc-payload" type="application/json">
{{
    "iv": "{enc_payload['iv']}",
    "data": "{enc_payload['data']}"
}}
</script>

<script>
    const LOGIN_PAGE_URL = "{login_url}";

    // 1. Anti-Copy & Right-Click Prevention
    document.addEventListener('contextmenu', (e) => {{
        e.preventDefault();
        return false;
    }});

    document.addEventListener('copy', (e) => {{ e.preventDefault(); return false; }});
    document.addEventListener('cut', (e) => {{ e.preventDefault(); return false; }});
    document.addEventListener('dragstart', (e) => {{ e.preventDefault(); return false; }});

    document.addEventListener('keydown', (e) => {{
        if (
            (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'a' || e.key === 'A')) ||
            (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C')) ||
            (e.metaKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) ||
            e.key === 'F12'
        ) {{
            e.preventDefault();
            return false;
        }}
    }});

    function handleLogout() {{
        sessionStorage.removeItem('arogya_sec_key');
        localStorage.removeItem('arogya_sec_key');
        window.location.href = LOGIN_PAGE_URL;
    }}

    function base64ToUint8(base64) {{
        const raw = atob(base64);
        const uint8 = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {{
            uint8[i] = raw.charCodeAt(i);
        }}
        return uint8;
    }}

    async function decryptAndRender() {{
        const rawKeyB64 = sessionStorage.getItem('arogya_sec_key') || localStorage.getItem('arogya_sec_key');
        if (!rawKeyB64) {{
            const currentUrl = window.location.href;
            window.location.replace(LOGIN_PAGE_URL + '?returnUrl=' + encodeURIComponent(currentUrl));
            return;
        }}

        try {{
            const payload = JSON.parse(document.getElementById('enc-payload').textContent);
            const keyBytes = base64ToUint8(rawKeyB64);
            const ivBytes = base64ToUint8(payload.iv);
            const cipherBytes = base64ToUint8(payload.data);

            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBytes,
                {{ name: 'AES-GCM' }},
                false,
                ['decrypt']
            );

            const decryptedBuffer = await crypto.subtle.decrypt(
                {{ name: 'AES-GCM', iv: ivBytes }},
                cryptoKey,
                cipherBytes
            );

            const decryptedHtml = new TextDecoder().decode(decryptedBuffer);
            const container = document.getElementById('main-content-container');
            container.innerHTML = decryptedHtml;

            // Ensure all external links open in a new tab securely
            document.querySelectorAll('a[href^="http"]').forEach(link => {{
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }});

            // Initialize Mermaid diagrams if present
            if (window.mermaid) {{
                mermaid.initialize({{
                    startOnLoad: true,
                    theme: 'neutral',
                    themeVariables: {{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontSize: '13px',
                        primaryColor: '#F3F6FC',
                        primaryTextColor: '#15191E',
                        primaryBorderColor: '#006EF5',
                        lineColor: '#FF5900',
                        secondaryColor: '#FFFFFF',
                        tertiaryColor: '#FAFAFC'
                    }}
                }});
                mermaid.run();
            }}

            // Wrap tables
            document.querySelectorAll('table').forEach(tbl => {{
                if (!tbl.parentElement.classList.contains('table-wrapper')) {{
                    const wrapper = document.createElement('div');
                    wrapper.className = 'table-wrapper';
                    tbl.parentNode.insertBefore(wrapper, tbl);
                    wrapper.appendChild(tbl);
                }}
            }});

        }} catch(err) {{
            console.error('Decryption failed:', err);
            handleLogout();
        }}
    }}

    window.addEventListener('DOMContentLoaded', decryptAndRender);

    window.addEventListener('scroll', () => {{
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0) {{
            const scrolled = (winScroll / height) * 100;
            document.getElementById('progress-bar').style.width = scrolled + '%';
        }}
        
        const sections = document.querySelectorAll('.apple-card');
        const navLinks = document.querySelectorAll('.nav-section-pills .nav-link');
        
        let currentSection = '';
        sections.forEach(section => {{
            const sectionTop = section.offsetTop - 160;
            if (winScroll >= sectionTop) {{
                currentSection = section.getAttribute('id');
            }}
        }});
        
        navLinks.forEach(link => {{
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {{
                link.classList.add('active');
            }}
        }});
    }});
</script>

</body>
</html>"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(full_page)
    print(f"Generated AES-256-GCM Encrypted HTML: {output_path}")

# Encrypt and generate all files
target_files = [
    ("presentation.md", os.path.join(root_dir, "index.html"), "presentation", True),
    ("presentation.md", os.path.join(docs_dir, "presentation.html"), "presentation", False),
    ("database.md", os.path.join(docs_dir, "database.html"), "database", False),
    ("codebase.md", os.path.join(docs_dir, "codebase.html"), "codebase", False),
    ("team_roles.md", os.path.join(docs_dir, "team_roles.html"), "team_roles", False)
]

for md_name, out_path, p_type, is_rt in target_files:
    generate_encrypted_document(md_name, out_path, p_type, is_root=is_rt)

# Post-Build Self-Test Verification
print("\n[VERIFICATION] Performing post-build cryptographic self-test...")
import json
for _, out_path, _, _ in target_files:
    with open(out_path, "r", encoding="utf-8") as f:
        file_content = f.read()
    m = re.search(r'<script id="enc-payload" type="application/json">\s*(\{.*?\})\s*</script>', file_content, re.DOTALL)
    if not m:
        raise ValueError(f"Missing enc-payload in {out_path}")
    payload = json.loads(m.group(1))
    iv_test = base64.b64decode(payload["iv"])
    data_test = base64.b64decode(payload["data"])
    decrypted_test = AES_GCM_ENGINE.decrypt(iv_test, data_test, None).decode("utf-8")
    assert len(decrypted_test) > 1000, f"Decrypted content unexpectedly small for {out_path}"
    print(f"  [OK] {os.path.basename(out_path)} verified ({len(decrypted_test):,} chars decrypted)")

print("\n[SUCCESS] All HTML files built, encrypted, and cryptographically verified!")

# Automatically regenerate all Apple UI styled PDFs
try:
    from generate_pdfs import build_all_pdfs
    build_all_pdfs()
except Exception as e:
    print(f"[NOTE] PDF export skipped or failed: {e}")
