'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { PlusCircle, Search, Sparkles, ShieldCheck, LogOut, Lock, LogIn } from 'lucide-react';

interface HeaderProps {
  onOpenSubmitModal: () => void;
  onOpenAdminModal: () => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTag: string;
  setActiveTag: (tag: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmitModal,
  onOpenAdminModal,
  isAdmin,
  onAdminLogout,
  searchQuery,
  setSearchQuery,
  activeTag,
  setActiveTag,
}) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  const categories = [
    { id: '', label: '🔥 ทั้งหมด' },
    { id: 'cs67', label: '💻 CS 67' },
    { id: 'webgl', label: '⚡ WebGL / 3D' },
    { id: 'puzzle', label: '🧩 Puzzle' },
    { id: 'arcade', label: '🕹️ Arcade' },
    { id: 'action', label: '💥 Action' },
    { id: 'itch-io', label: '👾 Itch.io' },
    { id: 'html5', label: '🌐 HTML5' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050814]/95 backdrop-blur-md px-4 md:px-8 py-3.5 shadow-xl">
      <div className="w-full flex items-center gap-5 md:gap-6">
        
        {/* Full-Height Large Prominent Logo (Far Left) */}
        <Link href="/" className="flex-shrink-0 group flex items-center">
          <img
            src="/logo.png?v=2"
            alt="One 4 All Logo"
            className="h-20 md:h-24 lg:h-28 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-2xl"
          />
        </Link>

        {/* Right Content Column */}
        <div className="flex-1 flex flex-col justify-center min-w-0 space-y-2">
          
          {/* Top Row: Title, Search, Actions */}
          <div className="flex items-center justify-between gap-4 w-full">
            
            {/* Large Title & CS67 Badge */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <span className="font-black text-3xl md:text-4xl lg:text-5xl tracking-tight text-white group-hover:text-sky-300 transition-colors drop-shadow-md">
                One <span className="gradient-text-one4all">4 All</span>
              </span>
              <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/25 via-indigo-500/25 to-purple-500/25 text-sky-300 font-extrabold border border-sky-400/40 uppercase tracking-wider shadow-sm">
                CS 67
              </span>
            </Link>

            {/* Scaled Search Bar */}
            <div className="relative flex-1 max-w-sm md:max-w-md hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาผลงานเกม CS67, โปรเจกต์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border border-white/15 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>

            {/* Scaled Action Buttons */}
            <div className="flex items-center gap-2.5">
              {isAdmin ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-emerald-400 text-xs md:text-sm font-semibold border border-emerald-500/30 bg-transparent">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden md:inline">Admin</span>
                  <button
                    onClick={onAdminLogout}
                    className="ml-1 p-0.5 hover:text-red-400 transition-colors"
                    title="ออกจากระบบแอดมิน"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-transparent text-slate-300 hover:text-white text-xs md:text-sm font-medium transition-colors"
                  title="เข้าสู่ระบบแอดมิน"
                >
                  <Lock className="w-4 h-4 text-sky-400" />
                  <span className="hidden md:inline">แอดมิน</span>
                </button>
              )}

              {isLoggedIn ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-transparent text-xs md:text-sm text-slate-300">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-6 h-6 rounded-full border border-sky-400/40"
                    />
                  ) : null}
                  <span className="max-w-[110px] truncate font-medium hidden md:inline">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-transparent text-slate-200 hover:text-sky-300 text-xs md:text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4 text-sky-400" />
                  <span>เข้าสู่ระบบ (.ac.th)</span>
                </button>
              )}

              {(isLoggedIn || isAdmin) && (
                <button
                  onClick={onOpenSubmitModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-transparent hover:bg-sky-500/15 text-sky-300 hover:text-white font-bold text-xs md:text-sm border border-sky-400/40 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-sky-400" />
                  <span>ส่งผลงานเกม</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                </button>
              )}

            </div>

          </div>

          {/* Bottom Row: Scaled Category Pills Bar */}
          <div className="w-full border-t border-white/10 pt-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs md:text-sm">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTag(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTag === cat.id
                    ? 'text-sky-300 border-b-2 border-sky-400 font-extrabold bg-transparent'
                    : 'text-slate-300 hover:text-white bg-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </header>
  );
};
