'use client';

import React, { useState } from 'react';
import { scrapeUrlPreview, submitGame } from '@/lib/api';
import { ScrapedMetadata } from '@/types/game';
import {
  X,
  Link as LinkIcon,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface SubmitGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmitGameModal: React.FC<SubmitGameModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedMetadata | null>(null);

  // Editable Form Fields
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleInspectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    try {
      setIsScraping(true);
      setError(null);
      const res = await scrapeUrlPreview(urlInput);
      setScrapedData(res);
      setCustomTitle(res.title);
      setCustomDescription(res.description);
      setTagsInput(res.tags.join(', '));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to scrape game link metadata.';
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

      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      await submitGame({
        url: urlInput,
        custom_title: customTitle,
        custom_description: customDescription,
        custom_tags: parsedTags,
        creator_id: 'community_member',
      });

      onSuccess();
      onClose();
      // Reset
      setUrlInput('');
      setScrapedData(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit game to platform.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#141724] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181c2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Submit External Web Game</h2>
              <p className="text-[11px] text-gray-400">Provide an itch.io, Game Jolt, or web link to frame</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
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

          {/* URL Input Box */}
          <form onSubmit={handleInspectUrl} className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300">
              Game URL (itch.io, Game Jolt, HTML5, WebGL):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  required
                  placeholder="https://itch.io/game-title or https://gamejolt.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181c2e] border border-gray-700/80 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isScraping || !urlInput}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                {isScraping ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Inspect URL</span>
              </button>
            </div>
          </form>

          {/* Scraped Metadata Preview Card */}
          {scrapedData && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              
              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-[#1c2138] border border-white/10 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-300">Embeddability Status:</span>
                {scrapedData.display_mode === 'EMBEDDED' ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ALLOW_FRAMING (EMBEDDED)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    FRAME_RESTRICTED (POPUP)
                  </span>
                )}
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Game Title (Extracted from OpenGraph):
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181c2e] border border-gray-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Description:
                  </label>
                  <textarea
                    rows={3}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181c2e] border border-gray-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-400" />
                    Tags (comma separated):
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="webgl, arcade, puzzle"
                    className="w-full px-3 py-2 rounded-xl bg-[#181c2e] border border-gray-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Thumbnail Preview */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Extracted Thumbnail Preview:
                  </label>
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
                    <img
                      src={scrapedData.thumbnail_url}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#181c2e]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!scrapedData || isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Save & Publish Game</span>
          </button>
        </div>

      </div>
    </div>
  );
};
