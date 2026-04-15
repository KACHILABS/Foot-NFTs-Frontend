import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { OnboardingState } from '../types';

interface WaitlistScreenProps {
  onboarding: OnboardingState;
  onBack?: () => void;
  onContinue: () => void;
}

const WaitlistScreen: React.FC<WaitlistScreenProps> = ({ onboarding, onBack, onContinue }) => {
  const copyLink = () => {
    navigator.clipboard.writeText(`https://t.me/footnfts_bot?ref=${onboarding.referralCode}`);
    alert("Referral link copied!");
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-10 pb-8 bg-darkBg animate-in slide-in-from-right-10">
      <div className="mb-6 flex items-center">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#FF6D00] flex items-center justify-center mb-8 shadow-xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold mb-2 text-white">Waitlist Confirmed</h1>
        <p className="text-gray-400 text-lg mb-8">You’re on the list!</p>

        {/* Referral Card - DARK */}
        <Card className="w-full mb-6 bg-darkCard border border-gray-800">
          <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-3">Your Referral Link</p>
          <div className="flex items-center gap-2 bg-darkDeep p-4 rounded-xl border border-gray-800 mb-4">
            <span className="text-gray-300 font-mono text-sm truncate flex-1">
              t.me/footnfts_bot?ref={onboarding.referralCode}
            </span>
            <button onClick={copyLink} className="text-[#FF6D00] font-bold text-sm px-2 hover:text-orange-400 transition-colors">Copy</button>
          </div>
          <Button variant="outline" className="py-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Invite Friends
          </Button>
        </Card>

        <div className="w-full flex justify-between items-center bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-800">
          <div className="text-left">
            <p className="text-2xl font-bold text-[#FF6D00]">{onboarding.referralCount}</p>
            <p className="text-sm text-gray-500">Friends Invited</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Next Reward at</p>
            <p className="text-lg font-bold text-white">5 Friends</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
};

export default WaitlistScreen;