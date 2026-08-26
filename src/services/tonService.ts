import { TonClient, Address, toNano, beginCell, Cell, fromNano } from '@ton/ton';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

export class TonService {
    private client: TonClient;
    private collectionAddress: string | null = null;

    constructor() {
        // Initialize TON client for mainnet/testnet
        this.client = new TonClient({
            endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC', // Use mainnet for production
            apiKey: process.env.VITE_TON_API_KEY || undefined
        });
        
        // Load collection address from environment
        this.collectionAddress = process.env.VITE_TON_COLLECTION_ADDRESS || null;
    }

    // Get wallet balance
    async getWalletBalance(address: string): Promise<string> {
        try {
            const balance = await this.client.getBalance(Address.parse(address));
            return fromNano(balance);
        } catch (error) {
            console.error('Error getting wallet balance:', error);
            return '0';
        }
    }

    // Check if address is valid TON address
    isValidTonAddress(address: string): boolean {
        try {
            Address.parse(address);
            return true;
        } catch {
            return false;
        }
    }

    // Create NFT metadata URI
    createNftMetadataUri(nftData: {
        name: string;
        description: string;
        image: string;
        attributes?: Array<{ trait_type: string; value: string | number }>;
    }): string {
        const metadata = {
            name: nftData.name,
            description: nftData.description,
            image: nftData.image,
            attributes: nftData.attributes || []
        };
        
        // In production, this should be uploaded to IPFS or a permanent storage
        // For now, we'll use the backend to serve metadata
        const metadataJson = JSON.stringify(metadata);
        const encodedMetadata = encodeURIComponent(metadataJson);
        
        return `${process.env.VITE_API_URL}/nft/metadata/${encodedMetadata}`;
    }

    // Get NFT collection info
    async getCollectionInfo() {
        if (!this.collectionAddress) {
            throw new Error('Collection address not configured');
        }

        try {
            // This would call the actual collection contract
            // For now, return mock data
            return {
                address: this.collectionAddress,
                nextItemIndex: 0,
                totalItems: 0,
                owner: null
            };
        } catch (error) {
            console.error('Error getting collection info:', error);
            throw error;
        }
    }

    // Get NFT info by item index
    async getNftInfo(itemIndex: number) {
        if (!this.collectionAddress) {
            throw new Error('Collection address not configured');
        }

        try {
            // This would call the actual NFT item contract
            // For now, return mock data
            return {
                exists: false,
                address: null,
                owner: null,
                content: null
            };
        } catch (error) {
            console.error('Error getting NFT info:', error);
            throw error;
        }
    }

    // Prepare mint transaction
    async prepareMintTransaction(
        ownerAddress: string, 
        nftData: {
            name: string;
            description: string;
            image: string;
            attributes?: Array<{ trait_type: string; value: string | number }>;
        }
    ) {
        if (!this.collectionAddress) {
            throw new Error('Collection address not configured');
        }

        try {
            const metadataUri = this.createNftMetadataUri(nftData);
            
            // Create the mint message body
            const mintBody = beginCell()
                .storeUint(1, 32) // mint op code
                .storeUint(Date.now(), 64) // query_id
                .storeUint(0, 64) // item_index (will be set by backend)
                .storeCoins(toNano('0.01')) // amount for NFT item
                .storeRef(
                    beginCell()
                        .storeAddress(Address.parse(ownerAddress))
                        .storeRef(
                            beginCell()
                                .storeUint(1, 8) // offchain content tag
                                .storeStringTail(metadataUri)
                                .endCell()
                        )
                        .endCell()
                )
                .endCell();

            return {
                to: this.collectionAddress,
                value: toNano('0.05').toString(), // 0.05 TON for minting
                body: mintBody.toBoc().toString('base64'),
                metadata: metadataUri
            };
        } catch (error) {
            console.error('Error preparing mint transaction:', error);
            throw error;
        }
    }

    // Prepare transfer transaction
    async prepareTransferTransaction(
        nftAddress: string,
        newOwnerAddress: string,
        forwardAmount: string = '0'
    ) {
        try {
            const transferBody = beginCell()
                .storeUint(0x5fcc3d14, 32) // transfer op code
                .storeUint(Date.now(), 64) // query_id
                .storeAddress(Address.parse(newOwnerAddress))
                .storeAddress(null) // response_destination
                .storeBit(false) // custom_payload
                .storeCoins(toNano(forwardAmount))
                .endCell();

            return {
                to: nftAddress,
                value: toNano('0.05').toString(), // 0.05 TON for transfer
                body: transferBody.toBoc().toString('base64')
            };
        } catch (error) {
            console.error('Error preparing transfer transaction:', error);
            throw error;
        }
    }
}

// Hook for using TON service
export const useTonService = () => {
    const tonService = new TonService();
    return tonService;
};

// Hook for wallet operations
export const useWalletOperations = () => {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const tonService = useTonService();

    const connectWallet = async () => {
        try {
            await tonConnectUI.openModal();
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    };

    const disconnectWallet = async () => {
        try {
            await tonConnectUI.disconnect();
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            throw error;
        }
    };

    const sendTransaction = async (transaction: {
        to: string;
        value: string;
        body?: string;
    }) => {
        if (!wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const result = await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
                messages: [
                    {
                        address: transaction.to,
                        amount: transaction.value,
                        payload: transaction.body || undefined
                    }
                ]
            });

            return result;
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    };

    const mintNft = async (nftData: {
        name: string;
        description: string;
        image: string;
        attributes?: Array<{ trait_type: string; value: string | number }>;
    }) => {
        if (!wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const transaction = await tonService.prepareMintTransaction(
                wallet.account.address, 
                nftData
            );
            
            const result = await sendTransaction(transaction);
            return { ...result, metadata: transaction.metadata };
        } catch (error) {
            console.error('Error minting NFT:', error);
            throw error;
        }
    };

    const transferNft = async (nftAddress: string, newOwnerAddress: string) => {
        if (!wallet) {
            throw new Error('Wallet not connected');
        }

        try {
            const transaction = await tonService.prepareTransferTransaction(
                nftAddress,
                newOwnerAddress
            );
            
            return await sendTransaction(transaction);
        } catch (error) {
            console.error('Error transferring NFT:', error);
            throw error;
        }
    };

    return {
        wallet,
        tonService,
        connectWallet,
        disconnectWallet,
        sendTransaction,
        mintNft,
        transferNft,
        isConnected: !!wallet
    };
};