'use client';

import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  minDuration?: number; // ms to keep screen before fade-out
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  minDuration = 1200,
  onFinish,
}) => {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 500); // 500ms fade transition
      return () => clearTimeout(hideTimer);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] w-full h-screen bg-black flex justify-center items-center overflow-hidden transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #071b36 0%, #020b18 35%, #000 75%)',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <style jsx>{`
        .loading-bg-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: #008cff;
          filter: blur(180px);
          opacity: 0.12;
          animation: backgroundGlow 3s ease-in-out infinite;
        }

        .loader-container {
          position: relative;
          width: 350px;
          transform: translateY(15px);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }

        .logo-img {
          position: relative;
          width: 260px;
          height: auto;
          z-index: 3;
          object-fit: contain;
          filter: drop-shadow(0 0 5px rgba(0, 140, 255, 0.5)) drop-shadow(0 0 20px rgba(0, 140, 255, 0.25));
          animation: logoFloat 3s ease-in-out infinite, logoGlow 2s ease-in-out infinite alternate;
        }

        .logo-ring-wrapper {
          position: absolute;
          width: 310px;
          height: 310px;
          top: -25px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #00aaff;
          border-right-color: #0066ff;
          filter: drop-shadow(0 0 8px #008cff);
          animation: rotateRing 2s linear infinite;
          z-index: 1;
        }

        .logo-ring-wrapper::before {
          content: '';
          position: absolute;
          inset: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 153, 255, 0.25);
          animation: rotateRingReverse 3s linear infinite;
        }

        .loading-text-label {
          margin-top: 35px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 6px;
          text-align: center;
          text-shadow: 0 0 8px rgba(0, 153, 255, 0.8);
        }

        .dots-anim {
          display: inline-block;
          width: 30px;
          overflow: hidden;
          vertical-align: bottom;
          animation: dots 1.5s steps(4, end) infinite;
        }

        .progress-container {
          position: relative;
          width: 280px;
          height: 3px;
          margin-top: 18px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0, 140, 255, 0.15);
        }

        .progress-bar-fill {
          width: 0%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #0055ff, #00aaff, #fff);
          box-shadow: 0 0 10px #008cff, 0 0 20px rgba(0, 140, 255, 0.8);
          animation: progress 2.5s ease-in-out infinite;
        }

        .loading-status-sub {
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes logoGlow {
          0% {
            filter: drop-shadow(0 0 5px rgba(0, 140, 255, 0.4)) drop-shadow(0 0 15px rgba(0, 140, 255, 0.2));
          }
          100% {
            filter: drop-shadow(0 0 10px rgba(0, 170, 255, 0.9)) drop-shadow(0 0 30px rgba(0, 100, 255, 0.5));
          }
        }

        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateRingReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes progress {
          0% { width: 0%; }
          50% { width: 75%; }
          80% { width: 90%; }
          100% { width: 100%; }
        }

        @keyframes dots {
          0% { width: 0; }
          25% { width: 8px; }
          50% { width: 16px; }
          75% { width: 24px; }
          100% { width: 30px; }
        }

        @keyframes backgroundGlow {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.08;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.16;
          }
        }

        @media (max-width: 600px) {
          .loader-container { width: 90%; }
          .logo-img { width: 210px; }
          .logo-ring-wrapper { width: 255px; height: 255px; top: -20px; }
          .progress-container { width: 230px; }
          .loading-text-label {
            font-size: 12px;
            letter-spacing: 4px;
          }
        }
      `}</style>

      <div className="loading-bg-glow" />

      <div className="loader-container">
        <div className="logo-ring-wrapper" />

        <img
          className="logo-img"
          src="/logo.png?v=2"
          alt="CS RMUTI Logo"
        />

        <div className="loading-text-label">
          CS RMUTI LOADING<span className="dots-anim">...</span>
        </div>

        <div className="progress-container">
          <div className="progress-bar-fill" />
        </div>

        <div className="loading-status-sub">INITIALIZING SYSTEM REAL-TIME</div>
      </div>
    </div>
  );
};
