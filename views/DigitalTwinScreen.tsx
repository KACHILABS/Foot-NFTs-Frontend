import React from 'react';
import Card from '../components/Card';
import { BackIcon } from '../src/components/Icons';

const DigitalTwinScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const tg = (window as any).Telegram?.WebApp;

  return (
    <div className="flex flex-col gap-0 pb-24 animate-in fade-in duration-300">
      {/* App Bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full border border-[rgba(120,255,190,0.10)] flex items-center justify-center text-[#a9bdb3] text-lg">
            ✕
          </button>
          <div className="flex items-center gap-2 text-[#eef7f1] font-bold text-lg" style={{ fontFamily: "'Oxanium', sans-serif" }}>
            <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_1px_rgba(74,222,128,0.7)]"></span>
            FootNfts App
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-[#a9bdb3]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>

      {/* Fan Status Strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(120,255,190,0.10)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border-2 border-[#16a34a] flex items-center justify-center text-[#eef7f1] font-bold text-sm relative" style={{ fontFamily: "'Oxanium', sans-serif", background: 'radial-gradient(circle at 30% 30%, #ff7a1a 0%, #7a1f00 55%, #1a0800 100%)' }}>
            KL
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0b1210] flex items-center justify-center text-[10px] border border-[rgba(120,255,190,0.18)]">🔥</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-[#6f8579] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>Fan Status</span>
              <span className="text-[9px] font-bold text-[#eab308] border border-[rgba(234,179,8,0.3)] rounded-full px-2 py-0.5" style={{ fontFamily: "'Space Mono', monospace" }}>◆ AMATEUR</span>
            </div>
            <div className="text-base font-bold text-[#eef7f1] mt-0.5" style={{ fontFamily: "'Oxanium', sans-serif" }}>Kachilabs</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full border border-[rgba(120,255,190,0.10)] flex items-center justify-center text-[#a9bdb3] relative">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-[#22c55e] text-[#04170c] text-[9px] font-bold flex items-center justify-center px-1 shadow-[0_0_0_3px_#060a08]">8</span>
          </div>
          <div className="w-9 h-9 rounded-full border border-[rgba(120,255,190,0.10)] flex items-center justify-center text-[#a9bdb3]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
        </div>
      </div>

      {/* Sub Nav */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#a9bdb3] text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6"/></svg>
          Back
        </button>
        <div className="flex items-center gap-1.5 text-[#4ade80] font-bold text-base" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          Digital Twin
          <span className="w-4 h-4 rounded-full border border-[#6f8579] text-[10px] flex items-center justify-center" style={{ fontFamily: "'Space Mono', monospace" }}>?</span>
        </div>
        <button className="flex items-center gap-1.5 bg-[#111c18] border border-[rgba(120,255,190,0.10)] rounded-full px-3 py-1.5 text-xs font-semibold text-[#eef7f1]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3l-5 3v4l3-1v11h12V9l3 1V6l-5-3-2 2h-4L8 3z"/></svg>
          My Jerseys
        </button>
      </div>

      {/* Pair Your Jersey */}
      <div className="px-4 mt-1">
        <Card className="bg-gradient-to-b from-[rgba(34,197,94,0.05)] to-transparent border border-[rgba(120,255,190,0.18)] rounded-[22px] p-5 text-center relative overflow-hidden">
          <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[220px] h-[220px] bg-[radial-gradient(circle,rgba(34,197,94,0.16)_0%,rgba(34,197,94,0)_70%)] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>Pair Your Jersey</div>
            <p className="text-xs text-[#a9bdb3] leading-relaxed max-w-[270px] mx-auto mb-5">Scan the QR code on your jersey or enter the JSN to pair</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#111c18] border border-dashed border-[rgba(120,255,190,0.18)] rounded-[16px] py-5 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-[rgba(120,255,190,0.18)] flex items-center justify-center text-[#4ade80]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/><rect x="9" y="9" width="6" height="6"/></svg>
                </div>
                <span className="text-xs font-semibold text-[#eef7f1]">Scan QR Code</span>
              </div>
              <div className="text-[10px] font-bold text-[#6f8579]" style={{ fontFamily: "'Space Mono', monospace" }}>OR</div>
              <div className="flex-1 bg-[#111c18] border border-dashed border-[rgba(120,255,190,0.18)] rounded-[16px] py-5 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-[rgba(120,255,190,0.18)] flex items-center justify-center text-[#4ade80]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 14h6"/></svg>
                </div>
                <span className="text-xs font-semibold text-[#eef7f1]">Enter JSN</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* My Paired Jersey */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-[3px] h-3 bg-[#22c55e] rounded-sm inline-block"></span>
            My Paired Jersey
          </div>
        </div>
        <Card className="bg-[#0e1613] border border-[rgba(120,255,190,0.18)] rounded-[22px] p-4">
          <div className="flex gap-3.5 items-stretch">
            <div className="w-[118px] h-[132px] rounded-[16px] border border-[rgba(120,255,190,0.18)] flex items-center justify-center relative overflow-hidden shrink-0" style={{ background: 'radial-gradient(120% 100% at 30% 0%, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.04) 55%, #111c18 100%)' }}>
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#22c55e] text-[#04170c] flex items-center justify-center text-xs font-bold shadow-[0_0_0_3px_rgba(0,0,0,0.25)]">✓</div>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round"><path d="M8 3L3 6v4l3-1v11h12V9l3 1V6l-5-3-2 2h-4L8 3z"/></svg>
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <div className="text-base font-bold text-[#eef7f1] leading-snug" style={{ fontFamily: "'Oxanium', sans-serif" }}>Arsenal 2025/26<br />Home Jersey</div>
                <div className="flex items-center gap-1.5 mt-2 text-[#6f8579]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  <span className="text-xs">JSN: ARS25-0004821</span>
                  <span className="text-xs cursor-pointer">⧉</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-start bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.35)] text-[#4ade80] text-[10px] font-bold px-2.5 py-1 rounded-full mt-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                ✓ AUTHENTIC & PAIRED
              </div>
            </div>
            <div className="flex items-center text-[#6f8579]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          </div>

          {/* Jersey Meta Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-[rgba(120,255,190,0.10)]">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-[#111c18] flex items-center justify-center text-[#a9bdb3] shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div>
                <div className="text-[10px] text-[#6f8579] leading-tight">Paired on</div>
                <div className="text-xs font-semibold text-[#eef7f1]">18 Aug 2025</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-[#111c18] flex items-center justify-center text-[#a9bdb3] shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/></svg>
              </div>
              <div>
                <div className="text-[10px] text-[#6f8579] leading-tight">Status</div>
                <div className="text-xs font-semibold text-[#4ade80]">Active</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-[#111c18] flex items-center justify-center text-[#a9bdb3] shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 21h8M12 17v4M7 4h10l-1 8a4 4 0 01-8 0L7 4z"/><path d="M5 4H3v2a4 4 0 004 4M19 4h2v2a4 4 0 01-4 4"/></svg>
              </div>
              <div>
                <div className="text-[10px] text-[#6f8579] leading-tight">Edition</div>
                <div className="text-xs font-semibold text-[#eef7f1]">Limited</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-[#111c18] flex items-center justify-center text-[#a9bdb3] shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
              </div>
              <div>
                <div className="text-[10px] text-[#6f8579] leading-tight">Owner</div>
                <div className="text-xs font-semibold text-[#eef7f1]">Kachilabs</div>
              </div>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-[#111c18] border border-[rgba(120,255,190,0.10)] rounded-[14px] py-3 px-1.5 flex flex-col items-center gap-2 text-center">
              <div className="w-7 h-7 flex items-center justify-center text-[#4ade80]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/></svg>
              </div>
              <div className="text-[11px] font-bold text-[#eef7f1] leading-tight">Highlights</div>
              <div className="text-[9px] text-[#6f8579]" style={{ fontFamily: "'Space Mono', monospace" }}>42 available</div>
            </div>
            <div className="bg-[#111c18] border border-[rgba(120,255,190,0.10)] rounded-[14px] py-3 px-1.5 flex flex-col items-center gap-2 text-center">
              <div className="w-7 h-7 flex items-center justify-center text-[#4ade80]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/><circle cx="8" cy="8.5" r="1.3" fill="currentColor" stroke="none"/></svg>
              </div>
              <div className="text-[11px] font-bold text-[#eef7f1] leading-tight">Match Canvas</div>
              <div className="text-[9px] text-[#6f8579]" style={{ fontFamily: "'Space Mono', monospace" }}>12 collected</div>
            </div>
            <div className="bg-[#111c18] border border-[rgba(120,255,190,0.10)] rounded-[14px] py-3 px-1.5 flex flex-col items-center gap-2 text-center">
              <div className="w-7 h-7 flex items-center justify-center text-[#4ade80]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.6 6.6L21 9.3l-5 4.6 1.3 6.8L12 17.6l-5.3 3.1L8 13.9 3 9.3l6.4-.7z"/></svg>
              </div>
              <div className="text-[11px] font-bold text-[#eef7f1] leading-tight">Moments</div>
              <div className="text-[9px] text-[#6f8579]" style={{ fontFamily: "'Space Mono', monospace" }}>8 unlocked</div>
            </div>
            <div className="bg-[#111c18] border border-[rgba(120,255,190,0.10)] rounded-[14px] py-3 px-1.5 flex flex-col items-center gap-2 text-center">
              <div className="w-7 h-7 flex items-center justify-center text-[#eab308]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 9h18M12 9v12M12 9c-2 0-4-1.2-4-3.5S9.5 3 12 5c0-1.5 1.5-2 3-1.5S17 6 16 7.5 12 9 12 9zM12 9c2 0 4-1.2 4-3.5S14.5 3 12 5c0-1.5-1.5-2-3-1.5S7 6 8 7.5 12 9 12 9z"/></svg>
              </div>
              <div className="text-[11px] font-bold text-[#eef7f1] leading-tight">Rewards</div>
              <div className="text-[9px] text-[#6f8579]" style={{ fontFamily: "'Space Mono', monospace" }}>3 available</div>
            </div>
          </div>

          {/* Request Highlight Package */}
          <div className="flex items-center justify-between mt-3 bg-[#111c18] border border-[rgba(120,255,190,0.10)] rounded-[16px] px-3.5 py-3">
            <div className="flex items-center gap-2.5 text-[#4ade80] text-sm font-semibold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4M21 6H8a5 5 0 00-5 5v1M7 22l-4-4 4-4M3 18h13a5 5 0 005-5v-1"/></svg>
              Request Highlight Package
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6f8579]"><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span className="w-[3px] h-3 bg-[#22c55e] rounded-sm inline-block"></span>
            Recent Activity
          </div>
          <div className="text-xs font-semibold text-[#4ade80]">View all</div>
        </div>
        <Card className="bg-[#0e1613] border border-[rgba(120,255,190,0.18)] rounded-[22px] p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c8102e] to-[#7a0a1d] flex items-center justify-center relative overflow-hidden shrink-0 border border-[rgba(255,255,255,0.08)]">
              <svg viewBox="0 0 44 44" width="44" height="44" style={{ position: 'absolute', inset: 0 }}>
                <circle cx="22" cy="14" r="7" fill="#f2c9a0" />
                <path d="M8 44c0-9 6-15 14-15s14 6 14 15z" fill="#c8102e" />
                <path d="M22 29l4 5-4 3-4-3z" fill="#fff" opacity="0.85" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#eef7f1]">Arsenal vs Man United</div>
              <div className="text-[10px] text-[#6f8579] mt-1" style={{ fontFamily: "'Space Mono', monospace" }}>Premier League · 17 Aug 2025</div>
            </div>
            <div className="flex items-center gap-1.5 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#4ade80] text-[11px] font-bold px-2.5 py-1.5 rounded-full shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>
              +120 FTC
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DigitalTwinScreen;
