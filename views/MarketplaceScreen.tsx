import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

interface MarketplaceScreenProps {
  onNotify: () => void;
  onBack: () => void;
}

const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ onNotify, onBack }) => {
  const dummyProducts = [
    { name: "24/25 Home Jersey", category: "Jerseys", img: "👕", desc: "Official club fabric" },
    { name: "Matchday Tracksuit", category: "Training Kits", img: "🏃", desc: "Pro-performance wear" },
    { name: "Pro Training Jersey", category: "Training Kits", img: "🎽", desc: "Lightweight training kit" },
    { name: "Official Club Scarf", category: "Matchday Gear", img: "🧣", desc: "Heritage winter gear" },
  ];

  const ftcUseCases = [
    {
      title: 'Unlock club merchandise',
      text: 'Spend FTC on matchday gear, jerseys, and premium fan drops.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 18V6.5A1.5 1.5 0 0 1 4.5 5H19.5A1.5 1.5 0 0 1 21 6.5V18" />
          <path d="M8 9h8" />
          <path d="M8 12h8" />
          <path d="M10 5V3h4v2" />
          <path d="M6 18h12" />
        </svg>
      )
    },
    {
      title: 'Claim limited editions',
      text: 'Access exclusive digital collectibles and collector-only releases.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" />
          <path d="M7 18.5A5 5 0 0 0 12 13a5 5 0 0 0 5 5.5" />
          <path d="M8 8h8" />
          <path d="M7 5h10" />
        </svg>
      )
    },
    {
      title: 'Redeem on matchday',
      text: 'Use FTC for special event bundles and in-season stadium perks.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v6l4 2" />
          <path d="M8 16l4-4" />
        </svg>
      )
    },
    {
      title: 'Unlock fan rewards',
      text: 'Get access to premium creator items, community drops, and club perks.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l2.3 4.7L19 8.1l-3.5 3.5 1 5.4-4.5-2.3-4.5 2.3 1-5.4L5 8.1l4.7-.4L12 3Z" />
        </svg>
      )
    },
    {
      title: 'Power your engagement',
      text: 'Earn more FTC through predictions, voting, and participation in Foot-Collect.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v8" />
          <path d="M8 8l4-6 4 6" />
          <path d="M5 14h14" />
          <path d="M7 18h10" />
          <path d="M9 22h6" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-white tracking-tighter">Marketplace</h2>
        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Official Club Merchandise</p>
      </div>

      {/*
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-darkDeep text-white border border-gray-800">
        <div className="absolute inset-0 bg-green-600 opacity-10"></div>
        <div className="relative p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-darkCard backdrop-blur-xl rounded-3xl shadow-xl flex items-center justify-center text-4xl mb-6 border border-gray-800">
            🛍️
          </div>
          <span className="inline-block px-4 py-1.5 bg-green-600 text-black text-[9px] font-black rounded-full uppercase tracking-widest mb-4">
            PHASE 1 • INCOMING
          </span>
          <h2 className="text-2xl font-black mb-3 leading-tight text-white">The Digital Stadium Store</h2>
          <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xs">
            Unlock authentic gear verified on the TON blockchain. Physical drops and digital wearables.
          </p>
          <Button variant="primary" className="mt-8 py-3 px-10 text-xs h-auto w-auto" fullWidth={false} onClick={onNotify}>
            Notify Me
          </Button>
        </div>
      </div>
      */}

      <Card className="bg-darkCard border border-gray-800 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-600/15 text-green-400 ring-1 ring-green-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v8" />
              <path d="M9 5h6" />
              <path d="M8 12h8" />
              <path d="M12 15v7" />
              <path d="M7 18h10" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">FTC Utility</p>
            <h3 className="text-xl font-black tracking-tight text-white">What Can You Do with FTC in the Foot-Collect Marketplace?</h3>
          </div>
        </div>

        <div className="space-y-3">
          {ftcUseCases.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-darkDeep p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-600/10 text-green-300 ring-1 ring-green-500/20">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-black text-white">{item.title}</p>
                <p className="text-xs leading-relaxed text-gray-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-gray-800 pt-4">
          <p className="text-[11px] leading-relaxed text-gray-300">
            The more you engage, predict, vote, and participate in Foot-Collect, the more FTC you can earn and spend.
          </p>
        </div>
      </Card>

      {/*
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
           <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">Upcoming Drops</p>
           <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Details</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {dummyProducts.map((product, idx) => (
            <div key={idx} className="relative">
              <Card className="p-5 flex flex-col items-center text-center border-gray-800 bg-darkCard h-full relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-darkDeep rounded-full blur-xl opacity-50"></div>
                <div className="w-20 h-20 bg-darkDeep rounded-2xl flex items-center justify-center text-4xl mb-4 grayscale opacity-40">
                  {product.img}
                </div>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{product.category}</p>
                <p className="text-sm font-black text-white mb-1 leading-tight">{product.name}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase mb-4">{product.desc}</p>
                
                <button disabled className="w-full py-3 bg-darkDeep text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-800 shadow-sm">
                  Notify Me
                </button>
              </Card>
              <div className="absolute top-3 left-3">
                 <span className="bg-orange-600/20 text-orange-500 text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border border-orange-600/30">
                    LOCKED
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-darkCard border border-gray-800 p-6 flex flex-col items-center text-center">
         <div className="text-2xl mb-2">🛡️</div>
         <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Blockchain Authenticity</p>
         <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Every item in our marketplace is verified via NFT metadata on the TON blockchain to prevent counterfeits.</p>
      </Card>
      */}
    </div>
  );
};

export default MarketplaceScreen;