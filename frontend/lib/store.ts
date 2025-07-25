import { create } from 'zustand';

interface ChatMessage {
  id?: string;
  author: 'user' | 'assistant';
  content: string;
  ts: number;
}

interface Conversation {
  convoId: string;
  startedAt: number;
  title: string;
  firstMessage?: string;
}

interface User {
  userId: string;
  name: string;
  email: string;
  region?: string;
  language?: string;
  accessibility?: string;
  persona?: string;
  gender?: string;
  occupation?: string;
  age?: number;
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

interface AppState {
  // Chat state
  conversationId: string | null;
  history: ChatMessage[];
  isLoading: boolean;
  
  // Chat history
  conversations: Conversation[];
  isLoadingHistory: boolean;
  
  // User state  
  user: User | null;
  goals: Goal[];
  badges: Badge[];
  
  // Actions
  setConversationId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  clearHistory: () => void;
  
  // History actions
  setConversations: (conversations: Conversation[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  loadHistoryMessages: (messages: ChatMessage[]) => void;
  
  // User actions
  setUser: (user: User | null) => void;
  setGoals: (goals: Goal[]) => void;
  setBadges: (badges: Badge[]) => void;
  addBadge: (badge: Badge) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  conversationId: null,
  history: [],
  isLoading: false,
  conversations: [],
  isLoadingHistory: false,
  user: null,
  goals: [],
  badges: [],
  
  // Chat actions
  setConversationId: (id) => set({ conversationId: id }),
  addMessage: (message) => set((state) => ({ history: [...state.history, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearHistory: () => set({ history: [], conversationId: null }),
  
  // History actions
  setConversations: (conversations) => set({ conversations }),
  setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
  loadHistoryMessages: (messages) => set({ history: messages }),
  
  // User actions
  setUser: (user) => set({ user }),
  setGoals: (goals) => set({ goals }),
  setBadges: (badges) => set({ badges }),
  addBadge: (badge) => set((state) => ({ badges: [...state.badges, badge] })),
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