import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCloudGames, saveCloudGames, addCloudGame, deleteCloudGame } from '../db';
import { GameDocument } from '@/types/game';

// Mock @supabase/supabase-js
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockUpsert = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect.mockReturnThis(),
  order: mockOrder.mockReturnThis(),
  upsert: mockUpsert,
  delete: mockDelete.mockReturnThis(),
  update: mockUpdate.mockReturnThis(),
  eq: mockEq.mockReturnThis(),
  single: mockSingle,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}));

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

const mockRow = {
  id: 'game-123',
  title: 'HCI: Code Escape Runner',
  description: 'Test Game Description',
  original_url: 'https://example.com/game',
  url: 'https://example.com/game',
  thumbnail_url: 'https://example.com/thumb.jpg',
  creator_id: 'test@rmuti.ac.th',
  creator_email: 'test@rmuti.ac.th',
  display_mode: 'EMBEDDED',
  views: 10,
  likes: 5,
  rating: 5.0,
  tags: ['cs67', 'arcade'],
  created_at: '2026-08-13T00:00:00.000Z',
};

describe('Database & Persistence (db.ts — Supabase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  describe('getCloudGames', () => {
    it('should fetch and return games from Supabase', async () => {
      mockSelect.mockResolvedValueOnce({ data: [mockRow], error: null });
      const games = await getCloudGames();
      expect(games).toHaveLength(1);
      expect(games[0].id).toBe('game-123');
      expect(games[0].metrics.views).toBe(10);
    });

    it('should return empty array on Supabase error', async () => {
      mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });
      const games = await getCloudGames();
      expect(games).toEqual([]);
    });
  });

  describe('saveCloudGames', () => {
    it('should validate that payload is an array', async () => {
      // @ts-ignore
      const result = await saveCloudGames('not-an-array');
      expect(result).toBe(false);
    });

    it('should upsert all games to Supabase', async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });
      const success = await saveCloudGames([mockGame]);
      expect(success).toBe(true);
    });
  });

  describe('addCloudGame', () => {
    it('should upsert single game and return updated list', async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });
      mockSelect.mockResolvedValueOnce({ data: [mockRow], error: null });
      const result = await addCloudGame(mockGame);
      expect(result).toHaveLength(1);
    });
  });

  describe('deleteCloudGame', () => {
    it('should delete game by id', async () => {
      mockEq.mockResolvedValueOnce({ error: null });
      mockSelect.mockResolvedValueOnce({ data: [mockRow], error: null });
      const result = await deleteCloudGame('game-123');
      expect(result).toBeDefined();
    });
  });
});
