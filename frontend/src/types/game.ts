export type DisplayMode = 'EMBEDDED' | 'POPUP';

export interface GameMetrics {
  views: number;
  likes: number;
  rating: number;
}

export interface GameDocument {
  id: string;
  title: string;
  description: string;
  original_url: string;
  thumbnail_url: string;
  creator_id: string;
  display_mode: DisplayMode;
  metrics: GameMetrics;
  tags: string[];
  created_at: string;
}

export interface ScrapedMetadata {
  title: string;
  description: string;
  thumbnail_url: string;
  display_mode: DisplayMode;
  original_url: string;
  tags: string[];
}

export interface SubmitGamePayload {
  url: string;
  creator_id?: string;
  custom_title?: string;
  custom_description?: string;
  custom_tags?: string[];
}
