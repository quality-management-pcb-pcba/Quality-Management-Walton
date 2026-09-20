import React, { useState } from 'react';
import { SopDocument } from '../../types';
import { Plus, Search, Filter, FileText, Download, CheckCircle2, Clock, FileCheck } from 'lucide-react';

interface DocsViewProps {
  sopList?: SopDocument[];
  onOpenNewDocModal?: () => void;
}

export const DocsView: React.FC<DocsViewProps> = ({
  sopList = [],
  onOpenNewDocModal = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [downloadedDoc, setDownloadedDoc] = useState<string | null>(null);

  const handleDownloadDoc = (doc: SopDocument) => {
    const content = `WALTON HI-TECH INDUSTRIES PLC
QUALITY MANAGEMENT SYSTEM (QMS) - CONTROLLED COPY
Document Code: ${doc.code}
Revision: ${doc.revision}
Effective Date: ${doc.effectiveDate}
Category: ${doc.category}
Title: ${doc.title}
Owner: ${doc.owner}
Status: ${doc.status}
Controlled Copy Watermark: OFFICIAL WALTON QA AUDIT COPY - DO NOT DUPLICATE WITHOUT AUTHORIZATION

Scope:
This document governs operational standards and workmanship criteria for ${doc.category} within Walton Electronics manufacturing facilities.

Work Instructions & Guidelines:
1. All operating personnel must hold active IPC-A-610 / IPC-7711/7721 or relevant Walton workmanship certifications.
2. Calibration records for all inspection fixtures, AOI optics, and reflow ovens must be current.
3. Any deviation exceeding acceptable PPM thresholds must trigger an immediate NCR and escalation to the QM Division.

Approval Signatures:
Prepared By: ${doc.owner}
Approved By: Head of Quality Assurance, Walton Hi-Tech Industries PLC
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.code}_Rev_${doc.revision}_Controlled_Copy.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadedDoc(doc.code);
    setTimeout(() => setDownloadedDoc(null), 3000);
  };

  const categories = ['All', 'IQC', 'SMT', 'AOI', 'Wave Soldering', 'Final QC', 'ESD & Safety', 'R&D'];

  const filteredDocs = (sopList || []).filter((doc) => {
    const matchesSearch =
      doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="page-docs" className="space-y-6 animate-in fade-in duration-200">
      {/* Head */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1730]">Documents &amp; Standard Operating Procedures</h2>
          <div className="text-xs text-[#5b6480] mt-0.5">
            Governance · Controlled QMS Document Library &amp; Work Instructions
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (typeof onOpenNewDocModal === 'function') onOpenNewDocModal();
            }}
            className="px-4 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Report / SOP</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#e2e7f2] shadow-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#182a52] text-white shadow-xs'
                : 'text-[#5b6480] hover:bg-[#eef1f8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Register Card */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Controlled Document Master Register</h3>
            <p className="text-xs text-[#5b6480]">Showing {filteredDocs.length} active controlled specifications</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8891a8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SOP code, title, or keyword..."
              className="pl-8 pr-3 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs w-64 outline-none focus:ring-1 focus:ring-[#e35b2a]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#182a52] text-white">
                <th className="py-2.5 px-3 rounded-l-md font-semibold text-[11px]">SI No</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Doc Code</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Name of Document / Procedure</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Category</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Revision</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Effective Date</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Remarks</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Status</th>
                <th className="py-2.5 px-3 rounded-r-md font-semibold text-[11px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7f2]">
              {filteredDocs.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-[#fbfcfe]">
                  <td className="py-3 px-3 font-mono font-bold text-[#5b6480]">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0d1730]">
                    {doc.code}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#0d1730]">
                    {doc.title}
                    <span className="block text-[10px] text-[#8891a8] font-normal">Custodian: {doc.owner}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#eef1f8] text-[#22376b] font-medium text-[10px]">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#5b6480]">
                    {doc.revision}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#5b6480]">
                    {doc.effectiveDate}
                  </td>
                  <td className="py-3 px-3 text-[#5b6480] max-w-xs text-[11px]">
                    {doc.remarks}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        doc.status === 'Active'
                          ? 'bg-[#e5f7ee] text-[#1c8a53]'
                          : doc.status === 'Under Review'
                          ? 'bg-[#fdf1de] text-[#c74a1f]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        downloadedDoc === doc.code
                          ? 'text-[#1c8a53] bg-[#e5f7ee]'
                          : 'text-[#2f9bea] hover:bg-[#eef1f8]'
                      }`}
                      title="Download Controlled SOP Copy"
                    >
                      {downloadedDoc === doc.code ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
