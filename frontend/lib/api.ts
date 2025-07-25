import axios from 'axios';

// Create a single, configured Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Fixed: Use localhost instead of 127.0.0.1
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Example function to connect to your chat endpoint
export const postChatMessage = async (
  history: any[],
  user_text: string,
  convoId: string | null,
  userId: string
) => {
  try {
    const requestData = {
      history,
      user_text,
      convoId,
      userId,
    };
    
    console.log('Sending request to backend:', requestData);
    
    const response = await apiClient.post('/marketing-chat', requestData);
    return response.data; // { bot_reply: "...", convoId: "..." }
  } catch (error) {
    console.error("Error posting chat message:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error("Request data that failed:", {
        history,
        user_text,
        convoId,
        userId,
      });
    }
    throw error;
  }
};

// Example function to get conversation history
export const getHistory = async (userId: string) => {
  try {
    const response = await apiClient.get(`/history?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (convoId: string, userId: string) => {
  try {
    const response = await apiClient.get(`/history/${convoId}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
}; 