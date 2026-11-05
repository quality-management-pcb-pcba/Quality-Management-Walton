/**
 * =========================================================================================
 * @file test/firestore.rules.test.ts
 * @description Unit Test Suite for Walton Quality Management Firestore Draft Security Rules
 * =========================================================================================
 *
 * Verifies the 1 Admin + 3 Users access matrix, plant separation (PCB vs PCBA),
 * IQC material isolation, anti-self-privilege escalation, and visitor restrictions.
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ID = "walton-qm-firestore-test";

describe("Walton Quality Management - Firestore Security Rules Unit Tests", () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    const rulesPath = path.resolve(__dirname, "../firestore.rules.draft");
    const rules = fs.readFileSync(rulesPath, "utf8");

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();

      // Seed verified user profile documents with status: 'active'
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();

        // 1. Admin Profile
        await db.doc("users/EqqAbCPpNnSuyvXyjzYc63UaI173").set({
          uid: "EqqAbCPpNnSuyvXyjzYc63UaI173",
          email: "qm.pcba26@gmail.com",
          name: "Md. Atiqur Rahman",
          role: "admin",
          status: "active",
          allowedSections: ["ALL"],
          excludedSections: [],
        });

        // 2. User 01 - Tajedul Islam (PCBA active, PCB excluded)
        await db.doc("users/GzeuJVQenDNNCoauo3iWBH8EZZO2").set({
          uid: "GzeuJVQenDNNCoauo3iWBH8EZZO2",
          email: "tajedul36924@waltonbd.com",
          name: "Tajedul Islam",
          role: "qa_staff",
          status: "active",
          allowedSections: ["PCBA", "IQC_PCBA", "SMT", "MI", "ESD", "TASKS", "KPI", "NCR", "CAPA", "RCA", "COMPLAINTS", "DOCS", "MANPOWER", "DASHBOARD"],
          excludedSections: ["MD_REPORT", "PCB", "PCB_PROCESS", "IQC_PCB"],
        });

        // 3. User 02 - Md. Alamgir Hossain (PCB active, PCBA excluded)
        await db.doc("users/1Vl4LC50AUYh7nIuht0l2Te0kLc2").set({
          uid: "1Vl4LC50AUYh7nIuht0l2Te0kLc2",
          email: "alamgir.pcb@waltonbd.com",
          name: "Md. Alamgir Hossain",
          role: "qa_staff",
          status: "active",
          allowedSections: ["PCB", "PCB_PROCESS", "IQC_PCB", "ESD", "TASKS", "KPI", "NCR", "CAPA", "RCA", "COMPLAINTS", "DOCS", "MANPOWER", "DASHBOARD"],
          excludedSections: ["MD_REPORT", "PCBA", "PCBA_PROCESS", "IQC_PCBA", "SMT", "MI"],
        });

        // 4. User 03 - Md. Mamun Hossen (PCBA active, PCB excluded)
        await db.doc("users/GxbM1WUklKRg6wNXeNLBw8qZLKS2").set({
          uid: "GxbM1WUklKRg6wNXeNLBw8qZLKS2",
          email: "mamun.pcba@waltonbd.com",
          name: "Md. Mamun Hossen",
          role: "qa_staff",
          status: "active",
          allowedSections: ["PCBA", "IQC_PCBA", "SMT", "MI", "ESD", "TASKS", "KPI", "NCR", "CAPA", "RCA", "COMPLAINTS", "DOCS", "MANPOWER", "DASHBOARD"],
          excludedSections: ["MD_REPORT", "PCB", "PCB_PROCESS", "IQC_PCB"],
        });

        // Sample plant records
        await db.doc("pcb_records/sample-pcb-1").set({
          sheet: "visual",
          date: "2026-11-01",
          model: "Model-X",
        });

        await db.doc("pcba_reports/sample-pcba-1").set({
          reportNo: "PCBA-2026-001",
          date: "2026-11-01",
          yield: 99.2,
        });

        await db.doc("iqc_reports/sample-iqc-pcb").set({
          reportNo: "IQC-PCB-01",
          inspDate: "2026-11-01",
          material: "PCB",
          supplier: "Walton PCB Plant",
          finalResult: "Accept",
        });

        await db.doc("iqc_reports/sample-iqc-pcba").set({
          reportNo: "IQC-PCBA-01",
          inspDate: "2026-11-01",
          material: "Component",
          supplier: "Supplier-A",
          finalResult: "Accept",
        });

        await db.doc("master_data/landing_kpi_stats").set({
          totalHeadcount: 31,
          totalYield: 98.6,
        });
      });
    }
  });

  // --------------------------------------------------------------------------
  // SCENARIO 1: Admin Access
  // --------------------------------------------------------------------------
  describe("1. Admin Access (Md. Atiqur Rahman)", () => {
    const adminCtx = () =>
      testEnv.authenticatedContext("EqqAbCPpNnSuyvXyjzYc63UaI173", {
        email: "qm.pcba26@gmail.com",
        email_verified: true,
      });

    it("Admin can read both PCB and PCBA records", async () => {
      const db = adminCtx().firestore();
      await assertSucceeds(db.doc("pcb_records/sample-pcb-1").get());
      await assertSucceeds(db.doc("pcba_reports/sample-pcba-1").get());
    });

    it("Admin can delete records", async () => {
      const db = adminCtx().firestore();
      await assertSucceeds(db.doc("pcb_records/sample-pcb-1").delete());
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO 2: Tajedul Islam (User 01 - PCBA Scope, PCB Excluded)
  // --------------------------------------------------------------------------
  describe("2. User 01 Access (Tajedul Islam)", () => {
    const tajedulCtx = () =>
      testEnv.authenticatedContext("GzeuJVQenDNNCoauo3iWBH8EZZO2", {
        email: "tajedul36924@waltonbd.com",
        email_verified: true,
      });

    it("Tajedul CAN read PCBA reports", async () => {
      const db = tajedulCtx().firestore();
      await assertSucceeds(db.doc("pcba_reports/sample-pcba-1").get());
    });

    it("Tajedul CANNOT read Bare Board PCB records (MUST FAIL)", async () => {
      const db = tajedulCtx().firestore();
      await assertFails(db.doc("pcb_records/sample-pcb-1").get());
    });

    it("Tajedul CAN read PCBA component IQC reports", async () => {
      const db = tajedulCtx().firestore();
      await assertSucceeds(db.doc("iqc_reports/sample-iqc-pcba").get());
    });

    it("Tajedul CANNOT read Bare Board PCB IQC reports (MUST FAIL)", async () => {
      const db = tajedulCtx().firestore();
      await assertFails(db.doc("iqc_reports/sample-iqc-pcb").get());
    });

    it("Tajedul CANNOT delete records (MUST FAIL)", async () => {
      const db = tajedulCtx().firestore();
      await assertFails(db.doc("pcba_reports/sample-pcba-1").delete());
    });

    it("Tajedul CANNOT escalate own privileges in users collection (MUST FAIL)", async () => {
      const db = tajedulCtx().firestore();
      await assertFails(
        db.doc("users/GzeuJVQenDNNCoauo3iWBH8EZZO2").update({
          role: "admin",
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO 3: Md. Alamgir Hossain (User 02 - PCB Scope, PCBA Excluded)
  // --------------------------------------------------------------------------
  describe("3. User 02 Access (Md. Alamgir Hossain)", () => {
    const alamgirCtx = () =>
      testEnv.authenticatedContext("1Vl4LC50AUYh7nIuht0l2Te0kLc2", {
        email: "alamgir.pcb@waltonbd.com",
        email_verified: true,
      });

    it("Alamgir CAN read Bare Board PCB records", async () => {
      const db = alamgirCtx().firestore();
      await assertSucceeds(db.doc("pcb_records/sample-pcb-1").get());
    });

    it("Alamgir CANNOT read PCBA reports (MUST FAIL)", async () => {
      const db = alamgirCtx().firestore();
      await assertFails(db.doc("pcba_reports/sample-pcba-1").get());
    });

    it("Alamgir CAN read Bare Board PCB IQC reports", async () => {
      const db = alamgirCtx().firestore();
      await assertSucceeds(db.doc("iqc_reports/sample-iqc-pcb").get());
    });

    it("Alamgir CANNOT read PCBA component IQC reports (MUST FAIL)", async () => {
      const db = alamgirCtx().firestore();
      await assertFails(db.doc("iqc_reports/sample-iqc-pcba").get());
    });

    it("Alamgir CANNOT delete records (MUST FAIL)", async () => {
      const db = alamgirCtx().firestore();
      await assertFails(db.doc("pcb_records/sample-pcb-1").delete());
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO 4: Md. Mamun Hossen (User 03 - PCBA Scope, PCB Excluded)
  // --------------------------------------------------------------------------
  describe("4. User 03 Access (Md. Mamun Hossen)", () => {
    const mamunCtx = () =>
      testEnv.authenticatedContext("GxbM1WUklKRg6wNXeNLBw8qZLKS2", {
        email: "mamun.pcba@waltonbd.com",
        email_verified: true,
      });

    it("Mamun CAN read PCBA reports", async () => {
      const db = mamunCtx().firestore();
      await assertSucceeds(db.doc("pcba_reports/sample-pcba-1").get());
    });

    it("Mamun CANNOT read Bare Board PCB records (MUST FAIL)", async () => {
      const db = mamunCtx().firestore();
      await assertFails(db.doc("pcb_records/sample-pcb-1").get());
    });

    it("Mamun CANNOT delete records (MUST FAIL)", async () => {
      const db = mamunCtx().firestore();
      await assertFails(db.doc("pcba_reports/sample-pcba-1").delete());
    });
  });

  // --------------------------------------------------------------------------
  // SCENARIO 5: Visitor Access (Unauthenticated)
  // --------------------------------------------------------------------------
  describe("5. Visitor Access", () => {
    const visitorCtx = () => testEnv.unauthenticatedContext();

    it("Visitor CAN read public landing_kpi_stats", async () => {
      const db = visitorCtx().firestore();
      await assertSucceeds(db.doc("master_data/landing_kpi_stats").get());
    });

    it("Visitor CANNOT read confidential manufacturing reports (MUST FAIL)", async () => {
      const db = visitorCtx().firestore();
      await assertFails(db.doc("pcba_reports/sample-pcba-1").get());
      await assertFails(db.doc("pcb_records/sample-pcb-1").get());
      await assertFails(db.doc("iqc_reports/sample-iqc-pcba").get());
      await assertFails(db.doc("users/EqqAbCPpNnSuyvXyjzYc63UaI173").get());
    });
  });
});
