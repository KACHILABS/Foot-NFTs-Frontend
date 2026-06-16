import React, { useState, useEffect } from 'react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import { checkAppVersion, getUserId, isAuthenticated, getAuthToken, setAuthSession } from './src/utils/versionControl';
import SplashScreen from './views/SplashScreen';
import DashboardScreen from './views/DashboardScreen';

// ===== WORLD CUP SPLASH WITH BALL ROLL + LEG STEP + SHINE =====
const WorldCupSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [showShine, setShowShine] = useState(false);
  const [showStep, setShowStep] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // === ANIMATION SEQUENCE ===
    
    // 0.0s - Start with ball rolling in (already visible with animation)
    
    // 0.5s - Shine sparkle appears
    const shineTimer = setTimeout(() => {
      setShowShine(true);
    }, 500);
    
    // 2.5s - Leg steps on ball
    const stepTimer = setTimeout(() => {
      setShowStep(true);
    }, 2500);
    
    // 3.5s - Content fades in
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 3500);
    
    // 9.5s - Start fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 9500);

    return () => {
      clearTimeout(shineTimer);
      clearTimeout(stepTimer);
      clearTimeout(contentTimer);
      clearTimeout(fadeTimer);
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
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">

        {/* === BALL ROLL + LEG STEP + SHINE === */}
        <div className="relative mb-8 h-64 flex items-center justify-center">
          
          {/* Background glow */}
          <div className="absolute inset-0 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
          
          {/* ===== SHINE EFFECT ===== */}
          {showShine && (
            <div className="absolute inset-0 pointer-events-none animate-[shineBurst_0.8s_ease-out]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-yellow-400/40 via-yellow-400/10 to-transparent rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-[sparkle_0.6s_ease-out]">✨</div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-yellow-400 animate-[sparkleBurst_0.8s_ease-out]"
                  style={{
                    left: `calc(50% + ${Math.cos(i * 45 * Math.PI / 180) * 80}px)`,
                    top: `calc(50% + ${Math.sin(i * 45 * Math.PI / 180) * 80}px)`,
                    animationDelay: `${0.1 + i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* ===== BALL ROLLING IN ===== */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl animate-[ballRoll_2s_ease-in-out]">
            ⚽
          </div>

          {/* ===== LEG STEPPING ON BALL ===== */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl transition-all duration-300 ${showStep ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
            🦶
          </div>

          {/* Impact lines when foot steps on ball */}
          {showStep && (
            <div className="absolute inset-0 pointer-events-none animate-[impactFlash_1s_ease-out]">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-6 bg-yellow-400/60 rounded-full"
                  style={{
                    left: `calc(50% + ${Math.cos(i * 30 * Math.PI / 180) * 60}px)`,
                    top: `calc(50% + ${Math.sin(i * 30 * Math.PI / 180) * 60}px)`,
                    transform: `rotate(${i * 30}deg)`,
                    transformOrigin: 'center',
                    animation: `impactLine_0.6s_ease-out ${i * 0.03}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Floating particles around baller */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-[particleFloat_4s_linear_infinite]"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
                animationDelay: `${Math.random() * 3}s`,
                width: `${3 + Math.random() * 5}px`,
                height: `${3 + Math.random() * 5}px`,
                background: i % 2 === 0 ? '#22c55e' : '#eab308',
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        {/* ===== CONTENT (fades in after animation) ===== */}
        <div className={`transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Giant Trophy Emoji */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="text-8xl animate-[trophyBounce_2.5s_ease-in-out_infinite] drop-shadow-[0_0_60px_rgba(234,179,8,0.3)]">
              🏆
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-3 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-[length:200%_auto] text-transparent bg-clip-text animate-[shimmer_3s_linear_infinite] font-oxanium tracking-tight">
            WORLD CUP 2026
          </h1>

          {/* Host cities with flags */}
          <div className="flex justify-center gap-6 mb-4">
            <span className="text-sm font-bold text-white/80">🇺🇸 USA</span>
            <span className="text-sm font-bold text-white/80">🇨🇦 CANADA</span>
            <span className="text-sm font-bold text-white/80">🇲🇽 MEXICO</span>
          </div>

          {/* Date */}
          <p className="text-xs text-gray-500 font-space-mono mb-6 tracking-widest">
            JUNE 11 - JULY 19, 2026
          </p>

          {/* ===== PROMO BOX ===== */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-r from-green-600/20 to-yellow-600/10 border border-green-500/30 rounded-2xl px-6 py-4 backdrop-blur-sm max-w-sm mx-auto">
              <p className="text-green-400 font-bold text-sm font-oxanium tracking-wider mb-1">
                ⚽ WORLD CUP SEASON ⚽
              </p>
              <p className="text-white/80 text-xs font-medium font-rajdhani leading-relaxed">
                Rep your country • Vote on match highlights • Banter with rivals • Earn FTC
              </p>
              <div className="flex justify-center gap-3 mt-2">
                <span className="text-xs bg-green-600/20 text-green-400 px-3 py-0.5 rounded-full">👕 Jersey Day</span>
                <span className="text-xs bg-green-600/20 text-green-400 px-3 py-0.5 rounded-full">💬 Banter Hall</span>
                <span className="text-xs bg-green-600/20 text-green-400 px-3 py-0.5 rounded-full">🗳️ Fan Voting</span>
              </div>
            </div>
          </div>

          {/* ===== FOOT NFTs PROMO ===== */}
          <div className="relative inline-block">
            <div className="relative bg-darkCard/50 border border-gray-800 rounded-2xl px-6 py-3 backdrop-blur-sm">
              <p className="text-white/60 text-[10px] font-space-mono tracking-widest">
                🚀 <span className="text-green-400">FOOT NFTs</span> • Powered by KACHI LABS
              </p>
              <p className="text-white/40 text-[8px] font-space-mono tracking-wider mt-1">
                The World Cup starts here. Join the movement.
              </p>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <p className="absolute bottom-8 left-0 right-0 text-[8px] text-gray-600 text-center font-space-mono tracking-widest">
          FOOT NFTs • Built for fans • Built by fans
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
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
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
        @keyframes ballRoll {
          0% { transform: translateX(-200px) rotate(0deg) scale(0.5); opacity: 0; }
          30% { transform: translateX(0px) rotate(720deg) scale(1.2); opacity: 1; }
          60% { transform: translateX(0px) rotate(720deg) scale(0.9); }
          100% { transform: translateX(0px) rotate(720deg) scale(1); opacity: 1; }
        }
        @keyframes shineBurst {
          0% { opacity: 0; transform: scale(0.5); }
          30% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        @keyframes sparkleBurst {
          0% { opacity: 0; transform: translate(0, 0) scale(0); }
          50% { opacity: 1; transform: translate(0, 0) scale(1.5); }
          100% { opacity: 0; transform: translate(0, 0) scale(0); }
        }
        @keyframes impactFlash {
          0% { opacity: 0; transform: scale(0.5); }
          30% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes impactLine {
          0% { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(3); }
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