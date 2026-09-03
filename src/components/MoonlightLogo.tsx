export function MoonlightLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
    >
      <circle cx="108" cy="96" r="72" fill="none" stroke="#f3f4f6" strokeWidth="7" />
      <circle cx="128" cy="88" r="58" fill="#070b14" />
      <path
        d="M100 168 C100 120 78 108 78 78 C78 58 92 46 100 46 C108 46 122 58 122 78 C122 108 100 120 100 168 Z"
        fill="#5f8a45"
      />
      <ellipse cx="88" cy="72" rx="16" ry="22" fill="#6f9b52" />
      <ellipse cx="112" cy="70" rx="18" ry="24" fill="#6f9b52" />
      <ellipse cx="100" cy="56" rx="14" ry="16" fill="#7eab5d" />
      <path d="M96 92 C94 104 90 112 100 118 C110 112 106 104 104 92" fill="#3f2a1a" />
      <ellipse cx="100" cy="168" rx="28" ry="10" fill="#c9a227" />
      <path
        d="M78 164 Q100 148 122 164 Q122 176 100 180 Q78 176 78 164 Z"
        fill="#d4af37"
      />
      <path d="M88 150 Q100 138 112 150" fill="none" stroke="#f3e6b3" strokeWidth="2" />
    </svg>
  );
}
