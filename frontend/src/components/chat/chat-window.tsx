"use client";

import { Message } from "@/types/chat";
import { User } from "@/types/user";
import { useEffect, useRef, useState } from "react";

import {
  createChat,
  renameChat,
  sendMessageStream,
} from "@/lib/chat";

import { useChatContext } from "./chat-provider";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import Swal from "sweetalert2";

export default function ChatWindow() {
  const [user, setUser] = useState<User | null>(null);

  /*
   * -----------------------------------------
   * STREAM / ABORT REFS
   * -----------------------------------------
   */

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const streamingMessageIdRef =
    useRef<string | null>(null);

  const streamingContentRef =
    useRef<string>("");

  /*
   * -----------------------------------------
   * CHAT CONTEXT
   * -----------------------------------------
   */

  const {
    messages,
    setMessages,
    currentChat,
    setCurrentChat,
    setChats,
    sending,
    setSending,
  } = useChatContext();

  /*
   * -----------------------------------------
   * LOAD USER
   * -----------------------------------------
   */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser: User =
        JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Failed to parse stored user:",
        error,
      );

      setUser(null);
    }
  }, []);

  /*
   * -----------------------------------------
   * GENERATE CHAT TITLE
   * -----------------------------------------
   */

  const generateChatTitle = (
    content: string,
  ) => {
    const cleanedContent =
      content.trim().replace(/\s+/g, " ");

    if (!cleanedContent) {
      return "New Chat";
    }

    const maxLength = 45;

    if (
      cleanedContent.length <=
      maxLength
    ) {
      return cleanedContent;
    }

    return `${cleanedContent.slice(
      0,
      maxLength,
    )}...`;
  };

  /*
   * -----------------------------------------
   * STOP GENERATION
   * -----------------------------------------
   */

  const handleStop = () => {
    const messageId =
      streamingMessageIdRef.current;

    /*
     * VERY IMPORTANT:
     *
     * Capture the current content BEFORE
     * aborting the request and BEFORE React
     * gets another render.
     */
    const currentContent =
      streamingContentRef.current;

    /*
     * Immediately preserve the partial
     * response in the UI.
     */
    if (messageId) {
      setMessages((previous) =>
        previous.map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          return {
            ...message,
            content:
              currentContent ||
              message.content ||
              "Generation stopped.",
          };
        }),
      );
    }

    /*
     * Now cancel the actual request.
     */
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  /*
   * -----------------------------------------
   * SEND MESSAGE
   * -----------------------------------------
   */

  const handleSend = async (
    content: string,
  ) => {
    const token =
      localStorage.getItem("token");

    /*
     * Authentication check
     */

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
     * Prevent multiple requests
     */

    if (sending) {
      return;
    }

    let activeChat = currentChat;

    let temporaryMessageId:
      | string
      | null = null;

    let streamingMessageId:
      | string
      | null = null;

    try {
      setSending(true);

      /*
       * -----------------------------------------
       * CREATE NEW CHAT
       * -----------------------------------------
       */

      if (!activeChat) {
        const result =
          await createChat();

        activeChat = result.chat;

        setCurrentChat(activeChat);

        setChats((previous) => [
          activeChat!,
          ...previous,
        ]);

        sessionStorage.setItem(
          "currentChatId",
          activeChat.id,
        );
      }

      /*
       * -----------------------------------------
       * FIRST MESSAGE
       * -----------------------------------------
       */

      const isFirstMessage =
        messages.length === 0;

      /*
       * -----------------------------------------
       * CREATE TEMPORARY MESSAGE IDS
       * -----------------------------------------
       */

      temporaryMessageId =
        crypto.randomUUID();

      streamingMessageId =
        crypto.randomUUID();

      /*
       * Store streaming message ID
       * outside React state.
       */

      streamingMessageIdRef.current =
        streamingMessageId;

      /*
       * Reset previous streamed content.
       */

      streamingContentRef.current = "";

      /*
       * -----------------------------------------
       * TEMPORARY USER MESSAGE
       * -----------------------------------------
       */

      const temporaryUserMessage:
        Message = {
        id: temporaryMessageId,
        chatId: activeChat.id,
        role: "USER",
        content,
        createdAt:
          new Date().toISOString(),
      };

      /*
       * -----------------------------------------
       * STREAMING ASSISTANT MESSAGE
       * -----------------------------------------
       */

      const streamingAssistantMessage:
        Message = {
        id: streamingMessageId,
        chatId: activeChat.id,
        role: "ASSISTANT",
        content: "",
        createdAt:
          new Date().toISOString(),
      };

      /*
       * Add temporary messages
       */

      setMessages((previous) => [
        ...previous,
        temporaryUserMessage,
        streamingAssistantMessage,
      ]);

      /*
       * -----------------------------------------
       * RESPONSE TIMER
       * -----------------------------------------
       */

      const startTime =
        performance.now();

      /*
       * -----------------------------------------
       * ABORT CONTROLLER
       * -----------------------------------------
       */

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      /*
       * -----------------------------------------
       * CHAT TITLE
       * -----------------------------------------
       */

      if (isFirstMessage) {
        const newTitle =
          generateChatTitle(content);

        try {
          const renameResult =
            await renameChat(
              activeChat.id,
              newTitle,
            );

          const updatedChat =
            renameResult.chat;

          activeChat =
            updatedChat;

          setCurrentChat(
            updatedChat,
          );

          setChats((previous) =>
            previous.map((chat) =>
              chat.id ===
              updatedChat.id
                ? updatedChat
                : chat,
            ),
          );
        } catch (error) {
          console.error(
            "Failed to generate chat title:",
            error,
          );
        }
      }

      /*
       * -----------------------------------------
       * STREAM AI RESPONSE
       * -----------------------------------------
       */

      const result =
        await sendMessageStream(
          activeChat.id,
          content,
          (chunk) => {
            /*
             * Save every streamed chunk
             * outside React state.
             */
            streamingContentRef.current +=
              chunk;

            const currentStreamingContent =
              streamingContentRef.current;

            /*
             * Update UI.
             */
            setMessages((previous) =>
              previous.map(
                (message) => {
                  if (
                    message.id !==
                    streamingMessageId
                  ) {
                    return message;
                  }

                  return {
                    ...message,
                    content:
                      currentStreamingContent,
                  };
                },
              ),
            );
          },
          controller.signal,
        );

      /*
       * -----------------------------------------
       * RESPONSE TIME
       * -----------------------------------------
       */

      const responseTimeMs =
        performance.now() -
        startTime;

      const assistantMessageWithTiming:
        Message = {
        ...result.assistantMessage,
        responseTimeMs,
      };

      /*
       * -----------------------------------------
       * REPLACE TEMPORARY MESSAGES
       * -----------------------------------------
       */

      setMessages((previous) => {
        const cleanedMessages =
          previous.filter(
            (message) =>
              message.id !==
                temporaryMessageId &&
              message.id !==
                streamingMessageId,
          );

        return [
          ...cleanedMessages,
          result.userMessage,
          assistantMessageWithTiming,
        ];
      });
    } catch (error) {
      /*
       * -----------------------------------------
       * HANDLE STOP
       * -----------------------------------------
       */

      const isAbortError =
        error instanceof Error &&
        error.name === "AbortError";

      if (isAbortError) {
        /*
         * Capture the content NOW.
         *
         * Do NOT read the ref inside the
         * React updater because finally()
         * will clear the ref.
         */

        const messageId =
          streamingMessageIdRef.current;

        const stoppedContent =
          streamingContentRef.current;

        if (messageId) {
          setMessages((previous) =>
            previous.map((message) => {
              if (
                message.id !== messageId
              ) {
                return message;
              }

              return {
                ...message,
                content:
                  stoppedContent ||
                  message.content ||
                  "Generation stopped.",
              };
            }),
          );
        }

        /*
         * IMPORTANT:
         *
         * Do not remove the temporary
         * user or assistant messages.
         */
        return;
      }

      /*
       * -----------------------------------------
       * HANDLE REAL ERRORS
       * -----------------------------------------
       */

      console.error(
        "Failed to send message:",
        error,
      );

      /*
       * Remove temporary messages
       * only for real errors.
       */

      setMessages((previous) =>
        previous.filter(
          (message) =>
            message.id !==
              temporaryMessageId &&
            message.id !==
              streamingMessageId,
        ),
      );

      await Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text:
          error instanceof Error
            ? error.message
            : "Failed to generate AI response.",
        confirmButtonColor:
          "#111827",
      });
    } finally {
      /*
       * -----------------------------------------
       * CLEANUP
       * -----------------------------------------
       */

      setSending(false);

      abortControllerRef.current =
        null;

      /*
       * IMPORTANT:
       *
       * Clear refs only AFTER the UI has
       * received the captured stopped
       * content.
       */

      streamingMessageIdRef.current =
        null;

      streamingContentRef.current =
        "";
    }
  };

  /*
   * -----------------------------------------
   * COPY MESSAGE
   * -----------------------------------------
   */

  const handleCopy = async (
    content: string,
  ) => {
    await navigator.clipboard.writeText(
      content,
    );
  };

  /*
   * -----------------------------------------
   * EDIT MESSAGE
   * -----------------------------------------
   */

  const handleEdit = (
    message: Message,
  ) => {
    console.log(
      "Edit message:",
      message,
    );
  };

  /*
   * -----------------------------------------
   * REGENERATE RESPONSE
   * -----------------------------------------
   */

  const handleRegenerate = (
    message: Message,
  ) => {
    console.log(
      "Regenerate message:",
      message,
    );
  };

  /*
   * -----------------------------------------
   * CHECK MESSAGES
   * -----------------------------------------
   */

  const hasMessages =
    messages.length > 0;

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {!hasMessages ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Hello,{" "}
                {user?.name || "there"} 👋
              </h1>

              <p className="mt-3 text-base text-gray-500">
                What can I help you with today?
              </p>
            </div>

            <ChatInput
              onSend={handleSend}
              onStop={handleStop}
              disabled={sending}
            />
          </div>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isTyping={sending}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onRegenerate={
              handleRegenerate
            }
          />

          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            disabled={sending}
          />
        </>
      )}
    </div>
  );
}