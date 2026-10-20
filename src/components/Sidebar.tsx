/**
 * =========================================================================================
 * @file src/components/Sidebar.tsx
 * @component Sidebar
 * @description Role-Restricted Administrative Navigation Sidebar for Walton QMS
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Provides persistent, structured navigation across all Walton Quality Management modules:
 * - OVERVIEW: Return Home, Main Executive Quality Dashboard
 * - PCB & PCBA OPERATIONS: PCB Fabrication, PCBA Assembly, Process Flowcharts
 * - DEFECT RECORD PORTALS: SMT Daily QM, MI Daily QM, AOI/SPI Data Portals
 * - QUALITY GOVERNANCE: Non-Conformance (NCR), Corrective Actions (CAPA), Customer RMA
 * - ENGINEERING & RESEARCH: Six Sigma Research, Talent Development, Task Management
 *
 * ACCESS CONTROL RULE:
 * --------------------
 * Per system access control directives, this sidebar is rendered ONLY when an authorized
 * administrator is logged in (`isLoggedIn === true`). Visitors accessing the dashboard directly
 * do not have access to this sidebar.
 *
 * PARAMETERS / PROPS (SidebarProps):
 * ----------------------------------
 * @param {PageId} currentPage - The currently active page identifier (for highlighting active tab).
 * @param {(page: PageId) => void} [onNavigate] - Callback invoked when a navigation tab is clicked.
 * @param {(page: PageId) => void} [onSelectPage] - Alternative callback alias for page selection.
 * @param {boolean} [isOpen] - Controls whether sidebar drawer is open (mobile drawer mode).
 * @param {boolean} [collapsed] - Controls whether sidebar is collapsed into mini-icon mode.
 * @param {() => void} [onCloseMobile] - Dismisses the sidebar overlay on mobile screens.
 * @param {number} [openNcrCount] - Number of open NCRs to show in the notification badge.
 * @param {number} [openNcCount] - Alternative count alias for open NCRs.
 * @param {number} [openCapaCount] - Number of open CAPAs to show in the notification badge.
 */

import React, { useState, useRef } from 'react';
import { PageId, UserProfile } from '../types';
import {
  Home,
  LayoutDashboard,
  Cpu,
  Layers,
  BarChart3,
  AlertOctagon,
  CheckCircle,
  MessageSquareWarning,
  TrendingUp,
  ClipboardList,
  FileText,
  Users,
  Settings,
  X,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Workflow,
  ShieldCheck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WaltonSealLogo } from './WaltonSealLogo';

