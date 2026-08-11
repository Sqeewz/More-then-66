'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Header } from '@/components/Header';
import { SubmitGameModal } from '@/components/SubmitGameModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useGames } from '@/hooks/useGames';
import { GameCard } from '@/components/GameCard';
import { deleteGameApi } from '@/lib/api';
import { LOCAL_STORAGE_GAMES_KEY } from '@/lib/constants';
import { GameDocument } from '@/types/game';
import { Gamepad2, Flame, RefreshCw, Sparkles, TrendingUp, Box, Puzzle, Cpu, LogIn, LogOut, ArrowDown } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const { isAdmin, adminPass, handleAdminSuccess, handleAdminLogout } = useAdminAuth();
  const { games, setGames, loading, refetch } = useGames(activeTag, searchQuery);

  const { data: session } = useSession();

  const mainCanvasRef = useRef<HTMLDivElement>(null);
  const charLayerRef = useRef<HTMLDivElement>(null);
  const petalsCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let petalsAnimationFrameId: number;

    let mouseX = 0;
    let mouseY = 0;
    let charX = 0;
    let charY = 0;
    let petalsParamX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);

    function updateParallax() {
      const targetX = mouseX * 18;
      const targetY = mouseY * 12;

      charX += (targetX - charX) * 0.08;
      charY += (targetY - charY) * 0.08;
      petalsParamX += (-mouseX * 10 - petalsParamX) * 0.05;

      if (charLayerRef.current) {
        charLayerRef.current.style.transform = `translate(${charX}px, ${charY}px)`;
      }

      animationFrameId = requestAnimationFrame(updateParallax);
    }
    updateParallax();

    // Petal Particle System
    const canvas = petalsCanvasRef.current;
    if (!canvas || !mainCanvasRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      if (canvas && mainCanvasRef.current) {
        canvas.width = mainCanvasRef.current.clientWidth;
        canvas.height = mainCanvasRef.current.clientHeight;
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Petal {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedY: number = 0;
      speedX: number = 0;
      angle: number = 0;
      spin: number = 0;
      color: string = '';

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : -10;
        this.size = Math.random() * 5 + 3;
        this.speedY = Math.random() * 0.7 + 0.3;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.angle = Math.random() * 360;
        this.spin = Math.random() * 0.8 - 0.4;

        const colors = [
          'rgba(239, 68, 68, 0.25)',
          'rgba(249, 115, 22, 0.20)',
          'rgba(254, 205, 211, 0.25)',
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        if (!canvas) return;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 40) * 0.25 + petalsParamX * 0.02;
        this.angle += this.spin;

        if (this.y > canvas.height + 10) {
          this.reset(false);
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate((this.angle * Math.PI) / 180);
        context.fillStyle = this.color;
        context.beginPath();
        context.ellipse(0, 0, this.size, this.size / 1.8, 0, 0, 2 * Math.PI);
        context.fill();
        context.restore();
      }
    }

    const petalsArray: Petal[] = [];
    const maxPetals = 30;
    for (let i = 0; i < maxPetals; i++) {
      petalsArray.push(new Petal());
    }

    function animatePetals() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < petalsArray.length; i++) {
        petalsArray[i].update();
        petalsArray[i].draw(ctx);
      }
      petalsAnimationFrameId = requestAnimationFrame(animatePetals);
    }
    animatePetals();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(petalsAnimationFrameId);
    };
  }, []);

  const handleDeleteGame = async (id: string, title: string) => {
    const confirmDelete = confirm(`คุณต้องการลบผลงานเกม "${title}" ออกจากระบบ หรือไม่?`);
    if (!confirmDelete) return;

    setGames((prev) => prev.filter((g) => g.id !== id));

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
      if (raw) {
        const localGames: GameDocument[] = JSON.parse(raw);
        localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(localGames.filter((g) => g.id !== id)));
      }
    } catch {}

    try {
      await deleteGameApi(id, adminPass);
      alert(`ลบผลงานเกม "${title}" ออกจากระบบเรียบร้อยแล้ว`);
      refetch();
    } catch (err: unknown) {
      console.warn('[HomePage] API delete warning:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060608] text-white selection:bg-amber-500 selection:text-black">
      {/* Dynamic Style Block for Anime Cyberpunk Aesthetic */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;900&family=Syncopate:wght@700&display=swap');

        .anime-hero-wrapper {
          background: #060608;
          background-image: radial-gradient(circle at center, #2b0404 0%, #060608 100%);
          font-family: 'Noto Sans JP', 'Syncopate', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: calc(100vh - 100px);
          position: relative;
          padding: 0;
        }

        .canvas-container {
          width: 100%;
          min-height: calc(100vh - 100px);
          height: calc(100vh - 100px);
          max-width: none;
          max-height: none;
          display: grid;
          grid-template-columns: 44% 43% 13%;
          background-image: url('https://u.cubeupload.com/zmonochrome/tumblr8b1866a9355004.jpg');
          background-size: cover;
          background-position: center;
          position: relative;
          
          box-shadow: 
              0 30px 100px rgba(0, 0, 0, 0.8),
              inset 0 0 80px rgba(6, 6, 8, 0.9),
              inset 0 0 140px rgba(0, 0, 0, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0;
          overflow: hidden;
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .canvas-container::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle, transparent 40%, rgba(6, 6, 8, 0.85) 100%);
          z-index: 12;
          pointer-events: none;
        }

        .canvas-dot-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: radial-gradient(rgba(255, 255, 255, 0.04) 15%, transparent 16%);
          background-size: 6px 6px;
          z-index: 2;
          pointer-events: none;
        }

        .ui-corner-bracket {
          position: absolute;
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          z-index: 13;
          pointer-events: none;
        }
        .top-left { top: 25px; left: 25px; border-right: none; border-bottom: none; }
        .bottom-right { bottom: 25px; right: 25px; border-left: none; border-top: none; }

        .nihility-bg-text {
          position: absolute;
          width: 200%;
          top: 45%;
          left: 0;
          transform: translateY(-50%);
          font-family: 'Syncopate', sans-serif;
          font-size: 14rem;
          font-weight: 700;
          color: rgba(181, 137, 61, 0.03);
          letter-spacing: 30px;
          white-space: nowrap;
          z-index: 1;
          pointer-events: none;
          user-select: none;
          animation: move-nihility 35s linear infinite;
        }

        #petals-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 11;
          pointer-events: none;
          will-change: transform;
        }

        .left-panel {
          padding: 5% 7%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 5;
          background: linear-gradient(90deg, rgba(6, 6, 8, 0.98) 0%, rgba(70, 3, 3, 0.65) 75%, rgba(0, 0, 0, 0) 100%);
        }

        .hero-quote-header {
          font-size: 0.75rem;
          font-weight: 900;
          color: #cbd5e1;
          letter-spacing: 2px;
          line-height: 1.5;
          text-transform: uppercase;
          border-left: 3px solid #b5893d;
          padding-left: 10px;
        }

        .quote-jp {
          font-size: 0.65rem;
          color: #8492a6;
          display: block;
          margin-top: 4px;
          letter-spacing: 1px;
        }

        .main-title-group {
          position: relative;
          margin-top: 15px;
        }

        .main-kanji {
          font-size: 9.5rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 0.85;
          letter-spacing: -6px;
          display: inline-block;
          text-shadow: 
              1px 1px 0px #b5893d,
              2px 2px 0px #8a6428,
              3px 3px 0px #5e4319,
              5px 5px 25px rgba(0, 0, 0, 0.95);
        }

        .japanese-sub {
          font-size: 0.95rem;
          color: #f1f5f9;
          font-weight: 900;
          letter-spacing: 6px;
          margin-bottom: 8px;
          display: block;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
        }

        .numeric-badge {
          display: inline-block;
          background-color: #ffffff;
          color: #000000;
          padding: 4px 16px;
          font-size: 0.8rem;
          font-weight: bold;
          letter-spacing: 3px;
          margin-top: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          border-radius: 2px;
        }

        .content-text-box {
          background: rgba(10, 10, 14, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 3px solid #b5893d;
          padding: 14px 16px;
          margin-top: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 6px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          color: #cbd5e1;
          font-size: 0.75rem;
          line-height: 1.6;
          max-height: 140px;
          overflow-y: auto;
        }

        .content-text-box::-webkit-scrollbar {
          width: 4px;
        }

        .content-text-box::-webkit-scrollbar-thumb {
          background: #b5893d;
          border-radius: 2px;
        }

        .content-text-box::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .left-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 15px;
        }

        .game-meta {
          font-size: 0.65rem;
          color: #475569;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .tag-pill {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #ffffff;
          padding: 4px 14px;
          font-size: 0.6rem;
          font-weight: bold;
          letter-spacing: 2px;
          border-radius: 2px;
        }

        .center-panel {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 4;
        }

        .art-window {
          width: 92%;
          height: 90%;
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          background: linear-gradient(135deg, rgba(20, 30, 30, 0.05) 0%, rgba(10, 15, 15, 0.3) 100%);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .art-window::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(181, 137, 61, 0.3), rgba(255,255,255,0.4), rgba(181, 137, 61, 0.3), transparent);
          top: 0; z-index: 2;
          animation: laser-scan 4s linear infinite;
        }

        .large-bg-kanji {
          font-size: 16rem;
          color: rgba(255, 255, 255, 0.02);
          position: absolute;
          top: -20px; left: -20px;
          font-weight: 900;
          z-index: 2;
          user-select: none;
        }

        .tech-overlay {
          position: absolute;
          right: 25px; top: 25%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.55rem;
          font-family: monospace;
          z-index: 3;
        }

        .live-pulse-bar {
          width: 40px;
          height: 2px;
          background-color: #b5893d;
          animation: bar-stretch 1.2s infinite ease-in-out;
        }

        .character-root {
          position: absolute;
          width: 140%; height: 115%;
          bottom: 2%; left: -20%;
          z-index: 10;
          pointer-events: none;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); 
          will-change: transform;
        }

        .character-img {
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 60px rgba(220, 38, 38, 0.12)); 
          animation: float-character 6s ease-in-out infinite;
        }

        .right-panel {
          background: transparent;
          padding: 40px 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          color: #ffffff;
          position: relative;
          z-index: 15;
          background: linear-gradient(-90deg, rgba(6, 6, 8, 0.4) 0%, transparent 100%);
        }

        .pill-box {
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 4px 18px;
          font-size: 0.65rem;
          letter-spacing: 2px;
          font-weight: bold;
          background: rgba(255,255,255,0.02);
        }

        .vertical-text-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .v-kanji-title {
          writing-mode: vertical-rl;
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 10px;
          color: #ffffff;
          text-shadow: 0 4px 10px rgba(0,0,0,0.6);
        }

        .v-latin-sub {
          writing-mode: vertical-rl;
          font-size: 0.7rem;
          letter-spacing: 6px;
          color: rgba(255, 255, 255, 0.5);
        }

        .diamond {
          color: #b5893d;
          font-size: 0.7rem;
          animation: pulse-glow 2s infinite ease-in-out;
        }

        .panel-footer-stamp {
          text-align: center;
        }

        .micro-japanese {
          font-size: 0.45rem;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.3);
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          margin-top: 8px;
        }

        @keyframes move-nihility {
          0% { transform: translate(0, -50%); }
          100% { transform: translate(-50%, -50%); } 
        }

        @keyframes float-character {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes laser-scan {
          0% { top: 0%; opacity: 0; }
          5%, 95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        @keyframes bar-stretch {
          0%, 100% { width: 15px; }
          50% { width: 45px; }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @media (max-width: 768px) {
          .canvas-container {
            grid-template-columns: 1fr;
            height: auto;
            max-height: none;
          }
          .character-root {
            width: 100%;
            left: 0;
          }
          .right-panel {
            flex-direction: row;
            padding: 20px;
          }
          .vertical-text-wrap {
            flex-direction: row;
          }
          .v-kanji-title, .v-latin-sub, .micro-japanese {
            writing-mode: horizontal-tb;
            transform: none;
          }
        }
      `}</style>

      {/* Header Bar */}
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

      {/* Main Anime Parallax Hero Showcase */}
      <div className="anime-hero-wrapper">
        <div className="canvas-container" id="main-canvas" ref={mainCanvasRef}>
          <div className="canvas-dot-overlay"></div>
          <div className="ui-corner-bracket top-left"></div>
          <div className="ui-corner-bracket bottom-right"></div>

          <div className="nihility-bg-text">NIHILITY NIHILITY NIHILITY</div>

          {/* Canvas for floating petals */}
          <canvas id="petals-canvas" ref={petalsCanvasRef}></canvas>

          {/* Left Panel */}
          <section className="left-panel">
            <div className="hero-quote-header">
              Fret not! The hero Chixia has arrived!
              <span className="quote-jp">心配ご無用！正義 de 味方、熾霞のお出ましだ！</span>
            </div>

            <div className="main-title-group">
              <span className="japanese-sub">ブレイジング・ブライト</span>
              <h1 className="main-kanji">朝日</h1>
              <br />
              <button
                onClick={() => {
                  document.getElementById('games-showcase')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="numeric-badge hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 border border-black/10 group"
              >
                <span>เข้าสู่หน้าเว็บหลัก</span>
                <ArrowDown className="w-3.5 h-3.5 text-black group-hover:translate-y-0.5 transition-transform" />
              </button>

              <div className="content-text-box">
                ยินดีต้อนรับสู่ One 4 All — Computer Science CS67 Game Hub! ศูนย์รวมผลงานการพัฒนาเว็บเกมและมัลติมีเดียโดยนิสิตวิทยาการคอมพิวเตอร์ รุ่น 67 สามารถเลือกเล่นเกม ค้นหา หรือส่งผลงานเกมของคุณขึ้นสู่แพลตฟอร์มได้ที่นี่!
              </div>
            </div>

            <div className="left-footer">
              <p className="game-meta">OVERDRIVE MODE // FREQUENCY: STABLE</p>
              <div className="tag-pill">BOOM BOOM!</div>
            </div>
          </section>

          {/* Center Panel */}
          <section className="center-panel">
            <div className="art-window">
              <span className="large-bg-kanji">古</span>
              <div className="tech-overlay">
                <span>STATUS: ACTIVE</span>
                <span>GLASS: JINSHI_DARK</span>
                <div className="live-pulse-bar"></div>
              </div>
            </div>
            <div className="character-root" id="character-layer" ref={charLayerRef}>
              <img
                src="/logo.png?v=2"
                alt="One 4 All CS67 Logo"
                className="character-img max-h-[85vh] object-contain drop-shadow-[0_20px_50px_rgba(56,189,248,0.4)] p-4"
              />
            </div>
          </section>

          {/* Right Panel */}
          <aside className="right-panel">
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="pill-box hover:bg-red-500/30 hover:border-red-400 text-red-300 transition-all duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
                title={`Sign Out (${session.user.name || session.user.email})`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="pill-box hover:bg-amber-500/25 hover:border-amber-400 text-amber-300 font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20 backdrop-blur-md hover:scale-105"
                title="เข้าสู่ระบบด้วย Google SSO (.ac.th)"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>LOGIN (.ac.th)</span>
              </button>
            )}

            <div className="vertical-text-wrap">
              <span className="v-kanji-title">朝日</span>
              <span className="v-latin-sub">ASAHI</span>
              <span className="diamond">✦</span>
              <span className="v-latin-sub">CREATIVE</span>
            </div>
            <div className="panel-footer-stamp">
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>—</div>
              <p className="micro-japanese">システム起動完了</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Main Game Showcase Content Area */}
      <main id="games-showcase" className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8 scroll-mt-24">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>คลังผลงานเกม CS67 (Game Showcase)</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#0e152e] text-amber-300 font-semibold border border-amber-500/30">
              {games.length} ผลงาน
            </span>
          </h2>

          <button
            onClick={refetch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e152e] hover:bg-[#162248] text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {games.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0e152e] border border-amber-500/20 text-center space-y-4 shadow-xl">
            <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="font-bold text-lg text-white">ยังไม่มีผลงานเกมในหมวดหมู่นี้</h3>
            <p className="text-xs text-slate-400">ลองค้นหาด้วยคำอื่น หรือกดปุ่ม "ส่งผลงานเกม" ด้านบนเพื่อเพิ่มเกมใหม่ได้เลยครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} isAdmin={isAdmin} onDeleteGame={handleDeleteGame} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#03060f] py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 One 4 All - Computer Science CS 67 Game Hub. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <span>สาขาวิทยาการคอมพิวเตอร์ รุ่น 67</span>
            <span>•</span>
            <span>NextAuth .ac.th SSO</span>
            <span>•</span>
            <span>Sandboxed Runtime</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubmitGameModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={refetch}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
