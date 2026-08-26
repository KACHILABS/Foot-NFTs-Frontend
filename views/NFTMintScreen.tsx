import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useWalletOperations } from '../src/services/tonService';

interface NFTMintScreenProps {
  onBack: () => void;
  highlightData: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchDetails: string;
  };
}

const NFTMintScreen: React.FC<NFTMintScreenProps> = ({ onBack, highlightData }) => {
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { wallet, mintNft, isConnected } = useWalletOperations();

  const handleMint = async () => {
    if (!isConnected || !wallet) {
      alert('Please connect your wallet first');
      return;
    }

    setMinting(true);
    
    try {
      const nftData = {
        name: `FOOT NFT #${highlightData.id}: ${highlightData.title}`,
        description: `${highlightData.description}\n\nMatch: ${highlightData.matchDetails}\nMinted on: ${new Date().toLocaleDateString()}`,
        image: highlightData.imageUrl,
        attributes: [
          { trait_type: 'Type', value: 'Football Highlight' },
          { trait_type: 'Match', value: highlightData.matchDetails },
          { trait_type: 'Season', value: '2026/27' },
          { trait_type: 'Rarity', value: 'Rare' }
        ]
      };

      const result = await mintNft(nftData);
      setTxHash(result.boc || 'mock_tx_hash');
      setMinted(true);
      
      // Notify backend about successful mint
      try {
        await fetch(`${process.env.VITE_API_URL}/nft/record-mint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            highlightId: highlightData.id,
            ownerAddress: wallet.account.address,
            txHash: result.boc || 'mock_tx_hash',
            metadata: result.metadata
          })
        });
      } catch (backendError) {
        console.error('Failed to record mint in backend:', backendError);
      }
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Please try again.');
    } finally {
      setMinting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-10 pb-8 bg-darkBg">
      <div className="mb-6 flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-black text-white ml-2">Mint Football NFT</h1>
      </div>

      {!minted ? (
        <div className="flex-1 space-y-6">
          {/* Preview Card */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden">
              <img 
                src={highlightData.imageUrl} 
                alt={highlightData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik05MCA5MEwxMTAgMTEwTTExMCA5MEw5MCA1MTAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{highlightData.title}</h3>
            <p className="text-gray-400 text-sm mb-3">{highlightData.description}</p>
            <p className="text-blue-400 text-xs font-semibold">{highlightData.matchDetails}</p>
          </Card>

          {/* NFT Details */}
          <Card className="bg-darkCard border-gray-800">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span>🏆</span>
              NFT Details
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white font-semibold">Football Highlight</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Blockchain:</span>
                <span className="text-blue-400 font-semibold">TON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Season:</span>
                <span className="text-white font-semibold">2026/27</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rarity:</span>
                <span className="text-purple-400 font-semibold">Rare</span>
              </div>
              {wallet && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner:</span>
                  <span className="text-green-400 font-mono text-xs">{formatAddress(wallet.account.address)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Minting Cost */}
          <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">Minting Cost</h3>
                <p className="text-gray-400 text-sm">Gas fee + Network fee</p>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">~0.05 TON</div>
                <div className="text-gray-500 text-xs">≈ $0.12 USD</div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {!isConnected ? (
              <Button disabled>
                Connect Wallet First
              </Button>
            ) : (
              <Button 
                onClick={handleMint} 
                disabled={minting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {minting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting NFT...
                  </span>
                ) : (
                  'Mint This Highlight as NFT'
                )}
              </Button>
            )}
            
            <p className="text-gray-500 text-xs text-center px-4 leading-relaxed">
              This will create a unique NFT on the TON blockchain that proves your ownership of this football highlight moment.
            </p>
          </div>
        </div>
      ) : (
        // Success State
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">NFT Minted Successfully! 🎉</h2>
          <p className="text-gray-400 mb-6">Your football highlight is now immortalized on the blockchain</p>
          
          <Card className="bg-darkCard border-green-500/30 w-full mb-6">
            <h3 className="text-white font-bold mb-3">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction:</span>
                <span className="text-green-400 font-mono text-xs">{txHash?.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-blue-400">TON Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-semibold">✓ Confirmed</span>
              </div>
            </div>
          </Card>

          <div className="space-y-3 w-full">
            <Button 
              variant="secondary"
              onClick={() => window.open(`https://testnet.tonscan.org/tx/${txHash}`, '_blank')}
            >
              View on TONScan
            </Button>
            <Button onClick={onBack}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMintScreen;