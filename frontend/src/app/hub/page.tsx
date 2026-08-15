'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { SubmitGameModal } from '@/components/SubmitGameModal';
import { GameDocument } from '@/types/game';
import { useGames } from '@/hooks/useGames';
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
  RotateCcw,
} from 'lucide-react';

interface GameRowProps {
  title: string;
  icon: React.ReactNode;
  games: GameDocument[];
}

const NetflixGameRow: React.FC<GameRowProps> = ({ title, icon, games }) => {
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
              <GameCard game={game} />
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

  const { games, loading, refetch } = useGames(activeTag, searchQuery);

  const handleGameSubmitted = () => refetch();

  const handleClearCache = () => {
    if (confirm('คุณต้องการเคลียร์แคชทั้งหมดในเบราว์เซอร์และรีโหลดข้อมูลสดจาก Supabase หรือไม่?')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      window.location.reload();
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

  const cs67Projects = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('cs67')));
  const webglGames = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('webgl') || t.toLowerCase().includes('3d')));
  const puzzleGames = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('puzzle')));
  const arcadeGames = games.filter((g) => (g.tags || []).some((t) => t.toLowerCase().includes('arcade') || t.toLowerCase().includes('action') || t.toLowerCase().includes('html5')));

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--text-main)] selection:bg-sky-500 selection:text-white">
      {/* CS RMUTI Loading Screen */}
      <LoadingScreen minDuration={800} />

      {/* Navigation Header */}
      <Header
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
      />

      {/* Top Banner Navigation back to Landing */}
      <div className="bg-[var(--bg-card)]/80 border-b border-white/5 px-4 lg:px-8 py-2 flex items-center justify-between text-xs">
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

      {/* Netflix Hero Billboard Section */}
      {games.length > 0 && !searchQuery && !activeTag && (
        <div className="relative w-full max-w-5xl mx-auto my-6 aspect-[21/9] md:aspect-[21/8] max-h-[460px] overflow-hidden bg-black border border-white/15 rounded-3xl shadow-2xl group">
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
                {/* Clicking image/banner navigates directly to game page */}
                <Link href={`/game/${g.id}`} className="absolute inset-0 block group/banner cursor-pointer">
                  {/* Background Image inside Box 1 */}
                  <img
                    src={g.cover_image_url || g.thumbnail_url}
                    alt={g.title}
                    className="w-full h-full object-cover object-center filter brightness-90 group-hover/banner:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Top-Left SPOTLIGHT Badge */}
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF7E14] to-[#EB6D12] text-white font-extrabold text-[10px] sm:text-xs shadow-lg shadow-orange-500/30 border border-orange-400/40 backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                      SPOTLIGHT
                    </span>
                  </div>

                  {/* Text Details Box spanning across the bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-2 z-20">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {g.title}
                    </h1>

                    <p className="text-xs md:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow max-w-2xl font-medium text-center">
                      {g.description}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Left Navigation Arrow */}
          {games.length > 1 && (
            <button
              onClick={handlePrevSpotlight}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-black/60 hover:bg-sky-500/50 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl opacity-80 group-hover:opacity-100"
              title="เกมก่อนหน้า"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {games.length > 1 && (
            <button
              onClick={handleNextSpotlight}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-black/60 hover:bg-sky-500/50 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl opacity-80 group-hover:opacity-100"
              title="เกมถัดไป"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Dots Indicator */}
          {games.length > 1 && (
            <div className="absolute bottom-4 right-5 md:right-8 z-30 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
              {games.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setSpotlightIndex(i)}
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    i === (spotlightIndex % games.length)
                      ? 'w-6 h-2 bg-[#FF7E14] shadow-glow'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                  }`}
                  title={g.title}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area: Direct Clean Grid View for All Games */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-extrabold text-xl text-[var(--text-main)] tracking-tight flex items-center gap-2">
              <Flame className="w-5.5 h-5.5 text-[#FF7E14] fill-[#FF7E14]" />
              <span>
                {activeTag
                  ? `หมวดหมู่: ${activeTag.toUpperCase()}`
                  : searchQuery
                  ? `ผลการค้นหา: "${searchQuery}"`
                  : '🔥 คลังผลงานเกมทั้งหมด (All CS 67 Games)'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] text-sky-400 font-bold border border-[var(--border-card)] shadow-sm">
                {games.length} เกม
              </span>
            </h2>

            <button
              onClick={refetch}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-sky-500/10 text-xs font-bold text-[var(--text-main)] border border-[var(--border-card)] transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>

          {games.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-center space-y-4 shadow-xl">
              <Gamepad2 className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-lg text-[var(--text-main)]">ไม่พบผลงานเกมที่ค้นหา</h3>
              <p className="text-xs text-[var(--text-muted)]">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูครับ</p>
            </div>
          ) : (
            <div className="game-grid">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[var(--bg-card)] py-6 px-4 text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 One 4 All - Computer Science CS 67 Game Hub. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-slate-300 font-medium">
            <span>สาขาวิทยาการคอมพิวเตอร์ รุ่น 67</span>
            <span>•</span>
            <span>NextAuth .ac.th SSO</span>
            <span>•</span>
            <span>Sandboxed Runtime</span>
            <button
              onClick={handleClearCache}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 font-semibold text-xs transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ml-2"
              title="ลบแคชทั้งหมดในเครื่อง และโหลดข้อมูลสดใหม่จาก Supabase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>เคลียร์แคช</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Submit Modal */}
      <SubmitGameModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleGameSubmitted}
      />
    </div>
  );
}
