// src/types/index.ts

export interface UserProfile {
  id?: string;
  displayName: string;
  avatar?: string;
  favoriteClubId: string | null;
  favoriteClubName?: string | null;
  fanRank: FanRank;
  walletAddress?: string | null;
  ftcBalance?: number;
  telegramId?: number;
}

export interface WalletState {
  address: string | null;
  balanceFTC: number;
  isConnected: boolean;
}

export interface OnboardingState {
  waitlistJoined: boolean;
  waitlistConfirmed: boolean;
  profileCompleted: boolean;
  walletConnected: boolean;
  clubSelected: boolean;
  referralCode: string;
  referralCount: number;
  activityCount: number;
  telegramId?: number;
}

export type FanRank = 'Amateur' | 'Supporter' | 'Regular' | 'Ultra' | 'Legend' | 'Founding Legend';

export interface Club {
  id: string;
  name: string;
  badge: string;
  foundedYear: number;
  totalMatches: number;
  trophies: {
    league: number;
    continental: number;
    domestic: number;
  };
  tags: string[];
  historySummary: string;
  valueRange: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
  badge?: string;
  votes?: number;
}