// Custom CE mark — a flowing C+E monogram with a spark node at the junction.
// The C curves open to the right, and the E's spine extends from the same
// midpoint, making them read as one connected glyph.

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Content Engine logo"
    >
      {/* Rounded square bg */}
      <rect width="36" height="36" rx="10" fill="url(#logo-bg)" />

      {/* C arc — open right, stroke-only */}
      <path
        d="M22 9.5 C14 9.5 10 13.2 10 18 C10 22.8 14 26.5 22 26.5"
        stroke="url(#logo-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* E spine (vertical bar of E, sharing C's midpoint) */}
      <path
        d="M18 9.5 L18 26.5"
        stroke="url(#logo-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* E top bar */}
      <path
        d="M18 9.5 L25.5 9.5"
        stroke="url(#logo-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* E mid bar (slightly shorter) */}
      <path
        d="M18 18 L24 18"
        stroke="url(#logo-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* E bottom bar */}
      <path
        d="M18 26.5 L25.5 26.5"
        stroke="url(#logo-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Spark node at C/E junction */}
      <circle cx="18" cy="18" r="2.2" fill="white" opacity="0.9" />
      <circle cx="18" cy="18" r="3.8" fill="white" opacity="0.12" />

      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="logo-stroke" x1="10" y1="9.5" x2="26" y2="26.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.85" />
        </linearGradient>
      </defs>
    </svg>
  );
}
