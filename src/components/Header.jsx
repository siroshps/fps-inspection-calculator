import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  RefreshCw, 
  SlidersHorizontal, 
  Download, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Scale,
  PenLine
} from 'lucide-react';
import { DEMO_FPS_SHOPS } from '../utils/constants';

export default function Header({
  fpsId,
  setFpsId,
  onFetchStock,
  isLoading,
  fetchProgress,
  fetchFailed,
  onRetryFetch,
  dataSource,
  metadata,
  globalBagWeight,
  setGlobalBagWeight,
  onOpenSettings,
  onOpenMetadata,
  onResetAudit,
  onExportPdf,
  isOnline,
  totalStacksCount
}) {
  const [errorMsg, setErrorMsg] = useState('');

  const handleFetch = (e) => {
    e?.preventDefault();
    if (!fpsId || fpsId.trim().length < 5) {
      setErrorMsg('Please enter a valid FPS ID (typically 7 digits)');
      return;
    }
    setErrorMsg('');
    onFetchStock(fpsId.trim(), { forceRefresh: true, maxAttempts: 3 });
  };

  const handleSelectDemo = (shopId) => {
    setFpsId(shopId);
    setErrorMsg('');
    onFetchStock(shopId, { forceRefresh: true, maxAttempts: 3 });
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Slim Bar: Branding & Key Actions */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">Kerala Civil Supplies</span>
              {/* Online / Offline badge */}
              <span className={`inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded ${
                isOnline ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-slate-100 leading-none">
              FPS Stock Audit
            </h1>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Inspection Details & Remarks Button (Lens with Pen logo) */}
          <button
            onClick={onOpenMetadata}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition relative flex items-center justify-center tap-bounce"
            title="Edit Inspection Details & Remarks"
          >
            <Search className="w-3.5 h-3.5 text-blue-300" />
            <PenLine className="w-2.5 h-2.5 text-amber-400 absolute -bottom-0.5 -right-0.5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Settings, Update App / Clear Cache & PWA"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Reset Button */}
          <button
            onClick={onResetAudit}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 border border-slate-700 transition"
            title="Clear Counts & Reset Audit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-xs transition tap-bounce"
            title="Generate Official Audit PDF Report"
          >
            <Download className="w-3 h-3" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Row 2: Search Input + Fetch Button + Compact Status Badge */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 bg-slate-900/95 flex items-center justify-between gap-2">
        <form onSubmit={handleFetch} className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
              <Building2 className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              maxLength={12}
              value={fpsId}
              onChange={(e) => setFpsId(e.target.value)}
              placeholder="7-digit ARD (e.g. 2056003)"
              className="w-full pl-8 pr-2 py-1 bg-slate-950 text-white font-mono text-xs rounded-md border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-md shadow-xs transition shrink-0 tap-bounce"
            title="Fetch live stock from ePOS Kerala portal"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {fetchProgress 
                ? `${fetchProgress.attempt}/${fetchProgress.maxAttempts}` 
                : isLoading 
                ? '...' 
                : 'Fetch'}
            </span>
          </button>

          {/* Compact Live Status Badge / Retry Trigger */}
          {fetchProgress ? (
            <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-950/80 text-blue-300 border-blue-700 shrink-0 animate-pulse">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-400" />
              <span>Att {fetchProgress.attempt}/{fetchProgress.maxAttempts}</span>
            </div>
          ) : fetchFailed ? (
            <button
              type="button"
              onClick={onRetryFetch}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-950 text-red-300 border-red-700 hover:bg-red-900 transition shrink-0 tap-bounce"
              title="Click to retry fetching live stock"
            >
              <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
              <span>Offline • Retry</span>
            </button>
          ) : dataSource ? (
            <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
              dataSource === 'epos_live' 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' 
                : dataSource === 'verified_cache'
                ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                : dataSource === 'manual'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-purple-950/80 text-purple-300 border-purple-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dataSource === 'epos_live' 
                  ? 'bg-emerald-400 animate-pulse' 
                  : dataSource === 'verified_cache'
                  ? 'bg-blue-400'
                  : dataSource === 'manual'
                  ? 'bg-amber-400'
                  : 'bg-purple-400'
              }`}></span>
              <span>
                {dataSource === 'epos_live' 
                  ? 'Live' 
                  : dataSource === 'verified_cache'
                  ? 'Saved'
                  : dataSource === 'manual'
                  ? 'Manual'
                  : 'Demo'}
              </span>
            </div>
          ) : null}

          {/* Quick Demo Chips on Larger Screens */}
          <div className="hidden md:flex items-center gap-1 ml-2 text-[11px] text-slate-400">
            <span>Quick:</span>
            {DEMO_FPS_SHOPS.map(demo => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemo(demo.id)}
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] border transition ${
                  fpsId === demo.id 
                    ? 'bg-blue-900/60 border-blue-500 text-blue-200' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                }`}
              >
                {demo.id}
              </button>
            ))}
          </div>
        </form>

        {/* Desktop-only single line shop name (hidden on mobile to save vertical space) */}
        {metadata && metadata.shop_name && (
          <div className="hidden lg:flex items-center gap-2 text-xs truncate max-w-sm">
            <button 
              onClick={onOpenMetadata}
              className="text-left hover:underline text-slate-300 truncate"
              title="Click to edit inspection details"
            >
              <span className="font-semibold text-slate-200 truncate">{metadata.shop_name}</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-900/80 text-red-200 text-[11px] px-3 py-0.5 text-center border-t border-red-700">
          {errorMsg}
        </div>
      )}
    </header>
  );
}
