'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { PlusCircle, Search, Sparkles, LogOut, LogIn, Palette, Check } from 'lucide-react';
import { useTheme, THEME_OPTIONS, ThemeMode } from '@/context/ThemeContext';

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
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  const { theme, setTheme } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  const logoSrc = theme === 'graph-paper' ? '/logo2.png' : '/logo.png?v=2';

  const cs67BadgeStyle =
    theme === 'graph-paper'
      ? 'bg-slate-900 text-slate-100 border-slate-700 shadow-md'
      : theme === 'blueprint'
      ? 'bg-orange-500/20 text-[#FF7E14] border-orange-400/40 shadow-sm'
      : 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm';

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--bg-header)] text-[var(--text-main)] backdrop-blur-md px-4 md:px-8 py-3.5 shadow-xl transition-colors duration-300">
      <div className="w-full flex items-center gap-5 md:gap-6">
        {/* Full-Height Large Prominent Logo (Far Left) */}
        <Link href="/hub" className="flex-shrink-0 group flex items-center">
          <img
            src={logoSrc}
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
              <span className="font-black text-3xl md:text-4xl lg:text-5xl tracking-tight text-[var(--text-title)] transition-colors drop-shadow-md">
                One <span className="gradient-text-orange font-black drop-shadow-[0_0_12px_rgba(255,126,20,0.6)]">4</span> All
              </span>
              <span className={`text-xs md:text-sm px-3 py-1 rounded-full font-extrabold border uppercase tracking-wider transition-all duration-300 ${cs67BadgeStyle}`}>
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
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FF7E14] focus:ring-1 focus:ring-[#FF7E14] transition-all"
              />
            </div>

            {/* Scaled Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Multi-Theme Selector Dropdown */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-white/10 text-[var(--text-main)] text-xs md:text-sm font-semibold border border-[var(--border-card)] transition-all cursor-pointer"
                  title="เปลี่ยนธีมพื้นหลัง (Theme Selector)"
                >
                  <Palette className="w-4 h-4 text-[#FF7E14]" />
                  <span className="hidden lg:inline">{currentThemeObj.label}</span>
                </button>

                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-xl">
                    <div className="px-3 py-1.5 border-b border-white/10 mb-1 text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                      🎨 เลือกลายกระดาษกราฟ & ธีม
                    </div>
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTheme(opt.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all text-xs ${
                          theme === opt.id
                            ? 'bg-sky-500/20 text-white font-bold border border-sky-400/30'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{opt.icon}</span>
                          <div>
                            <div className="font-bold">{opt.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{opt.desc}</div>
                          </div>
                        </div>
                        {theme === opt.id && <Check className="w-4 h-4 text-[#FF7E14]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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

              {isLoggedIn && (
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
                    ? 'text-[#FF7E14] border-b-2 border-[#FF7E14] font-extrabold bg-transparent drop-shadow-[0_0_8px_rgba(255,126,20,0.5)]'
                    : 'text-[var(--text-main)] opacity-75 hover:opacity-100 hover:text-[#FF7E14] bg-transparent'
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
