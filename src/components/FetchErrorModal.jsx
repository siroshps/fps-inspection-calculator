import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Edit3, 
  Database, 
  FlaskConical, 
  X, 
  WifiOff, 
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function FetchErrorModal({
  isOpen,
  onClose,
  fpsId,
  errorMsg,
  cachedData,
  onRetry,
  onUseCached,
  onManualEntry,
  onLoadDemo,
  isRetrying
}) {
  if (!isOpen) return null;

  const formatDate = (isoStr) => {
    try {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-red-950/60 border-b border-red-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-300">
            <WifiOff className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold leading-tight">ePOS Server Connection Failed</h3>
              <p className="text-[11px] text-red-300/80">ARD {fpsId} • epos.kerala.gov.in</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 text-xs text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>3 connection attempts timed out</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The Kerala ePOS server did not respond. This usually happens due to low mobile signal in the shop or high portal load during ration hours.
            </p>
            {errorMsg && (
              <p className="font-mono text-[10px] text-red-300/70 truncate bg-slate-900/60 p-1 rounded">
                Details: {errorMsg}
              </p>
            )}
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2.5 text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Your Inspection Data is Safe</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              We did not replace your figures with fake mock data. Choose how you want to proceed below:
            </p>
          </div>

          {/* Option 1: Restore Previous Verified Cache (if available) */}
          {cachedData && cachedData.items && cachedData.items.length > 0 && (
            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/50 space-y-2">
              <div className="flex items-center justify-between text-blue-300">
                <span className="font-semibold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Verified Cache Found
                </span>
                <span className="text-[10px] text-blue-400/80 flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {formatDate(cachedData.savedAt)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Previously fetched live data for ARD {fpsId} has {cachedData.items.length} commodities.
              </p>
              <button
                onClick={() => onUseCached(cachedData)}
                className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Use Last Verified Stock</span>
              </button>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="space-y-2 pt-1">
            {/* Retry Button */}
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm tap-bounce"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying (Connecting)...' : 'Try Again (3 Fresh Attempts)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Manual Entry Button */}
              <button
                onClick={onManualEntry}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg text-xs transition flex items-center justify-center gap-1.5 tap-bounce"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter Manually</span>
              </button>

              {/* Load Demo Data Button (Explicit user opt-in) */}
              <button
                onClick={onLoadDemo}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs rounded-lg transition flex items-center justify-center gap-1 tap-bounce"
                title="Only use for testing / demo presentation"
              >
                <FlaskConical className="w-3 h-3 text-purple-400" />
                <span>Load Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Kerala FPS Inspection Calculator</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 underline"
          >
            Keep Current & Close
          </button>
        </div>
      </div>
    </div>
  );
}
