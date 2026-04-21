// views/SplashScreen.tsx
import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { CLUBS } from '../constants';
import { api } from '../src/services/api';

interface SplashScreenProps {
  onComplete: (name: string, clubId: string, customClub?: string) => void;
  onClaimBonus?: (amount: number) => void;
}

/** Read the referral code from Telegram's start_param or the URL query string */
function detectReferralCode(): string {
  // 1. Telegram Mini App start_param  (e.g. startapp=ref_ABCD1234)
  try {
    const tg = (window as any).Telegram?.WebApp;
    const startParam: string = tg?.initDataUnsafe?.start_param || '';
    if (startParam.startsWith('ref_')) {
      const code = startParam.slice(4).trim();
      if (code) {
        console.log('🔗 [REFERRAL] Code detected from Telegram start_param:', code);
        return code;
      }
    }
  } catch (_) {}

  // 2. Fallback: plain URL query param  (?ref=ABCD1234  or  ?startapp=ref_ABCD1234)
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('startapp') || '';
    const code = ref.startsWith('ref_') ? ref.slice(4).trim() : ref.trim();
    if (code) {
      console.log('🔗 [REFERRAL] Code detected from URL query param:', code);
      return code;
    }
  } catch (_) {}

  return '';
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onClaimBonus }) => {
  const [name, setName] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [customClub, setCustomClub] = useState('');
  // Referral code — pre-filled from URL if available, user can also type one
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeLocked, setReferralCodeLocked] = useState(false); // true = came from URL, readonly
  const [showBonus, setShowBonus] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  // On mount, auto-detect referral code
  useEffect(() => {
    const detected = detectReferralCode();
    if (detected) {
      setReferralCode(detected);
      setReferralCodeLocked(true); // came from a link — show but don't let user change it accidentally
    }
  }, []);

  const handleContinue = () => {
    if (!name.trim()) { alert('Please enter your name'); return; }
    if (!selectedClub) { alert('Please select your favorite club'); return; }
    if (selectedClub === 'other' && !customClub.trim()) { alert('Please enter your club name'); return; }
    setShowBonus(true);
  };

  const handleClaimBonus = async () => {
    setClaiming(true);
    setError('');

    try {
      const tg = (window as any).Telegram?.WebApp;
      const telegramUser = tg?.initDataUnsafe?.user;
      const telegramId = telegramUser?.id || 123456789;
      const telegramUsername = telegramUser?.username || 'User';

      // Sanitise the code one more time before sending
      const codeToSend = referralCode.trim().toUpperCase().replace(/^REF_/, '') || undefined;

      console.log('📝 [SIGNUP] Creating/loading user...', { telegramId, codeToSend });

      // ── KEY FIX: pass referralCode as the third argument ──────────────────
      const loginResult = await api.auth.login(telegramId, telegramUsername, codeToSend);

      if (!loginResult.success) {
        throw new Error('Failed to create/load user');
      }

      console.log('✅ [SIGNUP] User loaded:', loginResult.user.id);

      if (loginResult.user.profileCompleted || loginResult.user.hasClaimedWelcomeBonus) {
        console.log('[SIGNUP] Existing user — skipping bonus');
        if (onClaimBonus) onClaimBonus(0);
        setTimeout(() => {
          setClaiming(false);
          onComplete(name, selectedClub === 'other' ? 'other' : selectedClub, selectedClub === 'other' ? customClub : undefined);
        }, 500);
        return;
      }

      console.log('🎁 [SIGNUP] New user — claiming welcome bonus...');
      const bonusResult = await api.user.claimWelcomeBonus(loginResult.user.id);

      if (bonusResult.success || bonusResult.alreadyClaimed) {
        if (onClaimBonus) onClaimBonus(bonusResult.bonusAmount || 0);
        setTimeout(() => {
          setClaiming(false);
          onComplete(name, selectedClub === 'other' ? 'other' : selectedClub, selectedClub === 'other' ? customClub : undefined);
        }, 500);
      } else {
        throw new Error(bonusResult.error || 'Failed to claim bonus');
      }
    } catch (err: any) {
      console.error('❌ [SIGNUP] Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setClaiming(false);
    }
  };

  // ── Bonus screen ────────────────────────────────────────────────────────────
  if (showBonus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-darkBg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="text-center relative z-10 animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Welcome to the Pitch! 🎉</h2>
          <p className="text-gray-400 mb-8">You've joined the Founding Council</p>

          <div className="bg-darkCard rounded-2xl p-6 mb-8 border border-green-500/30">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">🎁</span>
              <span className="text-2xl font-black text-green-500">+50 FTC</span>
            </div>
            <p className="text-sm text-gray-400">Onboarding Bonus • Claim now to start your journey</p>
            {referralCode && (
              <p className="text-xs text-green-400 mt-2">
                ✅ Referral code <span className="font-bold">{referralCode}</span> will be applied
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button onClick={handleClaimBonus} disabled={claiming} className="mt-4">
            {claiming ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Claim 50 FTC Bonus 🎁'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-darkBg">
      {/* Logo */}
      <div className="mb-10 text-center animate-fade-in-up relative z-10">
        <img
          src="/logo.png"
          alt="FOOT NFTs Logo"
          className="w-28 h-28 mx-auto mb-6 object-contain"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.onerror = null;
            t.src = 'https://placehold.co/112x112/22c55e/ffffff?text=FOOT';
          }}
        />
        <h1 className="text-4xl font-black text-white mb-2 font-display">FOOT NFTs</h1>
        <p className="text-gray-400">Own the moment. Rep the club.</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm space-y-5 relative z-10">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name</label>
          <input
            type="text"
            placeholder="e.g., LeoFan10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-2xl bg-darkCard border border-gray-800 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Club picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Favorite Club</label>
          <div className="relative">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full p-4 rounded-2xl bg-darkCard border border-gray-800 text-white focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-darkCard text-gray-400">Select your club</option>
              {CLUBS.map(club => (
                <option key={club.id} value={club.id} className="bg-darkCard text-white">{club.name}</option>
              ))}
              <option value="other" className="bg-darkCard text-green-500">➕ Other (Enter your club)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Custom club */}
        {selectedClub === 'other' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Enter Your Club</label>
            <input
              type="text"
              placeholder="e.g., Inter Miami, FC Barcelona, My Local Team"
              value={customClub}
              onChange={(e) => setCustomClub(e.target.value)}
              className="w-full p-4 rounded-2xl bg-darkCard border border-green-500/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
              autoFocus
            />
            <p className="text-[10px] text-gray-500 mt-2">Your club will be added to your profile</p>
          </div>
        )}

        {/* ── Referral code field (NEW) ──────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Referral Code <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., ABCD1234"
              value={referralCode}
              onChange={(e) => !referralCodeLocked && setReferralCode(e.target.value.toUpperCase().trim())}
              readOnly={referralCodeLocked}
              maxLength={8}
              className={`w-full p-4 rounded-2xl bg-darkCard border text-white placeholder:text-gray-500 outline-none uppercase tracking-widest font-mono
                ${referralCodeLocked
                  ? 'border-green-500/60 text-green-400 cursor-default'
                  : 'border-gray-800 focus:ring-2 focus:ring-green-500'
                }`}
            />
            {referralCodeLocked && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-xs font-semibold">✓ Applied</span>
            )}
          </div>
          {referralCodeLocked
            ? <p className="text-[10px] text-green-500/70 mt-2">Referral link detected — code pre-filled automatically</p>
            : <p className="text-[10px] text-gray-500 mt-2">Have a friend's referral code? Enter it here to credit them</p>
          }
        </div>

        <Button onClick={handleContinue} className="mt-4">
          Enter the Stadium
        </Button>
      </div>

      <div className="mt-12 text-center relative z-10">
        <p className="text-xs text-gray-600 uppercase tracking-widest">Powered by TON Blockchain</p>
      </div>
    </div>
  );
};

export default SplashScreen;