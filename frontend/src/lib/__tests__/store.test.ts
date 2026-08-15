import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkUrlSafety, addGame, updateGame } from '../../app/api/games/store';
import * as db from '../db';
import { GameDocument } from '@/types/game';

vi.mock('../db', () => ({
  getCloudGames: vi.fn(),
  saveCloudGames: vi.fn(),
  addCloudGame: vi.fn(),
  updateCloudGameMetrics: vi.fn(),
  deleteCloudGame: vi.fn(),
  SEED_GAMES: [],
}));

vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(() => false),
}));

const mockGame: GameDocument = {
  id: 'user-1786620592935',
  title: 'HCI: Code Escape Runner',
  description: 'Action Logic Puzzle & Code-Based Runner',
  original_url: 'https://example.com/play',
  url: 'https://example.com/play',
  thumbnail_url: 'https://example.com/cover.png',
  creator_id: 'kanakrit.pr@rmuti.ac.th',
  creator_email: 'kanakrit.pr@rmuti.ac.th',
  display_mode: 'EMBEDDED',
  metrics: { views: 5, likes: 2, rating: 5.0 },
  tags: ['cs67', 'puzzle'],
  created_at: '2026-08-13T10:00:00.000Z',
};

describe('Store & Business Logic (store.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security & URL Safety', () => {
    it('should block casino / gambling / adult keywords in URL', () => {
      const result = checkUrlSafety('https://example.com/pgslot-casino-bet');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('ตรวจพบคำต้องห้าม');
    });

    it('should allow clean educational and game URLs', () => {
      const result = checkUrlSafety('https://drive.google.com/file/d/12345/view');
      expect(result.safe).toBe(true);
    });
  });

  describe('Cold-Start Resilience in addGame', () => {
    it('should save submission directly to cloud database', async () => {
      const newSubmission: GameDocument = { ...mockGame, id: 'new-2' };
      await addGame(newSubmission);

      expect(db.addCloudGame).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-2' })
      );
    });
  });

  describe('CRUD Operations Protection', () => {
    it('should update game details when owner is provided', async () => {
      vi.mocked(db.getCloudGames).mockResolvedValueOnce([mockGame]);

      const updated = await updateGame(
        'user-1786620592935',
        { description: 'Updated Description' },
        'kanakrit.pr@rmuti.ac.th'
      );

      expect(updated).not.toBeNull();
      expect(updated?.description).toBe('Updated Description');
    });
  });
});
