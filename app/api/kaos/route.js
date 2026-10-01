import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'chaos_posts.json');

const INITIAL_POSTS = [];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(POSTS_FILE)) {
      fs.writeFileSync(POSTS_FILE, JSON.stringify(INITIAL_POSTS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Data file init error:', err);
  }
}

function readPosts() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Read chaos posts error:', err);
    return INITIAL_POSTS;
  }
}

function writePosts(posts) {
  ensureDataFile();
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Write chaos posts error:', err);
    return false;
  }
}

// GET /api/kaos?tab=hot|mythic|newest&category=all|meme|tier_list|sicak_teori|tartisma
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'hot';
    const category = searchParams.get('category') || 'all';

    let posts = readPosts();

    // Kategori Filtresi
    if (category && category !== 'all') {
      posts = posts.filter((p) => p.category === category);
    }

    // Sıralama & Sekme
    if (tab === 'mythic') {
      // Haftanın Mitik Deliliği: En çok upvote alanlar
      posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (tab === 'newest') {
      // En yeniler
      posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // 'hot' (Kaos Puanı = Net Oy + Yorum ağırlığı)
      posts.sort((a, b) => {
        const scoreA = (a.upvotes - a.downvotes) * 2 + (a.comments?.length || 0);
        const scoreB = (b.upvotes - b.downvotes) * 2 + (b.comments?.length || 0);
        return scoreB - scoreA;
      });
    }

    return NextResponse.json({
      success: true,
      posts,
      total: posts.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/kaos (Yeni Paylaşım, Oy Verme, Yorum Ekleme)
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('x-user-id');
    const body = await req.json();
    const { action } = body;
    const posts = readPosts();

    if (!authHeader && !body.userId && !body.user_id && !body.author) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Oturum gerekli.' }, { status: 401 });
    }

    // 1. EYLEM: OY VERME (UPVOTE / DOWNVOTE)
    if (action === 'vote') {
      const { postId, userId, type } = body; // type: 'up' | 'down'
      if (!postId || !userId || !type) {
        return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
      }

      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) {
        return NextResponse.json({ error: 'Paylaşım bulunamadı' }, { status: 404 });
      }

      const p = posts[postIndex];
      p.upvoted_by = p.upvoted_by || [];
      p.downvoted_by = p.downvoted_by || [];

      const hasUpvoted = p.upvoted_by.includes(userId);
      const hasDownvoted = p.downvoted_by.includes(userId);

      if (type === 'up') {
        if (hasUpvoted) {
          // Geri al
          p.upvoted_by = p.upvoted_by.filter((u) => u !== userId);
          p.upvotes = Math.max(0, p.upvotes - 1);
        } else {
          p.upvoted_by.push(userId);
          p.upvotes += 1;
          if (hasDownvoted) {
            p.downvoted_by = p.downvoted_by.filter((u) => u !== userId);
            p.downvotes = Math.max(0, p.downvotes - 1);
          }
        }
      } else if (type === 'down') {
        if (hasDownvoted) {
          // Geri al
          p.downvoted_by = p.downvoted_by.filter((u) => u !== userId);
          p.downvotes = Math.max(0, p.downvotes - 1);
        } else {
          p.downvoted_by.push(userId);
          p.downvotes += 1;
          if (hasUpvoted) {
            p.upvoted_by = p.upvoted_by.filter((u) => u !== userId);
            p.upvotes = Math.max(0, p.upvotes - 1);
          }
        }
      }

      writePosts(posts);
      return NextResponse.json({ success: true, post: p });
    }

    // 2. EYLEM: YORUM EKLEME
    if (action === 'comment') {
      const { postId, user_id, username, text, avatar_url } = body;
      if (!postId || !user_id || !text?.trim()) {
        return NextResponse.json({ error: 'Yorum metni zorunludur' }, { status: 400 });
      }

      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) {
        return NextResponse.json({ error: 'Paylaşım bulunamadı' }, { status: 404 });
      }

      const newComment = {
        id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        user_id,
        username: username || 'Anonim',
        avatar_url: avatar_url || null,
        text: text.trim().slice(0, 500),
        created_at: new Date().toISOString(),
      };

      posts[postIndex].comments = posts[postIndex].comments || [];
      posts[postIndex].comments.push(newComment);

      writePosts(posts);
      return NextResponse.json({ success: true, comment: newComment });
    }

    // 3. EYLEM: YENİ KAOS PAYLAŞIMI OLUŞTURMA
    const { title, content, category, image_url, author } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json({ error: 'Başlık ve içerik zorunludur.' }, { status: 400 });
    }

    if (!author || !author.id) {
      return NextResponse.json({ error: 'Paylaşım yapmak için giriş yapmalısınız.' }, { status: 401 });
    }

    const newPost = {
      id: 'chaos-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title.trim().slice(0, 150),
      category: ['meme', 'tier_list', 'sicak_teori', 'tartisma'].includes(category) ? category : 'tartisma',
      content: content.trim().slice(0, 3000),
      image_url: image_url ? image_url.trim() : '',
      author: {
        id: author.id,
        username: author.username || 'Kaos Sever',
        role: author.role || 'user',
        equipped_frame: author.equipped_frame || null,
        equipped_name_color: author.equipped_name_color || null,
        badges: author.badges || [],
      },
      upvotes: 1,
      downvotes: 0,
      upvoted_by: [author.id],
      downvoted_by: [],
      comments: [],
      created_at: new Date().toISOString(),
    };

    posts.unshift(newPost);
    writePosts(posts);

    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
