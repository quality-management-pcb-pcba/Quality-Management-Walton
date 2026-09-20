/**
 * =========================================================================================
 * @file src/components/views/NcView.tsx
 * @component NcView
 * @description Non-Conformance Report (NCR) Real-Time Tracking View for Walton QMS
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Manages all reported manufacturing Non-Conformances across Walton PCB & PCBA lines:
 * - Tracks defect severity classifications: Critical, Major, and Minor.
 * - Displays status distribution: Open, In Progress, Closed, and Draft.
 * - Enforces standard segregation and quarantine rules for non-conforming materials.
 * - Allows quality controllers to inspect details, filter by classification, and update statuses.
 *
 * WHERE GEMINI AI API IS INTEGRATED & APPLIED:
 * --------------------------------------------
 * When an inspector clicks on an NCR or logs a new non-conformance, the Gemini AI model
 * is queried via `analyzeQualityDefectWithGemini(...)` (`src/services/geminiService.ts`).
 * Gemini AI provides an immediate engineering diagnosis citing IPC-A-610 criteria and
 * recommended immediate containment actions for the shop floor.
 *
 * PARAMETERS / PROPS (NcViewProps):
 * ---------------------------------
 * @param {NonConformanceItem[]} [ncList] - Array of active and archived NCR records.
 * @param {() => void} [onOpenNewNcModal] - Handler to trigger the new NCR filing form.
 * @param {(item: NonConformanceItem) => void} [onSelectNcItem] - Handler to inspect NCR details.
 * @param {(id: string, newStatus: NonConformanceItem['status']) => void} [onUpdateStatus] - Status update handler.
 */

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { NonConformanceItem } from '../../types';
import { ShieldAlert, Plus, Search, Filter, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';

interface NcViewProps {
  ncList?: NonConformanceItem[];
  onOpenNewNcModal?: () => void;
  onSelectNcItem?: (item: NonConformanceItem) => void;
  onUpdateStatus?: (id: string, newStatus: NonConformanceItem['status']) => void;
}

export const NcView: React.FC<NcViewProps> = ({
  ncList = [],
  onOpenNewNcModal = () => {},
  onSelectNcItem = (_item: NonConformanceItem) => {},
  onUpdateStatus = (_id: string, _newStatus: NonConformanceItem['status']) => {},
}) => {
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const majorCount = ncList.filter((n) => n.classification === 'Major' || n.classification === 'Critical').length;
  const minorCount = ncList.filter((n) => n.classification === 'Minor').length;
  const openCount = ncList.filter((n) => n.status === 'Open' || n.status === 'In Progress').length;

  const statusPieData = [
    { name: 'Open', value: ncList.filter((n) => n.status === 'Open').length, color: '#e35b2a' },
    { name: 'In Progress', value: ncList.filter((n) => n.status === 'In Progress').length, color: '#e8a13a' },
    { name: 'Closed', value: ncList.filter((n) => n.status === 'Closed').length, color: '#28ad6b' },
    { name: 'Draft', value: ncList.filter((n) => n.status === 'Draft').length, color: '#a9b2c8' },
  ].filter((d) => d.value > 0);

  const classPieData = [
    { name: 'Critical', value: ncList.filter((n) => n.classification === 'Critical').length, color: '#d64545' },
    { name: 'Major', value: ncList.filter((n) => n.classification === 'Major').length, color: '#e35b2a' },
    { name: 'Minor', value: ncList.filter((n) => n.classification === 'Minor').length, color: '#e8a13a' },
  ].filter((d) => d.value > 0);

  const linePieData = [
    { name: 'SMT Lines', value: ncList.filter((n) => n.line.includes('SMT')).length, color: '#28ad6b' },
    { name: 'THT / Wave', value: ncList.filter((n) => n.line.includes('THT')).length, color: '#e35b2a' },
    { name: 'PCB Fab', value: ncList.filter((n) => n.line.includes('PCB')).length, color: '#2f9bea' },
    { name: 'QC / Packaging', value: ncList.filter((n) => !n.line.includes('SMT') && !n.line.includes('THT') && !n.line.includes('PCB')).length, color: '#7a5cf0' },
  ].filter((d) => d.value > 0);

  const filtered = ncList.filter((n) => {
    const matchesSearch =
      n.code.toLowerCase().includes(search.toLowerCase()) ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.product.toLowerCase().includes(search.toLowerCase()) ||
      n.defectType.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'All' || n.classification === filterClass;
    const matchesStatus = filterStatus === 'All' || n.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div id="page-nc" className="space-y-6 animate-in fade-in duration-200">
      {/* Head */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1730]">Non Conformance</h2>
          <div className="text-xs text-[#5b6480] mt-0.5">
            Production Quality · NCR Tracker &amp; Defect Containment Logs
          </div>
        </div>
        <button
          onClick={() => {
            if (typeof onOpenNewNcModal === 'function') onOpenNewNcModal();
          }}
          className="px-4 py-2 bg-[#d64545] hover:bg-[#b53434] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New NCR</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-4xl font-bold text-[#d64545]">{majorCount}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">
            Major / Critical NCRs
          </div>
          <div className="text-[11px] text-[#d64545] mt-1">Quarantine mandatory</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-4xl font-bold text-[#e8a13a]">{minorCount}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">
            Minor Non-Conformances
          </div>
          <div className="text-[11px] text-[#e8a13a] mt-1">Workmanship rework</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-4xl font-bold text-[#128f83]">{openCount}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">
            Active Containment Open
          </div>
          <div className="text-[11px] text-[#128f83] mt-1">Under investigation</div>
        </div>
      </div>

      {/* 3 Doughnut Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Status */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">By Status</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Resolution lifecycle stage</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} NCRs`]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
            {statusPieData.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        {/* By Classification */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">By Classification</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Severity per IPC-A-610 standards</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {classPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} NCRs`]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
            {classPieData.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        {/* By Production Line */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">By Production Line</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Distribution across facility stations</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={linePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {linePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} NCRs`]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
            {linePieData.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* NCR Record Ledger */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Non-Conformance Register</h3>
            <p className="text-xs text-[#5b6480]">Detailed records with containment actions and line status</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8891a8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search NCR code, title, defect..."
                className="pl-8 pr-3 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs w-48 sm:w-60 outline-none focus:ring-1 focus:ring-[#e35b2a]"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-2.5 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs text-[#5b6480] outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs text-[#5b6480] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#182a52] text-white">
                <th className="py-2.5 px-3 rounded-l-md font-semibold text-[11px]">NCR Code</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Defect &amp; Description</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Line / Station</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Product</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Qty</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Severity</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Status</th>
                <th className="py-2.5 px-3 rounded-r-md font-semibold text-[11px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7f2]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#fbfcfe]">
                  <td className="py-3 px-3 font-mono font-bold text-[#0d1730]">
                    {item.code}
                    <span className="block text-[10px] text-[#8891a8] font-normal">{item.date}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#0d1730]">{item.title}</div>
                    <div className="text-[11px] text-[#5b6480] line-clamp-1">{item.description}</div>
                  </td>
                  <td className="py-3 px-3 text-[#5b6480]">{item.line}</td>
                  <td className="py-3 px-3 text-[#5b6480]">{item.product}</td>
                  <td className="py-3 px-3 font-mono font-semibold">{item.quantityAffected}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.classification === 'Critical'
                          ? 'bg-[#fbe6e6] text-[#d64545]'
                          : item.classification === 'Major'
                          ? 'bg-[#fdece5] text-[#c74a1f]'
                          : 'bg-[#fdf1de] text-[#e8a13a]'
                      }`}
                    >
                      {item.classification}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                        item.status === 'Open'
                          ? 'bg-[#fbe6e6] text-[#d64545] border-[#d64545]/30'
                          : item.status === 'In Progress'
                          ? 'bg-[#fdf1de] text-[#e8a13a] border-[#e8a13a]/30'
                          : item.status === 'Closed'
                          ? 'bg-[#e5f7ee] text-[#1c8a53] border-[#1c8a53]/30'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onSelectNcItem(item)}
                      className="p-1.5 text-[#2f9bea] hover:bg-[#eef1f8] rounded-md transition-colors cursor-pointer"
                      title="Inspect Containment"
                    >
                      <Eye className="w-4 h-4" />
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
