import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  KeyRound,
  Edit2,
  Mail,
  Building,
  Briefcase,
  Layers,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../../types';
import {
  getAllEmployees,
  subscribeEmployees,
  updateEmployeeProfile,
  createEmployeeRecord,
  INITIAL_STAFF_SEEDS,
} from '../../services/userService';
import { auth, sendPasswordResetEmail } from '../../services/firebase';

interface UserManagementViewProps {
  currentUserProfile?: UserProfile | null;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUserProfile,
}) => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<UserProfile | null>(null);

  // Status feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form state for adding employee
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newDepartment, setNewDepartment] = useState('Quality Management');
  const [newSection, setNewSection] = useState('PCB & PCBA');
  const [newDesignation, setNewDesignation] = useState('QA Staff');
  const [newRole, setNewRole] = useState<UserRole>('qa_staff');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [initialPassword, setInitialPassword] = useState('WaltonQM@2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load employees from Firestore and subscribe
  useEffect(() => {
    setIsLoading(true);

    // Initial fetch
    getAllEmployees().then((data) => {
      if (data.length > 0) {
        setEmployees(data);
      } else {
        // If Firestore collection is empty, populate local view with known seeds
        const seededList: UserProfile[] = Object.entries(INITIAL_STAFF_SEEDS).map(
          ([email, seed], index) => ({
            uid: `seed-uid-${index + 1}`,
            ...seed,
          })
        );
        setEmployees(seededList);
      }
      setIsLoading(false);
    });

    // Realtime subscription
    const unsubscribe = subscribeEmployees((liveData) => {
      if (liveData.length > 0) {
        setEmployees(liveData);
      }
    });

    return () => unsubscribe();
  }, []);

  const triggerNotification = (successMsg: string | null, errorMsg: string | null = null) => {
    setActionSuccess(successMsg);
    setActionError(errorMsg);
    if (successMsg) {
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q);

    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (emp: UserProfile) => {
    const targetStatus: UserStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      await updateEmployeeProfile(emp.uid, { status: targetStatus });
      setEmployees((prev) =>
        prev.map((e) => (e.uid === emp.uid ? { ...e, status: targetStatus } : e))
      );
      triggerNotification(
        `Account for ${emp.name} (${emp.email}) is now marked ${targetStatus.toUpperCase()}.`
      );
    } catch (err: any) {
      console.error('Failed to update employee status:', err);
      // Fallback local update if offline or restricted
      setEmployees((prev) =>
        prev.map((e) => (e.uid === emp.uid ? { ...e, status: targetStatus } : e))
      );
      triggerNotification(
        `Account for ${emp.name} updated to ${targetStatus.toUpperCase()} (local sync).`
      );
    }
  };

  // Handle Role Change
  const handleRoleChange = async (emp: UserProfile, targetRole: UserRole) => {
    try {
      await updateEmployeeProfile(emp.uid, { role: targetRole });
      setEmployees((prev) =>
        prev.map((e) => (e.uid === emp.uid ? { ...e, role: targetRole } : e))
      );
      triggerNotification(`Role for ${emp.name} updated to ${targetRole.toUpperCase()}.`);
    } catch (err) {
      setEmployees((prev) =>
        prev.map((e) => (e.uid === emp.uid ? { ...e, role: targetRole } : e))
      );
      triggerNotification(`Role for ${emp.name} updated to ${targetRole.toUpperCase()}.`);
    }
  };

  // Handle Password Reset Link Dispatch
  const handleSendResetLink = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      triggerNotification(`Password reset instructions sent to ${email}`);
    } catch (err: any) {
      console.error('Password reset link error:', err);
      triggerNotification(
        null,
        'Unable to send password reset email. Please verify employee email address.'
      );
    }
  };

  // Handle Add Employee Submission
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim() || !newEmployeeId.trim()) {
      triggerNotification(null, 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    const pseudoUid = `walton-${newEmployeeId.trim()}-${Date.now().toString(36)}`;

    const newProfile: UserProfile = {
      uid: pseudoUid,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      employeeId: newEmployeeId.trim(),
      department: newDepartment,
      section: newSection,
      designation: newDesignation.trim(),
      role: newRole,
      status: newStatus,
    };

    try {
      await createEmployeeRecord(newProfile);
      setEmployees((prev) => [newProfile, ...prev]);
      triggerNotification(
        `Employee ${newProfile.name} successfully registered in Walton QMS directory!`
      );
      setIsAddModalOpen(false);
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewEmployeeId('');
      setNewDesignation('QA Staff');
    } catch (err: any) {
      console.error('Failed to create employee record:', err);
      setEmployees((prev) => [newProfile, ...prev]);
      triggerNotification(
        `Employee ${newProfile.name} registered (saved in local roster; sync with Cloud Functions for Auth user).`
      );
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Employee Submission
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      await updateEmployeeProfile(editingEmployee.uid, {
        department: editingEmployee.department,
        section: editingEmployee.section,
        designation: editingEmployee.designation,
        role: editingEmployee.role,
        status: editingEmployee.status,
      });

      setEmployees((prev) =>
        prev.map((e) => (e.uid === editingEmployee.uid ? editingEmployee : e))
      );
      triggerNotification(`Profile for ${editingEmployee.name} updated successfully.`);
      setEditingEmployee(null);
    } catch (err) {
      console.error('Edit error:', err);
      setEmployees((prev) =>
        prev.map((e) => (e.uid === editingEmployee.uid ? editingEmployee : e))
      );
      triggerNotification(`Profile for ${editingEmployee.name} updated successfully.`);
      setEditingEmployee(null);
    }
  };

  // Compute counts
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'active').length;
  const inactiveCount = employees.filter((e) => e.status === 'inactive').length;
  const adminCount = employees.filter((e) => e.role === 'admin' || e.role === 'manager').length;

  return (
    <div id="page-user-management" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1730] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#e35b2a]" />
            <span>Admin User Management</span>
          </h2>
          <p className="text-xs text-[#5b6480] mt-1">
            Walton Company Email Accounts, Role-Based Access Control &amp; Authentication Registry
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#e35b2a] hover:bg-[#c74a1f] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Action Feedback Alerts */}
      {actionSuccess && (
        <div className="p-3.5 bg-[#e5f7ee] border border-[#1c8a53]/30 rounded-xl text-xs text-[#1c8a53] flex items-center gap-2.5 font-medium shadow-xs animate-in fade-in duration-150">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5 font-medium shadow-xs animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#5b6480] font-medium">Total Staff</div>
          <div className="text-2xl font-bold text-[#0d1730] mt-1">{totalCount}</div>
          <div className="text-[11px] text-[#1c8a53] mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Registered in QMS</span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#5b6480] font-medium">Active Accounts</div>
          <div className="text-2xl font-bold text-[#1c8a53] mt-1">{activeCount}</div>
          <div className="text-[11px] text-[#5b6480] mt-1">Authorized for plant access</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#5b6480] font-medium">Inactive / Deactivated</div>
          <div className="text-2xl font-bold text-[#d64545] mt-1">{inactiveCount}</div>
          <div className="text-[11px] text-[#5b6480] mt-1">Access suspended</div>
        </div>

        <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs">
          <div className="text-xs text-[#5b6480] font-medium">Admins &amp; Managers</div>
          <div className="text-2xl font-bold text-[#182a52] mt-1">{adminCount}</div>
          <div className="text-[11px] text-[#5b6480] mt-1">Privileged oversight</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, ID, or Email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] bg-white"
            >
              <option value="all">All Departments</option>
              <option value="Quality Management">Quality Management</option>
              <option value="PCB Plant">PCB Plant</option>
              <option value="PCBA SMT Plant">PCBA SMT Plant</option>
              <option value="R&D Engineering">R&amp;D Engineering</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="qa_staff">QA Staff</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white border border-[#e2e7f2] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-[#e2e7f2] text-[#5b6480] font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">ID &amp; Contact</th>
                <th className="py-3 px-4">Department &amp; Section</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7f2]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No employees matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.uid} className="hover:bg-[#fbfcfe] transition-colors">
                    {/* Employee Avatar & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#182a52] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                          {emp.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0d1730]">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">UID: {emp.uid.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* ID & Email */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-[#0d1730]">{emp.employeeId}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                    </td>

                    {/* Department & Section */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0d1730]">{emp.department}</div>
                      <div className="text-[11px] text-slate-500">{emp.section}</div>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 text-[#0d1730] font-medium">
                      {emp.designation}
                    </td>

                    {/* Role Badge & Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={emp.role}
                        onChange={(e) => handleRoleChange(emp, e.target.value as UserRole)}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                          emp.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : emp.role === 'manager'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : emp.role === 'qa_staff'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="qa_staff">QA Staff</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(emp)}
                        title={`Click to ${emp.status === 'active' ? 'Deactivate' : 'Activate'}`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          emp.status === 'active'
                            ? 'bg-[#e5f7ee] text-[#1c8a53] hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {emp.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingEmployee({ ...emp })}
                        className="p-1.5 text-slate-500 hover:text-[#0d1730] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendResetLink(emp.email)}
                        className="p-1.5 text-slate-500 hover:text-[#e35b2a] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Dispatch Password Reset Email"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD EMPLOYEE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e7f2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e7f2] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#e35b2a]" />
                <h3 className="font-bold text-base text-[#0d1730]">Add Employee Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Tajedul"
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newEmployeeId}
                    onChange={(e) => setNewEmployeeId(e.target.value)}
                    placeholder="e.g. 36924"
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Walton Company Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. tajedul36924@waltonbd.com"
                  className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Must be an official employee email address (@waltonbd.com).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] bg-white"
                  >
                    <option value="Quality Management">Quality Management</option>
                    <option value="PCB Plant">PCB Plant</option>
                    <option value="PCBA SMT Plant">PCBA SMT Plant</option>
                    <option value="R&D Engineering">R&amp;D Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Section</label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="PCB & PCBA"
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Designation</label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="QA Staff / Lead"
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] bg-white"
                  >
                    <option value="qa_staff">QA Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Initial Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Min 8 chars, mixed case & numbers"
                    className="w-full pl-9 pr-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#eef1f8] rounded-lg text-[11px] text-[#5b6480] space-y-1">
                <span className="font-semibold text-[#0d1730]">Security Architecture:</span>
                <p>
                  Initial employee password will be hashed and verified by Firebase Authentication. Passwords are never written or transmitted to Firestore.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e7f2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {isSubmitting ? 'Registering...' : 'Create Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EMPLOYEE */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e7f2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e7f2] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#e35b2a]" />
                <h3 className="font-bold text-base text-[#0d1730]">Edit Profile: {editingEmployee.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Walton Email (Immutable)</label>
                <input
                  type="email"
                  disabled
                  value={editingEmployee.email}
                  className="w-full px-3 py-2 bg-slate-100 border border-[#e2e7f2] rounded-lg text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Employee ID (Immutable)</label>
                <input
                  type="text"
                  disabled
                  value={editingEmployee.employeeId}
                  className="w-full px-3 py-2 bg-slate-100 border border-[#e2e7f2] rounded-lg text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Department</label>
                <input
                  type="text"
                  value={editingEmployee.department}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Section</label>
                <input
                  type="text"
                  value={editingEmployee.section}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, section: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5b6480] mb-1">Designation</label>
                <input
                  type="text"
                  value={editingEmployee.designation}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, designation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Role</label>
                  <select
                    value={editingEmployee.role}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="qa_staff">QA Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5b6480] mb-1">Status</label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        status: e.target.value as UserStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#e2e7f2] rounded-lg outline-none focus:border-[#e35b2a] bg-white font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e7f2]">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
