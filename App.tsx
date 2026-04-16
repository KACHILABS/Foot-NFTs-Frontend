import React, { useState, useEffect } from 'react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import { checkAppVersion, getUserId, isAuthenticated, clearAuthSession } from './src/utils/versionControl';
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
  const tg = (window as any).Telegram?.WebApp;
  
  // Force cache check on EVERY app load
  useEffect(() => {
    const wasCleared = checkAppVersion();
    if (wasCleared) {
      console.log('🔄 App version updated, session cleared');
    }
  }, []);

  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    // Only check if user is authenticated via token
    if (isAuthenticated()) {
      return {
        waitlistJoined: true,
        waitlistConfirmed: true,
        profileCompleted: true,
        walletConnected: true,
        clubSelected: true,
        referralCode: '',
        referralCount: 0,
        activityCount: 0
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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [backendUserId, setBackendUserId] = useState<string | null>(getUserId());

  // Load user data from backend on app start
  useEffect(() => {
    const loadUserData = async () => {
      if (backendUserId) {
        try {
          const profileRes = await api.user.getProfile();
          if (profileRes.success) {
            setProfile(profileRes.profile);
            setWallet({
              address: profileRes.wallet?.address || null,
              balanceFTC: profileRes.profile.ftcBalance,
              isConnected: true
            });
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          clearAuthSession();
        }
      }
    };
    
    loadUserData();
  }, [backendUserId]);

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

  const handleUpdateWallet = (update: Partial<WalletState>) => {
    setWallet(prev => prev ? { ...prev, ...update } : null);
  };

  const handleTriviaComplete = () => {
    // This will be handled by backend
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

  const isProfileComplete = profile?.displayName && profile?.favoriteClubId;
  const isWalletConnected = wallet?.isConnected === true;

  // Step 1: SplashScreen - Get name + favorite club
  if (!isProfileComplete) {
    return (
      <SplashScreen 
        onComplete={async (name, clubId, customClub) => {
          withHaptic(async () => {
            const finalClubId = clubId === 'other' ? customClub || 'Other' : clubId;
            const finalClubName = clubId === 'other' ? customClub || 'Other' : getClubNameById(clubId);
            
            // Get Telegram user data
            const telegramUser = tg?.initDataUnsafe?.user;
            const telegramId = telegramUser?.id || 123456789;
            const telegramUsername = telegramUser?.username || 'User';
            
            // Login/signup via backend
            const result = await api.auth.login(telegramId, telegramUsername);
            if (result.success) {
              setBackendUserId(result.user.id);
              setProfile({
                displayName: name,
                avatar: 'https://picsum.photos/200',
                favoriteClubId: finalClubId,
                favoriteClubName: finalClubName,
                fanRank: calculateRank(0, 0)
              });
              setWallet({
                address: result.wallet?.address || null,
                balanceFTC: result.user.ftcBalance || 0,
                isConnected: true
              });
              setOnboarding(prev => ({
                ...prev,
                profileCompleted: true,
                clubSelected: true,
                walletConnected: true
              }));
            }
          });
        }}
        onClaimBonus={(amount) => {
          console.log('🎁 Claiming bonus:', amount);
          withHaptic(async () => {
            // Bonus should be claimed via backend
            if (backendUserId) {
              const result = await api.user.updateProfile({});
              if (result.success) {
                handleUpdateWallet({ balanceFTC: result.user.ftcBalance });
              }
            }
          });
        }}
      />
    );
  }

  // Step 2: Dashboard - Main app
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
      onUpdateProfile={async (newName) => {
        if (newName) {
          withHaptic(async () => {
            const result = await api.user.updateProfile({ displayName: newName });
            if (result.success && profile) {
              setProfile({ ...profile, displayName: newName });
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