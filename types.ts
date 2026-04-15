export type FanRank = 'Amateur' | 'Supporter' | 'Regular' | 'Ultra' | 'Legend' | 'Founding Legend';

export interface UserProfile {
  displayName: string;
  avatar: string;
  favoriteClubId: string | null;
  favoriteClubName?: string;  // Added for custom clubs
  fanRank?: FanRank;
}

export interface OnboardingState {
  waitlistJoined: boolean;
  waitlistConfirmed: boolean;
  profileCompleted: boolean;
  walletConnected: boolean;
  clubSelected: boolean;
  referralCode: string;
  referralCount: number;
  lastTriviaDate?: string;
  activityCount: number;
}

export interface CoachProfile {
  name: string;
  yearsAtClub: number;
  philosophy: string;
}

export interface Club {
  id: string;
  name: string;
  badge: string;
  fanCount: number;
  foundedYear: number;
  totalMatches: number;
  trophies: {
    league: number;
    continental: number;
    domestic: number;
  };
  valueRange: string;
  coach: CoachProfile;
  tags: string[];
  historySummary: string;
}

export interface WalletState {
  address: string | null;
  balanceFTC: number;
  isConnected: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
  badge?: string;
  fanRank?: FanRank;
}

export type TransactionType = 'reward' | 'deposit' | 'withdrawal' | 'purchase' | 'activity';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  isPositive: boolean;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  icon: string;
}

export interface LineupPoll {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    votes: number;
  }[];
  totalVotes: number;
  isActive: boolean;
}

export type PollCategory = 'lineup' | 'formation' | 'tactics' | 'institutional';

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  number: number;
  photo: string;
}

export interface TacticalPoll {
  id: string;
  category: PollCategory;
  title: string;
  description: string;
  endTime: string;
  totalVotes: number;
  options?: {
    id: string;
    label: string;
    votes: number;
    description?: string;
    icon?: string;
  }[];
}