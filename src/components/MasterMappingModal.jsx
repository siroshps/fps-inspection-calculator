import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  SlidersHorizontal, 
  Info, 
  Search, 
  Table as TableIcon, 
  FileSpreadsheet,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  Download,
  HardDrive,
  Sparkles,
  ArrowRight,
  Share2,
  Copy
} from 'lucide-react';
import { MASTER_GROUPS, CSV_COMMODITY_MAPPINGS } from '../utils/constants';

export default function MasterMappingModal({
  isOpen,
  onClose,
  mappings,
  onAddMapping,
  onUpdateMapping,
  onDeleteMapping,
  onResetToDefaults
}) {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' | 'custom' | 'updates'
  const [csvSearch, setCsvSearch] = useState('');
  const [newCommodityName, setNewCommodityName] = useState('');
  const [newGroup, setNewGroup] = useState(MASTER_GROUPS.RICE);
  const [newDefaultBagKg, setNewDefaultBagKg] = useState(50);
  const [newAliases, setNewAliases] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // App Update & PWA states
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Capture beforeinstallprompt for PWA installation
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Filter CSV mappings
  const filteredCsv = useMemo(() => {
    if (!csvSearch.trim()) return CSV_COMMODITY_MAPPINGS;
    const q = csvSearch.trim().toLowerCase();
    return CSV_COMMODITY_MAPPINGS.filter(row => 
      row.commodity.toLowerCase().includes(q) ||
      row.inspectionGroup.toLowerCase().includes(q) ||
      row.shortName.toLowerCase().includes(q) ||
      row.unit.toLowerCase().includes(q)
    );
  }, [csvSearch]);

  if (!isOpen) return null;

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newCommodityName.trim()) return;

    const aliasesArr = newAliases
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);
    
    if (!aliasesArr.includes(newCommodityName.trim().toLowerCase())) {
      aliasesArr.push(newCommodityName.trim().toLowerCase());
    }

    onAddMapping({
      name: newCommodityName.trim(),
      group: newGroup,
      defaultBagKg: Number(newDefaultBagKg) || 50,
      aliases: aliasesArr
    });

    setNewCommodityName('');
    setNewAliases('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  /**
   * Complete Cache Clearing & App Updation Routine
   */
  const handleUpdateAppAndClearCache = async () => {
    if (!window.confirm('Update App and clear browser cache?\n\nThis will unregister any stale service workers, clear Cache Storage, and reload the latest version from the server.\n\nYour entered physical bag counts will remain safe.')) {
      return;
    }

    setIsUpdating(true);
    setUpdateStatus('Clearing service workers and cache storage...');

    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      // 2. Clear Cache Storage API
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // 3. Clear session storage
      try {
        sessionStorage.clear();
      } catch (e) {}

      setUpdateStatus('Reloading latest version from server...');

      // 4. Force browser to reload bypassing cache
      setTimeout(() => {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('v', Date.now().toString());
        window.location.replace(url.toString());
      }, 400);
    } catch (err) {
      console.error('Update App / Clear Cache error:', err);
      window.location.reload(true);
    }
  };

  /**
   * PWA Install Prompt Trigger
   */
  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      alert('To install the app, tap your browser menu (⋮ on Android/Chrome or Share on iPhone/Safari) and tap "Add to Home screen" or "Install App".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // App Sharing state & handlers
  const appUrl = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : 'https://fps-inspection-calculator.vercel.app';

  const shareText = `📱 FPS Inspection WebApp for Kerala

Streamline your Fair Price Shop inspections with this all-in-one digital assistant!

🔹 Stock Consolidation & Fast Stack Counting
🔹 Precision Bag Weight Control & Manual Stock Adjustments
🔹 Instant PDF Inspection Report Generation

Built to save time and increase accuracy during shop inspections.

🔗 Access App: ${appUrl}

👤 Developer: Sirosh P.S (Rationing Inspector, Ponnani Firka)`;

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FPS Inspection WebApp for Kerala',
          text: shareText,
          url: appUrl
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Navigator share error, falling back to copy:', err);
        } else {
          return;
        }
      }
    }
    handleCopyShareText();
  };

  const handleCopyShareText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (e) {
      console.error('Copy to clipboard failed:', e);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <h3 id="modal-title" className="font-bold text-sm sm:text-base truncate">App Settings & Commodity Rules</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">PWA Updates, Cache Clearing & Official Commodity Mapping</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-3 sm:px-5 pt-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('csv')}
              className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'csv'
                  ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV Rules ({CSV_COMMODITY_MAPPINGS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'custom'
                  ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Inspection Groups ({mappings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('updates')}
              className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap relative ${
                activeTab === 'updates'
                  ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Update App & PWA</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </button>
          </div>

          {activeTab === 'csv' && (
            <div className="relative mb-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
              <input
                type="text"
                value={csvSearch}
                onChange={(e) => setCsvSearch(e.target.value)}
                placeholder="Search CSV..."
                className="pl-7 pr-2 py-1 text-xs bg-white border border-slate-300 rounded-lg w-32 sm:w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'csv' ? (
            /* Tab 1: CSV Table View */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  Showing {filteredCsv.length} of {CSV_COMMODITY_MAPPINGS.length} Mapped Commodities
                </span>
                <span className="text-[11px] text-slate-400">
                  Source: Department Inspection CSV
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">ePOS Commodity Name</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3">Inspection Group</th>
                      <th className="py-2 px-3">Short Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredCsv.map((row, idx) => {
                      const isRice = ['Raw Rice', 'Boiled Rice', 'CMR', 'OMSS'].includes(row.inspectionGroup);
                      return (
                        <tr key={row.commodity} className="hover:bg-blue-50/50">
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 font-sans">{row.commodity}</td>
                          <td className="py-2 px-3 text-slate-600">{row.unit}</td>
                          <td className="py-2 px-3 font-sans">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isRice ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}>
                              {row.inspectionGroup}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-blue-700 font-sans">{row.shortName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'custom' ? (
            /* Tab 2: Custom Rules & Bag Weight Setup */
            <div className="space-y-4">
              {/* Add New Commodity Rule Form */}
              <form onSubmit={handleAddNew} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Custom Mapping Rule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">Commodity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Special Ration"
                      value={newCommodityName}
                      onChange={(e) => setNewCommodityName(e.target.value)}
                      className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">Master Category</label>
                    <select
                      value={newGroup}
                      onChange={(e) => setNewGroup(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={MASTER_GROUPS.RICE}>{MASTER_GROUPS.RICE}</option>
                      <option value={MASTER_GROUPS.WHEAT}>{MASTER_GROUPS.WHEAT}</option>
                      <option value={MASTER_GROUPS.ATTA}>{MASTER_GROUPS.ATTA}</option>
                      <option value={MASTER_GROUPS.OTHER}>{MASTER_GROUPS.OTHER}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">Default Bag Wt (Kg)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newDefaultBagKg}
                      onChange={(e) => setNewDefaultBagKg(e.target.value)}
                      className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-2.5">
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Matching Aliases / Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. fort.br, fortified boiled, br special"
                    value={newAliases}
                    onChange={(e) => setNewAliases(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition tap-bounce flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Rule</span>
                  </button>
                </div>
              </form>

              {/* Active Groups & Default Bag Weights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Inspection Groups ({mappings.length})
                  </span>
                  <button
                    type="button"
                    onClick={onResetToDefaults}
                    className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium"
                    title="Restore default Kerala PDS commodity mappings"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Defaults
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                  {mappings.map((mapping) => (
                    <div key={mapping.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">{mapping.name}</span>
                          {mapping.shortName && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-mono">
                              {mapping.shortName}
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            mapping.group === MASTER_GROUPS.RICE
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : mapping.group === MASTER_GROUPS.WHEAT
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : mapping.group === MASTER_GROUPS.ATTA
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {mapping.group}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {mapping.defaultBagKg} {mapping.unit === 'Ltrs' ? 'ltr/can' : mapping.unit === 'Pkts' ? 'pkts/bundle' : 'kg/bag'}
                          </span>
                        </div>
                        {mapping.aliases && mapping.aliases.length > 0 && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                            Mapped from: {mapping.aliases.slice(0, 4).join(', ')}
                            {mapping.aliases.length > 4 ? ` +${mapping.aliases.length - 4} more` : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDeleteMapping(mapping.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 3: Update App & PWA Settings */
            <div className="space-y-4">
              {/* 1. Clear Cache & Update Card */}
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-3">
                <div className="flex items-center gap-2 text-amber-900">
                  <RefreshCw className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Update App & Clear Cache</h4>
                    <p className="text-xs text-amber-800">
                      Instantly purge cached files, unregister old service workers, and reload the newest release from the server.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-amber-900 bg-white/80 p-2.5 rounded-lg border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safe Update: Physical counts & shop settings in local storage are preserved.</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Use this button if you noticed recent code changes, feature additions, or if your browser is displaying an older cached version.
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUpdateAppAndClearCache}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow transition tap-bounce flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                    <span>{isUpdating ? 'Updating App...' : 'Update App / Clear Cache Now'}</span>
                  </button>

                  {updateStatus && (
                    <span className="text-xs font-mono text-amber-900 font-semibold animate-pulse">
                      {updateStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Web App Manifest & PWA Installation Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Progressive Web App (PWA)</h4>
                      <p className="text-xs text-slate-600">Install to your mobile phone or desktop for quick access and full-screen view</p>
                    </div>
                  </div>

                  {isStandalone ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      App Installed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleInstallPwa}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition tap-bounce flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install App</span>
                    </button>
                  )}
                </div>

                {/* Installation Instructions by Device */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">📱 Android (Chrome / Edge):</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Tap the <strong>three dots (⋮)</strong> at the top right of your browser, then tap <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong>.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">🍎 iPhone / iPad (Safari):</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Tap the <strong>Share button</strong> (square with upward arrow) at bottom of Safari, scroll down, and tap <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Share App with Others Card */}
              <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-indigo-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Share App to Others</h4>
                      <p className="text-xs text-slate-600">Share with fellow Rationing Inspectors, TSOs & field officers</p>
                    </div>
                  </div>
                </div>

                {/* Text Preview Box */}
                <div className="bg-white/95 p-3 rounded-xl border border-blue-200/80 text-[11px] text-slate-700 leading-relaxed whitespace-pre-line shadow-xs font-sans">
                  {shareText}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareApp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition tap-bounce flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share App to Others</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition tap-bounce flex items-center gap-1.5"
                  >
                    <span>💬 Share via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyShareText}
                    className={`px-3 py-2 font-bold text-xs rounded-xl border transition tap-bounce flex items-center gap-1.5 ${
                      copySuccess 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1 min-w-0">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">Settings & rules automatically reconcile physical stock against ePOS.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition tap-bounce shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
