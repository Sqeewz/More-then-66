'use client';

import React, { useState } from 'react';
import { scrapeUrlPreview, submitGame } from '@/lib/api';
import { GameDocument, ScrapedMetadata } from '@/types/game';
import {
  X,
  Link as LinkIcon,
  Search,
  ShieldCheck,
  AlertTriangle,
  Tag,
  CheckCircle2,
  GraduationCap,
  User,
  Image as ImageIcon,
  Code,
} from 'lucide-react';

interface SubmitGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LOCAL_STORAGE_GAMES_KEY = 'cs67_user_submitted_games';

export function parseUrlOrEmbed(input: string): { url: string; embedCode?: string } {
  const trimmed = input.trim();
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) {
      return {
        url: srcMatch[1],
        embedCode: trimmed,
      };
    }
  }
  return { url: trimmed };
}

export const SubmitGameModal: React.FC<SubmitGameModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedMetadata | null>(null);
  const [detectedEmbedCode, setDetectedEmbedCode] = useState<string | undefined>(undefined);

  // Editable Form Fields
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleInspectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    try {
      setIsScraping(true);
      setError(null);

      const parsed = parseUrlOrEmbed(urlInput);
      setDetectedEmbedCode(parsed.embedCode);

      const res = await scrapeUrlPreview(parsed.url);
      setScrapedData(res);
      setCustomTitle(res.title);
      setCustomDescription(res.description);
      setCustomThumbnail(res.thumbnail_url);
      setTagsInput(['cs67', ...res.tags].join(', '));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลพรีวิวจาก URL นี้ได้';
      setError(msg);
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async () => {
    if (!urlInput || !scrapedData) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const parsed = parseUrlOrEmbed(urlInput);
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const res = await submitGame({
        url: parsed.url,
        embed_code: parsed.embedCode || detectedEmbedCode,
        custom_title: customTitle,
        custom_description: customDescription,
        custom_thumbnail_url: customThumbnail.trim() || scrapedData.thumbnail_url,
        custom_tags: parsedTags,
        creator_id: creatorName.trim() || 'นิสิต CS 67',
      });

      // Save into LocalStorage persistence
      try {
        const existing = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
        const localList: GameDocument[] = existing ? JSON.parse(existing) : [];
        if (!localList.some((g) => g.id === res.game.id)) {
          localList.unshift(res.game);
          localStorage.setItem(LOCAL_STORAGE_GAMES_KEY, JSON.stringify(localList));
        }
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }

      onSuccess();
      onClose();
      // Reset Form
      setUrlInput('');
      setCreatorName('');
      setCustomThumbnail('');
      setScrapedData(null);
      setDetectedEmbedCode(undefined);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกผลงานเกม';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0e152e] border border-sky-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-[#111a36]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">ส่งผลงานเกม CS 67 (URL / HTML Embed Code)</h2>
              <p className="text-[11px] text-slate-300">ใส่ URL เกม หรือวางโค้ด HTML Embed (`&lt;iframe src="..."&gt;`) จาก itch.io</p>
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
        <div className="p-6 overflow-y-auto space-y-5">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleInspectUrl} className="space-y-3">
            
            {/* Input: Creator Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-400" />
                ชื่อผู้สร้างสรรค์ผลงาน / ผู้พัฒนา (Creator / Developer Name):
              </label>
              <input
                type="text"
                required
                placeholder="เช่น นายวิทยา คอมพิวเตอร์ (CS67) หรือ ชื่อทีมผู้พัฒนา"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Input: Game URL or Embed Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                URL หรือ โค้ด HTML Embed (`&lt;iframe src="..."&gt;`):
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-sky-400" />
                  <textarea
                    rows={3}
                    required
                    placeholder="วางลิงก์ https://... หรือ วางโค้ด <iframe src=&quot;https://itch.io/embed-upload/...&quot;></iframe> จาก itch.io ที่นี่"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isScraping || !urlInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 border border-sky-300/30"
                  >
                    {isScraping ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>ตรวจวิเคราะห์ URL / HTML Embed</span>
                  </button>
                </div>
              </div>
            </div>

          </form>

          {/* Scraped Metadata Preview Card */}
          {scrapedData && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              
              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-[#162248] border border-sky-500/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">สถานะการเล่นในเว็บ (Embed Playing Status):</span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  READY_FOR_IN_WEBSITE_PLAY
                </span>
              </div>

              {detectedEmbedCode && (
                <div className="p-3 rounded-xl bg-blue-600/10 border border-sky-400/30 text-sky-300 text-xs font-mono">
                  ✨ ตรวจพบโค้ด HTML Embed และสกัด URL เล่นเกมสดเรียบร้อยแล้ว
                </div>
              )}

              {/* Editable Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    ชื่อผลงานเกม (Game Title):
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    คำอธิบายผลงาน:
                  </label>
                  <textarea
                    rows={3}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Editable Thumbnail URL Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-sky-400" />
                    URL รูปปกเกม (Game Cover / Thumbnail Image URL):
                  </label>
                  <input
                    type="url"
                    placeholder="ใส่ URL รูปปกเกม (https://...)"
                    value={customThumbnail}
                    onChange={(e) => setCustomThumbnail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-sky-400" />
                    แท็กหมวดหมู่ (คั่นด้วยจุลภาค):
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="cs67, webgl, arcade, puzzle"
                    className="w-full px-3 py-2 rounded-xl bg-[#111a36] border border-sky-500/30 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Thumbnail Live Preview */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    ตัวอย่างรูปปกเกมที่เลือก (Live Preview):
                  </label>
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/60 border border-sky-500/30 shadow-inner">
                    <img
                      src={customThumbnail || scrapedData.thumbnail_url}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#111a36]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#162248] hover:bg-[#1f3066] text-slate-300 font-semibold text-xs border border-white/10"
          >
            ยกเลิก
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!scrapedData || isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-white/20"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>เผยแพร่ผลงานเกม CS67</span>
          </button>
        </div>

      </div>
    </div>
  );
};
