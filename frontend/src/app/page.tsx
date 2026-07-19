'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { SubmitGameModal } from '@/components/SubmitGameModal';
import { getGames } from '@/lib/api';
import { GameDocument } from '@/types/game';
import { Gamepad2, Flame, Sparkles, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [games, setGames] = useState<GameDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await getGames(activeTag, searchQuery);
      setGames(res.games);
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [activeTag, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d14] text-white">
      {/* Navigation Header */}
      <Header
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">

        {/* Hero Banner Section */}
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-gradient-to-br from-[#161a2e] via-[#1f1938] to-[#120d24] border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Y8-Inspired UGC Game Aggregator
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Play & Frame the Best <span className="gradient-text">Web Games</span> Instantly
            </h1>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Submit external game links from itch.io, Game Jolt, or HTML5 repos. Our platform automatically sanitizes URLs, detects iframe embeddability headers, and frames games securely in a 16:9 sandboxed player.
            </p>

            {/* Feature badging */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-gray-300">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strict Sandbox Isolation</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span>Frame-Busting Fallback</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
                <Gamepad2 className="w-4 h-4 text-indigo-400" />
                <span>16:9 Responsive Player</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-pink-500 fill-pink-500" />
            <h2 className="font-extrabold text-xl text-white tracking-tight">
              {activeTag ? `Category: ${activeTag.toUpperCase()}` : 'Trending Game Catalog'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#181c2e] text-gray-400 font-semibold border border-white/5">
              {games.length} {games.length === 1 ? 'game' : 'games'}
            </span>
          </div>

          <button
            onClick={fetchGames}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1f2438] text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Game Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[16/12] rounded-2xl bg-[#141724] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#141724] border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-white">No games found</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              No games match your current filter or search criteria. Be the first to submit a game link!
            </p>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              Submit Game Link
            </button>
          </div>
        ) : (
          <div className="game-grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#0a0c12] py-6 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 More then 66 gameshub for Cs 67</p>
          <div className="flex items-center gap-4 text-gray-400 font-medium">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>Async Rust Scraper Engine</span>
            <span>•</span>
            <span>NoSQL Schema</span>
          </div>
        </div>
      </footer>

      {/* Submission Modal */}
      <SubmitGameModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={fetchGames}
      />
    </div>
  );
}
