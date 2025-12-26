import { atom } from "jotai";
import { Report } from "./report";

export type MessageType = "user" | "assistant" | "keyword-selection" | "report-preview";

export type ChatMessage = {
  id: string;
  type: MessageType;
  content?: string;
  reportId?: string;
  timestamp: number;
};

export const chatMessagesState = atom<ChatMessage[]>([]);
export const currentInputState = atom<string>("");
