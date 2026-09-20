import React, { useState } from 'react';
import { NonConformanceItem } from '../../types';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface NewNcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: NonConformanceItem) => void;
}

export const NewNcModal: React.FC<NewNcModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [line, setLine] = useState('SMT Line 1');
  const [classification, setClassification] = useState<'Major' | 'Minor' | 'Critical'>('Major');
  const [product, setProduct] = useState('Fridge Inverter Board');
  const [defectType, setDefectType] = useState('Solder Bridge');
  const [qty, setQty] = useState(25);
  const [description, setDescription] = useState('');
  const [containmentAction, setContainmentAction] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = `NCR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: NonConformanceItem = {
      id: `ncr-${Date.now()}`,
      code: randomCode,
      title,
      date: new Date().toISOString().split('T')[0],
      line,
      classification,
      status: 'Open',
      product,
      defectType,
      quantityAffected: Number(qty),
      reportedBy: 'Md. Atiqur Rahman (QA Lead)',
      description,
      containmentAction,
    };
    onSubmit(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e7f2] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e7f2] mb-4">
          <div className="flex items-center gap-2 text-[#d64545]">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-base text-[#0d1730]">Raise Non-Conformance Report (NCR)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#5b6480] hover:bg-[#eef1f8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">Defect Summary / Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Excessive solder bridging on 0.5mm pitch MCU"
              className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Production Line / Station</label>
              <select
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
              >
                <option value="SMT Line 1">SMT Line 1</option>
                <option value="SMT Line 2">SMT Line 2</option>
                <option value="SMT Line 3">SMT Line 3</option>
                <option value="THT Line 1">THT Line 1</option>
                <option value="THT Line 2">THT Line 2</option>
                <option value="PCB AOI Bay">PCB AOI Bay</option>
                <option value="PCBA Final QC">PCBA Final QC</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Severity Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
              >
                <option value="Minor">Minor (Workmanship)</option>
                <option value="Major">Major (Process Drift)</option>
                <option value="Critical">Critical (Immediate Quarantine)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-[#5b6480] mb-1">Product Family</label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
              >
                <option value="Fridge Inverter Board">Fridge Inverter Board</option>
                <option value="TV Mainboard 4K">TV Mainboard 4K</option>
                <option value="LED Light Driver">LED Light Driver</option>
                <option value="Mobile Sub-board">Mobile Sub-board</option>
                <option value="Computer Motherboard">Computer Motherboard</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Qty Affected</label>
              <input
                required
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">Defect Category</label>
            <input
              required
              type="text"
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              placeholder="e.g. Solder Bridge, Tombstone, Solder Void, Voiding"
              className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">Failure Description &amp; Observation</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail observation under microscope/AOI, component reference designators..."
              className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">Immediate Containment Action</label>
            <textarea
              required
              rows={2}
              value={containmentAction}
              onChange={(e) => setContainmentAction(e.target.value)}
              placeholder="e.g. Stencil IPA wipe performed; board lot quarantined in Bin C..."
              className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#e2e7f2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#e2e7f2] text-[#5b6480] hover:bg-[#eef1f8] rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#d64545] hover:bg-[#b53434] text-white rounded-lg font-bold shadow-sm"
            >
              Register &amp; Notify Line
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
