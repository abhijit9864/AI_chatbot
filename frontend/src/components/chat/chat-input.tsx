"use client";

import {
  FormEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    // Reset height first so it can shrink as well
    textarea.style.height = "24px";

    // Calculate required height
    const newHeight = Math.min(textarea.scrollHeight, 160);

    textarea.style.height = `${newHeight}px`;

    // Only show scrollbar after maximum height
    textarea.style.overflowY =
      textarea.scrollHeight > 160 ? "auto" : "hidden";
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContent(event.target.value);

    // Run after React updates the textarea value
    requestAnimationFrame(autoResize);
  };

  const resetTextarea = () => {
    setContent("");

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "24px";
        textareaRef.current.style.overflowY = "hidden";
      }
    });
  };

  const sendMessage = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent || disabled) {
      return;
    }

    onSend(trimmedContent);
    resetTextarea();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
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
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message AI..."
            disabled={disabled}
            rows={1}
            className="block w-full resize-none overflow-hidden bg-transparent text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              height: "24px",
              maxHeight: "160px",
            }}
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