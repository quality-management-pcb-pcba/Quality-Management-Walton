import React, { useState, useEffect } from 'react';
import { PageId } from '../../types';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Award,
  ChevronRight,
  UserPlus,
  UserCog,
  Edit3,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  LeaderProfile,
  getStoredLeaders,
  ensureAllDefaultLeaders,
  subscribeLeaders,
  saveLeaderProfile,
  deleteLeaderProfile,
  resetLeadersToDefaults,
  sortLeadersList,
} from '../../services/leadersService';
import { LeaderProfileModal } from '../modals/LeaderProfileModal';
import { WaltonSealLogo } from '../WaltonSealLogo';

interface LeadersViewProps {
  onNavigate?: (page: PageId) => void;
}

export const LeadersView: React.FC<LeadersViewProps> = ({ onNavigate = (_page: PageId) => {} }) => {
  const [leaders, setLeaders] = useState<LeaderProfile[]>(() => getStoredLeaders());
  const [selectedLeader, setSelectedLeader] = useState<LeaderProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLeader, setEditingLeader] = useState<LeaderProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time updates and localStorage caching
  useEffect(() => {
    void ensureAllDefaultLeaders();
    const unsubscribe = subscribeLeaders((updatedList) => {
      setLeaders(updatedList);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenAddModal = () => {
    setEditingLeader(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (leader: LeaderProfile) => {
    setEditingLeader(leader);
    setIsModalOpen(true);
  };

  const handleSaveLeader = async (leader: LeaderProfile) => {
    const saved = await saveLeaderProfile(leader);
    // Synchronously update local React state immediately
    setLeaders((prev) => {
      const idx = prev.findIndex(
        (l) => l.id === saved.id || (saved.employeeId && l.employeeId === saved.employeeId)
      );
      let next: LeaderProfile[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = saved;
      } else {
        next = [...prev, saved];
      }
      return sortLeadersList(next);
    });

    showToast(`Leader profile for "${saved.name}" updated & saved successfully!`);

    // If we were previewing this leader, update the preview state
    if (selectedLeader?.id === saved.id || (saved.employeeId && selectedLeader?.employeeId === saved.employeeId)) {
      setSelectedLeader(saved);
    }
  };

  const handleDeleteLeader = async (leaderId: string) => {
    await deleteLeaderProfile(leaderId);
    setLeaders((prev) => prev.filter((l) => l.id !== leaderId));
    showToast('Leader profile removed from directory.');
    if (selectedLeader?.id === leaderId) {
      setSelectedLeader(null);
    }
  };

  const handleResetDefaults = async () => {
    const defaults = await resetLeadersToDefaults();
    setLeaders(defaults);
    showToast('Directory reset to default 5 Walton QM leaders.');
  };

  const topTier = leaders.filter((l) => l.tier === 'executive');
  const bottomTier = leaders.filter((l) => l.tier === 'operations');

  return (
    <div id="page-leaders-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0d1730] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#3b82f6]/40 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#cbd5e1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-md border border-[#cbd5e1] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-xs text-[#94a3b8]">/</span>
            <span className="text-xs font-semibold text-[#5b6480]">Organization Hierarchy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0d1730] tracking-tight">
            Quality Management Leaders
          </h1>
          <p className="text-xs sm:text-sm text-[#5b6480] mt-0.5">
            Walton Hi-Tech Industries PLC · PCB &amp; PCBA Quality Governance &amp; Executive Leadership
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* User Requested: Entry / Update Profile Leaders Button */}
          <button
            type="button"
            id="btn-entry-update-leaders"
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-[#e35b2a] hover:bg-[#c8491c] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-transparent hover:shadow-sm"
            title="Add or update a quality management leader profile"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Entry / Update Profile Leaders</span>
          </button>
        </div>
      </div>

      {/* Main Leaders Presentation Canvas Matching CSS Selector 1 */}
      <div
        id="leaders-hierarchy-container"
        className="bg-[#ededed] sm:bg-[#eef1f6] border border-[#d1d5db] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden"
      >
        {/* Subtle decorative background watermark logos */}
        <div className="absolute -top-12 -right-12 w-64 h-64 opacity-[0.05] select-none pointer-events-none">
          <WaltonSealLogo animated={false} className="w-full h-full object-contain" />
        </div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 opacity-[0.035] select-none pointer-events-none hidden md:block">
          <WaltonSealLogo animated={false} className="w-full h-full object-contain" />
        </div>

        {/* Walton Quality Management Official Logo Masthead & Crest */}
        <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-12 relative z-10">
          <div className="flex flex-col items-center group">
            {/* Circular Official Seal Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-white p-1.5 shadow-md border-2 border-[#1c356b]/20 flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-105">
              <WaltonSealLogo animated={true} className="w-full h-full object-contain select-none" />
            </div>

            {/* Corporate Title Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-[#cbd5e1] shadow-2xs mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e35b2a] animate-pulse"></span>
              <span className="text-[11px] font-bold text-[#1c356b] tracking-wider uppercase">
                Walton Hi-Tech Industries PLC
              </span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-black text-[#0d1730] tracking-tight uppercase">
              Quality Management Directorate · PCB &amp; PCBA
            </h2>
            <p className="text-[11px] sm:text-xs text-[#5b6480] font-medium max-w-md mt-0.5">
              Executive Governance &amp; High-Yield Operations Organization Tree
            </p>
          </div>

          {/* Decorative Connecting Stem to Leadership Hierarchy */}
          <div className="w-px h-8 bg-gradient-to-b from-[#1c356b]/40 to-[#1c356b]/10 mt-3 hidden sm:block"></div>
        </div>

        {/* Tier 1: Executive Leaders (Top Row, Centered) */}
        <div className="flex flex-wrap justify-center gap-10 sm:gap-20 lg:gap-32 mb-10 sm:mb-14">
          {topTier.map((leader) => (
            <div
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="flex flex-col items-center text-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1 max-w-[220px] relative"
            >
              {/* Circular Avatar */}
              <div className="relative mb-3.5">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 border-white shadow-md bg-white group-hover:border-[#2563eb] transition-colors">
                  <img
                    src={leader.photoUrl}
                    alt={leader.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add(
                          'flex',
                          'items-center',
                          'justify-center',
                          'bg-[#1c356b]',
                          'text-white',
                          'font-bold',
                          'text-2xl'
                        );
                        target.parentElement.innerText = leader.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2);
                      }
                    }}
                  />
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#1c356b] border-2 border-white text-white flex items-center justify-center shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                </div>

                {/* Quick Edit Icon Overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(leader);
                  }}
                  className="absolute top-0 right-0 w-7 h-7 rounded-full bg-white text-[#1c356b] hover:text-white hover:bg-[#e35b2a] border border-[#cbd5e1] shadow-md flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={`Edit ${leader.name}'s profile`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Leader Name & ID */}
              <div className="text-sm sm:text-base font-bold text-[#0d1730] tracking-tight group-hover:text-[#1c356b] transition-colors">
                {leader.name} ({leader.employeeId})
              </div>

              {/* Leader Designation */}
              <div className="text-xs sm:text-sm font-medium text-[#334155] mt-0.5">
                {leader.designation}
              </div>

              {/* Action Buttons */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#2563eb] flex items-center gap-0.5 group-hover:underline">
                  <span>View Bio</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(leader);
                  }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-[#e35b2a] text-[#1c356b] hover:text-white border border-[#cbd5e1] shadow-2xs transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                  title={`Edit profile for ${leader.name}`}
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tier 2: Operations Leaders (Bottom Row, Centered) */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-14 lg:gap-24">
          {bottomTier.map((leader) => (
            <div
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="flex flex-col items-center text-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1 max-w-[210px] relative"
            >
              {/* Circular Avatar */}
              <div className="relative mb-3.5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-white shadow-md bg-white group-hover:border-[#e35b2a] transition-colors">
                  <img
                    src={leader.photoUrl}
                    alt={leader.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add(
                          'flex',
                          'items-center',
                          'justify-center',
                          'bg-[#e35b2a]',
                          'text-white',
                          'font-bold',
                          'text-xl'
                        );
                        target.parentElement.innerText = leader.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2);
                      }
                    }}
                  />
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#0d9488] border-2 border-white text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                </div>

                {/* Quick Edit Icon Overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(leader);
                  }}
                  className="absolute top-0 right-0 w-6 h-6 rounded-full bg-white text-[#1c356b] hover:text-white hover:bg-[#e35b2a] border border-[#cbd5e1] shadow-md flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={`Edit ${leader.name}'s profile`}
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              {/* Leader Name & ID */}
              <div className="text-xs sm:text-sm font-bold text-[#0d1730] tracking-tight group-hover:text-[#e35b2a] transition-colors">
                {leader.name} ({leader.employeeId})
              </div>

              {/* Leader Designation */}
              <div className="text-[11px] sm:text-xs font-medium text-[#334155] mt-0.5">
                {leader.designation}
              </div>

              {/* Action Buttons */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#e35b2a] flex items-center gap-0.5 group-hover:underline">
                  <span>View Bio</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(leader);
                  }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-[#e35b2a] text-[#1c356b] hover:text-white border border-[#cbd5e1] shadow-2xs transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                  title={`Edit profile for ${leader.name}`}
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Directory Table / Cards Detail Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#0d1730]">
              Operational Roles &amp; Responsibilities
            </h2>
            <p className="text-xs text-[#5b6480] mt-0.5">
              {leaders.length} Key Leaders in Directorate
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#1c356b] border border-[#cbd5e1] rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#e35b2a]" />
            <span>Entry New Leader</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className="bg-white rounded-xl border border-[#cbd5e1] p-5 shadow-xs flex flex-col justify-between hover:border-[#94a3b8] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-3">
                    <img
                      src={leader.photoUrl}
                      alt={leader.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#cbd5e1]"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-[#0d1730]">{leader.name}</h3>
                      <div className="text-xs font-semibold text-[#2563eb]">
                        ID: {leader.employeeId}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      leader.tier === 'executive'
                        ? 'bg-[#e0e7ff] text-[#3730a3]'
                        : 'bg-[#fef3c7] text-[#92400e]'
                    }`}
                  >
                    {leader.tier === 'executive' ? 'Executive' : 'Operations'}
                  </span>
                </div>

                <div className="pt-3 space-y-2">
                  <div className="text-xs font-bold text-[#0d1730]">
                    {leader.designation}
                  </div>
                  <div className="text-xs text-[#5b6480] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                    <span>{leader.department}</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                      Core Responsibilities
                    </div>
                    <ul className="space-y-1 text-xs text-[#475569]">
                      {leader.responsibilities.slice(0, 2).map((resp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLeader(leader)}
                    className="text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer"
                  >
                    Full Bio &amp; Contact →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(leader)}
                    className="text-xs font-semibold text-[#e35b2a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
                <a
                  href={`mailto:${leader.email}`}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-[#5b6480] hover:text-[#0d1730] transition-colors"
                  title={`Send email to ${leader.name}`}
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leader Detail Modal */}
      {selectedLeader && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#cbd5e1] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header Banner */}
            <div className="bg-[#0d1730] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedLeader(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={selectedLeader.photoUrl}
                  alt={selectedLeader.name}
                  className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md bg-white"
                />
                <div>
                  <h3 className="text-xl font-bold">{selectedLeader.name}</h3>
                  <div className="text-xs text-[#38bdf8] font-mono mt-0.5">
                    Employee ID: {selectedLeader.employeeId}
                  </div>
                  <div className="text-sm font-semibold text-white/90 mt-1">
                    {selectedLeader.designation}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1">
                  Department &amp; Scope
                </div>
                <div className="font-semibold text-[#0d1730]">
                  {selectedLeader.department}
                </div>
                <div className="text-xs text-[#5b6480] mt-0.5">
                  {selectedLeader.location}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Strategic Responsibilities
                </div>
                <ul className="space-y-2 text-[#334155]">
                  {selectedLeader.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#e2e8f0] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#475569]">
                  <Mail className="w-4 h-4 text-[#2563eb]" />
                  <a
                    href={`mailto:${selectedLeader.email}`}
                    className="hover:underline text-[#2563eb] font-semibold"
                  >
                    {selectedLeader.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-[#475569]">
                  <Phone className="w-4 h-4 text-[#0d9488]" />
                  <span>{selectedLeader.phone}</span>
                </div>
              </div>

              {/* Action Buttons in Detail Modal */}
              <div className="pt-4 flex items-center justify-between border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedLeader;
                    setSelectedLeader(null);
                    handleOpenEditModal(toEdit);
                  }}
                  className="px-3.5 py-2 bg-[#e35b2a] hover:bg-[#c8491c] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit This Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLeader(null)}
                  className="px-4 py-2 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry / Update Leader Profile Modal */}
      <LeaderProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leaders={leaders}
        initialLeader={editingLeader}
        onSave={handleSaveLeader}
        onDelete={handleDeleteLeader}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
};
