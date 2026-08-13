import { describe, it, expect, vi } from 'vitest';

// Mock @vercel/blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://store.blob.vercel-storage.com/data/debug_test.json' }),
  list: vi.fn().mockResolvedValue({ blobs: [], hasMore: false }),
  get: vi.fn(),
}));

import { put } from '@vercel/blob';

describe('Debug Route Isolation Protection', () => {
  it('should ensure debug-blob API never overwrites production cs67_games.json file', async () => {
    // Import debug-blob GET handler dynamically
    const { GET } = await import('../../app/api/admin/debug-blob/route');
    
    // Call debug-blob GET endpoint
    // @ts-ignore
    await GET(new Request('http://localhost:3000/api/admin/debug-blob'));

    // Check all put calls executed by debug-blob
    const putCalls = vi.mocked(put).mock.calls;
    
    for (const call of putCalls) {
      const targetPath = call[0];
      expect(targetPath).not.toBe('data/cs67_games.json');
      expect(targetPath).toBe('data/debug_test.json');
    }
  });
});
