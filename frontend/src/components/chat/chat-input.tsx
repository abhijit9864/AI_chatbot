"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || disabled) {
      return;
    }

    onSend(trimmedContent);
    setContent("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      const trimmedContent = content.trim();

      if (!trimmedContent || disabled) {
        return;
      }

      onSend(trimmedContent);
      setContent("");
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-4xl items-end gap-3"
      >
        <div className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus-within:border-gray-500">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI..."
            disabled={disabled}
            rows={1}
            className="max-h-40 min-h-6 w-full resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="mt-2 text-xs text-gray-400">
            Enter to send · Shift + Enter for new line
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          title="Send message"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}