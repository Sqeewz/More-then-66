'use client';

import React, { useState } from 'react';
import { GameDocument } from '@/types/game';
import { convertGDriveToEmbed } from '@/lib/qr-reader';
import { X, Save, ImageIcon, FileText, Tag, AlertTriangle } from 'lucide-react';

interface EditGameModalProps {
  game: GameDocument;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedGame: GameDocument) => void;
}

export const EditGameModal: React.FC<EditGameModalProps> = ({
  game,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(game.title || '');
  const [description, setDescription] = useState(game.description || '');
  const [tagsInput, setTagsInput] = useState((game.tags || []).join(', '));

  const [pdfUrl, setPdfUrl] = useState(game.pdf_drive_url || '');
  const [pdfTitle, setPdfTitle] = useState(game.pdf_title || '');
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      let cover_image_url = game.cover_image_url;

      // Upload new cover if changed
      if (newCoverFile) {
        try {
          const formData = new FormData();
          formData.append('cover_image', newCoverFile);
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            cover_image_url = uploadData.cover_image_url || newCoverPreview;
          } else {
            cover_image_url = newCoverPreview;
          }
        } catch (e) {
          cover_image_url = newCoverPreview;
        }
      }

      const updates = {
        title,
        description,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        cover_image_url,
        thumbnail_url: cover_image_url || game.thumbnail_url,
        pdf_drive_url: pdfUrl ? convertGDriveToEmbed(pdfUrl) : undefined,
        pdf_title: pdfTitle || undefined,
      };

      const res = await fetch(`/api/games/${game.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'ไม่สามารถแก้ไขเกมได้' }));
        throw new Error(err.error || 'ไม่มีสิทธิ์แก้ไขเกมนี้');
      }

      const data = await res.json();
      onSuccess(data.game);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-[#111a36]">
          <h2 className="font-extrabold text-base text-white">✏️ แก้ไขผลงานเกม</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">ชื่อเกม:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ชื่อเกม"
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">คำอธิบายเกม:</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายผลงานเกม..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <Tag className="w-3 h-3 text-sky-400" />
              Tags (คั่นด้วยจุลภาค):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <ImageIcon className="w-3 h-3 text-sky-400" />
              เปลี่ยนรูปปกเกม:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setNewCoverFile(e.target.files[0]);
                  setNewCoverPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#162248] file:text-sky-300 file:font-semibold"
            />
            {(newCoverPreview || game.cover_image_url || game.thumbnail_url) && (
              <img
                src={newCoverPreview || game.cover_image_url || game.thumbnail_url}
                alt="Cover Preview"
                className="mt-2 w-full aspect-[16/9] object-cover rounded-xl border border-sky-500/20"
              />
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3 text-sky-400" />
              PDF Google Drive Link:
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
              placeholder="ชื่อเอกสาร PDF"
              className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400 mt-2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#111a36]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#162248] text-slate-300 text-xs font-semibold border border-white/10"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-xs shadow-lg disabled:opacity-50"
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
