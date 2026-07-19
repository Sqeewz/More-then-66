'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GameDocument } from '@/types/game';
import {
  ShieldCheck,
  Maximize2,
  RotateCw,
  ExternalLink,
  Lock,
  Play,
  MonitorPlay,
} from 'lucide-react';

interface EmbedPlayerProps {
  game: GameDocument;
}

export function extractEmbedUrl(game: GameDocument): string {
  // 1. If embed_code contains <iframe src="...">, extract the src URL
  if (game.embed_code) {
    const srcMatch = game.embed_code.match(/src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) {
      return srcMatch[1];
    }
    if (game.embed_code.startsWith('http://') || game.embed_code.startsWith('https://')) {
      return game.embed_code;
    }
  }

  // 2. Original URL fallback
  const orig = game.original_url || (game as any).url || '';
  return orig;
}

export const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ game }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [forceEmbedded, setForceEmbedded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const targetUrl = extractEmbedUrl(game);
  const externalLinkUrl = game.original_url || (game as any).url || targetUrl;
  const isPopupMode = game.display_mode === 'POPUP' && !forceEmbedded;

  // Auto hide loading spinner after 2s timeout
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [iframeKey, forceEmbedded, game, targetUrl]);

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
    if (externalLinkUrl) {
      window.open(externalLinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0e152e] border border-sky-500/30 text-xs shadow-lg">
        <div className="flex items-center gap-2">
          {isPopupMode ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              โหมดลิงก์ภายนอก (Pop-out Mode)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              เล่นในเว็บ (In-Website Sandboxed Player)
            </span>
          )}
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline font-mono text-[11px] truncate max-w-xs">
            {targetUrl}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPopupMode && (
            <button
              onClick={() => {
                setForceEmbedded(true);
                setIsLoading(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-md shadow-blue-600/30 transition-all border border-sky-300/30"
              title="สลับเป็นโหมดเล่นในเว็บ"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>บังคับเล่นในเว็บ</span>
            </button>
          )}

          {!isPopupMode && (
            <>
              <button
                onClick={handleReload}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#162248] hover:bg-[#1f3066] text-slate-200 hover:text-white transition-colors border border-white/10"
                title="Reload Game Frame"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>รีโหลดเฟรม</span>
              </button>

              <button
                onClick={handleToggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 transition-all border border-sky-300/30"
                title="Fullscreen Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>เต็มจอ (Fullscreen)</span>
              </button>
            </>
          )}

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#162248] hover:bg-[#1f3066] text-sky-300 hover:text-white transition-colors border border-sky-500/30 font-semibold"
            title="Open Game in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>เปิดลิงก์ต้นทาง</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-black border border-sky-500/30 shadow-2xl glow-box"
      >
        {isPopupMode ? (
          /* POPUP MODE UI fallback */
          <div className="aspect-video w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0a1026] via-[#101b3e] to-[#060a19] text-white">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold tracking-tight">
              ตรวจพบการตั้งค่าป้องกันการฝังเฟรมจากเว็บต้นทาง
            </h3>
            <p className="text-sm text-slate-300 max-w-lg mt-2 leading-relaxed">
              คุณสามารถกดเลือก <strong className="text-sky-300">"เล่นในหน้าเว็บนี้"</strong> เพื่อบังคับเปิดเล่นผ่าน Sandboxed Frame หรือเปิดเล่นในแท็บใหม่ได้ตามต้องการ:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setForceEmbedded(true);
                  setIsLoading(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
              >
                <MonitorPlay className="w-5 h-5" />
                <span>เล่นในหน้าเว็บนี้ (Play In-Website)</span>
              </button>

              <button
                onClick={handleOpenExternal}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#162248] hover:bg-[#1f3066] text-slate-200 hover:text-white font-semibold text-sm border border-white/10"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>เปิดเล่นในแท็บใหม่ (External Tab)</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* EMBEDDED MODE SANDBOXED IFRAME */
          <div className="ratio-16-9">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070b1a]/95 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-sky-200">กำลังโหลด Sandboxed Game Frame CS67...</p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={targetUrl}
              title={game.title}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-modals"
              allow="autoplay; gamepad; fullscreen; keyboard"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        )}
      </div>

      {/* Security sandbox declaration notice */}
      {!isPopupMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-2">
          <span>
            🛡️ Security Sandbox Policy Active: <code className="text-sky-300">allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock</code>
          </span>
          <span>
            CS67 Feature Policy: <code className="text-sky-300">allow="autoplay; gamepad; fullscreen"</code>
          </span>
        </div>
      )}
    </div>
  );
};
