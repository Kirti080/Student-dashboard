import axios from "axios";
import axiosConfig from "@/api/axiosConfig";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  reply: string;
};

export const sendChatMessage = async (
  messages: ChatMessage[]
): Promise<string> => {
  try {
    const response = await axiosConfig.post<ChatResponse>("/chat", {
      messages: messages.map(({ role, content }) => ({
        role,
        content,
      })),
    });

    return response.data.reply;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(error.response?.data?.message || "The AI assistant is unavailable.", { cause: error });
    }

    throw error;
  }
};
