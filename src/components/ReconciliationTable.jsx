import React, { useState } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Boxes, 
  PackageOpen, 
  Eye, 
  EyeOff, 
  LayoutGrid, 
  Table as TableIcon,
  Edit3
} from 'lucide-react';
import { MASTER_GROUPS, getInspectionSortRank, formatBagsDisplay } from '../utils/constants';

export default function ReconciliationTable({
  groupedData = {},
  looseStock = {},
  onLooseStockChange,
  globalBagWeight = 50,
  commodityBagWeights = {},
  onBagWeightChange,
  showZeroStock = false,
  setShowZeroStock,
  hiddenZeroCount = 0,
  onOpenEditStock
}) {
  const [mobileViewMode, setMobileViewMode] = useState('cards'); // 'cards' | 'table'

  /**
   * Helper to format numbers with commas and decimals
   */
  const fmt = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  /**
   * Returns pastel styling classes based on Difference value
   */
  const getDifferenceStyle = (diff) => {
    const val = Math.round(diff * 100) / 100;
    if (val === 0) {
      return {
        bg: 'bg-[#D1FAE5]',
        text: 'text-[#065F46]',
        border: 'border-[#A7F3D0]',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        label: 'Match',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-1" />
      };
    } else if (val > 0) {
      return {
        bg: 'bg-[#DBEAFE]',
        text: 'text-[#1E40AF]',
        border: 'border-[#BFDBFE]',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
        label: `+${fmt(val)}`,
        icon: <TrendingUp className="w-3 h-3 text-blue-600 inline mr-1" />
      };
    } else {
      return {
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#991B1B]',
        border: 'border-[#FECACA]',
        badgeBg: 'bg-red-100 text-red-800 border-red-300',
        label: fmt(val),
        icon: <TrendingDown className="w-3 h-3 text-red-600 inline mr-1" />
      };
    }
  };

  // Collect all items across groups and sort by official inspection sequence:
  // RR, BR, CMR, Wheat, Atta, Sugar, Koil then OMSS and other items with CB
  const allReconciledItems = [];
  Object.values(groupedData || {}).forEach(grpObj => {
    (grpObj?.items || []).forEach(item => {
      allReconciledItems.push(item);
    });
  });

  const sortedReconciledItems = [...allReconciledItems].sort((a, b) => {
    const rankDiff = getInspectionSortRank(a) - getInspectionSortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.shortName || a.commodity).localeCompare(b.shortName || b.commodity);
  });

  const totalVisibleItems = sortedReconciledItems.length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      {/* Single-Line Compact Table Header */}
      <div className="bg-slate-50 px-2.5 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Scale className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide truncate">
            Reconciliation Table
          </h2>
          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded text-[10px] sm:text-[11px] shrink-0">
            {totalVisibleItems} Items
          </span>
        </div>

        {/* Controls: Zero Stock Toggle & Mobile Layout Toggle (Strict Single Line) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zero Stock Toggle Button */}
          {hiddenZeroCount > 0 && (
            <button
              type="button"
              onClick={() => setShowZeroStock(!showZeroStock)}
              className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 border transition tap-bounce ${
                showZeroStock 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
              }`}
              title={showZeroStock ? "Hide commodities with zero stock" : "Show all zero stock commodities"}
            >
              {showZeroStock ? <Eye className="w-3 h-3 text-amber-600" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
              <span>{showZeroStock ? 'Zero Shown' : `Zero (${hiddenZeroCount})`}</span>
            </button>
          )}

          {/* Mobile view toggle (Card vs Table) */}
          <div className="flex sm:hidden bg-slate-200 rounded-lg p-0.5 border border-slate-300">
            <button
              onClick={() => setMobileViewMode('cards')}
              className={`p-1 rounded ${mobileViewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
              title="Mobile 2-Row Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileViewMode('table')}
              className={`p-1 rounded ${mobileViewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
              title="Full Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE-FIRST 2-ROW CARD VIEW (Sorted: RR, BR, CMR, Wheat, Atta, Sugar, Koil, OMSS, other) */}
      <div className={`sm:hidden ${mobileViewMode === 'cards' ? 'block' : 'hidden'} p-2.5 space-y-2`}>
        {sortedReconciledItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No active commodities found.
          </div>
        ) : (
          sortedReconciledItems.map(item => {
            const diffStyle = getDifferenceStyle(item.differenceKg);
            const itemKey = item.id || item.commodity;
            const currentLoose = looseStock[itemKey] ?? looseStock[item.commodity] ?? '';
            const currentBagWeight = item.bagWeight ?? commodityBagWeights[itemKey] ?? commodityBagWeights[item.id] ?? commodityBagWeights[item.commodity] ?? 50.0;

            return (
              <div 
                key={item.commodity}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-2.5 space-y-2"
              >
                {/* Title Line: Commodity Name & Short Badge & Unit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {item.commodity}
                    </span>
                    <span className="text-[10px] font-black text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      {item.shortName || item.commodity}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.unit || 'Kg'}
                  </span>
                </div>

                {/* Sub-item Schemes Pill (if multiple schemes ePOS combined) */}
                {item.subItems && item.subItems.length > 1 && (
                  <div className="text-[9.5px] text-blue-800 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200 font-mono truncate">
                    ePOS: {item.subItems.map(s => `${s.name}: ${fmt(s.kg)}`).join(' | ')}
                  </div>
                )}

                {/* ROW 1: ePOS Stock (Left) | Bag Weight Stepper (Center) | Counted Bags (Right) */}
                <div className="grid grid-cols-12 gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 items-center">
                  {/* Left: ePOS Stock (col-span-4) */}
                  <button
                    type="button"
                    onClick={() => onOpenEditStock && onOpenEditStock(item)}
                    className="col-span-4 text-left group flex flex-col justify-center p-0.5 -m-0.5 rounded hover:bg-blue-100/50 active:bg-blue-200/50 transition"
                    title="Touch to edit ePOS stock or delete schemes"
                  >
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-0.5">
                      <Edit3 className="w-2.5 h-2.5 text-blue-600" />
                      ePOS Stock
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 truncate">
                      {fmt(item.systemStockKg)} <span className="text-[9px] text-slate-400 font-normal">{item.unit || 'kg'}</span>
                    </span>
                  </button>

                  {/* Center: Bag Weight Stepper in 0.1 kg steps (col-span-4) */}
                  <div className="col-span-4 flex flex-col items-center justify-center border-x border-slate-200/80 px-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                      Bag Wt (kg)
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onBagWeightChange && onBagWeightChange(itemKey, Math.max(0.1, Math.round((currentBagWeight - 0.1) * 10) / 10))}
                        className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-800 font-black text-sm tap-bounce shadow-xs"
                        title="Decrease 0.1 kg"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono font-black text-xs text-slate-900 select-none">
                        {Number(currentBagWeight).toFixed(1)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onBagWeightChange && onBagWeightChange(itemKey, Math.min(100, Math.round((currentBagWeight + 0.1) * 10) / 10))}
                        className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-800 font-black text-sm tap-bounce shadow-xs"
                        title="Increase 0.1 kg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Right: Counted Bags (col-span-4) */}
                  <div className="col-span-4 text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Counted Bags
                    </span>
                    <span className="font-mono font-bold text-blue-700 text-xs sm:text-sm">
                      {formatBagsDisplay(item.totalBags)} <span className="text-[10px] font-semibold">bags</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      ({fmt(item.stackStockKg)} kg)
                    </span>
                  </div>
                </div>

                {/* ROW 2: Loose Entry | Total Physical | Difference */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg border items-center bg-slate-50/80 border-slate-200">
                  {/* 1. Loose Entry */}
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5 truncate">
                      Loose ({item.unit || 'kg'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={currentLoose}
                      onChange={(e) => onLooseStockChange(itemKey, e.target.value)}
                      className="w-full text-center py-1 px-1 font-mono text-xs font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* 2. Total Physical */}
                  <div className="text-center px-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Total Physical
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs sm:text-sm block truncate">
                      {fmt(item.totalPhysicalKg)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">{item.unit || 'kg'}</span>
                  </div>

                  {/* 3. Difference */}
                  <div className={`text-right p-1 rounded border ${diffStyle.bg} ${diffStyle.border}`}>
                    <span className="text-[9px] uppercase font-bold text-slate-600 block">
                      Difference
                    </span>
                    <div className={`font-mono font-black text-xs sm:text-sm ${diffStyle.text}`}>
                      {item.differenceKg > 0 ? '+' : ''}{fmt(item.differenceKg)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP & FULL TABLE VIEW */}
      <div className={`overflow-x-auto ${mobileViewMode === 'cards' ? 'hidden sm:block' : 'block'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
              <th className="py-2.5 px-3 font-semibold">Commodity</th>
              <th className="py-2.5 px-3 text-right font-semibold">
                <span className="inline-flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-blue-300" />
                  ePOS Stock
                </span>
              </th>
              <th className="py-2.5 px-3 text-center font-semibold">Bag Wt (kg)</th>
              <th className="py-2.5 px-3 text-right font-semibold">Bags</th>
              <th className="py-2.5 px-3 text-right font-semibold">Stack Stock</th>
              <th className="py-2.5 px-3 text-right font-semibold">Loose Stock</th>
              <th className="py-2.5 px-3 text-right font-semibold">Total Physical</th>
              <th className="py-2.5 px-3 text-right font-semibold">Difference</th>
              <th className="py-2.5 px-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedReconciledItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-slate-500">
                  No active commodities found.
                </td>
              </tr>
            ) : (
              sortedReconciledItems.map(item => {
                const diffStyle = getDifferenceStyle(item.differenceKg);
                const itemKey = item.id || item.commodity;
                const currentLoose = looseStock[itemKey] ?? looseStock[item.commodity] ?? '';
                const currentBagWeight = item.bagWeight ?? commodityBagWeights[itemKey] ?? commodityBagWeights[item.id] ?? commodityBagWeights[item.commodity] ?? 50.0;

                return (
                  <tr 
                    key={item.commodity}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Commodity Name & Unit */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>{item.commodity}</span>
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                          {item.shortName || item.commodity}
                        </span>
                      </div>
                      {item.subItems && item.subItems.length > 1 && (
                        <div className="text-[10px] text-blue-800 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200 mt-1 font-mono inline-block">
                          ePOS: {item.subItems.map(s => `${s.name}: ${fmt(s.kg)}`).join(' | ')}
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono block">Unit: {item.unit || 'Kgs'}</span>
                    </td>

                    {/* ePOS System Stock (Interactive Touch to Edit) */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenEditStock && onOpenEditStock(item)}
                        className="inline-flex flex-col items-end group/btn p-1 -m-1 rounded hover:bg-blue-50 transition"
                        title="Touch to edit ePOS stock or delete schemes"
                      >
                        <span className="font-mono font-bold text-slate-800 group-hover/btn:text-blue-700 text-xs sm:text-sm flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-blue-500 opacity-60 group-hover/btn:opacity-100" />
                          {fmt(item.systemStockKg)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-normal">Touch to edit</span>
                      </button>
                    </td>

                    {/* Bag Weight with +/- 0.1 kg buttons */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-1.5 py-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onBagWeightChange && onBagWeightChange(itemKey, Math.max(0.1, Math.round((currentBagWeight - 0.1) * 10) / 10))}
                          className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-800 font-black text-sm tap-bounce shadow-xs"
                          title="Decrease 0.1 kg"
                        >
                          -
                        </button>
                        <span className="w-11 text-center font-mono font-bold text-xs sm:text-sm text-slate-900 select-none">
                          {Number(currentBagWeight).toFixed(1)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onBagWeightChange && onBagWeightChange(itemKey, Math.min(100, Math.round((currentBagWeight + 0.1) * 10) / 10))}
                          className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-800 font-black text-sm tap-bounce shadow-xs"
                          title="Increase 0.1 kg"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Counted Bags */}
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-bold text-xs sm:text-sm">
                      {item.totalBags > 0 ? `${formatBagsDisplay(item.totalBags)}` : '-'}
                    </td>

                    {/* Stack Stock (Kg) */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 text-xs sm:text-sm">
                      {fmt(item.stackStockKg)}
                    </td>

                    {/* Loose Stock Input */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.0"
                          value={currentLoose}
                          onChange={(e) => onLooseStockChange(itemKey, e.target.value)}
                          className="w-20 text-right py-1 px-1.5 font-mono text-xs font-semibold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-[10px] text-slate-400 ml-1 font-mono">{item.unit || 'kg'}</span>
                      </div>
                    </td>

                    {/* Total Physical (Kg) */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs sm:text-sm">
                      {fmt(item.totalPhysicalKg)}
                    </td>

                    {/* Difference (Kg) with Soft Pastel Background */}
                    <td className={`py-2.5 px-3 text-right font-mono font-black text-xs sm:text-sm border-l border-r ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
                      {item.differenceKg > 0 ? '+' : ''}{fmt(item.differenceKg)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${diffStyle.badgeBg}`}>
                        {diffStyle.icon}
                        {item.differenceKg === 0 ? 'Match' : item.differenceKg > 0 ? 'Excess' : 'Shortage'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
