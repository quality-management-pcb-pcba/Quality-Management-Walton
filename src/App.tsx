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

import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { PageType, NonConformanceItem, CapaItem, SopDocument, UserProfile } from './types';
import {
  INITIAL_NCRS,
  INITIAL_CAPAS,
  INITIAL_SOPS,
} from './data/initialData';
import { auth, signOut, onAuthStateChanged } from './services/firebase';
import { getUserProfile, bootstrapUserProfile, isDesignatedAdminEmail } from './services/userService';
import {
  subscribeNonConformances,
  createNonConformance,
  updateNonConformance,
} from './services/nonConformance';
import {
  subscribeCapas,
  createCapa,
  updateCapa,
} from './services/capa';
import {
  subscribeDocumentRecords,
  createDocumentRecord,
} from './services/documents';
import { subscribeTasks } from './services/tasks';
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
import { EsdView } from './components/views/EsdView';
import { RcaView } from './components/views/RcaView';
import { QualityDevView } from './components/views/QualityDevView';
import { TaskManagerView } from './components/views/TaskManagerView';
import { ResearchView } from './components/views/ResearchView';
import { SettingsView } from './components/views/SettingsView';
import { UserManagementView } from './components/views/UserManagementView';

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
   * Indicates whether the user is authenticated via Firebase Authentication.
   * Controls access to administrative editing tools, the sidebar navigation, and restricted actions.
   */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  /**
   * @state currentUserEmail
   * Holds the email of the authenticated Firebase user.
   */
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('atiqur40736@waltonbd.com');

  /**
   * @state currentUserProfile
   * Holds the active Firestore employee profile for the authenticated employee.
   */
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  /**
   * Listen to Firebase Authentication state changes across app lifecycle
   */
  useEffect(() => {
    // Check for active local Walton session immediately on mount
    try {
      const savedSession = localStorage.getItem('walton_auth_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.email) {
          // Strictly enforce: users who are not designated admins can never have 'admin' role
          const savedPortal = localStorage.getItem('walton_login_portal');
          if (savedPortal === 'staff' || !isDesignatedAdminEmail(parsed.email)) {
            parsed.role = 'qa_staff';
          }
          setIsLoggedIn(true);
          setCurrentUserEmail(parsed.email);
          setCurrentUserProfile(parsed);
        }
      }
    } catch {}

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        if (user.email) {
          setCurrentUserEmail(user.email);
        }
        try {
          let profile = await getUserProfile(user.uid, user.email || undefined);
          if (!profile && user.email) {
            profile = await bootstrapUserProfile(user.uid, user.email);
          }
          if (profile) {
            if (profile.status === 'inactive') {
              await signOut(auth);
              try {
                localStorage.removeItem('walton_auth_session');
                localStorage.removeItem('walton_active_user');
                localStorage.removeItem('walton_login_portal');
              } catch {}
              setIsLoggedIn(false);
              setCurrentUserProfile(null);
              return;
            }

            // Strictly enforce: non-designated admin email can never get admin role
            const savedPortal = localStorage.getItem('walton_login_portal');
            if (savedPortal === 'staff' || !isDesignatedAdminEmail(profile.email)) {
              profile.role = 'qa_staff';
            }

            setCurrentUserProfile(profile);
            try {
              localStorage.setItem('walton_active_user', profile.email);
              localStorage.setItem('walton_auth_session', JSON.stringify(profile));
            } catch {}
          }
        } catch (err) {
          console.warn('Profile fetch warning:', err);
        }
      } else {
        // If Firebase Auth has no user, verify if an active local session exists
        try {
          const savedSession = localStorage.getItem('walton_auth_session');
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.email) {
              const savedPortal = localStorage.getItem('walton_login_portal');
              if (savedPortal === 'staff' || !isDesignatedAdminEmail(parsed.email)) {
                parsed.role = 'qa_staff';
              }
              setIsLoggedIn(true);
              setCurrentUserEmail(parsed.email);
              setCurrentUserProfile(parsed);
              return;
            }
          }
        } catch {}

        setIsLoggedIn(false);
        setCurrentUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * @state currentPage
   * @type {PageType}
   * Stores the identifier of the currently active view (e.g. 'home', 'dashboard', 'pcb', 'pcba', etc.).
   */
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  /**
   * @state isSidebarOpen
   * Controls whether the navigation sidebar is open or closed across desktop and mobile.
   * Pressing the topbar menu button (#btn-sidebar-toggle) toggles it open and closed.
   */
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  /**
   * @state showLoginModal
   * @type {boolean}
   * Controls the visibility of the administrative login popup dialog.
   */
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

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

  /** Count of pending (In Progress + On Hold) tasks in Task Manager */
  const [pendingTaskCount, setPendingTaskCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('walton_qms_tasks_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t) => t.status !== 'COMPLETED').length;
        }
      }
    } catch {
      // ignore storage errors
    }
    return 5;
  });

  /**
   * Synchronize NCRs, CAPAs, SOP Documents, and Task badge counts with Cloud Firestore
   */
  useEffect(() => {
    let seededNcrs = false;
    const unsubNc = subscribeNonConformances((items) => {
      if (items.length > 0) {
        setNcList(items);
      } else if (!seededNcrs) {
        seededNcrs = true;
        INITIAL_NCRS.forEach((nc) => {
          createNonConformance(nc).catch(() => {});
        });
      }
    });

    let seededCapas = false;
    const unsubCapa = subscribeCapas((items) => {
      if (items.length > 0) {
        setCapaList(items);
      } else if (!seededCapas) {
        seededCapas = true;
        INITIAL_CAPAS.forEach((c) => {
          createCapa(c).catch(() => {});
        });
      }
    });

    let seededDocs = false;
    const unsubDocs = subscribeDocumentRecords((docs) => {
      if (docs.length > 0) {
        setSopList(docs);
      } else if (!seededDocs) {
        seededDocs = true;
        INITIAL_SOPS.forEach((s) => {
          createDocumentRecord(s).catch(() => {});
        });
      }
    });

    const unsubTasks = subscribeTasks((liveTasks) => {
      if (liveTasks.length > 0) {
        setPendingTaskCount(liveTasks.filter((t) => t.status !== 'COMPLETED').length);
      }
    });

    return () => {
      unsubNc();
      unsubCapa();
      unsubDocs();
      unsubTasks();
    };
  }, []);

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

  /** Reference to the primary scrolling container so navigating resets scroll position */
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentPage]);

  // ---------------------------------------------------------------------------------------
  // 5. ROUTING & BROWSER HISTORY SYNCHRONIZATION
  // ---------------------------------------------------------------------------------------

  const getPageFromUrl = (): PageType | null => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash) {
        const validPages: PageType[] = [
          'home', 'dashboard', 'leaders', 'pcb', 'pcb-process', 'iqc', 'iqc-pcb', 'iqc-pcba',
          'esd', 'rca', 'pcba', 'pcba-process', 'quality-dev', 'tasks', 'research', 'kpi', 'nc',
          'capa', 'complaints', 'docs', 'team', 'team-database', 'team-entry', 'users', 'settings'
        ];
        if (validPages.includes(hash as PageType)) return hash as PageType;
      }
      const pathname = window.location.pathname.replace(/^\//, '').trim();
      if (pathname) {
        const validPages: PageType[] = [
          'home', 'dashboard', 'leaders', 'pcb', 'pcb-process', 'iqc', 'iqc-pcb', 'iqc-pcba',
          'esd', 'rca', 'pcba', 'pcba-process', 'quality-dev', 'tasks', 'research', 'kpi', 'nc',
          'capa', 'complaints', 'docs', 'team', 'team-database', 'team-entry', 'users', 'settings'
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
    }

    const handlePopState = () => {
      const p = getPageFromUrl() || 'home';
      setCurrentPage(p);
      setInPortal(p !== 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ---------------------------------------------------------------------------------------
  // 6. EVENT HANDLERS & NAVIGATION LOGIC
  // ---------------------------------------------------------------------------------------

  /**
   * handleLoginSuccess
   * ------------------
   * WHAT IT DOES:
   * Called when a user successfully enters authorized credentials in the LoginModal.
   * - Marks `isLoggedIn` as true.
   * - Saves authenticated user email and loaded UserProfile.
   * - Automatically directs the user to the 'dashboard' page with the sidebar visible.
   * - Expands the sidebar and closes the login dialog.
   */
  const handleLoginSuccess = (email?: string, profile?: UserProfile) => {
    setIsLoggedIn(true);
    if (email) {
      setCurrentUserEmail(email);
    }
    if (profile) {
      // Enforce strict separation
      const savedPortal = localStorage.getItem('walton_login_portal');
      if (savedPortal === 'staff' || !isDesignatedAdminEmail(profile.email)) {
        profile.role = 'qa_staff';
      }
      setCurrentUserProfile(profile);
    }
    setCurrentPage('dashboard');
    setIsSidebarOpen(false);
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
   * - Calls Firebase signOut.
   * - Resets `isLoggedIn` and `currentUserProfile` to null.
   * - Returns the application to the public 'home' landing page.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
    try {
      localStorage.removeItem('walton_auth_session');
      localStorage.removeItem('walton_active_user');
      localStorage.removeItem('walton_login_portal');
    } catch {}
    setIsLoggedIn(false);
    setCurrentUserProfile(null);
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
  const handleNavigate = (page: PageType, _options?: { withSidebar?: boolean }) => {
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

    setCurrentPage(page);
    setInPortal(true);
  };

  /**
   * handleToggleSidebar
   * -------------------
   * WHAT IT DOES:
   * Toggles the sidebar open or closed on each click of the topbar menu button (#btn-sidebar-toggle).
   */
  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  /**
   * handleAddNc
   * -----------
   * WHAT IT DOES: Adds a newly submitted Non-Conformance Report (NCR) to the top of the state array.
   * @param {NonConformanceItem} item - The new non-conformance record created by the user.
   */
  const handleAddNc = (item: NonConformanceItem) => {
    setNcList((prev) => [item, ...prev.filter((n) => n.id !== item.id)]);
    createNonConformance(item).catch((err) => {
      console.warn('Firestore NCR create notice:', err);
    });
  };

  /**
   * handleUpdateNcStatus
   * --------------------
   * WHAT IT DOES: Updates the progress status ('Open' | 'In Progress' | 'Closed') of a specific NCR.
   * @param {string} id - The unique ID of the NCR (e.g., 'NCR-2026-081').
   * @param {NonConformanceItem['status']} newStatus - The new status to apply.
   */
  const handleUpdateNcStatus = (id: string, newStatus: NonConformanceItem['status']) => {
    setNcList((prev) => prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n)));
    updateNonConformance(id, { status: newStatus }).catch((err) => {
      console.warn('Firestore NCR status update notice:', err);
    });
  };

  /**
   * handleAddCapa
   * -------------
   * WHAT IT DOES: Adds a newly submitted Corrective and Preventive Action (CAPA) item to state.
   * @param {CapaItem} item - The newly created CAPA record.
   */
  const handleAddCapa = (item: CapaItem) => {
    setCapaList((prev) => [item, ...prev.filter((c) => c.id !== item.id)]);
    createCapa(item).catch((err) => {
      console.warn('Firestore CAPA create notice:', err);
    });
  };

  /**
   * handleUpdateCapaStatus
   * ----------------------
   * WHAT IT DOES: Updates the lifecycle state of a CAPA item (e.g. from 'Open' to 'Closed').
   * @param {string} id - The unique ID of the CAPA (e.g., 'CAPA-2026-042').
   * @param {CapaItem['status']} newStatus - The updated status string.
   */
  const handleUpdateCapaStatus = (id: string, newStatus: CapaItem['status']) => {
    setCapaList((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    updateCapa(id, { status: newStatus }).catch((err) => {
      console.warn('Firestore CAPA status update notice:', err);
    });
  };

  /**
   * handleAddDoc
   * ------------
   * WHAT IT DOES: Inserts a newly registered Standard Operating Procedure (SOP) into state.
   * @param {SopDocument} item - The new document record.
   */
  const handleAddDoc = (item: SopDocument) => {
    setSopList((prev) => [item, ...prev.filter((d) => d.id !== item.id)]);
    createDocumentRecord(item).catch((err) => {
      console.warn('Firestore Document create notice:', err);
    });
  };

  /** Determines whether the public Landing Page should be rendered */
  const isShowingHome = !inPortal || currentPage === 'home';

  return (
    <div
      className={`${
        isShowingHome ? 'min-h-screen' : 'h-screen h-[100dvh] overflow-hidden'
      } bg-[#f4f6fb] text-[#0d1730] flex flex-col font-sans selection:bg-[#e35b2a] selection:text-white`}
    >
      {/* Top Application Header shown when in Portal view */}
      {!isShowingHome && (
        <Header
          isLoggedIn={isLoggedIn}
          userEmail={currentUserEmail}
          userProfile={currentUserProfile}
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
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
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
        <div className="flex-1 flex overflow-hidden pt-[86px] sm:pt-[90px] min-h-0">
          {/* Internal Navigation Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onSelectPage={handleNavigate}
            onNavigate={handleNavigate}
            isOpen={isSidebarOpen}
            collapsed={!isSidebarOpen}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onCloseMobile={() => setIsSidebarOpen(false)}
            pendingTaskCount={pendingTaskCount}
            openNcCount={ncList.filter((n) => n.status !== 'Closed').length}
            openCapaCount={capaList.filter((c) => c.status !== 'Closed' && c.status !== 'Cancelled').length}
            userProfile={currentUserProfile}
          />

          {/* Dynamic Content Body */}
          <main ref={mainScrollRef} className="flex-1 h-full overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-8 bg-[#f4f6fb]">
            <div className="max-w-7xl mx-auto">
              {currentPage === 'dashboard' && (
                <DashboardView
                  onNavigate={handleNavigate}
                  onOpenNewNcModal={() => setShowNewNcModal(true)}
                  onOpenNewCapaModal={() => setShowNewCapaModal(true)}
                  openNcCount={ncList.filter((n) => n.status !== 'Closed').length}
                  openCapaCount={capaList.filter((c) => c.status !== 'Closed' && c.status !== 'Cancelled').length}
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  selectedProduct={selectedProduct}
                  onProductChange={setSelectedProduct}
                  isLoggedIn={isLoggedIn}
                  onOpenLoginModal={() => setShowLoginModal(true)}
                  showSidebar={isSidebarOpen}
                  onToggleSidebar={handleToggleSidebar}
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

              {currentPage === 'esd' && (
                <EsdView
                  onNavigate={handleNavigate}
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
                <TaskManagerView
                  onNavigate={handleNavigate}
                  onPendingCountChange={setPendingTaskCount}
                />
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

              {(currentPage === 'team' ||
                currentPage === 'team-database' ||
                currentPage === 'team-entry') && (
                <TeamView
                  selectedSubsection={currentPage === 'team-entry' ? 'entry' : 'database'}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPage === 'leaders' && <LeadersView onNavigate={handleNavigate} />}

              {currentPage === 'research' && <ResearchView onNavigate={handleNavigate} />}

              {currentPage === 'users' && (
                <UserManagementView currentUserProfile={currentUserProfile} />
              )}

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
