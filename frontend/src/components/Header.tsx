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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050814]/95 backdrop-blur-md px-3 md:px-6 py-2 shadow-lg">
      <div className="w-full flex items-center gap-4">
        
        {/* Full-Height Big Logo (Far Left - Matches Red Box) */}
        <Link href="/" className="flex-shrink-0 group flex items-center">
          <img
            src="/logo.png"
            alt="One 4 All Logo"
            className="h-16 md:h-20 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-xl"
          />
        </Link>

        {/* Right Content Column */}
        <div className="flex-1 flex flex-col justify-center min-w-0 space-y-1.5">
          
          {/* Top Row: Title, Search, Actions */}
          <div className="flex items-center justify-between gap-3 w-full">
            
            {/* Title & CS67 Badge */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="font-black text-2xl md:text-3xl tracking-tight text-white group-hover:text-sky-300 transition-colors drop-shadow">
                One <span className="gradient-text-one4all">4 All</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 text-sky-300 font-extrabold border border-sky-400/40 uppercase tracking-wider">
                CS 67
              </span>
            </Link>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-xs hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาผลงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-transparent border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-emerald-400 text-xs font-medium border border-emerald-500/30 bg-transparent">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Admin</span>
                  <button
                    onClick={onAdminLogout}
                    className="ml-1 p-0.5 hover:text-red-400 transition-colors"
                    title="ออกจากระบบแอดมิน"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-transparent text-slate-400 hover:text-white text-xs transition-colors"
                  title="เข้าสู่ระบบแอดมิน"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">แอดมิน</span>
                </button>
              )}

              {isLoggedIn ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent text-xs text-slate-300">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-5 h-5 rounded-full border border-sky-400/40"
                    />
                  ) : null}
                  <span className="max-w-[80px] truncate text-[11px] hidden md:inline">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-transparent text-slate-300 hover:text-sky-300 text-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ (.ac.th)</span>
                </button>
              )}

              <button
                onClick={onOpenSubmitModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent hover:bg-sky-500/10 text-sky-300 hover:text-white font-semibold text-xs border border-sky-400/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>ส่งผลงานเกม</span>
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </button>
            </div>

          </div>

          {/* Bottom Row: Category Pills Bar */}
          <div className="w-full border-t border-white/5 pt-1 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTag(cat.id)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  activeTag === cat.id
                    ? 'text-sky-300 border-b-2 border-sky-400 font-bold bg-transparent'
                    : 'text-slate-400 hover:text-white bg-transparent'
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
