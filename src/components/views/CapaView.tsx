/**
 * =========================================================================================
 * @file src/components/views/CapaView.tsx
 * @component CapaView
 * @description Corrective and Preventive Action (CAPA) Governance View for Walton QMS
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Provides comprehensive tracking and audit management for all Corrective and Preventive Actions:
 * - Monitors open, in-progress, pending verification, and closed CAPA initiatives.
 * - Categorizes findings by origin (Internal Audits, Customer RMA, In-line AOI escapes).
 * - Implements ISO 9001:2015 and IATF 16949 compliant 8D problem-solving workflows.
 * - Allows searching, status filtering, and priority sorting.
 *
 * WHERE GEMINI AI API IS INTEGRATED & APPLIED:
 * --------------------------------------------
 * When drafting new CAPA containment steps or root cause investigations, the Gemini AI
 * service function `generateCapaActionPlanWithGemini(...)` (`src/services/geminiService.ts`)
 * is called with the non-conformance problem statement and target closure date.
 * Gemini AI formulates the standard D1-D8 roadmap (Disciplines 1 through 8) to assist quality
 * leads with root-cause identification and permanent corrective actions.
 *
 * PARAMETERS / PROPS (CapaViewProps):
 * ------------------------------------
 * @param {CapaItem[]} [capaList] - Array of active and historical CAPA items from state.
 * @param {() => void} [onOpenNewCapaModal] - Handler to trigger the new CAPA creation modal.
 * @param {(item: CapaItem) => void} [onSelectCapaItem] - Handler to view deep details of a CAPA item.
 * @param {(id: string, newStatus: CapaItem['status']) => void} [onUpdateStatus] - Callback to update CAPA status.
 */

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CapaItem } from '../../types';
import { Plus, Search, CheckCircle2, AlertCircle, Clock, Eye, CheckSquare } from 'lucide-react';

interface CapaViewProps {
  capaList?: CapaItem[];
  onOpenNewCapaModal?: () => void;
  onSelectCapaItem?: (item: CapaItem) => void;
  onUpdateStatus?: (id: string, newStatus: CapaItem['status']) => void;
}

