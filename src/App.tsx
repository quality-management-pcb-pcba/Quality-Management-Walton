/**
 * =========================================================================================
 * @file src/App.tsx
 * @component App
 * @description Root Component & Master State Controller for Walton Quality Management System
 * =========================================================================================
 *
 * OVERVIEW FOR BEGINNERS:
 * -----------------------
 * `App.tsx` is the central nervous system of the Walton PCB & PCBA Quality Management web
 * application. It maintains global state (such as user authentication status, which page is
 * currently active, and the master database of quality non-conformances and CAPAs).
 *
 * WHERE THE GEMINI AI API IS CALLED & INTEGRATED:
 * -----------------------------------------------
 * - The Gemini AI API service is located at: `src/services/geminiService.ts`.
 * - It uses the official Google Gen AI SDK (`@google/genai`) with the `gemini-2.5-flash` model.
 * - In this QMS architecture, Gemini AI is called to perform:
 *   1. Automated Defect Root Cause Diagnosis (analyzing SMT/MI solder bridges, tombstoning, voids).
 *   2. 8D CAPA Action Plan formulation for quality auditors (D1 through D8 steps).
 *   3. Technical Quality Standards Q&A based on IPC-A-610 Class 2/3 manufacturing standards.
 * - Sub-components such as `NcView`, `CapaView`, `AOILineDefectEntry`, and `ResearchView`
 *   interact with this AI pipeline to assist shop floor operators in real time.
 */

import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { PageType, NonConformanceItem, CapaItem, SopDocument } from './types';
import {
  INITIAL_NCRS,
  INITIAL_CAPAS,
  INITIAL_SOPS,
} from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/views/DashboardView';
import { PCBView } from './components/views/PCBView';
import { PCBAView } from './components/views/PCBAView';
import { KpiView } from './components/views/KpiView';
import { NcView } from './components/views/NcView';
import { CapaView } from './components/views/CapaView';
import { ComplaintsView } from './components/views/ComplaintsView';
import { DocsView } from './components/views/DocsView';
import { TeamView } from './components/views/TeamView';
import { LeadersView } from './components/views/LeadersView';
import { PCBProcessFlowView } from './components/views/PCBProcessFlowView';
import { PCBAProcessFlowView } from './components/views/PCBAProcessFlowView';
import { IqcView } from './components/views/IqcView';
import { RcaView } from './components/views/RcaView';
import { QualityDevView } from './components/views/QualityDevView';
import { TaskManagerView } from './components/views/TaskManagerView';
import { ResearchView } from './components/views/ResearchView';
import { SettingsView } from './components/views/SettingsView';

import { NewNcModal } from './components/modals/NewNcModal';
import { NewCapaModal } from './components/modals/NewCapaModal';
import { NewDocModal } from './components/modals/NewDocModal';
import { ItemDetailModal } from './components/modals/ItemDetailModal';

/**
 * App Component
 * -------------
 * The primary React functional component that coordinates:
 * - Public Landing Showcase (`<LandingPage />`)
 * - Authenticated Internal QMS Portal (`<Header />`, `<Sidebar />`, and active view)
 * - Modal dialogs for authentication, defect creation, CAPA logging, and inspections.
 *
 * @returns {JSX.Element} The rendered React application tree.
 */
