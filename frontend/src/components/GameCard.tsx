'use client';

import React from 'react';
import Link from 'next/link';
import { GameDocument } from '@/types/game';
import { Play, Eye, ThumbsUp, Star, ExternalLink, ShieldCheck } from 'lucide-react';

interface GameCardProps {
  game: GameDocument;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const isPopup = game.display_mode === 'POPUP';

  return (
    <Link
      href={`/game/${game.id}`}
      className="group relative flex flex-col rounded-2xl bg-[#141724] border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
        <img
          src={game.thumbnail_url}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141724] via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Display Mode Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          {isPopup ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-[10px] font-bold text-white shadow-md border border-amber-400/40">
              <ExternalLink className="w-3 h-3" />
              External Tab
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-[10px] font-bold text-white shadow-md border border-emerald-400/40">
              <ShieldCheck className="w-3 h-3" />
              Framed Sandbox
            </span>
          )}
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-indigo-950/40 backdrop-blur-[2px]">
          <div className="w-13 h-13 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Rating pill */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-bold text-yellow-400 border border-yellow-500/30">
          <Star className="w-3 h-3 fill-yellow-400" />
          <span>{game.metrics.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base text-white group-hover:text-indigo-400 line-clamp-1 transition-colors">
          {game.title}
        </h3>
        
        <p className="text-xs text-gray-400 line-clamp-2 mt-1 flex-1 leading-relaxed">
          {game.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {game.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-[#1e2338] text-[10px] font-semibold text-gray-300 border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] font-medium text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              {game.metrics.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <ThumbsUp className="w-3.5 h-3.5 text-pink-400" />
              {game.metrics.likes.toLocaleString()}
            </span>
          </div>

          <span className="text-[10px] text-gray-500 uppercase tracking-wide">
            {game.creator_id.replace('_', ' ')}
          </span>
        </div>
      </div>
    </Link>
  );
};
