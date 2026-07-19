'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { EmbedPlayer } from '@/components/EmbedPlayer';
import { GameCard } from '@/components/GameCard';
import { SubmitGameModal } from '@/components/SubmitGameModal';
import { getGameById, getGames, incrementGameLike, incrementGameView } from '@/lib/api';
import { GameDocument } from '@/types/game';
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  Star,
  Share2,
  ExternalLink,
  Tag,
  Gamepad2,
} from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameDocument | null>(null);
  const [relatedGames, setRelatedGames] = useState<GameDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    if (!gameId) return;

    const loadGameDetails = async () => {
      try {
        setLoading(true);
        const res = await getGameById(gameId);
        setGame(res.game);

        // Increment View Counter
        incrementGameView(gameId).catch(() => {});

        // Fetch Related Games
        const all = await getGames();
        setRelatedGames(all.games.filter((g) => g.id !== gameId).slice(0, 3));
      } catch (err) {
        console.error('Failed to load game details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGameDetails();
  }, [gameId]);

  const handleLike = async () => {
    if (!game || hasLiked) return;
    try {
      setHasLiked(true);
      const res = await incrementGameLike(game.id);
      setGame(res.game);
    } catch (err) {
      console.error('Failed to like game:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game?.title || 'Play Game',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Game link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d14] text-white">
      <Header
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Games</span>
        </Link>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-2/3 bg-[#141724] rounded-lg" />
            <div className="aspect-video w-full bg-[#141724] rounded-2xl" />
          </div>
        ) : !game ? (
          <div className="p-12 text-center rounded-2xl bg-[#141724] space-y-4">
            <Gamepad2 className="w-12 h-12 text-gray-500 mx-auto" />
            <h2 className="text-xl font-bold">Game Not Found</h2>
            <p className="text-sm text-gray-400">The requested game ID does not exist.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Title & Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {game.title}
                </h1>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span>Submitted by <strong className="text-indigo-400">{game.creator_id}</strong></span>
                  <span>•</span>
                  <span>{new Date(game.created_at).toLocaleDateString()}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    hasLiked
                      ? 'bg-pink-600/30 text-pink-300 border border-pink-500/40 cursor-default'
                      : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/20 active:scale-95'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{game.metrics.likes.toLocaleString()} Likes</span>
                </button>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141724] border border-white/10 text-xs font-semibold text-gray-300">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>{game.metrics.views.toLocaleString()} Views</span>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141724] border border-white/10 text-xs font-bold text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{game.metrics.rating.toFixed(1)}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-[#141724] hover:bg-[#1f2438] border border-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Share Game"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Player Component */}
            <EmbedPlayer game={game} />

            {/* Game Description & Metadata Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Description & Tags */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#141724] border border-white/10 space-y-4">
                <h3 className="font-extrabold text-base text-white">About the Game</h3>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {game.description}
                </p>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    Categories & Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-[#1c2138] text-xs font-semibold text-indigo-300 border border-indigo-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Information Specs */}
              <div className="p-6 rounded-2xl bg-[#141724] border border-white/10 space-y-4">
                <h3 className="font-extrabold text-base text-white">Platform Specs</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Display Mode</span>
                    <span className="font-bold text-indigo-400">{game.display_mode}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Aspect Ratio</span>
                    <span className="font-bold text-white">16:9 Standard</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Sandbox Isolation</span>
                    <span className="font-bold text-emerald-400">Enabled</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Original Host</span>
                    <a
                      href={game.original_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Related Games */}
            {relatedGames.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-extrabold text-lg text-white">More Games You Might Like</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedGames.map((rg) => (
                    <GameCard key={rg.id} game={rg} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      <SubmitGameModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
