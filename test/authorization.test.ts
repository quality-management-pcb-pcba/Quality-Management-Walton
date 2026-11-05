import assert from 'node:assert';
import {
  canAccessPage,
  canAccessModule,
  isAdminProfile,
  INITIAL_STAFF_SEEDS,
  QM_SECTIONS,
  PageType,
} from '../src/services/userService';
import { UserProfile } from '../src/types';

describe('Walton QMS - Phase D Comprehensive Authorization & Negative Security Test Suite', () => {
  // --------------------------------------------------------------------------
  // ACCOUNT SETUP
  // --------------------------------------------------------------------------
  const adminProfile: UserProfile = {
    uid: 'EqqAbCPpNnSuyvXyjzYc63UaI173',
    ...INITIAL_STAFF_SEEDS['qm.pcba26@gmail.com'],
  };

  const tajedulProfile: UserProfile = {
    uid: 'GzeuJVQenDNNCoauo3iWBH8EZZO2',
    ...INITIAL_STAFF_SEEDS['tajedul36924@waltonbd.com'],
  };

  const alamgirProfile: UserProfile = {
    uid: '1Vl4LC50AUYh7nIuht0l2Te0kLc2',
    ...INITIAL_STAFF_SEEDS['alamgir.pcb@waltonbd.com'],
  };

  const mamunProfile: UserProfile = {
    uid: 'GxbM1WUklKRg6wNXeNLBw8qZLKS2',
    ...INITIAL_STAFF_SEEDS['mamun.pcba@waltonbd.com'],
  };

  // --------------------------------------------------------------------------
  // SECTION A: 1. ADMIN DASHBOARD & ALL 18 CORE APPLICATION MODULES
  // --------------------------------------------------------------------------
  describe('A1. Admin Access Verification (Md. Atiqur Rahman - Full Access)', () => {
    it('Admin is recognized as designated admin', () => {
      assert.strictEqual(isAdminProfile(adminProfile), true);
    });

    it('Admin can access Admin Dashboard & standard Dashboard', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'admin-dashboard'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'dashboard'), true);
    });

    it('Admin can access MD Sir Report and ALL eight child tabs', () => {
      const mdTabs: PageType[] = [
        'md-report',
        'md-report-summary',
        'md-report-pcb',
        'md-report-pcba',
        'md-report-smt',
        'md-report-mi',
        'md-report-trend',
        'md-report-action',
        'md-report-data',
      ];
      for (const tab of mdTabs) {
        assert.strictEqual(canAccessPage(adminProfile, tab), true, `Admin should access ${tab}`);
      }
    });

    it('Admin can access PCB and PCB Process', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'pcb'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'pcb-process'), true);
    });

    it('Admin can access PCBA and PCBA Process', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'pcba'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'pcba-process'), true);
    });

    it('Admin can access IQC PCB and IQC PCBA', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'iqc-pcb'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'iqc-pcba'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'iqc'), true);
    });

    it('Admin can access ESD and ESD database/entry', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'esd'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'esd-database'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'esd-entry'), true);
    });

    it('Admin can access SMT and MI modules', () => {
      assert.strictEqual(canAccessModule(adminProfile, 'SMT'), true);
      assert.strictEqual(canAccessModule(adminProfile, 'MI'), true);
    });

    it('Admin can access Manpower & Team management', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'manpower'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'team'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'team-database'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'team-entry'), true);
    });

    it('Admin can access Task Manager, KPI, NCR, CAPA, RCA, Complaints, Quality Dev, Docs', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'tasks'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'kpi'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'nc'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'capa'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'rca'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'complaints'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'quality-dev'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'docs'), true);
    });

    it('Admin can access User Management & Security Settings', () => {
      assert.strictEqual(canAccessPage(adminProfile, 'users'), true);
      assert.strictEqual(canAccessPage(adminProfile, 'settings'), true);
    });
  });

  describe('A2. User 01 Access Verification (Tajedul Islam - PCBA Scope, PCB & MD Report Denied)', () => {
    it('Tajedul is NOT admin', () => {
      assert.strictEqual(isAdminProfile(tajedulProfile), false);
    });

    it('Tajedul can access PCBA and operational modules', () => {
      assert.strictEqual(canAccessPage(tajedulProfile, 'dashboard'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'pcba'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'pcba-process'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'iqc-pcba'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'esd'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'esd-database'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'manpower'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'team'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'tasks'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'kpi'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'nc'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'capa'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'rca'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'complaints'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'quality-dev'), true);
      assert.strictEqual(canAccessPage(tajedulProfile, 'docs'), true);
    });

    it('Tajedul is STRICTLY BLOCKED from PCB & PCB Process & IQC PCB', () => {
      assert.strictEqual(canAccessPage(tajedulProfile, 'pcb'), false);
      assert.strictEqual(canAccessPage(tajedulProfile, 'pcb-process'), false);
      assert.strictEqual(canAccessPage(tajedulProfile, 'iqc-pcb'), false);
    });

    it('Tajedul is STRICTLY BLOCKED from MD Sir Report and all 8 child tabs', () => {
      const mdTabs: PageType[] = [
        'md-report',
        'md-report-summary',
        'md-report-pcb',
        'md-report-pcba',
        'md-report-smt',
        'md-report-mi',
        'md-report-trend',
        'md-report-action',
        'md-report-data',
      ];
      for (const tab of mdTabs) {
        assert.strictEqual(canAccessPage(tajedulProfile, tab), false, `Tajedul must not access ${tab}`);
      }
    });

    it('Tajedul is STRICTLY BLOCKED from User Management and Security Settings', () => {
      assert.strictEqual(canAccessPage(tajedulProfile, 'users'), false);
      assert.strictEqual(canAccessPage(tajedulProfile, 'settings'), false);
    });
  });

  describe('A3. User 02 Access Verification (Md. Alamgir Hossain - PCB Scope, PCBA & MD Report Denied)', () => {
    it('Alamgir is NOT admin', () => {
      assert.strictEqual(isAdminProfile(alamgirProfile), false);
    });

    it('Alamgir can access PCB and operational modules', () => {
      assert.strictEqual(canAccessPage(alamgirProfile, 'dashboard'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'pcb'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'pcb-process'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'iqc-pcb'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'esd'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'manpower'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'team'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'tasks'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'kpi'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'nc'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'capa'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'rca'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'complaints'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'quality-dev'), true);
      assert.strictEqual(canAccessPage(alamgirProfile, 'docs'), true);
    });

    it('Alamgir is STRICTLY BLOCKED from PCBA & PCBA Process & IQC PCBA', () => {
      assert.strictEqual(canAccessPage(alamgirProfile, 'pcba'), false);
      assert.strictEqual(canAccessPage(alamgirProfile, 'pcba-process'), false);
      assert.strictEqual(canAccessPage(alamgirProfile, 'iqc-pcba'), false);
    });

    it('Alamgir is STRICTLY BLOCKED from MD Sir Report and all 8 child tabs', () => {
      const mdTabs: PageType[] = [
        'md-report',
        'md-report-summary',
        'md-report-pcb',
        'md-report-pcba',
        'md-report-smt',
        'md-report-mi',
        'md-report-trend',
        'md-report-action',
        'md-report-data',
      ];
      for (const tab of mdTabs) {
        assert.strictEqual(canAccessPage(alamgirProfile, tab), false, `Alamgir must not access ${tab}`);
      }
    });

    it('Alamgir is STRICTLY BLOCKED from User Management and Security Settings', () => {
      assert.strictEqual(canAccessPage(alamgirProfile, 'users'), false);
      assert.strictEqual(canAccessPage(alamgirProfile, 'settings'), false);
    });
  });

  describe('A4. User 03 Access Verification (Md. Mamun Hossen - PCBA Scope, PCB & MD Report Denied)', () => {
    it('Mamun is NOT admin', () => {
      assert.strictEqual(isAdminProfile(mamunProfile), false);
    });

    it('Mamun can access PCBA and operational modules', () => {
      assert.strictEqual(canAccessPage(mamunProfile, 'dashboard'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'pcba'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'pcba-process'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'iqc-pcba'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'esd'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'manpower'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'tasks'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'kpi'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'nc'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'capa'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'rca'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'complaints'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'quality-dev'), true);
      assert.strictEqual(canAccessPage(mamunProfile, 'docs'), true);
    });

    it('Mamun is STRICTLY BLOCKED from PCB & PCB Process & IQC PCB', () => {
      assert.strictEqual(canAccessPage(mamunProfile, 'pcb'), false);
      assert.strictEqual(canAccessPage(mamunProfile, 'pcb-process'), false);
      assert.strictEqual(canAccessPage(mamunProfile, 'iqc-pcb'), false);
    });

    it('Mamun is STRICTLY BLOCKED from MD Sir Report and all 8 child tabs', () => {
      const mdTabs: PageType[] = [
        'md-report',
        'md-report-summary',
        'md-report-pcb',
        'md-report-pcba',
        'md-report-smt',
        'md-report-mi',
        'md-report-trend',
        'md-report-action',
        'md-report-data',
      ];
      for (const tab of mdTabs) {
        assert.strictEqual(canAccessPage(mamunProfile, tab), false, `Mamun must not access ${tab}`);
      }
    });

    it('Mamun is STRICTLY BLOCKED from User Management and Security Settings', () => {
      assert.strictEqual(canAccessPage(mamunProfile, 'users'), false);
      assert.strictEqual(canAccessPage(mamunProfile, 'settings'), false);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION B: SIDEBAR NAVIGATION VISIBILITY & DIRECT URL ROUTE GUARD
  // --------------------------------------------------------------------------
  describe('B. Sidebar Navigation & URL Guard Parity', () => {
    it('Sidebar filters out PCB for Tajedul and Mamun', () => {
      const tajedulPcbVisible = canAccessPage(tajedulProfile, 'pcb');
      const mamunPcbVisible = canAccessPage(mamunProfile, 'pcb');
      assert.strictEqual(tajedulPcbVisible, false);
      assert.strictEqual(mamunPcbVisible, false);
    });

    it('Sidebar filters out PCBA for Alamgir', () => {
      const alamgirPcbaVisible = canAccessPage(alamgirProfile, 'pcba');
      assert.strictEqual(alamgirPcbaVisible, false);
    });

    it('Sidebar filters out MD Sir Report for ALL regular users', () => {
      assert.strictEqual(canAccessPage(tajedulProfile, 'md-report'), false);
      assert.strictEqual(canAccessPage(alamgirProfile, 'md-report'), false);
      assert.strictEqual(canAccessPage(mamunProfile, 'md-report'), false);
    });

    it('Sidebar filters out User Management & Settings for ALL regular users', () => {
      assert.strictEqual(canAccessPage(tajedulProfile, 'users'), false);
      assert.strictEqual(canAccessPage(alamgirProfile, 'users'), false);
      assert.strictEqual(canAccessPage(mamunProfile, 'users'), false);
      assert.strictEqual(canAccessPage(tajedulProfile, 'settings'), false);
      assert.strictEqual(canAccessPage(alamgirProfile, 'settings'), false);
      assert.strictEqual(canAccessPage(mamunProfile, 'settings'), false);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION E: NEGATIVE SECURITY TESTS
  // --------------------------------------------------------------------------
  describe('E. Negative Security Tests (Adversarial Identities & Legacy Accounts)', () => {
    it('Legacy Admin UID q7aDnafVuBSYc8B0VipuXPOlenv1 receives ZERO admin privileges', () => {
      const legacyProfile: UserProfile = {
        uid: 'q7aDnafVuBSYc8B0VipuXPOlenv1',
        email: 'atiqur40736@waltonbd.com',
        role: 'admin',
        status: 'active',
        name: 'Legacy Admin Attempt',
      };
      assert.strictEqual(isAdminProfile(legacyProfile), false);
      assert.strictEqual(canAccessPage(legacyProfile, 'users'), false);
      assert.strictEqual(canAccessPage(legacyProfile, 'settings'), false);
      assert.strictEqual(canAccessPage(legacyProfile, 'md-report'), false);
    });

    it('qa.admin@waltonbd.com receives ZERO admin privileges', () => {
      const qaAdminProfile: UserProfile = {
        uid: 'attacker_uid_qa_admin',
        email: 'qa.admin@waltonbd.com',
        role: 'admin',
        status: 'active',
        name: 'QA Admin Impostor',
      };
      assert.strictEqual(isAdminProfile(qaAdminProfile), false);
      assert.strictEqual(canAccessPage(qaAdminProfile, 'users'), false);
      assert.strictEqual(canAccessPage(qaAdminProfile, 'settings'), false);
    });

    it('khalid52190@waltonbd.com receives ZERO admin privileges', () => {
      const khalidProfile: UserProfile = {
        uid: 'uid_khalid_52190',
        email: 'khalid52190@waltonbd.com',
        role: 'admin',
        status: 'active',
        name: 'Khalid Impostor',
      };
      assert.strictEqual(isAdminProfile(khalidProfile), false);
      assert.strictEqual(canAccessPage(khalidProfile, 'users'), false);
      assert.strictEqual(canAccessPage(khalidProfile, 'md-report'), false);
    });

    it('auditor.ext@waltonbd.com receives ZERO admin privileges', () => {
      const auditorProfile: UserProfile = {
        uid: 'uid_auditor_ext',
        email: 'auditor.ext@waltonbd.com',
        role: 'admin',
        status: 'active',
        name: 'External Auditor',
      };
      assert.strictEqual(isAdminProfile(auditorProfile), false);
      assert.strictEqual(canAccessPage(auditorProfile, 'users'), false);
      assert.strictEqual(canAccessPage(auditorProfile, 'md-report'), false);
    });

    it('Unknown authenticated external account receives ZERO access to internal QM modules', () => {
      const unknownUser: UserProfile = {
        uid: 'random_external_uid_9999',
        email: 'attacker@gmail.com',
        role: 'viewer',
        status: 'active',
        name: 'External Attacker',
      };
      assert.strictEqual(isAdminProfile(unknownUser), false);
      assert.strictEqual(canAccessPage(unknownUser, 'pcb'), false);
      assert.strictEqual(canAccessPage(unknownUser, 'pcba'), false);
      assert.strictEqual(canAccessPage(unknownUser, 'md-report'), false);
      assert.strictEqual(canAccessPage(unknownUser, 'users'), false);
      assert.strictEqual(canAccessPage(unknownUser, 'settings'), false);
    });

    it('Unauthenticated Visitor (null profile) can ONLY access public home showcase', () => {
      assert.strictEqual(canAccessPage(null, 'home'), true);
      assert.strictEqual(canAccessPage(null, 'dashboard'), false);
      assert.strictEqual(canAccessPage(null, 'pcb'), false);
      assert.strictEqual(canAccessPage(null, 'pcba'), false);
      assert.strictEqual(canAccessPage(null, 'md-report'), false);
      assert.strictEqual(canAccessPage(null, 'users'), false);
      assert.strictEqual(canAccessPage(null, 'settings'), false);
    });

    it('Inactive employee account is completely locked out from all internal modules', () => {
      const inactiveTajedul: UserProfile = {
        ...tajedulProfile,
        status: 'inactive',
      };
      assert.strictEqual(canAccessPage(inactiveTajedul, 'home'), true);
      assert.strictEqual(canAccessPage(inactiveTajedul, 'dashboard'), false);
      assert.strictEqual(canAccessPage(inactiveTajedul, 'pcba'), false);
      assert.strictEqual(canAccessPage(inactiveTajedul, 'tasks'), false);
      assert.strictEqual(canAccessPage(inactiveTajedul, 'kpi'), false);
    });
  });
});
