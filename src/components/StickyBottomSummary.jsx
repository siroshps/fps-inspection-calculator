import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';
import { MASTER_GROUPS, formatBagsDisplay } from '../utils/constants';

// POS Billing Terminal Logo
export function PosTerminalIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect x="5" y="2" width="14" height="20" rx="2.5" />
      <rect x="8" y="5" width="8" height="5" rx="1" fill="currentColor" fillOpacity="0.25" />
      <circle cx="9" cy="13" r="0.8" fill="currentColor" />
      <circle cx="12" cy="13" r="0.8" fill="currentColor" />
      <circle cx="15" cy="13" r="0.8" fill="currentColor" />
      <circle cx="9" cy="16" r="0.8" fill="currentColor" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" />
      <circle cx="15" cy="16" r="0.8" fill="currentColor" />
      <line x1="9" y1="19" x2="15" y2="19" />
    </svg>
  );
}

// Burlap Gunny Bag / Grain Sack Logo (ചാക്ക്)
export function GunnyBagIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M8 3.5 C8 4.8 9 5.5 10 6.5" />
      <path d="M16 3.5 C16 4.8 15 5.5 14 6.5" />
      <path d="M10 6.5 C11 5.8 13 5.8 14 6.5" />
      <ellipse cx="12" cy="7" rx="3" ry="1.2" fill="currentColor" fillOpacity="0.25" />
      <path d="M13.5 7.5 L15 10" />
      <path d="M9.5 7.5 C6.5 9 5 12 5.5 16.5 C6 20 8 21.5 12 21.5 C16 21.5 18 20 18.5 16.5 C19 12 17.5 9 14.5 7.5 Z" />
      <path d="M9 13.5 Q12 15 15 13.5" strokeDasharray="1.5 1.5" />
      <path d="M8.5 17 Q12 18.5 15.5 17" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

export default function StickyBottomSummary({
  groupedData = {},
  totalRiceSummary = { systemStockKg: 0, totalPhysicalKg: 0, differenceKg: 0, totalBags: 0, expectedBags: 0 }
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format numbers in kg (whole integer)
  const fmt = (num, decimals = 0) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Math.round(Number(num)).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Format quantity in Quintals (Qtl = 100 kg) with 2 decimal places (Indian civil supplies standard)
  const fmtQtl = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    const qtl = Number(num) / 100;
    return qtl.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getPastelBadge = (diff) => {
    const val = Math.round(Number(diff) || 0);
    if (val === 0) {
      return {
        bg: 'bg-[#D1FAE5]',
        text: 'text-[#065F46]',
        border: 'border-[#A7F3D0]',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
      };
    } else if (val > 0) {
      return {
        bg: 'bg-[#DBEAFE]',
        text: 'text-[#1E40AF]',
        border: 'border-[#BFDBFE]',
        icon: <TrendingUp className="w-3 h-3 text-blue-600 shrink-0" />
      };
    } else {
      return {
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#991B1B]',
        border: 'border-[#FECACA]',
        icon: <TrendingDown className="w-3 h-3 text-red-600 shrink-0" />
      };
    }
  };

  const diff = Number(totalRiceSummary?.differenceKg) || 0;
  const riceDiffStyle = getPastelBadge(diff);
  const diffVal = Math.round(diff);

  const totalExpBags = formatBagsDisplay(
    Math.round((totalRiceSummary?.expectedBags ?? (Number(totalRiceSummary?.systemStockKg || 0) / 50)) * 100) / 100
  );
  const countedBags = formatBagsDisplay(totalRiceSummary?.totalBags || 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm text-white shadow-2xl border-t border-slate-700 transition-all duration-200">
      {/* Expandable Drawer Content (All Categories Breakdown) */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-3 py-2.5 bg-slate-950 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
          {[
            MASTER_GROUPS.RICE,
            MASTER_GROUPS.WHEAT,
            MASTER_GROUPS.ATTA,
            MASTER_GROUPS.OTHER
          ].map((grp) => {
            const totals = groupedData[grp]?.totals || {
              systemStockKg: 0,
              totalPhysicalKg: 0,
              differenceKg: 0
            };
            const style = getPastelBadge(totals.differenceKg);
            const gDiff = Math.round(Number(totals.differenceKg) || 0);

            return (
              <div key={grp} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="font-bold text-slate-300 text-[11px] mb-1 truncate">{grp}</div>
                <div className="flex justify-between items-center text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1">
                    <PosTerminalIcon className="w-3 h-3 text-sky-400" />
                    <span>ePOS:</span>
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{fmt(totals.systemStockKg)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[10px] mt-0.5">
                  <span className="flex items-center gap-1">
                    <GunnyBagIcon className="w-3 h-3 text-amber-400" />
                    <span>Phy:</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{fmt(totals.totalPhysicalKg)}</span>
                </div>
                <div className="mt-1 pt-1 border-t border-slate-800 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Diff:</span>
                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                    {gDiff > 0 ? `+${fmt(gDiff)}` : fmt(gDiff)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comfortable Single-Line Bar (Mobile & Desktop) */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-4 select-none min-h-[52px] sm:min-h-[58px]">
        {/* Left: Toggle & Title */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 transition tap-bounce shadow-2xs"
            title={isExpanded ? "Collapse Category Summary" : "Expand All Category Summaries"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-300" /> : <ChevronUp className="w-4 h-4 text-blue-300" />}
          </button>
          
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
            <span className="text-xs sm:text-sm font-bold text-blue-300 uppercase tracking-wide whitespace-nowrap">
              <span className="hidden xs:inline">Total </span>Rice:
            </span>
          </div>
        </div>

        {/* Center: Inline System vs Physical Numbers in QTL + Bags Count */}
        <div className="flex items-center gap-1 sm:gap-2.5 text-xs sm:text-sm font-mono shrink-0">
          <div 
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-md bg-slate-800/90 border border-slate-700/80 shadow-2xs" 
            title={`ePOS System Stock: ${fmtQtl(totalRiceSummary.systemStockKg)} Qtl (${fmt(totalRiceSummary.systemStockKg)} kg) • Total: ${totalExpBags} bags`}
          >
            <PosTerminalIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-bold text-slate-100 whitespace-nowrap">
                {fmtQtl(totalRiceSummary.systemStockKg)} <span className="text-[10px] sm:text-xs font-normal text-slate-400">Qtl</span>
              </span>
              <span className="text-[10px] sm:text-xs text-sky-300 font-bold whitespace-nowrap">
                ({totalExpBags}b)
              </span>
            </div>
          </div>

          <span className="text-slate-500 font-light text-xs">/</span>

          <div 
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-md bg-slate-800/90 border border-slate-700/80 shadow-2xs" 
            title={`Physical Stock: ${fmtQtl(totalRiceSummary.totalPhysicalKg)} Qtl (${fmt(totalRiceSummary.totalPhysicalKg)} kg) • Counted: ${countedBags} bags`}
          >
            <GunnyBagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-bold text-emerald-400 whitespace-nowrap">
                {fmtQtl(totalRiceSummary.totalPhysicalKg)} <span className="text-[10px] sm:text-xs font-normal text-emerald-500/80">Qtl</span>
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-300 font-bold whitespace-nowrap">
                ({countedBags}b)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Net Difference Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] sm:text-xs text-slate-400 font-sans hidden md:inline">Diff:</span>
          <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm whitespace-nowrap ${riceDiffStyle.bg} ${riceDiffStyle.text} ${riceDiffStyle.border}`}>
            {riceDiffStyle.icon}
            <span>{diffVal > 0 ? `+${fmt(diffVal)}` : fmt(diffVal)} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
