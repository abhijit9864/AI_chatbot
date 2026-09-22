"use client";

import { useState } from "react";
import { Check, Copy, Pencil, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
  onEdit?: (message: Message) => void;
  onRegenerate?: (message: Message) => void;
}

export default function MessageBubble({
  message,
  onCopy,
  onEdit,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = message.role === "USER";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`group flex max-w-[85%] flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Message */}
        <div
          className={
            isUser
              ? "rounded-2xl bg-black px-4 py-3 text-sm leading-7 text-white"
              : "w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm leading-7 text-gray-900"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ children }) {
                    return (
                      <div className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-[#0d1117]">
                        {children}
                      </div>
                    );
                  },

                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");

                    const language = match?.[1] || "code";

                    const code = String(children).replace(/\n$/, "");

                    if (match) {
                      return <CodeBlock code={code} language={language} />;
                    }

                    return (
                      <code
                        className="rounded-md bg-gray-200 px-1.5 py-0.5 text-[0.9em] text-gray-800"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },

                  p({ children }) {
                    return <p className="mb-3 last:mb-0">{children}</p>;
                  },

                  ul({ children }) {
                    return <ul className="mb-3 list-disc pl-6">{children}</ul>;
                  },

                  ol({ children }) {
                    return (
                      <ol className="mb-3 list-decimal pl-6">{children}</ol>
                    );
                  },

                  li({ children }) {
                    return <li>{children}</li>;
                  },

                  h1({ children }) {
                    return (
                      <h1 className="mb-3 text-xl font-semibold">{children}</h1>
                    );
                  },

                  h2({ children }) {
                    return (
                      <h2 className="mb-3 text-lg font-semibold">{children}</h2>
                    );
                  },

                  h3({ children }) {
                    return (
                      <h3 className="mb-2 text-base font-semibold">
                        {children}
                      </h3>
                    );
                  },

                  /* ================================
     TABLE
     ================================ */

                  table({ children }) {
                    return (
                      <div className="my-4 w-full overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                          {children}
                        </table>
                      </div>
                    );
                  },

                  thead({ children }) {
                    return <thead className="bg-gray-50">{children}</thead>;
                  },

                  tbody({ children }) {
                    return (
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {children}
                      </tbody>
                    );
                  },

                  tr({ children }) {
                    return (
                      <tr className="transition hover:bg-gray-50">
                        {children}
                      </tr>
                    );
                  },

                  th({ children }) {
                    return (
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                        {children}
                      </th>
                    );
                  },

                  td({ children }) {
                    return (
                      <td className="border-b border-gray-100 px-4 py-3 align-top text-sm text-gray-700">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Response time */}
        {!isUser && message.responseTimeMs !== undefined && (
          <div className="mt-1 px-1 text-xs text-gray-400">
            Response time: {(message.responseTimeMs / 1000).toFixed(2)}s
          </div>
        )}

        {/* Message actions */}
        <div
          className={`mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <button
            type="button"
            onClick={() => onCopy?.(message.content)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            title="Copy message"
          >
            <Copy size={15} />
          </button>

          {isUser && (
            <button
              type="button"
              onClick={() => onEdit?.(message)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              title="Edit message"
            >
              <Pencil size={15} />
            </button>
          )}

          {!isUser && (
            <button
              type="button"
              onClick={() => onRegenerate?.(message)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              title="Regenerate response"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Code header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161b22] px-4 py-2">
        <span className="text-xs font-medium text-gray-400">{language}</span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm leading-6 text-gray-100">
          {code}
        </code>
      </pre>
    </div>
  );
}
