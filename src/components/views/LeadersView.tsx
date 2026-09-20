import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Award,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

interface LeadersViewProps {
  onNavigate?: (page: PageId) => void;
}

interface LeaderProfile {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  tier: 'executive' | 'operations';
  department: string;
  responsibilities: string[];
  experience: string;
  location: string;
  email: string;
  phone: string;
  photoUrl: string;
}

const LEADERS: LeaderProfile[] = [
  {
    id: 'nasir-uddin',
    name: 'Md. Nasir Uddin',
    employeeId: '18139',
    designation: 'CBO of PCB & PCBA',
    tier: 'executive',
    department: 'PCB & PCBA Business Operations',
    responsibilities: [
      'Strategic executive direction across PCB fabrication and SMT PCBA manufacturing divisions',
      'Capital allocation for high-precision automated inspection machinery (3D AOI, X-Ray, Flying Probe)',
      'Total Quality Management (TQM) governance and global electronic manufacturing compliance',
    ],
    experience: '18+ Years in High-Volume Electronics Manufacturing & Corporate Leadership',
    location: 'Walton Hi-Tech Industries PLC, Chandra, Gazipur',
    email: 'nasir.cbo@waltonbd.com',
    phone: '+880 1713-262601',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'atiqur-rahman',
    name: 'Md. Atiqur Rahman',
    employeeId: '40736',
    designation: 'Head of QM- PCB&PCBA',
    tier: 'executive',
    department: 'Quality Management Division',
    responsibilities: [
      'Division-wide quality assurance, IPC-A-610 Class 3 and ISO 9001:2015 adherence',
      'Lead cross-functional CAPA 8D investigations, root cause analyses, and supplier quality audits',
      'Daily quality yield tracking across all TV, Refrigerator, and Mobile PCBA production lines',
    ],
    experience: '12+ Years in Electronic Circuit Quality Assurance & Manufacturing Excellence',
    location: 'Quality Management Headquarters, Walton Gazipur Plant',
    email: 'qm.pcba26@gmail.com',
    phone: '+880 1678-860873',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'tazedul-hoque',
    name: 'Md. Tazedul Hoque',
    employeeId: '36924',
    designation: 'Co-Ordinator of QM- PCBA',
    tier: 'operations',
    department: 'PCBA Quality Coordination',
    responsibilities: [
      'Surface Mount Technology (SMT) and Through-Hole (THT) quality process coordination',
      'Solder paste inspection (SPI) parameters and reflow soldering thermal profile auditing',
      'First-article inspection (FAI) approval and continuous training for in-line QC personnel',
    ],
    experience: '9+ Years in PCBA Process Engineering & Quality Coordination',
    location: 'PCBA SMT Quality Hub, Plant 02, Gazipur',
    email: 'tazedul.qm@waltonbd.com',
    phone: '+880 1713-262635',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'alamgir-hossain',
    name: 'Md. Alamgir Hossain',
    employeeId: '25673',
    designation: 'Supervisor of QM- PCB',
    tier: 'operations',
    department: 'PCB Quality Control',
    responsibilities: [
      'Raw PCB fabrication quality oversight (Dry Film, CNC Drilling, PTH Copper Plating)',
      'Solder mask alignment, HASL/ENIG surface finish verification, and bare-board electrical testing (ET)',
      'Frontline inspection team shift scheduling and zero-defect scrap reduction initiatives',
    ],
    experience: '8+ Years in PCB Manufacturing & Defect Prevention',
    location: 'PCB Fabrication Quality Control Section, Gazipur',
    email: 'alamgir.pcb@waltonbd.com',
    phone: '+880 1713-262642',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 'mamun-hossen',
    name: 'Md. Mamun Hossen',
    employeeId: '42179',
    designation: 'Supervisor of QM- PCBA',
    tier: 'operations',
    department: 'PCBA Quality Control',
    responsibilities: [
      'Direct supervision of 3D AOI inspection stations and in-circuit testing (ICT) bays',
      'Non-conformance containment on active lines and immediate defect feedback to line engineers',
      'Worker KPI evaluation, workmanship grading according to IPC standards, and 5S compliance',
    ],
    experience: '7+ Years in SMT In-Line Quality Supervision',
    location: 'PCBA Assembly Line 01-08 QA Bay, Gazipur',
    email: 'mamun.pcba@waltonbd.com',
    phone: '+880 1713-262650',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
  },
];

