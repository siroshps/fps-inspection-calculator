import re
import datetime
import time
from typing import List, Dict, Any, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import urllib3
from bs4 import BeautifulSoup

# Disable insecure SSL warnings (necessary for eMudhra government root CA on Linux/cloud containers)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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

def generate_mock_stock(fps_id: str, reason: str = "Demo / Offline Sample Data") -> Dict[str, Any]:
    """Generates realistic mock stock data based on FPS ID for testing/offline use."""
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
        "message": f"Loaded demo/mock data ({reason})",
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
        table = soup.find("table")
    
    if not table:
        return None

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

# In-memory fast cache with 15 minute TTL - ONLY stores verified live epos data
STOCK_CACHE: Dict[str, Any] = {}

def get_epos_session() -> requests.Session:
    """Creates a configured requests session with HTTP connection pooling and retry adapter."""
    session = requests.Session()
    retry_strategy = Retry(
        total=2,
        backoff_factor=0.3,
        status_forcelist=[500, 502, 503, 504],
        raise_on_status=False
    )
    adapter = HTTPAdapter(max_retries=retry_strategy, pool_connections=10, pool_maxsize=10)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

def fetch_fps_stock_from_epos(
    fps_id: str, 
    month: Optional[int] = None, 
    year: Optional[int] = None, 
    filter_zero: bool = True,
    force_refresh: bool = False,
    allow_mock: bool = False
) -> Dict[str, Any]:
    """
    Fetches stock data for the given 7-digit FPS ID from the Kerala ePOS portal.
    Uses multi-attempt retry with connect/read timeout and SSL bypass for government CAs.
    ONLY caches verified live epos data; NEVER caches failed requests or mock data.
    """
    fps_id_clean = str(fps_id).strip()
    now = datetime.datetime.now()
    cur_month = month or now.month
    cur_year = year or now.year

    cache_key = f"{fps_id_clean}_{cur_month}_{cur_year}_{filter_zero}"
    
    # Check cache if not forcing refresh
    if not force_refresh and cache_key in STOCK_CACHE:
        cached_entry = STOCK_CACHE[cache_key]
        if (now - cached_entry["cached_at"]).total_seconds() < 900:
            cached_data = cached_entry["data"].copy()
            cached_data["cached"] = True
            return cached_data

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://epos.kerala.gov.in/FPS_Stock.jsp",
        "Origin": "https://epos.kerala.gov.in",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ml;q=0.8",
        "Connection": "keep-alive"
    }

    session = get_epos_session()
    last_error = ""

    # Multi-attempt retry loop (up to 3 tries with 8-10s timeout)
    for attempt in range(1, 4):
        try:
            # 1. Primary attempt for requested/current month
            data = {
                "fps_id": fps_id_clean,
                "month": str(cur_month),
                "year": str(cur_year)
            }
            # Connect timeout 4s, Read timeout 9s
            resp = session.post(EPOS_ACTION_URL, data=data, headers=headers, timeout=(4.0, 9.0), verify=False)
            
            if resp.status_code == 200:
                parsed = parse_epos_html(resp.text, fps_id_clean, cur_month, cur_year, filter_zero=filter_zero)
                if parsed and parsed.get("items"):
                    # Cache ONLY verified live data
                    STOCK_CACHE[cache_key] = {"cached_at": now, "data": parsed}
                    return parsed
                
                # If current month had "Stock Details Not Found", attempt previous month once
                if "Stock Details Not Found" in resp.text or not parsed:
                    prev_month = cur_month - 1 if cur_month > 1 else 12
                    prev_year = cur_year if cur_month > 1 else cur_year - 1
                    data_prev = {
                        "fps_id": fps_id_clean,
                        "month": str(prev_month),
                        "year": str(prev_year)
                    }
                    resp_prev = session.post(EPOS_ACTION_URL, data=data_prev, headers=headers, timeout=(4.0, 9.0), verify=False)
                    if resp_prev.status_code == 200:
                        parsed_prev = parse_epos_html(resp_prev.text, fps_id_clean, prev_month, prev_year, filter_zero=filter_zero)
                        if parsed_prev and parsed_prev.get("items"):
                            parsed_prev["message"] = f"Fetched from prior month ({prev_month}/{prev_year}) as current month was empty"
                            STOCK_CACHE[cache_key] = {"cached_at": now, "data": parsed_prev}
                            return parsed_prev
            else:
                last_error = f"ePOS server HTTP {resp.status_code}"

        except requests.exceptions.Timeout as e:
            last_error = f"Timeout on attempt {attempt}: {str(e)[:40]}"
        except requests.exceptions.RequestException as e:
            last_error = f"Network error on attempt {attempt}: {str(e)[:40]}"
        except Exception as e:
            last_error = f"Error on attempt {attempt}: {str(e)[:40]}"

        # Brief backoff before next attempt
        if attempt < 3:
            time.sleep(0.5)

    # If all live fetch attempts failed:
    print(f"Failed to fetch live ePOS stock for ARD {fps_id_clean}: {last_error}")

    # If caller specifically allowed mock data (e.g. testing mode):
    if allow_mock:
        return generate_mock_stock(fps_id_clean, f"ePOS Portal unavailable: {last_error}")

    # Standard production return: Report clean failure so frontend NEVER poisons real audit with mock data
    return {
        "fps_id": fps_id_clean,
        "success": False,
        "source": "epos_unavailable",
        "message": f"Could not reach Kerala ePOS portal after 3 attempts ({last_error}). Tap Retry or enter stock manually.",
        "items": [],
        "timestamp": datetime.datetime.now().isoformat()
    }
