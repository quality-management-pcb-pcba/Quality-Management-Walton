/**
 * =========================================================================================
 * @file src/components/LandingPage.tsx
 * @component LandingPage
 * @description Public Portal Showcase & Operational Hub for Walton PCB & PCBA Quality Management
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Serves as the high-impact public visual portal for Walton Hi-Tech Industries Quality Management:
 * 1. Hero Carousel: Highlighting automated SMT manufacturing, optical inspection, and Walton engineers.
 * 2. Executive Metrics Showcase: Animated KPI counters for Total Inspection Volume, FPY, and Yield.
 * 3. Operational Division Hubs: Quick cards directing engineers to TQM, QA, QC, and R&D modules.
 * 4. Frontline Recognition Showcase: "Worker Talent of the Month" editable by logged-in plant leads.
 * 5. Quality Standards & Vision AI Research preview (highlighting Six Sigma & Vision AI studies).
 *
 * WHERE GEMINI AI API IS INTEGRATED & REFERENCED:
 * -----------------------------------------------
 * - The Research & Innovation section on this page introduces Walton's AI-Based Visual Inspection
 *   and Process FMEA roadmap.
 * - Under the hood, the Gemini AI service (`src/services/geminiService.ts`) powers automated
 *   defect classification, 8D CAPA formulation, and IPC-A-610 standards compliance.
 *
 * PARAMETERS / PROPS (LandingPageProps):
 * --------------------------------------
 * @param {() => void} onEnterDashboard - Callback to enter the executive dashboard (public mode without sidebar).
 * @param {(page: PageId) => void} [onNavigateToPage] - Callback to jump directly to an internal QMS module.
 * @param {() => void} [onOpenLogin] - Callback to open the administrative login modal dialog.
 * @param {boolean} [isLoggedIn] - Indicates whether the user has active administrative permissions.
 * @param {() => void} [onLogout] - Callback invoked when the user signs out.
 * @param {(deptId: string) => void} [onSelectDepartment] - Handler for department quick-filter selection.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WaltonSealLogo } from './WaltonSealLogo';
import { QmBadge } from './QmBadge';
import { ContactModal } from './modals/ContactModal';
import { AboutModal, AboutTabType } from './modals/AboutModal';
import { ProductModal } from './modals/ProductModal';
import {
  WALTON_EMBLEM_LEFT_PATH,
  WALTON_EMBLEM_RED_PATH,
  WALTON_EMBLEM_RIGHT_PATH,
} from './waltonLogoPaths';
import { PageId } from '../types';
import {
  Globe,
  Cpu,
  Award,
  Users,
  CheckCircle,
  FileSpreadsheet,
  FileCheck,
  Bot,
  Cog,
  FileText,
  Search,
  Check,
  LogIn,
  LogOut,
  Edit3,
  Plus,
  Sparkles,
  X,
  ChevronRight,
  ChevronDown,
  Target,
  Eye,
  Briefcase,
  PlayCircle,
  Layers,
  User,
  UserCheck,
  ClipboardCheck,
  BookOpenCheck,
  Image as ImageIcon,
  RotateCcw,
  Facebook,
  Youtube,
  Linkedin,
  Instagram,
  ExternalLink,
} from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  delay?: number;
}

/**
 * AnimatedCounter Component
 * -------------------------
 * Renders a smooth animated number count-up effect using an exponential ease-out curve.
 *
 * @param {number} target - The final number to reach (e.g. 1542000 inspections)
 * @param {number} [duration=1500] - Duration of the animation in milliseconds
 * @param {number} [delay=50] - Delay before the animation starts
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 1500,
  delay = 50,
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let animFrameId: number;
    let startTimestamp: number | null = null;
    let timer: NodeJS.Timeout;

    timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Exponential ease-out curve for natural deceleration
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.round(easeOut * target));

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        }
      };
      animFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [target, duration, delay]);

  return <span>{count.toLocaleString()}</span>;
};

interface LandingPageProps {
  onEnterDashboard: () => void;
  onNavigateToPage?: (page: PageId) => void;
  onOpenLogin?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onSelectDepartment?: (deptId: string) => void;
}

const heroBannerImages = [
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80',
    title: 'Walton Quality Management PCB & PCBA Engineering Meeting',
    label: 'Engineering Quality Governance & IPC Class 3 Review',
  },
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    title: 'High-Precision Automated SMT Line & Optical Inspection',
    label: 'SMT Line 1-8 · Reflow Profiling & AOI Quality Control',
  },
  {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    title: 'Multilayer PCB Micro-Soldering & IPC Quality Verification',
    label: 'Automated X-Ray BGA Void Analysis & Solder Integrity',
  },
];

interface WorkerTalentData {
  title: string;
  description: string;
  awardees: string[];
  photo1Url: string;
  photo1Label: string;
  photo2Url: string;
  photo2Label: string;
}

const DEFAULT_WORKER_TALENT: WorkerTalentData = {
  title: "Worker Talent of the Month-Jul'26",
  description:
    'Honoring frontline specialists for outstanding zero-defect precision, flawless IPC-A-610 Class 3 inspection adherence, and exemplary contribution to PCB/PCBA manufacturing lines.',
  awardees: [
    'Md. Shafiqul Islam (Lead AOI Tech)',
    'Ms. Nusrat Jahan (SMT QA Specialist)',
    '99.8% FPY Achievement',
  ],
  photo1Url:
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
  photo1Label: 'Line 03 SMT',
  photo2Url:
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
  photo2Label: 'QM Excellence',
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onNavigateToPage = (_page: PageId) => {},
  onOpenLogin = () => {},
  isLoggedIn = false,
  onLogout = () => {},
  onSelectDepartment = (_deptId: string) => {},
}) => {
  const [contactOpen, setContactOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutTab, setAboutTab] = useState<AboutTabType>('overview');
  const [aboutMenuOpen, setAboutMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [kpiAnimKey, setKpiAnimKey] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);

  // Worker Talent Entry state & persistence
  const [talentData, setTalentData] = useState<WorkerTalentData>(() => {
    const saved = localStorage.getItem('walton_worker_talent_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_WORKER_TALENT;
      }
    }
    return DEFAULT_WORKER_TALENT;
  });

  const [talentModalOpen, setTalentModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<WorkerTalentData>(talentData);
  const [saveToast, setSaveToast] = useState(false);

  /**
   * handleOpenTalentModal
   * ---------------------
   * WHAT IT DOES:
   * Opens the talent editing dialog for authorized logged-in users only.
   * Unauthorized visitors are strictly barred.
   */
  const handleOpenTalentModal = () => {
    if (!isLoggedIn) {
      return;
    }
    setEditForm(talentData);
    setTalentModalOpen(true);
  };

  /**
   * handleSaveTalentData
   * --------------------
   * WHAT IT DOES:
   * Saves updated worker talent recognition details to local storage and updates component state.
   * Guarded by authorization check.
   *
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSaveTalentData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setTalentModalOpen(false);
      return;
    }
    setTalentData(editForm);
    localStorage.setItem('walton_worker_talent_data', JSON.stringify(editForm));
    setTalentModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  /**
   * handleResetTalentData
   * ---------------------
   * WHAT IT DOES:
   * Reverts worker talent recognition data to Walton default values.
   */
  const handleResetTalentData = () => {
    if (!isLoggedIn) {
      setTalentModalOpen(false);
      return;
    }
    setEditForm(DEFAULT_WORKER_TALENT);
    setTalentData(DEFAULT_WORKER_TALENT);
    localStorage.removeItem('walton_worker_talent_data');
    setTalentModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroBannerImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Departments according to the visual card structure in mockup
  const departmentCards = [
    {
      id: 'tqm',
      title: 'TQM',
      subtitle: 'Total Quality Management',
      page: 'dashboard' as PageId,
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=80',
      badgeText: 'TQM',
      badgeColor: 'bg-[#1b2f5d]/90 text-white',
    },
    {
      id: 'qa',
      title: 'QUALITY ASSURANCE',
      subtitle: 'Process Capability & DFM',
      page: 'kpi' as PageId,
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80',
      badgeText: 'QUALITY ASSURANCE',
      badgeColor: 'bg-[#163832]/90 text-[#a3e5c0]',
    },
    {
      id: 'qa-digital',
      title: 'QUALITY ASSURANCE',
      subtitle: 'Digital Verification & Standards',
      page: 'docs' as PageId,
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
      badgeText: 'PROCESS QUALITY',
      badgeColor: 'bg-[#0f2d59]/90 text-[#93c5fd]',
    },
    {
      id: 'qc',
      title: 'QUALITY CONTROL',
      subtitle: 'Inline SMT, AOI & Testing',
      page: 'pcba' as PageId,
      img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',
      badgeText: 'QUALITY CONTROL',
      badgeColor: 'bg-[#5c2411]/90 text-[#ffedd5]',
    },
    {
      id: 'research',
      title: 'AUDIT & RESEARCH',
      subtitle: 'Inspection, Cross-section & AI',
      page: 'research' as PageId,
      img: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=500&q=80',
      badgeText: 'INSPECTION & RESEARCH',
      badgeColor: 'bg-[#311c5c]/90 text-[#e9d5ff]',
    },
  ];

  const handleNav = (page: PageId) => {
    if (typeof onNavigateToPage === 'function') {
      onNavigateToPage(page);
    } else {
      onEnterDashboard();
    }
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#f4f6fb] text-[#0d1730] flex flex-col font-sans">
      {/* Top Header matching user mockup */}
      <header
        id="home-header"
        className="w-full bg-[#0d1730] py-2.5 sm:py-3.5 shadow-md border-b-[3px] border-[#e35b2a]"
      >
        <div className="w-[92%] max-w-[1500px] mx-auto px-2 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4.5">
            {/* QM Logo box - prominently sized for crystal-clear readability */}
            <div
              id="qm-logo-box"
              onClick={() => handleNav('home')}
              className="flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shrink-0"
              title="Walton Quality Management - Home"
            >
              <WaltonSealLogo className="w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] md:w-[122px] md:h-[122px] lg:w-[132px] lg:h-[132px] shrink-0 drop-shadow-xl" />
            </div>

            {/* Walton Quality Management text title - clean text without box shape */}
            <div
              id="walton-qm-title-box"
              onClick={() => handleNav('home')}
              className="cursor-pointer transition-opacity hover:opacity-90 py-1"
            >
              <h1 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight drop-shadow-xs">
                Walton Quality Management
              </h1>
              <p className="text-[#93c5fd] text-xs sm:text-sm md:text-base font-semibold mt-0.5 tracking-wide">
                PCB &amp; PCBA Manufacturing
              </p>
            </div>
          </div>

          {/* Right side: Navigation buttons (About, Product, Walton), Contact Us, and Login - text only with increased size */}
          <div id="home-header-actions" className="flex items-center flex-wrap gap-3 sm:gap-5 md:gap-7">
          {/* 1. About button with sub-menu */}
          <div
            className="relative"
            onMouseEnter={() => setAboutMenuOpen(true)}
            onMouseLeave={() => setAboutMenuOpen(false)}
          >
            <button
              id="btn-home-about"
              onClick={() => {
                setAboutTab('overview');
                setAboutOpen(true);
              }}
              className="text-sm sm:text-base md:text-lg font-bold text-white hover:text-[#93c5fd] transition-colors cursor-pointer py-1 flex items-center gap-1"
              title="About Walton PCB & PCBA Quality Management"
              aria-haspopup="true"
              aria-expanded={aboutMenuOpen}
            >
              <span>About</span>
              <ChevronDown
                className={`w-4 h-4 text-[#93c5fd] transition-transform duration-200 ${
                  aboutMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Sub-menu Dropdown */}
            {aboutMenuOpen && (
              <div
                id="about-sub-menu"
                className="absolute left-0 top-full pt-1.5 z-50 w-44 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="bg-[#0d1730] border border-[#2d4c8e] rounded-xl shadow-2xl p-1.5 space-y-0.5 backdrop-blur-md">
                  <button
                    id="btn-sub-menu-mission"
                    onClick={() => {
                      setAboutTab('mission');
                      setAboutOpen(true);
                      setAboutMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-[#1c356b] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Mission</span>
                    <Target className="w-3.5 h-3.5 text-[#e35b2a]" />
                  </button>

                  <button
                    id="btn-sub-menu-vission"
                    onClick={() => {
                      setAboutTab('vision');
                      setAboutOpen(true);
                      setAboutMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-[#1c356b] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Vission</span>
                    <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
                  </button>

                  <button
                    id="btn-sub-menu-overview"
                    onClick={() => {
                      setAboutTab('overview');
                      setAboutOpen(true);
                      setAboutMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-[#1c356b] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Overview</span>
                    <Layers className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  </button>

                  <button
                    id="btn-sub-menu-career"
                    onClick={() => {
                      setAboutTab('career');
                      setAboutOpen(true);
                      setAboutMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-[#1c356b] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Career</span>
                    <Briefcase className="w-3.5 h-3.5 text-[#f59e0b]" />
                  </button>

                  <button
                    id="btn-sub-menu-video"
                    onClick={() => {
                      setAboutTab('video');
                      setAboutOpen(true);
                      setAboutMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-[#1c356b] rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Video</span>
                    <PlayCircle className="w-3.5 h-3.5 text-[#f43f5e]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Product button */}
          <button
            id="btn-home-product"
            onClick={() => setProductOpen(true)}
            className="text-sm sm:text-base md:text-lg font-bold text-white hover:text-[#93c5fd] transition-colors cursor-pointer py-1"
            title="Walton PCB & PCBA Products"
          >
            Product
          </button>

          {/* 3. Walton (https://waltonbd.com/) link */}
          <a
            id="btn-home-walton"
            href="https://waltonbd.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Walton Official Website (https://waltonbd.com/)"
            className="text-sm sm:text-base md:text-lg font-bold text-white hover:text-[#93c5fd] transition-colors cursor-pointer py-1"
          >
            Walton
          </a>

          {/* Contact Us button */}
          <button
            id="btn-home-contact"
            onClick={() => setContactOpen(true)}
            className="text-sm sm:text-base md:text-lg font-bold text-white hover:text-[#93c5fd] transition-colors cursor-pointer py-1"
          >
            Contact Us
          </button>

          {/* Login button: positioned on the right side of Contact Us */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-home-login"
                onClick={onOpenLogin}
                className="text-sm sm:text-base md:text-lg font-bold text-white hover:text-[#93c5fd] transition-colors cursor-pointer py-1 flex items-center gap-1.5"
                title="QA User logged in. Click to switch account."
              >
                <span>Login</span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" title="Active session" />
              </button>
              <button
                id="btn-home-logout"
                onClick={onLogout}
                className="p-1.5 text-[#9fb0d6] hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                title="Sign out of Quality System"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-home-login"
              onClick={onOpenLogin}
              className="text-sm sm:text-base md:text-lg font-bold text-white hover:text-[#93c5fd] transition-colors cursor-pointer py-1"
            >
              Login
            </button>
          )}
          </div>
        </div>
      </header>

      {/* Main Page Content Body - Responsive 92% container, max-width 1500px */}
      <main className="flex-1 w-[92%] max-w-[1500px] mx-auto py-5 sm:py-6 space-y-6 sm:space-y-7 box-border">
        {/* 1. Hero Banner */}
        <div
          id="hero-meeting-banner"
          className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-[#cbd5e1] min-h-[300px] sm:min-h-[340px] lg:min-h-[380px] flex items-center justify-center bg-gradient-to-br from-[#0a1226] via-[#0e1d40] to-[#070d1c]"
        >
          {/* Subtle PCB Tech Grid Background & Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* High-tech Quality Optical Inspection Scanline */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.9)] animate-hero-scanline pointer-events-none z-10 opacity-70" />

          {/* Dark technical gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1226]/80 via-transparent to-transparent pointer-events-none" />

          {/* Center Heading Banner: "Quality Management" */}
          <div
            id="hero-qm-center-title"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center px-4 py-2 bg-transparent border-none shadow-none w-[95%] max-w-4xl flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -7, 0],
              }}
              transition={{
                opacity: { duration: 0.9, ease: 'easeOut' },
                scale: { duration: 0.9, ease: 'easeOut' },
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.9,
                },
              }}
              className="text-white font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-wider sm:tracking-widest leading-[0.92] drop-shadow-[0_6px_24px_rgba(0,0,0,0.95)]"
            >
              <span className="block">QUALITY</span>
              <span className="block mt-1 sm:mt-2">MANAGEMENT</span>
            </motion.div>
          </div>

          {/* Right Corner Text: "PCB & PCBA" */}
          <div
            id="hero-qm-badge"
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 bg-transparent border-none shadow-none pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.92 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: [1, 1.04, 1],
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.3, ease: 'easeOut' },
                x: { duration: 0.8, delay: 0.3, ease: 'easeOut' },
                scale: {
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                },
              }}
              className="text-[#2dd4bf] font-extrabold text-lg sm:text-2xl md:text-3xl uppercase tracking-widest drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)] text-right"
            >
              PCB &amp; PCBA
            </motion.div>
          </div>
        </div>

        {/* 2. "Our Departments" Section */}
        <section id="our-departments-section" className="w-full space-y-3 sm:space-y-3.5">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0d1730] tracking-tight">
            Our Departments
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5 w-full">
            {departmentCards.map((dept) => (
              <div
                key={dept.id}
                onClick={() => {
                  onSelectDepartment(dept.id);
                  handleNav(dept.page);
                }}
                className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-[#cbd5e1] cursor-pointer bg-white transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative h-28 sm:h-32 md:h-36 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={dept.img}
                    alt={dept.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Subtle Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Department Tag Overlay */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${dept.badgeColor} backdrop-blur-xs tracking-wider`}
                    >
                      {dept.badgeText}
                    </span>
                  </div>
                </div>

                {/* Subtitle / Focus footer */}
                <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                  <div className="text-xs sm:text-sm font-bold text-[#0d1730] truncate group-hover:text-[#e35b2a] transition-colors">
                    {dept.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#64748b] truncate mt-0.5">
                    {dept.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. KPI Stat Cards Section - Designed to match attached image style with floating white cards */}
        <section
          id="cyan-kpi-bar"
          onClick={() => setKpiAnimKey((k) => k + 1)}
          title="Click to replay counter animation"
          className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5 select-none cursor-pointer"
        >
          {/* Card 1: Total MP */}
          <div className="bg-white rounded-2xl sm:rounded-3xl py-7 sm:py-9 px-4 sm:px-5 shadow-[0_10px_28px_rgba(0,0,0,0.04)] border border-slate-100/90 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 group h-full">
            <div className="text-[#00a884] group-hover:scale-110 transition-transform duration-200">
              <Users className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.3]" />
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#00a884] tracking-tight mt-3 sm:mt-4 mb-1">
              <AnimatedCounter key={`mp-${kpiAnimKey}`} target={612} delay={40} duration={1400} />+
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#5a6b82]">
              Total MP
            </span>
          </div>

          {/* Card 2: Male */}
          <div className="bg-white rounded-2xl sm:rounded-3xl py-7 sm:py-9 px-4 sm:px-5 shadow-[0_10px_28px_rgba(0,0,0,0.04)] border border-slate-100/90 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 group h-full">
            <div className="text-[#e54b4b] group-hover:scale-110 transition-transform duration-200">
              <User className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.3]" />
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#e54b4b] tracking-tight mt-3 sm:mt-4 mb-1">
              <AnimatedCounter key={`male-${kpiAnimKey}`} target={402} delay={100} duration={1400} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#5a6b82]">
              Male
            </span>
          </div>

          {/* Card 3: FeMale */}
          <div className="bg-white rounded-2xl sm:rounded-3xl py-7 sm:py-9 px-4 sm:px-5 shadow-[0_10px_28px_rgba(0,0,0,0.04)] border border-slate-100/90 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 group h-full">
            <div className="text-[#00a884] group-hover:scale-110 transition-transform duration-200">
              <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.3]" />
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#00a884] tracking-tight mt-3 sm:mt-4 mb-1">
              <AnimatedCounter key={`female-${kpiAnimKey}`} target={210} delay={160} duration={1400} />+
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#5a6b82]">
              FeMale
            </span>
          </div>

          {/* Card 4: Total Report */}
          <div className="bg-white rounded-2xl sm:rounded-3xl py-7 sm:py-9 px-4 sm:px-5 shadow-[0_10px_28px_rgba(0,0,0,0.04)] border border-slate-100/90 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 group h-full">
            <div className="text-[#00a884] group-hover:scale-110 transition-transform duration-200">
              <ClipboardCheck className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.3]" />
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#00a884] tracking-tight mt-3 sm:mt-4 mb-1">
              <AnimatedCounter key={`report-${kpiAnimKey}`} target={146} delay={220} duration={1400} />+
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#5a6b82]">
              Total Report
            </span>
          </div>

          {/* Card 5: Total SOP */}
          <div className="bg-white rounded-2xl sm:rounded-3xl py-7 sm:py-9 px-4 sm:px-5 shadow-[0_10px_28px_rgba(0,0,0,0.04)] border border-slate-100/90 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 group col-span-2 sm:col-span-1 lg:col-span-1 h-full">
            <div className="text-[#0284c7] group-hover:scale-110 transition-transform duration-200">
              <BookOpenCheck className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.3]" />
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#0284c7] tracking-tight mt-3 sm:mt-4 mb-1">
              <AnimatedCounter key={`sop-${kpiAnimKey}`} target={58} delay={280} duration={1400} />+
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#5a6b82]">
              Total SOP
            </span>
          </div>
        </section>

        {/* 4. Worker Talent of the Month-Jul'26 */}
        <section
          id="worker-talent-section"
          className="bg-white rounded-2xl border border-[#cbd5e1] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 relative group"
        >
          {/* Top-Right Entry Button - Rendered ONLY for authorized logged-in users */}
          {isLoggedIn && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                id="btn-worker-talent-entry"
                type="button"
                onClick={handleOpenTalentModal}
                className="px-3 py-1.5 bg-[#1c356b] hover:bg-[#28498f] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-[#2d4c8e]"
                title="Enter or update Worker Talent records"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#93c5fd]" />
                <span>Entry</span>
              </button>
            </div>
          )}

          {/* Left: Photos Container */}
          <div className="flex items-center gap-3 shrink-0 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
            {/* Photo 1: Team award */}
            <div className="w-36 h-24 sm:w-44 sm:h-28 rounded-lg overflow-hidden border border-[#cbd5e1] shadow-xs relative">
              <img
                src={talentData.photo1Url}
                alt="Quality Inspection Team Receiving Certificate"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                {talentData.photo1Label || 'Line 03 SMT'}
              </div>
            </div>

            {/* Photo 2: Executive award handover */}
            <div className="w-36 h-24 sm:w-44 sm:h-28 rounded-lg overflow-hidden border border-[#cbd5e1] shadow-xs relative">
              <img
                src={talentData.photo2Url}
                alt="Executive Award Presentation Gala"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                {talentData.photo2Label || 'QM Excellence'}
              </div>
            </div>
          </div>

          {/* Right: Worker Talent Details */}
          <div className="flex-1 text-center md:text-left space-y-2 pr-0 md:pr-24">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                <Award className="w-4 h-4" />
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0d1730] tracking-tight">
                {talentData.title}
              </h3>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed max-w-xl">
              {talentData.description}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
              {talentData.awardees.map((awardee, idx) => {
                const colorStyles = [
                  'bg-[#e0f2fe] text-[#0369a1]',
                  'bg-[#fef3c7] text-[#92400e]',
                  'bg-[#dcfce7] text-[#15803d] font-mono',
                  'bg-[#f3e8ff] text-[#7e22ce]',
                  'bg-[#ffe4e6] text-[#be123c]',
                ];
                return (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      colorStyles[idx % colorStyles.length]
                    }`}
                  >
                    {awardee}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Navigation Row: Dashboard, Leaders, PCB, PCBA, Research */}
        <section
          id="home-nav-box"
          className="w-full bg-white rounded-2xl border border-[#cbd5e1] p-4 sm:p-5 shadow-sm"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5 w-full">
            <button
              id="btn-nav-dashboard"
              onClick={() => handleNav('dashboard')}
              className="py-3 px-4 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
            >
              Dashboard
            </button>

            <button
              id="btn-nav-leaders"
              onClick={() => handleNav('leaders')}
              className="py-3 px-4 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
            >
              Leaders
            </button>

            <button
              id="btn-nav-pcb"
              onClick={() => handleNav('pcb-process')}
              className="py-3 px-4 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
            >
              PCB
            </button>

            <button
              id="btn-nav-pcba"
              onClick={() => handleNav('pcba-process')}
              className="py-3 px-4 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
            >
              PCBA
            </button>

            <button
              id="btn-nav-research"
              onClick={() => handleNav('research')}
              className="py-3 px-4 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center col-span-2 sm:col-span-1 lg:col-span-1"
            >
              Research
            </button>
          </div>
        </section>

        {/* 6. Footer Area Box */}
        <section
          id="home-footer-area-box"
          className="w-full bg-white rounded-2xl border border-[#cbd5e1] p-6 sm:p-8 shadow-sm"
        >
          <div
            id="footer-area-block"
            className="bg-[#1c356b] text-white p-6 sm:p-8 rounded-xl shadow-md border border-[#2d4c8e]"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10 text-center md:text-left">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center md:justify-start gap-3.5 sm:gap-4.5">
                  <div
                    id="footer-qm-logo-box"
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 shrink-0 flex items-center justify-center filter drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleNav('home')}
                    title="Walton Quality Management - Home"
                  >
                    <WaltonSealLogo className="w-full h-full object-contain select-none" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-xl tracking-tight text-white">
                      Walton Quality Management Division
                    </h3>
                    <p className="text-xs text-[#93c5fd] font-medium mt-0.5">
                      Walton Hi-Tech Industries PLC · PCB &amp; PCBA Quality Governance &amp; Manufacturing Reliability
                    </p>
                    <p className="text-[11px] text-[#cbd5e1] mt-0.5">
                      Chandra, Kaliakair, Gazipur - 1751, Bangladesh · IPC-A-610 Class 3 &amp; ISO 9001:2015 Standards
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3.5">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setContactOpen(true)}
                    className="px-4 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Contact Quality Line
                  </button>
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Open QMS Portal
                  </button>
                </div>

                {/* Social Media Channels matching uploaded reference image */}
                <div
                  id="footer-social-media-channels"
                  className="flex items-center gap-2.5 pt-0.5"
                  aria-label="Walton Social Media Channels"
                >
                  <a
                    id="footer-social-facebook"
                    href="https://www.facebook.com/waltonbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    aria-label="Facebook"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#93c5fd] text-[#0d1730] flex items-center justify-center hover:scale-110 hover:bg-white transition-all shadow-xs"
                  >
                    <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#0d1730] stroke-none" />
                  </a>
                  <a
                    id="footer-social-youtube"
                    href="https://www.youtube.com/@WaltonBD"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                    aria-label="YouTube"
                    className="w-8 h-6 sm:w-9 sm:h-7 rounded-lg bg-[#93c5fd] text-[#0d1730] flex items-center justify-center hover:scale-110 hover:bg-white transition-all shadow-xs"
                  >
                    <Youtube className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#0d1730] text-[#93c5fd]" />
                  </a>
                  <a
                    id="footer-social-linkedin"
                    href="https://www.linkedin.com/company/waltonbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    aria-label="LinkedIn"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#93c5fd] text-[#0d1730] flex items-center justify-center hover:scale-110 hover:bg-white transition-all shadow-xs"
                  >
                    <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#0d1730] stroke-none" />
                  </a>
                  <a
                    id="footer-social-instagram"
                    href="https://www.instagram.com/waltonbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    aria-label="Instagram"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-[#93c5fd] text-[#93c5fd] flex items-center justify-center hover:scale-110 hover:border-white hover:text-white transition-all shadow-xs"
                  >
                    <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </a>
                  <a
                    id="footer-social-x"
                    href="https://x.com/waltonbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="X (Twitter)"
                    aria-label="X"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#93c5fd] text-[#0d1730] flex items-center justify-center hover:scale-110 hover:bg-white transition-all shadow-xs"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.8]" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#93c5fd] text-center sm:text-left">
              <div>
                © {new Date().getFullYear()} Walton Hi-Tech Industries PLC. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <span>Helpline: +880 1678-860873</span>
                <span>•</span>
                <span>qm.pcba26@gmail.com</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

      {/* About Modal */}
      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        initialTab={aboutTab}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={productOpen}
        onClose={() => setProductOpen(false)}
        onNavigate={handleNav}
      />

      {/* Worker Talent of the Month Entry / Update Modal - Accessible ONLY to authorized logged-in users */}
      {isLoggedIn && talentModalOpen && (
        <div
          id="modal-worker-talent-entry-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTalentModalOpen(false);
          }}
        >
          <div
            id="modal-worker-talent-entry"
            className="bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] w-full max-w-xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="bg-[#0d1730] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#e35b2a]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-white">
                    Worker Talent Entry &amp; Recognition Portal
                  </h3>
                  <p className="text-[11px] text-[#93c5fd]">
                    PCB &amp; PCBA monthly awardee configuration
                  </p>
                </div>
              </div>
              <button
                id="btn-close-talent-modal"
                type="button"
                onClick={() => setTalentModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTalentData} className="p-5 overflow-y-auto space-y-4 flex-1 text-sm text-[#0d1730]">
              {/* Month / Recognition Title */}
              <div>
                <label className="block text-xs font-bold text-[#1e293b] mb-1">
                  Section Title / Honor Month *
                </label>
                <input
                  id="talent-input-title"
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Worker Talent of the Month-Jul'26"
                  className="w-full px-3 py-2 text-sm border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c356b] focus:border-transparent font-semibold"
                />
              </div>

              {/* Description / Recognition citation */}
              <div>
                <label className="block text-xs font-bold text-[#1e293b] mb-1">
                  Citation / Recognition Description *
                </label>
                <textarea
                  id="talent-input-description"
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter accomplishment description, zero-defect records, or adherence notes..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c356b] focus:border-transparent leading-relaxed"
                />
              </div>

              {/* Awardees & Badges */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1e293b]">
                    Recognized Workers &amp; Metric Badges
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        awardees: [...editForm.awardees, 'New QA Specialist (Line QA)'],
                      })
                    }
                    className="text-xs font-bold text-[#1c356b] hover:text-[#2563eb] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Badge</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {editForm.awardees.map((awardee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={awardee}
                        onChange={(e) => {
                          const updated = [...editForm.awardees];
                          updated[index] = e.target.value;
                          setEditForm({ ...editForm, awardees: updated });
                        }}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-[#cbd5e1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1c356b]"
                        placeholder="e.g. Employee Name (Role/Line) or 99.8% FPY"
                      />
                      {editForm.awardees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editForm.awardees.filter((_, i) => i !== index);
                            setEditForm({ ...editForm, awardees: updated });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Remove badge"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos & Labels Configuration */}
              <div className="border-t border-[#e2e8f0] pt-3.5">
                <h4 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#1c356b]" />
                  <span>Display Photo 1 &amp; Photo 2</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo 1 */}
                  <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
                      <span>Photo 1 (Team/Inspection)</span>
                      <span className="text-[10px] text-slate-400 font-normal">URL &amp; Label</span>
                    </div>
                    <input
                      type="text"
                      value={editForm.photo1Url}
                      onChange={(e) => setEditForm({ ...editForm, photo1Url: e.target.value })}
                      placeholder="Photo 1 Image URL"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1c356b]"
                    />
                    <input
                      type="text"
                      value={editForm.photo1Label}
                      onChange={(e) => setEditForm({ ...editForm, photo1Label: e.target.value })}
                      placeholder="Badge label e.g. Line 03 SMT"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1c356b]"
                    />
                    <div className="h-16 w-full rounded-md overflow-hidden bg-slate-200 relative border border-slate-300">
                      <img
                        src={editForm.photo1Url}
                        alt="Preview 1"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_WORKER_TALENT.photo1Url;
                        }}
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.2 rounded">
                        {editForm.photo1Label || 'Label'}
                      </span>
                    </div>
                  </div>

                  {/* Photo 2 */}
                  <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
                      <span>Photo 2 (Award Gala)</span>
                      <span className="text-[10px] text-slate-400 font-normal">URL &amp; Label</span>
                    </div>
                    <input
                      type="text"
                      value={editForm.photo2Url}
                      onChange={(e) => setEditForm({ ...editForm, photo2Url: e.target.value })}
                      placeholder="Photo 2 Image URL"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1c356b]"
                    />
                    <input
                      type="text"
                      value={editForm.photo2Label}
                      onChange={(e) => setEditForm({ ...editForm, photo2Label: e.target.value })}
                      placeholder="Badge label e.g. QM Excellence"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1c356b]"
                    />
                    <div className="h-16 w-full rounded-md overflow-hidden bg-slate-200 relative border border-slate-300">
                      <img
                        src={editForm.photo2Url}
                        alt="Preview 2"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_WORKER_TALENT.photo2Url;
                        }}
                      />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.2 rounded">
                        {editForm.photo2Label || 'Label'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#e2e8f0] pt-3.5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetTalentData}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset to factory default values"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTalentModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-worker-talent"
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#1c356b] hover:bg-[#152a55] rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#2dd4bf]" />
                    <span>Save &amp; Update Section</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Save Confirmation Toast */}
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0d1730] text-white px-4 py-3 rounded-xl shadow-xl border-l-4 border-[#2dd4bf] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-1 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf]">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Worker Talent Section Updated!</div>
            <div className="text-[11px] text-[#93c5fd]">
              Recognition records saved &amp; refreshed on the Home page.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
