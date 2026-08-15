'use client';

import React from 'react';
import Link from 'next/link';
import { GameDocument } from '@/types/game';
import { Play, Eye, ThumbsUp, Star, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { convertGDriveToDirectImage } from '@/lib/qr-reader';

interface GameCardProps {
  game: GameDocument;
}

const DEFAULT_CARD_COVER = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const isPopup = game.display_mode === 'POPUP';
  const displayImage = (() => {
    const url = game.cover_image_url || game.thumbnail_url;
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return DEFAULT_CARD_COVER;
    return convertGDriveToDirectImage(url);
  })();

  return (
    <Link
      href={`/game/${game.id}`}
      className="group relative flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] overflow-hidden hover:border-sky-400/60 hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
        <img
          src={displayImage}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_CARD_COVER;
          }}
        />

        {/* Dark Navy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e152e] via-black/20 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

        {/* Display Mode Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
          {isPopup ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-slate-300 border border-white/10">
              <ExternalLink className="w-2.5 h-2.5" />
              External Tab
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-slate-300 border border-white/10">
              <ShieldCheck className="w-2.5 h-2.5 text-sky-400" />
              Sandbox
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
        <h3 className="font-bold text-base text-[var(--text-title)] group-hover:text-[#FF7E14] line-clamp-1 transition-colors">
          {game.title}
        </h3>

        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 flex-1 leading-relaxed">
          {game.description}
        </p>

        {/* Tags & Feature Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {(game.tags || []).slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-sky-500/15 text-[10px] font-semibold text-sky-400 border border-sky-500/25"
            >
              #{tag}
            </span>
          ))}
          {(game.qr_image_url || game.original_url) && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 text-[10px] font-bold text-sky-400 border border-sky-500/30">
              📱 QR
            </span>
          )}

          {game.pdf_drive_url && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-[10px] font-bold text-rose-400 border border-rose-500/30">
              📄 PDF
            </span>
          )}
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border-card)] text-[11px] font-medium text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-[var(--text-main)] transition-colors">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              {game.metrics.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 hover:text-[var(--text-main)] transition-colors">
              <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
              {game.metrics.likes.toLocaleString()}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] text-sky-400 font-semibold tracking-wide truncate max-w-[120px]">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{game.creator_name || game.creator_id}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
