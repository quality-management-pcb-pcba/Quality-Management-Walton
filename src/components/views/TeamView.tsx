import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  X,
  CheckCircle2,
  Plus,
  Save,
  Download,
  RotateCcw,
  Trash2,
  Edit3,
  Search,
  ClipboardList,
  Sliders,
} from 'lucide-react';
import { TrainingRecord, PageId } from '../../types';
import { db, doc, getDoc, setDoc } from '../../services/firebase';
import {
  saveTrainingRecord,
  updateTrainingRecordInFirestore,
  deleteTrainingRecordFromFirestore,
  getTrainingRecordsFromFirestore,
  syncTrainingDatabaseSummary,
} from '../../services/training';

interface TeamViewProps {
  selectedSubsection?: 'database' | 'entry';
  onNavigate?: (page: PageId) => void;
}

interface MonthlyTrainingMetric {
  month: string;
  trainees: number;
  scheduled: number;
  completed: number;
}

interface KpiManualOverrides {
  useAutoCalc: boolean;
  totalTraining: number;
  manpowerCertified: number;
  totalTrainingNumber: number;
  totalInstructionMinutes: number;
}

interface TeamTrainingState {
  trainings: TrainingRecord[];
  monthlyMetrics: MonthlyTrainingMetric[];
  kpiConfig: KpiManualOverrides;
}

const STORAGE_KEY = 'walton_qms_team_training_v3';

const DEFAULT_DEPARTMENTS = [
  'PRODUCTION',
  'SUPPLY CHAIN',
  'IQC',
  'QUALITY ASSURANCE',
  'FQC',
  'PCB',
  'PCBA',
  'TQM',
];

const DEFAULT_TRAINERS = [
  'Md. ATIQUR RAHMAN (40736)',
  'ABDUR RAHIM (10193)',
  'S. HOSSAIN',
  'DR. TARIQUL ISLAM',
];

const INITIAL_SPREADSHEET_TRAININGS: TrainingRecord[] = [
  {
    id: 'tr-sheet-1',
    date: '2021-01-15',
    title: 'Intro',
    department: 'PRODUCTION',
    type: 'Internal',
    participants: 10,
    durationMinutes: 40,
    rating: 'Good',
    status: 'In-Progress',
    trainer: 'Md. ATIQUR RAHMAN (40736)',
    remarks: '',
  },
  {
    id: 'tr-sheet-2',
    date: '2021-02-23',
    title: 'Technical parts',
    department: 'SUPPLY CHAIN',
    type: 'Internal',
    participants: 20,
    durationMinutes: 50,
    rating: 'Fair',
    status: 'Cancelled',
    trainer: 'ABDUR RAHIM (10193)',
    remarks: '',
  },
  {
    id: 'tr-sheet-3',
    date: '2021-03-28',
    title: 'Basic Knowledge',
    department: 'PRODUCTION',
    type: 'Internal',
    participants: 8,
    durationMinutes: 10,
    rating: 'Good',
    status: 'Not Started',
    trainer: 'Md. ATIQUR RAHMAN (40736)',
    remarks: '',
  },
  {
    id: 'tr-sheet-4',
    date: '2021-03-29',
    title: 'ESD',
    department: 'IQC',
    type: 'Internal',
    participants: 5,
    durationMinutes: 35,
    rating: 'Average',
    status: 'Not Started',
    trainer: 'ABDUR RAHIM (10193)',
    remarks: '',
  },
  {
    id: 'tr-sheet-5',
    date: '2026-08-14',
    title: 'IPC-A-610 Class 2 & 3 Workmanship Standards',
    department: 'QUALITY ASSURANCE',
    type: 'Practical',
    participants: 18,
    durationMinutes: 120,
    rating: 'Excellent',
    status: 'Completed',
    trainer: 'Md. ATIQUR RAHMAN (40736)',
    remarks: 'Annual IPC recertification',
  },
  {
    id: 'tr-sheet-6',
    date: '2026-08-19',
    title: '3D AOI Defect Classification & False Reject Filtering',
    department: 'PRODUCTION',
    type: 'Practical',
    participants: 14,
    durationMinutes: 90,
    rating: 'Excellent',
    status: 'Completed',
    trainer: 'Md. ATIQUR RAHMAN (40736)',
    remarks: 'SMT Line 1-3 operators',
  },
  {
    id: 'tr-sheet-7',
    date: '2026-08-22',
    title: 'ESD S20.20 Protocol Certification',
    department: 'SUPPLY CHAIN',
    type: 'Online',
    participants: 8,
    durationMinutes: 45,
    rating: 'Good',
    status: 'Completed',
    trainer: 'ABDUR RAHIM (10193)',
    remarks: '',
  },
  {
    id: 'tr-sheet-8',
    date: '2026-08-28',
    title: 'Reflow Profile Optimization & Thermal Profiling',
    department: 'PRODUCTION',
    type: 'External',
    participants: 12,
    durationMinutes: 75,
    rating: 'Excellent',
    status: 'Completed',
    trainer: 'DR. TARIQUL ISLAM',
    remarks: '',
  },
  {
    id: 'tr-cal-sep-1',
    date: '2025-09-13',
    title: 'NPM-W2 Machine',
    department: 'PRODUCTION',
    type: 'Internal',
    participants: 12,
    durationMinutes: 60,
    rating: 'Average',
    status: 'In-Progress',
    trainer: 'Md. ATIQUR RAHMAN (40736)',
    remarks: 'AVERAGE',
  },
  {
    id: 'tr-cal-sep-2',
    date: '2025-09-29',
    title: 'Quality',
    department: 'QUALITY ASSURANCE',
    type: 'Internal',
    participants: 15,
    durationMinutes: 45,
    rating: 'Good',
    status: 'Completed',
    trainer: 'Md. ATIQUR RAHMAN (40736)',
    remarks: 'GOOD',
  },
];

const DEFAULT_MONTHLY_METRICS: MonthlyTrainingMetric[] = [
  { month: 'Jan', trainees: 10, scheduled: 1, completed: 0 },
  { month: 'Feb', trainees: 20, scheduled: 1, completed: 0 },
  { month: 'Mar', trainees: 13, scheduled: 2, completed: 0 },
  { month: 'Apr', trainees: 9, scheduled: 2, completed: 2 },
  { month: 'May', trainees: 26, scheduled: 3, completed: 2 },
  { month: 'Jun', trainees: 15, scheduled: 3, completed: 3 },
  { month: 'Jul', trainees: 24, scheduled: 3, completed: 2 },
  { month: 'Aug', trainees: 52, scheduled: 4, completed: 4 },
  { month: 'Sep', trainees: 10, scheduled: 2, completed: 1 },
  { month: 'Oct', trainees: 17, scheduled: 3, completed: 2 },
  { month: 'Nov', trainees: 0, scheduled: 0, completed: 0 },
  { month: 'Dec', trainees: 0, scheduled: 0, completed: 0 },
];