export const LeadersView: React.FC<LeadersViewProps> = ({ onNavigate = (_page: PageId) => {} }) => {
  const [selectedLeader, setSelectedLeader] = useState<LeaderProfile | null>(null);

  const topTier = LEADERS.filter((l) => l.tier === 'executive');
  const bottomTier = LEADERS.filter((l) => l.tier === 'operations');

  return (
    <div id="page-leaders-view" className="space-y-6 animate-in fade-in duration-200">
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3.5 py-2 bg-[#1c356b] hover:bg-[#152a55] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>QMS Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Leaders Presentation Canvas Matching Image.png */}
      <div
        id="leaders-hierarchy-container"
        className="bg-[#ededed] sm:bg-[#eef1f6] border border-[#d1d5db] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden"
      >
        {/* Subtle decorative background watermark */}
        <div className="absolute top-4 right-6 text-[#cbd5e1]/40 font-mono font-black text-6xl select-none pointer-events-none">
          WALTON QM
        </div>

        {/* Section title banner */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block px-3 py-1 bg-white/80 border border-[#cbd5e1] rounded-full text-[11px] font-bold text-[#1c356b] uppercase tracking-wider shadow-2xs">
            Leadership Directory · PCB &amp; PCBA Divisions
          </span>
        </div>

        {/* Tier 1: 2 Leaders (Top Row, Centered) */}
        <div className="flex flex-wrap justify-center gap-10 sm:gap-20 lg:gap-32 mb-10 sm:mb-14">
          {topTier.map((leader) => (
            <div
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="flex flex-col items-center text-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1 max-w-[220px]"
            >
              {/* Circular Avatar */}
              <div className="relative mb-3.5">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 border-white shadow-md bg-white group-hover:border-[#2563eb] transition-colors">
                  <img
                    src={leader.photoUrl}
                    alt={leader.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to stylized initials if image loading fails
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-[#1c356b]', 'text-white', 'font-bold', 'text-2xl');
                        target.parentElement.innerText = leader.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
                      }
                    }}
                  />
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#1c356b] border-2 border-white text-white flex items-center justify-center shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Leader Name & ID */}
              <div className="text-sm sm:text-base font-bold text-[#0d1730] tracking-tight group-hover:text-[#1c356b] transition-colors">
                {leader.name} ({leader.employeeId})
              </div>

              {/* Leader Designation */}
              <div className="text-xs sm:text-sm font-medium text-[#334155] mt-0.5">
                {leader.designation}
              </div>

              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-[#2563eb] flex items-center gap-1">
                <span>View Profile</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Tier 2: 3 Leaders (Bottom Row, Centered) */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-14 lg:gap-24">
          {bottomTier.map((leader) => (
            <div
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="flex flex-col items-center text-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1 max-w-[210px]"
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
                        target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-[#e35b2a]', 'text-white', 'font-bold', 'text-xl');
                        target.parentElement.innerText = leader.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
                      }
                    }}
                  />
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#0d9488] border-2 border-white text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>

              {/* Leader Name & ID */}
              <div className="text-xs sm:text-sm font-bold text-[#0d1730] tracking-tight group-hover:text-[#e35b2a] transition-colors">
                {leader.name} ({leader.employeeId})
              </div>

              {/* Leader Designation */}
              <div className="text-[11px] sm:text-xs font-medium text-[#334155] mt-0.5">
                {leader.designation}
              </div>

              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-[#e35b2a] flex items-center gap-1">
                <span>View Profile</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Directory Table / Cards Detail Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0d1730]">
            Operational Roles &amp; Responsibilities
          </h2>
          <span className="text-xs text-[#5b6480]">
            5 Key Leaders in Directorate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEADERS.map((leader) => (
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
                      <h3 className="font-bold text-sm text-[#0d1730]">
                        {leader.name}
                      </h3>
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
                <button
                  onClick={() => setSelectedLeader(leader)}
                  className="text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer"
                >
                  Full Bio &amp; Contact →
                </button>
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

              <div className="pt-4 flex justify-end">
                <button
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
    </div>
  );
};
