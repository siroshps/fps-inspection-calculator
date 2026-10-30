# Kerala FPS Stock Audit & ePOS Inspection Calculator - Project Memory

> **Purpose of this file**: Complete knowledge base, architecture reference, and setup guide to seamlessly continue developing and maintaining the Kerala Fair Price Shop (ARD) Stock Inspection WebApp from any machine (work or home PC).

---

## 1. Project Overview

* **App Name**: FPS Inspection Calculator (Kerala Civil Supplies & Consumer Affairs)
* **Author / Inspector**: Sirosh P.S, Rationing Inspector (RI), Ponnani Firka, Malappuram District, Kerala.
* **Production Live URL**: [https://fps-inspection-calculator.vercel.app](https://fps-inspection-calculator.vercel.app)
* **Target Audience**: Rationing Inspectors, Taluk Supply Officers (TSOs), and Civil Supplies inspection squads conducting on-site statutory stock verification of Authorised Ration Dealers (ARDs / Fair Price Shops).
* **Core Problem Solved**: Eliminates manual arithmetic errors and tedious paper calculations during ration shop inspections by consolidating physical bag stacks (including fractional bags and stack formulas like `12×4`), factoring in loose grain, automatically fetching and grouping official closing balance stock from the Kerala ePOS portal (`epos.kerala.gov.in`), and calculating accurate book-vs-physical differences.

---

## 2. Technology Stack & Hosting

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 18/19 + Vite | Blazing fast client bundle with code-splitting (`pdfGenerator` lazy-loaded on demand). |
| **Styling** | Tailwind CSS + Lucide React | Clean, high-contrast, mobile-first UI optimized for one-handed outdoor phone usage. |
| **PWA & Offline** | Web App Manifest + Service Worker | Installable as a standalone Android/iOS app; safe-zone icons; aggressive cache controls. |
| **Backend API** | Python 3.12 + FastAPI | Fast serverless REST API with GZip compression, connection pooling, and multi-attempt scraper. |
| **Web Scraping** | BeautifulSoup4 + Requests + Urllib3 | Scrapes official HTML tables from `https://epos.kerala.gov.in/fps_stock.action`. |
| **Hosting & Deployment** | Vercel Serverless | Deployed in AWS Mumbai region (`bom1`) for ~15ms domestic latency to Kerala State Data Centre. |

---

## 3. Key Features & How They Work

### 3.1 High-Speed Physical Stack Numpad (`QuickEntryPad.jsx`)
* **3-Column Phone Numpad**: Optimized for fast thumb-typing while physically walking between rice/wheat stacks in the ARD godown.
* **Stack Multiplication**: Supports entering heights and stacks directly (e.g., `12×4` evaluates automatically to 48 bags).
* **Fractional Bag Buttons**: Quick buttons for `+¼`, `+½`, `+¾`, and `+1` bags for loose/partially filled gunny bags.
* **Touch-and-Hold (Long Press) History**: Pressing and holding any commodity button pops up that specific commodity's stack count history without leaving the numpad.
* **Commodity Quick Stack Presets**: One-tap buttons for standard stack counts (`10`, `11`, `12`, `13`, `14`, `15`).
* **All-Time Total Expected Bags & Compact Card Layout**:
  * **1. Select Commodity Grid**:
    * **Row 1**: Displays `RR 80b - (10b)` on the left with `70b` counted badge in blue on the right:
      * `80b` is bold black matching the commodity font (total expected bags).
      * `(10b)` is the countdown balance color-coded: red if excess (`+`), green if zero or within ¼ bag (`0b`, `¼b`), and amber/blue while counting down.
      * `70b` is the counted stacks badge in blue background.
    * **Row 2**: Clean ePOS closing balance `ePOS: 4,000kg` on the left and counted weight `3,500kg` on the right (no extra clutter).
  * **2. Adding to Row**: Displays `2. Adding to: BR (Bal: 45b)` and explicitly displays `Bag Wt: 50 kg - Total 80b`.

### 3.2 Intelligent ePOS Scraper & Multi-Attempt Fetching (`api/scraper.py`, `App.jsx`)
* **Target URL**: `https://epos.kerala.gov.in/fps_stock.action` (POST `fps_id`, `month`, `year`).
* **Government SSL Certificate Handling**: Uses SSL resilience to prevent `SSLError` caused by the Kerala State IT Mission's `eMudhra` root/intermediate CA on Linux serverless containers.
* **Progressive Multi-Attempt Retries**:
  * Automatically attempts connection up to 3 times (14 seconds per attempt).
  * Shows live progress countdown in the header (`1/3`, `2/3`, `3/3`).
* **Safe Inspection Guarantee (Zero Mock Poisoning)**:
  * Failed attempts **never** overwrite your active inspection numbers with fake demo data.
  * Verified live data is cached in `localStorage` (`kerala_fps_verified_<cleanId>`).
  * If the government portal is down during inspection, the user gets clear options via `FetchErrorModal`:
    1. 🔄 **Try Again (3 Fresh Attempts)**
    2. 📋 **Use Last Verified Stock** (restores previously fetched real ePOS numbers with timestamp)
    3. ✏️ **Enter Stock Manually** (type closing balances from the physical ePOS screen/printout)
    4. 🧪 **Load Demo Data** (only if explicitly clicked for testing)

### 3.3 Canonical Inspection Grouping & Official Sort Order
* Commodities with multiple allotment types (e.g., *Fortified Boiled Rice*, *Normal Boiled Rice*, *Tide Over Rice*) are merged into canonical groups according to official Kerala Civil Supplies rules.
* **Strict Official Inspection Sort Order**:
  1. `RR` (Raw Rice)
  2. `BR` (Boiled Rice)
  3. `CMR` (Custom Milled Rice)
  4. `Wheat`
  5. `Atta`
  6. `Sugar`
  7. `Koil` (Kerosene Oil)
  8. `OMSS` & Other Commodities with Closing Balance
  9. `Total Rice` (Consolidated footer summary)

### 3.4 In-Line Bag Weight Adjustments
* Each commodity has independent bag weight control directly in the Reconcile Table (default 50.0 kg, adjustable with `+` and `-` in 0.1 kg steps).

### 3.5 Inspection Paper Summary View (`InspectionPaperSummary.jsx`)
* Ultra-compact tabular view displaying **Short Name — ePOS Stock — Physical Stock — Difference** formatted specifically for rapid copying onto the physical pink/white inspection register sheet.

### 3.6 Official PDF Inspection Report (`pdfGenerator.js`)
* Generates a formal, printable inspection report featuring:
  * Official Header: Kerala Civil Supplies & Consumer Affairs Department
  * Inspector Name: `Sirosh P.S, Rationing Inspector, Ponnani Firka`
  * Date, Time, Shop No, TSO, District
  * Complete commodity audit table with System Stock, Physical Bags, Loose kg, Total Physical kg, Difference kg, and Remarks.

### 3.7 Share App Feature (`MasterMappingModal.jsx`)
* Located under **App Settings $\rightarrow$ Update App & PWA $\rightarrow$ Share App to Others**.
* Supports native OS mobile share sheet (`navigator.share`), 1-tap WhatsApp sharing, and clipboard copy with official announcement text.

### 3.8 Sticky Bottom Summary Bar with QTL & Bag Counts (`StickyBottomSummary.jsx`)
* **Collapsed Single-Line Bar**:
  * Displays Total Rice system stock and physical count in **Quintals (QTL)** (1 Qtl = 100 kg) with 2 decimal places e.g., `40.00 Qtl (80b)` / `38.25 Qtl (76 ½b)`.
  * Inline Bag Counts: Shows Total expected bags for ePOS and counted bags for Physical right inside the bar.
  * Difference Badge: Stays in **kg** with soft pastel status badges (green for match, blue for excess, red for shortage).
* **Expandable Category Breakdown Drawer**:
  * Tapping the chevron expands the 4 canonical groups (Total Rice, Wheat, Atta, Other) showing ePOS and Physical stock in **kg** with difference in **kg**.

---

## 4. Setup Guide for Home PC

### 4.1 Prerequisites
1. **Node.js**: v18.x or v20.x ([Download Node.js](https://nodejs.org/))
2. **Python**: v3.11 or v3.12 ([Download Python](https://python.org/))
3. **Git**: Installed and configured ([Download Git](https://git-scm.com/))

### 4.2 Clone & Install
```bash
# Clone the repository
git clone https://github.com/siroshps/fps-inspection-calculator.git
cd fps-inspection-calculator

# Install frontend dependencies
npm install

# (Optional) Install Python dependencies for local backend testing
pip install -r requirements.txt
```

### 4.3 Running Locally

#### Option A: Frontend Development Server
```bash
npm run dev
# App runs at: http://localhost:5173
```
*Note: In local Vite dev mode, Vite proxies `/api` calls or uses the local FastAPI server if running.*

#### Option B: Local Python API Server
```bash
python api/index.py
# Or with uvicorn:
uvicorn api.index:app --reload --port 8000
```

### 4.4 Building & Verifying Production Bundle
```bash
npm run build
```
Build output is saved to `dist/`. Ensure zero compile errors.

### 4.5 Deploying to Vercel Production
The Vercel project is linked to the team `sirosh`.
Always deploy using:
```bash
npx vercel --prod --yes --scope sirosh
```

---

## 5. Critical Code Locations & File Structure

```text
fps-inspection-calculator/
├── api/
│   ├── index.py                 # FastAPI endpoints (/api/fetch-stock, /api/health, etc.)
│   └── scraper.py               # Robust ePOS scraper with urllib3 retries & SSL bypass
├── public/
│   ├── icon-192.png             # Standard 192px PWA icon (padded safe-zone)
│   ├── icon-512.png             # Standard 512px PWA splash icon (padded safe-zone)
│   ├── icon-maskable-192.png    # Maskable adaptive launcher icon
│   ├── icon-maskable-512.png    # Maskable adaptive launcher icon
│   ├── icon.svg                 # SVG favicon (fixed 512x512, no 100% viewport stretch)
│   ├── manifest.json            # PWA manifest (separated any and maskable icons)
│   └── sw.js                    # PWA Service Worker (network-first navigation, cache-first assets)
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
│   │   └── EditEposStockModal.jsx       # Manual ePOS stock editor
│   ├── hooks/
│   │   ├── useLocalStorage.js           # Safe local storage persistence with error handling
│   │   └── useCommodityMapping.js       # Canonical groups & CSV alias resolver
│   ├── utils/
│   │   ├── constants.js                 # Commodities, sorting ranks, default bag weights
│   │   └── pdfGenerator.js              # jsPDF official government inspection report generator
│   ├── App.jsx                          # Main state orchestration, multi-attempt fetch engine
│   └── main.jsx                         # React entry point with ErrorBoundary
├── index.html                   # Mobile viewport config, manifest link, favicon links
├── vercel.json                  # regions: ["bom1"] (Mumbai), maxDuration: 15s
├── requirements.txt             # Python backend dependencies
└── package.json                 # Node dependencies & Vite build scripts
```

---

## 6. Solved Issues & Best Practices (Do Not Regress!)

1. **PWA Splash Screen / Start Screen Logo Too Big**:
   * *Problem*: `icon.svg` with `sizes: "any"` and `purpose: "any maskable"` caused Chrome on Android to scale the SVG to 100vw × 100vh, completely covering the phone screen.
   * *Fix*: Removed SVG from `manifest.json`. Used dedicated PNGs with 20% safe-zone padding. Separated `purpose: "any"` (splash screen) from `purpose: "maskable"` (launcher icon).
2. **React Error #310 ("Rendered more hooks than during previous render")**:
   * *Rule*: In React functional components, **all hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) must execute unconditionally at the top level before any `if (...) return null;` early return**.
3. **ePOS Kerala Government Connection Drop**:
   * Government servers use eMudhra certificates. Always keep `verify=False` and `urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)` in `scraper.py`.
   * Keep serverless functions in Mumbai (`bom1`) via `vercel.json` to prevent international gateway timeouts.
4. **Vercel Deploy Authorization**:
   * Always pass `--scope sirosh` when deploying via CLI: `npx vercel --prod --yes --scope sirosh`.
5. **Preserving Inspection Data**:
   * Never overwrite user bag counts or physical stock on API failure. Always keep active state intact and offer retry or manual entry.
