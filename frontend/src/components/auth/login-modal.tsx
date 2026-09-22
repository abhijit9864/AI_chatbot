"use client";

import { X } from "lucide-react";
import LoginForm from "./login-form";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export default function LoginModal({
  onClose,
  onSwitchToRegister,
  onSuccess,
}: LoginModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
            AI
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Sign in to continue to your AI workspace
          </p>
        </div>

        {/* Login Form */}
        <LoginForm onSuccess={onSuccess} />

        {/* Signup */}
        <div className="mt-5 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-gray-900 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}