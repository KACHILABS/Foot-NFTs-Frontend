import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { UserProfile } from '../types';
import { CLUBS } from '../constants';

interface ProfileSetupScreenProps {
  onBack?: () => void;
  onSave: (profile: UserProfile) => void;
}

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onBack, onSave }) => {
  const [name, setName] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [avatar, setAvatar] = useState('https://picsum.photos/200');

  const handleSave = () => {
    if (!name) return alert('Please enter a display name');
    onSave({
      displayName: name,
      avatar: avatar,
      favoriteClubId: selectedClub || null
    });
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-10 pb-8 bg-darkBg animate-in slide-in-from-right-10">
      <div className="mb-4 flex items-center">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold mb-2 text-white">Set Up Your Profile</h1>
        <p className="text-gray-400">Create your digital identity</p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img src={avatar} className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-gray-800" alt="Avatar" />
            <button 
              onClick={() => setAvatar('https://picsum.photos/200?random=' + Math.random())}
              className="absolute -bottom-2 -right-2 bg-darkCard p-2 rounded-xl shadow-md border border-gray-700 text-orange-500 active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="py-2 px-4 text-xs" fullWidth={false} onClick={() => setAvatar('https://picsum.photos/200?random=' + Math.random())}>
              Upload Photo
            </Button>
            <Button variant="outline" className="py-2 px-4 text-xs" fullWidth={false}>
              Use Telegram Avatar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Display Name</label>
            <input 
              type="text" 
              placeholder="e.g. LeoFan10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-darkCard border border-gray-800 text-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Favorite Club</label>
            <div className="relative">
              <select 
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full p-4 rounded-2xl bg-darkCard border border-gray-800 text-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none"
              >
                <option value="">Select a club...</option>
                {CLUBS.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Card className="mt-4 bg-[#FF6D00] text-white border-none">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Onboarding Bonus</p>
              <p className="text-2xl font-black">50 FTC</p>
            </div>
            <div className="bg-white/20 p-2 rounded-xl">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15 11a1 1 0 112 0v1a1 1 0 11-2 0v-1z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Button onClick={handleSave}>Save Profile & Continue</Button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;