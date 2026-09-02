'use client';

// Content Engine logo — an abstract "lens + spark" mark.
// A hexagonal aperture shape with a diagonal lightning bolt cutting through it,
// representing AI vision transforming raw photos into content.
// Multi-stop purple/fuchsia/violet gradient with inner glow.

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 36, className = '' }: LogoProps) {
  const id = 'ce-logo';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Content Engine"
    >
      {/* Rounded square background with deep purple */}
      <rect width="40" height="40" rx="11" fill={`url(#${id}-bg)`} />

      {/* Inner glow layer */}
      <rect width="40" height="40" rx="11" fill={`url(#${id}-glow)`} opacity="0.6" />

      {/* Aperture / lens ring — hexagonal circle suggestion */}
      <circle
        cx="20" cy="20" r="11"
        stroke={`url(#${id}-ring)`}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />

      {/* Inner aperture ring */}
      <circle
        cx="20" cy="20" r="7.5"
        stroke={`url(#${id}-ring)`}
        strokeWidth="1"
        fill="none"
        opacity="0.35"
        strokeDasharray="2.5 2.5"
      />

      {/* Lightning bolt — cuts diagonally through the lens */}
      {/* Top segment: upper-right to center */}
      <path
        d="M23.5 9.5 L17.5 20.5 L21.5 20.5 L16.5 30.5"
        stroke={`url(#${id}-bolt)`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bolt fill shape for solid look */}
      <path
        d="M23.5 9.5 L17.5 20.5 L21.5 20.5 L16.5 30.5 L22 21.5 L18 21.5 Z"
        fill={`url(#${id}-bolt-fill)`}
        opacity="0.92"
      />

      {/* Center spark — the focal point */}
      <circle cx="19.5" cy="21" r="1.8" fill="white" opacity="0.95" />
      <circle cx="19.5" cy="21" r="3.5" fill="white" opacity="0.1" />

      {/* Top-right corner accent dot */}
      <circle cx="29" cy="11" r="1.5" fill={`url(#${id}-dot)`} opacity="0.8" />

      <defs>
        {/* Background gradient — deep purple to violet */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2e1065" />
          <stop offset="50%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* Inner radial glow */}
        <radialGradient id={`${id}-glow`} cx="50%" cy="40%" r="55%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
        </radialGradient>

        {/* Ring stroke gradient */}
        <linearGradient id={`${id}-ring`} x1="9" y1="9" x2="31" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Bolt stroke gradient */}
        <linearGradient id={`${id}-bolt`} x1="16" y1="9" x2="24" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5d0fe" />
          <stop offset="40%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Bolt fill gradient */}
        <linearGradient id={`${id}-bolt-fill`} x1="16" y1="9" x2="24" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fae8ff" />
          <stop offset="35%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Accent dot */}
        <radialGradient id={`${id}-dot`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#c026d3" />
        </radialGradient>
      </defs>
    </svg>
  );
}
