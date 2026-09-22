"use client";

import { useState } from "react";
import { Chat, Message } from "@/types/chat";

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const addMessage = (message: Message) => {
    setMessages((previous) => [...previous, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    chats,
    setChats,

    messages,
    setMessages,

    currentChat,
    setCurrentChat,

    loading,
    setLoading,

    sending,
    setSending,

    addMessage,
    clearMessages,
  };
}