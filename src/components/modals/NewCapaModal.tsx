import React, { useState } from 'react';
import { CapaItem } from '../../types';
import { X, CheckCircle2 } from 'lucide-react';

interface NewCapaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: CapaItem) => void;
}

export const NewCapaModal: React.FC<NewCapaModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<CapaItem['source']>('NCR');
  const [priority, setPriority] = useState<CapaItem['priority']>('High');
  const [owner, setOwner] = useState('Md. Atiqur Rahman');
  const [dueDate, setDueDate] = useState('2026-09-30');
  const [rootCause, setRootCause] = useState('');
  const [actionPlan, setActionPlan] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = `CAPA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: CapaItem = {
      id: `capa-${Date.now()}`,
      code: randomCode,
      title,
      source,
      priority,
      status: 'Open',
      owner,
      dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      rootCause,
      actionPlan,
      progressPercent: 20,
    };
    onSubmit(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e7f2] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e7f2] mb-4">
          <div className="flex items-center gap-2 text-[#e35b2a]">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-base text-[#0d1730]">Initiate Corrective &amp; Preventive Action (CAPA)</h3>
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
            <label className="block font-semibold text-[#5b6480] mb-1">Action Item Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Elimination of Solder Balling in Reflow Peak Zone"
              className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Originating Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
              >
                <option value="NCR">Non-Conformance Report (NCR)</option>
                <option value="Customer Complaint">Customer Complaint / Field Return</option>
                <option value="Internal Audit">Internal Quality Audit</option>
                <option value="Supplier Issue">Supplier Raw Material Flaw</option>
                <option value="Process Deviation">Process SPC Out of Control</option>
                <option value="Mgmt Review">Executive Management Review</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
              >
                <option value="Critical">Critical (Immediate Line Stoppage Risk)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Lead Engineer / Owner</label>
              <input
                required
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Md. Atiqur Rahman"
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Target Due Date</label>
              <input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">Root Cause (5-Why / Ishikawa)</label>
            <textarea
              required
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g. Thermal imbalance between ground plane pad and signal trace causing rotational lift..."
              className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">8D Corrective &amp; Preventive Action Plan</label>
            <textarea
              required
              rows={2}
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="Specify engineering redesign, equipment upgrade, or SOP revision..."
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
              className="px-4 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white rounded-lg font-bold shadow-sm"
            >
              Issue CAPA Mandate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
