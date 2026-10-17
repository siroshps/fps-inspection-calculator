# Kerala FPS Physical Stock Audit & ePOS Reconciliation PWA

A high-speed, lightweight, mobile-first Responsive Web App (PWA) tailored for government Fair Price Shop (Ration Shop) inspectors in Kerala (Civil Supplies Department) to perform fast physical stock audits and reconcile them directly against live `epos.kerala.gov.in` data.

---

## Key Features

### 1. High-Speed Mobile-First Quick Entry UI
- **Quick Commodity Selector Grid:** Large, tactile buttons for mapped commodities (`Boiled Rice`, `Raw Rice`, `CMR`, `SPL Rice`, `Wheat`, `Atta`, `Sugar`, `Koil`).
- **Stack / Bag Input Numpad & Quick Presets:**
  - One-tap quick presets: `+10`, `+12`, `+20`, `+24`, `+50` bags.
  - Interactive tactile Numpad for entering arbitrary bag numbers.
  - Live stack calculation: `Bags × Standard Bag Weight = Total Stack Kg`.
  - Override bag weight per stack (e.g. 25 kg bags).
- **Stack History & Instant Undo Log:**
  - Chronological live feed of each stack entered (e.g. `#4 - Boiled Rice: 24 bags (1,200 kg) @ 50 kg/bag - 14:32`).
  - One-tap `Undo / Delete` button on every entry to instantly fix miscounts.

### 2. Live ePOS Kerala Scraper Backend
- **Endpoint:** `POST /api/fetch-stock` with `{ "fps_id": "2056003" }`.
- Scrapes live closing balance stock from `https://epos.kerala.gov.in/fps_stock.action`.
- Returns clean JSON commodity array with metadata (FPS ID, District, Taluk/TSO).
- **Graceful Fallback Mock Data:** If government server is down, unreachable, or in an offline shop area, mock simulation automatically activates with zero user interruption.
- Ready for Vercel deployment via `api/index.py` and `vercel.json`.

### 3. Reconcile & Difference Engine (With Loose Stock)
- Live table grouped by Master Category:
  - **Total Rice Group:** Sum of CMR, Raw Rice, Boiled Rice, SPL Rice, and all Fortified variants (`Fort.BR`, `Fort.RR`, etc.).
  - **Wheat Group:** Wheat, PMGKAY Wheat.
  - **Atta Group:** Atta.
  - **Other Commodities:** Sugar, Koil (Kerosene), Ragi, and unmatched items.
- **Loose Stock (Kg) Input:** Allows entering loose Kg after whole bags have been counted.
- **Calculated Total Physical (Kg):** $(\text{Total Bags} \times \text{Bag Weight}) + \text{Loose Kg}$.
- **Difference (Kg):** $\text{Total Physical} - \text{System Stock}$.
- **Dynamic Soft Pastel Color-Coding System:**
  - **Exact Match ($Difference = 0$):** Soft Pastel Green (`#D1FAE5`, text `#065F46`)
  - **Excess / Surplus ($Difference > 0$):** Soft Pastel Blue (`#DBEAFE`, text `#1E40AF`)
  - **Shortage / Deficit ($Difference < 0$):** Soft Pastel Red (`#FEE2E2`, text `#991B1B`)

### 4. Sticky Bottom Summary Bar (Always Visible Drawer)
- Pinned bottom bar calculating **Total Rice Aggregation**:
  - **Total Rice System:** Sum of all Rice Sub-commodities in Kg.
  - **Total Rice Physical:** Sum of all counted Rice Bags + Loose Rice in Kg.
  - **Total Rice Net Difference:** Bold pastel badge.
- Expandable drawer displaying group-by-group breakdowns (Wheat, Atta, Other).

### 5. Official Government PDF Export
- Generates a formal, printable **Audit & Reconciliation Report (Form VII)** using `jspdf` and `jspdf-autotable`:
  - Department header (Food, Civil Supplies & Consumer Affairs).
  - Inspection metadata (ARD Code, Dealer Name, District, TSO, Inspection Date & Time).
  - Reconciled Itemized Table with pastel difference cells.
  - Total Rice Master Aggregation Box.
  - Inspecting Officer remarks and dual legal signature blocks (ARD Dealer & Rationing Inspector).

### 6. Master Commodity Mapping Settings
- Customizable sub-commodity grouping modal.
- Add new commodities, edit group assignments, set custom bag weights.
- Persisted in HTML5 `LocalStorage` (`kerala_fps_commodity_mappings_v1`).
- One-click reset to official Kerala PDS defaults.

---

## Quick Start & Running Locally

### Option 1: Double-click launcher (Windows)
Double-click `run.bat` in the root folder.

### Option 2: Command line
```bash
python start_servers.py
```
This starts:
- Frontend PWA: `http://localhost:3000`
- Backend Scraper API: `http://localhost:8000` (docs at `/docs`)

### Option 3: Separate terminals
```bash
# Terminal 1 - Backend Scraper
python -m uvicorn api.index:app --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend PWA
npm run dev
```

---

## Verified Test Cases
- **ARD 2056003 (Ponnani Firka - Malappuram):** Live ePOS stock verified directly against government portal.
- **ARD 2056004:** Live ePOS stock verified.
- **Mock Simulation Mode:** Verified for offline inspection audits.
