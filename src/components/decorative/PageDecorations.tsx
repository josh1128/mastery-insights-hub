/**
 * Decorative background elements for the dreamy glassmorphic UI.
 * These are purely visual and don't interfere with content.
 */

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Large purple orb top-right */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(240 70% 60%), transparent 70%)' }} />
      {/* Lavender orb bottom-left */}
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, hsl(260 72% 65%), transparent 70%)' }} />
      {/* Small blue accent mid-right */}
      <div className="absolute top-1/2 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(210 92% 55%), transparent 70%)' }} />
    </div>
  );
}

export function PageGlow({ position = 'top' }: { position?: 'top' | 'center' }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 overflow-hidden" 
      style={{ top: position === 'top' ? '-120px' : '20%', height: '400px', zIndex: 0 }}>
      <div className="absolute left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(ellipse, hsl(240 70% 60%), transparent 70%)' }} />
    </div>
  );
}

export function ArcDecoration({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" className="opacity-[0.04]">
        <circle cx="150" cy="150" r="140" stroke="hsl(240 70% 60%)" strokeWidth="2" fill="none" />
        <circle cx="150" cy="150" r="100" stroke="hsl(260 72% 65%)" strokeWidth="1.5" fill="none" />
        <circle cx="150" cy="150" r="60" stroke="hsl(240 70% 60%)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}

export function GlowingIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
        style={{ background: 'linear-gradient(135deg, hsl(240 70% 60%), hsl(260 72% 65%))' }} />
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
      <div className="absolute top-16 right-12 opacity-[0.06] animate-[float_8s_ease-in-out_infinite]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="5" y="5" width="30" height="30" rx="6" stroke="hsl(240 70% 60%)" strokeWidth="1.5" transform="rotate(15 20 20)" />
        </svg>
      </div>
      {/* Floating diamond */}
      <div className="absolute bottom-20 left-8 opacity-[0.05] animate-[float_10s_ease-in-out_infinite_1s]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="24" height="24" rx="4" stroke="hsl(260 72% 65%)" strokeWidth="1.5" transform="rotate(45 16 16)" />
        </svg>
      </div>
      {/* Floating circle */}
      <div className="absolute top-1/3 right-1/4 opacity-[0.04] animate-[float_12s_ease-in-out_infinite_2s]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="hsl(210 92% 55%)" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
