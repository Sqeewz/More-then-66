'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, PlusCircle, Search, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSubmitModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTag: string;
  setActiveTag: (tag: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmitModal,
  searchQuery,
  setSearchQuery,
  activeTag,
  setActiveTag,
}) => {
  const categories = [
    { id: '', label: '🔥 All Games' },
    { id: 'webgl', label: '⚡ WebGL' },
    { id: 'puzzle', label: '🧩 Puzzle' },
    { id: 'arcade', label: '🕹️ Arcade' },
    { id: 'action', label: '💥 Action' },
    { id: 'itch-io', label: '👾 Itch.io' },
    { id: 'html5', label: '🌐 HTML5' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-[#ffffff14] bg-[#0f121e]/90 backdrop-blur-md px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  Arcade<span className="gradient-text">Hub</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase tracking-wider">
                  Y8-Style
                </span>
              </div>
              <p className="text-[11px] text-gray-400 -mt-1 font-medium">Framed Web Game Platform</p>
            </div>
          </Link>

          <button
            onClick={onOpenSubmitModal}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-xs shadow-lg active:scale-95 transition-transform"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search games by title, keyword, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#181c2e] border border-gray-700/60 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Submit Game Link</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          </button>
        </div>

      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTag(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTag === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                : 'bg-[#181c2e] text-gray-300 hover:bg-[#232943] hover:text-white border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  );
};
