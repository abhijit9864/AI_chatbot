"use client";

import { Message } from "@/types/chat";
import { User } from "@/types/user";
import { useEffect, useState } from "react";

import { createChat, renameChat, sendMessage } from "@/lib/chat";
import { useChatContext } from "./chat-provider";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import Swal from "sweetalert2";

export default function ChatWindow() {
  const [user, setUser] = useState<User | null>(null);
  const {
    messages,
    setMessages,
    currentChat,
    setCurrentChat,
    setChats,
    sending,
    setSending,
  } = useChatContext();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      setUser(null);
    }
  }, []);

  const generateChatTitle = (content: string) => {
    const cleanedContent = content.trim().replace(/\s+/g, " ");

    if (!cleanedContent) {
      return "New Chat";
    }

    const maxLength = 45;

    if (cleanedContent.length <= maxLength) {
      return cleanedContent;
    }

    return `${cleanedContent.slice(0, maxLength)}...`;
  };

  const handleSend = async (content: string) => {
    /*
     * -----------------------------------------
     * AUTHENTICATION CHECK
     * -----------------------------------------
     *
     * Do not call the backend if the user
     * is not logged in.
     */
    const token = localStorage.getItem("token");

    if (!token) {
      await Swal.fire({
        icon: "info",
        title: "Please login first",
        text: "You need to login before starting a conversation.",
        confirmButtonText: "OK",
        confirmButtonColor: "#111827",
      });

      return;
    }

    /*
     * Prevent multiple messages while AI
     * is generating a response.
     */
    if (sending) {
      return;
    }

    let activeChat = currentChat;

    /*
     * Keep temporary message ID outside the
     * try block so both success and error
     * handlers can access it.
     */
    let temporaryMessageId: string | null = null;

    try {
      setSending(true);

      /*
       * -----------------------------------------
       * NEW CHAT
       * -----------------------------------------
       *
       * If there is no current chat, create
       * the database chat only when the user
       * actually sends the first message.
       */
      if (!activeChat) {
        const result = await createChat();

        activeChat = result.chat;

        setCurrentChat(activeChat);

        setChats((previous) => [activeChat!, ...previous]);

        /*
         * Remember this chat for this browser tab.
         */
        sessionStorage.setItem("currentChatId", activeChat.id);
      }

      /*
       * -----------------------------------------
       * FIRST MESSAGE
       * -----------------------------------------
       */
      const isFirstMessage = messages.length === 0;

      /*
       * -----------------------------------------
       * TEMPORARY USER MESSAGE
       * -----------------------------------------
       */
      temporaryMessageId = crypto.randomUUID();

      const temporaryUserMessage: Message = {
        id: temporaryMessageId,
        chatId: activeChat.id,
        role: "USER",
        content,
        createdAt: new Date().toISOString(),
      };

      /*
       * Show the user's message immediately.
       */
      setMessages((previous) => [...previous, temporaryUserMessage]);

      /*
       * -----------------------------------------
       * START RESPONSE TIMER
       * -----------------------------------------
       */
      const startTime = performance.now();

      /*
       * -----------------------------------------
       * CHAT TITLE
       * -----------------------------------------
       *
       * Generate title from the first message.
       */
      if (isFirstMessage) {
        const newTitle = generateChatTitle(content);

        try {
          const renameResult = await renameChat(activeChat.id, newTitle);

          const updatedChat = renameResult.chat;

          activeChat = updatedChat;

          setCurrentChat(updatedChat);

          setChats((previous) =>
            previous.map((chat) =>
              chat.id === updatedChat.id ? updatedChat : chat,
            ),
          );
        } catch (error) {
          /*
           * Title failure should not stop
           * the actual message from being sent.
           */
          console.error("Failed to generate chat title:", error);
        }
      }

      /*
       * -----------------------------------------
       * SEND MESSAGE TO BACKEND
       * -----------------------------------------
       */
      const result = await sendMessage(activeChat.id, content);

      /*
       * -----------------------------------------
       * RESPONSE TIME
       * -----------------------------------------
       */
      const responseTimeMs = performance.now() - startTime;

      const { userMessage, assistantMessage } = result.message;

      const assistantMessageWithTiming: Message = {
        ...assistantMessage,
        responseTimeMs,
      };

      /*
       * -----------------------------------------
       * REPLACE TEMPORARY MESSAGE
       * -----------------------------------------
       */
      setMessages((previous) => {
        const temporaryIndex = previous.findIndex(
          (message) => message.id === temporaryMessageId,
        );

        /*
         * Safety fallback.
         */
        if (temporaryIndex === -1) {
          return [...previous, userMessage, assistantMessageWithTiming];
        }

        const updated = [...previous];

        updated.splice(
          temporaryIndex,
          1,
          userMessage,
          assistantMessageWithTiming,
        );

        return updated;
      });
    } catch (error) {
      console.error("Failed to send message:", error);

      /*
       * Remove only the temporary message
       * if the request failed.
       */
      if (temporaryMessageId) {
        setMessages((previous) =>
          previous.filter((message) => message.id !== temporaryMessageId),
        );
      }
    } finally {
      setSending(false);
    }
  };
  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleEdit = (message: Message) => {
    console.log("Edit message:", message);
  };

  const handleRegenerate = (message: Message) => {
    console.log("Regenerate message:", message);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {!hasMessages ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Hello, {user?.name || "there"} 👋
              </h1>

              <p className="mt-3 text-base text-gray-500">
                What can I help you with today?
              </p>
            </div>

            <ChatInput onSend={handleSend} disabled={sending} />
          </div>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isTyping={sending}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
          />

          <ChatInput onSend={handleSend} disabled={sending} />
        </>
      )}
    </div>
  );
}
