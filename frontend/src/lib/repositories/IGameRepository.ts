import { GameDocument } from '@/types/game';

// ---------------------------------------------------------------------------
// IGameRepository — Repository Interface (Dependency Inversion Principle)
//
// store.ts and db.ts should depend on this abstraction, not on each other
// directly.  Any new storage back-end (e.g. Supabase, Postgres, local file)
// only needs to implement this interface — the rest of the application stays
// unchanged.
// ---------------------------------------------------------------------------

export interface IGameRepository {
  /** Return all games currently stored */
  findAll(): Promise<GameDocument[]>;

  /** Return a single game by its ID, or null if not found */
  findById(id: string): Promise<GameDocument | null>;

  /** Persist a new game and return it */
  add(game: GameDocument): Promise<GameDocument>;

  /** Persist all games (full replace) */
  saveAll(games: GameDocument[]): Promise<boolean>;

  /** Delete a game by ID; return true if something was actually removed */
  delete(id: string): Promise<boolean>;

  /** Partially update a game; return the updated document or null on failure */
  update(id: string, updates: Partial<GameDocument>): Promise<GameDocument | null>;

  /** Increment view/like counters atomically; return updated document or null */
  updateMetrics(id: string, viewIncrement: number, likeIncrement: number): Promise<GameDocument | null>;
}
