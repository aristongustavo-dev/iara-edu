export const MermaidLogo = ({ className }) => (
  <svg viewBox="0 0 512 512" className={className} role="img" aria-label="IARA">
    <defs>
      <linearGradient id="ml-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
      <linearGradient id="ml-tail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2dd4bf" />
        <stop offset="100%" stopColor="#0f766e" />
      </linearGradient>
      <linearGradient id="ml-fluke" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0e7490" />
      </linearGradient>
    </defs>
    <rect x="12" y="12" width="488" height="488" rx="112" fill="url(#ml-bg)" />
    <circle cx="256" cy="256" r="216" fill="#ffffff" opacity="0.05" />
    <path
      d="M252 398 C 210 330 232 250 282 190 C 306 162 336 156 350 168"
      stroke="url(#ml-tail)"
      strokeWidth="56"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M232 392 C 150 376 96 400 88 448 C 140 470 210 460 252 420 Z" fill="url(#ml-fluke)" />
    <path d="M268 392 C 330 366 392 392 404 436 C 360 472 300 468 264 428 Z" fill="url(#ml-fluke)" opacity="0.85" />
    <path d="M274 336 a24 16 0 0 1 38 -2" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M262 278 a24 16 0 0 1 40 -2" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M298 226 a24 16 0 0 1 38 -2" stroke="#ffffff" strokeOpacity="0.24" strokeWidth="7" fill="none" strokeLinecap="round" />
    <circle cx="392" cy="112" r="11" fill="#ffffff" opacity="0.4" />
    <circle cx="410" cy="140" r="5" fill="#ffffff" opacity="0.28" />
  </svg>
);

export default MermaidLogo;