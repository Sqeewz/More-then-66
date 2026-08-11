// ---------------------------------------------------------------------------
// Shared application-level constants
// Keep all magic strings in ONE place so changing them never requires
// hunting through multiple files.
// ---------------------------------------------------------------------------

/** LocalStorage key for user-submitted games (client-side cache) */
export const LOCAL_STORAGE_GAMES_KEY = 'cs67_user_submitted_games';

/** SessionStorage key for the admin authentication hash */
export const ADMIN_SESSION_KEY = 'cs67_admin_auth';

/** Fallback admin password plaintext (kept for backward compat; hash is preferred) */
export const ADMIN_PASS_PLAINTEXT = '67morethen66';
