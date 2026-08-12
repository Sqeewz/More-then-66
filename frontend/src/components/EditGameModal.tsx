'use client';

import React, { useState, useEffect } from 'react';
import { GameDocument } from '@/types/game';
import { convertGDriveToEmbed, convertGDriveToDirectImage } from '@/lib/qr-reader';
import {
  X,
  Save,
  ImageIcon,
  FileText,
  Tag,
  AlertTriangle,
  Link as LinkIcon,
  QrCode,
  CheckCircle2,
} from 'lucide-react';

interface EditGameModalProps {
  game: GameDocument;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedGame: GameDocument) => void;
}

const LOCAL_STORAGE_GAMES_KEY = 'cs67_user_submitted_games';

export const EditGameModal: React.FC<EditGameModalProps> = ({
  game,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const initialCover = game?.cover_image_url || game?.thumbnail_url || '';
  const initialQr = game?.qr_image_url && !game.qr_image_url.includes('api.qrserver.com') ? game.qr_image_url : '';

  // Inputs prefilled from current game values
  const [title, setTitle] = useState(game?.title || '');
  const [description, setDescription] = useState(game?.description || '');
  const [gameUrl, setGameUrl] = useState(game?.original_url || (game as any)?.url || '');
  const [coverUrl, setCoverUrl] = useState(initialCover);
  const [qrUrl, setQrUrl] = useState(initialQr);
  const [pdfUrl, setPdfUrl] = useState(game?.pdf_drive_url || '');
  const [pdfTitle, setPdfTitle] = useState(game?.pdf_title || '');
  const [tagsInput, setTagsInput] = useState((game?.tags || []).join(', '));

  // Preview States
  const [coverPreview, setCoverPreview] = useState(initialCover ? convertGDriveToDirectImage(initialCover) : '');
  const [qrPreview, setQrPreview] = useState(initialQr ? convertGDriveToDirectImage(initialQr) : '');
  const [coverError, setCoverError] = useState('');
  const [qrError, setQrError] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever game prop changes or modal opens
  useEffect(() => {
    if (game && isOpen) {
      setTitle(game.title || '');
      setDescription(game.description || '');
      const currentUrl = game.original_url || (game as any)?.url || '';
      setGameUrl(currentUrl);

      const currentCover = game.cover_image_url || game.thumbnail_url || '';
      setCoverUrl(currentCover);
      setCoverPreview(currentCover ? convertGDriveToDirectImage(currentCover) : '');

      const currentQr = game.qr_image_url && !game.qr_image_url.includes('api.qrserver.com') ? game.qr_image_url : '';
      setQrUrl(currentQr);
      setQrPreview(currentQr ? convertGDriveToDirectImage(currentQr) : '');

      setPdfUrl(game.pdf_drive_url || '');
      setPdfTitle(game.pdf_title || '');
      setTagsInput((game.tags || []).join(', '));
      setError(null);
    }
  }, [game, isOpen]);

  if (!isOpen) return null;

  // Handle Cover URL Change
  const handleCoverUrlChange = (val: string) => {
    setCoverUrl(val);
    setCoverError('');
    if (val.trim()) {
      setCoverPreview(convertGDriveToDirectImage(val.trim()));
    } else {
      setCoverPreview('');
    }
  };

  // Handle QR URL Change
  const handleQrUrlChange = (val: string) => {
    setQrUrl(val);
    setQrError('');
    if (val.trim()) {
      setQrPreview(convertGDriveToDirectImage(val.trim()));
    } else {
      setQrPreview('');
    }
  };

  // Save Handler
  const handleSave = async () => {
    if (!title.trim()) {
      setError('กรุณาใส่ชื่อผลงานเกม');
      return;
    }
    if (!gameUrl.trim()) {
      setError('กรุณาใส่ URL สำหรับเข้าเล่นเกม');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Auto-prefix https:// if missing
      let finalGameUrl = gameUrl.trim();
      if (finalGameUrl && !finalGameUrl.startsWith('http://') && !finalGameUrl.startsWith('https://')) {
        finalGameUrl = `https://${finalGameUrl}`;
      }

      const finalCoverUrl = coverUrl.trim()
        ? convertGDriveToDirectImage(coverUrl.trim())
        : undefined;

      const finalQrUrl = qrUrl.trim()
        ? convertGDriveToDirectImage(qrUrl.trim())
        : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalGameUrl)}`;

      const embedPdfUrl = pdfUrl.trim()
        ? convertGDriveToEmbed(pdfUrl.trim())
        : undefined;

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const updates: Partial<GameDocument> = {
        title: title.trim(),
        description: description.trim(),
        original_url: finalGameUrl,
        cover_image_url: finalCoverUrl,
        thumbnail_url: finalCoverUrl,
        qr_image_url: finalQrUrl,
        pdf_drive_url: embedPdfUrl,
        pdf_title: pdfTitle.trim() || undefined,
        tags,
      };

      const pathId = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : '';
      const targetId = game?.id && game.id !== 'undefined' ? game.id : (pathId && pathId !== 'game' ? pathId : '');

      if (!targetId) {
        throw new Error('ไม่พบ ID ผลงานเกม ไม่สามารถบันทึกการแก้ไขได้');
      }

      const adminPass = typeof window !== 'undefined' ? (localStorage.getItem('cs67_admin_auth') || '67morethen66') : '67morethen66';
      const res = await fetch(`/api/games/${targetId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pass': adminPass,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'ไม่สามารถแก้ไขเกมได้' }));
        throw new Error(err.error || 'ไม่มีสิทธิ์แก้ไขเกมนี้');
      }

      const data = await res.json();
      const updatedGame: GameDocument = data.game;

      // Update LocalStorage persistence
      try {
        const storedLocal = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
        if (storedLocal) {
          const localGames: GameDocument[] = JSON.parse(storedLocal);
          const updatedLocal = localGames.map((g) => (g.id === game.id ? updatedGame : g));
          localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(updatedLocal));
        }
      } catch (e) {}

      onSuccess(updatedGame);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-[#111a36]">
          <div className="flex items-center gap-2">
            <span className="text-lg">✏️</span>
            <div>
              <h2 className="font-extrabold text-base text-white">แก้ไขผลงานเกม</h2>
              <p className="text-[11px] text-slate-300">แก้ไขข้อมูล ลิงก์เกม รูปปก QR Code และ PDF ได้ทั้งหมด</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Game Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">ชื่อเกม / ชื่อผลงาน *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ชื่อเกม"
                className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">คำอธิบายเกม:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="คำอธิบายผลงานเกม..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400 resize-none"
              />
            </div>
          </div>

          {/* 2. Game URL */}
          <div className="space-y-1.5 pt-3 border-t border-white/10">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
              URL สำหรับเข้าเล่นเกม (Game URL) *
            </label>
            <input
              type="url"
              required
              placeholder="https://username.itch.io/game-name"
              value={gameUrl}
              onChange={(e) => setGameUrl(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* 3. Cover Image (Google Drive / Direct Image URL) */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              ลิงก์รูปปกเกม (Google Drive Link / Image URL)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              value={coverUrl}
              onChange={(e) => handleCoverUrlChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            {coverError && <p className="text-[11px] text-red-400">{coverError}</p>}
            <p className="text-[10px] text-slate-400">
              💡 รองรับลิงก์แชร์ Google Drive หรือ URL รูปภาพจากเว็บทั่วไป
            </p>

            {/* Cover Preview */}
            {coverPreview && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-sky-500/30 bg-black">
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setCoverError('ไม่สามารถโหลดรูปปกจากลิงก์นี้ได้ กรุณาตรวจสอบว่าตั้งค่าแชร์ Google Drive เป็น "Anyone with link" แล้ว');
                    setCoverPreview('');
                  }}
                />
              </div>
            )}
          </div>

          {/* 4. QR Code Image (Google Drive / Direct Image URL) */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              ลิงก์รูป QR Code (Google Drive Link / Image URL)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/.../view (ถ้าไม่ใส่ ระบบจะสร้างให้อัตโนมัติ)"
              value={qrUrl}
              onChange={(e) => handleQrUrlChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            {qrError && <p className="text-[11px] text-red-400">{qrError}</p>}

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
                  <p className="font-semibold text-emerald-300">✅ ตัวอย่างรูป QR Code</p>
                  <p className="text-[11px] text-slate-400 mt-1">รูป QR จะถูกแสดงในหน้าเกมสด</p>
                </div>
              </div>
            )}
          </div>

          {/* 5. PDF Google Drive Link */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              PDF คู่มือเกม (Google Drive Link)
            </label>
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view"
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
            />
            <input
              type="text"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              placeholder="ชื่อเอกสาร PDF เช่น 'คู่มือการเล่น Game Title v1.0'"
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* 6. Tags */}
          <div className="pt-3 border-t border-white/10">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1">
              <Tag className="w-3 h-3 text-sky-400" />
              Tags (คั่นด้วยจุลภาค):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="cs67, webgl, puzzle, arcade"
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#111a36]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#162248] text-slate-300 text-xs font-semibold border border-white/10 hover:bg-[#1f3066]"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !gameUrl.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs shadow-lg disabled:opacity-50 border border-white/20"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>บันทึกการแก้ไข</span>
          </button>
        </div>
      </div>
    </div>
  );
};
