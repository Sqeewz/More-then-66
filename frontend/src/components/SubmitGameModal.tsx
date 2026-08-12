'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { convertGDriveToEmbed, convertGDriveToDirectImage } from '@/lib/qr-reader';
import { submitGame } from '@/lib/api';
import { GameDocument } from '@/types/game';
import {
  X,
  QrCode,
  Image as ImageIcon,
  FileText,
  Tag,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Link as LinkIcon,
  LogIn,
} from 'lucide-react';

interface SubmitGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LOCAL_STORAGE_GAMES_KEY = 'cs67_user_submitted_games';

export const SubmitGameModal: React.FC<SubmitGameModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  // Inputs
  const [qrUrlInput, setQrUrlInput] = useState('');
  const [gameUrlInput, setGameUrlInput] = useState('');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [pdfUrlInput, setPdfUrlInput] = useState('');
  const [pdfTitleInput, setPdfTitleInput] = useState('');

  // Game Info
  const [gameTitle, setGameTitle] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [tagsInput, setTagsInput] = useState('cs67');

  // Preview States
  const [qrPreview, setQrPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [qrError, setQrError] = useState('');
  const [coverError, setCoverError] = useState('');

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle QR URL Input
  const handleQrUrlChange = (val: string) => {
    setQrUrlInput(val);
    setQrError('');
    if (val.trim()) {
      const converted = convertGDriveToDirectImage(val.trim());
      setQrPreview(converted);
    } else {
      setQrPreview('');
    }
  };

  // Handle Cover URL Input
  const handleCoverUrlChange = (val: string) => {
    setCoverUrlInput(val);
    setCoverError('');
    if (val.trim()) {
      const converted = convertGDriveToDirectImage(val.trim());
      setCoverPreview(converted);
    } else {
      setCoverPreview('');
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!gameUrlInput.trim()) {
      setError('กรุณาใส่ URL สำหรับเข้าเล่นเกม');
      return;
    }
    if (!gameTitle.trim()) {
      setError('กรุณาใส่ชื่อผลงานเกม');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Auto-prefix https:// on Game URL
      let finalGameUrl = gameUrlInput.trim();
      if (finalGameUrl && !finalGameUrl.startsWith('http://') && !finalGameUrl.startsWith('https://')) {
        finalGameUrl = `https://${finalGameUrl}`;
      }

      // Convert Google Drive links if used
      const finalQrUrl = qrUrlInput.trim()
        ? convertGDriveToDirectImage(qrUrlInput.trim())
        : undefined;

      const finalCoverUrl = coverUrlInput.trim()
        ? convertGDriveToDirectImage(coverUrlInput.trim())
        : undefined;

      const embedPdfUrl = pdfUrlInput.trim()
        ? convertGDriveToEmbed(pdfUrlInput.trim())
        : undefined;

      // Parse tags
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      // Submit Game
      const res = await submitGame({
        url: finalGameUrl,
        custom_title: gameTitle.trim(),
        custom_description:
          gameDesc.trim() || `ผลงานเกม CS67 โดย ${session?.user?.name || 'นิสิต CS 67'}`,
        custom_thumbnail_url: finalCoverUrl,
        custom_tags: tags,
        creator_id: session?.user?.name || 'นิสิต CS 67',
        creator_email: session?.user?.email || undefined,
        creator_name: session?.user?.name || undefined,
        qr_image_url: finalQrUrl,
        cover_image_url: finalCoverUrl,
        pdf_drive_url: embedPdfUrl,
        pdf_title: pdfTitleInput.trim() || undefined,
      });

      // Save to LocalStorage persistence
      try {
        const existing = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
        const localList: GameDocument[] = existing ? JSON.parse(existing) : [];
        if (!localList.some((g) => g.id === res.game.id)) {
          localList.unshift(res.game);
          localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(localList));
        }
      } catch (e) {}

      onSuccess();
      onClose();

      // Reset Form
      setQrUrlInput('');
      setGameUrlInput('');
      setCoverUrlInput('');
      setPdfUrlInput('');
      setPdfTitleInput('');
      setGameTitle('');

      // Navigate to the newly created game page immediately!
      if (res.game?.id) {
        router.push(`/game/${res.game.id}`);
      }
      setGameDesc('');
      setTagsInput('cs67');
      setQrPreview('');
      setCoverPreview('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเผยแพร่ผลงาน');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-[#111a36]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-sky-400/40 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">ส่งผลงานเกม CS 67</h2>
              <p className="text-[11px] text-slate-300">
                วางลิงก์ Google Drive หรือ URL รูปภาพสำหรับ QR Code, รูปปก และ PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Session Banner */}
          {session?.user ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-5 h-5 rounded-full" />
              ) : null}
              <span className="text-emerald-300 font-semibold">
                ส่งในนามของ: {session.user.name}
              </span>
              <span className="text-slate-400">({session.user.email})</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <span>💡 เข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย (.ac.th) เพื่อบันทึกสิทธิ์การแก้ไขเกม</span>
              <button
                onClick={() => signIn('google')}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px]"
              >
                <LogIn className="w-3 h-3" />
                Login
              </button>
            </div>
          )}

          {/* STEP 1: Game URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
              1. URL สำหรับเข้าเล่นเกม (Game URL) *
            </label>
            <input
              type="url"
              required
              placeholder="https://username.itch.io/game-name หรือ https://my-game.vercel.app"
              value={gameUrlInput}
              onChange={(e) => setGameUrlInput(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            <p className="text-[10px] text-slate-400">
              ใส่อิสระได้ทั้งลิงก์ itch.io, Vercel, GitHub Pages, หรือเว็บโฮสติ้งอื่นๆ
            </p>
          </div>

          {/* STEP 2: Cover Image (Google Drive / Direct URL) */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              2. ลิงก์รูปปกเกม (Google Drive Link / Image URL) *
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              value={coverUrlInput}
              onChange={(e) => handleCoverUrlChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            {coverError && <p className="text-[11px] text-red-400">{coverError}</p>}
            <p className="text-[10px] text-slate-400">
              💡 วิธีเอาลิงก์: อัปโหลดรูปขึ้น <b>Google Drive</b> → คลิกขวาที่ไฟล์ → แชร์ (Anyone with link) → คัดลอกลิงก์มาวางได้ทันที
            </p>

            {/* Cover Preview */}
            {coverPreview && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-sky-500/30 bg-black">
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setCoverError('ไม่สามารถโหลดรูปจากลิงก์นี้ได้ กรุณาตรวจสอบว่าตั้งค่าแชร์ Google Drive เป็น "Anyone with link" แล้ว');
                    setCoverPreview('');
                  }}
                />
              </div>
            )}
          </div>

          {/* STEP 3: QR Code Image (Google Drive / Direct URL) — Optional */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              3. ลิงก์รูป QR Code (Google Drive Link / Image URL) — ไม่บังคับ
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing (ถ้าไม่ใส่ ระบบจะสร้างให้อัตโนมัติ)"
              value={qrUrlInput}
              onChange={(e) => handleQrUrlChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            {qrError && <p className="text-[11px] text-red-400">{qrError}</p>}
            <p className="text-[10px] text-slate-400">
              💡 หากไม่ใส่ลิงก์รูป QR ระบบจะสร้างรูป QR Code จาก URL เกมให้อัตโนมัติ
            </p>

            {/* QR Preview */}
            {qrPreview && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#111a36] border border-sky-500/30">
                <img
                  src={qrPreview}
                  alt="QR Preview"
                  className="w-20 h-20 object-contain rounded-lg bg-white p-1"
                  onError={() => {
                    setQrError('ไม่สามารถโหลดรูป QR จากลิงก์นี้ได้');
                    setQrPreview('');
                  }}
                />
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-emerald-300">✅ แสดงตัวอย่างรูป QR Code</p>
                  <p className="text-[11px] text-slate-400 mt-1">รูป QR จะถูกนำไปแสดงในหน้าผลงานเกม</p>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: PDF Manual (Google Drive Link) */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              4. PDF คู่มือเกม (Google Drive Link) — ไม่บังคับ
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              value={pdfUrlInput}
              onChange={(e) => setPdfUrlInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            <input
              type="text"
              placeholder="ชื่อ PDF เช่น 'คู่มือการเล่น Game Title v1.0'"
              value={pdfTitleInput}
              onChange={(e) => setPdfTitleInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* STEP 5: Game Info */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="text-xs font-bold text-slate-200">5. ข้อมูลผลงานเกม</label>

            <input
              type="text"
              required
              placeholder="ชื่อเกม / ชื่อผลงาน *"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
            />

            <textarea
              rows={3}
              placeholder="คำอธิบายเกม / เนื้อหาผลงาน..."
              value={gameDesc}
              onChange={(e) => setGameDesc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 resize-none"
            />

            <div>
              <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <Tag className="w-3 h-3" />
                Tags (คั่นด้วยจุลภาค):
              </label>
              <input
                type="text"
                placeholder="cs67, webgl, puzzle, arcade"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#111a36]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#162248] text-slate-300 font-semibold text-xs border border-white/10 hover:bg-[#1f3066]"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !gameTitle.trim() || !gameUrlInput.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-white/20"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'กำลังส่งผลงาน...' : 'เผยแพร่ผลงานเกม CS67'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
