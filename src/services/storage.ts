import {
  db,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
  getBytes,
  getBlob,
  deleteObject,
  auth,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from './firebase';

export interface FileUploadResult {
  id?: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileSize: string;
  contentType?: string;
  uploadedAt: string;
  uploadedBy?: string;
  uploaderUid?: string;
  folder?: string;
}

/** Maximum allowed file size for Walton QMS uploads: 25 MiB (26,214,400 bytes) */
export const MAX_STORAGE_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/** Whitelisted MIME types matching Walton QMS Storage Rules */
export const ALLOWED_STORAGE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                         // .xls
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword',                                               // .doc
];

/**
 * Resolves accurate MIME type from filename extension if the browser provides generic application/octet-stream or empty string.
 */
export function resolveMimeType(fileName: string, detectedType?: string): string {
  if (detectedType && detectedType !== 'application/octet-stream' && detectedType.trim() !== '') {
    return detectedType.toLowerCase();
  }
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'txt':
      return 'text/plain';
    case 'csv':
      return 'text/csv';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    default:
      return detectedType || 'application/octet-stream';
  }
}

/**
 * Uploads a file to Firebase Cloud Storage and indexes it in Firestore collection 'uploaded_files'.
 * Requires an active Firebase Authentication session.
 *
 * @param file - The HTML File object to upload
 * @param folder - Folder path prefix (e.g. 'documents', 'rca_evidence', 'iqc_evidence', 'nc_evidence')
 * @param customName - Optional custom filename or identifier
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folder: string = 'uploads',
  customName?: string
): Promise<FileUploadResult> {
  // 1. Enforce active authentication
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: You must be logged in to Walton Quality Management to upload files.');
  }

  // 2. Validate file presence and non-zero size
  if (!file || file.size <= 0) {
    throw new Error('Invalid file: Empty (0-byte) files cannot be uploaded.');
  }

  // 3. Client-side size restriction (25 MiB max)
  if (file.size > MAX_STORAGE_FILE_SIZE_BYTES) {
    throw new Error(`File size limit exceeded: Maximum allowed size is 25 MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
  }

  // 4. Resolve and validate MIME type
  const resolvedMime = resolveMimeType(file.name, file.type);
  if (!ALLOWED_STORAGE_MIME_TYPES.includes(resolvedMime)) {
    throw new Error(`Unsupported file format (${resolvedMime}). Allowed formats: PDF, PNG, JPEG, WEBP, CSV, TXT, Excel (.xlsx, .xls), Word (.docx, .doc).`);
  }

  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const timestamp = Date.now();
  const safeName = (customName || file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${cleanFolder}/${timestamp}_${safeName}`;

  const uploaderUid = currentUser.uid;
  const uploaderEmail = currentUser.email || 'unknown';

  const ref = storageRef(storage, storagePath);

  // Set explicit metadata to ensure correct Storage Rule matching
  const metadata = {
    contentType: resolvedMime,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      uploaderUid,
      uploaderEmail,
    },
  };

  const uploadResult = await uploadBytes(ref, file, metadata);
  const fileUrl = await getDownloadURL(uploadResult.ref);
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

  const fileDoc = {
    fileName: file.name,
    fileUrl,
    storagePath,
    fileSize: sizeMb,
    contentType: resolvedMime,
    folder: cleanFolder,
    uploaderUid,
    uploaderEmail,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  };

  try {
    if (db) {
      await addDoc(collection(db, 'uploaded_files'), fileDoc);
    }
  } catch (err) {
    console.warn('Could not index uploaded file in Firestore:', err);
  }

  return {
    fileName: file.name,
    fileUrl,
    storagePath,
    fileSize: sizeMb,
    contentType: resolvedMime,
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploaderEmail,
    uploaderUid,
    folder: cleanFolder,
  };
}

/**
 * Downloads a confidential file directly from Cloud Storage via the Firebase Storage SDK as a Blob.
 * Validates active authentication against Firebase Storage Security Rules on each request.
 *
 * @param storagePath - The Cloud Storage object path (e.g. 'documents/QM-SOP-01/1729416000000_doc.pdf')
 */
export async function downloadBlobFromStorage(storagePath: string): Promise<Blob> {
  if (!auth.currentUser) {
    throw new Error('Authentication required: You must be logged in to access protected quality documents.');
  }
  const ref = storageRef(storage, storagePath);
  return await getBlob(ref);
}

/**
 * Downloads a file as an authenticated Blob and initiates a browser download without exposing public tokens.
 */
export async function downloadSecureFileAsBlob(storagePath: string, downloadFileName: string): Promise<void> {
  const blob = await downloadBlobFromStorage(storagePath);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = downloadFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

/**
 * Deletes a file from Firebase Cloud Storage by its storage path.
 * Must be executed by an authorized Walton Quality Administrator.
 */
export async function deleteFileFromFirebaseStorage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  const ref = storageRef(storage, storagePath);
  await deleteObject(ref);
}

/**
 * Fetches all indexed uploaded files from Firestore, with fallback to document SOPs and IQC reports.
 */
export async function getAllUploadedFiles(): Promise<FileUploadResult[]> {
  const list: FileUploadResult[] = [];
  try {
    if (db) {
      const snap = await getDocs(collection(db, 'uploaded_files'));
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          fileName: d.fileName || 'Untitled File',
          fileUrl: d.fileUrl || '',
          storagePath: d.storagePath || '',
          fileSize: d.fileSize || '1.0 MB',
          contentType: d.contentType || 'application/octet-stream',
          uploadedAt: d.createdAt || (d.uploadedAt || new Date().toISOString()),
          uploadedBy: d.uploaderEmail || '',
          uploaderUid: d.uploaderUid || '',
          folder: d.folder || 'uploads',
        });
      });
    }
  } catch (err) {
    console.warn('Could not fetch uploaded files from Firestore:', err);
  }

  // Also include files uploaded under documents SOP collection
  try {
    if (db) {
      const docSnap = await getDocs(collection(db, 'documents'));
      docSnap.forEach((ds) => {
        const d = ds.data();
        if (d.fileUrl || d.storagePath || d.fileName) {
          const exists = list.some((item) => item.fileUrl && item.fileUrl === d.fileUrl);
          if (!exists) {
            list.push({
              id: ds.id,
              fileName: d.fileName || `${d.code || 'SOP'}.pdf`,
              fileUrl: d.fileUrl || '',
              storagePath: d.storagePath || `documents/${d.code}`,
              fileSize: d.fileSize || '1.4 MB',
              contentType: 'application/pdf',
              uploadedAt: d.createdAt || d.effectiveDate || new Date().toISOString(),
              uploadedBy: d.uploadedBy || d.owner || '',
              uploaderUid: d.uploadedByUid || '',
              folder: 'documents',
            });
          }
        }
      });
    }
  } catch {}

  return list;
}

/**
 * Real-time listener for uploaded files across the app
 */
export function subscribeUploadedFiles(
  callback: (files: FileUploadResult[]) => void
): () => void {
  try {
    if (db) {
      let isUnsubscribed = false;
      const unsubscribe = onSnapshot(
        collection(db, 'uploaded_files'),
        async () => {
          if (!isUnsubscribed) {
            const all = await getAllUploadedFiles();
            callback(all);
          }
        },
        () => {
          if (!isUnsubscribed) {
            getAllUploadedFiles().then(callback);
          }
        }
      );

      return () => {
        isUnsubscribed = true;
        unsubscribe();
      };
    }
  } catch {}

  getAllUploadedFiles().then(callback);
  return () => {};
}

