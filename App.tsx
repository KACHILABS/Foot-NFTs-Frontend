import React, { useState, useEffect } from 'react';
import { OnboardingState, UserProfile, WalletState, FanRank } from './types';
import { CLUBS } from './constants';
import { api } from './src/services/api';
import { checkAppVersion, getUserId, isAuthenticated, clearAuthSession, getAuthToken } from './src/utils/versionControl';
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
    // Check if user is authenticated and has completed profile
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
    // Try to load profile from localStorage
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

  // Function to mark profile as completed in database
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

  // Load user data from backend on app start
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // Check if user is authenticated
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
          // Save profile to state and localStorage
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
            address: null,
            balanceFTC: profileRes.profile.ftcBalance || 0,
            isConnected: true
          });
          setBackendUserId(profileRes.profile.id);
          
          // Save to localStorage
          localStorage.setItem('user_profile', JSON.stringify(userProfile));
          localStorage.setItem('user_wallet', JSON.stringify({
            address: null,
            balanceFTC: profileRes.profile.ftcBalance || 0,
            isConnected: true
          }));
          
          // Check if profile is completed (has name and club)
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
          // Profile not found, need to complete onboarding
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
    setWallet(prev => {
      const newWallet = prev ? { ...prev, ...update } : null;
      if (newWallet) {
        localStorage.setItem('user_wallet', JSON.stringify(newWallet));
      }
      return newWallet;
    });
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

  const isProfileComplete = profile?.displayName && profile?.favoriteClubId && 
    localStorage.getItem('profile_completed') === 'true';

  // Show loading state
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
            
            // Save club info to localStorage
            localStorage.setItem('user_club_id', finalClubId);
            localStorage.setItem('user_club_name', finalClubName);
            localStorage.setItem('user_display_name', name);
            
            // Login/signup via backend
            const result = await api.auth.login(telegramId, telegramUsername);
            if (result.success) {
              setBackendUserId(result.user.id);
              
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
              
              // Save to localStorage
              localStorage.setItem('user_profile', JSON.stringify(newProfile));
              localStorage.setItem('user_wallet', JSON.stringify({
                address: null,
                balanceFTC: result.user.ftcBalance || 0,
                isConnected: true
              }));
              localStorage.setItem('profile_completed', 'true');
              localStorage.setItem('telegramId', telegramId.toString());
              
              // Mark profile as completed in database
              await markProfileCompleted(result.user.id);
              
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
          console.log('🎁 Bonus claimed in SplashScreen:', amount);
          // Update local wallet if needed
          if (wallet) {
            const newBalance = (wallet.balanceFTC || 0) + amount;
            handleUpdateWallet({ balanceFTC: newBalance });
          }
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