'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface LoadingScreenProps {
  minDuration?: number;
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  minDuration = 1200,
  onFinish,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 500);
      return () => clearTimeout(hideTimer);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinish]);

  if (!visible) return null;

  const isGraphPaper = theme === 'graph-paper';
  const isBlueprint = theme === 'blueprint';

  // Dynamic Background style based on selected theme
  const backdropBg = isGraphPaper
    ? '#f8fafc'
    : isBlueprint
    ? 'radial-gradient(circle at center, #0c2145 0%, #07152d 60%, #040c1b 90%)'
    : 'radial-gradient(circle at center, #071b36 0%, #020b18 50%, #050814 90%)';

  const gridLineColor = isGraphPaper
    ? 'rgba(51, 65, 85, 0.15)'
    : isBlueprint
    ? 'rgba(255, 255, 255, 0.18)'
    : 'rgba(56, 189, 248, 0.12)';

  const auraBg = isGraphPaper
    ? 'radial-gradient(circle, rgba(2, 132, 199, 0.18) 0%, rgba(255, 126, 20, 0.15) 70%, transparent 100%)'
    : isBlueprint
    ? 'radial-gradient(circle, rgba(255, 126, 20, 0.3) 0%, rgba(12, 33, 69, 0.6) 70%, transparent 100%)'
    : 'radial-gradient(circle, rgba(7, 27, 54, 0.95) 0%, rgba(2, 11, 24, 0.65) 70%, transparent 100%)';

  const textColor = isGraphPaper ? '#0f172a' : '#FF7E14';

  return (
    <div
      className={`fixed inset-0 z-[99999] w-full h-screen flex justify-center items-center overflow-hidden transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: isGraphPaper ? '#f8fafc' : 'black',
        backgroundImage: `
          linear-gradient(${gridLineColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridLineColor} 1px, transparent 1px),
          ${backdropBg}
        `,
        backgroundSize: '28px 28px, 28px 28px, 100% 100%',
        fontFamily: 'Arial, "Noto Sans Thai", sans-serif',
      }}
    >
      <style jsx>{`
        .navy-aura-backdrop {
          position: absolute;
          width: min(88vw, 500px);
          height: min(88vw, 500px);
          border-radius: 50%;
          background: ${auraBg};
          filter: blur(45px);
          animation: navyPulse 3s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 1;
        }

        .loader {
          position: relative;
          z-index: 2;
          width: min(90vw, 520px);
          text-align: center;
          animation: containerIn 1.2s ease-out both;
        }

        .logo-wrap {
          position: relative;
          display: inline-block;
          width: min(72vw, 390px);
          animation: logoFloat 3s ease-in-out infinite;
        }

        .logo-wrap::before {
          content: "";
          position: absolute;
          inset: 10% 12% 15%;
          border-radius: 50%;
          background: ${isGraphPaper ? 'rgba(2, 132, 199, 0.15)' : 'rgba(255, 126, 20, 0.25)'};
          filter: blur(40px);
          animation: glow 2s ease-in-out infinite alternate;
          z-index: -1;
        }

        .logo {
          width: 100%;
          height: auto;
          display: block;
          filter: ${
            isGraphPaper
              ? 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 10px rgba(255, 126, 20, 0.5))'
              : 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.75)) drop-shadow(0 0 16px rgba(255, 126, 20, 0.7))'
          };
        }

        .progress-area {
          margin-top: 28px;
        }

        .progress {
          width: 100%;
          height: 5px;
          background: ${isGraphPaper ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)'};
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .progress::before {
          content: "";
          position: absolute;
          left: -45%;
          top: 0;
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, transparent, #FF7E14, #ffd000, #FF7E14, transparent);
          box-shadow: 0 0 15px #FF7E14;
          animation: scan 1.6s ease-in-out infinite;
        }

        .dots {
          margin-top: 16px;
          display: flex;
          justify-content: center;
          gap: 9px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FF7E14;
          box-shadow: 0 0 10px #FF7E14;
          animation: dotPulse 1.2s infinite ease-in-out;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.1s; }
        .dot:nth-child(3) { animation-delay: 0.2s; }
        .dot:nth-child(4) { animation-delay: 0.3s; }
        .dot:nth-child(5) { animation-delay: 0.4s; }
        .dot:nth-child(6) { animation-delay: 0.5s; }
        .dot:nth-child(7) { animation-delay: 0.6s; }

        .loading-text {
          margin-top: 14px;
          color: ${textColor};
          font-size: 12px;
          letter-spacing: 7px;
          text-indent: 7px;
          font-weight: 800;
          animation: textGlow 1.5s ease-in-out infinite alternate;
        }

        @keyframes navyPulse {
          from { opacity: 0.45; transform: scale(0.92); }
          to { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes containerIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow {
          from { opacity: 0.4; transform: scale(0.9); }
          to { opacity: 0.95; transform: scale(1.1); }
        }
        @keyframes scan {
          0% { left: -45%; }
          100% { left: 100%; }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(0.55); opacity: 0.25; }
          45% { transform: scale(1.25); opacity: 1; }
        }
        @keyframes textGlow {
          from { opacity: 0.45; text-shadow: 0 0 2px ${textColor}; }
          to { opacity: 1; text-shadow: 0 0 14px ${textColor}, 0 0 25px rgba(255, 126, 20, 0.6); }
        }

        @media (max-height: 650px) {
          .logo-wrap { width: min(55vw, 280px); }
          .progress-area { margin-top: 15px; }
        }
      `}</style>

      <div className="navy-aura-backdrop" />

      <div className="loader">
        <div className="logo-wrap">
          <img className="logo" src="/rmuti.png" alt="RMUTI Logo" />
        </div>

        <div className="progress-area">
          <div className="progress" />
        </div>

        <div className="dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>

        <div className="loading-text">LOADING...</div>
      </div>
    </div>
  );
};
