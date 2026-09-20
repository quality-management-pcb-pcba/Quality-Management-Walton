/**
 * =========================================================================================
 * @file src/components/Header.tsx
 * @component Header
 * @description Fixed Top Navigation Bar for Walton Quality Management System
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Renders the top navigation bar across all internal portal pages.
 * - Displays Walton logo and official Quality Management branding.
 * - Provides quick links to the public Homepage, Settings, and Contact modals.
 * - Conditionally displays the Mobile / Desktop Sidebar toggle button ONLY when logged in.
 * - Shows the Administrator profile dropdown menu (or "Sign In" button for visitors).
 *
 * PARAMETERS / PROPS (HeaderProps):
 * ---------------------------------
 * @param {() => void} [onToggleSidebar] - Callback to expand/collapse the internal sidebar.
 * @param {(page: PageId) => void} [onNavigate] - Callback to switch between QMS pages.
 * @param {() => void} [onOpenNewNcModal] - Callback to open the New Non-Conformance modal.
 * @param {() => void} [onOpenNewCapaModal] - Callback to open the New CAPA modal.
 * @param {() => void} [onOpenNewDocModal] - Callback to open the New Document modal.
 * @param {() => void} [onOpenContactModal] - Callback to open the Quality helpline modal.
 * @param {() => void} [onLogout] - Callback invoked when signing out.
 * @param {string} [selectedMonth] - Active audit month filter string.
 * @param {(month: string) => void} [onSelectMonth] - Handler for month filter change.
 * @param {string} [selectedProduct] - Active product model filter string.
 * @param {(product: string) => void} [onSelectProduct] - Handler for product filter change.
 * @param {boolean} [isLoggedIn] - True if user has authorized administrator privileges.
 * @param {() => void} [onOpenLoginModal] - Handler to trigger the admin login dialog.
 */

import React, { useState, useRef, useEffect } from 'react';
import { QmBadge } from './QmBadge';
import { Menu, User, LogOut, Settings as SettingsIcon, Mail, Home, Lock, ShieldCheck } from 'lucide-react';
import { PageId } from '../types';
import { ContactModal } from './modals/ContactModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onNavigate?: (page: PageId) => void;
  onOpenNewNcModal?: () => void;
  onOpenNewCapaModal?: () => void;
  onOpenNewDocModal?: () => void;
  onOpenContactModal?: () => void;
  onLogout?: () => void;
  selectedMonth?: string;
  onSelectMonth?: (month: string) => void;
  setSelectedMonth?: (month: string) => void;
  selectedProduct?: string;
  onSelectProduct?: (product: string) => void;
  setSelectedProduct?: (product: string) => void;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
  currentPage?: PageId;
  onTogglePortalView?: () => void;
  inPortal?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar = () => {},
  onNavigate = (_page: PageId) => {},
  onOpenNewNcModal = () => {},
  onOpenNewCapaModal = () => {},
  onOpenNewDocModal = () => {},
  onOpenContactModal,
  onLogout = () => {},
  selectedMonth = 'Aug 2026',
  onSelectMonth,
  setSelectedMonth,
  selectedProduct = 'All Products',
  onSelectProduct,
  setSelectedProduct,
  isLoggedIn = false,
  onOpenLoginModal = () => {},
}) => {
  /** Local state to toggle the administrator user dropdown menu */
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /** Local state to toggle the Quality contact modal */
  const [contactModalOpen, setContactModalOpen] = useState(false);

  /** Ref to detect clicks outside the user profile dropdown to close it automatically */
  const userMenuRef = useRef<HTMLDivElement>(null);

  /**
   * handleMonthChange
   * Synchronizes month filter change across both callback patterns.
   * @param {string} val - The chosen month string (e.g., 'August 2026')
   */
  const handleMonthChange = (val: string) => {
    if (onSelectMonth) onSelectMonth(val);
    if (setSelectedMonth) setSelectedMonth(val);
  };

  /**
   * handleProductChange
   * Synchronizes product selection across parent state.
   * @param {string} val - The chosen product name
   */
  const handleProductChange = (val: string) => {
    if (onSelectProduct) onSelectProduct(val);
    if (setSelectedProduct) setSelectedProduct(val);
  };

  /**
   * Click-outside hook: automatically closes the user profile popup when
   * clicking anywhere else in the document.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        id="app-topbar"
        className="fixed top-0 left-0 right-0 h-[86px] sm:h-[90px] z-50 bg-[#0d1730] border-b-[3px] border-[#e35b2a] flex items-center justify-between px-4 sm:px-6 text-white shadow-md"
      >
      {/* Left branding & Mobile toggle */}
      <div className="flex items-center gap-3.5 sm:gap-5">
        {isLoggedIn && (
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="p-2 text-white/80 hover:text-white rounded-md hover:bg-[#182a52] transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          className="flex items-center gap-3.5 cursor-pointer group"
          onClick={() => onNavigate('home')}
          title="Go to Home Page"
        >
          <QmBadge size="md" />
          <div className="hidden sm:block">
            <h1 className="text-[17px] sm:text-[19px] font-extrabold tracking-tight text-white leading-tight group-hover:text-[#e35b2a] transition-colors">
              Walton Quality Management
            </h1>
            <span className="block text-[11.5px] sm:text-[12.5px] text-[#9fb0d6] font-semibold tracking-wide mt-0.5">
              PCB &amp; PCBA Manufacturing
            </span>
          </div>
        </div>
      </div>

      {/* Right user profile badge matching Image 2 or Login button */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          /* Logged In User profile dropdown */
          <div className="relative" ref={userMenuRef}>
            <button
              id="user-profile-menu-button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 bg-[#182a52] border border-[#2a3c6b] hover:border-[#9fb0d6] px-3 py-1.5 rounded-full transition-all text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white text-[#0d1730] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                AR
              </div>
              <div className="pr-1 hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">Atikur Rahman</div>
                <div className="text-[10px] text-[#9fb0d6]">Quality Management</div>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e2e7f2] rounded-xl shadow-xl py-1.5 z-50 text-[#141b30] text-xs">
                <div className="px-3.5 py-2.5 border-b border-[#e2e7f2]">
                  <p className="font-semibold text-sm text-[#0d1730]">Atikur Rahman</p>
                  <p className="text-[11px] text-[#5b6480]">atiqur40736@waltonbd.com</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#e5f7ee] text-[#1c8a53] rounded text-[10px] font-mono font-semibold">
                    ID: 40736 · Plant Lead
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-[#eef1f8] font-medium text-[#0d1730] cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#5b6480]" />
                  Return to Home Page
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-[#eef1f8] font-medium text-[#0d1730] cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-[#5b6480]" />
                  Settings &amp; Station Profile
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setContactModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-[#eef1f8] cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#5b6480]" />
                  Contact Quality Management
                </button>
                <div className="border-t border-[#e2e7f2] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-[#fbe6e6] text-[#d64545] font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#d64545]" />
                    Sign Out / Public Home
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Public Visitor View: Return Home & Login button */
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              id="header-btn-login"
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 bg-[#e35b2a] hover:bg-[#c94d20] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Admin login required to access sidebar navigation and administrative sections"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
      </header>

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
};