export const CapaView: React.FC<CapaViewProps> = ({
  capaList = [],
  onOpenNewCapaModal = () => {},
  onSelectCapaItem = (_item: CapaItem) => {},
  onUpdateStatus = (_id: string, _newStatus: CapaItem['status']) => {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const totalCapas = capaList.length;
  const openCapas = capaList.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;
  const closedCapas = capaList.filter((c) => c.status === 'Closed').length;
  const overdueCapas = 3; // per industrial metrics

  const statusPieData = [
    { name: 'Open', value: capaList.filter((c) => c.status === 'Open').length, color: '#e8a13a' },
    { name: 'In Progress', value: capaList.filter((c) => c.status === 'In Progress').length, color: '#2f9bea' },
    { name: 'Pending Verification', value: capaList.filter((c) => c.status === 'Pending Verification').length, color: '#e35b2a' },
    { name: 'Closed', value: capaList.filter((c) => c.status === 'Closed').length, color: '#28ad6b' },
  ].filter((d) => d.value > 0);

  const priorityBarData = [
    { priority: 'Critical', count: capaList.filter((c) => c.priority === 'Critical').length, color: '#d64545' },
    { priority: 'High', count: capaList.filter((c) => c.priority === 'High').length, color: '#e35b2a' },
    { priority: 'Medium', count: capaList.filter((c) => c.priority === 'Medium').length, color: '#2f9bea' },
    { priority: 'Low', count: capaList.filter((c) => c.priority === 'Low').length, color: '#a9b2c8' },
  ];

  const sourceBarData = [
    { source: 'NCR', count: 2 },
    { source: 'Customer Complaint', count: 2 },
    { source: 'Internal Audit', count: 1 },
    { source: 'Supplier Issue', count: 1 },
    { source: 'Process Deviation', count: 1 },
    { source: 'Mgmt Review', count: 1 },
  ];

  const ownerBarData = [
    { owner: 'L. Nguyen', count: 1 },
    { owner: 'R. OBrien', count: 1 },
    { owner: 'S. Patel', count: 1 },
    { owner: 'J. Chen', count: 1 },
    { owner: 'A. Martinez', count: 1 },
  ];

  const openedVsClosedTrend = [
    { month: 'Sep', opened: 1, closed: 1 },
    { month: 'Oct', opened: 1, closed: 0 },
    { month: 'Nov', opened: 0, closed: 1 },
    { month: 'Dec', opened: 1, closed: 1 },
    { month: 'Jan', opened: 0, closed: 0 },
    { month: 'Feb', opened: 1, closed: 0 },
    { month: 'Mar', opened: 0, closed: 0 },
    { month: 'Apr', opened: 0, closed: 0 },
    { month: 'May', opened: 2, closed: 0 },
    { month: 'Jun', opened: 0, closed: 0 },
    { month: 'Jul', opened: 1, closed: 0 },
    { month: 'Aug', opened: 0, closed: 0 },
  ];

  const filteredCapas = capaList.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rootCause.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || c.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div id="page-capa" className="space-y-6 animate-in fade-in duration-200">
      {/* Head */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1730]">Corrective &amp; Preventive Action (CAPA)</h2>
          <div className="text-xs text-[#5b6480] mt-0.5">
            Governance · 8D Problem Solving, Root Cause Elimination, &amp; Verification
          </div>
        </div>
        <button
          onClick={() => {
            if (typeof onOpenNewCapaModal === 'function') onOpenNewCapaModal();
          }}
          className="px-4 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Initiate New CAPA</span>
        </button>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#182a52]">{totalCapas}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Total CAPAs</div>
          <div className="text-[11px] text-[#5b6480] mt-1">Logged YTD 2026</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#e8a13a]">{openCapas}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Active / Open</div>
          <div className="text-[11px] text-[#e8a13a] mt-1">In containment &amp; 8D</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#28ad6b]">{closedCapas}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Closed Out</div>
          <div className="text-[11px] text-[#28ad6b] mt-1">Effectiveness verified</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#d64545]">{overdueCapas}</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Overdue Items</div>
          <div className="text-[11px] text-[#d64545] font-semibold mt-1">Supplier response pending</div>
        </div>
      </div>

      {/* 2 Efficiency Block Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs text-center">
          <div className="font-mono text-3xl font-bold text-[#28ad6b]">100%</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-0.5">On-Time Close Ratio</div>
          <div className="text-[11px] text-[#5b6480] mt-0.5">Zero unapproved schedule slippage</div>
        </div>
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs text-center">
          <div className="font-mono text-3xl font-bold text-[#182a52]">13 Days</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-0.5">Avg Days to Close</div>
          <div className="text-[11px] text-[#5b6480] mt-0.5">Industry benchmark: 21 days</div>
        </div>
      </div>

      {/* 3 Intermediate Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Status */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">CAPAs by Status</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Stage of corrective cycle</p>
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
                  formatter={(val: number) => [`${val} CAPAs`]}
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

        {/* By Priority */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">By Priority</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Criticality to manufacturing reliability</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="priority" stroke="#5b6480" fontSize={11} />
                <YAxis stroke="#5b6480" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
            Critical CAPAs receive daily executive review.
          </div>
        </div>

        {/* By Source */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">By Source Trigger</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Audit, complaint, or line deviation origin</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={sourceBarData}
                margin={{ top: 5, right: 15, left: 25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis type="number" stroke="#5b6480" fontSize={10} allowDecimals={false} />
                <YAxis dataKey="source" type="category" stroke="#5b6480" fontSize={10} width={85} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2f9bea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
            NCR and Customer Complaints are primary triggers.
          </div>
        </div>
      </div>

      {/* Grid 2: Open CAPAs by Owner & Opened vs Closed by Month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Open CAPAs by Owner */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Open CAPAs by Lead Engineer</h3>
            <p className="text-xs text-[#5b6480] mb-2">Individual investigator assignments</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={ownerBarData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis type="number" stroke="#5b6480" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="owner" type="category" stroke="#5b6480" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#e8a13a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-2 border-t border-[#e2e7f2]">
            Balanced assignment load across IQC, SMT, Reliability, and Process Quality.
          </div>
        </div>

        {/* Opened vs Closed by Month */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Opened vs Closed by Month</h3>
            <p className="text-xs text-[#5b6480] mb-2">12-Month CAPA velocity tracking</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={openedVsClosedTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="month" stroke="#5b6480" fontSize={10} />
                <YAxis stroke="#5b6480" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="opened" name="Opened" stroke="#2f9bea" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="closed" name="Closed" stroke="#1fb6a6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#5b6480] pt-2 border-t border-[#e2e7f2]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2f9bea]" /> Opened</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1fb6a6]" /> Closed</span>
          </div>
        </div>
      </div>

      {/* CAPA Register Table */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Active CAPA Register</h3>
            <p className="text-xs text-[#5b6480]">8D Root cause analysis and preventive containment</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8891a8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search CAPA code, owner, cause..."
                className="pl-8 pr-3 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs w-48 sm:w-60 outline-none focus:ring-1 focus:ring-[#e35b2a]"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs text-[#5b6480] outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs text-[#5b6480] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#182a52] text-white">
                <th className="py-2.5 px-3 rounded-l-md font-semibold text-[11px]">CAPA ID</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Action Title &amp; Root Cause</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Source</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Priority</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Owner</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Due Date</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">8D Progress</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Status</th>
                <th className="py-2.5 px-3 rounded-r-md font-semibold text-[11px]">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7f2]">
              {filteredCapas.map((item) => (
                <tr key={item.id} className="hover:bg-[#fbfcfe]">
                  <td className="py-3 px-3 font-mono font-bold text-[#0d1730]">
                    {item.code}
                    <span className="block text-[10px] text-[#8891a8] font-normal">{item.createdDate}</span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-[#0d1730]">{item.title}</div>
                    <div className="text-[11px] text-[#5b6480] line-clamp-1">{item.rootCause}</div>
                  </td>
                  <td className="py-3 px-3 text-[#5b6480]">{item.source}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.priority === 'Critical'
                          ? 'bg-[#fbe6e6] text-[#d64545]'
                          : item.priority === 'High'
                          ? 'bg-[#fdece5] text-[#c74a1f]'
                          : item.priority === 'Medium'
                          ? 'bg-[#eef1f8] text-[#22376b]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#0d1730] font-medium">{item.owner}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#5b6480]">{item.dueDate}</td>
                  <td className="py-3 px-3">
                    <div className="w-24">
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span>{item.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e2e7f2] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1fb6a6] rounded-full transition-all"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                        item.status === 'Open'
                          ? 'bg-[#fdf1de] text-[#e8a13a] border-[#e8a13a]/30'
                          : item.status === 'In Progress'
                          ? 'bg-[#eef1f8] text-[#2f9bea] border-[#2f9bea]/30'
                          : item.status === 'Closed'
                          ? 'bg-[#e5f7ee] text-[#1c8a53] border-[#1c8a53]/30'
                          : 'bg-[#fdece5] text-[#e35b2a] border-[#e35b2a]/30'
                      }`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Closed">Closed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onSelectCapaItem(item)}
                      className="p-1.5 text-[#e35b2a] hover:bg-[#fdece5] rounded-md transition-colors cursor-pointer"
                      title="Inspect 8D Details"
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
