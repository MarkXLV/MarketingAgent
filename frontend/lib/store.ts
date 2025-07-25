import { create } from 'zustand';

interface User {
  userId: string;
  name: string;
  email: string;
  region?: string;
  language?: string;
  accessibility?: string;
  persona?: string;
}

interface Goal {
  goalId: string;
  userId: string;
  goal_type: string;
  target_amount?: number;
  deadline?: number;
  progress?: number;
}

interface Badge {
  badgeId: string;
  userId: string;
  badge_name: string;
  date_awarded: number;
}

interface ChatMessage {
  id?: string;
  author: 'user' | 'assistant';
  content: string;
  ts?: number;
}

interface AppState {
  // Chat state
  conversationId: string | null;
  history: ChatMessage[];
  isLoading: boolean;
  
  // User state
  user: User | null;
  
  // Financial data
  goals: Goal[];
  badges: Badge[];
  
  // Actions
  setConversationId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setGoals: (goals: Goal[]) => void;
  setBadges: (badges: Badge[]) => void;
  addBadge: (badge: Badge) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  conversationId: null,
  history: [],
  isLoading: false,
  user: null,
  goals: [],
  badges: [],
  
  // Actions
  setConversationId: (id) => set({ conversationId: id }),
  addMessage: (message) => set((state) => ({ 
    history: [...state.history, message] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setUser: (user) => set({ user }),
  setGoals: (goals) => set({ goals }),
  setBadges: (badges) => set({ badges }),
  addBadge: (badge) => set((state) => ({ 
    badges: [...state.badges, badge] 
  })),
  clearHistory: () => set({ history: [], conversationId: null }),
}));

// Convenience hook for chat state
export const useChatStore = () => {
  const { conversationId, history, isLoading, setConversationId, addMessage, setLoading, clearHistory } = useAppStore();
  return { conversationId, history, isLoading, setConversationId, addMessage, setLoading, clearHistory };
};

// Convenience hook for user state
export const useUserStore = () => {
  const { user, goals, badges, setUser, setGoals, setBadges, addBadge } = useAppStore();
  return { user, goals, badges, setUser, setGoals, setBadges, addBadge };
}; 