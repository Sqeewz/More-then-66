'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { EmbedPlayer } from '@/components/EmbedPlayer';
import { SubmitGameModal } from '@/components/SubmitGameModal';
import { EditGameModal } from '@/components/EditGameModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { deleteGameApi, getGameById, getGames, incrementGameLike, incrementGameView } from '@/lib/api';
import { GameDocument } from '@/types/game';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LOCAL_STORAGE_GAMES_KEY, ADMIN_SESSION_KEY } from '@/lib/constants';
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  Star,
  Share2,
  ExternalLink,
  Tag,
  Gamepad2,
  GraduationCap,
  Trash2,
  Edit,
  FileText,
  Play,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { data: session } = useSession();

  const [game, setGame] = useState<GameDocument | null>(null);
  const [relatedGames, setRelatedGames] = useState<GameDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');

  // ── Admin Auth (Single Responsibility — handled by useAdminAuth hook) ─────
  const { isAdmin, adminPass, handleAdminSuccess, handleAdminLogout } = useAdminAuth();

  useEffect(() => {
    if (!gameId) return;

    const loadGameDetails = async () => {
      try {
        setLoading(true);

        const likedInStorage = localStorage.getItem(`liked_${gameId}`);
        if (likedInStorage === 'true') {
          setHasLiked(true);
        }

        let foundGame: GameDocument | null = null;
        const updatedView = await incrementGameView(gameId).catch(() => null);
        if (updatedView && updatedView.game) {
          foundGame = updatedView.game;
        } else {
          const res = await getGameById(gameId).catch(() => null);
          if (res && res.game) {
            foundGame = res.game;
          }
        }

        // Fallback to LocalStorage if game not found in memory/cloud
        if (!foundGame) {
          try {
            const storedLocal = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
            if (storedLocal) {
              const localGames: GameDocument[] = JSON.parse(storedLocal);
              foundGame = localGames.find((g) => g.id === gameId) || null;
            }
          } catch (e) {}
        }

        setGame(foundGame);

        const all = await getGames().catch(() => ({ count: 0, games: [] }));
        if (all && Array.isArray(all.games)) {
          setRelatedGames(all.games.filter((g) => g.id !== gameId).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load game details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGameDetails();
  }, [gameId]);

  const isOwner =
    !!session?.user?.email &&
    !!game?.creator_email &&
    session.user.email.toLowerCase() === game.creator_email.toLowerCase();

  const isUserAdmin = isAdmin || session?.user?.isAdmin;
  const canEditOrDelete = isOwner || isUserAdmin;

  const handleDeleteGame = async (id: string, title: string) => {
    const confirmDelete = confirm(`คุณต้องการลบผลงานเกม "${title}" ออกจากระบบ One 4 All หรือไม่?`);

    if (!confirmDelete) return;

    try {
      const passToSend = adminPass || sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
      await deleteGameApi(id, passToSend).catch(() => null);

      try {
        const storedLocal = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
        if (storedLocal) {
          const localGames: GameDocument[] = JSON.parse(storedLocal);
          const updatedLocal = localGames.filter((g) => g.id !== id);
          localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(updatedLocal));
        }
      } catch (e) {}

      alert(`ลบผลงานเกม "${title}" เรียบร้อยแล้ว`);
      router.push('/hub');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถลบเกมได้';
      alert(msg);
    }
  };

  const handleLike = async () => {
    if (!game || hasLiked) return;
    setHasLiked(true);
    localStorage.setItem(`liked_${game.id}`, 'true');

    setGame((prev) =>
      prev
        ? {
            ...prev,
            metrics: {
              ...prev.metrics,
              likes: (prev.metrics?.likes || 0) + 1,
            },
          }
        : null
    );

    try {
      const storedLocal = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
      if (storedLocal) {
        const localGames: GameDocument[] = JSON.parse(storedLocal);
        const updatedLocal = localGames.map((g) =>
          g.id === game.id
            ? { ...g, metrics: { ...g.metrics, likes: g.metrics.likes + 1 } }
            : g
        );
        localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(updatedLocal));
      }
    } catch (e) {}

    await incrementGameLike(game.id).catch(() => null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game?.title || 'Play Game',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('คัดลอกลิงก์ผลงานเกมเรียบร้อยแล้ว!');
    }
  };

  const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

  const viewsCount = game?.metrics?.views ?? 0;
  const likesCount = game?.metrics?.likes ?? 0;
  const ratingVal = game?.metrics?.rating ?? 5.0;
  const targetUrl = game?.original_url || (game as any)?.url || '';

  const displayCoverImage = (() => {
    const url = game?.cover_image_url || game?.thumbnail_url;
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return DEFAULT_COVER_IMAGE;
    return url;
  })();

  const qrDisplayUrl = (() => {
    // 1. If stored qr_image_url is a real HTTP(S) URL (Vercel Blob / Custom), use it!
    if (game?.qr_image_url && (game.qr_image_url.startsWith('http://') || game.qr_image_url.startsWith('https://'))) {
      return game.qr_image_url;
    }
    // 2. Otherwise auto-generate from targetUrl using qrserver.com
    if (targetUrl) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(targetUrl)}`;
    }
    return '';
  })();


  return (
    <div className="min-h-screen flex flex-col bg-[#050814] text-white">
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Back Link */}
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่คลังผลงาน CS 67 (Back to Showcase)</span>
        </Link>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-2/3 bg-[#0e152e] rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 aspect-video bg-[#0e152e] rounded-2xl" />
              <div className="aspect-square bg-[#0e152e] rounded-2xl" />
            </div>
          </div>
        ) : !game ? (
          <div className="p-12 text-center rounded-2xl bg-[#0e152e] space-y-4 border border-sky-500/20">
            <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto" />
            <h2 className="text-xl font-bold">ไม่พบผลงานเกมที่ระบุ</h2>
            <p className="text-sm text-slate-400">
              ไม่พบ ID ผลงานเกมนี้ในระบบ More Then 66 หรือเกมถูกลบออกไปแล้ว
            </p>
            <Link
              href="/hub"
              className="inline-block px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold text-white shadow-lg"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header: ชื่อเกมตัวใหญ่ + Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  CS 67 GAME HUB SHOWCASE
                </div>
                
                {/* ชื่อเกมตัวใหญ่ */}
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight gradient-text-blue">
                  {game.title}
                </h1>

                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="font-semibold text-sky-300">
                    สร้างสรรค์โดย {game.creator_name || game.creator_id || 'นิสิต CS 67'}
                  </span>
                  <span>•</span>
                  <span>{new Date(game.created_at || Date.now()).toLocaleDateString('th-TH')}</span>
                </p>
              </div>

              {/* Action & Stats Buttons (Minimal Transparent Style) */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {canEditOrDelete && (
                  <>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-transparent hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all font-medium"
                      title="แก้ไขเกมนี้"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id, game.title)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/30 transition-all font-medium"
                      title="ลบเกมนี้ออกจากระบบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </>
                )}

                <button
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                    hasLiked
                      ? 'bg-transparent text-sky-400 border border-sky-400/30 cursor-default'
                      : 'bg-transparent hover:bg-sky-500/10 text-slate-300 hover:text-white border border-white/15'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current text-sky-400' : ''}`} />
                  <span>{hasLiked ? `ชื่นชอบแล้ว (${likesCount})` : `ชื่นชอบ (${likesCount})`}</span>
                </button>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-transparent border border-white/10 text-slate-300 font-medium">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>{viewsCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-transparent border border-white/10 text-yellow-400 font-medium">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{ratingVal.toFixed(1)}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
                  title="แชร์ผลงานเกม"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Main Content Layout: Left (Main Content) vs Right (Sidebar QR Code) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: รูปปก -> รายละเอียด -> คู่มือ */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. รูปปก (Cover Image) */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-sky-400" />
                    รูปภาพปกผลงาน (Cover Preview)
                  </h2>
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-sky-500/30 shadow-2xl bg-black group">
                    <img
                      src={displayCoverImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e152e]/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* 2. รายละเอียดเกม (Game Description & Tags) */}
                <div className="p-6 rounded-2xl bg-[#0e152e] border border-sky-500/20 space-y-4 shadow-xl">
                  <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                    รายละเอียดผลงานเกม
                  </h2>
                  
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {game.description || 'ยังไม่มีคำอธิบายสำหรับเกมนี้'}
                  </p>

                  {(game.tags || []).length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-sky-400" />
                        หมวดหมู่ & แท็ก
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {game.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-[#162248] text-xs font-semibold text-sky-300 border border-sky-500/30"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. คู่มือเกม (PDF / Documentation) */}
                <div className="p-6 rounded-2xl bg-[#0e152e] border border-sky-500/20 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-rose-400" />
                      คู่มือข้อมูลเกม (Game Manual / Documentation)
                    </h2>
                    {game.pdf_drive_url && (
                      <a
                        href={game.pdf_drive_url.replace('/preview', '/view')}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#162248] hover:bg-[#1f3066] text-sky-300 text-xs font-semibold border border-sky-500/30 transition-colors"
                      >
                        <span>เปิดใน Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {game.pdf_drive_url ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 font-medium">
                        {game.pdf_title || 'เอกสารคู่มือข้อมูลเกม (PDF Reader)'}
                      </p>
                      <div className="w-full ratio-16-9 rounded-xl overflow-hidden border border-sky-500/30 shadow-inner bg-black min-h-[500px]">
                        <iframe
                          src={game.pdf_drive_url}
                          className="w-full h-full"
                          title={game.pdf_title || 'Game Document PDF'}
                          allow="autoplay"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-[#111a36] border border-white/5 text-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400">ผู้พัฒนาไม่ได้แนบ PDF คู่มือสำหรับเกมนี้</p>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN (SIDEBAR): QR Code สแกนเข้าเล่นเกม */}
              <div className="space-y-6">
                
                {/* QR Code Card */}
                <div className="sticky top-24 p-6 rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-full text-left space-y-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-sky-300 uppercase tracking-wider">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      สแกนเพื่อเข้าเล่นเกม
                    </span>
                    <h3 className="font-black text-lg text-white">QR Code เล่นเกมสด</h3>
                  </div>

                  {/* QR Image Frame */}
                  <div className="p-4 rounded-2xl bg-white shadow-2xl shadow-sky-500/20 border-4 border-sky-400/40 transition-transform hover:scale-105">
                    <img
                      src={qrDisplayUrl}
                      alt="Scan to Play QR Code"
                      className="w-60 h-60 object-contain"
                      onError={(e) => {
                        if (targetUrl) {
                          (e.target as HTMLImageElement).src = `https://quickchart.io/qr?text=${encodeURIComponent(targetUrl)}&size=350`;
                        }
                      }}
                    />
                  </div>

                  {/* Sleek Circular Play Symbol Button below QR Code */}
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 border border-white/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer my-1"
                    title="กดเพื่อเล่นเกม (Play Game)"
                  >
                    <Play className="w-6 h-6 fill-current ml-1 text-white" />
                  </a>


                  <div className="space-y-3 w-full">
                    <p className="text-xs text-slate-300 leading-relaxed px-2">
                      ใช้กล้องโทรศัพท์มือถือ หรือแอป QR Reader สแกนรูปภาพนี้เพื่อเปิดเล่นเกมผ่านสมาร์ทโฟนได้ทันที
                    </p>

                    {targetUrl && (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#162248] hover:bg-[#1f3066] text-sky-300 hover:text-white text-xs font-semibold border border-sky-500/30 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เปิดเล่นในแท็บใหม่ (External Tab)</span>
                      </a>
                    )}
                  </div>


                  {/* Technical Specs box */}
                  <div className="w-full pt-4 border-t border-white/10 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ผู้พัฒนา</span>
                      <span className="font-bold text-sky-300 truncate max-w-[150px]">
                        {game.creator_name || game.creator_id || 'นิสิต CS 67'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">โครงการ</span>
                      <span className="font-bold text-white">วิทยาการคอมพิวเตอร์ CS67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">โหมดการเล่น</span>
                      <span className="font-bold text-emerald-400">Direct Web Play</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Related Games */}
            {relatedGames.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-white/10">
                <h3 className="font-extrabold text-lg text-white">
                  ผลงานเกมอื่นๆ ของ CS 67 ที่น่าสนใจ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedGames.map((rg) => (
                    <GameCard
                      key={rg.id}
                      game={rg}
                      isAdmin={isAdmin}
                      onDeleteGame={handleDeleteGame}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Play Game Modal */}
      {isPlayModalOpen && game && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl rounded-3xl bg-[#0e152e] border border-sky-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-[#111a36]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-white">{game.title}</h2>
                  <p className="text-[11px] text-slate-300">In-Website Sandboxed Player (16:9 Frame)</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlayModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto">
              <EmbedPlayer game={game} />
            </div>
          </div>
        </div>
      )}

      <SubmitGameModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {}}
      />


      {game && (
        <EditGameModal
          game={game}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updated) => setGame(updated)}
        />
      )}

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
