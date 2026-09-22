"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { User as UserType } from "@/types/user";
import swal from "sweetalert2";
import Swal from "sweetalert2";
interface UserMenuProps {
  onLoginClick?: () => void;
  authRefreshKey?: number;
}

export default function UserMenu({
  onLoginClick,
  authRefreshKey,
}: UserMenuProps) {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   if (!token) {
  //     setLoading(false);
  //     return;
  //   }

  //   getCurrentUser()
  //     .then((result) => {
  //       setUser(result.user);
  //     })
  //     .catch(() => {
  //       localStorage.removeItem("token");
  //       localStorage.removeItem("user");
  //       setUser(null);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, []);


  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setLoading(false);
    return;
  }

  getCurrentUser()
    .then((result) => {
      setUser(result.user);
    })
    .catch(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    })
    .finally(() => {
      setLoading(false);
    });
}, [authRefreshKey]); // Add authRefreshKey as a dependency to re-run the effect when it changes

  const handleLogin = () => {
    onLoginClick?.();
  };

 const handleLogout = async () => {
  // 1. Show the confirmation dialog
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out of your session.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, log me out!",
    cancelButtonText: "Cancel"
  });

  // 2. Only proceed if the user confirmed
  if (result.isConfirmed) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setOpen(false);

    // Show a quick success message before refreshing
    await Swal.fire({
      icon: "success",
      title: "Logged out!",
      text: "You have been successfully logged out.",
      timer: 1500,
      showConfirmButton: false,
    });

    router.refresh();
    window.location.reload(); // Refresh the page to reflect the logged-out state
  }
};


  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Login
      </button>
    );
  }

  const firstLetter = user.name
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-medium text-white"
        title={user.name}
      >
        {firstLetter}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-sm font-medium text-gray-900">
              {user.name}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user.email}
            </p>
          </div>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User size={16} />
            Profile
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Settings size={16} />
            Settings
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}