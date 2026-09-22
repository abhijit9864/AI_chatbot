"use client";

import { useState } from "react";
import Sidebar from "./sidebar/sidebar";
import Navbar from "./navbar/navbar";
import ChatWindow from "./chat/chat-window";
import LoginModal from "./auth/login-modal";
import RegisterModal from "./auth/register-modal";
import { ChatProvider } from "./chat/chat-provider";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [authRefreshKey, setAuthRefreshKey] = useState(0);

  const handleLoginSuccess = () => {
    setAuthRefreshKey((previous) => previous + 1);
    setLoginOpen(false);
  };

  const handleRegisterSuccess = () => {
    setAuthRefreshKey((previous) => previous + 1);
    setRegisterOpen(false);
  };

  const openLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="relative z-10">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
            onLoginClick={openLogin}
            authRefreshKey={authRefreshKey}
          />

          <div className="min-h-0 flex-1">
            <ChatWindow />
          </div>
        </div>

        {/* Login Modal */}
        {loginOpen && (
          <LoginModal
            onClose={() => setLoginOpen(false)}
            onSwitchToRegister={openRegister}
            onSuccess={handleLoginSuccess}
          />
        )}

        {/* Register Modal */}
        {registerOpen && (
          <RegisterModal
            onClose={() => setRegisterOpen(false)}
            onSwitchToLogin={openLogin}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </div>
    </ChatProvider>
  );
}