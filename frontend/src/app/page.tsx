'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, ArrowRight, Palette, Check } from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useTheme, THEME_OPTIONS } from '@/context/ThemeContext';

export default function LandingPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const [isRmutiLogo, setIsRmutiLogo] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  const mainCanvasRef = useRef<HTMLDivElement>(null);
  const charLayerRef = useRef<HTMLDivElement>(null);
  const petalsCanvasRef = useRef<HTMLCanvasElement>(null);

  const logoSrc = theme === 'graph-paper' ? '/logo2.png' : '/logo.png?v=2';
  const activeLogo = isRmutiLogo ? '/rmuti.png' : logoSrc;
  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      const swapTimer = setTimeout(() => {
        setIsRmutiLogo((prev) => !prev);
      }, 180);
      const endGlitchTimer = setTimeout(() => {
        setIsGlitching(false);
      }, 450);

      return () => {
        clearTimeout(swapTimer);
        clearTimeout(endGlitchTimer);
      };
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    // Petal Particle System (Colors Adapt to Theme)
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

        let colors: string[] = [];
        if (theme === 'blueprint') {
          colors = [
            'rgba(255, 126, 20, 0.65)',
            'rgba(255, 160, 72, 0.55)',
            'rgba(255, 208, 0, 0.5)',
            'rgba(56, 189, 248, 0.45)',
          ];
        } else if (theme === 'graph-paper') {
          colors = [
            'rgba(15, 23, 42, 0.55)',
            'rgba(2, 132, 199, 0.5)',
            'rgba(224, 103, 0, 0.55)',
            'rgba(71, 85, 105, 0.4)',
          ];
        } else {
          colors = [
            'rgba(56, 189, 248, 0.45)',
            'rgba(37, 99, 235, 0.35)',
            'rgba(255, 126, 20, 0.45)',
            'rgba(255, 255, 255, 0.5)',
          ];
        }

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
    const maxPetals = 35;
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
  }, [theme]);

  return (
    <div className="w-full min-h-screen bg-transparent text-[var(--text-main)] selection:bg-[#FF7E14] selection:text-white transition-colors duration-300">
      {/* Dynamic Style Block for Dedicated Fullscreen Anime Landing */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;900&family=Syncopate:wght@700&display=swap');

        .anime-landing-wrapper {
          background: transparent;
          font-family: 'Noto Sans JP', 'Syncopate', sans-serif;
          width: 100vw;
          height: auto;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow-y: auto;
        }

        .canvas-container {
          width: 100vw;
          height: auto;
          min-height: 100vh;
          max-width: none;
          max-height: none;
          display: grid;
          grid-template-columns: 44% 43% 13%;
          background: transparent;
          position: relative;
          border: none;
          border-radius: 0;
          overflow-y: auto;
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Lock fullscreen only on large screens (both wide and tall) */
        @media (min-width: 1025px) and (min-height: 750px) {
          .anime-landing-wrapper {
            height: 100vh;
            overflow: hidden;
          }
          .canvas-container {
            height: 100vh;
            overflow: hidden;
          }
        }

        .canvas-dot-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: radial-gradient(rgba(148, 163, 184, 0.08) 15%, transparent 16%);
          background-size: 6px 6px;
          z-index: 2;
          pointer-events: none;
        }

        .ui-corner-bracket {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-color);
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
          color: rgba(255, 126, 20, 0.04);
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
          padding: 6% 8%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 15;
          background: transparent;
        }

        .hero-quote-header {
          font-size: 0.75rem;
          font-weight: 900;
          color: var(--text-muted);
          letter-spacing: 2px;
          line-height: 1.5;
          text-transform: uppercase;
          border-left: 3px solid #FF7E14;
          padding-left: 10px;
          transition: padding-right 0.3s ease;
        }

        .quote-jp {
          font-size: 0.65rem;
          color: var(--text-muted);
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
          color: var(--text-title);
          line-height: 0.85;
          letter-spacing: -6px;
          display: inline-block;
          text-shadow: 
              1px 1px 0px #FF7E14,
              2px 2px 0px rgba(56, 189, 248, 0.6),
              0 0 35px rgba(255, 126, 20, 0.55);
          transition: color 0.3s ease;
        }

        .japanese-sub {
          font-size: 0.95rem;
          color: var(--text-muted);
          font-weight: 900;
          letter-spacing: 6px;
          margin-bottom: 8px;
          display: block;
        }

        .center-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .cta-button-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-top: 25px;
          position: relative;
          z-index: 30;
        }

        .numeric-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, #FF7E14, #EB6D12);
          color: #ffffff;
          padding: 14px 38px;
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 2px;
          box-shadow: 0 0 25px rgba(255, 126, 20, 0.55), 0 8px 30px rgba(255, 126, 20, 0.45);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
        }

        .numeric-badge:hover {
          background: linear-gradient(135deg, #ff8c26, #f3771c);
          color: #ffffff;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 0 38px rgba(255, 126, 20, 0.8), 0 12px 35px rgba(255, 126, 20, 0.65);
        }

        .content-text-box {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-left: 4px solid;
          border-image: linear-gradient(to bottom, #38bdf8, #ff7e14) 1;
          padding: 20px 20px;
          margin-top: 25px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 15px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          color: var(--text-main);
          font-size: 20px;
          line-height: 1.6;
          max-height: 260px;
          overflow-y: auto;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .left-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid var(--border-color);
          padding-top: 15px;
        }

        .game-meta {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: bold;
          letter-spacing: 2px;
        }

        .tag-pill {
          background-color: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-main);
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
          width: 76%;
          height: 65%;
          max-width: 460px;
          max-height: 420px;
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          background: var(--glass-bg);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .art-window::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 126, 20, 0.5), rgba(56, 189, 248, 0.6), transparent);
          top: 0; z-index: 2;
          animation: laser-scan 4s linear infinite;
        }

        .large-bg-kanji {
          font-size: 10rem;
          color: rgba(148, 163, 184, 0.08);
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
          color: var(--text-muted);
          font-size: 0.55rem;
          font-family: monospace;
          z-index: 3;
        }

        .live-pulse-bar {
          width: 40px;
          height: 2px;
          background-color: #FF7E14;
          animation: bar-stretch 1.2s infinite ease-in-out;
        }

        .character-root {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); 
          will-change: transform;
        }

        .character-img {
          max-height: 46vh;
          max-width: 68%;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4)); 
          animation: float-character 6s ease-in-out infinite;
        }

        .right-panel {
          background: transparent;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          color: var(--text-main);
          position: relative;
          z-index: 15;
        }

        .pill-box {
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 6px 18px;
          font-size: 0.7rem;
          letter-spacing: 2px;
          font-weight: bold;
          background: var(--glass-bg);
          text-decoration: none;
          color: var(--text-main);
          transition: all 0.2s ease;
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
          color: var(--text-title);
          text-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .v-latin-sub {
          writing-mode: vertical-rl;
          font-size: 0.7rem;
          letter-spacing: 6px;
          color: var(--text-muted);
        }

        .diamond {
          color: #FF7E14;
          font-size: 1.4rem;
          animation: pulse-glow 2s infinite ease-in-out;
        }

        .panel-footer-stamp {
          text-align: center;
        }

        .micro-japanese {
          font-size: 0.45rem;
          letter-spacing: 3px;
          color: var(--text-muted);
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          margin-top: 8px;
        }

        .action-button-group {
          position: absolute;
          top: 40px;
          right: 40px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @keyframes cyberGlitch {
          0% {
            transform: translate(0, 0) skew(0deg) scale(1);
            filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.8));
            clip-path: inset(0 0 0 0);
          }
          15% {
            transform: translate(-10px, 5px) skew(-14deg) scale(1.05);
            filter: drop-shadow(-12px 0 #FF7E14) drop-shadow(12px 0 #38bdf8);
            clip-path: inset(18% 0 32% 0);
          }
          35% {
            transform: translate(10px, -6px) skew(12deg) scale(0.96);
            filter: drop-shadow(10px 0 #00ffff) drop-shadow(-10px 0 #ff0055);
            clip-path: inset(55% 0 12% 0);
          }
          60% {
            transform: translate(-8px, 4px) skew(-8deg) scale(1.03);
            filter: drop-shadow(-8px 0 #FF7E14) drop-shadow(8px 0 #00e5ff);
            clip-path: inset(8% 0 68% 0);
          }
          80% {
            transform: translate(5px, -3px) skew(5deg) scale(1.01);
            filter: drop-shadow(8px 0 #ff007f);
            clip-path: inset(40% 0 25% 0);
          }
          100% {
            transform: translate(0, 0) skew(0deg) scale(1);
            filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4));
            clip-path: inset(0 0 0 0);
          }
        }

        .glitch-anim {
          animation: cyberGlitch 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes move-nihility {
          0% { transform: translate(0, -50%); }
          100% { transform: translate(-50%, -50%); } 
        }

        @keyframes float-character {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
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
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @media (max-width: 768px) {
          .anime-landing-wrapper {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          .canvas-container {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          .left-panel {
            padding: 35px 24px;
          }
          .hero-quote-header {
            padding-right: 180px;
            font-size: 0.7rem;
          }
          .main-kanji {
            font-size: 6rem;
            letter-spacing: -3px;
          }
          .content-text-box {
            font-size: 15px;
            line-height: 1.5;
            padding: 15px;
            margin-top: 15px;
            max-height: 200px;
          }
          .cta-button-container {
            margin-top: 24px;
            margin-bottom: 20px;
          }
          .numeric-badge {
            width: 100%;
            max-width: 320px;
            padding: 14px 24px;
            font-size: 1.05rem;
            border-radius: 14px;
          }
          .art-window {
            width: 90%;
            height: 300px;
            margin: 20px auto;
          }
          .character-img {
            max-height: 32vh;
          }
          .action-button-group {
            position: absolute;
            top: 25px;
            right: 25px;
          }
          .pill-box {
            padding: 5px 12px;
            font-size: 0.65rem;
            letter-spacing: 1px;
          }
          .right-panel {
            flex-direction: column;
            padding: 30px 20px;
            gap: 20px;
          }
          .vertical-text-wrap {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
          }
          .v-kanji-title, .v-latin-sub, .micro-japanese {
            writing-mode: horizontal-tb;
            transform: none;
            font-size: 0.85rem;
            letter-spacing: 2px;
          }
          .v-kanji-title {
            font-size: 1.3rem;
            font-weight: bold;
          }
          .diamond {
            display: none;
          }
          .panel-footer-stamp {
            margin-top: 10px;
          }
          .micro-japanese {
            writing-mode: horizontal-tb;
            transform: none;
          }
        }
      `}</style>

      {/* CS RMUTI Dynamic Loading Screen */}
      <LoadingScreen minDuration={1000} />

      {/* Standalone Fullscreen Anime Canvas Landing */}
      <div className="anime-landing-wrapper">
        <div className="canvas-container" id="main-canvas" ref={mainCanvasRef}>
          {/* Action Buttons (Theme Selector + Login) */}
          <div className="action-button-group">
            {/* Theme Selector Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                className="pill-box hover:border-[#FF7E14] text-[var(--text-main)] font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg"
                title="เปลี่ยนธีมพื้นหลัง (Theme Selector)"
              >
                <Palette className="w-3.5 h-3.5 text-[#FF7E14]" />
                <span className="hidden sm:inline">{currentThemeObj.label}</span>
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-xl text-white">
                  <div className="px-3 py-1.5 border-b border-white/10 mb-1 text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                    🎨 เลือกลายกระดาษกราฟ & ธีม
                  </div>
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all text-xs ${
                        theme === opt.id
                          ? 'bg-sky-500/20 text-white font-bold border border-sky-400/30'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{opt.icon}</span>
                        <div>
                          <div className="font-bold">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{opt.desc}</div>
                        </div>
                      </div>
                      {theme === opt.id && <Check className="w-4 h-4 text-[#FF7E14]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login / Logout Button */}
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="pill-box hover:bg-red-500/30 hover:border-red-400 text-red-400 transition-all duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
                title={`Sign Out (${session.user.name || session.user.email})`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="pill-box hover:bg-amber-500/25 hover:border-amber-400 text-[#FF7E14] font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20 backdrop-blur-md hover:scale-105"
                title="เข้าสู่ระบบด้วย Google SSO (.ac.th)"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF7E14]" />
                <span>LOGIN <span className="hidden md:inline">(.ac.th)</span></span>
              </button>
            )}
          </div>

          <div className="canvas-dot-overlay"></div>
          <div className="ui-corner-bracket top-left"></div>
          <div className="ui-corner-bracket bottom-right"></div>

          {/* Canvas for floating petals */}
          <canvas id="petals-canvas" ref={petalsCanvasRef}></canvas>

          {/* Left Panel */}
          <section className="left-panel">
            <div className="hero-quote-header">
              Artificial Intelligence
              <span className="quote-jp">02-406-032-415</span>
            </div>

            <div className="main-title-group">
              <span className="japanese-sub">Computer・Science</span>
              <h1 className="main-kanji">67</h1>

              <div className="content-text-box">
               แหล่งรวบรวมนวัตกรรมผลงานของนักศึกษา สาขาวิชาวิทยาการคอมพิวเตอร์ ( CS 67241) ซึ่งเป็นส่วนหนึ่งของรายวิชาปัญญาประดิษฐ์
              </div>
            </div>

            <div className="left-footer">
              <p className="game-meta">THANIN RABIEPPHO // SUPAWADEE PHOPPHIMAI</p>
              <div className="tag-pill">COM SCI DI WA</div>
            </div>
          </section>

          {/* Center Panel: Logo adapts to theme (logo.png / logo2.png) */}
          <section className="center-panel">
            <div className="art-window">
              <div className="tech-overlay">
                <div className="live-pulse-bar"></div>
              </div>
            </div>
            <div className="character-root" id="character-layer" ref={charLayerRef}>
              <img
                src={activeLogo}
                alt="One 4 All CS67 Logo"
                className={`character-img p-2 cursor-pointer ${isGlitching ? 'glitch-anim' : ''}`}
                onClick={() => {
                  if (!isGlitching) {
                    setIsGlitching(true);
                    setTimeout(() => setIsRmutiLogo((prev) => !prev), 180);
                    setTimeout(() => setIsGlitching(false), 450);
                  }
                }}
                title="คลิกเพื่อ Glitch สลับโลโก้"
              />
            </div>

            {/* Enter Main Showcase Button (Centered directly below Logo Card) */}
            <div className="cta-button-container">
              <Link href="/hub" className="numeric-badge group">
                <span>เข้าสู่หน้าเว็บหลัก</span>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform ml-1" />
              </Link>
            </div>
          </section>

          {/* Right Panel */}
          <aside className="right-panel">
            {/* Spacer for desktop flex layout */}
            <div className="h-10 hidden md:block"></div>

            <div className="vertical-text-wrap">
              <span className="v-kanji-title">RMUTI</span>
              <span className="diamond">✦</span>
              <span className="v-latin-sub">AI</span>
              <span className="diamond">✦</span>
              <span className="v-latin-sub">CODE</span>
              <span className="diamond">✦</span>
              <span className="v-latin-sub">LEARNING</span>
              <span className="diamond">✦</span>
              <span className="v-latin-sub">GAME</span>
              <span className="diamond">✦</span>
              <span className="v-latin-sub">WEB</span>
            </div>
            <div className="panel-footer-stamp">
              <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>—</div>
              <p className="micro-japanese">システム起動完了</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
