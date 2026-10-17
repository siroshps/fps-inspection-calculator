import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2,
  Boxes, 
  Layers, 
  Scale, 
  FileText, 
  Download, 
  Printer, 
  RotateCcw, 
  SlidersHorizontal,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Calculator
} from 'lucide-react';

import Header from './components/Header';
import QuickEntryPad from './components/QuickEntryPad';
import ReconciliationTable from './components/ReconciliationTable';
import StickyBottomSummary from './components/StickyBottomSummary';
import MasterMappingModal from './components/MasterMappingModal';
import InspectionMetadataModal from './components/InspectionMetadataModal';
import EditEposStockModal from './components/EditEposStockModal';
import InspectionPaperSummary from './components/InspectionPaperSummary';
import FetchErrorModal from './components/FetchErrorModal';

import { useLocalStorage } from './hooks/useLocalStorage';
import { useCommodityMapping } from './hooks/useCommodityMapping';
import { 
  DEFAULT_BAG_WEIGHT, 
  QUICK_COMMODITIES, 
  FALLBACK_MOCK_STOCK,
  MASTER_GROUPS,
  getInspectionSortRank,
  formatBagsDisplay
} from './utils/constants';

export default function App() {
  // --- Persistent States ---
  const [fpsId, setFpsId] = useLocalStorage('kerala_fps_id', '2056003');
  const [globalBagWeight, setGlobalBagWeight] = useLocalStorage('kerala_fps_bag_weight', DEFAULT_BAG_WEIGHT);
  const [commodityBagWeights, setCommodityBagWeights] = useLocalStorage('kerala_fps_commodity_bag_weights', {});
  const [stackHistory, setStackHistory] = useLocalStorage('kerala_fps_stack_history', []);
  const [looseStock, setLooseStock] = useLocalStorage('kerala_fps_loose_stock', {});
  const [stockItems, setStockItems] = useLocalStorage('kerala_fps_stock_items', []);
  const [metadata, setMetadata] = useLocalStorage('kerala_fps_metadata', {
    shop_name: 'ARD 2056003 (Ponnani Firka)',
    district: 'Malappuram',
    tso: 'Ponnani',
    inspectorName: 'Sirosh P.S',
    inspectorDesignation: 'Rationing Inspector, Ponnani Firka',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionTime: new Date().toTimeString().slice(0, 5),
    remarks: 'Physical stock verified against ePOS stock balance. Stacks arranged systematically.'
  });

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('epos_live');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('entry'); // 'entry' | 'table' | 'summary'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeCommodity, setActiveCommodity] = useState(QUICK_COMMODITIES[0]);
  const [toastMessage, setToastMessage] = useState(null);
  const [showZeroStock, setShowZeroStock] = useState(false); // Default to hiding zero stock items
  const [mergeEquivalents, setMergeEquivalents] = useState(true); // Default to merging equivalent commodities (Fort.BR = BR F SPL, etc.)
  const [editingGroupItem, setEditingGroupItem] = useState(null); // Active group being edited for ePOS stock
  const [fetchProgress, setFetchProgress] = useState(null); // { attempt, maxAttempts, message }
  const [fetchErrorModal, setFetchErrorModal] = useState(null); // { fpsId, errorMsg, cachedData }

  // Commodity mapping hook
  const {
    mappings,
    findMapping,
    updateMapping,
    addMapping,
    deleteMapping,
    resetToDefaults
  } = useCommodityMapping();

  // Dynamic available commodities (prioritizes active items, merged if mergeEquivalents is active)
  const availableCommodities = useMemo(() => {
    const rawActive = (stockItems || []).filter(item => (item.system_stock_kg || 0) > 0);
    
    if (rawActive.length === 0) {
      return QUICK_COMMODITIES;
    }

    if (!mergeEquivalents) {
      return rawActive.map(item => {
        const mapping = findMapping(item.commodity);
        return {
          id: item.commodity.toLowerCase().replace(/\s+/g, '_'),
          label: item.commodity,
          shortLabel: mapping?.shortName || item.commodity,
          inspectionGroup: mapping?.inspectionGroup || item.commodity,
          group: mapping?.group || MASTER_GROUPS.OTHER,
          systemStockKg: item.system_stock_kg,
          unit: item.unit || mapping?.unit || 'Kgs',
          color: mapping?.color || 'blue',
          isRice: !!mapping?.isRice
        };
      });
    }

    // Merged Canonical Commodities based on CSV Inspection Groups
    const mergedMap = new Map();
    rawActive.forEach(item => {
      const mapping = findMapping(item.commodity);
      const canonicalId = mapping ? mapping.id : item.commodity.toLowerCase().replace(/\s+/g, '_');
      const canonicalName = mapping ? (mapping.shortName ? `${mapping.name} (${mapping.shortName})` : mapping.name) : item.commodity;
      const canonicalShortLabel = mapping?.shortName || mapping?.name || item.commodity;
      const canonicalGroup = mapping ? mapping.group : MASTER_GROUPS.OTHER;
      const unit = mapping?.unit || item.unit || 'Kgs';
      const color = mapping?.color || 'blue';

      if (!mergedMap.has(canonicalId)) {
        mergedMap.set(canonicalId, {
          id: canonicalId,
          label: canonicalName,
          shortLabel: canonicalShortLabel,
          inspectionGroup: mapping?.inspectionGroup || mapping?.name || canonicalName,
          group: canonicalGroup,
          systemStockKg: 0,
          unit: unit,
          color: color,
          isRice: !!mapping?.isRice,
          subItems: []
        });
      }

      const existing = mergedMap.get(canonicalId);
      existing.systemStockKg += (item.system_stock_kg || 0);
      existing.subItems.push({ name: item.commodity, kg: item.system_stock_kg, unit: item.unit });
    });

    const list = Array.from(mergedMap.values());
    list.sort((a, b) => {
      const rankDiff = getInspectionSortRank(a) - getInspectionSortRank(b);
      if (rankDiff !== 0) return rankDiff;
      return (a.shortLabel || a.label).localeCompare(b.shortLabel || b.label);
    });
    return list;
  }, [stockItems, findMapping, mergeEquivalents]);

  // Keep active commodity in sync
  useEffect(() => {
    if (availableCommodities && availableCommodities.length > 0) {
      const exists = availableCommodities.some(c => c.id === activeCommodity?.id);
      if (!exists) {
        setActiveCommodity(availableCommodities[0]);
      }
    }
  }, [availableCommodities]);

  // Network online/offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ensure default inspector name is Sirosh P.S (migrates legacy K. Suresh Kumar or empty)
  useEffect(() => {
    if (!metadata?.inspectorName || 
        metadata?.inspectorName === 'K. Suresh Kumar' || 
        metadata?.inspectorName === 'K Sureshkumar' ||
        metadata?.inspectorName === 'K. Sureshkumar') {
      setMetadata(prev => ({
        ...prev,
        inspectorName: 'Sirosh P.S'
      }));
    }
  }, [metadata?.inspectorName, setMetadata]);

  // Show toast notification
  const showToast = useCallback((msg, type = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // --- Resilient Multi-Attempt ePOS Fetch Engine ---
  const fetchStockData = useCallback(async (targetFpsId, options = {}) => {
    const { 
      forceRefresh = true, 
      maxAttempts = 3, 
      allowMock = false 
    } = options;
    const cleanId = String(targetFpsId || fpsId).trim();
    if (!cleanId) return;

    setIsLoading(true);
    setFetchErrorModal(null);
    let lastError = null;

    // Retry loop across attempts
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      setFetchProgress({
        attempt,
        maxAttempts,
        message: attempt === 1 
          ? `Connecting to Kerala ePOS server (Attempt 1/${maxAttempts})...`
          : attempt === 2
          ? `ePOS server slow, retrying (Attempt 2/${maxAttempts})...`
          : `Final attempt to reach ePOS portal (Attempt 3/${maxAttempts})...`
      });

      const controller = new AbortController();
      // 14 seconds per attempt (matches serverless function execution window)
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      try {
        const response = await fetch('/api/fetch-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fps_id: cleanId, 
            filter_zero: true,
            force_refresh: forceRefresh || attempt > 1,
            allow_mock: allowMock
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // 1. Genuine live epos data returned
        if (data && data.items && data.items.length > 0 && data.source === 'epos_live') {
          setStockItems(data.items);
          setDataSource('epos_live');
          setMetadata(prev => ({
            ...prev,
            shop_name: data.shop_name || `ARD ${cleanId}`,
            district: data.district || prev.district || 'Malappuram',
            tso: data.tso || prev.tso || 'Ponnani'
          }));
          
          // Save to verified local cache for offline inspection survival
          try {
            localStorage.setItem(`kerala_fps_verified_${cleanId}`, JSON.stringify({
              items: data.items,
              shop_name: data.shop_name,
              district: data.district,
              tso: data.tso,
              savedAt: new Date().toISOString()
            }));
          } catch (e) {
            console.warn('LocalStorage save failed:', e);
          }

          showToast(`Live ePOS stock fetched (${data.items.length} active commodities)`, 'success');
          setFetchProgress(null);
          setIsLoading(false);
          return;
        }

        // 2. Explicit demo mock data (only when user requested allowMock)
        if (data && data.items && data.items.length > 0 && allowMock) {
          setStockItems(data.items);
          setDataSource('mock_fallback');
          showToast(`Loaded sample demo stock for ARD ${cleanId}`, 'warning');
          setFetchProgress(null);
          setIsLoading(false);
          return;
        }

        // 3. Server reported failure
        throw new Error(data.message || 'ePOS server returned empty report');

      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
        console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, err);
        
        // Pause briefly before next attempt
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    }

    // If ALL attempts failed:
    setIsLoading(false);
    setFetchProgress(null);

    // Retrieve any previously verified live cache
    let cachedLive = null;
    try {
      const raw = localStorage.getItem(`kerala_fps_verified_${cleanId}`);
      if (raw) cachedLive = JSON.parse(raw);
    } catch (e) {}

    // NEVER silently overwrite real data with fake mock data! Show interactive resolution modal
    setFetchErrorModal({
      fpsId: cleanId,
      errorMsg: lastError?.name === 'AbortError' 
        ? 'Connection timed out (ePOS server was slow or mobile signal weak)' 
        : (lastError?.message || 'Unable to connect to Kerala ePOS portal'),
      cachedData: cachedLive
    });

    showToast(`ePOS portal unresponsive after ${maxAttempts} attempts. Inspection data kept safe.`, 'warning');
  }, [fpsId, setMetadata, setStockItems, showToast]);

  const handleUseCachedStock = useCallback((cached) => {
    if (!cached || !cached.items) return;
    setStockItems(cached.items);
    setDataSource('verified_cache');
    if (cached.shop_name) {
      setMetadata(prev => ({
        ...prev,
        shop_name: cached.shop_name,
        district: cached.district || prev.district,
        tso: cached.tso || prev.tso
      }));
    }
    setFetchErrorModal(null);
    showToast(`Loaded verified live stock for ARD ${cached.fpsId || fpsId} (${cached.items.length} commodities)`, 'info');
  }, [fpsId, setMetadata, setStockItems, showToast]);

  const handleManualEntryFallback = useCallback(() => {
    setFetchErrorModal(null);
    setActiveTab('table');
    showToast('Edit ePOS closing balance directly in the reconcile table.', 'info');
  }, [showToast]);

  const handleLoadDemoFallback = useCallback(() => {
    fetchStockData(fpsId, { allowMock: true, maxAttempts: 1 });
    setFetchErrorModal(null);
  }, [fpsId, fetchStockData]);

  // Initial load if no stock items exist
  useEffect(() => {
    if (!stockItems || stockItems.length === 0) {
      fetchStockData(fpsId, { forceRefresh: false, maxAttempts: 2, allowMock: false });
    }
  }, []);

  // --- Stack Entry Management ---
  const handleAddStack = useCallback((newStack) => {
    const stackWithId = {
      ...newStack,
      id: `stack-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    setStackHistory(prev => [stackWithId, ...prev]);
    showToast(`Added ${formatBagsDisplay(newStack.bags)} bags of ${newStack.commodityName} (${newStack.totalKg.toLocaleString()} kg)`, 'success');
  }, [setStackHistory, showToast]);

  const handleDeleteStack = useCallback((stackId) => {
    const target = stackHistory.find(s => s.id === stackId);
    setStackHistory(prev => prev.filter(s => s.id !== stackId));
    if (target) {
      showToast(`Removed stack of ${formatBagsDisplay(target.bags)} bags of ${target.commodityName}`, 'info');
    }
  }, [stackHistory, setStackHistory, showToast]);

  const handleLooseStockChange = useCallback((commodityKey, value) => {
    setLooseStock(prev => ({
      ...prev,
      [commodityKey]: value
    }));
  }, [setLooseStock]);

  const handleBagWeightChange = useCallback((commodityKey, value) => {
    const rounded = Math.round(Math.max(0.1, Math.min(100, parseFloat(value) || 50)) * 10) / 10;
    setCommodityBagWeights(prev => ({
      ...prev,
      [commodityKey]: rounded
    }));
  }, [setCommodityBagWeights]);

  const handleResetAudit = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all physical bag counts, loose stock, and reset all bag weights to 50kg? (ePOS stock will remain intact)')) {
      setStackHistory([]);
      setLooseStock({});
      setCommodityBagWeights({});
      setGlobalBagWeight(50);
      showToast('All physical counts, loose stock, and bag weights reset to 50kg.', 'info');
    }
  }, [setStackHistory, setLooseStock, setCommodityBagWeights, setGlobalBagWeight, showToast]);

  // --- Update ePOS Stock & Closing Balance from Reconcile Table ---
  const handleSaveGroupStock = useCallback((updatedSubItems, deletedNames = []) => {
    if (!editingGroupItem) return;

    setStockItems(prev => {
      const deleteSet = new Set(deletedNames.map(n => n.toLowerCase().trim()));
      // 1. Filter out deleted items
      let updated = prev.filter(item => !deleteSet.has(item.commodity.toLowerCase().trim()));

      // 2. Update existing items or insert newly added ones
      updatedSubItems.forEach(sub => {
        const subName = sub.name.trim();
        const newKg = Math.max(0, parseFloat(sub.kg) || 0);
        const idx = updated.findIndex(item => item.commodity.toLowerCase().trim() === subName.toLowerCase());

        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            system_stock_kg: newKg
          };
        } else {
          updated.push({
            commodity: subName,
            unit: sub.unit || editingGroupItem.unit || 'Kgs',
            system_stock_kg: newKg,
            issued_qty: 0
          });
        }
      });

      return updated;
    });

    showToast(`Updated ePOS stock for ${editingGroupItem.commodity}`, 'success');
  }, [editingGroupItem, setStockItems, showToast]);

  // --- Totals per Quick Commodity Button ---
  const commodityTotals = useMemo(() => {
    const map = {};
    availableCommodities.forEach(c => {
      map[c.id] = { bags: 0, totalKg: 0 };
      map[c.label] = { bags: 0, totalKg: 0 };
      if (c.shortLabel) map[c.shortLabel] = { bags: 0, totalKg: 0 };
      if (c.inspectionGroup) map[c.inspectionGroup] = { bags: 0, totalKg: 0 };
    });

    stackHistory.forEach(s => {
      let matched = false;
      if (map[s.commodityId]) {
        map[s.commodityId].bags += s.bags;
        map[s.commodityId].totalKg += s.totalKg;
        matched = true;
      }
      if (map[s.commodityName]) {
        map[s.commodityName].bags += s.bags;
        map[s.commodityName].totalKg += s.totalKg;
        matched = true;
      }
      if (mergeEquivalents) {
        const pMap = findMapping(s.commodityName);
        if (pMap && map[pMap.id] && pMap.id !== s.commodityId) {
          map[pMap.id].bags += s.bags;
          map[pMap.id].totalKg += s.totalKg;
        }
      }
    });
    return map;
  }, [stackHistory, availableCommodities, mergeEquivalents, findMapping]);

  // --- Reconcile Engine & Grouping (Official CSV Commodity Mapping & Summary for Physical Calculation) ---
  const { groupedData, totalRiceSummary, hiddenZeroCount } = useMemo(() => {
    const groups = {
      [MASTER_GROUPS.RICE]: { items: [], totals: { systemStockKg: 0, totalBags: 0, stackStockKg: 0, looseKg: 0, totalPhysicalKg: 0, differenceKg: 0 } },
      [MASTER_GROUPS.WHEAT]: { items: [], totals: { systemStockKg: 0, totalBags: 0, stackStockKg: 0, looseKg: 0, totalPhysicalKg: 0, differenceKg: 0 } },
      [MASTER_GROUPS.ATTA]: { items: [], totals: { systemStockKg: 0, totalBags: 0, stackStockKg: 0, looseKg: 0, totalPhysicalKg: 0, differenceKg: 0 } },
      [MASTER_GROUPS.OTHER]: { items: [], totals: { systemStockKg: 0, totalBags: 0, stackStockKg: 0, looseKg: 0, totalPhysicalKg: 0, differenceKg: 0 } }
    };

    let zeroCount = 0;

    // Physical stacks map: commodityName / mappedId -> { bags, stackKg }
    const physicalByCommodity = {};
    stackHistory.forEach(entry => {
      const name = entry.commodityName;
      if (!physicalByCommodity[name]) {
        physicalByCommodity[name] = { bags: 0, stackKg: 0 };
      }
      physicalByCommodity[name].bags += entry.bags;
      physicalByCommodity[name].stackKg += entry.totalKg;
    });

    if (mergeEquivalents) {
      // --- MERGED CANONICAL VIEW (Official CSV Commodity Mapping) ---
      const canonicalBuckets = new Map();

      (stockItems || []).forEach(sysItem => {
        const commName = sysItem.commodity;
        const mapping = findMapping(commName);
        const canonicalId = mapping ? mapping.id : commName.toLowerCase().replace(/\s+/g, '_');
        const canonicalName = mapping ? (mapping.shortName ? `${mapping.name} (${mapping.shortName})` : mapping.name) : commName;
        const groupName = mapping ? mapping.group : MASTER_GROUPS.OTHER;
        const unitName = mapping?.unit || sysItem.unit || 'Kgs';
        const isRice = mapping?.isRice !== undefined ? mapping.isRice : (groupName === MASTER_GROUPS.RICE);

        if (!canonicalBuckets.has(canonicalId)) {
          canonicalBuckets.set(canonicalId, {
            id: canonicalId,
            commodity: canonicalName,
            shortName: mapping?.shortName || canonicalName,
            inspectionGroup: mapping?.inspectionGroup || mapping?.name || canonicalName,
            group: groupName,
            unit: unitName,
            isRice: isRice,
            systemStockKg: 0,
            subItems: [],
            matchingNames: new Set()
          });
        }

        const bucket = canonicalBuckets.get(canonicalId);
        bucket.systemStockKg += (sysItem.system_stock_kg || 0);
        bucket.matchingNames.add(commName.toLowerCase());
        bucket.matchingNames.add(commName.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (mapping?.aliases) {
          mapping.aliases.forEach(a => {
            bucket.matchingNames.add(a.toLowerCase());
            bucket.matchingNames.add(a.toLowerCase().replace(/[^a-z0-9]/g, ''));
          });
        }
        if (mapping?.shortName) {
          bucket.matchingNames.add(mapping.shortName.toLowerCase());
        }
        bucket.subItems.push({
          name: commName,
          kg: sysItem.system_stock_kg || 0,
          unit: sysItem.unit || unitName
        });
      });

      // Calculate physical bags, loose stock, total physical, and difference for each canonical bucket
      canonicalBuckets.forEach(bucket => {
        let physBags = 0;
        let stackKg = 0;

        // Sum physical counts from all matching alias names
        Object.entries(physicalByCommodity).forEach(([pName, pVal]) => {
          const pClean = pName.toLowerCase();
          const pNorm = pClean.replace(/[^a-z0-9]/g, '');
          const pMap = findMapping(pName);
          if (
            bucket.matchingNames.has(pClean) || 
            bucket.matchingNames.has(pNorm) ||
            (pMap && pMap.id === bucket.id) ||
            pClean === bucket.commodity.toLowerCase() ||
            pClean === bucket.id.toLowerCase()
          ) {
            physBags += pVal.bags;
          }
        });

        // Compute stack kg based on per-commodity bag weight (defaults to 50 kg)
        const commBagWeight = parseFloat(commodityBagWeights[bucket.id] ?? commodityBagWeights[bucket.commodity] ?? 50.0);
        stackKg = Math.round(physBags * commBagWeight * 100) / 100;

        // Loose stock for this canonical commodity or its sub-items
        let loose = parseFloat(looseStock[bucket.id]) || parseFloat(looseStock[bucket.commodity]) || 0;
        bucket.subItems.forEach(sub => {
          if (looseStock[sub.name] !== undefined) {
            loose += (parseFloat(looseStock[sub.name]) || 0);
          }
        });

        const totalPhysical = stackKg + loose;
        const sysKg = bucket.systemStockKg;
        const difference = totalPhysical - sysKg;

        // Zero Stock Filter
        const isZeroStock = sysKg <= 0 && totalPhysical <= 0;
        if (isZeroStock) {
          zeroCount++;
          if (!showZeroStock) return;
        }

        const reconciledItem = {
          id: bucket.id,
          commodity: bucket.commodity,
          shortName: bucket.shortName,
          inspectionGroup: bucket.inspectionGroup,
          unit: bucket.unit,
          isRice: bucket.isRice,
          bagWeight: commBagWeight,
          systemStockKg: sysKg,
          totalBags: physBags,
          stackStockKg: stackKg,
          looseKg: loose,
          totalPhysicalKg: totalPhysical,
          differenceKg: difference,
          group: bucket.group,
          subItems: bucket.subItems
        };

        const grp = bucket.group;
        if (!groups[grp]) {
          groups[grp] = { items: [], totals: { systemStockKg: 0, totalBags: 0, stackStockKg: 0, looseKg: 0, totalPhysicalKg: 0, differenceKg: 0 } };
        }

        groups[grp].items.push(reconciledItem);
        groups[grp].totals.systemStockKg += reconciledItem.systemStockKg;
        groups[grp].totals.totalBags += reconciledItem.totalBags;
        groups[grp].totals.stackStockKg += reconciledItem.stackStockKg;
        groups[grp].totals.looseKg += reconciledItem.looseKg;
        groups[grp].totals.totalPhysicalKg += reconciledItem.totalPhysicalKg;
        groups[grp].totals.differenceKg += reconciledItem.differenceKg;
      });

    } else {
      // --- UNMERGED INDIVIDUAL ePOS ROWS VIEW ---
      const processedCommodityNames = new Set();

      (stockItems || []).forEach(sysItem => {
        const commName = sysItem.commodity;
        processedCommodityNames.add(commName.toLowerCase());

        const mapping = findMapping(commName);
        const groupName = mapping?.group || MASTER_GROUPS.OTHER;
        const isRice = mapping?.isRice !== undefined ? mapping.isRice : (groupName === MASTER_GROUPS.RICE);

        let physBags = 0;
        let stackKg = 0;

        Object.entries(physicalByCommodity).forEach(([pName, pVal]) => {
          const pClean = pName.toLowerCase();
          const sClean = commName.toLowerCase();
          if (pClean === sClean || sClean.includes(pClean) || pClean.includes(sClean)) {
            physBags += pVal.bags;
          }
        });

        const commBagWeight = parseFloat(commodityBagWeights[commName] ?? 50.0);
        stackKg = Math.round(physBags * commBagWeight * 100) / 100;

        const loose = parseFloat(looseStock[commName]) || 0;
        const totalPhysical = stackKg + loose;
        const sysKg = sysItem.system_stock_kg || 0;
        const difference = totalPhysical - sysKg;

        const isZeroStock = sysKg <= 0 && totalPhysical <= 0;
        if (isZeroStock) {
          zeroCount++;
          if (!showZeroStock) return;
        }

        const reconciledItem = {
          id: commName,
          commodity: commName,
          shortName: mapping?.shortName || commName,
          inspectionGroup: mapping?.inspectionGroup || commName,
          unit: sysItem.unit || mapping?.unit || 'Kgs',
          isRice: isRice,
          bagWeight: commBagWeight,
          systemStockKg: sysKg,
          totalBags: physBags,
          stackStockKg: stackKg,
          looseKg: loose,
          totalPhysicalKg: totalPhysical,
          differenceKg: difference,
          group: groupName,
          subItems: []
        };

        if (!groups[groupName]) {
          groups[groupName] = { items: [], totals: { systemStockKg: 0, totalBags: 0, stackStockKg: 0, looseKg: 0, totalPhysicalKg: 0, differenceKg: 0 } };
        }

        groups[groupName].items.push(reconciledItem);
        groups[groupName].totals.systemStockKg += reconciledItem.systemStockKg;
        groups[groupName].totals.totalBags += reconciledItem.totalBags;
        groups[groupName].totals.stackStockKg += reconciledItem.stackStockKg;
        groups[groupName].totals.looseKg += reconciledItem.looseKg;
        groups[groupName].totals.totalPhysicalKg += reconciledItem.totalPhysicalKg;
        groups[groupName].totals.differenceKg += reconciledItem.differenceKg;
      });
    }

    // Total Rice Aggregation Summary (Sum of all Rice inspection groups: Boiled Rice, Raw Rice, CMR, OMSS)
    const riceTotals = {
      systemStockKg: 0,
      totalBags: 0,
      stackStockKg: 0,
      looseKg: 0,
      totalPhysicalKg: 0,
      differenceKg: 0
    };

    Object.values(groups).forEach(grpObj => {
      (grpObj.items || []).forEach(item => {
        if (item.isRice || item.group === MASTER_GROUPS.RICE) {
          riceTotals.systemStockKg += item.systemStockKg;
          riceTotals.totalBags += item.totalBags;
          riceTotals.stackStockKg += item.stackStockKg;
          riceTotals.looseKg += item.looseKg;
          riceTotals.totalPhysicalKg += item.totalPhysicalKg;
          riceTotals.differenceKg += item.differenceKg;
        }
      });
    });

    return {
      groupedData: groups,
      totalRiceSummary: riceTotals,
      hiddenZeroCount: zeroCount
    };
  }, [stockItems, stackHistory, looseStock, commodityBagWeights, findMapping, showZeroStock, mergeEquivalents]);

  // Dynamic Export PDF Handler (lazy-loaded so initial page load is blazing fast)
  const handleExportPdf = async () => {
    try {
      showToast('Generating Audit PDF Report...', 'info');
      const { generateAuditPdf } = await import('./utils/pdfGenerator');
      generateAuditPdf({
        fpsId,
        metadata,
        groupedData,
        totalRiceSummary,
        globalBagWeight
      });
      showToast('Official Audit PDF Report generated and downloaded.', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast('Failed to generate PDF. Please try again.', 'warning');
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-20 bg-slate-100">
      {/* 1. Header & Configuration Bar */}
      <Header
        fpsId={fpsId}
        setFpsId={setFpsId}
        onFetchStock={fetchStockData}
        isLoading={isLoading}
        fetchProgress={fetchProgress}
        fetchFailed={!!fetchErrorModal}
        onRetryFetch={() => fetchStockData(fpsId, { forceRefresh: true, maxAttempts: 3 })}
        dataSource={dataSource}
        metadata={metadata}
        globalBagWeight={globalBagWeight}
        setGlobalBagWeight={setGlobalBagWeight}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMetadata={() => setIsMetadataOpen(true)}
        onResetAudit={handleResetAudit}
        onExportPdf={handleExportPdf}
        isOnline={isOnline}
        totalStacksCount={stackHistory.length}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-16 right-4 z-50 px-4 py-2 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border transition-all animate-in slide-in-from-top-2 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700' 
            : toastMessage.type === 'warning' 
            ? 'bg-amber-900 text-amber-100 border-amber-700' 
            : 'bg-slate-900 text-slate-100 border-slate-700'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex-1 w-full space-y-2.5 sm:space-y-3">
        {/* Mobile View Switcher (Strict 3 Tabs: Stack Numpad, Reconcile Table, Summary View) */}
        <div className="flex sm:hidden bg-slate-200/90 p-1 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
          <button
            onClick={() => setActiveTab('entry')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'entry' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Stack Numpad</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'table' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Reconcile Table</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'summary' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Summary View</span>
          </button>
        </div>

        {/* Desktop View Mode Switcher */}
        <div className="hidden sm:flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">View Mode:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
              <button
                onClick={() => setActiveTab('entry')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                  activeTab !== 'summary' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Boxes className="w-3.5 h-3.5 text-blue-600" />
                <span>Audit Workstation (Split View)</span>
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                  activeTab === 'summary' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Inspection Paper Summary Table</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">ARD {fpsId}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Audit Active</span>
          </div>
        </div>

        {/* View Rendering based on activeTab */}
        {activeTab === 'summary' ? (
          <div className="w-full space-y-4">
            <InspectionPaperSummary
              groupedData={groupedData}
              totalRiceSummary={totalRiceSummary}
              metadata={metadata}
              fpsId={fpsId}
              showToast={showToast}
            />
          </div>
        ) : (
          /* Desktop / Responsive Grid for Entry & Reconcile */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: High-Speed Quick Entry UI (Mobile-Optimized) */}
            <div className={`lg:col-span-5 space-y-4 ${activeTab === 'table' ? 'hidden sm:block' : ''}`}>
              <QuickEntryPad
                activeCommodity={activeCommodity}
                setActiveCommodity={setActiveCommodity}
                availableCommodities={availableCommodities}
                globalBagWeight={globalBagWeight}
                commodityBagWeights={commodityBagWeights}
                onAddStack={handleAddStack}
                stackHistory={stackHistory}
                onDeleteStack={handleDeleteStack}
                commodityTotals={commodityTotals}
              />
            </div>

            {/* Right Column: Reconciliation & Difference Engine Table */}
            <div className={`lg:col-span-7 space-y-4 ${activeTab === 'entry' ? 'hidden sm:block' : ''}`}>
              <ReconciliationTable
                groupedData={groupedData}
                looseStock={looseStock}
                onLooseStockChange={handleLooseStockChange}
                globalBagWeight={globalBagWeight}
                commodityBagWeights={commodityBagWeights}
                onBagWeightChange={handleBagWeightChange}
                showZeroStock={showZeroStock}
                setShowZeroStock={setShowZeroStock}
                hiddenZeroCount={hiddenZeroCount}
                onOpenEditStock={(item) => setEditingGroupItem(item)}
              />
            </div>
          </div>
        )}
      </main>

      {/* 2. Sticky Bottom Summary Bar & Total Rice Drawer */}
      <StickyBottomSummary
        groupedData={groupedData}
        totalRiceSummary={totalRiceSummary}
      />

      {/* 3. Master Commodity Mapping Settings Modal */}
      <MasterMappingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mappings={mappings}
        onAddMapping={addMapping}
        onUpdateMapping={updateMapping}
        onDeleteMapping={deleteMapping}
        onResetToDefaults={resetToDefaults}
      />

      {/* 4. Inspection Metadata Modal */}
      <InspectionMetadataModal
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        metadata={metadata}
        onUpdateMetadata={setMetadata}
      />

      {/* 5. Edit ePOS Closing Balance Modal */}
      <EditEposStockModal
        isOpen={!!editingGroupItem}
        onClose={() => setEditingGroupItem(null)}
        groupItem={editingGroupItem}
        onSaveGroupStock={handleSaveGroupStock}
      />

      {/* 6. ePOS Connection Failure Resolution Modal */}
      <FetchErrorModal
        isOpen={!!fetchErrorModal}
        onClose={() => setFetchErrorModal(null)}
        fpsId={fetchErrorModal?.fpsId || fpsId}
        errorMsg={fetchErrorModal?.errorMsg}
        cachedData={fetchErrorModal?.cachedData}
        onRetry={() => fetchStockData(fetchErrorModal?.fpsId || fpsId, { forceRefresh: true, maxAttempts: 3 })}
        onUseCached={handleUseCachedStock}
        onManualEntry={handleManualEntryFallback}
        onLoadDemo={handleLoadDemoFallback}
        isRetrying={isLoading}
      />
    </div>
  );
}
