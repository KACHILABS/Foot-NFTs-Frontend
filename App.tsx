import React, { useState, useEffect } from 'react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import SplashScreen from './views/SplashScreen';
import WalletSetupScreen from './views/WalletSetupScreen';
import DashboardScreen from './views/DashboardScreen';

const calculateRank = (activityCount: number, referralCount: number): FanRank => {
  if (referralCount >= 5 || activityCount >= 100) return 'Founding Legend';
  if (activityCount >= 60) return 'Legend';
  if (activityCount >= 30) return 'Ultra';
  if (activityCount >= 15) return 'Regular';
  if (activityCount >= 5) return 'Supporter';
  return 'Amateur';
};

const App: React.FC = () => {
  const STORAGE_KEY = 'foot_nfts_state_v4';
  const tg = (window as any).Telegram?.WebApp;
  
  // Get Telegram user ID
  const telegramUser = tg?.initDataUnsafe?.user;
  const telegramId = telegramUser?.id || 123456789; // Fallback for testing
  const telegramUsername = telegramUser?.username || 'TestUser';

  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.onboarding;
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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.profile;
    }
    return null;
  });

  const [wallet, setWallet] = useState<WalletState | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.wallet;
    }
    return null;
  });

  const [backendUserId, setBackendUserId] = useState<string | null>(null);
  const [backendFTC, setBackendFTC] = useState<number>(0);
  const [isBackendSynced, setIsBackendSynced] = useState(false);

  // Force dark mode only
  const theme = 'dark';

  // Calculate and update rank
  useEffect(() => {
    if (profile) {
      const newRank = calculateRank(onboarding.activityCount, onboarding.referralCount);
      if (profile.fanRank !== newRank) {
        setProfile(prev => prev ? { ...prev, fanRank: newRank } : null);
        if (profile.fanRank && profile.fanRank !== newRank) {
          tg?.HapticFeedback.notificationOccurred('success');
        }
      }
    }
  }, [onboarding.activityCount, onboarding.referralCount, profile, tg]);

  const incrementActivity = () => {
    setOnboarding(prev => ({ ...prev, activityCount: prev.activityCount + 1 }));
  };

  // TMA Initialization
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      tg.setHeaderColor('#050505');
      tg.setBackgroundColor('#050505');
    }
  }, [tg]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ onboarding, profile, wallet }));
  }, [onboarding, profile, wallet]);

  // Force dark mode on HTML element
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  const handleUpdateWallet = (update: Partial<WalletState>) => {
    console.log('📝 Updating wallet with:', update);
    setWallet(prev => prev ? { ...prev, ...update } : null);
    
    // Also update backend if we have a user ID
    if (backendUserId && update.balanceFTC !== undefined) {
      // This would call an API to update backend balance
      console.log('🔄 Would sync balance to backend:', update.balanceFTC);
    }
  };

  const handleTriviaComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    setOnboarding(prev => ({ ...prev, lastTriviaDate: today, activityCount: prev.activityCount + 1 }));
  };

  const withHaptic = (fn: () => void) => {
    tg?.HapticFeedback.impactOccurred('medium');
    fn();
  };

  const getClubNameById = (clubId: string): string => {
    if (clubId === 'other') return 'Other';
    const club = CLUBS.find(c => c.id === clubId);
    return club?.name || clubId;
  };

  // Sync user with backend on app start
  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (!isBackendSynced) {
        try {
          // This creates or gets user from Supabase
          const result = await api.auth.login(telegramId, telegramUsername);
          if (result.success) {
            console.log('✅ User synced with backend:', result.user);
            setBackendUserId(result.user.id);
            setBackendFTC(result.user.ftcBalance);
            
            // Sync wallet balance with backend
            if (wallet) {
              setWallet(prev => prev ? { ...prev, balanceFTC: result.user.ftcBalance } : prev);
            }
            setIsBackendSynced(true);
          }
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
        }
      }
    };
    
    syncUserWithBackend();
  }, [telegramId, telegramUsername, wallet, isBackendSynced]);

  // Check if profile is complete
  const isProfileComplete = profile?.displayName && profile?.favoriteClubId;
  const isWalletConnected = wallet?.isConnected === true;

  // Step 1: SplashScreen - Get name + favorite club
  if (!isProfileComplete) {
    return (
      <SplashScreen 
        onComplete={async (name, clubId, customClub) => {
          withHaptic(() => {
            const finalClubId = clubId === 'other' ? customClub || 'Other' : clubId;
            const finalClubName = clubId === 'other' ? customClub || 'Other' : getClubNameById(clubId);
            
            setProfile({
              displayName: name,
              avatar: 'https://picsum.photos/200',
              favoriteClubId: finalClubId,
              favoriteClubName: finalClubName,
              fanRank: calculateRank(onboarding.activityCount, onboarding.referralCount)
            });
            setOnboarding(prev => ({
              ...prev,
              profileCompleted: true,
              clubSelected: true
            }));
          });
        }}
        onClaimBonus={(amount) => {
          console.log('🎁 Claiming bonus:', amount);
          withHaptic(() => {
            if (wallet) {
              const newBalance = (wallet.balanceFTC || 0) + amount;
              handleUpdateWallet({ balanceFTC: newBalance });
            } else {
              setWallet({
                address: 'EQA_' + Math.random().toString(36).substring(7).toUpperCase(),
                balanceFTC: amount,
                isConnected: true
              });
            }
          });
        }}
      />
    );
  }

  // Step 2: WalletSetupScreen - Connect TON wallet
  if (!isWalletConnected) {
    return (
      <WalletSetupScreen 
        onBack={() => {
          withHaptic(() => {
            setProfile(prev => prev ? { ...prev, displayName: '', favoriteClubId: null } : null);
            setOnboarding(prev => ({ ...prev, profileCompleted: false, clubSelected: false }));
          });
        }}
        onConnected={(newWallet) => {
          withHaptic(() => {
            setWallet({
              address: newWallet.address,
              balanceFTC: backendFTC || 0,
              isConnected: true
            });
            setOnboarding(prev => ({ ...prev, walletConnected: true }));
          });
        }}
      />
    );
  }

  // Step 3: Dashboard - Main app
  return (
    <DashboardScreen 
      profile={profile} 
      wallet={wallet} 
      onboarding={onboarding}
      backendUserId={backendUserId}
      onChangeClub={() => withHaptic(() => {
        setProfile(prev => prev ? { ...prev, favoriteClubId: null } : null);
        setOnboarding(prev => ({ ...prev, clubSelected: false, profileCompleted: false }));
      })}
      onUpdateProfile={(newName) => {
        if (newName) {
          withHaptic(() => {
            if (profile) {
              const updatedProfile = { ...profile, displayName: newName };
              setProfile(updatedProfile);
              
              const savedState = localStorage.getItem(STORAGE_KEY);
              if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed.profile) {
                  parsed.profile.displayName = newName;
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                }
              }
            }
          });
        }
      }}
      onUpdateWallet={handleUpdateWallet}
      onTriviaComplete={handleTriviaComplete}
      onRecordActivity={incrementActivity}
    />
  );
};

export default App;