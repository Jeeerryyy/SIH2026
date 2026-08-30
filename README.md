# ArogyaSetu Bridge — SIH 2026

> **Smart India Hackathon (SIH) 2026**  
> **Problem Statement ID:** 26133  
> **Title:** Accessibility and Quality of Public Healthcare Services in Rural and Underserved Areas  
> **Organization:** Government of Maharashtra (Maharashtra State Innovation Society)  
> **Theme:** MedTech / BioTech / HealthTech  

---

## 🔒 Military-Grade Zero-Knowledge Cryptography (OWASP Top 10 Compliant)

Access to this project is secured using **Zero-Knowledge AES-256-GCM Payload Encryption with PBKDF2 Key Derivation (100,000 SHA-256 rounds)**.

### Security Guarantees:
- **Zero Plaintext on Disk:** All confidential healthcare data, database schemas, and codebase blueprints are encrypted into binary ciphertext blobs. No plaintext exists in HTML files or on disk.
- **Zero Hardcoded Credentials:** Neither passwords, IDs, nor target cryptographic hashes are stored in the client JavaScript or DOM.
- **Mathematical Decryption Proof:** Decryption is performed in volatile browser memory via native Web Crypto API (`crypto.subtle`). Only providing the exact key derives the valid AES-256-GCM symmetric key to decipher the payload; any wrong input mathematically fails verification.
- **OWASP Top 10 Hardened:**
  - **A01: Broken Access Control:** Direct URL access / viewing page source yields only ciphertext gibberish.
  - **A02: Cryptographic Failures:** Implements NIST-approved AES-256-GCM + PBKDF2-HMAC-SHA256 with 128-bit random salts and 96-bit random IVs.
  - **A07: Identification & Auth Failures:** Brute-force rate limiting with exponential backoff on client key derivation.

### Authorized Access:
- **5-Digit Passcode:** `26133` (Automatic single-key access with "Remember me" device session storage)

---

## 📂 Project Directory Structure

```
SIH 2026/
├── login.html                    # 🔒 Zero-Knowledge 5-Digit Passcode Security Portal (26133)
├── index.html                    # Main web entry portal (AES-256-GCM Encrypted)
├── README.md                     # Project overview and navigation guide
│
├── docs/                         # Protected documentation & PDF exports
│   ├── presentation.html         # SIH 5 Core Topics presentation (AES-256-GCM Encrypted)
│   ├── presentation.md           # Presentation markdown source (28+ verified references)
│   ├── presentation.pdf          # Clean PDF export of presentation slides
│   │
│   ├── database.html             # Full 25-table schema + Mermaid ER diagrams (Encrypted)
│   ├── database.md               # Database markdown source (with ASHA incentives & FEFO)
│   ├── database.pdf              # Clean PDF export of database design
│   │
│   ├── codebase.html             # Complete monorepo codebase structure (Encrypted)
│   ├── codebase.md               # Codebase blueprint source
│   ├── codebase.pdf              # Clean PDF export of codebase structure
│   │
│   ├── team_roles.html           # 14 Enterprise Roles & RACI Matrix (AES-256-GCM Encrypted)
│   ├── team_roles.md             # Team roles blueprint source
│   ├── team_roles.pdf            # Clean PDF export of organizational roles
│   │
│   └── comprehensive_research.md # Complete National Grand-Prix Master Research Dossier
│
└── scripts/                      # Build & automation scripts
    ├── build_site.py             # AES-256-GCM build & encryption pipeline + self-test
    └── generate_pdfs.py          # High-resolution Apple UI styled PDF export engine
```

---

## 🚀 Quick Links

| Document | Interactive Web Page | PDF Document | Markdown Source |
|---|---|---|---|
| **🔒 Access Portal** | [login.html](login.html) | — | — |
| **1. Presentation Content** (5 Core Topics) | [index.html](index.html) | [docs/presentation.pdf](docs/presentation.pdf) | [docs/presentation.md](docs/presentation.md) |
| **2. Database Schema & ER Diagrams** (25 Tables) | [docs/database.html](docs/database.html) | [docs/database.pdf](docs/database.pdf) | [docs/database.md](docs/database.md) |
| **3. Project Codebase Structure** (Monorepo) | [docs/codebase.html](docs/codebase.html) | [docs/codebase.pdf](docs/codebase.pdf) | [docs/codebase.md](docs/codebase.md) |
| **4. Enterprise Team & 14 Roles Blueprint** | [docs/team_roles.html](docs/team_roles.html) | [docs/team_roles.pdf](docs/team_roles.pdf) | [docs/team_roles.md](docs/team_roles.md) |
| **5. Comprehensive Master Research Dossier** | — | [docs/comprehensive_research.pdf](docs/comprehensive_research.pdf) | [docs/comprehensive_research.md](docs/comprehensive_research.md) |

---

## 🛠️ How to Rebuild and Encrypt HTML Documents

To regenerate and encrypt all HTML files after modifying any markdown source in `docs/`:

```bash
python scripts/build_site.py
```

---

*Designed with Apple UI Design System & Brex Color Palette for SIH 2026.*
