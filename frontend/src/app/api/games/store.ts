import { GameDocument, DisplayMode } from '@/types/game';

let gamesStore: GameDocument[] = [
  {
    id: 'seed-2048',
    title: '2048 Web Edition',
    description: 'Join the numbers and get to the 2048 tile! Addictive mathematical puzzle game.',
    original_url: 'https://play2048.co/',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    creator_id: 'system_admin',
    display_mode: 'EMBEDDED',
    metrics: { views: 1420, likes: 312, rating: 4.8 },
    tags: ['puzzle', 'math', 'casual', 'html5'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-hextris',
    title: 'Hextris HTML5',
    description: 'Fast-paced puzzle game inspired by Tetris played on a rotating hexagon grid.',
    original_url: 'https://hextris.io/',
    thumbnail_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    creator_id: 'system_admin',
    display_mode: 'EMBEDDED',
    metrics: { views: 2890, likes: 540, rating: 4.9 },
    tags: ['arcade', 'action', 'webgl', 'puzzle'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-itch-demo',
    title: 'Cyber Samurai Arcade',
    description: 'Futuristic neon slice-and-dice runner. Demo link showcasing external frame detection.',
    original_url: 'https://itch.io/',
    thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    creator_id: 'community_user_42',
    display_mode: 'POPUP',
    metrics: { views: 850, likes: 198, rating: 4.5 },
    tags: ['cyberpunk', 'itch-io', 'action'],
    created_at: new Date().toISOString(),
  },
];

export function getStore(): GameDocument[] {
  return gamesStore;
}

export function addGame(game: GameDocument): GameDocument {
  gamesStore.unshift(game);
  return game;
}

export function updateGameMetrics(id: string, viewInc = 0, likeInc = 0): GameDocument | null {
  const g = gamesStore.find((item) => item.id === id);
  if (!g) return null;
  g.metrics.views += viewInc;
  g.metrics.likes += likeInc;
  return g;
}

export async function scrapeUrl(targetUrl: string) {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebGameAggregator/1.0',
      },
    });

    const xFrame = res.headers.get('x-frame-options');
    const csp = res.headers.get('content-security-policy');

    let display_mode: DisplayMode = 'EMBEDDED';
    if (xFrame) {
      const xf = xFrame.toUpperCase();
      if (xf.includes('DENY') || xf.includes('SAMEORIGIN')) {
        display_mode = 'POPUP';
      }
    }
    if (csp) {
      const cs = csp.toLowerCase();
      if (cs.includes("frame-ancestors 'none'") || cs.includes("frame-ancestors 'self'")) {
        display_mode = 'POPUP';
      }
    }

    const html = await res.text();

    // og:title or title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitleMatch?.[1] || titleTagMatch?.[1] || 'User Submitted Web Game';

    // og:description or meta description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = ogDescMatch?.[1] || metaDescMatch?.[1] || 'Play this web game on our aggregator platform!';

    // og:image
    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    let thumbnail_url = ogImgMatch?.[1] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

    if (thumbnail_url.startsWith('/')) {
      const u = new URL(targetUrl);
      thumbnail_url = `${u.origin}${thumbnail_url}`;
    }

    const tags: string[] = ['arcade'];
    if (targetUrl.includes('itch.io')) tags.push('itch-io');
    if (targetUrl.includes('gamejolt')) tags.push('game-jolt');
    if (html.toLowerCase().includes('webgl')) tags.push('webgl');
    if (html.toLowerCase().includes('canvas')) tags.push('html5');

    return {
      title: title.trim(),
      description: description.trim(),
      thumbnail_url,
      display_mode,
      tags: Array.from(new Set(tags)),
      original_url: targetUrl,
    };
  } catch (err) {
    return {
      title: 'Submitted Web Game',
      description: 'Play this web game live inside our platform container.',
      thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      display_mode: 'EMBEDDED' as DisplayMode,
      tags: ['arcade', 'webgl'],
      original_url: targetUrl,
    };
  }
}
