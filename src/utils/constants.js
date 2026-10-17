/**
 * Kerala FPS Physical Stock Audit & ePOS Reconciliation
 * Official Commodity Mapping & Inspection Groups (Based on Department CSV Specifications)
 */

export const MASTER_GROUPS = {
  RICE: 'Total Rice',
  WHEAT: 'Wheat',
  ATTA: 'Atta',
  OTHER: 'Other Commodities'
};

// 1. Raw CSV Mapping Definitions from Department Inspection Specification
export const CSV_COMMODITY_MAPPINGS = [
  { commodity: "Raw rice", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "Wheat", unit: "Kgs", inspectionGroup: "Wheat", shortName: "Wheat" },
  { commodity: "Sugar", unit: "Kgs", inspectionGroup: "Sugar", shortName: "Sugar" },
  { commodity: "Koil", unit: "Ltrs", inspectionGroup: "Koil", shortName: "Koil" },
  { commodity: "Atta", unit: "Pkts", inspectionGroup: "Atta", shortName: "Atta" },
  { commodity: "PMGKAY Wheat", unit: "Kgs", inspectionGroup: "Wheat", shortName: "Wheat" },
  { commodity: "PMGKAY RR", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "Raw rice SPL", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "Boiled rice SPL", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "Matta rice SPL", unit: "Kgs", inspectionGroup: "CMR", shortName: "CMR" },
  { commodity: "Boiled rice", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "Matta rice", unit: "Kgs", inspectionGroup: "CMR", shortName: "CMR" },
  { commodity: "RAGI", unit: "Kgs", inspectionGroup: "Ragi", shortName: "Ragi" },
  { commodity: "RAGI POWDER", unit: "Pkts", inspectionGroup: "Ragi", shortName: "Ragi" },
  { commodity: "Free RR", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "Special RR", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "Special BR", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "Spl. Festival Kit", unit: "FreeKit", inspectionGroup: "Kit", shortName: "Kit" },
  { commodity: "Coupon", unit: "FreeKit", inspectionGroup: "Kit", shortName: "Kit" },
  { commodity: "SUB KIT", unit: "FreeKit", inspectionGroup: "Kit", shortName: "Kit" },
  { commodity: "Free Kit", unit: "FreeKit", inspectionGroup: "Kit", shortName: "Kit" },
  { commodity: "PMGKAY BR", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "Koil NS ALL", unit: "Ltrs", inspectionGroup: "Koil", shortName: "Koil" },
  { commodity: "OMSS SPL. BR", unit: "Kgs", inspectionGroup: "OMSS", shortName: "OMSS" },
  { commodity: "Onam RR Rice", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "Onam BR Rice", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "Onam CMR Rice", unit: "Kgs", inspectionGroup: "CMR", shortName: "CMR" },
  { commodity: "Relief BR Spl", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "Trawl BR Spl", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "RR F. SPL", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "BR F. SPL", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "CMR F. SPL", unit: "Kgs", inspectionGroup: "CMR", shortName: "CMR" },
  { commodity: "Fort.RR", unit: "Kgs", inspectionGroup: "Raw Rice", shortName: "RR" },
  { commodity: "Fort.BR", unit: "Kgs", inspectionGroup: "Boiled Rice", shortName: "BR" },
  { commodity: "Fort.CMR", unit: "Kgs", inspectionGroup: "CMR", shortName: "CMR" },
];

