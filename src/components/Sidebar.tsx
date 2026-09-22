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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WALTON_EMBLEM_LEFT_PATH,
  WALTON_EMBLEM_RIGHT_PATH,
  WALTON_EMBLEM_RED_PATH,
  WALTON_WORDMARK_PATH,
} from './waltonLogoPaths';
import { WaltonSealLogo } from './WaltonSealLogo';

interface SidebarProps {
  currentPage: PageId;
  onNavigate?: (page: PageId) => void;
  onSelectPage?: (page: PageId) => void;
  isOpen?: boolean;
  collapsed?: boolean;
  onCloseMobile?: () => void;
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
  badge?: number;
  badgeColor?: string;
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
  isOpen = true,
  collapsed = false,
  onCloseMobile = () => {},
  openNcrCount,
  openNcCount,
  openCapaCount = 5,
}) => {
  const isMenuOpen = isOpen && !collapsed;
  const ncrBadge = openNcrCount ?? openNcCount ?? 3;
  const [iqcExpanded, setIqcExpanded] = useState<boolean>(false);

  // State for Animated Popup flyout in collapsed mode
  const [hoveredPopup, setHoveredPopup] = useState<{
    item: NavItem;
    top: number;
    arrowOffset: number;
  } | null>(null);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterItem = (item: NavItem, e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMenuOpen) return; // Only show floating popup in collapsed icon mode
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const safeTop = Math.min(Math.max(12, rect.top - 16), window.innerHeight - 270);
    const arrowOffset = Math.max(16, Math.min(rect.top + rect.height / 2 - safeTop, 240));

    setHoveredPopup({
      item,
      top: safeTop,
      arrowOffset,
    });
  };

  const handleMouseLeaveItem = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredPopup(null);
    }, 140);
  };

  const handleMouseEnterPopup = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeavePopup = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredPopup(null);
    }, 140);
  };

  /**
   * handleNavClick
   * --------------
   * WHAT IT DOES:
   * Triggers navigation to the chosen page ID, closes flyout, and collapses mobile drawer.
   */
  const handleNavClick = (pageId: PageId) => {
    setHoveredPopup(null);
    if (typeof onNavigate === 'function') {
      onNavigate(pageId);
    } else if (typeof onSelectPage === 'function') {
      onSelectPage(pageId);
    }
    if (typeof onCloseMobile === 'function') {
      onCloseMobile();
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard' as PageId,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Real-time PCB & PCBA quality metrics and PPM analytics',
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
      description: 'Incoming Quality Control inspection for raw PCBs and electronic components',
      subItems: [
        {
          id: 'iqc-pcb' as PageId,
          label: '1. PCB Bare Board IQC',
          icon: Cpu,
          description: 'Copper thickness, solder mask & solderability audit',
        },
        {
          id: 'iqc-pcba' as PageId,
          label: '2. PCBA Component IQC',
          icon: Layers,
          description: 'SMD active & passive components incoming inspection',
        },
      ],
    },
    {
      id: 'tasks' as PageId,
      label: 'Task Manager',
      icon: ClipboardList,
      description: 'Quality engineering tickets, action items & assignments',
      badge: 4,
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
    },
    {
      id: 'users' as PageId,
      label: 'User Management',
      icon: ShieldCheck,
      description: 'Walton employee accounts, authentication & access roles',
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
      {/* Mobile backdrop overlay */}
      {isMenuOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-[86px] sm:top-[90px] bottom-0 left-0 z-40 lg:relative lg:top-0 lg:bottom-0 lg:z-30 h-full max-h-full shrink-0 bg-[#0d1730] text-[#cfd8ee] flex flex-col border-r border-[#1f2f55] transition-all duration-300 ease-in-out select-none ${
          isMenuOpen
            ? 'w-[250px] sm:w-[260px] translate-x-0 shadow-2xl lg:shadow-none'
            : '-translate-x-full lg:translate-x-0 lg:w-[68px]'
        }`}
      >
        {/* Top Header Section inside Sidebar */}
        {isMenuOpen ? (
          /* Full Header with Official Walton Logo (matching Image 2) */
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#1c2c54] bg-[#091226] shrink-0">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleNavClick('home')}
              title="Walton Quality Management - Home"
            >
              <svg
                viewBox="130 170 240 160"
                className="h-9 w-auto text-white drop-shadow-sm group-hover:scale-105 transition-transform"
                aria-label="WALTON"
              >
                <path d={WALTON_EMBLEM_LEFT_PATH} fill="#ffffff" />
                <path d={WALTON_EMBLEM_RIGHT_PATH} fill="#ffffff" />
                <path d={WALTON_EMBLEM_RED_PATH} fill="#ef4444" />
                <path d={WALTON_WORDMARK_PATH} fill="#ffffff" />
              </svg>
            </div>
            {/* Mobile close drawer button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182a52] transition-colors"
              aria-label="Close navigation sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Collapsed Icon-Only Header (matching Image 1) */
          <div className="h-16 flex items-center justify-center border-b border-[#1c2c54] bg-[#091226] shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              title="Walton Quality Management"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center p-1 border border-white/20 shadow-xs cursor-pointer hover:bg-white/20 transition-all hover:scale-105"
            >
              <WaltonSealLogo className="w-full h-full" animated={false} />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {isMenuOpen ? (
            /* ========================================================================= */
            /* 1. EXPANDED / FULL LOOKING SIDEBAR (matching Image 2)                     */
            /* ========================================================================= */
            <nav className="px-2.5 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubActive = hasSubItems && item.subItems?.some((sub) => sub.id === currentPage);
                const isActive = currentPage === item.id;

                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      id={`nav-${item.id}`}
                      onClick={() => {
                        if (hasSubItems) {
                          setIqcExpanded(!iqcExpanded);
                        }
                        handleNavClick(item.id);
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

                      {/* Right: Badge and Right Chevron (matching Image 2) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge !== undefined && item.badge > 0 && (
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
                              iqcExpanded ? 'rotate-180 text-white' : ''
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

                    {/* Render Subsections for IQC if expanded */}
                    <AnimatePresence>
                      {hasSubItems && iqcExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-5 pl-2.5 border-l border-[#22376b] space-y-0.5 my-1"
                        >
                          {item.subItems?.map((sub) => {
                            const SubIcon = sub.icon;
                            const isItemSubActive = currentPage === sub.id;
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
            /* 2. COLLAPSED ICON-ONLY SIDEBAR (matching Image 1)                         */
            /* ========================================================================= */
            <nav className="flex flex-col items-center space-y-1.5 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubActive = hasSubItems && item.subItems?.some((sub) => sub.id === currentPage);
                const isActive = currentPage === item.id;
                const isHovered = hoveredPopup?.item.id === item.id;

                return (
                  <div key={item.id} className="relative">
                    <button
                      id={`nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      onMouseEnter={(e) => handleMouseEnterItem(item, e)}
                      onMouseLeave={handleMouseLeaveItem}
                      className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#182c57] text-white shadow-sm ring-1 ring-[#e35b2a] border-l-2 border-[#e35b2a]'
                          : isHovered
                          ? 'bg-[#182a52] text-white ring-1 ring-[#375294]'
                          : isSubActive
                          ? 'bg-[#182a52] text-white'
                          : 'text-[#8fa1c7] hover:bg-[#152345] hover:text-white'
                      }`}
                      aria-label={item.label}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isHovered
                            ? 'scale-115 text-white'
                            : isActive
                            ? 'text-[#e35b2a]'
                            : 'text-[#8fa1c7]'
                        }`}
                      />

                      {/* Mini indicator dot if item has badge notifications */}
                      {item.badge !== undefined && item.badge > 0 && (
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

      {/* ========================================================================= */}
      {/* 3. ANIMATED SIDEBAR POPUP FLYOUT (Smooth Spring Motion)                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {hoveredPopup && !isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -14, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            style={{ top: `${hoveredPopup.top}px` }}
            className="fixed left-[72px] z-50 w-72 rounded-2xl bg-[#091329]/95 backdrop-blur-xl border border-[#233c70] shadow-2xl shadow-black/80 p-4 text-left text-slate-100 ring-1 ring-white/10 select-none pointer-events-auto"
            onMouseEnter={handleMouseEnterPopup}
            onMouseLeave={handleMouseLeavePopup}
          >
            {/* Dynamic Arrow Connector pointing directly to the hovered icon */}
            <div
              className="absolute -left-1.5 w-3 h-3 bg-[#091329] border-l border-b border-[#233c70] rotate-45 shadow-xs"
              style={{ top: `${hoveredPopup.arrowOffset}px` }}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-[#1b2b52]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1c305c] to-[#111f3d] border border-[#294582] flex items-center justify-center text-[#e35b2a] shadow-inner shrink-0">
                  <hoveredPopup.item.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">
                    {hoveredPopup.item.label}
                  </h4>
                  <span className="text-[10px] text-[#788bb2] font-mono tracking-wide uppercase">
                    Quality Module
                  </span>
                </div>
              </div>

              {hoveredPopup.item.badge !== undefined && hoveredPopup.item.badge > 0 && (
                <span
                  className={`text-[10.5px] font-mono px-2 py-0.5 rounded-full text-white font-bold shrink-0 shadow-xs ${
                    hoveredPopup.item.badgeColor || 'bg-[#d64545]'
                  }`}
                >
                  {hoveredPopup.item.badge}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-[#9eb0d6] leading-relaxed mt-2.5 mb-3">
              {hoveredPopup.item.description}
            </p>

            {/* Sub-Items if available (e.g. IQC -> PCB, PCBA) */}
            {hoveredPopup.item.subItems && hoveredPopup.item.subItems.length > 0 && (
              <div className="mb-3 space-y-1.5 pt-2 border-t border-[#1b2b52]/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7385ad] px-1">
                  Inspection Sub-Sections
                </div>
                <div className="space-y-1">
                  {hoveredPopup.item.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = currentPage === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleNavClick(sub.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-left group/sub ${
                          isSubActive
                            ? 'bg-[#e35b2a] text-white shadow-xs font-semibold'
                            : 'bg-[#122040]/70 hover:bg-[#192b57] text-[#cbd5e1] hover:text-white border border-[#1e335f]/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {SubIcon && (
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSubActive ? 'text-white' : 'text-[#8898bf]'
                              }`}
                            />
                          )}
                          <span className="truncate">{sub.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover/sub:opacity-100 group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Launch Module Footer Action */}
            <button
              onClick={() => handleNavClick(hoveredPopup.item.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1b2f5c] to-[#253f7c] hover:from-[#e35b2a] hover:to-[#f06d3e] border border-[#2e4c8f] hover:border-[#e35b2a] shadow-md transition-all duration-200 cursor-pointer group/btn"
            >
              <span>Open {hoveredPopup.item.label}</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
