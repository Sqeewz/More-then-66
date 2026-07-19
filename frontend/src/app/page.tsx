'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { SubmitGameModal } from '@/components/SubmitGameModal';
import { AdminLoginModal, ADMIN_PASS_KEY } from '@/components/AdminLoginModal';
import { deleteGameApi, getGames } from '@/lib/api';
import { GameDocument } from '@/types/game';
import { Gamepad2, Flame, ShieldCheck, RefreshCw, GraduationCap, Laptop, Code } from 'lucide-react';

export default function HomePage() {
  const [games, setGames] = useState<GameDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Admin Mode State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

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
    const storedAuth = sessionStorage.getItem('cs67_admin_auth');
    if (storedAuth === ADMIN_PASS_KEY) {
      setIsAdmin(true);
      setAdminPass(storedAuth);
    }
  }, [activeTag, searchQuery]);

  const handleAdminSuccess = (pass: string) => {
    setIsAdmin(true);
    setAdminPass(pass);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('cs67_admin_auth');
    setIsAdmin(false);
    setAdminPass('');
  };

  const handleDeleteGame = async (id: string, title: string) => {
    if (!isAdmin || !adminPass) return;
    const confirmDelete = confirm(`คุณต้องการลบผลงานเกม "${title}" ออกจากระบบ More Then 66 หรือไม่?`);
    if (!confirmDelete) return;

    try {
      await deleteGameApi(id, adminPass);
      alert(`ลบผลงานเกม "${title}" เรียบร้อยแล้ว`);
      fetchGames();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถลบเกมได้';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050814] text-white">
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner Section */}
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-gradient-to-br from-[#0c1633] via-[#111f47] to-[#080d21] border border-sky-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <GraduationCap className="w-4 h-4 text-sky-300" />
              COMPUTER SCIENCE CS 67 GAME HUB
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              More Then <span className="gradient-text-blue">66</span>
              <span className="block text-xl md:text-2xl text-slate-200 mt-2 font-extrabold">
                ศูนย์รวมและคลังแสดงผลงานสร้างสรรค์ ของชาว CS 67
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
              ยินดีต้อนรับสู่ <strong className="text-sky-300">More Then 66</strong> แพลตฟอร์มคลังรวมผลงานโปรเจกต์เว็บเกมและนวัตกรรมดิจิทัล ของนิสิต/นักศึกษา สาขาวิทยาการคอมพิวเตอร์ รุ่น 67 (Computer Science CS 67) รวบรวมและจัดแสดงผลงานพัฒนาเกมทั้งประเภท WebGL, HTML5, และ 3D จาก itch.io และเว็บบอร์ดผลงาน เพื่อส่งเสริมศักยภาพด้านซอฟต์แวร์และการพัฒนาเกมของชาว CS67 ทุกคน!
            </p>

            {/* Feature badging */}
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#091129] border border-sky-500/30 shadow-md">
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>ผลงานนิสิต วิทยาการคอมพิวเตอร์ CS 67</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#091129] border border-sky-500/30 shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>เล่นเกมในระบบ Sandboxed Frame 16:9</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#091129] border border-sky-500/30 shadow-md">
                <Code className="w-4 h-4 text-blue-400" />
                <span>รองรับ WebGL, Canvas & HTML5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-sky-400 fill-sky-400" />
            <h2 className="font-extrabold text-xl text-white tracking-tight">
              {activeTag ? `หมวดหมู่: ${activeTag.toUpperCase()}` : '🎮 ผลงานเกม CS 67 & Trending Games'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0e152e] text-sky-300 font-semibold border border-sky-500/30">
              {games.length} {games.length === 1 ? 'เกม' : 'เกม'}
            </span>
          </div>

          <button
            onClick={fetchGames}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e152e] hover:bg-[#162248] text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* Game Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[16/12] rounded-2xl bg-[#0e152e] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0e152e] border border-sky-500/20 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-white">ไม่พบผลงานเกมที่ค้นหา</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              ยังไม่มีเกมในหมวดหมู่นี้ ร่วมเป็นคนแรกที่ส่งผลงานเกมเข้าสู่ระบบ More Then 66!
            </p>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
            >
              ส่งผลงานเกม CS 67
            </button>
          </div>
        ) : (
          <div className="game-grid">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isAdmin={isAdmin}
                onDeleteGame={handleDeleteGame}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#03060f] py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 More Then 66 - Computer Science CS 67 Game Hub. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <span>สาขาวิทยาการคอมพิวเตอร์ รุ่น 67</span>
            <span>•</span>
            <span>Next.js App Router</span>
            <span>•</span>
            <span>Sandboxed Runtime</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubmitGameModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={fetchGames}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
