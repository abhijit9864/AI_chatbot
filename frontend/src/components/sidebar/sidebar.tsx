"use client";

import { useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  Check,
  X,
} from "lucide-react";

import { useChatContext } from "../chat/chat-provider";

import {
  renameChat,
  deleteChat,
  getChatMessages,
} from "@/lib/chat";

export default function Sidebar() {
  const {
    chats,
    currentChat,
    setCurrentChat,
    setChats,
    setMessages,
    clearMessages,
  } = useChatContext();

  const [editingChatId, setEditingChatId] =
    useState<string | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  /*
   * Filter chats based on search text.
   */
  const filteredChats = chats.filter((chat) =>
    chat.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  /*
   * -----------------------------------------
   * NEW CHAT
   * -----------------------------------------
   *
   * This only creates a fresh UI state.
   * The database chat will be created when
   * the user sends the first message.
   */
  const handleNewChat = () => {
    setCurrentChat(null);
    clearMessages();

    sessionStorage.removeItem(
      "currentChatId"
    );
  };

  /*
   * -----------------------------------------
   * SELECT CHAT
   * -----------------------------------------
   */
  const handleSelectChat = async (
    chatId: string
  ) => {
    const chat = chats.find(
      (item) => item.id === chatId
    );

    if (!chat) {
      return;
    }

    try {
      setCurrentChat(chat);
      clearMessages();

      /*
       * Remember the selected chat for
       * this browser tab.
       */
      sessionStorage.setItem(
        "currentChatId",
        chat.id
      );

      const result =
        await getChatMessages(chatId);

      setMessages(result.messages);
    } catch (error) {
      console.error(
        "Failed to load chat messages:",
        error
      );
    }
  };

  /*
   * -----------------------------------------
   * RENAME
   * -----------------------------------------
   */
  const startEditing = (
    chatId: string,
    currentTitle: string
  ) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const saveRename = async () => {
    if (
      !editingChatId ||
      !editingTitle.trim()
    ) {
      return;
    }

    try {
      const result = await renameChat(
        editingChatId,
        editingTitle.trim()
      );

      const updatedChat = result.chat;

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === updatedChat.id
            ? updatedChat
            : chat
        )
      );

      if (
        currentChat?.id ===
        updatedChat.id
      ) {
        setCurrentChat(updatedChat);
      }

      setEditingChatId(null);
      setEditingTitle("");
    } catch (error) {
      console.error(
        "Failed to rename chat:",
        error
      );
    }
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  /*
   * -----------------------------------------
   * DELETE
   * -----------------------------------------
   */
  const handleDeleteChat = async (
    chatId: string
  ) => {
    try {
      await deleteChat(chatId);

      setChats((previous) =>
        previous.filter(
          (chat) => chat.id !== chatId
        )
      );

      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        clearMessages();

        sessionStorage.removeItem(
          "currentChatId"
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete chat:",
        error
      );
    }
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-gray-50">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
            AI
          </div>

          <span className="text-lg font-semibold text-gray-900">
            AI Chat
          </span>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={handleNewChat}
          className="group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
        >
          <Plus
            size={18}
            strokeWidth={2}
            className="text-gray-500 transition-colors group-hover:text-gray-800"
          />

          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        {/* Search */}
        <div className="mb-5">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search chats..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-transparent pl-9 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>
        </div>

        {/* Recent */}
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Recent
        </p>

        {filteredChats.length === 0 ? (
          <p className="px-2 py-3 text-sm text-gray-400">
            {searchQuery.trim()
              ? "No conversations found"
              : "No conversations yet"}
          </p>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 ${
                  currentChat?.id === chat.id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                {editingChatId ===
                chat.id ? (
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(event) =>
                        setEditingTitle(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          saveRename();
                        }

                        if (
                          event.key ===
                          "Escape"
                        ) {
                          cancelRename();
                        }
                      }}
                      className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-gray-500"
                    />

                    <button
                      type="button"
                      onClick={saveRename}
                      className="rounded p-1 text-green-600 hover:bg-gray-200"
                    >
                      <Check size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelRename
                      }
                      className="rounded p-1 text-gray-500 hover:bg-gray-200"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectChat(
                          chat.id
                        )
                      }
                      onDoubleClick={() =>
                        startEditing(
                          chat.id,
                          chat.title
                        )
                      }
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <MessageSquare
                        size={16}
                        className="shrink-0 text-gray-500"
                      />

                      <span className="truncate text-sm text-gray-700">
                        {chat.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteChat(
                          chat.id
                        )
                      }
                      className="hidden rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-red-500 group-hover:block"
                      title="Delete chat"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <Settings size={17} />
          Settings
        </button>

        <button
          type="button"
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <User size={17} />
          Account
        </button>
      </div>
    </aside>
  );
}
