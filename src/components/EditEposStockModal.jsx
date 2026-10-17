import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Save, 
  AlertCircle, 
  Check, 
  Edit3,
  Scale
} from 'lucide-react';

export default function EditEposStockModal({
  isOpen,
  onClose,
  groupItem,
  onSaveGroupStock
}) {
  const [itemsList, setItemsList] = useState([]);
  const [deletedNames, setDeletedNames] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemKg, setNewItemKg] = useState('');

  // Synchronize state when modal opens with a groupItem
  useEffect(() => {
    if (groupItem) {
      if (groupItem.subItems && groupItem.subItems.length > 0) {
        setItemsList(groupItem.subItems.map(item => ({
          name: item.name,
          kg: item.kg !== undefined ? item.kg : 0,
          unit: item.unit || groupItem.unit || 'Kgs'
        })));
      } else {
        // Fallback for single item
        setItemsList([{
          name: groupItem.commodity,
          kg: groupItem.systemStockKg || 0,
          unit: groupItem.unit || 'Kgs'
        }]);
      }
      setDeletedNames([]);
      setShowAddForm(false);
      setNewItemName('');
      setNewItemKg('');
    }
  }, [groupItem, isOpen]);

  if (!isOpen || !groupItem) return null;

  // Handle inline stock change for a specific commodity
  const handleKgChange = (index, value) => {
    setItemsList(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, kg: value };
      }
      return item;
    }));
  };

  // Handle deleting a commodity from this group
  const handleDeleteItem = (index) => {
    const target = itemsList[index];
    if (target) {
      setDeletedNames(prev => [...prev, target.name]);
      setItemsList(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  // Handle adding a new scheme to this group
  const handleAddScheme = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const kgVal = parseFloat(newItemKg) || 0;
    
    setItemsList(prev => [
      ...prev,
      {
        name: newItemName.trim(),
        kg: kgVal,
        unit: groupItem.unit || 'Kgs'
      }
    ]);

    setNewItemName('');
    setNewItemKg('');
    setShowAddForm(false);
  };

  // Calculate live preview total
  const previewTotalKg = itemsList.reduce((acc, curr) => acc + (parseFloat(curr.kg) || 0), 0);

  const handleSave = () => {
    onSaveGroupStock(itemsList, deletedNames);
    onClose();
  };

  const fmt = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-stock-title"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 id="edit-stock-title" className="font-bold text-sm sm:text-base">
                Edit ePOS Closing Balance (CB)
              </h3>
              <p className="text-[11px] text-amber-300 font-medium">
                Group: {groupItem.commodity}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Helpful field inspector note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Field Stock Adjustment:</span> Touch any Closing Balance (CB) below to edit the weight in Kg. Click the <span className="text-red-600 font-bold">red trash button</span> to remove a commodity scheme from this group.
            </div>
          </div>

          {/* List of Commodities in this Inspection Group */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider px-1">
              <span>Commodity Name</span>
              <span>Closing Balance (CB) & Delete</span>
            </div>

            {itemsList.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                All commodities removed from this group. Total ePOS stock will be 0.00.
              </div>
            ) : (
              <div className="space-y-2">
                {itemsList.map((item, idx) => (
                  <div 
                    key={item.name + idx}
                    className="bg-slate-50 hover:bg-blue-50/50 rounded-xl p-2.5 sm:p-3 border border-slate-200 flex items-center justify-between gap-2.5 transition"
                  >
                    {/* Commodity Name */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {item.name}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Base Unit: {item.unit || groupItem.unit || 'Kgs'}
                      </span>
                    </div>

                    {/* Editable CB Quantity */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.kg}
                          onChange={(e) => handleKgChange(idx, e.target.value)}
                          className="w-24 sm:w-28 text-right py-1 px-2 font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                          placeholder="0.00"
                        />
                        <span className="text-xs text-slate-500 font-mono ml-1 font-semibold">
                          {item.unit || 'kg'}
                        </span>
                      </div>

                      {/* Red Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg border border-red-200 hover:border-red-300 transition tap-bounce shadow-xs"
                        title={`Delete ${item.name} from group`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Scheme / Commodity Toggle */}
          <div>
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 bg-slate-100 hover:bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl border border-dashed border-slate-300 hover:border-blue-400 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Scheme / Commodity to this Group</span>
              </button>
            ) : (
              <form onSubmit={handleAddScheme} className="bg-slate-100 p-3 rounded-xl border border-slate-300 space-y-2.5 animate-in fade-in">
                <div className="text-xs font-bold text-slate-800">Add Scheme to {groupItem.commodity}:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Scheme Name (e.g. PMGKAY BR)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Closing Stock Kg"
                      value={newItemKg}
                      onChange={(e) => setNewItemKg(e.target.value)}
                      className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                      required
                    />
                    <span className="text-xs text-slate-500 font-mono">{groupItem.unit || 'Kgs'}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Live Group Total Preview */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              New Group ePOS Total:
            </span>
            <div className="font-mono font-bold text-base text-amber-400">
              {fmt(previewTotalKg)} <span className="text-xs text-slate-400">{groupItem.unit || 'Kgs'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition tap-bounce flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save & Recalculate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
