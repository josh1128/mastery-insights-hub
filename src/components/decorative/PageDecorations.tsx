/**
 * Decorative background elements for the dreamy glassmorphic UI.
 * These are purely visual and don't interfere with content or layout.
 */

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Oversized curved orb wash */}
      <div
        className="absolute -top-64 -right-40 w-[720px] h-[720px] rounded-[380px] opacity-[0.26] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 0%, hsl(258 88% 68% / 0.9), transparent 70%)",
        }}
      />
      {/* Bottom-left aurora */}
      <div
        className="absolute -bottom-72 -left-64 w-[820px] h-[820px] rounded-[420px] opacity-[0.24] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 0% 100%, hsl(210 92% 60% / 0.9), transparent 70%)",
        }}
      />
      {/* Mid-layer soft orb */}
      <div
        className="absolute top-1/3 right-1/4 w-[420px] h-[420px] rounded-full opacity-[0.18] blur-2xl"
        style={{
          background:
            "radial-gradient(circle, hsl(268 92% 72% / 0.8), transparent 70%)",
        }}
      />
    </div>
  );
}

export function PageGlow({ position = 'top' }: { position?: 'top' | 'center' }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 overflow-hidden"
      style={{ top: position === 'top' ? '-120px' : '20%', height: '400px', zIndex: 0 }}>
      <div className="absolute left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(ellipse, hsl(258 88% 68%), transparent 70%)' }} />
    </div>
  );
}

export function ArcDecoration({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <svg width="360" height="360" viewBox="0 0 360 360" fill="none" className="opacity-[0.24]">
        <defs>
          <linearGradient id="arcRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="hsl(210 92% 60%)" />
            <stop offset="1" stopColor="hsl(268 92% 72%)" />
          </linearGradient>
        </defs>
        <circle cx="180" cy="180" r="160" stroke="url(#arcRing)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="430 380" />
        <circle cx="180" cy="180" r="118" stroke="url(#arcRing)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="320 280" />
        <circle cx="180" cy="180" r="78" stroke="hsl(258 88% 68%)" strokeWidth="1" strokeDasharray="210 200" />
      </svg>
    </div>
  );
}

export function GlowingIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
        style={{ background: 'linear-gradient(135deg, hsl(210 92% 60%), hsl(268 92% 72%))' }} />
      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
        {children}
      </div>
    </div>
  );
}

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Floating cube */}
      <div className="absolute top-16 right-12 opacity-[0.22] animate-[float_8s_ease-in-out_infinite]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="5" y="5" width="30" height="30" rx="9" stroke="hsl(258 88% 68%)" strokeWidth="1.5" transform="rotate(15 20 20)" />
        </svg>
      </div>
      {/* Floating diamond */}
      <div className="absolute bottom-20 left-8 opacity-[0.18] animate-[float_10s_ease-in-out_infinite_1s]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="24" height="24" rx="7" stroke="hsl(210 92% 60%)" strokeWidth="1.5" transform="rotate(45 16 16)" />
        </svg>
      </div>
      {/* Floating circle */}
      <div className="absolute top-1/3 right-1/4 opacity-[0.18] animate-[float_12s_ease-in-out_infinite_2s]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="hsl(268 92% 72%)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Layered curved panels for subtle dashboard structure.
 */
export function CurvedPanels() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[420px] rounded-[220px] bg-gradient-to-r from-white/4 via-white/2 to-white/4 border border-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.8)] backdrop-blur-3xl" />
      <div className="absolute top-36 left-1/2 -translate-x-1/2 w-[1000px] h-[360px] rounded-[200px] border border-white/4 border-dashed opacity-40" />
    </div>
  );
}
