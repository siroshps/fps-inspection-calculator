import React from 'react';
import { X, FileText, Check, User, MapPin, Calendar, Clock, Award } from 'lucide-react';

export default function InspectionMetadataModal({
  isOpen,
  onClose,
  metadata,
  onUpdateMetadata
}) {
  if (!isOpen) return null;

  const handleChange = (field, val) => {
    onUpdateMetadata({ ...metadata, [field]: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Inspection Metadata & Officer Details</h3>
              <p className="text-[11px] text-slate-400">Printed on the official government audit report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">FPS / ARD Number & Name</label>
            <input
              type="text"
              value={metadata.shop_name || ''}
              onChange={(e) => handleChange('shop_name', e.target.value)}
              placeholder="e.g. ARD 2056003 (Ponnani Firka)"
              className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">District</label>
              <input
                type="text"
                value={metadata.district || 'Malappuram'}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="Malappuram"
                className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Taluk / TSO Office</label>
              <input
                type="text"
                value={metadata.tso || 'Ponnani'}
                onChange={(e) => handleChange('tso', e.target.value)}
                placeholder="Ponnani"
                className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Inspecting Officer Name</label>
              <input
                type="text"
                value={metadata.inspectorName || ''}
                onChange={(e) => handleChange('inspectorName', e.target.value)}
                placeholder="e.g. Sirosh P.S"
                className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Designation</label>
              <input
                type="text"
                value={metadata.inspectorDesignation || 'Rationing Inspector'}
                onChange={(e) => handleChange('inspectorDesignation', e.target.value)}
                placeholder="Rationing Inspector"
                className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Inspection Date</label>
              <input
                type="date"
                value={metadata.inspectionDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleChange('inspectionDate', e.target.value)}
                className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Audit Time</label>
              <input
                type="time"
                value={metadata.inspectionTime || new Date().toTimeString().slice(0, 5)}
                onChange={(e) => handleChange('inspectionTime', e.target.value)}
                className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Inspection Remarks / Discrepancy Findings</label>
            <textarea
              rows={3}
              value={metadata.remarks || ''}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="e.g. Physical stacks verified in presence of ARD dealer. All bags stacked properly. Minor loose grain difference noted in Boiled Rice due to handling."
              className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition tap-bounce flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
