import React from 'react';
import { Mail, Shield, Zap, Lock } from 'lucide-react';

interface GmailLoginCardProps {
  onLogin: () => void;
}

export default function GmailLoginCard({ onLogin }: GmailLoginCardProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px] p-8">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #4285f4 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #34a853 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#5d6fa3]/30 bg-[#1e2440]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335)' }} />

        <div className="p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4285f4, #1a73e8)', boxShadow: '0 8px 24px rgba(26,115,232,.4)' }}>
              <Mail size={28} color="#fff" strokeWidth={2} />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white tracking-tight">Gmail Inbox</div>
              <div className="text-xs text-[#9aa8cc] mt-0.5">Powered by Gmail API</div>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            Connect Your Gmail
          </h2>
          <p className="text-sm text-[#9aa8cc] mb-8 leading-relaxed">
            Sign in with Google to access your real Gmail inbox — read emails, search, and manage messages securely.
          </p>

          {/* Sign-in button */}
          <button
            id="gmail-connect-btn"
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl border border-white/20 bg-white/95 text-[#3c4043] text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl hover:bg-white active:scale-[0.99]"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,.35)', fontFamily: 'inherit' }}
          >
            {/* Google G logo */}
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-white/8">
            {[
              { icon: Shield, label: 'OAuth 2.0' },
              { icon: Zap, label: 'Real-time' },
              { icon: Lock, label: 'httpOnly Cookie' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={15} className="text-[#5d6fa3]" />
                <span className="text-[10px] text-[#5d6fa3] font-medium whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
