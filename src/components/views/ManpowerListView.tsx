import React, { useState, useEffect, useMemo } from 'react';
import { PageId } from '../../types';
import {
  Users,
  Search,
  Plus,
  Download,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Layers,
  Cpu,
  CircuitBoard,
  X,
  Save,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ManpowerEmployee } from '../../data/manpowerRecords';
import {
  getStoredManpower,
  subscribeManpower,
  saveManpowerEmployee,
  deleteManpowerEmployee,
} from '../../services/manpowerService';
import { WaltonSealLogo } from '../WaltonSealLogo';

interface ManpowerListViewProps {
  onNavigate?: (page: PageId) => void;
}

export const ManpowerListView: React.FC<ManpowerListViewProps> = ({
  onNavigate = (_page: PageId) => {},
}) => {
  const [employees, setEmployees] = useState<ManpowerEmployee[]>(() => getStoredManpower());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'ALL' | 'SMT' | 'MI' | 'PCB'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<ManpowerEmployee | null>(null);
  const [formSl, setFormSl] = useState<number>(1);
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formDept, setFormDept] = useState('QM');
  const [formSection, setFormSection] = useState('SMT');
  const [formDesignation, setFormDesignation] = useState('QA Inspector');
  const [formStatus, setFormStatus] = useState('Active');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = subscribeManpower((updated) => {
      setEmployees(updated);
    });
    return () => unsubscribe();
  }, []);

  // Section statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const smtCount = employees.filter((e) => e.section === 'SMT').length;
    const miCount = employees.filter((e) => e.section === 'MI').length;
    const pcbCount = employees.filter((e) => e.section === 'PCB').length;
    const activeCount = employees.filter((e) => e.status === 'Active').length;
    return { total, smtCount, miCount, pcbCount, activeCount };
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedSection !== 'ALL' && emp.section !== selectedSection) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesId = emp.employeeId.toLowerCase().includes(q);
        const matchesSection = emp.section.toLowerCase().includes(q);
        const matchesDesignation = emp.designation?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesId && !matchesSection && !matchesDesignation) {
          return false;
        }
      }
      return true;
    });
  }, [employees, selectedSection, searchQuery]);

  // Modal open helpers
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    const maxSl = employees.length > 0 ? Math.max(...employees.map((e) => e.sl || 0)) + 1 : 1;
    setFormSl(maxSl);
    setFormName('');
    setFormId('');
    setFormDept('QM');
    setFormSection('SMT');
    setFormDesignation('QA Inspector');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: ManpowerEmployee) => {
    setEditingEmployee(emp);
    setFormSl(emp.sl);
    setFormName(emp.name);
    setFormId(emp.employeeId);
    setFormDept(emp.department || 'QM');
    setFormSection(emp.section);
    setFormDesignation(emp.designation || 'QA Inspector');
    setFormStatus(emp.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Employee name is required', 'error');
      return;
    }
    if (!formId.trim()) {
      showToast('Employee ID is required', 'error');
      return;
    }

    const payload: ManpowerEmployee = {
      sl: formSl,
      name: formName.trim(),
      employeeId: formId.trim(),
      department: formDept.trim() || 'QM',
      section: formSection,
      designation: formDesignation.trim() || 'QA Inspector',
      status: formStatus,
    };

    try {
      await saveManpowerEmployee(payload);
      setIsModalOpen(false);
      showToast(`Employee "${payload.name}" (${payload.employeeId}) saved successfully!`, 'success');
    } catch (err: any) {
      showToast('Failed to save employee: ' + (err?.message || 'Error'), 'error');
    }
  };

  const handleDeleteEmployee = async (emp: ManpowerEmployee) => {
    if (window.confirm(`Are you sure you want to remove "${emp.name}" (ID: ${emp.employeeId})?`)) {
      try {
        await deleteManpowerEmployee(emp.employeeId);
        showToast(`Employee "${emp.name}" removed.`, 'success');
      } catch (err: any) {
        showToast('Failed to delete employee: ' + (err?.message || 'Error'), 'error');
      }
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (filteredEmployees.length === 0) {
      showToast('No employee records to export', 'error');
      return;
    }
    const headers = ['S/L', 'Name of employee', 'ID', 'Department', 'Section', 'Designation', 'Status'];
    const rows = filteredEmployees.map((e) => [
      e.sl,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.employeeId}"`,
      e.department,
      e.section,
      `"${e.designation || 'QA Inspector'}"`,
      e.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `walton_qm_manpower_list_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully', 'success');
  };

  // Section Badge Style Helper
  const getSectionBadge = (section: string) => {
    switch (section) {
      case 'SMT':
        return 'bg-blue-500/15 text-blue-700 border-blue-300 font-bold';
      case 'MI':
        return 'bg-amber-500/15 text-amber-800 border-amber-300 font-bold';
      case 'PCB':
        return 'bg-emerald-500/15 text-emerald-800 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div id="page-manpower-view" className="space-y-6 pb-12 print:p-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-6 z-50 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-3 ${
            toastMessage.type === 'success' ? 'bg-[#16a34a] text-white' : 'bg-[#dc2626] text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner / Corporate Masthead */}
      <div className="bg-gradient-to-r from-[#0d1730] via-[#122247] to-[#1c3368] text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-[#233a72] relative overflow-hidden print:hidden">
        {/* Subtle Watermark Seal */}
        <div className="absolute right-4 -bottom-6 w-56 h-56 opacity-5 pointer-events-none">
          <WaltonSealLogo className="w-full h-full object-contain" animated={false} />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 p-2 border border-white/20 shadow-md shrink-0 flex items-center justify-center">
              <WaltonSealLogo className="w-full h-full object-contain select-none" animated={false} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  WALTON HI-TECH INDUSTRIES PLC
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Quality Management — Manpower List
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddModal}
              id="btn-add-manpower"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#e35b2a] hover:bg-[#d04a1a] text-white shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Total QM Manpower */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e2e8f0] shadow-xs flex items-center justify-between">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#64748b] text-center">
              Total QM Staff
            </span>
            <div className="flex items-center justify-center mt-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#0f2942] text-center">
                {stats.total}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 ml-3">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* SMT Section */}
        <div
          onClick={() => setSelectedSection(selectedSection === 'SMT' ? 'ALL' : 'SMT')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            selectedSection === 'SMT'
              ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20'
              : 'border-[#e2e8f0] hover:border-blue-300'
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#64748b] text-center">
                SMT Section
              </span>
              {selectedSection === 'SMT' && (
                <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded">
                  Filtered
                </span>
              )}
            </div>
            <div className="flex items-center justify-center mt-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-blue-700 text-center">
                {stats.smtCount}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0 ml-3">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* MI Section */}
        <div
          onClick={() => setSelectedSection(selectedSection === 'MI' ? 'ALL' : 'MI')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            selectedSection === 'MI'
              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20'
              : 'border-[#e2e8f0] hover:border-amber-300'
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#64748b] text-center">
                MI Section
              </span>
              {selectedSection === 'MI' && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">
                  Filtered
                </span>
              )}
            </div>
            <div className="flex items-center justify-center mt-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-700 text-center">
                {stats.miCount}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0 ml-3">
            <CircuitBoard className="w-6 h-6" />
          </div>
        </div>

        {/* PCB Section */}
        <div
          onClick={() => setSelectedSection(selectedSection === 'PCB' ? 'ALL' : 'PCB')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            selectedSection === 'PCB'
              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20'
              : 'border-[#e2e8f0] hover:border-emerald-300'
          }`}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#64748b] text-center">
                PCB Section
              </span>
              {selectedSection === 'PCB' && (
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">
                  Filtered
                </span>
              )}
            </div>
            <div className="flex items-center justify-center mt-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-700 text-center">
                {stats.pcbCount}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold shrink-0 ml-3">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Card: Toolbar + Table / Grid */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] bg-[#fafbfc] flex flex-wrap items-center justify-between gap-4 print:hidden">
          {/* Section Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#eef2f6] rounded-xl text-xs font-bold">
            {(
              [
                { id: 'ALL', label: 'All Sections', count: stats.total },
                { id: 'SMT', label: 'SMT Section', count: stats.smtCount },
                { id: 'MI', label: 'MI Section', count: stats.miCount },
                { id: 'PCB', label: 'PCB Section', count: stats.pcbCount },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSection(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSection === tab.id
                    ? 'bg-white text-[#0f2942] shadow-xs font-extrabold'
                    : 'text-[#64748b] hover:text-[#0f2942]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    selectedSection === tab.id ? 'bg-[#2563eb] text-white' : 'bg-[#cbd5e1] text-[#334155]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + Layout Mode Toggle */}
          <div className="flex items-center gap-2.5 flex-1 sm:flex-initial justify-end">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID (e.g. 37078)..."
                className="w-full pl-9 pr-3.5 py-2 border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#1e293b] font-medium outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#334155]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-[#cbd5e1] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('table')}
                title="Table View (Official Document Style)"
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#0f2942] text-white' : 'text-[#64748b] hover:bg-slate-50'
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#0f2942] text-white' : 'text-[#64748b] hover:bg-slate-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block p-6 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black">Walton Quality Management Directorate</h1>
              <h2 className="text-base font-bold text-gray-700">Official Manpower List — SMT, MI &amp; PCB</h2>
              <p className="text-xs text-gray-500 mt-1">
                Filter: {selectedSection === 'ALL' ? 'All Sections' : `${selectedSection} Section`} · Total records: {filteredEmployees.length} · Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right font-mono text-xs text-gray-500">
              Doc ID: QM-HR-ROSTER-2026
            </div>
          </div>
        </div>

        {/* VIEW 1: TABLE VIEW (Official Document Presentation) */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-[#0f2942] text-white font-bold sticky top-0 z-10 select-none">
                <tr>
                  <th className="py-3 px-4 w-16 text-center whitespace-nowrap">S/L</th>
                  <th className="py-3 px-4 whitespace-nowrap">Name of employee</th>
                  <th className="py-3 px-4 whitespace-nowrap font-mono text-center">ID</th>
                  <th className="py-3 px-4 whitespace-nowrap text-center">Department</th>
                  <th className="py-3 px-4 whitespace-nowrap text-center">Section</th>
                  <th className="py-3 px-4 whitespace-nowrap">Designation</th>
                  <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[#1e293b]">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-[#94a3b8]">
                      No employees match your filter or search query.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    return (
                      <tr
                        key={emp.employeeId}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* S/L */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#64748b]">
                          <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xs text-[#0f2942]">
                            {emp.sl}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 select-none">
                              {emp.name
                                .split(' ')
                                .map((w) => w[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-[#0f2942] group-hover:text-blue-700 transition-colors">
                                {emp.name}
                              </p>
                              <p className="text-[11px] text-[#94a3b8] font-medium">
                                Walton QM Directorate
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Employee ID */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <span className="font-mono font-bold text-[#0f2942] px-2.5 py-1 rounded-md bg-[#f1f5f9] border border-[#e2e8f0] text-xs">
                            {emp.employeeId}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {emp.department || 'QM'}
                          </span>
                        </td>

                        {/* Section */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <span
                            className={`font-mono text-xs px-3 py-1 rounded-lg border inline-flex items-center justify-center ${getSectionBadge(
                              emp.section
                            )}`}
                          >
                            {emp.section}
                          </span>
                        </td>

                        {/* Designation */}
                        <td className="py-3 px-4 whitespace-nowrap text-[#475569] font-medium text-xs">
                          {emp.designation || 'QA Inspector'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {emp.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap print:hidden">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              title="Edit employee info"
                              className="p-1.5 rounded-lg border border-[#e2e8f0] bg-white hover:bg-blue-50 hover:text-blue-600 text-[#64748b] transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              title="Delete employee"
                              className="p-1.5 rounded-lg border border-[#e2e8f0] bg-white hover:bg-red-50 hover:text-red-600 text-[#64748b] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: DIRECTORY GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-[#94a3b8]">
                No employees match your filter or search query.
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="bg-white rounded-xl p-4 border border-[#e2e8f0] hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: S/L + Section badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#64748b]">#{emp.sl}</span>
                      <span
                        className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${getSectionBadge(
                          emp.section
                        )}`}
                      >
                        {emp.section}
                      </span>
                    </div>

                    {/* Employee Profile Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0f2942] to-[#1e3a6a] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 select-none">
                        {emp.name
                          .split(' ')
                          .map((w) => w[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-[#0f2942] text-sm truncate group-hover:text-blue-600 transition-colors">
                          {emp.name}
                        </h3>
                        <p className="text-xs font-mono text-[#64748b]">ID: {emp.employeeId}</p>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="bg-[#f8fafc] rounded-lg p-2.5 space-y-1 text-xs text-[#475569]">
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Department:</span>
                        <span className="font-bold text-[#0f2942]">{emp.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Role:</span>
                        <span className="font-medium text-[#0f2942]">{emp.designation || 'QA Inspector'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8]">Status:</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {emp.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#f1f5f9] mt-3 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="px-2.5 py-1 text-xs rounded border border-[#cbd5e1] hover:bg-blue-50 hover:text-blue-700 font-semibold text-[#475569] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp)}
                      className="px-2.5 py-1 text-xs rounded border border-[#cbd5e1] hover:bg-red-50 hover:text-red-700 font-semibold text-[#475569] transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Summary Bar */}
        <div className="px-5 py-3.5 bg-[#fafbfc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between text-xs text-[#64748b] gap-3">
          <div>
            Showing <strong className="text-[#0f2942]">{filteredEmployees.length}</strong> of{' '}
            <strong className="text-[#0f2942]">{employees.length}</strong> employees in Quality Management Directorate
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>SMT ({stats.smtCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>MI ({stats.miCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PCB ({stats.pcbCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f2942]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0d1730] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingEmployee ? 'Edit Manpower Employee' : 'Add New Manpower Employee'}
                  </h3>
                  <p className="text-xs text-[#b2c2e6]">Walton Quality Management Personnel</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* S/L */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Serial No. (S/L)
                  </label>
                  <input
                    type="number"
                    value={formSl}
                    onChange={(e) => setFormSl(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm font-semibold outline-none focus:border-[#2563eb]"
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. 37078"
                    required
                    disabled={Boolean(editingEmployee)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm font-mono font-bold outline-none focus:border-[#2563eb] disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">
                  Name of Employee <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rubel Hosen"
                  required
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm font-semibold outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Department</label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="QM"
                    required
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm font-semibold outline-none focus:border-[#2563eb]"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Section</label>
                  <select
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm font-semibold outline-none focus:border-[#2563eb] bg-white"
                  >
                    <option value="SMT">SMT</option>
                    <option value="MI">MI</option>
                    <option value="PCB">PCB</option>
                    <option value="IQC">IQC</option>
                    <option value="ESD">ESD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Designation */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Designation</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="QA Inspector / Senior QA Inspector"
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm font-semibold outline-none focus:border-[#2563eb]"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm font-semibold outline-none focus:border-[#2563eb] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#475569] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
