# Kerala FPS Stock Audit & ePOS Reconciliation PWA

[![Live App](https://img.shields.io/badge/Live%20App-Vercel%20Production-success?style=for-the-badge&logo=vercel)](https://fps-inspection-calculator.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/siroshps/fps-inspection-calculator)
[![Platform](https://img.shields.io/badge/PWA-Android%20%7C%20iOS%20%7C%20Desktop-blue?style=for-the-badge&logo=pwa)](https://fps-inspection-calculator.vercel.app)
[![Region](https://img.shields.io/badge/Serverless%20Region-AWS%20Mumbai%20(bom1)-orange?style=for-the-badge)](https://fps-inspection-calculator.vercel.app)

A mobile-first, high-speed Progressive Web App (PWA) tailored specifically for government **Fair Price Shop (ARD / Ration Shop) Inspectors** in Kerala (Department of Food, Civil Supplies & Consumer Affairs). It automates physical bag stack calculations, consolidates commodities into statutory groups, reconciles directly with live `epos.kerala.gov.in` closing balances, and generates official, print-ready PDF audit reports.

---

## 🔗 Quick Links

* **Live Web App**: [https://fps-inspection-calculator.vercel.app](https://fps-inspection-calculator.vercel.app)
* **GitHub Repository**: [https://github.com/siroshps/fps-inspection-calculator](https://github.com/siroshps/fps-inspection-calculator)
* **Project Documentation & Continuity Guide**: [`memory.md`](./memory.md) (comprehensive architecture and setup guide for working from home or new PCs)
* **Author / Developer**: **Sirosh P.S**, Rationing Inspector (RI), Ponnani Firka, Malappuram District, Kerala

---

## 🌟 Key Features & Current Capabilities

### 1. High-Speed Physical Stack Numpad (`QuickEntryPad.jsx`)
* **3-Column Mobile Keypad**: Engineered for fast thumb-typing while physically walking between stacks in godowns.
* **Stack Multiplication**: Supports entering heights and stacks directly (e.g., `12×4` evaluates automatically to 48 bags).
* **Fractional Bag Buttons**: Quick buttons for `+¼`, `+½`, `+¾`, and `+1` bags for partial/open gunny bags.
* **Touch-and-Hold (Long Press) History**: Pressing and holding any commodity button pops up that specific commodity's stack count history without leaving the numpad.
* **Expected Bag Count**: Displays expected bag counts in brackets near each commodity (calculated at 50kg/bag), automatically decrementing as physical bags are entered.
* **Quick Stack Presets**: One-tap buttons for standard stack counts (`10`, `11`, `12`, `13`, `14`, `15`).

### 2. Multi-Attempt Live ePOS Scraper Backend (`api/scraper.py`, `App.jsx`)
* **Live Scraper**: Scrapes official closing balance figures directly from `https://epos.kerala.gov.in/fps_stock.action`.
* **Domestic Mumbai Routing (`bom1`)**: Backend deployed in AWS Mumbai region for sub-20ms latency to the Kerala State Data Centre.
* **eMudhra Government SSL Handling**: Configured with SSL resilience to avoid handshake drops caused by government CA certificates on cloud containers.
* **Automated Progressive Retries**:
  * Automatically attempts connection up to 3 times (14s timeout per attempt).
  * Real-time header progress indicator (`1/3`, `2/3`, `3/3`).
* **Safe Inspection Guarantee (Zero Mock Poisoning)**:
  * Connection drops **never** overwrite user bag counts or physical measurements with fake mock data.
  * Successful live fetches are saved to verified local cache (`localStorage`).
  * If the government portal is down, a dedicated helper modal provides actionable choices:
    1. 🔄 **Try Again (3 Fresh Attempts)**
    2. 📋 **Use Last Verified Stock** (restores previously fetched real ePOS numbers with timestamp)
    3. ✏️ **Enter Stock Manually** (input closing balance directly from physical ePOS machine or paper slips)
    4. 🧪 **Load Demo Data** (explicit opt-in for testing/training only)

### 3. Canonical Commodity Grouping & Official Sort Order
* Automatically consolidates sub-allotments (e.g., *Fortified Boiled Rice*, *Normal Boiled Rice*, *Tide Over Rice*) under canonical inspection groups.
* **Strict Official Inspection Sort Order**:
  1. `RR` (Raw Rice)
  2. `BR` (Boiled Rice)
  3. `CMR` (Custom Milled Rice)
  4. `Wheat`
  5. `Atta`
  6. `Sugar`
  7. `Koil` (Kerosene Oil)
  8. `OMSS` & other commodities with closing balance
  9. `Total Rice` (Consolidated footer summary)

### 4. 2-Row Mobile Reconcile Table (`ReconciliationTable.jsx`)
* Compact 2-row layout per commodity optimized for mobile screens.
* **In-Line Bag Weight Control**: Independent bag weight adjustment per commodity (default 50.0 kg, adjustable with `+` and `-` in 0.1 kg steps).
* **Loose Stock Entry**: Allows entering loose kg to add to whole bag calculations.
* **Difference Highlighting**: Instant visual color-coding for exact matches (green), excess/surplus (blue), and shortage/deficit (red).
* **Direct ePOS Stock Edit**: Tap to edit closing balance numbers directly if discrepancy adjustments are required.

### 5. Inspection Paper Summary View (`InspectionPaperSummary.jsx`)
* Compact 4-column portrait view: **Short Name — ePOS Stock — Physical Stock — Difference**.
* Formatted strictly for rapid copying onto the statutory physical inspection register papers.

### 6. Official Government PDF Export (`pdfGenerator.js`)
* Generates a formal, printable **Audit & Reconciliation Report** using `jspdf` and `jspdf-autotable`:
  * Kerala Civil Supplies & Consumer Affairs Department header.
  * Inspector details: `Sirosh P.S, Rationing Inspector, Ponnani Firka`.
  * Inspection metadata: Date, Time, Shop No, TSO, District.
  * Reconciled Itemized Table with bag counts, loose kg, total physical kg, and difference kg.
  * Total Rice Master Aggregation Box.
  * Inspecting officer remarks and dual legal signature blocks.

### 7. Progressive Web App (PWA) & Sizing Fixes
* Installable on Android, iOS, and Desktop.
* **Optimized Splash / Start Screen**: Separated standard (`purpose: "any"`) and adaptive maskable (`purpose: "maskable"`) icons with safe-zone margins (central emblem at ~45% canvas on dark `#0f172a`), completely eliminating the oversized, screen-covering splash screen bug.
* Service Worker cache management with one-click **"Update App & Clear Cache"** routine in settings.

### 8. Share App Feature (`MasterMappingModal.jsx`)
* Located under **Settings $\rightarrow$ Update App & PWA $\rightarrow$ Share App to Others**.
* Supports native OS mobile share sheet (`navigator.share`), one-click WhatsApp sharing, and clipboard copy.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18/19, Vite, Tailwind CSS, Lucide React |
| **PDF Generation** | jsPDF, jsPDF-AutoTable (lazy-loaded for instant initial page loads) |
| **Backend API** | Python 3.12, FastAPI, BeautifulSoup4, Requests, Urllib3 |
| **Offline & PWA** | Web App Manifest, Service Worker (`v1.2`), HTML5 LocalStorage |
| **Hosting & CI/CD** | Vercel Serverless Functions (`regions: ["bom1"]` Mumbai, India) |
| **Version Control** | Git, GitHub CLI |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
* **Node.js**: v18.x or v20.x
* **Python**: v3.11 or v3.12
* **Git**: Installed and configured

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/siroshps/fps-inspection-calculator.git
cd fps-inspection-calculator

# Install frontend dependencies
npm install

# (Optional) Install Python dependencies for local backend testing
pip install -r requirements.txt
```

### 3. Running Locally
```bash
# Terminal 1: Frontend Dev Server (http://localhost:5173)
npm run dev

# Terminal 2: Backend Scraper API (http://localhost:8000)
python api/index.py
```

### 4. Building for Production
```bash
npm run build
```

### 5. Deploying to Vercel Production
```bash
npx vercel --prod --yes
```

---

## 📁 Project Structure

```text
fps-inspection-calculator/
├── api/
│   ├── index.py                 # FastAPI endpoints (/api/fetch-stock, /api/health, /api/demo-stock)
│   └── scraper.py               # Robust ePOS scraper with urllib3 retries & SSL bypass
├── public/
│   ├── icon-192.png             # Standard 192px PWA icon (padded safe-zone)
│   ├── icon-512.png             # Standard 512px PWA splash icon (padded safe-zone)
│   ├── icon-maskable-192.png    # Maskable adaptive launcher icon
│   ├── icon-maskable-512.png    # Maskable adaptive launcher icon
│   ├── icon.svg                 # SVG favicon (fixed 512x512)
│   ├── manifest.json            # PWA manifest (separated any and maskable icons)
│   └── sw.js                    # PWA Service Worker (v1.2)
├── src/
│   ├── components/
│   │   ├── Header.jsx                   # Top bar: ARD search, Live badge, Lens edit button
│   │   ├── QuickEntryPad.jsx            # 3-column numpad, × formulas, ¼ ½ ¾ buttons
│   │   ├── ReconciliationTable.jsx      # 2-row mobile audit table, bag weight ±0.1kg
│   │   ├── InspectionPaperSummary.jsx   # Compact portrait summary for paper copying
│   │   ├── StickyBottomSummary.jsx      # Fixed footer bar with total physical and difference
│   │   ├── FetchErrorModal.jsx          # ePOS connection failure resolution dialog
│   │   ├── MasterMappingModal.jsx       # Settings, CSV mapping, PWA update, Share App
│   │   ├── InspectionMetadataModal.jsx  # Inspector name, designation, remarks dialog
│   │   ├── EditEposStockModal.jsx       # Manual ePOS stock editor
│   │   └── ErrorBoundary.jsx            # React runtime error boundary
│   ├── hooks/
│   │   ├── useLocalStorage.js           # Safe local storage persistence
│   │   └── useCommodityMapping.js       # Canonical groups & CSV alias resolver
│   ├── utils/
│   │   ├── constants.js                 # Commodities, sorting ranks, default bag weights
│   │   └── pdfGenerator.js              # jsPDF official government inspection report generator
│   ├── App.jsx                          # Main state orchestration, multi-attempt fetch engine
│   └── main.jsx                         # React entry point wrapped with ErrorBoundary
├── index.html                   # Mobile viewport config, manifest link, favicon links
├── memory.md                    # Comprehensive developer continuity guide
├── vercel.json                  # regions: ["bom1"] (Mumbai), maxDuration: 15s
├── requirements.txt             # Python backend dependencies
└── package.json                 # Node dependencies & Vite build scripts
```

---

## 📄 License & Attribution

* **Author**: Sirosh P.S (Rationing Inspector, Ponnani Firka, Kerala)
* **Application**: Tailored for Kerala Civil Supplies & Consumer Affairs Department Fair Price Shop statutory stock verifications.
