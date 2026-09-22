"use client";

import { Menu, MoreHorizontal } from "lucide-react";
import UserMenu from "./user-menu";

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
  onLoginClick?: () => void;
  authRefreshKey?: number;
}

export default function Navbar({
  title,
  onMenuClick,
  onLoginClick,
  authRefreshKey,
}: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        {title && (
          <h1 className="text-sm font-semibold text-gray-900">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          title="More options"
        >
          <MoreHorizontal size={20} />
        </button>

        <UserMenu onLoginClick={onLoginClick}
         authRefreshKey={authRefreshKey}/>
      </div>
    </header>
  );
}