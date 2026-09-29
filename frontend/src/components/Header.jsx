import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Bot,
  Cpu,
  BookOpen,
  Video,
  FileText,
  Terminal,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import UserProfileModal from "./UserProfileModal";

export default function Header({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, signOut, isLoading, isGuest } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navItems = [
    { id: "landing", name: "Home", icon: Home },
    { id: "chat", name: "AI Tutor", icon: Bot },
    { id: "studio", name: "Circuit Studio", icon: Cpu },
    { id: "learning", name: "Learning Hub", icon: BookOpen },
    { id: "videos", name: "Video Lectures", icon: Video },
    { id: "assessment", name: "Assessments", icon: FileText },
    { id: "codelab", name: "Code Lab", icon: Terminal },
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      {/* ── Right-Most Top Circular User/Guest Button (Away from Navbar) ── */}
      <div className="fixed top-2.5 right-4 sm:right-6 z-50 select-none">
        {isLoading ? (
          <div className="w-9 h-9 rounded-full bg-[#18181b] animate-pulse border border-white/10" />
        ) : (
          <div className="relative">
            <button
              onClick={() => {
                if (user || isGuest) {
                  setShowUserMenu((v) => !v);
                } else if (onOpenAuth) {
                  onOpenAuth();
                }
              }}
              className="w-9 h-9 rounded-full bg-[#0e0e14]/90 border border-white/[0.18] backdrop-blur-2xl flex items-center justify-center text-white hover:border-white/35 hover:bg-[#1a1a22] transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)] group"
              title={user ? (user.display_name || user.full_name || user.email) : isGuest ? "Guest Session" : "Sign In"}
            >
              <User size={16} className="text-zinc-300 group-hover:text-white transition-colors" />
            </button>

            {/* Dropdown Menu when circle is clicked */}
            {showUserMenu && (user || isGuest) && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-56 p-2.5 z-50 bg-[#0e0e12] border border-white/[0.14] rounded-2xl shadow-2xl backdrop-blur-2xl">
                <div className="p-2.5 border-b border-white/[0.08] mb-1">
                  <div className="text-xs font-bold text-white font-mono">
                    {isGuest ? "Guest Session" : (user?.display_name || user?.full_name || "User")}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">{user?.email || "Offline"}</div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left p-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors font-mono"
                >
                  <User size={14} className="text-zinc-400" /> Profile & Progress
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left p-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors font-mono"
                >
                  <LogOut size={14} /> {isGuest ? "Exit Guest Mode" : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Floating Centered Navbar (VigilOps Style - Pure Navigation Tabs) ── */}
      <header className="sticky top-0 z-40 w-full py-2 px-4 sm:px-8 flex justify-center bg-transparent pointer-events-none select-none">
        <div className="pointer-events-auto w-full max-w-[1360px] h-[48px] sm:h-[50px] flex items-center justify-center bg-[#0e0e14]/92 border border-white/[0.14] backdrop-blur-2xl px-4 sm:px-8 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          <nav className="flex items-center justify-between sm:justify-evenly w-full gap-2 sm:gap-4 md:gap-6 lg:gap-8 flex-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative cursor-pointer h-[34px] sm:h-[36px] px-3 sm:px-4 md:px-4.5 rounded-full transition-all duration-150 flex items-center justify-center gap-2 outline-none leading-none ${
                    isActive ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 font-medium"
                  }`}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.72rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  <Icon size={14} strokeWidth={2.2} className={`shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`} />
                  <span className="whitespace-nowrap">
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="tubelight-lamp"
                      className="absolute inset-0 w-full h-full bg-white/[0.10] border border-white/[0.14] rounded-full -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-8 sm:w-10 h-[2px] bg-white rounded-t-full shadow-[0_0_12px_rgba(255,255,255,1)]">
                        <div className="absolute w-12 h-4 bg-white/25 rounded-full blur-sm -top-2 -left-2" />
                        <div className="absolute w-8 h-3 bg-white/35 rounded-full blur-[1px] -top-1" />
                      </div>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </header>
    </>
  );
}
