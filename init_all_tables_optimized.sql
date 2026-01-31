
-- ==============================================================================
-- HỆ THỐNG QUẢN TRỊ TRƯỜNG HỌC TỐI ƯU (websuoilu)
-- Chạy script này để khởi tạo hoặc sửa lỗi toàn bộ Database
-- ==============================================================================

-- 0. Tiện ích mở rộng
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CẤU HÌNH TRƯỜNG HỌC (SCHOOL_CONFIG)
CREATE TABLE IF NOT EXISTS public.school_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT DEFAULT 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
    slogan TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    banner_url TEXT,
    principal_name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    hotline TEXT,
    map_url TEXT,
    facebook TEXT,
    youtube TEXT,
    website TEXT,
    show_welcome_banner BOOLEAN DEFAULT true,
    home_news_count INTEGER DEFAULT 6,
    home_show_program BOOLEAN DEFAULT true,
    primary_color TEXT DEFAULT '#1e3a8a',
    meta_title TEXT,
    meta_description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CHUYÊN MỤC BÀI VIẾT (POST_CATEGORIES)
CREATE TABLE IF NOT EXISTS public.post_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT 'blue',
    order_index INTEGER DEFAULT 0
);

-- 3. BÀI VIẾT (POSTS)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    thumbnail TEXT,
    image_caption TEXT,
    author TEXT,
    date DATE DEFAULT CURRENT_DATE,
    category TEXT, -- Slug của category
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    is_featured BOOLEAN DEFAULT false,
    show_on_home BOOLEAN DEFAULT true,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. VĂN BẢN (DOCUMENTS & CATEGORIES)
CREATE TABLE IF NOT EXISTS public.document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number TEXT,
    title TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES public.document_categories(id) ON DELETE SET NULL,
    download_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. THƯ VIỆN (ALBUMS & IMAGES)
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    caption TEXT,
    album_id UUID REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. VIDEO & CÁN BỘ & MENU & BLOCKS & INTRO
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    youtube_url TEXT,
    youtube_id TEXT NOT NULL,
    thumbnail TEXT,
    is_visible BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    position TEXT,
    party_date DATE,
    email TEXT,
    avatar_url TEXT,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    path TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.display_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position TEXT,
    type TEXT,
    order_index INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 4,
    is_visible BOOLEAN DEFAULT true,
    html_content TEXT,
    target_page TEXT DEFAULT 'all'
);

CREATE TABLE IF NOT EXISTS public.school_introductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

-- 7. THỐNG KÊ (DAILY_STATS)
CREATE TABLE IF NOT EXISTS public.daily_stats (
    date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    visit_count INTEGER DEFAULT 1
);

-- 8. QUẢN LÝ NGƯỜI DÙNG (USER_PROFILES)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'GUEST',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- PHÂN QUYỀN (RLS) - CỰC KỲ QUAN TRỌNG
-- ==============================================================================

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Select" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin All" ON public.%I', t);
        
        -- Mọi người được xem
        EXECUTE format('CREATE POLICY "Public Select" ON public.%I FOR SELECT USING (true)', t);
        -- Người đăng nhập được sửa (Cần kiểm tra role Admin trong app hoặc dùng auth.role())
        EXECUTE format('CREATE POLICY "Admin All" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', t);
    END LOOP;
END $$;

-- ==============================================================================
-- HÀM XỬ LÝ (RPC)
-- ==============================================================================

-- Tăng view website
CREATE OR REPLACE FUNCTION increment_page_view() RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_stats (date, visit_count) VALUES (CURRENT_DATE, 1)
    ON CONFLICT (date) DO UPDATE SET visit_count = daily_stats.visit_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tăng view bài viết
CREATE OR REPLACE FUNCTION increment_post_view(post_id UUID) RETURNS void AS $$
BEGIN
    UPDATE public.posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tự động tạo Profile khi User đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, username, role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username', 'GUEST');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO (CHỈ CHẠY NẾU TRỐNG)
-- ==============================================================================
INSERT INTO public.school_config (name) SELECT 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ' WHERE NOT EXISTS (SELECT 1 FROM public.school_config);
