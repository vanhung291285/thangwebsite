
import { supabase, isSupabaseReady } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video, VisitorStats } from '../types';

const isUuid = (id?: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const safeQuery = async <T>(query: any, fallback: T): Promise<T> => {
    if (!isSupabaseReady || !supabase) return fallback;
    try {
        const { data, error } = await query;
        if (error) {
            console.warn("Supabase Query Warning:", error.message);
            return fallback;
        }
        return (data as T) || fallback;
    } catch (err) {
        console.error("Database Connection Error:", err);
        return fallback;
    }
};

export const DatabaseService = {
  // 1. Cấu hình
  getConfig: async (): Promise<SchoolConfig> => {
    const data = await safeQuery(supabase.from('school_config').select('*').limit(1).maybeSingle(), null);
    if (!data) return {} as SchoolConfig;
    return {
      name: data.name, slogan: data.slogan, logoUrl: data.logo_url, banner_url: data.banner_url,
      favicon_url: data.favicon_url, principal_name: data.principal_name, address: data.address,
      phone: data.phone, email: data.email, hotline: data.hotline, map_url: data.map_url,
      facebook: data.facebook, youtube: data.youtube, website: data.website,
      showWelcomeBanner: data.show_welcome_banner, home_news_count: data.home_news_count || 6,
      homeShowProgram: data.home_show_program, primaryColor: data.primary_color || '#1e3a8a',
      metaTitle: data.meta_title, metaDescription: data.meta_description
    };
  },

  saveConfig: async (config: SchoolConfig): Promise<void> => {
    if (!supabase) return;
    const c = {
      name: config.name, slogan: config.slogan, logo_url: config.logoUrl, banner_url: config.bannerUrl,
      favicon_url: config.faviconUrl, principal_name: config.principalName, address: config.address,
      phone: config.phone, email: config.email, hotline: config.hotline, map_url: config.mapUrl,
      facebook: config.facebook, youtube: config.youtube, website: config.website,
      show_welcome_banner: config.showWelcomeBanner, home_news_count: config.homeNewsCount,
      home_show_program: config.homeShowProgram, primary_color: config.primaryColor,
      meta_title: config.metaTitle, meta_description: config.metaDescription
    };
    const { data } = await supabase.from('school_config').select('id').limit(1).maybeSingle();
    if (data) await supabase.from('school_config').update(c).eq('id', data.id);
    else await supabase.from('school_config').insert([c]);
  },

  // 2. Bài viết
  getPosts: async (limit: number = 30): Promise<Post[]> => {
    const data = await safeQuery(
      supabase.from('posts').select('*').eq('status', 'published').order('date', { ascending: false }).limit(limit),
      []
    );
    return data.map((p: any) => ({
      id: p.id, title: p.title, slug: p.slug, summary: p.summary, content: p.content,
      thumbnail: p.thumbnail, author: p.author, date: p.date, category: p.category,
      views: p.views || 0, status: p.status, isFeatured: p.is_featured, showOnHome: p.show_on_home,
      attachments: p.attachments || [], tags: p.tags || [], blockIds: []
    }));
  },

  getPostById: async (id: string): Promise<Post | null> => {
    if (!isUuid(id)) return null;
    const { data } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    return {
      id: data.id, title: data.title, slug: data.slug, summary: data.summary, content: data.content,
      thumbnail: data.thumbnail, author: data.author, date: data.date, category: data.category,
      views: data.views || 0, status: data.status, isFeatured: data.is_featured, showOnHome: data.show_on_home,
      attachments: data.attachments || [], tags: data.tags || [], blockIds: []
    };
  },

  savePost: async (post: Post): Promise<void> => {
    if (!supabase) return;
    const p = {
      title: post.title, slug: post.slug, summary: post.summary, content: post.content,
      thumbnail: post.thumbnail, author: post.author, date: post.date, category: post.category,
      status: post.status, is_featured: post.isFeatured, show_on_home: post.showOnHome,
      attachments: post.attachments, tags: post.tags
    };
    if (isUuid(post.id)) await supabase.from('posts').update(p).eq('id', post.id);
    else await supabase.from('posts').insert([p]);
  },

  deletePost: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('posts').delete().eq('id', id);
  },

  // 3. Chuyên mục
  getPostCategories: async (): Promise<PostCategory[]> => {
    const data = await safeQuery(supabase.from('post_categories').select('*').order('order_index', { ascending: true }), []);
    return data.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, color: c.color, order: c.order_index }));
  },

  // Fix: Added savePostCategory
  savePostCategory: async (cat: PostCategory): Promise<void> => {
    if (!supabase) return;
    const c = { name: cat.name, slug: cat.slug, color: cat.color, order_index: cat.order };
    if (isUuid(cat.id)) await supabase.from('post_categories').update(c).eq('id', cat.id);
    else await supabase.from('post_categories').insert([c]);
  },

  // Fix: Added deletePostCategory
  deletePostCategory: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('post_categories').delete().eq('id', id);
  },

  // 4. Giới thiệu
  getIntroductions: async (): Promise<IntroductionArticle[]> => {
    const data = await safeQuery(supabase.from('school_introductions').select('*').order('order_index', { ascending: true }), []);
    return data.map((i: any) => ({
      id: i.id, title: i.title, slug: i.slug, content: i.content, imageUrl: i.image_url, order: i.order_index, isVisible: i.is_visible
    }));
  },

  saveIntroduction: async (intro: IntroductionArticle): Promise<void> => {
    if (!supabase) return;
    const i = { title: intro.title, slug: intro.slug, content: intro.content, image_url: intro.imageUrl, order_index: intro.order, is_visible: intro.isVisible };
    if (isUuid(intro.id)) await supabase.from('school_introductions').update(i).eq('id', intro.id);
    else await supabase.from('school_introductions').insert([i]);
  },

  // Fix: Added deleteIntroduction
  deleteIntroduction: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('school_introductions').delete().eq('id', id);
  },

  // 5. Cán bộ & Nhân sự
  getStaff: async (): Promise<StaffMember[]> => {
    const data = await safeQuery(supabase.from('staff_members').select('*').order('order_index', { ascending: true }), []);
    return data.map((s: any) => ({
      id: s.id, fullName: s.full_name, position: s.position, partyDate: s.party_date,
      email: s.email, avatarUrl: s.avatar_url, order: s.order_index
    }));
  },

  saveStaff: async (staff: StaffMember): Promise<void> => {
    if (!supabase) return;
    const s = { full_name: staff.fullName, position: staff.position, party_date: staff.partyDate, email: staff.email, avatar_url: staff.avatarUrl, order_index: staff.order };
    if (isUuid(staff.id)) await supabase.from('staff_members').update(s).eq('id', staff.id);
    else await supabase.from('staff_members').insert([s]);
  },

  // Fix: Added deleteStaff
  deleteStaff: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('staff_members').delete().eq('id', id);
  },

  // 6. Văn bản
  getDocCategories: async (): Promise<DocumentCategory[]> => {
    const data = await safeQuery(supabase.from('document_categories').select('*').order('order_index', { ascending: true }), []);
    return data.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, order: c.order_index }));
  },

  getDocuments: async (categoryId?: string): Promise<SchoolDocument[]> => {
    let query = supabase.from('documents').select('*').order('date', { ascending: false });
    if (categoryId && isUuid(categoryId)) query = query.eq('category_id', categoryId);
    const data = await safeQuery(query, []);
    return data.map((d: any) => ({ id: d.id, number: d.number, title: d.title, date: d.date, categoryId: d.category_id, downloadUrl: d.download_url }));
  },

  saveDocument: async (doc: SchoolDocument): Promise<void> => {
    if (!supabase) return;
    const d = { number: doc.number, title: doc.title, date: doc.date, category_id: isUuid(doc.categoryId) ? doc.categoryId : null, download_url: doc.downloadUrl };
    if (isUuid(doc.id)) await supabase.from('documents').update(d).eq('id', doc.id);
    else await supabase.from('documents').insert([d]);
  },

  // Fix: Added deleteDocument
  deleteDocument: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('documents').delete().eq('id', id);
  },

  // 7. Thư viện
  getAlbums: async (): Promise<GalleryAlbum[]> => {
    const data = await safeQuery(supabase.from('gallery_albums').select('*').order('created_date', { ascending: false }), []);
    return data.map((a: any) => ({ id: a.id, title: a.title, description: a.description, thumbnail: a.thumbnail, createdDate: a.created_date }));
  },

  // Fix: Added saveAlbum
  saveAlbum: async (album: GalleryAlbum): Promise<void> => {
    if (!supabase) return;
    const a = { title: album.title, description: album.description, thumbnail: album.thumbnail, created_date: album.createdDate };
    if (isUuid(album.id)) await supabase.from('gallery_albums').update(a).eq('id', album.id);
    else await supabase.from('gallery_albums').insert([a]);
  },

  // Fix: Added deleteAlbum
  deleteAlbum: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('gallery_albums').delete().eq('id', id);
  },

  getGallery: async (albumId?: string): Promise<GalleryImage[]> => {
    let query = supabase.from('gallery_images').select('*');
    if (albumId && isUuid(albumId)) query = query.eq('album_id', albumId);
    const data = await safeQuery(query, []);
    return data.map((i: any) => ({ id: i.id, url: i.url, caption: i.caption, albumId: i.album_id }));
  },

  // Fix: Added saveImage
  saveImage: async (image: GalleryImage): Promise<void> => {
    if (!supabase) return;
    const i = { url: image.url, caption: image.caption, album_id: isUuid(image.albumId) ? image.albumId : null };
    if (isUuid(image.id)) await supabase.from('gallery_images').update(i).eq('id', image.id);
    else await supabase.from('gallery_images').insert([i]);
  },

  // Fix: Added deleteImage
  deleteImage: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('gallery_images').delete().eq('id', id);
  },

  // 8. Videos
  getVideos: async (): Promise<Video[]> => {
    const data = await safeQuery(supabase.from('videos').select('*').order('order_index', { ascending: true }), []);
    return data.map((v: any) => ({ id: v.id, title: v.title, youtubeUrl: v.youtube_url, youtubeId: v.youtube_id, thumbnail: v.thumbnail, isVisible: v.is_visible, order: v.order_index }));
  },

  saveVideo: async (video: Video): Promise<void> => {
    if (!supabase) return;
    const v = { title: video.title, youtube_url: video.youtubeUrl, youtube_id: video.youtubeId, thumbnail: video.thumbnail, is_visible: video.isVisible, order_index: video.order };
    if (isUuid(video.id)) await supabase.from('videos').update(v).eq('id', video.id);
    else await supabase.from('videos').insert([v]);
  },

  // Fix: Added deleteVideo
  deleteVideo: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('videos').delete().eq('id', id);
  },

  // 9. Menu & Giao diện
  getMenu: async (): Promise<MenuItem[]> => {
    const data = await safeQuery(supabase.from('menu_items').select('*').order('order_index', { ascending: true }), []);
    return data.map((m: any) => ({ id: m.id, label: m.label, path: m.path, order: m.order_index }));
  },

  // Fix: Added saveMenu
  saveMenu: async (items: MenuItem[]): Promise<void> => {
    if (!supabase) return;
    const payload = items.map(item => ({
      id: isUuid(item.id) ? item.id : undefined,
      label: item.label,
      path: item.path,
      order_index: item.order
    }));
    await supabase.from('menu_items').upsert(payload);
  },

  // Fix: Added deleteMenu
  deleteMenu: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('menu_items').delete().eq('id', id);
  },

  getBlocks: async (): Promise<DisplayBlock[]> => {
    const data = await safeQuery(supabase.from('display_blocks').select('*').order('order_index', { ascending: true }), []);
    return data.map((b: any) => ({ id: b.id, name: b.name, position: b.position as any, type: b.type as any, order: b.order_index, itemCount: b.item_count, isVisible: b.is_visible, htmlContent: b.html_content, targetPage: b.target_page as any }));
  },

  // Fix: Added saveBlock
  saveBlock: async (block: DisplayBlock): Promise<void> => {
    if (!supabase) return;
    const b = {
      name: block.name,
      position: block.position,
      type: block.type,
      order_index: block.order,
      item_count: block.itemCount,
      is_visible: block.isVisible,
      html_content: block.htmlContent,
      target_page: block.targetPage
    };
    if (isUuid(block.id)) await supabase.from('display_blocks').update(b).eq('id', block.id);
    else await supabase.from('display_blocks').insert([b]);
  },

  // Fix: Added deleteBlock
  deleteBlock: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('display_blocks').delete().eq('id', id);
  },

  // Fix: Added saveBlocksOrder
  saveBlocksOrder: async (blocks: DisplayBlock[]): Promise<void> => {
    if (!supabase) return;
    const payload = blocks.map(b => ({
      id: b.id,
      order_index: b.order
    })).filter(b => isUuid(b.id));
    if (payload.length > 0) await supabase.from('display_blocks').upsert(payload);
  },

  // 10. Thống kê & Người dùng
  incrementPageView: async (): Promise<void> => {
    if (!supabase) return;
    try { await supabase.rpc('increment_page_view'); } catch (e) { console.warn("RPC increment_page_view not found"); }
  },

  getVisitorStats: async (): Promise<VisitorStats> => {
    const data = await safeQuery(supabase.from('daily_stats').select('visit_count').order('date', { ascending: false }), []);
    const total = data.reduce((acc: number, curr: any) => acc + (curr.visit_count || 0), 0);
    const today = data[0]?.visit_count || 0;
    return { online: 1, today, month: total, total }; // Map tạm thời vì Schema chỉ có visit_count theo ngày
  },

  // Fix: Added getUsers
  getUsers: async (): Promise<User[]> => {
    const data = await safeQuery(supabase.from('user_profiles').select('*'), []);
    return data.map((u: any) => ({ id: u.id, username: u.username, fullName: u.full_name, role: u.role as UserRole, email: '' }));
  },

  // Fix: Added saveUser
  saveUser: async (user: User): Promise<void> => {
    if (!supabase) return;
    const u = { username: user.username, full_name: user.fullName, role: user.role };
    if (isUuid(user.id)) await supabase.from('user_profiles').update(u).eq('id', user.id);
    else await supabase.from('user_profiles').insert([u]);
  },

  // Fix: Added deleteUser
  deleteUser: async (id: string): Promise<void> => {
    if (isUuid(id)) await supabase.from('user_profiles').delete().eq('id', id);
  },

  getUserProfile: async (id: string): Promise<User | null> => {
    if (!isUuid(id)) return null;
    const { data } = await supabase.from('user_profiles').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    return { id: data.id, username: data.username, fullName: data.full_name, role: data.role as UserRole, email: '' };
  }
};
