import React, { useState, useEffect } from 'react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import { checkAppVersion, getUserId, isAuthenticated, getAuthToken, setAuthSession } from './src/utils/versionControl';
import SplashScreen from './views/SplashScreen';
import DashboardScreen from './views/DashboardScreen';

// ===== WORLD CUP SPLASH WITH BALLER FOOT & BALL =====
const WorldCupSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0D1B2A] to-[#0A0A0F] flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'} overflow-hidden`}>
      
      {/* Animated Stadium Light Beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 bg-gradient-to-t from-green-500/20 to-transparent"
            style={{
              left: `${10 + i * 11}%`,
              top: '0',
              height: '60%',
              transform: `rotate(${10 + i * 5}deg)`,
              transformOrigin: 'bottom center',
              animation: `lightBeam ${3 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px] animate-[gridMove_25s_linear_infinite]" />
      </div>

      {/* Large floating orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-[floatOrb_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-[floatOrb_10s_ease-in-out_infinite_1s]" />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto animate-[fadeInUp_1s_ease-out]">

        {/* === BALLER FOOT & BALL === */}
        <div className="relative mb-8 scale-125">
          {/* Glow behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          
          {/* Baller SVG Animation */}
          <div className="relative w-64 h-64 mx-auto">
            <svg viewBox="0 0 300 300" className="w-full h-full animate-[trophyBounce_2.5s_ease-in-out_infinite] drop-shadow-[0_0_60px_rgba(34,197,94,0.3)]">
              {/* Stadium glow ring */}
              <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="1" className="animate-[spin_20s_linear_infinite]" />
              <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(234,179,8,0.05)" strokeWidth="1" className="animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Ball */}
              <g className="animate-[ballFloat_2.5s_ease-in-out_infinite]">
                <circle cx="150" cy="170" r="45" fill="#1a1a2e" stroke="#22c55e" strokeWidth="2.5" />
                <circle cx="150" cy="170" r="42" fill="url(#ballGradient)" />
                {/* Ball pentagon pattern */}
                <polygon points="150,135 162,150 158,168 142,168 138,150" fill="rgba(34,197,94,0.3)" stroke="#22c55e" strokeWidth="1.5" />
                <polygon points="160,155 175,150 180,165 172,178 158,175" fill="rgba(234,179,8,0.2)" stroke="#eab308" strokeWidth="1.5" />
                <polygon points="140,155 125,150 120,165 128,178 142,175" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.5" />
                <line x1="135" y1="145" x2="165" y2="145" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
                <line x1="130" y1="160" x2="170" y2="160" stroke="#eab308" strokeWidth="1" opacity="0.5" />
                <line x1="135" y1="175" x2="165" y2="175" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
                <circle cx="150" cy="170" r="8" fill="#22c55e" opacity="0.3" />
              </g>

              {/* Foot/Boot - kicking the ball */}
              <g className="animate-[kickSwing_1.5s_ease-in-out_infinite]">
                {/* Leg shadow */}
                <path d="M40 220 L70 200 L85 210 L65 225 Z" fill="rgba(0,0,0,0.3)" />
                {/* Shin */}
                <path d="M50 180 L80 195 L75 215 L45 200 Z" fill="#1a1a2e" stroke="#2a2a3e" strokeWidth="1.5" />
                {/* Boot */}
                <path d="M75 200 L110 185 L120 195 L100 205 L85 210 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
                <path d="M110 185 L120 195 L125 190 L115 180 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                {/* Boot studs */}
                <circle cx="95" cy="207" r="2" fill="#333" />
                <circle cx="100" cy="205" r="2" fill="#333" />
                <circle cx="105" cy="202" r="2" fill="#333" />
              </g>

              {/* Impact lines when foot hits ball */}
              <g className="animate-[impactFlash_1.5s_ease-in-out_infinite]">
                <line x1="120" y1="175" x2="135" y2="180" stroke="#eab308" strokeWidth="2" opacity="0.6" />
                <line x1="125" y1="185" x2="140" y2="195" stroke="#eab308" strokeWidth="2" opacity="0.6" />
                <line x1="118" y1="195" x2="130" y2="210" stroke="#eab308" strokeWidth="2" opacity="0.4" />
                <circle cx="115" cy="180" r="4" fill="none" stroke="#eab308" strokeWidth="1.5" opacity="0.6" />
                <circle cx="112" cy="185" r="8" fill="none" stroke="#eab308" strokeWidth="1" opacity="0.4" />
              </g>

              {/* Defs for gradients */}
              <defs>
                <radialGradient id="ballGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Floating particles around baller */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-[particleFloat_4s_linear_infinite]"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                width: `${3 + Math.random() * 5}px`,
                height: `${3 + Math.random() * 5}px`,
                background: i % 2 === 0 ? '#22c55e' : '#eab308',
                opacity: 0.4 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        {/* Title with gradient animation */}
        <h1 className="text-5xl md:text-7xl font-black mb-3 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-[length:200%_auto] text-transparent bg-clip-text animate-[shimmer_3s_linear_infinite] font-oxanium tracking-tight">
          WORLD CUP 2026
        </h1>

        {/* Host cities with flag emojis */}
        <div className="flex justify-center gap-6 mb-4">
          <span className="text-sm font-bold text-white/80 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">🇺🇸 USA</span>
          <span className="text-sm font-bold text-white/80 animate-[fadeInUp_0.6s_ease-out_0.5s_both]">🇨🇦 CANADA</span>
          <span className="text-sm font-bold text-white/80 animate-[fadeInUp_0.6s_ease-out_0.7s_both]">🇲🇽 MEXICO</span>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-500 font-space-mono mb-6 animate-[fadeInUp_0.6s_ease-out_0.9s_both] tracking-widest">
          JUNE 11 - JULY 19, 2026
        </p>

        {/* Tagline box with glow */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur-xl animate-pulse" />
          <div className="relative bg-green-600/10 border border-green-500/30 rounded-2xl px-8 py-3 backdrop-blur-sm animate-[fadeInUp_0.6s_ease-out_1.1s_both]">
            <p className="text-green-400 font-bold text-sm font-oxanium tracking-wider">
              ⚡ REP YOUR COUNTRY • EARN FTC ⚡
            </p>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="w-72 mx-auto animate-[fadeInUp_0.6s_ease-out_1.3s_both]">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-green-500 bg-[length:200%_100%] rounded-full transition-all duration-100 animate-[shimmer_2s_linear_infinite]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-600 font-space-mono">LOADING</span>
            <span className="text-[10px] text-green-500 font-space-mono font-bold">{progress}%</span>
          </div>
        </div>

        {/* Powered by */}
        <p className="absolute bottom-8 left-0 right-0 text-[8px] text-gray-600 text-center font-space-mono animate-[fadeInUp_0.6s_ease-out_1.5s_both] tracking-widest">
          FOOT NFTs • Powered by KACHI LABS
        </p>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -50px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.03); }
        }
        @keyframes ballFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes kickSwing {
          0%, 100% { transform: rotate(-5deg) translateX(0); }
          50% { transform: rotate(15deg) translateX(5px); }
        }
        @keyframes impactFlash {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100px) scale(1); opacity: 0; }
        }
        @keyframes lightBeam {
          0%, 100% { opacity: 0.3; transform: rotate(0deg) scaleY(1); }
          50% { opacity: 0.8; transform: rotate(2deg) scaleY(1.2); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// === REST OF YOUR APP CODE (Keep unchanged) ===
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
  const tg = (window as any).Telegram?.WebApp;
  
  // ===== ALWAYS SHOW WORLD CUP SPLASH =====
  const [showWorldCupSplash, setShowWorldCupSplash] = useState(true);
  
  useEffect(() => {
    const wasCleared = checkAppVersion();
    if (wasCleared) {
      console.log('🔄 App version updated, session cleared');
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

  // ===== HANDLE WORLD CUP SPLASH COMPLETE =====
  const handleWorldCupSplashComplete = () => {
    setShowWorldCupSplash(false);
  };

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

  // ===== SHOW WORLD CUP SPLASH EVERY TIME =====
  if (showWorldCupSplash) {
    return <WorldCupSplash onComplete={handleWorldCupSplashComplete} />;
  }

  // ===== ONBOARDING SPLASH (for new users) =====
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

  // ===== DASHBOARD =====
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