// 2. Metadata for Inspection Summary Groups (used for Summary of Commodity for Physical Calculation)
export const INSPECTION_GROUPS_META = {
  'Boiled Rice': {
    id: 'boiled_rice',
    name: 'Boiled Rice',
    shortName: 'BR',
    masterGroup: MASTER_GROUPS.RICE,
    unit: 'Kgs',
    isRice: true,
    defaultBagKg: 50,
    color: 'emerald'
  },
  'Raw Rice': {
    id: 'raw_rice',
    name: 'Raw Rice',
    shortName: 'RR',
    masterGroup: MASTER_GROUPS.RICE,
    unit: 'Kgs',
    isRice: true,
    defaultBagKg: 50,
    color: 'teal'
  },
  'CMR': {
    id: 'cmr',
    name: 'CMR (Matta Rice)',
    shortName: 'CMR',
    masterGroup: MASTER_GROUPS.RICE,
    unit: 'Kgs',
    isRice: true,
    defaultBagKg: 50,
    color: 'cyan'
  },
  'OMSS': {
    id: 'omss',
    name: 'OMSS SPL. BR',
    shortName: 'OMSS',
    masterGroup: MASTER_GROUPS.RICE,
    unit: 'Kgs',
    isRice: true,
    defaultBagKg: 50,
    color: 'sky'
  },
  'Wheat': {
    id: 'wheat',
    name: 'Wheat',
    shortName: 'Wheat',
    masterGroup: MASTER_GROUPS.WHEAT,
    unit: 'Kgs',
    isRice: false,
    defaultBagKg: 50,
    color: 'amber'
  },
  'Atta': {
    id: 'atta',
    name: 'Atta',
    shortName: 'Atta',
    masterGroup: MASTER_GROUPS.ATTA,
    unit: 'Pkts',
    isRice: false,
    defaultBagKg: 50,
    color: 'orange'
  },
  'Sugar': {
    id: 'sugar',
    name: 'Sugar',
    shortName: 'Sugar',
    masterGroup: MASTER_GROUPS.OTHER,
    unit: 'Kgs',
    isRice: false,
    defaultBagKg: 50,
    color: 'indigo'
  },
  'Koil': {
    id: 'koil',
    name: 'Koil (Kerosene)',
    shortName: 'Koil',
    masterGroup: MASTER_GROUPS.OTHER,
    unit: 'Ltrs',
    isRice: false,
    defaultBagKg: 1,
    color: 'slate'
  },
  'Ragi': {
    id: 'ragi',
    name: 'Ragi',
    shortName: 'Ragi',
    masterGroup: MASTER_GROUPS.OTHER,
    unit: 'Kgs',
    isRice: false,
    defaultBagKg: 50,
    color: 'rose'
  },
  'Kit': {
    id: 'kit',
    name: 'Kit (Festival / Free Kit)',
    shortName: 'Kit',
    masterGroup: MASTER_GROUPS.OTHER,
    unit: 'FreeKit',
    isRice: false,
    defaultBagKg: 1,
    color: 'purple'
  }
};

// 3. Consolidated Commodity Mappings for Storage and Settings Modal
export const DEFAULT_COMMODITY_MAPPINGS = Object.entries(INSPECTION_GROUPS_META).map(([groupKey, meta]) => {
  const matchingAliases = CSV_COMMODITY_MAPPINGS
    .filter(row => row.inspectionGroup === groupKey)
    .map(row => row.commodity.toLowerCase());

  return {
    id: meta.id,
    name: meta.name,
    shortName: meta.shortName,
    inspectionGroup: groupKey,
    group: meta.masterGroup,
    unit: meta.unit,
    isRice: meta.isRice,
    defaultBagKg: meta.defaultBagKg,
    color: meta.color,
    aliases: Array.from(new Set(matchingAliases))
  };
});

// Fast lookup maps
const NORM_LOOKUP = new Map();
CSV_COMMODITY_MAPPINGS.forEach(row => {
  const norm = row.commodity.toLowerCase().replace(/[^a-z0-9]/g, '');
  NORM_LOOKUP.set(norm, row);
  NORM_LOOKUP.set(row.commodity.toLowerCase(), row);
});

/**
 * Resolves any ePOS commodity string to its designated CSV Inspection Group
 */
