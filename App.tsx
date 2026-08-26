import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import { checkAppVersion, getUserId, isAuthenticated, getAuthToken, setAuthSession } from './src/utils/versionControl';
import SplashScreen from './views/SplashScreen';
import MaintenanceScreen from './views/MaintenanceScreen';
import footnftLogo from './src/assets/footnft_logo.png';
import trophyImage from './src/assets/trophy.png';
import uclLogo from './src/assets/ucl_logo.png';
import DashboardScreen from './views/DashboardScreen';

const MAINTENANCE_MODE = false;

// ===== FLYER-STYLE CHAMPIONS LEAGUE SPLASH SCREEN =====

type SplashStar = {
  id: number;
  left: string;
  top: string;
  fontSize: string;
  delay: string;
};

const SPLASH_MESSAGES = [
  'Loading matchday…',
  'Shuffling the group stage…',
  'Polishing the trophy…',
  'Counting the stars…',
  'Ready.'
];

const ChampionsLeagueSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(SPLASH_MESSAGES[0]);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [minDurationPassed, setMinDurationPassed] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const autoCompleteTimeout = useRef<number | null>(null);
  const hasCompleted = useRef(false);

  const stars = useMemo<SplashStar[]>(() =>
    Array.from({ length: 22 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${8 + Math.random() * 10}px`,
      delay: `${Math.random() * 3.5}s`,
    })),
    []
  );

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 150);
    const minTimer = setTimeout(() => setMinDurationPassed(true), 7000);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(100, prev + Math.random() * 9 + 4));
    }, 220);

    autoCompleteTimeout.current = window.setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        setFadeOut(true);
        setTimeout(onComplete, 500);
      }
    }, 7000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(minTimer);
      clearInterval(progressInterval);
      if (autoCompleteTimeout.current) window.clearTimeout(autoCompleteTimeout.current);
    };
  }, [onComplete]);

  useEffect(() => {
    if (progress >= 100) {
      setLoaderDone(true);
      setLoadingMessage(SPLASH_MESSAGES[SPLASH_MESSAGES.length - 1]);
    } else {
      const idx = Math.min(Math.floor(progress / 25), SPLASH_MESSAGES.length - 2);
      setLoadingMessage(SPLASH_MESSAGES[idx]);
    }
  }, [progress]);

  useEffect(() => {
    if (loaderDone && minDurationPassed) {
      const showTimeout = setTimeout(() => setButtonVisible(true), 300);
      return () => clearTimeout(showTimeout);
    }
  }, [loaderDone, minDurationPassed]);

  const handleEnter = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    if (autoCompleteTimeout.current) window.clearTimeout(autoCompleteTimeout.current);
    setFadeOut(true);
    setTimeout(onComplete, 500);
  };

  const StarIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-green-400" fill="currentColor" aria-hidden="true">
      <path d="M12 2.3l2.8 6.7 7.1 1-5.4 4.9 1.3 7.1L12 17.8l-6.8 3.6 1.3-7.1-5.4-4.9 7.1-1L12 2.3z" />
    </svg>
  );

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: 'radial-gradient(120% 90% at 50% -10%, #14257a 0%, transparent 55%), radial-gradient(90% 70% at 100% 110%, #071233 0%, transparent 60%), linear-gradient(160deg, #050b1f 0%, #0a1440 45%, #0c1c52 75%, #071233 100%)'
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="facet f1" />
        <div className="facet f2" />
        <div className="facet f3" />
        <div className="facet f4" />
        <div className="facet f5" />
        <div className="shard s1" />
        <div className="shard s2" />
        <div className="sheen" />
        <div className="grain" />
        <div className="stars absolute inset-0">
          {stars.map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: star.left,
                top: star.top,
                fontSize: star.fontSize,
                animationDelay: star.delay,
              }}
            >
              ★
            </div>
          ))}
        </div>
      </div>

      <div className={`relative z-10 text-center px-6 max-w-sm mx-auto transition-all duration-700 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="eyebrow text-[12px] uppercase tracking-[0.42em] text-cyan-400 mb-7 font-[Barlow_Condensed] opacity-85">
          Own the Moment · Own the Pitch
        </div>

        <div className="lockup flex items-center justify-center gap-6 mb-8 flex-wrap max-w-[92vw] mx-auto">
          <div className="mark foot">
            <img src={footnftLogo} alt="FootNFTs logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/10 shadow-[0_0_0_3px_rgba(255,255,255,0.08),0_0_24px_rgba(255,120,40,0.28),0_10px_24px_rgba(0,0,0,0.35)] object-cover" />
          </div>
          <div className="divider text-[18px] sm:text-[20px] text-slate-300/40">×</div>
          <div className="mark trophy">
            <img src={trophyImage} alt="UEFA Champions League trophy" className="h-16 sm:h-[108px] w-auto object-contain rounded-full" />
          </div>
          <div className="divider text-[18px] sm:text-[20px] text-slate-300/40">×</div>
          <div className="mark ucl">
            <img src={uclLogo} alt="UEFA Champions League logo" className="h-14 sm:h-[80px] w-auto object-contain rounded-full" />
          </div>
        </div>

        <h1 className="title text-[clamp(38px,7vw,74px)] font-[Anton] font-normal tracking-[0.02em] leading-[0.95] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white text-shadow-[0_0_40px_rgba(53,232,255,0.25)] mb-4">
          FOOT<span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">NFTS</span>
        </h1>

        <div className="subtitle font-[Barlow_Condensed] font-semibold uppercase tracking-[0.28em] text-slate-300 text-[clamp(12px,2vw,16px)] mb-7">
          UEFA Champions League <span className="season text-yellow-300">· 2026/27</span>
        </div>

        <div className="tags flex flex-wrap justify-center gap-2 mb-10">
          <span className="tag text-[13px] uppercase tracking-[0.08em] px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">Vote</span>
          <span className="tag text-[13px] uppercase tracking-[0.08em] px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">Banter</span>
          <span className="tag text-[13px] uppercase tracking-[0.08em] px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">Earn FTC</span>
        </div>

        <div className={`loader-wrap mx-auto w-full max-w-[280px] transition-opacity duration-300 ${buttonVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="loader-track relative w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
            <div className="loader-fill absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_16px_rgba(53,232,255,0.6)]" style={{ width: `${progress}%` }} />
          </div>
          <div className="loader-label text-[11px] uppercase tracking-[0.3em] text-slate-300/70 font-[Barlow_Condensed] text-center">
            {loadingMessage}
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnter}
          className={`enter-btn mt-6 px-9 py-3 rounded-full text-sm font-bold uppercase tracking-[0.16em] text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_12px_30px_rgba(53,232,255,0.35)] transition-all ${buttonVisible ? 'show' : ''}`}
        >
          Enter the Arena
        </button>
      </div>

      <div className="footer-note absolute bottom-5 left-0 right-0 text-center text-[11px] uppercase tracking-[0.2em] text-slate-300/30">
        © 2026 Foot NFTs · Kachi Labs — Built for fans, built by fans
      </div>

      <style>{`
        .facet {
          position: absolute;
          background: linear-gradient(135deg, rgba(53,232,255,0.10), rgba(47,95,224,0.04) 60%, transparent);
          border: 1px solid rgba(120,170,255,0.14);
          clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
          filter: blur(0.2px);
        }
        .f1 { width: 520px; height: 520px; top: -160px; left: -140px; transform: rotate(12deg); opacity: .55; }
        .f2 { width: 380px; height: 380px; top: 55%; left: -120px; transform: rotate(-18deg); opacity: .4; }
        .f3 { width: 640px; height: 640px; top: -220px; right: -220px; transform: rotate(-8deg); opacity: .5; }
        .f4 { width: 420px; height: 420px; bottom: -180px; right: -80px; transform: rotate(22deg); opacity: .45; }
        .f5 { width: 300px; height: 300px; bottom: -120px; left: 20%; transform: rotate(-30deg); opacity: .3; }
        .shard {
          position: absolute;
          background: linear-gradient(120deg, rgba(255,255,255,0.05), transparent 70%);
          clip-path: polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%);
        }
        .s1 { width: 220px; height: 900px; top: -100px; left: 12%; transform: rotate(18deg); opacity: .12; }
        .s2 { width: 160px; height: 900px; top: -200px; right: 22%; transform: rotate(-14deg); opacity: .10; }
        .sheen {
          position: absolute;
          inset: -20%;
          background: conic-gradient(from 210deg at 50% 45%, transparent 0deg, rgba(53,232,255,0.08) 40deg, transparent 90deg, transparent 300deg, rgba(120,140,255,0.06) 340deg, transparent 360deg);
          animation: rotateSheen 22s linear infinite;
        }
        .grain {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 3px 3px;
          opacity: .5;
          mix-blend-mode: overlay;
        }
        .star {
          position: absolute;
          color: rgba(255,255,255,0.55);
          animation: twinkle 3.5s ease-in-out infinite;
        }
        .enter-btn {
          opacity: 0;
          transform: translateY(6px);
          pointer-events: none;
        }
        .enter-btn.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          transition: opacity .5s ease, transform .5s ease;
        }
        @keyframes rotateSheen { to { transform: rotate(360deg); } }
        @keyframes twinkle { 0%, 100% { opacity: .15; } 50% { opacity: .75; } }
      `}</style>
    </div>
  );
};

// === REST OF YOUR APP CODE (unchanged) ===
const calculateRank = (activityCount: number, referralCount: number): FanRank => {
  if (referralCount >= 5 || activityCount >= 100) return 'Founding Legend';
  if (activityCount >= 60) return 'Legend';
  if (activityCount >= 30) return 'Ultra';
  if (activityCount >= 15) return 'Regular';
  if (activityCount >= 5) return 'Supporter';
  return 'Amateur';
};

const getReferralCodeFromUrl = (): string | null => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param;
    if (startParam && startParam.startsWith('ref_')) {
      return startParam.replace('ref_', '');
    }
    const urlParams = new URLSearchParams(window.location.search);
    const startapp = urlParams.get('startapp');
    if (startapp && startapp.startsWith('ref_')) {
      return startapp.replace('ref_', '');
    }
  } catch (error) {
    console.error('Failed to get referral code:', error);
  }
  return null;
};

const App: React.FC = () => {
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <AppContent />
    </TonConnectUIProvider>
  );
};

const AppContent: React.FC = () => {
  const tg = (window as any).Telegram?.WebApp;
  
  const [showWorldCupSplash, setShowWorldCupSplash] = useState(true);
  
  useEffect(() => {
    const wasCleared = checkAppVersion();
    if (wasCleared) {
      console.log('App version updated, session cleared');
    }
  }, []);

  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    const isAuth = isAuthenticated();
    const hasCompletedProfile = localStorage.getItem('profile_completed') === 'true';
    
    if (isAuth && hasCompletedProfile) {
      return {
        waitlistJoined: true,
        waitlistConfirmed: true,
        profileCompleted: true,
        walletConnected: true,
        clubSelected: true,
        referralCode: localStorage.getItem('referralCode') || 'FTC-' + Math.random().toString(36).substring(7).toUpperCase(),
        referralCount: parseInt(localStorage.getItem('referralCount') || '0'),
        activityCount: parseInt(localStorage.getItem('activityCount') || '0')
      };
    }
    return {
      waitlistJoined: true,
      waitlistConfirmed: true,
      profileCompleted: false,
      walletConnected: false,
      clubSelected: false,
      referralCode: 'FTC-' + Math.random().toString(36).substring(7).toUpperCase(),
      referralCount: 0,
      activityCount: 0
    };
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [wallet, setWallet] = useState<WalletState | null>(() => {
    const savedWallet = localStorage.getItem('user_wallet');
    if (savedWallet) {
      try {
        return JSON.parse(savedWallet);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [backendUserId, setBackendUserId] = useState<string | null>(getUserId());
  const [loading, setLoading] = useState(true);

  const markProfileCompleted = async (userId: string) => {
    try {
      const response = await fetch(`https://footnfts.up.railway.app/api/user/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      console.log('Profile completion saved:', data);
    } catch (error) {
      console.error('Failed to save profile completion:', error);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      const telegramId = localStorage.getItem('telegramId');
      if (!telegramId) {
        setLoading(false);
        return;
      }
      
      try {
        const profileRes = await api.user.getProfile(parseInt(telegramId));
        if (profileRes.success && profileRes.profile) {
          const userProfile = {
            id: profileRes.profile.id,
            displayName: profileRes.profile.displayName,
            avatar: profileRes.profile.avatar || 'https://picsum.photos/200',
            favoriteClubId: profileRes.profile.favoriteClubId || localStorage.getItem('user_club_id') || '',
            favoriteClubName: profileRes.profile.favoriteClubName || localStorage.getItem('user_club_name') || '',
            fanRank: profileRes.profile.fanRank || 'Amateur'
          };
          
          setProfile(userProfile);
          
          setWallet({
            address: profileRes.profile.walletAddress || null,
            balanceFTC: profileRes.profile.ftcBalance || 0,
            isConnected: true
          });
          
          setBackendUserId(profileRes.profile.id);
          
          localStorage.setItem('user_profile', JSON.stringify(userProfile));
          localStorage.setItem('user_wallet', JSON.stringify({
            address: profileRes.profile.walletAddress || null,
            balanceFTC: profileRes.profile.ftcBalance || 0,
            isConnected: true
          }));
          
          if (userProfile.displayName && userProfile.favoriteClubId) {
            localStorage.setItem('profile_completed', 'true');
            setOnboarding(prev => ({
              ...prev,
              profileCompleted: true,
              walletConnected: true,
              clubSelected: true
            }));
          }
        } else {
          console.log('Profile not complete, needs onboarding');
          localStorage.removeItem('profile_completed');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      tg.setHeaderColor('#050505');
      tg.setBackgroundColor('#050505');
    }
  }, [tg]);

  const handleUpdateWallet = (update: Partial<WalletState>) => {
    setWallet(prev => {
      const newWallet = prev ? { ...prev, ...update } : null;
      if (newWallet) {
        localStorage.setItem('user_wallet', JSON.stringify(newWallet));
      }
      return newWallet;
    });
  };

  const handleTriviaComplete = () => {};

  const withHaptic = (fn: () => void | Promise<void>) => {
    tg?.HapticFeedback.impactOccurred('medium');
    const result = fn();
    if (result instanceof Promise) {
      result.catch((err) => console.error('withHaptic async error:', err));
    }
  };

  const getClubNameById = (clubId: string): string => {
    if (clubId === 'other') return 'Other';
    const club = CLUBS.find(c => c.id === clubId);
    return club?.name || clubId;
  };

  const isProfileComplete = profile?.displayName && profile?.favoriteClubId && 
    localStorage.getItem('profile_completed') === 'true';

  const handleWorldCupSplashComplete = () => {
    setShowWorldCupSplash(false);
  };

  if (MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (showWorldCupSplash) {
    return <ChampionsLeagueSplash onComplete={handleWorldCupSplashComplete} />;
  }

  if (!isProfileComplete) {
    return (
      <SplashScreen 
        onComplete={async (name, clubId, customClub) => {
          withHaptic(async () => {
            const finalClubId = clubId === 'other' ? customClub || 'Other' : clubId;
            const finalClubName = clubId === 'other' ? customClub || 'Other' : getClubNameById(clubId);
            
            const telegramUser = tg?.initDataUnsafe?.user;
            const telegramId = telegramUser?.id || 123456789;
            const telegramUsername = telegramUser?.username || 'User';
            
            const referralCode = getReferralCodeFromUrl();
            
            localStorage.setItem('user_club_id', finalClubId);
            localStorage.setItem('user_club_name', finalClubName);
            localStorage.setItem('user_display_name', name);
            
            const result = await api.auth.login(telegramId, telegramUsername, referralCode || undefined);
            if (result.success) {
              setBackendUserId(result.user.id);

              if (result.token) {
                localStorage.setItem('token', result.token);
                setAuthSession(result.token, result.user.id);
              }
              
              const newProfile = {
                id: result.user.id,
                displayName: name,
                avatar: 'https://picsum.photos/200',
                favoriteClubId: finalClubId,
                favoriteClubName: finalClubName,
                fanRank: calculateRank(0, 0)
              };
              
              setProfile(newProfile);
              setWallet({
                address: null,
                balanceFTC: result.user.ftcBalance || 0,
                isConnected: true
              });
              
              localStorage.setItem('user_profile', JSON.stringify(newProfile));
              localStorage.setItem('user_wallet', JSON.stringify({
                address: null,
                balanceFTC: result.user.ftcBalance || 0,
                isConnected: true
              }));
              localStorage.setItem('profile_completed', 'true');
              localStorage.setItem('telegramId', telegramId.toString());
              
              if (result.user.referralCode) {
                localStorage.setItem('referralCode', result.user.referralCode);
              }
              
              setOnboarding(prev => ({
                ...prev,
                profileCompleted: true,
                clubSelected: true,
                walletConnected: true,
                referralCode: result.user.referralCode || prev.referralCode
              }));

              if (!result.user.hasClaimedWelcomeBonus) {
                try {
                  const bonusResult = await api.user.claimWelcomeBonus(result.user.id);
                  if (bonusResult.success) {
                    const bonusBalance = (result.user.ftcBalance || 0) + bonusResult.bonusAmount;
                    setWallet(prev => prev ? { ...prev, balanceFTC: bonusBalance } : null);
                    localStorage.setItem('user_wallet', JSON.stringify({
                      address: null,
                      balanceFTC: bonusBalance,
                      isConnected: true
                    }));
                    localStorage.setItem('welcome_bonus_claimed', 'true');
                    localStorage.setItem('has_seen_welcome_bonus', 'true');
                  }
                } catch (bonusErr) {
                  console.error('Failed to claim welcome bonus:', bonusErr);
                }
              }
              
              await markProfileCompleted(result.user.id);
            }
          });
        }}
        onClaimBonus={(amount) => {
          console.log('🎁 Bonus claimed in SplashScreen:', amount);
          if (wallet) {
            const newBalance = (wallet.balanceFTC || 0) + amount;
            handleUpdateWallet({ balanceFTC: newBalance });
          }
        }}
      />
    );
  }

  return (
    <DashboardScreen 
      profile={profile} 
      wallet={wallet} 
      onboarding={onboarding}
      backendUserId={backendUserId}
      onChangeClub={() => withHaptic(() => {
        setProfile(prev => prev ? { ...prev, favoriteClubId: null } : null);
        setOnboarding(prev => ({ ...prev, clubSelected: false, profileCompleted: false }));
        localStorage.removeItem('profile_completed');
        localStorage.removeItem('user_club_id');
        localStorage.removeItem('user_club_name');
      })}
      onUpdateProfile={async (newName) => {
        if (newName) {
          withHaptic(async () => {
            const result = await api.user.updateProfile({ displayName: newName });
            if (result.success && profile) {
              const updatedProfile = { ...profile, displayName: newName };
              setProfile(updatedProfile);
              localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
              localStorage.setItem('user_display_name', newName);
            }
          });
        }
      }}
      onUpdateWallet={handleUpdateWallet}
      onTriviaComplete={handleTriviaComplete}
      onRecordActivity={() => {}}
    />
  );
};

export default App;