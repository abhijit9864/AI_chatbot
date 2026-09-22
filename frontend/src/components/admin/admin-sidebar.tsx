"use client";

import {
  BarChart3,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-950 text-white">
      <div className="flex h-16 items-center px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
            AI
          </div>

          <span className="font-semibold">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <a
          href="/admin"
          className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-sm"
        >
          <BarChart3 size={17} />
          Dashboard
        </a>

        <a
          href="/admin/users"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <Users size={17} />
          Users
        </a>

        <a
          href="/admin/chats"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <MessageSquare size={17} />
          Conversations
        </a>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <Settings size={17} />
          Settings
        </button>
      </div>
    </aside>
  );
}