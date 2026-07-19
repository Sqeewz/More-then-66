'use client';

import React, { useState, useRef } from 'react';
import { GameDocument } from '@/types/game';
import {
  ShieldCheck,
  Maximize2,
  RotateCw,
  ExternalLink,
  AlertTriangle,
  Lock,
  Play,
} from 'lucide-react';

interface EmbedPlayerProps {
  game: GameDocument;
}

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ game }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPopupMode = game.display_mode === 'POPUP';

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen failed:', err);
      });
    }
  };

  const handleOpenExternal = () => {
    window.open(game.original_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#141724] border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          {isPopupMode ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              Frame Restricted (External Pop-out Mode)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sandboxed Frame (Secure)
            </span>
          )}
          <span className="text-gray-400 hidden sm:inline">•</span>
          <span className="text-gray-400 hidden sm:inline font-mono text-[11px] truncate max-w-xs">
            {game.original_url}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isPopupMode && (
            <>
              <button
                onClick={handleReload}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e2338] hover:bg-[#2a304d] text-gray-300 hover:text-white transition-colors"
                title="Reload Game Frame"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>

              <button
                onClick={handleToggleFullscreen}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all"
                title="Fullscreen Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </button>
            </>
          )}

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e2338] hover:bg-[#2a304d] text-gray-300 hover:text-white transition-colors"
            title="Open Game in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Original Link</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl glow-box"
      >
        {isPopupMode ? (
          /* POPUP MODE UI fallback */
          <div className="aspect-video w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121526] via-[#1a1e36] to-[#0d0f1b] text-white">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold tracking-tight">
              Direct In-Frame Embedding Disabled by Host
            </h3>
            <p className="text-sm text-gray-300 max-w-lg mt-2 leading-relaxed">
              This host site enforces strict <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300">X-Frame-Options</code> or <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300">CSP frame-ancestors</code> policies preventing inside-iframe playback. Launch game in a dedicated external window:
            </p>

            <button
              onClick={handleOpenExternal}
              className="mt-6 flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch External Game Tab</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : (
          /* EMBEDDED MODE SANDBOXED IFRAME */
          <div className="ratio-16-9">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0f1a]/90 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-gray-300">Loading Sandboxed Game Frame...</p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={game.original_url}
              title={game.title}
              sandbox="allow-scripts allow-same-origin allow-popups"
              allow="autoplay; gamepad"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}
      </div>

      {/* Security sandbox declaration notice */}
      {!isPopupMode && (
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-2">
          <span>
            🛡️ Security Sandbox Policy Active: <code className="text-indigo-300">allow-scripts allow-same-origin allow-popups</code>
          </span>
          <span>
            Feature Policy: <code className="text-indigo-300">allow="autoplay; gamepad"</code>
          </span>
        </div>
      )}
    </div>
  );
};
