import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { BackIcon } from '../src/components/Icons';

interface DigitalTwinScreenProps {
  onBack?: () => void;
}

const DigitalTwinScreen: React.FC<DigitalTwinScreenProps> = ({ onBack }) => {
  const tg = (window as any).Telegram?.WebApp;
  const [showScanner, setShowScanner] = useState(false);
  const [showJsnInput, setShowJsnInput] = useState(false);
  const [jsnValue, setJsnValue] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setCameraReady(false);
    setPermissionDenied(false);
    setScanError(null);
  };

  const startDetection = () => {
    if (!('BarcodeDetector' in window)) {
      console.warn('BarcodeDetector not supported in this browser');
      return;
    }
    try {
      // @ts-ignore
      detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] });
      detectFrame();
    } catch (e) {
      console.error('BarcodeDetector init error:', e);
    }
  };

  const detectFrame = async () => {
    if (!videoRef.current || !detectorRef.current || videoRef.current.readyState < 2) {
      if (showScanner) {
        animFrameRef.current = requestAnimationFrame(detectFrame);
      }
      return;
    }
    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes && barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        tg?.HapticFeedback.notificationOccurred('success');
        setJsnValue(code);
        setShowScanner(false);
        stopCamera();
        return;
      }
    } catch (e) {
      // ignore frame errors
    }
    if (showScanner) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
    }
  };

  useEffect(() => {
    if (showScanner && streamRef.current && videoRef.current && !cameraReady) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.muted = true;
      videoRef.current.play()
        .then(() => {
          setCameraReady(true);
          setPermissionDenied(false);
          startDetection();
        })
        .catch((err) => {
          console.error('Video play error:', err);
          setScanError('Failed to start camera preview');
        });
    }
  }, [showScanner, cameraReady]);

  const requestCamera = async () => {
    try {
      setScanError(null);
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      setShowScanner(true);
    } catch (err: any) {
      console.error('Camera permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setScanError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setScanError('No camera found on this device');
      } else {
        setScanError(err.message || 'Camera access denied');
      }
      setShowScanner(true);
    }
  };

  const handleScanClick = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanError('Camera not supported in this browser');
      setShowScanner(true);
      return;
    }
    await requestCamera();
  };

  const handleCloseScanner = () => {
    stopCamera();
    setShowScanner(false);
    setScanError(null);
  };

  const handleJsnSubmit = () => {
    if (!jsnValue.trim()) return;
    tg?.HapticFeedback.notificationOccurred('success');
    setShowJsnInput(false);
    setJsnValue('');
  };

  const quickActions = [
    {
      label: 'Highlights',
      sub: '42 available',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
        </svg>
      ),
      color: 'text-[#4ade80]'
    },
    {
      label: 'Match Canvas',
      sub: '12 collected',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 15l5-5 4 4 3-3 6 6" />
          <circle cx="8" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      ),
      color: 'text-[#4ade80]'
    },
    {
      label: 'Moments',
      sub: '8 unlocked',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l2.6 6.6L21 9.3l-5 4.6 1.3 6.8L12 17.6l-5.3 3.1L8 13.9 3 9.3l6.4-.7z" />
        </svg>
      ),
      color: 'text-[#4ade80]'
    },
    {
      label: 'Rewards',
      sub: '3 available',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="9" width="18" height="12" rx="1.5" />
          <path d="M3 9h18M12 9v12M12 9c-2 0-4-1.2-4-3.5S9.5 3 12 5c0-1.5 1.5-2 3-1.5S17 6 16 7.5 12 9 12 9zM12 9c2 0 4-1.2 4-3.5S14.5 3 12 5c0-1.5-1.5-2-3-1.5S7 6 8 7.5 12 9 12 9z" />
        </svg>
      ),
      color: 'text-[#eab308]'
    }
  ];

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-300 bg-[#060a08]">
      {/* Sub Nav */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
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
      <div className="px-4">
        <Card className="bg-gradient-to-b from-[rgba(34,197,94,0.05)] to-transparent border border-[rgba(120,255,190,0.18)] rounded-[22px] p-5 text-center relative overflow-hidden">
          <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[220px] h-[220px] bg-[radial-gradient(circle,rgba(34,197,94,0.16)_0%,rgba(34,197,94,0)_70%)] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>Pair Your Jersey</div>
            <p className="text-xs text-[#a9bdb3] leading-relaxed max-w-[270px] mx-auto mb-5">Scan the QR code on your jersey or enter the JSN to pair</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleScanClick}
                className="flex-1 bg-[#111c18] border border-dashed border-[rgba(120,255,190,0.18)] rounded-[16px] py-5 flex flex-col items-center gap-2 hover:border-[rgba(120,255,190,0.35)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full border border-[rgba(120,255,190,0.18)] flex items-center justify-center text-[#4ade80]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/><rect x="9" y="9" width="6" height="6"/></svg>
                </div>
                <span className="text-xs font-semibold text-[#eef7f1]">Scan QR Code</span>
              </button>
              <div className="text-[10px] font-bold text-[#6f8579]" style={{ fontFamily: "'Space Mono', monospace" }}>OR</div>
              <button
                onClick={() => setShowJsnInput(true)}
                className="flex-1 bg-[#111c18] border border-dashed border-[rgba(120,255,190,0.18)] rounded-[16px] py-5 flex flex-col items-center gap-2 hover:border-[rgba(120,255,190,0.35)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full border border-[rgba(120,255,190,0.18)] flex items-center justify-center text-[#4ade80]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 14h6"/></svg>
                </div>
                <span className="text-xs font-semibold text-[#eef7f1]">Enter JSN</span>
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* My Paired Jersey */}
      <div className="px-4">
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
        </Card>
      </div>

      {/* Quick Actions - 2 per row, marketplace-style */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((item) => (
            <Card key={item.label} className="p-5 flex flex-col items-center text-center border-[rgba(120,255,190,0.18)] bg-[#0e1613] h-full relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#111c18] rounded-full blur-xl opacity-50"></div>
              <div className={`w-20 h-20 bg-[#111c18] rounded-2xl flex items-center justify-center mb-4 border border-[rgba(120,255,190,0.10)] ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-[8px] font-black text-[#6f8579] uppercase tracking-widest mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Digital Twin</p>
              <p className="text-sm font-black text-white mb-1 leading-tight">{item.label}</p>
              <p className="text-[9px] text-[#6f8579] font-bold uppercase mb-4">{item.sub}</p>
              <button className="w-full py-2.5 bg-[#111c18] text-[#4ade80] rounded-xl text-[9px] font-black uppercase tracking-widest border border-[rgba(120,255,190,0.10)] shadow-sm">
                Open
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* Request Highlight Package */}
      <div className="px-4">
        <button className="w-full flex items-center justify-between bg-[#111c18] border border-[rgba(120,255,190,0.10)] rounded-[16px] px-4 py-3.5 hover:border-[rgba(120,255,190,0.25)] transition-colors">
          <div className="flex items-center gap-2.5 text-[#4ade80] text-sm font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4M21 6H8a5 5 0 00-5 5v1M7 22l-4-4 4-4M3 18h13a5 5 0 005-5v-1"/></svg>
            Request Highlight Package
          </div>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6f8579]"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
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

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button onClick={handleCloseScanner} className="text-white text-sm font-bold">Cancel</button>
            <span className="text-white text-sm font-bold">Scan QR Code</span>
            <div className="w-10"></div>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4">
            <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden border border-gray-700">
              {permissionDenied ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-6">
                  <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center text-red-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/><rect x="9" y="9" width="6" height="6"/></svg>
                  </div>
                  <p className="text-sm text-red-300 font-medium">Camera access denied</p>
                  <p className="text-xs text-gray-400">Please enable camera permissions in your browser settings and try again.</p>
                  <button onClick={handleCloseScanner} className="px-6 py-3 bg-gray-800 text-white rounded-full text-sm font-bold border border-gray-700">
                    Close
                  </button>
                </div>
              ) : cameraReady ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white/30 rounded-2xl"></div>
                    <div className="absolute w-56 h-56 border-2 border-[#4ade80] rounded-2xl opacity-80 animate-pulse"></div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-6">
                  <div className="w-16 h-16 rounded-full border border-gray-700 flex items-center justify-center text-gray-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin"><path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/><rect x="9" y="9" width="6" height="6"/></svg>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">Requesting camera access...</p>
                  <p className="text-xs text-gray-500">Please allow camera permission when prompted</p>
                </div>
              )}
            </div>
          </div>
          {scanError && !permissionDenied && (
            <div className="p-4 text-center text-red-400 text-xs font-medium">{scanError}</div>
          )}
        </div>
      )}

      {/* JSN Input Modal */}
      {showJsnInput && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-[#0e1613] border border-[rgba(120,255,190,0.18)] rounded-[22px] p-5">
            <div className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>Enter JSN</div>
            <p className="text-xs text-[#a9bdb3] mb-4">Type the Jersey Serial Number from your tag</p>
            <input
              value={jsnValue}
              onChange={(e) => setJsnValue(e.target.value)}
              placeholder="e.g. ARS25-0004821"
              className="w-full bg-[#111c18] border border-[rgba(120,255,190,0.18)] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#4ade80] mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowJsnInput(false)} className="flex-1 py-3 rounded-full border border-[#2c3648] text-white font-bold text-sm">Cancel</button>
              <button onClick={handleJsnSubmit} className="flex-1 py-3 rounded-full bg-[#22c55e] text-black font-bold text-sm">Pair</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DigitalTwinScreen;