export function resolveCommodityFromCsv(commodityName) {
  if (!commodityName) return null;
  const raw = commodityName.trim();
  const lower = raw.toLowerCase();
  const norm = lower.replace(/[^a-z0-9]/g, '');

  // 1. Direct or normalized match in CSV lookup
  if (NORM_LOOKUP.has(lower)) {
    const found = NORM_LOOKUP.get(lower);
    const meta = INSPECTION_GROUPS_META[found.inspectionGroup] || {};
    return {
      id: meta.id || found.inspectionGroup.toLowerCase().replace(/\s+/g, '_'),
      name: meta.name || found.inspectionGroup,
      inspectionGroup: found.inspectionGroup,
      shortName: found.shortName,
      unit: found.unit,
      group: meta.masterGroup || MASTER_GROUPS.OTHER,
      isRice: !!meta.isRice,
      defaultBagKg: meta.defaultBagKg || 50
    };
  }

  if (NORM_LOOKUP.has(norm)) {
    const found = NORM_LOOKUP.get(norm);
    const meta = INSPECTION_GROUPS_META[found.inspectionGroup] || {};
    return {
      id: meta.id || found.inspectionGroup.toLowerCase().replace(/\s+/g, '_'),
      name: meta.name || found.inspectionGroup,
      inspectionGroup: found.inspectionGroup,
      shortName: found.shortName,
      unit: found.unit,
      group: meta.masterGroup || MASTER_GROUPS.OTHER,
      isRice: !!meta.isRice,
      defaultBagKg: meta.defaultBagKg || 50
    };
  }

  // 2. Keyword fallback matching
  if (lower.includes('omss')) {
    const meta = INSPECTION_GROUPS_META['OMSS'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'OMSS', shortName: meta.shortName, unit: 'Kgs', group: meta.masterGroup, isRice: true, defaultBagKg: 50 };
  }
  if (lower.includes('matta') || lower.includes('cmr')) {
    const meta = INSPECTION_GROUPS_META['CMR'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'CMR', shortName: meta.shortName, unit: 'Kgs', group: meta.masterGroup, isRice: true, defaultBagKg: 50 };
  }
  if (lower.includes('br') || lower.includes('boiled')) {
    const meta = INSPECTION_GROUPS_META['Boiled Rice'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Boiled Rice', shortName: meta.shortName, unit: 'Kgs', group: meta.masterGroup, isRice: true, defaultBagKg: 50 };
  }
  if (lower.includes('rr') || lower.includes('raw rice')) {
    const meta = INSPECTION_GROUPS_META['Raw Rice'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Raw Rice', shortName: meta.shortName, unit: 'Kgs', group: meta.masterGroup, isRice: true, defaultBagKg: 50 };
  }
  if (lower.includes('wheat')) {
    const meta = INSPECTION_GROUPS_META['Wheat'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Wheat', shortName: meta.shortName, unit: 'Kgs', group: meta.masterGroup, isRice: false, defaultBagKg: 50 };
  }
  if (lower.includes('atta')) {
    const meta = INSPECTION_GROUPS_META['Atta'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Atta', shortName: meta.shortName, unit: 'Pkts', group: meta.masterGroup, isRice: false, defaultBagKg: 50 };
  }
  if (lower.includes('sugar')) {
    const meta = INSPECTION_GROUPS_META['Sugar'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Sugar', shortName: meta.shortName, unit: 'Kgs', group: meta.masterGroup, isRice: false, defaultBagKg: 50 };
  }
  if (lower.includes('koil') || lower.includes('kerosene')) {
    const meta = INSPECTION_GROUPS_META['Koil'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Koil', shortName: meta.shortName, unit: 'Ltrs', group: meta.masterGroup, isRice: false, defaultBagKg: 1 };
  }
  if (lower.includes('ragi')) {
    const meta = INSPECTION_GROUPS_META['Ragi'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Ragi', shortName: meta.shortName, unit: 'Kgs', group: meta.masterGroup, isRice: false, defaultBagKg: 50 };
  }
  if (lower.includes('kit') || lower.includes('coupon')) {
    const meta = INSPECTION_GROUPS_META['Kit'];
    return { id: meta.id, name: meta.name, inspectionGroup: 'Kit', shortName: meta.shortName, unit: 'FreeKit', group: meta.masterGroup, isRice: false, defaultBagKg: 1 };
  }

  // 3. Unrecognized item
  return {
    id: lower.replace(/\s+/g, '_'),
    name: raw,
    inspectionGroup: raw,
    shortName: raw.slice(0, 5),
    unit: 'Kgs',
    group: MASTER_GROUPS.OTHER,
    isRice: false,
    defaultBagKg: 50
  };
}

export const QUICK_COMMODITIES = Object.values(INSPECTION_GROUPS_META).map(meta => ({
  id: meta.id,
  label: `${meta.name} (${meta.shortName})`,
  shortLabel: meta.shortName,
  inspectionGroup: meta.name,
  group: meta.masterGroup,
  unit: meta.unit,
  color: meta.color
}));

export const QUICK_STACK_PRESETS = [10, 11, 12, 13, 14, 15];

export const DEMO_FPS_SHOPS = [
  { id: '2056003', label: 'ARD 2056003 (Ponnani Firka - Live)' },
  { id: '2056004', label: 'ARD 2056004 (Malappuram - Live)' },
  { id: '1036001', label: 'ARD 1036001 (Mock Demo)' },
];

export const DEFAULT_BAG_WEIGHT = 50; // kg

export const FALLBACK_MOCK_STOCK = [
  { commodity: "Fort.BR", unit: "Kgs", system_stock_kg: 9819.32 },
  { commodity: "BR F. SPL", unit: "Kgs", system_stock_kg: 185.0 },
  { commodity: "Fort.RR", unit: "Kgs", system_stock_kg: 3826.94 },
  { commodity: "RR F. SPL", unit: "Kgs", system_stock_kg: 339.0 },
  { commodity: "OMSS SPL. BR", unit: "Kgs", system_stock_kg: 166.0 },
  { commodity: "Wheat", unit: "Kgs", system_stock_kg: 2318.0 },
  { commodity: "Atta", unit: "Pkts", system_stock_kg: 280.0 },
  { commodity: "Sugar", unit: "Kgs", system_stock_kg: 150.0 },
  { commodity: "Koil", unit: "Ltrs", system_stock_kg: 4.0 }
];

/**
 * Official Kerala PDS Inspection Sort Order:
 * 1. RR (Raw Rice)
 * 2. BR (Boiled Rice)
 * 3. CMR (Matta Rice)
 * 4. Wheat
 * 5. Atta
 * 6. Sugar
 * 7. Koil (Kerosene)
 * 8. OMSS
 * 9+. Other items having stock/CB
 */
export const getInspectionSortRank = (item) => {
  if (!item) return 999;
  const s = String(item.shortName || item.shortLabel || '').toUpperCase().trim();
  const id = String(item.id || '').toLowerCase().trim();
  const comm = String(item.commodity || item.label || '').toUpperCase().trim();
  const group = String(item.inspectionGroup || '').toUpperCase().trim();

  // 1. Raw Rice (RR)
  if (
    s === 'RR' || 
    id === 'raw_rice' || 
    group === 'RAW RICE' || 
    comm.startsWith('RAW RICE') || 
    comm === 'RR' || 
    comm.includes('RAW RICE') || 
    comm.startsWith('RR ') ||
    comm.endsWith(' RR') ||
    comm.includes(' RR ') ||
    comm.includes('FORT.RR') ||
    comm.includes('RR F.')
  ) {
    return 1;
  }

  // 2. Boiled Rice (BR) - IMPORTANT: Exclude OMSS!
  if (
    !comm.includes('OMSS') && 
    !id.includes('omss') && 
    !s.includes('OMSS') && 
    !group.includes('OMSS') && (
      s === 'BR' || 
      id === 'boiled_rice' || 
      group === 'BOILED RICE' || 
      comm.startsWith('BOILED RICE') || 
      comm === 'BR' || 
      comm.includes('BOILED RICE') || 
      comm.startsWith('BR ') ||
      comm.endsWith(' BR') ||
      comm.includes(' BR ') ||
      comm.includes('FORT.BR') ||
      comm.includes('BR F.')
    )
  ) {
    return 2;
  }

  // 3. CMR (Matta Rice)
  if (
    s === 'CMR' || 
    id === 'cmr' || 
    group === 'CMR' || 
    comm.includes('CMR') || 
    comm.includes('MATTA')
  ) {
    return 3;
  }

  // 4. Wheat
  if (
    s === 'WHEAT' || 
    id === 'wheat' || 
    group === 'WHEAT' || 
    comm.includes('WHEAT')
  ) {
    return 4;
  }

  // 5. Atta
  if (
    s === 'ATTA' || 
    id === 'atta' || 
    group === 'ATTA' || 
    comm.includes('ATTA')
  ) {
    return 5;
  }

  // 6. Sugar
  if (
    s === 'SUGAR' || 
    id === 'sugar' || 
    group === 'SUGAR' || 
    comm.includes('SUGAR')
  ) {
    return 6;
  }

  // 7. Koil (Kerosene Oil)
  if (
    s === 'KOIL' || 
    id === 'koil' || 
    group === 'KOIL' || 
    comm.includes('KOIL') || 
    comm.includes('KEROSENE')
  ) {
    return 7;
  }

  // 8. OMSS (OMSS SPL. BR)
  if (
    s === 'OMSS' || 
    id === 'omss' || 
    group === 'OMSS' || 
    comm.includes('OMSS')
  ) {
    return 8;
  }

  // 9+. Other items having CB
  return 100;
};

/**
 * Formats expected remaining bags with fractions (¼, ½, ¾) based on 50kg/bag (or custom bag weight).
 * Reduces as stacks are counted so expectation is easy and precise.
 *
 * @param {number} sysKg - System stock in kg
 * @param {number} countedBags - Stacks counted so far in bags
 * @param {number} bagWeight - Bag weight in kg (default 50)
 * @param {boolean} useAscii - If true, returns ascii fractions e.g. "1/2" instead of "½"
 * @returns {string} e.g. "76 ½", "76 ¼", "76 ¾", "76", "½", "0"
 */
export const formatExpectedBagsWithFraction = (sysKg = 0, countedBags = 0, bagWeight = 50, useAscii = false) => {
  const bw = bagWeight > 0 ? bagWeight : 50;
  const diffKg = (sysKg || 0) - (countedBags || 0) * bw;
  
  if (Math.abs(diffKg) < 0.1) return '0';
  
  const isExcess = diffKg < 0;
  const absKg = Math.abs(diffKg);
  
  let fullBags = Math.floor(absKg / bw);
  const looseKg = absKg % bw;
  
  const eighth = bw / 8; // e.g. 6.25kg for 50kg
  let fraction = '';
  
  const qtr = useAscii ? '1/4' : '¼';
  const half = useAscii ? '1/2' : '½';
  const threeQtr = useAscii ? '3/4' : '¾';
  
  if (looseKg < eighth) {
    fraction = '';
  } else if (looseKg < 3 * eighth) {
    fraction = qtr;
  } else if (looseKg < 5 * eighth) {
    fraction = half;
  } else if (looseKg < 7 * eighth) {
    fraction = threeQtr;
  } else {
    fullBags += 1;
    fraction = '';
  }
  
  let formatted = '';
  if (fullBags === 0) {
    formatted = fraction || '0';
  } else if (fraction) {
    formatted = `${fullBags} ${fraction}`;
  } else {
    formatted = `${fullBags}`;
  }
  
  if (formatted === '0') return '0';
  return isExcess ? `+${formatted}` : formatted;
};

/**
 * Formats any counted bag quantity with fractions (¼, ½, ¾)
 *
 * @param {number} num - Number of bags
 * @param {boolean} useAscii - If true, returns ascii fractions
 * @returns {string} e.g. "76 ½", "½", "10", "0"
 */
export const formatBagsDisplay = (num, useAscii = false) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const val = Number(num);
  if (val === 0) return '0';
  if (Number.isInteger(val)) return val.toString();
  
  const full = Math.floor(val);
  const frac = Math.round((val - full) * 100) / 100;
  
  const qtr = useAscii ? '1/4' : '¼';
  const half = useAscii ? '1/2' : '½';
  const threeQtr = useAscii ? '3/4' : '¾';
  
  let fracSymbol = '';
  if (Math.abs(frac - 0.25) < 0.05) fracSymbol = qtr;
  else if (Math.abs(frac - 0.5) < 0.05) fracSymbol = half;
  else if (Math.abs(frac - 0.75) < 0.05) fracSymbol = threeQtr;
  
  if (fracSymbol) {
    return full > 0 ? `${full} ${fracSymbol}` : fracSymbol;
  }
  
  return parseFloat(val.toFixed(2)).toString();
};

/**
 * Cleans and normalizes Kerala ARD / FPS shop names.
 * Strips raw ePOS register report headers like "Stock Register for FPS 2056030 (District: ...)"
 *
 * @param {string} rawName - Raw shop name string
 * @param {string|number} fpsId - ARD / FPS Code
 * @param {string} [tso] - Taluk Supply Office
 * @returns {string} Normalized clean shop name, e.g. "ARD 2056030 (Ponnani)"
 */
export const cleanShopName = (rawName, fpsId, tso) => {
  const idStr = String(fpsId || '').trim();
  let name = (rawName || '').trim();

  // If empty or raw stock register table title
  if (!name || /stock\s*register/i.test(name)) {
    return tso && tso !== 'Supply Office' ? `ARD ${idStr} (${tso})` : `ARD ${idStr}`;
  }

  // Strip extraneous "Stock Register for" if still present
  name = name.replace(/^Stock\s+Register\s+(for\s+)?/i, '').trim();

  // If already starts with ARD <fpsId> or FPS <fpsId>
  if (/^(ard|fps)\s*/i.test(name)) {
    return name;
  }

  // If starts with raw fpsId (e.g. "2056030 - Some Name" or "2056030")
  if (idStr && name.startsWith(idStr)) {
    return `ARD ${name}`;
  }

  // If it's a dealer name or custom shop name
  return idStr ? `ARD ${idStr} - ${name}` : name;
};

