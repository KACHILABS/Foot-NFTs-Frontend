import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const CreatorApplicationScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    niche: 'Tactics & Matchday breakdown',
    club: 'Manchester United',
    bio: 'I break down big moments, patterns, and matchday takeaways for fellow fans.',
    content: 'I post short tactical clips, pre-match breakdowns, and community reactions.',
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
        <div className="flex items-center justify-between px-1">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold">
            <span>←</span>
            <span>Back</span>
          </button>
        </div>

        <Card className="p-6 text-center border border-green-500/30 bg-darkCard">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-2xl font-black text-white">Application sent</h2>
          <p className="text-sm text-gray-300 mt-2 leading-6">
            Your creator request is in review. We will notify you once the admin approves your badge.
          </p>
          <Button onClick={onBack} className="mt-5 py-3 text-xs rounded-2xl">Return to creators</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold">
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <Card className="p-4 border border-gray-800 bg-darkCard">
        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-3">Creator approval</p>
        <h2 className="text-2xl font-black text-white">Become a creator</h2>
      </Card>

      <Card className="p-4 border border-gray-800 bg-darkCard">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Niche</span>
            <input value={form.niche} onChange={(e) => handleChange('niche', e.target.value)} className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white outline-none focus:border-green-500" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Club</span>
            <input value={form.club} onChange={(e) => handleChange('club', e.target.value)} className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white outline-none focus:border-green-500" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Bio</span>
            <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={4} className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white outline-none focus:border-green-500" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Content style</span>
            <textarea value={form.content} onChange={(e) => handleChange('content', e.target.value)} rows={4} className="rounded-xl border border-gray-700 bg-darkDeep px-3 py-2.5 text-sm text-white outline-none focus:border-green-500" />
          </label>
        </div>

        <Button onClick={handleSubmit} className="mt-5 py-3 text-xs rounded-2xl">Submit application</Button>
      </Card>
    </div>
  );
};

export default CreatorApplicationScreen;
