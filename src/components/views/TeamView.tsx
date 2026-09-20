import React, { useState } from 'react';
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
import { INITIAL_TRAININGS } from '../../data/initialData';
import { Users, Award, Clock, BookOpen, UserCheck, Calendar, X, CheckCircle2, Plus } from 'lucide-react';
import { TrainingRecord } from '../../types';

export const TeamView: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingRecord[]>(INITIAL_TRAININGS);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [title, setTitle] = useState('');
  const [trainer, setTrainer] = useState('Md. Atiqur Rahman');
  const [type, setType] = useState<TrainingRecord['type']>('Practical');
  const [dept, setDept] = useState('SMT Production');
  const [participants, setParticipants] = useState('12');
  const [duration, setDuration] = useState('60');
  const [scheduledSuccess, setScheduledSuccess] = useState(false);
  const trainingTypeData = [
    { type: 'Online', count: 5, color: '#1fb6a6' },
    { type: 'Practical', count: 8, color: '#e35b2a' },
    { type: 'External', count: 2, color: '#e8478f' },
    { type: 'Internal', count: 9, color: '#28ad6b' },
  ];

  const statusData = [
    { status: 'Not Started', count: 1 },
    { status: 'In-Progress', count: 8 },
    { status: 'Completed', count: 15 },
  ];

  const ratingData = [
    { name: 'Good', value: 9, color: '#28ad6b' },
    { name: 'Excellent', value: 6, color: '#e8a13a' },
    { name: 'Average', value: 9, color: '#e35b2a' },
  ];

  const monthlyTrainees = [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 5 },
    { month: 'Mar', count: 5 },
    { month: 'Apr', count: 9 },
    { month: 'May', count: 26 },
    { month: 'Jun', count: 15 },
    { month: 'Jul', count: 24 },
    { month: 'Aug', count: 10 },
    { month: 'Sep', count: 10 },
    { month: 'Oct', count: 17 },
    { month: 'Nov', count: 0 },
    { month: 'Dec', count: 0 },
  ];

  const totalVsCompleted = [
    { month: 'Jan', total: 0, completed: 0 },
    { month: 'Feb', total: 1, completed: 1 },
    { month: 'Mar', total: 1, completed: 0 },
    { month: 'Apr', total: 2, completed: 2 },
    { month: 'May', total: 3, completed: 2 },
    { month: 'Jun', total: 3, completed: 3 },
    { month: 'Jul', total: 3, completed: 2 },
    { month: 'Aug', total: 2, completed: 2 },
    { month: 'Sep', total: 2, completed: 1 },
    { month: 'Oct', total: 3, completed: 2 },
    { month: 'Nov', total: 0, completed: 0 },
    { month: 'Dec', total: 0, completed: 0 },
  ];

  return (
    <div id="page-team" className="space-y-6 animate-in fade-in duration-200">
      {/* Head */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1730]">Team &amp; Training</h2>
          <div className="text-xs text-[#5b6480] mt-0.5">
            Governance · Employee Training Tracker, Workmanship Certifications &amp; Development
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scheduledSuccess && (
            <span className="text-xs font-semibold text-[#1c8a53] bg-[#e5f7ee] px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Session Scheduled!
            </span>
          )}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-2 bg-[#182a52] hover:bg-[#22376b] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#28ad6b]">24</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Total Training</div>
          <div className="text-[11px] text-[#5b6480] mt-1">Completed sessions</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#128f83]">46</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Manpower Certified</div>
          <div className="text-[11px] text-[#128f83] mt-1">Active operators</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#e8a13a]">68</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Total Enrollments</div>
          <div className="text-[11px] text-[#5b6480] mt-1">Module certifications</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs text-center flex flex-col justify-center">
          <div className="font-mono text-3xl font-bold text-[#182a52]">465 min</div>
          <div className="text-xs font-bold text-[#5b6480] uppercase tracking-wider mt-1">Total Instruction Time</div>
          <div className="text-[11px] text-[#5b6480] mt-1">7.75 classroom hours</div>
        </div>
      </div>

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
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
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
            Heavy focus on hands-on practical soldering and optical classification.
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-[#0d1730]">Delivery Status</h3>
            <p className="text-[11px] text-[#5b6480] mb-2">Not started, In-progress, Completed</p>
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
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2f9bea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-1 border-t border-[#e2e7f2]">
            62.5% of annual scheduled curriculum already complete.
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
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
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
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#0d1730] font-medium">Production (SMT &amp; THT)</span>
                <span className="font-mono font-bold text-[#22376b] text-sm">14 Sessions</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#0d1730] font-medium">Supply Chain &amp; Warehouse</span>
                <span className="font-mono font-bold text-[#22376b] text-sm">8 Sessions</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e2e7f2]">
            <h3 className="font-bold text-sm text-[#0d1730]">Top Plant Trainer</h3>
            <div className="mt-2 p-3 bg-[#eef1f8] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#182a52] text-white flex items-center justify-center font-mono font-bold text-sm">
                  AR
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0d1730]">Md. Atiqur Rahman</div>
                  <div className="text-[11px] text-[#5b6480]">Lead Trainer · ID: 40736</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#1fb6a6] text-white font-mono font-bold text-xs rounded-lg">
                12 Sessions Conducted
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
              <BarChart data={monthlyTrainees} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="month" stroke="#5b6480" fontSize={10} />
                <YAxis stroke="#5b6480" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2f9bea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-[#5b6480] text-center pt-2 border-t border-[#e2e7f2]">
            Peak trainee volume during annual May IPC-A-610 recertification drive (26 staff).
          </div>
        </div>
      </div>

      {/* Total vs Completed Training Chart */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-[#0d1730]">Total vs Completed Training by Month</h3>
            <p className="text-xs text-[#5b6480]">Target scheduled vs executed training cohorts</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2f9bea]" /> Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e35b2a]" /> Completed</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={totalVsCompleted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
              <XAxis dataKey="month" stroke="#5b6480" fontSize={10} />
              <YAxis stroke="#5b6480" fontSize={10} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e7f2', fontSize: '11px' }}
              />
              <Bar dataKey="total" name="Total Scheduled" fill="#2f9bea" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#e35b2a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Schedule Training Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e7f2] relative">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#5b6480] hover:bg-[#eef1f8] hover:text-[#0d1730] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#182a52] text-white flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0d1730]">Schedule Training Session</h3>
                <p className="text-xs text-[#5b6480]">Walton Quality &amp; Workmanship Development</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!title) return;
                const newRecord: TrainingRecord = {
                  id: `tr-${Date.now()}`,
                  title,
                  trainer,
                  type,
                  department: dept,
                  participants: parseInt(participants) || 10,
                  durationMinutes: parseInt(duration) || 60,
                  date: new Date().toISOString().split('T')[0],
                  status: 'In-Progress',
                  rating: 'Good',
                };
                setTrainings([newRecord, ...trainings]);
                setShowScheduleModal(false);
                setTitle('');
                setScheduledSuccess(true);
                setTimeout(() => setScheduledSuccess(false), 4000);
              }}
              className="space-y-3.5 text-xs text-[#0d1730]"
            >
              <div>
                <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                  Training Module Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., IPC-A-610 Class 3 Solder Inspection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-xs focus:outline-none focus:border-[#182a52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                    Lead Trainer
                  </label>
                  <input
                    type="text"
                    value={trainer}
                    onChange={(e) => setTrainer(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-xs focus:outline-none focus:border-[#182a52]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                    Delivery Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TrainingRecord['type'])}
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-xs focus:outline-none focus:border-[#182a52] bg-white"
                  >
                    <option value="Practical">Practical / On-Line</option>
                    <option value="Internal">Internal Classroom</option>
                    <option value="Online">Online LMS</option>
                    <option value="External">External Certified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                    Target Dept / Line
                  </label>
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-xs focus:outline-none focus:border-[#182a52]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-xs focus:outline-none focus:border-[#182a52]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5b6480] uppercase tracking-wider mb-1">
                  Expected Participants (Headcount)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-xs focus:outline-none focus:border-[#182a52]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#e2e7f2]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-2 border border-[#e2e7f2] rounded-lg text-xs font-semibold text-[#5b6480] hover:bg-[#eef1f8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#182a52] hover:bg-[#22376b] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Confirm Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
