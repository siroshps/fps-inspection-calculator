import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_COMMODITY_MAPPINGS, MASTER_GROUPS, resolveCommodityFromCsv } from '../utils/constants';

const STORAGE_KEY = 'kerala_fps_commodity_mappings_v4';

export function useCommodityMapping() {
  const [mappings, setMappings] = useLocalStorage(STORAGE_KEY, DEFAULT_COMMODITY_MAPPINGS);

  /**
   * Finds the mapped inspection group for a given commodity name based on the CSV mapping rules
   */
  const findMapping = useCallback((commodityName) => {
    if (!commodityName) return null;
    const cleanName = commodityName.trim().toLowerCase();

    // 1. Direct ID, Name, or ShortName match in custom mappings
    const exact = mappings.find(m => 
      m.id.toLowerCase() === cleanName || 
      m.name.toLowerCase() === cleanName ||
      (m.shortName && m.shortName.toLowerCase() === cleanName) ||
      (m.inspectionGroup && m.inspectionGroup.toLowerCase() === cleanName)
    );
    if (exact) return exact;

    // 2. Alias match in user mappings
    const aliasMatch = mappings.find(m => 
      m.aliases && m.aliases.some(alias => cleanName === alias.toLowerCase() || cleanName.includes(alias.toLowerCase()) || alias.toLowerCase().includes(cleanName))
    );
    if (aliasMatch) return aliasMatch;

    // 3. Official CSV Resolver (Exact 35 commodities lookup + normalized matching)
    const csvResolved = resolveCommodityFromCsv(commodityName);
    if (csvResolved) {
      return csvResolved;
    }

    // 4. Default fallback
    return {
      id: cleanName.replace(/\s+/g, '_'),
      name: commodityName,
      shortName: commodityName.slice(0, 5),
      inspectionGroup: commodityName,
      group: MASTER_GROUPS.OTHER,
      unit: 'Kgs',
      isRice: false,
      defaultBagKg: 50
    };
  }, [mappings]);

  const updateMapping = useCallback((id, updatedFields) => {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
  }, [setMappings]);

  const addMapping = useCallback((newMapping) => {
    const id = newMapping.id || newMapping.name.toLowerCase().replace(/\s+/g, '_');
    setMappings(prev => {
      const exists = prev.some(m => m.id === id);
      if (exists) {
        return prev.map(m => m.id === id ? { ...m, ...newMapping } : m);
      }
      return [...prev, { ...newMapping, id, aliases: newMapping.aliases || [newMapping.name.toLowerCase()] }];
    });
  }, [setMappings]);

  const deleteMapping = useCallback((id) => {
    setMappings(prev => prev.filter(m => m.id !== id));
  }, [setMappings]);

  const resetToDefaults = useCallback(() => {
    setMappings(DEFAULT_COMMODITY_MAPPINGS);
  }, [setMappings]);

  return {
    mappings,
    findMapping,
    updateMapping,
    addMapping,
    deleteMapping,
    resetToDefaults,
    masterGroups: MASTER_GROUPS
  };
}
