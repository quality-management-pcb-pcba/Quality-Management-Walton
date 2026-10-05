import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Upload,
  Trash2,
  RotateCcw,
  Check,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Layers,
  MapPin,
  ListPlus,
  AlertTriangle,
  Sparkles,
  Edit3,
  UserPlus,
} from 'lucide-react';
import { LeaderProfile, DEFAULT_LEADERS } from '../../services/leadersService';

interface LeaderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaders: LeaderProfile[];
  initialLeader?: LeaderProfile | null;
  onSave: (leader: LeaderProfile) => Promise<void> | void;
  onDelete?: (leaderId: string) => Promise<void> | void;
  onResetDefaults?: () => Promise<void> | void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
];

export const LeaderProfileModal: React.FC<LeaderProfileModalProps> = ({
  isOpen,
  onClose,
  leaders,
  initialLeader,
  onSave,
  onDelete,
  onResetDefaults,
}) => {
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('new');
  const [name, setName] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [tier, setTier] = useState<'executive' | 'operations'>('executive');
  const [department, setDepartment] = useState<string>('');
  const [responsibilitiesText, setResponsibilitiesText] = useState<string>('');
  const [experience, setExperience] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever initialLeader or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialLeader) {
        setSelectedLeaderId(initialLeader.id);
        loadLeaderData(initialLeader);
      } else if (leaders.length > 0) {
        // Default to the first leader if available so user can immediately edit
        setSelectedLeaderId(leaders[0].id);
        loadLeaderData(leaders[0]);
      } else {
        setSelectedLeaderId('new');
        resetForm();
      }
    }
  }, [initialLeader, isOpen]);

  const loadLeaderData = (leader: LeaderProfile) => {
    setName(leader.name || '');
    setEmployeeId(leader.employeeId || '');
    setDesignation(leader.designation || '');
    setTier(leader.tier || 'executive');
    setDepartment(leader.department || '');
    setResponsibilitiesText((leader.responsibilities || []).join('\n'));
    setExperience(leader.experience || '');
    setLocation(leader.location || '');
    setEmail(leader.email || '');
    setPhone(leader.phone || '');
    setPhotoUrl(leader.photoUrl || PRESET_AVATARS[0]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const resetForm = () => {
    setName('');
    setEmployeeId('');
    setDesignation('');
    setTier('operations');
    setDepartment('Quality Management Division');
    setResponsibilitiesText('');
    setExperience('');
    setLocation('Walton Hi-Tech Industries PLC, Chandra, Gazipur');
    setEmail('');
    setPhone('');
    setPhotoUrl(PRESET_AVATARS[0]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSelectLeaderChange = (id: string) => {
    setSelectedLeaderId(id);
    if (id === 'new') {
      resetForm();
    } else {
      const found = leaders.find((l) => l.id === id);
      if (found) {
        loadLeaderData(found);
      }
    }
  };

  // Image compressor to ensure uploaded photos never exceed Firestore 1MB limits
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      reader.onerror = (err) => reject(err);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(img.src);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setPhotoUrl(compressedDataUrl);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to process image. Please try another photo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!employeeId.trim()) {
      setErrorMessage('Employee ID is required.');
      return;
    }
    if (!designation.trim()) {
      setErrorMessage('Designation is required.');
      return;
    }

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    // If 'new' mode was selected, check if user typed an existing leader's ID or name
    let finalId = selectedLeaderId;
    if (finalId === 'new') {
      const match = leaders.find(
        (l) => l.employeeId.trim() === employeeId.trim() || l.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (match) {
        finalId = match.id;
      } else {
        finalId = `leader-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      }
    }

    const leaderToSave: LeaderProfile = {
      id: finalId,
      name: name.trim(),
      employeeId: employeeId.trim(),
      designation: designation.trim(),
      tier,
      department: department.trim() || 'Quality Management Division',
      responsibilities:
        responsibilities.length > 0
          ? responsibilities
          : ['Quality governance, process adherence, and manufacturing yield oversight.'],
      experience: experience.trim() || 'Quality Leadership & Operations Excellence',
      location: location.trim() || 'Walton Hi-Tech Industries PLC, Chandra, Gazipur',
      email: email.trim() || `${employeeId}@waltonbd.com`,
      phone: phone.trim() || '+880 1713-262600',
      photoUrl: photoUrl.trim() || PRESET_AVATARS[0],
    };

    setIsSubmitting(true);
    try {
      await onSave(leaderToSave);
      setSuccessMessage(
        selectedLeaderId === 'new'
          ? `Successfully saved leader profile for ${leaderToSave.name}!`
          : `Profile for ${leaderToSave.name} updated and saved successfully!`
      );
      setTimeout(() => {
        onClose();
      }, 650);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save leader profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedLeaderId === 'new') return;
    if (!window.confirm(`Are you sure you want to remove ${name} from the leadership directory?`)) {
      return;
    }

    if (onDelete) {
      setIsSubmitting(true);
      try {
        await onDelete(selectedLeaderId);
        setSuccessMessage('Leader profile removed.');
        setTimeout(() => {
          onClose();
        }, 500);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to delete leader profile.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all leader profiles back to original Walton Quality Management defaults?')) {
      return;
    }
    if (onResetDefaults) {
      setIsSubmitting(true);
      try {
        await onResetDefaults();
        setSuccessMessage('Reset to standard Walton QM leadership directory.');
        setTimeout(() => {
          onClose();
        }, 600);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to reset leader profiles.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#cbd5e1] overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1730] via-[#123a6b] to-[#1c356b] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {selectedLeaderId === 'new' ? 'Entry New Leader Profile' : 'Update Leader Profile'}
              </h2>
              <p className="text-xs text-white/80">
                Walton PCB &amp; PCBA Quality Management Organization Directory
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Leader Tabs Selector */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-b border-[#cbd5e1] shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#e35b2a]" />
              <span>Select Leader to Update or Enter New:</span>
            </span>
            {onResetDefaults && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] text-[#64748b] hover:text-[#0d1730] font-semibold transition-colors cursor-pointer"
                title="Reset all leader profiles to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {leaders.map((l) => {
              const isSelected = selectedLeaderId === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => handleSelectLeaderChange(l.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1c356b] text-white border-[#1c356b] shadow-xs'
                      : 'bg-white text-[#334155] border-[#cbd5e1] hover:bg-slate-50 hover:border-[#94a3b8]'
                  }`}
                >
                  <img
                    src={l.photoUrl}
                    alt={l.name}
                    className="w-4 h-4 rounded-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
                    }}
                  />
                  <span>{l.name.replace('Md. ', '')}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#64748b]'}`}>
                    ({l.employeeId})
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handleSelectLeaderChange('new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedLeaderId === 'new'
                  ? 'bg-[#e35b2a] text-white border-[#e35b2a] shadow-xs'
                  : 'bg-white text-[#e35b2a] border-[#e35b2a]/50 hover:bg-orange-50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ New Leader</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Photo & Basic Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Avatar Preview & Upload */}
            <div className="sm:col-span-4 flex flex-col items-center text-center p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-white shadow-md bg-white mb-3 relative group">
                <img
                  src={photoUrl || PRESET_AVATARS[0]}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = PRESET_AVATARS[0];
                  }}
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 border border-[#cbd5e1] text-[#0d1730] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mb-2"
              >
                <Upload className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Upload Photo</span>
              </button>

              <div className="w-full text-left">
                <span className="text-[10px] uppercase font-bold text-[#94a3b8] block mb-1.5 text-center">
                  Or pick preset avatar:
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                        photoUrl === url ? 'border-[#2563eb] scale-110 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Identification Fields */}
            <div className="sm:col-span-8 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Atiqur Rahman"
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. 40736"
                    className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs font-mono font-semibold text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Hierarchy Tier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as 'executive' | 'operations')}
                    className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none cursor-pointer"
                  >
                    <option value="executive">Executive Leadership (Upper Row)</option>
                    <option value="operations">Operations Leadership (Lower Row)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Official Designation / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Head of QM- PCB&PCBA or Supervisor of QM- PCBA"
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Department / Section
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Quality Management Division or PCBA Quality Control"
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs font-medium text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo URL Custom Input */}
          <div>
            <label className="block text-xs font-bold text-[#334155] mb-1">
              Custom Photo URL (optional)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... image link"
              className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
            />
          </div>

          {/* Contact Details & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Official Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. qm.pcba26@gmail.com"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +880 1678-860873"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#7c3aed]" />
                <span>Professional Experience</span>
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 12+ Years in Quality Assurance"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e11d48]" />
                <span>Office / Plant Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Walton Hi-Tech Industries PLC, Gazipur"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Key Strategic Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <ListPlus className="w-3.5 h-3.5 text-[#1c356b]" />
                <span>Core Roles &amp; Responsibilities</span>
              </label>
              <span className="text-[10px] text-[#94a3b8]">One per line</span>
            </div>
            <textarea
              rows={3}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder="Enter key responsibilities, one on each line...&#10;e.g. Division-wide quality assurance, IPC-A-610 Class 3 adherence&#10;Lead CAPA 8D investigations and supplier audits"
              className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-xs font-medium text-[#0d1730] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none font-mono"
            />
          </div>

          {/* Footer Action Bar */}
          <div className="pt-4 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
            <div>
              {selectedLeaderId !== 'new' && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#e35b2a] hover:bg-[#c8491c] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {selectedLeaderId === 'new' ? 'Save & Register Leader' : 'Update Leader Profile'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
