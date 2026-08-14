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
import { LoadingScreen } from '@/components/LoadingScreen';
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
  ArrowLeft,
  Shuffle,
} from 'lucide-react';

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
      <div className="flex items-center justify-between px-1">
        <h2 className="font-extrabold text-lg md:text-xl text-white tracking-tight flex items-center gap-2">
          {icon}
          <span>{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#111a36] text-sky-300 font-semibold border border-sky-500/20">
            {games.length}
          </span>
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-[#050814] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hover:scale-110 text-white"
          title="เลื่อนซ้าย"
        >
          <div className="w-9 h-9 rounded-full bg-[#0e152e]/90 border border-sky-400/30 flex items-center justify-center shadow-lg hover:bg-blue-600">
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
        </button>

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

export default function GameHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const { isAdmin, adminPass, handleAdminSuccess, handleAdminLogout } = useAdminAuth();
  const { games, setGames, loading, refetch } = useGames(activeTag, searchQuery);

  const handleGameSubmitted = () => refetch();

  const handleDeleteGame = async (id: string, title: string) => {
    const confirmDelete = confirm(`คุณต้องการลบผลงานเกม "${title}" ออกจากระบบ More Then 66 หรือไม่?`);
    if (!confirmDelete) return;

    setGames((prev) => prev.filter((g) => g.id !== id));

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
      if (raw) {
        const localGames: GameDocument[] = JSON.parse(raw);
        localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(localGames.filter((g) => g.id !== id)));
      }
    } catch {}

    try {
      await deleteGameApi(id, adminPass);
      alert(`ลบผลงานเกม "${title}" ออกจากระบบเรียบร้อยแล้ว`);
      refetch();
    } catch (err: unknown) {
      console.warn('[HubPage] API delete warning:', err);
    }
  };

  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // Auto-slide carousel timer for Featured Spotlight Banner (every 7 seconds)
  React.useEffect(() => {
    if (games.length <= 1) return;
    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % games.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [games.length]);

  const handleNextSpotlight = () => {
    if (games.length === 0) return;
    setSpotlightIndex((prev) => (prev + 1) % games.length);
  };

  const handlePrevSpotlight = () => {
    if (games.length === 0) return;
    setSpotlightIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  const handleRandomSpotlight = () => {
    if (games.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * games.length);
    while (nextIdx === (spotlightIndex % games.length)) {
      nextIdx = Math.floor(Math.random() * games.length);
    }
    setSpotlightIndex(nextIdx);
  };

  const featuredGame = games.length > 0 ? games[spotlightIndex % games.length] : null;
  const cs67Projects = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('cs67')));
  const webglGames = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('webgl') || t.toLowerCase().includes('3d')));
  const puzzleGames = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('puzzle')));
  const arcadeGames = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('arcade') || t.toLowerCase().includes('action') || t.toLowerCase().includes('html5')));

  return (
    <div className="min-h-screen flex flex-col bg-[#050814] text-white selection:bg-sky-500 selection:text-white">
      {/* CS RMUTI Loading Screen */}
      <LoadingScreen minDuration={800} />

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

      {/* Top Banner Navigation back to Landing */}
      <div className="bg-[#0e152e]/80 border-b border-white/5 px-4 lg:px-8 py-2 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sky-400 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับสู่หน้าต้อนรับ (Landing Showcase)</span>
        </Link>
        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
          ONE 4 ALL CS67 — GAME HUB SYSTEM ACTIVE
        </span>
      </div>

      {/* Netflix Hero Billboard Section with True Hardware-Accelerated Cross-fade Slideshow */}
      {games.length > 0 && !searchQuery && !activeTag && (
        <div className="relative w-full aspect-[21/9] md:aspect-[21/8] max-h-[520px] overflow-hidden bg-black border-b border-sky-500/20 group">
          {/* Stacked Cross-fading Slides (Background Image + Details) */}
          {games.map((g, idx) => {
            const isActive = idx === (spotlightIndex % games.length);
            return (
              <div
                key={g.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive
                    ? 'opacity-100 pointer-events-auto z-10'
                    : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                {/* Background Image */}
                <img
                  src={g.cover_image_url || g.thumbnail_url}
                  alt={g.title}
                  className="w-full h-full object-cover object-center filter brightness-90 transform scale-105"
                />

                {/* Text & Action Details Card (Compact Glassmorphic Dark Box) */}
                <div className="absolute bottom-4 md:bottom-8 left-4 md:left-10 right-4 max-w-xl p-3.5 md:p-4 rounded-xl bg-black/55 backdrop-blur-md border border-white/10 shadow-xl space-y-2 z-20">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white font-bold text-[10px] sm:text-xs shadow-md border border-sky-300/30">
                      <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                      SPOTLIGHT
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-semibold text-[10px] sm:text-[11px] border border-sky-400/20">
                      <GraduationCap className="w-3 h-3" />
                      CS 67
                    </span>
                  </div>

                  <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                    {g.title}
                  </h1>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed drop-shadow-sm max-w-lg font-normal">
                    {g.description}
                  </p>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <Link
                      href={`/game/${g.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                      <span>เล่นเกมเลย</span>
                    </Link>

                    <Link
                      href={`/game/${g.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-medium text-[11px] sm:text-xs backdrop-blur-sm border border-white/15 transition-all"
                    >
                      <Info className="w-3 h-3 text-slate-300" />
                      <span>รายละเอียด</span>
                    </Link>

                    {games.length > 1 && (
                      <button
                        onClick={handleRandomSpotlight}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/70 text-indigo-200 hover:text-white font-medium text-[11px] sm:text-xs border border-indigo-400/30 backdrop-blur-sm transition-all cursor-pointer shadow-sm"
                        title="สุ่มสลับเกมไฮไลท์"
                      >
                        <Shuffle className="w-3 h-3 text-indigo-300" />
                        <span>🔀 สุ่มเกมอื่น</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Gradients Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-[#050814]/60 to-transparent pointer-events-none z-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050814] via-[#050814]/70 to-transparent w-2/3 pointer-events-none z-15" />

          {/* Left Navigation Arrow */}
          {games.length > 1 && (
            <button
              onClick={handlePrevSpotlight}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-black/50 hover:bg-sky-500/40 text-white/80 hover:text-sky-300 border border-white/15 hover:border-sky-400/60 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl opacity-80 group-hover:opacity-100"
              title="เกมก่อนหน้า (Previous Spotlight)"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {games.length > 1 && (
            <button
              onClick={handleNextSpotlight}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-black/50 hover:bg-sky-500/40 text-white/80 hover:text-sky-300 border border-white/15 hover:border-sky-400/60 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl opacity-80 group-hover:opacity-100"
              title="เกมถัดไป (Next Spotlight)"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Dots Indicator */}
          {games.length > 1 && (
            <div className="absolute bottom-4 right-6 md:right-12 z-30 flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              {games.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setSpotlightIndex(i)}
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    i === (spotlightIndex % games.length)
                      ? 'w-6 h-2 bg-sky-400 shadow-glow'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                  }`}
                  title={g.title}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">
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
