import React, { useState, useMemo } from 'react';
import { PageId } from '../../types';
import {
  ClipboardList,
  CheckSquare,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  Plus,
  Filter,
  RefreshCw,
  FileText,
  Layers,
  Cpu,
  User,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  Calendar,
  Sparkles,
  ArrowUpDown,
  X,
  ExternalLink,
  ChevronRight,
  Folder,
  Tag,
  Hash,
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  token: string;
  assignee: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'IN PROGRESS' | 'COMPLETED' | 'ON HOLD';
  progressDone: number;
  progressTotal: number;
  deadline: string;
  isOverdue?: boolean;
  daysLate?: number;
  space?: string;
  category?: string;
}

interface TaskManagerViewProps {
  onNavigate?: (page: PageId) => void;
}

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  onNavigate = (_page: PageId) => {},
}) => {
  // Navigation tabs at the top
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requisitions' | 'templates'>('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [selectedSpace, setSelectedSpace] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestReportsModalOpen, setIsTestReportsModalOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskItem | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskToken, setNewTaskToken] = useState('QM-' + Math.floor(100000 + Math.random() * 900000));
  const [newTaskAssignee, setNewTaskAssignee] = useState('38949');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newTaskStatus, setNewTaskStatus] = useState<'IN PROGRESS' | 'COMPLETED' | 'ON HOLD'>('IN PROGRESS');
  const [newTaskTotalSubtasks, setNewTaskTotalSubtasks] = useState<number>(0);
  const [newTaskDeadline, setNewTaskDeadline] = useState('Sep 18');
  const [newTaskSpace, setNewTaskSpace] = useState('SMT in PCBA-2023');

  // Initial Task Dataset directly replicating user screenshot
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 't-1',
      title: 'M32LU3FGQ MP software check',
      token: 'MMSC-003796-A14',
      assignee: '38949',
      priority: 'HIGH',
      status: 'IN PROGRESS',
      progressDone: 0,
      progressTotal: 277,
      deadline: 'Sep 1',
      isOverdue: true,
      daysLate: 12,
      space: 'SMT in PCBA-2023',
      category: 'Software Validation',
    },
    {
      id: 't-2',
      title: 'New Expressluck 43inch TV with 1.5GB RAM',
      token: 'NE4TW-174487-E67',
      assignee: 'task_manager1',
      priority: 'MEDIUM',
      status: 'IN PROGRESS',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Sep 9',
      isOverdue: true,
      daysLate: 4,
      space: 'SMT in PCBA-2023',
      category: 'Trial Production',
    },
    {
      id: 't-3',
      title: 'WGRC-04 (HKC) Remote Check',
      token: 'W(RC-845987-685',
      assignee: '38949',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Sep 8',
      space: 'SMT in PCBA-2023',
      category: 'Peripheral Quality',
    },
    {
      id: 't-4',
      title: 'MARCEL M43LU3UGQ Software check',
      token: 'MMSC-752975-21A',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 277,
      progressTotal: 277,
      deadline: 'Sep 7',
      space: 'SMT in PCBA-2023',
      category: 'Software Validation',
    },
    {
      id: 't-5',
      title: 'App checking in Google TV',
      token: 'ACIGT-756875-581',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Sep 7',
      space: 'SMT in PCBA-2023',
      category: 'App Integration',
    },
    {
      id: 't-6',
      title: 'Remote not working check in W55G5Y Check',
      token: 'RNWCI-577851-B09',
      assignee: 'task_manager1',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Sep 5',
      space: 'SMT in PCBA-2023',
      category: 'Process Fault',
    },
    {
      id: 't-7',
      title: 'Software Checking of W55SA3UGQ & M55LU3UGQ',
      token: 'SCOW&-174325-3A0',
      assignee: 'task_manager1',
      priority: 'HIGH',
      status: 'IN PROGRESS',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Sep 2',
      isOverdue: true,
      daysLate: 11,
      space: 'SMT in PCBA-2023',
      category: 'Software Validation',
    },
    {
      id: 't-8',
      title: 'M40LU3FGQ MP software check.',
      token: 'MMSC-002704-B43',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 277,
      progressTotal: 280,
      deadline: 'Aug 31',
      space: 'SMT in PCBA-2023',
      category: 'Software Validation',
    },
    {
      id: 't-9',
      title: 'Please check the audio output of the W40SA3FGQ and W32SA3FGQ model after installing the new software.',
      token: 'PCTA0-174616-9AB',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Aug 31',
      space: 'SMT in PCBA-2023',
      category: 'Audio Testing',
    },
    {
      id: 't-10',
      title: 'Check the audio output on the M43LU3FGQ with multiple software updates.',
      token: 'CTA00-158240-74F',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Aug 20',
      space: 'SMT in PCBA-2023',
      category: 'Audio Testing',
    },
    {
      id: 't-11',
      title: 'Check the audio output on W43SA3UGQ and W40SA3FGQ with the new software.',
      token: 'CTA00-157939-A15',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Aug 22',
      space: 'SMT in PCBA-2023',
      category: 'Audio Testing',
    },
    {
      id: 't-12',
      title: 'Need to check the audio output on the W40SA3FGQ model.',
      token: 'NTCTA-157395-D4D',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Aug 18',
      space: 'SMT in PCBA-2023',
      category: 'Audio Testing',
    },
    {
      id: 't-13',
      title: 'Need to check the voice search using the WGERC-09 remote.',
      token: 'NTCTV-157152-096',
      assignee: '38949',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Aug 10',
      space: 'SMT in PCBA-2023',
      category: 'Peripheral Quality',
    },
    {
      id: 't-14',
      title: 'We need to collect the detailed dimensions for the following models: W43G5A, W50G5Y, W55G5Y, W65G5Y, W75G5Y, and W85G5Y.',
      token: 'WNTCT-063393-C9C',
      assignee: '38949',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Aug 29',
      space: 'SMT in PCBA-2023',
      category: 'Dimensional QA',
    },
    {
      id: 't-15',
      title: 'Software Checking of W65SA3UGQ',
      token: 'SCOW-002628-202',
      assignee: 'task_manager1',
      priority: 'HIGH',
      status: 'COMPLETED',
      progressDone: 0,
      progressTotal: 0,
      deadline: 'Aug 29',
      space: 'SMT in PCBA-2023',
      category: 'Software Validation',
    },
    {
      id: 't-16',
      title: 'NEW Software check of sample TV(32KA1Q-Expressluck)',
      token: 'NSCST-019284-912',
      assignee: '38949',
      priority: 'HIGH',
      status: 'ON HOLD',
      progressDone: 45,
      progressTotal: 277,
      deadline: 'Jan 15',
      isOverdue: true,
      daysLate: 241,
      space: 'SMT in PCBA-2023',
      category: 'Trial Production',
    },
    {
      id: 't-17',
      title: 'BGA Solder Joint Cross-Section Voiding Check (SMT-1 Line)',
      token: 'BGA-CS-2026-09A',
      assignee: 'QM-Inspector-02',
      priority: 'HIGH',
      status: 'IN PROGRESS',
      progressDone: 14,
      progressTotal: 20,
      deadline: 'Sep 13',
      space: 'SMT in PCBA-2023',
      category: 'Process Fault',
    },
  ]);

  // Calculations for Metrics Row
  const totalTasksCount = 95; // Base indicator matching user mockup
  const inProgressCount = tasks.filter((t) => t.status === 'IN PROGRESS').length;
  const onHoldCount = tasks.filter((t) => t.status === 'ON HOLD').length;
  const overdueCount = tasks.filter((t) => t.isOverdue).length;
  const criticalCount = 0;
  const doneLast7DaysCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority;
      const matchesStatus =
        selectedStatus === 'ALL'
          ? true
          : selectedStatus === 'OVERDUE'
          ? task.isOverdue
          : task.status === selectedStatus;
      const matchesAssignee = selectedAssignee === 'ALL' || task.assignee === selectedAssignee;
      const matchesSpace = selectedSpace === 'ALL' || task.space === selectedSpace;

      return matchesSearch && matchesPriority && matchesStatus && matchesAssignee && matchesSpace;
    });
  }, [tasks, searchQuery, selectedPriority, selectedStatus, selectedAssignee, selectedSpace]);

  // Handle Quick Status Change
  const handleStatusToggle = (taskId: string, newStatus: 'IN PROGRESS' | 'COMPLETED' | 'ON HOLD') => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isComp = newStatus === 'COMPLETED';
          return {
            ...t,
            status: newStatus,
            progressDone: isComp && t.progressTotal > 0 ? t.progressTotal : t.progressDone,
            isOverdue: isComp ? false : t.isOverdue,
          };
        }
        return t;
      })
    );
  };

  // Handle Add New Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const created: TaskItem = {
      id: 't-' + Date.now(),
      title: newTaskTitle.trim(),
      token: newTaskToken || 'QM-' + Math.floor(100000 + Math.random() * 900000),
      assignee: newTaskAssignee,
      priority: newTaskPriority,
      status: newTaskStatus,
      progressDone: newTaskStatus === 'COMPLETED' ? newTaskTotalSubtasks : 0,
      progressTotal: newTaskTotalSubtasks,
      deadline: newTaskDeadline || 'Sep 20',
      space: newTaskSpace,
      category: 'Quality Check',
    };

    setTasks([created, ...tasks]);
    setNewTaskTitle('');
    setNewTaskToken('QM-' + Math.floor(100000 + Math.random() * 900000));
    setNewTaskTotalSubtasks(0);
    setIsCreateModalOpen(false);
  };

  // Requisitions Mock Data
  const requisitionsList = [
    { id: 'REQ-2026-09-01', material: 'SAC305 Lead-Free Solder Bar', qty: '500 KG', line: 'Wave Solder MI-1 & MI-2', requestedBy: '38949', date: 'Sep 12, 2026', status: 'Approved' },
    { id: 'REQ-2026-09-02', material: 'Laser Cut Nano-Coated Stencil (0.12mm)', qty: '2 PCS', line: 'SMT-1 Inverter Model', requestedBy: 'task_manager1', date: 'Sep 10, 2026', status: 'In Inspection' },
    { id: 'REQ-2026-09-03', material: 'PCB Bare Board FR4 4-Layer 1.6mm', qty: '10,000 PCS', line: 'Main TV Motherboard', requestedBy: 'QM-Inspector-02', date: 'Sep 08, 2026', status: 'Passed IQC' },
    { id: 'REQ-2026-09-04', material: 'High-Temperature Polyimide SMT Tape', qty: '120 Rolls', line: 'SMT Feeder Prep', requestedBy: '38949', date: 'Sep 05, 2026', status: 'Approved' },
  ];

  // Templates Mock Data
  const templateList = [
    { title: 'SMT Trial Production Quality Check Template', desc: 'Standard operating checklist for pilot runs, stencil verification & reflow profiling.', subtasksCount: 277, category: 'SMT' },
    { title: 'TV Motherboard Main MP Software Verification Checklist', desc: 'Full automated and manual test cases for firmware flashing, audio, and I/O.', subtasksCount: 280, category: 'Software' },
    { title: 'BGA & QFN Soldering Cross-Section Analysis Report', desc: 'Standardized metallographic preparation, void ratio IPC-A-610 Class 3.', subtasksCount: 15, category: 'Laboratory' },
    { title: 'IQC Bare PCB Physical & Electrical Inspection Standard', desc: 'Warp, copper thickness, solder mask adhesion, and automated optical check.', subtasksCount: 42, category: 'PCB' },
  ];

  return (
    <div id="page-task-manager" className="space-y-5 animate-in fade-in duration-200">
      {/* 1. TOP PURPLE TASK MANAGER HEADER (Matching Image 2) */}
      <div className="bg-linear-to-r from-[#4f46e5] via-[#6366f1] to-[#7c3aed] text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shadow-xs">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span>Task Manager</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white/90 border border-white/20">
                PCB &amp; PCBA QM
              </span>
            </div>
            <p className="text-xs text-white/80">
              Daily Quality Engineering Tasks, Software Audits &amp; SMT Line Verifications
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsTestReportsModalOpen(true)}
            className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Test Reports</span>
          </button>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPriority('ALL');
              setSelectedStatus('ALL');
              setSelectedAssignee('ALL');
            }}
            className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Refresh Tasks"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-[10px]">
              TM
            </div>
            <div className="text-left">
              <div className="font-bold leading-tight">task_manager1</div>
              <div className="text-[10px] text-white/70">Task Manager</div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white text-xs font-medium rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. SUB NAVIGATION PILLS: Dashboard | Requisitions | Templates (Matching Image 2) */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#cbd5e1] shadow-2xs w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-linear-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#0d1730] hover:bg-[#f1f5f9]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('requisitions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'requisitions'
              ? 'bg-linear-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#0d1730] hover:bg-[#f1f5f9]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Requisitions</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-linear-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#0d1730] hover:bg-[#f1f5f9]'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Templates</span>
        </button>
      </div>

      {/* ===================== TAB 1: DASHBOARD ===================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Dashboard Title & + Create Task Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[#0d1730] tracking-tight">Dashboard</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

          {/* 6 TOP SUMMARY METRIC CARDS (Exact match with Image 2) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* TOTAL */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
              <div className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                TOTAL
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0d1730]">
                {totalTasksCount}
              </div>
            </div>

            {/* IN PROGRESS */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
              <div className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                IN PROGRESS
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#2563eb]">
                {inProgressCount}
              </div>
            </div>

            {/* ON HOLD */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
              <div className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                ON HOLD
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#eab308]">
                {onHoldCount}
              </div>
            </div>

            {/* OVERDUE */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
              <div className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                OVERDUE
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#ef4444]">
                {overdueCount}
              </div>
            </div>

            {/* CRITICAL */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
              <div className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                CRITICAL
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#ef4444]">
                {criticalCount}
              </div>
            </div>

            {/* DONE / 7D */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs">
              <div className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                DONE / 7D
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#10b981]">
                {doneLast7DaysCount}
              </div>
            </div>
          </div>

          {/* WORKING NOW & NEEDS ATTENTION SPLIT (Exact match with Image 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* WORKING NOW */}
            <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">
                WORKING NOW
              </div>

              {/* Green Highlight Card */}
              <div className="bg-[#10b981] text-white p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      <h4 className="text-base sm:text-lg font-extrabold leading-snug">
                        MARCEL M43LU3UGQ Software check
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/90 font-mono">
                      <span>MMSC-752975-21A</span>
                      <span>·</span>
                      <span className="font-bold">277/277 subtasks</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 border border-white/30 whitespace-nowrap">
                    Active Inspection
                  </span>
                </div>

                {/* Full Progress Bar */}
                <div className="mt-4 w-full bg-white/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full w-full" />
                </div>
              </div>

              <div className="text-xs text-[#64748b] flex items-center justify-between pt-1">
                <span>Assigned QA Lead: <strong className="text-[#0d1730]">38949</strong></span>
                <span className="text-[#10b981] font-bold">100% Completed</span>
              </div>
            </div>

            {/* NEEDS ATTENTION */}
            <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold text-[#475569] uppercase tracking-wider">
                  NEEDS ATTENTION
                </div>
                <span className="text-[11px] font-bold text-[#ef4444] bg-[#fee2e2] px-2 py-0.5 rounded-md border border-[#fecaca]">
                  4 Tasks Delayed
                </span>
              </div>

              {/* Needs Attention Items */}
              <div className="space-y-2">
                {[
                  {
                    title: 'NEW Software check of sample TV(32KA1Q-Expressluck)',
                    delay: 'Jan 15 · 241d late',
                    color: 'border-l-[#2563eb]',
                  },
                  {
                    title: 'M32LU3FGQ MP software check',
                    delay: 'Sep 1 · 12d late',
                    color: 'border-l-[#f97316]',
                  },
                  {
                    title: 'Software Checking of W55SA3UGQ & M55LU3UGQ',
                    delay: 'Sep 2 · 11d late',
                    color: 'border-l-[#f97316]',
                  },
                  {
                    title: 'New Expressluck 43inch TV with 1.5GB RAM',
                    delay: 'Sep 9 · 4d late',
                    color: 'border-l-[#2563eb]',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-xl border-l-4 ${item.color} border-y border-r border-[#e2e8f0] flex items-center justify-between gap-3 text-xs transition-colors`}
                  >
                    <span className="font-semibold text-[#1e293b] truncate">{item.title}</span>
                    <span className="text-[#ef4444] font-mono font-bold whitespace-nowrap text-[11px] bg-[#fee2e2] px-2 py-0.5 rounded">
                      {item.delay}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. TASKS CONTROLS BAR: Board | List, Search, Filters (Exact match with Image 2 & 3) */}
          <div className="bg-white p-4 rounded-2xl border border-[#cbd5e1] shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left: "Tasks" Title + Board/List View Mode Pills */}
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#0d1730]">Tasks</span>

                <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1]">
                  <button
                    onClick={() => setViewMode('board')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'board'
                        ? 'bg-[#4f46e5] text-white shadow-2xs'
                        : 'text-[#64748b] hover:text-[#0d1730]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Board</span>
                  </button>

                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'list'
                        ? 'bg-[#4f46e5] text-white shadow-2xs'
                        : 'text-[#64748b] hover:text-[#0d1730]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>List</span>
                  </button>
                </div>
              </div>

              {/* Center & Right Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Input */}
                <div className="relative min-w-56 sm:min-w-64">
                  <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks, token, assignee..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs text-[#0d1730] placeholder-[#94a3b8] focus:outline-hidden focus:ring-1 focus:ring-[#4f46e5]"
                  />
                </div>

                {/* Priority Filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0d1730] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0d1730] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All statuses</option>
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON HOLD">On Hold</option>
                  <option value="OVERDUE">Overdue</option>
                </select>

                {/* Assignee Filter */}
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0d1730] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All assignees</option>
                  <option value="38949">38949</option>
                  <option value="task_manager1">task_manager1</option>
                  <option value="QM-Inspector-02">QM-Inspector-02</option>
                </select>

                {/* Clear Filters */}
                {(searchQuery || selectedPriority !== 'ALL' || selectedStatus !== 'ALL' || selectedAssignee !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedPriority('ALL');
                      setSelectedStatus('ALL');
                      setSelectedAssignee('ALL');
                    }}
                    className="text-xs font-bold text-[#ef4444] hover:underline px-2 py-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Task Count Indicator */}
            <div className="text-xs text-[#64748b] pt-1">
              <strong>{filteredTasks.length}</strong> of <strong>{totalTasksCount}</strong> tasks shown
            </div>
          </div>

          {/* 4. TASKS TABLE (LIST VIEW) - (Exact Match with Image 3) */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-[#cbd5e1] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#64748b] font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 min-w-72">TASK</th>
                      <th className="py-3 px-4 min-w-36">TOKEN</th>
                      <th className="py-3 px-4 min-w-28">ASSIGNEE</th>
                      <th className="py-3 px-4 min-w-24">PRIORITY</th>
                      <th className="py-3 px-4 min-w-32">STATUS</th>
                      <th className="py-3 px-4 min-w-36">PROGRESS</th>
                      <th className="py-3 px-4 min-w-36">DEADLINE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] text-[#1e293b]">
                    {filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-[#f8fafc] transition-colors group cursor-pointer"
                        onClick={() => setSelectedTaskDetail(task)}
                      >
                        {/* TASK TITLE with colored left indicator */}
                        <td className="py-3.5 px-4 font-semibold text-[#0d1730]">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-1.5 h-7 rounded-full shrink-0 ${
                                task.status === 'COMPLETED'
                                  ? 'bg-[#10b981]'
                                  : task.isOverdue
                                  ? 'bg-[#f97316]'
                                  : 'bg-[#3b82f6]'
                              }`}
                            />
                            {task.status === 'COMPLETED' && (
                              <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                            )}
                            <span className="leading-snug">{task.title}</span>
                          </div>
                        </td>

                        {/* TOKEN */}
                        <td className="py-3.5 px-4 font-mono text-[#8b5cf6] font-medium whitespace-nowrap">
                          {task.token}
                        </td>

                        {/* ASSIGNEE */}
                        <td className="py-3.5 px-4 text-[#475569] font-medium whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 bg-[#f1f5f9] px-2 py-0.5 rounded-md text-[11px]">
                            <User className="w-3 h-3 text-[#64748b]" />
                            <span>{task.assignee}</span>
                          </span>
                        </td>

                        {/* PRIORITY */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wider ${
                              task.priority === 'HIGH'
                                ? 'bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa]'
                                : task.priority === 'MEDIUM'
                                ? 'bg-[#dbeafe] text-[#2563eb] border border-[#bfdbfe]'
                                : 'bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1]'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                              task.status === 'IN PROGRESS'
                                ? 'bg-[#dbeafe] text-[#1d4ed8]'
                                : task.status === 'COMPLETED'
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : 'bg-[#fef9c3] text-[#a16207]'
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>

                        {/* PROGRESS BAR & RATIO */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  task.status === 'COMPLETED' ? 'bg-[#8b5cf6]' : 'bg-[#3b82f6]'
                                }`}
                                style={{
                                  width:
                                    task.progressTotal > 0
                                      ? `${Math.min(100, (task.progressDone / task.progressTotal) * 100)}%`
                                      : '0%',
                                }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-[#64748b]">
                              {task.progressDone}/{task.progressTotal}
                            </span>
                          </div>
                        </td>

                        {/* DEADLINE */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                          {task.isOverdue ? (
                            <span className="text-[#ef4444] font-bold flex items-center gap-1">
                              <span>{task.deadline}</span>
                              <span>·</span>
                              <span>{task.daysLate}d late</span>
                            </span>
                          ) : (
                            <span className="text-[#64748b]">{task.deadline}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. BOARD / KANBAN VIEW */}
          {viewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: IN PROGRESS */}
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#cbd5e1] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                  <span className="text-xs font-bold text-[#1d4ed8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    <span>IN PROGRESS</span>
                  </span>
                  <span className="text-xs font-mono font-bold bg-[#dbeafe] text-[#1d4ed8] px-2 py-0.5 rounded-full">
                    {tasks.filter((t) => t.status === 'IN PROGRESS').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.status === 'IN PROGRESS')
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskDetail(t)}
                        className="bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#8b5cf6] font-medium">{t.token}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffedd5] text-[#ea580c]">
                            {t.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0d1730]">{t.title}</h4>
                        <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                          <span>{t.assignee}</span>
                          <span className={t.isOverdue ? 'text-[#ef4444] font-bold' : ''}>
                            {t.deadline} {t.isOverdue && `· ${t.daysLate}d late`}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 2: ON HOLD */}
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#cbd5e1] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                  <span className="text-xs font-bold text-[#a16207] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                    <span>ON HOLD</span>
                  </span>
                  <span className="text-xs font-mono font-bold bg-[#fef9c3] text-[#a16207] px-2 py-0.5 rounded-full">
                    {tasks.filter((t) => t.status === 'ON HOLD').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.status === 'ON HOLD')
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskDetail(t)}
                        className="bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#8b5cf6] font-medium">{t.token}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffedd5] text-[#ea580c]">
                            {t.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0d1730]">{t.title}</h4>
                        <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                          <span>{t.assignee}</span>
                          <span className="text-[#ef4444] font-bold">
                            {t.deadline} · {t.daysLate}d late
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 3: COMPLETED */}
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#cbd5e1] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                  <span className="text-xs font-bold text-[#15803d] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span>COMPLETED</span>
                  </span>
                  <span className="text-xs font-mono font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full">
                    {tasks.filter((t) => t.status === 'COMPLETED').length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.status === 'COMPLETED')
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskDetail(t)}
                        className="bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#8b5cf6] font-medium">{t.token}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#dcfce7] text-[#15803d]">
                            DONE
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0d1730]">{t.title}</h4>
                        <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                          <span>{t.assignee}</span>
                          <span className="text-[#10b981] font-bold">{t.deadline}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: REQUISITIONS ===================== */}
      {activeTab === 'requisitions' && (
        <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0d1730]">PCB &amp; PCBA Quality Material Requisitions</h3>
              <p className="text-xs text-[#64748b]">
                In-process QC requisitions for bare boards, stencils, SAC305 paste &amp; critical ICs.
              </p>
            </div>
            <button
              onClick={() => alert('New Quality Requisition ticket initiated.')}
              className="px-3.5 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Requisition</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-mono">REQ ID</th>
                  <th className="py-3 px-4">Material / Item</th>
                  <th className="py-3 px-4 font-mono">Quantity</th>
                  <th className="py-3 px-4">Production Line / Model</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
                {requisitionsList.map((req) => (
                  <tr key={req.id} className="hover:bg-[#f8fafc]">
                    <td className="py-3 px-4 font-mono font-bold text-[#4f46e5]">{req.id}</td>
                    <td className="py-3 px-4 font-semibold">{req.material}</td>
                    <td className="py-3 px-4 font-mono font-bold">{req.qty}</td>
                    <td className="py-3 px-4 text-[#64748b]">{req.line}</td>
                    <td className="py-3 px-4">{req.requestedBy}</td>
                    <td className="py-3 px-4 font-mono text-[#64748b]">{req.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: TEMPLATES ===================== */}
      {activeTab === 'templates' && (
        <div className="bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-2xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#0d1730]">Quality Inspection Standard Templates</h3>
            <p className="text-xs text-[#64748b]">
              Reusable inspection blueprints and checklists for SMT, Wave Soldering, Software &amp; PCB Bare Boards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateList.map((tpl, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#cbd5e1] hover:border-[#4f46e5] bg-[#f8fafc] hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#e0e7ff] text-[#4338ca] uppercase">
                    {tpl.category}
                  </span>
                  <span className="text-xs font-mono text-[#64748b]">{tpl.subtasksCount} subtasks</span>
                </div>
                <h4 className="text-sm font-bold text-[#0d1730]">{tpl.title}</h4>
                <p className="text-xs text-[#64748b]">{tpl.desc}</p>
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setNewTaskTitle(tpl.title);
                      setNewTaskTotalSubtasks(tpl.subtasksCount);
                      setIsCreateModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#4f46e5] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Use Template to Create Task</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW TASK */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <h3 className="text-lg font-bold text-[#0d1730] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#4f46e5]" />
                <span>Create Quality Task</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-[#64748b] hover:text-[#0d1730] rounded-lg hover:bg-[#f1f5f9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M55LU3UGQ MP Software and Audio output verification"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4f46e5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Token ID</label>
                  <input
                    type="text"
                    value={newTaskToken}
                    onChange={(e) => setNewTaskToken(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#cbd5e1] rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-hidden"
                  >
                    <option value="38949">38949 (QA Inspector)</option>
                    <option value="task_manager1">task_manager1 (Lead)</option>
                    <option value="QM-Inspector-02">QM-Inspector-02 (SMT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-hidden"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-hidden"
                  >
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ON HOLD">ON HOLD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Subtasks (Qty)</label>
                  <input
                    type="number"
                    value={newTaskTotalSubtasks}
                    onChange={(e) => setNewTaskTotalSubtasks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#cbd5e1] rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Deadline</label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="e.g. Sep 22"
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Space</label>
                  <input
                    type="text"
                    value={newTaskSpace}
                    onChange={(e) => setNewTaskSpace(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-xl shadow-xs cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TASK DETAIL & QUICK STATUS EDIT */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-2 border-b border-[#e2e8f0]">
              <div className="space-y-1">
                <span className="font-mono text-xs text-[#8b5cf6] font-bold">
                  {selectedTaskDetail.token}
                </span>
                <h3 className="text-base font-bold text-[#0d1730]">{selectedTaskDetail.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="p-1.5 text-[#64748b] hover:text-[#0d1730] rounded-lg hover:bg-[#f1f5f9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <span className="text-[#64748b] block mb-1">Assignee</span>
                <span className="font-bold text-[#0d1730]">{selectedTaskDetail.assignee}</span>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <span className="text-[#64748b] block mb-1">Priority</span>
                <span className="font-bold text-[#ea580c]">{selectedTaskDetail.priority}</span>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <span className="text-[#64748b] block mb-1">Deadline</span>
                <span className={selectedTaskDetail.isOverdue ? 'font-bold text-[#ef4444]' : 'font-bold'}>
                  {selectedTaskDetail.deadline} {selectedTaskDetail.isOverdue && `(${selectedTaskDetail.daysLate}d late)`}
                </span>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <span className="text-[#64748b] block mb-1">Subtasks</span>
                <span className="font-bold text-[#0d1730]">
                  {selectedTaskDetail.progressDone} / {selectedTaskDetail.progressTotal}
                </span>
              </div>
            </div>

            {/* Quick Status Changers */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-2">Update Task Status</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    handleStatusToggle(selectedTaskDetail.id, 'IN PROGRESS');
                    setSelectedTaskDetail(null);
                  }}
                  className="py-2 px-3 text-xs font-bold rounded-xl bg-[#dbeafe] text-[#1d4ed8] hover:bg-[#bfdbfe] transition-colors cursor-pointer"
                >
                  In Progress
                </button>
                <button
                  onClick={() => {
                    handleStatusToggle(selectedTaskDetail.id, 'ON HOLD');
                    setSelectedTaskDetail(null);
                  }}
                  className="py-2 px-3 text-xs font-bold rounded-xl bg-[#fef9c3] text-[#a16207] hover:bg-[#fef08a] transition-colors cursor-pointer"
                >
                  On Hold
                </button>
                <button
                  onClick={() => {
                    handleStatusToggle(selectedTaskDetail.id, 'COMPLETED');
                    setSelectedTaskDetail(null);
                  }}
                  className="py-2 px-3 text-xs font-bold rounded-xl bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] transition-colors cursor-pointer"
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TEST REPORTS QUICK VIEW */}
      {isTestReportsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <h3 className="text-lg font-bold text-[#0d1730] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4f46e5]" />
                <span>Quality Inspection Test Reports</span>
              </h3>
              <button
                onClick={() => setIsTestReportsModalOpen(false)}
                className="p-1.5 text-[#64748b] hover:text-[#0d1730] rounded-lg hover:bg-[#f1f5f9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: 'Full Software Validation Log — MARCEL M43LU3UGQ (277 items)', date: 'Sep 07, 2026', passRate: '100% Pass', inspector: '38949' },
                { title: 'Audio Output Spectrum Analysis — W40SA3FGQ & W32SA3FGQ', date: 'Aug 31, 2026', passRate: '100% Pass', inspector: '38949' },
                { title: 'Remote Control Functional & IR/BT Voice Search Test Log', date: 'Aug 10, 2026', passRate: '98.5% Pass', inspector: '38949' },
                { title: 'SMT-1 Solder Void & BGA Cross-Section Metallographic Analysis', date: 'Aug 29, 2026', passRate: 'IPC Class 3 OK', inspector: 'QM-Inspector-02' },
              ].map((rep, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="font-bold text-[#0d1730]">{rep.title}</h5>
                    <div className="text-[11px] text-[#64748b]">
                      Date: {rep.date} · Inspector: {rep.inspector}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-full border border-[#a7f3d0]">
                    {rep.passRate}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsTestReportsModalOpen(false)}
                className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
