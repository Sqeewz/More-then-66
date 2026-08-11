'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { SubmitGameModal } from '@/components/SubmitGameModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { deleteGameApi } from '@/lib/api';
import { GameDocument } from '@/types/game';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useGames } from '@/hooks/useGames';
import { LOCAL_STORAGE_GAMES_KEY } from '@/lib/constants';
import {
  Gamepad2,
  Flame,
  RefreshCw,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Play,
  Info,
  Sparkles,
  TrendingUp,
  Box,
  Puzzle,
  Cpu,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// NetflixGameRow — Presentational component (Single Responsibility)
// Responsible only for rendering a horizontally-scrollable row of game cards.
// ---------------------------------------------------------------------------

interface GameRowProps {
  title: string;
  icon: React.ReactNode;
  games: GameDocument[];
  isAdmin: boolean;
  onDeleteGame: (id: string, title: string) => void;
}

const NetflixGameRow: React.FC<GameRowProps> = ({ title, icon, games, isAdmin, onDeleteGame }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (games.length === 0) return null;

  return (
    <div className="space-y-3 relative group/row py-2">
      {/* Row Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-extrabold text-lg md:text-xl text-white tracking-tight flex items-center gap-2">
          {icon}
          <span>{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#111a36] text-sky-300 font-semibold border border-sky-500/20">
            {games.length}
          </span>
        </h2>
      </div>

      {/* Row Carousel Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-[#050814] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hover:scale-110 text-white"
          title="เลื่อนซ้าย"
        >
          <div className="w-9 h-9 rounded-full bg-[#0e152e]/90 border border-sky-400/30 flex items-center justify-center shadow-lg hover:bg-blue-600">
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Horizontal Game Scroll */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game) => (
            <div key={game.id} className="w-[280px] md:w-[320px] flex-shrink-0">
              <GameCard game={game} isAdmin={isAdmin} onDeleteGame={onDeleteGame} />
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-[#050814] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hover:scale-110 text-white"
          title="เลื่อนขวา"
        >
          <div className="w-9 h-9 rounded-full bg-[#0e152e]/90 border border-sky-400/30 flex items-center justify-center shadow-lg hover:bg-blue-600">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// HomePage — Container component (uses hooks, delegates rendering)
// ---------------------------------------------------------------------------

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // ── Custom Hooks (OOP: each hook has a single responsibility) ──────────────
  const { isAdmin, adminPass, handleAdminSuccess, handleAdminLogout } = useAdminAuth();
  const { games, setGames, loading, refetch } = useGames(activeTag, searchQuery);

  // ── Event Handlers ─────────────────────────────────────────────────────────

  const handleGameSubmitted = () => refetch();

  const handleDeleteGame = async (id: string, title: string) => {
    const confirmDelete = confirm(`คุณต้องการลบผลงานเกม "${title}" ออกจากระบบ More Then 66 หรือไม่?`);
    if (!confirmDelete) return;

    // Optimistic UI update
    setGames((prev) => prev.filter((g) => g.id !== id));

    // Sync LocalStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
      if (raw) {
        const localGames: GameDocument[] = JSON.parse(raw);
        localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(localGames.filter((g) => g.id !== id)));
      }
    } catch { /* LocalStorage unavailable */ }

    // API delete
    try {
      await deleteGameApi(id, adminPass);
      alert(`ลบผลงานเกม "${title}" ออกจากระบบเรียบร้อยแล้ว`);
      refetch();
    } catch (err: unknown) {
      console.warn('[HomePage] API delete warning:', err);
    }
  };

  // ── Derived Data ───────────────────────────────────────────────────────────

  const featuredGame = games.length > 0 ? games[0] : null;
  const cs67Projects = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('cs67')));
  const webglGames   = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('webgl') || t.toLowerCase().includes('3d')));
  const puzzleGames  = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('puzzle')));
  const arcadeGames  = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('arcade') || t.toLowerCase().includes('action') || t.toLowerCase().includes('html5')));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-[#050814] text-white selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isAdmin={isAdmin}
        onAdminLogout={handleAdminLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
      />

      {/* Netflix Hero Billboard Section */}
      {featuredGame && !searchQuery && !activeTag && (
        <div className="relative w-full aspect-[21/9] md:aspect-[21/8] max-h-[520px] overflow-hidden bg-black border-b border-sky-500/20">
          {/* Hero Backdrop Image */}
          <img
            src={featuredGame.cover_image_url || featuredGame.thumbnail_url}
            alt={featuredGame.title}
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-90 animate-fade-in"
          />

          {/* Dark Navy Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-[#050814]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050814] via-[#050814]/70 to-transparent w-2/3" />

          {/* Hero Billboard Content */}
          <div className="absolute bottom-6 md:bottom-12 left-4 md:left-12 right-4 max-w-2xl space-y-3 z-10">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-xs shadow-lg border border-sky-300/40">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                FEATURED SPOTLIGHT
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-sky-300 font-bold text-[11px] border border-sky-400/30">
                <GraduationCap className="w-3 h-3" />
                By CS 67
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
              {featuredGame.title}
            </h1>

            <p className="text-xs md:text-sm text-slate-200 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow max-w-xl">
              {featuredGame.description}
            </p>

            {/* Netflix Hero Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <Link
                href={`/game/${featuredGame.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-transparent hover:bg-sky-500/15 text-white hover:text-sky-300 font-semibold text-xs border border-sky-400/40 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-sky-400" />
                <span>เล่นเกมเลย</span>
              </Link>

              <Link
                href={`/game/${featuredGame.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium text-xs border border-white/10 transition-all"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>ข้อมูลเพิ่มเติม</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">

        {/* Active Tag or Search View */}
        {(activeTag || searchQuery) ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-sky-400 fill-sky-400" />
                <span>{activeTag ? `หมวดหมู่: ${activeTag.toUpperCase()}` : `ผลการค้นหา: "${searchQuery}"`}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0e152e] text-sky-300 font-semibold border border-sky-500/30">
                  {games.length} เกม
                </span>
              </h2>

              <button
                onClick={refetch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e152e] hover:bg-[#162248] text-xs font-semibold text-slate-300 border border-white/10"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>รีเฟรช</span>
              </button>
            </div>

            {games.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0e152e] border border-sky-500/20 text-center space-y-4 shadow-xl">
                <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="font-bold text-lg text-white">ไม่พบผลงานเกมที่ค้นหา</h3>
                <p className="text-xs text-slate-400">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูครับ</p>
              </div>
            ) : (
              <div className="game-grid">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} isAdmin={isAdmin} onDeleteGame={handleDeleteGame} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Netflix Categorized Horizontal Rows */
          <div className="space-y-8">
            <NetflixGameRow
              title="🔥 ผลงานยอดนิยม (Trending CS 67 Games)"
              icon={<TrendingUp className="w-5 h-5 text-sky-400" />}
              games={games}
              isAdmin={isAdmin}
              onDeleteGame={handleDeleteGame}
            />
            <NetflixGameRow
              title="💻 CS 67 Projects (โปรเจกต์วิทยาการคอมพิวเตอร์)"
              icon={<Cpu className="w-5 h-5 text-blue-400" />}
              games={cs67Projects.length > 0 ? cs67Projects : games.slice(0, 4)}
              isAdmin={isAdmin}
              onDeleteGame={handleDeleteGame}
            />
            <NetflixGameRow
              title="⚡ WebGL / 3D Graphics (เกมสามมิติ)"
              icon={<Box className="w-5 h-5 text-cyan-400" />}
              games={webglGames.length > 0 ? webglGames : games.slice(1, 5)}
              isAdmin={isAdmin}
              onDeleteGame={handleDeleteGame}
            />
            <NetflixGameRow
              title="🧩 Puzzle & Brain (เกมปริศนาเเละลับสมอง)"
              icon={<Puzzle className="w-5 h-5 text-amber-400" />}
              games={puzzleGames.length > 0 ? puzzleGames : games.slice(2, 6)}
              isAdmin={isAdmin}
              onDeleteGame={handleDeleteGame}
            />
            {arcadeGames.length > 0 && (
              <NetflixGameRow
                title="🕹️ Arcade & Action (เกมอาเขตและแอ็กชัน)"
                icon={<Gamepad2 className="w-5 h-5 text-emerald-400" />}
                games={arcadeGames}
                isAdmin={isAdmin}
                onDeleteGame={handleDeleteGame}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#03060f] py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 One 4 All - Computer Science CS 67 Game Hub. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <span>สาขาวิทยาการคอมพิวเตอร์ รุ่น 67</span>
            <span>•</span>
            <span>NextAuth .ac.th SSO</span>
            <span>•</span>
            <span>Sandboxed Runtime</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubmitGameModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleGameSubmitted}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
