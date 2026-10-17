import React, { useState } from 'react';
import { 
  ClipboardCopy, 
  Check, 
  Printer, 
  FileSpreadsheet, 
  Info
} from 'lucide-react';
import { MASTER_GROUPS, getInspectionSortRank } from '../utils/constants';

export default function InspectionPaperSummary({
  groupedData = {},
  totalRiceSummary = {},
  metadata = {},
  fpsId = '',
  showToast
}) {
  const [copied, setCopied] = useState(false);

  // Helper to format numbers with Indian locale standard (2 decimals)
  const fmt = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Helper for difference badge styling
  const getDiffBadge = (diff) => {
    const val = Math.round(diff * 100) / 100;
    if (val === 0) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        text: 'text-emerald-700',
        label: '0.00'
      };
    } else if (val > 0) {
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        text: 'text-blue-700 font-bold',
        label: `+${fmt(val)}`
      };
    } else {
      return {
        bg: 'bg-red-50 text-red-800 border-red-300',
        text: 'text-red-700 font-bold',
        label: fmt(val)
      };
    }
  };

  // Flatten active commodities in inspection order
  const groupOrder = [
    MASTER_GROUPS.RICE,
    MASTER_GROUPS.WHEAT,
    MASTER_GROUPS.ATTA,
    MASTER_GROUPS.OTHER
  ];

  const rawActiveItems = [];
  groupOrder.forEach(grp => {
    const items = groupedData[grp]?.items || [];
    items.forEach(item => {
      // Include if either ePOS stock > 0 or physical stock > 0 (items having CB)
      if ((item.systemStockKg || 0) > 0 || (item.totalPhysicalKg || 0) > 0) {
        rawActiveItems.push({
          ...item,
          masterGroup: grp
        });
      }
    });
  });

  // Sort by official inspection order: RR, BR, CMR, Wheat, Atta, Sugar, Koil then OMSS and other items with CB
  const activeItems = [...rawActiveItems].sort((a, b) => {
    const rankDiff = getInspectionSortRank(a) - getInspectionSortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.shortName || a.commodity).localeCompare(b.shortName || b.commodity);
  });

  // Copy plain text table for pasting to WhatsApp / Notes / SMS
  const handleCopyText = () => {
    let text = `FPS PHYSICAL STOCK AUDIT SUMMARY\n`;
    text += `ARD: ${fpsId} | ${metadata.shop_name || 'Ration Shop'}\n`;
    text += `Date: ${metadata.inspectionDate || new Date().toISOString().split('T')[0]}\n`;
    text += `------------------------------------------------------------\n`;
    text += `Item        |  ePOS Stock  |  Physical Stock  |  Difference\n`;
    text += `------------------------------------------------------------\n`;

    activeItems.forEach(item => {
      const sName = (item.shortName || item.commodity).padEnd(11, ' ');
      const epos = fmt(item.systemStockKg).padStart(12, ' ');
      const phys = fmt(item.totalPhysicalKg).padStart(16, ' ');
      const diffVal = Math.round(item.differenceKg * 100) / 100;
      const diffStr = (diffVal > 0 ? `+${fmt(diffVal)}` : fmt(diffVal)).padStart(12, ' ');
      text += `${sName} | ${epos} | ${phys} | ${diffStr}\n`;
    });

    text += `------------------------------------------------------------\n`;
    const rEpos = fmt(totalRiceSummary?.systemStockKg).padStart(12, ' ');
    const rPhys = fmt(totalRiceSummary?.totalPhysicalKg).padStart(16, ' ');
    const rDiffVal = Math.round((totalRiceSummary?.differenceKg || 0) * 100) / 100;
    const rDiffStr = (rDiffVal > 0 ? `+${fmt(rDiffVal)}` : fmt(rDiffVal)).padStart(12, ' ');
    text += `TOTAL RICE  | ${rEpos} | ${rPhys} | ${rDiffStr}\n`;
    text += `------------------------------------------------------------\n`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (showToast) showToast('Summary copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRiceDiff = Math.round((totalRiceSummary?.differenceKg || 0) * 100) / 100;
  const riceDiffBadge = getDiffBadge(totalRiceDiff);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden w-full">
      {/* Header Bar */}
      <div className="bg-slate-800 text-white px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold tracking-wide truncate">
              Paper Summary View
            </h2>
            <p className="text-[10px] text-slate-300 truncate hidden xs:block">
              For copying to physical inspection register / mahazar
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-2xs"
            title="Copy formatted summary to clipboard"
          >
            {copied ? <Check className="w-3 h-3" /> : <ClipboardCopy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            <Printer className="w-3 h-3" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Dynamic Single-Screen Fit Table (No Horizontal Overflow) */}
      <div className="w-full">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 text-[11px] sm:text-xs font-black">
              <th className="py-2 px-1.5 sm:px-3 border-r border-slate-200 w-[22%]">
                Item
              </th>
              <th className="py-2 px-1 sm:px-3 text-right border-r border-slate-200 w-[26%]">
                ePOS
              </th>
              <th className="py-2 px-1 sm:px-3 text-right border-r border-slate-200 w-[26%]">
                Physical
              </th>
              <th className="py-2 px-1 sm:px-3 text-right w-[26%]">
                Diff
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
            {activeItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                  No active commodities found. Enter physical stock or check ePOS data.
                </td>
              </tr>
            ) : (
              activeItems.map((item, idx) => {
                const diffBadge = getDiffBadge(item.differenceKg);
                const diffVal = Math.round(item.differenceKg * 100) / 100;
                const isEven = idx % 2 === 0;

                return (
                  <tr 
                    key={item.commodity} 
                    className={`${isEven ? 'bg-white' : 'bg-slate-50/70'} hover:bg-blue-50/40 transition`}
                  >
                    {/* 1. Short Name */}
                    <td className="py-2 px-1.5 sm:px-3 border-r border-slate-200 font-bold text-slate-900 truncate">
                      <span className="text-[11px] sm:text-xs font-black text-blue-900 bg-blue-50/90 border border-blue-200 px-1 sm:px-1.5 py-0.5 rounded block truncate" title={item.commodity}>
                        {item.shortName || item.commodity}
                      </span>
                    </td>

                    {/* 2. ePOS Stock */}
                    <td className="py-2 px-1 sm:px-3 text-right border-r border-slate-200 font-mono font-bold text-slate-800 text-[11px] sm:text-sm truncate">
                      {fmt(item.systemStockKg)}
                    </td>

                    {/* 3. Physical Stock */}
                    <td className="py-2 px-1 sm:px-3 text-right border-r border-slate-200 font-mono font-black text-slate-950 text-[11px] sm:text-sm truncate">
                      {fmt(item.totalPhysicalKg)}
                    </td>

                    {/* 4. Difference */}
                    <td className="py-2 px-1 sm:px-3 text-right font-mono font-black text-[11px] sm:text-sm truncate">
                      <span className={`inline-block px-1 sm:px-2 py-0.2 rounded border text-[10px] sm:text-xs font-black ${diffBadge.bg}`}>
                        {diffVal > 0 ? `+${fmt(diffVal)}` : fmt(diffVal)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Total Rice Aggregation Row */}
            <tr className="bg-blue-50/90 border-t-2 border-b-2 border-blue-300 font-black text-xs sm:text-sm">
              <td className="py-2.5 px-1.5 sm:px-3 border-r border-blue-200 text-blue-950 truncate">
                <span className="text-[10px] sm:text-xs font-black text-white bg-blue-700 px-1 sm:px-1.5 py-0.5 rounded block truncate shadow-2xs">
                  TOT RICE
                </span>
              </td>
              <td className="py-2.5 px-1 sm:px-3 text-right border-r border-blue-200 font-mono font-black text-blue-950 text-[11px] sm:text-sm truncate">
                {fmt(totalRiceSummary?.systemStockKg)}
              </td>
              <td className="py-2.5 px-1 sm:px-3 text-right border-r border-blue-200 font-mono font-black text-blue-950 text-[11px] sm:text-sm truncate">
                {fmt(totalRiceSummary?.totalPhysicalKg)}
              </td>
              <td className="py-2.5 px-1 sm:px-3 text-right font-mono font-black text-[11px] sm:text-sm truncate">
                <span className={`inline-block px-1 sm:px-2 py-0.5 rounded border font-black text-[10px] sm:text-xs ${riceDiffBadge.bg}`}>
                  {totalRiceDiff > 0 ? `+${fmt(totalRiceDiff)}` : fmt(totalRiceDiff)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Field Note / Helper Callout */}
      <div className="p-2 sm:p-2.5 bg-slate-50 border-t border-slate-200 flex items-start gap-1.5 text-[10.5px] text-slate-600">
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <p>
          Final closing audit figures (Stacks + Loose). Designed to fit portrait mobile screens for easy copying to official paper records.
        </p>
      </div>
    </div>
  );
}
