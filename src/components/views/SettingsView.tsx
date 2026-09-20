import React, { useState } from 'react';
import { User, Bell, Shield, Sliders, Save, CheckCircle, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'lines'>('profile');
  const [name, setName] = useState('Atikur Rahman');
  const [empId, setEmpId] = useState('40736');
  const [department, setDepartment] = useState('Quality Management');
  const [email, setEmail] = useState('atiqur40736@waltonbd.com');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification toggles
  const [overdueAlert, setOverdueAlert] = useState(true);
  const [ncrAlert, setNcrAlert] = useState(true);
  const [weeklyKpi, setWeeklyKpi] = useState(false);
  const [autoSopReminder, setAutoSopReminder] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="page-settings" className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-[#0d1730]">Settings &amp; Station Profile</h2>
        <div className="text-xs text-[#5b6480] mt-0.5">
          Account Preferences, Line Escalation Policies, &amp; System Parameters
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Settings Navigation */}
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-2 shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'profile' ? 'bg-[#182a52] text-white' : 'text-[#5b6480] hover:bg-[#eef1f8]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile &amp; Identity</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'notifications' ? 'bg-[#182a52] text-white' : 'text-[#5b6480] hover:bg-[#eef1f8]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts &amp; Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'security' ? 'bg-[#182a52] text-white' : 'text-[#5b6480] hover:bg-[#eef1f8]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Access &amp; Security</span>
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'lines' ? 'bg-[#182a52] text-white' : 'text-[#5b6480] hover:bg-[#eef1f8]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Line Assignments</span>
          </button>
        </div>

        {/* Right Tab Content */}
        <div className="md:col-span-3 space-y-4">
          {activeTab === 'profile' && (
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-6 shadow-xs space-y-4">
              <div className="border-b border-[#e2e7f2] pb-3">
                <h3 className="font-bold text-sm text-[#0d1730]">Quality Lead Profile</h3>
                <p className="text-xs text-[#5b6480]">Walton Hi-Tech Industries internal badge credentials</p>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-[#e5f7ee] border border-[#1c8a53]/20 rounded-lg text-xs text-[#1c8a53] flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Profile parameters successfully updated!</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#5b6480] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5b6480] mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5b6480] mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5b6480] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#e35b2a] hover:bg-[#c74a1f] text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-6 shadow-xs space-y-4">
              <div className="border-b border-[#e2e7f2] pb-3">
                <h3 className="font-bold text-sm text-[#0d1730]">Alerts &amp; Escalation Triggers</h3>
                <p className="text-xs text-[#5b6480]">Choose what automated telegram and email notifications are sent</p>
              </div>

              <div className="divide-y divide-[#e2e7f2] text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#0d1730]">Overdue CAPA Alerts</div>
                    <div className="text-[#5b6480]">Email notification when a CAPA reaches 24h before due date</div>
                  </div>
                  <button
                    onClick={() => setOverdueAlert(!overdueAlert)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      overdueAlert ? 'bg-[#1fb6a6]' : 'bg-[#d6dcec]'
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-xs absolute top-0.75 ${
                        overdueAlert ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#0d1730]">New Non-Conformance Reports (NCR)</div>
                    <div className="text-[#5b6480]">Instant alert whenever a Major or Critical defect is logged on any SMT line</div>
                  </div>
                  <button
                    onClick={() => setNcrAlert(!ncrAlert)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      ncrAlert ? 'bg-[#1fb6a6]' : 'bg-[#d6dcec]'
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-xs absolute top-0.75 ${
                        ncrAlert ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#0d1730]">Weekly KPI Executive Digest</div>
                    <div className="text-[#5b6480]">Summary report delivered every Monday at 07:00 AM</div>
                  </div>
                  <button
                    onClick={() => setWeeklyKpi(!weeklyKpi)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      weeklyKpi ? 'bg-[#1fb6a6]' : 'bg-[#d6dcec]'
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-xs absolute top-0.75 ${
                        weeklyKpi ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#0d1730]">Controlled SOP Revision Reminders</div>
                    <div className="text-[#5b6480]">Ping document owners 30 days prior to annual audit re-approval</div>
                  </div>
                  <button
                    onClick={() => setAutoSopReminder(!autoSopReminder)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoSopReminder ? 'bg-[#1fb6a6]' : 'bg-[#d6dcec]'
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-xs absolute top-0.75 ${
                        autoSopReminder ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-6 shadow-xs space-y-4">
              <div className="border-b border-[#e2e7f2] pb-3">
                <h3 className="font-bold text-sm text-[#0d1730]">Role-Based Access Control (RBAC)</h3>
                <p className="text-xs text-[#5b6480]">Current permission matrix for Walton Plant Operations</p>
              </div>

              <div className="p-3 bg-[#eef1f8] rounded-lg text-xs space-y-1">
                <div className="font-bold text-[#0d1730]">Assigned Role: Super Administrator &amp; QA Lead</div>
                <div className="text-[#5b6480]">Full authorization to close CAPAs, approve SOP revisions, and sign off NCR containment.</div>
              </div>

              <div className="pt-2 space-y-2">
                {resetSent ? (
                  <div className="p-3 bg-[#e5f7ee] border border-[#1c8a53]/20 rounded-lg text-xs text-[#1c8a53] flex items-center gap-2 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Password reset instructions dispatched to atiqur40736@waltonbd.com</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(true);
                      setTimeout(() => setResetSent(false), 4000);
                    }}
                    className="px-4 py-2 border border-[#2a3c6b] text-[#22376b] font-semibold rounded-lg text-xs hover:bg-[#eef1f8] cursor-pointer"
                  >
                    Request Password Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lines' && (
            <div className="bg-white border border-[#e2e7f2] rounded-xl p-6 shadow-xs space-y-4">
              <div className="border-b border-[#e2e7f2] pb-3">
                <h3 className="font-bold text-sm text-[#0d1730]">Monitored Factory Lines</h3>
                <p className="text-xs text-[#5b6480]">Active SMT and Through-hole production lines under live tracking</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {['SMT Line 1 (Inverter)', 'SMT Line 2 (TV 4K)', 'SMT Line 3 (LED)', 'SMT Line 4 (Mobile)', 'THT Wave Line 1', 'THT Wave Line 2', 'PCB AOI Station 1', 'PCB Final QC Bay'].map((l) => (
                  <div key={l} className="p-3 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg flex items-center justify-between">
                    <span className="font-semibold text-[#0d1730]">{l}</span>
                    <span className="w-2 h-2 rounded-full bg-[#28ad6b]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
