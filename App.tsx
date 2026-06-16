import React, { useState, useEffect } from 'react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import { checkAppVersion, getUserId, isAuthenticated, getAuthToken, setAuthSession } from './src/utils/versionControl';
import SplashScreen from './views/SplashScreen';
import DashboardScreen from './views/DashboardScreen';

// ===== FLYER-STYLE WORLD CUP SPLASH SCREEN =====
const WorldCupSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Content fades in after 0.5s
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    // Start fade out at 9.5s, complete at 10s
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 9500);

    return () => {
      clearTimeout(contentTimer);
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

      {/* ===== FLYER CONTENT ===== */}
      <div className={`relative z-10 text-center px-6 max-w-sm mx-auto transition-all duration-700 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* Brand Logo */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl animate-pulse" />
          <img
            src="/logo.png"
            alt="FOOT NFTs"
            className="w-24 h-24 mx-auto object-contain relative z-10 animate-[logoFloat_3s_ease-in-out_infinite] drop-shadow-[0_0_40px_rgba(34,197,94,0.2)]"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = 'https://placehold.co/96x96/22c55e/ffffff?text=FOOT';
            }}
          />
        </div>

        {/* Small Title */}
        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-[length:200%_auto] text-transparent bg-clip-text animate-[shimmer_3s_linear_infinite] font-oxanium tracking-tight">
          WORLD CUP
        </h1>
        <h2 className="text-2xl font-bold text-white/80 mb-3 font-oxanium tracking-wider">
          2026
        </h2>

        {/* Host cities with flags */}
        <div className="flex justify-center gap-4 mb-3 text-xs">
          <span className="font-bold text-white/70">🇺🇸 USA</span>
          <span className="font-bold text-white/70">🇨🇦 CANADA</span>
          <span className="font-bold text-white/70">🇲🇽 MEXICO</span>
        </div>

        {/* Date */}
        <p className="text-[10px] text-gray-500 font-space-mono mb-4 tracking-widest">
          JUNE 11 - JULY 19, 2026
        </p>

        {/* ===== FLYER DIVIDER ===== */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-4" />

        {/* ===== PROMO BOX (Flyer style) ===== */}
        <div className="relative inline-block mb-4 w-full">
          <div className="relative bg-gradient-to-br from-green-600/10 to-yellow-600/5 border border-green-500/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <p className="text-green-400 font-bold text-xs font-oxanium tracking-wider mb-1">
              ⚽ WORLD CUP SEASON ⚽
            </p>
            <p className="text-white/70 text-[10px] font-medium font-rajdhani leading-relaxed">
              Rep your country • Vote • Banter • Earn FTC
            </p>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-[8px] bg-green-600/15 text-green-400 px-2 py-0.5 rounded-full">👕 Jersey Day</span>
              <span className="text-[8px] bg-green-600/15 text-green-400 px-2 py-0.5 rounded-full">💬 Banter</span>
              <span className="text-[8px] bg-green-600/15 text-green-400 px-2 py-0.5 rounded-full">🗳️ Vote</span>
            </div>
          </div>
        </div>

        {/* ===== BRAND TAGLINE ===== */}
        <div className="relative inline-block">
          <div className="relative bg-darkCard/30 border border-gray-800/50 rounded-xl px-4 py-2 backdrop-blur-sm">
            <p className="text-white/40 text-[8px] font-space-mono tracking-widest">
              🚀 <span className="text-green-400">FOOT NFTs</span>
            </p>
            <p className="text-white/30 text-[7px] font-space-mono tracking-wider">
              Built for fans • Built by fans
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p className="absolute bottom-8 left-0 right-0 text-[7px] text-gray-600 text-center font-space-mono tracking-widest">
          © 2026 FOOT NFTs • KACHI LABS
        </p>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-[particleFloat_5s_linear_infinite]"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 4}s`,
              background: i % 2 === 0 ? '#22c55e' : '#eab308',
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -40px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-80px) scale(1); opacity: 0; }
        }
        @keyframes lightBeam {
          0%, 100% { opacity: 0.3; transform: rotate(0deg) scaleY(1); }
          50% { opacity: 0.6; transform: rotate(2deg) scaleY(1.2); }
        }
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
  const tg = (window as any).Telegram?.WebApp;
  
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

  if (showWorldCupSplash) {
    return <WorldCupSplash onComplete={handleWorldCupSplashComplete} />;
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