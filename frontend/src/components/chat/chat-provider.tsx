"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Chat, Message } from "@/types/chat";

import {
  getChats,
  getChatMessages,
} from "@/lib/chat";

interface ChatContextType {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;

  messages: Message[];
  setMessages: React.Dispatch<
    React.SetStateAction<Message[]>
  >;

  currentChat: Chat | null;
  setCurrentChat: React.Dispatch<
    React.SetStateAction<Chat | null>
  >;

  loading: boolean;
  setLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  sending: boolean;
  setSending: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<
  ChatContextType | undefined
>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  authRefreshKey?: number;
}

const SESSION_CHAT_KEY = "currentChatId";
const SESSION_INITIALIZED_KEY =
  "chatTabInitialized";

export function ChatProvider({
  children,
  authRefreshKey = 0,
}: ChatProviderProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] =
    useState<Chat | null>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /*
   * Prevent duplicate initialization in React
   * development mode.
   */
  const lastAuthRefreshKey = useRef<number | null>(
    null
  );

  useEffect(() => {
    if (
      lastAuthRefreshKey.current === authRefreshKey
    ) {
      return;
    }

    lastAuthRefreshKey.current = authRefreshKey;

    const token = localStorage.getItem("token");

    /*
     * -----------------------------------------
     * LOGGED OUT
     * -----------------------------------------
     */
    if (!token) {
      setLoading(false);
      setChats([]);
      setCurrentChat(null);
      setMessages([]);

      sessionStorage.removeItem(
        SESSION_CHAT_KEY
      );

      sessionStorage.removeItem(
        SESSION_INITIALIZED_KEY
      );

      return;
    }

    const initializeChat = async () => {
      try {
        setLoading(true);

        /*
         * Load existing chats.
         *
         * These will still appear in the sidebar.
         */
        const result = await getChats();

        const existingChats = result.chats;

        setChats(existingChats);

        /*
         * -----------------------------------------
         * NEW LOGIN
         * -----------------------------------------
         *
         * authRefreshKey > 0 means authentication
         * has just changed.
         *
         * After login:
         * -> show fresh chat
         * -> do NOT open an existing chat
         * -> do NOT create a DB chat
         */
        if (authRefreshKey > 0) {
          setCurrentChat(null);
          setMessages([]);

          sessionStorage.removeItem(
            SESSION_CHAT_KEY
          );

          sessionStorage.setItem(
            SESSION_INITIALIZED_KEY,
            "1"
          );

          return;
        }

        /*
         * -----------------------------------------
         * NEW TAB / FIRST LOAD
         * -----------------------------------------
         *
         * sessionStorage is different for every
         * browser tab.
         */
        const tabInitialized =
          sessionStorage.getItem(
            SESSION_INITIALIZED_KEY
          );

        /*
         * If this is a completely new tab,
         * start with a fresh unsaved chat.
         */
        if (!tabInitialized) {
          setCurrentChat(null);
          setMessages([]);

          sessionStorage.setItem(
            SESSION_INITIALIZED_KEY,
            "1"
          );

          sessionStorage.removeItem(
            SESSION_CHAT_KEY
          );

          return;
        }

        /*
         * -----------------------------------------
         * REFRESH / EXISTING TAB
         * -----------------------------------------
         *
         * Restore the exact chat that was open
         * before the refresh.
         */
        const savedChatId =
          sessionStorage.getItem(
            SESSION_CHAT_KEY
          );

        if (savedChatId) {
          const savedChat =
            existingChats.find(
              (chat) =>
                chat.id === savedChatId
            );

          if (savedChat) {
            setCurrentChat(savedChat);

            const messageResult =
              await getChatMessages(
                savedChat.id
              );

            setMessages(
              messageResult.messages
            );

            return;
          }

          /*
           * The saved chat no longer exists.
           */
          sessionStorage.removeItem(
            SESSION_CHAT_KEY
          );
        }

        /*
         * No chat selected in this tab.
         *
         * Show fresh empty chat.
         */
        setCurrentChat(null);
        setMessages([]);
      } catch (error) {
        console.error(
          "Failed to initialize chat:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [authRefreshKey]);

  const addMessage = (message: Message) => {
    setMessages((previous) => [
      ...previous,
      message,
    ]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChatContext must be used inside ChatProvider"
    );
  }

  return context;
}