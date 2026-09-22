"use client";

import {
  useEffect,
  useRef,
} from "react";
import { Message } from "@/types/chat";
import MessageBubble from "./message-bubble";

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onCopy?: (content: string) => void;
  onEdit?: (message: Message) => void;
  onRegenerate?: (message: Message) => void;
}

export default function MessageList({
  messages,
  isTyping = false,
  onCopy,
  onEdit,
  onRegenerate,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            How can I help you?
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Start a new conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onCopy={onCopy}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
          />
        ))}

        {/* AI Thinking Indicator */}
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                </div>
              </div>

              <span className="text-xs text-gray-400">
                AI is thinking...
              </span>
            </div>
          </div>
        )}

        {/* Scroll target */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}