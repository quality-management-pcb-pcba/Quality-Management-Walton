/**
 * =========================================================================================
 * @file src/components/LoginModal.tsx
 * @component LoginModal
 * @description Administrative Authentication Modal for Walton Quality Management
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Renders the pop-up modal dialog for plant leads, quality managers, and inspectors to
 * authenticate with the Walton QMS system.
 * - Authenticates the session and unlocks administrative editing tools and the sidebar.
 * - Provides pre-filled credentials for testing and verification convenience.
 *
 * PARAMETERS / PROPS (LoginModalProps):
 * -------------------------------------
 * @param {boolean} isOpen - Whether the modal dialog is currently visible on screen.
 * @param {() => void} onClose - Callback function invoked to close/dismiss the dialog.
 * @param {(email: string) => void} [onLogin] - Callback invoked with the user's email upon login.
 * @param {(email?: string) => void} [onLoginSuccess] - Secondary success callback trigger.
 */

import React, { useState } from 'react';
import { QmBadge } from './QmBadge';
import { X, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string) => void;
  onLoginSuccess?: (email?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onLoginSuccess,
}) => {
  /** Holds the entered email address, pre-filled with demo lead account */
  const [email, setEmail] = useState('atiqur40736@waltonbd.com');

  /** Holds the entered password string */
  const [password, setPassword] = useState('waltonQM2026');

  /** Indicates whether the login request is actively processing */
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  /**
   * handleSubmit
   * ------------
   * WHAT IT DOES:
   * Handles form submission, simulates network authentication verification, and
   * triggers parent success callbacks to elevate the user's session to logged-in status.
   *
   * @param {React.FormEvent} e - The browser form submit event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof onLogin === 'function') {
        onLogin(email);
      }
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(email);
      }
    }, 400);
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 bg-[#0d1730]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="login-card"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#e2e7f2]"
      >
        {/* Modal top banner */}
        <div className="bg-[#0d1730] p-6 text-white border-b-2 border-[#e35b2a] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <QmBadge size="md" />
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Quality Operations Login</h2>
              <p className="text-xs text-[#9fb0d6]">Walton Hi-Tech Industries PLC · PCB &amp; PCBA</p>
            </div>
          </div>
        </div>

        {/* Modal form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-[#eef1f8] rounded-lg border border-[#e2e7f2] flex items-center gap-2.5 text-xs text-[#5b6480]">
            <ShieldCheck className="w-4 h-4 text-[#1fb6a6] shrink-0" />
            <span>Authorized Quality Control &amp; Process Engineering Staff only.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5b6480] mb-1.5">
              Employee ID or Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8891a8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-sm text-[#141b30] font-medium focus:ring-2 focus:ring-[#e35b2a] focus:border-transparent outline-none transition-all"
                placeholder="e.g. atiqur40736@waltonbd.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5b6480] mb-1.5">
              Access Token / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8891a8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#fbfcfe] border border-[#e2e7f2] rounded-lg text-sm text-[#141b30] font-medium focus:ring-2 focus:ring-[#e35b2a] focus:border-transparent outline-none transition-all"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5b6480] pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#e35b2a]" />
              <span>Remember station</span>
            </label>
            <span className="text-[#e35b2a] font-medium cursor-pointer hover:underline">Reset credential</span>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#e35b2a] hover:bg-[#c74a1f] text-white py-3 rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to QMS Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 border-t border-[#e2e7f2] flex items-center justify-center gap-2 text-xs text-[#8891a8]">
            <span className="w-2 h-2 rounded-full bg-[#28ad6b]" />
            <span>Factory Intranet Gateway Connected</span>
          </div>
        </form>
      </div>
    </div>
  );
};
