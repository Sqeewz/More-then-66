'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, PlusCircle, Search, Sparkles, GraduationCap, ShieldCheck, LogOut, Lock } from 'lucide-react';

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
  const categories = [
    { id: '', label: '🔥 ทั้งหมด (All)' },
    { id: 'cs67', label: '💻 CS 67 Projects' },
    { id: 'webgl', label: '⚡ WebGL / 3D' },
    { id: 'puzzle', label: '🧩 Puzzle' },
    { id: 'arcade', label: '🕹️ Arcade' },
    { id: 'action', label: '💥 Action' },
    { id: 'itch-io', label: '👾 Itch.io' },
    { id: 'html5', label: '🌐 HTML5' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-sky-500/20 bg-[#0a1026]/90 backdrop-blur-md px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo: More Then 66 */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200 border border-white/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  More Then <span className="gradient-text-blue">66</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-bold border border-sky-400/30 uppercase tracking-wider">
                  <GraduationCap className="w-3 h-3 text-sky-300" />
                  CS 67
                </span>
              </div>
              <p className="text-[11px] text-slate-300 -mt-0.5 font-medium">
                คลังผลงานเกม วิทยาการคอมพิวเตอร์ รุ่น 67
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            {isAdmin ? (
              <button
                onClick={onAdminLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/30 text-red-300 font-bold text-xs border border-red-500/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium text-xs shadow-lg active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ส่งเกม</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="ค้นหาผลงานเกม CS67, ชื่อโปรเจกต์ หรือหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Mode</span>
              <button
                onClick={onAdminLogout}
                className="ml-1 p-1 hover:bg-red-500/30 rounded-md text-red-300 transition-colors"
                title="ออกจากระบบแอดมิน"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111a36] hover:bg-[#192750] text-slate-300 hover:text-white font-semibold text-xs border border-sky-500/20 transition-all"
              title="เข้าสู่ระบบแอดมิน"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>แอดมิน</span>
            </button>
          )}

          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:shadow-sky-400/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ส่งผลงานเกม (CS 67)</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          </button>
        </div>

      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTag(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTag === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 scale-105 border border-sky-300/40'
                : 'bg-[#111a36] text-slate-200 hover:bg-[#192750] hover:text-white border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  );
};
