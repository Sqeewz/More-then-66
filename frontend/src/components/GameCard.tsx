'use client';

import React from 'react';
import Link from 'next/link';
import { GameDocument } from '@/types/game';
import { Play, Eye, ThumbsUp, Star, ExternalLink, ShieldCheck, User } from 'lucide-react';

interface GameCardProps {
  game: GameDocument;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const isPopup = game.display_mode === 'POPUP';

  return (
    <Link
      href={`/game/${game.id}`}
      className="group relative flex flex-col rounded-2xl bg-[#0e152e] border border-sky-500/20 overflow-hidden hover:border-sky-400/60 hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
        <img
          src={game.thumbnail_url}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Dark Navy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e152e] via-black/20 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

        {/* Display Mode Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          {isPopup ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-[10px] font-bold text-white shadow-md border border-amber-300/40">
              <ExternalLink className="w-3 h-3" />
              External Tab
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white shadow-md border border-emerald-300/40">
              <ShieldCheck className="w-3 h-3" />
              Framed Sandbox
            </span>
          )}
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-blue-950/50 backdrop-blur-[2px]">
          <div className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/50 transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/30">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Rating pill */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[11px] font-bold text-yellow-400 border border-yellow-500/30">
          <Star className="w-3 h-3 fill-yellow-400" />
          <span>{game.metrics.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base text-white group-hover:text-sky-300 line-clamp-1 transition-colors">
          {game.title}
        </h3>
        
        <p className="text-xs text-slate-300 line-clamp-2 mt-1 flex-1 leading-relaxed">
          {game.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {game.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-[#162248] text-[10px] font-semibold text-sky-200 border border-sky-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-[11px] font-medium text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              {game.metrics.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
              {game.metrics.likes.toLocaleString()}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] text-sky-300 font-semibold tracking-wide truncate max-w-[120px]">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{game.creator_id}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
