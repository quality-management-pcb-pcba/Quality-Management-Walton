/**
 * =========================================================================================
 * @file test/storage.rules.test.ts
 * @description Unit Test Suite for Walton Quality Management Firebase Storage Security Rules
 * =========================================================================================
 *
 * HOW TO EXECUTE THIS TEST SUITE:
 * -------------------------------
 * Prerequisites:
 *   1. Node.js >= 18
 *   2. Java Runtime Environment (JRE >= 11) for the Firebase Emulator engine:
 *        - Debian/Ubuntu: sudo apt-get update && sudo apt-get install -y default-jre
 *        - macOS: brew install openjdk
 *   3. Install dependencies:
 *        npm install --save-dev @firebase/rules-unit-testing mocha tsx
 *
 * Execution Command:
 *   npx firebase emulators:exec --only storage "npx mocha -r tsx test/storage.rules.test.ts"
 * =========================================================================================
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ID = "quality-management-walton-test";
const STORAGE_BUCKET = `${PROJECT_ID}.appspot.com`;

describe("Walton Quality Management - Firebase Storage Rules Security Tests", () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    const rulesPath = path.resolve(__dirname, "../storage.rules");
    const rules = fs.readFileSync(rulesPath, "utf8");

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      storage: {
        rules,
        host: "127.0.0.1",
        port: 9199,
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearStorage();
  });

  // --------------------------------------------------------------------------
  // TEST SCENARIO 1: Anonymous Access (Unauthenticated)
  // --------------------------------------------------------------------------
  describe("1. Anonymous / Unauthenticated Access", () => {
    it("MUST REJECT unauthenticated file reads", async () => {
      const anonContext = testEnv.unauthenticatedContext();
      const storage = anonContext.storage(STORAGE_BUCKET);
      const fileRef = storage.ref("documents/SOP-01/procedure.pdf");

      await assertFails(fileRef.getBytes());
    });

    it("MUST REJECT unauthenticated file uploads", async () => {
      const anonContext = testEnv.unauthenticatedContext();
      const storage = anonContext.storage(STORAGE_BUCKET);
      const fileRef = storage.ref("uploads/anon_upload.pdf");

      const dummyPdf = Buffer.from("%PDF-1.4 test document");
      await assertFails(
        fileRef.put(dummyPdf, { contentType: "application/pdf" })
      );
    });
  });

  // --------------------------------------------------------------------------
  // TEST SCENARIO 2: Authorized Staff Uploads
  // --------------------------------------------------------------------------
  describe("2. Authorized Staff Uploads", () => {
    const staffContext = () =>
      testEnv.authenticatedContext("user_tajedul_36924", {
        email: "tajedul36924@waltonbd.com",
        email_verified: true,
      });

    it("MUST ALLOW authenticated staff to upload valid documents under 25 MiB", async () => {
      const storage = staffContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("iqc_evidence/IQC-2026-001/evidence.png");

      const dummyPng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      await assertSucceeds(
        fileRef.put(dummyPng, { contentType: "image/png" })
      );
    });

    it("MUST REJECT uploads exceeding the 25 MiB limit (> 26,214,400 bytes)", async () => {
      const storage = staffContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("uploads/large_file.pdf");

      // Simulate a buffer slightly exceeding 25 MiB (26,214,401 bytes)
      const oversizedBuffer = Buffer.alloc(26214401);
      await assertFails(
        fileRef.put(oversizedBuffer, { contentType: "application/pdf" })
      );
    });

    it("MUST REJECT zero-byte (empty) file uploads", async () => {
      const storage = staffContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("documents/empty.pdf");

      const emptyBuffer = Buffer.alloc(0);
      await assertFails(
        fileRef.put(emptyBuffer, { contentType: "application/pdf" })
      );
    });

    it("MUST REJECT disallowed MIME types (e.g. .exe, .sh, .html)", async () => {
      const storage = staffContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("documents/script.exe");

      const dummyExe = Buffer.from("MZ binary content");
      await assertFails(
        fileRef.put(dummyExe, { contentType: "application/x-msdownload" })
      );
    });

    it("MUST REJECT staff attempting to overwrite an existing file (resource != null)", async () => {
      // 1. First upload creates the file
      const storage = staffContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("documents/SOP-01/standard.pdf");
      const dummyPdf = Buffer.from("%PDF-1.4 initial version");
      await assertSucceeds(
        fileRef.put(dummyPdf, { contentType: "application/pdf" })
      );

      // 2. Second upload by staff to the exact same path MUST FAIL
      const secondPdf = Buffer.from("%PDF-1.4 modified version");
      await assertFails(
        fileRef.put(secondPdf, { contentType: "application/pdf" })
      );
    });

    it("MUST REJECT non-admin staff attempting to delete files", async () => {
      const storage = staffContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("iqc_evidence/IQC-2026-002/photo.jpg");
      const dummyJpg = Buffer.from([255, 216, 255, 224]);
      await assertSucceeds(
        fileRef.put(dummyJpg, { contentType: "image/jpeg" })
      );

      // Attempt to delete
      await assertFails(fileRef.delete());
    });
  });

  // --------------------------------------------------------------------------
  // TEST SCENARIO 3: Administrator Permissions & Strict Update Constraints
  // --------------------------------------------------------------------------
  describe("3. Administrator Permissions & Strict Updates", () => {
    // 3a. Verified designated admin UID with matching verified email
    const designatedAdminContext = () =>
      testEnv.authenticatedContext("q7aDnafVuBSYc8B0VipuXPOlenv1", {
        email: "atiqur40736@waltonbd.com",
        email_verified: true,
      });

    // 3b. Impostor admin: Matching UID, but UNVERIFIED email claim
    const unverifiedAdminContext = () =>
      testEnv.authenticatedContext("q7aDnafVuBSYc8B0VipuXPOlenv1", {
        email: "atiqur40736@waltonbd.com",
        email_verified: false,
      });

    // 3c. Impostor admin: Matching UID, but different/hijacked email
    const mismatchedAdminContext = () =>
      testEnv.authenticatedContext("q7aDnafVuBSYc8B0VipuXPOlenv1", {
        email: "attacker@external.com",
        email_verified: true,
      });

    it("MUST ALLOW verified designated administrator to update existing files with valid MIME and size", async () => {
      const adminStorage = designatedAdminContext().storage(STORAGE_BUCKET);
      const fileRef = adminStorage.ref("documents/SOP-01/governance.pdf");

      // Initial creation
      const initialPdf = Buffer.from("%PDF-1.4 revision 1");
      await assertSucceeds(
        fileRef.put(initialPdf, { contentType: "application/pdf" })
      );

      // Admin update of existing file
      const updatedPdf = Buffer.from("%PDF-1.4 revision 2 with amendments");
      await assertSucceeds(
        fileRef.put(updatedPdf, { contentType: "application/pdf" })
      );
    });

    it("MUST REJECT administrator updates if the update contains a DISALLOWED MIME type", async () => {
      const adminStorage = designatedAdminContext().storage(STORAGE_BUCKET);
      const fileRef = adminStorage.ref("documents/SOP-01/governance.pdf");

      // Initial creation with valid PDF
      const initialPdf = Buffer.from("%PDF-1.4 revision 1");
      await assertSucceeds(
        fileRef.put(initialPdf, { contentType: "application/pdf" })
      );

      // Admin attempt to update with an executable MIME type MUST FAIL
      const binaryPayload = Buffer.from("MZ payload");
      await assertFails(
        fileRef.put(binaryPayload, { contentType: "application/x-msdownload" })
      );
    });

    it("MUST REJECT administrator updates if the file size exceeds 25 MiB", async () => {
      const adminStorage = designatedAdminContext().storage(STORAGE_BUCKET);
      const fileRef = adminStorage.ref("documents/SOP-01/large_manual.pdf");

      // Initial creation
      const initialPdf = Buffer.from("%PDF-1.4 initial");
      await assertSucceeds(
        fileRef.put(initialPdf, { contentType: "application/pdf" })
      );

      // Admin attempt to update with > 25 MiB file MUST FAIL
      const oversizedBuffer = Buffer.alloc(26214401);
      await assertFails(
        fileRef.put(oversizedBuffer, { contentType: "application/pdf" })
      );
    });

    it("MUST ALLOW verified administrator to delete files", async () => {
      const adminStorage = designatedAdminContext().storage(STORAGE_BUCKET);
      const fileRef = adminStorage.ref("rca_evidence/RCA-99/temp_evidence.png");

      const dummyPng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      await assertSucceeds(
        fileRef.put(dummyPng, { contentType: "image/png" })
      );

      // Verified admin delete MUST SUCCEED
      await assertSucceeds(fileRef.delete());
    });

    it("MUST REJECT administrative delete when email_verified is FALSE", async () => {
      const storage = unverifiedAdminContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("capa_evidence/CAPA-01/doc.pdf");

      // Attempt delete as unverified UID
      await assertFails(fileRef.delete());
    });

    it("MUST REJECT administrative delete when email does NOT match approved address", async () => {
      const storage = mismatchedAdminContext().storage(STORAGE_BUCKET);
      const fileRef = storage.ref("capa_evidence/CAPA-01/doc.pdf");

      // Attempt delete as mismatched UID
      await assertFails(fileRef.delete());
    });
  });

  // --------------------------------------------------------------------------
  // TEST SCENARIO 4: Unapproved Root Folders
  // --------------------------------------------------------------------------
  describe("4. Unapproved Root Folders", () => {
    it("MUST REJECT uploads to unwhitelisted root folders (e.g. system_backup, users, root)", async () => {
      const staffContext = testEnv.authenticatedContext("user_tajedul_36924", {
        email: "tajedul36924@waltonbd.com",
        email_verified: true,
      });
      const storage = staffContext.storage(STORAGE_BUCKET);

      const invalidFolders = [
        "system_backups/dump.tar.gz",
        "passwords/keys.txt",
        "arbitrary_folder/file.pdf",
        "root_file.pdf",
      ];

      const dummyPdf = Buffer.from("%PDF-1.4 test");
      for (const targetPath of invalidFolders) {
        const fileRef = storage.ref(targetPath);
        await assertFails(
          fileRef.put(dummyPdf, { contentType: "application/pdf" })
        );
      }
    });
  });
});
