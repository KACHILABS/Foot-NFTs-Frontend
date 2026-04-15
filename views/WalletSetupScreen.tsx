import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { WalletState } from '../types';

interface WalletSetupScreenProps {
  onBack?: () => void;
  onConnected: (wallet: WalletState) => void;
}

const WalletSetupScreen: React.FC<WalletSetupScreenProps> = ({ onBack, onConnected }) => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const simulateConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      
      setTimeout(() => {
        onConnected({
          address: 'EQA_...8x92',
          balanceFTC: 50,
          isConnected: true
        });
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-10 pb-8 bg-darkBg overflow-hidden animate-in slide-in-from-right-10">
      <div className="mb-4 flex items-center">
        {onBack && !connected && (
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center text-center justify-center">
        {!connected ? (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <div className="w-64 h-64 mb-10 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#FF6D00] rounded-full blur-3xl opacity-10 animate-pulse"></div>
              <svg 
                className={`w-40 h-40 text-orange-500 drop-shadow-2xl transition-transform duration-700 ${connecting ? 'animate-pulse scale-90' : ''}`} 
                viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold mb-4 text-white">Connect Your Wallet</h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xs">Secure your digital assets and unlock exclusive fan rewards.</p>

            <Card className="w-full bg-darkDeep border border-gray-800 flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#FF6D00] flex items-center justify-center text-white font-bold text-xl">
                🎁
              </div>
              <div className="text-left">
                <p className="font-bold text-orange-500">Sign-up Reward</p>
                <p className="text-sm text-gray-400 font-semibold">+ 50 FTC Tokens</p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center">
            <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/20 relative">
               <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
               <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h1 className="text-3xl font-black mb-2 text-white">Wallet Linked!</h1>
            <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] mb-8">Secure Connection Established</p>
            
            <Card className="w-full border border-gray-800 bg-darkCard p-5">
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">
                     <span>Address</span>
                     <span className="text-orange-500">Verified</span>
                  </div>
                  <div className="bg-darkDeep p-3 rounded-xl border border-gray-800 font-mono text-xs text-gray-300">
                     EQA_...8x92
                  </div>
               </div>
            </Card>

            <div className="mt-12 flex items-center gap-2">
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
               <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Syncing Stadium Access...</span>
            </div>
          </div>
        )}
      </div>

      <div className={`space-y-3 transition-all duration-500 ${connected ? 'opacity-0 translate-y-10 hidden' : 'opacity-100 translate-y-0'}`}>
        <Button onClick={simulateConnect} disabled={connecting || connected}>
          {connecting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : (
            'Connect TON Wallet'
          )}
        </Button>
        <Button variant="secondary" disabled={connecting || connected}>
          Create New Wallet
        </Button>
      </div>
    </div>
  );
};

export default WalletSetupScreen;