import React from 'react';
import Card from '../components/Card';

const DigitalTwinScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 text-sm font-bold">
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <Card className="border border-gray-800 bg-darkCard p-5">
        <p className="text-[9px] uppercase tracking-[0.2em] text-green-400 font-black">Twin</p>
        <h2 className="text-3xl font-black text-white mt-2">Digital twin</h2>
        <p className="text-sm text-gray-300 mt-3 leading-6">A future module for club identity, fan intelligence, and AI-powered matchday insight. This screen is ready for the next v2 expansion.</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {[
          ['AI brief', 'Matchday direction'],
          ['Player pulse', 'Form & fitness'],
          ['Club lens', 'Identity + signal'],
          ['Fan score', 'Mood index'],
        ].map(([title, subtitle]) => (
          <Card key={title} className="border border-gray-800 bg-darkCard p-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">{title}</p>
            <p className="text-sm font-black text-white mt-2">{subtitle}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DigitalTwinScreen;
