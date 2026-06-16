import React, { useState, useEffect } from 'react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import { checkAppVersion, getUserId, isAuthenticated, clearAuthSession, getAuthToken, setAuthSession } from './src/utils/versionControl';
import SplashScreen from './views/SplashScreen';
import DashboardScreen from './views/DashboardScreen';

// ===== STUNNING WORLD CUP SPLASH SCREEN =====
const WorldCupSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Start fade out at 4.5 seconds, complete at 5 seconds
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
    <div className={`fixed inset-0 bg-darkBg flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:50px_50px] animate-[gridMove_20s_linear_infinite]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-[floatOrb_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-[floatOrb_8s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/5 rounded-full blur-3xl animate-pulse" />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 animate-[fadeInUp_1s_ease-out]">
        {/* Animated Logo with ring pulse */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-[ringPulse_2s_ease-out_infinite]" />
          <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-[ringPulse_2s_ease-out_infinite_0.5s]" />
          <img
            src="/logo.png"
            alt="FOOT NFTs"
            className="w-24 h-24 mx-auto object-contain relative z-10 animate-[logoFloat_3s_ease-in-out_infinite]"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = 'https://placehold.co/96x96/22c55e/ffffff?text=FOOT';
            }}
          />
        </div>

        {/* Trophy with bounce and glow */}
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="text-8xl animate-[trophyBounce_2s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            🏆
          </div>
        </div>

        {/* Title with gradient animation */}
        <h1 className="text-5xl md:text-6xl font-black mb-2 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-[length:200%_auto] text-transparent bg-clip-text animate-[shimmer_3s_linear_infinite] font-oxanium">
          WORLD CUP 2026
        </h1>

        {/* Host cities with flag emojis */}
        <div className="flex justify-center gap-4 mb-4">
          <span className="text-sm font-bold text-white/80 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">🇺🇸 USA</span>
          <span className="text-sm font-bold text-white/80 animate-[fadeInUp_0.6s_ease-out_0.5s_both]">🇨🇦 CANADA</span>
          <span className="text-sm font-bold text-white/80 animate-[fadeInUp_0.6s_ease-out_0.7s_both]">🇲🇽 MEXICO</span>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-500 font-space-mono mb-6 animate-[fadeInUp_0.6s_ease-out_0.9s_both]">
          JUNE 11 - JULY 19, 2026
        </p>

        {/* Tagline box with glow */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur-xl animate-pulse" />
          <div className="relative bg-green-600/10 border border-green-500/30 rounded-2xl px-6 py-3 backdrop-blur-sm animate-[fadeInUp_0.6s_ease-out_1.1s_both]">
            <p className="text-green-400 font-bold text-sm font-oxanium tracking-wider">
              ⚡ REP YOUR COUNTRY • EARN FTC ⚡
            </p>
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="w-64 mx-auto animate-[fadeInUp_0.6s_ease-out_1.3s_both]">
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

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-green-500/40 animate-[particleFloat_4s_linear_infinite]"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}

        {/* Powered by */}
        <p className="absolute bottom-8 left-0 right-0 text-[8px] text-gray-600 text-center font-space-mono animate-[fadeInUp_0.6s_ease-out_1.5s_both]">
          FOOT NFTs • Powered by KACHI LABS
        </p>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ringPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-80px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

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