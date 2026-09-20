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

import React, { useState } from 'react';
import { PageId } from '../types';
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
  Workflow,
} from 'lucide-react';

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

  /**
   * handleNavClick
   * --------------
   * WHAT IT DOES:
   * Triggers navigation to the chosen page ID and automatically collapses the mobile drawer.
   *
   * @param {PageId} pageId - Target page identifier (e.g., 'dashboard', 'capa', 'pcb')
   */
  const handleNavClick = (pageId: PageId) => {
    if (typeof onNavigate === 'function') {
      onNavigate(pageId);
    } else if (typeof onSelectPage === 'function') {
      onSelectPage(pageId);
    }
    if (typeof onCloseMobile === 'function') {
      onCloseMobile();
    }
  };
  const [iqcExpanded, setIqcExpanded] = useState<boolean>(true);

  interface NavItem {
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    subItems?: Array<{
      id: PageId;
      label: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  }

  const navSections: Array<{ group: string; items: NavItem[] }> = [
    {
      group: '',
      items: [
        {
          id: 'dashboard' as PageId,
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'pcb' as PageId,
          label: 'PCB',
          icon: Cpu,
        },
        {
          id: 'pcba' as PageId,
          label: 'PCBA',
          icon: Layers,
        },
        {
          id: 'iqc' as PageId,
          label: 'IQC',
          icon: ClipboardCheck,
          subItems: [
            {
              id: 'iqc-pcb' as PageId,
              label: '1. PCB',
              icon: Cpu,
            },
            {
              id: 'iqc-pcba' as PageId,
              label: '2. PCBA',
              icon: Layers,
            },
          ],
        },
        {
          id: 'tasks' as PageId,
          label: 'Task Manager',
          icon: ClipboardList,
          badge: 4,
          badgeColor: 'bg-[#6366f1]',
        },
        {
          id: 'kpi' as PageId,
          label: 'KPI',
          icon: BarChart3,
        },
        {
          id: 'nc' as PageId,
          label: 'Non Conformance',
          icon: AlertOctagon,
          badge: ncrBadge,
          badgeColor: 'bg-[#d64545]',
        },
        {
          id: 'capa' as PageId,
          label: 'CAPA',
          icon: CheckCircle,
          badge: openCapaCount,
          badgeColor: 'bg-[#e8a13a]',
        },
        {
          id: 'rca' as PageId,
          label: 'RCA',
          icon: Workflow,
        },
        {
          id: 'complaints' as PageId,
          label: 'Customer Complaints',
          icon: MessageSquareWarning,
        },
        {
          id: 'quality-dev' as PageId,
          label: 'Quality Development',
          icon: TrendingUp,
        },
        {
          id: 'docs' as PageId,
          label: 'Documents & SOP',
          icon: FileText,
        },
        {
          id: 'team' as PageId,
          label: 'Team & Training',
          icon: Users,
        },
        {
          id: 'settings' as PageId,
          label: 'Setting',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMenuOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-[86px] sm:top-[90px] bottom-0 left-0 ${
          collapsed ? 'hidden lg:hidden' : 'w-[246px]'
        } shrink-0 bg-[#122040] text-[#cfd8ee] flex flex-col z-40 transition-all duration-200 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-[#22376b] overflow-y-auto`}
      >
        {/* Mobile close button header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#22376b]">
          <span className="text-xs font-semibold text-[#8891a8] uppercase tracking-wider">Navigation</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-[#cfd8ee] hover:bg-[#182a52]"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-4 flex-1">
          {navSections.map((section, idx) => (
            <div key={section.group || `group-${idx}`}>
              {section.group && (
                <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#7d8bb0]">
                  {section.group}
                </div>
              )}
              <div className="space-y-1 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isItemOrSubActive =
                    currentPage === item.id ||
                    (hasSubItems && item.subItems?.some((sub) => sub.id === currentPage));
                  const isActive = currentPage === item.id;

                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <button
                          id={`nav-${item.id}`}
                          onClick={() => handleNavClick(item.id)}
                          className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all duration-150 cursor-pointer ${
                            isActive
                              ? 'bg-[#e35b2a] text-white shadow-md shadow-[#e35b2a]/30'
                              : isItemOrSubActive
                              ? 'bg-[#182a52] text-white'
                              : 'text-[#cfd8ee] hover:bg-[#182a52] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`w-4.5 h-4.5 ${
                                isActive ? 'text-white' : isItemOrSubActive ? 'text-[#e35b2a]' : 'text-[#8891a8]'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full text-white font-bold ${
                                isActive ? 'bg-white/20' : item.badgeColor || 'bg-[#2f9bea]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>

                        {hasSubItems && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIqcExpanded(!iqcExpanded);
                            }}
                            className={`p-2 rounded-lg text-[#8891a8] hover:text-white hover:bg-[#182a52] transition-colors cursor-pointer ${
                              iqcExpanded ? 'rotate-180 text-white' : ''
                            }`}
                            title={iqcExpanded ? 'Collapse Subsections' : 'Expand Subsections'}
                            aria-label="Toggle subsections"
                          >
                            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-150" />
                          </button>
                        )}
                      </div>

                      {/* Render Subsections (e.g. PCB and PCBA under IQC) */}
                      {hasSubItems && iqcExpanded && (
                        <div className="ml-4 pl-3 border-l border-[#22376b] space-y-1 my-1">
                          {item.subItems?.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = currentPage === sub.id;
                            return (
                              <button
                                key={sub.id}
                                id={`nav-${sub.id}`}
                                onClick={() => handleNavClick(sub.id)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                  isSubActive
                                    ? 'bg-[#e35b2a] text-white shadow-xs font-bold'
                                    : 'text-[#9fb0d6] hover:bg-[#182a52] hover:text-white'
                                }`}
                              >
                                {SubIcon && (
                                  <SubIcon
                                    className={`w-3.5 h-3.5 ${
                                      isSubActive ? 'text-white' : 'text-[#7d8bb0]'
                                    }`}
                                  />
                                )}
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Return to Home Page button */}
        <div className="px-3 pb-2">
          <button
            id="nav-back-to-home"
            onClick={() => handleNavClick('home')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#8891a8] hover:text-white hover:bg-[#182a52] transition-colors border border-[#1e335f] cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Page</span>
          </button>
        </div>

        {/* Bottom system status indicator */}
        <div className="p-3 border-t border-[#182a52] bg-[#0d1730]/60">
          <div className="flex items-center justify-between text-[11px] text-[#8891a8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#28ad6b] animate-pulse" />
              <span>Lines 1-8 Live</span>
            </div>
            <span className="font-mono text-[10px] text-[#5b6480]">v2.6.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
