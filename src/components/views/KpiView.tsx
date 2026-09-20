import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { WORKER_KPIS_DATA } from '../../data/initialData';
import { WorkerKpi } from '../../types';
import { Search, Trophy, Medal, Filter, Download, Plus, Check } from 'lucide-react';

export const KpiView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLine, setFilterLine] = useState('All');
  const [workers, setWorkers] = useState<WorkerKpi[]>(WORKER_KPIS_DATA);
  const [showAddModal, setShowAddModal] = useState(false);

  // New evaluation form state
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newLine, setNewLine] = useState('SMT Line 1');
  const [newAttendance, setNewAttendance] = useState('24.0');
  const [newCompliance, setNewCompliance] = useState('10');
  const [newDailyTarget, setNewDailyTarget] = useState('18');
  const [newDefectId, setNewDefectId] = useState('18');
  const [newSop, setNewSop] = useState('14');

  const kpiAreaScores = [
    { area: 'IQC (Incoming)', score: 93, target: 90, color: '#1fb6a6' },
    { area: 'IPQC (In-Process)', score: 92, target: 90, color: '#1fb6a6' },
    { area: 'FQC (Final Check)', score: 91, target: 90, color: '#1fb6a6' },
    { area: 'DPMO Control', score: 87, target: 90, color: '#e8a13a' },
    { area: 'Supplier Quality', score: 81, target: 90, color: '#d64545' },
    { area: 'SOP Compliance', score: 93, target: 90, color: '#7a5cf0' },
  ];

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.employeeId.includes(searchTerm) ||
      w.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLine = filterLine === 'All' || w.line === filterLine;
    return matchesSearch && matchesLine;
  });

  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal =
      parseFloat(newAttendance) +
      parseFloat(newCompliance) +
      parseFloat(newDailyTarget) +
      parseFloat(newDefectId) +
      parseFloat(newSop);

    const newWorker: WorkerKpi = {
      id: `k-${Date.now()}`,
      name: newName,
      employeeId: newId,
      attendance: parseFloat(newAttendance),
      compliance: parseFloat(newCompliance),
      dailyTarget: parseFloat(newDailyTarget),
      defectId: parseFloat(newDefectId),
      sop: parseFloat(newSop),
      score: parseFloat(scoreVal.toFixed(1)),
      rank: workers.length + 1,
      line: newLine,
      role: 'Quality Inspector',
    };

    const updated = [...workers, newWorker].sort((a, b) => b.score - a.score);
    // re-rank
    const reRanked = updated.map((w, idx) => ({ ...w, rank: idx + 1 }));
    setWorkers(reRanked);
    setShowAddModal(false);
    setNewName('');
    setNewId('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Rank',
      'Employee Name',
      'Employee ID',
      'Line',
      'Role',
      'Attendance (20%)',
      'Process Compliance (20%)',
      'Daily Target (20%)',
      'Defect ID (20%)',
      'SOP Adherence (20%)',
      'Total Score (100)',
    ];
    const rows = workers.map((w) => [
      w.rank,
      w.name,
      w.employeeId,
      w.line,
      w.role,
      w.attendance,
      w.compliance,
      w.dailyTarget,
      w.defectId,
      w.sop,
      w.score,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Walton_QM_Worker_KPI_Ledger_Aug2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="page-kpi" className="space-y-6 animate-in fade-in duration-200">
      {/* Head */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1730]">KPI Performance</h2>
          <div className="text-xs text-[#5b6480] mt-0.5">
            Governance · Individual &amp; Area Quality Scoring System
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Score Evaluation</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-[#eef1f8] hover:bg-[#e2e7f2] border border-[#e2e7f2] text-[#0d1730] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Area Chart */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">KPI Area Performance</h3>
            <p className="text-xs text-[#5b6480]">Current achievement against 90% benchmark threshold</p>
          </div>
          <span className="text-xs text-[#5b6480] font-mono">Evaluation Period: August 2026</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiAreaScores} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
              <XAxis dataKey="area" stroke="#5b6480" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#5b6480" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(val: number) => [`${val}%`, 'Score']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {kpiAreaScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#5b6480] pt-3 border-t border-[#e2e7f2]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1fb6a6]" /> &gt;90% Compliant</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e8a13a]" /> 85-89% Watchlist</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#d64545]" /> &lt;85% Action Required</span>
        </div>
      </div>

      {/* Individual KPI Scores Table */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Individual KPI Scores</h3>
            <p className="text-xs text-[#5b6480]">Top performers &amp; frontline inspector scorecards</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8891a8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff, ID, or role..."
                className="pl-8 pr-3 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs w-44 sm:w-56 outline-none focus:ring-1 focus:ring-[#e35b2a]"
              />
            </div>
            <select
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
              className="px-2.5 py-1.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-xs text-[#5b6480] outline-none"
            >
              <option value="All">All Production Lines</option>
              <option value="SMT Line 1">SMT Line 1</option>
              <option value="PCB AOI Line 3">PCB AOI Line 3</option>
              <option value="THT Solder Line 2">THT Solder Line 2</option>
              <option value="PCBA Final QC">PCBA Final QC</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#182a52] text-white">
                <th className="py-2.5 px-3 rounded-l-md font-semibold text-[11px]">Rank</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Name</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Emp ID</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Line &amp; Station</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Attendance (25)</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Compliance (10)</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Daily Target (20)</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">Defect ID (20)</th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">SOP (15)</th>
                <th className="py-2.5 px-3 rounded-r-md font-semibold text-[11px]">KPI Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7f2]">
              {filteredWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-[#fbfcfe]">
                  <td className="py-2.5 px-3 font-mono font-bold">
                    {w.rank === 1 ? (
                      <span className="inline-flex items-center gap-1 text-[#e8a13a]">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>#1</span>
                      </span>
                    ) : w.rank === 3 ? (
                      <span className="inline-flex items-center gap-1 text-[#2f9bea]">
                        <Medal className="w-3.5 h-3.5" />
                        <span>#{w.rank}</span>
                      </span>
                    ) : (
                      <span className="text-[#5b6480]">#{w.rank}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#0d1730]">
                    {w.name}
                    <span className="block text-[10px] text-[#8891a8] font-normal">{w.role}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#5b6480]">{w.employeeId}</td>
                  <td className="py-2.5 px-3 text-[#5b6480]">{w.line}</td>
                  <td className="py-2.5 px-3 font-mono">{w.attendance}</td>
                  <td className="py-2.5 px-3 font-mono">{w.compliance}</td>
                  <td className="py-2.5 px-3 font-mono">{w.dailyTarget}</td>
                  <td className="py-2.5 px-3 font-mono">{w.defectId}</td>
                  <td className="py-2.5 px-3 font-mono">{w.sop}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                        w.score >= 95
                          ? 'bg-[#e5f7ee] text-[#1c8a53]'
                          : w.score >= 91
                          ? 'bg-[#eef1f8] text-[#22376b]'
                          : 'bg-[#fdf1de] text-[#c74a1f]'
                      }`}
                    >
                      {w.score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Evaluation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e7f2]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e2e7f2]">
              <h3 className="font-bold text-base text-[#0d1730]">Log Quality KPI Evaluation</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#5b6480] hover:text-[#0d1730] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvaluation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Inspector Full Name</label>
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mahfuzur Rahman"
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Employee ID</label>
                  <input
                    required
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="e.g. 48921"
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Assigned Line</label>
                <select
                  value={newLine}
                  onChange={(e) => setNewLine(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
                >
                  <option value="SMT Line 1">SMT Line 1</option>
                  <option value="SMT Line 2">SMT Line 2</option>
                  <option value="PCB AOI Line 3">PCB AOI Line 3</option>
                  <option value="THT Solder Line 2">THT Solder Line 2</option>
                  <option value="PCBA Final QC">PCBA Final QC</option>
                </select>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-[#5b6480]">Attendance (25)</label>
                  <input
                    type="number"
                    step="0.1"
                    max="25"
                    value={newAttendance}
                    onChange={(e) => setNewAttendance(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#e2e7f2] rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#5b6480]">Compliance (10)</label>
                  <input
                    type="number"
                    max="10"
                    value={newCompliance}
                    onChange={(e) => setNewCompliance(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#e2e7f2] rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#5b6480]">Target (20)</label>
                  <input
                    type="number"
                    max="20"
                    value={newDailyTarget}
                    onChange={(e) => setNewDailyTarget(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#e2e7f2] rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#5b6480]">Defect ID (20)</label>
                  <input
                    type="number"
                    max="20"
                    value={newDefectId}
                    onChange={(e) => setNewDefectId(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#e2e7f2] rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#5b6480]">SOP (15)</label>
                  <input
                    type="number"
                    max="15"
                    value={newSop}
                    onChange={(e) => setNewSop(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#e2e7f2] rounded font-mono text-center"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#e2e7f2] rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white rounded-lg font-bold"
                >
                  Save &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
