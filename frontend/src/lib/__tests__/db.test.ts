import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCloudGames, saveCloudGames, addCloudGame, deleteCloudGame } from '../db';
import { GameDocument } from '@/types/game';

// Mock @vercel/blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
}));

import { put, list, get } from '@vercel/blob';

const mockGame: GameDocument = {
  id: 'game-123',
  title: 'HCI: Code Escape Runner',
  description: 'Test Game Description',
  original_url: 'https://example.com/game',
  url: 'https://example.com/game',
  thumbnail_url: 'https://example.com/thumb.jpg',
  creator_id: 'test@rmuti.ac.th',
  creator_email: 'test@rmuti.ac.th',
  display_mode: 'EMBEDDED',
  metrics: { views: 10, likes: 5, rating: 5.0 },
  tags: ['cs67', 'arcade'],
  created_at: '2026-08-13T00:00:00.000Z',
};

describe('Database & Persistence (db.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveCloudGames', () => {
    it('should validate that payload is an array', async () => {
      // @ts-ignore
      const result = await saveCloudGames('not-an-array');
      expect(result).toBe(false);
    });

    it('should save game array to Vercel Blob store', async () => {
      vi.mocked(put).mockResolvedValueOnce({
        url: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
        pathname: 'data/cs67_games.json',
        contentType: 'application/json',
        contentDisposition: 'inline',
      });

      const success = await saveCloudGames([mockGame]);
      expect(success).toBe(true);
      expect(put).toHaveBeenCalledWith(
        'data/cs67_games.json',
        expect.any(String),
        expect.objectContaining({
          access: 'private',
          allowOverwrite: true,
        })
      );
    });

    it('should fallback to public access if private access fails', async () => {
      vi.mocked(put)
        .mockRejectedValueOnce(new Error('Private store not configured'))
        .mockResolvedValueOnce({
          url: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
          pathname: 'data/cs67_games.json',
          contentType: 'application/json',
          contentDisposition: 'inline',
        });

      const success = await saveCloudGames([mockGame]);
      expect(success).toBe(true);
      expect(put).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCloudGames', () => {
    it('should fetch and parse game list from blob store', async () => {
      vi.mocked(list).mockResolvedValueOnce({
        blobs: [
          {
            url: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
            pathname: 'data/cs67_games.json',
            size: 500,
            uploadedAt: new Date(),
            downloadUrl: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
          },
        ],
        hasMore: false,
      });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify([mockGame])));
          controller.close();
        },
      });

      vi.mocked(get).mockResolvedValueOnce({
        stream,
        size: 500,
        uploadedAt: new Date(),
        pathname: 'data/cs67_games.json',
        contentType: 'application/json',
        contentDisposition: 'inline',
      });

      const games = await getCloudGames();
      expect(games).toHaveLength(1);
      expect(games[0].id).toBe('game-123');
      expect(get).toHaveBeenCalledWith(
        'https://store.blob.vercel-storage.com/data/cs67_games.json',
        expect.objectContaining({ access: 'private' })
      );
    });

    it('should return empty array when no blob exists', async () => {
      vi.mocked(list).mockResolvedValueOnce({
        blobs: [],
        hasMore: false,
      });

      const games = await getCloudGames();
      expect(games).toEqual([]);
    });
  });

  describe('addCloudGame & deleteCloudGame', () => {
    it('should add a new game without wiping existing entries', async () => {
      vi.mocked(list).mockResolvedValueOnce({
        blobs: [
          {
            url: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
            pathname: 'data/cs67_games.json',
            size: 500,
            uploadedAt: new Date(),
            downloadUrl: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
          },
        ],
        hasMore: false,
      });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify([mockGame])));
          controller.close();
        },
      });

      vi.mocked(get).mockResolvedValueOnce({
        stream,
        size: 500,
        uploadedAt: new Date(),
        pathname: 'data/cs67_games.json',
        contentType: 'application/json',
        contentDisposition: 'inline',
      });

      const newGame: GameDocument = { ...mockGame, id: 'game-456', title: 'New Game' };
      const updated = await addCloudGame(newGame);

      expect(updated).toHaveLength(2);
      expect(updated[0].id).toBe('game-456');
      expect(updated[1].id).toBe('game-123');
    });

    it('should delete a game by id', async () => {
      vi.mocked(list).mockResolvedValueOnce({
        blobs: [
          {
            url: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
            pathname: 'data/cs67_games.json',
            size: 500,
            uploadedAt: new Date(),
            downloadUrl: 'https://store.blob.vercel-storage.com/data/cs67_games.json',
          },
        ],
        hasMore: false,
      });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify([mockGame])));
          controller.close();
        },
      });

      vi.mocked(get).mockResolvedValueOnce({
        stream,
        size: 500,
        uploadedAt: new Date(),
        pathname: 'data/cs67_games.json',
        contentType: 'application/json',
        contentDisposition: 'inline',
      });

      const updated = await deleteCloudGame('game-123');
      expect(updated).toHaveLength(0);
    });
  });
});
