import re
import datetime
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup

EPOS_ACTION_URL = "https://epos.kerala.gov.in/fps_stock.action"

DEFAULT_MOCK_COMMODITIES = [
    {"commodity": "Boiled rice", "unit": "Kgs", "system_stock_kg": 1250.0, "allotted_qty": 2500.0, "issued_qty": 1250.0},
    {"commodity": "Raw rice", "unit": "Kgs", "system_stock_kg": 640.0, "allotted_qty": 1500.0, "issued_qty": 860.0},
    {"commodity": "CMR", "unit": "Kgs", "system_stock_kg": 420.0, "allotted_qty": 1000.0, "issued_qty": 580.0},
    {"commodity": "SPL Rice", "unit": "Kgs", "system_stock_kg": 380.0, "allotted_qty": 800.0, "issued_qty": 420.0},
    {"commodity": "Wheat", "unit": "Kgs", "system_stock_kg": 950.0, "allotted_qty": 2000.0, "issued_qty": 1050.0},
    {"commodity": "Atta", "unit": "Pkts", "system_stock_kg": 280.0, "allotted_qty": 600.0, "issued_qty": 320.0},
    {"commodity": "Sugar", "unit": "Kgs", "system_stock_kg": 150.0, "allotted_qty": 300.0, "issued_qty": 150.0},
    {"commodity": "Koil", "unit": "Ltrs", "system_stock_kg": 45.0, "allotted_qty": 200.0, "issued_qty": 155.0},
]

def generate_mock_stock(fps_id: str, reason: str = "Fallback Mock Data") -> Dict[str, Any]:
    """Generates realistic mock stock data based on FPS ID for testing/offline use."""
    # Deterministic variation based on FPS ID digits
    num = sum(int(c) for c in fps_id if c.isdigit()) or 25
    multiplier = 0.8 + ((num % 10) * 0.05)
    
    mock_items = []
    for item in DEFAULT_MOCK_COMMODITIES:
        stock = round(item["system_stock_kg"] * multiplier, 2)
        mock_items.append({
            "commodity": item["commodity"],
            "unit": item["unit"],
            "system_stock_kg": stock,
            "allotted_qty": round(item["allotted_qty"] * multiplier, 2),
            "issued_qty": round(item["issued_qty"] * multiplier, 2),
        })

    return {
        "fps_id": fps_id,
        "shop_name": f"ARD {fps_id} (Ponnani Firka - Demo)",
        "district": "Malappuram",
        "tso": "Ponnani",
        "month": datetime.datetime.now().month,
        "year": datetime.datetime.now().year,
        "source": "mock_fallback",
        "message": f"Loaded mock fallback data ({reason})",
        "items": mock_items,
        "timestamp": datetime.datetime.now().isoformat()
    }

def parse_epos_html(html_text: str, fps_id: str, month: int, year: int, filter_zero: bool = True) -> Optional[Dict[str, Any]]:
    """Parses the HTML response from epos.kerala.gov.in/fps_stock.action."""
    if not html_text or "Stock Details Not Found" in html_text:
        return None

    soup = BeautifulSoup(html_text, "html.parser")
    table = soup.find("table", {"id": "Report"})
    if not table:
        # Fallback to any table
        table = soup.find("table")
    
    if not table:
        return None

    # Extract header metadata if present
    district = "Kerala"
    tso = "Supply Office"
    shop_title = f"FPS {fps_id}"
    
    title_el = table.find("th", colspan=True)
    if title_el:
        title_text = title_el.get_text(strip=True)
        shop_title = title_text
        dist_match = re.search(r"District:\s*([^/]+)", title_text, re.IGNORECASE)
        if dist_match:
            district = dist_match.group(1).strip()
        tso_match = re.search(r"TSO:\s*([^\)]+)", title_text, re.IGNORECASE)
        if tso_match:
            tso = tso_match.group(1).strip()

    items = []
    zero_stock_count = 0
    rows = table.find_all("tr")
    for tr in rows:
        tds = tr.find_all("td")
        if len(tds) >= 8:
            try:
                sl_no_text = tds[0].get_text(strip=True)
                if not sl_no_text.isdigit():
                    continue
                
                commodity = tds[1].get_text(strip=True)
                unit = tds[2].get_text(strip=True) if len(tds) > 2 else "Kgs"
                
                # Closing Balance (CB Qty) is the last column
                cb_text = tds[-1].get_text(strip=True).replace(",", "")
                try:
                    cb_qty = float(cb_text)
                except ValueError:
                    cb_qty = 0.0

                issued_text = tds[-2].get_text(strip=True).replace(",", "") if len(tds) > 9 else "0"
                try:
                    issued_qty = float(issued_text)
                except ValueError:
                    issued_qty = 0.0

                if filter_zero and cb_qty <= 0.0:
                    zero_stock_count += 1
                    continue

                items.append({
                    "commodity": commodity,
                    "unit": unit,
                    "system_stock_kg": cb_qty,
                    "issued_qty": issued_qty
                })
            except Exception:
                continue

    if not items:
        return None

    return {
        "fps_id": fps_id,
        "shop_name": shop_title,
        "district": district,
        "tso": tso,
        "month": month,
        "year": year,
        "source": "epos_live",
        "message": f"Successfully fetched live data ({len(items)} active commodities, {zero_stock_count} zero-stock items filtered)",
        "items": items,
        "zero_stock_count": zero_stock_count,
        "timestamp": datetime.datetime.now().isoformat()
    }

def fetch_fps_stock_from_epos(fps_id: str, month: Optional[int] = None, year: Optional[int] = None, filter_zero: bool = True) -> Dict[str, Any]:
    """
    Fetches stock data for the given 7-digit FPS ID from the Kerala ePOS portal.
    Falls back gracefully to mock data if the portal is down or ARD is not found.
    """
    fps_id_clean = str(fps_id).strip()
    now = datetime.datetime.now()
    cur_month = month or now.month
    cur_year = year or now.year

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://epos.kerala.gov.in/FPS_Stock.jsp",
        "Origin": "https://epos.kerala.gov.in"
    }

    try:
        # Try current month first
        data = {
            "fps_id": fps_id_clean,
            "month": str(cur_month),
            "year": str(cur_year)
        }
        resp = requests.post(EPOS_ACTION_URL, data=data, headers=headers, timeout=8)
        if resp.status_code == 200:
            parsed = parse_epos_html(resp.text, fps_id_clean, cur_month, cur_year, filter_zero=filter_zero)
            if parsed and parsed.get("items"):
                return parsed

        # If empty or not found, try previous month (e.g. at the start of a month)
        prev_month = cur_month - 1 if cur_month > 1 else 12
        prev_year = cur_year if cur_month > 1 else cur_year - 1
        data_prev = {
            "fps_id": fps_id_clean,
            "month": str(prev_month),
            "year": str(prev_year)
        }
        resp_prev = requests.post(EPOS_ACTION_URL, data=data_prev, headers=headers, timeout=8)
        if resp_prev.status_code == 200:
            parsed_prev = parse_epos_html(resp_prev.text, fps_id_clean, prev_month, prev_year, filter_zero=filter_zero)
            if parsed_prev and parsed_prev.get("items"):
                parsed_prev["message"] = f"Fetched from prior month ({prev_month}/{prev_year}) as current month was empty"
                return parsed_prev

    except Exception as e:
        print(f"ePOS connection error: {e}")
        return generate_mock_stock(fps_id_clean, f"ePOS Portal Connection Error: {str(e)[:50]}")

    # If no live data found for ARD, return mock data
    return generate_mock_stock(fps_id_clean, "FPS ID not registered or active on portal; showing sample mock data")
