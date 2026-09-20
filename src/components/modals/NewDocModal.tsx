import React, { useState } from 'react';
import { SopDocument } from '../../types';
import { X, FileText } from 'lucide-react';

interface NewDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: SopDocument) => void;
}

export const NewDocModal: React.FC<NewDocModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('SOP-PCBA-029');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SMT');
  const [owner, setOwner] = useState('Md. Atiqur Rahman');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: SopDocument = {
      id: `sop-${Date.now()}`,
      code,
      title,
      category,
      revision: 'Rev 1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      owner,
      status: 'Active',
      fileSize: '1.4 MB',
      remarks: remarks || 'Initial release for production ramp',
    };
    onSubmit(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e7f2]">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e7f2] mb-4">
          <div className="flex items-center gap-2 text-[#182a52]">
            <FileText className="w-5 h-5 text-[#e35b2a]" />
            <h3 className="font-bold text-base text-[#0d1730]">Register Controlled Document / SOP</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#5b6480] hover:bg-[#eef1f8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Doc Number</label>
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SOP-SMT-030"
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#5b6480] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
              >
                <option value="IQC">IQC (Incoming Quality)</option>
                <option value="SMT">SMT Placement</option>
                <option value="AOI">AOI Optical Inspection</option>
                <option value="Wave Soldering">Wave Soldering</option>
                <option value="Final QC">Final QC</option>
                <option value="ESD & Safety">ESD &amp; Cleanroom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">Document Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Profiling Guidelines for 10-Zone Nitrogen Reflow Oven"
              className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5b6480] mb-1">Custodian / Approver</label>
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
            <label className="block font-semibold text-[#5b6480] mb-1">Change Remarks / Scope</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Summary of engineering standards or equipment covered..."
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
              Publish Controlled SOP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