interface SidebarProps {
  currentPage: PageId;
  onNavigate?: (page: PageId) => void;
  onSelectPage?: (page: PageId) => void;
  isOpen?: boolean;
  collapsed?: boolean;
  onOpenSidebar?: () => void;
  onCloseMobile?: () => void;
  pendingTaskCount?: number;
  openNcrCount?: number;
  openNcCount?: number;
  openCapaCount?: number;
  userProfile?: UserProfile | null;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: number | string;
  badgeColor?: string;
  adminOnly?: boolean;
  subItems?: Array<{
    id: PageId;
    label: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onSelectPage,
  isOpen = false,
  collapsed = true,
  onOpenSidebar,
  onCloseMobile = () => {},
  pendingTaskCount = 5,
  openNcrCount,
  openNcCount,
  openCapaCount = 5,
  userProfile,
}) => {
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  const isMenuOpen = isSidebarHovered || (isOpen && !collapsed);
  const ncrBadge = openNcrCount ?? openNcCount ?? 4;
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => ({
    iqc: currentPage === 'iqc' || currentPage === 'iqc-pcb' || currentPage === 'iqc-pcba',
    esd: currentPage === 'esd' || currentPage === 'esd-database' || currentPage === 'esd-entry',
    team: currentPage === 'team' || currentPage === 'team-database' || currentPage === 'team-entry',
  }));

  const sidebarCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSidebarMouseEnter = () => {
    if (sidebarCloseTimeoutRef.current) {
      clearTimeout(sidebarCloseTimeoutRef.current);
      sidebarCloseTimeoutRef.current = null;
    }
    setIsSidebarHovered(true);
    if (typeof onOpenSidebar === 'function') {
      onOpenSidebar();
    }
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarCloseTimeoutRef.current) {
      clearTimeout(sidebarCloseTimeoutRef.current);
    }
    sidebarCloseTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
      if (typeof onCloseMobile === 'function') {
        onCloseMobile();
      }
    }, 100);
  };

  /**
   * handleNavClick
   * --------------
   * WHAT IT DOES:
   * Triggers navigation to the chosen page ID.
   */
  const handleNavClick = (pageId: PageId) => {
    if (typeof onNavigate === 'function') {
      onNavigate(pageId);
    } else if (typeof onSelectPage === 'function') {
      onSelectPage(pageId);
    }
  };

  const isAdminUser =
    userProfile?.uid === 'q7aDnafVuBSYc8B0VipuXPOlenv1' ||
    userProfile?.role === 'admin' ||
    userProfile?.role === 'QM_ADMIN';

  const navItems: NavItem[] = [
    {
      id: 'dashboard' as PageId,
      label: isAdminUser ? 'Admin Dashboard' : 'Dashboard',
      icon: isAdminUser ? ShieldCheck : LayoutDashboard,
      description: isAdminUser
        ? 'Admin console: Firestore users, creation dates & uploaded file inspector'
        : 'Real-time PCB & PCBA quality metrics and PPM analytics',
      badge: isAdminUser ? 'Admin' : undefined,
      badgeColor: isAdminUser ? 'bg-rose-600' : undefined,
    },
    {
      id: 'pcb' as PageId,
      label: 'PCB',
      icon: Cpu,
      description: 'Bare board AOI, impedance test & chemical microsections',
    },
    {
      id: 'pcba' as PageId,
      label: 'PCBA',
      icon: Layers,
      description: 'Inline SMT, SPI, AOI, X-Ray & final functional screening',
    },
    {
      id: 'iqc' as PageId,
      label: 'IQC',
      icon: ClipboardCheck,
      description: 'Incoming Quality Control dashboard and inspection reports for PCB & PCBA',
      subItems: [
        {
          id: 'iqc-pcb' as PageId,
          label: 'PCB IQC',
          icon: Cpu,
          description: 'Copper thickness, solder mask & solderability audit',
        },
        {
          id: 'iqc-pcba' as PageId,
          label: 'PCBA IQC',
          icon: Layers,
          description: 'SMD active & passive components incoming inspection',
        },
      ],
    },
    {
      id: 'esd' as PageId,
      label: 'ESD',
      icon: Zap,
      description: 'SMT ESD Monthly Log: work surface, iron, ionizer, wristband, shoe, apron',
      subItems: [
        {
          id: 'esd-database' as PageId,
          label: 'ESD Data Database',
          icon: BarChart3,
          description: 'ESD audit analytics, KPI scorecards & historical inspection database',
        },
        {
          id: 'esd-entry' as PageId,
          label: 'ESD Data Entry',
          icon: ClipboardList,
          description: 'Daily/Monthly ESD QC report entry & 11-section calibration log',
        },
      ],
    },
    {
      id: 'manpower' as PageId,
      label: 'Manpower List',
      icon: Users,
      description: 'Quality Management personnel directory: SMT, MI & PCB inspector rosters',
      badge: '31',
      badgeColor: 'bg-[#2563eb]',
    },
    {
      id: 'tasks' as PageId,
      label: 'Task Manager',
      icon: ClipboardList,
      description: 'Quality engineering tickets, action items & assignments',
      badge: pendingTaskCount,
      badgeColor: 'bg-[#6366f1]',
    },
    {
      id: 'kpi' as PageId,
      label: 'KPI',
      icon: BarChart3,
      description: 'Defect parts per million (DPPM), FPY yield & target trends',
    },
    {
      id: 'nc' as PageId,
      label: 'Non Conformance',
      icon: AlertOctagon,
      description: 'Production non-conformance reports (NCR) and disposition',
      badge: ncrBadge,
      badgeColor: 'bg-[#d64545]',
    },
    {
      id: 'capa' as PageId,
      label: 'CAPA',
      icon: CheckCircle,
      description: 'Corrective & Preventive Action 8D lifecycle workflows',
      badge: openCapaCount,
      badgeColor: 'bg-[#e8a13a]',
    },
    {
      id: 'rca' as PageId,
      label: 'RCA',
      icon: Workflow,
      description: 'Root Cause Analysis, Ishikawa fishbone & 5-Why trees',
    },
    {
      id: 'complaints' as PageId,
      label: 'Customer Complaints',
      icon: MessageSquareWarning,
      description: 'Customer claims, warranty returns RMA & resolution logs',
    },
    {
      id: 'quality-dev' as PageId,
      label: 'Quality Development',
      icon: TrendingUp,
      description: 'Continuous improvement initiatives, Kaizen & 5S audits',
    },
    {
      id: 'docs' as PageId,
      label: 'Documents & SOP',
      icon: FileText,
      description: 'Controlled engineering drawings, work instructions & ISO specs',
    },
    {
      id: 'team' as PageId,
      label: 'Team & Training',
      icon: Users,
      description: 'Inspector certifications, shift rosters & skills matrix',
      subItems: [
        {
          id: 'team-database' as PageId,
          label: 'Training Database',
          icon: BarChart3,
          description: 'Training analytics dashboard, KPI scorecards & database records',
        },
        {
          id: 'team-entry' as PageId,
          label: 'Training Entry',
          icon: ClipboardList,
          description: 'Training attendance log & session data entry spreadsheet',
        },
      ],
    },
    {
      id: 'users' as PageId,
      label: 'User Management',
      icon: ShieldCheck,
      description: 'Walton employee accounts, authentication & access roles',
      adminOnly: true,
      badge: userProfile?.role === 'admin' ? 'Admin' : 'Admin Only',
      badgeColor: userProfile?.role === 'admin' ? 'bg-amber-600' : 'bg-slate-700',
    },
    {
      id: 'settings' as PageId,
      label: 'Setting',
      icon: Settings,
      description: 'System configurations, alert thresholds & permissions',
    },
  ];

  return (
    <>
      {/* Sidebar container: auto-opens when cursor touches it and auto-closes when cursor leaves */}
      <aside
        id="app-sidebar"
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`relative z-30 h-full max-h-full shrink-0 bg-[#0d1730] text-[#cfd8ee] flex flex-col border-r border-[#1f2f55] transition-all duration-300 ease-in-out select-none ${
          isMenuOpen
            ? 'w-[250px] sm:w-[260px] shadow-2xl lg:shadow-none'
            : 'w-[68px]'
        }`}
      >
        {/* Top Header Section inside Sidebar */}
        {isMenuOpen ? (
          /* Full Header with Official Walton Quality Management Seal Logo */
          <div className="h-16 px-3.5 flex items-center justify-between border-b border-[#1c2c54] bg-[#091226] shrink-0">
            <div
              className="flex items-center gap-3 cursor-pointer group min-w-0"
              onClick={() => handleNavClick('home')}
              title="Walton Quality Management - Home"
            >
              <div className="w-[42px] h-[42px] shrink-0 flex items-center justify-center filter drop-shadow-md group-hover:scale-105 transition-transform">
                <WaltonSealLogo className="w-full h-full object-contain select-none" animated={false} />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[15px] font-extrabold tracking-wide text-white group-hover:text-blue-200 transition-colors">
                  Walton
                </span>
                <span className="text-[10px] text-[#9db0cc] font-medium leading-tight group-hover:text-[#b8c2e6] transition-colors truncate">
                  Quality Management PCB &amp; PCBA
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsSidebarHovered(false);
                onCloseMobile();
              }}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182a52] transition-colors shrink-0"
              aria-label="Close navigation sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Collapsed Icon-Only Header */
          <div className="h-16 flex items-center justify-center border-b border-[#1c2c54] bg-[#091226] shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              title="Walton Quality Management"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-0.5 border border-white/20 shadow-xs cursor-pointer hover:bg-white/20 transition-all hover:scale-105"
            >
              <WaltonSealLogo className="w-full h-full object-contain select-none" animated={false} />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {isMenuOpen ? (
            /* ========================================================================= */
            /* 1. EXPANDED / FULL LOOKING SIDEBAR                                        */
            /* ========================================================================= */
            <nav className="px-2.5 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubActive = hasSubItems && item.subItems?.some((sub) => sub.id === currentPage);
                const isActive = currentPage === item.id;
                const isMenuExpanded = Boolean(expandedMenus[item.id]);

                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      id={`nav-${item.id}`}
                      onClick={() => {
                        if (hasSubItems) {
                          const nextExpanded = !isMenuExpanded;
                          setExpandedMenus((prev) => ({
                            ...prev,
                            [item.id]: nextExpanded,
                          }));
                          if (nextExpanded || (!isActive && !isSubActive)) {
                            handleNavClick(item.id);
                          }
                        } else {
                          handleNavClick(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer group ${
                        isActive
                          ? 'bg-[#182c57] text-white shadow-xs font-semibold ring-1 ring-[#e35b2a]/40 border-l-[3px] border-[#e35b2a]'
                          : isSubActive
                          ? 'bg-[#182a52] text-white'
                          : 'text-[#cbd5e1] hover:bg-[#152345] hover:text-white'
                      }`}
                    >
                      {/* Left: Icon and Label */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive
                              ? 'text-[#e35b2a]'
                              : isSubActive
                              ? 'text-white'
                              : 'text-[#8898bf] group-hover:text-white'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {/* Right: Badge and Right Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge !== undefined && (typeof item.badge === 'string' ? item.badge.length > 0 : item.badge > 0) && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full text-white font-bold ${
                              isActive ? 'bg-[#e35b2a]' : item.badgeColor || 'bg-[#2f9bea]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {hasSubItems ? (
                          <ChevronDown
                            className={`w-4 h-4 text-[#7383a8] group-hover:text-white transition-transform duration-200 ${
                              isMenuExpanded ? 'rotate-180 text-white' : ''
                            }`}
                          />
                        ) : (
                          <ChevronRight
                            className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                              isActive
                                ? 'text-white'
                                : 'text-[#65769f] group-hover:text-white'
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    {/* Render Subsections if expanded */}
                    <AnimatePresence>
                      {hasSubItems && isMenuExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-5 pl-2.5 border-l border-[#22376b] space-y-0.5 my-1"
                        >
                          {item.subItems?.map((sub) => {
                            const SubIcon = sub.icon;
                            const isItemSubActive =
                              currentPage === sub.id ||
                              (item.id === 'team' && currentPage === 'team' && sub.id === 'team-database') ||
                              (item.id === 'esd' && currentPage === 'esd' && sub.id === 'esd-database');
                            return (
                              <button
                                key={sub.id}
                                id={`nav-${sub.id}`}
                                onClick={() => handleNavClick(sub.id)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                                  isItemSubActive
                                    ? 'bg-[#e35b2a] text-white shadow-xs font-bold'
                                    : 'text-[#9fb0d6] hover:bg-[#182a52] hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {SubIcon && <SubIcon className="w-3.5 h-3.5 shrink-0" />}
                                  <span className="truncate">{sub.label}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          ) : (
            /* ========================================================================= */
            /* 2. COLLAPSED ICON-ONLY SIDEBAR                                            */
            /* ========================================================================= */
            <nav className="flex flex-col items-center space-y-1.5 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubActive = hasSubItems && item.subItems?.some((sub) => sub.id === currentPage);
                const isActive = currentPage === item.id;

                return (
                  <div key={item.id} className="relative">
                    <button
                      id={`nav-${item.id}`}
                      onClick={() => {
                        if (hasSubItems) {
                          setExpandedMenus((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }));
                        }
                        handleNavClick(item.id);
                      }}
                      className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#182c57] text-white shadow-sm ring-1 ring-[#e35b2a] border-l-2 border-[#e35b2a]'
                          : isSubActive
                          ? 'bg-[#182a52] text-white'
                          : 'text-[#8fa1c7] hover:bg-[#152345] hover:text-white'
                      }`}
                      aria-label={item.label}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isActive ? 'text-[#e35b2a]' : 'text-[#8fa1c7]'
                        }`}
                      />

                      {/* Mini indicator dot if item has badge notifications */}
                      {item.badge !== undefined && (typeof item.badge === 'string' ? item.badge.length > 0 : item.badge > 0) && (
                        <span
                          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                            item.badgeColor || 'bg-[#d64545]'
                          } ring-2 ring-[#0d1730]`}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>
          )}
        </div>

        {/* Footer / Home button section */}
        {isMenuOpen ? (
          <div className="p-3 border-t border-[#1c2c54] bg-[#091226]/80 space-y-2 shrink-0">
            <button
              id="nav-back-to-home"
              onClick={() => handleNavClick('home')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#8898bf] hover:text-white hover:bg-[#182a52] transition-colors border border-[#1e335f] cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home Page</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-[#6d7c9f] px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#28ad6b] animate-pulse" />
                <span>Lines 1-8 Live</span>
              </div>
              <span className="font-mono text-[10px] text-[#556383]">v2.6.4</span>
            </div>
          </div>
        ) : (
          <div className="py-3 border-t border-[#1c2c54] bg-[#091226]/80 flex flex-col items-center space-y-2 shrink-0">
            <button
              id="nav-back-to-home-collapsed"
              onClick={() => handleNavClick('home')}
              title="Return to Home Page"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8898bf] hover:text-white hover:bg-[#182a52] transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </button>
            <span className="w-2 h-2 rounded-full bg-[#28ad6b] animate-pulse" title="System Online" />
          </div>
        )}
      </aside>
    </>
  );
};
