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
  url?: string;
  embed_code?: string;
  thumbnail_url: string;
  creator_id: string;
  creator_email?: string;
  creator_name?: string;
  display_mode: DisplayMode;
  metrics: GameMetrics;
  tags: string[];
  created_at: string;
  qr_image_url?: string;
  cover_image_url?: string;
  pdf_drive_url?: string;
  pdf_title?: string;
}

export interface ScrapedMetadata {
  title: string;
  description: string;
  thumbnail_url: string;
  display_mode: DisplayMode;
  tags: string[];
  original_url: string;
  embed_code?: string;
}

export interface SubmitGamePayload {
  url: string;
  embed_code?: string;
  custom_title?: string;
  custom_description?: string;
  custom_thumbnail_url?: string;
  custom_tags?: string[];
  creator_id?: string;
  creator_email?: string;
  creator_name?: string;
  qr_image_url?: string;
  cover_image_url?: string;
  pdf_drive_url?: string;
  pdf_title?: string;
}

