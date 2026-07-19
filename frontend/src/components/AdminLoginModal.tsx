'use client';

import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertTriangle, Key } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hashOrPass: string) => void;
}

// SHA-256 Hash of "67morethen66"
export const ADMIN_PASS_HASH = 'b9982e40e58fffb52a1df3c6da5dc2f5c7c260c3881bd68f667a8e301c92a821';

export async function computeSha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const inputHash = await computeSha256(passwordInput.trim());

      if (inputHash === ADMIN_PASS_HASH) {
        sessionStorage.setItem('cs67_admin_auth', inputHash);
        onSuccess(inputHash);
        setPasswordInput('');
        onClose();
      } else {
        setError('รหัสผ่านแอดมินไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-[#111a36]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">เข้าสู่ระบบแอดมิน (Admin Login)</h2>
              <p className="text-[11px] text-slate-300">ใส่รหัสผ่านเพื่อเข้ารหัสและยืนยันสิทธิ์แอดมิน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              รหัสผ่านแอดมิน (Admin Password):
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
              <input
                type="password"
                required
                autoFocus
                placeholder="กรอกรหัสผ่านแอดมิน..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              🔒 รหัสผ่านจะถูกเข้ารหัสผ่านด้วย SHA-256 ก่อนส่งยืนยันความปลอดภัย
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-white/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              <span>ยืนยันรหัสผ่าน (SHA-256)</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