function createDefaultState(): TeamTrainingState {
  return {
    trainings: INITIAL_SPREADSHEET_TRAININGS,
    monthlyMetrics: DEFAULT_MONTHLY_METRICS,
    kpiConfig: {
      useAutoCalc: true,
      totalTraining: INITIAL_SPREADSHEET_TRAININGS.length,
      manpowerCertified: INITIAL_SPREADSHEET_TRAININGS.filter((t) => t.status === 'Completed').reduce(
        (sum, t) => sum + (Number(t.participants) || 0),
        0
      ),
      totalTrainingNumber: INITIAL_SPREADSHEET_TRAININGS.reduce(
        (sum, t) => sum + (Number(t.participants) || 0),
        0
      ),
      totalInstructionMinutes: INITIAL_SPREADSHEET_TRAININGS.reduce(
        (sum, t) => sum + (Number(t.durationMinutes) || 0),
        0
      ),
    },
  };
}

export const TeamView: React.FC<TeamViewProps> = ({
  selectedSubsection = 'database',
  onNavigate,
}) => {
  const [state, setState] = useState<TeamTrainingState>(createDefaultState);
  const [activeEntryTab, setActiveEntryTab] = useState<'sessions' | 'monthly' | 'kpi'>('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Quick Entry Form State matching user's exact spreadsheet columns:
  // SI | TRAINING DATE | TRAINING AGENDA | Department | Type | PRESENT TRAINEE # | Duration (mins) | FEEDBACK RATING | STATUS | TRAINER | REMARKS
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [calMonth, setCalMonth] = useState<number>(8); // 0=Jan ... 8=September
  const [calYear, setCalYear] = useState<number>(2025);
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('');
  const [type, setType] = useState<TrainingRecord['type'] | ''>('');
  const [participants, setParticipants] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState<TrainingRecord['rating'] | ''>('');
  const [status, setStatus] = useState<TrainingRecord['status'] | ''>('');
  const [trainer, setTrainer] = useState('');
  const [remarks, setRemarks] = useState('');

  // Save & status feedback
  const [savedBanner, setSavedBanner] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // Load saved state from localStorage / Firestore on mount
  // ---------------------------------------------------------------------------
  const loadSavedData = useCallback(async () => {
    const base = createDefaultState();
    const localRaw = localStorage.getItem(STORAGE_KEY);
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw);
        setState({
          trainings: Array.isArray(parsed.trainings) ? parsed.trainings : base.trainings,
          monthlyMetrics: Array.isArray(parsed.monthlyMetrics)
            ? parsed.monthlyMetrics
            : base.monthlyMetrics,
          kpiConfig: { ...base.kpiConfig, ...(parsed.kpiConfig || {}) },
        });
        setSavedBanner('✓ Loaded saved training data (Local)');
        setHasUnsavedChanges(false);
        return;
      } catch (err) {
        console.warn('Failed to parse local training state:', err);
      }
    }

    if (db) {
      try {
        const records = await getTrainingRecordsFromFirestore();
        if (records.length > 0) {
          const merged: TeamTrainingState = {
            trainings: records,
            monthlyMetrics: base.monthlyMetrics,
            kpiConfig: {
              useAutoCalc: true,
              totalTraining: records.length,
              manpowerCertified: records
                .filter((t) => t.status === 'Completed')
                .reduce((s, t) => s + (Number(t.participants) || 0), 0),
              totalTrainingNumber: records.reduce(
                (s, t) => s + (Number(t.participants) || 0),
                0
              ),
              totalInstructionMinutes: records.reduce(
                (s, t) => s + (Number(t.durationMinutes) || 0),
                0
              ),
            },
          };
          setState(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          setSavedBanner('✓ Loaded saved training data (Cloud)');
          setHasUnsavedChanges(false);
          return;
        }

        const docRef = doc(db, 'training_reports', 'annual_summary_v2');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const cloud = snap.data() as Partial<TeamTrainingState>;
          const merged: TeamTrainingState = {
            trainings: Array.isArray(cloud.trainings) ? cloud.trainings : base.trainings,
            monthlyMetrics: Array.isArray(cloud.monthlyMetrics)
              ? cloud.monthlyMetrics
              : base.monthlyMetrics,
            kpiConfig: { ...base.kpiConfig, ...(cloud.kpiConfig || {}) },
          };
          setState(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          setSavedBanner('✓ Loaded saved training data (Cloud)');
          setHasUnsavedChanges(false);
        } else {
          // Seed initial records to training_records collection
          base.trainings.forEach((tr) => {
            saveTrainingRecord(tr).catch(() => {});
          });
        }
      } catch (cloudErr) {
        console.warn('Cloud fetch warning for training data:', cloudErr);
      }
    }
  }, []);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // ---------------------------------------------------------------------------
  // Save state to localStorage + Firestore
  // ---------------------------------------------------------------------------
  const handleSaveData = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (db) {
        try {
          const docRef = doc(db, 'training_reports', 'annual_summary_v2');
          await setDoc(docRef, {
            ...state,
            updatedAt: new Date().toISOString(),
          });
          for (const tr of state.trainings) {
            await saveTrainingRecord(tr);
          }
          await syncTrainingDatabaseSummary({
            totalTraining: state.trainings.length,
            manpowerCertified: state.trainings
              .filter((t) => t.status === 'Completed')
              .reduce((s, t) => s + (Number(t.participants) || 0), 0),
            totalTrainingNumber: state.trainings.reduce(
              (s, t) => s + (Number(t.participants) || 0),
              0
            ),
            totalInstructionMinutes: state.trainings.reduce(
              (s, t) => s + (Number(t.durationMinutes) || 0),
              0
            ),
          });
        } catch (cloudErr) {
          console.warn('Firestore sync warning for training data:', cloudErr);
        }
      }
      setSavedBanner('✓ Training data saved successfully');
      setHasUnsavedChanges(false);
      setTimeout(() => setSavedBanner(''), 4000);
    } catch (err) {
      console.error('Error saving training data:', err);
      setSavedBanner('⚠️ Failed to save training data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    const fresh = createDefaultState();
    setState(fresh);
    localStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(true);
    setSavedBanner('↺ Reset to default training dataset');
    setTimeout(() => setSavedBanner(''), 3500);
  };

  // ---------------------------------------------------------------------------
  // Add / Update / Delete Training Session Handlers
  // ---------------------------------------------------------------------------
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const headcount = Math.max(0, parseInt(participants, 10) || 0);
    const dur = Math.max(0, parseInt(duration, 10) || 0);

    const resolvedType: TrainingRecord['type'] = type || 'Internal';
    const resolvedRating: TrainingRecord['rating'] = rating || 'Good';
    const resolvedStatus: TrainingRecord['status'] = status || 'In-Progress';

    const newRecord: TrainingRecord = {
      id: `tr-${Date.now()}`,
      date: entryDate || new Date().toISOString().split('T')[0],
      title: title.trim(),
      department: dept.trim().toUpperCase() || 'PRODUCTION',
      type: resolvedType,
      participants: headcount,
      durationMinutes: dur,
      rating: resolvedRating,
      status: resolvedStatus,
      trainer: trainer.trim() || 'Md. ATIQUR RAHMAN (40736)',
      remarks: remarks.trim(),
    };

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const parsedDate = new Date(newRecord.date);
    const mIdx = !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() : -1;
    const targetMonth = mIdx >= 0 ? monthNames[mIdx] : null;

    setState((prev) => {
      const nextTrainings = [...prev.trainings, newRecord];
      const nextMonthly = prev.monthlyMetrics.map((m) => {
        if (m.month === targetMonth) {
          return {
            ...m,
            trainees: m.trainees + headcount,
            scheduled: m.scheduled + 1,
            completed: resolvedStatus === 'Completed' ? m.completed + 1 : m.completed,
          };
        }
        return m;
      });

      return {
        ...prev,
        trainings: nextTrainings,
        monthlyMetrics: nextMonthly,
        kpiConfig: {
          ...prev.kpiConfig,
          totalTraining: prev.kpiConfig.totalTraining + 1,
          manpowerCertified:
            resolvedStatus === 'Completed'
              ? prev.kpiConfig.manpowerCertified + headcount
              : prev.kpiConfig.manpowerCertified,
          totalTrainingNumber: prev.kpiConfig.totalTrainingNumber + headcount,
          totalInstructionMinutes: prev.kpiConfig.totalInstructionMinutes + dur,
        },
      };
    });

    if (!isNaN(parsedDate.getTime())) {
      setCalMonth(parsedDate.getMonth());
      setCalYear(parsedDate.getFullYear());
    }

    saveTrainingRecord(newRecord).catch(() => {});

    setTitle('');
    setDept('');
    setType('');
    setParticipants('');
    setDuration('');
    setRating('');
    setStatus('');
    setTrainer('');
    setRemarks('');
    setHasUnsavedChanges(true);
    setSavedBanner('✓ Row added to Training Data Entry sheet (Click Save Data to persist)');
    setTimeout(() => setSavedBanner(''), 4000);
  };

  const handleUpdateSessionField = <K extends keyof TrainingRecord>(
    id: string,
    field: K,
    value: TrainingRecord[K]
  ) => {
    setState((prev) => ({
      ...prev,
      trainings: prev.trainings.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
    updateTrainingRecordInFirestore(id, { [field]: value } as Partial<TrainingRecord>).catch(
      () => {}
    );
    setHasUnsavedChanges(true);
  };

  const handleAddBlankRow = () => {
    const newRow: TrainingRecord = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: '',
      department: 'PRODUCTION',
      type: 'Internal',
      participants: 10,
      durationMinutes: 40,
      rating: 'Good',
      status: 'Not Started',
      trainer: 'Md. ATIQUR RAHMAN (40736)',
      remarks: '',
    };
    setState((prev) => ({
      ...prev,
      trainings: [...prev.trainings, newRow],
    }));
    saveTrainingRecord(newRow).catch(() => {});
    setHasUnsavedChanges(true);
  };

  const handleDeleteSession = (id: string) => {
    setState((prev) => ({
      ...prev,
      trainings: prev.trainings.filter((item) => item.id !== id),
    }));
    deleteTrainingRecordFromFirestore(id).catch(() => {});
    setHasUnsavedChanges(true);
  };

  const handleUpdateMonthlyMetric = (
    month: string,
    field: 'trainees' | 'scheduled' | 'completed',
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setState((prev) => ({
      ...prev,
      monthlyMetrics: prev.monthlyMetrics.map((m) =>
        m.month === month ? { ...m, [field]: num } : m
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleSyncKpisFromLog = () => {
    setState((prev) => {
      const totalSessions = prev.trainings.length;
      const completedParticipants = prev.trainings
        .filter((t) => t.status === 'Completed')
        .reduce((acc, t) => acc + (Number(t.participants) || 0), 0);
      const allParticipants = prev.trainings.reduce(
        (acc, t) => acc + (Number(t.participants) || 0),
        0
      );
      const totalMins = prev.trainings.reduce(
        (acc, t) => acc + (Number(t.durationMinutes) || 0),
        0
      );

      return {
        ...prev,
        kpiConfig: {
          ...prev.kpiConfig,
          totalTraining: totalSessions,
          manpowerCertified: completedParticipants,
          totalTrainingNumber: allParticipants,
          totalInstructionMinutes: totalMins,
        },
      };
    });
    setHasUnsavedChanges(true);
    setSavedBanner('✓ KPI metrics synced from Training Data Entry rows');
    setTimeout(() => setSavedBanner(''), 3500);
  };

  // ---------------------------------------------------------------------------
  // Export CSV Handler (Exact spreadsheet column headers)
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    const rows: string[][] = [
      [
        'SI',
        'TRAINING DATE',
        'TRAINING AGENDA',
        'Department',
        'Type',
        'PRESENT TRAINEE #',
        'Duration (mins)',
        'FEEDBACK RATING',
        'STATUS',
        'TRAINER',
        'REMARKS',
      ],
    ];

    state.trainings.forEach((t, idx) => {
      rows.push([
        String(idx + 1),
        t.date,
        t.title,
        t.department,
        t.type.toUpperCase(),
        String(t.participants),
        String(t.durationMinutes),
        t.rating.toUpperCase(),
        t.status,
        t.trainer,
        t.remarks || '',
      ]);
    });

    const csv = rows
      .map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Walton-Training-Log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------------
  // Auto-persist to localStorage whenever training rows change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  // ---------------------------------------------------------------------------
  // Computed Analytics & KPIs (100% Live-Linked to Training Data Entry rows)
  // ---------------------------------------------------------------------------
  const displayedKpis = useMemo(() => {
    const totalTraining = state.trainings.length;
    const manpowerCertified = state.trainings
      .filter((t) => t.status === 'Completed')
      .reduce((sum, t) => sum + (Number(t.participants) || 0), 0);
    const totalTrainingNumber = state.trainings.reduce(
      (sum, t) => sum + (Number(t.participants) || 0),
      0
    );
    const totalInstructionMinutes = state.trainings.reduce(
      (sum, t) => sum + (Number(t.durationMinutes) || 0),
      0
    );
    return {
      totalTraining,
      manpowerCertified,
      totalTrainingNumber,
      totalInstructionMinutes,
    };
  }, [state.trainings]);

  const trainingTypeData = useMemo(() => {
    const counts: Record<TrainingRecord['type'], number> = {
      Online: 0,
      Practical: 0,
      External: 0,
      Internal: 0,
    };
    state.trainings.forEach((t) => {
      if (counts[t.type] !== undefined) counts[t.type] += 1;
    });
    return [
      { type: 'Online', count: counts.Online, color: '#1fb6a6' },
      { type: 'Practical', count: counts.Practical, color: '#e35b2a' },
      { type: 'External', count: counts.External, color: '#e8478f' },
      { type: 'Internal', count: counts.Internal, color: '#28ad6b' },
    ];
  }, [state.trainings]);

  const statusData = useMemo(() => {
    const counts: Record<TrainingRecord['status'], number> = {
      'Not Started': 0,
      'In-Progress': 0,
      Completed: 0,
      Cancelled: 0,
    };
    state.trainings.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return [
      { status: 'Not Started', count: counts['Not Started'] },
      { status: 'In-Progress', count: counts['In-Progress'] },
      { status: 'Completed', count: counts.Completed },
      { status: 'Cancelled', count: counts.Cancelled },
    ];
  }, [state.trainings]);

  const ratingData = useMemo(() => {
    const counts: Record<TrainingRecord['rating'], number> = {
      Good: 0,
      Excellent: 0,
      Fair: 0,
      Average: 0,
    };
    state.trainings.forEach((t) => {
      if (counts[t.rating] !== undefined) counts[t.rating] += 1;
    });
    return [
      { name: 'Good', value: counts.Good, color: '#28ad6b' },
      { name: 'Excellent', value: counts.Excellent, color: '#e8a13a' },
      { name: 'Fair', value: counts.Fair, color: '#2f9bea' },
      { name: 'Average', value: counts.Average, color: '#e35b2a' },
    ].filter((d) => d.value > 0);
  }, [state.trainings]);

  const topDepartments = useMemo(() => {
    const map: Record<string, number> = {};
    state.trainings.forEach((t) => {
      const d = (t.department || 'PRODUCTION').toUpperCase();
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [state.trainings]);

  const topTrainer = useMemo(() => {
    const map: Record<string, number> = {};
    state.trainings.forEach((t) => {
      const tr = (t.trainer || 'Md. ATIQUR RAHMAN (40736)').trim();
      if (tr) map[tr] = (map[tr] || 0) + 1;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      return { name: 'Md. Atiqur Rahman', idBadge: '40736', initials: 'AR', count: 0 };
    }
    const [rawName, count] = sorted[0];
    const idMatch = rawName.match(/\((\d+)\)/);
    const cleanName = rawName.replace(/\s*\(\d+\)\s*/, '').trim();
    const parts = cleanName.replace(/^Md\.\s*/i, '').split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
        : (cleanName.slice(0, 2) || 'TR').toUpperCase();
    return {
      name: cleanName || rawName,
      idBadge: idMatch ? idMatch[1] : 'Lead',
      initials,
      count,
    };
  }, [state.trainings]);

  const computedMonthlyMetrics = useMemo(() => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const buckets: MonthlyTrainingMetric[] = monthNames.map((m) => ({
      month: m,
      trainees: 0,
      scheduled: 0,
      completed: 0,
    }));

    state.trainings.forEach((t) => {
      if (!t.date) return;
      const parts = t.date.split('-');
      const mIdx = parts.length === 3 ? parseInt(parts[1], 10) - 1 : new Date(t.date).getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        buckets[mIdx].trainees += Number(t.participants) || 0;
        buckets[mIdx].scheduled += 1;
        if (t.status === 'Completed') {
          buckets[mIdx].completed += 1;
        }
      }
    });

    return buckets;
  }, [state.trainings]);

  const filteredTrainings = useMemo(() => {
    return state.trainings.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.remarks && t.remarks.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'ALL' || t.type === filterType;
      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [state.trainings, searchQuery, filterType, filterStatus]);

  const instructionHours = (displayedKpis.totalInstructionMinutes / 60).toFixed(2);

  return (
    <div id="page-team" className="space-y-6 animate-in fade-in duration-200">
      {/* Head */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1730]">
            {selectedSubsection === 'entry'
              ? 'TRAINING DATA ENTRY'
              : 'Team & Training'}
          </h2>
          <div className="text-xs text-[#5b6480] mt-0.5">
            QUALITY MANAGEMENT-PCB &amp;PCBA * EMPLOYEE TRAINING TRACKER
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-[#0d1730] border border-[#e2e7f2] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-2 bg-[#182a52] hover:bg-[#22376b] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Training Schedule Calendar</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics (Only shown in Training Database view) */}
      {selectedSubsection === 'database' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
            <div className="font-mono text-3xl font-bold text-[#28ad6b]">
              {displayedKpis.totalTraining}
            </div>
            <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">
              Total Training
            </div>
            <div className="text-[11px] text-[#5b6480] mt-1">Completed sessions</div>
          </div>

          <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
            <div className="font-mono text-3xl font-bold text-[#128f83]">
              {displayedKpis.manpowerCertified}
            </div>
            <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">
              Manpower Certified
            </div>
            <div className="text-[11px] text-[#128f83] mt-1">Active operators</div>
          </div>

          <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
            <div className="font-mono text-3xl font-bold text-[#e8a13a]">
              {displayedKpis.totalTrainingNumber}
            </div>
            <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">
              Total Training Number
            </div>
            <div className="text-[11px] text-[#5b6480] mt-1">Module certifications</div>
          </div>

          <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
            <div className="font-mono text-3xl font-bold text-[#182a52]">
              {displayedKpis.totalInstructionMinutes} min
            </div>
            <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">
              Total Instruction Time
            </div>
            <div className="text-[11px] text-[#5b6480] mt-1">{instructionHours} classroom hours</div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBMENU II: TRAINING DATA ENTRY & SESSION REGISTRY HUB                */}
      {/* ===================================================================== */}
      {selectedSubsection === 'entry' && (
      <div className="bg-white border border-[#e2e7f2] rounded-xl shadow-xs overflow-hidden">
        {/* Data Entry Header & Sub-Tabs */}
        <div className="bg-gradient-to-r from-[#182a52] via-[#1e3a8a] to-[#0d1730] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                TRAINING DATA ENTRY
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/50 p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setActiveEntryTab('sessions')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeEntryTab === 'sessions'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              1. Training Data Entry ({state.trainings.length})
            </button>
          </div>
        </div>

        {/* TAB 1: SPREADSHEET TRAINING DATA ENTRY FORM + INLINE EDITABLE LOG TABLE */}
        {activeEntryTab === 'sessions' && (
          <div className="p-5 space-y-5">
            {/* Quick Entry Form matching exact spreadsheet columns */}
            <form
              onSubmit={handleAddSession}
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-4 space-y-3.5"
            >
              <div className="flex flex-wrap items-center justify-end gap-2 border-b border-[#e2e7f2] pb-2.5">
                <span className="text-[11px] font-mono text-[#5b6480]">
                  Next SI: #{state.trainings.length + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    TRAINING DATE
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:border-[#182a52]"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    TRAINING AGENDA *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Intro, Technical parts, Basic Knowledge, ESD"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:border-[#182a52]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    list="dept-options"
                    placeholder="e.g., PRODUCTION, SUPPLY CHAIN, IQC"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] uppercase focus:outline-none focus:border-[#182a52]"
                  />
                  <datalist id="dept-options">
                    {DEFAULT_DEPARTMENTS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TrainingRecord['type'] | '')}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0d1730] focus:outline-none focus:border-[#182a52]"
                  >
                    <option value=""></option>
                    <option value="Internal">INTERNAL</option>
                    <option value="External">EXTERNAL</option>
                    <option value="Practical">PRACTICAL</option>
                    <option value="Online">ONLINE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    PRESENT TRAINEE #
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] font-mono focus:outline-none focus:border-[#182a52]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] font-mono focus:outline-none focus:border-[#182a52]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    FEEDBACK RATING
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value as TrainingRecord['rating'] | '')}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0d1730] focus:outline-none focus:border-[#182a52]"
                  >
                    <option value=""></option>
                    <option value="Good">GOOD</option>
                    <option value="Fair">FAIR</option>
                    <option value="Average">AVERAGE</option>
                    <option value="Excellent">EXCELLENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    STATUS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TrainingRecord['status'] | '')}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-bold text-[#0d1730] focus:outline-none focus:border-[#182a52]"
                  >
                    <option value=""></option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    TRAINER
                  </label>
                  <input
                    type="text"
                    list="trainer-options"
                    placeholder="e.g., Md. ATIQUR RAHMAN (40736)"
                    value={trainer}
                    onChange={(e) => setTrainer(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:border-[#182a52]"
                  />
                  <datalist id="trainer-options">
                    {DEFAULT_TRAINERS.map((tr) => (
                      <option key={tr} value={tr} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d1730] uppercase tracking-wider mb-1">
                    REMARKS
                  </label>
                  <input
                    type="text"
                    placeholder="Optional remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:border-[#182a52]"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-[#182a52] hover:bg-[#22376b] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Entry</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Search, Filter & Row Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#5b6480] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search agenda, trainer, dept, remarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-[#e2e7f2] rounded-lg text-xs text-[#0d1730] focus:outline-none focus:border-[#182a52] w-64"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-[#e2e7f2] rounded-lg text-xs text-[#0d1730] focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="Internal">INTERNAL</option>
                  <option value="External">EXTERNAL</option>
                  <option value="Practical">PRACTICAL</option>
                  <option value="Online">ONLINE</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-[#e2e7f2] rounded-lg text-xs text-[#0d1730] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddBlankRow}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Blank Row</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                  title="Reset to default training dataset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Spreadsheet-Style Editable Training Data Table (Exact match with uploaded image) */}
            <div className="overflow-x-auto border border-slate-400 rounded-lg shadow-2xs">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-black text-white text-[11px] font-bold tracking-wide">
                    <th className="border border-slate-600 px-2.5 py-2.5 w-12">SI</th>
                    <th className="border border-slate-600 px-2.5 py-2.5 min-w-[130px]">
                      TRAINING DATE
                    </th>
                    <th className="border border-slate-600 px-3 py-2.5 min-w-[190px]">
                      TRAINING AGENDA
                    </th>
                    <th className="border border-slate-600 px-2.5 py-2.5 min-w-[140px]">
                      Department
                    </th>
                    <th className="border border-slate-600 px-2.5 py-2.5 min-w-[115px]">Type</th>
                    <th className="border border-slate-600 px-2.5 py-2.5 min-w-[135px]">
                      PRESENT TRAINEE #
                    </th>
                    <th className="border border-slate-600 px-2.5 py-2.5 min-w-[110px]">
                      Duration
                      <div className="text-[10px] font-normal">(mins)</div>
                    </th>
                    <th className="border border-slate-600 px-2.5 py-2.5 min-w-[125px]">
                      FEEDBACK
                      <div>RATING</div>
                    </th>
                    <th className="border border-slate-600 px-2.5 py-2.5 min-w-[125px]">STATUS</th>
                    <th className="border border-slate-600 px-3 py-2.5 min-w-[210px]">TRAINER</th>
                    <th className="border border-slate-600 px-3 py-2.5 min-w-[150px]">REMARKS</th>
                    <th className="border border-slate-600 px-2 py-2.5 w-10">DEL</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-[#0d1730]">
                  {filteredTrainings.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      {/* SI */}
                      <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900">
                        {idx + 1}
                      </td>

                      {/* TRAINING DATE */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => handleUpdateSessionField(row.id, 'date', e.target.value)}
                          className="w-full bg-transparent text-center text-xs text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1 py-0.5"
                        />
                      </td>

                      {/* TRAINING AGENDA */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="text"
                          placeholder="Enter training agenda..."
                          value={row.title}
                          onChange={(e) => handleUpdateSessionField(row.id, 'title', e.target.value)}
                          className="w-full bg-transparent text-center text-xs text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1.5 py-0.5"
                        />
                      </td>

                      {/* Department */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="text"
                          list="dept-options"
                          value={row.department}
                          onChange={(e) =>
                            handleUpdateSessionField(row.id, 'department', e.target.value.toUpperCase())
                          }
                          className="w-full bg-transparent text-center text-xs uppercase text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1 py-0.5"
                        />
                      </td>

                      {/* Type */}
                      <td className="border border-slate-300 px-2 py-1">
                        <select
                          value={row.type}
                          onChange={(e) =>
                            handleUpdateSessionField(
                              row.id,
                              'type',
                              e.target.value as TrainingRecord['type']
                            )
                          }
                          className="w-full bg-transparent text-center text-xs uppercase text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1 py-0.5 cursor-pointer"
                        >
                          <option value="Internal">INTERNAL</option>
                          <option value="External">EXTERNAL</option>
                          <option value="Practical">PRACTICAL</option>
                          <option value="Online">ONLINE</option>
                        </select>
                      </td>

                      {/* PRESENT TRAINEE # */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          value={row.participants}
                          onChange={(e) =>
                            handleUpdateSessionField(
                              row.id,
                              'participants',
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            )
                          }
                          className="w-full bg-transparent text-center text-xs text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1 py-0.5"
                        />
                      </td>

                      {/* Duration (mins) */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          value={row.durationMinutes}
                          onChange={(e) =>
                            handleUpdateSessionField(
                              row.id,
                              'durationMinutes',
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            )
                          }
                          className="w-full bg-transparent text-center text-xs text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1 py-0.5"
                        />
                      </td>

                      {/* FEEDBACK RATING */}
                      <td className="border border-slate-300 px-2 py-1">
                        <select
                          value={row.rating}
                          onChange={(e) =>
                            handleUpdateSessionField(
                              row.id,
                              'rating',
                              e.target.value as TrainingRecord['rating']
                            )
                          }
                          className="w-full bg-transparent text-center text-xs uppercase text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1 py-0.5 cursor-pointer"
                        >
                          <option value="Good">GOOD</option>
                          <option value="Fair">FAIR</option>
                          <option value="Average">AVERAGE</option>
                          <option value="Excellent">EXCELLENT</option>
                        </select>
                      </td>

                      {/* STATUS */}
                      <td className="border border-slate-300 px-2 py-1">
                        <select
                          value={row.status}
                          onChange={(e) =>
                            handleUpdateSessionField(
                              row.id,
                              'status',
                              e.target.value as TrainingRecord['status']
                            )
                          }
                          className="w-full bg-transparent text-center text-xs font-bold text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1 py-0.5 cursor-pointer"
                        >
                          <option value="In-Progress">In-Progress</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Not Started">Not Started</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      {/* TRAINER */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="text"
                          list="trainer-options"
                          value={row.trainer}
                          onChange={(e) =>
                            handleUpdateSessionField(row.id, 'trainer', e.target.value)
                          }
                          className="w-full bg-transparent text-center text-xs text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1.5 py-0.5"
                        />
                      </td>

                      {/* REMARKS */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="text"
                          placeholder=""
                          value={row.remarks || ''}
                          onChange={(e) =>
                            handleUpdateSessionField(row.id, 'remarks', e.target.value)
                          }
                          className="w-full bg-transparent text-center text-xs text-slate-900 focus:outline-none focus:bg-blue-50/50 rounded px-1.5 py-0.5"
                        />
                      </td>

                      {/* DELETE */}
                      <td className="border border-slate-300 px-1.5 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(row.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTrainings.length === 0 && (
                    <tr>
                      <td
                        colSpan={12}
                        className="border border-slate-300 px-4 py-6 text-center text-xs text-[#5b6480]"
                      >
                        No training rows match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MONTHLY CHART DATA ENTRY */}
        {activeEntryTab === 'monthly' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-[#0d1730]">
                  Monthly Training &amp; Headcount Data Entry (Jan – Dec)
                </h4>
                <p className="text-xs text-[#5b6480]">
                  Edit monthly trainee attendance and scheduled vs. completed cohorts to update the monthly charts below
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#e2e7f2] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[#5b6480] text-[11px] uppercase font-bold border-b border-[#e2e7f2]">
                    <th className="px-4 py-2.5">Calendar Month</th>
                    <th className="px-4 py-2.5">Present Trainees (Headcount)</th>
                    <th className="px-4 py-2.5">Total Scheduled Sessions</th>
                    <th className="px-4 py-2.5">Completed Sessions</th>
                    <th className="px-4 py-2.5 text-center">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f8] font-mono">
                  {state.monthlyMetrics.map((m) => {
                    const rate =
                      m.scheduled > 0 ? `${Math.round((m.completed / m.scheduled) * 100)}%` : '—';
                    return (
                      <tr key={m.month} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2 font-sans font-bold text-[#0d1730]">{m.month}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={m.trainees}
                            onChange={(e) =>
                              handleUpdateMonthlyMetric(m.month, 'trainees', e.target.value)
                            }
                            className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-[#0d1730]"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={m.scheduled}
                            onChange={(e) =>
                              handleUpdateMonthlyMetric(m.month, 'scheduled', e.target.value)
                            }
                            className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-[#0d1730]"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={m.completed}
                            onChange={(e) =>
                              handleUpdateMonthlyMetric(m.month, 'completed', e.target.value)
                            }
                            className="w-28 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-[#0d1730]"
                          />
                        </td>
                        <td className="px-4 py-2 text-center font-bold text-emerald-700">{rate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: KPI SUMMARY CONTROLS */}
        {activeEntryTab === 'kpi' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e7f2] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#0d1730] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#182a52]" />
                  <span>Top KPI Scorecard Values Entry</span>
                </h4>
                <p className="text-xs text-[#5b6480]">
                  Adjust the 4 headline KPI card figures directly or auto-calculate them from the session registry
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#0d1730] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.kpiConfig.useAutoCalc}
                    onChange={(e) => {
                      setState((prev) => ({
                        ...prev,
                        kpiConfig: { ...prev.kpiConfig, useAutoCalc: e.target.checked },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="rounded border-slate-300"
                  />
                  <span>Auto-Calculate KPIs from Session Log</span>
                </label>

                <button
                  type="button"
                  onClick={handleSyncKpisFromLog}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Sync Snapshot from Log
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-[#e2e7f2] rounded-xl p-4">
                <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                  Total Training (Sessions)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={state.kpiConfig.useAutoCalc}
                  value={displayedKpis.totalTraining}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setState((prev) => ({
                      ...prev,
                      kpiConfig: { ...prev.kpiConfig, totalTraining: val },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg font-mono text-base font-bold text-[#28ad6b] disabled:opacity-60"
                />
              </div>

              <div className="bg-slate-50 border border-[#e2e7f2] rounded-xl p-4">
                <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                  Manpower Certified
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={state.kpiConfig.useAutoCalc}
                  value={displayedKpis.manpowerCertified}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setState((prev) => ({
                      ...prev,
                      kpiConfig: { ...prev.kpiConfig, manpowerCertified: val },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg font-mono text-base font-bold text-[#128f83] disabled:opacity-60"
                />
              </div>

              <div className="bg-slate-50 border border-[#e2e7f2] rounded-xl p-4">
                <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                  Total Training Number
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={state.kpiConfig.useAutoCalc}
                  value={displayedKpis.totalTrainingNumber}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setState((prev) => ({
                      ...prev,
                      kpiConfig: { ...prev.kpiConfig, totalTrainingNumber: val },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg font-mono text-base font-bold text-[#e8a13a] disabled:opacity-60"
                />
              </div>

              <div className="bg-slate-50 border border-[#e2e7f2] rounded-xl p-4">
                <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                  Total Instruction Time (Min)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={state.kpiConfig.useAutoCalc}
                  value={displayedKpis.totalInstructionMinutes}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setState((prev) => ({
                      ...prev,
                      kpiConfig: { ...prev.kpiConfig, totalInstructionMinutes: val },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg font-mono text-base font-bold text-[#182a52] disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ===================================================================== */}
      {/* SUBMENU I: TRAINING DATABASE ANALYTICS & CHARTS                       */}
      {/* ===================================================================== */}
      {selectedSubsection === 'database' && (
      <>
      {/* 3 Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Training Type */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">Training Delivery Type</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Online, Practical, External, Internal</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="type" stroke="#5b6480" fontSize={10} />
                <YAxis stroke="#5b6480" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e7f2',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {trainingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
            Heavy focus on hands-on practical soldering and internal sessions.
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">Delivery Status</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">
              Not started, In-progress, Completed, Cancelled
            </p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={statusData}
                margin={{ top: 5, right: 15, left: 25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis type="number" stroke="#5b6480" fontSize={10} allowDecimals={false} />
                <YAxis dataKey="status" type="category" stroke="#5b6480" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e7f2',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#2f9bea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
            Live status distribution from registered training sessions.
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">Trainee Rating Distribution</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Post-course comprehension evaluations</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e7f2',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#5b6480] pt-1 border-t border-[#e2e7f2]">
            {ratingData.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2: Top Departments & Trainer + Trainees by Month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Top Departments Participated</h3>
            <div className="divide-y divide-[#e2e7f2] text-xs mt-2">
              {topDepartments.map(([deptName, count]) => (
                <div key={deptName} className="py-2 flex items-center justify-between">
                  <span className="text-[#0d1730] font-medium">{deptName}</span>
                  <span className="font-mono font-bold text-[#22376b] text-sm">
                    {count} {count === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#e2e7f2]">
            <h3 className="font-bold text-sm text-[#0d1730]">Top Plant Trainer</h3>
            <div className="mt-2 p-3 bg-[#eef1f8] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#182a52] text-white flex items-center justify-center font-mono font-bold text-sm">
                  {topTrainer.initials}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0d1730]">{topTrainer.name}</div>
                  <div className="text-[11px] text-[#5b6480]">
                    Lead Trainer · ID: {topTrainer.idBadge}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#1fb6a6] text-white font-mono font-bold text-xs rounded-lg">
                {topTrainer.count} {topTrainer.count === 1 ? 'Session' : 'Sessions'} Conducted
              </span>
            </div>
          </div>
        </div>

        {/* Present Trainees by Month */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Present Trainees by Month</h3>
            <p className="text-xs text-[#5b6480] mb-2">Total headcount trained per calendar month</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={computedMonthlyMetrics}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="month" stroke="#5b6480" fontSize={10} />
                <YAxis stroke="#5b6480" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e7f2',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="trainees" name="Present Trainees" fill="#2f9bea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-2 border-t border-[#e2e7f2]">
            Monthly trainee headcount across Walton PCB &amp; PCBA lines.
          </div>
        </div>
      </div>

      {/* Total vs Completed Training Chart */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">
              Total vs Completed Training by Month
            </h3>
            <p className="text-xs text-[#5b6480]">Target scheduled vs executed training cohorts</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2f9bea]" /> Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e35b2a]" /> Completed
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={computedMonthlyMetrics}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
              <XAxis dataKey="month" stroke="#5b6480" fontSize={10} />
              <YAxis stroke="#5b6480" fontSize={10} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e2e7f2',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="scheduled" name="Total Scheduled" fill="#2f9bea" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#e35b2a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </>
      )}

      {/* Training Schedule Calendar Modal (Exact match with uploaded screenshot) */}
      {showScheduleModal && (() => {
        const FULL_MONTHS = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        const SHORT_MONTHS = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027];

        const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0=Sun..6=Sat
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
        const shortMonth = SHORT_MONTHS[calMonth];
        const shortYear = String(calYear).slice(-2);

        const startDateLabel = `1-${shortMonth}-${shortYear}`;
        const endDateLabel = `${daysInMonth}-${shortMonth}-${shortYear}`;

        // Build 42 cells (6 rows x 7 columns)
        const cells: Array<{
          day: number;
          inCurrentMonth: boolean;
          isoDate: string;
        }> = [];

        for (let i = 0; i < 42; i++) {
          const offset = i - firstDayOfWeek + 1;
          if (offset <= 0) {
            const prevDay = daysInPrevMonth + offset;
            const prevMonthDate = new Date(calYear, calMonth - 1, prevDay);
            const iso = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
            cells.push({ day: prevDay, inCurrentMonth: false, isoDate: iso });
          } else if (offset > daysInMonth) {
            const nextDay = offset - daysInMonth;
            const nextMonthDate = new Date(calYear, calMonth + 1, nextDay);
            const iso = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
            cells.push({ day: nextDay, inCurrentMonth: false, isoDate: iso });
          } else {
            const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(offset).padStart(2, '0')}`;
            cells.push({ day: offset, inCurrentMonth: true, isoDate: iso });
          }
        }

        const weeks = [
          cells.slice(0, 7),
          cells.slice(7, 14),
          cells.slice(14, 21),
          cells.slice(21, 28),
          cells.slice(28, 35),
          cells.slice(35, 42),
        ];

        const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-`;
        const monthTrainings = state.trainings
          .filter((t) => t.date.startsWith(monthPrefix))
          .sort((a, b) => a.date.localeCompare(b.date));

        const formatShortDate = (iso: string) => {
          const parts = iso.split('-');
          if (parts.length !== 3) return iso;
          const y = parts[0].slice(-2);
          const mIdx = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          return `${d}-${SHORT_MONTHS[mIdx] || parts[1]}-${y}`;
        };

        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-xl max-w-6xl w-full p-5 sm:p-7 shadow-2xl border border-slate-300 relative my-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ========================================================= */}
                {/* LEFT COLUMN: MONTH/YEAR SELECTORS + 7-COLUMN CALENDAR     */}
                {/* ========================================================= */}
                <div className="lg:col-span-5">
                  {/* Month & Year Dropdowns */}
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="border border-dotted border-[#548235] p-1.5">
                      <select
                        value={calMonth}
                        onChange={(e) => {
                          const newM = parseInt(e.target.value, 10);
                          setCalMonth(newM);
                          setEntryDate(`${calYear}-${String(newM + 1).padStart(2, '0')}-01`);
                        }}
                        className="px-4 py-1 bg-[#f2f2f2] border border-slate-300 rounded-full text-sm font-bold text-black focus:outline-none cursor-pointer shadow-2xs"
                      >
                        {FULL_MONTHS.map((mName, idx) => (
                          <option key={mName} value={idx}>
                            {mName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="border border-dotted border-[#548235] p-1.5">
                      <select
                        value={calYear}
                        onChange={(e) => {
                          const newY = parseInt(e.target.value, 10);
                          setCalYear(newY);
                          setEntryDate(`${newY}-${String(calMonth + 1).padStart(2, '0')}-01`);
                        }}
                        className="px-4 py-1 bg-[#f2f2f2] border border-slate-300 rounded-full text-sm font-bold text-black focus:outline-none cursor-pointer shadow-2xs"
                      >
                        {YEARS.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <table className="w-full border-collapse text-center select-none">
                    <thead>
                      <tr className="bg-[#c00000] text-white text-sm sm:text-base font-bold">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
                          <th
                            key={dayName}
                            className="border border-slate-300 py-2.5 px-1.5 w-[14.28%]"
                          >
                            {dayName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeks.map((week, wIdx) => {
                        const isLastRowAllOverflow =
                          wIdx === 5 && week.every((c) => !c.inCurrentMonth);
                        return (
                          <tr key={wIdx}>
                            {week.map((cell, cIdx) => {
                              const isFriday = cIdx === 5;
                              const hasTraining = state.trainings.some(
                                (t) => t.date === cell.isoDate
                              );
                              const isSelectedDate = entryDate === cell.isoDate;

                              return (
                                <td
                                  key={cell.isoDate}
                                  onClick={() => setEntryDate(cell.isoDate)}
                                  title={`Click to select ${cell.isoDate}`}
                                  className={`py-2.5 px-1 text-xl sm:text-2xl font-bold cursor-pointer transition-colors relative ${
                                    isLastRowAllOverflow
                                      ? 'border-0'
                                      : 'border border-slate-300'
                                  } ${
                                    !isLastRowAllOverflow && isFriday
                                      ? 'bg-[#fce4d6]'
                                      : 'bg-white'
                                  } ${
                                    cell.inCurrentMonth
                                      ? 'text-black hover:bg-blue-50'
                                      : 'text-[#d0d0d0]'
                                  } ${
                                    isSelectedDate ? 'ring-2 ring-inset ring-[#0066cc]' : ''
                                  }`}
                                >
                                  {String(cell.day).padStart(2, '0')}
                                  {hasTraining && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#198754] absolute bottom-1 left-1/2 -translate-x-1/2" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================= */}
                {/* RIGHT COLUMN: START/END DATE + BACK TO MENU + TASK TABLE  */}
                {/* ========================================================= */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Top Row: Start Date / End Date + Back to Menu Button */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <table className="border-collapse text-center text-xs">
                      <thead>
                        <tr className="bg-[#92d050] text-black font-bold">
                          <th className="border border-black px-4 py-1.5 min-w-[95px]">
                            Start Date
                          </th>
                          <th className="border border-black px-8 py-1.5 min-w-[190px]">
                            End Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-[#e2efda] text-black font-bold">
                          <td className="border border-black px-4 py-1.5">{startDateLabel}</td>
                          <td className="border border-black px-8 py-1.5">{endDateLabel}</td>
                        </tr>
                      </tbody>
                    </table>

                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="bg-[#e06666] hover:bg-[#cc5252] text-black font-bold italic text-xs px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-3 cursor-pointer transition-transform active:scale-95 border border-[#c95050]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6 text-[#333333] fill-current shrink-0"
                      >
                        <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                      </svg>
                      <span className="leading-tight text-center">
                        Back to
                        <br />
                        Menu
                      </span>
                    </button>
                  </div>

                  {/* Blue Header Task Schedule Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0066cc] text-white font-bold text-center">
                          <th className="border border-white/40 py-3 px-3 w-[18%]">Date</th>
                          <th className="border border-white/40 py-3 px-4 w-[36%]">Task</th>
                          <th className="border border-white/40 py-3 px-3 w-[26%]">Status</th>
                          <th className="border border-white/40 py-3 px-3 w-[20%]">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthTrainings.map((item) => (
                          <tr key={item.id} className="bg-white hover:bg-slate-50/70">
                            <td className="border border-dotted border-slate-400 py-3 px-3 text-center font-bold text-[#198754]">
                              {formatShortDate(item.date)}
                            </td>
                            <td className="border border-dotted border-slate-400 py-3 px-4 font-bold text-[#198754]">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateSessionField(item.id, 'title', e.target.value)
                                }
                                className="w-full bg-transparent font-bold text-[#198754] focus:outline-none focus:bg-emerald-50/50 rounded px-1"
                              />
                            </td>
                            <td className="border border-dotted border-slate-400 py-3 px-3 text-center font-bold text-[#198754]">
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleUpdateSessionField(
                                    item.id,
                                    'status',
                                    e.target.value as TrainingRecord['status']
                                  )
                                }
                                className="bg-transparent text-center font-bold text-[#198754] focus:outline-none cursor-pointer"
                              >
                                <option value="In-Progress">In-Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Not Started">Not Started</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="border border-dotted border-slate-400 py-3 px-3 text-center font-bold text-[#198754]">
                              <select
                                value={item.rating}
                                onChange={(e) =>
                                  handleUpdateSessionField(
                                    item.id,
                                    'rating',
                                    e.target.value as TrainingRecord['rating']
                                  )
                                }
                                className="bg-transparent text-center font-bold text-[#198754] uppercase focus:outline-none cursor-pointer"
                              >
                                <option value="Average">AVERAGE</option>
                                <option value="Good">GOOD</option>
                                <option value="Fair">FAIR</option>
                                <option value="Excellent">EXCELLENT</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                        {monthTrainings.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="border border-dotted border-slate-400 py-6 text-center text-xs text-slate-400"
                            >
                              No scheduled training tasks for {FULL_MONTHS[calMonth]} {calYear}. Use the form below to add one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Add Scheduled Task Bar for Selected Date */}
                  <form
                    onSubmit={handleAddSession}
                    className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex flex-wrap items-end gap-2.5"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Task *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., NPM-W2 Machine, Quality"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TrainingRecord['status'])}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900"
                      >
                        <option value="In-Progress">In-Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Not Started">Not Started</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Comments
                      </label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value as TrainingRecord['rating'])}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900"
                      >
                        <option value="Average">AVERAGE</option>
                        <option value="Good">GOOD</option>
                        <option value="Fair">FAIR</option>
                        <option value="Excellent">EXCELLENT</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
