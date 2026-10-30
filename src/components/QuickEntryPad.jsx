import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Undo2, 
  Layers, 
  Check, 
  Hash, 
  Delete,
  ArrowRight,
  Sparkles,
  X,
  History
} from 'lucide-react';
import { 
  QUICK_STACK_PRESETS,
  formatExpectedBagsWithFraction,
  formatBagsDisplay 
} from '../utils/constants';

export default function QuickEntryPad({
  activeCommodity,
  setActiveCommodity,
  availableCommodities = [],
  globalBagWeight = 50,
  commodityBagWeights = {},
  onAddStack,
  stackHistory = [],
  onDeleteStack,
  commodityTotals = {}
}) {
  const [currentBagsInput, setCurrentBagsInput] = useState('');
  const [historyModalComm, setHistoryModalComm] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const safeBagWeights = commodityBagWeights || {};
  const defaultCommodityWeight = safeBagWeights[activeCommodity?.id] ?? safeBagWeights[activeCommodity?.label] ?? globalBagWeight;
  const [customWeight, setCustomWeight] = useState(defaultCommodityWeight);
  const [useCustomWeight, setUseCustomWeight] = useState(false);
  const [justAddedAnim, setJustAddedAnim] = useState(false);

  // Keep customWeight in sync if bag weights reset or change
  useEffect(() => {
    setCustomWeight(defaultCommodityWeight);
    setUseCustomWeight(false);
  }, [defaultCommodityWeight]);

  const activeWeight = useCustomWeight ? customWeight : defaultCommodityWeight;

  // Evaluate bags count from currentBagsInput (supporting multiplication e.g. "12×4" = 48)
  let currentBagsCount = 0;
  if (currentBagsInput.includes('×')) {
    const parts = currentBagsInput.split('×');
    const h = parseInt(parts[0], 10) || 0;
    const s = parts[1] !== undefined && parts[1] !== '' ? (parseInt(parts[1], 10) || 0) : null;
    if (s !== null) {
      currentBagsCount = h * s;
    } else {
      currentBagsCount = h;
    }
  } else {
    currentBagsCount = parseInt(currentBagsInput, 10) || 0;
  }
  const currentTotalKg = currentBagsCount * activeWeight;

  const handleSelectCommodity = (comm) => {
    setActiveCommodity(comm);
    const commWt = safeBagWeights[comm?.id] ?? safeBagWeights[comm?.label] ?? globalBagWeight;
    setCustomWeight(commWt);
  };

  // Touch and Hold (Long Press) Handlers for Commodity Buttons
  const handleTouchStart = (comm) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      setHistoryModalComm(comm);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCommClick = (comm) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    handleSelectCommodity(comm);
  };

  // Numpad key handlers with multiplication support
  const handleNumpadPress = (digit) => {
    if (currentBagsInput.includes('×')) {
      const parts = currentBagsInput.split('×');
      if (parts[1] && parts[1].length >= 3) return;
      if (parts[1] === '0') {
        setCurrentBagsInput(parts[0] + '×' + digit);
      } else {
        setCurrentBagsInput(prev => prev + digit);
      }
    } else {
      if (currentBagsInput.length >= 4) return;
      if (currentBagsInput === '0' && digit === '0') return;
      if (currentBagsInput === '0') {
        setCurrentBagsInput(digit);
      } else {
        setCurrentBagsInput(prev => prev + digit);
      }
    }
  };

  const handleMultiplyPress = () => {
    if (!currentBagsInput || currentBagsInput === '0') return;
    if (currentBagsInput.includes('×')) return;
    setCurrentBagsInput(prev => prev + '×');
  };

  const handleClear = () => {
    setCurrentBagsInput('');
  };

  const handleBackspace = () => {
    setCurrentBagsInput(prev => {
      if (!prev) return '';
      return prev.slice(0, -1);
    });
  };

  const handleAddPresetDirect = (presetBags) => {
    if (!activeCommodity) return;
    onAddStack({
      commodityId: activeCommodity.id,
      commodityName: activeCommodity.label,
      group: activeCommodity.group,
      bags: presetBags,
      bagWeightKg: activeWeight,
      totalKg: presetBags * activeWeight,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    triggerSuccessAnim();
  };

  const handleCommitStack = () => {
    if (!activeCommodity) return;
    if (currentBagsCount <= 0) return;

    onAddStack({
      commodityId: activeCommodity.id,
      commodityName: activeCommodity.label,
      group: activeCommodity.group,
      bags: currentBagsCount,
      bagWeightKg: activeWeight,
      totalKg: currentTotalKg,
      formula: currentBagsInput.includes('×') ? currentBagsInput : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    setCurrentBagsInput('');
    triggerSuccessAnim();
  };

  const triggerSuccessAnim = () => {
    setJustAddedAnim(true);
    setTimeout(() => setJustAddedAnim(false), 300);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
      {/* Section Header - Single Line with History Button */}
      <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide truncate">
            Stack Entry
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Stack History Button in Top Heading */}
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition tap-bounce shadow-2xs ${
              stackHistory.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Open Stack History Log & Undo"
          >
            <History className={`w-3.5 h-3.5 ${stackHistory.length > 0 ? 'text-white' : 'text-blue-600'}`} />
            <span>History</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              stackHistory.length > 0 ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {stackHistory.length}
            </span>
          </button>

          <span className="hidden xs:inline-block text-[10px] sm:text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200 whitespace-nowrap">
            {availableCommodities.length} Active
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3.5">
        {/* 1. Quick Active Commodity Selector Grid (Compact 2-Row Buttons) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Commodity
            </label>
            <span className="text-[10px] text-slate-500 italic">
              Tap to select • Hold for history
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {availableCommodities.map((comm) => {
              const isSelected = activeCommodity?.id === comm.id;
              const safeTotals = commodityTotals || {};
              const totals = safeTotals[comm.id] || safeTotals[comm.label] || { bags: 0, totalKg: 0 };
              
              // Expected bags with fractions (1/4, 1/2, 3/4), reducing as stacks are counted
              const commBagWt = safeBagWeights[comm?.id] ?? safeBagWeights[comm?.label] ?? globalBagWeight;
              const remainingExpected = formatExpectedBagsWithFraction(comm.systemStockKg, totals.bags, commBagWt);
              const totalExpected = formatExpectedBagsWithFraction(comm.systemStockKg, 0, commBagWt);

              const isExcess = remainingExpected.startsWith('+');
              const isZeroOrQuarter = remainingExpected === '0' || remainingExpected === '¼' || remainingExpected === '1/4';
              
              let remColorClass = '';
              if (isExcess) {
                remColorClass = 'text-red-600 font-black';
              } else if (isZeroOrQuarter && totals.bags > 0) {
                remColorClass = 'text-emerald-600 font-bold';
              } else if (isSelected) {
                remColorClass = 'text-blue-700 font-bold';
              } else {
                remColorClass = 'text-amber-700 font-bold';
              }

              let remDisplay = '';
              if (remainingExpected === '0') {
                remDisplay = '0b';
              } else if (isExcess) {
                remDisplay = `+${remainingExpected.slice(1)}b`;
              } else {
                remDisplay = `${remainingExpected}b`;
              }

              return (
                <button
                  key={comm.id}
                  type="button"
                  onMouseDown={() => handleTouchStart(comm)}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                  onTouchStart={() => handleTouchStart(comm)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setHistoryModalComm(comm);
                  }}
                  onClick={() => handleCommClick(comm)}
                  className={`px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl text-left transition-all tap-bounce border-2 flex flex-col justify-between gap-0.5 sm:gap-1 select-none ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                  title={`${comm.label} - Total: ${totalExpected}b, Balance: ${remDisplay}, Counted: ${totals.bags}b. Hold to view history`}
                >
                  {/* ROW 1: Commodity Label, Total Bags, Balance Bags (Left) & Counted Bags (Right) */}
                  <div className="flex items-center justify-between w-full gap-0.5 sm:gap-1">
                    <div className="flex items-center min-w-0">
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shrink-0 mr-1"></span>
                      )}
                      {/* Commodity Name (e.g. RR or Wheat) */}
                      <span className="font-bold text-xs sm:text-sm leading-tight shrink-0 mr-1 truncate">
                        {comm.shortLabel || comm.label}
                      </span>
                      {/* Tight combo: TotalBags-(BalanceBags) with NO spaces around separator '-' */}
                      <span className="inline-flex items-center shrink-0">
                        <span className={`font-bold text-xs sm:text-sm font-mono leading-tight ${
                          isSelected ? 'text-blue-950' : 'text-slate-900'
                        }`}>
                          {totalExpected}b
                        </span>
                        <span className="text-slate-400 font-mono text-xs leading-tight">
                          -
                        </span>
                        <span className={`font-mono text-[11px] sm:text-xs leading-tight ${remColorClass}`}>
                          ({remDisplay})
                        </span>
                      </span>
                    </div>
                    {/* Counted Bags Badge on Right Side (e.g. 70b in blue background as normal) */}
                    <span className={`shrink-0 font-mono font-bold text-[10.5px] px-1.5 py-0.2 rounded border ${
                      totals.bags > 0 
                        ? 'bg-blue-600 text-white border-blue-700 shadow-2xs' 
                        : 'bg-slate-200/80 text-slate-500 border-slate-300'
                    }`}>
                      {formatBagsDisplay(totals.bags)}b
                    </span>
                  </div>

                  {/* ROW 2: ePOS Stock (Left) & Stack Kg (Right) - Clean without clutter */}
                  <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500">
                    <span className="truncate">
                      ePOS: <strong className="text-slate-700">{comm.systemStockKg !== undefined ? Math.round(comm.systemStockKg).toLocaleString() : '0'}kg</strong>
                    </span>
                    {totals.bags > 0 ? (
                      <span className="font-semibold text-blue-800 shrink-0 ml-1">
                        {totals.totalKg.toLocaleString()}kg
                      </span>
                    ) : (
                      <span className="text-slate-400 shrink-0 ml-1">0kg</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Stack Entry Section (Presets + Numpad) */}
        <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Adding to:
              </span>
              <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                <span>{activeCommodity ? (activeCommodity.shortLabel || activeCommodity.label) : 'Select Commodity'}</span>
                {activeCommodity && (() => {
                  const activeBags = (commodityTotals || {})[activeCommodity.id]?.bags || (commodityTotals || {})[activeCommodity.label]?.bags || 0;
                  const exp = formatExpectedBagsWithFraction(activeCommodity.systemStockKg, activeBags, activeWeight);
                  const isEx = exp.startsWith('+');
                  return (
                    <span 
                      className={`font-mono text-[11px] font-bold ${isEx ? 'text-rose-200 font-black' : 'text-amber-300'}`}
                      title={isEx ? `Excess: +${exp.slice(1)} bags over ePOS stock` : `Balance bags remaining: ${exp} bags`}
                    >
                      (Bal: {exp}b)
                    </span>
                  );
                })()}
              </span>
            </div>

            {/* Bag weight indicator & Total ePOS Bags */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] whitespace-nowrap">Bag Wt:</span>
              <button
                type="button"
                onClick={() => setUseCustomWeight(!useCustomWeight)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  useCustomWeight 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                title="Override standard bag weight for this stack"
              >
                {activeWeight} kg {useCustomWeight ? '(Custom)' : ''}
              </button>
              {useCustomWeight && (
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 50)}
                  className="w-12 text-center text-xs font-mono font-bold bg-white border border-slate-300 rounded px-1 py-0.5"
                />
              )}
              {activeCommodity && (() => {
                const totalActiveBags = formatExpectedBagsWithFraction(activeCommodity.systemStockKg, 0, activeWeight);
                return (
                  <span 
                    className="text-slate-700 font-mono text-[11px] font-bold bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap"
                    title={`Total expected bags in ePOS stock: ${activeCommodity.systemStockKg} kg ÷ ${activeWeight} kg = ${totalActiveBags} bags`}
                  >
                    - Total {totalActiveBags}b
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Quick Presets Row: 10b, 11b, 12b, 13b, 14b, 15b & Partial Bags (+¼b, +½b, +¾b, +1b) */}
          <div className="mb-2 space-y-1">
            <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
              {QUICK_STACK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPresetDirect(preset)}
                  className="py-1 px-0.5 sm:px-1 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-700 hover:text-blue-800 font-mono font-bold text-xs sm:text-sm rounded-lg border border-slate-300 hover:border-blue-400 shadow-2xs transition tap-bounce flex items-center justify-center"
                  title={`Directly add stack of ${preset} bags`}
                >
                  +{preset}b
                </button>
              ))}
            </div>

            {/* Quick Partial / Open Bags (¼b, ½b, ¾b, 1b) */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => handleAddPresetDirect(0.25)}
                className="py-1 px-1 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 font-mono font-bold text-xs rounded-lg border border-amber-300 shadow-2xs transition tap-bounce flex items-center justify-center gap-0.5"
                title={`Add ¼ bag (${(0.25 * activeWeight).toFixed(1)} kg)`}
              >
                <span>+¼b</span>
                <span className="text-[8.5px] text-amber-700 font-normal hidden xs:inline">({(0.25 * activeWeight).toFixed(1)}k)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetDirect(0.5)}
                className="py-1 px-1 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 font-mono font-bold text-xs rounded-lg border border-amber-300 shadow-2xs transition tap-bounce flex items-center justify-center gap-0.5"
                title={`Add ½ bag (${(0.5 * activeWeight).toFixed(1)} kg)`}
              >
                <span>+½b</span>
                <span className="text-[8.5px] text-amber-700 font-normal hidden xs:inline">({(0.5 * activeWeight).toFixed(1)}k)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetDirect(0.75)}
                className="py-1 px-1 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 font-mono font-bold text-xs rounded-lg border border-amber-300 shadow-2xs transition tap-bounce flex items-center justify-center gap-0.5"
                title={`Add ¾ bag (${(0.75 * activeWeight).toFixed(1)} kg)`}
              >
                <span>+¾b</span>
                <span className="text-[8.5px] text-amber-700 font-normal hidden xs:inline">({(0.75 * activeWeight).toFixed(1)}k)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddPresetDirect(1)}
                className="py-1 px-1 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-700 font-mono font-bold text-xs rounded-lg border border-slate-300 hover:border-blue-400 shadow-2xs transition tap-bounce flex items-center justify-center gap-0.5"
                title={`Add 1 bag (${activeWeight} kg)`}
              >
                <span>+1b</span>
                <span className="text-[8.5px] text-slate-500 font-normal hidden xs:inline">({activeWeight}k)</span>
              </button>
            </div>
          </div>

          {/* Active Stack Calculation Display */}
          <div className={`p-2.5 sm:p-3 rounded-lg border transition-all mb-2.5 ${
            justAddedAnim 
              ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300' 
              : 'bg-slate-900 text-white border-slate-800 shadow-inner'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Stack Calculation</span>
                  {currentBagsInput.includes('×') && (
                    <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/40">
                      Multi: {currentBagsInput}
                    </span>
                  )}
                </div>
                <div className="text-base sm:text-lg font-mono font-black tracking-tight truncate">
                  {currentBagsInput.includes('×') ? (
                    <>
                      <span className={justAddedAnim ? 'text-emerald-900' : 'text-amber-400'}>
                        {currentBagsInput}
                      </span>
                      <span className="text-xs font-sans font-medium text-slate-400 mx-1">
                        (= {currentBagsCount}b) ×
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={justAddedAnim ? 'text-emerald-900' : 'text-amber-400'}>
                        {currentBagsCount}
                      </span>
                      <span className="text-xs font-sans font-medium text-slate-400 mx-1">bags ×</span>
                    </>
                  )}
                  <span className={justAddedAnim ? 'text-emerald-900' : 'text-slate-300'}>
                    {activeWeight}kg
                  </span>
                  <span className="text-xs font-sans font-medium text-slate-400 mx-1">=</span>
                  <span className={justAddedAnim ? 'text-emerald-950 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                    {currentTotalKg.toLocaleString()} kg
                  </span>
                </div>
              </div>

              {/* Add Stack Button */}
              <button
                type="button"
                onClick={handleCommitStack}
                disabled={currentBagsCount <= 0 || !activeCommodity}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow transition tap-bounce flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stack</span>
              </button>
            </div>
          </div>

          {/* Standard 3-Column Phonepad Layout */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumpadPress(num.toString())}
                className="h-12 bg-white hover:bg-slate-100 active:bg-blue-50 text-slate-800 font-mono font-bold text-lg rounded-xl border border-slate-300 shadow-xs transition tap-bounce flex items-center justify-center"
              >
                {num}
              </button>
            ))}

            {/* Multiply Button (Replaces Clear for 12 height × 4 stacks) */}
            <button
              type="button"
              onClick={handleMultiplyPress}
              className="h-12 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 font-bold text-xl rounded-xl border border-amber-300 shadow-xs transition tap-bounce flex items-center justify-center"
              title="Multiply height × stacks (e.g. 12 × 4)"
            >
              ×
            </button>

            {/* Zero */}
            <button
              type="button"
              onClick={() => handleNumpadPress('0')}
              className="h-12 bg-white hover:bg-slate-100 active:bg-blue-50 text-slate-800 font-mono font-bold text-lg rounded-xl border border-slate-300 shadow-xs transition tap-bounce flex items-center justify-center"
            >
              0
            </button>

            {/* Backspace */}
            <button
              type="button"
              onClick={handleBackspace}
              onDoubleClick={handleClear}
              className="h-12 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition tap-bounce flex items-center justify-center"
              title="Backspace (Double tap to clear)"
            >
              <Delete className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Global Stack History & Instant Undo Modal (Opened via Heading Button) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col overflow-hidden max-h-[85vh]">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Stack History Log</h3>
                  <p className="text-[10px] text-slate-400">{stackHistory.length} stacks recorded (latest on top)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition tap-bounce"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Summary Banner */}
            {stackHistory.length > 0 && (() => {
              const totalRecordedBags = stackHistory.reduce((sum, s) => sum + (s.bags || 0), 0);
              const totalRecordedKg = stackHistory.reduce((sum, s) => sum + (s.totalKg || 0), 0);
              return (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-500 font-sans">Total Counted: </span>
                    <strong className="text-blue-900 font-bold">{formatBagsDisplay(totalRecordedBags)} bags</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">Total Weight: </span>
                    <strong className="text-slate-900 font-bold">{totalRecordedKg.toLocaleString()} kg</strong>
                  </div>
                </div>
              );
            })()}

            {/* Stacks List */}
            <div className="p-3 overflow-y-auto max-h-80 divide-y divide-slate-100">
              {stackHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No stacks recorded yet. Select a commodity and enter bag counts via presets or numpad.
                </div>
              ) : (
                stackHistory.map((stack, idx) => {
                  const stackIndex = stackHistory.length - idx;
                  return (
                    <div 
                      key={stack.id}
                      className="py-2.5 px-1 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-slate-200">
                          #{stackIndex}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{stack.commodityName}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono shrink-0">
                              @{stack.timestamp}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            <span className="font-bold text-blue-700">{formatBagsDisplay(stack.bags)} bags</span>
                            {stack.formula ? (
                              <span className="text-amber-700 font-semibold"> ({stack.formula})</span>
                            ) : null}
                            <span className="text-slate-400"> × {stack.bagWeightKg}kg = </span>
                            <span className="font-bold text-slate-900">{stack.totalKg.toLocaleString()} kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Instant Undo / Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDeleteStack(stack.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition tap-bounce shrink-0 ml-2"
                        title="Delete / Undo this stack entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">Tap trash icon to undo entry</span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition tap-bounce"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touch & Hold Commodity Stack History Modal */}
      {historyModalComm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm flex flex-col overflow-hidden max-h-[85vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">
                  {historyModalComm.label || historyModalComm.shortLabel}
                </h3>
                <p className="text-[10px] text-slate-300">Stack History (Touch & Hold Review)</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalComm(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick summary banner for this commodity */}
            {(() => {
              const commStacks = stackHistory.filter(s => 
                s.commodityId === historyModalComm.id ||
                s.commodityName === historyModalComm.label ||
                s.commodityName === historyModalComm.shortLabel
              );
              const totalBags = commStacks.reduce((sum, s) => sum + s.bags, 0);
              const totalKg = commStacks.reduce((sum, s) => sum + s.totalKg, 0);
              const commBagWt = commodityBagWeights[historyModalComm.id] ?? commodityBagWeights[historyModalComm.label] ?? globalBagWeight;
              const remainingExpected = formatExpectedBagsWithFraction(historyModalComm.systemStockKg, totalBags, commBagWt);

              return (
                <>
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-600 font-medium">Counted: </span>
                      <strong className="text-blue-900 font-mono">{formatBagsDisplay(totalBags)}b</strong>
                      <span className="text-slate-500 font-mono text-[11px]"> ({totalKg.toLocaleString()} kg)</span>
                    </div>
                    <div>
                      <span className="text-slate-600 font-medium">{remainingExpected.startsWith('+') ? 'Excess: ' : 'Expected Rem: '}</span>
                      <strong className={`font-mono ${
                        remainingExpected.startsWith('+')
                          ? 'text-red-600 font-black'
                          : remainingExpected === '0' && totalBags > 0
                          ? 'text-emerald-700 font-black'
                          : 'text-amber-700 font-bold'
                      }`}>
                        {remainingExpected}b
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 overflow-y-auto max-h-64 divide-y divide-slate-100">
                    {commStacks.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No stacks entered yet for this commodity.
                      </div>
                    ) : (
                      commStacks.map((stack, idx) => (
                        <div key={stack.id} className="py-2 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Stack #{commStacks.length - idx}</span>
                              <span className="text-[10px] text-slate-400 font-mono">@{stack.timestamp}</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-600">
                              <strong className="text-blue-700">{formatBagsDisplay(stack.bags)} bags</strong>
                              {stack.formula ? (
                                <span className="text-amber-700 font-semibold"> ({stack.formula})</span>
                              ) : null} × {stack.bagWeightKg}kg = <strong className="text-slate-900">{stack.totalKg.toLocaleString()} kg</strong>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteStack(stack.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete this stack entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setHistoryModalComm(null)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition tap-bounce"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
