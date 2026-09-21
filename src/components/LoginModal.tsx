/**
 * =========================================================================================
 * @file src/components/LoginModal.tsx
 * @component LoginModal
 * @description Interactive Cute Lamp Authentication Modal for Walton Quality Management
 * When the lamp switch is pressed, the lamp turns ON and the login form appears.
 * When pressed again to turn OFF, the login form vanishes.
 * =========================================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, ShieldCheck, Lightbulb } from 'lucide-react';
import { WaltonSealLogo } from './WaltonSealLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string) => void;
  onLoginSuccess?: (email?: string) => void;
}

const ON_THEMES = [
  {
    name: 'Walton Coral',
    themeColor: '#e35b2a',
    themeGlowRGB: '227, 91, 42',
    shadeColor: '#a84c2a',
    bulbColor: '#ffe9e0',
    lightOpacity: 0.22,
    btnBg: '#e35b2a',
    btnText: '#ffffff',
  },
  {
    name: 'Walton Royal Blue',
    themeColor: '#0055d4',
    themeGlowRGB: '0, 85, 212',
    shadeColor: '#2b4d8a',
    bulbColor: '#e3eeff',
    lightOpacity: 0.22,
    btnBg: '#0055d4',
    btnText: '#ffffff',
  },
  {
    name: 'Quality Emerald',
    themeColor: '#10b981',
    themeGlowRGB: '16, 185, 129',
    shadeColor: '#366e57',
    bulbColor: '#e6fbee',
    lightOpacity: 0.22,
    btnBg: '#10b981',
    btnText: '#ffffff',
  },
];

const OFF_THEME = {
  name: 'Off',
  themeColor: '#2a2c30',
  themeGlowRGB: '42, 44, 48',
  shadeColor: '#2c2c2c',
  bulbColor: '#1a1a1a',
  lightOpacity: 0,
  btnBg: '#2a2c30',
  btnText: '#888888',
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('atiqur40736@waltonbd.com');
  const [password, setPassword] = useState('waltonQM2026');
  const [isLoading, setIsLoading] = useState(false);
  const [isLampOn, setIsLampOn] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  // When modal opens, start with lamp OFF as requested so the user can pull the string to turn ON & reveal form
  useEffect(() => {
    if (isOpen) {
      setIsLampOn(false);
      setIsPulling(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTheme = isLampOn ? ON_THEMES[colorIndex] : OFF_THEME;

  const handleToggleLamp = () => {
    setIsPulling(true);
    setTimeout(() => {
      setIsPulling(false);
    }, 180);

    setIsLampOn((prev) => !prev);
  };

  const handleCycleColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setColorIndex((prev) => (prev + 1) % ON_THEMES.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof onLogin === 'function') {
        onLogin(username);
      }
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(username);
      }
      onClose();
    }, 450);
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#070a0e]/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="login-modal-container"
        className="relative w-full max-w-4xl bg-[#0b0f14] rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 my-auto overflow-hidden transition-all duration-700"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: isLampOn
            ? `0 0 60px rgba(${currentTheme.themeGlowRGB}, 0.18)`
            : '0 20px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
          aria-label="Close login dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Glow Background */}
        <div
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full pointer-events-none transition-all duration-700 blur-3xl -z-0"
          style={{
            background: isLampOn
              ? `radial-gradient(circle, rgba(${currentTheme.themeGlowRGB}, 0.26) 0%, transparent 70%)`
              : 'radial-gradient(circle, rgba(42, 44, 48, 0.05) 0%, transparent 70%)',
          }}
        />

        {/* Left Side: Interactive Cute Lamp Section */}
        <div className="flex-1 flex flex-col items-start justify-start relative w-full select-none">
          {/* Logo & Branding - Aligned Upper Left */}
          <div className="w-full text-left mb-2 sm:mb-4 z-10 self-start">
            <div className="flex items-center justify-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center p-2 sm:p-2.5 border border-white/20 shadow-xl backdrop-blur-md shrink-0">
                <WaltonSealLogo className="w-full h-full" animated={false} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-wider uppercase text-white drop-shadow-sm">
                  WALTON QM USER LOGIN
                </span>
                <p className="text-xs sm:text-[13px] font-semibold text-cyan-400 tracking-wider uppercase mt-0.5">
                  QUALITY MANAGEMENT - PCB &amp; PCBA
                </p>
              </div>
            </div>
          </div>

          <svg
            className="w-full max-w-[270px] sm:max-w-[310px] md:max-w-[330px] h-auto overflow-visible drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] self-center mx-auto"
            viewBox="0 0 300 450"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lampLightConeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <clipPath id="lampMouthClip">
                <path d="M 125 155 Q 150 190 175 155 Z" />
              </clipPath>
            </defs>

            {/* Light Cone projecting towards form */}
            <polygon
              points="90,180 210,180 340,450 -30,450"
              fill="url(#lampLightConeGrad)"
              className="transition-opacity duration-700 pointer-events-none"
              style={{ opacity: currentTheme.lightOpacity }}
            />

            {/* Lamp Base */}
            <ellipse cx="150" cy="400" rx="60" ry="15" fill="#151515" />
            <ellipse cx="150" cy="395" rx="60" ry="15" fill="#3a3c40" />

            {/* Lamp Stem */}
            <rect x="140" y="180" width="20" height="220" fill="#2a2c30" />
            <rect x="142" y="180" width="8" height="220" fill="#4a4c50" />

            {/* Inner Bulb & Shade Rim */}
            <ellipse
              cx="150"
              cy="175"
              rx="90"
              ry="20"
              className="transition-colors duration-700"
              fill={currentTheme.bulbColor}
            />

            {/* Interactive Pull String Group - with animated bounce on click */}
            <g
              id="lamp-pull-string-switch"
              className="cursor-pointer group"
              onClick={handleToggleLamp}
              style={{
                transformOrigin: '105px 180px',
                transform: isPulling ? 'translateY(20px)' : 'translateY(0)',
                transition: 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
              title="Click to toggle lamp ON / OFF"
            >
              {/* String line */}
              <line x1="105" y1="180" x2="105" y2="280" stroke="#64748b" strokeWidth="3" />
              {/* Cord handle */}
              <line
                x1="105"
                y1="280"
                x2="105"
                y2="312"
                stroke={isLampOn ? '#ffffff' : '#cbd5e1'}
                strokeWidth="7"
                strokeLinecap="round"
                className="group-hover:stroke-[#93c5fd] transition-colors"
              />
              {/* Click target helper */}
              <circle cx="105" cy="296" r="16" fill="transparent" />
            </g>

            {/* Main Shade Body */}
            <path
              d="M 95 60 Q 150 45 205 60 L 240 175 Q 150 195 60 175 Z"
              className="transition-colors duration-700"
              fill={currentTheme.shadeColor}
            />

            {/* Face: Sleeping Expression (Off Mode) */}
            <g
              className="transition-opacity duration-300"
              style={{ opacity: isLampOn ? 0 : 1 }}
            >
              <path
                d="M 115 130 Q 125 140 135 130"
                stroke="#111"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 165 130 Q 175 140 185 130"
                stroke="#111"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Face: Awake & Smiling Expression (On Mode) */}
            <g
              className="transition-opacity duration-300"
              style={{ opacity: isLampOn ? 1 : 0 }}
            >
              <path
                d="M 115 130 Q 125 115 135 130"
                stroke="#111"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 165 130 Q 175 115 185 130"
                stroke="#111"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <g>
                <path d="M 125 155 Q 150 190 175 155 Z" fill="#111" />
                <path
                  d="M 140 165 Q 150 190 160 165 Z"
                  fill="#f87171"
                  clipPath="url(#lampMouthClip)"
                />
              </g>
            </g>
          </svg>

          {/* Lamp Controls Buttons */}
          <div className="flex items-center gap-2 mt-3 z-10">
            <button
              id="btn-toggle-lamp-switch"
              type="button"
              onClick={handleToggleLamp}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
                isLampOn
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Lightbulb className={`w-3.5 h-3.5 ${isLampOn ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{isLampOn ? 'Turn OFF Lamp' : 'Turn ON Lamp'}</span>
            </button>

            {isLampOn && (
              <button
                type="button"
                onClick={handleCycleColor}
                className="text-xs font-medium px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                title="Cycle lamp color"
              >
                Color: {currentTheme.name}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Sleek Glowing Login Form Card - Dynamic Appearance based on Lamp state */}
        <div className="flex-1 w-full max-w-[420px] z-10 flex flex-col justify-center min-h-[390px] relative">
          {/* 1. VISIBLE LOGIN CARD: Appears when Lamp is ON */}
          {isLampOn ? (
            <div
              id="login-card"
              className="w-full bg-[#121820]/85 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border-2 transition-all duration-500 animate-in fade-in zoom-in-95 slide-in-from-bottom-2"
              style={{
                borderColor: currentTheme.themeColor,
                boxShadow: `0 0 35px rgba(${currentTheme.themeGlowRGB}, 0.25), inset 0 0 15px rgba(255, 255, 255, 0.02)`,
              }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Walton PCB &amp; PCBA Quality Management
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-[#a0a0a0] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Username / Employee ID</span>
                  </label>
                  <input
                    id="input-login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-[#151a21] border border-[#2a2c30] px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-300"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = currentTheme.themeColor;
                      e.currentTarget.style.boxShadow = `0 0 10px rgba(${currentTheme.themeGlowRGB}, 0.35)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2c30';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-[#a0a0a0] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#151a21] border border-[#2a2c30] px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-300"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = currentTheme.themeColor;
                      e.currentTarget.style.boxShadow = `0 0 10px rgba(${currentTheme.themeGlowRGB}, 0.35)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#2a2c30';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base cursor-pointer transition-all duration-300 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: currentTheme.btnBg,
                      color: currentTheme.btnText,
                      boxShadow: `0 8px 20px rgba(${currentTheme.themeGlowRGB}, 0.25)`,
                    }}
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorized QA Staff</span>
                </span>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact Quality IT administrator: qm.pcba26@gmail.com');
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[11.5px]"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
