import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  UploadCloud,
  Search,
  ExternalLink,
  Calendar,
  Mail,
  User,
  Eye,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  File,
  FileCheck,
  ChevronRight,
  X,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getAllEmployees, subscribeEmployees } from '../../services/userService';
import { getAllUploadedFiles, subscribeUploadedFiles, FileUploadResult } from '../../services/storage';

interface AdminDashboardViewProps {
  currentUserId?: string;
  currentUserEmail?: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUserId = 'q7aDnafVuBSYc8B0VipuXPOlenv1',
  currentUserEmail = 'qm.pcba26@gmail.com',
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [files, setFiles] = useState<FileUploadResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Load Firestore users and uploaded files
  useEffect(() => {
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [userList, fileList] = await Promise.all([
          getAllEmployees(),
          getAllUploadedFiles(),
        ]);
        setUsers(userList);
        setFiles(fileList);
      } catch (err) {
        console.warn('Error loading admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to realtime updates
    const unsubUsers = subscribeEmployees((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setUsers(liveUsers);
      }
    });

    const unsubFiles = subscribeUploadedFiles((liveFiles) => {
      if (liveFiles) {
        setFiles(liveFiles);
      }
    });

    return () => {
      unsubUsers();
      unsubFiles();
    };
  }, []);

  // Compute file counts map per user (by email or uid)
  const userFileCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      counts[u.uid] = 0;
      if (u.email) counts[u.email.toLowerCase()] = 0;
    });

    files.forEach((f) => {
      if (f.uploaderUid && counts[f.uploaderUid] !== undefined) {
        counts[f.uploaderUid] = (counts[f.uploaderUid] || 0) + 1;
      } else if (f.uploadedBy) {
        const emailLower = f.uploadedBy.toLowerCase();
        counts[emailLower] = (counts[emailLower] || 0) + 1;
      }
    });

    return counts;
  }, [users, files]);

  // Helper to format creation dates nicely
  const formatAccountDate = (val: any) => {
    if (!val) return '2026-08-01';
    if (typeof val === 'string') {
      return val.slice(0, 10);
    }
    if (val && typeof val === 'object' && 'seconds' in val) {
      return new Date(val.seconds * 1000).toISOString().slice(0, 10);
    }
    if (val && typeof val.toDate === 'function') {
      return val.toDate().toISOString().slice(0, 10);
    }
    return '2026-08-01';
  };

  // Filtered users for search input
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.employeeId?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Files belonging to the currently selected user
  const selectedUserFiles = useMemo(() => {
    if (!selectedUser) return [];
    const uid = selectedUser.uid;
    const emailLower = selectedUser.email?.toLowerCase();

    return files.filter((f) => {
      if (f.uploaderUid && f.uploaderUid === uid) return true;
      if (f.uploadedBy && emailLower && f.uploadedBy.toLowerCase() === emailLower) return true;
      return false;
    });
  }, [selectedUser, files]);

  return (
    <div id="page-admin-dashboard" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Admin Indicator Banner */}
      <div className="bg-gradient-to-r from-[#0d1730] via-[#14234b] to-[#1e3a8a] text-white p-6 rounded-2xl shadow-md border border-[#233876] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Admin Dashboard</span>
            </span>
            <span className="text-xs font-mono text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
              ID: {currentUserId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
            Quality Management System — Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Live overview of all registered users in Cloud Firestore, account creation dates, and uploaded document/evidence files.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/15 text-center min-w-[110px]">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{users.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/15 text-center min-w-[110px]">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Files</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-0.5">{files.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content: Users List & Inspector Modal */}
      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h2 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2563eb]" />
              <span>Firestore Registered Users</span>
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Click on any user row to inspect their uploaded files in Firebase Storage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search by email, name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-xs font-medium text-[#0d1730] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={() => {
                setIsLoading(true);
                Promise.all([getAllEmployees(), getAllUploadedFiles()]).then(([u, f]) => {
                  setUsers(u);
                  setFiles(f);
                  setIsLoading(false);
                });
              }}
              title="Refresh database records"
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-[#cbd5e1] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0f172a] text-white border-b border-slate-700">
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] w-12 text-center">#</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">User Email & Name</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">User ID (UID)</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">Account Created</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] text-center">Uploaded Files</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] text-center">Role / Status</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No users matching &quot;{searchQuery}&quot; found in Firestore.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const uploadCount =
                    userFileCounts[u.uid] ||
                    (u.email ? userFileCounts[u.email.toLowerCase()] : 0) ||
                    0;
                  const isCurrent = u.uid === currentUserId;

                  return (
                    <tr
                      key={u.uid}
                      onClick={() => setSelectedUser(u)}
                      className={`hover:bg-blue-50/60 cursor-pointer transition-colors group ${
                        selectedUser?.uid === u.uid ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 uppercase text-xs border border-slate-300">
                            {u.name ? u.name.slice(0, 2) : u.email.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#0d1730] flex items-center gap-1.5">
                              <span>{u.email}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold text-[9px] uppercase border border-rose-200">
                                  You (Admin)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748b]">
                              {u.name || 'Walton Staff'} {u.department ? `· ${u.department}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {u.uid}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatAccountDate(u.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-full text-xs ${
                            uploadCount > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{uploadCount} file{uploadCount === 1 ? '' : 's'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {u.role || 'qa_staff'}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            title={`Status: ${u.status || 'active'}`}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#2563eb] hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 ml-auto group-hover:underline"
                        >
                          <span>View Files</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected User Files Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#cbd5e1] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0d1730] text-white flex items-center justify-between border-b-[3px] border-[#e35b2a]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2563eb] rounded-xl text-white">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Uploaded Files — {selectedUser.email}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    User UID: {selectedUser.uid}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Files list */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-[#64748b] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Account Owner: <strong>{selectedUser.name || 'Staff Member'}</strong></span>
                </div>
                <div>
                  Total Files: <strong>{selectedUserFiles.length}</strong>
                </div>
              </div>

              {selectedUserFiles.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#0d1730]">No files uploaded yet</p>
                  <p className="text-xs text-[#64748b] mt-1 max-w-sm mx-auto">
                    This user has not uploaded any SOP documents, IQC reports, or quality inspection attachments to Firebase Storage.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedUserFiles.map((file, fIdx) => (
                    <div
                      key={file.id || fIdx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0 border border-blue-200">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0d1730] truncate">{file.fileName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-0.5">
                            <span className="font-mono">{file.fileSize || '1.2 MB'}</span>
                            <span>•</span>
                            <span>{file.folder || 'documents'}</span>
                            <span>•</span>
                            <span>{file.uploadedAt ? file.uploadedAt.slice(0, 10) : 'Recent'}</span>
                          </div>
                        </div>
                      </div>

                      {file.fileUrl ? (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="shrink-0 text-slate-400 text-xs italic">
                          Stored locally
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
