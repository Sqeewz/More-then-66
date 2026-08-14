'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function LandingPage() {
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
          'rgba(56, 189, 248, 0.3)',   // ฟ้า
          'rgba(37, 99, 235, 0.25)',   // น้ำเงิน
          'rgba(139, 92, 246, 0.25)',  // ม่วง
          'rgba(255, 255, 255, 0.35)',  // ขาว
          'rgba(186, 230, 253, 0.3)',   // ฟ้าอ่อนเกือบขาว
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

  return (
    <div className="w-full min-h-screen bg-[#060608] text-white selection:bg-amber-500 selection:text-black">
      {/* Dynamic Style Block for Dedicated Fullscreen Anime Landing */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;900&family=Syncopate:wght@700&display=swap');

        .anime-landing-wrapper {
          background: #060608;
          background-image: radial-gradient(circle at center, #07073cff 0%, #060608 100%);
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
          background-image: url('/wallmain.png');
          background-size: cover;
          background-position: center;
          position: relative;
          
          box-shadow: 
              0 30px 100px rgba(0, 0, 0, 0.8),
              inset 0 0 80px rgba(6, 6, 8, 0.9),
              inset 0 0 140px rgba(0, 0, 0, 0.95);
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
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.25);
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
          padding: 6% 8%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 15;
          background: linear-gradient(90deg, rgba(6, 6, 8, 0.98) 0%, rgba(12, 3, 70, 0.65) 75%, rgba(0, 0, 0, 0) 100%);
        }

        .hero-quote-header {
          font-size: 0.75rem;
          font-weight: 900;
          color: #cbd5e1;
          letter-spacing: 2px;
          line-height: 1.5;
          text-transform: uppercase;
          border-left: 3px solid #3d9db5ff;
          padding-left: 10px;
          transition: padding-right 0.3s ease;
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
              1px 1px 0px #1228b8ff,
              2px 2px 0px #0a1794ff,
              3px 3px 0px #060853ff,
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
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #ffffff;
          color: #000000;
          padding: 8px 22px;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 2px;
          margin-top: 14px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .numeric-badge:hover {
          background-color: #0c0c76ff;
          color: #ffffffff;
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 10px 25px rgba(54, 17, 247, 0.4);
        }

        .content-text-box {
          background: rgba(10, 10, 14, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-left: 4px solid #3d5db5ff;
          padding: 20px 20px;
          margin-top: 25px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 15px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          color: #cbd5e1;
          font-size: 20px;
          line-height: 1.6;
          max-height: 260px;
          overflow-y: auto;
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
          width: 76%;
          height: 65%;
          max-width: 460px;
          max-height: 420px;
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(20, 30, 30, 0.08) 0%, rgba(10, 15, 15, 0.35) 100%);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .art-window::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59, 61, 180, 0.3), rgba(168, 168, 178, 0.4), rgba(58, 59, 177, 0.3), transparent);
          top: 0; z-index: 2;
          animation: laser-scan 4s linear infinite;
        }

        .large-bg-kanji {
          font-size: 10rem;
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
          background-color: #287ea4ff;
          animation: bar-stretch 1.2s infinite ease-in-out;
        }

        /* Scaled down logo container */
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

        /* Logo fits inside the blurred art window card */
        .character-img {
          max-height: 46vh;
          max-width: 68%;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 45px rgba(56, 189, 248, 0.35)); 
          animation: float-character 6s ease-in-out infinite;
        }

        .right-panel {
          background: transparent;
          padding: 40px 20px;
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
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 20px;
          padding: 6px 20px;
          font-size: 0.7rem;
          letter-spacing: 2px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.05);
          text-decoration: none;
          color: #ffffff;
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
          color: #3d52b5ff;
          font-size: 1.4rem;
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

        .login-button-container {
          position: absolute;
          top: 40px;
          right: 40px;
          z-index: 50;
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
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
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
            background: linear-gradient(180deg, rgba(6, 6, 8, 0.95) 0%, rgba(12, 3, 70, 0.9) 100%);
          }
          .hero-quote-header {
            padding-right: 125px; /* Leave space for the floating Login button */
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
          .art-window {
            width: 90%;
            height: 300px;
            margin: 20px auto;
          }
          .character-img {
            max-height: 32vh;
          }
          .login-button-container {
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
            background: linear-gradient(180deg, rgba(12, 3, 70, 0.9) 0%, rgba(6, 6, 8, 0.98) 100%);
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

        /* Landscape Mobile Devices (height constrained) */
        @media (max-height: 550px) {
          .left-panel {
            padding: 15px 25px;
          }
          .hero-quote-header {
            font-size: 0.65rem;
            line-height: 1.3;
          }
          .quote-jp {
            font-size: 0.55rem;
            margin-top: 2px;
          }
          .main-title-group {
            margin-top: 5px;
          }
          .main-kanji {
            font-size: 4.5rem;
            letter-spacing: -2px;
          }
          .japanese-sub {
            font-size: 0.75rem;
            margin-bottom: 2px;
            letter-spacing: 3px;
          }
          .numeric-badge {
            padding: 5px 15px;
            font-size: 0.75rem;
            margin-top: 5px;
          }
          .content-text-box {
            font-size: 14px;
            line-height: 1.4;
            padding: 12px;
            margin-top: 10px;
            max-height: 95px;
          }
          .art-window {
            height: 80%;
            width: 90%;
          }
          .character-img {
            max-height: 60vh;
          }
          .right-panel {
            padding: 15px 10px;
          }
          .vertical-text-wrap {
            gap: 8px;
          }
          .v-kanji-title {
            font-size: 1.4rem;
            letter-spacing: 4px;
          }
          .v-latin-sub {
            font-size: 0.55rem;
            letter-spacing: 3px;
          }
          .left-footer {
            padding-top: 5px;
          }
          .login-button-container {
            position: absolute;
            top: 20px;
            right: 20px;
          }
        }
      `}</style>

      {/* CS RMUTI Dynamic Loading Screen */}
      <LoadingScreen minDuration={1000} />

      {/* Standalone Fullscreen Anime Canvas Landing */}
      <div className="anime-landing-wrapper">
        <div className="canvas-container" id="main-canvas" ref={mainCanvasRef}>
          {/* Floating Login Button at Top Right of screen */}
          <div className="login-button-container">
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
                <span>LOGIN <span className="hidden md:inline">(.ac.th)</span></span>
              </button>
            )}
          </div>

          <div className="canvas-dot-overlay"></div>
          <div className="ui-corner-bracket top-left"></div>
          <div className="ui-corner-bracket bottom-right"></div>

          <div className="nihility-bg-text">COMSCI COMSCI COMSCI COMSCI COMSCI COMSCI</div>

          {/* Canvas for floating petals */}
          <canvas id="petals-canvas" ref={petalsCanvasRef}></canvas>

          {/* Left Panel */}
          <section className="left-panel">
            <div className="hero-quote-header">
              Warning: The following content was created by a Computer Science student 67
              <span className="quote-jp">Please offer feedback politely.</span>
            </div>

            <div className="main-title-group">
              <span className="japanese-sub">Computer・Science</span>
              <h1 className="main-kanji">67</h1>
              <br />

              {/* Enter Main Showcase Button */}
              <Link href="/hub" className="numeric-badge group">
                <span>เข้าสู่หน้าเว็บหลัก</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="content-text-box">
                แหล่งรวบรวมและจัดแสดงผลงานสร้างสรรค์ด้านการพัฒนาเว็บเกม (Web Games) และสื่อมัลติมีเดียแบบปฏิสัมพันธ์ (Interactive Multimedia) ซึ่งรังสรรค์โดยนิสิตสาขาวิชาวิทยาการคอมพิวเตอร์ รุ่น 67 พื้นที่นี้เป็นศูนย์กลางในการสะท้อนศักยภาพ การประยุกต์ใช้องค์ความรู้ด้านวิทยาการคำนวณ การเขียนโปรแกรม การออกแบบ UI/UX และเทคโนโลยีเว็บสมัยใหม่ มาผสมผสานกับความคิดสร้างสรรค์เพื่อสร้างประสบการณ์ดิจิทัลที่ตอบโจทย์ทั้งความบันเทิงและการใช้งานจริง
              </div>
            </div>

            <div className="left-footer">
              <p className="game-meta">THANIN RABIEPPHO // SUPAWADEE PHOPPHIMAI</p>
              <div className="tag-pill">COM SCI DI WA</div>
            </div>
          </section>

          {/* Center Panel: Slightly reduced logo size */}
          <section className="center-panel">
            <div className="art-window">
              <span className="large-bg-kanji">RMUTI</span>
              <div className="tech-overlay">
                <span>STATUS: ACTIVE</span>
                <span>GLASS: GOD</span>
                <div className="live-pulse-bar"></div>
              </div>
            </div>
            <div className="character-root" id="character-layer" ref={charLayerRef}>
              <img
                src="/logo.png?v=2"
                alt="One 4 All CS67 Logo"
                className="character-img p-2"
              />
            </div>
          </section>

          {/* Right Panel: LOGIN Button */}
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
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>—</div>
              <p className="micro-japanese">システム起動完了</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
