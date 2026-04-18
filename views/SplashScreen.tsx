import React, { useState } from 'react';
import Button from '../components/Button';
import { CLUBS } from '../constants';
import { api } from '../src/services/api';

interface SplashScreenProps {
  onComplete: (name: string, clubId: string, customClub?: string) => void;
  onClaimBonus?: (amount: number) => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onClaimBonus }) => {
  const [name, setName] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [customClub, setCustomClub] = useState('');
  const [showBonus, setShowBonus] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!selectedClub) {
      alert('Please select your favorite club');
      return;
    }
    if (selectedClub === 'other' && !customClub.trim()) {
      alert('Please enter your club name');
      return;
    }
    
    setShowBonus(true);
  };

  const handleClaimBonus = async () => {
    setClaiming(true);
    setError('');
    
    try {
      // Get Telegram user data
      const tg = (window as any).Telegram?.WebApp;
      const telegramUser = tg?.initDataUnsafe?.user;
      const telegramId = telegramUser?.id || 123456789;
      const telegramUsername = telegramUser?.username || 'User';
      
      // Login/signup via backend
      console.log('📝 Creating/loading user...');
      const loginResult = await api.auth.login(telegramId, telegramUsername);
      
      if (!loginResult.success) {
        throw new Error('Failed to create/load user');
      }
      
      console.log('✅ User loaded:', loginResult.user.id);
      console.log('Has claimed bonus:', loginResult.user.hasClaimedWelcomeBonus);
      console.log('Profile completed:', loginResult.user.profileCompleted);
      
      // Check if user already has a profile completed (existing user)
      if (loginResult.user.profileCompleted || loginResult.user.hasClaimedWelcomeBonus) {
        console.log('Existing user detected, skipping bonus claim');
        
        // Call onClaimBonus with 0 (no bonus to add)
        if (onClaimBonus) {
          onClaimBonus(0);
        }
        
        // Complete onboarding immediately
        setTimeout(() => {
          setClaiming(false);
          if (selectedClub === 'other') {
            onComplete(name, 'other', customClub);
          } else {
            onComplete(name, selectedClub);
          }
        }, 500);
        return;
      }
      
      // New user - claim the welcome bonus
      console.log('🎁 New user - Claiming bonus...');
      const bonusResult = await api.user.claimWelcomeBonus(loginResult.user.id);
      
      if (bonusResult.success) {
        console.log('✅ Bonus claimed:', bonusResult.bonusAmount);
        
        // Call onClaimBonus to update UI
        if (onClaimBonus) {
          onClaimBonus(bonusResult.bonusAmount);
        }
        
        // Complete onboarding
        setTimeout(() => {
          setClaiming(false);
          if (selectedClub === 'other') {
            onComplete(name, 'other', customClub);
          } else {
            onComplete(name, selectedClub);
          }
        }, 500);
      } else {
        // If bonus already claimed but somehow flagged wrong
        if (bonusResult.alreadyClaimed) {
          console.log('Bonus already claimed, proceeding to dashboard');
          if (onClaimBonus) {
            onClaimBonus(0);
          }
          setTimeout(() => {
            setClaiming(false);
            if (selectedClub === 'other') {
              onComplete(name, 'other', customClub);
            } else {
              onComplete(name, selectedClub);
            }
          }, 500);
        } else {
          throw new Error(bonusResult.error || 'Failed to claim bonus');
        }
      }
    } catch (err: any) {
      console.error('Error in claim bonus:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setClaiming(false);
    }
  };

  // Bonus Screen
  if (showBonus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-darkBg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="text-center relative z-10 animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleClaimBonus} 
            disabled={claiming}
            className="mt-4"
          >
            {claiming ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {claiming ? 'Processing...' : 'Creating Account & Claiming Bonus...'}
              </span>
            ) : (
              'Claim 50 FTC Bonus 🎁'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative bg-darkBg">
      {/* Logo */}
      <div className="mb-12 text-center animate-fade-in-up relative z-10">
        <img 
          src="/logo.png" 
          alt="FOOT NFTs Logo" 
          className="w-28 h-28 mx-auto mb-6 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://placehold.co/112x112/22c55e/ffffff?text=FOOT';
          }}
        />
        <h1 className="text-4xl font-black text-white mb-2 font-display">FOOT NFTs</h1>
        <p className="text-gray-400">Own the moment. Rep the club.</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm space-y-5 relative z-10">
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
                <option 
                  key={club.id} 
                  value={club.id}
                  className="bg-darkCard text-white"
                >
                  {club.name}
                </option>
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

        {/* Custom Club Input - appears when "Other" is selected */}
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

        <Button onClick={handleContinue} className="mt-4">
          Enter the Stadium
        </Button>
      </div>

      {/* Powered by */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-xs text-gray-600 uppercase tracking-widest">Powered by TON Blockchain</p>
      </div>
    </div>
  );
};

export default SplashScreen;