export default function App() {
  // ---------------------------------------------------------------------------------------
  // 1. NAVIGATION & AUTHENTICATION STATE
  // ---------------------------------------------------------------------------------------

  /**
   * @state inPortal
   * @type {boolean}
   * Indicates whether the user has transitioned from the public homepage into the internal
   * Quality Management portal system. When false, the full-width LandingPage is rendered.
   */
  const [inPortal, setInPortal] = useState<boolean>(false);

  /**
   * @state isLoggedIn
   * @type {boolean}
   * Indicates whether the user is authenticated as an authorized Walton Quality Administrator.
   * Controls access to administrative editing tools, the sidebar navigation, and restricted actions.
   */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  /**
   * @state currentPage
   * @type {PageType}
   * Stores the identifier of the currently active view (e.g. 'home', 'dashboard', 'pcb', 'pcba', etc.).
   */
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  /**
   * @state sidebarCollapsed
   * @type {boolean}
   * Controls whether the sidebar is collapsed or expanded in mobile/desktop layouts.
   */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  /**
   * @state showLoginModal
   * @type {boolean}
   * Controls the visibility of the administrative login popup dialog.
   */
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  /**
   * @state showSidebar
   * @type {boolean}
   * Controls whether the sidebar is visible inside the portal view.
   * - When a user logs in, the sidebar is visible by default.
   * - When a visitor clicks "Dashboard" from another page, the dashboard opens without the sidebar.
   * - Only users with verified login permissions have authorized access to the sidebar.
   */
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  // ---------------------------------------------------------------------------------------
  // 2. GLOBAL FILTERS STATE
  // ---------------------------------------------------------------------------------------

  /** Currently selected manufacturing audit month (e.g., 'August 2026') */
  const [selectedMonth, setSelectedMonth] = useState<string>('August 2026');

  /** Currently selected product model filter (e.g., 'All Products', 'WFB-FRIDGE-MAIN') */
  const [selectedProduct, setSelectedProduct] = useState<string>('All Products');

  // ---------------------------------------------------------------------------------------
  // 3. DYNAMIC QUALITY RECORDS STATE
  // ---------------------------------------------------------------------------------------

  /** List of active Non-Conformance Reports (NCR) */
  const [ncList, setNcList] = useState<NonConformanceItem[]>(INITIAL_NCRS);

  /** List of active Corrective and Preventive Actions (CAPA) */
  const [capaList, setCapaList] = useState<CapaItem[]>(INITIAL_CAPAS);

  /** List of Standard Operating Procedures & Quality Manuals */
  const [sopList, setSopList] = useState<SopDocument[]>(INITIAL_SOPS);

  // ---------------------------------------------------------------------------------------
  // 4. MODAL VISIBILITY STATE
  // ---------------------------------------------------------------------------------------

  /** Controls popup to record a new Non-Conformance Report */
  const [showNewNcModal, setShowNewNcModal] = useState<boolean>(false);

  /** Controls popup to record a new CAPA plan */
  const [showNewCapaModal, setShowNewCapaModal] = useState<boolean>(false);

  /** Controls popup to upload/create a new Quality SOP document */
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);

  /** Holds the specific NCR item being deeply inspected in the detail modal */
  const [inspectNc, setInspectNc] = useState<NonConformanceItem | null>(null);

  /** Holds the specific CAPA item being deeply inspected in the detail modal */
  const [inspectCapa, setInspectCapa] = useState<CapaItem | null>(null);

  // ---------------------------------------------------------------------------------------
  // 5. ROUTING & BROWSER HISTORY SYNCHRONIZATION
  // ---------------------------------------------------------------------------------------

  const getPageFromUrl = (): PageType | null => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash) {
        const validPages: PageType[] = [
          'home', 'dashboard', 'leaders', 'pcb', 'pcb-process', 'iqc', 'iqc-pcb', 'iqc-pcba',
          'rca', 'pcba', 'pcba-process', 'quality-dev', 'tasks', 'research', 'kpi', 'nc',
          'capa', 'complaints', 'docs', 'team', 'settings'
        ];
        if (validPages.includes(hash as PageType)) return hash as PageType;
      }
      const pathname = window.location.pathname.replace(/^\//, '').trim();
      if (pathname) {
        const validPages: PageType[] = [
          'home', 'dashboard', 'leaders', 'pcb', 'pcb-process', 'iqc', 'iqc-pcb', 'iqc-pcba',
          'rca', 'pcba', 'pcba-process', 'quality-dev', 'tasks', 'research', 'kpi', 'nc',
          'capa', 'complaints', 'docs', 'team', 'settings'
        ];
        if (validPages.includes(pathname as PageType)) return pathname as PageType;
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    const initialPage = getPageFromUrl();
    if (initialPage && initialPage !== 'home') {
      setCurrentPage(initialPage);
      setInPortal(true);
      if (initialPage !== 'dashboard' && isLoggedIn) {
        setShowSidebar(true);
      }
    }

    const handlePopState = () => {
      const p = getPageFromUrl() || 'home';
      setCurrentPage(p);
      setInPortal(p !== 'home');
      if (p === 'home') {
        setShowSidebar(false);
      } else if (p === 'dashboard') {
        setShowSidebar(false);
      } else {
        setShowSidebar(isLoggedIn);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLoggedIn]);

  // ---------------------------------------------------------------------------------------
  // 6. EVENT HANDLERS & NAVIGATION LOGIC
  // ---------------------------------------------------------------------------------------

  /**
   * handleLoginSuccess
   * ------------------
   * WHAT IT DOES:
   * Called when a user successfully enters authorized credentials in the LoginModal.
   * - Marks `isLoggedIn` as true.
   * - Automatically directs the user to the 'dashboard' page with the sidebar visible.
   * - Expands the sidebar and closes the login dialog.
   */
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    setShowSidebar(true);
    setSidebarCollapsed(false);
    setInPortal(true);
    setShowLoginModal(false);
    try {
      window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
    } catch {}
  };

  /**
   * handleLogout
   * ------------
   * WHAT IT DOES:
   * Called when an administrator clicks "Sign Out".
   * - Resets `isLoggedIn` to false.
   * - Hides the administrative sidebar.
   * - Returns the application to the public 'home' landing page.
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowSidebar(false);
    setCurrentPage('home');
    setInPortal(false);
    try {
      window.history.pushState({ page: 'home' }, '', '/');
    } catch {}
  };

  /**
   * handleNavigate
   * --------------
   * WHAT IT DOES:
   * Handles page changes between the Landing Page and internal QMS modules.
   *
   * PARAMETERS:
   * @param {PageType} page - The target destination view (e.g. 'home', 'dashboard', 'pcb', 'capa').
   * @param {object} [options] - Optional routing parameters.
   * @param {boolean} [options.withSidebar] - If true and logged in, shows the sidebar.
   */
  const handleNavigate = (page: PageType, options?: { withSidebar?: boolean }) => {
    try {
      const targetPath = page === 'home' ? '/' : `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    } catch {}

    // If returning home, leave the portal mode and render the public showcase
    if (page === 'home') {
      setCurrentPage('home');
      setInPortal(false);
      return;
    }

    // Role-based sidebar visibility rule:
    // 1. If clicking Dashboard from another page -> opens without the sidebar.
    // 2. If logged in with explicit withSidebar flag -> opens with sidebar.
    // 3. For other internal pages, sidebar is only visible if the user is an authorized logged-in admin.
    if (page === 'dashboard') {
      if (options?.withSidebar && isLoggedIn) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    } else {
      setShowSidebar(isLoggedIn);
    }

    setCurrentPage(page);
    setInPortal(true);
  };

  /**
   * handleAddNc
   * -----------
   * WHAT IT DOES: Adds a newly submitted Non-Conformance Report (NCR) to the top of the state array.
   * @param {NonConformanceItem} item - The new non-conformance record created by the user.
   */
  const handleAddNc = (item: NonConformanceItem) => {
    setNcList([item, ...ncList]);
  };

  /**
   * handleUpdateNcStatus
   * --------------------
   * WHAT IT DOES: Updates the progress status ('Open' | 'In Progress' | 'Closed') of a specific NCR.
   * @param {string} id - The unique ID of the NCR (e.g., 'NCR-2026-081').
   * @param {NonConformanceItem['status']} newStatus - The new status to apply.
   */
  const handleUpdateNcStatus = (id: string, newStatus: NonConformanceItem['status']) => {
    setNcList(ncList.map((n) => (n.id === id ? { ...n, status: newStatus } : n)));
  };

  /**
   * handleAddCapa
   * -------------
   * WHAT IT DOES: Adds a newly submitted Corrective and Preventive Action (CAPA) item to state.
   * @param {CapaItem} item - The newly created CAPA record.
   */
  const handleAddCapa = (item: CapaItem) => {
    setCapaList([item, ...capaList]);
  };

  /**
   * handleUpdateCapaStatus
   * ----------------------
   * WHAT IT DOES: Updates the lifecycle state of a CAPA item (e.g. from 'Open' to 'Closed').
   * @param {string} id - The unique ID of the CAPA (e.g., 'CAPA-2026-042').
   * @param {CapaItem['status']} newStatus - The updated status string.
   */
  const handleUpdateCapaStatus = (id: string, newStatus: CapaItem['status']) => {
    setCapaList(capaList.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  /**
   * handleAddDoc
   * ------------
   * WHAT IT DOES: Inserts a newly registered Standard Operating Procedure (SOP) into state.
   * @param {SopDocument} item - The new document record.
   */
  const handleAddDoc = (item: SopDocument) => {
    setSopList([item, ...sopList]);
  };

  /** Determines whether the public Landing Page should be rendered */
  const isShowingHome = !inPortal || currentPage === 'home';

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#0d1730] flex flex-col font-sans selection:bg-[#e35b2a] selection:text-white">
      {/* Top Application Header shown when in Portal view */}
      {!isShowingHome && (
        <Header
          isLoggedIn={isLoggedIn}
          onOpenLoginModal={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          onTogglePortalView={() => setInPortal(!inPortal)}
          inPortal={inPortal}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenNewNcModal={() => setShowNewNcModal(true)}
          onOpenNewCapaModal={() => setShowNewCapaModal(true)}
          onOpenNewDocModal={() => setShowNewDocModal(true)}
        />
      )}

      {/* Main Workspace */}
      {isShowingHome ? (
        <LandingPage
          isLoggedIn={isLoggedIn}
          onEnterDashboard={() => handleNavigate('dashboard')}
          onNavigateToPage={handleNavigate}
          onOpenLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onSelectDepartment={(deptId) => {
            if (deptId === 'tqm') handleNavigate('dashboard');
            else if (deptId === 'qa') handleNavigate('kpi');
            else if (deptId === 'qc') handleNavigate('pcba');
            else if (deptId === 'research') handleNavigate('research');
            else handleNavigate('dashboard');
          }}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden pt-[86px] sm:pt-[90px]">
          {/* Internal Sidebar - Visible only to users who have authorized login access and when showSidebar is true */}
          {showSidebar && isLoggedIn && (
            <Sidebar
              currentPage={currentPage}
              onSelectPage={handleNavigate}
              onNavigate={handleNavigate}
              isOpen={!sidebarCollapsed}
              collapsed={sidebarCollapsed}
              onCloseMobile={() => setSidebarCollapsed(true)}
              openNcCount={ncList.filter((n) => n.status === 'Open' || n.status === 'In Progress').length}
              openCapaCount={capaList.filter((c) => c.status === 'Open' || c.status === 'In Progress').length}
            />
          )}

          {/* Dynamic Content Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f4f6fb]">
            <div className="max-w-7xl mx-auto">
              {currentPage === 'dashboard' && (
                <DashboardView
                  onNavigate={handleNavigate}
                  onOpenNewNcModal={() => setShowNewNcModal(true)}
                  onOpenNewCapaModal={() => setShowNewCapaModal(true)}
                  openNcCount={ncList.filter((n) => n.status === 'Open').length}
                  openCapaCount={capaList.filter((c) => c.status === 'Open' || c.status === 'In Progress').length}
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  selectedProduct={selectedProduct}
                  onProductChange={setSelectedProduct}
                  isLoggedIn={isLoggedIn}
                  onOpenLoginModal={() => setShowLoginModal(true)}
                  showSidebar={showSidebar && isLoggedIn}
                />
              )}

              {currentPage === 'pcb' && (
                <PCBView
                  onNavigate={handleNavigate}
                  selectedProduct={selectedProduct}
                  selectedMonth={selectedMonth}
                />
              )}

              {currentPage === 'pcb-process' && (
                <PCBProcessFlowView onNavigate={handleNavigate} />
              )}

              {(currentPage === 'iqc' || currentPage === 'iqc-pcb' || currentPage === 'iqc-pcba') && (
                <IqcView
                  onNavigate={handleNavigate}
                  selectedSubsection={
                    currentPage === 'iqc-pcb' ? 'pcb' : currentPage === 'iqc-pcba' ? 'pcba' : 'all'
                  }
                  isLoggedIn={isLoggedIn}
                  onOpenLoginModal={() => setShowLoginModal(true)}
                />
              )}

              {currentPage === 'rca' && (
                <RcaView
                  onNavigate={handleNavigate}
                  isLoggedIn={isLoggedIn}
                  onOpenLoginModal={() => setShowLoginModal(true)}
                />
              )}

              {currentPage === 'pcba-process' && (
                <PCBAProcessFlowView onNavigate={handleNavigate} />
              )}

              {currentPage === 'pcba' && (
                <PCBAView
                  onNavigate={handleNavigate}
                  selectedProduct={selectedProduct}
                  selectedMonth={selectedMonth}
                />
              )}

              {currentPage === 'quality-dev' && (
                <QualityDevView onNavigate={handleNavigate} />
              )}

              {currentPage === 'tasks' && (
                <TaskManagerView onNavigate={handleNavigate} />
              )}

              {currentPage === 'kpi' && <KpiView />}

              {currentPage === 'nc' && (
                <NcView
                  ncList={ncList}
                  onOpenNewNcModal={() => setShowNewNcModal(true)}
                  onSelectNcItem={(item) => setInspectNc(item)}
                  onUpdateStatus={handleUpdateNcStatus}
                />
              )}

              {currentPage === 'capa' && (
                <CapaView
                  capaList={capaList}
                  onOpenNewCapaModal={() => setShowNewCapaModal(true)}
                  onSelectCapaItem={(item) => setInspectCapa(item)}
                  onUpdateStatus={handleUpdateCapaStatus}
                />
              )}

              {currentPage === 'complaints' && (
                <ComplaintsView
                  onNavigate={handleNavigate}
                  isLoggedIn={isLoggedIn}
                  onOpenLoginModal={() => setShowLoginModal(true)}
                />
              )}

              {currentPage === 'docs' && (
                <DocsView
                  sopList={sopList}
                  onOpenNewDocModal={() => setShowNewDocModal(true)}
                />
              )}

              {currentPage === 'team' && <TeamView />}

              {currentPage === 'leaders' && <LeadersView onNavigate={handleNavigate} />}

              {currentPage === 'research' && <ResearchView onNavigate={handleNavigate} />}

              {currentPage === 'settings' && <SettingsView />}
            </div>
          </main>
        </div>
      )}

      {/* Global Action Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginSuccess}
        onLoginSuccess={handleLoginSuccess}
      />

      <NewNcModal
        isOpen={showNewNcModal}
        onClose={() => setShowNewNcModal(false)}
        onSubmit={handleAddNc}
      />

      <NewCapaModal
        isOpen={showNewCapaModal}
        onClose={() => setShowNewCapaModal(false)}
        onSubmit={handleAddCapa}
      />

      <NewDocModal
        isOpen={showNewDocModal}
        onClose={() => setShowNewDocModal(false)}
        onSubmit={handleAddDoc}
      />

      <ItemDetailModal
        ncItem={inspectNc}
        capaItem={inspectCapa}
        onClose={() => {
          setInspectNc(null);
          setInspectCapa(null);
        }}
      />
    </div>
  );
}
