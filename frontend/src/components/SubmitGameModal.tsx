'use client';

import React, { useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { decodeQRFromFile, convertGDriveToEmbed } from '@/lib/qr-reader';
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

function compressImage(file: File, maxWidth = 1200, maxHeight = 720, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

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
  const { data: session } = useSession();

  // QR Upload
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');
  const [decodedUrl, setDecodedUrl] = useState<string>('');
  const [qrDecoding, setQrDecoding] = useState(false);
  const [qrError, setQrError] = useState('');

  // Cover Upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  // PDF
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');

  // Game Info
  const [gameTitle, setGameTitle] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [tagsInput, setTagsInput] = useState('cs67');

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle QR file select
  const handleQrFileChange = async (file: File) => {
    setQrDecoding(true);
    setQrError('');

    // Decode original first for maximum success rate
    const url = await decodeQRFromFile(file);
    setQrDecoding(false);

    if (url) {
      setDecodedUrl(url);
    } else {
      setQrError('ไม่สามารถอ่าน QR Code ได้ กรุณาใส่ URL เกมเองในช่องด้านล่าง');
    }

    // Compress for storage/preview
    try {
      const compressed = await compressImage(file, 600, 600, 0.85);
      setQrFile(compressed);
      setQrPreview(URL.createObjectURL(compressed));
    } catch {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  // Handle Cover file select
  const handleCoverFileChange = async (file: File) => {
    try {
      const compressed = await compressImage(file, 1280, 720, 0.75);
      setCoverFile(compressed);
      setCoverPreview(URL.createObjectURL(compressed));
    } catch {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Upload files to Vercel Blob API
  const uploadFiles = async (): Promise<{ qr_image_url?: string; cover_image_url?: string }> => {
    if (!qrFile && !coverFile) return {};

    const formData = new FormData();
    if (qrFile) formData.append('qr_image', qrFile);
    if (coverFile) formData.append('cover_image', coverFile);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'อัพโหลดไฟล์ไม่สำเร็จ' }));
      // If Blob token is missing or upload fails, log warning & continue gracefully if possible
      console.warn('Upload API notice:', err.error);
      return {};
    }

    return res.json();
  };

  // Submit
  const handleSubmit = async () => {
    if (!decodedUrl && !qrFile) {
      setError('กรุณาอัพโหลดรูป QR Code หรือใส่ URL เกม');
      return;
    }
    if (!gameTitle.trim()) {
      setError('กรุณาใส่ชื่อผลงานเกม');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Upload files
      setIsUploading(true);
      let uploaded: { qr_image_url?: string; cover_image_url?: string } = {};
      try {
        uploaded = await uploadFiles();
      } catch (e) {
        console.warn('Blob upload fallback active');
      }
      setIsUploading(false);

      // 2. Prepare PDF URL
      const embedPdfUrl = pdfUrl ? convertGDriveToEmbed(pdfUrl) : undefined;

      // 3. Prepare QR Image URL (User upload OR Auto-generated from URL)
      const autoGeneratedQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(decodedUrl)}`;
      const finalQrUrl = uploaded.qr_image_url || (qrFile ? qrPreview : autoGeneratedQr);

      // 4. Parse tags
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      // 5. Submit game
      const res = await submitGame({
        url: decodedUrl,
        custom_title: gameTitle.trim(),
        custom_description:
          gameDesc.trim() || `ผลงานเกม CS67 โดย ${session?.user?.name || 'นิสิต CS 67'}`,
        custom_thumbnail_url: uploaded.cover_image_url || coverPreview || undefined,
        custom_tags: tags,
        creator_id: session?.user?.name || 'นิสิต CS 67',
        creator_email: session?.user?.email || undefined,
        creator_name: session?.user?.name || undefined,
        qr_image_url: finalQrUrl,
        cover_image_url: uploaded.cover_image_url || coverPreview || undefined,
        pdf_drive_url: embedPdfUrl,
        pdf_title: pdfTitle.trim() || undefined,
      });


      // 5. Save to LocalStorage persistence
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
      setQrFile(null);
      setQrPreview('');
      setDecodedUrl('');
      setCoverFile(null);
      setCoverPreview('');
      setPdfUrl('');
      setPdfTitle('');
      setGameTitle('');
      setGameDesc('');
      setTagsInput('cs67');
    } catch (err: unknown) {
      setIsUploading(false);
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
                อัพโหลด QR Code + รูปปกเกม และแนบ PDF คู่มือ
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
          {/* Error */}
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

          {/* STEP 1: QR Code Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              1. อัพโหลดรูป QR Code ของเกม *
            </label>

            <div
              onClick={() => qrInputRef.current?.click()}
              className="relative border-2 border-dashed border-sky-500/40 hover:border-sky-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#111a36] hover:bg-[#162248] group"
            >
              {qrPreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={qrPreview}
                    alt="QR Preview"
                    className="w-24 h-24 object-contain rounded-xl border border-sky-500/30 bg-white p-1"
                  />
                  <div className="text-left space-y-1">
                    {qrDecoding && <p className="text-xs text-sky-300 animate-pulse">กำลังอ่าน QR Code...</p>}
                    {qrError && <p className="text-xs text-amber-300">{qrError}</p>}
                    {decodedUrl && (
                      <p className="text-xs text-emerald-300 font-medium">
                        ✅ อ่าน URL ได้: <span className="font-mono text-white truncate block max-w-xs">{decodedUrl}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">คลิกเพื่อเปลี่ยนรูป QR</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <QrCode className="w-9 h-9 text-sky-400/50 mx-auto group-hover:text-sky-300 transition-colors" />
                  <p className="text-xs text-slate-300">คลิกหรือลากรูป QR Code มาวาง</p>
                  <p className="text-[10px] text-slate-400">ระบบจะดึง URL จาก QR อัตโนมัติ (JPG, PNG, WebP ≤ 2MB)</p>
                </div>
              )}
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleQrFileChange(e.target.files[0])}
              />
            </div>

            {/* Manual URL fallback */}
            <div>
              <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <LinkIcon className="w-3 h-3" />
                URL เกม (ถ้า QR อ่านไม่ออก หรือต้องการป้อน URL เอง):
              </label>
              <input
                type="url"
                placeholder="https://username.itch.io/game-name"
                value={decodedUrl}
                onChange={(e) => setDecodedUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>
          </div>

          {/* STEP 2: Cover Image Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              2. อัพโหลดรูปปกเกม *
            </label>

            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative border-2 border-dashed border-sky-500/40 hover:border-sky-400 rounded-xl overflow-hidden cursor-pointer transition-colors group"
            >
              {coverPreview ? (
                <div className="relative aspect-[16/9] w-full bg-black">
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">คลิกเพื่อเปลี่ยนรูปปก</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center bg-[#111a36] hover:bg-[#162248] transition-colors">
                  <ImageIcon className="w-9 h-9 text-sky-400/50 mx-auto group-hover:text-sky-300 transition-colors" />
                  <p className="text-xs text-slate-300 mt-1">คลิกหรือลากรูปปกเกมมาวาง</p>
                  <p className="text-[10px] text-slate-400">แนะนำอัตราส่วน 16:9 (JPG/PNG ≤ 5MB)</p>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleCoverFileChange(e.target.files[0])}
              />
            </div>
          </div>

          {/* STEP 3: PDF Link */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              3. PDF คู่มือเกม (Google Drive Link) — ไม่บังคับ
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            <input
              type="text"
              placeholder="ชื่อ PDF เช่น 'คู่มือการเล่น Game Title v1.0'"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
            <p className="text-[10px] text-slate-400">
              💡 อัพ PDF บน Google Drive → คลิกขวา → Share (anyone with link) → Copy link แล้วแปะที่นี่
            </p>
          </div>

          {/* STEP 4: Game Info */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="text-xs font-bold text-slate-200">4. ข้อมูลเกม</label>

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
            disabled={isSubmitting || !gameTitle.trim() || (!decodedUrl && !qrFile)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-white/20"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isUploading ? 'กำลังอัพโหลดไฟล์...' : 'เผยแพร่ผลงานเกม CS67'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
