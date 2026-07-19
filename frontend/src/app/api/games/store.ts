import { GameDocument, DisplayMode } from '@/types/game';

let gamesStore: GameDocument[] = [
  {
    id: 'seed-2048',
    title: '2048 Web Edition',
    description: 'เกมพัซเซิลคณิตศาสตร์ผสมตัวเลขเพื่อพิชิตไทล์ 2048 ผลงานเกมเว็บแนวคลาสสิกสำหรับชาว CS 67',
    original_url: 'https://play2048.co/',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    creator_id: 'นิสิต CS67 Team',
    display_mode: 'EMBEDDED',
    metrics: { views: 45, likes: 18, rating: 4.9 },
    tags: ['cs67', 'puzzle', 'math', 'casual', 'html5'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-hextris',
    title: 'Hextris HTML5',
    description: 'เกมพัซเซิลหมุนตารางหกเหลี่ยมความเร็วสูง ได้รับแรงบันดาลใจจาก Tetris สำหรับทดสอบ WebGL & Canvas',
    original_url: 'https://hextris.io/',
    thumbnail_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    creator_id: 'ทีมพัฒนา CS67',
    display_mode: 'EMBEDDED',
    metrics: { views: 82, likes: 34, rating: 4.8 },
    tags: ['cs67', 'arcade', 'action', 'webgl', 'puzzle'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-itch-demo',
    title: 'Cyber Samurai Arcade',
    description: 'เกมวิ่งแอ็กชันสไตล์นีออนไซเบอร์พังก์ ตัวอย่างผลงานเกมภายนอกที่ทดสอบระบบกรอบ iframe ป้องกันการฝัง',
    original_url: 'https://itch.io/',
    thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    creator_id: 'นิสิต CS67 Dev',
    display_mode: 'POPUP',
    metrics: { views: 29, likes: 12, rating: 4.7 },
    tags: ['cs67', 'cyberpunk', 'itch-io', 'action'],
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
    const title = ogTitleMatch?.[1] || titleTagMatch?.[1] || 'ผลงานเกม CS67';

    // og:description or meta description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = ogDescMatch?.[1] || metaDescMatch?.[1] || 'เล่นผลงานเว็บเกมนี้บนแพลตฟอร์ม More Then 66 (CS67)';

    // og:image
    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    let thumbnail_url = ogImgMatch?.[1] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

    if (thumbnail_url.startsWith('/')) {
      const u = new URL(targetUrl);
      thumbnail_url = `${u.origin}${thumbnail_url}`;
    }

    const tags: string[] = ['cs67', 'arcade'];
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
      title: 'ผลงานเว็บเกม CS 67',
      description: 'เล่นผลงานเว็บเกมสดผ่านระบบ Sandboxed Player 16:9',
      thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      display_mode: 'EMBEDDED' as DisplayMode,
      tags: ['cs67', 'arcade', 'webgl'],
      original_url: targetUrl,
    };
  }
}
