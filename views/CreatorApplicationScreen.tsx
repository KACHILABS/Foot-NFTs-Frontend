import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { BackIcon } from '../src/components/Icons';

interface Niche {
  id: string;
  label: string;
}

interface CreatorApplicationScreenProps {
  profile?: any | null;
  backendUserId?: string | null;
  onBack?: () => void;
  onSuccess?: () => void;
}

const API_BASE = 'https://footnfts.up.railway.app/api';

const CreatorApplicationScreen: React.FC<CreatorApplicationScreenProps> = ({ profile, backendUserId, onBack, onSuccess }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [form, setForm] = useState({
    niche: '',
    bio: '',
    contentStyle: '',
  });

  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    loadNiches();
  }, []);

  const loadNiches = async () => {
    try {
      const res = await fetch(`${API_BASE}/creator/niches`);
      const data = await res.json();
      if (data.success && data.niches.length > 0) {
        setNiches(data.niches);
        setForm(prev => ({ ...prev, niche: data.niches[0].id }));
      }
    } catch (error) {
      console.error('Failed to load niches:', error);
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.niche || !form.bio.trim() || !form.contentStyle.trim()) {
      tg?.showAlert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/creator/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: backendUserId,
          niche: form.niche,
          bio: form.bio,
          contentStyle: form.contentStyle
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        tg?.HapticFeedback.notificationOccurred('success');
      } else {
        tg?.showAlert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submit error:', error);
      tg?.showAlert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
        <Card className="p-6 text-center border border-green-500/30 bg-darkCard">
          <div className="text-5xl mb-3">✓</div>
          <h2 className="text-2xl font-black text-white">Application sent</h2>
          <p className="text-sm text-gray-300 mt-2 leading-6">
            Your creator request is in review. You will receive a notification on Telegram once approved.
          </p>
          <Button onClick={() => { setSubmitted(false); onBack?.(); }} className="mt-5 py-3 text-xs rounded-2xl">Return</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="flex items-center justify-between px-4 pt-3">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold hover:text-white">
          <BackIcon className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <Card className="p-4 border border-gray-800 bg-darkCard">
        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-1">Creator Approval</p>
        <h2 className="text-2xl font-black text-white">Become a Creator</h2>
        <p className="text-xs text-gray-400 mt-2">Apply to join our creator network and start posting on the feed</p>
      </Card>

      {/* Form */}
      <Card className="p-4 border border-gray-800 bg-darkCard">
        <div className="flex flex-col gap-4">
          {/* Niche Dropdown */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-white">Focus Area</span>
            <select
              value={form.niche}
              onChange={(e) => handleChange('niche', e.target.value)}
              className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white outline-none focus:border-green-500"
            >
              {niches.map(niche => (
                <option key={niche.id} value={niche.id}>{niche.label}</option>
              ))}
            </select>
          </label>

          {/* Club (Auto-filled) */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-white">Club</span>
            <div className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-gray-400">
              {profile?.favoriteClubName || profile?.favoriteClubId || 'No club selected'}
            </div>
          </div>

          {/* Bio */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-white">Your Story</span>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us why you want to become a creator..."
              maxLength={500}
              rows={4}
              className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white outline-none focus:border-green-500 resize-none"
            />
            <p className="text-[9px] text-gray-500">{form.bio.length}/500</p>
          </label>

          {/* Content Style */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-white">Content Style</span>
            <textarea
              value={form.contentStyle}
              onChange={(e) => handleChange('contentStyle', e.target.value)}
              placeholder="What kind of posts will you create? (tactics, highlights, analysis, etc.)"
              maxLength={500}
              rows={4}
              className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white outline-none focus:border-green-500 resize-none"
            />
            <p className="text-[9px] text-gray-500">{form.contentStyle.length}/500</p>
          </label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 py-3 text-xs rounded-2xl"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Card>

      {/* Info */}
      <Card className="p-3 border border-gray-800 bg-darkDeep">
        <p className="text-[9px] text-gray-400 leading-relaxed">
          Once approved, you'll receive a notification on Telegram. Then you can start posting on the feed and build your audience.
        </p>
      </Card>
    </div>
  );
};

export default CreatorApplicationScreen;
