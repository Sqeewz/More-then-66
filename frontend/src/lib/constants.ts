/** Default seed tags for game filtering */
export const DEFAULT_TAGS = ['cs67', 'hci', 'puzzle', 'arcade', 'action', 'itch.io', 'html5'] as const;

/** API Endpoints configuration */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/** LocalStorage key for user-submitted games (client-side cache) */
export const LOCAL_STORAGE_GAMES_KEY = 'cs67_user_submitted_games';
