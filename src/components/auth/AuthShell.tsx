import { type ReactNode } from 'react'
import complayeSymbol from '@/assets/logos/complaye-symbol.png'
import { ShieldCheck, Zap, FileText, Globe } from 'lucide-react'

const FEATURES = [
  { icon: ShieldCheck, text: 'Screens against OFAC, EU, UN, OFSI and 8 more lists' },
  { icon: Zap,         text: 'Real-time fuzzy-match results in under 1 second' },
  { icon: FileText,    text: 'Immutable audit trails & downloadable compliance reports' },
  { icon: Globe,       text: 'Built for African ports, banks and logistics providers' },
]

const STATS = [
  { value: '47M+',  label: 'Entities' },
  { value: '12',    label: 'Lists' },
  { value: '99.9%', label: 'Uptime' },
]

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 flex-col relative overflow-hidden"
        style={{ background: '#203864' }}
      >
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full"
            style={{
              width: 420, height: 420,
              top: -80, right: -100,
              background: 'radial-gradient(circle, rgba(247,88,53,0.22) 0%, transparent 70%)',
              animation: 'float1 14s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 320, height: 320,
              bottom: 60, left: -60,
              background: 'radial-gradient(circle, rgba(247,88,53,0.16) 0%, transparent 70%)',
              animation: 'float2 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 200, height: 200,
              top: '45%', right: '15%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
              animation: 'float3 11s ease-in-out infinite',
            }}
          />
        </div>

        {/* Subtle dot pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.06 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-12 py-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={complayeSymbol}
              alt="Complaye"
              className="h-8 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span className="text-white/70 text-xs font-medium tracking-widest uppercase">
              Instant Screening
            </span>
          </div>

          {/* Headline */}
          <div className="mt-14 xl:mt-16">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold"
              style={{ background: 'rgba(247,88,53,0.18)', color: '#F75835', border: '1px solid rgba(247,88,53,0.3)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F75835] animate-pulse" />
              Compliance · AML/CTF · Sanctions
            </div>

            <h2
              className="text-[38px] xl:text-[44px] font-bold leading-[1.08] tracking-tight text-white"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              The screening<br />
              platform built<br />
              <span style={{ color: '#F75835' }}>for Compliance.</span>
            </h2>

            <p className="mt-5 text-[14px] leading-[1.75]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Secure your financial and logistics operations with instant,
              accurate sanctions screening — trusted by port authorities
              and financial institutions across the continent.
            </p>
          </div>

          {/* Features */}
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3.5">
                <span
                  className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(247,88,53,0.18)', border: '1px solid rgba(247,88,53,0.25)' }}
                >
                  <Icon size={14} style={{ color: '#F75835' }} />
                </span>
                <span className="text-[13.5px] leading-snug" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {text}
                </span>
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div
            className="mt-auto pt-8 grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)', marginTop: 'auto' }}
          >
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center py-4 px-2"
                style={{ background: 'rgba(32,56,100,0.6)' }}
              >
                <span
                  className="text-[22px] font-bold text-white"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {value}
                </span>
                <span className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-5 text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
            © {new Date().getFullYear()} Complaye Consulting · AES-256 · TLS 1.3 · GDPR
          </p>

        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white overflow-y-auto px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <img src={complayeSymbol} alt="Complaye" className="h-8 w-auto" />
            <span className="font-semibold text-gray-900 text-sm">Complaye CIS</span>
          </div>
          {children}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-30px, 20px) scale(1.08); }
          66%       { transform: translate(20px, -15px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(25px, -30px) scale(1.1); }
          70%       { transform: translate(-15px, 20px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(15px, -20px); }
        }
      `}</style>
    </div>
  )
}
