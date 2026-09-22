"use client";

import { LogOut } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Dashboard
        </h1>

        <p className="text-xs text-gray-500">
          AI platform administration
        </p>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  );
}