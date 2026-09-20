import React from 'react';
import {
  WALTON_EMBLEM_LEFT_PATH,
  WALTON_EMBLEM_RIGHT_PATH,
  WALTON_EMBLEM_RED_PATH,
  WALTON_WORDMARK_PATH,
  WALTON_LOGO_TRANSFORM,
} from './waltonLogoPaths';

interface WaltonSealLogoProps {
  className?: string;
  size?: number | string;
  animated?: boolean;
}

export const WaltonSealLogo: React.FC<WaltonSealLogoProps> = ({
  className = '',
  size = '100%',
  animated = true,
}) => {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={`select-none qm-seal-svg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Walton Quality Management PCB & PCBA"
    >
      <defs>
        {/* Arc path for upper text: QUALITY MANAGEMENT */}
        <path
          id="upper-qm-arc"
          d="M 55 250 A 195 195 0 0 1 445 250"
          fill="none"
        />

        {/* Arc path for lower text: PCB&PCBA - mathematically centered at (250, 250) with radius 195 */}
        <path
          id="lower-pcba-arc"
          d="M 90.27 361.85 A 195 195 0 0 0 409.73 361.85"
          fill="none"
        />

        {/* Gradients & Highlights */}
        <radialGradient id="qm-white-gradient" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="90%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </radialGradient>

        {/* Dynamic Metallic Shimmer for WALTON Text */}
        <linearGradient id="walton-blue-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#003ba5" />
          <stop offset="35%" stopColor="#003ba5" />
          <stop offset="50%" stopColor="#307fff" />
          <stop offset="65%" stopColor="#003ba5" />
          <stop offset="100%" stopColor="#003ba5" />
        </linearGradient>

        <filter id="qm-subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {animated && (
        <style>
          {`
            @keyframes qm-seal-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes qm-center-float {
              0%, 100% { transform: translate(0px, 5px) scale(1); }
              50% { transform: translate(0px, 3.5px) scale(1.035); }
            }
            @keyframes qm-red-pulse {
              0%, 100% { fill: #e31b23; filter: drop-shadow(0 0 0px rgba(227, 27, 35, 0)); }
              50% { fill: #ff2933; filter: drop-shadow(0 0 5px rgba(255, 41, 51, 0.75)); }
            }
            @keyframes qm-ring-glow {
              0%, 100% { stroke-opacity: 0.35; stroke-width: 1.5px; }
              50% { stroke-opacity: 0.85; stroke-width: 2.5px; }
            }
            @keyframes qm-text-gleam {
              0%, 100% { filter: drop-shadow(0 0 0px rgba(0, 59, 165, 0)); }
              50% { filter: drop-shadow(0 0 4px rgba(48, 127, 255, 0.65)); }
            }
            @keyframes qm-outer-halo {
              0%, 100% { stroke: #3eb543; stroke-width: 0px; }
              50% { stroke: #5ede8c; stroke-width: 3px; }
            }
            .qm-seal-outer-ring {
              transform-origin: 250px 250px;
              animation: qm-seal-spin 26s linear infinite;
              will-change: transform;
            }
            .qm-seal-svg:hover .qm-seal-outer-ring {
              animation-duration: 8s;
            }
            .qm-center-group {
              transform-origin: 250px 250px;
              animation: qm-center-float 4.5s ease-in-out infinite;
              will-change: transform;
            }
            .qm-red-element {
              animation: qm-red-pulse 2.2s ease-in-out infinite;
            }
            .qm-inner-glow-ring {
              animation: qm-ring-glow 3s ease-in-out infinite;
            }
            .qm-walton-text {
              animation: qm-text-gleam 3.5s ease-in-out infinite;
            }
            .qm-outer-glow-border {
              animation: qm-outer-halo 4s ease-in-out infinite;
            }
          `}
        </style>
      )}

      {/* Outermost border - Lime green ring with subtle halo */}
      <circle
        cx="250"
        cy="250"
        r="242"
        fill="#3eb543"
        className={animated ? 'qm-outer-glow-border' : ''}
      />

      {/* Outer Rotating Group: Outer Rings, Wing Accents & Arched Typography */}
      <g className={animated ? 'qm-seal-outer-ring' : ''}>
        {/* Main outer ring - Deep forest green */}
        <circle cx="250" cy="250" r="230" fill="#09552a" />

        {/* Side wing dividers & stripes */}
        {/* Left 9-o'clock horizontal bar - centered on horizontal axis */}
        <rect x="22" y="245" width="68" height="10" rx="5" fill="#3eb543" />
        {/* Right 3-o'clock horizontal bar - centered on horizontal axis */}
        <rect x="410" y="245" width="68" height="10" rx="5" fill="#3eb543" />

        {/* Left wing curved decorative stripes */}
        <path
          d="M 46 262 A 206 206 0 0 1 106 358"
          fill="none"
          stroke="#3eb543"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Left wing diagonal divider */}
        <line
          x1="126"
          y1="344"
          x2="76"
          y2="410"
          stroke="#3eb543"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Right wing curved decorative stripes */}
        <path
          d="M 454 262 A 206 206 0 0 0 394 358"
          fill="none"
          stroke="#3eb543"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Right wing diagonal divider */}
        <line
          x1="374"
          y1="344"
          x2="424"
          y2="410"
          stroke="#3eb543"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Upper arched text: QUALITY MANAGEMENT - enlarged & centered in green ring */}
        <text
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="48"
          letterSpacing="0.8"
          dominantBaseline="central"
          style={{ textRendering: 'geometricPrecision' }}
        >
          <textPath href="#upper-qm-arc" startOffset="50%" textAnchor="middle">
            QUALITY MANAGEMENT
          </textPath>
        </text>

        {/* Lower arched text: PCB&PCBA - enlarged to match upper font size (48px) */}
        <text
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="48"
          letterSpacing="4"
          dominantBaseline="central"
          style={{ textRendering: 'geometricPrecision' }}
        >
          <textPath href="#lower-pcba-arc" startOffset="50%" textAnchor="middle">
            PCB&amp;PCBA
          </textPath>
        </text>
      </g>

      {/* Inner circle border - Lime green */}
      <circle cx="250" cy="250" r="160" fill="#3eb543" />

      {/* Inner white medallion background */}
      <circle cx="250" cy="250" r="154" fill="url(#qm-white-gradient)" />

      {/* Inner fine concentric ring */}
      <circle
        cx="250"
        cy="250"
        r="147"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
      <circle
        cx="250"
        cy="250"
        r="142"
        fill="none"
        stroke="#3eb543"
        strokeWidth="1.5"
        strokeOpacity="0.35"
        className={animated ? 'qm-inner-glow-ring' : ''}
      />

      {/* Authentic Walton Corporate Logo (W Icon & WALTON Wordmark) */}
      <g
        transform={`translate(${WALTON_LOGO_TRANSFORM.translateX}, ${WALTON_LOGO_TRANSFORM.translateY}) scale(${WALTON_LOGO_TRANSFORM.scale})`}
        className={animated ? 'qm-center-group' : ''}
      >
        {/* W Emblem Left Wing (Walton Corporate Royal Blue) */}
        <path
          d={WALTON_EMBLEM_LEFT_PATH}
          fill="#103f99"
        />

        {/* W Emblem Right Wing (Walton Corporate Royal Blue) */}
        <path
          d={WALTON_EMBLEM_RIGHT_PATH}
          fill="#103f99"
        />

        {/* W Emblem Dynamic Center Crest (Walton Corporate Red) */}
        <path
          d={WALTON_EMBLEM_RED_PATH}
          fill="#c8102e"
          fillRule="evenodd"
          className={animated ? 'qm-red-element' : ''}
        />

        {/* WALTON Wordmark (Walton Corporate Royal Blue) */}
        <path
          d={WALTON_WORDMARK_PATH}
          fill="#103f99"
          fillRule="evenodd"
          className={animated ? 'qm-walton-text' : ''}
        />
      </g>
    </svg>
  );
};
