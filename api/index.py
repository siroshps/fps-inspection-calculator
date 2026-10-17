import sys
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field

# Robust import resolution for both local development and Vercel serverless packaging
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from scraper import fetch_fps_stock_from_epos, generate_mock_stock
except ImportError:
    try:
        from api.scraper import fetch_fps_stock_from_epos, generate_mock_stock
    except ImportError:
        from backend.scraper import fetch_fps_stock_from_epos, generate_mock_stock

app = FastAPI(
    title="Kerala FPS Stock Audit API",
    description="Backend scraper and reconciliation service for epos.kerala.gov.in",
    version="1.0.0"
)

# Enable GZIP compression for ultra-fast response transmission
app.add_middleware(GZipMiddleware, minimum_size=500)

# Enable CORS for frontend Vite dev server and PWA clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FetchStockRequest(BaseModel):
    fps_id: str = Field(..., description="7-digit FPS/ARD shop code", example="2056003")
    month: Optional[int] = Field(None, description="Month (1-12)")
    year: Optional[int] = Field(None, description="Year (e.g. 2026)")
    filter_zero: Optional[bool] = Field(True, description="Filter out commodities with zero closing balance stock")
    force_refresh: Optional[bool] = Field(False, description="Bypass in-memory cache and fetch live from ePOS portal")
    allow_mock: Optional[bool] = Field(False, description="Whether to allow mock data fallback if ePOS portal is down")

class CommodityStock(BaseModel):
    commodity: str
    unit: str = "Kgs"
    system_stock_kg: float
    issued_qty: Optional[float] = 0.0

class StockResponse(BaseModel):
    fps_id: str
    shop_name: str
    district: str
    tso: str
    month: int
    year: int
    source: str
    message: str
    timestamp: str
    zero_stock_count: Optional[int] = 0
    items: List[CommodityStock]

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Kerala FPS Stock Scraper API"}

@app.post("/api/fetch-stock")
def fetch_stock(payload: FetchStockRequest):
    fps_id = payload.fps_id.strip()
    if not fps_id:
        raise HTTPException(status_code=400, detail="FPS ID is required")
    
    result = fetch_fps_stock_from_epos(
        fps_id, 
        payload.month, 
        payload.year, 
        filter_zero=payload.filter_zero if payload.filter_zero is not None else True,
        force_refresh=bool(payload.force_refresh),
        allow_mock=bool(payload.allow_mock)
    )
    return result

@app.get("/api/fetch-stock")
def fetch_stock_get(
    fps_id: str = "2056003", 
    month: Optional[int] = None, 
    year: Optional[int] = None, 
    filter_zero: bool = True,
    force_refresh: bool = False,
    allow_mock: bool = False
):
    fps_id = fps_id.strip()
    if not fps_id:
        raise HTTPException(status_code=400, detail="FPS ID is required")
    return fetch_fps_stock_from_epos(
        fps_id, 
        month, 
        year, 
        filter_zero=filter_zero,
        force_refresh=force_refresh,
        allow_mock=allow_mock
    )

@app.get("/api/demo-stock")
def demo_stock(fps_id: str = "2056003"):
    """Explicit endpoint for demo or training mock data."""
    return generate_mock_stock(fps_id.strip(), "Offline Demo Mode")

# Fallback direct runner
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
